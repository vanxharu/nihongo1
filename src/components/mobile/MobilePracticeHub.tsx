import React, { useState, useEffect } from 'react';
import '../ui/todayGoals.css';
import { localDateStr } from '../../utils/localDate';
import {
  BookOpen,
  MessagesSquare,
  CheckSquare,
  PenTool,
  Trophy,
  Bookmark,
  ChevronRight,
  Dice5
} from 'lucide-react';
import { UserProfile, ExamHistoryRecord } from '../../types';
import { ExamHistoryModal } from '../ExamHistoryModal';
import { getExamHistory } from '../../utils/examHistoryStorage';
import LottieIcon from '../LottieIcon';
import flameAnim from '../../assets/lottie/flame.json';
import shibaSmileAnim from '../../assets/lottie/shiba-smile.json'; // LottieFiles "Smiling Dog" by Margarita Ivanchikova (Lottie Simple License)
import ShibaMascot from '../mascot/ShibaMascot';
import { GRAMMAR_DATA, KANJI_DATA } from '../../data';

interface MobilePracticeHubProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (tab: string, extra?: any) => void;
  onEarnXp?: (xp: number, label?: string) => void;
}

type Tile = { id: string; label: string; to: string; sub: string; pct?: number; icon: React.ReactNode; tone: string; bar: string };

