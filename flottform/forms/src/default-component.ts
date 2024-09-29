import { FlottformFileInputHost } from './flottform-file-input-host';
import { FlottformTextInputHost } from './flottform-text-input-host';
import { BaseInputHost, BaseListeners } from './internal';
import { FlottformCreateFileParams, FlottformCreateItemParams } from './types';

const openInputsList = () => {
	const flottformElementsContainerWrapper: HTMLDivElement = document.querySelector(
		'.flottform-elements-container-wrapper'
	)!;
	const openerSvg: SVGElement = document.querySelector('.flottform-opener-triangle')!;
	flottformElementsContainerWrapper.classList.toggle('flottform-open');
	openerSvg.classList.toggle('flottform-button-svg-open');
};

const initRoot = (
	flottformRootTitle?: string,
	flottformRootDescription?: string,
	additionalComponentClass?: string
) => {
	const flottformRoot = document.createElement('div');
	flottformRoot.setAttribute('class', `flottform-root${additionalComponentClass ?? ''}`);
	const flottformListOpenerButton = createFlottformOpenerButton(flottformRootTitle);
	flottformRoot.appendChild(flottformListOpenerButton);
	const flottformElementsContainerWrapper =
		createFlottformItemsContainerWithTransition(flottformRootDescription);
	flottformRoot.appendChild(flottformElementsContainerWrapper);
	return flottformRoot;
};

const createLinkAndQrCode = (qrCode: string, link: string) => {
	const createChannelQrCode = document.createElement('img');
	createChannelQrCode.setAttribute('class', 'flottform-qr-code');
	createChannelQrCode.setAttribute('src', qrCode);

	const createChannelLinkWithOffer = document.createElement('div');
	createChannelLinkWithOffer.setAttribute('class', 'flottform-link-offer');
	createChannelLinkWithOffer.innerText = link;
	return {
		createChannelQrCode,
		createChannelLinkWithOffer
	};
};

/**
 * Creates and attaches a default Flottform UI component to the specified anchor element. This UI acts as an intermediary to facilitate WebRTC-based peer-to-peer connections between two devices, allowing one peer to send data (files or text) to the other.
 *
 * Developers can customize aspects of the UI, such as the button text, descriptions, and CSS classes, while using the default behavior provided by the function to quickly set up the peer-to-peer data transfer mechanism.
 *
 * The generated UI component will be attached as a child to `flottformAnchorElement`. The UI includes a dialog with a QR code or link that the second peer can use to connect and upload files/text to the main form.
 *
 * The dialog also shows the progress of receiving the file or text from the other device or any errors that can happen.
 *
 * The returned object allows for further interactions, such as adding the UI necessary to handle receiving a file or text, and retrieving all existing Flottform items within the UI.
 *
 * @param {Object} params - Configuration options for setting up the Flottform component.
 * @param {HTMLElement} params.flottformAnchorElement - The HTML element to which the Flottform component will be attached. It determines where the UI will be built on the page.
 * @param {string} [params.id] - Optional ID for the UI used for File of Text element.
 * @param {HTMLElement} [params.flottformRootElement] - An optional root element to use. If not provided, a new default root element (a `div` with the class `flottform-root`) will be created.
 * @param {string} [params.additionalComponentClass] - Optional additional class to add for custom styling of the component.
 * @param {string} [params.flottformRootTitle] - Optional title to set for the Flottform root element This is the text displayed on the button that opens the dialog (with the class `flottform-root-opener-button`).
 * @param {string} [params.flottformRootDescription] - Optional description text shown inside the dialog when it is opened. It provides context for the user about what the Flottform component does (e.g., "Receive files from other devices").
 *
 * @returns {Object} - Returns an object with methods to interact with the Flottform component.
 * @returns {HTMLElement} returns.flottformRoot - The root element of the Flottform UI.
 * @returns {Function} returns.createFileItem - Function to create an entry in the UI for receiving files from another peer. The entry will show the QR code/link, progress of the file transfer, and handle any errors.
 * @returns {Function} returns.createTextItem - Function to create an entry in the UI for receiving text from another peer. Similar to `createFileItem`, it handles text input, progress tracking, and error handling.
 * @returns {Function} returns.getAllFlottformItems - Function to retrieve all current Flottform items (file and text entries) in the dialog.
 *
 * @example
 *
 *
 * const flottformComponent = createDefaultFlottformComponent({
 *	flottformAnchorElement: document.getElementById('form-anchor'),
 *	flottformRootTitle: 'Share Data via Flottform',
 * 	flottformRootDescription: 'This form is powered by Flottform. Upload files or send text from another device using the provided QR code.'
 *});
 *
 * // Create an entry to receive files
 * flottformComponent.createFileItem({
 *   flottformApi, // URL of the WebRTC signaling server
 *   createClientUrl: ({ endpointId }) => `/upload/${endpointId}`, // URL of the client page for file uploads
 *   inputField: document.querySelector('#fileInput'), // The file input field in the main form
 *   label: 'Upload Resume', // Label for the file input
 *   buttonLabel:'Submit File', // Button text for the file input
 *   onSuccessText: 'File received successfully!' // Success message displayed after the file is received
 * });
 *
 * // Create an entry to receive text
 * flottformComponent.createTextItem({
 *   flottformApi, // URL of the WebRTC signaling server
 *   createClientUrl: ({ endpointId }) => `/text/${endpointId}`, // URL of the client page for sending text
 *   label: 'Enter your message', // Label for the text input
 *   buttonLabel: 'Send Message', // Button text for the text input
 *   onErrorText: (error) => `Failed to receive text: ${error.message}` // Error message if text transfer fails
 * });
 *
 * // Retrieve all Flottform items in the UI (file and text entries)
 * const allItems = flottformComponent.getAllFlottformItems();
 */
