<script lang="ts">
	import { FlottformTextInputHost } from '@flottform/forms';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import ShowLocation from './ShowLocation.svelte';
	import { clientBase, sdpExchangeServerBase } from '$lib/api';

	type Coordinates = {
		accuracy: number;
		altitude: number | null;
		altitudeAccuracy: number | null;
		heading: number | null;
		latitude: number;
		longitude: number;
		speed: number | null;
	};

	const createClientUrl = async ({ endpointId }: { endpointId: string }) => {
		if (!browser) {
			throw Error('should not create a client URL when not in browser mode');
		}
		return `${clientBase}${endpointId}`;
	};

	let qrCodeImage: HTMLImageElement;
	let createChannelHandler: () => void;
	let currentState = writable<
		'new' | 'endpoint-created' | 'webrtc:waiting-for-ice' | 'connected' | 'done' | 'error'
	>('new');
	let qrCodeData = writable<string>('');
	let partnerLinkHref = writable<string>('');
	let latitude = writable<number>();
	let longitude = writable<number>();

	onMount(() => {
		const flottformTextInputHost = new FlottformTextInputHost({
			flottformApi: sdpExchangeServerBase,
			createClientUrl
		});
		createChannelHandler = flottformTextInputHost.start;

		flottformTextInputHost.on('webrtc:waiting-for-ice', () => {
			$currentState = 'webrtc:waiting-for-ice';
		});
		flottformTextInputHost.on('endpoint-created', ({ link, qrCode }) => {
			$currentState = 'endpoint-created';
			$partnerLinkHref = link;
			$qrCodeData = qrCode;
		});
		flottformTextInputHost.on('connected', () => {
			$currentState = 'connected';
		});
		flottformTextInputHost.on('done', (message: string) => {
			$currentState = 'done';
			const coords: Coordinates = JSON.parse(message);
			$latitude = coords.latitude;
			$longitude = coords.longitude;
			// Channel will be closed since we won't receive data anymore.
			flottformTextInputHost.close();
		});
		flottformTextInputHost.on('error', () => {
			$currentState = 'error';
		});
	});
	const copyLinkToClipboard = (e: Event) => {
		const copyToClipboardButton = e.target as HTMLButtonElement;
		const flottformLink = (copyToClipboardButton.nextElementSibling as HTMLDivElement).innerText;
		navigator.clipboard
			.writeText(flottformLink)
			.then(() => {
				copyToClipboardButton.innerText = '✅';
				setTimeout(() => {
					copyToClipboardButton.innerText = '📋';
				}, 1000);
			})
			.catch((error) => {
				copyToClipboardButton.innerText = `❌ Failed to copy: ${error}`;
				setTimeout(() => {
					copyToClipboardButton.innerText = '📋';
				}, 1000);
			});
	};
</script>

<div class="w-full grow grid place-items-center px-4">
	{#if $currentState === 'new'}
		<button
			on:click={createChannelHandler}
			disabled={createChannelHandler === undefined}
			class="border border-primary-blue rounded px-4 py-2 disabled:bg-gray-200 flex gap-4"
		>
			{#if createChannelHandler === undefined}<span class="animate-spin">⏳</span>{/if}
			Ask your friend to share their location
			{#if createChannelHandler === undefined}<span class="animate-spin">⏳</span>{/if}
		</button>
	{:else if $currentState === 'endpoint-created'}
		<div>
			<img bind:this={qrCodeImage} alt={$partnerLinkHref} src={$qrCodeData} class="mx-auto" />
			<div class="flex flex-row gap-4 items-center">
				<button
					class="rounded-xl border-2 border-gray-300 bg-gray-300 px-2 py-1 text-xs"
					type="button"
					title="Copy link to clipboard"
					aria-label="Copy link to clipboard"
					on:click={copyLinkToClipboard}>📋</button
				>
				<div
					class="grow content-center inline-block whitespace-break-spaces break-all text-base overflow-auto border-none outline-none resize-none"
				>
					{$partnerLinkHref}
				</div>
			</div>
		</div>
	{:else if $currentState === 'webrtc:waiting-for-ice'}
		Trying to establish a connection with your friend
	{:else if $currentState === 'connected'}
		Waiting for friend to send their location
	{:else if $currentState === 'done'}
		<div class="h-3/4 max-w-3xl w-full">
			<ShowLocation latitude={$latitude} longitude={$longitude} />
		</div>
	{:else if $currentState === 'error'}
		Error connecting to friend
	{/if}
</div>
