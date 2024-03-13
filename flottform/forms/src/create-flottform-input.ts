import { toDataURL } from 'qrcode';
import {
	DEFAULT_WEBRTC_CONFIG,
	FlottformState,
	Logger,
	POLL_TIME_IN_MS,
	retrieveEndpointInfo,
	setIncludes
} from './internal';

let channelNumber = 0;

export function createFlottformInput({
	flottformApi,
	createClientUrl,
	rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
	pollTimeForIceInMs = POLL_TIME_IN_MS,
	inputField,
	onError = () => {},
	onProgress = ({ currentSize, totalSize }) => {
		if (!inputField) {
			return;
		}
		const createChannelElement = inputField.nextElementSibling!;
		const createChannelButton =
			createChannelElement.querySelector<HTMLElement>('.flottform-button')!;
		createChannelButton.innerHTML = `Receiving file ${Math.round((currentSize / totalSize) * 100)}%`;
	},
	onResult = (files) => {
		if (inputField) {
			inputField.files = files;
		}
	},
	onStateChange = (state, details) => {
		if (!inputField) {
			return;
		}

		const getElements = () => {
			const createChannelElement = inputField.nextElementSibling!;
			const createChannelButton =
				createChannelElement.querySelector<HTMLElement>('.flottform-button')!;
			const createChannelLinkArea =
				createChannelElement.querySelector<HTMLElement>('.flottform-link-area')!;
			const createChannelQrCode =
				createChannelElement.querySelector<HTMLElement>('.flottform-qr-code')!;
			const createChannelLinkWithOffer =
				createChannelElement.querySelector<HTMLElement>('.flottform-link-offer')!;
			return {
				createChannelElement,
				createChannelButton,
				createChannelLinkArea,
				createChannelQrCode,
				createChannelLinkWithOffer
			};
		};

		const mapper: Record<FlottformState, (details?: any) => void> = {
			new: (details: ReturnType<typeof createFlottformInput>) => {
				const createChannelElement = document.createElement('div');
				const createChannelLinkArea = document.createElement('div');
				const createChannelQrCode = document.createElement('img');
				const createChannelLinkWithOffer = document.createElement('a');
				createChannelElement.setAttribute('class', 'flottform-parent');
				createChannelElement.style.position = 'absolute';
				createChannelElement.style.top = (inputField?.offsetTop ?? 0) + 'px';
				createChannelElement.style.left =
					(inputField?.offsetLeft ?? 0) + (inputField?.offsetWidth ?? 0) + 16 + 'px';
				createChannelElement.style.width = `calc(100vw - ${inputField?.offsetWidth ?? 0}px)`;
				createChannelQrCode.setAttribute('class', 'flottform-qr-code');
				createChannelLinkWithOffer.setAttribute('class', 'flottform-link-offer');
				createChannelLinkWithOffer.setAttribute('target', '_blank');
				createChannelLinkArea.setAttribute('class', 'flottform-link-area');
				createChannelLinkArea.style.display = 'none';
				createChannelLinkArea.appendChild(createChannelQrCode);
				createChannelLinkArea.appendChild(createChannelLinkWithOffer);
				createChannelElement.appendChild(createChannelLinkArea);
				createChannelLinkArea.classList.add('qrCodeWrapper');

				const createChannelButton = document.createElement('button');
				createChannelButton.setAttribute('type', 'button');
				createChannelButton.setAttribute('class', 'flottform-button');
				createChannelButton.innerHTML = 'Load file from other device';
				createChannelButton.classList.add('qrCodeButton');
				createChannelButton.addEventListener('click', details.createChannel);
				createChannelElement.appendChild(createChannelButton);
				inputField?.after(createChannelElement);
			},
			'waiting-for-client': (details: { qrCode: string; link: string }) => {
				const {
					createChannelQrCode,
					createChannelLinkWithOffer,
					createChannelLinkArea,
					createChannelButton
				} = getElements();
				createChannelQrCode.setAttribute('src', details.qrCode);
				createChannelLinkWithOffer.setAttribute('href', details.link);
				createChannelLinkWithOffer.innerHTML = details.link;
				createChannelLinkArea.style.display = 'block';
				createChannelButton.innerHTML = 'Waiting for client to connect';
			},
			'waiting-for-file': () => {
				const { createChannelLinkArea, createChannelButton } = getElements();
				createChannelLinkArea.style.display = 'none';
				createChannelButton.innerHTML = 'Waiting for file';
			},
			'waiting-for-ice': () => {
				const { createChannelButton } = getElements();
				createChannelButton.innerHTML = 'Waiting for data channel connection';
			},
			'receiving-data': () => {
				const { createChannelButton } = getElements();
				createChannelButton.innerHTML = 'Receiving data!';
			},
			done: () => {
				const { createChannelButton } = getElements();
				createChannelButton.innerHTML = `Open new connection`;
			},
			error: (details) => {
				logger.error(details);
				const { createChannelLinkArea, createChannelButton } = getElements();
				createChannelLinkArea.style.display = 'none';
				let errorMessage = 'Connection failed - please retry!';
				if (details.message === 'connection-failed') {
					errorMessage = 'Client connection failed!';
				} else if (details.message === 'connection-impossible') {
					errorMessage =
						'Connection to this client with the current network environment is impossible';
				} else if (details.message === 'file-transfer') {
					errorMessage = 'Error during file transfer';
				}
				createChannelButton.innerHTML = errorMessage;
			}
		};
		mapper[state](details);
	},
	logger = console
}: {
	flottformApi: string | URL;
	createClientUrl: (params: { endpointId: string }) => Promise<string>;
	rtcConfiguration?: RTCConfiguration;
	inputField?: HTMLInputElement;
	onError?: (e: Error) => void;
	onProgress?: (detail: { currentSize: number; totalSize: number }) => void;
	onResult?: (files: FileList) => void;
	onStateChange?: <T extends FlottformState>(state: T, details?: any) => void;
	pollTimeForIceInMs?: number;
	logger?: Logger;
}): { createChannel: () => void } {
	const baseApi = (flottformApi instanceof URL ? flottformApi : new URL(flottformApi))
		.toString()
		.replace(/\/$/, '');

	let state: FlottformState = 'new';
	const changeState: typeof onStateChange = (newState, details) => {
		state = newState;
		onStateChange(newState, details);
	};

	let openPeerConnection: RTCPeerConnection | null = null;
	let pollForIceTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

	const createChannel = async () => {
		if (openPeerConnection) {
			openPeerConnection.close();
		}
		const hostIceCandidates = new Set<RTCIceCandidateInit>();
		const connection = new RTCPeerConnection(rtcConfiguration);
		openPeerConnection = connection;
		channelNumber++;
		const channelName = `data-channel-${channelNumber}`;
		const dataChannel = connection.createDataChannel(channelName);

		const session = await connection.createOffer();

		const response = await fetch(`${baseApi}/create`, {
			method: 'POST',
			mode: 'cors',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ session })
		});

		const { endpointId, hostKey } = await response.json();
		logger.log('Created endpoint', { endpointId, hostKey });
		const getEndpointInfoUrl = `${baseApi}/${endpointId}`;
		const putHostInfoUrl = `${baseApi}/${endpointId}/host`;

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

		async function putHostInfo() {
			try {
				logger.log('Updating host info with new list of ice candidates');
				const response = await fetch(putHostInfoUrl, {
					method: 'PUT',
					mode: 'cors',
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

		connection.onconnectionstatechange = () => {
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
		connection.onicecandidateerror = async (e) => {
			logger.error('peerConnection.onicecandidateerror', e);
		};
		connection.onicegatheringstatechange = async (e) => {
			logger.info(`onicegatheringstatechange - ${connection.iceGatheringState} - ${e}`);
		};
		connection.oniceconnectionstatechange = async (e) => {
			logger.info(`oniceconnectionstatechange - ${connection.iceConnectionState} - ${e}`);
			if (connection.iceConnectionState === 'failed') {
				logger.log('Failed to find a possible connection path');
				changeState('error', { message: 'connection-impossible' });
			}
		};

		await connection.setLocalDescription(session);
		await putHostInfo();
		startPollingForConnection();
		const connectLink = await createClientUrl({ endpointId });
		changeState('waiting-for-client', { qrCode: await toDataURL(connectLink), link: connectLink });

		const arrayBuffers: ArrayBuffer[] = [];
		let didReceiveSomething = false;
		let hasMetaInformation = false;
		let fileName = 'no-name';
		let fileType = 'application/octet-stream';
		let size = 0;
		let currentSize = 0;

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

		dataChannel.onmessage = async (e) => {
			if (!didReceiveSomething) {
				changeState('receiving-data');
			}
			if (!hasMetaInformation) {
				const fileMeta = JSON.parse(e.data) as {
					lastModified?: number;
					name?: string;
					size: number;
					type?: string;
				};
				size = fileMeta.size;
				fileName = fileMeta.name ?? fileName;
				fileType = fileMeta.type ?? fileType;
				hasMetaInformation = true;
				return;
			}

			const data = e.data;
			const ab = data instanceof Blob ? await data.arrayBuffer() : (data as ArrayBuffer);
			arrayBuffers.push(ab);
			currentSize += ab.byteLength;
			onProgress({ currentSize, totalSize: size });

			if (currentSize === size) {
				const fileForForm = new File(arrayBuffers, fileName);
				const dt = new DataTransfer();
				dt.items.add(fileForForm);

				onResult(dt.files);
				changeState('done');
				dataChannel.close();
			}
		};
	};

	const returnValue = { createChannel };
	changeState('new', returnValue);
	return returnValue;
}
