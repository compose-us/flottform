import { FlottformChannelHost } from './flottform-channel-host';

type EndpointId = string;
export type SafeEndpointInfo = {
	endpointId: EndpointId;
	hostInfo: string;
	clientInfo?: string;
};

export type FlottformChannelPeerEvents = {
	starting: () => void;
	connected: () => void;
	'receiving-data': (event: MessageEvent) => void;
	bufferedamountlow: () => void;
	disconnected: () => void;
	error: (event: Error) => void;
};
export type FlottformChannelClientEvents = FlottformChannelPeerEvents & {
	'retrieving-host-info': () => void;
	'sending-client-info': () => void;
	'connecting-to-host': () => void;
};
export type FlottformChannelHostEvents = FlottformChannelPeerEvents & {
	'endpoint-created': (event: {
		qrCode: string;
		link: string;
		channel: FlottformChannelHost;
	}) => void;
	'waiting-for-ice': () => void;
	'waiting-for-data': () => void;
};

export type ChannelClientState = keyof FlottformChannelClientEvents;
export type ChannelHostState = keyof FlottformChannelHostEvents;

export type BaseInputHostEvents = {
	starting: () => void;
	'endpoint-created': ({ link, qrCode }: { link: string; qrCode: string }) => void;
	disconnected: () => void;
	error: (event: Error) => void;
	connected: () => void;
	'webrtc:waiting-for-ice': () => void;
	'webrtc:waiting-for-data': () => void;
};

export type BaseFileInputPeerEvents = {
	connected: () => void;
	'file-receiving-progress': (event: {
		fileIndex: number;
		totalFileCount: number;
		fileName: string;
		currentFileProgress: number;
		overallProgress: number;
	}) => void;
	'single-file-received': (event: File) => void;
	'file-sending-progress': (event: {
		fileIndex: number;
		totalFileCount: number;
		fileName: string;
		currentFileProgress: number;
	}) => void;
	'single-file-transfered': (event: { name: string; type: string; size: number }) => void;
	error: (event: Error) => void;
	disconnected: () => void;
};

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventEmitter<EventMap extends Record<string, (...args: any[]) => any>> {
	private eventListeners: { [K in keyof EventMap]?: Set<EventMap[K]> } = {};

	on<K extends keyof EventMap>(eventName: K, listener: EventMap[K]) {
		const listeners = this.eventListeners[eventName] ?? new Set();
		listeners.add(listener);
		this.eventListeners[eventName] = listeners;
	}

	off<K extends keyof EventMap>(eventName: K, listener: EventMap[K]) {
		const listeners = this.eventListeners[eventName];
		if (listeners) {
			listeners.delete(listener);
			if (listeners.size === 0) {
				delete this.eventListeners[eventName];
			}
		}
	}

	emit<K extends keyof EventMap>(eventName: K, args?: Parameters<EventMap[K]>[0]) {
		const listeners = this.eventListeners[eventName] ?? new Set();
		for (const listener of listeners) {
			listener(args);
		}
	}
}

export abstract class BaseInputHost<L extends BaseInputHostEvents> extends EventEmitter<L> {
	abstract start();
	abstract close();
}
