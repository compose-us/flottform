import { type RequestHandler, json, error, text } from '@sveltejs/kit';
import { retrieveFlottformDatabase } from '$lib/database';
import { corsHeaders } from '$lib/cors-headers';
import { CreateEndpointPayloadSchema } from '$lib/validations';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	let hostInfo: string;
	try {
		hostInfo = CreateEndpointPayloadSchema.parse(data).hostInfo;
	} catch (e) {
		console.log(e);
		return error(400, 'Could not parse hostInfo parameter into string.');
	}

	const db = await retrieveFlottformDatabase();
	const endpoint = await db.createEndpoint({ hostInfo });

	return json(endpoint, {
		headers: corsHeaders(['POST', 'OPTIONS'], request)
	});
};

export const OPTIONS: RequestHandler = async ({ request }) => {
	return text('', {
		headers: corsHeaders(['POST', 'OPTIONS'], request)
	});
};