const TAB_LABEL: Record<string, string> = { vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', kanji: 'Kanji', reading: 'Đọc hiểu', exam: 'Luyện thi', 'japanese-chat': 'Kaiwa' };

export default function MobilePracticeHub({ userProfile, onNavigate }: MobilePracticeHubProps) {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [examHistory, setExamHistory] = useState<ExamHistoryRecord[]>([]);

  useEffect(() => {
    setExamHistory(getExamHistory());
  }, [isHistoryModalOpen]);

  const targetLevel = userProfile.targetLevel || 'N4';
  const savedVocabCount = (userProfile.savedVocab || []).length;
  const savedKanjiCount = Object.values(userProfile.kanjiStatus || {}).filter(Boolean).length;
  const savedGrammarCount = Object.values(userProfile.grammarStatus || {}).filter(Boolean).length;
  const masteredVocab = Object.values(userProfile.vocabStatus || {}).filter(v => v === 'mastered').length;
  const pct = (n: number, total: number) => (total ? Math.min(100, Math.round((n / total) * 100)) : 0);

  // Streak ring: how many of the last 7 days have a study record.
  const weekDays = Array.from({ length: 7 }, (_, i) => new Date(Date.now() - i * 864e5 - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10));
  const weekCount = weekDays.filter(d => (userProfile.studyDays || []).includes(d)).length;

  const pos = userProfile.lastPosition;
  const resumeTab = pos?.tab && TAB_LABEL[pos.tab] ? pos.tab : 'vocabulary';
  const resumeTitle = pos?.lessonName || TAB_LABEL[resumeTab];

  // Shadowing / Lộ trình / Tiến độ already live in the bottom nav, so they are not repeated here.
  const tiles: Tile[] = [
    { id: 'vocab', label: 'Từ vựng', to: 'vocabulary', sub: `${masteredVocab} từ đã thuộc`, icon: <span className="text-base font-bold">文A</span>, tone: 'text-[#38bdf8] bg-[#14283d] border-[#38bdf8]/40', bar: 'bg-[#38bdf8]' },
    { id: 'grammar', label: 'Ngữ pháp', to: 'grammar', sub: `${savedGrammarCount}/${GRAMMAR_DATA.length} mẫu`, pct: pct(savedGrammarCount, GRAMMAR_DATA.length), icon: <span className="text-lg font-bold">品</span>, tone: 'text-[#c084fc] bg-[#241738] border-[#c084fc]/40', bar: 'bg-[#c084fc]' },
    { id: 'kanji', label: 'Kanji', to: 'kanji', sub: `${savedKanjiCount}/${KANJI_DATA.length} chữ`, pct: pct(savedKanjiCount, KANJI_DATA.length), icon: <PenTool className="w-5 h-5" />, tone: 'text-[#2dd4bf] bg-[#132828] border-[#2dd4bf]/40', bar: 'bg-[#2dd4bf]' },
    { id: 'reading', label: 'Đọc hiểu', to: 'reading', sub: 'Bài đọc & tin tức', icon: <BookOpen className="w-5 h-5" />, tone: 'text-[#fbbf24] bg-[#2f2014] border-[#fbbf24]/40', bar: 'bg-[#fbbf24]' },
    { id: 'chat-ai', label: 'Kaiwa', to: 'japanese-chat', sub: 'Hội thoại cùng AI', icon: <MessagesSquare className="w-5 h-5" />, tone: 'text-[#f472b6] bg-[#2e1526] border-[#f472b6]/40', bar: 'bg-[#f472b6]' },
    { id: 'exam', label: 'Luyện thi', to: 'exam', sub: examHistory.length ? `${examHistory.length} đề đã làm` : 'Đề thi thử JLPT', icon: <CheckSquare className="w-5 h-5" />, tone: 'text-[#f43f5e] bg-[#221624] border-[#f43f5e]/40', bar: 'bg-[#f43f5e]' },
    { id: 'books', label: 'Sách của tôi', to: 'books', sub: 'PDF Soumatome… (lưu trên máy)', icon: <BookOpen className="w-5 h-5" />, tone: 'text-[#34d399] bg-[#12281f] border-[#34d399]/40', bar: 'bg-[#34d399]' },
    { id: 'notebook', label: 'Sổ tay', to: 'notebook', sub: `${savedVocabCount} từ đã lưu`, icon: <Bookmark className="w-5 h-5" />, tone: 'text-[#38bdf8] bg-[#162a3f] border-[#38bdf8]/30', bar: 'bg-[#38bdf8]' },
    { id: 'achievements', label: 'Thành tựu', to: 'achievements', sub: `${(userProfile.unlockedBadges || []).length} huy hiệu`, icon: <Trophy className="w-5 h-5" />, tone: 'text-[#c084fc] bg-[#201633] border-[#c084fc]/30', bar: 'bg-[#c084fc]' },
  ];

  const last = examHistory[0];
  const R = 30, C = 2 * Math.PI * R;

  // 014 — mục tiêu hôm nay, tính từ dữ liệu học thật
  const todayStr = localDateStr();
  const todayXp = Number(localStorage.getItem(`nhai_kanji_today_xp_v1_${todayStr}`) || '0');
  const goals = [
    { id: 'study', title: 'Học một bài hôm nay', done: (userProfile.studyDays || []).includes(todayStr), tag: 'Học', k: 'var(--ui-primary)', to: resumeTab },
    { id: 'xp', title: 'Đạt 50 XP', done: todayXp >= 50, tag: `${Math.min(todayXp, 50)}/50`, k: 'var(--ui-info)', to: resumeTab },
    { id: 'exam', title: 'Làm một đề luyện thi', done: examHistory.some(r => localDateStr(new Date(r.date)) === todayStr), tag: 'Thi', k: 'var(--ui-success)', to: 'exam' },
  ];
  const goalsDone = goals.filter(g => g.done).length;
  const dateLabel = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });

  return (
    <div className="w-full max-w-lg md:max-w-4xl mx-auto px-4 py-2 space-y-2 text-white pb-6 select-none">
      {/* Tiếp tục: một dòng gọn */}
      <div className="flex items-center gap-3 rounded-xl bg-[#121927] border border-[#1b253b] px-3 py-2">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-slate-400 truncate">{pos ? 'Tiếp tục hôm nay' : `Mục tiêu ${targetLevel}`} · {weekCount}/7 ngày tuần này</div>
          <div className="text-sm font-bold text-white truncate">{resumeTitle}{pos?.level ? ` · ${pos.level}` : ''}</div>
        </div>
        <button
          type="button"
          id="btn-resume-practice"
          onClick={() => onNavigate(resumeTab)}
          className="shrink-0 rounded-lg bg-[#f43f5e] px-3 py-1.5 text-xs font-bold text-white active:scale-95 cursor-pointer"
        >
          {pos ? 'Học tiếp' : 'Bắt đầu'}
        </button>
      </div>

      {/* 014 — Mục tiêu hôm nay */}
      <div className={`ux u014${goalsDone === goals.length ? ' is-all' : ''}`} style={{ ['--p' as any]: (goalsDone / goals.length).toFixed(3) }}>
        <div className="u014-head">
          <div>
            <b>Mục tiêu hôm nay</b>
            <span className="u014-sub" aria-live="polite"><span>{dateLabel}</span><span>Hoàn thành mục tiêu hôm nay</span></span>
          </div>
          <div className="u014-ring" aria-hidden="true">
            <svg viewBox="0 0 48 48"><circle className="bg" cx="24" cy="24" r="20" /><circle className="fg" cx="24" cy="24" r="20" /></svg>
            <span className="u014-num">{goalsDone}/{goals.length}</span>
            <span className="u014-done"><svg viewBox="0 0 16 16"><path d="M3.5 8.4l3 3 6-6.4" /></svg></span>
          </div>
        </div>
        <ul className="u014-list">
          {goals.map(g => (
            <li key={g.id}>
              <button type="button" role="checkbox" aria-checked={g.done} className="u014-row" onClick={() => onNavigate(g.to)}>
                <span className="u014-box" aria-hidden="true"><svg viewBox="0 0 26 26"><path d="M7.5 13.5l3.8 3.8 7.4-8" /></svg></span>
                <span className="u014-t">{g.title}</span>
                <span className="u014-tag" style={{ ['--k' as any]: g.k }}>{g.tag}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-white whitespace-nowrap">Luyện theo kỹ năng</h2>
        <button
          type="button"
          id="btn-recommended-practice-now"
          onClick={() => onNavigate('grammar')}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#20a3db]/50 bg-[#20a3db]/15 px-3 py-1 text-[11px] font-bold text-[#38bdf8] cursor-pointer min-w-0"
        >
          <Dice5 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Gợi ý: <span className="hidden sm:inline">文法形式の判断 · </span>10 câu</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {tiles.map(t => (
          <button
            key={t.id}
            type="button"
            id={`practice-card-${t.id}`}
            onClick={() => onNavigate(t.to)}
            className="flex items-center gap-2 rounded-xl bg-[#121927] border border-[#1b253b] px-3 py-2 text-left cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className={`min-w-6 shrink-0 flex items-center justify-center whitespace-nowrap text-slate-300`}>{t.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">{t.label}</div>
              <div className="text-[11px] text-slate-400 truncate">{t.sub}{t.pct !== undefined ? ` · ${t.pct}%` : ''}</div>
            </div>
            </button>
        ))}
      </div>

      {/* Lịch sử: one compact card, no tab switcher */}
      <div className="rounded-2xl bg-[#121927] border border-[#1b253b] px-4 py-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Lịch sử</h2>
          <button
            type="button"
            id="btn-view-all-history"
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center text-xs font-semibold text-[#29b6f6] cursor-pointer"
          >
            Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-slate-300">
          Đã ôn <span className="text-cyan-400 font-bold">{savedVocabCount}</span> từ ·{' '}
          <span className="text-emerald-400 font-bold">{savedKanjiCount}</span> kanji ·{' '}
          <span className="text-purple-400 font-bold">{savedGrammarCount}</span> mẫu ngữ pháp
        </p>
        {last ? (
          <p className="text-xs text-slate-400 truncate">
            Đề gần nhất: <span className="text-white font-semibold">{last.examTitle || 'Đề thi JLPT'}</span>{' '}
            <span className="text-emerald-400 font-semibold">{last.score}/{last.totalQuestions}</span>
          </p>
        ) : (
          <p className="text-xs text-slate-500">Chưa có đề thi nào — làm đề đầu tiên ở mục Luyện thi.</p>
        )}
      </div>

      <ExamHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onRetakeExam={() => {
          setIsHistoryModalOpen(false);
          onNavigate('exam');
        }}
      />
    </div>
  );
}
