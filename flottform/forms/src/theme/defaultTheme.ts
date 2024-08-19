import { FlottformFileInputHost } from '../flottform-file-input-host';

const openInputsList = () => {
	const flottformList: HTMLUListElement = document.querySelector('.flottform-inputs-list')!;
	const flottformButtonHeight: number = (
		document.querySelector('.flottform-root-opener-button')! as HTMLButtonElement
	).offsetHeight;
	const openerSvg: SVGElement = document.querySelector('.flottform-opener-triangle')!;
	const open = flottformList.classList.toggle('flottform-open');

	if (open) {
		const height = flottformList.scrollHeight + 'px';
		flottformList.style.height = height;
		flottformList.style.visibility = 'visible';
		flottformList.style.maxHeight = `calc(100dvh - ${flottformButtonHeight}px)`;
		flottformList.style.overflowY = 'auto';

		flottformList.addEventListener('transitionend', function handler() {
			flottformList.style.height = 'auto';
			flottformList.removeEventListener('transitionend', handler);
		});
	} else {
		flottformList.style.height = flottformList.scrollHeight + 'px';
		requestAnimationFrame(() => {
			flottformList.style.height = '0';
		});
		flottformList.style.visibility = 'hidden';
	}

	openerSvg.style.rotate = open ? '180deg' : '0deg';
};

const addCss = () => {
	const head = document.head;
	const link = document.createElement('style');

	link.innerHTML = `
		.flottform-root {
			border: 1px solid gray;
			border-radius: 0px 0px 10px 10px;
			position: absolute;
			right: 0;
			display: grid;
			background: white;
			width: 250px;
			overflow: hidden;
		}
		.flottform-root-opener-button {
			font-size: 1rem;
			font-weight: 800;
			padding: 1rem 0.5rem;
			display: flex;
			gap: 0.25rem;
		}
		.flottform-inputs-list {
			height: 0;
			visibility: hidden;
			overflow: hidden;
			transition: height 0.25s ease-out, visibility 0.25s ease-out;
		}
		.flottform-inputs-list.flottform-open {
			border-top: 1px solid;
		}
		.flottform-item {
			padding: 1rem 0.5rem;
			border-bottom: 1px solid;
			display: grid;
			gap: 1rem;
		}
		.flottform-item:last-child {
			border-bottom: none;
		}
		.flottform-button {
			padding: 4px 8px;
			background: blue;
			border-radius: 10px;
			color: white;
			width: fit-content;
		}

		.flottform-qr-code {
			width: 150px;
		}
		.flottform-link-offer {
			width: 230px;
			display: inline-block;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}
		.flottform-status-information {
			display: flex;
			gap: 1rem;
			justify-content: space-between;
		}
		.flottform-progress-bar-label {
    		text-overflow: clip;
    		word-break: break-word;
		}
		.flottform-status-bar {
			height: 1rem;
			width: 100%;
			border-radius: 8px;
			overflow: hidden;
			background-color: #f2f1fe;
			box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
			-webkit-appearance: none;
			appearance: none;
		}

		.flottform-status-bar::-webkit-progress-bar {
			border-radius: 8px;
			background-color: #f2f1fe;
		}

		.flottform-status-bar::-webkit-progress-value {
			border-radius: 8px;
			background-image: linear-gradient(270deg, #6a11cb, #2575fc);
			transition: background-color 0.5s ease-in-out;
		}

		.flottform-status-bar::-moz-progress-bar {
			border-radius: 8px;
			background-image: linear-gradient(270deg, #6a11cb, #2575fc);
			transition: background-color 0.5s ease-in-out;
		}

		details {
			background-color: #fafafe;
			border: 1px solid gray;
  			border-radius: 5px;
			padding:  0.75rem;
		}

		details summary {
			padding: 0.5rem;
  			border-radius: 5px;
		}

		details .details-container {
			max-height: 12rem;
  			overflow-y: scroll;
		}

		details[open] summary {
			background-color: #fafafe;
		}

		details .flottform-progress-bar-label{
			font-size: 0.75rem;
		}

		details .flottform-status-bar {
			height: 0.5rem;
			border: 1px solid #e5e7eb;
		}
	`;

	head.appendChild(link);
};

