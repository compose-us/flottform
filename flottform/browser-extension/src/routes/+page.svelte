<script lang="ts">
	import { onMount } from 'svelte';

	type TrackedInputFields = Array<{
		id: string;
		type: string;
		connectionState: { event: string; data?: any };
	}>;

	let inputFields: TrackedInputFields = [];
	let currentTabId: number | undefined;

	const removeSavedInputs = () => {
		// It'll remove all the data stored inside `chrome.storage.local`
		chrome.storage.local.set({ [`inputFields-${currentTabId}`]: [] });
		inputFields = [];
	};

	const extractInputFieldsFromCurrentPage = async () => {
		const injectionResult = await chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [currentTabId],
			func: async (currentTabId) => {
				const inputFields: TrackedInputFields = Array.from(
					document.querySelectorAll('input[type="text"], input[type="file"]')
				).map((input) => {
					return { id: input.id, type: input.type, connectionState: { event: 'new' } };
				});
				// Save the input fields to the chrome storage
				chrome.storage.local.set({ [`inputFields-${currentTabId}`]: inputFields });
				return inputFields;
			}
		});

		const potentialResult = injectionResult[0].result;
		if (!potentialResult) {
			console.error('Injected Code is did not work properly !');
			return;
		}
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
		// Inject the bundled file into the page context
		await chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			files: ['/scripts/content-script.js']
		});

		// Wait for the current tab Id to be available!
		const tabId = await getCurrentTabId();
		//console.log(`**** Starting the process for the TAB-${tabId} ****`);

		chrome.scripting.executeScript({
			target: { tabId: currentTabId! },
			args: [inputFieldId, tabId, inputFieldType],
			func: async (inputFieldId: string, tabId: number, inputFieldType: string) => {
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
							chrome.runtime.sendMessage({ action: 'update-available' });
							handleFlottformEvent('endpoint-created', { link, qrCode }, textInputId, currentTabId);
						}
					);

					flottformTextInputHost.on('connected', () => {
						//console.log('****Inside "connected" event*****');
						chrome.runtime.sendMessage({ action: 'update-available' });
						handleFlottformEvent('connected', undefined, textInputId, currentTabId);
					});

					flottformTextInputHost.on('error', (error: Error) => {
						//console.log('****Inside "error" event*****');
						chrome.runtime.sendMessage({ action: 'update-available' });
						handleFlottformEvent('error', { message: error.message }, textInputId, currentTabId);
					});

					flottformTextInputHost.on('done', (message: string) => {
						//console.log('****Inside "done" event*****');
						chrome.runtime.sendMessage({ action: 'update-available' });
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
					const api = 'https://192.168.0.167:5177/flottform';

					const { FlottformTextInputHost } = window.FlottForm;

					// Instantiate the FlottformTextInputHost with the provided inputId
					let flottformTextInputHost = new FlottformTextInputHost({
						createClientUrl: async ({ endpointId }: { endpointId: string }) =>
							`https://192.168.0.167:5175/browser-extension/${endpointId}/#${encodeURIComponent(api)}`,
						flottformApi: api
					});

					flottformTextInputHost.start();

					registerFlottformTextInputListeners(flottformTextInputHost, textInputId, currentTabId);
				}

				function startFlottformFileInputProcess(fileInputId: string, currentTabId: number) {
					console.log(
						`startFlottformFileInputProcess with args: fileInputId=${fileInputId} and tabId=${currentTabId}`
					);
				}

				if (inputFieldType === 'text') {
					startFlottformTextInputProcess(inputFieldId, tabId);
				} else {
					startFlottformFileInputProcess(inputFieldId, tabId);
				}
			}
		});
	};

	onMount(async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		currentTabId = tab.id;

		if (chrome) {
			// Listen to storage changes in chrome.storage.local
			chrome.storage.onChanged.addListener((changes, namespace) => {
				//console.log('CHANGES: ', changes);
				if (namespace === 'local') {
					const key = `inputFields-${currentTabId}`;
					if (changes[key]) {
						console.warn('Detected change in inputFields:', changes[key].newValue);
						inputFields = changes[key].newValue || [];
					}
				}
			});
		} else {
			console.warn('Chrome API is not available in this context!!');
		}

		// On Mount, check if data exists in storage
		chrome.storage.local.get([`inputFields-${currentTabId}`], (result) => {
			if (result[`inputFields-${currentTabId}`]) {
				inputFields = result[`inputFields-${currentTabId}`];
			}
		});
	});
</script>

<button
	onclick={extractInputFieldsFromCurrentPage}
	class="p-4 bg-primary-blue/50 text-white font-bold rounded w-full">Get inputs</button
>

<button
	onclick={removeSavedInputs}
	class="p-4 bg-primary-blue/50 text-white font-bold rounded w-full">Remove saved inputs</button
>

{#each inputFields as input (input.id)}
	{#if input.connectionState.event === 'new'}
		<div>
			<h4>{input.id}</h4>
			<button onclick={() => startFlottformProcess(input.id, input.type)}
				>Start - id={input.id}</button
			>
		</div>
	{:else if input.connectionState.event === 'endpoint-created'}
		<div>
			<img src={input.connectionState.data.qrCode} alt="qrCode" />
			<input type="text" value={input.connectionState.data.link} />
		</div>
	{:else if input.connectionState.event === 'connected'}
		<div>
			<p>Connected!</p>
		</div>
	{:else if input.connectionState.event === 'done'}
		<div>
			<p>Received & Attached the message from the other device!</p>
		</div>
	{:else if input.connectionState.event === 'error'}
		<div>
			<p style="color: red;">ERROR: {JSON.stringify(input.connectionState.data)}</p>
		</div>
	{/if}
{/each}

<style>
	/* basic styling */
	button {
		margin: 5px 0;
		border: 1px solid black;
		border-radius: 0.25rem;
		background-color: rgb(166, 166, 166);
	}
	img {
		height: 150px;
	}
</style>
