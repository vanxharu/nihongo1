/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateSRS } from '../utils/srs';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Volume2, 
  Settings, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  HelpCircle, 
  Layers, 
  CheckCircle, 
  XCircle, 
  Check, 
  BookOpen, 
  Play, 
  TrendingUp,
  Download,
  MessageSquare,
  Star,
  Music,
  Maximize2,
  Minimize2,
  X,
  Flame,
  GraduationCap,
  Award,
  Sun,
  Calendar,
  Search,
  Eye,
  EyeOff,
  Lightbulb,
  FastForward,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VocabularyItem, UserProfile, LearningPosition } from '../types';
import { VOCABULARY_DATA } from '../data';
import { 
  getHanViet, 
  getSentenceFuriganaParts, 
  alignWordFurigana,
  cleanVocabSymbols, 
  sanitizeVocabItem,
  ensureVocabExample,
  katakanaToHiragana,
  hiraganaToKatakana,
  isKatakana,
  normalizeLongVowels
} from '../utils/japaneseUtils';
import { getKanjiCategory, autoFixClientBreakdown } from '../utils/kanjiHelper';
import { getKanjiAssociativeColor, getWordAssociativeColor } from '../utils/associativeColorHelper';
import KanjiDetailModal from './KanjiDetailModal';
import PitchAccentDisplay from './PitchAccentDisplay';
import { SelectiveFuriganaWord } from './JapaneseFuriganaText';
import VocabListItemCard from './VocabListItemCard';
import { playCorrectSound, playIncorrectSound, speakJapanese } from '../utils/audio';
import { useAuth } from '../contexts/AuthContext';
import { safeFetchJson } from '../utils/safeApi';

// Module-level client cache for Kanji Breakdowns
const clientKanjiBreakdownCache = new Map<string, any>();

// Romaji to Hiragana basic converter for Cram mode
const ROMAJI_TO_KANA: Record<string, string> = {
  'a':'あ','i':'い','u':'う','e':'え','o':'お',
  'ka':'か','ki':'き','ku':'く','ke':'け','ko':'こ',
  'sa':'さ','shi':'し','si':'し','su':'す','se':'せ','so':'そ',
  'ta':'た','chi':'ち','ti':'てぃ','tsu':'つ','tu':'つ','te':'て','to':'と',
  'na':'な','ni':'に','nu':'ぬ','ne':'ね','no':'の',
  'ha':'は','hi':'ひ','fu':'ふ','hu':'ふ','he':'へ','ho':'ほ',
  'ma':'ま','mi':'み','mu':'む','me':'め','mo':'も',
  'ya':'や','yu':'ゆ','yo':'よ',
  'ra':'ら','ri':'り','ru':'る','re':'れ','ro':'ろ',
  'la':'ら','li':'り','lu':'る','le':'れ','lo':'ろ',
  'wa':'わ','wo':'を','yi':'い','ye':'いぇ','wi':'うぃ','we':'うぇ',
  'ga':'が','gi':'ぎ','gu':'ぐ','ge':'げ','go':'ご',
  'za':'ざ','ji':'じ','zi':'じ','zu':'ず','ze':'ぜ','zo':'ぞ',
  'da':'だ','di':'でぃ','du':'づ','de':'で','do':'ど',
  'ba':'ば','bi':'び','bu':'ぶ','be':'べ','bo':'ぼ',
  'pa':'ぱ','pi':'ぴ','pu':'ぷ','pe':'ぺ','po':'ぽ',
  // Combos
  'kya':'きゃ','kyu':'きゅ','kyo':'きょ','kye':'きぇ','kyi':'きぃ',
  'sha':'しゃ','shu':'しゅ','sho':'しょ','she':'しぇ','sya':'しゃ','syu':'しゅ','syo':'しょ','sye':'しぇ',
  'cha':'ちゃ','chu':'ちゅ','cho':'ちょ','che':'ちぇ','cya':'ちゃ','cyu':'ちゅ','cyo':'ちょ','cye':'ちぇ','tya':'ちゃ','tyu':'ちゅ','tyo':'ちょ','tye':'ちぇ',
  'nya':'にゃ','nyu':'にゅ','nyo':'にょ','nye':'にぇ','nyi':'にぃ',
  'hya':'ひゃ','hyu':'ひゅ','hyo':'ひょ','hye':'ひぇ','hyi':'ひぃ',
  'mya':'みゃ','myu':'みゅ','myo':'みょ','mye':'みぇ','myi':'みぃ',
  'rya':'りゃ','ryu':'りゅ','ryo':'りょ','rye':'りぇ','ryi':'りぃ',
  'gya':'ぎゃ','gyu':'ぎゅ','gyo':'ぎょ','gye':'ぎぇ','gyi':'ぎぃ',
  'ja':'じゃ','ju':'じゅ','jo':'じょ','je':'じぇ','jya':'じゃ','jyu':'じゅ','jyo':'じょ','jye':'じぇ','zya':'じゃ','zyu':'じゅ','zyo':'じょ','zye':'じぇ',
  'bya':'びゃ','byu':'びゅ','byo':'びょ','bye':'びぇ','byi':'びぃ',
  'pya':'ぴゃ','pyu':'ぴゅ','pyo':'ぴょ','pye':'ぴぇ','pyi':'ぴぃ',
  // Foreign/Katakana extended sounds
  'fa':'ふぁ','fi':'ふぃ','fe':'ふぇ','fo':'ふぉ','fyu':'ふゅ',
  'thi':'てぃ','thu':'とぅ',
  'dhi':'でぃ','dhu':'どぅ',
  'tsa':'つぁ','tsi':'つぃ','tse':'つぇ','tso':'つぉ',
  'va':'ゔぁ','vi':'ゔぃ','vu':'ゔ','ve':'ゔぇ','vo':'ゔぉ',
  'wha':'うぁ','whi':'うぃ','whe':'うぇ','who':'うぉ',
  'xa':'ぁ','xi':'ぃ','xu':'ぅ','xe':'ぇ','xo':'ぉ',
  'xtu':'っ','ltu':'っ','xtsu':'っ','ltsu':'っ',
  'xya':'ゃ','xyu':'ゅ','xyo':'ょ',
  'lya':'ゃ','lyu':'ゅ','lyo':'ょ',
};

function convertRomajiToHiragana(text: string, isFinal = false): string {
  let result = '';
  let i = 0;
  const str = text.toLowerCase();
  while (i < str.length) {
    // 0. Convert tildes (~ or ～) to Japanese wave dash (〜) and hyphen (-) to (ー)
    if (str[i] === '~' || str[i] === '～') {
      result += '〜';
      i += 1;
      continue;
    }
    if (str[i] === '-') {
      result += 'ー';
      i += 1;
      continue;
    }

    // 1. Check for double consonants (sokuon) e.g., 'kk', 'tt', etc.
    if (
      i + 1 < str.length &&
      str[i] === str[i + 1] &&
      !'aeiouyn'.includes(str[i])
    ) {
      result += 'っ';
      i += 1;
      continue;
    }

    // 2. Check for Hepburn double consonant 'tch' -> 'っち'
    if (
      i + 2 < str.length &&
      str[i] === 't' &&
      str[i + 1] === 'c' &&
      str[i + 2] === 'h'
    ) {
      result += 'っ';
      i += 1;
      continue;
    }

    // 3. Match 4-character romaji syllables
    if (i + 4 <= str.length && ROMAJI_TO_KANA[str.slice(i, i + 4)]) {
      result += ROMAJI_TO_KANA[str.slice(i, i + 4)];
      i += 4;
    }
    // 4. Match 3-character romaji syllables
    else if (i + 3 <= str.length && ROMAJI_TO_KANA[str.slice(i, i + 3)]) {
      result += ROMAJI_TO_KANA[str.slice(i, i + 3)];
      i += 3;
    }
    // 5. Match 2-character romaji syllables
    else if (i + 2 <= str.length && ROMAJI_TO_KANA[str.slice(i, i + 2)]) {
      result += ROMAJI_TO_KANA[str.slice(i, i + 2)];
      i += 2;
    }
    // 6. Match 1-character romaji syllables
    else if (ROMAJI_TO_KANA[str[i]]) {
      result += ROMAJI_TO_KANA[str[i]];
      i += 1;
    }
    // 7. Special handle for 'n'
    else if (str[i] === 'n') {
      if (i + 1 < str.length && str[i + 1] === 'n') {
        result += 'ん';
        i += 2;
      }
      else if (i + 1 < str.length && !'aeiouy'.includes(str[i + 1])) {
        result += 'ん';
        i += 1;
      }
      else if (i + 1 === str.length && isFinal) {
        result += 'ん';
        i += 1;
      }
      else {
        result += text[i];
        i += 1;
      }
    }
    else {
      result += text[i];
      i += 1;
    }
  }
  return result;
}

// Splits a sentence into 3-4 semantic pieces for shadowing reorder
function splitJapaneseSentence(sentence: string): string[] {
  const clean = sentence.trim();
  const particles = /(?<=は|が|を|に|で|と|も|から|まで|、|。)/g;
  let parts = clean.split(particles).map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) {
    const len = clean.length;
    const chunkLen = Math.max(3, Math.ceil(len / 3));
    parts = [];
    for (let i = 0; i < len; i += chunkLen) {
      parts.push(clean.slice(i, i + chunkLen));
    }
  }
  return parts;
}

interface VocabularyPracticeProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onEarnXp: (amount: number) => void;
}

const KANJI_COMMON_READINGS: Record<string, string[]> = {
  '私': ['わたし', 'わたくし', 'し'],
  '先': ['せん', 'さき'],
  '生': ['せい', 'しょう', 'う', 'なま', 'い'],
  '学': ['がく', 'がっ', 'まな'],
  '会': ['かい', 'え', 'あ'],
  '社': ['しゃ', 'じゃ'],
  '員': ['いん'],
  '医': ['い'],
  '者': ['しゃ', 'もの'],
  '大': ['だい', 'たい', 'おお'],
  '本': ['ほん', 'ぽん', 'ぼん', 'もと'],
  '中': ['ちゅう', 'じゅう', 'なか'],
  '国': ['こく', 'ごく', 'くに'],
  '語': ['ご', 'かた'],
  '何': ['なん', 'なに'],
  '時': ['じ', 'とき', 'どき'],
  '日': ['にち', 'じつ', 'び', 'ひ', 'か', 'に'],
  '月': ['げつ', 'がつ', 'つき'],
  '年': ['ねん', 'とし'],
  '週': ['しゅう'],
  '行': ['こう', 'ぎょう', 'い', 'おこな', 'ゆ'],
  '来': ['らい', 'き', 'く', 'こ'],
  '帰': ['き', 'かえ'],
  '見': ['けん', 'み'],
  '聞': ['ぶん', 'き'],
  '読': ['どく', 'よ'],
  '書': ['しょ', 'か'],
  '話': ['わ', 'はな'],
  '買': ['ばい', 'か'],
  '食': ['しょく', 'た', 'く'],
  '飲': ['いん', 'の'],
  '休': ['きゅう', 'やす'],
  '出': ['しゅつ', 'しゅっ', 'で', 'だ'],
  '入': ['にゅう', 'はい', 'い'],
  '車': ['しゃ', 'くるま'],
  '電': ['でん'],
  '駅': ['えき'],
  '新': ['しん', 'あたら'],
  '古': ['こ', 'ふる'],
  '高': ['こう', 'たか'],
  '安': ['あん', 'やす'],
  '友': ['ゆう', 'とも'],
  '人': ['じん', 'にん', 'ひと', 'びと', 'り'],
  '名': ['めい', 'みょう', 'な'],
  '前': ['ぜん', 'まえ'],
  '後': ['ご', 'こう', 'あと', 'うしろ'],
  '午': ['ご'],
  '朝': ['ちょう', 'あさ'],
  '昼': ['ちゅう', 'ひる'],
  '晩': ['ばん'],
  '夜': ['や', 'よる'],
  '父': ['ちち', 'とう'],
  '母': ['はは', 'かあ'],
  '子': ['し', 'こ'],
  '男': ['おとこ', 'だん'],
  '女': ['おんな', 'じょ'],
  '犬': ['いぬ'],
  '猫': ['ねこ'],
  '魚': ['さかな'],
  '肉': ['にく'],
  '水': ['みず', 'すい'],
  '火': ['か', 'ひ', 'び'],
  '木': ['もく', 'き'],
  '金': ['かね', 'きん'],
  '土': ['ど', 'つち'],
  '山': ['さん', 'やま'],
  '川': ['かわ', 'がわ'],
  '田': ['た', 'だ'],
  '口': ['くち', 'ぐち', 'こう'],
  '手': ['て', 'しゅ'],
  '足': ['あし', 'そく'],
  '目': ['め', 'もく'],
  '耳': ['みみ', 'じ'],
  '花': ['はな', 'か'],
  '雨': ['あめ', 'あま', 'う'],
  '天': ['てん', 'あま'],
  '気': ['き'],
  '多': ['おお', 'た'],
  '少': ['すこ', 'すく', 'しょう'],
  '上': ['うえ', 'じょう', 'あ', 'うわ'],
  '下': ['した', 'か', 'げ', 'くだ', 'さ'],
  '左': ['ひだり', 'さ'],
  '右': ['みぎ', 'う', 'ゆう'],
  '外': ['そと', 'がい'],
  '内': ['うち', 'ない'],
  '東': ['ひがし', 'とう'],
  '西': ['にし', 'せい', 'さい'],
  '南': ['みなみ', 'なん'],
  '北': ['きた', 'ほく'],
  '病': ['びょう'],
  '院': ['いん'],
  '銀': ['ぎん'],
  '究': ['きゅう'],
  '研': ['けん'],
  '校': ['こう', 'っこう'],
  '教': ['きょう', 'おし'],
  '文': ['ぶん', 'もん'],
  '地': ['ち', 'じ'],
  '図': ['ず', 'と'],
  '万': ['まん', 'ばん'],
  '百': ['ひゃく', 'びゃく', 'ぴゃく'],
  '千': ['せん', 'ぜん'],
  '円': ['えん'],
  '歳': ['さい', 'せい'],
  '物': ['もの', 'ぶつ', 'もつ'],
  '毎': ['まい'],
  '半': ['はん'],
  '空': ['そら', 'くう'],
  '道': ['みち', 'どう'],
  '林': ['はやし', 'りん'],
  '森': ['もり', 'しん'],
  '海': ['うみ', 'かい'],
  '化': ['か', 'け'],
  '工': ['こう'],
  '作': ['つく', 'さく'],
  '館': ['かん'],
  '所': ['ところ', 'しょ', 'じょ'],
  '室': ['しつ'],
  '持': ['も', 'じ'],
  '待': ['ま', 'たい'],
  '使': ['つか', 'し'],
  '強': ['つよ', 'きょう'],
  '勉': ['べん'],
  '習': ['なら', 'しゅう'],
  '旅': ['りょ', 'たび'],
  '曜': ['よう'],
  '親': ['おや', 'しん'],
  '切': ['き', 'せつ'],
  '英': ['えい'],
  '店': ['みせ', 'てん'],
  '茶': ['ちゃ', 'さ'],
  '動': ['うご', 'どう'],
  '送': ['おく', 'そう'],
  '配': ['はい', 'ぱい', 'くば'],
  '薬': ['くすり', 'やく'],
  '急': ['いそ', 'きゅう'],
  '乗': ['の', 'じょう'],
  '降': ['お', 'ふ', 'こう'],
  '開': ['あ', 'ひら', 'かい'],
  '閉': ['し', 'と', 'へい'],
  '返': ['かえ', 'へん'],
  '借': ['か', 'しゃく', 'しゃっ'],
  '貸': ['か', 'たい'],
  '通': ['とお', 'かよ', 'つう'],
  '死': ['し'],
  '意': ['い'],
  '味': ['あじ', 'み'],
  '考': ['かんが', 'こう'],
  '思': ['おも', 'し'],
  '知': ['し', 'ち'],
  '同': ['おな', 'どう'],
  '仕': ['つか', 'し', 'じ'],
  '事': ['こと', 'ごと', 'じ'],
  '業': ['ぎょう', 'ごう'],
  '音': ['おと', 'おん'],
  '楽': ['たの', 'がく', 'らく'],
  '歌': ['うた', 'か'],
  '写': ['うつ', 'しゃ'],
  '真': ['ま', 'しん'],
  '画': ['え', 'が', 'かく'],
  '映': ['うつ', 'えい'],
  '宿': ['やど', 'しゅく'],
  '題': ['だい'],
  '春': ['はる', 'しゅん'],
  '夏': ['なつ', 'か'],
  '秋': ['あき', 'しゅう'],
  '冬': ['ふゆ', 'とう'],
  '風': ['かぜ', 'ふう'],
  '寒': ['さむ', 'かん'],
  '暑': ['あつ', 'しょ'],
  '重': ['おも', 'じゅう'],
  '軽': ['かる', 'けい'],
  '暗': ['くら', 'あん'],
  '広': ['ひろ', 'こう'],
  '低': ['ひく', 'てい'],
  '弱': ['よわ', 'じゃく'],
  '良': ['よ', 'りょう'],
  '試': ['ため', 'し'],
  '験': ['けん', 'げん'],
  '説': ['せつ'],
  '明': ['あか', 'あ', 'めい'],
  '言': ['い', 'げん', 'ご'],
  '伝': ['つた', 'でん'],
  '体': ['からだ', 'たい'],
  '頭': ['あたま', 'とう'],
  '顔': ['かお', 'がん'],
  '首': ['くび', 'しゅ'],
  '骨': ['ほね', 'こつ'],
  '毛': ['け', 'もう'],
  '赤': ['あか', 'せき'],
  '青': ['あお', 'せい'],
  '白': ['しろ', 'はく'],
  '黒': ['くろ', 'こく'],
  '自': ['みずか', 'じ', 'し'],
  '由': ['よし', 'ゆう', 'ゆ'],
  '運': ['はこ', 'うん'],
  '転': ['ころ', 'てん'],
  '発': ['はつ', 'ぱつ', 'はっ', 'ぱっ'],
  '売': ['う', 'ばい'],
  '機': ['き'],
  '冷': ['つめ', 'ひ', 'れい'],
  '温': ['あたた', 'おん'],
  '料': ['りょう'],
  '無': ['な', 'む'],
  '提': ['てい'],
  '供': ['とも', 'ども', 'きょう'],
  '能': ['のう'],
  '平': ['ひら', 'たいら', 'へい'],
  '完': ['かん'],
  '成': ['せい'],
  '精': ['せい'],
  '神': ['かみ', 'がみ', 'しん'],
  '受': ['う', 'じゅ'],
  '継': ['つ', 'けい'],
  '相': ['あい', 'そう'],
  '的': ['てき'],
  '方': ['かた', 'ほう'],
  '法': ['ほう', 'ぽう', 'はっ', 'ぽう'],
  '必': ['ひつ', 'ひっ'],
  '要': ['い', 'よう'],
  '係': ['かか', 'けい'],
  '影': ['かげ', 'えい'],
  '響': ['ひび', 'きょう'],
  '功': ['こう'],
  '失': ['うしな', 'しつ', 'しっ'],
  '敗': ['はい', 'ぱい'],
  '経': ['けい'],
  '識': ['しき'],
  '力': ['ちから', 'りょく', 'りき'],
  '努': ['つと', 'ど'],
  '解': ['と', 'かい'],
  '決': ['き', 'けつ', 'けっ'],
  '情': ['なさけ', 'じょう'],
  '報': ['むく', 'ほう'],
  '連': ['つ', 'れん'],
  '絡': ['らく'],
  '談': ['だん'],
  '調': ['しら', 'ちょう'],
  '査': ['さ'],
  '確': ['たし', 'かく'],
  '認': ['みと', 'にん'],
  '参': ['まい', 'さん'],
  '加': ['くわ', 'か'],
  '反': ['はん'],
  '対': ['たい'],
  '賛': ['さん'],
  '可': ['か'],
  '増': ['ふ', 'ま', 'ぞう'],
  '減': ['へ', 'げん'],
  '展': ['てん'],
  '歩': ['ある', 'あゆ', 'ほ', 'ぽ'],
  '統': ['とう'],
  '慣': ['な', 'かん'],
  '態': ['たい'],
  '度': ['ど']
};

const partitionCache = new Map<string, string[]>();

