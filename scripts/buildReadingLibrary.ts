// Dựng thư viện bài đọc N4 (viết mới) từ scripts/reading-src/*.mjs → src/data/readingLibraryN4.json
// Chạy: npx tsx scripts/buildReadingLibrary.ts
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { getHanViet } from '../src/utils/japaneseUtils';

interface Src {
  id: string; topic: string; thumb: string; from: string; to: string;
  title: string; titleVi: string;
  sentences: [string, string][];
  vocab: [string, string, string, string][]; // kanji, hiragana, nghĩa, level
  grammar: [string, string, string][]; // cấu trúc, nghĩa, cách dùng trong bài
  quizzes: { q: string; type: string; typeVn: string; options: string[]; correct: number; exp: string; tips?: string }[];
}

// Các từ kuromoji hay đọc sai: ép cách đọc.
const OVERRIDE: Record<string, string> = {
  日本: 'にほん', 一月一日: 'いちがつついたち', 三日: 'みっか', 二日: 'ふつか', 二人: 'ふたり', 一人: 'ひとり', 今日: 'きょう', 昨日: 'きのう', 明日: 'あした', 大人: 'おとな', 今朝: 'けさ',
  上手: 'じょうず', 下手: 'へた', 果物: 'くだもの', 部屋: 'へや', 友達: 'ともだち', 時々: 'ときどき', 景色: 'けしき',
  今年: 'ことし', 去年: 'きょねん', 七夕: 'たなばた', 眼鏡: 'めがね', 毎日: 'まいにち', 今週: 'こんしゅう', 先週: 'せんしゅう',
  来週: 'らいしゅう', 今月: 'こんげつ', 来月: 'らいげつ', 先月: 'せんげつ', 週末: 'しゅうまつ', 午後: 'ごご', 午前: 'ごぜん',
  家賃: 'やちん', 大切: 'たいせつ', 大丈夫: 'だいじょうぶ', 一緒: 'いっしょ', 夕方: 'ゆうがた', 毎晩: 'まいばん', 毎週: 'まいしゅう',
  今夜: 'こんや', 今晩: 'こんばん', 八百屋: 'やおや', 三人: 'さんにん', 四人: 'よにん', 五人: 'ごにん', 一日中: 'いちにちじゅう',
};
const keys = Object.keys(OVERRIDE).sort((a, b) => b.length - a.length);
const pick = (m: any): any => { while (m && typeof m !== 'function' && m.default) m = m.default; return m; };
const kuro = new (pick(Kuroshiro))();

const toBrackets = (html: string) =>
  html.replace(/<ruby>([^<]*)<rp>\(<\/rp><rt>([^<]*)<\/rt><rp>\)<\/rp><\/ruby>/g, '[$1]($2)');
const merge = (s: string) => {
  let prev = '';
  while (prev !== s) { prev = s; s = s.replace(/\[([^\]]+)\]\(([^)]+)\)\[([^\]]+)\]\(([^)]+)\)/g, '[$1$3]($2$4)'); }
  return s;
};
async function furi(text: string): Promise<string> {
  // tách theo từ ép đọc rồi ghép lại
  const re = new RegExp(`(${keys.join('|')})`, 'g');
  const parts = text.split(re);
  let out = '';
  for (const p of parts) {
    if (!p) continue;
    if (OVERRIDE[p]) { out += `[${p}](${OVERRIDE[p]})`; continue; }
    out += toBrackets(await kuro.convert(p, { mode: 'furigana', to: 'hiragana' }));
  }
  return merge(out);
}
// Token cho popup tra từ: tách theo từ kuromoji, mỗi mảnh (chữ Hán / okurigana) đều mang dạng từ điển (伝えました → 伝える).
async function tokensOf(text: string) {
  const out: { text: string; furigana?: string; word: string }[] = [];
  const toks: any[] = await (kuro as any)._analyzer.parse(text);
  for (const t of toks) {
    const surface: string = t.surface_form;
    if (/^\s+$/.test(surface)) { out.push({ text: surface, word: '' }); continue; }
    const hasKanji = /[一-龯]/.test(surface);
    const word = hasKanji && t.basic_form && t.basic_form !== '*' ? t.basic_form : surface;
    if (!hasKanji) { out.push({ text: surface, word }); continue; }
    for (const m of (await furi(surface)).matchAll(/\[([^\]]+)\]\(([^)]+)\)|([^\[]+)/g)) {
      if (m[1]) out.push({ text: m[1], furigana: m[2], word }); else out.push({ text: m[3], word });
    }
  }
  return out;
}
const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

