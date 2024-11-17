<script lang="ts">
	import { onMount } from 'svelte';
	import {
		defaultTokenValue,
		defaultSignalingServerUrlBase,
		defaultExtensionClientUrlBase
	} from '$lib/options';
	import type { EventHandler } from 'svelte/elements';

	let tokenValue: string;
	let flottformSignalingServerUrlBase: string;
	let flottformExtensionClientsUrlBase: string;
	let state: 'init' | 'saved' | 'error' = 'init';

	const saveToken: EventHandler<SubmitEvent> = async (e) => {
		e.preventDefault();
		try {
			await chrome.storage.local.set({
				FLOTTFORM_TOKEN: tokenValue,
				FLOTTFORM_SIGNALING_SERVER_URL_BASE: flottformSignalingServerUrlBase,
				FLOTTFORM_EXTENSION_CLIENTS_URL_BASE: flottformExtensionClientsUrlBase
			});
			console.log('saved the token');
			state = 'saved';
			setTimeout(() => {
				state = 'init';
			}, 5000);
		} catch {
			console.error('Could not save the token');
			state = 'error';
		}
	};

	onMount(async () => {
		const data = await chrome.storage.local.get([
			'FLOTTFORM_TOKEN',
			'FLOTTFORM_SIGNALING_SERVER_URL_BASE',
			'FLOTTFORM_EXTENSION_CLIENTS_URL_BASE'
		]);
		tokenValue = data.FLOTTFORM_TOKEN ?? defaultTokenValue;
		flottformSignalingServerUrlBase =
			data.FLOTTFORM_SIGNALING_SERVER_URL_BASE ?? defaultSignalingServerUrlBase;
		flottformExtensionClientsUrlBase =
			data.FLOTTFORM_EXTENSION_CLIENTS_URL_BASE ?? defaultExtensionClientUrlBase;
	});
</script>

<div class="w-full p-4 grid gap-4">
	<h1>Flottform options</h1>
	<p>
		If you're behind a firewall or having issues with the network connection, you can visit the
		flottform.io website and get a token.
	</p>
	<form onsubmit={saveToken} class="grid gap-2">
		<label for="apiToken">Your API token</label>
		<input
			bind:value={tokenValue}
			type="text"
			id="apiToken"
			name="apiToken"
			placeholder="YoUr_ToKeN"
			class="border rounded border-gray-700 p-2"
		/>
		<label for="flottformSignalingServerUrlBase">Signaling server base URL</label>
		<input
			bind:value={flottformSignalingServerUrlBase}
			type="text"
			id="flottformSignalingServerUrlBase"
			name="flottformSignalingServerUrlBase"
			placeholder="https://100.85.250.183:5177/flottform"
			class="border rounded border-gray-700 p-2"
		/>
		<label for="flottformExtensionClientsUrlBase">Extension clients base URL</label>
		<input
			bind:value={flottformExtensionClientsUrlBase}
			type="text"
			id="flottformExtensionClientsUrlBase"
			name="flottformExtensionClientsUrlBase"
			placeholder="https://demo.flottform.io/browser-extensions"
			class="border rounded border-gray-700 p-2"
		/>
		<button type="submit">Save</button>
		{#if state === 'saved'}
			<p class="text-green-700">✅ Saved the options!</p>
		{:else if state === 'error'}
			<p class="text-red-700">❌ Could not save the options!</p>
		{/if}
	</form>
</div>
