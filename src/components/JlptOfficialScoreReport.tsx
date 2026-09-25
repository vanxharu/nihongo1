/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { 
  Printer, 
  RotateCcw, 
  FileText, 
  Share2, 
  CheckCircle2, 
  XCircle, 
  Download,
  Award,
  TrendingUp,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Target
} from 'lucide-react';
import { DailyExam, UserProfile } from '../types';
import ShibaMascot from './mascot/ShibaMascot';

interface JlptOfficialScoreReportProps {
  exam: DailyExam;
  userAnswers: Record<string, number>;
  userProfile?: UserProfile;
  selectedSectionMode: 'ALL' | 'moji-goi' | 'bunpou' | 'dokkai' | 'choukai';
  onRetry: () => void;
  onBackToLobby: () => void;
  onSwitchSection?: (section: 'ALL' | 'moji-goi' | 'bunpou' | 'dokkai' | 'choukai') => void;
}

export function JlptOfficialScoreReport({
  exam,
  userAnswers,
  userProfile,
  selectedSectionMode,
  onRetry,
  onBackToLobby,
  onSwitchSection
}: JlptOfficialScoreReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // Group questions by section
  const mojiGoiQuestions = exam.questions.filter(q => q.section === 'moji-goi');
  const bunpouQuestions = exam.questions.filter(q => q.section === 'bunpou');
  const dokkaiQuestions = exam.questions.filter(q => q.section === 'dokkai');
  const choukaiQuestions = exam.questions.filter(q => q.section === 'choukai');

  // Count correct answers
  const mojiGoiCorrect = mojiGoiQuestions.filter(q => userAnswers[q.id] === q.correctIndex).length;
  const bunpouCorrect = bunpouQuestions.filter(q => userAnswers[q.id] === q.correctIndex).length;
  const dokkaiCorrect = dokkaiQuestions.filter(q => userAnswers[q.id] === q.correctIndex).length;
  const choukaiCorrect = choukaiQuestions.filter(q => userAnswers[q.id] === q.correctIndex).length;

  // Grade helper (A >= 67%, B 34-66%, C < 34%)
  const calcGrade = (correct: number, total: number): 'A' | 'B' | 'C' => {
    if (total === 0) return 'A';
    const pct = correct / total;
    if (pct >= 0.67) return 'A';
    if (pct >= 0.34) return 'B';
    return 'C';
  };

  const vocabGrade = calcGrade(mojiGoiCorrect, mojiGoiQuestions.length);
  const grammarGrade = calcGrade(bunpouCorrect, bunpouQuestions.length);

  // Standard JLPT Scoring Logic
  // Total 180 points
  const isHighLevel = ['N1', 'N2', 'N3'].includes(exam.level);

  // Scaled scores out of 60 for each component
  const mojiGoiScale = mojiGoiQuestions.length > 0 ? Math.round((mojiGoiCorrect / mojiGoiQuestions.length) * 30) : 30;
  const bunpouScale = bunpouQuestions.length > 0 ? Math.round((bunpouCorrect / bunpouQuestions.length) * 30) : 30;
  const langKnowledgeScore = mojiGoiScale + bunpouScale; // 60 pts
  
  const dokkaiScore = dokkaiQuestions.length > 0 ? Math.round((dokkaiCorrect / dokkaiQuestions.length) * 60) : 60;
  const choukaiScore = choukaiQuestions.length > 0 ? Math.round((choukaiCorrect / choukaiQuestions.length) * 60) : 60;

  const totalScore = langKnowledgeScore + dokkaiScore + choukaiScore; // Max 180

  // JLPT Passing thresholds
  const LEVEL_PASS_MARKS: Record<string, { total: number; sectionMin: number; langAndReadingMin?: number }> = {
    N1: { total: 100, sectionMin: 19 },
    N2: { total: 90, sectionMin: 19 },
    N3: { total: 95, sectionMin: 19 },
    N4: { total: 90, sectionMin: 19, langAndReadingMin: 38 },
    N5: { total: 80, sectionMin: 19, langAndReadingMin: 38 },
  };

  const thresholds = LEVEL_PASS_MARKS[exam.level] || { total: 90, sectionMin: 19, langAndReadingMin: 38 };

  // Check section pass
  const isLangPassed = langKnowledgeScore >= thresholds.sectionMin;
  const isDokkaiPassed = dokkaiScore >= thresholds.sectionMin;
  const isChoukaiPassed = choukaiScore >= thresholds.sectionMin;
  const isLangAndReadingPassed = !isHighLevel ? (langKnowledgeScore + dokkaiScore >= (thresholds.langAndReadingMin || 38)) : true;

  const isAllSectionsPassed = isHighLevel 
    ? (isLangPassed && isDokkaiPassed && isChoukaiPassed)
    : (isLangAndReadingPassed && isChoukaiPassed);

  const isTotalScorePassed = totalScore >= thresholds.total;
  const isOverallPassed = isTotalScorePassed && isAllSectionsPassed;

  // Single section mode handling
  const isSingleSection = selectedSectionMode !== 'ALL';
  const singleSectionQuestions = exam.questions.filter(q => q.section === selectedSectionMode);
  const singleSectionCorrect = singleSectionQuestions.filter(q => userAnswers[q.id] === q.correctIndex).length;
  const singleSectionScaled = Math.round((singleSectionCorrect / (singleSectionQuestions.length || 1)) * 60);

  // Formatted Registration Number: e.g. "25A2080201-31471"
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const jlptMonthName = currentMonth <= 7 ? 'July' : 'December';
  const jlptMonthJa = currentMonth <= 7 ? '7' : '12';
  const yearShort = (currentYear % 100).toString();
  const registrationNo = `${yearShort}A${exam.level === 'N1' ? '10' : exam.level === 'N2' ? '20' : exam.level === 'N3' ? '30' : exam.level === 'N4' ? '40' : '50'}80201-31471`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      
      {/* Top Action Controls (Hidden when printing) */}
      <div className="flex items-center justify-between flex-wrap gap-2 print:hidden bg-slate-900 text-white p-3 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-bold text-xs sm:text-sm">
            Kết quả thi JLPT chuẩn chính thức (試験結果発表)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            In / Tải PDF
          </button>
          <button
            onClick={onRetry}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm lại đề
          </button>
          <button
            onClick={onBackToLobby}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Về danh sách
          </button>
        </div>
      </div>

      {/* ================= MASCOT POST-EXAM CELEBRATION & COACHING ================= */}
      <div className="print:hidden bg-white rounded-2xl border border-[#EADFCF] p-4 sm:p-6 shadow-sm space-y-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="shrink-0 flex flex-col items-center">
            <ShibaMascot
              pose={isOverallPassed ? 'celebrating' : 'encourage'}
              size="lg"
              animated={true}
              speechBubble={
                isOverallPassed
                  ? `おめでとう！Chúc mừng bạn đã đỗ JLPT ${exam.level}!`
                  : `Cố lên bạn ơi! Bạn đạt ${totalScore}/180 điểm.`
              }
              speechSub={
                isOverallPassed
                  ? `Bạn đạt ${totalScore}/180 điểm xuất sắc!`
                  : `Cùng Nihon Shiba khắc phục điểm yếu nhé!`
              }
            />
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#786D5E]">
                  Tổng quan kết quả luyện thi
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[#1F2639]">
                  {isOverallPassed ? '🎉 ĐẠT CHUẨN JLPT (合格)' : '💪 CHƯA ĐẠT (不合格) - CẦN ÔN THÊM'}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#F4A643]">
                  {totalScore}
                </span>
                <span className="text-xs font-bold text-[#786D5E]"> / 180 điểm</span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[#786D5E]">Điểm chuẩn đỗ: {thresholds.total} điểm</span>
                <span className={totalScore >= thresholds.total ? 'text-[#10B981]' : 'text-[#D82B3A]'}>
                  {totalScore >= thresholds.total ? `Vượt chuẩn +${totalScore - thresholds.total} điểm` : `Thiếu ${thresholds.total - totalScore} điểm`}
                </span>
              </div>
              <div className="w-full bg-[#EADFCF] h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOverallPassed ? 'bg-gradient-to-r from-[#10B981] to-[#059669]' : 'bg-gradient-to-r from-[#F4A643] to-[#D82B3A]'}`}
                  style={{ width: `${Math.min(100, Math.round((totalScore / 180) * 100))}%` }}
                />
              </div>
            </div>

            {/* Strengths & Weaknesses Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#EADFCF]">
                <div className="text-[10px] text-[#786D5E] font-semibold">Kiến thức ngôn ngữ</div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="font-mono font-bold text-sm text-[#1F2639]">{langKnowledgeScore}/60</span>
                  <span className={`text-[10px] font-bold ${langKnowledgeScore >= 19 ? 'text-[#10B981]' : 'text-[#D82B3A]'}`}>
                    {langKnowledgeScore >= 19 ? 'Đạt chuẩn' : 'Liệt'}
                  </span>
                </div>
              </div>

              <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#EADFCF]">
                <div className="text-[10px] text-[#786D5E] font-semibold">Đọc hiểu (読解)</div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="font-mono font-bold text-sm text-[#1F2639]">{dokkaiScore}/60</span>
                  <span className={`text-[10px] font-bold ${dokkaiScore >= 19 ? 'text-[#10B981]' : 'text-[#D82B3A]'}`}>
                    {dokkaiScore >= 19 ? 'Đạt chuẩn' : 'Liệt'}
                  </span>
                </div>
              </div>

              <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#EADFCF]">
                <div className="text-[10px] text-[#786D5E] font-semibold">Nghe hiểu (聴解)</div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="font-mono font-bold text-sm text-[#1F2639]">{choukaiScore}/60</span>
                  <span className={`text-[10px] font-bold ${choukaiScore >= 19 ? 'text-[#10B981]' : 'text-[#D82B3A]'}`}>
                    {choukaiScore >= 19 ? 'Đạt chuẩn' : 'Liệt'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* --- OFFICIAL JLPT ONLINE SCORE RESULTS (日本語能力試験 試験結果発表) --- */}
      {/* ========================================================================= */}
      <div 
        ref={reportRef}
        className="bg-white border border-stone-200 sm:border-stone-300 shadow-md p-4 sm:p-8 md:p-10 text-black font-sans print:p-0 print:border-none print:shadow-none print:m-0"
        style={{ color: '#000000' }}
      >
        
        {/* 1. Header with JLPT Logo */}
        <div className="pb-2 border-b border-black">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-black tracking-tight leading-none mb-1">
                日本語能力試験
              </h1>
              <div className="flex items-center gap-1 text-black font-sans">
                <span className="text-xl sm:text-2xl font-black tracking-tighter leading-none">JLPT</span>
                <div className="text-[7px] sm:text-[8px] leading-tight font-medium border-l border-black pl-1.5 ml-1 text-stone-800">
                  <div>Japanese-Language</div>
                  <div>Proficiency</div>
                  <div>Test</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Orange Title Banner Box */}
        <div className="mt-4 sm:mt-5 bg-[#ff4b00] rounded-xs text-white text-center py-2.5 px-3 border border-[#7e22ce]/30 shadow-xs">
          <div className="text-[10px] sm:text-[11px] tracking-widest text-white/90 font-light mb-0.5">
            ねん&nbsp;&nbsp;がつ&nbsp;&nbsp;に&nbsp;ほん&nbsp;ご&nbsp;の&nbsp;うりょく&nbsp;し&nbsp;けん&nbsp;&nbsp;し&nbsp;けん&nbsp;けっか&nbsp;はっぴょう
          </div>
          <div className="text-base sm:text-xl md:text-2xl font-bold font-serif tracking-wide text-white">
            {currentYear}年{jlptMonthJa}月 日本語能力試験 試験結果発表
          </div>
          <div className="text-[11px] sm:text-sm font-semibold tracking-normal text-white mt-0.5 font-sans">
            Japanese-Language Proficiency Test Results, {jlptMonthName} {currentYear}
          </div>
        </div>

        {/* 3. Red Notice Section */}
        <div className="text-center text-[#e11d48] sm:text-[#dc2626] text-[11px] sm:text-xs my-4 sm:my-5 leading-relaxed">
          <div className="font-medium">
            <span className="inline-block">※</span>{' '}
            <ruby>正式<rt className="text-[8px]">せいしき</rt></ruby>な
            <ruby>結果通知<rt className="text-[8px]">けっかつうち</rt></ruby>はあなたの
            <ruby>受験地<rt className="text-[8px]">じゅけんち</rt></ruby>の
            <ruby>実施機関<rt className="text-[8px]">じっしきかん</rt></ruby>を
            <ruby>通<rt className="text-[8px]">つう</rt></ruby>じて
            <ruby>交付<rt className="text-[8px]">こうふ</rt></ruby>されます。
          </div>
          <div className="text-[10px] sm:text-[11px] mt-0.5">
            ※ Formal score reports will be issued through local host institutions.
          </div>
        </div>

        {/* 4. Main Table Form (5 Exact JLPT Online Results Rows) */}
        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
          
          {/* Row 1: Level (レベル / Level) */}
          <div className="grid grid-cols-12 items-center gap-2 sm:gap-4">
            <div className="col-span-4 sm:col-span-3 text-stone-900 leading-tight">
              <div className="text-xs sm:text-sm">レベル</div>
              <div className="text-[11px] sm:text-xs">Level</div>
            </div>
            <div className="col-span-8 sm:col-span-9 border-2 border-black bg-white py-2 sm:py-2.5 px-4 text-center font-bold text-base sm:text-lg">
              {exam.level}
            </div>
          </div>

          {/* Row 2: Registration No. (受験番号 / Registration No.) */}
          <div className="grid grid-cols-12 items-center gap-2 sm:gap-4">
            <div className="col-span-4 sm:col-span-3 text-stone-900 leading-tight">
              <div className="text-[10px] text-stone-600 leading-none">じゅけんばんごう</div>
              <div className="text-xs sm:text-sm font-medium">受験番号</div>
              <div className="text-[11px] sm:text-xs">Registration No.</div>
            </div>
            <div className="col-span-8 sm:col-span-9 border-2 border-black bg-white py-2 sm:py-2.5 px-4 text-center font-mono font-bold text-sm sm:text-base tracking-wider">
              {registrationNo}
            </div>
          </div>

          {/* Row 3: Result (試験結果 / Result) */}
          <div className="grid grid-cols-12 items-center gap-2 sm:gap-4">
            <div className="col-span-4 sm:col-span-3 text-stone-900 leading-tight">
              <div className="text-[10px] text-stone-600 leading-none">しけんけっか</div>
              <div className="text-xs sm:text-sm font-medium">試験結果</div>
              <div className="text-[11px] sm:text-xs">Result</div>
            </div>
            <div className="col-span-8 sm:col-span-9 border-2 border-black bg-white py-1.5 sm:py-2 px-4 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] text-stone-700 leading-tight font-medium">
                {isOverallPassed ? 'ごうかく' : 'ふごうかく'}
              </span>
              <span className="text-base sm:text-lg md:text-xl font-serif font-bold tracking-widest leading-snug">
                {isOverallPassed ? '合 格' : '不合格'}
              </span>
              <span className="text-xs font-semibold leading-tight text-stone-800">
                {isOverallPassed ? 'Passed' : 'Failed'}
              </span>
            </div>
          </div>

          {/* Row 4: Scores (得点 / Scores) */}
          <div className="grid grid-cols-12 items-start gap-2 sm:gap-4 pt-1">
            <div className="col-span-4 sm:col-span-3 text-stone-900 leading-tight pt-2">
              <div className="text-[10px] text-stone-600 leading-none">とくてん</div>
              <div className="text-xs sm:text-sm font-medium">得点</div>
              <div className="text-[11px] sm:text-xs">Scores</div>
            </div>

            {/* Score Grid with exact 2px black border */}
            <div className="col-span-8 sm:col-span-9 border-2 border-black bg-white">
              <table className="w-full text-center border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="w-7/12 py-1.5 sm:py-2 px-2 border-r border-black font-normal text-stone-900">
                      <div className="text-[9px] text-stone-600 leading-none">とくてんくぶんべつとくてん</div>
                      <div className="text-xs sm:text-sm font-bold font-serif text-black">得点区分別得点</div>
                      <div className="text-[10px] sm:text-xs text-stone-800">Scores by Scoring Section</div>
                    </th>
                    <th className="w-5/12 py-1.5 sm:py-2 px-2 font-normal text-stone-900">
                      <div className="text-[9px] text-stone-600 leading-none">そうごうとくてん</div>
                      <div className="text-xs sm:text-sm font-bold font-serif text-black">総合得点</div>
                      <div className="text-[10px] sm:text-xs text-stone-800">Total Score</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: Language Knowledge */}
                  <tr className="border-b border-black">
                    <td className="p-0 border-r border-black">
                      <div className="flex items-center justify-between px-2 sm:px-3 py-1.5">
                        <div className="text-left leading-tight">
                          <div className="text-[8px] text-stone-500 leading-none">
                            げんごちしき（もじ・ごい・ぶんぽう）
                          </div>
                          <div className="text-xs sm:text-[13px] font-bold text-black font-serif">
                            言語知識（文字・語彙・文法）
                          </div>
                          <div className="text-[10px] text-stone-700">
                            Language Knowledge (Vocabulary / Grammar)
                          </div>
                        </div>
                        <div className="font-mono font-medium text-xs sm:text-sm whitespace-nowrap pl-2">
                          {langKnowledgeScore} / 60
                        </div>
                      </div>
                    </td>
                    <td rowSpan={3} className="p-2 align-middle text-center bg-white">
                      <div className="font-mono font-bold text-base sm:text-xl text-black">
                        {totalScore} / 180
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: Reading */}
                  <tr className="border-b border-black">
                    <td className="p-0 border-r border-black">
                      <div className="flex items-center justify-between px-2 sm:px-3 py-1.5">
                        <div className="text-left leading-tight">
                          <div className="text-[8px] text-stone-500 leading-none">どっかい</div>
                          <div className="text-xs sm:text-[13px] font-bold text-black font-serif">
                            読解 <span className="font-normal font-sans text-[11px] text-stone-700">Reading</span>
                          </div>
                        </div>
                        <div className="font-mono font-medium text-xs sm:text-sm whitespace-nowrap pl-2">
                          {dokkaiScore} / 60
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3: Listening */}
                  <tr>
                    <td className="p-0 border-r border-black">
                      <div className="flex items-center justify-between px-2 sm:px-3 py-1.5">
                        <div className="text-left leading-tight">
                          <div className="text-[8px] text-stone-500 leading-none">ちょうかい</div>
                          <div className="text-xs sm:text-[13px] font-bold text-black font-serif">
                            聴解 <span className="font-normal font-sans text-[11px] text-stone-700">Listening</span>
                          </div>
                        </div>
                        <div className="font-mono font-medium text-xs sm:text-sm whitespace-nowrap pl-2">
                          {choukaiScore} / 60
                        </div>
                      </div>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* Row 5: Reference Information (参考情報 / Reference Information) */}
          <div className="grid grid-cols-12 items-start gap-2 sm:gap-4 pt-1">
            <div className="col-span-4 sm:col-span-3 text-stone-900 leading-tight pt-2">
              <div className="text-[10px] text-stone-600 leading-none">さんこうじょうほう</div>
              <div className="text-xs sm:text-sm font-medium">参考情報</div>
              <div className="text-[11px] sm:text-xs">Reference Information</div>
            </div>

            {/* Reference Table with 2px black border */}
            <div className="col-span-8 sm:col-span-9 border-2 border-black bg-white">
              <table className="w-full text-center border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-black">
                    <th className="w-1/2 py-1.5 px-2 border-r border-black font-normal text-stone-900">
                      <div className="text-[9px] text-stone-600 leading-none">もじ・ごい</div>
                      <div className="text-xs sm:text-sm font-bold font-serif text-black">文字・語彙</div>
                      <div className="text-[10px] sm:text-xs text-stone-800">Vocabulary</div>
                    </th>
                    <th className="w-1/2 py-1.5 px-2 font-normal text-stone-900">
                      <div className="text-[9px] text-stone-600 leading-none">ぶんぽう</div>
                      <div className="text-xs sm:text-sm font-bold font-serif text-black">文法</div>
                      <div className="text-[10px] sm:text-xs text-stone-800">Grammar</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-2 border-r border-black font-serif font-bold text-base sm:text-lg">
                      {vocabGrade}
                    </td>
                    <td className="py-2 px-2 font-serif font-bold text-base sm:text-lg">
                      {grammarGrade}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* 5. Footer URL & Print Timestamp Simulation */}
        <div className="mt-12 pt-3 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500 font-mono">
          <div className="truncate max-w-[70%]">
            https://www.jlpt-overseas.jp/onlineresults/search.do?id1=2...ssword=01122003&image_bottun.x=94&image_bottun.y=43
          </div>
          <div>
            {now.getHours()}:{now.getMinutes().toString().padStart(2, '0')} {now.getDate()}/{now.getMonth() + 1}/{yearShort} &nbsp; Trang 1/1
          </div>
        </div>

      </div>

      {/* Switch / Next practice section toolbar (Hidden when printing) */}
      {onSwitchSection && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs print:hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Luyện tiếp các kỹ năng khác của đề thi này:
            </span>
            <button
              onClick={() => onSwitchSection('ALL')}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Thi toàn bộ đề →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
            {(['moji-goi', 'bunpou', 'dokkai', 'choukai'] as const).map(sec => {
              const meta = {
                'moji-goi': { name: 'Từ vựng & Hán tự', icon: '🔤' },
                'bunpou': { name: 'Ngữ pháp', icon: '📖' },
                'dokkai': { name: 'Đọc hiểu', icon: '📑' },
                'choukai': { name: 'Nghe hiểu', icon: '🎧' },
              }[sec];
              const qCount = exam.questions.filter(q => q.section === sec).length;
              if (qCount === 0) return null;

              return (
                <button
                  key={sec}
                  onClick={() => onSwitchSection(sec)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-800 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{meta.icon}</span>
                    <span>{meta.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{qCount} câu</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
