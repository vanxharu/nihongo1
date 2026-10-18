import { test } from 'node:test';import assert from 'node:assert/strict';
import { loadReadingImage } from '../src/server/readingImage';
import { readingImageUrl } from '../src/utils/readingImage';
const source = 'https://jp-admin.todaiinews.com/images/news/1791776468.jpeg';
test('Todaii images use the same origin including HTTP and protocol-relative legacy URLs', () => {
  for (const url of [source, source.replace('https:', 'http:'), source.replace('https:', '')]) assert.equal(readingImageUrl(url), `/api/reading/image?url=${encodeURIComponent(source)}`);
  assert.equal(readingImageUrl('https://watanoc.com/test.jpg'), 'https://watanoc.com/test.jpg');
});
test('image proxy accepts image bytes and forbids arbitrary hosts, paths and HTML', async () => {
  let calls = 0;
  const fetcher = async (_url: any, options: any) => { calls++; assert.equal(options.redirect,'error'); return new Response(new Uint8Array([255,216,255]), {headers:{'content-type':'image/jpeg'}}); };
  const result = await loadReadingImage(source, fetcher as any); assert.equal(result.mime,'image/jpeg'); assert.equal(result.body.length,3);
  for (const url of ['http://127.0.0.1/test.jpg','https://jp-admin.todaiinews.com.attacker.test/images/news/a.jpg','https://jp-admin.todaiinews.com/admin','https://user@jp-admin.todaiinews.com/images/news/a.jpg']) await assert.rejects(loadReadingImage(url, fetcher as any));
  assert.equal(calls,1);
  await assert.rejects(loadReadingImage(source, (async()=>new Response('<html>blocked</html>',{headers:{'content-type':'text/html'}})) as any));
  await assert.rejects(loadReadingImage(source, (async()=>new Response('x',{headers:{'content-type':'image/jpeg','content-length':String(7*1024*1024)}})) as any));
});
