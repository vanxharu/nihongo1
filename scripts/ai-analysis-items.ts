// Pre-written AI analyses (served as static files) — item enumeration shared by the todo and import scripts.
// Texts must equal exactly what each AiAnalyzeButton receives, because the file name is the hash of kind+text.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { TANGO_N4_VOCABULARY } from '../src/data/tangoN4Vocab.js';
import { FALLBACK_PATTERNS } from '../src/components/grammarData.js';
import { SHADOWING_EXTRA } from '../src/data/shadowingExtra.js';

export type Item = { group: string; kind: string; text: string; context: string };
export const analysisKey = (kind: string, text: string) => createHash('sha256').update(`${kind}\n${text.trim()}`).digest('hex').slice(0, 40);
export const analysisPath = (kind: string, text: string) => `public/ai-analysis/${analysisKey(kind, text)}.json`;

/** Work order: one "group" = one lesson / video, so progress is reported per lesson. */
export function allItems(): Item[] {
  const items: Item[] = [];
  for (const v of TANGO_N4_VOCABULARY as any[]) {
    const group = `vocab:${v.lessonId}`;
    items.push({ group, kind: 'vocab', text: v.kanji || v.hiragana, context: `${v.hiragana} — ${v.meaning}` });
    if (v.exampleSentence) items.push({ group, kind: 'sentence', text: v.exampleSentence, context: v.exampleTranslation || '' });
  }
  for (const [lesson, patterns] of Object.entries((FALLBACK_PATTERNS as any).N4))
    for (const p of patterns as any[]) items.push({ group: `grammar:N4:${lesson}`, kind: 'grammar', text: p.structure, context: `${p.meaning} (N4)` });
  // Shortest videos first so each session finishes whole videos.
  const videos = SHADOWING_EXTRA.map(([id]) => ({ id, cues: JSON.parse(readFileSync(`public/shadowing-prepared/${id}.json`, 'utf8')).cues })).sort((a, b) => a.cues.length - b.cues.length);
  for (const v of videos) for (const c of v.cues) items.push({ group: `video:${v.id}`, kind: 'video', text: c.text, context: '' });
  const seen = new Set<string>();
  return items.filter(i => { const k = analysisKey(i.kind, i.text); if (seen.has(k)) return false; seen.add(k); return true; });
}
