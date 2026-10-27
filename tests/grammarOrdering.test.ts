import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateOrderingExercises } from '../src/utils/grammarExerciseGenerator';
import { N4_GRAMMAR_ITEMS } from '../src/data/grammarN4Points';

test('mọi mẫu N4 (trừ んです) đều có câu sắp xếp đúng thứ tự', () => {
  for (const g of N4_GRAMMAR_ITEMS.filter(x => !x.structure.includes('んです'))) {
    const [q] = generateOrderingExercises(g as any);
    if (!q) continue;
    const byId = new Map(q.options.map(o => [o.id, o.text]));
    assert.equal(q.correctOrder.map(i => byId.get(i)).join(''), g.correctSentence, g.id);
  }
});
