import { toDataURL } from 'qrcode';
import { Logger } from '../dist';
import { FlottformState } from '../dist/internal';
import {
	EventEmitter,
	FileMetaInfos,
	FlottformEventMap,
	retrieveEndpointInfo,
	setIncludes
} from './internal';

export class FlottformChannel extends EventEmitter<FlottformEventMap> {
	private mode: string;
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
	private currentFile: {
		fileMeta: FileMetaInfos;
		arrayBuffer: ArrayBuffer[];
	} | null = null;

	constructor({
		mode,
		flottformApi,
		createClientUrl,
		rtcConfiguration,
		pollTimeForIceInMs,
		logger
	}: {
		mode: string;
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		rtcConfiguration: RTCConfiguration;
		pollTimeForIceInMs: number;
		logger: Logger;
	}) {
		super();
		this.mode = mode;
		this.flottformApi = flottformApi;
		this.createClientUrl = createClientUrl;
		this.rtcConfiguration = rtcConfiguration;
		this.pollTimeForIceInMs = pollTimeForIceInMs;
		this.logger = logger;
		Promise.resolve().then(() => {
			this.changeState('new', { channel: this });
		});
	}

	private changeState = (newState: FlottformState | 'disconnected', details?: any) => {
		this.state = newState;
		this.emit(newState, details);
		this.logger.info(`State changed to: ${newState}`, details == undefined ? '' : details);
	};

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
		// Setup listeners for messages incoming from the client
		this.setupDataChannelListeners();
	};

	close = () => {
		if (this.openPeerConnection) {
			this.openPeerConnection.close();
			this.openPeerConnection = null;
		}
		this.changeState('disconnected');
	};

	private setupDataChannelListeners = () => {
		if (this.dataChannel == null) {
			this.changeState(
				'error',
				'dataChannel is null. Unable to setup the listeners for the data channel'
			);
			return;
		}

		this.dataChannel.onmessage = (e) => {
			if (typeof e.data === 'string') {
				// string can be either file metadata or end of file marker
				const message = JSON.parse(e.data);
				if (message.data === 'input:file') {
					// Handle file metadata
					this.currentFile = { fileMeta: message, arrayBuffer: [] };
				} else if (message.data === 'eof') {
					// Handle end of file
					if (this.currentFile == null)
						throw new Error('currentFile is null. Unable to handle the received file');
					this.emit('file-received', this.currentFile);
				}
			} else if (e.data instanceof ArrayBuffer) {
				// Handle file chunk
				if (this.currentFile) {
					this.currentFile.arrayBuffer.push(e.data);
				}
			}
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

		this.dataChannel.onopen = (e) => {
			this.logger.log('data channel opened');
			this.changeState('waiting-for-file');
		};

		this.dataChannel.onclose = (e) => {
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
