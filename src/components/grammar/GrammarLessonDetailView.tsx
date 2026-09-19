import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, PenTool, Eye, EyeOff } from 'lucide-react';
import { JLPTLevel, UserProfile, GrammarItem } from '../../types';
import JlptMascot from './JlptMascot';
import { LESSON_THEMES_MAP } from '../grammarData';
import { deduplicateGrammars } from '../../utils/grammarDeduplicator';

interface GrammarLessonDetailViewProps {
  level: JLPTLevel;
  lessonNumber: number;
  grammars: GrammarItem[];
  userProfile: UserProfile;
  showFurigana: boolean;
  onToggleFurigana: () => void;
  onBackToLessonList: () => void;
  onSelectGrammar: (grammar: GrammarItem) => void;
  onStartPractice: (grammar: GrammarItem) => void;
  onSelectNextLesson?: (nextLessonNumber: number) => void;
}

export const GrammarLessonDetailView: React.FC<GrammarLessonDetailViewProps> = ({
  level,
  lessonNumber,
  grammars,
  userProfile,
  showFurigana,
  onToggleFurigana,
  onBackToLessonList,
  onSelectGrammar,
  onStartPractice,
  onSelectNextLesson
}) => {
  const isN4 = level === 'N4';
  const isN5 = level === 'N5';
  const levelTitle = isN4
    ? 'Minna no Nihongo II (第26〜50課)'
    : isN5
    ? 'Minna no Nihongo I (第1〜25課)'
    : `Ngữ pháp ${level}`;

  const themesForLevel = LESSON_THEMES_MAP[level] || {};
  const currentTheme = themesForLevel[lessonNumber] || `Bài ${lessonNumber}`;

  // Next lesson check
  const maxLesson = isN4 ? 50 : (isN5 ? 25 : 53);
  const hasNextLesson = lessonNumber < maxLesson;
  const nextLessonNumber = lessonNumber + 1;
  const nextLessonTheme = themesForLevel[nextLessonNumber] || `Bài ${nextLessonNumber}`;

  // Filter and deduplicate grammars belonging to this lesson
  const rawLessonGrammars = useMemo(() => {
    return grammars.filter(
      g => g.level === level && (g.lessonNumber === lessonNumber || g.lessonName?.includes(`Bài ${lessonNumber}`))
    );
  }, [grammars, level, lessonNumber]);

  let lessonGrammars = useMemo(() => {
    return deduplicateGrammars(rawLessonGrammars);
  }, [rawLessonGrammars]);

  // Fallback if specific lesson has 0 grammars loaded
  if (lessonGrammars.length === 0) {
    lessonGrammars = [
      {
        id: `g_${level}_${lessonNumber}_1`,
        lessonNumber,
        lessonName: `Bài ${lessonNumber}`,
        structure: 'TTT + んです',
        meaning: 'Nhấn mạnh ý muốn nói/giải thích',
        explanation: 'Dùng khi muốn giải thích lý do, bộc lộ cảm xúc hoặc hỏi han xác nhận thông tin.',
        exampleSentence: 'かおがあかいですね。―― はずかしいんです。',
        exampleTranslation: 'Mặt bạn đỏ nhỉ. — Vì tôi ngượng ấy mà.',
        level,
        wordsToReorder: ['かおがあかいですね', 'はずかしいんです'],
        correctSentence: 'かおがあかいですね。はずかしいんです。'
      }
    ];
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 animate-fadeIn font-sans text-slate-100">
      {/* Top Bar: Back button & Next Lesson button */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          type="button"
          onClick={onBackToLessonList}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        {hasNextLesson && onSelectNextLesson && (
          <button
            type="button"
            onClick={() => onSelectNextLesson(nextLessonNumber)}
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors truncate max-w-[240px] sm:max-w-none"
          >
            <span>Bài {nextLessonNumber} · {nextLessonTheme}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        )}
      </div>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#21262d]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
            <JlptMascot size={32} />
            <span>{levelTitle} - 第{lessonNumber}課</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Bài {lessonNumber} · {currentTheme}
          </p>
        </div>

        {/* Furigana Toggle Button */}
        <button
          type="button"
          onClick={onToggleFurigana}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm self-start sm:self-auto ${
            showFurigana
              ? 'bg-purple-950/70 border-purple-600/60 text-purple-200'
              : 'bg-[#161b22] border-[#30363d] text-slate-400 hover:text-slate-200'
          }`}
        >
          {showFurigana ? <Eye className="w-3.5 h-3.5 text-purple-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Furigana</span>
        </button>
      </div>

      {/* 2-Column Grid of Grammar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {lessonGrammars.map((grammar) => {
          return (
            <div
              key={grammar.id}
              onClick={() => onSelectGrammar(grammar)}
              className="p-4 rounded-xl bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-blue-500/60 transition-all duration-200 cursor-pointer shadow-sm group flex items-center justify-between gap-3"
            >
              {/* Left: Structure & Meaning */}
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-white group-hover:text-blue-300 transition-colors font-japanese tracking-tight truncate">
                  {grammar.structure}
                </div>
                <div className="text-xs text-slate-400 truncate mt-1">
                  {grammar.meaning}
                </div>
              </div>

              {/* Right: Chevron & Practice Button */}
              <div className="flex items-center gap-2 shrink-0">
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartPractice(grammar);
                  }}
                  title="Luyện tập ngữ pháp này"
                  className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GrammarLessonDetailView;
