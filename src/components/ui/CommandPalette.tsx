import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const COMMANDS: [string, string, string][] = [
  ['Trang chủ', '/', 'home'],
  ['Ngữ pháp', '/bunpo', 'grammar bunpo'],
  ['Từ vựng', '/tango', 'vocabulary tango'],
  ['Kanji', '/kanji', 'kanji hán tự'],
  ['Luyện thi JLPT', '/jlpt', 'jlpt exam thi đề'],
  ['Lộ trình', '/lo-trinh', 'roadmap lo trinh'],
  ['Đọc hiểu', '/doc-hieu', 'reading doc hieu'],
  ['Shadowing', '/shadowing', 'shadowing nghe'],
  ['Sổ tay', '/so-tay', 'notebook so tay'],
  ['Từ điển', '/tu-dien', 'dictionary tu dien'],
  ['Chat AI', '/chat-ai', 'chat ai'],
  ['Thành tựu', '/thanh-tich', 'achievements thanh tich'],
  ['Tài khoản', '/tai-khoan', 'profile tai khoan'],
  ['Cài đặt', '/cai-dat', 'settings cai dat'],
];
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();

/** Bảng lệnh Ctrl/⌘+K để nhảy nhanh tới trang (spec 046). */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const list = useMemo(() => COMMANDS.filter(([n, , k]) => fold(`${n} ${k}`).includes(fold(q.trim()))), [q]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === 'Escape') setOpen(false);
    };
    const openEv = () => setOpen(true);
    window.addEventListener('keydown', on);
    window.addEventListener('open-command-palette', openEv);
    return () => { window.removeEventListener('keydown', on); window.removeEventListener('open-command-palette', openEv); };
  }, []);
  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => input.current?.focus(), 0); } }, [open]);
  if (!open) return null;
  const go = (path: string) => { setOpen(false); nav(path); };
  return (
    <div className="fixed inset-0 z-[140] bg-black/60 flex items-start justify-center pt-[15vh] px-4" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Tìm nhanh" className="w-full max-w-md bg-[#1B223C] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl text-slate-200">
        <label className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
          <Search size={16} className="text-slate-400" />
          <input
            ref={input}
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(list.length - 1, s + 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
              else if (e.key === 'Enter' && list[sel]) go(list[sel][1]);
            }}
            placeholder="Đi tới… (Ngữ pháp, Kanji, Sổ tay)"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="text-[10px] text-slate-500 border border-slate-700 rounded px-1">Esc</kbd>
        </label>
        <ul className="max-h-72 overflow-auto p-1.5">
          {list.map(([n, p], i) => (
            <li key={p}>
              <button onMouseEnter={() => setSel(i)} onClick={() => go(p)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${i === sel ? 'bg-amber-500/20 text-amber-200' : ''}`}>{n}</button>
            </li>
          ))}
          {!list.length && <li className="px-3 py-4 text-xs text-slate-500">Không có kết quả</li>}
        </ul>
      </div>
    </div>
  );
}
