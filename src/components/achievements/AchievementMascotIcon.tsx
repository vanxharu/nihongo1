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

// Real mascot poses in /mascot/shiba-journey-atlas.webp (5 cols x 4 rows):
// 0 book+wave 1 writing 2 headphones 3 reading 4 thinking 5 cheer 6 thumbs-up 7 question 8 trophy 9 flag
// 10 calligraphy 11 cards 12 puzzle 13 running 14 crown 15 hooray 16 sleepy 17 sakura 18 Fuji explorer 19 zen
// Ten poses per achievement track, ordered by rank: the mascot's gesture changes as the goal gets harder.
const TRACK_POSES: Record<string, number[]> = {
  days: [16, 0, 4, 6, 17, 13, 18, 5, 8, 14],
  streak: [4, 13, 6, 15, 5, 18, 19, 8, 9, 14],
  vocab: [0, 3, 2, 11, 1, 6, 5, 17, 8, 14],
  kanji: [4, 1, 3, 10, 6, 11, 5, 8, 19, 14],
  grammar: [7, 4, 3, 12, 1, 11, 6, 5, 8, 14],
  tests: [7, 1, 11, 3, 4, 6, 13, 5, 8, 14],
  perfect: [4, 7, 6, 5, 15, 13, 17, 18, 8, 14],
  roadmap: [13, 9, 18, 17, 6, 5, 15, 19, 8, 14],
  notebook: [1, 0, 3, 11, 4, 2, 6, 19, 8, 14],
  xp: [0, 6, 5, 15, 13, 18, 17, 8, 19, 14],
};
const TRACK_TINT: Record<string, string> = {
  days: '#ffe3c2', streak: '#ffd2b0', vocab: '#d9e8ff', kanji: '#ffd9dc', grammar: '#dfe0ff',
  tests: '#d6f1e4', perfect: '#fff0b8', roadmap: '#d6efff', notebook: '#e6dcff', xp: '#ffeaa8',
};

function fmt(n: number) {
  if (n >= 1000000) return `${n / 1000000}M`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

export const AchievementMascotIcon: React.FC<MascotIconProps> = ({
  isUnlocked, size = 64, className = '', badgeNumber, tier = 0, metric = 'days', rank, threshold,
}) => {
  const r = Math.max(0, Math.min(9, rank ?? tier));
  const [light, dark] = PALETTES[r];
  const frame = FRAMES[r % 5];
  const pose = (TRACK_POSES[metric] || TRACK_POSES.days)[r];
  const col = pose % 5, row = Math.floor(pose / 5);
  const CW = 1402 / 5, CH = 1122 / 4, pad = 6;
  const uid = `${metric}-${r}`;
  const tint = TRACK_TINT[metric] || '#fff';
  const stars = r >= 3 ? Math.min(5, r - 1) : 0;
  const starEls = Array.from({ length: stars }, (_, i) => {
    const a = Math.PI * (1.15 + (0.7 * i) / Math.max(1, stars - 1 || 1));
    const x = 50 + 44 * Math.cos(stars === 1 ? Math.PI * 1.5 : a), y = 54 + 44 * Math.sin(stars === 1 ? Math.PI * 1.5 : a);
    return <path key={i} transform={`translate(${x} ${y}) scale(.34)`} d="M0-9l2.6 6 6.4.6-4.9 4.2 1.5 6.3L0 4.7-5.6 8l1.5-6.3-4.9-4.2 6.4-.6Z" fill="#ffd45e" stroke="#b9770e" strokeWidth="1.4" />;
  });
  const sparkles = r >= 1 ? [[16, 28], [84, 24], [90, 52], [10, 52], [78, 12]].slice(0, Math.min(5, r + 1)).map(([x, y], i) => (
    <path key={i} transform={`translate(${x} ${y}) scale(${0.5 + (i % 2) * 0.25})`} d="M0-7C1 -2 2-1 7 0 2 1 1 2 0 7-1 2-2 1-7 0-2-1-1-2 0-7Z" fill="#fff" stroke={dark} strokeWidth="1" />
  )) : null;
  return (
    <div className={`badge-emblem relative inline-flex items-center justify-center select-none ${isUnlocked ? '' : 'badge-locked'} ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`Huy hiệu ${badgeNumber ?? ''}`} className="badge-illustration" style={{ filter: isUnlocked ? 'none' : 'grayscale(.9) opacity(.55)', display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={light} /><stop offset="1" stopColor={dark} /></linearGradient>
          <radialGradient id={`b-${uid}`} cx=".5" cy=".4" r=".7"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor={tint} /></radialGradient>
          <clipPath id={`c-${uid}`}><path d={frame} transform="translate(7 7) scale(.86)" /></clipPath>
        </defs>
        {r >= 8 && <g opacity=".5" stroke={dark} strokeWidth="2">{Array.from({ length: 12 }, (_, i) => <line key={i} x1="50" y1="50" x2={50 + 62 * Math.cos((i * Math.PI) / 6)} y2={50 + 62 * Math.sin((i * Math.PI) / 6)} />)}</g>}
        <path d={frame} fill={`url(#g-${uid})`} />
        <path d={frame} transform="translate(7 7) scale(.86)" fill={`url(#b-${uid})`} />
        <g clipPath={`url(#c-${uid})`}>
          <g opacity=".22" transform="translate(52 6) scale(.5)"><Glyph metric={metric} /></g>
          <svg x="12" y="6" width="76" height="76" viewBox={`${col * CW + pad} ${row * CH + pad} ${CW - 2 * pad} ${CH - 2 * pad}`} preserveAspectRatio="xMidYMid meet">
            <image href="/mascot/shiba-journey-atlas.webp" width="1402" height="1122" />
          </svg>
        </g>
        <path d={frame} transform="translate(7 7) scale(.86)" fill="none" stroke="#fff" strokeWidth="1.6" />
        {r >= 6 && <g fill="none" stroke={dark} strokeWidth="2.6" strokeLinecap="round"><path d="M14 70c-8-10-8-26-2-38" /><path d="M86 70c8-10 8-26 2-38" /></g>}
        {starEls}
        {sparkles}
        <g transform="translate(5 56)"><circle cx="15" cy="15" r="15" fill="#fff" stroke={dark} strokeWidth="2" /><g transform="translate(3 3) scale(.24)"><Glyph metric={metric} /></g></g>
        {threshold !== undefined && (
          <g>
            <rect x="28" y="80" width="44" height="16" rx="8" fill={dark} stroke="#fff" strokeWidth="1.5" />
            <text x="50" y="92" textAnchor="middle" fontSize="11" fontWeight="900" fill="#fff" fontFamily="sans-serif">{threshold === 0 ? 'START' : fmt(threshold)}</text>
          </g>
        )}
      </svg>
      {badgeNumber !== undefined && <span style={{ position: 'absolute', top: -2, right: -2, background: dark, color: '#fff', borderRadius: 6, padding: '1px 4px', fontWeight: 900, fontSize: Math.max(8, size * 0.12), border: '2px solid var(--ui-surface)' }}>{String(badgeNumber).padStart(3, '0')}</span>}
    </div>
  );
};
