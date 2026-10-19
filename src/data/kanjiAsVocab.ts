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

export interface KanjiWord { word: string; reading: string; meaning: string; sentence: string; sentenceVi: string }

/** Mỗi chữ Hán là MỘT thẻ; các dòng cùng chương-bài-chữ gộp lại thành danh sách từ, mỗi từ một câu ví dụ riêng. */
export const kanjiRowsToVocab = (rows: KanjiRow[]): VocabularyItem[] => {
  const groups = new Map<string, KanjiRow[]>();
  for (const r of [...rows].sort((a, b) => a.chapter - b.chapter || a.lesson - b.lesson)) {
    const k = `${r.chapter}-${r.lesson}_${r.kanji}`;
    groups.set(k, [...(groups.get(k) || []), r]);
  }
  return [...groups.entries()].map(([key, g]): VocabularyItem => {
    const r = g.find(x => x.onyomi || x.kunyomi || x.meaning) || g[0];
    const words: KanjiWord[] = g.map(x => {
      const w = x.word ? { word: x.word, reading: x.wordReading, meaning: x.wordMeaning } : firstWord(x.words || '');
      return { word: w?.word || '', reading: w?.reading || '', meaning: w?.meaning || '', sentence: x.sentence || '', sentenceVi: x.sentenceVi || '' };
    }).filter(w => w.word || w.sentence);
    const w0 = words[0];
    const first = g.find(x => x.sentence) || r;
    return {
      id: `kj_${key}`,
      kanji: r.kanji,
      hiragana: readingsOf({ ...r, sentence: first.sentence }).join(' / '),
      meaning: r.meaning,
      vietnameseMeaning: r.meaning,
      hanViet: r.hanViet,
      onyomi: r.onyomi || undefined,
      kunyomi: r.kunyomi || undefined,
      exampleSentence: w0?.sentence || w0?.word || r.kanji,
      exampleReading: w0?.reading,
      exampleTranslation: w0?.sentence ? w0.sentenceVi : w0?.meaning || r.meaning,
      partOfSpeech: r.strokes ? `${r.strokes} nét` : 'Kanji',
      relatedWords: words.filter(w => w.word).map(w => `${w.word}${w.reading ? `(${w.reading})` : ''}${w.meaning ? `=${w.meaning}` : ''}`).join(' ・ ') || undefined,
      kanjiWords: words,
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
};

/** Cho các chế độ luyện (trắc nghiệm, gõ, đặt câu...): mỗi từ của chữ là một câu hỏi, đúng câu ví dụ của từ đó. */
export const expandKanjiWords = (items: VocabularyItem[]): VocabularyItem[] =>
  items.flatMap(it => {
    const ws: KanjiWord[] = it.kanjiWords;
    if (!ws || ws.length < 2) return [it];
    return ws.map((w, i): VocabularyItem => ({
      ...it,
      id: `${it.id}_w${i}`,
      hiragana: readingsOf({ onyomi: it.onyomi || '', kunyomi: it.kunyomi || '', kanji: it.kanji, sentence: w.sentence } as KanjiRow).join(' / ') || it.hiragana,
      exampleSentence: w.sentence || w.word || it.kanji,
      exampleReading: w.reading,
      exampleTranslation: w.sentence ? w.sentenceVi : w.meaning || it.meaning,
      relatedWords: `${w.word}${w.reading ? `(${w.reading})` : ''}${w.meaning ? `=${w.meaning}` : ''}`,
      kanjiWords: [w],
    }));
  });
