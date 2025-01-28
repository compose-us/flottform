<script lang="ts">
	import { FlottformFileInputHost } from '@flottform/forms';
	import { onMount, tick } from 'svelte';
	import { createFlottformFileSharingClientUrl, sdpExchangeServerBase } from '../../api';
	import FileExchangeProgress from '$lib/components/FileExchangeProgress.svelte';
	import ReceivedFilesList from '$lib/components/ReceivedFilesList.svelte';
	let connectionStatus:
		| 'new'
		| 'endpoint-created'
		| 'connected'
		| 'done'
		| 'disconnected'
		| 'error' = 'new';
	let connectionInfo = { link: '', qrCode: '' };
	let error: string = '';
	let createWebRtcChannel: () => void;
	let sendFiles: () => void;
	let stopFileTransfer: () => void;
	const copyToClipboard = (link: string) => {
		navigator.clipboard.writeText(link);
	};
	let outgoingInputField: HTMLInputElement;

	const addReceivedFile = (receivedFile: File) => {
		const fileDownloadUrl = URL.createObjectURL(receivedFile);
		receivedFiles = [...receivedFiles, { name: receivedFile.name, url: fileDownloadUrl }];
	};

	const removeFile = (fileIndex: number) => {
		URL.revokeObjectURL(receivedFiles[fileIndex].url);
		receivedFiles = receivedFiles.filter((_, i) => i !== fileIndex);
	};

	let receivedFiles: { url: string; name: string }[] = [];
	let sendingFilesMetaData = {
		sending: false,
		fileName: '',
		fileIndex: 0,
		currentFileSendingProgress: 0,
		totalFileCount: 0
	};

	let receivingFilesMetaData = {
		receiving: false,
		fileName: '',
		fileIndex: 0,
		currentFileReceivingProgress: 0,
		totalFileCount: 0,
		overallProgress: 0
	};

	onMount(async () => {
		const flottformFileInputHost = new FlottformFileInputHost({
			flottformApi: sdpExchangeServerBase,
			createClientUrl: createFlottformFileSharingClientUrl
		});

		flottformFileInputHost.on('new', () => {
			createWebRtcChannel = flottformFileInputHost.start;
			sendFiles = flottformFileInputHost.sendFiles;
			stopFileTransfer = flottformFileInputHost.close;
			connectionStatus = 'new';
		});
		flottformFileInputHost.on('endpoint-created', ({ link, qrCode }) => {
			connectionInfo.link = link;
			connectionInfo.qrCode = qrCode;
			connectionStatus = 'endpoint-created';
		});
		flottformFileInputHost.on('connected', async () => {
			connectionStatus = 'connected';
			await tick();
			if (outgoingInputField) {
				flottformFileInputHost.setOutgoingInputField(outgoingInputField);
			}
		});
		flottformFileInputHost.on(
			'file-sending-progress',
			({ fileIndex, fileName, currentFileProgress, totalFileCount }) => {
				sendingFilesMetaData = {
					sending: true,
					currentFileSendingProgress: Number((currentFileProgress * 100).toFixed(2)),
					fileName,
					fileIndex,
					totalFileCount
				};
			}
		);
		flottformFileInputHost.on('single-file-transfered', ({ name, type, size }) => {
			sendingFilesMetaData = {
				sending: false,
				fileName: '',
				fileIndex: 0,
				currentFileSendingProgress: 0,
				totalFileCount: 0
			};
		});

		flottformFileInputHost.on(
			'file-receiving-progress',
			({ fileIndex, totalFileCount, fileName, currentFileProgress, overallProgress }) => {
				receivingFilesMetaData = {
					receiving: true,
					currentFileReceivingProgress: Number((currentFileProgress * 100).toFixed(2)),
					fileName,
					fileIndex,
					totalFileCount,
					overallProgress
				};
			}
		);

		flottformFileInputHost.on('single-file-received', (fileReceived) => {
			addReceivedFile(fileReceived);
			receivingFilesMetaData = {
				receiving: false,
				fileName: '',
				fileIndex: 0,
				currentFileReceivingProgress: 0,
				totalFileCount: 0,
				overallProgress: 0
			};
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
		<h1 class="text-2xl font-bold text-gray-800 mb-8">Flottform File Sharing - Host</h1>
		<div class="w-full max-w-md bg-white shadow-lg rounded-lg">
			{#if connectionStatus === 'new'}
				<div class="flex flex-col items-center w-full p-8">
					<p class="mb-8 text-center">
						Start a new connection to exchange files with someone else!
					</p>
					<button
						class="bg-[#0079b2] hover:bg-[#007bff] text-white px-4 py-2 rounded-lg text-base"
						onclick={createWebRtcChannel}>Start Connection</button
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
					<!-- Send Files -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-2">Send one or multiple File</h3>
						<form action="" onsubmit={sendFiles} class="flex flex-wrap gap-2">
							<input
								type="file"
								class="flex-1 py-2 px-3 border rounded-lg"
								bind:this={outgoingInputField}
								multiple
							/>
							<button
								type="submit"
								disabled={sendingFilesMetaData.sending}
								class="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed"
							>
								{sendingFilesMetaData.sending ? 'Sending...' : 'Send'}
							</button>
						</form>
						{#if sendingFilesMetaData.sending}
							<FileExchangeProgress
								fileExchangeType="sending"
								exchangeFilesMetaData={{
									...sendingFilesMetaData,
									currentFileProgress: sendingFilesMetaData.currentFileSendingProgress
								}}
							/>
						{/if}
					</div>

					<!-- Received Files -->
					<div>
						<h3 class="text-lg font-medium mb-2">Received Files</h3>
						<ul class="space-y-2">
							{#if receivedFiles.length === 0}
								<p class="italic text-sm">---No Files Received Yet---</p>
							{:else}
								<ReceivedFilesList {receivedFiles} {removeFile} />
							{/if}
						</ul>
						{#if receivingFilesMetaData.receiving}
							<FileExchangeProgress
								fileExchangeType="receiving"
								exchangeFilesMetaData={{
									...receivingFilesMetaData,
									currentFileProgress: receivingFilesMetaData.currentFileReceivingProgress
								}}
							/>
						{/if}
					</div>
					<button
						onclick={stopFileTransfer}
						class="bg-[#660000] hover:bg-[#b30000] text-white px-4 py-2 rounded-lg text-base mt-4"
						>Stop File Transfer</button
					>
				</div>
			{:else if connectionStatus === 'disconnected'}
				<div class="flex flex-col items-center w-full gap-4 p-8">
					<p class="text-center">Channel is disconnected!</p>
					<p class="text-center">Do want to connect one more time? Click the button below!</p>
					<button
						onclick={createWebRtcChannel}
						class="bg-[#0079b2] hover:bg-[#007bff] text-white px-4 py-2 rounded-lg text-base"
						>Re-connect!</button
					>
				</div>
			{:else if connectionStatus === 'error'}
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