function findBestFuriganaPartition(kanjiString: string, readingString: string): string[] {
  const K = kanjiString.length;
  if (K === 0) return [];
  if (K === 1) return [readingString];

  const cacheKey = `${kanjiString}|${readingString}`;
  if (partitionCache.has(cacheKey)) {
    return partitionCache.get(cacheKey)!;
  }

  // Safety threshold to avoid exponential backtracking on long compounds
  if (K > 5) {
    const result: string[] = [];
    const partLen = Math.max(1, Math.round(readingString.length / K));
    for (let i = 0; i < K; i++) {
      if (i === K - 1) {
        result.push(readingString.slice(i * partLen));
      } else {
        result.push(readingString.slice(i * partLen, (i + 1) * partLen));
      }
    }
    partitionCache.set(cacheKey, result);
    return result;
  }

  // Helper to get common readings
  const getReadings = (char: string): string[] => {
    if (!/[\u4e00-\u9faf]/.test(char)) {
      return [char];
    }
    return KANJI_COMMON_READINGS[char] || [];
  };

  let bestPartition: string[] | null = null;
  let bestScore = -Infinity;

  function backtrack(charIndex: number, currentStrIndex: number, currentPartition: string[], currentScore: number) {
    if (charIndex === K) {
      if (currentStrIndex === readingString.length) {
        if (currentScore > bestScore) {
          bestScore = currentScore;
          bestPartition = [...currentPartition];
        }
      }
      return;
    }

    const remainingChars = K - charIndex;
    const maxLen = readingString.length - currentStrIndex - remainingChars + 1;

    for (let len = 1; len <= maxLen; len++) {
      const part = readingString.slice(currentStrIndex, currentStrIndex + len);
      const kanjiChar = kanjiString[charIndex];
      const isKanjiChar = /[\u4e00-\u9faf]/.test(kanjiChar);
      const knownReadings = getReadings(kanjiChar);

      let score = 0;
      if (!isKanjiChar) {
        if (part === kanjiChar) {
          score = 50;
        } else {
          score = -50;
        }
      } else {
        if (knownReadings.includes(part)) {
          score = 15;
        } else if (knownReadings.some(r => r.startsWith(part) || part.startsWith(r))) {
          score = 3;
        } else {
          if (len === 1 || len === 2) {
            score = 1;
          } else if (len === 3) {
            score = 0;
          } else {
            score = -5;
          }
        }
      }

      backtrack(
        charIndex + 1,
        currentStrIndex + len,
        [...currentPartition, part],
        currentScore + score
      );
    }
  }

  backtrack(0, 0, [], 0);

  let finalResult: string[];
  if (bestPartition) {
    finalResult = bestPartition;
  } else {
    // Fallback: split proportionally
    const result: string[] = [];
    const partLen = Math.max(1, Math.round(readingString.length / K));
    for (let i = 0; i < K; i++) {
      if (i === K - 1) {
        result.push(readingString.slice(i * partLen));
      } else {
        result.push(readingString.slice(i * partLen, (i + 1) * partLen));
      }
    }
    finalResult = result;
  }

  partitionCache.set(cacheKey, finalResult);
  return finalResult;
}

interface TextToken {
  type: 'kanji' | 'kana';
  text: string;
  reading?: string;
}

function tokenizeWithFurigana(kanjiString: string = '', readings: string[] = []): TextToken[] {
  const safeStr = kanjiString || '';
  const safeReadings = readings || [];
  const tokens: TextToken[] = [];
  for (let i = 0; i < safeStr.length; i++) {
    const char = safeStr[i];
    const isKanji = /[\u4e00-\u9faf]/.test(char);
    const reading = safeReadings[i] || '';
    
    if (isKanji) {
      tokens.push({ type: 'kanji', text: char, reading });
    } else {
      const lastToken = tokens[tokens.length - 1];
      if (lastToken && lastToken.type === 'kana') {
        lastToken.text = (lastToken.text || '') + char;
      } else {
        tokens.push({ type: 'kana', text: char });
      }
    }
  }
  return tokens;
}

export interface VocabModeSettings {
  showFurigana: boolean;
  showExampleFurigana: boolean;
  showPitchAccent: boolean;
  showRomaji: boolean;
  autoAdvance: boolean;
  studyDirection: 'JP_VI' | 'VI_JP';
}

export const VOCAB_MODE_DEFAULTS: Record<'flashcard' | 'quiz' | 'cram' | 'dokkai' | 'shadowing', VocabModeSettings> = {
  flashcard: {
    showFurigana: true,
    showExampleFurigana: true,
    showPitchAccent: true,
    showRomaji: false,
    autoAdvance: false,
    studyDirection: 'JP_VI',
  },
  quiz: {
    showFurigana: true,
    showExampleFurigana: true,
    showPitchAccent: true,
    showRomaji: false,
    autoAdvance: false, // Tắt tự chuyển để người học chủ động xem giải thích đáp án
    studyDirection: 'JP_VI',
  },
  cram: {
    showFurigana: false, // Ẩn khi đang gõ từ vựng để rèn luyện trí nhớ
    showExampleFurigana: true,
    showPitchAccent: false,
    showRomaji: false,
    autoAdvance: true, // Gõ đúng tự động chuyển sang từ tiếp theo
    studyDirection: 'JP_VI',
  },
  dokkai: {
    showFurigana: true,
    showExampleFurigana: true,
    showPitchAccent: false,
    showRomaji: false,
    autoAdvance: false,
    studyDirection: 'JP_VI',
  },
  shadowing: {
    showFurigana: true,
    showExampleFurigana: true,
    showPitchAccent: true,
    showRomaji: false,
    autoAdvance: false,
    studyDirection: 'JP_VI',
  },
};

export const getVocabModeSettings = (mode: 'flashcard' | 'quiz' | 'cram' | 'dokkai' | 'shadowing'): VocabModeSettings => {
  try {
    const saved = localStorage.getItem(`jlpt_vocab_mode_settings_${mode}`);
    if (saved) {
      return { ...VOCAB_MODE_DEFAULTS[mode], ...JSON.parse(saved) };
    }
  } catch {}
  return VOCAB_MODE_DEFAULTS[mode];
};

export const saveVocabModeSettings = (mode: 'flashcard' | 'quiz' | 'cram' | 'dokkai' | 'shadowing', settings: Partial<VocabModeSettings>) => {
  try {
    const current = getVocabModeSettings(mode);
    const updated = { ...current, ...settings };
    localStorage.setItem(`jlpt_vocab_mode_settings_${mode}`, JSON.stringify(updated));
  } catch {}
};

