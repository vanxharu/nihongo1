import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  avatar: text('avatar'),
  targetLevel: varchar('target_level', { length: 10 }),
  xp: integer('xp').default(0),
  streak: integer('streak').default(0),
  coins: integer('coins').default(0),
  lastActiveDate: text('last_active_date'),
  studyDays: text('study_days'), // Stored as JSON string
  completedLessons: text('completed_lessons'), // Stored as JSON string
  vocabStatus: text('vocab_status'), // Stored as JSON string
  grammarStatus: text('grammar_status'), // Stored as JSON string
  kanjiStatus: text('kanji_status'), // Stored as JSON string
  dailyTestResults: text('daily_test_results'), // Stored as JSON string
  lastPosition: text('last_position'), // Stored as JSON string (current tab, lesson, level, item index)
  notificationSettings: text('notification_settings'), // Stored as JSON string (font size, colors, themes, schedules)
  role: varchar('role', { length: 20 }).default('user'), // 'user' or 'admin'
  isVip: boolean('is_vip').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  lessonNumber: integer('lesson_number').notNull(),
  titleVi: varchar('title_vi', { length: 255 }).notNull(),
  titleJp: varchar('title_jp', { length: 255 }).notNull(),
});

export const vocabularies = pgTable('vocabularies', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  word: varchar('word', { length: 255 }).notNull(),
  kanji: varchar('kanji', { length: 255 }),
  reading: varchar('reading', { length: 255 }).notNull(),
  meaning: varchar('meaning', { length: 255 }).notNull(),
  romaji: varchar('romaji', { length: 255 }),
  type: varchar('type', { length: 255 }),
  exampleJp: text('example_jp'),
  exampleVi: text('example_vi'),
});

export const grammars = pgTable('grammars', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  structure: varchar('structure', { length: 255 }).notNull(),
  meaning: varchar('meaning', { length: 255 }).notNull(),
  explanation: text('explanation'),
  exampleJp: text('example_jp'),
  exampleVi: text('example_vi'),
});

export const lessonsRelations = relations(lessons, ({ many }) => ({
  vocabularies: many(vocabularies),
  grammars: many(grammars),
}));

export const vocabulariesRelations = relations(vocabularies, ({ one }) => ({
  lesson: one(lessons, {
    fields: [vocabularies.lessonId],
    references: [lessons.id],
  }),
}));

export const grammarsRelations = relations(grammars, ({ one }) => ({
  lesson: one(lessons, {
    fields: [grammars.lessonId],
    references: [lessons.id],
  }),
}));

export const kanjis = pgTable('kanjis', {
  id: serial('id').primaryKey(),
  lesson: integer('lesson').notNull(),
  kanji: varchar('kanji', { length: 255 }).notNull(),
  meaningVi: varchar('meaning_vi', { length: 255 }).notNull(),
  onyomi: varchar('onyomi', { length: 255 }),
  kunyomi: varchar('kunyomi', { length: 255 }),
  examples: text('examples'),
});

export const grammarAiContents = pgTable('grammar_ai_contents', {
  id: serial('id').primaryKey(),
  grammarId: varchar('grammar_id', { length: 100 }).notNull().unique(),
  grammarStructure: varchar('grammar_structure', { length: 255 }).notNull(),
  level: varchar('level', { length: 10 }).notNull(),
  overview: text('overview'),
  formationRulesJson: text('formation_rules_json'),
  usageGuideJson: text('usage_guide_json'),
  notesJson: text('notes_json'),
  memoryTip: text('memory_tip'),
  similarGrammarsJson: text('similar_grammars_json'),
  examplesJson: text('examples_json').notNull(),
  exercisesJson: text('exercises_json').notNull(),
  backupJson: text('backup_json'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userGrammarProgress = pgTable('user_grammar_progress', {
  id: serial('id').primaryKey(),
  userUid: varchar('user_uid', { length: 100 }).notNull(),
  grammarId: varchar('grammar_id', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).default('new'),
  masteryScore: integer('mastery_score').default(0),
  attempts: integer('attempts').default(0),
  correctCount: integer('correct_count').default(0),
  incorrectCount: integer('incorrect_count').default(0),
  accuracyRate: text('accuracy_rate').default('0'),
  lastStudiedAt: timestamp('last_studied_at').defaultNow(),
  nextReviewAt: timestamp('next_review_at'),
  recentMistakesJson: text('recent_mistakes_json'),
});
