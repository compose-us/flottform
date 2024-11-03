<script lang="ts">
	import { onMount } from 'svelte';

	type TrackedInputFields = Array<{
		id: string;
		type: string;
		connectionState: { event: string; data?: any };
	}>;

	let inputFields: TrackedInputFields = [];

	const removeSavedInputs = () => {
		// It'll remove all the data stored inside `chrome.storage.local`
		chrome.storage.local.set({ inputFields: [] });
		inputFields = [];
	};

	const updateSavedInputs = (updatedInputFields: TrackedInputFields) => {
		// Update the UI and the local storage
		chrome.storage.local.set({ inputFields: updatedInputFields });
		inputFields = updatedInputFields;
		console.log('updatedInputFields = ', updatedInputFields);
	};

	const getInputFromPages = async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		const injectionResult = await chrome.scripting.executeScript({
			target: { tabId: tab.id! },
			func: async () => {
				const textInputFields: TrackedInputFields = Array.from(
					document.querySelectorAll('input[type="text"]')
				).map((input) => {
					return { id: input.id, type: 'text', connectionState: { event: 'new' } };
				});
				// Save the input fields to the chrome storage
				chrome.storage.local.set({ inputFields: textInputFields });
				return textInputFields;
			}
		});
		const potentialResult = injectionResult[0].result;
		if (!potentialResult) {
			console.log('didnt work');
			return;
		}
		inputFields = potentialResult;
	};

	const startFlottformProcess = async (textInputId: string) => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		// Inject the bundled file into the page context
		await chrome.scripting.executeScript({
			target: { tabId: tab.id! },
			files: ['/scripts/content-script.js']
		});

		chrome.scripting.executeScript({
			target: { tabId: tab.id! },
			args: [textInputId],
			func: async (textInputId) => {
				// Query the doc with the ID: textInputId in order to find the input field where you'll paste the text.
				console.log(`Flottform will work on TextInput with id=${textInputId}`);
				const api = 'https://192.168.0.167:5177/flottform';

				const { FlottformTextInputHost } = window.FlottForm;

				// Instantiate the FlottformTextInputHost with the provided inputId
				let flottformTextInputHost = new FlottformTextInputHost({
					createClientUrl: async ({ endpointId }: { endpointId: string }) =>
						`https://192.168.0.167:5175/browser-extension/${endpointId}/#${encodeURIComponent(api)}`,
					flottformApi: api
				});

				flottformTextInputHost.start();

				// Listen to events from FlottformTextInputHost and send them to the popup
				flottformTextInputHost.on(
					'endpoint-created',
					({ link, qrCode }: { link: string; qrCode: string }) => {
						chrome.runtime.sendMessage({
							action: 'event',
							eventType: 'endpoint-created',
							data: { link, qrCode },
							inputId: textInputId
						});
					}
				);

				flottformTextInputHost.on('connected', () => {
					chrome.runtime.sendMessage({
						action: 'event',
						eventType: 'connected',
						inputId: textInputId
					});
				});

				flottformTextInputHost.on('error', (error: Error) => {
					chrome.runtime.sendMessage({
						action: 'event',
						eventType: 'error',
						data: { message: error.message },
						inputId: textInputId
					});
				});

				flottformTextInputHost.on('done', (message: string) => {
					chrome.runtime.sendMessage({
						action: 'event',
						eventType: 'done',
						inputId: textInputId
					});
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
		});
	};

	const handleFlottformEvent = (event: string, data: any, id: string) => {
		const updatedInputFields: TrackedInputFields = inputFields.map((inputField) => {
			if (inputField.id === id) {
				return { ...inputField, connectionState: { event, data } };
			}
			return inputField;
		});
		updateSavedInputs(updatedInputFields);
	};

	onMount(() => {
		if (chrome) {
			// Listen to messages from the content script
			chrome.runtime.onMessage.addListener((message) => {
				if (message.action === 'event') {
					handleFlottformEvent(message.eventType, message.data, message.inputId);
				}
			});
		} else {
			console.warn('Chrome API is not available in this context!!');
		}

		// On Mount, check if data exists in storage
		chrome.storage.local.get(['inputFields'], (result) => {
			if (result.inputFields) {
				inputFields = result.inputFields;
			}
		});
	});
</script>

<button
	onclick={getInputFromPages}
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
			<button onclick={() => startFlottformProcess(input.id)}>Start - id={input.id}</button>
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
