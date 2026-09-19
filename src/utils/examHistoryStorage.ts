import { DailyExam, ExamHistoryRecord, JLPTLevel } from '../types';

const STORAGE_KEY = 'nihongo_jlpt_exam_history_v1';

export function getExamHistory(): ExamHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load exam history from localStorage:', err);
    return [];
  }
}

export function saveExamAttempt(params: {
  examId: string;
  examTitle: string;
  level: JLPTLevel;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  sectionMode: string;
  timeSpentSeconds: number;
  userAnswers: Record<string, number>;
  questionNotes?: Record<string, string>;
  examSnapshot: DailyExam;
}): ExamHistoryRecord {
  const now = new Date();
  const dateISO = now.toISOString();

  // Format date e.g. "07/09/2026, 11:45"
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const formattedDate = `${day}/${month}/${year}, ${hours}:${minutes}`;

  // Date grouping: "Hôm nay, 07/09/2026", "Hôm qua, 06/09/2026", etc.
  const todayDateStr = `${day}/${month}/${year}`;
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayDateStr = `${String(yesterday.getDate()).padStart(2, '0')}/${String(yesterday.getMonth() + 1).padStart(2, '0')}/${yesterday.getFullYear()}`;

  let dateGroup = `Ngày ${todayDateStr}`;
  if (todayDateStr === `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`) {
    dateGroup = `Hôm nay (${todayDateStr})`;
  }

  const record: ExamHistoryRecord = {
    id: `exam_hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    examId: params.examId,
    examTitle: params.examTitle,
    level: params.level,
    date: dateISO,
    formattedDate,
    dateGroup,
    score: params.score,
    totalQuestions: params.totalQuestions,
    percentage: params.percentage,
    passed: params.passed,
    sectionMode: params.sectionMode,
    timeSpentSeconds: params.timeSpentSeconds,
    userAnswers: params.userAnswers,
    questionNotes: params.questionNotes,
    examSnapshot: params.examSnapshot
  };

  try {
    const history = getExamHistory();
    // Add to top of list
    const updated = [record, ...history];
    // Keep max 50 records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch (err) {
    console.error('Failed to save exam history record:', err);
  }

  return record;
}

export function deleteExamAttempt(id: string): void {
  try {
    const history = getExamHistory();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete exam history record:', err);
  }
}

export function clearAllExamHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear exam history:', err);
  }
}

export function groupHistoryByDate(records: ExamHistoryRecord[]): Record<string, ExamHistoryRecord[]> {
  const grouped: Record<string, ExamHistoryRecord[]> = {};
  for (const record of records) {
    const groupKey = record.dateGroup || 'Khác';
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(record);
  }
  return grouped;
}
