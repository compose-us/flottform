const POLL_TIMEOUT = 5000;
let channelNumber = 0;

export default function initFlottform() {
	console.log('initFlottForm()');
	const fileInputFields = document.querySelectorAll(
		'input[type=file]'
	) as NodeListOf<HTMLInputElement>;
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
		const createChannelLinkWithOffer = document.createElement('a');
		createChannelLinkWithOffer.setAttribute('target', '_blank');
		createChannelLinkArea.appendChild(createChannelLinkWithOffer);
		createChannelElement.appendChild(createChannelLinkArea);

		const createChannelInput = document.createElement('input');
		createChannelInput.setAttribute('type', 'text');
		createChannelInput.disabled = true;
		createChannelElement.appendChild(createChannelInput);

		const createChannelButton = document.createElement('button');
		createChannelButton.setAttribute('type', 'button');
		createChannelButton.addEventListener('click', async () => {
			console.log('clicked create channel button', state);
			switch (state) {
				case 'waiting-for-ice':
					return receiveIceCandidates();
				default:
					return initConnection();
			}

			async function receiveIceCandidates() {
				if (!peerConnection) {
					console.log('no connection?!');
					return;
				}
				const iceCandidatesFromRemoteString = createChannelInput.value;
				const iceCandidatesFromRemote = JSON.parse(
					iceCandidatesFromRemoteString
				) as RTCIceCandidateInit[];
				for (const iceCandidate of iceCandidatesFromRemote) {
					await peerConnection.addIceCandidate(iceCandidate);
					console.log('added ice candidate successfully', iceCandidate);
				}

				state = 'waiting-for-file';
				createChannelInput.value = '';
				createChannelButton.innerHTML = 'Waiting for file / re-init';
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
						console.log('added Ice Candidate to array', e.candidate);

						console.log({ offer, myIceCandidates });
						if (offer && myIceCandidates.length > 0) {
							const putLink = `${window.location.origin}/peers/`;
							const connectLink = `${window.location.origin}/peers/${secret}`;
							const pollPeerLink = `${window.location.origin}/peers/?secret=${encodeURIComponent(
								secret
							)}`;
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
							console.log('put offer and candidates into', secret);

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
									createChannelButton.innerHTML = 'Init new connection';
								}
							}
						}
					}
				};
				function stopPollingForPeer() {
					clearTimeout(nextPollForPeer);
				}
				dataChannel.onopen = (e) => {
					console.log('data dataChannel opened!', e);
					stopPollingForPeer();
				};
				dataChannel.onclose = (e) => {
					console.log('data dataChannel closed!', e);
				};
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
					console.log('received message event', e);
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
					if (currentSize === size) {
						const fileForForm = new File(arrayBuffers, fileName);
						const dt = new DataTransfer();
						dt.items.add(fileForForm);
						fileInputField.files = dt.files;

						state = 'done';
						dataChannel.close();
					}
				};
				const stats = await peerConnection.getStats();
				offer = await peerConnection.createOffer();
				peerConnection.setLocalDescription(offer);
				console.log({ stats, offer, canTrickleIce: peerConnection.canTrickleIceCandidates });

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
		createChannelButton.innerHTML = 'Create channel';
		createChannelElement.appendChild(createChannelButton);

		fileInputField.after(createChannelElement);
		console.log('initFlottForm(): appended to fileInputField');
	}
}
