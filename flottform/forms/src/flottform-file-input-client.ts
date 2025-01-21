import { FlottformChannelClient } from './flottform-channel-client';
import { EventEmitter, Logger, POLL_TIME_IN_MS } from './internal';

type Listeners = {
	init: [];
	connected: [];
	'webrtc:connection-impossible': [];
	'file-sending-progress': [{ fileIndex: number; fileName: string; progress: number }];
	'single-file-transfered': [{ name: string; type: string; size: number }];
	'file-receiving-progress': {
		fileIndex: number;
		totalFileCount: number;
		fileName: string;
		currentFileProgress: number;
		overallProgress: number;
	}[];
	'single-file-received': [file: File];
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
	private outgoingInputField: HTMLInputElement; // Contains files to send to the other peer.
	private incomingInputField: HTMLInputElement | null; // Contains files received from the other peer.
	private chunkSize: number = 16384; // 16 KB chunks
	private filesMetaData: { name: string; type: string; size: number }[] = [];
	private filesArrayBuffer: ArrayBuffer[] = [];
	private currentFileIndex = 0;
	private currentChunkIndex = 0;
	private allFilesSent = false;
	private logger: Logger;
	private filesTotalSize: number = 0;
	private receivedDataSize: number = 0;
	private currentFile: {
		index: number;
		receivedSize: number;
		arrayBuffer: ArrayBuffer[];
	} | null = null;

	constructor({
		endpointId,
		outgoingInputField,
		incomingInputField,
		flottformApi,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		endpointId: string;
		outgoingInputField: HTMLInputElement;
		incomingInputField: HTMLInputElement;
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
		this.outgoingInputField = outgoingInputField;
		this.incomingInputField = incomingInputField;
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
		const metaData = this.createMetaData(this.outgoingInputField);
		const filesArrayBuffer = await this.createArrayBuffers(this.outgoingInputField);
		if (!metaData || !filesArrayBuffer)
			throw new Error("Can't find the files that you want to send!");

		this.filesMetaData = metaData.filesQueue;
		this.filesArrayBuffer = filesArrayBuffer;

		this.channel?.sendData(JSON.stringify(metaData));

		this.startSendingFiles();
	};

	private startSendingFiles = () => {
		this.sendNextChunk();
	};

	private sendNextChunk = async () => {
		const totalNumberOfFiles = this.filesMetaData.length;
		if (this.allFilesSent || this.currentFileIndex >= totalNumberOfFiles) {
			this.logger.log('All files are sent');
			this.channel?.sendData(JSON.stringify({ type: 'files-batch-transfer-complete' }));
			//this.allFilesSent = true;
			//this.channel?.off('bufferedamountlow', this.startSendingFiles);
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

			this.emit('file-sending-progress', {
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
			const fileTransferedMetaData = this.filesMetaData[this.currentFileIndex];
			this.emit('single-file-transfered', fileTransferedMetaData!);
			this.currentFileIndex++;
			this.currentChunkIndex = 0;
			this.sendNextChunk(); // Recursion used to send the chunks of the next file
		} else {
			// Paused waiting for buffer space. Will try again shortly.
			setTimeout(this.sendNextChunk, 100); // Retry after a short delay
		}
	};

	private handleIncomingData = (e: MessageEvent) => {
		if (typeof e.data === 'string') {
			// string can be either metadata or end transfer marker.
			const message = JSON.parse(e.data);
			if (message.type === 'file-transfer-meta') {
				// Handle file metadata
				this.filesMetaData = message.filesQueue;
				this.currentFile = { index: 0, receivedSize: 0, arrayBuffer: [] };
				this.filesTotalSize = message.totalSize;
			} else if (message.type === 'files-batch-transfer-complete') {
				this.logger.log('Current batch of files received successfully!');
				//this.channel?.close();
			}
		} else if (e.data instanceof ArrayBuffer) {
			// Handle file chunk
			if (this.currentFile) {
				this.currentFile.arrayBuffer.push(e.data);
				this.currentFile.receivedSize += e.data.byteLength;
				this.receivedDataSize += e.data.byteLength;

				const currentFileName = this.filesMetaData[this.currentFile.index]?.name as string;

				const currentFileTotalSize = this.filesMetaData[this.currentFile.index]?.size as number;

				const currentFileProgress = (this.currentFile.receivedSize / currentFileTotalSize).toFixed(
					2
				);
				const overallProgress = (this.receivedDataSize / this.filesTotalSize).toFixed(2);

				this.emit('file-receiving-progress', {
					fileIndex: this.currentFile.index,
					totalFileCount: this.filesMetaData.length,
					fileName: currentFileName,
					currentFileProgress: parseFloat(currentFileProgress),
					overallProgress: parseFloat(overallProgress)
				});

				if (this.currentFile.receivedSize === currentFileTotalSize) {
					// Attach the current file to the given input field
					this.appendFileToInputField(this.currentFile.index);
					// Initialize the values of currentFile to receive the next file
					this.currentFile = {
						index: this.currentFile.index + 1,
						receivedSize: 0,
						arrayBuffer: []
					};
				}
			}
		}
	};

	private appendFileToInputField = (fileIndex: number) => {
		const fileName = this.filesMetaData[fileIndex]?.name ?? 'no-name';
		const fileType = this.filesMetaData[fileIndex]?.type ?? 'application/octet-stream';

		const receivedFile = new File(this.currentFile?.arrayBuffer as ArrayBuffer[], fileName, {
			type: fileType
		});
		this.emit('single-file-received', receivedFile);

		if (!this.incomingInputField) {
			this.logger.warn(
				"No input field provided!! You can listen to the 'single-file-transferred' event to handle the newly received file!"
			);
			return;
		}

		const dt = new DataTransfer();

		// Add existing files from the input field to the DataTransfer object to avoid loosing them.
		if (this.incomingInputField.files) {
			for (const file of Array.from(this.incomingInputField.files)) {
				dt.items.add(file);
			}
		}

		if (!this.incomingInputField.multiple) {
			this.logger.warn(
				"The Host's input field only supports one file. Incoming files from the Host will overwrite any existing file, and only the last file received will remain attached."
			);
			dt.items.clear();
		}

		dt.items.add(receivedFile);
		this.incomingInputField.files = dt.files;
	};

	private registerListeners = () => {
		this.channel?.on('init', () => {
			this.emit('init');
		});
		this.channel?.on('retrieving-info-from-endpoint', () => {});
		this.channel?.on('sending-client-info', () => {});
		this.channel?.on('connecting-to-host', () => {});
		this.channel?.on('connected', () => {
			this.emit('connected');
		});
		this.channel?.on('receiving-data', (e) => {
			//Handle file(s) reception
			this.handleIncomingData(e);
		});
		this.channel?.on('connection-impossible', () => {
			this.emit('webrtc:connection-impossible');
		});
		this.channel?.on('done', () => {});
		this.channel?.on('disconnected', () => {
			this.emit('disconnected');
		});
		this.channel?.on('error', (e) => {
			this.emit('error', e);
		});
		this.channel?.on('bufferedamountlow', this.startSendingFiles);
	};
}
