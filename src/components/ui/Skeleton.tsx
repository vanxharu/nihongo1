import React from 'react';

/** Khung chờ giữ bố cục danh sách/lưới; kèm role=status để trình đọc màn hình vẫn nghe "Đang tải". */
export default function Skeleton({ rows = 4, grid = false, label = 'Đang tải' }: { rows?: number; grid?: boolean; label?: string }) {
  return (
    <div role="status" aria-label={label} className={grid ? 'grid gap-3 sm:grid-cols-2' : 'space-y-3'}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200/70 bg-slate-100/70 p-4 space-y-2.5 motion-reduce:animate-none">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
