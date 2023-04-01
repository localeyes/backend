export const loginSchema = {
	description: 'Logs in to the specified account',
	tags: ['auth'],
	body: {
		type: 'object',
		properties: {
			username: { type: 'string' },
			password: { type: 'string' },
			token: { type: 'string' },
		},
		required: ['username', 'password', 'token'],
	},
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				data: { type: 'string' },
			},
		},
		401: {
			description: 'Authentication error',
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

export const registerSchema = {
	description: 'Registers a new account',
	tags: ['auth'],
	body: {
		type: 'object',
		properties: {
			username: { type: 'string' },
			email: { type: 'string' },
			password: { type: 'string' },
		},
		required: ['username', 'email', 'password'],
	},
	response: {
		201: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				data: { type: 'string' },
			},
		},
		400: {
			description: 'Email or username already taken, or invalid email address',
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