const initRoot = () => {
	addCss();
	const flottformRoot = document.createElement('div');
	flottformRoot.setAttribute('class', 'flottform-root');
	const flottformListOpenerButton = document.createElement('button');
	flottformListOpenerButton.setAttribute('class', 'flottform-root-opener-button');
	flottformListOpenerButton.innerHTML =
		'<span>Connect your other device</span><svg class="flottform-opener-triangle" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5,8.5l6,7l6-7H6.5z"/></svg>';
	flottformListOpenerButton.addEventListener('click', () => openInputsList());
	flottformRoot.appendChild(flottformListOpenerButton);
	const flottformItemsList = document.createElement('ul');
	flottformItemsList.setAttribute('class', 'flottform-inputs-list');
	flottformRoot.appendChild(flottformItemsList);
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
	(
		options: {
			id?: string;
			flottformRootElement?: HTMLElement;
			additionalItemClasses?: string;
		} = {}
	) =>
	(flottformBaseInputHost: FlottformFileInputHost) => {
		// create elements (one of them being a button with "flottformFileInputHost.start()")
		const flottformRoot =
			options.flottformRootElement ?? document.querySelector('.flottform-root') ?? initRoot();
		const flottformItem = document.createElement('li');
		flottformItem.setAttribute('class', `flottform-item${options.additionalItemClasses ?? ''}`);
		const statusInformation = document.createElement('div');
		statusInformation.setAttribute('class', 'flottform-status-information');
		const createChannelButton = document.createElement('button');
		createChannelButton.setAttribute('type', 'button');
		createChannelButton.setAttribute('class', 'flottform-button');
		createChannelButton.innerText = 'Get a link';
		createChannelButton.addEventListener('click', () => flottformBaseInputHost.start());
		flottformItem.appendChild(createChannelButton);
		const refreshChannelButton = document.createElement('button');
		refreshChannelButton.setAttribute('class', 'flottform-refresh-connection-button');
		refreshChannelButton.setAttribute(
			'aria-label',
			'Click this button to refresh Flottform connection for the input field.'
		);
		refreshChannelButton.innerHTML = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2c-5.288 0-9.649 3.914-10.377 9h-3.123l4 5.917 4-5.917h-2.847c.711-3.972 4.174-7 8.347-7 4.687 0 8.5 3.813 8.5 8.5s-3.813 8.5-8.5 8.5c-3.015 0-5.662-1.583-7.171-3.957l-1.2 1.775c1.916 2.536 4.948 4.182 8.371 4.182 5.797 0 10.5-4.702 10.5-10.5s-4.703-10.5-10.5-10.5z"/></svg>`;
		refreshChannelButton.addEventListener('click', () => flottformBaseInputHost.start());
		// listen to events -> change elements depending on them
		flottformBaseInputHost.on('endpoint-created', ({ link, qrCode }) => {
			const { createChannelQrCode, createChannelLinkWithOffer } = createLinkAndQrCode(qrCode, link);
			flottformItem.replaceChildren(createChannelQrCode);
			flottformItem.appendChild(createChannelLinkWithOffer);
		});
		flottformBaseInputHost.on('connected', () => {
			statusInformation.innerHTML = 'Connected';
			statusInformation.appendChild(refreshChannelButton);
			flottformItem.replaceChildren(statusInformation);
		});
		flottformBaseInputHost.on('error', (error) => {
			statusInformation.innerHTML = `An error occured 🚨 (${error.message}). Please try again`;
			createChannelButton.innerText = 'Retry';
			flottformItem.replaceChildren(statusInformation);
			flottformItem.appendChild(createChannelButton);
		});
		const flottformItemsList = flottformRoot.querySelector('.flottform-inputs-list')!;
		flottformItemsList.appendChild(flottformItem);
		flottformRoot.appendChild(flottformItemsList);
		document.body.append(flottformRoot);
		return {
			flottformRoot,
			flottformItem,
			statusInformation,
			refreshChannelButton,
			createChannelButton
		};
	};
export const defaultThemeForFileInput =
	(options: { id?: string; additionalItemClasses?: string } = {}) =>
	(flottformFileInputHost: FlottformFileInputHost) => {
		const { flottformItem, statusInformation, refreshChannelButton } =
			defaultThemeForAnyInput(options)(flottformFileInputHost);
		if (options.id) {
			flottformItem.setAttribute('id', options.id);
		}
		// create elements (one of them being a button with "flottformFileInputHost.start()")

		// listen to events -> change elements depending on them

		flottformFileInputHost.on(
			'progress',
			({ currentFileProgress, overallProgress, fileIndex, fileName }) => {
				removeConnectionStatusInformation(flottformItem);
				updateOverallFilesStatusBar(flottformItem, overallProgress);
				const details = getDetailsOfFilesTransfer(flottformItem);
				updateCurrentFileStatusBar(
					fileIndex,
					fileName,
					currentFileProgress,
					details,
					flottformItem
				);
			}
		);
		flottformFileInputHost.on('disconnected', () => {
			statusInformation.innerHTML = `You have ✨ succesfully downloaded ✨ all your files.`;
			statusInformation.appendChild(refreshChannelButton);
			flottformItem.replaceChildren(statusInformation);
		});
	};

const removeConnectionStatusInformation = (flottformItem: HTMLLIElement) => {
	const connectionStatusInformation = flottformItem.querySelector('.flottform-status-information');
	if (connectionStatusInformation) {
		// Remove the connection status information
		flottformItem.innerHTML = '';
	}
};

const getDetailsOfFilesTransfer = (flottformItem: HTMLLIElement) => {
	let details = flottformItem.querySelector('details');
	if (!details) {
		details = document.createElement('details');
		const summary = document.createElement('summary');
		summary.innerText = 'Details';
		details.appendChild(summary);
		const detailsContainer = document.createElement('div');
		detailsContainer.classList.add('details-container');
		details.appendChild(detailsContainer);
		flottformItem.appendChild(details);
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
	flottformItem: HTMLLIElement
) => {
	let currentFileStatusBar: HTMLProgressElement | null = flottformItem.querySelector(
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

const updateOverallFilesStatusBar = (flottformItem: HTMLLIElement, overallProgress: number) => {
	let overallFilesStatusBar: HTMLProgressElement | null = flottformItem.querySelector(
		'progress#flottform-status-bar-overall-progress'
	);
	if (!overallFilesStatusBar) {
		let { overallFilesLabel, progressBar } = createOverallFilesStatusBar();
		overallFilesStatusBar = progressBar;

		flottformItem.appendChild(overallFilesLabel);
		flottformItem.appendChild(overallFilesStatusBar);
	}
	overallFilesStatusBar.value = overallProgress * 100;
	overallFilesStatusBar.innerText = `${overallProgress * 100}%`;
};
