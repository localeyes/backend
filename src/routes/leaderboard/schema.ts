export const leaderboardSchema = {
	description: 'Gets a leaderboard of the users with the most points',
	tags: ['leaderboard'],
	querystring: {
		type: 'object',
		properties: {
			limit: { type: 'number', minimum: 1, maximum: 50, default: 10 },
			skip: { type: 'number', minimum: 0, default: 0 },
		},
	},
	response: {
		200: {
			description: 'Leaderboard retrieved successfully',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				data: {
					type: 'array',
					items: { $ref: 'leaderboardUser#' },
				},
			},
		},
	},
};
