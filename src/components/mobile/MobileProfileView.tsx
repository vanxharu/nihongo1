import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Award, 
  User, 
  ChevronRight, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Bell, 
  Download, 
  RefreshCw, 
  LogOut, 
  ShieldCheck,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';
import { UserProfile, JLPTLevel } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { AchievementMascotIcon } from '../achievements/AchievementMascotIcon';
import { ACHIEVEMENTS_LIST, calculateUnlockedAchievements } from '../../data/achievementsData';
import { isSoundEnabled, setSoundEnabled } from '../../utils/audio';

import ConfirmModal from '../ConfirmModal';


import UserAvatar from '../UserAvatar';
import { getPlayerLevelInfo } from '../../utils/xpSystem';
import './profile.css';

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
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

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

  const handleToggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    setSoundEnabled(nextVal);
  };

  // Preview the first 6 achievements
  const previewAchievements = [...ACHIEVEMENTS_LIST].sort((a, b) => Number(unlockedSet.has(b.id)) - Number(unlockedSet.has(a.id))).slice(0, 4);
  const levelInfo = getPlayerLevelInfo(userProfile.xp);

  return (
    <div className="profile-page">
      <header className="profile-heading"><span>GÓC HỌC TẬP CỦA BẠN</span><h1>Cá nhân</h1><p>Nhìn lại hành trình, giữ nhịp học theo cách của bạn.</p></header>
      <section className="profile-identity">
        <UserAvatar avatar={userProfile.avatar} className="profile-avatar" />
        <div className="profile-identity-copy"><span className="profile-label">{user ? 'HỒ SƠ HỌC VIÊN' : 'HỒ SƠ TRÊN THIẾT BỊ'}</span><h2>{userProfile.name || user?.displayName || 'Bạn học tiếng Nhật'}</h2><p>Mục tiêu JLPT {targetLevel} <span>·</span> Cấp {levelInfo.level}</p></div>
        <button type="button" className="profile-edit" onClick={() => { setTempName(userProfile.name); setTempAvatar(userProfile.avatar || '🦊'); setTempLevel(targetLevel); setIsProfileModalOpen(true); }}>Sửa hồ sơ <ChevronRight size={16} /></button>
      </section>
      <div className="profile-grid">
        <section className="profile-xp"><div className="profile-section-heading"><h2>Hành trình XP</h2><Award size={20} /></div><strong>{(userProfile.xp || 0).toLocaleString()}<small>XP</small></strong><p>{levelInfo.title}</p><div className="profile-meter" role="progressbar" aria-label="Tiến độ lên cấp" aria-valuenow={levelInfo.progressPercent} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${levelInfo.progressPercent}%`}} /></div><div className="profile-xp-caption"><span>Cấp {levelInfo.level}</span><span>Còn {Math.max(0,levelInfo.nextLevelXp - userProfile.xp).toLocaleString()} XP đến cấp {levelInfo.level + 1}</span></div><button type="button" className="profile-text-action" onClick={() => onNavigate('progress')}>Xem tiến độ học <ChevronRight size={16} /></button></section>
        <section className="profile-rhythm"><span className="profile-rhythm-icon"><Flame size={28} /></span><strong>{userProfile.streak || 0}<small>ngày liên tiếp</small></strong><p>{userProfile.streak ? 'Một chút mỗi ngày, kiến thức ở lại lâu hơn.' : 'Bắt đầu một bài học để tạo chuỗi ngày của bạn.'}</p><div className="profile-study-days"><CheckCircle2 size={16} /><span>{new Set(userProfile.studyDays || []).size} ngày đã học</span></div></section>
      </div>
      <section className="profile-achievements"><div className="profile-section-heading"><div><h2>Thành tích của bạn</h2><p>{unlockedCount} / {ACHIEVEMENTS_LIST.length} huy hiệu đã mở khóa</p></div><button type="button" className="profile-text-action" onClick={() => onNavigate('achievements')}>Xem tất cả <ChevronRight size={16} /></button></div><div className="profile-badges">{previewAchievements.map(item => <button type="button" key={item.id} onClick={() => onNavigate('achievements')} className="profile-badge"><AchievementMascotIcon type={item.character} isUnlocked={unlockedSet.has(item.id)} size={70} poseIndex={item.poseIndex} badgeNumber={item.number} tier={item.tier} metric={item.metric} rank={item.rank} threshold={item.threshold} /><strong>{item.title}</strong><span>{unlockedSet.has(item.id) ? 'Đã mở khóa' : 'Đang chờ bạn'}</span></button>)}</div></section>
      <section className="profile-settings"><div className="profile-section-heading"><h2>Thiết lập học tập</h2></div><button type="button" className="profile-row" onClick={() => onNavigate('notebook')}><span className="profile-row-icon"><Bookmark size={20} /></span><span><strong>Sổ tay của tôi</strong><small>Từ đã lưu và bộ từ tự tạo</small></span><ChevronRight size={18} /></button><div className="profile-row"><span className="profile-row-icon">{soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}</span><span><strong>Âm thanh học tập</strong><small>Âm phản hồi đúng/sai và phần thưởng</small></span><button type="button" role="switch" aria-label="Âm thanh học tập" aria-checked={soundOn} onClick={handleToggleSound} className={`profile-switch ${soundOn ? 'on' : ''}`}><span /></button></div><div className="profile-row"><span className="profile-row-icon"><User size={20} /></span><span><strong>{user ? 'Tài khoản đã kết nối' : 'Lưu tiến độ lâu dài'}</strong><small>{user ? (user.email || 'Đã đăng nhập') : 'Đăng nhập để đồng bộ khi đổi thiết bị'}</small></span><button type="button" className="profile-text-action" onClick={() => user ? setIsLogoutConfirmOpen(true) : onOpenAuth()}>{user ? 'Đăng xuất' : 'Đăng nhập'}</button></div>{userProfile.role === 'admin' && <button type="button" className="profile-row" onClick={() => onNavigate('admin')}><span className="profile-row-icon"><ShieldCheck size={20} /></span><span><strong>Quản trị</strong><small>Quản lý nội dung và học viên</small></span><ChevronRight size={18} /></button>}</section>
      {/* Modals */}

      
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
                  aria-label="Đóng chỉnh sửa hồ sơ" onClick={() => setIsProfileModalOpen(false)}
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
                    <span className="text-xs font-bold text-emerald-400">{user ? 'Đã kết nối tài khoản' : 'Hồ sơ lưu trên thiết bị'}</span>
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

              {/* Username badge */}
              {userProfile.username && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">
                    Tên đăng nhập (Username)
                  </label>
                  <div className="bg-[#12172A] border border-slate-800 rounded-xl px-4 py-2.5 text-amber-400 font-mono text-xs flex items-center justify-between">
                    <span>@{userProfile.username}</span>
                    <span className="text-[10px] text-slate-500 font-sans">Dùng để đăng nhập</span>
                  </div>
                </div>
              )}

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
                    if (user) setIsLogoutConfirmOpen(true); else onOpenAuth();
                  }}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{user ? 'Đăng xuất tài khoản' : 'Đăng nhập để đồng bộ'}</span>
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

    </div>
  );
}
