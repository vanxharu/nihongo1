import { 
  ListeningExamAttempt, 
  ListeningExamResumeState 
} from '../types/listeningExamTypes';

const EXAM_RESUME_PREFIX = 'jlpt_listening_resume_';
const EXAM_HISTORY_STORAGE_KEY = 'jlpt_listening_exam_history';

/**
 * ProgressManager & ExamAttemptManager:
 * Chịu trách nhiệm quản lý trạng thái làm bài dở dang và lịch sử thi nghe JLPT.
 * Tách biệt hoàn toàn với Video Progress (thời gian phát video trên YouTube).
 */

// 1. Get in-progress exam state
export function getExamResumeState(examIdOrVideoId: string): ListeningExamResumeState | null {
  if (!examIdOrVideoId || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${EXAM_RESUME_PREFIX}${examIdOrVideoId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

// 2. Get all active in-progress exams
export function getAllActiveExamResumes(): ListeningExamResumeState[] {
  if (typeof window === 'undefined') return [];
  const results: ListeningExamResumeState[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(EXAM_RESUME_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed && parsed.answeredCount > 0 && parsed.answeredCount < parsed.totalQuestions) {
            results.push(parsed);
          }
        }
      }
    }
  } catch {}
  return results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

// 3. Save in-progress exam state
export function saveExamResumeState(state: ListeningExamResumeState, userId: string = 'default_user'): void {
  if (!state || !state.youtubeVideoId || typeof window === 'undefined') return;
  try {
    const key = `${EXAM_RESUME_PREFIX}${state.youtubeVideoId}`;
    localStorage.setItem(key, JSON.stringify(state));

    // Also persist by examId if different
    if (state.examId && state.examId !== state.youtubeVideoId) {
      localStorage.setItem(`${EXAM_RESUME_PREFIX}${state.examId}`, JSON.stringify(state));
    }

    // Sync to server async
    fetch('/api/listening/exam-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, state })
    }).catch(() => {});
  } catch {}
}

// 4. Clear in-progress exam state upon completion or explicit reset
export function clearExamResumeState(examIdOrVideoId: string, userId: string = 'default_user'): void {
  if (!examIdOrVideoId || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${EXAM_RESUME_PREFIX}${examIdOrVideoId}`);

    // Sync to server
    fetch(`/api/listening/exam-resume?userId=${encodeURIComponent(userId)}&videoId=${encodeURIComponent(examIdOrVideoId)}`, {
      method: 'DELETE'
    }).catch(() => {});
  } catch {}
}

// 5. Get exam attempts history from local storage
export function getLocalExamHistory(): ListeningExamAttempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EXAM_HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 6. Save completed exam attempt
export function saveExamAttempt(attempt: ListeningExamAttempt, userId: string = 'default_user'): void {
  if (!attempt || !attempt.attemptId || typeof window === 'undefined') return;

  try {
    const existing = getLocalExamHistory();
    // Prepend new attempt
    const updated = [attempt, ...existing.filter(a => a.attemptId !== attempt.attemptId)];
    localStorage.setItem(EXAM_HISTORY_STORAGE_KEY, JSON.stringify(updated));

    // Also clear in-progress state since it's completed
    clearExamResumeState(attempt.youtubeVideoId, userId);
    if (attempt.examId) {
      clearExamResumeState(attempt.examId, userId);
    }

    // Sync to backend server
    fetch('/api/listening/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, attempt })
    }).catch(() => {});
  } catch {}
}

// 7. Load full exam history from server with fallback to local
export async function loadExamHistory(userId: string = 'default_user'): Promise<ListeningExamAttempt[]> {
  try {
    const res = await fetch(`/api/listening/attempts?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.attempts)) {
      // Merge with local storage
      const local = getLocalExamHistory();
      const map: Record<string, ListeningExamAttempt> = {};
      data.attempts.forEach((a: ListeningExamAttempt) => { map[a.attemptId] = a; });
      local.forEach((a: ListeningExamAttempt) => {
        if (!map[a.attemptId]) map[a.attemptId] = a;
      });
      const merged = Object.values(map).sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      localStorage.setItem(EXAM_HISTORY_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {}
  return getLocalExamHistory();
}
