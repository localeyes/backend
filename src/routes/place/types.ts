export type PlaceSearchQuery = {
	lat: number;
	lng: number;
	limit: number;
	skip: number;
	type: string[];
	distance: number;
}

export type PlaceParams = {
	id: string;
}
