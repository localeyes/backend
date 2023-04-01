import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import axios from 'axios';

import { Database } from '$/database';

type Place = {
	geometry: {
		location: {
			lat: number;
			lng: number;
		}
	};
	icon: string;
	name: string;
	place_id: string;
	types: string[];
	vicinity: string;
	rating: number;
	user_ratings_total: number;
}

async function addPlaces(type: string, location: string, next?: string) {
	const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
		params: {
			key: process.env.MAPS_API_KEY,
			location,
			type,
			radius: 50_000,
			pagetoken: next,
		},
	});

	const places = response.data.results as Place[];

	console.log(`Adding ${places.length} ${type} places...`);
	console.log(places.map(place => place.name).join(', '));

	for (const place of places) {
		await Database.place.updateOne({
			placeId: place.place_id,
		}, {
			$set: {
				rating: place.rating,
				ratings: place.user_ratings_total,
			},
			$setOnInsert: {
				id: randomUUID(),
				placeId: place.place_id,
				name: place.name,
				icon: place.icon,
				address: place.vicinity,
				types: place.types,
				point: {
					type: 'Point',
					coordinates: [
						place.geometry.location.lng,
						place.geometry.location.lat,
					],
				},
			},
		}, {
			upsert: true,
		});
	}

	return response.data.next_page_token;
}

export async function populate() {
	const types = [
		'museum',
		'library',
		'night_club',
		'park',
		'campground',
		'art_gallery',
		'aquarium',
		'zoo',
		'amusement_park',
		'florist',
		'tourist_attraction',
		'bowling_alley',
		'spa',
	];

	const locations = [
		// Ottawa
		'45.2502975,-76.0804392',
		// Toronto
		'43.7181557,-79.5181437',
	];

	for (const type of types) {
		for (const location of locations) {
			let next = await addPlaces(type, location);

			while (next) {
				next = await addPlaces(type, location, next);
			}
		}
	}
}

populate();
