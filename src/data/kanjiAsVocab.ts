import type { VocabularyItem, JLPTLevel } from '../types';

/** Dòng Kanji Master do admin nhập từ Excel (xem AdminKanjiImport). */
export interface KanjiRow {
  chapter: number; chapterTitle: string; lesson: number; lessonTitle: string;
  kanji: string; onyomi: string; kunyomi: string; hanViet: string; meaning: string; strokes: number;
  level: string; mnemonic: string;
  /** Mỗi dòng Excel là một từ vựng của chữ này, kèm đúng một câu ví dụ. */
  word: string; wordReading: string; wordMeaning: string;
  sentence: string; sentenceVi: string;
  /** Dữ liệu cũ (trước khi tách từng từ): nhiều từ trong một ô. */
  words?: string;
}

const splitList = (s: string) => s.split(/[,、;；・\/／]+/).map(x => x.trim()).filter(Boolean);
const toHira = (t: string) => t.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
/** Mọi cách đọc hợp lệ (hiragana) để bài gõ chấp nhận một trong số đó. Cách đọc đầu tiên còn dùng làm furigana
 * cho chữ này trong câu ví dụ: đứng trước hiragana (私の, 育てて) ưu tiên Kun (bỏ okurigana), còn lại ưu tiên On.
 * shortcut: đoán theo ký tự liền sau, không biết ngữ cảnh thật; sai thì chèn furigana tay dạng 私{わたし} trong câu. */
const readingsOf = (r: KanjiRow) => {
  const on = splitList(r.onyomi).map(x => toHira(x.replace(/[.\-]/g, '')));
  const kun = splitList(r.kunyomi);
  const kunStem = kun.map(x => x.split('.')[0].replace(/-/g, ''));
  const kunFull = kun.map(x => x.replace(/[.\-]/g, ''));
  const next = r.sentence?.[r.sentence.indexOf(r.kanji) + 1] ?? '';
  const preferKun = /[\u3041-\u3096]/.test(next);
  const order = preferKun ? [...kunStem, ...kunFull, ...on] : [...on, ...kunStem, ...kunFull];
  return [...new Set(order.filter(Boolean))];
};
const firstWord = (words: string) => {
  const m = words.split(/[;；]/)[0].trim().match(/^([^(（=]+)\s*(?:[(（]([^)）]*)[)）])?\s*=?\s*(.*)$/);
  return m ? { word: m[1].trim(), reading: m[2]?.trim() || '', meaning: m[3].trim() } : null;
};

/** Mỗi dòng (một từ vựng của một chữ Hán) thành một "từ" để dùng chung giao diện Từ vựng. */
export const kanjiRowsToVocab = (rows: KanjiRow[]): VocabularyItem[] =>
  [...rows].sort((a, b) => a.chapter - b.chapter || a.lesson - b.lesson).map((r): VocabularyItem => {
    const w = r.word ? { word: r.word, reading: r.wordReading, meaning: r.wordMeaning } : firstWord(r.words || '');
    return {
      id: `kj_${r.chapter}-${r.lesson}_${r.kanji}_${w?.word || ''}`,
      kanji: r.kanji,
      hiragana: readingsOf(r).join(' / '),
      meaning: r.meaning,
      vietnameseMeaning: r.meaning,
      hanViet: r.hanViet,
      onyomi: r.onyomi || undefined,
      kunyomi: r.kunyomi || undefined,
      exampleSentence: r.sentence || w?.word || r.kanji,
      exampleReading: w?.reading,
      exampleTranslation: r.sentence ? r.sentenceVi : w?.meaning || r.meaning,
      partOfSpeech: r.strokes ? `${r.strokes} nét` : 'Kanji',
      relatedWords: w?.word ? `${w.word}${w.reading ? `(${w.reading})` : ''}${w.meaning ? `=${w.meaning}` : ''}` : undefined,
      notes: r.mnemonic || undefined,
      curriculum: 'tango',
      level: (/^N[1-5]$/.test(r.level?.toUpperCase()) ? r.level.toUpperCase() : 'N4') as JLPTLevel,
      lessonId: `kj_c${r.chapter}_s${r.lesson}`,
      lessonName: `Bài ${r.chapter}-${r.lesson}${r.lessonTitle ? ' · ' + r.lessonTitle : ''}`,
      lessonTitleJp: r.chapterTitle,
      chapter: String(r.chapter),
      section: String(r.lesson),
    };
  });
