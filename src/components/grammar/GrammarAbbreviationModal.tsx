import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, BookOpen, Layers, Sparkles } from 'lucide-react';

interface GrammarAbbreviationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GRAMMAR_ABBREVIATIONS = [
  {
    code: 'V',
    jp: '動詞 (どうし)',
    vi: 'Động từ',
    desc: 'Động từ nguyên mẫu hoặc chia theo các thể.',
    example: '食べます (ăn), 行きます (đi), 勉強します (học)'
  },
  {
    code: 'N',
    jp: '名詞 (めいし)',
    vi: 'Danh từ',
    desc: 'Danh từ chỉ người, sự vật, hiện tượng hoặc nơi chốn.',
    example: '学生 (học sinh), 日本 (Nhật Bản), 本 (sách)'
  },
  {
    code: 'A-i',
    jp: 'イ形容詞 (イけいようし)',
    vi: 'Tính từ đuôi い',
    desc: 'Tính từ kết thúc bằng đuôi い nguyên bản.',
    example: '高い (cao/đắt), 暑い (nóng), おいしい (ngon)'
  },
  {
    code: 'A-na',
    jp: 'ナ形容詞 (ナけいようし)',
    vi: 'Tính từ đuôi な',
    desc: 'Tính từ đuôi な (khi nối danh từ cần thêm な).',
    example: '静か[な] (yên tĩnh), 綺麗[な] (đẹp), 親切[な] (tốt bụng)'
  },
  {
    code: 'V-dict',
    jp: '辞書形 (じしょけい)',
    vi: 'Thể từ điển / Thể nguyên mẫu',
    desc: 'Dạng cơ bản tra cứu trong từ điển (thể thông thường hiện tại).',
    example: '食べる (ăn), 行く (đi), する (làm)'
  },
  {
    code: 'V-te',
    jp: 'て形 (てけい)',
    vi: 'Thể て',
    desc: 'Dùng để nối các hành động, yêu cầu làm gì (〜てください), đang làm (〜ている).',
    example: '食べて, 行って, 勉強して'
  },
  {
    code: 'V-ta',
    jp: 'た形 (たけい)',
    vi: 'Thể た (Quá khứ ngắn)',
    desc: 'Dùng cho các cấu trúc quá khứ, đã từng (〜たことがある), vừa mới (〜たばかり).',
    example: '食べた, 行った, 勉強した'
  },
  {
    code: 'V-nai',
    jp: 'ない形 (ないけい)',
    vi: 'Thể Phủ định ngắn',
    desc: 'Dùng cho cấu trúc cấm chỉ (〜ないでください), phải làm (〜なければならない).',
    example: '食べない, 行かない, 勉強しない'
  },
  {
    code: 'V-ba',
    jp: 'ば形 (条件形 - じょうけんけい)',
    vi: 'Thể điều kiện (Nếu...)',
    desc: 'Biểu thị giả định: nếu hành động xảy ra thì dẫn đến kết quả.',
    example: '食べれば (nếu ăn), 行けば (nếu đi), すれば (nếu làm)'
  },
  {
    code: 'V-kanou',
    jp: '可能形 (かのうけい)',
    vi: 'Thể khả năng (Có thể...)',
    desc: 'Biểu thị năng lực hoặc điều kiện cho phép thực hiện hành động.',
    example: '食べられる (có thể ăn), 行ける (có thể đi), できる (có thể làm)'
  },
  {
    code: 'V-ukemi',
    jp: '受身形 (うけみけい)',
    vi: 'Thể bị động (Bị / Được...)',
    desc: 'Diễn tả chủ ngữ tiếp nhận hành động từ người khác tác động vào.',
    example: '叱られる (bị mắng), 褒められる (được khen)'
  },
  {
    code: 'V-shieki',
    jp: '使役形 (しえきけい)',
    vi: 'Thể sai khiến (Bắt / Cho phép...)',
    desc: 'Diễn tả người trên yêu cầu, ép buộc hoặc cho phép người dưới thực hiện.',
    example: '食べさせる (bắt ăn), 行かせる (cho phép đi)'
  }
];

export default function GrammarAbbreviationModal({ isOpen, onClose }: GrammarAbbreviationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="grammar-abbreviation-backdrop"
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          id="grammar-abbreviation-modal-panel"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Quy Ước Viết Tắt Cấu Trúc Ngữ Pháp
                </h2>
                <p className="text-xs text-slate-400">
                  Bảng tra cứu ký hiệu chuẩn giúp bạn đọc hiểu mọi công thức kết nối JLPT
                </p>
              </div>
            </div>
            <button
              id="close-abbreviation-modal-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - Abbreviation Cards */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-85px)] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {GRAMMAR_ABBREVIATIONS.map((item) => (
                <div
                  key={item.code}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm">
                        {item.code}
                      </span>
                      <span className="text-xs font-medium text-slate-400 font-jp">
                        {item.jp}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {item.vi}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="pt-2 border-t border-slate-700/40 text-xs flex items-start gap-1.5 text-slate-400">
                    <span className="text-slate-500 font-medium whitespace-nowrap">Ví dụ:</span>
                    <span className="text-slate-300 font-jp">{item.example}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Practical connection tip */}
            <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/40 text-xs text-sky-200 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sky-300 mb-0.5">Mẹo ghi nhớ công thức kết nối:</p>
                <p className="text-slate-300 leading-relaxed">
                  Khi công thức ghi <code className="text-amber-300 bg-slate-900/60 px-1 py-0.5 rounded">V-thông thường</code> tức là bao gồm: <code className="text-sky-300">V-dict</code> (từ điển), <code className="text-sky-300">V-nai</code> (phủ định ngắn), và <code className="text-sky-300">V-ta</code> (quá khứ ngắn). Với danh từ hoặc tính từ đuôi な, hãy chú ý xem có giữ lại đuôi <code className="text-amber-300">な</code> hay chuyển thành <code className="text-amber-300">の/である</code> tùy theo từng cấu trúc!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
