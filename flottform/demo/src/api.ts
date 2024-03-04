import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

export const sdpExchangeServerBase =
	env.PUBLIC_FLOTTFORM_SERVER_BASE || 'https://192.168.0.21:5177/flottform';

export const createClientUrl = async ({ endpointId }: { endpointId: string }) => {
	if (browser) {
		return `${window.location.origin}/flottform-client/${endpointId}`;
	}
	return `https://192.168.0.21:5173/flottform-client/${endpointId}`;
};
