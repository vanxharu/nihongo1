import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Award,
  Zap,
  X,
  Send,
  Loader2,
  Bot,
  ListChecks,
  Check
} from 'lucide-react';
import { GrammarItem, GrammarExample, GrammarExercise, UserGrammarProgress } from '../../types';
import { askAiTutor } from '../../services/grammarAI';

interface GrammarLessonStudyViewProps {
  grammarItem: GrammarItem;
  onBackToCatalog: () => void;
  onOpenAiGeneratorModal: (item: GrammarItem) => void;
  onRecordProgress: (params: {
    grammarId: string;
    isCorrect: boolean;
    score?: number;
    mistakeText?: string;
  }) => Promise<UserGrammarProgress | null>;
  handleSpeak: (text: string) => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
}

export const GrammarLessonStudyView: React.FC<GrammarLessonStudyViewProps> = ({
  grammarItem,
  onBackToCatalog,
  onOpenAiGeneratorModal,
  onRecordProgress,
  handleSpeak,
  onNextLesson,
  onPrevLesson
}) => {
  // 3 Steps: 1: Học (Theory & Examples), 2: Kiểm tra (Quiz with many questions), 3: Đánh giá (Evaluation & Feedback)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 2 (Quiz - Exercises) State
  const exercises: GrammarExercise[] = useMemo(() => {
    if (grammarItem.exercises && grammarItem.exercises.length > 0) {
      return grammarItem.exercises;
    }
    // Rich procedural fallback exercises if grammar item has no preset exercises
    const struct = grammarItem.structure || 'Mẫu ngữ pháp';
    const mean = grammarItem.meaning || 'Ý nghĩa';
    const exJp = grammarItem.exampleSentence || `${struct}を使います。`;
    const exVi = grammarItem.exampleTranslation || mean;

    return [
      {
        id: 'auto_ex_1',
        type: 'multiple_choice',
        question: `Mẫu ngữ pháp 【${struct}】 mang ý nghĩa chính là gì?`,
        choices: [
          mean,
          `Diễn tả sự phủ định hoàn toàn hành động`,
          `Diễn tả việc bắt buộc phải làm theo mệnh lệnh`,
          `Diễn tả điều ước không thể xảy ra trong quá khứ`
        ],
        correct_answer: mean,
        explanation: `Mẫu 【${struct}】 có nghĩa là "${mean}".`,
        sentence_full: exJp,
        translation: exVi
      },
      {
        id: 'auto_ex_2',
        type: 'multiple_choice',
        question: `Chọn câu tiếng Nhật đúng quy tắc kết hợp của mẫu 【${struct}】:`,
        choices: [
          exJp,
          exJp.replace(struct, '... sai cấu trúc ...'),
          `田中さんは日本語を${struct}でした。`,
          `明日雨が${struct}かもしれません。`
        ],
        correct_answer: exJp,
        explanation: grammarItem.explanation || `Áp dụng đúng cấu trúc ngữ pháp 【${struct}】.`,
        sentence_full: exJp,
        translation: exVi
      },
      {
        id: 'auto_ex_3',
        type: 'multiple_choice',
        question: `Khi sử dụng mẫu 【${struct}】, điểm quan trọng nhất cần lưu ý là:`,
        choices: [
          `Quy tắc kết hợp và ngữ cảnh phù hợp của mẫu 【${struct}】`,
          `Luôn phải đi với động từ ở thể quá khứ (thể た)`,
          `Chỉ dùng được trong văn bản lịch sự trang trọng, cấm dùng trong giao tiếp`,
          `Không bao giờ được dùng trợ từ を trong câu`
        ],
        correct_answer: `Quy tắc kết hợp và ngữ cảnh phù hợp của mẫu 【${struct}】`,
        explanation: `Cần nắm rõ cấu trúc chia thể và bối cảnh sử dụng của 【${struct}】.`,
        sentence_full: exJp,
        translation: exVi
      },
      {
        id: 'auto_ex_4',
        type: 'multiple_choice',
        question: `【Dịch câu】: Chọn câu tiếng Nhật tương ứng với nghĩa "${exVi}":`,
        choices: [
          exJp,
          `毎日日本語を勉強しています。`,
          `昨日は友達と映画を見に行きました。`,
          `これは私が作った料理です。`
        ],
        correct_answer: exJp,
        explanation: `Câu 「${exJp}」 biểu đạt chính xác nghĩa "${exVi}".`,
        sentence_full: exJp,
        translation: exVi
      },
      {
        id: 'auto_ex_5',
        type: 'multiple_choice',
        question: `Cấp độ JLPT phù hợp của mẫu ngữ pháp 【${struct}】 là:`,
        choices: [
          grammarItem.level || 'N4',
          grammarItem.level === 'N5' ? 'N1' : 'N5',
          'N1 Cao cấp',
          'N2 Trung cao cấp'
        ],
        correct_answer: grammarItem.level || 'N4',
        explanation: `Mẫu ngữ pháp này thuộc phạm vi chương trình kiến thức ${grammarItem.level || 'N4'}.`,
        sentence_full: exJp,
        translation: exVi
      }
    ];
  }, [grammarItem]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<Array<{
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>>([]);

  // STEP 3 (Evaluation) State
  const [aiEvaluationFeedback, setAiEvaluationFeedback] = useState<string>('');

  // AI Tutor Modal / Drawer State
  const [showAiTutor, setShowAiTutor] = useState<boolean>(false);
  const [aiTutorInput, setAiTutorInput] = useState<string>('');
  const [aiTutorLoading, setAiTutorLoading] = useState<boolean>(false);
  const [aiTutorMessages, setAiTutorMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Xin chào! Tôi là Trợ giảng AI. Bạn có thắc mắc gì về mẫu ngữ pháp 【${grammarItem.structure}】 (${grammarItem.meaning}) không? Hãy chọn câu hỏi nhanh bên dưới hoặc nhập câu hỏi của bạn nhé!`
    }
  ]);

  // Examples list
  const examples: GrammarExample[] = useMemo(() => {
    if (grammarItem.examples && grammarItem.examples.length > 0) {
      return grammarItem.examples;
    }
    return [
      {
        japanese: grammarItem.exampleSentence || `${grammarItem.structure}。`,
        vietnamese: grammarItem.exampleTranslation || grammarItem.meaning,
        explanation: grammarItem.explanation,
        context: 'Ví dụ tiêu biểu'
      }
    ];
  }, [grammarItem]);

  // Question refs for smooth scrolling from navigator
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const scrollToQuestion = (index: number) => {
    const el = questionRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Submit Quiz (Step 2 -> Step 3)
  const handleSubmitQuiz = async () => {
    const results = exercises.map((ex, idx) => {
      const userAns = selectedAnswers[idx] || '';
      const isCorrect = userAns.trim() === ex.correct_answer.trim();
      return {
        questionId: ex.id || `q_${idx}`,
        question: ex.question,
        userAnswer: userAns,
        correctAnswer: ex.correct_answer,
        isCorrect,
        explanation: ex.explanation
      };
    });

    setQuizResults(results);

    const correctCount = results.filter(r => r.isCorrect).length;
    const total = results.length;
    const score = Math.round((correctCount / total) * 100);
    const isOverallPass = score >= 70;

    const firstWrong = results.find(r => !r.isCorrect);
    const mistakeText = firstWrong ? `Sai câu: ${firstWrong.question} (Chọn: ${firstWrong.userAnswer})` : undefined;

    // AI summary feedback
    let feedback = '';
    if (score === 100) {
      feedback = `🎉 Xuất sắc! Bạn đã đạt điểm tuyệt đối 100% cho bài kiểm tra mẫu ngữ pháp 【${grammarItem.structure}】. Nắm vững hoàn toàn quy tắc chia thể, phân biệt sắc thái và tránh mọi bẫy đề thi!`;
    } else if (score >= 80) {
      feedback = `👏 Rất tốt! Bạn đạt ${score}% điểm (${correctCount}/${total} câu đúng). Bạn đã hiểu rõ bản chất cốt lõi của mẫu ngữ pháp, chỉ cần chú ý thêm một vài câu bẫy chi tiết.`;
    } else if (score >= 70) {
      feedback = `✅ Bạn đã vượt qua bài kiểm tra (${score}% - ${correctCount}/${total} câu đúng). Hãy xem lại giải thích ở các câu chưa chính xác để củng cố thêm nhé!`;
    } else {
      feedback = `⚠️ Bạn đạt ${score}% (${correctCount}/${total} câu đúng). Mẫu ngữ pháp 【${grammarItem.structure}】 cần chú ý kỹ hơn về quy tắc biến đổi thể và chủ thể thực hiện hành động. Hãy xem lại phần lý thuyết và làm lại bài kiểm tra nhé!`;
    }
    setAiEvaluationFeedback(feedback);

    await onRecordProgress({
      grammarId: grammarItem.id,
      isCorrect: isOverallPass,
      score,
      mistakeText
    });

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retake Quiz
  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setQuizResults([]);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // AI Tutor Quick Action / Chat
  const handleAskAiTutor = async (quickAction?: 'easier_explanation' | 'more_examples' | 'find_error' | 'more_exercise') => {
    const query = aiTutorInput.trim();
    if (!quickAction && !query) return;

    let userLabel = query;
    if (quickAction === 'easier_explanation') userLabel = '💡 Giải thích dễ hiểu hơn';
    else if (quickAction === 'more_examples') userLabel = '📝 Cho thêm 3 ví dụ thực tế';
    else if (quickAction === 'find_error') userLabel = '⚠️ Cho câu sai để tôi tìm lỗi';
    else if (quickAction === 'more_exercise') userLabel = '🎯 Cho thêm bài tập';

    setAiTutorMessages(prev => [...prev, { sender: 'user', text: userLabel }]);
    setAiTutorInput('');
    setAiTutorLoading(true);

    try {
      const reply = await askAiTutor({
        grammarStructure: grammarItem.structure,
        grammarMeaning: grammarItem.meaning,
        level: grammarItem.level,
        userQuery: query,
        quickAction
      });

      setAiTutorMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    } catch (err: any) {
      setAiTutorMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Xin lỗi, AI Tutor tạm thời bận. Bạn vui lòng thử lại sau giây lát!' }
      ]);
    } finally {
      setAiTutorLoading(false);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / exercises.length) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
        <button
          id="btn-back-to-grammar-catalog"
          onClick={onBackToCatalog}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Kho Ngữ Pháp</span>
          <span className="sm:hidden">Quay lại</span>
        </button>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${
            grammarItem.level === 'N5' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
            grammarItem.level === 'N4' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            grammarItem.level === 'N3' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            grammarItem.level === 'N2' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            {grammarItem.level}
          </span>

          {/* AI Tutor Button */}
          <button
            id="btn-open-ai-tutor"
            onClick={() => setShowAiTutor(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-cyan-600/20 transition-all"
            title="Hỏi AI Trợ Giảng"
          >
            <Bot className="w-4 h-4" />
            <span>Hỏi AI Trợ Giảng</span>
          </button>

          {/* AI Redesign Button */}
          <button
            id="btn-ai-redesign-lesson"
            onClick={() => onOpenAiGeneratorModal(grammarItem)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all"
            title="AI Thiết kế lại bài học"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Nâng cấp</span>
          </button>
        </div>
      </div>

      {/* Hero Header of Current Grammar */}
      <div className="bg-gradient-to-br from-slate-900 via-[#171d33] to-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {grammarItem.structure}
              </h1>
              <button
                type="button"
                onClick={() => handleSpeak(grammarItem.structure)}
                className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-xl transition-colors"
                title="Nghe phát âm mẫu"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-base sm:text-lg font-bold text-emerald-400">
              {grammarItem.meaning}
            </p>
          </div>

          {/* Previous / Next Lesson controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onPrevLesson && (
              <button
                onClick={onPrevLesson}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Mẫu ngữ pháp trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {onNextLesson && (
              <button
                onClick={onNextLesson}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Mẫu ngữ pháp tiếp theo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 3 Steps Progress Bar (Đã bỏ Luyện, chỉ còn: 1. Học -> 2. Kiểm tra -> 3. Đánh giá) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { step: 1, title: '① HỌC', subtitle: 'Lý thuyết & Ví dụ' },
            { step: 2, title: '② KIỂM TRA', subtitle: `${exercises.length} Câu trắc nghiệm` },
            { step: 3, title: '③ ĐÁNH GIÁ', subtitle: 'Điểm & Phân tích' }
          ].map(s => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                id={`tab-step-${s.step}`}
                onClick={() => setCurrentStep(s.step as any)}
                className={`text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all border ${
                  isActive
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold">
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : null}
                  <span>{s.title}</span>
                </div>
                <div className="text-[10px] sm:text-xs opacity-75 truncate mt-0.5 hidden sm:block">
                  {s.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: HỌC (Lý thuyết, Cấu trúc, Cách dùng, Lưu ý, Mẹo nhớ, Ví dụ thực tế, So sánh dễ nhầm) */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Overview / Explanation Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm sm:text-base border-b border-slate-800 pb-3">
              <BookOpen className="w-5 h-5" />
              <h2>1. Tổng quan & Bản chất ngữ pháp</h2>
            </div>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {grammarItem.overview || grammarItem.explanation || 'Mẫu ngữ pháp quan trọng trong chương trình học tiếng Nhật.'}
            </p>
          </div>

          {/* Formation Rules (Cấu trúc kết hợp) */}
          {grammarItem.formationRules && grammarItem.formationRules.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm sm:text-base border-b border-slate-800 pb-3">
                <Zap className="w-5 h-5" />
                <h2>2. Quy tắc kết hợp & Chia thể (Formation)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grammarItem.formationRules.map((rule, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 px-2.5 py-0.5 bg-cyan-950/60 border border-cyan-500/30 rounded-full">
                        {rule.partOfSpeech}
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-white font-mono bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      {rule.rule}
                    </div>
                    {rule.example && (
                      <div className="text-xs text-amber-300 font-medium">
                        📌 {rule.example}
                      </div>
                    )}
                    {rule.meaning && (
                      <div className="text-xs text-slate-400">
                        {rule.meaning}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Guide (Khi nào dùng / Khi nào không dùng) */}
          {grammarItem.usageGuide && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm sm:text-base border-b border-slate-800 pb-3">
                <Lightbulb className="w-5 h-5" />
                <h2>3. Hướng dẫn sử dụng chuẩn xác (Usage Guide)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* When to use */}
                {grammarItem.usageGuide.whenToUse && grammarItem.usageGuide.whenToUse.length > 0 && (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Khi nào nên dùng</span>
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                      {grammarItem.usageGuide.whenToUse.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* When NOT to use */}
                {grammarItem.usageGuide.whenNotToUse && grammarItem.usageGuide.whenNotToUse.length > 0 && (
                  <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <XCircle className="w-4 h-4" />
                      <span>Trường hợp KHÔNG được dùng</span>
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                      {grammarItem.usageGuide.whenNotToUse.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Subject constraint or Nuance */}
              {(grammarItem.usageGuide.subjectConstraint || grammarItem.usageGuide.nuance) && (
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-xs sm:text-sm text-slate-300">
                  {grammarItem.usageGuide.subjectConstraint && (
                    <div>
                      <strong className="text-cyan-400">Ràng buộc chủ ngữ:</strong> {grammarItem.usageGuide.subjectConstraint}
                    </div>
                  )}
                  {grammarItem.usageGuide.nuance && (
                    <div>
                      <strong className="text-purple-400">Sắc thái diễn đạt:</strong> {grammarItem.usageGuide.nuance}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes (Lưu ý quan trọng & Bẫy dễ sai) */}
          {grammarItem.notes && grammarItem.notes.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base border-b border-slate-800 pb-3">
                <AlertTriangle className="w-5 h-5" />
                <h2>4. Lưu ý quan trọng & Bẫy thi JLPT</h2>
              </div>
              <ul className="space-y-2">
                {grammarItem.notes.map((note, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-amber-200 bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Memory Tip (Mẹo nhớ) */}
          {grammarItem.memoryTip && (
            <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-5 sm:p-6 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm sm:text-base">
                <Sparkles className="w-5 h-5" />
                <h2>5. Mẹo nhớ nhanh (Memory Tip)</h2>
              </div>
              <p className="text-sm sm:text-base text-purple-100 font-medium leading-relaxed">
                {grammarItem.memoryTip}
              </p>
            </div>
          )}

          {/* Similar Grammars (So sánh các mẫu dễ nhầm lẫn) */}
          {grammarItem.similarGrammars && grammarItem.similarGrammars.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm sm:text-base border-b border-slate-800 pb-3">
                <HelpCircle className="w-5 h-5" />
                <h2>6. Phân biệt với các mẫu ngữ pháp tương tự</h2>
              </div>
              <div className="space-y-3">
                {grammarItem.similarGrammars.map((sim, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg">
                        {sim.similarStructure}
                      </span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {sim.difference}
                    </div>
                    {sim.comparisonExample && (
                      <div className="text-cyan-300 bg-cyan-950/30 border border-cyan-500/20 p-2.5 rounded-lg font-mono">
                        {sim.comparisonExample}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm sm:text-base">
                <Volume2 className="w-5 h-5" />
                <h2>7. Ví dụ mẫu & Ngữ cảnh thực tế ({examples.length} ví dụ)</h2>
              </div>
            </div>

            <div className="space-y-3">
              {examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 hover:bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {ex.context && (
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-2 py-0.5 bg-indigo-950/60 border border-indigo-500/30 rounded-md">
                          {ex.context}
                        </span>
                      )}
                      <div className="text-base sm:text-lg font-bold text-white tracking-wide">
                        {ex.japanese}
                      </div>
                      {ex.hiragana && (
                        <div className="text-xs text-slate-400">
                          {ex.hiragana}
                        </div>
                      )}
                      <div className="text-xs sm:text-sm text-emerald-400 font-medium">
                        {ex.vietnamese}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSpeak(ex.japanese)}
                        className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Phát âm câu ví dụ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {ex.explanation && (
                    <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-900/80 leading-relaxed">
                      💡 {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA: Chuyển sang Bước 2 (Kiểm tra trắc nghiệm) */}
          <div className="flex justify-end pt-2">
            <button
              id="btn-go-to-step-2"
              onClick={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <span>Tiếp tục: Bước 2 - Kiểm tra trắc nghiệm ({exercises.length} câu)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: KIỂM TRA (Quiz Exercises - Nhiều câu hỏi, có thanh điều hướng nhanh) */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quiz Header & Sticky Question Navigator */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-indigo-400" />
                  <span>Bài kiểm tra trắc nghiệm tổng hợp</span>
                  <span className="text-xs text-indigo-300 font-normal">({exercises.length} câu hỏi)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đã hoàn thành: <strong className="text-emerald-400">{answeredCount} / {exercises.length} câu</strong> ({progressPercent}%)
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full sm:w-48 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Quick Jump Badges (1..N) */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Danh sách câu hỏi:
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {exercises.map((_, idx) => {
                  const isDone = selectedAnswers[idx] !== undefined;
                  return (
                    <button
                      key={idx}
                      id={`jump-to-q-${idx + 1}`}
                      onClick={() => scrollToQuestion(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                      title={`Câu ${idx + 1}: ${isDone ? 'Đã chọn đáp án' : 'Chưa làm'}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Exercise Items List */}
          <div className="space-y-6">
            {exercises.map((ex, qIdx) => {
              const currentChoice = selectedAnswers[qIdx];
              return (
                <div
                  key={ex.id || qIdx}
                  ref={el => { questionRefs.current[qIdx] = el; }}
                  id={`quiz-question-card-${qIdx + 1}`}
                  className={`bg-slate-900/90 border rounded-2xl p-5 sm:p-6 space-y-4 shadow-md transition-all ${
                    currentChoice ? 'border-slate-700' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 font-bold rounded-lg flex items-center justify-center text-xs ${
                        currentChoice
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
                      }`}>
                        {currentChoice ? <Check className="w-4 h-4 stroke-[3]" /> : qIdx + 1}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {ex.type === 'multiple_choice' ? 'Trắc nghiệm ngữ pháp' :
                         ex.type === 'fill_in_blank' ? 'Điền từ vào chỗ trống' :
                         ex.type === 'sentence_reorder' ? 'Sắp xếp câu' :
                         ex.type === 'error_correction' ? 'Tìm lỗi sai' : 'Câu hỏi kiểm tra'}
                      </span>
                    </div>

                    {ex.sentence_full && (
                      <button
                        type="button"
                        onClick={() => handleSpeak(ex.sentence_full || '')}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Phát âm câu hỏi"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Question Prompt */}
                  <div className="text-base sm:text-lg font-bold text-white leading-relaxed whitespace-pre-line">
                    <span className="text-indigo-400 mr-2">Câu {qIdx + 1}:</span>
                    {ex.question}
                  </div>

                  {/* Choices */}
                  {ex.choices && ex.choices.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {ex.choices.map((choice, cIdx) => {
                        const isSelected = selectedAnswers[qIdx] === choice;
                        return (
                          <button
                            key={cIdx}
                            id={`quiz-q${qIdx}-choice-${cIdx}`}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: choice }))}
                            className={`p-3.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all border ${
                              isSelected
                                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {String.fromCharCode(65 + cIdx)}
                              </span>
                              <span className="leading-relaxed">{choice}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
            <div className="text-xs sm:text-sm text-slate-300">
              {answeredCount < exercises.length ? (
                <span>⚠️ Bạn còn <strong className="text-amber-400">{exercises.length - answeredCount} câu</strong> chưa làm. Bạn vẫn có thể nộp bài ngay bây giờ.</span>
              ) : (
                <span className="text-emerald-400 font-bold">✨ Bạn đã hoàn thành toàn bộ {exercises.length} câu hỏi!</span>
              )}
            </div>

            <button
              id="btn-submit-grammar-quiz"
              disabled={answeredCount === 0}
              onClick={handleSubmitQuiz}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>Nộp bài & Xem đánh giá kết quả (Bước 3)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ĐÁNH GIÁ (Evaluation & Detailed Feedback) */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Score Header Card */}
          {(() => {
            const correctCount = quizResults.filter(r => r.isCorrect).length;
            const total = quizResults.length || 1;
            const scorePercent = Math.round((correctCount / total) * 100);
            const isPass = scorePercent >= 70;

            return (
              <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-2xl ${
                isPass
                  ? 'bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-900 border-emerald-500/40'
                  : 'bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-900 border-amber-500/40'
              }`}>
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg ${
                  isPass ? 'bg-emerald-400 shadow-emerald-500/20' : 'bg-amber-400 shadow-amber-500/20'
                }`}>
                  <Award className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {isPass ? 'Xuất sắc! Bạn đã hoàn thành bài kiểm tra' : 'Cần ôn luyện thêm!'}
                  </h2>
                  <p className="text-sm text-slate-300">
                    Kết quả làm bài: <strong className="text-white">{correctCount} / {total} câu đúng</strong> ({scorePercent}%)
                  </p>
                </div>

                {/* AI Tutor Feedback Text */}
                {aiEvaluationFeedback && (
                  <div className="max-w-2xl mx-auto text-xs sm:text-sm text-indigo-200 bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl leading-relaxed">
                    🤖 {aiEvaluationFeedback}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    id="btn-retake-quiz"
                    onClick={handleRetakeQuiz}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Làm lại bài kiểm tra ({total} câu)</span>
                  </button>

                  <button
                    id="btn-back-to-catalog-from-step-3"
                    onClick={onBackToCatalog}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-md flex items-center gap-2"
                  >
                    <span>Quay về Kho Ngữ Pháp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {onNextLesson && (
                    <button
                      id="btn-next-lesson-from-step-3"
                      onClick={onNextLesson}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-md flex items-center gap-2"
                    >
                      <span>Sang bài ngữ pháp tiếp theo</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Chi tiết từng câu hỏi & Phân tích đáp án ({quizResults.length} câu):
            </h3>

            {quizResults.map((res, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  res.isCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded-lg shrink-0 mt-0.5 ${
                    res.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {res.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="text-sm sm:text-base font-bold text-white whitespace-pre-line">
                      Câu {idx + 1}: {res.question}
                    </div>

                    <div className="text-xs space-y-1">
                      <div>
                        Lựa chọn của bạn: <strong className={res.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                          {res.userAnswer || '(Bỏ trống)'}
                        </strong>
                      </div>
                      {!res.isCorrect && (
                        <div>
                          Đáp án đúng: <strong className="text-emerald-400">{res.correctAnswer}</strong>
                        </div>
                      )}
                    </div>

                    {res.explanation && (
                      <div className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed mt-2">
                        💡 <strong>Giải thích chi tiết:</strong> {res.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI TUTOR MODAL / DRAWER */}
      {showAiTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Trợ Giảng AI: 【{grammarItem.structure}】
                  </h3>
                  <p className="text-[11px] text-cyan-300">
                    Giải đáp mọi thắc mắc chuyên sâu về ngữ pháp
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAiTutor(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Chips */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap gap-2">
              <button
                disabled={aiTutorLoading}
                onClick={() => handleAskAiTutor('easier_explanation')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Giải thích dễ hơn</span>
              </button>
              <button
                disabled={aiTutorLoading}
                onClick={() => handleAskAiTutor('more_examples')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Cho 3 ví dụ khác</span>
              </button>
              <button
                disabled={aiTutorLoading}
                onClick={() => handleAskAiTutor('find_error')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Đố tôi câu sai</span>
              </button>
              <button
                disabled={aiTutorLoading}
                onClick={() => handleAskAiTutor('more_exercise')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Cho bài tập thêm</span>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs sm:text-sm">
              {aiTutorMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                        : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {aiTutorLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl rounded-bl-none flex items-center gap-2 text-cyan-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">AI Tutor đang suy nghĩ và soạn câu trả lời...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={aiTutorInput}
                onChange={(e) => setAiTutorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAskAiTutor();
                  }
                }}
                placeholder="Nhập câu hỏi của bạn về mẫu ngữ pháp này..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                disabled={!aiTutorInput.trim() || aiTutorLoading}
                onClick={() => handleAskAiTutor()}
                className="p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default GrammarLessonStudyView;
