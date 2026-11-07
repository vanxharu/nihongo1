import React, { Suspense, lazy } from 'react';

// lottie-web is heavy: load it only when an animation is actually rendered.
const Lottie = lazy(() => import('lottie-react'));

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

type LottieData = object;
type LottieLoader = () => Promise<{ default: LottieData } | LottieData>;

// One lazy component per loader, so the animation JSON is fetched together with lottie-web,
// only when the animation is first rendered (not as part of the startup bundle).
const loaded = new WeakMap<LottieLoader, React.LazyExoticComponent<React.ComponentType<{ loop: boolean; size: number }>>>();
function lazyAnimation(load: LottieLoader) {
  let Comp = loaded.get(load);
  if (!Comp) {
    Comp = lazy(async () => {
      const [{ default: LottiePlayer }, mod] = await Promise.all([import('lottie-react'), load()]);
      const animationData = (mod as any).default ?? mod;
      return { default: ({ loop, size }: { loop: boolean; size: number }) => <LottiePlayer animationData={animationData} loop={loop} style={{ width: size, height: size }} /> };
    });
    loaded.set(load, Comp);
  }
  return Comp;
}

/** Small looping (or one-shot) Lottie animation; renders `fallback` (default nothing) under reduced-motion. Pass the JSON as `data`, or a dynamic import as `load` to keep it out of the startup bundle. */
export default function LottieIcon({ data, load, size = 32, loop = true, className = '', fallback = null }: { data?: LottieData; load?: LottieLoader; size?: number; loop?: boolean; className?: string; fallback?: React.ReactNode }) {
  if (reducedMotion()) return <>{fallback}</>;
  const Animation = load ? lazyAnimation(load) : null;
  return (
    <span className={`inline-block shrink-0 pointer-events-none ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <Suspense fallback={fallback}>
        {Animation ? <Animation loop={loop} size={size} /> : <Lottie animationData={data} loop={loop} style={{ width: size, height: size }} />}
      </Suspense>
    </span>
  );
}
