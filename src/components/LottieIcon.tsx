import React, { Suspense, lazy } from 'react';

// lottie-web is heavy: load it only when an animation is actually rendered.
const Lottie = lazy(() => import('lottie-react'));

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Small looping (or one-shot) Lottie animation; renders nothing under reduced-motion. Accepts any Lottie JSON, e.g. a free LottieFiles download. */
export default function LottieIcon({ data, size = 32, loop = true, className = '' }: { data: object; size?: number; loop?: boolean; className?: string }) {
  if (reducedMotion()) return null;
  return (
    <span className={`inline-block shrink-0 pointer-events-none ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <Suspense fallback={null}>
        <Lottie animationData={data} loop={loop} style={{ width: size, height: size }} />
      </Suspense>
    </span>
  );
}
