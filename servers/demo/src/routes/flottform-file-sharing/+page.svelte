<script lang="ts">
	import { FlottformFileInputHost } from '@flottform/forms';
	import { onMount } from 'svelte';
	import { createFlottformFileSharingClientUrl, sdpExchangeServerBase } from '../../api';
	let connectionStatus = $state<
		'new' | 'endpoint-created' | 'connected' | 'done' | 'disconnected' | 'error'
	>('new');
	let connectionInfo = { link: '', qrCode: '' };
	let error = $state<string>('');
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

	let fileToSend = null;
	let receivedFiles: { url: string; name: string }[] = [
		{ url: 'url1', name: 'nidhal' },
		{ url: 'url2', name: 'labidi' }
	];
	let sendingProgress = 0;
	let receivingProgress = 0;

	function sendFile() {
		sendingProgress = 0;
		const interval = setInterval(() => {
			sendingProgress += 10;
			if (sendingProgress >= 100) {
				clearInterval(interval);
				sendingProgress = 100;
			}
		}, 500);
	}
	onMount(async () => {
		const flottformFileInputHost = new FlottformFileInputHost({});

		flottformFileInputHost.on('new', () => {
			/* createWebRtcChannel = flottformFileInputHost.start;
			sendMessage = flottformFileInputHost.sendText;
			endConversation = flottformFileInputHost.close; */
			connectionStatus = 'new';
		});
		flottformFileInputHost.on('endpoint-created', ({ link, qrCode }) => {
			connectionInfo.link = link;
			connectionInfo.qrCode = qrCode;
			connectionStatus = 'endpoint-created';
		});
		flottformFileInputHost.on('connected', () => {
			connectionStatus = 'connected';
		});

		flottformFileInputHost.on('disconnected', () => {
			connectionStatus = 'disconnected';
		});
		flottformFileInputHost.on('error', (e) => {
			connectionStatus = 'error';
			error = e.message;
		});
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
					<p class="mb-8 text-center">
						Start a new connection to exchange files with someone else!
					</p>
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
				<div class="p-6 bg-white rounded-lg shadow-md">
					<h2 class="text-xl font-semibold mb-4">File Sharing</h2>

					<!-- Send File -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">Send a File</h3>
						<div class="flex items-center space-x-2">
							<input type="file" class="flex-1 py-2 px-3 border rounded-lg" />
							<button
								onclick={sendFile}
								class="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
							>
								Send
							</button>
						</div>
						{#if sendingProgress > 0 && sendingProgress < 100}
							<p class="mt-2 text-sm text-gray-500">Sending: {sendingProgress}%</p>
						{/if}
					</div>

					<!-- Received Files -->
					<div>
						<h3 class="text-lg font-medium mb-2">Received Files</h3>
						<ul class="space-y-2">
							{#each receivedFiles as file}
								<li class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
									<span class="text-sm">{file.name}</span>
									<a
										href={file.url}
										download={file.name}
										class="text-blue-500 hover:underline text-sm"
									>
										Download
									</a>
								</li>
							{/each}
						</ul>
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
