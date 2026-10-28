import test from 'node:test';
import assert from 'node:assert/strict';
import { getPitchAccent, calculateMoraPitches, getMoras } from '../src/utils/pitchAccent';

test('pitch accents come from the dictionary, never guessed', () => {
  assert.equal(getPitchAccent('たった今', 'たったいま').type, 4);
  assert.equal(getPitchAccent('両親', 'りょうしん').type, 1);
  assert.equal(getPitchAccent('はし', 'はし', 'đũa').type, 1);
  assert.equal(getPitchAccent('はし', 'はし', 'cầu').type, 2);
  assert.equal(getPitchAccent('ありえない語', 'ありえないご').type, null);
  assert.deepEqual(getMoras('ファイル'), ['ファ', 'イ', 'ル']);
  assert.deepEqual(calculateMoraPitches('せんせい', 3).map(m => m.isHigh), [false, true, true, false]);
});
