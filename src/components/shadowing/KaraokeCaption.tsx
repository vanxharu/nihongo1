import React from 'react';
import { ShadowingAnalysis, ShadowingTextTiming, shadowingTextFill, karaokeVisualFill, validShadowingTimings, currentShadowingWord } from '../../utils/shadowing';
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;

function KaraokeCaption({ text, time, start, end, timings, analysis, furigana, variant = 'stage' }: {
  text: string; time: number; start: number | null; end: number | null;
  timings?: ShadowingTextTiming[];
  analysis: ShadowingAnalysis | null; furigana: boolean;
  variant?: 'stage' | 'transcript';
}) {
  const measured = validShadowingTimings({ id: '', text, start, end, timings }) ? timings! : [];
  const words = [...(analysis?.readings || analysis?.vocabulary || [])].filter(v => v.word).sort((a, b) => b.word.length - a.word.length);
  const pieces: { text: string; reading?: string; offset: number }[] = [];
  for (let offset = 0; offset < text.length;) {
    // Prefer a reading whose offset matches exactly (disambiguates homographs like 人 ひと/じん).
    const word = words.find(v => text.startsWith(v.word, offset) && (v as any).offset === offset)
      ?? words.find(v => text.startsWith(v.word, offset) && (v as any).offset === undefined)
      ?? words.find(v => text.startsWith(v.word, offset));
    const segment = segmenter?.segment(text.slice(offset))[Symbol.iterator]().next().value?.segment;
    const piece = word?.word || segment || String.fromCodePoint(text.codePointAt(offset)!);
    if (pieces.length && /^[、。，．！？!?…]+$/.test(piece)) {
      pieces[pieces.length - 1].text += piece;
    } else {
      pieces.push({ text: piece, reading: word?.reading, offset });
    }
    offset += piece.length;
  }
  // Visual-only fallback for captions without measured word onsets; never saved as alignment.
  const weights = pieces.map(piece => Math.max(1, Array.from(piece.reading || piece.text).length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let weight = 0;
  const estimated: ShadowingTextTiming[] = start !== null && end !== null && end > start ? pieces.map((piece, i) => {
    const from = start + (end - start) * weight / totalWeight;
    weight += weights[i];
    return { text: piece.text, textStart: piece.offset, textEnd: piece.offset + piece.text.length, start: from, end: start + (end - start) * weight / totalWeight };
  }) : [];
  const visual = measured.length ? measured : estimated;
  const current = currentShadowingWord(time, end, visual);
  return <p lang="ja" aria-label={text} data-timing={measured.length ? 'measured' : 'estimated'} className={`karaoke-line karaoke-${variant}`}>
    {pieces.map(piece => {
      let offset = piece.offset;
      const activePiece = current && piece.offset < current.textEnd && piece.offset + piece.text.length > current.textStart;
      return <span className={`karaoke-token${activePiece ? ' karaoke-token-active' : ''}`} key={piece.offset}><ruby><span className="karaoke-word">{Array.from(piece.text).map(char => {
        const charOffset = offset; offset += char.length;
        const spoken = shadowingTextFill(time, charOffset, visual) === 100;
        const active = current && charOffset >= current.textStart && charOffset < current.textEnd;
        const fill = karaokeVisualFill(time, charOffset, visual, end);
        return <span key={charOffset} style={{ '--karaoke-fill': `${fill}%` } as React.CSSProperties} className={`karaoke-char${spoken ? ' is-spoken' : ''}${active ? ' is-current' : ''}`}>{char}</span>;
      })}</span>{furigana && piece.reading && piece.reading !== piece.text && <rt>{piece.reading}</rt>}</ruby></span>;
    })}
  </p>;
}

export default React.memo(KaraokeCaption, (a, b) =>
  a.text === b.text && a.time === b.time && a.start === b.start && a.end === b.end &&
  a.timings === b.timings && a.furigana === b.furigana && a.variant === b.variant &&
  a.analysis?.readings === b.analysis?.readings &&
  (a.analysis?.readings !== undefined || a.analysis?.vocabulary === b.analysis?.vocabulary));
