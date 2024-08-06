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
	progress: [{ fileIndex: number; fileName: string; progress: number }]; // Emitted to signal the progress of sending the file(s)
	done: [];
	disconnected: [];
	error: [e: string];
};

type MetaData = {
	type: 'file-transfer-meta';
	filesQueue: { name: string; type: string; size: number }[];
	totalSize: number;
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

	private createMetaData = (inputElement: HTMLInputElement): MetaData | null => {
		if (!inputElement.files) return null;

		// Generate all the metadata necessary to send all of the files
		const files = Array.from(inputElement.files);
		const filesQueue = files.map((file) => ({
			name: file.name,
			type: file.type, // We're dividing each file into chuncks no matter what the type of the file.
			size: file.size
		}));
		return {
			type: 'file-transfer-meta',
			filesQueue,
			totalSize: filesQueue.reduce((sum, file) => sum + file.size, 0)
		};
	};

	private createArrayBuffers = async (inputElement: HTMLInputElement) => {
		if (!inputElement.files) return null;

		// Generate all the arrayBuffers of the available files
		const files = Array.from(inputElement.files);
		return await Promise.all(files.map(async (file) => await file.arrayBuffer()));
	};

	sendFiles = async () => {
		const metaData = this.createMetaData(this.inputField);
		const filesArrayBuffer = await this.createArrayBuffers(this.inputField);

		if (!metaData || !filesArrayBuffer)
			throw new Error("Can't find the files that you want to send!");

		this.channel?.sendData(JSON.stringify(metaData));

		this.emit('sending');

		for (let i = 0; i < metaData.filesQueue.length; i++) {
			await this.sendFile(
				i,
				metaData.filesQueue[i]?.name as string,
				filesArrayBuffer[i] as ArrayBuffer
			);
		}
		this.channel?.sendData(JSON.stringify({ type: 'transfer-complete' }));
	};

	private sendFile = async (fileIndex: number, fileName: string, fileArrayBuffer: ArrayBuffer) => {
		this.logger.log(`Sending data for file number ${fileIndex + 1}`);

		// Send file in chunks
		for (let i = 0; i * this.chunkSize <= fileArrayBuffer.byteLength; i++) {
			// The progress for now is sent for each file seperately
			let progress = ((i * this.chunkSize) / fileArrayBuffer.byteLength).toFixed(2);
			this.emit('progress', { fileIndex, fileName, progress: parseFloat(progress) });

			const end = (i + 1) * this.chunkSize;
			this.channel?.sendData(fileArrayBuffer.slice(i * this.chunkSize, end));
		}
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
