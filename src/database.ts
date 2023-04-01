import 'dotenv/config';

import { type Collection, type Db, MongoClient } from 'mongodb';

export type Place = {
	id: string;
	name: string;
	icon: string;
	address: string;
	placeId: string;
	point: {
		type: 'Point';
		coordinates: [number, number];
	};
	types: string[];
	about: string;
	image: string;
};

export type User = {
	id: string;
	username: string;
	email: string;
	// SHA512 hash of the password
	password: string;
	points: number;
}

export type Question = {
	id: string;
	answers: number[];
}

export class Database {
	public static client: MongoClient;
	public static db: Db;

	public static async connect(): Promise<void> {
		this.client = await MongoClient.connect(process.env.MONGO_URI!);
		this.db = this.client.db('geohunt');

		await Promise.allSettled([
			this.place.createIndex({ point: '2dsphere' }),
			this.user.createIndex({ email: 'text' }, {
				unique: true,
			}),
			this.user.createIndex({ username: 'text' }, {
				unique: true,
			}),
			this.user.createIndex({ id: 'text' }, {
				unique: true,
			}),
		]);
	}

	public static async disconnect(): Promise<void> {
		await this.client.close();
	}

	public static get place(): Collection<Place> {
		return this.db.collection('places');
	}

	public static get user(): Collection<User> {
		return this.db.collection('users');
	}

	public static get question(): Collection<Question> {
		return this.db.collection('questions');
	}
}

await Database.connect();
