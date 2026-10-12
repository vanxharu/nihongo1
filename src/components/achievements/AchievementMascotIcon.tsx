import React from 'react';

export type AchievementCharacter = string;

interface MascotIconProps {
  type?: AchievementCharacter;
  isUnlocked: boolean;
  size?: number;
  className?: string;
  poseIndex?: number;
  badgeNumber?: number;
  tier?: number;
  metric?: string;
  rank?: number;
  threshold?: number;
}

// Ten rank palettes: [ring light, ring dark, face]
const PALETTES: [string, string, string][] = [
  ['#c9e7d4', '#6fb592', '#eaf7ef'], ['#cfe3f6', '#6a9fd1', '#eef6fd'], ['#e0d4f7', '#9479d6', '#f4eefd'],
  ['#fbd9c9', '#e0916c', '#fef1ea'], ['#fbe7a6', '#d9a621', '#fff8dc'], ['#f9c6d8', '#d9628f', '#fdeaf1'],
  ['#bfeaf0', '#2fa4b8', '#e6f8fb'], ['#d6e2a8', '#7b9a2a', '#f1f6dc'], ['#f6b7b0', '#cf4a3d', '#fde7e4'],
  ['#ffe27a', '#e08a00', '#fff6cf'],
];
const INK = '#2b3350';

// Frame outlines (viewBox 100): circle, squircle, hexagon, shield, octagon
const FRAMES = [
  'M50 4a46 46 0 1 0 .01 0Z',
  'M30 4h40a26 26 0 0 1 26 26v40a26 26 0 0 1-26 26H30A26 26 0 0 1 4 70V30A26 26 0 0 1 30 4Z',
  'M50 3 91 26v48L50 97 9 74V26Z',
  'M50 3c14 8 29 10 42 10v34c0 25-18 41-42 50C26 88 8 72 8 47V13c13 0 28-2 42-10Z',
  'M32 4h36l28 28v36L68 96H32L4 68V32Z',
];

// Centerpiece glyph per achievement track, drawn in a 0..100 box.
function Glyph({ metric }: { metric: string }) {
  const sw = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  switch (metric) {
    case 'days': // paw print
      return <g {...sw} fill="#f4a259"><ellipse cx="34" cy="38" rx="6" ry="8" /><ellipse cx="46" cy="30" rx="6" ry="8" /><ellipse cx="58" cy="30" rx="6" ry="8" /><ellipse cx="70" cy="38" rx="6" ry="8" /><path d="M52 46c11 0 20 10 20 18 0 7-6 9-12 8-5-1-6-2-8-2s-3 1-8 2c-6 1-12-1-12-8 0-8 9-18 20-18Z" /></g>;
    case 'streak': // flame
      return <g {...sw}><path d="M52 14c3 14 20 22 20 42 0 14-9 25-22 25S28 70 28 57c0-9 5-14 9-19 1 7 4 9 7 10-2-13 2-26 8-34Z" fill="#ff8a3d" /><path d="M50 82c-7 0-12-5-12-12 0-8 8-12 12-22 5 8 12 12 12 22 0 7-5 12-12 12Z" fill="#ffd45e" /></g>;
    case 'vocab': // open book with あ
      return <g {...sw}><path d="M50 30c-9-6-22-7-32-4v46c10-3 23-2 32 4 9-6 22-7 32-4V26c-10-3-23-2-32 4Z" fill="#fff" /><path d="M50 30v46" fill="none" /><text x="33" y="62" fontSize="26" fontWeight="800" fill={INK} stroke="none" textAnchor="middle" fontFamily="'Noto Sans JP',sans-serif">あ</text><text x="67" y="62" fontSize="22" fontWeight="800" fill="#e0627f" stroke="none" textAnchor="middle" fontFamily="sans-serif">A</text></g>;
    case 'kanji': // hanko seal with 字 and brush stroke
      return <g {...sw}><rect x="22" y="20" width="56" height="56" rx="10" fill="#e5484d" /><text x="50" y="62" fontSize="42" fontWeight="900" fill="#fff" stroke="none" textAnchor="middle" fontFamily="'Noto Serif JP','Noto Sans JP',serif">字</text><path d="M16 86c20-6 48-6 68 0" fill="none" stroke="#2b3350" strokeWidth="5" /></g>;
    case 'grammar': // puzzle pieces
      return <g {...sw}><path d="M22 30h22c-4-12 14-12 10 0h22v20c-12-4-12 14 0 10v20H22Z" fill="#7aa7ff" /><path d="M54 50h10c-3-9 12-9 8 0" fill="none" strokeWidth="0" /><circle cx="42" cy="62" r="7" fill="#ffd45e" /></g>;
    case 'tests': // exam paper + pencil
      return <g {...sw}><rect x="24" y="16" width="44" height="64" rx="6" fill="#fff" /><path d="M32 34h28M32 46h28M32 58h18" fill="none" /><path d="M64 70l16-30 8 4-16 30-10 4Z" fill="#ffd45e" /></g>;
    case 'perfect': // star with check
      return <g {...sw}><path d="M50 12l11 24 26 3-19 18 5 26-23-13-23 13 5-26-19-18 26-3Z" fill="#ffd45e" /><path d="M38 52l9 9 17-19" fill="none" stroke="#1f9d6b" strokeWidth="6" /></g>;
    case 'roadmap': // flag on mountain
      return <g {...sw}><path d="M14 80 40 42l14 20 10-12 22 30Z" fill="#8ec3a7" /><path d="M42 42V14" fill="none" strokeWidth="4" /><path d="M42 14l26 7-26 9Z" fill="#e5484d" /></g>;
    case 'notebook': // notebook with bookmark
      return <g {...sw}><rect x="24" y="14" width="52" height="70" rx="7" fill="#9bb7f0" /><path d="M24 30h-6M24 46h-6M24 62h-6" fill="none" /><rect x="34" y="24" width="34" height="46" rx="3" fill="#fff" /><path d="M58 14v28l6-5 6 5V14" fill="#e5484d" /></g>;
    case 'xp': // crown
      return <g {...sw}><path d="M18 72 12 34l22 18 16-28 16 28 22-18-6 38Z" fill="#ffd45e" /><path d="M18 72h64v10H18Z" fill="#f4a259" /><circle cx="12" cy="34" r="4" fill="#e5484d" /><circle cx="50" cy="24" r="4" fill="#e5484d" /><circle cx="88" cy="34" r="4" fill="#e5484d" /></g>;
    default:
      return <circle cx="50" cy="50" r="22" fill="#ffd45e" {...sw} />;
  }
}

