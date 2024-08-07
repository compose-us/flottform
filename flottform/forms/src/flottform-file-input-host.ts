import { FlottformChannelHost } from './flottform-channel-host';
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
	FlottformState,
	Logger,
	POLL_TIME_IN_MS
} from './internal';

type Listeners = {
	new: [];
	disconnected: [];
	error: [error: any];
	connected: [];
	receive: []; // Emitted to signal the start of receiving the file(s)
	progress: { fileIndex: number; currentFileProgress: number; overallProgress: number }[]; // Emitted to signal the progress of receiving the file(s)
	done: [];
	'webrtc:waiting-for-client': [link: string];
	'webrtc:waiting-for-ice': [];
	'webrtc:waiting-for-file': [];
};

const noop = () => {};

export class FlottformFileInputHost extends EventEmitter<Listeners> {
	private channel: FlottformChannelHost | null = null;
	private theme: 'default' | 'custom';
	private internalOnStateChange: Function;
	private inputField: HTMLInputElement;
	private logger: Logger;
	private filesMetaData: { name: string; type: string; size: number }[] = [];
	private filesTotalSize: number = 0;
	private receivedDataSize: number = 0;
	private currentFile: {
		index: number;
		receivedSize: number;
		arrayBuffer: ArrayBuffer[];
	} | null = null;
	private link: string = '';
	private qrCode: string = '';

	constructor({
		flottformApi,
		createClientUrl,
		inputField,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		theme = 'custom',
		logger = console,
		styles = defaultStyles
	}: {
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		inputField: HTMLInputElement;
		rtcConfiguration?: RTCConfiguration;
		pollTimeForIceInMs?: number;
		theme?: 'default' | 'custom';
		logger?: Logger;
		styles?: Styles;
	}) {
		super();
		this.channel = new FlottformChannelHost({
			flottformApi,
			createClientUrl,
			rtcConfiguration,
			pollTimeForIceInMs,
			logger
		});
		this.inputField = inputField;
		this.logger = logger;
		this.theme = theme;
		this.internalOnStateChange =
			theme === 'default' ? this.createDefaultOnStateChange({ inputField, logger, styles }) : noop;
		this.registerListeners();
	}

	start = () => {
		this.channel?.start();
	};

	close = () => {
		this.channel?.close();
	};

	getLink = () => {
		if (this.link === '') {
			this.logger.error(
				'Flottform is currently establishing the connection. Link is unavailable for now!'
			);
		}
		return this.link;
	};

	getQrCode = () => {
		if (this.qrCode === '') {
			this.logger.error(
				'Flottform is currently establishing the connection. qrCode is unavailable for now!'
			);
		}
		return this.qrCode;
	};

	private handleIncomingData = (e: MessageEvent<any>) => {
		if (typeof e.data === 'string') {
			// string can be either metadata or end transfer marker.
			const message = JSON.parse(e.data);
			if (message.type === 'file-transfer-meta') {
				// Handle file metadata
				this.filesMetaData = message.filesQueue;
				this.currentFile = { index: 0, receivedSize: 0, arrayBuffer: [] };
				this.filesTotalSize = message.totalSize;
			} else if (message.type === 'transfer-complete') {
				this.emit('done');
				this.theme === 'default' && this.internalOnStateChange('done');
			}
		} else if (e.data instanceof ArrayBuffer) {
			// Handle file chunk
			if (this.currentFile) {
				this.currentFile.arrayBuffer.push(e.data);
				this.currentFile.receivedSize += e.data.byteLength;
				this.receivedDataSize += e.data.byteLength;

				const currentFileTotalSize = this.filesMetaData[this.currentFile.index]?.size as number;

				const currentFileProgress = (this.currentFile.receivedSize / currentFileTotalSize).toFixed(
					2
				);
				const overallProgress = (this.receivedDataSize / this.filesTotalSize).toFixed(2);

				this.emit('progress', {
					fileIndex: this.currentFile.index,
					currentFileProgress: parseFloat(currentFileProgress),
					overallProgress: parseFloat(overallProgress)
				});

				if (this.currentFile.receivedSize === currentFileTotalSize) {
					// Attach the current file to the given input field
					this.appendFileToInputField(this.currentFile.index);
					// Initialize the values of currentFile to receive the next file
					this.currentFile = {
						index: this.currentFile.index + 1,
						receivedSize: 0,
						arrayBuffer: []
					};
				}
			}
		}
	};

