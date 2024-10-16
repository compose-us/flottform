import { browser } from '$app/environment';
import { base } from '$app/paths';
import { env } from '$env/dynamic/public';

export const sdpExchangeServerBase =
	env.PUBLIC_FLOTTFORM_SERVER_BASE || `${env.PUBLIC_HOST}:5177/flottform`;

const clientBase = env.PUBLIC_FLOTTFORM_CLIENT_BASE || `${env.PUBLIC_HOST}:5175/flottform-client`;

export const createClientUrl = async ({ endpointId }: { endpointId: string }) => {
	if (browser) {
		return `${window.location.origin}${base}/flottform-client/${endpointId}`;
	}
	return `${clientBase}/${endpointId}`;
};

const customClientBase =
	env.PUBLIC_FLOTTFORM_CLIENT_BASE || `${env.PUBLIC_HOST}:5175/return-and-complaints-custom`;

export const createCustomClientUrl = async ({ endpointId }: { endpointId: string }) => {
	if (browser) {
		return `${window.location.origin}${base}/return-and-complaints-custom-client/${endpointId}`;
	}
	return `${customClientBase}/${endpointId}`;
};

const customizedUiClientBase =
	env.PUBLIC_FLOTTFORM_CLIENT_BASE || `${env.PUBLIC_HOST}:5175/customized-default-ui-client`;

export const createCustomizedUiClientUrl = async ({ endpointId }: { endpointId: string }) => {
	if (browser) {
		return `${window.location.origin}${base}/customized-default-ui-client/${endpointId}`;
	}
	return `${customizedUiClientBase}/${endpointId}`;
};

const expenseReportClientBase =
	env.PUBLIC_FLOTTFORM_CLIENT_BASE || `${env.PUBLIC_HOST}:5177/expense-report`;

export const createExpenseReportClientUrl = async ({ endpointId }: { endpointId: string }) => {
	if (browser) {
		return `${window.location.origin}${base}/expense-report-client/${endpointId}`;
	}
	return `${expenseReportClientBase}/${endpointId}`;
};
