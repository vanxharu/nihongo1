import React from 'react';
import { ShadowingAnalysis, karaokeProgress } from '../../utils/shadowing';
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;

export default function KaraokeCaption({ text, time, start, end, analysis, furigana }: {
  text: string; time: number; start: number | null; end: number | null;
  analysis: ShadowingAnalysis | null; furigana: boolean;
}) {
  const progress = karaokeProgress(time, start, end);
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
      const fill = Math.max(0, Math.min(1, (progress * text.length - piece.offset) / piece.text.length)) * 100;
      return <ruby key={piece.offset}><span style={{ backgroundImage: `linear-gradient(to right, #a99aff ${fill}%, #f1f5f9 ${fill}%)`, backgroundClip: 'text', color: 'transparent' }}>{piece.text}</span>{furigana && piece.reading && piece.reading !== piece.text && <rt>{piece.reading}</rt>}</ruby>;
    })}
  </p>;
}
