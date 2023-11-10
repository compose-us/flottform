<script lang="ts">
	import { decodeHashToOffer } from '$lib/flottform/offer-to-hash';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	let connectionToForm: RTCPeerConnection;
	let offer: RTCSessionDescriptionInit;
	let answerOffer: RTCSessionDescriptionInit;
	let iceCandidates: RTCIceCandidateInit[] = [];
	let iceCandidatesInput: HTMLElement;
	let channel: RTCDataChannel | null = null;
	let message: string;
	let form: HTMLFormElement;
	let fileInput: HTMLInputElement;
	let hasOpenDataChannel: boolean = false;

	let textToCopy: HTMLPreElement;

	const copyToClipboard = async () => {
		const text = textToCopy.innerHTML;
		navigator.clipboard.writeText(text);
	};

	onMount(async () => {
		const hash = window.location.hash;
		const { o, c } = decodeHashToOffer(hash);
		offer = o;
		const remoteIceCandidates = c;
		connectionToForm = new RTCPeerConnection();
		console.log('state', connectionToForm.connectionState);
		connectionToForm.ondatachannel = (e) => {
			console.log('ondatachannel', e);
			channel = e.channel;
			channel.onopen = (e) => {
				hasOpenDataChannel = true;
			};
			channel.onmessage = (x) => {
				message = x.data;
			};
		};
		connectionToForm.onicecandidate = async (e) => {
			if (e.candidate) {
				iceCandidates = [...iceCandidates, e.candidate];
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
		const formData = new FormData(form);
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
			console.log('channel.onerror', e);
		};
		const maxChunkSize = 16384;
		const ab = await file.arrayBuffer();
		if (!ab) {
			console.log('no array buffer');
			return;
		}

		for (let i = 0; i * maxChunkSize <= ab.byteLength; i++) {
			const end = (i + 1) * maxChunkSize;
			channel.send(ab.slice(i * maxChunkSize, end));
		}
		console.log('sent file!', ab);
	};
</script>

<div>
	<p>received offer:</p>
	<pre>{JSON.stringify(offer, null, 2)}</pre>

	<p>answer:</p>
	<pre>{JSON.stringify(answerOffer)}</pre>

	<p>ice candidates:</p>
	<pre>{JSON.stringify(iceCandidates)}</pre>

	<p>to copy:</p>
	<pre bind:this={textToCopy}>{JSON.stringify({ a: answerOffer, c: iceCandidates })}</pre>
	<button on:click={copyToClipboard}>Copy to clipboard</button>

	{#if hasOpenDataChannel}
		<form bind:this={form} on:submit={sendFileToPeer}>
			<input bind:this={fileInput} type="file" name="fileToSend" />
			<button>Send file to peer</button>
		</form>
	{/if}
	<p>last message:</p>
	<pre>{message}</pre>
</div>

<style>
	div {
	}
</style>
