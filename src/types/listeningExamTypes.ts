import { JLPTLevel } from '../types';

export type ExtractionMethod = 'OCR' | 'TRANSCRIPT' | 'MANUAL_VERIFIED' | 'SOURCE_DOCUMENT' | 'AUDIO_TRANSCRIPTION';
export type QuestionExtractionStatus = 'PENDING' | 'EXTRACTING' | 'EXTRACTED' | 'NEEDS_VERIFICATION' | 'VERIFIED' | 'PUBLISHED' | 'ERROR' | 'OCR_UNCERTAIN';

/**
 * 1. ORIGINAL EXAM DATA (Dữ liệu đề thi gốc)
 * Tuyệt đối không sinh từ AI. Quản lý bất biến theo đề thi chuẩn JLPT.
 */
export interface OriginalQuestion {
  examId: string;
  questionId: string;
  level: JLPTLevel;
  questionNumber: number;
  questionType: string; // e.g. "問題1", "問題2", "問題3", "問題4"
  questionText: string;
  questionTextJa?: string;
  questionTextVi?: string;
  options: string[];
  optionsJa?: string[];
  optionsVi?: string[];
  correctAnswer: number | null; // 1-based (1, 2, 3, 4) or null if unverified
  sourceVerified: boolean; // Must be true for real authentic exams
  extractionMethod?: ExtractionMethod;
  extractionStatus?: QuestionExtractionStatus;
  ocrConfidence?: number;
  transcript?: string;
  explanation?: string;
  // Frame & timing distinctions
  questionDisplayStartTime?: number;
  listeningStartTime?: number;
  listeningEndTime?: number;
  answerDisplayStartTime?: number;
  frameImageUrl?: string;
}

export interface OriginalExam {
  examId: string;
  title: string;
  level: JLPTLevel;
  year?: string;
  session?: string;
  description?: string;
  totalQuestions: number;
  questions: OriginalQuestion[];
}

/**
 * 2. YOUTUBE TIMESTAMP MAPPING DATA (Dữ liệu mapping thời gian phát)
 * Quản lý độc lập theo questionId, youtubeVideoId và khoảng thời gian phát (giây)
 */
export interface YouTubeTimestampMapping {
  questionId: string;
  examId?: string;
  youtubeVideoId: string;
  startTime: number; // listeningStartTime in seconds
  endTime: number;   // listeningEndTime in seconds
  questionDisplayStartTime?: number;
  listeningStartTime?: number;
  listeningEndTime?: number;
  answerDisplayStartTime?: number;
  timestampVerified: boolean; // true after admin verifies
  suggestedStartTime?: number;
  suggestedEndTime?: number;
  extractionMethod?: ExtractionMethod;
  extractionStatus?: QuestionExtractionStatus;
  ocrConfidence?: number;
  frameImageUrl?: string;
  updatedAt?: string;
}

/**
 * Combined view model for UI player & exam engine
 */
export interface ListeningQuestion {
  id?: string;
  questionId: string;
  examId?: string;
  level?: JLPTLevel;
  sourceType?: 'youtube' | 'official_sample' | 'past_exam' | 'manual' | 'audio-transcription';
  youtubeVideoId: string;
  questionNumber?: number;
  questionType: string; // e.g. "問題1", "問題2", "問題3", "問題4", "問題5"
  question: string;
  questionText?: string;
  questionTextJa?: string; // Nguyên bản tiếng Nhật
  questionTextVi?: string; // Bản dịch tiếng Việt nếu có
  options: string[];
  optionsJa?: string[];
  optionsVi?: string[];
  answer: number; // 1-based (1, 2, 3, 4)
  correctAnswer?: number | null; // alias for answer, null if ANSWER_NOT_VERIFIED
  sourceVerified?: boolean; // TRUE only if verified from real original source!
  timestampVerified?: boolean; // TRUE only if timestamp is verified!
  verificationStatus?: 'SOURCE_VERIFIED' | 'SOURCE_NOT_VERIFIED' | 'QUESTION_MAPPING_REQUIRED';
  extractionMethod?: ExtractionMethod;
  extractionStatus?: QuestionExtractionStatus;
  ocrConfidence?: number;
  frameImageUrl?: string;
  explanation?: string;
  transcript?: string;
  startTime?: number; // listeningStartTime in seconds
  endTime?: number;   // listeningEndTime in seconds
  questionDisplayStartTime?: number;
  listeningStartTime?: number;
  listeningEndTime?: number;
  answerDisplayStartTime?: number;
  audioNote?: string;
}

export interface ListeningExamData {
  id: string;
  youtubeVideoId: string;
  title: string;
  level: JLPTLevel;
  questionType: string; // e.g. "問題1" or "Tổng hợp (Mondai 1-4)"
  description?: string;
  sourceVerified?: boolean;
  verificationStatus?: 'SOURCE_VERIFIED' | 'SOURCE_NOT_VERIFIED' | 'QUESTION_MAPPING_REQUIRED';
  questions: ListeningQuestion[];
}

export interface ListeningQuestionResult {
  questionId: string;
  questionType: string;
  questionText: string;
  options: string[];
  selectedAnswer: number | null; // 1-based (1..4) or null
  correctAnswer: number;         // 1-based (1..4)
  isCorrect: boolean;
  explanation?: string;
  transcript?: string;
  startTime?: number;
  endTime?: number;
}

export interface ListeningExamAttempt {
  attemptId: string;
  examId: string;
  youtubeVideoId: string;
  examTitle: string;
  level: JLPTLevel;
  mode: 'practice' | 'exam';
  correct: number;
  total: number;
  accuracy: number; // percentage, e.g. 80
  estimatedScore: number; // estimated score out of 50, e.g. 32
  maxScore: number; // 50
  completedAt: string; // ISO date
  timeSpentSeconds: number;
  questionResults: ListeningQuestionResult[];
}

export interface ListeningExamResumeState {
  examId: string;
  youtubeVideoId: string;
  title: string;
  level: JLPTLevel;
  mode: 'practice' | 'exam';
  currentQuestionIndex: number;
  selectedAnswers: Record<string, number>; // questionId -> chosen answer (1..4)
  checkedQuestions: Record<string, boolean>; // for practice mode
  answeredCount: number;
  totalQuestions: number;
  savedVideoTime: number; // currentTime in seconds
  replayCount: Record<string, number>; // questionId -> count
  examConfig: {
    replayLimit: number; // 0 = unlimited, 1 = 1 time, 2 = 2 times
    lockSeeking: boolean;
  };
  updatedAt: number; // epoch ms
}

export interface ListeningDashboardStats {
  totalExamsTaken: number;
  totalQuestionsAnswered: number;
  totalQuestionsCorrect: number;
  overallAccuracy: number; // percentage
  averageEstimatedScore: number; // out of 50
  bestEstimatedScore: number; // out of 50
  typeStats: Record<string, { total: number; correct: number; accuracy: number }>;
  progression: Array<{
    attemptId: string;
    examTitle: string;
    shortTitle: string;
    level: JLPTLevel;
    date: string;
    correct: number;
    total: number;
    accuracy: number;
    estimatedScore: number;
  }>;
}
