/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowLeft, 
  ChevronLeft,
  ChevronRight, 
  RotateCcw, 
  BookmarkCheck, 
  Lightbulb, 
  PenTool, 
  Eraser, 
  Highlighter, 
  Undo, 
  Trash2, 
  Eye, 
  EyeOff, 
  Play, 
  Clock, 
  Check, 
  Award,
  Layers,
  Search,
  BookMarked,
  Target,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudyBook, StudyBookUnit, StudyBookQuestion, StudyBookSavedProgress, UserProfile } from '../types';
import { STUDY_BOOKS_DATA } from '../data/studyBooksData';
import { AuthenticBookCover } from './AuthenticBookCover';
import { BookLibraryView } from './books/BookLibraryView';
import { BookDetailView } from './books/BookDetailView';
import { renderStudyQuestionText } from '../utils/questionFormatUtils';
import { StudyExplanationCard } from './StudyExplanationCard';
import { speakJapanese } from '../utils/audio';
import { getStudyQuestionHintAndDistractors } from '../utils/questionOptionExplainer';

interface StudyBooksHubProps {
  userProfile?: UserProfile;
  updateProfile?: (fields: Partial<UserProfile>) => Promise<void>;
  onEarnXp?: (amount: number, reason: string) => void;
  onBack?: () => void;
}

const STORAGE_KEY = 'jlpt_study_books_progress_v1';

interface StrokePoint {
  x: number;
  y: number;
}

/**
 * Compact hint box displaying question translation and explanations of wrong options
 */
