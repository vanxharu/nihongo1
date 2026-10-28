import test from 'node:test';
import assert from 'node:assert/strict';
import study from '../src/data/examStudyData.json' with { type: 'json' };
import { REAL_EXAMS_N4_OFFICIAL_2018 as A } from '../src/data/realExamsN4_Official2018';
import { REAL_EXAMS_N4_OFFICIAL as B } from '../src/data/realExamsN4_Official';
import { JLPTSUCCESS_N4_EXAMS as C } from '../src/data/jlptSuccessN4';
import { sanitizeExam } from '../src/data/jlptExamGenerator';
import examVi from '../src/data/examTranslations.json' with { type: 'json' };

test('dữ liệu học đề: mỗi đoạn khớp một đoạn đọc thật, câu dẫn trỏ tới câu hỏi có thật', () => {
  const qs = [A, B, ...C].flatMap(e => sanitizeExam(e).questions);
  for (const [key, p] of Object.entries(study.passages as Record<string, { sentences: { ja: string; vi: string; for: string[] }[] }>)) {
    const q = qs.find(x => (x.readingPassage || '').slice(0, 20) === key);
    assert.ok(q, `không có đoạn ${key}`);
    assert.equal(p.sentences.map(s => s.ja).join('').replace(/\s/g, ''), q!.readingPassage!.replace(/\s/g, ''));
    for (const s of p.sentences) { assert.ok(s.vi, `thiếu bản dịch: ${s.ja}`); s.for.forEach(id => assert.ok(qs.some(x => x.id === id), id)); }
  }
});

test('bản dịch tiếng Việt: khoá theo id câu hỏi có thật, không rỗng', () => {
  const v = examVi as { q: Record<string, string>; s: Record<string, string> };
  const ids = new Set([A, B, ...C].flatMap(e => e.questions.map(q => q.id)));
  for (const id of [...Object.keys(v.q), ...Object.keys(v.s)]) assert.ok(ids.has(id), id);
  for (const t of [...Object.values(v.q), ...Object.values(v.s)]) assert.ok(t.trim().length > 0);
});
