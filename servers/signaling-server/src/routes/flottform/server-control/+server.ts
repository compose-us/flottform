import { json, type RequestHandler, text } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	getAllowAllOrigins,
	getUseTurnServer,
	setAllowAllOrigins,
	setUseTurnServer
} from './global';
import { corsHeaders } from '$lib/cors-headers';

export const GET: RequestHandler = async ({ request }) => {
	return json(
		{ success: true, useTurnServer: getUseTurnServer(), allowAllOrigins: getAllowAllOrigins() },
		{
			headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], request)
		}
	);
};

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const envAuthKey = env.AUTH_KEY;
		const authHeader = request.headers.get('Authorization');

		if (!envAuthKey) {
			return json(
				{ success: false, message: 'No Authentication Key found in the environment' },
				{
					status: 500,
					headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], request)
				}
			);
		}

		// Check if the Authorization header is provided and valid
		if (!authHeader || authHeader !== envAuthKey) {
			return json(
				{ success: false, message: 'Unauthorized: Invalid authentication key' },
				{
					status: 401,
					headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], request)
				}
			);
		}

		const data = await request.json();
		const { allowAllOrigins, useTurnServer } = data;

		if (typeof useTurnServer !== 'boolean') {
			return json(
				{ success: false, message: "Expecting boolean for 'useTurnServer' !" },
				{
					headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], request)
				}
			);
		}

		if (typeof allowAllOrigins !== 'boolean') {
			return json(
				{ success: false, message: "Expecting boolean for 'allowAllOrigins' !" },
				{
					headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], request)
				}
			);
		}

		setUseTurnServer(useTurnServer === true);
		setAllowAllOrigins(allowAllOrigins === true);

		return json(
			{ success: true, useTurnServer: getUseTurnServer(), allowAllOrigins: getAllowAllOrigins() },
			{
				headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], request)
			}
		);
	} catch (error) {
		return json(
			{ success: false, message: error },
			{
				status: 500,
				headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], request)
			}
		);
	}
};

export const OPTIONS: RequestHandler = async ({ request }) => {
	return text('', {
		headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], request)
	});
};
