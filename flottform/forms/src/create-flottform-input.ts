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
const noop = () => {};

const createDefaultOnStateChange = (options: {
	inputField?: HTMLElement;
	logger: Logger;
}): (<T extends FlottformState>(state: T, details?: any) => void) => {
	const { inputField, logger } = options;
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
			const createChannelStatusWrapper =
				createChannelLinkDialog.querySelector<HTMLElement>('.flottform-link-wrapper')!;
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
				createChannelElement.style.position = 'absolute';
				createChannelElement.style.top = (inputField?.offsetTop ?? 0) + 'px';
				createChannelElement.style.left =
					(inputField?.offsetLeft ?? 0) + (inputField?.offsetWidth ?? 0) + 16 + 'px';
				createChannelQrCode.setAttribute('class', 'flottform-qr-code');
				createChannelLinkWithOffer.setAttribute('class', 'flottform-link-offer');
				createChannelLinkWithOffer.setAttribute('target', '_blank');
				createChannelLinkDialog.setAttribute('class', 'flottform-link-dialog');
				createChannelStatusWrapper.setAttribute('class', 'flottform-link-wrapper');
				createDialogDescription.setAttribute('class', 'flottform-dialog-description');
				closeDialogButton.innerHTML = '✖️';
				closeDialogButton.setAttribute('class', 'close-dialog-button');
				closeDialogButton.addEventListener('click', () => createChannelLinkDialog.close());
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
				createChannelButton.innerHTML =
					'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="24" viewBox="0 0 32 74" fill="#1a3066"><path d="M29.2146 12.4C28.9001 12.2308 28.5069 12.1038 28.0351 12.0192C27.6027 11.8922 27.1505 11.8287 26.6788 11.8287C25.3027 11.8287 24.3395 12.2731 23.7891 13.1618C23.2387 14.0081 22.8455 15.1084 22.6096 16.4626L22.4917 17.2244H29.0377L30.1287 26.6192L21.0174 27.4444L17.1842 50.6139L13.3542 73.7835H0.200073L4.03326 50.6139L7.86648 27.4444H2.55894L4.21018 17.2244H9.3408L9.51772 16.2087C9.87155 14.1351 10.363 12.1673 10.992 10.3052C11.6604 8.44322 12.5843 6.81394 13.7637 5.41742C14.9825 3.97858 16.5355 2.85713 18.4226 2.05307C20.3097 1.2067 22.649 0.783508 25.4403 0.783508C26.3446 0.783508 27.3668 0.868146 28.5069 1.03742C29.6471 1.16438 30.5906 1.39713 31.3376 1.73568L29.2146 12.4Z" fill="#1a3066"/></svg>';
				closeDialogButton.style.cssText = `
			position: absolute;
			top: 1rem;
			right: 2rem;
			padding: 1rem;`;
				createChannelButton.style.cssText = `
			background: #fff;
			border: 1px solid #1a3066;
			padding: 0.75rem 1rem;
			color: #1a3066;
			font-weight: 700;
			border-radius: 5px;
			cursor: pointer;
			display: inline-block;`;
				createChannelButton.addEventListener('click', details.createChannel);
				createChannelButton.addEventListener('click', () => createChannelLinkDialog.showModal());
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
				createChannelButton.style.background = '#F9F871';
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
				createChannelButton.style.background = '#D4F1EF';
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
				createChannelButton.style.background = '#7EA4FF';
			},
			done: () => {
				const { createChannelStatusWrapper, createDialogDescription, createChannelButton } =
					getElements();
				createChannelStatusWrapper.innerHTML = `Done!`;
				createDialogDescription.innerHTML = `You have received a file from another device. Please close this dialog to finish your form.`;
				createChannelButton.style.background = '#FFF';
			},
			error: (details) => {
				logger.error(details);
				const { createChannelStatusWrapper, createDialogDescription } = getElements();
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
			}
		};
		mapper[state](details);
	};
};

export function createFlottformInput({
	flottformApi,
	createClientUrl,
	rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
	pollTimeForIceInMs = POLL_TIME_IN_MS,
	inputField,
	onError = () => {},
	onProgress = ({ currentSize, totalSize }) => {
		const createChannelElement = inputField!.nextElementSibling!;
		const createChannelLinkDialog =
			document.querySelector<HTMLDialogElement>('.flottform-link-dialog')!;
		const createChannelStatusWrapper =
			createChannelLinkDialog.querySelector<HTMLElement>('.flottform-link-wrapper')!;
		createChannelStatusWrapper.innerHTML = `Receiving ${Math.round((currentSize / totalSize) * 100)}%`;
		const createChannelButton =
			createChannelElement.querySelector<HTMLElement>('.flottform-button')!;
		createChannelButton.style.background = `conic-gradient(#7EA4FF ${Math.round((currentSize / totalSize) * 100)}%, #FFF ${Math.round((currentSize / totalSize) * 100)}%`;
	},
	onResult = (files) => {
		if (inputField) {
			inputField.files = files;
		}
	},
	onStateChange = noop,
	logger = console,
	useDefaultUi = true
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
	useDefaultUi?: boolean;
}): { createChannel: () => void } {
	const baseApi = (flottformApi instanceof URL ? flottformApi : new URL(flottformApi))
		.toString()
		.replace(/\/$/, '');
	const internalOnStateChange = useDefaultUi
		? createDefaultOnStateChange({ inputField, logger })
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
		changeState('waiting-for-client', {
			qrCode: await toDataURL(connectLink),
			link: connectLink,
			createChannel
		});

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
