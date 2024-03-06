import { env } from '$env/dynamic/private';
import { error, type RequestHandler } from '@sveltejs/kit';
import { createReadableStream } from '@sveltejs/kit/node';

const UPLOAD_FOLDER = env.UPLOAD_FOLDER ?? 'static/uploads';

export const GET: RequestHandler = async ({ params }) => {
	const file = params.file;
	try {
		const fileStream = createReadableStream(`${UPLOAD_FOLDER}/${file}`);
		return new Response(fileStream);
	} catch (err) {
		console.log(err);
		return error((err as any).code === 'ENOENT' ? 404 : 500);
	}
};
