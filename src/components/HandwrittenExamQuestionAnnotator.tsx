import React, { useState, useEffect } from 'react';
import { ExamQuestion } from '../types';
import { annotateSentence, DirectSentenceAnnotationResult, PassageRubyChunk } from '../utils/japaneseSentenceAnnotator';
import { BookOpen, CheckCircle2, HelpCircle, XCircle, Volume2 } from 'lucide-react';
import { getChoukaiDetail } from '../data/choukaiExplanations';

interface HandwrittenExamQuestionAnnotatorProps {
  question: ExamQuestion;
  questionNumber?: number;
  index?: number;
  userAnswer?: number;
  isSubmitted: boolean;
  onSelectOption?: (index: number) => void;
  disabled?: boolean;
  isDokkai?: boolean;
  hidePassage?: boolean;
  isDark?: boolean;
}

export const HandwrittenExamQuestionAnnotator: React.FC<HandwrittenExamQuestionAnnotatorProps> = ({
  question,
  questionNumber,
  index,
  userAnswer,
  isSubmitted,
  onSelectOption,
  disabled = false,
  hidePassage = false,
  isDark
}) => {
  const [showPassageTranslation, setShowPassageTranslation] = useState(false);
  const [systemDark, setSystemDark] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = isDark !== undefined ? isDark : systemDark;

  const qNum = questionNumber ?? (index !== undefined ? index + 1 : 1);
  const choukaiDetail = getChoukaiDetail(question.id);

  const annotationResult: DirectSentenceAnnotationResult = React.useMemo(() => {
    return annotateSentence(question.question, question, userAnswer);
  }, [question, userAnswer]);

  const isUserCorrect = isSubmitted && userAnswer === question.correctIndex;
  const isUserWrong = isSubmitted && userAnswer !== undefined && userAnswer !== question.correctIndex;
  const isUnanswered = isSubmitted && userAnswer === undefined;

  const dokkai = annotationResult.dokkaiData;
  const isDokkai = Boolean(dokkai?.isDokkai && dokkai?.passageBody);

  return (
    <div className={`relative w-full py-4 border-b ${isDarkMode ? 'border-slate-700/60' : 'border-stone-300/80'} last:border-b-0`}>
      {/* Question Header & Status Stamp */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className={`font-jlpt-exam font-bold text-lg sm:text-xl px-2.5 py-0.5 rounded shadow-2xs ${
            isDarkMode 
              ? 'bg-amber-950/80 text-amber-300 border border-amber-600/60' 
              : 'bg-amber-100 text-amber-950 border border-amber-400'
          }`}>
            問 {qNum}
          </span>
          {question.section && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
              isDarkMode 
                ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                : 'bg-stone-100 text-slate-800 border border-stone-300'
            }`}>
              {isSubmitted ? (
                question.section === 'moji-goi' ? 'Từ vựng - Chữ Hán' : question.section === 'bunpou' ? 'Ngữ pháp' : question.section === 'dokkai' ? 'Đọc hiểu' : 'Nghe hiểu'
              ) : (
                question.section === 'moji-goi' ? '文字・語彙' : question.section === 'bunpou' ? '文法' : question.section === 'dokkai' ? '読解' : '聴解'
              )}
            </span>
          )}
        </div>

        {/* Teacher's Mark Stamp (Con dấu chấm điểm) */}
        {isSubmitted && (
          <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
            {isUserCorrect && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs font-red-pen text-sm ${
                isDarkMode 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80' 
                  : 'bg-emerald-100 text-emerald-900 border-emerald-400'
              }`}>
                <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`} />
                ⭕ 正解 (Chính xác +1)
              </span>
            )}
            {isUserWrong && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs font-red-pen text-sm ${
                isDarkMode 
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/80' 
                  : 'bg-rose-100 text-rose-900 border-rose-400'
              }`}>
                <XCircle className={`w-4 h-4 ${isDarkMode ? 'text-rose-400' : 'text-rose-700'}`} />
                ❌ 不正解 (Chưa đúng)
              </span>
            )}
            {isUnanswered && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border font-red-pen text-sm ${
                isDarkMode 
                  ? 'bg-slate-800 text-slate-300 border-slate-700' 
                  : 'bg-stone-100 text-slate-800 border border-stone-300'
              }`}>
                <HelpCircle className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                ⚠️ 未解答 (Chưa làm)
              </span>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. DOKKAI PASSAGE CARD (NẾU LÀ BÀI ĐỌC HIỂU) */}
      {/* ========================================================================= */}
      {!hidePassage && isDokkai && dokkai && (
        <div className={`mb-5 border-2 rounded-xl p-4 sm:p-5 shadow-2xs ${
          isDarkMode 
            ? 'bg-[#18202c] border-slate-700 text-slate-100' 
            : 'bg-white border-stone-300 text-slate-950'
        }`}>
          {/* Passage Title Tag */}
          {dokkai.passageTitle && (
            <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${
              isDarkMode ? 'border-slate-700 text-amber-300' : 'border-stone-200 text-amber-950'
            }`}>
              <BookOpen className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`} />
              <span className="font-bold text-sm sm:text-base font-jlpt-exam">
                {dokkai.passageTitle}
              </span>
            </div>
          )}

          {/* Reading Passage Body with Ruby Furigana */}
          <div className={`font-jlpt-exam text-[17px] sm:text-[18px] leading-[2.4] sm:leading-[2.6] tracking-wide select-text ${
            isDarkMode ? 'text-slate-100' : 'text-slate-950'
          }`}>
            {dokkai.passageChunks && dokkai.passageChunks.length > 0 ? (
              dokkai.passageChunks.map((chunk, cIdx) => {
                if (chunk.furigana && chunk.isKanji) {
                  return (
                    <ruby key={`dok-chunk-${cIdx}`} className="mx-0.5 inline-block">
                      <span className="font-semibold">{chunk.text}</span>
                      <rt className={`font-bold font-red-pen text-xs select-none block text-center -translate-y-0.5 ${
                        isDarkMode ? 'text-sky-400' : 'text-sky-800'
                      }`}>
                        {chunk.furigana}
                      </rt>
                    </ruby>
                  );
                }
                return (
                  <span key={`dok-chunk-${cIdx}`} className="font-normal">
                    {chunk.text}
                  </span>
                );
              })
            ) : (
              <p className="whitespace-pre-line">{dokkai.passageBody}</p>
            )}
          </div>

          {/* Toggle Passage Translation (Xanh dương) */}
          {isSubmitted && (
            <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-stone-200'}`}>
              <button
                type="button"
                onClick={() => setShowPassageTranslation(!showPassageTranslation)}
                className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDarkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-800 hover:text-sky-950'
                }`}
              >
                <span>{showPassageTranslation ? '▲ Thu gọn bản dịch đoạn văn' : '▼ 🔍 Xem bản dịch toàn bài đọc (Tiếng Việt)'}</span>
              </button>
              {showPassageTranslation && (
                <div className={`mt-3 p-4 rounded-xl border text-sm sm:text-base leading-relaxed animate-in fade-in space-y-3 font-sans shadow-2xs ${
                  isDarkMode 
                    ? 'bg-[#111923] border-sky-800/80 text-slate-200' 
                    : 'bg-sky-50 border-sky-200 text-slate-900'
                }`}>
                  <div className={`flex items-center gap-2 font-bold text-sm border-b pb-2 ${
                    isDarkMode ? 'text-sky-400 border-sky-900/60' : 'text-sky-900 border-sky-200'
                  }`}>
                    <span>📖 Bản dịch chi tiết đoạn văn:</span>
                  </div>
                  
                  {/* Full passage Vietnamese translation */}
                  <div className="leading-relaxed font-sans text-sm sm:text-base whitespace-pre-line">
                    {dokkai.passageTranslation || question.explanation || 'Đoạn văn rèn luyện kỹ năng đọc hiểu và nắm bắt ý chính trong kỳ thi JLPT.'}
                  </div>

                  {/* Sentence-by-sentence breakdown if available */}
                  {dokkai.sentenceBreakdown && dokkai.sentenceBreakdown.length > 0 && (
                    <div className={`mt-3 pt-3 border-t space-y-2 ${isDarkMode ? 'border-sky-900/60' : 'border-sky-200'}`}>
                      <div className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-sky-400' : 'text-sky-900'}`}>
                        Phân tích chi tiết từng câu trong bài đọc:
                      </div>
                      <div className="space-y-2">
                        {dokkai.sentenceBreakdown.map((sb, sbIdx) => (
                          <div key={sbIdx} className={`p-2.5 rounded-lg border space-y-1 ${
                            isDarkMode 
                              ? 'bg-[#1a222e] border-slate-700/80' 
                              : 'bg-white border-sky-200'
                          }`}>
                            <p className={`font-jlpt-exam text-sm sm:text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-950 font-bold'}`}>{sb.ja}</p>
                            <p className={`font-sans text-xs sm:text-sm font-medium ${isDarkMode ? 'text-sky-300' : 'text-sky-900'}`}>➡️ {sb.vi}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. QUESTION SENTENCE / PROMPT ANNOTATION */}
      {/* ========================================================================= */}
      <div className={`mb-4 border rounded-xl p-3 sm:p-4 shadow-2xs ${
        isDarkMode 
          ? 'bg-[#18202c] border-slate-700' 
          : 'bg-[#f8f7f2] border-stone-300'
      }`}>
        {isDokkai && (
          <div className={`text-xs font-bold mb-2 flex items-center gap-1 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <span>❓ 設問{isSubmitted ? ' (Câu hỏi):' : '：'}</span>
          </div>
        )}

        {/* Tokens Container (Phiên âm Furigana trên & Nghĩa Tiếng Việt dưới - MÀU XANH DƯƠNG) */}
        <div className={`flex flex-wrap items-baseline ${isSubmitted ? 'gap-y-12 sm:gap-y-14 gap-x-2 sm:gap-x-2.5 pt-4 pb-4' : 'gap-y-4 gap-x-1.5 py-1'}`}>
          {annotationResult.tokens.map((token) => {
            const hasTop = Boolean(token.topAnnotation);
            const hasBottom = Boolean(token.bottomAnnotation);

            return (
              <div 
                key={token.id} 
                className={`relative inline-flex flex-col items-center justify-center transition-all ${
                  token.isTarget ? 'font-bold' : ''
                }`}
              >
                {/* --- TOP ANNOTATION: FURIGANA (XANH DƯƠNG) --- */}
                {isSubmitted && hasTop && (
                  <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none select-none z-10">
                    <span className={`font-red-pen text-xs sm:text-sm font-bold tracking-tight px-1.5 py-0.2 rounded border shadow-2xs ${
                      isDarkMode 
                        ? 'text-sky-300 bg-[#121922] border-sky-600/70' 
                        : 'text-sky-800 bg-white border-sky-400 font-black'
                    }`}>
                      {token.topAnnotation}
                    </span>
                  </div>
                )}

                {/* --- MAIN JAPANESE TEXT --- */}
                <span 
                  className={`font-jlpt-exam text-base sm:text-lg relative z-0 px-0.5 leading-normal ${
                    isDarkMode 
                      ? token.isTarget ? 'text-sky-300 font-bold' : 'text-slate-100'
                      : token.isTarget ? 'text-sky-900 font-black' : 'text-slate-950 font-bold'
                  }`}
                >
                  {token.text}

                  {/* Blue Underline */}
                  {isSubmitted && token.isUnderlined && (
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                      isDarkMode ? 'bg-sky-400' : 'bg-sky-600'
                    }`} />
                  )}

                  {/* Blue Circle on Target Word */}
                  {isSubmitted && token.isCircled && (
                    <svg 
                      className={`absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none select-none ${
                        isDarkMode ? 'text-sky-400' : 'text-sky-700'
                      }`} 
                      viewBox="0 0 100 100" 
                      preserveAspectRatio="none"
                      fill="none"
                    >
                      <path
                        d="M 5,50 C 3,20 25,5 50,5 C 78,5 97,22 95,52 C 93,78 72,95 48,95 C 22,95 4,75 5,45"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>

                {/* --- BOTTOM ANNOTATION: VIETNAMESE MEANING (XANH DƯƠNG) --- */}
                {isSubmitted && hasBottom && (
                  <div className="absolute -bottom-6 sm:-bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none select-none z-10">
                    <span className={`font-red-pen text-xs sm:text-sm font-semibold tracking-tight px-1.5 py-0.2 rounded border shadow-2xs ${
                      isDarkMode 
                        ? 'text-sky-200 bg-[#121922] border-sky-700/70' 
                        : 'text-sky-900 bg-white border-sky-400 font-black'
                    }`}>
                      {token.bottomAnnotation}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- FULL SENTENCE VIETNAMESE MEANING BANNER (MÀU XANH DƯƠNG) --- */}
        {isSubmitted && annotationResult.fullSentenceMeaning && (
          <div className={`mt-4 pt-3 border-t rounded-lg p-2.5 ${
            isDarkMode 
              ? 'border-sky-800/60 bg-[#131d2b]' 
              : 'border-sky-200 bg-sky-50'
          }`}>
            <div className={`flex items-start gap-2 ${isDarkMode ? 'text-sky-200' : 'text-sky-950'}`}>
              <span className="font-bold text-xs bg-sky-600 text-white px-1.5 py-0.5 rounded font-sans shrink-0 mt-0.5">
                Dịch câu
              </span>
              <span className={`font-red-pen text-sm sm:text-base font-bold leading-snug ${
                isDarkMode ? 'text-sky-200' : 'text-sky-950'
              }`}>
                {annotationResult.fullSentenceMeaning}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. FOUR OPTIONS (LỰA CHỌN 1, 2, 3, 4) */}
      {/* ========================================================================= */}
      <div className="mt-3">
        {/* Dynamic Grid: 1 col for long Dokkai sentences, 2 cols for medium, 4 cols for short */}
        <div className={`grid gap-2.5 ${
          annotationResult.options.some(o => o.optionText.length > 25)
            ? 'grid-cols-1'
            : annotationResult.options.some(o => o.optionText.length > 10)
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-2 sm:grid-cols-4'
        }`}>
          {annotationResult.options.map((opt) => {
            const isUserChoice = userAnswer === opt.index;

            return (
              <div
                key={`opt-${opt.index}`}
                id={`question-${question.id}-option-${opt.index + 1}`}
                onClick={() => {
                  if (!disabled && onSelectOption) {
                    onSelectOption(opt.index);
                  }
                }}
                className={`relative p-3 sm:p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between select-none ${
                  disabled ? 'cursor-default' : 'cursor-pointer hover:border-slate-400'
                } ${
                  isSubmitted
                    ? opt.isCorrect
                      ? isDarkMode 
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-sm text-emerald-100'
                        : 'bg-emerald-50 border-emerald-500 shadow-sm text-emerald-950 font-bold'
                      : isUserChoice
                        ? isDarkMode
                          ? 'bg-rose-950/60 border-rose-500 shadow-sm text-rose-100'
                          : 'bg-rose-50 border-rose-400 shadow-sm text-rose-950'
                        : isDarkMode
                          ? 'bg-[#18202c] border-slate-700 opacity-90 text-slate-300'
                          : 'bg-white border-stone-300 opacity-90 text-slate-900'
                    : isUserChoice
                      ? isDarkMode
                        ? 'bg-slate-800 border-amber-400 shadow-xs ring-1 ring-amber-400 text-amber-200'
                        : 'bg-amber-100 border-amber-500 shadow-xs ring-1 ring-amber-400 text-amber-950 font-bold'
                      : isDarkMode
                        ? 'bg-[#18202c] border-slate-700 hover:bg-[#202b3b] text-slate-200'
                        : 'bg-white border-stone-300 hover:bg-stone-50 text-slate-950 font-medium'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Option Number (1, 2, 3, 4) with Circles / Crosses */}
                  <div className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 mt-0.5 border shadow-2xs ${
                    isSubmitted && opt.isCorrect 
                      ? isDarkMode ? 'border-emerald-500 bg-emerald-950 text-emerald-300' : 'border-emerald-500 bg-emerald-100 text-emerald-900'
                      : isSubmitted && isUserChoice && !opt.isCorrect 
                        ? isDarkMode ? 'border-rose-500 bg-rose-950 text-rose-300' : 'border-rose-400 bg-rose-100 text-rose-900'
                        : isDarkMode ? 'border-slate-600 bg-[#121820] text-slate-300' : 'border-slate-400 bg-white text-slate-950'
                  }`}>
                    <span className="font-jlpt-exam">
                      {opt.index + 1}
                    </span>

                    {/* Pencil Circle during test (khi đang làm bài) */}
                    {!isSubmitted && isUserChoice && (
                      <svg 
                        className={`absolute -inset-1.5 w-9 h-9 pointer-events-none select-none ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} 
                        viewBox="0 0 100 100" 
                        fill="none"
                      >
                        <path
                          d="M 15,50 C 11,25 26,11 50,11 C 78,11 91,31 87,61 C 83,85 59,91 35,87 C 17,83 8,63 15,35"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}

                    {/* Green Ink Circle on Correct Option (Khoanh xanh lá cây cho câu đúng) */}
                    {isSubmitted && opt.isCorrect && (
                      <svg 
                        className="absolute -inset-2 w-10 sm:w-11 h-10 sm:h-11 pointer-events-none select-none text-emerald-600 drop-shadow-xs animate-in zoom-in-75 duration-200" 
                        viewBox="0 0 100 100" 
                        fill="none"
                      >
                        <path
                          d="M 16,50 C 12,24 28,10 52,10 C 82,10 92,30 88,60 C 84,84 60,92 36,88 C 18,84 8,64 16,36"
                          stroke={isDarkMode ? '#10b981' : '#059669'}
                          strokeWidth="6.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}

                    {/* Red Cross on Wrong Selected Answer (Dấu chéo đỏ cho câu sai người dùng chọn) */}
                    {isSubmitted && !opt.isCorrect && isUserChoice && (
                      <svg 
                        className="absolute -inset-1 w-8 sm:w-9 h-8 sm:h-9 pointer-events-none select-none text-rose-600 drop-shadow-xs" 
                        viewBox="0 0 100 100" 
                        fill="none"
                      >
                        <path
                          d="M 22,22 L 78,78 M 78,22 L 22,78"
                          stroke={isDarkMode ? '#ef4444' : '#e11d48'}
                          strokeWidth="6.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Japanese Option Text */}
                  <span className={`font-jlpt-exam text-base sm:text-lg leading-snug ${
                    isSubmitted
                      ? opt.isCorrect
                        ? isDarkMode ? 'text-emerald-300 font-bold' : 'text-emerald-950 font-black'
                        : isUserChoice
                          ? isDarkMode ? 'text-rose-300 line-through decoration-rose-500 decoration-2 font-medium' : 'text-rose-950 line-through decoration-rose-500 decoration-2 font-medium'
                          : isDarkMode ? 'text-slate-300' : 'text-slate-900 font-medium'
                      : isUserChoice
                        ? isDarkMode ? 'text-amber-200 font-bold' : 'text-amber-950 font-black'
                        : isDarkMode ? 'text-slate-200' : 'text-slate-950 font-bold'
                  }`}>
                    {opt.optionText}
                  </span>
                </div>

                {/* --- HANDWRITTEN NOTE DIRECTLY UNDER OPTION (XANH LÁ CÂY cho câu đúng | ĐỎ cho câu sai) --- */}
                {isSubmitted && (
                  <div className={`mt-2 pt-1.5 border-t ${
                    opt.isCorrect 
                      ? isDarkMode ? 'border-emerald-800/80' : 'border-emerald-200' 
                      : isDarkMode ? 'border-slate-700/60' : 'border-stone-200'
                  }`}>
                    <span className={`font-red-pen text-sm sm:text-base font-bold tracking-wide block leading-snug ${
                      opt.isCorrect
                        ? isDarkMode ? 'text-emerald-400' : 'text-emerald-800'
                        : isUserChoice
                          ? isDarkMode ? 'text-rose-400 font-bold' : 'text-rose-700 font-bold'
                          : isDarkMode ? 'text-rose-400/90 font-bold' : 'text-rose-600 font-bold'
                    }`}>
                      {opt.handwrittenNote}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 4. CHOUKAI AUDIO SCRIPT WITH LINE-BY-LINE VIETNAMESE TRANSLATION */}
        {/* ========================================================================= */}
        {isSubmitted && choukaiDetail && choukaiDetail.scriptLines && (
          <div className={`mt-4 border rounded-xl p-3 sm:p-4 space-y-2.5 ${
            isDarkMode 
              ? 'bg-[#18202c] border-amber-600/40 text-slate-100' 
              : 'bg-amber-50/80 border-amber-200 text-slate-950'
          }`}>
            <div className={`flex items-center gap-2 pb-2 border-b font-bold text-xs sm:text-sm font-jlpt-exam ${
              isDarkMode ? 'border-slate-700 text-amber-400' : 'border-amber-200 text-amber-950'
            }`}>
              <Volume2 className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`} />
              <span>📜 Kịch bản bài nghe (Script) & Dịch nghĩa Tiếng Việt từng câu:</span>
            </div>
            <div className="space-y-2.5 pt-1">
              {choukaiDetail.scriptLines.map((line, lIdx) => (
                <div key={`script-line-${lIdx}`} className={`p-2.5 rounded-lg border space-y-1 font-jlpt-exam ${
                  isDarkMode 
                    ? 'bg-[#121820] border-slate-700/60' 
                    : 'bg-white border-stone-200'
                }`}>
                  <div className="flex items-baseline gap-2">
                    <span className={`font-bold text-xs font-sans px-2 py-0.5 rounded border shrink-0 ${
                      isDarkMode 
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600/50' 
                        : 'bg-amber-100 text-amber-950 border-amber-300'
                    }`}>
                      {line.speakerJa} ({line.speaker})
                    </span>
                    <span className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-100' : 'text-slate-950 font-bold'}`}>
                      {line.japanese}
                    </span>
                  </div>
                  <div className={`font-sans text-xs sm:text-sm pl-2 border-l-2 leading-relaxed font-medium ${
                    isDarkMode ? 'text-sky-300 border-sky-500/80' : 'text-sky-900 border-sky-400'
                  }`}>
                    {line.vietnamese}
                  </div>
                </div>
              ))}
            </div>
            {choukaiDetail.keyPoint && (
              <div className={`mt-2 p-2 rounded border text-xs font-sans ${
                isDarkMode 
                  ? 'bg-amber-950/40 border-amber-600/40 text-amber-200' 
                  : 'bg-amber-100/60 border-amber-300 text-amber-950'
              }`}>
                <strong>💡 Điểm mấu chốt nghe hiểu:</strong> {choukaiDetail.keyPoint}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

