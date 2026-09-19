import React from 'react';
import { BookOpen, ChevronLeft, Sparkles, Trophy } from 'lucide-react';
import { JLPTLevel } from '../../types';

interface BookLibraryHeaderProps {
  onBack?: () => void;
  targetLevel?: JLPTLevel;
  totalBooksCount: number;
}

export const BookLibraryHeader: React.FC<BookLibraryHeaderProps> = ({
  onBack,
  targetLevel = 'N4',
  totalBooksCount
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        {onBack && (
          <button
            type="button"
            id="btn-study-books-back"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-semibold mb-3.5 cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Luyện tập</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wide">
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            THƯ VIỆN GIÁO TRÌNH JLPT CHÍNH THỨC
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {totalBooksCount} giáo trình
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
          Sách Ôn Thi Tiếng Nhật
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Học từ vựng, ngữ pháp, đọc hiểu và luyện đề theo từng cấp độ JLPT. Làm bài trực tiếp trên giáo trình chuẩn với chế độ khoanh trắc nghiệm, viết mực ghi chú & tra giải thích chi tiết.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800/90 px-4 py-2.5 rounded-2xl shadow-sm shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-black text-sm shadow-md">
          {targetLevel}
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Mục tiêu học tập
          </p>
          <p className="text-sm font-bold text-white flex items-center gap-1">
            <span>Cấp độ {targetLevel}</span>
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </p>
        </div>
      </div>
    </div>
  );
};
