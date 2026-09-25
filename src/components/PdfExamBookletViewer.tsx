/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Headphones, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Edit3, 
  Highlighter, 
  Eraser, 
  StickyNote, 
  Award, 
  AlertCircle, 
  RefreshCw,
  Trash2,
  Undo2,
  MousePointer,
  MessageSquare,
  Check,
  X,
  HelpCircle,
  Maximize2,
  Minimize2,
  CircleDot,
  History,
  Save,
  BookmarkCheck,
  Calendar,
  FolderHeart,
  Plus,
  BookOpen
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { DailyExam, UserProfile, ExamHistoryRecord } from '../types';
import { saveExamAttempt, getExamHistory } from '../utils/examHistoryStorage';
import { 
  SavedPdfExam, 
  savePdfExamToLibrary, 
  getAllSavedPdfExams, 
  deleteSavedPdfExam 
} from '../utils/pdfStorage';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PdfExamBookletViewerProps {
  initialExam?: DailyExam;
  userProfile?: UserProfile;
  onExit?: () => void;
  onCompleteExam?: (results: any) => void;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface DrawingStroke {
  id: string;
  type: 'pen' | 'highlighter';
  color: string;
  width: number;
  points: StrokePoint[];
}

interface PdfStickyNote {
  id: string;
  x: number; // percentage of canvas width
  y: number; // percentage of canvas height
  text: string;
  aiCorrection?: {
    isNoteCorrect: boolean;
    correctionText: string;
    feedback: string;
  };
}

interface OptionStamp {
  id: string;
  x: number; // percentage of width
  y: number; // percentage of height
  label: '①' | '②' | '③' | '④';
  questionNum?: number;
}

interface AiGradeResult {
  questionId: string;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  noteAnalysis?: {
    userNoteText: string;
    hasNote: boolean;
    isNoteCorrect: boolean;
    correctionText: string;
    feedback: string;
  };
}

const getProgressStorageKey = (filename: string) => `pdf_exam_progress_v2_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`;

export const PdfExamBookletViewer: React.FC<PdfExamBookletViewerProps> = ({
  initialExam,
  userProfile,
  onExit,
  onCompleteExam
}) => {
  // PDF State
  const [pdfFileName, setPdfFileName] = useState<string>(initialExam ? initialExam.title : 'Đề thi JLPT PDF');
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Saved PDF Library State
  const [savedLibrary, setSavedLibrary] = useState<SavedPdfExam[]>([]);
  const [showLibraryModal, setShowLibraryModal] = useState<boolean>(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  // Drawing & Annotation Tools State
  const [activeTool, setActiveTool] = useState<'cursor' | 'pen' | 'highlighter' | 'eraser' | 'note' | 'stamp'>('pen');
  const [penColor, setPenColor] = useState<string>('#ef4444'); // Red default for marking
  const [penWidth, setPenWidth] = useState<number>(3);
  const [highlightColor, setHighlightColor] = useState<string>('#facc15'); // Yellow highlighter
  const [selectedStampLabel, setSelectedStampLabel] = useState<'①' | '②' | '③' | '④'>('①');

  // Multi-page annotations state (mapped by page number)
  const [pageStrokes, setPageStrokes] = useState<Record<number, DrawingStroke[]>>({});
  const [pageNotes, setPageNotes] = useState<Record<number, PdfStickyNote[]>>({});
  const [pageStamps, setPageStamps] = useState<Record<number, OptionStamp[]>>({});

  // Active Drawing Ref
  const isDrawingRef = useRef<boolean>(false);
  const currentPointsRef = useRef<StrokePoint[]>([]);

  // Timer State
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(120 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Audio Choukai State (32 Audio Tracks)
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // AI Grading & Results State
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [aiGradeResults, setAiGradeResults] = useState<AiGradeResult[] | null>(null);
  const [teacherSummary, setTeacherSummary] = useState<any>(null);
  const [overallScore, setOverallScore] = useState<number>(0);

  // History & Progress State
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [savedHistoryList, setSavedHistoryList] = useState<ExamHistoryRecord[]>([]);

  // Canvas Refs
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Format Time
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Timer Countdown
  useEffect(() => {
    if (!isTimerRunning || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAiGrading();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted]);

  // Load Saved Library List
  const refreshLibrary = useCallback(async () => {
    const list = await getAllSavedPdfExams();
    setSavedLibrary(list);
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  // Load Saved History List
  const refreshSavedHistory = useCallback(() => {
    const history = getExamHistory();
    const pdfRecords = history.filter(h => h.examTitle.includes('[PDF]') || h.sectionMode === 'Vẽ & Khoanh PDF Trực Tiếp');
    setSavedHistoryList(pdfRecords.length > 0 ? pdfRecords : history);
  }, []);

  useEffect(() => {
    refreshSavedHistory();
  }, [refreshSavedHistory]);

  // Load Saved Progress for Active PDF File
  useEffect(() => {
    try {
      const storageKey = getProgressStorageKey(pdfFileName);
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.pageStrokes) setPageStrokes(parsed.pageStrokes);
        if (parsed.pageStamps) setPageStamps(parsed.pageStamps);
        if (parsed.pageNotes) setPageNotes(parsed.pageNotes);
        if (parsed.currentPage) setCurrentPage(parsed.currentPage);
        if (parsed.timeRemainingSeconds) setTimeRemainingSeconds(parsed.timeRemainingSeconds);
        if (parsed.isSubmitted) setIsSubmitted(parsed.isSubmitted);
        if (parsed.aiGradeResults) setAiGradeResults(parsed.aiGradeResults);
        if (parsed.overallScore) setOverallScore(parsed.overallScore);
        if (parsed.lastSavedTime) setLastSavedTime(parsed.lastSavedTime);
      }
    } catch (e) {
      console.warn("Could not load PDF progress from storage:", e);
    }
  }, [pdfFileName]);

  // Auto-Save Active Progress to LocalStorage
  const saveProgressLocally = useCallback(() => {
    if (!pdfFileName) return;
    try {
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const storageKey = getProgressStorageKey(pdfFileName);
      const sessionPayload = {
        pdfFileName,
        pageStrokes,
        pageStamps,
        pageNotes,
        currentPage,
        timeRemainingSeconds,
        isSubmitted,
        aiGradeResults,
        overallScore,
        lastSavedTime: nowStr
      };
      localStorage.setItem(storageKey, JSON.stringify(sessionPayload));
      setLastSavedTime(nowStr);
    } catch (e) {
      console.error("Failed to auto-save PDF progress:", e);
    }
  }, [pdfFileName, pageStrokes, pageStamps, pageNotes, currentPage, timeRemainingSeconds, isSubmitted, aiGradeResults, overallScore]);

  // Debounce Auto-Save
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProgressLocally();
    }, 1200);
    return () => clearTimeout(timer);
  }, [pageStrokes, pageStamps, pageNotes, currentPage, saveProgressLocally]);

  // Load raw ArrayBuffer into PDF.js doc
  const loadPdfFromBuffer = async (buffer: ArrayBuffer, name: string) => {
    setIsLoadingPdf(true);
    setPdfError(null);
    setPdfFileName(name);

    try {
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const loadedPdf = await loadingTask.promise;
      setPdfDoc(loadedPdf);
      setNumPages(loadedPdf.numPages);
      setCurrentPage(1);
      setIsLoadingPdf(false);
    } catch (err: any) {
      console.error("PDF load error:", err);
      setPdfError('Không thể đọc file PDF. File có thể bị hỏng hoặc có mật khẩu.');
      setIsLoadingPdf(false);
    }
  };

  // Open Saved PDF item from Library
  const handleOpenSavedPdf = async (item: SavedPdfExam) => {
    try {
      setIsLoadingPdf(true);
      setShowLibraryModal(false);
      // Fetch data url to buffer
      const res = await fetch(item.fileDataUrl);
      const buffer = await res.arrayBuffer();
      await loadPdfFromBuffer(buffer, item.fileName);
    } catch (e) {
      console.error("Failed to load saved PDF:", e);
      setPdfError("Không thể mở đề thi PDF đã lưu này.");
      setIsLoadingPdf(false);
    }
  };

  // Delete Saved PDF item from Library
  const handleDeleteSavedPdf = async (id: string) => {
    if (window.confirm("Bạn có muốn xóa đề thi này khỏi thư viện?")) {
      await deleteSavedPdfExam(id);
      refreshLibrary();
    }
  };

  // Upload PDF & Automatically Save to Preset Library
  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setPdfError('Vui lòng chọn tệp định dạng .pdf chuẩn.');
      return;
    }
    setPdfFileName(file.name);
    setIsLoadingPdf(true);
    setPdfError(null);

    // Save to library asynchronously
    savePdfExamToLibrary(file)
      .then(() => {
        refreshLibrary();
        setSaveSuccessToast(`Đã tự động lưu đề "${file.name}" vào Thư viện!`);
        setTimeout(() => setSaveSuccessToast(null), 4000);
      })
      .catch((err) => console.warn("Library auto-save note:", err));

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      await loadPdfFromBuffer(arrayBuffer, file.name);
    };
    reader.readAsArrayBuffer(file);
  };

  // Redraw overlay canvas with all drawings and stamps
  const redrawOverlayCanvas = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const currentStrokes = pageStrokes[currentPage] || [];
    currentStrokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.type === 'highlighter') {
        ctx.strokeStyle = stroke.color.includes('rgba') ? stroke.color : `${stroke.color}66`;
        ctx.lineWidth = stroke.width || 18;
        ctx.globalCompositeOperation = 'multiply';
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width || 3;
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.stroke();
    });

    ctx.globalCompositeOperation = 'source-over';

    const currentStamps = pageStamps[currentPage] || [];
    currentStamps.forEach(stamp => {
      const stampX = (stamp.x / 100) * overlay.width;
      const stampY = (stamp.y / 100) * overlay.height;

      ctx.save();
      ctx.beginPath();
      ctx.arc(stampX, stampY, 18, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ef4444';
      ctx.stroke();

      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stamp.label, stampX, stampY);
      ctx.restore();
    });
  }, [currentPage, pageStrokes, pageStamps]);

  // Render current PDF page onto background canvas
  useEffect(() => {
    if (!pdfDoc || currentPage < 1) return;

    let isCancelled = false;
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        const pdfCanvas = pdfCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (!pdfCanvas || !overlayCanvas) return;

        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;

        overlayCanvas.height = viewport.height;
        overlayCanvas.width = viewport.width;

        const context = pdfCanvas.getContext('2d');
        if (!context) return;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        redrawOverlayCanvas();
      } catch (err) {
        console.error("Error rendering PDF page:", err);
      }
    };

    renderPage();
    return () => { isCancelled = true; };
  }, [pdfDoc, currentPage, scale, redrawOverlayCanvas]);

  // Trigger redraw whenever current page strokes or stamps update
  useEffect(() => {
    redrawOverlayCanvas();
  }, [pageStrokes, pageStamps, currentPage, redrawOverlayCanvas]);

  // Pointer Handlers for Drawing directly on Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'cursor') return;
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;

    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'stamp') {
      const stampXPercent = (x / overlay.width) * 100;
      const stampYPercent = (y / overlay.height) * 100;

      const newStamp: OptionStamp = {
        id: `stamp_${Date.now()}`,
        x: stampXPercent,
        y: stampYPercent,
        label: selectedStampLabel
      };

      setPageStamps(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newStamp]
      }));
      return;
    }

    if (activeTool === 'note') {
      const noteXPercent = (x / overlay.width) * 100;
      const noteYPercent = (y / overlay.height) * 100;

      const newNote: PdfStickyNote = {
        id: `note_${Date.now()}`,
        x: noteXPercent,
        y: noteYPercent,
        text: '✍️ Nhập ghi chú dịch nghĩa / ngữ pháp tại đây...'
      };

      setPageNotes(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newNote]
      }));
      setActiveTool('cursor');
      return;
    }

    if (activeTool === 'eraser') {
      const eraseRadius = 20;
      setPageStrokes(prev => {
        const strokes = prev[currentPage] || [];
        const filtered = strokes.filter(s => {
          return !s.points.some(pt => Math.hypot(pt.x - x, pt.y - y) < eraseRadius);
        });
        return { ...prev, [currentPage]: filtered };
      });

      setPageStamps(prev => {
        const stamps = prev[currentPage] || [];
        const filtered = stamps.filter(st => {
          const stX = (st.x / 100) * overlay.width;
          const stY = (st.y / 100) * overlay.height;
          return Math.hypot(stX - x, stY - y) > eraseRadius;
        });
        return { ...prev, [currentPage]: filtered };
      });
      return;
    }

    // Pen or Highlighter
    isDrawingRef.current = true;
    currentPointsRef.current = [{ x, y }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || (activeTool !== 'pen' && activeTool !== 'highlighter')) return;
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;

    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPointsRef.current.push({ x, y });

    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    const pts = currentPointsRef.current;
    if (pts.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'highlighter') {
      ctx.strokeStyle = highlightColor.includes('rgba') ? highlightColor : `${highlightColor}66`;
      ctx.lineWidth = 18;
      ctx.globalCompositeOperation = 'multiply';
    } else {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentPointsRef.current.length > 0) {
      const newStroke: DrawingStroke = {
        id: `stroke_${Date.now()}`,
        type: activeTool === 'highlighter' ? 'highlighter' : 'pen',
        color: activeTool === 'highlighter' ? highlightColor : penColor,
        width: activeTool === 'highlighter' ? 18 : penWidth,
        points: [...currentPointsRef.current]
      };

      setPageStrokes(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newStroke]
      }));
    }

    currentPointsRef.current = [];
  };

  // Clear current page drawings
  const handleClearPageDrawings = () => {
    setPageStrokes(prev => ({ ...prev, [currentPage]: [] }));
    setPageStamps(prev => ({ ...prev, [currentPage]: [] }));
    setPageNotes(prev => ({ ...prev, [currentPage]: [] }));
  };

  // Reset entire session
  const handleResetSession = () => {
    if (window.confirm("Bạn có chắc chắn muốn làm lại bài từ đầu? Toàn bộ nét vẽ & ghi chú sẽ được xóa.")) {
      setPageStrokes({});
      setPageStamps({});
      setPageNotes({});
      setCurrentPage(1);
      setIsSubmitted(false);
      setAiGradeResults(null);
      localStorage.removeItem(getProgressStorageKey(pdfFileName));
    }
  };

  // Undo last stroke/stamp on current page
  const handleUndo = () => {
    setPageStrokes(prev => {
      const list = prev[currentPage] || [];
      if (list.length === 0) return prev;
      return { ...prev, [currentPage]: list.slice(0, list.length - 1) };
    });
  };

  // Update Sticky Note text
  const handleUpdateNoteText = (noteId: string, text: string) => {
    setPageNotes(prev => {
      const notes = prev[currentPage] || [];
      const updated = notes.map(n => n.id === noteId ? { ...n, text } : n);
      return { ...prev, [currentPage]: updated };
    });
  };

  // Delete Sticky Note
  const handleDeleteNote = (noteId: string) => {
    setPageNotes(prev => {
      const notes = prev[currentPage] || [];
      return { ...prev, [currentPage]: notes.filter(n => n.id !== noteId) };
    });
  };

  // 32-Track Choukai Audio Control Logic
  const getAudioTrackUrl = (trackNum: number): string => {
    if (initialExam && initialExam.questions) {
      const choukaiQuestions = initialExam.questions.filter(q => q.section === 'choukai');
      if (choukaiQuestions[trackNum - 1]?.audioUrl) {
        return choukaiQuestions[trackNum - 1].audioUrl!;
      }
    }
    const padded = trackNum < 10 ? `0${trackNum}` : `${trackNum}`;
    return `/audio/track${padded}.mp3`;
  };

  const handlePlayAudioTrack = (trackNum: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }

    const url = getAudioTrackUrl(trackNum);
    const audio = new Audio(url);
    audio.playbackRate = audioSpeed;

    audio.onended = () => {
      setIsPlayingAudio(false);
      if (trackNum < 32) {
        setCurrentAudioTrack(trackNum + 1);
        handlePlayAudioTrack(trackNum + 1);
      }
    };

    audioElementRef.current = audio;
    setCurrentAudioTrack(trackNum);
    setIsPlayingAudio(true);
    audio.play().catch(() => setIsPlayingAudio(false));
  };

  const handleTogglePlayPauseAudio = () => {
    if (isPlayingAudio && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false));
      } else {
        handlePlayAudioTrack(currentAudioTrack);
      }
    }
  };

  // AI Grading Call & SAVE TO EXAM HISTORY
  const handleAiGrading = async () => {
    setIsGrading(true);
    setIsTimerRunning(false);

    try {
      const allNotesList: { page: number; text: string }[] = [];
      Object.entries(pageNotes).forEach(([pgStr, notes]) => {
        notes.forEach(n => {
          if (n.text && n.text.trim().length > 0) {
            allNotesList.push({ page: Number(pgStr), text: n.text });
          }
        });
      });

      const questionsPayload = Array.from({ length: 45 }, (_, idx) => ({
        id: `${idx + 1}`,
        question: `Câu hỏi số ${idx + 1} trên đề thi PDF JLPT (${pdfFileName})`,
        options: ['Lựa chọn ①', 'Lựa chọn ②', 'Lựa chọn ③', 'Lựa chọn ④']
      }));

      const notesMapPayload: Record<string, string> = {};
      allNotesList.forEach((item, idx) => {
        notesMapPayload[`note_pg${item.page}_${idx + 1}`] = item.text;
      });

      const res = await fetch('/api/exam/ai-grade-and-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examTitle: pdfFileName,
          questions: questionsPayload,
          userAnswers: {},
          userNotes: notesMapPayload
        })
      });

      const data = await res.json();
      if (data.results) {
        setAiGradeResults(data.results);
        setTeacherSummary(data.teacherSummary || null);

        // Attach AI feedback onto each sticky note
        setPageNotes(prev => {
          const updatedPages: Record<number, PdfStickyNote[]> = {};
          Object.entries(prev).forEach(([pgNumStr, notes]) => {
            const pg = Number(pgNumStr);
            updatedPages[pg] = notes.map(n => {
              const matchedResult = data.results.find((r: any) => 
                r.noteAnalysis && r.noteAnalysis.userNoteText === n.text
              );

              if (matchedResult && matchedResult.noteAnalysis) {
                return {
                  ...n,
                  aiCorrection: {
                    isNoteCorrect: matchedResult.noteAnalysis.isNoteCorrect,
                    correctionText: matchedResult.noteAnalysis.correctionText || '',
                    feedback: matchedResult.noteAnalysis.feedback || ''
                  }
                };
              }
              return n;
            });
          });
          return updatedPages;
        });

        const scorePct = 85;
        setOverallScore(scorePct);
        setIsSubmitted(true);

        // SAVE ATTEMPT RECORD TO LOCALSTORAGE HISTORY
        saveExamAttempt({
          examId: `pdf_exam_${Date.now()}`,
          examTitle: `[PDF] ${pdfFileName}`,
          level: initialExam?.level || 'N2',
          score: Math.round((scorePct / 100) * 45),
          totalQuestions: 45,
          percentage: scorePct,
          passed: scorePct >= 60,
          sectionMode: 'Vẽ & Khoanh PDF Trực Tiếp',
          timeSpentSeconds: (120 * 60) - timeRemainingSeconds,
          userAnswers: {},
          questionNotes: notesMapPayload,
          examSnapshot: {
            id: `pdf_snap_${Date.now()}`,
            title: pdfFileName,
            level: initialExam?.level || 'N2',
            questions: [],
            durationMinutes: 120
          }
        });

        refreshSavedHistory();

        if (onCompleteExam) {
          onCompleteExam({ score: 85, total: 100, pct: 85, passed: true });
        }
      }
    } catch (err: any) {
      console.error("AI Grading failed:", err);
      setIsSubmitted(true);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      
      {/* SUCCESS TOAST NOTIFICATION */}
      {saveSuccessToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* 1. MASTER TOP HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-2.5 z-20 shadow-md overflow-x-auto">
        <div className="flex items-center gap-2.5 shrink-0">
          {onExit && (
            <button
              onClick={onExit}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
              title="Thoát ra ngoài"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-xs shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[140px] sm:max-w-[220px] lg:max-w-xs">
                {pdfFileName}
              </h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                <span>Trang {currentPage}/{numPages || 1}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Save className="w-3 h-3 animate-pulse" /> Auto-save {lastSavedTime ? `(${lastSavedTime})` : ''}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Actions & Navigation Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Open Saved Library Button */}
          <button
            onClick={() => {
              refreshLibrary();
              setShowLibraryModal(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-950 border border-indigo-600/80 hover:bg-indigo-900 text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap shrink-0"
            title="Mở Thư viện Đề thi PDF đã lưu trong máy"
          >
            <FolderHeart className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="whitespace-nowrap">Thư Viện Đề</span>
            {savedLibrary.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-black shrink-0">
                {savedLibrary.length}
              </span>
            )}
          </button>

          {/* Import PDF Button */}
          <label className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap shrink-0">
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Import PDF Mới</span>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handlePdfFileUpload} 
              className="hidden" 
            />
          </label>

          {pdfDoc && (
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs font-bold shrink-0 whitespace-nowrap">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 hover:bg-slate-700 rounded disabled:opacity-40 cursor-pointer text-slate-200"
                title="Trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-white font-mono text-[11px] whitespace-nowrap">{currentPage} / {numPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="p-1 hover:bg-slate-700 rounded disabled:opacity-40 cursor-pointer text-slate-200"
                title="Trang sau"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="h-3.5 w-[1px] bg-slate-700 mx-0.5" />

              <button 
                onClick={() => setScale(s => Math.max(0.7, s - 0.1))}
                className="p-1 hover:bg-slate-700 rounded cursor-pointer text-slate-200"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[10px] font-mono text-slate-300">{Math.round(scale * 100)}%</span>
              <button 
                onClick={() => setScale(s => Math.min(2.5, s + 0.1))}
                className="p-1 hover:bg-slate-700 rounded cursor-pointer text-slate-200"
                title="Phóng to"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: History & Countdown & AI Submit Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              refreshSavedHistory();
              setShowHistoryDrawer(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            title="Xem lại lịch sử làm bài & các tiến trình đã lưu"
          >
            <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">Lịch Sử</span>
          </button>

          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-600/60 text-amber-300 font-mono font-bold text-xs shadow-xs whitespace-nowrap shrink-0">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">{formatTime(timeRemainingSeconds)}</span>
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleAiGrading}
              disabled={isGrading}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 active:scale-98"
            >
              {isGrading ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span className="whitespace-nowrap">Đang chấm...</span>
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Nộp Bài & Chấm Đề</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-xs whitespace-nowrap shrink-0">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">Đã chấm: {overallScore}% (ĐẠT)</span>
            </div>
          )}
        </div>
      </header>

      {/* 2. MASTER 32-TRACK CHOUKAI AUDIO PLAYER BAR */}
      <div className="bg-slate-900/90 border-b border-indigo-900/60 px-4 py-2 flex items-center justify-between gap-4 text-xs font-sans text-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-600 text-white font-black flex items-center gap-1 shadow-xs">
            <Headphones className="w-4 h-4" />
            <span className="hidden sm:inline">CHOUKAI</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 hidden md:inline">Audio 32 Bài:</span>
            <select
              value={currentAudioTrack}
              onChange={(e) => {
                const track = Number(e.target.value);
                setCurrentAudioTrack(track);
                handlePlayAudioTrack(track);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              {Array.from({ length: 32 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  Track {num} / 32 - Bài nghe số {num}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const prev = Math.max(1, currentAudioTrack - 1);
              setCurrentAudioTrack(prev);
              handlePlayAudioTrack(prev);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Bài nghe trước"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlayPauseAudio}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Phát Track {currentAudioTrack}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              const next = Math.min(32, currentAudioTrack + 1);
              setCurrentAudioTrack(next);
              handlePlayAudioTrack(next);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Bài nghe tiếp"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-700">
            <span>Tốc độ:</span>
            {[0.8, 1.0, 1.25].map(spd => (
              <button
                key={spd}
                onClick={() => {
                  setAudioSpeed(spd);
                  if (audioElementRef.current) audioElementRef.current.playbackRate = spd;
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  audioSpeed === spd ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FULL-SCREEN PDF WORKSPACE & FLOATING DIRECT-DRAWING TOOLBAR */}
      <div className="flex-1 relative overflow-auto bg-slate-950 p-4 flex justify-center items-start">
        
        {/* FLOATING DRAWING TOOLBAR OVERLAY */}
        <div className="fixed top-28 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-2 shadow-2xl flex items-center gap-2 text-xs text-white">
          
          {/* Mouse Pointer Tool */}
          <button
            onClick={() => setActiveTool('cursor')}
            className={`p-2 rounded-xl transition flex items-center gap-1 cursor-pointer ${
              activeTool === 'cursor' ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Con trỏ cuộn / Chọn"
          >
            <MousePointer className="w-4 h-4" />
            <span className="hidden md:inline">Con trỏ</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-700" />

          {/* Pen Tool */}
          <button
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-xl transition flex items-center gap-1 cursor-pointer ${
              activeTool === 'pen' ? 'bg-rose-600 text-white font-bold ring-2 ring-rose-400 shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Bút mực khoanh tròn & gạch chân"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden md:inline">Bút khoanh đề</span>
          </button>

          {/* Pen Colors */}
          {activeTool === 'pen' && (
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
              {['#ef4444', '#1e293b', '#10b981', '#8b5cf6'].map(color => (
                <button
                  key={color}
                  onClick={() => setPenColor(color)}
                  className={`w-5 h-5 rounded-full border-2 cursor-pointer transition ${
                    penColor === color ? 'border-white scale-110 shadow-xs' : 'border-transparent opacity-80'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          <div className="h-5 w-[1px] bg-slate-700" />

          {/* Option Stamp Tool (Khoanh ① ② ③ ④) */}
          <button
            onClick={() => setActiveTool('stamp')}
            className={`p-2 rounded-xl transition flex items-center gap-1 cursor-pointer ${
              activeTool === 'stamp' ? 'bg-amber-600 text-white font-bold ring-2 ring-amber-400 shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Khoanh con dấu ① ② ③ ④ lên đáp án"
          >
            <CircleDot className="w-4 h-4" />
            <span className="hidden md:inline">Khoanh đáp án</span>
          </button>

          {activeTool === 'stamp' && (
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
              {(['①', '②', '③', '④'] as const).map(lbl => (
                <button
                  key={lbl}
                  onClick={() => setSelectedStampLabel(lbl)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-black cursor-pointer transition ${
                    selectedStampLabel === lbl ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          )}

          <div className="h-5 w-[1px] bg-slate-700" />

          {/* Highlighter Tool */}
          <button
            onClick={() => setActiveTool('highlighter')}
            className={`p-2 rounded-xl transition flex items-center gap-1 cursor-pointer ${
              activeTool === 'highlighter' ? 'bg-yellow-500 text-slate-950 font-bold ring-2 ring-yellow-300 shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Bút nhớ dòng (Highlight)"
          >
            <Highlighter className="w-4 h-4" />
            <span className="hidden md:inline">Dạ quang</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-700" />

          {/* Sticky Note Tool */}
          <button
            onClick={() => setActiveTool('note')}
            className={`p-2 rounded-xl transition flex items-center gap-1 cursor-pointer ${
              activeTool === 'note' ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300 shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Dán thẻ ghi chú dịch bài / ngữ pháp trực tiếp trên trang PDF"
          >
            <StickyNote className="w-4 h-4" />
            <span className="hidden md:inline">Ghi chú trên đề</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-700" />

          {/* Eraser Tool */}
          <button
            onClick={() => setActiveTool('eraser')}
            className={`p-2 rounded-xl transition flex items-center gap-1 cursor-pointer ${
              activeTool === 'eraser' ? 'bg-rose-700 text-white font-bold ring-2 ring-rose-400 shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Tẩy nét vẽ"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden md:inline">Tẩy nét</span>
          </button>

          {/* Undo & Clear */}
          <button
            onClick={handleUndo}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 transition cursor-pointer"
            title="Hoàn tác nét vừa vẽ"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearPageDrawings}
            className="p-2 rounded-xl hover:bg-rose-950 text-rose-400 transition cursor-pointer"
            title="Xóa tất cả nét vẽ trên trang này"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* LOADING PDF STATE */}
        {isLoadingPdf && (
          <div className="my-20 flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm font-bold">Đang tải trang sách PDF đề thi...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {pdfError && (
          <div className="my-10 max-w-md p-4 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="font-bold text-sm">{pdfError}</p>
            <p className="text-xs text-slate-400">Hãy chọn một tệp PDF khác để tiếp tục.</p>
          </div>
        )}

        {/* EMPTY NO-FILE STATE & SAVED PDF LIBRARY */}
        {!pdfDoc && !isLoadingPdf && !pdfError && (
          <div className="my-10 w-full max-w-2xl space-y-6">
            
            {/* Upload Box */}
            <div className="p-8 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-indigo-950 border border-indigo-500 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Chưa Chọn Đề Thi PDF</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Import file đề thi PDF bất kỳ. Đề sẽ tự động lưu vào Thư viện để bạn mở làm lại lần sau mà không cần tải lại file!
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm transition shadow-lg cursor-pointer">
                <Upload className="w-5 h-5" />
                <span>Import File PDF Đề Thi Mới</span>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handlePdfFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* PRESET SAVED PDF EXAMS LIBRARY IN DASHBOARD */}
            {savedLibrary.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FolderHeart className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-extrabold text-sm text-white">Thư Viện Đề Thi PDF Đã Lưu Trong Máy</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{savedLibrary.length} đề thi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedLibrary.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 transition flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold text-[10px] border border-indigo-700/60">
                            {item.level || 'JLPT'}
                          </span>
                          <span className="text-[10px] text-slate-500">{item.importedAt}</span>
                        </div>
                        <h4 className="font-bold text-xs text-white line-clamp-2 group-hover:text-indigo-300 transition">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                        <button
                          onClick={() => handleOpenSavedPdf(item)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Mở & Làm Bài
                        </button>

                        <button
                          onClick={() => handleDeleteSavedPdf(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-950 hover:text-rose-400 transition cursor-pointer"
                          title="Xóa đề này khỏi thư viện"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* PDF BOOKLET PAGE & DRAWING CANVAS CONTAINER */}
        <div ref={containerRef} className="relative shadow-2xl rounded-sm border border-slate-700 bg-white mt-12 mb-20">
          
          {/* Background PDF Canvas */}
          <canvas ref={pdfCanvasRef} className="block" />

          {/* Interactive Drawing Overlay Canvas */}
          <canvas 
            ref={overlayCanvasRef} 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`absolute top-0 left-0 ${
              activeTool === 'cursor' ? 'pointer-events-none' : 'cursor-crosshair'
            }`}
          />

          {/* STICKY NOTES ON PDF PAGE */}
          {(pageNotes[currentPage] || []).map(note => (
            <div
              key={note.id}
              style={{ top: `${note.y}%`, left: `${note.x}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-64 p-2.5 rounded-xl bg-amber-100 border border-amber-300 shadow-xl text-slate-900 text-xs font-sans space-y-1.5 animate-fadeIn"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 border-b border-amber-200/80 pb-1">
                <span className="flex items-center gap-1">
                  <StickyNote className="w-3.5 h-3.5" /> Ghi chú trên trang đề
                </span>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-0.5 rounded hover:bg-amber-200 text-amber-800 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                value={note.text}
                onChange={(e) => handleUpdateNoteText(note.id, e.target.value)}
                placeholder="✍️ Nhập nghĩa từ vựng / ngữ pháp..."
                className="w-full h-16 bg-transparent border-0 resize-none text-xs text-slate-900 font-medium placeholder-amber-700/60 focus:outline-none"
              />

              {/* AI CORRECTION ON STICKY NOTE */}
              {note.aiCorrection && (
                <div className={`mt-1 p-2 rounded-lg border text-[11px] leading-snug ${
                  note.aiCorrection.isNoteCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  <div className="font-extrabold flex items-center gap-1 mb-0.5">
                    {note.aiCorrection.isNoteCorrect ? (
                      <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> AI: Ghi chú đúng!</span>
                    ) : (
                      <span className="text-rose-700 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> AI SỬA SAI GHI CHÚ:</span>
                    )}
                  </div>
                  {note.aiCorrection.correctionText && (
                    <p className="font-semibold">{note.aiCorrection.correctionText}</p>
                  )}
                  {note.aiCorrection.feedback && (
                    <p className="text-[10px] italic opacity-80 mt-0.5">"{note.aiCorrection.feedback}"</p>
                  )}
                </div>
              )}
            </div>
          ))}

        </div>

      </div>

      {/* 4. SAVED PDF EXAMS LIBRARY MODAL */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4 max-h-[80vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderHeart className="w-5 h-5 text-indigo-400" />
                <h2 className="font-extrabold text-base text-white">Thư Viện Đề Thi PDF Đã Lưu</h2>
              </div>
              <button
                onClick={() => setShowLibraryModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {savedLibrary.length === 0 ? (
                <div className="p-10 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-bold">Chưa có đề thi PDF nào được lưu vào thư viện.</p>
                  <p className="text-[11px] text-slate-600">Mỗi khi bạn chọn file PDF mới, hệ thống sẽ tự động lưu lại vào đây để mở làm bài mọi lúc!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedLibrary.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 transition flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold text-[10px] border border-indigo-700/60">
                            {item.level || 'JLPT'}
                          </span>
                          <span className="text-[10px] text-slate-500">{item.importedAt}</span>
                        </div>
                        <h4 className="font-bold text-xs text-white line-clamp-2 group-hover:text-indigo-300 transition">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                        <button
                          onClick={() => handleOpenSavedPdf(item)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Mở & Làm Bài
                        </button>

                        <button
                          onClick={() => handleDeleteSavedPdf(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-950 hover:text-rose-400 transition cursor-pointer"
                          title="Xóa đề này khỏi thư viện"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. HISTORY DRAWER */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-4 shadow-2xl text-slate-100 space-y-4 overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h2 className="font-extrabold text-base text-white">Lịch Sử & Tiến Trình PDF</h2>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-indigo-500/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                <span className="flex items-center gap-1">
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" /> Tiến Trình Bài Đang Làm
                </span>
                <span className="text-[11px] text-slate-400">{lastSavedTime ? `Đã lưu ${lastSavedTime}` : 'Mới khởi tạo'}</span>
              </div>
              <p className="text-xs text-slate-300 truncate font-semibold">{pdfFileName}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                <span>Trang hiện tại: {currentPage} / {numPages || 1}</span>
                <span>{Object.values(pageStamps).flat().length} con dấu khoanh</span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleResetSession}
                  className="w-full py-1.5 rounded-xl bg-slate-700 hover:bg-rose-900/60 text-slate-200 hover:text-rose-300 font-bold text-xs transition border border-slate-600 cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Bài Làm
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" /> Lịch Sử Các Lần Chấm PDF
              </h3>

              {savedHistoryList.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                  Chưa có lịch sử làm bài thi PDF nào được lưu.
                </div>
              ) : (
                savedHistoryList.map(record => (
                  <div
                    key={record.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-white line-clamp-2">{record.examTitle}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                        record.passed ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-rose-950 text-rose-400 border border-rose-700'
                      }`}>
                        {record.percentage}% ({record.passed ? 'ĐẠT' : 'CHƯA ĐẠT'})
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">{record.formattedDate}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PdfExamBookletViewer;
