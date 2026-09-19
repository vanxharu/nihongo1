import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Lightbulb, 
  Sliders, 
  Bookmark, 
  BookmarkCheck, 
  FileText, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  X, 
  Volume2, 
  Flag, 
  Sparkles, 
  Trophy,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { speakJapanese } from '../../utils/audio';

export interface MiniQuestion {
  id: number;
  readingPassage?: string;
  passageTitle?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'dokkai' | 'kanji' | 'grammar' | 'vocab';
  highlightWords?: string[];
}

const SAMPLE_MINI_QUESTIONS: MiniQuestion[] = [
  {
    id: 1,
    passageTitle: 'Đoạn văn',
    readingPassage: `私は半年前、家族と一緒に住んでいた家を出て、①アパートに引っ越しました。大学を卒業して会社に入ったのですが、家から遠かったです。引っ越してから、週末、近所にある広い公園へ散歩に行くようになりました。季節の花を見たり、公園の中の喫茶店でお茶を飲んだりしています。`,
    question: `どうして「私」は①引っ越しましたか？`,
    options: [
      '家族と一緒に住みたかったから',
      '家が会社から遠かったから',
      '家の近くに広い公園がなかったから',
      '一人で生活がしたかったから'
    ],
    correctIndex: 1,
    explanation: `Trong bài có câu: 「大学を卒業して会社に入ったのですが、家から遠かったです。」 (Sau khi tốt nghiệp đại học và vào công ty làm việc, nhà lại xa công ty). Vì vậy nhân vật tôi đã chuyển ra ở riêng tại căn hộ gần hơn. Đáp án chính xác là B.`,
    category: 'dokkai',
    highlightWords: ['引っ越しました', '会社', '遠かった']
  },
  {
    id: 2,
    passageTitle: 'Đoạn văn',
    readingPassage: `引っ越してから、週末、近所にある広い公園へ散歩に行くようになりました。季節の花を見たり、公園の中の喫茶店でお茶を飲んだりしています。`,
    question: `「私」は週末に公園で何をしますか？`,
    options: [
      '会社の人とスポーツをする',
      '花を見たり、喫茶店でお茶を飲んだりする',
      '家族と一緒にご飯を食べる',
      '新しいアパートを探す'
    ],
    correctIndex: 1,
    explanation: `Trong đoạn văn nêu rõ: 「季節の花を見たり、公園の中の喫茶店でお茶を飲んだりしています。」 (Tôi ngắm hoa theo mùa, uống trà ở quán giải khát trong công viên). Đáp án đúng là B.`,
    category: 'dokkai',
    highlightWords: ['散歩', '喫茶店', 'お茶']
  },
  {
    id: 3,
    question: `この漢字の読み方は何ですか：「案内」`,
    options: [
      'あんない',
      'あんうち',
      'おんな内',
      'あんどう'
    ],
    correctIndex: 0,
    explanation: `Từ 「案内」 (Án Nội - hướng dẫn) có cách đọc chuẩn là 「あんない」. Ví dụ: 道を案内する (hướng dẫn đường đi).`,
    category: 'kanji',
    highlightWords: ['案内', '読み方']
  },
  {
    id: 4,
    question: `明日は大事な会議がある＿＿＿、早く寝ます。`,
    options: [
      'ので',
      'のに',
      'ても',
      'ながら'
    ],
    correctIndex: 0,
    explanation: `Mẫu câu 「〜ので」 biểu thị nguyên nhân, lý do khách quan và lịch sự. 「明日は大事な会議があるので、早く寝ます。」 (Vì ngày mai có cuộc họp quan trọng nên tôi sẽ đi ngủ sớm).`,
    category: 'grammar',
    highlightWords: ['会議', '寝ます']
  },
  {
    id: 5,
    question: `冷蔵庫にケーキがまだ＿＿＿あります。`,
    options: [
      '残って',
      '落として',
      '消えて',
      '止まって'
    ],
    correctIndex: 0,
    explanation: `「残る (のこる)」 là tự động từ mang nghĩa còn lại, sót lại. 「残ってあります/います」: Bánh vẫn còn lại trong tủ lạnh.`,
    category: 'vocab',
    highlightWords: ['冷蔵庫', 'ケーキ']
  },
  {
    id: 6,
    question: `雨が＿＿＿前に、洗濯物を取り込みましょう。`,
    options: [
      '降る',
      '降った',
      '降って',
      '降らない'
    ],
    correctIndex: 0,
    explanation: `Cấu trúc 「V-ru + 前に」: Trước khi làm gì đó thì động từ luôn ở thể từ điển (V-ru). Do đó chọn 「降る前に」 (Trước khi trời mưa).`,
    category: 'grammar',
    highlightWords: ['洗濯物', '前に']
  },
  {
    id: 7,
    question: `きのう借りた本はもう＿＿＿しまいました。`,
    options: [
      '読んで',
      '読まなくて',
      '読むと',
      '読みながら'
    ],
    correctIndex: 0,
    explanation: `Mẫu câu 「V-te + しまいました」 biểu thị hành động đã hoàn tất trọn vẹn: 「もう読んでしまいました」 (Tôi đã đọc xong hết rồi).`,
    category: 'grammar',
    highlightWords: ['借りた', '本']
  }
];

