<script lang="ts">
	import { FlottformFileInputHost, defaultThemeForFileInput } from '@flottform/forms';
	import { onMount } from 'svelte';
	import { createClientUrl, sdpExchangeServerBase } from '../../api';

	let flottformAnchor: HTMLElement;

	onMount(async () => {
		const fileInputs = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		const filesWithLabels = [
			{
				file: document.getElementById('document-A') as HTMLInputElement,
				label: 'Label for File Input 1'
				// buttonLabel: 'Button 1'
			},
			{
				file: document.getElementsByName('fileB')[0] as HTMLInputElement,
				buttonLabel: 'Button 2'
			},
			{
				file: document.getElementsByName('fileC')[0] as HTMLInputElement
			}
		];
		for (const { file, label, buttonLabel } of filesWithLabels) {
			const flottformFileInputHost = new FlottformFileInputHost({
				flottformApi: sdpExchangeServerBase,
				createClientUrl,
				inputField: file,
				theme: defaultThemeForFileInput(flottformAnchor, { label, buttonLabel })
			});
		}
		// flottformFileInputHost.on('new', () => {
		// 	// Optional: Custom UI
		// });
		// flottformFileInputHost.on('connected', () => {
		// 	// Optional: Custom UI
		// });
		// flottformFileInputHost.on('receive', () => {
		// 	// Optional: Custom UI
		// });
		// flottformFileInputHost.on('progress', (p) => {
		// 	// Optional: Custom UI
		// 	console.log('progress=', p);
		// });
		// flottformFileInputHost.on('disconnected', () => {
		// 	// Optional: Custom UI
		// });
		// flottformFileInputHost.on('error', (err) => {
		// 	// Optional: Custom UI
		// });
		// flottformFileInputHost.on('endpoint-created', ({ link, qrCode }) => {
		// 	// Optional: Custom UI
		// });
		// flottformFileInputHost.on('webrtc:waiting-for-client', (link) => {
		// 	// Optional: Custom UI
		// });
		// flottformFileInputHost.on('webrtc:waiting-for-ice', () => {
		// 	// Optional: Custom UI
		// });
		// flottformFileInputHost.on('webrtc:waiting-for-file', () => {
		// 	// Optional: Custom UI
		// });
		// flottformFileInputHost.on('done', () => {
		// 	// Optional: Custom UI
		// });

		// flottformFileInputHost.start();
	});
</script>

<svelte:head>
	<title>Flottform DEMO</title>
</svelte:head>

<div
	id="flottform-anchor"
	bind:this={flottformAnchor}
	class="absolute top-0 right-0 w-64 flottform-anchor"
></div>
<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 gap-8">
	<h1>Multiple Input Form</h1>
	<form class="grid grid-cols-1 gap-8">
		<label class="grid">
			<span>Please upload the first file:</span>
			<input type="file" name="fileA" id="document-A" multiple />
		</label>
		<label class="grid">
			<span>Please upload the second file:</span>
			<input type="file" name="fileB" />
		</label>
		<label class="grid">
			<span>Please upload the third file:</span>
			<input type="file" name="fileC" />
		</label>
		<label class="grid">
			<span>Please Enter your OTP (One Time password):</span>
			<input type="text" name="one-time-pwd" style="border:1px solid gray; border-radius:0.2rem;" />
		</label>
		<label class="grid">
			<span>Please get the signature:</span>
			<canvas style="background-color:gray;"></canvas>
		</label>
		<label class="grid">
			<span>Text Area Tranlated to English:</span>
			<textarea style="border:1px solid gray; border-radius:0.2rem;"></textarea>
		</label>
		<button type="submit" class="border rounded p-2 bg-gray-100">Submit</button>
	</form>
</div>

<style lang="postcss">
	.flottform-anchor {
		--flottform-root-border-radius: 0px 0px 10px 10px;
	}
	.flottform {
		@apply absolute top-0 right-0;
	}
	.flottform-dialog {
		@apply fixed inset-8 border rounded bg-white;
	}
</style>
