import React, { useMemo } from 'react';
import { ChevronLeft, Lock, FileText, ChevronRight, BookOpen, CheckCircle } from 'lucide-react';
import { JLPTLevel, UserProfile, GrammarItem } from '../../types';
import JlptMascot from './JlptMascot';
import { LESSON_THEMES_MAP } from '../grammarData';
import { deduplicateGrammars, getGrammarStatusWithAliases } from '../../utils/grammarDeduplicator';

interface GrammarLessonListViewProps {
  level: JLPTLevel;
  userProfile: UserProfile;
  grammars: GrammarItem[];
  onBackToOverview: () => void;
  onSelectLesson: (lessonNumber: number) => void;
}

export const GrammarLessonListView: React.FC<GrammarLessonListViewProps> = ({
  level,
  userProfile,
  grammars,
  onBackToOverview,
  onSelectLesson
}) => {
  // Determine lesson range
  const isN4 = level === 'N4';
  const isN5 = level === 'N5';
  const startLesson = isN4 ? 26 : (isN5 ? 1 : 1);
  const endLesson = isN4 ? 50 : (isN5 ? 25 : 20);
  const totalLessons = endLesson - startLesson + 1;

  // Level info titles
  const levelTitle = isN4
    ? 'Minna no Nihongo II (第26〜50課)'
    : isN5
    ? 'Minna no Nihongo I (第1〜25課)'
    : `Ngữ pháp ${level} chuyên sâu`;

  // Filter and deduplicate grammars belonging to this level
  const levelGrammars = useMemo(() => {
    return deduplicateGrammars(grammars.filter(g => g.level === level));
  }, [grammars, level]);
  const totalGrammarsInLevel = levelGrammars.length || (isN4 ? 90 : (isN5 ? 120 : 100));

  // Count completed grammars for this level
  const completedCount = levelGrammars.filter(g => {
    const status = getGrammarStatusWithAliases(userProfile.grammarStatus, g);
    if (!status) return false;
    if (typeof status === 'boolean') return status;
    return Boolean(status.correctCount > 0 || status.state === 'mastered' || status.state === 'learned');
  }).length;

  const progressPercent = Math.min(100, Math.round((completedCount / totalGrammarsInLevel) * 100));

  // Build lesson cards array
  const lessonItems = [];
  const themesForLevel = LESSON_THEMES_MAP[level] || {};

  for (let lNum = startLesson; lNum <= endLesson; lNum++) {
    const lessonGrammars = levelGrammars.filter(g => g.lessonNumber === lNum);
    const grammarCount = lessonGrammars.length > 0 ? lessonGrammars.length : (isN4 ? 4 : 4);
    const title = themesForLevel[lNum] || `Chuyên đề ngữ pháp bài ${lNum}`;

    // Completion status
    const lessonCompletedGrammars = lessonGrammars.filter(g => {
      const status = getGrammarStatusWithAliases(userProfile.grammarStatus, g);
      if (!status) return false;
      if (typeof status === 'boolean') return status;
      return Boolean(status.correctCount > 0 || status.state === 'mastered');
    }).length;

    const isCompleted = lessonGrammars.length > 0 && lessonCompletedGrammars === lessonGrammars.length;

    // Lock rule: First lesson of level is ALWAYS unlocked.
    // Subsequent lessons are unlocked if previous lesson is partially practiced, OR if user has completed it, OR user target matches.
    // For smooth learning, we make the first 5 lessons immediately unlocked, and subsequent unlocked as progress continues.
    const isFirstLesson = lNum === startLesson;
    const isUnlocked = isFirstLesson || lNum <= startLesson + 2 || Boolean(userProfile.completedLessons?.includes(String(lNum))) || Boolean(userProfile.completedLessons?.includes(lNum)) || (lessonCompletedGrammars > 0);
    const isCurrent = isFirstLesson && completedCount === 0;

    lessonItems.push({
      lessonNumber: lNum,
      japaneseTitle: `第${lNum}課`,
      vietnameseTitle: `Bài ${lNum}`,
      theme: title,
      grammarCount,
      isUnlocked,
      isCurrent,
      isCompleted
    });
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 animate-fadeIn font-sans text-slate-100">
      {/* Breadcrumb Back Link */}
      <button
        type="button"
        onClick={onBackToOverview}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium mb-3 cursor-pointer transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Lý thuyết</span>
      </button>

      {/* Level Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="inline-block px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-600/40 text-xs font-bold mb-1.5">
            {level}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
            <JlptMascot size={32} />
            <span>{levelTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">{totalLessons} bài học</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#161b22] border border-[#30363d] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-2">
          <span className="text-slate-300">Tiến độ tổng</span>
          <span className="text-slate-400 font-mono">
            <strong className="text-blue-400">{completedCount}</strong>/{totalGrammarsInLevel} mẫu · {progressPercent}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2-Column Grid of Lessons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {lessonItems.map((item) => {
          const isAvailable = item.isUnlocked;

          return (
            <div
              key={item.lessonNumber}
              onClick={() => {
                if (isAvailable) {
                  onSelectLesson(item.lessonNumber);
                }
              }}
              className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                isAvailable
                  ? item.isCurrent
                    ? 'bg-[#161b22] border-blue-500/70 hover:border-blue-400 cursor-pointer shadow-sm ring-1 ring-blue-500/30'
                    : 'bg-[#161b22] hover:bg-[#1c2128] border-[#30363d] hover:border-slate-500 cursor-pointer shadow-sm'
                  : 'bg-[#12161c] border-[#252b33] opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Left: Icon & Titles */}
              <div className="flex items-start gap-3 min-w-0 pr-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isAvailable
                      ? item.isCurrent
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                        : 'bg-slate-800/80 text-slate-300 border border-slate-700'
                      : 'bg-slate-900/80 text-slate-500 border border-slate-800'
                  }`}
                >
                  {isAvailable ? (
                    item.isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <span>{item.japaneseTitle}</span>
                  </div>
                  <div className="text-sm font-bold text-white tracking-tight truncate">
                    {item.vietnameseTitle}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {item.theme}
                  </div>
                </div>
              </div>

              {/* Right: Grammar Count & Action */}
              <div className="shrink-0 flex items-center gap-1 text-xs text-slate-400 font-medium">
                <span>{item.grammarCount} mẫu câu</span>
                {isAvailable ? (
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-600 ml-1" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GrammarLessonListView;
