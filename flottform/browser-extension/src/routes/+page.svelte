<script lang="ts">
	import { createDefaultFlottformComponent, FlottformTextInputHost } from '@flottform/forms';
	import { onMount } from 'svelte';

	let inputFields: Array<{ id: string; type: string; element?: HTMLInputElement }> = [];

	const removeSavedInputs = () => {
		// It'll remove all the data stored inside `chrome.storage.local`
		chrome.storage.local.set({ inputFields: [] });
		inputFields = [];
	};

	const getInputFromPages = async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		const injectionResult = await chrome.scripting.executeScript({
			target: { tabId: tab.id! },
			func: async () => {
				const textInputFields = Array.from(document.querySelectorAll('input[type="text"]')).map(
					(input) => {
						return { id: input.id, type: 'text' };
					}
				);
				console.log('[WEBPAGE CONTEXT]: Extracted inputs=', textInputFields);
				// Save the input fields to the chrome storage
				chrome.storage.local.set({ inputFields: textInputFields });
				return textInputFields;
			}
		});
		const potentialResult = injectionResult[0].result;
		console.log('potentialResult= ', potentialResult);
		if (!potentialResult) {
			console.log('didnt work');
			return;
		}
		const inputs: Array<{ id: string; type: string; element?: HTMLInputElement }> = potentialResult;
		inputFields = inputs;
		console.log('[POPUP CONTEXT]: Received inputs=', inputs);
	};

	const startFlottformProcess = async (textInputId: string) => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		chrome.scripting.executeScript({
			target: { tabId: tab.id! },
			args: [textInputId],
			func: async (textInputId) => {
				// Query the doc with the ID: textInputId in order to find the input field where you'll paste the text.
				console.log(`Flottform will work on TextInput with id=${textInputId}`);
				const api = 'https://192.168.0.167:5177/flottform';

				// Instantiate the FlottformTextInputHost with the provided inputId
				let flottformTextInputHost = new FlottformTextInputHost({
					createClientUrl: async ({ endpointId }) =>
						`https://192.168.0.167:5175/browser-extension/${endpointId}/#${encodeURIComponent(api)}`,
					flottformApi: api
				});

				console.log('FlottformTextInputHost instance: ', flottformTextInputHost);
				flottformTextInputHost.start();

				// Listen to events from FlottformTextInputHost and send them to the popup
				flottformTextInputHost.on('endpoint-created', ({ link, qrCode }) => {
					console.log(`[WEBPAGE CONTEXT]: event-'endpoint-created', data=${link}, ${qrCode}`);
					chrome.runtime.sendMessage({
						action: 'event',
						eventType: 'endpoint-created',
						data: { link, qrCode }
					});
				});

				flottformTextInputHost.on('connected', () => {
					console.log(`[WEBPAGE CONTEXT]: event-'connected', data= NO DATA WITH THIS EVENT`);
					chrome.runtime.sendMessage({
						action: 'event',
						eventType: 'connected'
					});
				});

				flottformTextInputHost.on('error', (error) => {
					console.log(`[WEBPAGE CONTEXT]: event-'error', data= ${error}`);
					chrome.runtime.sendMessage({
						action: 'event',
						eventType: 'error',
						data: { message: error.message }
					});
				});

				flottformTextInputHost.on('done', (message: string) => {
					console.log(`[WEBPAGE CONTEXT]: event-'done', data= ${message}`);
					const targetedTextField: HTMLInputElement | null = document.querySelector(
						`input#${textInputId}`
					);
					if (!targetedTextField) {
						console.log(
							`Flottform Can't assign the received message (${message}) to the targeted Text input field`
						);
						return;
					}
					targetedTextField.value = message;
					// Channel will be closed since we won't receive data anymore.
					flottformTextInputHost.close();
				});

				//sendResponse({ status: 'started' });
			}
		});
	};

	const handleFlottformEvent = (event: string, data: any) => {
		if (event === 'endpoint-created') {
			console.log(`Event [${event}] - data [${JSON.stringify(data)}]`);
		} else if (event === 'connected') {
			console.log(`Event [${event}] - data [${JSON.stringify(data)}]`);
		} else if (event === 'error') {
			console.log(`Event [${event}] - data [${JSON.stringify(data)}]`);
		}
	};

	// On Mount, check if data exists in storage
	onMount(() => {
		if (chrome) {
			// Listen to messages from the content script
			chrome.runtime.onMessage.addListener((message) => {
				if (message.action === 'event') {
					handleFlottformEvent(message.eventType, message.data);
				}
			});
		} else {
			console.warn('Chrome API is not available in this context!!');
		}

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
	<div>
		<h4>{input.id}</h4>
		<button onclick={() => startFlottformProcess(input.id)}>Start - id={input.id}</button>
	</div>
{/each}

<style>
	/* basic styling */
	button {
		margin: 5px 0;
		border: 1px solid black;
		border-radius: 0.25rem;
		background-color: rgb(166, 166, 166);
	}
</style>
