<script lang="ts">
	import { createDefaultFlottformComponent } from '@flottform/forms';
	import { onMount } from 'svelte';

	let flottformAnchor: HTMLDivElement;
	let hiddenForm: HTMLFormElement;
	const getInputFromPages = async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		const injectionResult = await chrome.scripting.executeScript({
			target: { tabId: tab.id! },
			func: async () => {
				console.log('Page context!');
				const inputFields = Array.from(document.querySelectorAll('input[type="text"]')).map(
					(input) => {
						return { id: input.id, type: 'text' };
					}
				);
				return inputFields;
			}
		});
		const potentialResult = injectionResult[0].result;
		if (!potentialResult) {
			console.log('didnt work');
			return;
		}
		const inputs: Array<{ id: string; type: string; element?: HTMLInputElement }> = potentialResult;
		for (const input of inputs) {
			const newInput = document.createElement('input');
			console.log('changed newInput field!');
			newInput.setAttribute('placeholder', input.id);
			newInput.addEventListener('change', async () => {
				console.log('changed newInput field!');
				await chrome.scripting.executeScript({
					target: { tabId: tab.id! },
					args: [input.id, input.element?.value],
					func: async (id, value) => {
						const inputOnPage = document.getElementById(id!) as HTMLInputElement;
						console.log({ id, value, inputOnPage });
						inputOnPage.value = value ?? '';
					}
				});
			});
			hiddenForm.appendChild(newInput);
			input.element = newInput;
		}
		const fc = createDefaultFlottformComponent({
			flottformAnchorElement: flottformAnchor
		});

		const api = 'https://192.168.178.23:5177/flottform';
		for (const input of inputs) {
			fc.createTextItem({
				createClientUrl: async ({ endpointId }) =>
					`https://192.168.178.23:5175/browser-extension/${endpointId}/#${encodeURIComponent(api)}`,
				flottformApi: api,
				inputField: input.element!
			});
		}
	};

	onMount(async () => {
		console.log('Popup context!');
	});
</script>

<button
	onclick={getInputFromPages}
	class="p-4 bg-primary-blue/50 text-white font-bold rounded w-full">Get inputs</button
>
<div class="h-full border border-gray-300 bg-gray-300/20" bind:this={flottformAnchor}></div>
<form bind:this={hiddenForm} class="hidden"></form>
