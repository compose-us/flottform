import { FlottformBaseFileInputPeer } from './flottform-base-file-input-peer';
import { FlottformChannelClient } from './flottform-channel-client';
import {
	BaseFileInputPeerEvents,
	DEFAULT_WEBRTC_CONFIG,
	Logger,
	POLL_TIME_IN_MS
} from './internal';

export class FlottformFileInputClient extends FlottformBaseFileInputPeer<
	BaseFileInputPeerEvents,
	FlottformChannelClient
> {
	constructor({
		endpointId,
		outgoingInputField,
		incomingInputField,
		flottformApi,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		endpointId: string;
		outgoingInputField?: HTMLInputElement;
		incomingInputField?: HTMLInputElement;
		flottformApi: string;
		rtcConfiguration?: RTCConfiguration;
		pollTimeForIceInMs?: number;
		logger?: Logger;
	}) {
		super(logger, incomingInputField, outgoingInputField);
		this.channel = new FlottformChannelClient({
			endpointId,
			flottformApi,
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

	private registerListeners = () => {
		this.channel?.on('retrieving-host-info', () => {});
		this.channel?.on('sending-client-info', () => {});
		this.channel?.on('connecting-to-host', () => {});
		this.channel?.on('connected', () => {
			this.emit('connected');
		});
		this.channel?.on('receiving-data', (e) => {
			//Handle file(s) reception
			this.handleIncomingData(e);
		});
		this.channel?.on('disconnected', () => {
			this.emit('disconnected');
		});
		this.channel?.on('error', (e) => {
			this.emit('error', e);
		});
		this.channel?.on('bufferedamountlow', this.startSendingFiles);
	};
}
