import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { Writable } from 'node:stream';
import { createWriteStream } from 'node:fs';

const UPLOAD_FOLDER = 'static/uploads';

export const actions: Actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const message = fd.get('message');
		const document = fd.get('document');

		if (!isString(message)) {
			return fail(422, { error: true, message: 'message needs to be a string' });
		}

		if (!isFile(document)) {
			return fail(422, { error: true, message: 'document needs to be a file' });
		}

		const uuid = crypto.randomUUID();
		const writeStream = Writable.toWeb(createWriteStream(`${UPLOAD_FOLDER}/${uuid}`));
		await document.stream().pipeTo(writeStream);

		return {
			success: true,
			file: uuid
		};
	}
};

function isString(x: any): x is string {
	return typeof x === 'string';
}

function isFile(x: any): x is File {
	return (
		x !== null && x !== undefined && x.name !== undefined && typeof x.arrayBuffer === 'function'
	);
}
