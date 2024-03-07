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
export type SafeEndpointInfo = Omit<EndpointInfo, 'hostKey' | 'clientKey'>;

export type ClientState = 'loading' | 'waiting-for-file' | 'sending-file' | 'done' | 'error';

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
