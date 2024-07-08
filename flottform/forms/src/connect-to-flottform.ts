import {
	DEFAULT_WEBRTC_CONFIG,
	POLL_TIME_IN_MS,
	generateSecretKey,
	type ClientState,
	retrieveEndpointInfo,
	setIncludes,
	Logger
} from './internal';

export type FlottformInstance = {
	createSendFileToPeer: (options: {
		onProgress?: (percentage: number) => void;
	}) => () => Promise<void>;
	state: ClientState;
};

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
	fileInput: HTMLInputElement | HTMLCanvasElement;
	flottformApi: string;
	onError?: (error: Error) => void;
	onStateChange?: (state: ClientState) => void;
	rtcConfiguration?: RTCConfiguration;
	pollTimeForIceInMs?: number;
	logger?: Logger;
}): Promise<FlottformInstance> {
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

	//serialize data

	type FileMetaInfos = { size: number };
	const serializeData = async (
		fileInput: HTMLInputElement | HTMLCanvasElement
	): Promise<{
		fileMeta: FileMetaInfos;
		arrayBuffer: ArrayBuffer;
	}> => {
		if (fileInput instanceof HTMLInputElement) {
			logger.log(fileInput.value);
			const file = fileInput.files?.item(0);
			if (!file) {
				const arrayBuffer = new TextEncoder().encode(fileInput.value);
				const fileMeta = {
					data: 'input:text',
					size: arrayBuffer.byteLength
				};
				return { arrayBuffer, fileMeta };
			}
			const arrayBuffer = await file.arrayBuffer();
			if (!arrayBuffer) {
				logger.log('no array buffer');
				throw Error('no array buffer in file input element');
			}
			const fileMeta = {
				data: 'input:file',
				lastModified: file.lastModified,
				name: file.name,
				type: file.type,
				size: file.size
			};
			return { fileMeta, arrayBuffer };
		}
		const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
			fileInput.toBlob(async (blob) => {
				if (!blob) {
					reject(Error('no blob in canvas'));
					return;
				}
				const arrayBuffer = await blob?.arrayBuffer();
				if (!arrayBuffer) {
					reject(Error('no array buffer in blob'));
					return;
				}
				resolve(arrayBuffer);
			}, 'image/png');
		});

		const fileMeta = {
			data: 'canvas:png',
			lastModified: Date.now(),
			name: 'canvas.png',
			type: 'image/png',
			size: arrayBuffer.byteLength
		};

		return { fileMeta, arrayBuffer };
	};

	const createSendFileToPeer =
		({ onProgress }: { onProgress?: (percentage: number) => void }) =>
		async () => {
			const sendProgress = onProgress ?? logger.log;
			if (!channel) {
				logger.log('no channel?!?!');
				return;
			}
			const { fileMeta, arrayBuffer } = await serializeData(fileInput);
			const maxChunkSize = 16384;
			channel.send(JSON.stringify(fileMeta));
			channel.onerror = (e) => {
				changeState('error');
				logger.log('channel.onerror', e);
			};

			for (let i = 0; i * maxChunkSize <= arrayBuffer.byteLength; i++) {
				sendProgress(i / (arrayBuffer.byteLength / maxChunkSize));
				const end = (i + 1) * maxChunkSize;
				channel.send(arrayBuffer.slice(i * maxChunkSize, end));
			}
			logger.log('sent file!', arrayBuffer);
			changeState('done');
		};

	return {
		createSendFileToPeer,
		get state() {
			return currentState;
		}
	};

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
