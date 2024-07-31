import {
	ClientState,
	DEFAULT_WEBRTC_CONFIG,
	EventEmitter,
	FileMetaInfos,
	Logger,
	POLL_TIME_IN_MS,
	generateSecretKey,
	retrieveEndpointInfo,
	setIncludes
} from './internal';

type Listeners = {
	init: [details?: any];
	'retrieving-info-from-endpoint': [];
	'sending-client-info': [];
	'connecting-to-host': [];
	connected: [];
	'connection-impossible': [];
	sending: [];
	done: [];
	disconnected: [];
	error: [];
};

export class FlottformClient extends EventEmitter<Listeners> {
	private flottformApi: string;
	private endpointId: string;
	private inputField: HTMLInputElement;
	private rtcConfiguration: RTCConfiguration;
	private pollTimeForIceInMs: number;
	private logger: Logger;

	private state: ClientState = 'init';
	private openPeerConnection: RTCPeerConnection | null = null;
	private dataChannel: RTCDataChannel | null = null;
	private pollForIceTimer: NodeJS.Timeout | number | null = null;
	private chunkSize: number = 16384; // 16 Kb chunks

	constructor({
		endpointId,
		fileInput,
		flottformApi,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		endpointId: string;
		fileInput: HTMLInputElement;
		flottformApi: string;
		rtcConfiguration?: RTCConfiguration;
		pollTimeForIceInMs?: number;
		logger?: Logger;
	}) {
		super();
		this.endpointId = endpointId;
		this.flottformApi = flottformApi;
		this.inputField = fileInput;
		this.rtcConfiguration = rtcConfiguration;
		this.pollTimeForIceInMs = pollTimeForIceInMs;
		this.logger = logger;
	}

	private changeState = (newState: ClientState, details?: any) => {
		this.state = newState;
		this.emit(newState, details);
		this.logger.info(`**Client State changed to: ${newState}`, details == undefined ? '' : details);
	};

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

	sendFile = async (onProgress?: (progress: number) => void) => {
		if (this.dataChannel == null) {
			this.changeState('error', 'dataChannel is null. Unable to send the file to the Host!');
			return;
		}
		const { fileMeta, arrayBuffer } = await this.serializeData(this.inputField);

		// Send file metadata
		this.dataChannel.send(JSON.stringify(fileMeta));

		// Send file in chunks
		for (let i = 0; i * this.chunkSize <= arrayBuffer.byteLength; i++) {
			//sendProgress(i / (arrayBuffer.byteLength / maxChunkSize));
			const end = (i + 1) * this.chunkSize;
			this.dataChannel.send(arrayBuffer.slice(i * this.chunkSize, end));
		}

		// Send end-of-file marker
		this.dataChannel.send(JSON.stringify({ data: 'eof' }));

		this.logger.log(`File sent: ${fileMeta.name}`);
		this.changeState('done');
	};

	private serializeData = async (
		fileInput: HTMLInputElement
	): Promise<{
		fileMeta: FileMetaInfos;
		arrayBuffer: ArrayBuffer;
	}> => {
		this.logger.log(fileInput.value);
		const file = fileInput.files?.item(0);
		if (!file) {
			const arrayBuffer = new TextEncoder().encode(fileInput.value);
			const fileMeta = {
				data: 'input:text',
				size: arrayBuffer.byteLength
			};
			return { arrayBuffer, fileMeta };
		}
		const arrayBuffer = await file.arrayBuffer();
		if (!arrayBuffer) {
			this.logger.log('no array buffer');
			throw Error('no array buffer in file input element');
		}
		const fileMeta = {
			data: 'input:file',
			lastModified: file.lastModified,
			name: file.name,
			type: file.type,
			size: file.size
		};
		return { fileMeta, arrayBuffer };
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
		this.openPeerConnection.onicegatheringstatechange = async (e) => {
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
}
