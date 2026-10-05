export interface OriginalQuestion { question: string; options: string[]; correctIndex?: number; explanation?: string }
/** Only treat an explicitly named index as zero based. Never guess an answer from a generic number. */
export function originalQuestions(value: unknown): OriginalQuestion[] {
  let input: any = value;
  if (typeof input === 'string') { try { input = JSON.parse(input); } catch { return []; } }
  const list = Array.isArray(input) ? input : Array.isArray(input?.questions) ? input.questions : input && typeof input === 'object' ? [input] : [];
  return list.flatMap((q: any) => {
    const question = q?.question || q?.questionText || q?.text;
    const choices = q?.options || q?.choices || q?.answers;
    const options = Array.isArray(choices) ? choices.map((o: any) => typeof o === 'string' ? o : o?.text || o?.answer || o?.content) : [];
    if (typeof question !== 'string' || !question.trim() || options.length < 2 || options.length > 6 || options.some((o: any) => typeof o !== 'string')) return [];
    let correctIndex: number | undefined;
    if (Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < options.length) correctIndex = q.correctIndex;
    else if (typeof q.correctAnswer === 'string' && options.includes(q.correctAnswer)) correctIndex = options.indexOf(q.correctAnswer);
    else if (Array.isArray(choices)) { const marked = choices.map((o: any, i: number) => o?.isCorrect === true ? i : -1).filter((i: number) => i >= 0); if (marked.length === 1) correctIndex = marked[0]; }
    return [{ question, options, ...(correctIndex !== undefined ? { correctIndex } : {}), ...(typeof q.explanation === 'string' ? { explanation: q.explanation } : {}) }];
  });
}
export function mergeOriginalQuestions(original: OriginalQuestion[], generated: any[]) {
  if (!original.length) return generated;
  return original.map(question => {
    const matching = generated.find(q => q.question === question.question && Array.isArray(q.options) && JSON.stringify(q.options) === JSON.stringify(question.options));
    if (!matching && question.correctIndex === undefined) throw new Error('ORIGINAL_QUESTIONS_INCOMPLETE');
    const correctIndex = question.correctIndex ?? matching?.correctIndex;
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= question.options.length) throw new Error('ORIGINAL_QUESTIONS_INCOMPLETE');
    return { question: question.question, options: question.options, correctIndex, explanation: question.explanation || matching?.explanation || 'Đáp án được cung cấp bởi trang nguồn.',
      questionOrigin: 'source', answerOrigin: question.correctIndex !== undefined ? 'source' : 'ai-inferred' };
  });
}
