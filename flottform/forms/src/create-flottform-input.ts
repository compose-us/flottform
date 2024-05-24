import { toDataURL } from 'qrcode';
import {
	DEFAULT_WEBRTC_CONFIG,
	FlottformState,
	Logger,
	FileMetaInfos,
	POLL_TIME_IN_MS,
	retrieveEndpointInfo,
	setIncludes
} from './internal';
import {
	Styles,
	changeBackgroundOnState,
	closeDialogButtonCss,
	closeSvg,
	createChannelButtonCss,
	createChannelElementCss,
	createChannelQrCodeCss,
	createChannelStatusWrapperCss,
	defaultStyles,
	dialogCss,
	flottformSvg,
	refreshConnectionButtonCss,
	simulateHoverEffect
} from './flottform-styles';

let channelNumber = 0;
const noop = () => {};

const createDefaultOnStateChange = (options: {
	inputField?: HTMLElement;
	logger: Logger;
	styles?: Styles;
}): (<T extends FlottformState>(state: T, details?: any) => void) => {
	const { inputField, logger, styles } = options;
	if (!inputField) {
		return noop;
	}
	return (state, details) => {
		const getElements = () => {
			const createChannelElement = inputField.nextElementSibling!;
			const createChannelButton =
				createChannelElement.querySelector<HTMLElement>('.flottform-button')!;
			const createChannelLinkDialog =
				document.querySelector<HTMLDialogElement>('.flottform-link-dialog')!;
			const createChannelStatusWrapper = createChannelLinkDialog.querySelector<HTMLElement>(
				'.flottform-status-wrapper'
			)!;
			const createChannelLinkArea =
				createChannelLinkDialog.querySelector<HTMLElement>('.flottform-link-area')!;
			const createChannelQrCode =
				createChannelLinkDialog.querySelector<HTMLElement>('.flottform-qr-code')!;
			const createChannelLinkWithOffer =
				createChannelLinkDialog.querySelector<HTMLElement>('.flottform-link-offer')!;
			const createDialogDescription = createChannelLinkDialog.querySelector<HTMLElement>(
				'.flottform-dialog-description'
			)!;
			return {
				createChannelElement,
				createChannelButton,
				createChannelLinkDialog,
				createChannelStatusWrapper,
				createChannelLinkArea,
				createChannelQrCode,
				createChannelLinkWithOffer,
				createDialogDescription
			};
		};

		const mapper: Record<FlottformState, (details?: any) => void> = {
			new: (details: ReturnType<typeof createFlottformInput>) => {
				const createChannelElement = document.createElement('div');
				const createChannelLinkDialog = document.createElement('dialog');
				const createChannelStatusWrapper = document.createElement('div');
				const createDialogDescription = document.createElement('p');
				const closeDialogButton = document.createElement('button');
				const refreshConnectionButton = document.createElement('button');
				const createChannelQrCode = document.createElement('img');
				const createChannelLinkWithOffer = document.createElement('a');
				createChannelElement.setAttribute('class', 'flottform-parent');
				createChannelElement.style.cssText = createChannelElementCss(inputField);
				createChannelQrCode.setAttribute('class', 'flottform-qr-code');
				createChannelLinkWithOffer.setAttribute('class', 'flottform-link-offer');
				createChannelLinkWithOffer.setAttribute('target', '_blank');
				createChannelLinkDialog.setAttribute('class', 'flottform-link-dialog');
				createChannelStatusWrapper.setAttribute('class', 'flottform-status-wrapper');
				createDialogDescription.setAttribute('class', 'flottform-dialog-description');
				closeDialogButton.innerHTML = closeSvg(styles);
				closeDialogButton.setAttribute('class', 'close-dialog-button');
				closeDialogButton.addEventListener('click', () => {
					createChannelLinkDialog.close();
					createChannelLinkDialog.style.display = 'none';
				});
				refreshConnectionButton.innerHTML = 'Refresh';
				refreshConnectionButton.setAttribute('class', 'refresh-connection-button');
				refreshConnectionButton.addEventListener('click', details.createChannel);
				createChannelLinkDialog.appendChild(createChannelStatusWrapper);
				createChannelLinkDialog.appendChild(createChannelQrCode);
				createChannelLinkDialog.appendChild(createChannelLinkWithOffer);
				createChannelLinkDialog.appendChild(createDialogDescription);
				createChannelLinkDialog.appendChild(closeDialogButton);
				createChannelLinkDialog.appendChild(refreshConnectionButton);
				document.body.appendChild(createChannelLinkDialog);
				const createChannelButton = document.createElement('button');
				createChannelButton.setAttribute('type', 'button');
				createChannelButton.setAttribute('class', 'flottform-button');
				createChannelButton.innerHTML = flottformSvg(styles);
				closeDialogButton.style.cssText = closeDialogButtonCss(styles);
				createChannelButton.style.cssText = createChannelButtonCss(styles);
				createChannelLinkDialog.style.cssText = dialogCss(styles);
				createChannelQrCode.style.cssText = createChannelQrCodeCss(styles);
				refreshConnectionButton.style.cssText = refreshConnectionButtonCss(styles);
				createChannelStatusWrapper.style.cssText = createChannelStatusWrapperCss(styles);
				createChannelButton.addEventListener('click', details.createChannel);
				createChannelButton.addEventListener('click', () => {
					createChannelLinkDialog.showModal();
					createChannelLinkDialog.style.display = 'flex';
				});
				simulateHoverEffect(createChannelButton, styles);
				simulateHoverEffect(refreshConnectionButton, styles);
				createChannelElement.appendChild(createChannelButton);
				inputField?.after(createChannelElement);
			},
			'waiting-for-client': (details: {
				qrCode: string;
				link: string;
				createChannel: ReturnType<typeof createFlottformInput>;
			}) => {
				const {
					createChannelQrCode,
					createChannelLinkWithOffer,
					createDialogDescription,
					createChannelButton,
					createChannelStatusWrapper
				} = getElements();
				createChannelButton.removeEventListener('click', details.createChannel);
				createChannelQrCode.style.display = 'block';
				createChannelLinkWithOffer.style.display = 'block';
				createChannelQrCode.setAttribute('src', details.qrCode);
				createChannelLinkWithOffer.setAttribute('href', details.link);
				createChannelLinkWithOffer.innerHTML = details.link;
				createChannelStatusWrapper.innerHTML = 'Upload a file';
				createDialogDescription.innerHTML = 'Use this QR-Code or Link on your other device.';
				createChannelButton.style.background = changeBackgroundOnState(state, styles);
			},
			'waiting-for-file': () => {
				const {
					createDialogDescription,
					createChannelStatusWrapper,
					createChannelButton,
					createChannelQrCode,
					createChannelLinkWithOffer
				} = getElements();
				createChannelQrCode.style.display = 'none';
				createChannelLinkWithOffer.style.display = 'none';
				createChannelStatusWrapper.innerHTML = 'Connected!';
				createDialogDescription.innerHTML =
					'Another device is connected. Start the data transfer from your other device';
				createChannelButton.style.background = changeBackgroundOnState(state, styles);
			},
			'waiting-for-ice': () => {
				const { createDialogDescription } = getElements();
				createDialogDescription.innerHTML = 'Waiting for data channel connection';
			},
			'receiving-data': () => {
				const { createChannelStatusWrapper, createDialogDescription, createChannelButton } =
					getElements();
				createChannelStatusWrapper.innerHTML = 'Receiving data';
				createDialogDescription.innerHTML =
					'Another device is sending data. Waiting for incoming data transfer to complete';
				createChannelButton.style.background = changeBackgroundOnState(state, styles);
			},
			done: () => {
				const { createChannelStatusWrapper, createDialogDescription, createChannelButton } =
					getElements();
				createChannelStatusWrapper.innerHTML = `Done!`;
				createDialogDescription.innerHTML = `You have received a file from another device. Please close this dialog to finish your form.`;
				createChannelButton.style.background = changeBackgroundOnState(state, styles);
			},
			error: (details) => {
				logger.error(details);
				const { createChannelStatusWrapper, createDialogDescription, createChannelButton } =
					getElements();
				let errorMessage = 'Connection failed - please retry!';
				if (details.message === 'connection-failed') {
					errorMessage = 'Client connection failed!';
				} else if (details.message === 'connection-impossible') {
					errorMessage =
						'Connection to this client with the current network environment is impossible';
				} else if (details.message === 'file-transfer') {
					errorMessage = 'Error during file transfer';
				}
				createChannelStatusWrapper.innerHTML = 'Oops! Something went wrong';
				createDialogDescription.innerHTML = errorMessage;
				createChannelButton.style.background = changeBackgroundOnState('error', styles);
			}
		};
		mapper[state](details);
	};
};

