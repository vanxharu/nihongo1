import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Trash2, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Minus,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface DraftAnswerSheetProps {
  storageKey: string;
}

export const DraftAnswerSheet: React.FC<DraftAnswerSheetProps> = ({ storageKey }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [questionCount, setQuestionCount] = useState<number>(() => {
    try {
      const savedCount = localStorage.getItem(`${storageKey}_count`);
      return savedCount ? parseInt(savedCount, 10) : 25;
    } catch {
      return 25;
    }
  });

  // User draft answers: { 1: 2, 2: 4, 3: 1, ... }
  const [draftAnswers, setDraftAnswers] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // User checking / self-grading against video answer key (optional check/wrong marks)
  // { 1: 'correct', 2: 'wrong', ... }
  const [gradeStatus, setGradeStatus] = useState<Record<number, 'correct' | 'wrong'>>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_grades`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persist draft answers
  const handleSelectOption = (questionNum: number, optionNum: number) => {
    setDraftAnswers(prev => {
      const updated = { ...prev };
      if (updated[questionNum] === optionNum) {
        delete updated[questionNum]; // Click again to deselect
      } else {
        updated[questionNum] = optionNum;
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Toggle mark right/wrong when checking against video key
  const handleToggleGrade = (questionNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setGradeStatus(prev => {
      const updated = { ...prev };
      if (updated[questionNum] === 'correct') {
        updated[questionNum] = 'wrong';
      } else if (updated[questionNum] === 'wrong') {
        delete updated[questionNum];
      } else {
        updated[questionNum] = 'correct';
      }
      try {
        localStorage.setItem(`${storageKey}_grades`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có muốn xóa toàn bộ đáp án nháp của bài này để làm lại không?')) {
      setDraftAnswers({});
      setGradeStatus({});
      try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_grades`);
      } catch {}
    }
  };

  const handleAdjustCount = (delta: number) => {
    setQuestionCount(prev => {
      const next = Math.max(5, Math.min(60, prev + delta));
      try {
        localStorage.setItem(`${storageKey}_count`, next.toString());
      } catch {}
      return next;
    });
  };

  const answeredCount = Object.keys(draftAnswers).length;
  const correctCount = Object.values(gradeStatus).filter(s => s === 'correct').length;
  const wrongCount = Object.values(gradeStatus).filter(s => s === 'wrong').length;
  const totalGraded = correctCount + wrongCount;

  return (
    <div className="rounded-2xl bg-[#0e1524] border border-slate-800/90 overflow-hidden shadow-lg transition-all">
      {/* Header / Toggle Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-gradient-to-r from-slate-900 via-[#131c2e] to-slate-900 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Bảng chọn đáp án nháp (Tự dò đáp án cuối video)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                {answeredCount}/{questionCount} câu
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Chọn nhanh đáp án 1, 2, 3, 4 khi nghe • Cuối video bật lên để tự đối chiếu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalGraded > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/90 text-[11px] font-bold border border-slate-700">
              <span className="text-emerald-400 font-bold">✓ {correctCount} đúng</span>
              <span className="text-slate-500">•</span>
              <span className="text-rose-400 font-bold">✗ {wrongCount} sai</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3">
          {/* Sub Controls: Adjust question count & clear */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/70 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Số lượng câu:</span>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => handleAdjustCount(-5)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title="Giảm 5 câu"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 font-bold text-white text-xs">{questionCount}</span>
                <button
                  type="button"
                  onClick={() => handleAdjustCount(5)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title="Tăng 5 câu"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="text-[10px] text-slate-500 hidden md:inline">
                (Click vào ô đáp án để đổi, click biểu tượng ✓/✗ bên cạnh số câu để chấm đúng/sai)
              </span>
            </div>

            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer border border-red-500/20"
                title="Xóa nháp làm lại"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa làm lại</span>
              </button>
            )}
          </div>

          {/* Answer Grid: 1 to questionCount */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-2 max-h-[55vh] lg:max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
            {Array.from({ length: questionCount }, (_, idx) => {
              const qNum = idx + 1;
              const selectedOpt = draftAnswers[qNum];
              const grade = gradeStatus[qNum];

              return (
                <div 
                  key={qNum}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-1.5 transition-all ${
                    selectedOpt 
                      ? 'bg-slate-900/90 border-slate-700 shadow-sm' 
                      : 'bg-slate-900/40 border-slate-800/70 hover:border-slate-700/60'
                  }`}
                >
                  {/* Question Number & Self-grading Toggle */}
                  <div 
                    onClick={(e) => handleToggleGrade(qNum, e)}
                    className="flex items-center gap-1 cursor-pointer select-none group"
                    title="Bấm để đánh dấu: Chưa chấm → Đúng (Xanh) → Sai (Đỏ)"
                  >
                    <span className="font-extrabold text-[11px] text-slate-300 group-hover:text-white">
                      {qNum < 10 ? `0${qNum}` : qNum}
                    </span>
                    {grade === 'correct' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    {grade === 'wrong' && (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    {!grade && (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700/80 group-hover:border-slate-500 block shrink-0" />
                    )}
                  </div>

                  {/* 4 Choices: 1, 2, 3, 4 */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map(opt => {
                      const isChosen = selectedOpt === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(qNum, opt)}
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isChosen
                              ? grade === 'wrong'
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400'
                                : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400'
                              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom helper tip */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span className="flex items-center gap-1 text-slate-400">
              💡 Bấm số <strong className="text-emerald-400">1, 2, 3, 4</strong> để ghi nhanh đáp án. Bấm biểu tượng tròn cạnh số câu để tick <strong className="text-emerald-400">Đúng</strong> hoặc <strong className="text-rose-400">Sai</strong> khi dò đáp án.
            </span>
            <span className="text-slate-500">Tự động lưu lại khi đóng/mở</span>
          </div>
        </div>
      )}
    </div>
  );
};
