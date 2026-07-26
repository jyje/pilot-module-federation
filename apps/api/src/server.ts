import { createApi } from './app';

const app = await createApi();
await app.listen({ host: '127.0.0.1', port: 8787 });
