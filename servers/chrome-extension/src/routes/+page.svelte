<script lang="ts">
	import { onMount } from 'svelte';
	import {
		defaultTokenValue,
		defaultSignalingServerUrlBase,
		defaultExtensionClientUrlBase
	} from '$lib/options';
	import type * as Flottform from '@flottform/forms';

	type TrackedInputFields = Array<{
		id: string;
		type: string;
		connectionState: { event: string; data?: any };
		label: string | undefined | null;
	}>;

	let inputFields: TrackedInputFields = $state([]);
	let currentTabId: number | undefined;
	let apiToken: string = '';
	let signalingServerUrlBase: string = '';
	let extensionClientUrlBase: string = '';

	// TODO remove all listeners and flottform processes
	const removeSavedInputs = () => {
		// It'll remove all the data stored inside `chrome.storage.local`
		chrome.storage.local.set({ [`inputFields-${currentTabId}`]: [] });
		inputFields = [];
	};

	const extractInputFieldsFromCurrentPage = async () => {
		console.log('Searching for input fields in page');
		const injectionResult = await chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [currentTabId],
			func: async (currentTabId) => {
				const inputFields: TrackedInputFields = Array.from(
					document.querySelectorAll<HTMLInputElement>(
						'input[type="text"],input[type="file"],input[type="password"]'
					)
				).map((input) => {
					let nearestLabel = null;
					if (input.previousElementSibling?.tagName.toLowerCase() === 'label') {
						nearestLabel = input.previousElementSibling;
					} else if (input.nextElementSibling?.tagName.toLowerCase() === 'label') {
						nearestLabel = input.nextElementSibling;
					} else {
						nearestLabel = null;
					}
					let label =
						document.querySelector(`label[for="${input.id}"]`) ??
						input.closest('label') ??
						nearestLabel;
					return {
						id: input.id,
						type: input.type,
						label: (label as HTMLLabelElement)?.innerText,
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
				apiToken,
				signalingServerUrlBase,
				extensionClientUrlBase
			],
			func: async (
				flottformModuleFile: string,
				inputFieldId: string,
				tabId: number,
				inputFieldType: string,
				apiToken: string,
				signalingServerUrlBase: string,
				extensionClientUrlBase: string
			) => {
				const fm: typeof Flottform = await import(flottformModuleFile);
				const { FlottformTextInputHost, FlottformFileInputHost } = fm;

				function handleFlottformEvent(event: string, data: any, id: string, currentTabId: number) {
					// Get the latest updated version of the array inputFields instead of passing it as a parameter to `chrome.scripting.executeScript`!
					chrome.storage.local.get([`inputFields-${tabId}`], (result) => {
						if (result[`inputFields-${tabId}`]) {
							const latestVersionOfInputFields: TrackedInputFields = result[`inputFields-${tabId}`];
							const updatedInputFields = latestVersionOfInputFields.map((inputField) => {
								if (inputField.id === id) {
									//console.warn('Updating only the value of this inputField with ID= ', id);
									return { ...inputField, connectionState: { event, data } };
								}
								return inputField;
							});
							//console.warn(`updatedInputFields =${JSON.stringify(updatedInputFields)}, id=${id}`);

							updateSavedInputs(updatedInputFields, currentTabId);
						}
					});
				}

				function updateSavedInputs(updatedInputFields: TrackedInputFields, currentTabId: number) {
					// Update the UI and the local storage
					chrome.storage.local.set({ [`inputFields-${currentTabId}`]: updatedInputFields }, () => {
						/* console.warn(
							`Saved ${JSON.stringify(updatedInputFields)} to chrome storage from page context!!!!!!!!!!!!`
						); */
					});
					//inputFields = updatedInputFields;
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
							//console.log(`*****Inside "endpoint-created" event, link=${link}*****`);
							handleFlottformEvent('endpoint-created', { link, qrCode }, textInputId, currentTabId);
						}
					);

					flottformTextInputHost.on('connected', () => {
						//console.log('****Inside "connected" event*****');
						handleFlottformEvent('connected', undefined, textInputId, currentTabId);
					});

					flottformTextInputHost.on('error', (error: Error) => {
						//console.log('****Inside "error" event*****');
						handleFlottformEvent('error', { message: error.message }, textInputId, currentTabId);
					});

					flottformTextInputHost.on('done', (message: string) => {
						//console.log('****Inside "done" event*****');

						handleFlottformEvent('done', undefined, textInputId, currentTabId);

						const targetedTextField: HTMLInputElement | null = document.querySelector(
							`input#${textInputId}`
						);
						if (!targetedTextField) {
							console.warn(
								`Flottform Can't assign the received message (${message}) to the targeted Text input field`
							);
							return;
						}
						targetedTextField.value = message;
						// Channel will be closed since we won't receive data anymore.
						flottformTextInputHost.close();
					});
				}

				function startFlottformTextInputProcess(textInputId: string, currentTabId: number) {
					// Query the doc with the ID: textInputId in order to find the input field where you'll paste the text.
					//console.log(`****Flottform will work on TextInput with id=${textInputId}*****`);
					const data = {
						type: 'text',
						token: apiToken,
						flottformApi: signalingServerUrlBase
					};

					// Instantiate the FlottformTextInputHost with the provided inputId
					let flottformTextInputHost = new FlottformTextInputHost({
						createClientUrl: async ({ endpointId }: { endpointId: string }) =>
							`${extensionClientUrlBase}/${endpointId}/#${encodeURIComponent(JSON.stringify(data))}`,
						flottformApi: signalingServerUrlBase
					});

					flottformTextInputHost.start();

					registerFlottformTextInputListeners(flottformTextInputHost, textInputId, currentTabId);
				}

				function startFlottformFileInputProcess(fileInputId: string, currentTabId: number) {
					const targetedInputField = document.getElementById(
						fileInputId
					) as HTMLInputElement | null;
					if (!targetedInputField) {
						console.warn(
							"Flottform Can't assign the received file to the targeted file input field"
						);
						return;
					}

					const data = {
						type: 'file',
						flottformApi: signalingServerUrlBase,
						token: apiToken
					};

					// Instantiate the FlottformFileInputHost with the provided inputId
					let flottformFileInputHost = new FlottformFileInputHost({
						createClientUrl: async ({ endpointId }: { endpointId: string }) =>
							`${extensionClientUrlBase}/${endpointId}/#${encodeURIComponent(JSON.stringify(data))}`,
						flottformApi: signalingServerUrlBase,
						inputField: targetedInputField
					});

					flottformFileInputHost.start();
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
							//console.log(`*****Inside "endpoint-created" event, link=${link}*****`);
							handleFlottformEvent('endpoint-created', { link, qrCode }, fileInputId, currentTabId);
						}
					);

					flottformFileInputHost.on('connected', () => {
						//console.log('****Inside "connected" event*****');
						handleFlottformEvent('connected', undefined, fileInputId, currentTabId);
					});

					flottformFileInputHost.on(
						'progress',
						({ fileIndex, totalFileCount, fileName, currentFileProgress, overallProgress }) => {
							handleFlottformEvent(
								'progress',
								{ fileIndex, totalFileCount, fileName, currentFileProgress, overallProgress },
								fileInputId,
								currentTabId
							);
						}
					);

					flottformFileInputHost.on('error', (error: Error) => {
						//console.log('****Inside "error" event*****');
						handleFlottformEvent('error', { message: error.message }, fileInputId, currentTabId);
					});

					flottformFileInputHost.on('done', () => {
						//console.log('****Inside "done" event*****');
						handleFlottformEvent('done', undefined, fileInputId, currentTabId);
						// TODO: HANDLE THE DONE PROCESS
					});
				}

				if (inputFieldType === 'file') {
					startFlottformFileInputProcess(inputFieldId, tabId);
				} else {
					startFlottformTextInputProcess(inputFieldId, tabId);
				}
			}
		});
	};

	onMount(async () => {
		if (!chrome) {
			console.warn('Chrome API is not available in this context!!');
			return;
		}

		const data = await chrome.storage.local.get([
			'FLOTTFORM_TOKEN',
			'FLOTTFORM_SIGNALING_SERVER_URL_BASE',
			'FLOTTFORM_EXTENSION_CLIENTS_URL_BASE'
		]);
		apiToken = data.FLOTTFORM_TOKEN ?? defaultTokenValue;
		signalingServerUrlBase =
			data.FLOTTFORM_SIGNALING_SERVER_URL_BASE ?? defaultSignalingServerUrlBase;
		extensionClientUrlBase =
			data.FLOTTFORM_EXTENSION_CLIENTS_URL_BASE ?? defaultExtensionClientUrlBase;
		console.log({
			apiToken,
			signalingServerUrlBase,
			extensionClientUrlBase
		});

		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		currentTabId = tab.id;

		// Listen to storage changes in chrome.storage.local
		chrome.storage.local.onChanged.addListener((changes) => {
			//console.log('CHANGES: ', changes);
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
	});
</script>

<div class="grid grid-cols-2 gap-2">
	<button
		onclick={extractInputFieldsFromCurrentPage}
		class="p-2 text-sm bg-slate-200 font-bold rounded">Get inputs</button
	>
	<button onclick={removeSavedInputs} class="p-2 text-sm bg-slate-200 font-bold rounded"
		>Remove saved inputs</button
	>
</div>

<ul class="p-2 grid grid-cols-1">
	{#each inputFields as input (input.id)}
		<li class="flex flex-col gap-2 border-b border-slate-300 py-4">
			<h2 class="text-lg font-bold">{input.label ?? input.id}</h2>
			{#if input.connectionState.event === 'new'}
				<button
					onclick={() => startFlottformProcess(input.id, input.type)}
					class="px-3 py-1 rounded bg-slate-100 w-fit">Get a QR code and link</button
				>
			{:else if input.connectionState.event === 'endpoint-created'}
				<img src={input.connectionState.data.qrCode} alt="qrCode" class="w-36" />
				<input type="text" value={input.connectionState.data.link} class="w-full" />
			{:else if input.connectionState.event === 'connected'}
				<p>Connected!</p>
			{:else if input.connectionState.event === 'done'}
				<p>Received & Attached the message from the other device!</p>
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
