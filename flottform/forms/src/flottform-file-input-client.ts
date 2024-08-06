import { FlottformChannelClient } from './flottform-channel-client';
import {
	DEFAULT_WEBRTC_CONFIG,
	EventEmitter,
	FileMetaInfos,
	Logger,
	POLL_TIME_IN_MS
} from './internal';

type Listeners = {
	connected: [];
	'webrtc:connection-impossible': [];
	sending: []; // Emitted to signal the start of sending the file(s)
	progress: [progress: number]; // Emitted to signal the progress of sending the file(s)
	done: [];
	disconnected: [];
	error: [e: string];
};

export class FlottformFileInputClient extends EventEmitter<Listeners> {
	private channel: FlottformChannelClient | null = null;
	private inputField: HTMLInputElement;
	private chunkSize: number = 16384; // 16 Kb chunks
	private logger: Logger;

	constructor({
		endpointId,
		fileInput,
		flottformApi,
		rtcConfiguration = DEFAULT_WEBRTC_CONFIG,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		endpointId: string;
		fileInput: HTMLInputElement;
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
		this.inputField = fileInput;
		this.logger = logger;
		this.registerListeners();
	}
	start = () => {
		this.channel?.start();
	};

	close = () => {
		this.channel?.close();
	};

	sendFile = async () => {
		const { fileMeta, arrayBuffer } = await this.serializeData(this.inputField);
		this.emit('sending');

		// Send file metadata
		this.channel?.sendData(JSON.stringify(fileMeta));

		// Send file in chunks
		for (let i = 0; i * this.chunkSize <= arrayBuffer.byteLength; i++) {
			let progress = ((i * this.chunkSize) / arrayBuffer.byteLength).toFixed(2);
			this.emit('progress', parseFloat(progress));
			const end = (i + 1) * this.chunkSize;
			this.channel?.sendData(arrayBuffer.slice(i * this.chunkSize, end));
		}

		// Send end-of-file marker
		this.channel?.sendData(JSON.stringify({ data: 'eof' }));

		this.logger.log(`File sent: ${fileMeta.name}`);
	};

	private serializeData = async (
		fileInput: HTMLInputElement
	): Promise<{
		fileMeta: FileMetaInfos;
		arrayBuffer: ArrayBuffer;
	}> => {
		this.logger.log(fileInput.value);
		const file = fileInput.files?.item(0);
		if (!file) {
			const arrayBuffer = new TextEncoder().encode(fileInput.value);
			const fileMeta = {
				data: 'input:text',
				size: arrayBuffer.byteLength
			};
			return { arrayBuffer, fileMeta };
		}
		const arrayBuffer = await file.arrayBuffer();
		if (!arrayBuffer) {
			this.logger.log('no array buffer');
			throw Error('no array buffer in file input element');
		}
		const fileMeta = {
			data: 'input:file',
			lastModified: file.lastModified,
			name: file.name,
			type: file.type,
			size: file.size
		};
		return { fileMeta, arrayBuffer };
	};

	private registerListeners = () => {
		this.channel?.on('init', () => {
			// TODO: Implement Default UI.
		});
		this.channel?.on('retrieving-info-from-endpoint', () => {
			// TODO: Implement Default UI.
		});
		this.channel?.on('sending-client-info', () => {
			// TODO: Implement Default UI.
		});
		this.channel?.on('connecting-to-host', () => {
			// TODO: Implement Default UI.
		});
		this.channel?.on('connected', () => {
			this.emit('connected');
			// TODO: Implement Default UI.
		});
		this.channel?.on('connection-impossible', () => {
			this.emit('webrtc:connection-impossible');
			// TODO: Implement Default UI.
		});
		this.channel?.on('done', () => {
			this.emit('done');
			// TODO: Implement Default UI.
		});
		this.channel?.on('disconnected', () => {
			this.emit('disconnected');
			// TODO: Implement Default UI.
		});
		this.channel?.on('error', (e) => {
			this.emit('error', e);
			// TODO: Implement Default UI.
		});
	};
}
