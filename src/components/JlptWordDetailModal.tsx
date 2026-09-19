/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { JlptWordInfo } from './JlptUnderlineArticle';
import { 
  Volume2, 
  X, 
  Check, 
  Search, 
  Plus, 
  Maximize2, 
  Minimize2, 
  Loader2, 
  Heart,
  BookOpen,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { speakJapanese } from '../utils/audio';
import { KANJI_DICTIONARY } from '../data/kanjiDictionary';
import { KANJI_TO_HAN_VIET } from '../utils/japaneseUtils';
import { MINNA_N5_VOCABULARY } from '../data/minnaN5Vocab';
import { MINNA_N4_VOCABULARY } from '../data/minnaN4Vocab';
import { KanjiStrokeCanvas } from './KanjiStrokeCanvas';
import { detectWordPos } from '../utils/posUtils';

export interface KanjiStrokeData {
  character: string;
  code: string;
  viewBox: string;
  strokeCount: number;
  strokes: Array<{
    d: string;
    number: number;
    numX?: number;
    numY?: number;
  }>;
}

export interface KanjiCharBreakdown {
  character: string;
  hanViet: string;
  on: string;
  kun: string;
  meaning: string;
  strokes?: number;
  jlpt?: string;
}

export interface SentenceExample {
  japanese: string;
  furigana?: string;
  romaji?: string;
  vietnamese: string;
}

export interface RelatedWordItem {
  word: string;
  reading?: string;
  partOfSpeech?: string;
  meaning: string;
  jlpt?: string;
}

export interface RichLookupData {
  word: string;
  reading: string;
  furigana?: string;
  hanViet?: string;
  partOfSpeech?: string;
  meanings: string[];
  explanation?: string;
  jlpt?: string;
  kanjis?: KanjiCharBreakdown[];
  examples?: SentenceExample[];
  relatedWords?: RelatedWordItem[];
}

interface JlptWordDetailModalProps {
  wordInfo: JlptWordInfo | null;
  onClose: () => void;
  onSaveVocab?: (word: string, reading?: string, meaning?: string, level?: string) => void;
  isSaved?: boolean;
  contextSentence?: string;
}

// Helper: Convert Hiragana / Katakana / Kanji token string to Romaji
const KANA_TO_ROMAJI_MAP: Record<string, string> = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
  // Katakana
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
  'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
  'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
  'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
  'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
  'ー': '-'
};

function convertKanaToRomaji(kana: string): string {
  let result = '';
  let i = 0;
  while (i < kana.length) {
    if (i + 1 < kana.length) {
      const two = kana.substring(i, i + 2);
      if (KANA_TO_ROMAJI_MAP[two]) {
        result += KANA_TO_ROMAJI_MAP[two];
        i += 2;
        continue;
      }
    }
    const one = kana[i];
    if (KANA_TO_ROMAJI_MAP[one]) {
      result += KANA_TO_ROMAJI_MAP[one];
    } else if (one === 'っ' || one === 'ッ') {
      const nextOne = kana[i + 1];
      if (nextOne && KANA_TO_ROMAJI_MAP[nextOne]) {
        result += KANA_TO_ROMAJI_MAP[nextOne][0];
      }
    } else if (/^[a-zA-Z0-9\s.,!?、。！？]$/.test(one)) {
      result += one;
    } else {
      result += one;
    }
    i++;
  }
  return result;
}

// Helper to get distinct JLPT level badge styling matching video
function getJlptLevelBadgeClass(level?: string): string {
  const lvl = level?.toUpperCase().trim();
  if (lvl === 'N5') return 'bg-emerald-600 text-white';
  if (lvl === 'N4') return 'bg-blue-600 text-white';
  if (lvl === 'N3') return 'bg-purple-600 text-white';
  if (lvl === 'N2') return 'bg-amber-600 text-white';
  if (lvl === 'N1') return 'bg-rose-600 text-white';
  return 'bg-emerald-600 text-white';
}

