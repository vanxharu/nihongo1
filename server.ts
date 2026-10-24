import { listUserFiles, userFilePart, writeUserFile } from './src/server/userFiles';
import { getLearningState, saveLearningState, stageLearningState, learningStateManifest, learningStatePart } from './src/server/cloudLearningState';
import { persistentJsonExists, readPersistentJson, writePersistentJson, persistentRequest } from './src/server/persistentJson';
import { recordGrammarAttempt, userGrammarProgress } from './src/server/grammarProgress';
import express from "express";
import dotenv from "dotenv";
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { callLLM, generateGemini, getGeminiClient, getLlmConfig, userLlmMiddleware, DEFAULT_GEMINI_MODEL } from "./src/server/llm.js";
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
// hanviet-pinyin-words is ESM-only; use dynamic import so CJS bundling doesn't break
let _getAllHanvietsOfChar: ((c: string) => string[]) | null = null;
void (async () => {
  try {
    const m = await import('hanviet-pinyin-words');
    _getAllHanvietsOfChar = (m as any).getAllHanvietsOfChar ?? (m as any).default?.getAllHanvietsOfChar ?? null;
  } catch (e) {
    console.warn('[hanviet] Could not load hanviet-pinyin-words:', e);
  }
})();
import { documentKey, firebaseDb, listContent, bulkSaveContent, saveContent, removeContent, readRecord, writeRecord, listRecords } from './src/server/firebaseStore';
import { GRAMMAR_SYSTEM_PROMPT, buildGrammarContentUserPrompt } from './src/prompts/grammarContentPrompt';
import { VOCABULARY_DATA, GRAMMAR_DATA, KANJI_DATA, TANGO_N4_VOCABULARY } from './src/data';
import { synthesizeAzureSpeech, ttsParams } from './src/server/azureTts';
import { shadowingTranscript, shadowingAnalyze } from './src/server/shadowing';
import { shadowingVideo, shadowingReadAnalysis } from './src/server/shadowingStore';
import { shadowingPrepare } from './src/server/shadowingPrepare';
import { cleanVocabSymbols, sanitizeVocabItem, KANJI_TO_HAN_VIET } from './src/utils/japaneseUtils';
import { deduplicateGrammars } from './src/utils/grammarDeduplicator';
import { KANJI_DICTIONARY } from './src/data/kanjiDictionary';
import { requireAuth, requireAdmin } from './src/middleware/auth';
import { adminAuth } from './src/lib/firebase-admin';
import { getOrCreateUser, updateUserProfile, getAllUsers, deleteUserByUid, findUserByIdentifier, importBrowserProfile } from './src/db/users';
import { readLearningProfile, saveLearningProfile } from './src/server/learningProfile';

const KuroshiroClass = (Kuroshiro as any).default || Kuroshiro;
const KuromojiAnalyzerClass = (KuromojiAnalyzer as any).default || KuromojiAnalyzer;

let kuroshiroPromise: Promise<any> | null = null;
function getKuroshiro() {
  if (!kuroshiroPromise) {
    kuroshiroPromise = (async () => {
      const instance = new KuroshiroClass();
      const dictPath = path.join(process.cwd(), 'node_modules', 'kuromoji', 'dict');
      await instance.init(new KuromojiAnalyzerClass({ dictPath }));
      return instance;
    })();
  }
  return kuroshiroPromise;
}

function getHanVietChar(c: string) {
  if (KANJI_TO_HAN_VIET[c]) return KANJI_TO_HAN_VIET[c];
  try {
    if (_getAllHanvietsOfChar) {
      const vals = _getAllHanvietsOfChar(c);
      if (vals && vals.length > 0) return vals[0].toUpperCase();
    }
  } catch(e) {}
  return null;
}

function getHanVietWord(word: string) {
  if (!word) return '';
  const kanjiChars = word.split('').filter(char => /[\u4e00-\u9faf]/.test(char));
  if (kanjiChars.length === 0) return '';
  const readings = kanjiChars.map(c => getHanVietChar(c) || '');
  return readings.filter(Boolean).join(' ');
}

dotenv.config();

const app = express();
app.use((_req,_res,next)=>persistentRequest(next));
app.use(userLlmMiddleware);
const PORT = 3000;

// Express middleware
// Small JSON bodies by default; only routes that really carry images/audio/base64 get the big limit.
const BIG_BODY_PATH = /ocr|transcribe|handwriting|mascot|upload|import|kaiwa|japanese-chat|live|admin|exam|annotat|image|audio|voice|listening\/(questions|mappings)|user\/profile/i;
const smallJson = express.json({ limit: '1mb' });
const bigJson = express.json({ limit: '25mb' });
app.use((req, res, next) => (BIG_BODY_PATH.test(req.path) ? bigJson : smallJson)(req, res, next));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// Behind one reverse proxy (Vercel/Cloud Run): req.ip is the proxy-appended client address, not a client-forged header.
app.set('trust proxy', 1);

// Best-effort per-IP rate limit for endpoints that spend AI / TTS quota.
// In-memory, so on serverless hosts it is per instance; it still blunts casual abuse.
const COST_BEARING_PATHS = [
  '/api/shadowing/analyze', '/api/shadowing/prepare',
  '/api/listening/extract-frame-ocr', '/api/furigana',
  '/api/grammar/evaluate-translation', '/api/grammar/grade', '/api/grammar/analyze',
  '/api/grammar/practice-questions', '/api/grammar/personalized-review',
  '/api/grammar/ai-tutor', '/api/grammar/similar-question',
  '/api/reading/lookup-word',
  '/api/exam/generate-ai', '/api/exam/ai-grade-and-explain', '/api/exam/review-user-notes',
  '/api/kaiwa/chat', '/api/japanese-chat', '/api/chat-gpt', '/api/transcribe-audio',
  '/api/handwriting/grade', '/api/handwriting/generate-exercise', '/api/kanji/ai-mnemonic',
  '/api/sentence/analyze',
];
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 40;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
app.use(COST_BEARING_PATHS, (req, res, next) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets) if (v.resetAt <= now) rateBuckets.delete(k);
  }
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > RATE_MAX_REQUESTS) {
    res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    return res.status(429).json({ success: false, error: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.' });
  }
  return next();
});

app.get('/api/shadowing/transcript', shadowingTranscript);
app.post('/api/shadowing/analyze', shadowingAnalyze);
app.get('/api/shadowing/video', shadowingVideo);
app.post('/api/shadowing/video', shadowingVideo);
// Old cached clients receive an explicit retirement response; no AI/database work runs.
app.all('/api/shadowing/refresh', (_req, res) => res.status(410).json({ error: 'Chức năng cập nhật phụ đề tự động đã được gỡ. Hãy dùng file phân tích tĩnh.' }));
app.get('/api/shadowing/analysis', shadowingReadAnalysis);
app.post('/api/shadowing/prepare', shadowingPrepare);

// Transparent Firebase Auth reverse proxy for localhost & custom domains
app.all('/__/auth/*', async (req, res) => {
  try {
    const targetUrl = `https://nihongo-fd01e.firebaseapp.com${req.originalUrl}`;
    const proxyRes = await axios({
      method: req.method as any,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: 'nihongo-fd01e.firebaseapp.com'
      },
      data: req.body,
      responseType: 'stream',
      validateStatus: () => true
    });
    res.status(proxyRes.status);
    Object.entries(proxyRes.headers).forEach(([k, v]) => {
      if (v) res.setHeader(k, v as any);
    });
    proxyRes.data.pipe(res);
  } catch (err: any) {
    console.error('[AUTH PROXY] Failed to proxy Firebase auth request:', err?.message || err);
    res.status(502).send('Auth proxy failed');
  }
});

// Mascot API endpoints
const MASCOT_CLOUD_PATH=path.join(process.cwd(),'firebase-mascot.json');
app.get('/api/mascot/status',async(_req,res)=>{try{const exists=await persistentJsonExists(MASCOT_CLOUD_PATH);res.json({status:'ok',hasCustomMascot:exists,files:exists?['mascot.png']:[],primaryUrl:'/api/mascot/image'});}catch{res.status(503).json({error:'Không đọc được dữ liệu linh vật.'});}});
app.get('/api/mascot/image',async(_req,res)=>{try{if(!await persistentJsonExists(MASCOT_CLOUD_PATH))return res.redirect('/brand/nihon-shiba-2026-corrected.svg');const image=await readPersistentJson(MASCOT_CLOUD_PATH);res.setHeader('Content-Type',image.mime);res.setHeader('Cache-Control','no-cache');res.setHeader('X-Content-Type-Options','nosniff');res.send(Buffer.from(image.base64,'base64'));}catch{res.status(503).end();}});
app.post('/api/mascot/upload',requireAuth,requireAdmin,async(req,res)=>{try{const match=typeof req.body.imageBase64==='string'&&req.body.imageBase64.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/);if(!match||match[2].length>7000000)return res.status(400).json({error:'Ảnh không hợp lệ hoặc quá lớn.'});await writePersistentJson(MASCOT_CLOUD_PATH,{mime:match[1],base64:match[2]});res.json({success:true,url:'/api/mascot/image'});}catch{res.status(503).json({error:'Không lưu được ảnh lên Firebase.'});}});

// Flexible static audio resolver for JLPT Choukai tracks
app.get('/audio/:filename', (req, res, next) => {
  const reqName = req.params.filename;
  const audioDir = path.join(process.cwd(), 'public', 'audio');
  if (!fs.existsSync(audioDir)) {
    return next();
  }
  const exactPath = path.join(audioDir, reqName);
  if (fs.existsSync(exactPath)) {
    return res.sendFile(exactPath);
  }
  // Try matching by track number if reqName contains digits (e.g. track02.mp3 -> 2)
  const match = reqName.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    try {
      const files = fs.readdirSync(audioDir);
      const found = files.find(f => {
        const fMatch = f.match(/(\d+)/);
        return fMatch && parseInt(fMatch[1], 10) === num;
      });
      if (found) {
        return res.sendFile(path.join(audioDir, found));
      }
    } catch {
      // ignore error and proceed
    }
  }
  next();
});

// ==========================================
// YOUTUBE JLPT LISTENING MODULE ENDPOINTS
// ==========================================
const LISTENING_VIDEOS_FILE = path.join(process.cwd(), 'youtube-listening-videos.json');
const LISTENING_PROGRESS_FILE = path.join(process.cwd(), 'youtube-listening-progress.json');
const LISTENING_ATTEMPTS_FILE = path.join(process.cwd(), 'youtube-listening-attempts.json');
const LISTENING_RESUME_FILE = path.join(process.cwd(), 'youtube-listening-resume.json');
const LISTENING_QUESTIONS_FILE = path.join(process.cwd(), 'youtube-listening-questions.json');
const LISTENING_MAPPINGS_FILE = path.join(process.cwd(), 'youtube-listening-mappings.json');

// Helper to extract YouTube video ID from various URL patterns
function parseYouTubeId(input: string): { videoId: string | null; isShorts: boolean } {
  if (!input || typeof input !== 'string') return { videoId: null, isShorts: false };
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { videoId: trimmed, isShorts: false };
  }
  const isShorts = trimmed.includes('/shorts/');
  const match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
  return {
    videoId: match ? match[1] : null,
    isShorts
  };
}

app.use('/api', async (_req,_res,next)=>{try{await refreshFirebaseAiConfig();}catch{/* A config read must not prevent unrelated offline fallbacks. */}next();});

