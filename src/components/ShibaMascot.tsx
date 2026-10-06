import React from 'react';

type MascotState = 'idle' | 'correct' | 'wrong' | 'surrender' | 'thinking';

interface Props {
  state: MascotState;
  size?: number;
}

export default function ShibaMascot({ state, size = 120 }: Props) {
  const mouth = {
    idle:      <path d="M52 85 Q60 92 68 85" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />,
    correct:   <path d="M50 83 Q60 95 70 83" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
    wrong:     <path d="M52 90 Q60 83 68 90" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />,
    surrender: <path d="M53 87 Q60 91 67 87" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />,
    thinking:  <path d="M52 86 Q60 91 68 86" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />,
  }[state];

  const eyes = state === 'wrong'
    ? <>
        {/* sad tilted ovals */}
        <ellipse cx="47" cy="74" rx="7" ry="5.5" fill="#111" transform="rotate(10,47,74)" />
        <ellipse cx="73" cy="74" rx="7" ry="5.5" fill="#111" transform="rotate(-10,73,74)" />
        <circle cx="50" cy="71" r="2" fill="white" />
        <circle cx="76" cy="71" r="2" fill="white" />
        {/* teardrops */}
        <path d="M44 80 Q42 87 46 87 Q50 87 48 80 Z" fill="#A8D8F0" opacity="0.85" />
        <path d="M70 80 Q68 87 72 87 Q76 87 74 80 Z" fill="#A8D8F0" opacity="0.85" />
      </>
    : state === 'surrender'
    ? <>
        {/* normal left, closed right */}
        <circle cx="47" cy="74" r="7.5" fill="#111" />
        <circle cx="50" cy="71" r="2.5" fill="white" />
        {/* closed eye — arc */}
        <path d="M66 74 Q73 68 80 74" stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    : <>
        <circle cx="47" cy="74" r="7.5" fill="#111" />
        <circle cx="73" cy="74" r="7.5" fill="#111" />
        <circle cx="50" cy="71" r="2.5" fill="white" />
        <circle cx="76" cy="71" r="2.5" fill="white" />
      </>;

  return (
    <div style={{ width: size, height: size * (160 / 120) }}>
      <svg viewBox="0 0 120 160" width={size} height={size * (160 / 120)} xmlns="http://www.w3.org/2000/svg">

        {/* ── Body / Kimono ── */}
        <rect x="28" y="108" width="64" height="52" rx="12" fill="#1E2D5A" />
        {/* obi (belt) */}
        <rect x="28" y="128" width="64" height="12" rx="4" fill="#C0392B" />
        {/* obi knot */}
        <ellipse cx="60" cy="134" rx="8" ry="5" fill="#E74C3C" />
        {/* white collar */}
        <path d="M44 108 L60 120 L76 108" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* sakura on chest */}
        {[0,72,144,216,288].map((deg, i) => (
          <ellipse key={i} cx={60 + 5 * Math.cos(deg * Math.PI / 180)} cy={115 + 5 * Math.sin(deg * Math.PI / 180)}
            rx="3.5" ry="2.2" fill="#F9A8D4" opacity="0.9"
            transform={`rotate(${deg},${60 + 5 * Math.cos(deg * Math.PI / 180)},${115 + 5 * Math.sin(deg * Math.PI / 180)})`} />
        ))}
        <circle cx="60" cy="115" r="2" fill="#F472B6" />

        {/* ── Arms ── */}
        {state === 'correct' ? <>
          {/* arms up */}
          <ellipse cx="22" cy="100" rx="9" ry="6" fill="#E8A45A" transform="rotate(-50,22,100)" />
          <ellipse cx="98" cy="100" rx="9" ry="6" fill="#E8A45A" transform="rotate(50,98,100)" />
        </> : state === 'thinking' ? <>
          {/* left arm normal */}
          <ellipse cx="24" cy="118" rx="9" ry="6" fill="#E8A45A" transform="rotate(10,24,118)" />
          {/* right arm raised to chin */}
          <ellipse cx="93" cy="108" rx="9" ry="6" fill="#E8A45A" transform="rotate(-30,93,108)" />
          <circle cx="86" cy="102" r="5" fill="#E8A45A" />
        </> : <>
          <ellipse cx="24" cy="118" rx="9" ry="6" fill="#E8A45A" transform="rotate(10,24,118)" />
          <ellipse cx="96" cy="118" rx="9" ry="6" fill="#E8A45A" transform="rotate(-10,96,118)" />
        </>}

        {/* ── Head ── */}
        <circle cx="60" cy="62" r="40" fill="#E8A45A" />
        {/* inner face cream area */}
        <ellipse cx="60" cy="70" rx="27" ry="24" fill="#FFF5E6" />

        {/* ── Ears ── */}
        {/* left ear */}
        <polygon points="25,38 18,12 42,30" fill="#E8A45A" />
        <polygon points="27,36 22,18 39,30" fill="#F4A8B5" />
        {/* right ear */}
        <polygon points="95,38 102,12 78,30" fill="#E8A45A" />
        <polygon points="93,36 98,18 81,30" fill="#F4A8B5" />

        {/* ── Headband ── */}
        <rect x="24" y="42" width="72" height="12" rx="6" fill="white" opacity="0.95" />
        {/* red circle with 日●語 */}
        <circle cx="60" cy="48" r="6" fill="#C0392B" />
        <text x="60" y="51.5" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">語</text>
        <text x="37" y="51.5" textAnchor="middle" fontSize="6" fill="#C0392B" fontWeight="bold">日</text>
        <text x="83" y="51.5" textAnchor="middle" fontSize="6" fill="#C0392B" fontWeight="bold">語</text>

        {/* ── Eyes ── */}
        {eyes}

        {/* ── Cheek blushes ── */}
        <circle cx="37" cy="82" r="7" fill="#F4A8B5" opacity="0.45" />
        <circle cx="83" cy="82" r="7" fill="#F4A8B5" opacity="0.45" />

        {/* ── Nose ── */}
        <ellipse cx="60" cy="80" rx="4" ry="2.5" fill="#2C1A0E" />

        {/* ── Mouth ── */}
        {mouth}

        {/* ── State overlays ── */}

        {state === 'correct' && <>
          {/* sparkle stars */}
          {[[-22,-18],[22,-22],[-28,-5],[28,-3],[0,-32]].map(([dx,dy],i) => (
            <text key={i} x={60+dx} y={62+dy} textAnchor="middle" fontSize="14" fill="#F6C90E">✦</text>
          ))}
        </>}

        {state === 'surrender' && <>
          {/* sweat drop */}
          <path d="M94 28 Q98 20 102 28 Q102 34 98 34 Q94 34 94 28 Z" fill="#A8D8F0" opacity="0.9" />
        </>}

        {state === 'thinking' && <>
          {/* question mark */}
          <text x="82" y="28" textAnchor="middle" fontSize="22" fill="#4A90D9" fontWeight="bold">?</text>
        </>}

      </svg>
    </div>
  );
}
