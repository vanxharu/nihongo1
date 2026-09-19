import React, { useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Award,
  ChevronRight,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { GrammarItem, JLPTLevel, UserGrammarProgress } from '../../types';

interface GrammarCatalogViewProps {
  grammarList: GrammarItem[];
  levelFilter: JLPTLevel | 'ALL';
  onSelectLevel: (lvl: JLPTLevel | 'ALL') => void;
  statusFilter: 'ALL' | 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';
  onSelectStatus: (status: 'ALL' | 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  progressMap: Record<string, UserGrammarProgress>;
  onSelectGrammar: (item: GrammarItem) => void;
  onOpenSmartReview: () => void;
  onOpenAiGeneratorModal: (item: GrammarItem) => void;
  handleSpeak: (text: string) => void;
}

export const GrammarCatalogView: React.FC<GrammarCatalogViewProps> = ({
  grammarList,
  levelFilter,
  onSelectLevel,
  statusFilter,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  progressMap,
  onSelectGrammar,
  onOpenSmartReview,
  onOpenAiGeneratorModal,
  handleSpeak
}) => {
  // Enrich items with user progress
  const enrichedList = useMemo(() => {
    return grammarList.map(item => {
      const prog = progressMap[item.id] || progressMap[item.structure];
      const status = prog?.status || 'new';
      const mastery = prog?.masteryScore || 0;
      const attempts = prog?.attempts || 0;
      const accuracy = prog?.accuracyRate || 0;
      const lastStudied = prog?.lastStudiedAt;
      const needsReview = prog?.needsReview || status === 'review';

      return {
        ...item,
        userProgress: prog || {
          grammarId: item.id,
          status,
          masteryScore: mastery,
          attempts,
          correctCount: prog?.correctCount || 0,
          incorrectCount: prog?.incorrectCount || 0,
          accuracyRate: accuracy,
          lastStudiedAt: lastStudied,
          needsReview
        }
      };
    });
  }, [grammarList, progressMap]);

  // Filter list
  const filteredList = useMemo(() => {
    return enrichedList.filter(item => {
      // Level filter
      if (levelFilter !== 'ALL' && item.level !== levelFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL') {
        const itemStatus = item.userProgress?.status || 'new';
        if (statusFilter === 'NEW' && itemStatus !== 'new') return false;
        if (statusFilter === 'LEARNING' && (itemStatus !== 'learning' && itemStatus !== 'practicing')) return false;
        if (statusFilter === 'REVIEW' && !item.userProgress?.needsReview && itemStatus !== 'review') return false;
        if (statusFilter === 'MASTERED' && itemStatus !== 'mastered') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchStructure = item.structure?.toLowerCase().includes(q);
        const matchMeaning = item.meaning?.toLowerCase().includes(q);
        const matchExplanation = item.explanation?.toLowerCase().includes(q);
        const matchExample = item.exampleSentence?.toLowerCase().includes(q) || item.exampleTranslation?.toLowerCase().includes(q);
        if (!matchStructure && !matchMeaning && !matchExplanation && !matchExample) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedList, levelFilter, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = enrichedList.length;
    const mastered = enrichedList.filter(i => i.userProgress?.status === 'mastered').length;
    const learning = enrichedList.filter(i => i.userProgress?.status === 'learning' || i.userProgress?.status === 'practicing').length;
    const needsReview = enrichedList.filter(i => i.userProgress?.needsReview || i.userProgress?.status === 'review').length;
    const avgMastery = total > 0 ? Math.round(enrichedList.reduce((sum, i) => sum + (i.userProgress?.masteryScore || 0), 0) / total) : 0;

    return { total, mastered, learning, needsReview, avgMastery };
  }, [enrichedList]);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      
      {/* Top Banner: Stats & Smart Review CTA */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Hệ Thống Ngữ Pháp AI Thế Hệ Mới
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Kho Ngữ Pháp JLPT & Ôn Tập Cá Nhân Hóa
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Học theo quy trình 4 bước chuẩn sư phạm: <strong className="text-slate-200">Hiểu bản chất → Ví dụ thực tế → Luyện tập đa dạng → Ôn tập thông minh</strong>.
            </p>
          </div>

          {/* Smart Review Button */}
          <button
            id="btn-smart-review-banner"
            onClick={onOpenSmartReview}
            className="w-full md:w-auto px-5 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 shrink-0"
          >
            <div className="p-1.5 bg-white/20 rounded-lg">
              <RotateCcw className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase tracking-wider text-indigo-100 font-medium">Spaced Repetition</div>
              <div className="text-sm font-bold">🔄 Ôn Tập Cá Nhân Hóa ({stats.needsReview} mẫu cần ôn)</div>
            </div>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Tổng mẫu ngữ pháp
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mt-0.5">{stats.total}</div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
            <div className="text-xs text-emerald-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Đã thành thạo
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-300 mt-0.5">{stats.mastered}</div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
            <div className="text-xs text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Cần ôn tập
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-300 mt-0.5">{stats.needsReview}</div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
            <div className="text-xs text-cyan-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Độ thành thạo trung bình
            </div>
            <div className="text-lg sm:text-xl font-bold text-cyan-300 mt-0.5">{stats.avgMastery}%</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
        {/* Level Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Trình độ:
          </span>
          {(['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'] as const).map(lvl => (
            <button
              key={lvl}
              id={`filter-level-${lvl}`}
              onClick={() => onSelectLevel(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                levelFilter === lvl
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {lvl === 'ALL' ? 'Tất cả' : lvl}
            </button>
          ))}
        </div>

        {/* Status Filters & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          
          {/* Status Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'NEW', label: 'Chưa học' },
              { key: 'LEARNING', label: 'Đang học' },
              { key: 'REVIEW', label: 'Cần ôn' },
              { key: 'MASTERED', label: 'Thành thạo' }
            ].map(tab => (
              <button
                key={tab.key}
                id={`filter-status-${tab.key}`}
                onClick={() => onSelectStatus(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-grammar"
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Tìm theo cấu trúc, ý nghĩa, từ khóa..."
              className="w-full pl-9.5 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grammar Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-10 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">Không tìm thấy mẫu ngữ pháp nào phù hợp</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Thử thay đổi bộ lọc trình độ, trạng thái học hoặc từ khóa tìm kiếm.
          </p>
          <button
            onClick={() => {
              onSelectLevel('ALL');
              onSelectStatus('ALL');
              onSearchChange('');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map(item => {
            const progress = item.userProgress;
            const mastery = progress?.masteryScore || 0;
            const status = progress?.status || 'new';
            const attempts = progress?.attempts || 0;
            const accuracy = progress?.accuracyRate || 0;
            const isAiEnhanced = item.isAiEnhanced || (item.examples && item.examples.length > 1);

            return (
              <div
                key={item.id}
                id={`card-grammar-${item.id}`}
                className="group relative bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                {/* Header: Level Badge & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-black rounded-md ${
                      item.level === 'N5' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                      item.level === 'N4' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      item.level === 'N3' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      item.level === 'N2' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.level}
                    </span>

                    {isAiEnhanced && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md text-[10px] font-semibold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                        AI Enhanced
                      </span>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div>
                    {status === 'mastered' ? (
                      <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Thành thạo
                      </span>
                    ) : progress?.needsReview || status === 'review' ? (
                      <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full text-[11px] font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Cần ôn tập
                      </span>
                    ) : status === 'practicing' || status === 'learning' ? (
                      <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-full text-[11px] font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3 text-indigo-400" /> Đang học
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full text-[11px] font-medium">
                        Chưa học
                      </span>
                    )}
                  </div>
                </div>

                {/* Grammar Title & Meaning */}
                <div className="space-y-1.5 cursor-pointer" onClick={() => onSelectGrammar(item)}>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.structure}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(item.structure);
                      }}
                      className="text-slate-500 hover:text-indigo-400 p-1 rounded-md transition-colors"
                      title="Phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-emerald-400 line-clamp-1">
                    {item.meaning}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.aiOverview || item.explanation}
                  </p>
                </div>

                {/* Primary Example Sentence */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 bg-slate-950/40 rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-300 font-medium line-clamp-1">
                    {item.examples?.[0]?.japanese || item.exampleSentence}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.examples?.[0]?.vietnamese || item.exampleTranslation}
                  </div>
                </div>

                {/* Mastery Progress Bar & Stats */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Độ thành thạo: <strong className="text-white">{mastery}%</strong></span>
                    <span>Luyện: <strong className="text-slate-200">{attempts}</strong> lần ({accuracy}% đúng)</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        mastery >= 85 ? 'bg-emerald-500' :
                        mastery >= 60 ? 'bg-indigo-500' :
                        mastery >= 30 ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${mastery}%` }}
                    />
                  </div>

                  {/* Actions: Study Button + AI Redesign CTA */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      id={`btn-study-grammar-${item.id}`}
                      onClick={() => onSelectGrammar(item)}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Vào học ngay</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      id={`btn-ai-redesign-${item.id}`}
                      onClick={() => onOpenAiGeneratorModal(item)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 border border-slate-700 rounded-xl transition-colors"
                      title="AI Thiết kế bài học hoàn chỉnh"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default GrammarCatalogView;
