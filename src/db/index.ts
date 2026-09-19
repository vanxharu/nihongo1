import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

// Need to use .default for pg.Pool due to commonjs/esm interop issues
const Pool = pg.Pool || (pg as any).default?.Pool;

export const createPool = () => {
  const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;

  return new Pool({
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
    user: user,
    password: password,
    database: process.env.SQL_DB_NAME,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    allowExitOnIdle: false,
  });
};

export const pool = createPool();

pool.on('error', (err: any) => {
  console.warn('SQL client connection reset or idle timeout (auto-recovering):', err?.message || err);
});

export const db = drizzle(pool, { schema });

/**
 * Executes a database operation with automatic retry on transient connection drops (e.g. idle timeout, connection terminated)
 */
export async function withDbRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;
      const errMsg = err?.message || String(err);
      const isConnectionError = 
        errMsg.includes('Connection terminated') ||
        errMsg.includes('connection closed') ||
        errMsg.includes('ECONNRESET') ||
        errMsg.includes('timeout') ||
        errMsg.includes('Client has encountered a connection error');

      if (attempt <= maxRetries && isConnectionError) {
        console.warn(`[DB Retry] Retrying query after connection glitch (attempt ${attempt}/${maxRetries}):`, errMsg);
        await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
        continue;
      }
      throw err;
    }
  }
}
