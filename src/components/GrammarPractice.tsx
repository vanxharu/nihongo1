import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { UserProfile, GrammarItem, JLPTLevel } from '../types';
import { GRAMMAR_DATA } from '../data';
import { safeFetchJson } from '../utils/safeApi';
import { reviewSRS } from '../utils/srs';
import type { SRSStatus } from '../types';
import { deduplicateGrammars, getGrammarStatusWithAliases } from '../utils/grammarDeduplicator';
import GrammarMindmapOverview from './grammar/GrammarMindmapOverview';
import './grammar/grammarLayout.css';
import GrammarLessonListView from './grammar/GrammarLessonListView';
import GrammarLessonDetailView from './grammar/GrammarLessonDetailView';
import GrammarPointDetailView from './grammar/GrammarPointDetailView';
import GrammarPracticeView from './grammar/GrammarPracticeView';
import fallbackAiContents from '../data/grammarAiContents.json';
import { FALLBACK_PATTERNS } from './grammarData';

// Lịch SM-2 của một mẫu ngữ pháp lưu trong grammarStatus: srsStage = số lần nhớ liên tiếp + 1 (0 = không ôn), nextReview (ms).
const grammarSrs = (st: any): SRSStatus | null => Number(st?.srsStage) > 0 && st?.nextReview
  ? { interval: Number(st.srsInterval) || 1, easeFactor: Number(st.srsEase) || 2.5, repetitions: Number(st.srsStage) - 1, nextReviewDate: new Date(st.nextReview).toISOString() }
  : null;
const grammarSrsFields = (s: SRSStatus) => ({ srsStage: s.repetitions + 1, srsInterval: s.interval, srsEase: s.easeFactor, nextReview: Date.parse(s.nextReviewDate) });
export const isGrammarDue = (st: any, now = Date.now()) => Number(st?.srsStage) > 0 && !!st?.nextReview && st.nextReview <= now;

const LOCAL_GRAMMARS: GrammarItem[] = GRAMMAR_DATA.length ? GRAMMAR_DATA : Object.entries(FALLBACK_PATTERNS).flatMap(([level, lessons]) => Object.entries(lessons).flatMap(([lesson, patterns]) => patterns.map((pattern, index) => ({ ...pattern, id: `local_${level}_${lesson}_${index}`, level: level as JLPTLevel, lessonNumber: Number(lesson), lessonName: `Bài ${lesson}` }))));

interface GrammarPracticeProps {
  onStudyReward?: (activity: string, amount: number) => boolean;
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onEarnXp: (amount: number) => void;
  onNavigateTab?: (tab: string, extra?: any) => void;
  initialViewMode?: GrammarViewMode;
  initialLessonNumber?: number;
}

type GrammarViewMode = 'overview' | 'lesson-list' | 'lesson-detail' | 'grammar-detail' | 'practice';

