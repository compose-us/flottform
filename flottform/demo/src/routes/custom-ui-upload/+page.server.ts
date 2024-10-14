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
		const description = fd.get('description');
		const receiptType = fd.get('receiptType');
		const invoiceDate = fd.get('invoiceDate');
		const paidAmount = fd.get('paidAmount');
		const currency = fd.get('currency');
		const paymentMethod = fd.get('paymentMethod');
		const costCenter = fd.get('costCenter');
		const costObject = fd.get('costObject');
		const document = fd.get('document');

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

		await Promise.allSettled([document.stream().pipeTo(writeStream), tryRemovingOldUploads()]);

		return {
			success: true,
			description,
			receiptType,
			invoiceDate,
			paidAmount,
			currency,
			paymentMethod,
			costCenter,
			costObject,
			document: uuid,
			filenameDoc
		};
	}
};

/* eslint-disable  @typescript-eslint/no-explicit-any */

function isFile(x: any): x is File {
	return (
		x !== null && x !== undefined && x.name !== undefined && typeof x.arrayBuffer === 'function'
	);
}
/* eslint-enable  @typescript-eslint/no-explicit-any */

async function tryRemovingOldUploads(): Promise<void> {
	try {
		const uploadFolderList = await readdir(UPLOAD_FOLDER);
		for (const file of uploadFolderList) {
			const fileName = `${UPLOAD_FOLDER}/${file}`;
			const fileStats = await stat(fileName);
			const lastEdited = fileStats.mtimeMs || fileStats.atimeMs || fileStats.ctimeMs;
			const twoHoursAgo = +new Date() - 1000 * 60 * 60 * 2;
			if (lastEdited < twoHoursAgo) {
				await unlink(fileName);
			}
		}
	} catch (err) {
		console.log('Could not delete old uploads:', err);
	}
}
