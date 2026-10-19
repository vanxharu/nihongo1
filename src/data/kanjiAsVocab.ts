import type { VocabularyItem, JLPTLevel } from '../types';

/** Dòng Kanji Master do admin nhập từ Excel (xem AdminKanjiImport). */
export interface KanjiRow {
  chapter: number; chapterTitle: string; lesson: number; lessonTitle: string;
  kanji: string; onyomi: string; kunyomi: string; hanViet: string; meaning: string; strokes: number;
  level: string; mnemonic: string;
  /** Nhiều từ ví dụ trong một ô, ngăn bằng ";" — dạng 家族(かぞく)=gia đình; 家(いえ)=nhà */
  words: string;
  sentence: string; sentenceVi: string;
}

const splitList = (s: string) => s.split(/[,、;；・\/／]+/).map(x => x.trim()).filter(Boolean);
/** Mọi cách đọc hợp lệ (On, Kun, phần Kun bỏ okurigana) để bài gõ chấp nhận một trong số đó. */
const readingsOf = (r: KanjiRow) => [...new Set(splitList(`${r.onyomi},${r.kunyomi}`).flatMap(x => [x.replace(/[.\-]/g, ''), x.split('.')[0].replace(/-/g, '')]).filter(Boolean))];
const firstWord = (words: string) => {
  const m = words.split(/[;；]/)[0].trim().match(/^([^(（=]+)\s*(?:[(（]([^)）]*)[)）])?\s*=?\s*(.*)$/);
  return m ? { word: m[1].trim(), reading: m[2]?.trim() || '', meaning: m[3].trim() } : null;
};

/** Mỗi chữ Hán thành một "từ" để dùng chung giao diện Từ vựng. */
export const kanjiRowsToVocab = (rows: KanjiRow[]): VocabularyItem[] =>
  [...rows].sort((a, b) => a.chapter - b.chapter || a.lesson - b.lesson).map((r): VocabularyItem => {
    const w = firstWord(r.words || '');
    return {
      id: `kj_${r.chapter}-${r.lesson}_${r.kanji}`,
      kanji: r.kanji,
      hiragana: readingsOf(r).join(' / '),
      meaning: r.meaning,
      vietnameseMeaning: r.meaning,
      hanViet: r.hanViet,
      exampleSentence: r.sentence || w?.word || r.kanji,
      exampleReading: w?.reading,
      exampleTranslation: r.sentence ? r.sentenceVi : w?.meaning || r.meaning,
      partOfSpeech: r.strokes ? `Kanji;${r.strokes} nét` : 'Kanji',
      relatedWords: r.words ? r.words.split(/[;；]/).map(x => x.trim()).filter(Boolean).join(' ・ ') : undefined,
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
