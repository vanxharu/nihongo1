import React from 'react';
import { ShadowingAnalysis, ShadowingTextTiming, shadowingTextFill, karaokeVisualFill, validShadowingTimings, currentShadowingWord } from '../../utils/shadowing';
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;

function KaraokeCaption({ text, time, start, end, timings, analysis, furigana }: {
  text: string; time: number; start: number | null; end: number | null;
  timings?: ShadowingTextTiming[];
  analysis: ShadowingAnalysis | null; furigana: boolean;
}) {
  const measured = validShadowingTimings({ id: '', text, start, end, timings }) ? timings! : [];
  const current = currentShadowingWord(time, end, measured);
  const words = [...(analysis?.readings || analysis?.vocabulary || [])].filter(v => v.word).sort((a, b) => b.word.length - a.word.length);
  const pieces: { text: string; reading?: string; offset: number }[] = [];
  for (let offset = 0; offset < text.length;) {
    const word = words.find(v => text.startsWith(v.word, offset));
    const segment = segmenter?.segment(text.slice(offset))[Symbol.iterator]().next().value?.segment;
    const piece = word?.word || segment || String.fromCodePoint(text.codePointAt(offset)!);
    pieces.push({ text: piece, reading: word?.reading, offset });
    offset += piece.length;
  }
  return <p lang="ja" aria-label={text} className={`karaoke-line ${!measured.length && start !== null && end !== null && time >= start && time < end ? 'karaoke-sentence-active' : ''}`}>
    {pieces.map(piece => {
      let offset = piece.offset;
      return <ruby key={piece.offset}><span className="karaoke-word">{Array.from(piece.text).map(char => {
        const charOffset = offset; offset += char.length;
        const spoken = shadowingTextFill(time, charOffset, measured) === 100;
        const active = current && charOffset >= current.textStart && charOffset < current.textEnd;
        const fill = karaokeVisualFill(time, charOffset, measured, end);
        return <span key={charOffset} style={{ '--karaoke-fill': `${fill}%` } as React.CSSProperties} className={`karaoke-char${spoken ? ' is-spoken' : ''}${active ? ' is-current' : ''}`}>{char}</span>;
      })}</span>{furigana && piece.reading && piece.reading !== piece.text && <rt>{piece.reading}</rt>}</ruby>;
    })}
  </p>;
}

export default React.memo(KaraokeCaption, (a, b) =>
  a.text === b.text && a.time === b.time && a.start === b.start && a.end === b.end &&
  a.timings === b.timings && a.furigana === b.furigana &&
  a.analysis?.readings === b.analysis?.readings &&
  (a.analysis?.readings !== undefined || a.analysis?.vocabulary === b.analysis?.vocabulary));
