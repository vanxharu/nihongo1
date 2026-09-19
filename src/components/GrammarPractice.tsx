import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserProfile, GrammarItem, JLPTLevel } from '../types';
import { GRAMMAR_DATA } from '../data';
import { safeFetchJson } from '../utils/safeApi';
import { deduplicateGrammars, getGrammarStatusWithAliases } from '../utils/grammarDeduplicator';
import TheoryHubView from './grammar/TheoryHubView';
import GrammarMindmapOverview from './grammar/GrammarMindmapOverview';
import GrammarLessonListView from './grammar/GrammarLessonListView';
import GrammarLessonDetailView from './grammar/GrammarLessonDetailView';
import GrammarPointDetailView from './grammar/GrammarPointDetailView';
import GrammarPracticeView from './grammar/GrammarPracticeView';
import fallbackAiContents from '../data/grammarAiContents.json';

interface GrammarPracticeProps {
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
  onEarnXp, 
  onNavigateTab,
  initialViewMode = 'lesson-list',
  initialLessonNumber
}: GrammarPracticeProps) {
  // Navigation state - Jump straight into Grammar lesson-list by default
  const [viewMode, setViewMode] = useState<GrammarViewMode>(initialViewMode);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>((userProfile.targetLevel as JLPTLevel) || 'N4');
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number>(
    initialLessonNumber || (userProfile.targetLevel === 'N5' ? 1 : 26)
  );
  const [selectedGrammar, setSelectedGrammar] = useState<GrammarItem | null>(null);

  // Sync external initialViewMode or initialLessonNumber when props change
  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  useEffect(() => {
    if (initialLessonNumber) {
      setSelectedLessonNumber(initialLessonNumber);
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
  const [grammars, setGrammars] = useState<GrammarItem[]>(() => deduplicateGrammars(GRAMMAR_DATA));
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
            setGrammars(deduplicateGrammars(dbGrammars.data));
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

    const nextStage = Number(current.srsStage || 0) === 0 ? 1 : 0;
    const now = Date.now();
    const nextReviewTime = nextStage === 1 ? now + 24 * 60 * 60 * 1000 : null;

    const currentMap = (typeof userProfile.grammarStatus === 'object' && userProfile.grammarStatus !== null)
      ? userProfile.grammarStatus
      : {};

    const updated = {
      ...currentMap,
      [grammarId]: {
        ...current,
        srsStage: nextStage,
        nextReview: nextReviewTime,
        lastReviewed: now,
        state: nextStage > 0 ? ('learning' as const) : ('new' as const)
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
        state: isCorrect ? ('learned' as const) : current.state
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

  return (
    <div className="min-h-screen bg-[#0f1217] bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] text-slate-100 selection:bg-blue-600 selection:text-white pb-16">
      {/* 1. OVERVIEW SCREEN (Screen 1: Theory Hub matching mobile screenshot) */}
      {viewMode === 'overview' && (
        <TheoryHubView
          userProfile={userProfile}
          selectedLevel={selectedLevel}
          onChangeLevel={(level) => {
            setSelectedLevel(level);
            updateProfile({ targetLevel: level });
            const defaultLesson = level === 'N4' ? 26 : 1;
            setSelectedLessonNumber(defaultLesson);
          }}
          onOpenGrammar={() => {
            const defaultLesson = selectedLevel === 'N4' ? 26 : (selectedLevel === 'N5' ? 1 : 1);
            setSelectedLessonNumber(defaultLesson);
            setViewMode('lesson-list');
          }}
          onOpenVocab={() => {
            if (onNavigateTab) {
              onNavigateTab('vocabulary');
            }
          }}
          onOpenKanji={() => {
            if (onNavigateTab) {
              onNavigateTab('kanji');
            }
          }}
          onContinueStudy={() => {
            const defaultLesson = selectedLevel === 'N4' ? 26 : (selectedLevel === 'N5' ? 1 : 1);
            setSelectedLessonNumber(defaultLesson);
            setViewMode('lesson-detail');
          }}
          grammars={grammars}
          levelStats={levelStats}
          onSelectGrammarItem={(grammar) => {
            setSelectedGrammar(grammar);
            setViewMode('grammar-detail');
          }}
        />
      )}

      {/* 2. LESSON LIST SCREEN (Screen 2) */}
      {viewMode === 'lesson-list' && (
        <GrammarLessonListView
          level={selectedLevel}
          userProfile={userProfile}
          grammars={grammars}
          onBackToOverview={() => setViewMode('overview')}
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
        <GrammarPointDetailView
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
