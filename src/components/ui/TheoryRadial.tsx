import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Languages, PenLine } from 'lucide-react';
import './theoryRadial.css';

// Radial menu ported from Lucian UX/UI spec 011 (MIT).
export const THEORY_ITEMS = [
  { id: 'grammar', path: '/bunpo', label: 'Ngữ pháp', icon: BookOpen, c: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)' },
  { id: 'vocabulary', path: '/tango', label: 'Từ vựng', icon: Languages, c: 'linear-gradient(135deg,#fbbf24,#f97316)' },
  { id: 'kanji', path: '/kanji', label: 'Kanji', icon: PenLine, c: 'linear-gradient(135deg,#f472b6,#a855f7)' },
];
const FAN = {
  up: [[-84, -52], [0, -98], [84, -52]],
  right: [[88, -62], [110, 0], [88, 62]],
};

export default function TheoryRadial({ rect, dir, onPick, onClose }: {
  rect: DOMRect; dir: 'up' | 'right'; onPick: (id: string) => void; onClose: () => void;
}) {
  const nav = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const btns = () => Array.from(root.current?.querySelectorAll<HTMLButtonElement>('.u011-item') ?? []);
    btns()[1]?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      const b = btns(); const i = b.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') b[(i + 1) % b.length]?.focus();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') b[(i - 1 + b.length) % b.length]?.focus();
    };
    const down = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', down);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', down); };
  }, [onClose]);

  const cx = dir === 'up' ? rect.left + rect.width / 2 : rect.right;
  const cy = dir === 'up' ? rect.top : rect.top + rect.height / 2;
  const clampedX = Math.min(Math.max(cx, 100), window.innerWidth - 100);
  return createPortal(
    <div ref={root} data-dir={dir} className="u011" role="menu" aria-label="Lý thuyết" style={{ left: clampedX, top: cy }}>
      <div className="u011-halo" />
      {THEORY_ITEMS.map((it, i) => {
        const Icon = it.icon;
        const [x, y] = FAN[dir][i];
        return (
          <button
            key={it.id} type="button" role="menuitem" className="u011-item"
            style={{ '--x': `${x}px`, '--y': `${y}px`, '--i': i, '--c': it.c } as React.CSSProperties}
            onClick={() => { onPick(it.id); nav(it.path); onClose(); }}
          >
            <span className="u011-ico"><Icon size={22} /></span>
            <span className="u011-lab">{it.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}
