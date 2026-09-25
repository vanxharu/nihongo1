import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookMarked, 
  Puzzle, 
  MessagesSquare, 
  Menu, 
  BarChart3, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Bell, 
  Download, 
  User, 
  LogIn, 
  LogOut,
  X, 
  Flame, 
  Layers, 
  ChevronRight, 
  BookOpen, 
  Bookmark, 
  Search, 
  Radio, 
  Award, 
  Sliders,
  Settings,
  PenTool,
  Route,
  TrendingUp,
  GraduationCap,
  Trophy,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { isSoundEnabled, setSoundEnabled, getPreferredVoice, setPreferredVoice, speakJapanese, AzureVoiceChoice, getVoiceDisplayName } from '../utils/audio';
import { JLPT_LEVEL_INFO } from './LevelProgressBar';
import { getPlayerLevelInfo } from '../utils/xpSystem';
import { calculateUnlockedAchievements, TOTAL_ACHIEVEMENTS_COUNT } from '../data/achievementsData';
import { BRAND_NAME } from '../constants/brand';
import JpStudyLogo from './JpStudyLogo';
import UserAvatar from './UserAvatar';
import VoiceSelectorModal from './VoiceSelectorModal';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onOpenAuth: () => void;
  todayXp?: number;
  onOpenNotifications?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function MobileBottomNav({
  currentTab,
  setCurrentTab,
  userProfile,
  updateProfile,
  onOpenAuth,
  todayXp = 0,
  onOpenNotifications,
  onToggleSidebar,
  isSidebarOpen = false
}: MobileBottomNavProps) {
  const { user, logout } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const unlockedCount = calculateUnlockedAchievements(userProfile).size;
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [currentVoice, setCurrentVoice] = useState<AzureVoiceChoice>(getPreferredVoice());
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  useEffect(() => {
    const handleVoiceChange = (e: any) => {
      if (e.detail?.voice) {
        setCurrentVoice(e.detail.voice);
      } else {
        setCurrentVoice(getPreferredVoice());
      }
    };
    window.addEventListener('jlpt_voice_changed', handleVoiceChange);
    return () => window.removeEventListener('jlpt_voice_changed', handleVoiceChange);
  }, []);

  const handleToggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    setSoundEnabled(nextVal);
  };

  const handleToggleVoice = () => {
    const nextVoice: AzureVoiceChoice = currentVoice.includes('keita') ? 'ja-JP-NanamiNeural' : 'ja-JP-KeitaNeural';
    setCurrentVoice(nextVoice);
    setPreferredVoice(nextVoice);
    speakJapanese(
      nextVoice.includes('keita') ? 'はじめまして！慶太です。' : 'こんにちは！七海です。',
      1.0,
      undefined,
      { voice: nextVoice, isSentence: true }
    );
  };

  const location = useLocation();

  // 5 Main Navigation Items for Mobile Bottom Bar: Luyện tập, Lý thuyết, Lộ trình, Tiến độ, Cá nhân
  const mainNavItems = [
    {
      id: 'practice',
      path: '/',
      label: 'Luyện tập',
      icon: GraduationCap,
      checkActive: (tab: string, pathname: string) => pathname === '/' || tab === 'practice',
    },
    {
      id: 'grammar',
      path: '/bunpo',
      label: 'Lý thuyết',
      icon: FileText,
      checkActive: (tab: string, pathname: string) => ['grammar', 'lessons', 'study-books'].includes(tab) || pathname.startsWith('/bunpo') || pathname.startsWith('/kanji') || pathname.startsWith('/tango'),
    },
    {
      id: 'roadmap',
      path: '/lo-trinh',
      label: 'Lộ trình',
      icon: Route,
      checkActive: (tab: string, pathname: string) => tab === 'roadmap' || pathname.startsWith('/lo-trinh'),
    },
    {
      id: 'progress',
      path: '/xep-hang',
      label: 'Tiến độ',
      icon: TrendingUp,
      checkActive: (tab: string, pathname: string) => tab === 'progress' || pathname.startsWith('/xep-hang'),
    },
    {
      id: 'profile',
      path: '/tai-khoan',
      label: 'Cá nhân',
      icon: User,
      checkActive: (tab: string, pathname: string) => ['profile', 'achievements'].includes(tab) || pathname.startsWith('/tai-khoan') || pathname.startsWith('/cai-dat'),
    }
  ];

  const handleItemClick = (id: string) => {
    setCurrentTab(id);
    setIsMoreOpen(false);
  };

  // Hide mobile bottom navigation bar when inside Japanese AI Chat to provide full-height Messenger experience
  if (currentTab === 'japanese-chat' || location.pathname.startsWith('/chat-ai')) {
    return null;
  }

  return (
    <>
      {/* Pinned Bottom Navigation Bar for Mobile & Tablet (< xl) - Direct Match with Screenshots */}
      <nav 
        id="mobile-bottom-navigation"
        className="fixed bottom-0 left-0 right-0 z-[100] xl:hidden bg-[#0F1424]/95 backdrop-blur-md border-t border-[#1B223C] shadow-2xl select-none px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isTabActive = item.checkActive(currentTab, location.pathname);

            return (
              <Link
                key={item.id}
                id={`mobile-nav-${item.id}`}
                to={item.path}
                onClick={() => handleItemClick(item.id)}
                className="relative flex flex-col items-center justify-center flex-1 py-1 cursor-pointer active:scale-95 transition-all touch-manipulation"
              >
                {/* Active Capsule Pill */}
                <div className={`w-14 h-7.5 rounded-full flex items-center justify-center transition-all ${
                  isTabActive
                    ? 'bg-gradient-to-r from-[#E89A3C]/25 to-[#E64556]/25 text-[#E89A3C] border border-[#E89A3C]/60 shadow-md shadow-amber-950/40'
                    : 'bg-transparent text-slate-400 hover:text-slate-200'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>

                {/* Label Text */}
                <span className={`text-[11px] tracking-tight mt-1 transition-colors ${
                  isTabActive
                    ? 'text-[#E89A3C] font-black'
                    : 'text-slate-400 font-medium'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Modern Slide-up Drawer for "Tùy chọn & Mở rộng" */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] xl:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-lg max-h-[85vh] overflow-y-auto bg-[#0d1624] border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl sm:mb-4 z-[120] p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl xl:hidden space-y-4 text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <Link to="/" onClick={() => setIsMoreOpen(false)} className="outline-hidden">
                  <JpStudyLogo size="sm" dark={true} showSubtitle={true} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Account / Auth Status Card */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#172033] to-[#121927] border border-slate-700/80 flex items-center justify-between gap-3 shadow-md">
                {user ? (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        avatar={userProfile.avatar}
                        name={userProfile.name}
                        fallbackEmoji="🐸"
                        className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/50 text-lg shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{userProfile.name || user.displayName || 'Học viên'}</span>
                          {userProfile.role === 'admin' && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                          <span className="text-emerald-400 font-bold">Lv.{getPlayerLevelInfo(userProfile.xp || 0).level}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold">🔥 {userProfile.streak || 0}d</span>
                          <span>•</span>
                          <span>{userProfile.xp || 0} XP</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMoreOpen(false);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs font-bold transition-all border border-slate-700 hover:border-rose-700 flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Thoát</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200">Chưa đăng nhập</div>
                        <div className="text-[10px] text-slate-400 truncate">Đồng bộ đám mây & lưu chuỗi streak</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreOpen(false);
                        onOpenAuth();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#E89A3C] hover:bg-[#D48628] text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Đăng nhập</span>
                    </button>
                  </>
                )}
              </div>

              {/* Secondary Navigation Items */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'reading', path: '/doc-hieu', label: 'Đọc hiểu & Tin tức', icon: BookOpen, color: 'text-indigo-400', desc: 'Báo chí & Hội thoại' },
                  { id: 'study-books', path: '/sach', label: 'Sách ôn thi', icon: BookMarked, color: 'text-amber-400', desc: '3 Sách N4 chuẩn' },
                  { id: 'japanese-chat', path: '/chat-ai', label: 'Luyện Kaiwa', icon: MessagesSquare, color: 'text-amber-400', desc: 'Hội thoại giao tiếp' },
                  { id: 'notebook', path: '/so-tay', label: 'Sổ tay từ vựng', icon: Bookmark, color: 'text-amber-400', desc: 'Flashcard & Quiz' },
                  { id: 'achievements', path: '/thanh-tich', label: 'Thành tựu', icon: Trophy, color: 'text-amber-400', desc: `Mở khóa ${unlockedCount}/${TOTAL_ACHIEVEMENTS_COUNT}` },
                  { id: 'progress', path: '/xep-hang', label: 'Tiến độ học tập', icon: BarChart3, color: 'text-teal-400', desc: 'Thống kê & Streak' },
                  ...(userProfile?.role === 'admin' ? [
                    { id: 'admin', path: '/admin', label: 'Quản trị Admin', icon: ShieldCheck, color: 'text-amber-400', desc: 'Cài đặt hệ thống' }
                  ] : [])
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id || location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setIsMoreOpen(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                        isActive
                          ? 'bg-[#E89A3C]/20 border-[#E89A3C] text-white'
                          : 'bg-[#12172A] border-[#1B223C] text-slate-200 hover:bg-[#1B223C]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E89A3C]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* JLPT Level Selector */}
              <div className="p-3.5 rounded-2xl bg-[#12172A] border border-[#1B223C] space-y-2">
                <span className="text-xs font-bold text-amber-300">Trình độ JLPT mục tiêu:</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateProfile({ targetLevel: lvl })}
                      className={`py-1 rounded-xl text-xs font-black border transition-all ${
                        userProfile.targetLevel === lvl
                          ? 'bg-[#E89A3C] text-slate-950 border-[#E89A3C] shadow-md shadow-amber-950/40'
                          : 'bg-[#1B223C] text-slate-300 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio & Voice Quick Settings */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer min-h-[44px]"
                >
                  {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                  <span>Âm thanh: {soundOn ? 'BẬT' : 'TẮT'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer min-h-[44px] px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                  title="Chọn giọng đọc"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{getVoiceDisplayName(currentVoice)}</span>
                </button>
              </div>

              {/* Central AI Config Quick Link */}
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  window.dispatchEvent(new CustomEvent('open_ai_config_modal'));
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-purple-200 text-xs font-bold transition-all cursor-pointer hover:bg-purple-900/50"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Cấu hình API kết nối hệ thống</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                  Cài đặt ⚙️
                </span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <VoiceSelectorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceSelected={(v) => setCurrentVoice(v)}
      />
    </>
  );
}
