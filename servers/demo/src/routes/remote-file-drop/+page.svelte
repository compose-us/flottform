<script lang="ts">
	import { onMount } from 'svelte';
	import { FlottformFileInputHost } from '@flottform/forms';
	import { sdpExchangeServerBase, createCustomClientUrl } from '../../api';
	let createWebRtcChannel: () => void;
	let connectionStatus = 'new';
	let connectionInfo = { link: '', qrCode: '' };
	let progress = { currentFileNumber: 0, totalNumberOfFiles: 0, currentFileName: '' };
	let error = '';

	const copyToClipboard = (link: string) => {
		navigator.clipboard.writeText(link);
	};

	onMount(async () => {
		const flottformFileInputHost = new FlottformFileInputHost({
			flottformApi: sdpExchangeServerBase,
			createClientUrl: createCustomClientUrl
		});

		flottformFileInputHost.on('new', () => {
			createWebRtcChannel = flottformFileInputHost.start;
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

		flottformFileInputHost.on('webrtc:waiting-for-ice', () => {});

		flottformFileInputHost.on('receive', () => {
			connectionStatus = 'receive';
		});

		flottformFileInputHost.on(
			'progress',
			({
				fileIndex,
				totalFileCount,
				fileName,
				currentFileProgress,
				overallProgress
			}: {
				fileIndex: number;
				totalFileCount: number;
				fileName: string;
				currentFileProgress: number;
				overallProgress: number;
			}) => {
				connectionStatus = 'progress';
				progress.currentFileName = fileName;
				progress.currentFileNumber = fileIndex + 1;
				progress.totalNumberOfFiles = totalFileCount;
			}
		);

		flottformFileInputHost.on('single-file-transferred', (receivedFile) => {
			connectionStatus = 'single-file-transferred';

			const url = window.URL.createObjectURL(receivedFile);
			const a = document.createElement('a');
			a.href = url;
			a.download = receivedFile.name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		});

		flottformFileInputHost.on('done', () => {
			connectionStatus = 'done';
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
		<h1 class="text-2xl font-bold text-gray-800 mb-8">Remote File Drop</h1>

		<div class="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
			{#if connectionStatus === 'new'}
				<div class="flex flex-col items-center w-full">
					<p class="mb-8 text-center">Start a new connection to receive files</p>
					<button
						on:click={createWebRtcChannel}
						class="bg-[#1a3066] hover:bg-[#2b4fa6] text-white px-4 py-2 rounded-lg text-base"
						>Start Connection</button
					>
				</div>
			{/if}

			{#if connectionStatus === 'endpoint-created'}
				<div class="flex flex-col items-center space-y-4 w-full mb-8">
					<div class="w-full max-w-xs">
						<img src={connectionInfo.qrCode} alt="QR Code" class="w-full h-auto" />
					</div>
					<p class="mt-4 text-center">
						Scan the QR code or use the link below to connect your device
					</p>
					<div class="w-full flex items-center gap-2 bg-slate-100 p-2 rounded mt-4">
						<code class="flex-1 truncate text-sm">{connectionInfo.link}</code>
						<button
							class="shrink-0 bg-transparent bg-[#1a3066] hover:bg-[#2b4fa6] text-white px-4 py-2 rounded-lg text-base"
							on:click={() => copyToClipboard(connectionInfo.link)}
						>
							Copy
						</button>
					</div>
				</div>
			{/if}

			{#if connectionStatus === 'connected'}
				<p class="text-center">Connected and Waiting to Receive file(s)</p>
			{/if}

			{#if connectionStatus === 'progress'}
				<p class="mb-2 text-center">Receiving: {progress.currentFileName}</p>

				<div class="w-full overflow-hidden rounded bg-[#f1f5f9] h-2">
					<div
						class="transition-[width] duration-300 ease-[ease] bg-[#3b82f6] h-full"
						style="width: {(progress.currentFileNumber / progress.totalNumberOfFiles) * 100}%"
					></div>
				</div>
				<p class="text-right text-[#64748b] text-sm mt-4">
					{progress.currentFileNumber} of {progress.totalNumberOfFiles} files
				</p>
			{/if}

			{#if connectionStatus === 'done'}
				<div class="flex flex-col items-center w-full">
					<div class="mb-2 text-4xl text-[#22c55e]">✓</div>
					<p class="text-center">All files received successfully!</p>
					<button
						on:click={createWebRtcChannel}
						class="bg-[#1a3066] hover:bg-[#2b4fa6] text-white px-4 py-2 rounded-lg text-base"
						>Start New Transfer</button
					>
				</div>
			{/if}

			{#if connectionStatus === 'error'}
				<div class="flex flex-col items-center w-full gap-4">
					<p class="text-center text-red-500">
						File Transfer Failed with the following error: {error}
					</p>
					<button
						on:click={createWebRtcChannel}
						class="bg-[#1a3066] hover:bg-[#2b4fa6] text-white px-4 py-2 rounded-lg text-base"
						>Try Again</button
					>
				</div>
			{/if}
		</div>
	</div>
</div>
