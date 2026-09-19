import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  Volume2,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { GrammarItem, JLPTLevel, UserGrammarProgress } from '../../types';
import { generatePersonalizedReview, recordGrammarAttempt } from '../../services/grammarAI';
import { useAuth } from '../../contexts/AuthContext';

interface GrammarPersonalizedReviewViewProps {
  grammarList: GrammarItem[];
  progressMap: Record<string, UserGrammarProgress>;
  levelFilter: JLPTLevel | 'ALL';
  onBackToCatalog: () => void;
  onRefreshProgress: () => void;
  handleSpeak: (text: string) => void;
}

export const GrammarPersonalizedReviewView: React.FC<GrammarPersonalizedReviewViewProps> = ({
  grammarList,
  progressMap,
  levelFilter,
  onBackToCatalog,
  onRefreshProgress,
  handleSpeak
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reviewQuestions, setReviewQuestions] = useState<Array<{
    id: string;
    targetGrammar: string;
    question: string;
    choices: string[];
    correct_answer: string;
    explanation: string;
    sentence_full: string;
    translation: string;
  }>>([]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [results, setResults] = useState<Array<{
    questionId: string;
    targetGrammar: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>>([]);

  // Find target grammars needing review
  const grammarsNeedingReview = grammarList.filter(item => {
    const prog = progressMap[item.id] || progressMap[item.structure];
    if (levelFilter !== 'ALL' && item.level !== levelFilter) return false;
    return prog?.needsReview || (prog?.masteryScore !== undefined && prog.masteryScore < 70);
  });

  // Load or generate review session
  const handleStartReview = async () => {
    setIsLoading(true);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setResults([]);

    const targets = (grammarsNeedingReview.length > 0 ? grammarsNeedingReview : grammarList.slice(0, 5)).map(g => ({
      id: g.id,
      structure: g.structure,
      meaning: g.meaning
    }));

    try {
      const reviewData = await generatePersonalizedReview({
        userUid: user?.uid || 'guest_user',
        level: levelFilter === 'ALL' ? 'N5' : levelFilter,
        targetGrammars: targets.slice(0, 8)
      });

      if (reviewData?.questions && reviewData.questions.length > 0) {
        setReviewQuestions(reviewData.questions);
      } else {
        // Fallback local generated questions
        const fallbackQs = targets.slice(0, 5).map((g, idx) => ({
          id: `review_fallback_${idx}`,
          targetGrammar: g.structure,
          question: `Chọn cách sử dụng chuẩn xác của mẫu ngữ pháp 【${g.structure}】:`,
          choices: [
            `Mẫu biểu thị ý nghĩa: ${g.meaning}`,
            'Sử dụng sai cấu trúc và thời thì',
            'Không áp dụng được trong trường hợp này',
            'Cách dùng của mẫu ngữ pháp khác'
          ],
          correct_answer: `Mẫu biểu thị ý nghĩa: ${g.meaning}`,
          explanation: `Mẫu ${g.structure} mang ý nghĩa "${g.meaning}".`,
          sentence_full: g.structure,
          translation: g.meaning
        }));
        setReviewQuestions(fallbackQs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleStartReview();
  }, []);

  const handleSelectOption = (qIdx: number, choice: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: choice }));
  };

  const handleSubmit = async () => {
    const res = reviewQuestions.map((q, idx) => {
      const userAns = selectedAnswers[idx] || '';
      const isCorrect = userAns.trim() === q.correct_answer.trim();
      return {
        questionId: q.id,
        targetGrammar: q.targetGrammar,
        question: q.question,
        userAnswer: userAns,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation
      };
    });

    setResults(res);
    setIsSubmitted(true);

    // Save attempts for each target grammar
    for (const item of res) {
      const matched = grammarList.find(g => g.structure === item.targetGrammar || g.id === item.targetGrammar);
      if (matched) {
        await recordGrammarAttempt({
          userUid: user?.uid || 'guest_user',
          grammarId: matched.id,
          isCorrect: item.isCorrect,
          mistakeText: item.isCorrect ? undefined : `Sai câu: ${item.question}`
        });
      }
    }

    onRefreshProgress();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <button
          onClick={onBackToCatalog}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </button>

        <button
          onClick={handleStartReview}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md"
        >
          <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Tạo bộ đề ôn tập mới</span>
        </button>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          Thuật toán Lặp lại Ngắt quãng (Spaced Repetition)
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
          Ôn Tập Cá Nhân Hóa & Khắc Phục Lỗi Sai
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Hệ thống AI phân tích các mẫu ngữ pháp bạn thường nhầm lẫn hoặc đã lâu chưa ôn lại để tạo đề kiểm tra tập trung.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            AI đang phân tích dữ liệu học tập và tạo câu hỏi cá nhân hóa...
          </p>
        </div>
      )}

      {/* Questions list */}
      {!isLoading && reviewQuestions.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {reviewQuestions.map((q, qIdx) => (
            <div
              key={q.id || qIdx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold rounded-lg flex items-center justify-center text-xs">
                    {qIdx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md text-[11px] font-bold">
                    【{q.targetGrammar}】
                  </span>
                </div>

                {q.sentence_full && (
                  <button
                    type="button"
                    onClick={() => handleSpeak(q.sentence_full)}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-base sm:text-lg font-bold text-white">
                {q.question}
              </div>

              {q.choices && q.choices.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {q.choices.map((choice, cIdx) => {
                    const isSelected = selectedAnswers[qIdx] === choice;
                    return (
                      <button
                        key={cIdx}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(qIdx, choice)}
                        className={`p-3.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all border ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + cIdx)}
                          </span>
                          <span>{choice}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Submit / Score Action */}
          {!isSubmitted ? (
            <div className="flex justify-end pt-2">
              <button
                disabled={Object.keys(selectedAnswers).length === 0}
                onClick={handleSubmit}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold rounded-2xl shadow-xl transition-all"
              >
                Nộp bài & Chấm điểm ôn tập
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-fade-in">
              {(() => {
                const correctCount = results.filter(r => r.isCorrect).length;
                const total = results.length;
                const score = Math.round((correctCount / total) * 100);

                return (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
                    <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Kết quả ôn tập</h2>
                      <p className="text-slate-300 text-sm mt-1">
                        Bạn đã trả lời đúng <strong>{correctCount} / {total} câu</strong> ({score}%)
                      </p>
                    </div>

                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={handleStartReview}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors"
                      >
                        Luyện tiếp đề khác
                      </button>
                      <button
                        onClick={onBackToCatalog}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-colors"
                      >
                        Về danh sách ngữ pháp
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
export default GrammarPersonalizedReviewView;
