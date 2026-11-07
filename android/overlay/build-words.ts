// Regenerates overlay/app/src/main/assets/words.json from the web app's data.
// Usage (repo root): bun android/overlay/build-words.ts
// Row: [id, word, reading, meaning, level, example, exampleVi, wordRuby, exampleRuby, hasImage, imageSrc]
// imageSrc: the file the web app shows (src/data/vocabularyIllustrations.json), e.g. n4/tango_n4_300-v1.webp.
// *Ruby = parts array: plain text as a string, furigana as [base, reading]; made by the same functions the
// web app uses (alignWordFurigana / getSentenceFuriganaParts).
import fs from 'node:fs';
import { TANGO_N5_VOCABULARY } from '../../src/data/tangoN5Vocab';
import { TANGO_N4_VOCABULARY } from '../../src/data/tangoN4Vocab';
import { TANGO_N3_VOCABULARY } from '../../src/data/tangoN3Vocab';
import { getSentenceFuriganaParts, alignWordFurigana } from '../../src/utils/japaneseUtils';
import ILLUSTRATIONS from '../../src/data/vocabularyIllustrations.json';

const root = new URL('../../', import.meta.url).pathname;
const clean = (s: unknown) => (typeof s === 'string' ? s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '');
const seen = new Set<string>();
const rows: (string | number)[][] = [];
let images = 0, furigana = 0;
// Same mapping as the web app. For N4 229-894 the plain tango_n4_<n>.webp files are old icon placeholders;
// the real illustrations are the -v1 files listed here.
const imageById = new Map((ILLUSTRATIONS as { id: string; src: string }[]).map((x) => [x.id, x.src.replace(/^\/vocabulary-illustrations\//, '')]));
const all = [...TANGO_N5_VOCABULARY, ...TANGO_N4_VOCABULARY, ...TANGO_N3_VOCABULARY] as any[];
const ruby = (parts: { text: string; furigana?: string }[]) => {
  const out: (string | [string, string])[] = [];
  for (const p of parts) {
    if (!p.text) continue;
    if (p.furigana && p.furigana !== p.text) out.push([p.text, p.furigana]);
    else if (typeof out[out.length - 1] === 'string') out[out.length - 1] += p.text;
    else out.push(p.text);
  }
  return out;
};
const plain = (parts: (string | [string, string])[]) => parts.map((p) => (typeof p === 'string' ? p : p[0])).join('');
await new Promise((r) => setTimeout(r, 300)); // let japaneseUtils finish loading its Tango N4 keywords
for (const v of all) {
  const word = clean(v.kanji) || clean(v.hiragana);
  const reading = clean(v.hiragana);
  const meaning = clean(v.meaning);
  if (!v.id || !word || !meaning || seen.has(v.level + word)) continue;
  seen.add(v.level + word);
  let ex = clean(v.exampleSentence), exVi = clean(v.exampleTranslation);
  if (ex.length > 60) { ex = ''; exVi = ''; }
  const wordRuby = reading && reading !== word ? ruby(alignWordFurigana(word, reading)) : [word];
  let exFuri = ex ? ruby(getSentenceFuriganaParts(ex, { kanji: v.kanji, hiragana: v.hiragana }, all)) : [];
  if (plain(exFuri) !== ex) exFuri = ex ? [ex] : []; // never show furigana that does not match the sentence
  const src = imageById.get(v.id) ?? '';
  const img = src && fs.existsSync(`${root}public/vocabulary-illustrations/${src}`) ? 1 : 0;
  images += img; if (exFuri.some((p) => typeof p !== 'string')) furigana++;
  if (plain(wordRuby) !== word) throw new Error(`word ruby mismatch: ${word}`);
  rows.push([v.id, word, reading === word ? '' : reading, meaning, v.level, ex, exVi, wordRuby, exFuri, img, img ? src : '']);
}
fs.writeFileSync(new URL('./app/src/main/assets/words.json', import.meta.url), JSON.stringify(rows));
console.log(`${rows.length} words, ${images} with image, ${furigana} examples with furigana`);
