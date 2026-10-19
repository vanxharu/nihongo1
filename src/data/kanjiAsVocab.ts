import type { VocabularyItem } from '../types';
import { KANJI_MASTER_N4, masterKanjiInfo } from './kanjiMasterN4';

/** Mỗi chữ Hán của Kanji Master N4 thành một "từ" để dùng chung giao diện Từ vựng. */
export const KANJI_VOCAB: VocabularyItem[] = KANJI_MASTER_N4.flatMap((l, li) => {
  const sec = KANJI_MASTER_N4.slice(0, li).filter(x => x.chapter === l.chapter).length + 1;
  return l.kanji.map((k, n): VocabularyItem => {
    const i = masterKanjiInfo(k);
    const ex = l.words.find(w => w.word.includes(k) && w.word !== k);
    return {
      id: `kj_${l.id}_${n + 1}`,
      kanji: k,
      hiragana: [i?.onyomi, i?.kunyomi].filter(Boolean).join(' ・ ').replace(/\./g, ''),
      meaning: i?.meaning || '',
      vietnameseMeaning: i?.meaning || '',
      hanViet: i?.han_viet,
      exampleSentence: ex ? ex.word : k,
      exampleReading: ex?.reading,
      exampleTranslation: ex?.meaning || i?.meaning || '',
      partOfSpeech: 'Kanji',
      curriculum: 'tango',
      level: 'N4',
      lessonId: `kj_c${l.chapter}_s${sec}`,
      lessonName: `Bài ${l.id} · ${l.title}`,
      lessonTitleJp: l.chapterTitle,
      chapter: String(l.chapter),
      section: String(sec),
    };
  });
});
