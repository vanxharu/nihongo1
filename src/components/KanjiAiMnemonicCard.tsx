/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KanjiAiMnemonicCard Component
 * Displays AI-generated mnemonic memory tips with associative story, component breakdown,
 * anchor sentence, vocabulary reinforcement, and example sentence.
 * Features vibrant, eye-catching visual hierarchy, micro-interactions, audio pronunciation,
 * and resilient error states.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  AlertCircle, 
  Loader2, 
  Lightbulb, 
  Brain, 
  Layers, 
  BookOpen, 
  Quote 
} from 'lucide-react';
import { 
  getKanjiMnemonicAI, 
  getCachedKanjiMnemonic, 
  KanjiAiMnemonic 
} from '../services/kanjiAI';

interface KanjiAiMnemonicCardProps {
  kanji: string;
  meaning?: string;
  onyomi?: string;
  kunyomi?: string;
  strokes?: number;
  radical?: string;
  level?: string;
  components?: string;
  onSpeak?: (text: string) => void;
  className?: string;
}

export const KanjiAiMnemonicCard: React.FC<KanjiAiMnemonicCardProps> = ({
  kanji,
  meaning,
  onyomi,
  kunyomi,
  strokes,
  radical,
  level,
  components,
  onSpeak,
  className = ''
}) => {
  const [mnemonicData, setMnemonicData] = useState<KanjiAiMnemonic | null>(() => {
    return kanji ? getCachedKanjiMnemonic(kanji) : null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState<boolean>(false);

  // Fetch or load from cache
  const loadMnemonic = useCallback(async (forceRefresh = false) => {
    if (!kanji || !kanji.trim()) return;

    if (!forceRefresh) {
      const cached = getCachedKanjiMnemonic(kanji);
      if (cached) {
        setMnemonicData(cached);
        setLoading(false);
        setError(null);
        return;
      }
    }

    if (forceRefresh) {
      setIsRegenerating(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setIsConfigError(false);

    try {
      const data = await getKanjiMnemonicAI({
        kanji,
        meaning,
        onyomi,
        kunyomi,
        strokes,
        radical,
        level,
        components,
        forceRefresh
      });
      setMnemonicData(data);
    } catch (err: any) {
      console.error('[KanjiAiMnemonicCard] Failed to load mnemonic:', err);
      setError(err?.message || 'Không thể tạo mẹo nhớ lúc này. Vui lòng thử lại.');
      setIsConfigError(Boolean(err?.isConfigError));
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  }, [kanji, meaning, onyomi, kunyomi, strokes, radical, level, components]);

  // Load whenever kanji changes
  useEffect(() => {
    const cached = kanji ? getCachedKanjiMnemonic(kanji) : null;
    if (cached) {
      setMnemonicData(cached);
      setLoading(false);
      setError(null);
    } else {
      loadMnemonic(false);
    }
  }, [kanji, loadMnemonic]);

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading || isRegenerating) return;
    loadMnemonic(true);
  };

  const handleSpeakText = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (onSpeak) {
      onSpeak(text);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div 
      onClick={(e) => e.stopPropagation()} // Prevent card flip when interacting with mnemonic
      className={`bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-indigo-50/40 border-2 border-amber-200/90 hover:border-amber-300 rounded-2xl p-3.5 sm:p-4 text-left w-full max-w-sm sm:max-w-md mx-auto space-y-3 shadow-md shadow-amber-500/5 shrink-0 select-text transition-all relative overflow-hidden ${className}`}
    >
      {/* Top decorative accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-500" />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5 pt-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wide font-display">
                Mẹo nhớ Kanji AI
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white uppercase tracking-wider font-mono shadow-3xs">
                Liên tưởng
              </span>
            </div>
            <span className="text-[10px] text-amber-800/80 font-medium truncate">
              Ghi nhớ qua hình ảnh & câu chuyện
            </span>
          </div>
        </div>

        {/* Regenerate button */}
        <button
          onClick={handleRegenerate}
          disabled={loading || isRegenerating}
          title="Tạo lại mẹo nhớ liên tưởng mới khác từ AI"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-950 bg-white hover:bg-amber-100/90 active:bg-amber-200 border border-amber-300 hover:border-amber-400 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRegenerating ? 'Đang tạo...' : 'Tạo mẹo khác'}</span>
          <span className="sm:hidden">{isRegenerating ? '...' : 'Đổi mẹo'}</span>
        </button>
      </div>

      {/* Loading state (initial fetch) */}
      {loading && !mnemonicData && (
        <div className="py-7 px-4 flex flex-col items-center justify-center text-center space-y-3 bg-white/80 rounded-xl border border-amber-200/70 shadow-inner">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
              <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
            </div>
            <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-950">Đang sáng tạo mẹo nhớ liên tưởng…</p>
            <p className="text-xs text-amber-800/80 max-w-xs leading-relaxed">
              AI đang phân tích bộ thủ và tạo câu chuyện sống động cho chữ 「<span className="font-bold text-amber-900 text-sm font-display">{kanji}</span>」...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !mnemonicData && !loading && (
        <div className="py-3 px-3.5 bg-rose-50 border border-rose-200 rounded-xl text-left space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-rose-100 text-rose-600 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-rose-900">
                {isConfigError 
                  ? 'Chưa cấu hình GEMINI_API_KEY trong hệ thống secrets.' 
                  : 'Không thể tạo mẹo nhớ lúc này.'}
              </p>
              <p className="text-[11px] text-rose-700 leading-snug">
                {isConfigError 
                  ? 'Vui lòng thiết lập biến môi trường GEMINI_API_KEY để kích hoạt tính năng AI.' 
                  : error}
              </p>
            </div>
          </div>
          <button
            onClick={() => loadMnemonic(true)}
            className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại ngay</span>
          </button>
        </div>
      )}

      {/* Main Content Render */}
      {mnemonicData && (
        <div className="space-y-3">
          {/* 1. 🧩 Cấu tạo (Components) */}
          {mnemonicData.components && mnemonicData.components.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] text-indigo-900 font-extrabold uppercase tracking-wider font-mono">
                  Phân tích cấu tạo chữ:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {mnemonicData.components.map((comp, idx) => (
                  <div 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 border border-indigo-200/90 text-xs shadow-xs hover:border-indigo-300 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-950 font-bold font-display flex items-center justify-center text-sm shadow-3xs">
                      {comp.part}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">→</span>
                    <span className="text-indigo-950 font-bold text-[11px]">{comp.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 💡 Mẹo nhớ (Memory tip story) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] text-amber-900 font-extrabold uppercase tracking-wider font-mono">
                Câu chuyện liên tưởng:
              </span>
            </div>
            <div className="bg-gradient-to-r from-amber-100/70 via-amber-50/90 to-orange-50/70 border border-amber-300/80 rounded-xl p-3 shadow-xs">
              <p className="text-xs sm:text-[13px] text-amber-950 leading-relaxed font-medium">
                {mnemonicData.memory_tip}
              </p>
            </div>
          </div>

          {/* 3. 🧠 Câu chốt (Punchline sentence) */}
          {mnemonicData.memory_sentence && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] text-rose-900 font-extrabold uppercase tracking-wider font-mono">
                  Câu chốt khắc sâu:
                </span>
              </div>
              <div className="bg-white/95 border-l-4 border-l-amber-500 border-y border-r border-amber-200/90 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black text-amber-950 leading-snug flex items-start gap-2 shadow-xs">
                <Quote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="flex-1 tracking-tight">{mnemonicData.memory_sentence}</span>
              </div>
            </div>
          )}

          {/* 4. 📚 Từ vựng (Vocabulary items) */}
          {mnemonicData.vocabulary && mnemonicData.vocabulary.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] text-emerald-900 font-extrabold uppercase tracking-wider font-mono">
                    Từ vựng thông dụng:
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium">Chạm để nghe phát âm</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {mnemonicData.vocabulary.map((vocab, i) => (
                  <div
                    key={i}
                    onClick={(e) => handleSpeakText(e, vocab.word || vocab.reading)}
                    title="Bấm để nghe phát âm tiếng Nhật"
                    className="flex justify-between items-center bg-white/95 hover:bg-amber-100/60 active:bg-amber-100 px-3 py-2 rounded-xl border border-amber-200/80 hover:border-amber-300 text-xs transition-all cursor-pointer shadow-3xs group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button 
                        type="button" 
                        aria-label="Nghe phát âm"
                        className="w-6 h-6 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 flex items-center justify-center transition-colors shrink-0 shadow-3xs"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black font-display text-slate-900 text-sm">{vocab.word}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-900 font-mono">
                        {vocab.reading}
                      </span>
                    </div>
                    <span className="text-xs text-slate-700 font-bold text-right ml-2 truncate">
                      {vocab.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ✍️ Ví dụ (Example sentence) */}
          {mnemonicData.example && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-sky-900 font-extrabold uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  Câu ví dụ ứng dụng:
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Bấm để nghe đọc cả câu</span>
              </div>
              <div 
                onClick={(e) => handleSpeakText(e, mnemonicData.example.japanese)}
                title="Bấm để nghe phát âm câu ví dụ"
                className="bg-gradient-to-r from-sky-50/90 via-blue-50/70 to-indigo-50/50 hover:from-sky-100/90 hover:to-indigo-100/70 p-3 rounded-xl border border-sky-200/90 hover:border-sky-300 text-left space-y-1.5 shadow-xs cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs sm:text-[13px] text-slate-950 font-bold leading-snug">
                    {mnemonicData.example.japanese}
                  </p>
                  <span className="w-6 h-6 rounded-lg bg-sky-100 group-hover:bg-sky-600 group-hover:text-white text-sky-700 flex items-center justify-center shrink-0 transition-colors shadow-3xs">
                    <Volume2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                {mnemonicData.example.hiragana && (
                  <p className="text-[11px] text-slate-600 font-mono font-medium leading-tight">
                    {mnemonicData.example.hiragana}
                  </p>
                )}
                <div className="pt-0.5 border-t border-sky-200/60">
                  <p className="text-xs text-sky-900 font-bold leading-tight">
                    {mnemonicData.example.vietnamese}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
