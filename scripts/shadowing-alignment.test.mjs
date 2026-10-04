import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
import * as cheerio from 'cheerio';
function load(path, imports = {}) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: id => imports[id], URL });
  return exports;
}
const utils = load('../src/utils/shadowing.ts');
const { attachForcedAlignment } = load('../src/server/shadowingAlignment.ts', { '../utils/shadowing.js': utils });
const { parseYouTubeWordCaptions } = load('../src/server/shadowingNativeTiming.ts', { '../utils/shadowing.js': utils, cheerio });
const cues = [{ id: 'a', text: '日 本。', start: 0, end: 9 }, { id: 'b', text: '語😀', start: 5, end: 12 }];
const measured = { characters: [
  { text: '日', start: 1, end: 1.3 }, { text: ' ', start: 1.3, end: 1.5 },
  { text: '本', start: 2, end: 2.5 }, { text: '。', start: 2.5, end: 2.5 },
  { text: '\n', start: 2.5, end: 3 }, { text: '語', start: 4, end: 4.3 }, { text: '😀', start: 4.3, end: 4.5 },
] };
test('measured audio times replace sentence estimates without changing text or UTF16 offsets', () => {
  const result = attachForcedAlignment(cues, measured);
  assert.equal(result[0].text, cues[0].text);
  assert.equal(result[0].start, 1);
  assert.equal(result[0].end, 2.5);
  assert.equal(result[0].timings[1].textStart, 2);
  assert.equal(result[1].timings[1].textEnd, 3);
  assert.equal(cues[0].start, 0);
  assert.ok(utils.validShadowingTimings(result[0]));
});
test('highlight follows actual onsets, pauses, backwards seek and has no estimated fallback', () => {
  const cue = attachForcedAlignment(cues, measured)[0];
  assert.equal(utils.shadowingTextFill(1.2, 0, cue.timings), 100);
  assert.equal(utils.shadowingTextFill(1.9, 2, cue.timings), 0);
  assert.equal(utils.shadowingTextFill(2, 2, cue.timings), 100);
  assert.equal(utils.shadowingTextFill(.9, 0, cue.timings), 0);
  assert.equal(utils.shadowingTextFill(8, 0, []), 0);
});
test('alignment rejects missing text, reversed or nonfinite timing and multi-character guesses', () => {
  for (const replace of [
    { text: '違', start: 1, end: 1.3 }, { text: '日', start: -1, end: 1.3 },
    { text: '日', start: 3, end: 1.3 }, { text: '日', start: NaN, end: 1.3 },
    { text: '日本', start: 1, end: 1.3 },
  ]) assert.throws(() => attachForcedAlignment(cues, { characters: [replace, ...measured.characters.slice(1)] }));
});
test('video-specific assets reject mismatched IDs, corrupt spans and overlapping cues', () => {
  const aligned = attachForcedAlignment(cues, measured);
  const packet = { version: 1, videoId: 'I3kvL128MIQ', cues: aligned };
  assert.equal(utils.parseShadowingAlignment(packet, packet.videoId).length, 2);
  assert.throws(() => utils.parseShadowingAlignment(packet, 'other-video'));
  const corrupt = structuredClone(packet); corrupt.cues[0].timings[0].textStart = 2;
  assert.throws(() => utils.parseShadowingAlignment(corrupt, packet.videoId));
  const overlap = structuredClone(packet); overlap.cues[0].end = 6;
  assert.throws(() => utils.parseShadowingAlignment(overlap, packet.videoId));
});
test('native srv3 retains measured word onsets, ignores rolling blanks and never subdivides words', () => {
  const result = parseYouTubeWordCaptions('<timedtext><body><p t="4520" d="8840"><s>日本</s><s t="319">語</s><s t="600">能力</s></p><p t="7710" a="1">\n</p><p t="7720" d="3000"><s>一つの文章。</s></p></body></timedtext>');
  assert.equal(result.length, 2);
  assert.equal(result[0].end, 7.72);
  assert.equal(result[0].timings[0].text, '日本');
  assert.ok(Math.abs(result[0].timings[1].start - 4.839) < .000001);
  assert.equal(result[1].timings, undefined);
  assert.equal(utils.shadowingTextFill(4.52, 1, result[0].timings), 100);
});
test('native timings with invalid offsets or offsets outside a clipped sentence stay unaligned', () => {
  for (const stamp of ['-100', '9000', 'oops']) {
    const result = parseYouTubeWordCaptions(`<timedtext><body><p t="1000" d="2000"><s>日</s><s t="${stamp}">本</s></p></body></timedtext>`);
    assert.equal(result[0].timings, undefined);
  }
});
test('mixed native assets accept unaligned sentences without treating them as timed words', () => {
  const aligned = attachForcedAlignment(cues, measured);
  delete aligned[1].timings;
  assert.equal(utils.parseShadowingAlignment({ version: 1, videoId: 'I3kvL128MIQ', cues: aligned }, 'I3kvL128MIQ').length, 2);
  delete aligned[0].timings;
  assert.throws(() => utils.parseShadowingAlignment({ version: 1, videoId: 'I3kvL128MIQ', cues: aligned }, 'I3kvL128MIQ'));
});
test('music labels and unrecognized zero-length speech retain caption timing without fabricated highlights', () => {
  const result = attachForcedAlignment([
    { id: 'music', text: '[音楽]', start: 1, end: 2 },
    { id: 'speech', text: 'はい', start: 3, end: 5 },
  ], { characters: Array.from('[音楽]はい').map(text => ({ text, start: 1, end: 1 })) });
  assert.equal(result[0].start, 1);
  assert.equal(result[1].start, 3);
  assert.equal(result[0].timings, undefined);
  assert.equal(result[1].timings, undefined);
});
