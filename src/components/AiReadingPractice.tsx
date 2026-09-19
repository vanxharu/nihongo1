/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Layers,
  Award,
  Loader2,
  Check,
  Bookmark,
  FileText,
  Lightbulb,
  ClipboardPaste,
  Trash2,
  ChevronDown,
  ChevronUp,
  History,
  Copy,
  ExternalLink,
  MessageSquareQuote,
  PenTool,
  Sliders,
  Maximize2,
  Newspaper,
  Globe,
  Play,
  Pause,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Radio,
  Clock,
  Compass,
  Plus,
  Circle,
  ChevronLeft,
  Palette,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JLPTLevel, UserProfile, LessonReadingData, LessonReadingQuiz, LessonReadingVocab, LessonReadingGrammar, TodaiNewsItem, WatanocArticleItem, AudioMark, JlptStats, ReadingToken } from '../types';
import JapaneseFuriganaText from './JapaneseFuriganaText';
import AudioFollowReader from './AudioFollowReader';
import JlptUnderlineArticle, { JlptWordInfo } from './JlptUnderlineArticle';
import JlptStatsBar from './JlptStatsBar';
import ReadingBottomToolbar from './ReadingBottomToolbar';
import JlptWordDetailModal from './JlptWordDetailModal';
import JlptLevelWordsDrawer from './JlptLevelWordsDrawer';
import ReadingGrammarModal from './ReadingGrammarModal';
import ReadingOptionsModal from './ReadingOptionsModal';
import { speakJapanese, playCorrectSound, playIncorrectSound } from '../utils/audio';
import { safeFetchJson } from '../utils/safeApi';
import ShibaMascot, { MascotEmptyState } from './mascot/ShibaMascot';

// Helper function to calculate or normalize JLPT statistics and level words
const ensureJlptStats = (data: LessonReadingData): LessonReadingData => {
  if (data.jlptStats && data.jlptStats.total > 0) return data;

  const counts = { n1: 0, n2: 0, n3: 0, n4: 0, n5: 0 };
  const levelWords: Record<string, string[]> = { '1': [], '2': [], '3': [], '4': [], '5': [] };

  (data.vocabularyList || []).forEach(v => {
    const lvl = v.level?.toUpperCase();
    const w = v.word || v.kanji || '';
    if (lvl === 'N1') { counts.n1++; if (w && !levelWords['1'].includes(w)) levelWords['1'].push(w); }
    else if (lvl === 'N2') { counts.n2++; if (w && !levelWords['2'].includes(w)) levelWords['2'].push(w); }
    else if (lvl === 'N3') { counts.n3++; if (w && !levelWords['3'].includes(w)) levelWords['3'].push(w); }
    else if (lvl === 'N4') { counts.n4++; if (w && !levelWords['4'].includes(w)) levelWords['4'].push(w); }
    else if (lvl === 'N5') { counts.n5++; if (w && !levelWords['5'].includes(w)) levelWords['5'].push(w); }
  });

  const total = counts.n1 + counts.n2 + counts.n3 + counts.n4 + counts.n5;
  if (total > 0) {
    data.jlptStats = {
      ...counts,
      n1Percent: Math.round((counts.n1 / total) * 100),
      n2Percent: Math.round((counts.n2 / total) * 100),
      n3Percent: Math.round((counts.n3 / total) * 100),
      n4Percent: Math.round((counts.n4 / total) * 100),
      n5Percent: Math.round((counts.n5 / total) * 100),
      total
    };
  } else {
    data.jlptStats = {
      n1: 0, n2: 1, n3: 4, n4: 9, n5: 16,
      n1Percent: 0, n2Percent: 3, n3Percent: 13, n4Percent: 30, n5Percent: 54,
      total: 30
    };
  }
  if (!data.levelWords || Object.keys(data.levelWords).length === 0) {
    data.levelWords = levelWords;
  }
  return data;
};

interface AiReadingPracticeProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onEarnXp: (amount: number) => void;
  initialLevel?: JLPTLevel;
  initialLessonNumber?: number;
  initialCurriculum?: 'minna' | 'tango';
  initialLessonId?: string;
}

// Preset sample passages for quick testing by JLPT level
const SAMPLE_PASSAGES: {
  level: JLPTLevel;
  title: string;
  genre: string;
  text: string;
}[] = [
  {
    level: 'N5',
    title: '山田さんの学生寮と毎日の生活',
    genre: '生活紹介・短文',
    text: '山田さんの寮は駅から歩いて10分です。部屋は広くありませんが、静かで綺麗です。近くにスーパーやコンビニがあるので、生活はとても便利です。山田さんは毎朝7時に起きて、朝ご飯を食べます。それから大学へ行きます。夜は寮の食堂で友達と一緒に楽しく晩ご飯を食べます。'
  },
  {
    level: 'N4',
    title: '東京駅での親切な出会い',
    genre: '体験記・随筆',
    text: '先週、私は初めて一人で東京駅へ行きました。電車を乗り換えなければならなかったのですが、東京駅は広すぎて乗り場が分かりませんでした。困っていた時、親切な女性が「どうしましたか」と声をかけてくれました。その人は京都行きの新幹線の場所まで一緒に案内してくれました。私はとても感謝して、心が温かくなりました。'
  },
  {
    level: 'N3',
    title: 'リモートワークの普及とこれからの働き方',
    genre: '社会コラム・内容理解',
    text: '近年、情報通信技術の発展により、自宅で仕事をするリモートワークが急速に普及しました。通勤の満員電車に乗る必要がなくなり、家族と過ごす時間が増えたと喜ぶ人が多いです。しかしその一方で、仕事とプライベートの時間の境界があいまいになり、夜遅くまでパソコンに向かってしまうという問題点も指摘されています。自分自身でスケジュールを管理する力がますます求められています。'
  },
  {
    level: 'N2',
    title: 'AIの進化と人間に求められる独自の創造性',
    genre: '論説文・筆者の意見',
    text: '人工知能（AI）の急速な進化は、社会や雇用のあり方に大きな変化をもたらしつつある。定型的な事務作業や大量のデータ分析は、人間よりもAIの方がはるかに迅速かつ正確に処理できるようになった。しかし、他者への深い共感や倫理的な配慮、あるいは無から新しい価値を生み出す独創的な発想は、依然として人間にしかできない領域である。これからの時代は、AIと対立するのではなく、AIを道具として活用しながら人間独自の強みを磨くことが不可欠であろう。'
  }
];

const LOCAL_STORAGE_KEY = 'nihongo_custom_reading_history_v1';
const READ_ARTICLES_STORAGE_KEY = 'nihongo_reading_read_articles_v1';

