/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { Radio, Compass } from 'lucide-react';
import { AudioMark, LessonReadingSentence, LessonReadingVocab } from '../types';
import { hasKanji } from '../utils/japaneseUtils';
import { detectWordPos, PosType } from '../utils/posUtils';

/**
 * Extracts a kanji -> reading dictionary from a furigana passage or sentence string
 */
function extractFuriganaDictionary(furiganaText?: string): Map<string, string> {
  const dict = new Map<string, string>();
  if (!furiganaText) return dict;

  const mdRegex = /\[([^\]]+)\](?:\(([^)]+)\)|\[([^\]]+)\])/g;
  let m: RegExpExecArray | null;
  while ((m = mdRegex.exec(furiganaText)) !== null) {
    const kanji = m[1].trim();
    const reading = (m[2] || m[3] || '').trim();
    if (kanji && reading) {
      dict.set(kanji, reading);
    }
  }

  const rubyRegex = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g;
  while ((m = rubyRegex.exec(furiganaText)) !== null) {
    const kanji = m[1].trim();
    const reading = m[2].trim();
    if (kanji && reading) {
      dict.set(kanji, reading);
    }
  }

  return dict;
}

function getFuriganaForWord(word: string, dict: Map<string, string>): string | null {
  if (!word || !hasKanji(word)) return null;
  if (dict.has(word)) return dict.get(word)!;

  for (const [kanji, reading] of dict.entries()) {
    if (word === kanji) return reading;
    if (word.startsWith(kanji) || kanji.startsWith(word)) {
      return reading;
    }
  }

  return null;
}

function extractFuriganaForSnippet(snippet: string, furiganaPassage?: string): string | null {
  if (!snippet || !furiganaPassage) return null;
  const cleanSnippet = snippet.replace(/[\s。！？\n、「」『』（）()]/g, '');
  if (!cleanSnippet) return null;

  const furiSentences = furiganaPassage.split(/([。！？\n]+)/).filter(Boolean);
  for (let i = 0; i < furiSentences.length; i += 2) {
    const cand = (furiSentences[i] || '') + (furiSentences[i + 1] || '');
    const cleanCand = cand
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/<rt>.*?<\/rt>|<\/?[a-z]+[^>]*>/gi, '')
      .replace(/[\s。！？\n、「」『』（）()]/g, '');
    if (cleanCand && (cleanCand === cleanSnippet || cleanCand.includes(cleanSnippet) || cleanSnippet.includes(cleanCand))) {
      return cand.trim();
    }
  }

  return null;
}

function findMatchedBreakdown(
  sText: string,
  breakdownList: LessonReadingSentence[],
  usedIndices: Set<number>
): LessonReadingSentence | undefined {
  if (!sText || !breakdownList || breakdownList.length === 0) return undefined;

  const cleanSt = sText.replace(/[\s。！？\n、「」『』（）()]/g, '');
  if (!cleanSt) return undefined;

  for (let i = 0; i < breakdownList.length; i++) {
    if (usedIndices.has(i)) continue;
    const cleanSb = breakdownList[i].japanese.replace(/[\s。！？\n、「」『』（）()]/g, '');
    if (cleanSt === cleanSb) {
      usedIndices.add(i);
      return breakdownList[i];
    }
  }

  for (let i = 0; i < breakdownList.length; i++) {
    if (usedIndices.has(i)) continue;
    const cleanSb = breakdownList[i].japanese.replace(/[\s。！？\n、「」『』（）()]/g, '');
    if (cleanSb.includes(cleanSt) || cleanSt.includes(cleanSb)) {
      usedIndices.add(i);
      return breakdownList[i];
    }
  }

  let bestIdx = -1;
  let bestScore = 0;
  for (let i = 0; i < breakdownList.length; i++) {
    if (usedIndices.has(i)) continue;
    const cleanSb = breakdownList[i].japanese.replace(/[\s。！？\n、「」『』（）()]/g, '');
    let commonChars = 0;
    for (const char of cleanSt) {
      if (cleanSb.includes(char)) commonChars++;
    }
    const score = commonChars / Math.max(cleanSt.length, cleanSb.length);
    if (score > bestScore && score >= 0.55) {
      bestScore = score;
      bestIdx = i;
    }
  }

  if (bestIdx !== -1) {
    usedIndices.add(bestIdx);
    return breakdownList[bestIdx];
  }

  return undefined;
}

