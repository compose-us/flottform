import { FlottformChannelClient } from './flottform-channel-client';
import { EventEmitter, Logger, POLL_TIME_IN_MS } from './internal';

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

/**
 * The `FlottformFileInputClient` uses the `FlottformChannelClient` to manage the WebRTC connection and handle the transfer of large files to a peer.
 * It listens to various events emitted by `FlottformChannelClient` to implement the file sending process.
 *
 * @fires connected - Emitted when the connection is successfully established.
 * @fires webrtc:connection-impossible - Emitted if the connection to the host cannot be established.
 * @fires done - Emitted when the all of the data is sent.
 * @fires disconnected - Emitted when the connection is closed.
 * @fires error - Emitted when there is an error during the connection.
 *
 * @extends EventEmitter<Listeners>
 */
export class FlottformFileInputClient extends EventEmitter<Listeners> {
	private channel: FlottformChannelClient | null = null;
	private inputField: HTMLInputElement;
	private chunkSize: number = 16384; // 16 KB chunks
	private filesMetaData: { name: string; type: string; size: number }[] = [];
	private filesArrayBuffer: ArrayBuffer[] = [];
	private currentFileIndex = 0;
	private currentChunkIndex = 0;
	private allFilesSent = false;
	// @ts-ignore: Unused variable
	private logger: Logger;

	/**
	 * Creates an instance of FlottformFileInputClient.
	 *
	 * @param {Object} config - The configuration for setting up the file input client.
	 * @param {string} - The unique ID for the WebRTC endpoint.
	 * @param {HTMLInputElement} - The input field element where files are selected for transfer.
	 * @param {string} - The API URL for retrieving connection information.
	 * @param {RTCConfiguration} [config.rtcConfiguration=DEFAULT_WEBRTC_CONFIG] - WebRTC configuration settings.
	 * @param {number} [config.pollTimeForIceInMs=POLL_TIME_IN_MS] - The polling time for ICE candidates in milliseconds.
	 * @param {Logger} [config.logger=console] - Logger for capturing logs and errors.
	 */
	constructor({
		endpointId,
		fileInput,
		flottformApi,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		endpointId: string;
		fileInput: HTMLInputElement;
		flottformApi: string;
		pollTimeForIceInMs?: number;
		logger?: Logger;
	}) {
		super();
		this.channel = new FlottformChannelClient({
			endpointId,
			flottformApi,
			pollTimeForIceInMs,
			logger
		});
		this.inputField = fileInput;
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

	/**
	 * Starts the process of sending files over the WebRTC connection.
	 * This method prepares the files, creates metadata, and begins the file transfer.
	 *
	 * @throws Will throw an error if the metadata or file data is unavailable.
	 */
	sendFiles = async () => {
		const metaData = this.createMetaData(this.inputField);
		const filesArrayBuffer = await this.createArrayBuffers(this.inputField);
		if (!metaData || !filesArrayBuffer)
			throw new Error("Can't find the files that you want to send!");

		this.filesMetaData = metaData.filesQueue;
		this.filesArrayBuffer = filesArrayBuffer;

		this.channel?.sendData(JSON.stringify(metaData));

		this.emit('sending');
		this.startSendingFiles();
	};

	private startSendingFiles = () => {
		this.sendNextChunk();
	};

	private sendNextChunk = async () => {
		const totalNumberOfFiles = this.filesMetaData.length;
		if (this.allFilesSent || this.currentFileIndex >= totalNumberOfFiles) {
			// All files are sent
			this.logger.log('All files are sent');
			this.channel?.sendData(JSON.stringify({ type: 'transfer-complete' }));
			this.allFilesSent = true;
			this.channel?.off('bufferedamountlow', this.startSendingFiles);
			this.emit('done');
			return;
		}
		const currentFileArrayBuffer = this.filesArrayBuffer[this.currentFileIndex];
		if (!currentFileArrayBuffer) {
			throw new Error(`Can't find the ArrayBuffer for the file number ${this.currentFileIndex}`);
		}
		const currentFileSize = currentFileArrayBuffer.byteLength;
		const fileName = this.filesMetaData[this.currentFileIndex]!.name;

		while (this.currentChunkIndex * this.chunkSize < currentFileSize) {
			// The file still has some chunks left
			if (!this.channel?.canSendMoreData()) {
				// Buffer is full. Pause sending the chunks
				this.logger.log('Buffer is full. Pausing sending chunks!');
				break;
			}
			const progress = ((this.currentChunkIndex * this.chunkSize) / currentFileSize).toFixed(2);

			this.emit('progress', {
				fileIndex: this.currentFileIndex,
				fileName,
				progress: parseFloat(progress)
			});

			const start = this.currentChunkIndex * this.chunkSize;
			const end = Math.min((this.currentChunkIndex + 1) * this.chunkSize, currentFileSize);
			this.channel?.sendData(currentFileArrayBuffer.slice(start, end));
			this.currentChunkIndex++;
		}
		// Now either: the buffer is full OR all the chunks of the file have been sent.
		if (this.currentChunkIndex * this.chunkSize >= currentFileSize) {
			// File is fully sent move to the next one
			this.logger.log(`File ${fileName} fully sent. Moving to next file.`);
			this.currentFileIndex++;
			this.currentChunkIndex = 0;
			this.sendNextChunk(); // Recursion used to send the chunks of the next file
		} else {
			// Paused waiting for buffer space. Will try again shortly.
			setTimeout(this.sendNextChunk, 100); // Retry after a short delay
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
		this.channel?.on('bufferedamountlow', this.startSendingFiles);
	};
}
