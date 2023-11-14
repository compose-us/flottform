<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import ProgressRing from '$lib/components/ProgressRing.svelte';
	import JumpingDots from '$lib/components/JumpingDots.svelte';
	import Button from '$lib/components/Button.svelte';

	export let data: PageData;

	let connectionToForm: RTCPeerConnection;
	let offer: RTCSessionDescriptionInit = data.offer;
	let answerOffer: RTCSessionDescriptionInit;
	let iceCandidates: RTCIceCandidateInit[] = [];
	let channel: RTCDataChannel | null = null;
	let form: HTMLFormElement;
	let fileInput: HTMLInputElement;
	let state: 'loading' | 'waiting-for-file' | 'sending-file' | 'done' | 'error' = 'loading';
	let progress = 1;

	let dragTarget = false;

	function handleDrag(e: Event) {
		dragTarget = true;
	}

	onMount(async () => {
		state = 'loading';
		const remoteIceCandidates = data.candidates;
		connectionToForm = new RTCPeerConnection();
		console.log('state', connectionToForm.connectionState);
		connectionToForm.ondatachannel = (e) => {
			console.log('ondatachannel', e);
			channel = e.channel;
			channel.onopen = (e) => {
				state = 'waiting-for-file';
			};
		};
		connectionToForm.onicecandidate = async (e) => {
			if (e.candidate) {
				iceCandidates = [...iceCandidates, e.candidate];
				await fetch($page.url, {
					method: 'PUT',
					body: JSON.stringify({
						offer: answerOffer,
						candidates: iceCandidates
					})
				});
			}
		};
		console.log('setting remote description');
		await connectionToForm.setRemoteDescription(offer);
		for (const iceCandidate of remoteIceCandidates) {
			await connectionToForm.addIceCandidate(iceCandidate);
		}
		console.log('state-setRemoteDescription', connectionToForm.connectionState);
		answerOffer = await connectionToForm.createAnswer();
		console.log('state-createAnswer', connectionToForm.connectionState);
		await connectionToForm.setLocalDescription(answerOffer);
		console.log('state-setLocalDescription', connectionToForm.connectionState);
	});

	const sendFileToPeer = async (e: SubmitEvent) => {
		state = 'sending-file';
		const file = fileInput.files?.item(0);
		if (!file) {
			console.log('no file?!?!');
			return;
		}
		if (!channel) {
			console.log('no channel?!?!');
			return;
		}

		const fileMeta = {
			lastModified: file.lastModified,
			name: file.name,
			type: file.type,
			size: file.size
		};
		channel.send(JSON.stringify(fileMeta));
		channel.onerror = (e) => {
			state = 'error';
			console.log('channel.onerror', e);
		};
		const maxChunkSize = 16384;
		const ab = await file.arrayBuffer();
		if (!ab) {
			console.log('no array buffer');
			return;
		}

		for (let i = 0; i * maxChunkSize <= ab.byteLength; i++) {
			progress = i / (ab.byteLength / maxChunkSize);
			const end = (i + 1) * maxChunkSize;
			channel.send(ab.slice(i * maxChunkSize, end));
			await new Promise((r) => setTimeout(r, 10));
		}
		console.log('sent file!', ab);
		state = 'done';
	};
</script>

<div class="wrapper">
	{#if state === 'loading'}
		<JumpingDots />
	{:else if state === 'waiting-for-file'}
		<form bind:this={form} on:submit={sendFileToPeer}>
			<input
				bind:this={fileInput}
				type="file"
				name="fileToSend"
				class:drag={dragTarget}
				on:drop={(e) => {
					dragTarget = false;
					return e.dataTransfer?.files;
				}}
				on:dragenter={(e) => handleDrag(e)}
			/>
			<Button type="submit" label="Send file to peer" />
		</form>
	{:else if state === 'sending-file'}
		<div>sending file ({Math.round(progress * 100)}%)</div>
		<ProgressRing {progress} />
	{:else if state === 'done'}
		<div>done!</div>
	{:else}
		<div>Error! Please refresh or create a new channel</div>
	{/if}
</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		gap: 1.25rem;
	}
	form {
		display: grid;
		place-items: center;
		gap: 1.25rem;
		margin-top: 2rem;
	}
	input[type='file'] {
		height: 10rem;
		padding: 0.25rem 0.5rem;
		border: 2px solid var(--cus-color-blue);
		border-radius: 5px;
		background-color: #fff;
	}
	.drag {
		border: 3px dotted var(--cus-color-blue);
	}
</style>
