import React, { useState, useEffect } from 'react';
import { Flame, Volume2 } from 'lucide-react';
import ShibaMascot from './ShibaMascot';
import { speakJapanese } from '../../utils/audio';
import { dailyShibaTip } from '../../utils/dailyShibaTip';

interface ShibaCompanionBannerProps {
  targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  streakCount?: number;
  className?: string;
}

/** Compact companion strip: mascot + streak/goal chips + daily tip. Actions live in the hub grid (no duplicate buttons). */
export default function ShibaCompanionBanner({
  targetLevel = 'N5',
  streakCount = 3,
  className = ''
}: ShibaCompanionBannerProps) {
  const [poseIndex, setPoseIndex] = useState<number>(0);
  const poses: Array<'waving' | 'studying' | 'cheering' | 'winking'> = ['waving', 'cheering', 'studying', 'winking'];

  const [tip, setTip] = useState(() => dailyShibaTip());
  useEffect(() => {
    const update = () => setTip(dailyShibaTip());
    const timer = window.setInterval(update, 60000);
    window.addEventListener('focus', update);
    return () => { clearInterval(timer); window.removeEventListener('focus', update); };
  }, []);

  const handleMascotClick = () => {
    setPoseIndex((prev) => (prev + 1) % poses.length);
    speakJapanese(tip.ja);
  };

  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#1b223c] to-[#0f1424] p-3 shadow-lg ${className}`}>
      <button
        type="button"
        onClick={handleMascotClick}
        title="Nhấn để đổi tư thế và nghe Shiba chào!"
        className="shrink-0 w-16 h-16 rounded-xl bg-[#1d2440] border border-amber-400/40 flex items-center justify-center overflow-hidden active:scale-95 transition-transform cursor-pointer"
      >
        <ShibaMascot pose={poses[poseIndex]} size={56} animated={true} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Flame className="w-3 h-3 text-amber-400" />
            {streakCount} ngày
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            🌸 Mục tiêu {targetLevel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <p className="text-xs font-bold text-white leading-snug min-w-0">{tip.ja}</p>
          <button
            type="button"
            onClick={() => speakJapanese(tip.ja)}
            className="shrink-0 p-1 rounded-md text-amber-400 hover:bg-white/10 cursor-pointer"
            title="Nghe phát âm tiếng Nhật"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">{tip.vi}</p>
      </div>
    </div>
  );
}