export interface KaraokeSentence {
  id: number;
  text: string;
  furigana?: string;
  vietnamese?: string;
  startTimeMs: number;
  endTimeMs: number;
  marks: AudioMark[];
  paragraphIndex?: number;
}

export interface SentenceToken {
  id: string;
  text: string;
  furigana?: string;
  isPunctuation: boolean;
  startTimeMs: number;
  endTimeMs: number;
}

/**
 * Splits plain text (outside ruby tags) into individual words and punctuation,
 * using authentic Japanese word boundaries.
 */
function segmentPlainText(
  plainText: string
): Array<{ text: string; isPunctuation: boolean }> {
  if (!plainText) return [];
  const results: Array<{ text: string; isPunctuation: boolean }> = [];
  const puncRegex = /([、。！？\s\n「」『』（）()[\].,!?:;\-–—…]+)|([^、。！？\s\n「」『』（）()[\].,!?:;\-–—…]+)/g;
  let match: RegExpExecArray | null;

  while ((match = puncRegex.exec(plainText)) !== null) {
    if (match[1]) {
      results.push({ text: match[1], isPunctuation: true });
    } else if (match[2]) {
      const chunk = match[2];
      // Use Intl.Segmenter if available for authentic Japanese grammatical word boundaries
      if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        try {
          const segmenter = new (Intl as any).Segmenter('ja', { granularity: 'word' });
          let segCount = 0;
          for (const { segment } of segmenter.segment(chunk)) {
            if (segment) {
              results.push({ text: segment, isPunctuation: false });
              segCount++;
            }
          }
          if (segCount > 0) continue;
        } catch {
          // Fallback if Segmenter not supported
        }
      }

      results.push({ text: chunk, isPunctuation: false });
    }
  }

  return results;
}

/**
 * Tokenizes a sentence into words and punctuation, calculating exact, continuous
 * millisecond timestamps for each token based on sentence timing and audio marks.
 */
