// Lucian UX/UI Prompt #005 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#005
import React, { useEffect, useRef, useState } from 'react';
import './planeSend.css';

const rm = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Nút gửi tròn: máy bay giấy bay theo đường cong, dấu tick vẽ ở giữa, máy bay mới trượt vào. Kích thước theo `size` (px). */
export default function PlaneSend({ onClick, disabled, size = 40, title = 'Gửi tin nhắn', className = '' }: {
  onClick: () => void; disabled?: boolean; size?: number; title?: string; className?: string;
}) {
  const [state, setState] = useState<'idle' | 'fly' | 'sent' | 'back'>('idle');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const click = () => {
    if (state !== 'idle') return;
    onClick();
    const r = rm();
    setState('fly');
    later(() => setState('sent'), r ? 50 : 1000);
    later(() => setState('back'), r ? 900 : 2300);
    later(() => setState('idle'), r ? 1000 : 3000);
  };

  return (
    <span className={`u005 ${className}`} data-state={state} style={{ ['--s' as string]: `${size / 92}` , width: size, height: size }}>
      <button type="button" className="u005-btn" onClick={click} disabled={disabled && state === 'idle'} aria-label={title} title={title}>
        <span className="u005-ring" aria-hidden="true" />
        <span className="u005-check" aria-hidden="true"><svg viewBox="0 0 34 34"><path d="M9 17.5l5.5 5.5L25.5 12" /></svg></span>
      </button>
      <span className="u005-dot" aria-hidden="true" /><span className="u005-dot" aria-hidden="true" /><span className="u005-dot" aria-hidden="true" />
      <span className="u005-plane" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3.2 11.1L20.4 3.6c.6-.3 1.2.3.9.9l-7.5 17.2c-.3.7-1.3.6-1.5-.1l-1.8-6.2c-.1-.3-.3-.5-.6-.6L3.7 13c-.7-.2-.8-1.2-.1-1.5z" transform="rotate(45 12 12)" /></svg></span>
    </span>
  );
}
