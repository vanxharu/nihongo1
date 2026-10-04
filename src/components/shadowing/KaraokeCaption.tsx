import React from 'react';
import { ShadowingAnalysis, ShadowingTextTiming, shadowingTextFill, validShadowingTimings } from '../../utils/shadowing';
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;

export default function KaraokeCaption({ text, time, start, end, timings, analysis, furigana }: {
  text: string; time: number; start: number | null; end: number | null;
  timings?: ShadowingTextTiming[];
  analysis: ShadowingAnalysis | null; furigana: boolean;
}) {
  const measured = validShadowingTimings({ id: '', text, start, end, timings }) ? timings! : [];
  const words = [...(analysis?.vocabulary || [])].filter(v => v.word).sort((a, b) => b.word.length - a.word.length);
  const pieces: { text: string; reading?: string; offset: number }[] = [];
  for (let offset = 0; offset < text.length;) {
    const word = words.find(v => text.startsWith(v.word, offset));
    const segment = segmenter?.segment(text.slice(offset))[Symbol.iterator]().next().value?.segment;
    const piece = word?.word || segment || String.fromCodePoint(text.codePointAt(offset)!);
    pieces.push({ text: piece, reading: word?.reading, offset });
    offset += piece.length;
  }
  return <p lang="ja" aria-label={text} className="karaoke-line">
    {pieces.map(piece => {
      let offset = piece.offset;
      return <ruby key={piece.offset}>{Array.from(piece.text).map(char => {
        const charOffset = offset; offset += char.length;
        const spoken = shadowingTextFill(time, charOffset, measured) === 100;
        return <span key={charOffset} style={{ color: spoken ? '#a99aff' : '#f1f5f9' }}>{char}</span>;
      })}{furigana && piece.reading && piece.reading !== piece.text && <rt>{piece.reading}</rt>}</ruby>;
    })}
  </p>;
}
