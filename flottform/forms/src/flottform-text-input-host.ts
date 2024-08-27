import { FlottformChannelHost } from './flottform-channel-host';
import { Styles } from './flottform-styles';
import { DEFAULT_WEBRTC_CONFIG, EventEmitter, Logger, POLL_TIME_IN_MS } from './internal';

type Listeners = {
	new: [];
	disconnected: [];
	error: [error: any];
	connected: [];
	receive: []; // Emitted to signal the start of receiving the file(s)
	done: [data: string];
	'endpoint-created': [{ link: string; qrCode: string }];
	'webrtc:waiting-for-client': [
		event: { link: string; qrCode: string; channel: FlottformChannelHost }
	];
	'webrtc:waiting-for-ice': [];
	'webrtc:waiting-for-data': [];
};

const noop = () => {};

export class FlottformTextInputHost extends EventEmitter<Listeners> {
	private channel: FlottformChannelHost | null = null;
	private logger: Logger;
	private link: string = '';
	private qrCode: string = '';

	constructor({
		flottformApi,
		createClientUrl,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		theme,
		logger = console
	}: {
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		rtcConfiguration?: RTCConfiguration;
		pollTimeForIceInMs?: number;
		theme?: (myself: FlottformTextInputHost) => void;
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
		theme && theme(this);
	}

	start = () => {
		this.channel?.start();
	};

	close = () => {
		this.channel?.close();
	};

	getLink = () => {
		if (this.link === '') {
			this.logger.error(
				'Flottform is currently establishing the connection. Link is unavailable for now!'
			);
		}
		return this.link;
	};

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
