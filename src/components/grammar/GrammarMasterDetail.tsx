import React, { useEffect, useMemo } from 'react';
import { ChevronLeft, Lock, PenTool } from 'lucide-react';
import { JLPTLevel, UserProfile, GrammarItem } from '../../types';
import { LESSON_THEMES_MAP } from '../grammarData';
import { deduplicateGrammars, getGrammarStatusWithAliases } from '../../utils/grammarDeduplicator';

interface Props {
  level: JLPTLevel;
  userProfile: UserProfile;
  grammars: GrammarItem[];
  lessonNumber: number;
  selectedGrammar: GrammarItem | null;
  onBack: () => void;
  onSelectLesson: (n: number) => void;
  onSelectGrammar: (g: GrammarItem) => void;
  onPractice: (g: GrammarItem) => void;
  /** Column 3: rendered by the parent (GrammarPointDetailView). */
  detail: React.ReactNode;
}

const isDone = (profile: UserProfile, g: GrammarItem) => {
  const s = getGrammarStatusWithAliases(profile.grammarStatus, g);
  if (!s) return false;
  if (typeof s === 'boolean') return s;
  return Boolean(s.correctCount > 0 || s.state === 'mastered' || s.state === 'learned');
};

export const GrammarMasterDetail: React.FC<Props> = ({
  level, userProfile, grammars, lessonNumber, selectedGrammar, onBack, onSelectLesson, onSelectGrammar, onPractice, detail
}) => {
  const start = level === 'N4' ? 26 : 1;
  const end = level === 'N4' ? 50 : level === 'N5' ? 25 : 20;
  const themes = LESSON_THEMES_MAP[level] || {};

  const levelGrammars = useMemo(() => deduplicateGrammars(grammars.filter(g => g.level === level)), [grammars, level]);
  const lessons = useMemo(() => {
    const out = [];
    for (let n = start; n <= end; n++) {
      const items = levelGrammars.filter(g => g.lessonNumber === n || g.lessonName?.includes(`Bài ${n}`));
      out.push({ n, items });
    }
    return out;
  }, [levelGrammars, start, end]);

  const current = lessons.find(l => l.n === lessonNumber)?.items ?? [];

  // Keep column 3 filled: if the selected point isn't in this lesson, pick its first point.
  useEffect(() => {
    if (current.length && !current.some(g => g.id === selectedGrammar?.id)) onSelectGrammar(current[0]);
  }, [lessonNumber, current, selectedGrammar, onSelectGrammar]);

  const col = 'bg-white border border-[#EADFD2] rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-200px)]';

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-5 font-sans text-[#3a2a22]">
      <div className="flex items-center gap-3 mb-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-[#C8344B] font-medium cursor-pointer">
          <ChevronLeft className="w-4 h-4" />Lý thuyết
        </button>
        <h1 className="text-xl font-bold">Ngữ pháp {level}</h1>
      </div>

      <div className="grid gap-[14px]" style={{ gridTemplateColumns: '230px 250px 1fr' }}>
        {/* Column 1: lessons */}
        <div className={col}>
          <div className="overflow-y-auto p-2 space-y-1">
            {lessons.map(({ n, items }) => {
              const done = items.filter(g => isDone(userProfile, g)).length;
              const pct = items.length ? Math.round((done / items.length) * 100) : 0;
              const unlocked = n <= start + 2 || done > 0 || Boolean(userProfile.completedLessons?.includes(String(n)));
              const active = n === lessonNumber;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onSelectLesson(n)}
                  className={`w-full text-left rounded-xl px-3 py-2 border transition-colors ${
                    active ? 'bg-[#FDECEF] border-[#C8344B]' : 'bg-transparent border-transparent hover:bg-[#FAF5EE]'
                  } ${unlocked ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#8a7566]">
                    <span>第{n}課 · Bài {n}</span>
                    {!unlocked && <Lock className="w-3 h-3" />}
                  </div>
                  <div className="text-sm font-bold truncate">{themes[n] || `Bài ${n}`}</div>
                  <div className="h-1 mt-1.5 bg-[#EADFD2] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C8344B]" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: points of the lesson */}
        <div className={col}>
          <div className="overflow-y-auto p-2 space-y-1 flex-1">
            {current.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelectGrammar(g)}
                className={`w-full text-left rounded-xl px-3 py-2 border cursor-pointer transition-colors ${
                  g.id === selectedGrammar?.id ? 'bg-[#FDECEF] border-[#C8344B]' : 'border-transparent hover:bg-[#FAF5EE]'
                }`}
              >
                <div className="text-sm font-bold font-japanese truncate">{g.structure}</div>
                <div className="text-xs text-[#8a7566] truncate">{g.meaning}</div>
              </button>
            ))}
            {!current.length && <div className="p-3 text-sm text-[#8a7566]">Bài này chưa có mẫu câu.</div>}
          </div>
          {current.length > 0 && (
            <div className="p-2 border-t border-[#EADFD2]">
              <button
                type="button"
                onClick={() => onPractice(selectedGrammar ?? current[0])}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C8344B] hover:bg-[#b02c41] text-white text-sm font-bold py-2 cursor-pointer"
              >
                <PenTool className="w-4 h-4" />Làm bài tập bài {lessonNumber}
              </button>
            </div>
          )}
        </div>

        {/* Column 3: detail */}
        <div className={`${col} bg-[#FAF5EE]`}>
          <div className="overflow-y-auto">{detail}</div>
        </div>
      </div>
    </div>
  );
};

export default GrammarMasterDetail;
