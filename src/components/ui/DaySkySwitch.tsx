// Lucian UX/UI Prompt #021 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#021
import React from 'react';
import './daySkySwitch.css';

type Props = { night: boolean; onToggle: () => void; label: string; width?: number };

const STARS: [number, number, number, number?, number?][] = [
  [30, 20, 0], [58, 56, -0.6, 3, 3], [86, 26, -1.2], [44, 72, -1.8, 3, 3], [110, 60, -0.9, 2, 2], [20, 46, -1.5, 2, 2],
];

export default function DaySkySwitch({ night, onToggle, label, width = 76 }: Props) {
  const s = width / 224;
  return (
    <span className={`u021${night ? ' is-night' : ''}`} style={{ '--s': s, width, height: 94 * s } as React.CSSProperties}>
      <span className="u021-scale">
        <button className="u021-sw" type="button" role="switch" aria-checked={night} aria-label={label} title={label} onClick={onToggle}>
          <span className="u021-halo" aria-hidden="true"><i /><i /><i /></span>
          <span className="u021-stars" aria-hidden="true">
            {STARS.map(([l, t, d, w, h]) => <i key={l} style={{ left: l, top: t, animationDelay: `${d}s`, ...(w ? { width: w, height: h } : null) }} />)}
          </span>
          <span className="u021-clouds" aria-hidden="true"><i /><i /></span>
          <span className="u021-knob" aria-hidden="true"><span className="u021-moon"><i /><i /><i /></span></span>
        </button>
      </span>
    </span>
  );
}
