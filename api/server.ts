// Runs the full Express API from server.ts as a single Vercel serverless function.
// Every /api/* route that has no dedicated file in api/ is rewritten here (see vercel.json).
//
// api/_lib/server.cjs is a bundle of server.ts. Regenerate it after editing server.ts:
//   npm run build:api
// @ts-ignore -- generated CommonJS bundle has no type declarations
import serverModule from './_lib/server.cjs';

const app = (serverModule as any).default ?? serverModule;

export default app;
