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

<div class="max-w-screen-xl mx-auto p-8 box-border grid grid-cols-1 gap-8 text-black">
	<h1>Please upload your CV</h1>
	<p>Use this form to send a CV from this device to the open form on the main device.</p>

	<form action="" on:submit={sendFileToPeer}>
		<div class="flex flex-col gap-4">
			<label for="cv">Please upload your CV</label>
			<input
				name="cv"
				id="cv"
				type="file"
				class="border rounded px-4 py-2 border-[#051e0c]"
				bind:this={fileInput}
			/>

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
					<p>Your file is successfully sent</p>
				</div>
			{:else if currentState === 'connected'}
				<button
					type="submit"
					bind:this={button}
					class="group relative w-fit cursor-pointer overflow-hidden rounded-md border-2 bg-[#ed8ee5] text-white border-[#ed8ee5] px-12 py-3 font-semibold disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:pointer-events-none"
				>
					<span
						class="ease absolute top-1/2 h-0 w-64 origin-center -translate-x-20 rotate-45 bg-white transition-all duration-300 group-hover:h-64 group-hover:-translate-y-32"
					></span>
					<span class="ease relative transition duration-300 group-hover:text-[#ed8ee5]"
						>Send file</span
					>
				</button>
			{:else if currentState === 'error'}
				<h2 class="animate-bounce">Ouch!</h2>
				<p>There was an error connecting to flottform! 😬</p>
				<p>Please try again with a new QR code by clicking the button again on the main form.</p>
			{/if}
		</div>
	</form>

	<div>Connection state: {currentState}</div>
</div>

<style lang="postcss">
	.spinner-svg {
		animation: 2s linear infinite svg-animation;
	}

	.spinner {
		@apply block fill-transparent stroke-[#ed8ee5];
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
