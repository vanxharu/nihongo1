import React, { useState } from 'react';
import { 
  EyeOff,
  Bot,
  Sparkles,
  Send,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { StudyBookQuestion } from '../types';
import { getStudyQuestionHintAndDistractors } from '../utils/questionOptionExplainer';

interface StudyExplanationCardProps {
  question: StudyBookQuestion;
  selectedOption?: number;
  isChecked?: boolean;
  onToggleHide?: () => void;
  isCorrect?: boolean;
}

interface KanjiItem {
  char: string;
  reading: string;
  meaning: string;
}

interface AntonymItem {
  left: string;
  right: string;
}

interface VocabItem {
  word: string;
  reading: string;
  meaning: string;
}

interface PairItem {
  label: string;
  value: string;
}

type ParsedBlock = 
  | { type: 'antonym'; data: AntonymItem }
  | { type: 'kanji_list'; items: KanjiItem[] }
  | { type: 'vocab'; data: VocabItem }
  | { type: 'pair'; data: PairItem }
  | { type: 'text'; content: string };

interface AiDistractorAnalysis {
  optionNumber: number;
  optionText: string;
  whyWrong: string;
}

interface AiExplanationResult {
  sentenceTranslation?: string;
  correctAnalysis?: string;
  distractorsAnalysis?: AiDistractorAnalysis[];
  examTip?: string;
  detailedAnswer?: string;
  keyGrammarOrVocab?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

/**
 * Intelligent parser to decompose study book explanations into clean, intuitive visual modules.
 */
function parseExplanationText(rawExplanation: string, defaultCorrectIdx: number, options: string[]) {
  if (!rawExplanation) {
    return {
      ansNum: (defaultCorrectIdx + 1).toString(),
      ansWord: options[defaultCorrectIdx] || '',
      page: null,
      blocks: []
    };
  }

  // 1. Extract Answer & Page Number
  const ansMatch = rawExplanation.match(/【(?:Đáp án\s*|ĐA\s*)?(\d+)?(?::\s*([^】]+))?】/);
  const pageMatch = rawExplanation.match(/\(Sách\s*trang\s*([^)]+)\)/i);

  let cleanText = rawExplanation;
  const ansNum = ansMatch?.[1] || (defaultCorrectIdx + 1).toString();
  let ansWord = ansMatch?.[2]?.trim() || options[defaultCorrectIdx] || '';

  if (ansMatch) {
    cleanText = cleanText.replace(ansMatch[0], '');
  }
  let page: string | null = null;
  if (pageMatch) {
    page = pageMatch[1].trim();
    cleanText = cleanText.replace(pageMatch[0], '');
  }

  // Remove leading colons or spaces
  cleanText = cleanText.replace(/^[\s:：]+/, '').trim();

  // 2. Split into meaningful segments
  const rawSegments = cleanText
    .split(/(?<=[.!?。])\s+|\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  const blocks: ParsedBlock[] = [];

  for (const seg of rawSegments) {
    // A. Antonyms: e.g. "つける (bật) ⇔ 消す (けす: tắt)"
    if (seg.includes('⇔') || seg.includes('<=>') || seg.includes('⇄')) {
      const parts = seg.split(/\s*(?:⇔|<=>|⇄)\s*/);
      if (parts.length >= 2) {
        blocks.push({
          type: 'antonym',
          data: {
            left: parts[0].replace(/[.。,]+$/, '').trim(),
            right: parts[1].replace(/[.。,]+$/, '').trim()
          }
        });
        continue;
      }
    }

    // B. Kanji breakdown: e.g. "会 (カイ / あ・う: gặp), 社 (シャ: công ty), 員 (イン: thành viên)"
    const kanjiMatches = Array.from(seg.matchAll(/(?:^|[\s,、。])([一-龯])\s*[（\(]([^：:]+)[：:]([^）\)]+)[）\)]/g));
    if (kanjiMatches.length >= 2 || (kanjiMatches.length === 1 && /(?:^|[\s,、。])[一-龯]\s*[（\(]/.test(seg))) {
      const items: KanjiItem[] = kanjiMatches.map(m => ({
        char: m[1].trim(),
        reading: m[2].trim(),
        meaning: m[3].replace(/[.。,]+$/, '').trim()
      }));
      blocks.push({ type: 'kanji_list', items });
      continue;
    }

    // C. Vocab format: "会社員 (かいしゃいん: nhân viên công ty)" or "人口 (じんこう: dân số)"
    const vocabMatch = seg.match(/^([一-龯ぁ-んァ-ヶー々A-Za-z0-9\s]+)\s*[（\(]([^：:]+)[：:]([^）\)]+)[）\)]/);
    if (vocabMatch && vocabMatch[1].length <= 15) {
      blocks.push({
        type: 'vocab',
        data: {
          word: vocabMatch[1].trim(),
          reading: vocabMatch[2].trim(),
          meaning: vocabMatch[3].replace(/[.。,]+$/, '').trim()
        }
      });
      continue;
    }

    // D. Phrase / rule pair with colon: e.g. "黒いペンで書いてください: Viết bằng bút đen"
    if ((seg.includes(':') || seg.includes('：')) && !seg.startsWith('http')) {
      const colonParts = seg.split(/[:：]/, 2);
      if (colonParts[0].length < 60) {
        blocks.push({
          type: 'pair',
          data: {
            label: colonParts[0].trim(),
            value: colonParts[1].replace(/[.。,]+$/, '').trim()
          }
        });
        continue;
      }
    }

    // E. Fallback text
    blocks.push({
      type: 'text',
      content: seg
    });
  }

  return { ansNum, ansWord, page, blocks };
}

export const StudyExplanationCard: React.FC<StudyExplanationCardProps> = ({
  question,
  selectedOption,
  isChecked = true,
  onToggleHide
}) => {
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiData, setAiData] = useState<AiExplanationResult | null>(null);
  const [aiProvider, setAiProvider] = useState<string>('Trợ lý AI');
  const [userQuery, setUserQuery] = useState('');
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  if (!isChecked || !question) return null;

  const correctIndex = question.correctIndex ?? 0;
  const analysis = getStudyQuestionHintAndDistractors(question);
  const sentenceTranslation = analysis.sentenceTranslation;

  const { blocks } = parseExplanationText(
    question.explanation || '',
    correctIndex,
    question.options || []
  );

  const distractorWords = (analysis.distractors || []).map(d => d.text.trim()).filter(Boolean);

  // Avoid repeating identical sentence translation or distractor options already explained in the distractor section
  const filteredBlocks = blocks.filter(block => {
    if (block.type === 'pair') {
      if (sentenceTranslation && (block.data.label === sentenceTranslation || block.data.value === sentenceTranslation)) {
        return false;
      }
    }
    if (distractorWords.length > 0) {
      if (block.type === 'text') {
        const hasDistractor = distractorWords.some(w => block.content.includes(w));
        const hasCorrect = question.options?.[correctIndex] && block.content.includes(question.options[correctIndex]);
        if (hasDistractor && !hasCorrect) return false;
      }
      if (block.type === 'kanji_list') {
        const allItemsAreDistractors = block.items.every(item => distractorWords.some(w => w.includes(item.char)));
        if (allItemsAreDistractors) return false;
      }
      if (block.type === 'vocab') {
        if (distractorWords.includes(block.data.word)) return false;
      }
    }
    return true;
  });

  const handleToggleAi = async () => {
    if (isAiExpanded) {
      setIsAiExpanded(false);
      return;
    }

    setIsAiExpanded(true);
    if (!aiData && !loadingAi) {
      setLoadingAi(true);
      try {
        const res = await fetch('/api/study-books/ai-explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            selectedOption
          })
        });
        const json = await res.json();
        if (json.data) {
          setAiData(json.data);
        }
        if (json.provider) {
          setAiProvider(json.provider);
        }
      } catch (e) {
        console.error('Failed to fetch AI explanation', e);
      } finally {
        setLoadingAi(false);
      }
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || userQuery).trim();
    if (!textToSend || loadingQuery) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserQuery('');
    setLoadingQuery(true);

    try {
      const res = await fetch('/api/study-books/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          selectedOption,
          userQuery: textToSend
        })
      });
      const json = await res.json();
      const reply = json.data?.detailedAnswer || json.data?.correctAnalysis || 'Sensei đã tiếp nhận câu hỏi của bạn.';
      
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: reply
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error('Failed to send query to AI Sensei', e);
      setChatMessages(prev => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          sender: 'assistant',
          text: 'Rất tiếc, đã có lỗi kết nối. Vui lòng thử lại sau.'
        }
      ]);
    } finally {
      setLoadingQuery(false);
    }
  };

  return (
    <div
      className="study-explanation-card mt-2.5 ml-0 sm:ml-10 rounded-xl border border-slate-700/80 bg-[#161d2a] text-slate-100 p-3 sm:p-3.5 text-xs shadow-sm animate-in fade-in duration-150"
      style={{
        backgroundColor: '#161d2a',
        borderColor: '#334155'
      }}
    >
      {/* 0. Top Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-700/70">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-emerald-300">
              Giải thích đáp án chi tiết
            </span>
          </div>
        </div>

        {onToggleHide && (
          <button
            type="button"
            onClick={onToggleHide}
            className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-1 transition-colors"
            title="Ẩn giải thích"
          >
            <EyeOff className="w-3 h-3" />
            <span>Ẩn</span>
          </button>
        )}
      </div>

      <div className="space-y-2 leading-relaxed text-slate-300">
        {/* 1. Dịch câu (Sentence translation) */}
        {sentenceTranslation && (
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 shadow-sm">
            <p className="text-xs sm:text-sm font-semibold text-amber-200/95 leading-relaxed select-text">
              {sentenceTranslation}
            </p>
          </div>
        )}

        {/* 2. Trọng tâm kiến thức từ giáo trình */}
        {filteredBlocks.length > 0 ? (
          <div className="space-y-1.5 pt-0.5">
            {filteredBlocks.map((block, idx) => {
              if (block.type === 'antonym') {
                return (
                  <div key={idx} className="flex items-center gap-1.5 flex-wrap text-[11px] sm:text-xs">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-300 font-japanese font-semibold">
                      {block.data.left}
                    </span>
                    <span className="text-slate-400 font-bold">⇄</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 font-japanese font-semibold">
                      {block.data.right}
                    </span>
                  </div>
                );
              }

              if (block.type === 'kanji_list') {
                return (
                  <div key={idx} className="flex items-center gap-1 flex-wrap text-[11px] sm:text-xs pt-0.5">
                    {block.items.map((k, kIdx) => (
                      <span 
                        key={kIdx} 
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60"
                      >
                        <span className="font-bold font-japanese text-indigo-300">{k.char}</span>
                        <span className="text-[10px] text-slate-400">({k.reading}: {k.meaning})</span>
                      </span>
                    ))}
                  </div>
                );
              }

              if (block.type === 'vocab') {
                return (
                  <div key={idx} className="flex items-baseline gap-1.5 flex-wrap text-[11px] sm:text-xs">
                    <span className="font-bold font-japanese text-white">{block.data.word}</span>
                    <span className="text-slate-400 font-japanese text-[10px]">({block.data.reading})</span>
                    <span className="text-slate-300">: {block.data.meaning}</span>
                  </div>
                );
              }

              if (block.type === 'pair') {
                return (
                  <div key={idx} className="flex items-baseline gap-1.5 flex-wrap text-[11px] sm:text-xs">
                    <span className="text-amber-300/90 font-medium font-japanese shrink-0">
                      • {block.data.label}:
                    </span>
                    <span className="text-slate-300">{block.data.value}</span>
                  </div>
                );
              }

              return (
                <div key={idx} className="text-[11px] sm:text-xs text-slate-300 leading-normal">
                  {block.content}
                </div>
              );
            })}
          </div>
        ) : (
          question.explanation && (
            <div className="text-[11px] sm:text-xs text-slate-300 leading-normal">
              {question.explanation}
            </div>
          )
        )}

        {/* 3. Phân tích giải thích các đáp án sai */}
        {analysis.distractors && analysis.distractors.length > 0 && (
          <div className="pt-2 border-t border-slate-700/70 space-y-1.5">
            <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
              <span>Giải thích các đáp án sai:</span>
            </div>
            <div className="space-y-1 pl-0.5">
              {analysis.distractors.map((d) => (
                <div key={d.index} className="flex items-start gap-1.5 text-[11px] leading-snug">
                  <span className="font-bold text-rose-400 shrink-0 font-japanese">
                    ✕ ({d.optionNumber}) {d.text}:
                  </span>
                  <span className="text-slate-300 font-normal">
                    {d.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. AI Deep Explanation & Interactive Q&A Section */}
        <div className="pt-3 border-t border-slate-700/70 mt-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleToggleAi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 shadow-xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAiExpanded ? 'Thu gọn phân tích chi tiết' : '✨ Phân tích chuyên sâu & Mẹo làm bài'}</span>
              {isAiExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5 text-emerald-400" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-emerald-400" />}
            </button>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <Bot className="w-3 h-3 text-emerald-400" /> {aiProvider}
            </span>
          </div>

          {/* Expanded AI Panel */}
          {isAiExpanded && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-3 animate-in fade-in duration-200">
              {loadingAi ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-center text-slate-300">
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  <p className="text-xs font-semibold text-emerald-300">
                    Hệ thống đang phân tích ngữ pháp, bẫy đề thi và mẹo làm bài...
                  </p>
                </div>
              ) : (
                <>
                  {aiData && (
                    <div className="space-y-2.5">
                      {/* Vì sao đáp án đúng */}
                      {aiData.correctAnalysis && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-600/30">
                          <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Phân tích vì sao đáp án đúng:</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {aiData.correctAnalysis}
                          </p>
                        </div>
                      )}

                      {/* Bóc tách các đáp án sai */}
                      {aiData.distractorsAnalysis && aiData.distractorsAnalysis.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                          <div className="text-[11px] font-bold text-rose-300 mb-1.5">
                            Bẫy đề thi thường gặp ở các đáp án khác:
                          </div>
                          <div className="space-y-1.5">
                            {aiData.distractorsAnalysis.map((item, idx) => (
                              <div key={idx} className="text-xs leading-relaxed flex items-start gap-1.5">
                                <span className="font-bold text-rose-400 shrink-0 font-japanese">
                                  ({item.optionNumber}) {item.optionText}:
                                </span>
                                <span className="text-slate-300">{item.whyWrong}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mẹo làm bài thi thực chiến JLPT */}
                      {aiData.examTip && (
                        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[11px] font-bold text-amber-300 block mb-0.5">
                              Mẹo làm bài thi JLPT:
                            </span>
                            <p className="text-xs text-amber-100/90 leading-relaxed">
                              {aiData.examTip}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chat messages */}
                  {chatMessages.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        <span>Hỏi đáp cùng Sensei:</span>
                      </div>
                      {chatMessages.map(msg => (
                        <div
                          key={msg.id}
                          className={`p-2 rounded-lg text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-slate-800 text-slate-100 ml-4 border border-slate-700'
                              : 'bg-emerald-950/50 text-emerald-100 mr-4 border border-emerald-500/30'
                          }`}
                        >
                          <span className="font-bold block text-[10px] text-slate-400 mb-0.5">
                            {msg.sender === 'user' ? '👤 Bạn' : '🎓 Sensei'}
                          </span>
                          {msg.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick question prompts */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1.5 font-medium">
                      Gợi ý hỏi nhanh:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Tại sao không dùng các đáp án khác?',
                        'Cho 2 câu ví dụ tương tự',
                        'Phân biệt trợ từ hoặc ngữ pháp này'
                      ].map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          disabled={loadingQuery}
                          onClick={() => handleSendQuery(prompt)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-emerald-300 border border-slate-700 transition-colors disabled:opacity-50"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {/* Interactive Input */}
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={userQuery}
                        onChange={e => setUserQuery(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendQuery();
                          }
                        }}
                        placeholder="Hỏi thêm về ngữ pháp, từ vựng câu này..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        disabled={!userQuery.trim() || loadingQuery}
                        onClick={() => handleSendQuery()}
                        className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors shrink-0"
                        title="Gửi câu hỏi"
                      >
                        {loadingQuery ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
