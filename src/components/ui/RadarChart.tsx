import React from 'react';

/** Radar nhiều trục (spec 154). values 0..1. */
export default function RadarChart({ labels, values, size = 220 }: { labels: string[]; values: number[]; size?: number }) {
  const n = labels.length, c = size / 2, R = size / 2 - 34;
  const pt = (i: number, k: number) => [c + Math.sin((2 * Math.PI * i) / n) * R * k, c - Math.cos((2 * Math.PI * i) / n) * R * k];
  const poly = (k: (i: number) => number) => Array.from({ length: n }, (_, i) => pt(i, k(i)).join(',')).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: size }} role="img" aria-label={labels.map((l, i) => `${l} ${Math.round(values[i] * 100)}%`).join(', ')}>
      {[0.25, 0.5, 0.75, 1].map((k) => <polygon key={k} points={poly(() => k)} fill="none" stroke="currentColor" strokeOpacity={0.15} />)}
      <polygon points={poly((i) => Math.max(0.03, values[i]))} fill="var(--ui-accent)" fillOpacity={0.25} stroke="var(--ui-accent)" strokeWidth={2} />
      {labels.map((l, i) => {
        const [x, y] = pt(i, 1.18);
        return <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="currentColor" opacity={0.7}>{l}</text>;
      })}
    </svg>
  );
}
