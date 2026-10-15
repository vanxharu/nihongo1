import React from 'react';
import DaySkySwitch from './DaySkySwitch';
import { useSrsAuto } from '../../utils/srsMode';

// Công tắc bật/tắt SRS tự động, cùng kiểu với công tắc ngày/đêm (ban ngày = bật).
export default function SrsSwitch({ className = '' }: { className?: string }) {
  const [on, toggle] = useSrsAuto();
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-[11px] font-bold opacity-70">SRS</span>
      <DaySkySwitch night={!on} onToggle={toggle} label={on ? 'Tắt SRS tự động' : 'Bật SRS tự động'} width={56} />
    </span>
  );
}
