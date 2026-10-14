// Lucian UX/UI Prompt #028 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#028
import React, { useLayoutEffect, useRef } from 'react';
import './autoGrowInput.css';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  max?: number;
  placeholder?: string;
  ariaLabel: string;
  inputRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function AutoGrowInput({ value, onChange, onEnter, max = 500, placeholder, ariaLabel, inputRef, onFocus, onBlur }: Props) {
  const local = useRef<HTMLTextAreaElement | null>(null);
  const n = Array.from(value).length;
  const rest = max - n;

  useLayoutEffect(() => {
    const ta = local.current;
    if (!ta) return;
    const h = ta.style.height;
    ta.style.transition = 'none';
    ta.style.height = '24px';
    const need = Math.min(144, ta.scrollHeight);
    ta.style.height = h || '24px';
    void ta.offsetHeight;
    ta.style.transition = '';
    ta.style.height = need + 'px';
    ta.style.overflowY = ta.scrollHeight > 144 ? 'auto' : 'hidden';
  }, [value]);

  return (
    <div className={`u028${rest <= 20 ? ' is-near' : ''}${rest < 0 ? ' is-over' : ''}`} style={{ '--p': Math.min(1, n / max).toFixed(3) } as React.CSSProperties}>
      <div className="u028-box">
        <textarea
          ref={(el) => { local.current = el; if (inputRef) inputRef.current = el; }}
          className="u028-ta" rows={1} value={value} aria-label={ariaLabel} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (rest >= 0) onEnter(); } }}
          onFocus={onFocus} onBlur={onBlur}
        />
        <span className="u028-ring" aria-hidden="true">
          <svg viewBox="0 0 30 30"><circle className="bg" cx="15" cy="15" r="12" /><circle className="fg" cx="15" cy="15" r="12" /></svg>
          <span className="u028-left">{rest}</span>
        </span>
      </div>
      <span className="u028-sr" aria-live="polite">{rest === 20 ? `Còn ${rest} ký tự` : rest === -1 ? 'Vượt quá giới hạn ký tự' : ''}</span>
    </div>
  );
}
