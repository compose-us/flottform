<script lang="ts">
	import { FlottformFileInputClient, FlottformTextInputClient } from '@flottform/forms';
	import { page } from '$app/stores';
	import { onMount, tick } from 'svelte';

	let currentState = $state<
		| 'init'
		| 'connected'
		| 'sending'
		| 'done'
		| 'error-user-denied'
		| 'error'
		| 'disconnected'
		| 'webrtc:connection-impossible'
	>('init');
	let sendToForm = $state<() => void>();
	let inputField: HTMLInputElement | HTMLTextAreaElement | null = $state(null);
	let textToSend = $state('');
	let inputType = $state('');
	let selectedFiles = $state<FileList | null>(null);
	let dragOver = $state(false);

	const isConnected = $derived(
		currentState === 'connected' || currentState === 'sending' || currentState === 'done'
	);

	const statusLabel = $derived(
		currentState === 'init'
			? 'Connecting...'
			: currentState === 'connected'
				? 'Connected'
				: currentState === 'sending'
					? 'Sending...'
					: currentState === 'done'
						? 'Sent'
						: currentState === 'error' || currentState === 'webrtc:connection-impossible'
							? 'Connection failed'
							: currentState === 'disconnected'
								? 'Disconnected'
								: 'Connecting...'
	);

	function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		if (e.dataTransfer?.files && inputField && inputField instanceof HTMLInputElement) {
			inputField.files = e.dataTransfer.files;
			selectedFiles = e.dataTransfer.files;
		}
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		selectedFiles = target.files;
	}

	onMount(async () => {
		const hash = JSON.parse(decodeURIComponent($page.url.hash.slice(1)));
		const options = {
			endpointId: $page.params.endpointId,
			flottformApi: hash.flottformApi,
			rtcConfiguration: hash.rtcConfiguration,
			type: hash.type
		};

		inputType = options.type;
		await tick();

		if (hash.type === 'file') {
			if (!inputField) {
				console.error('Input field is not ready yet.');
				return;
			}

			const flottformFileInputClient = new FlottformFileInputClient({
				endpointId: options.endpointId,
				fileInput: inputField as HTMLInputElement,
				flottformApi: options.flottformApi,
				rtcConfiguration: options.rtcConfiguration
			});

			flottformFileInputClient.start();

			flottformFileInputClient.on('webrtc:connection-impossible', () => {
				currentState = 'webrtc:connection-impossible';
			});
			flottformFileInputClient.on('connected', () => {
				currentState = 'connected';
			});
			flottformFileInputClient.on('sending', () => {
				currentState = 'sending';
			});
			flottformFileInputClient.on('progress', (p) => {
				console.log('progress= ', p);
			});
			flottformFileInputClient.on('done', () => {
				currentState = 'done';
			});
			flottformFileInputClient.on('disconnected', () => {
				currentState = 'disconnected';
			});
			flottformFileInputClient.on('error', (e) => {
				console.log('Error:', e);
				currentState = 'error';
			});

			sendToForm = flottformFileInputClient.sendFiles;
		} else {
			const flottformTextInputClient = new FlottformTextInputClient(options);
			flottformTextInputClient.start();

			flottformTextInputClient.on('connected', () => {
				currentState = 'connected';
			});
			flottformTextInputClient.on('sending', () => {
				currentState = 'sending';
			});
			flottformTextInputClient.on('done', () => {
				currentState = 'done';
			});
			flottformTextInputClient.on('error', () => {
				currentState = 'error';
			});

			sendToForm = () => {
				currentState = 'sending';
				try {
					flottformTextInputClient.sendText(textToSend);
				} catch (err) {
					currentState = 'error';
					console.error('Error sending text', err);
				}
			};
		}
	});
</script>

