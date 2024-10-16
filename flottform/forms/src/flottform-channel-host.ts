import { toDataURL } from 'qrcode';
import {
	EventEmitter,
	FlottformEventMap,
	FlottformState,
	Logger,
	retrieveEndpointInfo,
	DEFAULT_WEBRTC_CONFIG,
	setIncludes
} from './internal';

export class FlottformChannelHost extends EventEmitter<FlottformEventMap> {
	private flottformApi: string | URL;
	private createClientUrl: (params: { endpointId: string }) => Promise<string>;
	private rtcConfiguration: RTCConfiguration;
	private pollTimeForIceInMs: number;
	private logger: Logger;

	private state: FlottformState | 'disconnected' = 'new';
	private channelNumber: number = 0;
	private openPeerConnection: RTCPeerConnection | null = null;
	private dataChannel: RTCDataChannel | null = null;
	private pollForIceTimer: NodeJS.Timeout | number | null = null;

	constructor({
		flottformApi,
		createClientUrl,
		pollTimeForIceInMs,
		logger
	}: {
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		pollTimeForIceInMs: number;
		logger: Logger;
	}) {
		super();
		this.flottformApi = flottformApi;
		this.createClientUrl = createClientUrl;
		this.rtcConfiguration = DEFAULT_WEBRTC_CONFIG;
		this.pollTimeForIceInMs = pollTimeForIceInMs;
		this.logger = logger;
		Promise.resolve().then(() => {
			this.changeState('new', { channel: this });
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private changeState = (newState: FlottformState | 'disconnected', details?: any) => {
		this.state = newState;
		this.emit(newState, details);
		this.logger.info(`State changed to: ${newState}`, details == undefined ? '' : details);
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

		this.dataChannel = this.createDataChannel();

		const session = await this.openPeerConnection.createOffer();
		await this.openPeerConnection.setLocalDescription(session);

		const { endpointId, hostKey } = await this.createEndpoint(baseApi, session);
		this.logger.log('Created endpoint', { endpointId, hostKey });

		const getEndpointInfoUrl = `${baseApi}/${endpointId}`;
		const putHostInfoUrl = `${baseApi}/${endpointId}/host`;

		const hostIceCandidates = new Set<RTCIceCandidateInit>();
		await this.putHostInfo(putHostInfoUrl, hostKey, hostIceCandidates, session);

		this.setUpConnectionStateGathering(getEndpointInfoUrl);
		this.setupHostIceGathering(putHostInfoUrl, hostKey, hostIceCandidates, session);
		this.setupDataChannelForTransfer();

		const connectLink = await this.createClientUrl({ endpointId });
		this.changeState('waiting-for-client', {
			qrCode: await toDataURL(connectLink),
			link: connectLink,
			channel: this
		});
		// Setup listener for messages incoming from the client
		this.setupDataChannelListener();
	};

	close = () => {
		if (this.openPeerConnection) {
			this.openPeerConnection.close();
			this.openPeerConnection = null;
		}
		this.changeState('disconnected');
	};

	private setupDataChannelListener = () => {
		if (this.dataChannel == null) {
			this.changeState(
				'error',
				'dataChannel is null. Unable to setup the listeners for the data channel'
			);
			return;
		}

		this.dataChannel.onmessage = (e) => {
			// Handling the incoming data from the client depends on the use case.
			this.emit('receiving-data', e);
		};
	};

	private setupHostIceGathering = (
		putHostInfoUrl: string,
		hostKey: string,
		hostIceCandidates: Set<RTCIceCandidateInit>,
		session: RTCSessionDescriptionInit
	) => {
		if (this.openPeerConnection === null) {
			this.changeState('error', 'openPeerConnection is null. Unable to gather Host ICE candidates');
			return;
		}

		this.openPeerConnection.onicecandidate = async (e) => {
			this.logger.info(
				`onicecandidate - ${this.openPeerConnection!.connectionState} - ${e.candidate}`
			);
			if (e.candidate) {
				if (!setIncludes(hostIceCandidates, e.candidate)) {
					this.logger.log('host found new ice candidate! Adding it to our list');
					hostIceCandidates.add(e.candidate);
					await this.putHostInfo(putHostInfoUrl, hostKey, hostIceCandidates, session);
				}
			}
		};

		this.openPeerConnection.onicegatheringstatechange = async (e) => {
			this.logger.info(
				`onicegatheringstatechange - ${this.openPeerConnection!.iceGatheringState} - ${e}`
			);
		};

		this.openPeerConnection.onicecandidateerror = async (e) => {
			this.logger.error('peerConnection.onicecandidateerror', e);
		};
	};

	private setUpConnectionStateGathering = (getEndpointInfoUrl: string) => {
		if (this.openPeerConnection === null) {
			this.changeState(
				'error',
				"openPeerConnection is null. Unable to poll for the client's details"
			);
			return;
		}

		this.startPollingForConnection(getEndpointInfoUrl);

		this.openPeerConnection.onconnectionstatechange = () => {
			this.logger.info(`onconnectionstatechange - ${this.openPeerConnection!.connectionState}`);
			if (this.openPeerConnection!.connectionState === 'connected') {
				this.stopPollingForConnection();
			}
			if (this.openPeerConnection!.connectionState === 'disconnected') {
				this.startPollingForConnection(getEndpointInfoUrl);
			}
			if (this.openPeerConnection!.connectionState === 'failed') {
				this.stopPollingForConnection();
				this.changeState('error', { message: 'connection-failed' });
			}
		};

		this.openPeerConnection.oniceconnectionstatechange = async (e) => {
			this.logger.info(
				`oniceconnectionstatechange - ${this.openPeerConnection!.iceConnectionState} - ${e}`
			);
			if (this.openPeerConnection!.iceConnectionState === 'failed') {
				this.logger.log('Failed to find a possible connection path');
				this.changeState('error', { message: 'connection-impossible' });
			}
		};
	};

	private stopPollingForConnection = async () => {
		if (this.pollForIceTimer) {
			clearTimeout(this.pollForIceTimer);
		}
		this.pollForIceTimer = null;
	};

	private startPollingForConnection = async (getEndpointInfoUrl: string) => {
		if (this.pollForIceTimer) {
			clearTimeout(this.pollForIceTimer);
		}

		await this.pollForConnection(getEndpointInfoUrl);

		this.pollForIceTimer = setTimeout(() => {
			this.startPollingForConnection(getEndpointInfoUrl);
		}, this.pollTimeForIceInMs);
	};

	private createEndpoint = async (baseApi: string, session: RTCSessionDescriptionInit) => {
		const response = await fetch(`${baseApi}/create`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ session })
		});

		return response.json();
	};

