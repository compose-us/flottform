<script lang="ts">
	import { connectToFlottform } from '@flottform/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { sdpExchangeServerBase } from '$lib/api';

	let currentState = $state<'init' | 'start' | 'sending' | 'done' | 'error-user-denied' | 'error'>(
		'init'
	);
	let fileInput: HTMLInputElement;
	let updateCurrentPosition = $state<() => void>();

	onMount(async () => {
		try {
			const { createSendFileToPeer } = await connectToFlottform({
				endpointId: $page.params.endpointId,
				fileInput,
				flottformApi: sdpExchangeServerBase,
				onStateChange(state) {
					if (state === 'connected') {
						currentState = 'start';
					}
				},
				onError(error) {
					currentState = 'error';
					alert(`could not connect ${error}`);
				}
			});
			const send = await createSendFileToPeer({});

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
							fileInput.value = JSON.stringify(coords);
							try {
								await send();
								currentState = 'done';
							} catch (e) {
								currentState = 'error';
								alert(`could not send location ${e}!`);
							}
						},
						(error) => {
							console.log('Error getting position', error);
							if (error.code === 1) {
								currentState = 'error-user-denied';
								return;
							}
							currentState = 'error';
						}
					);
				} catch (err) {
					currentState = 'error';
					console.log('Error getting navigators current position', err);
				}
			};
		} catch (err) {
			currentState = 'error';
			console.log('Error connecting to flottform', err);
		}
	});
</script>

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 gap-8 min-h-svh">
	<input type="hidden" name="location" bind:this={fileInput} value="" />
	{#if currentState === 'init'}
		<h1>Trying to connect to host</h1>
	{:else if currentState === 'start'}
		<h1>Let me know your location, please!</h1>
		<div class="mx-auto">
			<button on:click={updateCurrentPosition} class="border border-primary-blue rounded px-4 py-2"
				>Send current location</button
			>
		</div>
	{:else if currentState === 'sending'}
		<h1>Sending location to your friend!</h1>
	{:else if currentState === 'error-user-denied'}
		<h1>You need to allow sending a location for this app to work!</h1>
		<button on:click={updateCurrentPosition}>Try again</button>
	{:else if currentState === 'error'}
		<h1>There was a problem with the connection - please try again! 🤕</h1>
	{:else if currentState === 'done'}
		<h1>Your friend should now get where you at!</h1>
	{/if}
</div>
