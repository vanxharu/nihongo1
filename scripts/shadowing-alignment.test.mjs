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
const { sentenceTokens, sentenceGroups } = load('../src/utils/shadowingSentences.ts', { './shadowing.js': utils });

test('current word follows zero-duration native onsets and respects measured word ends', () => {
  const onsets = [{ text: 'はい', textStart: 0, textEnd: 2, start: 1, end: 1 }, { text: 'そう', textStart: 2, textEnd: 4, start: 2, end: 2 }];
  assert.equal(utils.currentShadowingWord(0.9, 3, onsets), undefined);
  assert.equal(utils.currentShadowingWord(1.5, 3, onsets), onsets[0]);
  assert.equal(utils.currentShadowingWord(2, 3, onsets), onsets[1]);
  assert.equal(utils.currentShadowingWord(3, 3, onsets), undefined);
  assert.equal(utils.currentShadowingWord(1.5, 3, [{ ...onsets[0], end: 1.2 }]), undefined);
  assert.equal(utils.currentShadowingWord(1.1, 3, onsets), onsets[0]);
});

test('sentence editing joins broken clauses and separates replies at native word onsets', () => {
  const source = [
    { id: 'a', text: '昨日から頭が', start: 57.079, end: 58.92, timings: [{ text: '昨日から頭が', textStart: 0, textEnd: 6, start: 57.079, end: 57.079 }] },
    { id: 'b', text: '痛いんですそうですか', start: 58.92, end: 64.6, timings: [{ text: '痛いんです', textStart: 0, textEnd: 5, start: 58.92, end: 58.92 }, { text: 'そうですか', textStart: 5, textEnd: 10, start: 61.879, end: 61.879 }] },
  ];
  const tokens = sentenceTokens(source);
  const result = sentenceGroups(tokens, [{ endToken: 1, sourceText: '昨日から頭が痛いんです', translation: 'Tôi bị đau đầu từ hôm qua.' }, { endToken: 2, sourceText: 'そうですか', translation: 'Vậy sao?' }]);
  assert.equal(result[0].start, 57.079);
  assert.equal(result[0].end, 61.879);
  assert.equal(result[1].start, 61.879);
  assert.equal(result[0].translation, 'Tôi bị đau đầu từ hôm qua.');
  assert.ok(result.every(utils.validShadowingTimings));
  assert.equal(result.map(c => c.text).join(''), source.map(c => c.text).join(''));
  assert.throws(() => sentenceGroups(tokens, [{ endToken: 1, sourceText: '頭が痛い', translation: 'wrong' }]), /match/);
});

test('whole caption without word timing cannot become fake measured words', () => {
  const tokens = sentenceTokens([{ id: 'a', text: 'はい。', start: 1, end: 2 }, { id: 'b', text: '分かりました。', start: 2, end: 4 }]);
  const result = sentenceGroups(tokens, [{ endToken: 1, sourceText: 'はい。分かりました。', translation: 'Vâng, tôi hiểu rồi.' }]);
  assert.equal(result[0].timings, undefined);
});

test('prepared N4 dialogue keeps patient and doctor turns separate with their own translations', () => {
  const packet = JSON.parse(readFileSync(new URL('../public/shadowing-prepared/R1Oy-PqXhz4.json', import.meta.url), 'utf8'));
  const index = packet.cues.findIndex(c => c.text === '昨日から頭が痛くて喉も痛いんです');
  assert.ok(index >= 0);
  const [patient, reply, examination] = packet.cues.slice(index, index + 3);
  assert.equal(reply.text, 'そうですか');
  assert.equal(examination.text, 'じゃあちょっと喉を見ましょうね');
  assert.equal(patient.start, 57.079);
  assert.equal(patient.end, reply.start);
  assert.equal(reply.end, examination.start);
  assert.match(patient.translation, /đầu.*đau.*cổ họng.*đau/);
  assert.equal(reply.translation, 'Vậy sao');
  assert.ok([patient, reply, examination].every(utils.validShadowingTimings));
  assert.ok(packet.cues.every((c,i) => c.translation && Array.isArray(c.readings) && c.end > c.start && (i === 0 || c.start >= packet.cues[i-1].end - 0.001)));
});
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
