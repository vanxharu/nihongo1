import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  WifiOff, 
  Bot, 
  BookOpen 
} from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function PremiumModal({ isOpen, onClose, onUpgrade }: PremiumModalProps) {
  if (!isOpen) return null;

  const features = [
    {
      icon: WifiOff,
      title: 'Học Offline 100% không giới hạn',
      desc: 'Tải toàn bộ từ vựng, ngữ pháp, kanji và âm thanh bản xứ về máy'
    },
    {
      icon: Bot,
      title: 'Gia sư AI chấm điểm & giải thích chi tiết',
      desc: 'Hỏi đáp ngữ pháp chuyên sâu, giải nghĩa kanji, luyện viết không giới hạn'
    },
    {
      icon: BookOpen,
      title: 'Kho đề thi JLPT N5 - N1 chuẩn Nhật',
      desc: 'Truy cập trọn bộ đề thi thật các năm kèm đáp án và audio nghe hiểu'
    },
    {
      icon: Zap,
      title: 'Trải nghiệm không quảng cáo',
      desc: 'Tập trung tối đa 100% thời gian cho việc ghi nhớ và nâng cao điểm thi'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full sm:max-w-md bg-[#0c1322] border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl text-white p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
                <Crown className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Nâng cấp Premium</h3>
                <p className="text-xs text-amber-300/90 font-medium">Mở khóa đặc quyền học tiếng Nhật đỉnh cao</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pricing Highlight Pill */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-600/30 via-indigo-600/30 to-purple-600/30 border border-sky-500/40 text-center space-y-1">
            <div className="inline-block px-3 py-1 rounded-full bg-sky-500/30 text-sky-300 text-[11px] font-bold uppercase tracking-wider mb-1">
              Ưu đãi giảm 30% hôm nay
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">49.000đ</span>
              <span className="text-sm line-through text-slate-400">79.000đ</span>
              <span className="text-xs text-slate-300 font-medium">/ tháng</span>
            </div>
            <p className="text-[11px] text-slate-400">Học trọn đời chỉ với 199.000đ (tiết kiệm 75%)</p>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                if (onUpgrade) onUpgrade();
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-600/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Kích hoạt Premium ngay</span>
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Có thể hủy bất cứ lúc nào • Hỗ trợ hoàn tiền trong 7 ngày nếu không hài lòng
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
