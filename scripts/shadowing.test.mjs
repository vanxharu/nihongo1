import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
const source = ts.transpileModule(readFileSync(new URL('../src/utils/shadowing.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
vm.runInNewContext(source, { exports, URL });
const { parseShadowingVideoId, parseShadowingTime, parseShadowingSubtitles, validateShadowingRange, karaokeProgress, activeShadowingCue } = exports;
test('server crashes and HTML fallback become readable messages rather than JSON syntax errors', async () => {
  await assert.rejects(exports.readShadowingResponse(new Response('A server error has occurred', { status: 500 })), /Máy chủ.*đang gặp lỗi/);
  await assert.rejects(exports.readShadowingResponse(new Response('<html>Not found</html>')), /dữ liệu hợp lệ/);
  await assert.rejects(exports.readShadowingResponse(Response.json({ error: 'Không có phụ đề Nhật' }, { status: 422 })), /Không có phụ đề Nhật/);
  assert.equal((await exports.readShadowingResponse(Response.json({ cues: [] }))).cues.length, 0);
});
test('dictation ignores spacing, punctuation and fullwidth forms but preserves spelling', () => {
  assert.equal(exports.normalizeDictation('日本語 を勉強します。'), exports.normalizeDictation('日本語を勉強します'));
  assert.equal(exports.normalizeDictation('ＡＢＣ１２３！'), 'abc123');
  assert.notEqual(exports.normalizeDictation('学校に行きます'), exports.normalizeDictation('学校を行きます'));
});
test('sentence puzzle preserves duplicate chunks and unique selectable IDs', () => {
  const chunks = exports.dictationChunks('はい、はい。');
  assert.equal(chunks.filter(word => word === 'はい').length, 2);
  const order = exports.shuffledChunkIds(chunks.length, () => .99);
  assert.equal(new Set(order).size, chunks.length);
  assert.equal(order.length, chunks.length);
  assert.notEqual(order.join(','), chunks.map((_, i) => i).join(','));
  assert.equal(order.slice().sort().join(','), chunks.map((_, i) => i).join(','));
});
test('YouTube IDs accept supported URLs and reject lookalike domains', () => {
  assert.equal(parseShadowingVideoId('https://youtu.be/I3kvL128MIQ?t=10'), 'I3kvL128MIQ');
  assert.equal(parseShadowingVideoId('https://www.youtube.com/shorts/I3kvL128MIQ'), 'I3kvL128MIQ');
  assert.equal(parseShadowingVideoId('https://youtube.com.evil.test/watch?v=I3kvL128MIQ'), null);
});
test('SRT and VTT retain subsecond timing and clean caption markup', () => {
  const cues = parseShadowingSubtitles('WEBVTT\n\n00:01.250 --> 00:03.500 align:start\n<b>日本語</b> &amp; 勉強\n\n00:03.500 --> 00:05.000\n話します。');
  assert.equal(cues.length, 2);
  assert.equal(cues[0].start, 1.25);
  assert.equal(cues[0].text, '日本語 & 勉強');
  assert.equal(parseShadowingSubtitles('1\n00:00:01,200 --> 00:00:02,500\nこんにちは')[0].end, 2.5);
  assert.throws(() => parseShadowingSubtitles('00:03 --> 00:01\n不正'));
});
test('plain transcript does not invent timestamps', () => {
  assert.equal(parseShadowingSubtitles('こんにちは\n日本語')[1].start, null);
});
test('timestamps and repeat ranges reject invalid or excessive segments', () => {
  assert.equal(parseShadowingTime('01:02.5'), 62.5);
  assert.equal(parseShadowingTime('01:60'), null);
  assert.equal(validateShadowingRange(1, 5, 10), null);
  assert.ok(validateShadowingRange(1, 200));
  assert.ok(validateShadowingRange(1, 12, 10));
});
test('karaoke advances, clamps and resets when seeking backwards', () => {
  assert.equal(karaokeProgress(5, 2, 8), .5);
  assert.equal(karaokeProgress(20, 2, 8), 1);
  assert.equal(karaokeProgress(0, 2, 8), 0);
  assert.equal(karaokeProgress(5, null, null), 0);
});
test('active cue follows overlaps, gaps and backwards seeks', () => {
  const cues = [{ start: 0, end: 5 }, { start: 4, end: 8 }, { start: 10, end: 12 }];
  assert.equal(activeShadowingCue(cues, 4.5), 1);
  assert.equal(activeShadowingCue(cues, 9), -1);
  assert.equal(activeShadowingCue(cues, 1), 0);
  assert.equal(activeShadowingCue(cues, 12), -1);
});

test('rolling caption timing ends at the next sentence and preserves genuine gaps', () => {
  const input = [{id:'a',text:'a',start:4.52,end:13.36},{id:'b',text:'b',start:7.72,end:18.68},{id:'c',text:'c',start:13.36,end:23.72},{id:'d',text:'d',start:27.519,end:38.16}];
  const cues = exports.normalizeShadowingTimeline(input);
  assert.equal(cues[0].end,7.72);
  assert.equal(karaokeProgress(7.72,cues[0].start,cues[0].end),1);
  assert.equal(activeShadowingCue(cues,7.72),1);
  assert.equal(activeShadowingCue(cues,25),-1);
  assert.equal(activeShadowingCue(cues,5),0);
  assert.equal(input[0].end,13.36);
});

test('visible captions persist through late gaps and reset on backwards seeks without extending speech', () => {
  const cues = [{ start: 5, end: 8 }, { start: 600, end: 603 }, { start: 900, end: 905 }];
  assert.equal(exports.visibleShadowingCue(cues, 604), 1);
  assert.equal(activeShadowingCue(cues, 604), -1);
  assert.equal(exports.visibleShadowingCue(cues, 902), 2);
  assert.equal(exports.visibleShadowingCue(cues, 6), 0);
  assert.equal(exports.visibleShadowingCue(cues, 0), 0);
  assert.equal(exports.visibleShadowingCue([], 100), -1);
});
test('a short overlapping cue cannot revive the previous sentence after it ends', () => {
  const cues=exports.normalizeShadowingTimeline([{id:'a',text:'a',start:0,end:10},{id:'b',text:'b',start:2,end:3}]);
  assert.equal(activeShadowingCue(cues,4),-1);
});
