import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { speakJapanese, playTangoClip } from '../utils/audio';
import { TANGO_CLIP_NUMBERS, TANGO_SPLIT_CLIPS } from '../data/tangoN4AudioClips';
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
  const [speaking, setSpeaking] = useState<'word' | 'example' | null>(null);

  useEffect(() => {
    const handleVocabEvent = (e: CustomEvent<VocabNotificationPayload>) => {
      if (e.detail) setActiveWord(e.detail);
    };
    window.addEventListener('jpstudy-vocab-toast', handleVocabEvent as EventListener);
    return () => window.removeEventListener('jpstudy-vocab-toast', handleVocabEvent as EventListener);
  }, []);

  useEffect(() => {
    if (activeWord && !speaking) { // keep the card open while audio is playing
      const timer = setTimeout(() => setActiveWord(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [activeWord, speaking]);

  useEffect(() => { setSpeaking(null); }, [activeWord]);

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

  useEffect(() => {
    const latest = getDefaultReminderSettings();
    syncRemindersWithServiceWorker(latest, vocabPool).catch(() => {});
  }, [vocabPool]);

  useEffect(() => {
    const stopTicker = startBackgroundVocabTicker();
    return () => { if (stopTicker) stopTicker(); };
  }, []);

  // Tango words play the recorded clip (same audio as the flashcards); others fall back to TTS.
  const speak = (kind: 'word' | 'example') => {
    if (!activeWord) return;
    const text = kind === 'word' ? (activeWord.kanji || activeWord.reading) : activeWord.exampleJp;
    if (!text) return;
    const done = () => setSpeaking(null);
    setSpeaking(kind);
    const n = Number(activeWord.wordNumber);
    if (activeWord.curriculum === 'tango' && TANGO_CLIP_NUMBERS.has(n)) {
      playTangoClip(n, TANGO_SPLIT_CLIPS.has(n) ? (kind === 'example' ? 's' : 'w') : '', done);
    } else {
      speakJapanese(kind === 'word' ? (activeWord.reading || text) : text, undefined, done, { isSentence: kind === 'example' });
    }
    window.setTimeout(done, 15000); // safety net if no end event fires
  };
  const handleSpeakWord = () => speak('word');
  const handleSpeakExample = () => speak('example');

  const handleCollectXp = () => {
    if (onEarnXp) onEarnXp(5);
    setActiveWord(null);
  };

  const originInfo = activeWord ? formatVocabOriginLabel(activeWord) : null;

  return (
    <AnimatePresence>
      {activeWord && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed bottom-20 xl:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[120] w-[92%] max-w-[340px]"
          style={{
            background: '#fff',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 2px 20px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.07)',
          }}
        >
          {/* Cyan accent strip */}
          <div style={{ height: 3, background: 'linear-gradient(90deg,#06b6d4,#38bdf8)' }} />

          {/* Header */}
          <div style={{ padding: '10px 12px 0' }}>
            <div className="flex items-center gap-2 mb-2.5">
              {/* App icon */}
              <div style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
              }}>💬</div>

              <div className="min-w-0 flex-1">
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                  Nihon Shiba
                </div>
                {originInfo && (
                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }} className="truncate">
                    {originInfo.curriculumBadge} · {originInfo.lessonBadge}
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveWord(null)}
                style={{
                  fontSize: 10, fontWeight: 700, color: '#94a3b8',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '2px 4px', borderRadius: 4,
                }}
              >✕</button>
            </div>

            {/* Word row */}
            <div className="flex items-flex-end gap-2.5 mb-1.5" style={{ alignItems: 'flex-end' }}>
              <span style={{
                fontFamily: '"Noto Sans JP", sans-serif',
                fontSize: 28, fontWeight: 700, color: '#0f172a', lineHeight: 1,
              }}>
                {activeWord.kanji && activeWord.kanji !== activeWord.reading
                  ? activeWord.kanji
                  : activeWord.reading}
              </span>
              <div className="flex flex-col gap-1 pb-0.5">
                <div style={{ fontSize: 10, color: '#64748b', fontFamily: '"Noto Sans JP", sans-serif' }}>
                  {activeWord.kanji && activeWord.kanji !== activeWord.reading
                    ? activeWord.reading
                    : ''}
                </div>
                <div className="flex items-center gap-1">
                  {activeWord.level && (
                    <span style={{
                      fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                      background: '#fef9c3', color: '#a16207', letterSpacing: '0.03em',
                    }}>{activeWord.level}</span>
                  )}
                  {activeWord.hanViet && (
                    <span style={{
                      fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                      background: '#f0fdf4', color: '#15803d', letterSpacing: '0.03em',
                      textTransform: 'uppercase' as const,
                    }}>{activeWord.hanViet}</span>
                  )}
                  <button
                    onClick={handleSpeakWord}
                    className={`vocab-toast-speak${speaking === 'word' ? ' animate-pulse' : ''}`}
                    style={{
                      background: speaking === 'word' ? '#d1fae5' : '#f1f5f9', border: 'none', borderRadius: 6,
                      width: 26, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Phát âm"
                  >
                    <Volume2 size={13} color={speaking === 'word' ? '#059669' : '#64748b'} />
                  </button>
                </div>
              </div>
            </div>

            {/* Meaning */}
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              {activeWord.meaning}
            </div>
          </div>

          {/* Example section */}
          {activeWord.exampleJp && (
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              padding: '8px 12px',
            }}>
              <div className="flex items-start justify-between gap-2">
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 2, flex: 1, minWidth: 0 }}>
                  <JapaneseFuriganaText
                    sentence={activeWord.exampleJp}
                    currentItem={{ kanji: activeWord.kanji, hiragana: activeWord.reading }}
                    showFurigana={true}
                    forceDark={false}
                    size="xs"
                  />
                </div>
                <button
                  onClick={handleSpeakExample}
                  className={`vocab-toast-speak${speaking === 'example' ? ' animate-pulse' : ''}`}
                  style={{
                    background: speaking === 'example' ? '#d1fae5' : '#e2e8f0', border: 'none', borderRadius: 6,
                    width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    marginTop: 4,
                  }}
                  title="Đọc câu ví dụ"
                >
                  <Volume2 size={14} color={speaking === 'example' ? '#059669' : '#64748b'} />
                </button>
              </div>
              {activeWord.exampleVi && (
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, lineHeight: 1.5 }}>
                  {activeWord.exampleVi}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={handleCollectXp}
              style={{
                flex: 1, padding: '9px 0',
                fontSize: 11, fontWeight: 700, color: '#0891b2',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderRight: '1px solid #f1f5f9',
              }}
            >
              {onEarnXp ? 'Đã nhớ ✓  +5 XP' : 'Đã nhớ ✓'}
            </button>
            <button
              onClick={() => setActiveWord(null)}
              style={{
                flex: 1, padding: '9px 0',
                fontSize: 11, fontWeight: 600, color: '#94a3b8',
                background: 'transparent', border: 'none', cursor: 'pointer',
              }}
            >
              Ôn lại sau
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
