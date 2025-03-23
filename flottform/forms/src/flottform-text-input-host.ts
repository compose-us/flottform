import { FlottformChannelHost } from './flottform-channel-host';
import {
	BaseInputHost,
	BaseInputHostEvents,
	DEFAULT_WEBRTC_CONFIG,
	Logger,
	POLL_TIME_IN_MS
} from './internal';

type Listeners = BaseInputHostEvents & {
	'text-transferred': (text: string) => void; // Emitted to signal the transfer of one text TO the Client.
	'text-received': (text: string) => void; // Emitted to signal the reception of one text FROM the Client.
};

export class FlottformTextInputHost extends BaseInputHost<Listeners> {
	private channel: FlottformChannelHost | null = null;
	private logger: Logger;
	private link: string = '';
	private qrCode: string = '';
	private incomingInputField: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;
	private outgoingInputField: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;

	constructor({
		flottformApi,
		createClientUrl,
		incomingInputField,
		outgoingInputField,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		inputField?: HTMLInputElement | HTMLTextAreaElement;
		incomingInputField?: HTMLInputElement | HTMLTextAreaElement;
		outgoingInputField?: HTMLInputElement | HTMLTextAreaElement;
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
		this.incomingInputField = incomingInputField;
		this.outgoingInputField = outgoingInputField;

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

	sendText = (text?: string) => {
		// For now, I didn't handle very large texts since for most use cases the text won't exceed the size of 1 chunk ( 16KB )
		if (!text) {
			// Get the Text to send from the input field.
			if (this.outgoingInputField && this.outgoingInputField.value) {
				this.channel?.sendData(this.outgoingInputField.value);
				this.emit('text-transferred', this.outgoingInputField.value);
				this.outgoingInputField.value = '';
			} else {
				this.logger.error(
					'You have to provide a string parameter to send, or you have to fill the outgoingInputField with a value!'
				);
			}
		} else {
			this.channel?.sendData(text);
			this.emit('text-transferred', text);
		}
	};

	private handleIncomingData = (e: MessageEvent) => {
		// We suppose that the data received is small enough to be all included in 1 message
		this.emit('text-received', e.data);
		if (this.incomingInputField) {
			this.incomingInputField.value = e.data;
			const event = new Event('change');
			this.incomingInputField.dispatchEvent(event);
		}
	};

	private registerListeners = () => {
		this.channel?.on('starting', () => {
			this.emit('starting');
		});
		this.channel?.on('endpoint-created', (event) => {
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
