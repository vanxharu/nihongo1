// Lucian UX/UI Prompt #001 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#001
import React, { useEffect, useRef, useState } from 'react';
import './liquidGlass.css';

const rm = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Bấm → co thành giọt + quay → nở ra dấu tick → gọi onDone. */
export default function LiquidGlassButton({ label, doneLabel, onDone, busyText = 'Đang xử lý', doneText }: {
  label: string; doneLabel: string; onDone: () => void; busyText?: string; doneText?: string;
}) {
  const [state, setState] = useState<'idle' | 'load' | 'ok'>('idle');
  const [pos, setPos] = useState({ mx: '50%', my: '0%', tx: 0, ty: 0 });
  const btn = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const move = (e: React.PointerEvent) => {
    const r = btn.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const pull = rm() ? 0 : Math.max(0, 1 - Math.hypot(dx, dy) / 190);
    setPos({ mx: `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`, my: `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`, tx: dx * 0.18 * pull, ty: dy * 0.18 * pull });
  };
  const click = () => {
    if (state !== 'idle') return;
    setState('load');
    timers.current.push(window.setTimeout(() => setState('ok'), rm() ? 200 : 1000));
    timers.current.push(window.setTimeout(onDone, rm() ? 500 : 1700));
  };

  return (
    <div className="u001" data-state={state} onPointerMove={move} onPointerLeave={() => setPos((p) => ({ ...p, tx: 0, ty: 0 }))}>
      <div className="u001-blobs" aria-hidden="true"><i /><i /><i /></div>
      <div className="u001-mag" style={{ translate: `${pos.tx.toFixed(1)}px ${pos.ty.toFixed(1)}px` }}>
        <div className="u001-float">
          <button ref={btn} type="button" className="u001-btn" onClick={click} aria-busy={state === 'load'} style={{ ['--mx' as string]: pos.mx, ['--my' as string]: pos.my }}>
            <span className="u001-sheen" aria-hidden="true" />
            <span className="u001-txt">{label}</span>
            <span className="u001-spin" aria-hidden="true"><svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="10" /></svg></span>
            <span className="u001-done" aria-hidden="true"><b><svg viewBox="0 0 16 16"><path d="M3.5 8.4l3 3 6-6.4" /></svg></b>{doneLabel}</span>
          </button>
        </div>
      </div>
      <span className="u001-live" aria-live="polite">{state === 'load' ? busyText : state === 'ok' ? doneText ?? doneLabel : ''}</span>
    </div>
  );
}
