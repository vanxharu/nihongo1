import React from 'react';

type MascotState = 'idle' | 'correct' | 'wrong' | 'surrender' | 'thinking';

interface Props {
  state: MascotState;
  size?: number;
}

export default function ShibaMascot({ state, size = 120 }: Props) {
  const w = 120, h = 150;
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isSurrender = state === 'surrender';

  // Eye configs
  const eyeL = { cx: 44, cy: 68 };
  const eyeR = { cx: 76, cy: 68 };

  function Eyes() {
    if (isWrong) return (
      <g>
        {/* sad tilted closed eyes */}
        <ellipse cx={eyeL.cx} cy={eyeL.cy} rx="8" ry="5" fill="#1a1a1a" transform={`rotate(15,${eyeL.cx},${eyeL.cy})`} />
        <ellipse cx={eyeR.cx} cy={eyeR.cy} rx="8" ry="5" fill="#1a1a1a" transform={`rotate(-15,${eyeR.cx},${eyeR.cy})`} />
        <circle cx={eyeL.cx+2} cy={eyeL.cy-1} r="2" fill="white" opacity="0.7" />
        <circle cx={eyeR.cx+2} cy={eyeR.cy-1} r="2" fill="white" opacity="0.7" />
        {/* teardrops */}
        <ellipse cx="41" cy="78" rx="3" ry="5" fill="#93C5FD" opacity="0.9" />
        <ellipse cx="73" cy="78" rx="3" ry="5" fill="#93C5FD" opacity="0.9" />
      </g>
    );
    if (isSurrender) return (
      <g>
        {/* one eye wink */}
        <ellipse cx={eyeL.cx} cy={eyeL.cy} rx="8" ry="7" fill="#1a1a1a" />
        <circle cx={eyeL.cx+2} cy={eyeL.cy-2} r="2.5" fill="white" />
        <circle cx={eyeL.cx+3.5} cy={eyeL.cy-3} r="1" fill="white" opacity="0.8" />
        {/* wink line */}
        <path d={`M${eyeR.cx-7} ${eyeR.cy} Q${eyeR.cx} ${eyeR.cy-5} ${eyeR.cx+7} ${eyeR.cy}`} stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    );
    // normal / correct / thinking
    return (
      <g>
        <ellipse cx={eyeL.cx} cy={eyeL.cy} rx="8" ry="8.5" fill="#1a1a1a" />
        <ellipse cx={eyeR.cx} cy={eyeR.cy} rx="8" ry="8.5" fill="#1a1a1a" />
        {/* shine */}
        <circle cx={eyeL.cx+2} cy={eyeL.cy-2.5} r="2.5" fill="white" />
        <circle cx={eyeR.cx+2} cy={eyeR.cy-2.5} r="2.5" fill="white" />
        <circle cx={eyeL.cx-2} cy={eyeL.cy+2} r="1.2" fill="white" opacity="0.6" />
        <circle cx={eyeR.cx-2} cy={eyeR.cy+2} r="1.2" fill="white" opacity="0.6" />
      </g>
    );
  }

  function Mouth() {
    if (isWrong) return <path d="M48 88 Q60 80 72 88" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    if (isCorrect) return (
      <g>
        <path d="M46 84 Q60 97 74 84" stroke="#1a1a1a" strokeWidth="2.5" fill="#FF9999" strokeLinecap="round" />
        <path d="M46 84 Q60 97 74 84" fill="#FF6B6B" opacity="0.5" />
      </g>
    );
    if (isSurrender) return <path d="M50 86 Q60 90 70 86" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />;
    // idle / thinking
    return <path d="M49 85 Q60 93 71 85" stroke="#1a1a1a" strokeWidth="2.5" fill="#FF9999" strokeLinecap="round" />;
  }

  function Arms() {
    if (isCorrect) return (
      <g>
        {/* arms raised celebrating */}
        <ellipse cx="18" cy="108" rx="9" ry="7" fill="#D4891A" transform="rotate(-40,18,108)" />
        <ellipse cx="102" cy="108" rx="9" ry="7" fill="#D4891A" transform="rotate(40,102,108)" />
        <ellipse cx="12" cy="96" rx="7" ry="6" fill="#E8A45A" transform="rotate(-50,12,96)" />
        <ellipse cx="108" cy="96" rx="7" ry="6" fill="#E8A45A" transform="rotate(50,108,96)" />
      </g>
    );
    if (state === 'thinking') return (
      <g>
        {/* right arm normal, left arm up to chin */}
        <ellipse cx="28" cy="118" rx="9" ry="7" fill="#D4891A" transform="rotate(10,28,118)" />
        <ellipse cx="92" cy="112" rx="9" ry="7" fill="#D4891A" transform="rotate(-30,92,112)" />
        <ellipse cx="88" cy="103" rx="7" ry="6" fill="#E8A45A" transform="rotate(-20,88,103)" />
      </g>
    );
    // default
    return (
      <g>
        <ellipse cx="24" cy="120" rx="10" ry="7" fill="#D4891A" transform="rotate(15,24,120)" />
        <ellipse cx="96" cy="120" rx="10" ry="7" fill="#D4891A" transform="rotate(-15,96,120)" />
      </g>
    );
  }

  function Extras() {
    if (isCorrect) return (
      <g>
        {/* stars */}
        <text x="8" y="45" fontSize="16" fill="#FFD700" style={{filter:'drop-shadow(0 0 3px #FFD700)'}}>✦</text>
        <text x="96" y="38" fontSize="14" fill="#FFD700" style={{filter:'drop-shadow(0 0 3px #FFD700)'}}>★</text>
        <text x="100" y="60" fontSize="10" fill="#FFC0CB">✦</text>
        <text x="4" y="62" fontSize="10" fill="#FFC0CB">✦</text>
      </g>
    );
    if (isWrong) return (
      <g>
        {/* sweat lines */}
        <line x1="15" y1="50" x2="22" y2="58" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <line x1="10" y1="56" x2="19" y2="60" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </g>
    );
    if (isSurrender) return (
      <g>
        {/* sweat drop */}
        <path d="M98 28 Q102 22 106 28 Q106 36 102 36 Q98 36 98 28Z" fill="#93C5FD" opacity="0.85" />
      </g>
    );
    if (state === 'thinking') return (
      <text x="92" y="35" fontSize="22" fill="#6B7280" fontWeight="bold">?</text>
    );
    return null;
  }

  return (
    <div style={{ width: size, height: size * (h / w) }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={size} height={size * (h / w)} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="headGrad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#F0AA60" />
            <stop offset="100%" stopColor="#C97B20" />
          </radialGradient>
          <radialGradient id="faceGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#FFF5E6" />
            <stop offset="100%" stopColor="#F5DDB8" />
          </radialGradient>
          <radialGradient id="bodyGrad" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#2A3F7A" />
            <stop offset="100%" stopColor="#1A2B55" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* ── BODY (kimono) ── */}
        <ellipse cx="60" cy="128" rx="30" ry="26" fill="url(#bodyGrad)" filter="url(#shadow)" />
        {/* white collar V */}
        <path d="M48 108 L60 122 L72 108" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* red obi belt */}
        <rect x="32" y="128" width="56" height="10" rx="5" fill="#C0392B" />
        <ellipse cx="60" cy="133" rx="7" ry="6" fill="#E74C3C" />
        {/* sakura on chest */}
        {[0,72,144,216,288].map((a,i) => (
          <ellipse key={i}
            cx={60 + 5.5 * Math.cos(a * Math.PI/180)}
            cy={114 + 5.5 * Math.sin(a * Math.PI/180)}
            rx="3" ry="2"
            fill="#FFAEC9"
            transform={`rotate(${a},${60 + 5.5 * Math.cos(a * Math.PI/180)},${114 + 5.5 * Math.sin(a * Math.PI/180)})`}
          />
        ))}
        <circle cx="60" cy="114" r="2" fill="#FF6B9D" />

        {/* ── ARMS ── */}
        <Arms />

        {/* ── HEAD ── */}
        <ellipse cx="60" cy="62" rx="36" ry="34" fill="url(#headGrad)" filter="url(#shadow)" />

        {/* ── EARS ── */}
        {/* left ear */}
        <ellipse cx="31" cy="34" rx="11" ry="15" fill="#D4891A" transform="rotate(-15,31,34)" />
        <ellipse cx="31" cy="34" rx="6" ry="9" fill="#F4B8A0" transform="rotate(-15,31,34)" />
        {/* right ear */}
        <ellipse cx="89" cy="34" rx="11" ry="15" fill="#D4891A" transform="rotate(15,89,34)" />
        <ellipse cx="89" cy="34" rx="6" ry="9" fill="#F4B8A0" transform="rotate(15,89,34)" />

        {/* ── FACE (inner white area) ── */}
        <ellipse cx="60" cy="68" rx="24" ry="22" fill="url(#faceGrad)" />

        {/* ── HEADBAND ── */}
        <rect x="25" y="44" width="70" height="13" rx="6.5" fill="white" opacity="0.95" />
        {/* red circle (日の丸) */}
        <circle cx="60" cy="50.5" r="5" fill="#C0392B" />
        {/* 日 left text */}
        <text x="35" y="55" fontSize="7" fill="#1A2B55" fontWeight="bold" fontFamily="serif">日</text>
        {/* 語 right text */}
        <text x="78" y="55" fontSize="7" fill="#1A2B55" fontWeight="bold" fontFamily="serif">語</text>

        {/* ── EYES ── */}
        <Eyes />

        {/* ── CHEEKS ── */}
        <ellipse cx="36" cy="76" rx="8" ry="5" fill="#FF9999" opacity="0.45" />
        <ellipse cx="84" cy="76" rx="8" ry="5" fill="#FF9999" opacity="0.45" />

        {/* ── NOSE ── */}
        <ellipse cx="60" cy="80" rx="4.5" ry="3" fill="#1a1a1a" />
        <ellipse cx="59" cy="79" rx="1.5" ry="1" fill="#555" />

        {/* ── MOUTH ── */}
        <Mouth />

        {/* ── EXTRAS (stars, sweat, ?) ── */}
        <Extras />
      </svg>
    </div>
  );
}
