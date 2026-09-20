import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Award, 
  User, 
  ChevronRight, 
  Bookmark, 
  Users, 
  Network, 
  Volume2, 
  VolumeX, 
  Bell, 
  Download, 
  RefreshCw, 
  LogOut, 
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';
import { UserProfile, JLPTLevel } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { AchievementMascotIcon } from '../achievements/AchievementMascotIcon';
import { ACHIEVEMENTS_LIST, calculateUnlockedAchievements } from '../../data/achievementsData';
import { 
  isSoundEnabled, 
  setSoundEnabled, 
  getPreferredVoice, 
  setPreferredVoice, 
  speakJapanese, 
  AzureVoiceChoice,
  getVoiceDisplayName 
} from '../../utils/audio';
import PremiumModal from './PremiumModal';
import ConfirmModal from '../ConfirmModal';
import ShibaMascot from '../mascot/ShibaMascot';
import UserAvatar from '../UserAvatar';
import VoiceSelectorModal from '../VoiceSelectorModal';

interface MobileProfileViewProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (tab: string, extra?: any) => void;
  onOpenAuth: () => void;
  onResetProgress?: () => void;
}

const AVATARS = ['🦊', '🐱', '🐶', '🐼', '🦁', '🐯', '🐰', '🐻', '🐨', '🐵', '🌸', '⚡'];