export const createDefaultFlottformComponent = ({
	flottformAnchorElement,
	// @ts-ignore: Unused variable
	id,
	flottformRootElement,
	additionalComponentClass,
	flottformRootTitle,
	flottformRootDescription
}: {
	flottformAnchorElement: HTMLElement;
	id?: string;
	flottformRootElement?: HTMLElement;
	additionalComponentClass?: string;
	flottformRootTitle?: string;
	flottformRootDescription?: string;
}): {
	flottformRoot: HTMLElement;
	createFileItem: (params: FlottformCreateFileParams) => void;
	createTextItem: (params: FlottformCreateItemParams) => void;
	getAllFlottformItems: () => NodeListOf<Element> | null;
} => {
	const flottformRoot: HTMLElement =
		flottformRootElement ??
		document.querySelector('.flottform-root') ??
		initRoot(flottformRootTitle, flottformRootDescription, additionalComponentClass);
	const flottformElementsContainer = flottformRoot.querySelector('.flottform-elements-container')!;
	const flottformElementsContainerWrapper = flottformRoot.querySelector(
		'.flottform-elements-container-wrapper'
	)!;
	flottformElementsContainerWrapper.appendChild(flottformElementsContainer);
	flottformRoot.appendChild(flottformElementsContainerWrapper);

	flottformAnchorElement.appendChild(flottformRoot);
	return {
		flottformRoot,
		/**
		 * Retrieves all existing Flottform items (both file and text entries) in the UI.
		 *
		 * @returns {NodeListOf<Element> | null} - A NodeList of Flottform input items (file and text entries), or `null` if no items are found.
		 */
		getAllFlottformItems: () => {
			const flottformInputsList = flottformRoot.querySelector('.flottform-inputs-list');
			if (!flottformInputsList) {
				console.error('No element with class .flottform-inputs-list found');
				return null;
			}
			return flottformInputsList.childNodes as NodeListOf<Element>;
		},
		/**
		 * Creates a UI entry for receiving a file via WebRTC.
		 *
		 * @param {Object} params - Configuration options for the file input entry.
		 * @param {string} params.flottformApi - URL of the WebRTC signaling server.
		 * @param {Function} params.createClientUrl - A function that returns the URL where the second peer can upload the file.
		 * @param {HTMLInputElement} params.inputField - The file input field in the main form where the received file will be displayed or processed.
		 * @param {string} [params.id] - Optional ID for the file input entry.
		 * @param {string} [params.additionalItemClasses] - Optional additional CSS classes for styling the file input entry.
		 * @param {string} [params.label] - Optional label text for the file input entry.
		 * @param {string} [params.buttonLabel] - Optional text for the button that triggers the file reception.
		 * @param {string | Function} [params.onErrorText] - Optional error message displayed if the file transfer fails.
		 * @param {string} [params.onSuccessText] - Optional success message displayed after the file is successfully received.
		 *
		 * @returns {void}
		 */
		createFileItem: ({
			flottformApi,
			createClientUrl,
			inputField,
			id,
			additionalItemClasses,
			label,
			buttonLabel,
			onErrorText,
			onSuccessText
		}: {
			flottformApi: string;
			createClientUrl: (params: { endpointId: string }) => Promise<string>;
			inputField: HTMLInputElement;
			id?: string;
			additionalItemClasses?: string;
			label?: string;
			buttonLabel?: string;
			onErrorText?: string | ((error: Error) => string);
			onSuccessText?: string;
		}) => {
			const flottformBaseInputHost = new FlottformFileInputHost({
				flottformApi,
				createClientUrl,
				inputField
			});

			const {
				flottformItem,
				statusInformation,
				refreshChannelButton,
				flottformStateItemsContainer
			} = createBaseFlottformItems({
				flottformBaseInputHost,
				additionalItemClasses,
				label,
				buttonLabel,
				onErrorText
			});

			const flottformItemsList = flottformRoot.querySelector('.flottform-inputs-list')!;

			flottformItemsList.appendChild(flottformItem);
			flottformElementsContainer.appendChild(flottformItemsList);

			handleFileInputStates({
				flottformItem,
				statusInformation,
				refreshChannelButton,
				flottformStateItemsContainer,
				flottformFileInputHost: flottformBaseInputHost,
				id,
				onSuccessText
			});
		},
		/**
		 * Creates a UI entry for receiving text via WebRTC.
		 *
		 * @param {Object} params - Configuration options for the text input entry.
		 * @param {string} params.flottformApi - URL of the WebRTC signaling server.
		 * @param {Function} params.createClientUrl - A function that returns the URL where the second peer can send the text.
		 * @param {string} [params.id] - Optional ID for the text input entry.
		 * @param {string} [params.additionalItemClasses] - Optional additional CSS classes for styling the text input entry.
		 * @param {string} [params.label] - Optional label text for the text input entry.
		 * @param {string} [params.buttonLabel] - Optional text for the button that triggers the text reception.
		 * @param {string | Function} [params.onErrorText] - Optional error message displayed if the text transfer fails.
		 * @param {string} [params.onSuccessText] - Optional success message displayed after the text is successfully received.
		 *
		 * @returns {void}
		 */
		createTextItem: ({
			flottformApi,
			createClientUrl,
			id,
			additionalItemClasses,
			label,
			buttonLabel,
			onErrorText,
			onSuccessText
		}: {
			flottformApi: string;
			createClientUrl: (params: { endpointId: string }) => Promise<string>;
			id?: string;
			additionalItemClasses?: string;
			label?: string;
			buttonLabel?: string;
			onErrorText?: string | ((error: Error) => string);
			onSuccessText?: string;
		}) => {
			const flottformBaseInputHost = new FlottformTextInputHost({
				flottformApi,
				createClientUrl
			});

			const { flottformItem, statusInformation, refreshChannelButton } = createBaseFlottformItems({
				flottformBaseInputHost,
				additionalItemClasses,
				label,
				buttonLabel,
				onErrorText
			});
			const flottformItemsList = flottformRoot.querySelector('.flottform-inputs-list')!;

			flottformItemsList.appendChild(flottformItem);
			flottformElementsContainer.appendChild(flottformItemsList);

			handleTextInputStates({
				flottformItem,
				statusInformation,
				refreshChannelButton,
				flottformTextInputHost: flottformBaseInputHost,
				id,
				onSuccessText
			});
		}
	};
};

