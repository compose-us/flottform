import { fail, json, type RequestHandler, text } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	getAllowAllOrigins,
	getUseTurnServer,
	setAllowAllOrigins,
	setUseTurnServer
} from './global';
import { corsHeaders } from '$lib/cors-headers';
import { limiter } from './rate-limiter';

const RATE_LIMITING_ENABLED = Boolean(env.ENABLE_RATE_LIMITING);
const DEBUG_MODE = Boolean(env.DEBUG_MODE);

export const GET: RequestHandler = async ({ request }) => {
	return json(
		{ success: true, useTurnServer: getUseTurnServer(), allowAllOrigins: getAllowAllOrigins() },
		{ headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], request) }
	);
};

export const PUT: RequestHandler = async (event) => {
	if (RATE_LIMITING_ENABLED) {
		if (DEBUG_MODE) {
			console.log(new Date().toISOString(), 'check address for', event.getClientAddress());
		}
		const status = await limiter.check(event);

		if (status.limited) {
			event.setHeaders({
				'Retry-After': status.retryAfter.toString()
			});
			return json(
				{ success: false, message: 'Rate limit reached.' },
				{ status: 429, headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], event.request) }
			);
		}
	}

	try {
		const envAuthKey = env.AUTH_KEY;
		const authHeader = event.request.headers.get('Authorization');

		if (!envAuthKey) {
			return json(
				{ success: false, message: 'No Authentication Key found in the environment' },
				{ status: 500, headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], event.request) }
			);
		}

		// Check if the Authorization header is provided and valid
		if (!authHeader || authHeader !== envAuthKey) {
			return json(
				{ success: false, message: 'Unauthorized: Invalid authentication key' },
				{ status: 401, headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], event.request) }
			);
		}

		const data = await event.request.json();
		const { allowAllOrigins, useTurnServer } = data;

		if (typeof useTurnServer !== 'boolean') {
			return json(
				{ success: false, message: "Expecting boolean for 'useTurnServer' !" },
				{ headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], event.request) }
			);
		}

		if (typeof allowAllOrigins !== 'boolean') {
			return json(
				{ success: false, message: "Expecting boolean for 'allowAllOrigins' !" },
				{ headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], event.request) }
			);
		}

		setUseTurnServer(useTurnServer === true);
		setAllowAllOrigins(allowAllOrigins === true);

		return json(
			{ success: true, useTurnServer: getUseTurnServer(), allowAllOrigins: getAllowAllOrigins() },
			{ headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], event.request) }
		);
	} catch (error) {
		return json(
			{ success: false, message: error },
			{ status: 500, headers: corsHeaders(['GET', 'OPTIONS', 'PUT'], event.request) }
		);
	}
};

export const OPTIONS: RequestHandler = async ({ request }) => {
	return text('', {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,OPTIONS,PUT',
			'Access-Control-Allow-Headers': '*'
		}
	});
};
