import { candidates, offers } from '$lib/flottform/flottform.server';
import { fail, json } from '@sveltejs/kit';

export const GET = async ({ request }) => {
	const secret = new URL(request.url).searchParams.get('secret');
	if (secret === null) {
		return new Response(null, { status: 404, statusText: 'No secret found' });
	}
	if (!offers[secret].answer || !candidates[secret].answer) {
		return new Response(null, { status: 404, statusText: 'No peer found' });
	}
	return json({
		offer: offers[secret].answer,
		candidates: candidates[secret].answer
	});
};

export const PUT = async ({ request }) => {
	const {
		secret,
		offer,
		candidates: putCandidates
	} = JSON.parse(await request.text()) as {
		secret: string;
		offer: RTCSessionDescriptionInit;
		candidates: RTCIceCandidateInit[];
	};
	offers[secret] = { form: offer };
	candidates[secret] = { form: putCandidates };
	return new Response();
};
