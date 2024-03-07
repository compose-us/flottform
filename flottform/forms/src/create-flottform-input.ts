import { toDataURL } from 'qrcode';
import {
	DEFAULT_WEBRTC_CONFIG,
	POLL_TIME_IN_MS,
	retrieveEndpointInfo,
	setIncludes,
	type SafeEndpointInfo
} from './internal';

let channelNumber = 0;

export function createFlottformInput(
	inputField: HTMLInputElement,
	{
		flottformApi,
		createClientUrl,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		onError = () => {}
	}: {
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		rtcConfiguration?: RTCConfiguration;
		onError?: (e: Error) => void;
		pollTimeForIceInMs?: number;
	}
): void {
	const baseApi = (flottformApi instanceof URL ? flottformApi : new URL(flottformApi))
		.toString()
		.replace(/\/$/, '');

	let state:
		| 'new'
		| 'waiting-for-client'
		| 'connection-impossible'
		| 'waiting-for-ice'
		| 'waiting-for-file'
		| 'done'
		| 'error' = 'new';

	let openPeerConnection: RTCPeerConnection | null = null;
	let pollForIceTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

	const createChannelElement = document.createElement('div');
	const createChannelLinkArea = document.createElement('div');
	const createChannelQrCode = document.createElement('img');
	const createChannelLinkWithOffer = document.createElement('a');
	createChannelLinkWithOffer.setAttribute('target', '_blank');
	createChannelLinkArea.style.display = 'none';
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
		const connection = new RTCPeerConnection(rtcConfiguration);
		openPeerConnection = connection;
		channelNumber++;
		const channelName = `file-${inputField.id ?? inputField.getAttribute('name') ?? channelNumber}`;
		const dataChannel = connection.createDataChannel(channelName);

		let session = await connection.createOffer();
		let hostIceCandidates = new Set<RTCIceCandidateInit>();
		await connection.setLocalDescription(session);

		const response = await fetch(`${baseApi}/create`, {
			method: 'POST',
			mode: 'cors',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ session })
		});

		const { endpointId, hostKey } = await response.json();
		console.log('Created endpoint', { endpointId, hostKey });
		const getEndpointInfoUrl = `${baseApi}/${endpointId}`;
		const putHostInfoUrl = `${baseApi}/${endpointId}/host`;
		const connectLink = await createClientUrl({ endpointId });
		createChannelQrCode.setAttribute('src', await toDataURL(connectLink));
		createChannelLinkWithOffer.setAttribute('href', connectLink);
		createChannelLinkWithOffer.innerHTML = connectLink;
		createChannelLinkArea.style.display = 'block';

		startPollingForIceCandidates();
		async function stopPollingForIceCandidates() {
			if (pollForIceTimer) {
				clearTimeout(pollForIceTimer);
			}
			pollForIceTimer = null;
		}
		async function startPollingForIceCandidates() {
			if (pollForIceTimer) {
				clearTimeout(pollForIceTimer);
			}

			await pollForConnection();

			pollForIceTimer = setTimeout(startPollingForIceCandidates, pollTimeForIceInMs);
		}

		async function pollForConnection() {
			console.log('polling for client ice candidates', connection.iceGatheringState);
			const { clientInfo } = await retrieveEndpointInfo(getEndpointInfoUrl);

			if (clientInfo && state === 'waiting-for-client') {
				console.log('Found a client that wants to connect!');
				state = 'waiting-for-ice';
				createChannelButton.innerHTML = 'Waiting for data channel connection';
				await connection.setRemoteDescription(clientInfo.session);
			}

			for (const iceCandidate of clientInfo?.iceCandidates ?? []) {
				await connection.addIceCandidate(iceCandidate);
			}
		}

		async function putHostInfo() {
			try {
				console.log('Updating host info with new list of ice candidates');
				await fetch(putHostInfoUrl, {
					method: 'PUT',
					mode: 'cors',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						hostKey,
						iceCandidates: [...hostIceCandidates],
						session
					})
				});
			} catch (err) {
				onError(err as Error);
			}
		}

		connection.onconnectionstatechange = (e) => {
			console.log('new connection state =', connection.connectionState);
			if (connection.connectionState === 'connected') {
				stopPollingForIceCandidates();
			}
			if (connection.connectionState === 'disconnected') {
				startPollingForIceCandidates();
			}
			if (connection.connectionState === 'failed') {
				stopPollingForIceCandidates();
				state = 'error';
				createChannelLinkArea.style.display = 'none';
				createChannelButton.innerHTML = 'Client connection failed!';
			}
		};
		connection.onicecandidate = async (e) => {
			if (e.candidate) {
				if (!setIncludes(hostIceCandidates, e.candidate)) {
					console.log('host found new ice candidate! Adding it to our list');
					hostIceCandidates.add(e.candidate);
					await putHostInfo();
				}
			}
		};
		connection.onicecandidateerror = async (e) => {
			console.error('peerConnection.onicecandidateerror', e);
		};
		connection.onicegatheringstatechange = async (e) => {
			console.info(`onicegatheringstatechange - ${connection.iceGatheringState} - ${e}`);
		};
		connection.oniceconnectionstatechange = async (e) => {
			console.info(`oniceconnectionstatechange - ${connection.iceConnectionState} - ${e}`);
			if (connection.iceConnectionState === 'failed') {
				console.log('Failed to find a possible connection path');
				state = 'connection-impossible';
				createChannelLinkArea.style.display = 'none';
				createChannelButton.innerHTML =
					'Connection to this client with the current network environment is impossible';
			}
		};

		await putHostInfo();

		state = 'waiting-for-client';
		createChannelButton.innerHTML = 'Waiting for client to connect';

		const arrayBuffers: ArrayBuffer[] = [];
		let hasMetaInformation = false;
		let fileName = 'no-name';
		let fileType = 'application/octet-stream';
		let size = 0;
		let currentSize = 0;

		dataChannel.onopen = (e) => {
			console.log('data channel opened');
			state = 'waiting-for-file';
			createChannelLinkArea.style.display = 'none';
			createChannelButton.innerHTML = 'Waiting for file';
		};

		dataChannel.onclose = (e) => {
			console.log('data channel closed');
		};

		dataChannel.onerror = (e) => {
			console.log('channel.onerror', e);
			state = 'error';
			createChannelButton.innerHTML = 'Error during file transfer';
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
