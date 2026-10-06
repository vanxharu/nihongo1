/**
 * Tạo sẵn mp3 giọng Nanami (nữ) + Keita (nam) cho từ vựng, câu ví dụ và ngữ pháp.
 * Chạy: npm run generate:tts   (cần internet; dùng Edge TTS miễn phí, không cần key)
 * Chạy lại được: file đã có sẽ bị bỏ qua. Thêm "--limit 50" để thử nhanh.
 * Kết quả ở public/audio/tts/... ; commit thư mục này để Vercel phục vụ.
 */
import fs from 'node:fs';
import path from 'node:path';
import { VOCABULARY_DATA, GRAMMAR_DATA } from '../src/data';
import { ensureVocabExample } from '../src/utils/japaneseUtils';
import { synthesizeAzureSpeech } from '../src/server/azureTts';
import { cleanJapaneseTextForSpeech, staticTtsPath, STATIC_TTS_VOICES } from '../src/utils/ttsStatic';

const OUT = path.resolve('public');
const limitArg = process.argv.indexOf('--limit');
const limit = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;

const raw = new Set<string>();
for (const v of VOCABULARY_DATA as any[]) {
  if (v.kanji || v.hiragana) raw.add(v.kanji || v.hiragana);
  if (v.hiragana) raw.add(v.hiragana);
  try { const ex = ensureVocabExample(v); if (ex?.exampleSentence) raw.add(ex.exampleSentence); } catch {}
}
for (const g of GRAMMAR_DATA as any[]) if (g.exampleSentence) raw.add(g.exampleSentence);

// Cùng quy tắc với speakJapanese: câu dài/có dấu câu đọc +0%, từ đơn đọc -4%.
const jobs: { text: string; voice: string; rate: string; file: string }[] = [];
for (const t of raw) {
  const clean = cleanJapaneseTextForSpeech(t);
  if (!clean || clean.length > 600) continue;
  const isSentence = clean.length > 8 || /[。！？、]/.test(clean);
  const rate = isSentence ? '+0%' : '-4%';
  for (const voice of STATIC_TTS_VOICES) {
    const rel = staticTtsPath(clean, voice, rate)!;
    const file = path.join(OUT, rel);
    if (!fs.existsSync(file)) jobs.push({ text: clean, voice, rate, file });
  }
}
const todo = jobs.slice(0, limit);
console.log(`Cần tạo ${todo.length} file (còn thiếu ${jobs.length}).`);

let done = 0, failed = 0;
async function worker() {
  while (todo.length) {
    const j = todo.shift()!;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const buf = await synthesizeAzureSpeech(j.text, j.voice, j.rate, '+0Hz');
        fs.mkdirSync(path.dirname(j.file), { recursive: true });
        fs.writeFileSync(j.file, buf);
        done++;
        break;
      } catch {
        if (attempt === 3) { failed++; console.warn('Lỗi:', j.text.slice(0, 30)); }
        else await new Promise(r => setTimeout(r, 800 * attempt));
      }
    }
    if ((done + failed) % 100 === 0) console.log(`${done} xong, ${failed} lỗi`);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`Xong: ${done} file, lỗi: ${failed}. Chạy lại lệnh để thử lại các file lỗi.`);
