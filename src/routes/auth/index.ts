import { randomUUID } from 'node:crypto';

import { Database } from '$/database';
import { server } from '$/server';
import { createPasswordHash } from '$/util/crypto';

import { loginSchema, registerSchema } from './schema';
import { LoginSchemaBody, RegisterSchema } from './types';

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateEmail(email: string) {
	return EMAIL_REGEX.test(email);
}

server.post<{
	Body: LoginSchemaBody
}>('/auth/login', { schema: loginSchema }, async (request, response) => {
	const user = await Database.user.findOne({
		$or: [
			{
				username: request.body.username,
			},
			{
				email: request.body.username,
			},
		],
	}, {
		projection: {
			email: true,
			password: true,
			id: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid username or password.',
	});

	const hash = createPasswordHash(request.body.password, user.email);

	if (user.password !== hash) return response.status(401).send({
		success: false,
		message: 'Invalid username or password.',
	});

	const token = server.jwt.sign({
		id: user.id,
	});

	return {
		success: true,
		data: token,
	};
});

server.post<{
	Body: RegisterSchema;
}>('/auth/register', { schema: registerSchema }, async (request, response) => {
	if (!validateEmail(request.body.email)) return response.status(400).send({
		success: false,
		message: 'Invalid email address.',
	});

	const hash = createPasswordHash(request.body.password, request.body.email.toLowerCase());

	try {
		const uuid = randomUUID();

		await Database.user.insertOne({
			id: uuid,
			username: request.body.username.toLowerCase(),
			email: request.body.email.toLowerCase(),
			password: hash,
			points: 0,
		});

		const token = server.jwt.sign({
			id: uuid,
		});

		return response.status(201).send({
			success: true,
			data: token,
		});
	} catch {
		return response.status(400).send({
			message: 'Email or username is already in use.',
			success: false,
		});
	}
});
