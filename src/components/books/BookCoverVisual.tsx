import React from 'react';
import { BookOpen, Disc3, Sparkles, CheckCircle2 } from 'lucide-react';
import { StudyBook } from '../../types';

interface BookCoverVisualProps {
  book: StudyBook;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isCompleted?: boolean;
}

export const BookCoverVisual: React.FC<BookCoverVisualProps> = ({
  book,
  size = 'md',
  className = '',
  isCompleted = false
}) => {
  const sizeClasses = {
    sm: 'w-24 h-34 text-[8px]',
    md: 'w-full aspect-[1/1.42] text-xs',
    lg: 'w-full max-w-[320px] aspect-[1/1.42] text-sm'
  };

  // 1. NIHONGO CHALLENGE KOTOBA (Yellow / Green authentic book cover)
  if (book.id === 'book_challenge_kotoba_n4') {
    return (
      <div 
        className={`relative rounded-xl overflow-hidden shadow-2xl border border-amber-300/60 select-none flex flex-col justify-between p-3.5 sm:p-4 bg-gradient-to-b from-[#fffbeb] via-[#fef08a] to-[#fde047] text-slate-800 ${sizeClasses[size]} ${className}`}
        style={{
          boxShadow: '0 15px 35px -5px rgba(234, 179, 8, 0.35), 0 0 0 1px rgba(245, 158, 11, 0.25), inset 4px 0 12px rgba(0,0,0,0.08)'
        }}
      >
        {/* Book Spine 3D simulation */}
        <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-amber-950/30 via-white/50 to-transparent pointer-events-none z-10" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-amber-400/60 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300" />
            <span className="font-japanese font-bold text-amber-950 text-[10px] sm:text-[11px] tracking-wide">
              にほんごチャレンジ
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-extrabold text-[8px] sm:text-[9px] shadow-xs">
            ASK
          </span>
        </div>

        {/* Center: Main Title */}
        <div className="relative z-10 my-auto text-center space-y-1.5 py-1">
          <div className="inline-flex items-baseline gap-1.5">
            <span className="font-black text-2xl sm:text-3xl text-rose-600 font-mono tracking-tight drop-shadow-xs">
              N4
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white font-black text-xs sm:text-base tracking-wider font-japanese shadow-sm">
              ［ことば］
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-[2px] border border-amber-300/80 rounded-lg p-2 shadow-xs">
            <p className="font-extrabold text-[10px] sm:text-[11px] text-amber-950 leading-snug">
              NIHONGO CHALLENGE N4
            </p>
            <p className="text-[8px] sm:text-[9px] text-slate-700 font-medium mt-0.5">
              Từ vựng N4 qua hình ảnh & đời sống
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-amber-900 text-[8.5px] sm:text-[9.5px] font-bold pt-0.5">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>32 bài từ vựng + đề ôn tập</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 pt-1.5 border-t border-amber-400/60 flex items-end justify-between text-[8px] sm:text-[9px] text-slate-700">
          <div>
            <p className="font-japanese font-bold text-slate-900">アスク出版</p>
            <p className="text-[7.5px] text-slate-600">ASK Publishing</p>
          </div>
          <div className="font-mono text-[7px] text-slate-600 bg-white/80 px-1 py-0.5 rounded border border-amber-300">
            ISBN 978-4-872
          </div>
        </div>

        {isCompleted && (
          <div className="absolute top-2 right-2 z-20 bg-emerald-500 text-white p-1 rounded-full shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  }

  // 2. NIHONGO CHALLENGE BUNPOU TO YOMU (Purple / Pink / Rose authentic cover)
  if (book.id === 'book_challenge_bunpou_yomu_n4') {
    return (
      <div 
        className={`relative rounded-xl overflow-hidden shadow-2xl border border-purple-300/50 select-none flex flex-col justify-between p-3.5 sm:p-4 bg-gradient-to-b from-[#faf5ff] via-[#f3e8ff] to-[#fce7f3] text-slate-800 ${sizeClasses[size]} ${className}`}
        style={{
          boxShadow: '0 15px 35px -5px rgba(168, 85, 247, 0.3), 0 0 0 1px rgba(192, 132, 252, 0.25), inset 4px 0 12px rgba(0,0,0,0.08)'
        }}
      >
        {/* Book Spine */}
        <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-purple-950/30 via-white/50 to-transparent pointer-events-none z-10" />

        {/* Top */}
        <div className="relative z-10 flex items-center justify-between border-b border-purple-300/60 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600 ring-2 ring-purple-300" />
            <span className="font-japanese font-bold text-purple-950 text-[10px] sm:text-[11px] tracking-wide">
              にほんごチャレンジ
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-purple-700 text-white font-extrabold text-[8px] sm:text-[9px] shadow-xs">
            ASK
          </span>
        </div>

        {/* Center */}
        <div className="relative z-10 my-auto text-center space-y-1.5 py-1">
          <div className="inline-flex items-baseline gap-1.5">
            <span className="font-black text-2xl sm:text-3xl text-purple-700 font-mono tracking-tight drop-shadow-xs">
              N4
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-xs sm:text-base tracking-wider font-japanese shadow-sm">
              ［文法と読む］
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-[2px] border border-purple-200 rounded-lg p-2 shadow-xs">
            <p className="font-extrabold text-[10px] sm:text-[11px] text-purple-950 leading-snug">
              BUNPOU TO YOMU RENSHUU
            </p>
            <p className="text-[8px] sm:text-[9px] text-slate-700 font-medium mt-0.5">
              Ngữ pháp & Đọc hiểu qua câu chuyện
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-purple-900 text-[8.5px] sm:text-[9.5px] font-bold pt-0.5">
            <BookOpen className="w-3 h-3 text-purple-600" />
            <span>32 bài ngữ pháp + 15 bài đọc hiểu</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 pt-1.5 border-t border-purple-300/60 flex items-end justify-between text-[8px] sm:text-[9px] text-slate-700">
          <div>
            <p className="font-japanese font-bold text-slate-900">アスク出版</p>
            <p className="text-[7.5px] text-slate-600">ASK Publishing</p>
          </div>
          <div className="font-mono text-[7px] text-slate-600 bg-white/80 px-1 py-0.5 rounded border border-purple-200">
            ISBN 978-4-872
          </div>
        </div>

        {isCompleted && (
          <div className="absolute top-2 right-2 z-20 bg-emerald-500 text-white p-1 rounded-full shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  }

  // 3. SHIN NIHONGO 500 MON N4-N5 (Iconic Orange/Amber 500 Mon Drill cover)
  if (book.id === 'book_shin_nihongo_500_n4_n5') {
    return (
      <div 
        className={`relative rounded-xl overflow-hidden shadow-2xl border border-orange-300/60 select-none flex flex-col justify-between p-3.5 sm:p-4 bg-gradient-to-b from-[#fff7ed] via-[#fed7aa] to-[#fb923c] text-slate-800 ${sizeClasses[size]} ${className}`}
        style={{
          boxShadow: '0 15px 35px -5px rgba(249, 115, 22, 0.35), 0 0 0 1px rgba(251, 146, 60, 0.25), inset 4px 0 12px rgba(0,0,0,0.08)'
        }}
      >
        {/* Book Spine */}
        <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-orange-950/30 via-white/50 to-transparent pointer-events-none z-10" />

        {/* Top */}
        <div className="relative z-10 flex items-center justify-between border-b border-orange-400/60 pb-1.5">
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white font-mono font-black text-[9px]">
              N4・N5
            </span>
            <span className="font-japanese font-bold text-orange-950 text-[9px] sm:text-[10px]">
              合格力養成！
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-orange-700 text-white font-extrabold text-[8px] sm:text-[9px] shadow-xs">
            ASK
          </span>
        </div>

        {/* Center: Big 500 Mon */}
        <div className="relative z-10 my-auto text-center space-y-1.5 py-1">
          <div className="space-y-0.5">
            <p className="font-japanese text-[9px] sm:text-[10px] font-bold text-orange-900 tracking-wider">
              新にほんご
            </p>
            <h2 className="font-black text-2xl sm:text-4xl text-orange-950 font-mono tracking-tight leading-none drop-shadow-sm">
              500<span className="text-base sm:text-xl font-japanese ml-0.5">問</span>
            </h2>
          </div>

          <div className="bg-white/90 backdrop-blur-[2px] border border-orange-300 rounded-lg p-2 shadow-xs">
            <p className="font-extrabold text-[9px] sm:text-[10px] text-orange-950">
              文字 • 語い • 文法 まとめドリル
            </p>
            <p className="text-[7.5px] sm:text-[8.5px] text-slate-700 mt-0.5 font-medium">
              4 tuần luyện 500 câu trọng điểm
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-orange-950 text-[8px] sm:text-[9px] font-bold">
            <span className="px-1.5 py-0.5 rounded bg-orange-200/80 text-orange-900">Kanji</span>
            <span className="px-1.5 py-0.5 rounded bg-orange-200/80 text-orange-900">Từ vựng</span>
            <span className="px-1.5 py-0.5 rounded bg-orange-200/80 text-orange-900">Ngữ pháp</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 pt-1.5 border-t border-orange-400/60 flex items-end justify-between text-[8px] sm:text-[9px] text-slate-700">
          <div>
            <p className="font-japanese font-bold text-slate-900">松本紀子・佐々木仁子</p>
            <p className="text-[7.5px] text-slate-600">ASK Publishing</p>
          </div>
          <div className="font-mono text-[7px] text-slate-600 bg-white/80 px-1 py-0.5 rounded border border-orange-300">
            ISBN 978-4-872
          </div>
        </div>

        {isCompleted && (
          <div className="absolute top-2 right-2 z-20 bg-emerald-500 text-white p-1 rounded-full shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  }

  // 4. Fallback / Other Books (Minna no Nihongo, Shin Kanzen Master, etc.)
  return (
    <div 
      className={`relative rounded-xl overflow-hidden shadow-xl border border-slate-700/80 select-none flex flex-col justify-between p-3.5 sm:p-4 bg-gradient-to-br ${book.gradient} text-white ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: '0 15px 30px -5px rgba(0,0,0,0.5), inset 4px 0 10px rgba(0,0,0,0.3)'
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-white/20 to-transparent pointer-events-none z-10" />
      
      {/* Top Badge */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-1.5">
        <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold font-mono border border-white/20">
          JLPT {book.level}
        </span>
        <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-white/80 tracking-wide uppercase">
          {book.category || 'Official'}
        </span>
      </div>

      {/* Center Title */}
      <div className="relative z-10 my-auto text-center space-y-1 py-1">
        <h3 className="font-japanese font-black text-base sm:text-lg text-white leading-tight drop-shadow-sm line-clamp-2">
          {book.japaneseTitle}
        </h3>
        <p className="font-bold text-[10px] sm:text-xs text-white/90 line-clamp-2">
          {book.title}
        </p>
        {book.coverBadge && (
          <div className="pt-1">
            <span className="inline-block px-2 py-0.5 rounded bg-black/30 text-[8px] sm:text-[9px] text-white/90 border border-white/15">
              {book.coverBadge}
            </span>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="relative z-10 pt-1.5 border-t border-white/20 flex items-end justify-between text-[8px] sm:text-[9px] text-white/80">
        <span className="truncate max-w-[65%]">{book.publisher || book.author}</span>
        <BookOpen className="w-3.5 h-3.5 text-white/70 shrink-0" />
      </div>

      {isCompleted && (
        <div className="absolute top-2 right-2 z-20 bg-emerald-500 text-white p-1 rounded-full shadow-md">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
