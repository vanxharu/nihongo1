/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface VocabularyItem {
  id: string;
  kanji: string;
  hiragana: string;
  romaji?: string;
  meaning: string;
  englishMeaning?: string;
  meaningEn?: string;
  vietnameseMeaning?: string;
  hanViet?: string;
  exampleSentence: string;
  exampleFuriganaHtml?: string;
  exampleTranslation: string;
  englishExampleTranslation?: string;
  example?: string;
  exampleReading?: string;
  exampleMeaning?: string;
  exampleEn?: string;
  relatedWords?: string;
  synonyms?: string;
  antonyms?: string;
  notes?: string;
  partOfSpeech?: string;
  level: JLPTLevel;
  lessonId: string;
  lessonName: string;
  lessonTitleJp?: string;
  curriculum?: 'minna' | 'tango';
  chapter?: string;
  section?: string;
  wordType?: string;
  type?: string;
  originalNumber?: number;
  audio?: string;
  tags?: string[];
  lesson?: string;
  exampleSentenceReading?: string;
  [key: string]: any;
}

export interface GrammarExample {
  id?: string;
  japanese: string;
  hiragana?: string;
  romaji?: string;
  vietnamese: string;
  explanation?: string;
  nuance?: string;
  context?: string;
}

export interface SimilarGrammarComparison {
  similarStructure: string;
  meaning: string;
  difference: string;
  comparisonExample?: string;
}

export interface GrammarFormationRule {
  partOfSpeech: string;
  rule: string;
  example: string;
  meaning?: string;
}

export interface GrammarExercise {
  id: string;
  type: 'multiple_choice' | 'fill_in_blank' | 'sentence_reorder' | 'choose_correct_sentence' | 'error_correction' | 'situational' | 'translate' | string;
  question: string;
  choices?: string[];
  correct_answer: string;
  explanation: string;
  sentence_full?: string;
  sentence_hiragana?: string;
  translation?: string;
  context?: string;
}

export interface UserGrammarProgress {
  grammarId: string;
  status: 'new' | 'learning' | 'practicing' | 'review' | 'mastered';
  masteryScore: number; // 0 to 100
  attempts: number;
  correctCount: number;
  incorrectCount: number;
  accuracyRate: number; // 0 to 100
  lastStudiedAt?: string;
  nextReviewAt?: string;
  recentMistakes?: string[];
  needsReview?: boolean;
}

export interface GrammarAiContent {
  grammarId: string;
  grammar: string;
  level: JLPTLevel;
  overview?: string;
  formationRules?: GrammarFormationRule[];
  usageGuide?: {
    whenToUse?: string[];
    whenNotToUse?: string[];
    subjectConstraint?: string;
    nuance?: string;
  };
  notes?: string[];
  memoryTip?: string;
  similarGrammars?: SimilarGrammarComparison[];
  examples: GrammarExample[];
  exercises: GrammarExercise[];
  updatedAt?: string;
  backup?: {
    examples: GrammarExample[];
    exercises: GrammarExercise[];
    updatedAt: string;
  };
}

export interface GrammarItem {
  id: string;
  lessonId?: number;
  lessonName?: string;
  lessonNumber?: number;
  structure: string;
  meaning: string;
  explanation: string;
  exampleSentence: string;
  exampleTranslation: string;
  level: JLPTLevel;
  wordsToReorder: string[]; // for the sentence building game
  correctSentence: string;
  mergedIds?: string[];
  altStructures?: string[];
  formationRules?: GrammarFormationRule[];
  usageGuide?: {
    whenToUse?: string[];
    whenNotToUse?: string[];
    subjectConstraint?: string;
    nuance?: string;
  };
  notes?: string[];
  memoryTip?: string;
  similarGrammars?: SimilarGrammarComparison[];
  aiOverview?: string;
  overview?: string;
  examples?: GrammarExample[];
  exercises?: GrammarExercise[];
  isAiEnhanced?: boolean;
  lastAiUpdated?: string;
  userProgress?: UserGrammarProgress;
}

export interface KanjiItem {
  id: string;
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  strokesCount: number;
  level: JLPTLevel;
  exampleWords: {
    word: string;
    hiragana: string;
    meaning: string;
  }[];
  mnemonic?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  hint: string;
  options: string[];
  correctIndex: number;
  section: 'moji-goi' | 'bunpou' | 'dokkai' | 'choukai';
  explanation?: string;
  audioScript?: string;
  audioTrack?: string;
  audioUrl?: string;
  mondaiIntroAudioUrl?: string;
  mondaiIntroAudioTrack?: string;
  imageUrl?: string;
  imageSvg?: string;
  optionExplanations?: string[];
  readingPassage?: string;
  contextPassage?: string;
}

