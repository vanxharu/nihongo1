import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const auth: any = { currentUser: null };
(globalThis as any).__pdfTestAuth = auth;
const output = 'node_modules/.cache/cloud-pdf-session-test.cjs';
fs.mkdirSync('node_modules/.cache', { recursive: true });
await build({
  entryPoints: ['src/utils/cloudPdf.ts'], outfile: output, bundle: true,
  platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'firebase-auth-fixture', setup(builder) {
    builder.onResolve({ filter: /lib\/firebase$/ }, () => ({ path: 'auth', namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const auth = globalThis.__pdfTestAuth;' }));
  } }]
});
const api = createRequire(import.meta.url)('../' + output);
const record = { id: 'pdf_test', ownerUid: 'owner-a', fileDataUrl: 'data:application/pdf;base64,JVBER' + 'a'.repeat(200000) };
const user = (uid: string) => ({ uid, getIdToken: async () => uid + '-token' });

test('PDF upload stops at account change instead of sending remaining parts as the new user', async () => {
  const original = globalThis.fetch; const calls: any[] = [];
  auth.currentUser = user('owner-a');
  globalThis.fetch = (async (_url: any, options: any) => {
    calls.push({ body: JSON.parse(options.body), token: options.headers.Authorization });
    auth.currentUser = user('owner-b');
    return new Response('{}');
  }) as any;
  try {
    await assert.rejects(api.uploadCloudPdf(record), /Tài khoản đã thay đổi/);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].body.action, 'begin');
    assert.equal(calls[0].token, 'Bearer owner-a-token');
    await assert.rejects(api.uploadCloudPdf(record), /Tài khoản đã thay đổi/);
    assert.equal(calls.length, 1);
  } finally { globalThis.fetch = original; }
});

test('logout while waiting for a token cancels PDF requests', async () => {
  const original = globalThis.fetch; let calls = 0;
  auth.currentUser = { uid: 'owner-a', getIdToken: async () => { auth.currentUser = null; return 'old-token'; } };
  globalThis.fetch = (async () => { calls++; return new Response('{}'); }) as any;
  try {
    await assert.rejects(api.deleteCloudPdf('pdf_test', 'owner-a'), /Tài khoản đã thay đổi/);
    assert.equal(calls, 0);
  } finally { globalThis.fetch = original; }
});

test('late PDF list and chunk responses cannot return previous user data after switching', async () => {
  const original = globalThis.fetch;
  const response = (packet: unknown) => ({ ok: true, json: async () => { auth.currentUser = user('owner-b'); return packet; } });
  try {
    auth.currentUser = user('owner-a');
    globalThis.fetch = (async () => response({ files: [record] })) as any;
    await assert.rejects(api.cloudPdfMetadata('owner-a'), /Tài khoản đã thay đổi/);
    auth.currentUser = user('owner-a');
    globalThis.fetch = (async () => response({ count: 2, data: 'private' })) as any;
    await assert.rejects(api.downloadCloudPdf(record, 'owner-a'), /Tài khoản đã thay đổi/);
  } finally { globalThis.fetch = original; }
});

test('multi-part PDF upload and download complete for the initiating owner', async () => {
  const original = globalThis.fetch; const actions: string[] = []; const parts: string[] = [];
  auth.currentUser = user('owner-a');
  globalThis.fetch = (async (url: any, options: any) => {
    assert.equal(options.headers.Authorization, 'Bearer owner-a-token');
    if (options.method === 'POST') {
      const body = JSON.parse(options.body); actions.push(body.action);
      if (body.action === 'part') parts.push(body.data);
      return new Response('{}');
    }
    const index = Number(new URL(url, 'https://fixture.test').searchParams.get('index'));
    return new Response(JSON.stringify({ count: parts.length, data: parts[index] }));
  }) as any;
  try {
    await api.uploadCloudPdf(record);
    assert.deepEqual(actions, ['begin', 'part', 'part', 'commit']);
    assert.equal((await api.downloadCloudPdf(record, 'owner-a')).fileDataUrl, record.fileDataUrl);
  } finally { globalThis.fetch = original; }
});
