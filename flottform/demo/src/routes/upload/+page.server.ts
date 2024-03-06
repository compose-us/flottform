import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { Writable } from 'node:stream';
import { createWriteStream } from 'node:fs';
import { mkdir, readdir, stat, unlink } from 'node:fs/promises';
import { env } from '$env/dynamic/private';

const UPLOAD_FOLDER = env.UPLOAD_FOLDER ?? 'static/uploads';

export const actions: Actions = {
	default: async ({ request }) => {
		console.log('got a request');
		const fd = await request.formData();
		const name = fd.get('name');
		const surname = fd.get('surname');
		const email = fd.get('email');
		const phone = fd.get('phone');
		const street = fd.get('street');
		const houseNumber = fd.get('houseNumber');
		const city = fd.get('city');
		const postcode = fd.get('postcode');
		const problemDescription = fd.get('problemDescription');
		const document = fd.get('document');

		if (!isString(problemDescription)) {
			return fail(422, { error: true, message: 'problemDescription needs to be a string' });
		}

		if (!isFile(document)) {
			return fail(422, { error: true, message: 'document needs to be a file' });
		}

		console.log('creating folder if does not exist', UPLOAD_FOLDER);
		await mkdir(UPLOAD_FOLDER, { recursive: true });

		const uuid = crypto.randomUUID();
		const filenameDoc = `${uuid}-${document.name}`;
		const filePath = `${UPLOAD_FOLDER}/${filenameDoc}`;
		console.log('creating/uploading', filePath);
		const writeStream = Writable.toWeb(createWriteStream(filePath));

		await Promise.all([document.stream().pipeTo(writeStream), tryRemovingOldUploads()]);

		return {
			success: true,
			name,
			surname,
			email,
			phone,
			street,
			houseNumber,
			city,
			postcode,
			problemDescription,
			document: uuid,
			filenameDoc
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

async function tryRemovingOldUploads(): Promise<void> {
	try {
		const uploadFolderList = await readdir(UPLOAD_FOLDER);
		for (const file of uploadFolderList) {
			const fileName = `${uploadFolderList}/${file}`;
			const fileStats = await stat(fileName);
			const lastEdited = fileStats.mtimeMs || fileStats.atimeMs || fileStats.ctimeMs;
			const twoHoursAgo = +new Date() - 1000 * 60 * 60 * 2;
			if (lastEdited > twoHoursAgo) {
				await unlink(fileName);
			}
		}
	} catch (err) {
		console.log('Could not delete old uploads:', err);
	}
}
