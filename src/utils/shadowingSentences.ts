import { validShadowingTimings } from './shadowing.js';
import type { ShadowingCue } from './shadowing.js';

export interface SentenceToken {
  text: string; start: number; sourceEnd: number; measured: boolean; lastInSource: boolean;
}
export interface SentenceGroup { endToken: number; sourceText: string; translation: string }

/** Only native word boundaries or whole untimed captions are safe split points. */
export function sentenceTokens(cues: ShadowingCue[]): SentenceToken[] {
  return cues.flatMap<SentenceToken>(cue => {
    if (cue.start === null || cue.end === null) throw new Error('Missing source time');
    if (!validShadowingTimings(cue)) return [{ text: cue.text, start: cue.start, sourceEnd: cue.end, measured: false, lastInSource: true }];
    return cue.timings!.map((word, i) => ({ text: word.text, start: word.start, sourceEnd: cue.end!, measured: true, lastInSource: i === cue.timings!.length - 1 }));
  });
}

/** Rebuild text and offsets from trusted tokens, never from AI timestamps or rewritten text. */
export function sentenceGroups(tokens: SentenceToken[], groups: SentenceGroup[], from = 0): ShadowingCue[] {
  let cursor = from;
  return groups.map(group => {
    if (!Number.isInteger(group.endToken) || group.endToken < cursor || group.endToken >= tokens.length ||
        typeof group.translation !== 'string' || !group.translation.trim()) throw new Error('Invalid sentence range');
    const pieces = tokens.slice(cursor, group.endToken + 1);
    const text = pieces.map(p => p.text).join('');
    if (typeof group.sourceText !== 'string' || text.replace(/\s/g, '') !== group.sourceText.replace(/\s/g, '') || !text.trim() || text.length > 1000) throw new Error(`Sentence does not match its source: ${JSON.stringify({ from: cursor, to: group.endToken, expected: text.slice(0, 90), returned: group.sourceText?.slice(0, 90) })}`);
    const last = pieces[pieces.length - 1];
    const next = tokens[group.endToken + 1];
    const end = next ? last.lastInSource ? Math.min(last.sourceEnd, next.start) : next.start : last.sourceEnd;
    if (end <= pieces[0].start) throw new Error('No measured boundary for this sentence');
    const cue: ShadowingCue = { id: `sentence-${cursor}-${group.endToken}`, text, start: pieces[0].start, end, translation: group.translation.trim() };
    if (pieces.every(p => p.measured)) {
      let offset = 0;
      cue.timings = pieces.map(p => {
        const timing = { text: p.text, textStart: offset, textEnd: offset + p.text.length, start: p.start, end: p.start };
        offset += p.text.length; return timing;
      });
      if (!validShadowingTimings(cue)) throw new Error('Sentence lost native word timing');
    }
    cursor = group.endToken + 1;
    return cue;
  });
}
