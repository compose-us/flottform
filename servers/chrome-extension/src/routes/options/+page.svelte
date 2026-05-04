<script lang="ts">
	import { onMount } from 'svelte';
	import {
		defaultSignalingServerUrlBase,
		defaultExtensionClientUrlBase
	} from '$lib/options';
	import type { EventHandler } from 'svelte/elements';

	let turnServerMeteredEndpointValue: string;
	let flottformSignalingServerUrlBase: string;
	let flottformExtensionClientsUrlBase: string;
	let useTurnServer = true;
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

		if (turnServerMeteredEndpointValue && !isValidTurnEndpoint(turnServerMeteredEndpointValue)) {
			errorMessage = 'Invalid TURN server endpoint format! Please check your URL.';
			return;
		}

		try {
			await chrome.storage.local.set({
				FLOTTFORM_TURN_SERVER_METERED_ENDPOINT: turnServerMeteredEndpointValue,
				FLOTTFORM_SIGNALING_SERVER_URL_BASE: flottformSignalingServerUrlBase,
				FLOTTFORM_EXTENSION_CLIENTS_URL_BASE: flottformExtensionClientsUrlBase,
				FLOTTFORM_USE_TURN_SERVER: useTurnServer
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
			'FLOTTFORM_EXTENSION_CLIENTS_URL_BASE',
			'FLOTTFORM_USE_TURN_SERVER'
		]);
		turnServerMeteredEndpointValue = data.FLOTTFORM_TURN_SERVER_METERED_ENDPOINT ?? '';
		flottformSignalingServerUrlBase =
			data.FLOTTFORM_SIGNALING_SERVER_URL_BASE ?? defaultSignalingServerUrlBase;
		flottformExtensionClientsUrlBase =
			data.FLOTTFORM_EXTENSION_CLIENTS_URL_BASE ?? defaultExtensionClientUrlBase;
		useTurnServer = data.FLOTTFORM_USE_TURN_SERVER ?? true;
	});
</script>

<div class="bg-white min-h-0 flex flex-col">
	<!-- Header -->
	<div class="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center gap-2">
		<a
			href="/"
			aria-label="Back to main"
			class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
		>
			<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
					clip-rule="evenodd"
				/>
			</svg>
		</a>
		<h1 class="text-base font-bold">Settings</h1>
	</div>

	<!-- Content -->
	<div class="px-4 py-3 flex flex-col gap-3 overflow-y-auto">
		<p class="text-xs text-gray-500 leading-relaxed">
			By default, Flottform uses its own TURN relay for connections behind strict firewalls. Advanced
			users can provide a custom TURN endpoint from <a
				href="https://www.metered.ca/stun-turn"
				target="_blank"
				rel="external noopener noreferrer"
				class="font-semibold text-primary-blue hover:underline">metered.ca</a
			>. Leave the field empty to use the default.
		</p>

		<form onsubmit={saveOptions} class="flex flex-col gap-3">
			<label class="flex items-start gap-2 cursor-pointer">
				<input
					bind:checked={useTurnServer}
					type="checkbox"
					class="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue/30"
				/>
				<span class="flex flex-col gap-0.5">
					<span class="text-xs font-semibold text-gray-600">Use Flottform TURN server</span>
					<span class="text-[11px] text-gray-500 leading-snug">
						Only activates if a direct connection fails (e.g. on VPN or mobile networks). Turn off
						to use direct connections only.
					</span>
				</span>
			</label>

			<div class="flex flex-col gap-1">
				<label for="turnServerMeteredEndpoint" class="text-xs font-semibold text-gray-600"
					>Custom TURN server endpoint (optional)</label
				>
				<input
					bind:value={turnServerMeteredEndpointValue}
					type="text"
					id="turnServerMeteredEndpoint"
					name="turnServerMeteredEndpoint"
					placeholder="https://<domain>.metered.live/api/v1/turn/credentials?apiKey=<apiKey>"
					class="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-colors duration-200 placeholder:text-gray-300"
				/>
				{#if errorMessage}
					<p class="text-xs text-red-600">{errorMessage}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label for="flottformSignalingServerUrlBase" class="text-xs font-semibold text-gray-600"
					>Signaling server base URL</label
				>
				<input
					bind:value={flottformSignalingServerUrlBase}
					type="text"
					id="flottformSignalingServerUrlBase"
					name="flottformSignalingServerUrlBase"
					placeholder="https://demo.flottform.io/flottform"
					class="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-colors duration-200 placeholder:text-gray-300"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="flottformExtensionClientsUrlBase" class="text-xs font-semibold text-gray-600"
					>Extension clients base URL</label
				>
				<input
					bind:value={flottformExtensionClientsUrlBase}
					type="text"
					id="flottformExtensionClientsUrlBase"
					name="flottformExtensionClientsUrlBase"
					placeholder="https://demo.flottform.io/browser-extension"
					class="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-colors duration-200 placeholder:text-gray-300"
				/>
			</div>

			<button
				type="submit"
				class="w-full px-3 py-2 text-xs bg-primary-blue text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-sm"
				>Save</button
			>

			{#if state === 'saved'}
				<p class="text-xs text-primary-green font-medium text-center">Settings saved!</p>
			{:else if state === 'error'}
				<p class="text-xs text-primary-red font-medium text-center">Could not save settings.</p>
			{/if}
		</form>
	</div>
</div>
