import { 
  ListeningQuestion, 
  ListeningQuestionResult, 
  ListeningExamAttempt, 
  ListeningDashboardStats 
} from '../types/listeningExamTypes';
import { JLPTLevel } from '../types';

export interface ScoreCalculationResult {
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  accuracy: number; // e.g. 80
  estimatedScore: number; // e.g. 32-40 out of 50
  maxScore: number; // 50
  questionResults: ListeningQuestionResult[];
}

/**
 * ScoringManager: Chịu trách nhiệm chấm điểm bài nghe và tính điểm luyện tập ước tính
 */
export function calculateEstimatedScore(
  questions: ListeningQuestion[],
  selectedAnswers: Record<string, number>
): ScoreCalculationResult {
  const total = questions.length;
  if (total === 0) {
    return {
      correct: 0,
      incorrect: 0,
      unanswered: 0,
      total: 0,
      accuracy: 0,
      estimatedScore: 0,
      maxScore: 50,
      questionResults: []
    };
  }

  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  const questionResults: ListeningQuestionResult[] = questions.map((q) => {
    const userAns = selectedAnswers[q.questionId] ?? null;
    const targetAns = q.correctAnswer ?? q.answer;
    const isCorrect = userAns !== null && userAns === targetAns;

    if (userAns === null) {
      unanswered++;
    } else if (isCorrect) {
      correct++;
    } else {
      incorrect++;
    }

    return {
      questionId: q.questionId,
      questionType: q.questionType,
      questionText: q.questionText || q.question,
      options: q.options,
      selectedAnswer: userAns,
      correctAnswer: targetAns,
      isCorrect,
      explanation: q.explanation,
      transcript: q.transcript,
      startTime: q.startTime,
      endTime: q.endTime
    };
  });

  const accuracy = Math.round((correct / total) * 100);

  // Điểm luyện tập ước tính trên thang 50 (Chuẩn hóa luyện thi JLPT Choukai)
  // Lưu ý: Điểm JLPT thực tế dùng thuật toán IRT (Item Response Theory)
  const estimatedScore = Math.min(50, Math.max(0, Math.round((correct / total) * 50)));

  return {
    correct,
    incorrect: incorrect + unanswered,
    unanswered,
    total,
    accuracy,
    estimatedScore,
    maxScore: 50,
    questionResults
  };
}

/**
 * Aggregate dashboard statistics from listening history
 */
export function computeListeningDashboardStats(
  attempts: ListeningExamAttempt[]
): ListeningDashboardStats {
  if (!attempts || attempts.length === 0) {
    return {
      totalExamsTaken: 0,
      totalQuestionsAnswered: 0,
      totalQuestionsCorrect: 0,
      overallAccuracy: 0,
      averageEstimatedScore: 0,
      bestEstimatedScore: 0,
      typeStats: {},
      progression: []
    };
  }

  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalScoreSum = 0;
  let bestScore = 0;

  const typeMap: Record<string, { total: number; correct: number }> = {};

  attempts.forEach((att) => {
    totalQuestions += att.total || 0;
    totalCorrect += att.correct || 0;
    totalScoreSum += att.estimatedScore || 0;
    if (att.estimatedScore > bestScore) {
      bestScore = att.estimatedScore;
    }

    // Process per question type
    if (Array.isArray(att.questionResults)) {
      att.questionResults.forEach((qr) => {
        const typeKey = qr.questionType || 'Khác';
        if (!typeMap[typeKey]) {
          typeMap[typeKey] = { total: 0, correct: 0 };
        }
        typeMap[typeKey].total += 1;
        if (qr.isCorrect) {
          typeMap[typeKey].correct += 1;
        }
      });
    }
  });

  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const averageEstimatedScore = attempts.length > 0 ? Math.round(totalScoreSum / attempts.length) : 0;

  const typeStats: Record<string, { total: number; correct: number; accuracy: number }> = {};
  Object.keys(typeMap).forEach((k) => {
    const item = typeMap[k];
    typeStats[k] = {
      total: item.total,
      correct: item.correct,
      accuracy: item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0
    };
  });

  // Progression sorted chronologically (oldest to newest for charting)
  const sorted = [...attempts].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const progression = sorted.map((att, idx) => ({
    attemptId: att.attemptId,
    examTitle: att.examTitle,
    shortTitle: `Đề ${(idx + 1).toString().padStart(2, '0')}`,
    level: att.level,
    date: att.completedAt,
    correct: att.correct,
    total: att.total,
    accuracy: att.accuracy,
    estimatedScore: att.estimatedScore
  }));

  return {
    totalExamsTaken: attempts.length,
    totalQuestionsAnswered: totalQuestions,
    totalQuestionsCorrect: totalCorrect,
    overallAccuracy,
    averageEstimatedScore,
    bestEstimatedScore: bestScore,
    typeStats,
    progression
  };
}
