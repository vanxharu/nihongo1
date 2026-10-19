import type { VocabularyItem } from '../types';

/** Dòng Kanji Master do admin nhập từ Excel (xem AdminKanjiImport). */
export interface KanjiRow {
  chapter: number; chapterTitle: string; lesson: number; lessonTitle: string;
  kanji: string; onyomi: string; kunyomi: string; hanViet: string; meaning: string; strokes: number;
  word: string; wordReading: string; wordMeaning: string; sentence: string; sentenceVi: string;
}

/** Mỗi chữ Hán thành một "từ" để dùng chung giao diện Từ vựng. */
export const kanjiRowsToVocab = (rows: KanjiRow[]): VocabularyItem[] =>
  [...rows].sort((a, b) => a.chapter - b.chapter || a.lesson - b.lesson).map((r): VocabularyItem => ({
    id: `kj_${r.chapter}-${r.lesson}_${r.kanji}`,
    kanji: r.kanji,
    hiragana: [r.onyomi, r.kunyomi].filter(Boolean).join(' ・ '),
    meaning: r.meaning,
    vietnameseMeaning: r.meaning,
    hanViet: r.hanViet,
    exampleSentence: r.sentence || r.word || r.kanji,
    exampleReading: r.wordReading,
    exampleTranslation: r.sentence ? r.sentenceVi : r.wordMeaning || r.meaning,
    partOfSpeech: 'Kanji',
    curriculum: 'tango',
    level: 'N4',
    lessonId: `kj_c${r.chapter}_s${r.lesson}`,
    lessonName: `Bài ${r.chapter}-${r.lesson}${r.lessonTitle ? ' · ' + r.lessonTitle : ''}`,
    lessonTitleJp: r.chapterTitle,
    chapter: String(r.chapter),
    section: String(r.lesson),
    notes: r.word ? `${r.word}${r.wordReading ? `（${r.wordReading}）` : ''} ${r.wordMeaning}`.trim() : undefined,
  }));
