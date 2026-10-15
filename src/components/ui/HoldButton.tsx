import React, { useRef, useState } from 'react';

/** Nhấn giữ ~0.8s để xác nhận (spec 003); thả sớm thì hủy. Có phím Enter giữ cho bàn phím. */
export default function HoldButton({ onConfirm, children, className = '', ms = 800, ...rest }: {
  onConfirm: () => void; children: React.ReactNode; className?: string; ms?: number;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  const [p, setP] = useState(0);
  const t = useRef<number | null>(null);
  const start = () => {
    const t0 = performance.now();
    const tick = () => {
      const v = Math.min(1, (performance.now() - t0) / ms);
      setP(v);
      if (v >= 1) { t.current = null; setP(0); onConfirm(); } else t.current = requestAnimationFrame(tick);
    };
    t.current = requestAnimationFrame(tick);
  };
  const stop = () => { if (t.current) cancelAnimationFrame(t.current); t.current = null; setP(0); };
  return (
    <button
      type="button"
      {...rest}
      className={`relative overflow-hidden select-none touch-none ${className}`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); start(); } }}
      onKeyUp={stop}
      onBlur={stop}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 bg-rose-500/30" style={{ width: `${p * 100}%` }} />
      <span className="relative flex items-center gap-1">{children}</span>
    </button>
  );
}
