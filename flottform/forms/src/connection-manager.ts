import { FlottformFileInputHost } from './flottform-file-input-host';
import { FlottformTextInputHost } from './flottform-text-input-host';

export class ConnectionManager {
	private static instance: ConnectionManager;
	private activeConnections: Map<string, FlottformFileInputHost | FlottformTextInputHost>;

	private constructor() {
		this.activeConnections = new Map<string, FlottformFileInputHost | FlottformTextInputHost>();
	}

	public static getInstance(): ConnectionManager {
		if (!ConnectionManager.instance) {
			ConnectionManager.instance = new ConnectionManager();
		}
		return ConnectionManager.instance;
	}

	public addConnection(key: string, connection: FlottformFileInputHost | FlottformTextInputHost) {
		this.activeConnections.set(key, connection);
	}

	public getConnection(key: string) {
		return this.activeConnections.get(key);
	}

	public closeAllConnections() {
		this.activeConnections.forEach((connection) => {
			connection.close();
		});
		//this.activeConnections.clear();
	}

	public removeConnection(key: string) {
		this.activeConnections.delete(key);
	}
}