// Rich detailed meanings and vocabulary examples for Kanji (matching dictionary format in video)
const KANJI_RICH_DETAILS: Record<string, {
  meanings: Array<{
    def: string;
    readingPrefix?: string;
    examples?: string[];
  }>;
}> = {
  '間': {
    meanings: [
      {
        def: 'rảnh rỗi; thong thả; thanh bình; yên tĩnh',
        readingPrefix: 'カン, ケン',
        examples: ['間雲 (mây trời lãng đãng)', '間時 (thời gian rảnh)', '間居 (sống nhàn tản)']
      },
      {
        def: 'căn phòng; đơn vị đếm phòng; đơn vị đo chiều dài',
        readingPrefix: 'カン, ケン',
        examples: ['間数 (số phòng)', '間口 (bề ngang căn phòng)']
      },
      {
        def: 'khoảng cách; giữa; khoảng thời gian; mối quan hệ',
        readingPrefix: 'あいだ, ま',
        examples: ['時間 (thời gian)', '仲間 (bạn bè)', '空間 (không gian)']
      }
    ]
  },
  '時': {
    meanings: [
      {
        def: 'thời gian; giờ giấc; thời đại',
        readingPrefix: 'ジ',
        examples: ['時間 (thời gian)', '時代 (thời đại)', '時計 (đồng hồ)', '当時 (hồi đó)']
      },
      {
        def: 'khi; lúc; thời điểm',
        readingPrefix: 'とき',
        examples: ['時々 (thỉnh thoảng)', 'その時 (lúc đó)']
      }
    ]
  },
  '以': {
    meanings: [
      {
        def: 'kể từ (từ chỉ điểm bắt đầu của thời gian, phạm vi hoặc phương hướng)',
        readingPrefix: 'イ',
        examples: ['以来 (kể từ đó)', '以内 (trong vòng)', '以上 (trở lên)', '以下 (trở xuống)']
      },
      {
        def: 'nguyên nhân; lý do; lấy làm mốc',
        readingPrefix: 'イ',
        examples: ['以前 (trước đây)', '以降 (từ đó trở đi)']
      }
    ]
  },
  '夏': {
    meanings: [
      {
        def: 'mùa hè; hạ',
        readingPrefix: 'カ, ゲ, なつ',
        examples: ['夏休み (nghỉ hè)', '初夏 (đầu hè)', '夏季 (mùa hè)']
      }
    ]
  },
  '休': {
    meanings: [
      {
        def: 'nghỉ ngơi; vắng mặt; ngừng lại',
        readingPrefix: 'キュウ, やす.む',
        examples: ['休日 (ngày nghỉ)', '休憩 (nghỉ giải lao)', '夏休み (kỳ nghỉ hè)']
      }
    ]
  },
  '日': {
    meanings: [
      {
        def: 'ngày; mặt trời; Nhật Bản',
        readingPrefix: 'ニチ, ジツ, ひ',
        examples: ['日本 (Nhật Bản)', '毎日 (mỗi ngày)', '休日 (ngày nghỉ)']
      }
    ]
  },
  '本': {
    meanings: [
      {
        def: 'sách; gốc rễ; nguồn gốc',
        readingPrefix: 'ホン, もと',
        examples: ['日本 (Nhật Bản)', '本当 (thật sự)', '基本 (cơ bản)']
      }
    ]
  },
  '最': {
    meanings: [
      {
        def: 'nhất; cực kỳ; tột cùng; hàng đầu (biểu thị mức độ cao nhất)',
        readingPrefix: 'サイ, もっと.も',
        examples: ['最近 (gần đây, dạo này)', '最高 (cao nhất, tuyệt vời)', '最初 (lúc đầu, đầu tiên)', '最後 (cuối cùng)', '最も (nhất, vô cùng)']
      },
      {
        def: 'tối ưu; thích hợp nhất; mới nhất',
        readingPrefix: 'サイ',
        examples: ['最適 (thích hợp nhất)', '最新 (mới nhất)', '最大 (lớn nhất)', '最小 (nhỏ nhất)']
      }
    ]
  },
  '近': {
    meanings: [
      {
        def: 'gần; lân cận (khoảng cách không gian hoặc thời gian gần)',
        readingPrefix: 'キン, ちか.い',
        examples: ['最近 (gần đây)', '近く (ở gần, bên cạnh)', '近所 (hàng xóm, lân cận)', '近道 (đường tắt)', '近代 (thời cận đại)']
      },
      {
        def: 'thân thiết; gần gũi; họ hàng gần',
        readingPrefix: 'キン, ちか.い',
        examples: ['親近 (thân cận, gần gũi)', '近親 (người thân cận, họ hàng gần)']
      }
    ]
  },
  '前': {
    meanings: [
      {
        def: 'trước (không gian hoặc thời gian)',
        readingPrefix: 'ゼン, まえ',
        examples: ['前 (phía trước)', '午前 (buổi sáng)', '以前 (trước đây)', '名前 (tên)']
      }
    ]
  },
  '後': {
    meanings: [
      {
        def: 'sau; phía sau; muộn hơn',
        readingPrefix: 'ゴ, コウ, あと, うし.ろ, のち',
        examples: ['午後 (buổi chiều)', '後ろ (phía sau)', '最後 (cuối cùng)', '今後 (từ nay về sau)']
      }
    ]
  }
};

