import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lightbulb, PenTool, Sparkles, BookOpen, Clock, Brain, CheckCircle2 } from 'lucide-react';

interface StudyTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'japanese' | 'kanji';
  onAction?: () => void;
}

export default function StudyTipsModal({ isOpen, onClose, type = 'japanese', onAction }: StudyTipsModalProps) {
  if (!isOpen) return null;

  const isKanji = type === 'kanji';

  const japaneseTips = [
    {
      title: 'Quy tắc lặp lại ngắt quãng (SRS)',
      desc: 'Ôn từ vựng sau 1 ngày, 3 ngày, 7 ngày và 14 ngày để biến trí nhớ ngắn hạn thành phản xạ dài hạn.',
      tag: 'Ghi nhớ siêu tốc'
    },
    {
      title: 'Học từ vựng trong văn cảnh (Context)',
      desc: 'Không học từ đơn lẻ, luôn ghi nhớ kèm câu ví dụ và cụm từ đi kèm (collocation) để ứng dụng được ngay.',
      tag: 'Từ vựng'
    },
    {
      title: 'Tập nói nhại (Shadowing) mỗi ngày 10 phút',
      desc: 'Bật audio bản xứ và nói đè theo đúng ngữ điệu để tạo cơ miệng tự nhiên và cải thiện điểm nghe hiểu.',
      tag: 'Nghe hiểu & Kaiwa'
    },
    {
      title: 'Chiến thuật làm bài thi JLPT',
      desc: 'Làm câu dễ trước, câu khó sau. Dành tối đa 60 giây cho mỗi câu ngữ pháp để dành thời gian đọc bài đọc dài.',
      tag: 'Kỹ năng thi cử'
    }
  ];

  const kanjiTips = [
    {
      title: 'Nắm vững 214 Bộ thủ cốt lõi (Radicals)',
      desc: 'Mọi chữ Hán phức tạp đều cấu thành từ các bộ thủ cơ bản như Nhân (人), Thủy (氵), Hỏa (灬), Mộc (木). Học bộ thủ giúp bạn đoán nghĩa của chữ mới.',
      tag: 'Bộ thủ'
    },
    {
      title: 'Phương pháp Chiết tự & Kể chuyện (Mnemonics)',
      desc: 'Chia nhỏ chữ thành các bộ phận và ghép thành một mẩu chuyện tượng hình độc đáo, giúp não bộ lưu giữ hình ảnh sâu sắc.',
      tag: 'Chiết tự'
    },
    {
      title: 'Phân biệt Onyomi và Kunyomi chuẩn xác',
      desc: 'Từ ghép 2 chữ Hán trở lên (熟語) thường đọc theo Onyomi. Chữ Hán đứng một mình kèm okurigana (hiragana theo sau) thường đọc theo Kunyomi.',
      tag: 'Cách đọc'
    },
    {
      title: 'Quy tắc thứ tự nét bút cơ bản',
      desc: 'Viết từ trên xuống dưới, từ trái sang phải, ngang trước sổ sau, ngoài trước trong sau rồi đóng lại. Viết đúng nét giúp nhớ mặt chữ nhanh gấp 3 lần.',
      tag: 'Thuận bút'
    }
  ];

  const tips = isKanji ? kanjiTips : japaneseTips;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full sm:max-w-md bg-[#0c1322] border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl text-white p-6 space-y-5 max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isKanji 
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
              }`}>
                {isKanji ? <PenTool className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {isKanji ? 'Mẹo học Kanji nhớ lâu' : 'Mẹo học tiếng Nhật hiệu quả'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isKanji ? 'Phương pháp chiết tự & 214 bộ thủ' : 'Bí quyết đạt điểm cao JLPT từ thủ khoa'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tips List */}
          <div className="space-y-3">
            {tips.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#141b2e] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isKanji
                      ? 'text-emerald-400 bg-emerald-500/15'
                      : 'text-amber-400 bg-amber-500/15'
                  }`}>
                    {item.tag}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">#0{idx + 1}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 pt-1">
            {onAction && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAction();
                }}
                className={`flex-1 py-3 text-white rounded-xl font-bold text-xs active:scale-[0.98] transition-all cursor-pointer ${
                  isKanji ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isKanji ? 'Thực hành Kanji ngay' : 'Bắt đầu học ngay'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
