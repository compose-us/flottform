import {
	EventEmitter,
	Logger,
	FlottformChannelPeerEvents,
	FlottformChannelHostEvents,
	FlottformChannelClientEvents,
	retrieveEndpointInfo,
	type SafeEndpointInfo
} from '../internal';
import { cryptoKeyToEncryptionKey, decrypt, encrypt, generateKey } from './encryption';

type SignalingEndpoint = {
	encryptionKey: string;
	urlForPeer: string;
	updatePeerInfo: (
		iceCandidates: Array<RTCIceCandidateInit>,
		hostDescription: RTCSessionDescriptionInit
	) => Promise<void>;
};

interface SignalingStrategy {
	createSignalingEndpoint: (offer: RTCSessionDescriptionInit) => Promise<SignalingEndpoint>;
	connectToEndpoint: (endpointUrl: string, decryptionKey: string) => Promise<void>;
}

type ConnectionErrorHandler = (cause: 'connection-impossible' | 'connection-failed') => void;
type EncryptedHttpPollingFlottformSignalingServerOptions = {
	cryptoKey: CryptoKey;
	flottformApi: string | URL;
	logger: Logger;
	peerConnection: RTCPeerConnection;
	pollTimeForIceInMs: number;
	selectEncryptedPeerInfoFromEndpointInfo: (endpointInfo: SafeEndpointInfo) => string;
	onError: ConnectionErrorHandler;
};

class EncryptedHttpPollingFlottformSignalingServer implements SignalingStrategy {
	private baseApi: string;
	private cryptoKey: CryptoKey | null = null;
	private logger: Logger;
	private peerConnection: RTCPeerConnection;
	private pollTimeForIceInMs: number;
	private pollForIceTimer: ReturnType<typeof setTimeout> | undefined = undefined;
	private selectEncryptedPeerInfoFromEndpointInfo: (endpointInfo: SafeEndpointInfo) => string;
	private onError: ConnectionErrorHandler;

	constructor({
		flottformApi,
		cryptoKey,
		logger,
		peerConnection,
		pollTimeForIceInMs,
		selectEncryptedPeerInfoFromEndpointInfo,
		onError = () => {}
	}: EncryptedHttpPollingFlottformSignalingServerOptions) {
		this.baseApi = (flottformApi instanceof URL ? flottformApi : new URL(flottformApi))
			.toString()
			.replace(/\/$/, '');
		this.cryptoKey = cryptoKey;
		this.logger = logger;
		this.peerConnection = peerConnection;
		this.pollTimeForIceInMs = pollTimeForIceInMs;
		this.selectEncryptedPeerInfoFromEndpointInfo = selectEncryptedPeerInfoFromEndpointInfo;
		this.onError = onError;
	}

	private startPollingForConnection = async (getEndpointInfoUrl: string) => {
		clearTimeout(this.pollForIceTimer);

		await this.pollForConnection(getEndpointInfoUrl);

		this.pollForIceTimer = setTimeout(() => {
			this.startPollingForConnection(getEndpointInfoUrl);
		}, this.pollTimeForIceInMs);
	};

	private pollForConnection = async (getEndpointInfoUrl: string) => {
		this.logger.log('polling for ice candidates', this.peerConnection.iceGatheringState);
		const encryptedEndpointInfo = await retrieveEndpointInfo(getEndpointInfoUrl);

		if (!this.cryptoKey) {
			throw new Error('CryptoKey is null! Decryption is not possible!!');
		}

		const encryptedPeerInfo =
			await this.selectEncryptedPeerInfoFromEndpointInfo(encryptedEndpointInfo);

		const peerInfo = await decrypt(encryptedPeerInfo, this.cryptoKey);

		const decryptedSession = JSON.parse(peerInfo.session);
		const decryptedIceCandidates = JSON.parse(peerInfo.iceCandidates);

		// TODO check if this needs a check for existing remote description
		if (peerInfo) {
			await this.peerConnection.setRemoteDescription(decryptedSession);
		}

		for (const iceCandidate of decryptedIceCandidates ?? []) {
			await this.peerConnection.addIceCandidate(iceCandidate);
		}
	};

	private stopPollingForConnection = async () => {
		clearTimeout(this.pollForIceTimer);
		this.pollForIceTimer = undefined;
	};

	private setUpConnectionStateGathering = (getEndpointInfoUrl: string) => {
		this.startPollingForConnection(getEndpointInfoUrl);

		this.peerConnection.onconnectionstatechange = () => {
			this.logger.info(`onconnectionstatechange - ${this.peerConnection!.connectionState}`);
			if (this.peerConnection.connectionState === 'connected') {
				this.stopPollingForConnection();
			}
			if (this.peerConnection.connectionState === 'disconnected') {
				this.startPollingForConnection(getEndpointInfoUrl);
			}
			if (this.peerConnection.connectionState === 'failed') {
				this.stopPollingForConnection();
				this.logger.warn('Connection failed.');
				this.onError('connection-failed');
			}
		};

		this.peerConnection.oniceconnectionstatechange = async () => {
			if (this.peerConnection.iceConnectionState === 'failed') {
				this.logger.warn('Failed to find a possible connection path');
				this.onError('connection-impossible');
			}
		};
	};

	private setupIceGathering(
		iceCandidates: Array<RTCIceCandidateInit>,
		mySession: RTCSessionDescriptionInit,
		updatePeerInfo: (
			iceCandidates: Array<RTCIceCandidateInit>,
			mySession: RTCSessionDescriptionInit
		) => Promise<void>
	) {
		this.peerConnection.onicecandidate = async (e) => {
			this.logger.info(`onicecandidate - ${this.peerConnection!.connectionState} - ${e.candidate}`);
			if (e.candidate) {
				this.logger.log('host found new ice candidate! Adding it to our list');
				iceCandidates.push(e.candidate);
				await updatePeerInfo(iceCandidates, mySession);
			}
		};

		this.peerConnection.onicegatheringstatechange = async (e) => {
			this.logger.info(
				`onicegatheringstatechange - ${this.peerConnection.iceGatheringState} - ${e}`
			);
		};

		this.peerConnection.onicecandidateerror = async (e) => {
			this.logger.error('peerConnection.onicecandidateerror', e);
		};
	}

