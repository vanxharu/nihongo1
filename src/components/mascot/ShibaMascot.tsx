import React from 'react';
import { Mascot, MascotProps, MascotState } from './Mascot';

export type ShibaPose = 
  | 'idle'
  | 'welcome' 
  | 'waving' 
  | 'study' 
  | 'studying' 
  | 'reading'
  | 'walking'
  | 'adventure'
  | 'thinking' 
  | 'speaking' 
  | 'listening' 
  | 'typing' 
  | 'happy' 
  | 'winking' 
  | 'joy'
  | 'celebration' 
  | 'celebrating' 
  | 'mission_complete' 
  | 'level_up' 
  | 'achievement_unlock' 
  | 'streak_reward' 
  | 'correct_answer' 
  | 'wrong_answer' 
  | 'encourage' 
  | 'reminder'
  | 'loading'
  | 'cheering'
  | 'empty_state'
  | 'warning'
  | 'trophy'
  | 'curious';

export interface ShibaMascotProps extends Omit<MascotProps, 'pose' | 'state'> {
  pose?: ShibaPose | MascotState;
  state?: MascotState;
}

/**
 * ShibaMascot Component
 * Powered by the official Nihon Shiba mascot image assets
 */
export default function ShibaMascot({
  pose = 'waving',
  state,
  size = 'md',
  speechBubble,
  speechSub,
  animated = true,
  className = '',
  onClick,
  showBackdrop = false,
  ...rest
}: ShibaMascotProps) {
  return (
    <Mascot
      state={state || (pose as MascotState)}
      size={size}
      speechBubble={speechBubble}
      speechSub={speechSub}
      animated={animated}
      className={className}
      onClick={onClick}
      showBackdrop={showBackdrop}
      {...rest}
    />
  );
}

// Named export
export { ShibaMascot };

/**
 * Reusable Mascot Empty State Component
 */
export interface MascotEmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function MascotEmptyState({
  title,
  description,
  actionText,
  onAction,
  className = ''
}: MascotEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white/70 backdrop-blur-xs border border-[#EADFCF] rounded-2xl shadow-xs ${className}`}>
      <Mascot
        state="thinking"
        size="lg"
        animated={true}
        speechBubble="Chưa có dữ liệu ở đây nè!"
        speechSub="Nihon Shiba đang tìm kiếm cùng bạn 🔍"
      />
      <h4 className="mt-4 text-base sm:text-lg font-black text-[#1F2639]">
        {title}
      </h4>
      {description && (
        <p className="mt-1 max-w-md text-xs sm:text-sm text-[#786D5E]">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-[#1F2639] hover:bg-[#2B354F] text-[#FDF1E2] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

/**
 * Reusable Mascot Achievement / Celebration Card
 */
export interface MascotAchievementCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  onContinue?: () => void;
  continueText?: string;
}

export function MascotAchievementCard({
  title,
  subtitle,
  badge = '🎉 Tuyệt vời!',
  onContinue,
  continueText = 'Tiếp tục hành trình'
}: MascotAchievementCardProps) {
  return (
    <div className="bg-gradient-to-b from-[#FFF9F2] to-[#FFF3E3] border-2 border-[#F4A643]/50 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(244,166,67,0.15),transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <span className="px-3 py-1 bg-[#F4A643] text-[#1F2639] font-black text-xs rounded-full uppercase tracking-wider mb-2">
          {badge}
        </span>
        <Mascot
          state="celebration"
          size="xl"
          animated={true}
          showBackdrop={true}
        />
        <h3 className="text-xl sm:text-2xl font-black text-[#1F2639] mt-3">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#786D5E] mt-1 max-w-sm">
            {subtitle}
          </p>
        )}
        {onContinue && (
          <button
            onClick={onContinue}
            className="mt-5 px-6 py-2.5 bg-[#D82B3A] hover:bg-[#B91C1C] text-white font-black text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {continueText}
          </button>
        )}
      </div>
    </div>
  );
}
