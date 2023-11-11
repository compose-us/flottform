<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

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

	onMount(async () => {
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
			await new Promise((r) => setTimeout(r, 100));
		}
		console.log('sent file!', ab);
		state = 'done';
	};
</script>

<div>
	{#if state === 'loading'}
		<div>Connecting to form</div>
	{:else if state === 'waiting-for-file'}
		<form bind:this={form} on:submit={sendFileToPeer}>
			<input bind:this={fileInput} type="file" name="fileToSend" />
			<button>Send file to peer</button>
		</form>
	{:else if state === 'sending-file'}
		<div>sending file ({Math.round(progress * 100)}%)</div>
	{:else if state === 'done'}
		<div>done!</div>
	{:else}
		<div>Error! Please refresh or create a new channel</div>
	{/if}
</div>
