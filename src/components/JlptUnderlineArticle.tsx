/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { LessonReadingVocab } from '../types';
import { detectWordPos, PosType } from '../utils/posUtils';

export interface JlptWordInfo {
  word: string;
  furigana?: string;
  jlpt?: string | null;
  meaning?: string;
  hanViet?: string;
  partOfSpeech?: string;
}

interface JlptUnderlineArticleProps {
  rawTokens?: Array<{
    text: string;
    furigana?: string | null;
    jlpt?: string | null;
    word?: string;
    partOfSpeech?: string | null;
  }>;
  japanesePassage: string;
  furiganaPassage?: string;
  vocabularyList?: LessonReadingVocab[];
  usedGrammar?: string[] | any[];
  levelWords?: {
    n1?: Array<{ word: string; meaning: string; furigana?: string }>;
    n2?: Array<{ word: string; meaning: string; furigana?: string }>;
    n3?: Array<{ word: string; meaning: string; furigana?: string }>;
    n4?: Array<{ word: string; meaning: string; furigana?: string }>;
    n5?: Array<{ word: string; meaning: string; furigana?: string }>;
  } | null;
  showFurigana: boolean;
  showJlptUnderline?: boolean;
  selectedJlptFilter?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | null;
  highlightGrammar?: boolean;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  onWordClick: (info: JlptWordInfo) => void;
  // Optional audio sentence sync highlighting
  activeSentenceIndex?: number;
  onSentenceClick?: (sentenceIndex: number) => void;
  // POS (Part of Speech) highlighting: Danh từ (Sky Blue), Động từ (Orange), Tính từ (Emerald Green)
  posMap?: Record<string, PosType | string>;
  showPosHighlight?: boolean;
  selectedPosFilter?: 'noun' | 'verb' | 'adjective' | null;
}

// JLPT underline and badge colors matching reference design
export const JLPT_LEVEL_CONFIG: Record<string, {
  label: string;
  color: string;
  underlineClass: string;
  badgeClass: string;
  glowClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}> = {
  N5: {
    label: 'JLPT N5',
    color: '#06b6d4',
    underlineClass: 'border-b-2 border-cyan-400 pb-[1px]',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    glowClass: 'ring-2 ring-cyan-400/80 bg-cyan-950/40 rounded',
    badgeBg: 'bg-cyan-500/20',
    badgeBorder: 'border-cyan-500/40',
    badgeText: 'text-cyan-300'
  },
  N4: {
    label: 'JLPT N4',
    color: '#2dd4bf',
    underlineClass: 'border-b-2 border-teal-400 pb-[1px]',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    glowClass: 'ring-2 ring-teal-400/80 bg-teal-950/40 rounded',
    badgeBg: 'bg-teal-500/20',
    badgeBorder: 'border-teal-500/40',
    badgeText: 'text-teal-300'
  },
  N3: {
    label: 'JLPT N3',
    color: '#facc15',
    underlineClass: 'border-b-2 border-yellow-400 pb-[1px]',
    badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    glowClass: 'ring-2 ring-yellow-400/80 bg-yellow-950/40 rounded',
    badgeBg: 'bg-yellow-500/20',
    badgeBorder: 'border-yellow-500/40',
    badgeText: 'text-yellow-300'
  },
  N2: {
    label: 'JLPT N2',
    color: '#c084fc',
    underlineClass: 'border-b-2 border-purple-400 pb-[1px]',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    glowClass: 'ring-2 ring-purple-400/80 bg-purple-950/40 rounded',
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-300'
  },
  N1: {
    label: 'JLPT N1',
    color: '#f43f5e',
    underlineClass: 'border-b-2 border-rose-500 pb-[1px]',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    glowClass: 'ring-2 ring-rose-400/80 bg-rose-950/40 rounded',
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-300'
  }
};

interface TokenSegment {
  text: string;
  furigana?: string | null;
}

interface UnifiedArticleToken {
  text: string;
  word: string;
  furigana?: string | null;
  segments: TokenSegment[];
  jlpt?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | null;
  meaning: string;
  isPunctuation: boolean;
  isNewline: boolean;
}