	private async createEndpoint(
		baseApi: string,
		session: RTCSessionDescriptionInit,
		cryptoKey: CryptoKey
	): Promise<{ endpointId: string; hostKey: string }> {
		const encryptedSession = await encrypt(JSON.stringify({ session }), cryptoKey);

		const response = await fetch(`${baseApi}/create`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ hostInfo: encryptedSession })
		});

		return response.json();
	}

	async createSignalingEndpoint(
		offer: RTCSessionDescriptionInit,
		createClientUrl: (options: { endpointId: string; encryptionKey: string }) => Promise<string>
	) {
		const cryptoKey = await generateKey();

		const { endpointId, hostKey } = await this.createEndpoint(this.baseApi, offer, cryptoKey);
		const getEndpointInfoUrl = `${this.baseApi}/${endpointId}`;
		const putHostInfoUrl = `${this.baseApi}/${endpointId}/host`;

		this.setUpConnectionStateGathering(getEndpointInfoUrl);
		const updatePeerInfo = async (updatedIceCandidates, updatedSession) => {
			try {
				this.logger.log('Updating host info with new list of ice candidates');

				const encryptedHostInfo = await encrypt(
					JSON.stringify({
						session: JSON.stringify(updatedSession),
						iceCandidates: JSON.stringify([...updatedIceCandidates])
					}),
					cryptoKey
				);
				const response = await fetch(putHostInfoUrl, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						hostKey,
						hostInfo: encryptedHostInfo
					})
				});
				if (!response.ok) {
					throw Error('Could not update host info');
				}
			} catch (err) {
				this.logger.error('Could not update host peer information', err);
				// TODO call onError?
			}
		};

		this.setupIceGathering([], offer, updatePeerInfo);
		const encryptionKey = await cryptoKeyToEncryptionKey(cryptoKey);
		if (!encryptionKey) {
			throw new Error('Encryption Key is undefined!');
		}
		const connectLink = await createClientUrl({ endpointId, encryptionKey });
		return {
			urlForPeer: connectLink,
			updatePeerInfo
		};
	}
}

export abstract class FlottformChannelPeer<
	EventMap extends FlottformChannelPeerEvents
> extends EventEmitter<EventMap> {
	protected logger: Logger;
	protected signalingStrategy: SignalingStrategy;
	protected rtcConfiguration: RTCConfiguration;
	protected peerConnection: RTCPeerConnection | null;

	constructor(
		logger: Logger,
		signalingStrategy: SignalingStrategy,
		rtcConfiguration: RTCConfiguration = {}
	) {
		super();
		this.logger = logger;
		this.signalingStrategy = signalingStrategy;
		this.rtcConfiguration = rtcConfiguration;
		this.peerConnection = null;
	}

	protected abstract getRtcConfiguration(): Promise<RTCConfiguration>;
	protected abstract initializePeerConnection(
		connection: RTCPeerConnection
	): Promise<RTCSessionDescriptionInit>;
	protected abstract retrieveRemoteDescription(): Promise<RTCSessionDescriptionInit>;

	protected async cleanup(): Promise<void> {
		if (this.peerConnection) {
			this.peerConnection.close();
			this.peerConnection = null;
		}
	}

	async start(): Promise<void> {
		// 0. close existing connections
		await this.cleanup();

		// 1. create the connection
		const rtcConfig = await this.getRtcConfiguration();
		const connection = new RTCPeerConnection(rtcConfig);

		// 2. create local description info
		const offerOrAnswer = await this.initializePeerConnection(connection);
		await connection.setLocalDescription(offerOrAnswer);

		// 3. set up signaling
		const endpoint = await this.signalingStrategy.createSignalingEndpoint(offerOrAnswer);

		this.peerConnection = connection;
	}
}

type FlottformChannelHostConstructor = {
	rtcConfiguration?: RTCConfiguration;
	signalingStrategy?: SignalingStrategy;
	logger?: Logger;
};

class FlottformChannelHost extends FlottformChannelPeer<FlottformChannelHostEvents> {
	private flottformApi: URL;
	constructor({
		rtcConfiguration = {},
		signalingStrategy = new EncryptedHttpPollingFlottformSignalingServer(),
		logger = console
	}: FlottformChannelHostConstructor = {}) {
		super(logger, signalingStrategy, rtcConfiguration);
		this.flottformApi = flottformApi instanceof URL ? flottformApi : new URL(flottformApi);
	}
	protected async initializePeerConnection(
		connection: RTCPeerConnection
	): Promise<RTCSessionDescriptionInit> {
		const baseApi = (
			this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)
		)
			.toString()
			.replace(/\/$/, '');
		const hostOffer = await connection.createOffer();
		const { endpointId, hostKey } = await this.createEndpoint(hostOffer);
	}
}

class FlottformChannelClient extends FlottformChannelPeer<FlottformChannelClientEvents> {
	protected async getRtcConfiguration(): Promise<RTCConfiguration> {
		const config: RTCConfiguration = {};
		return config;
	}
	protected async initializePeerConnection(
		connection: RTCPeerConnection
	): Promise<RTCSessionDescriptionInit> {
		const hostInfo = await this.signalingStrategy.retrieveRemoteSessionDescription();
		await connection.setRemoteDescription(hostInfo);
		return await connection.createAnswer();
	}
}
