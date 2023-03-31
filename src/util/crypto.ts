import { createHmac } from 'node:crypto';

export function createPasswordHash(password: string, email: string) {
	return createHmac('sha512', email).update(password).digest('hex').toString();
}
