import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, BookOpen } from 'lucide-react';
import { StudyBook, StudyBookSavedProgress, JLPTLevel } from '../../types';
import { BookLibraryHeader } from './BookLibraryHeader';
import { BookContinueLearningCard } from './BookContinueLearningCard';
import { BookFiltersAndSearch, BookCategoryFilter } from './BookFiltersAndSearch';
import { BookCard } from './BookCard';
import ShibaMascot from '../mascot/ShibaMascot';

interface BookLibraryViewProps {
  books: StudyBook[];
  targetLevel?: JLPTLevel;
  lastSavedProgress: StudyBookSavedProgress | null;
  completedUnitsMap: Record<string, { answeredCount: number; total?: number; totalCount?: number; isCompleted: boolean }>;
  deletedBookIds: string[];
  onBack?: () => void;
  onOpenBookDetail: (book: StudyBook) => void;
  onResumeSession: () => void;
  onQuickResumeBook: (book: StudyBook) => void;
  onDeleteBook: (bookId: string, title: string) => void;
  onRestoreBooks: () => void;
}

export const BookLibraryView: React.FC<BookLibraryViewProps> = ({
  books,
  targetLevel = 'N4',
  lastSavedProgress,
  completedUnitsMap,
  deletedBookIds,
  onBack,
  onOpenBookDetail,
  onResumeSession,
  onQuickResumeBook,
  onDeleteBook,
  onRestoreBooks
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // User prompt: "Level hiện tại của người dùng: N4 phải được highlight mặc định."
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | 'All'>(targetLevel || 'N4');
  const [selectedCategory, setSelectedCategory] = useState<BookCategoryFilter>('All');

  // Filter books based on search, level, category, and deletedBookIds
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Exclude deleted/hidden books
      if (deletedBookIds.includes(book.id)) return false;

      // Filter by Level
      if (selectedLevel !== 'All' && book.level !== selectedLevel) {
        return false;
      }

      // Filter by Category
      if (selectedCategory !== 'All' && book.category !== selectedCategory) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          book.title.toLowerCase().includes(q) ||
          book.japaneseTitle.toLowerCase().includes(q) ||
          book.description.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          (book.category && book.category.toLowerCase().includes(q)) ||
          book.units.some((u) => u.title.toLowerCase().includes(q) || (u.topic && u.topic.toLowerCase().includes(q)));

        if (!matches) return false;
      }

      return true;
    });
  }, [books, deletedBookIds, selectedLevel, selectedCategory, searchQuery]);

  const handleExploreScroll = () => {
    const el = document.getElementById('books-grid-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="study-books-catalog" className="max-w-7xl mx-auto px-3 sm:px-6 py-6 pb-28 text-slate-100">
      {/* 1. Hero Header */}
      <BookLibraryHeader
        onBack={onBack}
        targetLevel={targetLevel}
        totalBooksCount={books.filter((b) => !deletedBookIds.includes(b.id)).length}
      />

      {/* 2. Continue Learning Card (or Welcome Card) */}
      <BookContinueLearningCard
        lastSavedProgress={lastSavedProgress}
        books={books}
        onResumeSession={onResumeSession}
        onExploreClick={handleExploreScroll}
      />

      {/* 3. Search & Filter Bar */}
      <BookFiltersAndSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        totalFilteredCount={filteredBooks.length}
        deletedBooksCount={deletedBookIds.length}
        onRestoreBooks={onRestoreBooks}
      />

      {/* 4. Book Cards Grid */}
      <div id="books-grid-section" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rose-500" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {selectedLevel === 'All' ? 'Tất cả giáo trình JLPT' : `Giáo trình JLPT ${selectedLevel}`}
              {selectedCategory !== 'All' && ` • ${selectedCategory}`}
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {filteredBooks.length} cuốn sách
          </span>
        </div>

        {filteredBooks.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 sm:p-14 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center justify-center gap-4 my-6"
          >
            <div className="w-24 sm:w-28">
              <ShibaMascot pose="curious" size="md" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white mb-1">
                Không tìm thấy sách phù hợp
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {selectedLevel !== 'All'
                  ? `Chưa có sách nào cho bộ lọc cấp độ ${selectedLevel}${selectedCategory !== 'All' ? ` và kỹ năng ${selectedCategory}` : ''}.`
                  : 'Không có cuốn sách nào khớp với từ khóa tìm kiếm của bạn.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('All');
                setSelectedCategory('All');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc & xem tất cả sách</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            <AnimatePresence>
              {filteredBooks.map((book) => {
                // Calculate book progress from completedUnitsMap
                let completedUnitsCount = 0;
                let totalAnsweredQuestions = 0;

                book.units.forEach((u) => {
                  const key = `${book.id}_${u.id}`;
                  const progress = completedUnitsMap[key];
                  if (progress) {
                    totalAnsweredQuestions += progress.answeredCount;
                    if (progress.isCompleted) completedUnitsCount++;
                  }
                });

                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    completedUnitsCount={completedUnitsCount}
                    totalUnitsCount={book.units.length}
                    totalAnsweredQuestions={totalAnsweredQuestions}
                    onOpenBookDetail={onOpenBookDetail}
                    onQuickResume={onQuickResumeBook}
                    onDeleteBook={onDeleteBook}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
