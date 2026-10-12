import React, { useState, useEffect } from 'react';
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
import successAnim from '../../assets/lottie/success.json';
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
    { id: 'notebook', label: 'Sổ tay', to: 'notebook', sub: `${savedVocabCount} từ đã lưu`, icon: <Bookmark className="w-5 h-5" />, tone: 'text-[#38bdf8] bg-[#162a3f] border-[#38bdf8]/30', bar: 'bg-[#38bdf8]' },
    { id: 'achievements', label: 'Thành tựu', to: 'achievements', sub: `${(userProfile.unlockedBadges || []).length} huy hiệu`, icon: <Trophy className="w-5 h-5" />, tone: 'text-[#c084fc] bg-[#201633] border-[#c084fc]/30', bar: 'bg-[#c084fc]' },
  ];

  const last = examHistory[0];
  const R = 30, C = 2 * Math.PI * R;

  return (
    <div className="w-full max-w-lg md:max-w-4xl mx-auto px-4 py-2 space-y-3 text-white pb-8 select-none">
      {/* Tiếp tục: resume the last lesson, plus a 7-day streak ring */}
      <div className="flex items-center gap-3 md:gap-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#1b223c] to-[#0f1424] p-3 md:p-4 shadow-lg">
        <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#1d2440] border border-amber-400/40 flex items-center justify-center overflow-hidden">
          <ShibaMascot pose="waving" size={56} animated={true} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-amber-300">{pos ? 'TIẾP TỤC HÔM NAY' : `BẮT ĐẦU · MỤC TIÊU ${targetLevel}`}</div>
          <div className="text-base md:text-xl font-black text-white truncate">{resumeTitle}</div>
          <div className={`text-[11px] text-slate-400 truncate${pos ? '' : ' hidden sm:block'}`}>{pos ? `${TAB_LABEL[resumeTab]}${pos.level ? ` · ${pos.level}` : ''}` : 'Chọn một kỹ năng bên dưới hoặc bắt đầu từ Từ vựng'}</div>
        </div>
        <div className="hidden sm:block relative shrink-0 w-[72px] h-[72px]" title="Số ngày học trong 7 ngày gần nhất">
          <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
            <circle cx="36" cy="36" r={R} fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="7" />
            <circle cx="36" cy="36" r={R} fill="none" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(weekCount / 7) * C} ${C}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
            {weekCount >= 7 ? <LottieIcon data={successAnim} size={26} loop={false} /> : weekCount > 0 && <LottieIcon data={flameAnim} size={22} className="-mb-0.5" />}
            <span className="text-sm font-black">{weekCount}/7</span>
            <span className="text-[9px] text-slate-400 mt-0.5">tuần này</span>
          </div>
        </div>
        <button
          type="button"
          id="btn-resume-practice"
          onClick={() => onNavigate(resumeTab)}
          className="shrink-0 rounded-xl bg-[#f43f5e] px-4 py-2.5 text-sm font-black text-white shadow-md active:scale-95 cursor-pointer"
        >
          {pos ? 'Học tiếp' : 'Bắt đầu'}
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {tiles.map(t => (
          <button
            key={t.id}
            type="button"
            id={`practice-card-${t.id}`}
            onClick={() => onNavigate(t.to)}
            className="flex items-center gap-3 rounded-2xl bg-[#121927] border border-[#1b253b] px-3 py-2 text-left cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${t.tone}`}>{t.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">{t.label}</div>
              <div className="text-xs text-slate-400 truncate">{t.sub}</div>
            </div>
            {t.pct !== undefined && (
              <div className="hidden sm:block w-20 shrink-0">
                <div className="h-1.5 rounded-full bg-slate-500/20 overflow-hidden"><div className={`h-full rounded-full ${t.bar}`} style={{ width: `${t.pct}%` }} /></div>
                <div className="text-[10px] text-slate-400 text-right mt-0.5">{t.pct}%</div>
              </div>
            )}
            <ChevronRight className="w-4 h-4 shrink-0 text-slate-500" />
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