export default function GrammarPractice({ 
  userProfile, 
  updateProfile, 
  onEarnXp, onStudyReward,
  onNavigateTab,
  initialViewMode = 'lesson-list',
  initialLessonNumber
}: GrammarPracticeProps) {
  // Navigation state - Show TheoryHubView (overview) by default
  const [viewMode, setViewMode] = useState<GrammarViewMode>(initialViewMode === 'overview' ? 'lesson-list' : initialViewMode);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>(initialLessonNumber ? (initialLessonNumber >= 26 ? 'N4' : 'N5') : (userProfile.targetLevel as JLPTLevel) || 'N4');
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number>(
    initialLessonNumber || (userProfile.targetLevel === 'N5' ? 1 : 26)
  );
  const [selectedGrammar, setSelectedGrammar] = useState<GrammarItem | null>(null);

  // Follow the profile's target level when it changes elsewhere (settings/profile)
  const prevTargetRef = useRef(userProfile.targetLevel);
  useEffect(() => {
    if (prevTargetRef.current === userProfile.targetLevel) return;
    prevTargetRef.current = userProfile.targetLevel;
    setSelectedLevel(userProfile.targetLevel as JLPTLevel);
    setSelectedLessonNumber(userProfile.targetLevel === 'N5' ? 1 : 26);
    setSelectedGrammar(null);
  }, [userProfile.targetLevel]);

  // Sync external initialViewMode or initialLessonNumber when props change
  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode === 'overview' ? 'lesson-list' : initialViewMode);
    }
  }, [initialViewMode]);

  useEffect(() => {
    if (initialLessonNumber) {
      setSelectedLessonNumber(initialLessonNumber);
      setSelectedLevel(initialLessonNumber >= 26 ? 'N4' : 'N5');
    }
  }, [initialLessonNumber]);

  // Furigana preference
  const [showFurigana, setShowFurigana] = useState<boolean>(() => {
    const saved = localStorage.getItem('jlpt_mindmap_furigana');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleFurigana = () => {
    setShowFurigana(prev => {
      const next = !prev;
      localStorage.setItem('jlpt_mindmap_furigana', String(next));
      return next;
    });
  };

  // Grammars data state
  const [grammars, setGrammars] = useState<GrammarItem[]>(() => deduplicateGrammars(LOCAL_GRAMMARS));
  const [aiContents, setAiContents] = useState<Record<string, any>>(fallbackAiContents as Record<string, any>);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load latest grammars from backend
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [dbGrammars, aiRes] = await Promise.all([
          safeFetchJson<GrammarItem[]>('/api/grammars'),
          safeFetchJson<any>('/api/grammar/all-ai-contents')
        ]);

        if (isMounted) {
          if (dbGrammars.ok && Array.isArray(dbGrammars.data) && dbGrammars.data.length > 0) {
            // Cấp độ nào API không có thì giữ dữ liệu local (tránh N5/N3/N2/N1 bị trống)
            const dbLevels = new Set(dbGrammars.data.map(g => g.level));
            setGrammars(deduplicateGrammars([...dbGrammars.data, ...LOCAL_GRAMMARS.filter(g => !dbLevels.has(g.level))]));
          }
          if (aiRes.ok && aiRes.data) {
            const dataMap = aiRes.data?.data || aiRes.data;
            if (dataMap && typeof dataMap === 'object') {
              setAiContents(dataMap);
            }
          }
        }
      } catch (err) {
        console.warn('Using offline grammar fallback data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainView = document.getElementById('app-main-view');
    if (mainView) {
      mainView.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [viewMode, selectedLevel, selectedLessonNumber, selectedGrammar]);

  // Level statistics calculation
  const levelStats = useMemo(() => {
    const stats: Record<string, { lessons: number; grammars: number; completed: number }> = {
      N5: { lessons: 25, grammars: 0, completed: 0 },
      N4: { lessons: 25, grammars: 0, completed: 0 },
      N3: { lessons: 20, grammars: 0, completed: 0 },
      N2: { lessons: 25, grammars: 0, completed: 0 },
      N1: { lessons: 30, grammars: 0, completed: 0 }
    };

    grammars.forEach(g => {
      const lvl = g.level;
      if (stats[lvl]) {
        stats[lvl].grammars++;
        const st = getGrammarStatusWithAliases(userProfile.grammarStatus, g);
        if (st) {
          const isDone = typeof st === 'boolean' ? st : Boolean(st.correctCount > 0 || st.state === 'mastered' || st.state === 'learned');
          if (isDone) stats[lvl].completed++;
        }
      }
    });

    // Provide baseline counts if DB items are being mapped
    if (stats['N4'].grammars === 0) stats['N4'].grammars = 90;
    if (stats['N5'].grammars === 0) stats['N5'].grammars = 120;
    if (stats['N3'].grammars === 0) stats['N3'].grammars = 110;
    if (stats['N2'].grammars === 0) stats['N2'].grammars = 140;
    if (stats['N1'].grammars === 0) stats['N1'].grammars = 160;

    return stats;
  }, [grammars, userProfile.grammarStatus]);

  // Total completed
  const totalCompletedCount = useMemo(() => {
    let count = 0;
    const statusMap = userProfile.grammarStatus;
    if (statusMap && typeof statusMap === 'object') {
      Object.values(statusMap).forEach((st: any) => {
        if (!st) return;
        const isDone = typeof st === 'boolean' ? st : Boolean(st.correctCount > 0 || st.state === 'mastered' || st.state === 'learned');
        if (isDone) count++;
      });
    }
    return count;
  }, [userProfile.grammarStatus]);

  // Helper to toggle bookmarks
  const handleToggleBookmark = useCallback((grammarId: string) => {
    const raw = userProfile.grammarStatus?.[grammarId];
    const current = (typeof raw === 'object' && raw !== null)
      ? { ...raw }
      : {
          id: grammarId,
          correctCount: typeof raw === 'boolean' && raw ? 1 : 0,
          incorrectCount: 0,
          lastReviewed: null,
          nextReview: null,
          srsStage: 0,
          state: 'new' as const,
          isBookmarked: false
        };

    const currentMap = (typeof userProfile.grammarStatus === 'object' && userProfile.grammarStatus !== null)
      ? userProfile.grammarStatus
      : {};

    const updated = {
      ...currentMap,
      [grammarId]: {
        ...current,
        isBookmarked: !current.isBookmarked
      }
    };

    updateProfile({ grammarStatus: updated });
  }, [userProfile.grammarStatus, updateProfile]);

  // Helper to toggle SRS review
  const handleToggleSrsReview = useCallback((grammarId: string) => {
    const raw = userProfile.grammarStatus?.[grammarId];
    const current = (typeof raw === 'object' && raw !== null)
      ? { ...raw }
      : {
          id: grammarId,
          correctCount: typeof raw === 'boolean' && raw ? 1 : 0,
          incorrectCount: 0,
          lastReviewed: null,
          nextReview: null,
          srsStage: 0,
          state: 'new' as const,
          isBookmarked: false
        };

    const on = Number(current.srsStage || 0) === 0;
    const now = Date.now();
    // Bật: ôn lần đầu vào ngày mai (như vừa học xong). Tắt: bỏ khỏi lịch.
    const srs = on ? grammarSrsFields(reviewSRS(null, true)) : { srsStage: 0, nextReview: null };

    const currentMap = (typeof userProfile.grammarStatus === 'object' && userProfile.grammarStatus !== null)
      ? userProfile.grammarStatus
      : {};

    const updated = {
      ...currentMap,
      [grammarId]: {
        ...current,
        ...srs,
        lastReviewed: now,
        state: on ? ('learning' as const) : ('new' as const)
      }
    };

    updateProfile({ grammarStatus: updated });
  }, [userProfile.grammarStatus, updateProfile]);

  // Record practice attempt
  const handleRecordAttempt = useCallback((grammarId: string, isCorrect: boolean) => {
    const raw = userProfile.grammarStatus?.[grammarId];
    const current = (typeof raw === 'object' && raw !== null)
      ? { ...raw }
      : {
          id: grammarId,
          correctCount: typeof raw === 'boolean' && raw ? 1 : 0,
          incorrectCount: 0,
          lastReviewed: null,
          nextReview: null,
          srsStage: 0,
          state: 'new' as const,
          isBookmarked: false
        };

    const currentMap = (typeof userProfile.grammarStatus === 'object' && userProfile.grammarStatus !== null)
      ? userProfile.grammarStatus
      : {};

    const updated = {
      ...currentMap,
      [grammarId]: {
        ...current,
        correctCount: isCorrect ? (Number(current.correctCount || 0) + 1) : Number(current.correctCount || 0),
        incorrectCount: !isCorrect ? (Number(current.incorrectCount || 0) + 1) : Number(current.incorrectCount || 0),
        lastReviewed: Date.now(),
        state: isCorrect ? (current.state === 'mastered' ? ('mastered' as const) : ('learned' as const)) : current.state,
        // Sai thì tự vào lịch ôn; đã trong lịch thì đúng/sai cập nhật SM-2 (đúng trước hạn không giãn).
        ...(grammarSrs(current) || !isCorrect ? grammarSrsFields(reviewSRS(grammarSrs(current), isCorrect)) : {})
      }
    };

    updateProfile({ grammarStatus: updated });
  }, [userProfile.grammarStatus, updateProfile]);

  // Get grammar AI content
  const currentAiContent = useMemo(() => {
    if (!selectedGrammar) return null;
    const idsToCheck = [selectedGrammar.id, ...(selectedGrammar.mergedIds || [])];
    for (const id of idsToCheck) {
      if (aiContents[id]) return aiContents[id];
    }
    return (
      aiContents[selectedGrammar.structure] ||
      aiContents[selectedGrammar.structure.replace(/[〜~]/g, '')] ||
      null
    );
  }, [selectedGrammar, aiContents]);

  // Grammars in current selected lesson
  const allGrammarsInCurrentLesson = useMemo(() => {
    const raw = grammars.filter(
      g => g.level === selectedLevel && (g.lessonNumber === selectedLessonNumber || g.lessonName?.includes(`Bài ${selectedLessonNumber}`))
    );
    return deduplicateGrammars(raw);
  }, [grammars, selectedLevel, selectedLessonNumber]);

  const dueGrammars = useMemo(() => {
    const now = Date.now();
    return grammars.filter(g => isGrammarDue(userProfile.grammarStatus?.[g.id], now));
  }, [grammars, userProfile.grammarStatus]);

  return (
    <div className="grammar-reference-layout min-h-screen bg-[#0f1217] bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] text-slate-100 selection:bg-blue-600 selection:text-white pb-16">
      {(viewMode === 'lesson-list' || viewMode === 'lesson-detail') && dueGrammars.length > 0 && (
        <button
          type="button"
          onClick={() => { setSelectedGrammar(dueGrammars[0]); setViewMode('practice'); }}
          className="mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-3xl items-center justify-between gap-3 rounded-xl border border-emerald-600/60 bg-emerald-950/60 px-4 py-3 text-left text-sm text-emerald-200 cursor-pointer"
        >
          <b>{dueGrammars.length} mẫu ngữ pháp đến hạn ôn hôm nay</b>
          <span className="shrink-0">Ôn ngay: {dueGrammars[0].structure}</span>
        </button>
      )}

      {/* 2. LESSON LIST SCREEN (Screen 2) */}
      {viewMode === 'lesson-list' && (
        <GrammarLessonListView
          level={selectedLevel}
          userProfile={userProfile}
          grammars={grammars}
          onBackToOverview={() => onNavigateTab?.('practice')}
          onSelectLesson={(lessonNumber) => {
            setSelectedLessonNumber(lessonNumber);
            setViewMode('lesson-detail');
          }}
        />
      )}

      {/* 3. LESSON DETAIL SCREEN (Screen 3) */}
      {viewMode === 'lesson-detail' && (
        <GrammarLessonDetailView
          level={selectedLevel}
          lessonNumber={selectedLessonNumber}
          grammars={grammars}
          userProfile={userProfile}
          showFurigana={showFurigana}
          onToggleFurigana={toggleFurigana}
          onBackToLessonList={() => setViewMode('lesson-list')}
          onSelectGrammar={(grammar) => {
            setSelectedGrammar(grammar);
            setViewMode('grammar-detail');
          }}
          onStartPractice={(grammar) => {
            setSelectedGrammar(grammar);
            setViewMode('practice');
          }}
          onSelectNextLesson={(nextLessonNumber) => {
            setSelectedLessonNumber(nextLessonNumber);
          }}
        />
      )}

      {/* 4. GRAMMAR POINT DETAIL SCREEN (Screen 4) */}
      {viewMode === 'grammar-detail' && selectedGrammar && (
        <GrammarPointDetailView onCompleteReading={() => onStudyReward?.(`grammar-reading:${selectedGrammar.id}`, 5) ?? false}
          grammar={selectedGrammar}
          aiContent={currentAiContent}
          allGrammarsInLesson={allGrammarsInCurrentLesson}
          userProfile={userProfile}
          showFurigana={showFurigana}
          onToggleFurigana={toggleFurigana}
          onBackToLesson={() => setViewMode('lesson-detail')}
          onStartPractice={() => setViewMode('practice')}
          onSelectRelatedGrammar={(related) => {
            setSelectedGrammar(related);
          }}
          onSelectNextGrammar={(next) => {
            setSelectedGrammar(next);
          }}
          onToggleBookmark={handleToggleBookmark}
          onToggleSrsReview={handleToggleSrsReview}
        />
      )}

      {/* 5. PRACTICE SCREEN (Screen 5 & 6) */}
      {viewMode === 'practice' && selectedGrammar && (
        <GrammarPracticeView
          key={selectedGrammar.id}
          showFurigana={showFurigana}
          onToggleFurigana={toggleFurigana}
          grammar={selectedGrammar}
          aiContent={currentAiContent}
          userProfile={userProfile}
          onBackToDetail={() => setViewMode('grammar-detail')}
          onEarnXp={onEarnXp}
          onRecordAttempt={handleRecordAttempt}
        />
      )}
    </div>
  );
}
