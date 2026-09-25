import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  BellOff,
  Clock,
  Check,
  Send,
  ShieldAlert,
  CheckCircle2,
  Smartphone,
  Monitor,
  RefreshCw,
  Info,
  Volume2,
  Pin,
  Palette,
  Type,
  Eye,
  Image as ImageIcon,
  CloudCheck,
  Sliders,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import {
  ReminderSettings,
  getDefaultReminderSettings,
  saveReminderSettings,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendNotification,
  sendFloatingVocabNotification,
  generateVocabNotificationImage,
  isNotificationSupported,
  syncRemindersWithServiceWorker,
  getAllVocabPool,
  getActiveLearningContext,
  getEffectiveVocabPool,
  formatVocabOriginLabel,
  NOTIFICATION_THEMES,
  NotificationThemeKey,
  VocabNotificationPayload
} from '../utils/notifications';
import { useAuth } from '../contexts/AuthContext';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PREVIEW_WORD: VocabNotificationPayload = {
  kanji: '勉強',
  reading: 'べんきょう',
  romaji: 'benkyou',
  meaning: 'Học tập, học hành',
  hanViet: 'MIỄN CƯỜNG',
  level: 'N4',
  curriculum: 'tango',
  curriculumName: 'Tango 1500',
  lessonName: 'Sec 1: 時間 (Thời gian)',
  chapter: 'Chương 1: 私たちの毎日',
  section: 'Sec 1: 時間 (Thời gian)',
  wordNumber: 1,
  wordIndexInLesson: 1,
  totalWordsInLesson: 25,
  exampleJp: '毎日日本語を勉強しています。',
  exampleVi: 'Hàng ngày tôi đều học tiếng Nhật.'
};

