import React, { useState, useMemo, useRef, useEffect } from 'react';
import { JLPTLevel, UserProfile, GrammarItem } from '../../types';
import { Search, ChevronRight, Play, BookOpen, PenTool, Layers, X, Flame, Zap } from 'lucide-react';
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

const BENCHMARK_TOTALS: Record<string, { vocab: number; grammar: number; kanji: number }> = {
  N5: { vocab: 511, grammar: 120, kanji: 103 },
  N4: { vocab: 511, grammar: 539, kanji: 167 },
  N3: { vocab: 850, grammar: 140, kanji: 367 },
  N2: { vocab: 1200, grammar: 150, kanji: 367 },
  N1: { vocab: 2000, grammar: 180, kanji: 1130 },
};

// Subject card config
const SUBJECTS = [
  {
    key: 'vocab',
    label: 'Từ vựng',
    sub: 'Flashcard & ôn theo ngữ cảnh',
    Icon: Layers,
    accent: '#3B82F6',      // blue
    bg: 'rgba(59,130,246,0.10)',
    border: 'rgba(59,130,246,0.22)',
    glow: 'rgba(59,130,246,0.18)',
  },
  {
    key: 'grammar',
    label: 'Ngữ pháp',
    sub: 'Cấu trúc câu & ví dụ thực tế',
    Icon: BookOpen,
    accent: '#A855F7',      // purple
    bg: 'rgba(168,85,247,0.10)',
    border: 'rgba(168,85,247,0.22)',
    glow: 'rgba(168,85,247,0.18)',
  },
  {
    key: 'kanji',
    label: 'Hán tự',
    sub: 'Nhận diện & tra nghĩa nhanh',
    Icon: PenTool,
    accent: '#14B8A6',      // teal
    bg: 'rgba(20,184,166,0.10)',
    border: 'rgba(20,184,166,0.22)',
    glow: 'rgba(20,184,166,0.18)',
  },
] as const;

