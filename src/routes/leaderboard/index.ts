import { Database } from '$/database';
import { server } from '$/server';

import { leaderboardSchema } from './schema';
import { LeaderboardQuerySchema } from './types';

server.get<{
	Querystring: LeaderboardQuerySchema,
}>('/leaderboard', {
	schema: leaderboardSchema,
}, async request => {
	const leaderboard = await Database.user.aggregate([
		{
			$project: {
				_id: false,
				id: true,
				username: true,
				points: true,
			},
		},
		{
			$sort: {
				points: -1,
			},
		},
		{
			$skip: request.query.skip,
		},
		{
			$limit: request.query.limit,
		},
	]).toArray();

	return {
		success: true,
		data: leaderboard,
	};
});
