import React, { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

export interface PickerItem { value: string; label: string }
export interface PickerGroup { label: string; items: PickerItem[] }

/** Chọn trong danh sách dài: ô tìm + nhóm theo chủ đề (thay cho <select> nhiều mục). */
export default function SearchPicker({ value, onChange, groups, placeholder = 'Tìm…' }: {
  value: string; onChange: (v: string) => void; groups: PickerGroup[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const cur = groups.flatMap(g => g.items).find(i => i.value === value);
  const nq = q.trim().toLowerCase();
  const shown = groups.map(g => ({ ...g, items: g.items.filter(i => !nq || i.label.toLowerCase().includes(nq) || g.label.toLowerCase().includes(nq)) })).filter(g => g.items.length);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="min-h-[44px] w-full flex items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800">
        <span className="truncate">{cur?.label ?? placeholder}</span><ChevronDown size={16} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg p-2">
          <div className="sticky top-0 bg-white pb-2 flex items-center gap-2 rounded-lg border border-slate-300 px-2">
            <Search size={16} className="text-slate-500" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder} className="min-h-[40px] flex-1 search-bare text-sm" />
            {q && <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setQ('')} className="min-h-[40px] min-w-[40px] grid place-items-center"><X size={16} /></button>}
          </div>
          {shown.length === 0 && <p className="p-3 text-sm text-slate-500">Không có kết quả cho "{q}".</p>}
          {shown.map(g => (
            <div key={g.label} className="mt-1">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{g.label}</div>
              {g.items.map(i => (
                <button key={i.value} type="button" onClick={() => { onChange(i.value); setOpen(false); setQ(''); }} className={`min-h-[44px] w-full text-left rounded-lg px-3 text-sm ${i.value === value ? 'bg-emerald-50 font-bold text-emerald-800' : 'text-slate-800 hover:bg-slate-50'}`}>{i.label}</button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
