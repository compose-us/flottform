<script lang="ts">
	import { FlottformTextInputClient } from '@flottform/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { sdpExchangeServerBase } from '$lib/api';

	let currentState = $state<
		'init' | 'connected' | 'sending' | 'done' | 'error-user-denied' | 'error'
	>('init');
	let updateCurrentPosition = $state<() => void>();

	onMount(async () => {
		const flottformTextInputClient = new FlottformTextInputClient({
			endpointId: $page.params.endpointId,
			flottformApi: sdpExchangeServerBase
		});
		// Start the WebRTC connection process as soon as the page loads.
		flottformTextInputClient.start();

		// Listen to the events to update the UI appropriately
		flottformTextInputClient.on('connected', () => {
			currentState = 'connected';
		});
		flottformTextInputClient.on('text-transfered', () => {
			currentState = 'done';
		});
		flottformTextInputClient.on('error', () => {
			currentState = 'error';
		});

		updateCurrentPosition = () => {
			currentState = 'sending';
			try {
				navigator.geolocation.getCurrentPosition(
					async (position) => {
						// cannot JSON.stringify position.coords directly
						const coords = {
							accuracy: position.coords.accuracy,
							altitude: position.coords.altitude,
							altitudeAccuracy: position.coords.altitudeAccuracy,
							heading: position.coords.heading,
							latitude: position.coords.latitude,
							longitude: position.coords.longitude,
							speed: position.coords.speed
						};
						const currentLocation = JSON.stringify(coords);
						flottformTextInputClient.sendText(currentLocation);
					},
					(error) => {
						console.error('Error getting position', error);
						if (error.code === 1) {
							currentState = 'error-user-denied';
							return;
						}
						currentState = 'error';
					}
				);
			} catch (err) {
				currentState = 'error';
				console.error('Error getting navigators current position', err);
			}
		};
	});
</script>

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 gap-8 min-h-svh">
	{#if currentState === 'init'}
		<h1>Trying to connect to host</h1>
	{:else if currentState === 'connected'}
		<h1>Let me know your location, please!</h1>
		<div class="mx-auto">
			<button onclick={updateCurrentPosition} class="border border-primary-blue rounded px-4 py-2"
				>Send current location</button
			>
		</div>
	{:else if currentState === 'sending'}
		<h1>Sending location to your friend!</h1>
	{:else if currentState === 'error-user-denied'}
		<h1>You need to allow sending a location for this app to work!</h1>
		<button onclick={updateCurrentPosition}>Try again</button>
	{:else if currentState === 'error'}
		<h1>There was a problem with the connection - please try again! 🤕</h1>
	{:else if currentState === 'done'}
		<h1>Your friend should now get where you at!</h1>
	{/if}
</div>
