import { DailyExam } from '../types';
import explanations from './examExplanations.json';

// Gắn lời giải (vì sao đúng / vì sao từng đáp án sai) soạn sẵn trong examExplanations.json vào đề.
export function withExplanations(exam: DailyExam): DailyExam {
  const map = explanations as Record<string, { e: string; o: string[] }>;
  return {
    ...exam,
    questions: exam.questions.map(q => {
      const x = map[q.id];
      if (!x) return q;
      const opts = x.o.length === q.options.length
        ? x.o.map((t, i) => i === q.correctIndex ? (/^Đúng/.test(t) ? t : `Đúng: ${t}`) : (/^Sai/.test(t) ? t : `Sai: ${t}`))
        : q.optionExplanations;
      return { ...q, explanation: x.e, optionExplanations: opts };
    }),
  };
}
