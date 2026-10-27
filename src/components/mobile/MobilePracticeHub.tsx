import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSrsAuto } from '../../utils/srsMode';
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
import ProgressDashboard from '../ProgressDashboard';
import { WeekStrip, WordOfDay } from '../home/HomeToday';

interface MobilePracticeHubProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (tab: string, extra?: any) => void;
  onEarnXp?: (xp: number, label?: string) => void;
}

type Tile = { id: string; label: string; to: string; sub: string; pct?: number; icon: React.ReactNode; tone: string; bar: string };

const TAB_LABEL: Record<string, string> = { vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', kanji: 'Kanji', reading: 'Đọc hiểu', exam: 'Luyện thi', 'japanese-chat': 'Kaiwa' };

export default function MobilePracticeHub({ userProfile, onNavigate }: MobilePracticeHubProps) {
  const [srsOn] = useSrsAuto();
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

  const pos = userProfile.lastPosition;
  const resumeTab = pos?.tab && TAB_LABEL[pos.tab] ? pos.tab : 'vocabulary';

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

  // A stable daily rotation: same goals all day, new challenges on the next local date.
  // Use UTC calendar arithmetic on the local YYYY-MM-DD to avoid timezone/DST drift.
  const todayStr = localDateStr();
  const [year, month, day] = todayStr.split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  const dailyRotation = ((dayNumber % 7) + 7) % 7;
  const srsDue = Object.values(userProfile.vocabStatus || {}).filter((v: any) => v && typeof v === 'object' && v.nextReviewDate && new Date(v.nextReviewDate) <= new Date()).length;
  type DailySkill = 'vocab' | 'grammar' | 'kanji';
  const skillNames: Record<DailySkill, string> = { vocab: 'Từ vựng', grammar: 'Ngữ pháp', kanji: 'Kanji' };
  const skillRoutes: Record<DailySkill, string> = { vocab: 'vocabulary', grammar: 'grammar', kanji: 'kanji' };
  const challenges: { skills: DailySkill[]; questions: number; pass: number; exam: boolean }[] = [
    { skills: ['vocab', 'grammar'], questions: 10, pass: 70, exam: true },
    { skills: ['kanji', 'vocab', 'grammar'], questions: 5, pass: 60, exam: false },
    { skills: ['grammar', 'kanji'], questions: 8, pass: 75, exam: true },
    { skills: ['vocab', 'kanji', 'grammar'], questions: 10, pass: 70, exam: false },
    { skills: ['kanji', 'vocab'], questions: 8, pass: 70, exam: true },
    { skills: ['grammar', 'vocab', 'kanji'], questions: 6, pass: 80, exam: false },
    { skills: ['vocab', 'grammar'], questions: 12, pass: 75, exam: true },
  ];
  const challenge = challenges[dailyRotation];

  return (
    <div className="w-full max-w-lg md:max-w-4xl mx-auto px-4 py-2 space-y-2 text-white pb-6 select-none">
      {/* SRS tự động: từ đến hạn ôn hôm nay */}
      {srsOn && srsDue > 0 && (
        <Link to="/tango" id="btn-srs-auto" className="flex items-center gap-3 rounded-xl bg-[#121927] border border-[#1b253b] px-3 py-2 active:scale-[.99]">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-slate-400">Ôn lặp lại ngắt quãng (SRS)</div>
            <div className="text-sm font-bold text-white truncate">{srsDue} từ đến hạn ôn hôm nay</div>
          </div>
          <span className="shrink-0 rounded-lg bg-[#2dd4bf] px-3 py-1.5 text-xs font-bold text-slate-900">Ôn ngay</span>
        </Link>
      )}

      <div className="lg:grid lg:grid-cols-2 lg:gap-3 lg:items-start space-y-2 lg:space-y-0">
      <div className="space-y-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-white whitespace-nowrap">Luyện theo kỹ năng</h2>
        <button
          type="button"
          id="btn-recommended-practice-now"
          onClick={() => onNavigate(skillRoutes[challenge.skills[0]])}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#20a3db]/50 bg-[#20a3db]/15 px-3 py-1 text-[11px] font-bold text-[#38bdf8] cursor-pointer min-w-0"
        >
          <Dice5 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Gợi ý: <span className="hidden sm:inline">{skillNames[challenge.skills[0]]} · </span>{challenge.questions} câu</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
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


      </div>

      {/* Tiến độ học tập chi tiết (gộp từ trang Tiến độ cũ): cột phải trên màn rộng */}
      <div className="min-w-0 space-y-2">
        <WeekStrip userProfile={userProfile} />
        <WordOfDay level={userProfile.studyTrack === 'business' ? 'BIZ' : targetLevel} />
        <ProgressDashboard userProfile={userProfile} todayXp={0} embedded />
      </div>
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
