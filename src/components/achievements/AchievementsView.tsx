import React, { useState, useMemo } from 'react';
import { ArrowLeft, Lock, Award, CheckCircle2, Search, X, Filter } from 'lucide-react';
import { UserProfile } from '../../types';
import { 
  ACHIEVEMENTS_LIST, 
  TOTAL_ACHIEVEMENTS_COUNT, 
  AchievementItem, 
  calculateUnlockedAchievements,
  AchievementCategory
} from '../../data/achievementsData';
import { AchievementMascotIcon } from './AchievementMascotIcon';

interface AchievementsViewProps {
  userProfile: UserProfile;
  onBack: () => void;
}

type StatusFilter = 'all' | 'unlocked' | 'locked';

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  userProfile,
  onBack
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compute unlocked status
  const unlockedIds = useMemo(() => {
    return calculateUnlockedAchievements(userProfile);
  }, [userProfile]);

  const unlockedCount = unlockedIds.size;
  const progressPercent = Math.round((unlockedCount / TOTAL_ACHIEVEMENTS_COUNT) * 100);

  // Category options
  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'Tất cả', count: TOTAL_ACHIEVEMENTS_COUNT },
      { id: 'onboarding', label: 'Khởi đầu', count: ACHIEVEMENTS_LIST.filter(a => a.category === 'onboarding').length },
      { id: 'streak', label: 'Thói quen', count: ACHIEVEMENTS_LIST.filter(a => a.category === 'streak').length },
      { id: 'vocab', label: 'Từ vựng', count: ACHIEVEMENTS_LIST.filter(a => a.category === 'vocab').length },
      { id: 'kanji', label: 'Hán tự', count: ACHIEVEMENTS_LIST.filter(a => a.category === 'kanji').length },
      { id: 'grammar', label: 'Ngữ pháp', count: ACHIEVEMENTS_LIST.filter(a => a.category === 'grammar').length },
      { id: 'practice', label: 'Luyện tập', count: ACHIEVEMENTS_LIST.filter(a => a.category === 'practice').length },
      { id: 'milestone', label: 'Cấp độ & XP', count: ACHIEVEMENTS_LIST.filter(a => a.category === 'milestone').length },
    ];
  }, []);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS_LIST.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      const isUnlocked = unlockedIds.has(item.id);

      // Status filter
      if (statusFilter === 'unlocked' && !isUnlocked) return false;
      if (statusFilter === 'locked' && isUnlocked) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchCat = item.categoryName.toLowerCase().includes(query);
        const matchNum = item.number.toString() === query || `#${item.number}` === query;
        if (!matchTitle && !matchDesc && !matchCat && !matchNum) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategory, statusFilter, searchQuery, unlockedIds]);

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col items-center select-none pb-28 font-sans animate-fadeIn">
      {/* Container */}
      <div className="w-full max-w-4xl px-3 sm:px-6 pt-2 sm:pt-4 flex flex-col flex-1">
        {/* Top Header with Back Arrow and Title "Thành tựu" */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              id="achievements-back-btn"
              onClick={onBack}
              className="p-1.5 sm:p-2 -ml-1 text-slate-200 hover:text-white active:scale-95 transition-all cursor-pointer rounded-xl hover:bg-slate-800/70"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Thành tựu
                <span className="text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  100 huy hiệu
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Yellow Banner "Thành tựu - Mở khóa {unlockedCount}/100" with Progress */}
        <div className="w-full bg-gradient-to-r from-[#EAB308] via-[#F59E0B] to-[#D97706] rounded-2xl sm:rounded-3xl p-3 sm:p-5 text-white shadow-xl shadow-amber-950/20 mb-3 sm:mb-4 relative overflow-hidden">
          {/* Subtle sparkle decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 sm:gap-4 relative z-10">
            {/* Daruma mascot on left */}
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <svg viewBox="0 0 100 100" width={38} height={38} className="w-full h-full drop-shadow">
                <ellipse cx="50" cy="54" rx="34" ry="34" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                <path d="M 28 50 C 28 30, 72 30, 72 50 C 72 66, 28 66, 28 50 Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.5" />
                <circle cx="40" cy="46" r="4" fill="#0F172A" />
                <circle cx="60" cy="46" r="4" fill="#0F172A" />
                <circle cx="41.5" cy="44.5" r="1.5" fill="#FFFFFF" />
                <circle cx="61.5" cy="44.5" r="1.5" fill="#FFFFFF" />
                <path d="M 38 56 Q 50 52 62 56 Q 50 60 38 56 Z" fill="#0F172A" />
                <text x="50" y="78" fontSize="7.5" fontWeight="black" fill="#FDE047" textAnchor="middle" fontFamily="monospace">JLPT</text>
              </svg>
            </div>

            {/* Texts */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-tight">
                  Bộ sưu tập
                </h2>
                <span className="text-xs font-black bg-black/20 px-2 py-0.5 rounded-full text-amber-100">
                  {progressPercent}%
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-amber-100/95 mt-0.5 truncate">
                Mở khóa {unlockedCount} / {TOTAL_ACHIEVEMENTS_COUNT} thành tựu
              </p>

              {/* Progress bar */}
              <div className="w-full h-1.5 sm:h-2 bg-black/20 rounded-full overflow-hidden mt-1.5 sm:mt-2 p-0.5">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(4, progressPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Status Filter Row */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thành tựu, từ khóa, số #..."
              className="w-full bg-[#121927] border border-slate-800 rounded-xl pl-9 sm:pl-10 pr-8 sm:pr-9 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/70 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-white absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 rounded-full hover:bg-slate-700/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Buttons: Tất cả, Đã mở, Chưa mở */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-[#121927] border border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1 sm:py-1.5 px-2 rounded-lg font-bold transition-all text-center whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả <span className="hidden sm:inline">({TOTAL_ACHIEVEMENTS_COUNT})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unlocked')}
              className={`flex-1 py-1 sm:py-1.5 px-2 rounded-lg font-bold transition-all text-center whitespace-nowrap ${
                statusFilter === 'unlocked'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đã mở <span className="hidden sm:inline">({unlockedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('locked')}
              className={`flex-1 py-1 sm:py-1.5 px-2 rounded-lg font-bold transition-all text-center whitespace-nowrap ${
                statusFilter === 'locked'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chưa mở <span className="hidden sm:inline">({TOTAL_ACHIEVEMENTS_COUNT - unlockedCount})</span>
            </button>
          </div>
        </div>

        {/* Categories Horizontal Scroll Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 mb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 border border-amber-500/80 text-amber-300 shadow-sm'
                    : 'bg-[#121927] border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Showing Count */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-2">
          <span>Hiển thị {filteredAchievements.length} thành tựu</span>
          {searchQuery && (
            <span className="text-amber-400/90">Lọc theo: "{searchQuery}"</span>
          )}
        </div>

        {/* Adaptive Responsive Grid of Achievement Badges */}
        {filteredAchievements.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-slate-300">Không tìm thấy thành tựu nào</p>
            <p className="text-xs text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
            {filteredAchievements.map((item) => {
              const isUnlocked = unlockedIds.has(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`achievement-card-${item.id}`}
                  onClick={() => setSelectedAchievement(item)}
                  className={`flex flex-col items-center justify-between text-center p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer min-h-[135px] sm:min-h-[146px] relative group ${
                    isUnlocked
                      ? 'bg-[#152033] border-amber-500/40 shadow-md shadow-amber-950/20 hover:border-amber-400 hover:bg-[#1a2840]'
                      : 'bg-[#121927] border-slate-800/80 hover:border-slate-700/80 hover:bg-[#161f30]'
                  }`}
                >
                  {/* Badge Number & XP in small header */}
                  <div className="w-full flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                    <span className="font-mono text-slate-400">#{item.number}</span>
                    {item.rewardXp && (
                      <span className="font-bold text-amber-400/80">+{item.rewardXp} XP</span>
                    )}
                  </div>

                  {/* Character Mascot Icon */}
                  <div className="pt-1 flex-1 flex items-center justify-center">
                    <AchievementMascotIcon
                      type={item.character}
                      isUnlocked={isUnlocked}
                      size={52}
                    />
                  </div>

                  {/* Title and Lock status */}
                  <div className="w-full pt-1 flex flex-col items-center">
                    <span className={`text-[11px] sm:text-xs font-bold line-clamp-2 leading-tight ${
                      isUnlocked ? 'text-white' : 'text-slate-400'
                    }`}>
                      {item.title}
                    </span>

                    {/* Lock or Checkmark indicator */}
                    <div className="mt-1 flex items-center justify-center">
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievement Detail Modal when tapped */}
      {selectedAchievement && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setSelectedAchievement(null)}
        >
          <div 
            className="w-full max-w-sm bg-[#152033] border border-slate-700/90 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mascot in modal */}
            <div className="flex justify-center pt-2">
              <AchievementMascotIcon
                type={selectedAchievement.character}
                isUnlocked={unlockedIds.has(selectedAchievement.id)}
                size={92}
              />
            </div>

            {/* Badge Title & Number */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold mb-2">
                <span className="text-amber-400 font-mono">#{selectedAchievement.number}</span>
                <span>•</span>
                <span>{selectedAchievement.categoryName}</span>
              </div>
              <h3 className="text-xl font-black text-white">
                {selectedAchievement.title}
              </h3>
              <p className="text-xs font-medium text-slate-300 mt-2 leading-relaxed px-2">
                {selectedAchievement.description}
              </p>
            </div>

            {/* Reward and Status Indicators */}
            <div className="flex flex-col items-center gap-2 pt-1">
              {selectedAchievement.rewardXp && (
                <div className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Phần thưởng: +{selectedAchievement.rewardXp} XP</span>
                </div>
              )}

              {unlockedIds.has(selectedAchievement.id) ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã mở khóa thành công!</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800/90 border border-slate-700 text-slate-400 rounded-full text-xs font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Chưa mở khóa</span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedAchievement(null)}
              className="w-full py-2.5 bg-[#EAB308] hover:bg-[#CA8A04] active:scale-98 text-slate-950 font-black text-sm rounded-xl transition-all cursor-pointer shadow-md mt-2"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsView;
