import assert from 'node:assert/strict';
import { test } from 'node:test';
import { claudeShadowingPrompt, parseShadowingAnalysisFile } from '../src/utils/shadowingAnalysisFile';
const cues = [{ id: 'cue-1', text: '日本語です。', start: 1, end: 3 }, { id: 'cue-2', text: 'ありがとう。', start: 4, end: 6 }];
const packet = () => ({ version: 1, videoId: 'R1Oy-PqXhz4', sentences: [{ id: 'cue-1', text: cues[0].text, analysis: { translation: 'Đây là tiếng Nhật.', readings: [{ word: '日本語', reading: 'にほんご', offset: 0 }], vocabulary: [{ word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật' }], kanji: [], grammar: [] } }] });
const parse = (p: unknown) => parseShadowingAnalysisFile(p, 'R1Oy-PqXhz4', cues);
test('accepts partial imports and does not change transcript or timing', () => {
  const before = JSON.stringify(cues), p = packet();
  assert.equal(parse(p).sentences[0].analysis.source, 'ai');
  assert.equal(parse(p).sentences.length, 1);
  assert.equal(JSON.stringify(cues), before);
});
test('rejects wrong video, changed subtitle and duplicate IDs', () => {
  assert.throws(() => parse({ ...packet(), videoId: 'other' }));
  const changed = packet(); changed.sentences[0].text = '違う'; assert.throws(() => parse(changed));
  const duplicate = packet(); duplicate.sentences.push(duplicate.sentences[0]); assert.throws(() => parse(duplicate));
});
test('rejects malformed nested objects, missing translation and invalid readings atomically', () => {
  for (const field of ['vocabulary', 'grammar', 'kanji', 'readings']) {
    const p = packet(); (p.sentences[0].analysis as any)[field] = [null]; assert.throws(() => parse(p));
  }
  const p = packet(); p.sentences[0].analysis.translation = ' '; assert.throws(() => parse(p));
  const r = packet(); r.sentences[0].analysis.readings[0].offset = 2; assert.throws(() => parse(r));
  const invalidTail = packet(); invalidTail.sentences.push({ ...invalidTail.sentences[0], id: 'missing' }); assert.throws(() => parse(invalidTail));
});
test('exports exact IDs and text to Claude with required format', () => {
  const prompt = claudeShadowingPrompt('R1Oy-PqXhz4', cues);
  assert.ok(prompt.includes('"videoId": "R1Oy-PqXhz4"'));
  assert.ok(prompt.includes('"id": "cue-2"'));
  assert.ok(prompt.includes(cues[0].text));
  assert.ok(prompt.includes('"translation"'));
});

test('prepared catalog keeps all live sentence IDs for static analysis', async () => {
  const { readFile } = await import('node:fs/promises');
  const { parsePreparedShadowingCaptions } = await import('../src/utils/shadowing');
  const source = JSON.parse(await readFile(new URL('../public/shadowing-prepared/R1Oy-PqXhz4.json', import.meta.url), 'utf8'));
  const analysis = JSON.parse(await readFile(new URL('../public/shadowing-analysis/R1Oy-PqXhz4.json', import.meta.url), 'utf8'));
  const prepared = parsePreparedShadowingCaptions(source, source.videoId);
  assert.equal(prepared.length, 322);
  assert.deepEqual(prepared.map(c => [c.id, c.text]), source.cues.map((c: any) => [c.id, c.text]));
  assert.equal(parseShadowingAnalysisFile(analysis, source.videoId, prepared).sentences.length, 322);
  assert.throws(() => parsePreparedShadowingCaptions({ ...source, videoId: 'different' }, source.videoId));
  assert.throws(() => parsePreparedShadowingCaptions({ ...source, cues: [{ ...source.cues[0], start: -1 }] }, source.videoId));
});

test('dictionary provenance remains dictionary after import', () => {
  const p = packet();
  (p.sentences[0].analysis as any).source = 'dictionary';
  assert.equal(parse(p).sentences[0].analysis.source, 'dictionary');
});

test('every catalog file covers its exact source and repeated loads never join sentences', async () => {
  const { readFile } = await import('node:fs/promises');
  const { SHADOWING_VIDEOS } = await import('../src/data/shadowingVideos');
  const { parsePreparedShadowingCaptions, normalizeShadowingTimeline } = await import('../src/utils/shadowing');
  const { createHash } = await import('node:crypto');
  const manifest = JSON.parse(await readFile(new URL('../public/shadowing-analysis/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.totalVideos, 10);
  let total = 0;
  for (const video of SHADOWING_VIDEOS.filter(v => v.source === 'The Nihongo Nook')) { // later additions ship prepared captions only
    const id = video.youtube_video_id;
    const source = JSON.parse(await readFile(new URL(`../public/shadowing-captions/${id}.json`, import.meta.url), 'utf8'));
    let cues = parsePreparedShadowingCaptions(source, id);
    for (let n = 0; n < 5; n++) cues = normalizeShadowingTimeline(cues);
    assert.deepEqual(cues.map(c => [c.id, c.text]), source.cues.map((c: any) => [c.id, c.text]));
    const saved = JSON.parse(await readFile(new URL(`../public/shadowing-analysis/${id}.json`, import.meta.url), 'utf8'));
    const analysis = parseShadowingAnalysisFile(saved, id, cues);
    assert.equal(analysis.sentences.length, cues.length);
    assert.deepEqual(analysis.sentences.map(c => [c.id,c.text]), cues.map(c => [c.id,c.text]));
    const hash = createHash('sha256').update(JSON.stringify(source.cues.map((c: any) => [c.id,c.text,c.start,c.end]))).digest('hex');
    assert.equal(manifest.videos.find((v: any) => v.videoId === id).sourceHash, hash);
    for (const row of analysis.sentences) for (const v of row.analysis.vocabulary) assert.ok(row.text.includes(v.word), `Vocabulary must occur in its caption: ${id} ${row.id}`);
    total += cues.length;
  }
  assert.equal(total,3384);
  assert.equal(manifest.totalCues,total);
});
