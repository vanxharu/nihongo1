import test from 'node:test';
import assert from 'node:assert/strict';
import { analysisHighlights } from '../src/utils/analysisHighlights';

test('vocab and grammar points become highlights on the sentence', () => {
  const text = '今 11時半。もうすぐ ランチの 時間です。';
  const { highlights, usedPoints } = analysisHighlights(text, [
    { title: 'Từ vựng', body: '今（いま）: bây giờ · 11時半（じゅういちじはん）: 11 giờ rưỡi · ランチ: bữa trưa · 時間（じかん）: thời gian, giờ.' },
    { title: 'Ngữ pháp', body: 'N の 時間: giờ dành cho N (ランチの時間 = giờ ăn trưa). もうすぐ + N です: sắp đến N.' },
    { title: 'Lưu ý', body: 'x' },
  ]);
  assert.deepEqual(highlights.map(h => [text.slice(h.start, h.end), h.type]), [['今', 'vocab'], ['11時半', 'vocab'], ['もうすぐ', 'grammar'], ['ランチ', 'vocab'], ['の 時間', 'grammar']]);
  assert.equal(highlights[4].inner?.[0].label, '時間');
  assert.equal(highlights[1].reading, 'じゅういちじはん');
  assert.deepEqual([...usedPoints].sort(), [0, 1]);
});

test('chunk points (title quoted from the sentence) highlight that chunk', () => {
  const text = '電車は たった今 出た ところです。';
  const { highlights, usedPoints } = analysisHighlights(text, [
    { title: 'たった今', body: 'vừa mới' }, { title: '出たところです', body: 'vừa rời đi' }, { title: 'Lưu ý', body: 'x' },
  ]);
  assert.deepEqual(highlights.map(h => [text.slice(h.start, h.end), h.type]), [['たった今', 'chunk'], ['出た ところです', 'chunk']]);
  assert.deepEqual([...usedPoints], [0, 1]);
});
