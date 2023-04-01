import { server } from '$/server';

server.addSchema({
	$id: 'auth',
	type: 'object',
	properties: {
		authorization: { type: 'string' },
	},
});

server.addSchema({
	$id: 'uuid',
	type: 'string',
	format: 'uuid',
});

server.addSchema({
	$id: 'leaderboardUser',
	type: 'object',
	properties: {
		id: { $ref: 'uuid#' },
		username: { type: 'string' },
		points: { type: 'number' },
	},
});

server.addSchema({
	$id: 'place',
	type: 'object',
	properties: {
		id: { $ref: 'uuid#' },
		name: { type: 'string' },
		icon: { type: 'string' },
		placeId: { type: 'string' },
		address: { type: 'string' },
		types: {
			type: 'array',
			items: { type: 'string' },
		},
		point: {
			type: 'object',
			properties: {
				type: {
					type: 'string',
					enum: ['Point'],
				},
				coordinates: {
					type: 'array',
					items: { type: 'number' },
					minItems: 2,
					maxItems: 2,
				},
			},
		},
		rating: {
			type: 'number',
			minimum: 0,
			maximum: 5,
		},
		ratings: {
			type: 'number',
			minimum: 0,
		},
		image: { type: 'string' },
		about: { type: 'string' },
	},
});

server.addSchema({
	$id: 'placeWithDistance',
	type: 'object',
	properties: {
		// @ts-expect-error - The place schema is defined above
		...server.getSchema('place').properties,
		distance: { type: 'number' },
	},
});

server.addSchema({
	$id: 'question',
	type: 'object',
	properties: {
		question: { type: 'string' },
		answers: {
			type: 'array',
			items: { type: 'string' },
		},
	},
});