	private appendFileToInputField = (fileIndex: number) => {
		if (!this.inputField) {
			this.logger.warn('No input field provided!!');
			return;
		}

		if (!this.inputField.multiple) {
			this.logger.warn('Input field does not accept multiple files. Setting multiple to true.');
			this.inputField.multiple = true;
		}

		const dt = new DataTransfer();

		// Add existing files from the input field to the DataTransfer object to avoid loosing them.
		if (this.inputField.files) {
			for (const file of Array.from(this.inputField.files)) {
				dt.items.add(file);
			}
		}

		const fileName = this.filesMetaData[fileIndex]?.name ?? 'no-name';
		const fileType = this.filesMetaData[fileIndex]?.type ?? 'application/octet-stream';

		const fileForForm = new File(this.currentFile?.arrayBuffer as ArrayBuffer[], fileName, {
			type: fileType
		});
		dt.items.add(fileForForm);
		this.inputField.files = dt.files;
	};

	private registerListeners = () => {
		this.channel?.on('new', ({ channel }) => {
			this.emit('new');
			this.theme === 'default' && this.internalOnStateChange('new', { channel });
		});
		this.channel?.on('waiting-for-client', ({ qrCode, link, channel }) => {
			this.emit('webrtc:waiting-for-client', link);
			this.link = link;
			this.qrCode = qrCode;
			this.theme === 'default' &&
				this.internalOnStateChange('waiting-for-client', {
					qrCode,
					link,
					channel
				});
		});
		this.channel?.on('waiting-for-ice', () => {
			this.emit('webrtc:waiting-for-ice');
			this.theme === 'default' && this.internalOnStateChange('waiting-for-ice');
		});
		this.channel?.on('connected', () => {
			this.emit('connected');
		});
		this.channel?.on('waiting-for-file', () => {
			this.emit('webrtc:waiting-for-file');
			this.theme === 'default' && this.internalOnStateChange('waiting-for-file');
		});
		this.channel?.on('receiving-data', (e) => {
			this.handleIncomingData(e);
			this.theme === 'default' && this.internalOnStateChange('receiving-data');
		});
		this.channel?.on('done', () => {
			this.emit('done');
			this.theme === 'default' && this.internalOnStateChange('done');
		});
		this.channel?.on('disconnected', () => {
			this.emit('disconnected');
		});
		this.channel?.on('error', (error) => {
			this.emit('error', error);
			this.theme === 'default' && this.internalOnStateChange('error');
		});
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
				const createChannelLinkWrapper = document.querySelector<HTMLDialogElement>(
					`.flottform-link-dialog[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
				)!;
				const createChannelStatusWrapper = createChannelLinkWrapper.querySelector<HTMLElement>(
					`.flottform-status-wrapper[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
				)!;
				const createChannelLinkArea = createChannelLinkWrapper.querySelector<HTMLElement>(
					`.flottform-link-area[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
				)!;
				const createChannelQrCode = createChannelLinkWrapper.querySelector<HTMLElement>(
					`.flottform-qr-code[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
				)!;
				const createChannelLinkWithOffer = createChannelLinkWrapper.querySelector<HTMLElement>(
					`.flottform-link-offer[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
				)!;
				const createDialogDescription = createChannelLinkWrapper.querySelector<HTMLElement>(
					`.flottform-dialog-description[flottform-p2p-transfer-channel-id=${flottformChannelId}]`
				)!;
				return {
					createChannelElement,
					createChannelButton,
					createChannelLinkWrapper,
					createChannelStatusWrapper,
					createChannelLinkArea,
					createChannelQrCode,
					createChannelLinkWithOffer,
					createDialogDescription
				};
			};

			const mapper: Record<FlottformState, (details?: any) => void> = {
				new: () => {
					let createInputsList = document.querySelector('#flottform-parent');
					if (!createInputsList) {
						createInputsList = this.createFlottformInputsList(styles);
						document.body.appendChild(createInputsList);
					}

					const createChannelLinkWrapper = this.createLinkAndQrWrapper(
						details,
						inputField as HTMLInputElement,
						styles
					);
					const createChannelElement = this.createFlottformButtonParentElement(
						inputField as HTMLInputElement,
						createChannelLinkWrapper,
						details,
						styles
					);

					createInputsList!.querySelector('ul')!.appendChild(createChannelElement);
				},
				'waiting-for-client': (details: {
					qrCode: string;
					link: string;
					channel: FlottformChannelHost;
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
		// createChannelButton.setAttribute('class', 'flottform-button');
		createChannelButton.innerText = 'Get a link';
		// createChannelButton.style.cssText = createChannelButtonCss(styles);
		// simulateHoverEffect(createChannelButton, styles);
		// createChannelButton.setAttribute(
		// 	'flottform-p2p-transfer-channel-id',
		// 	inputField.getAttribute('flottform-p2p-transfer-channel-id')!
		// );

		return createChannelButton;
	}

	private createFlottformInputsList(styles?: Styles) {
		const createInputsListDetails = document.createElement('details');
		createInputsListDetails.setAttribute('id', 'flottform-parent');
		const createHeaderForInputList = document.createElement('summary');
		createHeaderForInputList.innerText = 'Upload your file from other device';
		createInputsListDetails.appendChild(createHeaderForInputList);
		const createListWrapper = document.createElement('ul');
		createInputsListDetails.appendChild(createListWrapper);

		return createInputsListDetails;
	}

	private createFlottformButtonParentElement(
		inputField: HTMLInputElement,
		createChannelLinkWrapper: HTMLDivElement,
		details: { channel: FlottformChannelHost },
		styles?: Styles
	) {
		const flottformChannelId = inputField.getAttribute('flottform-p2p-transfer-channel-id')!;

		const createChannelElement = document.createElement('li');
		const createInputName = document.createElement('p');
		createInputName.innerText = `Input: ${inputField.id}`;
		// createChannelElement.setAttribute('class', 'flottform-parent');
		// createChannelElement.style.cssText = createChannelElementCss(inputField);
		// Add an id to differentiate between different input fields.
		createChannelElement.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

		const createChannelButton = this.createFlottformButton(inputField, styles);
		// Add event listeners to the flottform button
		createChannelButton.addEventListener('click', () => details.channel.start());
		createChannelButton.addEventListener('click', () => {
			createChannelLinkWrapper.style.display = 'block';
		});

		// Append the button to the parent element
		createChannelElement.appendChild(createInputName);
		createChannelElement.appendChild(createChannelButton);
		createChannelElement.appendChild(createChannelLinkWrapper);
		return createChannelElement;
	}

	private createLinkAndQrWrapper(
		details: { channel: FlottformChannelHost },
		inputField: HTMLInputElement,
		styles?: Styles
	) {
		const flottformChannelId = inputField.getAttribute('flottform-p2p-transfer-channel-id')!;

		const createChannelLinkWrapper = document.createElement('div');
		// createChannelLinkWrapper.setAttribute('class', 'flottform-link-dialog');
		// Add an id to differentiate between different input fields.
		createChannelLinkWrapper.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);
		// createChannelLinkWrapper.style.cssText = dialogCss(styles);
		const { createChannelQrCode, createChannelLinkWithOffer, refreshConnectionButton } =
			this.createLinkAndQrElements(inputField, styles);

		refreshConnectionButton.addEventListener('click', () => details.channel.start());

		// Append all elements to Dialog card
		createChannelLinkWrapper.appendChild(createChannelQrCode);
		createChannelLinkWrapper.appendChild(createChannelLinkWithOffer);

		createChannelLinkWrapper.style.display = 'none';

		return createChannelLinkWrapper;
	}

	private createLinkAndQrElements(inputField: HTMLInputElement, styles?: Styles) {
		const flottformChannelId = inputField.getAttribute('flottform-p2p-transfer-channel-id')!;

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

		const refreshConnectionButton = document.createElement('button');
		refreshConnectionButton.innerHTML = 'Refresh';
		refreshConnectionButton.setAttribute('class', 'refresh-connection-button');
		refreshConnectionButton.style.cssText = refreshConnectionButtonCss(styles);
		simulateHoverEffect(refreshConnectionButton, styles);
		refreshConnectionButton.setAttribute('flottform-p2p-transfer-channel-id', flottformChannelId);

		return {
			createChannelQrCode,
			createChannelLinkWithOffer,
			refreshConnectionButton
		};
	}
}
