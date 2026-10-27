import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Headphones, 
  Play, 
  Square, 
  HelpCircle, 
  RotateCcw, 
  ArrowLeft, 
  FileText, 
  Grid, 
  X, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Volume2, 
  BookOpen,
  ZoomIn,
  ZoomOut,
  Layers,
  Award
} from 'lucide-react';
import { DailyExam, ExamQuestion, UserProfile } from '../../types';
import { JLPT_SECTION_METAS, ExamSectionMode, renderFormattedQuestion } from '../DailyExamQuiz';
import { TappableJa, ReadingHelper, vocabIn } from './TappableJa';
import ShibaMascot from '../mascot/ShibaMascot';
import LiquidGlassButton from '../ui/LiquidGlassButton';

import { svgDataUri } from '../../utils/sanitizeHtml';
export interface JlptModernExamViewProps {
  exam: DailyExam;
  selectedSectionMode: ExamSectionMode;
  userProfile: UserProfile;
  userAnswers: Record<string, number>;
  onSelectOption: (questionId: string, optionIndex: number) => void;
  onSubmit: () => void;
  isSubmitted: boolean;
  onExit: () => void;
  flaggedQuestions: Record<string, boolean>;
  onToggleFlag: (questionId: string) => void;
  timeRemainingSeconds: number;
  formatTime: (sec: number) => string;
  onRestartExam: () => void;
  onSwitchViewFormat?: () => void;
  currentQuestionIndex: number;
  onJumpQuestion: (index: number) => void;
  isPlayingAudio: boolean;
  onToggleTTS: () => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  activeSectionFilter: string;
  onChangeSectionFilter: (section: string) => void;
}

