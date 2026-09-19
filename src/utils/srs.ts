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

  return {
    interval,
    easeFactor,
    nextReviewDate: nextReviewDate.toISOString(),
    repetitions,
  };
}
