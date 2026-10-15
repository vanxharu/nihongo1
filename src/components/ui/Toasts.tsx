import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type T = { id: number; message: string; undo?: () => void };
let seq = 0;
/** Hiện toast từ bất kỳ đâu; có `undo` thì kèm nút Hoàn tác (spec 070/071). */
export const toast = (message: string, undo?: () => void) =>
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { id: ++seq, message, undo } }));

export default function Toasts() {
  const [list, setList] = useState<T[]>([]);
  const drop = (id: number) => setList((l) => l.filter((t) => t.id !== id));
  useEffect(() => {
    const on = (e: Event) => {
      const t = (e as CustomEvent<T>).detail;
      setList((l) => [...l.slice(-2), t]); // tối đa 3 cái xếp chồng
      setTimeout(() => drop(t.id), t.undo ? 6000 : 4000);
    };
    window.addEventListener('app-toast', on);
    return () => window.removeEventListener('app-toast', on);
  }, []);
  return (
    <div className="fixed bottom-24 xl:bottom-6 left-1/2 -translate-x-1/2 z-[120] w-[92%] max-w-sm flex flex-col gap-2 pointer-events-none" aria-live="polite">
      <AnimatePresence initial={false}>
        {list.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80 }}
            drag="x"
            dragSnapToOrigin
            onDragEnd={(_, i) => Math.abs(i.offset.x) > 80 && drop(t.id)}
            className="pointer-events-auto bg-[#1B223C] border border-[#E89A3C]/50 text-amber-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs font-bold"
          >
            <span className="min-w-0">{t.message}</span>
            <button
              className="px-2.5 py-1 bg-[#242E52] hover:bg-[#E89A3C] rounded-lg text-[10px] font-black text-amber-200 hover:text-white shrink-0"
              onClick={() => { t.undo?.(); drop(t.id); }}
            >
              {t.undo ? 'Hoàn tác' : 'Đóng'}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
