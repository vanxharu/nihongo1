import React from 'react';
import { Search, X, RotateCcw, Filter, Layers } from 'lucide-react';
import { JLPTLevel } from '../../types';

export type BookCategoryFilter = 'All' | 'Vocabulary' | 'Grammar' | 'Reading' | 'Mock Test';

interface BookFiltersAndSearchProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedLevel: JLPTLevel | 'All';
  onLevelChange: (level: JLPTLevel | 'All') => void;
  selectedCategory: BookCategoryFilter;
  onCategoryChange: (cat: BookCategoryFilter) => void;
  totalFilteredCount: number;
  deletedBooksCount: number;
  onRestoreBooks: () => void;
}

const JLPT_LEVELS: Array<{ id: JLPTLevel | 'All'; label: string }> = [
  { id: 'All', label: 'Tất cả' },
  { id: 'N5', label: 'N5' },
  { id: 'N4', label: 'N4 (Đang học)' },
  { id: 'N3', label: 'N3' },
  { id: 'N2', label: 'N2' },
  { id: 'N1', label: 'N1' },
];

const CATEGORIES: Array<{ id: BookCategoryFilter; label: string; iconLabel: string }> = [
  { id: 'All', label: 'Tất cả kỹ năng', iconLabel: '✨' },
  { id: 'Vocabulary', label: 'Từ vựng (Goi)', iconLabel: '📖' },
  { id: 'Grammar', label: 'Ngữ pháp (Bunpou)', iconLabel: '🧩' },
  { id: 'Reading', label: 'Đọc hiểu (Dokkai)', iconLabel: '📜' },
  { id: 'Mock Test', label: 'Luyện đề (500 Câu)', iconLabel: '🎯' },
];

export const BookFiltersAndSearch: React.FC<BookFiltersAndSearchProps> = ({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  selectedCategory,
  onCategoryChange,
  totalFilteredCount,
  deletedBooksCount,
  onRestoreBooks
}) => {
  return (
    <div className="space-y-4 mb-8 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-sm">
      {/* Top row: Search input & Restore button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="search-books-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm sách, tác giả, bài học, chủ đề..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/70 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400">
          <span>
            Tìm thấy <strong className="text-white font-bold">{totalFilteredCount}</strong> cuốn sách
          </span>

          {deletedBooksCount > 0 && (
            <button
              type="button"
              onClick={onRestoreBooks}
              className="text-xs text-rose-400 hover:text-rose-300 underline transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Khôi phục {deletedBooksCount} sách
            </button>
          )}
        </div>
      </div>

      {/* Filter Row 1: JLPT Level Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Cấp độ:
        </span>
        {JLPT_LEVELS.map((lvl) => {
          const isActive = selectedLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onLevelChange(lvl.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-500'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/70'
              }`}
            >
              {lvl.label}
            </button>
          );
        })}
      </div>

      {/* Filter Row 2: Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-800/70">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Layers className="w-3.5 h-3.5" />
          Kỹ năng:
        </span>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{cat.iconLabel}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
