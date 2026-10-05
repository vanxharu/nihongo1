// Runs the full Express API from server.ts as a single Vercel serverless function.
// Every /api/* route that has no dedicated file in api/ is rewritten here (see vercel.json).
//
// api/_lib/server.cjs is a bundle of server.ts. Regenerate it after editing server.ts:
//   npm run build:api
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import type { IncomingMessage, ServerResponse } from 'http';

const require = createRequire(import.meta.url);

let appHandler: ((req: IncomingMessage, res: ServerResponse) => void) | null = null;
let loadError: Error | null = null;

try {
  const serverModule = require('./_lib/server.cjs');
  const app = serverModule.default ?? serverModule;
  appHandler = app;
  console.log('[api/server] server.cjs loaded OK, handler type:', typeof appHandler);
} catch (err: any) {
  loadError = err;
  console.error('[api/server] Failed to load server.cjs:', err?.message, err?.stack?.split('\n').slice(0,4).join('\n'));
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (loadError || !appHandler) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Server failed to initialize',
      message: loadError?.message ?? 'No handler loaded',
      stack: loadError?.stack?.split('\n').slice(0, 5).join('\n'),
    }));
    return;
  }
  appHandler(req, res);
}
