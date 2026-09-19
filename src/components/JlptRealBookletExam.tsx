/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Edit3, 
  Highlighter, 
  Eraser, 
  StickyNote, 
  Undo2, 
  Redo2, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Volume2, 
  Play, 
  Square, 
  Bookmark, 
  Move,
  Layers,
  Award,
  Filter,
  ArrowRight,
  Maximize2,
  Minimize2,
  History,
  FileDown,
  Printer,
  RefreshCw,
  BookOpen,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DailyExam, ExamQuestion, UserProfile, ExamHistoryRecord } from '../types';
import { JLPT_SECTION_METAS, ExamSectionMode } from './DailyExamQuiz';
import { getDetailedQuestionCorrection, DetailedQuestionCorrection } from '../utils/questionOptionExplainer';
import { HandwrittenExamQuestionAnnotator } from './HandwrittenExamQuestionAnnotator';
import { parseDokkaiQuestion, annotateSentence } from '../utils/japaneseSentenceAnnotator';
import { saveExamAttempt } from '../utils/examHistoryStorage';
import { ExamHistoryModal } from './ExamHistoryModal';
import { PrintableExamBooklet } from './PrintableExamBooklet';
import { renderStudyQuestionText } from '../utils/questionFormatUtils';

interface DrawingStroke {
  id: string;
  tool: 'pen' | 'highlighter';
  color: string;
  size: number;
  points: { x: number; y: number }[];
  questionId?: string;
  baseTop?: number;
  baseLeft?: number;
}

export interface NoteCorrectionItem {
  id: string;
  status: 'CORRECT' | 'WRONG' | 'PARTIAL' | 'TIP';
  score?: number;
  teacherFeedback: string;
  correctedContent?: string;
  keyExplanation?: string;
  memoryTip?: string;
}

export interface StickyNoteItem {
  id: string;
  x: number;
  y: number;
  text: string;
  color: 'yellow' | 'green' | 'pink' | 'blue';
  linkedQuestionId?: string;
  aiCorrection?: NoteCorrectionItem;
}

interface JlptRealBookletExamProps {
  exam: DailyExam;
  sectionMode: ExamSectionMode;
  userProfile: UserProfile;
  userAnswers: Record<string, number>;
  onSelectAnswer: (questionId: string, optionIndex: number) => void;
  onSubmitExam: () => void;
  isSubmitted: boolean;
  onExit: () => void;
  flaggedQuestions: Record<string, boolean>;
  onToggleFlag: (questionId: string) => void;
  timeRemainingSeconds?: number;
  formatTime: (sec: number) => string;
  onSwitchViewFormat?: () => void;
  onRestartExam?: () => void;
  onOpenHistory?: () => void;
}

const PEN_COLORS = [
  { id: 'pencil', label: 'Bút chì thi cử (Chì 2B)', color: '#1e293b' },
  { id: 'red', label: 'Bút đỏ chấm bài', color: '#dc2626' },
  { id: 'blue', label: 'Bút bi xanh ghi chú', color: '#2563eb' },
];

const HIGHLIGHT_COLORS = [
  { id: 'yellow', label: 'Dạ quang Vàng neon', color: '#facc15' },
  { id: 'green', label: 'Dạ quang Xanh lá', color: '#4ade80' },
  { id: 'pink', label: 'Dạ quang Hồng', color: '#f472b6' },
  { id: 'orange', label: 'Dạ quang Cam', color: '#fb923c' },
];