const createBaseFlottformItems = <L extends BaseListeners>({
	flottformBaseInputHost,
	additionalItemClasses,
	label,
	buttonLabel,
	onErrorText
}: {
	flottformBaseInputHost: BaseInputHost<L>;

	additionalItemClasses?: string;
	label?: string;
	buttonLabel?: string;
	onErrorText?: string | ((error: Error) => string);
}) => {
	const flottformItem = createFlottformListItem(additionalItemClasses);
	setLabelForFlottformItem({ label, flottformItem });
	const statusInformation = createStatusInformation();
	const createChannelButton = createFlottformChannelButton(buttonLabel);
	createChannelButton.addEventListener('click', () => flottformBaseInputHost.start());
	const flottformStateItemsContainer = createStateItemsContainer(createChannelButton);
	flottformItem.appendChild(flottformStateItemsContainer);
	const refreshChannelButton = createFlottformChannelRefreshButton();
	refreshChannelButton.addEventListener('click', () => flottformBaseInputHost.start());

	// listen to events -> change elements depending on them
	flottformBaseInputHost.on('endpoint-created', ({ link, qrCode }) => {
		const { createChannelQrCode, createChannelLinkWithOffer } = createLinkAndQrCode(qrCode, link);
		const copyToClipboardButton = createCopyToClipboardButton();
		flottformStateItemsContainer.replaceChildren(createChannelQrCode);
		const linkAndCopyButtonWrapper = document.createElement('div');
		linkAndCopyButtonWrapper.setAttribute('class', 'flottform-copy-button-link-wrapper');
		linkAndCopyButtonWrapper.appendChild(copyToClipboardButton);
		linkAndCopyButtonWrapper.appendChild(createChannelLinkWithOffer);
		flottformStateItemsContainer.appendChild(linkAndCopyButtonWrapper);
	});
	flottformBaseInputHost.on('connected', () => {
		statusInformation.innerHTML = 'Connected';
		statusInformation.appendChild(refreshChannelButton);
		flottformStateItemsContainer.replaceChildren(statusInformation);
	});
	flottformBaseInputHost.on('error', (error) => {
		statusInformation.innerHTML =
			typeof onErrorText === 'function'
				? onErrorText(error)
				: onErrorText ?? `🚨 An error occured (${error.message}). Please try again`;
		createChannelButton.innerText = 'Retry';
		flottformStateItemsContainer.replaceChildren(statusInformation);
		flottformStateItemsContainer.appendChild(createChannelButton);
	});
	return { flottformItem, statusInformation, refreshChannelButton, flottformStateItemsContainer };
};

