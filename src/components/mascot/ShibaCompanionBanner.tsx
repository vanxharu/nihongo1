import React, { useState } from 'react';
import { Sparkles, MessageCircle, Flame, ArrowRight, BookOpen, Volume2 } from 'lucide-react';
import ShibaMascot from './ShibaMascot';
import { speakJapanese } from '../../utils/audio';

interface ShibaCompanionBannerProps {
  onNavigate: (tab: string) => void;
  targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  userName?: string;
  streakCount?: number;
  className?: string;
}

const SHIBA_DAILY_TIPS: Record<string, { ja: string; vi: string; romaji: string }> = {
  N5: {
    ja: 'はじめまして！一緒に楽しく日本語を学ぼう！',
    vi: 'Rất vui được gặp bạn! Hãy cùng học tiếng Nhật thật vui nào!',
    romaji: 'Hajimemashite! Issho ni tanoshiku nihongo o manabou!'
  },
  N4: {
    ja: '継続は力なり！毎日5分でも素晴らしい進歩だよ。',
    vi: 'Kiên trì là sức mạnh! Mỗi ngày 5 phút cũng là tiến bộ vượt bậc rồi.',
    romaji: 'Keizoku wa chikara nari! Mainichi gofun demo subarashii shinpo da yo.'
  },
  N3: {
    ja: '七転び八起き！失敗を恐れずにたくさん話そう。',
    vi: 'Ngã 7 lần, đứng dậy 8 lần! Đừng ngại sai mà hãy nói thật nhiều nhé.',
    romaji: 'Nanakorobi yaoki! Shippai o osorezu ni takusan hanasou.'
  },
  N2: {
    ja: '千里の道も一歩から。今日も着実に積み重ねよう！',
    vi: 'Đường ngàn dặm bắt đầu từ một bước chân. Hôm nay cùng tích lũy nhé!',
    romaji: 'Senri no michi mo ippo kara. Kyou mo chakujitsu ni tsumikasaneyou!'
  },
  N1: {
    ja: '日進月歩！プロフェッショナルな日本語を目指そう。',
    vi: 'Tiến bộ từng ngày từng tháng! Cùng hướng tới tiếng Nhật chuyên gia.',
    romaji: 'Nisshin geppo! Purofesshonaru na nihongo o mezasou.'
  }
};

export default function ShibaCompanionBanner({
  onNavigate,
  targetLevel = 'N5',
  userName = 'Bạn',
  streakCount = 3,
  className = ''
}: ShibaCompanionBannerProps) {
  const [poseIndex, setPoseIndex] = useState<number>(0);
  const poses: Array<'waving' | 'studying' | 'cheering' | 'winking'> = ['waving', 'cheering', 'studying', 'winking'];

  const tip = SHIBA_DAILY_TIPS[targetLevel] || SHIBA_DAILY_TIPS.N5;

  const handleMascotClick = () => {
    // Cycle pose & speak encouragement
    setPoseIndex((prev) => (prev + 1) % poses.length);
    speakJapanese(tip.ja);
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1b223c] via-[#161c32] to-[#0f1424] p-4 sm:p-5 shadow-xl ${className}`}
    >
      {/* Background Japanese Aesthetics: Subtle Sunburst and Sakura Bloom */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-amber-500/10 to-rose-500/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
      <div className="absolute top-2 right-4 text-xs font-serif text-white/5 tracking-[0.3em] select-none pointer-events-none font-bold">
        にほんしば • NIHON SHIBA
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Mascot Avatar with Interactive Click */}
        <div className="shrink-0 flex flex-col items-center">
          <div 
            onClick={handleMascotClick}
            title="Nhấn để đổi tư thế và nghe Shiba chào!"
            className="group relative cursor-pointer active:scale-95 transition-transform"
          >
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500/30 to-rose-500/30 blur-md group-hover:opacity-100 transition-opacity" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-[#242c48] to-[#141a2e] p-1 border-2 border-amber-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,166,35,0.2),transparent_70%)] pointer-events-none" />
              <ShibaMascot 
                pose={poses[poseIndex]} 
                size={86} 
                animated={true}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e64556] text-[10px] text-white font-bold shadow">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>

          <div className="mt-1.5 text-center">
            <span className="text-[11px] font-black text-amber-400 tracking-wider uppercase">
              Nihon Shiba
            </span>
            <div className="text-[9px] text-slate-400">Bạn đồng hành {targetLevel}</div>
          </div>
        </div>

        {/* Content & Kotowaza Encouragement */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Streak {streakCount} ngày
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              🌸 Mục tiêu {targetLevel}
            </span>
          </div>

          {/* Daily Japanese Quote from Shiba */}
          <div className="bg-[#12182b]/80 border border-slate-700/60 rounded-2xl p-3 mb-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>"{tip.ja}"</span>
                <button
                  type="button"
                  onClick={() => speakJapanese(tip.ja)}
                  className="p-1 rounded-md text-amber-400 hover:text-amber-300 hover:bg-white/10 transition-colors"
                  title="Nghe phát âm tiếng Nhật"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-300 font-medium">
              👉 {tip.vi}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              id="shiba-banner-btn-chat"
              onClick={() => onNavigate('japanese-chat')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#e89a3c] to-[#f6ba6d] text-[#14100d] font-black text-xs shadow-[0_3px_0_#b86f19] active:translate-y-0.5 active:shadow-none transition-all hover:brightness-105 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Nói chuyện cùng Shiba AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id="shiba-banner-btn-practice"
              onClick={() => onNavigate('vocabulary')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#252e50] hover:bg-[#2d3960] text-slate-200 border border-slate-600/50 font-bold text-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Ôn từ vựng 5 phút</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
