import React from 'react';
import ShibaMascot, { ShibaPose } from '../mascot/ShibaMascot';

interface JlptMascotProps {
  size?: number;
  className?: string;
  showText?: boolean;
  pose?: ShibaPose;
}

export const JlptMascot: React.FC<JlptMascotProps> = ({ 
  size = 64, 
  className = '', 
  showText = false,
  pose = 'studying'
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <ShibaMascot
        pose={pose}
        size={size}
        animated={false}
        speechBubble={showText ? 'Cùng học ngữ pháp nhé! 🌸' : undefined}
      />
    </div>
  );
};

export default JlptMascot;
