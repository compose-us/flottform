import { type RequestHandler, json, error, text } from '@sveltejs/kit';
import { retrieveFlottformDatabase } from '$lib/database';
import { RTCIceCandidateInitSchema, RTCSessionDescriptionInitSchema } from '$lib/validations';
import { ZodError, z } from 'zod';

const validatePutPeerInfosBody = z.object({
	hostKey: z.string(),
	iceCandidates: z.array(RTCIceCandidateInitSchema)
});

export const PUT: RequestHandler = async ({ params, request }) => {
	const { endpointId } = params;
	if (!endpointId) {
		return error(400, 'No endpointId provided.');
	}

	let data: unknown;
	try {
		data = await request.json();
	} catch (e) {
		return error(400, 'Could not parse request data as JSON');
	}

	try {
		const { iceCandidates, hostKey } = validatePutPeerInfosBody.parse(data);
		console.log('received PUT host:', { endpointId, hostKey, iceCandidates });
		const db = await retrieveFlottformDatabase();
		const endpoint = await db.putHostInfo({ endpointId, iceCandidates, hostKey });
		return json(endpoint, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'PUT,OPTIONS'
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
			'Access-Control-Allow-Methods': 'PUT,OPTIONS'
		}
	});
};
