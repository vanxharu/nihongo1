import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

// Hiệu ứng toàn màn hình khi tăng chuỗi ngày (sự kiện 'nihongo:streak-up').
export default function StreakCelebration() {
  const [count, setCount] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      const n = (e as CustomEvent).detail?.streak;
      if (!Number.isFinite(n) || n < 1) return;
      clearTimeout(t);
      setShown(n - 1);
      setCount(n);
      setTimeout(() => setShown(n), 700); // số nhảy từ n-1 lên n
      t = setTimeout(() => setCount(null), 3200);
    };
    window.addEventListener('nihongo:streak-up', on);
    return () => { clearTimeout(t); window.removeEventListener('nihongo:streak-up', on); };
  }, []);

  return (
    <AnimatePresence>
      {count !== null && (
        <motion.div
          role="status" aria-live="polite"
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[#0b1020]/90 backdrop-blur-sm cursor-pointer"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setCount(null)}
        >
          {!reduced && Array.from({ length: 18 }, (_, i) => (
            <motion.span key={i} aria-hidden="true" className="absolute text-2xl"
              style={{ left: '50%', top: '45%' }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
              animate={{ x: Math.cos((i / 18) * 6.283) * (140 + (i % 3) * 60), y: Math.sin((i / 18) * 6.283) * (140 + (i % 3) * 60) - 40, opacity: 0, scale: 1.2 }}
              transition={{ duration: 1.4, delay: 0.25, ease: 'easeOut' }}>
              {i % 2 ? '✨' : '🔥'}
            </motion.span>
          ))}
          <motion.div
            className="text-[120px] sm:text-[150px] leading-none select-none"
            initial={{ scale: 0, rotate: -12 }}
            animate={reduced ? { scale: 1 } : { scale: [0, 1.35, 1], rotate: [-12, 6, 0] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.span className="inline-block" animate={reduced ? undefined : { scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.1, delay: 0.8 }}>🔥</motion.span>
          </motion.div>
          <div className="relative h-24 overflow-hidden text-7xl sm:text-8xl font-black text-amber-300 tabular-nums">
            <AnimatePresence mode="popLayout">
              <motion.div key={shown} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }} transition={{ duration: 0.4 }}>
                {shown}
              </motion.div>
            </AnimatePresence>
          </div>
          <motion.p className="mt-2 text-xl font-bold text-white" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            ngày liên tiếp!
          </motion.p>
          <motion.p className="mt-1 text-sm text-slate-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            Giữ lửa nhé, mai gặp lại 🐕
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
