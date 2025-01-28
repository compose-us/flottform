import { FlottformChannelClient } from './flottform-channel-client';
import { EventEmitter, Logger, POLL_TIME_IN_MS } from './internal';

type Listeners = {
	init: [];
	connected: [];
	'webrtc:connection-impossible': [];
	'file-sending-progress': [
		{ fileIndex: number; totalFileCount: number; fileName: string; currentFileProgress: number }
	];
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

type FileSendState = {
	metaData: { name: string; type: string; size: number }[];
	arrayBuffers: ArrayBuffer[];
	currentFileIndex: number;
	currentChunkIndex: number;
};

type FileReceiveState = {
	metaData: { name: string; type: string; size: number }[];
	currentFile: { index: number; receivedSize: number; arrayBuffer: ArrayBuffer[] } | null;
	totalSize: number;
	receivedSize: number;
};

export class FlottformFileInputClient extends EventEmitter<Listeners> {
	private channel: FlottformChannelClient | null = null;
	private outgoingInputField?: HTMLInputElement; // Contains files to send to the other peer.
	private incomingInputField?: HTMLInputElement; // Contains files received from the other peer.
	// Sending files state (Client -> Host)
	private sendState: FileSendState = {
		metaData: [],
		arrayBuffers: [],
		currentFileIndex: 0,
		currentChunkIndex: 0
	};
	// Receiving files state (Host -> Client)
	private receiveState: FileReceiveState = {
		metaData: [],
		currentFile: null,
		receivedSize: 0,
		totalSize: 0
	};
	private chunkSize: number = 16384; // 16 KB chunks
	private logger: Logger;

	constructor({
		endpointId,
		outgoingInputField,
		incomingInputField,
		flottformApi,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		endpointId: string;
		outgoingInputField?: HTMLInputElement;
		incomingInputField?: HTMLInputElement;
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

	setIncomingInputField = (incomingInputField: HTMLInputElement) => {
		this.incomingInputField = incomingInputField;
	};

	setOutgoingInputField = (outgoingInputField: HTMLInputElement) => {
		this.outgoingInputField = outgoingInputField;
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
		if (!this.outgoingInputField) {
			throw new Error('Input Field containing the files to send is not provided!');
		}
		const metaData = this.createMetaData(this.outgoingInputField);
		const filesArrayBuffer = await this.createArrayBuffers(this.outgoingInputField);
		if (!metaData || !filesArrayBuffer)
			throw new Error("Can't find the files that you want to send!");

		this.sendState.metaData = metaData.filesQueue;
		this.sendState.arrayBuffers = filesArrayBuffer;

		this.channel?.sendData(JSON.stringify(metaData));

		this.startSendingFiles();
	};

	private startSendingFiles = () => {
		this.sendNextChunk();
	};

	private sendNextChunk = async () => {
		const totalNumberOfFiles = this.sendState.metaData.length;
		if (this.sendState.currentFileIndex >= totalNumberOfFiles) {
			this.logger.log('All files are sent');
			this.channel?.sendData(JSON.stringify({ type: 'files-batch-transfer-complete' }));
			this.sendState = {
				metaData: [],
				arrayBuffers: [],
				currentFileIndex: 0,
				currentChunkIndex: 0
			};
			return;
		}
		const currentFileArrayBuffer = this.sendState.arrayBuffers[this.sendState.currentFileIndex];
		if (!currentFileArrayBuffer) {
			throw new Error(
				`Can't find the ArrayBuffer for the file number ${this.sendState.currentFileIndex}`
			);
		}
		const currentFileSize = currentFileArrayBuffer.byteLength;
		const fileName = this.sendState.metaData[this.sendState.currentFileIndex]!.name;

		while (this.sendState.currentChunkIndex * this.chunkSize < currentFileSize) {
			// The file still has some chunks left
			if (!this.channel?.canSendMoreData()) {
				// Buffer is full. Pause sending the chunks
				this.logger.log('Buffer is full. Pausing sending chunks!');
				break;
			}
			const progress = (
				(this.sendState.currentChunkIndex * this.chunkSize) /
				currentFileSize
			).toFixed(2);

			this.emit('file-sending-progress', {
				fileIndex: this.sendState.currentFileIndex,
				fileName,
				currentFileProgress: parseFloat(progress),
				totalFileCount: this.sendState.arrayBuffers.length
			});

			const start = this.sendState.currentChunkIndex * this.chunkSize;
			const end = Math.min(
				(this.sendState.currentChunkIndex + 1) * this.chunkSize,
				currentFileSize
			);
			this.channel?.sendData(currentFileArrayBuffer.slice(start, end));
			this.sendState.currentChunkIndex++;
		}
		// Now either: the buffer is full OR all the chunks of the file have been sent.
		if (this.sendState.currentChunkIndex * this.chunkSize >= currentFileSize) {
			// File is fully sent move to the next one
			this.logger.log(`File ${fileName} fully sent. Moving to next file.`);
			const fileTransferedMetaData = this.sendState.metaData[this.sendState.currentFileIndex];
			this.emit('single-file-transfered', fileTransferedMetaData!);
			this.sendState.currentFileIndex++;
			this.sendState.currentChunkIndex = 0;
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
				this.receiveState.metaData = message.filesQueue;
				this.receiveState.currentFile = { index: 0, receivedSize: 0, arrayBuffer: [] };
				this.receiveState.totalSize = message.totalSize;
			} else if (message.type === 'files-batch-transfer-complete') {
				this.logger.log('Current batch of files received successfully!');
				this.receiveState = {
					metaData: [],
					currentFile: null,
					receivedSize: 0,
					totalSize: 0
				};
			}
		} else if (e.data instanceof ArrayBuffer) {
			// Handle file chunk
			if (this.receiveState.currentFile) {
				this.receiveState.currentFile.arrayBuffer.push(e.data);
				this.receiveState.currentFile.receivedSize += e.data.byteLength;
				this.receiveState.receivedSize += e.data.byteLength;

				const currentFileName = this.receiveState.metaData[this.receiveState.currentFile.index]
					?.name as string;

				const currentFileTotalSize = this.receiveState.metaData[this.receiveState.currentFile.index]
					?.size as number;

				const currentFileProgress = (
					this.receiveState.currentFile.receivedSize / currentFileTotalSize
				).toFixed(2);
				const overallProgress = (
					this.receiveState.receivedSize / this.receiveState.totalSize
				).toFixed(2);

				this.emit('file-receiving-progress', {
					fileIndex: this.receiveState.currentFile.index,
					totalFileCount: this.receiveState.metaData.length,
					fileName: currentFileName,
					currentFileProgress: parseFloat(currentFileProgress),
					overallProgress: parseFloat(overallProgress)
				});

				if (this.receiveState.currentFile.receivedSize === currentFileTotalSize) {
					// Attach the current file to the given input field
					this.appendFileToInputField(this.receiveState.currentFile.index);
					// Initialize the values of receiveState.currentFile to receive the next file
					this.receiveState.currentFile = {
						index: this.receiveState.currentFile.index + 1,
						receivedSize: 0,
						arrayBuffer: []
					};
				}
			}
		}
	};

	private appendFileToInputField = (fileIndex: number) => {
		const fileName = this.receiveState.metaData[fileIndex]?.name ?? 'no-name';
		const fileType = this.receiveState.metaData[fileIndex]?.type ?? 'application/octet-stream';

		const receivedFile = new File(
			this.receiveState.currentFile?.arrayBuffer as ArrayBuffer[],
			fileName,
			{
				type: fileType
			}
		);
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
