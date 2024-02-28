<script lang="ts">
	import { connectToFlottform, type ClientState } from '@flottform/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let sendFileToPeer = () => {};
	let fileInput: HTMLInputElement;
	let button: HTMLButtonElement;
	let currentState: ClientState = 'loading';
	let currentPercentage = 0;

	onMount(async () => {
		const result = await connectToFlottform({
			endpointId: $page.params.endpointId,
			fileInput,
			flottformApi: 'http://localhost:5177/flottform',
			onStateChange(state) {
				currentState = state;
				button.innerHTML = `${currentState} - ${currentPercentage}%`;
			}
		});

		sendFileToPeer = result.createSendFileToPeer({
			onProgress(p) {
				currentPercentage = p;
				button.innerHTML = `${currentState} - ${currentPercentage}%`;
			}
		});
	});
</script>

<h1>Flottform connector</h1>
<p>Please send your file here</p>

<form action="" on:submit={sendFileToPeer}>
	<input type="file" name="file" bind:this={fileInput} />
	<button type="submit" bind:this={button}>Send file</button>
</form>
