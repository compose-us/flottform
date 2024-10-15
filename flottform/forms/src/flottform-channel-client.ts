import {
	ClientState,
	DEFAULT_WEBRTC_CONFIG,
	EventEmitter,
	Logger,
	POLL_TIME_IN_MS,
	generateSecretKey,
	retrieveEndpointInfo,
	setIncludes
} from './internal';

type Listeners = {
	init: [];
	'retrieving-info-from-endpoint': [];
	'sending-client-info': [];
	'connecting-to-host': [];
	connected: [];
	'connection-impossible': [];
	done: [];
	disconnected: [];
	error: [e: string];
	bufferedamountlow: [];
};

export class FlottformChannelClient extends EventEmitter<Listeners> {
	private flottformApi: string | URL;
	private endpointId: string;
	private rtcConfiguration: RTCConfiguration;
	private pollTimeForIceInMs: number;
	private logger: Logger;

	private state: ClientState = 'init';
	private openPeerConnection: RTCPeerConnection | null = null;
	private dataChannel: RTCDataChannel | null = null;
	private pollForIceTimer: NodeJS.Timeout | number | null = null;
	private BUFFER_THRESHOLD = 128 * 1024; // 128KB buffer threshold (maximum of 4 chunks in the buffer waiting to be sent over the network)

	constructor({
		endpointId,
		flottformApi,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		endpointId: string;
		flottformApi: string | URL;
		pollTimeForIceInMs?: number;
		logger?: Logger;
	}) {
		super();
		this.endpointId = endpointId;
		this.flottformApi = flottformApi;
		this.rtcConfiguration = DEFAULT_WEBRTC_CONFIG;
		this.pollTimeForIceInMs = pollTimeForIceInMs;
		this.logger = logger;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private changeState = (newState: ClientState, details?: any) => {
		this.state = newState;
		this.emit(newState, details);
		this.logger.info(`**Client State changed to: ${newState}`, details == undefined ? '' : details);
	};

	start = async () => {
		if (this.openPeerConnection) {
			this.close();
		}
		const baseApi = (
			this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)
		)
			.toString()
			.replace(/\/$/, '');

		try {
			this.rtcConfiguration.iceServers = await this.fetchIceServers(baseApi);
		} catch (error) {
			// Use the default configuration as a fallback
			this.logger.error(error);
		}

		this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration);
		const clientKey = generateSecretKey();
		const clientIceCandidates = new Set<RTCIceCandidateInit>();
		const getEndpointInfoUrl = `${this.flottformApi}/${this.endpointId}`;
		const putClientInfoUrl = `${this.flottformApi}/${this.endpointId}/client`;

		this.changeState('retrieving-info-from-endpoint');
		const { hostInfo } = await retrieveEndpointInfo(getEndpointInfoUrl);
		await this.openPeerConnection.setRemoteDescription(hostInfo.session);
		const session = await this.openPeerConnection.createAnswer();
		await this.openPeerConnection.setLocalDescription(session);

		this.setUpConnectionStateGathering(getEndpointInfoUrl);
		this.setUpClientIceGathering(putClientInfoUrl, clientKey, clientIceCandidates, session);
		this.openPeerConnection.ondatachannel = (e) => {
			this.logger.info(`ondatachannel: ${e.channel}`);
			this.changeState('connected');
			this.dataChannel = e.channel;
			// Set the maximum amount of data waiting inside the datachannel's buffer
			this.dataChannel.bufferedAmountLowThreshold = this.BUFFER_THRESHOLD;
			// Set the listener to listen then emit an event when the buffer has more space available and can be used to send more data
			this.dataChannel.onbufferedamountlow = () => {
				this.emit('bufferedamountlow');
			};
			this.dataChannel.onopen = (e) => {
				this.logger.info(`ondatachannel - onopen: ${e.type}`);
			};
		};

		this.changeState('sending-client-info');
		await this.putClientInfo(putClientInfoUrl, clientKey, clientIceCandidates, session);

