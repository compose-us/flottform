import { toDataURL } from 'qrcode';

const POLL_TIMEOUT = 1000;
const DEFAULT_CONFIG: RTCConfiguration = {
	iceServers: [
		{
			urls: [
				// TODO fill in custom stun and turn servers right here or as option?
			]
		}
	]
};
let channelNumber = 0;

export function createFlottformInput(
	inputField: HTMLInputElement,
	{ flottformApi }: { flottformApi: string | URL }
) {
	const baseApi = (flottformApi instanceof URL ? flottformApi : new URL(flottformApi))
		.toString()
		.replace(/\/$/, '');

	let state: 'new' | 'waiting-for-answer' | 'waiting-for-ice' | 'waiting-for-file' | 'done' = 'new';
	let peerConnection: RTCPeerConnection | null = null;
	let offer: RTCSessionDescriptionInit | null = null;
	let myIceCandidates: RTCIceCandidateInit[] = [];

	const createChannelElement = document.createElement('div');
	const createChannelLinkArea = document.createElement('div');
	const createChannelQrCode = document.createElement('img');
	const createChannelLinkWithOffer = document.createElement('a');
	createChannelLinkWithOffer.setAttribute('target', '_blank');
	createChannelQrCode.style.display = 'none';
	createChannelLinkArea.appendChild(createChannelQrCode);
	createChannelLinkArea.appendChild(createChannelLinkWithOffer);
	createChannelElement.appendChild(createChannelLinkArea);
	createChannelLinkArea.classList.add('qrCodeWrapper');

	const createChannelInput = document.createElement('input');
	createChannelInput.setAttribute('type', 'text');
	createChannelInput.disabled = true;
	createChannelInput.style.display = 'none';
	createChannelElement.appendChild(createChannelInput);

	const createChannelButton = document.createElement('button');
	createChannelButton.setAttribute('type', 'button');
	createChannelButton.innerHTML = 'Load file from other devise';
	createChannelButton.classList.add('qrCodeButton');
	createChannelButton.addEventListener('click', async () => {
		if (peerConnection) {
			peerConnection.close();
		}
		peerConnection = new RTCPeerConnection(DEFAULT_CONFIG);
		channelNumber++;
		const channelName = `file-${inputField.id ?? inputField.getAttribute('name') ?? channelNumber}`;

		const dataChannel = peerConnection.createDataChannel(channelName);

		let nextPollForPeer: ReturnType<typeof setTimeout>;

		offer = await peerConnection.createOffer();
		peerConnection.setLocalDescription(offer);

		const response = await fetch(`${baseApi}/create`, {
			method: 'POST',
			// mode: 'cors',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			},
			body: JSON.stringify({ session: offer })
		});

		const reply = await response.json();
		console.log({ reply });

		// peerConnection.onicecandidate = async (e) => {
		// 	if (e.candidate) {
		// 		myIceCandidates.push(e.candidate);

		// 		if (offer && myIceCandidates.length > 0) {
		// 			const putHostLink = `${baseApi}/${endpointId}/host`;
		// 			const connectLink = `${baseApi}/${endpointId}`;
		// 			const pollPeerLink = `${baseApi}/${endpointId}`;
		// 			createChannelQrCode.setAttribute('src', await toDataURL(connectLink));
		// 			createChannelQrCode.style.display = 'block';
		// 			createChannelLinkWithOffer.setAttribute('href', connectLink);
		// 			createChannelLinkWithOffer.innerHTML = connectLink;
		// 			await fetch(putLink, {
		// 				method: 'PUT',
		// 				body: JSON.stringify({
		// 					secret,
		// 					offer,
		// 					candidates: myIceCandidates
		// 				})
		// 			});

		// 			if (!nextPollForPeer) {
		// 				startPollingForPeer();
		// 			}
		// 			function startPollingForPeer() {
		// 				nextPollForPeer = setTimeout(tryFindPeer, POLL_TIMEOUT);

		// 				async function tryFindPeer() {
		// 					console.log('polling for peer');
		// 					const response = await fetch(pollPeerLink);
		// 					if (!response.ok) {
		// 						console.log('no peer found');
		// 						nextPollForPeer = setTimeout(tryFindPeer, POLL_TIMEOUT);
		// 						return;
		// 					}
		// 					const { offer, candidates } = await response.json();
		// 					console.log('found a peer!', { offer, candidates });
		// 					if (!peerConnection) {
		// 						console.log('peerConnection should not be null here!');
		// 						return;
		// 					}
		// 					await peerConnection.setRemoteDescription(offer);
		// 					for (const iceCandidate of candidates) {
		// 						await peerConnection.addIceCandidate(iceCandidate);
		// 						console.log('added ice candidate successfully', iceCandidate);
		// 					}

		// 					state = 'waiting-for-file';
		// 					createChannelInput.value = '';
		// 					createChannelQrCode.style.display = 'none';
		// 					createChannelLinkWithOffer.innerHTML = '';
		// 					createChannelButton.innerHTML = 'Connected!';
		// 				}
		// 			}
		// 		}
		// 	}
		// };
		// function stopPollingForPeer() {
		// 	clearTimeout(nextPollForPeer);
		// }
		// dataChannel.onopen = (e) => {
		// 	stopPollingForPeer();
		// };
		// dataChannel.onclose = (e) => {};
		// const arrayBuffers: ArrayBuffer[] = [];
		// let hasMetaInformation = false;
		// let fileName = 'no-name';
		// let fileType = 'application/octet-stream';
		// let size = 0;
		// let currentSize = 0;

		// dataChannel.onerror = (e) => {
		// 	console.log('channel.onerror', e);
		// };

		// dataChannel.onmessage = (e) => {
		// 	if (!hasMetaInformation) {
		// 		const fileMeta = JSON.parse(e.data) as {
		// 			lastModified?: number;
		// 			name?: string;
		// 			size: number;
		// 			type?: string;
		// 		};
		// 		size = fileMeta.size;
		// 		fileName = fileMeta.name ?? fileName;
		// 		fileType = fileMeta.type ?? fileType;
		// 		hasMetaInformation = true;
		// 		return;
		// 	}

		// 	const ab = e.data as ArrayBuffer;
		// 	arrayBuffers.push(ab);
		// 	currentSize += ab.byteLength;
		// 	createChannelButton.innerHTML = `Receiving file ${Math.round((currentSize / size) * 100)}%`;

		// 	if (currentSize === size) {
		// 		const fileForForm = new File(arrayBuffers, fileName);
		// 		const dt = new DataTransfer();
		// 		dt.items.add(fileForForm);
		// 		inputField.files = dt.files;

		// 		state = 'done';
		// 		createChannelButton.innerHTML = `File received: ${fileName}`;
		// 		dataChannel.close();
		// 	}
		// };

		// peerConnection.ondatachannel = (e) => {
		// 	console.log('got a connection in form', e);
		// };

		// peerConnection.onconnectionstatechange = (e) => {
		// 	console.log('on.onconnectionstatechange', e);
		// };

		// peerConnection.oniceconnectionstatechange = (e) => {
		// 	console.log('oniceconnectionstatechange', e);
		// };

		// peerConnection.onicegatheringstatechange = (e) => {
		// 	console.log('onicegatheringstatechange', e);
		// };
		// peerConnection.onnegotiationneeded = (e) => {
		// 	console.log('onnegotiationneeded', e);
		// };

		// peerConnection.onsignalingstatechange = (e) => {
		// 	console.log('onsignalingstatechange', e);
		// 	console.log('connectionState', peerConnection?.connectionState);
		// 	console.log('signalingState', peerConnection?.signalingState);
		// 	console.log('iceConnectionState', peerConnection?.iceConnectionState);
		// 	console.log('iceGatheringState', peerConnection?.iceGatheringState);
		// };

		// state = 'waiting-for-answer';
		// createChannelInput.disabled = false;
		// createChannelButton.innerHTML = 'Receive answer';
	});
	createChannelElement.appendChild(createChannelButton);
	inputField.parentElement!.after(createChannelElement);
}