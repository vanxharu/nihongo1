import React from 'react';
import { UserProfile } from '../types';
import { getPlayerLevelInfo } from '../utils/xpSystem';

interface LevelProgressBarProps {
  userProfile: UserProfile;
  todayXp?: number;
  onOpenProfile?: () => void;
  onTriggerCelebration?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const JLPT_LEVEL_INFO: Record<string, { label: string; name: string; color: string; bg: string; border: string }> = {
  N5: { label: 'N5', name: 'Sơ cấp 1', color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/40' },
  N4: { label: 'N4', name: 'Sơ cấp 2', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
  N3: { label: 'N3', name: 'Trung cấp', color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/40' },
  N2: { label: 'N2', name: 'Trung - Cao cấp', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40' },
  N1: { label: 'N1', name: 'Cao cấp', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
};

export default function LevelProgressBar({
  userProfile,
  onOpenProfile,
  onNavigateTab
}: LevelProgressBarProps) {
  const totalXp = userProfile.xp || 0;
  const levelInfo = getPlayerLevelInfo(totalXp);
  const jlptTarget = userProfile.targetLevel || 'N4';
  const jlptMeta = JLPT_LEVEL_INFO[jlptTarget] || JLPT_LEVEL_INFO.N4;

  const handleClick = () => {
    if (onNavigateTab) {
      onNavigateTab('progress');
    } else if (onOpenProfile) {
      onOpenProfile();
    }
  };

  return (
    <div className="relative inline-flex items-center select-none">
      {/* Clickable Header Progress Bar Pill - Navigates directly to the modern Progress tab */}
      <button
        type="button"
        id="header-level-progress-bar"
        onClick={handleClick}
        className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-all cursor-pointer shadow-2xs text-slate-800"
        title="Bấm để mở trang Tiến độ & Thống kê chi tiết"
      >
        {/* Streak indicator */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
          <span>🔥</span>
          <span>{userProfile.streak || 0}d</span>
        </div>

        {/* Level Badge */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-indigo-700 font-mono">
          <span>Lv.{levelInfo.level}</span>
        </div>

        {/* Level XP Progress Bar Container */}
        <div className="hidden sm:flex flex-col justify-center w-12 sm:w-16 text-left">
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
            <div
              className="h-full transition-all duration-300 rounded-full bg-indigo-600"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Target JLPT Badge */}
        <div className={`hidden md:flex px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider shrink-0 ${jlptMeta.bg} ${jlptMeta.color} border ${jlptMeta.border}`}>
          {jlptTarget}
        </div>
      </button>
    </div>
  );
}
