import React from 'react';
import ShibaMascot from './mascot/ShibaMascot';
import { BRAND_NAME } from '../constants/brand';

interface JpStudyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showSubtitle?: boolean;
  showVersion?: boolean;
  dark?: boolean;
  className?: string;
  useMascot?: boolean;
}

export default function JpStudyLogo({
  size = 'md',
  showText = true,
  showSubtitle = false,
  showVersion = false,
  dark = false,
  className = '',
  useMascot = true
}: JpStudyLogoProps) {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }[size];

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  }[size];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Mascot Badge */}
      {useMascot ? (
        <div className={`relative ${iconDimensions} rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-400 to-rose-600 p-[1.5px] shadow-[0_0_12px_rgba(244,63,94,0.35)] shrink-0 transition-all hover:scale-105 duration-300 flex items-center justify-center`}>
          <div className="w-full h-full rounded-[14px] bg-[#1B223C] flex items-center justify-center overflow-hidden p-0.5">
            <ShibaMascot 
              pose="waving" 
              size={size === 'sm' ? 26 : size === 'md' ? 34 : 44} 
              animated={false} 
            />
          </div>
        </div>
      ) : (
        <div className={`relative ${iconDimensions} rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-400 to-amber-500 p-[1.5px] shadow-[0_0_12px_rgba(244,63,94,0.35)] shrink-0 transition-all hover:scale-105 duration-300`}>
          <img 
            src="/icon.svg" 
            alt={`${BRAND_NAME} Logo`} 
            className="w-full h-full rounded-[14px] object-cover bg-[#0F172A]"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Brand Text: NihonGo! */}
      {showText && (
        <div className={`flex items-center leading-tight whitespace-nowrap min-w-0 ${size === 'sm' ? 'hidden sm:flex' : ''}`}>
          <span className={`font-black tracking-tight whitespace-nowrap ${titleSizes} ${dark ? 'text-white' : 'text-slate-900'}`}>
            Nihon<span className="text-rose-500">Go!</span>
          </span>
        </div>
      )}
    </div>
  );
}

