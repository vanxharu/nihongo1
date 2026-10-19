// Dựng src/data/readingSeedN4.json từ file Excel 10 đề. Chạy: node scripts/makeN4Exams.mjs /tmp/de.xlsx && npx tsx scripts/buildReadingSeed.mts /tmp/de.xlsx
import * as XLSX from 'xlsx';
import fs from 'node:fs';
import path from 'node:path';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { parseReadingWorkbook } from '../src/utils/readingExcel';
import { buildReadingLesson } from '../src/server/readingImport';
import { getHanViet } from '../src/utils/japaneseUtils';
const pick = (m: any): any => { while (m && typeof m !== 'function' && m.default) m = m.default; return m; };
const r = parseReadingWorkbook(XLSX.read(fs.readFileSync(process.argv[2]), { type: 'buffer' }));
if (r.errors.length) throw new Error(r.errors.join('\n'));
const kuro = new (pick(Kuroshiro))(); await kuro.init(new (pick(KuromojiAnalyzer))({ dictPath: path.resolve('node_modules/kuromoji/dict') }));
const out = []; for (const l of r.lessons) out.push(await buildReadingLesson(kuro, l as any, getHanViet));
fs.writeFileSync('src/data/readingSeedN4.json', JSON.stringify(out));
console.log('seed', out.length);
