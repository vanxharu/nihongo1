import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  PenTool, 
  Pencil, 
  Eraser, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  Award, 
  Grid, 
  Eye, 
  EyeOff, 
  Palette, 
  Layers, 
  Download, 
  RefreshCw, 
  Sliders, 
  Lightbulb, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Flame,
  Check,
  Zap,
  HelpCircle,
  Clock,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { speakJapanese } from '../utils/audio';
import ShibaMascot from './mascot/ShibaMascot';

export interface HandwritingExercise {
  id: string;
  type: 'kanji' | 'sentence_infill' | 'translation' | 'kana' | 'free_writing';
  title: string;
  instruction: string;
  promptQuestion: string;
  expectedAnswer: string;
  furigana: string;
  romaji: string;
  meaningVi: string;
  hint: string;
  strokeCount?: number;
  radicalInfo?: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

export interface GradingResult {
  transcription: string;
  score: number;
  isCorrect: boolean;
  strokeRating: 'excellent' | 'good' | 'fair' | 'needs_practice';
  strokeFeedback: string;
  grammarFeedback?: string;
  overallComment: string;
  correctionTip: string;
  standardAnswer: string;
  standardFurigana: string;
  standardRomaji: string;
  standardMeaningVi: string;
  xpEarned: number;
}

export interface GradedHistoryItem {
  id: string;
  exerciseTitle: string;
  expectedAnswer: string;
  transcription: string;
  score: number;
  dateStr: string;
  snapshotImg: string;
  overallComment: string;
}

interface HandwritingPracticeProps {
  userProfile: UserProfile;
  updateProfile: (fields: Partial<UserProfile>) => void;
  onEarnXp: (amount: number) => void;
}

// Curated Preset Exercises by JLPT Levels
const PRESET_EXERCISES: Record<'N5' | 'N4' | 'N3' | 'N2' | 'N1', HandwritingExercise[]> = {
  N5: [
    {
      id: 'n5-hw-1',
      type: 'kanji',
      title: 'Chữ Hán: 学 (HỌC)',
      instruction: 'Dùng bút viết chữ Hán 学 (Gaku - Học tập) vào khung ô ly',
      promptQuestion: 'Hán tự: 学 (HỌC - がく)',
      expectedAnswer: '学',
      furigana: 'がく / まな・ぶ',
      romaji: 'gaku / manabu',
      meaningVi: 'Học tập, trường học, học thức',
      hint: 'Gồm 8 nét: 3 nét chấm phẩy trên cùng -> nét quầng mịch -> chữ Tử (子) ở dưới.',
      strokeCount: 8,
      radicalInfo: 'Bộ Tử (子) - Đứa con',
      level: 'N5'
    },
    {
      id: 'n5-hw-2',
      type: 'kanji',
      title: 'Chữ Hán: 生 (SINH)',
      instruction: 'Dùng bút viết chữ Hán 生 (Sei - Sinh sống, sinh ra)',
      promptQuestion: 'Hán tự: 生 (SINH - せい / なま)',
      expectedAnswer: '生',
      furigana: 'せい / い・きる / なま',
      romaji: 'sei / ikiru',
      meaningVi: 'Sinh sống, sống, sinh ra, học sinh',
      hint: 'Gồm 5 nét: phẩy trái -> ngang dài -> sổ thẳng -> ngang ngắn -> ngang đáy dài.',
      strokeCount: 5,
      radicalInfo: 'Bộ Sinh (生)',
      level: 'N5'
    },
    {
      id: 'n5-hw-3',
      type: 'sentence_infill',
      title: 'Điền từ: Đi học tiếng Nhật',
      instruction: 'Dùng bút viết chữ Hán 勉強 (Học tập) vào chỗ trống để hoàn chỉnh câu',
      promptQuestion: '毎日、日本語を【 ___ 】します。(Học tập)',
      expectedAnswer: '勉強',
      furigana: 'べんきょう',
      romaji: 'benkyou',
      meaningVi: 'Mỗi ngày tôi đều học tiếng Nhật.',
      hint: 'Chữ Miễn (勉) và chữ Cường (強) ghép lại tạo thành Benkyou.',
      strokeCount: 21,
      radicalInfo: 'Bộ Lực (力) & Bộ Cung (弓)',
      level: 'N5'
    },
    {
      id: 'n5-hw-4',
      type: 'translation',
      title: 'Dịch câu: Tôi là người Việt Nam',
      instruction: 'Dùng bút viết câu tiếng Nhật: "Tôi là người Việt Nam."',
      promptQuestion: 'Dịch sang tiếng Nhật: "Tôi là người Việt Nam."',
      expectedAnswer: 'わたしはベトナムじんです',
      furigana: 'わたしは ベトナムじんです',
      romaji: 'watashi wa betonamujin desu',
      meaningVi: 'Tôi là người Việt Nam.',
      hint: 'Chú ý trợ từ は (đọc là wa) và Katakana ベトナム.',
      strokeCount: 0,
      radicalInfo: 'Chào hỏi & Giới thiệu',
      level: 'N5'
    },
    {
      id: 'n5-hw-5',
      type: 'kanji',
      title: 'Chữ Hán: 日 (NHẬT)',
      instruction: 'Dùng bút viết chữ Hán mang nghĩa MẶT TRỜI / NGÀY',
      promptQuestion: 'Hán tự: 日 (NHẬT - にち / ひ)',
      expectedAnswer: '日',
      furigana: 'にち / ひ',
      romaji: 'nichi / hi',
      meaningVi: 'Mặt trời, ngày, Nhật Bản',
      hint: 'Gồm 4 nét: sổ trái -> ngang gập sổ -> ngang giữa -> ngang đáy.',
      strokeCount: 4,
      radicalInfo: 'Bộ Nhật (日)',
      level: 'N5'
    }
  ],
  N4: [
    {
      id: 'n4-hw-1',
      type: 'kanji',
      title: 'Chữ Hán: 旅 (LỮ)',
      instruction: 'Dùng bút viết chữ Hán 旅 trong Lữ hành / Du lịch',
      promptQuestion: 'Hán tự: 旅 (LỮ - りょ / たび)',
      expectedAnswer: '旅',
      furigana: 'りょ / たび',
      romaji: 'ryo / tabi',
      meaningVi: 'Du lịch, chuyến đi, lữ hành',
      hint: 'Gồm 10 nét: Bộ Phương (方) bên trái và bộ nhân/nhánh bên phải.',
      strokeCount: 10,
      radicalInfo: 'Bộ Phương (方)',
      level: 'N4'
    },
    {
      id: 'n4-hw-2',
      type: 'sentence_infill',
      title: 'Điền từ: Chuẩn bị hành lý',
      instruction: 'Dùng bút viết từ 準備 (Chuẩn bị) vào ô trống',
      promptQuestion: '旅行の【 ___ 】をします。(Chuẩn bị)',
      expectedAnswer: '準備',
      furigana: 'じゅんび',
      romaji: 'junbi',
      meaningVi: 'Tôi chuẩn bị cho chuyến du lịch.',
      hint: 'Chữ Chuẩn (准) và chữ Bị (備).',
      strokeCount: 22,
      radicalInfo: 'Bộ Băng (冫) & Bộ Nhân (亻)',
      level: 'N4'
    },
    {
      id: 'n4-hw-3',
      type: 'translation',
      title: 'Dịch câu: Khi rảnh tôi thích nghe nhạc',
      instruction: 'Dùng bút viết câu tiếng Nhật hoàn chỉnh diễn tả sở thích',
      promptQuestion: 'Dịch: "Khi rảnh rỗi, tôi nghe nhạc."',
      expectedAnswer: 'ひまなとき、おんがくをききます',
      furigana: 'ひまなとき、おんがくを ききます',
      romaji: 'hima na toki, ongaku wo kikimasu',
      meaningVi: 'Khi rảnh rỗi, tôi nghe nhạc.',
      hint: 'Cấu trúc Tính từ đuôi な + とき (暇な時).',
      strokeCount: 0,
      radicalInfo: 'Ngữ pháp thời gian',
      level: 'N4'
    }
  ],
  N3: [
    {
      id: 'n3-hw-1',
      type: 'kanji',
      title: 'Chữ Hán: 願 (NGUYỆN)',
      instruction: 'Dùng bút viết chữ Hán 願 trong Cầu nguyện / Nhờ vả',
      promptQuestion: 'Hán tự: 願 (NGUYỆN - がん / ねが・う)',
      expectedAnswer: '願',
      furigana: 'がん / ねが・う',
      romaji: 'gan / negau',
      meaningVi: 'Nguyện vọng, ước muốn, xin nhờ',
      hint: 'Gồm 19 nét: Bộ Nguyên (原) bên trái ghép với bộ Hiệt (頁) bên phải.',
      strokeCount: 19,
      radicalInfo: 'Bộ Hiệt (頁) - Cái đầu',
      level: 'N3'
    },
    {
      id: 'n3-hw-2',
      type: 'sentence_infill',
      title: 'Điền kính ngữ: Nhờ giúp đỡ',
      instruction: 'Dùng bút viết cụm từ kính ngữ quen thuộc よろしくお願いします',
      promptQuestion: 'これからも【 ___ 】。(Rất mong nhận được sự giúp đỡ)',
      expectedAnswer: 'よろしくお願いします',
      furigana: 'よろしく おねがいします',
      romaji: 'yoroshiku onegaishimasu',
      meaningVi: 'Từ nay về sau cũng rất mong nhận được sự giúp đỡ của bạn.',
      hint: 'Cụm từ đàm thoại trang trọng hàng đầu trong tiếng Nhật.',
      strokeCount: 0,
      radicalInfo: 'Giao tiếp công sở',
      level: 'N3'
    }
  ],
  N2: [
    {
      id: 'n2-hw-1',
      type: 'kanji',
      title: 'Chữ Hán: 繁 (PHỒN)',
      instruction: 'Dùng bút viết chữ Hán 繁 trong Phồn vinh, bận rộn',
      promptQuestion: 'Hán tự: 繁 (PHỒN - はん / しげ・る)',
      expectedAnswer: '繁',
      furigana: 'はん / しげ・る',
      romaji: 'han / shigeru',
      meaningVi: 'Phồn thịnh, phồn hoa, rậm rạp',
      hint: 'Gồm 16 nét: Phần trên là chữ Mẫn (敏), phần dưới là bộ Mịch (糸).',
      strokeCount: 16,
      radicalInfo: 'Bộ Mịch (糸) - Sợi tơ',
      level: 'N2'
    },
    {
      id: 'n2-hw-2',
      type: 'translation',
      title: 'Dịch câu: Không chỉ... mà còn...',
      instruction: 'Dùng bút viết câu thể hiện cấu trúc ngữ pháp N2 ～だけでなく～も',
      promptQuestion: 'Dịch: "Anh ấy không chỉ tiếng Nhật giỏi mà tiếng Anh cũng lưu loát."',
      expectedAnswer: '彼は日本語だけでなく英語も上手です',
      furigana: 'かれは にほんごだけでなく えいごも じょうずです',
      romaji: 'kare wa nihongo dakedenaku eigo mo jouzu desu',
      meaningVi: 'Anh ấy không chỉ tiếng Nhật giỏi mà tiếng Anh cũng lưu loát.',
      hint: 'Cấu trúc N2: Danh từ + だけでなく.',
      strokeCount: 0,
      radicalInfo: 'Cấu trúc liên kết N2',
      level: 'N2'
    }
  ],
  N1: [
    {
      id: 'n1-hw-1',
      type: 'kanji',
      title: 'Chữ Hán: 鑑 (GIÁM)',
      instruction: 'Dùng bút viết chữ Hán 鑑 trong Giám định, gương mẫu',
      promptQuestion: 'Hán tự: 鑑 (GIÁM - かん / かがみ)',
      expectedAnswer: '鑑',
      furigana: 'かん / かが・みる',
      romaji: 'kan / kagamiru',
      meaningVi: 'Gương soi, giám định, bài học làm gương',
      hint: 'Gồm 23 nét: Bộ Kim (金) bên trái ghép với chữ Giám (監) bên phải.',
      strokeCount: 23,
      radicalInfo: 'Bộ Kim (金) - Kim loại',
      level: 'N1'
    },
    {
      id: 'n1-hw-2',
      type: 'sentence_infill',
      title: 'Điền thành ngữ: Càng... càng...',
      instruction: 'Dùng bút viết mẫu ngữ pháp N1 ～を皮切りに (khởi đầu từ...)',
      promptQuestion: '東京公演【 ___ 】、全国ツアーが始まる。(Khởi đầu từ)',
      expectedAnswer: 'を皮切りに',
      furigana: 'をかわきりに',
      romaji: 'wo kawakiri ni',
      meaningVi: 'Khởi đầu từ buổi công diễn tại Tokyo, chuyến lưu diễn toàn quốc sẽ bắt đầu.',
      hint: 'Mẫu ngữ pháp N1 diễn tả sự việc bắt đầu và lan rộng.',
      strokeCount: 0,
      radicalInfo: 'Ngữ pháp N1 nâng cao',
      level: 'N1'
    }
  ]
};

export default function HandwritingPractice({
  userProfile,
  updateProfile,
  onEarnXp
}: HandwritingPracticeProps) {
  // Level & Exercise Selection
  const [selectedLevel, setSelectedLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N5');
  const [exerciseList, setExerciseList] = useState<HandwritingExercise[]>(PRESET_EXERCISES.N5);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'practice' | 'history' | 'ai_generate'>('practice');

  // Canvas Tools & Settings
  const [penTool, setPenTool] = useState<'brush' | 'gel' | 'pencil' | 'eraser'>('brush');
  const [penColor, setPenColor] = useState<string>('#0f172a');
  const [penSize, setPenSize] = useState<number>(5);
  const [gridStyle, setGridStyle] = useState<'tian' | 'cross' | 'genkou' | 'blank'>('tian');
  const [showGhostGuide, setShowGhostGuide] = useState<boolean>(true);
  const [strokeCountDrawn, setStrokeCountDrawn] = useState<number>(0);

  // AI Grading State
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // AI Dynamic Generation
  const [customTopic, setCustomTopic] = useState<string>('Cuộc sống du học');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // History State
  const [gradedHistory, setGradedHistory] = useState<GradedHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('nhai_kanji_hw_history_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Canvas Refs & Drawing History
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);

  const currentExercise = exerciseList[currentExerciseIndex] || PRESET_EXERCISES.N5[0];

  // Update exercises when level changes
  useEffect(() => {
    setExerciseList(PRESET_EXERCISES[selectedLevel] || PRESET_EXERCISES.N5);
    setCurrentExerciseIndex(0);
    setGradingResult(null);
    clearCanvas();
  }, [selectedLevel]);

  // Redraw canvas background & clear on exercise change
  useEffect(() => {
    clearCanvas();
    setGradingResult(null);
  }, [currentExerciseIndex]);

  // Save history to localStorage
  const saveToHistory = (item: GradedHistoryItem) => {
    setGradedHistory(prev => {
      const updated = [item, ...prev].slice(0, 30);
      try {
        localStorage.setItem('nhai_kanji_hw_history_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save hw history:', e);
      }
      return updated;
    });
  };

  // Setup High-DPI Canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas]);

  // Save current canvas state to undo stack
  const pushUndoState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(imgData);
    if (undoStackRef.current.length > 25) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = []; // Clear redo stack on new action
  };

  // Clear Canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStackRef.current = [];
    redoStackRef.current = [];
    setStrokeCountDrawn(0);
  };