export default function MobileProfileView({
  userProfile,
  updateProfile,
  onNavigate,
  onOpenAuth,
  onResetProgress
}: MobileProfileViewProps) {
  const { user, logout } = useAuth();
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [currentVoice, setCurrentVoice] = useState<AzureVoiceChoice>(getPreferredVoice());
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Sync voice preference when changed from other components or storage
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

  // Profile Details Modal States (for logged-in user)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name || (user?.displayName || ''));
  const [tempAvatar, setTempAvatar] = useState(userProfile.avatar || '🦊');
  const [tempLevel, setTempLevel] = useState<JLPTLevel>(userProfile.targetLevel || 'N4');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const unlockedSet = calculateUnlockedAchievements(userProfile);
  const unlockedCount = unlockedSet.size;
  const targetLevel = userProfile.targetLevel || 'N4';
  const savedVocabCount = (userProfile.savedVocab || []).length;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NihonGo! - Học tiếng Nhật & Luyện thi JLPT',
          text: `Tôi đang học tiếng Nhật cấp độ ${targetLevel} và đạt chuỗi 🔥 ${userProfile.streak || 1} ngày! Cùng học nhé:`,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

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

  // Preview the first 6 achievements
  const previewAchievements = ACHIEVEMENTS_LIST.slice(0, 6);

  return (
    <div className="w-full max-w-lg md:max-w-2xl mx-auto px-4 py-3 space-y-6 text-white pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Cá nhân
        </h1>
        <button
          type="button"
          onClick={handleShare}
          className="p-2.5 rounded-full bg-[#121929] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all active:scale-95 cursor-pointer relative"
          title="Chia sẻ ứng dụng"
        >
          <Share2 className="w-5 h-5" />
          {copiedShare && (
            <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
              Đã sao chép liên kết!
            </span>
          )}
        </button>
      </div>

      {/* Banner: Nâng cấp Premium (Nihon Shiba Gold & Red gradient card) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#E89A3C] via-[#F5A623] to-[#E64556] text-white shadow-xl shadow-amber-950/30 flex items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute right-12 -bottom-4 opacity-25 pointer-events-none">
          <ShibaMascot pose="celebrating" size={110} animated={false} />
        </div>
        <div className="flex items-center gap-3.5 min-w-0 z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shrink-0 shadow-inner">
            <ShibaMascot pose="happy" size={36} animated={false} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              Nâng cấp Premium
              <span className="text-[10px] bg-slate-950/30 px-2 py-0.5 rounded-full font-mono font-black uppercase">PRO</span>
            </h3>
            <p className="text-xs text-amber-100 truncate mt-0.5">
              Mở khóa toàn bộ bài học & AI Nihon Shiba
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPremiumOpen(true)}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs rounded-full shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer z-10"
        >
          Nâng cấp
        </button>
      </div>

      {/* Linh vật Nihon Shiba Companion Card */}
      <div 
        onClick={() => onNavigate('japanese-chat')}
        className="p-4 rounded-3xl bg-[#1B223C] border-2 border-[#E89A3C]/40 shadow-xl flex items-center justify-between gap-3 cursor-pointer hover:border-[#E89A3C] transition-all group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#E89A3C]/20 border border-[#E89A3C]/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShibaMascot pose="speaking" size={40} animated={false} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                Nihon Shiba (にほんしば)
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded-full">
                Bạn đồng hành
              </span>
            </div>
            <p className="text-xs text-amber-100/80 truncate mt-0.5">
              🔥 Chuỗi {userProfile.streak || 0} ngày • "Cùng cố gắng nào!"
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-black text-[#E89A3C] shrink-0">
          <span>Chat AI</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Card: Đăng nhập / Thông tin người dùng */}
      <button
        type="button"
        onClick={() => {
          if (!user) {
            onOpenAuth();
          } else {
            setTempName(userProfile.name || user.displayName || user.email?.split('@')[0] || 'Học viên JLPT');
            setTempAvatar(userProfile.avatar || '🦊');
            setTempLevel(userProfile.targetLevel || 'N4');
            setIsProfileModalOpen(true);
          }
        }}
        className="w-full p-4 rounded-2xl bg-[#12172A] border border-[#1B223C] hover:border-[#E89A3C]/50 transition-all flex items-center justify-between gap-3 text-left active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <UserAvatar
            avatar={user && userProfile.avatar ? userProfile.avatar : null}
            name={userProfile.name}
            fallbackEmoji="🦊"
            className="w-11 h-11 rounded-2xl bg-[#E89A3C]/15 border border-[#E89A3C]/30 text-amber-400 text-2xl shrink-0"
          />
          <div className="min-w-0">
            <div className="text-sm font-black text-white truncate">
              {user ? (userProfile.name || user.displayName || user.email?.split('@')[0] || 'Học viên NihonGo') : 'Đăng nhập'}
            </div>
            <div className="text-xs text-slate-400 truncate mt-0.5">
              {user 
                ? `Cấp độ ${targetLevel} • ${userProfile.xp || 0} XP • 🔥 ${userProfile.streak || 0} ngày` 
                : 'Đồng bộ tiến độ & luyện thi online'}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
      </button>

      {/* Section: Thành tựu (3/49) with Xem tất cả */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐶</span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Thành tựu ({unlockedCount}/{ACHIEVEMENTS_LIST.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('achievements')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            Xem tất cả
          </button>
        </div>

        {/* Horizontal scroll of cute achievement cards */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {previewAchievements.map((ach) => {
            const isUnlocked = unlockedSet.has(ach.id) || !!ach.unlockedByDefault;
            return (
              <button
                key={ach.id}
                type="button"
                onClick={() => onNavigate('achievements')}
                className={`shrink-0 w-32 p-3.5 rounded-2xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 ${
                  isUnlocked
                    ? 'bg-[#141b2e] border-amber-500/40 shadow-lg shadow-amber-950/20'
                    : 'bg-[#101524] border-slate-800/80 opacity-70'
                }`}
              >
                <div className="h-16 flex items-center justify-center">
                  <AchievementMascotIcon
                    type={ach.character}
                    isUnlocked={isUnlocked}
                    size={52}
                  />
                </div>
                <div className="mt-2 w-full">
                  <span className={`text-[11px] font-bold block truncate ${
                    isUnlocked ? 'text-amber-200' : 'text-slate-400'
                  }`}>
                    {ach.title}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {isUnlocked ? 'Đã nhận' : `+${ach.rewardXp || 20} XP`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card: Đã lưu */}
      <button
        type="button"
        onClick={() => onNavigate('notebook')}
        className="w-full p-4 rounded-2xl bg-[#121929] border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3 active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Bookmark className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white">Đã lưu</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <span>{savedVocabCount}</span>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </button>

      {/* Section: Cài đặt học tập */}
      <div className="space-y-3 pt-1">
        <h2 className="text-base sm:text-lg font-bold text-white">
          Cài đặt học tập
        </h2>

        <div className="rounded-2xl bg-[#121929] border border-slate-800/80 overflow-hidden divide-y divide-slate-800/70">
          {/* Cộng đồng học tập */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-200">Cộng đồng học tập</div>
                <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
                  Giao lưu cùng hơn 50.000 người học tiếng Nhật
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
          </a>

          {/* Mạng lưới đã lưu */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-200">Mạng lưới đã lưu</div>
                <div className="text-[11px] text-slate-400">Đồng bộ đám mây</div>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">0</span>
          </div>

          {/* Đổi cấp độ JLPT mục tiêu */}
          <div className="p-4 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">Mục tiêu JLPT</div>
              <div className="text-[11px] text-slate-400">Điều chỉnh độ khó bài học</div>
            </div>
            <div className="flex items-center gap-1">
              {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => updateProfile({ targetLevel: lvl })}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    targetLevel === lvl
                      ? 'bg-[#E89A3C] text-slate-950 shadow-md shadow-amber-950/40'
                      : 'bg-[#1B223C] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Âm thanh & Giọng đọc AI */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div 
              onClick={() => setIsVoiceModalOpen(true)}
              className="cursor-pointer select-none min-w-0"
              title="Nhấn để đổi giọng đọc"
            >
              <div className="text-xs sm:text-sm font-bold text-slate-200 hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Giọng đọc & Âm thanh</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                <span className="text-amber-400 font-semibold">{getVoiceDisplayName(currentVoice)}</span>
                {' • '}
                <span>{soundOn ? 'Bật âm thanh' : 'Tắt âm thanh'}</span>
                {' • '}
                <span className="text-sky-400 font-medium">Đổi giọng</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="min-h-[44px] px-3 py-2 bg-[#1B223C] hover:bg-[#242E52] text-amber-200 border border-[#E89A3C]/40 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow-xs"
                title="Chọn giọng đọc tiếng Nhật"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{getVoiceDisplayName(currentVoice)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400/60" />
              </button>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center ${
                  soundOn 
                    ? 'bg-[#E89A3C]/20 text-[#E89A3C] border border-[#E89A3C]/40 hover:bg-[#E89A3C]/30' 
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
                title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Thông báo học tập */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open_notification_settings'))}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-200">Nhắc nhở học tập</div>
                <div className="text-[11px] text-slate-400">Giữ vững chuỗi streak mỗi ngày</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Dữ liệu ngoại tuyến */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-200">Dữ liệu Offline</div>
                <div className="text-[11px] text-slate-400">Tự động lưu bài học vào bộ nhớ đệm</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Đã tải 100%
            </span>
          </div>

          {/* Đặt lại tiến độ học tập */}
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-left cursor-pointer text-slate-400 hover:text-rose-400"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold">Đặt lại tiến độ</div>
                <div className="text-[11px] text-slate-500">Xóa dữ liệu bài học trên thiết bị</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Đăng xuất nếu đã login */}
          {user && (
            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-rose-500/10 transition-colors text-left cursor-pointer text-rose-400"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold">Đăng xuất tài khoản</div>
                  <div className="text-[11px] text-rose-300/80">{user.email}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <PremiumModal isOpen={isPremiumOpen} onClose={() => setIsPremiumOpen(false)} />
      
      {/* Modal: Chi tiết Hồ sơ Học viên (khi bấm vào thẻ học viên) */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-md bg-[#0c1322] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl text-white p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Hồ sơ học tập</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Thông tin tài khoản & tùy chỉnh cá nhân</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cloud Account Sync Card */}
              <div className="p-3.5 rounded-2xl bg-[#121929] border border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">Đã đồng bộ đám mây (Cloud)</span>
                  </div>
                  {userProfile.role === 'admin' ? (
                    <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      👑 Quản trị viên
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
                      🎓 Học viên JLPT
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-300 truncate">
                  {user?.email || 'Tài khoản học viên'}
                </div>
                {userProfile.role === 'admin' && (
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        onNavigate('admin');
                      }}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Mở bảng Quản trị hệ thống →
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Ảnh đại diện
                  </label>
                  <div className="flex items-center gap-2">
                    <UserAvatar avatar={tempAvatar} name={tempName} className="w-7 h-7 rounded-lg border border-amber-400/50 bg-[#12172A] text-sm" />
                    <span className="text-slate-500 font-normal text-[11px]">Đang chọn</span>
                  </div>
                </div>

                {user?.photoURL && (
                  <button
                    type="button"
                    onClick={() => setTempAvatar(user.photoURL!)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tempAvatar === user.photoURL
                        ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-300'
                        : 'bg-[#12172A] border border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserAvatar avatar={user.photoURL} className="w-6 h-6 rounded-full" />
                    <span>Dùng ảnh đại diện tài khoản</span>
                  </button>
                )}

                <div className="grid grid-cols-6 gap-2 bg-[#12172A] p-2.5 rounded-2xl border border-slate-800">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setTempAvatar(av)}
                      className={`text-2xl p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                        tempAvatar === av
                          ? 'bg-amber-500/20 border-2 border-amber-500 scale-110 shadow-sm'
                          : 'bg-[#1B223C]/50 border border-slate-700/50 hover:bg-[#1B223C]'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Họ và tên / Biệt danh hiển thị
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Nhập tên của bạn..."
                  className="w-full bg-[#12172A] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white text-sm outline-hidden font-medium focus:ring-1 focus:ring-amber-400 transition-all"
                  maxLength={30}
                />
              </div>

              {/* JLPT Target Level Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Mục tiêu JLPT
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setTempLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        tempLevel === lvl
                          ? 'bg-[#E89A3C] text-slate-950 shadow-md shadow-amber-950/40'
                          : 'bg-[#12172A] border border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick stats recap */}
              <div className="grid grid-cols-3 gap-2 py-1">
                <div className="p-2.5 rounded-xl bg-[#12172A] border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-bold">Chuỗi streak</div>
                  <div className="text-sm font-black text-amber-400 mt-0.5">🔥 {userProfile.streak || 0} ngày</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#12172A] border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-bold">Điểm XP</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">⚡ {userProfile.xp || 0}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#12172A] border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-bold">Sổ từ vựng</div>
                  <div className="text-sm font-black text-sky-400 mt-0.5">🔖 {savedVocabCount}</div>
                </div>
              </div>

              {/* Save message toast */}
              {saveSuccessMsg && (
                <div className="text-center text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 py-2 rounded-xl">
                  ✓ Đã lưu thay đổi hồ sơ thành công!
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={async () => {
                    setIsSavingProfile(true);
                    await updateProfile({
                      name: tempName.trim() || userProfile.name,
                      avatar: tempAvatar,
                      targetLevel: tempLevel
                    });
                    setIsSavingProfile(false);
                    setSaveSuccessMsg(true);
                    setTimeout(() => {
                      setSaveSuccessMsg(false);
                      setIsProfileModalOpen(false);
                    }, 800);
                  }}
                  className="w-full py-3 bg-[#E89A3C] hover:bg-[#D48628] text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-950/40 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setIsLogoutConfirmOpen(true);
                  }}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Đăng xuất Modal */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="Đăng xuất tài khoản?"
        message="Bạn có chắc chắn muốn đăng xuất tài khoản của mình? Bạn có thể đăng nhập lại bất cứ lúc nào."
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        onConfirm={() => {
          logout();
          setIsLogoutConfirmOpen(false);
        }}
        onClose={() => setIsLogoutConfirmOpen(false)}
        isDanger={true}
      />

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Đặt lại toàn bộ tiến độ?"
        message="Hành động này sẽ xóa toàn bộ điểm kinh nghiệm (XP), chuỗi streak và lịch sử học tập trên thiết bị này. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Xác nhận đặt lại"
        cancelText="Hủy bỏ"
        onConfirm={() => {
          if (onResetProgress) onResetProgress();
          setIsResetConfirmOpen(false);
        }}
        onClose={() => setIsResetConfirmOpen(false)}
      />

      {/* Voice Selector Modal (Mobile Sheet / Dialog) */}
      <VoiceSelectorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceSelected={(voice) => setCurrentVoice(voice)}
      />
    </div>
  );
}
