import { env } from '$env/dynamic/private';

type HttpMethod =
	| 'CONNECT'
	| 'DELETE'
	| 'GET'
	| 'HEAD'
	| 'OPTIONS'
	| 'PATCH'
	| 'POST'
	| 'PUT'
	| 'TRACE';

export const corsHeaders = (allowedMethods: Array<HttpMethod>, request: Request) => {
	const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
	const originHeader = request.headers.get('Origin');
	const allowedOrigin = allowedOrigins.find((x) => x === originHeader) ?? allowedOrigins?.[0];
	console.log('headers:', ...request.headers);
	console.log({ allowedOrigins, allowedOrigin });
	return {
		...(allowedOrigin
			? { 'Access-Control-Allow-Origin': allowedOrigin }
			: { 'Access-Control-Allow-Origin': '*' }),
		'Access-Control-Allow-Methods': allowedMethods.join(','),
		'Access-Control-Allow-Headers': '*',
		Vary: 'Origin'
	};
};
