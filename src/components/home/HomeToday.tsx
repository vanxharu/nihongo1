import React, { useEffect, useState } from 'react';
import { Check, Volume2 } from 'lucide-react';
import type { JLPTLevel, UserProfile, VocabularyItem } from '../../types';
import { localDateStr } from '../../utils/localDate';
import { speakJapanese } from '../../utils/audio';
import VocabularyIllustration, { getVocabularyIllustration } from '../VocabularyIllustration';

const card = 'rounded-2xl bg-[#121927] border border-[#1b253b] px-4 py-3';
const WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/** Days since epoch for a local YYYY-MM-DD, so rotations change exactly at local midnight. */
const dayNumber = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
};

/** T2–CN dots for the current week, filled on days found in studyDays. */
export function WeekStrip({ userProfile }: { userProfile: UserProfile }) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const studied = new Set(userProfile.studyDays || []);
  const todayStr = localDateStr(today);
  const days = WEEK.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const ymd = localDateStr(d);
    return { label, ymd, done: studied.has(ymd), isToday: ymd === todayStr, future: ymd > todayStr };
  });
  const count = days.filter(d => d.done).length;
  return (
    <div className={card} id="home-week-strip">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-white">Tuần này</h2>
        <span className="text-[11px] text-slate-400">{count}/7 ngày · chuỗi {userProfile.streak || 0} ngày 🔥</span>
      </div>
      <ol className="grid grid-cols-7 gap-1" aria-label={`Đã học ${count} trên 7 ngày tuần này`}>
        {days.map(d => (
          <li key={d.ymd} className="flex flex-col items-center gap-1">
            <span className={`text-[11px] ${d.isToday ? 'font-bold text-white' : 'text-slate-400'}`}>{d.label}</span>
            <span
              title={d.done ? 'Đã học' : d.future ? '' : 'Chưa học'}
              className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                d.done ? 'bg-[#2dd4bf] border-[#2dd4bf] text-slate-900'
                : d.isToday ? 'border-[#2dd4bf] border-dashed text-[#2dd4bf]'
                : 'border-[#1b253b] text-transparent'}`}
            >
              {d.done ? <Check className="w-4 h-4" strokeWidth={3} /> : '·'}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Vocabulary files are ~1 MB each, so the card loads only the deck it needs, after first paint.
const loadDeck = (level: JLPTLevel | 'BIZ'): Promise<VocabularyItem[]> =>
  level === 'BIZ' ? import('../../data/businessVocab').then(m => m.BUSINESS_VOCABULARY)
  : level === 'N5' ? import('../../data/tangoN5Vocab').then(m => m.TANGO_N5_VOCABULARY)
  : level === 'N4' ? import('../../data/tangoN4Vocab').then(m => m.TANGO_N4_VOCABULARY)
  : import('../../data/tangoN3Vocab').then(m => m.TANGO_N3_VOCABULARY); // shortcut: N2/N1 reuse N3 until those decks exist

/** Same word all day for a level; illustrated words are preferred when the deck has them. */
export function pickWordOfDay(deck: VocabularyItem[], ymd: string): VocabularyItem | undefined {
  const usable = deck.filter(w => w.kanji && w.meaning);
  const illustrated = usable.filter(w => getVocabularyIllustration(w));
  const pool = illustrated.length ? illustrated : usable;
  return pool.length ? pool[((dayNumber(ymd) % pool.length) + pool.length) % pool.length] : undefined;
}

export function WordOfDay({ level }: { level: JLPTLevel | 'BIZ' }) {
  const [word, setWord] = useState<VocabularyItem>();
  useEffect(() => {
    let live = true;
    loadDeck(level).then(deck => { if (live) setWord(pickWordOfDay(deck, localDateStr())); }).catch(() => {});
    return () => { live = false; };
  }, [level]);
  if (!word) return null;
  const showReading = word.hiragana && word.hiragana !== word.kanji;
  return (
    <div className={card} id="home-word-of-day">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-white">Từ vựng mỗi ngày</h2>
        <span className="text-[11px] text-slate-400">{level === 'BIZ' ? 'Công sở' : word.level}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="shrink-0 [&_.vocab-word-illustration]:m-0 [&_img]:w-20 [&_img]:h-20 [&_img]:rounded-xl [&_img]:bg-white">
          <VocabularyIllustration item={word} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span lang="ja" className="text-2xl font-bold text-white">{word.kanji}</span>
            <button
              type="button"
              aria-label={`Nghe phát âm ${word.kanji}`}
              onClick={() => speakJapanese(word.hiragana || word.kanji)}
              className="rounded-full p-1.5 text-[#38bdf8] hover:bg-[#14283d]"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          {showReading && <div lang="ja" className="text-xs text-slate-400">{word.hiragana}</div>}
          <div className="text-sm text-[#2dd4bf] font-bold">{word.meaning}</div>
        </div>
      </div>
      {word.exampleSentence && (
        <div className="mt-2 rounded-xl bg-[#131316] px-3 py-2">
          <p lang="ja" className="text-sm text-white">{word.exampleSentence}</p>
          {word.exampleTranslation && <p className="text-[11px] text-slate-400">{word.exampleTranslation}</p>}
        </div>
      )}
    </div>
  );
}
