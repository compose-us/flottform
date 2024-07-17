<script lang="ts">
	import { createFlottformInput } from '@flottform/forms';
	import { onMount } from 'svelte';
	import { createClientUrl, sdpExchangeServerBase } from '../../api';
	import { base } from '$app/paths';
	import { writable } from 'svelte/store';

	type FlottformChannel = any;

	let openFlottformChannels = writable<Array<FlottformChannel>>([]);

	let flottformDialog = writable<{ open: boolean; channel: null | FlottformChannel }>({
		open: false,
		channel: null
	});

	function initFlottform(options: any): any {
		const { createClientUrl } = options;
		return {
			createFileInputChannel(options: { name: string; fileInputField: HTMLInputElement }) {
				return {
					name: options.name,
					fileInputField: options.fileInputField,
					clientUrl: createClientUrl({ endpointId: options.name })
				};
			}
		};
	}

	onMount(async () => {
		const fileInputFields = document.querySelectorAll(
			'input[type=file]'
		) as NodeListOf<HTMLInputElement>;
		const flottformInstance = initFlottform({
			flottformApi: sdpExchangeServerBase,
			async createClientUrl({ endpointId }: any) {
				return `${window.location.origin}${base}/form2-client/${endpointId}`;
			},
            mode: 'default'
		});

		for (const fileInputField of fileInputFields) {
			const channel = flottformInstance.createFileInputChannel({
				name: fileInputField.name,
				fileInputField,
			});
			$openFlottformChannels = [...$openFlottformChannels, channel];
		}
	});
</script>

<svelte:head>
	<title>Flottform DEMO</title>
</svelte:head>

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 gap-8">
	<h1>some form</h1>
	<div id="flottform" class="flottform">
		<ul id="flottform-opener">
			{#each $openFlottformChannels as channel}
				<li>
					<button
						type="button"
						on:click={() => {
							$flottformDialog = {
								open: true,
								channel
							};
						}}>{channel.name}</button
					>
				</li>
			{/each}
		</ul>
	</div>
	{#if $flottformDialog.open}
		<div id="flottform-dialog" class="flottform-dialog">
			hello. {$flottformDialog.channel.name}
			{#await $flottformDialog.channel.clientUrl}
				Loading clientUrl
			{:then clientUrl}
				<div>URL: {clientUrl}</div>
			{/await}
			<button
				on:click={() => {
					$flottformDialog.open = false;
				}}>close</button
			>
		</div>
	{/if}
	<form class="grid grid-cols-1 gap-8">
		<label class="grid">
			<span>Please upload a file:</span>
			<input type="file" name="fileA" />
		</label>
		<label class="grid">
            <span>Please upload another file:</span>
			<input type="file" name="fileB" />
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
