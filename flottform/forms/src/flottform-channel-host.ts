import { toDataURL } from 'qrcode';
import {
	EventEmitter,
	FlottformEventMap,
	FlottformState,
	Logger,
	retrieveEndpointInfo,
	setIncludes
} from './internal';
/**
 * A class used to represent one peer (called client) to establish a WebRTC connection with another peer (called host).
 * It handles ICE candidate gathering and sending/receiving data.
 * The connection is initiated only when `start` method is called.
 *
 * This class emits various events throughout the connection lifecycle such as `connected`, `disconnected`, and `error`, allowing you to respond to the connection state changes.
 *
 * @fires new - Emitted when the host is created and ready to accept clients.
 * @fires waiting-for-client - Emitted when waiting for a client to connect.
 * @fires waiting-for-data - Emitted when the host is ready to receive data.
 * @fires waiting-for-ice - Emitted when ICE candidates are being gathered.
 * @fires receiving-data - Emitted when the host is receiving data from the client.
 * @fires file-received - Emitted when a complete file has been received.
 * @fires done - Emitted when the transfer is complete.
 * @fires error - Emitted when an error occurs during connection or data transfer.
 * @fires connected - Emitted when the host successfully connects to a client.
 * @fires disconnected - Emitted when the connection is closed.
 *
 * @extends EventEmitter
 */
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

	/**
	 * Creates an instance of FlottformChannelHost
	 *
	 * @param {Object} config - The configuration for setting up the channel for the host.
	 * @param {flottformApi} - The API endpoint for retrieving connection information.
	 * @param {createClientUrl} - A function that generates the client URL given an endpoint ID.
	 * @param {rtcConfiguration} - The RTC configuration for the WebRTC connection.
	 * @param {pollTimeForIceInMs} - The time interval (in ms) for polling ICE candidates.
	 * @param {logger} - Optional logger for logging connection events.
	 */
	constructor({
		flottformApi,
		createClientUrl,
		rtcConfiguration,
		pollTimeForIceInMs,
		logger
	}: {
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		rtcConfiguration: RTCConfiguration;
		pollTimeForIceInMs: number;
		logger: Logger;
	}) {
		super();
		this.flottformApi = flottformApi;
		this.createClientUrl = createClientUrl;
		this.rtcConfiguration = rtcConfiguration;
		this.pollTimeForIceInMs = pollTimeForIceInMs;
		this.logger = logger;
		Promise.resolve().then(() => {
			this.changeState('new', { channel: this });
		});
	}
	/**
	 * Changes the state of the host and emits the corresponding event.
	 *
	 * @param newState - The new state to transition to.
	 * @param details - Optional additional details to emit with the event.
	 */
	private changeState = (newState: FlottformState | 'disconnected', details?: any) => {
		this.state = newState;
		this.emit(newState, details);
		this.logger.info(`State changed to: ${newState}`, details == undefined ? '' : details);
	};

	/**
	 * Starts the WebRTC connection process for the host. The connection is not established until this method is called.
	 */
	start = async () => {
		if (this.openPeerConnection) {
			this.close();
		}

		this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration);

		this.dataChannel = this.createDataChannel();

		const session = await this.openPeerConnection.createOffer();
		await this.openPeerConnection.setLocalDescription(session);

		const baseApi = (
			this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)
		)
			.toString()
			.replace(/\/$/, '');

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

	/**
	 * Closes the WebRTC connection if it is currently established.
	 *
	 * @fires disconnected - Emitted when the connection is successfully closed.
	 */
	close = () => {
		if (this.openPeerConnection) {
			this.openPeerConnection.close();
			this.openPeerConnection = null;
		}
		this.changeState('disconnected');
	};

	/**
	 * Sets up the WebRTC data channel listener to handle incoming data from the client.
	 *
	 * @fires error - Emitted when the data channel is not set up yet.
	 * @fires receiving-data - Emitted when data is received from the client.
	 */
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

	/**
	 * Sets up the ICE candidate gathering process and sends the gathered candidates to the client peer.
	 *
	 * @param putHostInfoUrl - The URL where the host's information should be sent.
	 * @param hostKey - The host's unique key used for identification.
	 * @param hostIceCandidates - A set of ICE candidates gathered by the host.
	 * @param session - The RTC session description used for connection setup.
	 *
	 * @fires error - Emitted when the connection channel is not setup yet.
	 */
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

	/**
	 * Sets up a process to periodically retrieve the connection state and ICE candidates from the client.
	 *
	 * @param getEndpointInfoUrl - The URL for retrieving ICE candidate information from the client.
	 *
	 * @fires error - Emitted when the connection channel is: not setup yet, connection establishment failed or impossible.
	 */
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

	/**
	 * Stops polling for a connection or ICE candidates.
	 */
	private stopPollingForConnection = async () => {
		if (this.pollForIceTimer) {
			clearTimeout(this.pollForIceTimer);
		}
		this.pollForIceTimer = null;
	};

	/**
	 * Starts polling for a connection and ICE candidates from the client.
	 *
	 * @param getEndpointInfoUrl - The URL to use for polling the ICE candidates.
	 */
	private startPollingForConnection = async (getEndpointInfoUrl: string) => {
		if (this.pollForIceTimer) {
			clearTimeout(this.pollForIceTimer);
		}

		await this.pollForConnection(getEndpointInfoUrl);

		this.pollForIceTimer = setTimeout(() => {
			this.startPollingForConnection(getEndpointInfoUrl);
		}, this.pollTimeForIceInMs);
	};

	/**
	 * Creates an endpoint on the server where the client can retrieve the host's connection information.
	 *
	 * @param baseApi - The base API URL for the host's information.
	 * @param session - The RTC session description used for connection setup.
	 */
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

	/**
	 * Polls the client for connection state and ICE candidates to complete the WebRTC connection.
	 *
	 * @param getEndpointInfoUrl - The URL for retrieving connection and candidate information.
	 *
	 * @fires error - Emitted when the connection channel is not setup yet.
	 * @fires waiting-for-ice - Emitted when the host finds a client to connect to.
	 */
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

	/**
	 * Sets up the data channel for transferring files and other large data types.
	 *
	 * @fires error - Emitted when the data channel is not setup yet.
	 * @fires waiting-for-data - Emitted when the data channel is opened.
	 */
	private setupDataChannelForTransfer = () => {
		if (this.dataChannel === null) {
			this.changeState('error', 'dataChannel is null. Unable to setup a Data Channel');
			return;
		}
		// @ts-ignore: Unused variable
		this.dataChannel.onopen = (e) => {
			this.logger.log('data channel opened');
			this.changeState('waiting-for-data');
		};
		// @ts-ignore: Unused variable
		this.dataChannel.onclose = (e) => {
			this.logger.log('data channel closed');
		};

		this.dataChannel.onerror = (e) => {
			this.logger.log('channel.onerror', e);
			this.changeState('error', { message: 'file-transfer' });
		};
	};

	/**
	 * Creates the WebRTC data channel for communication with the client peer.
	 *
	 * @fires error - Emitted when the data channel is not setup yet.
	 */
	private createDataChannel = () => {
		if (this.openPeerConnection === null) {
			this.changeState('error', 'openPeerConnection is null. Unable to create a new Data Channel');
			return null;
		}

		this.channelNumber++;
		const channelName = `data-channel-${this.channelNumber}`;
		return this.openPeerConnection.createDataChannel(channelName);
	};

	/**
	 * Sends host information, including ICE candidates, to a remote server where the client can access it.
	 *
	 * @param putHostInfoUrl - The URL where the host's information should be sent.
	 * @param hostKey - The host's unique key for identification.
	 * @param hostIceCandidates - A set of ICE candidates gathered by the host.
	 * @param session - The RTC session description used for connection setup.
	 *
	 * @throws Will throw an error if it wasn't able to update the host's info
	 * @fires error if some error happens during the process of saving the host's info to the server.
	 */
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
