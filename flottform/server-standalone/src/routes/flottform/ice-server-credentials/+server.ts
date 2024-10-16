import { type RequestHandler, json, text } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getUseTurnServer } from '../turn-control/global';

const iceServersEnv = env.ICE_SERVERS_CONFIGURATION;
const corsHeaders = {
	'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN ?? '*',
	'Access-Control-Allow-Methods': 'GET,OPTIONS',
	'Access-Control-Allow-Headers': '*'
};

export const GET: RequestHandler = async () => {
	const useTurnServer = getUseTurnServer();

	if (!iceServersEnv) {
		return json(
			{ success: false, message: 'No ICE server configuration found in the environment' },
			{
				status: 500,
				headers: corsHeaders
			}
		);
	}

	if (useTurnServer) {
		// Return the STUN & TURN servers
		return json(
			{
				iceServers: JSON.parse(iceServersEnv)
			},
			{
				status: 200,
				headers: corsHeaders
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
				headers: corsHeaders
			}
		);
	}
};

export const OPTIONS: RequestHandler = async () => {
	return text('', {
		headers: corsHeaders
	});
};