const handleFileInputStates = ({
	flottformItem,
	statusInformation,
	refreshChannelButton,
	flottformStateItemsContainer,
	flottformFileInputHost,
	id,
	onSuccessText
}: {
	flottformItem: HTMLLIElement;
	statusInformation: HTMLDivElement;
	refreshChannelButton: HTMLButtonElement;
	flottformStateItemsContainer: HTMLDivElement;
	flottformFileInputHost: FlottformFileInputHost;
	id?: string;
	onSuccessText?: string;
}) => {
	if (id) {
		flottformItem.setAttribute('id', id);
	}

	flottformFileInputHost.on(
		'progress',
		({ currentFileProgress, overallProgress, fileIndex, totalFileCount, fileName }) => {
			removeConnectionStatusInformation(flottformStateItemsContainer);
			updateOverallFilesStatusBar(
				flottformStateItemsContainer,
				overallProgress,
				fileIndex,
				totalFileCount
			);
			const details = getDetailsOfFilesTransfer(flottformStateItemsContainer);
			updateCurrentFileStatusBar(
				fileIndex,
				fileName,
				currentFileProgress,
				details,
				flottformStateItemsContainer
			);
		}
	);
	flottformFileInputHost.on('done', () => {
		statusInformation.innerHTML =
			onSuccessText ?? `✨ You have succesfully downloaded all your files.`;
		statusInformation.appendChild(refreshChannelButton);
		flottformStateItemsContainer.replaceChildren(statusInformation);
	});
};

const handleTextInputStates = ({
	flottformItem,
	statusInformation,
	refreshChannelButton,
	flottformTextInputHost,
	id,
	onSuccessText
}: {
	flottformItem: HTMLLIElement;
	statusInformation: HTMLDivElement;
	refreshChannelButton: HTMLButtonElement;
	flottformTextInputHost: FlottformTextInputHost;
	id?: string;
	onSuccessText?: string;
}) => {
	if (id) {
		flottformItem.setAttribute('id', id);
	}
	flottformTextInputHost.on('done', (message: string) => {
		statusInformation.innerHTML = onSuccessText ?? `✨ You have succesfully submitted ${message}`;
		statusInformation.appendChild(refreshChannelButton);
		flottformItem.replaceChildren(statusInformation);
	});
};

const createFlottformOpenerButton = (flottformRootTitle: string | undefined) => {
	const flottformListOpenerButton = document.createElement('button');
	flottformListOpenerButton.setAttribute('type', 'button');
	flottformListOpenerButton.setAttribute('class', 'flottform-root-opener-button');
	flottformListOpenerButton.innerHTML = `<span>${flottformRootTitle ?? 'Fill from Another Device'}</span><svg class="flottform-opener-triangle" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5,8.5l6,7l6-7H6.5z"/></svg>`;
	flottformListOpenerButton.addEventListener('click', () => openInputsList());
	return flottformListOpenerButton;
};

