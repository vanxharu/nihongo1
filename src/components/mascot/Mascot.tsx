import React, { useState } from 'react';

export type MascotState = 
  | 'default'
  | 'learning'
  | 'studying'
  | 'thinking'
  | 'curious'
  | 'success'
  | 'celebration'
  | 'celebrating'
  | 'achievement'
  | 'level-up'
  | 'listening'
  | 'reading'
  | 'walking'
  | 'flag'
  | 'encourage'
  | 'winking'
  | 'joy'
  | 'empty'
  | 'empty_state'
  | 'warning'
  | 'welcome'
  | 'waving'
  | 'idle';

export interface MascotProps {
  id?: string;
  state?: MascotState;
  /** Backward compatibility with legacy pose prop */
  pose?: MascotState | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | number;
  speechBubble?: string;
  speechSub?: string;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
  showBackdrop?: boolean;
  showUploadOption?: boolean;
  alt?: string;
}

// Map any state/pose to the corresponding official Nihon Shiba asset
export function getMascotAssetUrl(stateOrPose: MascotState | string = 'default'): string {
  const norm = String(stateOrPose).toLowerCase().replace(/[-_]/g, '');

  if (norm.includes('study') || norm.includes('learning')) {
    return '/mascot/shiba_studying.png';
  }
  if (norm.includes('think') || norm.includes('curious')) {
    return '/mascot/shiba_thinking.png';
  }
  if (norm.includes('celebrat') || norm.includes('success') || norm.includes('cheer') || norm.includes('levelup') || norm.includes('achievement') || norm.includes('missioncomplete') || norm.includes('streakreward') || norm.includes('correct')) {
    return '/mascot/shiba_cheering.png';
  }
  if (norm.includes('listen')) {
    return '/mascot/shiba_listening.png';
  }
  if (norm.includes('read')) {
    return '/mascot/shiba_reading.png';
  }
  if (norm.includes('walk') || norm.includes('adventure')) {
    return '/mascot/shiba_walking.png';
  }
  if (norm.includes('flag') || norm.includes('encourage') || norm.includes('warning') || norm.includes('reminder') || norm.includes('wrong')) {
    return '/mascot/shiba_flag.png';
  }
  if (norm.includes('wink') || norm.includes('joy') || norm.includes('happy')) {
    return '/mascot/shiba_winking.png';
  }
  if (norm.includes('empty')) {
    return '/mascot/shiba_thinking.png';
  }

  // Default original mascot asset
  return '/mascot/mascot.png';
}

export const Mascot: React.FC<MascotProps> = ({
  id,
  state,
  pose,
  size = 'md',
  speechBubble,
  speechSub,
  animated = true,
  className = '',
  onClick,
  showBackdrop = false,
  showUploadOption = false,
  alt = 'Nihon Shiba Mascot'
}) => {
  const activeState = (state || pose || 'default') as MascotState;
  const primaryUrl = getMascotAssetUrl(activeState);
  
  const [imgSrc, setImgSrc] = useState<string>(primaryUrl);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Dimension mapping
  const pxSize = typeof size === 'number' 
    ? size 
    : {
        xs: 40,
        sm: 56,
        md: 80,
        lg: 120,
        xl: 160,
        hero: 220
      }[size] || 80;

  // Sync image source if activeState changes
  React.useEffect(() => {
    setImgSrc(getMascotAssetUrl(activeState));
    setHasError(false);
  }, [activeState]);

  const handleImageError = () => {
    if (imgSrc !== '/mascot/mascot.svg') {
      setImgSrc('/mascot/mascot.svg');
    } else {
      setHasError(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/mascot/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, filename: 'custom_mascot.png' })
        });
        if (res.ok) {
          setImgSrc(`/mascot/mascot.png?t=${Date.now()}`);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload mascot file:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      id={id || `mascot-${String(activeState).toLowerCase()}`}
      className={`relative inline-flex flex-col items-center select-none group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Speech Bubble */}
      {speechBubble && (
        <div 
          className={`mb-2.5 px-3 py-2 bg-white text-[#1F2639] rounded-2xl shadow-md border border-[#E89A3C]/30 text-center max-w-xs transition-all duration-300 relative z-20 ${
            animated ? 'animate-bounce-subtle' : ''
          }`}
        >
          <div className="text-xs sm:text-sm font-black tracking-tight leading-tight flex items-center justify-center gap-1.5">
            <span>{speechBubble}</span>
          </div>
          {speechSub && (
            <p className="text-[10px] text-[#786D5E] mt-0.5 font-medium leading-snug">
              {speechSub}
            </p>
          )}
          {/* Speech Bubble Pointer Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#E89A3C]/30 rotate-45" />
        </div>
      )}

      {/* Main Mascot Visual Container */}
      <div 
        onClick={onClick}
        className={`relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          onClick ? 'hover:scale-105 active:scale-95' : ''
        }`}
        style={{ width: pxSize, height: pxSize }}
      >
        {/* Decorative Backdrop */}
        {showBackdrop && (
          <div className="absolute inset-0 -m-4 pointer-events-none flex items-center justify-center z-0">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#F39C36]/20 via-[#FFF4E6]/40 to-transparent blur-md" />
          </div>
        )}

        {/* The Official Nihon Shiba Mascot Image Asset */}
        <div className={`relative z-10 w-full h-full flex items-center justify-center ${
          animated ? 'hover:rotate-2 transition-transform' : ''
        }`}>
          {!hasError ? (
            <img
              src={imgSrc}
              alt={alt}
              className={`w-full h-full object-contain drop-shadow-md transition-all duration-300 ${
                animated ? 'animate-float-gentle' : ''
              }`}
              onError={handleImageError}
              referrerPolicy="no-referrer"
            />
          ) : (
            <img
              src="/image.png"
              alt={alt}
              className="w-full h-full object-contain drop-shadow-md"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Optional Upload / Sync Helper */}
        {showUploadOption && (
          <label 
            title="Đổi ảnh mascot (image.png)"
            className={`absolute -bottom-2 -right-2 z-30 p-1.5 bg-[#D82B3A] text-white rounded-full shadow-md cursor-pointer hover:bg-[#B91C1C] transition-opacity ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
              disabled={isUploading}
            />
            <span className="text-[10px] font-bold block px-1">
              {isUploading ? '...' : '📷'}
            </span>
          </label>
        )}
      </div>
    </div>
  );
};

export default Mascot;
