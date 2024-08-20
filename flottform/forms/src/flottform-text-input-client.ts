import { FlottformChannelClient } from './flottform-channel-client';
import { DEFAULT_WEBRTC_CONFIG, EventEmitter, Logger, POLL_TIME_IN_MS } from './internal';

type Listeners = {
	connected: [];
	'webrtc:connection-impossible': [];
	sending: []; // Emitted to signal the start of sending the file(s)
	done: [];
	disconnected: [];
	error: [e: string];
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
		this.emit('sending');
		this.channel?.sendData(text);
		this.emit('done');
	};

	private registerListeners = () => {
		this.channel?.on('init', () => {});
		this.channel?.on('retrieving-info-from-endpoint', () => {});
		this.channel?.on('sending-client-info', () => {});
		this.channel?.on('connecting-to-host', () => {});
		this.channel?.on('connected', () => {
			this.emit('connected');
		});
		this.channel?.on('connection-impossible', () => {
			this.emit('webrtc:connection-impossible');
		});
		this.channel?.on('done', () => {
			this.emit('done');
		});
		this.channel?.on('disconnected', () => {
			this.emit('disconnected');
		});
		this.channel?.on('error', (e) => {
			this.emit('error', e);
		});
	};
}
