import { Logger } from '../dist';
import { FlottformChannel } from './Flottform-channel';
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
import {
	DEFAULT_WEBRTC_CONFIG,
	EventEmitter,
	FileMetaInfos,
	FlottformState,
	POLL_TIME_IN_MS
} from './internal';

type FlottformClient = { stopReceiving(): void; error(message: string): void };
type ListenerWithClient = (client: FlottformClient) => void;
type ListenerWithError = (error: any) => void;
type Listeners = {
	new: [details: { channel: FlottformChannel }];
	connecting: [];
	disconnected: [];
	error: [ListenerWithError];
	connected: [];
	receive: [];
};

const noop = () => {};

export class FlottformFileInput extends EventEmitter<Listeners> {
	private channel: FlottformChannel | null = null;
	private useDefaultUi: boolean = true;
	private internalOnStateChange: Function;
	private inputField: HTMLInputElement;
	private logger: Logger;

	constructor({
		mode,
		flottformApi,
		createClientUrl,
		inputField,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		useDefaultUi = true,
		logger = console,
		styles = defaultStyles
	}: {
		mode: string;
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		inputField: HTMLInputElement;
		rtcConfiguration?: RTCConfiguration;
		pollTimeForIceInMs?: number;
		useDefaultUi?: boolean;
		logger?: Logger;
		styles?: Styles;
	}) {
		super();
		this.channel = new FlottformChannel({
			mode,
			flottformApi,
			createClientUrl,
			rtcConfiguration,
			pollTimeForIceInMs,
			logger
		});
		this.inputField = inputField;
		this.logger = logger;
		this.useDefaultUi = useDefaultUi;
		this.internalOnStateChange = useDefaultUi
			? this.createDefaultOnStateChange({ inputField, logger, styles })
			: noop;
		this.registerListeners();
	}

	start = () => {
		this.channel?.start();
	};

	close = () => {
		this.channel?.close();
	};

	private registerListeners = () => {
		this.channel?.on('new', ({ channel }) => {
			console.log('-----Default UI changes for the state `new`');
			this.emit('new', { channel });
			this.useDefaultUi && this.internalOnStateChange('new', { channel });
		});
		this.channel?.on('waiting-for-client', ({ qrCode, link, channel }) => {
			console.log('-----Default UI changes for the state `waiting-for-client`');
			this.useDefaultUi &&
				this.internalOnStateChange('waiting-for-client', {
					qrCode,
					link,
					channel
				});
		});
		this.channel?.on('waiting-for-ice', () => {
			console.log('-----Default UI changes for the state `waiting-for-ice`');
			this.emit('connecting');
			this.useDefaultUi && this.internalOnStateChange('waiting-for-ice');
		});
		this.channel?.on('connected', () => {
			console.log('-----Default UI changes for the state `connected`');
			this.emit('connected');
		});
		this.channel?.on('waiting-for-file', () => {
			console.log('-----Default UI changes for the state `waiting-for-file`');
			this.useDefaultUi && this.internalOnStateChange('waiting-for-file');
		});
		this.channel?.on('receiving-data', () => {
			console.log('-----Default UI changes for the state `receiving-data`');
			this.emit('receive');
			this.useDefaultUi && this.internalOnStateChange('receiving-data');
		});
		this.channel?.on('file-received', this.attachFileToInputField);
		this.channel?.on('done', () => {
			console.log('-----Default UI changes for the state `done`');
			this.useDefaultUi && this.internalOnStateChange('done');
		});
		this.channel?.on('disconnected', () => {
			console.log('-----Default UI changes for the state `disconnected`');
			this.emit('disconnected');
		});
		this.channel?.on('error', (error) => {
			console.log('-----Default UI changes for the state `error`');
			this.emit('error', error);
			this.useDefaultUi && this.internalOnStateChange('error');
		});
	};

	private attachFileToInputField = ({
		fileMeta,
		arrayBuffer
	}: {
		fileMeta: FileMetaInfos;
		arrayBuffer: ArrayBuffer[];
	}) => {
		if (!this.inputField) {
			this.logger.warn('no input field, no need to run onResult');
			return;
		}

		const fileName = fileMeta.name ?? 'no-name';
		const fileType = fileMeta.type ?? 'application/octet-stream';

		const fileForForm = new File(arrayBuffer, fileName, { type: fileType });
		const dt = new DataTransfer();
		dt.items.add(fileForForm);
		this.inputField.files = dt.files;
	};

