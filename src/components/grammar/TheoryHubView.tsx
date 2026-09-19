import React, { useState, useMemo, useRef, useEffect } from 'react';
import { JLPTLevel, UserProfile, GrammarItem } from '../../types';
import { Search, ChevronDown, ChevronRight, Play, BookOpen, PenTool, Layers, Check, X } from 'lucide-react';
import ShibaStudyMascot from './ShibaStudyMascot';

interface TheoryHubViewProps {
  userProfile: UserProfile;
  selectedLevel: JLPTLevel;
  onChangeLevel: (level: JLPTLevel) => void;
  onOpenGrammar: () => void;
  onOpenVocab: () => void;
  onOpenKanji: () => void;
  onContinueStudy: () => void;
  grammars: GrammarItem[];
  levelStats?: Record<string, { lessons: number; grammars: number; completed: number }>;
  onSelectGrammarItem?: (grammar: GrammarItem) => void;
}

const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

// Standard curriculum totals for JLPT levels
const BENCHMARK_TOTALS: Record<string, { vocab: number; grammar: number; kanji: number }> = {
  N5: { vocab: 511, grammar: 120, kanji: 103 },
  N4: { vocab: 511, grammar: 539, kanji: 167 },
  N3: { vocab: 850, grammar: 140, kanji: 367 },
  N2: { vocab: 1200, grammar: 150, kanji: 367 },
  N1: { vocab: 2000, grammar: 180, kanji: 1130 },
};

