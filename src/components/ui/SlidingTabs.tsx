import React from 'react';
import { motion } from 'motion/react';

/** Tab viên thuốc có chỉ báo trượt (spec 039). */
export default function SlidingTabs<T extends string>({ value, onChange, items, id }: {
  value: T; onChange: (v: T) => void; items: [T, string][]; id: string;
}) {
  return (
    <div role="tablist" className="inline-flex p-1 rounded-full bg-[color:var(--ui-canvas)] border border-[color:var(--ui-line)]">
      {items.map(([k, label]) => (
        <button
          key={k}
          role="tab"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className={`relative px-3.5 py-1.5 text-xs font-bold rounded-full transition-colors ${value === k ? 'text-[color:var(--ui-accent-contrast,#fff)]' : 'text-[color:var(--ui-muted)]'}`}
        >
          {value === k && (
            <motion.span layoutId={`pill-${id}`} className="absolute inset-0 rounded-full bg-[color:var(--ui-accent)]" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />
          )}
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  );
}
