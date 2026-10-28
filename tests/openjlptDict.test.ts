import test from 'node:test';
import assert from 'node:assert/strict';
import { segment } from '../src/components/exam/TappableJa';

test('từ N2 ngoài kho cũ tra được từ OpenJLPT', () => {
  const hit = segment('相変わらず元気です').find(x => x.hit)?.hit;
  assert.ok(hit);
  assert.equal(hit!.reading, 'あいかわらず');
});