export const TheoryHubView: React.FC<TheoryHubViewProps> = ({
  userProfile,
  selectedLevel,
  onChangeLevel,
  onOpenGrammar,
  onOpenVocab,
  onOpenKanji,
  onContinueStudy,
  grammars,
  onSelectGrammarItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const benchmarks = BENCHMARK_TOTALS[selectedLevel] || BENCHMARK_TOTALS.N4;

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

  const completedMap: Record<string, number> = {
    vocab: vocabCompleted,
    grammar: grammarCompleted,
    kanji: kanjiCompleted,
  };
  const totalMap: Record<string, number> = {
    vocab: benchmarks.vocab,
    grammar: benchmarks.grammar,
    kanji: benchmarks.kanji,
  };

  const subjectHandlers: Record<string, () => void> = {
    vocab: onOpenVocab,
    grammar: onOpenGrammar,
    kanji: onOpenKanji,
  };

  const continueLabel = useMemo(() => {
    if (selectedLevel === 'N4') return `${selectedLevel} · Bài 1 · Từ vựng`;
    if (selectedLevel === 'N5') return `${selectedLevel} · Bài 1 · Từ vựng`;
    return `${selectedLevel} · Bài 1 · Lý thuyết`;
  }, [selectedLevel]);

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

  const streak = userProfile.streak || 0;
  const totalDone = vocabCompleted + grammarCompleted + kanjiCompleted;
  const totalAll = benchmarks.vocab + benchmarks.grammar + benchmarks.kanji;
  const overallPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      className="w-full max-w-xl mx-auto px-4 pt-2 pb-28 text-slate-100 select-none">

      {/* ── Level pills ── */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-0.5 no-scrollbar">
        {JLPT_LEVELS.map(lvl => {
          const active = lvl === selectedLevel;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => onChangeLevel(lvl)}
              style={active ? {
                background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                boxShadow: '0 2px 12px rgba(99,102,241,0.45)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          );
        })}

        {/* streak chip — right side */}
        {streak > 0 && (
          <div className="ml-auto shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Flame size={12} className="text-amber-400" />
            {streak}
          </div>
        )}
      </div>

      {/* ── Overall progress bar ── */}
      <div className="mb-3">
        <div className="flex items-end justify-between mb-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Tổng tiến độ {selectedLevel}</span>
          <span className="text-[11px] font-bold text-slate-300">{overallPct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${overallPct}%`,
              background: 'linear-gradient(90deg,#6366F1,#A855F7,#14B8A6)',
            }}
          />
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="relative mb-3" ref={searchContainerRef}>
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: isSearchFocused
              ? '1px solid rgba(99,102,241,0.55)'
              : '1px solid rgba(255,255,255,0.08)',
            boxShadow: isSearchFocused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
          }}
        >
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Tìm ngữ pháp, từ vựng, kanji…"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50 p-2"
            style={{ background: '#141e30', border: '1px solid rgba(255,255,255,0.1)' }}>
            {searchResults.length === 0 ? (
              <p className="py-5 text-center text-xs text-slate-500">
                Không tìm thấy kết quả cho &quot;{searchQuery}&quot;
              </p>
            ) : (
              <div className="space-y-0.5">
                {searchResults.map(g => (
                  <button key={g.id} type="button"
                    onClick={() => { onSelectGrammarItem?.(g); setIsSearchFocused(false); setSearchQuery(''); }}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-violet-400 truncate">{g.structure}</div>
                      <div className="text-xs text-slate-400 truncate">{g.meaning}</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                      style={{ background: 'rgba(168,85,247,0.15)', color: '#C084FC' }}>
                      {g.level}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Continue card ── */}
      <button
        type="button"
        onClick={onContinueStudy}
        className="w-full mb-3 cursor-pointer group"
      >
        <div
          className="relative rounded-2xl p-3 flex items-center gap-3 overflow-hidden transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 100%)',
            border: '1px solid rgba(99,102,241,0.30)',
          }}
        >
          {/* glow blob */}
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />

          <div className="shrink-0 group-hover:scale-105 transition-transform">
            <ShibaStudyMascot size={52} />
          </div>

          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Zap size={11} className="text-violet-400" />
              <span className="text-[10px] font-black text-violet-400 tracking-widest uppercase">Tiếp tục học</span>
            </div>
            <div className="text-[15px] font-bold text-white truncate">{continueLabel}</div>
          </div>

          <div
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
            style={{ background: '#6366F1', boxShadow: '0 4px 14px rgba(99,102,241,0.45)' }}
          >
            <Play size={16} className="fill-white text-white ml-0.5" />
          </div>
        </div>
      </button>

      {/* ── 3 Subject cards ── */}
      <div className="space-y-2">
        {SUBJECTS.map(({ key, label, sub, Icon, accent, bg, border, glow }) => {
          const done = completedMap[key] ?? 0;
          const total = totalMap[key] ?? 1;
          const pct = Math.round((done / total) * 100);
          const handler = subjectHandlers[key];

          return (
            <button
              key={key}
              type="button"
              onClick={handler}
              className="w-full text-left cursor-pointer group"
            >
              <div
                className="relative rounded-2xl p-3 flex items-center gap-3 overflow-hidden transition-all duration-200"
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                }}
              >
                {/* ambient glow */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }} />

                {/* icon */}
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
                  style={{ background: `rgba(${accent.slice(1).match(/.{2}/g)!.map(x => parseInt(x,16)).join(',')},0.18)` }}
                >
                  <Icon size={22} style={{ color: accent }} />
                </div>

                {/* text + progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[15px] font-bold text-white">{label}</span>
                    <span className="text-xs font-semibold" style={{ color: accent }}>{done}/{total} · {pct}%</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1.5 truncate">{sub}</div>
                  {/* thin progress bar */}
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: accent }}
                    />
                  </div>
                </div>

                <ChevronRight size={16} className="shrink-0 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TheoryHubView;
