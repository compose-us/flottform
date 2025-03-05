import { base } from '$app/paths';
import { env } from '$env/dynamic/public';

export const sdpExchangeServerBase = env.PUBLIC_FLOTTFORM_SERVER_BASE;

export const createClientUrl = async ({
	endpointId,
	encryptionKey
}: {
	endpointId: string;
	encryptionKey: string;
}) => {
	return `${window.location.origin}${base}/flottform-client/${endpointId}/#${encodeURIComponent(JSON.stringify({ encKey: encryptionKey }))}`;
};

export const createCustomClientUrl = async ({
	endpointId,
	encryptionKey
}: {
	endpointId: string;
	encryptionKey: string;
}) => {
	return `${window.location.origin}${base}/return-and-complaints-custom-client/${endpointId}/#${encodeURIComponent(JSON.stringify({ encKey: encryptionKey }))}`;
};

export const createCustomizedUiClientUrl = async ({
	endpointId,
	encryptionKey
}: {
	endpointId: string;
	encryptionKey: string;
}) => {
	return `${window.location.origin}${base}/customized-default-ui-client/${endpointId}/#${encodeURIComponent(JSON.stringify({ encKey: encryptionKey }))}`;
};

export const createExpenseReportClientUrl = async ({
	endpointId,
	encryptionKey
}: {
	endpointId: string;
	encryptionKey: string;
}) => {
	return `${window.location.origin}${base}/expense-report-client/${endpointId}/#${encodeURIComponent(JSON.stringify({ encKey: encryptionKey }))}`;
};

export const createDeExpenseReportClientUrl = async ({
	endpointId,
	encryptionKey
}: {
	endpointId: string;
	encryptionKey: string;
}) => {
	return `${window.location.origin}${base}/belegeinreichung-client/${endpointId}/#${encodeURIComponent(JSON.stringify({ encKey: encryptionKey }))}`;
};
