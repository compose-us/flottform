<script lang="ts">
	import { FlottformFileInputHost, defaultThemeForFileInput } from '@flottform/forms';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { base } from '$app/paths';
	import { sdpExchangeServerBase } from '../../api';

	const clientBase =
		env.PUBLIC_FLOTTFORM_CLIENT_BASE || 'https://192.168.0.21:5177/multiple-input-form-client';

	export const createClientUrl = async ({ endpointId }: { endpointId: string }) => {
		if (browser) {
			return `${window.location.origin}${base}/multiple-input-form-client/${endpointId}`;
		}
		return `${clientBase}/${endpointId}`;
	};

	onMount(async () => {
		const fileInputs = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		for (const file of fileInputs) {
			const flottformFileInputHost = new FlottformFileInputHost({
				flottformApi: sdpExchangeServerBase,
				createClientUrl,
				inputField: file,
				theme: defaultThemeForFileInput()
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

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 gap-8">
	<h1>Multiple Input Form</h1>
	<form class="grid grid-cols-1 gap-8">
		<label class="grid">
			<span>Please upload the first file:</span>
			<input type="file" name="fileA" multiple />
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
	.flottform {
		@apply absolute top-0 right-0;
	}
	.flottform-dialog {
		@apply fixed inset-8 border rounded bg-white;
	}
</style>
