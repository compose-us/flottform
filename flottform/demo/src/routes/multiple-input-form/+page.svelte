<script lang="ts">
	import { createFlottformFileInput } from '@flottform/forms';
	import { onMount } from 'svelte';
	import { createClientUrl, sdpExchangeServerBase } from '../../api';
	import { base } from '$app/paths';
	import { writable } from 'svelte/store';

	function ensureUniqueIds(inputFields: HTMLInputElement[]) {
		return inputFields.map((inputField) => {
			let id = inputField.getAttribute('flottform-p2p-transfer-channel-id') + crypto.randomUUID();
			inputField.setAttribute('flottform-p2p-transfer-channel-id', id);
			return inputField;
		});
	}

	function getFlottformEligibleInputs() {
		const allFileInputs = Array.from(document.querySelectorAll('input[type=file]'));
		const allEligibleInputs = Array.from(
			document.querySelectorAll('input[type=file][flottform-p2p-transfer-channel-id]')
		);

		if (allFileInputs.length === 0) return [];

		if (allEligibleInputs.length === 0) {
			// Apply Flottform to all input fields
			return ensureUniqueIds(allFileInputs);
		} else {
			// Apply Flottform to the input fields having the specific data attribute
			return ensureUniqueIds(allEligibleInputs);
		}
	}

	onMount(async () => {
		//const fileInputFields = getFlottformEligibleInputs();
		const firstFileInput = document.querySelector(
			'input[type=file][flottform-p2p-transfer-channel-id=uniqueID1]'
		);
		const fileInputFields = [firstFileInput];

		for (let fileInputField of fileInputFields) {
			createFlottformFileInput({
				flottformApi: sdpExchangeServerBase,
				createClientUrl,
				inputField: fileInputField
			});
		}
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
			<input type="file" name="fileA" flottform-p2p-transfer-channel-id="uniqueID1" />
		</label>
		<label class="grid">
			<span>Please upload the second file:</span>
			<input type="file" name="fileB" />
		</label>
		<label class="grid">
			<span>Please upload the third file:</span>
			<input type="file" name="fileC" flottform-p2p-transfer-channel-id="uniqueID2" />
		</label>
		<label class="grid">
			<span>Please Enter your OTP (One Time password):</span>
			<input
				type="text"
				name="one-time-pwd"
				style="border:1px solid gray; border-radius:0.2rem;"
				flottform-p2p-transfer-channel-id="uniqueID3"
			/>
		</label>
		<label class="grid">
			<span>Please get the signature:</span>
			<canvas flottform-p2p-transfer-channel-id="uniqueID3" style="background-color:gray;" />
		</label>
		<label class="grid">
			<span>Text Area Tranlated to English:</span>
			<textarea style="border:1px solid gray; border-radius:0.2rem;" />
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
