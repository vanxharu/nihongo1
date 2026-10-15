import { localDateStr } from './localDate';

export type Skill = 'vocab' | 'grammar' | 'kanji';
type Tally = Record<Skill, [number, number]>; // [đúng, tổng]
const key = () => `nhai_daily_acc_v1_${localDateStr()}`;
const skillOf = (path: string): Skill | null =>
  /tango|vocab/.test(path) ? 'vocab' : /bunpo|grammar/.test(path) ? 'grammar' : /kanji/.test(path) ? 'kanji' : null;

export function readAccuracy(): Tally {
  try { return { vocab: [0, 0], grammar: [0, 0], kanji: [0, 0], ...JSON.parse(localStorage.getItem(key()) || '{}') }; }
  catch { return { vocab: [0, 0], grammar: [0, 0], kanji: [0, 0] }; }
}

/** Gọi mỗi khi một câu được chấm; phân loại theo trang đang học. shortcut: các bài ở trang khác (đọc hiểu, shadowing) không tính. */
export function recordAnswer(correct: boolean) {
  const s = skillOf(location.pathname);
  if (!s) return;
  try {
    const t = readAccuracy();
    t[s] = [t[s][0] + (correct ? 1 : 0), t[s][1] + 1];
    localStorage.setItem(key(), JSON.stringify(t));
  } catch { /* storage blocked: bỏ qua */ }
}
