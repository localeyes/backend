import 'dotenv/config';

import cohere from 'cohere-ai';

cohere.init(process.env.COHERE_API_KEY!);

const CTX_APPEND = `---

Generate a multiple-choice question about the {location}. Keep the possible answers within a few words.
Here's the required layout along with the answer:

1. <Question placeholder>
A. <Answer A placeholder>
B. <Answer B placeholder>
C. <Answer C placeholder>
D. <Answer D placeholder>
Answer: <letter>

---
`;

const QUESTION_REGEX = /(?:\d+[.:]|Question[.:])?\s*(.*)\s+A[.:]\s+(.*)\s+B[.:] (.*)\s+C\.\s+(.*)\s+D\.\s+(.*)\s+Answer:\s+([A-D])/g;

export type Question = {
	question: string;
	answers: string[];
	correct: number;
};

export async function generate(ctx: string, name: string) {
	const result = await cohere.generate({
		model: 'command-xlarge-nightly',
		max_tokens: 100,
		temperature: 0.5,
		prompt: `${ctx.replace('{location}', name)}\n\n${CTX_APPEND}`,
		num_generations: 5,
	});

	const questions: Question[] = [];

	for (const generation of result.body.generations) {
		const match = generation.text.matchAll(QUESTION_REGEX);

		for (const m of match) {
			const [, question, a, b, c, d, answer] = m;

			questions.push({
				question,
				answers: [a, b, c, d],
				correct: answer.charCodeAt(0) - 65,
			});
		}
	}

	return questions;
}
