/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogIn, ChevronRight, ChevronDown, ChevronLeft, RefreshCw, Trophy, Sparkles, Menu, Volume2, VolumeX, TrendingUp, BookOpen, CheckCircle2, Bell, Monitor } from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { isSoundEnabled, setSoundEnabled, getPreferredVoice, setPreferredVoice, speakJapanese, AzureVoiceChoice, getVoiceDisplayName } from '../utils/audio';
import PwaInstallPrompt from './PwaInstallPrompt';
import JpStudyLogo from './JpStudyLogo';
import NotificationSettingsModal from './NotificationSettingsModal';
import AIConfigModal from './AIConfigModal';
import ConfirmModal from './ConfirmModal';
import LevelProgressBar from './LevelProgressBar';
import UserAvatar from './UserAvatar';
import VoiceSelectorModal from './VoiceSelectorModal';
import { getPlayerLevelInfo } from '../utils/xpSystem';
import { BRAND_NAME } from '../constants/brand';

interface HeaderProps {
  currentTab: string;
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onResetProgress: () => void;
  onToggleSidebar: () => void;
  onOpenAuth: () => void;
  todayXp: number;
  onTriggerCelebration?: () => void;
  setCurrentTab?: (tab: string) => void;
}

export default function Header({ 
  currentTab, 
  userProfile, 
  updateProfile, 
  onResetProgress, 
  onToggleSidebar, 
  onOpenAuth,
  todayXp,
  onTriggerCelebration,
  setCurrentTab
}: HeaderProps) {
  const { user, logout, quickLogin, authStatus, loading } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const [tempTarget, setTempTarget] = useState(userProfile.targetLevel);

  const getDisplayUserName = (name?: string, email?: string | null) => {
    if (name && name !== 'Học viên JLPT' && !name.includes('@')) {
      return name;
    }
    if (email) {
      return email.split('@')[0];
    }
    return name || 'Học viên';
  };

  useEffect(() => {
    const handleOpenAiConfig = () => setIsAiConfigModalOpen(true);
    window.addEventListener('open_ai_config_modal', handleOpenAiConfig);
    return () => window.removeEventListener('open_ai_config_modal', handleOpenAiConfig);
  }, []);

  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [currentVoice, setCurrentVoice] = useState<AzureVoiceChoice>(getPreferredVoice());
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    const handleSoundChange = () => {
      setSoundOn(isSoundEnabled());
    };
    const handleVoiceChange = (e: any) => {
      setCurrentVoice(e.detail?.voice || getPreferredVoice());
    };
    const handleOpenNotificationModal = () => {
      setIsNotificationModalOpen(true);
    };
    window.addEventListener('jlpt_sound_setting_changed', handleSoundChange);
    window.addEventListener('jlpt_voice_changed', handleVoiceChange);
    window.addEventListener('open_notification_settings', handleOpenNotificationModal);
    return () => {
      window.removeEventListener('jlpt_sound_setting_changed', handleSoundChange);
      window.removeEventListener('jlpt_voice_changed', handleVoiceChange);
      window.removeEventListener('open_notification_settings', handleOpenNotificationModal);
    };
  }, []);

  const handleToggleVoice = () => {
    const nextVoice: AzureVoiceChoice = currentVoice.includes('keita') ? 'ja-JP-NanamiNeural' : 'ja-JP-KeitaNeural';
    setCurrentVoice(nextVoice);
    setPreferredVoice(nextVoice);
    handleTestVoice(nextVoice);
  };

  const handleTestVoice = (voiceToTest: AzureVoiceChoice) => {
    setIsPlayingTestVoice(true);
    let sampleSentence = 'こんにちは！七海です。日本語の発音を練習しましょう。';
    if (voiceToTest.includes('keita')) {
      sampleSentence = 'はじめまして！慶太です。JLPT試験に向けて一緒に頑張りましょう。';
    } else if (voiceToTest.includes('daichi')) {
      sampleSentence = '大地です！今日も日本語の勉強を続けましょう。';
    } else if (voiceToTest.includes('aoi')) {
      sampleSentence = '葵です！日本語の単語と文法を楽しく覚えましょう。';
    }
    
    speakJapanese(sampleSentence, 1.0, () => {
      setIsPlayingTestVoice(false);
    }, { voice: voiceToTest, isSentence: true });
  };

  const location = useLocation();

  const handleToggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    setSoundEnabled(nextVal);
  };

  const getTabTitle = () => {
    switch (currentTab) {
      case 'practice':
        return 'Trung tâm Luyện tập';
      case 'listening':
        return 'JLPT Listening (聴解)';
      case 'kanji':
        return 'Thư viện Hán tự (Kanji)';
      case 'grammar':
        return 'Lý thuyết (Ngữ pháp, Từ vựng, Hán tự)';
      case 'vocabulary':
        return 'Chữ – Từ vựng (文字・語彙)';
      case 'reading':
        return 'Đọc hiểu & Tin tức (読解)';
      case 'kaiwa':
        return 'Nghe hiểu & Hội thoại (聴解)';
      case 'exam':
      case 'daily-exam':
      case 'jlpt-exam':
        return 'Luyện thi JLPT';
      case 'roadmap':
        return 'Lộ trình JLPT';
      case 'study-books':
        return 'Sách ôn thi JLPT';
      case 'notebook':
        return 'Sổ tay từ vựng';
      case 'japanese-chat':
        return 'Chat AI Tiếng Nhật (100% JP)';
      case 'handwriting':
        return 'Luyện Viết Bút & Chấm Điểm AI';
      case 'progress':
        return 'Tiến độ học tập chi tiết';
      case 'achievements':
        return 'Thành tựu';
      case 'profile':
        return 'Tài khoản & Cài đặt';
      case 'admin':
        return 'Quản trị hệ thống';
      default:
        return 'Học tiếng Nhật';
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: tempName || 'Học viên JLPT',
      targetLevel: tempTarget
    });
    setIsProfileOpen(false);
  };

  const avatars = ['🐕', '🦊', '🌸', '🐱', '🐼', '🐸', '🐨', '🦄', '🐯', '🐙', '🐶', '🐰', '🦁', '🦉', '🐢', '🦖', '😀', '😎', '🤓', '😇', '🤖'];

  // Calculate learning progress
  const dailyPercent = Math.min(100, Math.round((todayXp / 50) * 100));
  const vocabLearned = Object.keys(userProfile.vocabStatus || {}).length;
  const kanjiLearned = Object.keys(userProfile.kanjiStatus || {}).length;
  const grammarLearned = Object.keys(userProfile.grammarStatus || {}).length;
  const totalLearned = vocabLearned + kanjiLearned + grammarLearned;

  return (
    <>
      {/* Sleek, Dark Minimalist Status Bar for Mobile & Tablet (< xl) - Hidden on Practice, Profile & Japanese AI Chat to provide full Messenger chat canvas */}
      {!['practice', 'profile', 'japanese-chat'].includes(currentTab) && (
        <header 
          id="mobile-tablet-header"
          className="xl:hidden flex items-center justify-between h-11 px-3 sm:px-4 bg-[#0F1424]/95 backdrop-blur-md border-b border-[#1B223C] sticky top-0 z-40 select-none shrink-0 pt-[env(safe-area-inset-top,0px)]"
        >
          {/* Left: Back button to Practice Hub + Tab Title */}
          <div className="flex items-center gap-2 min-w-0">
            {setCurrentTab && (
              <button
                type="button"
                onClick={() => setCurrentTab('practice')}
                className="flex items-center gap-1 text-[#E89A3C] hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Luyện tập</span>
              </button>
            )}
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
              {getTabTitle()}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1B223C] border border-[#E89A3C]/40 text-amber-300 shrink-0">
              {userProfile.targetLevel}
            </span>
          </div>

          {/* Right: Quick Streak, Level & Sound Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Streak & Level Pill - Tap to open profile drawer */}
            <button
              type="button"
              onClick={() => {
                if (setCurrentTab) {
                  setCurrentTab('profile');
                } else {
                  setTempName(userProfile.name);
                  setTempTarget(userProfile.targetLevel);
                  setIsProfileOpen(true);
                }
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1B223C] hover:bg-[#242E52] border border-[#E89A3C]/40 text-[11px] font-bold text-amber-300 active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Xem hồ sơ & Tiến độ"
            >
              <span>🔥 {userProfile.streak || 0}</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-200 font-mono">Lv.{getPlayerLevelInfo(userProfile.xp || 0).level}</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundOn 
                  ? 'text-[#E89A3C] bg-[#1B223C] border-[#E89A3C]/50' 
                  : 'text-slate-500 bg-[#12172A] border-slate-800'
              }`}
              title={soundOn ? "Đang bật âm thanh" : "Đang tắt âm thanh"}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>
      )}

      {/* Desktop Header Dashboard (Shown ONLY on xl: screens >= 1280px) */}
      <header 
        id="app-header" 
        className="hidden xl:flex h-14 sm:h-16 border-b border-[#1B223C] bg-[#0F1424]/95 backdrop-blur-md px-6 items-center justify-between sticky top-0 z-40 select-none shrink-0"
      >
        {/* Left side: Breadcrumb and Target Level */}
        <div id="header-pathway" className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 text-sm">
            <Link to="/" className="font-extrabold text-slate-400 hover:text-white transition-colors shrink-0">
              {BRAND_NAME}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="font-bold text-slate-100 tracking-tight truncate">{getTabTitle()}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#1B223C] border border-[#E89A3C]/40 text-amber-300 shrink-0 ml-1">
              JLPT {userProfile.targetLevel}
            </span>
          </div>
        </div>

      {/* Center Spacer */}
      <div className="flex-1" />

      {/* Right side: Clean Stats, Audio Toggle, and User Profile Menu */}
      <div id="header-actions" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Level & Streak Stats Pill */}
        <LevelProgressBar
          userProfile={userProfile}
          todayXp={todayXp}
          onOpenProfile={() => {
            setTempName(userProfile.name);
            setTempTarget(userProfile.targetLevel);
            setIsProfileOpen(true);
          }}
          onTriggerCelebration={onTriggerCelebration}
          onNavigateTab={setCurrentTab}
        />

        {/* Sound FX Toggle Button */}
        <button
          id="header-sound-toggle"
          onClick={handleToggleSound}
          className={`hidden sm:flex p-2 rounded-lg transition-colors items-center justify-center cursor-pointer shrink-0 ${
            soundOn 
              ? 'text-[#E89A3C] bg-[#1B223C] border border-[#E89A3C]/40 hover:bg-[#242E52]' 
              : 'text-slate-400 bg-[#12172A] border border-slate-800 hover:bg-[#1B223C] hover:text-slate-200'
          }`}
          title={soundOn ? "Đang bật âm thanh (Bấm để tắt)" : "Đang tắt âm thanh (Bấm để bật)"}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* User profile button / Login button */}
        {(authStatus === 'AUTH_INITIALIZING' || loading) ? (
          <div 
            id="header-auth-checking"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-semibold animate-pulse select-none shrink-0"
            title="Đang đồng bộ trạng thái đăng nhập..."
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E89A3C]" />
            <span className="hidden sm:inline">Đang kiểm tra...</span>
          </div>
        ) : !user ? (
          <button
            id="header-login-btn"
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E89A3C] hover:bg-[#D48628] text-slate-950 font-black text-xs transition-colors shadow-xs cursor-pointer shrink-0"
            title="Đăng nhập để lưu trữ tiến độ và đồng bộ đám mây"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </button>
        ) : (
          <button
            id="header-profile-toggle"
            onClick={() => {
              setTempName(userProfile.name);
              setTempTarget(userProfile.targetLevel);
              setIsProfileOpen(!isProfileOpen);
            }}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
            title="Hồ sơ học tập & Cài đặt hệ thống"
          >
            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 text-sm">
              <UserAvatar avatar={userProfile.avatar} name={userProfile.name} fallbackEmoji="🦊" className="w-6 h-6 rounded-full text-xs" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-800 max-w-[110px] truncate">
              {getDisplayUserName(userProfile.name, user?.email)}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Profile/Settings Drawer overlay */}
      {isProfileOpen && (
        <div 
          id="profile-drawer-backdrop" 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end"
          onClick={() => setIsProfileOpen(false)}
        >
          <div 
            id="profile-drawer-content" 
            className="w-full sm:w-96 max-w-full bg-white border-l border-slate-100 h-full p-6 flex flex-col justify-between shadow-2xl relative animate-slide-left overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top info */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
                <h3 className="font-display font-bold text-slate-950 text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-600" />
                  Hồ sơ học tập
                </h3>
                <button 
                  id="profile-drawer-close"
                  onClick={() => setIsProfileOpen(false)}
                  className="text-slate-400 hover:text-slate-800 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Cloud Sync Section */}
              {user ? (
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl mb-5 text-xs text-emerald-800 flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-emerald-900">Đã đồng bộ đám mây (Cloud)</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px] mt-1 truncate">{user.email}</span>
                  
                  {/* If user is admin, show admin badge and navigation link; otherwise purely student view */}
                  {userProfile.role === 'admin' && (
                    <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        Quyền Quản Trị (Admin)
                      </span>
                      {setCurrentTab && (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentTab('admin');
                            setIsProfileOpen(false);
                          }}
                          className="text-xs font-black text-amber-700 hover:text-amber-800 underline cursor-pointer"
                        >
                          Mở trang Quản trị →
                        </button>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: 'Đăng xuất tài khoản',
                        message: 'Bạn có chắc chắn muốn đăng xuất tài khoản của mình?',
                        onConfirm: () => {
                          logout();
                          setIsProfileOpen(false);
                        },
                        isDanger: true
                      });
                    }}
                    className="mt-2.5 text-rose-600 hover:text-rose-700 font-bold transition-all text-xs text-left cursor-pointer"
                  >
                    Đăng xuất tài khoản
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl mb-5 text-xs text-amber-800">
                  <p className="font-bold flex items-center gap-1 text-amber-900">
                    ⚠️ Chế độ khách (Offline)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Tiến trình chỉ lưu tạm ở trình duyệt này. Hãy đăng nhập để lưu trữ vĩnh viễn và đồng bộ streak!</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenAuth();
                    }}
                    className="mt-2.5 w-full py-2 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-xl transition-all text-xs cursor-pointer shadow-md shadow-slate-600/10"
                  >
                    Đăng nhập / Đăng ký ngay
                  </button>
                </div>
              )}

              {/* Avatar options */}
              <div className="mb-6">
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-bold">Chọn ảnh đại diện</label>
                <div className="grid grid-cols-5 gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {avatars.map((av) => (
                    <button
                      key={av}
                      id={`avatar-choice-${av}`}
                      type="button"
                      onClick={() => updateProfile({ avatar: av })}
                      className={`text-2xl p-2 rounded-lg transition-transform hover:scale-125 cursor-pointer ${
                        userProfile.avatar === av ? 'bg-slate-50 border border-slate-400' : 'bg-white border border-slate-50'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile details form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-bold">Họ và tên</label>
                  <input
                    id="profile-input-name"
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Nhập tên của bạn..."
                    className="w-full bg-white border border-slate-100 focus:border-slate-500 rounded-xl px-4 py-2.5 text-slate-950 text-sm outline-hidden font-medium focus:ring-1 focus:ring-slate-500"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-bold">Mục tiêu JLPT hiện tại</label>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        id={`target-level-choice-${lvl}`}
                        type="button"
                        onClick={() => setTempTarget(lvl)}
                        className={`py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          tempTarget === lvl
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20'
                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-400 hover:text-slate-950'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Microsoft Azure Neural Voice Selector (Nanami ⭐⭐⭐⭐⭐ & Keita ⭐⭐⭐⭐⭐) */}
                <div id="profile-azure-voice-settings" className="border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-slate-900 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <span>🥇</span> Giọng đọc Azure Neural (JLPT)
                    </label>
                    <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      Gần đề thi JLPT nhất
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Nanami Neural (Female) */}
                    <button
                      type="button"
                      id="voice-select-nanami"
                      onClick={() => {
                        setCurrentVoice('ja-JP-NanamiNeural');
                        setPreferredVoice('ja-JP-NanamiNeural');
                        handleTestVoice('ja-JP-NanamiNeural');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                        !currentVoice.includes('keita')
                          ? 'bg-pink-50 border-pink-400 text-pink-950 shadow-sm ring-1 ring-pink-400'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">👩</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-200/80 text-pink-800">
                          Nữ ⭐5
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="font-bold text-xs">NanamiNeural</div>
                        <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight mt-0.5">
                          Phát thanh viên Tokyo, trong trẻo, tự nhiên
                        </div>
                      </div>
                    </button>

                    {/* Keita Neural (Male) */}
                    <button
                      type="button"
                      id="voice-select-keita"
                      onClick={() => {
                        setCurrentVoice('ja-JP-KeitaNeural');
                        setPreferredVoice('ja-JP-KeitaNeural');
                        handleTestVoice('ja-JP-KeitaNeural');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                        currentVoice.includes('keita')
                          ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-sm ring-1 ring-blue-400'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">👨</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200/80 text-blue-800">
                          Nam ⭐5
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="font-bold text-xs">KeitaNeural</div>
                        <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight mt-0.5">
                          Chuẩn đề thi JLPT N4–N2, trầm ấm, dứt khoát
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Test voice audio button */}
                  <button
                    type="button"
                    onClick={() => handleTestVoice(currentVoice)}
                    disabled={isPlayingTestVoice}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingTestVoice ? 'animate-bounce text-pink-600' : 'text-slate-600'}`} />
                    <span>{isPlayingTestVoice ? 'Đang phát âm thanh mẫu...' : `Nghe thử giọng ${currentVoice.includes('keita') ? 'Keita (Nam)' : 'Nanami (Nữ)'}`}</span>
                  </button>
                  
                  {/* More voices button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsVoiceModalOpen(true)}
                      className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Chọn từ 7 giọng AI chuẩn & giọng thiết bị ({getVoiceDisplayName(currentVoice)})</span>
                    </button>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <span>✨</span>
                    <span>Tự động ngắt nghỉ, nhấn từ khóa và chuẩn nhịp JLPT N4–N2.</span>
                  </div>
                </div>

                {/* Profile Save Button */}
                <button
                  id="profile-btn-save"
                  type="submit"
                  className="w-full py-3 bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-slate-600/20 mt-4 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </form>
            </div>

            {/* Bottom tools (PWA, AI Config, Notifications, Reset progress) */}
            <div className="space-y-3 pt-6 border-t border-slate-50">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsPwaModalOpen(true);
                }}
                className="w-full py-2.5 px-3 bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-900 font-bold text-xs rounded-xl transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-sky-600" />
                  Cài đặt App (Windows PC / Mobile)
                </span>
                <span className="text-[10px] font-mono bg-sky-200 px-2 py-0.5 rounded text-sky-900 font-black">
                  Cài đặt 💻
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsAiConfigModalOpen(true);
                }}
                className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 font-bold text-xs rounded-xl transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Cấu hình API ChatGPT / AI dùng chung
                </span>
                <span className="text-[10px] font-mono bg-purple-200 px-2 py-0.5 rounded text-purple-900 font-black">
                  Cài đặt ⚙️
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsNotificationModalOpen(true);
                }}
                className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-800 font-bold text-xs rounded-xl transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-600" />
                  Nhắc nhở học tập hàng ngày
                </span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded text-rose-600 font-black">
                  Cài đặt ⚙️
                </span>
              </button>

              <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Tổng kinh nghiệm:</span>
                <span className="font-mono text-slate-950 font-bold flex items-center gap-1 text-purple-600">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  {userProfile.xp} XP
                </span>
              </div>

              <button
                id="profile-btn-reset"
                type="button"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Đặt lại toàn bộ tiến độ',
                    message: 'Bạn có chắc chắn muốn xóa hết tất cả tiến độ học tập và điểm XP để học lại từ đầu? Thao tác này không thể hoàn tác!',
                    onConfirm: () => {
                      onResetProgress();
                      setIsProfileOpen(false);
                    },
                    isDanger: true
                  });
                }}
                className="w-full py-3 border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                LÀM MỚI TOÀN BỘ TIẾN ĐỘ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      <NotificationSettingsModal 
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)} 
      />

      {/* AI Central Configuration Modal */}
      <AIConfigModal
        isOpen={isAiConfigModalOpen}
        onClose={() => setIsAiConfigModalOpen(false)}
      />

      {/* PWA Install Guide Modal */}
      {isPwaModalOpen && (
        <PwaInstallPrompt onDismiss={() => setIsPwaModalOpen(false)} />
      )}

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        isDanger={confirmDialog.isDanger}
        onClose={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />

      <VoiceSelectorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceSelected={(v) => setCurrentVoice(v)}
      />
    </header>
    </>
  );
}
