import { candidates, offers } from '$lib/flottform/flottform.server';

export const PUT = async ({ request, params }) => {
	const { offer, candidates: putCandidates } = JSON.parse(await request.text()) as {
		offer: RTCSessionDescriptionInit;
		candidates: RTCIceCandidateInit[];
	};
	offers[params.secret].answer = offer;
	candidates[params.secret].answer = putCandidates;
	return new Response();
};
