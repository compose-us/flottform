import { FlottformChannelClient } from './flottform-channel-client';
import { DEFAULT_WEBRTC_CONFIG, EventEmitter, Logger, POLL_TIME_IN_MS } from './internal';

type FileInputClientEvents = {
	starting: () => void;
	connected: () => void;
	'text-transferred': (text: string) => void; // Emitted to signal the transfer of one text TO the Host.
	'text-received': (text: string) => void; // Emitted to signal the reception of one text FROM the Host.
	disconnected: () => void;
	error: (e: Error) => void;
};

export class FlottformTextInputClient extends EventEmitter<FileInputClientEvents> {
	private channel: FlottformChannelClient | null = null;
	private incomingInputField: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;
	private outgoingInputField: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;
	private logger: Logger;

	constructor({
		endpointId,
		flottformApi,
		incomingInputField,
		outgoingInputField,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		endpointId: string;
		flottformApi: string;
		incomingInputField?: HTMLInputElement | HTMLTextAreaElement;
		outgoingInputField?: HTMLInputElement | HTMLTextAreaElement;
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
		this.incomingInputField = incomingInputField;
		this.outgoingInputField = outgoingInputField;
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
		this.channel?.on('sending-client-info', () => {});
		this.channel?.on('connecting-to-host', () => {});
		this.channel?.on('connected', () => {
			this.emit('connected');
		});
		this.channel?.on('receiving-data', (e) => {
			this.handleIncomingData(e);
		});
		this.channel?.on('disconnected', () => {
			this.emit('disconnected');
		});
		this.channel?.on('error', (e) => {
			this.emit('error', e);
		});
	};
}