const createFlottformItemsContainerWithTransition = (
	flottformRootDescription: string | undefined
) => {
	const flottformElementsContainer = document.createElement('div');
	flottformElementsContainer.setAttribute('class', 'flottform-elements-container');
	const flottformElementsContainerWrapper = document.createElement('div');
	flottformElementsContainerWrapper.setAttribute('class', 'flottform-elements-container-wrapper');
	if (flottformRootDescription !== '') {
		const flottformDescription = document.createElement('div');
		flottformDescription.setAttribute('class', 'flottform-root-description');
		flottformDescription.innerText =
			flottformRootDescription ??
			'This form is powered by Flottform. Need to add details from another device? Simply click a button below to generate a QR code or link, and easily upload information from your other device.';
		flottformElementsContainer.appendChild(flottformDescription);
	}
	const flottformItemsList = document.createElement('ul');
	flottformItemsList.setAttribute('class', 'flottform-inputs-list');
	flottformElementsContainer.appendChild(flottformItemsList);
	flottformElementsContainerWrapper.appendChild(flottformElementsContainer);
	return flottformElementsContainerWrapper;
};

const createFlottformListItem = (additionalItemClasses?: string) => {
	const flottformItem = document.createElement('li');
	flottformItem.setAttribute('class', `flottform-item${additionalItemClasses ?? ''}`);
	return flottformItem;
};

const createStatusInformation = () => {
	const statusInformation = document.createElement('div');
	statusInformation.setAttribute('class', 'flottform-status-information');
	return statusInformation;
};

const createStateItemsContainer = (createChannelButton: HTMLButtonElement) => {
	const flottformStateItemsContainer = document.createElement('div');
	flottformStateItemsContainer.setAttribute('class', 'flottform-state-items-container');
	flottformStateItemsContainer.appendChild(createChannelButton);
	return flottformStateItemsContainer;
};

const createFlottformChannelButton = (label: string | undefined) => {
	const createChannelButton = document.createElement('button');
	createChannelButton.setAttribute('type', 'button');
	createChannelButton.setAttribute('class', 'flottform-button');
	createChannelButton.innerText = label ?? 'Get a link';
	return createChannelButton;
};

const createFlottformChannelRefreshButton = () => {
	const refreshChannelButton = document.createElement('button');
	refreshChannelButton.setAttribute('type', 'button');
	refreshChannelButton.setAttribute('class', 'flottform-refresh-connection-button');
	refreshChannelButton.setAttribute(
		'title',
		'Click this button to refresh Flottform connection for the input field. Previous connection will be closed'
	);
	refreshChannelButton.setAttribute(
		'aria-label',
		'Click this button to refresh Flottform connection for the input field. Previous connection will be closed'
	);
	refreshChannelButton.innerHTML = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2c-5.288 0-9.649 3.914-10.377 9h-3.123l4 5.917 4-5.917h-2.847c.711-3.972 4.174-7 8.347-7 4.687 0 8.5 3.813 8.5 8.5s-3.813 8.5-8.5 8.5c-3.015 0-5.662-1.583-7.171-3.957l-1.2 1.775c1.916 2.536 4.948 4.182 8.371 4.182 5.797 0 10.5-4.702 10.5-10.5s-4.703-10.5-10.5-10.5z"/></svg>`;
	return refreshChannelButton;
};

// Set an index for inputs for an edge cases when user hasn't provided a label and input has no id or name
let inputIndex = 1;

const setLabelForFlottformItem = ({
	label,
	flottformItem
}: {
	label: string | undefined;
	flottformItem: HTMLLIElement;
}) => {
	const inputLabel = document.createElement('p');
	const labelContent = label ?? `File input ${inputIndex++}`;
	if (labelContent) {
		inputLabel.innerHTML = labelContent;
		flottformItem.appendChild(inputLabel);
	}
};

const createCopyToClipboardButton = () => {
	const copyToClipboardButton = document.createElement('button');
	copyToClipboardButton.setAttribute('class', 'flottform-copy-to-clipboard');
	copyToClipboardButton.setAttribute('type', 'button');
	copyToClipboardButton.setAttribute('title', 'Copy Flottform link to clipboard');
	copyToClipboardButton.setAttribute('aria-label', 'Copy Flottform link to clipboard');
	copyToClipboardButton.innerText = '📋';
	copyToClipboardButton.addEventListener('click', async () => {
		let flottformLink = (document.querySelector('.flottform-link-offer') as HTMLDivElement)
			.innerText;
		navigator.clipboard
			.writeText(flottformLink)
			.then(() => {
				copyToClipboardButton.innerText = '✅';
				setTimeout(() => {
					copyToClipboardButton.innerText = '📋';
				}, 1000);
			})
			.catch((error) => {
				copyToClipboardButton.innerText = `❌ Failed to copy: ${error}`;
				setTimeout(() => {
					copyToClipboardButton.innerText = '📋';
				}, 1000);
			});
	});
	return copyToClipboardButton;
};