<div class="min-h-dvh flex flex-col bg-[#f8f9fb]">
	<!-- Header -->
	<header class="flex items-center justify-between px-5 py-4 bg-white border-b border-[#eef0f4]">
		<svg class="h-6 w-auto" viewBox="0 0 159 42" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M15.876 28.26L20.664 1.044H28.908L24.12 28.26H15.876ZM17.712 6.588C17.52 6.492 17.28 6.42 16.992 6.372C16.728 6.3 16.452 6.264 16.164 6.264C15.324 6.264 14.736 6.516 14.4 7.02C14.064 7.5 13.824 8.124 13.68 8.892L13.608 9.324H17.604L16.596 15.12H12.708L10.368 28.26L8.03 41.4H0L2.34 28.26L4.68 15.12H1.44L2.448 9.324H5.58L5.688 8.748C5.904 7.572 6.204 6.456 6.588 5.4C6.996 4.344 7.56 3.42 8.28 2.628C9.024 1.812 9.972 1.176 11.124 0.72C12.276 0.24 13.704 0 15.408 0C15.96 0 16.584 0.048 17.28 0.144C17.976 0.216 18.552 0.348 19.008 0.54L17.712 6.588Z"
				fill="#343AF0"
			/>
			<path
				d="M37.44 28.836C36 28.836 34.656 28.656 33.408 28.296C32.16 27.936 31.068 27.396 30.132 26.676C29.196 25.956 28.464 25.068 27.936 24.012C27.408 22.956 27.144 21.744 27.144 20.376C27.144 18.792 27.408 17.292 27.936 15.876C28.464 14.46 29.22 13.224 30.204 12.168C31.212 11.112 32.436 10.284 33.876 9.684C35.34 9.06 37.008 8.748 38.88 8.748C40.344 8.748 41.712 8.928 42.984 9.288C44.256 9.648 45.36 10.188 46.296 10.908C47.232 11.628 47.964 12.516 48.492 13.572C49.044 14.628 49.32 15.84 49.32 17.208C49.32 18.792 49.056 20.292 48.528 21.708C48 23.124 47.232 24.36 46.224 25.416C45.216 26.472 43.968 27.312 42.48 27.936C41.016 28.536 39.336 28.836 37.44 28.836ZM41.472 18.072C41.472 17.304 41.232 16.656 40.752 16.128C40.272 15.6 39.564 15.336 38.628 15.336C38.076 15.336 37.572 15.456 37.116 15.696C36.684 15.912 36.3 16.212 35.964 16.596C35.652 16.956 35.412 17.388 35.244 17.892C35.076 18.396 34.992 18.924 34.992 19.476C34.992 20.268 35.232 20.928 35.712 21.456C36.192 21.96 36.888 22.212 37.8 22.212C38.376 22.212 38.892 22.104 39.348 21.888C39.804 21.672 40.188 21.372 40.5 20.988C40.812 20.604 41.052 20.172 41.22 19.692C41.388 19.188 41.472 18.648 41.472 18.072Z"
				fill="#343AF0"
			/>
			<path
				d="M59.6216 15.12L58.6496 20.448C58.6256 20.592 58.6016 20.76 58.5776 20.952C58.5776 21.144 58.5776 21.3 58.5776 21.42C58.5776 21.972 58.7096 22.344 58.9736 22.536C59.2616 22.704 59.6576 22.788 60.1616 22.788C60.4496 22.788 60.7376 22.764 61.0256 22.716C61.3136 22.668 61.5536 22.62 61.7456 22.572L60.7736 28.116C60.4616 28.308 59.9096 28.464 59.1176 28.584C58.3256 28.704 57.5576 28.764 56.8136 28.764C56.0216 28.764 55.2416 28.692 54.4736 28.548C53.7056 28.404 53.0216 28.152 52.4216 27.792C51.8216 27.432 51.3296 26.94 50.9456 26.316C50.5856 25.692 50.4056 24.888 50.4056 23.904C50.4056 23.64 50.4176 23.34 50.4416 23.004C50.4896 22.668 50.5376 22.356 50.5856 22.068L51.8456 15.12H49.0376L50.0456 9.324H52.7096L53.4656 5.04H61.2776L60.5216 9.324H64.1576L63.1496 15.12H59.6216Z"
				fill="#343AF0"
			/>
			<path
				d="M71.998 15.12L71.026 20.448C71.002 20.592 70.978 20.76 70.954 20.952C70.954 21.144 70.954 21.3 70.954 21.42C70.954 21.972 71.086 22.344 71.35 22.536C71.638 22.704 72.034 22.788 72.538 22.788C72.826 22.788 73.114 22.764 73.402 22.716C73.69 22.668 73.93 22.62 74.122 22.572L73.15 28.116C72.838 28.308 72.286 28.464 71.494 28.584C70.702 28.704 69.934 28.764 69.19 28.764C68.398 28.764 67.618 28.692 66.85 28.548C66.082 28.404 65.398 28.152 64.798 27.792C64.198 27.432 63.706 26.94 63.322 26.316C62.962 25.692 62.782 24.888 62.782 23.904C62.782 23.64 62.794 23.34 62.818 23.004C62.866 22.668 62.914 22.356 62.962 22.068L64.222 15.12H61.414L62.422 9.324H65.086L65.842 5.04H73.654L72.898 9.324H76.534L75.526 15.12H71.998Z"
				fill="#343AF0"
			/>
			<path
				d="M90.9832 6.588C90.7912 6.492 90.5512 6.42 90.2632 6.372C89.9992 6.3 89.7232 6.264 89.4352 6.264C88.5952 6.264 88.0072 6.516 87.6712 7.02C87.3352 7.5 87.0952 8.124 86.9512 8.892L86.8792 9.324H90.8752L89.8672 15.12H85.9792L83.6392 28.26H75.6112L77.9512 15.12H74.7112L75.7192 9.324H78.8512L78.9592 8.748C79.1752 7.572 79.4752 6.456 79.8592 5.4C80.2672 4.344 80.8312 3.42 81.5512 2.628C82.2952 1.812 83.2432 1.176 84.3952 0.72C85.5472 0.24 86.9752 0 88.6792 0C89.2312 0 89.8552 0.048 90.5512 0.144C91.2472 0.216 91.8232 0.348 92.2792 0.54L90.9832 6.588Z"
				fill="#343AF0"
			/>
			<path
				d="M98.7581 28.836C97.3181 28.836 95.9741 28.656 94.7261 28.296C93.4781 27.936 92.3861 27.396 91.4501 26.676C90.5141 25.956 89.7821 25.068 89.2541 24.012C88.7261 22.956 88.4621 21.744 88.4621 20.376C88.4621 18.792 88.7261 17.292 89.2541 15.876C89.7821 14.46 90.5381 13.224 91.5221 12.168C92.5301 11.112 93.7541 10.284 95.1941 9.684C96.6581 9.06 98.3261 8.748 100.198 8.748C101.662 8.748 103.03 8.928 104.302 9.288C105.574 9.648 106.678 10.188 107.614 10.908C108.55 11.628 109.282 12.516 109.81 13.572C110.362 14.628 110.638 15.84 110.638 17.208C110.638 18.792 110.374 20.292 109.846 21.708C109.318 23.124 108.55 24.36 107.542 25.416C106.534 26.472 105.286 27.312 103.798 27.936C102.334 28.536 100.654 28.836 98.7581 28.836ZM102.79 18.072C102.79 17.304 102.55 16.656 102.07 16.128C101.59 15.6 100.882 15.336 99.9461 15.336C99.3941 15.336 98.8901 15.456 98.4341 15.696C98.0021 15.912 97.6181 16.212 97.2821 16.596C96.9701 16.956 96.7301 17.388 96.5621 17.892C96.3941 18.396 96.3101 18.924 96.3101 19.476C96.3101 20.268 96.5501 20.928 97.0301 21.456C97.5101 21.96 98.2061 22.212 99.1181 22.212C99.6941 22.212 100.21 22.104 100.666 21.888C101.122 21.672 101.506 21.372 101.818 20.988C102.13 20.604 102.37 20.172 102.538 19.692C102.706 19.188 102.79 18.648 102.79 18.072Z"
				fill="#343AF0"
			/>
			<path
				d="M112.948 13.032C113.044 12.576 113.14 11.988 113.236 11.268C113.356 10.548 113.44 9.9 113.488 9.324H121.228C121.228 9.444 121.216 9.6 121.192 9.792C121.168 9.984 121.132 10.2 121.084 10.44C121.06 10.656 121.024 10.872 120.976 11.088C120.952 11.304 120.928 11.484 120.904 11.628H121.012C121.564 10.86 122.236 10.224 123.028 9.72C123.82 9.192 124.756 8.928 125.836 8.928C126.484 8.928 126.988 8.988 127.348 9.108L125.836 15.948C125.596 15.876 125.32 15.828 125.008 15.804C124.696 15.78 124.408 15.768 124.144 15.768C122.896 15.768 121.924 16.104 121.228 16.776C120.532 17.424 120.1 18.192 119.932 19.08L118.312 28.26H110.248L112.948 13.032Z"
				fill="#343AF0"
			/>
			<path
				d="M127.327 13.032C127.423 12.576 127.519 11.988 127.615 11.268C127.735 10.548 127.819 9.9 127.867 9.324H135.643C135.619 9.684 135.583 10.104 135.535 10.584C135.487 11.04 135.439 11.436 135.391 11.772H135.535C136.063 11.052 136.795 10.392 137.731 9.792C138.667 9.192 139.783 8.892 141.079 8.892C142.471 8.892 143.575 9.144 144.391 9.648C145.231 10.152 145.855 10.836 146.263 11.7C146.887 10.932 147.643 10.272 148.531 9.72C149.443 9.168 150.583 8.892 151.951 8.892C153.055 8.892 153.991 9.072 154.759 9.432C155.551 9.792 156.187 10.26 156.667 10.836C157.171 11.412 157.531 12.06 157.747 12.78C157.987 13.5 158.107 14.22 158.107 14.94C158.107 15.276 158.083 15.6 158.035 15.912C158.011 16.2 157.975 16.488 157.927 16.776L155.911 28.26H147.811L149.575 18.216C149.623 18.024 149.647 17.82 149.647 17.604C149.671 17.364 149.683 17.172 149.683 17.028C149.683 15.924 149.191 15.372 148.207 15.372C147.679 15.372 147.223 15.636 146.839 16.164C146.479 16.668 146.215 17.364 146.047 18.252L144.283 28.26H136.219L137.983 18.288C138.031 18.096 138.055 17.904 138.055 17.712C138.079 17.496 138.091 17.328 138.091 17.208C138.091 16.656 137.959 16.212 137.695 15.876C137.455 15.54 137.095 15.372 136.615 15.372C136.159 15.372 135.739 15.6 135.355 16.056C134.971 16.512 134.683 17.244 134.491 18.252L132.727 28.26H124.663L127.327 13.032Z"
				fill="#343AF0"
			/>
			<path
				d="M41 31.5C62.0885 38.7301 73.9115 38.328 95 31.5C73.0281 40.9948 61.1529 41.5544 41 31.5Z"
				fill="#343AF0"
				stroke="#343AF0"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<div
			class="flex items-center gap-1.5 font-sans text-[0.6875rem] font-medium rounded-full px-2.5 py-1 {isConnected
				? 'text-[#1a8c3a] bg-[#eafbe7]'
				: currentState === 'error' || currentState === 'webrtc:connection-impossible'
					? 'text-[#c4210b] bg-[#fef0ee]'
					: 'text-[#8b95a5] bg-[#f1f3f7]'}"
		>
			{#if currentState === 'init'}
				<span class="status-dot-connecting w-1.5 h-1.5 rounded-full bg-[#b4bcc8]"></span>
			{:else if isConnected}
				<span class="w-1.5 h-1.5 rounded-full bg-primary-green"></span>
			{:else}
				<span class="w-1.5 h-1.5 rounded-full bg-primary-red"></span>
			{/if}
			{statusLabel}
		</div>
	</header>

	<!-- Main content -->
	<main class="flex-1 flex flex-col px-5 pt-6 pb-8 max-w-[480px] w-full mx-auto">
		{#if currentState === 'done'}
			<div class="flex-1 flex flex-col items-center justify-center text-center gap-2 p-8">
				<div class="done-icon w-12 h-12 text-primary-green mb-1">
					<svg class="w-full h-full" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<p class="font-display font-bold text-lg text-fonts-blue m-0">Sent successfully</p>
				<p class="font-sans text-[0.8125rem] text-[#8b95a5] m-0 max-w-[280px] leading-relaxed">
					{inputType === 'file' ? 'Your files have been' : 'Your text has been'} delivered to the form.
					You can close this page.
				</p>
			</div>
		{:else if currentState === 'error' || currentState === 'webrtc:connection-impossible'}
			<div class="flex-1 flex flex-col items-center justify-center text-center gap-2 p-8">
				<div class="w-12 h-12 text-primary-red mb-1">
					<svg class="w-full h-full" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<p class="font-display font-bold text-lg text-fonts-blue m-0">Connection failed</p>
				<p class="font-sans text-[0.8125rem] text-[#8b95a5] m-0 max-w-[280px] leading-relaxed">
					Please generate a new QR code from the extension and try again.
				</p>
			</div>
		{:else if currentState === 'disconnected'}
			<div class="flex-1 flex flex-col items-center justify-center text-center gap-2 p-8">
				<p class="font-display font-bold text-lg text-fonts-blue m-0">Disconnected</p>
				<p class="font-sans text-[0.8125rem] text-[#8b95a5] m-0 max-w-[280px] leading-relaxed">
					The connection was closed. Generate a new QR code to reconnect.
				</p>
			</div>
		{:else}
			<!-- init / connected / sending -->
			<form class="flex flex-col gap-3" onsubmit={sendToForm}>
				{#if inputType === 'text' || inputType === 'password'}
					<label class="font-display font-bold text-[0.9375rem] text-fonts-blue" for="flottform">
						{inputType === 'password' ? 'Enter password' : 'Enter your text'}
					</label>
					<input
						type={inputType}
						name="flottform"
						id="flottform"
						bind:this={inputField}
						bind:value={textToSend}
						class="w-full py-3 px-4 border-2 border-[#e2e5ec] rounded-xl font-sans text-base text-fonts-blue bg-white outline-none transition-colors duration-200 focus:border-primary-blue placeholder:text-[#b4bcc8] box-border"
						placeholder={inputType === 'password' ? '' : 'Type here...'}
						disabled={currentState === 'init'}
					/>
				{:else if inputType === 'textarea'}
					<label class="font-display font-bold text-[0.9375rem] text-fonts-blue" for="flottform">
						Enter your text
					</label>
					<textarea
						name="flottform"
						id="flottform"
						bind:this={inputField}
						bind:value={textToSend}
						rows="5"
						class="w-full py-3 px-4 border-2 border-[#e2e5ec] rounded-xl font-sans text-base text-fonts-blue bg-white outline-none transition-colors duration-200 focus:border-primary-blue placeholder:text-[#b4bcc8] box-border resize-y min-h-[7rem] leading-relaxed"
						placeholder="Type here..."
						disabled={currentState === 'init'}
					></textarea>
				{:else if inputType === 'file'}
					<label class="font-display font-bold text-[0.9375rem] text-fonts-blue" for="flottform">
						Choose files to send
					</label>
					<div
						class="relative bg-white border-2 border-dashed border-[#d1d5e0] rounded-xl transition-colors duration-200 overflow-hidden {dragOver
							? 'border-primary-blue bg-[#f0f1fe]'
							: ''} {currentState === 'init' ? 'opacity-50 pointer-events-none' : ''}"
						role="button"
						tabindex="0"
						ondragover={(e) => {
							e.preventDefault();
							dragOver = true;
						}}
						ondragleave={() => {
							dragOver = false;
						}}
						ondrop={handleFileDrop}
					>
						<input
							type="file"
							name="flottform"
							id="flottform"
							bind:this={inputField}
							onchange={handleFileChange}
							multiple
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							disabled={currentState === 'init'}
						/>
						{#if selectedFiles && selectedFiles.length > 0}
							<div class="flex flex-col gap-1 p-3">
								{#each Array.from(selectedFiles) as file}
									<div class="flex items-center gap-2 py-2 px-2.5 bg-[#f4f5f9] rounded-lg">
										<svg class="w-4 h-4 text-primary-blue shrink-0" viewBox="0 0 20 20" fill="currentColor">
											<path
												d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l4.122 4.12A1.5 1.5 0 0117 7.622V16.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13z"
											/>
										</svg>
										<span class="font-sans text-[0.8125rem] text-fonts-blue flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
										<span class="font-sans text-[0.6875rem] text-[#8b95a5] shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
									</div>
								{/each}
							</div>
						{:else}
							<label for="flottform" class="flex flex-col items-center gap-1.5 py-8 px-4 cursor-pointer">
								<svg class="w-7 h-7 text-primary-blue mb-1" viewBox="0 0 20 20" fill="currentColor">
									<path
										d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z"
									/>
									<path
										d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"
									/>
								</svg>
								<span class="font-sans text-sm font-medium text-primary-blue">Tap to select files</span>
								<span class="font-sans text-xs text-[#8b95a5]">or drag and drop here</span>
							</label>
						{/if}
					</div>
				{/if}

				{#if currentState === 'init'}
					<div class="flex items-center justify-center gap-2 py-3.5 px-6 bg-[#f0f1fe] text-primary-blue rounded-xl font-sans text-sm font-medium">
						<svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.15"
							></circle>
							<path
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								fill="currentColor"
								opacity="0.8"
							></path>
						</svg>
						<span>Connecting...</span>
					</div>
				{:else if currentState === 'sending'}
					<button
						type="button"
						class="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-primary-blue text-white border-none rounded-xl font-display font-bold text-base cursor-pointer opacity-70"
						disabled
					>
						<svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.2"
							></circle>
							<path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path>
						</svg>
						Sending...
					</button>
				{:else}
					<button
						type="submit"
						class="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-primary-blue text-white border-none rounded-xl font-display font-bold text-base cursor-pointer transition-[opacity,transform] duration-200 active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none"
						disabled={inputType !== 'file' && !textToSend}
					>
						<svg class="w-[1.125rem] h-[1.125rem]" viewBox="0 0 20 20" fill="currentColor">
							<path
								d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z"
							/>
						</svg>
						Send
					</button>
				{/if}
			</form>
		{/if}
	</main>
</div>

<style>
	.status-dot-connecting {
		animation: pulse-dot 1.5s ease-in-out infinite;
	}
	.done-icon {
		animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes pulse-dot {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}
	@keyframes scale-in {
		from {
			transform: scale(0);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
