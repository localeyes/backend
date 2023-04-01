import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastify from 'fastify';

import auth from '$/plugins/auth';

export const server = fastify();

await server.register(swagger, {
	swagger: {
		info: {
			title: 'GeoHunt API',
			description: 'GeoHunt API documentation',
			version: '1.0.0',
		},
		consumes: ['application/json'],
		produces: ['application/json'],
	},
});

await server.register(swaggerUi, {
	routePrefix: '/docs',
	uiConfig: {
		docExpansion: 'full',
		deepLinking: false,
	},
	uiHooks: {
		onRequest: function (_request, _reply, next) { next(); },
		preHandler: function (_request, _reply, next) { next(); },
	},
	staticCSP: true,
	transformStaticCSP: (header) => header,
	transformSpecification: (swaggerObject) => { return swaggerObject; },
	transformSpecificationClone: true,
});

await server.register(auth);

// These don't need to be registered before the routes are added
server.register(cors, {
	origin: true,
});
