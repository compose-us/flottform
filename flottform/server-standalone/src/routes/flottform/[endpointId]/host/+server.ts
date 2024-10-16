import { type RequestHandler, json, error, text } from '@sveltejs/kit';
import { retrieveFlottformDatabase } from '$lib/database';
import { RTCIceCandidateInitSchema, RTCSessionDescriptionInitSchema } from '$lib/validations';
import { ZodError, z } from 'zod';
import { corsHeaders } from '$lib/cors-headers';

const validatePutPeerInfosBody = z.object({
	hostKey: z.string(),
	session: RTCSessionDescriptionInitSchema,
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
		console.log(e);
		return error(400, 'Could not parse request data as JSON');
	}

	try {
		const { iceCandidates, hostKey, session } = validatePutPeerInfosBody.parse(data);
		const db = await retrieveFlottformDatabase();
		const endpoint = await db.putHostInfo({ endpointId, iceCandidates, session, hostKey });
		return json(endpoint, {
			headers: corsHeaders(['PUT', 'OPTIONS'], request)
		});
	} catch (err) {
		if (err instanceof ZodError) {
			return error(400, 'Could not parse body: ' + err.message);
		}
		throw err;
	}
};

export const OPTIONS: RequestHandler = async ({ request }) => {
	return text('', {
		headers: corsHeaders(['PUT', 'OPTIONS'], request)
	});
};
