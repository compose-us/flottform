<script lang="ts">
	import { onMount } from 'svelte';
	import {
		defaultTurnServerMeteredEndpointValue,
		defaultSignalingServerUrlBase,
		defaultExtensionClientUrlBase
	} from '$lib/options';
	import type { EventHandler } from 'svelte/elements';

	let turnServerMeteredEndpointValue: string;
	let flottformSignalingServerUrlBase: string;
	let flottformExtensionClientsUrlBase: string;
	let state: 'init' | 'saved' | 'error' = 'init';
	let errorMessage = '';

	const isValidTurnEndpoint = (turnEndpoint: string) => {
		const pattern =
			/^https:\/\/[a-zA-Z0-9.-]*metered\.live\/api\/v1\/turn\/credentials\?apiKey=[a-zA-Z0-9-]+$/;
		return pattern.test(turnEndpoint);
	};

	const saveOptions: EventHandler<SubmitEvent> = async (e) => {
		e.preventDefault();
		errorMessage = '';

		if (!isValidTurnEndpoint(turnServerMeteredEndpointValue)) {
			errorMessage = 'Invalid TURN server endpoint format! Please check your URL!';
			return;
		}

		try {
			await chrome.storage.local.set({
				FLOTTFORM_TURN_SERVER_METERED_ENDPOINT: turnServerMeteredEndpointValue,
				FLOTTFORM_SIGNALING_SERVER_URL_BASE: flottformSignalingServerUrlBase,
				FLOTTFORM_EXTENSION_CLIENTS_URL_BASE: flottformExtensionClientsUrlBase
			});
			console.log('saved the options');
			state = 'saved';
			setTimeout(() => {
				state = 'init';
			}, 5000);
		} catch {
			console.error('Could not save the options');
			state = 'error';
		}
	};

	onMount(async () => {
		const data = await chrome.storage.local.get([
			'FLOTTFORM_TURN_SERVER_METERED_ENDPOINT',
			'FLOTTFORM_SIGNALING_SERVER_URL_BASE',
			'FLOTTFORM_EXTENSION_CLIENTS_URL_BASE'
		]);
		turnServerMeteredEndpointValue =
			data.FLOTTFORM_TURN_SERVER_METERED_ENDPOINT ?? defaultTurnServerMeteredEndpointValue;
		flottformSignalingServerUrlBase =
			data.FLOTTFORM_SIGNALING_SERVER_URL_BASE ?? defaultSignalingServerUrlBase;
		flottformExtensionClientsUrlBase =
			data.FLOTTFORM_EXTENSION_CLIENTS_URL_BASE ?? defaultExtensionClientUrlBase;
	});
</script>

<div class="w-full p-4 grid gap-4">
	<h1>Flottform options</h1>
	<p>
		We highly recommand creating an account on <a
			href="https://www.metered.ca/stun-turn"
			target="_blank"
			rel="external noopener noreferrer"
			class="underline">metered.ca</a
		> since you're likely to have trouble using the extension due to a firewall! After that, Enter the
		REST API endpoint to retrieve the necessary TURN/STUN server credentials in the input field.
	</p>
	<form onsubmit={saveOptions} class="grid gap-2">
		<label for="turnServerMeteredEndpoint"
			>REST API endpoint to retrieve STUN/TURN server credentials</label
		>
		<input
			bind:value={turnServerMeteredEndpointValue}
			type="text"
			id="turnServerMeteredEndpoint"
			name="turnServerMeteredEndpoint"
			placeholder="https://<domain>.metered.live/api/v1/turn/credentials?apiKey=<apiKey>"
			class="border rounded border-gray-700 p-2"
		/>
		{#if errorMessage}
			<p class="text-red-600">{errorMessage}</p>
		{/if}
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
		<button type="submit" class="border rounded">Save</button>
		{#if state === 'saved'}
			<p class="text-green-700">✅ Saved the options!</p>
		{:else if state === 'error'}
			<p class="text-red-700">❌ Could not save the options!</p>
		{/if}
	</form>
</div>
