import { randomUUID } from 'node:crypto';

import { Database } from '$/database';
import { server } from '$/server';
import { generate } from '$/util/cohere';

import { placeClaimSchema, placeQuestionGetSchema, placeQuestionPostSchema, placeSchema, placeSearchSchema } from './schema';
import { PlaceParams, PlaceQuestionBodySchema, PlaceSearchQuery, QuestionParams } from './types';

type User = {
	id: string;
}

function parseJwt(token: string): User | null {
	try {
		return server.jwt.verify(token.slice(7)) as User;
	} catch {
		return null;
	}
}

server.get<{
	Params: PlaceParams;
}>('/place/:placeId', {
	schema: placeSchema,
}, async (request, reply) => {
	const place = await Database.place.findOne({
		id: request.params.placeId,
	}, {
		projection: {
			_id: false,
		},
	});

	if (place === null) return reply.status(404).send({
		success: false,
		message: 'Place not found.',
	});

	return {
		success: true,
		data: place,
	};
});

server.get<{
	Params: PlaceParams;
}>('/place/:placeId/claim', {
	schema: placeClaimSchema,
	preHandler: [server.auth],
}, async (request, reply) => {
	const place = await Database.place.countDocuments({
		id: request.params.placeId,
	});

	if (place === 0) return reply.status(404).send({
		success: false,
		message: 'Place not found.',
	});

	const updated = await Database.user.updateOne({
		id: request.user.id,
		places: {
			$ne: request.params.placeId,
		},
	}, {
		$addToSet: {
			places: request.params.placeId,
		},
		$inc: {
			points: 1,
		},
	});

	if (updated.modifiedCount === 1) return {
		success: true,
	};

	return reply.status(400).send({
		success: false,
		message: 'Place already claimed.',
	});
});

server.post<{
	Params: PlaceParams & QuestionParams;
	Body: PlaceQuestionBodySchema;
}>('/place/:placeId/questions/:questionId', {
	schema: placeQuestionPostSchema,
}, async (request, reply) => {
	const place = await Database.place.findOne({
		id: request.params.placeId,
	}, {
		projection: {
			about: true,
		},
	});

	if (place === null) return reply.status(404).send({
		success: false,
		message: 'Place not found.',
	});

	const question = await Database.question.findOneAndDelete({
		id: request.params.questionId,
	});

	if (question.value === null) return reply.status(404).send({
		success: false,
		message: 'Question not found.',
	});

	const user = request.headers.authorization
		? parseJwt(request.headers.authorization)
		: null;

	let points = 0;

	const correct = request.body.map((answer, index) => {
		if (question.value!.answers[index] === answer) {
			points++;
		}

		return question.value!.answers[index];
	});

	if (correct.length && user) {
		await Database.user.updateOne({
			id: user.id,
			places: {
				$ne: request.params.placeId,
			},
		}, {
			$addToSet: {
				places: request.params.placeId,
			},
			$inc: {
				points,
			},
		});
	}

	return {
		success: true,
		data: correct,
	};
});

server.get<{
	Params: PlaceParams;
}>('/place/:placeId/questions', {
	schema: placeQuestionGetSchema,
}, async (request, reply) => {
	const place = await Database.place.findOne({
		id: request.params.placeId,
	}, {
		projection: {
			about: true,
			name: true,
		},
	});

	if (place === null) return reply.status(404).send({
		success: false,
		message: 'Place not found.',
	});

	const questions = await generate(place.about, place.name);
	const id = randomUUID();

	await Database.question.insertOne({
		id,
		answers: questions.map(q => q.correct),
	});

	return {
		success: true,
		data: {
			id,
			questions: questions.map(q => ({
				question: q.question,
				answers: q.answers,
			})),
		},
	};
});

server.get<{
	Querystring: PlaceSearchQuery;
}>('/place/search', {
	schema: placeSearchSchema,
}, async request => {
	const places = await Database.place.aggregate([
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [request.query.lng, request.query.lat],
				},
				distanceField: 'distance',
				maxDistance: request.query.distance,
				spherical: true,
				query: {
					types: request.query.type.length ? {
						$in: request.query.type,
					} : undefined,
					ratings: request.query.type.includes('wheelchair') ? {
						$gte: 100,
					} : undefined,
					rating: request.query.type.includes('wheelchair') ? {
						$gte: 4,
					} : undefined,
				},
			},
		},
		{
			$skip: request.query.skip,
		},
		{
			$limit: request.query.limit,
		},
		{
			$project: {
				_id: false,
			},
		},
	], {
		ignoreUndefined: true,
	}).toArray();

	return {
		success: true,
		data: places,
	};
});