const StudyQuestionHintBox: React.FC<{
  question: StudyBookQuestion;
  showHints: boolean;
  isRevealed: boolean;
  onToggle: () => void;
}> = ({ question, showHints, isRevealed, onToggle }) => {
  if (!showHints && !isRevealed) return null;
  const analysis = getStudyQuestionHintAndDistractors(question);

  return (
    <div className="mt-2.5 p-3 rounded-xl bg-amber-50/95 border border-amber-200/80 text-xs text-amber-950 space-y-2 select-text shadow-sm">
      {/* 1. Dịch câu hỏi */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold text-[10px] shrink-0 tracking-wide uppercase">
            Dịch câu
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">
            {analysis.sentenceTranslation || question.hint}
          </p>
        </div>
        {!showHints && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="text-[10px] text-amber-700/80 hover:text-amber-950 underline shrink-0 font-medium px-1"
          >
            Ẩn
          </button>
        )}
      </div>

      {/* 2. Giải thích các đáp án sai */}
      {analysis.distractors.length > 0 && (
        <div className="pt-2 border-t border-amber-200/70 space-y-1.5">
          <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
            <span>Giải thích các đáp án sai:</span>
          </div>
          <div className="space-y-1 pl-0.5">
            {analysis.distractors.map((d) => (
              <div key={d.index} className="flex items-start gap-1.5 text-[11px] leading-snug">
                <span className="font-bold text-rose-600 shrink-0">
                  ✕ ({d.optionNumber}) {d.text}:
                </span>
                <span className="text-slate-700 font-normal">
                  {d.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface Stroke {
  id: string;
  tool: 'pen' | 'pencil' | 'highlighter';
  color: string;
  width: number;
  points: StrokePoint[];
  questionId?: string;
  baseTop?: number;
}

export default function StudyBooksHub({ userProfile, updateProfile, onEarnXp, onBack }: StudyBooksHubProps) {
  // Navigation State - Restores active session if user left while studying
  const [selectedBook, setSelectedBook] = useState<StudyBook | null>(() => {
    try {
      const activeRaw = localStorage.getItem('study_book_active_session');
      if (activeRaw) {
        const { bookId } = JSON.parse(activeRaw);
        return STUDY_BOOKS_DATA.find(b => b.id === bookId) || null;
      }
    } catch {}
    return null;
  });

  const [selectedUnit, setSelectedUnit] = useState<StudyBookUnit | null>(() => {
    try {
      const activeRaw = localStorage.getItem('study_book_active_session');
      if (activeRaw) {
        const { bookId, unitId } = JSON.parse(activeRaw);
        const b = STUDY_BOOKS_DATA.find(book => book.id === bookId);
        return b?.units.find(u => u.id === unitId) || null;
      }
    } catch {}
    return null;
  });
  
  // Progress State
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [lastSavedProgress, setLastSavedProgress] = useState<StudyBookSavedProgress | null>(null);

  // Map of completed status for all units across all books
  const [completedUnitsMap, setCompletedUnitsMap] = useState<Record<string, { isCompleted: boolean; answeredCount: number; total: number }>>(() => {
    const map: Record<string, { isCompleted: boolean; answeredCount: number; total: number }> = {};
    try {
      STUDY_BOOKS_DATA.forEach(book => {
        book.units.forEach(unit => {
          const key = `${STORAGE_KEY}_${book.id}_${unit.id}`;
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            const answers = parsed.answers || {};
            const answeredCount = Object.keys(answers).filter(qId => unit.questions.some(q => q.id === qId)).length;
            const isCompleted = unit.questions.length > 0 && answeredCount >= unit.questions.length;
            map[`${book.id}_${unit.id}`] = {
              isCompleted,
              answeredCount,
              total: unit.questions.length
            };
          }
        });
      });
    } catch {}
    return map;
  });
  
  // View & Study Mode
  const [viewMode, setViewMode] = useState<'booklet' | 'single'>('booklet');
  const [autoCheckOnSelect, setAutoCheckOnSelect] = useState<boolean>(true);
  const [showHints, setShowHints] = useState<boolean>(false); // Ẩn mặc định gợi ý trong sách
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [playingAudioQuestionId, setPlayingAudioQuestionId] = useState<string | null>(null);

  const toggleHintForQuestion = (questionId: string) => {
    setRevealedHints(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handlePlayQuestionAudio = useCallback((question: StudyBookQuestion) => {
    if (playingAudioQuestionId === question.id) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioQuestionId(null);
      return;
    }

    setPlayingAudioQuestionId(question.id);
    speakJapanese(question.question, undefined, () => {
      setPlayingAudioQuestionId(null);
    }, { isSentence: true });
  }, [playingAudioQuestionId]);

  // Helper to determine the in-progress (unfinished) question index to continue
  const calculateUnfinishedIndex = useCallback((
    questions: StudyBookQuestion[],
    answers: Record<string, number>,
    savedIdx?: number
  ): number => {
    if (!questions || questions.length === 0) return 0;

    // 1. If savedIdx points to an unanswered question, resume directly on that question
    if (typeof savedIdx === 'number' && savedIdx >= 0 && savedIdx < questions.length) {
      if (answers[questions[savedIdx].id] === undefined) {
        return savedIdx;
      }
      // If the question at savedIdx was already answered, check if the immediate next question is unanswered
      if (savedIdx + 1 < questions.length && answers[questions[savedIdx + 1].id] === undefined) {
        return savedIdx + 1;
      }
    }

    // 2. Otherwise find the first unanswered question in the unit
    const firstUnanswered = questions.findIndex(q => answers[q.id] === undefined);
    if (firstUnanswered !== -1) {
      return firstUnanswered;
    }

    // 3. If all questions have been completed, keep the saved index or default to 0
    if (typeof savedIdx === 'number' && savedIdx >= 0 && savedIdx < questions.length) {
      return savedIdx;
    }
    return 0;
  }, []);

  // Deleted books management
  const [deletedBookIds, setDeletedBookIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('deleted_study_books_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleDeleteBook = (bookId: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sách "${title}" khỏi danh sách không?`)) {
      setDeletedBookIds(prev => {
        const next = [...prev, bookId];
        try {
          localStorage.setItem('deleted_study_books_v1', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  const handleRestoreBooks = () => {
    setDeletedBookIds([]);
    try {
      localStorage.removeItem('deleted_study_books_v1');
    } catch {}
  };

  // Canvas & Handwriting Tools
  const [drawingTool, setDrawingTool] = useState<'pen' | 'pencil' | 'highlighter' | 'eraser'>('pen');
  const [drawingColor, setDrawingColor] = useState<string>('#E11D48'); // Japanese red ink
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

  const bookletPaperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up debounced save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Load overall saved progress on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StudyBookSavedProgress = JSON.parse(raw);
        setLastSavedProgress(parsed);
      }
    } catch (e) {
      console.error('Failed to load saved study book progress', e);
    }
  }, []);

  // When a unit is loaded, restore its answers, checked state, and scroll/jump to unfinished question
  useEffect(() => {
    if (!selectedBook || !selectedUnit) return;

    try {
      // Remember this unit as the active session for auto-restoring when reopening
      localStorage.setItem('study_book_active_session', JSON.stringify({
        bookId: selectedBook.id,
        unitId: selectedUnit.id
      }));

      const unitStorageKey = `${STORAGE_KEY}_${selectedBook.id}_${selectedUnit.id}`;
      const raw = localStorage.getItem(unitStorageKey);
      let loadedAnswers: Record<string, number> = {};
      let loadedChecked: Record<string, boolean> = {};
      let loadedStrokes: Stroke[] = [];
      let targetQIdx = 0;

      if (raw) {
        const data = JSON.parse(raw);
        loadedAnswers = data.answers || {};
        loadedChecked = data.checkedQuestions || {};
        if (Array.isArray(data.strokes)) {
          loadedStrokes = data.strokes;
        }
        targetQIdx = calculateUnfinishedIndex(selectedUnit.questions, loadedAnswers, data.questionIndex);
      }

      setUserAnswers(loadedAnswers);
      setCheckedQuestions(loadedChecked);
      setCurrentQuestionIndex(targetQIdx);
      setStrokes(loadedStrokes);
      setRevealedHints({});

      // Automatically smooth-scroll to the unfinished question in Booklet mode
      setTimeout(() => {
        const targetQ = selectedUnit.questions[targetQIdx];
        if (targetQ) {
          const el = document.getElementById(`study-q-${targetQ.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 300);
    } catch (e) {
      console.error('Failed to restore unit progress', e);
    }
  }, [selectedBook, selectedUnit, calculateUnfinishedIndex]);

  // Auto scroll active question button into view in single mode
  useEffect(() => {
    if (viewMode === 'single') {
      const activeBtn = document.getElementById(`single-nav-btn-${currentQuestionIndex}`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentQuestionIndex, viewMode]);

  // Persist current unit progress (debounced to prevent UI lag on clicks)
  const saveUnitProgress = useCallback((newAnswers: Record<string, number>, newChecked: Record<string, boolean>, qIdx: number, newStrokes: Stroke[]) => {
    if (!selectedBook || !selectedUnit) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const progressData: StudyBookSavedProgress = {
        bookId: selectedBook.id,
        unitId: selectedUnit.id,
        questionIndex: qIdx,
        updatedAt: new Date().toISOString(),
        answers: newAnswers,
        checkedQuestions: newChecked
      };

      try {
        // Save active session for immediate reopen
        localStorage.setItem('study_book_active_session', JSON.stringify({
          bookId: selectedBook.id,
          unitId: selectedUnit.id
        }));

        // Save global pointer for quick "Resume"
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));

        // Save unit specific data
        const unitStorageKey = `${STORAGE_KEY}_${selectedBook.id}_${selectedUnit.id}`;
        localStorage.setItem(unitStorageKey, JSON.stringify({
          ...progressData,
          strokes: newStrokes
        }));

        // Update overall units completion status map
        const answeredCount = Object.keys(newAnswers).filter(k => selectedUnit.questions.some(q => q.id === k)).length;
        const isCompleted = selectedUnit.questions.length > 0 && answeredCount >= selectedUnit.questions.length;
        setCompletedUnitsMap(prev => ({
          ...prev,
          [`${selectedBook.id}_${selectedUnit.id}`]: {
            isCompleted,
            answeredCount,
            total: selectedUnit.questions.length
          }
        }));
      } catch (e) {
        console.error('Failed to save progress', e);
      }
    }, 120);
  }, [selectedBook, selectedUnit]);

  // Handle Answer Selection
  const handleSelectOption = (question: StudyBookQuestion, optionIndex: number) => {
    const nextAnswers = { ...userAnswers, [question.id]: optionIndex };
    setUserAnswers(nextAnswers);

    const nextChecked = { ...checkedQuestions };
    if (autoCheckOnSelect) {
      nextChecked[question.id] = true;
      // If correct and not checked before, reward XP
      if (!checkedQuestions[question.id] && optionIndex === question.correctIndex) {
        onEarnXp?.(10, `Làm đúng câu ${question.number} trong ${selectedBook?.title}`);
      }
    }
    setCheckedQuestions(nextChecked);

    const currentIdx = selectedUnit?.questions.findIndex(q => q.id === question.id) ?? currentQuestionIndex;
    setCurrentQuestionIndex(currentIdx);

    // Immediate update to completedUnitsMap for snappy UI responsiveness
    if (selectedBook && selectedUnit) {
      const answeredCount = Object.keys(nextAnswers).filter(k => selectedUnit.questions.some(q => q.id === k)).length;
      const isCompleted = selectedUnit.questions.length > 0 && answeredCount >= selectedUnit.questions.length;
      setCompletedUnitsMap(prev => ({
        ...prev,
        [`${selectedBook.id}_${selectedUnit.id}`]: {
          isCompleted,
          answeredCount,
          total: selectedUnit.questions.length
        }
      }));
    }

    saveUnitProgress(nextAnswers, nextChecked, currentIdx, strokes);
  };

  // Toggle Instant Check for a question
  const handleToggleCheck = (questionId: string) => {
    const next = { ...checkedQuestions, [questionId]: !checkedQuestions[questionId] };
    setCheckedQuestions(next);
    saveUnitProgress(userAnswers, next, currentQuestionIndex, strokes);
  };

  // Reset current unit
  const handleResetUnit = () => {
    if (!selectedBook || !selectedUnit) return;
    if (window.confirm('Bạn có chắc chắn muốn làm lại từ đầu phần này không? Nét vẽ và đáp án đã chọn sẽ được làm mới.')) {
      setUserAnswers({});
      setCheckedQuestions({});
      setStrokes([]);
      setRevealedHints({});
      setCurrentQuestionIndex(0);
      setCompletedUnitsMap(prev => ({
        ...prev,
        [`${selectedBook.id}_${selectedUnit.id}`]: {
          isCompleted: false,
          answeredCount: 0,
          total: selectedUnit.questions.length
        }
      }));
      saveUnitProgress({}, {}, 0, []);
    }
  };

  // Quick Resume from Home Banner
  const handleResumeLastSession = () => {
    if (!lastSavedProgress) return;
    const targetBook = STUDY_BOOKS_DATA.find(b => b.id === lastSavedProgress.bookId);
    if (!targetBook) return;
    const targetUnit = targetBook.units.find(u => u.id === lastSavedProgress.unitId);
    if (!targetUnit) return;

    // Load actual unit answers to determine the exact unfinished question
    let answers = lastSavedProgress.answers || {};
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${targetBook.id}_${targetUnit.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        answers = parsed.answers || answers;
      }
    } catch {}

    const resumeIdx = calculateUnfinishedIndex(targetUnit.questions, answers, lastSavedProgress.questionIndex);

    setSelectedBook(targetBook);
    setSelectedUnit(targetUnit);
    setCurrentQuestionIndex(resumeIdx);

    // Scroll smoothly to question if in booklet view
    setTimeout(() => {
      const qTarget = targetUnit.questions[resumeIdx];
      if (qTarget) {
        const el = document.getElementById(`study-q-${qTarget.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
  };

  // =========================================================================
  // CANVAS DRAWING LOGIC (Paper ink circling & notes)
  // =========================================================================
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = bookletPaperRef.current;
    if (!canvas || !container) return;

    // When there are no user strokes, avoid forced layout reflows and texture allocations
    if (strokes.length === 0) {
      if (canvas.width > 0 || canvas.height > 0) {
        canvas.width = 0;
        canvas.height = 0;
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round(rect.width);
    const height = Math.round(container.scrollHeight);

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      let deltaY = 0;
      if (stroke.questionId && stroke.baseTop !== undefined && bookletPaperRef.current) {
        const card = bookletPaperRef.current.querySelector(`[data-question-id="${stroke.questionId}"]`) as HTMLElement;
        if (card) {
          deltaY = card.offsetTop - stroke.baseTop;
        }
      }

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.35;
      } else {
        ctx.globalAlpha = 0.9;
      }

      const p0 = stroke.points[0];
      ctx.moveTo(p0.x, p0.y + deltaY);

      for (let i = 1; i < stroke.points.length; i++) {
        const p = stroke.points[i];
        ctx.lineTo(p.x, p.y + deltaY);
      }
      ctx.stroke();
    });

    ctx.restore();
  }, [strokes]);

  useEffect(() => {
    if (strokes.length > 0) {
      redrawCanvas();
    }
    const handleResize = () => {
      if (strokes.length > 0) redrawCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas, strokes.length]);

  // Observer to adapt stroke positions when elements expand (debounced with rAF, only active when user has drawn strokes)
  useEffect(() => {
    if (!bookletPaperRef.current || strokes.length === 0) return;
    let rafId: number | null = null;
    const ro = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        redrawCanvas();
      });
    });
    ro.observe(bookletPaperRef.current);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [redrawCanvas, strokes.length]);

  const findNearestQuestionId = (pageY: number): { qId?: string; baseTop?: number } => {
    if (!bookletPaperRef.current) return {};
    const cards = Array.from(bookletPaperRef.current.querySelectorAll('[data-question-id]')) as HTMLElement[];
    let closestCard: HTMLElement | null = null;
    let minDistance = Infinity;

    cards.forEach(card => {
      const top = card.offsetTop;
      const bottom = top + card.offsetHeight;
      if (pageY >= top && pageY <= bottom) {
        closestCard = card;
        minDistance = 0;
      } else {
        const dist = Math.min(Math.abs(pageY - top), Math.abs(pageY - bottom));
        if (dist < minDistance && dist < 120) {
          minDistance = dist;
          closestCard = card;
        }
      }
    });

    if (closestCard) {
      const card = closestCard as HTMLElement;
      return {
        qId: card.getAttribute('data-question-id') || undefined,
        baseTop: card.offsetTop
      };
    }
    return {};
  };

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const container = bookletPaperRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top + container.scrollTop
    };
  };

  const handleStartDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    if (drawingTool === 'eraser') {
      eraseStrokeAt(coords.x, coords.y);
      setIsDrawing(true);
      return;
    }

    const { qId, baseTop } = findNearestQuestionId(coords.y);
    const newStroke: Stroke = {
      id: `stroke_${Date.now()}_${Math.random()}`,
      tool: drawingTool,
      color: drawingTool === 'highlighter' ? '#FACC15' : drawingColor,
      width: drawingTool === 'highlighter' ? 18 : drawingTool === 'pencil' ? 2 : 3.5,
      points: [coords],
      questionId: qId,
      baseTop
    };

    currentStrokeRef.current = newStroke;
    setIsDrawing(true);
  };

  const handleMoveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    if (drawingTool === 'eraser') {
      eraseStrokeAt(coords.x, coords.y);
      return;
    }

    if (currentStrokeRef.current) {
      currentStrokeRef.current.points.push(coords);
      setStrokes(prev => [...prev.filter(s => s.id !== currentStrokeRef.current?.id), { ...currentStrokeRef.current! }]);
    }
  };

  const handleEndDraw = () => {
    if (isDrawing && currentStrokeRef.current) {
      const finalStrokes = [...strokes.filter(s => s.id !== currentStrokeRef.current.id), currentStrokeRef.current];
      setStrokes(finalStrokes);
      saveUnitProgress(userAnswers, checkedQuestions, currentQuestionIndex, finalStrokes);
    }
    setIsDrawing(false);
    currentStrokeRef.current = null;
  };

  const eraseStrokeAt = (x: number, y: number) => {
    const threshold = 18;
    setStrokes(prev => prev.filter(stroke => {
      let deltaY = 0;
      if (stroke.questionId && stroke.baseTop !== undefined && bookletPaperRef.current) {
        const card = bookletPaperRef.current.querySelector(`[data-question-id="${stroke.questionId}"]`) as HTMLElement;
        if (card) deltaY = card.offsetTop - stroke.baseTop;
      }
      return !stroke.points.some(p => Math.hypot(p.x - x, (p.y + deltaY) - y) < threshold);
    }));
  };

  const handleUndo = () => {
    setStrokes(prev => {
      const next = prev.slice(0, -1);
      saveUnitProgress(userAnswers, checkedQuestions, currentQuestionIndex, next);
      return next;
    });
  };

  const handleClearStrokes = () => {
    if (strokes.length === 0) return;
    if (window.confirm('Xóa sạch tất cả các nét mực và ghi chú viết tay trên trang?')) {
      setStrokes([]);
      saveUnitProgress(userAnswers, checkedQuestions, currentQuestionIndex, []);
    }
  };

  // =========================================================================
  // VIEW: 1. BOOK DETAIL VIEW (when a book is clicked)
  // =========================================================================
  if (selectedBook && !selectedUnit) {
    return (
      <BookDetailView
        book={selectedBook}
        onBackToLibrary={() => setSelectedBook(null)}
        onSelectUnit={(unit) => {
          setSelectedUnit(unit);
          try {
            localStorage.setItem('study_book_active_session', JSON.stringify({
              bookId: selectedBook.id,
              unitId: unit.id
            }));
          } catch {}
        }}
        completedUnitsMap={completedUnitsMap}
        lastSavedProgress={lastSavedProgress}
      />
    );
  }

  // =========================================================================
  // VIEW: 2. REDESIGNED BOOK LIBRARY (when no book/unit is selected)
  // =========================================================================
  if (!selectedUnit) {
    return (
      <BookLibraryView
        books={STUDY_BOOKS_DATA}
        targetLevel={userProfile?.targetLevel || 'N4'}
        lastSavedProgress={lastSavedProgress}
        completedUnitsMap={completedUnitsMap}
        deletedBookIds={deletedBookIds}
        onBack={onBack}
        onOpenBookDetail={(book) => setSelectedBook(book)}
        onResumeSession={handleResumeLastSession}
        onQuickResumeBook={(book) => setSelectedBook(book)}
        onDeleteBook={handleDeleteBook}
        onRestoreBooks={handleRestoreBooks}
      />
    );
  }

  // =========================================================================
  // VIEW: 3. INTERACTIVE BOOKLET WORKSPACE (Khoanh đáp án, vẽ mực, check tức thì)
  // =========================================================================
  const activeBook = selectedBook || STUDY_BOOKS_DATA.find(b => b.units.some(u => u.id === selectedUnit.id)) || STUDY_BOOKS_DATA[0];
  const totalQuestionsCount = selectedUnit.questions.length;
  const answeredCount = Object.keys(userAnswers).filter(k => selectedUnit.questions.some(q => q.id === k)).length;
  const correctCount = selectedUnit.questions.filter(q => userAnswers[q.id] === q.correctIndex).length;

  return (
    <div id="study-booklet-workspace" className="h-full flex flex-col bg-[#111625] text-slate-100 select-none animate-in fade-in duration-200">
      {/* Top Workspace Navigation Bar */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              setSelectedUnit(null);
              try {
                localStorage.removeItem('study_book_active_session');
              } catch {}
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95"
            title="Quay lại mục lục bài học"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Mục lục sách</span>
          </button>

          <button
            onClick={() => {
              setSelectedUnit(null);
              setSelectedBook(null);
              try {
                localStorage.removeItem('study_book_active_session');
              } catch {}
            }}
            className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-750 text-slate-400 hover:text-slate-200 transition-colors hidden md:flex items-center gap-1 text-xs cursor-pointer"
            title="Quay về thư viện tất cả sách"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Thư viện</span>
          </button>

          <div className="min-w-0 pl-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-black rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {activeBook.title}
              </span>
              {selectedUnit.pageRange && (
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  {selectedUnit.pageRange}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {selectedUnit.title}
              </h2>
              {answeredCount === totalQuestionsCount && totalQuestionsCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1 shrink-0 animate-in fade-in shadow-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> Đã xong
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Tools & Progress */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
            <button
              onClick={() => setViewMode('booklet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'booklet' 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Xem nguyên bản như trang sách thật"
            >
              Toàn bộ đề
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'single' 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tập trung làm từng câu một"
            >
              Từng câu
            </button>
          </div>

          {/* Auto Check Toggle */}
          <button
            onClick={() => setAutoCheckOnSelect(!autoCheckOnSelect)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              autoCheckOnSelect 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Tự động hiện đáp án & giải thích ngay khi khoanh chọn"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Hiện giải thích tức thì</span>
          </button>

          {/* Hints Toggle - Hidden by default */}
          <button
            onClick={() => setShowHints(!showHints)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showHints 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={showHints ? "Đang hiện toàn bộ gợi ý (nhấn để ẩn)" : "Gợi ý đang ẩn mặc định (nhấn để hiện tất cả gợi ý)"}
          >
            {showHints ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{showHints ? 'Hiện gợi ý' : 'Ẩn gợi ý'}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleResetUnit}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700/70 text-slate-300 transition-colors"
            title="Làm lại từ đầu phần này"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Toolbar: Pen, Pencil, Highlighter, Eraser for Booklet */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-20 shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-slate-400 font-semibold mr-1 hidden sm:inline">Bút khoanh:</span>
          
          <button
            onClick={() => setDrawingTool('pen')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              drawingTool === 'pen' 
                ? 'bg-rose-500 text-white shadow' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Bút mực đỏ</span>
          </button>

          <button
            onClick={() => setDrawingTool('pencil')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              drawingTool === 'pencil' 
                ? 'bg-slate-200 text-slate-950 shadow' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-slate-400" />
            <span>Bút chì</span>
          </button>

          <button
            onClick={() => setDrawingTool('highlighter')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              drawingTool === 'highlighter' 
                ? 'bg-amber-400 text-amber-950 shadow' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Dạ quang</span>
          </button>

          <button
            onClick={() => setDrawingTool('eraser')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              drawingTool === 'eraser' 
                ? 'bg-blue-500 text-white shadow' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Tẩy</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-700 mx-1 hidden sm:block" />

          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            title="Hoàn tác nét vẽ (Undo)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClearStrokes}
            disabled={strokes.length === 0}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 disabled:opacity-40 transition-colors"
            title="Xóa tất cả nét mực trên trang"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Counters & Quick Jump */}
        <div className="flex items-center gap-2.5 text-xs">
          {(() => {
            const unfinishedIdx = calculateUnfinishedIndex(selectedUnit.questions, userAnswers, currentQuestionIndex);
            const isAllDone = Object.keys(userAnswers).filter(k => selectedUnit.questions.some(q => q.id === k)).length >= totalQuestionsCount;
            if (isAllDone) return null;

            return (
              <button
                onClick={() => {
                  const targetQ = selectedUnit.questions[unfinishedIdx];
                  if (targetQ) {
                    const el = document.getElementById(`study-q-${targetQ.id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setCurrentQuestionIndex(unfinishedIdx);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="Cuộn ngay tới câu chưa làm để tiếp tục"
              >
                <Target className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Làm tiếp #{unfinishedIdx + 1}</span>
              </button>
            );
          })()}

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <span className="text-slate-400">Đã làm:</span>
            <span className="font-bold text-white">{answeredCount}/{totalQuestionsCount}</span>
            {answeredCount === totalQuestionsCount && totalQuestionsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30 flex items-center gap-0.5">
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> Đã xong
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-emerald-400 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{correctCount} đúng</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto relative bg-[#1E2333]/50 p-2 sm:p-6 flex justify-center custom-scrollbar">
        {/* Paper Booklet Sheet Container */}
        <div 
          ref={bookletPaperRef}
          id="study-booklet-paper"
          className="w-full max-w-4xl bg-[#FCFAF2] text-slate-900 rounded-2xl shadow-2xl border border-[#E2D9C8] relative p-4 sm:p-10 min-h-[85vh] select-none"
          style={{
            backgroundImage: 'radial-gradient(#E8E1D3 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
          onMouseDown={handleStartDraw}
          onMouseMove={handleMoveDraw}
          onMouseUp={handleEndDraw}
          onTouchStart={handleStartDraw}
          onTouchMove={handleMoveDraw}
          onTouchEnd={handleEndDraw}
        >
          {/* Drawing Canvas Overlay */}
          <canvas
            ref={canvasRef}
            id="study-booklet-canvas"
            className="absolute inset-0 pointer-events-none z-10"
          />

          {/* Paper Header Decoration */}
          <div className="border-b-2 border-slate-900 pb-3 mb-6 flex items-end justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                {selectedBook.japaneseTitle}
              </span>
              <div className="flex items-center gap-2.5 mt-0.5">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900">
                  {selectedUnit.title}
                </h1>
                {answeredCount === totalQuestionsCount && totalQuestionsCount > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-xs">
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" /> Đã xong
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-xs font-bold text-slate-600">
              {selectedUnit.pageRange || `Mục ${selectedUnit.unitNumber}`}
            </div>
          </div>

          {/* VIEW MODE: BOOKLET SCROLL (Hiển thị nguyên vẹn như sách in) */}
          {viewMode === 'booklet' ? (
            <div className="space-y-8 relative z-20">
              {selectedUnit.questions.map((question, qIdx) => {
                const selectedOption = userAnswers[question.id];
                const isAnswered = selectedOption !== undefined;
                const isChecked = checkedQuestions[question.id];
                const isCorrect = isAnswered && selectedOption === question.correctIndex;
                const isCurrentUnfinished = qIdx === currentQuestionIndex && !isAnswered;

                return (
                  <div
                    key={question.id}
                    id={`study-q-${question.id}`}
                    data-question-id={question.id}
                    onClick={() => setCurrentQuestionIndex(qIdx)}
                    className={`p-4 rounded-xl border transition-colors duration-150 ${
                      isCurrentUnfinished
                        ? 'border-rose-500 bg-rose-50/70 shadow-sm ring-2 ring-rose-500/30'
                        : 'border-slate-300 bg-white shadow-xs hover:border-slate-400'
                    }`}
                  >
                    {/* Section Header if available */}
                    {question.sectionTitle && (() => {
                      const sectionQuestions = selectedUnit.questions.filter(q => q.sectionTitle === question.sectionTitle);
                      const isSectionDone = sectionQuestions.length > 0 && sectionQuestions.every(q => userAnswers[q.id] !== undefined);
                      return (
                        <div className="text-xs font-bold text-slate-700 bg-amber-100/80 border border-amber-300/70 px-3 py-1.5 rounded-lg mb-3 flex items-center justify-between">
                          <span>{question.sectionTitle}</span>
                          {isSectionDone && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-400/80 inline-flex items-center gap-1 shadow-xs">
                              <Check className="w-3 h-3 text-emerald-700 stroke-[3]" /> Đã xong phần này
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Reading Passage or Context Text */}
                    {question.contextText && (
                      <div className="p-3.5 mb-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed font-japanese whitespace-pre-line">
                        {question.contextText}
                      </div>
                    )}

                    {/* Question Header & Title */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm shadow-sm ${
                          isCurrentUnfinished ? 'bg-rose-600 text-white ring-2 ring-rose-400' : 'bg-slate-900 text-white'
                        }`}>
                          {question.number}
                        </span>
                        {isCurrentUnfinished && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500 text-white tracking-tight flex items-center gap-0.5 shadow-sm animate-pulse whitespace-nowrap">
                            <Target className="w-2.5 h-2.5" />
                            Đang làm
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-base sm:text-lg font-bold text-slate-900 font-japanese leading-relaxed">
                            {renderStudyQuestionText(question)}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                            {/* Nút Gợi ý: chỉ có kí hiệu icon, để cạnh nút phát âm */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleHintForQuestion(question.id);
                              }}
                              className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-colors duration-150 ${
                                (showHints || revealedHints[question.id])
                                  ? 'bg-amber-500/20 text-amber-500 border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                                  : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 border-slate-300/60 hover:border-amber-400/50'
                              }`}
                              title={(showHints || revealedHints[question.id]) ? "Ẩn gợi ý & dịch nghĩa" : "Xem gợi ý: Dịch câu & giải thích đáp án sai"}
                              aria-label="Gợi ý & dịch nghĩa"
                            >
                              <Lightbulb className="w-4 h-4" />
                            </button>

                            {/* Nút Phát âm câu hỏi */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayQuestionAudio(question);
                              }}
                              className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-colors duration-150 ${
                                playingAudioQuestionId === question.id
                                  ? 'bg-amber-500/20 text-amber-500 border-amber-400 ring-2 ring-amber-400/30 animate-pulse'
                                  : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 border-slate-300/60 hover:border-amber-400/50'
                              }`}
                              title="Nghe phát âm câu hỏi"
                              aria-label="Nghe phát âm câu hỏi"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Phần gợi ý dịch câu & giải thích đáp án sai */}
                        <StudyQuestionHintBox
                          question={question}
                          showHints={showHints}
                          isRevealed={!!revealedHints[question.id]}
                          onToggle={() => toggleHintForQuestion(question.id)}
                        />
                      </div>
                    </div>

                    {/* 4 Choices (Circles formatted like real JLPT booklet) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 ml-0 sm:ml-10">
                      {question.options.map((option, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        const isTheCorrectAnswer = question.correctIndex === optIdx;

                        let buttonStyles = 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50';
                        if (isChecked) {
                          if (isTheCorrectAnswer) {
                            buttonStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30 font-semibold';
                          } else if (isChosen && !isTheCorrectAnswer) {
                            buttonStyles = 'border-rose-400 bg-rose-50/90 text-rose-900';
                          }
                        } else if (isChosen) {
                          buttonStyles = 'border-rose-500 bg-rose-50/70 text-rose-900 ring-2 ring-rose-500/40 font-semibold';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(question, optIdx)}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors duration-150 active:scale-[0.99] ${buttonStyles}`}
                          >
                            {/* Circle number bubble (1) (2) (3) (4) */}
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-colors duration-150 ${
                              isChecked && isTheCorrectAnswer
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : isChosen
                                ? 'bg-rose-500 border-rose-500 text-white'
                                : 'border-slate-400 bg-slate-100 text-slate-700'
                            }`}>
                              {optIdx + 1}
                            </span>
                            <span className="text-sm font-medium font-japanese flex-1">
                              {option}
                            </span>

                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              {isChecked && isTheCorrectAnswer && (
                                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                              )}
                              {isChecked && isChosen && !isTheCorrectAnswer && (
                                <XCircle className="w-4 h-4 text-rose-500" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Check button when explanation is not shown */}
                    {!isChecked && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between ml-0 sm:ml-10">
                        <div className="flex items-center gap-2">
                          {isAnswered && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              Đã chọn: ({selectedOption + 1})
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleCheck(question.id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm active:scale-95"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          Kiểm tra đáp án & Giải thích
                        </button>
                      </div>
                    )}

                    {/* Smooth expanding explanation container */}
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                        isChecked ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden">
                        {isChecked && (
                          <StudyExplanationCard
                            question={question}
                            selectedOption={selectedOption}
                            isChecked={isChecked}
                            onToggleHide={() => handleToggleCheck(question.id)}
                            isCorrect={isCorrect}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Booklet Completion Banner */}
              {answeredCount === totalQuestionsCount && totalQuestionsCount > 0 && (
                <div className="mt-8 p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-400/80 text-center shadow-md">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-3 shadow-inner">
                    <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-emerald-200/90 text-emerald-900 text-xs font-black uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> ĐÃ HOÀN THÀNH PHẦN NÀY
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Bạn đã hoàn thành tất cả {totalQuestionsCount} câu hỏi!
                  </h3>
                  <p className="text-xs text-slate-700 mt-1">
                    Kết quả: <b className="text-emerald-800 font-bold">{correctCount}/{totalQuestionsCount}</b> câu đúng ({Math.round((correctCount / totalQuestionsCount) * 100)}%)
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* VIEW MODE: SINGLE QUESTION FOCUS */
            (() => {
              const question = selectedUnit.questions[currentQuestionIndex];
              if (!question) return null;
              const selectedOption = userAnswers[question.id];
              const isAnswered = selectedOption !== undefined;
              const isChecked = checkedQuestions[question.id];
              const isCorrect = isAnswered && selectedOption === question.correctIndex;

              return (
                <motion.div 
                  key={question.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  id={`study-q-${question.id}`}
                  data-question-id={question.id}
                  className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 shadow-md relative z-20 space-y-5"
                >
                  {/* Jump Header & Question Navigation Bar */}
                  <div className="border-b border-slate-200 dark:border-slate-700/80 pb-3 space-y-2.5">
                    {/* Top Row: Title & Prev/Next Quick Controls */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs tracking-wider uppercase whitespace-nowrap shrink-0 border border-rose-500/20">
                          Câu hỏi {currentQuestionIndex + 1} / {totalQuestionsCount}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:inline font-medium">
                          • Đã làm {answeredCount}/{totalQuestionsCount}
                        </span>
                        {answeredCount === totalQuestionsCount && totalQuestionsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" /> Đã xong
                          </span>
                        )}
                      </div>

                      {/* Quick Prev / Next Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={currentQuestionIndex === 0}
                          onClick={() => {
                            const nextIdx = Math.max(0, currentQuestionIndex - 1);
                            setCurrentQuestionIndex(nextIdx);
                            saveUnitProgress(userAnswers, checkedQuestions, nextIdx, strokes);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-all text-xs font-bold flex items-center gap-1 shadow-xs"
                          title="Câu trước"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Trước</span>
                        </button>
                        <button
                          type="button"
                          disabled={currentQuestionIndex >= totalQuestionsCount - 1}
                          onClick={() => {
                            const nextIdx = Math.min(totalQuestionsCount - 1, currentQuestionIndex + 1);
                            setCurrentQuestionIndex(nextIdx);
                            saveUnitProgress(userAnswers, checkedQuestions, nextIdx, strokes);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-all text-xs font-bold flex items-center gap-1 shadow-xs"
                          title="Câu tiếp theo"
                        >
                          <span className="hidden sm:inline">Tiếp</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question Number Strip (Full width, horizontal scrollable, no squishing) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                      {selectedUnit.questions.map((q, idx) => {
                        const isDone = userAnswers[q.id] !== undefined;
                        const isCheckedQ = checkedQuestions[q.id];
                        const isCur = idx === currentQuestionIndex;
                        const isCorrectQ = isDone && userAnswers[q.id] === q.correctIndex;

                        let btnStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700';
                        if (isCur) {
                          btnStyle = 'bg-rose-600 text-white font-black ring-2 ring-rose-400 shadow-sm scale-105 z-10 border-rose-600';
                        } else if (isCheckedQ) {
                          if (isCorrectQ) {
                            btnStyle = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600 font-bold';
                          } else {
                            btnStyle = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-bold';
                          }
                        } else if (isDone) {
                          btnStyle = 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold';
                        }

                        return (
                          <button
                            key={q.id}
                            id={`single-nav-btn-${idx}`}
                            type="button"
                            onClick={() => {
                              setCurrentQuestionIndex(idx);
                              saveUnitProgress(userAnswers, checkedQuestions, idx, strokes);
                            }}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold shrink-0 border transition-all flex items-center justify-center ${btnStyle}`}
                            title={`Câu ${idx + 1}${isDone ? (isCheckedQ ? (isCorrectQ ? ' (Đúng)' : ' (Sai)') : ' (Đã chọn đáp án)') : ' (Chưa làm)'}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {question.sectionTitle && (
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300/60 dark:border-amber-700/60 px-3 py-1.5 rounded-lg">
                      {question.sectionTitle}
                    </div>
                  )}

                  {question.contextText && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-japanese whitespace-pre-line">
                      {question.contextText}
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-rose-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                      {question.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 font-japanese leading-relaxed">
                          {renderStudyQuestionText(question)}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                          {/* Nút Gợi ý: chỉ có kí hiệu icon, để cạnh nút phát âm */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleHintForQuestion(question.id);
                            }}
                            className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-all ${
                              (showHints || revealedHints[question.id])
                                ? 'bg-amber-500/20 text-amber-500 border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 border-slate-300/60 hover:border-amber-400/50'
                            }`}
                            title={(showHints || revealedHints[question.id]) ? "Ẩn gợi ý & dịch nghĩa" : "Xem gợi ý: Dịch câu & giải thích đáp án sai"}
                            aria-label="Gợi ý & dịch nghĩa"
                          >
                            <Lightbulb className="w-4 h-4" />
                          </button>

                          {/* Nút Phát âm câu hỏi */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayQuestionAudio(question);
                            }}
                            className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-all ${
                              playingAudioQuestionId === question.id
                                ? 'bg-amber-500/20 text-amber-500 border-amber-400 ring-2 ring-amber-400/30 animate-pulse'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 border-slate-300/60 hover:border-amber-400/50'
                            }`}
                            title="Nghe phát âm câu hỏi"
                            aria-label="Nghe phát âm câu hỏi"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Phần gợi ý dịch câu & giải thích đáp án sai */}
                      <StudyQuestionHintBox
                        question={question}
                        showHints={showHints}
                        isRevealed={!!revealedHints[question.id]}
                        onToggle={() => toggleHintForQuestion(question.id)}
                      />
                    </div>
                  </div>

                  {/* 4 Choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {question.options.map((option, optIdx) => {
                      const isChosen = selectedOption === optIdx;
                      const isTheCorrectAnswer = question.correctIndex === optIdx;

                      let buttonStyles = 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800';
                      if (isChecked) {
                        if (isTheCorrectAnswer) {
                          buttonStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30 font-semibold';
                        } else if (isChosen && !isTheCorrectAnswer) {
                          buttonStyles = 'border-rose-400 bg-rose-50/90 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
                        }
                      } else if (isChosen) {
                        buttonStyles = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/40 font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(question, optIdx)}
                          className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-colors duration-150 active:scale-[0.99] ${buttonStyles}`}
                        >
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-colors duration-150 ${
                            isChecked && isTheCorrectAnswer
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : isChosen
                              ? 'bg-rose-500 border-rose-500 text-white'
                              : 'border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {optIdx + 1}
                          </span>
                          <span className="text-base font-medium font-japanese flex-1">
                            {option}
                          </span>

                          <div className="w-5 h-5 flex items-center justify-center shrink-0">
                            {isChecked && isTheCorrectAnswer && (
                              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                            )}
                            {isChecked && isChosen && !isTheCorrectAnswer && (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Single mode explanation & controls */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      onClick={() => handleToggleCheck(question.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isChecked
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                      }`}
                    >
                      {isChecked ? 'Ẩn giải thích' : '💡 Kiểm tra đáp án & Giải thích ngay'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => {
                          const nextIdx = Math.max(0, currentQuestionIndex - 1);
                          setCurrentQuestionIndex(nextIdx);
                          saveUnitProgress(userAnswers, checkedQuestions, nextIdx, strokes);
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        Câu trước
                      </button>
                      <button
                        disabled={currentQuestionIndex >= totalQuestionsCount - 1}
                        onClick={() => {
                          const nextIdx = Math.min(totalQuestionsCount - 1, currentQuestionIndex + 1);
                          setCurrentQuestionIndex(nextIdx);
                          saveUnitProgress(userAnswers, checkedQuestions, nextIdx, strokes);
                        }}
                        className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-40 shadow-sm"
                      >
                        Câu tiếp theo ➔
                      </button>
                    </div>
                  </div>

                  {isChecked && (
                    <div className="pt-2">
                      <StudyExplanationCard
                        question={question}
                        selectedOption={selectedOption}
                        isChecked={isChecked}
                        onToggleHide={() => handleToggleCheck(question.id)}
                        isCorrect={isCorrect}
                      />
                    </div>
                  )}

                  {/* Single Mode Completion Banner */}
                  {answeredCount === totalQuestionsCount && totalQuestionsCount > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                            Đã hoàn thành tất cả {totalQuestionsCount} câu hỏi của phần này!
                          </p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            Kết quả: {correctCount}/{totalQuestionsCount} câu đúng ({Math.round((correctCount / totalQuestionsCount) * 100)}%)
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-black rounded-full bg-emerald-200 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 border border-emerald-400 shrink-0 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Đã xong
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
