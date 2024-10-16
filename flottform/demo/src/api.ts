import { base } from '$app/paths';
import { env } from '$env/dynamic/public';

export const sdpExchangeServerBase =
	env.PUBLIC_FLOTTFORM_SERVER_BASE || `${env.PUBLIC_HOST}:5177/flottform`;

export const createClientUrl = async ({ endpointId }: { endpointId: string }) => {
	return `${window.location.origin}${base}/flottform-client/${endpointId}`;
};

export const createCustomClientUrl = async ({ endpointId }: { endpointId: string }) => {
	return `${window.location.origin}${base}/return-and-complaints-custom-client/${endpointId}`;
};

export const createCustomizedUiClientUrl = async ({ endpointId }: { endpointId: string }) => {
	return `${window.location.origin}${base}/customized-default-ui-client/${endpointId}`;
};

export const createExpenseReportClientUrl = async ({ endpointId }: { endpointId: string }) => {
	return `${window.location.origin}${base}/expense-report-client/${endpointId}`;
};
