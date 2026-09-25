/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Disc3, Award, CheckCircle2 } from 'lucide-react';
import { StudyBook } from '../types';

interface AuthenticBookCoverProps {
  book: StudyBook;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AuthenticBookCover: React.FC<AuthenticBookCoverProps> = ({
  book,
  size = 'md',
  className = ''
}) => {
  const isKitajima = book.id === 'book_kitajima_n4';
  const isChallengeKotoba = book.id === 'book_challenge_kotoba_n4';

  const containerSizes = {
    sm: 'w-28 h-38 text-[9px]',
    md: 'w-full aspect-[1/1.42] max-w-[280px] text-xs',
    lg: 'w-full aspect-[1/1.42] max-w-[340px] text-sm'
  };

  if (isKitajima) {
    return (
      <div 
        className={`relative rounded-xl overflow-hidden shadow-2xl border border-rose-300/40 select-none flex flex-col justify-between p-4 bg-gradient-to-b from-[#fdf2f4] via-[#fce7ed] to-[#fbcfe8] text-slate-800 ${containerSizes[size]} ${className}`}
        style={{
          boxShadow: '0 15px 35px -5px rgba(225, 29, 72, 0.25), 0 0 0 1px rgba(244, 63, 94, 0.15), inset 4px 0 12px rgba(0,0,0,0.06)'
        }}
      >
        {/* Book Spine 3D simulation */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-rose-950/20 via-white/40 to-transparent pointer-events-none z-10" />
        
        {/* Subtle Japanese Traditional Pattern Background */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#e11d48 1.5px, transparent 1.5px)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Top Badges & CD Banner */}
        <div className="relative z-10 flex items-start justify-between gap-1 border-b border-rose-300/60 pb-2.5">
          <div className="flex items-center gap-1.5 bg-rose-600 text-white px-2 py-0.5 rounded shadow-sm text-[10px] font-black tracking-wider uppercase">
            <span>JLPT N4</span>
            <span className="w-1 h-1 rounded-full bg-white/80" />
            <span className="text-[9px] font-medium">BỘ ĐỀ CHUẨN</span>
          </div>

          <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-600/40 text-amber-900 px-1.5 py-0.5 rounded font-bold text-[9px]">
            <Disc3 className="w-3 h-3 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
            <span>CD 2枚付</span>
          </div>
        </div>

        {/* Center: Main Japanese Title in Authentic Calligraphy/Mincho Style */}
        <div className="relative z-10 my-auto text-center space-y-2 py-1">
          <p className="font-jlpt-exam text-[11px] sm:text-xs font-bold text-rose-800 tracking-widest uppercase">
            日本語能力試験対応
          </p>
          
          <div className="py-1 px-2 rounded-lg bg-white/70 backdrop-blur-[2px] border border-rose-200/80 shadow-xs">
            <h2 className="font-jlpt-exam font-black text-xl sm:text-2xl text-rose-950 leading-tight tracking-normal">
              模擬試験問題集
            </h2>
            <div className="inline-flex items-center justify-center my-1">
              <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white font-black text-lg sm:text-xl font-mono shadow-md border-2 border-white">
                N4
              </span>
            </div>
          </div>

          <div className="bg-rose-900 text-white py-1 px-2 rounded shadow-sm">
            <p className="font-bold text-[10px] sm:text-[11px] tracking-tight line-clamp-1">
              BỘ ĐỀ THI THỬ KÌ THI NĂNG LỰC TIẾNG NHẬT N4
            </p>
            <p className="text-[8.5px] text-rose-200 line-clamp-1">
              Kèm đáp án & lời giải chi tiết bằng tiếng Việt
            </p>
          </div>
        </div>

        {/* Bottom: Author, Publisher & Authentic Barcode */}
        <div className="relative z-10 pt-2 border-t border-rose-300/60 flex items-end justify-between text-[9px] text-slate-700">
          <div>
            <p className="font-jlpt-exam font-bold text-slate-900">
              北嶋千鶴子 <span className="font-normal text-[8px]">著</span>
            </p>
            <p className="text-[8px] text-slate-600 font-medium">
              NXB Giáo Dục Việt Nam
            </p>
          </div>

          <div className="text-right font-mono text-[7px] text-slate-500 bg-white/60 px-1.5 py-0.5 rounded border border-slate-300/60">
            <div className="font-bold text-slate-700">ISBN 978-4-336</div>
            <div className="tracking-tighter">||||||||||||||||||||</div>
          </div>
        </div>
      </div>
    );
  }

  if (isChallengeKotoba) {
    return (
      <div 
        className={`relative rounded-xl overflow-hidden shadow-2xl border border-amber-300/50 select-none flex flex-col justify-between p-4 bg-gradient-to-b from-[#fefce8] via-[#fef08a] to-[#fde047] text-slate-800 ${containerSizes[size]} ${className}`}
        style={{
          boxShadow: '0 15px 35px -5px rgba(234, 179, 8, 0.3), 0 0 0 1px rgba(245, 158, 11, 0.2), inset 4px 0 12px rgba(0,0,0,0.06)'
        }}
      >
        {/* Book Spine 3D simulation */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-950/25 via-white/40 to-transparent pointer-events-none z-10" />

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between border-b border-amber-400/50 pb-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-jlpt-exam font-bold text-amber-950 text-[11px] tracking-wide">
              にほんごチャレンジ
            </span>
          </div>

          <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-extrabold text-[9px] shadow-xs">
            Ask Publishing
          </span>
        </div>

        {/* Center: Famous Kotoba Graphic */}
        <div className="relative z-10 my-auto text-center space-y-2 py-2">
          <div className="inline-flex items-baseline gap-1.5">
            <span className="font-black text-3xl sm:text-4xl text-rose-600 drop-shadow-[0_2px_4px_rgba(225,29,72,0.3)] font-mono">
              N4
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-700 text-white font-black text-base sm:text-lg tracking-wider font-jlpt-exam shadow-md">
              ［ことば］
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-[2px] border border-amber-300 rounded-lg p-2 shadow-xs">
            <p className="font-bold text-[11px] text-amber-950">
              NIHONGO CHALLENGE N4 KOTOBA
            </p>
            <p className="text-[9px] text-slate-700 mt-0.5">
              Từ vựng N4 theo chủ đề đời sống & hình ảnh minh họa
            </p>
          </div>

          {/* Cute mascot illustration placeholder */}
          <div className="flex items-center justify-center gap-2 pt-1 text-amber-800 text-[10px] font-bold">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Đầy đủ 30 bài + Kiểm tra thực hành</span>
          </div>
        </div>

        {/* Bottom: Author, Publisher & Barcode */}
        <div className="relative z-10 pt-2 border-t border-amber-400/50 flex items-end justify-between text-[9px] text-slate-700">
          <div>
            <p className="font-jlpt-exam font-bold text-slate-900">
              アスク出版 編集部
            </p>
            <p className="text-[8px] text-slate-600">
              Bản quyền phát hành Ask Publishing
            </p>
          </div>

          <div className="text-right font-mono text-[7px] text-slate-600 bg-white/70 px-1.5 py-0.5 rounded border border-amber-300">
            <div className="font-bold text-slate-800">ISBN 978-4-872</div>
            <div className="tracking-tighter">||||||||||||||||||||</div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback authentic book cover for any other book
  return (
    <div 
      className={`relative rounded-xl overflow-hidden shadow-xl border border-slate-700 select-none flex flex-col justify-between p-4 bg-gradient-to-br ${book.gradient} text-white ${containerSizes[size]} ${className}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/30 via-white/20 to-transparent pointer-events-none z-10" />
      <div className="relative z-10 flex items-center justify-between">
        <span className="px-2 py-0.5 rounded bg-black/40 text-white text-[10px] font-bold font-mono border border-white/20">
          {book.level}
        </span>
        <BookOpen className="w-4 h-4 text-white/80" />
      </div>

      <div className="relative z-10 my-auto text-center space-y-1">
        <h3 className="font-jlpt-exam font-black text-lg text-white leading-tight">
          {book.japaneseTitle}
        </h3>
        <p className="font-bold text-xs text-white/90">
          {book.title}
        </p>
      </div>

      <div className="relative z-10 pt-2 border-t border-white/20 flex items-end justify-between text-[9px] text-white/80">
        <span>{book.author}</span>
        <span>{book.publisher}</span>
      </div>
    </div>
  );
};
