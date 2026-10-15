import { Switch, Expand } from './ui/ExpandSwitch';
import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Send,
  ShieldAlert,
  Volume2,
  Pin,
  Image as ImageIcon
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
  getAllVocabPool,
  getActiveLearningContext,
  getEffectiveVocabPool,
  formatVocabOriginLabel,
  NOTIFICATION_THEMES,
  NotificationThemeKey,
  VocabNotificationPayload
} from '../utils/notifications';
import { useAuth } from '../contexts/AuthContext';

import { useEscape } from '../hooks/useEscape';
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
  useEscape(isOpen, onClose);
  const { user, updateDbProfile } = useAuth();
  const [settings, setSettings] = useState<ReminderSettings>(getDefaultReminderSettings());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSent, setTestSent] = useState(false);
  const [testVocabSent, setTestVocabSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
            curriculum: item.curriculum || 'tango',
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

  const onCount = (settings.vocabEnabled ? 1 : 0) + (settings.enabled ? 1 : 0);
  // Tắt lần lượt từ trên xuống (spec 023); dùng settings hiện tại cho cả hai bước để bước sau không ghi đè bước trước.
  const handleTurnAllOff = () => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = (patch: Partial<ReminderSettings>) => updateSettingsAndSync({ ...settings, ...patch });
    step({ vocabEnabled: false });
    setTimeout(() => step({ vocabEnabled: false, enabled: false }), rm ? 0 : 120);
    setStatusMessage('Đã tắt tất cả thông báo.');
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
  const INTERVALS = [5, 15, 30, 60, 120];
  const FONT_SCALES = [0.8, 1.0, 1.2, 1.4, 1.6];
  const set = (patch: Partial<ReminderSettings>) => updateSettingsAndSync({ ...settings, ...patch });
  const levels = settings.vocabLevels || ALL_LEVELS;
  const interval = settings.vocabInterval || 15;
  const scale = settings.fontSizeScale ?? 1.2;
  const theme = settings.cardTheme || 'obsidian';
  const chip = (on: boolean) => `h-9 min-w-[44px] px-3 rounded-full text-xs font-bold border transition-colors cursor-pointer ${on ? 'bg-[color:var(--ui-accent)] border-[color:var(--ui-accent)] text-white' : 'border-[color:var(--ui-line)] text-[color:var(--ui-muted)] hover:bg-[color:var(--ui-soft)]'}`;
  const sel = 'w-full h-10 px-3 rounded-xl border border-[color:var(--ui-line)] bg-[color:var(--ui-soft)] text-sm font-semibold text-[color:var(--ui-text)] outline-none focus:border-[color:var(--ui-accent)] cursor-pointer';
  const label = 'block text-xs font-bold text-[color:var(--ui-muted)] mb-2';
  const card = 'rounded-2xl border border-[color:var(--ui-line)] p-4';
  const row = (title: string, sub: string) => (
    <div className="min-w-0">
      <h4 className="text-sm font-black text-[color:var(--ui-text)]">{title}</h4>
      <p className="text-xs text-[color:var(--ui-muted)]">{sub}</p>
    </div>
  );
  const toggleRow = (text: string, icon: React.ReactNode, key: keyof ReminderSettings, on: boolean) => (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="flex items-center gap-2 text-sm text-[color:var(--ui-text)]">{icon}{text}</span>
      <Switch checked={on} onChange={(v) => set({ [key]: v } as Partial<ReminderSettings>)} label={text} />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label="Thông báo"
        className="bg-[color:var(--ui-card,#fff)] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h3 className="text-lg font-black text-[color:var(--ui-text)]">Thông báo</h3>
          <button onClick={onClose} aria-label="Đóng" className="w-9 h-9 grid place-items-center rounded-full hover:bg-[color:var(--ui-soft)] text-[color:var(--ui-muted)] cursor-pointer"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto px-5 pb-5 space-y-4 flex-1">
          {!isNotificationSupported() ? (
            <p className="flex items-center gap-2 text-xs rounded-xl px-3 py-2 bg-amber-500/10 text-amber-700"><ShieldAlert size={16} className="shrink-0" />Trình duyệt này không hỗ trợ thông báo.</p>
          ) : permission === 'denied' ? (
            <p className="flex items-start gap-2 text-xs rounded-xl px-3 py-2 bg-rose-500/10 text-rose-700"><ShieldAlert size={16} className="shrink-0 mt-0.5" />Thông báo đang bị chặn. Bấm biểu tượng ổ khóa trên thanh địa chỉ và chọn Cho phép.</p>
          ) : null}

          {statusMessage && <p role="status" className="text-xs text-center rounded-xl px-3 py-2 bg-[color:var(--ui-soft)] text-[color:var(--ui-text)]">{statusMessage}</p>}

          {/* Xem trước */}
          <div className="rounded-2xl overflow-hidden bg-slate-950 min-h-[96px] grid place-items-center">
            {previewImageUrl
              ? <img src={previewImageUrl} alt="Xem trước thẻ thông báo" className="w-full h-auto max-h-48 object-contain" referrerPolicy="no-referrer" />
              : <span className="text-xs text-slate-500">Đang tạo xem trước…</span>}
          </div>

          {/* Thẻ từ vựng nổi */}
          <section className={card}>
            <div className="flex items-center justify-between gap-3">
              {row('Thẻ từ vựng nổi', 'Hiện một từ ở góc màn hình theo chu kỳ')}
              <Switch checked={!!settings.vocabEnabled} onChange={handleToggleVocabReminder} label="Thẻ từ vựng nổi" />
            </div>
            <Expand open={!!settings.vocabEnabled}>
              <div className="pt-4 space-y-4">
                <div>
                  <span className={label}>Chu kỳ</span>
                  <div className="flex flex-wrap gap-2">
                    {(INTERVALS.includes(interval) ? INTERVALS : [...INTERVALS, interval].sort((x, y) => x - y)).map(m => (
                      <button key={m} type="button" aria-pressed={interval === m} onClick={() => set({ vocabInterval: m })} className={chip(interval === m)}>
                        {m < 60 ? `${m} phút` : `${m / 60} giờ`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className={label}>Nguồn từ</span>
                  <select aria-label="Nguồn từ" className={sel} value={settings.vocabSourceScope || 'active'} onChange={(e) => set({ vocabSourceScope: e.target.value as any })}>
                    <option value="active">Theo bài đang học{activeCtx.lessonName ? ` · ${activeCtx.lessonName}` : ''}</option>
                    <option value="tango">Toàn bộ Tango 1500 N4</option>
                    <option value="custom_lesson">Một bài cụ thể</option>
                    <option value="all">Tất cả theo cấp độ</option>
                  </select>
                  {settings.vocabSourceScope === 'custom_lesson' && (
                    <select aria-label="Chọn bài" className={`${sel} mt-2`} value={settings.vocabSelectedLessonId || 'all'} onChange={(e) => set({ vocabSelectedLessonId: e.target.value })}>
                      <option value="all">Chọn bài học…</option>
                      {availableLessons.filter(l => l.curriculum === 'tango').map(l => <option key={l.id} value={l.id}>{l.name} ({l.count} từ)</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <span className={label}>Cấp độ</span>
                  <div className="flex gap-2">
                    {ALL_LEVELS.map(l => <button key={l} type="button" aria-pressed={levels.includes(l)} onClick={() => handleLevelToggle(l)} className={chip(levels.includes(l))}>{l}</button>)}
                  </div>
                </div>
                <div className="divide-y divide-[color:var(--ui-line)]">
                  {toggleRow('Chỉ hiện ảnh thẻ', <ImageIcon size={16} className="text-[color:var(--ui-muted)]" />, 'hideNotificationText', settings.hideNotificationText !== false)}
                  {toggleRow('Ghim đến khi tắt', <Pin size={16} className="text-[color:var(--ui-muted)]" />, 'vocabRequireInteraction', settings.vocabRequireInteraction === true)}
                  {toggleRow('Âm báo', <Volume2 size={16} className="text-[color:var(--ui-muted)]" />, 'vocabPlaySound', settings.vocabPlaySound !== false)}
                </div>
              </div>
            </Expand>
          </section>

          {/* Giao diện thẻ */}
          <section className={card}>
            {row('Giao diện thẻ', 'Màu nền và cỡ chữ')}
            <div className="flex flex-wrap gap-3 mt-3" role="radiogroup" aria-label="Màu thẻ">
              {(Object.keys(NOTIFICATION_THEMES) as NotificationThemeKey[]).map(k => {
                const t = NOTIFICATION_THEMES[k];
                return (
                  <button key={k} type="button" role="radio" aria-checked={theme === k} title={t.name} aria-label={t.name} onClick={() => set({ cardTheme: k })}
                    className={`w-9 h-9 rounded-full grid place-items-center cursor-pointer transition-shadow ${theme === k ? 'ring-2 ring-offset-2 ring-[color:var(--ui-accent)]' : 'ring-1 ring-black/10'}`}
                    style={{ background: `linear-gradient(135deg, ${t.bgStart}, ${t.bgEnd})` }}>
                    {theme === k && <Check size={14} className="text-white" />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-4">
              {FONT_SCALES.map(f => (
                <button key={f} type="button" aria-pressed={Math.abs(scale - f) < 0.05} onClick={() => set({ fontSizeScale: f })} className={`${chip(Math.abs(scale - f) < 0.05)} flex-1 px-0`}>{Math.round(f * 100)}%</button>
              ))}
            </div>
          </section>

          {/* Nhắc hằng ngày */}
          <section className={card}>
            <div className="flex items-center justify-between gap-3">
              {row('Nhắc học mỗi ngày', 'Một thông báo vào giờ bạn chọn')}
              <Switch checked={!!settings.enabled} onChange={handleToggleReminder} label="Nhắc học mỗi ngày" />
            </div>
            <Expand open={!!settings.enabled}>
              <div className="pt-4 flex flex-wrap items-center gap-2">
                <input type="time" aria-label="Giờ nhắc" value={settings.time} onChange={(e) => handleTimeChange(e.target.value)}
                  className="h-9 px-3 rounded-full border border-[color:var(--ui-line)] bg-[color:var(--ui-soft)] font-mono font-bold text-sm text-[color:var(--ui-text)] outline-none focus:border-[color:var(--ui-accent)]" />
                {PRESET_TIMES.map(t => <button key={t} type="button" aria-pressed={settings.time === t} onClick={() => handleTimeChange(t)} className={`${chip(settings.time === t)} font-mono`}>{t}</button>)}
              </div>
            </Expand>
          </section>

          {onCount > 0 && (
            <button type="button" onClick={handleTurnAllOff} className="text-xs font-bold text-[color:var(--ui-muted)] hover:text-rose-600 cursor-pointer">Tắt tất cả thông báo</button>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[color:var(--ui-line)] shrink-0">
          <button type="button" onClick={handleTestVocabNotification}
            className="w-full h-11 rounded-full bg-[color:var(--ui-accent)] text-white text-sm font-black inline-flex items-center justify-center gap-2 cursor-pointer">
            {testVocabSent ? <><Check size={16} />Đã gửi</> : <><Send size={16} />Gửi thử một thẻ</>}
          </button>
        </div>
      </div>
    </div>
  );
}
