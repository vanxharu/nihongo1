import React from 'react';

export type MascotState = 'idle' | 'correct' | 'wrong' | 'surrender' | 'thinking';

interface Props {
  state: MascotState;
  size?: number;
}

const webp: Record<MascotState, string> = {
  idle:      '/mascot-idle.webp',
  correct:   '/mascot-celebrate.webp',
  wrong:     '/mascot-writing.webp',
  surrender: '/mascot-wink.webp',
  thinking:  '/mascot-thinking.webp',
};

const png: Record<MascotState, string> = {
  idle:      '/mascot-idle.png',
  correct:   '/mascot-celebrate.png',
  wrong:     '/mascot-writing.png',
  surrender: '/mascot-wink.png',
  thinking:  '/mascot-thinking.png',
};

export default function ShibaMascot({ state, size = 120 }: Props) {
  return (
    <picture>
      <source srcSet={webp[state]} type="image/webp" />
      <img
        src={png[state]}
        alt={`mascot-${state}`}
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        draggable={false}
      />
    </picture>
  );
}
