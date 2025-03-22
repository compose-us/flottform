import { EventEmitter, Logger, FlottformChannelPeerEvents } from './internal';

export abstract class FlottformChannelPeer<
	EventMap extends FlottformChannelPeerEvents
> extends EventEmitter<EventMap> {
	protected dataChannel: RTCDataChannel | null = null;
	protected flottformApi: string | URL;
	protected rtcConfiguration: RTCConfiguration;
	protected pollTimeForIceInMs: number;
	protected openPeerConnection: RTCPeerConnection | null = null;
	protected pollForIceTimer: NodeJS.Timeout | number | null = null;
	protected BUFFER_THRESHOLD = 128 * 1024; // 128KB buffer threshold (maximum of 4 chunks in the buffer waiting to be sent over the network)
	protected logger: Logger;

	constructor(
		logger: Logger,
		flottformApi: string | URL,
		rtcConfiguration: RTCConfiguration,
		pollTimeForIceInMs: number
	) {
		super();
		this.logger = logger;
		this.flottformApi = flottformApi;
		this.rtcConfiguration = rtcConfiguration;
		this.pollTimeForIceInMs = pollTimeForIceInMs;
	}

	abstract start();

	abstract close();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	sendData = (data: any) => {
		if (!this.dataChannel) {
			throw new Error('dataChannel is not defined. Unable to send the file to the other Peer!');
			return;
		} else if (!this.canSendMoreData()) {
			this.logger.warn('Data channel is full! Cannot send data at the moment');
			return;
		}
		this.dataChannel.send(data);
	};

	canSendMoreData = () => {
		return (
			this.dataChannel &&
			this.dataChannel.bufferedAmount < this.dataChannel.bufferedAmountLowThreshold
		);
	};

	protected fetchIceServers = async (baseApi: string) => {
		// TOOD remove after testing
		await new Promise((r) => setTimeout(r, 2000));

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
}
