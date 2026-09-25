import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  MessageCircle, 
  Flame, 
  X, 
  Volume2, 
  GraduationCap, 
  BookOpen, 
  Trophy, 
  ChevronUp, 
  RotateCcw,
  Zap
} from 'lucide-react';
import ShibaMascot, { ShibaPose } from './ShibaMascot';
import { speakJapanese } from '../../utils/audio';
import { UserProfile } from '../../types';

interface ShibaAssistantFloatingProps {
  userProfile?: UserProfile;
  currentTab: string;
  onNavigate: (tab: string) => void;
}

const SHIBA_DAILY_QUOTES = [
  { ja: '七転び八起き。何度でも挑戦しよう！', vi: 'Ngã 7 lần, đứng dậy 8 lần. Hãy luôn thử sức nhé!', romaji: 'Nanakorobi yaoki.' },
  { ja: '継続は力なり。今日の積み重ねが未来を創る！', vi: 'Kiên trì là sức mạnh. Tích lũy hôm nay tạo dựng tương lai!', romaji: 'Keizoku wa chikara nari.' },
  { ja: '千里の道も一歩から。焦らず一歩ずつ進もう！', vi: 'Đường vạn dặm bắt đầu từ bước đầu tiên. Cứ vững vàng tiến bước!', romaji: 'Senri no michi mo ippo kara.' },
  { ja: 'よく頑張っているね！柴犬の僕がいつも応援しているよ！', vi: 'Bạn đang làm rất tốt! Chú cún Shiba luôn ủng hộ bạn!', romaji: 'Yoku ganbatte iru ne!' },
  { ja: '今日も日本語マスターへの一歩を踏み出そう！', vi: 'Hôm nay lại cùng tiến thêm một bước thành bậc thầy tiếng Nhật nào!', romaji: 'Kyou mo nihongo masutaa e no ippo o!' }
];

