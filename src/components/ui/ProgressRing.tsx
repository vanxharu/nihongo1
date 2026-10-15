import React from 'react';

/** Vòng tiến độ (spec 099). */
export default function ProgressRing({ percent, size = 56, color = 'var(--ui-accent)', children }: {
  percent: number; size?: number; color?: string; children?: React.ReactNode;
}) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, Math.max(0, percent)) / 100)}
          style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <span className="absolute text-[11px] font-black">{children ?? `${Math.round(percent)}%`}</span>
    </span>
  );
}
