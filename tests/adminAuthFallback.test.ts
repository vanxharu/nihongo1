import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

// Exercise the real middleware with only its external identity/database services stubbed.
const output = await build({
  entryPoints: ['src/middleware/auth.ts'], bundle: true, write: false, platform: 'node', format: 'esm',
  plugins: [{ name: 'auth-services', setup(b) {
    b.onResolve({ filter: /lib\/firebase-admin$/ }, () => ({ path: 'firebase', namespace: 'stub' }));
    b.onResolve({ filter: /db\/users$/ }, () => ({ path: 'users', namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ contents: args.path === 'firebase'
      ? `export const adminAuth = { async verifyIdToken(token) { if(token === 'invalid') throw Error('Invalid'); return JSON.parse(token); } };`
      : `export async function getOrCreateUser() { throw Error('Database unavailable'); }`, loader: 'js' }));
  } }],
});
const { requireAuth, requireAdmin } = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);

test('DB outage retains admin only for the exact verified allowlisted identity', async () => {
  const previous = process.env.ADMIN_EMAILS;
  const warning = console.warn;
  process.env.ADMIN_EMAILS = 'vanvan20001220@gmail.com';
  console.warn = () => {};
  try {
    for (const [email, verified, expected] of [
      ['vanvan20001220@gmail.com', true, 'admin'],
      ['VANVAN20001220@gmail.com', true, 'admin'],
      ['vanvan20001220@gmail.com', false, 'user'],
      ['someone@gmail.com', true, 'user'],
      ['vanvan20001220@gmail.com.attacker.test', true, 'user'],
    ] as const) {
      const req: any = { headers: { authorization: `Bearer ${JSON.stringify({ uid: 'test', email, email_verified: verified })}` }, body: { role: 'admin' } };
      let status = 200, advanced = false;
      const res: any = { status(code: number) { status = code; return this; }, json() { return this; } };
      await requireAuth(req, res, () => { advanced = true; });
      assert(advanced); assert.equal(req.dbUser.role, expected);
      let allowed = false;
      await requireAdmin(req, res, () => { allowed = true; });
      assert.equal(allowed, expected === 'admin');
      assert.equal(status, expected === 'admin' ? 200 : 403);
    }
    let reached = false, status = 200;
    const res: any = { status(code: number) { status = code; return this; }, json() {} };
    await requireAuth({ headers: { authorization: 'Bearer invalid' } }, res, () => { reached = true; });
    assert.equal(status, 401); assert.equal(reached, false);
  } finally {
    console.warn = warning;
    if (previous === undefined) delete process.env.ADMIN_EMAILS; else process.env.ADMIN_EMAILS = previous;
  }
});
