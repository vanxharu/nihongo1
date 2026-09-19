/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, BookOpen, Send, SlidersHorizontal } from 'lucide-react';

interface ReadingBottomToolbarProps {
  showFurigana: boolean;
  onToggleFurigana: () => void;
  showJlptUnderline: boolean;
  onToggleJlptUnderline: () => void;
  showPosHighlight?: boolean;
  onTogglePosHighlight?: () => void;
  showGrammarHighlight?: boolean;
  onOpenGrammarModal: () => void;
  onOpenOptionsModal?: () => void;
  onScrollToQuestions: () => void;
  onSubmitQuiz?: () => void;
  isQuizSubmitted?: boolean;
  totalQuestions?: number;
  answeredCount?: number;
  hasGrammar?: boolean;
}

export const ReadingBottomToolbar: React.FC<ReadingBottomToolbarProps> = ({
  showFurigana,
  onToggleFurigana,
  showJlptUnderline,
  onToggleJlptUnderline,
  showPosHighlight = true,
  onTogglePosHighlight,
  showGrammarHighlight,
  onOpenGrammarModal,
  onOpenOptionsModal,
  onScrollToQuestions,
  onSubmitQuiz,
  isQuizSubmitted,
  totalQuestions = 0,
  answeredCount = 0,
  hasGrammar = true
}) => {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none flex justify-center">
      <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2 max-w-lg w-full">
        {/* Left: Scroll to Questions Button */}
        <button
          type="button"
          onClick={onScrollToQuestions}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95 shadow-sm"
          title="Cuộn nhanh đến phần câu hỏi trắc nghiệm"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Câu hỏi</span>
          {totalQuestions > 0 && (
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono border border-sky-500/30">
              {answeredCount}/{totalQuestions}
            </span>
          )}
        </button>

        {/* Center: Grammar Modal & Options Modal */}
        <div className="flex items-center gap-2">
          {/* Grammar Modal Button */}
          <button
            type="button"
            onClick={onOpenGrammarModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95 shadow-sm"
            title="Xem danh sách cấu trúc ngữ pháp trong bài viết"
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Ngữ pháp</span>
          </button>

          {/* Unified Options Button ("Tùy chọn") */}
          {onOpenOptionsModal && (
            <button
              type="button"
              onClick={onOpenOptionsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/50 text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95 shadow-sm"
              title="Mở bảng Tùy chọn (Furigana, Dịch nghĩa, Từ loại, JLPT, Cỡ chữ...)"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Tùy chọn</span>
            </button>
          )}
        </div>

        {/* Right: Submit Quiz Button */}
        {onSubmitQuiz && (
          <button
            type="button"
            onClick={onSubmitQuiz}
            disabled={isQuizSubmitted}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95 shadow-sm ${
              isQuizSubmitted
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
            }`}
            title="Nộp bài và chấm điểm làm trắc nghiệm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isQuizSubmitted ? 'Đã nộp' : 'Nộp bài'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(ReadingBottomToolbar);
