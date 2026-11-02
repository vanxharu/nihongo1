import test from 'node:test';
import assert from 'node:assert/strict';
import { guardProgress } from '../src/server/progressGuard';

test('XP gains are capped per save and per day; decreases pass', () => {
  assert.deepEqual(guardProgress({ xp: 100 }, { xp: 150 }, '2026-11-02'), { xp: 150, xpToday: { d: '2026-11-02', n: 50 } });
  assert.equal(guardProgress({ xp: 100 }, { xp: 999999 }, '2026-11-02').xp, 6100);
  assert.equal(guardProgress({ xp: 100, xpToday: { d: '2026-11-02', n: 14950 } }, { xp: 500 }, '2026-11-02').xp, 150);
  assert.equal(guardProgress({ xp: 100, xpToday: { d: '2026-11-01', n: 15000 } }, { xp: 200 }, '2026-11-02').xp, 200); // new day resets
  assert.equal(guardProgress({ xp: 500 }, { xp: 0 }, '2026-11-02').xp, 0);
});

test('study days: only today/yesterday can be added, stored days kept', () => {
  const r = guardProgress({ studyDays: '["2026-10-20"]' }, { studyDays: ['2026-10-01', '2026-11-01', '2026-11-02'] }, '2026-11-02');
  assert.deepEqual(r.studyDays, ['2026-10-20', '2026-11-01', '2026-11-02']);
});
