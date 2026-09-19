import React, { useMemo } from 'react';
import { getSentenceFuriganaParts, hasKanji, alignWordFurigana, findBestFuriganaPartition, tokenizeWithFurigana } from '../utils/japaneseUtils';
import { getKanjiCategory } from '../utils/kanjiHelper';

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
        <span key={`delim-${s}`} className="inline-flex flex-col items-center justify-end leading-none text-center">
          <span className="text-[0.55em] sm:text-[0.58em] leading-none opacity-0 select-none pb-[0.2em] tracking-normal whitespace-nowrap text-center block pointer-events-none">
            &nbsp;
          </span>
          <span className={`leading-none ${sizeClassName} ${textColorClassName}`}>
            {seg}
          </span>
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
      <span key={`seg-${s}`} className="inline-flex items-end justify-center flex-nowrap">
        {(alignedParts || []).map((part, pIdx) => {
          if (!part || !part.text) return null;
          if (part.furigana) {
            return (
              <span
                key={pIdx}
                className="inline-flex flex-col items-center justify-end leading-none text-center"
              >
                <span className={`text-[0.55em] sm:text-[0.58em] leading-none ${furiganaColorClassName} font-jp font-bold select-none pb-[0.2em] tracking-normal whitespace-nowrap text-center block`}>
                  {part.furigana}
                </span>
                <span className={`leading-none ${sizeClassName} ${textColorClassName}`}>
                  {part.text || ''}
                </span>
              </span>
            );
          }

          return (
            <span
              key={pIdx}
              className="inline-flex flex-col items-center justify-end leading-none text-center"
            >
              <span className="text-[0.55em] sm:text-[0.58em] leading-none opacity-0 select-none pb-[0.2em] tracking-normal whitespace-nowrap text-center block pointer-events-none">
                &nbsp;
              </span>
              <span className={`leading-none ${sizeClassName} ${textColorClassName}`}>
                {part.text || ''}
              </span>
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-end justify-center flex-nowrap max-w-full font-bold ${textColorClassName} tracking-wide ${className}`}>
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
  if (!sentence) return null;

  if (!showFurigana || (!hasKanji(sentence) && !sentence.includes('<ruby>') && !sentence.includes('<rt>') && !sentence.includes('['))) {
    const plainText = sentence
      .replace(/<rt>.*?<\/rt>|<rp>.*?<\/rp>|<\/?[a-z]+[^>]*>/gi, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\[([^\]]+)\]\[[^\]]+\]/g, '$1')
      .replace(/\{([^|]+)\|[^}]+\}/g, '$1');
    return (
      <span className={`inline-block font-jp font-bold whitespace-pre-line ${forceDark ? 'text-white' : 'text-slate-900 dark:text-white'} ${className}`}>
        {plainText}
      </span>
    );
  }

  const parts = useMemo(() => {
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
  }, [sentence, currentItem, vocabData]);

  // Font size configuration
  let mainTextSize = 'text-base sm:text-lg';
  let furiganaTextSize = 'text-[9px] sm:text-[10px]';
  let minHeight = '1.15em';

  if (size === 'xs') {
    mainTextSize = 'text-xs';
    furiganaTextSize = 'text-[7.5px]';
    minHeight = '1.0em';
  } else if (size === 'sm') {
    mainTextSize = 'text-sm';
    furiganaTextSize = 'text-[8.5px]';
    minHeight = '1.1em';
  } else if (size === 'lg') {
    mainTextSize = 'text-lg sm:text-xl';
    furiganaTextSize = 'text-[10px] sm:text-[11px]';
    minHeight = '1.2em';
  } else if (size === 'xl') {
    mainTextSize = 'text-xl sm:text-2xl';
    furiganaTextSize = 'text-[11px] sm:text-[12px]';
    minHeight = '1.25em';
  } else if (size === '2xl') {
    mainTextSize = 'text-2xl sm:text-3xl';
    furiganaTextSize = 'text-[12px] sm:text-[13px]';
    minHeight = '1.3em';
  } else if (size === '3xl') {
    mainTextSize = 'text-3xl sm:text-4xl';
    furiganaTextSize = 'text-[13px] sm:text-[14px]';
    minHeight = '1.35em';
  }

  return (
    <span className={`inline-flex items-end flex-wrap leading-none gap-y-1.5 align-bottom font-jp ${className}`}>
      {parts.map((part, index) => {
        if (!part || !part.text) return null;
        if (part.text === '\n') {
          return <span key={index} className="basis-full h-1 block select-none" />;
        }

        const containsKanji = hasKanji(part.text || '');

        if (containsKanji && part.furigana) {
          const readings = findBestFuriganaPartition(part.text, part.furigana);
          const tokens = tokenizeWithFurigana(part.text, readings);

          return (
            <span
              key={index}
              className="inline-flex items-end leading-none align-bottom mx-0"
            >
              {tokens.map((token, tIdx) => {
                if (token.type === 'kanji' && token.reading) {
                  return (
                    <span
                      key={tIdx}
                      className="inline-flex flex-col items-center justify-end leading-none align-bottom mx-0"
                    >
                      {/* Furigana Reading */}
                      <span
                        className={`${furiganaTextSize} font-bold text-[#43EEF7] select-none pb-0.5 tracking-normal whitespace-nowrap text-center block ${furiganaClassName}`}
                        style={{ minHeight }}
                      >
                        {token.reading}
                      </span>
                      {/* Kanji Character */}
                      <span
                        className={`${mainTextSize} font-bold ${forceDark ? 'text-white' : 'text-slate-900 dark:text-white'} ${kanjiClassName} inline-flex items-center leading-none tracking-normal`}
                      >
                        {onClickKanji ? (
                          <span
                            onClick={() => onClickKanji(token.text)}
                            className="cursor-pointer hover:text-amber-300 transition-colors"
                          >
                            {token.text}
                          </span>
                        ) : (
                          token.text
                        )}
                      </span>
                    </span>
                  );
                }

                // Kana character inside compound
                return (
                  <span
                    key={tIdx}
                    className="inline-flex flex-col items-center justify-end leading-none align-bottom mx-0"
                  >
                    <span
                      className={`${furiganaTextSize} invisible select-none pb-0.5 block whitespace-nowrap`}
                      style={{ minHeight }}
                    >
                      &nbsp;
                    </span>
                    <span
                      className={`${mainTextSize} font-medium ${forceDark ? 'text-slate-100' : 'text-slate-800 dark:text-slate-100'} px-0 ${textClassName}`}
                    >
                      {token.text}
                    </span>
                  </span>
                );
              })}
            </span>
          );
        }

        // Kana or punctuation token (without Furigana)
        return (
          <span
            key={index}
            className="inline-flex flex-col items-center justify-end leading-none align-bottom mx-px"
          >
            {/* Invisible spacer ensuring 100% stable baseline */}
            <span
              className={`${furiganaTextSize} invisible select-none pb-0.5 block whitespace-nowrap`}
              style={{ minHeight }}
            >
              &nbsp;
            </span>
            {/* Text */}
            <span
              className={`${mainTextSize} font-medium ${forceDark ? 'text-slate-100' : 'text-slate-800 dark:text-slate-100'} px-px ${textClassName}`}
            >
              {part.text || ''}
            </span>
          </span>
        );
      })}
    </span>
  );
}

const JapaneseFuriganaText = React.memo(JapaneseFuriganaTextComponent);
export default JapaneseFuriganaText;
