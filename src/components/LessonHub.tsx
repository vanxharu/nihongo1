/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Circle, 
  Volume2, 
  Bookmark, 
  Sparkles, 
  Layers, 
  BrainCircuit, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  Check, 
  ArrowLeft,
  RotateCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { JLPTLevel, UserProfile, VocabularyItem } from '../types';
import { LESSON_THEMES_MAP } from './grammarData';
import { MINNA_N5_VOCABULARY } from '../data/minnaN5Vocab';
import { MINNA_N4_VOCABULARY } from '../data/minnaN4Vocab';
import { speakJapanese } from '../utils/audio';

interface LessonHubProps {
  userProfile?: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onNavigateToTab?: (tab: string, extra?: any) => void;
}

export default function LessonHub({ userProfile, onUpdateProfile, onNavigateToTab }: LessonHubProps) {
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N5');
  const [activeLessonNum, setActiveLessonNum] = useState<number | null>(null);
  const [activeLessonTab, setActiveLessonTab] = useState<'vocab' | 'kanji' | 'quiz' | 'reading'>('vocab');

  // Flashcard in lesson state
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Lesson Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Available lessons based on level
  const lessonRange = useMemo(() => {
    if (selectedLevel === 'N5') {
      return Array.from({ length: 25 }, (_, i) => i + 1); // 1 to 25
    } else if (selectedLevel === 'N4') {
      return Array.from({ length: 25 }, (_, i) => i + 26); // 26 to 50
    } else if (selectedLevel === 'N3') {
      return Array.from({ length: 20 }, (_, i) => i + 1);
    } else {
      return Array.from({ length: 15 }, (_, i) => i + 1);
    }
  }, [selectedLevel]);

  // Vocab for active lesson
  const activeVocabList = useMemo(() => {
    if (activeLessonNum === null) return [];
    
    if (selectedLevel === 'N5') {
      const padNum = activeLessonNum < 10 ? `0${activeLessonNum}` : `${activeLessonNum}`;
      const targetId = `n5_mn${padNum}`;
      return MINNA_N5_VOCABULARY.filter(v => v.lessonId === targetId || v.lessonName?.includes(`Bài ${activeLessonNum}`));
    } else if (selectedLevel === 'N4') {
      const targetId = `n4_mn${activeLessonNum}`;
      return MINNA_N4_VOCABULARY.filter(v => v.lessonId === targetId || v.lessonName?.includes(`Bài ${activeLessonNum}`));
    }
    return MINNA_N5_VOCABULARY.slice(0, 25);
  }, [activeLessonNum, selectedLevel]);

  // Grammar themes map
  const getLessonTheme = (num: number, lvl: JLPTLevel) => {
    return LESSON_THEMES_MAP[lvl]?.[num] || `Chủ đề trọng tâm bài ${num}`;
  };

  // Quick Quiz for active lesson
  const lessonQuizQuestions = useMemo(() => {
    if (activeVocabList.length < 2) return [];
    return activeVocabList.slice(0, 5).map(target => {
      const others = activeVocabList.filter(v => v.id !== target.id);
      const wrongOptions = others.sort(() => Math.random() - 0.5).slice(0, 3).map(o => o.meaning);
      const options = [target.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
      return {
        question: `Nghĩa của từ "${target.kanji || target.hiragana}" là gì?`,
        word: target,
        options,
        correctIndex: options.indexOf(target.meaning)
      };
    });
  }, [activeVocabList]);

  // Handle Mark Lesson Complete
  const handleMarkComplete = () => {
    if (!activeLessonNum || !userProfile || !onUpdateProfile) return;
    const lessonKey = `${selectedLevel}_lesson_${activeLessonNum}`;
    const completed = userProfile.completedLessons || [];
    const isAlready = completed.includes(lessonKey);

    const updatedCompleted = isAlready 
      ? completed.filter(k => k !== lessonKey)
      : [...completed, lessonKey];

    const updatedProfile: UserProfile = {
      ...userProfile,
      completedLessons: updatedCompleted,
      xp: isAlready ? userProfile.xp : (userProfile.xp || 0) + 50
    };

    onUpdateProfile(updatedProfile);
    alert(isAlready ? 'Đã hoàn tác trạng thái bài học.' : 'Chúc mừng bạn đã hoàn thành bài học! +50 XP 🌟');
  };

  const isCurrentLessonCompleted = Boolean(
    activeLessonNum && userProfile?.completedLessons?.includes(`${selectedLevel}_lesson_${activeLessonNum}`)
  );

  return (
    <div id="lesson-hub-container" className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-blue-800/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 rounded-xl bg-white/10">
            <GraduationCap className="w-5 h-5 text-sky-300" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
            Todaii Lesson Hub
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          Bài học tiếng Nhật theo lộ trình
        </h1>
        <p className="mt-1 text-sm text-blue-200 max-w-2xl">
          Giáo trình Minna no Nihongo (50 bài sơ cấp) và Lộ trình JLPT chuẩn. Tích hợp trọn bộ Từ vựng, Ngữ pháp, Hán tự, Trắc nghiệm và Đọc hiểu ứng dụng.
        </p>

        {/* Level Switcher */}
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map(lvl => (
            <button
              key={lvl}
              id={`lesson-level-btn-${lvl}`}
              type="button"
              onClick={() => { setSelectedLevel(lvl); setActiveLessonNum(null); }}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                selectedLevel === lvl
                  ? 'bg-white text-blue-900 shadow-md scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Cấp độ {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: LESSON OVERVIEW GRID (when no active lesson selected) */}
      {activeLessonNum === null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Danh sách bài học JLPT {selectedLevel} ({lessonRange.length} bài)
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Giáo trình tiêu chuẩn
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lessonRange.map(num => {
              const theme = getLessonTheme(num, selectedLevel);
              const lessonKey = `${selectedLevel}_lesson_${num}`;
              const isDone = userProfile?.completedLessons?.includes(lessonKey);

              return (
                <div
                  key={num}
                  id={`lesson-card-${num}`}
                  onClick={() => {
                    setActiveLessonNum(num);
                    setActiveLessonTab('vocab');
                    setIsFlashcardMode(false);
                    setQuizFinished(false);
                  }}
                  className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between space-y-3 ${
                    isDone
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        Bài {num}
                      </span>
                      {isDone ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Đã hoàn thành
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          Chưa học
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2.5 line-clamp-2">
                      {theme}
                    </h4>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Đầy đủ 5 mục học</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                      Vào học <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: ACTIVE LESSON DASHBOARD (Tabs: Vocab, Grammar, Kanji, Quiz, Reading) */
        <div className="space-y-6">
          {/* Back & Lesson Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                id="back-to-lessons-btn"
                type="button"
                onClick={() => setActiveLessonNum(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                title="Quay lại danh sách bài"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                    {selectedLevel} - Bài {activeLessonNum}
                  </span>
                  <span className="text-xs text-slate-400">
                    {activeVocabList.length} từ vựng
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {getLessonTheme(activeLessonNum, selectedLevel)}
                </h2>
              </div>
            </div>

            <button
              id="mark-lesson-complete-btn"
              type="button"
              onClick={handleMarkComplete}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto ${
                isCurrentLessonCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isCurrentLessonCompleted ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã hoàn thành (+50 XP)</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  <span>Đánh dấu hoàn thành</span>
                </>
              )}
            </button>
          </div>

          {/* Subtabs Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
            {[
              { key: 'vocab', label: `1. Từ vựng (${activeVocabList.length})`, icon: BookOpen },
              { key: 'kanji', label: '2. Hán tự bài học', icon: FileText },
              { key: 'quiz', label: '3. Trắc nghiệm nhanh', icon: BrainCircuit },
              { key: 'reading', label: '4. Đọc hiểu ứng dụng', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeLessonTab === tab.key;
              return (
                <button
                  key={tab.key}
                  id={`lesson-subtab-${tab.key}`}
                  type="button"
                  onClick={() => setActiveLessonTab(tab.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* SUBTAB 1: VOCABULARY */}
          {activeLessonTab === 'vocab' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Danh sách từ vựng trọng tâm bài {activeLessonNum}
                </span>
                <button
                  id="toggle-lesson-flashcard-btn"
                  type="button"
                  onClick={() => setIsFlashcardMode(!isFlashcardMode)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  {isFlashcardMode ? 'Xem dạng bảng từ' : 'Học qua Flashcard 3D'}
                </button>
              </div>

              {isFlashcardMode ? (
                /* Lesson Flashcard */
                <div className="max-w-md mx-auto space-y-4">
                  {activeVocabList[flashcardIndex] && (
                    <div
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className="h-64 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl cursor-pointer flex flex-col items-center justify-between text-center select-none"
                    >
                      <div className="w-full flex justify-between text-xs text-slate-400">
                        <span>{flashcardIndex + 1} / {activeVocabList.length}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(activeVocabList[flashcardIndex].kanji || activeVocabList[flashcardIndex].hiragana);
                          }}
                          className="p-1 text-indigo-600"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {!isCardFlipped ? (
                        <div>
                          <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                            {activeVocabList[flashcardIndex].kanji || activeVocabList[flashcardIndex].hiragana}
                          </div>
                          {activeVocabList[flashcardIndex].hiragana && (
                            <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                              【{activeVocabList[flashcardIndex].hiragana}】
                            </div>
                          )}
                          <div className="text-xs text-slate-400 mt-4">Chạm để xem nghĩa</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
                            {activeVocabList[flashcardIndex].meaning}
                          </div>
                          {activeVocabList[flashcardIndex].exampleSentence && (
                            <div className="text-xs text-slate-600 dark:text-slate-300 mt-2 italic">
                              {activeVocabList[flashcardIndex].exampleSentence}
                            </div>
                          )}
                          <div className="text-xs text-slate-400 mt-4">Chạm để quay lại mặt trước</div>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400">Nhấn thẻ để lật</div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      disabled={flashcardIndex === 0}
                      onClick={() => { setIsCardFlipped(false); setFlashcardIndex(prev => prev - 1); }}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border disabled:opacity-30 text-xs font-bold"
                    >
                      Trước
                    </button>
                    <button
                      disabled={flashcardIndex === activeVocabList.length - 1}
                      onClick={() => { setIsCardFlipped(false); setFlashcardIndex(prev => prev + 1); }}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border disabled:opacity-30 text-xs font-bold"
                    >
                      Tiếp theo
                    </button>
                  </div>
                </div>
              ) : (
                /* Vocab Table / Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeVocabList.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            {item.kanji || item.hiragana}
                          </span>
                          {item.hiragana && item.kanji && (
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              【{item.hiragana}】
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {item.meaning}
                        </div>
                        {item.exampleSentence && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
                            {item.exampleSentence}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => speakJapanese(item.kanji || item.hiragana)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600"
                          title="Phát âm"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent('save_to_notebook', {
                                detail: {
                                  kanji: item.kanji || item.hiragana,
                                  furigana: item.hiragana,
                                  meaning: item.meaning,
                                  example: item.exampleSentence,
                                  exampleMeaning: item.exampleTranslation,
                                  level: selectedLevel,
                                  note: `Bài học ${activeLessonNum}`,
                                  source: 'lesson'
                                }
                              })
                            );
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500"
                          title="Lưu vào Sổ tay"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 2: KANJI */}
          {activeLessonTab === 'kanji' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { char: '日', hanViet: 'NHẬT', on: 'NICHI, JITSU', kun: 'hi, -bi', meaning: 'Mặt trời, ngày', stroke: 4 },
                  { char: '本', hanViet: 'BẢN', on: 'HON', kun: 'moto', meaning: 'Sách, gốc rễ', stroke: 5 },
                  { char: '人', hanViet: 'NHÂN', on: 'JIN, NIN', kun: 'hito', meaning: 'Người', stroke: 2 },
                  { char: '月', hanViet: 'NGUYỆT', on: 'GETSU, GATSU', kun: 'tsuki', meaning: 'Mặt trăng, tháng', stroke: 4 },
                  { char: '火', hanViet: 'HỎA', on: 'KA', kun: 'hi', meaning: 'Lửa', stroke: 4 },
                  { char: '水', hanViet: 'THỦY', on: 'SUI', kun: 'mizu', meaning: 'Nước', stroke: 4 }
                ].map((k, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">{k.char}</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                        {k.hanViet}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{k.meaning}</div>
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>On: {k.on}</div>
                      <div>Kun: {k.kun}</div>
                      <div>Số nét: {k.stroke}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 4: QUICK QUIZ */}
          {activeLessonTab === 'quiz' && (
            <div className="max-w-md mx-auto space-y-4">
              {lessonQuizQuestions.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border">
                  Đang chuẩn bị câu hỏi trắc nghiệm...
                </div>
              ) : quizFinished ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border shadow-xl space-y-3">
                  <Award className="w-12 h-12 mx-auto text-emerald-500" />
                  <h3 className="text-xl font-bold">Hoàn thành bài kiểm tra!</h3>
                  <p className="text-sm text-slate-600">
                    Bạn trả lời đúng <strong>{quizScore}</strong> / {lessonQuizQuestions.length} câu.
                  </p>
                  <button
                    onClick={() => { setQuizIndex(0); setQuizScore(0); setQuizFinished(false); }}
                    className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                  >
                    Làm lại bài kiểm tra
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                  <div className="text-xs font-bold text-slate-500">
                    Câu {quizIndex + 1} / {lessonQuizQuestions.length}
                  </div>

                  <div className="text-center py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                      {lessonQuizQuestions[quizIndex].word.kanji || lessonQuizQuestions[quizIndex].word.hiragana}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {lessonQuizQuestions[quizIndex].options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        disabled={isSubmitted}
                        onClick={() => {
                          setSelectedAnswer(oIdx);
                          setIsSubmitted(true);
                          if (oIdx === lessonQuizQuestions[quizIndex].correctIndex) {
                            setQuizScore(prev => prev + 1);
                          }
                        }}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                          isSubmitted
                            ? oIdx === lessonQuizQuestions[quizIndex].correctIndex
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                              : oIdx === selectedAnswer
                              ? 'border-rose-500 bg-rose-50 text-rose-800'
                              : 'opacity-40 border-slate-200'
                            : 'border-slate-200 hover:border-indigo-500'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {isSubmitted && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedAnswer(null);
                          setIsSubmitted(false);
                          if (quizIndex < lessonQuizQuestions.length - 1) {
                            setQuizIndex(prev => prev + 1);
                          } else {
                            setQuizFinished(true);
                          }
                        }}
                        className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                      >
                        Tiếp theo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 5: READING APPLICATION */}
          {activeLessonTab === 'reading' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Bài đọc ứng dụng ngữ pháp bài {activeLessonNum}
                </span>
                <button
                  type="button"
                  onClick={() => speakJapanese('初めまして。私はマイです。ベトナムから来ました。毎日日本語を勉強しています。')}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                >
                  <Volume2 className="w-4 h-4" />
                  Nghe bài đọc
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-sm leading-loose space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">
                  初めまして。私はマイです。ベトナムから来ました。
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  私は学生です。毎朝７時に起きて、学校へ行きます。
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  学校で友達と日本語を勉強します。日本語の勉強はとても面白いです。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 text-xs space-y-1">
                <span className="font-bold text-indigo-900 dark:text-indigo-300">Bản dịch tiếng Việt:</span>
                <p className="text-slate-600 dark:text-slate-400">
                  Xin chào. Tôi là Mai. Tôi đến từ Việt Nam. Tôi là học sinh. Mỗi sáng tôi thức dậy lúc 7 giờ và đi đến trường. Ở trường tôi học tiếng Nhật cùng bạn bè. Việc học tiếng Nhật rất thú vị.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