const removeConnectionStatusInformation = (flottformStateItemsContainer: HTMLDivElement) => {
	const connectionStatusInformation = flottformStateItemsContainer.querySelector(
		'.flottform-status-information'
	);
	if (connectionStatusInformation) {
		// Remove the connection status information
		flottformStateItemsContainer.innerHTML = '';
	}
};

const getDetailsOfFilesTransfer = (flottformStateItemsContainer: HTMLDivElement) => {
	let details = flottformStateItemsContainer.querySelector('details');
	if (!details) {
		details = document.createElement('details');
		const summary = document.createElement('summary');
		summary.innerText = 'Details';
		details.appendChild(summary);
		const detailsContainer = document.createElement('div');
		detailsContainer.classList.add('details-container');
		details.appendChild(detailsContainer);
		flottformStateItemsContainer.appendChild(details);
	}
	return details;
};

const createCurrentFileStatusBar = (fileIndex: number, fileName: string) => {
	const currentFileLabel = document.createElement('label');
	currentFileLabel.setAttribute('id', `flottform-status-bar-${fileIndex}`);
	currentFileLabel.classList.add('flottform-progress-bar-label');
	currentFileLabel.innerText = `File ${fileName} progress:`;

	const progressBar = document.createElement('progress');
	progressBar.setAttribute('id', `flottform-status-bar-${fileIndex}`);
	progressBar.classList.add('flottform-status-bar');
	progressBar.setAttribute('max', '100');
	progressBar.setAttribute('value', '0');

	return { currentFileLabel, progressBar };
};

const updateCurrentFileStatusBar = (
	fileIndex: number,
	fileName: string,
	currentFileProgress: number,
	details: HTMLDetailsElement,
	flottformStateItemsContainer: HTMLDivElement
) => {
	let currentFileStatusBar: HTMLProgressElement | null = flottformStateItemsContainer.querySelector(
		`progress#flottform-status-bar-${fileIndex}`
	);
	if (!currentFileStatusBar) {
		let { currentFileLabel, progressBar } = createCurrentFileStatusBar(fileIndex, fileName);
		currentFileStatusBar = progressBar;

		const detailsContainer = details.querySelector('.details-container')!;

		detailsContainer.appendChild(currentFileLabel);
		detailsContainer.appendChild(currentFileStatusBar);
	}
	currentFileStatusBar.value = currentFileProgress * 100;
	currentFileStatusBar.innerText = `${currentFileProgress * 100}%`;
};

const createOverallFilesStatusBar = () => {
	const overallFilesLabel = document.createElement('label');
	overallFilesLabel.setAttribute('id', 'flottform-status-bar-overall-progress');
	overallFilesLabel.classList.add('flottform-progress-bar-label');
	overallFilesLabel.innerText = 'Receiving Files Progress';

	const progressBar = document.createElement('progress');
	progressBar.setAttribute('id', 'flottform-status-bar-overall-progress');
	progressBar.classList.add('flottform-status-bar');
	progressBar.setAttribute('max', '100');
	progressBar.setAttribute('value', '0');

	return { overallFilesLabel, progressBar };
};

const updateOverallFilesStatusBar = (
	flottformStateItemsContainer: HTMLDivElement,
	overallProgress: number,
	fileIndex: number,
	totalFileCount: number
) => {
	let overallFilesStatusBar: HTMLProgressElement | null =
		flottformStateItemsContainer.querySelector('progress#flottform-status-bar-overall-progress');
	if (!overallFilesStatusBar) {
		let { overallFilesLabel, progressBar } = createOverallFilesStatusBar();
		overallFilesStatusBar = progressBar;

		flottformStateItemsContainer.appendChild(overallFilesLabel);
		flottformStateItemsContainer.appendChild(overallFilesStatusBar);
	}
	let overallFilesLabel: HTMLLabelElement = flottformStateItemsContainer.querySelector(
		'label#flottform-status-bar-overall-progress'
	)!;
	overallFilesStatusBar.value = overallProgress * 100;
	overallFilesStatusBar.innerText = `${overallProgress * 100}%`;
	overallFilesLabel.innerText = `Receiving file ${fileIndex + 1} of ${totalFileCount}`;
};
