<script lang="ts">
	import { createDefaultFlottformComponent } from '@flottform/forms';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { sdpExchangeServerBase } from '../../api';

	export const createClientUrl = async ({ endpointId }: { endpointId: string }) => {
		return `${window.location.origin}${base}/multiple-input-form-client/${endpointId}`;
	};

	let flottformAnchor: HTMLElement;

	onMount(async () => {
		const fileInputs = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		const flottformComponent = createDefaultFlottformComponent({
			flottformAnchorElement: flottformAnchor
		});
		for (const file of fileInputs) {
			flottformComponent.createFileItem({
				flottformApi: sdpExchangeServerBase,
				createClientUrl,
				inputField: file,
				label: file.id || file.name || 'File'
			});
		}
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
		<label class="grid" for="canvas">
			<span>Please get the signature:</span>
			<canvas style="background-color:gray;" id="canvas"></canvas>
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
		--flottform-border-style: dashed;
		--flottform-root-border-width: 0 0 1px 1px;
		--flottform-root-border-style: solid;
		--flottform-root-border-color: #808080;
		--flottform-root-border-radius: 0px 0px 0 10px;
	}
	.flottform {
		@apply absolute top-0 right-0;
	}
	.flottform-dialog {
		@apply fixed inset-8 border rounded bg-white;
	}
</style>
