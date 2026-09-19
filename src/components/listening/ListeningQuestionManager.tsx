import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Volume2, 
  Sparkles, 
  Send, 
  Lock, 
  Unlock, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ListeningQuestion } from '../../types/listeningExamTypes';
import { formatDuration } from '../../utils/youtubeUtils';

interface ListeningQuestionManagerProps {
  questions: ListeningQuestion[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  selectedAnswers: Record<string, number>;
  onSelectAnswer: (questionId: string, answerOption: number) => void;
  checkedQuestions: Record<string, boolean>; // for practice mode
  onCheckAnswer?: (questionId: string) => void;
  mode: 'practice' | 'exam';
  onModeChange: (newMode: 'practice' | 'exam') => void;
  replayLimit: number; // 0 = unlimited, 1, 2
  onChangeReplayLimit?: (limit: number) => void;
  lockSeeking: boolean;
  onToggleLockSeeking?: () => void;
  replaysUsed: Record<string, number>;
  onPlaySnippet?: (startTime: number, endTime?: number) => void;
  onSubmitExam: () => void;
  canSubmit?: boolean;
}

export const ListeningQuestionManager: React.FC<ListeningQuestionManagerProps> = ({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  selectedAnswers,
  onSelectAnswer,
  checkedQuestions,
  onCheckAnswer,
  mode,
  onModeChange,
  replayLimit,
  onChangeReplayLimit,
  lockSeeking,
  onToggleLockSeeking,
  replaysUsed,
  onPlaySnippet,
  onSubmitExam,
  canSubmit = true
}) => {
  const [showTranscript, setShowTranscript] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) return null;

  const currentAnswer = selectedAnswers[currentQ.questionId];
  const isChecked = !!checkedQuestions[currentQ.questionId];
  const isCorrect = isChecked && currentAnswer === currentQ.answer;
  const isWrong = isChecked && currentAnswer !== undefined && currentAnswer !== currentQ.answer;

  const timesReplayed = replaysUsed[currentQ.questionId] || 0;
  const canReplay = replayLimit === 0 || timesReplayed < replayLimit;

  const answeredCount = Object.keys(selectedAnswers).filter(k => selectedAnswers[k] !== undefined).length;
  const totalCount = questions.length;

