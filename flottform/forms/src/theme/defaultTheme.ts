import { FlottformFileInputHost } from '../flottform-file-input-host';

interface FlottformThemeOptions {
	id?: string;
	flottformRootElement?: HTMLElement;
	additionalItemClasses?: string;
	label?: string;
	buttonLabel?: string;
	flottformRootTitle?: string;
	flottformRootDescription?: string;
	onErrorText?: string;
	onSuccessText?: string;
}

const openInputsList = () => {
	const flottformHeightTransitionContainer: HTMLDivElement = document.querySelector(
		'.flottform-height-transition-container'
	)!;
	const openerSvg: SVGElement = document.querySelector('.flottform-opener-triangle')!;
	flottformHeightTransitionContainer.classList.toggle('flottform-open');
	openerSvg.classList.toggle('flottform-button-svg-open');
};

const initRoot = (flottformRootTitle?: string, flottformRootDescription?: string) => {
	const flottformRoot = document.createElement('div');
	flottformRoot.setAttribute('class', 'flottform-root');
	const flottformListOpenerButton = createFlottformOpenerButton(flottformRootTitle);
	flottformRoot.appendChild(flottformListOpenerButton);
	const flottformHeightTransitionContainer =
		createFlottformItemsContainerWithTransition(flottformRootDescription);
	flottformRoot.appendChild(flottformHeightTransitionContainer);
	return flottformRoot;
};

const createLinkAndQrCode = (qrCode: string, link: string) => {
	const createChannelQrCode = document.createElement('img');
	createChannelQrCode.setAttribute('class', 'flottform-qr-code');
	createChannelQrCode.setAttribute('src', qrCode);

	const createChannelLinkWithOffer = document.createElement('a');
	createChannelLinkWithOffer.setAttribute('class', 'flottform-link-offer');
	createChannelLinkWithOffer.setAttribute('href', link);
	createChannelLinkWithOffer.setAttribute('target', '_blank');
	createChannelLinkWithOffer.innerHTML = link;
	return {
		createChannelQrCode,
		createChannelLinkWithOffer
	};
};
const defaultThemeForAnyInput =
	(inputField?: HTMLInputElement, options: FlottformThemeOptions = {}) =>
	(flottformBaseInputHost: FlottformFileInputHost) => {
		const flottformRoot =
			options.flottformRootElement ??
			document.querySelector('.flottform-root') ??
			initRoot(options.flottformRootTitle, options.flottformRootDescription);
		const flottformItem = document.createElement('li');
		flottformItem.setAttribute('class', `flottform-item${options.additionalItemClasses ?? ''}`);
		inputField && setLabelForFlottformItem(inputField, options.label, flottformItem);
		const statusInformation = document.createElement('div');
		statusInformation.setAttribute('class', 'flottform-status-information');
		const createChannelButton = createFlottformChannelButton(options.buttonLabel);
		createChannelButton.addEventListener('click', () => flottformBaseInputHost.start());
		const flottformStateItemsContainer = document.createElement('div');
		flottformStateItemsContainer.setAttribute('class', 'flottform-state-items-container');
		flottformStateItemsContainer.appendChild(createChannelButton);
		flottformItem.appendChild(flottformStateItemsContainer);
		const refreshChannelButton = createFlottformChannelRefreshButton();
		refreshChannelButton.addEventListener('click', () => flottformBaseInputHost.start());

		// listen to events -> change elements depending on them
		flottformBaseInputHost.on('endpoint-created', ({ link, qrCode }) => {
			const { createChannelQrCode, createChannelLinkWithOffer } = createLinkAndQrCode(qrCode, link);
			flottformStateItemsContainer.replaceChildren(createChannelQrCode);
			flottformStateItemsContainer.appendChild(createChannelLinkWithOffer);
		});
		flottformBaseInputHost.on('connected', () => {
			statusInformation.innerHTML = 'Connected';
			statusInformation.appendChild(refreshChannelButton);
			flottformStateItemsContainer.replaceChildren(statusInformation);
		});
		flottformBaseInputHost.on('error', (error) => {
			statusInformation.innerHTML =
				options.onErrorText ?? `An error occured 🚨 (${error.message}). Please try again`;
			createChannelButton.innerText = 'Retry';
			flottformStateItemsContainer.replaceChildren(statusInformation);
			flottformStateItemsContainer.appendChild(createChannelButton);
		});
		const flottformItemsList = flottformRoot.querySelector('.flottform-inputs-list')!;
		const flottformElementsContainer = flottformRoot.querySelector(
			'.flottform-elements-container'
		)!;
		const flottformHeightTransitionContainer = flottformRoot.querySelector(
			'.flottform-height-transition-container'
		)!;
		flottformItemsList.appendChild(flottformItem);
		flottformElementsContainer.appendChild(flottformItemsList);
		flottformHeightTransitionContainer.appendChild(flottformElementsContainer);
		flottformRoot.appendChild(flottformHeightTransitionContainer);
		document.body.append(flottformRoot);
		return {
			flottformRoot,
			flottformItem,
			flottformStateItemsContainer,
			statusInformation,
			refreshChannelButton,
			createChannelButton
		};
	};
export const defaultThemeForFileInput =
	(inputField: HTMLInputElement, options: FlottformThemeOptions = {}) =>
	(flottformFileInputHost: FlottformFileInputHost) => {
		const { flottformItem, statusInformation, refreshChannelButton, flottformStateItemsContainer } =
			defaultThemeForAnyInput(inputField, options)(flottformFileInputHost);
		if (options.id) {
			flottformItem.setAttribute('id', options.id);
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
		flottformFileInputHost.on('disconnected', () => {
			statusInformation.innerHTML =
				options.onSuccessText ?? `You have ✨ succesfully downloaded ✨ all your files.`;
			statusInformation.appendChild(refreshChannelButton);
			flottformItem.replaceChildren(statusInformation);
		});
	};

const createFlottformOpenerButton = (flottformRootTitle: string | undefined) => {
	const flottformListOpenerButton = document.createElement('button');
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
	const flottformHeightTransitionContainer = document.createElement('div');
	flottformHeightTransitionContainer.setAttribute('class', 'flottform-height-transition-container');
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
	flottformHeightTransitionContainer.appendChild(flottformElementsContainer);
	return flottformHeightTransitionContainer;
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

const setLabelForFlottformItem = (
	inputField: HTMLInputElement,
	label: string | undefined,
	flottformItem: HTMLLIElement
) => {
	if (inputField) {
		const inputLabel = document.createElement('p');
		const inputAttributes = inputField.id || inputField.name || `File input ${inputIndex++}`;
		const labelContent =
			label ??
			(inputAttributes && inputAttributes.replace(/^./, inputAttributes[0]!.toLocaleUpperCase())) ??
			'';
		if (labelContent) {
			inputLabel.innerHTML = labelContent;
			flottformItem.appendChild(inputLabel);
		}
	}
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
