import { Database } from '$/database';
import { server } from '$/server';

import { placeClaimSchema, placeSchema, placeSearchSchema } from './schema';
import { PlaceParams, PlaceSearchQuery } from './types';

server.get<{
	Params: PlaceParams;
}>('/place/:id', {
	schema: placeSchema,
}, async (request, reply) => {
	const place = await Database.place.findOne({
		id: request.params.id,
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
}>('/place/:id/claim', {
	schema: placeClaimSchema,
	preHandler: [server.auth],
}, async (request, reply) => {
	const place = await Database.place.countDocuments({
		id: request.params.id,
	});

	if (place === 0) return reply.status(404).send({
		success: false,
		message: 'Place not found.',
	});

	const updated = await Database.user.updateOne({
		id: request.user.id,
		places: {
			$ne: request.params.id,
		},
	}, {
		$addToSet: {
			places: request.params.id,
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
