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
