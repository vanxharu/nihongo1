import React from 'react';

export type AchievementCharacter = 
  | 'shiba-welcome'
  | 'shiba-regular'
  | 'daruma-early'
  | 'owl-night'
  | 'shiba-start'
  | 'shiba-study'
  | 'shiba-jump'
  | 'shiba-return'
  | 'shiba-five'
  | 'shiba-quiz'
  | 'shiba-cards'
  | 'daruma-steady'
  | 'daruma-gold'
  | 'shiba-master'
  | 'shiba-crown'
  | 'shiba-trophy'
  | 'shiba-fire'
  | 'shiba-diamond'
  | 'shiba-kanji'
  | 'shiba-grammar'
  | 'shiba-listening'
  | 'shiba-reading'
  | 'shiba-exam'
  | 'shiba-notebook'
  | 'shiba-speed'
  | 'shiba-sakura'
  | 'maneki-neko'
  | 'samurai-shiba'
  | 'ninja-shiba'
  | 'fuji-explorer';

interface MascotIconProps {
  type: AchievementCharacter;
  isUnlocked: boolean;
  size?: number;
  className?: string;
}

export const AchievementMascotIcon: React.FC<MascotIconProps> = ({
  type,
  isUnlocked,
  size = 64,
  className = ''
}) => {
  const filterClass = isUnlocked ? '' : 'grayscale opacity-35 contrast-125';

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${filterClass} ${className}`}
      style={{ width: size, height: size }}
    >
      <img src="/brand/nihon-shiba-2026-corrected.png" alt={`Nihon Shiba · ${type}`} width={size} height={size} className="h-full w-full object-contain drop-shadow" />
    </div>
  );
};

