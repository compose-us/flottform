<script lang="ts">
	import { FlottformFileInputClient } from '@flottform/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { sdpExchangeServerBase } from '../../../api';

	type State =
		| 'init'
		| 'connected'
		| 'webrtc:connection-impossible'
		| 'sending'
		| 'done'
		| 'disconnected'
		| 'error';

	let sendFileToPeer = () => {};
	let fileInput: HTMLInputElement;
	let button: HTMLButtonElement;
	let currentState: State = 'init';

	onMount(async () => {
		const flottformFileInputClient = new FlottformFileInputClient({
			endpointId: $page.params.endpointId,
			fileInput,
			flottformApi: sdpExchangeServerBase
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

		sendFileToPeer = flottformFileInputClient.sendFiles;
	});
</script>

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 gap-8">
	<h1 class="font-sans">Laden Sie Ihren Beleg hoch</h1>
	<p>
		Verwenden Sie dieses Formular, um eine Datei von diesem Gerät an das offene Formular auf dem
		Hauptgerät zu senden.
	</p>

	<form action="" on:submit={sendFileToPeer}>
		<div class="flex flex-col gap-4">
			<div>
				<label class="block mb-2" for="file_input">Laden Sie Ihren Beleg hoch</label>
				<input
					class="block w-full border border-gray-200 rounded-sm cursor-pointer file:bg-secondary-blue file:text-white file:py-4 file:border-none"
					id="file_input"
					type="file"
					bind:this={fileInput}
				/>
				<p class="italic text-sm">
					Klicken Sie zum Hochladen oder ziehen Sie es per Drag & Drop hier her
				</p>
			</div>

			{#if currentState === 'sending'}
				<div class="h-24 items-center">
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-12 spinner-svg">
						<circle cx="50" cy="50" r="45" class="spinner" />
					</svg>
				</div>
			{:else if currentState === 'done'}
				<div class="flex gap-6">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" version="1.1" class="w-12">
						<path
							d="M 28.28125 6.28125 L 11 23.5625 L 3.71875 16.28125 L 2.28125 17.71875 L 10.28125 25.71875 L 11 26.40625 L 11.71875 25.71875 L 29.71875 7.71875 Z "
							class="checkmark"
							stroke-linecap="round"
							pathLength="1"
							stroke-width="2"
							stroke="#3ab53a"
							fill="none"
						/>
					</svg>
					<p>Ihre Datei wurde erfolgreich gesendet</p>
				</div>
			{:else if currentState === 'connected'}
				<button
					type="submit"
					bind:this={button}
					class="group relative w-fit cursor-pointer overflow-hidden rounded-md border-2 bg-secondary-blue text-white border-secondary-blue px-12 py-3 font-semibold disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:pointer-events-none"
				>
					<span
						class="ease absolute top-1/2 h-0 w-64 origin-center -translate-x-20 rotate-45 bg-white transition-all duration-300 group-hover:h-64 group-hover:-translate-y-32"
					></span>
					<span class="ease relative transition duration-300 group-hover:text-secondary-blue"
						>Absenden</span
					>
				</button>
			{:else if currentState === 'error'}
				<h2 class="animate-bounce">Ouch!</h2>
				<p>Es ist ein Fehler beim Verbinden mit Flottform aufgetreten! 😬</p>
				<p>
					Bitte versuchen Sie es mit einem neuen QR-Code, indem Sie erneut auf die Schaltfläche im
					Hauptformular klicken.
				</p>
			{/if}
		</div>
	</form>

	<div>
		Status der Verbindung:
		{#if currentState === 'init'}
			Wird aufgebaut...
		{:else if currentState === 'connected'}
			Verbunden!
		{:else if currentState === 'webrtc:connection-impossible'}
			Verbindung in diesem Netzwerk nicht möglich!
		{:else if currentState === 'sending'}
			Sende Daten...
		{:else if currentState === 'done'}
			Senden abgeschlossen!
		{:else if currentState === 'disconnected'}
			Verbindung verloren!
		{:else if currentState === 'error'}
			Ein Fehler ist aufgetreten!
		{:else}
			Unklar!
		{/if}
	</div>
</div>

<style lang="postcss">
	.spinner-svg {
		animation: 2s linear infinite svg-animation;
	}

	.spinner {
		@apply block fill-transparent stroke-secondary-blue;
		stroke-linecap: round;
		stroke-dasharray: 283;
		stroke-dashoffset: 280;
		stroke-width: 8px;
		transform-origin: 50% 50%;
		animation: spinner 1.4s ease-in-out infinite both;
	}

	.checkmark {
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation: dash 1s linear 1 forwards;
	}

	@keyframes spinner {
		0%,
		25% {
			stroke-dashoffset: 280;
			transform: rotate(0);
		}

		50%,
		75% {
			stroke-dashoffset: 65;
			transform: rotate(45deg);
		}

		100% {
			stroke-dashoffset: 280;
			transform: rotate(360deg);
		}
	}

	@keyframes rotate {
		0% {
			transform: rotateZ(0deg);
		}
		100% {
			transform: rotateZ(360deg);
		}
	}

	@keyframes dash {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
