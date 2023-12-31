import { toDataURL } from 'qrcode';

const POLL_TIMEOUT = 2000;
let channelNumber = 0;

export default function initFlottform(fileInputFields: NodeListOf<HTMLInputElement>) {
	console.log('initFlottForm()');
	console.log('initFlottForm(): found fields', fileInputFields);

	for (const fileInputField of fileInputFields) {
		let state: 'new' | 'waiting-for-answer' | 'waiting-for-ice' | 'waiting-for-file' | 'done' =
			'new';
		let peerConnection: RTCPeerConnection | null = null;
		let offer: RTCSessionDescriptionInit | null = null;
		let myIceCandidates: RTCIceCandidateInit[] = [];
		const secret = `${fileInputField.id}-${Math.floor(Math.random() * 1000)}`;

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
		createChannelButton.addEventListener('click', async () => {
			switch (state) {
				default:
					return initConnection();
			}

			async function initConnection() {
				if (peerConnection) {
					peerConnection.close();
				}
				peerConnection = new RTCPeerConnection();
				channelNumber++;
				const channelName = `file-${
					fileInputField.id ?? fileInputField.getAttribute('name') ?? channelNumber
				}`;
				const dataChannel = peerConnection.createDataChannel(channelName);

				let nextPollForPeer: ReturnType<typeof setTimeout>;

				peerConnection.onicecandidate = async (e) => {
					if (e.candidate) {
						myIceCandidates.push(e.candidate);

						if (offer && myIceCandidates.length > 0) {
							const putLink = `${window.location.origin}/peers/`;
							const connectLink = `${window.location.origin}/peers/${secret}`;
							const pollPeerLink = `${window.location.origin}/peers/?secret=${encodeURIComponent(
								secret
							)}`;
							createChannelQrCode.setAttribute('src', await toDataURL(connectLink));
							createChannelQrCode.style.display = 'block';
							createChannelLinkWithOffer.setAttribute('href', connectLink);
							createChannelLinkWithOffer.innerHTML = connectLink;
							await fetch(putLink, {
								method: 'PUT',
								body: JSON.stringify({
									secret,
									offer,
									candidates: myIceCandidates
								})
							});

							if (!nextPollForPeer) {
								startPollingForPeer();
							}
							function startPollingForPeer() {
								nextPollForPeer = setTimeout(tryFindPeer, POLL_TIMEOUT);

								async function tryFindPeer() {
									console.log('polling for peer');
									const response = await fetch(pollPeerLink);
									if (!response.ok) {
										console.log('no peer found');
										nextPollForPeer = setTimeout(tryFindPeer, POLL_TIMEOUT);
										return;
									}
									const { offer, candidates } = await response.json();
									console.log('found a peer!', { offer, candidates });
									if (!peerConnection) {
										console.log('peerConnection should not be null here!');
										return;
									}
									await peerConnection.setRemoteDescription(offer);
									for (const iceCandidate of candidates) {
										await peerConnection.addIceCandidate(iceCandidate);
										console.log('added ice candidate successfully', iceCandidate);
									}

									state = 'waiting-for-file';
									createChannelInput.value = '';
									createChannelQrCode.style.display = 'none';
									createChannelLinkWithOffer.innerHTML = '';
									createChannelButton.innerHTML = 'Connected!';
								}
							}
						}
					}
				};
				function stopPollingForPeer() {
					clearTimeout(nextPollForPeer);
				}
				dataChannel.onopen = (e) => {
					stopPollingForPeer();
				};
				dataChannel.onclose = (e) => {};
				const arrayBuffers: ArrayBuffer[] = [];
				let hasMetaInformation = false;
				let fileName = 'no-name';
				let fileType = 'application/octet-stream';
				let size = 0;
				let currentSize = 0;

				dataChannel.onerror = (e) => {
					console.log('channel.onerror', e);
				};

				dataChannel.onmessage = (e) => {
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

					const ab = e.data as ArrayBuffer;
					arrayBuffers.push(ab);
					currentSize += ab.byteLength;
					createChannelButton.innerHTML = `Receiving file ${Math.round(
						(currentSize / size) * 100
					)}%`;

					if (currentSize === size) {
						const fileForForm = new File(arrayBuffers, fileName);
						const dt = new DataTransfer();
						dt.items.add(fileForForm);
						fileInputField.files = dt.files;

						state = 'done';
						createChannelButton.innerHTML = `File received: ${fileName}`;
						dataChannel.close();
					}
				};
				const stats = await peerConnection.getStats();
				offer = await peerConnection.createOffer();
				peerConnection.setLocalDescription(offer);

				peerConnection.ondatachannel = (e) => {
					console.log('got a connection in form', e);
				};
				peerConnection.onconnectionstatechange = (e) => {
					console.log('connectionstatechanged', e);
				};

				state = 'waiting-for-answer';
				createChannelInput.disabled = false;
				createChannelButton.innerHTML = 'Receive answer';
			}
		});
		createChannelButton.innerHTML = 'Load file from other devise';
		createChannelButton.classList.add('qrCodeButton');
		createChannelElement.appendChild(createChannelButton);
		fileInputField.parentElement!.after(createChannelElement);
		console.log('initFlottForm(): appended to fileInputField');
	}
}
