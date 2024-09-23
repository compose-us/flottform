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

/**
 * The `FlottformTextInputClient` uses the `FlottformChannelClient` to establish a WebRTC connection and send text data to a peer.
 * It listens to various events emitted by `FlottformChannelClient` to manage connection states and the sending process.
 *
 * @extends EventEmitter<Listeners>
 */
export class FlottformTextInputClient extends EventEmitter<Listeners> {
	private channel: FlottformChannelClient | null = null;
	// @ts-ignore: Unused variable
	private logger: Logger;

	/**
	 * Creates an instance of FlottformTextInputClient.
	 *
	 * @param {Object} config - The configuration for setting up the text input client.
	 * @param {string} config.endpointId - The unique ID for the WebRTC endpoint.
	 * @param {string} config.flottformApi - The API URL for retrieving connection information.
	 * @param {RTCConfiguration} [config.rtcConfiguration=DEFAULT_WEBRTC_CONFIG] - WebRTC configuration settings.
	 * @param {number} [config.pollTimeForIceInMs=POLL_TIME_IN_MS] - The polling time for ICE candidates in milliseconds.
	 * @param {Logger} [config.logger=console] - Logger for capturing logs and errors.
	 */
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

	/**
	 * Starts the WebRTC connection by invoking the `start` method of the underlying `FlottformChannelClient`.
	 */
	start = () => {
		this.channel?.start();
	};

	/**
	 * Closes the WebRTC connection by invoking the `close` method of the underlying `FlottformChannelClient`.
	 */
	close = () => {
		// Should be called once all the text has been sent.
		this.channel?.close();
	};

	/**
	 * Sends the provided text over the WebRTC connection.
	 * The text is sent as a single chunk since most texts will not exceed 16 KB in size.
	 *
	 * @param {string} text - The text data to be sent.
	 * @emits sending - Emitted when the text starts to be sent.
	 * @emits done - Emitted when the text sending process is completed.
	 */
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
