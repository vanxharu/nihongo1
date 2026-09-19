/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateSRS } from '../utils/srs';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Layers, 
  CheckCircle, 
  RefreshCw, 
  PenTool, 
  Sparkles, 
  Volume2,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  Play,
  RotateCcw,
  Edit3,
  X,
  Printer,
  Grid,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KanjiItem, UserProfile, JLPTLevel } from '../types';
import { KANJI_DATA } from '../data';
import { useAuth } from '../contexts/AuthContext';
import PitchAccentDisplay from './PitchAccentDisplay';
import { playCorrectSound, playIncorrectSound } from '../utils/audio';
import KanjiWorksheetModal from './KanjiWorksheetModal';
import { getKanjiCategory } from '../utils/kanjiHelper';
import { getKanjiAssociativeColor } from '../utils/associativeColorHelper';
import { KANJI_DICTIONARY } from '../data/kanjiDictionary';
import { safeFetchJson } from '../utils/safeApi';
import JapaneseFuriganaText, { SelectiveFuriganaWord } from './JapaneseFuriganaText';
import { KanjiAiMnemonicCard } from './KanjiAiMnemonicCard';

interface KanjiExplorerProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onEarnXp: (amount: number) => void;
}

export default function KanjiExplorer({ userProfile, updateProfile, onEarnXp }: KanjiExplorerProps) {
  const { token, user } = useAuth();
  const [dbKanjis, setDbKanjis] = useState<KanjiItem[]>(KANJI_DATA);
  const [loading, setLoading] = useState(false);

  // Edit Kanji Modal State
  const [editingKanji, setEditingKanji] = useState<KanjiItem | null>(null);
  const [editMeaning, setEditMeaning] = useState('');
  const [editOnyomi, setEditOnyomi] = useState('');
  const [editKunyomi, setEditKunyomi] = useState('');
  const [editStrokes, setEditStrokes] = useState(8);
  const [editExamples, setEditExamples] = useState<any[]>([
    { word: '', hiragana: '', meaning: '' },
    { word: '', hiragana: '', meaning: '' },
    { word: '', hiragana: '', meaning: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false); const [editMnemonic, setEditMnemonic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [editExampleSentence, setEditExampleSentence] = useState('');
  const [editExampleTranslation, setEditExampleTranslation] = useState('');

  const handleAiAutoFill = async () => {
    if (!editingKanji || !token) return;
    setAiLoading(true);
    try {
      const response = await fetch('/api/admin/kanjis/ai-fill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ character: editingKanji.character })
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          const d = resData.data;
          setEditMeaning(d.meaningVi || '');
          setEditStrokes(d.strokesCount || 8); setEditMnemonic(d.mnemonic || '');
          setEditOnyomi(d.onyomi || '');
          setEditKunyomi(d.kunyomi || '');
          setEditExampleSentence(d.exampleSentence || '');
          setEditExampleTranslation(d.exampleTranslation || '');
          
          const exList = [...(d.exampleWords || [])];
          while (exList.length < 3) {
            exList.push({ word: '', hiragana: '', meaning: '' });
          }
          setEditExamples(exList.slice(0, 3));
        } else {
          alert('Không thể tự động điền bằng AI: ' + (resData.error || 'Lỗi không xác định'));
        }
      } else {
        alert('Yêu cầu tự động điền thất bại. Bạn cần có quyền Admin!');
      }
    } catch (err: any) {
      console.error(err);
      alert('Có lỗi mạng xảy ra khi kết nối với AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenEditKanji = (kanji: KanjiItem) => {
    setEditingKanji(kanji);
    setEditMeaning(kanji.meaning);
    setEditOnyomi(kanji.onyomi);
    setEditKunyomi(kanji.kunyomi);
    setEditStrokes(kanji.strokesCount); setEditMnemonic(kanji.mnemonic || '');
    setEditExampleSentence(kanji.exampleSentence || '');
    setEditExampleTranslation(kanji.exampleTranslation || '');
    
    // Fill with current examples, pad to 3 elements if needed
    const currentExamples = [...kanji.exampleWords];
    while (currentExamples.length < 3) {
      currentExamples.push({ word: '', hiragana: '', meaning: '' });
    }
    setEditExamples(currentExamples.slice(0, 3));
  };

  const handleEditKanjiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKanji || !token) return;

    setIsSaving(true);
    const rawId = parseInt(editingKanji.id.replace('k_', ''));

    try {
      const response = await fetch('/api/admin/kanjis/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: rawId,
          meaningVi: editMeaning,
          onyomi: editOnyomi,
          kunyomi: editKunyomi,
          strokesCount: editStrokes,
          mnemonic: editMnemonic,
          exampleWords: editExamples.filter(ex => ex.word.trim() !== ''),
          exampleSentence: editExampleSentence,
          exampleTranslation: editExampleTranslation
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state instantly
          setDbKanjis(prev => prev.map(k => {
            if (k.id === editingKanji.id) {
              return {
                ...k,
                meaning: editMeaning,
                onyomi: editOnyomi,
                kunyomi: editKunyomi,
                strokesCount: editStrokes, mnemonic: editMnemonic,
                exampleWords: editExamples.filter(ex => ex.word.trim() !== ''),
                exampleSentence: editExampleSentence,
                exampleTranslation: editExampleTranslation
              };
            }
            return k;
          }));
          setEditingKanji(null);
          alert('Cập nhật thông tin chữ Hán tự thành công!');
        } else {
          alert('Có lỗi xảy ra: ' + (data.error || 'Lỗi không xác định.'));
        }
      } else {
        alert('Lỗi cập nhật. Bạn phải đăng nhập quyền Admin!');
      }
    } catch (err: any) {
      console.error(err);
      alert('Lỗi kết nối mạng: không thể gửi yêu cầu.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    safeFetchJson<any[]>('/api/kanjis')
      .then(result => {
        if (!isMounted) return;
        const data = result.data;
        if (!data || data.length === 0) return;
        const mapped = data.map(k => {
          const level = k.level || (k.lesson <= 25 ? 'N5' : k.lesson <= 50 ? 'N4' : k.lesson === 51 ? 'N3' : k.lesson === 52 ? 'N2' : 'N1');
          
          let strokesCount = 8;
          let exampleWords: any[] = [];
          let mnemonic = '';
          let exampleSentence = '';
          let exampleTranslation = '';

          const localMatch = KANJI_DATA.find(ld => ld.character === k.kanji);
          if (localMatch) {
            strokesCount = localMatch.strokesCount;
            exampleWords = localMatch.exampleWords;
            mnemonic = localMatch.mnemonic || '';
            exampleSentence = localMatch.exampleSentence || '';
            exampleTranslation = localMatch.exampleTranslation || '';
          }
          
          if (k.examples) {
            try {
              const parsed = JSON.parse(k.examples);
              if (parsed.strokesCount !== undefined) strokesCount = parsed.strokesCount;
              if (parsed.exampleWords !== undefined) exampleWords = parsed.exampleWords;
              if (parsed.mnemonic !== undefined) mnemonic = parsed.mnemonic;
              if (parsed.exampleSentence !== undefined) exampleSentence = parsed.exampleSentence;
              if (parsed.exampleTranslation !== undefined) exampleTranslation = parsed.exampleTranslation;
            } catch (e) {
              // fallback
            }
          }
          
          return {
            id: 'k_' + k.id,
            character: k.kanji,
            meaning: k.meaningVi,
            onyomi: k.onyomi || 'Chưa cập nhật',
            kunyomi: k.kunyomi || 'Chưa cập nhật',
            strokesCount: strokesCount,
            level: level,
            exampleWords: exampleWords,
            mnemonic: mnemonic,
            exampleSentence: exampleSentence,
            exampleTranslation: exampleTranslation
          };
        });
        setDbKanjis(mapped);
        setLoading(false);
      })
      .catch(err => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [showSrsOnly, setShowSrsOnly] = useState(false);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  
  const filteredKanji = useMemo(() => {
    const now = new Date();
    return dbKanjis.filter(k => {
      if (k.level !== userProfile.targetLevel) return false;
      if (showSrsOnly) {
        const s = userProfile.kanjiStatus[k.id] as any;
        if (s && typeof s === 'object' && s.nextReviewDate) {
          return new Date(s.nextReviewDate) <= now;
        }
        return false;
      }
      return true;
    });
  }, [dbKanjis, userProfile.targetLevel, showSrsOnly, userProfile.kanjiStatus]);
  
  const srsCount = useMemo(() => {
    const now = new Date();
    return dbKanjis.filter(k => {
      if (k.level !== userProfile.targetLevel) return false;
      const s = userProfile.kanjiStatus[k.id] as any;
      if (s && typeof s === 'object' && s.nextReviewDate) {
        return new Date(s.nextReviewDate) <= now;
      }
      return false;
    }).length;
  }, [dbKanjis, userProfile.targetLevel, userProfile.kanjiStatus]);

  const [selectedKanjiIndex, setSelectedKanjiIndex] = useState(0);

  // Sync index when targetLevel changes from Settings / Profile
  const prevKanjiTargetRef = useRef(userProfile.targetLevel);
  useEffect(() => {
    if (prevKanjiTargetRef.current !== userProfile.targetLevel) {
      prevKanjiTargetRef.current = userProfile.targetLevel;
      setSelectedKanjiIndex(0);
      setShowFlashcardAnswer(false);
    }
  }, [userProfile.targetLevel]);

  // Restore saved lastPosition when tab mounts (authenticated users only)
  const isKanjiRestoredRef = useRef(false);

  useEffect(() => {
    if (!isKanjiRestoredRef.current) {
      if (user && userProfile.lastPosition && userProfile.lastPosition.tab === 'kanji') {
        const pos = userProfile.lastPosition;
        if (pos.itemIndex !== undefined && pos.itemIndex >= 0) {
          setSelectedKanjiIndex(pos.itemIndex);
        }
      }
      isKanjiRestoredRef.current = true;
    }
  }, [userProfile.lastPosition, user]);

  // Sync position on changes (authenticated users only)
  useEffect(() => {
    if (!user || !isKanjiRestoredRef.current) return;
    if (filteredKanji.length > 0) {
      const current = filteredKanji[selectedKanjiIndex];
      updateProfile({
        lastPosition: {
          tab: 'kanji',
          level: userProfile.targetLevel,
          itemId: current?.character,
          itemIndex: selectedKanjiIndex,
          lessonName: current ? `Chữ Hán: ${current.character} (${current.meaning})` : 'Hán tự',
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [selectedKanjiIndex, userProfile.targetLevel, user]);
  
  // Learning states

  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  // Drawing Pad Canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHasContent, setCanvasHasContent] = useState(false);

  // Resolve current active item index
  const getActiveKanjiIndex = () => {
    if (isShuffle && shuffledIndices.length === filteredKanji.length) {
      const idx = shuffledIndices[selectedKanjiIndex];
      // Safely clamp/fallback
      return idx !== undefined ? idx : 0;
    }
    return selectedKanjiIndex;
  };
  const activeKanjiIndex = getActiveKanjiIndex();
  const currentKanji = filteredKanji[activeKanjiIndex] as KanjiItem | undefined;

  // Shuffle logic
  useEffect(() => {
    if (isShuffle && filteredKanji.length > 0) {
      const indices = Array.from({ length: filteredKanji.length }, (_, i) => i);
      const shuffled = indices.sort(() => Math.random() - 0.5);
      setShuffledIndices(shuffled);
      setSelectedKanjiIndex(0);
      setShowFlashcardAnswer(false);
    } else {
      setShuffledIndices([]);
    }
  }, [isShuffle, userProfile.targetLevel]);

  // Autoplay logic
  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      if (!showFlashcardAnswer) {
        setShowFlashcardAnswer(true);
        if (currentKanji) handleSpeak(currentKanji.character);
      } else {
        handleNext();
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoplay, showFlashcardAnswer, selectedKanjiIndex, userProfile.targetLevel]);

  // Setup drawing context
  useEffect(() => {

    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas when Kanji changes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasHasContent(false);
    
    // Line style
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [selectedKanjiIndex, userProfile.targetLevel]);

  // Navigation functions
  const handleNext = () => {
    if (selectedKanjiIndex < filteredKanji.length - 1) {
      setSelectedKanjiIndex(prev => prev + 1);
      setShowFlashcardAnswer(false);
    } else {
      alert(`🎉 Hoàn thành ôn tập toàn bộ Kanji trình độ ${userProfile.targetLevel}! Nhận +30 XP.`);
      onEarnXp(30);
      setSelectedKanjiIndex(0);
      setShowFlashcardAnswer(false);
    }
  };

  const handlePrev = () => {
    if (selectedKanjiIndex > 0) {
      setSelectedKanjiIndex(prev => prev - 1);
      setShowFlashcardAnswer(false);
    }
  };

  // Kanji Marking handler for Flashcards
  const handleKanjiMark = (mastered: boolean) => {
    const kanji = currentKanji;
    if (!kanji) return;
    const status = { ...userProfile.kanjiStatus };
    const oldStatus = typeof status[kanji.id] === 'object' ? (status[kanji.id] as any) : null;
    status[kanji.id] = calculateSRS(oldStatus, mastered ? 5 : 2) as any;
    updateProfile({ kanjiStatus: status });
    if (mastered) {
      playCorrectSound();
      onEarnXp(15);
    } else {
      playIncorrectSound();
    }
    handleNext();
  };

  // State ref for stable keydown listener
  const kanjiStateRef = useRef({
    currentKanji,
    selectedKanjiIndex,
    filteredKanji,
    showFlashcardAnswer
  });

  kanjiStateRef.current = {
    currentKanji,
    selectedKanjiIndex,
    filteredKanji,
    showFlashcardAnswer
  };

  // Keyboard shortcut listener for Kanji flashcards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { currentKanji: kItem } = kanjiStateRef.current;

      const activeEl = document.activeElement as HTMLElement | null;
      const isTyping = !!(
        activeEl && 
        activeEl !== document.body && 
        activeEl !== document.documentElement &&
        (
          (activeEl.tagName === 'INPUT' && (activeEl as HTMLInputElement).type !== 'button' && (activeEl as HTMLInputElement).type !== 'checkbox' && (activeEl as HTMLInputElement).type !== 'radio') || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.isContentEditable
        )
      );
      if (isTyping) return;

      const key = e.key || '';
      const keyLow = key.toLowerCase();
      const code = e.code || '';
      const keyCode = e.keyCode || e.which || 0;

      const isSpace = key === ' ' || keyLow === 'spacebar' || keyLow === 'space' || code === 'Space' || keyCode === 32 || e.which === 32;
      const isEnter = keyLow === 'enter' || code === 'Enter' || code === 'NumpadEnter' || keyCode === 13;
      const isZ = keyLow === 'z' || code === 'KeyZ' || keyCode === 90;
      const isX = keyLow === 'x' || code === 'KeyX' || keyCode === 88;
      const is1 = key === '1' || code === 'Digit1' || code === 'Numpad1' || keyCode === 49 || keyCode === 97;
      const is2 = key === '2' || code === 'Digit2' || code === 'Numpad2' || keyCode === 50 || keyCode === 98;
      const isRight = keyLow === 'arrowright' || code === 'ArrowRight' || keyCode === 39;
      const isLeft = keyLow === 'arrowleft' || code === 'ArrowLeft' || keyCode === 37;
      const isUp = keyLow === 'arrowup' || code === 'ArrowUp' || keyCode === 38;
      const isDown = keyLow === 'arrowdown' || code === 'ArrowDown' || keyCode === 40;
      const isF = keyLow === 'f' || code === 'KeyF' || keyCode === 70;
      const isA = keyLow === 'a' || code === 'KeyA' || keyCode === 65;
      const isD = keyLow === 'd' || code === 'KeyD' || keyCode === 68;
      const isR = keyLow === 'r' || code === 'KeyR' || keyCode === 82;
      const isS = keyLow === 's' || code === 'KeyS' || keyCode === 83;

      if (e.repeat) {
        if (isSpace || isF || isUp || isDown || isZ || isX || is1 || is2) {
          e.preventDefault();
        }
        return;
      }

      // Blur focused button or interactive element
      if (activeEl && (activeEl.tagName === 'BUTTON' || activeEl.tagName === 'A' || activeEl.getAttribute('role') === 'button')) {
        activeEl.blur();
      }

      // Space / F / Up / Down: Toggle flip front <-> back
      if (isSpace || isF || isUp || isDown) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        setShowFlashcardAnswer(prev => !prev);
        return;
      }

      // Enter / ArrowRight: Next card
      if (isRight || isEnter) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        handleNext();
        return;
      }

      // ArrowLeft / A: Previous card
      if (isLeft || isA) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        handlePrev();
        return;
      }

      // Z / 1: Mastered (Đã thuộc)
      if (isZ || is1) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        handleKanjiMark(true);
        return;
      }

      // X / 2: Not Mastered (Chưa nhớ)
      if (isX || is2) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        handleKanjiMark(false);
        return;
      }

      // R / S: Speak kanji
      if (isR || isS) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        if (kItem) {
          handleSpeak(kItem.character);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  // Handle standard drawing movements
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setCanvasHasContent(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setCanvasHasContent(false);
  };

  const checkDrawingSimilarity = (): { score: number; feedback: string; passed: boolean } => {
    if (!canvasRef.current || !currentKanji) {
      return { score: 0, feedback: "Không có dữ liệu nét vẽ hoặc chữ Hán.", passed: false };
    }

    if (!canvasHasContent) {
      return { score: 0, feedback: "Vui lòng vẽ nét chữ Hán trước khi kiểm tra!", passed: false };
    }
    
    const userCanvas = canvasRef.current;
    const userCtx = userCanvas.getContext('2d');
    if (!userCtx) {
      return { score: 0, feedback: "Không thể khởi tạo bộ lọc hình ảnh.", passed: false };
    }

    // Create an offscreen canvas of the exact same dimensions to render the reference Kanji
    const refCanvas = document.createElement('canvas');
    refCanvas.width = userCanvas.width;
    refCanvas.height = userCanvas.height;
    const refCtx = refCanvas.getContext('2d');
    if (!refCtx) {
      return { score: 0, feedback: "Không thể tạo mẫu đối chiếu.", passed: false };
    }

    // Render the target Kanji character in the center of the refCanvas
    refCtx.fillStyle = '#000000';
    refCtx.font = 'bold 150px "Plus Jakarta Sans", "Outfit", sans-serif';
    refCtx.textAlign = 'center';
    refCtx.textBaseline = 'middle';
    refCtx.fillText(currentKanji.character, refCanvas.width / 2, refCanvas.height / 2);

    // Get image data from both
    const userImgData = userCtx.getImageData(0, 0, userCanvas.width, userCanvas.height);
    const refImgData = refCtx.getImageData(0, 0, refCanvas.width, refCanvas.height);

    const uData = userImgData.data;
    const rData = refImgData.data;

    let intersectionCount = 0;
    let userTotalCount = 0;
    let refTotalCount = 0;

    // Scan precisely
    for (let i = 0; i < uData.length; i += 4) {
      const userAlpha = uData[i + 3];
      const refAlpha = rData[i + 3];

      const hasUser = userAlpha > 20;
      const hasRef = refAlpha > 20;

      if (hasUser) userTotalCount++;
      if (hasRef) refTotalCount++;
      if (hasUser && hasRef) intersectionCount++;
    }

    // Enforce a minimum of drawn content to count as an attempt (approx 200 pixels)
    if (userTotalCount < 200) {
      return { score: 0, feedback: "Nét viết quá ngắn hoặc chưa rõ ràng. Hãy tô vẽ nét chữ to rõ hơn nhé!", passed: false };
    }

    // Accuracy: how many pixels user drew are actually inside the target template bounds
    const accuracy = userTotalCount > 0 ? (intersectionCount / userTotalCount) * 100 : 0;
    
    // Coverage: how much of the target template has been covered/colored by the user
    const coverage = refTotalCount > 0 ? (intersectionCount / refTotalCount) * 100 : 0;

    // A balanced score: higher weight on accuracy, and capped/scaled coverage
    const score = Math.round((accuracy * 0.7) + (Math.min(coverage * 2.5, 100) * 0.3));

    // Threshold: they should have at least 40% accuracy and at least 12% coverage (meaning they actually trace the shape decently)
    const passed = accuracy >= 40 && coverage >= 12;

    let feedback = '';
    if (passed) {
      if (score >= 75) {
        feedback = `🎉 Nét vẽ rất chính xác (Độ khớp ${score}%)! Từng nét viết cân đối, chuẩn hình dáng chữ mẫu "${currentKanji.character}". Bạn làm tốt lắm!`;
      } else {
        feedback = `✨ Đạt yêu cầu (Độ khớp ${score}%)! Nét viết cơ bản đúng vị trí và hình dạng chữ mẫu "${currentKanji.character}". Tiếp tục luyện tập nhé!`;
      }
    } else {
      if (accuracy < 40) {
        feedback = `❌ Nét vẽ chưa khớp (Độ khớp ${score}%). Bạn vẽ lệch ra ngoài chữ mẫu "${currentKanji.character}" hơi nhiều. Hãy tô cẩn thận theo gợi ý nhạt nhé!`;
      } else {
        feedback = `❌ Chưa hoàn thành nét viết (Độ khớp ${score}%). Hãy vẽ đầy đủ các nét của chữ "${currentKanji.character}" trước khi kiểm tra nhé!`;
      }
    }

    return { score, feedback, passed };
  };

  const markAsMastered = () => {
    if (!currentKanji) return;
    const isAlreadyPassed = userProfile.kanjiStatus[currentKanji.id];
    
    if (!isAlreadyPassed) {
      onEarnXp(20);
      const updatedKanjiStatus = { ...userProfile.kanjiStatus };
      updatedKanjiStatus[currentKanji.id] = true;
      updateProfile({ kanjiStatus: updatedKanjiStatus });
    } else {
      // Toggle off
      const updatedKanjiStatus = { ...userProfile.kanjiStatus };
      delete updatedKanjiStatus[currentKanji.id];
      updateProfile({ kanjiStatus: updatedKanjiStatus });
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExportPracticeFile = () => {
    let doc = `========================================================================\n`;
    doc += `         BẢNG LUYỆN VIẾT & HỌC CHỮ HÁN TỰ - JLPT ${userProfile.targetLevel}\n`;
    doc += `========================================================================\n\n`;
    filteredKanji.forEach((item, idx) => {
      doc += `${idx + 1}. Chữ: ${item.character} -- Ý nghĩa: ${item.meaning}\n`;
      doc += `   Âm Ôn (Onyomi): ${item.onyomi}\n`;
      doc += `   Âm Khôn (Kunyomi): ${item.kunyomi}\n`;
      doc += `   Luyện viết chữ Hán:\n`;
      doc += `   [ ${item.character} ]  [   ]  [   ]  [   ]  [   ]  [   ]  [   ]\n`;
      doc += `   Từ ghép ví dụ:\n`;
      item.exampleWords.forEach(w => {
        doc += `   - ${w.word} (${w.hiragana}): ${w.meaning}\n`;
      });
      doc += `   -------------------------------------------------------------------\n\n`;
    });
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KanjiSheet_${userProfile.targetLevel}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white border border-slate-100 rounded-[2rem] shadow-sm max-w-2xl mx-auto my-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-slate-600 animate-spin" />
        <h3 className="text-lg font-bold text-slate-950">Đang tải danh sách chữ Hán tự...</h3>
        <p className="text-slate-400 text-xs">Vui lòng chờ giây lát trong khi chúng tôi chuẩn bị bài học.</p>
      </div>
    );
  }

  if (filteredKanji.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 rounded-[2rem] shadow-sm max-w-2xl mx-auto my-12">
        <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-slate-950 mb-2">Chưa có chữ Hán tự phù hợp cho trình độ {userProfile.targetLevel}</h3>
        <p className="text-slate-500 mb-6">Bạn có thể đổi mục tiêu học tập (N5, N4, N3) trong phần Hồ sơ góc trên bên phải.</p>
        <button
          onClick={() => updateProfile({ targetLevel: 'N4' })}
          className="px-6 py-2.5 bg-slate-600 hover:bg-slate-500 rounded-xl font-bold text-white transition-all shadow-md shadow-slate-600/10 text-sm cursor-pointer"
        >
          Ôn Kanji N4
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-1 sm:pt-2 pb-6 space-y-2.5 sm:space-y-4 select-none flex flex-col items-center">
      
      {/* 1. Compact & Space-Efficient Level Navigation Bar */}
      <div className="w-full max-w-[780px] bg-white border border-slate-100 rounded-2xl p-2.5 sm:p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-950 tracking-tight whitespace-nowrap">
            Kanji <span className="text-emerald-600 font-mono">{userProfile.targetLevel}</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">
            {filteredKanji.length} chữ
          </span>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {srsCount > 0 && (
            <button
              onClick={() => {
                setShowSrsOnly(!showSrsOnly);
                setSelectedKanjiIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                showSrsOnly
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              <span>⏰ Ôn tập ({srsCount})</span>
            </button>
          )}

          <button
            onClick={() => setIsWorksheetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Tạo vở luyện viết Genkouyoushi</span>
          </button>
        </div>
      </div>

      {/* 2. Learning Mode Card */}
          {/* Main Flippable Flashcard - Compact Fixed Height Container */}
          <div 
            tabIndex={0}
            role="button"
            aria-label="Lật thẻ Hán tự (Space)"
            onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32 || e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                e.stopPropagation();
                setShowFlashcardAnswer(prev => !prev);
              }
            }}
            className="w-full max-w-[720px] mx-auto min-w-0 bg-white border-2 border-slate-200/90 hover:border-indigo-300 focus:border-indigo-500 focus:outline-none rounded-3xl min-h-[500px] sm:min-h-[540px] text-center cursor-pointer transition-all shadow-md hover:shadow-xl shadow-slate-200/50 relative overflow-hidden flex flex-col select-none group"
          >
            {/* Top decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-indigo-500 to-amber-400 z-30" />

            {/* Watermark character background for premium decoration feel */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] text-[220px] font-bold select-none pointer-events-none font-display">
              {currentKanji?.character}
            </div>

            {/* Top Action Bar Header */}
            <div className="w-full flex items-center justify-between px-3.5 py-2.5 sm:px-5 sm:py-3 shrink-0 relative z-20 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                {userProfile.role === 'admin' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentKanji) handleOpenEditKanji(currentKanji);
                    }}
                    className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                    title="Sửa Hán tự"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider font-mono px-2.5 py-1 rounded-full border shadow-3xs flex items-center gap-1.5 ${
                  showFlashcardAnswer 
                    ? 'bg-amber-50 text-amber-900 border-amber-200' 
                    : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${showFlashcardAnswer ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                  {showFlashcardAnswer ? 'Mặt sau (Mẹo nhớ AI & Chi tiết)' : 'Mặt trước (Hán tự)'}
                </span>
              </div>

              <div className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 transition-all shadow-3xs group-hover:border-indigo-300">
                <RotateCcw className="w-3 h-3 text-indigo-500 group-hover:rotate-180 transition-transform duration-300" />
                <span>Lật thẻ</span>
                <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-slate-100 border border-slate-200 text-[9px] font-mono text-slate-500">Space</kbd>
              </div>
            </div>

            {/* Card Content Stage */}
            <div className="flex-1 w-full min-h-0 relative z-10 flex flex-col">
              <AnimatePresence mode="wait">
                {!showFlashcardAnswer ? (
                  <motion.div 
                    key="front" 
                    initial={{ opacity: 0, scale: 0.96 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="h-full w-full flex flex-col items-center justify-between p-4 sm:p-6"
                  >
                    <div className="w-full" />

                    {/* Center Kanji Display */}
                    <div className="flex flex-col items-center justify-center space-y-3.5 my-auto">
                      {(() => {
                        const cat = currentKanji?.character ? getKanjiCategory(currentKanji.character) : null;
                        const assoc = currentKanji?.character ? getKanjiAssociativeColor(currentKanji.character) : null;
                        return (
                          <div className="relative">
                            <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-2 flex items-center justify-center font-bold font-display text-5xl sm:text-6xl shadow-lg transition-all hover:scale-105 select-none ${
                              assoc ? `${assoc?.bg || ''} ${assoc?.text || ''} ${assoc?.border || ''}` : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}>
                              {currentKanji?.character}
                            </div>
                            {/* Audio pronunciation button right on the card */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (currentKanji) handleSpeak(currentKanji.character);
                              }}
                              title="Nghe phát âm Hán tự"
                              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })()}

                      <div className="space-y-2 text-center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-sky-800 font-mono bg-sky-50 border border-sky-200 px-3 py-1 rounded-full shadow-3xs">
                            Số nét: <strong className="text-sky-950 font-black">{currentKanji?.strokesCount || '-'}</strong> nét
                          </span>
                          {currentKanji && (
                            <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full shadow-3xs">
                              Nhóm: {getKanjiCategory(currentKanji.character).name}
                            </span>
                          )}
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-3xs">
                            Cấp độ: {userProfile.targetLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Flip Reminder */}
                    <div className="w-full pb-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 shadow-3xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Chạm vào thẻ để xem Âm Ôn, Âm Khôn & Mẹo nhớ AI</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="back" 
                    initial={{ opacity: 0, scale: 0.96 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="h-full w-full flex flex-col overflow-y-auto px-3.5 sm:px-6 py-3 pb-6 space-y-3 text-center"
                  >
                    {/* Meaning / Hán Việt title */}
                    <div className="space-y-0.5 shrink-0 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block font-extrabold">
                        Âm Hán Việt & Ý nghĩa
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                        {currentKanji?.meaning}
                      </h3>
                    </div>

                    {/* Onyomi & Kunyomi Reading Cards */}
                    <div className="grid grid-cols-2 gap-2.5 max-w-sm sm:max-w-md mx-auto w-full shrink-0">
                      {/* Onyomi */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentKanji?.onyomi) handleSpeak(currentKanji.onyomi.split(/[,、\s]+/)[0]);
                        }}
                        title="Bấm để nghe phát âm Onyomi"
                        className="bg-gradient-to-br from-blue-50/90 to-indigo-50/60 hover:from-blue-100/90 hover:to-indigo-100/70 p-2.5 sm:p-3 rounded-xl border border-blue-200/90 text-left shadow-3xs cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-blue-700 font-extrabold uppercase tracking-wider font-mono">
                            Âm Ôn (Onyomi)
                          </span>
                          <Volume2 className="w-3 h-3 text-blue-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-sm sm:text-base text-blue-950 font-mono font-black mt-1 tracking-wide">
                          {currentKanji?.onyomi || '-'}
                        </p>
                      </div>

                      {/* Kunyomi */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentKanji?.kunyomi) handleSpeak(currentKanji.kunyomi.split(/[,、\s]+/)[0]);
                        }}
                        title="Bấm để nghe phát âm Kunyomi"
                        className="bg-gradient-to-br from-emerald-50/90 to-teal-50/60 hover:from-emerald-100/90 hover:to-teal-100/70 p-2.5 sm:p-3 rounded-xl border border-emerald-200/90 text-left shadow-3xs cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider font-mono">
                            Âm Khôn (Kunyomi)
                          </span>
                          <Volume2 className="w-3 h-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-sm sm:text-base text-emerald-950 font-mono font-black mt-1 tracking-wide">
                          {currentKanji?.kunyomi || '-'}
                        </p>
                      </div>
                    </div>

                    {/* AI-Powered Kanji Mnemonic Memory Tip */}
                    {currentKanji && (
                      <KanjiAiMnemonicCard
                        kanji={currentKanji.character}
                        meaning={currentKanji.meaning || (currentKanji.character ? KANJI_DICTIONARY[currentKanji.character]?.meaning : '')}
                        onyomi={currentKanji.onyomi || (currentKanji.character ? KANJI_DICTIONARY[currentKanji.character]?.onyomi : '')}
                        kunyomi={currentKanji.kunyomi || (currentKanji.character ? KANJI_DICTIONARY[currentKanji.character]?.kunyomi : '')}
                        strokes={currentKanji.strokesCount || (currentKanji.character ? KANJI_DICTIONARY[currentKanji.character]?.strokes : undefined)}
                        radical={currentKanji.character ? KANJI_DICTIONARY[currentKanji.character]?.radical : undefined}
                        components={currentKanji.character ? KANJI_DICTIONARY[currentKanji.character]?.components : undefined}
                        level={currentKanji.level || (currentKanji.character ? KANJI_DICTIONARY[currentKanji.character]?.level : undefined)}
                        onSpeak={handleSpeak}
                      />
                    )}

                    {/* Example Sentence from curriculum */}
                    {currentKanji?.exampleSentence && (
                      <div className="bg-gradient-to-r from-purple-50/70 to-pink-50/50 p-3 rounded-xl border border-purple-200/80 text-left w-full max-w-sm sm:max-w-md mx-auto space-y-1 shadow-3xs shrink-0">
                        <span className="text-[9px] text-purple-700 font-extrabold uppercase tracking-wider font-mono flex items-center gap-1 select-none">
                          📝 Câu ví dụ giáo trình:
                        </span>
                        <div className="text-xs text-slate-900 leading-snug font-semibold py-0.5">
                          <JapaneseFuriganaText sentence={currentKanji.exampleSentence} showFurigana={true} forceDark={false} size="sm" />
                        </div>
                        <p className="text-xs text-purple-900 font-bold leading-normal">{currentKanji.exampleTranslation}</p>
                      </div>
                    )}

                    {/* Example Compound Words */}
                    {currentKanji?.exampleWords && currentKanji.exampleWords.length > 0 && (
                      <div className="border-t border-slate-100 pt-2.5 text-left w-full max-w-sm sm:max-w-md mx-auto space-y-2 shrink-0">
                        <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                          Từ ghép bổ sung:
                        </span>
                        <div className="space-y-1.5">
                          {currentKanji.exampleWords.map((wordObj, i) => (
                            <div 
                              key={i} 
                              className="flex justify-between items-center bg-slate-50/80 hover:bg-indigo-50/60 px-3 py-2 rounded-xl border border-slate-200 text-xs transition-all cursor-pointer shadow-3xs group"
                              onClick={(e) => {
                                e.stopPropagation(); // prevent flipping card when clicking individual words
                                handleSpeak(wordObj.word);
                              }}
                            >
                              <div className="flex flex-col items-start gap-0.5">
                                <SelectiveFuriganaWord
                                  kanji={wordObj.word}
                                  hiragana={wordObj.hiragana}
                                  showFurigana={true}
                                  sizeClassName="text-xs sm:text-sm"
                                  textColorClassName="text-slate-950 font-display font-bold"
                                  furiganaColorClassName="text-amber-600"
                                />
                                <PitchAccentDisplay 
                                  kanji={wordObj.word} 
                                  reading={wordObj.hiragana} 
                                  className="scale-80 origin-left"
                                />
                              </div>
                              <span className="text-indigo-600 font-bold text-xs">{wordObj.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Flashcard Navigation bar - Compact & Vibrant */}
          <div className="flex items-center justify-between w-full max-w-[720px] bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-sm">
            <button
              onClick={handlePrev}
              disabled={selectedKanjiIndex === 0}
              className="w-10 h-10 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl disabled:opacity-30 transition-all cursor-pointer flex items-center justify-center shadow-3xs disabled:cursor-not-allowed"
              title="Chữ trước (Phím ←)"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => handleKanjiMark(false)}
                className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-rose-500/20 active:scale-95"
                title="Đánh dấu chưa thuộc (Phím tắt: X hoặc 2)"
              >
                <span>✗ Chưa nhớ</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 bg-rose-700/60 rounded text-[10px] font-mono text-rose-100">X</kbd>
              </button>
              <button
                onClick={() => handleKanjiMark(true)}
                className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 active:scale-95"
                title="Đánh dấu đã thuộc (Phím tắt: Z hoặc 1)"
              >
                <span>✓ Đã thuộc (+15 XP)</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 bg-emerald-700/60 rounded text-[10px] font-mono text-emerald-100">Z</kbd>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="w-10 h-10 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-3xs"
              title="Chữ kế tiếp (Phím →)"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Action configurations bar - Compact */}
          <div className="flex items-center justify-between w-full max-w-[720px] px-1 py-0.5">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => currentKanji && handleSpeak(currentKanji.character)}
                className="w-8 h-8 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                title="Nghe phát âm Hán tự"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-600 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                {selectedKanjiIndex + 1} / {filteredKanji.length} Kanji
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsShuffle(!isShuffle)}
                className={`flex items-center gap-1 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-3xs ${
                  isShuffle ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>🔀 Ngẫu nhiên</span>
              </button>
              <button 
                onClick={() => setIsAutoplay(!isAutoplay)}
                className={`flex items-center gap-1 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-3xs ${
                  isAutoplay ? 'bg-amber-500 border-amber-500 text-white shadow-xs animate-pulse' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>▶️ Tự động</span>
              </button>
            </div>
          </div>

        {/* Compact Grid & Writing Pad Section */}
        <div className="w-full max-w-[720px] bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>Bảng danh sách Hán tự</span>
              <span className="text-[10px] text-slate-400 font-normal">({filteredKanji.length} chữ)</span>
            </h3>
            <span className="text-[10px] text-slate-400">Nhấn để chọn nhanh</span>
          </div>

          {/* Kanji Matrix Grid - Compact, denser grid */}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-[160px] sm:max-h-[180px] overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
            {filteredKanji.map((k, idx) => {
              const isCompleted = typeof userProfile.kanjiStatus[k.id] === 'object' ? (userProfile.kanjiStatus[k.id] as any).repetitions >= 1 : userProfile.kanjiStatus[k.id];
              const isSelected = selectedKanjiIndex === idx;
              const assoc = getKanjiAssociativeColor(k.character);

              return (
                <button
                  key={k.id}
                  id={`kanji-grid-btn-${k.id}`}
                  onClick={() => setSelectedKanjiIndex(idx)}
                  className={`h-11 sm:h-12 rounded-lg border flex flex-col items-center justify-center transition-all duration-150 relative cursor-pointer ${
                    isSelected
                      ? `${assoc?.bg || ''} ${assoc?.border || ''} font-bold ring-2 ring-indigo-500 scale-105 z-10`
                      : isCompleted
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:border-emerald-300'
                      : `${assoc?.bg || ''} ${assoc?.border || ''} hover:scale-105`
                  }`}
                  title={`${k.character} - ${k.meaning}`}
                >
                  <span className={`text-base sm:text-lg font-bold font-display leading-none ${assoc?.text || ''}`}>{k.character}</span>
                  <span className="text-[8.5px] text-slate-500 mt-0.5 truncate max-w-[90%]">{k.meaning}</span>
                  
                  {isCompleted && (
                    <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Compact Practice Writing Collapsible / Mini Box */}
          <div className="pt-2 border-t border-slate-100">
            <details className="group cursor-pointer">
              <summary className="text-xs font-bold text-slate-600 flex items-center justify-between list-none select-none py-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <PenTool className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bảng tập viết chữ [ <strong className="text-slate-900 font-display">{currentKanji?.character}</strong> ]</span>
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold group-open:hidden">+ Mở bảng vẽ</span>
                <span className="text-[11px] text-slate-400 font-semibold hidden group-open:inline">- Đóng bảng vẽ</span>
              </summary>
              
              <div className="mt-3 flex flex-col sm:flex-row items-center gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="relative w-44 h-44 rounded-xl bg-white border border-slate-200 shadow-inner overflow-hidden flex items-center justify-center shrink-0">
                  {currentKanji && !canvasHasContent && (
                    <span className="absolute text-[100px] font-bold text-slate-200 select-none font-display pointer-events-none">
                      {currentKanji.character}
                    </span>
                  )}
                  <canvas
                    id="kanji-drawing-canvas"
                    ref={canvasRef}
                    width={176}
                    height={176}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="drawing-canvas absolute inset-0 w-full h-full cursor-crosshair"
                  />
                </div>

                <div className="flex-1 w-full flex flex-col justify-between h-44 py-1 space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-700">Luyện viết từng nét theo hướng dẫn</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Vẽ theo hình mờ chữ <strong>{currentKanji?.character}</strong> ({currentKanji?.strokesCount} nét) rồi bấm "Kiểm tra nét" để nhận điểm XP.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="btn-kanji-clear-canvas"
                      onClick={clearCanvas}
                      className="flex-1 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Xóa
                    </button>

                    <button
                      id="btn-kanji-check-strokes"
                      onClick={() => {
                        const result = checkDrawingSimilarity();
                        if (result.passed) {
                          playCorrectSound();
                          alert(result.feedback);
                          onEarnXp(5);
                        } else {
                          playIncorrectSound();
                          alert(result.feedback);
                        }
                      }}
                      className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-3xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      Kiểm tra nét (+5 XP)
                    </button>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>

      {/* Editing Kanji Modal for Admin */}
      <AnimatePresence>
        {editingKanji && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setEditingKanji(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-50 pb-3 pr-8">
                <h3 className="text-lg font-display font-bold text-slate-950 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-slate-600" />
                  Sửa Hán tự [ {editingKanji.character} ]
                </h3>
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={aiLoading}
                  className="px-3 py-1.5 bg-gradient-to-r from-slate-500 to-purple-600 hover:from-slate-600 hover:to-purple-700 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-slate-600/10 border-none select-none"
                  title="Sử dụng AI điền tự động toàn bộ trường thông tin"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiLoading ? "Đang điền..." : "Tự động điền bằng AI"}
                </button>
              </div>

              <form onSubmit={handleEditKanjiSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nghĩa chữ Hán (Việt)</label>
                    <input
                      type="text"
                      value={editMeaning}
                      onChange={(e) => setEditMeaning(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Số nét vẽ</label>
                    <input
                      type="number"
                      value={editStrokes}
                      onChange={(e) => setEditStrokes(parseInt(e.target.value) || 8)}
                      className="w-full px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Âm Ôn (Onyomi)</label>
                    <input
                      type="text"
                      value={editOnyomi}
                      onChange={(e) => setEditOnyomi(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50 font-mono"
                      placeholder="e.g. イチ, イツ"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Âm Khôn (Kunyomi)</label>
                    <input
                      type="text"
                      value={editKunyomi}
                      onChange={(e) => setEditKunyomi(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50 font-mono"
                      placeholder="e.g. ひと-, ひと.つ"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mẹo nhớ (Mnemonic)</label>
                  <textarea
                    value={editMnemonic}
                    onChange={(e) => setEditMnemonic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50"
                    placeholder="Nhập câu chuyện, hình ảnh liên tưởng bằng tiếng Việt để dễ ghi nhớ chữ Hán này..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Câu ví dụ tiếng Nhật</label>
                    <input
                      type="text"
                      value={editExampleSentence}
                      onChange={(e) => setEditExampleSentence(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50 font-medium"
                      placeholder="e.g. 日本語を勉強しています。"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dịch nghĩa câu ví dụ</label>
                    <input
                      type="text"
                      value={editExampleTranslation}
                      onChange={(e) => setEditExampleTranslation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50 text-sky-600 dark:text-sky-400 font-bold"
                      placeholder="e.g. Tôi đang học tiếng Nhật."
                    />
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Từ ghép ví dụ (Tối đa 3 từ)
                  </label>
                  
                  {editExamples.map((ex, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-3 rounded-2xl border border-slate-150 space-y-2">
                      <span className="text-[10px] font-bold text-slate-600 block">Ví dụ {idx + 1}</span>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Từ (Kanji)"
                          value={ex.word}
                          onChange={(e) => {
                            const updated = [...editExamples];
                            updated[idx].word = e.target.value;
                            setEditExamples(updated);
                          }}
                          className="px-2.5 py-1.5 border border-slate-100 rounded-lg text-xs bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Hiragana"
                          value={ex.hiragana}
                          onChange={(e) => {
                            const updated = [...editExamples];
                            updated[idx].hiragana = e.target.value;
                            setEditExamples(updated);
                          }}
                          className="px-2.5 py-1.5 border border-slate-100 rounded-lg text-xs bg-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Nghĩa Việt"
                          value={ex.meaning}
                          onChange={(e) => {
                            const updated = [...editExamples];
                            updated[idx].meaning = e.target.value;
                            setEditExamples(updated);
                          }}
                          className="px-2.5 py-1.5 border border-slate-100 rounded-lg text-xs bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingKanji(null)}
                    className="flex-1 py-2.5 border border-slate-100 text-slate-900 font-bold text-sm rounded-xl hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-400 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-md shadow-slate-600/10 flex items-center justify-center gap-1.5"
                  >
                    {isSaving ? 'Đang lưu...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kanji Writing Practice Sheet Generator Modal */}
      <KanjiWorksheetModal
        isOpen={isWorksheetModalOpen}
        onClose={() => setIsWorksheetModalOpen(false)}
        kanjiList={dbKanjis}
        defaultLevel={userProfile.targetLevel}
      />
    </div>
  );
}
