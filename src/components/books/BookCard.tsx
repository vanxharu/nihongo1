import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, HelpCircle, ArrowRight, Play, CheckCircle2, RotateCcw, Trash2, Users, Clock } from 'lucide-react';
import { StudyBook } from '../../types';
import { BookCoverVisual } from './BookCoverVisual';

interface BookCardProps {
  book: StudyBook;
  completedUnitsCount: number;
  totalUnitsCount: number;
  totalAnsweredQuestions: number;
  onOpenBookDetail: (book: StudyBook) => void;
  onQuickResume?: (book: StudyBook) => void;
  onDeleteBook: (bookId: string, title: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  completedUnitsCount,
  totalUnitsCount,
  totalAnsweredQuestions,
  onOpenBookDetail,
  onQuickResume,
  onDeleteBook
}) => {
  const isStarted = totalAnsweredQuestions > 0;
  const isCompleted = totalUnitsCount > 0 && completedUnitsCount >= totalUnitsCount;
  
  // Calculate progress percentage
  const totalQuestions = book.totalQuestions || Math.max(1, totalUnitsCount * 5);
  const progressPercent = Math.min(
    100,
    Math.round((totalAnsweredQuestions / totalQuestions) * 100)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpenBookDetail(book)}
      className="group relative rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/90 hover:bg-slate-850/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Top Cover Visual Section */}
      <div className="p-4 sm:p-5 pb-3 bg-gradient-to-b from-slate-850 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Subtle background blur accent matching book color */}
        <div className={`absolute inset-0 opacity-15 bg-gradient-to-br ${book.gradient} blur-xl pointer-events-none`} />

        {/* Action button to hide/delete book */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBook(book.id, book.title);
          }}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-black/40 hover:bg-rose-600/90 text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Ẩn sách này khỏi thư viện"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* The Realistic Book Cover Visual */}
        <div className="w-full max-w-[200px] sm:max-w-[220px] transition-transform duration-300 group-hover:scale-[1.03]">
          <BookCoverVisual book={book} size="md" isCompleted={isCompleted} />
        </div>
      </div>

      {/* Book Information Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Badges: Level & Category & Hours */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
              JLPT {book.level}
            </span>
            {book.category && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {book.category}
              </span>
            )}
            {book.estimatedHours && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-400 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                ~{book.estimatedHours}h
              </span>
            )}
          </div>

          {/* Book Title */}
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-rose-400 transition-colors line-clamp-2">
            {book.title}
          </h3>

          {/* Japanese original title */}
          <p className="text-xs text-slate-400 font-japanese mt-1 line-clamp-1">
            {book.japaneseTitle}
          </p>

          {/* Short description */}
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Bottom Section: Stats, Progress & CTA */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          {/* Quick Stats: Units & Questions */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-200 font-semibold">{totalUnitsCount}</strong> bài học
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-200 font-semibold">{book.totalQuestions}</strong> câu hỏi
            </span>
          </div>

          {/* Progress bar if started */}
          {isStarted ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  {isCompleted ? 'Đã hoàn thành sách' : `Tiến độ: ${progressPercent}%`}
                </span>
                <span className="text-slate-400 font-mono">
                  {completedUnitsCount}/{totalUnitsCount} bài
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Chưa bắt đầu học</span>
            </div>
          )}

          {/* Primary CTA Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onQuickResume && isStarted) {
                  onQuickResume(book);
                } else {
                  onOpenBookDetail(book);
                }
              }}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
                isCompleted
                  ? 'bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30'
                  : isStarted
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md shadow-rose-600/25'
                  : 'bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-200 border border-slate-700/80'
              }`}
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ôn lại sách</span>
                </>
              ) : isStarted ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Tiếp tục học</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Bắt đầu học</span>
                </>
              )}
              <ArrowRight className="w-3.5 h-3.5 text-white/70 ml-auto" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
