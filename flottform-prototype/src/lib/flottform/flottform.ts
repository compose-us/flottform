import { encodeOfferToHash } from './offer-to-hash';

let channelNumber = 0;

export default function initFlottform() {
	console.log('initFlottForm()');
	const fileInputFields = document.querySelectorAll('input[type=file]');
	console.log('initFlottForm(): found fields', fileInputFields);

	for (const fileInputField of fileInputFields) {
		let state = 'new';
		let peerConnection: RTCPeerConnection | null = null;
		let offer: RTCSessionDescriptionInit | null = null;
		let channel: RTCDataChannel | null = null;
		let myIceCandidates: RTCIceCandidateInit[] = [];

		const createChannelElement = document.createElement('div');
		const createChannelLinkArea = document.createElement('div');
		const createChannelLinkWithOffer = document.createElement('a');
		createChannelLinkWithOffer.setAttribute('target', '_blank');
		createChannelLinkArea.appendChild(createChannelLinkWithOffer);
		createChannelElement.appendChild(createChannelLinkArea);

		function updateLink() {
			if (offer && myIceCandidates.length > 0) {
				const newLink = `https://localhost:5173/peers/#${encodeOfferToHash({
					o: offer,
					c: myIceCandidates
				})}`;
				createChannelLinkWithOffer.setAttribute('href', newLink);
				createChannelLinkWithOffer.innerHTML = newLink;
			}
		}

		const createChannelInput = document.createElement('input');
		createChannelInput.setAttribute('type', 'text');
		createChannelInput.disabled = true;
		createChannelElement.appendChild(createChannelInput);

		const createChannelButton = document.createElement('button');
		createChannelButton.setAttribute('type', 'button');
		createChannelButton.addEventListener('click', async () => {
			console.log('clicked create channel button', state);
			switch (state) {
				case 'new':
					return initConnection();
				case 'waiting-for-answer':
					return receiveAnswer();
				case 'waiting-for-ice':
					return receiveIceCandidates();
				case 'waiting-for-message':
					return sendMessage();
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

				state = 'waiting-for-message';
				createChannelInput.value = '';
				createChannelButton.innerHTML = 'Send message';
			}

			async function receiveAnswer() {
				if (!peerConnection) {
					console.log('no connection?!');
					return;
				}
				const answer = createChannelInput.value;
				const answerOffer = JSON.parse(answer) as RTCSessionDescriptionInit;
				await peerConnection.setRemoteDescription(answerOffer);

				createChannelInput.value = JSON.stringify(myIceCandidates);
				state = 'waiting-for-ice';
				createChannelButton.innerHTML = 'Receive Ice Candidates';
			}

			async function sendMessage() {
				if (!peerConnection) {
					console.log('no connection?!');
					return;
				}
				if (!channel) {
					console.log('no channel?!');
					return;
				}
				console.log('channel state:', channel.readyState);
				const messageToSend = createChannelInput.value;
				channel.send(messageToSend);
			}

			async function initConnection() {
				peerConnection = new RTCPeerConnection();
				const channelName = `channel-${++channelNumber}`;
				channel = peerConnection.createDataChannel(channelName);
				console.log('created channel', channelName, channel);
				peerConnection.onicecandidate = async (e) => {
					if (e.candidate) {
						myIceCandidates.push(e.candidate);
						console.log('added Ice Candidate to array', e.candidate);
						updateLink();
					}
				};
				channel.onopen = (e) => {
					console.log('data channel opened!', e);
				};
				channel.onclose = (e) => {
					console.log('data channel closed!', e);
					channel = null;
				};
				const stats = await peerConnection.getStats();
				offer = await peerConnection.createOffer();
				peerConnection.setLocalDescription(offer);
				console.log({ stats, offer });

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
