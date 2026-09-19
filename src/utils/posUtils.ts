/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { LessonReadingVocab } from '../types';

export type PosType = 'noun' | 'verb' | 'adjective' | 'other';

export const POS_CONFIG: Record<'noun' | 'verb' | 'adjective', {
  label: string;
  labelEn: string;
  color: string;
  underlineClass: string;
  textClass: string;
  badgeClass: string;
  glowClass: string;
  bgClass: string;
}> = {
  noun: {
    label: 'Danh từ',
    labelEn: 'Noun',
    color: '#38bdf8', // Sky 400
    underlineClass: 'border-b-2 border-sky-400 pb-[1px]',
    textClass: 'text-sky-300 font-bold',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    glowClass: 'ring-2 ring-sky-400/80 bg-sky-950/40 rounded',
    bgClass: 'bg-sky-500/10'
  },
  verb: {
    label: 'Động từ',
    labelEn: 'Verb',
    color: '#fb923c', // Orange 400
    underlineClass: 'border-b-2 border-orange-400 pb-[1px]',
    textClass: 'text-orange-400 font-bold',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    glowClass: 'ring-2 ring-orange-400/80 bg-orange-950/40 rounded',
    bgClass: 'bg-orange-500/10'
  },
  adjective: {
    label: 'Tính từ',
    labelEn: 'Adjective',
    color: '#34d399', // Emerald 400
    underlineClass: 'border-b-2 border-emerald-400 pb-[1px]',
    textClass: 'text-emerald-300 font-bold',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    glowClass: 'ring-2 ring-emerald-400/80 bg-emerald-950/40 rounded',
    bgClass: 'bg-emerald-500/10'
  }
};

// In-memory cache for POS maps to prevent redundant network requests
const POS_CACHE = new Map<string, Record<string, PosType>>();

/**
 * Call server to tokenize passage and return POS map (using Kuromoji morphological engine)
 */
export async function fetchPosMapForPassage(passage: string): Promise<Record<string, PosType>> {
  if (!passage || typeof passage !== 'string') return {};
  const cacheKey = passage.slice(0, 300) + '_' + passage.length;
  if (POS_CACHE.has(cacheKey)) {
    return POS_CACHE.get(cacheKey)!;
  }

  try {
    const res = await axios.post('/api/reading/tokenize-pos', { text: passage });
    if (res.data?.success && res.data.posMap) {
      POS_CACHE.set(cacheKey, res.data.posMap);
      return res.data.posMap;
    }
  } catch (err) {
    console.warn('POS tokenization request failed, falling back to local heuristic:', err);
  }
  return {};
}

// Strict exclusion list: Grammatical particles, auxiliary markers, and connective structures that must NEVER be highlighted as Noun or Verb
const GRAMMAR_EXCLUSIONS = new Set([
  'は', 'が', 'を', 'に', 'で', 'と', 'へ', 'から', 'まで', 'より', 'も', 'の', 'や', 'か', 'ね', 'よ', 'わ', 'ぞ', 'ぜ', 'な', 'さ',
  'という', 'といった', 'として', 'としての', 'によって', 'により', 'について', 'に関して', 'に対し', 'に対して', 'にとって',
  'とともに', 'をはじめ', 'をはじめとする', 'を通じて', 'を通して', 'をもとに', 'に基づいて', 'にかけて', 'にわたって', 'にあたって',
  'に際して', 'につれて', 'にしたがって', 'に伴って', 'だけ', 'しか', 'ばかり', 'ほど', 'くらい', 'ぐらい', 'など', 'なんて', 'なんか',
  'さえ', 'こそ', 'でも', 'ても', 'けれど', 'けれども', 'けど', 'のに', 'ので', 'から', 'たら', 'なら', 'ば',
  'です', 'だ', 'である', 'でした', 'だった', 'ではありません', 'じゃない', 'でしょう', 'だろう', 'ます', 'ました', 'ません', 'ませんでした',
  'よう', 'そう', 'らしい', 'みたい', 'ため', 'はず', 'わけ', 'つもり', 'こと', 'もの', 'ところ', 'とき', '時', '間'
]);

