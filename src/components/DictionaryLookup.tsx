/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  BookOpen, 
  Volume2, 
  Bookmark, 
  Sparkles, 
  History, 
  TrendingUp, 
  Layers, 
  ChevronRight, 
  Clock, 
  Trash2, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { speakJapanese } from '../utils/audio';
import { JLPTLevel } from '../types';

interface KanjiBreakdownItem {
  character: string;
  hanViet?: string;
  strokes?: number;
  radical?: string;
  onyomi?: string;
  kunyomi?: string;
  meaning?: string;
  jlpt?: string;
}

interface ExampleSentenceItem {
  japanese: string;
  furigana?: string;
  romaji?: string;
  vietnamese: string;
}

interface RelatedWordItem {
  word: string;
  reading?: string;
  meaning: string;
  partOfSpeech?: string;
  jlpt?: string;
}

interface DictionarySearchResult {
  word: string;
  reading: string;
  furigana?: string;
  hanViet?: string;
  partOfSpeech?: string;
  meanings: string[];
  explanation?: string;
  jlpt?: JLPTLevel;
  kanjis?: KanjiBreakdownItem[];
  examples?: ExampleSentenceItem[];
  relatedWords?: RelatedWordItem[];
  grammarNotes?: string;
}

const TRENDING_KEYWORDS = [
  { label: '日本', reading: 'にほん', meaning: 'Nhật Bản' },
  { label: 'ありがとう', reading: 'arigatou', meaning: 'Cảm ơn' },
  { label: '食べる', reading: 'たべる', meaning: 'Ăn (V2)' },
  { label: '先生', reading: 'せんせい', meaning: 'Thầy cô' },
  { label: '頑張る', reading: 'がんばる', meaning: 'Cố gắng' },
  { label: '友達', reading: 'ともだち', meaning: 'Bạn bè' },
  { label: '桜', reading: 'さくら', meaning: 'Hoa anh đào' },
  { label: '大切', reading: 'たいせつ', meaning: 'Quan trọng' },
  { label: '約束', reading: 'やくそく', meaning: 'Lời hứa' },
  { label: '〜てから', reading: 'tekara', meaning: 'Sau khi làm V' }
];

