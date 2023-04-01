import '$/routes';
import '$/schema';

import { server } from '$/server';

const url = await server.listen({
	port: 8089,
	host: '0.0.0.0',
});

console.log(`Server listening on ${url}`);
