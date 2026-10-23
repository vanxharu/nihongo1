// Dựng src/data/readingExams.json từ scripts/exams/*.json (thêm furigana). Chạy: npx tsx scripts/buildReadingExams.mts
import fs from 'node:fs';
import path from 'node:path';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { furi } from '../src/server/furigana';
const pick = (m: any): any => { while (m && typeof m !== 'function' && m.default) m = m.default; return m; };
const kuro = new (pick(Kuroshiro))(); await kuro.init(new (pick(KuromojiAnalyzer))({ dictPath: path.resolve('node_modules/kuromoji/dict') }));
const f = (t: string) => furi(kuro, t);
const exams = [];
for (const file of fs.readdirSync('scripts/exams').filter(x => x.endsWith('.json')).sort()) {
  const e = JSON.parse(fs.readFileSync(path.join('scripts/exams', file), 'utf8'));
  for (const p of e.parts) for (const it of p.items) {
    if (it.intro) it.introF = await f(it.intro);
    it.lines = await Promise.all(it.lines.map(async ([jp, vi]: [string, string]) => ({ jp, f: await f(jp), vi })));
    for (const q of it.questions) {
      if (q.options.length !== 4 || !(q.answer >= 0 && q.answer < 4)) throw new Error(`${e.id} câu ${q.n}: sai dạng`);
      q.qF = await f(q.q); q.optionsF = await Promise.all(q.options.map(f));
    }
  }
  exams.push(e);
}
fs.writeFileSync('src/data/readingExams.json', JSON.stringify(exams));
console.log('exams', exams.length, 'câu', exams.reduce((n, e) => n + e.parts.reduce((m: number, p: any) => m + p.items.reduce((k: number, i: any) => k + i.questions.length, 0), 0), 0));