async function main() {
  await kuro.init(new (pick(KuromojiAnalyzer))({ dictPath: path.resolve('node_modules/kuromoji/dict') }));
  const dir = path.resolve('scripts/reading-src');
  const all: Src[] = [];
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.mjs')).sort()) all.push(...(await import(pathToFileURL(path.join(dir, f)).href)).default);
  const ids = new Set<string>(); const out: any[] = []; let problems = 0;
  for (const a of all) {
    if (ids.has(a.id)) throw new Error('trùng id ' + a.id); ids.add(a.id);
    // đoạn văn: xuống dòng sau mỗi 3 câu
    const paras: string[] = []; for (let i = 0; i < a.sentences.length; i += 3) paras.push(a.sentences.slice(i, i + 3).map(s => s[0]).join(''));
    const jp = paras.join('\n\n');
    const furiPassage = (await Promise.all(paras.map(furi))).join('\n\n');
    const rawTokens: any[] = [];
    for (let i = 0; i < paras.length; i++) { if (i) rawTokens.push({ text: '\n\n', word: '' }); rawTokens.push(...(await tokensOf(paras[i]))); }
    const breakdown = await Promise.all(a.sentences.map(async ([j, v]) => ({ japanese: j, furigana: await furi(j), vietnamese: v })));
    const quizzes = a.quizzes.map(q => {
      const quotes = [...q.exp.matchAll(/「([^」]+)」/g)].map(m => m[1]);
      for (const qt of quotes) if (!jp.replace(/\s/g, '').includes(qt.replace(/\s/g, ''))) { problems++; console.warn(`[${a.id}] trích dẫn không có trong bài: 「${qt}」`); }
      if (q.options.length !== 4 || q.correct < 0 || q.correct > 3) { problems++; console.warn(`[${a.id}] câu hỏi sai dạng: ${q.q}`); }
      return { question: q.q, questionType: q.type, questionTypeVn: q.typeVn, tips: q.tips, options: q.options, correctIndex: q.correct, explanation: q.exp, questionOrigin: 'ai', answerOrigin: 'ai-inferred' };
    });
    for (const [k] of a.vocab) if (!jp.includes(k.replace(/する$|[くぐすつぬぶむるう]$/, '').slice(0, 1))) console.warn(`[${a.id}] từ vựng có thể không nằm trong bài: ${k}`);
    out.push({
      id: a.id, topic: a.topic, title: a.title, titleVi: a.titleVi, level: 'N4', japanesePassage: jp, furiganaPassage: furiPassage,
      vietnamesePassage: paras.map((_, i) => a.sentences.slice(i * 3, i * 3 + 3).map(s => s[1]).join(' ')).join('\n\n'),
      sentenceBreakdown: breakdown, rawTokens,
      vocabularyList: a.vocab.map(([k, h, m, lv]) => ({ kanji: k, word: k, hiragana: h, reading: h, hanViet: /[一-龯]/.test(k) ? getHanViet(k.replace(/する$/, '')) : '', meaning: m, level: lv })),
      usedGrammar: a.grammar.map(([s, m, u]) => ({ structure: s, meaning: m, usageInPassage: u })),
      quizzes, imageUrl: `/reading-thumbs/${a.id}.png`, thumb: { kanji: a.thumb, from: a.from, to: a.to },
      sourceName: 'Bài đọc Nihongo (viết mới)', questionOrigin: 'ai',
    });
    if (plain(furiPassage).replace(/\s/g, '') !== jp.replace(/\s/g, '')) { problems++; console.warn(`[${a.id}] furigana làm đổi chữ`); }
  }
  fs.writeFileSync('src/data/readingLibraryN4.json', JSON.stringify(out));
  console.log(`Đã dựng ${out.length} bài, ${problems} cảnh báo.`);
}
main().catch(e => { console.error(e); process.exit(1); });
