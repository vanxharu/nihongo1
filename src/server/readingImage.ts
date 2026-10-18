import type { Request, Response } from 'express';
const LIMIT = 6 * 1024 * 1024;
export async function loadReadingImage(value: unknown, fetcher: typeof fetch = fetch) {
  if (typeof value !== 'string') throw new Error('INVALID_IMAGE');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'jp-admin.todaiinews.com' || url.port || url.username || url.password ||
    !/^\/images\/news\/[\w.-]+\.(?:jpe?g|png|webp|gif|avif)$/i.test(url.pathname) || url.search || url.hash) throw new Error('INVALID_IMAGE');
  const response = await fetcher(url, { redirect: 'error', signal: AbortSignal.timeout(12000), headers: { Accept: 'image/avif,image/webp,image/*' } });
  const mime = (response.headers.get('content-type') || '').split(';')[0].trim();
  if (!response.ok || !/^image\/(jpeg|png|webp|gif|avif)$/.test(mime) || Number(response.headers.get('content-length')) > LIMIT || !response.body) throw new Error('IMAGE_UNAVAILABLE');
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const part = await reader.read(); if (part.done) break;
      size += part.value.length;
      if (size > LIMIT) throw new Error('IMAGE_UNAVAILABLE');
      chunks.push(part.value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  if (!size) throw new Error('IMAGE_UNAVAILABLE');
  return { mime, body: Buffer.concat(chunks) };
}
export async function readingImageHandler(req: Request, res: Response) {
  try {
    const image = await loadReadingImage(req.query.url);
    res.setHeader('Content-Type', image.mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.send(image.body);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(e instanceof Error && (e.message === 'INVALID_IMAGE' || e instanceof TypeError) ? 400 : 502).json({ error: 'Không tải được ảnh bài đọc.' });
  }
}
