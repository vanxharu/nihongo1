import test from 'node:test';
import assert from 'node:assert/strict';
import { computeStreak, addDays, vnDate } from '../src/utils/streak';

test('streak counts consecutive study days ending today or yesterday', () => {
  assert.equal(computeStreak(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'], '2026-11-02'), 4);
  assert.equal(computeStreak(['2026-10-31', '2026-11-01'], '2026-11-02'), 2); // today not studied yet: streak kept
  assert.equal(computeStreak(['2026-10-30', '2026-11-02'], '2026-11-02'), 1); // gap breaks it
  assert.equal(computeStreak(['2026-10-30'], '2026-11-02'), 0);
  assert.equal(computeStreak(null, '2026-11-02'), 0);
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});

test('Vietnam date rolls over at local midnight, not 07:00', () => {
  assert.equal(vnDate(new Date('2026-11-01T17:30:00Z')), '2026-11-02'); // 00:30 in Vietnam
});
