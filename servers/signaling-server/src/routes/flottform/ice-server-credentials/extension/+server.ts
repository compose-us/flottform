import { type RequestHandler, json, text } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { corsHeaders } from '$lib/cors-headers';

const meteredApiKey = env.AUTH_KEY;
const extensionApiToken = env.FLOTTFORM_EXTENSION_API_TOKEN;

// Extension-only ICE credentials endpoint.
// Gated by build-time shared Bearer token to keep drive-by scraping out.
// Origin check is intentionally omitted: Chrome strips Origin from extension fetches
// when host_permissions cover the target URL, so an Origin gate can't reach this handler.
// Token is baked into the .crx and extractable — speed bump, not real auth.
// Will be replaced with per-license validation before public release.
export const GET: RequestHandler = async ({ request }) => {
	if (!extensionApiToken) {
		return json(
			{ success: false, message: 'Extension API token not configured on the server' },
			{ status: 500, headers: corsHeaders(['GET', 'OPTIONS'], request) }
		);
	}

	const authHeader = request.headers.get('Authorization');
	const providedToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (providedToken !== extensionApiToken) {
		return json(
			{ success: false, message: 'Unauthorized' },
			{ status: 401, headers: corsHeaders(['GET', 'OPTIONS'], request) }
		);
	}

	if (!meteredApiKey) {
		return json(
			{ success: false, message: 'No metered API key configured on the server' },
			{ status: 500, headers: corsHeaders(['GET', 'OPTIONS'], request) }
		);
	}

	try {
		const response = await fetch(
			`https://compose-us.metered.live/api/v1/turn/credentials?apiKey=${meteredApiKey}`
		);

		if (!response.ok) {
			return json(
				{ success: false, message: `Metered responded with status ${response.status}` },
				{ status: 502, headers: corsHeaders(['GET', 'OPTIONS'], request) }
			);
		}
		const iceServers = await response.json();

		if (!Array.isArray(iceServers)) {
			return json(
				{ success: false, message: 'Metered returned unexpected payload' },
				{ status: 502, headers: corsHeaders(['GET', 'OPTIONS'], request) }
			);
		}
		return json(
			{ iceServers },
			{ status: 200, headers: corsHeaders(['GET', 'OPTIONS'], request) }
		);
	} catch (error) {
		return json(
			{ success: false, message: `Failed to fetch ICE credentials: ${(error as Error).message}` },
			{ status: 502, headers: corsHeaders(['GET', 'OPTIONS'], request) }
		);
	}
};

export const OPTIONS: RequestHandler = async ({ request }) => {
	return text('', {
		headers: corsHeaders(['GET', 'OPTIONS'], request)
	});
};
