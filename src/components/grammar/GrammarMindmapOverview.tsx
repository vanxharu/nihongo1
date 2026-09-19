import React, { useState } from 'react';
import { JLPTLevel, UserProfile } from '../../types';
import JlptMascot from './JlptMascot';
import SentenceAnalyzerBar from './SentenceAnalyzerBar';
import GrammarAbbreviationsBar from './GrammarAbbreviationsBar';
import ConjugationCheatSheet from '../ConjugationCheatSheet';

interface GrammarMindmapOverviewProps {
  userProfile: UserProfile;
  totalGrammarsCount: number;
  completedGrammarsCount: number;
  levelStats: Record<string, { lessons: number; grammars: number; completed: number }>;
  onSelectLevel: (level: JLPTLevel) => void;
}

export const GrammarMindmapOverview: React.FC<GrammarMindmapOverviewProps> = ({
  userProfile,
  totalGrammarsCount,
  completedGrammarsCount,
  levelStats,
  onSelectLevel
}) => {
  const [showConjugationSheet, setShowConjugationSheet] = useState(false);

  // Overall progress percentage
  const total = totalGrammarsCount || 548;
  const completed = completedGrammarsCount || 0;
  const progressPercent = Math.min(100, Math.round((completed / total) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 animate-fadeIn font-sans text-slate-100">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-extrabold shadow-sm">
              JLPT Mindmap
            </span>
            <span>– Càng học càng cuốn</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Không chỉ để thi mà còn để <strong className="text-amber-300 font-semibold">dùng thực tế</strong>, hiểu bản chất trong từng ngữ cảnh.
            <br className="hidden sm:inline" />
            Vẫn là các giáo trình quen thuộc nhưng được mở rộng theo mindmap trong từng mẫu ngữ pháp.
          </p>
        </div>

        {/* Mascot */}
        <div className="shrink-0 pt-1">
          <JlptMascot size={78} showText={true} />
        </div>
      </div>

      {/* 1. Sentence Analyzer Bar */}
      <SentenceAnalyzerBar />

      {/* 2. Grammar Abbreviations Bar & Conjugation sheet button */}
      <GrammarAbbreviationsBar onOpenConjugationSheet={() => setShowConjugationSheet(true)} />

      {/* 3. Overall Progress Bar */}
      <div className="w-full bg-[#161b22] border border-[#30363d] rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-2">
          <span className="text-slate-300">Tiến độ tổng</span>
          <span className="text-slate-400 font-mono">
            <strong className="text-blue-400">{completed}</strong>/{total} mẫu · {progressPercent}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4. Section: Giáo trình quốc dân (Sơ cấp I • II) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Giáo trình quốc dân
          </h2>
          <span className="text-xs text-slate-400">Sơ cấp I • II</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card N5 */}
          <div
            onClick={() => onSelectLevel('N5')}
            className="group relative bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-emerald-500/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between"
          >
            <div className="p-6 text-center">
              <div className="text-xs sm:text-sm font-medium text-slate-400 mb-2">
                Giáo trình quốc dân Sơ cấp I
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-wider group-hover:scale-105 transition-transform duration-200">
                N5
              </div>
            </div>

            <div className="bg-emerald-600/90 group-hover:bg-emerald-500 py-3 px-4 text-center text-white transition-colors">
              <div className="text-xs sm:text-sm font-bold">25 bài học</div>
              <div className="text-[11px] text-emerald-100 opacity-90">
                {levelStats['N5']?.grammars || 120} mẫu ngữ pháp · Sơ cấp 1
              </div>
            </div>
          </div>

          {/* Card N4 */}
          <div
            onClick={() => onSelectLevel('N4')}
            className="group relative bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-emerald-500/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between"
          >
            <div className="p-6 text-center">
              <div className="text-xs sm:text-sm font-medium text-slate-400 mb-2">
                Giáo trình quốc dân Sơ cấp II
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-wider group-hover:scale-105 transition-transform duration-200">
                N4
              </div>
            </div>

            <div className="bg-emerald-600/90 group-hover:bg-emerald-500 py-3 px-4 text-center text-white transition-colors">
              <div className="text-xs sm:text-sm font-bold">25 bài học</div>
              <div className="text-[11px] text-emerald-100 opacity-90">
                {levelStats['N4']?.grammars || 90} mẫu ngữ pháp · Sơ cấp 2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Section: Ngữ pháp chuyên sâu (N3 • N2 • N1) */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Ngữ pháp chuyên sâu
          </h2>
          <span className="text-xs text-slate-400">N3 • N2 • N1</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card N3 */}
          <div
            onClick={() => onSelectLevel('N3')}
            className="group relative bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-blue-500/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between"
          >
            <div className="p-5 text-center">
              <div className="text-xs font-medium text-slate-400 mb-1.5">
                Ngữ pháp chuyên sâu N3
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-wider group-hover:scale-105 transition-transform duration-200">
                N3
              </div>
            </div>
            <div className="bg-emerald-700/80 group-hover:bg-emerald-600 py-2.5 px-3 text-center text-white transition-colors">
              <div className="text-xs font-bold">Trung cấp 1</div>
              <div className="text-[10px] text-emerald-100 opacity-90">
                {levelStats['N3']?.grammars || 110} mẫu ngữ pháp
              </div>
            </div>
          </div>

          {/* Card N2 */}
          <div
            onClick={() => onSelectLevel('N2')}
            className="group relative bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-blue-500/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between"
          >
            <div className="p-5 text-center">
              <div className="text-xs font-medium text-slate-400 mb-1.5">
                Ngữ pháp chuyên sâu N2
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-wider group-hover:scale-105 transition-transform duration-200">
                N2
              </div>
            </div>
            <div className="bg-emerald-700/80 group-hover:bg-emerald-600 py-2.5 px-3 text-center text-white transition-colors">
              <div className="text-xs font-bold">Trung cấp 2</div>
              <div className="text-[10px] text-emerald-100 opacity-90">
                {levelStats['N2']?.grammars || 140} mẫu ngữ pháp
              </div>
            </div>
          </div>

          {/* Card N1 */}
          <div
            onClick={() => onSelectLevel('N1')}
            className="group relative bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-blue-500/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between"
          >
            <div className="p-5 text-center">
              <div className="text-xs font-medium text-slate-400 mb-1.5">
                Ngữ pháp chuyên sâu N1
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-wider group-hover:scale-105 transition-transform duration-200">
                N1
              </div>
            </div>
            <div className="bg-emerald-700/80 group-hover:bg-emerald-600 py-2.5 px-3 text-center text-white transition-colors">
              <div className="text-xs font-bold">Thượng cấp</div>
              <div className="text-[10px] text-emerald-100 opacity-90">
                {levelStats['N1']?.grammars || 160} mẫu ngữ pháp
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conjugation Modal */}
      <ConjugationCheatSheet
        isOpen={showConjugationSheet}
        onClose={() => setShowConjugationSheet(false)}
      />
    </div>
  );
};

export default GrammarMindmapOverview;
