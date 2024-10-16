import { type RequestHandler, json, text } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getUseTurnServer } from '../turn-control/global';

export const GET: RequestHandler = async () => {
	const useTurnServer = getUseTurnServer();
	const iceServersEnv = env.ICE_SERVERS_CONFIGURATION;

	if (!iceServersEnv) {
		return json(
			{ success: false, message: 'No ICE server configuration found in the environment' },
			{
				status: 500,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET',
					'Access-Control-Allow-Headers': '*'
				}
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
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET',
					'Access-Control-Allow-Headers': '*'
				}
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
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET',
					'Access-Control-Allow-Headers': '*'
				}
			}
		);
	}
};

export const OPTIONS: RequestHandler = async () => {
	return text('', {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,OPTIONS',
			'Access-Control-Allow-Headers': '*'
		}
	});
};
