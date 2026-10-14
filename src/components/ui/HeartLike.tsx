// Lucian UX/UI Prompt #022 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#022
import React, { useEffect, useId, useRef, useState } from 'react';
import './heartLike.css';

const DOTS = [
  [0, '#FF4D6D', '#FFB26B'], [51, '#8B6CFF', '#FF7A93'], [103, '#FFB547', '#22C3A6'], [154, '#FF4D6D', '#8B6CFF'],
  [206, '#22C3A6', '#FFB547'], [257, '#FF7A93', '#3D8BFF'], [309, '#3D8BFF', '#FF4D6D'],
] as const;
const HEART = 'M26 45S5 33 5 18.5C5 11.6 10.4 7 16.4 7c4.3 0 7.6 2.3 9.6 5.6C28 9.3 31.3 7 35.6 7 41.6 7 47 11.6 47 18.5 47 33 26 45 26 45z';

type Props = {
  pressed: boolean;
  onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  size?: number; // đường kính nút hiển thị (px); thiết kế gốc là 112px
  className?: string;
};

export default function HeartLike({ pressed, onToggle, label, size = 40, className = '' }: Props) {
  const gid = 'u022-g-' + useId().replace(/:/g, '');
  const [pop, setPop] = useState(false);
  const prev = useRef(pressed);
  useEffect(() => {
    // Hiệu ứng chỉ chạy khi chuyển sang trạng thái "thích"; bỏ thích thì lặng lẽ quay lại.
    if (pressed && !prev.current) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 900);
      prev.current = pressed;
      return () => clearTimeout(t);
    }
    prev.current = pressed;
  }, [pressed]);

  return (
    <span className={`u022${pressed ? ' is-on' : ''}${pop ? ' is-pop' : ''} ${className}`} style={{ '--s': size / 112, width: size, height: size } as React.CSSProperties}>
      <span className="u022-scale">
        <button className="u022-btn" type="button" aria-pressed={pressed} aria-label={label} title={label} onClick={onToggle}>
          <span className="u022-ring" aria-hidden="true" />
          {DOTS.map(([a, c, c2]) => (
            <span key={a} className="u022-dot" style={{ '--a': `${a}deg`, '--c': c, '--c2': c2 } as React.CSSProperties} aria-hidden="true"><i /><i /></span>
          ))}
          <span className="u022-heart" aria-hidden="true">
            <svg viewBox="0 0 52 52">
              <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF7A93" /><stop offset="1" stopColor="#F0264D" /></linearGradient></defs>
              <path className="u022-f" style={{ fill: `url(#${gid})` }} d={HEART} />
              <path className="u022-o" style={pressed ? { stroke: 'transparent' } : undefined} d={HEART} />
            </svg>
          </span>
        </button>
      </span>
    </span>
  );
}
