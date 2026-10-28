import test from 'node:test';
import assert from 'node:assert/strict';
import { REAL_EXAMS_N4_OFFICIAL_2018 as A } from '../src/data/realExamsN4_Official2018';
import { REAL_EXAMS_N4_OFFICIAL as B } from '../src/data/realExamsN4_Official';

test('mọi câu của 2 đề N4 chính thức đều có lời giải + giải thích từng đáp án', () => {
  for (const q of [...A.questions, ...B.questions]) {
    assert.ok(q.explanation && q.explanation.length > 15, `${q.id}: thiếu lời giải`);
    assert.equal(q.optionExplanations?.length, q.options.length, `${q.id}: thiếu giải thích đáp án`);
    assert.match(q.optionExplanations![q.correctIndex], /^Đúng/, `${q.id}: đáp án đúng chưa đánh dấu`);
    q.optionExplanations!.forEach((t, i) => { if (i !== q.correctIndex) assert.match(t, /^Sai/, `${q.id}[${i}]`); });
  }
});
