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
