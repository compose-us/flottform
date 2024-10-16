import { type RequestHandler, json, error, text } from '@sveltejs/kit';
import { retrieveFlottformDatabase } from '$lib/database';
import { ZodError, z } from 'zod';
import { env } from '$env/dynamic/private';

const corsHeaders = {
	'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN ?? '*',
	'Access-Control-Allow-Methods': 'GET,DELETE,OPTIONS',
	'Access-Control-Allow-Headers': '*'
};

export const GET: RequestHandler = async ({ params }) => {
	const { endpointId } = params;
	if (!endpointId) {
		return error(400, 'No endpointId provided.');
	}

	const db = await retrieveFlottformDatabase();
	try {
		const endpointInfos = await db.getEndpoint({ endpointId });
		return json(endpointInfos, {
			headers: corsHeaders
		});
	} catch (err) {
		if (err instanceof Error && err.message === 'Endpoint not found') {
			return error(404, 'Endpoint not found');
		}
		throw err;
	}
};

const deleteEndpointSchema = z.object({
	hostKey: z.string()
});

export const DELETE: RequestHandler = async ({ params, request }) => {
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
		const { hostKey } = deleteEndpointSchema.parse(data);
		const db = await retrieveFlottformDatabase();
		await db.deleteEndpoint({ endpointId, hostKey });

		return json({ success: true, endpointId }, { headers: corsHeaders });
	} catch (err) {
		if (err instanceof ZodError) {
			return error(400, 'Could not parse body: ' + err.message);
		}
		throw err;
	}
};

export const OPTIONS: RequestHandler = async () => {
	return text('', {
		headers: corsHeaders
	});
};