function fmt(n: number) {
  if (n >= 1000000) return `${n / 1000000}M`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

export const AchievementMascotIcon: React.FC<MascotIconProps> = ({
  isUnlocked, size = 64, className = '', badgeNumber, tier = 0, metric = 'days', rank, threshold,
}) => {
  const r = Math.max(0, Math.min(9, rank ?? tier));
  const [light, dark, face] = PALETTES[r];
  const frame = FRAMES[r % 5];
  const gid = `bg-${metric}-${r}`;
  // rank pips along the top: rank+1 small dots
  const pips = Array.from({ length: r + 1 }, (_, i) => {
    const total = r + 1;
    const x = 50 + (i - (total - 1) / 2) * Math.min(7, 40 / total);
    return <circle key={i} cx={x} cy="9" r="2.2" fill={dark} stroke="#fff" strokeWidth="0.8" />;
  });
  return (
    <div className={`badge-emblem relative inline-flex items-center justify-center select-none ${isUnlocked ? '' : 'badge-locked'} ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`Huy hiệu ${badgeNumber ?? ''}`} className="badge-illustration" style={{ filter: isUnlocked ? 'none' : 'grayscale(.85) opacity(.6)', display: 'block' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={light} /><stop offset="1" stopColor={dark} /></linearGradient>
        </defs>
        <path d={frame} fill={`url(#${gid})`} />
        <g transform="translate(9 9) scale(.82)"><path d={frame} fill={face} stroke="#fff" strokeWidth="2" /></g>
        <g transform="translate(18 14) scale(.64)"><Glyph metric={metric} /></g>
        {pips}
        {threshold !== undefined && (
          <g>
            <rect x="26" y="74" width="48" height="16" rx="8" fill={dark} stroke="#fff" strokeWidth="1.5" />
            <text x="50" y="86" textAnchor="middle" fontSize="11" fontWeight="900" fill="#fff" fontFamily="sans-serif">{threshold === 0 ? 'START' : fmt(threshold)}</text>
          </g>
        )}
      </svg>
      {badgeNumber !== undefined && <span style={{ position: 'absolute', top: -2, right: -2, background: dark, color: '#fff', borderRadius: 6, padding: '1px 4px', fontWeight: 900, fontSize: Math.max(8, size * 0.12), border: '2px solid var(--ui-surface)' }}>{String(badgeNumber).padStart(3, '0')}</span>}
    </div>
  );
};