// Known Japanese i-adjectives
const COMMON_I_ADJECTIVES = new Set([
  '難しい', '新しい', '古い', '高い', '安い', '大きい', '小さい', '美しい', '優しい', '面白い', '楽しい', '悲しい',
  '暑い', '寒い', '痛い', '甘い', '辛い', '早い', '速い', '遅い', '良い', 'いい', 'ない', '無い', '可愛い',
  '暖かい', '温かい', '涼しい', '冷たい', '暗い', '明るい', '重い', '軽い', '深い', '浅い', '太い', '細い',
  '近い', '遠い', '強い', '弱い', '長い', '短い', '広い', '狭い', '正しい', '忙しい', '危ない', '酷い',
  '美味しい', 'まずい', '易しい', '嬉しい', '苦しい', '恥ずかしい', '悔しい', '珍しい', '素晴らしい', '凄い',
  '濃い', '薄い', '固い', '硬い', '柔らかい', '汚い', '痒い', '臭い', '眠い', '欲しい', '羨ましい'
]);

// Known Japanese na-adjectives
const COMMON_NA_ADJECTIVES = new Set([
  '静か', '有名', '大切', '簡単', '便利', '親切', '元気', '綺麗', '特別', '好き', '嫌い', '上手', '下手',
  '賑やか', '安全', '危険', '自由', '丁寧', '真面目', '不便', '素敵', '複雑', '重要', '必要', '邪魔',
  '立派', '様々', '残念', '盛ん', '丈夫', '熱心', '素直', '明確', '豊富', '適切', '貴重', '快適'
]);

/**
 * Universal POS detector combining Kuromoji POS map, VocabularyList context, and Japanese morphology
 */
