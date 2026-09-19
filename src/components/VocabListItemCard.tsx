import React, { useMemo } from 'react';
import { Star, Volume2, CheckSquare, Square, Plus, ArrowLeftRight, Equal, Info } from 'lucide-react';
import { VocabularyItem } from '../types';
import {
  alignWordFurigana,
  cleanVocabSymbols,
  findBestFuriganaPartition,
  getHanViet,
  ensureVocabExample,
} from '../utils/japaneseUtils';
import { getKanjiCategory } from '../utils/kanjiHelper';
import { getKanjiAssociativeColor } from '../utils/associativeColorHelper';
import PitchAccentDisplay from './PitchAccentDisplay';
import JapaneseFuriganaText from './JapaneseFuriganaText';

interface VocabListItemCardProps {
  v: VocabularyItem;
  index: number;
  isWordStarred: boolean;
  isMastered?: boolean;
  showPitchAccent: boolean;
  onToggleStar: (id: string) => void;
  onToggleMastered?: (id: string) => void;
  onSpeak: (text: string) => void;
  onSelectKanji?: (kanji: string) => void;
}

export function getPartOfSpeechBadge(v: VocabularyItem): string {
  if (v.partOfSpeech) return v.partOfSpeech;
  if (v.wordType) {
    if (v.wordType.includes('名') || v.wordType.toLowerCase().includes('noun')) return '名';
    if (v.wordType.includes('動') || v.wordType.toLowerCase().includes('verb')) return '動';
    if (v.wordType.includes('副') || v.wordType.toLowerCase().includes('adverb')) return '副';
    if (v.wordType.includes('イ') || v.wordType.toLowerCase().includes('i-adj')) return 'イ形';
    if (v.wordType.includes('ナ') || v.wordType.toLowerCase().includes('na-adj')) return 'ナ形';
    if (v.wordType.includes('接') || v.wordType.toLowerCase().includes('conj')) return '接';
  }
  const h = v.hiragana || '';
  const m = (v.meaning || '').toLowerCase();
  if (m.includes('tính từ na') || m.includes('(na)')) return 'ナ形';
  if (m.includes('tính từ i') || (h.endsWith('い') && !m.includes('người') && !m.includes('nhà') && !m.includes('tàu') && !m.includes('ngày') && !m.includes('máy'))) return 'イ形';
  if (h.endsWith('する') || m.startsWith('làm ') || m.startsWith('đi ') || m.startsWith('ăn ') || m.startsWith('uống ') || m.startsWith('nói ') || m.startsWith('học ') || m.startsWith('chạy ') || m.startsWith('viết ') || m.startsWith('đọc ') || m.startsWith('mua ') || m.startsWith('xem ') || m.startsWith('mặc ')) return '動';
  if (m.includes('phó từ') || m.includes('luôn luôn') || m.includes('rất') || m.includes('vừa mới') || m.includes('sắp')) return '副';
  if (m.includes('từ nối') || m.includes('nhưng mà') || m.includes('sau đó') || m.includes('tóm lại')) return '接';
  return '名';
}

const getKanjiSemanticColor = (kanji: string) => {
  const cat = kanji ? getKanjiCategory(kanji) : null;
  const assoc = kanji ? getKanjiAssociativeColor(kanji) : null;
  const defaultBg = 'bg-slate-50 dark:bg-slate-900/40';
  const defaultText = 'text-slate-900 dark:text-slate-100';
  const defaultBorder = 'border-slate-200 dark:border-slate-800';
  const defaultBadgeBg = 'bg-slate-100 dark:bg-slate-800';
  const defaultBadgeText = 'text-slate-700 dark:text-slate-300';
  const defaultBadgeBorder = 'border-slate-200 dark:border-slate-700';
  const defaultFurigana = 'text-slate-400';

  return {
    bg: assoc?.bg || cat?.lightBg || defaultBg,
    text: assoc?.text || cat?.lightText || defaultText,
    border: assoc?.border || cat?.lightBorder || defaultBorder,
    badgeBg: assoc?.badgeBg || cat?.badgeBg || defaultBadgeBg,
    badgeText: assoc?.badgeText || cat?.badgeText || defaultBadgeText,
    badgeBorder: assoc?.badgeBorder || cat?.badgeBorder || defaultBadgeBorder,
    darkText: assoc?.furigana || (cat ? `text-${cat.colorName}-300` : defaultFurigana),
    responsiveText: (assoc?.text || cat?.lightText || defaultText) + ' dark:' + (assoc?.furigana || (cat ? `text-${cat.colorName}-300` : defaultFurigana)),
  };
};