export default function ShibaAssistantFloating({
  userProfile,
  currentTab,
  onNavigate
}: ShibaAssistantFloatingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [bubbleText, setBubbleText] = useState<string>('Kon\'nichiwa! Cùng học nhé 🐕');
  const [currentPose, setCurrentPose] = useState<ShibaPose>('welcome');
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Synchronize pose based on current tab
  useEffect(() => {
    switch (currentTab) {
      case 'japanese-chat':
        setCurrentPose('speaking');
        setBubbleText('Tôi đang lắng nghe bạn đây!');
        break;
      case 'exam':
      case 'daily-exam':
      case 'jlpt-exam':
        setCurrentPose('thinking');
        setBubbleText('Tập trung làm bài nhé, bạn làm được!');
        break;
      case 'achievements':
      case 'progress':
        setCurrentPose('celebration');
        setBubbleText('Nhìn lại hành trình tự hào nào!');
        break;
      case 'reading':
      case 'study-books':
      case 'lessons':
        setCurrentPose('study');
        setBubbleText('Đọc kỹ ngữ cảnh và từ mới nhé!');
        break;
      case 'kaiwa':
        setCurrentPose('listening');
        setBubbleText('Luyện phát âm chuẩn cùng tôi nhé!');
        break;
      default:
        setCurrentPose('welcome');
        setBubbleText('Hôm nay học vui cùng Nihon Shiba nhé!');
        break;
    }
  }, [currentTab]);

  const activeQuote = SHIBA_DAILY_QUOTES[quoteIndex];

  const handleSpeakQuote = () => {
    speakJapanese(activeQuote.ja);
  };

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % SHIBA_DAILY_QUOTES.length);
    setCurrentPose((prev) => {
      const poses: ShibaPose[] = ['happy', 'encourage', 'celebration', 'study', 'welcome'];
      const nextIdx = (poses.indexOf(prev) + 1) % poses.length;
      return poses[nextIdx];
    });
  };

  // Do not render floating widget if user is actively in full-screen exam or full chat to avoid blocking view
  if (currentTab === 'japanese-chat') return null;

  return (
    <>
      {/* Floating Floating Mascot Anchor */}
      <div className="fixed bottom-20 xl:bottom-6 right-3 sm:right-6 z-[90] select-none pointer-events-auto">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative flex items-center group cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              {/* Tooltip / Speech bubble (on hover or initial) */}
              {!isDismissed && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden sm:flex items-center gap-1.5 mr-2 px-3 py-1.5 bg-[#1B223C] border border-[#E89A3C]/40 rounded-full shadow-lg shadow-black/40 text-xs font-bold text-amber-200 backdrop-blur-md whitespace-nowrap"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[#E89A3C] shrink-0" />
                  <span>{bubbleText}</span>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
                    className="ml-1 text-slate-400 hover:text-white p-0.5 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}

              {/* Floating Shiba Mascot Avatar Button */}
              <div 
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#242d4a] to-[#12172A] border-2 border-[#E89A3C] shadow-xl shadow-black/60 p-1 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group-hover:border-[#F5A623] overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,166,35,0.25),transparent_70%)] pointer-events-none" />
                <ShibaMascot pose={currentPose} size={48} animated={true} />

                {/* Badge: Fire Flame or Level */}
                {userProfile && userProfile.streak > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white text-[10px] font-black shadow-md flex items-center gap-0.5 border border-amber-300/40">
                    <Flame className="w-2.5 h-2.5 fill-current" />
                    <span>{userProfile.streak}</span>
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded Companion Panel Modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-80 sm:w-96 bg-[#12172A] border-2 border-[#E89A3C]/60 rounded-3xl p-4 shadow-2xl shadow-black/80 backdrop-blur-xl text-white overflow-hidden relative"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1B223C]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E89A3C]/20 border border-[#E89A3C]/40 flex items-center justify-center">
                    <ShibaMascot pose="happy" size={28} animated={false} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-300 tracking-wide flex items-center gap-1.5">
                      Nihon Shiba (にほんしば)
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Bạn đồng hành tiếng Nhật của bạn</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#1B223C] hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Mascot Display & Encouragement Quote */}
              <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-br from-[#1B223C]/90 to-[#182033]/90 border border-[#E89A3C]/30 flex items-center gap-3">
                <div className="shrink-0 flex flex-col items-center">
                  <ShibaMascot pose={currentPose} size={70} animated={true} />
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider mt-1">
                    {userProfile?.targetLevel || 'N5'} Companion
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-amber-400 uppercase flex items-center gap-1">
                      <Lightbulb className="w-2.5 h-2.5" /> Lời khuyên hôm nay
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSpeakQuote}
                        className="p-1 rounded-md bg-[#242E52] hover:bg-[#E89A3C] text-amber-300 hover:text-white transition-colors"
                        title="Nghe phát âm tiếng Nhật"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextQuote}
                        className="p-1 rounded-md bg-[#242E52] hover:bg-[#E89A3C] text-amber-300 hover:text-white transition-colors"
                        title="Xem lời khuyên khác"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-white leading-snug">{activeQuote.ja}</p>
                  <p className="text-[11px] text-amber-200/90 italic leading-snug mt-0.5">{activeQuote.vi}</p>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('japanese-chat');
                  }}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-[#1B223C] border border-purple-500/40 hover:border-purple-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 group-hover:text-purple-200">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-purple-200">Chat AI Kaiwa</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Trò chuyện cùng Shiba</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('daily-exam');
                  }}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-red-950/60 to-[#1B223C] border border-red-500/40 hover:border-red-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-300 group-hover:text-red-200">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-red-200">Quiz 5 Phút</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Thử thách tăng streak</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('vocabulary');
                  }}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/60 to-[#1B223C] border border-amber-500/40 hover:border-amber-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 group-hover:text-amber-200">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-amber-200">Từ Vựng JLPT</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Luyện nhớ sâu từ vựng</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('achievements');
                  }}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#1B223C] border border-emerald-500/40 hover:border-emerald-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:text-emerald-200">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-200">Bảng Thành Tựu</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Huy hiệu & danh hiệu</p>
                </button>
              </div>

              {/* Bottom Streak Footer */}
              <div className="mt-3 pt-2.5 border-t border-[#1B223C] flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  <span>Chuỗi học: <strong className="text-amber-300 font-black">{userProfile?.streak || 0} ngày</strong></span>
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  にほんしば • がんばろう!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
