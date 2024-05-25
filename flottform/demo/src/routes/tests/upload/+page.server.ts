import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		console.log('got a request');
		const fd = await request.formData();
		const document = fd.get('document');
		if (!isFile(document) || !isString(document)) {
			return fail(422, { error: true, message: 'document needs to be a file or a string' });
		}

		return {
			success: true
		};
	}
};

function isFile(x: any): x is File {
	return (
		x !== null && x !== undefined && x.name !== undefined && typeof x.arrayBuffer === 'function'
	);
}

function isString(x: any): x is string {
	return typeof x === 'string';
}
