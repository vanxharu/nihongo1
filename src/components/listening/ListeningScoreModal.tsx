import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  FileText, 
  HelpCircle, 
  Volume2, 
  TrendingUp, 
  Award, 
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ListeningExamAttempt, ListeningQuestionResult } from '../../types/listeningExamTypes';
import { formatDuration } from '../../utils/youtubeUtils';

interface ListeningScoreModalProps {
  attempt: ListeningExamAttempt;
  onClose: () => void;
  onRetake: () => void;
  onPlaySnippet?: (startTime: number, endTime?: number) => void;
}

export const ListeningScoreModal: React.FC<ListeningScoreModalProps> = ({
  attempt,
  onClose,
  onRetake,
  onPlaySnippet
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'wrong' | 'correct'>('wrong');
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const toggleDetail = (qId: string) => {
    setExpandedDetails(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const wrongCount = attempt.total - attempt.correct;

  const filteredResults = attempt.questionResults.filter(q => {
    if (activeFilter === 'wrong') return !q.isCorrect;
    if (activeFilter === 'correct') return q.isCorrect;
    return true;
  });

  // Letter mapping for options: 1 -> A, 2 -> B, 3 -> C, 4 -> D
  const getLetter = (num: number | null) => {
    if (num === null || num === undefined) return 'Chưa chọn';
    const letters = ['A', 'B', 'C', 'D', 'E'];
    return letters[num - 1] || `${num}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                  🎧 Kết quả nghe JLPT
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300">
                  {attempt.level} Listening
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate max-w-md">
                {attempt.examTitle}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Scorecard Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Estimated Score */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/40 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                  Điểm luyện tập ước tính
                </span>
                <div className="flex items-baseline gap-1.5 my-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {attempt.estimatedScore}
                  </span>
                  <span className="text-lg font-bold text-slate-400">/50</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Không phải điểm JLPT chính thức (dùng để đo lường năng lực luyện tập).</span>
              </div>
            </div>

            {/* Box 2: Accuracy & Stats */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Độ chính xác (Accuracy)
                </span>
                <div className="flex items-baseline gap-2 my-2">
                  <span className={`text-4xl sm:text-5xl font-black tracking-tight ${
                    attempt.accuracy >= 70 ? 'text-emerald-400' : attempt.accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {attempt.accuracy}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    attempt.accuracy >= 70 ? 'bg-emerald-500' : attempt.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${attempt.accuracy}%` }}
                />
              </div>
            </div>

            {/* Box 3: Correct / Incorrect Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Chi tiết câu trả lời
              </span>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Đúng:
                  </span>
                  <span className="text-sm font-extrabold text-emerald-300">
                    {attempt.correct}/{attempt.total} câu
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Sai:
                  </span>
                  <span className="text-sm font-extrabold text-rose-300">
                    {wrongCount}/{attempt.total} câu
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Phân tích chi tiết câu hỏi & câu sai */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Phân tích câu hỏi & Nghe lại
                </h4>
                {wrongCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {wrongCount} câu cần cải thiện
                  </span>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveFilter('wrong')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeFilter === 'wrong'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Câu sai ({wrongCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tất cả ({attempt.total})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('correct')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeFilter === 'correct'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Câu đúng ({attempt.correct})
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {filteredResults.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400">
                  {activeFilter === 'wrong' ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                      <p className="font-bold text-white">Tuyệt vời! Không có câu sai nào.</p>
                      <p className="text-xs">Bạn đã trả lời chính xác tất cả các câu hỏi trong đề này.</p>
                    </div>
                  ) : (
                    <p>Không có câu hỏi nào thỏa điều kiện lọc.</p>
                  )}
                </div>
              ) : (
                filteredResults.map((qr, index) => {
                  const isExpanded = !!expandedDetails[qr.questionId];

                  return (
                    <div
                      key={qr.questionId}
                      className={`p-4 rounded-2xl border transition-all ${
                        qr.isCorrect
                          ? 'bg-slate-900/60 border-slate-800'
                          : 'bg-gradient-to-r from-rose-950/20 via-slate-900/80 to-slate-900 border-rose-500/40'
                      }`}
                    >
                      {/* Top Row: Question label, selection vs answer, replay button */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            qr.isCorrect 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          }`}>
                            {qr.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </span>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-sm">
                                {qr.questionId}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                                {qr.questionType}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs mt-0.5">
                              <span className="text-slate-400">
                                Bạn chọn:{' '}
                                <strong className={qr.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                                  {getLetter(qr.selectedAnswer)}
                                </strong>
                              </span>
                              {!qr.isCorrect && (
                                <span className="text-slate-400">
                                  Đáp án:{' '}
                                  <strong className="text-emerald-400">
                                    {getLetter(qr.correctAnswer)}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Replay Snippet & Expand Detail */}
                        <div className="flex items-center gap-2">
                          {qr.startTime !== undefined && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onPlaySnippet && qr.startTime !== undefined) {
                                  onPlaySnippet(qr.startTime, qr.endTime);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Tua đúng đoạn âm thanh này trên YouTube"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                              <span>▶ Nghe lại ({formatDuration(qr.startTime)})</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleDetail(qr.questionId)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed font-medium">
                        {qr.questionText}
                      </p>

                      {/* Expanded Section: Transcript & Explanation */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs">
                          {/* Options breakdown */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {qr.options.map((opt, optIdx) => {
                              const optNum = optIdx + 1;
                              const isThisCorrect = optNum === qr.correctAnswer;
                              const isThisChosen = optNum === qr.selectedAnswer;

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                                    isThisCorrect
                                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                                      : isThisChosen
                                      ? 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                                  }`}
                                >
                                  <span className="font-bold">
                                    {getLetter(optNum)}. {opt}
                                  </span>
                                  {isThisCorrect ? (
                                    <span className="text-[10px] font-bold text-emerald-400">Đáp án</span>
                                  ) : isThisChosen ? (
                                    <span className="text-[10px] font-bold text-rose-400">Đã chọn</span>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>

                          {/* Transcript Box */}
                          {qr.transcript && (
                            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-teal-500/30 space-y-1.5">
                              <h6 className="font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-teal-400" />
                                Kịch bản thoại (Transcript)
                              </h6>
                              <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                                {qr.transcript}
                              </p>
                            </div>
                          )}

                          {/* Explanation Box */}
                          {qr.explanation && (
                            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-1.5">
                              <h6 className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                                Giải thích chi tiết
                              </h6>
                              <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                                {qr.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onRetake}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại bài này</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 cursor-pointer transition-all"
          >
            Đóng & Tiếp tục học
          </button>
        </div>
      </div>
    </div>
  );
};
