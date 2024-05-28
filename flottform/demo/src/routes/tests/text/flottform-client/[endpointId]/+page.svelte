<script lang="ts">
	import { connectToFlottform, type ClientState } from '@flottform/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { sdpExchangeServerBase } from '../../../../../api';

	let sendFileToPeer = () => {};
	let textInput: HTMLInputElement;
	let currentState: ClientState = 'init';
	let currentPercentage = 0;

	onMount(async () => {
		try {
			const result = await connectToFlottform({
				endpointId: $page.params.endpointId,
				fileInput: textInput,
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
			<div class="flex flex-col">
				<label for="text-to-upload">Write your text here</label>
				<input
					type="text"
					class="border rounded px-4 py-2"
					bind:this={textInput}
					id="text-to-upload"
				/>
			</div>
		</div>
	</form>

	<div>Connection state: {currentState}</div>
</div>
