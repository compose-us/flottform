import { env } from '$env/dynamic/public';

export const sdpExchangeServerBase =
	env.PUBLIC_FLOTTFORM_SERVER_BASE || 'https://192.168.64.1:5177/flottform';

export const clientBase = env.PUBLIC_FLOTTFORM_CLIENT_BASE || 'https://192.168.64.1:5176/now/';
