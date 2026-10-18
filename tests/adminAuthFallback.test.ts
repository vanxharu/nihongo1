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

test('a Firebase profile outage never reports a fake successful account sync', async () => {
  const warning=console.error;console.error=()=>{};
  try {
    for (const identity of [
      {uid:'owner',email:'vanvan20001220@gmail.com',email_verified:true},
      {uid:'user',email:'someone@gmail.com',email_verified:true},
    ]) {
      const req:any={headers:{authorization:`Bearer ${JSON.stringify(identity)}`}};
      let status=200,advanced=false;
      const res:any={status(code:number){status=code;return this;},json(){return this;}};
      await requireAuth(req,res,()=>{advanced=true;});
      assert.equal(status,503);assert.equal(advanced,false);assert.equal(req.dbUser,undefined);
    }
    let status=200,advanced=false;const res:any={status(code:number){status=code;return this;},json(){return this;}};
    await requireAuth({headers:{authorization:'Bearer invalid'}},res,()=>{advanced=true;});
    assert.equal(status,401);assert.equal(advanced,false);
  } finally {console.error=warning;}
});
