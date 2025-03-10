<script lang="ts">
	import { onMount } from 'svelte';
	import {
		defaultGetIceServersEndpoint,
		defaultSignalingServerUrlBase,
		defaultExtensionClientUrlBase
	} from '$lib/options';
	import type * as Flottform from '@flottform/forms';
	import { isOfTypeRTCIceServer } from '$lib/isOfTypeRTCIceServer';

	type TrackedInputFields = Array<{
		id: string;
		type: string;
		connectionState: { event: string; data?: any };
		label: string | undefined | null;
	}>;

	let inputFields: TrackedInputFields = $state([]);
	let currentTabId: number | undefined;
	let getIceServersEndpoint = $state('');
	let iceServers: RTCIceServer[] | undefined;
	let signalingServerUrlBase: string = '';
	let extensionClientUrlBase: string = '';

	// TODO remove all listeners and flottform processes
	const removeSavedInputs = async () => {
		// It'll remove all the data stored inside `chrome.storage.local`
		chrome.storage.local.set({ [`inputFields-${currentTabId}`]: [] });
		inputFields = [];

		const flottformModuleFile = chrome.runtime.getURL('scripts/flottform-bundle.js');
		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [currentTabId, flottformModuleFile],
			func: async (currentTabId, flottformModuleFile: string) => {
				const fm: typeof Flottform = await import(flottformModuleFile);
				const { ConnectionManager } = fm;

				const connectionManager = ConnectionManager.getInstance();
				connectionManager.closeAllConnections();
				console.log(
					'All connections should be closed Now, connectionManager = ',
					connectionManager
				);
			}
		});
	};

	const extractInputFieldsFromCurrentPage = async () => {
		await removeSavedInputs();
		console.log('Searching for input fields in page');
		const injectionResult = await chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [currentTabId],
			func: async (currentTabId) => {
				window.___flottform_map ??= new Map<string, HTMLElement>();
				const inputFields: TrackedInputFields = Array.from(
					document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLElement>(
						'input[type="text"],input[type="file"],input[type="password"],textarea,*[contenteditable="true"]'
					)
				).map((input, index) => {
					const ourMap = window.___flottform_map;
					const inputId = `input-${index}`;
					ourMap.set(inputId, input);
					let nearestLabel: HTMLLabelElement | null = input.id
						? document.querySelector(`label[for="${input.id}"]`)
						: null;
					nearestLabel ??= input.closest('label');

					let labelText = nearestLabel?.innerText;
					if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
						if (!labelText && input.ariaLabel) {
							labelText = `${input.ariaLabel} (${input.type})`;
						} else if (!labelText && input.placeholder) {
							labelText = `${input.placeholder} (${input.type})`;
						} else if (!labelText && input.name) {
							labelText = `${input.name} (${input.type})`;
						} else if (!labelText && input.id) {
							labelText = `${input.id} (${input.type})`;
						} else {
							labelText = `${inputId} (${input.type})`;
						}
					} else {
						if (!labelText && input.ariaLabel) {
							labelText = `${input.ariaLabel} (contenteditable ${input.tagName})`;
						} else if (!labelText && input.id) {
							labelText = `${input.id} (contenteditable ${input.tagName})`;
						} else {
							labelText = `${inputId} (contenteditable ${input.tagName})`;
						}
					}

					return {
						id: inputId,
						type: input instanceof HTMLInputElement && input.type === 'file' ? 'file' : 'text',
						label: labelText,
						connectionState: { event: 'new' }
					};
				});
				// Save the input fields to the chrome storage
				chrome.storage.local.set({ [`inputFields-${currentTabId}`]: inputFields });
				return inputFields;
			}
		});
		console.log(`Found ${injectionResult.length} input fields.`);

		const potentialResult = injectionResult[0]?.result;
		if (!potentialResult) {
			console.error('Injected Code is did not work properly !');
			return;
		}

		console.log('Updating inputFields', potentialResult);
		inputFields = potentialResult;
	};

	const getCurrentTabId = async () => {
		if (currentTabId === undefined) {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			currentTabId = tab.id!;
		}
		return currentTabId;
	};

	const startFlottformProcess = async (inputFieldId: string, inputFieldType: string) => {
		// Wait for the current tab Id to be available!
		const tabId = await getCurrentTabId();
		//console.log(`**** Starting the process for the TAB-${tabId} ****`);

		// Inject the bundled flottform script into the page context
		const flottformModuleFile = chrome.runtime.getURL('scripts/flottform-bundle.js');
		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [
				flottformModuleFile,
				inputFieldId,
				tabId,
				inputFieldType,
				getIceServersEndpoint,
				signalingServerUrlBase,
				extensionClientUrlBase,
				iceServers
			],
			func: async (
				flottformModuleFile: string,
				inputFieldId: string,
				tabId: number,
				inputFieldType: string,
				getIceServersEndpoint: string,
				signalingServerUrlBase: string,
				extensionClientUrlBase: string,
				iceServers: RTCIceServer[] | undefined
			) => {
				const fm: typeof Flottform = await import(flottformModuleFile);
				const { FlottformTextInputHost, FlottformFileInputHost, ConnectionManager } = fm;
				const connectionManager = ConnectionManager.getInstance();

				if (inputFieldType === 'text' || inputFieldType === 'password') {
					startFlottformTextInputProcess(inputFieldId, tabId, inputFieldType);
				} else {
					startFlottformFileInputProcess(inputFieldId, tabId);
				}

				function handleFlottformEvent(event: string, data: any, id: string, currentTabId: number) {
					// Get the latest updated version of the array inputFields instead of passing it as a parameter to `chrome.scripting.executeScript`!
					chrome.storage.local.get([`inputFields-${tabId}`], (result) => {
						if (result[`inputFields-${tabId}`]) {
							const latestVersionOfInputFields: TrackedInputFields = result[`inputFields-${tabId}`];
							const updatedInputFields = latestVersionOfInputFields.map((inputField) => {
								if (inputField.id === id) {
									return { ...inputField, connectionState: { event, data } };
								}
								return inputField;
							});

							updateSavedInputs(updatedInputFields, currentTabId);
						}
					});
				}

				async function updateSavedInputs(
					updatedInputFields: TrackedInputFields,
					currentTabId: number
				) {
					// Update the UI and the local storage
					await chrome.storage.local.set({ [`inputFields-${currentTabId}`]: updatedInputFields });
				}

				function registerFlottformTextInputListeners(
					flottformTextInputHost: any,
					textInputId: string,
					currentTabId: number
				) {
					// Listen to events from FlottformTextInputHost and send them to the popup after updating TrackedInputFields array and saving it using chrome.storage.local
					flottformTextInputHost.on(
						'endpoint-created',
						({ link, qrCode }: { link: string; qrCode: string }) => {
							handleFlottformEvent('endpoint-created', { link, qrCode }, textInputId, currentTabId);
						}
					);

					flottformTextInputHost.on('connected', () => {
						handleFlottformEvent('connected', undefined, textInputId, currentTabId);
					});

					flottformTextInputHost.on('error', (error: Error) => {
						handleFlottformEvent('error', { message: error.message }, textInputId, currentTabId);
					});

					flottformTextInputHost.on('done', (message: string) => {
						handleFlottformEvent('done', undefined, textInputId, currentTabId);

						const ourMap = window.___flottform_map;
						const targetedTextField: HTMLInputElement | HTMLTextAreaElement | null =
							ourMap.get(textInputId);
						if (!targetedTextField) {
							console.warn(
								`Flottform Can't assign the received message (${message}) to the targeted Text input field`
							);
							return;
						}
						if (
							targetedTextField.tagName.toLocaleLowerCase() === 'input' ||
							targetedTextField.tagName.toLocaleLowerCase() === 'textarea'
						) {
							targetedTextField.value = message;
						} else {
							targetedTextField.innerText = message;
						}
						targetedTextField.dispatchEvent(new Event('change', { bubbles: true }));
						targetedTextField.dispatchEvent(new Event('input', { bubbles: true }));
						// Channel will be closed since we won't receive data anymore.
						flottformTextInputHost.close();
					});
				}

				function startFlottformTextInputProcess(
					textInputId: string,
					currentTabId: number,
					inputFieldType: string
				) {
					// Query the doc with the ID: textInputId in order to find the input field where you'll paste the text.
					const data = {
						type: inputFieldType,
						getIceApi: getIceServersEndpoint,
						flottformApi: signalingServerUrlBase
					};
					// Instantiate the FlottformTextInputHost with the provided inputId
					let flottformTextInputHost = new FlottformTextInputHost({
						createClientUrl: async ({
							endpointId,
							encryptionKey
						}: {
							endpointId: string;
							encryptionKey: string;
						}) =>
							`${extensionClientUrlBase}/${endpointId}/#${encodeURIComponent(JSON.stringify({ encKey: encryptionKey, ...data }))}`,
						flottformApi: signalingServerUrlBase,
						...(iceServers ? { rtcConfiguration: { iceServers } } : {})
					});

					flottformTextInputHost.start();

					// Track instances of FlottformTextInputHost
					connectionManager.addConnection(textInputId, flottformTextInputHost);
					console.log('connectionManager: ', connectionManager);

					registerFlottformTextInputListeners(flottformTextInputHost, textInputId, currentTabId);
				}

				function startFlottformFileInputProcess(fileInputId: string, currentTabId: number) {
					const ourMap = window.___flottform_map;
					const targetedInputField = ourMap.get(fileInputId);
					if (!targetedInputField) {
						console.warn(
							"Flottform Can't assign the received file to the targeted file input field"
						);
						return;
					}

					const data = {
						type: 'file',
						flottformApi: signalingServerUrlBase,
						getIceApi: getIceServersEndpoint
					};

					// Instantiate the FlottformFileInputHost with the provided inputId
					let flottformFileInputHost = new FlottformFileInputHost({
						createClientUrl: async ({
							endpointId,
							encryptionKey
						}: {
							endpointId: string;
							encryptionKey: string;
						}) =>
							`${extensionClientUrlBase}/${endpointId}/#${encodeURIComponent(JSON.stringify({ encKey: encryptionKey, ...data }))}`,
						flottformApi: signalingServerUrlBase,
						inputField: targetedInputField,
						...(iceServers ? { rtcConfiguration: { iceServers } } : {})
					});

					flottformFileInputHost.start();

					// Track instances of FlottformFileInputHost
					connectionManager.addConnection(fileInputId, flottformFileInputHost);

					registerFlottformFileInputListeners(flottformFileInputHost, fileInputId, currentTabId);
				}

				function registerFlottformFileInputListeners(
					flottformFileInputHost: Flottform.FlottformFileInputHost,
					fileInputId: string,
					currentTabId: number
				) {
					flottformFileInputHost.on(
						'endpoint-created',
						({ link, qrCode }: { link: string; qrCode: string }) => {
							handleFlottformEvent('endpoint-created', { link, qrCode }, fileInputId, currentTabId);
						}
					);

					flottformFileInputHost.on('connected', () => {
						handleFlottformEvent('connected', undefined, fileInputId, currentTabId);
					});

					flottformFileInputHost.on(
						'progress',
						({ fileIndex, totalFileCount, fileName, currentFileProgress, overallProgress }) => {
							if (
								((currentFileProgress * 100) % 10 === 0 && currentFileProgress < 0.85) ||
								currentFileProgress > 0.85
							) {
								console.log(`'currentFileProgress'= ${currentFileProgress}`);
								// Limit the amount of times we update the progress bar in chrome.storage.local
								handleFlottformEvent(
									'progress',
									{ fileIndex, totalFileCount, fileName, currentFileProgress, overallProgress },
									fileInputId,
									currentTabId
								);
							}
						}
					);

					flottformFileInputHost.on('error', (error: Error) => {
						handleFlottformEvent('error', { message: error.message }, fileInputId, currentTabId);
					});

					flottformFileInputHost.on('done', () => {
						handleFlottformEvent('done', undefined, fileInputId, currentTabId);
						// TODO: HANDLE THE DONE PROCESS
						const ourMap = window.___flottform_map;
						const targetFileInput: HTMLInputElement = ourMap.get(fileInputId);
						targetFileInput.dispatchEvent(new Event('change', { bubbles: true }));
						targetFileInput.dispatchEvent(new Event('input', { bubbles: true }));
					});
				}
			}
		});
	};

	const clearOutdatedTables = async () => {
		// Wait for the current tab Id to be available!
		const currentTabId = await getCurrentTabId();

		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [currentTabId],
			func: async (currentTabId) => {
				// We have to find a way to add this listener only once & we have to handle single page applications since beforeunload doesn't work for those SPAs!
				window.addEventListener('beforeunload', () => {
					chrome.storage.local.set({ [`inputFields-${currentTabId}`]: [] });
				});
			}
		});
	};

	const createHoverStartHighlightInputField = (inputId: string) => () => {
		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [inputId],
			func: (inputId) => {
				const ourMap = window.___flottform_map;
				const input: HTMLElement | undefined = ourMap.get(inputId);
				if (!input) {
					console.warn('could not find target!', inputId);
					return;
				}
				const styleToAppend = ';outline:25px solid red;';
				input.setAttribute('style', `${input.getAttribute('style') ?? ''}${styleToAppend}`);
			}
		});
	};

	const createHoverEndHighlightInputField = (inputId: string) => () => {
		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [inputId],
			func: (inputId) => {
				const ourMap = window.___flottform_map;
				const input: HTMLElement | undefined = ourMap.get(inputId);
				if (!input) {
					console.warn('could not find target!', inputId);
					return;
				}
				const styleToAppend = ';outline:25px solid red;';
				const currentStyle = input.getAttribute('style');
				if (currentStyle) {
					const styleWithoutAppend = currentStyle.endsWith(styleToAppend)
						? currentStyle.slice(0, -styleToAppend.length)
						: currentStyle;
					input.setAttribute('style', styleWithoutAppend);
				}
			}
		});
	};

	async function retrieveIceServersIfSet(apiUrl: string): Promise<RTCConfiguration['iceServers']> {
		if (!apiUrl) {
			console.warn('No API URL provided, using default STUN server configuration.');
			return [
				{
					urls: ['stun:stun1.l.google.com:19302']
				}
			];
		}

		const response = await fetch(apiUrl);
		if (!response.ok) {
			console.warn(
				'Could not fetch iceServers from the provided URL, received status:',
				response.status,
				'-',
				response.statusText
			);
			console.warn('Will use the default STUN server configuration.');
			return;
		}

		const body: unknown = await response.json();
		if (!Array.isArray(body)) {
			console.warn('Expected an array of type RTCIceServer');
			return;
		}

		if (!body.every(isOfTypeRTCIceServer)) {
			console.warn('Expected an array of type RTCIceServer, found invalid types');
			return;
		}

		return body;
	}

	onMount(async () => {
		if (!chrome) {
			console.warn('Chrome API is not available in this context!!');
			return;
		}

		const data = await chrome.storage.local.get([
			'FLOTTFORM_GET_ICE_SERVERS_ENDPOINT',
			'FLOTTFORM_SIGNALING_SERVER_URL_BASE',
			'FLOTTFORM_EXTENSION_CLIENTS_URL_BASE'
		]);
		getIceServersEndpoint = data.FLOTTFORM_GET_ICE_SERVERS_ENDPOINT ?? defaultGetIceServersEndpoint;
		signalingServerUrlBase =
			data.FLOTTFORM_SIGNALING_SERVER_URL_BASE ?? defaultSignalingServerUrlBase;
		extensionClientUrlBase =
			data.FLOTTFORM_EXTENSION_CLIENTS_URL_BASE ?? defaultExtensionClientUrlBase;
		console.log({
			getIceServersEndpoint,
			signalingServerUrlBase,
			extensionClientUrlBase
		});

		// Get the iceServers details for FlottformHost classes.
		iceServers = await retrieveIceServersIfSet(getIceServersEndpoint);

		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		currentTabId = tab.id;

		// Listen to storage changes in chrome.storage.local
		chrome.storage.local.onChanged.addListener((changes) => {
			const key = `inputFields-${currentTabId}`;
			if (changes[key]) {
				console.warn('Detected change in inputFields:', changes[key].newValue);
				inputFields = changes[key].newValue || [];
			}
		});

		// On Mount, check if data exists in storage
		chrome.storage.local.get([`inputFields-${currentTabId}`], (result) => {
			if (result[`inputFields-${currentTabId}`]) {
				inputFields = result[`inputFields-${currentTabId}`];
			}
		});

		clearOutdatedTables();
	});
