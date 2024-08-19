import { browser } from '$app/environment';
import { base } from '$app/paths';
import { env } from '$env/dynamic/public';

export const sdpExchangeServerBase =
	env.PUBLIC_FLOTTFORM_SERVER_BASE || 'https://192.168.0.21:5177/flottform';

const clientBase =
	env.PUBLIC_FLOTTFORM_CLIENT_BASE || 'https://192.168.0.21:5173/multiple-input-form-client';

export const createClientUrl = async ({ endpointId }: { endpointId: string }) => {
	if (browser) {
		return `${window.location.origin}${base}/multiple-input-form-client/${endpointId}`;
	}
	return `${clientBase}/${endpointId}`;
};