function parseSentenceRuby(furiganaSentence: string, fallbackJp?: string) {
  const text = furiganaSentence || fallbackJp || '';
  const tokens: Array<{ text: string; furigana?: string; romaji?: string }> = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)|([^\s\[\]()]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[2]) {
      const kanji = match[1];
      const furi = match[2];
      tokens.push({
        text: kanji,
        furigana: furi,
        romaji: convertKanaToRomaji(furi)
      });
    } else if (match[3]) {
      const plain = match[3];
      tokens.push({
        text: plain,
        furigana: undefined,
        romaji: convertKanaToRomaji(plain)
      });
    }
  }

  return tokens;
}

export const JlptWordDetailModal: React.FC<JlptWordDetailModalProps> = ({
  wordInfo,
  onClose,
  onSaveVocab,
  isSaved = false,
  contextSentence
}) => {
  const [activeTab, setActiveTab] = useState<'vocab' | 'kanji' | 'examples'>('vocab');
  const [currentWord, setCurrentWord] = useState<string>(wordInfo?.word || '');
  const [searchQuery, setSearchQuery] = useState<string>(wordInfo?.word || '');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingWordKey, setPlayingWordKey] = useState<string | null>(null);
  const [savedLocal, setSavedLocal] = useState<Record<string, boolean>>({});
  const [favoritedKanji, setFavoritedKanji] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lookupData, setLookupData] = useState<RichLookupData | null>(null);
  const [selectedKanjiIndex, setSelectedKanjiIndex] = useState<number>(0);

  // Real KanjiVG stroke order state
  const [strokeData, setStrokeData] = useState<KanjiStrokeData | null>(null);
  const [loadingStrokes, setLoadingStrokes] = useState<boolean>(false);

  const cacheRef = useRef<Map<string, RichLookupData>>(new Map());

  const handleClose = () => {
    setCurrentWord('');
    setSearchQuery('');
    setLookupData(null);
    onClose();
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Update query when wordInfo changes
  useEffect(() => {
    if (wordInfo?.word) {
      setCurrentWord(wordInfo.word);
      setSearchQuery(wordInfo.word);
      // Retain activeTab (kanji or examples) if user is already browsing, matching video behavior
      setActiveTab(prev => {
        const hasKanji = /[\u4e00-\u9faf]/.test(wordInfo.word);
        if (prev === 'kanji' && hasKanji) return 'kanji';
        if (prev === 'examples') return 'examples';
        return prev || 'vocab';
      });
      setSelectedKanjiIndex(0);
      fetchLookup(wordInfo.word, wordInfo.furigana, wordInfo.meaning, wordInfo.jlpt || undefined);
    } else {
      setCurrentWord('');
      setSearchQuery('');
      setLookupData(null);
    }
  }, [wordInfo?.word]);

  const fetchLookup = async (wordToLookup: string, readingHint?: string, meaningHint?: string, levelHint?: string) => {
    const clean = wordToLookup.trim();
    if (!clean) return;

    if (cacheRef.current.has(clean)) {
      setLookupData(cacheRef.current.get(clean)!);
      return;
    }

    // Set immediate partial data so UI is instantly responsive
    const detectedPos = wordInfo?.partOfSpeech || (detectWordPos(clean, clean) === 'verb' ? 'động từ' : 'danh từ');
    const initialData: RichLookupData = {
      word: clean,
      reading: readingHint || clean,
      furigana: readingHint ? `[${clean}](${readingHint})` : clean,
      meanings: meaningHint ? [meaningHint] : ['Đang tra cứu nghĩa...'],
      jlpt: levelHint || 'N4',
      partOfSpeech: detectedPos,
      kanjis: [],
      examples: [],
      relatedWords: []
    };
    setLookupData(initialData);
    setIsLoading(true);

    try {
      const res = await fetch('/api/reading/lookup-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: clean,
          reading: readingHint,
          context: contextSentence,
          level: levelHint
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          cacheRef.current.set(clean, data.data);
          setLookupData(data.data);
        }
      }
    } catch (e) {
      console.warn('Word lookup API error, using fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const displayData: RichLookupData = lookupData || {
    word: currentWord || wordInfo?.word || '',
    reading: wordInfo?.furigana || currentWord,
    furigana: wordInfo?.furigana ? `[${currentWord}](${wordInfo.furigana})` : currentWord,
    meanings: wordInfo?.meaning ? [wordInfo.meaning] : ['Từ vựng trong bài đọc'],
    jlpt: wordInfo?.jlpt || 'N4',
    partOfSpeech: wordInfo?.partOfSpeech || (detectWordPos(currentWord, currentWord) === 'verb' ? 'động từ' : 'danh từ'),
    kanjis: [],
    examples: [],
    relatedWords: []
  };

  const handlePlayAudio = (text: string, key?: string) => {
    const activeKey = key || text;
    setPlayingWordKey(activeKey);
    setIsPlayingAudio(true);
    speakJapanese(text, 0.95, () => {
      setIsPlayingAudio(false);
      setPlayingWordKey(null);
    });
  };

  const handleSave = (itemWord: string, itemReading?: string, itemMeaning?: string, itemLevel?: string) => {
    if (onSaveVocab) {
      onSaveVocab(itemWord, itemReading, itemMeaning, itemLevel);
    }
    setSavedLocal(prev => ({ ...prev, [itemWord]: true }));
  };

  const handleToggleFavoriteKanji = (char: string) => {
    setFavoritedKanji(prev => ({ ...prev, [char]: !prev[char] }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchQuery.trim() !== currentWord) {
      setCurrentWord(searchQuery.trim());
      setSelectedKanjiIndex(0);
      fetchLookup(searchQuery.trim());
    }
  };

  const handleSelectRelatedWord = (related: RelatedWordItem) => {
    setCurrentWord(related.word);
    setSearchQuery(related.word);
    setActiveTab('vocab');
    setSelectedKanjiIndex(0);
    fetchLookup(related.word, related.reading, related.meaning, related.jlpt);
  };

  const handleLookupTerm = (term: string) => {
    const q = term.trim();
    if (!q) return;
    setCurrentWord(q);
    setSearchQuery(q);
    setActiveTab('vocab');
    setSelectedKanjiIndex(0);
    fetchLookup(q);
  };

  const isCurrentSaved = savedLocal[displayData.word] || (wordInfo?.word === displayData.word && isSaved);

  // Kanji characters in the current word
  const kanjiList = (displayData.kanjis && displayData.kanjis.length > 0 
    ? displayData.kanjis 
    : displayData.word.split('').filter(c => /[\u4e00-\u9faf]/.test(c)).map(c => {
        const d = KANJI_DICTIONARY[c];
        return {
          character: c,
          hanViet: d?.han_viet || KANJI_TO_HAN_VIET[c] || 'HÁN VIỆT',
          on: d?.onyomi || '-',
          kun: d?.kunyomi || '-',
          meaning: d?.meaning || 'Chữ Hán trong từ',
          strokes: d?.strokes || 10,
          jlpt: d?.level || displayData.jlpt || 'N3'
        };
      })
  );

  const rawActiveKanji = kanjiList[selectedKanjiIndex] || kanjiList[0];
  const activeDict = rawActiveKanji?.character ? KANJI_DICTIONARY[rawActiveKanji.character] : null;
  const activeKanji = rawActiveKanji ? {
    ...rawActiveKanji,
    hanViet: rawActiveKanji.hanViet && rawActiveKanji.hanViet !== 'HÁN VIỆT' && rawActiveKanji.hanViet !== '-' 
      ? rawActiveKanji.hanViet 
      : activeDict?.han_viet || KANJI_TO_HAN_VIET[rawActiveKanji.character] || '-',
    on: rawActiveKanji.on && rawActiveKanji.on !== '-' ? rawActiveKanji.on : activeDict?.onyomi || '-',
    kun: rawActiveKanji.kun && rawActiveKanji.kun !== '-' ? rawActiveKanji.kun : activeDict?.kunyomi || '-',
    strokes: strokeData?.strokeCount || rawActiveKanji.strokes || activeDict?.strokes || 4,
    jlpt: rawActiveKanji.jlpt || activeDict?.level || displayData.jlpt || 'N5',
    meaning: rawActiveKanji.meaning || activeDict?.meaning || '',
    radical: activeDict?.radical || '',
    mnemonic: activeDict?.mnemonic || '',
    phoneticRule: activeDict?.phoneticRule || '',
    components: activeDict?.components || ''
  } : null;

  // Find related compound vocabulary containing this Kanji from Minna databases
  const relatedCompounds = useMemo(() => {
    if (!activeKanji?.character) return [];
    const char = activeKanji.character;
    const results: Array<{ word: string; reading: string; meaning: string; level?: string }> = [];
    const seen = new Set<string>();

    for (const item of [...MINNA_N5_VOCABULARY, ...MINNA_N4_VOCABULARY]) {
      if (item.kanji && item.kanji.includes(char) && !seen.has(item.kanji)) {
        seen.add(item.kanji);
        results.push({
          word: item.kanji,
          reading: item.hiragana || item.romaji || '',
          meaning: item.meaning || '',
          level: item.level
        });
        if (results.length >= 8) break;
      }
    }
    return results;
  }, [activeKanji?.character]);

  // Fetch real KanjiVG SVG stroke order data whenever activeKanji changes
  useEffect(() => {
    if (!activeKanji?.character) {
      setStrokeData(null);
      return;
    }
    const char = activeKanji.character;
    let isMounted = true;
    setLoadingStrokes(true);
    setStrokeData(null);

    fetch(`/api/kanji-strokes?char=${encodeURIComponent(char)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!isMounted) return;
        if (data && data.strokes && data.strokes.length > 0) {
          setStrokeData(data);
          setLoadingStrokes(false);
        } else {
          // Client-side fallback to jsdelivr CDN
          const code = char.codePointAt(0)?.toString(16).padStart(5, '0');
          if (code) {
            fetch(`https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${code}.svg`)
              .then(r => r.ok ? r.text() : '')
              .then(svgText => {
                if (!isMounted || !svgText) {
                  setLoadingStrokes(false);
                  return;
                }
                try {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(svgText, 'image/svg+xml');
                  const paths = Array.from(doc.querySelectorAll('g[id*="StrokePaths"] path, path[id*="-s"], path'))
                    .map((p, idx) => ({
                      d: p.getAttribute('d') || '',
                      number: idx + 1
                    }))
                    .filter(p => !!p.d);

                  const texts = Array.from(doc.querySelectorAll('text'));
                  texts.forEach((t, idx) => {
                    const transform = t.getAttribute('transform') || '';
                    const m = transform.match(/matrix\([^)]*?\s+([\d.-]+)\s+([\d.-]+)\)/);
                    if (m && paths[idx]) {
                      (paths[idx] as any).numX = parseFloat(m[1]);
                      (paths[idx] as any).numY = parseFloat(m[2]);
                    } else {
                      const x = t.getAttribute('x');
                      const y = t.getAttribute('y');
                      if (x && y && paths[idx]) {
                        (paths[idx] as any).numX = parseFloat(x);
                        (paths[idx] as any).numY = parseFloat(y);
                      }
                    }
                  });

                  setStrokeData({
                    character: char,
                    code,
                    viewBox: '0 0 109 109',
                    strokeCount: paths.length,
                    strokes: paths
                  });
                } catch (e) {
                  console.error('Failed to parse client kanji SVG:', e);
                }
                setLoadingStrokes(false);
              })
              .catch(() => {
                if (isMounted) setLoadingStrokes(false);
              });
          } else {
            setLoadingStrokes(false);
          }
        }
      })
      .catch(() => {
        if (isMounted) setLoadingStrokes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeKanji?.character]);

  if (!wordInfo) return null;

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={`bg-[#131316] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-0 text-white transition-all duration-300 w-full ${
          isExpanded 
            ? 'max-w-4xl h-[92vh]' 
            : 'max-w-2xl sm:max-w-3xl lg:max-w-[820px] h-[88vh] sm:h-[650px]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. TOP HEADER (Deep purple bar matching Image 1: #5e38a8) */}
        <div className="flex items-center justify-between px-3.5 py-3 bg-[#5e38a8] text-white gap-2 shrink-0">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2.5 bg-transparent min-w-0">
            <Search className="w-5 h-5 text-purple-200 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tra từ, Kanji..."
              className="bg-transparent text-base sm:text-lg font-jp font-bold text-white placeholder-purple-200/60 focus:outline-hidden w-full"
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 text-purple-200 animate-spin shrink-0" />
            )}
          </form>

          <div className="flex items-center gap-3 shrink-0 text-white">
            {/* Expand / Minimize Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:text-purple-200 transition cursor-pointer"
              title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1 hover:text-purple-200 transition cursor-pointer"
              title="Đóng bảng tra"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. TABS BAR: Từ vựng | Kanji | Mẫu câu */}
        <div className="flex items-center px-4 py-2.5 bg-[#141419] gap-2 shrink-0 text-sm font-bold border-b border-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('vocab')}
            className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
              activeTab === 'vocab'
                ? 'bg-[#6d44c9] text-white shadow-sm ring-1 ring-purple-400/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            Từ vựng
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kanji')}
            className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
              activeTab === 'kanji'
                ? 'bg-[#6d44c9] text-white shadow-sm ring-1 ring-purple-400/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            Kanji
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
              activeTab === 'examples'
                ? 'bg-[#6d44c9] text-white shadow-sm ring-1 ring-purple-400/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            Mẫu câu
          </button>
        </div>

        {/* 3. TAB CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-zinc-100 custom-scrollbar select-text">
          
          {/* TAB 1: TỪ VỰNG (Exact matching with Image 1 & 2) */}
          {activeTab === 'vocab' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Main Word Header */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-3xl font-bold text-white font-jp tracking-wide">
                    {displayData.word}
                  </h2>

                  <div className="flex items-center gap-3 shrink-0 text-zinc-300">
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(displayData.word, 'main')}
                      className={`p-1.5 transition cursor-pointer ${
                        isPlayingAudio && playingWordKey === 'main'
                          ? 'text-purple-400 scale-110'
                          : 'hover:text-white'
                      }`}
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSave(displayData.word, displayData.reading, displayData.meanings[0], displayData.jlpt)}
                      className={`p-1.5 transition cursor-pointer ${
                        isCurrentSaved ? 'text-emerald-400' : 'hover:text-white'
                      }`}
                      title={isCurrentSaved ? 'Đã lưu vào sổ từ vựng' : 'Thêm vào sổ từ vựng'}
                    >
                      {isCurrentSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Pronunciation reading: 「きき」 */}
                {displayData.reading && (
                  <div className="mt-1 text-base font-jp text-zinc-200">
                    「{displayData.reading}」
                  </div>
                )}

                {/* Part of speech badge: Sky Blue for Danh từ, Orange for Động từ */}
                {displayData.partOfSpeech && (
                  <div className="mt-2.5">
                    <span
                      className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                        displayData.partOfSpeech.toLowerCase().includes('động') || displayData.partOfSpeech.toLowerCase().includes('verb')
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : displayData.partOfSpeech.toLowerCase().includes('danh') || displayData.partOfSpeech.toLowerCase().includes('noun')
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      }`}
                    >
                      {displayData.partOfSpeech}
                    </span>
                  </div>
                )}

                {/* Meanings with white bullet points */}
                <div className="mt-3 space-y-2">
                  {displayData.meanings.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-100 font-normal leading-relaxed">
                      <span className="text-zinc-400 text-lg leading-tight shrink-0">•</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider Line */}
              <div className="border-t border-zinc-800 my-4" />

              {/* Section: Kết quả gợi ý (Image 1 & 2) */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">
                  Kết quả gợi ý
                </h3>

                {displayData.relatedWords && displayData.relatedWords.length > 0 ? (
                  <div className="space-y-4">
                    {displayData.relatedWords.map((item, rIdx) => {
                      const isItemSaved = savedLocal[item.word];
                      return (
                        <div
                          key={`rel-${rIdx}`}
                          className="space-y-1.5 border-b border-zinc-800/80 pb-4 last:border-b-0 cursor-pointer group"
                          onClick={() => handleSelectRelatedWord(item)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xl font-bold text-white font-jp group-hover:text-purple-300 transition">
                              {item.word}
                            </span>

                            <div className="flex items-center gap-3 shrink-0 text-zinc-300" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handlePlayAudio(item.word, `rel-${rIdx}`)}
                                className={`p-1.5 transition cursor-pointer ${
                                  isPlayingAudio && playingWordKey === `rel-${rIdx}`
                                    ? 'text-purple-400 scale-110'
                                    : 'hover:text-white'
                                }`}
                                title="Nghe phát âm"
                              >
                                <Volume2 className="w-5 h-5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSave(item.word, item.reading, item.meaning, item.jlpt)}
                                className={`p-1.5 transition cursor-pointer ${
                                  isItemSaved ? 'text-emerald-400' : 'hover:text-white'
                                }`}
                                title="Lưu từ này"
                              >
                                {isItemSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {/* Reading: 「ききか」 */}
                          {item.reading && (
                            <div className="text-sm font-jp text-zinc-300">
                              「{item.reading}」
                            </div>
                          )}

                          {/* Part of speech: [danh từ] */}
                          {item.partOfSpeech && (
                            <div className="pt-0.5">
                              <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-[#cbbcf6] text-[#4a154b]">
                                {item.partOfSpeech}
                              </span>
                            </div>
                          )}

                          {/* Meaning bullet */}
                          {item.meaning && (
                            <div className="flex items-start gap-2.5 text-sm text-zinc-200 font-normal leading-relaxed pt-1">
                              <span className="text-zinc-400 text-lg leading-tight shrink-0">•</span>
                              <span>{item.meaning}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 py-2">
                    Đang tải hoặc chưa có thêm từ phái sinh gợi ý.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: KANJI (Balanced 2-Row Layout with Canvas, Rich Meanings, Mnemonic, and Compounds) */}
          {activeTab === 'kanji' && (
            <div className="animate-fadeIn space-y-5">
              {activeKanji ? (
                <>
                  {/* KANJI SELECTOR BUTTONS (if word has multiple Kanji, e.g. 最近 -> [ 最 TỐI ] [ 近 CẬN ]) */}
                  {kanjiList.length > 1 && (
                    <div className="flex items-center gap-2.5 pb-1 overflow-x-auto">
                      <span className="text-xs font-semibold text-zinc-400 shrink-0">Hán tự trong từ:</span>
                      <div className="flex items-center gap-2">
                        {kanjiList.map((kItem, idx) => {
                          const isSelected = selectedKanjiIndex === idx;
                          const itemDict = KANJI_DICTIONARY[kItem.character];
                          const hv = kItem.hanViet || itemDict?.han_viet || '';
                          return (
                            <button
                              key={`kanji-picker-${idx}`}
                              type="button"
                              onClick={() => {
                                if (selectedKanjiIndex !== idx) {
                                  setSelectedKanjiIndex(idx);
                                }
                              }}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm ring-1 ring-purple-400/40'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                              }`}
                            >
                              <span className="font-jp text-lg text-purple-300 font-bold">{kItem.character}</span>
                              {hv && <span className="text-xs font-medium text-zinc-300">[{hv}]</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TOP SECTION: Balanced Kanji Identity Profile (Left) & Stroke Canvas (Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-[#15151e]/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-5">
                    {/* LEFT COLUMN (md:col-span-7): Core Profile */}
                    <div className="md:col-span-7 flex flex-col justify-center space-y-3.5">
                      {/* Hán Việt Header & Level Badges */}
                      <div>
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-2xl sm:text-3xl font-black text-sky-400 tracking-wider">
                            {activeKanji.hanViet || '-'}
                          </span>
                          <span className="text-sm font-jp font-semibold text-purple-300">
                            「{activeKanji.character}」
                          </span>
                        </div>

                        {/* Badges row */}
                        <div className="flex items-center flex-wrap gap-2 pt-2">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs ${getJlptLevelBadgeClass(activeKanji.jlpt || displayData.jlpt)}`}>
                            JLPT {activeKanji.jlpt || displayData.jlpt || 'N5'}
                          </span>
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                            {activeKanji.strokes} nét
                          </span>
                          {activeKanji.radical && (
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-950/40 border border-purple-800/50 text-purple-200">
                              Bộ: {activeKanji.radical}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Readings: Kunyomi & Onyomi cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Kunyomi */}
                        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 sm:p-3 flex flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Âm Kun</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Hiragana</span>
                          </div>
                          <span className="font-jp text-base font-semibold text-zinc-100 break-words">
                            {activeKanji.kun && activeKanji.kun !== '-' ? activeKanji.kun : '—'}
                          </span>
                        </div>

                        {/* Onyomi */}
                        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 sm:p-3 flex flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Âm On</span>
                            <span className="text-[10px] text-purple-400/60 font-mono">Katakana</span>
                          </div>
                          <span className="font-jp text-base font-semibold text-purple-200 break-words">
                            {activeKanji.on && activeKanji.on !== '-' ? activeKanji.on : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Phonetic rule if available */}
                      {activeKanji.phoneticRule && (
                        <div className="text-xs text-zinc-400 bg-purple-950/20 border border-purple-900/30 rounded-xl px-3 py-2 flex items-start gap-2">
                          <span className="text-purple-400 font-bold shrink-0">Chuyển âm:</span>
                          <span>{activeKanji.phoneticRule}</span>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN (md:col-span-5): Animated Kanji Stroke Canvas */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center">
                      <KanjiStrokeCanvas
                        strokeData={strokeData}
                        loading={loadingStrokes}
                        activeCharacter={activeKanji.character}
                      />
                    </div>
                  </div>

                  {/* BOTTOM SECTION: Full-Width Rich Learning Modules */}
                  <div className="space-y-4">
                    {/* MODULE 1: Meanings & Vocabulary Examples */}
                    <div className="bg-[#15151e]/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-zinc-800/80">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        <h4 className="text-sm font-bold text-white tracking-wide">Giải nghĩa chữ Hán</h4>
                      </div>

                      {(() => {
                        const rich = KANJI_RICH_DETAILS[activeKanji.character];
                        if (rich && rich.meanings && rich.meanings.length > 0) {
                          return (
                            <div className="space-y-3 text-xs sm:text-sm text-zinc-200">
                              {rich.meanings.map((m, mIdx) => (
                                <div key={`m-${mIdx}`} className="space-y-1.5">
                                  <div className="leading-relaxed">
                                    <span className="font-bold text-purple-400 mr-1.5">{mIdx + 1}.</span>
                                    {m.readingPrefix && (
                                      <span className="text-zinc-400 font-jp mr-1.5 font-medium">({m.readingPrefix})</span>
                                    )}
                                    <span className="text-zinc-100">{m.def}</span>
                                  </div>
                                  {m.examples && m.examples.length > 0 && (
                                    <div className="pl-4 flex flex-wrap items-center gap-1.5 pt-0.5">
                                      <span className="text-[11px] font-bold text-purple-300/80 mr-0.5">VD:</span>
                                      {m.examples.map((ex, exI) => (
                                        <span 
                                          key={`ex-${exI}`} 
                                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white hover:border-purple-500/40 transition-colors"
                                        >
                                          {ex}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        }

                        // Fallback default meaning rendering
                        const meaningLines = (activeKanji.meaning || activeDict?.meaning || 'Chữ Hán')
                          .split(/[,;\n]/)
                          .map(s => s.trim())
                          .filter(Boolean);

                        return (
                          <div className="space-y-2 text-xs sm:text-sm text-zinc-200">
                            {meaningLines.length > 1 ? (
                              meaningLines.map((line, lIdx) => (
                                <div key={`l-${lIdx}`} className="flex items-start gap-2 leading-relaxed">
                                  <span className="font-bold text-purple-400">{lIdx + 1}.</span>
                                  <span>{line}</span>
                                </div>
                              ))
                            ) : (
                              <p className="leading-relaxed">{activeKanji.meaning || 'Chữ Hán'}</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* MODULE 2: Mnemonic (Mẹo nhớ Hán tự) */}
                    {activeKanji.mnemonic && (
                      <div className="p-3.5 sm:p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-sm flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-amber-300 text-xs uppercase tracking-wider">Mẹo nhớ chữ Hán</span>
                          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">{activeKanji.mnemonic}</p>
                        </div>
                      </div>
                    )}

                    {/* MODULE 3: Compound Vocabulary containing this Kanji */}
                    {relatedCompounds.length > 0 && (
                      <div className="bg-[#15151e]/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <h4 className="text-sm font-bold text-white tracking-wide">
                              Từ ghép phổ biến chứa 「{activeKanji.character}」
                            </h4>
                          </div>
                          <span className="text-xs text-zinc-500">Bấm để tra cứu</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {relatedCompounds.map((comp, cIdx) => (
                            <button
                              key={`compound-${cIdx}`}
                              type="button"
                              onClick={() => handleLookupTerm(comp.word)}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800/70 text-left transition-all cursor-pointer group"
                            >
                              <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-jp font-bold text-base text-zinc-100 group-hover:text-purple-300 transition-colors">
                                    {comp.word}
                                  </span>
                                  <span className="font-jp text-xs text-zinc-400">
                                    {comp.reading}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-300 truncate">
                                  {comp.meaning}
                                </p>
                              </div>
                              {comp.level && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${getJlptLevelBadgeClass(comp.level)}`}>
                                  {comp.level}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-zinc-400 text-sm">
                  Từ này không chứa chữ Hán tự (Kanji).
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MẪU CÂU (Exact matching with Image 4) */}
          {activeTab === 'examples' && (
            <div className="space-y-6 animate-fadeIn">
              {displayData.examples && displayData.examples.length > 0 ? (
                displayData.examples.map((ex, exIdx) => {
                  const tokens = parseSentenceRuby(ex.furigana || '', ex.japanese);
                  return (
                    <div key={`ex-${exIdx}`} className="space-y-3 border-b border-zinc-800/80 pb-5 last:border-b-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          {/* Sentence with Furigana on top and Romaji underneath */}
                          <div className="flex items-start gap-2">
                            <span className="text-zinc-400 text-lg leading-tight shrink-0 mt-1">•</span>
                            <div className="space-y-1">
                              {/* Japanese with furigana */}
                              <div className="flex flex-wrap items-end gap-x-1 gap-y-1 leading-relaxed text-base sm:text-lg font-jp font-bold text-white">
                                {tokens.map((tok, tIdx) => (
                                  <span key={`t-${tIdx}`} className="inline-flex flex-col items-center justify-end leading-none align-bottom">
                                    {tok.furigana ? (
                                      <span className="text-[10px] sm:text-[11px] font-normal text-zinc-300 select-none pb-0.5">
                                        {tok.furigana}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] sm:text-[11px] opacity-0 select-none pb-0.5">
                                        &nbsp;
                                      </span>
                                    )}
                                    <span>{tok.text}</span>
                                  </span>
                                ))}
                              </div>

                              {/* Romaji underneath */}
                              <div className="text-xs font-mono text-zinc-400 tracking-tight leading-normal">
                                {ex.romaji || tokens.map(t => t.romaji).filter(Boolean).join(' ')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Speaker Button */}
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(ex.japanese, `ex-${exIdx}`)}
                          className={`p-1.5 transition cursor-pointer shrink-0 ${
                            isPlayingAudio && playingWordKey === `ex-${exIdx}`
                              ? 'text-purple-400 scale-110'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title="Nghe câu ví dụ"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Vietnamese Translation */}
                      <div className="pl-5 text-sm sm:text-base text-zinc-300 font-normal leading-relaxed">
                        {ex.vietnamese}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-zinc-400 text-sm">
                  Đang cập nhật câu ví dụ mẫu cho từ này.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default React.memo(JlptWordDetailModal);
