import React from 'react';

interface ShibaStudyMascotProps {
  size?: number;
  className?: string;
}

export const ShibaStudyMascot: React.FC<ShibaStudyMascotProps> = ({ size = 60, className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shibaFur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="shibaShirt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Shiba Ears */}
        {/* Left Ear */}
        <polygon points="22,12 36,36 14,34" fill="url(#shibaFur)" stroke="#78350F" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="23,16 33,33 18,32" fill="#FDE68A" />
        
        {/* Right Ear */}
        <polygon points="78,12 64,36 86,34" fill="url(#shibaFur)" stroke="#78350F" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="77,16 67,33 82,32" fill="#FDE68A" />

        {/* Head */}
        <circle cx="50" cy="42" r="28" fill="url(#shibaFur)" stroke="#78350F" strokeWidth="2" />

        {/* White Muzzle & Cheeks */}
        <ellipse cx="50" cy="48" rx="20" ry="16" fill="#FFFBEB" />
        <ellipse cx="36" cy="48" rx="10" ry="10" fill="#FFFBEB" />
        <ellipse cx="64" cy="48" rx="10" ry="10" fill="#FFFBEB" />

        {/* Eyebrow dots */}
        <ellipse cx="38" cy="30" rx="3.5" ry="2.5" fill="#FFFBEB" />
        <ellipse cx="62" cy="30" rx="3.5" ry="2.5" fill="#FFFBEB" />

        {/* Eyes */}
        <circle cx="39" cy="38" r="3.5" fill="#1E1B4B" />
        <circle cx="40.5" cy="36.5" r="1.2" fill="#FFFFFF" />
        <circle cx="61" cy="38" r="3.5" fill="#1E1B4B" />
        <circle cx="62.5" cy="36.5" r="1.2" fill="#FFFFFF" />

        {/* Nose */}
        <path d="M 47 44 Q 50 42 53 44 Q 50 48 47 44 Z" fill="#1E1B4B" />

        {/* Happy Shiba Mouth */}
        <path d="M 46 48 Q 50 51 54 48" stroke="#1E1B4B" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Rosy Cheeks */}
        <ellipse cx="30" cy="44" rx="4" ry="2.5" fill="#FCA5A5" fillOpacity="0.8" />
        <ellipse cx="70" cy="44" rx="4" ry="2.5" fill="#FCA5A5" fillOpacity="0.8" />

        {/* Study Hat (Black Scholar Hat with gold tassel) */}
        <path d="M 32 20 L 50 12 L 68 20 L 50 26 Z" fill="#1E1B4B" stroke="#0F172A" strokeWidth="1" />
        <rect x="42" y="21" width="16" height="6" rx="2" fill="#312E81" />
        <circle cx="50" cy="19" r="2" fill="#F59E0B" />
        <path d="M 50 19 Q 58 20 62 26" stroke="#F59E0B" strokeWidth="1.5" fill="none" />

        {/* Body & Blue Shirt */}
        <path d="M 28 66 Q 50 62 72 66 L 76 96 L 24 96 Z" fill="url(#shibaShirt)" stroke="#0369A1" strokeWidth="2" />
        
        {/* Collar */}
        <path d="M 42 64 L 50 74 L 58 64" fill="#FFFFFF" />
        <polygon points="48,72 52,72 53,84 50,86 47,84" fill="#EF4444" />

        {/* JLPT text badge on chest */}
        <rect x="36" y="77" width="28" height="10" rx="3" fill="#1E293B" />
        <text x="50" y="85" fontSize="6.5" fontWeight="bold" fill="#F8FAFC" textAnchor="middle" fontFamily="monospace">
          JLPT
        </text>

        {/* Paws holding Flashcard "あ a" */}
        {/* Little White flashcard */}
        <g transform="translate(68, 54) rotate(12)">
          <rect x="0" y="0" width="18" height="24" rx="3" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
          <text x="9" y="11" fontSize="9" fontWeight="bold" fill="#0369A1" textAnchor="middle" fontFamily="sans-serif">
            あ
          </text>
          <text x="9" y="19" fontSize="6.5" fontWeight="bold" fill="#64748B" textAnchor="middle" fontFamily="sans-serif">
            a
          </text>
        </g>

        {/* Left Paw */}
        <circle cx="28" cy="74" r="5.5" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
        {/* Right Paw holding card */}
        <circle cx="70" cy="70" r="5.5" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

export default ShibaStudyMascot;