function renderWordWithFuriganaInternal(
  kanji: string | undefined,
  hiragana: string,
  meaning = '',
  hanViet?: string,
  onSelectKanji?: (k: string) => void
) {
  if (!kanji) {
    return (
      <span className="text-xl sm:text-2xl font-bold tracking-wide font-display text-white leading-none select-all whitespace-nowrap">
        {cleanVocabSymbols(hiragana)}
      </span>
    );
  }

  const hasAnyKanji = kanji.split('').some((char) => /[\u4e00-\u9faf]/.test(char));
  if (!hasAnyKanji) {
    return (
      <span className="text-xl sm:text-2xl font-bold tracking-wide font-display text-white leading-none select-all whitespace-nowrap">
        {cleanVocabSymbols(kanji)}
      </span>
    );
  }

  const cleanHira = cleanVocabSymbols(hiragana);
  const cleanK = cleanVocabSymbols(kanji);
  const allKanjiChars = cleanK.split('').filter((char) => /[\u4e00-\u9faf]/.test(char));
  const resolvedHanViet = hanViet || getHanViet(cleanK);
  const hvParts = resolvedHanViet ? resolvedHanViet.trim().split(/\s+/) : [];
  const hasAnyKanjiHanViet = allKanjiChars.length > 0 && hvParts.length > 0;

  const segments = cleanK.split(/([、,／/])/);
  const hiraParts = cleanHira.split(/[、,／/]/).map((p) => p.trim()).filter(Boolean);

  let subWordIndex = 0;
  const allSegments: { type: 'delimiter' | 'segment'; text: string; parts?: { text: string; furigana?: string }[] }[] = [];

  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s];
    if (!seg) continue;
    if (seg === '、' || seg === ',' || seg === '/' || seg === '／') {
      allSegments.push({ type: 'delimiter', text: seg });
      continue;
    }

    let segReading = hiraParts[subWordIndex] || hiraParts[0] || cleanHira;
    subWordIndex++;

    if (seg.endsWith('す') && !seg.endsWith('ます') && segReading.endsWith('します')) {
      segReading = segReading.slice(0, -3) + 'す';
    } else if (seg.endsWith('る') && !seg.endsWith('ます') && segReading.endsWith('ます')) {
      segReading = segReading.slice(0, -2) + 'る';
    }

    const alignedParts = alignWordFurigana(seg, segReading);
    allSegments.push({ type: 'segment', text: seg, parts: alignedParts });
  }

  let kanjiCharIndex = 0;

  return (
    <div className="inline-flex items-end flex-nowrap whitespace-nowrap leading-none">
      {allSegments.map((segItem, sIdx) => {
        if (segItem.type === 'delimiter') {
          return (
            <span key={`del-${sIdx}`} className="inline-flex flex-col items-center justify-end leading-none mx-0.5">
              <span className="text-[10px] sm:text-[12px] invisible select-none pb-0.5" style={{ minHeight: '1.2em' }}>
                &nbsp;
              </span>
              <span className="text-xl sm:text-2xl font-bold font-display text-white leading-none py-0.5">
                {segItem.text || ''}
              </span>
              {hasAnyKanjiHanViet && (
                <span className="text-[8px] sm:text-[9.5px] invisible select-none mt-1 py-0.5 px-1 block leading-none" aria-hidden="true">
                  &nbsp;
                </span>
              )}
            </span>
          );
        }

        return (
          <span key={`seg-${sIdx}`} className="inline-flex items-end flex-nowrap leading-none">
            {segItem.parts?.map((part, pIdx) => {
              if (!part || !part.text) return null;
              const isKanjiPart = (part.text || '').split('').some((c) => /[\u4e00-\u9faf]/.test(c));

              if (isKanjiPart && part.furigana) {
                if ((part.text || '').length > 1) {
                  const subReadings = findBestFuriganaPartition(part.text || '', part.furigana);
                  return (
                    <span key={pIdx} className="inline-flex items-end justify-center flex-nowrap">
                      {(part.text || '').split('').map((char, cIdx) => {
                        const colors = getKanjiSemanticColor(char);
                        const subFurigana = subReadings[cIdx] || '';
                        const charHv = getHanViet(char) || (allKanjiChars.length === hvParts.length ? hvParts[kanjiCharIndex] : null) || '';
                        kanjiCharIndex++;

                        return (
                          <span key={cIdx} className="inline-flex flex-col items-center justify-end leading-none mx-[1px]">
                            <span
                              className="text-[10px] sm:text-[12px] text-[#43EEF7] font-bold tracking-normal select-none pb-0.5 text-center block whitespace-nowrap"
                              style={{ minHeight: '1.2em' }}
                            >
                              {subFurigana}
                            </span>
                            <span
                              onClick={onSelectKanji ? (e) => { e.stopPropagation(); onSelectKanji(char); } : undefined}
                              title={`Bấm xem chi tiết chữ ${char}${charHv ? ` (${charHv})` : ''}`}
                              className={`inline-flex items-center justify-center font-display font-black transition-all border ${colors.bg} ${colors.text} ${colors.border} ${onSelectKanji ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} px-1.5 py-0.5 rounded-md text-xl sm:text-2xl shadow-3xs leading-none select-all`}
                            >
                              {char}
                            </span>
                            {hasAnyKanjiHanViet && (
                              <span
                                className={`text-[8px] sm:text-[9.5px] font-bold tracking-tight rounded-[4px] px-1 py-0.5 mt-1 text-center whitespace-nowrap block border transition-colors shadow-3xs leading-none select-all ${
                                  charHv
                                    ? `${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}`
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {charHv ? charHv.toUpperCase() : '—'}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </span>
                  );
                }

                const colors = getKanjiSemanticColor(part.text || '');
                const charHv = getHanViet(part.text || '') || (allKanjiChars.length === hvParts.length ? hvParts[kanjiCharIndex] : null) || '';
                kanjiCharIndex++;

                return (
                  <span key={pIdx} className="inline-flex flex-col items-center justify-end leading-none mx-[1px]">
                    <span
                      className="text-[10px] sm:text-[12px] text-[#43EEF7] font-bold tracking-normal select-none pb-0.5 text-center block whitespace-nowrap"
                      style={{ minHeight: '1.2em' }}
                    >
                      {part.furigana}
                    </span>
                    <span
                      onClick={onSelectKanji ? (e) => { e.stopPropagation(); onSelectKanji(part.text || ''); } : undefined}
                      title={`Bấm xem chi tiết chữ ${part.text || ''}${charHv ? ` (${charHv})` : ''}`}
                      className={`inline-flex items-center justify-center font-display font-black transition-all border ${colors.bg} ${colors.text} ${colors.border} ${onSelectKanji ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} px-1.5 py-0.5 rounded-md text-xl sm:text-2xl shadow-3xs leading-none select-all`}
                    >
                      {part.text || ''}
                    </span>
                    {hasAnyKanjiHanViet && (
                      <span
                        className={`text-[8px] sm:text-[9.5px] font-bold tracking-tight rounded-[4px] px-1 py-0.5 mt-1 text-center whitespace-nowrap block border transition-colors shadow-3xs leading-none select-all ${
                          charHv
                            ? `${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}`
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {charHv ? charHv.toUpperCase() : '—'}
                      </span>
                    )}
                  </span>
                );
              }

              return (
                <span key={pIdx} className="inline-flex flex-col items-center justify-end leading-none mx-px">
                  <span className="text-[10px] sm:text-[12px] invisible select-none pb-0.5" style={{ minHeight: '1.2em' }}>
                    &nbsp;
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-display text-white leading-none py-0.5 select-all">
                    {part.text || ''}
                  </span>
                  {hasAnyKanjiHanViet && (
                    <span className="text-[8px] sm:text-[9.5px] invisible select-none mt-1 py-0.5 px-1 block leading-none" aria-hidden="true">
                      &nbsp;
                    </span>
                  )}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

function VocabListItemCardComponent({
  v,
  index,
  isWordStarred,
  isMastered = false,
  showPitchAccent,
  onToggleStar,
  onToggleMastered,
  onSpeak,
  onSelectKanji,
}: VocabListItemCardProps) {
  const hanViet = v.hanViet || getHanViet(v.kanji);
  const ex = useMemo(() => ensureVocabExample(v), [v]);
  const posBadge = useMemo(() => getPartOfSpeechBadge(v), [v]);
  const numLabel = v.originalNumber ? `${v.originalNumber}` : `${index + 1}`;

  return (
    <div className={`border border-slate-700/70 rounded-xl overflow-hidden shadow-sm transition-all hover:border-slate-600/90 w-full flex flex-col ${isMastered ? 'ring-1 ring-emerald-500/30' : ''}`}>
      {/* TOP ROW (Mimics White Background in Textbook) */}
      <div className="flex flex-col sm:flex-row bg-[#272B3C] items-stretch w-full">
        {/* Left Column (Number, Checkbox, Word) */}
        <div className="w-full sm:w-[45%] md:w-[40%] flex p-3.5 border-b sm:border-b-0 sm:border-r border-slate-700/70 gap-3">
          {/* Number & Checkbox */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
            <span className="font-extrabold text-slate-100 font-serif text-lg tracking-tight select-all">
              {numLabel}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleMastered?.(v.id); }}
              className="transition-transform active:scale-90 cursor-pointer"
              title={isMastered ? 'Đã thuộc' : 'Đánh dấu'}
            >
              {isMastered ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 fill-emerald-950/40" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 hover:text-emerald-400" />
              )}
            </button>
          </div>
          {/* Word (Kanji & Furigana) */}
          <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
            {/* The red box from the user's drawn image */}
            <div className="border border-red-500/60 rounded px-1.5 py-0.5 bg-slate-900/20 max-w-full overflow-x-auto no-scrollbar">
              {renderWordWithFuriganaInternal(v.kanji, v.hiragana, v.meaning, hanViet, onSelectKanji)}
            </div>
            {showPitchAccent && (
              <div className="origin-left scale-90 max-w-full overflow-x-auto no-scrollbar mt-1">
                <PitchAccentDisplay kanji={v.kanji || ''} reading={v.hiragana} variant="transparent" className="text-sm tracking-wider" />
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-2 shrink-0 pt-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleStar(v.id); }}
              className={`p-1 rounded cursor-pointer ${isWordStarred ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}
              title={isWordStarred ? 'Bỏ yêu thích' : 'Yêu thích'}
            >
              <Star className={`w-4 h-4 ${isWordStarred ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSpeak(v.kanji || v.hiragana); }}
              className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              title="Phát âm từ vựng"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column (Japanese Sentences) */}
        <div className="flex-1 p-3.5 flex items-start justify-between gap-2 bg-[#272B3C]">
          <div className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed break-words flex-1 min-w-0 pt-0.5">
            <JapaneseFuriganaText
              sentence={v.exampleFuriganaHtml || ex.exampleSentence}
              currentItem={{ kanji: v.kanji, hiragana: v.hiragana }}
              showFurigana={true}
              forceDark={true}
              size="base"
              onClickKanji={onSelectKanji}
              className="select-all tracking-wide"
            />
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSpeak(ex.exampleSentence); }}
            className="text-slate-400 hover:text-white transition-colors p-1 shrink-0 cursor-pointer"
            title="Nghe phát âm câu ví dụ"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM ROW (Mimics Gray Background in Textbook) */}
      <div className="flex flex-col sm:flex-row bg-[#1E212E] items-stretch w-full border-t border-slate-700/70">
        {/* Left Column (POS, Meanings) */}
        <div className="w-full sm:w-[45%] md:w-[40%] flex p-3.5 border-b sm:border-b-0 sm:border-r border-slate-700/70 gap-3 items-start">
          {/* POS Badge */}
          <div className="shrink-0 mt-0.5 ml-1">
            <span className="bg-slate-900 border border-slate-700 text-slate-200 font-bold px-1.5 py-0.5 rounded text-[11px] font-mono leading-none shadow-2xs">
              {posBadge}
            </span>
          </div>
          {/* Meaning Texts */}
          <div className="flex flex-col flex-1 min-w-0 gap-0.5 mt-0.5 ml-2">
            {v.englishMeaning ? (
              <div className="text-xs sm:text-sm text-slate-400 font-sans leading-snug break-words">
                {v.englishMeaning}
              </div>
            ) : null}
            <div className="text-xs sm:text-sm text-slate-200 font-bold leading-snug break-words">
              {v.meaning}
            </div>
          </div>
        </div>

        {/* Right Column (English/Vietnamese Translations) */}
        <div className="flex-1 p-3.5 flex flex-col justify-center gap-1.5 bg-[#1E212E]">
          {(v.englishExampleTranslation || ex.englishExampleTranslation) ? (
            <div className="text-xs sm:text-sm text-slate-400 leading-snug break-words font-sans">
              {v.englishExampleTranslation || ex.englishExampleTranslation}
            </div>
          ) : null}
          <div className="text-xs sm:text-sm text-slate-300 leading-snug break-words font-medium whitespace-pre-line">
            {ex.exampleTranslation}
          </div>
        </div>
      </div>

      {/* NOTES ROW (Mimics Bottom Note in Textbook) */}
      {(v.relatedWords || v.synonyms || v.antonyms || v.notes) ? (
        <div className="border-t border-slate-700/70 bg-[#272B3C] px-3.5 py-2.5 flex flex-col gap-2 text-xs sm:text-sm w-full">
          {v.synonyms && (
            <div className="flex items-start gap-2.5 w-full">
              <div className="bg-indigo-900/60 border border-indigo-500/50 rounded px-1 py-0.5 text-indigo-300 shrink-0 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                <span>🟰</span>
                <span>Đồng nghĩa</span>
              </div>
              <div className="text-indigo-200 leading-relaxed font-sans break-words flex-1 min-w-0 pt-0.5">
                {v.synonyms}
              </div>
            </div>
          )}
          {v.antonyms && (
            <div className="flex items-start gap-2.5 w-full">
              <div className="bg-amber-900/60 border border-amber-500/50 rounded px-1 py-0.5 text-amber-300 shrink-0 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                <span>↔</span>
                <span>Trái nghĩa</span>
              </div>
              <div className="text-amber-200 leading-relaxed font-sans break-words flex-1 min-w-0 pt-0.5">
                {v.antonyms}
              </div>
            </div>
          )}
          {v.relatedWords && (
            <div className="flex items-start gap-2.5 w-full">
              <div className="bg-emerald-900/60 border border-emerald-500/50 rounded px-1 py-0.5 text-emerald-300 shrink-0 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>Liên quan</span>
              </div>
              <div className="text-slate-200 leading-relaxed font-sans break-words flex-1 min-w-0 pt-0.5">
                {v.relatedWords}
              </div>
            </div>
          )}
          {v.notes && (
            <div className="flex items-start gap-2.5 w-full">
              <div className="bg-sky-900/60 border border-sky-500/50 rounded px-1.5 py-0.5 text-sky-300 shrink-0 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                <span>👉</span>
                <span>Lưu ý</span>
              </div>
              <div className="text-slate-300 leading-relaxed font-sans break-words flex-1 min-w-0 whitespace-pre-line pt-0.5">
                {v.notes}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

const VocabListItemCard = React.memo(VocabListItemCardComponent);
export default VocabListItemCard;
