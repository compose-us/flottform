import { FlottformFileInputHost } from '../flottform-file-input-host';

const openInputsList = () => {
	const flottformList: HTMLUListElement | null = document.querySelector('.flottform-inputs-list');
	const openerSvg: SVGElement | null = document.querySelector('.flottform-opener-triangle');
	const open = flottformList!.classList.toggle('flottform-open');

	if (open) {
		const height = flottformList!.scrollHeight + 'px';
		flottformList!.style.height = height;
		flottformList!.style.visibility = 'visible';

		flottformList!.addEventListener('transitionend', function handler() {
			flottformList!.style.height = 'auto';
			flottformList!.removeEventListener('transitionend', handler);
		});
	} else {
		flottformList!.style.height = flottformList!.scrollHeight + 'px';
		requestAnimationFrame(() => {
			flottformList!.style.height = '0';
		});
		flottformList!.style.visibility = 'hidden';
	}

	openerSvg!.style.rotate = open ? '180deg' : '0deg';
};

const addCss = (cssFileName?: string) => {
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
	`;

	// const link = document.createElement('link');
	// link.type = 'text/css';
	// link.rel = 'stylesheet';
	// link.href = cssFileName;

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
		flottformItem.setAttribute('class', `flottform-item ${options.additionalItemClasses ?? ''}`);
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
		const { flottformItem, statusInformation, refreshChannelButton, createChannelButton } =
			defaultThemeForAnyInput(options)(flottformFileInputHost);
		if (options.id) {
			flottformItem.setAttribute('id', options.id);
		}
		// create elements (one of them being a button with "flottformFileInputHost.start()")

		// listen to events -> change elements depending on them

		const progressBars: Array<HTMLProgressElement | null> = [];

		flottformFileInputHost.on(
			'progress',
			({ currentFileProgress, overallProgress, fileIndex, fileName }) => {
				if (!progressBars[fileIndex]) {
					const statusBar = document.createElement('div');
					statusBar.innerHTML = `<label for="flottform-status-bar-${fileIndex}" class="flottform-progress-bar-label">File ${fileName} progress:</label><progress id="flottform-status-bar-${fileIndex}" max="100" value="0" class="flottform-status-bar"></progress>`;
					flottformItem.appendChild(statusBar);

					progressBars[fileIndex] = statusBar.querySelector('.flottform-status-bar');
				}

				progressBars[fileIndex]!.value = currentFileProgress * 100;
				progressBars[fileIndex]!.innerText = `${currentFileProgress * 100}%`;
			}
		);
		flottformFileInputHost.on('disconnected', () => {
			statusInformation.innerHTML = `You have ✨ succesfully downloaded ✨ all your files.`;
			statusInformation.appendChild(refreshChannelButton);
			flottformItem.replaceChildren(statusInformation);
		});
	};
