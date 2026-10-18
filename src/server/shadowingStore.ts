import type { Request, Response } from 'express';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { SHADOWING_VIDEOS } from '../data/shadowingVideos.js';
import { normalizeShadowingTimeline, validShadowingTimings } from '../utils/shadowing.js';
import type { ShadowingCue, ShadowingAnalysis } from '../utils/shadowing.js';
import { shadowingAnalyzeBatch } from './shadowing.js';

export function shadowingDatabase() {
  const name = 'shadowing-storage';
  let app = getApps().find(a => a.name === name);
  if (!app) {
    const account = process.env.SHADOWING_FIREBASE_SERVICE_ACCOUNT;
    if (!account) throw new Error('DATABASE_NOT_CONFIGURED');
    app = initializeApp({ credential: cert(JSON.parse(account)), projectId: 'nihongo-fd01e' }, name);
  }
  return getFirestore(app);
}

export async function shadowingOwner(req: Request) {
  const token = req.headers.authorization?.replace(/^Bearer /, '');
  if (!token) throw new Error('AUTH_REQUIRED');
  let app = getApps().find(a => a.name === 'shadowing-auth');
  if (!app) app = initializeApp({ projectId: 'nihongo-fd01e' }, 'shadowing-auth');
  try { return (await getAuth(app).verifyIdToken(token)).uid; }
  catch { throw new Error('AUTH_REQUIRED'); }
}

export function validateStoredCues(value: unknown): ShadowingCue[] {
  if (!Array.isArray(value) || !value.length || value.length > 500) throw new Error('INVALID_CUES');
  const ids = new Set<string>();
  const cues = value.map((c: any) => {
    if (!c || typeof c.id !== 'string' || !/^[\w-]{1,80}$/.test(c.id) || ids.has(c.id) || typeof c.text !== 'string' || !c.text.trim() || c.text.length > 1000 ||
      !Number.isFinite(c.start) || !Number.isFinite(c.end) || c.start < 0 || c.end <= c.start || c.end > 86400) throw new Error('INVALID_CUES');
    ids.add(c.id);
    const cue: ShadowingCue = { id: c.id, text: c.text, start: c.start, end: c.end };
    if (c.timings && validShadowingTimings(c)) cue.timings = c.timings;
    if (typeof c.translation === 'string' && c.translation.length <= 4000) cue.translation = c.translation;
    if (Array.isArray(c.readings) && c.readings.length <= 100 && c.readings.every((r: any) => r && typeof r.word === 'string' && c.text.includes(r.word) && typeof r.reading === 'string' && r.reading.length <= 100)) cue.readings = c.readings;
    return cue;
  });
  return normalizeShadowingTimeline(cues);
}

export async function writeVideo(ref: FirebaseFirestore.DocumentReference, title: string, cues: ShadowingCue[], revision?: string | null, sentenceVersion?: string) {
  const database = ref.firestore;
  const nextRevision = crypto.randomUUID();
  await database.runTransaction(async tx => {
    const previous = await tx.get(ref);
    if (revision !== undefined && (previous.data()?.revision || null) !== revision) throw new Error('REVISION_CONFLICT');
    const chunks = Array.from({ length: Math.ceil(cues.length / 50) }, (_, i) => cues.slice(i * 50, (i + 1) * 50));
    chunks.forEach((items, i) => tx.set(ref.collection('captions').doc(`${nextRevision}-${i}`), { cues: items }));
    // Readers follow a single revision, so partial updates never mix caption versions.
    tx.set(ref, { title, videoId: ref.id, revision: nextRevision, chunkCount: chunks.length, cueCount: cues.length, updatedAt: new Date().toISOString(), ...(sentenceVersion ? { sentenceVersion } : {}) });
    if (previous.exists) for (let i = 0; i < (previous.data()?.chunkCount || 0); i++) tx.delete(ref.collection('captions').doc(`${previous.data()!.revision}-${i}`));
  });
  return nextRevision;
}

