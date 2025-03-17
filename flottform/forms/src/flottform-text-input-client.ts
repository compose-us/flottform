import { FlottformChannelClient } from './flottform-channel-client';
import { DEFAULT_WEBRTC_CONFIG, EventEmitter, Logger, POLL_TIME_IN_MS } from './internal';

type Listeners = {
	init: () => void;
	connected: () => void;
	'webrtc:connection-impossible': () => void;
	'text-transferred': (text: string) => void; // Emitted to signal the transfer of one text TO the Host.
	'text-received': (text: string) => void; // Emitted to signal the reception of one text FROM the Host.
	disconnected: () => void;
	error: (e: string) => void;
};

export class FlottformTextInputClient extends EventEmitter<Listeners> {
	private channel: FlottformChannelClient | null = null;
	private logger: Logger;

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
		this.channel = new FlottformChannelClient({
			endpointId,
			flottformApi,
			rtcConfiguration,
			pollTimeForIceInMs,
			logger
		});
		this.logger = logger;
		this.registerListeners();
	}
	start = () => {
		this.channel?.start();
	};

	close = () => {
		// Should be called once all the text has been sent.
		this.channel?.close();
	};

	sendText = (text: string) => {
		// For now, I didn't handle very large texts since for most use cases the text won't exceed the size of 1 chunk ( 16KB )
		this.channel?.sendData(text);
		this.emit('text-transferred', text);
	};

	private handleIncomingData = (e: MessageEvent) => {
		// We suppose that the data received is small enough to be all included in 1 message
		this.emit('text-received', e.data);
	};

	private registerListeners = () => {
		this.channel?.on('init', () => {
			this.emit('init');
		});
		this.channel?.on('retrieving-info-from-endpoint', () => {});
		this.channel?.on('sending-client-info', () => {});
		this.channel?.on('connecting-to-host', () => {});
		this.channel?.on('connected', () => {
			this.emit('connected');
		});
		this.channel?.on('connection-impossible', () => {
			this.emit('webrtc:connection-impossible');
		});
		this.channel?.on('receiving-data', (e) => {
			this.handleIncomingData(e);
		});
		this.channel?.on('done', () => {
			//this.emit('done');
		});
		this.channel?.on('disconnected', () => {
			this.emit('disconnected');
		});
		this.channel?.on('error', (e) => {
			this.emit('error', e);
		});
	};
}
