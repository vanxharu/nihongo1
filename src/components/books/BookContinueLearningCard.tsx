import React from 'react';
import { motion } from 'motion/react';
import { Play, Clock, Check, ArrowRight, BookOpen, Compass } from 'lucide-react';
import { StudyBook, StudyBookSavedProgress, StudyBookUnit } from '../../types';
import ShibaMascot from '../mascot/ShibaMascot';
import { BookCoverVisual } from './BookCoverVisual';

interface BookContinueLearningCardProps {
  lastSavedProgress: StudyBookSavedProgress | null;
  books: StudyBook[];
  onResumeSession: () => void;
  onExploreClick: () => void;
}

export const BookContinueLearningCard: React.FC<BookContinueLearningCardProps> = ({
  lastSavedProgress,
  books,
  onResumeSession,
  onExploreClick
}) => {
  if (lastSavedProgress) {
    const targetBook = books.find(b => b.id === lastSavedProgress.bookId);
    const targetUnit = targetBook?.units.find(u => u.id === lastSavedProgress.unitId);

    if (targetBook && targetUnit) {
      const answers = lastSavedProgress.answers || {};
      const answeredCount = Object.keys(answers).length;
      const totalQuestions = targetUnit.questions.length;
      const isComplete = totalQuestions > 0 && answeredCount >= totalQuestions;
      
      // Calculate unfinished index
      let unfinishedIdx = lastSavedProgress.questionIndex || 0;
      for (let i = 0; i < targetUnit.questions.length; i++) {
        const q = targetUnit.questions[i];
        if (answers[q.id] === undefined) {
          unfinishedIdx = i;
          break;
        }
      }

      const progressPercent = totalQuestions > 0 ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100)) : 0;

      return (
        <motion.div
          id="continue-learning-section"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 shadow-[0_4px_30px_rgba(244,63,94,0.12)] relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-40 bg-rose-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            {/* Left: Book Cover preview & Info */}
            <div className="flex items-start sm:items-center gap-4 w-full lg:w-auto">
              {/* Mini Book Cover */}
              <div className="w-16 h-22 sm:w-20 sm:h-28 shrink-0 shadow-lg rounded-lg overflow-hidden border border-white/20">
                <BookCoverVisual book={targetBook} size="sm" isCompleted={isComplete} className="w-full h-full" />
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    {isComplete ? 'VỪA HOÀN THÀNH' : 'ĐANG HỌC DỞ'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(lastSavedProgress.updatedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                  {targetBook.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{targetUnit.title}</span>
                </p>

                {/* Progress bar */}
                <div className="mt-3 flex items-center gap-3 max-w-md">
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-rose-500 to-pink-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-200 shrink-0 font-mono">
                    {progressPercent}% ({answeredCount}/{totalQuestions} câu)
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Action CTA button */}
            <div className="w-full lg:w-auto flex items-center justify-end">
              <button
                id="resume-study-btn"
                type="button"
                onClick={onResumeSession}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer ${
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-400 hover:to-pink-500 shadow-rose-500/35 hover:shadow-rose-500/45'
                }`}
              >
                {isComplete ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Xem lại bài học</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Tiếp tục học (Câu #{unfinishedIdx + 1})</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4 text-white/80" />
              </button>
            </div>
          </div>
        </motion.div>
      );
    }
  }

  // Welcome state if user has not started any book yet
  return (
    <motion.div
      id="welcome-learning-section"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden"
    >
      <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
        <div className="shrink-0 w-20 sm:w-24">
          <ShibaMascot pose="study" size="md" className="drop-shadow-lg" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            BẮT ĐẦU HÀNH TRÌNH JLPT
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Sẵn sàng chinh phục tiếng Nhật hôm nay?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg leading-relaxed">
            Chọn một cuốn giáo trình chuẩn bên dưới để bắt đầu làm bài tập, khoanh trắc nghiệm và xem giải thích chi tiết từng câu.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onExploreClick}
        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
      >
        <Compass className="w-4 h-4" />
        <span>Khám phá sách ôn thi</span>
      </button>
    </motion.div>
  );
};