export const JlptModernExamView: React.FC<JlptModernExamViewProps> = ({
  exam,
  selectedSectionMode,
  userProfile,
  userAnswers,
  onSelectOption,
  onSubmit,
  isSubmitted,
  onExit,
  flaggedQuestions,
  onToggleFlag,
  timeRemainingSeconds,
  formatTime,
  onRestartExam,
  onSwitchViewFormat,
  currentQuestionIndex,
  onJumpQuestion,
  isPlayingAudio,
  onToggleTTS,
  playbackRate,
  onChangePlaybackRate,
  activeSectionFilter,
  onChangeSectionFilter,
}) => {
  // UI Preferences & State
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);
  const [isReadingDrawerOpen, setIsReadingDrawerOpen] = useState<boolean>(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  // Chế độ luyện: chọn xong hiện đúng/sai + giải thích ngay (như openjlpt).
  const [instant, setInstant] = useState<boolean>(() => { try { return localStorage.getItem('exam-instant') === '1'; } catch { return false; } });
  const toggleInstant = () => setInstant(v => { const n = !v; try { localStorage.setItem('exam-instant', n ? '1' : '0'); } catch {} return n; });
  const [tapOn, setTapOn] = useState(true);
  const [keywords, setKeywords] = useState(false);
  const [isCardsOpen, setIsCardsOpen] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);
  const [cardFlip, setCardFlip] = useState(false);
  const [known, setKnown] = useState<Record<string, boolean>>({});
  const examContainerRef = useRef<HTMLDivElement>(null);

  // Filter questions according to active filter
  const activeQuestions = useMemo(() => {
    return exam.questions.filter(q => activeSectionFilter === 'ALL' || q.section === activeSectionFilter);
  }, [exam.questions, activeSectionFilter]);

  const currentQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  // Auto-save feedback animation
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
    }, 350);
    return () => clearTimeout(timer);
  }, [userAnswers, currentQuestionIndex]);

  // Ẩn menu dưới của app khi đang làm bài để không che nút Câu trước/Câu tiếp/Nộp bài.
  useEffect(() => {
    document.body.classList.add('exam-playing');
    return () => document.body.classList.remove('exam-playing');
  }, []);

  // Fullscreen toggling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      examContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Stats for Progress & Review
  const answeredCount = useMemo(() => {
    return activeQuestions.filter(q => userAnswers[q.id] !== undefined).length;
  }, [activeQuestions, userAnswers]);

  const flaggedCount = useMemo(() => {
    return activeQuestions.filter(q => flaggedQuestions[q.id]).length;
  }, [activeQuestions, flaggedQuestions]);

  const progressPercent = Math.round((answeredCount / (activeQuestions.length || 1)) * 100);

  // Thẻ ghi nhớ lấy từ chính đề vừa làm (từ vựng/ngữ pháp, không gồm nghe/đọc).
  const cards = useMemo(() => exam.questions.filter(q => q.section !== 'choukai' && q.section !== 'dokkai' && q.options[q.correctIndex]).map(q => {
    const br = (q.question || '').match(/【([^】]+)】/);
    const ans = q.options[q.correctIndex];
    return { id: q.id, front: br ? br[1] : q.question, back: ans, note: /^Đáp án theo bảng/.test(q.explanation || '') ? '' : (q.explanation || '') };
  }), [exam.questions]);

  // In đề: mở trang in gồm đề + phiếu tô đáp án + đáp án.
  const printExam = () => {
    const esc = (t: string) => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
    const qs = exam.questions;
    const body = qs.map((q, i) => `<div class="q">${q.paperHeading ? `<p class="h">${esc(q.paperHeading)}</p>` : ''}<p><b class="n">${q.paperNo ?? i + 1}</b> ${q.readingPassage ? `<span class="o">${esc(q.readingPassage).replace(/\n/g, '<br>')}</span><br>` : ''}${esc(q.question).replace(/\n/g, '<br>')}</p>${q.imageUrl ? `<img src="${esc(new URL(q.imageUrl, location.origin).href)}">` : ''}<p class="o">${q.options.map((o, k) => `${k + 1}. ${esc(o)}`).join('　　')}</p></div>`).join('');
    const sheet = qs.map((q, i) => `<div class="r"><span>${q.paperNo ?? i + 1}</span>${[1, 2, 3, 4].map(k => `<i>${k}</i>`).join('')}</div>`).join('');
    const key = qs.map((q, i) => `${q.paperNo ?? i + 1}:${q.correctIndex + 1}`).join('　');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><meta charset="utf-8"><title>${esc(exam.title)}</title><style>body{font:14px/1.9 "Noto Serif JP","Yu Mincho",serif;margin:24px;color:#000}.q{break-inside:avoid;margin:10px 0}.h{font-weight:700;border-bottom:1px solid #000}.n{border:1px solid #000;padding:0 4px}.o{margin-left:2em}img{max-width:100%;max-height:300px}.r{display:flex;gap:10px;align-items:center;margin:3px 0}.r span{width:30px}.r i{width:22px;height:22px;border:1px solid #000;border-radius:50%;text-align:center;font-style:normal;font-size:11px;line-height:22px}.pg{page-break-before:always}</style></head><body><h2>${esc(exam.title)}</h2>${body}<div class="pg"><h3>Phiếu tô đáp án</h3>${sheet}</div><div class="pg"><h3>Đáp án</h3><p>${key}</p></div><script>setTimeout(()=>print(),400)</script></body></html>`);
    w.document.close();
  };

  // Timer warning style calculation
  const isTimerCritical = timeRemainingSeconds > 0 && timeRemainingSeconds <= 300; // < 5 mins
  const isTimerWarning = timeRemainingSeconds > 300 && timeRemainingSeconds <= 600; // < 10 mins

  // Font size class mapping
  const questionFontClass = 
    fontSize === 'normal' ? 'text-base sm:text-lg leading-relaxed' :
    fontSize === 'large' ? 'text-lg sm:text-xl leading-relaxed' :
    'text-xl sm:text-2xl leading-loose';

  const optionFontClass = 
    fontSize === 'normal' ? 'text-sm sm:text-base' :
    fontSize === 'large' ? 'text-base sm:text-lg' :
    'text-lg sm:text-xl';

  // Check if current question is Reading (dokkai) with passage
  const isDokkaiQuestion = currentQuestion?.section === 'dokkai';
  const readingPassage = currentQuestion?.readingPassage || (isDokkaiQuestion ? currentQuestion?.contextPassage : undefined);

  return (
    <div 
      ref={examContainerRef}
      id="jlpt-modern-exam-container"
      className="flex flex-col min-h-screen bg-[#FDFBF7] text-[#1F2639] relative select-none font-sans"
    >
      {/* ================= TOP STICKY EXAM NAVIGATION BAR ================= */}
      <header 
        id="exam-top-sticky-bar"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EADFCF] shadow-xs px-3 sm:px-6 py-2.5 transition-all"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          
          {/* Left: Exam Identifier & Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => (isSubmitted ? onExit() : setIsExitConfirmOpen(true))}
              className="p-1.5 rounded-lg text-[#1F2639]/70 hover:text-[#1F2639] hover:bg-[#F4EDE2] transition cursor-pointer"
              title="Thoát bài thi về trang danh sách"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

          </div>

          {/* Center: Sticky Countdown Timer with calm alerts */}
          <div className="flex items-center justify-center whitespace-nowrap">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-all ${
              isTimerCritical 
                ? 'bg-[#FEF2F2] text-[#D82B3A] border-[#FCA5A5] ring-2 ring-[#D82B3A]/20 animate-pulse font-black' 
                : isTimerWarning 
                ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] font-bold' 
                : 'bg-[#FDF1E2]/60 text-[#1F2639] border-[#EADFCF] font-bold'
            }`}>
              <Clock className={`w-4 h-4 ${isTimerCritical ? 'text-[#D82B3A]' : 'text-[#F4A643]'}`} />
              <span className="font-mono text-sm sm:text-base tracking-tight">
                {formatTime(timeRemainingSeconds)}
              </span>
            </div>
          </div>

          {/* Right: Controls (Font Size, Focus Mode, Palette, Submit) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={toggleInstant} aria-pressed={instant} title="Chọn xong hiện đúng/sai và giải thích ngay" className={`h-8 px-2 rounded-lg border text-[11px] font-bold whitespace-nowrap cursor-pointer ${instant ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-white text-[#786D5E] border-[#EADFCF]'}`}>Hiện đáp án</button>
            <button onClick={() => setKeywords(k => !k)} aria-pressed={keywords} title="Tô nền các từ có trong từ điển (chạm từ để xem nghĩa)" className={`h-8 px-2 rounded-lg border text-[11px] font-bold whitespace-nowrap cursor-pointer ${keywords ? 'bg-[#FEF3C7] border-[#F59E0B]' : 'bg-white text-[#786D5E] border-[#EADFCF]'}`}>Từ khóa</button>
            <button onClick={() => { setCardIdx(0); setCardFlip(false); setIsCardsOpen(true); }} title="Thẻ ghi nhớ từ đề này" className="h-8 px-2 rounded-lg border border-[#EADFCF] bg-white text-[11px] font-bold whitespace-nowrap text-[#786D5E] cursor-pointer">Thẻ nhớ</button>
            <button onClick={printExam} title="In đề + phiếu đáp án" className="h-8 px-2 rounded-lg border border-[#EADFCF] bg-white text-[11px] font-bold whitespace-nowrap text-[#786D5E] cursor-pointer">In đề</button>
            <span className="px-1 font-mono text-xs font-bold whitespace-nowrap text-[#1F2639]" aria-label="Số câu đã làm">
              {answeredCount}/{activeQuestions.length}
            </span>
          </div>
        </div>

        {/* Horizontal Progress Meter */}
        <div className="max-w-6xl mx-auto mt-2">
          <div className="w-full bg-[#EADFCF] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#F4A643] to-[#D82B3A] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
      {/* Mục lục bên cạnh (màn rộng) */}
      <aside className="hidden xl:block sticky top-20 self-start shrink-0 w-56 ml-3 mt-6 max-h-[75vh] overflow-y-auto rounded-2xl border border-[#EADFCF] bg-white/95 p-3 shadow-xs" aria-label="Mục lục">
        <p className="mb-2 text-xs font-black">Mục lục · {answeredCount}/{activeQuestions.length}</p>
        <div className="grid grid-cols-5 gap-1.5">
          {activeQuestions.map((q, idx) => {
            const a = userAnswers[q.id]; const done = a !== undefined; const show = done && (instant || isSubmitted);
            const cls = idx === currentQuestionIndex ? 'bg-[#F4A643] text-slate-950 border-[#F4A643]'
              : show ? (q.correctIndex === a ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-[#D82B3A] text-white border-[#D82B3A]')
              : flaggedQuestions[q.id] ? 'bg-[#FEF3C7] border-[#F59E0B]' : done ? 'bg-[#1F2639] text-[#FDF1E2] border-[#1F2639]' : 'bg-[#FDFBF7] border-[#EADFCF]';
            return <button key={q.id} onClick={() => onJumpQuestion(idx)} className={`h-8 rounded-lg border text-[11px] font-mono cursor-pointer ${cls}`}>{idx + 1}</button>;
          })}
        </div>
      </aside>

      {/* ================= MAIN EXAM CONTENT BODY ================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 pb-28">
        
        {/* Question Area Container */}
        {currentQuestion ? (
          <div className="space-y-4">
            
            {/* Reading Split Layout: If reading section and has passage */}
            {isDokkaiQuestion && readingPassage ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Reading Passage Card */}
                <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-[#EADFCF] shadow-xs space-y-3 sticky top-20 max-h-[75vh] overflow-y-auto">
                  <div className="text-[#1F2639] font-medium text-base sm:text-lg leading-relaxed whitespace-pre-line tracking-wide font-sans">
                    {tapOn ? <TappableJa text={readingPassage} highlight={keywords} /> : renderFormattedQuestion(readingPassage)}
                  </div>
                  <ReadingHelper qid={currentQuestion.id} passage={readingPassage} question={currentQuestion.question} />
                </div>

                {/* Right: Question & Multiple Choices */}
                <div className="lg:col-span-6 space-y-4">
                  {renderQuestionCard()}
                </div>
              </div>
            ) : (
              /* Standard Layout for Vocab, Grammar, Listening */
              renderQuestionCard()
            )}

          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#EADFCF] p-8 shadow-xs">
            <HelpCircle className="w-12 h-12 text-[#F4A643] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1F2639]">Không có câu hỏi phù hợp</h3>
            <p className="text-xs text-[#786D5E] mt-1">Vui lòng chọn bộ lọc khác để làm bài.</p>
          </div>
        )}

      </main>
      </div>

      {/* ================= BOTTOM THUMB-FRIENDLY ACTION BAR ================= */}
      <footer 
        id="exam-bottom-action-bar"
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EADFCF] shadow-lg px-4 py-2.5 transition-all"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          
          {/* Previous Question Button */}
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => onJumpQuestion(Math.max(0, currentQuestionIndex - 1))}
            className="h-12 px-4 rounded-xl border border-[#EADFCF] bg-[#FDFBF7] hover:bg-[#F4EDE2] text-[#1F2639] font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4 text-[#F4A643]" />
            <span className="hidden sm:inline">Câu trước</span>
          </button>

          {/* Center: Flag & Quick Palette Access */}
          <div className="flex items-center gap-2">
            {currentQuestion && (
              <button
                onClick={() => onToggleFlag(currentQuestion.id)}
                className={`h-12 px-3.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  flaggedQuestions[currentQuestion.id]
                    ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]'
                    : 'bg-[#FDFBF7] text-[#786D5E] border-[#EADFCF] hover:text-[#1F2639]'
                }`}
                title="Ghim để xem lại trước khi nộp bài"
              >
                <Bookmark className={`w-4 h-4 ${flaggedQuestions[currentQuestion.id] ? 'fill-[#F59E0B] text-[#F59E0B]' : ''}`} />
                <span className="hidden md:inline">
                  {flaggedQuestions[currentQuestion.id] ? 'Đã ghim xem lại' : 'Ghim câu này'}
                </span>
              </button>
            )}

            <button
              onClick={() => setIsPaletteOpen(true)}
              className="h-12 px-4 rounded-xl bg-[#FDF1E2] hover:bg-[#F4EDE2] border border-[#EADFCF] text-[#1F2639] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Grid className="w-4 h-4 text-[#F4A643]" />
              <span>Bảng câu hỏi ({answeredCount}/{activeQuestions.length})</span>
            </button>
          </div>

          {/* Next Question or Submit Button */}
          {currentQuestionIndex < activeQuestions.length - 1 ? (
            <button
              onClick={() => onJumpQuestion(currentQuestionIndex + 1)}
              className="h-12 px-5 rounded-xl bg-[#F4A643] hover:bg-[#E89A3C] text-slate-950 font-black text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="hidden sm:inline">Câu tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsSubmitConfirmOpen(true)}
              className="h-12 px-5 rounded-xl bg-gradient-to-r from-[#D82B3A] to-[#B91C1C] hover:opacity-95 text-white font-black text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-md animate-pulse"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Nộp bài thi</span>
            </button>
          )}

        </div>
      </footer>

      {/* ================= QUESTION PALETTE BOTTOM SHEET / DRAWER ================= */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col border border-[#EADFCF] shadow-2xl animate-fade-in">
            
            {/* Palette Header */}
            <div className="p-4 border-b border-[#F4EDE2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FDF1E2] text-[#F4A643] flex items-center justify-center">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1F2639]">Danh sách câu hỏi</h3>
                  <p className="text-[11px] text-[#786D5E]">
                    Đã làm {answeredCount}/{activeQuestions.length} câu • {flaggedCount} câu ghim
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="p-1.5 rounded-lg text-[#786D5E] hover:text-[#1F2639] hover:bg-[#F4EDE2] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="px-4 py-2 bg-[#FDFBF7] border-b border-[#F4EDE2] flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#786D5E]">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-[#1F2639]" />
                <span>Đã làm</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-[#FEF3C7] border border-[#F59E0B]" />
                <span>Ghim xem lại</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-[#FDFBF7] border border-[#EADFCF]" />
                <span>Chưa làm</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-[#F4A643] text-slate-950" />
                <span>Đang chọn</span>
              </div>
            </div>

            {/* Grid of question buttons */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {activeQuestions.map((q, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions[q.id];

                  let btnStyle = 'bg-[#FDFBF7] text-[#1F2639] border-[#EADFCF] hover:border-[#F4A643]';
                  if (isCurrent) {
                    btnStyle = 'bg-[#F4A643] text-slate-950 font-black border-[#F4A643] ring-2 ring-[#F4A643]/40 shadow-sm';
                  } else if (isFlagged) {
                    btnStyle = 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B] font-bold';
                  } else if (isAnswered && (instant || isSubmitted)) {
                    btnStyle = q.correctIndex === userAnswers[q.id] ? 'bg-[#10B981] text-white border-[#10B981] font-bold' : 'bg-[#D82B3A] text-white border-[#D82B3A] font-bold';
                  } else if (isAnswered) {
                    btnStyle = 'bg-[#1F2639] text-[#FDF1E2] border-[#1F2639] font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        onJumpQuestion(idx);
                        setIsPaletteOpen(false);
                      }}
                      className={`h-10 rounded-xl border text-xs font-mono transition-all relative flex items-center justify-center cursor-pointer ${btnStyle}`}
                    >
                      {idx + 1}
                      {isFlagged && !isCurrent && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F59E0B] border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Palette Footer */}
            <div className="p-4 border-t border-[#F4EDE2] bg-[#FDFBF7] flex items-center justify-between">
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#786D5E] hover:bg-[#F4EDE2] transition cursor-pointer"
              >
                Đóng lại
              </button>
              <button
                onClick={() => {
                  setIsPaletteOpen(false);
                  setIsSubmitConfirmOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#D82B3A] hover:bg-[#B91C1C] text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Nộp bài thi ngay
              </button>
            </div>

          </div>
        </div>
      )}

      {isCardsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-[#EADFCF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm">Thẻ ghi nhớ · {cards.length ? cardIdx + 1 : 0}/{cards.length} · đã nhớ {cards.filter(c => known[c.id]).length}</h3>
              <button onClick={() => setIsCardsOpen(false)} aria-label="Đóng" className="p-1.5 rounded-lg hover:bg-[#F4EDE2] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            {cards[cardIdx] ? (
              <button onClick={() => setCardFlip(f => !f)} className="w-full min-h-[200px] rounded-2xl border border-[#EADFCF] bg-[#FDFBF7] p-5 text-center cursor-pointer flex flex-col items-center justify-center gap-3">
                <span className="text-xl font-bold whitespace-pre-line leading-relaxed">{cardFlip ? cards[cardIdx].back : cards[cardIdx].front}</span>
                {cardFlip && cards[cardIdx].note && <span className="text-xs text-[#786D5E] whitespace-pre-line">{cards[cardIdx].note}</span>}
                {!cardFlip && <span className="text-[11px] text-[#786D5E]">Chạm để xem đáp án</span>}
              </button>
            ) : <p className="text-sm text-[#786D5E]">Đề này chưa có thẻ.</p>}
            <div className="flex gap-2">
              <button disabled={cardIdx === 0} onClick={() => { setCardIdx(i => i - 1); setCardFlip(false); }} className="h-11 px-4 rounded-xl border border-[#EADFCF] font-bold text-sm disabled:opacity-30 cursor-pointer">‹</button>
              <button onClick={() => { const c = cards[cardIdx]; if (c) setKnown(k => ({ ...k, [c.id]: !k[c.id] })); }} className={`flex-1 h-11 rounded-xl font-bold text-sm cursor-pointer ${cards[cardIdx] && known[cards[cardIdx].id] ? 'bg-[#10B981] text-white' : 'border border-[#EADFCF]'}`}>{cards[cardIdx] && known[cards[cardIdx].id] ? 'Đã nhớ ✓' : 'Đã nhớ'}</button>
              <button disabled={cardIdx >= cards.length - 1} onClick={() => { setCardIdx(i => i + 1); setCardFlip(false); }} className="h-11 px-4 rounded-xl border border-[#EADFCF] font-bold text-sm disabled:opacity-30 cursor-pointer">›</button>
            </div>
          </div>
        </div>
      )}

      {isExitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-[#EADFCF] shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#1F2639]">Thoát bài thi?</h3>
            <p className="text-xs text-[#786D5E]">Đáp án đã chọn được lưu. Bạn có thể bấm "Tiếp tục" ở danh sách đề để làm tiếp (đồng hồ sẽ tính lại từ đầu).</p>
            <div className="flex gap-2">
              <button onClick={() => setIsExitConfirmOpen(false)} className="flex-1 h-11 rounded-xl border border-[#EADFCF] font-bold text-sm cursor-pointer">Làm tiếp</button>
              <button onClick={onExit} className="flex-1 h-11 rounded-xl bg-[#D82B3A] text-white font-bold text-sm cursor-pointer">Thoát</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRE-SUBMISSION CONFIRMATION MODAL ================= */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#EADFCF] shadow-2xl space-y-5 animate-fade-in">
            
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <ShibaMascot
                  pose={activeQuestions.length - answeredCount > 0 ? 'warning' : 'celebrating'}
                  size="sm"
                  animated={false}
                />
              </div>
              <h3 className="text-lg font-black text-[#1F2639]">Xác nhận nộp bài thi JLPT</h3>
              <p className="text-xs text-[#786D5E]">
                {activeQuestions.length - answeredCount > 0
                  ? 'Nihon Shiba nhắc bạn kiểm tra kỹ trước khi bấm nộp bài nhé!'
                  : 'Bạn đã hoàn thành tất cả câu hỏi! Hãy cùng xem kết quả thi nhé.'}
              </p>
            </div>

            {/* Quick Status Breakdown */}
            <div className="grid grid-cols-3 gap-2 bg-[#FDFBF7] p-3 rounded-xl border border-[#EADFCF] text-center">
              <div>
                <span className="block text-[10px] text-[#786D5E] font-semibold">Đã hoàn thành</span>
                <span className="font-mono text-base font-bold text-[#10B981]">
                  {answeredCount} / {activeQuestions.length}
                </span>
              </div>
              <div className="border-x border-[#EADFCF]">
                <span className="block text-[10px] text-[#786D5E] font-semibold">Chưa làm</span>
                <span className="font-mono text-base font-bold text-[#D82B3A]">
                  {activeQuestions.length - answeredCount}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#786D5E] font-semibold">Đang ghim</span>
                <span className="font-mono text-base font-bold text-[#F59E0B]">
                  {flaggedCount}
                </span>
              </div>
            </div>

            {/* Warning if unanswered questions exist */}
            {activeQuestions.length - answeredCount > 0 && (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] p-3 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Bạn còn {activeQuestions.length - answeredCount} câu chưa chọn đáp án!</span>
                  <p className="text-[11px] opacity-90">Điểm của các câu chưa làm sẽ tính là 0 điểm.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-1 pt-2">
              <LiquidGlassButton label="Xác nhận nộp bài" doneLabel="Đã nộp" busyText="Đang nộp bài" onDone={() => { setIsSubmitConfirmOpen(false); onSubmit(); }} />
              <button
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="py-2 px-4 rounded-xl text-[#1F2639] font-bold text-xs hover:bg-[#F4EDE2] transition cursor-pointer"
              >
                Quay lại làm tiếp
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );

  // Helper renderer for Question Card & Multiple Choice options
  function renderQuestionCard() {
    if (!currentQuestion) return null;

    return (
      <div className="exam-question-surface bg-white rounded-2xl p-5 sm:p-7 border border-[#EADFCF] shadow-sm space-y-6">
        
        {/* Choukai Audio Player (if listening section) */}
        {currentQuestion.section === 'choukai' && (currentQuestion.audioScript || currentQuestion.audioUrl || currentQuestion.audioTrack) && (
          <div className="bg-[#1F2639] text-[#FDF1E2] rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl bg-[#F4A643]/20 text-[#F4A643] flex items-center justify-center ${isPlayingAudio ? 'animate-pulse' : ''}`}>
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider text-[#F4A643] uppercase">Phần thi Nghe Hiểu (Choukai)</h4>
                  <p className="text-[11px] text-[#A6B2C8] font-mono">
                    {isPlayingAudio ? 'Đang phát âm thanh đề thi...' : 'Nhấn nút phát bên dưới để nghe'}
                  </p>
                </div>
              </div>

              {/* Playback speed selector */}
              <div className="flex items-center gap-1 bg-[#121724] px-2 py-1 rounded-lg border border-[#2D3748]">
                <span className="text-[10px] text-[#A6B2C8]">Tốc độ:</span>
                {[0.8, 1.0, 1.2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => onChangePlaybackRate(rate)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      playbackRate === rate ? 'bg-[#F4A643] text-slate-950 font-bold' : 'text-[#A6B2C8] hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Play Button & Waveform */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={onToggleTTS}
                className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
                  isPlayingAudio 
                    ? 'bg-[#D82B3A] text-white hover:bg-[#B91C1C]' 
                    : 'bg-[#F4A643] text-slate-950 hover:bg-[#E89A3C]'
                }`}
              >
                {isPlayingAudio ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                <span>{isPlayingAudio ? 'Dừng phát' : 'Phát bài nghe'}</span>
              </button>

              <div className="flex-1 flex items-end gap-1 h-8 px-2 overflow-hidden">
                {isPlayingAudio ? (
                  Array.from({ length: 32 }).map((_, i) => {
                    const delay = (i % 6) * 0.1;
                    const height = [14, 24, 10, 28, 8, 20, 12, 26, 10, 18][i % 10];
                    return (
                      <div 
                        key={i} 
                        className="w-1 bg-[#F4A643] rounded-full transition-all animate-bounce shrink-0" 
                        style={{ 
                          height: `${height}px`,
                          animationDelay: `${delay}s`,
                          animationDuration: '0.7s'
                        }} 
                      />
                    );
                  })
                ) : (
                  Array.from({ length: 32 }).map((_, i) => (
                    <div key={i} className="w-1 bg-slate-700 rounded-full h-1.5 shrink-0" />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Question Text Body */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-[#786D5E]">
            <span className="px-2 py-0.5 rounded-md border border-[#EADFCF]">{exam.level}</span>
            <span>{JLPT_SECTION_METAS[currentQuestion.section]?.name}</span>
            <span className="ml-auto font-mono">Câu {currentQuestionIndex + 1}/{activeQuestions.length}</span>
          </div>
          {currentQuestion.paperNo != null ? (
            <div className="rounded-xl border border-[#EADFCF] bg-white px-4 py-4 text-[#111] font-[var(--font-jp)]">
              {currentQuestion.paperHeading && (
                <p className="mb-4 pb-3 text-[15px] font-bold leading-8 tracking-wide" style={{ borderBottom: '1px solid #111' }}>
                  {renderFormattedQuestion(currentQuestion.paperHeading, true)}
                </p>
              )}
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-1 min-w-[2rem] px-1 text-center text-[13px] font-black leading-6" style={{ border: '1.5px solid #111' }}>{currentQuestion.paperNo}</span>
                <p className="flex-1 whitespace-pre-line text-[17px] leading-9 tracking-[0.12em] font-medium">
                  {renderFormattedQuestion(currentQuestion.question, true)}
                </p>
              </div>
            </div>
          ) : (
          <p className={`exam-prompt font-bold text-[#1F2639] whitespace-pre-line tracking-wide font-sans ${questionFontClass}`}>
            {tapOn && currentQuestion.section === 'dokkai' ? <TappableJa text={currentQuestion.question} highlight={keywords} /> : renderFormattedQuestion(currentQuestion.question)}
          </p>
          )}

          {/* Visual illustration diagram SVG / Image if present */}
          {currentQuestion.imageSvg && (
            <div className="my-3 p-4 rounded-2xl border border-[#EADFCF] bg-[#FDFBF7] flex justify-center items-center overflow-x-auto"><img src={svgDataUri(currentQuestion.imageSvg)} alt="Hình minh họa câu hỏi" className="max-w-full h-auto" /></div>
          )}
          {currentQuestion.imageUrl && (
            <div className="my-3 p-4 rounded-2xl border border-[#EADFCF] bg-[#FDFBF7] flex justify-center items-center overflow-hidden">
              <img src={currentQuestion.imageUrl} alt="Hình minh họa câu hỏi" className="max-h-[75vh] max-w-full object-contain rounded-xl" />
            </div>
          )}
        </div>

        {/* Multiple Choice Option Cards */}
        <div className={currentQuestion.paperNo != null && currentQuestion.options.every(o => o.length <= 9) ? 'grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2' : 'space-y-2.5 pt-2'}>
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = userAnswers[currentQuestion.id] === optIdx;
            const isCorrect = currentQuestion.correctIndex === optIdx;
            const reveal = isSubmitted || (instant && userAnswers[currentQuestion.id] !== undefined);

            let cardStyle = 'exam-answer';
            if (reveal) {
              if (isCorrect) {
                cardStyle = 'exam-answer exam-answer-correct';
              } else if (isSelected) {
                cardStyle = 'exam-answer exam-answer-wrong';
              } else {
                cardStyle = 'exam-answer opacity-50';
              }
            } else if (isSelected) {
              cardStyle = 'exam-answer exam-answer-selected';
            }

            return (
              <button
                key={optIdx}
                disabled={reveal}
                aria-pressed={isSelected}
                onClick={() => onSelectOption(currentQuestion.id, optIdx)}
                className={`w-full min-h-[56px] p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${cardStyle}`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className={`w-7 h-7 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0 border transition-all ${
                    isSelected 
                      ? 'bg-[#1F2639] text-[#F4A643] border-[#1F2639]' 
                      : 'bg-[#F4EDE2] text-[#786D5E] border-[#EADFCF]'
                  }`}>
                    {optIdx + 1}
                  </span>
                  <span className={`${optionFontClass} leading-relaxed break-keep`}>{option}</span>
                </div>

                {!reveal && isSelected && <Check className="w-4 h-4 stroke-[3] shrink-0 ml-2 text-[#F4A643]" aria-hidden />}
                {reveal && isCorrect && (
                  <span className="text-[#10B981] font-bold text-xs flex items-center gap-1 shrink-0 ml-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Đúng</span>
                  </span>
                )}
                {reveal && isSelected && !isCorrect && (
                  <span className="text-[#D82B3A] font-bold text-xs shrink-0 ml-2">
                    ✗<span className="hidden sm:inline"> Bạn chọn</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {(isSubmitted || (instant && userAnswers[currentQuestion.id] !== undefined)) && (
          <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-sm leading-relaxed space-y-2 text-[#1F2639]">
            <p className="font-bold text-[#047857]">Đáp án đúng: {currentQuestion.correctIndex + 1}. {currentQuestion.options[currentQuestion.correctIndex]}</p>
            {currentQuestion.explanation && <p className="whitespace-pre-line">{currentQuestion.explanation}</p>}
            {Array.isArray(currentQuestion.optionExplanations) && (
              <ul className="space-y-1 text-[13px]">
                {currentQuestion.optionExplanations.map((t, k) => t ? <li key={k}><b>{k + 1}.</b> {t}</li> : null)}
              </ul>
            )}
            {currentQuestion.section !== 'choukai' && (() => { const w = vocabIn(`${currentQuestion.question} ${currentQuestion.options.join(' ')}`).slice(0, 8); return w.length ? <p className="text-[13px]"><b>Từ trong câu:</b> {w.map(x => `${x.word} (${x.reading}) = ${x.meaning}`).join(' · ')}</p> : null; })()}
            {currentQuestion.audioScript && <p className="text-[13px] text-[#786D5E] whitespace-pre-line">🎧 {currentQuestion.audioScript}</p>}
          </div>
        )}

      </div>
    );
  }
};
