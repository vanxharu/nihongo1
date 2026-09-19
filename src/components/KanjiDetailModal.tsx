/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, BookOpen, Award, Briefcase, ChevronRight, Volume2 } from 'lucide-react';
import { getKanjiCategory, getLocalKanjiDetails, DEFAULT_CATEGORY } from '../utils/kanjiHelper';
import { speakJapanese } from '../utils/audio';
import { KANJI_DICTIONARY } from '../data/kanjiDictionary';
import { safeFetchJson } from '../utils/safeApi';
import { KanjiAiMnemonicCard } from './KanjiAiMnemonicCard';

interface RelatedWord {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  hanViet?: string;
  level?: string;
}

interface KanjiDetailModalProps {
  kanjiChar: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectWord?: (wordId: string) => void;
  allVocabData?: any[]; // To scan for family grouping
}

export default function KanjiDetailModal({ kanjiChar, isOpen, onClose, onSelectWord, allVocabData = [] }: KanjiDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [wordData, setWordData] = useState<any>(null);
  const [familyGroups, setFamilyGroups] = useState<{
    common: RelatedWord[];
    jlpt: RelatedWord[];
    business: RelatedWord[];
    advanced: RelatedWord[];
  }>({ common: [], jlpt: [], business: [], advanced: [] });

  useEffect(() => {
    if (!kanjiChar || !isOpen) return;

    setLoading(true);
    // Get local fallbacks first
    const local = getLocalKanjiDetails(kanjiChar);
    setDetails(local);

    const matchedWord = allVocabData.find(v => v.kanji === kanjiChar || v.hiragana === kanjiChar || v.word === kanjiChar);
    const fallbackMeaning = matchedWord ? matchedWord.meaning : '';
    const fallbackReading = matchedWord ? (matchedWord.reading || matchedWord.hiragana) : '';

    setWordData({
      reading: fallbackReading,
      meaning: fallbackMeaning,
      combined_hanviet: '',
      etymology: '',
      kanji_breakdown: []
    });

    let queryParams = `word=${encodeURIComponent(kanjiChar)}`;
    if (fallbackReading) queryParams += `&reading=${encodeURIComponent(fallbackReading)}`;
    if (fallbackMeaning) queryParams += `&meaning=${encodeURIComponent(fallbackMeaning)}`;

    // Fetch details from backend safely
    safeFetchJson(`/api/vocab/kanji-breakdown?${queryParams}`)
      .then(result => {
        if (result.ok && result.data && result.data.success && result.data.isKanji) {
          const resData = result.data;
          setWordData(resData.data);
          if (resData.data?.kanji_breakdown?.[0]) {
            const apiDetails = resData.data.kanji_breakdown[0];
            setDetails({
              kanji: kanjiChar,
              han_viet: apiDetails.han_viet,
              meaning: apiDetails.meaning || local.meaning,
              onyomi: apiDetails.onyomi || local.onyomi,
              kunyomi: apiDetails.kunyomi || local.kunyomi,
              radical: local.radical,
              strokes: local.strokes
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Compile dynamic Kanji Family list from allVocabData
    if (allVocabData.length > 0) {
      const related = allVocabData.filter(v => (v.kanji || '').includes(kanjiChar));
      
      const commonList: RelatedWord[] = [];
      const jlptList: RelatedWord[] = [];
      const businessList: RelatedWord[] = [];
      const advancedList: RelatedWord[] = [];

      related.forEach(v => {
        const item: RelatedWord = {
          id: v.id,
          kanji: v.kanji || v.word,
          reading: v.reading || v.hiragana,
          meaning: v.meaning,
          hanViet: v.hanViet,
          level: v.level
        };

        // Classify into groups
        if (v.level === 'N5' || v.level === 'N4') {
          jlptList.push(item);
        } else if (v.level === 'N3') {
          commonList.push(item);
        } else if ((v.kanji || '').match(/(会|社|業|職|働|経|済|費|営|企)/)) {
          businessList.push(item);
        } else {
          advancedList.push(item);
        }
      });

      setFamilyGroups({
        common: commonList.slice(0, 4),
        jlpt: jlptList.slice(0, 4),
        business: businessList.slice(0, 4),
        advanced: advancedList.slice(0, 4)
      });
    }

  }, [kanjiChar, isOpen, allVocabData]);

  if (!isOpen || !kanjiChar) return null;

  const category = getKanjiCategory(kanjiChar);
  const isWordMode = kanjiChar.length > 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 overflow-hidden z-10 flex flex-col min-h-0 max-h-[85vh]"
        >
          {/* Header Accent Bar */}
          <div className={`h-1.5 w-full ${category.bg}`} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer active:scale-95 z-50"
            id="close-kanji-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Body */}
          <div className="p-6 min-h-0 overflow-y-auto space-y-5 custom-scrollbar">
            {isWordMode ? (
              // MULTI-KANJI WORD MODE
              <div className="space-y-6">
                {/* Word Header */}
                <div className="flex flex-col items-center justify-center text-center space-y-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl sm:text-5xl font-black font-display text-slate-800 tracking-wider">
                      {kanjiChar}
                    </span>
                    <button 
                      onClick={() => speakJapanese(kanjiChar)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-amber-600 transition-all cursor-pointer active:scale-95"
                      title="Phát âm từ vựng"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  {wordData?.reading && (
                    <span className="text-lg font-bold text-amber-500 dark:text-amber-400 tracking-wide">{wordData.reading}</span>
                  )}
                  {wordData?.combined_hanviet && (
                    <span className="text-sm font-bold text-sky-600 dark:text-sky-400 tracking-widest uppercase">[{wordData.combined_hanviet}]</span>
                  )}
                  <span className="text-base font-bold text-sky-600 dark:text-sky-400 mt-1">{wordData?.meaning || 'Đang phân tích...'}</span>
                </div>

                {/* Etymology / Mnemonic */}
                {wordData?.etymology && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-800 tracking-wider uppercase block flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Nguồn gốc ghép từ
                    </span>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {wordData.etymology}
                    </p>
                  </div>
                )}
                
                {/* Mnemonic / Mẹo nhớ AI */}
                {kanjiChar && kanjiChar.trim().length === 1 ? (
                  <KanjiAiMnemonicCard
                    kanji={kanjiChar}
                    meaning={wordData?.meaning || KANJI_DICTIONARY[kanjiChar]?.meaning}
                    onyomi={wordData?.onyomi || KANJI_DICTIONARY[kanjiChar]?.onyomi}
                    kunyomi={wordData?.kunyomi || KANJI_DICTIONARY[kanjiChar]?.kunyomi}
                    strokes={wordData?.strokes || KANJI_DICTIONARY[kanjiChar]?.strokes}
                    radical={wordData?.radical || KANJI_DICTIONARY[kanjiChar]?.radical}
                    components={wordData?.components || KANJI_DICTIONARY[kanjiChar]?.components}
                    level={wordData?.level || KANJI_DICTIONARY[kanjiChar]?.level}
                    onSpeak={speakJapanese}
                  />
                ) : wordData?.mnemonic ? (
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 space-y-2 shadow-xs">
                    <span className="text-[11px] font-bold text-amber-800 tracking-wider uppercase block flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Mẹo ghi nhớ
                    </span>
                    <p className="text-sm text-amber-950/80 font-medium leading-relaxed">
                      {wordData.mnemonic}
                    </p>
                  </div>
                ) : null}

                {/* Individual Kanji Breakdown */}
                {wordData?.kanji_breakdown && wordData.kanji_breakdown.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Chiết tự Hán Việt & Âm On / Kun
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {wordData.kanji_breakdown.map((kb: any, idx: number) => {
                        const cat = getKanjiCategory(kb.kanji);
                        const localKb = getLocalKanjiDetails(kb.kanji);
                        const onVal = (kb.onyomi && kb.onyomi !== '—' && kb.onyomi !== 'Chưa rõ') ? kb.onyomi : localKb.onyomi;
                        const kunVal = (kb.kunyomi && kb.kunyomi !== '—' && kb.kunyomi !== 'Chưa rõ') ? kb.kunyomi : localKb.kunyomi;
                        const meaningVal = (kb.meaning && kb.meaning !== '—' && kb.meaning !== 'Chưa rõ') ? kb.meaning : localKb.meaning;
                        
                        return (
                          <div key={idx} className="flex flex-col p-3 bg-slate-50/90 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-all">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-2xl shadow-xs border ${cat.lightBg} ${cat.lightText} ${cat.lightBorder} shrink-0`}>
                                {kb.kanji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-1.5 truncate">
                                  <span className="font-extrabold text-sky-600 dark:text-sky-400 text-sm uppercase tracking-wide">{kb.han_viet || localKb.han_viet}</span>
                                </div>
                                <div className="text-xs text-sky-600 dark:text-sky-400 font-bold truncate mt-0.5">
                                  {meaningVal}
                                </div>
                              </div>
                            </div>
                            
                            {/* Readings On / Kun */}
                            <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-200/50 text-[10px]">
                              <div className="bg-amber-50/80 border border-amber-200/50 rounded-lg px-2 py-1 text-amber-900 flex flex-col">
                                <span className="text-[8px] font-bold text-amber-700 uppercase tracking-wider">Âm On</span>
                                <span className="font-mono font-bold truncate" title={onVal}>{onVal}</span>
                              </div>
                              <div className="bg-emerald-50/80 border border-emerald-200/50 rounded-lg px-2 py-1 text-emerald-900 flex flex-col">
                                <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">Âm Kun</span>
                                <span className="font-mono font-bold truncate" title={kunVal}>{kunVal}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // SINGLE KANJI MODE
              <>
                {/* Main Visual Block */}
                <div className="flex items-start gap-4">
                  {/* Massive Kanji Circle */}
                  <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-display font-black text-4xl shadow-xs border ${category.lightBg} ${category.lightText} ${category.lightBorder} select-all relative group shrink-0`}>
                    {kanjiChar}
                    <button 
                      onClick={() => speakJapanese(kanjiChar)}
                      className="absolute bottom-1 right-1 p-1 bg-white/80 rounded-md text-[8px] opacity-0 group-hover:opacity-100 hover:text-amber-500 transition-all cursor-pointer"
                      title="Phát âm"
                    >
                      <Volume2 className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Title & Meaning Info */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-xs font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${category.badgeBg} ${category.badgeText} ${category.badgeBorder}`}>
                        {category.emoji} {category.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                        Nét: {details?.strokes || 8}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-sky-600 dark:text-sky-400 font-display flex items-center gap-2">
                      {details?.han_viet ? details.han_viet : 'HÁN VIỆT'}
                    </h3>
                    
                    <p className="text-sm font-bold text-sky-600 dark:text-sky-400 leading-relaxed">
                      {details?.meaning ? details.meaning : 'Đang lấy ý nghĩa từ từ điển...'}
                    </p>
                  </div>
                </div>

                {/* On/Kun Readings */}
                {(() => {
                  const localFallback = getLocalKanjiDetails(kanjiChar);
                  const onText = (details?.onyomi && details.onyomi !== '—' && details.onyomi !== 'Chưa rõ') ? details.onyomi : localFallback.onyomi;
                  const kunText = (details?.kunyomi && details.kunyomi !== '—' && details.kunyomi !== 'Chưa rõ') ? details.kunyomi : localFallback.kunyomi;

                  return (
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 shadow-2xs">
                        <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block mb-1">Onyomi (Âm On)</span>
                        <span className="text-base font-mono font-bold text-amber-950 tracking-wide break-all block">
                          {onText || '—'}
                        </span>
                      </div>
                      <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-3.5 shadow-2xs">
                        <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block mb-1">Kunyomi (Âm Kun)</span>
                        <span className="text-base font-mono font-bold text-emerald-950 tracking-wide break-all block">
                          {kunText || '—'}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Kanji Family (Các từ cùng chữ Hán) */}
                <div className="space-y-3.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 tracking-wider uppercase block">
                      Họ từ Kanji ({kanjiChar})
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Bấm để ôn tập từ</span>
                  </div>

                  {/* Grid of groups */}
                  <div className="space-y-4">
                    {/* JLPT Group */}
                    {familyGroups.jlpt.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-500" /> Sơ cấp / JLPT N5-N4
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {familyGroups.jlpt.map(word => (
                            <button
                              key={word.id}
                              onClick={() => {
                                if (onSelectWord) {
                                  onSelectWord(word.id);
                                  onClose();
                                }
                              }}
                              className="flex flex-col text-left p-2.5 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs group"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-bold text-xs text-slate-900 font-display group-hover:text-indigo-600">{word.kanji}</span>
                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-all" />
                              </div>
                              <span className="text-[9px] text-slate-400 font-semibold">{word.reading}</span>
                              <span className="text-[10px] text-slate-600 font-medium mt-0.5 truncate w-full">{word.meaning}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Common Group */}
                    {familyGroups.common.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-indigo-500" /> Trung cấp / JLPT N3
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {familyGroups.common.map(word => (
                            <button
                              key={word.id}
                              onClick={() => {
                                if (onSelectWord) {
                                  onSelectWord(word.id);
                                  onClose();
                                }
                              }}
                              className="flex flex-col text-left p-2.5 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs group"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-bold text-xs text-slate-900 font-display group-hover:text-indigo-600">{word.kanji}</span>
                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-all" />
                              </div>
                              <span className="text-[9px] text-slate-400 font-semibold">{word.reading}</span>
                              <span className="text-[10px] text-slate-600 font-medium mt-0.5 truncate w-full">{word.meaning}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Business Group */}
                    {familyGroups.business.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-orange-500" /> Kinh tế / Công ty
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {familyGroups.business.map(word => (
                            <button
                              key={word.id}
                              onClick={() => {
                                if (onSelectWord) {
                                  onSelectWord(word.id);
                                  onClose();
                                }
                              }}
                              className="flex flex-col text-left p-2.5 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs group"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-bold text-xs text-slate-900 font-display group-hover:text-indigo-600">{word.kanji}</span>
                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-all" />
                              </div>
                              <span className="text-[9px] text-slate-400 font-semibold">{word.reading}</span>
                              <span className="text-[10px] text-slate-600 font-medium mt-0.5 truncate w-full">{word.meaning}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty families fallback */}
                    {familyGroups.jlpt.length === 0 && familyGroups.common.length === 0 && familyGroups.business.length === 0 && (
                      <div className="py-4 text-center border border-dashed border-slate-100 rounded-2xl">
                        <span className="text-slate-400 text-xs font-semibold">Chưa tìm thấy từ vựng cùng họ Kanji trong chương trình học hiện tại.</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
