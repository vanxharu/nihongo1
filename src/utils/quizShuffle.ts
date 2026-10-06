/** Unbiased Fisher-Yates shuffle (the `sort(() => Math.random() - 0.5)` idiom is biased). */
export function shuffled<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** `count` distinct wrong options: never equal to the correct answer, never repeated, never empty. */
export function pickDistractors(pool: readonly string[], correct: string, count = 3): string[] {
  return shuffled([...new Set(pool.filter(v => v && v !== correct))]).slice(0, count);
}
