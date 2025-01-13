import { FlottformChannelHost } from './flottform-channel-host';
import { BaseInputHost, BaseListeners, Logger, POLL_TIME_IN_MS } from './internal';

type Listeners = BaseListeners & {
	'text-transfered': [text: string]; // Emitted to signal the transfer of one text TO the Client.
	'text-received': [text: string]; // Emitted to signal the reception of one text FROM the Client.
	'webrtc:waiting-for-text': [];
	'webrtc:waiting-for-data': [];
};

export class FlottformTextInputHost extends BaseInputHost<Listeners> {
	private channel: FlottformChannelHost | null = null;
	private logger: Logger;
	private link: string = '';
	private qrCode: string = '';
	private inputField: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;

	constructor({
		flottformApi,
		createClientUrl,
		inputField = undefined,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		inputField?: HTMLInputElement | HTMLTextAreaElement;
		pollTimeForIceInMs?: number;
		logger?: Logger;
	}) {
		super();
		this.channel = new FlottformChannelHost({
			flottformApi,
			createClientUrl,
			pollTimeForIceInMs,
			logger
		});
		this.logger = logger;
		this.inputField = inputField;

		this.registerListeners();
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

	sendText = (text: string) => {
		// For now, I didn't handle very large texts since for most use cases the text won't exceed the size of 1 chunk ( 16KB )
		this.channel?.sendData(text);
		this.emit('text-transfered', text);
	};

	private handleIncomingData = (e: MessageEvent) => {
		// We suppose that the data received is small enough to be all included in 1 message
		this.emit('text-received', e.data);
		if (this.inputField) {
			this.inputField.value = e.data;
			const event = new Event('change');
			this.inputField.dispatchEvent(event);
		}
	};

	private registerListeners = () => {
		this.channel?.on('new', () => {
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
