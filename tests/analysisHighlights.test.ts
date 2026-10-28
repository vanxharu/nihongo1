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
