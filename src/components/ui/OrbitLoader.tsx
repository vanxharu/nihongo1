// Lucian UX/UI Prompt #080 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#080
import React, { useEffect, useRef } from 'react';
import './orbitLoader.css';

// [bán kính, độ nghiêng, chu kỳ (s), màu, cỡ hành tinh]
const O: [number, number, number, string, number][] = [[105, -18, 5.5, '#22C3A6', 12], [75, 24, 3.6, '#FF6B8B', 10], [50, -58, 2.2, '#FFB547', 9]];

export default function OrbitLoader({ title = 'Đang tải dữ liệu', sub = 'Chờ một chút nhé' }: { title?: string; sub?: string }) {
  const sys = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sys.current;
    if (!el) return;
    const rm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const planets = Array.from(el.querySelectorAll<HTMLElement>('.u080-p'));
    let raf = 0, t = 0, last = performance.now();
    const frame = (now: number) => {
      if (!rm) t += (now - last) / 1000;
      last = now;
      planets.forEach((p, n) => {
        const o = O[n >> 1], a = (n & 1 ? Math.PI : 0) + (n >> 1) + (t * Math.PI * 2) / o[2], tl = (o[1] * Math.PI) / 180;
        const x = Math.cos(a) * o[0], y = Math.sin(a) * o[0] * 0.38;
        p.style.transform = `translate(${(115 + x * Math.cos(tl) - y * Math.sin(tl)).toFixed(1)}px,${(100 + x * Math.sin(tl) + y * Math.cos(tl)).toFixed(1)}px)`;
        p.style.zIndex = Math.sin(a) < 0 ? '0' : '2';
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="u080" role="status" aria-live="polite">
      <div className="u080-sys" ref={sys} aria-hidden="true">
        {O.map(([r, tilt], i) => <div key={i} className="u080-o" style={{ '--d': `${r * 2}px`, '--t': `${tilt}deg` } as React.CSSProperties} />)}
        {O.flatMap(([, , , c, s], i) => [0, 1].map(k => <i key={`${i}${k}`} className="u080-p" style={{ '--c': c, '--s': `${k ? s - 4 : s}px`, opacity: k ? 0.7 : 1 } as React.CSSProperties} />))}
        <span className="u080-core" />
      </div>
      <b className="u080-t">{title}</b>
      <p className="u080-sub">{sub}</p>
    </div>
  );
}
