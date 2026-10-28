import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JLPTSUCCESS_N4_EXAMS } from '../src/data/jlptSuccessN4';

test('đề JLPTSuccess: đáp án hợp lệ, có audio, có ghi nguồn', () => {
  for (const e of JLPTSUCCESS_N4_EXAMS) {
    assert.match(e.session!, /CC BY|được phép dùng lại|cho phép đăng lại/);
    for (const q of e.questions) {
      assert.ok(q.options[q.correctIndex]);
      if (q.audioUrl) assert.ok(fs.existsSync('public' + q.audioUrl), q.audioUrl);
      if (q.section === 'dokkai') assert.ok(q.readingPassage);
    }
  }
});
