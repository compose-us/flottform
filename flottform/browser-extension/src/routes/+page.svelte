<script lang="ts">
	import { createDefaultFlottformComponent } from '@flottform/forms';
	import { onMount } from 'svelte';
	import { createClientUrl } from '../api';

	let flottformAnchor: HTMLDivElement;

	// let fileInputs: NodeListOf<HTMLInputElement> | undefined = $state(undefined);

	let file:
		| {
				id: string;
				type: string;
		  }
		| {} = {};
	let inputs: Array<{
		id: string;
		type: string | null;
	}> = $state([]);
	let hiddenForm: HTMLFormElement;
	const getInputFromPages = async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		const injectionResult = await chrome.scripting.executeScript({
			target: { tabId: tab.id! },
			func: async () => {
				console.log('Page context!');

				console.log(
					document.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
				);
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
						inputOnPage.setAttribute('value', value ?? '');
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

	async function onSubmit(e: SubmitEvent) {
		const form = e.target as HTMLFormElement;
		const inputsToFill = Array.from(
			form.querySelectorAll<HTMLInputElement>('input[type="text"]')
		).map((input) => {
			return { id: input.id, value: input.value };
		});

		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		await chrome.scripting.executeScript({
			target: { tabId: tab.id! },
			args: [inputsToFill],
			func: async (inputs) => {
				Array.from(document.querySelectorAll<HTMLInputElement>('input[type="text"]')).forEach(
					(input) => {
						const foundInput = inputs.find((i) => i.id === input.id);
						if (!foundInput) {
							return;
						}

						input.value = foundInput.value;
					}
				);
			}
		});
	}

	onMount(async () => {
		console.log('Popup context!');
		// chrome.storage.local.clear();
		// chrome.storage.local.get(['fileInputs'], (res) => {
		// 	console.log('LocalStorage from popup context=', res);
		// 	// inputs = res.fileInput;
		// 	// const fileInputs = document.querySelectorAll(
		// 	// 	'input[type=file]'
		// 	// ) as NodeListOf<HTMLInputElement>;
		// 	const flottformComponent = createDefaultFlottformComponent({
		// 		flottformAnchorElement: flottformAnchor
		// 	});
		// 	// for (const file of fileInputs) {
		// 	// 	flottformComponent.createFileItem({
		// 	// 		flottformApi: 'https://192.168.178.23:5177/flottform',
		// 	// 		createClientUrl,
		// 	// 		inputField: file,
		// 	// 		label: file.id || file.name || 'File'
		// 	// 	});
		// 	// }
		// 	inputs = res.fileInputs;
		// 	// fileInputs.forEach((fileInput: string) => {
		// 	// 	flottformComponent.createFileItem({ label: fileInput });
		// 	// });
		// });
	});
</script>

<button onclick={getInputFromPages} class="p-4 bg-slate-300 rounded">Get inputs</button>
<div class="h-full border border-gray-300 bg-gray-300/20" bind:this={flottformAnchor}></div>
<!-- <form bind:this={hiddenForm} onsubmit={onSubmit} action="#" class="grid grid-cols-1">
	{#each inputs as input}
		<label for={input.id}
			>Input {input.id}
			<input type={input.type} id={input.id} name={input.id} />
		</label>
	{/each}
	<button type="submit" class="bg-blue-200 rounded p-4">Submit</button>
</form> -->
<form bind:this={hiddenForm}></form>