export default function VocabularyPractice({ userProfile, updateProfile, onEarnXp }: VocabularyPracticeProps) {
  const [vocabData, setVocabData] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    let isMounted = true;
    const fetchVocabularies = async () => {
      try {
        const result = await safeFetchJson<VocabularyItem[]>('/api/vocabularies');
        if (isMounted && result.ok && Array.isArray(result.data) && result.data.length > 0) {
          setVocabData(result.data.map(v => sanitizeVocabItem(v)));
          setLoading(false);
          return;
        }
      } catch {
        // Fallback below
      }

      if (isMounted) {
        // High resilience fallback: full static dataset
        const fallbackList: VocabularyItem[] = VOCABULARY_DATA.map(v => sanitizeVocabItem({
          ...v,
          hanViet: v.hanViet || getHanViet(v.kanji || '')
        }));
        setVocabData(fallbackList);
        setLoading(false);
      }
    };

    fetchVocabularies();
    return () => {
      isMounted = false;
    };
  }, []);


  const { user } = useAuth();

  // Level filter state - initialized from last saved position if authenticated
  const [levelFilter, setLevelFilter] = useState<string>(() => {
    if (!user) return 'N4';
    const pos = userProfile?.lastPosition;
    if (pos?.tab === 'vocabulary' && pos.level) {
      return pos.level;
    }
    return userProfile?.targetLevel || 'N4';
  });

  // Curriculum selection state: 'minna' (Minna no Nihongo) or 'tango' (Tango 1500)
  const [selectedCurriculum, setSelectedCurriculum] = useState<'minna' | 'tango'>(() => {
    return userProfile?.selectedCurriculum || 'minna';
  });

  const handleCurriculumChange = (curr: 'minna' | 'tango') => {
    setSelectedCurriculum(curr);
    updateProfile({ selectedCurriculum: curr });
    setCurrentLessonIndex(0);
    setCurrentIndex(0);
  };

  // App States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'flashcard' | 'quiz' | 'cram' | 'dokkai' | 'shadowing'>(() => {
    if (!user) return 'flashcard';
    const pos = userProfile?.lastPosition;
    if (pos?.tab === 'vocabulary' && pos.mode) {
      return pos.mode as any;
    }
    return 'flashcard';
  });

  // Filter vocab by selected level & selected curriculum
  const filteredVocab = useMemo(() => {
    const list = vocabData.filter(v => {
      const matchLevel = levelFilter === 'ALL' ? true : v.level === levelFilter;
      const matchCurriculum = v.curriculum 
        ? v.curriculum === selectedCurriculum 
        : (selectedCurriculum === 'tango' ? v.id.startsWith('v_tango') : !v.id.startsWith('v_tango'));
      return matchLevel && matchCurriculum;
    });

    const levelOrderMap: Record<string, number> = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
    return [...list].sort((a, b) => {
      const lvlA = levelOrderMap[a.level] || 99;
      const lvlB = levelOrderMap[b.level] || 99;
      if (lvlA !== lvlB) return lvlA - lvlB;

      if (selectedCurriculum === 'tango') {
        const chA = parseInt(a.lessonId?.match(/ch(\d+)/)?.[1] || '0', 10);
        const chB = parseInt(b.lessonId?.match(/ch(\d+)/)?.[1] || '0', 10);
        if (chA !== chB) return chA - chB;
        const secA = parseInt(a.lessonId?.match(/sec(\d+)/)?.[1] || '0', 10);
        const secB = parseInt(b.lessonId?.match(/sec(\d+)/)?.[1] || '0', 10);
        if (secA !== secB) return secA - secB;
        return (a.originalNumber || 0) - (b.originalNumber || 0);
      }

      const numA = parseInt(a.lessonId?.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.lessonId?.match(/\d+/)?.[0] || '0', 10);
      if (numA !== numB) return numA - numB;

      const idA = parseInt(String(a.id || '').replace(/\D/g, '') || '0', 10);
      const idB = parseInt(String(b.id || '').replace(/\D/g, '') || '0', 10);
      return idA - idB;
    });
  }, [vocabData, levelFilter, selectedCurriculum]);
  
  // Lessons group
  // SRS due items should include any studied item within the allowed target levels
  const srsDueItems = useMemo(() => {
    const now = new Date();
    return filteredVocab.filter(v => {
      const s = userProfile.vocabStatus[v.id] as any;
      if (s && typeof s === 'object' && s.nextReviewDate) {
        return new Date(s.nextReviewDate) <= now;
      }
      return false;
    });
  }, [filteredVocab, userProfile.vocabStatus]);

  const QUIZ_PRAISES = [
    '🎉 Đỉnh nóc kịch trần bay phấp phới! Não bộ siêu cấp N1!',
    '⚡ Quá chuẩn! Người Nhật nghe xong cũng phải gật gù bái phục!',
    '🌟 10 điểm không có nhưng! Tốc độ phản xạ như chớp giật!',
    '🔥 Trí nhớ đỉnh cao, xứng danh cao thủ tiếng Nhật số 1!',
    '👑 Tuyệt cú mèo! Não nhảy số nhanh hơn cả tàu Shinkansen!',
    '🏆 Chuẩn không cần chỉnh! Một phát ăn ngay, đỉnh của chóp!'
  ];

  const QUIZ_ROASTS = [
    '😅 Úi chà, chọn câu này thì người Nhật nghe xong cũng sang chấn tâm lý luôn đấy!',
    '🥶 Sai rồi đồng chí ơi! Học hành kiểu này qua Tokyo khéo đi lạc tới Bắc Cực!',
    '🎯 Khai thật đi, tổ tiên mách bảo nhầm địa chỉ đúng không?',
    '💀 Sai bét nhè! Mau uống hớp nước lọc cho tỉnh táo rồi làm lại nào!',
    '🍵 Ây da, chọn đáp án này thì thầy cô Minna khóc thét trong góc phòng!',
    '👀 Khoanh bừa lộ liễu quá nha! Hãy nhìn kỹ lại từ vựng nào!'
  ];

  const [quizFeedbackMessage, setQuizFeedbackMessage] = useState<string>('');

  const baseLessons = useMemo(() => {
    const levelOrder: Record<string, number> = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
    const uniqueIds = Array.from(new Set(filteredVocab.map(v => v.lessonId)));
    return uniqueIds.map((id: string) => {
      const firstMatch = filteredVocab.find(v => v.lessonId === id);
      // Extract lesson number properly: look for number after mn or at end, or from lessonName
      let lessonNumber: number | null = null;
      if (firstMatch?.lessonName) {
        const nameMatch = firstMatch.lessonName.match(/(?:bài|lesson)\s*(\d+)/i);
        if (nameMatch) lessonNumber = parseInt(nameMatch[1], 10);
      }
      if (lessonNumber === null) {
        const idClean = id.replace(/^[nN]\d+[_/]/i, '');
        const idMatch = idClean.match(/(\d+)/);
        if (idMatch) lessonNumber = parseInt(idMatch[1], 10);
      }
      return { 
        id, 
        name: firstMatch?.lessonName || 'Bài học từ vựng',
        lessonTitleJp: firstMatch?.lessonTitleJp,
        level: firstMatch?.level || 'N4',
        lessonNumber,
        chapter: firstMatch?.chapter,
        section: firstMatch?.section
      };
    }).sort((a, b) => {
      const levelA = levelOrder[a.level] || 99;
      const levelB = levelOrder[b.level] || 99;
      if (levelA !== levelB) return levelA - levelB;
      if (selectedCurriculum === 'tango') {
        const chA = parseInt(a.id.match(/ch(\d+)/)?.[1] || '0', 10);
        const chB = parseInt(b.id.match(/ch(\d+)/)?.[1] || '0', 10);
        if (chA !== chB) return chA - chB;
        const secA = parseInt(a.id.match(/sec(\d+)/)?.[1] || '0', 10);
        const secB = parseInt(b.id.match(/sec(\d+)/)?.[1] || '0', 10);
        return secA - secB;
      }
      if (a.lessonNumber !== null && b.lessonNumber !== null) {
        return a.lessonNumber - b.lessonNumber;
      }
      if (a.lessonNumber !== null) return -1;
      if (b.lessonNumber !== null) return 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }, [filteredVocab, selectedCurriculum]);
  
  const [srsActiveSessionItems, setSrsActiveSessionItems] = useState<VocabularyItem[] | null>(null);
  const [isSrsReviewActive, setIsSrsReviewActive] = useState(false);

  const lessons = baseLessons;

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isQuickLessonSelectorOpen, setIsQuickLessonSelectorOpen] = useState(false);
  const [quickLessonSearch, setQuickLessonSearch] = useState('');

  // Map counts per lesson for quick reference
  const lessonVocabCountMap = useMemo(() => {
    const counts: Record<string, { total: number; learned: number }> = {};
    filteredVocab.forEach(v => {
      if (!counts[v.lessonId]) {
        counts[v.lessonId] = { total: 0, learned: 0 };
      }
      counts[v.lessonId].total++;
      if (userProfile.vocabStatus?.[v.id] === 'mastered' || userProfile.vocabStatus?.[v.id] === 'learning') {
        counts[v.lessonId].learned++;
      }
    });
    return counts;
  }, [filteredVocab, userProfile.vocabStatus]);

  // Filter lessons for quick picker
  const quickFilteredLessons = useMemo(() => {
    if (!quickLessonSearch.trim()) return lessons;
    const q = quickLessonSearch.toLowerCase().trim();
    return lessons.filter(l => 
      l.name.toLowerCase().includes(q) || 
      (l.lessonNumber !== null && l.lessonNumber.toString().includes(q)) ||
      (l.lessonTitleJp && l.lessonTitleJp.toLowerCase().includes(q))
    );
  }, [lessons, quickLessonSearch]);

  // Reset currentLessonIndex when lessons change or levelFilter changes ONLY if already restored and index out of bounds
  useEffect(() => {
    if (isRestoredRef.current && currentLessonIndex >= lessons.length && lessons.length > 0) {
      setCurrentLessonIndex(0);
      setCurrentIndex(0);
    }
  }, [lessons.length, currentLessonIndex]);

  // Safely restore or set current indices on initial load
  const isRestoredRef = useRef(false);

  useEffect(() => {
    if (isRestoredRef.current || lessons.length === 0 || lessons[0]?.id === 'default') return;

    if (!user) {
      setCurrentLessonIndex(0);
      setCurrentIndex(0);
      setSelectedMode('flashcard');
      isRestoredRef.current = true;
      return;
    }

    const pos = userProfile?.lastPosition?.tab === 'vocabulary' ? userProfile.lastPosition : null;

    if (pos) {
      if (pos.level && pos.level !== levelFilter) {
        setLevelFilter(pos.level);
        return;
      }

      if (pos.lessonId) {
        const idx = lessons.findIndex(l => l.id === pos.lessonId);
        if (idx !== -1) {
          setCurrentLessonIndex(idx);
        }
      }
      if (pos.itemIndex !== undefined && pos.itemIndex >= 0) {
        setCurrentIndex(pos.itemIndex);
      }
      if (pos.mode) {
        setSelectedMode(pos.mode as any);
      }
      isRestoredRef.current = true;
      return;
    }

    const levelPrefix = (userProfile?.targetLevel || 'N5').toLowerCase() + '_';
    const levelIdx = lessons.findIndex(l => l.id.startsWith(levelPrefix));
    if (levelIdx !== -1) {
      setCurrentLessonIndex(levelIdx);
    } else {
      setCurrentLessonIndex(0);
    }
    setCurrentIndex(0);
    isRestoredRef.current = true;
  }, [lessons, levelFilter, userProfile?.lastPosition, user]);

  // When targetLevel manually changes
  const prevTargetLevelRef = useRef(userProfile.targetLevel);
  useEffect(() => {
    if (prevTargetLevelRef.current !== userProfile.targetLevel) {
      prevTargetLevelRef.current = userProfile.targetLevel;
      setIsSrsReviewActive(false);
      setLevelFilter(userProfile.targetLevel);
      const levelPrefix = userProfile.targetLevel.toLowerCase() + '_';
      const levelIdx = lessons.findIndex(l => l.id.startsWith(levelPrefix));
      if (levelIdx !== -1) {
        setCurrentLessonIndex(levelIdx);
      } else {
        setCurrentLessonIndex(0);
      }
      setCurrentIndex(0);
    }
  }, [userProfile.targetLevel, lessons]);

  const currentLesson = isSrsReviewActive
    ? { id: 'SRS_REVIEW', name: 'Ôn tập SRS (' + srsDueItems.length + ')', lessonTitleJp: '復習', lessonNumber: null, level: userProfile.targetLevel }
    : (lessons[currentLessonIndex] || { id: 'default', name: 'Trống', lessonTitleJp: undefined, lessonNumber: null, level: userProfile.targetLevel });

  // Save the last selected lesson ID and sync learning position (for authenticated users)
  useEffect(() => {
    if (!user || !isRestoredRef.current) return;
    if (currentLesson && currentLesson.id && currentLesson.id !== 'SRS_REVIEW' && currentLesson.id !== 'default') {
      const currentLevel = currentLesson.level || levelFilter || userProfile.targetLevel;
      localStorage.setItem(`last_lesson_id_${currentLevel}`, currentLesson.id);

      // Save learning position to user profile for cross-device sync
      updateProfile({
        lastPosition: {
          tab: 'vocabulary',
          level: currentLevel as any,
          lessonId: currentLesson.id,
          lessonName: currentLesson.name,
          itemIndex: currentIndex,
          mode: selectedMode,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [currentLesson?.id, currentIndex, selectedMode, levelFilter, userProfile.targetLevel, user]);

  const lessonItems = useMemo(() => {
    if (isSrsReviewActive) {
      return srsActiveSessionItems || srsDueItems;
    }
    return filteredVocab.filter(v => v.lessonId === currentLesson.id as string);
  }, [isSrsReviewActive, srsActiveSessionItems, srsDueItems, filteredVocab, currentLesson.id]);

  useEffect(() => {
    if (isSrsReviewActive) {
      if (!srsActiveSessionItems || srsActiveSessionItems.length === 0) {
        setSrsActiveSessionItems(srsDueItems);
      }
    } else {
      setSrsActiveSessionItems(null);
    }
  }, [isSrsReviewActive]);

  // Local persistence for Starred words
  const [isStarred, setIsStarred] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('jlpt_starred_vocab');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Intelligent Mode Defaults
  const initialModeSettings = useMemo(() => getVocabModeSettings(selectedMode), [selectedMode]);

  const [showRomaji, setShowRomaji] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`jlpt_vocab_show_romaji_${selectedMode}`);
      if (saved !== null) return JSON.parse(saved);
      const legacy = localStorage.getItem('jlpt_show_romaji');
      if (legacy !== null) return JSON.parse(legacy);
      return VOCAB_MODE_DEFAULTS[selectedMode]?.showRomaji ?? false;
    } catch { return false; }
  });

  const [showFurigana, setShowFurigana] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`jlpt_vocab_show_furigana_${selectedMode}`);
      if (saved !== null) return JSON.parse(saved);
      const legacy = localStorage.getItem('jlpt_show_furigana');
      if (legacy !== null) return JSON.parse(legacy);
      return VOCAB_MODE_DEFAULTS[selectedMode]?.showFurigana ?? true;
    } catch { return true; }
  });

  const [showExampleFurigana, setShowExampleFurigana] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`jlpt_vocab_show_example_furigana_${selectedMode}`);
      if (saved !== null) return JSON.parse(saved);
      const legacy = localStorage.getItem('jlpt_show_example_furigana');
      if (legacy !== null) return JSON.parse(legacy);
      return VOCAB_MODE_DEFAULTS[selectedMode]?.showExampleFurigana ?? true;
    } catch { return true; }
  });

  const [showPitchAccent, setShowPitchAccent] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`jlpt_vocab_show_pitch_accent_${selectedMode}`);
      if (saved !== null) return JSON.parse(saved);
      const legacy = localStorage.getItem('jlpt_show_pitch_accent');
      if (legacy !== null) return JSON.parse(legacy);
      return VOCAB_MODE_DEFAULTS[selectedMode]?.showPitchAccent ?? true;
    } catch { return true; }
  });

  const [autoAdvance, setAutoAdvance] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`jlpt_vocab_auto_advance_${selectedMode}`);
      if (saved !== null) return JSON.parse(saved);
      const legacy = localStorage.getItem('jlpt_vocab_auto_advance');
      if (legacy !== null) return JSON.parse(legacy);
      return VOCAB_MODE_DEFAULTS[selectedMode]?.autoAdvance ?? false;
    } catch { return false; }
  });

  const [expandedWords, setExpandedWords] = useState<Record<string, boolean>>({});

  // Mode specific sub-states
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [flashcardView, setFlashcardView] = useState<'word' | 'example'>('word');
  const [studyDirection, setStudyDirection] = useState<'JP_VI' | 'VI_JP'>(() => {
    try {
      const saved = localStorage.getItem(`jlpt_study_direction_${selectedMode}`);
      if (saved === 'VI_JP' || saved === 'JP_VI') return saved;
      const legacy = localStorage.getItem('jlpt_study_direction');
      if (legacy === 'VI_JP' || legacy === 'JP_VI') return legacy;
      return VOCAB_MODE_DEFAULTS[selectedMode]?.studyDirection || 'JP_VI';
    } catch { return 'JP_VI'; }
  });
  const [flashcardDirection, setFlashcardDirection] = useState<'JP_VI' | 'VI_JP'>(() => {
    try {
      const saved = localStorage.getItem(`jlpt_study_direction_${selectedMode}`);
      if (saved === 'VI_JP' || saved === 'JP_VI') return saved;
      const legacy = localStorage.getItem('jlpt_study_direction');
      if (legacy === 'VI_JP' || legacy === 'JP_VI') return legacy;
      return VOCAB_MODE_DEFAULTS[selectedMode]?.studyDirection || 'JP_VI';
    } catch { return 'JP_VI'; }
  });
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  // Switch mode with smart defaults
  const handleSwitchMode = useCallback((newMode: 'flashcard' | 'quiz' | 'cram' | 'dokkai' | 'shadowing') => {
    setSelectedMode(newMode);
    const cfg = getVocabModeSettings(newMode);
    setShowFurigana(cfg.showFurigana);
    setShowExampleFurigana(cfg.showExampleFurigana);
    setShowPitchAccent(cfg.showPitchAccent);
    setShowRomaji(cfg.showRomaji);
    setAutoAdvance(cfg.autoAdvance);
    setStudyDirection(cfg.studyDirection);
    setFlashcardDirection(cfg.studyDirection);
  }, []);

  const handleResetModeDefaults = () => {
    const defaults = VOCAB_MODE_DEFAULTS[selectedMode];
    setShowFurigana(defaults.showFurigana);
    setShowExampleFurigana(defaults.showExampleFurigana);
    setShowPitchAccent(defaults.showPitchAccent);
    setShowRomaji(defaults.showRomaji);
    setAutoAdvance(defaults.autoAdvance);
    setStudyDirection(defaults.studyDirection);
    setFlashcardDirection(defaults.studyDirection);
    saveVocabModeSettings(selectedMode, defaults);
  };

  const toggleSetting = (key: keyof VocabModeSettings, value: any) => {
    if (key === 'showFurigana') {
      setShowFurigana(value);
      localStorage.setItem(`jlpt_vocab_show_furigana_${selectedMode}`, JSON.stringify(value));
    }
    if (key === 'showExampleFurigana') {
      setShowExampleFurigana(value);
      localStorage.setItem(`jlpt_vocab_show_example_furigana_${selectedMode}`, JSON.stringify(value));
    }
    if (key === 'showPitchAccent') {
      setShowPitchAccent(value);
      localStorage.setItem(`jlpt_vocab_show_pitch_accent_${selectedMode}`, JSON.stringify(value));
    }
    if (key === 'showRomaji') {
      setShowRomaji(value);
      localStorage.setItem(`jlpt_vocab_show_romaji_${selectedMode}`, JSON.stringify(value));
    }
    if (key === 'autoAdvance') {
      setAutoAdvance(value);
      localStorage.setItem(`jlpt_vocab_auto_advance_${selectedMode}`, JSON.stringify(value));
    }
    if (key === 'studyDirection') {
      setStudyDirection(value);
      setFlashcardDirection(value);
      localStorage.setItem(`jlpt_study_direction_${selectedMode}`, value);
    }
    saveVocabModeSettings(selectedMode, { [key]: value });
  };

  const toggleStudyDirection = () => {
    const nextDir = studyDirection === 'JP_VI' ? 'VI_JP' : 'JP_VI';
    toggleSetting('studyDirection', nextDir);
  };

  const [quizQueryType, setQuizQueryType] = useState<'reading' | 'kanji' | 'meaning'>('reading');
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  
  const [cramInput, setCramInput] = useState('');
  const [cramHintsUsed, setCramHintsUsed] = useState(0);
  const [cramFeedback, setCramFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
  const cramInputRef = useRef<HTMLInputElement>(null);

  const [dokkaiOptions, setDokkaiOptions] = useState<string[]>([]);
  const [selectedDokkaiIndex, setSelectedDokkaiIndex] = useState<number | null>(null);
  const [dokkaiHasAnswered, setDokkaiHasAnswered] = useState(false);
  const [showDokkaiTranslation, setShowDokkaiTranslation] = useState(false);

  const [shadowingChips, setShadowingChips] = useState<string[]>([]);
  const [shadowingSelectedIndices, setShadowingSelectedIndices] = useState<number[]>([]);
  const [shadowingIsCorrect, setShadowingIsCorrect] = useState<boolean | null>(null);
  const [isPlayingWave, setIsPlayingWave] = useState(false);

  const [reactionState, setReactionState] = useState<'neutral' | 'correct' | 'wrong' | 'surrender'>('neutral');
  const [showMascotBubble, setShowMascotBubble] = useState(false);

  // SRS Tab States
  const [activeSubTab, setActiveSubTab] = useState<'lessons' | 'srs'>('lessons');
  const [srsSearchQuery, setSrsSearchQuery] = useState('');
  const [srsFilterStage, setSrsFilterStage] = useState<string>('all');

  // Feedback Modal
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('spelling');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Collapsible display settings for mobile responsiveness
  const [showOptions, setShowOptions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Resolve current item
  const getActiveItem = (): VocabularyItem | undefined => {
    if (isShuffle && shuffledIndices.length === lessonItems.length) {
      const idx = shuffledIndices[currentIndex];
      return lessonItems[idx];
    }
    return lessonItems[currentIndex];
  };
  const currentItem = getActiveItem();

  // State và Logic cho Kanji Decomposition & Kanji Family
  const [kanjiBreakdown, setKanjiBreakdown] = useState<any | null>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState<boolean>(false);
  
  // Interactive Kanji modal states & auto-fix log toggling
  const [selectedKanji, setSelectedKanji] = useState<string | null>(null);
  const [isKanjiModalOpen, setIsKanjiModalOpen] = useState<boolean>(false);
  const [showAutoFixLogs, setShowAutoFixLogs] = useState<boolean>(false);
  const [autoFixReports, setAutoFixReports] = useState<any[]>([]);

  useEffect(() => {
    if (!currentItem) {
      setKanjiBreakdown(null);
      return;
    }
    const word = currentItem.kanji || '';
    const kanjiChars = word.split('').filter(char => /[\u4e00-\u9faf]/.test(char));
    if (kanjiChars.length === 0) {
      setKanjiBreakdown(null);
      return;
    }

    const cacheKey = `${word}_${currentItem.hiragana || ''}_${currentItem.meaning || ''}`;

    // 1. Instantly display client-side baseline breakdown (0ms latency, zero flash, 100% resilient)
    const localBaseline = autoFixClientBreakdown(
      currentItem.kanji || '',
      currentItem.hiragana || '',
      currentItem.meaning || '',
      clientKanjiBreakdownCache.get(cacheKey) || null
    );
    setKanjiBreakdown(localBaseline);

    // If already in client cache, skip background fetch
    if (clientKanjiBreakdownCache.has(cacheKey)) {
      setLoadingBreakdown(false);
      return;
    }

    setLoadingBreakdown(true);
    let isMounted = true;

    safeFetchJson(`/api/vocab/kanji-breakdown?word=${encodeURIComponent(currentItem.kanji || '')}&reading=${encodeURIComponent(currentItem.hiragana || '')}&meaning=${encodeURIComponent(currentItem.meaning || '')}`)
      .then(res => {
        if (!isMounted) return;
        if (res.ok && res.data?.success && res.data?.isKanji && res.data?.data) {
          const enriched = autoFixClientBreakdown(
            currentItem.kanji || '',
            currentItem.hiragana || '',
            currentItem.meaning || '',
            res.data.data
          );
          clientKanjiBreakdownCache.set(cacheKey, res.data.data);
          setKanjiBreakdown(enriched);
        }
      })
      .catch(() => {
        // Keep the local baseline seamlessly
      })
      .finally(() => {
        if (isMounted) {
          setLoadingBreakdown(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentItem?.id]);

  const jumpToVocabularyById = (vId: string) => {
    const numericId = parseInt(vId.replace(/\D/g, ''), 10);
    if (isNaN(numericId)) return;

    // Tìm trong toàn bộ danh sách vocabData
    const targetVocab = vocabData.find(v => v.id === vId || v.originalNumber === numericId || v.id === `v_${numericId}`);
    if (!targetVocab) return;

    // Tìm chỉ số trong bài học hiện tại trước
    const idxInCurrentLesson = lessonItems.findIndex(l => l.id === targetVocab.id);
    if (idxInCurrentLesson !== -1) {
      setCurrentIndex(idxInCurrentLesson);
      setHasAnswered(false);
      setDokkaiHasAnswered(false);
      setSelectedAnswerIndex(null);
      setSelectedDokkaiIndex(null);
      setCramHintsUsed(0);
      setCramInput('');
      return;
    }

    // Nếu thuộc bài học khác, tìm bài học của từ đó
    const targetLessonIdx = lessons.findIndex(l => l.id === targetVocab.lessonId);
    if (targetLessonIdx !== -1) {
      // Đặt trigger tạm thời trong localStorage
      localStorage.setItem('pending_jump_vocab_id', targetVocab.id);
      setCurrentLessonIndex(targetLessonIdx);
      // Khi lessonItems thay đổi, useEffect bên dưới sẽ chọn đúng từ đó
    }
  };

  const renderKanjiColoredBreakdown = (word: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    if (!word) return null;
    const kanjiChars = word.split('').filter(char => /[\u4e00-\u9faf]/.test(char));
    if (kanjiChars.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 select-none">
        {kanjiChars.map((char, index) => {
          const cat = getKanjiCategory(char);
          const hv = (getHanViet(char) || '').toUpperCase();
          const padding = size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-4.5 py-3 text-lg' : 'px-3.5 py-2 text-sm';
          return (
            <motion.button
              key={index}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedKanji(char);
                setIsKanjiModalOpen(true);
              }}
              title={`Bấm xem chi tiết chữ ${char} (${hv})`}
              className={`flex flex-col items-center justify-center border rounded-xl shadow-2xs font-display font-bold cursor-pointer transition-all ${cat.lightBg} ${cat.lightText} ${cat.lightBorder} hover:brightness-95 ${padding}`}
            >
              <span className="font-extrabold text-base sm:text-lg">{char}</span>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 mt-0.5">{hv || 'chữ'}</span>
            </motion.button>
          );
        })}
      </div>
    );
  };

  const getKanjiSemanticColor = (kanji: string): { bg: string; text: string; border: string; badgeBg: string; badgeText: string; badgeBorder: string; darkText: string; responsiveText: string } => {
    const cat = kanji ? getKanjiCategory(kanji) : null;
    const assoc = kanji ? getKanjiAssociativeColor(kanji) : null;
    const defaultBg = "bg-slate-50 dark:bg-slate-900/40";
    const defaultText = "text-slate-900 dark:text-slate-100";
    const defaultBorder = "border-slate-200 dark:border-slate-800";
    const defaultBadgeBg = "bg-slate-100 dark:bg-slate-800";
    const defaultBadgeText = "text-slate-700 dark:text-slate-300";
    const defaultBadgeBorder = "border-slate-200 dark:border-slate-700";
    const defaultFurigana = "text-slate-400";

    return {
      bg: assoc?.bg || cat?.lightBg || defaultBg,
      text: assoc?.text || cat?.lightText || defaultText,
      border: assoc?.border || cat?.lightBorder || defaultBorder,
      badgeBg: assoc?.badgeBg || cat?.badgeBg || defaultBadgeBg,
      badgeText: assoc?.badgeText || cat?.badgeText || defaultBadgeText,
      badgeBorder: assoc?.badgeBorder || cat?.badgeBorder || defaultBadgeBorder,
      darkText: assoc?.furigana || (cat ? `text-${cat.colorName}-300` : defaultFurigana),
      responsiveText: (assoc?.text || cat?.lightText || defaultText) + " dark:" + (assoc?.furigana || (cat ? `text-${cat.colorName}-300` : defaultFurigana))
    };
  };

  const renderColorizedKanjiWord = (
    word: string, 
    isLarge = false, 
    disableClick = false,
    meaning = '',
    hiragana = '',
    forceDark = false
  ) => {
    if (!word) return null;
    const hasAnyKanji = /[\u4e00-\u9faf]/.test(word);

    if (!hasAnyKanji) {
      return (
        <span className={`font-display font-bold tracking-wide ${forceDark ? 'text-white' : 'text-slate-900 dark:text-white'} ${isLarge ? 'text-2xl sm:text-4xl' : 'text-inherit'}`}>
          {word}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center justify-center flex-wrap gap-1">
        {word.split('').map((char, index) => {
          const isKanji = /[\u4e00-\u9faf]/.test(char);
          if (isKanji) {
            const colors = getKanjiSemanticColor(char);
            return (
              <span
                key={index}
                onClick={disableClick ? undefined : (e) => {
                  e.stopPropagation();
                  setSelectedKanji(char);
                  setIsKanjiModalOpen(true);
                }}
                title={disableClick ? undefined : `Bấm xem chi tiết chữ ${char}`}
                className={`inline-flex items-center justify-center font-display font-black transition-all border
                  ${colors.bg} ${colors.text} ${colors.border}
                  ${disableClick ? 'cursor-inherit' : 'cursor-pointer hover:scale-105 hover:brightness-95 hover:shadow-2xs active:scale-90 select-all'}
                  ${isLarge 
                    ? 'mx-0.5 sm:mx-1 px-2 sm:px-3.5 py-1 sm:py-2 rounded-2xl text-2xl sm:text-4xl shadow-xs' 
                    : 'mx-px px-1.5 py-0.5 rounded-md text-[0.95em] shadow-3xs'
                  }
                `}
              >
                {char}
              </span>
            );
          }
          return (
            <span 
              key={index} 
              className={`font-bold ${forceDark ? 'text-white' : 'text-slate-900 dark:text-white'} ${isLarge ? 'text-2xl sm:text-4xl px-0.5' : 'text-inherit px-px'}`}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  const renderWordWithFurigana = (
    kanji: string | undefined,
    hiragana: string,
    disableClick = false,
    forceDark = false,
    meaning = '',
    hanViet?: string,
    showHanVietUnder = true
  ) => {
    if (!kanji) {
      return (
        <span className={`text-lg sm:text-2xl font-bold tracking-wide font-display ${forceDark ? 'text-white' : 'text-slate-900 dark:text-white'} leading-none select-all whitespace-nowrap`}>
          {cleanVocabSymbols(hiragana)}
        </span>
      );
    }

    const hasKanji = kanji.split('').some(char => /[\u4e00-\u9faf]/.test(char));
    if (!hasKanji) {
      return (
        <span className={`text-lg sm:text-2xl font-bold tracking-wide font-display ${forceDark ? 'text-white' : 'text-slate-900 dark:text-white'} leading-none select-all whitespace-nowrap`}>
          {cleanVocabSymbols(kanji)}
        </span>
      );
    }

    const cleanHira = cleanVocabSymbols(hiragana);
    const cleanK = cleanVocabSymbols(kanji);
    const allKanjiChars = cleanK.split('').filter(char => /[\u4e00-\u9faf]/.test(char));
    const resolvedHanViet = hanViet || getHanViet(cleanK);
    const hvParts = resolvedHanViet ? resolvedHanViet.trim().split(/\s+/) : [];
    const hasAnyKanjiHanViet = showHanVietUnder && allKanjiChars.length > 0 && hvParts.length > 0;

    const segments = cleanK.split(/([、,／/])/);
    const hiraParts = cleanHira.split(/[、,／/]/).map(p => p.trim()).filter(Boolean);

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
        {(allSegments || []).map((segItem, sIdx) => {
          if (!segItem) return null;
          if (segItem.type === 'delimiter') {
            return (
              <span key={`del-${sIdx}`} className="inline-flex flex-col items-center justify-end leading-none mx-0.5">
                <span className="text-[10px] sm:text-[12px] invisible select-none pb-0.5" style={{ minHeight: '1.2em' }}>&nbsp;</span>
                <span className={`text-lg sm:text-2xl font-bold font-display ${forceDark ? 'text-white' : 'text-slate-900 dark:text-white'} leading-none py-0.5`}>
                  {segItem.text || ''}
                </span>
                {hasAnyKanjiHanViet && (
                  <span className="text-[8px] sm:text-[9.5px] invisible select-none mt-1 py-0.5 px-1 block leading-none" aria-hidden="true">&nbsp;</span>
                )}
              </span>
            );
          }

          return (
            <span key={`seg-${sIdx}`} className="inline-flex items-end flex-nowrap leading-none">
              {(segItem.parts || []).map((part, pIdx) => {
                if (!part || !part.text) return null;
                const isKanjiPart = (part.text || '').split('').some(c => /[\u4e00-\u9faf]/.test(c));

                if (isKanjiPart && part.furigana) {
                  // If multiple kanji characters in a single chunk (e.g. 参加 -> さんか)
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
                            <span
                              key={cIdx}
                              className="inline-flex flex-col items-center justify-end leading-none mx-[1px]"
                            >
                              {/* Furigana */}
                              <span
                                className="text-[10px] sm:text-[12px] text-[#43EEF7] font-bold tracking-normal select-none pb-0.5 text-center block whitespace-nowrap"
                                style={{ minHeight: '1.2em' }}
                              >
                                {subFurigana}
                              </span>
                              {/* Kanji Badge */}
                              <span
                                onClick={disableClick ? undefined : (e) => {
                                  e.stopPropagation();
                                  setSelectedKanji(char);
                                  setIsKanjiModalOpen(true);
                                }}
                                title={disableClick ? undefined : `Bấm xem chi tiết chữ ${char}${charHv ? ` (${charHv})` : ''}`}
                                className={`inline-flex items-center justify-center font-display font-bold text-lg sm:text-2xl transition-all border
                                  ${colors.bg} ${colors.text} ${colors.border}
                                  ${disableClick ? 'cursor-inherit' : 'cursor-pointer hover:scale-105 hover:brightness-95 hover:shadow-2xs active:scale-90 select-all'}
                                  px-1 sm:px-1.5 py-0.5 rounded-md shadow-3xs leading-none`}
                              >
                                {char}
                              </span>
                              {/* Hán Việt directly under Kanji */}
                              {showHanVietUnder && charHv ? (
                                <span
                                  onClick={disableClick ? undefined : (e) => {
                                    e.stopPropagation();
                                    setSelectedKanji(char);
                                    setIsKanjiModalOpen(true);
                                  }}
                                  title={disableClick ? undefined : `Bấm xem chi tiết chữ ${char} (${charHv})`}
                                  className={`font-black tracking-wider uppercase border rounded shadow-3xs mt-1
                                    ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}
                                    ${disableClick ? 'cursor-inherit' : 'cursor-pointer hover:scale-105 hover:brightness-95 active:scale-95'}
                                    px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9.5px] select-none text-center whitespace-nowrap leading-none`}
                                >
                                  {charHv}
                                </span>
                              ) : (
                                hasAnyKanjiHanViet ? (
                                  <span className="text-[8px] sm:text-[9.5px] invisible select-none mt-1 py-0.5 px-1 block leading-none" aria-hidden="true">&nbsp;</span>
                                ) : null
                              )}
                            </span>
                          );
                        })}
                      </span>
                    );
                  }

                  const char = part.text || '';
                  const colors = getKanjiSemanticColor(char);
                  const charHv = getHanViet(char) || (allKanjiChars.length === hvParts.length ? hvParts[kanjiCharIndex] : null) || '';
                  kanjiCharIndex++;

                  return (
                    <span
                      key={pIdx}
                      className="inline-flex flex-col items-center justify-end leading-none mx-[1px]"
                    >
                      {/* Furigana */}
                      <span
                        className="text-[10px] sm:text-[12px] text-[#43EEF7] font-bold tracking-normal select-none pb-0.5 text-center block whitespace-nowrap"
                        style={{ minHeight: '1.2em' }}
                      >
                        {part.furigana}
                      </span>
                      {/* Kanji Badge */}
                      <span
                        onClick={disableClick ? undefined : (e) => {
                          e.stopPropagation();
                          setSelectedKanji(char);
                          setIsKanjiModalOpen(true);
                        }}
                        title={disableClick ? undefined : `Bấm xem chi tiết chữ ${char}${charHv ? ` (${charHv})` : ''}`}
                        className={`inline-flex items-center justify-center font-display font-bold text-lg sm:text-2xl transition-all border
                          ${colors.bg} ${colors.text} ${colors.border}
                          ${disableClick ? 'cursor-inherit' : 'cursor-pointer hover:scale-105 hover:brightness-95 hover:shadow-2xs active:scale-90 select-all'}
                          px-1 sm:px-1.5 py-0.5 rounded-md shadow-3xs leading-none`}
                      >
                        {char}
                      </span>
                      {/* Hán Việt directly under Kanji */}
                      {showHanVietUnder && charHv ? (
                        <span
                          onClick={disableClick ? undefined : (e) => {
                            e.stopPropagation();
                            setSelectedKanji(char);
                            setIsKanjiModalOpen(true);
                          }}
                          title={disableClick ? undefined : `Bấm xem chi tiết chữ ${char} (${charHv})`}
                          className={`font-black tracking-wider uppercase border rounded shadow-3xs mt-1
                            ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}
                            ${disableClick ? 'cursor-inherit' : 'cursor-pointer hover:scale-105 hover:brightness-95 active:scale-95'}
                            px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9.5px] select-none text-center whitespace-nowrap leading-none`}
                        >
                          {charHv}
                        </span>
                      ) : (
                        hasAnyKanjiHanViet ? (
                          <span className="text-[8px] sm:text-[9.5px] invisible select-none mt-1 py-0.5 px-1 block leading-none" aria-hidden="true">&nbsp;</span>
                        ) : null
                      )}
                    </span>
                  );
                }

                if (isKanjiPart && !part.furigana) {
                  const char = part.text || '';
                  const colors = getKanjiSemanticColor(char);
                  const charHv = getHanViet(char) || (allKanjiChars.length === hvParts.length ? hvParts[kanjiCharIndex] : null) || '';
                  kanjiCharIndex++;

                  return (
                    <span
                      key={pIdx}
                      className="inline-flex flex-col items-center justify-end leading-none mx-[1px]"
                    >
                      <span className="text-[10px] sm:text-[12px] invisible select-none pb-0.5 block" style={{ minHeight: '1.2em' }}>&nbsp;</span>
                      <span
                        onClick={disableClick ? undefined : (e) => {
                          e.stopPropagation();
                          setSelectedKanji(char);
                          setIsKanjiModalOpen(true);
                        }}
                        title={disableClick ? undefined : `Bấm xem chi tiết chữ ${char}${charHv ? ` (${charHv})` : ''}`}
                        className={`inline-flex items-center justify-center font-display font-bold text-lg sm:text-2xl transition-all border
                          ${colors.bg} ${colors.text} ${colors.border}
                          ${disableClick ? 'cursor-inherit' : 'cursor-pointer hover:scale-105 hover:brightness-95 hover:shadow-2xs active:scale-90 select-all'}
                          px-1 sm:px-1.5 py-0.5 rounded-md shadow-3xs leading-none`}
                      >
                        {char}
                      </span>
                      {showHanVietUnder && charHv ? (
                        <span
                          onClick={disableClick ? undefined : (e) => {
                            e.stopPropagation();
                            setSelectedKanji(char);
                            setIsKanjiModalOpen(true);
                          }}
                          title={disableClick ? undefined : `Bấm xem chi tiết chữ ${char} (${charHv})`}
                          className={`font-black tracking-wider uppercase border rounded shadow-3xs mt-1
                            ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}
                            ${disableClick ? 'cursor-inherit' : 'cursor-pointer hover:scale-105 hover:brightness-95 active:scale-95'}
                            px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9.5px] select-none text-center whitespace-nowrap leading-none`}
                        >
                          {charHv}
                        </span>
                      ) : (
                        hasAnyKanjiHanViet ? (
                          <span className="text-[8px] sm:text-[9.5px] invisible select-none mt-1 py-0.5 px-1 block leading-none" aria-hidden="true">&nbsp;</span>
                        ) : null
                      )}
                    </span>
                  );
                }

                // Non-kanji token (Hiragana, Katakana, punctuation, etc.)
                return (
                  <span
                    key={pIdx}
                    className="inline-flex flex-col items-center justify-end leading-none mx-0.5"
                  >
                    <span
                      className="text-[10px] sm:text-[12px] invisible select-none pb-0.5 block"
                      style={{ minHeight: '1.2em' }}
                    >
                      &nbsp;
                    </span>
                    <span className={`text-lg sm:text-2xl font-bold font-display ${forceDark ? 'text-white' : 'text-slate-900 dark:text-white'} leading-none select-all inline-block py-0.5 px-0.5 align-bottom`}>
                      {part?.text || ''}
                    </span>
                    {hasAnyKanjiHanViet && (
                      <span className="text-[8px] sm:text-[9.5px] invisible select-none mt-1 py-0.5 px-1 block leading-none" aria-hidden="true">&nbsp;</span>
                    )}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
    );
  };

  const renderExampleSentenceWithFurigana = (sentence: string, currentItem?: any, disableClick = false, forceDark = false) => {
    if (!sentence) return null;

    if (!showExampleFurigana) {
      return (
        <span className={forceDark ? 'text-white' : 'text-slate-800 dark:text-white'}>
          {sentence}
        </span>
      );
    }

    const parts = getSentenceFuriganaParts(sentence, currentItem || {}, vocabData);

    return (
      <span className="inline-flex items-end flex-wrap leading-none gap-y-2">
        {(parts || []).map((part, index) => {
          if (!part || !part.text) return null;
          const hasKanji = (part.text || '').split('').some(char => /[\u4e00-\u9faf]/.test(char));
          
          if (part.furigana && hasKanji) {
            const readings = findBestFuriganaPartition(part.text || '', part.furigana);
            const tokens = tokenizeWithFurigana(part.text || '', readings);
            
            return (
              <span key={index} className="inline-flex items-end flex-nowrap leading-none whitespace-nowrap align-bottom">
                {(tokens || []).map((token, tIdx) => {
                  if (!token || !token.text) return null;
                  if (token.type === 'kanji') {
                    const colors = getKanjiSemanticColor(token.text || '');
                    return (
                      <span key={tIdx} className="inline-flex flex-col items-center justify-end leading-none align-bottom">
                        {/* Furigana */}
                        <span
                          className={`text-[8px] sm:text-[9px] ${forceDark ? colors?.darkText || '' : colors?.text || ''} font-bold tracking-normal select-none pb-0.5 text-center block whitespace-nowrap`}
                          style={{ minHeight: '1.2em' }}
                        >
                          {token.reading || ''}
                        </span>
                        {/* Kanji text with optional click to inspect */}
                        <span
                          onClick={disableClick ? undefined : (e) => {
                            e.stopPropagation();
                            setSelectedKanji(token.text || '');
                            setIsKanjiModalOpen(true);
                          }}
                          className={`${forceDark ? colors?.darkText || '' : colors?.text || ''} font-semibold ${disableClick ? '' : 'cursor-pointer hover:underline'} px-[1px]`}
                        >
                          {token.text || ''}
                        </span>
                      </span>
                    );
                  }

                  // Grouped Non-kanji token (Hiragana) - standard white / neutral
                  return (
                    <span key={tIdx} className="inline-flex flex-col items-center justify-end leading-none align-bottom">
                      <span
                        className="text-[8px] sm:text-[9px] invisible select-none pb-0.5 block"
                        style={{ minHeight: '1.2em' }}
                      >
                        &nbsp;
                      </span>
                      <span className={`${forceDark ? 'text-white' : 'text-slate-800 dark:text-slate-100'} px-[1px]`}>
                        {token.text || ''}
                      </span>
                    </span>
                  );
                })}
              </span>
            );
          }

          // Non-kanji text / No furigana shown (Hiragana parts) - standard white / neutral
          return (
            <span key={index} className="inline-flex flex-col items-center justify-end leading-none align-bottom">
              <span
                className="text-[8px] sm:text-[9px] invisible select-none pb-0.5 block"
                style={{ minHeight: '1.2em' }}
              >
                &nbsp;
              </span>
              <span className={`${forceDark ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                {part.text || ''}
              </span>
            </span>
          );
        })}
      </span>
    );
  };

  const renderDokkaiSentenceWithCloze = (
    sentence: string,
    item: VocabularyItem,
    answered: boolean,
    selectedIdx: number | null,
    options: string[]
  ) => {
    if (!sentence) return null;

    // Các ứng viên từ mục tiêu
    const candidates: string[] = [];
    if (item.kanji) candidates.push(item.kanji);
    if (item.hiragana && !candidates.includes(item.hiragana)) candidates.push(item.hiragana);

    let matchStart = -1;
    let matchLen = 0;

    for (const cand of candidates) {
      if (!cand) continue;
      const idx = sentence.indexOf(cand);
      if (idx !== -1) {
        matchStart = idx;
        matchLen = cand.length;
        break;
      }
    }

    // Nếu không khớp trực tiếp (do động từ/tính từ chia đuôi), tìm theo cụm Hán tự
    if (matchStart === -1 && item.kanji) {
      const kanjiOnly = item.kanji.replace(/[^\u4e00-\u9faf]/g, '');
      if (kanjiOnly.length > 0) {
        const idx = sentence.indexOf(kanjiOnly);
        if (idx !== -1) {
          matchStart = idx;
          let end = idx + kanjiOnly.length;
          while (end < sentence.length && !/[はがをにでともからまで、。！？\s]/.test(sentence[end])) {
            end++;
          }
          matchLen = end - matchStart;
        }
      }
    }

    let prefix = '';
    let target = '';
    let suffix = '';

    if (matchStart !== -1) {
      prefix = sentence.slice(0, matchStart);
      target = sentence.slice(matchStart, matchStart + matchLen);
      suffix = sentence.slice(matchStart + matchLen);
    } else {
      const mid = Math.floor(sentence.length / 2);
      prefix = sentence.slice(0, mid);
      target = item.kanji || item.hiragana;
      suffix = sentence.slice(mid);
    }

    const correctVal = item.kanji || item.hiragana;
    const isCorrect = selectedIdx !== null && options[selectedIdx] === correctVal;
    const chosenText = selectedIdx !== null ? options[selectedIdx] : '';

    return (
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-3 leading-relaxed text-xl sm:text-2xl md:text-3xl font-bold font-sans tracking-wide text-slate-900">
        {/* Phần đầu câu */}
        {prefix && (
          <span className="inline-flex items-center">
            {renderExampleSentenceWithFurigana(prefix, item)}
          </span>
        )}

        {/* Vị trí đục lỗ cần điền */}
        {!answered ? (
          <span className="inline-flex items-center justify-center min-w-[90px] sm:min-w-[120px] px-3.5 sm:px-5 py-1 sm:py-1.5 mx-1.5 rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50/80 text-indigo-700 font-mono font-black text-sm sm:text-lg shadow-inner select-none animate-pulse">
            （&nbsp;？&nbsp;）
          </span>
        ) : isCorrect ? (
          <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4.5 py-1 sm:py-1.5 mx-1.5 rounded-2xl bg-emerald-100/90 border-2 border-emerald-500 text-emerald-900 font-bold text-sm sm:text-lg shadow-sm"
          >
            <span className="font-mono text-emerald-700 font-bold">（</span>
            <span className="text-emerald-900 font-extrabold">{target}</span>
            <span className="text-emerald-600 font-black text-sm">✓</span>
            <span className="font-mono text-emerald-700 font-bold">）</span>
          </motion.span>
        ) : (
          <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex flex-wrap items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 mx-1 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-900 font-bold text-xs sm:text-base shadow-sm"
          >
            <span className="font-mono text-rose-600 font-bold">（</span>
            <s className="text-rose-500 opacity-80 decoration-2">{chosenText || '—'}</s>
            <span className="text-slate-400 text-xs">➔</span>
            <span className="text-emerald-700 font-black">{target}</span>
            <span className="font-mono text-rose-600 font-bold">）</span>
          </motion.span>
        )}

        {/* Phần cuối câu */}
        {suffix && (
          <span className="inline-flex items-center">
            {renderExampleSentenceWithFurigana(suffix, item)}
          </span>
        )}
      </div>
    );
  };

  const renderColorizedHanViet = (kanji: string | undefined, hanViet: string | undefined, isLarge = false) => {
    if (!kanji) return null;
    const resolvedHanViet = hanViet || getHanViet(kanji);
    if (!resolvedHanViet) return null;

    // Extract all Kanji characters
    const kanjiChars = kanji.split('').filter(char => /[\u4e00-\u9faf]/.test(char));
    // Split Han Viet into parts by space
    const hvParts = resolvedHanViet.trim().split(/\s+/);

    if (kanjiChars.length > 0 && kanjiChars.length === hvParts.length) {
      return (
        <span className={`inline-flex items-center gap-1.5 flex-wrap ${isLarge ? 'mt-1.5' : ''}`}>
          {hvParts.map((part, index) => {
            const char = kanjiChars[index];
            const colors = getKanjiSemanticColor(char);
            return (
              <span
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedKanji(char);
                  setIsKanjiModalOpen(true);
                }}
                title={`Bấm xem chi tiết chữ ${char} (${part})`}
                className={`font-black tracking-wide uppercase cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-3xs border
                  ${colors.bg} ${colors.text} ${colors.border} hover:brightness-95
                  ${isLarge 
                    ? 'px-2.5 py-1 rounded-lg text-xs sm:text-sm' 
                    : 'px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px]'
                  }
                `}
              >
                {part}
              </span>
            );
          })}
        </span>
      );
    }

    // Fallback if length doesn't match: colorized by the first kanji's color, or just map them as best as we can
    if (kanjiChars.length > 0) {
      const colors = getKanjiSemanticColor(kanjiChars[0]);
      return (
        <span className={`font-black tracking-wide uppercase border rounded-md shadow-3xs
          ${colors.bg} ${colors.text} ${colors.border}
          ${isLarge ? 'px-2.5 py-1 text-xs sm:text-sm mt-1.5' : 'px-1.5 py-0.5 text-[9px] sm:text-[10px]'}
        `}>
          {resolvedHanViet}
        </span>
      );
    }

    return (
      <span className={`font-black text-slate-500 uppercase tracking-wide ${isLarge ? 'text-xs sm:text-sm mt-1.5' : 'text-[9px] sm:text-[10px]'}`}>
        {resolvedHanViet}
      </span>
    );
  };

  // Lắng nghe trigger nhảy trang bài học
  useEffect(() => {
    const pendingId = localStorage.getItem('pending_jump_vocab_id');
    if (pendingId && lessonItems.length > 0) {
      const idx = lessonItems.findIndex(item => item.id === pendingId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        localStorage.removeItem('pending_jump_vocab_id');
      }
    }
  }, [lessonItems, currentIndex]);

  // Autoplay Effect
  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      if (!showFlashcardAnswer) {
        setShowFlashcardAnswer(true);
        if (currentItem) handleSpeak(currentItem.kanji || currentItem.hiragana);
      } else {
        handleNext();
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoplay, showFlashcardAnswer, currentIndex, currentLessonIndex]);

  // Auto Advance Effect (for Quiz, Cram, Dokkai, Shadowing modes)
  useEffect(() => {
    if ((reactionState === 'correct' || reactionState === 'wrong' || reactionState === 'surrender') && autoAdvance && selectedMode !== 'flashcard') {
      const timer = setTimeout(() => {
        handleNext();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [reactionState, autoAdvance, selectedMode]);

  // Dynamic feedback and hints from Cố vấn Cú Già
  const getCorrectXpText = () => {
    if (selectedMode === 'flashcard') return 'Tuyệt vời! Bạn được cộng +10 XP.';
    if (selectedMode === 'quiz') return 'Tuyệt vời! Bạn được cộng +15 XP.';
    if (selectedMode === 'cram') return 'Tuyệt vời! Bạn được cộng +20 XP.';
    if (selectedMode === 'dokkai') return 'Tuyệt vời! Bạn được cộng +20 XP.';
    if (selectedMode === 'shadowing') return 'Tuyệt vời! Bạn được cộng +25 XP.';
    return 'Tuyệt vời! Bạn đã trả lời đúng.';
  };

  const getWrongText = () => {
    if (selectedMode === 'flashcard') return 'Chưa thuộc từ này! Hãy ôn tập lại nhé.';
    return 'Sai mất rồi! Ôn tập lại hoặc chạm vào Cú Già để xem gợi ý 💡.';
  };

  const getMascotHint = (): string => {
    if (!currentItem) return 'Cố vấn Cú Già đang suy nghĩ gợi ý...';
    
    switch (selectedMode) {
      case 'flashcard':
        return `Từ này bắt đầu bằng chữ "${currentItem.hiragana[0]}". Hãy nhấp 'Lật thẻ' để xem toàn bộ cách đọc và câu ví dụ!`;
      case 'quiz':
        if (quizQueryType === 'reading') {
          return `Từ "${currentItem.kanji || currentItem.hiragana}" có nghĩa là "${currentItem.meaning}". Chọn đáp án có cách đọc Hiragana tương ứng!`;
        } else if (quizQueryType === 'kanji') {
          return `Từ này có nghĩa là "${currentItem.meaning}" và phát âm là "${currentItem.hiragana}". Chọn chữ Kanji tương ứng!`;
        } else {
          return `Từ "${currentItem.kanji || currentItem.hiragana}" đọc là "${currentItem.hiragana}". Chọn ý nghĩa tiếng Việt đúng nhất!`;
        }
      case 'cram':
        return `Từ này gồm ${currentItem.hiragana.length} ký tự Hiragana. Ký tự đầu tiên bắt đầu bằng chữ "${currentItem.hiragana[0]}".`;
      case 'dokkai':
        return `Từ cần điền vào chỗ trống đọc là "${currentItem.hiragana}" (nghĩa là: "${currentItem.meaning}").`;
      case 'shadowing':
        return `Câu ví dụ này dịch là: "${currentItem.exampleTranslation}". Hãy bắt đầu câu bằng mảnh ghép "${currentItem.exampleSentence.trim().split(/\s+/)[0] || ''}".`;
      default:
        return `Hãy phân tích kỹ âm Hiragana "${currentItem.hiragana}" và nghĩa "${currentItem.meaning}".`;
    }
  };

  // Shuffle Init Effect
  useEffect(() => {
    if (isShuffle && lessonItems.length > 0) {
      const indices = Array.from({ length: lessonItems.length }, (_, i) => i);
      const shuffled = indices.sort(() => Math.random() - 0.5);
      setShuffledIndices(shuffled);
      setCurrentIndex(0);
    } else {
      setShuffledIndices([]);
    }
  }, [isShuffle, currentLessonIndex]);

  // Generation of options whenever active word changes
  useEffect(() => {
    if (!currentItem) return;

    // Quiz options setup
    let correctQuizAns = '';
    let pool: string[] = [];

    if (studyDirection === 'VI_JP') {
      // Question is Vietnamese Meaning -> Options are Japanese words
      if (quizQueryType === 'reading') {
        correctQuizAns = currentItem.hiragana;
        pool = vocabData.filter(v => v.id !== currentItem.id).map(v => v.hiragana);
      } else {
        correctQuizAns = currentItem.kanji || currentItem.hiragana;
        pool = vocabData.filter(v => v.id !== currentItem.id).map(v => v.kanji || v.hiragana);
      }
    } else {
      // Question is Japanese -> Options are Vietnamese Meanings or readings
      if (quizQueryType === 'reading') {
        correctQuizAns = currentItem.hiragana;
        pool = vocabData.filter(v => v.id !== currentItem.id).map(v => v.hiragana);
      } else if (quizQueryType === 'kanji') {
        correctQuizAns = currentItem.kanji || currentItem.hiragana;
        pool = vocabData.filter(v => v.id !== currentItem.id).map(v => v.kanji || v.hiragana);
      } else {
        correctQuizAns = currentItem.meaning;
        pool = vocabData.filter(v => v.id !== currentItem.id).map(v => v.meaning);
      }
    }
    const shuffledWrongQuiz = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    setQuizOptions([correctQuizAns, ...shuffledWrongQuiz].sort(() => 0.5 - Math.random()));
    setSelectedAnswerIndex(null);
    setHasAnswered(false);

    // Dokkai options setup
    const correctDokkai = currentItem.kanji || currentItem.hiragana;
    const dokkaiPool = vocabData.filter(v => v.id !== currentItem.id).map(v => v.kanji || v.hiragana);
    const wrongDokkai = dokkaiPool.sort(() => 0.5 - Math.random()).slice(0, 3);
    setDokkaiOptions([correctDokkai, ...wrongDokkai].sort(() => 0.5 - Math.random()));
    setSelectedDokkaiIndex(null);
    setDokkaiHasAnswered(false);
    setShowDokkaiTranslation(false);

    // Cram setup
    setCramInput('');
    setCramHintsUsed(0);
    setCramFeedback('neutral');

    // Shadowing chips
    const chips = splitJapaneseSentence(currentItem.exampleSentence);
    setShadowingChips([...chips].sort(() => Math.random() - 0.5));
    setShadowingSelectedIndices([]);
    setShadowingIsCorrect(null);

    // Reset general
    setReactionState('neutral');
    setShowFlashcardAnswer(false);
    setShowMascotBubble(false);
  }, [currentIndex, currentLessonIndex, selectedMode, quizQueryType, isShuffle, studyDirection]);

  // Auto-focus Cram input on question or mode change
  useEffect(() => {
    if (selectedMode === 'cram') {
      const timer = setTimeout(() => {
        cramInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedMode, currentIndex, currentLessonIndex]);

  const handleSpeak = useCallback((text: string, isSentence?: boolean) => {
    speakJapanese(text, undefined, undefined, { isSentence });
    
    // Animate wave if shadowing
    if (selectedMode === 'shadowing') {
      setIsPlayingWave(true);
      setTimeout(() => setIsPlayingWave(false), 2000);
    }
  }, [selectedMode]);

  const stateRef = useRef({
    selectedMode,
    currentItem,
    showFlashcardAnswer,
    flashcardView,
    flashcardDirection,
    hasAnswered,
    dokkaiHasAnswered,
    shadowingChips,
    shadowingSelectedIndices,
    shadowingIsCorrect,
    cramInput,
    cramFeedback,
    currentIndex,
    lessonItems,
    currentLesson,
    userProfile,
    studyDirection,
    showFurigana,
    showPitchAccent,
    quizOptions,
    dokkaiOptions,
    quizQueryType,
  });

  // Always update stateRef synchronously in render body
  stateRef.current = {
    selectedMode,
    currentItem,
    showFlashcardAnswer,
    flashcardView,
    flashcardDirection,
    hasAnswered,
    dokkaiHasAnswered,
    shadowingChips,
    shadowingSelectedIndices,
    shadowingIsCorrect,
    cramInput,
    cramFeedback,
    currentIndex,
    lessonItems,
    currentLesson,
    userProfile,
    studyDirection,
    showFurigana,
    showPitchAccent,
    quizOptions,
    dokkaiOptions,
    quizQueryType,
  };

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : 0));
  }, []);

  const handleNext = useCallback(() => {
    const { currentItem: item, currentIndex: idx, lessonItems: items, currentLesson: lesson, userProfile: profile } = stateRef.current;
    if (!item) return;
    if (idx < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert(`🎉 Hoàn thành bài học: ${lesson?.name || 'Bài học'}! Thêm +50 XP.`);
      onEarnXp(50);
      if (lesson?.id === 'SRS_REVIEW') {
        setSrsActiveSessionItems(null);
        setIsSrsReviewActive(false);
      } else if (lesson?.id) {
        if (!profile.completedLessons.includes(lesson.id as string)) {
          updateProfile({ completedLessons: [...profile.completedLessons, lesson.id as string] });
        }
      }
      setCurrentIndex(0);
    }
  }, [onEarnXp, updateProfile]);

  const handleFlashcardMark = useCallback((mastered: boolean) => {
    const { currentItem: item, userProfile: profile } = stateRef.current;
    if (!item) return;
    const status = { ...profile.vocabStatus };
    const oldStatus = typeof status[item.id] === 'object' ? (status[item.id] as any) : null;
    status[item.id] = calculateSRS(oldStatus, mastered ? 5 : 2);
    updateProfile({ vocabStatus: status });
    setReactionState(mastered ? 'correct' : 'wrong');
    if (mastered) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
    onEarnXp(mastered ? 10 : 2);
    setTimeout(() => {
      handleNext();
    }, 280);
  }, [updateProfile, onEarnXp, handleNext]);

  const normalizeCramStr = (str: string) => {
    if (!str) return '';
    return cleanVocabSymbols(str)
      .toLowerCase()
      .replace(/[\[\]［］()（）{}＜＞<>「」~～〜〰]/g, '')
      .replace(/[-–—]/g, 'ー')
      .replace(/[\s\t\n\r]/g, '');
  };

  const stripSymbols = (str: string) => {
    if (!str) return '';
    return normalizeCramStr(str).replace(/[〜ー.,\/#!$%\^&\*;:{}=\-_`~()（）?？!！]/g, '');
  };

  const handleProvideHint = () => {
    if (!currentItem || cramFeedback === 'correct') return;

    const targetIsKatakana = isKatakana(currentItem.hiragana || '') || isKatakana(currentItem.kanji || '');
    let targetHira = normalizeCramStr(currentItem.hiragana);
    if (targetIsKatakana) {
      targetHira = hiraganaToKatakana(targetHira);
    }

    const currentVal = cramInput.trim().toLowerCase();
    let currentConverted = normalizeCramStr(convertRomajiToHiragana(currentVal, true));
    if (targetIsKatakana) {
      currentConverted = hiraganaToKatakana(currentConverted);
    }

    let currentPos = cramHintsUsed;
    if (currentConverted.length > 0 && targetHira.startsWith(currentConverted)) {
      currentPos = Math.max(cramHintsUsed, currentConverted.length);
    }

    if (currentPos < targetHira.length) {
      const nextHints = currentPos + 1;
      setCramHintsUsed(nextHints);
      
      // Reveal exactly 1 next character in input field and underline slots
      const hintText = targetHira.slice(0, nextHints);
      setCramInput(hintText);

      if (cramFeedback !== 'neutral') {
        setCramFeedback('neutral');
      }

      setTimeout(() => {
        cramInputRef.current?.focus();
      }, 10);
    }
  };

  const handleCheckCram = () => {
    if (!currentItem) return;

    const cramRaw = cramInput.trim().toLowerCase();
    const val = convertRomajiToHiragana(cramRaw, true);
    const convertedInput = convertRomajiToHiragana(val, true);

    const normHira = katakanaToHiragana(normalizeCramStr(currentItem.hiragana));
    const normKanji = katakanaToHiragana(normalizeCramStr(currentItem.kanji || ''));
    const normRomaji = normalizeCramStr(currentItem.romaji || '');

    const stripHira = katakanaToHiragana(stripSymbols(currentItem.hiragana));
    const stripKanji = katakanaToHiragana(stripSymbols(currentItem.kanji || ''));
    const stripRomaji = stripSymbols(currentItem.romaji || '');

    const normVal = katakanaToHiragana(normalizeCramStr(val));
    const normRaw = katakanaToHiragana(normalizeCramStr(cramRaw));
    const normConverted = katakanaToHiragana(normalizeCramStr(convertedInput));

    const stripVal = katakanaToHiragana(stripSymbols(val));
    const stripRaw = katakanaToHiragana(stripSymbols(cramRaw));
    const stripConverted = katakanaToHiragana(stripSymbols(convertedInput));

    const normValLong = normalizeLongVowels(normVal);
    const normHiraLong = normalizeLongVowels(normHira);
    const normConvertedLong = normalizeLongVowels(normConverted);
    const normRawLong = normalizeLongVowels(normRaw);

    const isMatch =
      normVal === normHira || normVal === normKanji || normVal === normRomaji ||
      normConverted === normHira || normConverted === normKanji || normConverted === normRomaji ||
      normRaw === normHira || normRaw === normKanji || normRaw === normRomaji ||
      normValLong === normHiraLong || normConvertedLong === normHiraLong || normRawLong === normHiraLong ||
      (stripHira && (stripVal === stripHira || stripConverted === stripHira || stripRaw === stripHira)) ||
      (stripKanji && (stripVal === stripKanji || stripConverted === stripKanji || stripRaw === stripKanji)) ||
      (stripRomaji && (stripVal === stripRomaji || stripConverted === stripRomaji || stripRaw === stripRomaji));

    if (isMatch) {
      setCramFeedback('correct');
      setReactionState('correct');
      playCorrectSound();
      onEarnXp(20);
      const status = { ...userProfile.vocabStatus };
      const oldStatus = typeof status[currentItem.id] === 'object' ? (status[currentItem.id] as any) : null;
      status[currentItem.id] = calculateSRS(oldStatus, 5);
      updateProfile({ vocabStatus: status });
    } else {
      setCramFeedback('wrong');
      setReactionState('wrong');
      playIncorrectSound();
    }
  };

  const handleSelectAnswer = (idx: number) => {
    if (hasAnswered || !currentItem) return;
    setSelectedAnswerIndex(idx);
    setHasAnswered(true);
    
    const chosen = quizOptions[idx];
    const correct = studyDirection === 'VI_JP'
      ? (quizQueryType === 'reading' ? currentItem.hiragana : (currentItem.kanji || currentItem.hiragana))
      : (quizQueryType === 'reading' 
        ? currentItem.hiragana 
        : quizQueryType === 'kanji' 
        ? currentItem.kanji || currentItem.hiragana 
        : currentItem.meaning);

    if (chosen === correct) {
      setReactionState('correct');
      playCorrectSound();
      onEarnXp(15);
      const randomPraise = QUIZ_PRAISES[Math.floor(Math.random() * QUIZ_PRAISES.length)];
      setQuizFeedbackMessage(randomPraise);
      const status = { ...userProfile.vocabStatus };
      const oldStatus = typeof status[currentItem.id] === 'object' ? (status[currentItem.id] as any) : null;
      status[currentItem.id] = calculateSRS(oldStatus, 5);
      updateProfile({ vocabStatus: status });
    } else {
      setReactionState('wrong');
      playIncorrectSound();
      const randomRoast = QUIZ_ROASTS[Math.floor(Math.random() * QUIZ_ROASTS.length)];
      setQuizFeedbackMessage(randomRoast);
      const status = { ...userProfile.vocabStatus };
      const oldStatus = typeof status[currentItem.id] === 'object' ? (status[currentItem.id] as any) : null;
      status[currentItem.id] = calculateSRS(oldStatus, 2);
      updateProfile({ vocabStatus: status });
    }
  };

  const handleSurrender = () => {
    if (hasAnswered || !currentItem) return;
    setReactionState('surrender');
    setHasAnswered(true);
    const correct = studyDirection === 'VI_JP'
      ? (quizQueryType === 'reading' ? currentItem.hiragana : (currentItem.kanji || currentItem.hiragana))
      : (quizQueryType === 'reading' 
        ? currentItem.hiragana 
        : quizQueryType === 'kanji' 
        ? currentItem.kanji || currentItem.hiragana 
        : currentItem.meaning);
    const correctIdx = quizOptions.indexOf(correct);
    if (correctIdx !== -1) {
      setSelectedAnswerIndex(correctIdx);
      playIncorrectSound();
    }
  };

  const handleSelectDokkai = (idx: number) => {
    if (dokkaiHasAnswered || !currentItem) return;
    setSelectedDokkaiIndex(idx);
    setDokkaiHasAnswered(true);
    const chosen = dokkaiOptions[idx];
    const correct = currentItem.kanji || currentItem.hiragana;

    if (chosen === correct) {
      setReactionState('correct');
      playCorrectSound();
      onEarnXp(15);
      const randomPraise = QUIZ_PRAISES[Math.floor(Math.random() * QUIZ_PRAISES.length)];
      setQuizFeedbackMessage(randomPraise);
      const status = { ...userProfile.vocabStatus };
      const oldStatus = typeof status[currentItem.id] === 'object' ? (status[currentItem.id] as any) : null;
      status[currentItem.id] = calculateSRS(oldStatus, 5);
      updateProfile({ vocabStatus: status });
    } else {
      setReactionState('wrong');
      playIncorrectSound();
      const randomRoast = QUIZ_ROASTS[Math.floor(Math.random() * QUIZ_ROASTS.length)];
      setQuizFeedbackMessage(randomRoast);
      const status = { ...userProfile.vocabStatus };
      const oldStatus = typeof status[currentItem.id] === 'object' ? (status[currentItem.id] as any) : null;
      status[currentItem.id] = calculateSRS(oldStatus, 2);
      updateProfile({ vocabStatus: status });
    }
  };

  // Keyboard Event Handlers with full compatibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { 
        selectedMode: mode, 
        currentItem: item, 
        showFlashcardAnswer: showAns, 
        flashcardView: fView,
        hasAnswered: hasAns, 
        dokkaiHasAnswered: dokkaiHasAns, 
        shadowingChips: sChips,
        shadowingIsCorrect: sIsCorrect,
        cramFeedback: cFeedback,
      } = stateRef.current;

      const activeEl = document.activeElement as HTMLElement | null;
      const isTyping = !!(
        activeEl && 
        activeEl !== document.body && 
        activeEl !== document.documentElement &&
        (
          (activeEl.tagName === 'INPUT' && (activeEl as HTMLInputElement).type !== 'button' && (activeEl as HTMLInputElement).type !== 'checkbox' && (activeEl as HTMLInputElement).type !== 'radio' && activeEl !== cramInputRef.current) || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.isContentEditable
        )
      );

      // Key normalizations across all browsers & Vietnamese IME modes
      const key = e.key || '';
      const keyLow = key.toLowerCase();
      const code = e.code || '';
      const keyCode = e.keyCode || e.which || 0;

      const isSpace = key === ' ' || keyLow === 'spacebar' || keyLow === 'space' || code === 'Space' || keyCode === 32 || e.which === 32;
      const isEnter = keyLow === 'enter' || code === 'Enter' || code === 'NumpadEnter' || keyCode === 13;
      const isZ = keyLow === 'z' || code === 'KeyZ' || keyCode === 90;
      const isX = keyLow === 'x' || code === 'KeyX' || keyCode === 88;
      const isR = keyLow === 'r' || code === 'KeyR' || keyCode === 82;
      const isS = keyLow === 's' || code === 'KeyS' || keyCode === 83;
      const isD = keyLow === 'd' || code === 'KeyD' || keyCode === 68;
      const isA = keyLow === 'a' || code === 'KeyA' || keyCode === 65;
      const isF = keyLow === 'f' || code === 'KeyF' || keyCode === 70;
      const is1 = key === '1' || code === 'Digit1' || code === 'Numpad1' || keyCode === 49 || keyCode === 97;
      const is2 = key === '2' || code === 'Digit2' || code === 'Numpad2' || keyCode === 50 || keyCode === 98;
      const is3 = key === '3' || code === 'Digit3' || code === 'Numpad3' || keyCode === 51 || keyCode === 99;
      const is4 = key === '4' || code === 'Digit4' || code === 'Numpad4' || keyCode === 52 || keyCode === 100;
      const isRight = keyLow === 'arrowright' || code === 'ArrowRight' || keyCode === 39;
      const isLeft = keyLow === 'arrowleft' || code === 'ArrowLeft' || keyCode === 37;
      const isUp = keyLow === 'arrowup' || code === 'ArrowUp' || keyCode === 38;
      const isDown = keyLow === 'arrowdown' || code === 'ArrowDown' || keyCode === 40;

      // Ignore key repeats for toggling/flipping actions to prevent rapid oscillating flips
      if (e.repeat) {
        if (isSpace || isZ || isX || is1 || is2 || isF || isUp || isDown) {
          e.preventDefault();
        }
        return;
      }

      // Special handling for Cram mode input
      if (mode === 'cram') {
        if (
          keyLow === 'tab' || 
          (e.shiftKey && isEnter) || 
          keyLow === 'f1' || 
          ((e.ctrlKey || e.altKey) && (keyLow === 'h' || code === 'KeyH' || keyLow === 'g' || code === 'KeyG'))
        ) {
          e.preventDefault();
          e.stopPropagation();
          handleProvideHint();
          return;
        }

        if (isEnter) {
          e.preventDefault();
          e.stopPropagation();
          if (cFeedback === 'correct') {
            handleNext();
          } else {
            handleCheckCram();
          }
          return;
        }
      }

      // If user is typing in another input (like search, modal), don't trigger global shortcuts
      if (isTyping) {
        return;
      }

      // Blur focused button or interactive element so pressing Space/Enter doesn't trigger unexpected browser click
      if (activeEl && (activeEl.tagName === 'BUTTON' || activeEl.tagName === 'A' || activeEl.getAttribute('role') === 'button')) {
        activeEl.blur();
      }

      // Global: Quick Direction Toggle with 'D' (when not modifying)
      if (isD && !e.ctrlKey && !e.altKey && !e.metaKey && mode !== 'cram') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        toggleStudyDirection();
        return;
      }

      // Global: Audio playback with 'R' or 'S'
      if ((isR || isS) && !e.ctrlKey && !e.altKey && !e.metaKey && mode !== 'cram') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        if (item) {
          if (mode === 'flashcard') {
            if (fView === 'example') {
              handleSpeak(item.exampleSentence, true);
            } else {
              handleSpeak(item.kanji || item.hiragana);
            }
          } else if (mode === 'shadowing' || mode === 'dokkai') {
            handleSpeak(item.exampleSentence, true);
          } else {
            handleSpeak(item.kanji || item.hiragana);
          }
        }
        return;
      }

      // FLASHCARD MODE
      if (mode === 'flashcard') {
        // Space / F / Up / Down: Toggle flip front <-> back
        if (isSpace || isF || isUp || isDown) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          setShowFlashcardAnswer(prev => !prev);
          return;
        }

        // Enter / ArrowRight: Next card
        if (isEnter || isRight) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          handleNext();
          return;
        }

        // ArrowLeft / A: Previous card
        if (isLeft || isA) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          handlePrev();
          return;
        }

        // Z / 1: Mastered (Đã thuộc)
        if (isZ || is1) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          handleFlashcardMark(true);
          return;
        }

        // X / 2: Not Mastered (Chưa thuộc)
        if (isX || is2) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          handleFlashcardMark(false);
          return;
        }
      }

      // QUIZ MODE
      if (mode === 'quiz') {
        if (!hasAns) {
          if (is1) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); handleSelectAnswer(0); return; }
          if (is2) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); handleSelectAnswer(1); return; }
          if (is3) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); handleSelectAnswer(2); return; }
          if (is4) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); handleSelectAnswer(3); return; }
        } else {
          if (isSpace || isEnter || isRight) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation?.();
            handleNext();
            return;
          }
        }
      }

      // DOKKAI MODE
      if (mode === 'dokkai') {
        if (!dokkaiHasAns) {
          if (is1) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); handleSelectDokkai(0); return; }
          if (is2) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); handleSelectDokkai(1); return; }
          if (is3) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); handleSelectDokkai(2); return; }
          if (is4) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); handleSelectDokkai(3); return; }
        } else {
          if (isSpace || isEnter || isRight) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation?.();
            handleNext();
            return;
          }
        }
      }

      // SHADOWING MODE
      if (mode === 'shadowing') {
        if (keyCode >= 49 && keyCode <= 57) {
          const numIdx = keyCode - 49;
          if (numIdx < sChips.length) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation?.();
            handleSelectChipIndex(numIdx);
            return;
          }
        }
        if (keyCode >= 97 && keyCode <= 105) {
          const numIdx = keyCode - 97;
          if (numIdx < sChips.length) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation?.();
            handleSelectChipIndex(numIdx);
            return;
          }
        }
        if (keyLow === 'backspace' || code === 'Backspace' || keyCode === 8) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          handleRemoveLastChip();
          return;
        }
        if (sIsCorrect !== null && (isSpace || isEnter || isRight)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          handleNext();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [
    handleNext, 
    handlePrev, 
    handleFlashcardMark, 
    handleSpeak, 
    handleProvideHint, 
    handleCheckCram, 
    toggleStudyDirection
  ]);

  const handleDokkaiBỏTay = () => {
    if (dokkaiHasAnswered) return;
    setDokkaiHasAnswered(true);
    setReactionState('surrender');
    playIncorrectSound();
  };

  const handleSelectChipIndex = (chipIdx: number) => {
    if (shadowingIsCorrect !== null) return;
    if (shadowingSelectedIndices.includes(chipIdx)) return;

    const nextSelected = [...shadowingSelectedIndices, chipIdx];
    setShadowingSelectedIndices(nextSelected);

    if (nextSelected.length === shadowingChips.length) {
      const assembled = nextSelected.map(i => shadowingChips[i]).join('').replace(/[、。！？\s]/g, '');
      const correct = (currentItem?.exampleSentence || '').replace(/[、。！？\s]/g, '');
      if (assembled === correct) {
        setShadowingIsCorrect(true);
        setReactionState('correct');
        playCorrectSound();
        onEarnXp(25);
      } else {
        setShadowingIsCorrect(false);
        setReactionState('wrong');
        playIncorrectSound();
      }
    }
  };

  const handleRemoveLastChip = () => {
    if (shadowingIsCorrect !== null) return;
    setShadowingSelectedIndices(prev => prev.slice(0, -1));
  };

  const handleRemoveChipAtIndex = (sIdx: number) => {
    if (shadowingIsCorrect !== null) return;
    setShadowingSelectedIndices(prev => prev.filter((_, i) => i !== sIdx));
  };

  const toggleStar = useCallback((vocabId: string) => {
    setIsStarred(prev => {
      const next = { ...prev };
      if (next[vocabId]) delete next[vocabId];
      else next[vocabId] = true;
      localStorage.setItem('jlpt_starred_vocab', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleMastered = useCallback((vocabId: string) => {
    const status = { ...(userProfile.vocabStatus || {}) };
    const curr = status[vocabId];
    const isMastered = typeof curr === 'object' ? (curr as any)?.status === 'mastered' : curr === 'mastered';
    if (isMastered) {
      delete status[vocabId];
    } else {
      status[vocabId] = 'mastered';
    }
    updateProfile({ vocabStatus: status });
  }, [userProfile.vocabStatus, updateProfile]);

  const handleSelectKanji = useCallback((char: string) => {
    setSelectedKanji(char);
    setIsKanjiModalOpen(true);
  }, []);

  // Generate downloadable txt practice layout
  const handleExportPracticeFile = () => {
    let doc = `========================================================================\n`;
    doc += `         BẢNG LUYỆN VIẾT CHỮ HÁN & TỪ VỰNG - JLPT ${userProfile.targetLevel}\n`;
    doc += `         Bài học: ${currentLesson.name}\n`;
    doc += `========================================================================\n\n`;
    lessonItems.forEach((item, idx) => {
      doc += `${idx + 1}. Từ vựng: ${item.kanji || '—'} (${item.hiragana})\n`;
      doc += `   Phiên âm: [${item.romaji}] -- Ý nghĩa: ${item.meaning}\n`;
      doc += `   Luyện viết chữ Hán:\n`;
      doc += item.kanji 
        ? `   [ ${item.kanji.split('').join(' ]  [ ')} ]  [   ]  [   ]  [   ]  [   ]\n` 
        : `   [   ]  [   ]  [   ]  [   ]  [   ]  [   ]  [   ]\n`;
      doc += `   Luyện viết cách đọc (Hiragana):\n`;
      doc += `   [ ${item.hiragana.split('').join(' ]  [ ')} ]  [   ]  [   ]  [   ]  [   ]\n`;
      doc += `   Ví dụ: ${item.exampleSentence}\n`;
      doc += `   Dịch ví dụ: ${item.exampleTranslation}\n`;
      doc += `   -------------------------------------------------------------------\n\n`;
    });
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WritingSheet_Tango_${userProfile.targetLevel}_${currentLesson.id as string}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackSent(false);
      setFeedbackText('');
    }, 1800);
  };

  // Compute SRS statistics
  const srsStats = useMemo(() => {
    let apprentice = 0;
    let guru = 0;
    let master = 0;
    let enlightened = 0;
    let burned = 0;
    let unstarted = 0;

    filteredVocab.forEach(v => {
      const s = userProfile.vocabStatus[v.id];
      if (!s || s === 'new') {
        unstarted++;
      } else if (s === 'learning') {
        apprentice++;
      } else if (s === 'mastered') {
        burned++;
      } else if (typeof s === 'object' && s !== null) {
        const interval = (s as any).interval || 0;
        if (interval <= 2) apprentice++;
        else if (interval <= 7) guru++;
        else if (interval <= 15) master++;
        else if (interval <= 30) enlightened++;
        else burned++;
      } else {
        unstarted++;
      }
    });

    return { apprentice, guru, master, enlightened, burned, unstarted };
  }, [filteredVocab, userProfile.vocabStatus]);

if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div></div>;
  }

  if (lessonItems.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 rounded-[2rem] shadow-xs max-w-2xl mx-auto my-12">
        <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-slate-950 mb-2">Chưa có dữ liệu bài học trình độ {userProfile.targetLevel}</h3>
        <p className="text-slate-500 mb-6">Đổi mục tiêu trong Hồ sơ (góc trên cùng bên phải) để cập nhật nhanh chóng.</p>
        <button onClick={() => updateProfile({ targetLevel: 'N4' })} className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold text-sm transition-all shadow-md">
          Trải nghiệm ngay bài học N4
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-1 sm:pt-2 pb-6 space-y-2.5 sm:space-y-3.5 select-none flex flex-col items-center">
      <div className="w-full space-y-2.5 sm:space-y-3 animate-fade-in flex flex-col items-center">

      {/* Container Thẻ học chính */}
      <div className={`w-full mx-auto mt-0 sm:mt-1 transition-all duration-300 flex flex-col items-center ${isExpanded ? 'max-w-5xl' : 'max-w-[780px]'}`}>
        <div className="w-full">
          {/* Main Study Card Stage */}
          <div className="bg-[#242b45] text-white border border-[#343d5f] shadow-2xl shadow-slate-950/40 rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-6 relative overflow-hidden min-h-[220px] sm:min-h-[280px] md:min-h-[340px] flex flex-col justify-between transition-all duration-300 w-full">
        
        {/* Top Header Inside Card Frame: Integrated Lesson Navigator & Study Controls */}
        <div className="flex flex-row items-center justify-between gap-1 sm:gap-2 mb-2.5 sm:mb-3.5 pb-2 sm:pb-2.5 border-b border-[#343d5f]/80 relative z-10 w-full flex-nowrap">
          {/* Left Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {selectedMode === 'dokkai' ? (
              <button 
                onClick={() => currentItem && handleSpeak(currentItem.exampleSentence)}
                className="flex items-center gap-1 text-slate-300 hover:text-white text-xs font-bold bg-[#1a1f33]/90 hover:bg-[#2b3353] border border-[#343d5f] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Phát âm câu mẫu"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xs:inline">Nghe câu</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (!currentItem) return;
                  if (flashcardView === 'example') {
                    handleSpeak(currentItem.exampleSentence, true);
                  } else {
                    handleSpeak(currentItem.kanji || currentItem.hiragana);
                  }
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1a1f33]/90 border border-[#343d5f] rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-[#2b3353] text-slate-300 hover:text-white cursor-pointer transition-colors shadow-2xs shrink-0"
                title={flashcardView === 'example' ? 'Phát âm câu ví dụ' : 'Phát âm từ vựng'}
              >
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-slate-300 font-mono font-bold bg-[#1a1f33]/90 px-1.5 py-1 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-[#343d5f] shadow-2xs shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>
                <span className="hidden sm:inline">Từ </span>{currentIndex + 1}/{lessonItems.length}
                <span className="hidden md:inline">{currentItem?.originalNumber ? ` (No. ${currentItem.originalNumber})` : ''}</span>
              </span>
            </span>
          </div>

          {/* Center: Integrated Lesson Navigator (< Minna Bài 1 ... >) */}
          <div className="flex items-center justify-center gap-0.5 sm:gap-1.5 flex-1 min-w-0 max-w-sm mx-1">
            <button 
              disabled={currentLessonIndex <= 0 || isSrsReviewActive}
              onClick={() => { 
                if (currentLessonIndex > 0) {
                  setCurrentLessonIndex(c => c - 1); 
                  setCurrentIndex(0); 
                }
              }}
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-[#1a1f33]/90 hover:bg-[#2b3353] text-slate-300 hover:text-white disabled:opacity-30 transition-all shrink-0 active:scale-95 cursor-pointer border border-[#343d5f]"
              title="Bài trước"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {isSrsReviewActive ? (
              <div className="flex items-center justify-center gap-1 bg-rose-950/80 border border-rose-500/50 rounded-lg sm:rounded-xl px-2 sm:px-3 h-7 sm:h-8 transition-all flex-1 min-w-0">
                <span className="text-rose-300 text-[10px] sm:text-xs font-extrabold truncate">🚨 SRS ({srsDueItems.length})</span>
                <button
                  onClick={() => setIsSrsReviewActive(false)}
                  className="text-[9px] text-white bg-rose-600 hover:bg-rose-500 px-1 py-0.5 rounded font-bold transition-all cursor-pointer shrink-0"
                >
                  Dừng
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsQuickLessonSelectorOpen(true)}
                className="flex-1 min-w-0 h-7 sm:h-8 inline-flex items-center justify-between bg-[#1a1f33]/90 hover:bg-[#252c48] active:bg-[#2b3353] border border-[#343d5f] hover:border-sky-500/60 rounded-lg sm:rounded-xl px-1.5 sm:px-2.5 transition-all shadow-inner cursor-pointer group"
                title="Bấm để chọn bài nhanh"
              >
                <span className="font-extrabold text-white text-[10px] sm:text-xs md:text-sm tracking-tight truncate flex-1 text-center">
                  {currentLesson.name}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover:text-sky-300 transition-transform shrink-0 ml-0.5" />
              </button>
            )}

            <button 
              disabled={currentLessonIndex >= lessons.length - 1 || isSrsReviewActive}
              onClick={() => { setCurrentLessonIndex(c => c + 1); setCurrentIndex(0); }}
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-[#1a1f33]/90 hover:bg-[#2b3353] text-slate-300 hover:text-white disabled:opacity-30 transition-all shrink-0 active:scale-95 cursor-pointer border border-[#343d5f]"
              title="Bài tiếp theo"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                const lessonNum = currentLesson.lessonNumber || parseInt(currentLesson.id.match(/\d+/)?.[0] || '1', 10);
                window.dispatchEvent(new CustomEvent('navigate_to_reading', {
                  detail: { 
                    level: selectedCurriculum === 'tango' ? 'N4' : (levelFilter === 'ALL' ? 'N5' : levelFilter), 
                    lessonNumber: lessonNum,
                    curriculum: selectedCurriculum,
                    lessonId: currentLesson.id
                  }
                }));
              }}
              className="hidden lg:flex px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-[10px] sm:text-xs font-bold transition-all items-center gap-1 active:scale-95 cursor-pointer shadow-sm"
              title="Luyện đọc hiểu AI theo từ vựng & ngữ pháp bài này"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Đọc hiểu AI</span>
            </button>
            {selectedMode === 'dokkai' && (
              <>
                <button
                  onClick={() => {
                    const newVal = !autoAdvance;
                    setAutoAdvance(newVal);
                    localStorage.setItem('jlpt_vocab_auto_advance', JSON.stringify(newVal));
                  }}
                  className={`flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                    autoAdvance 
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold shadow-3xs' 
                      : 'bg-[#1a1f33]/80 border-[#343d5f] text-slate-400 hover:text-white'
                  }`}
                  title={autoAdvance ? 'Tự chuyển câu: ĐANG BẬT' : 'Tự chuyển câu: ĐANG TẮT'}
                >
                  <FastForward className={`w-3 h-3 ${autoAdvance ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="hidden xs:inline">{autoAdvance ? 'Bật' : 'Tắt'}</span>
                </button>

                <button
                  onClick={() => {
                    const newVal = !showExampleFurigana;
                    setShowExampleFurigana(newVal);
                    localStorage.setItem('jlpt_show_example_furigana', JSON.stringify(newVal));
                  }}
                  className={`flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                    showExampleFurigana 
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold' 
                      : 'bg-[#1a1f33]/80 border-[#343d5f] text-slate-400 hover:text-white'
                  }`}
                  title="Bật/Tắt Furigana Ví dụ"
                >
                  <span>Furigana</span>
                </button>
              </>
            )}

            <button 
              onClick={() => currentItem && toggleStar(currentItem.id)}
              className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer shrink-0 ${isStarred[currentItem?.id || ''] ? 'bg-amber-950/80 border-amber-400 text-amber-400' : 'bg-[#1a1f33]/90 border-[#343d5f] text-slate-300 hover:text-white hover:bg-[#2b3353]'}`}
              title={isStarred[currentItem?.id || ''] ? 'Bỏ lưu' : 'Lưu từ vựng'}
            >
              <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isStarred[currentItem?.id || ''] ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => setShowOptions(prev => !prev)}
              className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer shrink-0 ${
                showOptions 
                  ? 'bg-slate-700 text-white border-slate-600 shadow-xs' 
                  : 'bg-[#1a1f33]/90 text-slate-300 border-[#343d5f] hover:text-white hover:bg-[#2b3353]'
              }`}
              title="Tùy chọn hiển thị & Cài đặt"
            >
              <Settings className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showOptions ? 'animate-spin-slow text-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="hidden md:flex p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer shrink-0 bg-[#1a1f33]/90 text-slate-300 border-[#343d5f] hover:text-white hover:bg-[#2b3353]"
              title={isExpanded ? 'Thu nhỏ giao diện' : 'Phóng to giao diện'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Universal Expandable Options Deck */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full overflow-hidden bg-[#1a1f33]/95 border border-[#343d5f] rounded-2xl p-3 sm:p-4 mb-3 relative z-20 shadow-xl text-slate-200"
            >
              {/* Mode Contextual Info Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#343d5f]/70 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950/90 text-indigo-300 border border-indigo-500/40 font-bold uppercase text-[11px]">
                    Chế độ {selectedMode === 'flashcard' ? 'Lật thẻ' : selectedMode === 'quiz' ? 'Trắc nghiệm' : selectedMode === 'cram' ? 'Luyện gõ' : selectedMode === 'dokkai' ? 'Đọc hiểu' : 'Ghép câu'}
                  </span>
                  <span className="text-slate-400 text-[11px] leading-tight">
                    {selectedMode === 'flashcard' && '💡 Bật Furigana & Dấu nhấn âm điệu để ghi nhớ chữ Nhật và âm đọc chuẩn xác nhất.'}
                    {selectedMode === 'quiz' && '💡 Tắt Tự chuyển câu để bạn thoải mái xem đáp án, Hán tự và giải thích chi tiết.'}
                    {selectedMode === 'cram' && '💡 Bật Tự chuyển câu khi gõ đúng. Tạm ẩn Furigana từ khi gõ để kiểm tra khả năng nhớ mặt chữ.'}
                    {selectedMode === 'dokkai' && '💡 Bật Furigana câu ví dụ & từ vựng để hỗ trợ việc đọc hiểu ngữ cảnh dễ dàng.'}
                    {selectedMode === 'shadowing' && '💡 Bật Furigana và Biểu đồ cao độ Pitch Accent để luyện ngữ điệu giọng chuẩn.'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResetModeDefaults}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0"
                  title="Khôi phục thiết lập tối ưu cho chế độ này"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Khôi phục mặc định chế độ</span>
                </button>
              </div>

              {/* Curriculum Selection Section inside Settings */}
              <div className="pb-3 mb-3 border-b border-[#343d5f]/70">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                    <span className="text-sm">📚</span>
                    <span>Bộ giáo trình học từ vựng (N4):</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {selectedCurriculum === 'minna' ? 'Minna no Nihongo (Bài 26–50)' : 'Tango 1500 (35 Mục chuyên đề)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCurriculumChange('minna')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      selectedCurriculum === 'minna'
                        ? 'bg-blue-950/90 border-blue-500 text-white shadow-md ring-1 ring-blue-400/40'
                        : 'bg-[#242b45]/80 border-[#343d5f] text-slate-400 hover:text-slate-200 hover:bg-[#2b3353]'
                    }`}
                  >
                    <span className="text-2xl shrink-0">📘</span>
                    <div className="leading-tight flex-1 min-w-0">
                      <div className="font-extrabold text-xs sm:text-sm text-blue-300 flex items-center justify-between">
                        <span>Minna no Nihongo</span>
                        {selectedCurriculum === 'minna' && <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded-full font-bold">Đang chọn</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">25 Bài học chuẩn gốc (Bài 26 – 50)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCurriculumChange('tango')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      selectedCurriculum === 'tango'
                        ? 'bg-emerald-950/90 border-emerald-500 text-white shadow-md ring-1 ring-emerald-400/40'
                        : 'bg-[#242b45]/80 border-[#343d5f] text-slate-400 hover:text-slate-200 hover:bg-[#2b3353]'
                    }`}
                  >
                    <span className="text-2xl shrink-0">📗</span>
                    <div className="leading-tight flex-1 min-w-0">
                      <div className="font-extrabold text-xs sm:text-sm text-emerald-300 flex items-center justify-between">
                        <span>Tango 1500 (N4)</span>
                        {selectedCurriculum === 'tango' && <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded-full font-bold">Đang chọn</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">7 Chương • 35 Mục chủ đề gốc</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Study Direction Toggle */}
                <button 
                  type="button"
                  onClick={toggleStudyDirection}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-xl transition-all cursor-pointer shrink-0 ${
                    studyDirection === 'VI_JP' 
                      ? 'bg-purple-950/80 text-purple-300 border-purple-500 shadow-3xs' 
                      : 'bg-sky-950/80 text-sky-300 border-sky-500 shadow-3xs'
                  }`}
                  title="Đổi chiều học: Nhật - Việt hoặc Việt - Nhật (Phím D)"
                >
                  <span>{studyDirection === 'VI_JP' ? '🇻🇳➔🇯🇵 Việt-Nhật' : '🇯🇵➔🇻🇳 Nhật-Việt'}</span>
                  <span className="text-[10px] font-mono bg-black/40 px-1 py-0.2 rounded text-slate-300">D</span>
                </button>

                {/* Auto Next Toggle */}
                <button 
                  type="button"
                  onClick={() => toggleSetting('autoAdvance', !autoAdvance)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-xl transition-all cursor-pointer shrink-0 ${
                    autoAdvance 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-3xs' 
                      : 'bg-[#242b45] text-slate-400 border-[#343d5f] hover:text-white'
                  }`}
                  title="Tự động chuyển câu tiếp theo sau khi trả lời"
                >
                  <FastForward className={`w-3.5 h-3.5 ${autoAdvance ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>Tự chuyển câu</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${autoAdvance ? 'bg-emerald-400 shadow-xs shadow-emerald-400' : 'bg-slate-500'}`} />
                </button>

                {/* Furigana Word Toggle */}
                <button 
                  type="button"
                  onClick={() => toggleSetting('showFurigana', !showFurigana)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-xl transition-all cursor-pointer shrink-0 ${
                    showFurigana 
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-3xs' 
                      : 'bg-[#242b45] text-slate-400 border-[#343d5f] hover:text-white'
                  }`}
                  title="Bật/Tắt Furigana âm đọc trên Kanji của từ"
                >
                  <span>Furigana từ</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${showFurigana ? 'bg-amber-400 shadow-xs shadow-amber-400' : 'bg-slate-500'}`} />
                </button>

                {/* Example Furigana Toggle */}
                <button 
                  type="button"
                  onClick={() => toggleSetting('showExampleFurigana', !showExampleFurigana)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-xl transition-all cursor-pointer shrink-0 ${
                    showExampleFurigana 
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-3xs' 
                      : 'bg-[#242b45] text-slate-400 border-[#343d5f] hover:text-white'
                  }`}
                  title="Bật/Tắt Furigana âm đọc trong câu ví dụ"
                >
                  <span>Furigana ví dụ</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${showExampleFurigana ? 'bg-amber-400 shadow-xs shadow-amber-400' : 'bg-slate-500'}`} />
                </button>

                {/* Pitch Accent Toggle */}
                <button 
                  type="button"
                  onClick={() => toggleSetting('showPitchAccent', !showPitchAccent)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-xl transition-all cursor-pointer shrink-0 ${
                    showPitchAccent 
                      ? 'bg-sky-950/80 text-sky-300 border-sky-500 shadow-3xs' 
                      : 'bg-[#242b45] text-slate-400 border-[#343d5f] hover:text-white'
                  }`}
                  title="Bật/Tắt biểu đồ dấu nhấn cao độ Pitch Accent"
                >
                  <span>Dấu nhấn âm</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${showPitchAccent ? 'bg-sky-400 shadow-xs shadow-sky-400' : 'bg-slate-500'}`} />
                </button>

                {/* Feedback */}
                <button 
                  type="button"
                  onClick={() => setShowFeedback(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 bg-[#242b45] border border-[#343d5f] rounded-xl hover:bg-[#2e3758] transition-all cursor-pointer shrink-0 ml-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Góp ý</span>
                </button>
              </div>

              {/* Keyboard Shortcuts in Settings Deck */}
              <div className="hidden md:flex pt-2.5 mt-2.5 border-t border-[#343d5f]/70 flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <span className="text-sm">⌨️</span>
                  <span>Phím tắt thao tác nhanh:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-[11px] text-slate-300 font-bold">
                  <span className="bg-[#242b45] px-2 py-0.5 rounded-md border border-[#343d5f] flex items-center gap-1">
                    <kbd className="text-white font-black">Space</kbd>
                    <span className="font-sans font-medium text-slate-400">Lật thẻ / Tiếp</span>
                  </span>
                  <span className="bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-600 text-emerald-300 flex items-center gap-1">
                    <kbd className="font-black">Z</kbd>
                    <span className="font-sans font-medium">✓ Đã thuộc</span>
                  </span>
                  <span className="bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-600 text-rose-300 flex items-center gap-1">
                    <kbd className="font-black">X</kbd>
                    <span className="font-sans font-medium">✗ Chưa thuộc</span>
                  </span>
                  <span className="bg-[#242b45] px-2 py-0.5 rounded-md border border-[#343d5f] flex items-center gap-1">
                    <kbd className="text-white font-black">1 - 4</kbd>
                    <span className="font-sans font-medium text-slate-400">Chọn câu</span>
                  </span>
                  <span className="bg-[#242b45] px-2 py-0.5 rounded-md border border-[#343d5f] flex items-center gap-1">
                    <kbd className="text-white font-black">R</kbd>
                    <span className="font-sans font-medium text-slate-400">Nghe Audio</span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Mode Render Space */}
        <div className="flex-1 flex flex-col justify-center py-1 sm:py-2 relative">
          {selectedMode === 'flashcard' && currentItem && (
            <div className="flex flex-col items-center justify-center w-full max-w-full sm:max-w-lg min-w-0 mx-auto px-1 sm:px-3">
              {/* Main Card Flip Area - Fixed Height so it never changes size when flipping */}
              <div 
                tabIndex={0}
                role="button"
                aria-label="Lật thẻ Flashcard (Space)"
                onClick={() => setShowFlashcardAnswer(prev => !prev)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32 || e.key === 'f' || e.key === 'F') {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFlashcardAnswer(prev => !prev);
                  }
                }}
                className="w-full bg-[#1e243b]/90 border border-[#343d5f] hover:border-[#4a5682] focus:border-emerald-500/70 focus:outline-none rounded-xl sm:rounded-2xl h-[240px] xs:h-[260px] sm:h-[290px] md:h-[320px] cursor-pointer transition-all shadow-md relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-2 right-2.5 z-20 text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase bg-[#141828]/80 px-2 py-0.5 rounded-md border border-[#343d5f]/60 tracking-wider">
                  {showFlashcardAnswer ? 'Mặt sau' : (
                    <span>Lật thẻ<span className="hidden sm:inline"> (Space)</span></span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {!showFlashcardAnswer ? (
                    <motion.div 
                      key={`front-${flashcardView}`} 
                      initial={{ opacity: 0, scale: 0.96 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 text-center space-y-2 overflow-y-auto custom-scrollbar"
                    >
                      {flashcardView === 'word' ? (
                        flashcardDirection === 'JP_VI' ? (
                          <div className="flex flex-col items-center gap-1 w-full">
                            <SelectiveFuriganaWord
                              kanji={currentItem.kanji}
                              hiragana={currentItem.hiragana}
                              showFurigana={showFurigana}
                              sizeClassName="text-2xl sm:text-3xl md:text-4xl"
                            />
                            {showPitchAccent && (
                              <div className="mt-0.5 text-center max-w-full scale-90 sm:scale-100 origin-center">
                                <PitchAccentDisplay 
                                  kanji={currentItem.kanji} 
                                  reading={currentItem.hiragana} 
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-sky-400 break-words whitespace-normal leading-snug px-2">
                            {currentItem.meaning}
                          </h3>
                        )
                      ) : (
                        // Example Sentence Mode Front
                        (() => {
                          const ex = ensureVocabExample(currentItem);
                          return flashcardDirection === 'JP_VI' ? (
                            <div className="space-y-2 max-w-md mx-auto px-2">
                              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded-full inline-block">
                                Câu ví dụ
                              </span>
                              <div className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed break-words whitespace-normal">
                                {renderExampleSentenceWithFurigana(ex.exampleSentence, currentItem)}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 max-w-md mx-auto px-2">
                              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider bg-sky-950/40 border border-sky-800/60 px-2 py-0.5 rounded-full inline-block">
                                Dịch câu ví dụ
                              </span>
                              <p className="text-base sm:text-xl font-extrabold text-sky-300 leading-relaxed break-words whitespace-normal">
                                {ex.exampleTranslation || currentItem.meaning}
                              </p>
                            </div>
                          );
                        })()
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key={`back-${flashcardView}`} 
                      initial={{ opacity: 0, scale: 0.96 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full flex flex-col justify-center items-center p-3 sm:p-4 text-center overflow-y-auto custom-scrollbar space-y-2"
                    >
                      {flashcardView === 'word' ? (
                        // Word Mode: Clean single word display (No example clutter)
                        flashcardDirection === 'JP_VI' ? (
                          <div className="space-y-2 flex flex-col items-center w-full my-auto">
                            <SelectiveFuriganaWord
                              kanji={currentItem.kanji}
                              hiragana={currentItem.hiragana}
                              showFurigana={true}
                              sizeClassName="text-2xl sm:text-3xl md:text-4xl"
                            />
                            {showPitchAccent && (
                              <div className="text-center max-w-full scale-90 sm:scale-100 origin-center">
                                <PitchAccentDisplay 
                                  kanji={currentItem.kanji} 
                                  reading={currentItem.hiragana} 
                                />
                              </div>
                            )}
                            <h3 className="text-lg sm:text-2xl font-black text-emerald-400 break-words whitespace-normal leading-tight mt-1">
                              {currentItem.meaning}
                            </h3>

                            {currentItem.kanji && (
                              <div className="pt-1 w-full text-center flex justify-center">
                                {renderKanjiColoredBreakdown(currentItem.kanji, 'sm')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2 flex flex-col items-center w-full my-auto">
                            <SelectiveFuriganaWord
                              kanji={currentItem.kanji}
                              hiragana={currentItem.hiragana}
                              showFurigana={showFurigana}
                              sizeClassName="text-2xl sm:text-3xl md:text-4xl"
                            />
                            {showPitchAccent && (
                              <div className="text-center max-w-full scale-90 sm:scale-100 origin-center">
                                <PitchAccentDisplay 
                                  kanji={currentItem.kanji} 
                                  reading={currentItem.hiragana} 
                                />
                              </div>
                            )}
                            <h3 className="text-lg sm:text-2xl font-black text-sky-400 break-words whitespace-normal leading-tight mt-1">
                              {currentItem.meaning}
                            </h3>
                            {currentItem.kanji && (
                              <div className="pt-1 text-center w-full flex justify-center">
                                {renderKanjiColoredBreakdown(currentItem.kanji, 'sm')}
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        // Example Sentence Mode Back
                        (() => {
                          const ex = ensureVocabExample(currentItem);
                          return (
                            <div className="space-y-3 w-full max-w-md mx-auto my-auto flex flex-col items-center">
                              <div className="space-y-1 w-full">
                                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded-full inline-block">
                                  Câu ví dụ
                                </span>
                                <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed break-words whitespace-normal text-center">
                                  {renderExampleSentenceWithFurigana(ex.exampleSentence, currentItem)}
                                </div>
                                {ex.exampleTranslation && (
                                  <p className="text-sm sm:text-base text-emerald-400 font-bold break-words whitespace-normal mt-1">
                                    {ex.exampleTranslation}
                                  </p>
                                )}
                              </div>

                              <div className="border-t border-[#343d5f]/80 pt-2 w-full flex items-center justify-center gap-2 text-xs">
                                <span className="font-bold text-sky-300">{currentItem.kanji || currentItem.hiragana}</span>
                                <span className="text-slate-400">({currentItem.hiragana}):</span>
                                <span className="text-slate-200">{currentItem.meaning}</span>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Big thumb-friendly Mastery Actions (Chưa thuộc / Đã thuộc) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-3 sm:mt-4">
                <button
                  type="button"
                  id="btn-flashcard-fail"
                  onClick={() => handleFlashcardMark(false)}
                  className="h-11 sm:h-12 px-3 bg-rose-950/70 hover:bg-rose-900/80 active:scale-[0.98] border-2 border-rose-500 text-rose-200 font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md touch-manipulation"
                  title="Chưa thuộc (Phím tắt: X)"
                  aria-label="Chưa thuộc (Phím tắt: X)"
                >
                  <X className="w-5 h-5 text-rose-400 stroke-[2.5] shrink-0" />
                  <span>Chưa thuộc</span>
                  <span className="hidden sm:inline text-xs font-mono opacity-80">(X)</span>
                </button>
                <button
                  type="button"
                  id="btn-flashcard-pass"
                  onClick={() => handleFlashcardMark(true)}
                  className="h-11 sm:h-12 px-3 bg-emerald-950/70 hover:bg-emerald-900/80 active:scale-[0.98] border-2 border-emerald-500 text-emerald-200 font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md touch-manipulation"
                  title="Đã thuộc (Phím tắt: Z)"
                  aria-label="Đã thuộc (Phím tắt: Z)"
                >
                  <Check className="w-5 h-5 text-emerald-400 stroke-[2.5] shrink-0" />
                  <span>Đã thuộc</span>
                  <span className="hidden sm:inline text-xs font-mono opacity-80">(Z)</span>
                </button>
              </div>

              {/* Sub-toolbar Controls: View Switcher & Study Tools */}
              <div className="flex items-center justify-between gap-1 sm:gap-2 w-full mt-2 p-1 sm:p-1.5 bg-[#1a1f33]/90 border border-[#343d5f] rounded-xl sm:rounded-2xl overflow-x-auto no-scrollbar">
                {/* View switcher (Từ đơn / Ví dụ) */}
                <div className="flex items-center gap-0.5 bg-[#121626] p-0.5 rounded-lg border border-[#2b3353]">
                  <button 
                    onClick={() => setFlashcardView('word')}
                    className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${flashcardView === 'word' ? 'bg-[#00c975] text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                  >
                    Từ đơn
                  </button>
                  <button 
                    onClick={() => setFlashcardView('example')}
                    className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${flashcardView === 'example' ? 'bg-[#00c975] text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                  >
                    Ví dụ
                  </button>
                </div>

                {/* Sub-toolbar Controls (Right) */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {/* Direction Switcher */}
                  <button 
                    onClick={() => setFlashcardDirection(p => p === 'JP_VI' ? 'VI_JP' : 'JP_VI')}
                    className="text-[10px] sm:text-[11px] font-mono font-bold border border-[#343d5f] text-slate-300 bg-[#242b45] px-1.5 sm:px-2 py-1 rounded-lg hover:bg-[#2e3758] hover:text-white transition-all cursor-pointer whitespace-nowrap"
                    title="Đổi chiều học"
                  >
                    {flashcardDirection === 'JP_VI' ? 'JP➔VI' : 'VI➔JP'}
                  </button>

                  {/* Shuffle Button */}
                  <button 
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-1 px-1.5 sm:px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${isShuffle ? 'bg-slate-700 border-slate-500 text-white' : 'bg-[#242b45] border-[#343d5f] text-slate-400 hover:text-white'}`}
                    title="Đổi thứ tự ngẫu nhiên"
                  >
                    🔀
                  </button>

                  {/* Autoplay Button */}
                  <button 
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    className={`p-1 px-1.5 sm:px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${isAutoplay ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse' : 'bg-[#242b45] border-[#343d5f] text-slate-400 hover:text-white'}`}
                    title="Tự động lật thẻ"
                  >
                    ▶️
                  </button>

                  {/* Settings Toggle */}
                  <button
                    id="flashcard-display-settings-toggle"
                    onClick={() => setShowOptions(!showOptions)}
                    className={`p-1 px-1.5 sm:px-2 rounded-lg border transition-all cursor-pointer shrink-0 ${
                      showOptions 
                        ? 'bg-slate-700 text-white border-slate-600 shadow-xs' 
                        : 'bg-[#242b45] text-slate-300 border-[#343d5f] hover:bg-[#2e3758] hover:text-white'
                    }`}
                    title="Thiết lập hiển thị"
                  >
                    <Settings className={`w-3.5 h-3.5 ${showOptions ? 'animate-spin-slow text-amber-400' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QUIZ MODE - Clean, Compact, Scalable & Dual Direction */}
          {selectedMode === 'quiz' && currentItem && (
            <div className="w-full relative z-10 flex flex-col justify-between">
              {/* Quiz Header Bar: Audio on Left, Direction Toggle & Pills & Settings on Right */}
              <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#343d5f]/60 gap-2">
                <button 
                  onClick={() => currentItem && handleSpeak(currentItem.kanji || currentItem.hiragana)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                  title="Phát âm từ vựng (Phím R)"
                >
                  <Volume2 className="w-4 h-4 text-slate-300 group-hover:text-white shrink-0" />
                  <span>Bí quá thì nghe (R)</span>
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Direction Switcher Button */}
                  <button
                    onClick={toggleStudyDirection}
                    className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                      studyDirection === 'VI_JP'
                        ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-3xs'
                        : 'bg-sky-950/80 border-sky-500 text-sky-300 shadow-3xs'
                    }`}
                    title="Đổi chiều học: Nhật - Việt hoặc Việt - Nhật (Phím D)"
                  >
                    <span>{studyDirection === 'VI_JP' ? '🇻🇳➔🇯🇵 Việt-Nhật' : '🇯🇵➔🇻🇳 Nhật-Việt'}</span>
                    <span className="text-[10px] font-mono bg-black/40 px-1 py-0.2 rounded text-slate-300">D</span>
                  </button>

                  {/* Mode Pills */}
                  <div className="flex items-center gap-0.5 bg-[#1a1f33]/70 p-0.5 rounded-lg border border-[#343d5f]">
                    {studyDirection === 'VI_JP' ? (
                      <>
                        <button 
                          onClick={() => setQuizQueryType('kanji')} 
                          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                            quizQueryType === 'kanji' || quizQueryType === 'meaning'
                              ? 'bg-[#00c975] text-white shadow-xs' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Kanji / Từ
                        </button>
                        <button 
                          onClick={() => setQuizQueryType('reading')} 
                          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                            quizQueryType === 'reading' 
                              ? 'bg-[#00c975] text-white shadow-xs' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Cách đọc
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => setQuizQueryType('meaning')} 
                          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                            quizQueryType === 'meaning' 
                              ? 'bg-[#00c975] text-white shadow-xs' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Ý nghĩa
                        </button>
                        <button 
                          onClick={() => setQuizQueryType('reading')} 
                          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                            quizQueryType === 'reading' 
                              ? 'bg-[#00c975] text-white shadow-xs' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Cách đọc
                        </button>
                        <button 
                          onClick={() => setQuizQueryType('kanji')} 
                          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                            quizQueryType === 'kanji' 
                              ? 'bg-[#00c975] text-white shadow-xs' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Kanji
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setShowOptions(prev => !prev)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      showOptions 
                        ? 'bg-slate-700 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-[#1a1f33]'
                    }`}
                    title="Cài đặt & Tùy chọn"
                  >
                    <Settings className={`w-4 h-4 ${showOptions ? 'animate-spin-slow text-amber-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Question Center: Adapts to studyDirection */}
              <div className="text-center py-2 sm:py-4 flex flex-col items-center justify-center min-h-[85px] sm:min-h-[120px]">
                {studyDirection === 'VI_JP' ? (
                  // VIETNAMESE -> JAPANESE MODE
                  <div className="space-y-1 sm:space-y-2">
                    <span className="inline-block px-2.5 py-0.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[11px] font-bold rounded-full uppercase tracking-wider">
                      🇻🇳 Nghĩa tiếng Việt
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide font-display text-center">
                      {currentItem.meaning}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      Chọn từ tiếng Nhật tương ứng bên dưới
                    </p>

                    {/* Reveal Japanese details if answered */}
                    {hasAnswered && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-2 flex flex-col items-center gap-1 border-t border-[#343d5f]/60 mt-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                            {currentItem.kanji || currentItem.hiragana}
                          </span>
                          <button
                            onClick={() => currentItem && handleSpeak(currentItem.kanji || currentItem.hiragana)}
                            className="p-1 rounded-md bg-[#1a1f33] hover:bg-[#2b3353] text-slate-300 hover:text-white transition-colors"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-4 h-4 text-emerald-400" />
                          </button>
                        </div>
                        {currentItem.kanji && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Cách đọc: <strong className="text-slate-200">{currentItem.hiragana}</strong></span>
                            <span className="text-[#38bdf8] font-bold uppercase">[{currentItem.hanViet || getHanViet(currentItem.kanji)}]</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  // JAPANESE -> VIETNAMESE MODE
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="flex justify-center my-0.5 sm:my-1">
                      {quizQueryType === 'kanji' && !hasAnswered && !showFurigana ? (
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide font-display text-center">
                          {currentItem.hiragana}
                        </h2>
                      ) : (
                        <SelectiveFuriganaWord
                          kanji={currentItem.kanji}
                          hiragana={currentItem.hiragana}
                          showFurigana={showFurigana}
                          sizeClassName="text-2xl sm:text-3xl md:text-4xl"
                        />
                      )}
                    </div>

                    {/* Sino-Vietnamese (Hán Việt) in sky blue */}
                    {currentItem.kanji && (
                      <p className="text-xs sm:text-sm font-bold text-[#38bdf8] uppercase tracking-wider text-center mt-0.5">
                        {currentItem.hanViet || getHanViet(currentItem.kanji)}
                      </p>
                    )}

                    {/* Vietnamese Meaning shown if answered or in non-meaning modes */}
                    {(hasAnswered || quizQueryType !== 'meaning') && (
                      <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium text-center mt-0.5 max-w-md mx-auto">
                        {currentItem.meaning}
                      </p>
                    )}

                    {/* Pitch Accent Display if enabled */}
                    {showPitchAccent && (
                      <div className="mt-1 scale-85 sm:scale-95 origin-center">
                        <PitchAccentDisplay 
                          kanji={currentItem.kanji} 
                          reading={currentItem.hiragana} 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4 Choices Grid (2x2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3.5 my-2 sm:my-3">
                {quizOptions.map((option, idx) => {
                  const isSelected = selectedAnswerIndex === idx;
                  const correctVal = studyDirection === 'VI_JP'
                    ? (quizQueryType === 'reading' ? currentItem.hiragana : (currentItem.kanji || currentItem.hiragana))
                    : (quizQueryType === 'reading' 
                      ? currentItem.hiragana 
                      : quizQueryType === 'kanji' 
                      ? currentItem.kanji || currentItem.hiragana 
                      : currentItem.meaning);
                  const isCorrectAnswer = option === correctVal;
                  
                  let btnStyle = 'bg-[#2b3353]/70 hover:bg-[#343e65] border-[#3e4873] text-white';
                  if (hasAnswered) {
                    if (isCorrectAnswer) {
                      btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-300 ring-1 ring-rose-500 font-bold';
                    } else {
                      btnStyle = 'bg-[#202742]/40 border-slate-700/40 text-slate-500 opacity-35';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasAnswered}
                      onClick={() => handleSelectAnswer(idx)}
                      className={`px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl border text-left flex items-center justify-between transition-all group cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                        <span className="text-slate-400 text-xs sm:text-sm font-mono font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold tracking-wide text-sm sm:text-base truncate">
                          {option}
                        </span>
                      </div>
                      {hasAnswered && isCorrectAnswer && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Continue Button when Answered */}
              {hasAnswered && (
                <div className="space-y-2 pt-1">
                  {quizFeedbackMessage && (
                    <div className={`p-2 sm:p-2.5 rounded-xl text-center text-xs sm:text-sm font-bold border transition-all ${
                      reactionState === 'correct' 
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}>
                      {quizFeedbackMessage}
                    </div>
                  )}

                  {/* Supplementary example sentence */}
                  {(() => {
                    const ex = ensureVocabExample(currentItem);
                    return (
                      <div className="p-2.5 sm:p-3 bg-[#1a1f33]/80 border border-[#343d5f] rounded-xl text-xs space-y-1 text-left">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-bold uppercase text-[10px] text-sky-400">Ví dụ minh họa:</span>
                          <button 
                            onClick={() => handleSpeak(ex.exampleSentence, true)}
                            className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3 text-sky-400" />
                            <span>Nghe câu</span>
                          </button>
                        </div>
                        <div className="text-slate-200 font-medium py-1">
                          {renderExampleSentenceWithFurigana(ex.exampleSentence, currentItem)}
                        </div>
                        {ex.exampleTranslation && (
                          <p className="text-slate-400 italic text-[11px]">
                            {ex.exampleTranslation}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex justify-center">
                    <button 
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-[#00c975] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transform active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{autoAdvance ? '⏳ Tự chuyển sau 1.5s... hoặc Bấm Tiếp tục (Enter / Space)' : 'Tiếp tục (Enter / Space)'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Footer Inside Card with Windows / Desktop Keyboard Shortcut Reminder */}
              <div className="border-t border-[#343d5f]/60 pt-2.5 flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-slate-400 relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-sm opacity-80 select-none">
                    <span>🦉</span>
                    <span className="text-xs -ml-1">🎯</span>
                  </div>
                  <span className="font-semibold text-slate-300 text-xs">
                    {currentIndex + 1} / {lessonItems.length}
                  </span>
                </div>

                {/* Windows Keyboard Shortcuts Helper */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 font-medium">
                  <span className="inline-flex items-center gap-1 bg-[#1a1f33] px-1.5 py-0.5 rounded border border-[#343d5f]">
                    <kbd className="font-mono text-[10px] text-sky-300 font-bold">1 - 4</kbd>
                    <span className="text-slate-400 text-[10px]">chọn</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#1a1f33] px-1.5 py-0.5 rounded border border-[#343d5f]">
                    <kbd className="font-mono text-[10px] text-emerald-300 font-bold">Enter / Space</kbd>
                    <span className="text-slate-400 text-[10px]">tiếp</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#1a1f33] px-1.5 py-0.5 rounded border border-[#343d5f]">
                    <kbd className="font-mono text-[10px] text-amber-300 font-bold">R</kbd>
                    <span className="text-slate-400 text-[10px]">nghe</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#1a1f33] px-1.5 py-0.5 rounded border border-[#343d5f]">
                    <kbd className="font-mono text-[10px] text-purple-300 font-bold">D</kbd>
                    <span className="text-slate-400 text-[10px]">đổi chiều</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedMode === 'cram' && currentItem && (
            <div className="w-full max-w-lg mx-auto space-y-5 relative">
              {/* Mascot decoration */}
              <div className="absolute left-[-100px] top-4 opacity-10 select-none pointer-events-none hidden lg:flex flex-col items-center">
                <span className="text-7xl">🦉</span>
                <span className="text-3xl absolute -right-3 -bottom-1">
                  ⌨️
                </span>
              </div>

              <div className="text-center space-y-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-wide">
                  Nhập từ vựng tương ứng nghĩa:
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                  {currentItem.meaning}
                </h3>
                
                {/* Unified Interactive Character Slots */}
                <div 
                  onClick={() => cramInputRef.current?.focus()}
                  className="relative py-3 px-3 flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 cursor-text select-none min-h-[70px]"
                >
                  {/* Invisible input capturing keystrokes & converting Romaji */}
                  <input 
                    ref={cramInputRef}
                    type="text"
                    autoFocus
                    value={cramInput}
                    onChange={(e) => {
                      const targetIsKatakana = isKatakana(currentItem?.hiragana || '') || isKatakana(currentItem?.kanji || '');
                      let text = convertRomajiToHiragana(e.target.value);
                      if (targetIsKatakana) {
                        text = hiraganaToKatakana(text);
                      }
                      setCramInput(text);
                      if (cramFeedback !== 'neutral') {
                        setCramFeedback('neutral');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Tab' || 
                        (e.shiftKey && e.key === 'Enter') || 
                        e.key === 'F1' || 
                        ((e.ctrlKey || e.altKey) && (e.key === 'h' || e.key === 'H' || e.key === 'g' || e.key === 'G'))
                      ) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleProvideHint();
                        return;
                      }

                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        if (cramFeedback === 'correct') {
                          handleNext();
                        } else {
                          handleCheckCram();
                        }
                      }
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-text pointer-events-auto"
                    aria-label="Nhập từ vựng tiếng Nhật"
                  />

                  {/* Character Slot Dashes with Direct Real-time Display */}
                  {(() => {
                    const targetIsKatakana = isKatakana(currentItem.hiragana || '') || isKatakana(currentItem.kanji || '');
                    let targetStr = normalizeCramStr(currentItem.hiragana);
                    if (targetIsKatakana) {
                      targetStr = hiraganaToKatakana(targetStr);
                    }
                    const totalSlots = Math.max(targetStr.length, cramInput.length);
                    const slotIndices = Array.from({ length: totalSlots }, (_, i) => i);

                    return slotIndices.map((idx) => {
                      const typedChar = cramInput[idx] || '';
                      const isHinted = idx < cramHintsUsed && !typedChar;
                      const displayChar = typedChar || (isHinted ? targetStr[idx] : '');
                      const isActive = idx === cramInput.length && cramFeedback === 'neutral';

                      return (
                        <div
                          key={idx}
                          className={`
                            relative flex items-center justify-center font-jp font-bold transition-all duration-200 transform
                            w-10 sm:w-12 h-12 sm:h-14 text-xl sm:text-2xl rounded-2xl border-2
                            ${
                              cramFeedback === 'correct'
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 dark:text-emerald-300 font-extrabold ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/20 scale-105'
                                : cramFeedback === 'wrong'
                                ? 'bg-rose-500/20 border-rose-400 text-rose-500 dark:text-rose-300 font-extrabold ring-2 ring-rose-400/40 shadow-lg shadow-rose-500/20'
                                : typedChar
                                ? 'bg-sky-500/15 border-sky-400 dark:border-sky-400 text-slate-900 dark:text-sky-200 font-extrabold shadow-sm shadow-sky-500/10'
                                : isHinted
                                ? 'bg-amber-500/15 border-amber-400 text-amber-600 dark:text-amber-300 font-bold shadow-sm shadow-amber-500/10'
                                : isActive
                                ? 'bg-indigo-500/20 border-indigo-500 dark:border-indigo-400 text-indigo-500 dark:text-indigo-300 ring-2 ring-indigo-500/40 shadow-md shadow-indigo-500/30 scale-105'
                                : 'bg-slate-100/90 dark:bg-[#181d30]/90 border-slate-300 dark:border-[#2e3756] text-slate-400 dark:text-slate-500 shadow-inner'
                            }
                          `}
                        >
                          {displayChar ? (
                            <span>{displayChar}</span>
                          ) : isActive ? (
                            <span className="w-0.5 h-6 bg-indigo-500 dark:bg-indigo-400 animate-pulse rounded-full shadow-sm shadow-indigo-400" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-400/60 dark:bg-slate-600/60" />
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Standard Keyboard Action Buttons & Feedback */}
              <div className="space-y-4">
                <div className="flex gap-2 sm:gap-3">
                  <button 
                    type="button"
                    onClick={handleProvideHint}
                    disabled={
                      (() => {
                        const targetIsKatakana = isKatakana(currentItem.hiragana || '') || isKatakana(currentItem.kanji || '');
                        let str = normalizeCramStr(currentItem.hiragana);
                        if (targetIsKatakana) str = hiraganaToKatakana(str);
                        return cramHintsUsed >= str.length || cramFeedback === 'correct';
                      })()
                    }
                    className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm rounded-xl border border-amber-200 dark:border-amber-800 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>💡 Gợi ý ({cramHintsUsed}/{
                      (() => {
                        const targetIsKatakana = isKatakana(currentItem.hiragana || '') || isKatakana(currentItem.kanji || '');
                        let str = normalizeCramStr(currentItem.hiragana);
                        if (targetIsKatakana) str = hiraganaToKatakana(str);
                        return str.length;
                      })()
                    })</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                      Tab
                    </span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (cramFeedback === 'correct') {
                        handleNext();
                      } else {
                        handleCheckCram();
                      }
                    }}
                    className={`flex-1 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                      cramFeedback === 'correct'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 ring-2 ring-emerald-400'
                        : 'bg-slate-800 hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-slate-600/10'
                    }`}
                  >
                    <span>{cramFeedback === 'correct' ? 'Câu kế tiếp' : 'Kiểm tra'}</span>
                    <span className="text-[10px] font-mono opacity-80">(Enter ↵)</span>
                  </button>
                </div>

                {/* Submitting Feedback Notification */}
                {cramFeedback !== 'neutral' && (
                  <div className={`p-3 rounded-xl border text-center text-xs font-bold ${
                    cramFeedback === 'correct'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}>
                    {cramFeedback === 'correct'
                      ? '🎉 Chính xác! Nhấn Enter ↵ một lần nữa để chuyển sang câu kế tiếp.'
                      : '😿 Chưa đúng! Gõ lại hoặc nhấn Gợi ý, sau đó nhấn Enter ↵ để kiểm tra.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedMode === 'dokkai' && currentItem && (
            <div className="space-y-6 w-full max-w-3xl mx-auto relative z-10">
              
              {/* Question Header & Sentence Stage */}
              <div className="text-center py-3 sm:py-5 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <span>📖</span>
                  <span>Đọc hiểu ngữ cảnh &amp; Chọn từ điền vào chỗ trống</span>
                </div>

                {/* Example sentence with smart blanks */}
                <div className="py-2 px-2 sm:px-4">
                  {renderDokkaiSentenceWithCloze(
                    currentItem.exampleSentence,
                    currentItem,
                    dokkaiHasAnswered,
                    selectedDokkaiIndex,
                    dokkaiOptions
                  )}
                </div>

                {/* Translation toggle & Mnemonic Content */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {!dokkaiHasAnswered ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowDokkaiTranslation(prev => !prev)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer shadow-3xs"
                      >
                        {showDokkaiTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showDokkaiTranslation ? 'Ẩn gợi ý dịch' : 'Gợi ý nghĩa tiếng Việt'}</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full max-w-xl mx-auto p-3.5 bg-sky-50/90 border border-sky-200/80 rounded-2xl text-center space-y-1.5 shadow-xs">
                      <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                        🇻🇳 Dịch nghĩa câu hoàn chỉnh
                      </span>
                      <p className="text-sm sm:text-base font-bold text-sky-950 leading-relaxed">
                        {currentItem.exampleTranslation}
                      </p>
                      {currentItem.meaning && (
                        <p className="text-xs text-slate-600 font-medium pt-1.5 border-t border-sky-100">
                          <span className="font-bold text-slate-800">{currentItem.kanji || currentItem.hiragana}</span>: {currentItem.meaning}
                        </p>
                      )}
                    </div>
                  )}

                  {!dokkaiHasAnswered && showDokkaiTranslation && (
                    <div className="text-xs sm:text-sm text-slate-600 italic bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-2 max-w-lg shadow-3xs">
                      <span className="font-semibold not-italic text-amber-800 mr-1">Gợi ý:</span>
                      {currentItem.exampleTranslation}
                    </div>
                  )}
                </div>
              </div>

              {/* 4 choices options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {dokkaiOptions.map((option, idx) => {
                  const isSelected = selectedDokkaiIndex === idx;
                  const correctVal = currentItem.kanji || currentItem.hiragana;
                  const isCorrect = option === correctVal;

                  // Find vocab details for supplementary translation
                  const optVocab = vocabData.find(v => (v.kanji && v.kanji === option) || v.hiragana === option);

                  let btnStyle = 'bg-white border-slate-200/90 text-slate-900 hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs';
                  if (dokkaiHasAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50/90 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-50/90 border-rose-400 text-rose-900 font-bold ring-2 ring-rose-500/20';
                    } else {
                      btnStyle = 'bg-slate-50/60 border-slate-200/60 text-slate-400 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={dokkaiHasAnswered}
                      onClick={() => handleSelectDokkai(idx)}
                      className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border text-left flex items-center justify-between text-sm sm:text-base transition-all group cursor-pointer active:scale-98 ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-mono font-bold shrink-0 transition-colors ${
                          dokkaiHasAnswered && isCorrect 
                            ? 'bg-emerald-500 text-white' 
                            : dokkaiHasAnswered && isSelected 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold tracking-wide text-base sm:text-lg text-slate-950">
                            {renderColorizedKanjiWord(option, false, true)}
                          </span>
                          {/* Display meaning annotation when answered */}
                          {dokkaiHasAnswered && optVocab && (
                            <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
                              {optVocab.hiragana !== option ? `${optVocab.hiragana} • ` : ''}{optVocab.meaning}
                            </span>
                          )}
                        </div>
                      </div>
                      {dokkaiHasAnswered && isCorrect && <Check className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />}
                      {dokkaiHasAnswered && isSelected && !isCorrect && <X className="w-5 h-5 text-rose-500 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic desktop/mobile continue button */}
              {dokkaiHasAnswered && (
                <div className="flex justify-center pt-2">
                  <button 
                    onClick={handleNext}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transform active:scale-95 transition-all flex items-center gap-2 cursor-pointer animate-fade-in"
                  >
                    <span>{autoAdvance ? '⏳ Đang tự chuyển câu (1.5s)... hoặc bấm Tiếp tục (Enter / Space)' : 'Tiếp tục (Enter / Space)'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedMode === 'shadowing' && currentItem && (
            <div className="space-y-6 w-full max-w-3xl mx-auto relative">
              {/* Mascot decoration */}
              <div className="absolute right-0 bottom-0 opacity-10 select-none pointer-events-none hidden lg:flex flex-col items-center">
                <span className="text-7xl">🦉</span>
                <span className="text-3xl absolute -left-3 -top-1">🎧</span>
              </div>

              <div className="text-center space-y-1.5">
                <span className="text-xs text-slate-600 font-mono font-bold uppercase block">Nghe đuổi & Sắp xếp câu ghép chuẩn xác</span>
                <p className="text-xs text-slate-400">Hãy nghe phát âm rồi ráp mảnh ghép thành câu văn mẫu Nhật Bản hoàn chỉnh</p>
              </div>

              {/* Audio player simulator wave */}
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleSpeak(currentItem.exampleSentence)}
                    className="w-10 h-10 bg-slate-600 hover:bg-slate-500 text-white rounded-full flex items-center justify-center shadow-sm"
                  >
                    🔊
                  </button>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Ví dụ Nhật ngữ chuẩn mẫu</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Nhấn loa để phát đi phát lại từ vựng dài</span>
                  </div>
                </div>

                {/* Simulated equalizer animation wave bar */}
                <div className="flex items-center gap-1 h-6">
                  <span className={`w-1 h-3 bg-slate-500 rounded-full ${isPlayingWave ? 'animate-pulse' : ''}`} />
                  <span className={`w-1 h-5 bg-slate-500 rounded-full ${isPlayingWave ? 'animate-pulse delay-75' : ''}`} />
                  <span className={`w-1 h-4 bg-slate-500 rounded-full ${isPlayingWave ? 'animate-pulse delay-150' : ''}`} />
                  <span className={`w-1 h-6 bg-slate-500 rounded-full ${isPlayingWave ? 'animate-pulse delay-300' : ''}`} />
                  <span className={`w-1 h-2 bg-slate-500 rounded-full ${isPlayingWave ? 'animate-pulse' : ''}`} />
                </div>
              </div>

              {/* Empty slots for assembled fragments */}
              <div className="min-h-[70px] bg-slate-50/20 border-2 border-dashed border-slate-200 p-4 rounded-xl flex flex-wrap gap-2.5 items-center justify-center">
                {shadowingSelectedIndices.length === 0 ? (
                  <span className="text-xs text-slate-400 font-medium">Nhấp các từ phía dưới hoặc gõ phím số để ghép câu</span>
                ) : (
                  shadowingSelectedIndices.map((chipIdx, sIdx) => {
                    const chip = shadowingChips[chipIdx];
                    return (
                      <span 
                        key={sIdx} 
                        onClick={() => handleRemoveChipAtIndex(sIdx)}
                        className="px-3.5 py-1.5 bg-slate-700 text-white rounded-lg text-sm font-semibold shadow-xs cursor-pointer hover:bg-rose-600 transition-all inline-flex items-center gap-1.5 group"
                      >
                        <span className="text-[10px] bg-slate-600 group-hover:bg-rose-700 text-slate-200 px-1.5 py-0.5 rounded font-bold font-mono">
                          {chipIdx + 1}
                        </span>
                        {renderColorizedKanjiWord(chip, false, true)}
                      </span>
                    );
                  })
                )}
              </div>

              {/* Shuffled pool chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Danh sách mảnh ghép</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-mono">
                    Bấm số 1-{shadowingChips.length} để chọn nhanh
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2.5 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                  {shadowingChips.map((chip, idx) => {
                    const isUsed = shadowingSelectedIndices.includes(idx);
                    return (
                      <button
                        key={idx}
                        disabled={isUsed}
                        onClick={() => handleSelectChipIndex(idx)}
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all inline-flex items-center gap-2 ${
                          isUsed 
                            ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-40 cursor-not-allowed' 
                            : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md text-slate-900 shadow-xs cursor-pointer active:scale-95'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold font-mono ${
                          isUsed ? 'bg-slate-200 text-slate-400' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {idx + 1}
                        </span>
                        {renderColorizedKanjiWord(chip, false, true)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checker feedback status & Continue button */}
              {shadowingIsCorrect !== null && (
                <div className="space-y-3 pt-1">
                  <div className={`p-3.5 rounded-xl border text-center text-xs font-bold ${shadowingIsCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    {shadowingIsCorrect ? '🎉 Hoàn hảo! Bạn đã sắp xếp chuẩn xác 100% ngữ pháp.' : '😿 Trình tự chưa chính xác! Vui lòng xóa bớt hoặc nhấn Backspace rồi thử lại.'}
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transform active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Tiếp tục (Enter / Space)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          </div>
        </div>
      </div>

        {/* Dynamic mascot message bottom status bar */}
        {selectedMode === 'dokkai' ? (
          <div className="border-t border-slate-100 pt-4 flex flex-row items-center justify-between gap-4 mt-6 relative z-10">
            {/* Left side: Current slide number fraction */}
            <div className="flex items-center gap-2 select-none">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-800">
                Câu {currentIndex + 1} / {lessonItems.length}
              </span>
            </div>

            {/* Middle: Shortcut indicators */}
            <div className="hidden md:flex items-center gap-1 text-slate-400 text-xs font-medium">
              <span>Nhấn</span>
              <kbd className="bg-white border border-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[10px] mx-1">1-4</kbd>
              <span>để chọn,</span>
              <kbd className="bg-white border border-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[10px] mx-1">Enter / Space</kbd>
              <span>để tiếp tục</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Responsive Cohesive Mode Selectors Bar */}
      <div className="w-full max-w-[780px] space-y-1.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chế độ học:</span>
        </div>
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#151a2e] rounded-xl sm:rounded-2xl border border-[#2b3353] shadow-inner">
          <button 
            type="button"
            onClick={() => handleSwitchMode('flashcard')} 
            className={`py-2 px-1 rounded-lg sm:rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all text-[11px] sm:text-xs font-bold cursor-pointer ${
              selectedMode === 'flashcard' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2642]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Lật thẻ</span>
          </button>

          <button 
            type="button"
            onClick={() => handleSwitchMode('quiz')} 
            className={`py-2 px-1 rounded-lg sm:rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all text-[11px] sm:text-xs font-bold cursor-pointer ${
              selectedMode === 'quiz' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2642]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Trắc nghiệm</span>
          </button>

          <button 
            type="button"
            onClick={() => handleSwitchMode('cram')} 
            className={`py-2 px-1 rounded-lg sm:rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all text-[11px] sm:text-xs font-bold cursor-pointer ${
              selectedMode === 'cram' 
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2642]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Luyện gõ</span>
          </button>

          <button 
            type="button"
            onClick={() => handleSwitchMode('dokkai')} 
            className={`py-2 px-1 rounded-lg sm:rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all text-[11px] sm:text-xs font-bold cursor-pointer ${
              selectedMode === 'dokkai' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2642]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Đọc hiểu</span>
          </button>

          <button 
            type="button"
            onClick={() => handleSwitchMode('shadowing')} 
            className={`py-2 px-1 rounded-lg sm:rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all text-[11px] sm:text-xs font-bold cursor-pointer ${
              selectedMode === 'shadowing' 
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2642]'
            }`}
          >
            <Music className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Ghép câu</span>
          </button>
        </div>
      </div>
    </div>

      {/* Dynamic Report/Góp ý Modal overlay */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-950">Góp ý sửa đổi thuật ngữ</h3>
              <button onClick={() => setShowFeedback(false)} className="text-slate-400 hover:text-slate-800 text-xl font-bold">×</button>
            </div>

            {feedbackSent ? (
              <div className="p-6 text-center space-y-2">
                <span className="text-4xl block">🎉</span>
                <p className="text-sm font-bold text-slate-950">Cảm ơn ý kiến vàng ngọc của bạn!</p>
                <p className="text-xs text-slate-500">Hệ thống sẽ cập nhật và phản hồi trong thời gian sớm nhất.</p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">Loại lỗi:</label>
                  <select 
                    value={feedbackType} 
                    onChange={e => setFeedbackType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm"
                  >
                    <option value="spelling">Chính tả / Từ vựng sai nét</option>
                    <option value="audio">Lỗi phát âm / Audio rè</option>
                    <option value="translation">Bản dịch tiếng Việt sai nghĩa</option>
                    <option value="other">Ý kiến đóng góp khác</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">Mô tả chi tiết:</label>
                  <textarea 
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    required
                    placeholder="Hãy điền chi tiết lỗi hoặc góp ý sửa đổi tại đây..."
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-slate-500/20"
                  />
                </div>

                <button type="submit" className="w-full py-2.5 bg-slate-600 hover:bg-slate-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-slate-600/10">
                  Gửi báo cáo góp ý
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Vocabulary terms list section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-lg font-bold text-slate-950 tracking-tight">Thuật ngữ trong bài này ({lessonItems.length})</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {lessonItems.map((v, index) => {
            const isWordStarred = isStarred[v.id] || false;
            const statusVal = userProfile.vocabStatus?.[v.id];
            const isMastered = typeof statusVal === 'object' ? (statusVal as any)?.status === 'mastered' : statusVal === 'mastered';
            return (
              <VocabListItemCard
                key={v.id}
                v={v}
                index={index}
                isWordStarred={isWordStarred}
                isMastered={isMastered}
                showPitchAccent={showPitchAccent}
                onToggleStar={toggleStar}
                onToggleMastered={toggleMastered}
                onSpeak={handleSpeak}
                onSelectKanji={handleSelectKanji}
              />
            );
          })}
        </div>
      </div>

      {/* Quick Lesson Selector Modal */}
      <AnimatePresence>
        {isQuickLessonSelectorOpen && (
          <div 
            className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            onClick={() => setIsQuickLessonSelectorOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1f33] border border-[#343d5f] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden text-slate-100"
            >
              {/* Modal Header */}
              <div className="p-3.5 sm:p-4 border-b border-[#343d5f] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-black text-xs">
                    {levelFilter || userProfile.targetLevel}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">Chọn bài học nhanh</h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedCurriculum === 'minna' ? '📘 Minna no Nihongo N4' : '📗 Tango 1500 N4'} • {lessons.length} bài
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsQuickLessonSelectorOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#252c48] transition-all cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Curriculum Selector inside Modal */}
              <div className="px-3 sm:px-4 pt-3 shrink-0">
                <div className="grid grid-cols-2 gap-1.5 bg-[#121626] p-1 rounded-xl border border-[#2b3353]">
                  <button
                    type="button"
                    onClick={() => handleCurriculumChange('minna')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedCurriculum === 'minna'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>📘</span>
                    <span>Minna (Bài 26-50)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurriculumChange('tango')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedCurriculum === 'tango'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>📗</span>
                    <span>Tango (7 Chương)</span>
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="p-3 sm:p-4 border-b border-[#252c48] shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={quickLessonSearch}
                    onChange={(e) => setQuickLessonSearch(e.target.value)}
                    placeholder="Tìm bài học (ví dụ: 1, 25, Minna...)"
                    className="w-full bg-[#111422] border border-[#343d5f] focus:border-sky-500/80 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    autoFocus
                  />
                  {quickLessonSearch && (
                    <button 
                      onClick={() => setQuickLessonSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lessons List/Grid */}
              <div className="p-3 sm:p-4 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickFilteredLessons.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-400 text-xs sm:text-sm">
                    Không tìm thấy bài học nào phù hợp với "{quickLessonSearch}"
                  </div>
                ) : (
                  quickFilteredLessons.map((les) => {
                    const originalIndex = lessons.findIndex(l => l.id === les.id);
                    const isCurrent = originalIndex === currentLessonIndex;
                    const stats = lessonVocabCountMap[les.id] || { total: 0, learned: 0 };

                    return (
                      <button
                        key={les.id}
                        onClick={() => {
                          if (originalIndex !== -1) {
                            setCurrentLessonIndex(originalIndex);
                            setCurrentIndex(0);
                          }
                          setIsQuickLessonSelectorOpen(false);
                          setQuickLessonSearch('');
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                          isCurrent
                            ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/30'
                            : 'bg-[#121626] border-[#2b3353] hover:border-sky-500/60 hover:bg-[#1a2035] text-slate-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs sm:text-sm truncate">
                              {les.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full shrink-0">
                                Đang học
                              </span>
                            )}
                          </div>
                          {les.lessonTitleJp && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {les.lessonTitleJp}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right shrink-0 text-[10px] sm:text-[11px] font-mono text-slate-400 group-hover:text-slate-300">
                          <span className="font-bold text-slate-300">{stats.total}</span> từ
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Kanji Detail Modal Popup */}
      <KanjiDetailModal
        kanjiChar={selectedKanji || ''}
        isOpen={isKanjiModalOpen}
        onClose={() => {
          setIsKanjiModalOpen(false);
          setSelectedKanji(null);
        }}
        onSelectWord={jumpToVocabularyById}
        allVocabData={vocabData}
      />
    </div>
  );
}
