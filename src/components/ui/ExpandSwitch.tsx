// Lucian UX/UI Prompt #023 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#023
import React from 'react';
import './expandSwitch.css';

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (next: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button className="u023-sw" type="button" role="switch" aria-checked={checked} aria-label={label} title={label} disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }} />
  );
}

// Vùng mở rộng mượt (grid 0fr → 1fr). Nội dung luôn được render để animation chạy; inert khi đóng.
export function Expand({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div className={`u023-more${open ? ' is-open' : ''}`} aria-hidden={!open} {...(!open ? { inert: '' as any } : null)}>
      <div>{children}</div>
    </div>
  );
}