function tokenizeSentenceTokens(
  sentenceStr: string,
  sentenceStartMs: number,
  sentenceEndMs: number,
  marks: AudioMark[] = [],
  furiDict: Map<string, string>,
  passageFuriDict: Map<string, string>
): SentenceToken[] {
  const rubyRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const rawParts: Array<{ text: string; furigana?: string; isPunctuation: boolean }> = [];

  while ((match = rubyRegex.exec(sentenceStr)) !== null) {
    if (match.index > lastIndex) {
      const plain = sentenceStr.slice(lastIndex, match.index);
      rawParts.push(...segmentPlainText(plain).map(p => ({ ...p, furigana: undefined })));
    }
    // Clean any duplicated reading like [家族かぞく](かぞく) -> 家族
    let rbText = match[1].trim();
    const rtText = match[2].trim();
    if (rtText && rbText.endsWith(rtText) && rbText.length > rtText.length) {
      rbText = rbText.slice(0, -rtText.length);
    }
    rawParts.push({
      text: rbText,
      furigana: rtText,
      isPunctuation: false
    });
    lastIndex = rubyRegex.lastIndex;
  }

  if (lastIndex < sentenceStr.length) {
    const plain = sentenceStr.slice(lastIndex);
    rawParts.push(...segmentPlainText(plain).map(p => ({ ...p, furigana: undefined })));
  }

  // Assign furigana to parts
  const preparedParts: SentenceToken[] = rawParts.map((part, pIdx) => {
    if (part.isPunctuation) {
      return {
        id: `punc-${pIdx}`,
        text: part.text,
        furigana: undefined,
        isPunctuation: true,
        startTimeMs: 0,
        endTimeMs: 0
      };
    }

    const furi =
      part.furigana ||
      getFuriganaForWord(part.text, furiDict) ||
      getFuriganaForWord(part.text, passageFuriDict) ||
      undefined;

    return {
      id: `word-${pIdx}`,
      text: part.text,
      furigana: furi,
      isPunctuation: false,
      startTimeMs: 0,
      endTimeMs: 0
    };
  });

  const wordTokens = preparedParts.filter(p => !p.isPunctuation);
  if (wordTokens.length === 0) {
    return preparedParts;
  }

  const cleanSent = wordTokens.map(w => w.text).join('');
  const totalChars = Math.max(1, cleanSent.length);
  const sentenceDuration = Math.max(400, sentenceEndMs - sentenceStartMs);

  // Array of timestamps for character offsets in cleanSent: length is cleanSent.length + 1
  const charTimes: number[] = new Array(cleanSent.length + 1);

  if (marks && marks.length > 0) {
    // Map marks onto cleanSent
    let searchCursor = 0;
    const matchedMarks: Array<{ startChar: number; endChar: number; startTime: number; endTime: number }> = [];

    for (let mIdx = 0; mIdx < marks.length; mIdx++) {
      const m = marks[mIdx];
      const val = m.value.replace(/[\s。！？\n、「」『』（）()[\].,!?:;\-–—]/g, '');
      if (!val) continue;

      let pos = cleanSent.indexOf(val, searchCursor);
      if (pos === -1) {
        pos = cleanSent.indexOf(val);
      }
      if (pos === -1) {
        pos = searchCursor;
      }

      const startChar = pos;
      const endChar = Math.min(cleanSent.length, startChar + Math.max(1, val.length));
      searchCursor = Math.max(searchCursor, endChar);

      const nextM = marks[mIdx + 1];
      const mStartTime = m.time;
      const mEndTime = nextM ? nextM.time : Math.max(mStartTime + 300, sentenceEndMs);

      matchedMarks.push({
        startChar,
        endChar,
        startTime: mStartTime,
        endTime: mEndTime
      });
    }

    // Set char times from matched marks
    matchedMarks.forEach(mm => {
      const spanLen = Math.max(1, mm.endChar - mm.startChar);
      const spanDur = Math.max(100, mm.endTime - mm.startTime);
      for (let c = mm.startChar; c <= mm.endChar; c++) {
        const ratio = (c - mm.startChar) / spanLen;
        charTimes[c] = Math.round(mm.startTime + ratio * spanDur);
      }
    });

    // Anchor first and last char times
    if (charTimes[0] === undefined) {
      charTimes[0] = Math.min(sentenceStartMs, matchedMarks[0]?.startTime ?? sentenceStartMs);
    }
    if (charTimes[cleanSent.length] === undefined) {
      charTimes[cleanSent.length] = Math.max(
        sentenceEndMs,
        matchedMarks[matchedMarks.length - 1]?.endTime ?? sentenceEndMs
      );
    }

    // Fill unassigned gaps linearly
    let lastKnown = 0;
    for (let c = 1; c <= cleanSent.length; c++) {
      if (charTimes[c] !== undefined) {
        if (c > lastKnown + 1) {
          const tStart = charTimes[lastKnown];
          const tEnd = charTimes[c];
          const step = (tEnd - tStart) / (c - lastKnown);
          for (let k = lastKnown + 1; k < c; k++) {
            charTimes[k] = Math.round(tStart + (k - lastKnown) * step);
          }
        }
        lastKnown = c;
      }
    }
  } else {
    // No marks: distribute evenly across sentence duration
    for (let c = 0; c <= cleanSent.length; c++) {
      charTimes[c] = Math.round(sentenceStartMs + (c / totalChars) * sentenceDuration);
    }
  }

  // Ensure timestamps are strictly monotonic
  for (let c = 1; c <= cleanSent.length; c++) {
    if (charTimes[c] === undefined) {
      charTimes[c] = (charTimes[c - 1] || sentenceStartMs) + 30;
    } else if (charTimes[c] < charTimes[c - 1]) {
      charTimes[c] = charTimes[c - 1] + 30;
    }
  }

  // Assign startTimeMs & endTimeMs to each word token
  let curCharOffset = 0;
  for (const tok of wordTokens) {
    const len = tok.text.length;
    const startChar = curCharOffset;
    const endChar = curCharOffset + len;
    curCharOffset += len;

    tok.startTimeMs = charTimes[startChar] ?? sentenceStartMs;
    tok.endTimeMs = Math.max(tok.startTimeMs + 120, charTimes[endChar] ?? sentenceEndMs);
  }

  return preparedParts;
}

