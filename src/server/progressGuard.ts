import { addDays } from '../utils/streak';

// The client reports XP, coins and study days; the server only accepts believable changes so the
// leaderboard and streak cannot be set by editing requests. Decreases (e.g. a progress reset) pass.
// A full 98-question exam gives up to ~3000 XP (×streak bonus), so one save may carry several thousand.
export const MAX_XP_PER_SAVE = 6000, MAX_XP_PER_DAY = 15000, MAX_COINS_PER_SAVE = 500;
const parseDays = (v: unknown): string[] => { try { const a = typeof v === 'string' ? JSON.parse(v) : v; return Array.isArray(a) ? a.filter(d => typeof d === 'string') : []; } catch { return []; } };

export function guardProgress(
  stored: { xp?: number; coins?: number; studyDays?: unknown; xpToday?: { d?: string; n?: number } },
  incoming: { xp?: number; coins?: number; studyDays?: unknown },
  today: string,
) {
  const out: { xp?: number; coins?: number; studyDays?: string[]; xpToday?: { d: string; n: number } } = {};
  const baseXp = Number(stored.xp) || 0;
  const usedToday = stored.xpToday?.d === today ? Number(stored.xpToday.n) || 0 : 0;
  if (typeof incoming.xp === 'number') {
    const gain = Math.min(Math.max(0, incoming.xp - baseXp), MAX_XP_PER_SAVE, Math.max(0, MAX_XP_PER_DAY - usedToday));
    out.xp = incoming.xp < baseXp ? incoming.xp : baseXp + gain;
    if (gain) out.xpToday = { d: today, n: usedToday + gain };
  }
  if (typeof incoming.coins === 'number') {
    const baseCoins = Number(stored.coins) || 0;
    out.coins = Math.min(incoming.coins, baseCoins + MAX_COINS_PER_SAVE);
  }
  if (incoming.studyDays !== undefined) {
    // Only today or yesterday (streak freeze) can be added; past days already stored are kept.
    const known = new Set(parseDays(stored.studyDays));
    for (const d of parseDays(incoming.studyDays)) if (d === today || d === addDays(today, -1)) known.add(d);
    out.studyDays = [...known].sort();
  }
  return out;
}
