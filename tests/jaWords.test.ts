import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLookup, wordSpans, type JaToken } from '../src/utils/jaWords';

const L = buildLookup([
  { kanji: 'はし', hiragana: 'はし', meaning: 'đũa', core: true }, { kanji: 'はし', hiragana: 'はし', meaning: 'cầu', core: true },
  { kanji: '下', hiragana: 'した', meaning: 'dưới' }, { kanji: 'まいにち', hiragana: 'まいにち', meaning: 'mỗi ngày', core: true },
  { kanji: 'べんきょう(する)', hiragana: 'べんきょう', meaning: 'học', core: true }, { kanji: '休む', hiragana: 'やすむ', meaning: 'nghỉ' },
  { kanji: '休み', hiragana: 'やすみ', meaning: 'ngày nghỉ' }, { kanji: 'ある', hiragana: 'ある', meaning: 'có, ở', core: true }, { kanji: '或', hiragana: 'ある', meaning: 'nào đó' },
]);
const tk = (s: string, p: string, b = s, r?: string): JaToken => ({ s, b, p, r });
const show = (t: JaToken[]) => wordSpans(t, L).map(x => x.hit ? `[${x.t}=${x.hit.word}:${x.hit.meaning}]` : x.t).join('');

test('kana homographs are not guessed, kana is not shown as kanji', () => {
  assert.equal(show([tk('はし', '名詞'), tk('で', '助詞')]), '[はし=はし:Nhiều nghĩa: đũa / cầu]で');
  assert.equal(show([tk('ある', '動詞')]), '[ある=ある:có, ở]');
});

test('whole words only: した in ました is not 下; split kana words are joined; verbs use dictionary form', () => {
  assert.equal(show([tk('休み', '動詞', '休む'), tk('まし', '助動詞', 'ます'), tk('た', '助動詞')]), '[休み=休む:nghỉ]ました');
  assert.equal(show([tk(' ', '記号'), tk('べ', '助詞'), tk('ん', '助詞'), tk('きょう', '名詞')]), ' [べんきょう=べんきょう:học]');
  assert.equal(show([tk('毎日', '名詞', '毎日', 'マイニチ')]), '[毎日=毎日:mỗi ngày]');
});

test('homographs take the meaning used in the sentence translation', () => {
  const t = [tk('はし', '名詞'), tk('で', '助詞')];
  assert.equal(wordSpans(t, L, 'Ăn cơm bằng đũa.')[0].hit?.meaning, 'đũa');
  assert.equal(wordSpans(t, L)[0].hit?.meaning, 'Nhiều nghĩa: đũa / cầu');
});

test('hits carry the written form and offset (sense lookup sends the exact sentence)', () => {
  const sp = wordSpans([tk('雨', '名詞'), tk('が', '助詞'), tk('休み', '動詞', '休む')], L);
  const h = sp.find(x => x.hit)!.hit!;
  assert.equal(h.surface, '休み'); assert.equal(h.at, 2); assert.equal(h.word, '休む');
});