export const JlptUnderlineArticle: React.FC<JlptUnderlineArticleProps> = ({
  rawTokens,
  japanesePassage,
  furiganaPassage,
  vocabularyList = [],
  usedGrammar = [],
  levelWords = null,
  showFurigana = true,
  showJlptUnderline = true,
  selectedJlptFilter = null,
  highlightGrammar = false,
  fontSize = 'base',
  onWordClick,
  posMap,
  showPosHighlight = true,
  selectedPosFilter = null
}) => {
  // Vocabulary lookup map
  const vocabMap = useMemo(() => {
    const map = new Map<string, LessonReadingVocab>();
    if (vocabularyList && Array.isArray(vocabularyList)) {
      vocabularyList.forEach(v => {
        if (v.word) map.set(v.word, v);
        if (v.kanji) map.set(v.kanji, v);
      });
    }
    return map;
  }, [vocabularyList]);

  // Level words lookup map
  const levelWordsLookup = useMemo(() => {
    const map = new Map<string, 'N1' | 'N2' | 'N3' | 'N4' | 'N5'>();
    if (levelWords) {
      (['n1', 'n2', 'n3', 'n4', 'n5'] as const).forEach(k => {
        const lvl = k.toUpperCase() as 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
        const list = levelWords[k];
        if (Array.isArray(list)) {
          list.forEach(item => {
            if (item.word) map.set(item.word, lvl);
          });
        }
      });
    }
    return map;
  }, [levelWords]);

  // Grammar points list
  const grammarPoints = useMemo(() => {
    if (!usedGrammar || !Array.isArray(usedGrammar)) return [];
    return usedGrammar.map(g => g.replace(/^[Nn][1-5]\s*[-–:]\s*/, '').trim()).filter(Boolean);
  }, [usedGrammar]);

  // Font size calculation matching responsive Japanese reading design
  let mainTextSize = 'text-lg sm:text-xl';
  let paragraphLeading = 'leading-[2.6] sm:leading-[2.8]';

  if (fontSize === 'xs' || fontSize === 'sm') {
    mainTextSize = 'text-base sm:text-lg';
    paragraphLeading = 'leading-[2.4] sm:leading-[2.6]';
  } else if (fontSize === 'lg') {
    mainTextSize = 'text-xl sm:text-2xl';
    paragraphLeading = 'leading-[2.7] sm:leading-[2.9]';
  } else if (fontSize === 'xl' || fontSize === '2xl') {
    mainTextSize = 'text-2xl sm:text-3xl';
    paragraphLeading = 'leading-[2.8] sm:leading-[3.1]';
  }

  // Tokenize and build unified tokens list with intelligent word & okurigana cohesion
  const allTokens = useMemo(() => {
    const rawUnits: Array<{
      text: string;
      furigana?: string | null;
      jlpt?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | null;
      word?: string;
      isRuby: boolean;
      isPunctuation: boolean;
      isNewline: boolean;
    }> = [];

    // Helper to find JLPT level
    const findJlpt = (w: string, t: string) => {
      return (
        levelWordsLookup.get(w) ||
        levelWordsLookup.get(t) ||
        (vocabMap.get(w)?.level as any) ||
        (vocabMap.get(t)?.level as any) ||
        null
      );
    };

    if (rawTokens && rawTokens.length > 0) {
      for (const tok of rawTokens) {
        const t = tok.text || '';
        // Skip isolated empty whitespace tokens that break Japanese typography flow
        if (t === ' ' || t === '\t' || t === '\r') {
          continue;
        }
        const isNewline = t.includes('\n');
        const isPunc = !isNewline && /^[、。！？「」『』（）()[\].,!?:;\-–—…]+$/.test(t.trim());
        const isRuby = !!tok.furigana || /[\u4e00-\u9faf]/.test(t);
        const w = tok.word || t;
        rawUnits.push({
          text: t,
          furigana: tok.furigana,
          jlpt: (tok.jlpt as any) || findJlpt(w, t),
          word: w,
          isRuby,
          isPunctuation: isPunc,
          isNewline
        });
      }
    } else {
      // Parse from furiganaPassage (e.g. "[漢字](かんじ)は...") or japanesePassage
      const textToParse = furiganaPassage || japanesePassage || '';
      const rubyRegex = /\[([^\]]+)\]\(([^)]+)\)|(\n+)|([^\s\[\]()]+)/g;
      let match: RegExpExecArray | null;

      while ((match = rubyRegex.exec(textToParse)) !== null) {
        if (match[1] && match[2]) {
          // Kanji with Furigana
          const kanji = match[1];
          const furi = match[2];
          rawUnits.push({
            text: kanji,
            furigana: furi,
            jlpt: findJlpt(kanji, kanji),
            word: kanji,
            isRuby: true,
            isPunctuation: false,
            isNewline: false
          });
        } else if (match[3]) {
          // Line break
          rawUnits.push({
            text: match[3],
            furigana: null,
            jlpt: null,
            word: '',
            isRuby: false,
            isPunctuation: false,
            isNewline: true
          });
        } else if (match[4]) {
          const chunk = match[4];
          const puncRegex = /([、。！？「」『』（）()[\].,!?:;\-–—…]+)|([^、。！？「」『』（）()[\].,!?:;\-–—…]+)/g;
          let pm: RegExpExecArray | null;
          while ((pm = puncRegex.exec(chunk)) !== null) {
            if (pm[1]) {
              rawUnits.push({
                text: pm[1],
                furigana: null,
                jlpt: null,
                word: '',
                isRuby: false,
                isPunctuation: true,
                isNewline: pm[1].includes('\n')
              });
            } else if (pm[2]) {
              const subPart = pm[2];
              rawUnits.push({
                text: subPart,
                furigana: null,
                jlpt: findJlpt(subPart, subPart),
                word: subPart,
                isRuby: /[\u4e00-\u9faf]/.test(subPart),
                isPunctuation: false,
                isNewline: false
              });
            }
          }
        }
      }
    }

    // Pass 2: Intelligent Word & Okurigana Merging
    // Merges broken characters sharing the same `word` (e.g. 質+問 -> 質問, 答+え+る -> 答える, 難+し+い -> 難しい)
    const processedTokens: UnifiedArticleToken[] = [];
    let i = 0;

    while (i < rawUnits.length) {
      const cur = rawUnits[i];

      if (cur.isNewline) {
        processedTokens.push({
          text: cur.text,
          word: '',
          furigana: null,
          segments: [{ text: cur.text, furigana: null }],
          jlpt: null,
          meaning: '',
          isPunctuation: false,
          isNewline: true
        });
        i++;
        continue;
      }

      if (cur.isPunctuation) {
        processedTokens.push({
          text: cur.text,
          word: '',
          furigana: null,
          segments: [{ text: cur.text, furigana: null }],
          jlpt: null,
          meaning: '',
          isPunctuation: true,
          isNewline: false
        });
        i++;
        continue;
      }

      const segments: TokenSegment[] = [{ text: cur.text, furigana: cur.furigana }];
      let combinedText = cur.text;
      let combinedWord = cur.word || cur.text;
      let jlptLevel = cur.jlpt;

      let j = i + 1;
      while (j < rawUnits.length) {
        const next = rawUnits[j];
        if (next.isNewline || next.isPunctuation) break;

        // 1. Same word merging (e.g. 質 + 問 both have word="質問", 答+え+る have word="答える")
        const isSameTargetWord = !!cur.word && !!next.word && cur.word === next.word && cur.word.length > 1;

        // 2. Okurigana merging (e.g. 難 + しい, 知 + られて, 読 + む)
        const nextClean = next.text.trim();
        const isOkurigana =
          !next.furigana &&
          /^[ぁ-ん]+$/.test(nextClean) &&
          nextClean.length <= 5 &&
          !(/^(?:は|が|を|に|で|と|へ|も|の|や|か|ね|よ|わ)$/.test(nextClean) && combinedText.length >= 2);

        // 3. Contiguous Kanji Compound (e.g. [東](とう) + [京](きょう))
        const isContiguousKanji =
          (cur.isRuby || /[\u4e00-\u9faf]/.test(cur.text)) &&
          (next.isRuby || /[\u4e00-\u9faf]/.test(next.text)) &&
          combinedText.length <= 4;

        if (isSameTargetWord || isOkurigana || isContiguousKanji) {
          segments.push({ text: next.text, furigana: next.furigana });
          combinedText += next.text;
          if (next.word && (!cur.word || next.word.length > cur.word.length)) {
            combinedWord = next.word;
          }
          if (!jlptLevel && next.jlpt) {
            jlptLevel = next.jlpt;
          }
          j++;
          if (isOkurigana && !isSameTargetWord) break;
        } else {
          break;
        }
      }

      i = j;

      const cleanCombined = combinedText.trim();
      const cleanWord = combinedWord.trim();
      const finalJlpt = jlptLevel || findJlpt(cleanWord, cleanCombined);
      const vocab = vocabMap.get(cleanWord) || vocabMap.get(cleanCombined);

      processedTokens.push({
        text: cleanCombined,
        word: cleanWord,
        furigana: cur.furigana || null,
        segments,
        jlpt: finalJlpt,
        meaning: vocab?.meaning || '',
        isPunctuation: false,
        isNewline: false
      });
    }

    return processedTokens;
  }, [rawTokens, furiganaPassage, japanesePassage, vocabMap, levelWordsLookup]);

  // Group tokens into continuous paragraphs with zero mid-paragraph line breakage
  const paragraphs = useMemo(() => {
    const paras: UnifiedArticleToken[][] = [];
    let curPara: UnifiedArticleToken[] = [];

    for (const tok of allTokens) {
      if (tok.isNewline || tok.text.includes('\n')) {
        if (curPara.length > 0) {
          paras.push(curPara);
          curPara = [];
        }
      } else {
        const cleanText = tok.text.replace(/\n+/g, '');
        if (cleanText) {
          curPara.push({ ...tok, text: cleanText });
        }
      }
    }

    if (curPara.length > 0) {
      paras.push(curPara);
    }

    return paras.length > 0 ? paras : [allTokens];
  }, [allTokens]);

  return (
    <div className={`font-jp text-zinc-100 select-text ${paragraphLeading} tracking-normal space-y-6 sm:space-y-8`}>
      {paragraphs.map((paraTokens, pIdx) => (
        <p
          key={`para-${pIdx}`}
          className={`font-jlpt-exam font-jp text-zinc-100 select-text ${paragraphLeading} tracking-normal ${mainTextSize} block m-0 p-0`}
        >
          {paraTokens.map((token, idx) => {
            const hasJlpt = !!token.jlpt && JLPT_LEVEL_CONFIG[token.jlpt];
            const isUnderlined = showJlptUnderline && hasJlpt;
            const config = hasJlpt ? JLPT_LEVEL_CONFIG[token.jlpt!] : null;

            // Filter logic
            const isFilterActive = !!selectedJlptFilter;
            const isMatchingFilter = isFilterActive && token.jlpt === selectedJlptFilter;
            const isDimmedByFilter = isFilterActive && (!token.jlpt || token.jlpt !== selectedJlptFilter);

            // Check if matches grammar highlight
            const isGrammarPoint =
              highlightGrammar &&
              grammarPoints.some(gp => gp && (token.text.includes(gp) || (token.word && token.word.includes(gp))));

            const isPunctuation = token.isPunctuation || /^[、。！？「」『』（）()[\].,!?:;\-–—…]+$/.test(token.text);
            const hasKanji = /[\u4e00-\u9faf]/.test(token.text) || /[\u4e00-\u9faf]/.test(token.word || '');
            const hasFurigana = token.segments.some(s => !!s.furigana);
            const isVocab = !!token.meaning || (token.word && vocabMap.has(token.word));

            // Detect Part of Speech
            const pos: PosType = isPunctuation ? 'other' : detectWordPos(
              token.word || token.text,
              token.text,
              posMap,
              vocabularyList
            );
            const isNoun = pos === 'noun';
            const isVerb = pos === 'verb';
            const isAdjective = pos === 'adjective';

            // Filter logic: JLPT filter OR POS filter
            const isPosFilterActive = !!selectedPosFilter;
            const isMatchingPosFilter = isPosFilterActive && pos === selectedPosFilter;
            const isDimmedByPosFilter = isPosFilterActive && pos !== selectedPosFilter;

            const isDimmed = isDimmedByFilter || isDimmedByPosFilter;
            const isHighlighted = isMatchingFilter || isMatchingPosFilter;

            // Punctuation renders as pure continuous inline element with zero margin/gap
            if (isPunctuation) {
              return (
                <span
                  key={`tok-${pIdx}-${idx}`}
                  className="font-bold text-zinc-300 select-text inline"
                >
                  {token.text}
                </span>
              );
            }

            const isColoredWord = (hasJlpt || hasKanji || hasFurigana || isVocab || isGrammarPoint || isNoun || isVerb || isAdjective) && !isPunctuation;
            const canClick = isColoredWord;

            // Compute styling based on POS mode or JLPT underline mode
            let underlineClass = '';
            let wordColorClass = 'text-zinc-100';

            if (showPosHighlight) {
              if (isNoun) {
                // Danh từ: Tô màu Xanh lam / Sky Blue
                wordColorClass = 'text-sky-300 font-bold';
                underlineClass = 'border-b-2 border-sky-400 pb-[1px]';
              } else if (isVerb) {
                // Động từ: Tô màu Cam / Coral Orange
                wordColorClass = 'text-orange-400 font-bold';
                underlineClass = 'border-b-2 border-orange-400 pb-[1px]';
              } else if (isAdjective) {
                // Tính từ: Tô màu Xanh ngọc / Emerald Green
                wordColorClass = 'text-emerald-300 font-bold';
                underlineClass = 'border-b-2 border-emerald-400 pb-[1px]';
              } else if (isUnderlined && config) {
                underlineClass = config.underlineClass;
              }
            } else if (isUnderlined && config) {
              underlineClass = config.underlineClass;
            }

            // Hover effects
            const hoverClass = canClick
              ? isNoun
                ? 'hover:text-sky-100 hover:bg-sky-950/40 rounded-xs'
                : isVerb
                ? 'hover:text-orange-200 hover:bg-orange-950/40 rounded-xs'
                : isAdjective
                ? 'hover:text-emerald-200 hover:bg-emerald-950/40 rounded-xs'
                : 'hover:text-amber-200 hover:bg-zinc-800/80 rounded-xs'
              : '';

            return (
              <span
                key={`tok-${pIdx}-${idx}`}
                onClick={() => {
                  if (canClick) {
                    onWordClick({
                      word: token.word || token.text,
                      furigana: token.furigana || undefined,
                      jlpt: token.jlpt,
                      meaning: token.meaning,
                      partOfSpeech: isNoun ? 'danh từ' : isVerb ? 'động từ' : isAdjective ? 'tính từ' : undefined
                    });
                  }
                }}
                className={`inline relative transition-all duration-150 ${
                  canClick ? 'cursor-pointer group' : 'cursor-default'
                } ${isDimmed ? 'opacity-30 blur-[0.2px]' : 'opacity-100'} ${
                  isHighlighted ? 'scale-105 z-10' : ''
                } ${underlineClass} ${wordColorClass} ${hoverClass} ${
                  isMatchingFilter && config
                    ? `${config.glowClass} px-0.5 text-white font-extrabold shadow-sm`
                    : ''
                } ${
                  isMatchingPosFilter
                    ? isNoun
                      ? 'ring-2 ring-sky-400 bg-sky-950/60 text-sky-100 px-0.5 rounded shadow-sm'
                      : isVerb
                      ? 'ring-2 ring-orange-400 bg-orange-950/60 text-orange-100 px-0.5 rounded shadow-sm'
                      : isAdjective
                      ? 'ring-2 ring-emerald-400 bg-emerald-950/60 text-emerald-100 px-0.5 rounded shadow-sm'
                      : ''
                    : ''
                } ${
                  isGrammarPoint
                    ? 'bg-purple-900/40 text-purple-200 ring-1 ring-purple-400/60 rounded px-0.5'
                    : ''
                }`}
                title={isNoun ? 'Danh từ (Noun)' : isVerb ? 'Động từ (Verb)' : isAdjective ? 'Tính từ (Adjective)' : undefined}
              >
                {token.segments.map((seg, sIdx) => {
                  if (seg.furigana) {
                    return (
                      <ruby key={sIdx} className="ruby-unit">
                        <span>{seg.text}</span>
                        <rt
                          className={`text-zinc-400 font-medium text-[0.52em] select-none block text-center ${
                            showFurigana ? 'opacity-100' : 'hidden'
                          }`}
                        >
                          {seg.furigana}
                        </rt>
                      </ruby>
                    );
                  }
                  return <span key={sIdx}>{seg.text}</span>;
                })}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
};

export default React.memo(JlptUnderlineArticle);