export const JlptRealBookletExam: React.FC<JlptRealBookletExamProps> = ({
  exam,
  sectionMode,
  userProfile,
  userAnswers,
  onSelectAnswer,
  onSubmitExam,
  isSubmitted,
  onExit,
  flaggedQuestions,
  onToggleFlag,
  timeRemainingSeconds = 0,
  formatTime,
  onSwitchViewFormat,
  onRestartExam,
  onOpenHistory
}) => {
  // Filter questions based on section
  const allQuestions = exam.questions.filter(q => sectionMode === 'ALL' || q.section === sectionMode);

  // History and Print State
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [selectedPrintRecord, setSelectedPrintRecord] = useState<ExamHistoryRecord | null>(null);
  const hasAutoSavedRef = useRef<boolean>(false);

  // Auto-save history when submitted
  useEffect(() => {
    if (isSubmitted && exam && !hasAutoSavedRef.current) {
      hasAutoSavedRef.current = true;
      const relevantQuestions = sectionMode === 'ALL'
        ? exam.questions
        : exam.questions.filter(q => q.section === sectionMode);
      let correct = 0;
      relevantQuestions.forEach(q => {
        if (userAnswers[q.id] === q.correctIndex) correct++;
      });
      const total = relevantQuestions.length;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const pass = pct >= 60;

      saveExamAttempt({
        examId: exam.id,
        examTitle: exam.title,
        level: exam.level,
        sectionMode: sectionMode,
        score: correct,
        totalQuestions: total,
        percentage: pct,
        passed: pass,
        timeSpentSeconds: 0,
        userAnswers: { ...userAnswers },
        questionNotes: { ...questionNotes },
        examSnapshot: exam
      });
    }
    if (!isSubmitted) {
      hasAutoSavedRef.current = false;
    }
  }, [isSubmitted, exam, sectionMode, userAnswers]);

  // Review Filter after submission
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'UNANSWERED'>('ALL');

  // Filtered list for display
  const questions = allQuestions.filter(q => {
    if (!isSubmitted || reviewFilter === 'ALL') return true;
    const ans = userAnswers[q.id];
    if (reviewFilter === 'CORRECT') return ans === q.correctIndex;
    if (reviewFilter === 'WRONG') return ans !== undefined && ans !== q.correctIndex;
    if (reviewFilter === 'UNANSWERED') return ans === undefined;
    return true;
  });

  // Group questions by section for authentic JLPT section headers
  const mojiGoiQuestions = questions.filter(q => q.section === 'moji-goi');
  const bunpouQuestions = questions.filter(q => q.section === 'bunpou');
  const dokkaiQuestions = questions.filter(q => q.section === 'dokkai');
  const choukaiQuestions = questions.filter(q => q.section === 'choukai');

  // Annotation Tool State
  const [activeTool, setActiveTool] = useState<'cursor' | 'pen' | 'highlighter' | 'eraser' | 'note'>('cursor');
  const [penColor, setPenColor] = useState<string>('#1e293b');
  const [highlightColor, setHighlightColor] = useState<string>('#facc15');
  const [penSize, setPenSize] = useState<number>(2.5);
  const [highlightSize, setHighlightSize] = useState<number>(14);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showAudioScripts, setShowAudioScripts] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [smartPenRecognition, setSmartPenRecognition] = useState<boolean>(true);
  const [recognitionFeedback, setRecognitionFeedback] = useState<{ message: string; key: number } | null>(null);
  const [showDrawingToolbar, setShowDrawingToolbar] = useState<boolean>(false);

  // Theme state: 'auto' | 'light' | 'dark'
  const [themeMode, setThemeMode] = useState<'auto' | 'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('jlpt_exam_theme_mode');
      if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    } catch {}
    return 'auto';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = themeMode === 'dark' || (themeMode === 'auto' && systemIsDark);

  const toggleThemeMode = () => {
    setThemeMode(prev => {
      const next = prev === 'auto' ? 'light' : prev === 'light' ? 'dark' : 'auto';
      try {
        localStorage.setItem('jlpt_exam_theme_mode', next);
      } catch {}
      return next;
    });
  };

  // Auto-clear recognition feedback after 2.5s
  useEffect(() => {
    if (!recognitionFeedback) return;
    const timer = setTimeout(() => {
      setRecognitionFeedback(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [recognitionFeedback]);

  // Audio Playback State for Choukai
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const audioSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Canvas Drawing History
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<DrawingStroke[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteItem[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Question-specific margin notes & AI teacher corrections
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});
  const [questionNoteCorrections, setQuestionNoteCorrections] = useState<Record<string, NoteCorrectionItem>>({});
  const [isReviewingNotes, setIsReviewingNotes] = useState<boolean>(false);
  const [noteReviewCompleted, setNoteReviewCompleted] = useState<boolean>(false);

  // Canvas & Container Refs
  const bookletContainerRef = useRef<HTMLDivElement>(null);
  const bookletPaperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);
  const activeStrokeQuestionRef = useRef<{ qId?: string; baseTop?: number; baseLeft?: number }>({});

  // Subtle audio click/pencil feedback
  const playPencilClickSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio context might be restricted before interaction
    }
  }, []);

  // Smart Pen Circle & Tap Recognition Algorithm
  const processPenGesture = useCallback((pts: { x: number; y: number }[]) => {
    if (isSubmitted || !smartPenRecognition || pts.length === 0) return;

    const paper = bookletPaperRef.current;
    if (!paper) return;

    const paperRect = paper.getBoundingClientRect();
    const optionElements = Array.from(paper.querySelectorAll<HTMLElement>('[data-exam-option="true"]'));

    if (optionElements.length === 0) return;

    // Stroke bounding box and metrics
    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y));
    const maxY = Math.max(...pts.map(p => p.y));
    const strokeWidth = maxX - minX;
    const strokeHeight = maxY - minY;
    const strokeCenterX = (minX + maxX) / 2;
    const strokeCenterY = (minY + maxY) / 2;

    let pathLength = 0;
    for (let i = 1; i < pts.length; i++) {
      pathLength += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    }
    const isTap = pts.length <= 3 || pathLength < 22;

    let bestMatch: { qId: string; optIdx: number; score: number; el: HTMLElement } | null = null;

    optionElements.forEach(el => {
      const qId = el.getAttribute('data-question-id');
      const optIdxStr = el.getAttribute('data-option-index');
      if (!qId || optIdxStr === null) return;
      const optIdx = parseInt(optIdxStr, 10);
      if (isNaN(optIdx)) return;

      const elRect = el.getBoundingClientRect();
      const left = elRect.left - paperRect.left;
      const right = elRect.right - paperRect.left;
      const top = elRect.top - paperRect.top;
      const bottom = elRect.bottom - paperRect.top;
      const optCenterX = (left + right) / 2;
      const optCenterY = (top + bottom) / 2;

      // Option number badge (1, 2, 3, 4) box metrics
      const numBadge = el.querySelector<HTMLElement>('[data-option-number-box="true"]');
      let numLeft = left;
      let numRight = left + 36;
      let numTop = top;
      let numBottom = top + 36;
      let numCenterX = (numLeft + numRight) / 2;
      let numCenterY = (numTop + numBottom) / 2;

      if (numBadge) {
        const numRect = numBadge.getBoundingClientRect();
        numLeft = numRect.left - paperRect.left;
        numRight = numRect.right - paperRect.left;
        numTop = numRect.top - paperRect.top;
        numBottom = numRect.bottom - paperRect.top;
        numCenterX = (numLeft + numRight) / 2;
        numCenterY = (numTop + numBottom) / 2;
      }

      let score = 0;

      if (isTap) {
        // Direct tap on option or number
        const tapX = pts[0].x;
        const tapY = pts[0].y;
        if (tapX >= left - 8 && tapX <= right + 8 && tapY >= top - 8 && tapY <= bottom + 8) {
          score += 100;
        }
        const distToNum = Math.hypot(tapX - numCenterX, tapY - numCenterY);
        if (distToNum < 28) {
          score += 60;
        }
      } else {
        // Circling or stroke drawing
        const distToNum = Math.hypot(strokeCenterX - numCenterX, strokeCenterY - numCenterY);
        const distToOpt = Math.hypot(strokeCenterX - optCenterX, strokeCenterY - optCenterY);

        // 1. Distance to number circle (highest priority for circling (1), (2), etc.)
        if (distToNum < 32) score += 90;
        else if (distToNum < 55) score += 60;
        else if (distToNum < 85) score += 30;

        // 2. Distance to entire option line
        if (distToOpt < 45) score += 60;
        else if (distToOpt < 90) score += 35;

        // 3. Stroke bounding box encloses the number circle
        if (minX <= numLeft + 8 && maxX >= numRight - 8 && minY <= numTop + 8 && maxY >= numBottom - 8) {
          score += 95;
        }

        // 4. Center of number box is within the stroke bounding box
        if (numCenterX >= minX - 8 && numCenterX <= maxX + 8 && numCenterY >= minY - 8 && numCenterY <= maxY + 8) {
          score += 65;
        }

        // 5. Center of option is within stroke bounding box
        if (optCenterX >= minX - 10 && optCenterX <= maxX + 10 && optCenterY >= minY - 10 && optCenterY <= maxY + 10) {
          score += 45;
        }

        // 6. Percentage of stroke points intersecting option boundary
        const ptsInside = pts.filter(p => p.x >= left - 10 && p.x <= right + 10 && p.y >= top - 10 && p.y <= bottom + 10).length;
        const ratio = ptsInside / pts.length;
        if (ratio > 0.25) {
          score += ratio * 60;
        }

        // 7. Closed loop check (drawing a circle)
        const startEndDist = Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
        const isLoop = startEndDist < Math.max(strokeWidth, strokeHeight) * 0.8;
        if (isLoop && distToNum < 65) {
          score += 40;
        }
      }

      if (score > (bestMatch?.score || 0)) {
        bestMatch = { qId, optIdx, score, el };
      }
    });

    if (bestMatch && bestMatch.score >= 38) {
      onSelectAnswer(bestMatch.qId, bestMatch.optIdx);
      playPencilClickSound();

      // Find question index for feedback message
      const qIndex = allQuestions.findIndex(q => q.id === bestMatch?.qId) + 1;
      setRecognitionFeedback({
        message: `✍️ Đã nhận diện nét khoanh: Câu (${qIndex}) ➜ Phương án (${bestMatch.optIdx + 1})`,
        key: Date.now()
      });

      // Brief flash animation on element
      bestMatch.el.classList.add('ring-2', 'ring-amber-500', 'bg-amber-100/60');
      setTimeout(() => {
        bestMatch?.el.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-100/60');
      }, 600);
    }
  }, [allQuestions, isSubmitted, onSelectAnswer, playPencilClickSound, smartPenRecognition]);

  // Load saved annotations for this exam
  const storageKey = `jlpt_exam_annotations_${exam.id}_${sectionMode}`;
  const qNotesStorageKey = `jlpt_exam_q_notes_${exam.id}_${sectionMode}`;
  const correctionsStorageKey = `jlpt_exam_corrections_${exam.id}_${sectionMode}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.strokes) setStrokes(parsed.strokes);
        if (parsed.stickyNotes) setStickyNotes(parsed.stickyNotes);
      }
      const savedNotes = localStorage.getItem(qNotesStorageKey);
      if (savedNotes) {
        setQuestionNotes(JSON.parse(savedNotes));
      }
      const savedCorrections = localStorage.getItem(correctionsStorageKey);
      if (savedCorrections) {
        setQuestionNoteCorrections(JSON.parse(savedCorrections));
        setNoteReviewCompleted(true);
      }
    } catch (e) {
      console.warn('Failed to load annotations:', e);
    }
  }, [exam.id, sectionMode, storageKey, qNotesStorageKey, correctionsStorageKey]);

  // Save annotations automatically
  const saveAnnotations = useCallback((newStrokes: DrawingStroke[], newNotes: StickyNoteItem[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        strokes: newStrokes,
        stickyNotes: newNotes,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Failed to save annotations:', e);
    }
  }, [storageKey]);

  // Update per-question note
  const handleUpdateQuestionNote = useCallback((qId: string, noteText: string) => {
    setQuestionNotes(prev => {
      const updated = { ...prev, [qId]: noteText };
      try {
        localStorage.setItem(qNotesStorageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [qNotesStorageKey]);

  // AI Teacher Note Review & Correction Algorithm
  const handleReviewAllNotes = useCallback(async (
    customNotes?: Record<string, string>, 
    customSticky?: StickyNoteItem[]
  ) => {
    const activeQNotes = customNotes || questionNotes;
    const activeSticky = customSticky || stickyNotes;

    const payloadNotes: any[] = [];

    // Collect question notes
    Object.entries(activeQNotes).forEach(([qId, text]) => {
      const clean = text.trim();
      if (!clean) return;
      const q = allQuestions.find(item => item.id === qId);
      payloadNotes.push({
        id: `q_${qId}`,
        text: clean,
        questionContext: q ? {
          questionId: q.id,
          questionText: q.question,
          correctOption: q.options[q.correctIndex],
          explanation: q.explanation,
          hint: q.hint,
          options: q.options,
          level: exam.level
        } : undefined
      });
    });

    // Collect sticky notes
    activeSticky.forEach(note => {
      const clean = note.text.trim();
      if (!clean) return;
      payloadNotes.push({
        id: `sticky_${note.id}`,
        text: clean,
        questionContext: {
          level: exam.level,
          hint: 'Ghi chú tự do trên trang đề thi JLPT'
        }
      });
    });

    if (payloadNotes.length === 0) {
      setNoteReviewCompleted(true);
      return;
    }

    setIsReviewingNotes(true);
    try {
      const res = await fetch('/api/exam/review-user-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: payloadNotes })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.corrections)) {
        const newQCorrections: Record<string, NoteCorrectionItem> = {};
        const correctionsMap = new Map<string, NoteCorrectionItem>();
        data.corrections.forEach((c: NoteCorrectionItem) => {
          correctionsMap.set(c.id, c);
          if (c.id.startsWith('q_')) {
            const qId = c.id.replace('q_', '');
            newQCorrections[qId] = c;
          }
        });

        // Update sticky notes with AI correction
        const updatedSticky = activeSticky.map(s => {
          const corr = correctionsMap.get(`sticky_${s.id}`);
          if (corr) {
            return { ...s, aiCorrection: corr };
          }
          return s;
        });

        setQuestionNoteCorrections(newQCorrections);
        setStickyNotes(updatedSticky);
        saveAnnotations(strokes, updatedSticky);
        try {
          localStorage.setItem(correctionsStorageKey, JSON.stringify(newQCorrections));
        } catch {}
        setNoteReviewCompleted(true);
      }
    } catch (err) {
      console.error('Error reviewing notes:', err);
    } finally {
      setIsReviewingNotes(false);
    }
  }, [allQuestions, exam.level, questionNotes, stickyNotes, strokes, saveAnnotations, correctionsStorageKey]);

  // Auto-review notes when exam is submitted
  useEffect(() => {
    if (isSubmitted && !noteReviewCompleted) {
      const hasAnyNotes = Object.values(questionNotes).some(t => t.trim().length > 0) || 
                          stickyNotes.some(s => s.text.trim().length > 0);
      if (hasAnyNotes) {
        handleReviewAllNotes();
      } else {
        setNoteReviewCompleted(true);
      }
    }
  }, [isSubmitted, noteReviewCompleted, questionNotes, stickyNotes, handleReviewAllNotes]);

  // Handle Resize and redraw canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = bookletPaperRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = container.scrollHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      let deltaX = 0;
      let deltaY = 0;
      if (stroke.questionId && stroke.baseTop !== undefined && bookletPaperRef.current) {
        const card = bookletPaperRef.current.querySelector(`[data-question-id="${stroke.questionId}"]`) as HTMLElement;
        if (card) {
          deltaY = card.offsetTop - stroke.baseTop;
          deltaX = card.offsetLeft - (stroke.baseLeft || 0);
        }
      }

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'highlighter') {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = stroke.size;
        ctx.globalCompositeOperation = 'multiply';
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.92;
        ctx.lineWidth = stroke.size;
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(stroke.points[0].x + deltaX, stroke.points[0].y + deltaY);
      for (let i = 1; i < stroke.points.length; i++) {
        const xc = (stroke.points[i].x + deltaX + stroke.points[i - 1].x + deltaX) / 2;
        const yc = (stroke.points[i].y + deltaY + stroke.points[i - 1].y + deltaY) / 2;
        ctx.quadraticCurveTo(stroke.points[i - 1].x + deltaX, stroke.points[i - 1].y + deltaY, xc, yc);
      }
      ctx.lineTo(stroke.points[stroke.points.length - 1].x + deltaX, stroke.points[stroke.points.length - 1].y + deltaY);
      ctx.stroke();
    });

    ctx.restore();
  }, [strokes]);

  // Trigger redraw on strokes, zoom, or submission state changes
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas, zoomLevel, isSubmitted]);

  // Use ResizeObserver on bookletPaperRef so any DOM expansion (solutions, notes, fonts) automatically updates canvas
  useEffect(() => {
    const container = bookletPaperRef.current;
    if (!container) return;

    let rafId: number | null = null;
    const ro = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        redrawCanvas();
      });
    });
    ro.observe(container);

    const handleResize = () => redrawCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [redrawCanvas]);

  // Extra layout-settling redraws when exam is submitted or solutions are shown
  useEffect(() => {
    if (!isSubmitted) return;
    const t1 = setTimeout(() => redrawCanvas(), 60);
    const t2 = setTimeout(() => redrawCanvas(), 260);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isSubmitted, redrawCanvas]);

  // Pointer & Mouse Drawing Handlers
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'cursor') return;

    if (activeTool === 'note') {
      const coords = getCoordinates(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const xPercent = (coords.x / rect.width) * 100;
      const yPercent = (coords.y / rect.height) * 100;

      const newNote: StickyNoteItem = {
        id: `note_${Date.now()}`,
        x: Math.min(Math.max(xPercent, 5), 85),
        y: yPercent,
        text: 'Ghi chú...',
        color: 'yellow'
      };
      const updatedNotes = [...stickyNotes, newNote];
      setStickyNotes(updatedNotes);
      setEditingNoteId(newNote.id);
      saveAnnotations(strokes, updatedNotes);
      setActiveTool('cursor');
      return;
    }

    if (activeTool === 'eraser') {
      const coords = getCoordinates(e);
      eraseStrokeNear(coords.x, coords.y);
      isDrawingRef.current = true;
      return;
    }

    const canvas = canvasRef.current;
    let cardEl: HTMLElement | null = null;
    if (canvas) {
      canvas.style.pointerEvents = 'none';
      const el = document.elementFromPoint(e.clientX, e.clientY);
      cardEl = el?.closest('[data-question-id]') as HTMLElement | null;
      canvas.style.pointerEvents = '';
    }

    // Fallback if click starts in margin, padding, or spacing near a question card
    if (!cardEl && bookletPaperRef.current) {
      const cards = Array.from(bookletPaperRef.current.querySelectorAll<HTMLElement>('[data-question-id]'));
      let closestCard: HTMLElement | null = null;
      let minDistance = Infinity;

      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          closestCard = card;
          minDistance = 0;
          break;
        }
        const dist = Math.min(Math.abs(e.clientY - rect.top), Math.abs(e.clientY - rect.bottom));
        if (dist < minDistance) {
          minDistance = dist;
          closestCard = card;
        }
      }

      if (closestCard && minDistance < 150) {
        cardEl = closestCard;
      }
    }

    if (cardEl) {
      activeStrokeQuestionRef.current = {
        qId: cardEl.getAttribute('data-question-id') || undefined,
        baseTop: cardEl.offsetTop,
        baseLeft: cardEl.offsetLeft
      };
    } else {
      activeStrokeQuestionRef.current = {};
    }

    isDrawingRef.current = true;
    const coords = getCoordinates(e);
    currentPointsRef.current = [coords];
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const coords = getCoordinates(e);

    if (activeTool === 'eraser') {
      eraseStrokeNear(coords.x, coords.y);
      return;
    }

    currentPointsRef.current.push(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);

    const pts = currentPointsRef.current;
    if (pts.length >= 2) {
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (activeTool === 'highlighter') {
        ctx.strokeStyle = highlightColor;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = highlightSize;
        ctx.globalCompositeOperation = 'multiply';
      } else {
        ctx.strokeStyle = penColor;
        ctx.globalAlpha = 0.92;
        ctx.lineWidth = penSize;
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (activeTool === 'eraser') return;

    const points = [...currentPointsRef.current];

    if (points.length > 1) {
      const newStroke: DrawingStroke = {
        id: `stroke_${Date.now()}_${Math.random()}`,
        tool: activeTool === 'highlighter' ? 'highlighter' : 'pen',
        color: activeTool === 'highlighter' ? highlightColor : penColor,
        size: activeTool === 'highlighter' ? highlightSize : penSize,
        points: [...points],
        questionId: activeStrokeQuestionRef.current.qId,
        baseTop: activeStrokeQuestionRef.current.baseTop,
        baseLeft: activeStrokeQuestionRef.current.baseLeft
      };

      const updatedStrokes = [...strokes, newStroke];
      setStrokes(updatedStrokes);
      setUndoneStrokes([]);
      saveAnnotations(updatedStrokes, stickyNotes);
    }

    // Automatically analyze gesture to recognize circled / tapped option
    if (points.length > 0 && (activeTool === 'pen' || activeTool === 'highlighter')) {
      processPenGesture(points);
    }

    currentPointsRef.current = [];
  };

  const eraseStrokeNear = (x: number, y: number, radius = 22) => {
    const updated = strokes.filter(stroke => {
      let deltaX = 0;
      let deltaY = 0;
      if (stroke.questionId && stroke.baseTop !== undefined && bookletPaperRef.current) {
        const card = bookletPaperRef.current.querySelector(`[data-question-id="${stroke.questionId}"]`) as HTMLElement;
        if (card) {
          deltaY = card.offsetTop - stroke.baseTop;
          deltaX = card.offsetLeft - (stroke.baseLeft || 0);
        }
      }

      const isNear = stroke.points.some(pt => {
        const dx = (pt.x + deltaX) - x;
        const dy = (pt.y + deltaY) - y;
        return Math.sqrt(dx * dx + dy * dy) < radius;
      });
      return !isNear;
    });

    if (updated.length !== strokes.length) {
      setStrokes(updated);
      saveAnnotations(updated, stickyNotes);
    }
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    setUndoneStrokes(prev => [...prev, last]);
    saveAnnotations(updated, stickyNotes);
  };

  const handleRedo = () => {
    if (undoneStrokes.length === 0) return;
    const next = undoneStrokes[undoneStrokes.length - 1];
    const updated = [...strokes, next];
    setStrokes(updated);
    setUndoneStrokes(prev => prev.slice(0, -1));
    saveAnnotations(updated, stickyNotes);
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nét vẽ và ghi chú trên đề thi này?')) {
      setStrokes([]);
      setUndoneStrokes([]);
      setStickyNotes([]);
      saveAnnotations([], []);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (bookletContainerRef.current?.requestFullscreen) {
        bookletContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Audio Player for Choukai & Mondai Intros
  const handleToggleAudioUrl = (url: string | undefined, id: string, fallbackScript?: string) => {
    if (playingAudioId === id) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const playTTS = () => {
      if (!fallbackScript || !window.speechSynthesis) {
        setPlayingAudioId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(fallbackScript);
      utterance.lang = 'ja-JP';
      utterance.rate = audioSpeed;
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      audioSynthRef.current = utterance;
      setPlayingAudioId(id);
      window.speechSynthesis.speak(utterance);
    };

    if (url) {
      try {
        const audio = new Audio(url);
        audio.playbackRate = audioSpeed;
        audio.onended = () => {
          setPlayingAudioId(null);
          audioElementRef.current = null;
        };
        audio.onerror = () => playTTS();
        audioElementRef.current = audio;
        setPlayingAudioId(id);
        audio.play().catch(() => playTTS());
        return;
      } catch {
        playTTS();
        return;
      }
    }
    playTTS();
  };

  const handleToggleChoukaiTTS = (q: ExamQuestion) => {
    handleToggleAudioUrl(q.audioUrl, q.id, q.audioScript);
  };

  // Compute JLPT grading stats
  const answeredCount = Object.keys(userAnswers).filter(id => allQuestions.some(q => q.id === id)).length;
  const totalCount = allQuestions.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  allQuestions.forEach(q => {
    const ans = userAnswers[q.id];
    if (ans === undefined) {
      unansweredCount++;
    } else if (ans === q.correctIndex) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  // Calculate detailed JLPT official section scores & grades
  const jlptScoreStats = React.useMemo(() => {
    const getStats = (questionsList: ExamQuestion[]) => {
      let correct = 0;
      questionsList.forEach(q => {
        if (userAnswers[q.id] === q.correctIndex) correct++;
      });
      const total = questionsList.length;
      const pct = total > 0 ? (correct / total) : 0;
      const grade = pct >= 0.67 ? 'A' : pct >= 0.34 ? 'B' : 'C';
      return { correct, total, pct, grade };
    };

    const mojiGoi = getStats(mojiGoiQuestions);
    const bunpou = getStats(bunpouQuestions);
    const langKnowledgeTotal = mojiGoi.total + bunpou.total;
    const langKnowledgeCorrect = mojiGoi.correct + bunpou.correct;
    const langKnowledgePct = langKnowledgeTotal > 0 ? (langKnowledgeCorrect / langKnowledgeTotal) : 0;

    const dokkai = getStats(dokkaiQuestions);
    const choukai = getStats(choukaiQuestions);

    const isN4N5 = exam.level === 'N4' || exam.level === 'N5';

    // Scaled scores out of 60 for each section (or 120 + 60 for N4/N5)
    let langScaled = langKnowledgeTotal > 0 ? Math.round(langKnowledgePct * 60) : 0;
    let dokkaiScaled = dokkai.total > 0 ? Math.round(dokkai.pct * 60) : 0;
    let choukaiScaled = choukai.total > 0 ? Math.round(choukai.pct * 60) : 0;

    // For N4/N5, language knowledge + reading is out of 120
    const langAndReadingTotal = langKnowledgeTotal + dokkai.total;
    const langAndReadingCorrect = langKnowledgeCorrect + dokkai.correct;
    const langAndReadingScaled = langAndReadingTotal > 0 ? Math.round((langAndReadingCorrect / langAndReadingTotal) * 120) : 0;

    let totalScaledScore = isN4N5 ? (langAndReadingScaled + choukaiScaled) : (langScaled + dokkaiScaled + choukaiScaled);

    // If single section exam, scale to 180 or appropriate
    if (sectionMode !== 'ALL') {
      const overallPct = totalCount > 0 ? (correctCount / totalCount) : 0;
      totalScaledScore = Math.round(overallPct * 180);
    }

    // Official Pass marks according to JLPT
    let passThreshold = 90;
    if (exam.level === 'N1') passThreshold = 100;
    else if (exam.level === 'N2') passThreshold = 90;
    else if (exam.level === 'N3') passThreshold = 95;
    else if (exam.level === 'N4') passThreshold = 90;
    else if (exam.level === 'N5') passThreshold = 80;

    // Official pass check: Total >= passThreshold AND sectional scores >= sectional minimum (19/60 or 38/120)
    let isOfficialPassed = false;
    if (sectionMode === 'ALL') {
      if (isN4N5) {
        isOfficialPassed = totalScaledScore >= passThreshold && langAndReadingScaled >= 38 && (choukai.total === 0 || choukaiScaled >= 19);
      } else {
        isOfficialPassed = totalScaledScore >= passThreshold && 
          (langKnowledgeTotal === 0 || langScaled >= 19) && 
          (dokkai.total === 0 || dokkaiScaled >= 19) && 
          (choukai.total === 0 || choukaiScaled >= 19);
      }
    } else {
      isOfficialPassed = (correctCount / Math.max(1, totalCount)) >= 0.55;
    }

    return {
      mojiGoiCorrect: mojiGoi.correct,
      mojiGoiTotal: mojiGoi.total,
      mojiGoiGrade: mojiGoi.grade,
      bunpouCorrect: bunpou.correct,
      bunpouTotal: bunpou.total,
      bunpouGrade: bunpou.grade,
      langKnowledgeCorrect,
      langKnowledgeTotal,
      langScaled,
      dokkaiCorrect: dokkai.correct,
      dokkaiTotal: dokkai.total,
      dokkaiGrade: dokkai.grade,
      dokkaiScaled,
      choukaiCorrect: choukai.correct,
      choukaiTotal: choukai.total,
      choukaiGrade: choukai.grade,
      choukaiScaled,
      langAndReadingScaled,
      totalScaledScore,
      passThreshold,
      isOfficialPassed,
      isN4N5
    };
  }, [allQuestions, mojiGoiQuestions, bunpouQuestions, dokkaiQuestions, choukaiQuestions, userAnswers, exam.level, sectionMode, totalCount, correctCount]);

  const isPassed = jlptScoreStats.isOfficialPassed;

  // Group Dokkai questions by reading passage
  const dokkaiPassageGroups = React.useMemo(() => {
    const groups: {
      passageKey: string;
      passageTitle?: string;
      passageBody?: string;
      passageTranslation?: string;
      questions: ExamQuestion[];
    }[] = [];

    dokkaiQuestions.forEach((q) => {
      const parsed = parseDokkaiQuestion(q.question);
      if (parsed.isDokkai && parsed.passageBody) {
        const existing = groups.find(g => g.passageBody === parsed.passageBody);
        if (existing) {
          existing.questions.push(q);
        } else {
          groups.push({
            passageKey: q.id,
            passageTitle: parsed.passageTitle || '【文章】',
            passageBody: parsed.passageBody,
            passageTranslation: parsed.passageTranslation,
            questions: [q]
          });
        }
      } else {
        if (groups.length > 0 && groups[groups.length - 1].passageBody) {
          groups[groups.length - 1].questions.push(q);
        } else {
          groups.push({
            passageKey: q.id,
            passageTitle: '【文章】',
            questions: [q]
          });
        }
      }
    });

    return groups;
  }, [dokkaiQuestions]);

  return (
    <div 
      ref={bookletContainerRef}
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-[#0b0f17] text-slate-100 selection:bg-amber-500/30' 
          : 'bg-slate-200/90 text-slate-900 selection:bg-amber-400/40'
      }`}
      style={{
        fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", "Noto Serif JP", "Times New Roman", serif'
      }}
    >
      
      {/* ================= STICKY TOOLBAR (PDF VIEW & PEN CONTROLS) ================= */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 py-2.5 font-sans transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-slate-900/95 border-slate-800 shadow-xl text-slate-100' 
          : 'bg-white/95 border-slate-300 shadow-sm text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Exam Info & Back (Red Circle 1 in User Reference) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onExit}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white' 
                  : 'bg-stone-100 hover:bg-stone-200 text-slate-700 hover:text-slate-950 border border-stone-300'
              }`}
              title="Thoát về danh sách đề"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-black tracking-wide font-sans">
                  📄 PDF VIEW • {exam.level}
                </span>
                <h1 className={`font-bold text-xs sm:text-sm line-clamp-1 max-w-[200px] sm:max-w-xs md:max-w-md ${
                  isDarkMode ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  {exam.title}
                </h1>
              </div>
              <p className={`text-[11px] font-medium flex items-center gap-2 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {isSubmitted ? (
                  <span className={isDarkMode ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold'}>
                    ✓ ĐÃ CHẤM ĐIỂM XONG • {correctCount}/{totalCount} câu đúng ({totalCount > 0 ? Math.round((correctCount/totalCount)*100) : 0}%)
                  </span>
                ) : (
                  <span>Đã khoanh {answeredCount}/{totalCount} câu ({progressPercent}%)</span>
                )}
                <button
                  type="button"
                  onClick={() => setShowDrawingToolbar(prev => !prev)}
                  className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    showDrawingToolbar 
                      ? 'bg-amber-400 text-slate-950' 
                      : isDarkMode 
                        ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                        : 'bg-stone-100 text-slate-700 hover:text-slate-950 hover:bg-stone-200 border border-stone-300'
                  }`}
                  title="Mở thanh công cụ bút vẽ và ghi chú"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{showDrawingToolbar ? '✕ Đóng công cụ vẽ' : '✏️ Công cụ vẽ & ghi chú'}</span>
                </button>
              </p>
            </div>
          </div>

          {/* Center: Optional Drawing & Annotation Toolbox (Hidden by default as requested) */}
          {showDrawingToolbar && (
            <div className="flex items-center flex-wrap gap-1 bg-slate-950/90 p-1.5 rounded-xl border border-slate-700 shadow-inner animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Tool Selection */}
              <div className="flex items-center gap-0.5 border-r border-slate-800 pr-1.5 mr-1">
                <button
                  type="button"
                  onClick={() => setActiveTool('cursor')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    activeTool === 'cursor' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Chế độ chọn chuột / Bấm khoanh trực tiếp vào chữ"
                >
                  <Move className="w-4 h-4" />
                  <span className="hidden md:inline text-[11px]">Bấm khoanh chữ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool('pen')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    activeTool === 'pen' 
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Bút Chì / Bút Bi viết vẽ tự do trên đề"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden md:inline text-[11px]">Vẽ bút</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool('highlighter')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    activeTool === 'highlighter' 
                      ? 'bg-yellow-400 text-slate-950 font-bold shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Bút Dạ Quang tô sáng từ vựng / câu văn"
                >
                  <Highlighter className="w-4 h-4" />
                  <span className="hidden md:inline text-[11px]">Dạ quang</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool('eraser')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    activeTool === 'eraser' 
                      ? 'bg-rose-500 text-white font-bold shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Cục Tẩy xóa nét vẽ"
                >
                  <Eraser className="w-4 h-4" />
                  <span className="hidden md:inline text-[11px]">Tẩy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool('note')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    activeTool === 'note' 
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Dán Giấy Ghi Chú Sticky Note lên đề thi"
                >
                  <StickyNote className="w-4 h-4" />
                  <span className="hidden lg:inline text-[11px]">Sticky note</span>
                </button>
              </div>

              {/* Color Palette (When Pen or Highlighter is active) */}
              {activeTool === 'pen' && (
                <div className="flex items-center gap-1 border-r border-slate-800 pr-1.5 mr-1">
                  {PEN_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setPenColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                        penColor === c.color ? 'scale-125 border-white ring-2 ring-indigo-400' : 'border-slate-600 hover:scale-110'
                      }`}
                      title={c.label}
                    />
                  ))}
                  {/* Pen Size */}
                  <div className="flex items-center gap-1 ml-1 text-slate-400 text-[10px]">
                    {[1.5, 2.5, 4.5].map(size => (
                      <button
                        key={size}
                        onClick={() => setPenSize(size)}
                        className={`px-1 py-0.5 rounded text-[10px] ${penSize === size ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800'}`}
                      >
                        {size === 1.5 ? 'Mảnh' : size === 2.5 ? 'Vừa' : 'Đậm'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTool === 'highlighter' && (
                <div className="flex items-center gap-1 border-r border-slate-800 pr-1.5 mr-1">
                  {HIGHLIGHT_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setHighlightColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                        highlightColor === c.color ? 'scale-125 border-white ring-2 ring-yellow-400' : 'border-slate-600 hover:scale-110'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              )}

              {/* Undo / Redo / Clear */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={strokes.length === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  title="Hoàn tác nét vẽ (Ctrl + Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={undoneStrokes.length === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  title="Làm lại nét vẽ (Ctrl + Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Xóa toàn bộ nét vẽ và ghi chú"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom & Fullscreen Controls */}
              <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5 ml-1">
                <button
                  type="button"
                  onClick={() => setSmartPenRecognition(prev => !prev)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    smartPenRecognition 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  title="Tự động nhận diện nét vẽ vòng tròn hoặc chạm bằng bút để khoanh đáp án"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${smartPenRecognition ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">Khoanh: {smartPenRecognition ? 'BẬT' : 'TẮT'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 10, 80))}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer ml-1"
                  title="Thu nhỏ đề thi"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-300 px-1">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 10, 150))}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  title="Phóng to đề thi"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer ml-1"
                  title="Toàn màn hình PDF"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>

            </div>
          )}

          {/* Right: Theme Mode Switcher, Timer & Submit Button */}
          <div className="flex items-center gap-2">
            
            {/* Theme Switcher Toggle (White Paper / Dark / Auto) */}
            <button
              type="button"
              onClick={toggleThemeMode}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-sans shadow-2xs ${
                themeMode === 'light' 
                  ? 'bg-amber-100 border border-amber-400 text-amber-950 hover:bg-amber-200' 
                  : themeMode === 'dark'
                    ? 'bg-slate-800 border border-slate-700 text-indigo-300 hover:bg-slate-700'
                    : isDarkMode 
                      ? 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-stone-100 border border-stone-300 text-slate-700 hover:bg-stone-200'
              }`}
              title={`Chế độ hiển thị đề thi: ${themeMode === 'light' ? 'Giấy trắng (Chữ đen)' : themeMode === 'dark' ? 'Chế độ tối' : 'Tự động theo trình duyệt'}. Bấm để đổi.`}
            >
              {themeMode === 'light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Giấy trắng</span>
                </>
              ) : themeMode === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Chế độ tối</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Tự động ({isDarkMode ? 'Tối' : 'Sáng'})</span>
                </>
              )}
            </button>

            {/* Timer (Visible during exam) */}
            {!isSubmitted && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs sm:text-sm font-bold shadow-inner ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-amber-400' 
                  : 'bg-stone-100 border-stone-300 text-amber-800'
              }`}>
                <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>{formatTime(timeRemainingSeconds)}</span>
              </div>
            )}

            {/* Restart Exam Button (When submitted) */}
            {isSubmitted && onRestartExam && (
              <button
                type="button"
                onClick={onRestartExam}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer font-sans shadow-xs"
                title="Làm lại đề thi từ đầu"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm lại</span>
              </button>
            )}

            {/* Submit Exam / Exit Button */}
            {!isSubmitted ? (
              <button
                type="button"
                onClick={onSubmitExam}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 font-sans"
              >
                <Check className="w-4 h-4" />
                <span>Nộp bài & Chấm điểm</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onExit}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl shadow transition cursor-pointer font-sans"
              >
                Về danh sách đề
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Time Warning Alert */}
      {!isSubmitted && timeRemainingSeconds > 0 && timeRemainingSeconds <= 300 && (
        <div className={`px-4 py-2.5 flex items-center justify-between shadow-md text-xs sm:text-sm font-sans z-30 transition-all ${
          timeRemainingSeconds <= 60
            ? 'bg-rose-950 border-b-2 border-rose-500 text-rose-100 animate-pulse'
            : 'bg-amber-950 border-b-2 border-amber-500 text-amber-100'
        }`}>
          <div className="flex items-center gap-2 font-bold max-w-5xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 shrink-0 ${timeRemainingSeconds <= 60 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
              <span>
                {timeRemainingSeconds <= 60
                  ? `🚨 CẢNH BÁO KHẨN CẤP: Chỉ còn ${formatTime(timeRemainingSeconds)}! Hãy nhanh chóng hoàn thành và bấm Nộp bài!`
                  : `⚠️ Sắp hết giờ làm bài: Còn lại ${formatTime(timeRemainingSeconds)}. Vui lòng kiểm tra lại tất cả các đáp án!`}
              </span>
            </div>
            <button
              type="button"
              onClick={onSubmitExam}
              className="px-3.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs shrink-0 cursor-pointer ml-2"
            >
              Nộp bài ngay
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN FULL-SCREEN PDF VIEW CONTAINER ================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Smart Pen Recognition Feedback Toast */}
        {recognitionFeedback && (
          <div 
            key={recognitionFeedback.key}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-amber-300 border border-amber-500/50 shadow-2xl px-4 py-2 rounded-full font-sans text-xs font-bold flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{recognitionFeedback.message}</span>
          </div>
        )}

        {/* Scrollable Container with Zoom */}
        <div 
          className="flex-1 overflow-y-auto p-2 sm:p-6 lg:p-8 flex flex-col items-center bg-slate-950/90 gap-6"
          style={{
            touchAction: activeTool === 'cursor' ? 'pan-y' : 'none'
          }}
        >
          {/* ================= EXACT OFFICIAL JLPT ONLINE SCORE DISPLAY (日本語能力試験 試験結果発表) ================= */}
          {isSubmitted && (
            <div 
              style={{
                width: '100%',
                maxWidth: `${960 * (zoomLevel / 100)}px`
              }}
              className="space-y-6 font-sans shrink-0 animate-in fade-in zoom-in-95 duration-200"
            >
              {/* EXACT OFFICIAL JLPT CERTIFICATE OF RESULTS (WHITE PAPER FORM AS IN USER'S IMAGE) */}
              <div className="bg-white text-slate-900 rounded-lg p-5 sm:p-10 shadow-2xl border border-slate-300 relative select-text font-jlpt-exam">
                
                {/* 1. Header: JLPT Logo & Official Japanese Title */}
                <div className="flex items-start justify-between pb-2 border-b border-slate-400">
                  <div className="flex items-start gap-3">
                    <div className="w-3.5 h-6 bg-red-600 rounded-none shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider">
                        日本語能力試験
                      </h2>
                      <div className="text-xs font-bold text-slate-700 tracking-wider font-sans">
                        JLPT <span className="text-[10px] font-normal text-slate-500">Japanese-Language Proficiency Test</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-mono hidden sm:block">
                    Official Score Display
                  </div>
                </div>

                {/* 2. Orange Banner Box (Matches User's Reference Screenshot) */}
                <div className="my-5 bg-[#f05a28] text-white text-center py-3.5 px-4 rounded-none shadow-sm space-y-0.5">
                  <p className="text-[11px] sm:text-xs font-medium tracking-wide opacity-95 font-sans">
                    JLPT (Japanese-Language Proficiency Test) Online Score Display
                  </p>
                  <h3 className="text-base sm:text-xl font-black tracking-wider">
                    {exam.year || '2025'}年{exam.session || '7'}月 日本語能力試験 試験結果発表
                  </h3>
                  <p className="text-[11px] sm:text-xs font-medium tracking-wide opacity-95 font-sans">
                    Japanese-Language Proficiency Test Results, {exam.session === '12' ? 'December' : 'July'} {exam.year || '2025'}
                  </p>
                </div>

                {/* 3. Red Notice Text Below Banner */}
                <div className="text-center my-4 space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-red-600">
                    ※正式な試験結果通知書は、現地の実施機関を通して送付されます。
                  </p>
                  <p className="text-[10px] sm:text-xs text-red-600 font-medium font-sans">
                    *Official score reports will be issued through local test institutions.
                  </p>
                </div>

                {/* 4. Official Result Form Table (Strict Grid Structure as in Image) */}
                <div className="max-w-2xl mx-auto space-y-3.5">
                  
                  {/* Row 1: Level (レベル) */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <div className="col-span-4 sm:col-span-3 text-slate-800 font-medium text-xs sm:text-sm">
                      <div className="font-bold">レベル</div>
                      <div className="text-[11px] text-slate-500 font-sans">Level</div>
                    </div>
                    <div className="col-span-8 sm:col-span-9 border-2 border-slate-900 bg-white py-2 px-4 text-center font-black text-base sm:text-lg text-slate-900 shadow-xs">
                      {exam.level}
                    </div>
                  </div>

                  {/* Row 2: Registration No. (受験番号) */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <div className="col-span-4 sm:col-span-3 text-slate-800 font-medium text-xs sm:text-sm">
                      <div className="font-bold">受験番号</div>
                      <div className="text-[11px] text-slate-500 font-sans">Registration No.</div>
                    </div>
                    <div className="col-span-8 sm:col-span-9 border-2 border-slate-900 bg-white py-2 px-4 text-center font-mono font-bold text-base sm:text-lg text-slate-900 tracking-wider shadow-xs">
                      25A2090202-11471
                    </div>
                  </div>

                  {/* Row 3: Result (合否結果) */}
                  <div className="grid grid-cols-12 items-center gap-3">
                    <div className="col-span-4 sm:col-span-3 text-slate-800 font-medium text-xs sm:text-sm">
                      <div className="font-bold">合否結果</div>
                      <div className="text-[11px] text-slate-500 font-sans">Result</div>
                    </div>
                    <div className="col-span-8 sm:col-span-9 border-2 border-slate-900 bg-white py-2.5 px-4 text-center shadow-xs">
                      <div className={`font-black text-xl sm:text-2xl ${jlptScoreStats.isOfficialPassed ? 'text-slate-900' : 'text-rose-700'}`}>
                        {jlptScoreStats.isOfficialPassed ? '合格' : '不合格'}
                      </div>
                      <div className="text-xs font-bold text-slate-600 uppercase tracking-wider font-sans">
                        {jlptScoreStats.isOfficialPassed ? 'Passed' : 'Failed'}
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Scores (得点) - Dual Column Sectional Table */}
                  <div className="grid grid-cols-12 items-start gap-3">
                    <div className="col-span-4 sm:col-span-3 text-slate-800 font-medium text-xs sm:text-sm pt-2">
                      <div className="font-bold">得点</div>
                      <div className="text-[11px] text-slate-500 font-sans">Scores</div>
                    </div>
                    
                    <div className="col-span-8 sm:col-span-9 border-2 border-slate-900 bg-white overflow-hidden shadow-xs">
                      <table className="w-full border-collapse text-xs sm:text-sm text-center">
                        <thead>
                          <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-900">
                            <th className="py-2.5 px-2 border-r-2 border-slate-900 font-bold w-3/5">
                              <div>得点区分別得点</div>
                              <div className="text-[10px] font-normal text-slate-500 font-sans">Scores by Scoring Section</div>
                            </th>
                            <th className="py-2.5 px-2 font-bold w-2/5">
                              <div>総合得点</div>
                              <div className="text-[10px] font-normal text-slate-500 font-sans">Total Score</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-900">
                          
                          {/* N1, N2, N3 Breakdown (3 Section rows + 1 spanning total) */}
                          {!jlptScoreStats.isN4N5 ? (
                            <>
                              <tr>
                                <td className="p-0 border-r-2 border-slate-900">
                                  <div className="flex items-center justify-between px-3 py-2 text-left">
                                    <div>
                                      <div className="font-bold text-slate-900">言語知識（文字・語彙・文法）</div>
                                      <div className="text-[10px] text-slate-500 font-sans">Language Knowledge (Vocabulary/Grammar)</div>
                                    </div>
                                    <div className="font-black text-sm sm:text-base font-mono whitespace-nowrap pl-2 text-slate-900">
                                      {jlptScoreStats.langScaled} / 60
                                    </div>
                                  </div>
                                </td>
                                <td rowSpan={3} className="py-4 px-2 text-center align-middle bg-slate-50/50">
                                  <div className="font-black text-2xl sm:text-3xl font-mono text-slate-900">
                                    {jlptScoreStats.totalScaledScore} / 180
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-sans mt-1">
                                    (Điểm đỗ: ≥ {jlptScoreStats.passThreshold})
                                  </div>
                                </td>
                              </tr>

                              <tr className="border-t-2 border-slate-900">
                                <td className="p-0 border-r-2 border-slate-900">
                                  <div className="flex items-center justify-between px-3 py-2 text-left">
                                    <div>
                                      <div className="font-bold text-slate-900">読解</div>
                                      <div className="text-[10px] text-slate-500 font-sans">Reading</div>
                                    </div>
                                    <div className="font-black text-sm sm:text-base font-mono whitespace-nowrap pl-2 text-slate-900">
                                      {jlptScoreStats.dokkaiScaled} / 60
                                    </div>
                                  </div>
                                </td>
                              </tr>

                              <tr className="border-t-2 border-slate-900">
                                <td className="p-0 border-r-2 border-slate-900">
                                  <div className="flex items-center justify-between px-3 py-2 text-left">
                                    <div>
                                      <div className="font-bold text-slate-900">聴解</div>
                                      <div className="text-[10px] text-slate-500 font-sans">Listening</div>
                                    </div>
                                    <div className="font-black text-sm sm:text-base font-mono whitespace-nowrap pl-2 text-slate-900">
                                      {jlptScoreStats.choukaiScaled} / 60
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </>
                          ) : (
                            /* N4, N5 Breakdown (2 Section rows + 1 spanning total) */
                            <>
                              <tr>
                                <td className="p-0 border-r-2 border-slate-900">
                                  <div className="flex items-center justify-between px-3 py-2.5 text-left">
                                    <div>
                                      <div className="font-bold text-slate-900">言語知識（文字・語彙・文法）・読解</div>
                                      <div className="text-[10px] text-slate-500 font-sans">Language Knowledge (Vocabulary/Grammar) / Reading</div>
                                    </div>
                                    <div className="font-black text-sm sm:text-base font-mono whitespace-nowrap pl-2 text-slate-900">
                                      {jlptScoreStats.langAndReadingScaled} / 120
                                    </div>
                                  </div>
                                </td>
                                <td rowSpan={2} className="py-4 px-2 text-center align-middle bg-slate-50/50">
                                  <div className="font-black text-2xl sm:text-3xl font-mono text-slate-900">
                                    {jlptScoreStats.totalScaledScore} / 180
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-sans mt-1">
                                    (Điểm đỗ: ≥ {jlptScoreStats.passThreshold})
                                  </div>
                                </td>
                              </tr>

                              <tr className="border-t-2 border-slate-900">
                                <td className="p-0 border-r-2 border-slate-900">
                                  <div className="flex items-center justify-between px-3 py-2.5 text-left">
                                    <div>
                                      <div className="font-bold text-slate-900">聴解</div>
                                      <div className="text-[10px] text-slate-500 font-sans">Listening</div>
                                    </div>
                                    <div className="font-black text-sm sm:text-base font-mono whitespace-nowrap pl-2 text-slate-900">
                                      {jlptScoreStats.choukaiScaled} / 60
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </>
                          )}

                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Row 5: Reference Information (参考情報) */}
                  <div className="grid grid-cols-12 items-start gap-3">
                    <div className="col-span-4 sm:col-span-3 text-slate-800 font-medium text-xs sm:text-sm pt-2">
                      <div className="font-bold">参考情報</div>
                      <div className="text-[11px] text-slate-500 font-sans">Reference Information</div>
                    </div>
                    
                    <div className="col-span-8 sm:col-span-9 border-2 border-slate-900 bg-white overflow-hidden shadow-xs">
                      <table className="w-full border-collapse text-xs sm:text-sm text-center">
                        <thead>
                          <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-900">
                            <th className="py-2 px-2 border-r-2 border-slate-900 font-bold w-1/2">
                              <div>文字・語彙</div>
                              <div className="text-[10px] font-normal text-slate-500 font-sans">Vocabulary</div>
                            </th>
                            <th className="py-2 px-2 font-bold w-1/2">
                              <div>文法</div>
                              <div className="text-[10px] font-normal text-slate-500 font-sans">Grammar</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-2.5 px-2 border-r-2 border-slate-900 font-black text-lg sm:text-xl font-mono text-slate-900">
                              {jlptScoreStats.mojiGoiGrade}
                            </td>
                            <td className="py-2.5 px-2 font-black text-lg sm:text-xl font-mono text-slate-900">
                              {jlptScoreStats.bunpouGrade}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* 5. Footer URL & Note (Exact as in official printout) */}
                <div className="mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono font-sans">
                  <span>https://www.jlpt.jp/guideline/results/online.html</span>
                  <span>JLPT Official Online Score Sheet</span>
                </div>

              </div>

              {/* REVIEW & CONTROLS TOOLBAR (BELOW THE WHITE SCORE SHEET) */}
              <div className="bg-[#1f2733] border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4 text-slate-200 font-sans">
                
                {/* AI Red Pen Teacher Notes Review (赤ペン先生) */}
                <div className="border border-red-500/40 bg-[#161d27] p-4 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        ✍️
                      </div>
                      <div>
                        <h3 className="font-black text-slate-100 text-sm sm:text-base flex items-center gap-2">
                          <span>赤ペン先生 (GIÁO VIÊN AI SỬA GHI CHÚ VIẾT TAY)</span>
                          <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-700 text-red-300 text-[10px] font-black uppercase">
                            AI Teacher Review
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Thầy cô AI đã kiểm tra và đính chính các ghi chú viết tay, dịch nghĩa của bạn trên đề thi.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReviewAllNotes()}
                      disabled={isReviewingNotes}
                      className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isReviewingNotes ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang chấm ghi chú...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Chấm & Sửa lại ghi chú</span>
                        </>
                      )}
                    </button>
                  </div>

                  {Object.keys(questionNoteCorrections).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 flex items-center justify-between">
                        <span className="font-bold">⭕ Ghi chú hiểu chuẩn xác:</span>
                        <span className="font-black text-base">
                          {Object.values(questionNoteCorrections).filter(c => c.status === 'CORRECT').length}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-700/60 text-rose-200 flex items-center justify-between">
                        <span className="font-bold">❌ Ghi chú đã được sửa lỗi:</span>
                        <span className="font-black text-base">
                          {Object.values(questionNoteCorrections).filter(c => c.status === 'WRONG').length}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-700/60 text-amber-200 flex items-center justify-between">
                        <span className="font-bold">💡 Lưu ý kiến thức & mẹo thi:</span>
                        <span className="font-black text-base">
                          {Object.values(questionNoteCorrections).filter(c => c.status === 'PARTIAL' || c.status === 'TIP').length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Filter Chips & Action Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-700/60">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      Lọc câu hỏi:
                    </span>
                    
                    <button
                      onClick={() => setReviewFilter('ALL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        reviewFilter === 'ALL'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-[#19212b] border border-slate-700 text-slate-300 hover:bg-[#222a36]'
                      }`}
                    >
                      Tất cả ({totalCount})
                    </button>

                    <button
                      onClick={() => setReviewFilter('WRONG')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        reviewFilter === 'WRONG'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-[#19212b] border border-rose-800/60 text-rose-300 hover:bg-rose-950/40'
                      }`}
                    >
                      <span>❌ Chỉ xem câu sai</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-900/80 text-rose-200 text-[10px] font-black">{wrongCount}</span>
                    </button>

                    <button
                      onClick={() => setReviewFilter('CORRECT')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        reviewFilter === 'CORRECT'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[#19212b] border border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/40'
                      }`}
                    >
                      <span>⭕ Chỉ xem câu đúng</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-900/80 text-emerald-200 text-[10px] font-black">{correctCount}</span>
                    </button>

                    {unansweredCount > 0 && (
                      <button
                        onClick={() => setReviewFilter('UNANSWERED')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          reviewFilter === 'UNANSWERED'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-[#19212b] border border-amber-800/60 text-amber-300 hover:bg-amber-950/40'
                        }`}
                      >
                        <span>⚠️ Chưa làm</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-900/80 text-amber-200 text-[10px] font-black">{unansweredCount}</span>
                      </button>
                    )}
                  </div>

                  {/* Quick action buttons */}
                  <div className="flex items-center flex-wrap gap-2">
                    {onRestartExam && (
                      <button
                        type="button"
                        onClick={onRestartExam}
                        className="px-3 py-1.5 rounded-lg bg-[#19212b] hover:bg-[#222a36] border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Làm lại đề này</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const relevantQuestions = sectionMode === 'ALL' 
                          ? exam.questions
                          : exam.questions.filter(q => q.section === sectionMode);
                        let correct = 0;
                        relevantQuestions.forEach(q => {
                          if (userAnswers[q.id] === q.correctIndex) correct++;
                        });
                        const total = relevantQuestions.length;
                        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                        const pass = pct >= 60;

                        setSelectedPrintRecord({
                          id: `print_${Date.now()}`,
                          examId: exam.id,
                          examTitle: exam.title,
                          level: exam.level,
                          sectionMode: sectionMode,
                          score: correct,
                          totalQuestions: total,
                          percentage: pct,
                          passed: pass,
                          date: new Date().toISOString(),
                          dateGroup: 'Hôm nay',
                          formattedDate: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                          timeSpentSeconds: 0,
                          userAnswers: { ...userAnswers },
                          questionNotes: { ...questionNotes },
                          examSnapshot: exam
                        });
                        setShowPrintModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      title="Xuất file PDF hoặc In bảng điểm JLPT"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Xuất PDF / In bảng điểm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowHistoryModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      title="Xem lịch sử các lần thi trước"
                    >
                      <History className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lịch sử các ngày</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= AUTHENTIC JLPT A4 PAPER BOOKLET ================= */}
          <div 
            ref={bookletPaperRef}
            className={`relative rounded-2xl shadow-2xl transition-transform origin-top print:shadow-none print:border-none font-jlpt-exam jlpt-real-paper ${
              isDarkMode 
                ? 'bg-[#1a222e] text-slate-100 border-2 border-slate-700 theme-dark' 
                : 'bg-white text-slate-950 border-2 border-stone-300 theme-light'
            }`}
            style={{
              width: '100%',
              maxWidth: `${960 * (zoomLevel / 100)}px`,
              minHeight: '1200px'
            }}
          >
            {/* Interactive Drawing Canvas Layer (Overlay) */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute inset-0 z-20 w-full h-full cursor-crosshair select-none"
              style={{
                pointerEvents: activeTool === 'cursor' ? 'none' : 'auto',
                touchAction: 'none'
              }}
            />

            {/* Sticky Notes Layer */}
            {stickyNotes.map(note => (
              <div
                key={note.id}
                style={{
                  top: `${note.y}%`,
                  left: `${note.x}%`,
                  transform: 'translate(-50%, -20%)'
                }}
                className={`absolute z-30 w-64 p-3 rounded-xl shadow-xl border text-xs font-sans transition ${
                  note.color === 'yellow' ? 'bg-amber-100 border-amber-300 text-amber-950' :
                  note.color === 'green' ? 'bg-emerald-100 border-emerald-300 text-emerald-950' :
                  note.color === 'pink' ? 'bg-pink-100 border-pink-300 text-pink-950' :
                  'bg-sky-100 border-sky-300 text-sky-950'
                }`}
              >
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-black/10">
                  <span className="font-bold text-[10px] uppercase tracking-wider opacity-70 flex items-center gap-1">
                    <span>📌 Ghi chú đề thi</span>
                  </span>
                  <button
                    onClick={() => {
                      const updated = stickyNotes.filter(n => n.id !== note.id);
                      setStickyNotes(updated);
                      saveAnnotations(strokes, updated);
                    }}
                    className="text-black/40 hover:text-black font-bold text-xs"
                  >
                    ×
                  </button>
                </div>
                {editingNoteId === note.id ? (
                  <textarea
                    autoFocus
                    defaultValue={note.text}
                    onBlur={(e) => {
                      const updated = stickyNotes.map(n => n.id === note.id ? { ...n, text: e.target.value } : n);
                      setStickyNotes(updated);
                      setEditingNoteId(null);
                      saveAnnotations(strokes, updated);
                    }}
                    className="w-full bg-transparent border-none resize-none focus:outline-none text-xs leading-relaxed font-sans"
                    rows={3}
                  />
                ) : (
                  <p 
                    onClick={() => setEditingNoteId(note.id)}
                    className="whitespace-pre-wrap cursor-pointer font-sans"
                  >
                    {note.text}
                  </p>
                )}

                {/* AI Red Pen Teacher Correction for Sticky Note */}
                {note.aiCorrection && (
                  <div className={`mt-2 pt-2 border-t text-[11px] leading-snug rounded-lg p-2 ${
                    note.aiCorrection.status === 'CORRECT' 
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
                      : note.aiCorrection.status === 'WRONG'
                        ? 'bg-rose-50 border border-rose-300 text-rose-900'
                        : 'bg-amber-50 border border-amber-300 text-amber-900'
                  }`}>
                    <div className="font-bold flex items-center justify-between gap-1 mb-1">
                      <span className="flex items-center gap-1">
                        <span>✍️ 赤ペン先生 (Giáo viên AI):</span>
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                        note.aiCorrection.status === 'CORRECT' ? 'bg-emerald-200 text-emerald-900' :
                        note.aiCorrection.status === 'WRONG' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {note.aiCorrection.status === 'CORRECT' ? '⭕ ĐÚNG' : note.aiCorrection.status === 'WRONG' ? '❌ SỬA SAI' : '⚠️ LƯU Ý'}
                      </span>
                    </div>
                    <p className="font-medium text-[11px]">{note.aiCorrection.teacherFeedback}</p>
                    {note.aiCorrection.correctedContent && note.aiCorrection.status === 'WRONG' && (
                      <p className="mt-1 font-bold text-rose-800 text-[11px] bg-white/70 p-1 rounded">
                        ✏️ Sửa đúng: {note.aiCorrection.correctedContent}
                      </p>
                    )}
                    {note.aiCorrection.keyExplanation && (
                      <p className="mt-1 opacity-90 text-[10px]">
                        💡 {note.aiCorrection.keyExplanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* ================= PAPER CONTENT ================= */}
            <div className="p-6 sm:p-10 lg:p-14 space-y-9 select-text">

              {/* ================= MOJI-GOI (TỪ VỰNG - CHỮ HÁN) ================= */}
              {mojiGoiQuestions.length > 0 && (
                <section className="space-y-6 pt-4">
                  <div className={`border-b-2 pb-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-800'}`}>
                    <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-950'
                    }`}>
                      <span>文字・語彙</span>
                      {isSubmitted ? (
                        <span className={`text-xs font-sans font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          (Kiến thức ngôn ngữ: Từ vựng & Chữ Hán - {mojiGoiQuestions.length} câu)
                        </span>
                      ) : (
                        <span className={`text-xs font-sans font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          ({mojiGoiQuestions.length} 問)
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Mondai 1 Header */}
                  <div className={`border-l-4 border-amber-600 border-y border-r p-3.5 rounded text-xs leading-relaxed shadow-2xs ${
                    isDarkMode 
                      ? 'bg-[#151c27] border-slate-700 text-slate-200' 
                      : 'bg-[#f4f2ec] border-stone-300 text-slate-950'
                  }`}>
                    <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>
                      問題 1　＿＿＿の 言葉の 読み方として 最も よいものを １・２・３・４から 一つ 選びなさい。
                    </p>
                    {isSubmitted && (
                      <p className={`font-sans text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        (Hãy chọn cách đọc đúng nhất cho từ được gạch dưới/trong ngoặc từ các phương án 1, 2, 3, 4)
                      </p>
                    )}
                  </div>

                  {/* Question list for Moji-Goi */}
                  <div className="space-y-7">
                    {mojiGoiQuestions.map((q, idx) => (
                      <BookletQuestionCard
                        key={q.id}
                        question={q}
                        index={allQuestions.findIndex(item => item.id === q.id) + 1}
                        userAnswer={userAnswers[q.id]}
                        onSelectOption={(optIdx) => onSelectAnswer(q.id, optIdx)}
                        isSubmitted={isSubmitted}
                        isFlagged={Boolean(flaggedQuestions[q.id])}
                        onToggleFlag={() => onToggleFlag(q.id)}
                        note={questionNotes[q.id]}
                        onUpdateNote={(txt) => handleUpdateQuestionNote(q.id, txt)}
                        aiCorrection={questionNoteCorrections[q.id]}
                        isReviewingNotes={isReviewingNotes}
                        isDark={isDarkMode}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ================= BUNPOU (NGỮ PHÁP) ================= */}
              {bunpouQuestions.length > 0 && (
                <section className={`space-y-6 pt-8 border-t-2 border-dashed ${isDarkMode ? 'border-slate-700' : 'border-stone-300'}`}>
                  <div className={`border-b-2 pb-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-800'}`}>
                    <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-950'
                    }`}>
                      <span>文法</span>
                      {isSubmitted ? (
                        <span className={`text-xs font-sans font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          (Kiến thức ngôn ngữ: Ngữ pháp - {bunpouQuestions.length} câu)
                        </span>
                      ) : (
                        <span className={`text-xs font-sans font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          ({bunpouQuestions.length} 問)
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className={`border-l-4 border-amber-600 border-y border-r p-3.5 rounded text-xs leading-relaxed shadow-2xs ${
                    isDarkMode 
                      ? 'bg-[#151c27] border-slate-700 text-slate-200' 
                      : 'bg-[#f4f2ec] border-stone-300 text-slate-950'
                  }`}>
                    <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>
                      問題 2　（　　）に 何を 入れますか。最も よいものを １・２・３・４から 一つ 選びなさい。
                    </p>
                    {isSubmitted && (
                      <p className={`font-sans text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        (Điền từ ngữ pháp thích hợp nhất vào chỗ trống từ các phương án 1, 2, 3, 4)
                      </p>
                    )}
                  </div>

                  <div className="space-y-7">
                    {bunpouQuestions.map((q, idx) => (
                      <BookletQuestionCard
                        key={q.id}
                        question={q}
                        index={allQuestions.findIndex(item => item.id === q.id) + 1}
                        userAnswer={userAnswers[q.id]}
                        onSelectOption={(optIdx) => onSelectAnswer(q.id, optIdx)}
                        isSubmitted={isSubmitted}
                        isFlagged={Boolean(flaggedQuestions[q.id])}
                        onToggleFlag={() => onToggleFlag(q.id)}
                        note={questionNotes[q.id]}
                        onUpdateNote={(txt) => handleUpdateQuestionNote(q.id, txt)}
                        aiCorrection={questionNoteCorrections[q.id]}
                        isReviewingNotes={isReviewingNotes}
                        isDark={isDarkMode}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ================= DOKKAI (ĐỌC HIỂU) ================= */}
              {dokkaiQuestions.length > 0 && (
                <section className={`space-y-6 pt-8 border-t-2 border-dashed ${isDarkMode ? 'border-slate-700' : 'border-stone-300'}`}>
                  <div className={`border-b-2 pb-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-800'}`}>
                    <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-950'
                    }`}>
                      <span>読解</span>
                      {isSubmitted ? (
                        <span className={`text-xs font-sans font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          (Đọc hiểu đoạn văn - {dokkaiQuestions.length} câu)
                        </span>
                      ) : (
                        <span className={`text-xs font-sans font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          ({dokkaiQuestions.length} 問)
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className={`border-l-4 border-amber-600 border-y border-r p-3.5 rounded text-xs leading-relaxed shadow-2xs ${
                    isDarkMode 
                      ? 'bg-[#151c27] border-slate-700 text-slate-200' 
                      : 'bg-[#f4f2ec] border-stone-300 text-slate-950'
                  }`}>
                    <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>
                      問題 3　次の 文章を 読んで、質問に 答えなさい。答えは １・２・３・４から 最も よいものを 一つ 選びなさい。
                    </p>
                    {isSubmitted && (
                      <p className={`font-sans text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        (Đọc kỹ đoạn văn sau và chọn câu trả lời chính xác nhất từ 1, 2, 3, 4)
                      </p>
                    )}
                  </div>

                  {/* Grouped Reading Passages with their Questions underneath */}
                  <div className="space-y-10">
                    {dokkaiPassageGroups.map((group, groupIdx) => (
                      <div key={`dokkai-group-${groupIdx}`} className={`space-y-6 p-4 sm:p-6 rounded-2xl border-2 shadow-xs ${
                        isDarkMode ? 'bg-[#131b26] border-slate-700' : 'bg-[#f7f5ee] border-stone-300'
                      }`}>
                        {/* Render the Reading Passage ONCE per group */}
                        {group.passageBody && (
                          <div className={`border-2 rounded-xl p-4 sm:p-6 shadow-2xs ${
                            isDarkMode ? 'bg-[#18202c] border-slate-700 text-slate-100' : 'bg-white border-stone-300 text-slate-950'
                          }`}>
                            {group.passageTitle && (
                              <div className={`flex items-center gap-2 mb-3 pb-2.5 border-b font-bold font-jlpt-exam text-base sm:text-lg ${
                                isDarkMode ? 'border-slate-700 text-amber-300' : 'border-stone-200 text-amber-900'
                              }`}>
                                <BookOpen className={`w-5 h-5 shrink-0 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`} />
                                <span>{group.passageTitle}</span>
                              </div>
                            )}
                            <div className={`font-jlpt-exam text-base sm:text-lg leading-[2.3] whitespace-pre-line tracking-wide select-text ${
                              isDarkMode ? 'text-slate-100 font-normal' : 'text-slate-950 font-bold'
                            }`}>
                              {group.passageBody}
                            </div>

                            {isSubmitted && group.passageTranslation && (
                              <div className={`mt-4 pt-3 border-t text-xs font-sans leading-relaxed p-3 rounded-lg ${
                                isDarkMode 
                                  ? 'border-slate-700 bg-[#111923] border border-sky-800/80 text-slate-200' 
                                  : 'border-stone-200 bg-sky-50 border border-sky-200 text-slate-800'
                              }`}>
                                <strong className={`block mb-1 ${isDarkMode ? 'text-sky-400' : 'text-sky-900'}`}>🇻🇳 Bản dịch nghĩa đoạn văn:</strong>
                                {group.passageTranslation}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Associated Questions for this passage */}
                        <div className="space-y-6 pt-2">
                          {group.questions.map((q) => (
                            <BookletQuestionCard
                              key={q.id}
                              question={q}
                              index={allQuestions.findIndex(item => item.id === q.id) + 1}
                              userAnswer={userAnswers[q.id]}
                              onSelectOption={(optIdx) => onSelectAnswer(q.id, optIdx)}
                              isSubmitted={isSubmitted}
                              isFlagged={Boolean(flaggedQuestions[q.id])}
                              onToggleFlag={() => onToggleFlag(q.id)}
                              isDokkai={true}
                              hidePassage={true}
                              note={questionNotes[q.id]}
                              onUpdateNote={(txt) => handleUpdateQuestionNote(q.id, txt)}
                              aiCorrection={questionNoteCorrections[q.id]}
                              isReviewingNotes={isReviewingNotes}
                              isDark={isDarkMode}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ================= CHOUKAI (NGHE HIỂU) ================= */}
              {choukaiQuestions.length > 0 && (
                <section className={`space-y-6 pt-8 border-t-2 border-dashed ${isDarkMode ? 'border-slate-700' : 'border-stone-300'}`}>
                  <div className={`border-b-2 pb-2 flex items-center justify-between ${isDarkMode ? 'border-slate-700' : 'border-slate-800'}`}>
                    <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-950'
                    }`}>
                      <span>聴解</span>
                      {isSubmitted ? (
                        <span className={`text-xs font-sans font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          (Nghe hiểu - {choukaiQuestions.length} câu)
                        </span>
                      ) : (
                        <span className={`text-xs font-sans font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          ({choukaiQuestions.length} 問)
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 font-sans">
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                        {isSubmitted ? 'Tốc độ:' : '速度:'}
                      </span>
                      {[0.8, 1.0, 1.2].map(spd => (
                        <button
                          key={spd}
                          onClick={() => setAudioSpeed(spd)}
                          className={`px-2 py-0.5 rounded text-xs font-bold transition cursor-pointer ${
                            audioSpeed === spd 
                              ? 'bg-amber-500 text-slate-950 shadow-xs' 
                              : isDarkMode 
                                ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                                : 'bg-white border border-stone-300 text-slate-700 hover:bg-stone-100'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`border-l-4 border-amber-600 border-y border-r p-3.5 rounded text-xs leading-relaxed shadow-2xs ${
                    isDarkMode 
                      ? 'bg-[#151c27] border-slate-700 text-slate-200' 
                      : 'bg-[#f4f2ec] border-stone-300 text-slate-950'
                  }`}>
                    <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>
                      問題 4　音声を 聞いて、１・２・３・４から 最も よいものを 一つ 選びなさい。
                    </p>
                    {isSubmitted && (
                      <p className={`font-sans text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        (Bấm nút phát âm thanh ▶ ở đầu câu hỏi để nghe hội thoại và khoanh đáp án đúng)
                      </p>
                    )}
                  </div>

                  <div className="space-y-7">
                    {choukaiQuestions.map((q) => (
                      <div key={q.id} className="space-y-3">
                        <BookletQuestionCard
                          question={q}
                          index={allQuestions.findIndex(item => item.id === q.id) + 1}
                          userAnswer={userAnswers[q.id]}
                          onSelectOption={(optIdx) => onSelectAnswer(q.id, optIdx)}
                          isSubmitted={isSubmitted}
                          isFlagged={Boolean(flaggedQuestions[q.id])}
                          onToggleFlag={() => onToggleFlag(q.id)}
                          note={questionNotes[q.id]}
                          onUpdateNote={(txt) => handleUpdateQuestionNote(q.id, txt)}
                          aiCorrection={questionNoteCorrections[q.id]}
                          isReviewingNotes={isReviewingNotes}
                          onToggleAudio={() => handleToggleChoukaiTTS(q)}
                          isPlayingAudio={playingAudioId === q.id}
                          audioSpeed={audioSpeed}
                          isDark={isDarkMode}
                        />

                        {/* Script view when submitted */}
                        {isSubmitted && q.audioScript && (
                          <div className={`p-3.5 rounded-xl border text-xs font-sans whitespace-pre-line leading-relaxed shadow-2xs ${
                            isDarkMode 
                              ? 'bg-[#151c27] border-slate-700 text-slate-200' 
                              : 'bg-amber-50/80 border-amber-200 text-slate-900'
                          }`}>
                            <strong className={`block mb-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-900'}`}>📜 Kịch bản hội thoại (Script):</strong>
                            {q.audioScript}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* End of Booklet Seal */}
              <div className="border-t-2 border-stone-300 pt-8 pb-4 text-center space-y-3 font-sans">
                <p className="text-xs font-bold text-slate-500 tracking-widest">
                  ─── 問題は これで 終わりです (HẾT ĐỀ THI) ───
                </p>
                {!isSubmitted ? (
                  <button
                    onClick={onSubmitExam}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm rounded-xl shadow-lg transition cursor-pointer active:scale-95"
                  >
                    Hoàn thành & Nộp bài thi
                  </button>
                ) : (
                  <button
                    onClick={onExit}
                    className="px-8 py-3 bg-slate-900 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition cursor-pointer"
                  >
                    Trở về danh sách đề thi
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Exam History Modal */}
      {showHistoryModal && (
        <ExamHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          onSelectAttempt={(record) => {
            setSelectedPrintRecord(record);
            setShowPrintModal(true);
          }}
          onPrintAttempt={(record) => {
            setSelectedPrintRecord(record);
            setShowPrintModal(true);
          }}
        />
      )}

      {/* Printable Exam Booklet Modal */}
      {showPrintModal && selectedPrintRecord && (
        <PrintableExamBooklet
          record={selectedPrintRecord}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedPrintRecord(null);
          }}
        />
      )}

    </div>
  );
};

// ================= BOOKLET QUESTION CARD (WITH DIRECT ON-TEXT CIRCLING, INLINE USER NOTES & REALISTIC TEACHER HANDWRITTEN CORRECTIONS) =================
interface BookletQuestionCardProps {
  question: ExamQuestion;
  index: number;
  userAnswer?: number;
  onSelectOption: (optionIndex: number) => void;
  isSubmitted: boolean;
  isFlagged: boolean;
  onToggleFlag: () => void;
  isDokkai?: boolean;
  hidePassage?: boolean;
  note?: string;
  onUpdateNote?: (noteText: string) => void;
  aiCorrection?: NoteCorrectionItem;
  isReviewingNotes?: boolean;
  onToggleAudio?: () => void;
  isPlayingAudio?: boolean;
  audioSpeed?: number;
  isDark?: boolean;
}

const BookletQuestionCard: React.FC<BookletQuestionCardProps> = ({
  question,
  index,
  userAnswer,
  onSelectOption,
  isSubmitted,
  isFlagged,
  onToggleFlag,
  isDokkai = false,
  hidePassage = false,
  note = '',
  onUpdateNote,
  aiCorrection,
  isReviewingNotes = false,
  onToggleAudio,
  isPlayingAudio = false,
  audioSpeed = 1.0,
  isDark = false
}) => {
  const isCorrect = isSubmitted && userAnswer === question.correctIndex;
  const isWrong = isSubmitted && userAnswer !== undefined && userAnswer !== question.correctIndex;
  const isUnanswered = isSubmitted && userAnswer === undefined;

  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(Boolean(note && note.trim().length > 0));
  const [localNote, setLocalNote] = useState<string>(note);

  // Sync external note updates
  useEffect(() => {
    setLocalNote(note);
    if (note && note.trim().length > 0) {
      setIsNoteOpen(true);
    }
  }, [note]);

  // Decide if options are short enough to display inline horizontally
  const isShortOptions = question.options.every(opt => opt.length <= 8);

  // Detailed correction & analysis of all 4 options
  const detailedCorrection: DetailedQuestionCorrection = getDetailedQuestionCorrection(question);
  const [showFuriganaBreakdown, setShowFuriganaBreakdown] = useState<boolean>(false);
  const annotationResult = useMemo(() => isSubmitted ? annotateSentence(question.question, question, userAnswer) : null, [question, userAnswer, isSubmitted]);

  return (
    <div 
      data-question-id={question.id}
      id={`booklet-question-${question.id}`}
      className={`relative py-4 px-3 sm:px-5 transition-all font-jlpt-exam ${
        isSubmitted
          ? isCorrect
            ? isDark ? 'bg-emerald-950/20 border-b border-emerald-500/50' : 'bg-emerald-50/15 border-b border-emerald-300/80'
            : isWrong
              ? isDark ? 'bg-rose-950/20 border-b border-rose-500/50' : 'bg-rose-50/15 border-b border-rose-300/80'
              : isDark ? 'bg-amber-950/20 border-b border-amber-500/50' : 'bg-amber-50/15 border-b border-amber-300/80'
          : isDark 
            ? 'hover:bg-slate-800/40 border-b border-dashed border-slate-700/80' 
            : 'hover:bg-amber-50/30 border-b border-dashed border-slate-300/90'
      }`}
    >
      
      {/* Top Line: Question Index & Status Stamp */}
      <div className="flex items-start justify-between gap-2 mb-2 font-jlpt-exam">
        <div className="flex items-center gap-2.5">
          
          {/* Question Index with Japanese Real Booklet Box [ 1 ] */}
          <div className="relative flex items-center justify-center">
            <span className={`font-bold text-base sm:text-lg font-jlpt-exam px-2.5 py-0.5 rounded-xs shadow-2xs ${
              isDark 
                ? 'text-slate-100 border border-slate-600 bg-slate-800' 
                : 'text-slate-950 border border-slate-700 bg-white'
            }`}>
              {index}
            </span>

            {/* Teacher Red Ink Stamp on Question Number */}
            {isSubmitted && (
              <span className="absolute -top-3 -left-3 pointer-events-none select-none z-10 animate-in zoom-in-50 duration-200">
                {isCorrect ? (
                  /* Green Pen Circle for Correct */
                  <svg className="w-10 h-10 text-emerald-600 opacity-90 drop-shadow-xs" viewBox="0 0 100 100" fill="none">
                    <path
                      d="M 22,48 C 18,22 36,12 56,12 C 82,12 92,34 88,64 C 84,88 58,94 34,88 C 16,83 8,62 16,34"
                      stroke="#059669"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : isWrong ? (
                  /* Red Pen Cross (Batsu) */
                  <svg className="w-9 h-9 text-rose-600 opacity-90 drop-shadow-xs" viewBox="0 0 100 100" fill="none">
                    <path
                      d="M 20,20 L 80,80 M 80,20 L 20,80"
                      stroke="#e11d48"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  /* Unanswered Check */
                  <span className="text-amber-600 font-black text-xl">？</span>
                )}
              </span>
            )}
          </div>

          {/* Choukai Audio Play Button at the start of the question */}
          {question.section === 'choukai' && onToggleAudio && (
            <button
              type="button"
              onClick={onToggleAudio}
              className={`px-3 py-1 rounded-full cursor-pointer transition shadow-xs flex items-center gap-1.5 text-xs font-bold font-sans ${
                isPlayingAudio
                  ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
              title="Phát bài nghe audio"
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Dừng nghe</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                  <span>▶ Nghe audio</span>
                </>
              )}
            </button>
          )}

          {question.section === 'choukai' && question.audioTrack && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
              🎵 {question.audioTrack}
            </span>
          )}

          {/* Graded Badge Text */}
          {isSubmitted && (
            <div className="font-sans">
              {isCorrect && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-800 font-bold text-[11px] flex items-center gap-1 shadow-2xs">
                  <span>⭕ ĐÚNG (+1 điểm)</span>
                </span>
              )}
              {isWrong && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 border border-rose-400 text-rose-800 font-bold text-[11px] flex items-center gap-1 shadow-2xs">
                  <span>❌ SAI (Đáp án đúng: {question.correctIndex + 1})</span>
                </span>
              )}
              {isUnanswered && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-400 text-amber-800 font-bold text-[11px] flex items-center gap-1 shadow-2xs">
                  <span>⚠️ Chưa khoanh câu này</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dokkai formatted passage OR standard question text - Identical pre and post submission to prevent stroke offset bugs */}
      {(() => {
        const dokkaiData = parseDokkaiQuestion(question.question);
        if ((hidePassage || isDokkai) && dokkaiData.isDokkai) {
          return dokkaiData.questionPrompt ? (
            <div className={`mb-3.5 text-base sm:text-lg leading-relaxed font-jlpt-exam font-bold ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              {dokkaiData.questionPrompt}
            </div>
          ) : null;
        }
        if (dokkaiData.isDokkai && dokkaiData.passageBody) {
          return (
            <div className="space-y-3 mb-4">
              <div className={`border-2 rounded-xl p-4 sm:p-5 shadow-2xs ${
                isDark ? 'bg-[#18202c] border-slate-700 text-slate-100' : 'bg-white border-stone-300 text-slate-950'
              }`}>
                {dokkaiData.passageTitle && (
                  <div className={`flex items-center gap-2 mb-2.5 pb-2 border-b font-bold font-jlpt-exam ${
                    isDark ? 'border-slate-700 text-amber-300' : 'border-stone-200 text-amber-900'
                  }`}>
                    <BookOpen className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                    <span>{dokkaiData.passageTitle}</span>
                  </div>
                )}
                <div className={`font-jlpt-exam text-base sm:text-lg leading-[2.2] whitespace-pre-line tracking-wide select-text ${
                  isDark ? 'text-slate-100' : 'text-slate-950'
                }`}>
                  {dokkaiData.passageBody}
                </div>
              </div>

              {dokkaiData.questionPrompt && (
                <div className={`text-base sm:text-lg font-jlpt-exam font-bold pt-1 ${
                  isDark ? 'text-slate-100' : 'text-slate-950'
                }`}>
                  {renderStudyQuestionText({ question: dokkaiData.questionPrompt })}
                </div>
              )}
            </div>
          );
        }
        return (
          <div className={`mb-3.5 text-base sm:text-lg leading-relaxed font-jlpt-exam ${
            isDark ? 'text-slate-100' : 'text-slate-950'
          }`}>
            {renderStudyQuestionText(question)}
          </div>
        );
      })()}

      {/* Visual illustration diagram SVG / Image if present */}
      {question.imageSvg && (
        <div className={`my-4 p-3 sm:p-4 rounded-xl border flex justify-center items-center overflow-x-auto shadow-2xs ${
          isDark ? 'bg-[#18202c] border-slate-700' : 'bg-stone-50 border-stone-300'
        }`} dangerouslySetInnerHTML={{ __html: question.imageSvg }} />
      )}
      {question.imageUrl && (
        <div className={`my-4 p-3 sm:p-4 rounded-xl border flex justify-center items-center overflow-hidden shadow-2xs ${
          isDark ? 'bg-[#18202c] border-slate-700' : 'bg-stone-50 border-stone-300'
        }`}>
          <img src={question.imageUrl} alt="Hình minh họa bài thi" className="max-h-80 object-contain rounded-lg" />
        </div>
      )}

      {/* ================= 4 OPTIONS FORMATTED AS AUTHENTIC EXAM PAPER TEXT ================= */}
      <div className={`my-3 text-sm sm:text-base leading-relaxed font-jlpt-exam ${
        isShortOptions 
          ? 'flex flex-wrap items-center gap-x-6 sm:gap-x-10 gap-y-3' 
          : 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5'
      }`}>
        {question.options.map((option, optIdx) => {
          const isUserSelected = userAnswer === optIdx;
          const isThisCorrect = isSubmitted && optIdx === question.correctIndex;
          const isThisWrongSelected = isSubmitted && isUserSelected && !isThisCorrect;

          return (
            <div
              key={optIdx}
              id={`booklet-opt-${question.id}-${optIdx}`}
              data-exam-option="true"
              data-question-id={question.id}
              data-option-index={optIdx}
              onClick={() => onSelectOption(optIdx)}
              className={`relative inline-flex items-center gap-2 py-1 px-2.5 rounded-lg select-none transition-all ${
                isSubmitted ? 'cursor-default' : 'cursor-pointer'
              } ${
                isThisCorrect
                  ? isDark ? 'bg-emerald-950/60 ring-2 ring-emerald-500/70' : 'bg-emerald-100/90 ring-2 ring-emerald-500/80'
                  : isThisWrongSelected
                    ? isDark ? 'bg-rose-950/50 ring-2 ring-rose-500/70' : 'bg-rose-100/80 ring-2 ring-rose-400'
                    : isDark ? 'hover:bg-slate-800/60' : 'hover:bg-stone-200/50'
              }`}
            >
              {/* Number Box with Circle */}
              <div 
                data-option-number-box="true"
                className="relative flex items-center justify-center shrink-0 w-7 h-7 rounded-full transition-transform font-jlpt-exam"
              >
                <span className={`text-base font-bold transition-all font-jlpt-exam ${
                  isThisCorrect
                    ? 'text-emerald-600 dark:text-emerald-400 font-black scale-105'
                    : isThisWrongSelected
                      ? 'text-rose-600 dark:text-rose-400 font-black'
                      : isUserSelected 
                        ? isDark ? 'text-amber-400 font-black scale-105' : 'text-amber-900 font-black scale-105' 
                        : isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {optIdx + 1}
                </span>

                {/* Teacher Green Circle for Correct Answer */}
                {isThisCorrect && (
                  <svg 
                    className="absolute -inset-1.5 w-10 h-10 pointer-events-none select-none animate-in zoom-in-75 duration-150" 
                    viewBox="0 0 100 100" 
                    fill="none"
                  >
                    <path
                      d="M 18,50 C 14,24 28,12 52,12 C 78,12 90,32 86,62 C 82,86 58,92 34,86 C 16,81 9,61 17,34"
                      stroke="#059669"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {/* Active Exam Taking Pencil Circle (when not submitted or user selected) */}
                {!isThisCorrect && isUserSelected && (
                  <svg 
                    className="absolute -inset-1.5 w-10 h-10 pointer-events-none select-none animate-in zoom-in-75 duration-150" 
                    viewBox="0 0 100 100" 
                    fill="none"
                  >
                    <path
                      d="M 15,50 C 11,25 26,11 50,11 C 78,11 91,31 87,61 C 83,85 59,91 35,87 C 17,83 8,63 15,35"
                      stroke={isThisWrongSelected ? "#e11d48" : isDark ? "#f59e0b" : "#d97706"}
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Option Text on Paper */}
              <span className={`transition-all text-base font-jlpt-exam ${
                isThisCorrect
                  ? isDark ? 'text-emerald-200 font-bold' : 'text-emerald-950 font-bold'
                  : isThisWrongSelected
                    ? isDark ? 'text-rose-300 line-through opacity-90' : 'text-rose-900 line-through opacity-90'
                    : isUserSelected
                      ? isDark 
                        ? 'text-amber-200 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/50'
                        : 'text-amber-950 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300'
                      : isDark ? 'text-slate-200' : 'text-slate-950'
              }`}>
                {option}
              </span>

              {/* Teacher Badge next to Option */}
              {isThisCorrect && (
                <span className="font-sans text-[11px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white shadow-2xs ml-1">
                  ⭕ Đáp án đúng
                </span>
              )}
              {isThisWrongSelected && (
                <span className="font-sans text-[11px] font-bold px-1.5 py-0.2 rounded bg-rose-600 text-white shadow-2xs ml-1">
                  ❌ Đã chọn (Sai)
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= COMPREHENSIVE EXPLANATION & SOLUTION CARD (RENDERED SAFELY BELOW OPTIONS) ================= */}
      {isSubmitted && (
        <div className={`mt-4 pt-3.5 border-t-2 ${
          isDark ? 'border-slate-700/80' : 'border-stone-200'
        }`}>
          <div className={`rounded-xl p-3.5 sm:p-4 border text-xs sm:text-sm font-sans shadow-2xs space-y-3 ${
            isDark ? 'bg-[#151c27] border-slate-700/80 text-slate-200' : 'bg-[#faf8f4] border-stone-300/90 text-slate-900'
          }`}>
            {/* Header: Status & Summary */}
            <div className="flex items-center justify-between gap-2 border-b pb-2 border-inherit">
              <span className="font-bold flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <span>💡 Lời giải & Phân tích chi tiết câu {index}</span>
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isCorrect 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                  : isWrong 
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}>
                {isCorrect ? '⭕ Trả lời đúng' : isWrong ? `❌ Chưa đúng (Đã chọn: ${userAnswer! + 1}, Đáp án: ${question.correctIndex + 1})` : `⚠️ Chưa khoanh (Đáp án: ${question.correctIndex + 1})`}
              </span>
            </div>

            {/* Vietnamese Translation */}
            <div className="space-y-1">
              <div className="font-bold text-xs uppercase tracking-wide text-sky-700 dark:text-sky-400 flex items-center gap-1">
                <span>📖 Dịch nghĩa câu hỏi:</span>
              </div>
              <p className="font-sans leading-relaxed text-slate-800 dark:text-slate-200 text-xs sm:text-sm bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-inherit">
                {detailedCorrection.vietnameseTranslation || question.explanation || 'Không có bản dịch mẫu.'}
              </p>
            </div>

            {/* Core Rule & Explanation */}
            {(detailedCorrection.coreRule || question.explanation) && (
              <div className="space-y-1">
                <div className="font-bold text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <span>🎯 Trọng tâm kiến thức & Lời giải:</span>
                </div>
                <p className="font-sans leading-relaxed text-slate-800 dark:text-slate-200 text-xs sm:text-sm bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-inherit">
                  {detailedCorrection.coreRule || question.explanation}
                </p>
              </div>
            )}

            {/* 4 Options breakdown */}
            {detailedCorrection.optionsAnalysis && detailedCorrection.optionsAnalysis.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="font-bold text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  🔍 Phân tích chi tiết từng phương án:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detailedCorrection.optionsAnalysis.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-lg border text-xs leading-relaxed space-y-1 ${
                        opt.isCorrect
                          ? isDark 
                            ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200' 
                            : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : isDark
                            ? 'bg-slate-900/50 border-slate-700/70 text-slate-300'
                            : 'bg-white border-stone-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 font-bold">
                        <span className="font-jlpt-exam text-sm font-black">
                          [{opt.index}] {opt.optionText}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-bold ${
                          opt.isCorrect 
                            ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}>
                          {opt.statusTag}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs opacity-90">{opt.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Script for Choukai */}
            {question.audioScript && (
              <div className="space-y-1 pt-1">
                <div className="font-bold text-xs uppercase tracking-wide text-purple-700 dark:text-purple-400 flex items-center gap-1">
                  <span>🎧 Audio Script (Lời thoại bài nghe):</span>
                </div>
                <div className="font-jlpt-exam leading-relaxed p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-inherit text-xs sm:text-sm whitespace-pre-line">
                  {question.audioScript}
                </div>
              </div>
            )}

            {/* Toggle Furigana & Word breakdown */}
            {annotationResult && annotationResult.tokens && annotationResult.tokens.length > 0 && (
              <div className="pt-2 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setShowFuriganaBreakdown(!showFuriganaBreakdown)}
                  className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showFuriganaBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{showFuriganaBreakdown ? 'Thu gọn phân tích Furigana & từng từ' : '🔍 Xem phân tích Furigana & nghĩa từng từ trong câu'}</span>
                </button>

                {showFuriganaBreakdown && (
                  <div className="mt-3 p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-inherit animate-in fade-in space-y-3">
                    <div className="flex flex-wrap items-baseline gap-y-8 gap-x-2 pt-4 pb-2">
                      {annotationResult.tokens.map((tok) => (
                        <div key={tok.id} className="relative inline-flex flex-col items-center justify-center">
                          {tok.topAnnotation && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none select-none">
                              <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-slate-800 px-1 rounded border border-sky-200 dark:border-sky-800">
                                {tok.topAnnotation}
                              </span>
                            </div>
                          )}
                          <span className="font-jlpt-exam text-base font-bold text-slate-900 dark:text-slate-100 px-0.5">
                            {tok.text}
                          </span>
                          {tok.bottomAnnotation && (
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none select-none">
                              <span className="font-sans text-[10px] text-slate-600 dark:text-slate-400 bg-stone-100 dark:bg-slate-800 px-1 rounded border border-stone-200 dark:border-slate-700">
                                {tok.bottomAnnotation}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