export interface DailyExam {
  id: string;
  title: string;
  level: JLPTLevel;
  year?: string;
  session?: string;
  category?: 'official_past' | 'mock_daily' | 'ai_generated';
  questions: ExamQuestion[];
  durationMinutes: number;
}

export interface ExamHistoryRecord {
  id: string;
  examId: string;
  examTitle: string;
  level: JLPTLevel;
  date: string;
  formattedDate: string;
  dateGroup: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  sectionMode: string;
  timeSpentSeconds: number;
  userAnswers: Record<string, number>;
  questionNotes?: Record<string, string>;
  examSnapshot: DailyExam;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: JLPTLevel;
  xp: number;
  weeklyXp?: number;
  monthlyXp?: number;
  streak: number;
  league?: 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';
  rank?: number;
  accuracyRate?: number;
  shadowingCount?: number;
  badge?: string;
  isCurrentUser?: boolean;
}

export interface ShadowingTokenItem {
  text: string;
  furigana?: string;
  romaji?: string;
  meaning?: string;
  hanViet?: string;
  startTimeSec?: number;
  durationSec?: number;
}

export interface ShadowingLineItem {
  id: number;
  japanese: string;
  hiragana: string;
  romaji: string;
  vietnamese: string;
  speaker: string;
  startTimeSec?: number;
  durationSec?: number;
  pitchContour?: ('H' | 'L')[];
  pitchNote?: string;
  keyVocabulary?: { word: string; reading: string; meaning: string }[];
  tokens?: ShadowingTokenItem[];
  rubyHtml?: string;
}

export interface ShadowingTrackItem {
  id: string;
  title: string;
  level: JLPTLevel;
  category: 'anime' | 'daily' | 'business' | 'news' | 'travel' | 'interview';
  categoryLabel: string;
  topic: string;
  description: string;
  duration: string;
  thumbnail?: string;
  youtubeId?: string;
  videoUrl?: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Thử thách';
  lines: ShadowingLineItem[];
}

export interface ShadowingEvaluationResult {
  score: number;
  accuracy: number;
  fluency: number;
  intonation: number;
  recognizedText: string;
  targetText: string;
  phonemeMatches: { word: string; status: 'perfect' | 'good' | 'missed' }[];
  feedback: string;
  accentTips: string[];
}

export interface ShadowingHistoryRecord {
  id: string;
  trackId: string;
  trackTitle: string;
  lineId: number;
  score: number;
  accuracy: number;
  timestamp: string;
  level: JLPTLevel;
}

export interface SRSStatus {
  interval: number; // days
  easeFactor: number;
  nextReviewDate: string; // ISO date string
  repetitions: number;
}

export interface LessonReadingSentence {
  japanese: string;
  furigana?: string;
  vietnamese: string;
}

export interface LessonReadingVocab {
  kanji: string;
  hiragana: string;
  hanViet?: string;
  meaning: string;
  sourceLesson?: string; // e.g. "Trọng tâm" | "Bài 4" | "Sec 1" | "Lân cận"
  word?: string;
  reading?: string;
  level?: string;
  partOfSpeech?: string;
}

export interface LessonReadingGrammar {
  structure: string;
  meaning: string;
  usageInPassage?: string;
  sourceLesson?: string; // e.g. "Trọng tâm" | "Bài 4" | "Sec 1" | "Lân cận"
  point?: string;
  level?: string;
  explanation?: string;
  example?: string;
  exampleMeaning?: string;
}

