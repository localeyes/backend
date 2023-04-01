export type PlaceSearchQuery = {
	lat: number;
	lng: number;
	limit: number;
	skip: number;
	type: string[];
	distance: number;
}

export type PlaceParams = {
	placeId: string;
}

export type QuestionParams = {
	questionId: string;
}

export type PlaceQuestionBodySchema = number[];
