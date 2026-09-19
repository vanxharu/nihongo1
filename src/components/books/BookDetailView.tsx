import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  BookOpen,
  HelpCircle,
  Clock,
  Play,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  Award,
  Layers,
  FileText
} from 'lucide-react';
import { StudyBook, StudyBookUnit, StudyBookSavedProgress } from '../../types';
import { BookCoverVisual } from './BookCoverVisual';

interface BookDetailViewProps {
  book: StudyBook;
  onBackToLibrary: () => void;
  onSelectUnit: (unit: StudyBookUnit) => void;
  completedUnitsMap: Record<string, { answeredCount: number; total?: number; totalCount?: number; isCompleted: boolean }>;
  lastSavedProgress: StudyBookSavedProgress | null;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  onBackToLibrary,
  onSelectUnit,
  completedUnitsMap,
  lastSavedProgress
}) => {
  const [unitSearch, setUnitSearch] = useState('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('All');

  // Check if this is a weekly book (like Shin 500)
  const isShin500 = book.id === 'book_shin_nihongo_500_n4_n5';

  // Calculate book progress
  const totalUnits = book.units.length;
  let completedUnitsCount = 0;
  let totalAnsweredQuestions = 0;

  book.units.forEach((unit) => {
    const key = `${book.id}_${unit.id}`;
    const progress = completedUnitsMap[key];
    if (progress) {
      totalAnsweredQuestions += progress.answeredCount;
      if (progress.isCompleted) completedUnitsCount++;
    }
  });

  const totalQuestions = book.totalQuestions || Math.max(1, totalUnits * 5);
  const progressPercent = Math.min(
    100,
    Math.round((totalAnsweredQuestions / totalQuestions) * 100)
  );

  // Find next unfinished unit or resume unit
  const nextUnfinishedUnit = useMemo(() => {
    // If lastSavedProgress points to this book, prioritize that unit
    if (lastSavedProgress && lastSavedProgress.bookId === book.id) {
      const savedUnit = book.units.find((u) => u.id === lastSavedProgress.unitId);
      if (savedUnit) return savedUnit;
    }
    // Otherwise find first incomplete unit
    for (const unit of book.units) {
      const key = `${book.id}_${unit.id}`;
      const progress = completedUnitsMap[key];
      if (!progress || !progress.isCompleted) {
        return unit;
      }
    }
    return book.units[0];
  }, [book, completedUnitsMap, lastSavedProgress]);

  // Filter units by search & week filter
  const filteredUnits = useMemo(() => {
    return book.units.filter((unit) => {
      const matchesSearch =
        unit.title.toLowerCase().includes(unitSearch.toLowerCase()) ||
        unit.japaneseTitle.toLowerCase().includes(unitSearch.toLowerCase()) ||
        (unit.topic && unit.topic.toLowerCase().includes(unitSearch.toLowerCase())) ||
        (unit.pageRange && unit.pageRange.toLowerCase().includes(unitSearch.toLowerCase()));

      if (!matchesSearch) return false;

      if (isShin500 && selectedWeekFilter !== 'All') {
        const uNum = typeof unit.unitNumber === 'number' ? unit.unitNumber : parseInt(String(unit.unitNumber), 10);
        if (selectedWeekFilter === 'Week1' && (uNum < 1 || uNum > 7)) return false;
        if (selectedWeekFilter === 'Week2' && (uNum < 8 || uNum > 14)) return false;
        if (selectedWeekFilter === 'Week3' && (uNum < 15 || uNum > 21)) return false;
        if (selectedWeekFilter === 'Week4' && (uNum < 22 || uNum > 28)) return false;
      }

      return true;
    });
  }, [book.units, unitSearch, isShin500, selectedWeekFilter]);

  return (
    <div id="book-detail-page" className="max-w-7xl mx-auto px-3 sm:px-6 py-6 pb-28 text-slate-100">
      {/* Back button to library */}
      <div className="mb-6">
        <button
          type="button"
          id="btn-back-to-library"
          onClick={onBackToLibrary}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>← Quay lại Thư viện sách</span>
        </button>
      </div>

      {/* Book Hero Overview Card */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl mb-10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className={`absolute -top-24 -right-24 w-96 h-96 opacity-20 bg-gradient-to-br ${book.gradient} blur-3xl pointer-events-none`} />

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10">
          {/* Left: Authentic Book Cover */}
          <div className="shrink-0 w-48 sm:w-56 lg:w-64 drop-shadow-2xl">
            <BookCoverVisual book={book} size="lg" isCompleted={completedUnitsCount >= totalUnits && totalUnits > 0} />
          </div>

          {/* Right: Book Details, Stats & CTA */}
          <div className="flex-1 space-y-5 text-center lg:text-left">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                JLPT {book.level}
              </span>
              {book.category && (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {book.category}
                </span>
              )}
              {book.coverBadge && (
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {book.coverBadge}
                </span>
              )}
            </div>

            {/* Title & Japanese title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {book.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 font-japanese mt-1.5 font-medium">
                {book.japaneseTitle}
              </p>
            </div>

            {/* Author & Publisher */}
            <div className="text-xs text-slate-400 space-y-0.5">
              <p>
                <strong className="text-slate-300">Tác giả:</strong> {book.author}
              </p>
              <p>
                <strong className="text-slate-300">Nhà xuất bản:</strong> {book.publisher}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {book.description}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                  Số bài học
                </span>
                <p className="text-lg font-black text-white mt-0.5">{totalUnits} bài</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Tổng câu hỏi
                </span>
                <p className="text-lg font-black text-white mt-0.5">{book.totalQuestions} câu</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Thời lượng
                </span>
                <p className="text-lg font-black text-white mt-0.5">~{book.estimatedHours || 14} giờ</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  Tiến độ hoàn thành
                </span>
                <p className="text-lg font-black text-emerald-400 mt-0.5 font-mono">
                  {progressPercent}% <span className="text-xs font-normal text-slate-400">({completedUnitsCount}/{totalUnits})</span>
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {nextUnfinishedUnit && (
                <button
                  type="button"
                  id="btn-start-next-unit"
                  onClick={() => onSelectUnit(nextUnfinishedUnit)}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {totalAnsweredQuestions > 0
                      ? `Làm tiếp: ${nextUnfinishedUnit.title}`
                      : `Bắt đầu học: ${nextUnfinishedUnit.title}`}
                  </span>
                </button>
              )}

              {totalAnsweredQuestions > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectUnit(book.units[0])}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Học lại từ Bài 1</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book Content / Lesson List Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-rose-500" />
              <span>Danh Sách Bài Học ({book.units.length} bài)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn bài học để vào giao diện làm bài tập tương tác, khoanh trắc nghiệm & tra giải thích.
            </p>
          </div>

          {/* Search within lessons */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={unitSearch}
              onChange={(e) => setUnitSearch(e.target.value)}
              placeholder="Tìm bài học, chủ đề, ngữ pháp..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/70"
            />
          </div>
        </div>

        {/* Weekly filter if Shin 500 */}
        {isShin500 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'All', label: 'Tất cả 4 tuần (28 ngày)' },
              { id: 'Week1', label: 'Tuần 1 (Ngày 1 - 7)' },
              { id: 'Week2', label: 'Tuần 2 (Ngày 8 - 14)' },
              { id: 'Week3', label: 'Tuần 3 (Ngày 15 - 21)' },
              { id: 'Week4', label: 'Tuần 4 (Ngày 22 - 28)' },
            ].map((wk) => (
              <button
                key={wk.id}
                type="button"
                onClick={() => setSelectedWeekFilter(wk.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  selectedWeekFilter === wk.id
                    ? 'bg-rose-600 text-white shadow-sm border border-rose-500'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
                }`}
              >
                {wk.label}
              </button>
            ))}
          </div>
        )}

        {/* Lessons list rows */}
        <div className="space-y-3">
          {filteredUnits.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
              Không tìm thấy bài học phù hợp với từ khóa "{unitSearch}".
            </div>
          ) : (
            filteredUnits.map((unit, idx) => {
              const key = `${book.id}_${unit.id}`;
              const progress = completedUnitsMap[key];
              const answeredCount = progress?.answeredCount || 0;
              const totalQ = unit.questions.length;
              const isUnitComplete = progress?.isCompleted || (totalQ > 0 && answeredCount >= totalQ);
              const isInProgress = answeredCount > 0 && !isUnitComplete;

              return (
                <div
                  key={unit.id}
                  onClick={() => onSelectUnit(unit)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer group ${
                    isUnitComplete
                      ? 'bg-slate-900/60 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-slate-900'
                      : isInProgress
                      ? 'bg-slate-900/90 border-rose-500/30 hover:border-rose-500/50 hover:bg-slate-850 shadow-sm'
                      : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850/80'
                  }`}
                >
                  {/* Left: Unit Number & Titles */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Index Number Badge */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-inner ${
                        isUnitComplete
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/80'
                      }`}
                    >
                      {isUnitComplete ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : (
                        String(unit.unitNumber || idx + 1).padStart(2, '0')
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors leading-snug">
                          {unit.title}
                        </h3>
                        {unit.pageRange && (
                          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                            {unit.pageRange}
                          </span>
                        )}
                      </div>

                      {unit.topic && (
                        <p className="text-xs text-slate-300 line-clamp-1 font-medium">
                          {unit.topic}
                        </p>
                      )}

                      {unit.description && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {unit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Meta, Status & Button */}
                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                    {/* Question count & time */}
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-semibold text-slate-300">
                        {totalQ} câu hỏi
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ~{Math.max(5, Math.round(totalQ * 1.2))} phút
                      </p>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isUnitComplete ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã xong ({answeredCount}/{totalQ})</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                          <span>Đang làm ({answeredCount}/{totalQ})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium">
                          ○ Chưa học
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        isUnitComplete
                          ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                          : isInProgress
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                          : 'bg-slate-800 group-hover:bg-rose-600 group-hover:text-white text-slate-300 border border-slate-700/80'
                      }`}
                    >
                      {isUnitComplete ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                          <span>Ôn lại</span>
                        </>
                      ) : isInProgress ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Làm tiếp</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Bắt đầu</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
