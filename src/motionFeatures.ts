// Animation engine for <LazyMotion> (src/main.tsx): loaded right after the first render instead of
// being part of the startup bundle. domMax because startup components use drag (Toasts) and layout.
export { domMax as default } from 'motion/react';
