/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { getStoredWords, saveStoredWords } from './utils/notebookStorage';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { UserProfile, JLPTLevel } from './types';
import { useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import LearningMotion from './components/LearningMotion';
import StreakCelebration from './components/StreakCelebration';
import { ParticleCelebration, ParticleCelebrationRef } from './components/ParticleCelebration';
import { playMilestoneChime } from './utils/audio';
import { motion, AnimatePresence, useReducedMotion, MotionConfig } from 'motion/react';
import { ArrowUp, Loader2, BookOpen, Layers, Compass, Languages, Menu } from 'lucide-react';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import VocabFloatingNotifier from './components/VocabFloatingNotifier';
import MobileBottomNav from './components/MobileBottomNav';
import { checkAndTriggerReminder, getDefaultReminderSettings } from './utils/notifications';
import { calculateEarnedXp, getPlayerLevelInfo } from './utils/xpSystem';
import { lazyWithRetry, AppErrorBoundary } from './utils/lazyWithRetry';
const VocabularyPractice = lazyWithRetry(() => import('./components/VocabularyPractice'));
import NotFoundPage from './components/NotFoundPage';
import { BRAND_NAME } from './constants/brand';
import { getTabFromPathname, TAB_TO_ROUTE_MAP, getRoutePageTitle } from './routes/routesConfig';

import AdminRoute from './components/AdminRoute';

const KanjiExplorer = lazyWithRetry(() => import('./components/KanjiExplorer'));
const MyVocabulary = lazyWithRetry(() => import('./components/MyVocabulary'));
const DailyExamQuiz = lazyWithRetry(() => import('./components/DailyExamQuiz'));
const Kaiwa = lazyWithRetry(() => import('./components/Kaiwa'));
const AdminPanel = lazyWithRetry(() => import('./components/AdminPanel'));
const JapaneseAiChat = lazyWithRetry(() => import('./components/JapaneseAiChat'));
const ReadingExam = lazyWithRetry(() => import('./components/ReadingExam'));
const MyBooks = lazyWithRetry(() => import('./components/MyBooks'));
const NotebookManager = lazyWithRetry(() => import('./components/NotebookManager'));
const DictionaryLookup = lazyWithRetry(() => import('./components/DictionaryLookup'));
const HandwritingPractice = lazyWithRetry(() => import('./components/HandwritingPractice'));
const ShadowingHub = lazyWithRetry(() => import('./components/shadowing/ShadowingHub'));
const GrammarPractice = lazyWithRetry(() => import('./components/GrammarPractice'));
const JlptRoadmapView = lazyWithRetry(() => import('./components/roadmap/JlptRoadmapView'));
const AchievementsView = lazyWithRetry(() => import('./components/achievements/AchievementsView'));
const MobilePracticeHub = lazyWithRetry(() => import('./components/mobile/MobilePracticeHub'));
const MobileProfileView = lazyWithRetry(() => import('./components/mobile/MobileProfileView'));
import SaveToNotebookModal from './components/SaveToNotebookModal';
const JlptWordDetailModal = lazyWithRetry(() => import('./components/JlptWordDetailModal')); // kéo theo Tango N4: chỉ nạp khi mở tra từ
import ShibaMascot from './components/mascot/ShibaMascot';
import Toasts, { toast } from './components/ui/Toasts';
import CommandPalette from './components/ui/CommandPalette';
import OrbitLoader from './components/ui/OrbitLoader';

import { localDateStr } from './utils/localDate';
const LOCAL_STORAGE_KEY = 'nhai_kanji_user_profile_v1';
const GUEST_STORAGE_KEY = 'nhai_kanji_guest_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Khách',
  avatar: '',
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

function ExamRouteScreen(props: React.ComponentProps<typeof DailyExamQuiz>) {
  const { level } = useParams();
  const routeLevel = level && /^n[1-5]$/i.test(level) ? level.toUpperCase() as JLPTLevel : undefined;
  return <DailyExamQuiz {...props} userProfile={routeLevel ? { ...props.userProfile, targetLevel: routeLevel } : props.userProfile} />;
}

export default function App() {
  const [cloudRestoreVersion,setCloudRestoreVersion]=useState(0);
  useEffect(()=>{const restored=()=>setCloudRestoreVersion(n=>n+1);window.addEventListener('learning-cloud-restored',restored);return()=>window.removeEventListener('learning-cloud-restored',restored);},[]);
  const reducedMotion = useReducedMotion();
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
  useEffect(() => {
    const open = () => setIsAuthModalOpen(true);
    window.addEventListener('nihongo:open-login', open);
    return () => window.removeEventListener('nihongo:open-login', open);
  }, []);

  // Prefetch the most-visited chunks after initial paint so navigation feels instant
  useEffect(() => {
    const t = setTimeout(() => {
      import('./components/VocabularyPractice');
      import('./components/KanjiExplorer');
      import('./components/DictionaryLookup');
    }, 3000); // wait 3s so it doesn't compete with first paint
    return () => clearTimeout(t);
  }, []);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

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
      toast(String(message));
    };
  }, []);

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
      // Guest: restore the locally saved guest progress (never the signed-in profile)
      let guest = DEFAULT_PROFILE;
      try {
        const g = localStorage.getItem(GUEST_STORAGE_KEY);
        if (g) guest = { ...DEFAULT_PROFILE, ...JSON.parse(g) };
      } catch { /* corrupt guest data: start clean */ }
      setUserProfile(guest);
    }

    // Initialize daily goal tracking from localStorage
    const todayStr = localDateStr();
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
    try {
      localStorage.setItem(user ? LOCAL_STORAGE_KEY : GUEST_STORAGE_KEY, JSON.stringify(newProfile));
    } catch { /* storage full/blocked: keep in-memory only */ }
  };

  const activeProfile = useMemo<UserProfile>(() => {
    if (!user && !dbUser) {
      // Guests learn with their own local profile; never any elevated role.
      return { ...userProfile, role: 'user' as const };
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
    } else {
      // Unauthenticated guest: persist to localStorage only
      const newProfile = { ...userProfile, ...updatedFields };
      saveProfile(newProfile);
    }
  };

  // "Từ vựng của tôi": trộn từ trên tài khoản vào máy khi đăng nhập, rồi đẩy thay đổi lên tài khoản (debounce).
  const myWordsMergedRef = useRef(false);
  useEffect(() => {
    if (!dbUser || myWordsMergedRef.current) return;
    myWordsMergedRef.current = true;
    const remote = Array.isArray(dbUser.myWords) ? dbUser.myWords : [];
    const local = getStoredWords();
    const have = new Set(local.map(w => w.id));
    const add = remote.filter(w => w?.id && !have.has(w.id));
    if (add.length) saveStoredWords([...add, ...local]);
  }, [dbUser]);
  useEffect(() => {
    if (!dbUser) return;
    let t: any;
    const push = () => { clearTimeout(t); t = setTimeout(() => { if (myWordsMergedRef.current) void updateProfile({ myWords: getStoredWords().filter(w => !w.id.startsWith('init_')) }); }, 1500); };
    window.addEventListener('saved_words_updated', push);
    return () => { window.removeEventListener('saved_words_updated', push); clearTimeout(t); };
  }, [dbUser]);


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
        dictionary: 'Từ điển Jisho'
      };
      const tabLabel = tabNames[pos.tab] || pos.tab;
      const detail = pos.lessonName ? `: ${pos.lessonName}` : pos.level ? ` (${pos.level})` : '';

      toast(`✨ Chào mừng trở lại! Đã khôi phục vị trí học gần nhất của bạn tại ${tabLabel}${detail}`);
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

    const todayStr = localDateStr();
    const lastCheckedDate = localStorage.getItem('nhai_kanji_streak_checked_date_v1');

    if (lastCheckedDate === todayStr) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = localDateStr(yesterday);

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

  useEffect(() => {
    const on = () => handleTriggerCelebration();
    window.addEventListener('app-celebrate', on);
    return () => window.removeEventListener('app-celebrate', on);
  });

  const handleStudyXp = (activity: string, amount: number) => {
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    const key = `nihon_study_rewards_v1:${activeProfile.uid || user?.uid || 'guest'}:${day}`;
    try {
      const claimed: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (claimed.includes(activity) || claimed.length >= 100) return false;
      localStorage.setItem(key, JSON.stringify([...claimed, activity]));
    } catch { return false; }
    void handleEarnXp(amount);
    return true;
  };
  const handleEarnXp = async (amount: number) => {
    const todayStr = localDateStr();
    
    // Add today to study days if not already present
    const updatedStudyDays = [...activeProfile.studyDays];
    if (!updatedStudyDays.includes(todayStr)) {
      updatedStudyDays.push(todayStr);
    }

    // Calculate XP with streak multiplier
    const { totalXp, bonusXp, bonusInfo } = calculateEarnedXp(amount, activeProfile.streak);


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

    if (isLevelUp || justCompleted) playMilestoneChime();
    const message = isLevelUp
      ? `Lên cấp ${newLevelInfo.level}! Shiba mở tiệc mochi 🍡`
      : justCompleted ? 'Đủ 50 XP hôm nay! Shiba vẫy đuôi ăn mừng 🐕'
      : bonusXp > 0 ? `Có thêm ${bonusXp} XP thưởng chuỗi ngày! 🐾` : '';
    window.dispatchEvent(new CustomEvent('nihongo:xp-earned', { detail: { amount: totalXp, message } }));
    if (justCompleted) window.dispatchEvent(new CustomEvent('nihongo:streak-up', { detail: { streak: updatedStreak } }));
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
    const todayStr = localDateStr();
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

  function validRouteLevel(value?: string): JLPTLevel | undefined {
    const upper = value?.toUpperCase();
    return upper && ['N5','N4','N3','N2','N1'].includes(upper) ? upper as JLPTLevel : undefined;
  }
  // Wrapper phải có danh tính cố định: nếu khai báo lại mỗi lần App render thì React mount lại màn hình
  // (cuộn làm đổi showScrollTop -> render -> màn Ngữ pháp bị reset/thoát ra). Props mới đọc qua ref.
  const routeCtx = useRef<any>({});
  routeCtx.current = { activeProfile, updateProfile, handleEarnXp, handleStudyXp, handleTabChange, grammarInitialView, grammarInitialLesson };
  const { RoadmapVocabularyWrapper, RoadmapKanjiWrapper, GrammarPracticeRouteWrapper } = useMemo(() => ({
    RoadmapVocabularyWrapper() {
      const { level } = useParams();
      const c = routeCtx.current;
      return <VocabularyPractice userProfile={c.activeProfile} updateProfile={c.updateProfile} onEarnXp={c.handleEarnXp} initialLevel={validRouteLevel(level)} />;
    },
    RoadmapKanjiWrapper() {
      const { level } = useParams();
      const c = routeCtx.current;
      return <KanjiExplorer userProfile={{ ...c.activeProfile, targetLevel:validRouteLevel(level) || c.activeProfile.targetLevel }} updateProfile={c.updateProfile} onEarnXp={c.handleEarnXp} />;
    },
    GrammarPracticeRouteWrapper() {
      const { lessonId, level } = useParams();
      const c = routeCtx.current;
      const routeLevel = validRouteLevel(level);
      const parsedLesson = lessonId ? parseInt(lessonId, 10) : undefined;
      return (
        <GrammarPractice onStudyReward={c.handleStudyXp}
          userProfile={routeLevel ? { ...c.activeProfile, targetLevel:routeLevel } : c.activeProfile}
          updateProfile={c.updateProfile}
          onEarnXp={c.handleEarnXp}
          onNavigateTab={c.handleTabChange}
          initialViewMode={parsedLesson ? 'lesson-detail' : c.grammarInitialView}
          initialLessonNumber={parsedLesson || c.grammarInitialLesson}
        />
      );
    },
  }), []);

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

      <Route path="/cong-so" element={<Navigate to="/tango" replace />} />
      <Route path="/tu-cua-toi" element={<MyVocabulary userProfile={activeProfile} updateProfile={updateProfile} onEarnXp={handleEarnXp} />} />

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

      {/* 5. Compatibility redirects for retired JLPT Listening links */}
      <Route path="/cho" element={<Navigate to="/jlpt" replace />} />
      <Route path="/cho/:examId" element={<Navigate to="/jlpt" replace />} />

      {/* 6. Luyện thi JLPT & Cấp độ JLPT */}
      <Route path="/jlpt" element={<ExamRouteScreen userProfile={activeProfile} updateProfile={updateProfile} onEarnXp={handleEarnXp} />} />
      <Route path="/jlpt/:level" element={<ExamRouteScreen userProfile={activeProfile} updateProfile={updateProfile} onEarnXp={handleEarnXp} />} />
      <Route path="/jlpt/:level/listening" element={<Navigate to="/jlpt" replace />} />
      <Route path="/jlpt/:level/listening/:examId" element={<Navigate to="/jlpt" replace />} />
      <Route path="/jlpt/:level/vocabulary" element={<RoadmapVocabularyWrapper />} />
      <Route path="/jlpt/:level/grammar" element={<GrammarPracticeRouteWrapper />} />
      <Route path="/jlpt/:level/kanji" element={<RoadmapKanjiWrapper />} />
      <Route path="/jlpt/:level/reading" element={<ReadingExam />} />

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
      <Route path="/doc-hieu" element={<ReadingExam />} />

      <Route path="/sach" element={<Navigate to="/" replace />} />

      {/* 10. AI Kaiwa Chat */}
      <Route 
        path="/chat-ai" 
        element={<JapaneseAiChat onBack={() => handleTabChange('practice')} />} 
      />

      {/* 11. Cộng đồng Kaiwa */}
      <Route path="/cong-dong" element={<Kaiwa />} />

      {/* 12. Sổ tay từ vựng */}
      <Route path="/so-tay" element={<NotebookManager onStudyReward={handleStudyXp} />} />

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

      {/* 14. Tiến độ đã gộp vào Luyện tập (/) */}
      <Route path="/xep-hang" element={<Navigate to="/" replace />} />

      {/* 15. Từ điển Jisho */}
      <Route path="/tu-dien" element={<DictionaryLookup />} />
      <Route path="/shadowing" element={<ShadowingHub onStudyReward={handleStudyXp} />} />

      {/* Trang Bài học Minna đã gỡ: chuyển về Tango */}
      <Route path="/bai-hoc" element={<Navigate to="/tango" replace />} />

      <Route path="/sach" element={<MyBooks />} />

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
      <Route path="/listening" element={<Navigate to="/jlpt" replace />} />
      <Route path="/reading" element={<Navigate to="/doc-hieu" replace />} />
      <Route path="/study-books" element={<Navigate to="/" replace />} />
      <Route path="/notebook" element={<Navigate to="/so-tay" replace />} />
      <Route path="/dictionary" element={<Navigate to="/tu-dien" replace />} />
      <Route path="/roadmap" element={<Navigate to="/lo-trinh" replace />} />
      <Route path="/achievements" element={<Navigate to="/thanh-tich" replace />} />
      <Route path="/progress" element={<Navigate to="/" replace />} />
      <Route path="/tien-do" element={<Navigate to="/" replace />} />
      <Route path="/profile" element={<Navigate to="/tai-khoan" replace />} />
      <Route path="/settings" element={<Navigate to="/cai-dat" replace />} />
      <Route path="/japanese-chat" element={<Navigate to="/chat-ai" replace />} />
      <Route path="/kaiwa" element={<Navigate to="/cong-dong" replace />} />
      <Route path="/lessons" element={<Navigate to="/tango" replace />} />
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
    <MotionConfig reducedMotion="user"><div id="app-root-container" className="flex h-screen overflow-hidden bg-[#0b1120] text-slate-100">
      {/* Particle explosion layer */}
      {!reducedMotion && <ParticleCelebration ref={celebrationRef} />}

      {/* Left Navigation Sidebar Panel */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={handleTabChange} 
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
          <AnimatePresence mode="sync">
            <motion.div
              key={location.pathname}
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, position: 'absolute' } as any}
              transition={{ duration: reducedMotion ? 0 : 0.15, ease: 'easeOut' }}
              className={`w-full ${
                currentTab === 'japanese-chat' 
                  ? 'h-full flex-1 flex flex-col min-h-0 overflow-hidden' 
                  : 'min-h-full flex flex-col'
              }`}
            >
              <Suspense fallback={
                <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
                  <OrbitLoader />
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
      <LearningMotion />
      <StreakCelebration />

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

      <Toasts />
      <CommandPalette />

      {/* Universal Save to Notebook Modal */}
      <SaveToNotebookModal />

      {/* Mazii Word Detail Lookup Modal */}
      {selectedMaziiWord && (
        <React.Suspense fallback={null}><JlptWordDetailModal
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
        /></React.Suspense>
      )}

      {/* PWA Install Banner & Modal */}
      <PwaInstallPrompt />

      {/* Global Floating Vocabulary & Grammar Notifications */}
      <VocabFloatingNotifier onEarnXp={handleEarnXp} />

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
    </div></MotionConfig>
  );
}
