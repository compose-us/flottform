import {
	DEFAULT_WEBRTC_CONFIG,
	POLL_TIME_IN_MS,
	generateSecretKey,
	type ClientState,
	retrieveEndpointInfo,
	setIncludes,
	Logger
} from './internal';

export async function connectToFlottform({
	endpointId,
	fileInput,
	flottformApi,
	onError = () => {},
	onStateChange = () => {},
	rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
	pollTimeForIceInMs = POLL_TIME_IN_MS,
	logger = console
}: {
	endpointId: string;
	fileInput: HTMLInputElement;
	flottformApi: string;
	onError?: (error: Error) => void;
	onStateChange?: (state: ClientState) => void;
	rtcConfiguration?: RTCConfiguration;
	pollTimeForIceInMs?: number;
	logger?: Logger;
}): Promise<{
	createSendFileToPeer: (options: {
		onProgress?: (percentage: number) => void;
	}) => () => Promise<void>;
}> {
	logger.log('connecting to flottform', endpointId);
	let currentState: ClientState = 'init';
	const changeState = (state: ClientState) => {
		currentState = state;
		onStateChange(currentState);
	};
	const getEndpointInfoUrl = `${flottformApi}/${endpointId}`;
	const putClientInfoUrl = `${flottformApi}/${endpointId}/client`;

	let channel: RTCDataChannel | null = null;
	let pollForIceTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

	const clientKey = generateSecretKey();
	const clientIceCandidates = new Set<RTCIceCandidateInit>();

	const connection = new RTCPeerConnection(rtcConfiguration);

	connection.onconnectionstatechange = () => {
		logger.info(`onconnectionstatechange - ${connection.connectionState}`);
		if (connection.connectionState === 'connected') {
			stopPollingForIceCandidates();
			if (currentState === 'connecting-to-host') {
				changeState('connected');
			}
		}
		if (connection.connectionState === 'disconnected') {
			startPollingForIceCandidates();
		}
		if (connection.connectionState === 'failed') {
			stopPollingForIceCandidates();
			if (currentState !== 'done') {
				changeState('disconnected');
			}
		}
	};

	connection.onicecandidate = async (e) => {
		logger.info(`onicecandidate - ${connection.connectionState} - ${e.candidate}`);
		if (e.candidate) {
			if (!setIncludes(clientIceCandidates, e.candidate)) {
				logger.log('client found new ice candidate! Adding it to our list');
				clientIceCandidates.add(e.candidate);
				await putClientInfo();
			}
		}
	};
	connection.onicecandidateerror = (e) => {
		logger.error(`onicecandidateerror - ${connection.connectionState}`, e);
	};
	connection.onicegatheringstatechange = async (e) => {
		logger.info(`onicegatheringstatechange - ${connection.iceGatheringState}`);
	};
	connection.oniceconnectionstatechange = (e) => {
		logger.info(`oniceconnectionstatechange - ${connection.iceConnectionState}`);
		if (connection.iceConnectionState === 'failed') {
			logger.log('Failed to find a possible connection path');
			changeState('connection-impossible');
		}
	};

	connection.ondatachannel = (e) => {
		logger.info(`ondatachannel: ${e.channel}`);
		changeState('connected');
		channel = e.channel;
		channel.onopen = (e) => {
			logger.info(`ondatachannel - onopen: ${e.type}`);
		};
	};

	changeState('retrieving-info-from-endpoint');
	const { hostInfo } = await retrieveEndpointInfo(getEndpointInfoUrl);
	await connection.setRemoteDescription(hostInfo.session);
	const session = await connection.createAnswer();
	await connection.setLocalDescription(session);

	changeState('sending-client-info');
	await putClientInfo();

	changeState('connecting-to-host');
	startPollingForIceCandidates();

	const createSendFileToPeer =
		({ onProgress }: { onProgress?: (percentage: number) => void }) =>
		async () => {
			changeState('sending');
			const file = fileInput.files?.item(0);
			if (!file) {
				logger.log('no file?!?!');
				return;
			}
			if (!channel) {
				logger.log('no channel?!?!');
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
				changeState('error');
				logger.log('channel.onerror', e);
			};
			const maxChunkSize = 16384;
			const ab = await file.arrayBuffer();
			if (!ab) {
				logger.log('no array buffer');
				return;
			}

			for (let i = 0; i * maxChunkSize <= ab.byteLength; i++) {
				(onProgress ?? logger.log)(i / (ab.byteLength / maxChunkSize));
				const end = (i + 1) * maxChunkSize;
				channel.send(ab.slice(i * maxChunkSize, end));
			}
			logger.log('sent file!', ab);
			changeState('done');
		};

	return { createSendFileToPeer };

	async function stopPollingForIceCandidates() {
		if (pollForIceTimer) {
			clearTimeout(pollForIceTimer);
		}
		pollForIceTimer = null;
	}
	async function startPollingForIceCandidates() {
		if (pollForIceTimer) {
			clearTimeout(pollForIceTimer);
		}

		await pollForConnection();

		pollForIceTimer = setTimeout(startPollingForIceCandidates, pollTimeForIceInMs);
	}

	async function pollForConnection() {
		logger.log('polling for host ice candidates', connection.iceGatheringState);
		const { hostInfo } = await retrieveEndpointInfo(getEndpointInfoUrl);
		for (const iceCandidate of hostInfo.iceCandidates) {
			await connection.addIceCandidate(iceCandidate);
		}
	}

	async function putClientInfo() {
		logger.log('Updating client info with new list of ice candidates');
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
}
