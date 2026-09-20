/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { UserProfile, JLPTLevel } from './types';
import { useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import { ParticleCelebration, ParticleCelebrationRef } from './components/ParticleCelebration';
import { playMilestoneChime } from './utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Loader2, BookOpen, Layers, Compass, Languages, Menu } from 'lucide-react';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import VocabFloatingNotifier from './components/VocabFloatingNotifier';
import MobileBottomNav from './components/MobileBottomNav';
import { checkAndTriggerReminder, getDefaultReminderSettings } from './utils/notifications';
import { calculateEarnedXp, getPlayerLevelInfo } from './utils/xpSystem';
import { lazyWithRetry, AppErrorBoundary } from './utils/lazyWithRetry';
import VocabularyPractice from './components/VocabularyPractice';
import NotFoundPage from './components/NotFoundPage';
import { BRAND_NAME } from './constants/brand';
import { getTabFromPathname, TAB_TO_ROUTE_MAP, getRoutePageTitle } from './routes/routesConfig';

import AdminRoute from './components/AdminRoute';

const KanjiExplorer = lazyWithRetry(() => import('./components/KanjiExplorer'));
const DailyExamQuiz = lazyWithRetry(() => import('./components/DailyExamQuiz'));
const ProgressDashboard = lazyWithRetry(() => import('./components/ProgressDashboard'));
const Kaiwa = lazyWithRetry(() => import('./components/Kaiwa'));
const AdminPanel = lazyWithRetry(() => import('./components/AdminPanel'));
const JapaneseAiChat = lazyWithRetry(() => import('./components/JapaneseAiChat'));
const AiReadingPractice = lazyWithRetry(() => import('./components/AiReadingPractice'));
const NotebookManager = lazyWithRetry(() => import('./components/NotebookManager'));
const DictionaryLookup = lazyWithRetry(() => import('./components/DictionaryLookup'));
const LessonHub = lazyWithRetry(() => import('./components/LessonHub'));
const HandwritingPractice = lazyWithRetry(() => import('./components/HandwritingPractice'));
const StudyBooksHub = lazyWithRetry(() => import('./components/StudyBooksHub'));
const ListeningHub = lazyWithRetry(() => import('./components/listening/ListeningHub').then(m => ({ default: m.ListeningHub })));
const GrammarPractice = lazyWithRetry(() => import('./components/GrammarPractice'));
const JlptRoadmapView = lazyWithRetry(() => import('./components/roadmap/JlptRoadmapView'));
const AchievementsView = lazyWithRetry(() => import('./components/achievements/AchievementsView'));
const MobilePracticeHub = lazyWithRetry(() => import('./components/mobile/MobilePracticeHub'));
const MobileProfileView = lazyWithRetry(() => import('./components/mobile/MobileProfileView'));
import SaveToNotebookModal from './components/SaveToNotebookModal';
import JlptWordDetailModal from './components/JlptWordDetailModal';
import ShibaAssistantFloating from './components/mascot/ShibaAssistantFloating';
import ShibaMascot from './components/mascot/ShibaMascot';

const LOCAL_STORAGE_KEY = 'nhai_kanji_user_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Khách',
  avatar: '🐕',
  targetLevel: 'N5',
  xp: 0,
  streak: 0,
  coins: 0,
  streakFreezes: 0,
  studyDays: [],
  completedLessons: [],
  vocabStatus: {},
  grammarStatus: {},
  kanjiStatus: {},
  dailyTestResults: [],
  lastPosition: undefined
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const { dbUser, user, updateDbProfile, lastAuthError } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Active tab is derived directly from the URL route
  const currentTab = useMemo(() => {
    return getTabFromPathname(location.pathname);
  }, [location.pathname]);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  // If redirect auth returned with an error, automatically open auth modal with resolution guidance
  useEffect(() => {
    if (lastAuthError && !user) {
      setIsAuthModalOpen(true);
    }
  }, [lastAuthError, user]);

  // Sync page title with current route & brand
  useEffect(() => {
    const { title } = getRoutePageTitle(location.pathname);
    document.title = `${title} | ${BRAND_NAME}`;
  }, [location.pathname]);

  // Support legacy query parameters (e.g. ?tab=bunpo or ?page=kanji)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') || params.get('page');
    if (tabParam && TAB_TO_ROUTE_MAP[tabParam]) {
      navigate(TAB_TO_ROUTE_MAP[tabParam], { replace: true });
    }
  }, [location.search, navigate]);

  // Intercept native browser alert calls and redirect them to our gorgeous custom Toast
  useEffect(() => {
    window.alert = (message: string) => {
      setToast({ message, visible: true });
    };
  }, []);

  // Automatically dismiss the custom toast after 4 seconds
  useEffect(() => {
    if (toast && toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => prev ? { ...prev, visible: false } : null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Scroll to top of main content view
  useEffect(() => {
    const mainView = document.getElementById('app-main-view');
    if (!mainView) return;

    const handleScroll = () => {
      if (mainView.scrollTop > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    mainView.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      mainView.removeEventListener('scroll', handleScroll);
    };
  }, [currentTab]);

  // Reset scroll to top on tab change
  useEffect(() => {
    const mainView = document.getElementById('app-main-view');
    if (mainView) {
      mainView.scrollTop = 0;
    }
  }, [currentTab]);

  // Streak Freeze Modal State
  const [streakModal, setStreakModal] = useState<{
    isOpen: boolean;
    type: 'used_freeze' | 'lost_streak' | null;
    streakCount: number;
    freezeCountBefore?: number;
  }>({ isOpen: false, type: null, streakCount: 0 });

  // Daily goal tracking states
  const [todayXp, setTodayXp] = useState<number>(0);
  const [goalCompleted, setGoalCompleted] = useState<boolean>(false);
  const celebrationRef = useRef<ParticleCelebrationRef>(null);

  // Load profile and daily XP tracker on component mount
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserProfile(parsed);
        } catch (e) {
          console.error("Error parsing user profile:", e);
        }
      }
    } else {
      // Unauthenticated guest starts with clean 0 state at root vocabulary
      setUserProfile(DEFAULT_PROFILE);
    }

    // Initialize daily goal tracking from localStorage
    const todayStr = new Date().toISOString().split('T')[0] || '';
    const storedXp = user ? Number(localStorage.getItem(`nhai_kanji_today_xp_v1_${todayStr}`) || '0') : 0;
    setTodayXp(storedXp);
    
    const storedCompleted = user ? (localStorage.getItem(`nhai_kanji_today_completed_v1_${todayStr}`) === 'true') : false;
    setGoalCompleted(storedCompleted);
  }, [user]);

  // Web Notification Daily Reminder Background Timer
  useEffect(() => {
    checkAndTriggerReminder(getDefaultReminderSettings());

    const interval = setInterval(() => {
      checkAndTriggerReminder(getDefaultReminderSettings());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Save profile to localStorage whenever it updates
  const saveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
    }
  };

  const activeProfile = useMemo<UserProfile>(() => {
    if (!user && !dbUser) {
      return DEFAULT_PROFILE;
    }
    const activeProfileRaw = dbUser || userProfile;
    // STRICT RBAC: Role is authoritatively determined ONLY by the verified database record (dbUser).
    // Local storage or unauthenticated state can NEVER grant admin privileges.
    const currentRole = (dbUser && dbUser.role === 'admin') ? 'admin' : 'user';
    return {
      ...activeProfileRaw,
      role: currentRole as 'user' | 'admin'
    };
  }, [dbUser, userProfile, user]);

  const lastPositionTimeoutRef = useRef<any>(null);

  const updateProfile = async (updatedFields: Partial<UserProfile>) => {
    // If updating ONLY lastPosition, update local state immediately and sync to localStorage, then debounce backend sync
    if (updatedFields.lastPosition && Object.keys(updatedFields).length === 1) {
      if (user) {
        setUserProfile(prev => {
          const next = { ...prev, ...updatedFields };
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
          } catch (e) {
            console.error('Failed to sync profile to localStorage', e);
          }
          return next;
        });
        if (lastPositionTimeoutRef.current) clearTimeout(lastPositionTimeoutRef.current);
        lastPositionTimeoutRef.current = setTimeout(() => {
          if (dbUser) {
            updateDbProfile(updatedFields);
          }
        }, 800);
      }
      return;
    }

    if (dbUser) {
      await updateDbProfile(updatedFields);
    } else if (user) {
      const newProfile = { ...userProfile, ...updatedFields };
      saveProfile(newProfile);
    }
  };

  const [grammarInitialView, setGrammarInitialView] = useState<'overview' | 'lesson-list' | 'lesson-detail' | 'grammar-detail' | 'practice'>('lesson-list');
  const [grammarInitialLesson, setGrammarInitialLesson] = useState<number | undefined>(undefined);

  const handleTabChange = (newTab: string, extra?: any) => {
    if (newTab === 'grammar') {
      if (extra?.viewMode) {
        setGrammarInitialView(extra.viewMode);
      } else {
        setGrammarInitialView('lesson-list');
      }
      if (extra?.lessonNumber) {
        setGrammarInitialLesson(extra.lessonNumber);
        navigate(`/bunpo/${extra.lessonNumber}`);
        return;
      }
    }
    const targetRoute = TAB_TO_ROUTE_MAP[newTab] || '/';
    navigate(targetRoute);

    if (user) {
      const updatedPos = {
        ...(activeProfile.lastPosition || {}),
        tab: newTab,
        timestamp: new Date().toISOString()
      };
      updateProfile({ lastPosition: updatedPos });
    }
  };

  // Auto-restore last position ONLY when user is authenticated AND landed strictly on root "/"
  const isInitialRestoredRef = useRef<boolean>(false);

  useEffect(() => {
    if (!user) {
      isInitialRestoredRef.current = false;
      return;
    }
    if (isInitialRestoredRef.current) return;
    if (!activeProfile.lastPosition) return;
    if (location.pathname !== '/') {
      // User directly accessed a specific deep-linked route (e.g. /bunpo, /cho, /kanji) -> Do not override!
      isInitialRestoredRef.current = true;
      return;
    }

    const pos = activeProfile.lastPosition;
    if (pos.tab && TAB_TO_ROUTE_MAP[pos.tab]) {
      const targetPath = TAB_TO_ROUTE_MAP[pos.tab];
      if (targetPath !== '/') {
        navigate(targetPath, { replace: true });
      }
      isInitialRestoredRef.current = true;

      const tabNames: Record<string, string> = {
        vocabulary: 'Từ vựng (Tango)',
        grammar: 'Ngữ pháp (Bunpo)',
        kanji: 'Hán tự (Kanji)',
        reading: 'Đọc hiểu & Tin tức',
        listening: 'JLPT Listening (Choukai)',
        'japanese-chat': 'Chat AI Tiếng Nhật',
        progress: 'Tiến độ học tập',
        notebook: 'Sổ tay từ vựng',
        dictionary: 'Từ điển Jisho',
        lessons: 'Bài học Minna & JLPT'
      };
      const tabLabel = tabNames[pos.tab] || pos.tab;
      const detail = pos.lessonName ? `: ${pos.lessonName}` : pos.level ? ` (${pos.level})` : '';

      setToast({
        message: `✨ Chào mừng trở lại! Đã khôi phục vị trí học gần nhất của bạn tại ${tabLabel}${detail}`,
        visible: true
      });
    }
  }, [activeProfile.lastPosition, user, location.pathname, navigate]);

  // Listener for direct navigation to Reading with lesson details from Vocabulary or Grammar
  const [readingLessonState, setReadingLessonState] = useState<{ 
    level?: any; 
    lessonNumber?: number;
    curriculum?: 'minna' | 'tango';
    lessonId?: string;
  }>({});

  useEffect(() => {
    const handleNavigateReading = (e: any) => {
      if (e.detail) {
        setReadingLessonState({
          level: e.detail.level,
          lessonNumber: e.detail.lessonNumber,
          curriculum: e.detail.curriculum,
          lessonId: e.detail.lessonId
        });
      }
      navigate('/doc-hieu');
    };
    window.addEventListener('navigate_to_reading', handleNavigateReading);
    return () => {
      window.removeEventListener('navigate_to_reading', handleNavigateReading);
    };
  }, [navigate]);

  // Daily Streak and Streak Freeze Protection Logic (Only for logged-in users)
  useEffect(() => {
    if (!user) return;
    // Wait until profile is fully loaded and resolved
    if (!dbUser && activeProfile.xp === 0) {
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0] || '';
    const lastCheckedDate = localStorage.getItem('nhai_kanji_streak_checked_date_v1');

    if (lastCheckedDate === todayStr) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0] || '';

    // Check if they completed yesterday's goal (50 XP)
    const yesterdayCompleted = localStorage.getItem(`nhai_kanji_today_completed_v1_${yesterdayStr}`) === 'true';

    if (activeProfile.streak > 0 && !yesterdayCompleted) {
      const currentFreezes = activeProfile.streakFreezes || 0;
      if (currentFreezes > 0) {
        // Automatically consume a Streak Freeze
        const newFreezes = currentFreezes - 1;
        
        // Auto-complete yesterday's goal so they keep the streak
        localStorage.setItem(`nhai_kanji_today_completed_v1_${yesterdayStr}`, 'true');
        
        const updatedStudyDays = [...activeProfile.studyDays];
        if (!updatedStudyDays.includes(yesterdayStr)) {
          updatedStudyDays.push(yesterdayStr);
        }

        updateProfile({
          streakFreezes: newFreezes,
          studyDays: updatedStudyDays,
          lastActiveDate: todayStr
        });

        setStreakModal({
          isOpen: true,
          type: 'used_freeze',
          streakCount: activeProfile.streak,
          freezeCountBefore: currentFreezes
        });
      } else {
        // Reset streak to 0
        updateProfile({
          streak: 0,
          lastActiveDate: todayStr
        });

        setStreakModal({
          isOpen: true,
          type: 'lost_streak',
          streakCount: activeProfile.streak
        });
      }
    } else {
      updateProfile({
        lastActiveDate: todayStr
      });
    }

    // Set today as checked
    localStorage.setItem('nhai_kanji_streak_checked_date_v1', todayStr);
  }, [activeProfile.streak, activeProfile.streakFreezes, dbUser]);

  const handleTriggerCelebration = () => {
    playMilestoneChime();
    const el = document.getElementById('header-stat-goal');
    if (el) {
      const rect = el.getBoundingClientRect();
      celebrationRef.current?.triggerCelebration(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } else {
      celebrationRef.current?.triggerCelebration();
    }
  };

  const handleEarnXp = async (amount: number) => {
    const todayStr = new Date().toISOString().split('T')[0] || '';
    
    // Add today to study days if not already present
    const updatedStudyDays = [...activeProfile.studyDays];
    if (!updatedStudyDays.includes(todayStr)) {
      updatedStudyDays.push(todayStr);
    }

    // Calculate XP with streak multiplier
    const { totalXp, bonusXp, bonusInfo } = calculateEarnedXp(amount, activeProfile.streak);

    // Earn coin reward proportional to XP earned (e.g. 1 Yen per 2 total XP)
    const coinsEarned = Math.ceil(totalXp / 2);

    // Track daily goal progress
    const storedXp = Number(localStorage.getItem(`nhai_kanji_today_xp_v1_${todayStr}`) || '0');
    const newTodayXp = storedXp + totalXp;
    localStorage.setItem(`nhai_kanji_today_xp_v1_${todayStr}`, newTodayXp.toString());
    setTodayXp(newTodayXp);

    let updatedStreak = activeProfile.streak;
    let justCompleted = false;

    // Check if daily study goal (50 XP) is reached
    const wasCompleted = localStorage.getItem(`nhai_kanji_today_completed_v1_${todayStr}`) === 'true';
    if (!wasCompleted && newTodayXp >= 50) {
      localStorage.setItem(`nhai_kanji_today_completed_v1_${todayStr}`, 'true');
      setGoalCompleted(true);
      updatedStreak = activeProfile.streak + 1;
      justCompleted = true;
    }

    const oldXp = activeProfile.xp;
    const newXpTotal = oldXp + totalXp;

    const oldLevelInfo = getPlayerLevelInfo(oldXp);
    const newLevelInfo = getPlayerLevelInfo(newXpTotal);
    const isLevelUp = newLevelInfo.level > oldLevelInfo.level;

    const updatedFields = {
      xp: newXpTotal,
      coins: activeProfile.coins + coinsEarned,
      studyDays: updatedStudyDays,
      streak: updatedStreak
    };

    if (dbUser) {
      await updateDbProfile(updatedFields);
    } else {
      const newProfile = {
        ...userProfile,
        ...updatedFields
      };
      saveProfile(newProfile);
    }

    if (isLevelUp) {
      playMilestoneChime();
      celebrationRef.current?.triggerCelebration();
      setToast({
        message: `🎉 CHÚC MỪNG LÊN CẤP ${newLevelInfo.level}! Danh hiệu: ${newLevelInfo.title}`,
        visible: true
      });
    } else if (justCompleted) {
      playMilestoneChime();
      setToast({
        message: `🎯 Hoàn thành xuất sắc mục tiêu 50 XP hôm nay! (+1 Streak)`,
        visible: true
      });
    } else if (bonusXp > 0) {
      setToast({
        message: `⚡ +${totalXp} XP (Thưởng chuỗi ${bonusInfo.badge} +${bonusXp} XP)`,
        visible: true
      });
    }

    if (justCompleted) {
      setTimeout(() => {
        const el = document.getElementById('header-stat-goal');
        if (el) {
          const rect = el.getBoundingClientRect();
          celebrationRef.current?.triggerCelebration(rect.left + rect.width / 2, rect.top + rect.height / 2);
        } else {
          celebrationRef.current?.triggerCelebration();
        }
      }, 500);
    }
  };

  const handleResetProgress = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const todayStr = new Date().toISOString().split('T')[0] || '';
    localStorage.removeItem(`nhai_kanji_today_xp_v1_${todayStr}`);
    localStorage.removeItem(`nhai_kanji_today_completed_v1_${todayStr}`);
    setTodayXp(0);
    setGoalCompleted(false);
    setUserProfile({
      ...DEFAULT_PROFILE,
      studyDays: [todayStr]
    });
  };

  const [selectedMaziiWord, setSelectedMaziiWord] = useState<any>(null);

  function ListeningHubRouteWrapper() {
    const { examId, level } = useParams();
    const activeLevel = (level ? level.toUpperCase() : activeProfile.targetLevel || 'N4') as JLPTLevel;

    const handleSelectExam = (selectedId: string | null) => {
      if (selectedId) {
        if (level) {
          navigate(`/jlpt/${level.toLowerCase()}/listening/${selectedId}`);
        } else {
          navigate(`/cho/${selectedId}`);
        }
      } else {
        if (level) {
          navigate(`/jlpt/${level.toLowerCase()}/listening`);
        } else {
          navigate('/cho');
        }
      }
    };

    return (
      <ListeningHub
        userId={user?.uid || 'default_user'}
        currentLevel={activeLevel}
        onLevelChange={(lvl) => updateProfile({ targetLevel: lvl })}
        onEarnXp={handleEarnXp}
        isAdmin={activeProfile.role === 'admin'}
        initialExamId={examId}
        onSelectExam={handleSelectExam}
      />
    );
  }

  function GrammarPracticeRouteWrapper() {
    const { lessonId } = useParams();
    const parsedLesson = lessonId ? parseInt(lessonId, 10) : undefined;

    return (
      <GrammarPractice
        userProfile={activeProfile}
        updateProfile={updateProfile}
        onEarnXp={handleEarnXp}
        onNavigateTab={handleTabChange}
        initialViewMode={parsedLesson ? 'lesson-detail' : grammarInitialView}
        initialLessonNumber={parsedLesson || grammarInitialLesson}
      />
    );
  }

  function DailyExamQuizRouteWrapper() {
    const { level } = useParams();

    useEffect(() => {
      if (level && ['n5', 'n4', 'n3', 'n2', 'n1'].includes(level.toLowerCase())) {
        const upper = level.toUpperCase() as JLPTLevel;
        if (activeProfile.targetLevel !== upper) {
          updateProfile({ targetLevel: upper });
        }
      }
    }, [level]);

    return (
      <DailyExamQuiz 
        userProfile={activeProfile} 
        updateProfile={updateProfile} 
        onEarnXp={handleEarnXp} 
      />
    );
  }

  function AiReadingPracticeRouteWrapper() {
    const { level } = useParams();
    const activeLevel = level ? (level.toUpperCase() as JLPTLevel) : readingLessonState.level;

    return (
      <AiReadingPractice 
        userProfile={activeProfile} 
        updateProfile={updateProfile} 
        onEarnXp={handleEarnXp} 
        initialLevel={activeLevel}
        initialLessonNumber={readingLessonState.lessonNumber}
        initialCurriculum={readingLessonState.curriculum}
        initialLessonId={readingLessonState.lessonId}
      />
    );
  }

  const renderRoutes = () => (
    <Routes location={location}>
      {/* 1. Trang chủ / Trung tâm Luyện tập */}
      <Route 
        path="/" 
        element={
          <MobilePracticeHub 
            userProfile={activeProfile} 
            updateProfile={updateProfile} 
            onNavigate={handleTabChange} 
            onEarnXp={handleEarnXp} 
          />
        } 
      />

      {/* 2. Ngữ pháp (Bunpo) & Deep link bài học */}
      <Route path="/bunpo" element={<GrammarPracticeRouteWrapper />} />
      <Route path="/bunpo/:lessonId" element={<GrammarPracticeRouteWrapper />} />

      {/* 3. Hán tự (Kanji) & Deep link */}
      <Route 
        path="/kanji" 
        element={
          <KanjiExplorer 
            userProfile={activeProfile} 
            updateProfile={updateProfile} 
            onEarnXp={handleEarnXp} 
          />
        } 
      />
      <Route 
        path="/kanji/:lessonId" 
        element={
          <KanjiExplorer 
            userProfile={activeProfile} 
            updateProfile={updateProfile} 
            onEarnXp={handleEarnXp} 
          />
        } 
      />

      {/* 4. Từ vựng (Tango) & Deep link */}
      <Route 
        path="/tango" 
        element={
          <VocabularyPractice 
            userProfile={activeProfile} 
            updateProfile={updateProfile} 
            onEarnXp={handleEarnXp} 
          />
        } 
      />
      <Route 
        path="/tango/:lessonId" 
        element={
          <VocabularyPractice 
            userProfile={activeProfile} 
            updateProfile={updateProfile} 
            onEarnXp={handleEarnXp} 
          />
        } 
      />

      {/* 5. Luyện nghe (Choukai) & Deep link bài thi video */}
      <Route path="/cho" element={<ListeningHubRouteWrapper />} />
      <Route path="/cho/:examId" element={<ListeningHubRouteWrapper />} />

      {/* 6. Luyện thi JLPT & Cấp độ JLPT */}
      <Route path="/jlpt" element={<DailyExamQuizRouteWrapper />} />
      <Route path="/jlpt/:level" element={<DailyExamQuizRouteWrapper />} />
      <Route path="/jlpt/:level/listening" element={<ListeningHubRouteWrapper />} />
      <Route path="/jlpt/:level/listening/:examId" element={<ListeningHubRouteWrapper />} />
      <Route path="/jlpt/:level/grammar" element={<GrammarPracticeRouteWrapper />} />
      <Route 
        path="/jlpt/:level/kanji" 
        element={
          <KanjiExplorer 
            userProfile={activeProfile} 
            updateProfile={updateProfile} 
            onEarnXp={handleEarnXp} 
          />
        } 
      />
      <Route path="/jlpt/:level/reading" element={<AiReadingPracticeRouteWrapper />} />

      {/* 7. Lộ trình học tập */}
      <Route 
        path="/lo-trinh" 
        element={
          <JlptRoadmapView
            userProfile={activeProfile}
            updateProfile={updateProfile}
            onEarnXp={handleEarnXp}
          />
        } 
      />

      {/* 8. Đọc hiểu & Tin tức */}
      <Route path="/doc-hieu" element={<AiReadingPracticeRouteWrapper />} />

      {/* 9. Sách ôn thi */}
      <Route 
        path="/sach" 
        element={
          <StudyBooksHub
            userProfile={activeProfile}
            updateProfile={updateProfile}
            onEarnXp={handleEarnXp}
            onBack={() => handleTabChange('practice')}
          />
        } 
      />

      {/* 10. AI Kaiwa Chat */}
      <Route 
        path="/chat-ai" 
        element={<JapaneseAiChat onBack={() => handleTabChange('practice')} />} 
      />

      {/* 11. Cộng đồng Kaiwa */}
      <Route path="/cong-dong" element={<Kaiwa />} />

      {/* 12. Sổ tay từ vựng */}
      <Route path="/so-tay" element={<NotebookManager />} />

      {/* 13. Thành tựu */}
      <Route 
        path="/thanh-tich" 
        element={
          <AchievementsView
            userProfile={activeProfile}
            onBack={() => handleTabChange('progress')}
          />
        } 
      />

      {/* 14. Bảng xếp hạng & Tiến độ */}
      <Route 
        path="/xep-hang" 
        element={
          <ProgressDashboard 
            userProfile={activeProfile} 
            todayXp={todayXp}
            updateProfile={updateProfile}
            onTriggerCelebration={handleTriggerCelebration}
            onNavigateTab={handleTabChange}
          />
        } 
      />

      {/* 15. Từ điển Jisho */}
      <Route path="/tu-dien" element={<DictionaryLookup />} />

      {/* 16. Bài học Minna */}
      <Route 
        path="/bai-hoc" 
        element={
          <LessonHub 
            userProfile={activeProfile} 
            onUpdateProfile={updateProfile} 
            onNavigateToTab={handleTabChange} 
          />
        } 
      />

      {/* 17. Luyện viết */}
      <Route 
        path="/luyen-viet" 
        element={
          <HandwritingPractice
            userProfile={activeProfile}
            updateProfile={updateProfile}
            onEarnXp={handleEarnXp}
          />
        } 
      />

      {/* 18. Tài khoản & Cài đặt */}
      <Route 
        path="/tai-khoan" 
        element={
          <MobileProfileView 
            userProfile={activeProfile} 
            updateProfile={updateProfile} 
            onNavigate={handleTabChange} 
            onOpenAuth={() => setIsAuthModalOpen(true)} 
            onResetProgress={handleResetProgress} 
          />
        } 
      />
      <Route 
        path="/cai-dat" 
        element={
          <MobileProfileView 
            userProfile={activeProfile} 
            updateProfile={updateProfile} 
            onNavigate={handleTabChange} 
            onOpenAuth={() => setIsAuthModalOpen(true)} 
            onResetProgress={handleResetProgress} 
          />
        } 
      />

      {/* 19. Admin (Strict RBAC: Protected by AdminRoute) */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute onRequireLogin={() => setIsAuthModalOpen(true)}>
            <AdminPanel userProfile={activeProfile} />
          </AdminRoute>
        } 
      />

      {/* Canonical Redirects & English Aliases */}
      <Route path="/practice" element={<Navigate to="/" replace />} />
      <Route path="/grammar" element={<Navigate to="/bunpo" replace />} />
      <Route path="/vocabulary" element={<Navigate to="/tango" replace />} />
      <Route path="/listening" element={<Navigate to="/cho" replace />} />
      <Route path="/reading" element={<Navigate to="/doc-hieu" replace />} />
      <Route path="/study-books" element={<Navigate to="/sach" replace />} />
      <Route path="/notebook" element={<Navigate to="/so-tay" replace />} />
      <Route path="/dictionary" element={<Navigate to="/tu-dien" replace />} />
      <Route path="/roadmap" element={<Navigate to="/lo-trinh" replace />} />
      <Route path="/achievements" element={<Navigate to="/thanh-tich" replace />} />
      <Route path="/progress" element={<Navigate to="/xep-hang" replace />} />
      <Route path="/tien-do" element={<Navigate to="/xep-hang" replace />} />
      <Route path="/profile" element={<Navigate to="/tai-khoan" replace />} />
      <Route path="/settings" element={<Navigate to="/cai-dat" replace />} />
      <Route path="/japanese-chat" element={<Navigate to="/chat-ai" replace />} />
      <Route path="/kaiwa" element={<Navigate to="/cong-dong" replace />} />
      <Route path="/lessons" element={<Navigate to="/bai-hoc" replace />} />
      <Route path="/exam" element={<Navigate to="/jlpt" replace />} />

      {/* 20. 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );

  const scrollToTop = () => {
    const mainView = document.getElementById('app-main-view');
    if (mainView) {
      mainView.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div id="app-root-container" className="flex h-screen overflow-hidden bg-[#0b1120] text-slate-100">
      {/* Particle explosion layer */}
      <ParticleCelebration ref={celebrationRef} />

      {/* Left Navigation Sidebar Panel */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={handleTabChange} 
        userCoins={activeProfile.coins} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userProfile={activeProfile}
      />

      {/* Right Side Content Frame Panel */}
      <div id="app-content-panel" className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Dashboard */}
        <Header 
          currentTab={currentTab} 
          userProfile={activeProfile} 
          updateProfile={updateProfile} 
          onResetProgress={handleResetProgress} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          todayXp={todayXp}
          onTriggerCelebration={handleTriggerCelebration}
          setCurrentTab={handleTabChange}
        />

        {/* Scrollable Core View Panel Area */}
        <main 
          id="app-main-view" 
          className={`flex-1 bg-transparent ${
            currentTab === 'japanese-chat' 
              ? 'overflow-hidden flex flex-col h-full min-h-0 pb-0' 
              : 'overflow-y-auto pb-28 xl:pb-8'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`w-full ${
                currentTab === 'japanese-chat' 
                  ? 'h-full flex-1 flex flex-col min-h-0 overflow-hidden' 
                  : 'min-h-full flex flex-col'
              }`}
            >
              <Suspense fallback={
                <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
                  <ShibaMascot pose="study" size={72} animated={true} />
                  <p className="text-xs font-black text-amber-400 tracking-wider uppercase mt-4 animate-pulse">
                    Nihon Shiba đang tải dữ liệu...
                  </p>
                </div>
              }>
                <AppErrorBoundary key={location.pathname}>
                  {renderRoutes()}
                </AppErrorBoundary>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-to-top"
            id="btn-scroll-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-20 xl:bottom-6 right-4 sm:right-6 z-50 p-3 bg-[#E89A3C] hover:bg-[#D48628] text-white rounded-full active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center group shadow-xl shadow-amber-950/40"
            title="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Custom alert Toast notification with Nihon Shiba Mascot */}
      <AnimatePresence>
        {toast && toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-20 xl:bottom-6 left-1/2 -translate-x-1/2 z-[120] max-w-sm w-[92%] bg-[#1B223C] border-2 border-[#E89A3C]/60 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between gap-3 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#E89A3C]/20 border border-[#E89A3C]/40 flex items-center justify-center shrink-0">
                <ShibaMascot pose="happy" size={26} animated={false} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold leading-normal text-left text-amber-100">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast({ ...toast, visible: false })}
              className="px-2.5 py-1 bg-[#242E52] hover:bg-[#E89A3C] active:bg-[#D48628] rounded-lg text-[10px] font-black text-amber-200 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              Đóng
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Save to Notebook Modal */}
      <SaveToNotebookModal />

      {/* Mazii Word Detail Lookup Modal */}
      {selectedMaziiWord && (
        <JlptWordDetailModal
          wordInfo={selectedMaziiWord}
          onClose={() => setSelectedMaziiWord(null)}
          onSaveVocab={(v: any) => {
            const currentSaved = activeProfile.savedVocab || [];
            const targetWord = typeof v === 'string' ? v : v?.word || '';
            if (!currentSaved.some(x => (typeof x === 'string' ? x : x.word) === targetWord)) {
              const itemToSave = typeof v === 'string' ? { word: v } : v;
              updateProfile({ savedVocab: [itemToSave, ...currentSaved] });
            }
          }}
          isSaved={(activeProfile.savedVocab || []).some(x => {
            const currentTarget = typeof selectedMaziiWord === 'string' ? selectedMaziiWord : selectedMaziiWord?.word;
            return (typeof x === 'string' ? x : x.word) === currentTarget;
          })}
        />
      )}

      {/* PWA Install Banner & Modal */}
      <PwaInstallPrompt />

      {/* Global Floating Vocabulary & Grammar Notifications */}
      <VocabFloatingNotifier onEarnXp={handleEarnXp} />

      {/* Global Floating Nihon Shiba Companion Assistant */}
      <ShibaAssistantFloating 
        userProfile={activeProfile} 
        currentTab={currentTab} 
        onNavigate={handleTabChange} 
      />

      {/* Modern Mobile & Tablet Bottom Navigation Bar (Visible on mobile/tablet screens < xl) */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        userProfile={activeProfile}
        updateProfile={updateProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        todayXp={todayXp}
        onOpenNotifications={() => window.dispatchEvent(new CustomEvent('open_notification_settings'))}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}
