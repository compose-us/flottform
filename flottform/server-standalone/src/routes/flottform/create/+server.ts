import { type RequestHandler, json, error, text } from '@sveltejs/kit';
import { retrieveFlottformDatabase } from '$lib/database';
import { RTCSessionDescriptionInitSchema } from '$lib/validations';

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
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST,OPTIONS',
			'Access-Control-Allow-Headers': '*'
		}
	});
};

export const OPTIONS: RequestHandler = async () => {
	return text('', {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST,OPTIONS',
			'Access-Control-Allow-Headers': '*'
		}
	});
};
