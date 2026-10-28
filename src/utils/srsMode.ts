import { useEffect, useState } from 'react';

const KEY = 'srs_auto';
const EVT = 'srs-auto-change';
export const readSrsAuto = () => { try { return localStorage.getItem(KEY) !== '0'; } catch { return true; } };

// Công tắc SRS tự động dùng chung (Từ vựng, Luyện thi JLPT, Luyện tập). Mặc định bật.
export function useSrsAuto(): [boolean, () => void] {
  const [on, setOn] = useState(readSrsAuto);
  useEffect(() => {
    const sync = () => setOn(readSrsAuto());
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, []);
  const toggle = () => {
    try { localStorage.setItem(KEY, readSrsAuto() ? '0' : '1'); } catch { /* storage blocked: công tắc không nhớ */ }
    window.dispatchEvent(new Event(EVT));
  };
  return [on, toggle];
}

// SRS cho câu thi sai (JLPT): lưu snapshot câu hỏi + lịch ôn SM-2.
const WRONG_KEY = 'jlpt_srs_questions';
export type SrsQuestionRecord = { question: any; srs: { interval: number; easeFactor: number; nextReviewDate: string; repetitions: number } };
export const readSrsQuestions = (): Record<string, SrsQuestionRecord> => { try { return JSON.parse(localStorage.getItem(WRONG_KEY) || '{}'); } catch { return {}; } };
export const writeSrsQuestions = (v: Record<string, SrsQuestionRecord>) => { try { localStorage.setItem(WRONG_KEY, JSON.stringify(v)); } catch { /* storage full */ } };
export const dueSrsQuestions = () => Object.values(readSrsQuestions()).filter(r => new Date(r.srs.nextReviewDate) <= new Date()).map(r => r.question);
// Đề AI đánh số câu giống nhau ở mọi đề (ai_n4_1…): gắn mã đề để câu của đề này không ghi đè lịch của đề khác.
// Câu trong phiên ôn SRS đã mang sẵn khoá này làm id.
export const srsQuestionKey = (examId: string, qid: string) => (examId.startsWith('ai_exam_') ? `${examId}:${qid}` : qid);