</script>

{#if !getIceServersEndpoint}
	<div
		class="flex items-center p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700"
		role="alert"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mr-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			height="120"
			width="120"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/>
		</svg>
		<div>
			<p class="font-bold">Connection Reliability Warning</p>
			<p class="text-sm">
				Your connection might work, but it could be unstable. <button
					class="underline text-blue-700 hover:text-blue-900 bg-transparent p-0 border-0"
					onclick={() => {
						chrome.runtime.openOptionsPage();
					}}>Add your own connection servers</button
				> to ensure a more reliable connection.
			</p>
		</div>
	</div>
{/if}

<div class="p-2 grid grid-cols-2 gap-2">
	<button
		onclick={extractInputFieldsFromCurrentPage}
		class="p-2 text-sm bg-slate-200 hover:bg-slate-300 transition-colors duration-200 font-bold rounded"
		>Get inputs</button
	>
	<button
		onclick={removeSavedInputs}
		class="p-2 text-sm bg-slate-200 hover:bg-slate-300 transition-colors duration-200 font-bold rounded"
		>Remove saved inputs</button
	>
</div>

<ul class="p-2 grid grid-cols-1">
	{#each inputFields as input (input.id)}
		<li class="flex flex-col gap-2 border-b border-slate-300 py-4">
			<h2
				class="text-lg font-bold"
				onpointerenter={createHoverStartHighlightInputField(input.id)}
				onpointerleave={createHoverEndHighlightInputField(input.id)}
			>
				{input.label ?? input.id}
			</h2>
			{#if input.connectionState.event === 'new'}
				<button
					onclick={() => startFlottformProcess(input.id, input.type)}
					class="px-3 py-1 rounded bg-slate-100 hover:bg-slate-300 transition-colors duration-200 w-fit"
					>Get a QR code and link</button
				>
			{:else if input.connectionState.event === 'endpoint-created'}
				<img src={input.connectionState.data.qrCode} alt="qrCode" class="w-36" />
				<input type="text" value={input.connectionState.data.link} class="w-full" />
			{:else if input.connectionState.event === 'connected'}
				<p>Connected!</p>
			{:else if input.connectionState.event === 'progress'}
				<label for={input.id} class="italic"
					>Receiving ({input.connectionState.data.fileIndex + 1}/{input.connectionState.data
						.totalFileCount}) - {input.connectionState.data.fileName}:</label
				>
				<progress id={input.id} value={input.connectionState.data.currentFileProgress} max="1">
					{input.connectionState.data.currentFileProgress}%
				</progress>
			{:else if input.connectionState.event === 'done'}
				<p>Transfer Complete!</p>
			{:else if input.connectionState.event === 'error'}
				<p class="text-red-600">ERROR: {JSON.stringify(input.connectionState.data)}</p>
			{/if}
		</li>
	{/each}
</ul>
<p class="text-xs italic p-2">
	Powered by <a
		href="https://flottform.io/"
		target="_blank"
		rel="external noopener noreferrer"
		class="font-semibold">Flottform</a
	>.
</p>
<details class="border rounded border-slate-300 py-4 px-2 italic text-sm">
	<summary>How does it work?</summary>
	<p class="mt-3">
		Need to add details from another device? Simply click a button above to get all inputs from tab
		and generate a QR code or link, and easily upload information from your other device.
	</p>
</details>

<style>
	progress[value] {
		--color: linear-gradient(#fff8, #fff0),
			repeating-linear-gradient(135deg, #0003 0 10px, #0000 0 20px), #31c6f7;
		--background: lightgrey;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		border: none;
		width: 100%;
		border-radius: 10em;
		background: var(--background);
	}
	progress[value]::-webkit-progress-bar {
		border-radius: 10em;
		background: var(--background);
	}
	progress[value]::-webkit-progress-value {
		border-radius: 10em;
		background: var(--color);
	}
	progress[value]::-moz-progress-bar {
		border-radius: 10em;
		background: var(--color);
	}
</style>
