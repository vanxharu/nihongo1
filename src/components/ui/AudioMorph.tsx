// Lucian UX/UI Prompt #007 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#007
import React, { useEffect, useId, useRef } from 'react';
import './audioMorph.css';

const PLAY = [[[13, 8], [22.5, 13.6], [22.5, 26.4], [13, 32]], [[22.5, 13.6], [32, 20], [32, 20], [22.5, 26.4]]];
const PAUSE = [[[11, 9], [17, 9], [17, 31], [11, 31]], [[23, 9], [29, 9], [29, 31], [23, 31]]];
const rm = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Nút play ↔ pause biến hình; vòng ngoài chạy theo tiến độ (progress 0..1). */
export function PlayPauseMorph({ playing, progress, onClick, size = 44, playTitle = 'Phát', pauseTitle = 'Tạm dừng' }: {
  playing: boolean; progress: number; onClick: () => void; size?: number; playTitle?: string; pauseTitle?: string;
}) {
  const L = useRef<SVGPolygonElement>(null), R = useRef<SVGPolygonElement>(null);
  const shape = useRef(playing ? 1 : 0), raf = useRef(0);
  const gid = 'u007g' + useId().replace(/:/g, '');
  const draw = (t: number) => [L.current, R.current].forEach((poly, k) => poly?.setAttribute('points', PLAY[k].map((p, j) => {
    const q = PAUSE[k][j]; return `${(p[0] + (q[0] - p[0]) * t).toFixed(2)},${(p[1] + (q[1] - p[1]) * t).toFixed(2)}`;
  }).join(' ')));
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const from = shape.current, to = playing ? 1 : 0, t0 = performance.now(), D = rm() ? 1 : 420;
    const f = (now: number) => {
      const x = Math.min(1, (now - t0) / D), e = 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
      shape.current = from + (to - from) * e; draw(shape.current);
      if (x < 1) raf.current = requestAnimationFrame(f);
    };
    raf.current = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);
  return (
    <span className={`u007${playing ? ' is-play' : ''}`} style={{ width: size, height: size, ['--p' as string]: Math.max(0, Math.min(1, progress)).toFixed(4) }}>
      <svg className="u007-ring" viewBox="0 0 160 160" aria-hidden="true">
        <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8B6CFF" /><stop offset="1" stopColor="#FF6B8B" /></linearGradient></defs>
        <circle className="u007-track" cx="80" cy="80" r="72" /><circle className="u007-arc" cx="80" cy="80" r="72" style={{ stroke: `url(#${gid})` }} />
      </svg>
      <span className="u007-pulse" aria-hidden="true" />
      <button type="button" className="u007-btn" onClick={onClick} aria-pressed={playing} aria-label={playing ? pauseTitle : playTitle} title={playing ? pauseTitle : playTitle}>
        <svg viewBox="0 0 40 40" aria-hidden="true"><polygon ref={L} /><polygon ref={R} /></svg>
      </button>
    </span>
  );
}

const N = 44;
const BARS = Array.from({ length: N }, (_, i) => ({ h: Math.min(100, 30 + Math.abs(Math.sin(i * 0.9) * 46 + Math.sin(i * 0.37) * 24)), d: (i % 7) / 7 }));

/** Sóng âm: bấm hoặc kéo để tua; phím ←/→ ±5s. */
export function WaveSeek({ value, max, playing, onSeek }: { value: number; max: number; playing?: boolean; onSeek: (s: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const total = max > 0 ? max : 0;
  const on = total ? Math.round((value / total) * N) : 0;
  const seek = (x: number) => { const r = ref.current!.getBoundingClientRect(); onSeek(Math.max(0, Math.min(1, (x - r.left) / r.width)) * total); };
  return (
    <div ref={ref} className={`u007-wave${playing ? ' is-play' : ''}`} role="slider" tabIndex={0} aria-label="Vị trí phát" aria-valuemin={0} aria-valuemax={Math.floor(total)}
      aria-valuenow={Math.floor(value)} aria-valuetext={`${Math.floor(value / 60)} phút ${Math.floor(value % 60)} giây`}
      onPointerDown={(e) => { if (!total) return; e.currentTarget.setPointerCapture(e.pointerId); seek(e.clientX); }}
      onPointerMove={(e) => { if (total && e.currentTarget.hasPointerCapture(e.pointerId)) seek(e.clientX); }}
      onKeyDown={(e) => {
        let d = ({ ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 } as Record<string, number>)[e.key];
        if (e.key === 'Home') d = -total; if (e.key === 'End') d = total;
        if (d) { e.preventDefault(); onSeek(Math.max(0, Math.min(total, value + d))); }
      }}>
      {BARS.map((b, k) => <i key={k} className={k < on ? 'on' : ''} style={{ ['--h' as string]: b.h.toFixed(0), ['--d' as string]: b.d } as React.CSSProperties} />)}
    </div>
  );
}