export const TheoryHubView: React.FC<TheoryHubViewProps> = ({
  userProfile,
  selectedLevel,
  onChangeLevel,
  onOpenGrammar,
  onOpenVocab,
  onOpenKanji,
  onContinueStudy,
  grammars,
  onSelectGrammarItem
}) => {
  const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLevelMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute completed counts for selectedLevel
  const benchmarks = BENCHMARK_TOTALS[selectedLevel] || BENCHMARK_TOTALS.N4;

  // Completed Vocab for selected level
  const vocabCompleted = useMemo(() => {
    const statusMap = userProfile.vocabStatus || {};
    let count = 0;
    Object.entries(statusMap).forEach(([key, st]) => {
      if (key.toLowerCase().includes(selectedLevel.toLowerCase()) || key.startsWith('v_')) {
        if (st === 'mastered' || (typeof st === 'object' && ((st as any).repetitions >= 1 || (st as any).state === 'mastered'))) {
          count++;
        }
      }
    });
    return count;
  }, [userProfile.vocabStatus, selectedLevel]);

  // Completed Grammar for selected level
  const grammarCompleted = useMemo(() => {
    const statusMap = userProfile.grammarStatus || {};
    let count = 0;
    const levelGrammars = grammars.filter(g => g.level === selectedLevel);
    const ids = new Set(levelGrammars.map(g => g.id));
    
    Object.entries(statusMap).forEach(([id, st]) => {
      if (ids.has(id) || (ids.size === 0 && id.includes(selectedLevel))) {
        if (st && (st === true || (typeof st === 'object' && ((st as any).correctCount > 0 || (st as any).state === 'learned' || (st as any).state === 'mastered')))) {
          count++;
        }
      }
    });
    return count;
  }, [userProfile.grammarStatus, grammars, selectedLevel]);

  // Completed Kanji for selected level
  const kanjiCompleted = useMemo(() => {
    const statusMap = userProfile.kanjiStatus || {};
    let count = 0;
    Object.entries(statusMap).forEach(([id, st]) => {
      if (id.toLowerCase().includes(selectedLevel.toLowerCase())) {
        if (st && (st === true || (typeof st === 'object' && ((st as any).repetitions >= 1 || (st as any).state === 'mastered')))) {
          count++;
        }
      }
    });
    return count;
  }, [userProfile.kanjiStatus, selectedLevel]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return grammars
      .filter(g => 
        g.structure.toLowerCase().includes(q) ||
        g.meaning.toLowerCase().includes(q) ||
        (g.lessonName && g.lessonName.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [searchQuery, grammars]);

  // Next unit for "HỌC TIẾP" card
  const continueLabel = useMemo(() => {
    if (selectedLevel === 'N4') return 'N4 · Bài 1 · Từ vựng';
    if (selectedLevel === 'N5') return 'N5 · Bài 1 · Từ vựng';
    return `${selectedLevel} · Bài 1 · Lý thuyết`;
  }, [selectedLevel]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-3 pb-24 font-sans text-slate-100 select-none animate-fadeIn">
      {/* Top Header: Title + Level Selector */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Lý thuyết
        </h1>

        {/* Purple JLPT Level Dropdown Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            id="theory-jlpt-level-btn"
            onClick={() => setIsLevelMenuOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C4DFF] hover:bg-[#6D3DF5] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full shadow-[0_2px_8px_rgba(124,77,255,0.4)] transition-all cursor-pointer"
          >
            <span>JLPT {selectedLevel}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLevelMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Level Dropdown Menu */}
          {isLevelMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#162032] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                Chọn cấp độ JLPT
              </div>
              {JLPT_LEVELS.map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    onChangeLevel(lvl);
                    setIsLevelMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-sm font-bold text-left transition-colors cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-[#7C4DFF]/20 text-[#A78BFA]'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>JLPT {lvl}</span>
                  {selectedLevel === lvl && <Check className="w-4 h-4 text-[#A78BFA]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-5" ref={searchContainerRef}>
        <div className="flex items-center gap-2.5 px-3.5 py-3 bg-[#131b2a] border border-slate-800 rounded-2xl shadow-inner focus-within:border-sky-500/60 focus-within:ring-1 focus-within:ring-sky-500/40 transition-all">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            id="theory-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Tìm kanji, từ vựng hoặc ngữ pháp..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Popover */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#162032] border border-slate-700/80 rounded-2xl shadow-2xl max-h-72 overflow-y-auto z-50 p-2 animate-fadeIn">
            {searchResults.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                Không tìm thấy cấu trúc ngữ pháp phù hợp với &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Kết quả ngữ pháp ({searchResults.length})
                </div>
                {searchResults.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      if (onSelectGrammarItem) onSelectGrammarItem(g);
                      setIsSearchFocused(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-sky-400">{g.structure}</div>
                      <div className="text-xs text-slate-300 line-clamp-1">{g.meaning}</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {g.level}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card "HỌC TIẾP" */}
      <div 
        id="theory-continue-card"
        onClick={onContinueStudy}
        className="relative bg-[#131d2e] hover:bg-[#182438] active:scale-[0.99] border border-slate-800/90 rounded-2xl p-4 mb-5 flex items-center justify-between shadow-lg cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3.5">
          {/* Shiba Study Mascot */}
          <div className="relative shrink-0 group-hover:scale-105 transition-transform">
            <ShibaStudyMascot size={54} />
          </div>

          {/* Texts */}
          <div className="text-left">
            <div className="text-[11px] font-black text-sky-400 tracking-wider uppercase mb-0.5">
              HỌC TIẾP
            </div>
            <div className="text-base sm:text-lg font-bold text-white group-hover:text-sky-200 transition-colors">
              {continueLabel}
            </div>
          </div>
        </div>

        {/* Circular Blue Play Button */}
        <button
          type="button"
          aria-label="Tiếp tục học"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0091EA] hover:bg-[#0284C7] active:scale-95 flex items-center justify-center text-white shadow-[0_4px_14px_rgba(0,145,234,0.45)] shrink-0 transition-transform cursor-pointer"
        >
          <Play className="w-5 h-5 ml-0.5 fill-white text-white" />
        </button>
      </div>

      {/* 3 Stat Counters Row */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
        {/* Stat 1: Từ vựng */}
        <div 
          onClick={onOpenVocab}
          className="bg-[#131d2e] hover:bg-[#182438] border border-slate-800/90 rounded-2xl py-3 px-2 flex flex-col items-center justify-center text-center shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-1 font-black text-white text-base sm:text-lg tracking-tight">
            <Layers className="w-4 h-4 text-sky-400 inline-block shrink-0" />
            <span>{vocabCompleted}/{benchmarks.vocab}</span>
          </div>
          <div className="text-xs text-slate-400 font-medium mt-0.5 group-hover:text-slate-300">
            Từ vựng
          </div>
        </div>

        {/* Stat 2: Ngữ pháp */}
        <div 
          onClick={onOpenGrammar}
          className="bg-[#131d2e] hover:bg-[#182438] border border-slate-800/90 rounded-2xl py-3 px-2 flex flex-col items-center justify-center text-center shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-1 font-black text-white text-base sm:text-lg tracking-tight">
            <BookOpen className="w-4 h-4 text-purple-400 inline-block shrink-0" />
            <span>{grammarCompleted}/{benchmarks.grammar}</span>
          </div>
          <div className="text-xs text-slate-400 font-medium mt-0.5 group-hover:text-slate-300">
            Ngữ pháp
          </div>
        </div>

        {/* Stat 3: Kanji */}
        <div 
          onClick={onOpenKanji}
          className="bg-[#131d2e] hover:bg-[#182438] border border-slate-800/90 rounded-2xl py-3 px-2 flex flex-col items-center justify-center text-center shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-1 font-black text-white text-base sm:text-lg tracking-tight">
            <PenTool className="w-4 h-4 text-teal-400 inline-block shrink-0" />
            <span>{kanjiCompleted}/{benchmarks.kanji}</span>
          </div>
          <div className="text-xs text-slate-400 font-medium mt-0.5 group-hover:text-slate-300">
            Kanji
          </div>
        </div>
      </div>

      {/* Section Title: Học lý thuyết */}
      <div className="mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Học lý thuyết
        </h2>
      </div>

      {/* 3 Main Action Cards (Stacked vertically) */}
      <div className="space-y-3">
        {/* Card 1: Từ vựng */}
        <div
          id="card-theory-vocab"
          onClick={onOpenVocab}
          className="group bg-[#131d2e] hover:bg-[#182438] active:scale-[0.99] border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-md"
        >
          <div className="flex items-center gap-4">
            {/* Icon Box: Purple/Violet Cards */}
            <div className="w-14 h-14 rounded-2xl bg-[#1e2348] border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Layers className="w-7 h-7 text-indigo-400" />
            </div>

            {/* Text Info */}
            <div className="text-left">
              <div className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                Từ vựng
              </div>
              <div className="text-sm text-slate-400 font-medium mt-0.5">
                {selectedLevel}
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Card 2: Ngữ pháp */}
        <div
          id="card-theory-grammar"
          onClick={onOpenGrammar}
          className="group bg-[#131d2e] hover:bg-[#182438] active:scale-[0.99] border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-md"
        >
          <div className="flex items-center gap-4">
            {/* Icon Box: Indigo/Blue Open Book */}
            <div className="w-14 h-14 rounded-2xl bg-[#1c2242] border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>

            {/* Text Info */}
            <div className="text-left">
              <div className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                Ngữ pháp
              </div>
              <div className="text-sm text-slate-400 font-medium mt-0.5">
                {selectedLevel}
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Card 3: Kanji */}
        <div
          id="card-theory-kanji"
          onClick={onOpenKanji}
          className="group bg-[#131d2e] hover:bg-[#182438] active:scale-[0.99] border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-md"
        >
          <div className="flex items-center gap-4">
            {/* Icon Box: Dark Teal/Cyan Calligraphy Pen */}
            <div className="w-14 h-14 rounded-2xl bg-[#132c38] border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <PenTool className="w-7 h-7 text-teal-400" />
            </div>

            {/* Text Info */}
            <div className="text-left">
              <div className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                Kanji
              </div>
              <div className="text-sm text-slate-400 font-medium mt-0.5">
                Chinh phục kanji theo từng cấp
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default TheoryHubView;
