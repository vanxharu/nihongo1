import test from 'node:test';
import assert from 'node:assert/strict';
import { validInput, parseAnalysis, analysisKey } from '../src/server/aiAnalysis';

test('ai analysis input and output are validated', () => {
  assert.equal(validInput('evil', 'x', undefined), null);
  assert.equal(validInput('vocab', 'x'.repeat(201), undefined), null);
  assert.deepEqual(validInput('vocab', ' 猫 ', undefined), { kind: 'vocab', text: '猫', context: '' });
  assert.equal(analysisKey('vocab', '猫'), analysisKey('vocab', ' 猫 '));
  const a = parseAnalysis('```json\n{"translation":"mèo","summary":"s","points":[{"title":"a","body":"b"},{"x":1}]}\n```');
  assert.deepEqual(a.points, [{ title: 'a', body: 'b' }]);
  assert.throws(() => parseAnalysis('{"points":[]}'));
});
