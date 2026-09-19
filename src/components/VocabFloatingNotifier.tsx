import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, BookOpen } from 'lucide-react';
import { speakJapanese } from '../utils/audio';
import JapaneseFuriganaText from './JapaneseFuriganaText';
import {
  ReminderSettings,
  getDefaultReminderSettings,
  getAllVocabPool,
  syncRemindersWithServiceWorker,
  startBackgroundVocabTicker,
  formatVocabOriginLabel,
  VocabNotificationPayload
} from '../utils/notifications';

interface VocabFloatingNotifierProps {
  onEarnXp?: (amount: number) => void;
}

export default function VocabFloatingNotifier({ onEarnXp }: VocabFloatingNotifierProps) {
  const [activeWord, setActiveWord] = useState<VocabNotificationPayload | null>(null);
  const vocabPool = useMemo(() => getAllVocabPool(), []);

  // Listen for in-app floating toast events
  useEffect(() => {
    const handleVocabEvent = (e: CustomEvent<VocabNotificationPayload>) => {
      if (e.detail) {
        setActiveWord(e.detail);
      }
    };

    window.addEventListener('jpstudy-vocab-toast', handleVocabEvent as EventListener);
    return () => {
      window.removeEventListener('jpstudy-vocab-toast', handleVocabEvent as EventListener);
    };
  }, []);

  // Auto dismiss floating toast after 5 seconds
  useEffect(() => {
    if (activeWord) {
      const timer = setTimeout(() => {
        setActiveWord(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeWord]);

  // Listen to settings changes across tabs / storage events
  useEffect(() => {
    const handleStorageChange = () => {
      const latest: ReminderSettings = getDefaultReminderSettings();
      syncRemindersWithServiceWorker(latest, vocabPool).catch(() => {});
    };

    window.addEventListener('storage', handleStorageChange);
    const pollInterval = setInterval(handleStorageChange, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [vocabPool]);

  // Initial sync to ServiceWorker with full vocabulary pool
  useEffect(() => {
    const latest = getDefaultReminderSettings();
    syncRemindersWithServiceWorker(latest, vocabPool).catch(() => {});
  }, [vocabPool]);

  // Start the background Web Worker ticker for Windows system notifications
  useEffect(() => {
    const stopTicker = startBackgroundVocabTicker();
    return () => {
      if (stopTicker) stopTicker();
    };
  }, []);

  const handleSpeakWord = () => {
    if (!activeWord) return;
    speakJapanese(activeWord.kanji || activeWord.reading);
  };

  const handleSpeakExample = () => {
    if (!activeWord?.exampleJp) return;
    speakJapanese(activeWord.exampleJp, undefined, undefined, { isSentence: true });
  };

  const handleCollectXp = () => {
    if (onEarnXp) {
      onEarnXp(5);
    }
    setActiveWord(null);
  };

  const originInfo = activeWord ? formatVocabOriginLabel(activeWord) : null;

  return (
    <AnimatePresence>
      {activeWord && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-20 xl:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[120] max-w-sm w-[92%] sm:w-96 bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl flex flex-col gap-2.5"
        >
          {/* Top Origin Tag: Curriculum & Lesson & Word # */}
          {originInfo && (
            <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 font-bold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 truncate">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-indigo-300 font-extrabold truncate">{originInfo.curriculumBadge}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 truncate">{originInfo.lessonBadge}</span>
              </div>
              {originInfo.wordNumBadge && (
                <span className="text-amber-400 font-mono font-black shrink-0 ml-1">
                  {originInfo.wordNumBadge}
                </span>
              )}
            </div>
          )}

          {/* Header row with Level, Kanji/Reading, Audio, and Close */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                {activeWord.level || 'JLPT'}
              </span>
              <span className="font-extrabold text-sm sm:text-base text-white truncate">
                {activeWord.kanji && activeWord.kanji !== activeWord.reading
                  ? `${activeWord.kanji} (${activeWord.reading})`
                  : activeWord.reading}
              </span>
              {activeWord.hanViet && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.5 rounded shrink-0">
                  {activeWord.hanViet.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleSpeakWord}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-300 transition-colors cursor-pointer"
                title="Phát âm từ vựng"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveWord(null)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-[10px] font-black text-slate-300 transition-colors shrink-0 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>

          {/* Meaning */}
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
              <span className="text-slate-400 font-normal">Nghĩa: </span>
              {activeWord.meaning}
            </p>
            {onEarnXp && (
              <button
                onClick={handleCollectXp}
                className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                title="Nhận 5 XP học từ vựng"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                +5 XP
              </button>
            )}
          </div>

          {/* Example Sentence Section */}
          {activeWord.exampleJp && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-xs bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-indigo-300 text-xs sm:text-sm leading-snug">
                  <JapaneseFuriganaText
                    sentence={activeWord.exampleJp}
                    currentItem={{ kanji: activeWord.kanji, hiragana: activeWord.reading }}
                    showFurigana={true}
                    forceDark={true}
                    size="xs"
                  />
                </div>
                <button
                  onClick={handleSpeakExample}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0 cursor-pointer"
                  title="Đọc câu ví dụ"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              </div>
              {activeWord.exampleVi && (
                <p className="text-slate-400 text-[11px] font-medium leading-relaxed">
                  {activeWord.exampleVi}
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
