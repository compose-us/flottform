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
/**
 * A class used to represent one peer (called client) to establish a WebRTC connection with another peer (called host).
 * It handles ICE candidate gathering and sending/receiving data.
 * The connection is initiated only when `start` method is called.
 *
 * This class emits various events during the connection lifecycle, such as `connected`, `disconnected`, and `error`, allowing you to respond to changes in the connection state.
 *
 * @fires init - Emitted when the client is initialized.
 * @fires retrieving-info-from-endpoint - Emitted when information is being retrieved from the endpoint.
 * @fires sending-client-info - Emitted when client information is being sent to the host.
 * @fires connecting-to-host - Emitted when attempting to connect to the host.
 * @fires connected - Emitted when the connection is successfully established.
 * @fires connection-impossible - Emitted if the connection to the host cannot be established.
 * @fires done - Emitted when the all of the data is received.
 * @fires disconnected - Emitted when the connection is closed.
 * @fires error - Emitted when there is an error during the connection.
 * @fires bufferedamountlow - Emitted when the buffered amount for data channels is low.
 *
 * @extends EventEmitter
 */
export class FlottformChannelClient extends EventEmitter<Listeners> {
	private flottformApi: string;
	private endpointId: string;
	private rtcConfiguration: RTCConfiguration;
	private pollTimeForIceInMs: number;
	private logger: Logger;

	private state: ClientState = 'init';
	private openPeerConnection: RTCPeerConnection | null = null;
	private dataChannel: RTCDataChannel | null = null;
	private pollForIceTimer: NodeJS.Timeout | number | null = null;
	private BUFFER_THRESHOLD = 128 * 1024; // 128KB buffer threshold (maximum of 4 chunks in the buffer waiting to be sent over the network)
	/**
	 * Creates an instance of FlottformChannelClient
	 *
	 * @param {Object} config - The configuration for setting up the channel for the host.
	 *
	 * @param {endpointId} - The unique identifier of the endpoint to connect to.
	 * @param {flottformApi} - The API endpoint for retrieving connection information.
	 * @param {rtcConfiguration} - Optional RTC configuration for WebRTC connection.
	 * @param {pollTimeForIceInMs} - Optional time in milliseconds for polling ICE candidates.
	 * @param {logger} - Optional logger for logging connection events (default: `console`).
	 */
	constructor({
		endpointId,
		flottformApi,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		endpointId: string;
		flottformApi: string;
		rtcConfiguration?: RTCConfiguration;
		pollTimeForIceInMs?: number;
		logger?: Logger;
	}) {
		super();
		this.endpointId = endpointId;
		this.flottformApi = flottformApi;
		this.rtcConfiguration = rtcConfiguration;
		this.pollTimeForIceInMs = pollTimeForIceInMs;
		this.logger = logger;
	}
	/**
	 * Changes the state of the client and emits the corresponding event.
	 *
	 * @param newState - The new state to transition to.
	 * @param details - Optional additional details to emit with the event.
	 */

	private changeState = (newState: ClientState, details?: any) => {
		this.state = newState;
		this.emit(newState, details);
		this.logger.info(`**Client State changed to: ${newState}`, details == undefined ? '' : details);
	};
	/**
	 * Starts the WebRTC connection process. The connection is not established until this method is called.
	 *
	 */
	start = async () => {
		if (this.openPeerConnection) {
			this.close();
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
	 * Sends data to the connected peer via the WebRTC data channel.
	 *
	 * @param data - The data to send to the peer.
	 * @fires error - Emits the state error if the connection is not established.
	 */
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
	/**
	 * Determines if more data can be sent based on the WebRTC data channel's buffered amount. This is useful when dealing with large amounts of data.
	 *
	 * @returns `true` if more data can be sent, otherwise `false`.
	 */
	canSendMoreData = () => {
		return (
			this.dataChannel &&
			this.dataChannel.bufferedAmount < this.dataChannel.bufferedAmountLowThreshold
		);
	};
	/**
	 * Sets up event listeners for ICE candidate gathering and sends the gathered candidates to the peer.
	 *
	 * @param putClientInfoUrl - The URL where client information should be sent.
	 * @param clientKey - The client's unique key used for identification.
	 * @param clientIceCandidates - A set of ICE candidates gathered by the client.
	 * @param session - The RTC session description used for connection setup.
	 */
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
		// @ts-ignore: Unused variable
		this.openPeerConnection.onicegatheringstatechange = async (e) => {
			this.logger.info(`onicegatheringstatechange - ${this.openPeerConnection!.iceGatheringState}`);
		};
		this.openPeerConnection.onicecandidateerror = (e) => {
			this.logger.error(`onicecandidateerror - ${this.openPeerConnection!.connectionState}`, e);
		};
	};
	/**
	 * Periodically retrieves ICE candidates from the host to complete the WebRTC connection.
	 *
	 * @param getEndpointInfoUrl - The URL for retrieving host's ICE candidate information.
	 */
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
		// @ts-ignore: Unused variable
		this.openPeerConnection.oniceconnectionstatechange = (e) => {
			this.logger.info(
				`oniceconnectionstatechange - ${this.openPeerConnection!.iceConnectionState}`
			);
			if (this.openPeerConnection!.iceConnectionState === 'failed') {
				this.logger.log('Failed to find a possible connection path');
				this.changeState('connection-impossible');
			}
		};
	};
	/**
	 * Stops polling for ICE candidates.
	 */
	private stopPollingForIceCandidates = async () => {
		if (this.pollForIceTimer) {
			clearTimeout(this.pollForIceTimer);
		}
		this.pollForIceTimer = null;
	};

	/**
	 * Starts polling for ICE candidates from the host.
	 *
	 * @param getEndpointInfoUrl - The URL to use for polling the ICE candidates.
	 */
	private startPollingForIceCandidates = async (getEndpointInfoUrl: string) => {
		if (this.pollForIceTimer) {
			clearTimeout(this.pollForIceTimer);
		}

		await this.pollForConnection(getEndpointInfoUrl);

		this.pollForIceTimer = setTimeout(this.startPollingForIceCandidates, this.pollTimeForIceInMs);
	};

	/**
	 * Polls for the WebRTC connection state and ICE candidates from the host.
	 *
	 * @param getEndpointInfoUrl - The URL for retrieving connection and candidate information.
	 */
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

	/**
	 * Sends client information, including ICE candidates, to a remote server where the host can retrieve it.
	 *
	 *
	 * @param putClientInfoUrl - The URL where client information should be sent.
	 * @param clientKey - The client's unique key for identification.
	 * @param clientIceCandidates - A set of ICE candidates gathered by the client.
	 * @param session - The RTC session description used for connection setup.
	 */
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
}
