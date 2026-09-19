import React from 'react';
import { ChevronRight } from 'lucide-react';

interface GrammarAbbreviationsBarProps {
  onOpenConjugationSheet: () => void;
}

const ABBREVIATIONS = [
  { code: 'N', label: 'Danh từ (名詞)', color: 'bg-blue-950/70 border-blue-500/50 text-blue-300', codeBg: 'bg-blue-600 text-white' },
  { code: 'V', label: 'Động từ (動詞)', color: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300', codeBg: 'bg-emerald-600 text-white' },
  { code: 'A', label: 'Tính từ (形容詞)', color: 'bg-amber-950/70 border-amber-500/50 text-amber-300', codeBg: 'bg-amber-600 text-white' },
  { code: 'Aい', label: 'Tính từ đuôi い', color: 'bg-amber-950/70 border-amber-600/50 text-amber-300', codeBg: 'bg-amber-700 text-white' },
  { code: 'Aな', label: 'Tính từ đuôi な', color: 'bg-orange-950/70 border-orange-600/50 text-orange-300', codeBg: 'bg-orange-700 text-white' },
  { code: 'S', label: 'Câu (文)', color: 'bg-purple-950/70 border-purple-500/50 text-purple-300', codeBg: 'bg-purple-600 text-white' },
  { code: 'TTT', label: 'Thể thông thường (普通形)', color: 'bg-teal-950/70 border-teal-500/50 text-teal-300', codeBg: 'bg-teal-600 text-white' }
];

export const GrammarAbbreviationsBar: React.FC<GrammarAbbreviationsBarProps> = ({ onOpenConjugationSheet }) => {
  return (
    <div className="w-full mb-6">
      {/* Title */}
      <h3 className="text-xs sm:text-sm font-medium text-slate-400 mb-2.5">
        Ký hiệu viết tắt trong cấu trúc ngữ pháp
      </h3>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {ABBREVIATIONS.map((item, idx) => (
          <div
            key={idx}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${item.color} shadow-sm`}
          >
            <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${item.codeBg}`}>
              {item.code}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Conjugation Cheat Sheet Banner Card */}
      <button
        type="button"
        onClick={onOpenConjugationSheet}
        className="w-full text-left p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-950/20 to-transparent border border-amber-600/40 hover:border-amber-500 transition-all cursor-pointer group flex items-center justify-between shadow-sm"
      >
        <div>
          <div className="text-sm sm:text-base font-semibold text-amber-300 group-hover:text-amber-200 transition-colors">
            Bảng chia thể động từ · tính từ
          </div>
          <div className="text-xs text-amber-400/80 mt-0.5">
            Thể thông thường, thể て, thể ない, khả năng, bị động, sai khiến...
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 transition-all shrink-0 ml-3">
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    </div>
  );
};

export default GrammarAbbreviationsBar;