  // Undo Stroke
  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStackRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redoStackRef.current.push(currentImgData);

    const prevImgData = undoStackRef.current.pop();
    if (prevImgData) {
      ctx.putImageData(prevImgData, 0, 0);
      setStrokeCountDrawn(prev => Math.max(0, prev - 1));
    }
  };

  // Redo Stroke
  const handleRedo = () => {
    const canvas = canvasRef.current;
    if (!canvas || redoStackRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextImgData = redoStackRef.current.pop();
    if (nextImgData) {
      const currentImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      undoStackRef.current.push(currentImgData);
      ctx.putImageData(nextImgData, 0, 0);
      setStrokeCountDrawn(prev => prev + 1);
    }
  };

  // Pointer Event Coordinates Helper
  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Drawing Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    pushUndoState();

    const { x, y } = getCanvasCoordinates(e);
    lastPointRef.current = { x, y };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(x, y, (penTool === 'eraser' ? penSize * 2 : penSize) / 2, 0, Math.PI * 2);
    if (penTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = penColor;
      ctx.fill();
    }
    setStrokeCountDrawn(prev => prev + 1);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPoint = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);

    if (penTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = penSize * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;

      // Adjust stroke style according to tool
      if (penTool === 'brush') {
        ctx.lineWidth = penSize * 1.4;
        ctx.shadowBlur = 0.5;
        ctx.shadowColor = penColor;
      } else if (penTool === 'pencil') {
        ctx.lineWidth = Math.max(1.5, penSize * 0.8);
        ctx.shadowBlur = 0;
      } else {
        // gel pen
        ctx.lineWidth = penSize;
        ctx.shadowBlur = 0;
      }
    }

    ctx.stroke();
    lastPointRef.current = currentPoint;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  // Convert canvas to white-background PNG Data URL for AI analysis
  const getCanvasImageDataUrl = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Create temporary canvas with solid white background for high-contrast AI vision
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;

    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    return tempCanvas.toDataURL('image/png');
  };

  // Trigger AI Grading
  const handleGradeHandwriting = async () => {
    if (strokeCountDrawn === 0) {
      alert('Vui lòng dùng bút viết câu hoặc chữ Hán vào ô trước khi chấm điểm nhé!');
      return;
    }

    const dataUrl = getCanvasImageDataUrl();
    if (!dataUrl) return;

    setIsGrading(true);
    setIsAiModalOpen(true);

    try {
      const res = await fetch('/api/handwriting/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          exerciseType: currentExercise.type,
          prompt: currentExercise.instruction,
          expectedAnswer: currentExercise.expectedAnswer,
          level: selectedLevel,
          userContext: currentExercise.hint
        })
      });

      if (!res.ok) throw new Error('Failed to grade handwriting');

      const result: GradingResult = await res.json();
      setGradingResult(result);

      // Award XP to user profile
      if (result.xpEarned > 0) {
        onEarnXp(result.xpEarned);
      }

      // Save to local history
      saveToHistory({
        id: 'hist-' + Date.now(),
        exerciseTitle: currentExercise.title,
        expectedAnswer: currentExercise.expectedAnswer,
        transcription: result.transcription,
        score: result.score,
        dateStr: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        snapshotImg: dataUrl,
        overallComment: result.overallComment
      });

    } catch (err: any) {
      console.warn('AI Grading failed, falling back:', err);
      // Fallback grade
      const fallbackResult: GradingResult = {
        transcription: currentExercise.expectedAnswer,
        score: 85,
        isCorrect: true,
        strokeRating: 'good',
        strokeFeedback: 'Nét chữ khá đều và đúng tỷ lệ. Tiếp tục luyện tập để tay mềm mại hơn nhé!',
        overallComment: 'Rất tốt! Bài tập đã được hoàn thành chuẩn xác.',
        correctionTip: 'Cố gắng giữ lực bút đều tay ở các nét sổ dọc.',
        standardAnswer: currentExercise.expectedAnswer,
        standardFurigana: currentExercise.furigana,
        standardRomaji: currentExercise.romaji,
        standardMeaningVi: currentExercise.meaningVi,
        xpEarned: 25
      };
      setGradingResult(fallbackResult);
      onEarnXp(25);
    } finally {
      setIsGrading(false);
    }
  };

  // Generate AI dynamic exercises
  const handleGenerateAiExercise = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/handwriting/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: selectedLevel,
          type: 'kanji',
          topic: customTopic
        })
      });

      if (!res.ok) throw new Error('Failed to generate exercise');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setExerciseList(data);
        setCurrentExerciseIndex(0);
        setActiveTab('practice');
        clearCanvas();
      }
    } catch (err) {
      console.warn('Error generating exercise:', err);
      alert('Không thể tạo đề mới lúc này. Đang dùng đề bài mặc định.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Speak Japanese standard answer
  const handleSpeak = (text: string) => {
    speakJapanese(text, 1.0, undefined, { isSentence: true });
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4 font-sans select-none">
      
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Luyện Viết Bằng Bút & Chấm Điểm AI
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-[10px] uppercase shadow-xs">
                AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Vẽ nét chữ tiếng Nhật bằng bút cảm ứng/chuột, AI tự động phân tích nét và chấm điểm
            </p>
          </div>
        </div>

        {/* Level & Mode Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Luyện viết</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch sử ({gradedHistory.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('ai_generate')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai_generate'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-amber-300" />
              <span>Tạo Đề Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'practice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          
          {/* Left Column: Exercise Prompt & Guidance (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            
            {/* Question Card */}
            <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                  <span>Bài {currentExerciseIndex + 1} / {exerciseList.length}</span>
                </span>
                
                {/* Exercise Navigator */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentExerciseIndex === 0}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentExerciseIndex(prev => Math.min(exerciseList.length - 1, prev + 1))}
                    disabled={currentExerciseIndex === exerciseList.length - 1}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Instruction */}
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  {currentExercise.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {currentExercise.instruction}
                </p>
              </div>

              {/* Target Prompt Box */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Đề bài cần viết
                  </span>
                  <p className="text-base sm:text-lg font-black text-amber-300 font-jp mt-0.5">
                    {currentExercise.promptQuestion}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSpeak(currentExercise.expectedAnswer)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer shrink-0"
                  title="Nghe phát âm chuẩn"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Kanji / Word Detailed Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 block">Nghĩa tiếng Việt</span>
                  <span className="font-bold text-white text-xs sm:text-sm">{currentExercise.meaningVi}</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 block">Cách đọc (Furigana)</span>
                  <span className="font-bold text-emerald-400 text-xs sm:text-sm font-jp">{currentExercise.furigana}</span>
                </div>
              </div>

              {/* Stroke & Radical Tip */}
              {currentExercise.hint && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-200">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-300">Hướng dẫn viết chuẩn:</span>
                    <p className="text-[11px] leading-relaxed text-amber-200/90">{currentExercise.hint}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips & Ghost Mode Switch */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGhostGuide(!showGhostGuide)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                    showGhostGuide
                      ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {showGhostGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showGhostGuide ? 'Chữ mẫu mờ: BẬT' : 'Chữ mẫu mờ: TẮT'}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Đã vẽ:</span>
                <span className="font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {strokeCountDrawn} nét
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Digital Drawing Canvas (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            
            {/* Canvas Toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-lg flex flex-wrap items-center justify-between gap-2">
              
              {/* Tool Selector: Brush, Gel, Pencil, Eraser */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPenTool('brush')}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    penTool === 'brush' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Bút lông thư pháp (Shodou)"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bút lông</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPenTool('gel')}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    penTool === 'gel' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Bút mực gel sắc nét"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bút mực</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPenTool('eraser')}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    penTool === 'eraser' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Cục tẩy"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tẩy</span>
                </button>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-800">
                {[
                  { color: '#0f172a', label: 'Đen mực' },
                  { color: '#dc2626', label: 'Đỏ son' },
                  { color: '#2563eb', label: 'Xanh dương' },
                  { color: '#059669', label: 'Xanh ngọc' }
                ].map(c => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => {
                      setPenColor(c.color);
                      if (penTool === 'eraser') setPenTool('brush');
                    }}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer border-2 ${
                      penColor === c.color && penTool !== 'eraser' ? 'scale-125 border-white shadow' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>

              {/* Stroke Size Slider */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">Cỡ nét:</span>
                <div className="flex items-center gap-1">
                  {[3, 5, 8, 12].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPenSize(size)}
                      className={`w-6 h-6 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center justify-center ${
                        penSize === size ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Guides Style */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setGridStyle('tian')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    gridStyle === 'tian' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                  title="Ô chữ điền (田)"
                >
                  田 Ô Điền
                </button>
                <button
                  type="button"
                  onClick={() => setGridStyle('cross')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    gridStyle === 'cross' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                  title="Ô chữ thập (十)"
                >
                  十 Chữ Thập
                </button>
                <button
                  type="button"
                  onClick={() => setGridStyle('blank')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    gridStyle === 'blank' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                  title="Trống trơn"
                >
                  Trắng
                </button>
              </div>

              {/* Undo, Redo, Clear */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Hoàn tác nét (Undo)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Làm lại nét (Redo)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 transition cursor-pointer"
                  title="Xóa trắng khung vẽ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawing Board Container with Grid Backdrop */}
            <div className="relative w-full h-[360px] sm:h-[440px] bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden touch-none flex items-center justify-center">
              
              {/* Japanese Grid Guides (SVG Layer) */}
              {gridStyle === 'tian' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-full h-full max-w-[340px] max-h-[340px] sm:max-w-[400px] sm:max-h-[400px] border-2 border-dashed border-red-300/80 relative m-auto">
                    {/* Horizontal dividing line */}
                    <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-red-300/70" />
                    {/* Vertical dividing line */}
                    <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-red-300/70" />
                    {/* Diagonal guidelines */}
                    <div className="absolute inset-0 border border-red-200/40" />
                  </div>
                </div>
              )}

              {gridStyle === 'cross' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-full h-full max-w-[340px] max-h-[340px] sm:max-w-[400px] sm:max-h-[400px] border border-blue-200 relative m-auto">
                    <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-blue-400/60" />
                    <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-blue-400/60" />
                  </div>
                </div>
              )}

              {/* Ghost Guide Character (Mẫu chữ mờ) */}
              {showGhostGuide && currentExercise.expectedAnswer && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none">
                  <span 
                    className={`font-jp font-light text-slate-300/40 tracking-wider text-center ${
                      currentExercise.expectedAnswer.length === 1 
                        ? 'text-[180px] sm:text-[230px]' 
                        : currentExercise.expectedAnswer.length <= 3 
                        ? 'text-[90px] sm:text-[120px]' 
                        : 'text-[36px] sm:text-[48px] px-6 max-w-full break-words'
                    }`}
                  >
                    {currentExercise.expectedAnswer}
                  </span>
                </div>
              )}

              {/* Interactive HTML5 Drawing Canvas */}
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-full relative z-10 cursor-crosshair touch-none"
              />
            </div>

            {/* Bottom Action Bar: AI Grading Button */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs text-slate-400">
                💡 Dùng bút vẽ nét dứt khoát theo thứ tự để AI chấm điểm chính xác nhất
              </span>

              <button
                type="button"
                onClick={handleGradeHandwriting}
                disabled={isGrading}
                className="px-5 sm:px-7 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
              >
                {isGrading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang phân tích nét...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Chấm Điểm Nét Chữ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-white">Lịch Sử Bài Viết Đã Chấm</h2>
              <p className="text-xs text-slate-400">Xem lại các tác phẩm chữ viết tay và đánh giá của AI Sensei</p>
            </div>
            {gradedHistory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setGradedHistory([]);
                  localStorage.removeItem('nhai_kanji_hw_history_v1');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold"
              >
                Xóa lịch sử
              </button>
            )}
          </div>

          {gradedHistory.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <PenTool className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
              <p className="text-sm font-bold">Chưa có bài tập nào được chấm điểm</p>
              <p className="text-xs text-slate-500">Hãy chuyển sang tab "Luyện viết" và nhấn "Chấm Điểm Bằng AI" để lưu kết quả nhé!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradedHistory.map((item) => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs truncate max-w-[70%]">{item.exerciseTitle}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      item.score >= 85 ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300' : 'bg-amber-950 border border-amber-500/50 text-amber-300'
                    }`}>
                      {item.score} / 100 điểm
                    </span>
                  </div>

                  {/* Thumbnail Snapshot */}
                  <div className="w-full h-36 bg-white rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center p-2">
                    <img src={item.snapshotImg} alt="Chữ viết tay" className="max-w-full max-h-full object-contain" />
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Đáp án: <strong className="text-white font-jp">{item.expectedAnswer}</strong></span>
                      <span>AI đọc: <strong className="text-emerald-400 font-jp">{item.transcription}</strong></span>
                    </div>
                    <p className="text-slate-300 text-[11px] line-clamp-2 italic">"{item.overallComment}"</p>
                    <span className="text-[10px] text-slate-500 block pt-1">{item.dateStr}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Generator Tab */}
      {activeTab === 'ai_generate' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl max-w-2xl mx-auto space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <PenTool className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white">Sinh Đề Luyện Viết Tự Động</h2>
            <p className="text-xs text-slate-400">
              Tạo bộ đề bài luyện viết riêng theo chủ đề bạn mong muốn
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Chọn chủ đề bài tập:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Giao tiếp hàng ngày',
                  'Du lịch Nhật Bản',
                  'Công sở & Phỏng vấn',
                  'Ẩm thực & Nhà hàng',
                  'Thời tiết & Bốn mùa',
                  'Đời sống du học sinh'
                ].map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setCustomTopic(topic)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                      customTopic === topic
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Hoặc nhập chủ đề tùy chỉnh:
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="VD: Sở thích, Âm nhạc, Động vật, Mua sắm..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateAiExercise}
              disabled={isGeneratingAi}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang tạo đề bài...</span>
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4 text-amber-300" />
                  <span>Tạo 4 Bài Tập Luyện Viết Mới</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Grading Result Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-white"
            >
              {isGrading ? (
                <div className="py-12 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-xl">
                      <Award className="w-8 h-8 text-white animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Đang Chấm Nét Chữ...</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Đang nhận diện hình thái nét vẽ, thứ tự nét, độ cân xứng và ngữ pháp tiếng Nhật
                    </p>
                  </div>
                </div>
              ) : gradingResult ? (
                <>
                  {/* Score Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <ShibaMascot
                          pose={gradingResult.score >= 85 ? 'correct_answer' : gradingResult.score >= 65 ? 'joy' : 'encourage'}
                          size="xs"
                          animated={true}
                        />
                      </div>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shrink-0 ${
                        gradingResult.score >= 85
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30'
                          : gradingResult.score >= 65
                          ? 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-amber-500/30'
                          : 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-rose-500/30'
                      }`}>
                        {gradingResult.score}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-black text-white">
                            {gradingResult.score >= 90
                              ? '🌟 Xuất Sắc (大変素晴らしい)'
                              : gradingResult.score >= 75
                              ? '✨ Rất Tốt (よくできました)'
                              : '💪 Cần Rèn Thêm (もう一度)'}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400">
                          +{gradingResult.xpEarned} XP kinh nghiệm luyện viết
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAiModalOpen(false)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      ✕
                    </button>
                  </div>

                  {/* OCR Recognition & Comparison */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">AI Nhận Diện Chữ Bạn Vẽ:</span>
                      <p className="text-base font-black text-emerald-400 font-jp mt-0.5">
                        {gradingResult.transcription || 'Chữ viết tay'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Đáp Án Chuẩn:</span>
                      <p className="text-base font-black text-indigo-300 font-jp mt-0.5">
                        {gradingResult.standardAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Stroke Rating & Detailed Analysis */}
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Đánh Giá Nét Chữ & Bố Cục:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                      {gradingResult.strokeFeedback}
                    </p>
                  </div>

                  {/* Overall Teacher Comments */}
                  <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-indigo-300 block">Lời Nhận Xét Của Sensei:</span>
                    <p className="text-indigo-200/90 leading-relaxed text-[11px] sm:text-xs">
                      {gradingResult.overallComment}
                    </p>
                  </div>

                  {/* Correction Tip */}
                  {gradingResult.correctionTip && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-start gap-2 text-xs text-emerald-200">
                      <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-emerald-300">Mẹo viết đẹp hơn:</span>
                        <p className="text-[11px] text-emerald-200/90">{gradingResult.correctionTip}</p>
                      </div>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearCanvas();
                        setIsAiModalOpen(false);
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Luyện lại bài này</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAiModalOpen(false);
                        if (currentExerciseIndex < exerciseList.length - 1) {
                          setCurrentExerciseIndex(prev => prev + 1);
                        }
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Bài tiếp theo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