/** Deploy trusted catalog corrections once; request data never controls these writes. */
async function preparedCatalogVideo(database: FirebaseFirestore.Firestore, id: string) {
  const ref = database.collection('shadowing_videos').doc(id);
  const existing = await readVideo(ref);
  if (!SHADOWING_VIDEOS.some(video => video.youtube_video_id === id)) return existing;
  const version = '2026-10-04-v1';
  if (existing?.sentenceVersion === version) return existing;
  let source: string;
  try { source = await readFile(path.join(process.cwd(), 'public', 'shadowing-prepared', `${id}.json`), 'utf8'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return existing; throw error; }
  const packet = JSON.parse(source);
  if (packet.videoId !== id || packet.sentenceVersion !== version || typeof packet.title !== 'string') throw new Error('INVALID_PREPARED_CATALOG');
  const cues = validateStoredCues(packet.cues);
  if (cues.some(cue => !cue.translation || !Array.isArray(cue.readings))) throw new Error('INCOMPLETE_PREPARED_CATALOG');
  try { await writeVideo(ref, packet.title, cues, existing?.revision || null, version); }
  catch (error) { if (!(error instanceof Error) || error.message !== 'REVISION_CONFLICT') throw error; }
  return readVideo(ref);
}

export async function readVideo(ref: FirebaseFirestore.DocumentReference): Promise<(FirebaseFirestore.DocumentData & { cues: ShadowingCue[] }) | null> {
  return ref.firestore.runTransaction(async tx => {
  const info = await tx.get(ref);
  if (!info.exists) return null;
  const data = info.data()!;
  if (!Number.isInteger(data.chunkCount) || data.chunkCount < 1 || data.chunkCount > 10) throw new Error('INVALID_STORED_VIDEO');
  const chunks = await tx.getAll(...Array.from({ length: data.chunkCount }, (_, i) => ref.collection('captions').doc(`${data.revision}-${i}`)));
  if (chunks.some(c => !c.exists)) throw new Error('INCOMPLETE_STORED_VIDEO');
  return { ...data, cues: validateStoredCues(chunks.flatMap(c => c.data()!.cues)) };
  }, { readOnly: true });
}

export async function shadowingVideo(req: Request, res: Response) {
  try {
    if (req.method === 'GET') {
      const id = req.query.videoId;
      let uid: string | null = null;
      if (req.headers.authorization) uid = await shadowingOwner(req);
      if (!id && !uid) throw new Error('AUTH_REQUIRED');
      const database = shadowingDatabase();
      if (!id) {
        if (!uid) throw new Error('AUTH_REQUIRED');
        const videos = await database.collection('shadowing_users').doc(uid).collection('videos').limit(100).get();
        return res.json({ videos: videos.docs.map(d => d.data()) });
      }
      if (typeof id !== 'string' || !/^[\w-]{11}$/.test(id)) return res.status(400).json({ error: 'Link video không hợp lệ.' });
      let video = uid ? await readVideo(database.collection('shadowing_users').doc(uid).collection('videos').doc(id)) : null;
      const personal = !!video;
      video ||= await preparedCatalogVideo(database, id);
      res.setHeader('Cache-Control', uid ? 'private, no-store' : 'public, max-age=60');
      return video ? res.json({ ...video, personal }) : res.status(404).json({ error: 'Video chưa có phụ đề được lưu.' });
    }
    if (req.method === 'POST') {
      const uid = await shadowingOwner(req);
      const { videoId, title, cues, revision } = req.body || {};
      if (!/^[\w-]{11}$/.test(videoId || '') || typeof title !== 'string' || !title.trim() || title.length > 200 || !(revision === null || typeof revision === 'string')) return res.status(400).json({ error: 'Thông tin video chưa hợp lệ.' });
      const validated = validateStoredCues(cues);
      const database = shadowingDatabase();
      const ref = database.collection('shadowing_users').doc(uid).collection('videos').doc(videoId);
      const saved = await writeVideo(ref, title, validated, revision);
      return res.json({ videoId, revision: saved, cueCount: validated.length });
    }
    res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Phương thức không hỗ trợ.' });
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    if (message === 'AUTH_REQUIRED') return res.status(401).json({ error: 'Đăng nhập để lưu phụ đề của bạn.' });
    if (message === 'INVALID_CUES') return res.status(400).json({ error: 'Phụ đề cần câu tiếng Nhật và mốc bắt đầu/kết thúc hợp lệ.' });
    if (message === 'REVISION_CONFLICT') return res.status(409).json({ error: 'Phụ đề đã thay đổi trên thiết bị khác. Hãy tải lại trước khi lưu.' });
    return res.status(503).json({ error: 'Database phụ đề tạm thời chưa khả dụng.' });
  }
}

/** Admin-authorized catalog update. Fetches Japanese captions and persists Claude analysis by batch. */
export async function shadowingRefreshAnalysis(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ hỗ trợ POST.' });
  try {
    const uid = await shadowingOwner(req);
    const adminUids = (process.env.SHADOWING_ADMIN_UIDS || '').split(',').map(x => x.trim()).filter(Boolean);
    if (!adminUids.includes(uid)) return res.status(403).json({ error: 'Chỉ quản trị viên được cập nhật dữ liệu chung.' });
    const { videoId, offset = 0 } = req.body || {};
    if (typeof videoId !== 'string' || !SHADOWING_VIDEOS.some(v => v.youtube_video_id === videoId) || !Number.isInteger(offset) || offset < 0) return res.status(400).json({ error: 'Video hoặc vị trí không hợp lệ.' });
    const db = shadowingDatabase();
    const videoRef = db.collection('shadowing_videos').doc(videoId);
    let video = await readVideo(videoRef);
    if (!video) {
      const base = process.env.SHADOWING_PUBLIC_BASE_URL || `https://${req.headers.host}`;
      const response = await fetch(`${base}/api/shadowing/transcript?videoId=${videoId}`, { signal: AbortSignal.timeout(25000) });
      if (!response.ok) return res.status(422).json({ error: 'Không thể tải phụ đề tiếng Nhật từ YouTube. Hãy kiểm tra nguồn SRT.' });
      const data: any = await response.json();
      const cues = validateStoredCues(data.cues);
      await writeVideo(videoRef, SHADOWING_VIDEOS.find(v => v.youtube_video_id === videoId)?.title || videoId, cues, null);
      video = await readVideo(videoRef);
    }
    if (!video) throw new Error('NO_CAPTIONS');
    const cues = video.cues;
    const end = Math.min(offset + 5, cues.length);
    if (offset >= cues.length) return res.json({ done: true, total: cues.length });
    const items = await shadowingAnalyzeBatch(cues.slice(offset, end));
    const batch = db.batch();
    for (let i = offset; i < end; i++) {
      const analysis = items.get(i - offset)!;
      batch.set(videoRef.collection('analysis').doc(String(i)), { text: cues[i].text, analysis, updatedAt: new Date().toISOString() });
    }
    await batch.commit();
    return res.json({ done: end >= cues.length, nextOffset: end, total: cues.length });
  } catch (error) {
    return res.status(503).json({ error: error instanceof Error ? error.message : 'Không thể cập nhật phụ đề.' });
  }
}

export async function shadowingReadAnalysis(req: Request, res: Response) {
  const videoId = req.query.videoId;
  if (typeof videoId !== 'string' || !/^[\\w-]{11}$/.test(videoId)) return res.status(400).json({ error: 'Video không hợp lệ.' });
  try {
    const db = shadowingDatabase();
    const snap = await db.collection('shadowing_videos').doc(videoId).collection('analysis').get();
    const items: Record<string, ShadowingAnalysis> = {};
    snap.docs.forEach(d => { const value = d.data(); if (typeof value.text === 'string' && value.analysis) items[value.text] = value.analysis; });
    return res.json({ items, count: snap.size });
  } catch { return res.status(503).json({ error: 'Chưa đọc được dữ liệu phân tích.' }); }
}
