import { createFlottformChannel } from './create-flottform-channel';
import { FileMetaInfos, FlottformState, Logger } from './internal';
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

const noop = () => {};

export async function createFlottformFileInput({
	mode,
	flottformApi,
	createClientUrl,
	inputField,
	useDefaultUi = true,
	logger = console,
	styles = defaultStyles
}: {
	mode: string;
	flottformApi: string | URL;
	createClientUrl: (params: { endpointId: string }) => Promise<string>;
	inputField: HTMLInputElement;
	useDefaultUi: boolean;
	logger?: Logger;
	styles?: Styles;
}) {
	const internalOnStateChange = useDefaultUi
		? createDefaultOnStateChange({ inputField, logger, styles })
		: noop;

	const flottformChannel = createFlottformChannel({
		mode,
		flottformApi,
		createClientUrl
	});

	flottformChannel.eventEmitter.on('new', (details) => {
		console.log('state=new; building the default UIwith details=', details);
		internalOnStateChange('new', details);
	});

	flottformChannel.eventEmitter.on('waiting-for-client', (details) => {
		console.log('state=waiting-for-client;details=', details);
		internalOnStateChange('new', details);
	});

	const { dataChannel, updateState } = await flottformChannel.createChannel();

	const changeState: typeof updateState = (newState, details) => {
		internalOnStateChange(newState, details);
		updateState(newState, details);
	};

	const arrayBuffers: ArrayBuffer[] = [];
	let didReceiveSomething = false;
	let fileMeta: FileMetaInfos | undefined = undefined;
	let currentSize = 0;

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
		//onProgress({ inputField, currentSize, totalSize: size });

		if (currentSize === size) {
			try {
				//await onResult({ inputField, fileMeta, arrayBuffers });
			} catch (e) {
				//logger.error('Could not complete onResult', e);
				changeState('error', e);
				return;
			} finally {
				dataChannel.close();
			}
			changeState('done');
		}
	};
}

