<script lang="ts">
	import { FlottformFileInputClient } from '@flottform/forms';
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import { sdpExchangeServerBase } from '../../../api';
	import FileExchangeProgress from '$lib/components/FileExchangeProgress.svelte';
	import ReceivedFilesList from '$lib/components/ReceivedFilesList.svelte';

	let connectionStatus = 'init';
	let sendFiles: () => void;
	let stopFileTransfer: () => void;
	let error: string = '';
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

	onMount(() => {
		const flottformFileInputClient = new FlottformFileInputClient({
			flottformApi: sdpExchangeServerBase,
			endpointId: $page.params.endpointId,
			outgoingInputField
		});

		flottformFileInputClient.start();

		flottformFileInputClient.on('init', () => {
			sendFiles = flottformFileInputClient.sendFiles;
			stopFileTransfer = flottformFileInputClient.close;
			connectionStatus = 'init';
		});
		flottformFileInputClient.on('connected', async () => {
			connectionStatus = 'connected';
			await tick();
			if (outgoingInputField) {
				flottformFileInputClient.setOutgoingInputField(outgoingInputField);
			}
		});
		flottformFileInputClient.on(
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
		flottformFileInputClient.on('single-file-transfered', ({ name, type, size }) => {
			sendingFilesMetaData = {
				sending: false,
				fileName: '',
				fileIndex: 0,
				currentFileSendingProgress: 0,
				totalFileCount: 0
			};
		});

		flottformFileInputClient.on(
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

		flottformFileInputClient.on('single-file-received', (fileReceived) => {
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

		flottformFileInputClient.on('disconnected', () => {
			connectionStatus = 'disconnected';
		});
		flottformFileInputClient.on('error', (e) => {
			connectionStatus = 'error';
			error = e;
		});
	});
</script>

<div class="min-h-screen flex items-center justify-center overflow-hidden bg-gray-50">
	<div class="max-w-screen-xl w-full p-4 box-border flex flex-col items-center">
		<h1 class="text-2xl font-bold text-gray-800 mb-8">Flottform File Sharing - Client</h1>
		<div class="w-full max-w-md bg-white shadow-lg rounded-lg">
			{#if connectionStatus === 'init'}
				<p class="text-gray-700 text-center mb-6">Connecting to the host...</p>
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
					<p class="text-center">
						Do want to connect one more time? Scan the QR code or copy the link from the other
						device!
					</p>
				</div>
			{:else if connectionStatus === 'error'}
				<div class="flex flex-col items-center w-full gap-4 p-8">
					<p class="text-center text-red-500">
						Connection Channel Failed with the following error: {error}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
