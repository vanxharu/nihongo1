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

/**
 * High-definition vector emblem for NihonGo!
 * Combines:
 * - Authentic Japanese Rising Sun (Hinomaru) vermilion-crimson gradient
 * - Sacred Torii Gateway of Wisdom styled like the wings of an open book
 * - Mount Fuji (富士山) snow-capped peak in the dawn horizon
 * - Golden Sakura Blossom (桜) of JLPT achievement and spring renewal
 */
export function NihonGoEmblem({ 
  className = '',
  size = 40
}: { 
  className?: string;
  size?: number | string;
}) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
      className={`shrink-0 drop-shadow-md select-none transition-transform duration-300 group-hover:scale-105 ${className}`}
      aria-label="NihonGo! Crest Emblem"
    >
      <defs>
        {/* Background Lacquer Slate to Deep Indigo Gradient */}
        <linearGradient id="nhg-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="50%" stopColor="#18182E" />
          <stop offset="100%" stopColor="#0B0F19" />
        </linearGradient>

        {/* Outer Rim Glowing Gradient */}
        <linearGradient id="nhg-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Rising Sun Crimson Vermilion Gradient */}
        <linearGradient id="nhg-sun" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF4365" />
          <stop offset="55%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#9F1239" />
        </linearGradient>

        {/* Auspicious Japanese Gold Gradient */}
        <linearGradient id="nhg-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Mount Fuji Shading Gradient */}
        <linearGradient id="nhg-fuji" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.98" />
        </linearGradient>

        {/* Soft Radial Sun Aura Glow */}
        <radialGradient id="nhg-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF4365" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Emblem Base Squircle with Japanese Lacquer Finish */}
      <rect width="100" height="100" rx="26" fill="url(#nhg-bg)" />
      
      {/* Precision Decorative Gold & Crimson Stroke Rim */}
      <rect 
        x="2.5" 
        y="2.5" 
        width="95" 
        height="95" 
        rx="23.5" 
        fill="none" 
        stroke="url(#nhg-rim)" 
        strokeWidth="1.8" 
        strokeOpacity="0.75" 
      />

      {/* Sun Aura Ambient Glow */}
      <circle cx="50" cy="50" r="42" fill="url(#nhg-aura)" />

      {/* Sacred Japanese Rising Sun (Hinomaru) */}
      <circle cx="50" cy="50" r="33" fill="url(#nhg-sun)" />
      
      {/* Subtle Concentric Auspicious Gold Dashed Ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="33" 
        fill="none" 
        stroke="#FEF08A" 
        strokeWidth="1" 
        strokeDasharray="2.5 2.5" 
        strokeOpacity="0.5" 
      />

      {/* Mount Fuji (富士山) Silhouette at the Horizon */}
      <g id="nhg-mt-fuji">
        {/* Fuji Mountain Base */}
        <path 
          d="M 25 73 L 42 49 L 58 49 L 75 73 Z" 
          fill="url(#nhg-fuji)" 
        />
        {/* Sacred Snow-Capped Peak */}
        <path 
          d="M 42 49 L 45 54 L 48 52 L 50 55 L 52 52 L 55 54 L 58 49 Z" 
          fill="#FFFFFF" 
          opacity="0.95" 
        />
      </g>

      {/* Gateway of Wisdom (Torii Gate & Open Book of Scholarship) */}
      <g id="nhg-torii-gate">
        {/* Upper Kasagi Beam (Arching gracefully like wings of an open book) */}
        <path 
          d="M 16 35.5 C 28 29.5, 42 31.5, 50 33 C 58 31.5, 72 29.5, 84 35.5 C 76 37.5, 62 35.5, 50 37 C 38 35.5, 24 37.5, 16 35.5 Z" 
          fill="#FFFFFF" 
        />

        {/* Kasagi Golden Accent Line */}
        <path 
          d="M 24 33.5 Q 50 31 76 33.5" 
          stroke="url(#nhg-gold)" 
          strokeWidth="1.2" 
          strokeLinecap="round" 
        />

        {/* Second Beam (Shimaki / Nuki lintel) */}
        <path 
          d="M 23 42 L 77 42" 
          stroke="#FFFFFF" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
        />

        {/* Central Signet Tablet (Gakuzuka) with Golden '日' (Sun/Japan) Glyph */}
        <rect 
          x="46.5" 
          y="35" 
          width="7" 
          height="8" 
          rx="1.5" 
          fill="url(#nhg-gold)" 
          stroke="#991B1B" 
          strokeWidth="0.8" 
        />
        <line x1="47.5" y1="39" x2="52.5" y2="39" stroke="#991B1B" strokeWidth="0.8" />

        {/* Main Pillars (Hashira) with classical architectural taper */}
        <path 
          d="M 31 35 L 29 74" 
          stroke="#FFFFFF" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
        <path 
          d="M 69 35 L 71 74" 
          stroke="#FFFFFF" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />

        {/* Stone Pedestals (Kamebara / Daiishi) */}
        <path 
          d="M 25 74 L 33 74" 
          stroke="#FFFFFF" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
        />
        <path 
          d="M 67 74 L 75 74" 
          stroke="#FFFFFF" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
        />
      </g>

      {/* Floating Golden Sakura Blossom of JLPT Achievement (Top-Right) */}
      <g id="nhg-sakura" transform="translate(73, 24) scale(0.85)">
        {/* 5 Petals */}
        <circle cx="0" cy="-6" r="3.2" fill="url(#nhg-gold)" />
        <circle cx="5.7" cy="-1.8" r="3.2" fill="url(#nhg-gold)" />
        <circle cx="3.5" cy="4.8" r="3.2" fill="url(#nhg-gold)" />
        <circle cx="-3.5" cy="4.8" r="3.2" fill="url(#nhg-gold)" />
        <circle cx="-5.7" cy="-1.8" r="3.2" fill="url(#nhg-gold)" />
        {/* Blossom Core */}
        <circle cx="0" cy="0" r="2.2" fill="#E11D48" />
      </g>
    </svg>
  );
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
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-[5px] bg-[#DC2626] border border-red-400/80 shadow-xs select-none ${className}`}
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
              Nihon
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 font-black">
                Go!
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
                Học tiếng Nhật &amp; Luyện thi JLPT
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