		this.changeState('connecting-to-host');
		this.startPollingForIceCandidates(getEndpointInfoUrl);
	};

	close = () => {
		if (this.openPeerConnection) {
			this.openPeerConnection.close();
			this.openPeerConnection = null;
		}
		this.changeState('disconnected');
	};

	// sendData = (data: string | Blob | ArrayBuffer | ArrayBufferView) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	sendData = (data: any) => {
		if (this.dataChannel == null) {
			this.changeState('error', 'dataChannel is null. Unable to send the file to the Host!');
			return;
		} else if (!this.canSendMoreData()) {
			this.logger.warn('Data channel is full! Cannot send data at the moment');
			return;
		}
		this.dataChannel.send(data);
	};

	canSendMoreData = () => {
		return (
			this.dataChannel &&
			this.dataChannel.bufferedAmount < this.dataChannel.bufferedAmountLowThreshold
		);
	};

	private setUpClientIceGathering = (
		putClientInfoUrl: string,
		clientKey: string,
		clientIceCandidates: Set<RTCIceCandidateInit>,
		session: RTCSessionDescriptionInit
	) => {
		if (this.openPeerConnection === null) {
			this.changeState(
				'error',
				'openPeerConnection is null. Unable to gather Client ICE candidates'
			);
			return;
		}

		this.openPeerConnection.onicecandidate = async (e) => {
			this.logger.info(
				`onicecandidate - ${this.openPeerConnection!.connectionState} - ${e.candidate}`
			);
			if (e.candidate) {
				if (!setIncludes(clientIceCandidates, e.candidate)) {
					this.logger.log('client found new ice candidate! Adding it to our list');
					clientIceCandidates.add(e.candidate);
					await this.putClientInfo(putClientInfoUrl, clientKey, clientIceCandidates, session);
				}
			}
		};
		this.openPeerConnection.onicegatheringstatechange = async () => {
			this.logger.info(`onicegatheringstatechange - ${this.openPeerConnection!.iceGatheringState}`);
		};
		this.openPeerConnection.onicecandidateerror = (e) => {
			this.logger.error(`onicecandidateerror - ${this.openPeerConnection!.connectionState}`, e);
		};
	};
	private setUpConnectionStateGathering = (getEndpointInfoUrl: string) => {
		if (this.openPeerConnection === null) {
			this.changeState(
				'error',
				'openPeerConnection is null. Unable to gather Client ICE candidates'
			);
			return;
		}
		this.openPeerConnection.onconnectionstatechange = () => {
			this.logger.info(`onconnectionstatechange - ${this.openPeerConnection!.connectionState}`);
			if (this.openPeerConnection!.connectionState === 'connected') {
				this.stopPollingForIceCandidates();
				if (this.state === 'connecting-to-host') {
					this.changeState('connected');
				}
			}
			if (this.openPeerConnection!.connectionState === 'disconnected') {
				this.startPollingForIceCandidates(getEndpointInfoUrl);
			}
			if (this.openPeerConnection!.connectionState === 'failed') {
				this.stopPollingForIceCandidates();
				if (this.state !== 'done') {
					this.changeState('disconnected');
				}
			}
		};

		this.openPeerConnection.oniceconnectionstatechange = () => {
			this.logger.info(
				`oniceconnectionstatechange - ${this.openPeerConnection!.iceConnectionState}`
			);
			if (this.openPeerConnection!.iceConnectionState === 'failed') {
				this.logger.log('Failed to find a possible connection path');
				this.changeState('connection-impossible');
			}
		};
	};
	private stopPollingForIceCandidates = async () => {
		if (this.pollForIceTimer) {
			clearTimeout(this.pollForIceTimer);
		}
		this.pollForIceTimer = null;
	};
	private startPollingForIceCandidates = async (getEndpointInfoUrl: string) => {
		if (this.pollForIceTimer) {
			clearTimeout(this.pollForIceTimer);
		}

		await this.pollForConnection(getEndpointInfoUrl);

		this.pollForIceTimer = setTimeout(this.startPollingForIceCandidates, this.pollTimeForIceInMs);
	};
	private pollForConnection = async (getEndpointInfoUrl: string) => {
		if (this.openPeerConnection === null) {
			this.changeState('error', "openPeerConnection is null. Unable to retrieve Host's details");
			return;
		}

		this.logger.log('polling for host ice candidates', this.openPeerConnection.iceGatheringState);
		const { hostInfo } = await retrieveEndpointInfo(getEndpointInfoUrl);
		for (const iceCandidate of hostInfo.iceCandidates) {
			await this.openPeerConnection.addIceCandidate(iceCandidate);
		}
	};
	private putClientInfo = async (
		putClientInfoUrl: string,
		clientKey: string,
		clientIceCandidates: Set<RTCIceCandidateInit>,
		session: RTCSessionDescriptionInit
	) => {
		this.logger.log('Updating client info with new list of ice candidates');
		const response = await fetch(putClientInfoUrl, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				clientKey,
				iceCandidates: [...clientIceCandidates],
				session
			})
		});
		if (!response.ok) {
			throw Error('Could not update client info. Did another peer already connect?');
		}
	};
	private fetchIceServers = async (baseApi: string) => {
		const response = await fetch(`${baseApi}/turn-credentials`, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});
		if (!response.ok) {
			throw new Error('Fetching Error!');
		}
		const data = await response.json();

		if (data.success === false) {
			throw new Error(data.message || 'Unknown error occurred');
		}

		return data.iceServers;
	};
}
