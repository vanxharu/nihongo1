import React from 'react';
import { Repeat } from 'lucide-react';
import { useSrsAuto } from '../../utils/srsMode';

// Nút bật/tắt SRS tự động: một viên thuốc gọn gồm icon + chữ + công tắc nhỏ.
export default function SrsSwitch({ className = '' }: { className?: string }) {
  const [on, toggle] = useSrsAuto();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      title={on ? 'SRS tự động đang bật: tự ôn từ đến hạn' : 'SRS tự động đang tắt'}
      onClick={toggle}
      className={`inline-flex items-center gap-2 h-9 pl-3 pr-1.5 rounded-full border text-xs font-bold transition-colors cursor-pointer ${
        on
          ? 'border-[color:var(--ui-accent)] bg-[color:color-mix(in_srgb,var(--ui-accent)_12%,transparent)] text-[color:var(--ui-accent)]'
          : 'border-[color:var(--ui-line)] bg-transparent text-[color:var(--ui-muted)]'
      } ${className}`}
    >
      <Repeat size={14} aria-hidden />
      SRS
      <span aria-hidden className={`relative w-9 h-6 rounded-full transition-colors ${on ? 'bg-[color:var(--ui-accent)]' : 'bg-[color:var(--ui-soft)]'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${on ? 'translate-x-3' : ''}`} style={{ transitionTimingFunction: 'cubic-bezier(.34,1.45,.64,1)' }} />
      </span>
    </button>
  );
}