export interface LessonReadingQuiz {
  question: string;
  questionType?: string; // '内容理解' | '情報検索' | '指示語' | '理由' | '心情理解' | '要旨' | '筆者の意見' | '文章構成' | '比較理解'
  questionTypeVn?: string; // 'Nội dung chính' | 'Tìm kiếm thông tin' | 'Từ chỉ thị' | 'Hỏi lý do' | 'Tâm trạng nhân vật' | 'Tóm tắt bài văn' | 'Quan điểm tác giả' | 'Cấu trúc bài' | 'So sánh văn bản'
  tips?: string; // Mẹo làm nhanh cho dạng câu hỏi này
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AudioMark {
  time: number; // in milliseconds
  value: string; // character or word
}

export interface LessonReadingData {
  title: string;
  level: JLPTLevel;
  lessonNumber?: number;
  lessonName?: string;
  passageType?: string; // '情報検索 (Thông báo / Email)' | '内容理解 (Bài văn ngắn - Ý chính)' | '随筆・心情理解 (Tùy bút - Tâm trạng)' | '論説文 (Quan điểm tác giả)' | '比較読解 (So sánh văn bản)'
  part?: number; // 1 or 2
  totalParts?: number; // 1 or 2
  partVocabRange?: string; // e.g. "Phần 1: 25 từ đầu"
  adjacentLessonsIncluded?: string[]; // Danh sách bài lân cận được kết hợp (ví dụ: ["Bài 4", "Bài 6"])
  japanesePassage: string;
  furiganaPassage?: string;
  vietnamesePassage: string;
  sentenceBreakdown: LessonReadingSentence[];
  vocabularyList: LessonReadingVocab[];
  usedGrammar?: LessonReadingGrammar[];
  quizzes: LessonReadingQuiz[];
  audioUrl?: string; // Audio phát âm bản xứ từ bài báo Todaii
  audioMarks?: AudioMark[]; // Dấu thời gian karaoke đồng bộ chữ chạy theo giọng đọc bản xứ từ Todaii
  imageUrl?: string; // Ảnh minh họa bài báo
  sourceName?: string; // e.g. "Todaii Japanese News" | "Tự nhập"
  sourceUrl?: string; // Link bài báo gốc
  titleVi?: string; // Tiêu đề dịch tiếng Việt
  jlptStats?: JlptStats; // Thống kê phân bổ tỷ lệ cấp độ JLPT (N5-N1)
  levelWords?: Record<string, string[]>; // Danh sách từ vựng theo từng cấp độ JLPT
  rawTokens?: ReadingToken[]; // Tokens phân tách có gắn Furigana & cấp độ JLPT từng từ
  posMap?: Record<string, 'noun' | 'verb' | 'adjective' | 'other'>; // Bảng phân loại từ loại (Danh từ, Động từ, Tính từ)
}

export interface JlptStats {
  n1: number;
  n2: number;
  n3: number;
  n4: number;
  n5: number;
  n1Percent: number;
  n2Percent: number;
  n3Percent: number;
  n4Percent: number;
  n5Percent: number;
  total: number;
}

export interface ReadingToken {
  text: string;
  furigana?: string | null;
  jlpt?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | null;
  word?: string;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'other' | string | null;
}

export interface TodaiNewsItem {
  id: string;
  titleJp: string;
  titleVi: string;
  date: string;
  image?: string;
  audio?: string;
  topic?: string;
  jlptLevel: JLPTLevel;
  views?: number;
  url: string;
  snippet?: string;
}

export interface WatanocArticleItem {
  id: string;
  titleJp: string;
  titleSub?: string;
  rawTitle: string;
  url: string;
  image?: string;
  audio?: string;
  hasAudio?: boolean;
  snippet?: string;
  level: JLPTLevel | 'All';
  date?: string;
  category?: string;
}

export interface LearningPosition {
  tab: string; // 'vocabulary' | 'grammar' | 'kanji' | 'reading' | 'exam' | 'japanese-chat' | 'progress'
  level?: JLPTLevel; // 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  curriculum?: 'minna' | 'tango';
  lessonId?: string; // e.g., 'n5_mn1' or 'lesson_1'
  lessonName?: string; // e.g., 'Bài 1: Chào hỏi'
  lessonNumber?: number; // e.g. 1
  itemId?: string; // e.g. 'v_101', 'g_5', or '日'
  itemIndex?: number; // card/item index (0, 1, 2...)
  subTab?: string; // subtab or view mode
  mode?: string; // 'flashcard' | 'quiz' | 'cram' | 'dokkai' | etc.
  timestamp?: string; // ISO date string
}

export interface StudyRoadmapConfig {
  targetLevel: JLPTLevel;
  durationDays: 30 | 60 | 90;
  startDate: string; // YYYY-MM-DD
  currentDay: number;
  completedDays: number[];
}

export interface UserProfile {
  name: string;
  avatar: string;
  targetLevel: JLPTLevel;
  selectedCurriculum?: 'minna' | 'tango';
  xp: number;
  streak: number;
  coins: number;
  streakFreezes?: number;
  lastActiveDate?: string;
  studyDays: string[]; // YYYY-MM-DD
  completedLessons: (string | number)[]; // List of vocab lessonIds completed
  vocabStatus: Record<string, 'new' | 'learning' | 'mastered' | SRSStatus>;
  grammarStatus: Record<string, any>; // true if passed or UserGrammarProgress state object
  kanjiStatus: Record<string, boolean>; // true if passed drawing test
  dailyTestResults: { date: string; score: number; total: number }[];
  lastPosition?: LearningPosition;
  notificationSettings?: any;
  shadowingStats?: {
    totalSessions: number;
    avgScore: number;
    completedLines: number;
    history: ShadowingHistoryRecord[];
  };
  studyRoadmap?: StudyRoadmapConfig;
  unlockedBadges?: string[];
  role?: 'user' | 'admin';
  isVip?: boolean;
  notebooks?: NotebookFolder[];
  savedWords?: NotebookWord[];
  savedVocab?: Array<{ word: string; reading?: string; meaning?: string; hanViet?: string; level?: string; example?: string; exampleMeaning?: string }>;
}

export interface NotebookFolder {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: string;
}

export interface NotebookWord {
  id: string;
  kanji: string;
  furigana?: string;
  romaji?: string;
  meaning: string;
  hanViet?: string;
  example?: string;
  exampleMeaning?: string;
  level?: JLPTLevel;
  note?: string;
  dateAdded: string;
  mastered?: boolean;
  reviewCount?: number;
  notebookId: string;
  source?: 'reading' | 'dictionary' | 'video' | 'lesson' | 'manual' | 'exam';
}

export interface DictionaryWord {
  id: string;
  kanji: string;
  hiragana: string;
  romaji?: string;
  hanViet?: string;
  meaning: string;
  partOfSpeech?: string;
  level?: JLPTLevel;
  kanjiBreakdown?: {
    character: string;
    hanViet?: string;
    strokes?: number;
    radical?: string;
    onyomi?: string;
    kunyomi?: string;
    meaning?: string;
  }[];
  examples?: {
    japanese: string;
    furigana?: string;
    vietnamese: string;
  }[];
  grammarNotes?: string;
  audioUrl?: string;
}

export interface StudyBookQuestion {
  id: string;
  number: number;
  question: string;
  contextText?: string;
  options: string[];
  correctIndex: number;
  hint?: string;
  explanation: string;
  sectionTitle?: string;
  type?: 'multiple_choice' | 'star_reorder' | 'reading_passage';
  targetWord?: string;
}

export interface StudyBookUnit {
  id: string;
  unitNumber: number | string;
  title: string;
  japaneseTitle: string;
  pageRange?: string;
  topic?: string;
  description?: string;
  questions: StudyBookQuestion[];
}

export interface StudyBook {
  id: string;
  title: string;
  japaneseTitle: string;
  author: string;
  publisher: string;
  level: JLPTLevel;
  coverBadge: string;
  description: string;
  themeColor: string;
  gradient: string;
  totalQuestions: number;
  units: StudyBookUnit[];
  category?: 'Vocabulary' | 'Grammar' | 'Reading' | 'Mock Test';
  estimatedHours?: number;
  learnersCount?: string;
}

export interface StudyBookSavedProgress {
  bookId: string;
  unitId: string;
  questionIndex: number;
  updatedAt: string;
  answers: Record<string, number>;
  checkedQuestions: Record<string, boolean>;
}

// ==========================================
// JLPT LISTENING (YOUTUBE EMBED SYSTEM) TYPES
// ==========================================

export type YouTubeListeningCategory = 
  | 'Official Sample' 
  | 'Sample Exam' 
  | 'Listening Practice' 
  | 'Mock Test' 
  | 'JLPT-style';

export interface YouTubeListeningVideo {
  id: string;
  title: string;
  code?: string; // e.g. "N5 Listening 01"
  youtube_url: string;
  youtube_video_id: string;
  level: JLPTLevel;
  category: YouTubeListeningCategory;
  source: string;
  source_url?: string;
  description: string;
  duration?: string; // e.g. "32:15"
  durationSeconds?: number;
  thumbnail?: string;
  has_answers: boolean;
  status: 'active' | 'hidden';
  publishedDate?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserVideoProgress {
  videoId: string;
  currentTime: number; // in seconds
  duration: number; // in seconds
  completed: boolean;
  progressPercent: number; // 0 - 100
  bookmarked: boolean;
  lastWatchedAt: string; // ISO timestamp
  updatedAt?: number; // epoch milliseconds for multi-device & offline synchronization
}

export interface YouTubeListeningStats {
  totalVideos: number;
  completedCount: number;
  inProgressCount: number;
  bookmarkedCount: number;
  totalWatchedSeconds: number;
  levelStats: Record<JLPTLevel, { total: number; completed: number; inProgress: number }>;
}



