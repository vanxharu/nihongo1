// Lucian UX/UI Prompt #078 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#078
import React, { useRef, useState } from 'react';
import './swipeReply.css';

const THRESHOLD = 60;
const Arrow = () => <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M5.5 3.5L2 7l3.5 3.5M2 7h6.5a3.5 3.5 0 0 1 3.5 3.5" /></svg>;

// Kéo bong bóng sang phải (hoặc bấm nút ↩ khi hover) để trả lời.
export default function SwipeReply({ children, onReply, label = 'Trả lời tin nhắn này' }: { children: React.ReactNode; onReply: () => void; label?: string }) {
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const start = useRef(0);
  const raw = useRef(0);
  const d = dx > THRESHOLD ? THRESHOLD + (dx - THRESHOLD) * 0.3 : dx;

  const end = () => {
    if (!drag) return;
    setDrag(false); setDx(0);
    if (raw.current >= THRESHOLD) onReply();
  };

  return (
    <div className={`u078-m${drag ? ' drag' : ''}`}>
      <span className={`u078-rep${dx >= THRESHOLD ? ' full' : ''}`} style={{ '--ro': Math.min(1, dx / THRESHOLD).toFixed(2) } as React.CSSProperties} aria-hidden="true"><Arrow /></span>
      <div
        className="u078-bub" style={{ transform: `translateX(${d}px)` }}
        onPointerDown={(e) => { if (e.button !== 0) return; start.current = e.clientX; raw.current = 0; setDrag(true); e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (!drag) return; raw.current = Math.max(0, e.clientX - start.current); setDx(raw.current); }}
        onPointerUp={end} onPointerCancel={end}
      >
        {children}
      </div>
      <button className="u078-rb" type="button" aria-label={label} title={label} onClick={onReply}><Arrow /></button>
    </div>
  );
}
