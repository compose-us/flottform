<script lang="ts">
	import { connectToFlottform, type ClientState } from '@flottform/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import { sdpExchangeServerBase } from '../../../../../api';

	let sendFileToPeer = () => {};
	let canvas: HTMLCanvasElement;
	let button: HTMLButtonElement;
	let currentState: ClientState = 'init';
	let currentPercentage = 0;

	onMount(async () => {
		try {
			const result = await connectToFlottform({
				endpointId: $page.params.endpointId,
				fileInput: canvas,
				flottformApi: sdpExchangeServerBase,
				onError(error) {
					currentState = 'error';
					console.log(error);
				},
				onStateChange(state) {
					currentState = state;
				}
			});

			sendFileToPeer = result.createSendFileToPeer({
				onProgress(p) {
					currentPercentage = p;
				}
			});
		} catch (err) {
			console.log('Error connecting to flottform', err);
			currentState = 'error';
		}
	});
</script>

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 gap-8">
	<h1>Flottform "Return and complaints" client</h1>
	<p>Use this form to send a file from this device to the open form on the main device.</p>

	<form action="" on:submit={sendFileToPeer}>
		<div class="flex flex-col gap-4">
			<Canvas bind:canvasElement={canvas} />
		</div>
		{#if currentState === 'connected'}
			<button
				type="submit"
				bind:this={button}
				class="group relative w-fit cursor-pointer overflow-hidden rounded-md border-2 bg-primary-blue text-white border-primary-blue px-12 py-3 font-semibold disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:pointer-events-none"
			>
				<span
					class="ease absolute top-1/2 h-0 w-64 origin-center -translate-x-20 rotate-45 bg-white transition-all duration-300 group-hover:h-64 group-hover:-translate-y-32"
				/>
				<span class="ease relative transition duration-300 group-hover:text-primary-blue"
					>Send file</span
				>
			</button>
		{/if}
	</form>

	<div>Connection state: {currentState}</div>
</div>
