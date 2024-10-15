import { FlottformChannelHost } from './flottform-channel-host';
import { BaseInputHost, BaseListeners, Logger, POLL_TIME_IN_MS } from './internal';

type Listeners = BaseListeners & {
	receive: []; // Emitted to signal the start of receiving the file(s)
	progress: {
		fileIndex: number;
		totalFileCount: number;
		fileName: string;
		currentFileProgress: number;
		overallProgress: number;
	}[]; // Emitted to signal the progress of receiving the file(s)
	done: [];
	'webrtc:waiting-for-file': [];
};

export class FlottformFileInputHost extends BaseInputHost<Listeners> {
	private channel: FlottformChannelHost | null = null;
	private inputField: HTMLInputElement;
	private logger: Logger;
	private filesMetaData: { name: string; type: string; size: number }[] = [];
	private filesTotalSize: number = 0;
	private receivedDataSize: number = 0;
	private currentFile: {
		index: number;
		receivedSize: number;
		arrayBuffer: ArrayBuffer[];
	} | null = null;
	private link: string = '';
	private qrCode: string = '';

	constructor({
		flottformApi,
		createClientUrl,
		inputField,
		pollTimeForIceInMs = POLL_TIME_IN_MS,
		logger = console
	}: {
		flottformApi: string | URL;
		createClientUrl: (params: { endpointId: string }) => Promise<string>;
		inputField: HTMLInputElement;
		pollTimeForIceInMs?: number;
		theme?: (myself: FlottformFileInputHost) => void;
		logger?: Logger;
	}) {
		super();
		this.channel = new FlottformChannelHost({
			flottformApi,
			createClientUrl,
			pollTimeForIceInMs,
			logger
		});
		this.inputField = inputField;
		this.logger = logger;

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

	private handleIncomingData = (e: MessageEvent) => {
		if (typeof e.data === 'string') {
			// string can be either metadata or end transfer marker.
			const message = JSON.parse(e.data);
			if (message.type === 'file-transfer-meta') {
				// Handle file metadata
				this.filesMetaData = message.filesQueue;
				this.currentFile = { index: 0, receivedSize: 0, arrayBuffer: [] };
				this.filesTotalSize = message.totalSize;
				// Emit the start of receiving data
				this.emit('receive');
			} else if (message.type === 'transfer-complete') {
				this.emit('done');
				this.channel?.close();
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

				this.emit('progress', {
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
		if (!this.inputField) {
			this.logger.warn('No input field provided!!');
			return;
		}

		if (!this.inputField.multiple) {
			this.logger.warn('Input field does not accept multiple files. Setting multiple to true.');
			this.inputField.multiple = true;
		}

		const dt = new DataTransfer();

		// Add existing files from the input field to the DataTransfer object to avoid loosing them.
		if (this.inputField.files) {
			for (const file of Array.from(this.inputField.files)) {
				dt.items.add(file);
			}
		}

		const fileName = this.filesMetaData[fileIndex]?.name ?? 'no-name';
		const fileType = this.filesMetaData[fileIndex]?.type ?? 'application/octet-stream';

		const fileForForm = new File(this.currentFile?.arrayBuffer as ArrayBuffer[], fileName, {
			type: fileType
		});
		dt.items.add(fileForForm);
		this.inputField.files = dt.files;
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
			this.emit('webrtc:waiting-for-file');
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
