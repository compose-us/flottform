<script lang="ts">
	import { createFlottformInput } from '@flottform/forms';
	import { env } from '$env/dynamic/public';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import type { FlottformState } from '../../../forms/dist/internal';
	import ShowLocation from './ShowLocation.svelte';

	const sdpExchangeServerBase =
		env.PUBLIC_FLOTTFORM_SERVER_BASE || 'https://192.168.168.60:5177/flottform';

	const clientBase = env.PUBLIC_FLOTTFORM_CLIENT_BASE || 'https://192.168.168.60:5176/now/';

	const createClientUrl = async ({ endpointId }: { endpointId: string }) => {
		if (!browser) {
			throw Error('should not create a client URL when not in browser mode');
		}
		return `${clientBase}${endpointId}`;
	};

	let inputField: HTMLInputElement;
	let partnerLink: HTMLAnchorElement;
	let qrCodeImage: HTMLImageElement;
	let createChannelHandler: () => void;
	let currentState = writable<FlottformState>('new');
	let qrCodeData = writable<string>('');
	let partnerLinkHref = writable<string>('');
	let latitude = writable<number>();
	let longitude = writable<number>();

	onMount(() => {
		createFlottformInput({
			flottformApi: sdpExchangeServerBase,
			createClientUrl,
			useDefaultUi: false,
			onProgress: async () => {},
			onResult: async ({ arrayBuffers }) => {
				const decoder = new TextDecoder();
				let result = '';
				for (const ab of arrayBuffers) {
					result += decoder.decode(ab);
				}
				const coords = JSON.parse(result);
				$latitude = coords.latitude;
				$longitude = coords.longitude;
				inputField.value = result;
			},
			onStateChange: (state, details) => {
				$currentState = state;
				if (state === 'new') {
					const { createChannel } = details;
					createChannelHandler = createChannel;
					return;
				}
				if (state === 'waiting-for-client') {
					const { qrCode, link } = details;
					console.log({ qrCode, link });
					$qrCodeData = qrCode;
					$partnerLinkHref = link;
					return;
				}
			}
		});
	});
</script>

<div class="w-full min-h-svh grid place-items-center">
	<input type="hidden" name="location" bind:this={inputField} />
	{#if $currentState === 'new'}
		<button on:click={createChannelHandler} class="border border-primary-blue rounded px-4 py-2"
			>Ask your friend to share their location</button
		>
	{:else if $currentState === 'waiting-for-client'}
		<div>
			<img bind:this={qrCodeImage} alt={$partnerLinkHref} src={$qrCodeData} class="mx-auto" />
			<a bind:this={partnerLink} href={$partnerLinkHref} rel="external">{$partnerLinkHref}</a>
		</div>
	{:else if $currentState === 'waiting-for-ice'}
		Trying to establish a connection with your friend
	{:else if $currentState === 'waiting-for-file'}
		Waiting for file
	{:else if $currentState === 'receiving-data'}
		Receiving location
	{:else if $currentState === 'done'}
		<div class="h-3/4 max-w-3xl w-full">
			<ShowLocation latitude={$latitude} longitude={$longitude} />
		</div>
	{:else if $currentState === 'error'}
		ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR--
	{/if}
</div>
