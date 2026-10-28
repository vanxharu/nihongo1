// Usage: npx tsx scripts/prepare-shadowing-auto.ts <dir with {id}.json from /api/shadowing/transcript>
// Builds public/shadowing-prepared/{id}.json: sentences (punctuation-based) + kuromoji furigana, no translation.
import { readFile, writeFile } from 'node:fs/promises';
import { SHADOWING_EXTRA as extra } from '../src/data/shadowingExtra.js';
import { splitSentenceCues, normalizeShadowingTimeline } from '../src/utils/shadowing.js';
import { sentenceReadings } from '../src/server/shadowing.js';
import { validateStoredCues } from '../src/server/shadowingStore.js';
import { SHADOWING_VIDEOS } from '../src/data/shadowingVideos.js';

const dir = process.argv[2];
for (const [id] of extra as [string, ...unknown[]][]) {
  const raw = JSON.parse(await readFile(`${dir}/${id}.json`, 'utf8')).cues as any[];
  const cleaned = raw.map(c => ({ ...c, text: c.text.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim() })).filter(c => /[぀-ヿ㐀-鿿]/.test(c.text));
  // Join fragments until sentence punctuation (auto captions wrap mid-word), then split at 。？！.
  const joined: any[] = [];
  for (const c of normalizeShadowingTimeline(cleaned)) {
    const prev = joined[joined.length - 1];
    if (prev && !/[。！？!?]\s*$/.test(prev.text) && prev.text.length + c.text.length <= 240 && c.start - prev.end <= 3) { prev.text += c.text; prev.end = Math.max(prev.end, c.end!); }
    else joined.push({ ...c });
  }
  const sentences = normalizeShadowingTimeline(splitSentenceCues(joined))
    .filter(c => c.end! > c.start!).slice(0, 500)
    .map((c, i) => ({ id: `sentence-${i}`, text: c.text, start: Math.round(c.start! * 1000) / 1000, end: Math.round(c.end! * 1000) / 1000 }));
  const cues = [];
  for (const c of sentences) cues.push({ ...c, readings: (await sentenceReadings(c.text)).slice(0, 100) });
  validateStoredCues(cues);
  const title = SHADOWING_VIDEOS.find(v => v.youtube_video_id === id)!.title;
  await writeFile(`public/shadowing-prepared/${id}.json`, JSON.stringify({ videoId: id, title, sentenceVersion: '2026-10-04-v1', cues }));
  console.log(id, raw.length, '->', cues.length);
}
