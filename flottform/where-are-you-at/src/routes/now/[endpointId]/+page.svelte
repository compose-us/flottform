<script lang="ts">
	import { connectToFlottform } from '@flottform/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	const sdpExchangeServerBase =
		env.PUBLIC_FLOTTFORM_SERVER_BASE || 'https://172.16.23.195:5177/flottform';

	let fileInput: HTMLInputElement;
	let updateCurrentPosition: () => void;

	onMount(async () => {
		try {
			const { createSendFileToPeer } = await connectToFlottform({
				endpointId: $page.params.endpointId,
				fileInput,
				flottformApi: sdpExchangeServerBase,
				onError(error) {
					alert(`could not connect ${error}`);
				}
			});
			const send = await createSendFileToPeer({});

			updateCurrentPosition = () => {
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
						alert(`should send ${fileInput.value}`);
						try {
							await send();
							alert('location sent!');
						} catch (e) {
							alert(`could not send location ${e}!`);
						}
					},
					(error) => {
						console.error({ error });
					}
				);
			};
		} catch (err) {
			console.log('Error connecting to flottform', err);
		}
	});
</script>

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 gap-8">
	<h1>Let me know your location, please!</h1>
	<input type="hidden" name="location" bind:this={fileInput} value="" />
	<button on:click={updateCurrentPosition}>Send current location</button>
</div>
