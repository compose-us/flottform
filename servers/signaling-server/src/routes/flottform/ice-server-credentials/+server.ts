import { type RequestHandler, json, text } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getUseTurnServer } from '../server-control/global';
import { corsHeaders } from '$lib/cors-headers';

const iceServersEnv = env.ICE_SERVERS_CONFIGURATION;

export const GET: RequestHandler = async ({ request }) => {
	const useTurnServer = getUseTurnServer();

	if (!iceServersEnv) {
		return json(
			{ success: false, message: 'No ICE server configuration found in the environment' },
			{
				status: 500,
				headers: corsHeaders(['GET', 'OPTIONS'], request)
			}
		);
	}

	if (useTurnServer) {
		const response = await fetch(
			`https://compose-us.metered.live/api/v1/turn/credentials?apiKey=${iceServersEnv}`
		);
		const iceServers = await response.json();

		// Return the STUN & TURN servers
		return json(
			{
				iceServers: iceServers
			},
			{
				status: 200,
				headers: corsHeaders(['GET', 'OPTIONS'], request)
			}
		);
	} else {
		// Return only the STUN servers
		return json(
			{
				iceServers: [
					{
						urls: ['stun:stun1.l.google.com:19302']
					}
				]
			},
			{
				status: 200,
				headers: corsHeaders(['GET', 'OPTIONS'], request)
			}
		);
	}
};

export const OPTIONS: RequestHandler = async ({ request }) => {
	return text('', {
		headers: corsHeaders(['GET', 'OPTIONS'], request)
	});
};
