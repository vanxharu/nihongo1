import React, { useMemo } from 'react';
import { getSentenceFuriganaParts, hasKanji, alignWordFurigana, findBestFuriganaPartition, tokenizeWithFurigana } from '../utils/japaneseUtils';
import { getKanjiCategory } from '../utils/kanjiHelper';

import { clickOnKey } from '../utils/a11y';
export interface SelectiveFuriganaWordProps {
  kanji?: string | null;
  hiragana?: string | null;
  showFurigana?: boolean;
  sizeClassName?: string;
  textColorClassName?: string;
  furiganaColorClassName?: string;
  className?: string;
}

function SelectiveFuriganaWordComponent({
  kanji,
  hiragana,
  showFurigana = true,
  sizeClassName = "text-2xl sm:text-3xl md:text-4xl",
  textColorClassName = "text-white",
  furiganaColorClassName = "text-[#43EEF7]",
  className = ""
}: SelectiveFuriganaWordProps) {
  const mainText = kanji || hiragana || '';
  if (!mainText) return null;

  const hira = (hiragana || '')
    .replace(/\[.*?\]/g, '')
    .replace(/（.*?）/g, '')
    .replace(/～/g, '')
    .trim();
  const containsKanji = kanji && /[\u4e00-\u9faf\u3400-\u4dbf]/.test(kanji);

  if (!containsKanji || !showFurigana || !hira) {
    return (
      <span className={`inline-block font-bold ${textColorClassName} tracking-wide ${sizeClassName} ${className}`}>
        {mainText}
      </span>
    );
  }

  // Handle multiple comma/slash separated kanji representations (e.g. 探します、捜します or 見ます、診ます)
  const segments = kanji!.split(/([、,／/])/);
  const hiraParts = hira.split(/[、,／/]/).map(p => p.trim()).filter(Boolean);

  const renderedSegments: React.ReactNode[] = [];
  let subWordIndex = 0;

  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s];
    if (!seg) continue;

    if (seg === '、' || seg === ',' || seg === '/' || seg === '／') {
      renderedSegments.push(
        <span key={`delim-${s}`} className={`${sizeClassName} ${textColorClassName}`}>
          {seg}
        </span>
      );
      continue;
    }

    // Determine the reading for this segment
    let segReading = hiraParts[subWordIndex] || hiraParts[0] || hira;
    subWordIndex++;

    // If sub-word is a dictionary form (e.g. 探す) but reading is masu-form (さがします), adapt stem
    if (seg.endsWith('す') && !seg.endsWith('ます') && segReading.endsWith('します')) {
      segReading = segReading.slice(0, -3) + 'す';
    } else if (seg.endsWith('る') && !seg.endsWith('ます') && segReading.endsWith('ます')) {
      segReading = segReading.slice(0, -2) + 'る';
    }

    const alignedParts = alignWordFurigana(seg, segReading);

    renderedSegments.push(
      <span key={`seg-${s}`} className={`inline-block max-w-full ${sizeClassName} ${textColorClassName}`}>
        {(alignedParts || []).map((part, pIdx) => {
          if (!part || !part.text) return null;
          if (part.furigana) {
            return (
              <ruby
                key={pIdx}
                className="font-bold"
              >
                {part.text || ''}
                <rt className={`${furiganaColorClassName} font-bold select-none tracking-normal`}>
                  {part.furigana}
                </rt>
              </ruby>
            );
          }

          return (
            <span
              key={pIdx}
              className="font-bold"
            >
              {part.text || ''}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span lang="ja" className={`selective-furigana-word inline-flex flex-wrap items-baseline justify-center max-w-full font-bold ${textColorClassName} tracking-wide ${className}`}>
      {renderedSegments}
    </span>
  );
}

export const SelectiveFuriganaWord = React.memo(SelectiveFuriganaWordComponent);

interface JapaneseFuriganaTextProps {
  sentence: string;
  showFurigana?: boolean;
  className?: string;
  kanjiClassName?: string;
  furiganaClassName?: string;
  textClassName?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  forceDark?: boolean;
  highlightStructure?: string;
  onClickKanji?: (kanji: string) => void;
  currentItem?: { kanji?: string | null; hiragana?: string | null; word?: string; reading?: string } | null;
  vocabData?: any[];
}

function JapaneseFuriganaTextComponent({
  sentence,
  showFurigana = true,
  className = '',
  kanjiClassName = '',
  furiganaClassName = '',
  textClassName = '',
  size = 'base',
  forceDark = true,
  highlightStructure,
  onClickKanji,
  currentItem,
  vocabData
}: JapaneseFuriganaTextProps) {
  // Hooks must run before any early return (showFurigana/sentence can change on a mounted instance).
  const parts = useMemo(() => {
    if (!sentence || !showFurigana) return [];
    const rawParts = getSentenceFuriganaParts(
      sentence,
      currentItem ? { kanji: currentItem.kanji || currentItem.word, hiragana: currentItem.hiragana || currentItem.reading } : {},
      vocabData
    );
    return (rawParts || []).flatMap((part) => {
      if (!part || !part.text) return [];
      if (part.furigana && hasKanji(part.text || '')) {
        return alignWordFurigana(part.text || '', part.furigana || '');
      }
      return [part];
    });
  }, [sentence, showFurigana, currentItem, vocabData]);

  if (!sentence) return null;

  if (!showFurigana || (!hasKanji(sentence) && !sentence.includes('<ruby>') && !sentence.includes('<rt>') && !sentence.includes('['))) {
    const plainText = sentence
      .replace(/<rt>.*?<\/rt>|<rp>.*?<\/rp>|<\/?[a-z]+[^>]*>/gi, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\[([^\]]+)\]\[[^\]]+\]/g, '$1')
      .replace(/\{([^|]+)\|[^}]+\}/g, '$1');
    return (
      <span lang="ja" className={`inline-block font-jp font-bold whitespace-pre-line ${forceDark ? 'text-white' : 'text-slate-900 dark:text-white'} ${className}`}>
        {plainText}
      </span>
    );
  }

  // Font size configuration
  let mainTextSize = 'text-base sm:text-lg';
  let furiganaTextSize = 'text-[11px] sm:text-xs';

  if (size === 'xs') {
    mainTextSize = 'text-xs';
    furiganaTextSize = 'text-[10px]';
  } else if (size === 'sm') {
    mainTextSize = 'text-sm';
    furiganaTextSize = 'text-[10.5px]';
  } else if (size === 'lg') {
    mainTextSize = 'text-lg sm:text-xl';
    furiganaTextSize = 'text-[11px] sm:text-xs';
  } else if (size === 'xl') {
    mainTextSize = 'text-xl sm:text-2xl';
    furiganaTextSize = 'text-[11px] sm:text-[12px]';
  } else if (size === '2xl') {
    mainTextSize = 'text-2xl sm:text-3xl';
    furiganaTextSize = 'text-[12px] sm:text-[13px]';
  } else if (size === '3xl') {
    mainTextSize = 'text-3xl sm:text-4xl';
    furiganaTextSize = 'text-[13px] sm:text-[14px]';
  }

  // Native <ruby> in one inline text flow: all glyphs share one baseline (no bobbing).
  const kanaCls = `${mainTextSize} font-bold ${forceDark ? 'text-slate-100' : 'text-slate-800 dark:text-slate-100'} ${textClassName}`;
  const kanjiCls = `${mainTextSize} font-bold ${forceDark ? 'text-white' : 'text-slate-900 dark:text-white'} ${kanjiClassName}`;
  // Textbook word-spacing ("日本の 小学校は") is dropped next to Japanese chars; kept between latin/digits.
  const tidy = (s: string) => s.replace(/(?<=[^\x00-\x7F]) +| +(?=[^\x00-\x7F])/g, '');

  return (
    <span lang="ja" className={`font-jp leading-[2.1] ${className}`}>
      {parts.map((part, index) => {
        if (!part || !part.text) return null;
        if (part.text === '\n') return <br key={index} />;
        if (hasKanji(part.text) && part.furigana) {
          const readings = findBestFuriganaPartition(part.text, part.furigana);
          return tokenizeWithFurigana(part.text, readings).map((token, tIdx) => {
            if (token.type !== 'kanji' || !token.reading) return <span key={`${index}-${tIdx}`} className={kanaCls}>{tidy(token.text)}</span>;
            return (
              <ruby key={`${index}-${tIdx}`} className={kanjiCls}>
                {onClickKanji ? (
                  <span role="button" tabIndex={0} onKeyDown={clickOnKey} onClick={() => onClickKanji(token.text)} className="cursor-pointer hover:text-amber-300 transition-colors">{token.text}</span>
                ) : token.text}
                <rt className={`${furiganaTextSize} font-bold text-[#43EEF7] select-none tracking-normal ${furiganaClassName}`}>{token.reading}</rt>
              </ruby>
            );
          });
        }
        return <span key={index} className={kanaCls}>{tidy(part.text)}</span>;
      })}
    </span>
  );
}

const JapaneseFuriganaText = React.memo(JapaneseFuriganaTextComponent);
export default JapaneseFuriganaText;
