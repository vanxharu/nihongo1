import React from 'react';
import { Search, X } from 'lucide-react';

/** Ô tìm có biểu tượng, nút xóa nhanh và dòng trạng thái kết quả (search là một flow). */
export default function SearchInput({ value, onChange, placeholder, count, className = '', id }: {
  value: string; onChange: (v: string) => void; placeholder: string; count?: number; className?: string; id?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
        <Search size={16} className="shrink-0 text-slate-500" />
        <input id={id} type="search" value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') onChange(''); }} placeholder={placeholder} aria-label={placeholder} className="min-h-[44px] min-w-0 flex-1 search-bare text-sm text-slate-900 [&::-webkit-search-cancel-button]:hidden" />
        {value && <button type="button" aria-label="Xóa tìm kiếm" onClick={() => onChange('')} className="grid min-h-[44px] min-w-[44px] place-items-center text-slate-500"><X size={16} /></button>}
      </div>
      {value && count !== undefined && <p role="status" className="mt-1 text-xs text-slate-600">{count ? `${count} kết quả cho "${value}"` : `Không có kết quả cho "${value}". Thử từ khóa khác.`}</p>}
    </div>
  );
}
