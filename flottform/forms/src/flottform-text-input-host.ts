import { FlottformChannelHost } from './flottform-channel-host';
import {
	BaseInputHost,
	BaseListeners,
	DEFAULT_WEBRTC_CONFIG,
	Logger,
	POLL_TIME_IN_MS
} from './internal';

type Listeners = BaseListeners & {
	done: [data: string];
	'webrtc:waiting-for-text': [];
	receive: [];
	'webrtc:waiting-for-data': [];
};
// @ts-ignore: Unused variable
const noop = () => {};

export class FlottformTextInputHost extends BaseInputHost<Listeners> {
	private channel: FlottformChannelHost | null = null;
	private logger: Logger;
	private link: string = '';
	private qrCode: string = '';

	/**
	 * Creates an instance of FlottformTextInputHost.
	 *
	 * @param {Object} config - The configuration for setting up the text input host.
	 * @param {string | URL} config.flottformApi - The API URL for retrieving connection information.
	 * @param {Function} config.createClientUrl - A function to create the client URL with an endpoint ID.
	 * @param {RTCConfiguration} [config.rtcConfiguration=DEFAULT_WEBRTC_CONFIG] - WebRTC configuration settings.
	 * @param {number} [config.pollTimeForIceInMs=POLL_TIME_IN_MS] - The polling time for ICE candidates in milliseconds.
	 * @param {Logger} [config.logger=console] - Logger for capturing logs and errors.
	 */
	constructor({
		flottformApi,
		createClientUrl,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		rtcConfiguration?: RTCConfiguration;
		pollTimeForIceInMs?: number;
		logger?: Logger;
	}) {
		super();
		this.channel = new FlottformChannelHost({
			flottformApi,
			createClientUrl,
			rtcConfiguration,
			pollTimeForIceInMs,
			logger
		});
		this.logger = logger;

		this.registerListeners();
	}

	/**
	 * Starts the WebRTC connection by invoking the `start` method of the underlying `FlottformChannelHost`.
	 */
	start = () => {
		this.channel?.start();
	};

	/**
	 * Closes the WebRTC connection by invoking the `close` method of the underlying `FlottformChannelHost`.
	 */
	close = () => {
		this.channel?.close();
	};

	/**
	 * Retrieves the link (URL) for the client to connect to the WebRTC host.
	 *
	 * @returns {string} The link for the client to connect. If the link is unavailable, an error is logged.
	 */
	getLink = () => {
		if (this.link === '') {
			this.logger.error(
				'Flottform is currently establishing the connection. Link is unavailable for now!'
			);
		}
		return this.link;
	};

	/**
	 * Retrieves the QR code data for the client to scan and connect to the WebRTC host.
	 *
	 * @returns {string} The QR code data for client connection. If the QR code is unavailable, an error is logged.
	 */
	getQrCode = () => {
		if (this.qrCode === '') {
			this.logger.error(
				'Flottform is currently establishing the connection. qrCode is unavailable for now!'
			);
		}
		return this.qrCode;
	};

	private handleIncomingData = (e: MessageEvent<any>) => {
		this.emit('receive');
		// We suppose that the data received is small enough to be all included in 1 message
		this.emit('done', e.data);
	};

	private registerListeners = () => {
		// @ts-ignore: Unused variable
		this.channel?.on('new', ({ channel }) => {
			this.emit('new');
		});
		this.channel?.on('waiting-for-client', (event) => {
			this.emit('webrtc:waiting-for-client', event);
			const { qrCode, link } = event;
			this.emit('endpoint-created', { link, qrCode });
			this.link = link;
			this.qrCode = qrCode;
		});
		this.channel?.on('waiting-for-ice', () => {
			this.emit('webrtc:waiting-for-ice');
		});
		this.channel?.on('waiting-for-data', () => {
			this.emit('webrtc:waiting-for-data');
			this.emit('connected');
		});
		this.channel?.on('receiving-data', (e) => {
			this.handleIncomingData(e);
		});
		this.channel?.on('disconnected', () => {
			this.emit('disconnected');
		});
		this.channel?.on('error', (error) => {
			this.emit('error', error);
		});
	};
}
