/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, X, ChevronRight } from 'lucide-react';
import { LessonReadingGrammar } from '../types';

interface ReadingGrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
  grammarList?: LessonReadingGrammar[];
  onSelectGrammarPoint?: (point: string) => void;
}

export const ReadingGrammarModal: React.FC<ReadingGrammarModalProps> = ({
  isOpen,
  onClose,
  grammarList = [],
  onSelectGrammarPoint
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Ngữ pháp trong bài đọc ({grammarList.length} mẫu)
              </h3>
              <p className="text-[11px] text-slate-400">
                Các cấu trúc ngữ pháp JLPT trọng tâm xuất hiện trong bài viết
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {grammarList.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Không tìm thấy cấu trúc ngữ pháp đặc biệt nào trong bài này.
            </div>
          ) : (
            grammarList.map((g, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-purple-500/20 hover:border-purple-500/40 rounded-xl p-4 space-y-2 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {g.level || 'JLPT'}
                    </span>
                    <h4 className="text-base font-extrabold text-white font-jp">
                      {g.point}
                    </h4>
                  </div>
                </div>

                {g.meaning && (
                  <div className="text-sm font-semibold text-purple-200">
                    Ý nghĩa: {g.meaning}
                  </div>
                )}

                {g.structure && (
                  <div className="text-xs font-mono bg-slate-900 px-2.5 py-1.5 rounded-lg text-slate-300 border border-slate-800">
                    <strong className="text-purple-400">Cấu trúc:</strong> {g.structure}
                  </div>
                )}

                {g.explanation && (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {g.explanation}
                  </p>
                )}

                {g.example && (
                  <div className="pt-1.5 border-t border-slate-800/80 text-xs space-y-1">
                    <div className="font-jp text-amber-200/90 font-medium">
                      例: {g.example}
                    </div>
                    {g.exampleMeaning && (
                      <div className="text-slate-400 italic">
                        → {g.exampleMeaning}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ReadingGrammarModal);
