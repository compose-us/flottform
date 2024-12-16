type HostKey = string;
type ClientKey = string;
type EndpointId = string;
type EndpointInfo = {
	hostKey: HostKey;
	endpointId: EndpointId;
	hostInfo: {
		session: RTCSessionDescriptionInit;
		iceCandidates: RTCIceCandidateInit[];
	};
	clientKey?: ClientKey;
	clientInfo?: {
		session: RTCSessionDescriptionInit;
		iceCandidates: RTCIceCandidateInit[];
	};
	lastUpdate: number;
};
type SafeEndpointInfo = Omit<EndpointInfo, 'hostKey' | 'clientKey'>;

function createRandomHostKey(): string {
	return crypto.randomUUID();
}
function createRandomEndpointId(): string {
	return crypto.randomUUID();
}

class FlottformDatabase {
	private map = new Map<EndpointId, EndpointInfo>();
	private cleanupIntervalId: NodeJS.Timeout | null = null;
	private cleanupPeriod;
	private entryTTL; // Time-to-Live for each entry

	constructor(cleanupPeriod = 30 * 60 * 1000, entryTTL = 25 * 60 * 1000) {
		this.cleanupPeriod = cleanupPeriod;
		this.entryTTL = entryTTL;
		this.startCleanup();
	}

	private startCleanup() {
		this.cleanupIntervalId = setInterval(() => {
			// Loop over all entries and delete the stale ones.
			const now = Date.now();
			for (const [endpointId, endpointInfo] of this.map) {
				const lastUpdated = endpointInfo.lastUpdate;
				if (now - lastUpdated > this.entryTTL) {
					this.map.delete(endpointId);
					console.log(`Cleaned up stale entry: ${endpointId}`);
				}
			}
		}, this.cleanupPeriod);
	}

	private stopCleanup() {
		// Clear the interval to stop cleanup
		if (this.cleanupIntervalId) {
			clearInterval(this.cleanupIntervalId);
			this.cleanupIntervalId = null;
		}
	}

	// Stop the cleanup when the database is no longer needed
	destroy() {
		this.stopCleanup();
	}

	async createEndpoint({ session }: { session: RTCSessionDescriptionInit }): Promise<EndpointInfo> {
		const entry = {
			hostKey: createRandomHostKey(),
			endpointId: createRandomEndpointId(),
			hostInfo: {
				session,
				iceCandidates: []
			},
			lastUpdate: Date.now()
		};
		this.map.set(entry.endpointId, entry);
		return entry;
	}

	async getEndpoint({ endpointId }: { endpointId: EndpointId }): Promise<SafeEndpointInfo> {
		const entry = this.map.get(endpointId);
		if (!entry) {
			throw Error('Endpoint not found');
		}
		entry.lastUpdate = Date.now();
		const { hostKey: _ignore1, clientKey: _ignore2, ...endpoint } = entry;

		return endpoint;
	}

	async putHostInfo({
		endpointId,
		hostKey,
		session,
		iceCandidates
	}: {
		endpointId: EndpointId;
		hostKey: HostKey;
		session: RTCSessionDescriptionInit;
		iceCandidates: RTCIceCandidateInit[];
	}): Promise<SafeEndpointInfo> {
		const existingSession = this.map.get(endpointId);
		if (!existingSession) {
			throw Error('Session not found. Are you sure the host is still connected?');
		}
		if (existingSession.hostKey && existingSession.hostKey !== hostKey) {
			throw Error('hostKey is wrong.');
		}

		const newInfo = {
			...existingSession,
			hostInfo: { ...existingSession.hostInfo, session, iceCandidates },
			lastUpdate: Date.now()
		};
		this.map.set(endpointId, newInfo);

		const { hostKey: _ignore1, clientKey: _ignore2, ...newEndpoint } = newInfo;

		return newEndpoint;
	}

	async putClientInfo({
		endpointId,
		clientKey,
		session,
		iceCandidates
	}: {
		endpointId: EndpointId;
		clientKey: ClientKey;
		session: RTCSessionDescriptionInit;
		iceCandidates: RTCIceCandidateInit[];
	}): Promise<Required<SafeEndpointInfo>> {
		const existingSession = this.map.get(endpointId);
		if (!existingSession) {
			throw Error('Session not found. Are you sure the host is still connected?');
		}
		if (existingSession.clientKey && existingSession.clientKey !== clientKey) {
			throw Error(
				'clientKey is wrong: Another peer is already connected and you cannot change this info without the correct key anymore. If you lost your key, initiate a new Flottform connection.'
			);
		}

		const newInfo = {
			...existingSession,
			clientKey,
			clientInfo: { session, iceCandidates },
			lastUpdate: Date.now()
		};
		this.map.set(endpointId, newInfo);

		const { hostKey: _ignore1, clientKey: _ignore2, ...newEndpoint } = newInfo;

		return newEndpoint;
	}

	async deleteEndpoint({
		endpointId,
		hostKey
	}: {
		endpointId: EndpointId;
		hostKey: HostKey;
	}): Promise<void> {
		const entry = this.map.get(endpointId);
		if (entry?.hostKey !== hostKey) {
			throw Error('hostKey did not match existing key');
		}

		this.map.delete(endpointId);
	}
}

export async function createFlottformDatabase(): Promise<FlottformDatabase> {
	return new FlottformDatabase();
}

export type { FlottformDatabase };
