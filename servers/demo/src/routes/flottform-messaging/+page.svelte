<script lang="ts">
	import { FlottformTextInputHost } from '@flottform/forms';
	import { onMount } from 'svelte';
	import { createFlottformMessagingClientUrl, sdpExchangeServerBase } from '../../api';
	let connectionStatus = $state<
		'new' | 'endpoint-created' | 'connected' | 'done' | 'disconnected' | 'error'
	>('new');
	let connectionInfo = { link: '', qrCode: '' };
	let error = $state<string>('');
	let messagesContainer: HTMLDivElement | null = null;
	let createWebRtcChannel: () => void;
	let endConversation: () => void;
	let sendMessage: (text: string) => void;
	const copyToClipboard = (link: string) => {
		navigator.clipboard.writeText(link);
	};

	let messageInput = $state<string>('');
	let messages = $state<{ sender: string; text: string }[]>([]);

	function handleSend() {
		if (messageInput.trim()) {
			sendMessage(messageInput);
			messages = [...messages, { text: messageInput, sender: 'host' }];
			messageInput = '';
		}
	}

	function scrollToBottomOfMessages() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	onMount(async () => {
		const flottformTextInputHost = new FlottformTextInputHost({
			flottformApi: sdpExchangeServerBase,
			createClientUrl: createFlottformMessagingClientUrl
		});

		flottformTextInputHost.on('new', () => {
			createWebRtcChannel = flottformTextInputHost.start;
			sendMessage = flottformTextInputHost.sendText;
			endConversation = flottformTextInputHost.close;
			connectionStatus = 'new';
		});
		flottformTextInputHost.on('endpoint-created', ({ link, qrCode }) => {
			connectionInfo.link = link;
			connectionInfo.qrCode = qrCode;
			connectionStatus = 'endpoint-created';
		});
		flottformTextInputHost.on('connected', () => {
			connectionStatus = 'connected';
		});
		flottformTextInputHost.on('text-received', (textReceived) => {
			messages = [...messages, { text: textReceived, sender: 'client' }];
		});
		flottformTextInputHost.on('disconnected', () => {
			connectionStatus = 'disconnected';
		});
		flottformTextInputHost.on('error', (e) => {
			connectionStatus = 'error';
			error = e.message;
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
		<h1 class="text-2xl font-bold text-gray-800 mb-8">Flottform Messaging - Host</h1>
		<div class="w-full max-w-md bg-white shadow-lg rounded-lg">
			{#if connectionStatus === 'new'}
				<div class="flex flex-col items-center w-full p-8">
					<p class="mb-8 text-center">Start a new connection to chat with someone else!</p>
					<button
						class="bg-[#0079b2] hover:bg-[#007bff] text-white px-4 py-2 rounded-lg text-base"
						onclick={() => {
							createWebRtcChannel();
						}}>Start Connection</button
					>
				</div>
			{:else if connectionStatus === 'endpoint-created'}
				<div class="flex flex-col items-center space-y-4 w-full mb-8 p-8">
					<div class="w-full max-w-xs">
						<img src={connectionInfo.qrCode} alt="QR Code" class="w-full h-auto" />
					</div>
					<p class="mt-4 text-center">
						Scan the QR code or use the link below to connect your device
					</p>
					<div class="w-full flex items-center gap-2 bg-slate-100 p-2 rounded mt-4">
						<code class="flex-1 truncate text-sm">{connectionInfo.link}</code>
						<button
							class="shrink-0 bg-[#0079b2] hover:bg-[#007bff] text-white px-4 py-2 rounded-lg text-base"
							onclick={() => copyToClipboard(connectionInfo.link)}
						>
							Copy
						</button>
					</div>
					<button
						class="bg-[#0079b2] hover:bg-[#007bff] text-white px-4 py-2 rounded-lg text-base"
						onclick={createWebRtcChannel}>Restart Connection</button
					>
				</div>
			{:else if connectionStatus === 'connected'}
				<div class="flex flex-col rounded-lg border-[#ddd] h-[60vh]">
					<div
						class="flex flex-col gap-3 flex-grow overflow-y-auto p-5 scroll-smooth"
						bind:this={messagesContainer}
					>
						{#if messages.length === 0}
							<p class="text-center italic">
								You're connected to Client! You can start exchanging messages!
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
					<p class="text-center">Channel is disconnected!</p>
					<p class="text-center">Do want to connect one more time? Click the button below!</p>
					<button
						onclick={createWebRtcChannel}
						class="bg-[#0079b2] hover:bg-[#007bff] text-white px-4 py-2 rounded-lg text-base"
						>Re-connect!</button
					>
				</div>
			{/if}
			{#if connectionStatus === 'error'}
				<div class="flex flex-col items-center w-full gap-4 p-8">
					<p class="text-center text-red-500">
						Connection Channel Failed with the following error: {error}
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
	.host {
		align-self: flex-end;
		background-color: #007bff;
		color: white;
	}

	.client {
		align-self: flex-start;
		background-color: #e9ecef;
		color: black;
	}
</style>
