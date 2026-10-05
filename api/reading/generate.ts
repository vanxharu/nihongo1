import type { Request, Response } from 'express';
import { analyzeReading } from '../../src/server/readingAnalysis.js';
import { sourceReadingFromUrl } from '../../src/server/readingCatalog.js';
export default async function generateReading(req: Request, res: Response) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ hỗ trợ POST.' });
  const body = req.body || {}; const input = body.customPassage || body.pastedText || body.text;
  if (typeof input !== 'string' || input.trim().length < 20 || input.length > 20000) return res.status(400).json({ error: 'Nhập bài đọc từ 20 đến 20.000 ký tự.' });
  const count = Math.min(6,Math.max(2,Number(body.questionCount)||3)); const level = /^N[1-5]$/.test(body.level) ? body.level : 'auto';
  try {
    const data = body.sourceUrl ? await sourceReadingFromUrl(body.sourceUrl, level, count) : await analyzeReading(input.trim(),level,count);
    return res.json(data);
  } catch(e) { return res.status(e instanceof Error && e.message === 'INVALID_SOURCE' ? 400 : 503).json({ error: e instanceof Error && e.message === 'READING_IN_PROGRESS' ? 'Bài đang được chuẩn bị. Hãy mở lại sau ít phút.' : 'Chưa thể phân tích bài đọc. Hãy thử lại sau ít phút.' }); }
}
