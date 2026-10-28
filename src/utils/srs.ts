import { SRSStatus } from '../types';

export function calculateSRS(
  currentStatus: SRSStatus | null,
  quality: number // 0-5
): SRSStatus {
  // Simplified SM-2 algorithm
  let { interval, easeFactor, repetitions } = currentStatus || {
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
  };

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  nextReviewDate.setHours(0, 0, 0, 0); // đến hạn từ đầu ngày, không phụ thuộc giờ học trước đó

  return {
    interval,
    easeFactor,
    nextReviewDate: nextReviewDate.toISOString(),
    repetitions,
  };
}

export const isDue = (s: { nextReviewDate?: string } | null | undefined, now = new Date()) =>
  !!s?.nextReviewDate && new Date(s.nextReviewDate) <= now;

/**
 * Ghi một lần trả lời vào lịch SM-2.
 * Chỉ giãn lịch khi đã đến hạn (hoặc chưa có lịch): trả lời đúng nhiều lần trong ngày không làm khoảng cách tăng vọt.
 * Trả lời sai thì luôn đưa về ôn lại sau 1 ngày.
 */
export function reviewSRS(current: SRSStatus | null | undefined, correct: boolean, now = new Date()): SRSStatus {
  if (!correct) return calculateSRS(current ?? null, 2);
  if (current && !isDue(current, now)) return current;
  return calculateSRS(current ?? null, 5);
}
