import { type RequestHandler, json, error, text } from '@sveltejs/kit';
import { retrieveFlottformDatabase } from '$lib/database';
import { RTCIceCandidateInitSchema, RTCSessionDescriptionInitSchema } from '$lib/validations';
import { z, ZodError } from 'zod';

const validatePutPeerInfosBody = z.object({
	clientKey: z.string(),
	iceCandidates: z.array(RTCIceCandidateInitSchema),
	session: RTCSessionDescriptionInitSchema
});

export const PUT: RequestHandler = async ({ params, request }) => {
	const { endpointId } = params;
	if (!endpointId) {
		return error(400, 'No endpointId provided.');
	}

	let data: unknown;
	try {
		data = await request.json();
	} catch {
		return error(400, 'Could not parse request data as JSON');
	}

	try {
		const { session, iceCandidates, clientKey } = validatePutPeerInfosBody.parse(data);
		const db = await retrieveFlottformDatabase();
		const endpoint = await db.putClientInfo({ endpointId, session, iceCandidates, clientKey });

		return json(endpoint, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'PUT,OPTIONS',
				'Access-Control-Allow-Headers': '*'
			}
		});
	} catch (err) {
		if (err instanceof ZodError) {
			return error(400, 'Could not parse body: ' + err.message);
		}
		throw err;
	}
};

export const OPTIONS: RequestHandler = async () => {
	return text('', {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'PUT,OPTIONS',
			'Access-Control-Allow-Headers': '*'
		}
	});
};
