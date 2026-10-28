// Tiến độ xem video Shadowing, lưu máy (khoá có tiền tố shadowing-practice nên được đồng bộ đám mây cùng dữ liệu học).
const KEY = 'shadowing-practice:watch-progress';
export type WatchEntry = { t: number; d: number; watched: boolean; at: number };
export type WatchMap = Record<string, WatchEntry>;
const EVT = 'shadowing-watch-progress';
export const WATCHED_RATIO = 0.9;

export const readWatchProgress = (): WatchMap => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; } };
const write = (m: WatchMap) => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* storage đầy/bị chặn */ } window.dispatchEvent(new Event(EVT)); };

/** Ghi vị trí đang xem; xem tới ≥90% thời lượng thì tự đánh dấu đã xem (không tự bỏ đánh dấu khi tua lại). */
export function saveWatchPosition(videoId: string, t: number, d: number) {
  if (!videoId || !(t >= 0) || !(d > 0)) return;
  const m = readWatchProgress(); const prev = m[videoId];
  m[videoId] = { t: Math.min(t, d), d, watched: !!prev?.watched || t >= d * WATCHED_RATIO, at: Date.now() };
  write(m);
}
export function setWatched(videoId: string, watched: boolean) {
  const m = readWatchProgress(); const prev = m[videoId];
  m[videoId] = { t: watched ? prev?.t ?? 0 : 0, d: prev?.d ?? 0, watched, at: Date.now() };
  write(m);
}
export const onWatchProgress = (cb: () => void) => { window.addEventListener(EVT, cb); return () => window.removeEventListener(EVT, cb); };
/** Có nên mời xem tiếp không: đã xem quá 10 giây và chưa tới đoạn cuối. */
export const resumeAt = (e?: WatchEntry) => (e && !e.watched && e.t > 10 && (!e.d || e.t < e.d - 15) ? e.t : 0);