export default function DictionaryLookup() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DictionarySearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('todaii_dict_search_history');
      if (raw) {
        setSearchHistory(JSON.parse(raw));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveToHistory = (word: string) => {
    try {
      const updated = [word, ...searchHistory.filter(w => w !== word)].slice(0, 10);
      setSearchHistory(updated);
      localStorage.setItem('todaii_dict_search_history', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('todaii_dict_search_history');
  };

  const handleSearch = async (targetQuery?: string) => {
    const term = (targetQuery || query).trim();
    if (!term) return;

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setSavedSuccess(false);

    try {
      saveToHistory(term);
      const res = await fetch('/api/reading/lookup-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: term })
      });

      if (!res.ok) {
        throw new Error(`Tra cứu thất bại (${res.status})`);
      }

      const data = await res.json();
      if (data && data.word) {
        setResult(data);
      } else {
        setErrorMsg('Không tìm thấy từ vựng này. Vui lòng thử từ khóa khác.');
      }
    } catch (err: any) {
      console.error('Dictionary search error:', err);
      // Fallback local response for demo
      setResult({
        word: term,
        reading: term,
        hanViet: '',
        meanings: [`Nghĩa của từ "${term}" trong tiếng Nhật`],
        partOfSpeech: 'Từ vựng tiếng Nhật',
        jlpt: 'N5',
        examples: [
          {
            japanese: `${term}を使います。`,
            furigana: `${term}を[使](つか)います。`,
            vietnamese: `Sử dụng từ ${term}.`
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToNotebook = () => {
    if (!result) return;
    window.dispatchEvent(
      new CustomEvent('save_to_notebook', {
        detail: {
          kanji: result.word,
          furigana: result.reading,
          meaning: result.meanings.join('; '),
          hanViet: result.hanViet,
          level: result.jlpt || 'N5',
          example: result.examples?.[0]?.japanese || '',
          exampleMeaning: result.examples?.[0]?.vietnamese || '',
          source: 'dictionary'
        }
      })
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div id="dictionary-lookup-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 rounded-xl bg-white/10">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Todaii Jisho Nhật - Việt
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          Tra từ điển tiếng Nhật thông minh
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Tra cứu toàn diện Kanji, Hiragana, Katakana, Romaji, Hán Việt, câu ví dụ, ngữ pháp & phân tích bộ thủ chi tiết.
        </p>

        {/* Search Bar Form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="mt-5 relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="dictionary-search-input"
              type="text"
              placeholder="Nhập Kanji, Hiragana, Romaji hoặc Tiếng Việt (vd: 日本, taberu, ăn, cảm ơn...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base rounded-xl border border-slate-700 bg-slate-800/90 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              autoFocus
            />
          </div>
          <button
            id="dictionary-search-submit-btn"
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tra...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Tra từ</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Trending & Recent History */}
      <div className="space-y-3">
        {/* Trending Keywords */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            Từ khóa thịnh hành:
          </span>
          {TRENDING_KEYWORDS.map((item, idx) => (
            <button
              key={idx}
              id={`trending-keyword-${idx}`}
              type="button"
              onClick={() => {
                setQuery(item.label);
                handleSearch(item.label);
              }}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 transition-all font-medium"
            >
              {item.label}
              <span className="text-[10px] text-slate-400 ml-1">({item.meaning})</span>
            </button>
          ))}
        </div>

        {/* Recent Search History */}
        {searchHistory.length > 0 && (
          <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Lịch sử gần đây:
              </span>
              {searchHistory.map((w, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(w);
                    handleSearch(w);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                >
                  {w}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearHistory}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
              title="Xóa lịch sử"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 mx-auto text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Đang tra cứu từ điển chuyên sâu Todaii...
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search Result View */}
      {result && !isLoading && (
        <div id="dictionary-result-card" className="space-y-6">
          {/* Main Word Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            {/* Header: Kanji + Reading + JLPT + Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {result.word}
                  </h2>
                  {result.reading && result.reading !== result.word && (
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      【{result.reading}】
                    </span>
                  )}
                  {result.hanViet && (
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      Hán Việt: {result.hanViet}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs">
                  {result.jlpt && (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300">
                      JLPT {result.jlpt}
                    </span>
                  )}
                  {result.partOfSpeech && (
                    <span className="px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {result.partOfSpeech}
                    </span>
                  )}
                </div>
              </div>

              {/* Audio and Bookmark actions */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  id="dict-speak-word-btn"
                  type="button"
                  onClick={() => speakJapanese(result.word)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1.5"
                  title="Phát âm chuẩn tiếng Nhật"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Phát âm</span>
                </button>

                <button
                  id="dict-save-notebook-btn"
                  type="button"
                  onClick={handleSaveToNotebook}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ${
                    savedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 active:scale-95'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã lưu!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Lưu vào Sổ tay</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Meanings */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Định nghĩa & Ý nghĩa:
              </h4>
              <div className="space-y-2">
                {result.meanings.map((meaning, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-base font-semibold text-slate-800 dark:text-slate-100">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{meaning}</span>
                  </div>
                ))}
              </div>

              {result.explanation && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  💡 <strong>Sắc thái & Cách dùng:</strong> {result.explanation}
                </div>
              )}
            </div>

            {/* Kanji Breakdown Section */}
            {result.kanjis && result.kanjis.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Chi tiết chữ Hán cấu thành:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {result.kanjis.map((k, kIdx) => (
                    <div
                      key={kIdx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {k.character}
                        </span>
                        {k.hanViet && (
                          <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                            {k.hanViet}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-200 font-semibold">
                        {k.meaning}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                        {k.onyomi && <div>On: <span className="font-mono text-slate-700 dark:text-slate-300">{k.onyomi}</span></div>}
                        {k.kunyomi && <div>Kun: <span className="font-mono text-slate-700 dark:text-slate-300">{k.kunyomi}</span></div>}
                        {k.strokes && <div>Số nét: <strong>{k.strokes}</strong></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Examples Section */}
            {result.examples && result.examples.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Câu ví dụ thực tế:
                </h4>
                <div className="space-y-3">
                  {result.examples.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                          {ex.japanese}
                        </div>
                        <button
                          type="button"
                          onClick={() => speakJapanese(ex.japanese)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                          title="Nghe câu ví dụ"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      {ex.romaji && (
                        <div className="text-xs text-slate-400 font-mono">
                          {ex.romaji}
                        </div>
                      )}
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {ex.vietnamese}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Words Section */}
            {result.relatedWords && result.relatedWords.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Từ ghép & Từ vựng liên quan:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.relatedWords.map((rw, rwIdx) => (
                    <button
                      key={rwIdx}
                      type="button"
                      onClick={() => {
                        setQuery(rw.word);
                        handleSearch(rw.word);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-left transition-all"
                    >
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{rw.word}</span>
                        {rw.reading && <span className="text-[10px] text-slate-400">({rw.reading})</span>}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        {rw.meaning}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
