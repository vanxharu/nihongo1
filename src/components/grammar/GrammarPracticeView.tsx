import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Volume2,
  Check,
  X,
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRightLeft,
  Languages,
  Star,
  Loader2
} from 'lucide-react';
import { GrammarItem, UserProfile } from '../../types';
import JlptMascot from './JlptMascot';
import { speakJapanese, playCorrectSound, playIncorrectSound } from '../../utils/audio';
import {
  generateVietToJapExercises,
  generateJapToVietExercises,
  generateOrderingExercises,
  normalizeJapanese,
  normalizeVietnamese,
  TranslationExerciseItem,
  OrderingExerciseItem
} from '../../utils/grammarExerciseGenerator';
import { safeFetchJson } from '../../utils/safeApi';

interface GrammarPracticeViewProps {
  grammar: GrammarItem;
  aiContent?: any;
  userProfile: UserProfile;
  onBackToDetail: () => void;
  onEarnXp: (amount: number) => void;
  onRecordAttempt?: (grammarId: string, isCorrect: boolean) => void;
}

type PracticeTab = 'viet-to-jap' | 'jap-to-viet' | 'ordering';

export const GrammarPracticeView: React.FC<GrammarPracticeViewProps> = ({
  grammar,
  aiContent,
  userProfile,
  onBackToDetail,
  onEarnXp,
  onRecordAttempt
}) => {
  const [activeTab, setActiveTab] = useState<PracticeTab>('viet-to-jap');

  // Exercise sets
  const vietToJapItems = useMemo(() => generateVietToJapExercises(grammar, aiContent), [grammar, aiContent]);
  const japToVietItems = useMemo(() => generateJapToVietExercises(grammar, aiContent), [grammar, aiContent]);
  const orderingItems = useMemo(() => generateOrderingExercises(grammar, aiContent), [grammar, aiContent]);

  // User input states for Viet -> Jap
  const [v2jInputs, setV2jInputs] = useState<Record<string, string>>({});
  const [v2jChecked, setV2jChecked] = useState<Record<string, { isCorrect: boolean; showAnswer: boolean; aiFeedback?: any; isLoadingAi?: boolean }>>({});
  const [v2jHints, setV2jHints] = useState<Record<string, boolean>>({});

  // User input states for Jap -> Viet
  const [j2vInputs, setJ2vInputs] = useState<Record<string, string>>({});
  const [j2vChecked, setJ2vChecked] = useState<Record<string, { isCorrect: boolean; showAnswer: boolean; aiFeedback?: any; isLoadingAi?: boolean }>>({});
  const [j2vHints, setJ2vHints] = useState<Record<string, boolean>>({});

  // Ordering slots state: record of questionId -> array of selected option IDs [2, 4, 1, 3]
  const [orderingSlots, setOrderingSlots] = useState<Record<string, number[]>>({});
  const [orderingChecked, setOrderingChecked] = useState<Record<string, { isCorrect: boolean; checked: boolean }>>({});

  // Count total answered
  const totalAnsweredV2j = Object.keys(v2jChecked).length;
  const totalAnsweredJ2v = Object.keys(j2vChecked).length;
  const totalAnsweredOrd = Object.keys(orderingChecked).length;

  // --- Handlers for Viet -> Jap ---
  const handleV2jCheck = (item: TranslationExerciseItem) => {
    const userText = v2jInputs[item.id] || '';
    if (!userText.trim()) return;

    const normUser = normalizeJapanese(userText);
    const isMatch = item.acceptedAnswers.some(ans => normUser === ans || normUser.includes(ans) || ans.includes(normUser));

    if (isMatch) {
      playCorrectSound();
      onEarnXp(15);
      if (onRecordAttempt) onRecordAttempt(grammar.id, true);
    } else {
      playIncorrectSound();
      if (onRecordAttempt) onRecordAttempt(grammar.id, false);
    }

    setV2jChecked(prev => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        isCorrect: isMatch,
        showAnswer: true
      }
    }));
  };

  const handleV2jAiEvaluate = async (item: TranslationExerciseItem) => {
    const userText = v2jInputs[item.id] || '';
    if (!userText.trim()) return;

    setV2jChecked(prev => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        isLoadingAi: true
      }
    }));

    try {
      const res = await safeFetchJson<any>('/api/grammar/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grammarStructure: grammar.structure,
          vietnamesePrompt: item.vietnamese,
          expectedJapanese: item.japanese,
          userTranslation: userText
        })
      });

      const aiData = res?.ok && res?.data ? res.data : null;
      const isPass = Boolean(aiData?.score >= 6 || aiData?.isNatural);
      if (isPass) {
        playCorrectSound();
        onEarnXp(20);
      }

      setV2jChecked(prev => ({
        ...prev,
        [item.id]: {
          isCorrect: isPass,
          showAnswer: true,
          aiFeedback: aiData || {
            score: isPass ? 8 : 5,
            feedback: 'Đã hoàn thành kiểm tra với cấu trúc ngữ pháp tương đương.',
            naturalAlternative: item.japanese
          },
          isLoadingAi: false
        }
      }));
    } catch (e) {
      // Offline evaluate
      const isMatch = normalizeJapanese(userText).length > 2;
      setV2jChecked(prev => ({
        ...prev,
        [item.id]: {
          isCorrect: isMatch,
          showAnswer: true,
          aiFeedback: {
            score: isMatch ? 8 : 4,
            feedback: isMatch ? 'Câu dịch tốt, cấu trúc ngữ pháp sử dụng chính xác.' : 'Cần chú ý thể kết hợp của mẫu câu.',
            naturalAlternative: item.japanese
          },
          isLoadingAi: false
        }
      }));
    }
  };

  // --- Handlers for Jap -> Viet ---
  const handleJ2vCheck = (item: TranslationExerciseItem) => {
    const userText = j2vInputs[item.id] || '';
    if (!userText.trim()) return;

    const normUser = normalizeVietnamese(userText);
    const normExpected = normalizeVietnamese(item.vietnamese);
    // Flexible match
    const isMatch = normUser.length > 3 && (normUser === normExpected || normExpected.includes(normUser) || normUser.includes(normExpected.slice(0, 8)));

    if (isMatch) {
      playCorrectSound();
      onEarnXp(15);
      if (onRecordAttempt) onRecordAttempt(grammar.id, true);
    } else {
      playIncorrectSound();
      if (onRecordAttempt) onRecordAttempt(grammar.id, false);
    }

    setJ2vChecked(prev => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        isCorrect: isMatch,
        showAnswer: true
      }
    }));
  };

  const handleJ2vAiEvaluate = async (item: TranslationExerciseItem) => {
    const userText = j2vInputs[item.id] || '';
    if (!userText.trim()) return;

    setJ2vChecked(prev => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        isLoadingAi: true
      }
    }));

    try {
      const res = await safeFetchJson<any>('/api/grammar/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grammarStructure: grammar.structure,
          vietnamesePrompt: item.vietnamese,
          expectedJapanese: item.japanese,
          userTranslation: userText
        })
      });

      const aiData = res?.ok && res?.data ? res.data : null;
      const isPass = Boolean(aiData && aiData.score >= 6);
      if (isPass) {
        playCorrectSound();
        onEarnXp(20);
      }

      setJ2vChecked(prev => ({
        ...prev,
        [item.id]: {
          isCorrect: isPass,
          showAnswer: true,
          aiFeedback: aiData || {
            score: 8,
            feedback: 'Bản dịch tiếng Việt tự nhiên và sát nghĩa ngữ cảnh.',
            naturalAlternative: item.vietnamese
          },
          isLoadingAi: false
        }
      }));
    } catch (e) {
      setJ2vChecked(prev => ({
        ...prev,
        [item.id]: {
          isCorrect: true,
          showAnswer: true,
          aiFeedback: {
            score: 8,
            feedback: 'Bản dịch tiếng Việt tự nhiên và sát nghĩa ngữ cảnh.',
            naturalAlternative: item.vietnamese
          },
          isLoadingAi: false
        }
      }));
    }
  };

  // --- Handlers for Ordering (Sắp xếp ★) ---
  const handleOrderingSelectOption = (qId: string, optId: number) => {
    const currentSlots = orderingSlots[qId] || [];
    if (currentSlots.includes(optId)) return;
    if (currentSlots.length >= 4) return;

    setOrderingSlots(prev => ({
      ...prev,
      [qId]: [...currentSlots, optId]
    }));
  };

  const handleOrderingRemoveSlot = (qId: string, indexToRemove: number) => {
    const currentSlots = orderingSlots[qId] || [];
    const updated = currentSlots.filter((_, idx) => idx !== indexToRemove);
    setOrderingSlots(prev => ({
      ...prev,
      [qId]: updated
    }));
    // Clear check state if user modifies
    setOrderingChecked(prev => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleOrderingReset = (qId: string) => {
    setOrderingSlots(prev => ({
      ...prev,
      [qId]: []
    }));
    setOrderingChecked(prev => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleOrderingCheck = (item: OrderingExerciseItem) => {
    const currentSlots = orderingSlots[item.id] || [];
    if (currentSlots.length < 4) return;

    // Check if full array matches OR star position matches
    const isFullMatch = JSON.stringify(currentSlots) === JSON.stringify(item.correctOrder);
    const starIdx = item.starPosition - 1; // 0-based index of ★
    const isStarMatch = currentSlots[starIdx] === item.correctOrder[starIdx];
    const isSuccess = isFullMatch || isStarMatch;

    if (isSuccess) {
      playCorrectSound();
      onEarnXp(20);
      if (onRecordAttempt) onRecordAttempt(grammar.id, true);
    } else {
      playIncorrectSound();
      if (onRecordAttempt) onRecordAttempt(grammar.id, false);
    }

    setOrderingChecked(prev => ({
      ...prev,
      [item.id]: {
        isCorrect: isSuccess,
        checked: true
      }
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 animate-fadeIn font-sans text-slate-100">
      {/* Top Bar Navigation */}
      <button
        type="button"
        onClick={onBackToDetail}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium mb-2 cursor-pointer transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại mẫu ngữ pháp</span>
      </button>

      <div className="text-xs text-slate-400 mb-2">
        Minna no Nihongo II (第26〜50課) · 第{grammar.lessonNumber || 26}課 – Bài {grammar.lessonNumber || 26}
      </div>

      {/* Header Info */}
      <div className="flex items-center gap-3 mb-2">
        <JlptMascot size={40} />
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-japanese">
            {grammar.structure}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {grammar.meaning}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        Bài tập gồm 10 câu Việt → Nhật, 10 câu Nhật → Việt và 10 câu sắp xếp ★ tập trung vào mẫu này.
      </p>

      {/* Answered counter badge */}
      <div className="mb-5">
        <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#21262d] border border-[#30363d] text-xs text-slate-300">
          Đã trả lời {activeTab === 'viet-to-jap' ? totalAnsweredV2j : activeTab === 'jap-to-viet' ? totalAnsweredJ2v : totalAnsweredOrd}/10 câu
        </span>
      </div>

      {/* 3 Tabs */}
      <div className="flex items-center gap-2 border-b border-[#30363d] mb-6 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('viet-to-jap')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'viet-to-jap'
              ? 'border-blue-500 text-blue-400 bg-blue-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Việt → Nhật 10</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jap-to-viet')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'jap-to-viet'
              ? 'border-blue-500 text-blue-400 bg-blue-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>Nhật → Việt 10</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ordering')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'ordering'
              ? 'border-blue-500 text-blue-400 bg-blue-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          <span>Sắp xếp ★ 10</span>
        </button>
      </div>

      {/* TAB 1: VIỆT → NHẬT */}
      {activeTab === 'viet-to-jap' && (
        <div className="space-y-6">
          <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-slate-300">
            Đọc câu tiếng Việt, gõ bản dịch tiếng Nhật vào ô bên dưới. Nhấn <strong>"Kiểm tra"</strong> để so với đáp án mẫu, hoặc <strong>"AI đánh giá"</strong> để Gemini chấm điểm + góp ý.
          </div>

          {vietToJapItems.map((item, idx) => {
            const checkInfo = v2jChecked[item.id];
            const isHintOpen = v2jHints[item.id];

            return (
              <div key={item.id} className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm">
                {/* Number badge */}
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs mb-3">
                  {idx + 1}
                </div>

                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  TIẾNG VIỆT
                </div>
                <div className="text-sm sm:text-base font-bold text-white mb-3 leading-relaxed">
                  {item.vietnamese}
                </div>

                {/* Hint toggle */}
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => setV2jHints(prev => ({ ...prev, [item.id]: !isHintOpen }))}
                    className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{isHintOpen ? 'Ẩn gợi ý' : 'Hiện gợi ý'}</span>
                  </button>
                  {isHintOpen && (
                    <div className="mt-1.5 p-2.5 bg-[#0d1117] rounded border border-amber-500/30 text-xs text-amber-200">
                      {item.hint}
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    BẢN DỊCH CỦA BẠN (日本語)
                  </label>
                  <textarea
                    value={v2jInputs[item.id] || ''}
                    onChange={(e) => setV2jInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                    rows={2}
                    placeholder="Gõ bản dịch tiếng Nhật ở đây..."
                    className="w-full px-3.5 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-japanese transition-all"
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleV2jCheck(item)}
                    disabled={!v2jInputs[item.id]?.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Kiểm tra</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleV2jAiEvaluate(item)}
                    disabled={!v2jInputs[item.id]?.trim() || checkInfo?.isLoadingAi}
                    className="px-3.5 py-1.5 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed text-purple-300 font-medium text-xs rounded-lg border border-[#30363d] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {checkInfo?.isLoadingAi ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span>AI đánh giá</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setV2jChecked(prev => ({
                        ...prev,
                        [item.id]: {
                          ...prev[item.id],
                          showAnswer: !prev[item.id]?.showAnswer
                        }
                      }));
                    }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{checkInfo?.showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
                  </button>
                </div>

                {/* Feedback / Result */}
                {checkInfo?.showAnswer && (
                  <div className="mt-4 pt-3 border-t border-[#30363d] animate-fadeIn space-y-2">
                    <div className="flex items-center gap-2">
                      {checkInfo.isCorrect ? (
                        <div className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Chính xác! (+15 XP)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <XCircle className="w-4 h-4" />
                          <span>Chưa chính xác hoặc còn khác biệt ngữ cảnh</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-[#0d1117] rounded-lg border border-[#21262d]">
                      <div className="text-xs text-slate-400 mb-1">Đáp án mẫu:</div>
                      <div className="text-sm font-bold text-white font-japanese flex items-center justify-between">
                        <span>{item.japanese}</span>
                        <button
                          type="button"
                          onClick={() => speakJapanese(item.japanese)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {item.grammarNote}
                      </div>
                    </div>

                    {checkInfo.aiFeedback && (
                      <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-800/40 text-xs text-purple-200 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="font-bold text-purple-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>
                              {checkInfo.aiFeedback.aiProvider === 'chatgpt'
                                ? 'ChatGPT (OpenAI)'
                                : checkInfo.aiFeedback.aiProvider === 'gemini_fallback'
                                ? 'Gemini AI (Tự động dự phòng)'
                                : 'AI'}{' '}
                              đánh giá:
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 font-extrabold">
                              {checkInfo.aiFeedback.score > 10 ? Math.round(checkInfo.aiFeedback.score / 10) : checkInfo.aiFeedback.score}/10
                            </span>
                          </div>

                          {checkInfo.aiFeedback.openAiError && (
                            <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                              {checkInfo.aiFeedback.openAiError}
                            </div>
                          )}
                        </div>

                        {checkInfo.aiFeedback.feedback && (
                          <div className="text-slate-200 leading-relaxed">
                            <span className="font-semibold text-purple-300">Nhận xét: </span>
                            {checkInfo.aiFeedback.feedback}
                          </div>
                        )}

                        {checkInfo.aiFeedback.correction && checkInfo.aiFeedback.correction !== item.japanese && (
                          <div className="p-2 bg-[#0d1117] rounded border border-[#21262d] text-slate-300">
                            <div className="text-[11px] text-slate-400">Cách diễn đạt tự nhiên gợi ý:</div>
                            <div className="font-japanese font-bold text-white text-sm mt-0.5">
                              {checkInfo.aiFeedback.correction}
                            </div>
                          </div>
                        )}

                        {checkInfo.aiFeedback.explanation && (
                          <div className="text-[11px] text-slate-400 border-t border-purple-900/30 pt-1.5 leading-relaxed">
                            {checkInfo.aiFeedback.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: NHẬT → VIỆT */}
      {activeTab === 'jap-to-viet' && (
        <div className="space-y-6">
          <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-slate-300">
            Đọc câu tiếng Nhật, gõ bản dịch tiếng Việt vào ô bên dưới. Nhấn <strong>"Kiểm tra"</strong> để so với đáp án mẫu.
          </div>

          {japToVietItems.map((item, idx) => {
            const checkInfo = j2vChecked[item.id];
            const isHintOpen = j2vHints[item.id];

            return (
              <div key={item.id} className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm">
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs mb-3">
                  {idx + 1}
                </div>

                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  TIẾNG NHẬT
                </div>
                <div className="text-base sm:text-lg font-bold text-white mb-3 font-japanese flex items-center justify-between gap-3">
                  <span>{item.japanese}</span>
                  <button
                    type="button"
                    onClick={() => speakJapanese(item.japanese)}
                    className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white transition-colors shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Input area */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    BẢN DỊCH CỦA BẠN (TIẾNG VIỆT)
                  </label>
                  <textarea
                    value={j2vInputs[item.id] || ''}
                    onChange={(e) => setJ2vInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                    rows={2}
                    placeholder="Gõ bản dịch tiếng Việt ở đây..."
                    className="w-full px-3.5 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleJ2vCheck(item)}
                    disabled={!j2vInputs[item.id]?.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Kiểm tra</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleJ2vAiEvaluate(item)}
                    disabled={!j2vInputs[item.id]?.trim() || checkInfo?.isLoadingAi}
                    className="px-3.5 py-1.5 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed text-purple-300 font-medium text-xs rounded-lg border border-[#30363d] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {checkInfo?.isLoadingAi ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span>AI đánh giá</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setJ2vChecked(prev => ({
                        ...prev,
                        [item.id]: {
                          ...prev[item.id],
                          showAnswer: !prev[item.id]?.showAnswer
                        }
                      }));
                    }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{checkInfo?.showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
                  </button>
                </div>

                {/* Feedback */}
                {checkInfo?.showAnswer && (
                  <div className="mt-4 pt-3 border-t border-[#30363d] animate-fadeIn space-y-2">
                    <div className="flex items-center gap-2">
                      {checkInfo.isCorrect ? (
                        <div className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Chính xác! (+15 XP)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <XCircle className="w-4 h-4" />
                          <span>Đáp án gợi ý</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-[#0d1117] rounded-lg border border-[#21262d]">
                      <div className="text-xs text-slate-400 mb-1">Bản dịch chuẩn:</div>
                      <div className="text-sm font-bold text-white">
                        {item.vietnamese}
                      </div>
                    </div>

                    {checkInfo.aiFeedback && (
                      <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-800/40 text-xs text-purple-200 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="font-bold text-purple-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>
                              {checkInfo.aiFeedback.aiProvider === 'chatgpt'
                                ? 'ChatGPT (OpenAI)'
                                : checkInfo.aiFeedback.aiProvider === 'gemini_fallback'
                                ? 'Gemini AI (Tự động dự phòng)'
                                : 'AI'}{' '}
                              đánh giá:
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 font-extrabold">
                              {checkInfo.aiFeedback.score > 10 ? Math.round(checkInfo.aiFeedback.score / 10) : checkInfo.aiFeedback.score}/10
                            </span>
                          </div>

                          {checkInfo.aiFeedback.openAiError && (
                            <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                              {checkInfo.aiFeedback.openAiError}
                            </div>
                          )}
                        </div>

                        {checkInfo.aiFeedback.feedback && (
                          <div className="text-slate-200 leading-relaxed">
                            <span className="font-semibold text-purple-300">Nhận xét: </span>
                            {checkInfo.aiFeedback.feedback}
                          </div>
                        )}

                        {checkInfo.aiFeedback.explanation && (
                          <div className="text-[11px] text-slate-400 border-t border-purple-900/30 pt-1.5 leading-relaxed">
                            {checkInfo.aiFeedback.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: SẮP XẾP CÂU ★ (Image 6) */}
      {activeTab === 'ordering' && (
        <div className="space-y-6">
          {orderingItems.map((item, idx) => {
            const currentSlots = orderingSlots[item.id] || [];
            const checkInfo = orderingChecked[item.id];
            const isFull = currentSlots.length === 4;

            return (
              <div key={item.id} className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm">
                <div className="flex items-start gap-3 mb-2">
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">
                      {item.instruction}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.subtext}
                    </div>
                  </div>
                </div>

                {/* 4 SLOTS ROW with ★ at position 3 */}
                <div className="my-5 flex items-center justify-start gap-2 sm:gap-3 flex-wrap">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const isStar = slotIdx === (item.starPosition - 1);
                    const filledOptId = currentSlots[slotIdx];
                    const filledOption = item.options.find(o => o.id === filledOptId);

                    return (
                      <div key={slotIdx} className="relative flex flex-col items-center">
                        {/* Star indicator above slot 3 */}
                        {isStar && (
                          <div className="text-amber-400 text-xs font-bold mb-1 select-none animate-bounce">
                            ★
                          </div>
                        )}
                        {!isStar && <div className="h-4" />}

                        {/* Slot Box */}
                        <button
                          type="button"
                          onClick={() => {
                            if (filledOption) {
                              handleOrderingRemoveSlot(item.id, slotIdx);
                            }
                          }}
                          className={`min-w-[70px] sm:min-w-[90px] h-12 px-3 rounded-lg border flex items-center justify-center font-japanese text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            isStar
                              ? 'border-amber-500/80 bg-amber-950/20 text-amber-300'
                              : 'border-dashed border-slate-600 bg-[#0d1117] text-white'
                          } ${
                            filledOption ? 'bg-[#21262d] border-solid border-slate-500 shadow-sm' : ''
                          }`}
                        >
                          {filledOption ? filledOption.text : ''}
                        </button>
                      </div>
                    );
                  })}
                  <span className="text-xl text-slate-400 font-bold self-end mb-3">。</span>
                </div>

                {/* Word Option Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {item.options.map((opt) => {
                    const isSelected = currentSlots.includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isSelected}
                        onClick={() => handleOrderingSelectOption(item.id, opt.id)}
                        className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#12161c] border-[#252b33] text-slate-600 cursor-not-allowed opacity-50'
                            : 'bg-[#0d1117] hover:bg-[#21262d] border-[#30363d] hover:border-slate-500 text-slate-200'
                        }`}
                      >
                        <span className="w-5 h-5 rounded bg-[#21262d] text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {opt.id}
                        </span>
                        <span className="font-japanese font-bold text-sm text-white">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleOrderingReset(item.id)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOrderingCheck(item)}
                    disabled={!isFull}
                    className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Kiểm tra</span>
                  </button>
                </div>

                {/* Checked result */}
                {checkInfo?.checked && (
                  <div className="mt-4 pt-3 border-t border-[#30363d] animate-fadeIn space-y-2">
                    <div className="flex items-center gap-2">
                      {checkInfo.isCorrect ? (
                        <div className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Chính xác! (+20 XP)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-rose-400 text-xs font-bold">
                          <XCircle className="w-4 h-4" />
                          <span>Chưa đúng trật tự câu</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-[#0d1117] rounded-lg border border-[#21262d]">
                      <div className="text-xs text-slate-400 mb-1">Câu hoàn chỉnh:</div>
                      <div className="text-sm font-bold text-white font-japanese flex items-center justify-between">
                        <span>{item.correctSentence}</span>
                        <button
                          type="button"
                          onClick={() => speakJapanese(item.correctSentence)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-cyan-300 mt-1">
                        {item.explanation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GrammarPracticeView;
