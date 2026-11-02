import test from 'node:test';
import assert from 'node:assert/strict';
import { fixCaption, keepCaptionPiece } from '../src/utils/shadowingCaptionFixes';

test('caption fixes: show name, video-specific words, no change elsewhere', () => {
  assert.equal(fixCaption('x', '日本語コン鉄の時間です。'), '日本語con Teppeiの時間です。');
  assert.equal(fixCaption('HgatfkTSbjc', '1人でタに飛行機で行って、タクシーに乗った'), '1人でタイに飛行機で行って、タクシーに乗った');
  assert.equal(fixCaption('HgatfkTSbjc', 'リクロで国境を超える'), '陸路で国境を超える');
  assert.equal(fixCaption('other', '目標を立てる'), '目標を立てる');
});

test('keeps numbers and short codes, drops English sentences', () => {
  assert.ok(keepCaptionPiece('2000') && keepCaptionPiece('N4') && keepCaptionPiece('ATM'));
  assert.ok(!keepCaptionPiece('theway,ifyoustudy') && !keepCaptionPiece('SpotifyApplePodcast'));
});