export function createFlottformInput<ResultType = string | FileList | unknown>({
	flottformApi,
	createClientUrl,
	rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
	pollTimeForIceInMs = POLL_TIME_IN_MS,
	inputField,
	onError = () => {},
	onProgress = (inputField, { currentSize, totalSize }) => {
		const createChannelElement = inputField!.nextElementSibling!;
		const createChannelLinkDialog =
			document.querySelector<HTMLDialogElement>('.flottform-link-dialog')!;
		const createChannelStatusWrapper = createChannelLinkDialog.querySelector<HTMLElement>(
			'.flottform-status-wrapper'
		)!;
		createChannelStatusWrapper.innerHTML = `Receiving ${Math.round((currentSize / totalSize) * 100)}%`;
		const createChannelButton =
			createChannelElement.querySelector<HTMLElement>('.flottform-button')!;
		createChannelButton.style.background = `conic-gradient(#7EA4FF ${Math.round((currentSize / totalSize) * 100)}%, #FFF ${Math.round((currentSize / totalSize) * 100)}%`;
	},
	onResult = async (
		inputField,
		incoming: { fileMeta: FileMetaInfos; arrayBuffers: Array<ArrayBuffer> }
	) => {
		if (!inputField) {
			logger.warn('no input field, no need to run onResult');
			return;
		}
		if (incoming.fileMeta.data === 'input:file' || incoming.fileMeta.data === 'canvas:png') {
			const fileName = incoming.fileMeta.name ?? 'no-name';
			const fileType = incoming.fileMeta.type ?? 'application/octet-stream';

			const fileForForm = new File(incoming.arrayBuffers, fileName, { type: fileType });
			const dt = new DataTransfer();
			dt.items.add(fileForForm);
			inputField.files = dt.files;
		}
		if (incoming.fileMeta.data === 'input:text') {
			const decoder = new TextDecoder();
			let result = '';
			for (const arrayBuffer of incoming.arrayBuffers) {
				// TODO Test whether umlaute work on fragmented text - seem to work well
				result += decoder.decode(arrayBuffer);
			}
			inputField.value = result;
		}
	},
	onStateChange = noop,
	logger = console,
	useDefaultUi = true,
	styles = defaultStyles
}: {
	flottformApi: string | URL;
	createClientUrl: (params: { endpointId: string }) => Promise<string>;
	rtcConfiguration?: RTCConfiguration;
	inputField?: HTMLInputElement | HTMLCanvasElement;
	onError?: (e: Error) => void;
	onProgress?: (
		inputField: HTMLInputElement | HTMLCanvasElement,
		detail: { currentSize: number; totalSize: number }
	) => void;
	onResult?: (
		inputField: HTMLInputElement | HTMLCanvasElement,
		incoming: {
			fileMeta: FileMetaInfos;
			arrayBuffers: Array<ArrayBuffer>;
		}
	) => Promise<void>;
	onStateChange?: <T extends FlottformState>(state: T, details?: any) => void;
	pollTimeForIceInMs?: number;
	logger?: Logger;
	useDefaultUi?: boolean;
	styles?: Styles;
}): { createChannel: () => void } {
	const baseApi = (flottformApi instanceof URL ? flottformApi : new URL(flottformApi))
		.toString()
		.replace(/\/$/, '');
	const internalOnStateChange = useDefaultUi
		? createDefaultOnStateChange({ inputField, logger, styles })
		: noop;

	let state: FlottformState = 'new';
	const changeState: typeof onStateChange = (newState, details) => {
		state = newState;
		internalOnStateChange(newState, details);
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
		changeState('waiting-for-client', {
			qrCode: await toDataURL(connectLink),
			link: connectLink,
			createChannel
		});

		const arrayBuffers: ArrayBuffer[] = [];
		let didReceiveSomething = false;
		let fileMeta: FileMetaInfos | undefined = undefined;
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

			if (!fileMeta) {
				fileMeta = JSON.parse(e.data) as FileMetaInfos;
				return;
			}
			const size = fileMeta.size;

			const data = e.data;
			const ab = data instanceof Blob ? await data.arrayBuffer() : (data as ArrayBuffer);
			arrayBuffers.push(ab);
			currentSize += ab.byteLength;
			onProgress(inputField, { currentSize, totalSize: size });

			if (currentSize === size) {
				try {
					await onResult(inputField, { fileMeta, arrayBuffers });
				} catch (e) {
					logger.error('Could not complete onResult', e);
					changeState('error', e);
					return;
				} finally {
					dataChannel.close();
				}
				changeState('done');
			}
		};
	};

	const returnValue = { createChannel };
	changeState('new', returnValue);
	return returnValue;
}
