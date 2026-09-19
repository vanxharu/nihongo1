import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Bot,
  ArrowRight, 
  CheckSquare, 
  PenTool, 
  Route, 
  Trophy, 
  TrendingUp, 
  Bookmark, 
  BookMarked,
  Dice5, 
  HelpCircle, 
  ChevronRight,
  Headphones
} from 'lucide-react';
import { UserProfile, ExamHistoryRecord } from '../../types';
import PremiumModal from './PremiumModal';
import { ExamHistoryModal } from '../ExamHistoryModal';
import { getExamHistory } from '../../utils/examHistoryStorage';
import ShibaCompanionBanner from '../mascot/ShibaCompanionBanner';

interface MobilePracticeHubProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (tab: string, extra?: any) => void;
  onEarnXp?: (xp: number, label?: string) => void;
}

export default function MobilePracticeHub({
  userProfile,
  updateProfile,
  onNavigate,
  onEarnXp
}: MobilePracticeHubProps) {
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<'practice' | 'exam'>('practice');
  const [examHistory, setExamHistory] = useState<ExamHistoryRecord[]>([]);

  useEffect(() => {
    setExamHistory(getExamHistory());
  }, [isHistoryModalOpen]);

  const targetLevel = userProfile.targetLevel || 'N4';
  const savedVocabCount = (userProfile.savedVocab || []).length;
  const savedKanjiCount = Object.values(userProfile.kanjiStatus || {}).filter(Boolean).length;
  const savedGrammarCount = Object.values(userProfile.grammarStatus || {}).filter(Boolean).length;

  return (
    <div className="w-full max-w-lg md:max-w-2xl mx-auto px-4 py-2.5 space-y-5 text-white pb-12 select-none">

      {/* Mascot Companion Banner */}
      <ShibaCompanionBanner
        onNavigate={onNavigate}
        targetLevel={targetLevel}
        userName={userProfile.name || 'Bạn'}
        streakCount={userProfile.streak || 3}
      />

      {/* 3. Bốn thẻ học chính (Lưới 2x2) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Thẻ 1: Chữ – Từ vựng (Cyan Accent) -> Đến Ôn tập từ vựng */}
        <button
          type="button"
          id="practice-card-vocab"
          onClick={() => onNavigate('vocabulary')}
          className="group relative p-4 rounded-2xl bg-[#121927] border border-[#1b253b] hover:border-cyan-500/50 transition-all text-left flex flex-col justify-between h-[132px] sm:h-[140px] shadow-lg active:scale-[0.98] cursor-pointer overflow-hidden"
        >
          <svg className="absolute top-0 left-0 w-16 h-16 pointer-events-none" viewBox="0 0 64 64" fill="none">
            <path d="M 0 34 C 0 15.2 15.2 0 34 0 L 52 0" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
          </svg>

          <div className="flex items-start justify-between w-full relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[#14283d] border border-[#38bdf8]/40 text-[#38bdf8] flex items-center justify-center font-bold text-base shadow-inner">
              文A
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all mt-1" />
          </div>

          <div className="relative z-10">
            <div className="text-[15px] font-bold text-white group-hover:text-cyan-200 transition-colors leading-tight">
              Chữ – Từ vựng
            </div>
            <div className="text-xs font-semibold text-[#38bdf8] mt-0.5">
              文字・語彙
            </div>
          </div>
        </button>

        {/* Thẻ 2: Ngữ pháp (Purple Accent) -> Đến Lý thuyết & Luyện ngữ pháp */}
        <button
          type="button"
          id="practice-card-grammar"
          onClick={() => onNavigate('grammar')}
          className="group relative p-4 rounded-2xl bg-[#121927] border border-[#1b253b] hover:border-purple-500/50 transition-all text-left flex flex-col justify-between h-[132px] sm:h-[140px] shadow-lg active:scale-[0.98] cursor-pointer overflow-hidden"
        >
          <svg className="absolute top-0 left-0 w-16 h-16 pointer-events-none" viewBox="0 0 64 64" fill="none">
            <path d="M 0 34 C 0 15.2 15.2 0 34 0 L 52 0" stroke="#b388ff" strokeWidth="3.5" strokeLinecap="round" />
          </svg>

          <div className="flex items-start justify-between w-full relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[#241738] border border-[#c084fc]/40 text-[#c084fc] flex items-center justify-center font-bold text-lg shadow-inner">
              品
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all mt-1" />
          </div>

          <div className="relative z-10">
            <div className="text-[15px] font-bold text-white group-hover:text-purple-200 transition-colors leading-tight">
              Ngữ pháp
            </div>
            <div className="text-xs font-semibold text-[#c084fc] mt-0.5">
              文法
            </div>
          </div>
        </button>

        {/* Thẻ 3: Đọc hiểu (Amber Accent) -> Đến Đọc hiểu & Tin tức */}
        <button
          type="button"
          id="practice-card-reading"
          onClick={() => onNavigate('reading')}
          className="group relative p-4 rounded-2xl bg-[#121927] border border-[#1b253b] hover:border-amber-500/50 transition-all text-left flex flex-col justify-between h-[132px] sm:h-[140px] shadow-lg active:scale-[0.98] cursor-pointer overflow-hidden"
        >
          <svg className="absolute top-0 left-0 w-16 h-16 pointer-events-none" viewBox="0 0 64 64" fill="none">
            <path d="M 0 34 C 0 15.2 15.2 0 34 0 L 52 0" stroke="#ff9800" strokeWidth="3.5" strokeLinecap="round" />
          </svg>

          <div className="flex items-start justify-between w-full relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[#2f2014] border border-[#fbbf24]/40 text-[#fbbf24] flex items-center justify-center font-bold shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all mt-1" />
          </div>

          <div className="relative z-10">
            <div className="text-[15px] font-bold text-white group-hover:text-amber-200 transition-colors leading-tight">
              Đọc hiểu
            </div>
            <div className="text-xs font-semibold text-[#fbbf24] mt-0.5">
              読解
            </div>
          </div>
        </button>

        {/* Thẻ 4: Nghe hiểu JLPT (Emerald Accent) -> Đến Nghe hiểu JLPT */}
        <button
          type="button"
          id="practice-card-listening"
          onClick={() => onNavigate('listening')}
          className="group relative p-4 rounded-2xl bg-[#121927] border border-[#1b253b] hover:border-emerald-500/50 transition-all text-left flex flex-col justify-between h-[132px] sm:h-[140px] shadow-lg active:scale-[0.98] cursor-pointer overflow-hidden"
        >
          <svg className="absolute top-0 left-0 w-16 h-16 pointer-events-none" viewBox="0 0 64 64" fill="none">
            <path d="M 0 34 C 0 15.2 15.2 0 34 0 L 52 0" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
          </svg>

          <div className="flex items-start justify-between w-full relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[#0e2920] border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold shadow-inner">
              <Headphones className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all mt-1" />
          </div>

          <div className="relative z-10">
            <div className="text-[15px] font-bold text-white group-hover:text-emerald-200 transition-colors leading-tight">
              JLPT Listening
            </div>
            <div className="text-xs font-semibold text-emerald-400 mt-0.5">
              聴解 (N5-N1)
            </div>
          </div>
        </button>

        {/* Thẻ 5: Chat AI (Pink Accent) -> Đến Chat AI Tiếng Nhật */}
        <button
          type="button"
          id="practice-card-chat-ai"
          onClick={() => onNavigate('japanese-chat')}
          className="group relative p-4 rounded-2xl bg-[#121927] border border-[#1b253b] hover:border-pink-500/50 transition-all text-left flex flex-col justify-between h-[132px] sm:h-[140px] shadow-lg active:scale-[0.98] cursor-pointer overflow-hidden"
        >
          <svg className="absolute top-0 left-0 w-16 h-16 pointer-events-none" viewBox="0 0 64 64" fill="none">
            <path d="M 0 34 C 0 15.2 15.2 0 34 0 L 52 0" stroke="#f06292" strokeWidth="3.5" strokeLinecap="round" />
          </svg>

          <div className="flex items-start justify-between w-full relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[#2e1526] border border-[#f472b6]/40 text-[#f472b6] flex items-center justify-center font-bold shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all mt-1" />
          </div>

          <div className="relative z-10">
            <div className="text-[15px] font-bold text-white group-hover:text-pink-200 transition-colors leading-tight">
              Chat AI
            </div>
            <div className="text-xs font-semibold text-[#f472b6] mt-0.5">
              AIチャット
            </div>
          </div>
        </button>
      </div>

      {/* 4. Mục: Luyện thi (5 nút 1 hàng: Luyện thi JLPT, Sách ôn thi JLPT, Lộ trình, Bảng xếp hạng, Dự đoán điểm) */}
      <div className="space-y-3 pt-1">
        <h2 className="text-base sm:text-lg font-bold text-white">
          Luyện thi
        </h2>
        <div className="grid grid-cols-5 gap-y-3.5 gap-x-1 sm:gap-x-2">
          {/* 1. Luyện thi JLPT */}
          <button
            type="button"
            id="btn-exam-jlpt-quiz"
            onClick={() => onNavigate('exam')}
            className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-all"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#221624] border border-rose-500/20 text-[#f43f5e] flex items-center justify-center shadow-md group-hover:border-rose-500/40 group-hover:bg-rose-500/10 transition-colors">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-center text-slate-300 font-medium leading-tight max-w-[64px] sm:max-w-[70px]">
              Luyện thi JLPT
            </span>
          </button>

          {/* 2. Sách ôn thi JLPT -> Mở Tủ sách ôn thi JLPT (StudyBooksHub) */}
          <button
            type="button"
            id="btn-jlpt-study-books"
            onClick={() => onNavigate('study-books')}
            className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-all"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#261d12] border border-amber-500/25 text-[#fbbf24] flex items-center justify-center shadow-md group-hover:border-amber-500/40 group-hover:bg-amber-500/10 transition-colors">
              <BookMarked className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-center text-slate-300 font-medium leading-tight max-w-[64px] sm:max-w-[70px]">
              Sách ôn thi JLPT
            </span>
          </button>

          {/* 3. Lộ trình -> Mở Lộ trình JLPT N5-N1 */}
          <button
            type="button"
            id="btn-jlpt-roadmap"
            onClick={() => onNavigate('roadmap')}
            className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-all"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#1a1733] border border-indigo-500/20 text-[#a78bfa] flex items-center justify-center shadow-md group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-colors">
              <Route className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-center text-slate-300 font-medium leading-tight max-w-[64px] sm:max-w-[70px]">
              Lộ trình
            </span>
          </button>

          {/* 4. Bảng xếp hạng -> Mở Thành tựu & Bảng xếp hạng */}
          <button
            type="button"
            id="btn-leaderboard-achievements"
            onClick={() => onNavigate('achievements')}
            className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-all"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#201633] border border-purple-500/20 text-[#c084fc] flex items-center justify-center shadow-md group-hover:border-purple-500/40 group-hover:bg-purple-500/10 transition-colors">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-center text-slate-300 font-medium leading-tight max-w-[64px] sm:max-w-[70px]">
              Bảng xếp hạng
            </span>
          </button>

          {/* 5. Dự đoán điểm -> Mở Báo cáo tiến độ & Dự đoán điểm JLPT */}
          <button
            type="button"
            id="btn-score-prediction"
            onClick={() => onNavigate('progress')}
            className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-all"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#12242e] border border-cyan-500/20 text-[#22d3ee] flex items-center justify-center shadow-md group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-colors">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-center text-slate-300 font-medium leading-tight max-w-[64px] sm:max-w-[70px]">
              Dự đoán điểm
            </span>
          </button>
        </div>
      </div>

      {/* 5. Mục: Đề xuất luyện tập (Thẻ xanh dương phẳng rực rỡ) */}
      <div className="space-y-3 pt-1">
        <h2 className="text-base sm:text-lg font-bold text-white">
          Đề xuất luyện tập
        </h2>
        <div className="p-5 sm:p-6 rounded-3xl bg-[#20a3db] text-white shadow-xl shadow-cyan-950/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95">
              <span className="text-sm font-bold">品</span>
              <span>Ngữ pháp • {targetLevel}</span>
            </div>
            <Dice5 className="w-5 h-5 text-white/90" />
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              文法形式の判断
            </h3>
            <p className="text-xs sm:text-sm text-white/95 font-medium mt-1">
              Chọn mẫu ngữ pháp • 10 câu
            </p>
          </div>

          <button
            type="button"
            id="btn-recommended-practice-now"
            onClick={() => onNavigate('grammar')}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-[#20a3db] font-black text-sm rounded-full shadow-md active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Luyện ngay
          </button>
        </div>
      </div>

      {/* 6. Mục: Lịch sử luyện tập */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white">
            Lịch sử luyện tập
          </h2>
          <button
            type="button"
            id="btn-view-all-history"
            onClick={() => setIsHistoryModalOpen(true)}
            className="text-xs font-semibold text-[#29b6f6] hover:underline transition-colors cursor-pointer"
          >
            Xem tất cả
          </button>
        </div>

        {/* 2 Tabs chuyển đổi: Luyện tập | Luyện thi */}
        <div className="flex gap-2.5">
          <button
            type="button"
            id="tab-history-practice"
            onClick={() => setHistoryTab('practice')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              historyTab === 'practice'
                ? 'bg-[#1e88e5] text-white shadow-md shadow-blue-900/30'
                : 'bg-[#121927] text-slate-400 hover:text-slate-200'
            }`}
          >
            Luyện tập
          </button>
          <button
            type="button"
            id="tab-history-exam"
            onClick={() => setHistoryTab('exam')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              historyTab === 'exam'
                ? 'bg-[#1e88e5] text-white shadow-md shadow-blue-900/30'
                : 'bg-[#121927] text-slate-400 hover:text-slate-200'
            }`}
          >
            Luyện thi
          </button>
        </div>

        {/* Nội dung tương ứng của Tab */}
        {historyTab === 'practice' ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121927] border border-[#1b253b] space-y-3 text-left">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Bạn đã ôn luyện: <span className="text-cyan-400 font-bold">{savedVocabCount}</span> từ vựng, <span className="text-emerald-400 font-bold">{savedKanjiCount}</span> chữ Kanji, <span className="text-purple-400 font-bold">{savedGrammarCount}</span> mẫu ngữ pháp.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('vocabulary')}
              className="inline-flex items-center gap-1.5 text-xs text-[#29b6f6] font-bold hover:underline cursor-pointer"
            >
              <span>Tiếp tục học ngay</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121927] border border-[#1b253b] text-left">
            {examHistory.length > 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Bài thi gần nhất</span>
                  <span className="text-emerald-400 font-semibold">{examHistory[0]?.score}/{examHistory[0]?.totalQuestions} câu</span>
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {examHistory[0]?.examTitle || 'Đề thi JLPT'}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                  >
                    Xem chi tiết bài thi
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('exam')}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                  >
                    Luyện đề mới
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Chưa có gì ở đây — hoàn thành bài luyện thi đầu tiên là sẽ hiện lên nhé.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('exam')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#29b6f6] font-bold hover:underline cursor-pointer"
                >
                  <span>Luyện đề thi ngay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Mục: Đã lưu (Lưới 2x2) */}
      <div className="space-y-3 pt-1">
        <h2 className="text-base sm:text-lg font-bold text-white">
          Đã lưu
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Từ vựng -> Đến Sổ tay từ vựng */}
          <button
            type="button"
            id="saved-btn-vocab"
            onClick={() => onNavigate('notebook')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#121927] border border-[#1b253b] hover:border-slate-700 text-left transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#162a3f] text-[#38bdf8] flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold text-white leading-tight">{savedVocabCount}</div>
              <div className="text-xs text-slate-400 mt-0.5">Từ vựng</div>
            </div>
          </button>

          {/* Ngữ pháp -> Đến Ngữ pháp đã lưu */}
          <button
            type="button"
            id="saved-btn-grammar"
            onClick={() => onNavigate('grammar')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#121927] border border-[#1b253b] hover:border-slate-700 text-left transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1f1d3a] text-[#818cf8] flex items-center justify-center shrink-0 font-bold text-base">
              品
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold text-white leading-tight">{savedGrammarCount}</div>
              <div className="text-xs text-slate-400 mt-0.5">Ngữ pháp</div>
            </div>
          </button>

          {/* Kanji -> Đến Hán tự đã lưu */}
          <button
            type="button"
            id="saved-btn-kanji"
            onClick={() => onNavigate('kanji')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#121927] border border-[#1b253b] hover:border-slate-700 text-left transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#132828] text-[#2dd4bf] flex items-center justify-center shrink-0">
              <PenTool className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold text-white leading-tight">{savedKanjiCount}</div>
              <div className="text-xs text-slate-400 mt-0.5">Kanji</div>
            </div>
          </button>

          {/* Câu hỏi -> Đến Sổ câu hỏi / Luyện đề */}
          <button
            type="button"
            id="saved-btn-questions"
            onClick={() => onNavigate('notebook')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#121927] border border-[#1b253b] hover:border-slate-700 text-left transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#291722] text-[#f43f5e] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold text-white leading-tight">0</div>
              <div className="text-xs text-slate-400 mt-0.5">Câu hỏi</div>
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <PremiumModal isOpen={isPremiumOpen} onClose={() => setIsPremiumOpen(false)} />

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
