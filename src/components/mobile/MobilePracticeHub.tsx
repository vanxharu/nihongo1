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
import ShibaCompanionBanner from '../mascot/ShibaCompanionBanner';

interface MobilePracticeHubProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (tab: string, extra?: any) => void;
  onEarnXp?: (xp: number, label?: string) => void;
}

type Tile = { id: string; label: string; to: string; badge?: number; icon: React.ReactNode; tone: string };

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

  // One grid for every destination. Shadowing / Lộ trình / Tiến độ already live in the bottom nav, so they are not repeated here.
  const tiles: Tile[] = [
    { id: 'vocab', label: 'Từ vựng', to: 'vocabulary', icon: <span className="text-base font-bold">文A</span>, tone: 'text-[#38bdf8] bg-[#14283d] border-[#38bdf8]/40' },
    { id: 'grammar', label: 'Ngữ pháp', to: 'grammar', badge: savedGrammarCount, icon: <span className="text-lg font-bold">品</span>, tone: 'text-[#c084fc] bg-[#241738] border-[#c084fc]/40' },
    { id: 'kanji', label: 'Kanji', to: 'kanji', badge: savedKanjiCount, icon: <PenTool className="w-5 h-5" />, tone: 'text-[#2dd4bf] bg-[#132828] border-[#2dd4bf]/40' },
    { id: 'reading', label: 'Đọc hiểu', to: 'reading', icon: <BookOpen className="w-5 h-5" />, tone: 'text-[#fbbf24] bg-[#2f2014] border-[#fbbf24]/40' },
    { id: 'chat-ai', label: 'Kaiwa', to: 'japanese-chat', icon: <MessagesSquare className="w-5 h-5" />, tone: 'text-[#f472b6] bg-[#2e1526] border-[#f472b6]/40' },
    { id: 'exam', label: 'Luyện thi', to: 'exam', icon: <CheckSquare className="w-5 h-5" />, tone: 'text-[#f43f5e] bg-[#221624] border-[#f43f5e]/40' },
    { id: 'notebook', label: 'Sổ tay', to: 'notebook', badge: savedVocabCount, icon: <Bookmark className="w-5 h-5" />, tone: 'text-[#38bdf8] bg-[#162a3f] border-[#38bdf8]/30' },
    { id: 'achievements', label: 'Thành tựu', to: 'achievements', icon: <Trophy className="w-5 h-5" />, tone: 'text-[#c084fc] bg-[#201633] border-[#c084fc]/30' },
  ];

  const last = examHistory[0];

  return (
    <div className="w-full max-w-lg md:max-w-2xl mx-auto px-4 py-2 space-y-3 text-white pb-8 select-none">
      <ShibaCompanionBanner targetLevel={targetLevel} streakCount={userProfile.streak || 3} />

      <div className="grid grid-cols-4 gap-x-2 gap-y-3">
        {tiles.map(t => (
          <button
            key={t.id}
            type="button"
            id={`practice-card-${t.id}`}
            onClick={() => onNavigate(t.to)}
            className="relative flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform"
          >
            <div className={`relative w-14 h-14 rounded-2xl border flex items-center justify-center shadow-md ${t.tone}`}>
              {t.icon}
              {!!t.badge && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-slate-700 border border-slate-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] text-center text-slate-200 font-medium leading-tight">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Gợi ý hôm nay: one slim row instead of a full-size card */}
      <button
        type="button"
        id="btn-recommended-practice-now"
        onClick={() => onNavigate('grammar')}
        className="w-full flex items-center gap-3 rounded-2xl bg-[#20a3db] px-4 py-3 text-left shadow-md active:scale-[0.99] cursor-pointer"
      >
        <Dice5 className="w-5 h-5 shrink-0 text-white/90" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-white/90">Gợi ý hôm nay · Ngữ pháp {targetLevel}</div>
          <div className="text-sm font-black text-white truncate">文法形式の判断 · 10 câu</div>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-[#20a3db]">Luyện ngay</span>
      </button>

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
