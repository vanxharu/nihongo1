import test from 'node:test';
import assert from 'node:assert/strict';
import study from '../src/data/examStudyData.json' with { type: 'json' };
import { REAL_EXAMS_N4_OFFICIAL_2018 as A } from '../src/data/realExamsN4_Official2018';
import { REAL_EXAMS_N4_OFFICIAL as B } from '../src/data/realExamsN4_Official';

test('dữ liệu học đề: mỗi đoạn khớp một đoạn đọc thật, câu dẫn trỏ tới câu hỏi có thật', () => {
  const qs = [...A.questions, ...B.questions];
  for (const [key, p] of Object.entries(study.passages as Record<string, { sentences: { ja: string; vi: string; for: string[] }[] }>)) {
    const q = qs.find(x => (x.readingPassage || '').slice(0, 20) === key);
    assert.ok(q, `không có đoạn ${key}`);
    assert.equal(p.sentences.map(s => s.ja).join('').replace(/\s/g, ''), q!.readingPassage!.replace(/\s/g, ''));
    for (const s of p.sentences) { assert.ok(s.vi, `thiếu bản dịch: ${s.ja}`); s.for.forEach(id => assert.ok(qs.some(x => x.id === id), id)); }
  }
});
