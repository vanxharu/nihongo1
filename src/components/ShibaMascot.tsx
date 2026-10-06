import React from 'react';

export type MascotState = 'idle' | 'correct' | 'wrong' | 'surrender' | 'thinking';

interface Props {
  state: MascotState;
  size?: number;
}

const images: Record<MascotState, string> = {
  idle:      '/mascot-idle.png',
  correct:   '/mascot-celebrate.png',
  wrong:     '/mascot-writing.png',
  surrender: '/mascot-wink.png',
  thinking:  '/mascot-thinking.png',
};

export default function ShibaMascot({ state, size = 120 }: Props) {
  return (
    <img
      src={images[state]}
      alt={`mascot-${state}`}
      width={size}
      height={size}
      style={{ objectFit: 'contain', imageRendering: 'auto' }}
      draggable={false}
    />
  );
}
