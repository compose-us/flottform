import { toDataURL } from 'qrcode';
import { DEFAULT_WEBRTC_CONFIG, type SafeEndpointInfo } from './internal';

const POLL_TIMEOUT = 1000;

let channelNumber = 0;

export function createFlottformInput(
	inputField: HTMLInputElement,
	{
		flottformApi,
		createClientUrl,
		configuration = DEFAULT_WEBRTC_CONFIG
	}: {
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		configuration?: RTCConfiguration;
	}
): void {
	const baseApi = (flottformApi instanceof URL ? flottformApi : new URL(flottformApi))
		.toString()
		.replace(/\/$/, '');

	let state:
		| 'new'
		| 'waiting-for-answer'
		| 'waiting-for-ice'
		| 'waiting-for-file'
		| 'done'
		| 'error' = 'new';

	let openPeerConnection: RTCPeerConnection | null = null;

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

	const createChannelButton = document.createElement('button');
	createChannelButton.setAttribute('type', 'button');
	createChannelButton.innerHTML = 'Load file from other device';
	createChannelButton.classList.add('qrCodeButton');
	createChannelButton.addEventListener('click', async () => {
		if (openPeerConnection) {
			openPeerConnection.close();
		}
		const peerConnection = new RTCPeerConnection(configuration);
		openPeerConnection = peerConnection;
		channelNumber++;
		const channelName = `file-${inputField.id ?? inputField.getAttribute('name') ?? channelNumber}`;
		const dataChannel = peerConnection.createDataChannel(channelName);

		let hostOffer = await peerConnection.createOffer();
		let myIceCandidates: RTCIceCandidateInit[] = [];
		peerConnection.setLocalDescription(hostOffer);

		peerConnection.onicecandidate = async (e) => {
			if (e.candidate) {
				myIceCandidates.push(e.candidate);
			}
		};
		peerConnection.onicecandidateerror = async (e) => {
			console.error('peerConnection.onicecandidateerror', e);
		};
		peerConnection.oniceconnectionstatechange = async (e) => {
			if (peerConnection.iceConnectionState === 'failed') {
				console.log('Failed to find a possible connection path');
			}
		};

		const response = await fetch(`${baseApi}/create`, {
			method: 'POST',
			mode: 'cors',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ session: hostOffer })
		});

		const { endpointId, hostKey } = await response.json();
		console.log('Created endpoint', { endpointId, hostKey });
		const pollPeerLink = `${baseApi}/${endpointId}`;
		const putHostLink = `${baseApi}/${endpointId}/host`;
		const connectLink = await createClientUrl({ endpointId });
		createChannelQrCode.setAttribute('src', await toDataURL(connectLink));
		createChannelQrCode.style.display = 'block';
		createChannelLinkWithOffer.setAttribute('href', connectLink);
		createChannelLinkWithOffer.innerHTML = connectLink;

		await putHostInfo(putHostLink, hostKey, hostOffer, myIceCandidates);

		state = 'waiting-for-answer';
		createChannelButton.innerHTML = 'Receive answer';

		await waitForPeerConnection(pollPeerLink);

		async function waitForPeerConnection(pollPeerLink: string) {
			console.log('waitForPeerConnection');
			while (
				peerConnection.iceGatheringState !== 'complete' ||
				peerConnection.connectionState !== 'connected'
			) {
				await new Promise<void>((r) => setTimeout(r, POLL_TIMEOUT));

				const response = await fetch(pollPeerLink);
				if (!response.ok) {
					console.log('no client found');
					continue;
				}
				const { clientInfo } = (await response.json()) as SafeEndpointInfo;
				if (!clientInfo) {
					continue;
				}
				if (peerConnection.currentRemoteDescription === null) {
					await peerConnection.setRemoteDescription(clientInfo.session);
				}
				for (const iceCandidate of clientInfo.iceCandidates) {
					await peerConnection.addIceCandidate(iceCandidate);
				}
			}
		}

		const arrayBuffers: ArrayBuffer[] = [];
		let hasMetaInformation = false;
		let fileName = 'no-name';
		let fileType = 'application/octet-stream';
		let size = 0;
		let currentSize = 0;

		dataChannel.onerror = (e) => {
			console.log('channel.onerror', e);
		};

		dataChannel.onmessage = async (e) => {
			if (!hasMetaInformation) {
				const fileMeta = JSON.parse(e.data) as {
					lastModified?: number;
					name?: string;
					size: number;
					type?: string;
				};
				size = fileMeta.size;
				fileName = fileMeta.name ?? fileName;
				fileType = fileMeta.type ?? fileType;
				hasMetaInformation = true;
				return;
			}

			const data = e.data;
			const ab = data instanceof Blob ? await data.arrayBuffer() : (data as ArrayBuffer);
			arrayBuffers.push(ab);
			currentSize += ab.byteLength;
			createChannelButton.innerHTML = `Receiving file ${Math.round((currentSize / size) * 100)}%`;

			if (currentSize === size) {
				const fileForForm = new File(arrayBuffers, fileName);
				const dt = new DataTransfer();
				dt.items.add(fileForForm);
				inputField.files = dt.files;

				state = 'done';
				createChannelButton.innerHTML = `Open new connection`;
				dataChannel.close();
			}
		};
	});
	createChannelElement.appendChild(createChannelButton);
	inputField.parentElement!.after(createChannelElement);
}

async function putHostInfo(
	putHostLink: string,
	hostKey: string,
	session: RTCSessionDescriptionInit,
	iceCandidates: RTCIceCandidateInit[]
): Promise<void> {
	await fetch(putHostLink, {
		method: 'PUT',
		mode: 'cors',
		body: JSON.stringify({ hostKey, session, iceCandidates })
	});
}