export default function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const { user, updateDbProfile } = useAuth();
  const [settings, setSettings] = useState<ReminderSettings>(getDefaultReminderSettings());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSent, setTestSent] = useState(false);
  const [testVocabSent, setTestVocabSent] = useState(false);
  const [syncingSw, setSyncingSw] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showWindowsGuide, setShowWindowsGuide] = useState(false);

  const ALL_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

  const activeCtx = useMemo(() => getActiveLearningContext(), [isOpen]);

  const availableLessons = useMemo(() => {
    const pool = getAllVocabPool();
    const map = new Map<string, { id: string; name: string; curriculum: string; count: number }>();
    for (const item of pool) {
      if (item.lessonId && item.lessonName) {
        if (!map.has(item.lessonId)) {
          map.set(item.lessonId, {
            id: item.lessonId,
            name: item.lessonName,
            curriculum: item.curriculum || 'minna',
            count: 1
          });
        } else {
          const entry = map.get(item.lessonId)!;
          entry.count++;
        }
      }
    }
    return Array.from(map.values());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSettings(getDefaultReminderSettings());
      setPermission(getNotificationPermissionStatus());
      setTestSent(false);
      setTestVocabSent(false);
      setStatusMessage(null);
    }
  }, [isOpen]);

  const updateSettingsAndSync = (updated: ReminderSettings) => {
    setSettings(updated);
    saveReminderSettings(updated);
    if (user) {
      updateDbProfile({ notificationSettings: updated }).catch((err) => {
        console.warn('Failed to sync notification settings to cloud:', err);
      });
    }
  };

  // Live Card Image Preview Data URL (reflecting user's curriculum scope)
  const previewImageUrl = useMemo(() => {
    const pool = getEffectiveVocabPool(settings);
    const sampleWord = pool.length > 0 ? pool[0] : SAMPLE_PREVIEW_WORD;
    return generateVocabNotificationImage(sampleWord, settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleToggleReminder = async (enable: boolean) => {
    if (enable) {
      const currentPerm = getNotificationPermissionStatus();
      if (currentPerm !== 'granted') {
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result !== 'granted') {
          setStatusMessage('Bạn chưa cấp quyền thông báo cho trình duyệt. Hãy cho phép để nhận nhắc nhở!');
          return;
        }
      }
    }

    const updated = { ...settings, enabled: enable };
    updateSettingsAndSync(updated);
    setStatusMessage(enable ? 'Đã bật nhắc nhở học tập hàng ngày! 🔔' : 'Đã tắt nhắc nhở.');
  };

  const handleTimeChange = (newTime: string) => {
    const updated = { ...settings, time: newTime };
    updateSettingsAndSync(updated);
  };

  const handleToggleVocabReminder = async (enable: boolean) => {
    if (enable) {
      const currentPerm = getNotificationPermissionStatus();
      if (currentPerm !== 'granted') {
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result !== 'granted') {
          setStatusMessage('Bạn cần cho phép quyền thông báo để hiển thị thông báo nổi trên Windows!');
          return;
        }
      }
    }

    const updated = { ...settings, vocabEnabled: enable };
    updateSettingsAndSync(updated);
    setStatusMessage(
      enable
        ? 'Đã kích hoạt thông báo nổi từ vựng trên Windows! 🚀'
        : 'Đã tắt thông báo nổi từ vựng.'
    );
  };

  const handleLevelToggle = (lvl: string) => {
    const current = settings.vocabLevels || ['N5', 'N4', 'N3', 'N2', 'N1'];
    let next: string[];
    if (current.includes(lvl)) {
      next = current.filter(l => l !== lvl);
    } else {
      next = [...current, lvl];
    }
    if (next.length === 0) return; // Must keep at least one level

    const updated = { ...settings, vocabLevels: next };
    updateSettingsAndSync(updated);
  };

  const handleSelectAllLevels = () => {
    const updated = { ...settings, vocabLevels: ALL_LEVELS };
    updateSettingsAndSync(updated);
  };

  const handleSyncServiceWorker = async () => {
    setSyncingSw(true);
    try {
      const success = await syncRemindersWithServiceWorker(settings, getEffectiveVocabPool(settings));
      if (user) {
        await updateDbProfile({ notificationSettings: settings });
      }
      if (success) {
        setStatusMessage('Đã đồng bộ cài đặt & Service Worker thành công! ☁️✅');
      } else {
        setStatusMessage('Đã cập nhật cấu hình thông báo chạy ngầm & đồng bộ tài khoản.');
      }
    } catch (e) {
      setStatusMessage('Đồng bộ thất bại, hãy thử lại.');
    } finally {
      setTimeout(() => setSyncingSw(false), 1200);
    }
  };

  const handleTestVocabNotification = async () => {
    let currentPerm = getNotificationPermissionStatus();
    if (currentPerm !== 'granted') {
      currentPerm = await requestNotificationPermission();
      setPermission(currentPerm);
    }

    const sentWord = sendFloatingVocabNotification(settings);
    if (sentWord) {
      setTestVocabSent(true);
      setStatusMessage(`Đã gửi thông báo nổi từ vựng [${sentWord.level}] ${sentWord.kanji || sentWord.reading}! 🎯`);
      setTimeout(() => setTestVocabSent(false), 3500);
    } else {
      setStatusMessage('Không thể tạo thông báo ngẫu nhiên. Hãy kiểm tra cài đặt bộ lọc trình độ!');
    }
  };

  const PRESET_TIMES = ['08:00', '12:00', '19:00', '20:30', '21:30'];

  const FONT_SIZE_OPTIONS = [
    { scale: 0.8, label: '80% (Nhỏ)' },
    { scale: 1.0, label: '100% (Tiêu chuẩn)' },
    { scale: 1.2, label: '120% (Lớn) ⭐' },
    { scale: 1.4, label: '140% (Rất lớn)' },
    { scale: 1.6, label: '160% (Khổng lồ)' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative space-y-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">Nhắc Nhở & Thông Báo Nổi Windows</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tùy chỉnh cỡ chữ, màu sắc & đồng bộ đa thiết bị</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status indicator banner */}
        {!isNotificationSupported() ? (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Trình duyệt hiện tại không hỗ trợ Web Notification API.</span>
          </div>
        ) : permission === 'denied' ? (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <div className="flex items-center gap-2 font-black text-rose-900 dark:text-rose-200">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Quyền thông báo đang bị chặn!</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
              Nhấn vào biểu tượng ổ khóa 🔒 hoặc cài đặt trang trên thanh địa chỉ và chuyển <strong>Thông báo (Notifications)</strong> sang <strong>Cho phép (Allow)</strong>.
            </p>
          </div>
        ) : null}

        {/* Status Message feedback toast */}
        {statusMessage && (
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-center animate-fade-in border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* LIVE PREVIEW CARD */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Xem Trước Ảnh Thẻ Thông Báo Windows (Live Preview)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">HD Ultra-Crisp Toast</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-800/80 shadow-md bg-black/40 flex items-center justify-center">
              {previewImageUrl ? (
                <img 
                  src={previewImageUrl} 
                  alt="Notification Preview" 
                  className="w-full h-auto object-contain max-h-48 rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="py-8 text-xs text-slate-500">Đang khởi tạo xem trước...</div>
              )}
            </div>
          </div>

          {/* SECTION 1: WINDOWS FLOATING VOCABULARY NOTIFICATION (PRIMARY) */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Thông Báo Nổi Từ Vựng (Windows Toast)
                  </h4>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                    Tự động hiện thẻ từ vựng ở góc phải màn hình
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggleVocabReminder(!settings.vocabEnabled)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                  settings.vocabEnabled
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                }`}
              >
                {settings.vocabEnabled ? 'Đang Bật ✓' : 'Bật Ngay'}
              </button>
            </div>

            {settings.vocabEnabled && (
              <div className="space-y-3 pt-1 border-t border-indigo-100 dark:border-indigo-900/60 animate-fade-in text-left">
                {/* 1. CURRICULUM & LESSON SOURCE SELECTION (NEW) */}
                <div className="space-y-2 bg-indigo-50/80 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Nguồn Giáo Trình & Bài Học Đang Học:</span>
                    </label>
                    <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Tự động theo bài
                    </span>
                  </div>

                  {/* Active Context Banner */}
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        Tiến độ đang học trên hệ thống:
                      </div>
                      <div className="font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <span>{activeCtx.curriculum === 'tango' ? '📗 Tango 1500 N4' : '📘 Minna no Nihongo'}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-800 dark:text-slate-200">
                          {activeCtx.lessonName || (activeCtx.lessonId ? `Bài ${activeCtx.lessonId}` : 'Chưa chọn bài')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-lg">
                      Đang đồng bộ ✓
                    </span>
                  </div>

                  {/* Scope Selector */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-400">
                      Chế độ thông báo từ vựng:
                    </label>
                    <select
                      value={settings.vocabSourceScope || 'active'}
                      onChange={(e) => {
                        const updated = { ...settings, vocabSourceScope: e.target.value as any };
                        updateSettingsAndSync(updated);
                      }}
                      className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="active">🎯 Tự động theo giáo trình & bài đang học (Khuyên dùng) ⭐</option>
                      <option value="tango">📗 Toàn bộ giáo trình Tango 1500 N4 (894 từ)</option>
                      <option value="minna_n5">📘 Minna no Nihongo N5 (Bài 1 - 25)</option>
                      <option value="minna_n4">📘 Minna no Nihongo N4 (Bài 26 - 50)</option>
                      <option value="custom_lesson">📖 Chỉ định một bài học cụ thể...</option>
                      <option value="all">🌐 Tất cả từ vựng theo cấp độ JLPT đã chọn</option>
                    </select>
                  </div>

                  {/* Specific Lesson Selector when custom_lesson is picked */}
                  {settings.vocabSourceScope === 'custom_lesson' && (
                    <div className="space-y-1 pt-1 animate-fade-in">
                      <label className="text-[10.5px] font-bold text-indigo-700 dark:text-indigo-300">
                        Chọn bài học cần nhận thông báo:
                      </label>
                      <select
                        value={settings.vocabSelectedLessonId || 'all'}
                        onChange={(e) => {
                          const updated = { ...settings, vocabSelectedLessonId: e.target.value };
                          updateSettingsAndSync(updated);
                        }}
                        className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-600 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="all">-- Chọn bài học cụ thể --</option>
                        <optgroup label="📗 Tango 1500 N4">
                          {availableLessons
                            .filter((l) => l.curriculum === 'tango')
                            .map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name} ({l.count} từ)
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="📘 Minna no Nihongo N5">
                          {availableLessons
                            .filter((l) => l.curriculum === 'minna' && l.id.includes('mn5'))
                            .map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name} ({l.count} từ)
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="📘 Minna no Nihongo N4">
                          {availableLessons
                            .filter((l) => l.curriculum === 'minna' && l.id.includes('mn4'))
                            .map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name} ({l.count} từ)
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </div>
                  )}
                </div>

                {/* 2. JLPT Level Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span>🎯 Tùy chọn cấp độ JLPT (Bộ lọc phụ):</span>
                    </span>
                    <button
                      onClick={handleSelectAllLevels}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Chọn tất cả N5-N1
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {ALL_LEVELS.map((lvl) => {
                      const currentLevels = settings.vocabLevels || ALL_LEVELS;
                      const isSelected = currentLevels.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleLevelToggle(lvl)}
                          className={`py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs scale-102'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                    Hệ thống sẽ lấy từ vựng theo giáo trình & bài đang học ({settings.vocabLevels?.join(', ') || 'N5-N1'}).
                  </p>
                </div>

                {/* 3. Frequency Interval */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
                    ⏱️ Tần suất xuất hiện thông báo:
                  </label>
                  <select
                    value={settings.vocabInterval || 15}
                    onChange={(e) => {
                      const updated = { ...settings, vocabInterval: parseInt(e.target.value) };
                      updateSettingsAndSync(updated);
                    }}
                    className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value={1}>⚡ Mỗi 1 phút (Để thử nghiệm & kiểm tra nhanh)</option>
                    <option value={3}>⚡ Mỗi 3 phút (Ôn dồn dập)</option>
                    <option value={5}>Mỗi 5 phút (Tập trung cao độ)</option>
                    <option value={10}>Mỗi 10 phút (Năng động)</option>
                    <option value={15}>Mỗi 15 phút (Khuyên dùng khi làm việc) ⭐</option>
                    <option value={30}>Mỗi 30 phút (Học thong thả)</option>
                    <option value={60}>Mỗi 1 giờ (Chuẩn hàng ngày)</option>
                    <option value={120}>Mỗi 2 giờ (Chậm rãi)</option>
                  </select>
                </div>

                {/* 3. Windows Floating Options Checkboxes */}
                <div className="space-y-2 pt-1 bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                  {/* Hide duplicate text lines */}
                  <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.hideNotificationText !== false}
                      onChange={(e) => {
                        const updated = { ...settings, hideNotificationText: e.target.checked };
                        updateSettingsAndSync(updated);
                      }}
                      className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Chỉ hiển thị ảnh thẻ từ vựng (Ẩn dòng chữ trùng lặp trên thông báo Windows)</span>
                  </label>

                  {/* Pin / Require interaction */}
                  <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.vocabRequireInteraction === true}
                      onChange={(e) => {
                        const updated = { ...settings, vocabRequireInteraction: e.target.checked };
                        updateSettingsAndSync(updated);
                      }}
                      className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <Pin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Ghim cố định thông báo trên Windows (mặc định thông báo sẽ tự đóng sau 5 giây)</span>
                  </label>

                  {/* Sound Chime */}
                  <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.vocabPlaySound !== false}
                      onChange={(e) => {
                        const updated = { ...settings, vocabPlaySound: e.target.checked };
                        updateSettingsAndSync(updated);
                      }}
                      className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Phát âm thanh chuông nhẹ (Pling! 🎵) khi từ vựng xuất hiện</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: CUSTOMIZE FONT SIZE & COLOR THEME */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5 text-left">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Chỉnh Cỡ Chữ & Màu Sắc Thẻ Thông Báo (Tùy Chỉnh & Đồng Bộ Cloud)
              </h4>
            </div>

            {/* A. Font Size Scale Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Tỉ lệ cỡ chữ tổng thể:</span>
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">
                  {Math.round((settings.fontSizeScale || 1.2) * 100)}%
                </span>
              </label>

              <div className="grid grid-cols-5 gap-1.5">
                {FONT_SIZE_OPTIONS.map((opt) => {
                  const currentScale = settings.fontSizeScale !== undefined ? settings.fontSizeScale : 1.2;
                  const isSelected = Math.abs(currentScale - opt.scale) < 0.05;
                  return (
                    <button
                      key={opt.scale}
                      type="button"
                      onClick={() => {
                        const updated = { ...settings, fontSizeScale: opt.scale };
                        updateSettingsAndSync(updated);
                      }}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer text-center truncate ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* A2. Granular Font Size Control per Component */}
            <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Chỉnh Cỡ Chữ Từng Thành Phần Chi Tiết:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      kanjiScale: 1.0,
                      furiganaScale: 1.0,
                      hanVietScale: 1.0,
                      meaningScale: 1.0,
                      exampleScale: 1.0
                    };
                    updateSettingsAndSync(updated);
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 transition-all cursor-pointer"
                  title="Đặt lại tất cả thành phần về 100%"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại 100%</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {/* 1. Kanji / Main Word */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="text-xs">漢字</span>
                      <span>1. Chữ Kanji / Từ vựng chính:</span>
                    </span>
                    <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                      {Math.round((settings.kanjiScale ?? 1.0) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.7"
                      max="2.0"
                      step="0.05"
                      value={settings.kanjiScale ?? 1.0}
                      onChange={(e) => updateSettingsAndSync({ ...settings, kanjiScale: parseFloat(e.target.value) })}
                      className="flex-1 accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateSettingsAndSync({ ...settings, kanjiScale: Math.max(0.7, parseFloat(((settings.kanjiScale ?? 1.0) - 0.1).toFixed(2))) })}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSettingsAndSync({ ...settings, kanjiScale: Math.min(2.0, parseFloat(((settings.kanjiScale ?? 1.0) + 0.1).toFixed(2))) })}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Furigana / Reading */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="text-xs">🔤</span>
                      <span>2. Furigana / Cách đọc:</span>
                    </span>
                    <span className="font-mono font-black text-amber-500 dark:text-amber-400">
                      {Math.round((settings.furiganaScale ?? 1.0) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.7"
                      max="2.0"
                      step="0.05"
                      value={settings.furiganaScale ?? 1.0}
                      onChange={(e) => updateSettingsAndSync({ ...settings, furiganaScale: parseFloat(e.target.value) })}
                      className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateSettingsAndSync({ ...settings, furiganaScale: Math.max(0.7, parseFloat(((settings.furiganaScale ?? 1.0) - 0.1).toFixed(2))) })}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSettingsAndSync({ ...settings, furiganaScale: Math.min(2.0, parseFloat(((settings.furiganaScale ?? 1.0) + 0.1).toFixed(2))) })}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Hán Việt Badge */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="text-xs">🏷️</span>
                      <span>3. Âm Hán Việt (Nhãn dưới ô Kanji):</span>
                    </span>
                    <span className="font-mono font-black text-sky-500 dark:text-sky-400">
                      {Math.round((settings.hanVietScale ?? 1.0) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.7"
                      max="2.0"
                      step="0.05"
                      value={settings.hanVietScale ?? 1.0}
                      onChange={(e) => updateSettingsAndSync({ ...settings, hanVietScale: parseFloat(e.target.value) })}
                      className="flex-1 accent-sky-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateSettingsAndSync({ ...settings, hanVietScale: Math.max(0.7, parseFloat(((settings.hanVietScale ?? 1.0) - 0.1).toFixed(2))) })}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSettingsAndSync({ ...settings, hanVietScale: Math.min(2.0, parseFloat(((settings.hanVietScale ?? 1.0) + 0.1).toFixed(2))) })}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Meaning */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="text-xs">🇻🇳</span>
                      <span>4. Nghĩa tiếng Việt chính:</span>
                    </span>
                    <span className="font-mono font-black text-sky-500 dark:text-sky-300">
                      {Math.round((settings.meaningScale ?? 1.0) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.7"
                      max="2.0"
                      step="0.05"
                      value={settings.meaningScale ?? 1.0}
                      onChange={(e) => updateSettingsAndSync({ ...settings, meaningScale: parseFloat(e.target.value) })}
                      className="flex-1 accent-sky-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateSettingsAndSync({ ...settings, meaningScale: Math.max(0.7, parseFloat(((settings.meaningScale ?? 1.0) - 0.1).toFixed(2))) })}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSettingsAndSync({ ...settings, meaningScale: Math.min(2.0, parseFloat(((settings.meaningScale ?? 1.0) + 0.1).toFixed(2))) })}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Example Sentence & Translation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="text-xs">📝</span>
                      <span>5. Câu ví dụ & Bản dịch:</span>
                    </span>
                    <span className="font-mono font-black text-emerald-500 dark:text-emerald-400">
                      {Math.round((settings.exampleScale ?? 1.0) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.7"
                      max="2.0"
                      step="0.05"
                      value={settings.exampleScale ?? 1.0}
                      onChange={(e) => updateSettingsAndSync({ ...settings, exampleScale: parseFloat(e.target.value) })}
                      className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateSettingsAndSync({ ...settings, exampleScale: Math.max(0.7, parseFloat(((settings.exampleScale ?? 1.0) - 0.1).toFixed(2))) })}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSettingsAndSync({ ...settings, exampleScale: Math.min(2.0, parseFloat(((settings.exampleScale ?? 1.0) + 0.1).toFixed(2))) })}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* B. Preset Theme Palette */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                🎨 Giao diện màu sắc phối sẵn:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(NOTIFICATION_THEMES) as NotificationThemeKey[]).map((themeKey) => {
                  const preset = NOTIFICATION_THEMES[themeKey];
                  const isSelected = (settings.cardTheme || 'obsidian') === themeKey;

                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => {
                        const updated = { ...settings, cardTheme: themeKey };
                        updateSettingsAndSync(updated);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-white dark:bg-slate-800 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div 
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
                          style={{ background: `linear-gradient(135deg, ${preset.bgStart}, ${preset.bgEnd})` }}
                        />
                        <span className="truncate text-[11px] text-slate-800 dark:text-slate-200">{preset.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. Manual Color Picker when "custom" is selected */}
            {settings.cardTheme === 'custom' && (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 animate-fade-in">
                <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">
                  🛠️ Chỉnh màu thủ công cho từng thành phần:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Màu Hán Tự:</label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="color" 
                        value={settings.customKanjiColor || '#ffffff'} 
                        onChange={(e) => updateSettingsAndSync({ ...settings, customKanjiColor: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={settings.customKanjiColor || '#ffffff'}
                        onChange={(e) => updateSettingsAndSync({ ...settings, customKanjiColor: e.target.value })}
                        className="w-20 px-1.5 py-1 text-[10px] font-mono border rounded-md dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Màu Furigana:</label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="color" 
                        value={settings.customFuriganaColor || '#fde047'} 
                        onChange={(e) => updateSettingsAndSync({ ...settings, customFuriganaColor: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={settings.customFuriganaColor || '#fde047'}
                        onChange={(e) => updateSettingsAndSync({ ...settings, customFuriganaColor: e.target.value })}
                        className="w-20 px-1.5 py-1 text-[10px] font-mono border rounded-md dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Màu Tiếng Việt:</label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="color" 
                        value={settings.customMeaningColor || '#ffffff'} 
                        onChange={(e) => updateSettingsAndSync({ ...settings, customMeaningColor: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={settings.customMeaningColor || '#ffffff'}
                        onChange={(e) => updateSettingsAndSync({ ...settings, customMeaningColor: e.target.value })}
                        className="w-20 px-1.5 py-1 text-[10px] font-mono border rounded-md dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Nền Gradient Đầu:</label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="color" 
                        value={settings.customBgStart || '#060a14'} 
                        onChange={(e) => updateSettingsAndSync({ ...settings, customBgStart: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={settings.customBgStart || '#060a14'}
                        onChange={(e) => updateSettingsAndSync({ ...settings, customBgStart: e.target.value })}
                        className="w-20 px-1.5 py-1 text-[10px] font-mono border rounded-md dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Nền Gradient Cuối:</label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="color" 
                        value={settings.customBgEnd || '#0e172a'} 
                        onChange={(e) => updateSettingsAndSync({ ...settings, customBgEnd: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={settings.customBgEnd || '#0e172a'}
                        onChange={(e) => updateSettingsAndSync({ ...settings, customBgEnd: e.target.value })}
                        className="w-20 px-1.5 py-1 text-[10px] font-mono border rounded-md dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: DAILY SCHEDULE REMINDER */}
          <div className="space-y-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Nhắc Học Định Kỳ Hàng Ngày:
              </label>
              <button
                onClick={() => handleToggleReminder(!settings.enabled)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  settings.enabled
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {settings.enabled ? 'Đang Bật' : 'Đã Tắt'}
              </button>
            </div>

            {settings.enabled && (
              <div className="space-y-2 pt-1 animate-fade-in">
                <div className="flex items-center gap-3">
                  <input 
                    type="time" 
                    value={settings.time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-black text-sm focus:border-rose-500 outline-none w-24 text-center shadow-xs bg-white dark:bg-slate-800 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Nhắc tổng hợp lúc <strong className="text-slate-900 dark:text-slate-100 font-mono">{settings.time}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TIMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTimeChange(t)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                        settings.time === t
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-700 dark:text-rose-300 font-black'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: WINDOWS BACKGROUND NOTIFICATION GUIDE */}
          <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 rounded-2xl border border-sky-100 dark:border-sky-900/60 text-left space-y-2">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowWindowsGuide(!showWindowsGuide)}
            >
              <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200 font-black text-xs">
                <Monitor className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Mẹo nhận thông báo khi ẨN / THU NHỎ TRÌNH DUYỆT WINDOWS</span>
              </div>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{showWindowsGuide ? 'Thu gọn' : 'Xem chi tiết'}</span>
            </div>

            {showWindowsGuide && (
              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 pt-1 leading-relaxed border-t border-sky-100 dark:border-sky-900/60">
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong>Thông báo nổi Windows:</strong> Khi thu nhỏ (minimize) hoặc ẩn trình duyệt Chrome/Edge, hệ thống sử dụng <em>Background Worker Thread</em> để định kỳ hiển thị thông báo Toast ở góc phải màn hình Windows.
                  </li>
                  <li>
                    <strong>Đồng bộ thiết bị cloud:</strong> Tất cả lựa chọn cỡ chữ và phối màu của bạn sẽ tự động đồng bộ khi đăng nhập ở bất cứ máy tính hay thiết bị nào khác.
                  </li>
                  <li>
                    <strong>Kiểm tra Focus Assist (Không làm phiền):</strong> Đảm bảo Windows 10/11 không bật chế độ "Focus assist" hoặc "Do not disturb" chặn thông báo của Google Chrome / Microsoft Edge.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons & Instant Test */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            onClick={handleSyncServiceWorker}
            disabled={syncingSw}
            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Lưu & Đồng bộ tài khoản Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingSw ? 'animate-spin' : ''}`} />
            <span>Lưu & Đồng Bộ Cloud ☁️</span>
          </button>

          <button
            onClick={handleTestVocabNotification}
            className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              testVocabSent 
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-sm'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testVocabSent ? 'Đã gửi thông báo nổi lên Windows! ✓' : 'Gửi Thử Thông Báo Nổi Windows Ngay 🔔'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


