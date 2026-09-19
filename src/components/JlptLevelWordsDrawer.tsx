/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, X, Sparkles, BookOpen } from 'lucide-react';
import { JLPT_LEVEL_CONFIG } from './JlptUnderlineArticle';
import { speakJapanese } from '../utils/audio';
import { LessonReadingVocab } from '../types';

interface JlptLevelWordsDrawerProps {
  level: 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | null;
  levelWords?: Record<string, string[]>;
  vocabularyList?: LessonReadingVocab[];
  onClose: () => void;
  onSelectWord: (word: string) => void;
}

export const JlptLevelWordsDrawer: React.FC<JlptLevelWordsDrawerProps> = ({
  level,
  levelWords,
  vocabularyList = [],
  onClose,
  onSelectWord
}) => {
  if (!level) return null;

  const config = JLPT_LEVEL_CONFIG[level];
  const levelNum = level.replace('N', '');

  // Words list for this level
  const wordsFromLevelMap = (levelWords && levelWords[levelNum]) || [];
  const wordsFromVocabList = vocabularyList.filter(v => v.level?.toUpperCase() === level);

  // Combine unique words
  const uniqueWords = Array.from(
    new Set([
      ...wordsFromLevelMap,
      ...wordsFromVocabList.map(v => v.word || v.kanji || '')
    ])
  ).filter(Boolean);

  const handlePlayWord = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    speakJapanese(word);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}
            >
              {config.label}
            </span>
            <h3 className="text-base font-bold text-white">
              Từ vựng JLPT {level} trong bài ({uniqueWords.length} từ)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Word list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {uniqueWords.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Không có từ vựng cấp độ {level} nào trong bài này.
            </div>
          ) : (
            uniqueWords.map((w, idx) => {
              const matchedVocab = vocabularyList.find(
                v => v.word === w || v.kanji === w || v.reading === w
              );

              return (
                <div
                  key={`${w}-${idx}`}
                  onClick={() => onSelectWord(w)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    {matchedVocab?.reading && (
                      <div className="text-xs text-[#43EEF7] font-jp font-medium">
                        {matchedVocab.reading}
                      </div>
                    )}
                    <div className="text-lg font-bold text-white font-jp group-hover:text-amber-300 transition">
                      {w}
                    </div>
                    {matchedVocab?.meaning && (
                      <div className="text-xs text-slate-300 font-normal">
                        {matchedVocab.meaning}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handlePlayWord(e, w)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(JlptLevelWordsDrawer);
