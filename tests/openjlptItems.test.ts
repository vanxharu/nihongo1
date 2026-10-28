import test from 'node:test';
import assert from 'node:assert/strict';
import { openjlptVocab, openjlptKanjiRows } from '../src/data/openjlptItems';
import { kanjiRowsToVocab } from '../src/data/kanjiAsVocab';

test('từ vựng OpenJLPT: id duy nhất, bỏ từ đã có, đủ cấp', () => {
  const all = openjlptVocab([]);
  assert.equal(new Set(all.map(v => v.id)).size, all.length);
  assert.ok(['N5', 'N4', 'N3', 'N2', 'N1'].every(l => all.some(v => v.level === l)));
  const rest = openjlptVocab([{ kanji: all[0].kanji, hiragana: all[0].hiragana } as any]);
  assert.ok(rest.length < all.length);
});

test('kanji OpenJLPT: mỗi chữ một thẻ, bỏ chữ đã có', () => {
  const rows = openjlptKanjiRows(new Set());
  const items = kanjiRowsToVocab(rows);
  assert.equal(items.length, 2383);
  assert.equal(new Set(items.map(i => i.id)).size, items.length);
  assert.equal(kanjiRowsToVocab(openjlptKanjiRows(new Set(['政']))).length, 2382);
});
