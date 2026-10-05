import React from 'react';
import { BRAND_NAME } from '../constants/brand';

interface JpStudyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  showHanko?: boolean;
  dark?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

/** Official mascot emblem shared by every logo placement. */
export function NihonGoEmblem({ className = '', size = 40 }: { className?: string; size?: number | string }) {
  return <img src="/brand/nihon-shiba-2026-corrected.png" alt="Nihon Shiba" width={typeof size === 'number' ? size : undefined} height={typeof size === 'number' ? size : undefined} style={{width:size,height:size}} className={`shrink-0 object-contain drop-shadow-sm ${className}`} />;
}

/**
 * Traditional Japanese Red Hanko / Inkan Seal (印鑑) Badge
 */
export function JapaneseHankoSeal({ 
  text = '日本語',
  className = '' 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <span 
      className={`brand-hanko inline-flex items-center justify-center px-1.5 py-0.5 rounded-[5px] bg-[#DC2626] border border-red-400/80 shadow-xs select-none ${className}`}
      title="Con dấu chuẩn Nhật Bản"
    >
      <span className="text-[10px] font-black text-amber-100 font-jp tracking-wider leading-none">
        {text}
      </span>
    </span>
  );
}

export default function JpStudyLogo({
  size = 'md',
  showText = true,
  showSubtitle = false,
  showHanko = true,
  dark = false,
  layout = 'horizontal',
  className = ''
}: JpStudyLogoProps) {
  // Dimension configurations tailored for Mobile, Tablet, and Desktop Window screens
  const pixelSizes = {
    xs: 28,
    sm: 34,
    md: 42,
    lg: 52,
    xl: 68
  }[size];

  const titleSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl'
  }[size];

  const subtitleSizes = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm'
  }[size];

  const isVertical = layout === 'vertical';

  return (
    <div 
      className={`group flex ${isVertical ? 'flex-col items-center text-center' : 'items-center'} gap-2.5 sm:gap-3 select-none ${className}`}
      role="banner"
      aria-label="NihonGo! Logo"
    >
      {/* Precision Vector Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <NihonGoEmblem size={pixelSizes} />
      </div>

      {/* Responsive Typography & Inkan Hanko Seal */}
      {showText && (
        <div className={`flex flex-col leading-none whitespace-nowrap min-w-0 ${isVertical ? 'items-center mt-1' : ''}`}>
          {/* Main Title Row */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span 
              className={`font-black tracking-tight ${titleSizes} ${dark ? 'text-white' : 'text-slate-900'} transition-colors`}
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
            >
              にほんご
              <span className="block mt-1 text-[11px] text-rose-500 font-black tracking-wide">
                学ぼう！
              </span>
            </span>

            {/* Authentic Japanese Red Hanko Seal (印鑑) */}
            {showHanko && (
              <JapaneseHankoSeal text="日本語" />
            )}
          </div>

          {/* Subtitle / JLPT Badge */}
          {showSubtitle && (
            <div className={`flex items-center gap-1.5 mt-1 ${isVertical ? 'justify-center' : ''}`}>
              <span className={`font-semibold tracking-normal ${subtitleSizes} ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                Học tiếng Nhật mỗi ngày
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-rose-500/70" />
              <span className="hidden sm:inline-block text-[10px] font-bold text-amber-400 font-mono">
                N5—N1
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
