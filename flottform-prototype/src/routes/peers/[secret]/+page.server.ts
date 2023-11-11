import { candidates, offers } from '$lib/flottform/flottform.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		offer: offers[params.secret].form,
		candidates: candidates[params.secret].form
	};
};
