<script lang="ts">
	import { createFlottformChannel, type FlottformInstance } from '@flottform/forms';
	import { onMount } from 'svelte';
	import { sdpExchangeServerBase } from '../../api';
	import { writable } from 'svelte/store';

	export let resultField: HTMLInputElement;

	let channelPromise: Promise<FlottformInstance> | null = null;
	let isOpen = false;
	let progress = writable<number>(0);

	function initFlottform() {
		if (channelPromise !== null) {
			return;
		}

		channelInstance = createFlottformChannel({
			flottformApi: sdpExchangeServerBase,
			async createClientUrl({ endpointId }) {
				return '';
			}
		});
		channelInstance.on('');

		channelPromise?.then((channel) => {
			channel.on('progress', (percentage) => {
				$progress = percentage;
			});
		});
	}

	console.log({ channelPromise });
</script>

<button
	on:click={() => {
		initFlottform();
		isOpen = !isOpen;
	}}>open a connection to another device</button
>

{#if isOpen}
	<dialog>
		{#await channelPromise}
			<div>Loading</div>
		{:then channel}
			{#if channel.state === 'created'}
				<div>Scan this code to transfer from your phone!</div>
				<img src={channel.qrCode} alt="QR code link to {channel.url}" />
				<div>{channel.url}</div>
			{:else if channel.state === 'connected'}
				<div>Someone is connected!</div>
			{:else if channel.state === 'receiving'}
				<div>Receiving data {$progress}</div>
			{/if}
		{:catch error}
			<div>oh noes! {error}</div>
		{/await}
	</dialog>
{/if}