	private createDefaultOnStateChange(options: {
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
				new: (details: { channel }) => {
					const createChannelLinkDialog = this.createDialogCard(
						details,
						inputField as HTMLInputElement,
						styles
					);
					document.body.appendChild(createChannelLinkDialog);

					const createChannelElement = this.createFlottformButtonParentElement(
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
					channel: FlottformChannel;
				}) => {
					const {
						createChannelQrCode,
						createChannelLinkWithOffer,
						createDialogDescription,
						createChannelButton,
						createChannelStatusWrapper
					} = getElements();
					createChannelButton.removeEventListener('click', () => details.channel.start());
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
				error: (err) => {
					logger.error(err);
					const { createChannelStatusWrapper, createDialogDescription, createChannelButton } =
						getElements();
					let errorMessage = 'Connection failed - please retry!';
					if (err.message === 'connection-failed') {
						errorMessage = 'Client connection failed!';
					} else if (err.message === 'connection-impossible') {
						errorMessage =
							'Connection to this client with the current network environment is impossible';
					} else if (err.message === 'file-transfer') {
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

	private createFlottformButton(inputField: HTMLInputElement, styles?: Styles) {
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

	private createFlottformButtonParentElement(
		inputField: HTMLInputElement,
		createChannelLinkDialog: HTMLDialogElement,
		details: { channel: FlottformChannel },
		styles?: Styles
	) {
		const flottformChannelId = inputField.getAttribute('flottform-p2p-transfer-channel-id')!;

		const createChannelElement = document.createElement('div');
		createChannelElement.setAttribute('class', 'flottform-parent');
		createChannelElement.style.cssText = createChannelElementCss(inputField);
		// Add an id to differentiate between different input fields.
		createChannelElement.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

		const createChannelButton = this.createFlottformButton(inputField, styles);
		// Add event listeners to the flottform button
		createChannelButton.addEventListener('click', () => details.channel.start());
		createChannelButton.addEventListener('click', () => {
			createChannelLinkDialog.showModal();
			createChannelLinkDialog.style.display = 'flex';
		});

		// Append the button to the parent element
		createChannelElement.appendChild(createChannelButton);
		return createChannelElement;
	}

	private createDialogCard(
		details: { channel: FlottformChannel },
		inputField: HTMLInputElement,
		styles?: Styles
	) {
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
		} = this.createDialogCardElements(inputField, styles);
		// Add event listeners to Dialog Card Elements
		closeDialogButton.addEventListener('click', () => {
			createChannelLinkDialog.close();
			createChannelLinkDialog.style.display = 'none';
		});
		refreshConnectionButton.addEventListener('click', () => details.channel.start());

		// Append all elements to Dialog card
		createChannelLinkDialog.appendChild(createChannelStatusWrapper);
		createChannelLinkDialog.appendChild(createChannelQrCode);
		createChannelLinkDialog.appendChild(createChannelLinkWithOffer);
		createChannelLinkDialog.appendChild(createDialogDescription);
		createChannelLinkDialog.appendChild(closeDialogButton);
		createChannelLinkDialog.appendChild(refreshConnectionButton);

		return createChannelLinkDialog;
	}

	private createDialogCardElements(inputField: HTMLInputElement, styles?: Styles) {
		const flottformChannelId = inputField.getAttribute('flottform-p2p-transfer-channel-id')!;

		const createChannelStatusWrapper = document.createElement('div');
		createChannelStatusWrapper.setAttribute('class', 'flottform-status-wrapper');
		createChannelStatusWrapper.style.cssText = createChannelStatusWrapperCss(styles);
		createChannelStatusWrapper.setAttribute(
			'flottform-p2p-transfer-channel-id',
			flottformChannelId
		);

		const createChannelQrCode = document.createElement('img');
		createChannelQrCode.setAttribute('class', 'flottform-qr-code');
		createChannelQrCode.style.cssText = createChannelQrCodeCss(styles);
		createChannelQrCode.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

		const createChannelLinkWithOffer = document.createElement('a');
		createChannelLinkWithOffer.setAttribute('class', 'flottform-link-offer');
		createChannelLinkWithOffer.setAttribute('target', '_blank');
		createChannelLinkWithOffer.setAttribute(
			'flottform-p2p-transfer-channel-id',
			flottformChannelId
		);

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
}
