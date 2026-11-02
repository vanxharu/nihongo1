// One rule everywhere: a study day is a (Vietnam-time) date in studyDays — a day the learner earned XP.
// The streak is the run of consecutive study days ending today, or yesterday while today is not studied yet.
export const vnDate = (d: Date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
export const addDays = (day: string, n: number) => { const t = new Date(`${day}T00:00:00Z`); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };

export function computeStreak(studyDays: unknown, today = vnDate()): number {
  const days = new Set(Array.isArray(studyDays) ? studyDays.filter((d): d is string => typeof d === 'string') : []);
  let day = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(day)) { n++; day = addDays(day, -1); }
  return n;
}
