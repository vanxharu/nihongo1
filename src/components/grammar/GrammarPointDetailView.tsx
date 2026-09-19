import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  PenTool,
  Volume2,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Zap,
  FileText,
  Target,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { GrammarItem, UserProfile } from '../../types';
import JlptMascot from './JlptMascot';
import { speakJapanese } from '../../utils/audio';
import JapaneseFuriganaText from '../JapaneseFuriganaText';
import { deduplicateGrammars, getGrammarStatusWithAliases } from '../../utils/grammarDeduplicator';

interface GrammarPointDetailViewProps {
  grammar: GrammarItem;
  aiContent?: any;
  allGrammarsInLesson: GrammarItem[];
  userProfile: UserProfile;
  showFurigana: boolean;
  onToggleFurigana: () => void;
  onBackToLesson: () => void;
  onStartPractice: () => void;
  onSelectRelatedGrammar: (grammar: GrammarItem) => void;
  onSelectNextGrammar?: (nextGrammar: GrammarItem) => void;
  onToggleBookmark: (grammarId: string) => void;
  onToggleSrsReview: (grammarId: string) => void;
}

export const GrammarPointDetailView: React.FC<GrammarPointDetailViewProps> = ({
  grammar,
  aiContent,
  allGrammarsInLesson,
  userProfile,
  showFurigana,
  onToggleFurigana,
  onBackToLesson,
  onStartPractice,
  onSelectRelatedGrammar,
  onSelectNextGrammar,
  onToggleBookmark,
  onToggleSrsReview
}) => {
  const grammarStatusItem = getGrammarStatusWithAliases(userProfile.grammarStatus, grammar);
  const isBookmarked = typeof grammarStatusItem === 'object' ? Boolean(grammarStatusItem?.isBookmarked) : false;
  const srsStage = typeof grammarStatusItem === 'object' ? Number(grammarStatusItem?.srsStage || 0) : 0;

  // Clean deduplicated lesson grammars for navigation
  const cleanLessonGrammars = useMemo(() => deduplicateGrammars(allGrammarsInLesson), [allGrammarsInLesson]);
  const currentIndex = cleanLessonGrammars.findIndex(
    g => g.id === grammar.id || (grammar.mergedIds && grammar.mergedIds.includes(g.id))
  );
  const nextGrammar = currentIndex >= 0 && currentIndex < cleanLessonGrammars.length - 1
    ? cleanLessonGrammars[currentIndex + 1]
    : null;

  // Related grammars: other unique grammars in the same lesson
  const relatedGrammars = cleanLessonGrammars
    .filter(g => g.id !== grammar.id && !(grammar.mergedIds && grammar.mergedIds.includes(g.id)))
    .slice(0, 3);

  // Extract examples
  const examplesList = [];
  if (grammar.exampleSentence && grammar.exampleTranslation) {
    examplesList.push({
      japanese: grammar.exampleSentence,
      vietnamese: grammar.exampleTranslation
    });
  }

  // If AI content has examples, add them
  if (aiContent?.examples && Array.isArray(aiContent.examples)) {
    aiContent.examples.forEach((ex: any) => {
      if (ex.japanese && ex.vietnamese && ex.japanese !== grammar.exampleSentence) {
        examplesList.push({
          japanese: ex.japanese,
          vietnamese: ex.vietnamese
        });
      }
    });
  }

  // Pre-loaded high fidelity examples for popular patterns like んです
  if (grammar.structure.includes('んです') && examplesList.length < 3) {
    examplesList.push(
      {
        japanese: 'かおがあかいですね。―― はずかしいんです。',
        vietnamese: 'Mặt bạn đỏ nhỉ. — Vì tôi ngượng ấy mà.'
      },
      {
        japanese: 'なぜそんなにべんきょうするんですか。―― しけんがあるんです。',
        vietnamese: 'Sao bạn học nhiều thế? — Vì tôi có thi mà.'
      },
      {
        japanese: 'きのうこなかったんですか。―― かぜをひいたんです。',
        vietnamese: 'Hôm qua bạn không đến à? — Vì tôi bị cảm mà.'
      }
    );
  }

  // Default explanation bullets
  const meaningBullets = aiContent?.explanationBullets || [
    `「${grammar.structure}」 ${grammar.meaning || 'diễn đạt ý nghĩa ngữ pháp quan trọng trong tiếng Nhật'}.`,
    `Thường dùng trong các cuộc trò chuyện hàng ngày để truyền đạt thông điệp tự nhiên và chính xác.`
  ];

  const usageBullets = aiContent?.usageBullets || [
    'Sử dụng trong giao tiếp hàng ngày và văn viết phù hợp với cấp độ bài học.',
    'Chú ý chia thể động từ/tính từ chính xác trước khi kết hợp với mẫu câu.'
  ];

  const notesBullets = aiContent?.notesBullets || [
    'Tránh nhầm lẫn với các mẫu câu có cách kết hợp tương tự.',
    'Lưu ý các trường hợp bất quy tắc của động từ và tính từ đuôi な / danh từ.'
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 animate-fadeIn font-sans text-slate-100">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          type="button"
          onClick={onBackToLesson}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>第{grammar.lessonNumber || 26}課 – Bài {grammar.lessonNumber || 26}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Furigana Toggle */}
          <button
            type="button"
            onClick={onToggleFurigana}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              showFurigana
                ? 'bg-purple-950/70 border-purple-600/60 text-purple-200'
                : 'bg-[#161b22] border-[#30363d] text-slate-400 hover:text-slate-200'
            }`}
          >
            {showFurigana ? <Eye className="w-3.5 h-3.5 text-purple-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Furigana</span>
          </button>

          {/* Practice Button */}
          <button
            type="button"
            onClick={onStartPractice}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Làm bài tập</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <JlptMascot size={42} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-japanese">
              {grammar.structure}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {grammar.meaning}
            </p>
          </div>
        </div>

        {/* Sub-actions: Bookmark & SRS */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => onToggleBookmark(grammar.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
                : 'bg-[#161b22] border-[#30363d] hover:text-white'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isBookmarked ? 'Đã lưu ghi nhớ' : 'Thêm vào ghi nhớ'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSrsReview(grammar.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
              srsStage > 0
                ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
                : 'bg-[#161b22] border-[#30363d] hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Lặp lại ngắt quãng {srsStage > 0 ? `(Cấp ${srsStage})` : ''}</span>
          </button>
        </div>
      </div>

      {/* 4 Core Cards in 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Card 1: CẤU TRÚC */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
            <Zap className="w-4 h-4" />
            <span>CẤU TRÚC</span>
          </div>
          <div className="p-3 bg-[#0d1117] rounded-lg border border-[#21262d] flex items-center gap-2 font-japanese text-sm font-bold text-white">
            <span className="px-2 py-0.5 rounded bg-teal-950/80 border border-teal-600/50 text-teal-300 text-xs">
              TTT
            </span>
            <span>+</span>
            <span className="text-cyan-300">{grammar.structure.replace(/TTT|\+|〜/g, '').trim() || grammar.structure}</span>
          </div>
          {aiContent?.formation && (
            <div className="mt-2 text-xs text-slate-400 leading-relaxed font-mono">
              {aiContent.formation}
            </div>
          )}
        </div>

        {/* Card 2: GIẢI NGHĨA */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
            <FileText className="w-4 h-4" />
            <span>GIẢI NGHĨA</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {meaningBullets.map((bullet: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 3: PHẠM VI SỬ DỤNG */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
            <Target className="w-4 h-4" />
            <span>PHẠM VI SỬ DỤNG</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {usageBullets.map((bullet: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 4: LƯU Ý */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>LƯU Ý</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
            {notesBullets.map((bullet: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          {relatedGrammars.length > 0 && (
            <div className="text-xs text-slate-400 pt-2 border-t border-[#21262d] flex items-center gap-2 flex-wrap">
              <span>Xem thêm:</span>
              <button
                type="button"
                onClick={() => onSelectRelatedGrammar(relatedGrammars[0])}
                className="px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] text-cyan-300 border border-[#30363d] transition-colors cursor-pointer"
              >
                {relatedGrammars[0].structure}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section: Ví dụ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Ví dụ
          </h2>
        </div>

        <div className="space-y-3">
          {examplesList.map((ex, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-base font-bold text-white mb-1 font-japanese leading-relaxed">
                  {showFurigana ? (
                    <JapaneseFuriganaText
                      sentence={ex.japanese}
                      showFurigana={true}
                      forceDark={true}
                      size="base"
                    />
                  ) : (
                    ex.japanese
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-400">
                  {ex.vietnamese}
                </div>
              </div>

              {/* Audio Speaker */}
              <button
                type="button"
                onClick={() => speakJapanese(ex.japanese)}
                title="Nghe phát âm tiếng Nhật"
                className="w-9 h-9 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Mẫu liên quan (beta) */}
      {relatedGrammars.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Mẫu liên quan (beta)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {relatedGrammars.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectRelatedGrammar(rel)}
                className="p-3.5 rounded-xl bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-blue-500/60 transition-all cursor-pointer shadow-sm"
              >
                <div className="text-sm font-bold text-white font-japanese truncate">
                  {rel.structure}
                </div>
                <div className="text-xs text-slate-400 truncate mt-1">
                  {rel.meaning}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Next Link */}
      {nextGrammar && onSelectNextGrammar && (
        <div className="flex justify-end pt-4 border-t border-[#21262d]">
          <button
            type="button"
            onClick={() => onSelectNextGrammar(nextGrammar)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors"
          >
            <span>Mẫu tiếp: {nextGrammar.structure}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default GrammarPointDetailView;
