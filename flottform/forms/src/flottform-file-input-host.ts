import { FlottformBaseFileInputPeer } from './flottform-base-file-input-peer';
import { FlottformChannelHost } from './flottform-channel-host';
import {
	BaseFileInputPeerEvents,
	DEFAULT_WEBRTC_CONFIG,
	Logger,
	POLL_TIME_IN_MS
} from './internal';

type BaseFileInputHostEvents = BaseFileInputPeerEvents & {
	starting: () => void;
	'endpoint-created': ({ link, qrCode }: { link: string; qrCode: string }) => void;
	'webrtc:waiting-for-ice': () => void;
};

export class FlottformFileInputHost extends FlottformBaseFileInputPeer<
	BaseFileInputHostEvents,
	FlottformChannelHost
> {
	private link: string = '';
	private qrCode: string = '';

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
		incomingInputField?: HTMLInputElement;
		outgoingInputField?: HTMLInputElement;
		rtcConfiguration?: RTCConfiguration;
		pollTimeForIceInMs?: number;
		theme?: (myself: FlottformFileInputHost) => void;
		logger?: Logger;
	}) {
		super(logger, incomingInputField, outgoingInputField);
		this.channel = new FlottformChannelHost({
			flottformApi,
			createClientUrl,
			rtcConfiguration,
			pollTimeForIceInMs,
			logger
		});

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