interface AudioFollowReaderProps {
  japanesePassage: string;
  furiganaPassage?: string;
  vietnamesePassage?: string;
  sentenceBreakdown?: LessonReadingSentence[];
  audioMarks?: AudioMark[];
  currentTime: number; // in seconds
  duration: number; // in seconds
  isPlaying: boolean;
  showFurigana: boolean;
  showVietnamese: boolean;
  fontSize?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl';
  autoScroll: boolean;
  onSeek: (seconds: number) => void;
  onToggleAutoScroll?: () => void;
  onWordClick?: (info: { word: string; furigana?: string; partOfSpeech?: string }) => void;
  posMap?: Record<string, PosType | string>;
  vocabularyList?: LessonReadingVocab[];
  showPosHighlight?: boolean;
}

export const AudioFollowReader: React.FC<AudioFollowReaderProps> = ({
  japanesePassage,
  furiganaPassage,
  vietnamesePassage,
  sentenceBreakdown = [],
  audioMarks = [],
  currentTime,
  duration,
  isPlaying,
  showFurigana,
  showVietnamese,
  fontSize = 'base',
  autoScroll,
  onSeek,
  onToggleAutoScroll,
  onWordClick,
  posMap,
  vocabularyList = [],
  showPosHighlight = true
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentenceRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});
  const lastActiveSentenceIndexRef = useRef<number>(-1);

  const currentTimeMs = Math.max(0, currentTime * 1000);

  // Passage-level furigana dictionary
  const passageFuriDict = useMemo(() => {
    return extractFuriganaDictionary(furiganaPassage || japanesePassage);
  }, [furiganaPassage, japanesePassage]);

  // Parse paragraphs from passage text
  const rawParagraphs = useMemo(() => {
    const raw = furiganaPassage || japanesePassage || '';
    return raw.split(/\n\s*\n|\n/).filter(p => p.trim().length > 0);
  }, [furiganaPassage, japanesePassage]);

  // Base sentences preserved with complete punctuation
  const baseSentences = useMemo(() => {
    const rawPassage = furiganaPassage || japanesePassage || '';
    if (rawPassage) {
      // Split on Japanese sentence boundaries: 。！？ or newlines
      const rawSentences = rawPassage
        .split(/(?<=[。！？])|\n+/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !/^[\s、。！？\n]+$/.test(s));

      const seen = new Set<string>();
      const result: Array<{ id: number; text: string; furigana: string; vietnamese: string }> = [];
      let idCounter = 0;

      for (const sentStr of rawSentences) {
        // Clean ruby syntax to get plain text and heal any duplicated reading e.g. [家族かぞく](かぞく)
        const cleanFuri = sentStr.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, rb, rt) => {
          let cleanRb = (rb || '').trim();
          const cleanRt = (rt || '').trim();
          if (cleanRt && cleanRb.endsWith(cleanRt) && cleanRb.length > cleanRt.length) {
            cleanRb = cleanRb.slice(0, -cleanRt.length);
          }
          return `[${cleanRb}](${cleanRt})`;
        });

        const plainText = cleanFuri.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
        const normKey = plainText.replace(/[\s。！？、「」『』（）()[\].,!?:;\-–—]/g, '');
        if (!normKey || seen.has(normKey)) continue; // STRICT DEDUPLICATION: Prevents duplicated sentences!
        seen.add(normKey);

        // Find matching translation from sentenceBreakdown if available
        let vietnamese = '';
        if (sentenceBreakdown && sentenceBreakdown.length > 0) {
          const match = sentenceBreakdown.find(b => {
            const bNorm = (b.japanese || '').replace(/[\s。！？、「」『』（）()[\].,!?:;\-–—]/g, '');
            return bNorm && (normKey.includes(bNorm) || bNorm.includes(normKey));
          });
          if (match) {
            vietnamese = match.vietnamese || '';
          }
        }

        result.push({
          id: idCounter++,
          text: plainText,
          furigana: cleanFuri,
          vietnamese
        });
      }

      if (result.length > 0) return result;
    }

    if (sentenceBreakdown && sentenceBreakdown.length > 0) {
      const seen = new Set<string>();
      const result: Array<{ id: number; text: string; furigana: string; vietnamese: string }> = [];
      let idCounter = 0;

      for (const item of sentenceBreakdown) {
        const text = (item.japanese || '').trim();
        const normKey = text.replace(/[\s。！？、「」『』（）()[\].,!?:;\-–—]/g, '');
        if (!normKey || seen.has(normKey)) continue;
        seen.add(normKey);

        result.push({
          id: idCounter++,
          text,
          furigana: item.furigana || text,
          vietnamese: item.vietnamese || ''
        });
      }
      return result;
    }

    return [];
  }, [sentenceBreakdown, furiganaPassage, japanesePassage]);

  // Group sentences with exact or estimated timestamps
  const sentences: KaraokeSentence[] = useMemo(() => {
    if (baseSentences.length === 0) return [];

    if (audioMarks && audioMarks.length > 0) {
      const result: KaraokeSentence[] = [];
      let markCursor = 0;

      // Find where sentence 0 starts in audioMarks (skipping possible article title marks)
      const firstSentClean = baseSentences[0].text.replace(/[\s。！？\n、「」『』（）()[\].,!?:;\-–—]/g, '');
      if (firstSentClean) {
        for (let m = 0; m < Math.min(audioMarks.length, 25); m++) {
          if (
            firstSentClean.startsWith(audioMarks[m].value) ||
            audioMarks[m].value.startsWith(firstSentClean.slice(0, 2))
          ) {
            markCursor = m;
            break;
          }
        }
      }

      for (let sIdx = 0; sIdx < baseSentences.length; sIdx++) {
        const base = baseSentences[sIdx];
        const cleanSent = base.text.replace(/[\s。！？\n、「」『』（）()[\].,!?:;\-–—]/g, '');
        const sentMarks: AudioMark[] = [];
        let matchedCharCount = 0;

        const startCursor = markCursor;
        while (markCursor < audioMarks.length && matchedCharCount < cleanSent.length) {
          const m = audioMarks[markCursor];
          sentMarks.push(m);
          matchedCharCount += m.value.length;
          markCursor++;
        }

        const startTimeMs =
          sentMarks[0]?.time ?? (result.length > 0 ? result[result.length - 1].endTimeMs : 0);
        const nextMark = audioMarks[markCursor];
        const endTimeMs =
          nextMark && markCursor > startCursor
            ? nextMark.time
            : (sentMarks[sentMarks.length - 1]?.time ?? startTimeMs) + 1200;

        let pIdx = 0;
        for (let pi = 0; pi < rawParagraphs.length; pi++) {
          const cleanP = rawParagraphs[pi].replace(/[\s。！？\n、「」『』（）()]/g, '');
          if (cleanP.includes(cleanSent)) {
            pIdx = pi;
            break;
          }
        }

        result.push({
          id: sIdx,
          text: base.text,
          furigana: base.furigana,
          vietnamese: base.vietnamese,
          startTimeMs,
          endTimeMs,
          marks: sentMarks,
          paragraphIndex: pIdx
        });
      }

      return result;
    }

    // Fallback when NO audioMarks: distribute timestamps proportionally across duration
    const totalChars = baseSentences.reduce((acc, s) => acc + Math.max(1, s.text.length), 0);
    const totalDurationMs = duration > 0 ? duration * 1000 : Math.max(10000, totalChars * 260);
    let runningTimeMs = 0;

    return baseSentences.map((base, sIdx) => {
      const ratio = totalChars > 0 ? Math.max(1, base.text.length) / totalChars : 1 / baseSentences.length;
      const sDuration = ratio * totalDurationMs;
      const startTimeMs = runningTimeMs;
      const endTimeMs = startTimeMs + sDuration;
      runningTimeMs = endTimeMs;

      let pIdx = 0;
      const cleanSent = base.text.replace(/[\s。！？\n、「」『』（）()]/g, '');
      for (let pi = 0; pi < rawParagraphs.length; pi++) {
        const cleanP = rawParagraphs[pi].replace(/[\s。！？\n、「」『』（）()]/g, '');
        if (cleanP.includes(cleanSent)) {
          pIdx = pi;
          break;
        }
      }

      return {
        id: sIdx,
        text: base.text,
        furigana: base.furigana,
        vietnamese: base.vietnamese,
        startTimeMs,
        endTimeMs,
        marks: [],
        paragraphIndex: pIdx
      };
    });
  }, [baseSentences, audioMarks, rawParagraphs, duration]);

  // Precompute tokenized sentences with exact word timestamps once per sentences / dictionary
  const tokenizedSentences = useMemo(() => {
    return sentences.map((sentence) => {
      const furiDict = extractFuriganaDictionary(sentence.furigana);
      const tokens = tokenizeSentenceTokens(
        sentence.furigana || sentence.text,
        sentence.startTimeMs,
        sentence.endTimeMs,
        sentence.marks,
        furiDict,
        passageFuriDict
      );
      return { sentence, tokens };
    });
  }, [sentences, passageFuriDict]);

  // Group sentences into continuous paragraphs
  const groupedParagraphs = useMemo(() => {
    const paras: Array<Array<{ sentence: KaraokeSentence; tokens: SentenceToken[] }>> = [];
    let curP: Array<{ sentence: KaraokeSentence; tokens: SentenceToken[] }> = [];
    let currentPIdx = 0;

    tokenizedSentences.forEach((item) => {
      const sent = item.sentence;
      if (sent.paragraphIndex !== undefined && sent.paragraphIndex !== currentPIdx) {
        if (curP.length > 0) {
          paras.push(curP);
          curP = [];
        }
        currentPIdx = sent.paragraphIndex;
      }
      curP.push(item);
    });

    if (curP.length > 0) {
      paras.push(curP);
    }

    return paras.length > 0 ? paras : [tokenizedSentences];
  }, [tokenizedSentences]);

  // Active sentence index
  const activeSentenceIndex = useMemo(() => {
    if (!isPlaying && currentTimeMs === 0) return -1;

    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i];
      if (currentTimeMs >= s.startTimeMs && currentTimeMs < s.endTimeMs) {
        return i;
      }
    }

    if (sentences.length > 0 && currentTimeMs >= sentences[sentences.length - 1].startTimeMs) {
      return sentences.length - 1;
    }

    return -1;
  }, [sentences, currentTimeMs, isPlaying]);

  // Smooth auto-scroll when active sentence changes (without disruptive screen jumps)
  useEffect(() => {
    if (!autoScroll || activeSentenceIndex === -1) return;

    if (activeSentenceIndex !== lastActiveSentenceIndexRef.current) {
      lastActiveSentenceIndexRef.current = activeSentenceIndex;
      const targetEl = sentenceRefs.current[activeSentenceIndex];
      const container = containerRef.current;
      if (targetEl && container) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        const relativeTop = targetRect.top - containerRect.top;
        const relativeBottom = targetRect.bottom - containerRect.top;

        // Smoothly scroll only if the active sentence is outside the comfortable center view
        if (relativeTop < 40 || relativeBottom > containerRect.height - 60) {
          const scrollTarget = container.scrollTop + relativeTop - containerRect.height * 0.35;
          container.scrollTo({
            top: Math.max(0, scrollTarget),
            behavior: 'smooth'
          });
        }
      }
    }
  }, [activeSentenceIndex, autoScroll]);

  // Font size calculation
  let mainTextSize = 'text-lg sm:text-xl leading-loose';
  let furiganaTextSize = 'text-[11px] sm:text-[12px] leading-tight';
  let minFuriHeight = '1.25em';

  if (fontSize === 'xs' || fontSize === 'sm') {
    mainTextSize = 'text-base sm:text-lg leading-relaxed';
    furiganaTextSize = 'text-[10px] sm:text-[11px] leading-tight';
    minFuriHeight = '1.15em';
  } else if (fontSize === 'lg') {
    mainTextSize = 'text-xl sm:text-2xl leading-loose';
    furiganaTextSize = 'text-[12px] sm:text-[13px] leading-tight';
    minFuriHeight = '1.35em';
  } else if (fontSize === 'xl' || fontSize === '2xl') {
    mainTextSize = 'text-2xl sm:text-3xl leading-loose';
    furiganaTextSize = 'text-[13px] sm:text-[14px] leading-tight';
    minFuriHeight = '1.45em';
  }

  const activeSentence = activeSentenceIndex >= 0 ? sentences[activeSentenceIndex] : null;

  return (
    <div className="space-y-4">
      {/* CONTINUOUS FLOWING PARAGRAPHS (NO SEPARATE SENTENCE BOXES!) */}
      <div
        ref={containerRef}
        className="font-jlpt-exam font-jp text-zinc-100 select-text leading-relaxed tracking-normal space-y-6 sm:space-y-8 max-h-[640px] overflow-y-auto pr-1.5 scroll-smooth custom-scrollbar"
      >
        {groupedParagraphs.map((paraItems, pIdx) => (
          <div
            key={`karaoke-para-${pIdx}`}
            className="flex flex-wrap items-end gap-y-3 sm:gap-y-4 leading-relaxed"
          >
            {paraItems.map(({ sentence, tokens }) => {
              const sIdx = sentence.id;
              const isActive = sIdx === activeSentenceIndex;

              return (
                <span
                  key={`karaoke-sentence-${sentence.id}`}
                  ref={(el) => {
                    sentenceRefs.current[sIdx] = el;
                  }}
                  onClick={() => onSeek(sentence.startTimeMs / 1000)}
                  className={`inline-flex flex-wrap items-end transition-all duration-200 rounded-xl px-1.5 py-0.5 -mx-1 cursor-pointer ${
                    isActive
                      ? 'bg-purple-900/30 ring-1 ring-purple-500/40 text-white shadow-xs'
                      : 'hover:bg-zinc-800/40'
                  }`}
                  title="Nhấn để nghe câu này"
                >
                  {tokens.map((tok) => {
                    if (tok.isPunctuation) {
                      return (
                        <span
                          key={`punc-${sentence.id}-${tok.id}`}
                          className={`${mainTextSize} font-bold text-zinc-300 select-text inline-block align-bottom px-[0.5px]`}
                        >
                          {tok.text}
                        </span>
                      );
                    }

                    const isCurrentWord =
                      isActive &&
                      currentTimeMs >= tok.startTimeMs &&
                      currentTimeMs < tok.endTimeMs;

                    const isPassedWord =
                      isActive &&
                      currentTimeMs >= tok.endTimeMs;

                    const isUpcomingWord =
                      isActive &&
                      currentTimeMs < tok.startTimeMs;

                    const hasKanji = /[\u4e00-\u9faf]/.test(tok.text);
                    const pos: PosType = detectWordPos(tok.text, tok.text, posMap, vocabularyList);
                    const isNoun = pos === 'noun';
                    const isVerb = pos === 'verb';
                    const isColoredWord = hasKanji || !!tok.furigana || tok.text.length > 1 || isNoun || isVerb;

                    let wordStyle = 'border-b-2 border-transparent text-zinc-100';
                    if (showPosHighlight) {
                      if (isNoun) {
                        wordStyle = 'border-b-2 border-sky-400 text-sky-300 font-bold group-hover:text-sky-200';
                      } else if (isVerb) {
                        wordStyle = 'border-b-2 border-orange-400 text-orange-400 font-bold group-hover:text-orange-200';
                      } else if (isColoredWord) {
                        wordStyle = 'border-b-2 border-cyan-400/60 text-zinc-100 group-hover:text-amber-200';
                      }
                    } else if (isColoredWord) {
                      wordStyle = 'border-b-2 border-cyan-400 group-hover:text-amber-200';
                    }

                    return (
                      <span
                        key={`tok-${sentence.id}-${tok.id}`}
                        onClick={(e) => {
                          if (onWordClick && isColoredWord) {
                            e.stopPropagation();
                            onWordClick({
                              word: tok.text,
                              furigana: tok.furigana,
                              partOfSpeech: isNoun ? 'danh từ' : isVerb ? 'động từ' : undefined
                            });
                          }
                        }}
                        className={`inline-flex flex-col items-center justify-end leading-none align-bottom mx-[1.5px] my-[1px] relative transition-all duration-150 ${
                          isColoredWord ? 'cursor-pointer group' : 'cursor-default'
                        } ${isCurrentWord ? 'z-10' : ''}`}
                        title={isNoun ? 'Danh từ (Noun)' : isVerb ? 'Động từ (Verb)' : undefined}
                      >
                        {/* Furigana */}
                        <span
                          className={`${furiganaTextSize} select-none pb-0.5 tracking-normal whitespace-nowrap text-center block transition-all duration-150 ${
                            showFurigana && tok.furigana ? 'opacity-100' : 'opacity-0 pointer-events-none'
                          } ${
                            isCurrentWord
                              ? 'text-amber-200 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]'
                              : isPassedWord
                              ? 'text-zinc-200 font-medium'
                              : 'text-zinc-400 font-medium'
                          }`}
                          style={{ minHeight: minFuriHeight }}
                        >
                          {tok.furigana || '\u00A0'}
                        </span>

                        {/* Word Text */}
                        <span
                          className={`${mainTextSize} tracking-normal inline-block transition-all duration-150 pb-0.5 rounded-md px-1.5 py-0.5 ${
                            isCurrentWord
                              ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_14px_rgba(251,191,36,0.65)] ring-1.5 ring-amber-300'
                              : isPassedWord
                              ? 'text-white font-bold'
                              : isUpcomingWord
                              ? 'text-zinc-300/80 font-medium'
                              : wordStyle
                          }`}
                        >
                          {tok.text}
                        </span>
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* Active Sentence Translation (Subtle bottom bar if translation enabled) */}
      {showVietnamese && activeSentence && activeSentence.vietnamese && (
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium flex items-start gap-2 shadow-xs">
          <span className="text-amber-400 font-bold shrink-0">Dịch:</span>
          <span>{activeSentence.vietnamese}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(AudioFollowReader);
