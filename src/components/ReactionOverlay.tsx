import React, { useEffect, useState } from 'react';

type ReactionState = 'neutral' | 'correct' | 'wrong' | 'surrender';

interface Props {
  state: ReactionState;
}

function Confetti({ count = 40 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    dur: 0.8 + Math.random() * 0.6,
    color: ['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8'][i % 8],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 50 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function ReactionOverlay({ state }: Props) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (state !== 'neutral') {
      setVisible(true);
      setKey(k => k + 1);
      const t = setTimeout(() => setVisible(false), 1400);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [state]);

  if (!visible || state === 'neutral') return null;

  const isCorrect = state === 'correct';

  return (
    <div
      key={key}
      className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl sm:rounded-3xl overflow-hidden"
      style={{ zIndex: 40 }}
    >
      <div
        className={`absolute inset-0 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}
        style={{ animation: 'flashFade 0.5s ease-out forwards', opacity: 0 }}
      />

      {isCorrect && <Confetti count={45} />}

      <div
        className="relative z-50 flex flex-col items-center gap-2"
        style={{ animation: isCorrect ? 'mascotJump 0.6s ease-out' : 'mascotShake 0.5s ease-out' }}
      >
        <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>
          {isCorrect ? '🎉' : state === 'surrender' ? '😅' : '😢'}
        </span>
        <span
          className={`px-4 py-1.5 rounded-full text-white font-bold text-sm shadow-lg ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}
          style={{ animation: 'popIn 0.35s 0.1s ease-out both' }}
        >
          {isCorrect ? 'Chính xác! 🔥' : state === 'surrender' ? 'Ghi nhớ nhé! 📚' : 'Sai rồi! 💪'}
        </span>
      </div>
    </div>
  );
}
