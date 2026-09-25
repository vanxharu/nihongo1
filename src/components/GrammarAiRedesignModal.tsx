/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Grammar AI Redesign & Preview Modal
 * Allows users and teachers to preview, customize, and apply AI-redesigned comprehensive grammar lessons
 */

import React, { useState } from 'react';
import {
  RefreshCw,
  Check,
  X,
  Volume2,
  BookOpen,
  Layers,
  History,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { GrammarItem, GrammarExample, GrammarExercise, GrammarAiContent, GrammarFormationRule, SimilarGrammarComparison } from '../types';
import { generateGrammarAiContent, saveGrammarContentToWebsite, rollbackGrammarAiContent } from '../services/grammarAI';

interface GrammarAiRedesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  grammarItem: GrammarItem;
  onAppliedSuccess: (updatedItem: GrammarItem) => void;
  handleSpeak: (text: string) => void;
}

export const GrammarAiRedesignModal: React.FC<GrammarAiRedesignModalProps> = ({
  isOpen,
  onClose,
  grammarItem,
  onAppliedSuccess,
  handleSpeak
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'all' | 'examples' | 'exercises'>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Preview generated content
  const [generatedData, setGeneratedData] = useState<{
    overview?: string;
    formationRules?: GrammarFormationRule[];
    usageGuide?: {
      whenToUse?: string[];
      whenNotToUse?: string[];
      subjectConstraint?: string;
      nuance?: string;
    };
    notes?: string[];
    memoryTip?: string;
    similarGrammars?: SimilarGrammarComparison[];
    examples: GrammarExample[];
    exercises: GrammarExercise[];
  } | null>(null);

  // Tab preview inside modal
  const [activeTab, setActiveTab] = useState<'overview' | 'examples' | 'exercises' | 'similar'>('overview');

  // Request AI Generation
  const handleGenerate = async (selectedMode: 'all' | 'examples' | 'exercises') => {
    setMode(selectedMode);
    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await generateGrammarAiContent({
        grammarId: grammarItem.id,
        grammar: grammarItem.structure,
        meaning: grammarItem.meaning,
        level: grammarItem.level,
        explanation: grammarItem.explanation,
        mode: selectedMode,
        existing_examples: grammarItem.examples || [
          { japanese: grammarItem.exampleSentence, vietnamese: grammarItem.exampleTranslation }
        ],
        existing_exercises: grammarItem.exercises || []
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Lỗi khi tạo nội dung từ AI');
      }

      setGeneratedData({
        overview: res.data.overview || '',
        formationRules: res.data.formationRules || [],
        usageGuide: res.data.usageGuide || {},
        notes: res.data.notes || [],
        memoryTip: res.data.memoryTip || '',
        similarGrammars: res.data.similarGrammars || [],
        examples: res.data.examples || [],
        exercises: res.data.exercises || []
      });
      setActiveTab('overview');
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tạo nội dung. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Confirm and save to website system (Postgres + File JSON)
  const handleConfirmSave = async () => {
    if (!generatedData) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload = {
        grammarId: grammarItem.id,
        grammar: grammarItem.structure,
        level: grammarItem.level,
        overview: generatedData.overview,
        formationRules: generatedData.formationRules,
        usageGuide: generatedData.usageGuide,
        notes: generatedData.notes,
        memoryTip: generatedData.memoryTip,
        similarGrammars: generatedData.similarGrammars,
        examples: generatedData.examples,
        exercises: generatedData.exercises
      };

      const res = await saveGrammarContentToWebsite(payload);
      if (!res.success || !res.item) {
        throw new Error(res.error || 'Không thể lưu vào hệ thống website.');
      }

      setSuccessMessage('Đã cập nhật bài học ngữ pháp thành công vào hệ thống website!');

      // Update parent component state
      const updated: GrammarItem = {
        ...grammarItem,
        aiOverview: res.item.overview,
        formationRules: res.item.formationRules,
        usageGuide: res.item.usageGuide,
        notes: res.item.notes,
        memoryTip: res.item.memoryTip,
        similarGrammars: res.item.similarGrammars,
        examples: res.item.examples,
        exercises: res.item.exercises,
        isAiEnhanced: true,
        lastAiUpdated: res.item.updatedAt,
        exampleSentence: res.item.examples?.[0]?.japanese || grammarItem.exampleSentence,
        exampleTranslation: res.item.examples?.[0]?.vietnamese || grammarItem.exampleTranslation
      };

      setTimeout(() => {
        onAppliedSuccess(updated);
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Rollback to previous version
  const handleRollback = async () => {
    if (!window.confirm('Bạn có chắc muốn khôi phục lại phiên bản trước đó của mẫu ngữ pháp này?')) {
      return;
    }

    setIsRollingBack(true);
    setErrorMessage(null);

    try {
      const res = await rollbackGrammarAiContent(grammarItem.id);
      if (!res.success || !res.item) {
        throw new Error(res.error || 'Không thể khôi phục phiên bản trước.');
      }

      setSuccessMessage('Đã khôi phục thành công phiên bản trước!');

      const updated: GrammarItem = {
        ...grammarItem,
        aiOverview: res.item.overview,
        formationRules: res.item.formationRules,
        usageGuide: res.item.usageGuide,
        notes: res.item.notes,
        memoryTip: res.item.memoryTip,
        similarGrammars: res.item.similarGrammars,
        examples: res.item.examples,
        exercises: res.item.exercises,
        isAiEnhanced: (res.item.examples?.length || 0) > 0,
        lastAiUpdated: res.item.updatedAt,
        exampleSentence: res.item.examples?.[0]?.japanese || grammarItem.exampleSentence,
        exampleTranslation: res.item.examples?.[0]?.vietnamese || grammarItem.exampleTranslation
      };

      setTimeout(() => {
        onAppliedSuccess(updated);
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể khôi phục.');
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#121625] border border-[#2b3353] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2b3353] bg-gradient-to-r from-[#171d33] via-[#1a233d] to-[#171d33] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Soạn Lại Cấu Trúc Toàn Bộ Bài Học</h3>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-xs font-black">
                  {grammarItem.level}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mẫu: <strong className="text-white">{grammarItem.structure}</strong> ({grammarItem.meaning})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-[#141828] border-b border-[#2b3353] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerate('all')}
              disabled={isGenerating}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Soạn toàn bộ bài học (Lý thuyết, Ví dụ, Bài tập)</span>
            </button>
          </div>

          <button
            onClick={handleRollback}
            disabled={isRollingBack || isGenerating}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <History className="w-3.5 h-3.5" />
            <span>Khôi phục bản gốc</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {!generatedData && !isGenerating && (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">Sẵn sàng thiết kế bài học chuẩn sư phạm</h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Nhấn nút <strong>"Soạn toàn bộ bài học"</strong> ở trên để phân tích cấu trúc, tạo quy tắc biến đổi, ngữ cảnh sử dụng, mẹo nhớ, ví dụ thực tế và bài tập JLPT.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                AI đang xây dựng bài giảng hoàn chỉnh cho 【{grammarItem.structure}】...
              </p>
            </div>
          )}

          {generatedData && !isGenerating && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {[
                  { key: 'overview', label: '1. Lý thuyết & Cấu trúc' },
                  { key: 'examples', label: `2. Ví dụ (${generatedData.examples.length})` },
                  { key: 'exercises', label: `3. Bài tập (${generatedData.exercises.length})` },
                  { key: 'similar', label: '4. So sánh & Mẹo nhớ' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.key
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview & Formation */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold text-indigo-400">TỔNG QUAN</div>
                    <p className="text-sm text-slate-200">{generatedData.overview}</p>
                  </div>

                  {generatedData.formationRules && generatedData.formationRules.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-emerald-400">QUY TẮC BIẾN ĐỔI</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {generatedData.formationRules.map((r, i) => (
                          <div key={i} className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
                            <span className="font-bold text-indigo-300">{r.partOfSpeech}: </span>
                            <span className="font-mono text-white">{r.rule}</span>
                            <div className="text-emerald-400 text-[11px]">{r.example}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedData.usageGuide?.whenToUse && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="text-xs font-bold text-cyan-400">KHI NÀO SỬ DỤNG</div>
                      <ul className="text-xs text-slate-300 list-disc pl-4 space-y-1">
                        {generatedData.usageGuide.whenToUse.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Examples */}
              {activeTab === 'examples' && (
                <div className="space-y-3">
                  {generatedData.examples.map((ex, i) => (
                    <div key={i} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="text-base font-bold text-white">{ex.japanese}</div>
                        <button
                          type="button"
                          onClick={() => handleSpeak(ex.japanese)}
                          className="text-slate-400 hover:text-indigo-400 p-1"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-indigo-300 font-mono">{ex.hiragana}</div>
                      <div className="text-xs font-medium text-emerald-400">{ex.vietnamese}</div>
                      {ex.explanation && (
                        <div className="text-[11px] text-slate-400 pt-1">💡 {ex.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Exercises */}
              {activeTab === 'exercises' && (
                <div className="space-y-4">
                  {generatedData.exercises.map((ex, i) => (
                    <div key={i} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-indigo-400">CÂU {i + 1} ({ex.type})</div>
                      <div className="text-sm font-bold text-white">{ex.question}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {ex.choices.map((c, cI) => (
                          <div
                            key={cI}
                            className={`p-2 rounded-lg border ${
                              c === ex.correct_answer
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-400">💡 {ex.explanation}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Similar & Memory Tip */}
              {activeTab === 'similar' && (
                <div className="space-y-4">
                  {generatedData.memoryTip && (
                    <div className="bg-purple-950/40 border border-purple-500/30 p-4 rounded-xl space-y-1">
                      <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" /> MẸO GHI NHỚ
                      </div>
                      <p className="text-xs sm:text-sm text-purple-100">{generatedData.memoryTip}</p>
                    </div>
                  )}

                  {generatedData.similarGrammars && generatedData.similarGrammars.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-amber-400">MẪU DỄ NHẦM LẪN</div>
                      {generatedData.similarGrammars.map((s, i) => (
                        <div key={i} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-amber-300">vs {s.similarStructure}</div>
                          <div className="text-slate-300">{s.difference}</div>
                          {s.comparisonExample && (
                            <div className="text-emerald-400 font-mono text-[11px]">{s.comparisonExample}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141828] border-t border-[#2b3353] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            Đóng
          </button>

          {generatedData && (
            <button
              onClick={handleConfirmSave}
              disabled={isSaving}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Lưu & Cập nhật trực tiếp vào website</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
export default GrammarAiRedesignModal;
