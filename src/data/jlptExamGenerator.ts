import { DailyExam, ExamQuestion } from '../types';

// Standard Question Count Breakdown per JLPT Level
export const JLPT_LEVEL_TARGETS: Record<string, { mojiGoi: number; bunpou: number; dokkai: number; choukai: number; total: number; duration: number }> = {
  'N5': { mojiGoi: 35, bunpou: 23, dokkai: 4, choukai: 5, total: 67, duration: 105 },
  'N4': { mojiGoi: 35, bunpou: 25, dokkai: 5, choukai: 5, total: 70, duration: 125 },
  'N3': { mojiGoi: 35, bunpou: 22, dokkai: 11, choukai: 5, total: 73, duration: 140 },
  'N2': { mojiGoi: 30, bunpou: 21, dokkai: 15, choukai: 5, total: 71, duration: 155 },
  'N1': { mojiGoi: 25, bunpou: 19, dokkai: 17, choukai: 5, total: 66, duration: 170 },
};

// ============================================
// Chuẩn hoá đề trước khi hiển thị (chạy được nhiều lần, kết quả không đổi)
// ============================================

/** Hướng dẫn trung tính theo dạng câu — không tiết lộ đáp án. */
export function neutralHint(q: ExamQuestion): string {
  const text = q.question || '';
  if (q.section === 'choukai') return 'Nghe và chọn câu trả lời đúng.';
  if (q.section === 'dokkai') return 'Đọc đoạn văn và chọn câu trả lời đúng nhất.';
  if (text.includes('★')) return 'Sắp xếp các từ thành câu đúng và chọn từ ở vị trí ★.';
  const bracket = text.match(/【([^】]+)】/);
  if (bracket) return /[\u4e00-\u9faf]/.test(bracket[1]) ? 'Chọn cách đọc đúng của từ trong 【 】.' : 'Chọn chữ Hán đúng của từ trong 【 】.';
  if (q.options.every(o => o.length > 12) && !/[（(]/.test(text)) {
    return text.length <= 8 ? 'Chọn câu dùng từ này đúng nhất.' : 'Chọn câu có nghĩa gần nhất với câu đã cho.';
  }
  return q.section === 'bunpou' ? 'Chọn từ / cấu trúc thích hợp điền vào chỗ trống.' : 'Chọn từ thích hợp điền vào chỗ trống.';
}

// Xáo thứ tự đáp án ổn định theo id câu (tránh đáp án dồn hết vào A).
function seededShuffle(id: string, n: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  return order;
}
const positionDependent = (q: ExamQuestion) =>
  q.section === 'choukai' || q.section === 'dokkai' || q.options.some(o => /番|^[1-4][.．]/.test(o)) || (q.question || '').includes('★')
  || /Đáp án\s*[1-4]|\([1-4]\)|vị trí|thứ\s*[1-4]/i.test(`${q.explanation || ''} ${q.hint || ''}`);

export function sanitizeExam(exam: DailyExam): DailyExam {
  if ((exam as any)._sanitized) return exam;
  const targets = JLPT_LEVEL_TARGETS[exam.level] || JLPT_LEVEL_TARGETS['N5'];
  let lastPassage = '';
  const questions = (exam.questions || []).map((orig): ExamQuestion => {
    const q: ExamQuestion = { ...orig, options: (orig.options || []).map(o => String(o).replace(/^[1-4][.．]\s*/, '')) };
    // Đoạn văn dùng chung: câu sau chỉ ghi "【文章】..." → lấy lại đoạn văn của câu trước.
    const full = (q.question || '').match(/^(【(?:文章|案内)】[\s\S]+?)\n*質問[：:]/);
    if (full && !full[1].includes('...')) lastPassage = full[1].trim();
    const stub = (q.question || '').match(/^【(?:文章|案内)】[^\n]*?\.\.\.\s*([\s\S]*)$/);
    if (stub && lastPassage && q.section === 'dokkai' && !q.readingPassage) {
      q.readingPassage = lastPassage;
      q.question = stub[1].trim();
    }
    // Gợi ý gốc thường là lời dịch hoặc chính đáp án → chỉ hiện sau khi nộp bài (trong phần giải thích).
    const original = (q.hint || '').trim();
    const neutral = neutralHint(q);
    if (original && original !== neutral && !/^(Cách đọc|Chữ Kanji đúng|Chọn|Điền) [^:：]{0,40}$/.test(original)) {
      q.explanation = q.explanation?.trim() ? (q.explanation.includes(original) ? q.explanation : `${q.explanation}\n💡 ${original}`) : original;
    }
    q.hint = neutral;
    if (!q.explanation?.trim()) {
      const ans = q.options[q.correctIndex] ?? '';
      const br = (q.question || '').match(/【([^】]+)】/);
      q.explanation = br
        ? (/[\u4e00-\u9faf]/.test(br[1]) ? `${br[1]} đọc là ${ans}.` : `${br[1]} viết bằng chữ Hán là ${ans}.`)
        : `Đáp án đúng: ${ans}.`;
    }
    if (!positionDependent(q) && q.options.length > 1) {
      const order = seededShuffle(q.id, q.options.length);
      q.options = order.map(i => orig.options[i]).map(o => String(o).replace(/^[1-4][.．]\s*/, ''));
      if (Array.isArray(orig.optionExplanations) && orig.optionExplanations.length === order.length) q.optionExplanations = order.map(i => orig.optionExplanations![i]);
      q.correctIndex = order.indexOf(orig.correctIndex);
    }
    return q;
  }).filter(q => (q.question || '').trim() || q.audioUrl || q.audioTrack || q.audioScript || q.imageSvg || q.imageUrl || q.readingPassage);

  // Đề có ít câu hơn nhiều so với đề thật không được gọi là "Đề thi chính thức".
  let title = exam.title;
  let category = exam.category;
  if (/chính thức/i.test(title) && questions.length < targets.total * 0.8) {
    title = `Đề luyện rút gọn JLPT ${exam.level} · ${questions.length} câu${exam.session ? ` (${exam.session})` : ''}`;
    category = 'mock_daily';
  }
  return { ...exam, title, category, questions, _sanitized: true } as DailyExam;
}

// Chuẩn hoá đề và đặt thời gian làm bài theo cấp độ.
// ponytail: không còn "đệm" câu hỏi mẫu N5 cho đủ số câu — đề ít câu là đề rút gọn thật.
export function ensureFullExamQuestions(rawExam: DailyExam): DailyExam {
  const exam = sanitizeExam(rawExam);
  const targets = JLPT_LEVEL_TARGETS[exam.level] || JLPT_LEVEL_TARGETS['N5'];
  return { ...exam, durationMinutes: exam.questions.length >= targets.total * 0.8 ? targets.duration : Math.max(10, Math.round(targets.duration * exam.questions.length / targets.total)) };
}
