import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewSRS, isDue, calculateSRS } from '../src/utils/srs';
import { srsQuestionKey } from '../src/utils/srsMode';

const day = 86400000;
test('reviewSRS: đúng nhiều lần trong ngày không giãn lịch', () => {
  const a = reviewSRS(null, true);
  assert.equal(a.interval, 1);
  const b = reviewSRS(a, true);
  const c = reviewSRS(b, true);
  assert.deepEqual(c, a);
});

test('reviewSRS: đến hạn thì giãn 1 → 6, sai thì về 1 ngày', () => {
  const a = reviewSRS(null, true);
  const later = new Date(Date.parse(a.nextReviewDate) + 1000);
  assert.ok(isDue(a, later));
  const b = reviewSRS(a, true, later);
  assert.equal(b.interval, 6);
  assert.equal(b.repetitions, 2);
  const c = reviewSRS(b, false);
  assert.equal(c.interval, 1);
  assert.equal(c.repetitions, 0);
  assert.ok(Date.parse(c.nextReviewDate) - Date.now() < 2 * day);
});

test('calculateSRS không đổi hành vi cũ', () => {
  assert.equal(calculateSRS(null, 5).interval, 1);
  assert.equal(calculateSRS({ interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: '' }, 5).interval, 6);
});

test('khoá câu SRS: đề AI gắn mã đề, đề thường giữ id', () => {
  assert.equal(srsQuestionKey('ai_exam_1', 'ai_n4_5'), 'ai_exam_1:ai_n4_5');
  assert.notEqual(srsQuestionKey('ai_exam_1', 'ai_n4_5'), srsQuestionKey('ai_exam_2', 'ai_n4_5'));
  assert.equal(srsQuestionKey('jlpt_n4_official_sample', 'n4_of_v1'), 'n4_of_v1');
  assert.equal(srsQuestionKey('srs-review', 'ai_exam_1:ai_n4_5'), 'ai_exam_1:ai_n4_5');
});
