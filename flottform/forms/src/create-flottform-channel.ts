import { toDataURL } from 'qrcode';
import {
	DEFAULT_WEBRTC_CONFIG,
	EventEmitter,
	FlottformEventMap,
	FlottformState,
	Logger,
	POLL_TIME_IN_MS,
	retrieveEndpointInfo,
	setIncludes
} from './internal';

let channelNumber = 0;

export function createFlottformChannel({
	mode,
	flottformApi,
	createClientUrl,
	rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
	pollTimeForIceInMs = POLL_TIME_IN_MS,
	logger = console
}: {
	mode: string;
	flottformApi: string | URL;
	createClientUrl: (params: { endpointId: string }) => Promise<string>;
	rtcConfiguration?: RTCConfiguration;
	pollTimeForIceInMs?: number;
	logger?: Logger;
}) {
	const eventEmitter = new EventEmitter<FlottformEventMap>();
	let state: FlottformState = 'new';
	const changeState = (newState: FlottformState, details?: any) => {
		state = newState;
		eventEmitter.emit(state, details);
		logger.info(`State changed to: ${newState}`, details);
	};

	const onResult = ({ fileMeta, arrayBuffers }) => {
		logger.info({ fileMeta, arrayBuffers });
	};
	const onProgress = ({ currentSize, totalSize }) => {
		logger.info({ currentSize, totalSize });
	};
	const onError = (e: Error) => {
		logger.error(e);
	};

	let openPeerConnection: RTCPeerConnection | null = null;
	let pollForIceTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

	const createChannel = async () => {
		if (openPeerConnection) {
			openPeerConnection.close();
		}

		const connection = new RTCPeerConnection(rtcConfiguration);
		openPeerConnection = connection;

		const dataChannel = createDataChannel();

		const session = await connection.createOffer();
		await connection.setLocalDescription(session);

		const baseApi = (flottformApi instanceof URL ? flottformApi : new URL(flottformApi))
			.toString()
			.replace(/\/$/, '');

		const { endpointId, hostKey } = await createEndpoint();
		logger.log('Created endpoint', { endpointId, hostKey });

		const getEndpointInfoUrl = `${baseApi}/${endpointId}`;
		const putHostInfoUrl = `${baseApi}/${endpointId}/host`;

		const hostIceCandidates = new Set<RTCIceCandidateInit>();
		await putHostInfo();

		setUpConnectionStateGathering();
		setupHostIceGathering();
		setupDataChannelForTransfer();

		const connectLink = await createClientUrl({ endpointId });
		changeState('waiting-for-client', {
			qrCode: await toDataURL(connectLink),
			link: connectLink,
			createChannel
		});

		function setupHostIceGathering() {
			connection.onicecandidate = async (e) => {
				logger.info(`onicecandidate - ${connection.connectionState} - ${e.candidate}`);
				if (e.candidate) {
					if (!setIncludes(hostIceCandidates, e.candidate)) {
						logger.log('host found new ice candidate! Adding it to our list');
						hostIceCandidates.add(e.candidate);
						await putHostInfo();
					}
				}
			};

			connection.onicegatheringstatechange = async (e) => {
				logger.info(`onicegatheringstatechange - ${connection.iceGatheringState} - ${e}`);
			};

			connection.onicecandidateerror = async (e) => {
				logger.error('peerConnection.onicecandidateerror', e);
			};
		}
		function setUpConnectionStateGathering() {
			startPollingForConnection();

			connection.onconnectionstatechange = () => {
				// Possible values for `connectionState`: "new", "connecting", "connected", "disconnected", "failed", "closed"
				logger.info(`onconnectionstatechange - ${connection.connectionState}`);
				if (connection.connectionState === 'connected') {
					stopPollingForConnection();
				}
				if (connection.connectionState === 'disconnected') {
					startPollingForConnection();
				}
				if (connection.connectionState === 'failed') {
					stopPollingForConnection();
					changeState('error', { message: 'connection-failed' });
				}
			};

			connection.oniceconnectionstatechange = async (e) => {
				logger.info(`oniceconnectionstatechange - ${connection.iceConnectionState} - ${e}`);
				if (connection.iceConnectionState === 'failed') {
					logger.log('Failed to find a possible connection path');
					changeState('error', { message: 'connection-impossible' });
				}
			};
		}
		function setupDataChannelForTransfer() {
			dataChannel.onopen = (e) => {
				logger.log('data channel opened');
				changeState('waiting-for-file');
			};

			dataChannel.onclose = (e) => {
				logger.log('data channel closed');
			};

			dataChannel.onerror = (e) => {
				logger.log('channel.onerror', e);
				changeState('error', { message: 'file-transfer' });
			};
		}

		async function stopPollingForConnection() {
			if (pollForIceTimer) {
				clearTimeout(pollForIceTimer);
			}
			pollForIceTimer = null;
		}
		async function startPollingForConnection() {
			if (pollForIceTimer) {
				clearTimeout(pollForIceTimer);
			}

			await pollForConnection();

			pollForIceTimer = setTimeout(startPollingForConnection, pollTimeForIceInMs);
		}
		async function pollForConnection() {
			logger.log('polling for client ice candidates', connection.iceGatheringState);
			const { clientInfo } = await retrieveEndpointInfo(getEndpointInfoUrl);

			if (clientInfo && state === 'waiting-for-client') {
				logger.log('Found a client that wants to connect!');
				changeState('waiting-for-ice');
				await connection.setRemoteDescription(clientInfo.session);
			}

			for (const iceCandidate of clientInfo?.iceCandidates ?? []) {
				await connection.addIceCandidate(iceCandidate);
			}
		}

		function createDataChannel() {
			channelNumber++;
			const channelName = `data-channel-${channelNumber}`;
			return connection.createDataChannel(channelName);
		}

		async function createEndpoint() {
			const response = await fetch(`${baseApi}/create`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ session })
			});

			return response.json();
		}
		async function putHostInfo() {
			try {
				logger.log('Updating host info with new list of ice candidates');
				const response = await fetch(putHostInfoUrl, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						hostKey,
						iceCandidates: [...hostIceCandidates],
						session
					})
				});
				if (!response.ok) {
					throw Error('Could not update host info');
				}
			} catch (err) {
				onError(err as Error);
			}
		}

		return {
			dataChannel,
			updateState: (newState: FlottformState, details?: any) => {
				changeState(newState, details);
			}
		};
	};

	const returnValue = { createChannel, eventEmitter };

	changeState('new', returnValue);
	return returnValue;
}