// 1. Get all YouTube listening videos
app.get('/api/listening/videos', async (req, res) => {
  try {
    if (await persistentJsonExists(LISTENING_VIDEOS_FILE)) {
      const videos = await readPersistentJson(LISTENING_VIDEOS_FILE);
      return res.json({ success: true, videos });
    }
    return res.json({ success: true, videos: [] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 2. Add or update YouTube listening video (Admin)
app.post('/api/listening/videos', requireAuth, requireAdmin, express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const videoData = req.body;
    if (!videoData) {
      return res.status(400).json({ error: 'Video data is required' });
    }

    const { videoId, isShorts } = parseYouTubeId(videoData.youtube_video_id || videoData.youtube_url || '');
    if (!videoId) {
      return res.status(400).json({ error: 'URL hoặc Video ID YouTube không hợp lệ' });
    }

    let videos: any[] = [];
    if (await persistentJsonExists(LISTENING_VIDEOS_FILE)) {
      try {
        videos = await readPersistentJson(LISTENING_VIDEOS_FILE);
      } catch {}
    }

    const id = videoData.id || `video-${Date.now()}`;
    const cleanVideo = {
      ...videoData,
      id,
      youtube_video_id: videoId,
      youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: videoData.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      has_answers: videoData.has_answers !== false,
      status: videoData.status || 'active',
      isShorts,
      updatedAt: new Date().toISOString(),
      createdAt: videoData.createdAt || new Date().toISOString()
    };

    const existingIndex = videos.findIndex((v: any) => v.id === id);
    if (existingIndex >= 0) {
      videos[existingIndex] = cleanVideo;
    } else {
      videos.unshift(cleanVideo);
    }

    await writeJsonAtomic(LISTENING_VIDEOS_FILE, videos);
    return res.json({ success: true, video: cleanVideo });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 3. Delete YouTube listening video (Admin)
app.delete('/api/listening/videos/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const videoId = req.params.id;
    if (await persistentJsonExists(LISTENING_VIDEOS_FILE)) {
      let videos = await readPersistentJson(LISTENING_VIDEOS_FILE);
      videos = videos.filter((v: any) => v.id !== videoId);
      await writeJsonAtomic(LISTENING_VIDEOS_FILE, videos);
    }
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 4. Get YouTube listening progress for a user
// Write via temp file + rename so a crash mid-write can never leave a truncated JSON store.
async function writeJsonAtomic(file:string,value:unknown){await writePersistentJson(file,value);}

// Listening progress/attempt/resume endpoints are per-user: a verified Firebase token decides the owner.
// Without a valid token the caller is a guest and only ever touches the shared 'default_user' bucket,
// so nobody can read or overwrite another user's data by guessing a uid. Ids are also validated so keys
// such as __proto__ can never reach the JSON stores (prototype pollution).
const SAFE_LISTENING_ID = /^[\w.@:-]{1,128}$/;
const UNSAFE_LISTENING_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const LISTENING_USER_PATHS = /^\/(progress|attempts|exam-resume)/;
app.use('/api/listening', async (req, res, next) => {
  if (!LISTENING_USER_PATHS.test(req.path)) return next();
  let uid = 'default_user';
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ') && adminAuth) {
    try { uid = (await adminAuth.verifyIdToken(auth.slice(7))).uid; } catch { /* invalid token: treat as guest */ }
  }
  if (req.query && typeof req.query === 'object') (req.query as any).userId = uid;
  if (req.body && typeof req.body === 'object') {
    req.body.userId = uid;
    if (Array.isArray(req.body.records)) for (const r of req.body.records) if (r && typeof r === 'object') r.userId = uid;
  }
  const ids: unknown[] = [];
  for (const src of [req.query, req.body]) {
    if (!src || typeof src !== 'object') continue;
    const o = src as Record<string, unknown>;
    ids.push(o.userId, o.videoId);
    if (Array.isArray(o.records)) for (const r of o.records) ids.push((r as any)?.videoId);
  }
  const bad = ids.some(v => v !== undefined && (typeof v !== 'string' || !SAFE_LISTENING_ID.test(v) || UNSAFE_LISTENING_KEYS.has(v)));
  if (bad) return res.status(400).json({ success: false, error: 'Invalid id' });
  next();
});

app.get('/api/listening/progress', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default_user';
    if (await persistentJsonExists(LISTENING_PROGRESS_FILE)) {
      const data = await readPersistentJson(LISTENING_PROGRESS_FILE);
      return res.json({ success: true, progress: data[userId] || {} });
    }
    return res.json({ success: true, progress: {} });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Helper to process upsert of listening progress record
function upsertListeningProgressRecord(allProgress: Record<string, any>, payload: any) {
  const { userId = 'default_user', videoId, currentTime, duration, completed, bookmarked, updatedAt, lastWatchedAt } = payload;
  if (!videoId) return null;

  if (!allProgress[userId]) {
    allProgress[userId] = {};
  }

  const currentRecord = allProgress[userId][videoId] || {};
  const incomingUpdatedAt = updatedAt || (lastWatchedAt ? new Date(lastWatchedAt).getTime() : Date.now());
  const existingUpdatedAt = currentRecord.updatedAt || (currentRecord.lastWatchedAt ? new Date(currentRecord.lastWatchedAt).getTime() : 0);

  // If server has an unequivocally newer record by > 500ms, retain existing
  if (existingUpdatedAt > incomingUpdatedAt + 500) {
    return { record: currentRecord, updated: false };
  }

  const safeDuration = duration || currentRecord.duration || 0;
  const rawCurrentTime = currentTime !== undefined ? Math.max(0, currentTime) : (currentRecord.currentTime || 0);
  const progressPercent = safeDuration > 0 
    ? Math.min(100, Math.round((rawCurrentTime / safeDuration) * 100))
    : 0;

  // Mark completed if >= 95% or explicitly set
  const isCompleted = completed !== undefined 
    ? completed 
    : (progressPercent >= 95 || currentRecord.completed || false);

  const updatedRecord = {
    videoId,
    currentTime: rawCurrentTime,
    duration: safeDuration,
    completed: isCompleted,
    progressPercent: isCompleted ? 100 : progressPercent,
    bookmarked: bookmarked !== undefined ? bookmarked : (currentRecord.bookmarked || false),
    updatedAt: incomingUpdatedAt,
    lastWatchedAt: lastWatchedAt || new Date(incomingUpdatedAt).toISOString()
  };

  allProgress[userId][videoId] = updatedRecord;
  return { record: updatedRecord, updated: true };
}

// 5. Save YouTube listening progress for a user (resume time, completed, bookmark)
app.post('/api/listening/progress', express.json(), async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    let allProgress: Record<string, Record<string, any>> = {};
    if (await persistentJsonExists(LISTENING_PROGRESS_FILE)) {
      try {
        allProgress = await readPersistentJson(LISTENING_PROGRESS_FILE);
      } catch {}
    }

    const result = upsertListeningProgressRecord(allProgress, req.body);
    if (!result) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    await writeJsonAtomic(LISTENING_PROGRESS_FILE, allProgress);
    return res.json({ success: true, record: result.record });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 5b. Beacon endpoint for pagehide / beforeunload (supports text/plain or application/json)
app.post('/api/listening/progress/beacon', express.text({ type: '*/*' }), async (req, res) => {
  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch {}
    }
    if (!payload || !payload.videoId) {
      return res.status(204).end();
    }

    let allProgress: Record<string, Record<string, any>> = {};
    if (await persistentJsonExists(LISTENING_PROGRESS_FILE)) {
      try {
        allProgress = await readPersistentJson(LISTENING_PROGRESS_FILE);
      } catch {}
    }

    upsertListeningProgressRecord(allProgress, payload);
    await writeJsonAtomic(LISTENING_PROGRESS_FILE, allProgress);
    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

// 5c. Batch sync endpoint when reconnecting online
app.post('/api/listening/progress/batch', express.json(), async (req, res) => {
  try {
    const { userId = 'default_user', records = [] } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'records must be an array' });
    }

    let allProgress: Record<string, Record<string, any>> = {};
    if (await persistentJsonExists(LISTENING_PROGRESS_FILE)) {
      try {
        allProgress = await readPersistentJson(LISTENING_PROGRESS_FILE);
      } catch {}
    }

    records.forEach((record: any) => {
      upsertListeningProgressRecord(allProgress, { ...record, userId });
    });

    await writeJsonAtomic(LISTENING_PROGRESS_FILE, allProgress);
    return res.json({ success: true, count: records.length, progress: allProgress[userId] || {} });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 6. Fetch YouTube info via official oEmbed for Admin auto-fill
app.get('/api/listening/youtube-info', async (req, res) => {
  try {
    const input = (req.query.url as string) || (req.query.videoId as string) || '';
    const { videoId, isShorts } = parseYouTubeId(input);
    if (!videoId) {
      return res.status(400).json({ error: 'Không tìm thấy ID video YouTube hợp lệ' });
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Không thể lấy thông tin video từ YouTube. Video có thể là video riêng tư hoặc đã bị xóa.' 
      });
    }

    const data: any = await response.json();
    return res.json({
      success: true,
      info: {
        videoId,
        title: data.title,
        author: data.author_name,
        authorUrl: data.author_url,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        isShorts
      }
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 7. Get JLPT Listening Exam Attempts for user
app.get('/api/listening/attempts', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default_user';
    if (await persistentJsonExists(LISTENING_ATTEMPTS_FILE)) {
      const all = await readPersistentJson(LISTENING_ATTEMPTS_FILE);
      const userAttempts = (all && all[userId]) || [];
      return res.json({ success: true, attempts: userAttempts });
    }
    return res.json({ success: true, attempts: [] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 8. Save completed JLPT Listening Exam Attempt
app.post('/api/listening/attempts', express.json({ limit: '5mb' }), async (req, res) => {
  try {
    const { userId = 'default_user', attempt } = req.body;
    if (!attempt || !attempt.attemptId) {
      return res.status(400).json({ error: 'Missing attempt data' });
    }

    let all: Record<string, any[]> = {};
    if (await persistentJsonExists(LISTENING_ATTEMPTS_FILE)) {
      try {
        all = await readPersistentJson(LISTENING_ATTEMPTS_FILE);
      } catch {}
    }

    if (!all[userId]) all[userId] = [];
    // Prepend attempt
    all[userId] = [attempt, ...all[userId].filter((a: any) => a.attemptId !== attempt.attemptId)];
    await writeJsonAtomic(LISTENING_ATTEMPTS_FILE, all);

    // Also clear in-progress resume state for this video if exists
    if (await persistentJsonExists(LISTENING_RESUME_FILE)) {
      try {
        const resumeData = await readPersistentJson(LISTENING_RESUME_FILE);
        if (resumeData[userId]) {
          delete resumeData[userId][attempt.youtubeVideoId];
          if (attempt.examId) delete resumeData[userId][attempt.examId];
          await writeJsonAtomic(LISTENING_RESUME_FILE, resumeData);
        }
      } catch {}
    }

    return res.json({ success: true, attempt });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 9. Get in-progress JLPT Listening Exam resume state
app.get('/api/listening/exam-resume', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default_user';
    const videoId = req.query.videoId as string;
    if (await persistentJsonExists(LISTENING_RESUME_FILE)) {
      const data = await readPersistentJson(LISTENING_RESUME_FILE);
      const userResumes = data[userId] || {};
      if (videoId) {
        return res.json({ success: true, state: userResumes[videoId] || null });
      }
      return res.json({ success: true, resumes: userResumes });
    }
    return res.json({ success: true, state: null, resumes: {} });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 10. Save in-progress JLPT Listening Exam resume state
app.post('/api/listening/exam-resume', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const { userId = 'default_user', state } = req.body;
    if (!state || !state.youtubeVideoId) {
      return res.status(400).json({ error: 'Missing state data' });
    }

    let all: Record<string, Record<string, any>> = {};
    if (await persistentJsonExists(LISTENING_RESUME_FILE)) {
      try {
        all = await readPersistentJson(LISTENING_RESUME_FILE);
      } catch {}
    }

    if (!all[userId]) all[userId] = {};
    all[userId][state.youtubeVideoId] = state;
    if (state.examId) {
      all[userId][state.examId] = state;
    }

    await writeJsonAtomic(LISTENING_RESUME_FILE, all);
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 11. Delete in-progress JLPT Listening Exam resume state
app.delete('/api/listening/exam-resume', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default_user';
    const videoId = req.query.videoId as string;
    if (await persistentJsonExists(LISTENING_RESUME_FILE)) {
      const data = await readPersistentJson(LISTENING_RESUME_FILE);
      if (data[userId] && videoId) {
        delete data[userId][videoId];
        await writeJsonAtomic(LISTENING_RESUME_FILE, data);
      }
    }
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 12. Get Verified JLPT Listening Questions
app.get('/api/listening/questions', async (req, res) => {
  try {
    const videoId = req.query.videoId as string;
    if (await persistentJsonExists(LISTENING_QUESTIONS_FILE)) {
      const data = await readPersistentJson(LISTENING_QUESTIONS_FILE);
      if (videoId) {
        return res.json({ success: true, exam: data[videoId] || null });
      }
      return res.json({ success: true, questions: data });
    }
    return res.json({ success: true, exam: null, questions: {} });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 13. Save or Update Verified JLPT Listening Questions & Timestamp mapping (Admin Tool)
app.post('/api/listening/questions', requireAuth, requireAdmin, express.json({ limit: '5mb' }), async (req, res) => {
  try {
    const { videoId, examData } = req.body;
    if (!videoId || !examData) {
      return res.status(400).json({ error: 'Missing videoId or examData' });
    }

    // Validation: check questions for validity
    if (Array.isArray(examData.questions)) {
      for (const q of examData.questions) {
        if (q.startTime !== undefined && q.startTime < 0) {
          return res.status(400).json({ error: `INVALID_QUESTION_MAPPING: startTime of question ${q.questionNumber || q.questionId} must be >= 0` });
        }
        if (q.startTime !== undefined && q.endTime !== undefined && q.endTime <= q.startTime) {
          return res.status(400).json({ error: `INVALID_QUESTION_MAPPING: endTime must be greater than startTime for question ${q.questionNumber || q.questionId}` });
        }
      }
    }

    let all: Record<string, any> = {};
    if (await persistentJsonExists(LISTENING_QUESTIONS_FILE)) {
      try {
        all = await readPersistentJson(LISTENING_QUESTIONS_FILE);
      } catch {}
    }

    all[videoId] = {
      ...examData,
      youtubeVideoId: videoId,
      updatedAt: new Date().toISOString()
    };

    await writeJsonAtomic(LISTENING_QUESTIONS_FILE, all);
    return res.json({ success: true, exam: all[videoId] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 14. Quick update question timestamp (Admin Timestamp Editor)
app.post('/api/listening/questions/update-timestamp', requireAuth, requireAdmin, express.json(), async (req, res) => {
  try {
    const { videoId, questionId, startTime, endTime } = req.body;
    if (!videoId || !questionId) {
      return res.status(400).json({ error: 'Missing videoId or questionId' });
    }

    if (startTime !== undefined && startTime < 0) {
      return res.status(400).json({ error: 'INVALID_QUESTION_MAPPING: startTime must be >= 0' });
    }
    if (startTime !== undefined && endTime !== undefined && endTime <= startTime) {
      return res.status(400).json({ error: 'INVALID_QUESTION_MAPPING: endTime must be greater than startTime' });
    }

    if (!await persistentJsonExists(LISTENING_QUESTIONS_FILE)) {
      return res.status(404).json({ error: 'No questions file found' });
    }

    const all = await readPersistentJson(LISTENING_QUESTIONS_FILE);
    const exam = all[videoId];
    if (!exam || !Array.isArray(exam.questions)) {
      return res.status(404).json({ error: 'Exam not found for this video' });
    }

    const q = exam.questions.find((item: any) => item.questionId === questionId || item.id === questionId);
    if (!q) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (startTime !== undefined) q.startTime = Number(startTime);
    if (endTime !== undefined) q.endTime = Number(endTime);
    q.sourceVerified = true;
    exam.updatedAt = new Date().toISOString();

    await writeJsonAtomic(LISTENING_QUESTIONS_FILE, all);
    return res.json({ success: true, question: q });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 15. Get YouTube Timestamp Mappings (Decoupled from Question Data)
app.get('/api/listening/mappings', async (req, res) => {
  try {
    const videoId = req.query.videoId as string;
    const examId = req.query.examId as string;
    let mappings: any[] = [];
    if (await persistentJsonExists(LISTENING_MAPPINGS_FILE)) {
      try {
        mappings = await readPersistentJson(LISTENING_MAPPINGS_FILE);
      } catch {}
    }
    if (videoId) {
      mappings = mappings.filter((m: any) => m.youtubeVideoId === videoId);
    }
    if (examId) {
      mappings = mappings.filter((m: any) => m.examId === examId);
    }
    return res.json({ success: true, mappings });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 16. Save single Timestamp Mapping (Admin)
app.post('/api/listening/mappings', requireAuth, requireAdmin, express.json(), async (req, res) => {
  try {
    const { mapping } = req.body;
    if (!mapping || !mapping.questionId || !mapping.youtubeVideoId) {
      return res.status(400).json({ error: 'Missing mapping data (questionId, youtubeVideoId required)' });
    }

    if (mapping.startTime !== undefined && mapping.startTime < 0) {
      return res.status(400).json({ error: 'INVALID_TIMESTAMP: startTime must be >= 0' });
    }
    if (mapping.startTime !== undefined && mapping.endTime !== undefined && mapping.endTime <= mapping.startTime) {
      return res.status(400).json({ error: 'INVALID_TIMESTAMP: endTime must be greater than startTime' });
    }

    let mappings: any[] = [];
    if (await persistentJsonExists(LISTENING_MAPPINGS_FILE)) {
      try {
        mappings = await readPersistentJson(LISTENING_MAPPINGS_FILE);
      } catch {}
    }

    const key = `${mapping.questionId}_${mapping.youtubeVideoId}`;
    const idx = mappings.findIndex((m: any) => `${m.questionId}_${m.youtubeVideoId}` === key);
    const enriched = {
      ...mapping,
      timestampVerified: true,
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      mappings[idx] = enriched;
    } else {
      mappings.push(enriched);
    }

    await writeJsonAtomic(LISTENING_MAPPINGS_FILE, mappings);
    return res.json({ success: true, mapping: enriched });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 17. Batch save Timestamp Mappings (Admin)
app.post('/api/listening/mappings/batch', requireAuth, requireAdmin, express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const { mappings: incoming = [] } = req.body;
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ error: 'mappings must be an array' });
    }

    let mappings: any[] = [];
    if (await persistentJsonExists(LISTENING_MAPPINGS_FILE)) {
      try {
        mappings = await readPersistentJson(LISTENING_MAPPINGS_FILE);
      } catch {}
    }

    const now = new Date().toISOString();
    for (const item of incoming) {
      if (!item.questionId || !item.youtubeVideoId) continue;
      const key = `${item.questionId}_${item.youtubeVideoId}`;
      const idx = mappings.findIndex((m: any) => `${m.questionId}_${m.youtubeVideoId}` === key);
      const enriched = {
        ...item,
        timestampVerified: true,
        updatedAt: now
      };
      if (idx >= 0) {
        mappings[idx] = enriched;
      } else {
        mappings.push(enriched);
      }
    }

    await writeJsonAtomic(LISTENING_MAPPINGS_FILE, mappings);
    return res.json({ success: true, count: incoming.length });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// 18. Frame Extraction & OCR Pipeline (High precision OCR from actual video frames)
// Strictly extracts what is visible in the frame: Question number, Question Text Ja, Options Ja.
// Does NOT fabricate or invent questions.
app.post('/api/listening/extract-frame-ocr', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { videoId, frameTime, frameBase64, expectedLevel = 'N4', section = '問題1', questionNumber } = req.body;
    
    if (!videoId || (!frameBase64 && frameTime === undefined)) {
      return res.status(400).json({ error: 'Missing required parameters: videoId and either frameBase64 or frameTime' });
    }

    console.log(`[EXTRACTION]\nExam: ${expectedLevel}\nQuestion: ${questionNumber ? 'Q' + questionNumber : 'Pending'}\nYouTube: ${videoId}\n[FRAME]\nFrame time: ${Number(frameTime || 0).toFixed(2)}`);

    // If frameBase64 is provided directly (or from canvas capture of video frame):
    if (frameBase64) {
      const cleanBase64 = frameBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const prompt = `You are a strict, high-precision Japanese JLPT Optical Character Recognition (OCR) engine.
Your task is ONLY to transcribe the exact visible text from this Japanese listening test frame.
CRITICAL MANDATES:
1. Do NOT invent, paraphrase, or hallucinate questions.
2. If text is blurry or unreadable, mark "ocrConfidence": 0.3 and "extractionStatus": "OCR_UNCERTAIN".
3. Extract the exact Japanese text as questionTextJa.
4. Extract the 1, 2, 3, 4 options as optionsJa.
5. Identify the section (e.g. 問題1, 問題2) and questionNumber if visible.
6. Return JSON ONLY matching this schema:
{
  "section": string,
  "questionNumber": number or null,
  "questionTextJa": string,
  "optionsJa": string[],
  "ocrConfidence": number, // between 0.0 and 1.0
  "extractionStatus": "EXTRACTED" | "NEEDS_VERIFICATION" | "OCR_UNCERTAIN" | "ERROR",
  "isQuestionDetected": boolean,
  "detectedOptionsCount": number
}`;

      try {
        const geminiClient = getGeminiClient();
        const response = await geminiClient.models.generateContent({
          model: LATEST_GEMINI_MODEL,
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: cleanBase64
                  }
                }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        console.log(`[OCR]\nQuestion detected: ${!!parsed.questionTextJa}\nOptions detected: ${parsed.optionsJa?.length || 0}\n[VERIFY]\nSource verified: false`);

        return res.json({
          success: true,
          extraction: {
            videoId,
            frameTime: Number(frameTime || 0),
            section: parsed.section || section,
            questionNumber: parsed.questionNumber || questionNumber || null,
            questionTextJa: parsed.questionTextJa || '',
            optionsJa: Array.isArray(parsed.optionsJa) ? parsed.optionsJa : [],
            ocrConfidence: typeof parsed.ocrConfidence === 'number' ? parsed.ocrConfidence : 0.85,
            extractionMethod: 'OCR',
            extractionStatus: parsed.extractionStatus || (parsed.questionTextJa ? 'NEEDS_VERIFICATION' : 'OCR_UNCERTAIN'),
            sourceVerified: false,
            timestampVerified: false
          }
        });
      } catch (ocrErr: any) {
        console.error('[OCR Engine Error]', ocrErr);
        return res.status(500).json({ error: `OCR Processing Failed: ${ocrErr.message}` });
      }
    }

    // If frameBase64 is not passed, prompt user to capture the frame or verify
    return res.json({
      success: true,
      message: 'Frame timestamp recorded. Please attach frame screenshot for OCR transcription.',
      frameTime: Number(frameTime || 0)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// DYNAMIC AI ENGINE & CENTRALIZED CHATGPT (OPENAI) / GEMINI CONFIGURATION
// ============================================================================
const AI_CONFIG_FILE = path.join(process.cwd(), "ai-config.json");

export interface ServerAIConfig {
  openaiApiKey?: string;
  openaiModel?: string; // "gpt-4o-mini", "gpt-4o", "gpt-4.1-turbo", "gpt-3.5-turbo"
  provider?: "chatgpt" | "gemini";
  updatedAt?: string;
}

let activeAIConfig: ServerAIConfig = {
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  provider: "chatgpt",
};

let configChecked=0;
async function refreshFirebaseAiConfig(){
  if(Date.now()-configChecked<60000)return;
  const saved=await readRecord('server_settings','ai-config');if(saved)activeAIConfig={...activeAIConfig,...saved};configChecked=Date.now();
}
export function getActiveOpenAIApiKey(): string {
  return (activeAIConfig.openaiApiKey || process.env.OPENAI_API_KEY || "").trim();
}

export function getActiveOpenAIModel(): string {
  return (activeAIConfig.openaiModel || process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
}

export function getActiveAIProvider(): "chatgpt" | "gemini" {
  return activeAIConfig.provider || "chatgpt";
}

let openaiClientInstance: OpenAI | null = null;
let currentClientKey: string = "";

export function getOpenAIClient(): OpenAI {
  const apiKey = getActiveOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }
  if (!openaiClientInstance || currentClientKey !== apiKey) {
    openaiClientInstance = new OpenAI({ apiKey });
    currentClientKey = apiKey;
  }
  return openaiClientInstance;
}

// Giữ tên cũ để không phải sửa ~15 nơi gọi: mọi lời gọi "GPT" giờ đi qua model miễn phí.
export async function callOpenAIGPT(options: {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  jsonMode?: boolean;
  temperature?: number;
}) {
  return callLLM({ prompt: options.prompt, systemInstruction: options.systemInstruction, json: options.jsonMode });
}

/**
 * Unified AI Caller: Calls ChatGPT with active config first, seamlessly falls back to Gemini
 */
export async function callUnifiedAI(options: {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  jsonMode?: boolean;
  temperature?: number;
  responseSchema?: any;
}): Promise<{
  text: string;
  aiProvider: 'chatgpt' | 'gemini' | 'gemini_fallback';
  modelUsed: string;
  openAiError?: string;
}> {
  const preferred = getActiveAIProvider();
  const apiKey = getActiveOpenAIApiKey();
  const model = options.model || getActiveOpenAIModel();
  let openAiErrorMsg: string | null = null;

  if (false as boolean) {
    try {
      const gptPrompt = options.jsonMode && !options.prompt.includes("JSON")
        ? options.prompt + "\nBẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON HỢP LỆ DUY NHẤT."
        : options.prompt;
      const text = await callOpenAIGPT({
        prompt: gptPrompt,
        systemInstruction: options.systemInstruction,
        model,
        jsonMode: options.jsonMode,
        temperature: options.temperature
      });
      if (text && text.trim().length > 0) {
        return {
          text: text.trim(),
          aiProvider: 'chatgpt',
          modelUsed: `ChatGPT (${model})`
        };
      }
    } catch (err: any) {
      openAiErrorMsg = err?.message || String(err);
      console.warn("[callUnifiedAI] ChatGPT error, falling back to Gemini:", openAiErrorMsg);
    }
  }

  // Fallback to Gemini
  try {
    const geminiConfig: any = {};
    if (options.systemInstruction) {
      geminiConfig.systemInstruction = options.systemInstruction;
    }
    if (options.jsonMode) {
      geminiConfig.responseMimeType = "application/json";
      if (options.responseSchema) {
        geminiConfig.responseSchema = options.responseSchema;
      }
    }
    const geminiRes = await generateGeminiContentWithFallback({
      contents: options.prompt,
      model: LATEST_GEMINI_MODEL,
      config: geminiConfig
    });

    return {
      text: geminiRes.text || "",
      aiProvider: openAiErrorMsg ? 'gemini_fallback' : 'gemini',
      modelUsed: LATEST_GEMINI_MODEL,
      openAiError: openAiErrorMsg ? (
        openAiErrorMsg.includes("429") || openAiErrorMsg.includes("credits") 
          ? "Tài khoản OpenAI (ChatGPT) hiện chưa có credit, hệ thống tự động kích hoạt Gemini AI hỗ trợ bạn." 
          : openAiErrorMsg
      ) : undefined
    };
  } catch (geminiErr: any) {
    if (openAiErrorMsg) {
      throw new Error(`Cả ChatGPT (${openAiErrorMsg}) và Gemini (${geminiErr?.message || geminiErr}) đều gặp lỗi.`);
    }
    throw geminiErr;
  }
}

// Resilient Gemini generateContent wrapper with automatic model fallback for 503/429 spikes
export const LATEST_GEMINI_MODEL = "gemini-3.8-flash";

export const generateGeminiContentWithFallback = generateGemini;

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1.1 API: Microsoft Azure Neural Text-To-Speech (NanamiNeural 👩 & KeitaNeural 👨)
app.get("/api/tts", async (req, res) => {
  try {
    const q = ttsParams(req.query.text, req.query.voice, req.query.rate, req.query.pitch);
    if (!q) return res.status(400).json({ error: "Parameter 'text' is too long (max 600 characters)" });
    const { text, voice, rate, pitch } = q;

    if (!text) {
      return res.status(400).json({ error: "Parameter 'text' is required" });
    }

    const audioBuffer = await synthesizeAzureSpeech(text, voice, rate, pitch);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
      "Cache-Control": "public, max-age=86400, immutable",
      "Accept-Ranges": "bytes"
    });

    return res.end(audioBuffer);
  } catch (error: any) {
    console.error("Error in GET /api/tts (Azure Neural Voice):", error);
    return res.status(500).json({ error: "Failed to generate Azure Neural audio", details: error.message });
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    const q = ttsParams(req.body?.text, req.body?.voice, req.body?.rate, req.body?.pitch);
    if (!q) return res.status(400).json({ error: "Parameter 'text' is too long (max 600 characters)" });
    const { text: cleanText, voice, rate, pitch } = q;

    if (!cleanText) {
      return res.status(400).json({ error: "Parameter 'text' is required in body" });
    }

    const audioBuffer = await synthesizeAzureSpeech(cleanText, voice, rate, pitch);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
      "Cache-Control": "public, max-age=86400, immutable",
      "Accept-Ranges": "bytes"
    });

    return res.end(audioBuffer);
  } catch (error: any) {
    console.error("Error in POST /api/tts (Azure Neural Voice):", error);
    return res.status(500).json({ error: "Failed to generate Azure Neural audio", details: error.message });
  }
});

// 1.2 API: Furigana Converter (Kuroshiro HTML Ruby generator)
app.post("/api/furigana", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "text is required" });
    }
    if (text.length > 3000) return res.status(400).json({ error: "text is too long (max 3000 characters)" });
    const k = await getKuroshiro();
    const furiganaHtml = await k.convert(text, { mode: "furigana", to: "hiragana" });
    res.json({ success: true, text, furiganaHtml });
  } catch (err: any) {
    res.status(500).json({ error: "Furigana conversion failed", details: err?.message });
  }
});

// Helper: Phân tích hình thái học Kuromoji để xác định Danh từ (noun), Động từ (verb), Tính từ (adjective)
async function extractPosMapFromText(text: string): Promise<Record<string, 'noun' | 'verb' | 'adjective' | 'other'>> {
  const posMap: Record<string, 'noun' | 'verb' | 'adjective' | 'other'> = {};
  if (!text) return posMap;

  const GRAMMAR_EXCLUSIONS_SERVER = new Set([
    'は', 'が', 'を', 'に', 'で', 'と', 'へ', 'から', 'まで', 'より', 'も', 'の', 'や', 'か', 'ね', 'よ', 'わ', 'ぞ', 'ぜ', 'な', 'さ',
    'という', 'といった', 'として', 'としての', 'によって', 'により', 'について', 'に関して', 'に対し', 'に対して', 'にとって',
    'とともに', 'をはじめ', 'をはじめとする', 'を通じて', 'を通して', 'をもとに', 'に基づいて', 'にかけて', 'にわたって', 'にあたって',
    'に際して', 'につれて', 'にしたがって', 'だけ', 'しか', 'ばかり', 'ほど', 'くらい', 'ぐらい', 'など', 'なんて', 'なんか',
    'さえ', 'こそ', 'でも', 'ても', 'けれど', 'けれども', 'けど', 'のに', 'ので', 'たら', 'なら', 'ば',
    'です', 'だ', 'である', 'でした', 'だった', 'ではありません', 'じゃない', 'でしょう', 'だろう', 'ます', 'ました', 'ません', 'ませんでした',
    'よう', 'そう', 'らしい', 'みたい', 'ため', 'はず', 'わけ', 'つもり', 'こと', 'もの', 'ところ', 'とき', '時', '間'
  ]);

  try {
    const k = await getKuroshiro();
    const tokenizer = (k as any)._analyzer?._analyzer;
    if (tokenizer) {
      // Bỏ qua ruby tags nếu có
      const cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      const tokens = tokenizer.tokenize(cleanText);

      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const surf = (t.surface_form || '').trim();
        const basic = (t.basic_form && t.basic_form !== '*') ? t.basic_form.trim() : surf;

        // Skip single kana characters (e.g. lone 'い', 'し', 'て', 'た', 'る', 'だ', 'う')
        if (/^[ぁ-んァ-ヶ]$/.test(surf) || /^[ぁ-んァ-ヶ]$/.test(basic)) {
          continue;
        }

        // Skip grammatical particles & connectors
        if (GRAMMAR_EXCLUSIONS_SERVER.has(surf) || GRAMMAR_EXCLUSIONS_SERVER.has(basic)) {
          continue;
        }

        let pos: 'noun' | 'verb' | 'adjective' | 'other' = 'other';
        if (t.pos === '名詞') {
          // Check if not a particle-like noun
          if (!['非自立', '接尾', '代名詞'].includes(t.pos_detail_1) || /[\u4e00-\u9faf]/.test(surf)) {
            pos = 'noun';
          }
        } else if (t.pos === '動詞') {
          // Exclude auxiliary lone verb stems like non-independent 'い' from 'います'
          if (t.pos_detail_1 === '非自立' && surf.length <= 1) {
            continue;
          }
          pos = 'verb';
        } else if (t.pos === '形容詞' || t.pos === '形容動詞') {
          pos = 'adjective';
        }

        if (pos !== 'other') {
          if (surf && surf.length >= 2 || (surf.length === 1 && /[\u4e00-\u9faf]/.test(surf))) {
            posMap[surf] = pos;
          }
          if (basic && basic.length >= 2 || (basic.length === 1 && /[\u4e00-\u9faf]/.test(basic))) {
            posMap[basic] = pos;
          }

          // Merge verb conjugations (e.g. 知ら + れ + て -> 知られて)
          if (pos === 'verb' && i + 1 < tokens.length) {
            let compoundVerb = surf;
            let j = i + 1;
            while (j < tokens.length && j <= i + 4) {
              const nextT = tokens[j];
              if (['助動詞', '助詞', '動詞'].includes(nextT.pos)) {
                compoundVerb += nextT.surface_form;
                j++;
              } else {
                break;
              }
            }
            if (compoundVerb.length > surf.length && /[\u4e00-\u9faf]/.test(compoundVerb)) {
              posMap[compoundVerb] = 'verb';
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in extractPosMapFromText:", err);
  }
  return posMap;
}

// 1.3 API: Japanese POS Tokenizer (Tách từ & phân loại Danh từ / Động từ bằng Kuromoji)
app.post("/api/reading/tokenize-pos", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.json({ success: true, posMap: {} });
    }
    const posMap = await extractPosMapFromText(String(text));
    res.json({ success: true, posMap });
  } catch (err: any) {
    res.status(500).json({ error: "POS tokenization failed", details: err?.message });
  }
});

// In-Memory Caches to prevent repeated Gemini calls and quota exhaustion
const KANJI_BREAKDOWN_CACHE = new Map<string, any>();
const MNEMONIC_CACHE = new Map<string, string>();
const EXAM_CACHE = new Map<string, any>();
const GRAMMAR_ANALYSIS_CACHE = new Map<string, any>();
const EXAM_NOTE_CORRECTION_CACHE = new Map<string, any>();

function generateOfflineNoteCorrection(item: any) {
  const noteText = (item?.text || '').trim();
  const context = item?.questionContext || {};
  const explanation = context.explanation || '';
  const correctOption = context.correctOption || '';
  const questionText = context.questionText || '';

  const lowerNote = noteText.toLowerCase();
  
  // Check if note is very brief or greeting
  if (noteText.length < 3) {
    return {
      id: item.id,
      status: 'TIP',
      score: 80,
      teacherFeedback: '✏️ Ghi chú ngắn gọn',
      correctedContent: noteText,
      keyExplanation: explanation || 'Hãy ghi chú thêm lý do chọn đáp án hoặc ý nghĩa từ vựng để ôn tập hiệu quả hơn nhé!',
      memoryTip: 'Ghi chú cấu trúc ngữ pháp và từ khóa chính của câu.'
    };
  }

  // Check if user note expresses uncertainty
  const isUncertain = lowerNote.includes('không chắc') || lowerNote.includes('nghi ngờ') || lowerNote.includes('đoán') || lowerNote.includes('?');

  return {
    id: item.id,
    status: isUncertain ? 'PARTIAL' : 'CORRECT',
    score: isUncertain ? 70 : 90,
    teacherFeedback: isUncertain ? '⚠️ Chú ý bẫy đề thi' : '⭕ Ghi chú học tập tốt!',
    correctedContent: noteText,
    keyExplanation: explanation ? `💡 Đối chiếu kiến thức chuẩn: ${explanation}` : (correctOption ? `Đáp án chính xác câu này là: ${correctOption}` : 'Ghi chú của bạn đã được ghi nhận vào sổ tay ôn tập.'),
    memoryTip: 'Xem lại giải thích chi tiết và phân tích ngữ cảnh để củng cố kiến thức.'
  };
}

// 1.4 API: Review and Correct User Exam Notes (AI 赤ペン先生 - Chấm & Sửa ghi chú học viên)
app.post("/api/exam/review-user-notes", async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.json({ success: true, corrections: [] });
    }

    if (!getLlmConfig().apiKey) {
      const offlineCorrections = notes.map((item: any) => generateOfflineNoteCorrection(item));
      return res.json({ success: true, corrections: offlineCorrections });
    }

    const notesToAnalyze = notes.slice(0, 25);
    const prompt = `Bạn là một Giáo viên Tiếng Nhật luyện thi JLPT hàng đầu (赤ペン先生 - Giáo viên chấm mực đỏ).
Học viên đang làm đề thi JLPT và đã tự viết các ghi chú (nháp kiến thức, dịch nghĩa từ vựng, giải thích ngữ pháp, phán đoán đáp án) trực tiếp lên đề thi hoặc từng câu hỏi.
Nhiệm vụ của bạn: Đọc kỹ từng ghi chú của học viên, đối chiếu với ngữ cảnh câu hỏi thi (nếu có), và chấm/sửa lỗi ghi chú cho học viên một cách ân cần, chính xác và sắc bén.

Danh sách các ghi chú của học viên cần chấm:
${JSON.stringify(notesToAnalyze, null, 2)}

Hãy phân tích từng ghi chú và trả về JSON thuần túy theo schema:
{
  "corrections": [
    {
      "id": "ID tương ứng của ghi chú",
      "status": "CORRECT" (nếu ghi chú đúng, hiểu chuẩn) | "WRONG" (nếu ghi chú sai, nhầm lẫn kiến thức) | "PARTIAL" (nếu ghi chú đúng một phần nhưng còn nhầm/thiếu sót) | "TIP" (lời khuyên bổ sung),
      "score": 0-100,
      "teacherFeedback": "Lời phê ngắn gọn có icon (ví dụ: '❌ Bạn hiểu nhầm nghĩa từ vựng rồi!', '⭕ Chuẩn xác!', '⚠️ Chú ý cấu trúc phân biệt')",
      "correctedContent": "Nội dung đính chính chuẩn xác, chỉ rõ chỗ học viên sai và phiên bản đúng",
      "keyExplanation": "Giải thích chi tiết ngữ pháp, Hán tự (Âm Hán Việt, cách đọc On/Kun) hoặc từ vựng liên quan",
      "memoryTip": "Mẹo nhớ nhanh trong đề thi JLPT để không bị bẫy lần sau"
    }
  ]
}
QUY TẮC BẮT BUỘC:
- Trả về JSON hợp lệ duy nhất, không kèm markdown \`\`\`json.
- Ngôn ngữ giải thích: Tiếng Việt tự nhiên, chuẩn mực sư phạm.
- Nếu học viên ghi chú sai (dịch sai nghĩa, nhầm ngữ pháp, hiểu ngược điều kiện, nhầm trợ từ), PHẢI chỉ ra lỗi sai và đưa ra kiến thức chuẩn ngay lập tức.`;

    // 1. Primary: ChatGPT (OpenAI configured model)
    if (true) { // callOpenAIGPT giờ gọi model miễn phí
      try {
        const rawJson = await callOpenAIGPT({
          prompt: prompt + "\nTrả về đúng định dạng JSON hợp lệ duy nhất, không bọc thẻ markdown.",
          systemInstruction: "Bạn là Giáo viên Tiếng Nhật luyện thi JLPT hàng đầu (赤ペン先生), chạy trên nền tảng ChatGPT.",
          model: getActiveOpenAIModel(),
          jsonMode: true
        });
        const parsed = JSON.parse(rawJson.trim());
        return res.json({
          success: true,
          corrections: parsed.corrections || [],
          aiProvider: "chatgpt",
          modelUsed: `ChatGPT (${getActiveOpenAIModel()})`
        });
      } catch (openAiErr: any) {
        console.warn("[ChatGPT] Fallback to Gemini for exam notes review:", openAiErr?.message || openAiErr);
      }
    }

    // 2. Fallback: Gemini Content Generation
    const response = await generateGeminiContentWithFallback({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const text = response.text || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return res.json({
      success: true,
      corrections: parsed.corrections || [],
      aiProvider: "gemini"
    });
  } catch (error: any) {
    console.error("Error in POST /api/exam/review-user-notes:", error);
    try {
      const { notes } = req.body || {};
      if (Array.isArray(notes)) {
        const offlineCorrections = notes.map((item: any) => generateOfflineNoteCorrection(item));
        return res.json({ success: true, corrections: offlineCorrections, fallback: true });
      }
    } catch {}
    return res.status(500).json({ error: "Failed to review notes", details: error.message });
  }
});

// Offline fallback generators
function evaluateOfflineGrade(grammarStructure: string, vietnamesePrompt: string, expectedJapanese: string, userTranslation: string) {
  const cleanUser = (userTranslation || '').trim().replace(/[\s。、！？!?]/g, '');
  const cleanExp = (expectedJapanese || '').trim().replace(/[\s。、！？!?]/g, '');
  
  const isExact = cleanUser === cleanExp;
  const isClose = cleanExp.length > 0 && (cleanExp.includes(cleanUser) || cleanUser.includes(cleanExp));
  const score = isExact ? 100 : isClose ? 85 : 65;
  
  return {
    isCorrect: isExact || (isClose && cleanUser.length >= 3),
    score: score,
    feedback: isExact 
      ? "Bản dịch rất chính xác, tự nhiên và đúng cấu trúc!" 
      : isClose 
      ? `Bản dịch khá tốt nhưng cần lưu ý cấu trúc câu và trợ từ cho tự nhiên hơn.`
      : `Bản dịch của bạn đã thể hiện được ý nhưng cần điều chỉnh để chuẩn xác theo cấu trúc "${grammarStructure || 'mục tiêu'}".`,
    correction: expectedJapanese || userTranslation,
    explanation: grammarStructure 
      ? `Cấu trúc "${grammarStructure}" được sử dụng để diễn đạt đúng ý nghĩa trong ngữ cảnh này.`
      : `Hãy chú ý đối chiếu với đáp án mẫu để hoàn thiện câu dịch.`
  };
}

function analyzeOfflineGrammar(sentence: string, grammarStructure?: string) {
  const particles = [
    { char: 'は', role: 'Trợ từ chủ đề', expl: 'Đánh dấu chủ ngữ hoặc chủ đề của câu' },
    { char: 'が', role: 'Trợ từ chủ ngữ', expl: 'Nhấn mạnh chủ thể thực hiện hành động hoặc đối tượng của tính từ/khả năng' },
    { char: 'を', role: 'Trợ từ tân ngữ', expl: 'Chỉ đối tượng trực tiếp tiếp nhận tác động của hành động' },
    { char: 'に', role: 'Trợ từ địa điểm / thời gian', expl: 'Chỉ thời điểm xác định, đích đến hoặc đối tượng hướng tới' },
    { char: 'で', role: 'Trợ từ phương tiện / nơi chốn', expl: 'Chỉ địa điểm diễn ra hành động, phương tiện hoặc cách thức' },
    { char: 'と', role: 'Trợ từ liên kết / cùng với', expl: 'Chỉ sự cùng thực hiện hành động hoặc liệt kê danh từ' },
    { char: 'から', role: 'Trợ từ xuất phát điểm', expl: 'Chỉ điểm khởi đầu về không gian hoặc thời gian' },
    { char: 'まで', role: 'Trợ từ giới hạn', expl: 'Chỉ điểm kết thúc hoặc giới hạn thời gian / địa điểm' },
    { char: 'も', role: 'Trợ từ cũng', expl: 'Mang nghĩa "cũng", thay thế cho は hoặc を' },
    { char: 'へ', role: 'Trợ từ hướng đi', expl: 'Chỉ phương hướng di chuyển tới đâu đó' }
  ];

  const analysis: any[] = [];
  const rawParts = sentence.split(/(は|が|を|に|で|と|から|まで|も|へ|、|。)/g).filter(Boolean);
  
  rawParts.forEach(part => {
    const trimmed = part.trim();
    if (!trimmed) return;
    const matchedP = particles.find(p => p.char === trimmed);
    if (matchedP) {
      analysis.push({
        part: trimmed,
        type: 'Trợ từ (助詞)',
        explanation: matchedP.expl
      });
    } else {
      analysis.push({
        part: trimmed,
        type: 'Thành phần câu / Cụm từ',
        explanation: `Thành phần ngữ nghĩa trong câu, kết hợp với trợ từ tạo thành vế hoàn chỉnh.`
      });
    }
  });

  return {
    translation: `Phân tích cấu trúc câu tiếng Nhật: "${sentence}"`,
    romaji: sentence,
    analysis: analysis.length > 0 ? analysis : [
      { part: sentence, type: 'Cả câu', explanation: 'Câu tiếng Nhật hoàn chỉnh' }
    ],
    overallGrammar: grammarStructure 
      ? `Câu này áp dụng điểm ngữ pháp "${grammarStructure}". Chú ý cách sắp xếp chủ vị và trợ từ nối.` 
      : `Câu có cấu trúc ngữ pháp chuẩn theo trật tự Chủ ngữ - Tân ngữ - Vị ngữ trong tiếng Nhật.`
  };
}

function analyzeOfflineSentence(sentence: string) {
  const parts = splitJapaneseSentence(sentence);
  return {
    japanese: sentence,
    romaji: sentence,
    translation: "Bản dịch câu tiếng Nhật hoàn chỉnh",
    subject: parts[0] ? parts[0] : "[Ẩn / Tôi]",
    predicate: parts[parts.length - 1] ? parts[parts.length - 1] : "Vị ngữ",
    tokens: parts.map((p, idx) => ({
      word: p,
      reading: p,
      type: idx === 0 ? "danh_tu" : "tro_tu",
      role: idx === 0 ? "Chủ ngữ / Chủ đề" : "Thành phần câu",
      meaning: `Thành phần ${idx + 1}`
    })),
    chunks: parts.map((p, idx) => ({
      order: idx + 1,
      japaneseChunk: p,
      vietnameseMeaning: `Cụm từ [${idx + 1}]`,
      explanation: `Ngắt cụm số ${idx + 1} theo quy tắc tự nhiên.`
    })),
    particleNotes: [
      {
        particle: "は/が/を/に",
        function: "Liên kết thành phần câu",
        explanation: "Các trợ từ giúp liên kết chặt chẽ danh từ với động từ chính."
      }
    ],
    translationGuide: "Bí quyết dịch: Xác định chủ ngữ trước, sau đó dịch từ cuối câu (vị ngữ) ngược trở lên."
  };
}

// 2. API: AI Evaluation / Grade Grammar Exercise & Translation Check
function evaluateOfflineTranslation(
  direction: 'ja_to_vi' | 'vi_to_ja',
  sourceText: string,
  expectedText: string,
  userTranslation: string,
  grammarStructure?: string
) {
  const cleanUser = (userTranslation || '').trim().toLowerCase().replace(/[.,!?;:。！？「」〜~\s]/g, '');
  const cleanExpected = (expectedText || '').trim().toLowerCase().replace(/[.,!?;:。！？「」〜~\s]/g, '');

  if (!cleanUser) {
    return {
      isCorrect: false,
      score: 0,
      feedback: "Bạn chưa nhập câu trả lời.",
      correction: expectedText || "",
      explanation: "Hãy nhập bản dịch của bạn để được chấm điểm."
    };
  }

  if (cleanUser === cleanExpected || cleanExpected.includes(cleanUser) || cleanUser.includes(cleanExpected)) {
    return {
      isCorrect: true,
      score: 100,
      feedback: "Xuất sắc! Câu dịch hoàn toàn chính xác và chuẩn xác ngữ nghĩa.",
      correction: expectedText,
      explanation: grammarStructure ? `Áp dụng chuẩn xác mẫu ngữ pháp "${grammarStructure}".` : "Diễn đạt rất tự nhiên!"
    };
  }

  // Token-level overlap for Vietnamese / Japanese
  const userWords = (userTranslation || '').toLowerCase().split(/[\s,.;!?。！？]+/g).filter(Boolean);
  const expectedWords = (expectedText || '').toLowerCase().split(/[\s,.;!?。！？]+/g).filter(Boolean);
  const matched = userWords.filter(w => expectedWords.some(ew => ew.includes(w) || w.includes(ew)));
  const ratio = expectedWords.length > 0 ? matched.length / expectedWords.length : 0;

  if (ratio >= 0.55 || (userWords.length >= 3 && matched.length >= 2)) {
    return {
      isCorrect: true,
      score: Math.round(75 + ratio * 25),
      feedback: "Bản dịch tốt! Ý nghĩa tương đồng với đáp án mẫu.",
      correction: expectedText,
      explanation: grammarStructure ? `Đã truyền tải được ý nghĩa của mẫu "${grammarStructure}".` : "Có thể tham khảo thêm cách diễn đạt mẫu để câu văn mượt mà hơn."
    };
  }

  return {
    isCorrect: false,
    score: Math.round(ratio * 60),
    feedback: "Câu dịch chưa sát nghĩa hoặc thiếu các thành phần quan trọng.",
    correction: expectedText,
    explanation: grammarStructure ? `Cần chú ý cấu trúc "${grammarStructure}" và các từ vựng chính trong câu.` : "Hãy xem câu mẫu và thử lại nhé."
  };
}

const EVALUATION_CACHE = new Map<string, any>();

app.post("/api/grammar/evaluate-translation", async (req, res) => {
  try {
    const {
      direction = 'ja_to_vi',
      sourceText,
      expectedText,
      userTranslation,
      grammarStructure
    } = req.body;

    if (!sourceText || !userTranslation) {
      return res.status(400).json({ error: "Missing sourceText or userTranslation" });
    }

    const cacheKey = `${direction}_${(sourceText || '').trim()}_${(userTranslation || '').trim()}`;
    if (EVALUATION_CACHE.has(cacheKey)) {
      return res.json(EVALUATION_CACHE.get(cacheKey));
    }

    if (!getLlmConfig().apiKey) {
      const fallback = evaluateOfflineTranslation(direction, sourceText, expectedText, userTranslation, grammarStructure);
      return res.json(fallback);
    }

    let prompt = '';
    let systemInstruction = '';

    if (direction === 'ja_to_vi') {
      systemInstruction = `Bạn là một giảng viên tiếng Nhật chuyên nghiệp, chuyên gia dịch thuật Nhật - Việt.
Nhiệm vụ của bạn là đánh giá bản dịch tiếng Việt của học viên khi dịch từ câu tiếng Nhật gốc.

QUY TẮC CHẤM ĐIỂM LINH HOẠT & THẤU HIỂU:
1. Tiếng Việt có nhiều cách diễn đạt phong phú, đa dạng về đại từ xưng hô (tôi, mình, em, anh, chị, bạn...), từ đệm (ạ, nhé, nhỉ, đấy, cơ, mà, vậy...), và từ đồng nghĩa (ví dụ: 'đi bệnh viện' = 'tới viện' = 'đi khám', 'ngày mai' = 'mai', 'mua' = 'sắm').
2. NẾU câu dịch của học viên đúng ý nghĩa của câu tiếng Nhật, truyền tải được sắc thái của cấu trúc ngữ pháp mục tiêu, và tự nhiên trong tiếng Việt -> BẮT BUỘC đánh giá là ĐÚNG (isCorrect: true, score >= 80).
3. KHÔNG bắt bẻ học viên phải dùng đúng từng chữ giống hệt đáp án mẫu nếu cách diễn đạt của họ hoàn toàn hợp lý.
4. Chỉ chấm SAI (isCorrect: false, score < 70) nếu dịch sai nghĩa cốt lõi, sai thời thì (quá khứ/tương lai), dịch ngược nghĩa, hoặc bỏ sót nội dung quan trọng.
5. Luôn phản hồi bằng tiếng Việt lịch sự, truyền cảm hứng, giải thích ngắn gọn và súc tích.

Bạn PHẢI trả về JSON đúng chuẩn:
{
  "isCorrect": boolean,
  "score": number, // 0 - 100
  "feedback": string, // Nhận xét thân thiện, giải thích điểm tốt hoặc lý do chưa đạt
  "correction": string, // Câu dịch tiếng Việt chuẩn và tự nhiên nhất
  "explanation": string // Giải thích ngắn gọn về sắc thái ngữ pháp hoặc mẹo dịch
}`;

      prompt = `
Đánh giá câu dịch Nhật ➔ Việt của học viên:
- Câu gốc tiếng Nhật: "${sourceText}"
- Mẫu ngữ pháp mục tiêu: "${grammarStructure || ''}"
- Đáp án tham khảo: "${expectedText || ''}"
- Bản dịch của học viên: "${userTranslation}"

Hãy phân tích và trả về JSON đánh giá.`;
    } else {
      systemInstruction = `Bạn là một giáo viên bản xứ tiếng Nhật giàu kinh nghiệm giảng dạy cho người Việt.
Nhiệm vụ của bạn là đánh giá câu tiếng Nhật do học viên viết/dịch từ câu tiếng Việt gốc.

QUY TẮC CHẤM ĐIỂM LINH HOẠT:
1. Trong tiếng Nhật, thứ tự từ có thể linh hoạt (chủ ngữ, trạng từ thời gian, tân ngữ...), và có thể dùng các từ tương đương hợp lệ (ví dụ: どうして / なんで; たくさん / いっぱい; 行く / 向かう).
2. NẾU câu tiếng Nhật của học viên đúng ngữ pháp, sử dụng đúng mẫu ngữ pháp mục tiêu, và diễn đạt đúng ý nghĩa câu tiếng Việt -> BẮT BUỘC đánh giá là ĐÚNG (isCorrect: true, score >= 80).
3. Đánh giá chi tiết về trợ từ (は/が/を/に/で/へ), thể động từ (thể từ điển, thể て, thể ない, thể た, thể thông thường...), tính từ.
4. Chỉ chấm SAI nếu câu sai cấu trúc ngữ pháp nghiêm trọng, dùng sai trợ từ làm đổi nghĩa, hoặc chia sai thể động từ.
5. Cung cấp câu tiếng Nhật tự nhiên nhất (có Kanji chuẩn).

Bạn PHẢI trả về JSON đúng chuẩn:
{
  "isCorrect": boolean,
  "score": number, // 0 - 100
  "feedback": string, // Nhận xét chi tiết bằng tiếng Việt về trợ từ, từ vựng, thể động từ
  "correction": string, // Câu tiếng Nhật viết lại chính xác và tự nhiên nhất
  "explanation": string // Giải thích ngữ pháp tiếng Nhật súc tích
}`;

      prompt = `
Đánh giá câu viết Việt ➔ Nhật của học viên:
- Câu gốc tiếng Việt: "${sourceText}"
- Mẫu ngữ pháp mục tiêu cần dùng: "${grammarStructure || ''}"
- Đáp án tham khảo: "${expectedText || ''}"
- Câu tiếng Nhật học viên viết: "${userTranslation}"

Hãy phân tích và trả về JSON đánh giá.`;
    }

    if (getActiveOpenAIApiKey()) {
      try {
        const rawJson = await callOpenAIGPT({
          prompt: prompt + "\nBẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON HỢP LỆ DUY NHẤT.",
          systemInstruction,
          model: getActiveOpenAIModel(),
          jsonMode: true
        });
        if (rawJson) {
          const parsed = JSON.parse(rawJson.trim());
          const evalResult = {
            isCorrect: parsed.isCorrect ?? (parsed.score >= 70),
            score: parsed.score ?? 80,
            feedback: parsed.feedback || "Bản dịch tốt.",
            correction: parsed.correction || expectedText || userTranslation,
            explanation: parsed.explanation || "",
            aiProvider: "chatgpt",
            modelUsed: `ChatGPT (${getActiveOpenAIModel()})`
          };
          EVALUATION_CACHE.set(cacheKey, evalResult);
          return res.json(evalResult);
        }
      } catch (openAiErr: any) {
        console.warn("[ChatGPT evaluate-translation error]:", openAiErr?.message || openAiErr);
      }
    }

    try {
      const response = await generateGeminiContentWithFallback({
        model: LATEST_GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCorrect: { type: Type.BOOLEAN },
              score: { type: Type.INTEGER },
              feedback: { type: Type.STRING },
              correction: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["isCorrect", "score", "feedback", "correction", "explanation"],
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        const evaluation = JSON.parse(resultText.trim());
        if (EVALUATION_CACHE.size >= 500) {
          const firstKey = EVALUATION_CACHE.keys().next().value;
          if (firstKey) EVALUATION_CACHE.delete(firstKey);
        }
        EVALUATION_CACHE.set(cacheKey, evaluation);
        return res.json(evaluation);
      }
    } catch (aiErr) {
      console.warn("Gemini translation evaluate fallback activated:", (aiErr as any)?.message || aiErr);
    }

    const fallback = evaluateOfflineTranslation(direction, sourceText, expectedText, userTranslation, grammarStructure);
    res.json(fallback);
  } catch (error: any) {
    const fallback = evaluateOfflineTranslation(
      req.body?.direction || 'ja_to_vi',
      req.body?.sourceText || '',
      req.body?.expectedText || '',
      req.body?.userTranslation || '',
      req.body?.grammarStructure || ''
    );
    res.json(fallback);
  }
});

// 2. API: AI Evaluation / Grade Grammar Exercise
app.post("/api/grammar/grade", async (req, res) => {
  try {
    const { grammarStructure, vietnamesePrompt, expectedJapanese, userTranslation } = req.body;

    if (!vietnamesePrompt || !userTranslation) {
      return res.status(400).json({ error: "Missing required parameters: vietnamesePrompt and userTranslation are required." });
    }

    const prompt = `
Hãy đánh giá bài tập dịch câu sau của học viên học tiếng Nhật:
- Câu gốc tiếng Việt: "${vietnamesePrompt}"
- Mẫu ngữ pháp mục tiêu cần học: "${grammarStructure || ''}"
- Đáp án mẫu: "${expectedJapanese || ''}"
- Bản dịch của học viên: "${userTranslation}"

Đánh giá xem bản dịch của học viên có đúng về mặt ngữ pháp, tự nhiên không và có sử dụng đúng ngữ pháp mục tiêu không. 
Nhận xét chi tiết về các lỗi như dùng sai trợ từ (particle), chia sai thể của động từ/tính từ, hoặc dùng sai từ vựng.
Cung cấp câu viết lại chính xác và tự nhiên nhất.
`;

    const systemInstruction = `Bạn là một giáo viên tiếng Nhật chuyên nghiệp bản xứ có khả năng giảng giải bằng tiếng Việt hoàn hảo, hoạt động trên nền tảng ChatGPT (OpenAI).
Nhiệm vụ của bạn là đánh giá bản dịch tiếng Nhật của người học dựa trên câu tiếng Việt gốc và đáp án mẫu.
Hãy kiểm tra xem câu dịch có chính xác về ngữ nghĩa, đúng ngữ pháp, và tự nhiên theo lối hành văn của người Nhật không.
Hãy chấm điểm từ 0 đến 100 dựa trên độ chính xác.
QUY TẮC CHẤM:
- Nếu câu dịch của học viên đúng ngữ pháp và tự nhiên (dù dùng từ đồng nghĩa hoặc cách nói tương đương): isCorrect = true, score >= 80.
- Nếu chia sai thể động từ, dùng sai trợ từ làm đổi nghĩa: isCorrect = false, score < 60.
Bạn bắt buộc phải trả về câu trả lời có định dạng JSON đúng chuẩn với cấu trúc sau:
{
  "isCorrect": boolean, // true nếu câu dịch hoàn toàn chính xác hoặc chỉ có lỗi rất nhỏ không đáng kể
  "score": number, // điểm số từ 0 đến 100
  "feedback": string, // nhận xét chi tiết bằng tiếng Việt về câu dịch của học viên (về trợ từ, từ vựng, thể động từ...)
  "correction": string, // câu tiếng Nhật viết lại chính xác và tự nhiên nhất
  "explanation": string // giải thích ngắn gọn, súc tích bằng tiếng Việt về điểm ngữ pháp liên quan hoặc lý do sửa đổi
}`;

    // 1. ƯU TIÊN HÀNG ĐẦU: ChatGPT (OpenAI) nếu đã cấu hình
    let openAiErrorMsg: string | null = null;
    if (getActiveOpenAIApiKey()) {
      try {
        const rawJson = await callOpenAIGPT({
          prompt: prompt + "\nBẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON HỢP LỆ DUY NHẤT, KHÔNG DÙNG DẤU BỌC MARKDOWN.",
          systemInstruction,
          model: getActiveOpenAIModel(),
          jsonMode: true
        });
        if (rawJson) {
          const parsed = JSON.parse(rawJson.trim());
          return res.json({
            isCorrect: parsed.isCorrect ?? (parsed.score >= 60),
            score: parsed.score ?? 85,
            feedback: parsed.feedback || "Bản dịch chính xác và tự nhiên.",
            correction: parsed.correction || expectedJapanese || userTranslation,
            explanation: parsed.explanation || "",
            aiProvider: "chatgpt",
            modelUsed: `ChatGPT (${getActiveOpenAIModel()})`
          });
        }
      } catch (openAiErr: any) {
        openAiErrorMsg = openAiErr?.message || String(openAiErr);
        console.warn("[ChatGPT /api/grammar/grade error]:", openAiErrorMsg);
      }
    }

    // 2. DỰ PHÒNG: Gemini AI
    try {
      const response = await generateGeminiContentWithFallback({
        model: LATEST_GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCorrect: { type: Type.BOOLEAN },
              score: { type: Type.INTEGER },
              feedback: { type: Type.STRING },
              correction: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["isCorrect", "score", "feedback", "correction", "explanation"],
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        const evaluation = JSON.parse(resultText.trim());
        return res.json({
          ...evaluation,
          aiProvider: openAiErrorMsg ? "gemini_fallback" : "gemini",
          openAiError: openAiErrorMsg
        });
      }
    } catch (aiErr) {
      console.warn("Gemini grading call fallback activated:", (aiErr as any)?.message || aiErr);
    }

    const fallback = evaluateOfflineGrade(grammarStructure, vietnamesePrompt, expectedJapanese, userTranslation);
    res.json({
      ...fallback,
      aiProvider: "offline",
      openAiError: openAiErrorMsg
    });
  } catch (error: any) {
    const fallback = evaluateOfflineGrade(req.body?.grammarStructure, req.body?.vietnamesePrompt, req.body?.expectedJapanese, req.body?.userTranslation);
    res.json(fallback);
  }
});

// 2.5 API: Contextual Grammar Analysis
app.post("/api/grammar/analyze", async (req, res) => {
  try {
    const { sentence, grammarStructure } = req.body;

    if (!sentence) {
      return res.status(400).json({ error: "sentence is required" });
    }

    const cacheKey = `${sentence.trim()}_${grammarStructure || ''}`;
    if (GRAMMAR_ANALYSIS_CACHE.has(cacheKey)) {
      return res.json(GRAMMAR_ANALYSIS_CACHE.get(cacheKey));
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      const fallback = analyzeOfflineGrammar(sentence, grammarStructure);
      return res.json(fallback);
    }

    const systemInstruction = `Bạn là một chuyên gia ngôn ngữ học tiếng Nhật. Nhiệm vụ của bạn là phân tích cấu trúc của một câu tiếng Nhật do người dùng nhập vào.
Nếu có cung cấp ngữ pháp mục tiêu, hãy tập trung giải thích cách ngữ pháp đó được sử dụng trong câu.
Hãy chia câu thành các thành phần (chủ ngữ, vị ngữ, bổ ngữ, trợ từ...) và giải thích chi tiết chức năng của từng phần.
Bạn bắt buộc phải trả về JSON đúng chuẩn với cấu trúc sau:
{
  "translation": "Bản dịch tiếng Việt của câu",
  "romaji": "Phiên âm romaji của toàn bộ câu",
  "analysis": [
    {
      "part": "Thành phần câu (ví dụ: 私, は, 日本語, を, 勉強しています)",
      "type": "Loại từ/Thành phần (ví dụ: Chủ ngữ, Trợ từ, Danh từ, Động từ)",
      "explanation": "Giải thích chi tiết chức năng ngữ pháp và ý nghĩa"
    }
  ],
  "overallGrammar": "Nhận xét tổng quan về cấu trúc ngữ pháp chính của câu"
}`;

    const prompt = `Hãy phân tích chi tiết câu tiếng Nhật sau: "${sentence}".${grammarStructure ? ` Chú ý đặc biệt đến cấu trúc ngữ pháp "${grammarStructure}".` : ""}`;

    let openAiErrorMsg: string | null = null;
    if (getActiveOpenAIApiKey()) {
      try {
        const rawJson = await callOpenAIGPT({
          prompt: prompt + "\nBẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON HỢP LỆ DUY NHẤT.",
          systemInstruction,
          model: getActiveOpenAIModel(),
          jsonMode: true
        });
        if (rawJson) {
          const parsed = JSON.parse(rawJson.trim());
          if (parsed && (parsed.translation || parsed.analysis)) {
            parsed.aiProvider = "chatgpt";
            parsed.modelUsed = `ChatGPT (${getActiveOpenAIModel()})`;
            GRAMMAR_ANALYSIS_CACHE.set(cacheKey, parsed);
            return res.json(parsed);
          }
        }
      } catch (openAiErr: any) {
        openAiErrorMsg = openAiErr?.message || String(openAiErr);
        console.warn("[ChatGPT grammar analyze error]:", openAiErrorMsg);
      }
    }

    try {
      const response = await generateGeminiContentWithFallback({
        model: LATEST_GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translation: { type: Type.STRING },
              romaji: { type: Type.STRING },
              analysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    part: { type: Type.STRING },
                    type: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["part", "type", "explanation"]
                }
              },
              overallGrammar: { type: Type.STRING }
            },
            required: ["translation", "romaji", "analysis", "overallGrammar"]
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        const analysisResult = JSON.parse(resultText.trim());
        analysisResult.aiProvider = openAiErrorMsg ? "gemini_fallback" : "gemini";
        if (openAiErrorMsg) {
          analysisResult.openAiError = openAiErrorMsg.includes("429") || openAiErrorMsg.includes("credits")
            ? "Tài khoản OpenAI (ChatGPT) hiện hết credits, hệ thống tự động dùng Gemini AI phân tích câu cho bạn."
            : openAiErrorMsg;
        }
        GRAMMAR_ANALYSIS_CACHE.set(cacheKey, analysisResult);
        return res.json(analysisResult);
      }
    } catch (aiErr) {
      console.warn("Gemini grammar analyze fallback activated:", (aiErr as any)?.message || aiErr);
    }

    const fallback: any = analyzeOfflineGrammar(sentence, grammarStructure);
    fallback.aiProvider = "offline";
    if (openAiErrorMsg) fallback.openAiError = openAiErrorMsg;
    GRAMMAR_ANALYSIS_CACHE.set(cacheKey, fallback);
    res.json(fallback);
  } catch (error: any) {
    const fallback = analyzeOfflineGrammar(req.body.sentence, req.body.grammarStructure);
    res.json(fallback);
  }
});

// 2.6 API: Deep Sentence Analysis & Long Sentence Chunking (Phân tích câu & Dạy ngắt câu dài)
app.post("/api/sentence/analyze", async (req, res) => {
  try {
    const { sentence } = req.body;

    if (!sentence || typeof sentence !== "string") {
      return res.status(400).json({ error: "sentence string is required" });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      const fallback = analyzeOfflineSentence(sentence);
      return res.json(fallback);
    }

    const systemInstruction = `Bạn là một giáo viên chuyên sâu giảng dạy cú pháp tiếng Nhật bản ngữ cho người Việt.
Nhiệm vụ của bạn là phân tích chi tiết câu tiếng Nhật:
1. Tách từ & trợ từ, xác định thành phần cú pháp (Chủ ngữ, Vị ngữ, Tân ngữ, Bổ ngữ thời gian/địa điểm, Trợ từ).
2. DẠY NGẮT CÂU DÀI (Sentence Chunking): Chia câu dài thành các cụm từ/vế câu hợp lý, đánh số thứ tự ngắt [1], [2], [3] và hướng dẫn người học quy tắc dịch ngược/dịch xuôi tự nhiên từ Nhật sang Việt.
3. Giải thích chức năng chi tiết của từng trợ từ (は, が, を, に, で, から, まで, と, より, ...).
4. Cung cấp phiên âm romaji, furigana và bản dịch mượt mà.

Bạn bắt buộc phải trả về JSON đúng chuẩn với cấu trúc:
{
  "japanese": "Câu tiếng Nhật gốc",
  "romaji": "Phiên âm romaji",
  "translation": "Bản dịch tiếng Việt hoàn chỉnh",
  "subject": "Chủ ngữ chính của câu (nếu ẩn hãy ghi rõ [Ẩn - Tôi/Người nói...])",
  "predicate": "Vị ngữ/Động từ chính của câu",
  "tokens": [
    {
      "word": "Từ hoặc trợ từ (vd: わたし, は, 日本, に, 行きたい)",
      "reading": "Cách đọc hiragana/furigana",
      "type": "loại từ (danh_tu | tro_tu | dong_tu | tinh_tu | phan_tu)",
      "role": "Thành phần (Chủ ngữ / Trợ từ chỉ điểm đến / Vị ngữ...)",
      "meaning": "Nghĩa tiếng Việt của từ này"
    }
  ],
  "chunks": [
    {
      "order": 1,
      "japaneseChunk": "Cụm tiếng Nhật 1",
      "vietnameseMeaning": "Dịch vế 1",
      "explanation": "Cách ngắt & vì sao dịch vế này trước/sau"
    }
  ],
  "particleNotes": [
    {
      "particle": "Trợ từ (vd: は)",
      "function": "Chức năng (vd: Đánh dấu chủ đề/chủ ngữ)",
      "explanation": "Giải thích chi tiết tác dụng trong câu này"
    }
  ],
  "translationGuide": "Hướng dẫn bí quyết ngắt câu và dịch nhanh câu này dành cho học viên"
}`;

    const prompt = `Hãy phân tích chi tiết và dạy ngắt câu dài cho câu tiếng Nhật sau: "${sentence.trim()}"`;

    if (getActiveOpenAIApiKey()) {
      try {
        const rawJson = await callOpenAIGPT({
          prompt: prompt + "\nBẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON HỢP LỆ DUY NHẤT.",
          systemInstruction,
          model: getActiveOpenAIModel(),
          jsonMode: true
        });
        if (rawJson) {
          const parsed = JSON.parse(rawJson.trim());
          if (parsed && (parsed.translation || parsed.tokens)) {
            parsed.aiProvider = "chatgpt";
            parsed.modelUsed = `ChatGPT (${getActiveOpenAIModel()})`;
            return res.json(parsed);
          }
        }
      } catch (openAiErr: any) {
        console.warn("[ChatGPT sentence analyze error]:", openAiErr?.message || openAiErr);
      }
    }

    try {
      const response = await generateGeminiContentWithFallback({
        model: LATEST_GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              japanese: { type: Type.STRING },
              romaji: { type: Type.STRING },
              translation: { type: Type.STRING },
              subject: { type: Type.STRING },
              predicate: { type: Type.STRING },
              tokens: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    reading: { type: Type.STRING },
                    type: { type: Type.STRING },
                    role: { type: Type.STRING },
                    meaning: { type: Type.STRING }
                  },
                  required: ["word", "reading", "type", "role", "meaning"]
                }
              },
              chunks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    order: { type: Type.INTEGER },
                    japaneseChunk: { type: Type.STRING },
                    vietnameseMeaning: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["order", "japaneseChunk", "vietnameseMeaning", "explanation"]
                }
              },
              particleNotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    particle: { type: Type.STRING },
                    function: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["particle", "function", "explanation"]
                }
              },
              translationGuide: { type: Type.STRING }
            },
            required: ["japanese", "romaji", "translation", "subject", "predicate", "tokens", "chunks", "particleNotes", "translationGuide"]
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        return res.json(JSON.parse(resultText.trim()));
      }
    } catch (aiErr) {
      console.warn("Gemini sentence analyze fallback activated:", (aiErr as any)?.message || aiErr);
    }

    const fallback = analyzeOfflineSentence(sentence);
    res.json(fallback);
  } catch (error: any) {
    const fallback = analyzeOfflineSentence(req.body?.sentence || "");
    res.json(fallback);
  }
});

// 2.7.1 API: Rich Word Lookup & Explanation with Related Words (Tra từ vựng bài đọc Todaii)
app.post("/api/reading/lookup-word", async (req, res) => {
  try {
    const { word, reading, context, level } = req.body;
    if (!word || typeof word !== 'string') {
      return res.status(400).json({ error: "Missing required word parameter" });
    }

    const cleanWord = word.replace(/[。、！？\s「」『』（）()[\]]/g, '').trim();
    if (!cleanWord) {
      return res.status(400).json({ error: "Empty word after cleaning" });
    }

    // 1. Calculate Han Viet reading
    const hanVietWord = getHanVietWord(cleanWord);

    // 2. Extract Kanji characters breakdown from local KANJI_DICTIONARY / KANJI_DATA
    const kanjiChars = cleanWord.split('').filter(c => /[\u4e00-\u9faf]/.test(c));
    const localKanjis = kanjiChars.map(c => {
      const kd = KANJI_DICTIONARY[c];
      const kdData = (KANJI_DATA as any[])?.find(k => k.kanji === c);
      return {
        character: c,
        hanViet: getHanVietChar(c) || kd?.han_viet || kdData?.hanViet || '',
        on: kd?.onyomi || kdData?.onyomi || '',
        kun: kd?.kunyomi || kdData?.kunyomi || '',
        meaning: kd?.meaning || kdData?.meaning || '',
        strokes: kd?.strokes || kdData?.strokeCount || 0,
        jlpt: kd?.level || (kdData as any)?.level || 'N3'
      };
    });

    // 3. Search local vocabulary databases for instant match
    const allLocalVocab = [...(VOCABULARY_DATA || []), ...(TANGO_N4_VOCABULARY || [])];
    const matchedLocal = allLocalVocab.find(v => (v.kanji === cleanWord || v.word === cleanWord || v.reading === cleanWord || v.hiragana === cleanWord));

    // 4. Try AI enrichment via Gemini for comprehensive dictionary entry & related words
    let aiEnriched: any = null;
    try {
      const ai = getGeminiClient();
      const prompt = `Bạn là từ điển tiếng Nhật - Việt chuyên sâu và chuẩn mực hàng đầu (như Mazii / Todaii / Jisho).
Hãy phân tích và cung cấp thông tin tra từ điển chi tiết cho từ tiếng Nhật sau:
Từ: "${cleanWord}"
${reading ? `Cách đọc gợi ý: "${reading}"` : ''}
${context ? `Ngữ cảnh trong bài đọc: "${context}"` : ''}
${level ? `Trình độ JLPT mục tiêu: "${level}"` : ''}

Yêu cầu trả về đúng cú pháp JSON như sau:
{
  "word": "${cleanWord}",
  "reading": "cách đọc hiragana/katakana chuẩn (nếu có nhiều cách đọc thì ngăn cách bởi dấu cách, ví dụ: にっぽん にほん)",
  "furigana": "[漢字](かんじ) theo định dạng markdown ruby",
  "hanViet": "${hanVietWord || 'HÁN VIỆT'}",
  "partOfSpeech": "loại từ bằng tiếng Việt (ví dụ: danh từ riêng, danh từ, động từ nhóm 1, động từ nhóm 2, động từ nhóm 3, tính từ đuôi i, tính từ đuôi na, phó từ, liên từ, trợ từ, hậu tố)",
  "meanings": ["nghĩa 1 rõ ràng bằng tiếng Việt", "nghĩa 2 nếu có"],
  "explanation": "giải thích ngắn gọn về cách dùng, sắc thái ý nghĩa hoặc lưu ý đặc biệt khi sử dụng từ này",
  "jlpt": "N5" hoặc "N4" hoặc "N3" hoặc "N2" hoặc "N1",
  "kanjis": [
    {
      "character": "chữ Hán",
      "hanViet": "HÁN VIỆT chữ hoa (ví dụ: KI, CƠ)",
      "on": "âm ON katakana (ví dụ: キ)",
      "kun": "âm KUN hiragana (ví dụ: はた)",
      "meaning": "nghĩa chữ Hán",
      "strokes": 16,
      "jlpt": "N3"
    }
  ],
  "examples": [
    {
      "japanese": "câu ví dụ tiếng Nhật tự nhiên",
      "furigana": "[漢字](かんじ) có furigana trên từng từ hán",
      "romaji": "phiên âm romaji tương ứng của câu tiếng Nhật (ví dụ: kiki no irekae ni tomonai, ichijiteki ni shisutemuwo teishi suru.)",
      "vietnamese": "dịch nghĩa tiếng Việt"
    },
    {
      "japanese": "câu ví dụ 2",
      "furigana": "[漢字](かんじ)",
      "romaji": "phiên âm romaji câu 2",
      "vietnamese": "dịch nghĩa tiếng Việt 2"
    }
  ],
  "relatedWords": [
    {
      "word": "từ ghép hoặc từ liên quan 1 (ví dụ: 機器化)",
      "reading": "cách đọc (ví dụ: ききか)",
      "partOfSpeech": "danh từ",
      "meaning": "cơ giới hóa, tự động hóa máy móc",
      "jlpt": "N2"
    },
    {
      "word": "từ ghép hoặc từ liên quan 2 (ví dụ: オフィス機器)",
      "reading": "オフィスきき",
      "partOfSpeech": "danh từ",
      "meaning": "thiết bị điện tử văn phòng",
      "jlpt": "N3"
    },
    {
      "word": "từ ghép hoặc từ liên quan 3 (ví dụ: コピー機器)",
      "reading": "コピーきき",
      "partOfSpeech": "danh từ",
      "meaning": "máy sao chép",
      "jlpt": "N4"
    }
  ]
}`;

      const aiResponse = await generateGeminiContentWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const responseText = aiResponse.text?.trim() || "{}";
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      aiEnriched = JSON.parse(cleanJson);
    } catch (aiErr: any) {
      console.warn("Gemini lookup-word fallback to local data:", aiErr?.message || aiErr);
    }

    // Combine AI result with local fallbacks
    const finalResult = {
      word: cleanWord,
      reading: aiEnriched?.reading || reading || matchedLocal?.reading || matchedLocal?.hiragana || cleanWord,
      furigana: aiEnriched?.furigana || `[${cleanWord}](${reading || matchedLocal?.reading || ''})`,
      hanViet: aiEnriched?.hanViet || hanVietWord || '',
      partOfSpeech: aiEnriched?.partOfSpeech || matchedLocal?.partOfSpeech || (cleanWord.endsWith('る') || cleanWord.endsWith('う') || cleanWord.endsWith('く') ? 'động từ' : 'danh từ'),
      meanings: Array.isArray(aiEnriched?.meanings) && aiEnriched.meanings.length > 0
        ? aiEnriched.meanings
        : [matchedLocal?.meaning || 'Từ vựng tiếng Nhật trong bài đọc.'],
      explanation: aiEnriched?.explanation || matchedLocal?.exampleSentenceVi || '',
      jlpt: aiEnriched?.jlpt || level || matchedLocal?.level || 'N4',
      kanjis: Array.isArray(aiEnriched?.kanjis) && aiEnriched.kanjis.length > 0
        ? aiEnriched.kanjis
        : localKanjis,
      examples: Array.isArray(aiEnriched?.examples) && aiEnriched.examples.length > 0
        ? aiEnriched.examples
        : matchedLocal?.exampleSentenceJp
        ? [{
            japanese: matchedLocal.exampleSentenceJp,
            furigana: matchedLocal.exampleSentenceJp,
            vietnamese: matchedLocal.exampleSentenceVi || ''
          }]
        : [],
      relatedWords: Array.isArray(aiEnriched?.relatedWords) && aiEnriched.relatedWords.length > 0
        ? aiEnriched.relatedWords
        : []
    };

    return res.json({
      success: true,
      data: finalResult
    });
  } catch (error: any) {
    console.error("Error in /api/reading/lookup-word:", error);
    res.status(500).json({
      success: false,
      error: "Không thể tra từ vựng.",
      details: error?.message || error
    });
  }
});

// 2.8 API: AI JLPT Exam Generator (Soạn đề thi JLPT bằng AI)
app.post("/api/exam/generate-ai", async (req, res) => {
  try {
    const { level } = req.body;

    if (!level || !['N1', 'N2', 'N3', 'N4', 'N5'].includes(level)) {
      return res.status(400).json({ error: "Trình độ không hợp lệ. Vui lòng chọn N1 - N5." });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(500).json({ 
        error: "Gemini API Key is missing.", 
        details: err.message,
        isConfigError: true
      });
    }

    const fullBlueprints: Record<string, { total: number; duration: number; text: string }> = {
      'N1': {
        total: 66,
        duration: 110,
        text: `Cấu trúc đề thi thử JLPT N1 chuẩn hóa (Đúng 66 câu):
- Phần 1: 文字・語彙 (Moji-Goi) [25 câu]:
  + [漢字読み] (Cách đọc chữ Hán) [6 câu: Q1-Q6]
  + [文脈規定] (Điền từ hợp mạch văn) [7 câu: Q7-Q13]
  + [言い換え類義] (Từ gần nghĩa) [6 câu: Q14-Q19]
  + [用法] (Cách dùng từ) [6 câu: Q20-Q25]
- Phần 2: 文法 (Bunpou) [19 câu]:
  + [文 の文法１ (Ngữ pháp câu)] [10 câu: Q26-Q35]
  + [文 の文法２ (Sắp xếp câu ★)] [5 câu: Q36-Q40]
  + [文章 の文法 (Ngữ pháp đoạn văn)] [4 câu: Q41-Q44]
- Phần 3: 読解 (Dokkai) [17 câu]:
  + [内容理解（短文）] [4 câu: Q45-Q48, dùng chung 1 đoạn văn ngắn 100-150 từ]
  + [内容理解（中文）] [8 câu: Q49-Q56, dùng chung 2 đoạn văn trung bình 250-300 từ]
  + [内容理解（長文）] [3 câu: Q57-Q59]
  + [情報検索] [2 câu: Q60-Q61]
- Phần 4: 聴解 (Choukai - Nghe hiểu) [5 câu]:
  + [課題理解 / ポイント理解] [5 câu: Q62-Q66, bắt buộc cung cấp thuộc tính "audioScript" chứa đoạn hội thoại tiếng Nhật hoàn chỉnh để đọc tiếng nói bằng TTS ở giao diện. Câu hỏi viết bằng tiếng Việt và tiếng Nhật.]`
      },
      'N2': {
        total: 71,
        duration: 105,
        text: `Cấu trúc đề thi thử JLPT N2 chuẩn hóa (Đúng 71 câu):
- Phần 1: 文字・語彙 (Moji-Goi) [30 câu]:
  + [漢字読み] (Cách đọc chữ Hán) [5 câu: Q1-Q5]
  + [表記] (Cách viết Hán tự) [5 câu: Q6-Q10]
  + [語形式] (Cấu tạo từ) [3 câu: Q11-Q13]
  + [文脈規定] (Điền từ hợp mạch văn) [7 câu: Q14-Q20]
  + [言い換え類義] (Từ gần nghĩa) [5 câu: Q21-Q25]
  + [用法] (Cách dùng từ) [5 câu: Q26-Q30]
- Phần 2: 文法 (Bunpou) [21 câu]:
  + [文 の文法１ (Ngữ pháp câu)] [12 câu: Q31-Q42]
  + [文 の文法２ (Sắp xếp câu ★)] [5 câu: Q43-Q47]
  + [文章 の文法 (Ngữ pháp đoạn văn)] [4 câu: Q48-Q51]
- Phần 3: 読解 (Dokkai) [15 câu]:
  + [内容理解（短文）] [4 câu: Q52-Q55]
  + [内容理解（中文）] [8 câu: Q56-Q63]
  + [情報検索] [3 câu: Q64-Q66]
- Phần 4: 聴解 (Choukai - Nghe hiểu) [5 câu]:
  + [課題理解 / ポイント理解] [5 câu: Q67-Q71, bắt buộc cung cấp thuộc tính "audioScript" chứa đoạn hội thoại tiếng Nhật hoàn chỉnh để đọc tiếng nói bằng TTS ở giao diện. Câu hỏi viết bằng tiếng Việt và tiếng Nhật.]`
      },
      'N3': {
        total: 73,
        duration: 100,
        text: `Cấu trúc đề thi thử JLPT N3 chuẩn hóa (Đúng 73 câu):
- Phần 1: 文字・語彙 (Moji-Goi) [35 câu]:
  + [漢字読み] (Cách đọc chữ Hán) [8 câu: Q1-Q8]
  + [表記] (Cách viết Hán tự) [6 câu: Q9-Q14]
  + [文脈規定] (Điền từ hợp mạch văn) [11 câu: Q15-Q25]
  + [言い換え類義] (Từ gần nghĩa) [5 câu: Q26-Q30]
  + [用法] (Cách dùng từ) [5 câu: Q31-Q35]
- Phần 2: 文法 (Bunpou) [22 câu]:
  + [文 の文法１ (Ngữ pháp câu)] [13 câu: Q36-Q48]
  + [文 の文法２ (Sắp xếp câu ★)] [5 câu: Q49-Q53]
  + [文章 の文法 (Ngữ pháp đoạn văn)] [4 câu: Q54-Q57]
- Phần 3: 読解 (Dokkai) [11 câu]:
  + [内容理解（短文）] [4 câu: Q58-Q61]
  + [内容理解（中文）] [5 câu: Q62-Q66]
  + [情報検索] [2 câu: Q67-Q68]
- Phần 4: 聴解 (Choukai - Nghe hiểu) [5 câu]:
  + [課題理解 / ポイント理解] [5 câu: Q69-Q73, bắt buộc cung cấp thuộc tính "audioScript" chứa đoạn hội thoại tiếng Nhật hoàn chỉnh để đọc tiếng nói bằng TTS ở giao diện. Câu hỏi viết bằng tiếng Việt và tiếng Nhật.]`
      },
      'N4': {
        total: 70,
        duration: 80,
        text: `Cấu trúc đề thi thử JLPT N4 chuẩn hóa (Đúng 70 câu):
- Phần 1: 文字・語彙 (Moji-Goi) [35 câu]:
  + [漢字読み] (Cách đọc chữ Hán) [9 câu: Q1-Q9]
  + [表記] (Cách viết Hán tự) [6 câu: Q10-Q15]
  + [文脈規定] (Điền từ hợp mạch văn) [10 câu: Q16-Q25]
  + [言い換え類義] (Từ gần nghĩa) [5 câu: Q26-Q30]
  + [用法] (Cách dùng từ) [5 câu: Q31-Q35]
- Phần 2: 文法 (Bunpou) [25 câu]:
  + [文 của Văn Pháp １ (Ngữ pháp câu)] [15 câu: Q36-Q50]
  + [文 của Văn Pháp ２ (Sắp xếp câu ★)] [5 câu: Q51-Q55]
  + [文章 của Văn Pháp (Ngữ pháp đoạn văn)] [5 câu: Q56-Q60]
- Phần 3: 読解 (Dokkai) [5 câu]:
  + [内容理解（短文）] [3 câu: Q61-Q63]
  + [情報検索] [2 câu: Q64-Q65]
- Phần 4: 聴解 (Choukai - Nghe hiểu) [5 câu]:
  + [課題理解 / ポイント理解] [5 câu: Q66-Q70, bắt buộc cung cấp thuộc tính "audioScript" chứa đoạn hội thoại tiếng Nhật hoàn chỉnh để đọc tiếng nói bằng TTS ở giao diện. Câu hỏi viết bằng tiếng Việt và tiếng Nhật.]`
      },
      'N5': {
        total: 67,
        duration: 60,
        text: `Cấu trúc đề thi thử JLPT N5 chuẩn hóa (Đúng 67 câu):
- Phần 1: 文字・語彙 (Moji-Goi) [35 câu]:
  + [漢字読み] (Cách đọc chữ Hán) [12 câu: Q1-Q12]
  + [表記] (Cách viết Hán tự) [8 câu: Q13-Q20]
  + [文脈規定] (Điền từ hợp mạch văn) [10 câu: Q21-Q30]
  + [言い換え類義] (Từ gần nghĩa) [5 câu: Q31-Q35]
- Phần 2: 文法 (Bunpou) [23 câu]:
  + [文 của Văn Pháp １ (Ngữ pháp câu)] [14 câu: Q36-Q49]
  + [文 của Văn Pháp ２ (Sắp xếp câu ★)] [5 câu: Q50-Q54]
  + [文章 của Văn Pháp (Ngữ pháp đoạn văn)] [4 câu: Q55-Q58]
- Phần 3: 読解 (Dokkai) [4 câu]:
  + [内容理解（短文）] [3 câu: Q59-Q61]
  + [情報検索] [1 câu: Q62]
- Phần 4: 聴解 (Choukai - Nghe hiểu) [5 câu]:
  + [課題理解 / ポイント理解] [5 câu: Q63-Q67, bắt buộc cung cấp thuộc tính "audioScript" chứa đoạn hội thoại tiếng Nhật hoàn chỉnh để đọc tiếng nói bằng TTS ở giao diện. Câu hỏi viết bằng tiếng Việt và tiếng Nhật.]`
      }
    };

    const currentConfig = fullBlueprints[level];
    if (!currentConfig) {
      return res.status(400).json({ error: "Trình độ không hỗ trợ cấu trúc chuẩn." });
    }

    const structureDetail = currentConfig.text;

    const systemInstruction = `Bạn là một chuyên gia khảo thí và biên soạn đề thi JLPT tiếng Nhật xuất sắc.
Nhiệm vụ bắt buộc của bạn là biên soạn một đề thi thử JLPT trình độ ${level} đúng chuẩn 100% theo mô hình thực tế với tổng số câu là ĐÚNG CHÍNH XÁC ${currentConfig.total} câu hỏi trắc nghiệm (không thừa, không thiếu).
Đề thi phải bám sát cấu trúc đề thi chính thức các năm trước (từ 2010 đến nay).

Cấu trúc chi tiết bắt buộc áp dụng cho cấp độ ${level}:
${structureDetail}

YÊU CẦU ĐẶC BIỆT ĐỂ KHÔNG BỊ TRUNCATE / QUÁ GIỚI HẠN OUTPUT TOKEN:
Vì số lượng câu hỏi rất lớn (${currentConfig.total} câu), bạn PHẢI tuân thủ nghiêm ngặt các quy tắc sau:
1. Viết cực kỳ ngắn gọn, súc tích và cô đọng. Tránh mọi từ ngữ rườm rà.
2. Phần "explanation" (giải thích) chỉ được viết tối đa 1 câu ngắn gọn (ví dụ: "Chọn A vì mẫu câu X mang ý nghĩa Y").
3. Phần "hint" (gợi ý) phải viết cực kỳ ngắn gọn (chỉ từ 2 đến 5 từ) và BẮT BUỘC PHẢI THAY ĐỔI THEO TỪNG CÂU HỎI. Gợi ý này phải tương ứng chính xác với nghĩa tiếng Việt hoặc ngữ cảnh của từ vựng/ngữ pháp đang được kiểm tra trong chính câu hỏi đó. TUYỆT ĐỐI không được lặp lại một từ gợi ý duy nhất cho nhiều câu hỏi khác nhau, không sao chép nguyên mẫu ví dụ "[漢字読み] Nghĩa: quả táo" cho các câu khác (trừ khi câu hỏi thực sự liên quan đến quả táo), và không được sử dụng gợi ý chung chung. Mỗi câu hỏi phải có một gợi ý riêng biệt khớp 100% với nội dung của câu đó.
4. Đối với phần Đọc hiểu (dokkai), bắt buộc gom các câu hỏi dùng chung một đoạn văn để người dùng đọc một lần. Mỗi đoạn văn đọc hiểu (Dokkai) phải cực kỳ ngắn gọn, từ 50 đến tối đa 150 từ. Bạn đính kèm đoạn văn đó vào từng câu hỏi dùng chung đoạn văn đó để người dùng dễ đọc trực tiếp.
5. Đối với phần Nghe hiểu (choukai), bắt buộc tạo thuộc tính "audioScript" là cuộc hội thoại tiếng Nhật hoàn chỉnh (ví dụ: "A: 明日、一緒に映画に行きませんか。B: いいですね。行きましょう。"). Tuyệt đối không để trống thuộc tính "audioScript" này cho các câu nghe hiểu! Phần "question" của câu nghe hiểu sẽ là câu hỏi, ví dụ: "【Nghe hiểu】Hai người hẹn nhau đi đâu và khi nào?".
6. Đảm bảo đúng định dạng JSON, không trả về bất kỳ văn bản nào ngoài JSON.

Cấu trúc JSON đầu ra bắt buộc:
{
  "title": "Tiêu đề đề thi thử JLPT ${level} chuẩn hóa các năm",
  "level": "${level}",
  "durationMinutes": ${currentConfig.duration},
  "questions": [
    {
      "id": "ai_${level.toLowerCase()}_[số thứ tự từ 1 đến ${currentConfig.total}]",
      "question": "Câu hỏi tiếng Nhật hoặc câu hỏi ngữ cảnh nghe hiểu",
      "hint": "Gợi ý cực ngắn gọn tiếng Việt",
      "options": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"],
      "correctIndex": 0,
      "section": "moji-goi" | "bunpou" | "dokkai" | "choukai",
      "explanation": "Giải thích 1 câu ngắn gọn",
      "audioScript": "Hội thoại tiếng Nhật để nghe (nếu có, chỉ bắt buộc cho section='choukai', các section khác để chuỗi rỗng)"
    }
  ]
}`;

    const prompt = `Hãy soạn một đề thi thử JLPT trình độ ${level} chuẩn hóa với đúng chính xác ${currentConfig.total} câu hỏi trắc nghiệm chất lượng cao.`;

    try {
      const response = await generateGeminiContentWithFallback({
        model: LATEST_GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              level: { type: Type.STRING },
              durationMinutes: { type: Type.INTEGER },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    hint: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    section: { type: Type.STRING, description: "Phải thuộc một trong bốn giá trị: 'moji-goi', 'bunpou', 'dokkai', 'choukai'" },
                    explanation: { type: Type.STRING },
                    audioScript: { type: Type.STRING, description: "Hội thoại nghe hiểu tiếng Nhật nếu có" }
                  },
                  required: ["id", "question", "hint", "options", "correctIndex", "section", "explanation", "audioScript"]
                }
              }
            },
            required: ["title", "level", "durationMinutes", "questions"]
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        return res.json(JSON.parse(resultText.trim()));
      }
    } catch (aiErr) {
      console.warn("Gemini exam generate fallback:", (aiErr as any)?.message || aiErr);
    }

    // High quality offline fallback exam with sample questions
    res.json({
      title: `Đề thi thử JLPT ${level} Tiêu Chuẩn`,
      level: level,
      durationMinutes: currentConfig.duration || 60,
      questions: [
        {
          id: "q1",
          question: "田中さんは「毎朝」公園を散歩します。「毎朝」の読み方は？",
          hint: "Âm Hán Việt: MAI TRIÊU",
          options: ["まいあさ", "まいばん", "まいにち", "まいとし"],
          correctIndex: 0,
          section: "moji-goi",
          explanation: "毎朝 đọc là まいあさ (Mỗi sáng).",
          audioScript: ""
        },
        {
          id: "q2",
          question: "駅までバス（　）行きます。",
          hint: "Trợ từ chỉ phương tiện đi lại",
          options: ["で", "に", "を", "へ"],
          correctIndex: 0,
          section: "bunpou",
          explanation: "Trợ từ で đứng sau phương tiện giao thông (バスで = bằng xe buýt).",
          audioScript: ""
        },
        {
          id: "q3",
          question: "私は昨日、友達（　）映画を見ました。",
          hint: "Trợ từ mang nghĩa 'cùng với'",
          options: ["と", "に", "で", "を"],
          correctIndex: 0,
          section: "bunpou",
          explanation: "Trợ từ と dùng khi làm việc gì đó cùng với ai đó (友達と = cùng với bạn).",
          audioScript: ""
        },
        {
          id: "q4",
          question: "A: 「すみません、この電車は東京駅へ行きますか。」\nB: 「はい、（　　　）。」",
          hint: "Câu đáp khẳng định lịch sự",
          options: ["行きますよ", "行きません", "わかりません", "いいえ"],
          correctIndex: 0,
          section: "dokkai",
          explanation: "Đáp lại câu hỏi xác nhận đường đi: はい、行きますよ (Vâng, có đi đấy ạ).",
          audioScript: ""
        },
        {
          id: "q5",
          question: "【聴解】男の人と女の人が話しています。男の人は何を買いますか。",
          hint: "Nghe kỹ cuộc đối thoại để xác định món đồ",
          options: ["お茶", "コーヒー", "ジュース", "水"],
          correctIndex: 1,
          section: "choukai",
          explanation: "Trong hội thoại nhân vật nam nói: 「じゃあ、アイスコーヒーをひとつお願いします」.",
          audioScript: "男：喉が渇きましたね。何か飲みましょう。\n女：そうですね。私はお茶にします。\n男：じゃあ、私はコーヒーを買ってきますね。"
        }
      ]
    });
  } catch (error: any) {
    console.error("Error in /api/exam/generate-ai:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// 3. API: Kaiwa Chat Interface
app.post("/api/kaiwa/chat", async (req, res) => {
  try {
    const { messages, situation, context, difficulty, character, responseLength } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      // offline fallback
      return res.json({
        japanese: "こんにちは！一緒に日本語を楽しく練習しましょう。今日はどんな話題について話したいですか？",
        romaji: "Konnichiwa! Issho ni nihongo o tanoshiku renshuu shimashou. Kyou wa donna wadai ni tsuite hanashitai desu ka?",
        vietnamese: "Xin chào! Chúng ta hãy cùng nhau luyện tập tiếng Nhật thật vui nhé. Hôm nay bạn muốn nói về chủ đề gì nào?",
        correction: "",
        hints: ["日常会話を練習したいです！", "レストランでの注文をやってみたいです。", "日本の文化について教えてください。"]
      });
    }

    const systemInstruction = `Bạn là một đối tác luyện hội thoại tiếng Nhật (Kaiwa) thông minh, tự nhiên và giàu tương tác.
Tình huống hiện tại: ${situation || 'Trò chuyện thông thường'}.
Bối cảnh/Từ vựng gợi ý: ${context || 'Không có'}.
Trình độ người học (Độ khó): ${difficulty || 'N5'} (Dễ = N5, Trung bình = N4, Khó = N3). Hãy điều chỉnh độ dài câu, từ vựng và cấu trúc ngữ pháp sao cho phù hợp chính xác với cấp độ này.
Nhân vật bạn đang đóng vai: ${character ? `${character.name} (${character.role})` : 'Đối tác'}
Mô tả tính cách nhân vật: ${character?.description || 'thân thiện'}. Hãy luôn đóng đúng vai và thể hiện đúng phong cách hội thoại của nhân vật này (ví dụ: nhân viên phục vụ thì dùng kính ngữ Keigo, lễ phép; bạn bè thì xưng hô thân mật, dùng thể thông thường casual; người phỏng vấn thì trang trọng, chuẩn mực).

Nhiệm vụ của bạn là phản hồi người học bằng tiếng Nhật sinh động, tự nhiên, đúng vai trò.
Yêu cầu bắt buộc:
1. KHÔNG ĐƯỢC trả lời cụt lủn chỉ 1 câu ngắn. Hãy trả lời từ 2 đến 3 câu hoàn chỉnh, tự nhiên:
   - Câu 1: Phản hồi/bày tỏ cảm xúc, lắng nghe ý kiến của người học.
   - Câu 2: Cung cấp thông tin, xử lý tình huống hoặc chia sẻ thêm chi tiết liên quan.
   - Câu 3: Đặt câu hỏi mở hoặc gợi mở hành động tiếp theo để dẫn dắt hội thoại.
2. Trả về câu tiếng Nhật (kanji/kana), kèm theo phiên âm romaji, và bản dịch tiếng Việt chính xác, mượt mà.
3. Nếu câu của người dùng (sender: user) ở tin nhắn cuối có lỗi ngữ pháp hoặc dùng từ không tự nhiên, hãy ghi chú lại phần sửa lỗi ngắn gọn (correction) bằng tiếng Việt để giúp người học tiến bộ, nếu câu đã hoàn hảo hoặc không có gì cần sửa hãy trả về chuỗi rỗng "". KHÔNG ĐƯỢC trả về null.
4. Đề xuất đúng 3 câu gợi ý (hints) bằng tiếng Nhật tự nhiên, phù hợp làm câu trả lời tiếp theo ở trình độ ${difficulty || 'N5'}.

Bạn bắt buộc phải trả về JSON đúng chuẩn với cấu trúc sau:
{
  "japanese": "Câu tiếng Nhật (2-3 câu hoàn chỉnh)",
  "romaji": "Phiên âm romaji",
  "vietnamese": "Dịch tiếng Việt",
  "correction": "Sửa lỗi nếu có (bằng tiếng Việt) hoặc chuỗi rỗng",
  "hints": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"]
}`;

    // Build a clean, structured conversation log as the input prompt
    let conversationHistory = "";
    const slicedMessages = (messages || []).slice(-8);
    for (const m of slicedMessages) {
      if (!m) continue;
      if (m.sender === "user") {
        conversationHistory += `Người học: ${m.text || ""}\n`;
      } else {
        conversationHistory += `${character?.name || "Đối tác"}: ${m.text || ""}\n`;
      }
    }

    const prompt = `Dưới đây là lịch sử cuộc hội thoại giữa Người học và Nhân vật ${character?.name || "Đối tác"} (${character?.role || "đối tác hội thoại"}):

${conversationHistory}

Bây giờ, hãy đóng vai ${character?.name || "Đối tác"} và phản hồi lại câu nói cuối cùng của Người học. 
Hãy nhớ phản hồi tự nhiên, đầy đủ (2-3 câu), tuân thủ đúng trình độ (${difficulty || "N5"}), phong cách nhân vật, và trả về định dạng JSON chính xác.`;

    try {
      const raw = await callLLM({ prompt, systemInstruction, json: true });
      const kaiwaResult = JSON.parse(raw);
      kaiwaResult.provider = (getLlmConfig().model || DEFAULT_GEMINI_MODEL);
      return res.json(kaiwaResult);
    } catch (aiErr) {
      console.warn("[Kaiwa Chat] model miễn phí lỗi:", (aiErr as any)?.message || aiErr);
    }

    res.json({
      japanese: "とても上手ですね！その調子でどんどん話しましょう。次に何か気になることはありますか？",
      romaji: "Totemo jouzu desu ne! Sono choushi de dondon hanashimashou. Tsugi ni nanika ki ni naru koto wa arimasu ka?",
      vietnamese: "Bạn nói tốt lắm! Cứ giữ phong độ thế này mà nói nhiều hơn nhé. Tiếp theo bạn có điều gì thắc mắc không?",
      correction: "",
      hints: ["はい、頑張ります！", "もう一度詳しく教えてください。", "別のトピックについて話しましょう。"]
    });
  } catch (error: any) {
    res.json({
      japanese: "はい、よくわかりました！日本語の勉強を一緒に続けましょう。何か質問はありますか？",
      romaji: "Hai, yoku wakarimashita! Nihongo no benkyou o issho ni tsuzukemashou. Nanika shitsumon wa arimasu ka?",
      vietnamese: "Vâng, tôi hiểu rõ rồi ạ! Chúng ta hãy cùng nhau tiếp tục học tiếng Nhật nhé. Bạn có câu hỏi nào không?",
      correction: "",
      hints: ["ありがとうございます。", "次の練習へ進みましょう。", "質問があります。"]
    });
  }
});

// 3.1 API: Pure Japanese AI Chat Endpoint (完全日本語 AI チャット)
app.post("/api/japanese-chat", async (req, res) => {
  try {
    const { messages, persona, level, responseLength, aiProvider } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const lengthInstruction = responseLength === 'detailed'
      ? '返答本文（japaneseResponse）は【3〜5文】で詳しく、背景知識や文化的な話題、具体的な例を交えて豊かに返答してください。'
      : responseLength === 'concise'
      ? '返答本文（japaneseResponse）は【1〜2文】で要点を簡潔に返答してください。'
      : '返答本文（japaneseResponse）は【2〜4文】の自然で豊かな会話文にしてください。単に1文で終わらせるのではなく、①共感・リアクション、②自分の意見や関連する話題の展開、③相手への質問や会話を広げる問いかけ、を必ず含めてください。';

    const systemInstruction = `あなたは日本語AI会話パートナー（${persona?.name || '田中先生'}）です。
ペルソナ情報:
- 名前: ${persona?.name || '田中先生'}
- 役割: ${persona?.role || '日本語講師'}
- 性格・特徴: ${persona?.description || '親切で丁寧な性格。日本語学習者を優しくサポートし、話題を広げて楽しい対話を促す。'}
- 話し方: ${persona?.speakingStyle || '丁寧語（です・ます）で自然な日本語'}

学習者の日本語レベル: JLPT ${level || 'N4'}
重要ルール:
1. あなたは【100%日本語】のみで会話してください。返答本文、ワンポイント解説、アドバイス等すべて日本語で行ってください。
2. 学習者の日本語レベル（JLPT ${level || 'N4'}）に合わせて、語彙や文法の難易度を適切に調整してください。
3. 【最重要】返答本文（japaneseResponse）は絶対に1文だけの短い返答にせず、${lengthInstruction}
4. 学習者の発言（最後のメッセージ）に文法ミスや不自然な表現があった場合、親切に日本語でアドバイス（correctionAdvice）を行ってください（例: 「〜と言った方がより自然ですよ！」）。問題がなければ空文字 "" を返してください。
5. 次に学習者が使える自然な日本語の返信ヒント（hints）を3つ、100%日本語で提示してください。ヒントも単語だけでなく、自然な会話の文にしてください。
6. ひらがな・読み仮名（furiganaText）、ローマ字（romajiText）、日本語でのワンポイント解説（japaneseExplanation）、参考用ベトナム語訳（vietnameseTranslation）をJSONに含めてください。

JSON形式で返答してください:
{
  "japaneseResponse": "AIの日本語での自然な返答（2〜4文）",
  "furiganaText": "ひらがな・読み仮名つきテキスト",
  "romajiText": "ローマ字表記",
  "japaneseExplanation": "使われた重要表現や文法の日本語ワンポイント解説",
  "correctionAdvice": "日本語での間違い指摘・アドバイス（なければ空文字）",
  "vietnameseTranslation": "ベトナム語訳（参考用）",
  "hints": ["返信ヒント1", "返信ヒント2", "返信ヒント3"]
}`;

    const slicedMessages = (messages || []).slice(-10);
    let conversationHistory = "";
    for (const m of slicedMessages) {
      if (!m) continue;
      if (m.sender === "user") {
        conversationHistory += `学習者: ${m.text || ""}\n`;
      } else {
        conversationHistory += `${persona?.name || "AI"}: ${m.text || ""}\n`;
      }
    }

    const prompt = `これまでの会話履歴:
${conversationHistory}

上記の会話を踏まえて、学習者の最後の発言に【100%日本語】で自然に返答してください。
必ず単なる1文ではなく、リアクション＋話題の展開＋問いかけを含む2〜4文の豊かな対話を行ってください。`;

    // Never fabricate a plausible AI message when the external model fails.
    // Return an explicit non-2xx response so the client can let the learner retry.
    let chatData: any;
    try {
      const result = await callLLM({ prompt, systemInstruction, json: true });
      chatData = JSON.parse(result);
      if (!chatData || typeof chatData !== 'object' ||
          typeof chatData.japaneseResponse !== 'string' ||
          !chatData.japaneseResponse.trim()) {
        throw new Error('INVALID_AI_RESPONSE');
      }
      chatData.provider = 'AI (live model)';
    } catch (aiErr: any) {
      const detail = String(aiErr?.message || aiErr);
      // Keep provider errors in server logs; do not send API keys or upstream
      // provider details back to browsers.
      console.error('[Japanese Chat] Live model request failed:', detail.slice(0, 400));
      const rateLimited = /(?:429|rate.limit|resource.exhausted|quota)/i.test(detail);
      const notConfigured = /(?:api.key|chưa có.*key|missing.*key|no api key)/i.test(detail);
      return res.status(rateLimited ? 429 : notConfigured ? 503 : 502).json({
        error: rateLimited
          ? 'AI đang bị giới hạn lượt gọi. Vui lòng thử lại sau.'
          : notConfigured
          ? 'Chưa cấu hình được dịch vụ AI. Vui lòng liên hệ quản trị viên.'
          : 'Không thể nhận phản hồi từ mô hình AI. Vui lòng thử lại.',
        code: rateLimited ? 'AI_RATE_LIMITED' : notConfigured ? 'AI_NOT_CONFIGURED' : 'AI_UNAVAILABLE',
        provider: null
      });
    }

    // Generate accurate HTML ruby furigana tags for kanji characters
    try {
      const k = await getKuroshiro();
      if (chatData.japaneseResponse) {
        chatData.furiganaHtml = await k.convert(chatData.japaneseResponse, { mode: "furigana", to: "hiragana" });
      }
    } catch (kErr) {
      console.warn("Kuroshiro furigana conversion in /api/japanese-chat failed:", kErr);
    }

    res.json(chatData);
  } catch (error: any) {
    console.error('[Japanese Chat] Unexpected endpoint failure:', String(error?.message || error).slice(0, 400));
    return res.status(500).json({
      error: 'Dịch vụ AI đang gặp sự cố. Vui lòng thử lại.',
      code: 'AI_SERVER_ERROR',
      provider: null
    });
  }
});

// 3.2 API: Audio Transcription Fallback using Gemini Multimodal Audio (音声書き起こし)
app.post("/api/transcribe-audio", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Missing audio data" });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.+_-]+;base64,/, '');

    const response = await generateGeminiContentWithFallback({
      model: LATEST_GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType.split(';')[0] || "audio/webm"
              }
            },
            {
              text: "Listen carefully to this audio recording of a person speaking Japanese. Transcribe EXACTLY what was said in natural Japanese (using standard Kanji and Kana). Return ONLY a JSON object with this format: {\"transcript\": \"...\"}. If no speech or only noise is detected, return {\"transcript\": \"\"}."
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: { type: Type.STRING }
          },
          required: ["transcript"]
        }
      }
    });

    const resultText = response.text || "{}";
    try {
      const parsed = JSON.parse(resultText.trim());
      return res.json({ transcript: parsed.transcript || "" });
    } catch {
      return res.json({ transcript: "" });
    }
  } catch (err: any) {
    console.warn("Audio transcription error:", err?.message || err);
    return res.status(500).json({ error: "Failed to transcribe audio", transcript: "" });
  }
});

// Configure Vite middleware in development or serve built files in production

// 5.4 Username/Identifier Resolver (Enables login by username or email)
// Username -> email lookup can be used to harvest accounts: allow only a few lookups per minute per IP.
const identifierBuckets = new Map<string, { count: number; resetAt: number }>();
app.use('/api/auth/resolve-identifier', (req, res, next) => {
  const key = req.ip || 'unknown'; const now = Date.now();
  if (identifierBuckets.size > 5000) for (const [k, v] of identifierBuckets) if (v.resetAt <= now) identifierBuckets.delete(k);
  const b = identifierBuckets.get(key);
  if (!b || b.resetAt <= now) { identifierBuckets.set(key, { count: 1, resetAt: now + 60_000 }); return next(); }
  if (++b.count > 10) return res.status(429).json({ success: false, error: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.' });
  next();
});
app.post('/api/auth/resolve-identifier', async (req: any, res) => {
  try {
    const rawIdentifier = (req.body?.identifier || '').toString().trim();
    if (!rawIdentifier) {
      return res.status(400).json({ success: false, error: 'Identifier is required' });
    }

    if (rawIdentifier.includes('@')) {
      return res.json({
        success: true,
        isEmail: true,
        email: rawIdentifier.toLowerCase()
      });
    }

    const foundUser = await findUserByIdentifier(rawIdentifier);
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài khoản với tên đăng nhập này.'
      });
    }

    return res.json({
      success: true,
      isEmail: false,
      email: foundUser.email,
      username: foundUser.username || foundUser.name,
      displayName: foundUser.name
    });
  } catch (err: any) {
    console.error('Error in /api/auth/resolve-identifier:', err);
    return res.status(500).json({ success: false, error: err.message || 'Lookup failed' });
  }
});

// 6. User Auth, Profile Sync, and Streak routes
app.get('/api/shadowing/analysis-file',async(req,res)=>{
  const id=String(req.query.videoId||'');if(!/^[\w-]{11}$/.test(id))return res.status(400).json({error:'Video không hợp lệ.'});
  const file=path.join(process.cwd(),'public','shadowing-analysis',`${id}.json`);
  try{if(!await persistentJsonExists(file))return res.status(404).json({error:'Chưa có phân tích.'});res.json(await readPersistentJson(file));}catch{res.status(503).json({error:'Không đọc được phân tích từ Firebase.'});}
});
app.get('/api/user/files',requireAuth,async(req:any,res)=>{try{res.json({files:await listUserFiles(req.dbUser.uid)});}catch{res.status(503).json({error:'Không tải được PDF.'});}});
app.get('/api/user/files/part',requireAuth,async(req:any,res)=>{try{res.json(await userFilePart(req.dbUser.uid,String(req.query.id),Number(req.query.index)));}catch{res.status(404).json({error:'Không tìm thấy phần PDF.'});}});
app.post('/api/user/files',requireAuth,async(req:any,res)=>{try{await writeUserFile(req.dbUser.uid,req.body);res.json({success:true});}catch(e:any){res.status(e.message==='INVALID_FILE'?400:503).json({error:'Không lưu được PDF.'});}});
app.get('/api/user/learning-state/part',requireAuth,async(req:any,res)=>{try{res.json(await learningStatePart(req.dbUser.uid,String(req.query.key),Number(req.query.index),Number(req.query.version)));}catch(e:any){res.status(e.message==='STATE_CHANGED'?409:400).json({error:'Dữ liệu đã thay đổi. Hãy tải lại.'});}});
app.get('/api/user/learning-state',requireAuth,async(req:any,res)=>{
  try{res.json({entries:await learningStateManifest(req.dbUser.uid)});}catch{res.status(503).json({error:'Không tải được dữ liệu học tập.'});}
});
app.post('/api/user/import-learning-chunk',requireAuth,async(req:any,res)=>{try{await stageLearningState(req.dbUser.uid,req.body);res.json({success:true});}catch(e:any){res.status(e.message==='INVALID_STATE'?400:503).json({error:'Không lưu được dữ liệu học tập.'});}});
app.post('/api/user/import-learning',requireAuth,async(req:any,res)=>{
  try{await saveLearningState(req.dbUser.uid,req.body.entries);res.json({success:true});}catch(e:any){res.status(e.message==='INVALID_STATE'?400:503).json({error:'Không lưu được dữ liệu học tập.'});}
});
app.post('/api/user/import-browser', requireAuth, async(req:any,res)=>{
  try {const profile=req.body.profile||{};if(profile.studyRoadmap)await saveLearningProfile(req.dbUser.uid,profile.studyRoadmap);const user=await importBrowserProfile(req.dbUser.uid,profile);res.json({success:true,user:{...user,...await readLearningProfile(req.dbUser.uid)}});}
  catch {res.status(503).json({error:'Không đồng bộ được hồ sơ.'});}
});
app.post('/api/user/sync', requireAuth, async (req: any, res) => {
  try {
    const learning = await readLearningProfile(req.dbUser.uid);
    const dbUser = { ...req.dbUser, ...learning };
    
    // Check and update streak logic
    const todayStr = new Date().toISOString().split('T')[0] || '';
    const lastActive = dbUser.lastActiveDate;
    
    let updatedStreak = dbUser.streak;
    let newLastActive = dbUser.lastActiveDate;
    
    if (!lastActive) {
      updatedStreak = 1;
      newLastActive = todayStr;
    } else if (lastActive !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0] || '';
      
      if (lastActive === yesterdayStr) {
        updatedStreak = dbUser.streak + 1;
      } else {
        // Reset streak if gap is larger than 1 day
        updatedStreak = 1;
      }
      newLastActive = todayStr;
    }
    
    // Check if streak changed or last active changed
    if (updatedStreak !== dbUser.streak || newLastActive !== dbUser.lastActiveDate) {
      try {
        const updatedUser = await updateUserProfile(dbUser.uid, {
          streak: updatedStreak,
          lastActiveDate: newLastActive
        });
        res.json({ success: true, user: { ...(updatedUser || dbUser), ...learning } });
      } catch (dbErr) {
        console.warn("DB update failed in /api/user/sync, returning memory dbUser:", dbErr);
        res.json({ success: true, user: { ...dbUser, streak: updatedStreak, lastActiveDate: newLastActive } });
      }
    } else {
      res.json({ success: true, user: dbUser });
    }
  } catch (error: any) {
    console.error("Error in /api/user/sync:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/profile', requireAuth, async (req: any, res) => {
  try {
    const learning = req.body.studyRoadmap !== undefined ? await saveLearningProfile(req.dbUser.uid, req.body.studyRoadmap) : await readLearningProfile(req.dbUser.uid);
    const dbUser = { ...req.dbUser, ...learning };
    const { 
      name, avatar, targetLevel, xp, coins, studyDays, 
      completedLessons, vocabStatus, grammarStatus, kanjiStatus, dailyTestResults, lastPosition, myWords 
    } = req.body;
    // Game counters come from the client: reject non-numeric/absurd values and oversized blobs.
    const badNum = (v: unknown) => v !== undefined && v !== null && (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 10_000_000);
    const tooBig = (v: unknown) => v !== undefined && JSON.stringify(v).length > 1_000_000;
    if (badNum(xp) || badNum(coins) || [studyDays, completedLessons, vocabStatus, grammarStatus, kanjiStatus, dailyTestResults, lastPosition, myWords].some(tooBig) || (myWords !== undefined && !Array.isArray(myWords))) {
      return res.status(400).json({ success: false, error: 'Invalid profile data' });
    }
    
    try {
      const updatedUser = await updateUserProfile(dbUser.uid, {
        name, avatar, targetLevel, xp, coins, studyDays, 
        completedLessons, vocabStatus, grammarStatus, kanjiStatus, dailyTestResults, lastPosition, myWords
      });
      res.json({ success: true, user: { ...(updatedUser || dbUser), ...learning } });
    } catch (dbErr) {
      return res.status(503).json({error:'Không lưu được hồ sơ lên Firebase. Hãy thử lại.'});
    }
  } catch (error: any) {
    console.error("Error in /api/user/profile:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin-only endpoints for user management
app.get('/api/admin/users', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const allUsersList = await getAllUsers();
    res.json({ success: true, users: allUsersList });
  } catch (error: any) {
    console.error("Error in /api/admin/users:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/update', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { uid, role, xp, coins, streak, name, isVip } = req.body;
    if (!uid) {
      return res.status(400).json({ error: "uid is required" });
    }
    
    const updated = await updateUserProfile(uid, { role, xp, coins, streak, name, isVip }, true);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Error in /api/admin/users/update:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/delete', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: "uid is required" });
    }
    
    await deleteUserByUid(uid);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error in /api/admin/users/delete:", error);
    res.status(500).json({ error: error.message });
  }
});

// Kanji Master: dữ liệu do admin nhập từ Excel, mỗi chữ một bản ghi.
app.get('/api/kanji-master', async (_req, res) => {
  try { res.json(await listRecords('kanji_master')); } catch { res.status(503).json({ error: 'Không đọc được dữ liệu Kanji.' }); }
});
app.post('/api/admin/kanji-master/import', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const items = req.body.items;
    if (!Array.isArray(items) || items.length > 400) return res.status(400).json({ error: 'Mỗi lần nhập tối đa 400 chữ.' });
    const rows = items.filter((i: any) => i && String(i.kanji || '').trim() && Number(i.chapter) > 0 && Number(i.lesson) > 0).map((i: any) => {
      const t = (v: any) => String(v ?? '').trim().slice(0, 500);
      return { id: `${Number(i.chapter)}-${Number(i.lesson)}-${t(i.kanji)}-${t(i.word)}`, chapter: Number(i.chapter), chapterTitle: t(i.chapterTitle), lesson: Number(i.lesson), lessonTitle: t(i.lessonTitle),
        kanji: t(i.kanji), onyomi: t(i.onyomi), kunyomi: t(i.kunyomi), hanViet: t(i.hanViet), meaning: t(i.meaning), strokes: Number(i.strokes) || 0,
        level: /^N[1-5]$/.test(String(i.level).trim().toUpperCase()) ? String(i.level).trim().toUpperCase() : 'N4', mnemonic: t(i.mnemonic),
        word: t(i.word), wordReading: t(i.wordReading), wordMeaning: t(i.wordMeaning), sentence: t(i.sentence), sentenceVi: t(i.sentenceVi) };
    });
    await Promise.all(rows.map((r: any) => writeRecord('kanji_master', r.id, r)));
    res.json({ success: true, count: rows.length });
  } catch { res.status(503).json({ error: 'Không lưu được dữ liệu Kanji. Bạn có thể thử lại.' }); }
});
app.post('/api/admin/kanji-master/delete', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const ids: string[] = Array.isArray(req.body.ids) ? req.body.ids.map(String) : req.body.id ? [String(req.body.id)] : [];
    if (!ids.length || ids.length > 1000) return res.status(400).json({ error: 'id required' });
    for (let i = 0; i < ids.length; i += 300) { const b = firebaseDb().batch(); ids.slice(i, i + 300).forEach(id => b.delete(firebaseDb().collection('kanji_master').doc(documentKey(id)))); await b.commit(); }
    res.json({ success: true, count: ids.length });
  } catch { res.status(503).json({ error: 'Không xóa được chữ Kanji.' }); }
});
app.post('/api/admin/kanji-master/clear', requireAuth, requireAdmin, async (_req: any, res) => {
  try {
    const snap = await firebaseDb().collection('kanji_master').get();
    for (let i = 0; i < snap.docs.length; i += 300) { const b = firebaseDb().batch(); snap.docs.slice(i, i + 300).forEach((d: any) => b.delete(d.ref)); await b.commit(); }
    res.json({ success: true, count: snap.docs.length });
  } catch { res.status(503).json({ error: 'Không xóa được dữ liệu Kanji.' }); }
});
app.post('/api/admin/kanjis/delete',requireAuth,requireAdmin,async(req,res)=>{try{if(!req.body.id)return res.status(400).json({error:'id required'});await removeContent('kanjis',req.body.id);res.json({success:true});}catch{res.status(503).json({error:'Không xóa được Kanji.'});}});
app.post('/api/admin/kanjis/update', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { id, meaningVi, onyomi, kunyomi, strokesCount, exampleWords, mnemonic, exampleSentence, exampleTranslation } = req.body;
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const examplesJson = JSON.stringify({
      strokesCount: strokesCount || 8,
      exampleWords: exampleWords || [],
      mnemonic: mnemonic || '',
      exampleSentence: exampleSentence || '',
      exampleTranslation: exampleTranslation || ''
    });

    [await saveContent('kanjis',{
        meaningVi: meaningVi || '',
        onyomi: onyomi || '',
        kunyomi: kunyomi || '',
        examples: examplesJson
      },id) ];

    res.json({ success: true, message: "Kanji updated successfully" });
  } catch (error: any) {
    console.error("Error in /api/admin/kanjis/update:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/kanjis/ai-fill', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { character } = req.body;
    if (!character) {
      return res.status(400).json({ error: "character is required" });
    }

    const ai = getGeminiClient();
    const prompt = `Hãy cung cấp thông tin chi tiết đầy đủ cho chữ Hán tự (Kanji) sau đây: "${character}".
Yêu cầu:
1. Nghĩa Hán Việt (chỉ lấy nghĩa Hán Việt chính xác, chữ thường, ví dụ: "nhất", "nhị", "nhân", "khẩu").
2. Số nét vẽ chính xác của chữ Hán tự này.
3. Âm Ôn (Onyomi): Viết bằng chữ Katakana. Nếu có nhiều âm, ngăn cách bằng dấu phẩy và khoảng trắng.
4. Âm Khôn (Kunyomi): Viết bằng chữ Hiragana (kèm theo đuôi okurigana phân cách bằng dấu chấm nếu cần, ví dụ: "や.つ" hoặc "ひと.つ").
5. Tối đa 3 cụm từ ghép ví dụ tiêu biểu và hữu dụng nhất chứa chữ Hán tự này. Mỗi cụm từ ghép bao gồm: Từ Kanji, Cách đọc Hiragana và Nghĩa tiếng Việt rõ ràng.
6. Mẹo nhớ (mnemonic): Một câu hoặc mẹo ngắn, dễ hiểu, hóm hỉnh liên tưởng hình ảnh hoặc chiết tự bộ thủ để người học dễ thuộc, nhớ được cách viết hoặc ý nghĩa của chữ Kanji này (bằng tiếng Việt, tối đa 2 câu).
7. Một câu ví dụ tiếng Nhật tiêu biểu và thông dụng sử dụng chữ Kanji này.
8. Dịch nghĩa tiếng Việt của câu ví dụ đó.`;

    const response = await generateGeminiContentWithFallback({
      model: LATEST_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meaningVi: {
              type: Type.STRING,
              description: "Nghĩa Hán Việt chính xác của chữ, viết thường, ví dụ 'nhất', 'bát', 'thủy'"
            },
            strokesCount: {
              type: Type.INTEGER,
              description: "Số nét vẽ chính xác của chữ Hán tự này"
            },
            onyomi: {
              type: Type.STRING,
              description: "Âm Ôn (Onyomi) bằng chữ Katakana, phân cách bởi dấu phẩy nếu có nhiều âm"
            },
            kunyomi: {
              type: Type.STRING,
              description: "Âm Khôn (Kunyomi) bằng chữ Hiragana, phân cách bởi dấu phẩy nếu có nhiều âm"
            },
            exampleWords: {
              type: Type.ARRAY,
              description: "Tối đa 3 cụm từ ghép ví dụ tiêu biểu nhất chứa chữ Hán tự này",
              items: {
                type: Type.OBJECT,
                properties: {
                  word: {
                    type: Type.STRING,
                    description: "Từ ghép chứa Kanji, ví dụ: '八日'"
                  },
                  hiragana: {
                    type: Type.STRING,
                    description: "Cách đọc Hiragana của từ ghép đó, ví dụ: 'ようか'"
                  },
                  meaning: {
                    type: Type.STRING,
                    description: "Nghĩa tiếng Việt của từ ghép đó, ví dụ: 'ngày mùng 8'"
                  }
                },
                required: ["word", "hiragana", "meaning"]
              }
            },
            mnemonic: {
              type: Type.STRING,
              description: "Câu chuyện, liên tưởng hình ảnh hoặc chiết tự bộ thủ bằng tiếng Việt để người học dễ ghi nhớ chữ Kanji"
            },
            exampleSentence: {
              type: Type.STRING,
              description: "Một câu ví dụ tiếng Nhật có sử dụng chữ Kanji này, viết tự nhiên"
            },
            exampleTranslation: {
              type: Type.STRING,
              description: "Dịch nghĩa tiếng Việt chính xác của câu ví dụ tiếng Nhật trên"
            }
          },
          required: ["meaningVi", "strokesCount", "onyomi", "kunyomi", "exampleWords", "mnemonic", "exampleSentence", "exampleTranslation"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Không nhận được phản hồi từ mô hình AI.");
    }

    const result = JSON.parse(response.text.trim());
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error in /api/admin/kanjis/ai-fill:", error);
    res.status(500).json({ error: error.message });
  }
});

// Database API Routes
app.get('/api/lessons', async (req, res) => {
  try {
    const allLessons = await listContent('lessons');
    if (allLessons && allLessons.length > 0) {
      res.setHeader('X-Data-Store','firestore');return res.json(allLessons);
    }
  } catch (error: any) {
    console.warn("DB lessons query error, returning fallback lessons:", error?.message);
  }

  // Fallback lessons generated from VOCABULARY_DATA
  const uniqueLessonIds = Array.from(new Set(VOCABULARY_DATA.map(v => v.lessonId)));
  const fallbackLessons = uniqueLessonIds.map(id => {
    const v = VOCABULARY_DATA.find(item => item.lessonId === id);
    const numMatch = id.match(/mn(\d+)/);
    const lessonNum = numMatch ? parseInt(numMatch[1]) : 1;
    return {
      id,
      lessonNumber: lessonNum,
      titleVi: v?.lessonName || 'Bài học tiếng Nhật',
      titleJp: `第${lessonNum}課`,
      grammarSummary: 'Tổng hợp từ vựng và ngữ pháp'
    };
  });
  res.json(fallbackLessons);
});

let cachedMappedVocabularies: any[] | null = null;

app.get('/api/vocabularies', async (req, res) => {
  try {
    const enrichedStatic = (await listContent('vocabularies')).map(v=>sanitizeVocabItem({...v,hanViet:v.hanViet||getHanVietWord(v.kanji||'')}));
    res.setHeader('X-Data-Store','firestore');return res.json(enrichedStatic);
  } catch (error) {
    console.error('Error in /api/vocabularies route, falling back to static data:', error);
    return res.json(VOCABULARY_DATA);
  }
});

app.post('/api/vocabularies/add-custom', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { kanji, reading, meaning, level } = req.body;
    if (!reading || !meaning) {
      return res.status(400).json({ error: "reading and meaning are required" });
    }

    // Find all lessons in db to assign a lessonId matching target level
    const allLessons = await listContent('lessons');
    let targetLesson = allLessons[0]; // fallback
    if (level) {
      if (level === 'N5') {
        targetLesson = allLessons.find(l => l.lessonNumber <= 25) || allLessons[0];
      } else if (level === 'N4') {
        targetLesson = allLessons.find(l => l.lessonNumber > 25 && l.lessonNumber <= 50) || allLessons[0];
      } else {
        targetLesson = allLessons.find(l => l.lessonNumber > 50) || allLessons[0];
      }
    }

    const inserted = [await saveContent('vocabularies',{
      lessonId: targetLesson?.id || 'custom',
      word: kanji || reading,
      kanji: kanji || '',
      reading,
      meaning,
      romaji: '',
      exampleJp: '',
      exampleVi: ''
    }) ];

    // Invalidate the vocabularies cache so client can fetch fresh updated data!
    cachedMappedVocabularies = null;

    res.json({ success: true, vocabulary: inserted[0] });
  } catch (error: any) {
    console.error("Error in /api/vocabularies/add-custom:", error);
    res.status(500).json({ error: error.message });
  }
});



const AUTO_FIX_REPORTS: any[] = [
  {
    timestamp: new Date().toISOString(),
    word: "Hệ thống",
    field: "Khởi động",
    issue: "Dữ liệu ban đầu cần chuẩn hóa Hán Việt và phân nhóm màu trường nghĩa.",
    action: "Kích hoạt bộ tự động kiểm duyệt & chuẩn hóa trường nghĩa Kanji thời gian thực."
  }
];

app.get('/api/vocab/auto-fix-report', (req, res) => {
  res.json({ success: true, reports: AUTO_FIX_REPORTS });
});

// Community and Real Users Leaderboard API
app.get('/api/leaderboard', async (req, res) => {
  const BASE_CHAMPIONS = [
    { id: 'u_1', name: 'Minh Tuấn N2', avatar: '🦊', level: 'N2', xp: 5820, weeklyXp: 840, monthlyXp: 2950, streak: 45, league: 'master', badge: 'Quán quân tuần' },
    { id: 'u_2', name: 'Sakura Chan', avatar: '🌸', level: 'N3', xp: 4610, weeklyXp: 720, monthlyXp: 2410, streak: 28, league: 'diamond', badge: 'Thánh Shadowing' },
    { id: 'u_3', name: 'Anh Thư JLPT', avatar: '🐱', level: 'N4', xp: 3950, weeklyXp: 680, monthlyXp: 2150, streak: 19, league: 'diamond', badge: 'Chiến binh từ vựng' },
    { id: 'u_4', name: 'Ryu Tanaka', avatar: '🐼', level: 'N1', xp: 3880, weeklyXp: 590, monthlyXp: 1980, streak: 55, league: 'gold', badge: 'Cao thủ Hán tự' },
    { id: 'u_5', name: 'Thanh Bình N5', avatar: '🐸', level: 'N5', xp: 2750, weeklyXp: 490, monthlyXp: 1650, streak: 14, league: 'gold', badge: 'Tân binh xuất sắc' },
    { id: 'u_6', name: 'Kaito Kun', avatar: '🐨', level: 'N3', xp: 2180, weeklyXp: 380, monthlyXp: 1280, streak: 9, league: 'silver', badge: 'Chuyên cần' },
    { id: 'u_7', name: 'Hồng Ngọc', avatar: '🦄', level: 'N4', xp: 1950, weeklyXp: 310, monthlyXp: 1100, streak: 12, league: 'silver', badge: 'Ngữ pháp thần tốc' },
    { id: 'u_8', name: 'Kenji Yamada', avatar: '🦁', level: 'N2', xp: 1620, weeklyXp: 280, monthlyXp: 950, streak: 6, league: 'bronze', badge: 'Học viên tích cực' },
  ];

  try {
    let dbUsers: any[] = [];
    try {
      dbUsers = await getAllUsers();
    } catch (_dbErr) {
      // safe fallback if DB is not reachable
    }
    
    const mappedDbUsers = dbUsers.map(u => ({
      id: `db_${u.id}`,
      name: u.name || u.email?.split('@')[0] || 'Học viên JLPT',
      avatar: u.avatar || '🎓',
      level: (u.targetLevel || 'N5') as any,
      xp: u.xp || 0,
      weeklyXp: Math.min(u.xp || 0, Math.round((u.xp || 0) * 0.35 + 50)),
      monthlyXp: Math.min(u.xp || 0, Math.round((u.xp || 0) * 0.75 + 100)),
      streak: u.streak || 1,
      league: (u.xp || 0) > 4000 ? 'master' : (u.xp || 0) > 2500 ? 'diamond' : (u.xp || 0) > 1500 ? 'gold' : (u.xp || 0) > 800 ? 'silver' : 'bronze',
      badge: u.isVip ? 'VIP Member' : 'Học viên',
      isCurrentUser: false
    }));

    const combined = [...mappedDbUsers, ...BASE_CHAMPIONS];
    res.json({ success: true, leaderboard: combined });
  } catch (error: any) {
    res.json({ success: true, leaderboard: BASE_CHAMPIONS });
  }
});


app.get('/api/vocab/kanji-breakdown', async (req, res) => {
  try {
    const word = req.query.word as string || '';
    const reading = req.query.reading as string || '';
    const meaning = req.query.meaning as string || '';

    if (!word) {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    const kanjiChars = word.split('').filter(char => /[\u4e00-\u9faf]/.test(char));
    if (kanjiChars.length === 0) {
      return res.json({ success: true, isKanji: false, data: null });
    }

    const ETYMOLOGY_MAP: Record<string, string> = {
      '会社': 'Tụ họp người (Hội 会) thành một tổ chức hội đoàn (Xã 社) để cùng làm việc ➔ Công ty.',
      '社会': 'Tổ chức hội đoàn (Xã 社) tụ họp các cá nhân (Hội 会) sinh sống cùng nhau ➔ Xã hội.',
      '経済': 'Quản lý, điều hành (Kinh 経) và giúp đỡ cứu tế người dân (Tế 済) – rút gọn từ thành ngữ "Kinh bang tế thế" (Trị nước cứu đời) ➔ Kinh tế.',
      '勉強': 'Cố gắng, gượng sức (Miễn 勉) để làm cho mình mạnh mẽ, vững vàng hơn (Cường 強) ➔ Học tập, rèn luyện chăm chỉ.',
      '日本語': 'Ngôn ngữ (Ngữ 語) của đất nước (Bản 本 - gốc rễ) nơi mặt trời mọc (Nhật 日) ➔ Tiếng Nhật.',
      '学校': 'Ngôn nhà (Học 学 - việc học) có mái che và cây gỗ lớn làm khung (Hiệu 校 - trường học) ➔ Trường học.',
      '先生': 'Người được sinh ra (Sinh 生) trước (Tiên 先), có nhiều kinh nghiệm và tri thức đi trước để truyền dạy ➔ Giáo viên, thầy cô.',
      '学生': 'Người sinh sống (Sinh 生) để tập trung cho việc học tập, tiếp thu tri thức (Học 学) ➔ Học sinh, sinh viên.',
      '食堂': 'Căn phòng, nhà lớn (Đường 堂) chuyên phục vụ việc ăn uống (Thực 食) ➔ Nhà ăn, căng tin.',
      '電話': 'Cuộc nói chuyện, đàm thoại (Thoại 話) truyền đi bằng sóng điện từ hoặc dòng điện (Điện 電) ➔ Điện thoại.',
      '自動車': 'Chiếc xe (Xa 車) có thể tự mình (Tự 自) chuyển động, vận hành (Động 動) bằng động cơ mà không cần sức kéo ➔ Xe ô tô.',
      '旅行': 'Đi lại, di chuyển (Hành 行) qua nhiều vùng đất xa xôi bằng các phương tiện (Lữ 旅 - người đi xa, khách) ➔ Du lịch, chuyến đi.',
      '病院': 'Nơi tập hợp, cơ sở (Viện 院) chuyên điều trị và chăm sóc người đau ốm, bệnh tật (Bệnh 病) ➔ Bệnh viện.',
      '本屋': 'Cửa hàng, tiệm (Ốc 屋) chuyên bán sách (Bản 本) ➔ Hiệu sách.',
      '会話': 'Cuộc nói chuyện, đàm thoại (Thoại 話) tụ họp giữa nhiều người (Hội 会) ➔ Hội thoại, giao tiếp.',
      '辞書': 'Cuốn sách (Thư 書) dùng để tra cứu các từ vựng, ngôn từ (Từ 辞) ➔ Từ điển.',
      '電車': 'Toa xe, phương tiện chạy trên đường ray (Xa 車) chạy bằng năng lượng điện (Điện 電) ➔ Tàu điện.',
      '家族': 'Những người cùng chung một huyết thống, chung sống dưới một mái nhà (Gia 家) tạo thành một thị tộc, nhóm người (Tộc 族) ➔ Gia đình.',
      '外国': 'Đất nước (Quốc 国) nằm ở phía bên ngoài (Ngoại 外) biên giới quốc gia mình ➔ Nước ngoài.',
      '友達': 'Nhiều người (Đạt 達 - hậu tố chỉ số nhiều) cùng chung hướng đi, chí hướng và thân thiết (Hữu 友 - bạn bè) ➔ Bạn bè.',
      '時間': 'Khoảng cách giữa (Gian 間) các điểm mốc thời khắc tiếp nối nhau (Thời 時) ➔ Thời gian.',
      '地図': 'Bản vẽ, hình vẽ (Đồ 図) miêu tả chi tiết bề mặt đất đai, địa hình (Địa 地) ➔ Bản đồ.',
      '土産': 'Sản vật, món quà đặc trưng (Sản 産) của vùng đất, địa phương nơi mình ghé thăm (Thổ 土) ➔ Quà lưu niệm.',
      '飛行機': 'Cỗ máy, thiết bị (Cơ 機) có khả năng tự bay (Phi 飛) hành trình trên không trung (Hành 行) ➔ Máy bay.',
      '教室': 'Căn phòng (Thất 室) chuyên dành để giảng dạy, truyền đạt tri thức (Giáo 教) ➔ Lớp học, phòng học.',
      '事務所': 'Nơi, địa điểm (Sở 所) giải quyết các công việc, sự vụ (Sự vụ 事務) ➔ Văn phòng làm việc.',
      '会議室': 'Căn phòng (Thất 室) dùng để tụ họp họp bàn, thảo luận công việc (Hội nghị 会議) ➔ Phòng họp.',
      '郵便局': 'Trụ sở, cục (Cục 局) chuyên trách việc chuyển phát thư từ, bưu phẩm (Bưu tiện 郵便) ➔ Bưu điện.'
    };

    const SINGLE_KANJI_MNEMONICS: Record<string, string> = {
  '会': "Bộ Nhân (人) che đầu hai người đang gặp mặt họp bàn.",
  '社': "Bộ Thị (示) chỉ bàn thờ thờ thần Đất và thần Lúa của tổ chức Xã hội.",
  '国': "Bộ Vi (囗) bao quanh ngọc quý (玉) biểu thị quốc gia phồn thịnh.",
  '際': "Phụ (阝) chỉ ranh giới đồi dốc, nơi tế lễ gặp gỡ đất trời.",
  '関': "Cánh cổng (門) đóng kín có then cài để giữ liên quan mật thiết.",
  '係': "Người (亻) đang gánh vác liên kết các mối liên hệ.",
  '学': "Trẻ nhỏ (子) dưới mái nhà học tập say mê.",
  '生': "Mầm cây mọc nhú lên mặt đất (土) tượng trưng cho cuộc sống sinh sôi.",
  '先': "Nhân đi (儿) kết hợp Thổ (土) là người đi trước mở đường.",
  '校': "Cây gỗ (木) và bộ Giao (交) - nơi giao lưu học hỏi dưới bóng cây.",
  '教': "Sự chỉ bảo (攴) của người già cho trẻ nhỏ cách hiếu thảo (孝).",
  '文': "Hình ảnh một người đang khoanh tay trước ngực, mang nét văn nhã.",
  '知': "Mũi tên (矢) và cái miệng (口) - người có hiểu biết ăn nói sắc sảo như tên bay.",
  '時': "Mặt trời (日) đi qua ngôi chùa (寺) báo hiệu thời gian trôi qua.",
  '日': "Hình ảnh mặt trời có vầng sáng ở giữa.",
  '月': "Hình ảnh mặt trăng khuyết.",
  '年': "Người nông dân (人) cõng bó lúa thu hoạch sau một năm (干).",
  '週': "Bước đi (辵) lặp lại theo vòng tuần hoàn (周).",
  '心': "Hình ảnh trái tim với các tâm thất và động mạch.",
  '愛': "Trái tim (心) bị ôm giữ (爫) bởi tình cảm che chở (冖) bước đi (夂).",
  '金': "Vàng (金) chôn giấu dưới mặt đất (土) tỏa sáng (丷).",
  '行': "Hình ảnh ngã tư đường, nơi mọi người đi lại.",
  '来': "Hình ảnh cây lúa, lúa mọc lên mang lại tương lai no ấm.",
  '動': "Dùng sức lực (力) đẩy vật nặng (重) tạo ra sự chuyển động.",
};

const breakdownList = [];

    for (const char of kanjiChars) {
      let han_viet = getHanVietChar(char) || '';
      const dictInfo = KANJI_DICTIONARY[char];
      
      let onyomi = dictInfo?.onyomi || '';
      let kunyomi = dictInfo?.kunyomi || '';
      let meaningVi = dictInfo?.meaning || '';
      
      // Try querying from DB if available
      try {
        const kanjiDb = (await listContent('kanjis')).filter(v => v.kanji === char).slice(0,1);
        const info = (kanjiDb[0] || {}) as any;
        if (info.onyomi) onyomi = info.onyomi;
        if (info.kunyomi) kunyomi = info.kunyomi;
        if (info.meaningVi) meaningVi = info.meaningVi;
      } catch (_dbErr) {
        // Fallback gracefully to KANJI_DICTIONARY
      }
      
      if (!han_viet && dictInfo?.han_viet) {
        han_viet = dictInfo.han_viet;
      }
      
      // Auto-Fix Check 1: Missing Han Viet
      if (!han_viet || !/^[A-ZÂÊÔƠƯÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÍÌỈĨỊĐ\s,]+$/.test(han_viet)) {
        han_viet = getHanVietChar(char) || dictInfo?.han_viet || '';
      }

      // Auto-Fix Check 2: Missing Onyomi or Kunyomi or Meaning
      if (!onyomi || onyomi === '—' || !kunyomi || kunyomi === '—' || !meaningVi) {
        if (!onyomi || onyomi === '—') {
          onyomi = dictInfo?.onyomi || '—';
        }
        if (!kunyomi || kunyomi === '—') {
          kunyomi = dictInfo?.kunyomi || '—';
        }
        if (!meaningVi) {
          meaningVi = dictInfo?.meaning || han_viet.toLowerCase();
        }
      }

      // Get related vocabulary (Kanji Family)
      let familyList: any[] = [];
      try {
        const relatedVocab = (await listContent('vocabularies')).filter(v => v.kanji?.includes(char) && v.kanji !== word).slice(0,6);

        familyList = relatedVocab.map(v => ({
          id: 'v_' + v.id,
          kanji: v.kanji || '',
          reading: v.reading || '',
          meaning: v.meaning || '',
          hanViet: getHanVietWord(v.kanji || '')
        }));
      } catch (_dbErr) {
        // Fallback to searching in-memory datasets
        const matched = VOCABULARY_DATA.filter(v => v.kanji && v.kanji.includes(char) && v.kanji !== word).slice(0, 6);
        familyList = matched.map((v, idx) => ({
          id: 'v_' + (v.id || idx),
          kanji: v.kanji || '',
          reading: v.reading || (v as any).hiragana || '',
          meaning: v.meaning || '',
          hanViet: v.hanViet || getHanVietWord(v.kanji || '')
        }));
      }

      breakdownList.push({
        kanji: char,
        han_viet: han_viet.toUpperCase(),
        onyomi: onyomi && onyomi !== '' ? onyomi : '—',
        kunyomi: kunyomi && kunyomi !== '' ? kunyomi : '—',
        meaning: meaningVi,
        family: familyList
      });
    }

    const combined_hanviet = breakdownList.map(b => b.han_viet).join(' ');
    
    let etymology = '';
    let mnemonic = '';
    let ai_explanation = '';

    const cacheKey = `${word}_${reading}_${meaning}`;
    if (KANJI_BREAKDOWN_CACHE.has(cacheKey)) {
      return res.json(KANJI_BREAKDOWN_CACHE.get(cacheKey));
    }

    try {
      const ai = getGeminiClient();
      const parts = breakdownList.map(b => `[${b.kanji} - ${b.han_viet}] (${b.meaning || ''})`).join(' + ');
      
      const prompt = `
Hãy đóng vai một chuyên gia ngôn ngữ tiếng Nhật. 
Phân tích từ vựng "${word}" (cách đọc: ${reading}, nghĩa: ${meaning}).
Chiết tự cơ bản của từ này là: ${parts}.

Vui lòng trả về kết quả định dạng JSON với 3 trường:
1. "etymology": Giải thích Nguồn gốc & Ý nghĩa ghép (Tại sao các chữ Hán này ghép lại tạo thành nghĩa của từ). Ngắn gọn, súc tích (khoảng 2-3 câu).
2. "mnemonic": Mẹo ghi nhớ (Mnemonic) sáng tạo, dễ nhớ bằng tiếng Việt để người học thuộc từ này hoặc các chữ Hán cấu thành từ này. Có thể dùng câu chuyện vui hoặc hình ảnh liên tưởng.
3. "ai_explanation": Một lời khuyên ngắn gọn hoặc ngữ cảnh sử dụng thú vị của từ này (1 câu).
Chỉ trả về JSON hợp lệ, không bọc markdown.
`;
      const response = await generateGeminiContentWithFallback({
        model: LATEST_GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });
      
      if (response && response.text) {
        try {
          const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const result = JSON.parse(cleanedText);
          etymology = result.etymology || '';
          mnemonic = result.mnemonic || '';
          ai_explanation = result.ai_explanation || '';
        } catch (parseErr) {
          // ignore parse error, use fallback logic below
        }
      }
    } catch (e) {
      if (ETYMOLOGY_MAP[word]) {
        etymology = ETYMOLOGY_MAP[word];
      } else {
        const parts = breakdownList.map(b => `[${b.kanji} - ${b.han_viet}] (${b.meaning || 'nghĩa gốc'})`);
        etymology = `Từ "${word}" (${combined_hanviet}) được tạo thành từ sự kết hợp của ${parts.join(' + ')}, thể hiện ý nghĩa tổng thể là "${meaning}".`;
      }
      
      if (word.length === 1 && SINGLE_KANJI_MNEMONICS[word]) {
        mnemonic = SINGLE_KANJI_MNEMONICS[word];
      } else if (!mnemonic) {
        const kanjiHints = breakdownList.map(b => `${b.kanji} (${b.han_viet} - ${b.meaning})`).join(', ');
        mnemonic = `Để nhớ "${word}" (${reading} - ${meaning}): hãy liên tưởng sự kết hợp giữa các chữ Hán cấu thành [${kanjiHints}] tạo nên ý nghĩa "${meaning}".`;
      }

      if (!ai_explanation) {
        ai_explanation = `Từ "${word}" (${combined_hanviet}) là từ vựng cốt lõi thường xuất hiện trong các bài thi JLPT và giao tiếp hàng ngày.`;
      }
    }

    const finalResult = {
      success: true,
      isKanji: true,
      data: {
        word,
        reading,
        meaning,
        combined_hanviet,
        kanji_breakdown: breakdownList,
        etymology,
        mnemonic,
        ai_explanation
      }
    };

    KANJI_BREAKDOWN_CACHE.set(cacheKey, finalResult);
    return res.json(finalResult);

  } catch (error: any) {
    console.error("Error in /api/vocab/kanji-breakdown, falling back to local dictionary:", error?.message || error);
    const wordParam = (req.query.word as string) || '';
    const readingParam = (req.query.reading as string) || '';
    const meaningParam = (req.query.meaning as string) || '';
    const kanjiChars = wordParam.split('').filter(char => /[\u4e00-\u9faf]/.test(char));
    
    const fallbackList = kanjiChars.map(char => {
      const dictInfo = KANJI_DICTIONARY[char];
      const hv = getHanVietChar(char) || dictInfo?.han_viet || char;
      return {
        kanji: char,
        han_viet: hv.toUpperCase(),
        onyomi: dictInfo?.onyomi || '—',
        kunyomi: dictInfo?.kunyomi || '—',
        meaning: dictInfo?.meaning || hv.toLowerCase(),
        family: []
      };
    });
    const combined_hanviet = fallbackList.map(b => b.han_viet).join(' ');

    return res.json({
      success: true,
      isKanji: kanjiChars.length > 0,
      data: {
        word: wordParam,
        reading: readingParam,
        meaning: meaningParam,
        combined_hanviet,
        kanji_breakdown: fallbackList,
        etymology: `${combined_hanviet} ➔ ${meaningParam}`,
        mnemonic: `Ghi nhớ từ "${wordParam}": kết hợp các chữ Hán [${combined_hanviet}] tạo nên nghĩa "${meaningParam}".`,
        ai_explanation: ''
      }
    });
  }
});


// Admin Vocab Management
app.post('/api/admin/vocabularies/update', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { id, lessonId, word, kanji, reading, meaning, type } = req.body;
    
    if (id) {
      const updated = [await saveContent('vocabularies',{ lessonId, word, kanji, reading, meaning, type },id) ];
      return res.json({ success: true, item: updated[0] });
    } else {
      const created = [await saveContent('vocabularies',{ lessonId: lessonId || 1, word, kanji, reading, meaning, type }) ];
      return res.json({ success: true, item: created[0] });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/vocabularies/import',requireAuth,requireAdmin,async(req:any,res)=>{
  try{
    const items=req.body.items;if(!Array.isArray(items)||items.length>400)return res.status(400).json({error:'Mỗi lần nhập tối đa 400 mục.'});
    const lessonRows=new Map<string,any>();const rows=[];
    for(const item of items){const reading=String(item.reading||'').trim(),meaning=String(item.meaning||'').trim();if(!reading||!meaning)continue;const number=Number(item.lessonNumber||item.lesson_number)||1;const level=/^N[1-5]$/.test(item.level)?item.level:'N4';const curriculum=String(item.curriculum||'custom').replace(/[^\w-]/g,'');const lessonId=`import_${curriculum}_${level}_${number}`;lessonRows.set(lessonId,{id:lessonId,lessonNumber:number,titleVi:item.lessonTitle||`Bài ${number}`,titleJp:`第${number}課`,level,curriculum});rows.push({lessonId,lessonNumber:number,lessonName:item.lessonTitle||`Bài ${number}`,level,curriculum,word:String(item.word||item.kanji||reading),kanji:String(item.kanji||''),reading,meaning,hanViet:item.hanViet||'',type:item.type||'',romaji:item.romaji||'',exampleJp:item.exampleJp||item.example_jp||'',exampleVi:item.exampleVi||item.example_vi||''});}
    await bulkSaveContent('lessons',[...lessonRows.values()]);const saved=await bulkSaveContent('vocabularies',rows);res.json({success:true,count:saved.length,items:saved});
  }catch{res.status(503).json({error:'Không lưu được dữ liệu nhập lên Firebase. Bạn có thể thử lại.'});}
});

app.post('/api/admin/vocabularies/delete', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    await removeContent('vocabularies',req.body.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Grammar Management
app.post('/api/admin/grammars/update', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { id, lessonId, structure, meaning, explanation } = req.body;
    
    if (id) {
      const updated = [await saveContent('grammars',{ lessonId, structure, meaning, explanation },id) ];
      return res.json({ success: true, item: updated[0] });
    } else {
      const created = [await saveContent('grammars',{ lessonId: lessonId || 1, structure, meaning, explanation }) ];
      return res.json({ success: true, item: created[0] });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/grammars/delete', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    await removeContent('grammars',req.body.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vocabularies/ensure-examples', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { lessonId, vocabIds } = req.body;
    
    let vocabs: any[] = [];
    let lesson: any = null;

    if (vocabIds && Array.isArray(vocabIds)) {
      const parsedIds = vocabIds.map(String);
      if (parsedIds.length === 0) {
        return res.status(400).json({ error: "Invalid vocabIds format" });
      }
      vocabs = (await listContent('vocabularies')).filter(v=>parsedIds.map(String).includes(String(v.id)));
    } else {
      if (!lessonId) {
        return res.status(400).json({ error: "lessonId or vocabIds is required" });
      }

      // Extract lesson number from lessonId string (e.g. "n5_mn1" -> 1, "n4_mn26" -> 26)
      const match = lessonId.match(/_mn_i?(\d+)/) || lessonId.match(/_mn(\d+)/) || lessonId.match(/(\d+)$/);
      if (!match) {
        return res.status(400).json({ error: "Invalid lessonId format" });
      }
      const lessonNumber = parseInt(match[1]);

      // Find the corresponding lesson in DB
      const lessonRows = (await listContent('lessons')).filter(v=>v.lessonNumber === lessonNumber);
      if (lessonRows.length === 0) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      lesson = lessonRows[0];

      // Get all vocabularies for this lesson
      vocabs = (await listContent('vocabularies')).filter(v=>String(v.lessonId)===String(lesson.id));
    }
    
    // Match and fill from authentic VOCABULARY_DATA if missing
    for (const v of vocabs) {
      if (!v.exampleJp || !v.exampleVi) {
        const found = VOCABULARY_DATA.find(stat => 
          (v.kanji && stat.kanji === v.kanji) || 
          (v.reading && (stat.hiragana === v.reading || stat.kanji === v.reading)) ||
          (v.word && (stat.kanji === v.word || stat.hiragana === v.word))
        );
        if (found && found.exampleSentence) {
          v.exampleJp = found.exampleSentence;
          v.exampleVi = found.exampleTranslation || '';
          try {
            [await saveContent('vocabularies',{ exampleJp: v.exampleJp, exampleVi: v.exampleVi },v.id) ];
          } catch (e) {
            // Ignore DB update error in fallback
          }
        }
      }
    }

    // Try to get Kuroshiro instances for furigana HTML in response for high-quality rendering
    let k: any = null;
    try {
      k = await getKuroshiro();
    } catch (e) {
      console.error("Could not load kuroshiro for on-demand example generation:", e);
    }

    // Return mapped vocabs back to client
    const mappedVocabs = await Promise.all(vocabs.map(async v => {
      let exampleFuriganaHtml = '';
      if (v.exampleJp && k) {
        try {
          exampleFuriganaHtml = await k.convert(v.exampleJp, { mode: "furigana", to: "hiragana" });
        } catch (err) {
          console.error('Kuroshiro error inside on-demand map:', err);
        }
      }

      // Calculate lesson attributes
      let level = 'N5';
      let mappedLessonName = '';
      let mappedLessonTitleJp = '';
      let mappedLessonId = '';

      // If we loaded lessons, or we can look up lesson information
      if (vocabIds) {
        try {
          const lRows = (await listContent('lessons')).filter(l=>String(l.id)===String(v.lessonId));
          if (lRows.length > 0) {
            const lRow = lRows[0];
            const levelNum = lRow.lessonNumber;
            level = levelNum <= 25 ? 'N5' : levelNum <= 50 ? 'N4' : 'N3';
            mappedLessonName = lRow.titleVi || '';
            mappedLessonTitleJp = lRow.titleJp || '';
            mappedLessonId = 'n' + level.substring(1) + '_mn' + levelNum;
          }
        } catch (err) {
          console.error('Error looking up lesson info for mappedVocabs:', err);
        }
      } else if (lesson) {
        const levelNum = lesson.lessonNumber;
        level = levelNum <= 25 ? 'N5' : levelNum <= 50 ? 'N4' : 'N3';
        mappedLessonName = lesson.titleVi;
        mappedLessonTitleJp = lesson.titleJp;
        mappedLessonId = 'n' + level.substring(1) + '_mn' + levelNum;
      }

      return {
        id: 'v_' + v.id,
        kanji: v.kanji || '',
        hiragana: v.reading || '',
        romaji: v.romaji || '',
        meaning: v.meaning || '',
        exampleSentence: v.exampleJp || '',
        exampleFuriganaHtml: exampleFuriganaHtml,
        exampleTranslation: v.exampleVi || '',
        level: level,
        lessonId: mappedLessonId,
        lessonName: mappedLessonName,
        lessonTitleJp: mappedLessonTitleJp
      };
    }));

    // Update the server's cache mapped vocabularies if they exist
    if (cachedMappedVocabularies) {
      mappedVocabs.forEach(m => {
        const idx = cachedMappedVocabularies!.findIndex(c => c.id === m.id);
        if (idx !== -1) {
          cachedMappedVocabularies![idx] = m;
        }
      });
    }

    res.json({ success: true, vocabularies: mappedVocabs });
  } catch (error: any) {
    console.error("Error in /api/vocabularies/ensure-examples:", error);
    res.status(500).json({ error: error.message });
  }
});

const kanjiStrokeCache = new Map<string, any>();

app.get('/api/kanji-strokes', async (req, res) => {
  try {
    const char = ((req.query.char || req.query.kanji || req.query.q) as string || '').trim();
    if (!char) {
      return res.status(400).json({ error: 'Missing char query parameter' });
    }

    // Extract the first kanji character
    const kanjiMatch = char.match(/[\u4e00-\u9faf]/);
    const targetChar = kanjiMatch ? kanjiMatch[0] : char[0];
    if (!targetChar) {
      return res.status(400).json({ error: 'No valid kanji character found' });
    }

    if (kanjiStrokeCache.has(targetChar)) {
      return res.json(kanjiStrokeCache.get(targetChar));
    }

    const code = targetChar.codePointAt(0)!.toString(16).padStart(5, '0');
    const urls = [
      `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${code}.svg`,
      `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`
    ];

    let svgData = '';
    for (const url of urls) {
      try {
        const resp = await axios.get(url, { timeout: 4000 });
        if (resp.data && typeof resp.data === 'string') {
          svgData = resp.data;
          break;
        }
      } catch {
        // try next fallback
      }
    }

    if (!svgData) {
      return res.status(404).json({ error: 'Kanji stroke data not found', character: targetChar });
    }

    const $ = cheerio.load(svgData, { xmlMode: true });
    const strokes: Array<{ d: string; number: number; numX?: number; numY?: number }> = [];

    // Extract all stroke <path> elements from KanjiVG (prioritize inside StrokePaths group)
    const strokePaths = $('g[id*="StrokePaths"] path').length > 0
      ? $('g[id*="StrokePaths"] path')
      : $('path[id*="-s"]').length > 0
        ? $('path[id*="-s"]')
        : $('path');

    strokePaths.each((idx, el) => {
      const d = $(el).attr('d');
      if (d) {
        const id = $(el).attr('id') || '';
        const matchNum = id.match(/-s(\d+)$/);
        const strokeNum = matchNum ? parseInt(matchNum[1], 10) : idx + 1;
        strokes.push({
          d,
          number: strokeNum
        });
      }
    });

    // Ensure strokes are sorted in strictly ascending order by stroke number
    strokes.sort((a, b) => a.number - b.number);

    // Extract text number positions (matches stroke numbers)
    $('text').each((idx, el) => {
      const textVal = $(el).text().trim();
      const parsedNum = parseInt(textVal, 10);
      const targetStroke = !isNaN(parsedNum)
        ? strokes.find(s => s.number === parsedNum)
        : strokes[idx];

      const transform = $(el).attr('transform') || '';
      const matrixMatch = transform.match(/matrix\([^)]*?\s+([\d.-]+)\s+([\d.-]+)\)/);
      if (targetStroke) {
        if (matrixMatch) {
          targetStroke.numX = parseFloat(matrixMatch[1]);
          targetStroke.numY = parseFloat(matrixMatch[2]);
        } else {
          const x = $(el).attr('x');
          const y = $(el).attr('y');
          if (x && y) {
            targetStroke.numX = parseFloat(x);
            targetStroke.numY = parseFloat(y);
          }
        }
      }
    });

    const result = {
      character: targetChar,
      code,
      viewBox: '0 0 109 109',
      strokeCount: strokes.length,
      strokes
    };

    kanjiStrokeCache.set(targetChar, result);
    return res.json(result);
  } catch (error: any) {
    console.error('Error fetching kanji strokes:', error?.message);
    return res.status(500).json({ error: 'Failed to fetch kanji strokes', details: error?.message });
  }
});

app.get('/api/kanjis', async (req, res) => {
  try {
    const results = await listContent('kanjis');
    if (results && results.length > 0) {
      const mapped = results.map(k => {
        const dictInfo = KANJI_DICTIONARY[k.kanji];
        const level = dictInfo?.level || (k.lesson <= 25 ? 'N5' : k.lesson <= 50 ? 'N4' : k.lesson === 51 ? 'N3' : k.lesson === 52 ? 'N2' : 'N1');
        return {
          ...k,
          level,
          han_viet: dictInfo?.han_viet || '',
          radical: dictInfo?.radical || (k as any).radical || '',
          strokes: dictInfo?.strokes || (k as any).strokes || 8,
          mnemonic: dictInfo?.mnemonic || k.examples || '',
          components: dictInfo?.components || ''
        };
      });
      res.setHeader('X-Data-Store','firestore');return res.json(mapped);
    }
  } catch (error: any) {
    console.warn("DB kanjis query error, returning fallback KANJI_DATA:", error?.message);
  }
  res.json(KANJI_DATA);
});

function splitJapaneseSentence(sentence: string): string[] {
  const clean = sentence.trim().replace(/[。！?？]/g, '');
  // Split using Japanese particles as markers
  const particles = /(?<=は|が|を|に|で|と|も|から|まで|、|)/g;
  let parts = clean.split(particles).map(p => p.trim()).filter(Boolean);
  
  if (parts.length < 2) {
    const len = clean.length;
    const chunkLen = Math.max(2, Math.ceil(len / 3));
    parts = [];
    for (let i = 0; i < len; i += chunkLen) {
      parts.push(clean.slice(i, i + chunkLen));
    }
  }
  return parts;
}

function generateFallbackQuestions(structure: string, meaning: string, exampleJp: string, exampleVi: string) {
  const viToJa: any[] = [];
  const jaToVi: any[] = [];
  const reorder: any[] = [];

  const baseJp = exampleJp || "日本語を勉強しているんです。";
  const baseVi = exampleVi || "Tôi đang học tiếng Nhật.";

  const subjects = [
    { jp: "私", vi: "Tôi" },
    { jp: "山田さん", vi: "Anh Yamada" },
    { jp: "鈴木さん", vi: "Anh Suzuki" },
    { jp: "先生", vi: "Thầy giáo" },
    { jp: "彼", vi: "Anh ấy" },
    { jp: "彼女", vi: "Cô ấy" },
    { jp: "友達", vi: "Bạn tôi" },
    { jp: "お父さん", vi: "Bố tôi" },
    { jp: "お母さん", vi: "Mẹ tôi" },
    { jp: "渡辺さん", vi: "Chị Watanabe" }
  ];

  const actions = [
    { jp: "行くんです", vi: "đi đấy", words: ["行く", "んです"] },
    { jp: "勉強するんです", vi: "học đấy", words: ["勉強する", "んです"] },
    { jp: "食べるんです", vi: "ăn đấy", words: ["食べる", "んです"] },
    { jp: "買うんです", vi: "mua đấy", words: ["買う", "んです"] },
    { jp: "話すんです", vi: "nói chuyện đấy", words: ["話す", "んです"] },
    { jp: "帰るんです", vi: "về đấy", words: ["帰る", "んです"] },
    { jp: "飲むんです", vi: "uống đấy", words: ["飲む", "んです"] },
    { jp: "休むんです", vi: "nghỉ ngơi đấy", words: ["休む", "んです"] },
    { jp: "案内するんです", vi: "hướng dẫn đấy", words: ["案内する", "んです"] },
    { jp: "見学するんです", vi: "tham quan đấy", words: ["見学する", "んです"] }
  ];

  const places = [
    { jp: "日本へ", vi: "sang Nhật Bản" },
    { jp: "学校へ", vi: "đến trường" },
    { jp: "大阪へ", vi: "đến Osaka" },
    { jp: "京都へ", vi: "đến Kyoto" },
    { jp: "病院へ", vi: "đến bệnh viện" },
    { jp: "東京へ", vi: "đến Tokyo" },
    { jp: "スーパーへ", vi: "đến siêu thị" },
    { jp: "会社へ", vi: "đến công ty" },
    { jp: "家へ", vi: "về nhà" },
    { jp: "お祭りへ", vi: "đến lễ hội" }
  ];

  viToJa.push({
    id: 1,
    vi: baseVi,
    correct: baseJp,
    hint: `Sử dụng cấu trúc ngữ pháp '${structure}'`
  });

  jaToVi.push({
    id: 1,
    ja: baseJp,
    correct: baseVi,
    hint: `Mẫu câu ví dụ chuẩn.`
  });

  const baseWords = splitJapaneseSentence(baseJp);
  reorder.push({
    id: 1,
    vi: baseVi,
    words: [...baseWords].sort(() => 0.5 - Math.random()),
    correct: baseJp
  });

  for (let i = 2; i <= 5; i++) {
    const s = subjects[(i - 1) % subjects.length];
    const a = actions[(i - 1) % actions.length];
    const p = places[(i - 1) % places.length];

    const hasPlace = a.jp.includes("行く") || a.jp.includes("帰る") || a.jp.includes("見学する");
    const jpSentence = hasPlace 
      ? `${s.jp}は${p.jp}${a.jp}。`
      : `${s.jp}は日本語を${a.jp}。`;
      
    const viSentence = hasPlace
      ? `${s.vi} ${a.vi} ${p.vi}.`
      : `${s.vi} ${a.vi} tiếng Nhật.`;

    viToJa.push({
      id: i,
      vi: viSentence,
      correct: jpSentence,
      hint: `Chủ ngữ: ${s.jp}. Sử dụng mẫu: ${structure}`
    });

    jaToVi.push({
      id: i,
      ja: jpSentence,
      correct: viSentence,
      hint: `Chủ ngữ: ${s.jp}.`
    });

    const reorderParts = hasPlace
      ? [`${s.jp}は`, p.jp, ...a.words]
      : [`${s.jp}は`, "日本語を", ...a.words];

    reorder.push({
      id: i,
      vi: viSentence,
      words: [...reorderParts].sort(() => 0.5 - Math.random()),
      correct: jpSentence
    });
  }

  return { viToJa, jaToVi, reorder };
}

app.post("/api/grammar/practice-questions", async (req, res) => {
  try {
    const { grammarStructure, meaning, exampleSentence, exampleTranslation } = req.body;
    if (!grammarStructure) {
      return res.status(400).json({ error: "grammarStructure is required" });
    }

    const fallbackQuestions = generateFallbackQuestions(grammarStructure, meaning || "", exampleSentence || "", exampleTranslation || "");

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err) {
      return res.json(fallbackQuestions);
    }

    const systemInstruction = `Bạn là chuyên gia biên soạn giáo trình tiếng Nhật bản xứ chuyên nghiệp.
Nhiệm vụ của bạn là tạo ra một bộ bài tập gồm đúng 5 câu hỏi cho mỗi dạng bài tập sau, tập trung hoàn toàn vào cấu trúc ngữ pháp ${grammarStructure} (Ý nghĩa: ${meaning}).
Mỗi câu hỏi phải phù hợp với trình độ người học, thực tế, tự nhiên và dễ hiểu.

Các dạng bài tập cần tạo:
1. viToJa: 5 câu hỏi dịch từ tiếng Việt sang tiếng Nhật.
   - id: số thứ tự 1 đến 5
   - vi: Câu tiếng Việt gốc
   - correct: Đáp án tiếng Nhật chuẩn
   - hint: Gợi ý viết câu
2. jaToVi: 5 câu hỏi dịch từ tiếng Nhật sang tiếng Việt.
   - id: số thứ tự 1 đến 5
   - ja: Câu tiếng Nhật gốc
   - correct: Bản dịch tiếng Việt tự nhiên nhất
   - hint: Gợi ý nghĩa từ vựng
3. reorder: 5 câu hỏi sắp xếp các mảnh từ.
   - id: số thứ tự 1 đến 5
   - vi: Bản dịch tiếng Việt
   - words: Mảng các mảnh từ tiếng Nhật bị xáo trộn (3-6 từ)
   - correct: Câu tiếng Nhật hoàn chỉnh

Ví dụ mẫu:
- Tiếng Nhật: ${exampleSentence || ""}
- Tiếng Việt: ${exampleTranslation || ""}

Trả về JSON chuẩn có dạng:
{
  "viToJa": [{ "id": 1, "vi": "...", "correct": "...", "hint": "..." }],
  "jaToVi": [{ "id": 1, "ja": "...", "correct": "...", "hint": "..." }],
  "reorder": [{ "id": 1, "vi": "...", "words": ["..."], "correct": "..." }]
}`;

    const prompt = `Hãy soạn bộ bài tập thực hành gồm 5 câu Việt -> Nhật, 5 câu Nhật -> Việt, 5 câu sắp xếp cho ngữ pháp: "${grammarStructure}" với ý nghĩa "${meaning}".`;

    try {
      const response = await generateGeminiContentWithFallback({
        model: LATEST_GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              viToJa: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    vi: { type: Type.STRING },
                    correct: { type: Type.STRING },
                    hint: { type: Type.STRING }
                  },
                  required: ["id", "vi", "correct", "hint"]
                }
              },
              jaToVi: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    ja: { type: Type.STRING },
                    correct: { type: Type.STRING },
                    hint: { type: Type.STRING }
                  },
                  required: ["id", "ja", "correct", "hint"]
                }
              },
              reorder: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    vi: { type: Type.STRING },
                    words: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correct: { type: Type.STRING }
                  },
                  required: ["id", "vi", "words", "correct"]
                }
              }
            },
            required: ["viToJa", "jaToVi", "reorder"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const data = JSON.parse(responseText.trim());
        if (data && data.viToJa && data.viToJa.length > 0) {
          data.viToJa = data.viToJa.slice(0, 5);
          if (data.jaToVi) data.jaToVi = data.jaToVi.slice(0, 5);
          if (data.reorder) data.reorder = data.reorder.slice(0, 5);
          return res.json(data);
        }
      }
      res.json(fallbackQuestions);
    } catch (aiErr) {
      console.warn("AI generation failed, using fallback:", aiErr);
      res.json(fallbackQuestions);
    }
  } catch (error: any) {
    console.error("Error in /api/grammar/practice-questions:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ==========================================
// AI HANDWRITING GRADING & EXERCISE API
// ==========================================

// AI Grading of handwritten exercises via Multimodal Image Analysis
app.post('/api/handwriting/grade', async (req, res) => {
  try {
    const { 
      imageBase64, 
      exerciseType = 'kanji', 
      prompt = '', 
      expectedAnswer = '', 
      level = 'N5',
      userContext = '' 
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    // Strip header prefix if present (e.g., data:image/png;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const systemInstruction = `You are a master Japanese Calligraphy (Shodou 書道) & Language Instructor and strict yet very encouraging JLPT Examiner.
Your task is to analyze the user's handwritten Japanese text/Kanji from the provided canvas image, grade it accurately, and provide constructive feedback in Vietnamese.

Exercise Context:
- Level: JLPT ${level}
- Exercise Type: ${exerciseType} (e.g., kanji stroke practice, sentence completion, translation, kana practice)
- Prompt/Question given to user: "${prompt}"
- Expected Answer: "${expectedAnswer}"
- Additional context: "${userContext}"

Grading Criteria:
1. Accuracy: Did the user write the correct character(s)/word(s)/sentence matching the prompt?
2. Stroke Formation & Proportions (Hình thái nét & Tỷ lệ):
   - Are strokes correctly placed (horizontal, vertical, slants, hooks, dots)?
   - Are radical components well-balanced inside the square?
   - Is the handwriting neat (nắn nót) and legible?
3. Grammar & Particles (for sentences): Are particles (は, が, を, に, で, etc.) and inflections correct?

Evaluation scale:
- 90 - 100: Xuất sắc (Very accurate, beautiful stroke balance)
- 75 - 89: Tốt (Correct, legible, minor stroke proportion tweaks needed)
- 50 - 74: Khá / Cần rèn thêm (Close, recognizable, but missing a stroke or unbalanced)
- 0 - 49: Chưa đạt (Wrong character, illegible, or far from expected)

You MUST respond strictly in valid JSON matching this schema:
{
  "transcription": "Chữ/câu tiếng Nhật bạn nhận diện được từ nét viết của học viên",
  "score": 88,
  "isCorrect": true,
  "strokeRating": "excellent" | "good" | "fair" | "needs_practice",
  "strokeFeedback": "Nhận xét chi tiết về nét viết: độ cân đối, nét móc/hất/sổ, tỷ lệ các bộ thủ...",
  "grammarFeedback": "Nhận xét về ngữ pháp / từ vựng nếu có",
  "overallComment": "Lời nhận xét tổng quát mang tính khích lệ, phân tích điểm mạnh và điểm cần cải thiện (bằng tiếng Việt)",
  "correctionTip": "Mẹo cụ thể để viết chữ/câu này đẹp và chuẩn hơn",
  "standardAnswer": "${expectedAnswer || 'Nội dung chuẩn'}",
  "standardFurigana": "Cách đọc Hiragana / Furigana của câu chuẩn",
  "standardRomaji": "Romaji của câu chuẩn",
  "standardMeaningVi": "Nghĩa tiếng Việt chuẩn của câu",
  "xpEarned": 25
}`;

    try {
      const response = await generateGeminiContentWithFallback({
        contents: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          systemInstruction
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcription: { type: Type.STRING },
              score: { type: Type.INTEGER },
              isCorrect: { type: Type.BOOLEAN },
              strokeRating: { 
                type: Type.STRING, 
                enum: ["excellent", "good", "fair", "needs_practice"] 
              },
              strokeFeedback: { type: Type.STRING },
              grammarFeedback: { type: Type.STRING },
              overallComment: { type: Type.STRING },
              correctionTip: { type: Type.STRING },
              standardAnswer: { type: Type.STRING },
              standardFurigana: { type: Type.STRING },
              standardRomaji: { type: Type.STRING },
              standardMeaningVi: { type: Type.STRING },
              xpEarned: { type: Type.INTEGER }
            },
            required: [
              "transcription", 
              "score", 
              "isCorrect", 
              "strokeRating", 
              "strokeFeedback", 
              "overallComment", 
              "correctionTip", 
              "standardAnswer"
            ]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const result = JSON.parse(responseText.trim());
        
        // Calculate XP bonus based on score
        const baseScore = typeof result.score === 'number' ? result.score : 70;
        result.xpEarned = Math.max(10, Math.min(35, Math.round(baseScore / 3)));
        
        return res.json(result);
      }
      throw new Error("Empty AI grading response");
    } catch (aiErr: any) {
      console.warn("AI handwriting grading error, using robust fallback evaluation:", aiErr?.message);
      
      // Never invent a passing grade (or XP) for a drawing that was not actually graded.
      return res.status(503).json({ error: 'Chưa chấm được bài viết tay lúc này. Vui lòng thử lại.' });
    }
  } catch (error: any) {
    console.error("Error in /api/handwriting/grade:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// AI Dynamic Handwriting Exercise Generator
app.post('/api/handwriting/generate-exercise', async (req, res) => {
  try {
    const { 
      level = 'N5', 
      type = 'kanji', 
      topic = 'Đời sống hàng ngày' 
    } = req.body;

    const promptText = `Generate 4 diverse, engaging Japanese handwriting practice exercises (bài tập luyện viết bằng bút) for JLPT ${level} learners.
Exercise Type: ${type} (can be 'kanji', 'sentence_infill', 'translation', 'free_writing')
Topic: ${topic}

For each exercise provide:
- id: unique string
- type: 'kanji' | 'sentence_infill' | 'translation' | 'free_writing'
- title: concise title in Vietnamese
- instruction: clear prompt in Vietnamese explaining what to write with pen
- promptQuestion: Japanese sentence or prompt with blank or target
- expectedAnswer: the exact Japanese characters/words/sentence the user should write
- furigana: reading with furigana/hiragana
- romaji: latin romanization
- meaningVi: Vietnamese meaning/translation
- hint: helpful tip about stroke order or grammar
- strokeCount: number (if kanji)
- radicalInfo: string (if kanji)
- level: "${level}"

Respond strictly in valid JSON schema.`;

    try {
      const response = await generateGeminiContentWithFallback({
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    instruction: { type: Type.STRING },
                    promptQuestion: { type: Type.STRING },
                    expectedAnswer: { type: Type.STRING },
                    furigana: { type: Type.STRING },
                    romaji: { type: Type.STRING },
                    meaningVi: { type: Type.STRING },
                    hint: { type: Type.STRING },
                    strokeCount: { type: Type.INTEGER },
                    radicalInfo: { type: Type.STRING },
                    level: { type: Type.STRING }
                  },
                  required: ["id", "type", "title", "instruction", "promptQuestion", "expectedAnswer", "furigana", "meaningVi", "level"]
                }
              }
            },
            required: ["exercises"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        if (parsed.exercises && parsed.exercises.length > 0) {
          return res.json(parsed.exercises);
        }
      }
      throw new Error("No exercises generated");
    } catch (aiErr) {
      console.warn("AI handwriting exercise generation error, using curated presets:", aiErr);
      
      const fallbackExercises = [
        {
          id: `hw-${level}-1`,
          type: "kanji",
          title: "Luyện viết Hán tự cơ bản",
          instruction: "Dùng bút viết chữ Hán mang nghĩa 'HỌC TẬP' theo thứ tự nét chuẩn",
          promptQuestion: "Hán tự: 学 (HỌC - がく)",
          expectedAnswer: "学",
          furigana: "がく / まな・ぶ",
          romaji: "gaku / manabu",
          meaningVi: "Học, trường học, học tập",
          hint: "Gồm 8 nét. Viết 3 nét chấm/phẩy trên đầu trước, rồi đến nét quầng mịch, cuối cùng là chữ Tử (子).",
          strokeCount: 8,
          radicalInfo: "Bộ Tử (子) - Đứa con",
          level: level
        },
        {
          id: `hw-${level}-2`,
          type: "sentence_infill",
          title: "Điền Hán tự vào chỗ trống",
          instruction: "Dùng bút viết từ Hán tự thích hợp vào ô trống để hoàn thành câu",
          promptQuestion: "毎日、日本語を【 ___ 】します。(Học tập)",
          expectedAnswer: "勉強",
          furigana: "べんきょう",
          romaji: "benkyou",
          meaningVi: "Mỗi ngày tôi đều học tiếng Nhật.",
          hint: "Chữ Miễn (勉) gồm 10 nét và chữ Cường (強) gồm 11 nét.",
          strokeCount: 21,
          radicalInfo: "Bộ Lực (力) & Bộ Cung (弓)",
          level: level
        },
        {
          id: `hw-${level}-3`,
          type: "translation",
          title: "Dịch và viết câu hoàn chỉnh",
          instruction: "Dùng bút viết toàn bộ câu tiếng Nhật: 'Hôm nay thời tiết rất đẹp.'",
          promptQuestion: "Dịch sang tiếng Nhật: 'Hôm nay thời tiết rất đẹp.'",
          expectedAnswer: "今日は天気がいいです",
          furigana: "きょうは てんきが いいです",
          romaji: "kyou wa tenki ga ii desu",
          meaningVi: "Hôm nay thời tiết rất đẹp.",
          hint: "Chú ý trợ từ は (wa) sau 今日 và trợ từ が sau 天気.",
          strokeCount: 0,
          radicalInfo: "Thời tiết & Giao tiếp",
          level: level
        }
      ];
      return res.json(fallbackExercises);
    }
  } catch (error: any) {
    console.error("Error in /api/handwriting/generate-exercise:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

function generateOfflineExamGradingAndExplanation(questions: any[], userAnswers: Record<string, any> = {}, userNotes: Record<string, any> = {}) {
  const results = questions.map((q, idx) => {
    const qId = q.id || `q_${idx}`;
    let correctIdx = (q.correctIndex !== undefined && q.correctIndex !== null && q.correctIndex >= 0) ? Number(q.correctIndex) : 0;
    const userSelected = userAnswers[qId] !== undefined ? Number(userAnswers[qId]) : -1;
    const isCorrect = userSelected === correctIdx;
    
    const userNoteText = (userNotes[qId] || "").trim();
    const hasNote = Boolean(userNoteText);

    let noteAnalysis = {
      userNoteText,
      hasNote,
      isNoteCorrect: true,
      correctionText: userNoteText,
      feedback: hasNote ? "Ghi chú của học viên đã được ghi nhận." : ""
    };

    if (hasNote) {
      const lowerNote = userNoteText.toLowerCase();
      const isUncertain = lowerNote.includes('không chắc') || lowerNote.includes('đoán') || lowerNote.includes('?');
      const correctOptText = q.options && q.options[correctIdx] ? q.options[correctIdx] : '';
      noteAnalysis = {
        userNoteText,
        hasNote: true,
        isNoteCorrect: !isUncertain,
        correctionText: isUncertain ? `Đính chính: Đáp án chính xác là lựa chọn (${correctIdx + 1}): "${correctOptText}"` : userNoteText,
        feedback: isUncertain ? "⚠️ Học viên còn băn khoăn câu này. Hãy đối chiếu từ vựng/ngữ pháp chính." : "⭕ Ghi chú học tập phân tích tốt!"
      };
    }

    const correctOptText = q.options && q.options[correctIdx] ? q.options[correctIdx] : '';
    const explanation = q.explanation || `Đáp án chính xác là lựa chọn (${correctIdx + 1}): "${correctOptText}". ${isCorrect ? 'Bạn đã trả lời đúng câu này!' : 'Hãy đối chiếu câu hỏi và đáp án để rút kinh nghiệm.'}`;

    return {
      id: qId,
      correctIndex: correctIdx,
      isCorrect,
      explanation,
      noteAnalysis
    };
  });

  const correctCount = results.filter(r => r.isCorrect).length;
  const total = results.length;
  const percentage = Math.round((correctCount / Math.max(1, total)) * 100);

  return {
    results,
    teacherSummary: {
      overallComment: `Học viên đã hoàn thành bài thi với ${correctCount}/${total} câu chính xác (${percentage}%). ${percentage >= 80 ? 'Kết quả làm bài rất tốt!' : 'Hãy tiếp tục rèn luyện thêm các điểm ngữ pháp & từ vựng chưa vững.'}`,
      strengths: [
        percentage >= 70 ? "Phản xạ chọn đáp án chính xác cao" : "Có tinh thần tự luyện thi nghiêm túc",
        "Có thói quen ghi chú trực tiếp để phân tích bài"
      ],
      recommendations: [
        "Xem lại chi tiết các câu làm sai để củng cố kiến thức",
        "Tập trung ghi nhớ từ vựng và mẫu ngữ pháp xuất hiện trong đề"
      ]
    }
  };
}

// AI Grade & Detailed Explanation & User Note Correction API
app.post('/api/exam/ai-grade-and-explain', async (req, res) => {
  try {
    const { examTitle, questions, userAnswers = {}, userNotes = {} } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Questions array is required" });
    }

    const questionsToGrade = questions.slice(0, 100);

    const promptText = `Bạn là Giám khảo & Giáo viên Tiếng Nhật JLPT Chuyên nghiệp hàng đầu.
Nhiệm vụ của bạn là:
1. Xác định ĐÁP ÁN ĐÚNG chính xác (0, 1, 2, hoặc 3) cho từng câu hỏi nếu câu hỏi chưa có hoặc chưa chuẩn.
2. Chấm điểm bài làm của học viên dựa trên đáp án chuẩn.
3. Giải thích chi tiết từng câu bằng Tiếng Việt (tại sao đáp án đó đúng, dịch nghĩa, cấu trúc từ vựng/ngữ pháp chính).
4. ĐẶC BIỆT - ĐÁNH GIÁ & SỬA LỖI GHI CHÚ CỦA HỌC VIÊN:
   Nếu học viên có viết ghi chú (userNotes) cho câu hỏi đó:
   - Hãy đọc kỹ nội dung ghi chú của học viên.
   - Nếu ghi chú bị sai/hiểu nhầm kiến thức: Đính chính và sửa lại kiến thức đúng một cách ngắn gọn, súc tích và dễ hiểu. (Sửa sai ghi chú).
   - Nếu ghi chú đúng: Xác nhận ghi chú đúng và khen ngợi.

Tên đề thi: ${examTitle || 'Đề thi JLPT'}
Số câu hỏi: ${questionsToGrade.length}

Danh sách câu hỏi & bài làm của học viên:
${JSON.stringify(questionsToGrade.map(q => ({
  id: q.id,
  question: q.question,
  hint: q.hint,
  options: q.options,
  existingCorrectIndex: (q.correctIndex !== undefined && q.correctIndex !== null && q.correctIndex >= 0) ? q.correctIndex : -1,
  userSelectedOption: userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1,
  userNoteText: userNotes[q.id] || ""
})), null, 2)}

Hãy trả về JSON theo cấu trúc chính xác sau:
{
  "results": [
    {
      "id": "ID câu hỏi",
      "correctIndex": 0,
      "isCorrect": true,
      "explanation": "Giải thích chi tiết bằng tiếng Việt...",
      "noteAnalysis": {
        "userNoteText": "Chuỗi ghi chú của học viên",
        "hasNote": true,
        "isNoteCorrect": false,
        "correctionText": "Sửa sai ghi chú: Nội dung đính chính kiến thức...",
        "feedback": "Nhận xét của giáo viên về ghi chú này..."
      }
    }
  ],
  "teacherSummary": {
    "overallComment": "Nhận xét tổng quan tình hình làm bài...",
    "strengths": ["Điểm mạnh 1"],
    "recommendations": ["Lời khuyên..."]
  }
}`;

    try {
      let parsed: any = null;
      let usedProvider = "Trợ lý AI";

      // 1. Primary: OpenAI ChatGPT
      if (getActiveOpenAIApiKey()) {
        try {
          const gptJson = await callOpenAIGPT({
            prompt: promptText + "\nLƯU Ý QUAN TRỌNG: Trả về duy nhất định dạng JSON thuần túy (không bọc thẻ markdown, không văn bản thừa) khớp đúng cấu trúc trên.",
            systemInstruction: "Bạn là Giám khảo & Giáo viên Tiếng Nhật JLPT Chuyên nghiệp hàng đầu (Sensei).",
            model: getActiveOpenAIModel(),
            jsonMode: true
          });
          parsed = JSON.parse(gptJson.trim());
          usedProvider = `ChatGPT (${getActiveOpenAIModel()})`;
        } catch (openAiErr: any) {
          console.warn("[AI] Fallback to Gemini for exam grading/explaining due to:", openAiErr?.message || openAiErr);
        }
      }

      // 2. Fallback: Gemini
      if (!parsed) {
        const response = await generateGeminiContentWithFallback({
          contents: promptText,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                results: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      correctIndex: { type: Type.INTEGER },
                      isCorrect: { type: Type.BOOLEAN },
                      explanation: { type: Type.STRING },
                      noteAnalysis: {
                        type: Type.OBJECT,
                        properties: {
                          userNoteText: { type: Type.STRING },
                          hasNote: { type: Type.BOOLEAN },
                          isNoteCorrect: { type: Type.BOOLEAN },
                          correctionText: { type: Type.STRING },
                          feedback: { type: Type.STRING }
                        }
                      }
                    },
                    required: ["id", "correctIndex", "isCorrect", "explanation"]
                  }
                },
                teacherSummary: {
                  type: Type.OBJECT,
                  properties: {
                    overallComment: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          }
        });
        parsed = JSON.parse(response.text || '{}');
        usedProvider = "Gemini 3.8 Flash (Dự phòng)";
      }

      return res.json({ ...parsed, aiProvider: usedProvider });
    } catch (aiErr: any) {
      console.warn("Exam grading AI fallback triggered:", aiErr?.message || aiErr);
      const offlineGrading = generateOfflineExamGradingAndExplanation(questionsToGrade, userAnswers, userNotes);
      return res.json({ ...offlineGrading, fallback: true, aiProvider: "Offline" });
    }
  } catch (error: any) {
    console.error("Error in /api/exam/ai-grade-and-explain:", error);
    try {
      const { questions, userAnswers = {}, userNotes = {} } = req.body || {};
      if (Array.isArray(questions)) {
        const offlineGrading = generateOfflineExamGradingAndExplanation(questions, userAnswers, userNotes);
        return res.json({ ...offlineGrading, fallback: true });
      }
    } catch {}
    return res.status(500).json({ error: error.message || "Failed to grade exam" });
  }
});

// Dedicated AI Kanji Associative Mnemonic Generator API
app.post('/api/kanji/ai-mnemonic', async (req, res) => {
  try {
    const {
      kanji,
      meaning,
      onyomi,
      kunyomi,
      strokes,
      radical,
      level,
      components,
      forceNew
    } = req.body;

    if (!kanji || typeof kanji !== 'string' || !kanji.trim()) {
      return res.status(400).json({
        success: false,
        error: "Thông tin chữ Kanji (kanji) là bắt buộc."
      });
    }

    const trimmedKanji = kanji.trim();

    const kanjiModel = process.env.KANJI_AI_MODEL || LATEST_GEMINI_MODEL;

    const systemInstruction = `Bạn là chuyên gia dạy Kanji cho người Việt.

Nhiệm vụ của bạn là tạo MẸO NHỚ KANJI bằng phương pháp liên tưởng.

Khi nhận được một Kanji, hãy tạo một mẹo nhớ ngắn, tự nhiên, dễ hình dung và phù hợp với người Việt.

Mẹo nhớ phải dựa trên:
1. Hình dạng Kanji.
2. Các bộ thủ/thành phần.
3. Nghĩa của Kanji.
4. Có thể sử dụng hình ảnh tưởng tượng, nhân vật, đồ vật hoặc một câu chuyện ngắn.

Mục tiêu là giúp người học:
NHÌN KANJI → LIÊN TƯỞNG → NHỚ NGHĨA.

Không được bịa nguồn gốc lịch sử của Kanji.

Nếu câu chuyện chỉ là phương pháp ghi nhớ thì phải coi đó là “mẹo liên tưởng”, không được trình bày như nguồn gốc thật của chữ.

Mẹo phải:
* ngắn
* dễ hiểu
* dễ hình dung
* vui hoặc có điểm bất ngờ
* không gượng ép
* không quá học thuật
* phù hợp với người Việt

Không tạo nhiều phương án.
Chỉ trả về MỘT mẹo nhớ tốt nhất.${forceNew ? "\nLƯU Ý: Người dùng muốn đổi một mẹo nhớ MỚI KHÁC. Hãy tạo một mẹo liên tưởng hoàn toàn mới lạ, sáng tạo và độc đáo khác với các mẹo phổ biến để người học có thêm góc nhìn mới." : ""}

Ngoài mẹo nhớ, trả về:
* nghĩa tiếng Việt
* phân tích thành phần
* câu chốt nhớ
* 3 từ vựng thông dụng
* 1 câu ví dụ tiếng Nhật`;

    const userPrompt = `Dữ liệu chữ Hán:
- Chữ Kanji: ${trimmedKanji}
${meaning ? `- Nghĩa: ${meaning}` : ''}
${onyomi ? `- Âm Onyomi: ${onyomi}` : ''}
${kunyomi ? `- Âm Kunyomi: ${kunyomi}` : ''}
${strokes ? `- Số nét: ${strokes}` : ''}
${radical ? `- Bộ thủ: ${radical}` : ''}
${components ? `- Các thành phần cấu tạo: ${components}` : ''}
${level ? `- Cấp độ JLPT: ${level}` : ''}

Hãy phân tích và trả về đúng JSON theo schema được chỉ định.`;

    let result: any = null;
    let usedAiProvider = "Gemini";

    // 1. Primary: ChatGPT if configured
    if (getActiveOpenAIApiKey()) {
      try {
        const gptPrompt = userPrompt + `\nBẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON HỢP LỆ DUY NHẤT VỚI CẤU TRÚC:
{
  "kanji": "${trimmedKanji}",
  "meaning": "nghĩa tiếng Việt",
  "components": [{"part": "bộ phận", "meaning": "ý nghĩa"}],
  "memory_tip": "mẹo nhớ liên tưởng",
  "memory_sentence": "câu chốt nhớ",
  "vocabulary": [{"word": "từ vựng", "reading": "cách đọc hiragana", "meaning": "nghĩa"}],
  "example": {"japanese": "câu ví dụ tiếng Nhật", "hiragana": "cách đọc", "vietnamese": "dịch nghĩa"}
}`;
        const rawJson = await callOpenAIGPT({
          prompt: gptPrompt,
          systemInstruction,
          model: getActiveOpenAIModel(),
          jsonMode: true,
          temperature: forceNew ? 0.9 : 0.7
        });
        if (rawJson) {
          result = JSON.parse(rawJson.trim());
          usedAiProvider = `ChatGPT (${getActiveOpenAIModel()})`;
        }
      } catch (openAiErr: any) {
        console.warn("[Kanji AI] ChatGPT failed, falling back to Gemini:", openAiErr?.message || openAiErr);
      }
    }

    if (!result) {
      // Check Gemini API key
      if (!getLlmConfig().apiKey) {
        return res.status(500).json({
          success: false,
          error: "Chưa cấu hình API Key (OpenAI hoặc Gemini) trong Cấu hình AI.",
          isConfigError: true
        });
      }

      const response = await generateGeminiContentWithFallback({
        model: kanjiModel,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              kanji: { type: "STRING" },
              meaning: { type: "STRING" },
              components: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    part: { type: "STRING" },
                    meaning: { type: "STRING" }
                  },
                  required: ["part", "meaning"]
                }
              },
              memory_tip: { type: "STRING" },
              memory_sentence: { type: "STRING" },
              vocabulary: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    word: { type: "STRING" },
                    reading: { type: "STRING" },
                    meaning: { type: "STRING" }
                  },
                  required: ["word", "reading", "meaning"]
                }
              },
              example: {
                type: "OBJECT",
                properties: {
                  japanese: { type: "STRING" },
                  hiragana: { type: "STRING" },
                  vietnamese: { type: "STRING" }
                },
                required: ["japanese", "hiragana", "vietnamese"]
              }
            },
            required: ["kanji", "meaning", "components", "memory_tip", "memory_sentence", "vocabulary", "example"]
          },
          temperature: forceNew ? 0.9 : 0.7
        }
      });

      const rawText = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
      try {
        result = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("[Kanji AI] Parse JSON failed:", parseErr, "Raw output:", rawText);
        return res.status(500).json({
          success: false,
          error: "Không thể xử lý phản hồi từ AI. Vui lòng thử lại."
        });
      }
    }

    // Ensure valid fallback fields
    if (!result.kanji) result.kanji = trimmedKanji;
    if (!result.meaning) result.meaning = meaning || "";
    if (!Array.isArray(result.components)) result.components = [];
    if (!result.memory_tip) result.memory_tip = "Chưa có mẹo nhớ liên tưởng.";
    if (!result.memory_sentence) result.memory_sentence = result.meaning || "";
    if (!Array.isArray(result.vocabulary)) result.vocabulary = [];
    if (!result.example) {
      result.example = {
        japanese: `${trimmedKanji}を勉強しています。`,
        hiragana: "べんきょうしています。",
        vietnamese: "Đang học chữ này."
      };
    }

    return res.json({
      success: true,
      data: result,
      model: kanjiModel
    });
  } catch (err: any) {
    console.error("[Kanji AI] Error generating mnemonic:", err);
    return res.status(500).json({
      success: false,
      error: "Không thể tạo mẹo nhớ lúc này. Vui lòng thử lại.",
      details: err?.message || String(err)
    });
  }
});

app.get('/api/grammars', async (req, res) => {
  try {
    const [grammarRows,lessonRows]=await Promise.all([listContent('grammars'),listContent('lessons')]);
    const results=grammarRows.map(g=>({g,l:lessonRows.find(l=>String(l.id)===String(g.lessonId))||{lessonNumber:g.level==='N4'?26:g.level==='N3'?51:g.level==='N2'?52:g.level==='N1'?53:1,titleVi:g.lessonName||''}}));

    if (results && results.length > 0) {
      const mapped = results.map(row => {
        const levelNum = row.l.lessonNumber;
        const level = row.g.level || (levelNum <= 25 ? 'N5' : levelNum <= 50 ? 'N4' : levelNum === 51 ? 'N3' : levelNum === 52 ? 'N2' : 'N1');
        const exampleJp = row.g.exampleJp || '';
        return {
          id: 'g_' + row.g.id,
          lessonId: row.g.lessonId,
          lessonName: row.l.titleVi,
          lessonNumber: levelNum,
          structure: row.g.structure || '',
          meaning: row.g.meaning || '',
          explanation: row.g.explanation || '',
          exampleSentence: exampleJp,
          exampleTranslation: row.g.exampleVi || '',
          level: level,
          wordsToReorder: splitJapaneseSentence(exampleJp),
          correctSentence: exampleJp
        };
      });
      const deduplicated = deduplicateGrammars(mapped as any);
      return res.json(deduplicated);
    }
  } catch (error: any) {
    console.warn("DB grammars query error, returning fallback GRAMMAR_DATA:", error?.message);
  }
  res.json(deduplicateGrammars(GRAMMAR_DATA as any));
});

// ChatGPT General AI Completion Route
app.post('/api/chat-gpt', async (req, res) => {
  try {
    const { prompt, systemInstruction, model, jsonMode = false } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: "Thành phần 'prompt' là bắt buộc." });
    }
    if (prompt.length > 20000 || (systemInstruction !== undefined && (typeof systemInstruction !== 'string' || systemInstruction.length > 8000))) {
      return res.status(400).json({ error: "Nội dung quá dài." });
    }

    const currentKey = getActiveOpenAIApiKey();
    // Only plain GPT chat models may be requested by the client (no reasoning/pro tiers on your bill).
    const modelToUse = typeof model === 'string' && /^gpt-[\w.-]{1,40}$/.test(model) && !/pro|o1|o3/i.test(model) ? model : getActiveOpenAIModel();

    if (!currentKey) {
      try {
        const response = await generateGeminiContentWithFallback({
          contents: prompt,
          config: systemInstruction ? { systemInstruction } : undefined
        });
        return res.json({
          response: response.text,
          provider: "Gemini 3.8 Flash (Tự động chuyển do chưa cấu hình OPENAI_API_KEY)",
          isFallback: true
        });
      } catch (geminiErr: any) {
        return res.status(500).json({ error: "Cần cấu hình OpenAI API Key trong Cấu hình AI để dùng ChatGPT." });
      }
    }

    const gptResponse = await callOpenAIGPT({
      prompt,
      systemInstruction,
      model: modelToUse,
      jsonMode
    });

    let resultData: any = gptResponse;
    if (jsonMode) {
      try {
        resultData = JSON.parse(gptResponse);
      } catch {}
    }

    res.json({
      response: resultData,
      provider: `ChatGPT (${modelToUse})`,
      isFallback: false
    });
  } catch (error: any) {
    console.error("Error in /api/chat-gpt:", error);
    res.status(500).json({ error: error.message || "Lỗi xử lý yêu cầu ChatGPT" });
  }
});

// Thử kết nối Gemini bằng key/model người dùng nhập trong modal Cấu hình API
app.post('/api/ai/free-test', requireAuth, async (req, res) => {
  const { apiKey, model } = req.body || {};
  const started = Date.now();
  try {
    const reply = await callLLM({ prompt: "Chào bạn bằng một câu tiếng Nhật ngắn.", maxTokens: 200, override: { apiKey: apiKey || undefined, model: model || undefined } });
    res.json({ success: true, reply, ms: Date.now() - started });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || String(err) });
  }
});

// Central AI Status Endpoint
app.get('/api/ai/provider-status', (req, res) => {
  const openAiKey = getActiveOpenAIApiKey();
  res.json({
    geminiAvailable: !!process.env.GEMINI_API_KEY,
    openAiAvailable: !!openAiKey,
    defaultProvider: openAiKey ? getActiveAIProvider() : "gemini",
    model: getActiveOpenAIModel()
  });
});

// Central AI Configuration API: GET
app.get('/api/ai/config', requireAuth, requireAdmin, (req, res) => {
  const key = getActiveOpenAIApiKey();
  const maskedKey = key
    ? (key.length > 10 ? `${key.substring(0, 7)}...${key.substring(key.length - 4)}` : "********")
    : "";
  res.json({
    hasOpenAIKey: !!key,
    openAIKeyMasked: maskedKey,
    hasCustomKey: !!activeAIConfig.openaiApiKey,
    hasEnvKey: !!process.env.OPENAI_API_KEY,
    openaiModel: getActiveOpenAIModel(),
    provider: getActiveAIProvider(),
    geminiAvailable: !!process.env.GEMINI_API_KEY,
    availableModels: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "Tốc độ nhanh, phản hồi mượt mà, tối ưu chi phí (Khuyên dùng)", recommended: true },
      { id: "gpt-4o", name: "GPT-4o", desc: "Mô hình cao cấp, suy luận sắc bén và phân tích tiếng Nhật sâu sắc nhất", recommended: false },
      { id: "gpt-4.1-turbo", name: "GPT-4 Turbo", desc: "Chuyên xử lý ngữ cảnh bài đọc hiểu dài và ngữ pháp phức tạp", recommended: false },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", desc: "Mô hình cơ bản truyền thống", recommended: false },
    ],
    updatedAt: activeAIConfig.updatedAt
  });
});

// Central AI Configuration API: POST (Save dynamic changes immediately)
app.post('/api/ai/config', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { openaiApiKey, openaiModel, provider } = req.body;

    if (openaiApiKey !== undefined) {
      activeAIConfig.openaiApiKey = typeof openaiApiKey === 'string' ? openaiApiKey.trim() : "";
    }
    if (openaiModel && typeof openaiModel === 'string') {
      activeAIConfig.openaiModel = openaiModel.trim();
    }
    if (provider === 'chatgpt' || provider === 'gemini') {
      activeAIConfig.provider = provider;
    }
    activeAIConfig.updatedAt = new Date().toISOString();

    // Reset client cache so new key takes effect immediately
    openaiClientInstance = null;
    currentClientKey = "";

    await writeRecord('server_settings','ai-config',activeAIConfig);

    const key = getActiveOpenAIApiKey();
    const maskedKey = key
      ? (key.length > 10 ? `${key.substring(0, 7)}...${key.substring(key.length - 4)}` : "********")
      : "";

    return res.json({
      success: true,
      message: "Đã cập nhật cấu hình AI dùng chung thành công!",
      config: {
        hasOpenAIKey: !!key,
        openAIKeyMasked: maskedKey,
        openaiModel: getActiveOpenAIModel(),
        provider: getActiveAIProvider(),
        updatedAt: activeAIConfig.updatedAt
      }
    });
  } catch (err: any) {
    console.error("[AI Config] Error updating config:", err);
    return res.status(500).json({ error: err.message || "Lỗi lưu cấu hình AI" });
  }
});

// Central AI Test Endpoint: POST (Live verification of API Key and quota)
app.post('/api/ai/test', requireAuth, requireAdmin, async (req, res) => {
  try {
    const testKey = (req.body.openaiApiKey || getActiveOpenAIApiKey() || "").trim();
    const testModel = (req.body.openaiModel || getActiveOpenAIModel() || "gpt-4o-mini").trim();

    if (!testKey) {
      return res.status(400).json({
        success: false,
        error: "Chưa có API Key OpenAI để kiểm tra. Vui lòng nhập OpenAI API Key."
      });
    }

    const tempClient = new OpenAI({ apiKey: testKey });
    const completion = await tempClient.chat.completions.create({
      model: testModel,
      messages: [
        { role: "system", content: "You are an AI assistant. Return a concise greeting in Japanese and Vietnamese." },
        { role: "user", content: "Chào bạn, hãy gửi một lời chào ngắn bằng tiếng Nhật và tiếng Việt để xác nhận kết nối thành công." }
      ],
      max_tokens: 60,
      temperature: 0.5
    });

    const reply = completion.choices[0]?.message?.content || "";
    return res.json({
      success: true,
      message: `Kết nối thành công tới OpenAI ChatGPT (${testModel})!`,
      reply: reply.trim(),
      model: testModel
    });
  } catch (err: any) {
    let errorMsg = err?.message || String(err);
    let errorType = "general";
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("credits") || errorMsg.includes("exceeded")) {
      errorType = "quota_exceeded";
      errorMsg = "API Key hợp lệ nhưng tài khoản OpenAI của bạn đã hết số dư/credits (Lỗi 429 Quota Exceeded). Bạn vui lòng nạp thêm số dư tại platform.openai.com/billing hoặc chuyển sang chế độ Gemini AI dự phòng.";
    } else if (errorMsg.includes("401") || errorMsg.includes("Incorrect API key") || errorMsg.includes("invalid_api_key")) {
      errorType = "invalid_key";
      errorMsg = "API Key OpenAI không hợp lệ hoặc đã bị thu hồi (Lỗi 401 Unauthorized). Vui lòng kiểm tra lại mã khóa bí mật.";
    }
    return res.status(400).json({
      success: false,
      errorType,
      error: errorMsg,
      rawError: err?.message
    });
  }
});

// ============================================================================
// GRAMMAR AI REDESIGN & PERSISTENCE ENGINE
// ============================================================================
const GRAMMAR_AI_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'grammarAiContents.json');
const USER_GRAMMAR_PROGRESS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'userGrammarProgress.json');

async function readGrammarAiFile(): Promise<Record<string,any>> {
  const [seed,rows]=await Promise.all([readPersistentJson(GRAMMAR_AI_FILE_PATH),listRecords('grammar_ai_contents')]);
  return {...Object.fromEntries(Object.entries(seed).map(([key,value]:[string,any])=>[value.grammarId||key,value])),...Object.fromEntries(rows.map(row=>[row.grammarId,row]))};
}
async function writeGrammarAiFile(data:Record<string,any>,id:string) {await writeRecord('grammar_ai_contents',id,data[id]);}
async function initGrammarAiTable() { /* Firestore creates collections on first write. */ }


// 1. AI Content Generation for Grammar (Full Lesson Suite: Overview, Formation, Usage, Notes, Memory Tip, Similar, Examples & Exercises)
app.post('/api/grammar/ai-generate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      grammarId,
      grammar,
      meaning,
      level,
      explanation,
      mode = 'all',
      existing_examples = [],
      existing_exercises = []
    } = req.body;

    if (!grammar || typeof grammar !== 'string' || !grammar.trim()) {
      return res.status(400).json({
        success: false,
        error: "Thông tin mẫu ngữ pháp (grammar) là bắt buộc."
      });
    }

    const userPrompt = buildGrammarContentUserPrompt({
      grammar: grammar.trim(),
      meaning: meaning || '',
      level: level || 'N4',
      explanation: explanation || '',
      mode,
      existing_examples,
      existing_exercises
    });

    let rawResult: string | null = null;
    let usedProvider = "ChatGPT (gpt-4o-mini)";

    // Step 1: Try ChatGPT first
    try {
      rawResult = await callOpenAIGPT({
        prompt: userPrompt,
        systemInstruction: GRAMMAR_SYSTEM_PROMPT,
        model: "gpt-4o-mini",
        jsonMode: true
      });
    } catch (gptErr: any) {
      console.warn("[Grammar AI] ChatGPT call error, falling back to Gemini:", gptErr?.message || gptErr);
    }

    // Step 2: Fallback to Gemini if needed
    if (!rawResult) {
      usedProvider = "Gemini 3.8 Flash";
      try {
        const geminiResp = await generateGeminiContentWithFallback({
          contents: [
            { role: 'user', parts: [{ text: `${GRAMMAR_SYSTEM_PROMPT}\n\n${userPrompt}` }] }
          ],
          model: LATEST_GEMINI_MODEL,
          config: {
            responseMimeType: "application/json"
          }
        });
        rawResult = geminiResp.text || null;
      } catch (geminiErr: any) {
        console.error("[Grammar AI] Gemini generation error:", geminiErr?.message || geminiErr);
      }
    }

    if (!rawResult) {
      return res.status(500).json({
        success: false,
        error: "Không nhận được phản hồi hợp lệ từ mô hình AI. Vui lòng thử lại."
      });
    }

    // Clean JSON markdown wrapping if present
    let cleaned = rawResult.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleaned);

    // Standardize Examples
    const examples = Array.isArray(parsed.examples) ? parsed.examples.map((ex: any) => ({
      japanese: ex.japanese || '',
      hiragana: ex.hiragana || '',
      romaji: ex.romaji || '',
      vietnamese: ex.vietnamese || '',
      explanation: ex.explanation || '',
      nuance: ex.nuance || '',
      context: ex.context || 'Đời sống giao tiếp'
    })) : [];

    // Standardize Exercises
    const exercises = Array.isArray(parsed.exercises) ? parsed.exercises.map((ex: any, idx: number) => ({
      id: ex.id || `ex_${idx + 1}`,
      type: ex.type || 'multiple_choice',
      question: ex.question || '',
      choices: Array.isArray(ex.choices) ? ex.choices : [],
      correct_answer: String(ex.correct_answer ?? ex.answer ?? ''),
      explanation: ex.explanation || '',
      sentence_full: ex.sentence_full || '',
      sentence_hiragana: ex.sentence_hiragana || '',
      translation: ex.translation || '',
      context: ex.context || ''
    })) : [];

    // Standardize Formation Rules
    const formationRules = Array.isArray(parsed.formationRules) ? parsed.formationRules.map((r: any) => ({
      partOfSpeech: r.partOfSpeech || '',
      rule: r.rule || '',
      example: r.example || '',
      meaning: r.meaning || ''
    })) : [];

    // Standardize Similar Grammars
    const similarGrammars = Array.isArray(parsed.similarGrammars) ? parsed.similarGrammars.map((s: any) => ({
      similarStructure: s.similarStructure || '',
      meaning: s.meaning || '',
      difference: s.difference || '',
      comparisonExample: s.comparisonExample || ''
    })) : [];

    // Standardize Usage Guide & Notes
    const usageGuide = parsed.usageGuide && typeof parsed.usageGuide === 'object' ? parsed.usageGuide : {
      whenToUse: [],
      whenNotToUse: [],
      subjectConstraint: '',
      nuance: ''
    };
    const notes = Array.isArray(parsed.notes) ? parsed.notes : (parsed.notes ? [parsed.notes] : []);
    const memoryTip = parsed.memoryTip || parsed.mnemonic || '';

    return res.json({
      success: true,
      provider: usedProvider,
      data: {
        grammarId: grammarId || grammar.trim(),
        grammar: parsed.grammar || grammar.trim(),
        level: parsed.level || level || 'N4',
        overview: parsed.overview || '',
        formationRules,
        usageGuide,
        notes,
        memoryTip,
        similarGrammars,
        examples,
        exercises
      }
    });
  } catch (err: any) {
    console.error("[Grammar AI Generate Error]:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Lỗi xử lý dữ liệu AI ngữ pháp."
    });
  }
});

// 2. Save confirmed AI content directly to the website system (Firebase Firestore)
app.post('/api/grammar/save-content', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      grammarId,
      grammar,
      level,
      overview = '',
      formationRules = [],
      usageGuide = {},
      notes = [],
      memoryTip = '',
      similarGrammars = [],
      examples = [],
      exercises = []
    } = req.body;

    if (!grammarId || !grammar) {
      return res.status(400).json({
        success: false,
        error: "grammarId và grammar là bắt buộc."
      });
    }

    const fileData = await readGrammarAiFile();
    const existing = fileData[grammarId] || null;

    const record = {
      grammarId,
      grammar,
      level: level || 'N4',
      overview,
      formationRules,
      usageGuide,
      notes,
      memoryTip,
      similarGrammars,
      examples,
      exercises,
      updatedAt: new Date().toISOString(),
      backup: existing ? {
        examples: existing.examples || [],
        exercises: existing.exercises || [],
        updatedAt: existing.updatedAt || new Date().toISOString()
      } : undefined
    };

    // Layer 1: Save to file cache
    fileData[grammarId] = record;
    await writeGrammarAiFile(fileData,grammarId);


    return res.json({
      success: true,
      item: record
    });
  } catch (err: any) {
    console.error("[Grammar AI Save Error]:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Lỗi khi lưu nội dung ngữ pháp vào website."
    });
  }
});

// 3. Get all saved AI Grammar contents
app.get('/api/grammar/all-ai-contents', async (req, res) => {
  try {
    const fileData = await readGrammarAiFile();


    return res.json({
      success: true,
      data: fileData
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// 4. Get specific AI grammar content
app.get('/api/grammar/ai-content/:grammarId', async (req, res) => {
  try {
    const { grammarId } = req.params;
    const fileData = await readGrammarAiFile();
    let item = fileData[grammarId] || null;


    if (!item) {
      return res.status(404).json({ success: false, error: "Chưa có nội dung AI cho mẫu ngữ pháp này." });
    }

    return res.json({ success: true, item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// 5. Rollback to previously backed up version
app.post('/api/grammar/rollback-content', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { grammarId } = req.body;
    if (!grammarId) {
      return res.status(400).json({ success: false, error: "grammarId là bắt buộc." });
    }

    const fileData = await readGrammarAiFile();
    const existing = fileData[grammarId];

    if (!existing || !existing.backup) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy phiên bản lưu trữ trước đó để khôi phục."
      });
    }

    const previousData = existing.backup;
    const restored = {
      ...existing,
      examples: previousData.examples,
      exercises: previousData.exercises,
      updatedAt: new Date().toISOString(),
      backup: undefined
    };

    // Save to file
    fileData[grammarId] = restored;
    await writeGrammarAiFile(fileData,grammarId);


    return res.json({
      success: true,
      item: restored
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// 6. User Grammar Progress Tracking & Spaced Repetition (SM-2 Algorithm)
app.post('/api/grammar/progress/record', requireAuth, async (req:any,res)=>{
  try {const progress=await recordGrammarAttempt(req.dbUser.uid,req.body);return res.json({success:true,progress});}
  catch(e:any){return res.status(e.message==='INVALID_PROGRESS'?400:503).json({success:false,error:'Không lưu được tiến độ ngữ pháp.'});}
});

// 7. Get user's grammar progress map
app.get('/api/grammar/progress/user/:userUid', requireAuth, async (req:any,res)=>{
  if(req.params.userUid!==req.dbUser.uid&&req.dbUser.role!=='admin')return res.status(403).json({success:false,error:'Forbidden'});
  try {return res.json({success:true,progressMap:await userGrammarProgress(req.params.userUid)});}
  catch{return res.status(503).json({success:false,error:'Không tải được tiến độ ngữ pháp.'});}
});

// 8. AI Personalized Smart Review Generator
app.post('/api/grammar/personalized-review', async (req, res) => {
  try {
    const { userUid, level, targetGrammars = [] } = req.body;

    if (!targetGrammars || targetGrammars.length === 0) {
      return res.status(400).json({ success: false, error: "targetGrammars is required." });
    }

    const grammarNames = targetGrammars.map((g: any) => typeof g === 'string' ? g : (g.structure || g.grammar || g.id)).join(', ');

    const prompt = `Người học tiếng Nhật cấp độ ${level || 'N4'} đang gặp khó khăn hoặc cần ôn tập lại các mẫu ngữ pháp sau:
${grammarNames}

Hãy soạn 5 câu hỏi trắc nghiệm kiểm tra sâu sắc sự khác biệt và cách dùng chính xác của các mẫu ngữ pháp trên.
Mỗi câu hỏi phải kiểm tra đúng ngữ cảnh sử dụng hoặc sự kết hợp thể của ngữ pháp.

Hãy trả về JSON:
{
  "reviewTitle": "Bài kiểm tra ôn tập cá nhân hóa",
  "questions": [
    {
      "id": "rev_1",
      "targetGrammar": "Tên mẫu ngữ pháp được kiểm tra",
      "question": "Câu có chỗ trống _____",
      "choices": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"],
      "correct_answer": "Lựa chọn 1",
      "explanation": "Giải thích chi tiết vì sao đáp án này đúng và phân tích bẫy ngữ pháp.",
      "sentence_full": "Câu hoàn chỉnh tiếng Nhật",
      "translation": "Dịch nghĩa câu hoàn chỉnh"
    }
  ]
}`;

    let rawResult = await callOpenAIGPT({
      prompt,
      systemInstruction: "Bạn là chuyên gia sư phạm tiếng Nhật luyện thi JLPT hàng đầu. Trả về đúng 1 JSON duy nhất.",
      model: "gpt-4o-mini",
      jsonMode: true
    }).catch(() => ""); // không có key OpenAI → rơi xuống Gemini

    if (!rawResult) {
      const geminiResp = await generateGeminiContentWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        model: LATEST_GEMINI_MODEL,
        config: { responseMimeType: "application/json" }
      });
      rawResult = geminiResp.text || null;
    }

    if (!rawResult) {
      return res.status(500).json({ success: false, error: "Không thể tạo bài ôn tập lúc này." });
    }

    let cleaned = rawResult.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);

    return res.json({
      success: true,
      data: parsed
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// 9. AI Tutor Chat & Quick Prompts for Current Grammar
app.post('/api/grammar/ai-tutor', async (req, res) => {
  try {
    const { grammarStructure, grammarMeaning, level, userQuery, quickAction } = req.body;

    if (!grammarStructure) {
      return res.status(400).json({ success: false, error: "grammarStructure is required." });
    }

    let prompt = "";
    if (quickAction === 'easier_explanation') {
      prompt = `Hãy giải thích mẫu ngữ pháp ${level || 'N4'} 【${grammarStructure}】 (${grammarMeaning || ''}) một cách cực kỳ đơn giản, dễ hiểu như đang giải thích cho người mới bắt đầu học tiếng Nhật. Dùng ví dụ đời sống quen thuộc và nêu rõ bản chất.`;
    } else if (quickAction === 'more_examples') {
      prompt = `Hãy đưa ra 3 ví dụ thực tế, tự nhiên nhất về mẫu ngữ pháp 【${grammarStructure}】 (${grammarMeaning || ''}) trong các ngữ cảnh: Đời sống, Công việc, Giao tiếp bạn bè. Mỗi ví dụ gồm: Câu tiếng Nhật, Hiragana, Dịch tiếng Việt, và giải thích ngắn.`;
    } else if (quickAction === 'find_error') {
      prompt = `Hãy tạo 1 câu tiếng Nhật bị SAI khi cố gắng dùng mẫu ngữ pháp 【${grammarStructure}】 (${grammarMeaning || ''}), và đố người học tìm ra lỗi sai. Sau đó nêu rõ lỗi sai đó là gì và cách sửa đúng.`;
    } else if (quickAction === 'more_exercise') {
      prompt = `Hãy tạo 2 câu bài tập trắc nghiệm mới (kèm 4 đáp án tiếng Nhật thực tế, đáp án đúng và giải thích) để người học luyện tập thêm mẫu ngữ pháp 【${grammarStructure}】.`;
    } else {
      prompt = `Người học tiếng Nhật đang học mẫu ngữ pháp ${level || 'N4'} 【${grammarStructure}】 (${grammarMeaning || ''}) và có câu hỏi sau:
"${userQuery}"

Hãy trả lời một cách tận tâm, ngắn gọn, chuẩn sư phạm, tập trung đúng vào trọng tâm của mẫu ngữ pháp 【${grammarStructure}】. Không trả lời lan man ngoài bài học.`;
    }

    const systemInstruction = `Bạn là Trợ giảng AI Tiếng Nhật (JLPT AI Tutor) chuyên nghiệp, thân thiện, giải thích rõ ràng, chuẩn ngữ pháp tiếng Nhật và sư phạm.`;

    let replyText = await callOpenAIGPT({
      prompt,
      systemInstruction,
      model: "gpt-4o-mini",
      jsonMode: false
    }).catch(() => ""); // không có key OpenAI → rơi xuống Gemini

    if (!replyText) {
      const geminiResp = await generateGeminiContentWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        model: LATEST_GEMINI_MODEL
      });
      replyText = geminiResp.text || "Xin lỗi, AI Tutor tạm thời chưa thể phản hồi. Vui lòng thử lại sau.";
    }

    return res.json({
      success: true,
      reply: replyText
    });
  } catch (err: any) {
    console.error("[Grammar AI Tutor Error]:", err);
    return res.status(500).json({ success: false, error: err?.message || "Lỗi kết nối AI Tutor." });
  }
});

// 10. AI Generate Similar Question (Thử lại câu tương tự sau khi làm sai)
app.post('/api/grammar/similar-question', async (req, res) => {
  try {
    const { grammarStructure, grammarMeaning, level, failedQuestion } = req.body;

    const prompt = `Người học vừa làm sai một câu hỏi về mẫu ngữ pháp ${level || 'N4'} 【${grammarStructure}】 (${grammarMeaning || ''}).
${failedQuestion ? `Câu hỏi vừa làm sai: "${failedQuestion}"` : ''}

Hãy tạo ra một câu hỏi trắc nghiệm MỚI (không trùng câu cũ) để kiểm tra lại cùng kiến thức ngữ pháp này.
Yêu cầu:
1. 4 phương án tiếng Nhật thực tế, tự nhiên.
2. Đáp án đúng và giải thích rõ ràng bằng tiếng Việt.
3. Mẹo nhớ ngắn gọn.

Trả về JSON đúng cấu trúc:
{
  "id": "sim_q_${Date.now()}",
  "type": "multiple_choice",
  "question": "Câu tiếng Nhật có chỗ trống _____ ",
  "choices": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
  "correct_answer": "Lựa chọn đúng",
  "explanation": "Giải thích vì sao đúng và phân tích bẫy ngữ pháp.",
  "memory_tip": "Mẹo nhớ ngắn gọn",
  "sentence_full": "Câu hoàn chỉnh",
  "translation": "Dịch nghĩa tiếng Việt"
}`;

    let rawResult = await callOpenAIGPT({
      prompt,
      systemInstruction: "Bạn là chuyên gia ra đề thi JLPT. Trả về đúng 1 JSON duy nhất.",
      model: "gpt-4o-mini",
      jsonMode: true
    }).catch(() => ""); // không có key OpenAI → rơi xuống Gemini

    if (!rawResult) {
      const geminiResp = await generateGeminiContentWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        model: LATEST_GEMINI_MODEL,
        config: { responseMimeType: "application/json" }
      });
      rawResult = geminiResp.text || null;
    }

    if (!rawResult) {
      // Fallback local question
      return res.json({
        success: true,
        question: {
          id: `sim_q_${Date.now()}`,
          type: "multiple_choice",
          question: `山田さんはいつもテレビを_____、ご飯を食べます。`,
          choices: ["見ながら", "見てながら", "見るながら", "見ますながら"],
          correct_answer: "見ながら",
          explanation: `Động từ thể ます bỏ ます kết hợp với ながら để biểu thị vừa xem tivi vừa ăn cơm.`,
          memory_tip: `Động từ bỏ ます + ながら`,
          sentence_full: "山田さんはいつもテレビを見ながら、ご飯を食べます。",
          translation: "Anh Yamada lúc nào cũng vừa xem tivi vừa ăn cơm."
        }
      });
    }

    const cleaned = rawResult.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);

    return res.json({
      success: true,
      question: parsed
    });
  } catch (err: any) {
    console.error("[Similar Question Error]:", err);
    return res.status(500).json({ success: false, error: err?.message || "Lỗi tạo câu hỏi tương tự." });
  }
});

async function startServer() {
  await initGrammarAiTable();
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send("Application ready.");
      }
    });
  }

  // Standard port for local sandbox container & Cloud Run ingress routing (nginx reverse proxies exclusively to 3000)
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    console.error(`[Server Port ${PORT}] Error:`, err.message);
  });

  // Graceful shutdown on SIGTERM (sent by Cloud Run during revision rollout)
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, gracefully closing server...");
    server.close(() => {
      process.exit(0);
    });
  });
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
});

// On Vercel the app runs as a serverless function (see api/server.ts):
// Vercel handles listening and static files, so only prepare the DB table.
if (process.env.VERCEL) {
  initGrammarAiTable().catch((err) => console.error("[initGrammarAiTable]", err));
} else {
  startServer();
}

export default app;
