export const placeSchema = {
	description: 'Get place by id',
	tags: ['place'],
	params: {
		type: 'object',
		properties: {
			id: { type: 'string', format: 'uuid' },
		},
		required: ['id'],
	},
	response: {
		200: {
			description: 'Place retrieved successfully',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				data: { $ref: 'place#' },
			},
		},
		404: {
			description: 'Place not found',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
	},
};

export const placeClaimSchema = {
	description: 'Claim points for visitng a place',
	tags: ['place'],
	params: {
		type: 'object',
		properties: {
			id: { type: 'string', format: 'uuid' },
		},
		required: ['id'],
	},
	headers: { $ref: 'auth#' },
	response: {
		200: {
			description: 'Place claimed successfully',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
			},
		},
		400: {
			description: 'Place already claimed',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
		404: {
			description: 'Place not found',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
	},
};

export const placeSearchSchema = {
	description: 'Search for places',
	tags: ['place'],
	querystring: {
		type: 'object',
		properties: {
			lat: { type: 'number', minimum: -90, maximum: 90 },
			lng: { type: 'number', minimum: -180, maximum: 180 },
			type: {
				type: 'array',
				items: {
					type: 'string',
					enum: [
						'museum',
						'library',
						'night_club',
						'park',
						'campground',
						'art_gallery',
						'aquarium',
						'zoo',
					],
				},
				default: [],
			},
			distance: { type: 'number', minimum: 0, maximum: 50_000, default: 50_000 },
			limit: { type: 'number', minimum: 1, maximum: 50, default: 10 },
			skip: { type: 'number', minimum: 0, default: 0 },
		},
		required: ['lat', 'lng'],
	},
	response: {
		200: {
			description: 'Places retrieved successfully',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				data: {
					type: 'array',
					items: { $ref: 'placeWithDistance#' },
				},
			},
		},
	},
};
