import { useEffect } from 'react';

// Fonts used only on exam / handwriting screens. They are large (several are Japanese fonts split into
// hundreds of files), so they are requested when one of those screens mounts instead of on every page.
const FONT_SETS = {
  // .font-jlpt-exam (src/index.css)
  exam: 'family=BIZ+UDMincho:wght@400;700&family=Shippori+Mincho:wght@400;500;600;700;800&family=Noto+Serif+JP:wght@400;500;600;700;900',
  // .font-red-pen and .font-japanese-handwriting (src/index.css)
  handwriting: 'family=Patrick+Hand&family=Mali:wght@400;500;600;700&family=Itim&family=Pangolin&family=Klee+One:wght@400;600&family=Yomogi',
} as const;

export type FontSet = keyof typeof FONT_SETS;

export function loadFontSet(set: FontSet) {
  if (typeof document === 'undefined') return;
  const id = `font-set-${set}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${FONT_SETS[set]}&display=swap`;
  document.head.appendChild(link);
}

export function useFontSets(...sets: FontSet[]) {
  const key = sets.join(',');
  useEffect(() => {
    for (const set of key.split(',')) if (set) loadFontSet(set as FontSet);
  }, [key]);
}
