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
