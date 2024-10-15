import { json, type RequestHandler, text } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getUseTurnServer, setUseTurnServer } from './global';

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const envAuthKey = env.AUTH_KEY;
		const authHeader = request.headers.get('Authorization');

		if (!envAuthKey) {
			return json(
				{ success: false, message: 'No Authentication Key found in the environment' },
				{
					status: 500,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET,OPTIONS,PUT',
						'Access-Control-Allow-Headers': '*'
					}
				}
			);
		}

		// Check if the Authorization header is provided and valid
		if (!authHeader || authHeader !== envAuthKey) {
			return json(
				{ success: false, message: 'Unauthorized: Invalid authentication key' },
				{
					status: 401,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET,OPTIONS,PUT',
						'Access-Control-Allow-Headers': '*'
					}
				}
			);
		}

		const data = await request.json();
		const { useTurnServer } = data;

		if (typeof useTurnServer !== 'boolean') {
			return json(
				{ success: false, message: "Expecting boolean for 'useTurnServer' !" },
				{
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET,OPTIONS,PUT',
						'Access-Control-Allow-Headers': '*'
					}
				}
			);
		}

		setUseTurnServer(useTurnServer === true);

		return json(
			{ success: true, useTurnServer: getUseTurnServer() },
			{
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET,OPTIONS,PUT',
					'Access-Control-Allow-Headers': '*'
				}
			}
		);
	} catch (error) {
		return json(
			{ success: false, message: error },
			{
				status: 500,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET,OPTIONS,PUT',
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
			'Access-Control-Allow-Methods': 'GET,OPTIONS,PUT',
			'Access-Control-Allow-Headers': '*'
		}
	});
};