  const toggleTranscript = (qId: string) => {
    setShowTranscript(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const toggleExplanation = (qId: string) => {
    setShowExplanation(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSnippetPlay = () => {
    if (!canReplay && mode === 'exam') return;
    const playStart = currentQ.listeningStartTime !== undefined ? currentQ.listeningStartTime : currentQ.startTime;
    const playEnd = currentQ.listeningEndTime !== undefined ? currentQ.listeningEndTime : currentQ.endTime;
    if (onPlaySnippet && playStart !== undefined) {
      onPlaySnippet(playStart, playEnd);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#101726] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header: Mode Switcher & Exam Config */}
      <div className="p-3 sm:p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onModeChange('practice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'practice'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Luyện tập</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('exam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'exam'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Thi thử JLPT</span>
          </button>
        </div>

        {/* Exam Mode Settings (Replay Limit & Seek Lock) */}
        {mode === 'exam' ? (
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-slate-400 font-medium hidden sm:inline">Phát lại:</span>
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
              {[
                { label: 'Không giới hạn', val: 0 },
                { label: '1 lần', val: 1 },
                { label: '2 lần', val: 2 }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => onChangeReplayLimit && onChangeReplayLimit(item.val)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    replayLimit === item.val
                      ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {onToggleLockSeeking && (
              <button
                type="button"
                onClick={onToggleLockSeeking}
                title={lockSeeking ? 'Đang khóa tua video để mô phỏng phòng thi thật' : 'Tua tự do'}
                className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
                  lockSeeking
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {lockSeeking ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{lockSeeking ? 'Khóa tua' : 'Tua tự do'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Chế độ tự do: Tự do nghe lại, xem đáp án & transcript</span>
          </div>
        )}
      </div>

      {/* Question Index Pagination Bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-nowrap">
          {questions.map((q, idx) => {
            const isSelected = idx === currentQuestionIndex;
            const isAns = selectedAnswers[q.questionId] !== undefined;
            const isChk = mode === 'practice' && checkedQuestions[q.questionId];
            const isRight = isChk && selectedAnswers[q.questionId] === q.answer;
            const isWrongAns = isChk && selectedAnswers[q.questionId] !== q.answer;

            let badgeClass = 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 border-slate-700';
            if (isRight) {
              badgeClass = 'bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/30';
            } else if (isWrongAns) {
              badgeClass = 'bg-rose-500 text-white border-rose-400 shadow-sm shadow-rose-500/30';
            } else if (isAns) {
              badgeClass = 'bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-600/30';
            }

            if (isSelected) {
              badgeClass += ' ring-2 ring-white ring-offset-2 ring-offset-[#101726] font-extrabold';
            }

            return (
              <button
                key={q.questionId}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                className={`min-w-[32px] h-8 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 ${badgeClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Progress Counter Badge */}
        <div className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <span className="text-white">{answeredCount}</span>/{totalCount} câu
        </div>
      </div>

      {/* Question Content Area */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
        {/* Header of Question: Number & Type */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs">
              Câu {(currentQuestionIndex + 1).toString().padStart(2, '0')}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-xs">
              {currentQ.questionType}
            </span>
            {currentQ.sourceVerified && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-[11px] items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" /> Đề gốc xác thực
              </span>
            )}
          </div>

          {/* Snippet Replay button if timestamp exists */}
          {(currentQ.listeningStartTime !== undefined || currentQ.startTime !== undefined) && (
            <button
              type="button"
              onClick={handleSnippetPlay}
              disabled={!canReplay && mode === 'exam'}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                canReplay || mode === 'practice'
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 hover:bg-teal-500/30 shadow-sm shadow-teal-500/10'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
              title="Phát lại đoạn nghe của câu hỏi này trên YouTube"
            >
              <Play className="w-3.5 h-3.5 fill-current text-teal-400" />
              <span>Nghe câu</span>
              {mode === 'exam' && replayLimit > 0 && (
                <span className="ml-1 text-[10px] bg-slate-900 px-1 rounded text-slate-400">
                  {timesReplayed}/{replayLimit}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, optIdx) => {
            const optionNum = optIdx + 1; // 1-based index
            const isChosen = currentAnswer === optionNum;
            const isOptionCorrect = currentQ.answer === optionNum;

            let optionStyle = 'bg-slate-900/50 border-slate-800 text-slate-200 hover:bg-slate-800/80 hover:border-slate-700';

            if (mode === 'practice' && isChecked) {
              if (isOptionCorrect) {
                optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
              } else if (isChosen && !isOptionCorrect) {
                optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
              } else {
                optionStyle = 'bg-slate-900/30 border-slate-800/50 text-slate-400';
              }
            } else if (isChosen) {
              optionStyle = 'bg-indigo-950/70 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/50';
            }

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => onSelectAnswer(currentQ.questionId, optionNum)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isChosen 
                      ? (mode === 'practice' && isChecked 
                          ? (isOptionCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')
                          : 'bg-indigo-500 text-white')
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {optionNum}
                  </span>
                  <span className="text-xs sm:text-sm leading-snug">{option}</span>
                </div>

                {mode === 'practice' && isChecked && (
                  <div className="shrink-0">
                    {isOptionCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : isChosen ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Practice Mode Action Buttons: Check Answer */}
        {mode === 'practice' && (
          <div className="flex items-center gap-3 pt-2">
            {!isChecked ? (
              <button
                type="button"
                disabled={currentAnswer === undefined}
                onClick={() => onCheckAnswer && onCheckAnswer(currentQ.questionId)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  currentAnswer !== undefined
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Kiểm tra đáp án</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                  isCorrect 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {isCorrect ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                  <span>{isCorrect ? 'Chính xác! (+5 XP)' : `Chưa đúng. Đáp án là câu [${currentQ.answer}]`}</span>
                </span>

                {currentQ.transcript && (
                  <button
                    type="button"
                    onClick={() => toggleTranscript(currentQ.questionId)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    <span>{showTranscript[currentQ.questionId] ? 'Ẩn Transcript' : 'Xem Transcript'}</span>
                  </button>
                )}

                {currentQ.explanation && (
                  <button
                    type="button"
                    onClick={() => toggleExplanation(currentQ.questionId)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showExplanation[currentQ.questionId] ? 'Ẩn Giải thích' : 'Xem Giải thích'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Practice Mode: Transcript Box */}
        {mode === 'practice' && isChecked && showTranscript[currentQ.questionId] && currentQ.transcript && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-teal-500/30 space-y-2">
            <h5 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              Kịch bản hội thoại (Transcript)
            </h5>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium">
              {currentQ.transcript}
            </p>
          </div>
        )}

        {/* Practice Mode: Explanation Box */}
        {mode === 'practice' && isChecked && showExplanation[currentQ.questionId] && currentQ.explanation && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-2">
            <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              Giải thích chi tiết
            </h5>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {currentQ.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Navigation & Submit */}
      <div className="p-3 sm:p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={currentQuestionIndex === 0}
          onClick={() => onSelectQuestion(Math.max(0, currentQuestionIndex - 1))}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
            currentQuestionIndex > 0
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Submit Button */}
          <button
            type="button"
            onClick={() => setShowConfirmSubmit(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp bài & Chấm điểm</span>
          </button>

          {/* Next Button */}
          {currentQuestionIndex < totalCount - 1 && (
            <button
              type="button"
              onClick={() => onSelectQuestion(currentQuestionIndex + 1)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <span>Câu sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#101726] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Xác nhận nộp bài</h4>
                <p className="text-xs text-slate-400">
                  Bạn đã trả lời <strong className="text-white">{answeredCount}</strong>/{totalCount} câu hỏi.
                </p>
              </div>
            </div>

            {answeredCount < totalCount && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                ⚠️ Vẫn còn {totalCount - answeredCount} câu chưa chọn đáp án. Bạn có chắc chắn muốn nộp bài để xem điểm ước tính?
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Làm tiếp
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmSubmit(false);
                  onSubmitExam();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
