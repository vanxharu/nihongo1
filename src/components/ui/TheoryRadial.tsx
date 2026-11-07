import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Languages, PenLine, Bookmark } from 'lucide-react';
import './theoryRadial.css';

// Theory menu (originally a radial menu from Lucian UX/UI spec 011, MIT).
export const THEORY_ITEMS = [
  { id: 'grammar', path: '/bunpo', label: 'Ngữ pháp', icon: BookOpen, c: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)' },
  { id: 'vocabulary', path: '/tango', label: 'Từ vựng', icon: Languages, c: 'linear-gradient(135deg,#fbbf24,#f97316)' },
  { id: 'kanji', path: '/kanji', label: 'Kanji', icon: PenLine, c: 'linear-gradient(135deg,#f472b6,#a855f7)' },
  { id: 'myvocab', path: '/tu-cua-toi', label: 'Của tôi', icon: Bookmark, c: 'linear-gradient(135deg,#34d399,#16a34a)' },
];

export default function TheoryRadial({ rect, dir, onPick, onClose }: {
  rect: DOMRect; dir: 'up' | 'right'; onPick: (id: string) => void; onClose: () => void;
}) {
  const nav = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const btns = () => Array.from(root.current?.querySelectorAll<HTMLButtonElement>('.u011-item') ?? []);
    btns()[0]?.focus();
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
  }, [onClose, dir]);

  // A compact list (icon + label rows) instead of the old radial fan of gradient circles, which covered
  // the page: beside the item in the desktop sidebar, above the item in the mobile bottom bar.
  const width = 200;
  const pos: React.CSSProperties = dir === 'right'
    ? { left: rect.right + 8, top: Math.min(Math.max(rect.top - 6, 8), window.innerHeight - 4 * 44 - 24) }
    : { left: Math.min(Math.max(rect.left + rect.width / 2 - width / 2, 8), window.innerWidth - width - 8), bottom: window.innerHeight - rect.top + 8, width };
  return createPortal(
    <div ref={root} data-dir={dir} className="u011-flyout" role="menu" aria-label="Lý thuyết" style={pos}>
      {THEORY_ITEMS.map((it, i) => {
        const Icon = it.icon;
        return (
          <button key={it.id} type="button" role="menuitem" className="u011-item u011-row" style={{ '--i': i, '--c': it.c } as React.CSSProperties}
            onClick={() => { onPick(it.id); nav(it.path); onClose(); }}>
            <span className="u011-ico"><Icon size={16} /></span>
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}
