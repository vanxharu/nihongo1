import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { shadowingDatabase } from './shadowingStore.js';
import { fetchSourceArticle, fetchSourceList, sourceLocation, type ReadingSource, type SourceArticle } from './readingSources.js';
import { analyzeReading } from './readingAnalysis.js';
import type { LessonReadingData } from '../types.js';

const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const json = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const articleKey = (article: Pick<SourceArticle, 'url'>) => hash(article.url);
const version = 'reading-v2-original-questions';
function lessonKey(article: SourceArticle, level: string, count: number) { return hash(JSON.stringify([version, article.url, article.text, article.originalQuestionText || '', level, count])); }
export async function sourceArticles(source: ReadingSource, page = 1, force = false, tag = 'all', category = 'all') {
  const db = shadowingDatabase(); const ref = db.collection('reading_feeds').doc(`${source}-${page}-${tag}-${category}`); const previous = (await ref.get()).data();
  if (!force && previous?.items?.length && Date.now() - previous.checkedAt < 15 * 60_000) return previous;
  try {
    const items = await fetchSourceList(source, page, tag, category); const batch = db.batch();
    for (const item of items) {
      const fingerprint = hash(JSON.stringify([item.titleJp, item.date, item.text || '', item.originalQuestionText || '']));
      const old = previous?.items?.find((p: any) => p.url === item.url);
      batch.set(db.collection('reading_articles').doc(articleKey(item)), json({ summary: item, discoveredAt: Date.now(), ...(old && old.fingerprint !== fingerprint ? { preparedAt: 0, fetchedAt: 0 } : {}) }), { merge: true });
    }
    const feed = { items: json(items.map(({ text, furiganaText, rawTokens, audioMarks, ...item }) => ({ ...item, fingerprint: hash(JSON.stringify([item.titleJp, item.date, text || '', item.originalQuestionText || ''])) }))), checkedAt: Date.now(), stale: false };
    batch.set(ref, feed); await batch.commit(); return feed;
  } catch (error) { if (previous?.items?.length) return { ...previous, stale: true }; throw error; }
}
export async function sourceArticle(source: ReadingSource, id?: unknown, url?: unknown, force = false): Promise<SourceArticle> {
  const location = sourceLocation(source, id, url); const ref = shadowingDatabase().collection('reading_articles').doc(articleKey(location)); const stored = (await ref.get()).data();
  if (!force && stored?.article?.text && Date.now() - stored.fetchedAt < 6 * 60 * 60_000) return stored.article;
  const article = await fetchSourceArticle(source, location.id, location.url);
  await ref.set(json({ article, summary: { ...article, text: undefined, furiganaText: undefined, rawTokens: undefined, audioMarks: undefined }, fetchedAt: Date.now() }), { merge: true });
  return article;
}
export async function preparedReading(article: SourceArticle, level: string = article.level, count = 3): Promise<LessonReadingData> {
  const db = shadowingDatabase(); const ref = db.collection('reading_lessons').doc(lessonKey(article, level, count)); const lease = randomUUID();
  const existing = await db.runTransaction(async tx => {
    const data = (await tx.get(ref)).data(); if (data?.lesson) return data.lesson as LessonReadingData;
    if (data?.leaseUntil > Date.now()) throw new Error('READING_IN_PROGRESS');
    tx.set(ref, { lease, leaseUntil: Date.now() + 90_000, sourceUrl: article.url, level, count }, { merge: true }); return null;
  });
  if (existing) return existing;
  try {
    if (!article.text || article.text.length > 20000) throw new Error('INVALID_PASSAGE');
    const lesson = await analyzeReading(article.text, level, count, article.originalQuestions || [], article.originalQuestionText || '');
    Object.assign(lesson, { title: article.titleJp, titleVi: article.titleVi || '', sourceUrl: article.url, sourceName: article.source === 'todai' ? 'Todaii Japanese News' : 'Watanoc',
      imageUrl: article.image, audioUrl: article.audio, audioMarks: article.audioMarks || [], rawTokens: article.rawTokens || [], ...(article.furiganaText ? { furiganaPassage: article.furiganaText } : {}) });
    await db.runTransaction(async tx => { const current = (await tx.get(ref)).data(); if (current?.lease !== lease) throw new Error('LEASE_LOST'); tx.set(ref, json({ lesson, sourceUrl: article.url, level, count, createdAt: Date.now(), leaseUntil: 0 })); });
    await db.collection('reading_articles').doc(articleKey(article)).set({ preparedAt: Date.now(), questionOrigin: (lesson as any).questionOrigin, defaultLessonKey: ref.id }, { merge: true });
    return lesson;
  } catch (error) {
    await db.runTransaction(async tx => { if ((await tx.get(ref)).data()?.lease === lease) tx.set(ref, { leaseUntil: 0 }, { merge: true }); }); throw error;
  }
}
export async function sourceReadingFromUrl(url: string, level: string, count: number) {
  const parsed = new URL(url); const source = parsed.hostname === 'japanese.todaiinews.com' ? 'todai' : parsed.hostname === 'watanoc.com' ? 'watanoc' : null;
  if (!source) throw new Error('INVALID_SOURCE'); const article = await sourceArticle(source, undefined, url);
  return preparedReading(article, /^N[1-5]$/.test(level) ? level : article.level, count);
}
export function sourceListHandler(source: ReadingSource) { return async (req: Request, res: Response) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Chỉ hỗ trợ GET.' });
  try {
    const page = Math.min(20, Math.max(1, Number(req.query.page) || 1));
    const tag = /^(n[1-5]|listening)$/.test(String(req.query.tag)) ? String(req.query.tag) : 'all';
    const category = /^(meal|sightseeing|event|culture|japan-news|simplejapanese|specialtopic)$/.test(String(req.query.category)) ? String(req.query.category) : 'all';
    const feed = await sourceArticles(source, page, false, tag, category);
    const stored = await shadowingDatabase().getAll(...feed.items.map((item: SourceArticle) => shadowingDatabase().collection('reading_articles').doc(articleKey(item))));
    const articles = feed.items.map((item: SourceArticle, i: number) => {
      const data = stored[i].data(); const flags = { prepared: Boolean(data?.preparedAt), questionOrigin: data?.questionOrigin || null };
      return source === 'todai' ? { ...item, ...flags, jlptLevel: item.level } : { ...item, ...flags, rawTitle: item.titleJp, titleSub: '', hasAudio: Boolean(item.audio) };
    });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ success: true, articles, checkedAt: feed.checkedAt, stale: feed.stale });
  } catch { return res.status(502).json({ success: false, error: 'Nguồn bài đọc tạm thời không phản hồi. Hãy thử lại.' }); }
}; }
export function sourceArticleHandler(source: ReadingSource) { return async (req: Request, res: Response) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ hỗ trợ POST.' });
  try { const article = await sourceArticle(source, req.body?.id, req.body?.url); return res.json({ success: true, ...article, sourceUrl: article.url, sourceName: source === 'todai' ? 'Todaii Japanese News' : 'Watanoc' }); }
  catch (e) { return res.status(e instanceof Error && e.message === 'INVALID_SOURCE' ? 400 : 502).json({ error: 'Không thể tải bài viết. Chỉ hỗ trợ liên kết bài từ Todaii hoặc Watanoc.' }); }
}; }
export async function syncReadingCatalog(req: Request, res: Response) {
  const secret = process.env.CRON_SECRET; const supplied = req.headers.authorization || ''; const expected = `Bearer ${secret || ''}`;
  if (!secret || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();
  const db = shadowingDatabase(); const lock = db.collection('reading_jobs').doc('daily-sync'); const owner = randomUUID();
  const acquired = await db.runTransaction(async tx => { const data = (await tx.get(lock)).data(); if (data?.leaseUntil > Date.now()) return false; tx.set(lock, { owner, leaseUntil: Date.now() + 90_000 }, { merge: true }); return true; });
  if (!acquired) return res.status(202).json({ running: true });
  const started = Date.now(); const errors: string[] = []; const articles: SourceArticle[] = []; let prepared = 0;
  try {
    const feeds = await Promise.allSettled((['todai','watanoc'] as const).map(source => sourceArticles(source, 1, true)));
    feeds.forEach((result, i) => { if (result.status === 'fulfilled') articles.push(...result.value.items.slice(0,10)); else errors.push(i === 0 ? 'todai' : 'watanoc'); });
    const pending = await db.collection('reading_articles').orderBy('discoveredAt', 'desc').limit(80).get();
    const candidates = pending.docs.filter(doc => !doc.data().preparedAt).map(doc => doc.data().summary as SourceArticle);
    const ordered = candidates.sort((a,b) => b.date.localeCompare(a.date));
    const groups = (['todai','watanoc'] as const).map(source => ordered.filter(item => item.source === source));
    const queue: SourceArticle[] = [];
    for (let i=0;i<6;i++) for (const group of groups) if (group[i]) queue.push(group[i]);
    for (let i = 0; i < queue.length && prepared < 4 && Date.now() - started < 12_000; i += 2) {
      const results = await Promise.allSettled(queue.slice(i,i+2).map(async item => { const article = await sourceArticle(item.source, item.id, item.url, true); await preparedReading(article); }));
      results.forEach((result, n) => { if (result.status === 'fulfilled') prepared++; else errors.push(`${queue[i+n].source}:${queue[i+n].id}`); });
    }
    await lock.set({ owner, leaseUntil: 0, completedAt: Date.now(), imported: articles.length, prepared, errors }, { merge: true });
    return res.json({ imported: articles.length, prepared, pending: Math.max(0,candidates.length-prepared), errors });
  } catch { await lock.set({ leaseUntil: 0, failedAt: Date.now() }, { merge: true }); return res.status(503).json({ error: 'Reading sync failed' }); }
}
