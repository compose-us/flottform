import {
	EventEmitter,
	FlottformChannelPeerEvents,
} from './internal';

export abstract class FlottformChannelPeer<
	EventMap extends FlottformChannelPeerEvents
> extends EventEmitter<EventMap> {
	abstract start();

	abstract close();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abstract sendData(data: any);

	abstract canSendMoreData();

	protected fetchIceServers = async (baseApi: string) => {
		// TOOD remove after testing
		await new Promise((r) => setTimeout(r, 2000));

		const response = await fetch(`${baseApi}/ice-server-credentials`, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});
		if (!response.ok) {
			throw new Error('Fetching Error!');
		}
		const data = await response.json();

		if (data.success === false) {
			throw new Error(data.message || 'Unknown error occurred');
		}

		return data.iceServers;
	};
}
