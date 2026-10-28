import test from 'node:test';
import assert from 'node:assert/strict';
const store: Record<string, string> = {};
(globalThis as any).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; } };
(globalThis as any).window = { dispatchEvent() {}, addEventListener() {}, removeEventListener() {} };
const m = await import('../src/utils/watchProgress');

test('tiến độ xem: lưu vị trí, ≥90% thì đã xem, tua lại không bỏ đánh dấu', () => {
  m.saveWatchPosition('abc', 30, 600);
  assert.equal(m.readWatchProgress().abc.watched, false);
  assert.equal(m.resumeAt(m.readWatchProgress().abc), 30);
  m.saveWatchPosition('abc', 545, 600);
  assert.equal(m.readWatchProgress().abc.watched, true);
  m.saveWatchPosition('abc', 5, 600);
  assert.equal(m.readWatchProgress().abc.watched, true);
  assert.equal(m.resumeAt(m.readWatchProgress().abc), 0);
  m.setWatched('abc', false);
  assert.equal(m.readWatchProgress().abc.watched, false);
});
