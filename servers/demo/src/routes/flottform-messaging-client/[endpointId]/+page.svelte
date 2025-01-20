<script lang="ts">
	import { FlottformTextInputClient } from '@flottform/forms';
	import { sdpExchangeServerBase } from '../../../api';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let connectionStatus = $state<'init' | 'connected' | 'done' | 'disconnected' | 'error'>('init');
	let error = $state<string>('');
	let createWebRtcChannel: () => void;
	let messagesContainer: HTMLDivElement | null = null;
	let sendMessage: (text: string) => void;
	let endConversation: () => void;

	let messageInput = $state<string>('');
	let messages = $state<{ sender: string; text: string }[]>([]);

	function handleSend() {
		if (messageInput.trim()) {
			sendMessage(messageInput);
			messages = [...messages, { text: messageInput, sender: 'client' }];
			messageInput = '';
		}
	}
	function scrollToBottomOfMessages() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	onMount(async () => {
		const flottformTextInputClient = new FlottformTextInputClient({
			endpointId: $page.params.endpointId,
			flottformApi: sdpExchangeServerBase
		});

		flottformTextInputClient.start();
		sendMessage = flottformTextInputClient.sendText;
		endConversation = flottformTextInputClient.close;

		flottformTextInputClient.on('connected', () => {
			connectionStatus = 'connected';
		});
		flottformTextInputClient.on('text-received', (textReceived) => {
			messages = [...messages, { text: textReceived, sender: 'host' }];
		});
		flottformTextInputClient.on('disconnected', () => {
			connectionStatus = 'disconnected';
		});
		flottformTextInputClient.on('error', (e) => {
			connectionStatus = 'error';
			error = e;
		});
	});
	$effect(() => {
		if (messages.length > 0) {
			scrollToBottomOfMessages();
		}
	});
</script>

<svelte:head>
	<title>Flottform DEMO</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center overflow-hidden bg-gray-50">
	<div class="max-w-screen-xl w-full p-4 box-border flex flex-col items-center">
		<h1 class="text-2xl font-bold text-gray-800 mb-8">Flottform Messaging - Client</h1>
		<div class="w-full max-w-md bg-white shadow-lg rounded-lg">
			{#if connectionStatus === 'init'}
				<div class="flex flex-col items-center w-full p-8">
					<p class="p-8 text-center">Trying to connect to the host...</p>
				</div>
			{:else if connectionStatus === 'connected'}
				<div class="flex flex-col rounded-lg border-[#ddd] h-[60vh]">
					<div
						class="flex flex-col gap-3 flex-grow overflow-y-auto p-5 scroll-smooth"
						bind:this={messagesContainer}
					>
						{#if messages.length === 0}
							<p class="text-center italic">
								You're connected to Host! You can start exchanging messages!
							</p>
						{/if}
						{#each messages as message}
							<div class="p-3 rounded-lg max-w-[70%] break-words {message.sender}">
								<p>{message.text}</p>
							</div>
						{/each}
					</div>
					<div class="p-5 border-t border-[#ddd]">
						<input
							type="text"
							class="border border-[#ddd] p-3 mb-3 w-full rounded"
							bind:value={messageInput}
							placeholder="Type your message..."
							onkeypress={(e) => e.key === 'Enter' && handleSend()}
						/>
						<div class="flex gap-3 flex-col sm:flex-row">
							<button
								class="text-white px-5 py-2.5 rounded-md border-none cursor-pointer bg-[#007bff] hover:bg-[#0056b3]"
								onclick={handleSend}>Send</button
							>
							<button
								class="text-white px-5 py-2.5 rounded-md border-none cursor-pointer bg-[#dc3545] hover:bg-[#c82333]"
								onclick={endConversation}
							>
								End Conversation
							</button>
						</div>
					</div>
				</div>
			{/if}
			{#if connectionStatus === 'disconnected'}
				<div class="flex flex-col items-center w-full gap-4 p-8">
					<p class="text-center">Connection Channel Disconnected!</p>
					<p class="text-center">
						Do want to connect one more time? Scan the QR code from the other peer or paste the link
						to the browser!
					</p>
				</div>
			{/if}
			{#if connectionStatus === 'error'}
				<div class="flex flex-col items-center w-full gap-4 p-8">
					<p class="text-center text-red-500">
						Connection Failed with the following error: {error}
					</p>
					<button
						onclick={createWebRtcChannel}
						class="bg-[#0079b2] hover:bg-[#007bff] text-white px-4 py-2 rounded-lg text-base"
						>Try to Connect Again</button
					>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.client {
		align-self: flex-end;
		background-color: #007bff;
		color: white;
	}

	.host {
		align-self: flex-start;
		background-color: #e9ecef;
		color: black;
	}
</style>
