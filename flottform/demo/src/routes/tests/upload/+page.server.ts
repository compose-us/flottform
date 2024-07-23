import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	files: async ({ request }) => {
		console.log('got a request');
		const fd = await request.formData();
		const document = fd.get('element-to-upload');
		console.log(typeof document);

		if (!isFile(document)) {
			return fail(422, { error: true, message: 'document needs to be a file' });
		}

		return {
			success: true
		};
	},
	text: async ({ request }) => {
		console.log('got a request');
		const fd = await request.formData();
		const textInput = fd.get('element-to-upload');
		console.log(typeof textInput);

		if (!isString(textInput)) {
			return fail(422, { error: true, message: 'Text input needs to be a file' });
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
