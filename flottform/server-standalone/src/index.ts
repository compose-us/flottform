import fastify from 'fastify';

console.log('hello');

const server = fastify();

// server.get('/', async (request, reply) => {
// 	return { hello: 'world' };
// });

// run();

// // ---- end

// async function run() {
// 	try {
// 		await server.listen({ port: 3000 });
// 	} catch (err) {
// 		server.log.error(err);
// 		process.exit(1);
// 	}
// }
