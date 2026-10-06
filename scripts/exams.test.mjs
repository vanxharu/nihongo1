import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeExam, ensureFullExamQuestions } from '../src/data/jlptExamGenerator.ts';
import { JLPT_PAST_EXAMS } from '../src/data/jlptExams.ts';

const raw = {
  id: 'x', title: 'Đề thi chính thức JLPT N5', level: 'N5', durationMinutes: 0, questions: [
    { id: 'q1', section: 'moji-goi', question: 'もう日本の生活に（ ）か。', hint: 'Đã quen chưa? (なれましたか)', options: ['はらいました', 'なれました', 'もどりました', 'おれました'], correctIndex: 1 },
    { id: 'q2', section: 'dokkai', question: '【文章】\n本文です。\n\n質問：一つ目？', hint: '', options: ['1. あ', '2. い'], correctIndex: 0 },
    { id: 'q3', section: 'dokkai', question: '【文章】...\n質問：二つ目？', hint: '', options: ['1. う', '2. え'], correctIndex: 1 },
  ],
};

test('sanitizeExam hides leaking hints, keeps the right answer, restores shared passages, is idempotent', () => {
  const e = sanitizeExam(raw);
  const [q1, q2, q3] = e.questions;
  assert.ok(!q1.hint.includes('なれました'));
  assert.equal(q1.options[q1.correctIndex], 'なれました');
  assert.match(q1.explanation, /なれました/);
  assert.deepEqual(q2.options, ['あ', 'い']);
  assert.match(q3.readingPassage, /本文です/);
  assert.equal(q3.question, '質問：二つ目？');
  assert.match(e.title, /rút gọn/);
  assert.deepEqual(sanitizeExam(e), e);
  assert.deepEqual(ensureFullExamQuestions(ensureFullExamQuestions(raw)).questions, ensureFullExamQuestions(raw).questions);
});

test('every library exam has valid answers and no answer-revealing hints', () => {
  for (const e of JLPT_PAST_EXAMS) for (const q of e.questions) {
    assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length, `${e.id}/${q.id}`);
    const ans = q.options[q.correctIndex].replace(/\s/g, '');
    assert.ok(!(q.hint || '').replace(/\s/g, '').includes(ans), `${e.id}/${q.id} hint leaks answer`);
    assert.ok(q.explanation?.trim(), `${e.id}/${q.id} explanation`);
  }
});