export default function AiReadingPractice({
  userProfile,
  updateProfile,
  onEarnXp,
  initialLevel = 'N4'
}: AiReadingPracticeProps) {
  // Input State
  const [inputText, setInputText] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | 'auto'>('auto');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Source mode: 'todai' (Báo Todaii News) | 'watanoc' (Tạp chí Watanoc) | 'custom' (Tự nhập văn bản)
  const [readingSourceMode, setReadingSourceMode] = useState<'todai' | 'watanoc' | 'custom'>('todai');

  // Read status persistence state: holds Set of read article IDs / URLs / titles
  const [readArticleKeys, setReadArticleKeys] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(READ_ARTICLES_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Todaii News List & Filter State
  const [todaiNewsList, setTodaiNewsList] = useState<TodaiNewsItem[]>([]);
  const [todaiLoading, setTodaiLoading] = useState<boolean>(false);
  const [todaiLoadingMore, setTodaiLoadingMore] = useState<boolean>(false);
  const [todaiPage, setTodaiPage] = useState<number>(1);
  const [todaiHasMore, setTodaiHasMore] = useState<boolean>(true);
  const [todaiFilterLevel, setTodaiFilterLevel] = useState<JLPTLevel | 'all'>('all');
  const [todaiReadFilter, setTodaiReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [todaiInputUrl, setTodaiInputUrl] = useState<string>('');
  const [showTodaiLinkInput, setShowTodaiLinkInput] = useState<boolean>(false);
  const [isFetchingTodaiArticle, setIsFetchingTodaiArticle] = useState<boolean>(false);

  // Watanoc Web Magazine List & Filter State
  const [watanocArticles, setWatanocArticles] = useState<WatanocArticleItem[]>([]);
  const [watanocLoading, setWatanocLoading] = useState<boolean>(false);
  const [watanocLoadingMore, setWatanocLoadingMore] = useState<boolean>(false);
  const [watanocPage, setWatanocPage] = useState<number>(1);
  const [watanocHasMore, setWatanocHasMore] = useState<boolean>(true);
  const [watanocFilterLevel, setWatanocFilterLevel] = useState<string>('all');
  const [watanocFilterCategory, setWatanocFilterCategory] = useState<string>('all');
  const [watanocReadFilter, setWatanocReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [watanocInputUrl, setWatanocInputUrl] = useState<string>('');
  const [showWatanocLinkInput, setShowWatanocLinkInput] = useState<boolean>(false);
  const [isFetchingWatanocArticle, setIsFetchingWatanocArticle] = useState<boolean>(false);

  // Status/Feedback notification banner after refresh
  const [refreshNotification, setRefreshNotification] = useState<{
    source: 'todai' | 'watanoc';
    text: string;
    addedCount: number;
    totalCount: number;
  } | null>(null);

  // Native Todaii Studio Audio Player State
  const [todaiAudioPlaying, setTodaiAudioPlaying] = useState<boolean>(false);
  const [todaiAudioSpeed, setTodaiAudioSpeed] = useState<number>(1.0);
  const [todaiAudioCurrentTime, setTodaiAudioCurrentTime] = useState<number>(0);
  const [todaiAudioDuration, setTodaiAudioDuration] = useState<number>(0);
  const todaiAudioRef = useRef<HTMLAudioElement | null>(null);
  const [autoScrollAudioText, setAutoScrollAudioText] = useState<boolean>(true);
  const [readingFollowMode, setReadingFollowMode] = useState<'karaoke' | 'classic'>('karaoke');

  // Silky-smooth 60fps audio time tracking during playback for responsive karaoke animation
  useEffect(() => {
    if (!todaiAudioPlaying) return;
    let animId: number;
    const updateAudioTime = () => {
      if (todaiAudioRef.current && !todaiAudioRef.current.paused) {
        setTodaiAudioCurrentTime(todaiAudioRef.current.currentTime);
      }
      animId = requestAnimationFrame(updateAudioTime);
    };
    animId = requestAnimationFrame(updateAudioTime);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [todaiAudioPlaying]);

  // Result Analysis State
  const [readingData, setReadingData] = useState<LessonReadingData | null>(null);
  const [activeTab, setActiveTab] = useState<'quiz' | 'vocab' | 'grammar' | 'sentences'>('quiz');
  const [showFurigana, setShowFurigana] = useState<boolean>(true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(false);
  const [showJlptUnderline, setShowJlptUnderline] = useState<boolean>(true);
  const [selectedJlptFilter, setSelectedJlptFilter] = useState<'N1' | 'N2' | 'N3' | 'N4' | 'N5' | null>(null);
  // POS Highlight state: Danh từ (Sky Blue), Động từ (Orange), Tính từ (Emerald Green)
  const [showPosHighlight, setShowPosHighlight] = useState<boolean>(true);
  const [selectedPosFilter, setSelectedPosFilter] = useState<'noun' | 'verb' | 'adjective' | null>(null);
  const [posMap, setPosMap] = useState<Record<string, 'noun' | 'verb' | 'adjective' | 'other'>>({});
  const [clickedWordInfo, setClickedWordInfo] = useState<JlptWordInfo | null>(null);
  const [activeLevelWordsDrawer, setActiveLevelWordsDrawer] = useState<'N1' | 'N2' | 'N3' | 'N4' | 'N5' | null>(null);
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);

  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [earnedXpAwarded, setEarnedXpAwarded] = useState<boolean>(false);

  // History State
  const [savedHistory, setSavedHistory] = useState<LessonReadingData[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Sync posMap whenever readingData is updated or fetch asynchronously
  useEffect(() => {
    if (!readingData) {
      setPosMap({});
      return;
    }
    if (readingData.posMap && Object.keys(readingData.posMap).length > 0) {
      setPosMap(readingData.posMap as any);
    } else if (readingData.japanesePassage) {
      fetch('/api/reading/tokenize-pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: readingData.japanesePassage })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.posMap) {
            setPosMap(data.posMap);
          }
        })
        .catch(err => console.warn('Could not tokenize POS map:', err));
    }
  }, [readingData]);

  // Statistics on Nouns, Verbs, and Adjectives in active passage
  const posStats = useMemo(() => {
    let nouns = 0;
    let verbs = 0;
    let adjectives = 0;
    if (posMap && Object.keys(posMap).length > 0) {
      for (const val of Object.values(posMap)) {
        if (val === 'noun') nouns++;
        else if (val === 'verb') verbs++;
        else if (val === 'adjective') adjectives++;
      }
    }
    return { nouns, verbs, adjectives };
  }, [posMap]);

  // Text metrics
  const textStats = useMemo(() => {
    const text = inputText.trim();
    const charCount = text.length;
    const kanjiCount = (text.match(/[\u4e00-\u9faf]/g) || []).length;
    const sentenceCount = (text.match(/[。！？!?\n]+/g) || []).length || (text ? 1 : 0);
    return { charCount, kanjiCount, sentenceCount };
  }, [inputText]);

  // Handle TTS Audio
  const handleToggleAudio = () => {
    if (!readingData?.japanesePassage) return;
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakJapanese(readingData.japanesePassage, 0.9, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  // Play single sentence audio
  const handlePlaySentenceAudio = (sentence: string, idx: number) => {
    setActiveSentenceIndex(idx);
    speakJapanese(sentence, 0.9, () => {
      setActiveSentenceIndex(null);
    });
  };

  // Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setInputText(text.trim());
          setErrorMessage(null);
        }
      }
    } catch {
      // Ignore if permission denied
    }
  };

  // Load sample passage
  const handleLoadSample = (sample: typeof SAMPLE_PASSAGES[0]) => {
    setInputText(sample.text);
    setSelectedLevel(sample.level);
    setErrorMessage(null);
  };

  // Save to History
  const saveToHistory = (data: LessonReadingData) => {
    try {
      setSavedHistory(prev => {
        const filtered = prev.filter(item => item.japanesePassage !== data.japanesePassage);
        const updated = [data, ...filtered].slice(0, 15);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Could not save history:', e);
    }
  };

  // Auto-dismiss refresh notification after 6 seconds
  useEffect(() => {
    if (!refreshNotification) return;
    const timer = setTimeout(() => {
      setRefreshNotification(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [refreshNotification]);

  // Fetch Todaii Japanese News List
  // mode: 'initial' | 'refresh' | 'more'
  const fetchTodaiNews = async (mode: 'initial' | 'refresh' | 'more' = 'initial') => {
    if (mode === 'more') {
      setTodaiLoadingMore(true);
    } else {
      setTodaiLoading(true);
    }

    try {
      if (mode === 'refresh') {
        // 1. Fetch fresh breaking page 1 with timestamp cache buster
        // 2. Fetch the next page to add more articles into user's reading queue
        const nextPage = todaiPage + 1;
        const [resP1, resNext] = await Promise.all([
          safeFetchJson<{ success: boolean; articles: TodaiNewsItem[] }>(
            `/api/reading/todai/news-list?page=1&limit=30&lang=vi&_t=${Date.now()}`
          ),
          safeFetchJson<{ success: boolean; articles: TodaiNewsItem[] }>(
            `/api/reading/todai/news-list?page=${nextPage}&limit=30&lang=vi&_t=${Date.now()}`
          )
        ]);

        const incomingP1 = (resP1.ok && resP1.data?.articles) ? resP1.data.articles : [];
        const incomingNext = (resNext.ok && resNext.data?.articles) ? resNext.data.articles : [];
        const combinedIncoming = [...incomingP1, ...incomingNext];

        let addedCount = 0;
        let totalCount = 0;

        setTodaiNewsList(prev => {
          const prevKeys = new Set(prev.map(item => item.id || item.url || item.titleJp));
          for (const item of combinedIncoming) {
            const key = item.id || item.url || item.titleJp;
            if (!prevKeys.has(key)) {
              addedCount++;
            }
          }

          // Build ordered list: newest incoming page 1 first, then prev, then incoming next page
          const merged: TodaiNewsItem[] = [];
          const seen = new Set<string>();

          for (const item of incomingP1) {
            const key = item.id || item.url || item.titleJp;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }

          for (const item of prev) {
            const key = item.id || item.url || item.titleJp;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }

          for (const item of incomingNext) {
            const key = item.id || item.url || item.titleJp;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }

          totalCount = merged.length;
          return merged;
        });

        setTodaiPage(nextPage);
        setRefreshNotification({
          source: 'todai',
          text: addedCount > 0
            ? `Đã cập nhật thêm ${addedCount} bài báo mới nhất từ Todaii News!`
            : `Đã làm mới thành công! Danh sách đang hiển thị các bài báo mới nhất.`,
          addedCount,
          totalCount
        });
      } else if (mode === 'more') {
        const nextPage = todaiPage + 1;
        const res = await safeFetchJson<{ success: boolean; articles: TodaiNewsItem[] }>(
          `/api/reading/todai/news-list?page=${nextPage}&limit=30&lang=vi&_t=${Date.now()}`
        );
        if (res.ok && res.data?.articles && res.data.articles.length > 0) {
          const incoming = res.data.articles;
          let added = 0;
          setTodaiNewsList(prev => {
            const seen = new Set(prev.map(item => item.id || item.url || item.titleJp));
            const newItems = incoming.filter(item => {
              const key = item.id || item.url || item.titleJp;
              if (seen.has(key)) return false;
              seen.add(key);
              added++;
              return true;
            });
            return [...prev, ...newItems];
          });
          setTodaiPage(nextPage);
          if (incoming.length < 10) {
            setTodaiHasMore(false);
          }
        } else {
          setTodaiHasMore(false);
        }
      } else {
        // Initial load
        const res = await safeFetchJson<{ success: boolean; articles: TodaiNewsItem[] }>(
          `/api/reading/todai/news-list?page=1&limit=30&lang=vi&_t=${Date.now()}`
        );
        if (res.ok && res.data?.articles) {
          const seen = new Set<string>();
          const unique = res.data.articles.filter(item => {
            const key = item.id || item.url || item.titleJp;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setTodaiNewsList(unique);
          setTodaiPage(1);
          setTodaiHasMore(true);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch Todaii news:', err);
    } finally {
      setTodaiLoading(false);
      setTodaiLoadingMore(false);
    }
  };

  // Fetch Watanoc Web Magazine Articles
  // mode: 'initial' | 'refresh' | 'more'
  const fetchWatanocArticles = async (
    tag = watanocFilterLevel, 
    cat = watanocFilterCategory, 
    mode: 'initial' | 'refresh' | 'more' = 'initial'
  ) => {
    if (mode === 'more') {
      setWatanocLoadingMore(true);
    } else {
      setWatanocLoading(true);
    }

    try {
      if (mode === 'refresh') {
        const nextPage = watanocPage + 1;
        // Fetch page 1 (with RSS feed newest articles) AND next page
        const [resP1, resNext] = await Promise.all([
          safeFetchJson<{ success: boolean; articles: WatanocArticleItem[] }>(
            `/api/reading/watanoc/article-list?tag=${tag}&category=${cat}&page=1&_t=${Date.now()}`
          ),
          safeFetchJson<{ success: boolean; articles: WatanocArticleItem[] }>(
            `/api/reading/watanoc/article-list?tag=${tag}&category=${cat}&page=${nextPage}&_t=${Date.now()}`
          )
        ]);

        const incomingP1 = (resP1.ok && resP1.data?.articles) ? resP1.data.articles : [];
        const incomingNext = (resNext.ok && resNext.data?.articles) ? resNext.data.articles : [];
        const combinedIncoming = [...incomingP1, ...incomingNext];

        let addedCount = 0;
        let totalCount = 0;

        setWatanocArticles(prev => {
          const prevKeys = new Set(prev.map(item => item.id || item.url || item.rawTitle));
          for (const item of combinedIncoming) {
            const key = item.id || item.url || item.rawTitle;
            if (!prevKeys.has(key)) {
              addedCount++;
            }
          }

          const merged: WatanocArticleItem[] = [];
          const seen = new Set<string>();

          // Newest items from page 1 / RSS feed first
          for (const item of incomingP1) {
            const key = item.id || item.url || item.rawTitle;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }

          // Existing items
          for (const item of prev) {
            const key = item.id || item.url || item.rawTitle;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }

          // Additional items from next page/category
          for (const item of incomingNext) {
            const key = item.id || item.url || item.rawTitle;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }

          totalCount = merged.length;
          return merged;
        });

        setWatanocPage(nextPage);
        setRefreshNotification({
          source: 'watanoc',
          text: addedCount > 0
            ? `Đã cập nhật thêm ${addedCount} bài viết mới nhất từ tạp chí Watanoc!`
            : `Đã làm mới thành công! Đang hiển thị các bài viết mới nhất từ Watanoc.`,
          addedCount,
          totalCount
        });
      } else if (mode === 'more') {
        const nextPage = watanocPage + 1;
        const res = await safeFetchJson<{ success: boolean; articles: WatanocArticleItem[] }>(
          `/api/reading/watanoc/article-list?tag=${tag}&category=${cat}&page=${nextPage}&_t=${Date.now()}`
        );
        if (res.ok && res.data?.articles && res.data.articles.length > 0) {
          const incoming = res.data.articles;
          setWatanocArticles(prev => {
            const seen = new Set(prev.map(item => item.id || item.url || item.rawTitle));
            const newItems = incoming.filter(item => {
              const key = item.id || item.url || item.rawTitle;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            return [...prev, ...newItems];
          });
          setWatanocPage(nextPage);
          if (incoming.length < 10) {
            setWatanocHasMore(false);
          }
        } else {
          setWatanocHasMore(false);
        }
      } else {
        // Initial load or filter change
        const res = await safeFetchJson<{ success: boolean; articles: WatanocArticleItem[] }>(
          `/api/reading/watanoc/article-list?tag=${tag}&category=${cat}&page=1&_t=${Date.now()}`
        );
        if (res.ok && res.data?.articles) {
          const seen = new Set<string>();
          const unique = res.data.articles.filter(item => {
            const key = item.id || item.url || item.rawTitle;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setWatanocArticles(unique);
          setWatanocPage(1);
          setWatanocHasMore(true);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch Watanoc articles:', err);
    } finally {
      setWatanocLoading(false);
      setWatanocLoadingMore(false);
    }
  };

  useEffect(() => {
    if (readingSourceMode === 'todai' && todaiNewsList.length === 0) {
      fetchTodaiNews();
    } else if (readingSourceMode === 'watanoc' && watanocArticles.length === 0) {
      fetchWatanocArticles();
    }
  }, [readingSourceMode]);

  // Helper to extract unique identity key for any article/news
  const getArticleKey = (item: { id?: string; url?: string; titleJp?: string; rawTitle?: string; title?: string } | null | undefined): string => {
    if (!item) return '';
    return (item.id || item.url || item.titleJp || item.rawTitle || item.title || '').trim();
  };

  const isArticleRead = (item: { id?: string; url?: string; titleJp?: string; rawTitle?: string; title?: string } | null | undefined): boolean => {
    const key = getArticleKey(item);
    return Boolean(key && readArticleKeys.has(key));
  };

  const toggleArticleRead = (item: { id?: string; url?: string; titleJp?: string; rawTitle?: string; title?: string }, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const key = getArticleKey(item);
    if (!key) return;

    setReadArticleKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      try {
        localStorage.setItem(READ_ARTICLES_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (err) {
        console.warn('Failed to save read status:', err);
      }
      return next;
    });
  };

  const markArticleAsRead = (item: { id?: string; url?: string; titleJp?: string; rawTitle?: string; title?: string } | null | undefined) => {
    const key = getArticleKey(item);
    if (!key) return;

    setReadArticleKeys(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      try {
        localStorage.setItem(READ_ARTICLES_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (err) {
        console.warn('Failed to save read status:', err);
      }
      return next;
    });
  };

  // Filtered news list by JLPT and Read status
  const filteredTodaiNews = useMemo(() => {
    let list = todaiNewsList;
    if (todaiFilterLevel !== 'all') {
      list = list.filter(item => item.jlptLevel === todaiFilterLevel);
    }
    if (todaiReadFilter === 'unread') {
      list = list.filter(item => !readArticleKeys.has(getArticleKey(item)));
    } else if (todaiReadFilter === 'read') {
      list = list.filter(item => readArticleKeys.has(getArticleKey(item)));
    }
    return list;
  }, [todaiNewsList, todaiFilterLevel, todaiReadFilter, readArticleKeys]);

  // Statistics for Todaii News Read/Unread
  const todaiReadStats = useMemo(() => {
    const levelFiltered = todaiFilterLevel === 'all' 
      ? todaiNewsList 
      : todaiNewsList.filter(item => item.jlptLevel === todaiFilterLevel);
    const total = levelFiltered.length;
    const read = levelFiltered.filter(item => readArticleKeys.has(getArticleKey(item))).length;
    const unread = total - read;
    return { total, read, unread };
  }, [todaiNewsList, todaiFilterLevel, readArticleKeys]);

  // Filtered Watanoc articles list by Level, Category and Read status
  const filteredWatanocArticles = useMemo(() => {
    let list = watanocArticles;
    if (watanocFilterLevel === 'listening') {
      list = list.filter(item => item.hasAudio || item.rawTitle.toLowerCase().includes('listening'));
    } else if (watanocFilterLevel !== 'all') {
      list = list.filter(item => item.level.toUpperCase() === watanocFilterLevel.toUpperCase());
    }
    if (watanocReadFilter === 'unread') {
      list = list.filter(item => !readArticleKeys.has(getArticleKey(item)));
    } else if (watanocReadFilter === 'read') {
      list = list.filter(item => readArticleKeys.has(getArticleKey(item)));
    }
    return list;
  }, [watanocArticles, watanocFilterLevel, watanocReadFilter, readArticleKeys]);

  // Statistics for Watanoc Articles Read/Unread
  const watanocReadStats = useMemo(() => {
    let list = watanocArticles;
    if (watanocFilterLevel === 'listening') {
      list = list.filter(item => item.hasAudio || item.rawTitle.toLowerCase().includes('listening'));
    } else if (watanocFilterLevel !== 'all') {
      list = list.filter(item => item.level.toUpperCase() === watanocFilterLevel.toUpperCase());
    }
    const total = list.length;
    const read = list.filter(item => readArticleKeys.has(getArticleKey(item))).length;
    const unread = total - read;
    return { total, read, unread };
  }, [watanocArticles, watanocFilterLevel, readArticleKeys]);

  // Handle native audio playback from Todaii
  const handleToggleTodaiAudio = () => {
    if (!todaiAudioRef.current) return;
    if (todaiAudioPlaying) {
      todaiAudioRef.current.pause();
      setTodaiAudioPlaying(false);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      }
      todaiAudioRef.current.play().then(() => {
        setTodaiAudioPlaying(true);
      }).catch(err => console.error('Audio play error:', err));
    }
  };

  const handleChangeTodaiSpeed = (speed: number) => {
    setTodaiAudioSpeed(speed);
    if (todaiAudioRef.current) {
      todaiAudioRef.current.playbackRate = speed;
    }
  };

  const handleSkipTodaiAudio = (seconds: number) => {
    if (todaiAudioRef.current) {
      todaiAudioRef.current.currentTime = Math.max(0, Math.min(todaiAudioRef.current.duration || 0, todaiAudioRef.current.currentTime + seconds));
    }
  };

  // Select a Todaii news article and run AI comprehension analysis
  const handleSelectTodaiArticle = async (article: TodaiNewsItem) => {
    setIsFetchingTodaiArticle(true);
    setErrorMessage(null);
    setAnalysisStep('Đang tải nội dung bài báo Todaii News & Audio bản xứ...');
    setIsAnalyzing(true);

    try {
      const fetchRes = await safeFetchJson<{
        success: boolean;
        id: string;
        titleJp: string;
        titleVi: string;
        text: string;
        furiganaText?: string;
        rawTokens?: ReadingToken[];
        jlptStats?: JlptStats;
        levelWords?: Record<string, string[]>;
        audio?: string;
        audioMarks?: AudioMark[];
        image?: string;
        level?: string;
        sourceName?: string;
        sourceUrl?: string;
      }>('/api/reading/todai/fetch-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id, url: article.url })
      });

      if (!fetchRes.ok || !fetchRes.data || !fetchRes.data.text) {
        throw new Error(fetchRes.error || 'Không thể tải nội dung bài viết từ Todaii News.');
      }

      const { text, furiganaText, rawTokens, jlptStats, levelWords, audio, audioMarks, image, titleJp, titleVi, sourceName, sourceUrl, level } = fetchRes.data;

      setAnalysisStep('Đang gắn Furigana, phân tích từ vựng, ngữ pháp và soạn câu hỏi JLPT...');

      const genRes = await safeFetchJson<LessonReadingData>('/api/reading/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPassage: text,
          pastedText: text,
          level: selectedLevel !== 'auto' ? selectedLevel : (level || article.jlptLevel || 'N4'),
          questionCount,
          audioUrl: audio || article.audio,
          imageUrl: image || article.image,
          sourceName: sourceName || 'Todaii Japanese News',
          sourceUrl: sourceUrl || article.url,
          titleVi: titleVi || article.titleVi
        })
      });

      if (!genRes.ok || !genRes.data || !genRes.data.japanesePassage) {
        throw new Error(genRes.error || 'Không nhận được kết quả phân tích bài đọc.');
      }

      const result = genRes.data;
      result.title = titleJp || result.title;
      result.titleVi = titleVi || article.titleVi;
      result.audioUrl = audio || article.audio;
      result.audioMarks = audioMarks || [];
      if (text) {
        result.japanesePassage = text;
      }
      if (furiganaText) {
        result.furiganaPassage = furiganaText;
      }
      result.rawTokens = rawTokens || [];
      result.jlptStats = jlptStats || null;
      result.levelWords = levelWords || null;
      ensureJlptStats(result);

      result.imageUrl = image || article.image;
      result.sourceName = 'Todaii Japanese News';
      result.sourceUrl = sourceUrl || article.url;

      setReadingData(result);
      markArticleAsRead(article);
      markArticleAsRead(result);
      if (result.audioUrl) {
        setReadingFollowMode('karaoke');
      }
      setUserAnswers({});
      setShowExplanations({});
      setIsQuizSubmitted(false);
      setEarnedXpAwarded(false);
      setActiveTab('quiz');
      saveToHistory(result);
    } catch (err: any) {
      console.error('Fetch Todaii article error:', err);
      setErrorMessage(err.message || 'Lỗi khi tải hoặc phân tích bài báo Todaii.');
    } finally {
      setIsFetchingTodaiArticle(false);
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Fetch article from custom pasted Todaii URL or ID
  const handleFetchTodaiUrl = async () => {
    const trimmed = todaiInputUrl.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập link bài báo Todaii hoặc mã bài viết (Ví dụ: https://japanese.todaiinews.com/vi/news/...)');
      return;
    }

    setIsFetchingTodaiArticle(true);
    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisStep('Đang trích xuất bài viết Todaii từ liên kết...');

    try {
      const fetchRes = await safeFetchJson<{
        success: boolean;
        id: string;
        titleJp: string;
        titleVi: string;
        text: string;
        furiganaText?: string;
        rawTokens?: ReadingToken[];
        jlptStats?: JlptStats;
        levelWords?: Record<string, string[]>;
        audio?: string;
        audioMarks?: AudioMark[];
        image?: string;
        level?: string;
        sourceName?: string;
        sourceUrl?: string;
      }>('/api/reading/todai/fetch-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed, id: trimmed })
      });

      if (!fetchRes.ok || !fetchRes.data || !fetchRes.data.text) {
        throw new Error(fetchRes.error || 'Không tìm thấy nội dung bài báo tại liên kết này.');
      }

      const { text, furiganaText, rawTokens, jlptStats, levelWords, audio, audioMarks, image, titleJp, titleVi, sourceName, sourceUrl, level } = fetchRes.data;

      setAnalysisStep('Đang phân tích cấu trúc câu, Furigana & soạn bộ đề trắc nghiệm...');

      const genRes = await safeFetchJson<LessonReadingData>('/api/reading/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPassage: text,
          pastedText: text,
          level: selectedLevel !== 'auto' ? selectedLevel : (level || 'N4'),
          questionCount,
          audioUrl: audio,
          imageUrl: image,
          sourceName: sourceName || 'Todaii Japanese News',
          sourceUrl: sourceUrl || trimmed,
          titleVi
        })
      });

      if (!genRes.ok || !genRes.data || !genRes.data.japanesePassage) {
        throw new Error(genRes.error || 'Lỗi khi phân tích bài đọc.');
      }

      const result = genRes.data;
      result.title = titleJp || result.title;
      result.titleVi = titleVi;
      result.audioUrl = audio;
      result.audioMarks = audioMarks || [];
      if (text) {
        result.japanesePassage = text;
      }
      if (furiganaText) {
        result.furiganaPassage = furiganaText;
      }
      result.rawTokens = rawTokens || [];
      result.jlptStats = jlptStats || null;
      result.levelWords = levelWords || null;
      ensureJlptStats(result);

      result.imageUrl = image;
      result.sourceName = sourceName || 'Todaii Japanese News';
      result.sourceUrl = sourceUrl || trimmed;

      setReadingData(result);
      markArticleAsRead(result);
      if (result.audioUrl) {
        setReadingFollowMode('karaoke');
      }
      setUserAnswers({});
      setShowExplanations({});
      setIsQuizSubmitted(false);
      setEarnedXpAwarded(false);
      setActiveTab('quiz');
      saveToHistory(result);
    } catch (err: any) {
      console.error('Fetch custom Todai URL error:', err);
      setErrorMessage(err.message || 'Không thể trích xuất bài viết. Vui lòng kiểm tra lại URL.');
    } finally {
      setIsFetchingTodaiArticle(false);
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Select a Watanoc article and run AI comprehension analysis
  const handleSelectWatanocArticle = async (article: WatanocArticleItem) => {
    setIsFetchingWatanocArticle(true);
    setErrorMessage(null);
    setAnalysisStep('Đang tải bài viết từ Tạp chí Watanoc & Audio bản xứ...');
    setIsAnalyzing(true);

    try {
      const fetchRes = await safeFetchJson<{
        success: boolean;
        id: string;
        titleJp: string;
        titleVi: string;
        text: string;
        audio?: string;
        image?: string;
        level?: string;
        vocabNotes?: { word: string; meaning?: string }[];
        grammarNotes?: { pattern: string; explanation?: string }[];
        sourceName?: string;
        sourceUrl?: string;
      }>('/api/reading/watanoc/fetch-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id, url: article.url })
      });

      if (!fetchRes.ok || !fetchRes.data || !fetchRes.data.text) {
        throw new Error(fetchRes.error || 'Không thể tải nội dung bài viết từ Tạp chí Watanoc.');
      }

      const { text, audio, image, titleJp, titleVi, sourceName, sourceUrl, level } = fetchRes.data;

      setAnalysisStep('Đang gắn Furigana, phân tích từ vựng, ngữ pháp và soạn câu hỏi JLPT...');

      const genRes = await safeFetchJson<LessonReadingData>('/api/reading/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPassage: text,
          pastedText: text,
          level: selectedLevel !== 'auto' ? selectedLevel : (article.level !== 'All' ? article.level : (level || 'N4')),
          questionCount,
          audioUrl: audio || article.audio,
          imageUrl: image || article.image,
          sourceName: sourceName || 'Tạp chí Watanoc (watanoc.com)',
          sourceUrl: sourceUrl || article.url,
          titleVi: titleVi || article.titleSub
        })
      });

      if (!genRes.ok || !genRes.data || !genRes.data.japanesePassage) {
        throw new Error(genRes.error || 'Không nhận được kết quả phân tích bài đọc.');
      }

      const result = genRes.data;
      result.title = titleJp || result.title;
      result.titleVi = titleVi || article.titleSub;
      result.audioUrl = audio || article.audio;
      result.imageUrl = image || article.image;
      result.sourceName = 'Tạp chí Watanoc (watanoc.com)';
      result.sourceUrl = sourceUrl || article.url;
      ensureJlptStats(result);

      setReadingData(result);
      markArticleAsRead(article);
      markArticleAsRead(result);
      setUserAnswers({});
      setShowExplanations({});
      setIsQuizSubmitted(false);
      setEarnedXpAwarded(false);
      setActiveTab('quiz');
      saveToHistory(result);
    } catch (err: any) {
      console.error('Fetch Watanoc article error:', err);
      setErrorMessage(err.message || 'Lỗi khi tải hoặc phân tích bài viết Watanoc.');
    } finally {
      setIsFetchingWatanocArticle(false);
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Fetch article from custom pasted Watanoc URL or ID
  const handleFetchWatanocUrl = async () => {
    const trimmed = watanocInputUrl.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập link bài viết Watanoc (Ví dụ: https://watanoc.com/post-1610-jiyuugaoka)');
      return;
    }

    setIsFetchingWatanocArticle(true);
    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisStep('Đang trích xuất bài viết từ tạp chí Watanoc...');

    try {
      const fetchRes = await safeFetchJson<{
        success: boolean;
        id: string;
        titleJp: string;
        titleVi: string;
        text: string;
        audio?: string;
        image?: string;
        level?: string;
        sourceName?: string;
        sourceUrl?: string;
      }>('/api/reading/watanoc/fetch-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed, id: trimmed })
      });

      if (!fetchRes.ok || !fetchRes.data || !fetchRes.data.text) {
        throw new Error(fetchRes.error || 'Không tìm thấy nội dung bài viết tại liên kết Watanoc này.');
      }

      const { text, audio, image, titleJp, titleVi, sourceName, sourceUrl, level } = fetchRes.data;

      setAnalysisStep('Đang phân tích Furigana, từ vựng, ngữ pháp & soạn đề thi JLPT...');

      const genRes = await safeFetchJson<LessonReadingData>('/api/reading/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPassage: text,
          pastedText: text,
          level: selectedLevel !== 'auto' ? selectedLevel : (level || 'N4'),
          questionCount,
          audioUrl: audio,
          imageUrl: image,
          sourceName: sourceName || 'Tạp chí Watanoc (watanoc.com)',
          sourceUrl: sourceUrl || trimmed,
          titleVi
        })
      });

      if (!genRes.ok || !genRes.data || !genRes.data.japanesePassage) {
        throw new Error(genRes.error || 'Lỗi khi phân tích bài đọc.');
      }

      const result = genRes.data;
      result.title = titleJp || result.title;
      result.titleVi = titleVi;
      result.audioUrl = audio;
      result.imageUrl = image;
      result.sourceName = sourceName || 'Tạp chí Watanoc (watanoc.com)';
      result.sourceUrl = sourceUrl || trimmed;
      ensureJlptStats(result);

      setReadingData(result);
      markArticleAsRead(result);
      setUserAnswers({});
      setShowExplanations({});
      setIsQuizSubmitted(false);
      setEarnedXpAwarded(false);
      setActiveTab('quiz');
      saveToHistory(result);
    } catch (err: any) {
      console.error('Fetch custom Watanoc URL error:', err);
      setErrorMessage(err.message || 'Không thể trích xuất bài viết. Vui lòng kiểm tra lại URL.');
    } finally {
      setIsFetchingWatanocArticle(false);
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Analyze Custom Passage
  const handleAnalyzePassage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập hoặc dán một đoạn văn tiếng Nhật để phân tích.');
      return;
    }

    if (trimmed.length < 15) {
      setErrorMessage('Đoạn văn quá ngắn (tối thiểu 15 ký tự). Vui lòng nhập đoạn văn hoàn chỉnh hơn.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStep('Đang nhận diện cấu trúc văn bản và chữ Hán...');

    try {
      const stepTimer1 = setTimeout(() => {
        setAnalysisStep('Đang đánh dấu Furigana và phân tích từ vựng, ngữ pháp...');
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setAnalysisStep('Đang biên soạn câu hỏi đọc hiểu JLPT và giải thích chi tiết...');
      }, 3500);

      const fetchRes = await safeFetchJson<LessonReadingData>('/api/reading/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPassage: trimmed,
          pastedText: trimmed,
          level: selectedLevel,
          questionCount
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!fetchRes.ok || !fetchRes.data || !fetchRes.data.japanesePassage) {
        throw new Error(fetchRes.error || 'Không nhận được dữ liệu phân tích từ máy chủ.');
      }

      const result = fetchRes.data;

      // Ensure title exists
      if (!result.title) {
        result.title = `Bài đọc hiểu tiếng Nhật (${result.level || 'JLPT'})`;
      }
      ensureJlptStats(result);

      setReadingData(result);
      setUserAnswers({});
      setShowExplanations({});
      setIsQuizSubmitted(false);
      setEarnedXpAwarded(false);
      setActiveTab('quiz');
      saveToHistory(result);
    } catch (err: any) {
      console.error('Passage analysis error:', err);
      setErrorMessage(err.message || 'Không thể phân tích đoạn văn. Vui lòng thử lại sau.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Quiz Answer Selection
  const handleSelectOption = (quizIndex: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [quizIndex]: optionIndex }));
  };

  // Submit Quiz & Check answers
  const handleSubmitQuiz = () => {
    if (!readingData?.quizzes || readingData.quizzes.length === 0) return;
    setIsQuizSubmitted(true);
    markArticleAsRead(readingData);

    // Reveal all explanations
    const expMap: Record<number, boolean> = {};
    let correctCount = 0;
    readingData.quizzes.forEach((q, idx) => {
      expMap[idx] = true;
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    setShowExplanations(expMap);

    if (correctCount > 0) {
      playCorrectSound();
      if (!earnedXpAwarded) {
        const xp = correctCount * 15;
        onEarnXp(xp);
        setEarnedXpAwarded(true);
      }
    } else {
      playIncorrectSound();
    }
  };

  // Reset Quiz
  const handleResetQuiz = () => {
    setUserAnswers({});
    setShowExplanations({});
    setIsQuizSubmitted(false);
  };

  // Calculate Quiz Score
  const quizScore = useMemo(() => {
    if (!readingData?.quizzes || !isQuizSubmitted) return null;
    const total = readingData.quizzes.length;
    let correct = 0;
    readingData.quizzes.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) correct++;
    });
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  }, [readingData, isQuizSubmitted, userAnswers]);

  // Copy Passage
  const handleCopyPassage = () => {
    if (!readingData?.japanesePassage) return;
    navigator.clipboard.writeText(readingData.japanesePassage).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  return (
    <div id="ai-reading-container" className={`w-full max-w-5xl mx-auto px-2 sm:px-4 py-2.5 sm:py-3.5 space-y-2.5 ${readingData ? 'pb-20 sm:pb-24' : ''}`}>
      {/* Top Navigation & Controls Bar: Unified, sleek & zero wasted whitespace */}
      {!readingData ? (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          {/* Left: Compact Title */}
          <div className="flex items-center justify-between md:justify-start gap-2 px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight shrink-0">
                Luyện Đọc Hiểu
              </h1>
            </div>

            {/* Mobile History button */}
            {savedHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                <History className="w-3 h-3 text-indigo-400" />
                <span>Lịch sử ({savedHistory.length})</span>
              </button>
            )}
          </div>

          {/* Center: Source Switcher Tabs */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-950/80 border border-slate-800/90 gap-1 flex-1 max-w-md mx-auto md:mx-0">
            <button
              id="btn-mode-todai"
              type="button"
              onClick={() => setReadingSourceMode('todai')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                readingSourceMode === 'todai'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Báo Todaii</span>
            </button>

            <button
              id="btn-mode-watanoc"
              type="button"
              onClick={() => setReadingSourceMode('watanoc')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                readingSourceMode === 'watanoc'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Tạp chí Watanoc</span>
            </button>

            <button
              id="btn-mode-custom"
              type="button"
              onClick={() => setReadingSourceMode('custom')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                readingSourceMode === 'custom'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <span>Tự nhập</span>
            </button>
          </div>

          {/* Right: Quick Link & History on desktop */}
          <div className="hidden md:flex items-center gap-1.5 px-1 shrink-0">
            {readingSourceMode === 'todai' && (
              <button
                type="button"
                onClick={() => setShowTodaiLinkInput(prev => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  showTodaiLinkInput
                    ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="Dán link bài viết từ Todaii"
              >
                <Globe className="w-3 h-3 text-indigo-400" />
                <span>{showTodaiLinkInput ? 'Đóng link' : '+ Dán link'}</span>
              </button>
            )}

            {readingSourceMode === 'watanoc' && (
              <button
                type="button"
                onClick={() => setShowWatanocLinkInput(prev => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  showWatanocLinkInput
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="Dán link bài viết từ Watanoc"
              >
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>{showWatanocLinkInput ? 'Đóng link' : '+ Dán link'}</span>
              </button>
            )}

            {savedHistory.length > 0 && (
              <button
                id="btn-open-history"
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lịch sử ({savedHistory.length})</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 border border-slate-800/90 shadow-md backdrop-blur-md">
          {/* Left: Change article back button */}
          <button
            id="btn-change-article"
            type="button"
            onClick={() => {
              setReadingData(null);
              setInputText('');
              setUserAnswers({});
              setIsQuizSubmitted(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95 shadow-sm"
            title="Quay lại danh sách hoặc chọn bài khác"
          >
            <ChevronLeft className="w-4 h-4 text-indigo-400" />
            <span>Đổi bài khác</span>
          </button>

          {/* Right: History & Options (Tùy chọn) */}
          <div className="flex items-center gap-2">
            {savedHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lịch sử ({savedHistory.length})</span>
              </button>
            )}

            <button
              id="btn-open-reading-options"
              type="button"
              onClick={() => setIsOptionsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition cursor-pointer shadow-md shadow-indigo-600/30 active:scale-95"
              title="Mở bảng Tùy chọn cài đặt đọc (Furigana, Dịch nghĩa, Từ loại, JLPT, Cỡ chữ...)"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Tùy chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* ERROR NOTICE */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-lg"
        >
          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-semibold text-rose-300">Đã xảy ra lỗi:</strong>
            <p className="mt-0.5 text-rose-200/90">{errorMessage}</p>
          </div>
        </motion.div>
      )}

      {/* VIEW 1: PASSAGE INPUT & CONFIGURATION (When no readingData is active) */}
      {!readingData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Mascot Reading Companion Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1F2639] via-[#1A2035] to-[#121624] border border-[#F4A643]/30 shadow-md flex items-center gap-4">
            <div className="shrink-0">
              <ShibaMascot
                pose="reading"
                size="md"
                animated={false}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F4A643]/20 text-[#F4A643] border border-[#F4A643]/40">
                  読解 Dokkai
                </span>
                <span className="text-xs text-slate-400">Đọc hiểu tiếng Nhật</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                Luyện đọc hiểu cùng Nihon Shiba 📖
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                Khám phá các bài báo Todaii thời sự hoặc văn hóa Nhật Bản từ Watanoc với furigana thông minh, phân tích từ vựng JLPT và trắc nghiệm kiểm tra.
              </p>
            </div>
          </div>

          {/* SUB-VIEW A: TODAII NEWS INTEGRATION */}
          {readingSourceMode === 'todai' && (
            <div className="space-y-3">
              {/* Optional Collapsible Link Input */}
              {showTodaiLinkInput && (
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-lg">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="input-todai-url"
                      type="text"
                      value={todaiInputUrl}
                      onChange={(e) => setTodaiInputUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFetchTodaiUrl();
                      }}
                      placeholder="Dán link https://japanese.todaiinews.com/vi/news/... hoặc mã 32 ký tự..."
                      className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            if (navigator.clipboard && navigator.clipboard.readText) {
                              const clip = await navigator.clipboard.readText();
                              if (clip && clip.trim()) setTodaiInputUrl(clip.trim());
                            }
                          } catch {}
                        }}
                        className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                        title="Dán từ clipboard"
                      >
                        <ClipboardPaste className="w-4 h-4" />
                      </button>
                      <button
                        id="btn-fetch-todai-url"
                        type="button"
                        disabled={isFetchingTodaiArticle || !todaiInputUrl.trim()}
                        onClick={handleFetchTodaiUrl}
                        className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 ${
                          isFetchingTodaiArticle || !todaiInputUrl.trim()
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                        }`}
                      >
                        {isFetchingTodaiArticle ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang tải...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Phân tích AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Todaii Live News Feed Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
                {/* Header & Level / Read Filter in 1 Single Clean Row */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      Bài báo Todaii Easy Japanese
                    </h3>
                  </div>

                  {/* Level Filters + Read Status + Refresh: Unified Single Bar */}
                  <div className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
                    {/* Level Filter */}
                    <div className="flex items-center p-0.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      {(['all', 'N5', 'N4', 'N3', 'N2', 'N1'] as const).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setTodaiFilterLevel(lvl)}
                          className={`px-2 py-0.5 rounded-md text-xs font-bold transition cursor-pointer ${
                            todaiFilterLevel === lvl
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lvl === 'all' ? 'Tất cả' : lvl}
                        </button>
                      ))}
                    </div>

                    {/* Read Status Filter */}
                    <div className="flex items-center p-0.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setTodaiReadFilter('all')}
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                          todaiReadFilter === 'all'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => setTodaiReadFilter('unread')}
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          todaiReadFilter === 'unread'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-amber-300'
                        }`}
                      >
                        <Circle className="w-2 h-2" />
                        <span>Chưa đọc ({todaiReadStats.unread})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTodaiReadFilter('read')}
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          todaiReadFilter === 'read'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-emerald-300'
                        }`}
                      >
                        <CheckCircle2 className="w-2 h-2" />
                        <span>Đã đọc ({todaiReadStats.read})</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchTodaiNews('refresh')}
                      disabled={todaiLoading}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      title="Làm mới bài báo"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${todaiLoading ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
                    </button>
                  </div>
                </div>

                {/* Notification Banner when articles refreshed */}
                <AnimatePresence>
                  {refreshNotification && refreshNotification.source === 'todai' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 text-xs shadow-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-semibold text-white">{refreshNotification.text}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRefreshNotification(null)}
                        className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg hover:bg-indigo-900/40 transition cursor-pointer"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* News Grid */}
                {todaiLoading && todaiNewsList.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">Đang tải danh sách bài báo Todaii News...</p>
                  </div>
                ) : filteredTodaiNews.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <p className="text-sm">Không tìm thấy bài báo nào phù hợp với bộ lọc đã chọn.</p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      {todaiReadFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setTodaiReadFilter('all')}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-indigo-300 hover:bg-slate-700 font-semibold cursor-pointer"
                        >
                          Hiển thị tất cả trạng thái đọc
                        </button>
                      )}
                      {todaiFilterLevel !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setTodaiFilterLevel('all')}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-indigo-300 hover:bg-slate-700 font-semibold cursor-pointer"
                        >
                          Xem tất cả cấp độ
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTodaiNews.map((article, idx) => {
                      const levelColors: Record<string, string> = {
                        N5: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                        N4: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
                        N3: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                        N2: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                        N1: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      };
                      const badgeClass = levelColors[article.jlptLevel] || levelColors.N4;
                      const isRead = isArticleRead(article);

                      return (
                        <div
                          key={`todai-${article.id || article.url || 'news'}-${idx}`}
                          className={`flex flex-col justify-between rounded-2xl border transition-all duration-200 p-4 shadow-md group ${
                            isRead
                              ? 'bg-slate-950/40 hover:bg-slate-950/70 border-emerald-900/30 hover:border-emerald-500/40'
                              : 'bg-slate-950/70 hover:bg-slate-950/95 border-slate-800/90 hover:border-indigo-500/40'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Article Image (if available) */}
                            {article.image && (
                              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-900">
                                <img
                                  src={article.image}
                                  alt={article.titleJp}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${badgeClass} backdrop-blur-md`}>
                                    {article.jlptLevel}
                                  </span>
                                  {article.audio && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                                      <Radio className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Audio MP3</span>
                                    </span>
                                  )}
                                  {isRead ? (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Đã đọc</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
                                      <Circle className="w-2.5 h-2.5 text-amber-400" />
                                      <span>Chưa đọc</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Meta without image */}
                            {!article.image && (
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${badgeClass}`}>
                                    {article.jlptLevel}
                                  </span>
                                  {article.audio && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                      <Radio className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Audio MP3</span>
                                    </span>
                                  )}
                                  {isRead ? (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Đã đọc</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                      <Circle className="w-2.5 h-2.5 text-amber-400" />
                                      <span>Chưa đọc</span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500">{article.date}</span>
                              </div>
                            )}

                            {/* Titles */}
                            <div>
                              <h4 className={`text-sm sm:text-base font-bold transition line-clamp-2 leading-snug font-jp ${
                                isRead ? 'text-slate-300 group-hover:text-emerald-300' : 'text-slate-100 group-hover:text-indigo-300'
                              }`}>
                                {article.titleJp}
                              </h4>
                              {article.titleVi && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                  {article.titleVi}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-800/80">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{article.date || 'Hôm nay'}</span>
                              </span>

                              {/* Toggle Read status button */}
                              <button
                                type="button"
                                onClick={(e) => toggleArticleRead(article, e)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer flex items-center gap-1 ${
                                  isRead
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                                }`}
                                title={isRead ? 'Bấm để đánh dấu Chưa đọc' : 'Bấm để đánh dấu Đã đọc'}
                              >
                                {isRead ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Đã đọc</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-3 h-3 text-slate-500" />
                                    <span>Đánh dấu đã đọc</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={isFetchingTodaiArticle}
                              onClick={() => handleSelectTodaiArticle(article)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold transition cursor-pointer shadow-sm group-hover:translate-x-0.5 ${
                                isRead
                                  ? 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700'
                                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                              }`}
                            >
                              <span>{isRead ? 'Đọc lại' : 'Đọc & Phân tích'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Load More Todaii News Button */}
                    {todaiHasMore && (
                      <div className="pt-2 flex justify-center col-span-1 md:col-span-2">
                        <button
                          type="button"
                          onClick={() => fetchTodaiNews('more')}
                          disabled={todaiLoadingMore}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {todaiLoadingMore ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                              <span>Đang tải thêm bài báo Todaii...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 text-indigo-400" />
                              <span>Tải thêm bài báo tiếp theo (Trang {todaiPage + 1})</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-VIEW B: WATANOC WEB MAGAZINE INTEGRATION */}
          {readingSourceMode === 'watanoc' && (
            <div className="space-y-3">
              {/* Optional Collapsible Link Input */}
              {showWatanocLinkInput && (
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-lg">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="input-watanoc-url"
                      type="text"
                      value={watanocInputUrl}
                      onChange={(e) => setWatanocInputUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFetchWatanocUrl();
                      }}
                      placeholder="Dán link https://watanoc.com/post-... hoặc mã bài..."
                      className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            if (navigator.clipboard && navigator.clipboard.readText) {
                              const clip = await navigator.clipboard.readText();
                              if (clip && clip.trim()) setWatanocInputUrl(clip.trim());
                            }
                          } catch {}
                        }}
                        className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                        title="Dán từ clipboard"
                      >
                        <ClipboardPaste className="w-4 h-4" />
                      </button>
                      <button
                        id="btn-fetch-watanoc-url"
                        type="button"
                        disabled={isFetchingWatanocArticle || !watanocInputUrl.trim()}
                        onClick={handleFetchWatanocUrl}
                        className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 ${
                          isFetchingWatanocArticle || !watanocInputUrl.trim()
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        {isFetchingWatanocArticle ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang tải...</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Đọc bài này</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Watanoc Magazine List & Category Filters */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Bài viết Tạp chí Watanoc</span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => fetchWatanocArticles(watanocFilterLevel, watanocFilterCategory, 'refresh')}
                    disabled={watanocLoading}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                    title="Làm mới bài viết Watanoc"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${watanocLoading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
                  </button>
                </div>

                {/* Notification Banner when Watanoc articles refreshed */}
                <AnimatePresence>
                  {refreshNotification && refreshNotification.source === 'watanoc' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs shadow-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-white">{refreshNotification.text}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRefreshNotification(null)}
                        className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg hover:bg-emerald-900/40 transition cursor-pointer"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Level, Category & Read Filters */}
                <div className="space-y-2">
                  {/* Read Status Filter */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái:</span>
                    <div className="flex items-center p-0.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setWatanocReadFilter('all')}
                        className={`px-2 py-0.5 rounded-md text-xs font-bold transition cursor-pointer ${
                          watanocReadFilter === 'all'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Tất cả ({watanocReadStats.total})
                      </button>
                      <button
                        type="button"
                        onClick={() => setWatanocReadFilter('unread')}
                        className={`px-2 py-0.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          watanocReadFilter === 'unread'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-amber-300'
                        }`}
                      >
                        <Circle className="w-2 h-2" />
                        <span>Chưa đọc ({watanocReadStats.unread})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWatanocReadFilter('read')}
                        className={`px-2 py-0.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          watanocReadFilter === 'read'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-emerald-300'
                        }`}
                      >
                        <CheckCircle2 className="w-2 h-2" />
                        <span>Đã đọc ({watanocReadStats.read})</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trình độ:</span>
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'N5', label: 'N5 (Sơ cấp)' },
                      { id: 'N4', label: 'N4 (Sơ trung)' },
                      { id: 'N3', label: 'N3 (Trung cấp)' },
                      { id: 'listening', label: '🎧 Có Audio' }
                    ].map(lvl => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => {
                          setWatanocFilterLevel(lvl.id);
                          if (lvl.id === 'N5' || lvl.id === 'N4' || lvl.id === 'N3' || lvl.id === 'all') {
                            fetchWatanocArticles(lvl.id, watanocFilterCategory);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-xs font-bold transition cursor-pointer border ${
                          watanocFilterLevel === lvl.id
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chủ đề:</span>
                    {[
                      { id: 'all', label: 'Tất cả chủ đề' },
                      { id: 'meal', label: '🍜 Ẩm thực' },
                      { id: 'sightseeing', label: '⛩️ Du lịch' },
                      { id: 'event', label: '🏮 Lễ hội' },
                      { id: 'culture', label: '🎎 Văn hóa' },
                      { id: 'japan-news', label: '📰 Tin tức' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setWatanocFilterCategory(cat.id);
                          fetchWatanocArticles(watanocFilterLevel, cat.id);
                        }}
                        className={`px-2 py-0.5 rounded-md text-xs font-medium transition cursor-pointer border ${
                          watanocFilterCategory === cat.id
                            ? 'bg-teal-700/80 border-teal-500 text-teal-100 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Article Grid */}
                {watanocLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                    <span className="text-sm font-medium">Đang tải danh sách bài viết từ Watanoc...</span>
                  </div>
                ) : filteredWatanocArticles.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 p-6 space-y-3">
                    <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">Không tìm thấy bài viết nào phù hợp</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Hãy thay đổi bộ lọc trạng thái đọc, phân loại hoặc dán link bài viết trực tiếp từ watanoc.com
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      {watanocReadFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setWatanocReadFilter('all')}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-emerald-300 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
                        >
                          Hiển thị tất cả bài
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setWatanocFilterLevel('all');
                          setWatanocFilterCategory('all');
                          setWatanocReadFilter('all');
                          fetchWatanocArticles('all', 'all');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-600 transition cursor-pointer"
                      >
                        Đặt lại tất cả bộ lọc
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredWatanocArticles.map((article, idx) => {
                      const levelColors: Record<string, string> = {
                        N5: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                        N4: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
                        N3: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                        All: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      };
                      const badgeClass = levelColors[article.level] || levelColors.N4;
                      const isRead = isArticleRead(article);

                      return (
                        <div
                          key={`watanoc-${article.id || article.url || 'mag'}-${idx}`}
                          className={`flex flex-col justify-between rounded-2xl border transition-all duration-200 p-4 shadow-md group ${
                            isRead
                              ? 'bg-slate-950/40 hover:bg-slate-950/70 border-emerald-900/30 hover:border-emerald-500/40'
                              : 'bg-slate-950/60 hover:bg-slate-950/90 border-slate-800/90 hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Article Image */}
                            {article.image && (
                              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-900">
                                <img
                                  src={article.image}
                                  alt={article.titleJp}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${badgeClass} backdrop-blur-md`}>
                                    {article.level}
                                  </span>
                                  {article.hasAudio && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                                      <Radio className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Audio MP3</span>
                                    </span>
                                  )}
                                  {isRead ? (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Đã đọc</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
                                      <Circle className="w-2.5 h-2.5 text-amber-400" />
                                      <span>Chưa đọc</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Meta without image */}
                            {!article.image && (
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${badgeClass}`}>
                                    {article.level}
                                  </span>
                                  {article.hasAudio && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                      <Radio className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Audio MP3</span>
                                    </span>
                                  )}
                                  {isRead ? (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Đã đọc</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                      <Circle className="w-2.5 h-2.5 text-amber-400" />
                                      <span>Chưa đọc</span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500">{article.date}</span>
                              </div>
                            )}

                            {/* Titles & Snippet */}
                            <div>
                              <h4 className={`text-sm sm:text-base font-bold transition line-clamp-2 leading-snug font-jp ${
                                isRead ? 'text-slate-300 group-hover:text-emerald-300' : 'text-slate-100 group-hover:text-emerald-300'
                              }`}>
                                {article.titleJp}
                              </h4>
                              {article.titleSub && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                                  {article.titleSub}
                                </p>
                              )}
                              {article.snippet && (
                                <p className="text-xs text-slate-400/90 mt-1.5 line-clamp-2 leading-relaxed font-jp">
                                  {article.snippet}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-800/80">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{article.date || 'Watanoc.com'}</span>
                              </span>

                              {/* Toggle Read status button */}
                              <button
                                type="button"
                                onClick={(e) => toggleArticleRead(article, e)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer flex items-center gap-1 ${
                                  isRead
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                                }`}
                                title={isRead ? 'Bấm để đánh dấu Chưa đọc' : 'Bấm để đánh dấu Đã đọc'}
                              >
                                {isRead ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Đã đọc</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-3 h-3 text-slate-500" />
                                    <span>Đánh dấu đã đọc</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={isFetchingWatanocArticle}
                              onClick={() => handleSelectWatanocArticle(article)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold transition cursor-pointer shadow-sm group-hover:translate-x-0.5 ${
                                isRead
                                  ? 'bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700'
                                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                              }`}
                            >
                              <span>{isRead ? 'Đọc lại' : 'Đọc & Soạn bài'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Load More Watanoc Articles Button */}
                    {watanocHasMore && (
                      <div className="pt-2 flex justify-center col-span-1 md:col-span-2">
                        <button
                          type="button"
                          onClick={() => fetchWatanocArticles(watanocFilterLevel, watanocFilterCategory, 'more')}
                          disabled={watanocLoadingMore}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {watanocLoadingMore ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                              <span>Đang tải thêm bài viết Watanoc...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 text-emerald-400" />
                              <span>Tải thêm bài viết tiếp theo (Trang {watanocPage + 1})</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-VIEW B: CUSTOM / PASTED PASSAGE INPUT */}
          {readingSourceMode === 'custom' && (
            <div className="space-y-3">
              {/* Sample Passages Bar */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hoặc chọn bài viết mẫu tiếng Nhật thử nghiệm:</span>
                  </span>
                  <span className="text-[10px] text-slate-500">1-click để nạp văn bản</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                  {SAMPLE_PASSAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      id={`sample-passage-${sample.level.toLowerCase()}`}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className="flex flex-col items-start text-left p-2.5 rounded-lg bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-800/80 hover:border-indigo-500/50 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {sample.level}
                        </span>
                        <span className="text-[10px] text-slate-400">{sample.genre}</span>
                      </div>
                      <strong className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                        {sample.title}
                      </strong>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-jp">
                        {sample.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Input Textarea Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-slate-800/80">
                  <label htmlFor="custom-passage-textarea" className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Bài viết tiếng Nhật cần phân tích:</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <button
                      id="btn-paste-clipboard"
                      type="button"
                      onClick={handlePasteClipboard}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer border border-slate-700/80"
                      title="Dán từ clipboard"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dán văn bản</span>
                    </button>

                    {inputText && (
                      <button
                        id="btn-clear-text"
                        type="button"
                        onClick={() => setInputText('')}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-medium transition cursor-pointer border border-slate-700/80"
                        title="Xóa văn bản"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Input Textarea */}
                <div className="relative">
                  <textarea
                    id="custom-passage-textarea"
                    rows={5}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Dán hoặc nhập đoạn văn bản tiếng Nhật tại đây... (Ví dụ: tin tức NHK Easy, bài đọc sách Minna/Soumatome/Shinkanzen, đoạn văn trong đề thi JLPT, bài luận, thư từ, thông báo công ty...)"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-jp leading-relaxed resize-y transition shadow-inner"
                  />
                </div>

                {/* Live Metrics */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 flex-wrap gap-2">
                  <div className="flex items-center gap-3 font-medium text-[11px]">
                    <span>Số ký tự: <strong className="text-indigo-300 font-semibold">{textStats.charCount}</strong></span>
                    <span>Chữ Hán: <strong className="text-amber-300 font-semibold">{textStats.kanjiCount}</strong></span>
                    <span>Số câu ước tính: <strong className="text-cyan-300 font-semibold">{textStats.sentenceCount}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-500 italic">
                    Khuyến nghị: Từ 30 đến 400 ký tự
                  </span>
                </div>

                {/* Options Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5 border-t border-slate-800/80">
                  {/* JLPT Level Target */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Trình độ JLPT mục tiêu:</span>
                    </label>
                    <div className="grid grid-cols-6 gap-1">
                      {(['auto', 'N5', 'N4', 'N3', 'N2', 'N1'] as const).map(lvl => (
                        <button
                          key={lvl}
                          id={`level-option-${lvl.toLowerCase()}`}
                          type="button"
                          onClick={() => setSelectedLevel(lvl)}
                          className={`py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                            selectedLevel === lvl
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {lvl === 'auto' ? 'Auto' : lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count Target */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Số lượng câu hỏi cần soạn:</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[2, 3, 4, 5].map(count => (
                        <button
                          key={count}
                          id={`question-count-${count}`}
                          type="button"
                          onClick={() => setQuestionCount(count)}
                          className={`py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                            questionCount === count
                              ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {count} câu
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Analyze Button */}
                <div className="pt-1">
                  <button
                    id="btn-analyze-passage-submit"
                    type="button"
                    disabled={isAnalyzing || !inputText.trim()}
                    onClick={handleAnalyzePassage}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                      isAnalyzing || !inputText.trim()
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-indigo-600/30 border border-indigo-400/30'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                        <span>{analysisStep || 'Đang phân tích bài đọc & soạn câu hỏi...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Phân tích & Soạn câu hỏi đọc hiểu ngay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* VIEW 2: PASSAGE RESULTS & ANALYSIS VIEW (When readingData is ready) */}
      {readingData && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Passage Overview Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
            {/* Article Image Banner (If available from Todaii News) */}
            {readingData.imageUrl && (
              <div className="relative w-full h-44 sm:h-64 rounded-2xl overflow-hidden border border-slate-800 shadow-md group">
                <img
                  src={readingData.imageUrl}
                  alt={readingData.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-white truncate drop-shadow text-sm sm:text-base">
                    {readingData.title}
                  </span>
                  {readingData.sourceUrl && (
                    <a
                      href={readingData.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold shrink-0 backdrop-blur-md transition shadow-md"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Xem báo gốc</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Header Meta, Title & Action Toolbar */}
            <div className="space-y-3.5 pb-4 border-b border-slate-800">
              {/* Badges & Source Meta */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  JLPT {readingData.level || 'Đọc hiểu'}
                </span>
                {readingData.sourceName && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
                    readingData.sourceName.includes('Watanoc')
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}>
                    {readingData.sourceName.includes('Watanoc') ? (
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>{readingData.sourceName}</span>
                  </span>
                )}
                {readingData.sourceUrl && (
                  <a
                    href={readingData.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition shrink-0"
                    title="Mở liên kết bài viết gốc"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>Bài gốc</span>
                  </a>
                )}
                {readingData.passageType && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {readingData.passageType}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/50">
                  {readingData.sentenceBreakdown?.length || 0} câu
                </span>
              </div>

              {/* Title & Translation (Takes full width, never crushed into vertical column) */}
              <div className="space-y-1.5 w-full">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug tracking-tight font-jp break-words">
                  {readingData.title}
                </h2>
                {readingData.titleVi && (
                  <p className="text-sm sm:text-base font-medium text-slate-300/90 italic leading-relaxed break-words">
                    {readingData.titleVi}
                  </p>
                )}
              </div>

              {/* Quick Actions Bar - Streamlined & Minimal */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Read / Unread Status Toggle Button */}
                  {(() => {
                    const isRead = isArticleRead(readingData);
                    return (
                      <button
                        id="btn-toggle-read-status"
                        type="button"
                        onClick={(e) => toggleArticleRead(readingData, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-95 ${
                          isRead
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-300'
                        }`}
                        title={isRead ? 'Đang ở trạng thái Đã đọc (Bấm để chuyển thành Chưa đọc)' : 'Bấm để đánh dấu Đã đọc'}
                      >
                        {isRead ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{isRead ? 'Đã đọc' : 'Đánh dấu đã đọc'}</span>
                      </button>
                    );
                  })()}

                  {/* Primary "Tùy chọn" Settings Button - Centralized reading settings */}
                  <button
                    id="btn-article-options"
                    type="button"
                    onClick={() => setIsOptionsModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-600/30 active:scale-95"
                    title="Mở cài đặt đọc (Furigana, Dịch nghĩa, Từ loại, JLPT, Cỡ chữ, Karaoke...)"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Tùy chọn đọc</span>
                    <span className="text-[10px] text-indigo-200/90 hidden sm:inline">
                      ({showFurigana ? 'Furi: Bật' : 'Furi: Tắt'} • {showVietnamese ? 'Dịch: Hiện' : 'Dịch: Ẩn'})
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Text Button */}
                  <button
                    id="btn-copy-passage"
                    type="button"
                    onClick={handleCopyPassage}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
                    title="Sao chép văn bản tiếng Nhật"
                  >
                    {copyFeedback ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Native Todaii / Watanoc Studio MP3 Audio Player - Streamlined 1-row layout */}
            {readingData.audioUrl && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 shadow-md">
                <audio
                  ref={todaiAudioRef}
                  src={readingData.audioUrl}
                  onTimeUpdate={() => {
                    if (todaiAudioRef.current) {
                      setTodaiAudioCurrentTime(todaiAudioRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (todaiAudioRef.current) {
                      setTodaiAudioDuration(todaiAudioRef.current.duration);
                    }
                  }}
                  onEnded={() => setTodaiAudioPlaying(false)}
                  onPlay={() => setTodaiAudioPlaying(true)}
                  onPause={() => setTodaiAudioPlaying(false)}
                  preload="metadata"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  {/* Left: Play/Pause, Skip & Time */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSkipTodaiAudio(-5)}
                      className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700 transition"
                      title="Lùi 5 giây"
                    >
                      -5s
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleTodaiAudio}
                      className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition cursor-pointer shrink-0"
                      title={todaiAudioPlaying ? 'Tạm dừng' : 'Phát giọng đọc'}
                    >
                      {todaiAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSkipTodaiAudio(5)}
                      className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700 transition"
                      title="Tua tới 5 giây"
                    >
                      +5s
                    </button>

                    <span className="text-[11px] text-slate-300 font-mono pl-1">
                      {Math.floor(todaiAudioCurrentTime / 60)}:{(Math.floor(todaiAudioCurrentTime % 60)).toString().padStart(2, '0')} / {Math.floor((todaiAudioDuration || 0) / 60)}:{(Math.floor((todaiAudioDuration || 0) % 60)).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Center: Scrubber Progress Slider */}
                  <div className="flex-1 flex items-center px-1">
                    <input
                      type="range"
                      min={0}
                      max={todaiAudioDuration || 100}
                      value={todaiAudioCurrentTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (todaiAudioRef.current) {
                          todaiAudioRef.current.currentTime = val;
                          setTodaiAudioCurrentTime(val);
                        }
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition"
                      title="Kéo để tua nhanh"
                    />
                  </div>

                  {/* Right: Compact Speed Selector & Audio Badge */}
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-800">
                      {[0.8, 1.0, 1.25].map(spd => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => handleChangeTodaiSpeed(spd)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            todaiAudioSpeed === spd
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <span className="hidden md:inline-flex px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      MP3 Bản xứ
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* POS (Part of Speech) Legend & Filter: Sleek & Compact */}
            {showPosHighlight && (
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl px-3.5 py-2 shadow-sm text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300 mr-1">
                    <Palette className="w-3.5 h-3.5 text-sky-400" />
                    <span>Từ loại:</span>
                  </div>

                  {/* Danh từ Badge / Filter */}
                  <button
                    type="button"
                    onClick={() => setSelectedPosFilter(prev => prev === 'noun' ? null : 'noun')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer border active:scale-95 ${
                      selectedPosFilter === 'noun'
                        ? 'bg-sky-500/30 text-sky-200 border-sky-400 ring-2 ring-sky-400/40 shadow-sm'
                        : 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
                    }`}
                    title="Bấm để lọc Danh từ trong bài đọc"
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                    <span>Danh từ</span>
                    {posStats.nouns > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-sky-400/20 text-sky-200 text-[10px] font-mono border border-sky-400/30">
                        {posStats.nouns}
                      </span>
                    )}
                  </button>

                  {/* Động từ Badge / Filter */}
                  <button
                    type="button"
                    onClick={() => setSelectedPosFilter(prev => prev === 'verb' ? null : 'verb')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer border active:scale-95 ${
                      selectedPosFilter === 'verb'
                        ? 'bg-orange-500/30 text-orange-200 border-orange-400 ring-2 ring-orange-400/40 shadow-sm'
                        : 'bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20'
                    }`}
                    title="Bấm để lọc Động từ trong bài đọc"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]" />
                    <span>Động từ</span>
                    {posStats.verbs > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-orange-400/20 text-orange-200 text-[10px] font-mono border border-orange-400/30">
                        {posStats.verbs}
                      </span>
                    )}
                  </button>

                  {/* Tính từ Badge / Filter */}
                  <button
                    type="button"
                    onClick={() => setSelectedPosFilter(prev => prev === 'adjective' ? null : 'adjective')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer border active:scale-95 ${
                      selectedPosFilter === 'adjective'
                        ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                    title="Bấm để lọc Tính từ trong bài đọc"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <span>Tính từ</span>
                    {posStats.adjectives > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-mono border border-emerald-400/30">
                        {posStats.adjectives}
                      </span>
                    )}
                  </button>

                  {selectedPosFilter && (
                    <button
                      type="button"
                      onClick={() => setSelectedPosFilter(null)}
                      className="text-xs text-indigo-300 hover:text-indigo-200 underline cursor-pointer ml-1"
                    >
                      Xoá lọc
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsOptionsModalOpen(true)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
                  <span>Cài đặt hiển thị</span>
                </button>
              </div>
            )}

            {/* Reading Passage Container */}
            {readingData.audioUrl && readingFollowMode === 'karaoke' ? (
              <div className="relative bg-[#18181b] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-lg space-y-5">
                {/* Floating Purple Drawer Button on Right Edge (matches Todaii reference image) */}
                <button
                  type="button"
                  onClick={() => {
                    const targetLvl = selectedJlptFilter || 'N5';
                    setActiveLevelWordsDrawer(targetLvl);
                  }}
                  className="absolute -right-3 top-28 w-7 h-11 bg-[#6d44c9] hover:bg-[#5e38a8] text-white rounded-l-xl shadow-lg flex items-center justify-center transition cursor-pointer z-20 group"
                  title="Bảng từ vựng JLPT / cấp độ"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                </button>

                <AudioFollowReader
                  japanesePassage={readingData.japanesePassage}
                  furiganaPassage={readingData.furiganaPassage}
                  vietnamesePassage={readingData.vietnamesePassage}
                  sentenceBreakdown={readingData.sentenceBreakdown}
                  audioMarks={readingData.audioMarks}
                  currentTime={todaiAudioCurrentTime}
                  duration={todaiAudioDuration}
                  isPlaying={todaiAudioPlaying}
                  showFurigana={showFurigana}
                  showVietnamese={showVietnamese}
                  fontSize={fontSize}
                  autoScroll={autoScrollAudioText}
                  onSeek={(seconds) => {
                    if (todaiAudioRef.current) {
                      todaiAudioRef.current.currentTime = seconds;
                      setTodaiAudioCurrentTime(seconds);
                      todaiAudioRef.current.play().then(() => setTodaiAudioPlaying(true)).catch(() => {});
                    }
                  }}
                  onToggleAutoScroll={() => setAutoScrollAudioText(prev => !prev)}
                  onWordClick={(info) => setClickedWordInfo(info)}
                  posMap={posMap}
                  vocabularyList={readingData.vocabularyList}
                  showPosHighlight={showPosHighlight}
                />

                {/* JLPT Stats Bar (Exact Todaii match) */}
                <div className="pt-4 border-t border-zinc-800">
                  <JlptStatsBar
                    stats={readingData.jlptStats}
                    sourceName={readingData.sourceName}
                    sourceUrl={readingData.sourceUrl}
                    selectedFilter={selectedJlptFilter}
                    onSelectFilter={setSelectedJlptFilter}
                    onOpenLevelWordsModal={(lvl) => setActiveLevelWordsDrawer(lvl)}
                    articleTitle={readingData.title}
                  />
                </div>
              </div>
            ) : (
              <div className="relative bg-[#18181b] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-lg select-text space-y-6">
                {/* Floating Purple Drawer Button on Right Edge (matches Todaii reference image) */}
                <button
                  type="button"
                  onClick={() => {
                    const targetLvl = selectedJlptFilter || 'N5';
                    setActiveLevelWordsDrawer(targetLvl);
                  }}
                  className="absolute -right-3 top-28 w-7 h-11 bg-[#6d44c9] hover:bg-[#5e38a8] text-white rounded-l-xl shadow-lg flex items-center justify-center transition cursor-pointer z-20 group"
                  title="Bảng từ vựng JLPT / cấp độ"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                </button>

                <JlptUnderlineArticle
                  rawTokens={readingData.rawTokens}
                  japanesePassage={readingData.japanesePassage}
                  furiganaPassage={readingData.furiganaPassage}
                  vocabularyList={readingData.vocabularyList}
                  usedGrammar={readingData.usedGrammar}
                  levelWords={readingData.levelWords}
                  showFurigana={showFurigana}
                  showJlptUnderline={showJlptUnderline}
                  selectedJlptFilter={selectedJlptFilter}
                  fontSize={fontSize === 'md' ? 'base' : fontSize}
                  onWordClick={(info) => setClickedWordInfo(info)}
                  posMap={posMap}
                  showPosHighlight={showPosHighlight}
                  selectedPosFilter={selectedPosFilter}
                />

                {/* JLPT Stats Bar (Exact Todaii match) */}
                <div className="pt-4 border-t border-zinc-800">
                  <JlptStatsBar
                    stats={readingData.jlptStats}
                    sourceName={readingData.sourceName}
                    sourceUrl={readingData.sourceUrl}
                    selectedFilter={selectedJlptFilter}
                    onSelectFilter={setSelectedJlptFilter}
                    onOpenLevelWordsModal={(lvl) => setActiveLevelWordsDrawer(lvl)}
                    articleTitle={readingData.title}
                  />
                </div>
              </div>
            )}

            {/* Vietnamese Translation Accordion */}
            {showVietnamese && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-5 space-y-2 text-sm sm:text-base text-slate-200 leading-relaxed shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Bản dịch nghĩa tiếng Việt toàn bài:</span>
                </div>
                <p className="whitespace-pre-line font-medium text-amber-100/90">
                  {readingData.vietnamesePassage}
                </p>
              </motion.div>
            )}
          </div>

          {/* Navigation Tabs Bar for Analysis */}
          <div className="flex items-center justify-start border-b border-slate-800 pb-1 gap-2 overflow-x-auto no-scrollbar">
            <button
              id="tab-reading-quiz"
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Câu hỏi & Giải thích ({readingData.quizzes?.length || 0})</span>
            </button>

            <button
              id="tab-reading-vocab"
              type="button"
              onClick={() => setActiveTab('vocab')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer whitespace-nowrap ${
                activeTab === 'vocab'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Phân tích Từ vựng ({readingData.vocabularyList?.length || 0})</span>
            </button>

            <button
              id="tab-reading-grammar"
              type="button"
              onClick={() => setActiveTab('grammar')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer whitespace-nowrap ${
                activeTab === 'grammar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Phân tích Ngữ pháp ({readingData.usedGrammar?.length || 0})</span>
            </button>

            <button
              id="tab-reading-sentences"
              type="button"
              onClick={() => setActiveTab('sentences')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer whitespace-nowrap ${
                activeTab === 'sentences'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>Dịch từng câu ({readingData.sentenceBreakdown?.length || 0})</span>
            </button>
          </div>

          {/* TAB CONTENT: 1. QUIZZES & DETAILED EXPLANATIONS */}
          {activeTab === 'quiz' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Score banner if submitted */}
              {isQuizSubmitted && quizScore && (
                <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg ${
                  quizScore.percentage >= 70
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                    : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                }`}>
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <ShibaMascot
                      pose={quizScore.percentage >= 80 ? 'celebrating' : quizScore.percentage >= 60 ? 'joy' : 'encourage'}
                      size="sm"
                      animated={true}
                    />
                    <div>
                      <strong className="text-base font-bold text-white block">
                        Kết quả đọc hiểu: Đúng {quizScore.correct}/{quizScore.total} câu ({quizScore.percentage}%)
                      </strong>
                      <span className="text-xs text-slate-300">
                        {quizScore.percentage === 100
                          ? 'Xuất sắc! Nihon Shiba rất khâm phục bạn, không sai một câu nào!'
                          : quizScore.percentage >= 60
                          ? 'Làm tốt lắm! Hãy đọc kỹ phần giải thích chi tiết dưới đây để hiểu sâu các bẫy đề thi.'
                          : 'Đừng lo lắng nhé! Nihon Shiba cùng bạn xem lại từng câu giải thích để nắm chắc kiến thức.'}
                      </span>
                    </div>
                  </div>

                  <button
                    id="btn-quiz-retry"
                    type="button"
                    onClick={handleResetQuiz}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại trắc nghiệm</span>
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-5">
                {readingData.quizzes.map((quiz, qIdx) => {
                  const isAnswered = userAnswers[qIdx] !== undefined;
                  const isCorrect = userAnswers[qIdx] === quiz.correctIndex;
                  const showExp = showExplanations[qIdx] || isQuizSubmitted;

                  return (
                    <div
                      key={qIdx}
                      id={`quiz-question-card-${qIdx}`}
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4"
                    >
                      {/* Question Header & Type */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-extrabold text-sm">
                            {qIdx + 1}
                          </span>
                          {quiz.questionType && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {quiz.questionTypeVn || quiz.questionType}
                            </span>
                          )}
                        </div>

                        {/* Tips indicator */}
                        {quiz.tips && (
                          <span className="text-[11px] text-amber-400 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-800/40 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-400" />
                            <span>Mẹo JLPT</span>
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <div className="text-base sm:text-lg font-bold text-white font-jp leading-relaxed">
                        {quiz.question}
                      </div>

                      {/* Tips Content if available */}
                      {quiz.tips && (
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-400 font-semibold">Mẹo giải nhanh: </strong>
                            <span>{quiz.tips}</span>
                          </div>
                        </div>
                      )}

                      {/* Options Grid (4 options) */}
                      <div className="grid grid-cols-1 gap-2.5 pt-1">
                        {quiz.options.map((opt, oIdx) => {
                          const isSelected = userAnswers[qIdx] === oIdx;
                          const isTheCorrectOption = quiz.correctIndex === oIdx;

                          let optionClass = 'bg-slate-950/60 border-slate-800/80 text-slate-200 hover:bg-slate-800 hover:border-slate-700';

                          if (isQuizSubmitted) {
                            if (isTheCorrectOption) {
                              optionClass = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-sm';
                            } else if (isSelected) {
                              optionClass = 'bg-rose-950/40 border-rose-500/80 text-rose-200';
                            } else {
                              optionClass = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                            }
                          } else if (isSelected) {
                            optionClass = 'bg-indigo-600/20 border-indigo-500 text-indigo-100 shadow-sm shadow-indigo-600/20';
                          }

                          return (
                            <button
                              key={oIdx}
                              id={`quiz-${qIdx}-option-${oIdx}`}
                              type="button"
                              disabled={isQuizSubmitted}
                              onClick={() => handleSelectOption(qIdx, oIdx)}
                              className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 cursor-pointer ${optionClass}`}
                            >
                              <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                                isQuizSubmitted && isTheCorrectOption
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : isQuizSubmitted && isSelected
                                  ? 'bg-rose-500 text-white border-rose-400'
                                  : isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-400'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="text-sm font-jp leading-relaxed flex-1 pt-0.5">
                                {opt}
                              </span>
                              {isQuizSubmitted && isTheCorrectOption && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              {isQuizSubmitted && isSelected && !isTheCorrectOption && (
                                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation toggle & content */}
                      {showExp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 pt-3 border-t border-slate-800 space-y-2 bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 text-xs sm:text-sm text-indigo-100 leading-relaxed"
                        >
                          <div className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-wider text-xs">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span>Giải thích chi tiết & Phân tích đáp án:</span>
                          </div>
                          <p className="whitespace-pre-line text-slate-200">
                            {quiz.explanation}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Submit Quiz */}
              {!isQuizSubmitted && (
                <div className="pt-2">
                  <button
                    id="btn-submit-reading-quiz"
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(userAnswers).length === 0}
                    className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition cursor-pointer shadow-xl ${
                      Object.keys(userAnswers).length === 0
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      Kiểm tra kết quả & Xem giải thích chi tiết ({Object.keys(userAnswers).length}/{readingData.quizzes.length} câu đã chọn)
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB CONTENT: 2. VOCABULARY ANALYSIS */}
          {activeTab === 'vocab' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>Từ vựng trọng tâm & Từ khó trong bài ({readingData.vocabularyList?.length || 0}):</span>
                </div>
                <span className="text-xs text-slate-400">Nhấn biểu tượng loa để nghe phát âm</span>
              </div>

              {(!readingData.vocabularyList || readingData.vocabularyList.length === 0) ? (
                <p className="text-slate-400 text-sm italic">Không có danh sách từ vựng bổ sung cho đoạn văn này.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {readingData.vocabularyList.map((vocab, idx) => (
                    <div
                      key={idx}
                      id={`vocab-item-${idx}`}
                      className="bg-slate-950/60 border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-4 space-y-2 transition shadow-sm group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-2 font-jp flex-wrap">
                          <strong className="text-amber-300 font-bold text-base sm:text-lg">{vocab.kanji}</strong>
                          <span className="text-slate-400 text-xs sm:text-sm">({vocab.hiragana})</span>
                          {vocab.hanViet && (
                            <span className="text-[10px] text-purple-300 font-semibold bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-800/40">
                              {vocab.hanViet}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => speakJapanese(vocab.kanji || vocab.hiragana)}
                          className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-300 transition cursor-pointer"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                        <span className="text-slate-200 font-medium">{vocab.meaning}</span>
                        {vocab.sourceLesson && (
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                            {vocab.sourceLesson}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB CONTENT: 3. GRAMMAR ANALYSIS */}
          {activeTab === 'grammar' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Cấu trúc ngữ pháp ứng dụng trong bài ({readingData.usedGrammar?.length || 0}):</span>
                </div>
                <span className="text-xs text-slate-400">Phân tích cách dùng thực tế trong câu</span>
              </div>

              {(!readingData.usedGrammar || readingData.usedGrammar.length === 0) ? (
                <p className="text-slate-400 text-sm italic">Không có danh sách ngữ pháp chi tiết cho đoạn văn này.</p>
              ) : (
                <div className="space-y-3">
                  {readingData.usedGrammar.map((grammar, idx) => (
                    <div
                      key={idx}
                      id={`grammar-item-${idx}`}
                      className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-2.5 transition shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <strong className="text-cyan-300 font-bold text-base sm:text-lg font-jp">
                            {grammar.structure}
                          </strong>
                        </div>
                        {grammar.sourceLesson && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                            {grammar.sourceLesson}
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-slate-200 font-medium">
                        <span className="text-slate-400">Ý nghĩa: </span>
                        <span>{grammar.meaning}</span>
                      </div>

                      {grammar.usageInPassage && (
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 font-jp leading-relaxed">
                          <strong className="text-amber-300 font-semibold block mb-1">Cách dùng thực tế trong bài đọc:</strong>
                          <p className="text-slate-200">{grammar.usageInPassage}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB CONTENT: 4. SENTENCE-BY-SENTENCE BREAKDOWN */}
          {activeTab === 'sentences' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
                  <MessageSquareQuote className="w-4 h-4 text-indigo-400" />
                  <span>Dịch nghĩa & Đánh dấu Furigana từng câu ({readingData.sentenceBreakdown?.length || 0}):</span>
                </div>
                <span className="text-xs text-slate-400">Nghe từng câu độc lập</span>
              </div>

              <div className="space-y-3">
                {readingData.sentenceBreakdown?.map((item, idx) => (
                  <div
                    key={idx}
                    id={`sentence-row-${idx}`}
                    className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-3 transition shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                          {idx + 1}
                        </span>
                        <div className="text-base sm:text-lg font-jp leading-relaxed text-slate-100 flex-1">
                          <JapaneseFuriganaText
                            sentence={item.furigana || item.japanese}
                            showFurigana={showFurigana}
                            size="lg"
                            forceDark={true}
                            textClassName="text-slate-100"
                            kanjiClassName="text-white font-bold"
                            furiganaClassName="text-[#43EEF7]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlaySentenceAudio(item.japanese, idx)}
                        className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                          activeSentenceIndex === idx
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                        }`}
                        title="Nghe câu này"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs sm:text-sm text-amber-200/90 bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 pl-4 leading-relaxed">
                      <strong className="text-amber-400 text-xs uppercase mr-2 font-semibold">Dịch nghĩa:</strong>
                      <span>{item.vietnamese}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Lịch sử bài viết đã phân tích</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {savedHistory.length === 0 ? (
                  <p className="text-slate-400 text-center py-8 text-sm">Chưa có bài đọc nào trong lịch sử.</p>
                ) : (
                  savedHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/50 transition flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {item.level || 'JLPT'}
                          </span>
                          <strong className="text-sm text-white font-semibold line-clamp-1">{item.title}</strong>
                        </div>
                        <p className="text-xs text-slate-400 font-jp line-clamp-2 leading-relaxed">
                          {item.japanesePassage}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setReadingData(item);
                            setUserAnswers({});
                            setShowExplanations({});
                            setIsQuizSubmitted(false);
                            setShowHistoryModal(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Mở lại
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSavedHistory(prev => {
                              const next = prev.filter((_, i) => i !== idx);
                              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
                              return next;
                            });
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                          title="Xóa bài này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FIXED FLOATING BOTTOM TOOLBAR (Matching Todaii screenshot: Câu hỏi | Tùy chọn | Ngữ pháp | Cấp độ JLPT | Nộp bài) */}
      {readingData && (
        <ReadingBottomToolbar
          showFurigana={showFurigana}
          onToggleFurigana={() => setShowFurigana(prev => !prev)}
          showJlptUnderline={showJlptUnderline}
          onToggleJlptUnderline={() => setShowJlptUnderline(prev => !prev)}
          showPosHighlight={showPosHighlight}
          onTogglePosHighlight={() => setShowPosHighlight(prev => !prev)}
          onOpenGrammarModal={() => setIsGrammarModalOpen(true)}
          onOpenOptionsModal={() => setIsOptionsModalOpen(true)}
          onScrollToQuestions={() => {
            setActiveTab('quiz');
            const el = document.getElementById('tab-reading-quiz');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onSubmitQuiz={readingData.quizzes && readingData.quizzes.length > 0 ? handleSubmitQuiz : undefined}
          isQuizSubmitted={isQuizSubmitted}
          totalQuestions={readingData.quizzes?.length || 0}
          answeredCount={Object.keys(userAnswers).length}
          hasGrammar={!!readingData.usedGrammar && readingData.usedGrammar.length > 0}
        />
      )}

      {/* UNIFIED READING OPTIONS MODAL (Centralized all toggles: Furigana, Translation, Font size, POS, JLPT, Audio, Karaoke, Copy) */}
      <ReadingOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        showFurigana={showFurigana}
        onToggleFurigana={() => setShowFurigana(prev => !prev)}
        showVietnamese={showVietnamese}
        onToggleVietnamese={() => setShowVietnamese(prev => !prev)}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        showPosHighlight={showPosHighlight}
        onTogglePosHighlight={() => setShowPosHighlight(prev => !prev)}
        showJlptUnderline={showJlptUnderline}
        onToggleJlptUnderline={() => setShowJlptUnderline(prev => !prev)}
        hasAudio={Boolean(readingData?.audioUrl)}
        readingFollowMode={readingFollowMode}
        onToggleFollowMode={() => setReadingFollowMode(prev => prev === 'karaoke' ? 'classic' : 'karaoke')}
        autoScrollAudioText={autoScrollAudioText}
        onToggleAutoScroll={() => setAutoScrollAudioText(prev => !prev)}
        isPlayingAudio={isPlayingAudio}
        onToggleAudioTTS={handleToggleAudio}
        onCopyPassage={handleCopyPassage}
        copyFeedback={copyFeedback}
      />

      {/* WORD QUICK DETAIL MODAL */}
      <JlptWordDetailModal
        wordInfo={clickedWordInfo}
        onClose={() => setClickedWordInfo(null)}
        onSaveVocab={(word) => {
          updateProfile({
            vocabStatus: {
              ...(userProfile.vocabStatus || {}),
              [word]: 'learning'
            }
          });
        }}
      />

      {/* JLPT LEVEL WORDS DRAWER MODAL */}
      <JlptLevelWordsDrawer
        level={activeLevelWordsDrawer}
        levelWords={readingData?.levelWords}
        vocabularyList={readingData?.vocabularyList}
        onClose={() => setActiveLevelWordsDrawer(null)}
        onSelectWord={(word) => {
          setActiveLevelWordsDrawer(null);
          const v = readingData?.vocabularyList?.find(item => item.word === word || item.kanji === word);
          setClickedWordInfo({
            word,
            furigana: v?.reading,
            jlpt: (v?.level as any) || activeLevelWordsDrawer,
            meaning: v?.meaning
          });
        }}
      />

      {/* GRAMMAR POINTS MODAL */}
      <ReadingGrammarModal
        isOpen={isGrammarModalOpen}
        onClose={() => setIsGrammarModalOpen(false)}
        grammarList={readingData?.usedGrammar || []}
      />
    </div>
  );
}