	private fetchIceServers = async (baseApi: string) => {
		const response = await fetch(`${baseApi}/ice-server-credentials`, {
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

	private pollForConnection = async (getEndpointInfoUrl: string) => {
		if (this.openPeerConnection === null) {
			this.changeState('error', "openPeerConnection is null. Unable to retrieve Client's details");
			return;
		}

		this.logger.log('polling for client ice candidates', this.openPeerConnection.iceGatheringState);
		const { clientInfo } = await retrieveEndpointInfo(getEndpointInfoUrl);

		if (clientInfo && this.state === 'waiting-for-client') {
			this.logger.log('Found a client that wants to connect!');
			this.changeState('waiting-for-ice');
			await this.openPeerConnection.setRemoteDescription(clientInfo.session);
		}

		for (const iceCandidate of clientInfo?.iceCandidates ?? []) {
			await this.openPeerConnection.addIceCandidate(iceCandidate);
		}
	};

	private setupDataChannelForTransfer = () => {
		if (this.dataChannel === null) {
			this.changeState('error', 'dataChannel is null. Unable to setup a Data Channel');
			return;
		}

		this.dataChannel.onopen = () => {
			this.logger.log('data channel opened');
			this.changeState('waiting-for-data');
		};

		this.dataChannel.onclose = () => {
			this.logger.log('data channel closed');
		};

		this.dataChannel.onerror = (e) => {
			this.logger.log('channel.onerror', e);
			this.changeState('error', { message: 'file-transfer' });
		};
	};

	private createDataChannel = () => {
		if (this.openPeerConnection === null) {
			this.changeState('error', 'openPeerConnection is null. Unable to create a new Data Channel');
			return null;
		}

		this.channelNumber++;
		const channelName = `data-channel-${this.channelNumber}`;
		return this.openPeerConnection.createDataChannel(channelName);
	};

	private putHostInfo = async (
		putHostInfoUrl: string,
		hostKey: string,
		hostIceCandidates: Set<RTCIceCandidateInit>,
		session: RTCSessionDescriptionInit
	) => {
		try {
			this.logger.log('Updating host info with new list of ice candidates');
			const response = await fetch(putHostInfoUrl, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					hostKey,
					iceCandidates: [...hostIceCandidates],
					session
				})
			});
			if (!response.ok) {
				throw Error('Could not update host info');
			}
		} catch (err) {
			this.changeState('error', err);
		}
	};
}
