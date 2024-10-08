import { FlottformChannelHost } from './flottform-channel-host';

type HostKey = string;
type ClientKey = string;
type EndpointId = string;
type EndpointInfo = {
	hostKey: HostKey;
	endpointId: EndpointId;
	hostInfo: {
		session: RTCSessionDescriptionInit;
		iceCandidates: RTCIceCandidateInit[];
	};
	clientKey?: ClientKey;
	clientInfo?: {
		session: RTCSessionDescriptionInit;
		iceCandidates: RTCIceCandidateInit[];
	};
};

export type BaseListeners = {
	new: [];
	disconnected: [];
	error: [error: Error];
	connected: [];
	'endpoint-created': [{ link: string; qrCode: string }];
	'webrtc:waiting-for-client': [
		event: { link: string; qrCode: string; channel: FlottformChannelHost }
	];
	'webrtc:waiting-for-ice': [];
};

export type SafeEndpointInfo = Omit<EndpointInfo, 'hostKey' | 'clientKey'>;

export type ClientState =
	| 'init'
	| 'retrieving-info-from-endpoint' // first request to server
	| 'sending-client-info' // initial request to endpoint
	| 'connecting-to-host' // initial connection
	| 'connection-impossible' // if a connection is not possible due to network restrictions
	| 'connected' // waiting for user input, having a connection
	| 'disconnected' // failed after having a connection
	| 'done' // done with sending
	| 'error';

export type FlottformState =
	| 'new'
	| 'waiting-for-client'
	| 'waiting-for-ice'
	| 'waiting-for-data'
	| 'receiving-data'
	| 'done'
	| 'error';

export type Logger = {
	debug: typeof console.debug;
	info: typeof console.info;
	log: typeof console.log;
	warn: typeof console.warn;
	error: typeof console.error;
};

export type FileMetaInfos = {
	data: string;
	lastModified?: number;
	name?: string;
	size: number;
	type?: string;
};

export const POLL_TIME_IN_MS: number = 1000;

export const DEFAULT_WEBRTC_CONFIG: RTCConfiguration = {
	iceServers: [
		{
			urls: ['stun:stun1.l.google.com:19302']
		}
	]
};

export function generateSecretKey(): string {
	return crypto.randomUUID();
}

export async function retrieveEndpointInfo(getEndpointInfoUrl: string) {
	const response = await fetch(getEndpointInfoUrl);
	return (await response.json()) as SafeEndpointInfo;
}

export async function addIceCandidatesToConnection(
	connection: RTCPeerConnection,
	iceCandidates: RTCIceCandidateInit[]
) {
	for (const iceCandidate of iceCandidates) {
		await connection.addIceCandidate(iceCandidate);
	}
}

export function setIncludes<T>(set: Set<T>, x: T): boolean {
	for (const item of set) {
		if (JSON.stringify(item) === JSON.stringify(x)) {
			return true;
		}
	}
	return false;
}

type Listener<T extends Array<any>> = (...args: T) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
export type FlottformEventMap = {
	new: [details: { channel: FlottformChannelHost }];
	'waiting-for-client': [
		details: {
			qrCode: string;
			link: string;
			channel: FlottformChannelHost;
		}
	];
	'waiting-for-data': [];
	'waiting-for-ice': [];
	'receiving-data': [e: MessageEvent];
	'file-received': [{ fileMeta: FileMetaInfos; arrayBuffer: Array<ArrayBuffer> }];
	done: [];
	error: [error: Error];
	connected: [];
	disconnected: [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventEmitter<EventMap extends Record<string, Array<any>>> {
	private eventListeners: { [K in keyof EventMap]?: Set<Listener<EventMap[K]>> } = {};

	on<K extends keyof EventMap>(eventName: K, listener: Listener<EventMap[K]>) {
		const listeners = this.eventListeners[eventName] ?? new Set();
		listeners.add(listener);
		this.eventListeners[eventName] = listeners;
	}

	off<K extends keyof EventMap>(eventName: K, listener: Listener<EventMap[K]>) {
		const listeners = this.eventListeners[eventName];
		if (listeners) {
			listeners.delete(listener);
			if (listeners.size === 0) {
				delete this.eventListeners[eventName];
			}
		}
	}

	emit<K extends keyof EventMap>(eventName: K, ...args: EventMap[K]) {
		const listeners = this.eventListeners[eventName] ?? new Set();
		for (const listener of listeners) {
			listener(...args);
		}
	}
}

export abstract class BaseInputHost<L extends BaseListeners> extends EventEmitter<L> {
	abstract start();
	abstract close();
}