interface MiniTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  onCompleteDay: (day: number, score: number) => void;
}

export default function MiniTestModal({
  isOpen,
  onClose,
  dayNumber,
  onCompleteDay
}: MiniTestModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPassageExpanded, setIsPassageExpanded] = useState(true);
  const [isFullPassageModalOpen, setIsFullPassageModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Settings
  const [autoNext, setAutoNext] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highlightKeywords, setHighlightKeywords] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const questions = SAMPLE_MINI_QUESTIONS;
  const currentQ = questions[currentIndex];
  const isCurrentAnswered = selectedAnswers[currentIndex] !== undefined;
  const isCurrentCorrect = selectedAnswers[currentIndex] === currentQ.correctIndex;

  // Sound feedback using Web Audio API
  const playAudioFeedback = (isCorrect: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isCorrect) {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(196, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio context might be restricted
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isCurrentAnswered) return;
    const isCorrect = idx === currentQ.correctIndex;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: idx }));
    setShowExplanation(true);
    playAudioFeedback(isCorrect);

    if (autoNext && !isCompleted) {
      setTimeout(() => {
        handleNextQuestion();
      }, 1200);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(selectedAnswers[currentIndex + 1] !== undefined);
    } else {
      // Finished all questions
      setIsCompleted(true);
      const totalCorrect = Object.entries(selectedAnswers).filter(
        ([qIdx, ansIdx]) => questions[Number(qIdx)].correctIndex === ansIdx
      ).length;
      onCompleteDay(dayNumber, totalCorrect);
    }
  };

  const toggleBookmark = (qId: number) => {
    setBookmarkedQuestions(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setIsCompleted(false);
  };

  if (!isOpen) return null;

  const totalCorrect = Object.entries(selectedAnswers).filter(
    ([qIdx, ansIdx]) => questions[Number(qIdx)]?.correctIndex === ansIdx
  ).length;

  return (
    <div className="fixed inset-0 z-[150] bg-[#0A0F1D] text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <header className="h-14 px-4 bg-[#0E1628] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-black text-white">Đề mini</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Lightbulb Hint button */}
          <button
            onClick={() => setShowExplanation(prev => !prev)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              showExplanation 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-800'
            }`}
            title="Xem gợi ý / giải thích"
          >
            <Lightbulb className="w-5 h-5" />
          </button>

          {/* Settings button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cài đặt luyện tập"
          >
            <Sliders className="w-5 h-5" />
          </button>

          {/* Bookmark button */}
          <button
            onClick={() => toggleBookmark(currentQ.id)}
            className="p-2 rounded-xl text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Lưu câu hỏi"
          >
            {bookmarkedQuestions.includes(currentQ.id) ? (
              <BookmarkCheck className="w-5 h-5 fill-amber-400 text-amber-400" />
            ) : (
              <Bookmark className="w-5 h-5 text-amber-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 max-w-2xl mx-auto w-full space-y-3 pb-24">
        {/* Question Counter Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold">
            {currentIndex + 1} / {questions.length} câu
          </span>
          <span className="text-[11px] text-sky-400 font-bold">
            Đúng: {totalCorrect}/{Object.keys(selectedAnswers).length}
          </span>
        </div>

        {/* Thin Progress bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {isCompleted ? (
          /* Completion Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10 px-6 text-center bg-[#131D31] rounded-3xl border border-slate-700/60 shadow-2xl space-y-6 mt-4"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
              <Trophy className="w-10 h-10 text-amber-950" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Hoàn thành Đề Mini Ngày {dayNumber}!</h3>
              <p className="text-sm text-slate-300 mt-1">
                Bạn đã trả lời đúng <span className="font-black text-emerald-400 text-lg">{totalCorrect}/{questions.length}</span> câu.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-around">
              <div>
                <span className="text-xs text-slate-400 block">Tỉ lệ chính xác</span>
                <span className="text-xl font-black text-sky-400">
                  {Math.round((totalCorrect / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800" />
              <div>
                <span className="text-xs text-slate-400 block">XP Nhận được</span>
                <span className="text-xl font-black text-amber-400">
                  +{totalCorrect * 15 + 20} XP
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Làm lại
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
              >
                Quay lại Lộ trình
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Reading Passage Box (Collapsible accordion as in Screenshot_20260914_130440.png) */}
            {currentQ.readingPassage && (
              <div className="bg-[#121B2C] border border-slate-800/90 rounded-2xl overflow-hidden transition-all shadow-md">
                <button
                  type="button"
                  onClick={() => setIsPassageExpanded(prev => !prev)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left text-slate-300 hover:text-white transition-colors cursor-pointer bg-[#152033]"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-black text-slate-200 tracking-wide">
                      {currentQ.passageTitle || 'Đoạn văn'}
                    </span>
                  </div>
                  {isPassageExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {isPassageExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 py-3.5 border-t border-slate-800/60 text-slate-200"
                    >
                      <p className={`leading-relaxed text-slate-200 ${
                        fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                      }`}>
                        {currentQ.readingPassage}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setIsFullPassageModalOpen(true)}
                          className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> Xem đầy đủ đoạn văn
                        </button>
                        <button
                          type="button"
                          onClick={() => speakJapanese(currentQ.readingPassage || '')}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                          title="Phát âm đoạn văn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Question Card (Cream / Warm Yellow background as in Screenshot_20260914_130440.png) */}
            <div className="bg-[#F8F1DE] text-[#2C2416] rounded-2xl p-4 sm:p-5 shadow-lg border border-amber-200/60">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#E5D7B7] text-[#55462C] font-black text-sm flex items-center justify-center shrink-0 shadow-inner">
                  {currentQ.id}
                </span>
                <div className="flex-1">
                  <h3 className={`font-bold leading-snug tracking-tight text-[#1E1B15] ${
                    fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base'
                  }`}>
                    {highlightKeywords && currentQ.highlightWords ? (
                      <span>
                        {currentQ.question}
                      </span>
                    ) : (
                      currentQ.question
                    )}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => speakJapanese(currentQ.question)}
                  className="p-1.5 rounded-xl hover:bg-amber-200/70 text-amber-900 transition-colors shrink-0 cursor-pointer"
                  title="Đọc câu hỏi"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Options List A, B, C, D (Dark card style as in Screenshot) */}
            <div className="space-y-2.5 pt-1">
              {currentQ.options.map((option, idx) => {
                const label = ['A', 'B', 'C', 'D'][idx];
                const isSelected = selectedAnswers[currentIndex] === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const showResult = isCurrentAnswered;

                let btnStyles = 'bg-[#152033] border-slate-800 text-slate-200 hover:bg-[#1C2A44] hover:border-slate-700';
                let circleStyles = 'bg-slate-800 text-slate-400 border-slate-700';

                if (showResult) {
                  if (isCorrect) {
                    btnStyles = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
                    circleStyles = 'bg-emerald-500 text-white border-emerald-400 font-black';
                  } else if (isSelected) {
                    btnStyles = 'bg-rose-950/40 border-rose-500 text-rose-200';
                    circleStyles = 'bg-rose-500 text-white border-rose-400 font-black';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isCurrentAnswered}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer active:scale-[0.99] ${btnStyles}`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${circleStyles}`}>
                      {showResult && isCorrect ? (
                        <Check className="w-4 h-4" />
                      ) : showResult && isSelected && !isCorrect ? (
                        <X className="w-4 h-4" />
                      ) : (
                        label
                      )}
                    </span>
                    <span className={`flex-1 leading-snug ${
                      fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                    } ${showResult && isCorrect ? 'font-black text-emerald-300' : ''}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation card when answered or hint is toggled */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                    isCurrentCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Giải thích chi tiết:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Bottom Sticky Action Footer */}
      {!isCompleted && (
        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-[#0E1628]/95 backdrop-blur-xl border-t border-slate-800 px-4 flex items-center justify-between z-10 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => alert('Đã gửi phản hồi báo lỗi câu hỏi tới ban quản trị.')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Báo lỗi câu hỏi</span>
          </button>

          {isCurrentAnswered && (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              {currentIndex < questions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả ✓'}
            </button>
          )}
        </footer>
      )}

      {/* Bottom Sheet "Cài đặt luyện tập" (Screenshot_20260914_130446.png) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[160]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-[170] bg-[#121927] border-t border-slate-700/80 rounded-t-3xl p-5 pb-8 shadow-2xl max-w-md mx-auto"
            >
              {/* Drag handle */}
              <div className="w-12 h-1.5 bg-slate-600 rounded-full mx-auto mb-4" />

              <h3 className="text-base font-black text-white mb-4">Cài đặt luyện tập</h3>

              <div className="space-y-4 divide-y divide-slate-800">
                {/* Tự động chuyển câu */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-slate-200">Tự động chuyển câu</span>
                  <button
                    type="button"
                    onClick={() => setAutoNext(prev => !prev)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      autoNext ? 'bg-sky-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      autoNext ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Âm thanh đúng/sai */}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm font-semibold text-slate-200">Âm thanh đúng/sai</span>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(prev => !prev)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      soundEnabled ? 'bg-sky-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Tô sáng từ vựng trong câu hỏi */}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm font-semibold text-slate-200">Tô sáng từ vựng trong câu hỏi</span>
                  <button
                    type="button"
                    onClick={() => setHighlightKeywords(prev => !prev)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      highlightKeywords ? 'bg-sky-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      highlightKeywords ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Kích cỡ chữ */}
                <div className="pt-3 space-y-2">
                  <span className="text-sm font-semibold text-slate-200 block">Kích cỡ chữ</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'sm', label: 'Nhỏ' },
                      { key: 'base', label: 'Chuẩn' },
                      { key: 'lg', label: 'Lớn' }
                    ].map(item => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setFontSize(item.key as any)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          fontSize === item.key
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-full mt-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng cài đặt
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Reading Passage Modal */}
      <AnimatePresence>
        {isFullPassageModalOpen && (
          <div className="fixed inset-0 z-[180] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121B2C] border border-slate-700 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-400" />
                  Đoạn văn đọc hiểu đầy đủ
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFullPassageModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-3 text-slate-200 leading-relaxed text-sm">
                <p>{currentQ.readingPassage}</p>
                <div className="p-3 bg-[#0B1220] rounded-xl border border-slate-800 text-xs text-slate-400">
                  <span className="font-bold text-sky-300 block mb-1">Dịch nghĩa tham khảo:</span>
                  Tôi đã rời căn nhà từng sống cùng gia đình vào nửa năm trước và chuyển đến một căn hộ. Sau khi tốt nghiệp đại học và vào làm ở công ty, nhà tôi cách công ty khá xa. Từ khi chuyển đến đây, vào cuối tuần tôi thường đi dạo ở công viên rộng lớn gần nhà. Tôi ngắm hoa theo mùa và uống trà tại quán cà phê trong công viên...
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullPassageModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs"
              >
                Quay lại câu hỏi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
