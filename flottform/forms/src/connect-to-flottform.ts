import {
	DEFAULT_WEBRTC_CONFIG,
	POLL_TIME_IN_MS,
	generateSecretKey,
	type ClientState,
	type SafeEndpointInfo,
	addIceCandidatesToConnection,
	retrieveEndpointInfo,
	setIncludes
} from './internal';

export async function connectToFlottform({
	endpointId,
	fileInput,
	flottformApi,
	onError = () => {},
	onStateChange = () => {},
	configuration = DEFAULT_WEBRTC_CONFIG,
	pollTimeForIceInMs = POLL_TIME_IN_MS
}: {
	endpointId: string;
	fileInput: HTMLInputElement;
	flottformApi: string;
	onError?: (error: Error) => void;
	onStateChange?: (state: ClientState) => void;
	configuration?: RTCConfiguration;
	pollTimeForIceInMs?: number;
}): Promise<{
	createSendFileToPeer: (options: {
		onProgress?: (percentage: number) => void;
	}) => () => Promise<void>;
}> {
	console.log('connecting to flottform', endpointId);
	const getEndpointInfoUrl = `${flottformApi}/${endpointId}`;
	const putClientInfoUrl = `${flottformApi}/${endpointId}/client`;

	let channel: RTCDataChannel | null = null;

	const clientKey = generateSecretKey();
	const clientIceCandidates = new Set<RTCIceCandidateInit>();

	const connection = new RTCPeerConnection(configuration);

	const { hostInfo } = await retrieveEndpointInfo(getEndpointInfoUrl);

	await connection.setRemoteDescription(hostInfo.session);
	const session = await connection.createAnswer();
	await connection.setLocalDescription(session);

	await putClientInfo();

	let pollForIceTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
	startPollingForIceCandidates();
	async function startPollingForIceCandidates() {
		if (pollForIceTimer) {
			clearTimeout(pollForIceTimer);
		}

		await pollForIceCandidates();

		pollForIceTimer = setTimeout(startPollingForIceCandidates, pollTimeForIceInMs);
	}

	async function pollForIceCandidates() {
		console.log('polling for ice candidates');
		const { hostInfo } = await retrieveEndpointInfo(getEndpointInfoUrl);
		for (const iceCandidate of hostInfo.iceCandidates) {
			await connection.addIceCandidate(iceCandidate);
		}
	}

	function stopPollingForIce() {
		if (pollForIceTimer) {
			clearTimeout(pollForIceTimer);
		}
	}

	async function putClientInfo() {
		console.log('Updating client info with new list of ice candidates');
		const response = await fetch(putClientInfoUrl, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				clientKey,
				iceCandidates: [...clientIceCandidates],
				session
			})
		});
		if (!response.ok) {
			throw Error('Could not update client info. Did another peer already connect?');
		}
	}

	connection.onconnectionstatechange = (e) => {
		console.info(`onconnectionstatechange - ${connection.connectionState} - ${e}`);
	};
	connection.onicecandidate = async (e) => {
		console.info(`onicecandidate - ${connection.connectionState} - ${e}`);
		if (e.candidate) {
			if (!setIncludes(clientIceCandidates, e.candidate)) {
				console.log('client found new ice candidate! Adding it to our list');
				clientIceCandidates.add(e.candidate);
				try {
					await putClientInfo();
				} catch (err) {
					onError(err as Error);
				}
			}
		}
	};
	connection.onicecandidateerror = (e) => {
		console.info(`onicecandidateerror - ${connection.connectionState} - ${e}`);
	};
	connection.oniceconnectionstatechange = (e) => {
		console.info(`oniceconnectionstatechange - ${connection.iceConnectionState} - ${e}`);
	};
	connection.onicegatheringstatechange = async (e) => {
		console.info(`onicegatheringstatechange - ${connection.iceGatheringState} - ${e}`);
		if (connection.iceGatheringState === 'complete') {
			stopPollingForIce();
		} else {
			startPollingForIceCandidates();
		}
	};
	connection.onnegotiationneeded = (e) => {
		console.info(`onnegotiationneeded - ${connection.connectionState} - ${e}`);
	};
	connection.onsignalingstatechange = (e) => {
		console.info(`onsignalingstatechange - ${connection.signalingState} - ${e}`);
	};
	connection.ontrack = (e) => {
		console.info(`ontrack - ${connection.connectionState} - ${e}`);
	};
	connection.onconnectionstatechange = (e) => {
		console.info(`onconnectionstatechange: ${e}`);
	};
	connection.ondatachannel = (e) => {
		console.info(`ondatachannel: ${e.channel}`);
		channel = e.channel;
		channel.onopen = (e) => {
			console.info(`ondatachannel - onopen: ${e.type}`);
			onStateChange('waiting-for-file');
		};
	};

	await addIceCandidatesToConnection(connection, hostInfo.iceCandidates);

	const createSendFileToPeer =
		({ onProgress }: { onProgress?: (percentage: number) => void }) =>
		async () => {
			onStateChange('sending-file');
			const file = fileInput.files?.item(0);
			if (!file) {
				console.log('no file?!?!');
				return;
			}
			if (!channel) {
				console.log('no channel?!?!');
				return;
			}

			const fileMeta = {
				lastModified: file.lastModified,
				name: file.name,
				type: file.type,
				size: file.size
			};
			channel.send(JSON.stringify(fileMeta));
			channel.onerror = (e) => {
				onStateChange('error');
				console.log('channel.onerror', e);
			};
			const maxChunkSize = 16384;
			const ab = await file.arrayBuffer();
			if (!ab) {
				console.log('no array buffer');
				return;
			}

			for (let i = 0; i * maxChunkSize <= ab.byteLength; i++) {
				(onProgress ?? console.log)(i / (ab.byteLength / maxChunkSize));
				const end = (i + 1) * maxChunkSize;
				channel.send(ab.slice(i * maxChunkSize, end));
			}
			console.log('sent file!', ab);
			onStateChange('done');
		};

	return { createSendFileToPeer };
}
