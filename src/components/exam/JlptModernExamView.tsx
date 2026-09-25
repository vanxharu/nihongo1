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
import ShibaMascot from '../mascot/ShibaMascot';

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
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
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
              onClick={onExit}
              className="p-1.5 rounded-lg text-[#1F2639]/70 hover:text-[#1F2639] hover:bg-[#F4EDE2] transition cursor-pointer"
              title="Thoát bài thi về trang danh sách"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full font-black text-xs bg-[#1F2639] text-[#FDF1E2] tracking-wider uppercase shadow-2xs">
                {exam.level}
              </span>
              <div className="hidden sm:block">
                <h2 className="text-xs font-bold text-[#1F2639] line-clamp-1 max-w-[220px]">
                  {exam.title}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] text-[#786D5E]">
                  <span>{activeQuestions.length} câu hỏi</span>
                  <span>•</span>
                  <span className="text-[#10B981] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    {saveStatus === 'saving' ? 'Đang lưu...' : 'Đã tự động lưu'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Sticky Countdown Timer with calm alerts */}
          <div className="flex items-center justify-center">
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Font Size Selector */}
            <div className="hidden md:flex items-center bg-[#F4EDE2] p-0.5 rounded-lg border border-[#EADFCF]">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${fontSize === 'normal' ? 'bg-white shadow-2xs text-[#1F2639]' : 'text-[#786D5E] hover:text-[#1F2639]'}`}
                title="Cỡ chữ tiêu chuẩn"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${fontSize === 'large' ? 'bg-white shadow-2xs text-[#1F2639]' : 'text-[#786D5E] hover:text-[#1F2639]'}`}
                title="Cỡ chữ lớn vừa"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('huge')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${fontSize === 'huge' ? 'bg-white shadow-2xs text-[#1F2639]' : 'text-[#786D5E] hover:text-[#1F2639]'}`}
                title="Cỡ chữ cực đại"
              >
                A++
              </button>
            </div>

            {/* Focus Mode Toggle */}
            <button
              onClick={() => setIsFocusMode(prev => !prev)}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                isFocusMode 
                  ? 'bg-[#1F2639] text-[#F4A643] ring-1 ring-[#F4A643]' 
                  : 'bg-[#F4EDE2] text-[#786D5E] hover:text-[#1F2639] hover:bg-[#EADFCF]'
              }`}
              title={isFocusMode ? 'Tắt chế độ tập trung cao' : 'Bật chế độ tập trung Zen (ẩn yếu tố phụ)'}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">{isFocusMode ? 'Zen: Bật' : 'Zen'}</span>
            </button>

            {/* Switch to Authentic Paper Booklet Mode */}
            {onSwitchViewFormat && (
              <button
                onClick={onSwitchViewFormat}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#FDF1E2] hover:bg-[#F4EDE2] text-[#7A3E12] border border-[#EADFCF] transition cursor-pointer"
                title="Chuyển sang chế độ vẽ bút trên Đề Giấy Thi Thật"
              >
                <FileText className="w-3.5 h-3.5 text-[#F4A643]" />
                <span className="hidden xl:inline">Đề Giấy Thi Thật</span>
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-[#F4EDE2] hover:bg-[#EADFCF] text-[#786D5E] hover:text-[#1F2639] transition cursor-pointer"
              title="Toàn màn hình phòng thi"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Question Palette Trigger */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#1F2639] hover:bg-[#2A344D] text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Mở danh sách câu hỏi"
            >
              <Grid className="w-3.5 h-3.5 text-[#F4A643]" />
              <span className="font-mono">{answeredCount}/{activeQuestions.length}</span>
            </button>
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

      {/* ================= MAIN EXAM CONTENT BODY ================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 pb-28">
        
        {/* Section Category Header (When ALL is active) */}
        {!isFocusMode && selectedSectionMode === 'ALL' && (
          <div className="mb-4 flex items-center justify-between flex-wrap gap-2 bg-white rounded-xl p-2.5 border border-[#EADFCF] shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pb-0.5">
              <span className="text-[11px] text-[#786D5E] shrink-0 mr-1">Phần thi:</span>
              {(['ALL', 'moji-goi', 'bunpou', 'dokkai', 'choukai'] as const).map(sec => {
                const isSelected = activeSectionFilter === sec;
                const meta = JLPT_SECTION_METAS[sec];
                const count = sec === 'ALL' 
                  ? exam.questions.length 
                  : exam.questions.filter(q => q.section === sec).length;
                if (count === 0 && sec !== 'ALL') return null;

                return (
                  <button
                    key={sec}
                    onClick={() => {
                      onChangeSectionFilter(sec);
                      onJumpQuestion(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-xs ${
                      isSelected 
                        ? 'bg-[#1F2639] text-[#FDF1E2] shadow-xs font-bold' 
                        : 'bg-[#FDFBF7] text-[#786D5E] hover:bg-[#F4EDE2] hover:text-[#1F2639] border border-[#EADFCF]'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.shortName}</span>
                    <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-[#EADFCF]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Area Container */}
        {currentQuestion ? (
          <div className="space-y-4">
            
            {/* Reading Split Layout: If reading section and has passage */}
            {isDokkaiQuestion && readingPassage ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Reading Passage Card */}
                <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-[#EADFCF] shadow-xs space-y-3 sticky top-20 max-h-[75vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F4EDE2]">
                    <span className="px-2 py-0.5 rounded-md bg-[#FDF1E2] text-[#7A3E12] text-xs font-bold flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#F4A643]" />
                      Đoạn văn đọc hiểu (読解本文)
                    </span>
                    <span className="text-[11px] text-[#786D5E] font-medium">Cuộn để đọc toàn bài</span>
                  </div>
                  <div className="text-[#1F2639] font-medium text-base sm:text-lg leading-relaxed whitespace-pre-line tracking-wide font-sans">
                    {renderFormattedQuestion(readingPassage)}
                  </div>
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

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#EADFCF] text-[#1F2639] font-bold text-xs hover:bg-[#F4EDE2] transition cursor-pointer"
              >
                Quay lại làm tiếp
              </button>
              <button
                onClick={() => {
                  setIsSubmitConfirmOpen(false);
                  onSubmit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D82B3A] to-[#B91C1C] hover:opacity-95 text-white font-bold text-xs transition cursor-pointer shadow-md"
              >
                Xác nhận nộp bài
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
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#EADFCF] shadow-sm space-y-6">
        
        {/* Question Header & Meta */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F4EDE2]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#FDF1E2] text-[#7A3E12] font-mono text-xs font-black">
              Câu {currentQuestionIndex + 1} / {activeQuestions.length}
            </span>
            <span className="text-xs font-bold text-[#786D5E]">
              {JLPT_SECTION_METAS[currentQuestion.section]?.name || 'Kiến thức ngôn ngữ'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Save to Notebook Shortcut */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('save_to_notebook', {
                    detail: {
                      kanji: currentQuestion.question.replace(/[【】\[\]]/g, ''),
                      meaning: currentQuestion.explanation || currentQuestion.hint || currentQuestion.options[currentQuestion.correctIndex],
                      level: exam.level,
                      note: `JLPT ${exam.level}: ${exam.title}`,
                      source: 'exam'
                    }
                  })
                );
              }}
              className="px-2 py-1 rounded-lg text-xs font-semibold text-[#786D5E] hover:text-[#1F2639] hover:bg-[#F4EDE2] transition flex items-center gap-1 cursor-pointer"
              title="Lưu câu hỏi/từ vựng vào Sổ tay"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lưu sổ tay</span>
            </button>
          </div>
        </div>

        {/* Choukai Audio Player (if listening section) */}
        {currentQuestion.section === 'choukai' && (currentQuestion.audioScript || currentQuestion.audioUrl) && (
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
          <p className={`font-bold text-[#1F2639] whitespace-pre-line tracking-wide font-sans ${questionFontClass}`}>
            {renderFormattedQuestion(currentQuestion.question)}
          </p>

          {currentQuestion.hint && !isFocusMode && (
            <div className="p-3 rounded-xl bg-[#FDF1E2]/70 border border-[#EADFCF] text-xs text-[#7A3E12] flex items-start gap-2">
              <span className="font-bold shrink-0">💡 Gợi ý:</span>
              <span className="leading-relaxed">{currentQuestion.hint}</span>
            </div>
          )}

          {/* Visual illustration diagram SVG / Image if present */}
          {currentQuestion.imageSvg && (
            <div className="my-3 p-4 rounded-2xl border border-[#EADFCF] bg-[#FDFBF7] flex justify-center items-center overflow-x-auto" dangerouslySetInnerHTML={{ __html: currentQuestion.imageSvg }} />
          )}
          {currentQuestion.imageUrl && (
            <div className="my-3 p-4 rounded-2xl border border-[#EADFCF] bg-[#FDFBF7] flex justify-center items-center overflow-hidden">
              <img src={currentQuestion.imageUrl} alt="Hình minh họa câu hỏi" className="max-h-72 object-contain rounded-xl" />
            </div>
          )}
        </div>

        {/* Multiple Choice Option Cards */}
        <div className="space-y-2.5 pt-2">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = userAnswers[currentQuestion.id] === optIdx;
            const isCorrect = currentQuestion.correctIndex === optIdx;

            let cardStyle = 'bg-white border-[#EADFCF] text-[#1F2639] hover:bg-[#FDF1E2]/40 hover:border-[#F4A643]';
            if (isSubmitted) {
              if (isCorrect) {
                cardStyle = 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-bold';
              } else if (isSelected) {
                cardStyle = 'bg-[#FEF2F2] border-[#D82B3A] text-[#991B1B] font-bold';
              } else {
                cardStyle = 'bg-[#FDFBF7] border-[#EADFCF] text-[#786D5E] opacity-50';
              }
            } else if (isSelected) {
              cardStyle = 'bg-[#FFF8EE] border-[#F4A643] ring-2 ring-[#F4A643] text-[#1F2639] font-bold shadow-xs';
            }

            return (
              <button
                key={optIdx}
                disabled={isSubmitted}
                onClick={() => onSelectOption(currentQuestion.id, optIdx)}
                className={`w-full min-h-[56px] p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${cardStyle}`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <span className={`w-7 h-7 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0 border transition-all ${
                    isSelected 
                      ? 'bg-[#1F2639] text-[#F4A643] border-[#1F2639]' 
                      : 'bg-[#F4EDE2] text-[#786D5E] border-[#EADFCF]'
                  }`}>
                    {optIdx + 1}
                  </span>
                  <span className={`${optionFontClass} leading-relaxed`}>{option}</span>
                </div>

                {isSubmitted && isCorrect && (
                  <span className="text-[#10B981] font-bold text-xs flex items-center gap-1 shrink-0 ml-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Đúng
                  </span>
                )}
                {isSubmitted && isSelected && !isCorrect && (
                  <span className="text-[#D82B3A] font-bold text-xs shrink-0 ml-2">
                    ✗ Bạn chọn
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    );
  }
};
