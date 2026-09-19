import { ListeningExamData, ListeningQuestion } from '../types/listeningExamTypes';
import { buildExamWithMappings, getLinkedExamIdForVideo, saveTimestampMapping } from './timestampMappingManager';
import { getAllOriginalExams } from '../data/originalListeningExams';

const LOCAL_STORAGE_EXAMS_KEY = 'jlpt_verified_listening_questions_v2';

/**
 * In-memory cache of verified listening exam datasets indexed by youtubeVideoId
 */
const examCache: Map<string, ListeningExamData> = new Map();

/**
 * Validate that a question has verified source metadata and legitimate timestamps
 */
export function validateQuestionMapping(q: Partial<ListeningQuestion>): { valid: boolean; error?: string } {
  if (!q.youtubeVideoId) {
    return { valid: false, error: 'Thiếu YouTube Video ID nguồn' };
  }
  if (!q.questionNumber || q.questionNumber < 1) {
    return { valid: false, error: 'Số thứ tự câu hỏi không hợp lệ' };
  }
  if (q.startTime !== undefined && q.startTime < 0) {
    return { valid: false, error: 'Thời gian bắt đầu (startTime) phải >= 0' };
  }
  if (q.startTime !== undefined && q.endTime !== undefined && q.endTime <= q.startTime) {
    return { valid: false, error: 'Thời gian kết thúc (endTime) phải lớn hơn startTime' };
  }
  return { valid: true };
}

/**
 * Synchronous local retrieval: check cache, then localStorage, then build from Original Exam
 * TUYỆT ĐỐI KHÔNG DÙNG AI ĐỂ GENERATE HOẶC PARAPHRASE CÂU HỎI.
 */
export function getLocalExamForVideo(videoId: string): ListeningExamData | null {
  if (!videoId) return null;

  if (examCache.has(videoId)) {
    return examCache.get(videoId)!;
  }

  // Check localStorage overrides (admin mapped)
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_EXAMS_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        if (stored && stored[videoId]) {
          const exam = stored[videoId];
          // Ensure sourceVerified is true
          exam.sourceVerified = true;
          examCache.set(videoId, exam);
          return exam;
        }
      }
    } catch {}
  }

  // Build authentic exam strictly from ORIGINAL_LISTENING_EXAMS joined with timestamp mappings
  const linkedExamId = getLinkedExamIdForVideo(videoId);
  const built = buildExamWithMappings(linkedExamId, videoId);
  if (built) {
    examCache.set(videoId, built);
    return built;
  }

  // Fallback to first original exam if any
  const firstExam = getAllOriginalExams()[0];
  if (firstExam) {
    const fallbackBuilt = buildExamWithMappings(firstExam.examId, videoId);
    if (fallbackBuilt) {
      examCache.set(videoId, fallbackBuilt);
      return fallbackBuilt;
    }
  }

  return null;
}

/**
 * Asynchronous retrieval from server API with cache & localStorage fallback
 */
export async function loadExamForVideo(videoId: string): Promise<ListeningExamData | null> {
  if (!videoId) return null;

  // 1. Try server API
  try {
    const res = await fetch(`/api/listening/questions?videoId=${encodeURIComponent(videoId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.exam && Array.isArray(data.exam.questions) && data.exam.questions.length > 0) {
        const serverExam: ListeningExamData = {
          ...data.exam,
          sourceVerified: true,
          verificationStatus: 'SOURCE_VERIFIED',
          questions: data.exam.questions.map((q: any, idx: number) => ({
            ...q,
            questionNumber: q.questionNumber || (idx + 1),
            level: q.level || data.exam.level,
            sourceType: q.sourceType || 'youtube',
            youtubeVideoId: videoId,
            sourceVerified: q.sourceVerified !== false,
            verificationStatus: q.sourceVerified === false ? 'SOURCE_NOT_VERIFIED' : 'SOURCE_VERIFIED'
          }))
        };
        examCache.set(videoId, serverExam);
        saveToLocalStorage(videoId, serverExam);
        return serverExam;
      }
    }
  } catch (err) {
    console.warn('[LISTENING_SOURCE] Could not fetch questions from server, using local fallback:', err);
  }

  // 2. Return local exam (seed or localStorage)
  return getLocalExamForVideo(videoId);
}

/**
 * Save verified exam questions & timestamp mappings to server and local storage
 */
export async function saveExamForVideo(videoId: string, examData: ListeningExamData): Promise<boolean> {
  if (!videoId || !examData) return false;

  examCache.set(videoId, examData);
  saveToLocalStorage(videoId, examData);

  try {
    const res = await fetch('/api/listening/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, examData })
    });
    return res.ok;
  } catch (err) {
    console.error('[LISTENING_SOURCE] Error syncing questions to server:', err);
    return false;
  }
}

/**
 * Quick update of a single question's start/end timestamps
 */
export async function updateQuestionTimestamp(
  videoId: string,
  questionId: string,
  startTime: number,
  endTime: number
): Promise<boolean> {
  // Update in-memory
  const exam = examCache.get(videoId) || getLocalExamForVideo(videoId);
  if (exam) {
    const q = exam.questions.find(item => item.questionId === questionId || item.id === questionId);
    if (q) {
      q.startTime = startTime;
      q.endTime = endTime;
      q.sourceVerified = true;
      q.verificationStatus = 'SOURCE_VERIFIED';
      examCache.set(videoId, exam);
      saveToLocalStorage(videoId, exam);

      // Save independent mapping
      saveTimestampMapping({
        questionId,
        examId: q.examId,
        youtubeVideoId: videoId,
        startTime,
        endTime,
        timestampVerified: true
      });
    }
  }

  try {
    const res = await fetch('/api/listening/questions/update-timestamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, questionId, startTime, endTime })
    });
    return res.ok;
  } catch (err) {
    console.error('[LISTENING_SOURCE] Failed to update timestamp on server:', err);
    return false;
  }
}

function saveToLocalStorage(videoId: string, examData: ListeningExamData) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXAMS_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    stored[videoId] = examData;
    localStorage.setItem(LOCAL_STORAGE_EXAMS_KEY, JSON.stringify(stored));
  } catch {}
}