export function detectWordPos(
  word: string,
  text: string,
  posMap?: Record<string, PosType | string> | null,
  vocabList?: LessonReadingVocab[] | null
): PosType {
  const targetWord = (word || text || '').trim();
  const targetText = (text || word || '').trim();
  if (!targetWord && !targetText) return 'other';

  // Ignore punctuation
  if (/^[、。！？\s\n「」『』（）()[\].,!?:;\-–—…]+$/.test(targetWord)) {
    return 'other';
  }

  const cleanWord = targetWord.replace(/[\s。、！？「」『』（）()[\]]/g, '');
  const cleanText = targetText.replace(/[\s。、！？「」『』（）()[\]]/g, '');
  const sample = cleanWord || cleanText;

  if (!sample) return 'other';

  // 1. NEVER tag single Hiragana or Katakana as Noun / Verb (e.g. single 'い', 'し', 'て', 'た', 'る', 'だ', 'う', etc.)
  if (/^[ぁ-んァ-ヶ]$/.test(sample)) {
    return 'other';
  }

  // 2. Strict exclusion of grammatical particles and connectors
  if (GRAMMAR_EXCLUSIONS.has(sample)) {
    return 'other';
  }

  // 3. Known Adjectives Check (Fast direct lookup)
  if (COMMON_I_ADJECTIVES.has(sample) || COMMON_NA_ADJECTIVES.has(sample)) {
    return 'adjective';
  }

  // 4. Direct match in posMap (Kuromoji engine)
  if (posMap) {
    const checkKeys = [cleanWord, cleanText, targetWord, targetText];
    for (const k of checkKeys) {
      if (k && posMap[k]) {
        // Skip single kana even if Kuromoji returned it
        if (/^[ぁ-んァ-ヶ]$/.test(k)) continue;
        if (GRAMMAR_EXCLUSIONS.has(k)) continue;

        const val = String(posMap[k]).toLowerCase();
        if (val === 'adjective' || val.includes('tính') || val.includes('形')) return 'adjective';
        if (val === 'noun' || val.includes('danh') || val.includes('名')) return 'noun';
        if (val === 'verb' || val.includes('động') || val.includes('動')) return 'verb';
      }
    }
  }

  // 5. Vocabulary list matching
  if (vocabList && Array.isArray(vocabList)) {
    const matched = vocabList.find(v => {
      const vKanji = (v.kanji || '').trim();
      const vWord = (v.word || '').trim();
      const vHira = (v.hiragana || '').trim();
      return (
        (vKanji && (vKanji === sample || sample.includes(vKanji))) ||
        (vWord && (vWord === sample || sample.includes(vWord))) ||
        (vHira && (vHira === sample || sample.includes(vHira)))
      );
    });

    if (matched) {
      if (matched.partOfSpeech) {
        const p = matched.partOfSpeech.toLowerCase();
        if (p.includes('tính') || p === 'adjective' || p.includes('形')) return 'adjective';
        if (p.includes('danh') || p === 'noun' || p.includes('名')) return 'noun';
        if (p.includes('động') || p === 'verb' || p.includes('動')) return 'verb';
      }
      if (matched.sourceLesson) {
        const s = matched.sourceLesson.toLowerCase();
        if (s.includes('tính') || s.includes('形')) return 'adjective';
        if (s.includes('danh') || s.includes('名')) return 'noun';
        if (s.includes('động') || s.includes('動')) return 'verb';
      }
      if (matched.meaning) {
        const m = matched.meaning.toLowerCase();
        if (m.startsWith('tính từ') || m.startsWith('(adj)') || m.startsWith('adj.')) return 'adjective';
        if (m.startsWith('động từ') || m.startsWith('(v)') || m.startsWith('v.')) return 'verb';
        if (m.startsWith('danh từ') || m.startsWith('(n)') || m.startsWith('n.')) return 'noun';
      }
    }
  }

  // 6. Morphological heuristics for Japanese words

  // 6.1 i-Adjectives: Kanji root ending with 'い' (e.g. 難しい, 新しい, 高い, 広い...)
  if (/^[\u4e00-\u9faf]+(?:し|く|よ|た|か|さ|な|が|ま|ら|わ|づ|ず)?い$/.test(sample)) {
    // Avoid verb stems like 買い, 言い, 違い, 習い, 思い
    if (!/^(?:買い|言い|思い|習い|違い|祝い|払い|笑い|使い|通い|集い|救い|誓い|商い|舞い)$/.test(sample)) {
      return 'adjective';
    }
  }

  // 6.2 Verb endings (conjugations and dictionary forms with Kanji root)
  if (
    /(?:ます|ました|ません|ませんでした|て|で|た|だ|ている|てある|ていく|てくる|られる|させる|れる|ない|なかった|ず|よう|たい|たかった)$/.test(sample) &&
    /[\u4e00-\u9faf]/.test(sample)
  ) {
    return 'verb';
  }

  // Dictionary verbs with kanji root (e.g. 食べる, 行く, 話す, 飲む, 待つ...)
  if (/^[\u4e00-\u9faf]+[ぁ-ん]*[うくぐすつぬぶむる]$/.test(sample)) {
    return 'verb';
  }

  // Suru verbs (e.g. 勉強する, 発表する, 連絡する)
  if (/[\u4e00-\u9faf]+(?:する|します|した|して|しない)$/.test(sample)) {
    return 'verb';
  }

  // Verb stems with okurigana: 読み, 走り, 行き, 話し, 食べ, 待ち
  if (/^[\u4e00-\u9faf]+[いきしちにひみりぎじび]$/.test(sample) && sample.length >= 2) {
    // Check if it's a known pure noun
    if (!/^(?:今日|明日|昨日|毎日|先生|学生|日本|世界|質問|問題|会社|新聞)$/.test(sample)) {
      return 'verb';
    }
  }

  // 6.3 Pure Kanji compounds (length >= 1) without verb/adjective suffixes are predominantly nouns (e.g. 鶏, 先, 卵, 質問, 問題...)
  if (/^[\u4e00-\u9faf]+$/.test(sample)) {
    return 'noun';
  }

  // Katakana words of length >= 2 are predominantly nouns
  if (/^[\u30a0-\u30ff]{2,}$/.test(sample)) {
    return 'noun';
  }

  return 'other';
}

