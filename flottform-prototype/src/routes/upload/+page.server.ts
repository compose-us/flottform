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
		const document2 = fd.get('document2');

		if (!isString(message)) {
			return fail(422, { error: true, message: 'message needs to be a string' });
		}

		if (!isFile(document)) {
			return fail(422, { error: true, message: 'document needs to be a file' });
		}

		if (!isFile(document2)) {
			return fail(422, { error: true, message: 'document2 needs to be a file' });
		}

		const uuid = crypto.randomUUID();
		const filenameDoc1 = `${uuid}-${document.name}`;
		const writeStream = Writable.toWeb(createWriteStream(`${UPLOAD_FOLDER}/${filenameDoc1}`));

		const uuid2 = crypto.randomUUID();
		const filenameDoc2 = `${uuid2}-${document2.name}`;
		const writeStream2 = Writable.toWeb(createWriteStream(`${UPLOAD_FOLDER}/${filenameDoc2}`));
		await Promise.all([
			document.stream().pipeTo(writeStream),
			document2.stream().pipeTo(writeStream2)
		]);

		return {
			success: true,
			message,
			document: uuid,
			document2: uuid2,
			filenameDoc1,
			filenameDoc2
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