function createDefaultOnStateChange(options: {
	inputField?: HTMLElement;
	logger: Logger;
	styles?: Styles;
}): <T extends FlottformState>(state: T, details?: any) => void {
	const { inputField, logger, styles } = options;
	if (!inputField) {
		return noop;
	}
	return (state, details) => {
		const getElements = () => {
			// Each input element should have an id
			const flottformChannelId = inputField.getAttribute('flottform-p2p-transfer-channel-id');

			const createChannelElement = inputField.nextElementSibling!;
			const createChannelButton = createChannelElement.querySelector<HTMLElement>(
				`.flottform-button[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
			)!;
			const createChannelLinkDialog = document.querySelector<HTMLDialogElement>(
				`.flottform-link-dialog[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
			)!;
			const createChannelStatusWrapper = createChannelLinkDialog.querySelector<HTMLElement>(
				`.flottform-status-wrapper[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
			)!;
			const createChannelLinkArea = createChannelLinkDialog.querySelector<HTMLElement>(
				`.flottform-link-area[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
			)!;
			const createChannelQrCode = createChannelLinkDialog.querySelector<HTMLElement>(
				`.flottform-qr-code[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
			)!;
			const createChannelLinkWithOffer = createChannelLinkDialog.querySelector<HTMLElement>(
				`.flottform-link-offer[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
			)!;
			const createDialogDescription = createChannelLinkDialog.querySelector<HTMLElement>(
				`.flottform-dialog-description[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
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
			new: (details: ReturnType<typeof createFlottformFileInput>) => {
				const createChannelLinkDialog = createDialogCard(
					details,
					inputField as HTMLInputElement,
					styles
				);
				document.body.appendChild(createChannelLinkDialog);

				const createChannelElement = createFlottformButtonParentElement(
					inputField as HTMLInputElement,
					createChannelLinkDialog,
					details,
					styles
				);
				inputField?.after(createChannelElement);
			},
			'waiting-for-client': (details: {
				qrCode: string;
				link: string;
				createChannel: ReturnType<typeof createFlottformFileInput>;
			}) => {
				const {
					createChannelQrCode,
					createChannelLinkWithOffer,
					createDialogDescription,
					createChannelButton,
					createChannelStatusWrapper
				} = getElements();
				createChannelButton.removeEventListener('click', details.createChannel);
				createChannelButton.style.background = changeBackgroundOnState(state, styles);

				createChannelQrCode.style.display = 'block';
				createChannelQrCode.setAttribute('src', details.qrCode);

				createChannelLinkWithOffer.style.display = 'block';
				createChannelLinkWithOffer.setAttribute('href', details.link);
				createChannelLinkWithOffer.innerHTML = details.link;

				createChannelStatusWrapper.innerHTML = 'Upload a file';

				createDialogDescription.innerHTML = 'Use this QR-Code or Link on your other device.';
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
}

function createFlottformButton(inputField: HTMLInputElement, styles?: Styles) {
	const createChannelButton = document.createElement('button');
	createChannelButton.setAttribute('type', 'button');
	createChannelButton.setAttribute('class', 'flottform-button');
	createChannelButton.innerHTML = flottformSvg(styles);
	createChannelButton.style.cssText = createChannelButtonCss(styles);
	simulateHoverEffect(createChannelButton, styles);
	createChannelButton.setAttribute(
		'flottform-p2p-transfer-channel-id',
		inputField.getAttribute('flottform-p2p-transfer-channel-id')!
	);

	return createChannelButton;
}

function createFlottformButtonParentElement(
	inputField: HTMLInputElement,
	createChannelLinkDialog: HTMLDialogElement,
	details: any,
	styles?: Styles
) {
	const flottformChannelId = inputField.getAttribute('flottform-p2p-transfer-channel-id')!;

	const createChannelElement = document.createElement('div');
	createChannelElement.setAttribute('class', 'flottform-parent');
	createChannelElement.style.cssText = createChannelElementCss(inputField);
	// Add an id to differentiate between different input fields.
	createChannelElement.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

	const createChannelButton = createFlottformButton(inputField, styles);
	// Add event listeners to the flottform button
	createChannelButton.addEventListener('click', details.createChannel);
	createChannelButton.addEventListener('click', () => {
		createChannelLinkDialog.showModal();
		createChannelLinkDialog.style.display = 'flex';
	});

	// Append the button to the parent element
	createChannelElement.appendChild(createChannelButton);
	return createChannelElement;
}

function createDialogCard(details: any, inputField: HTMLInputElement, styles?: Styles) {
	const flottformChannelId = inputField.getAttribute('flottform-p2p-transfer-channel-id')!;

	const createChannelLinkDialog = document.createElement('dialog');
	createChannelLinkDialog.setAttribute('class', 'flottform-link-dialog');
	// Add an id to differentiate between different input fields.
	createChannelLinkDialog.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);
	createChannelLinkDialog.style.cssText = dialogCss(styles);
	const {
		createChannelStatusWrapper,
		createChannelQrCode,
		createChannelLinkWithOffer,
		createDialogDescription,
		closeDialogButton,
		refreshConnectionButton
	} = createDialogCardElements(inputField, styles);
	// Add event listeners to Dialog Card Elements
	closeDialogButton.addEventListener('click', () => {
		createChannelLinkDialog.close();
		createChannelLinkDialog.style.display = 'none';
	});
	refreshConnectionButton.addEventListener('click', details.createChannel);

	// Append all elements to Dialog card
	createChannelLinkDialog.appendChild(createChannelStatusWrapper);
	createChannelLinkDialog.appendChild(createChannelQrCode);
	createChannelLinkDialog.appendChild(createChannelLinkWithOffer);
	createChannelLinkDialog.appendChild(createDialogDescription);
	createChannelLinkDialog.appendChild(closeDialogButton);
	createChannelLinkDialog.appendChild(refreshConnectionButton);

	return createChannelLinkDialog;
}

function createDialogCardElements(inputField: HTMLInputElement, styles?: Styles) {
	const flottformChannelId = inputField.getAttribute('flottform-p2p-transfer-channel-id')!;

	const createChannelStatusWrapper = document.createElement('div');
	createChannelStatusWrapper.setAttribute('class', 'flottform-status-wrapper');
	createChannelStatusWrapper.style.cssText = createChannelStatusWrapperCss(styles);
	createChannelStatusWrapper.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

	const createChannelQrCode = document.createElement('img');
	createChannelQrCode.setAttribute('class', 'flottform-qr-code');
	createChannelQrCode.style.cssText = createChannelQrCodeCss(styles);
	createChannelQrCode.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

	const createChannelLinkWithOffer = document.createElement('a');
	createChannelLinkWithOffer.setAttribute('class', 'flottform-link-offer');
	createChannelLinkWithOffer.setAttribute('target', '_blank');
	createChannelLinkWithOffer.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

	const createDialogDescription = document.createElement('p');
	createDialogDescription.setAttribute('class', 'flottform-dialog-description');
	createDialogDescription.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

	const closeDialogButton = document.createElement('button');
	closeDialogButton.innerHTML = closeSvg(styles);
	closeDialogButton.setAttribute('class', 'close-dialog-button');
	closeDialogButton.style.cssText = closeDialogButtonCss(styles);
	closeDialogButton.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

	const refreshConnectionButton = document.createElement('button');
	refreshConnectionButton.innerHTML = 'Refresh';
	refreshConnectionButton.setAttribute('class', 'refresh-connection-button');
	refreshConnectionButton.style.cssText = refreshConnectionButtonCss(styles);
	simulateHoverEffect(refreshConnectionButton, styles);
	refreshConnectionButton.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

	return {
		createChannelStatusWrapper,
		createChannelQrCode,
		createChannelLinkWithOffer,
		createDialogDescription,
		closeDialogButton,
		refreshConnectionButton
	};
}
