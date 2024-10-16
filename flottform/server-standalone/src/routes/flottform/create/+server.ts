import { type RequestHandler, json, error, text } from '@sveltejs/kit';
import { retrieveFlottformDatabase } from '$lib/database';
import { RTCSessionDescriptionInitSchema } from '$lib/validations';
import { corsHeaders } from '$lib/cors-headers';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	if (!data.session) {
		return error(400, 'No session provided.');
	}

	let session: RTCSessionDescriptionInit;
	try {
		session = RTCSessionDescriptionInitSchema.parse(data.session);
	} catch (e) {
		console.log(e);
		return error(400, 'Could not parse session parameter into RTCSessionDescription.');
	}

	const db = await retrieveFlottformDatabase();
	const endpoint = await db.createEndpoint({ session });

	return json(endpoint, {
		headers: corsHeaders(['POST', 'OPTIONS'], request)
	});
};

export const OPTIONS: RequestHandler = async ({ request }) => {
	return text('', {
		headers: corsHeaders(['POST', 'OPTIONS'], request)
	});
};
