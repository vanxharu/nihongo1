import React from 'react';
import { StudyBookQuestion } from '../types';

/**
 * Automatically infers the target word being tested in a question if not explicitly marked.
 */
export function inferTargetWordFromQuestion(question: {
  question: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  targetWord?: string;
}): string | null {
  if (question.targetWord) return question.targetWord;

  const text = question.question;
  if (!text) return null;

  // If question already contains blanks, it is a fill-in-the-blank question, not an underlined word question
  if (text.includes('＿') || text.includes('（') || text.includes('(') || text.includes('___')) {
    return null;
  }

  // Check for explicit markup inside the string
  const uMatch = text.match(/<u>(.*?)<\/u>/i) || text.match(/<ins>(.*?)<\/ins>/i);
  if (uMatch && uMatch[1]) return uMatch[1];

  const bracketMatch = text.match(/【(.*?)】/);
  if (bracketMatch && bracketMatch[1] && !bracketMatch[1].includes('\n') && bracketMatch[1].length <= 20) {
    return bracketMatch[1];
  }

  const mdMatch = text.match(/__(.*?)__/);
  if (mdMatch && mdMatch[1]) return mdMatch[1];

  // Try extracting from explanation
  const expl = question.explanation || '';
  if (expl) {
    // Pattern: "WORD (READING: meaning)" e.g. "会社員 (かいしゃいん: nhân viên công ty)" or "人口 (じんこう: dân số)"
    const wordPairs = Array.from(expl.matchAll(/([一-龯ぁ-んァ-ヶー々A-Za-z]+)\s*[（\(]([ぁ-んァ-ヶー・／/、\s]+)[：:\)]/g));
    for (const match of wordPairs) {
      const w1 = match[1];
      const w2Clean = match[2].replace(/[・／/、\s]/g, '');
      if (w1 && text.includes(w1) && w1.length >= 1) {
        return w1;
      }
      if (w2Clean && text.includes(w2Clean) && w2Clean.length >= 1) {
        return w2Clean;
      }
      // Also test split parts of reading (e.g. stem of verbs)
      const stems = match[2].split(/[・／/、]/).map(s => s.trim()).filter(Boolean);
      for (const stem of stems) {
        if (stem.length >= 2 && text.includes(stem)) {
          // Extract the full matching verb/word from question text
          const regex = new RegExp(stem + '[ぁ-ん]*');
          const m = text.match(regex);
          if (m) return m[0];
        }
      }
    }

    // Check if correct option is directly in text
    if (question.options && typeof question.correctIndex === 'number') {
      const correctOpt = question.options[question.correctIndex]?.trim();
      if (correctOpt && correctOpt.length >= 2 && text.includes(correctOpt)) {
        return correctOpt;
      }
    }
  }

  return null;
}

/**
 * Renders a question text with the target word clearly underlined in authentic JLPT exam booklet style.
 */
export function renderStudyQuestionText(
  question: StudyBookQuestion | { question: string; options?: string[]; correctIndex?: number; explanation?: string; targetWord?: string },
  customUnderlineClassName?: string
): React.ReactNode {
  const rawText = question?.question;
  if (!rawText) return null;

  // 1. If explicit <u> or <ins> tags are used in the question text
  if (/<u\b[^>]*>(.*?)<\/u>/i.test(rawText) || /<ins\b[^>]*>(.*?)<\/ins>/i.test(rawText)) {
    const parts = rawText.split(/(<u\b[^>]*>.*?<\/u>|<ins\b[^>]*>.*?<\/ins>)/gi);
    return (
      <span className="whitespace-pre-line">
        {parts.map((part, idx) => {
          const match = part.match(/<u\b[^>]*>(.*?)<\/u>/i) || part.match(/<ins\b[^>]*>(.*?)<\/ins>/i);
          if (match) {
            return (
              <u
                key={idx}
                className={customUnderlineClassName || "font-extrabold underline decoration-[2.5px] decoration-current underline-offset-[5px] inline tracking-normal text-inherit px-0.5 rounded-xs"}
                title="Từ cần xác định (gạch chân theo đề thi)"
              >
                {match[1]}
              </u>
            );
          }
          return <React.Fragment key={idx}>{part}</React.Fragment>;
        })}
      </span>
    );
  }

  // 2. If explicit brackets 【...】 are used to denote the target word inside the question
  if (/【[^】\n]+】/.test(rawText)) {
    const parts = rawText.split(/(【[^】\n]+】)/g);
    return (
      <span className="whitespace-pre-line">
        {parts.map((part, idx) => {
          if (part.startsWith('【') && part.endsWith('】')) {
            const innerWord = part.slice(1, -1);
            return (
              <u
                key={idx}
                className={customUnderlineClassName || "font-extrabold underline decoration-[2.5px] decoration-current underline-offset-[5px] inline tracking-normal text-inherit px-0.5 rounded-xs"}
                title="Từ cần xác định (gạch chân theo đề thi)"
              >
                {innerWord}
              </u>
            );
          }
          return <React.Fragment key={idx}>{part}</React.Fragment>;
        })}
      </span>
    );
  }

  // 3. If explicit __word__ is used
  if (/__[^_\n]+__/.test(rawText)) {
    const parts = rawText.split(/(__[^_\n]+__)/g);
    return (
      <span className="whitespace-pre-line">
        {parts.map((part, idx) => {
          if (part.startsWith('__') && part.endsWith('__')) {
            const innerWord = part.slice(2, -2);
            return (
              <u
                key={idx}
                className={customUnderlineClassName || "font-extrabold underline decoration-[2.5px] decoration-current underline-offset-[5px] inline tracking-normal text-inherit px-0.5 rounded-xs"}
                title="Từ cần xác định (gạch chân theo đề thi)"
              >
                {innerWord}
              </u>
            );
          }
          return <React.Fragment key={idx}>{part}</React.Fragment>;
        })}
      </span>
    );
  }

  // 4. If targetWord is defined or inferred
  const target = inferTargetWordFromQuestion(question);
  if (target && rawText.includes(target)) {
    const targetIdx = rawText.indexOf(target);
    const before = rawText.slice(0, targetIdx);
    const after = rawText.slice(targetIdx + target.length);

    return (
      <span className="whitespace-pre-line">
        {before}
        <u
          className={customUnderlineClassName || "font-extrabold underline decoration-[2.5px] decoration-current underline-offset-[5px] inline tracking-normal text-inherit px-0.5 rounded-xs"}
          title="Từ cần xác định (gạch chân theo đề thi)"
        >
          {target}
        </u>
        {after}
      </span>
    );
  }

  // 5. Default: render plain text
  return <span className="whitespace-pre-line">{rawText}</span>;
}
