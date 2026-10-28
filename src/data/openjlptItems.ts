import type { VocabularyItem, JLPTLevel } from '../types';
import type { KanjiRow } from './kanjiAsVocab';
import data from './openjlptData.json';

// Nguồn: OpenJLPT (github.com/evanclan/OpenJLPT), CC BY-SA 4.0 — JMdict/KANJIDIC2 (EDRDG), danh sách JLPT của Waller, Tatoeba. Nghĩa tiếng Anh.
type V = [string, string, string, string, string, string];
const vocab = data.v as unknown as Record<string, V[]>;
const PER_LESSON = 25;
const hasKanji = (s: string) => /[一-龯]/.test(s);

/** Từ vựng N5–N1 của OpenJLPT, bỏ từ kho hiện có đã có (khớp theo chữ Hán hoặc cách đọc). */
export function openjlptVocab(existing: VocabularyItem[]): VocabularyItem[] {
  const have = new Set(existing.flatMap(v => [v.kanji, v.hiragana].filter(Boolean)));
  const out: VocabularyItem[] = [];
  for (const lv of ['N5', 'N4', 'N3', 'N2', 'N1']) {
    let n = 0;
    for (const [w, r, m, pos, ja, en] of vocab[lv]) {
      if (have.has(w) || have.has(r) && !hasKanji(w)) continue;
      const lesson = Math.floor(n++ / PER_LESSON) + 1;
      out.push({
        id: `oj_${lv}_${out.length}`, kanji: hasKanji(w) ? w : '', hiragana: r, meaning: m, englishMeaning: m,
        exampleSentence: ja || w, exampleTranslation: en || m, partOfSpeech: pos,
        level: lv as JLPTLevel, curriculum: 'tango', lessonId: `oj_${lv.toLowerCase()}_c99_s${lesson}`,
        lessonName: `OpenJLPT ${lv} · Bài ${lesson}`, lessonTitleJp: 'OpenJLPT (CC BY-SA 4.0)', chapter: '99', section: String(lesson),
      });
    }
  }
  return out;
}

/** Hàng kanji (mỗi từ ví dụ một hàng) cho kanjiRowsToVocab; bỏ chữ đã có trong Kanji Master. */
export function openjlptKanjiRows(have: Set<string>): KanjiRow[] {
  const ex = new Map<string, V>();
  for (const lv of Object.keys(vocab)) for (const v of vocab[lv]) if (!ex.has(v[0])) ex.set(v[0], v);
  const rows: KanjiRow[] = []; const count: Record<string, number> = {};
  for (const [ch, lv, strokes, on, kun, meaning, words] of data.k as unknown as [string, string, number, string, string, string, string[]][]) {
    if (have.has(ch)) continue;
    const lesson = Math.floor((count[lv] = (count[lv] ?? -1) + 1) / 10) + 1;
    const base = { chapter: 91 + ['N5', 'N4', 'N3', 'N2', 'N1'].indexOf(lv), chapterTitle: 'OpenJLPT (CC BY-SA 4.0)', lesson, lessonTitle: lv, kanji: ch, onyomi: on, kunyomi: kun, hanViet: '', meaning, strokes, level: lv, mnemonic: '' };
    for (const w of words.length ? words : ['']) {
      const e = ex.get(w);
      rows.push({ ...base, word: w, wordReading: e?.[1] ?? '', wordMeaning: e?.[2] ?? '', sentence: e?.[4] ?? '', sentenceVi: e?.[5] ?? '' });
    }
  }
  return rows;
}
