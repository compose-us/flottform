<script lang="ts">
	import { decodeHashToOffer } from '$lib/flottform/offer-to-hash';
	import { onMount } from 'svelte';

	let connectionToForm: RTCPeerConnection;
	let offer: RTCSessionDescriptionInit;
	let answer: string;
	let iceCandidates: RTCIceCandidateInit[] = [];
	let iceCandidatesInput: HTMLInputElement;
	let channel: RTCDataChannel | null = null;
	let message: string;

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
		const answerOffer = await connectionToForm.createAnswer();
		console.log('state-createAnswer', connectionToForm.connectionState);
		await connectionToForm.setLocalDescription(answerOffer);
		console.log('state-setLocalDescription', connectionToForm.connectionState);
		answer = JSON.stringify(answerOffer);
		console.log(answer);
	});
</script>

<div>
	<p>received offer:</p>
	<pre>{JSON.stringify(offer, null, 2)}</pre>

	<p>answer:</p>
	<pre>{answer}</pre>

	<p>ice candidates:</p>
	<pre>{JSON.stringify(iceCandidates)}</pre>

	<p>last message:</p>
	<pre>{message}</pre>
</div>

<style>
	div {
	}
</style>
