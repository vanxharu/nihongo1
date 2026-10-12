/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VocabularyItem, GrammarItem, KanjiItem, DailyExam, LeaderboardUser } from './types';
import { TANGO_N4_VOCABULARY } from './data/tangoN4Vocab.js';
import { TANGO_N5_VOCABULARY } from './data/tangoN5Vocab.js';
import { TANGO_N3_VOCABULARY } from './data/tangoN3Vocab.js';

export { TANGO_N4_VOCABULARY, TANGO_N5_VOCABULARY, TANGO_N3_VOCABULARY };

export const VOCABULARY_DATA: VocabularyItem[] = [
  ...TANGO_N4_VOCABULARY,
  ...TANGO_N5_VOCABULARY,
  ...TANGO_N3_VOCABULARY
];

export const GRAMMAR_DATA: GrammarItem[] = [];

export const KANJI_DATA: KanjiItem[] = [
  {
    id: 'k_n5_1',
    mnemonic: 'Hình dáng giống như mặt trời tỏa sáng, ở giữa có một gạch ngang chia đôi ngày và đêm.',
    character: '日',
    meaning: 'Ngày / Mặt trời',
    onyomi: 'ニチ, ジツ',
    kunyomi: 'ひ, -び, -か',
    strokesCount: 4,
    level: 'N5',
    exampleWords: [
      { word: '日本', hiragana: 'にほん', meaning: 'Nhật Bản' },
      { word: '毎日', hiragana: 'まいにち', meaning: 'Mỗi ngày' },
      { word: '日曜日', hiragana: 'にちようび', meaning: 'Chủ nhật' }
    ],
    exampleSentence: '日本へ旅行に行きたいです。',
    exampleTranslation: 'Tôi muốn đi du lịch Nhật Bản.'
  },
  {
    id: 'k_n5_2',
    mnemonic: 'Hình vầng trăng khuyết nghiêng nghiêng, bên trong có hai gạch giống hai đám mây che bóng nguyệt.',
    character: '月',
    meaning: 'Tháng / Mặt trăng',
    onyomi: 'ゲツ, ガツ',
    kunyomi: 'つき',
    strokesCount: 4,
    level: 'N5',
    exampleWords: [
      { word: '今月', hiragana: 'こんげつ', meaning: 'Tháng này' },
      { word: '一月', hiragana: 'いちがつ', meaning: 'Tháng một' },
      { word: '月曜日', hiragana: 'げつようび', meaning: 'Thứ hai' }
    ],
    exampleSentence: '今月は日本語のテストがあります。',
    exampleTranslation: 'Tháng này có bài kiểm tra tiếng Nhật.'
  },
  {
    id: 'k_n5_3',
    mnemonic: 'Chữ Mộc (木) vẽ lại hình một cái cây thẳng đứng với cành xòe ra hai bên và rễ cắm sâu dưới đất.',
    character: '木',
    meaning: 'Cây',
    onyomi: 'ボク, モク',
    kunyomi: 'き',
    strokesCount: 4,
    level: 'N5',
    exampleWords: [
      { word: '木曜日', hiragana: 'もくようび', meaning: 'Thứ năm' },
      { word: '大木', hiragana: 'たいぼく', meaning: 'Cây cổ thụ' },
      { word: '木立', hiragana: 'こだち', meaning: 'Rặng cây' }
    ],
    exampleSentence: '庭に大きな木があります。',
    exampleTranslation: 'Có một cái cây lớn ở trong sân vườn.'
  },
  {
    id: 'k_n4_1',
    mnemonic: 'Bộ Nhật (mặt trời) nằm trên bộ Thủ (tai) và bộ Hựu (lại): Mỗi ngày, đôi tai lại được lắng nghe điều tuyệt vời nhất.',
    character: '最',
    meaning: 'Nhất',
    onyomi: 'サイ',
    kunyomi: 'もっと.も',
    strokesCount: 12,
    level: 'N4',
    exampleWords: [
      { word: '最近', hiragana: 'さいきん', meaning: 'Gần đây' },
      { word: '最初', hiragana: 'さいしょ', meaning: 'Đầu tiên' },
      { word: '最高', hiragana: 'さいこう', meaning: 'Tuyệt vời nhất' }
    ],
    exampleSentence: '最近はとても暑いですね。',
    exampleTranslation: 'Gần đây trời nóng quá nhỉ.'
  },
  {
    id: 'k_n4_2',
    mnemonic: 'Bước chân đi bộ (quai sước 辶) mang theo cây rìu (bộ Cân 斤) đốn củi ngay gần nhà.',
    character: '近',
    meaning: 'Gần',
    onyomi: 'キン',
    kunyomi: 'ちか.い',
    strokesCount: 7,
    level: 'N4',
    exampleWords: [
      { word: '近所', hiragana: 'きんじょ', meaning: 'Hàng xóm, vùng lân cận' },
      { word: '近い', hiragana: 'ちかい', meaning: 'Gần' },
      { word: '近道', hiragana: 'ちかみち', meaning: 'Đường tắt' }
    ],
    exampleSentence: '私の家は駅からとても近いです。',
    exampleTranslation: 'Nhà của tôi ở rất gần nhà ga.'
  },
  {
    id: 'k_n4_3',
    mnemonic: 'Một người (亻) có ý (意) chí lớn tạo dựng khối tài sản hàng trăm triệu (億).',
    character: '億',
    meaning: 'Ức (100 triệu)',
    onyomi: 'オク',
    kunyomi: '—',
    strokesCount: 15,
    level: 'N4',
    exampleWords: [
      { word: '一億', hiragana: 'いちおく', meaning: '100 triệu (một ức)' },
      { word: '億万長者', hiragana: 'おくまんちょうじゃ', meaning: 'Tỷ phú, triệu phú' },
      { word: '何億円', hiragana: 'なんおくえん', meaning: 'Hàng trăm triệu Yên' }
    ],
    exampleSentence: '日本の人口は約一億二千万人です。',
    exampleTranslation: 'Dân số Nhật Bản khoảng 120 triệu người.'
  },
  {
    id: 'k_n3_1',
    mnemonic: 'Nước (bộ Thủy 氵) hòa trộn cùng bầy côn trùng (bộ Côn 昆) dưới mặt trời tạo nên cảnh hỗn loạn.',
    character: '混',
    meaning: 'Hỗn loạn / Trộn',
    onyomi: 'コン',
    kunyomi: 'ま.ぜる, ま.ざる',
    strokesCount: 11,
    level: 'N3',
    exampleWords: [
      { word: '混雑', hiragana: 'こんざつ', meaning: 'Đông đúc, tắc nghẽn' },
      { word: '混乱', hiragana: 'こんらん', meaning: 'Hỗn loạn' },
      { word: '混ぜる', hiragana: 'まぜる', meaning: 'Trộn lẫn' }
    ],
    exampleSentence: 'この時間は道路がとても混雑します。',
    exampleTranslation: 'Thời gian này đường xá cực kỳ đông đúc (tắc nghẽn).'
  }
];

export const DAILY_EXAMS: DailyExam[] = [
  {
    id: 'exam_n5_01',
    title: 'Đề thi thử N5 - Luyện tập cơ bản',
    level: 'N5',
    durationMinutes: 10,
    questions: [
      {
        id: 'eq_n5_1',
        question: '私の【教室】は３階にあります。',
        hint: 'Phòng học của tôi nằm ở tầng 3.',
        options: ['きょうしつ', 'しょくどう', 'じむしょ', 'へや'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '教室 phát âm là きょうしつ (kyoushitsu) nghĩa là phòng học.'
      },
      {
        id: 'eq_n5_2',
        question: 'あそこに大きな犬____いますね。',
        hint: 'Có một con chó lớn ở đằng kia nhỉ.',
        options: ['を', 'が', 'に', 'で'],
        correctIndex: 1,
        section: 'bunpou',
        explanation: 'Trợ từ が đi với động từ chỉ sự tồn tại います (có động vật).'
      },
      {
        id: 'eq_n5_3',
        question: '木村さんは英語____上手です。',
        hint: 'Anh Kimura rất giỏi tiếng Anh.',
        options: ['を', 'が', 'は', 'で'],
        correctIndex: 1,
        section: 'bunpou',
        explanation: 'Tính từ chỉ khả năng 上手 (giỏi) đi kèm với trợ từ が.'
      }
    ]
  }
];

export const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: 'u_1', name: 'Minh Tuấn N2', avatar: '🦊', level: 'N2', xp: 5820, streak: 45 },
  { id: 'u_2', name: 'Sakura Chan', avatar: '🌸', level: 'N3', xp: 4210, streak: 21 },
  { id: 'u_3', name: 'Anh Thư JLPT', avatar: '🐱', level: 'N4', xp: 3950, streak: 12 },
  { id: 'u_4', name: 'Ryu Tanaka', avatar: '🐼', level: 'N1', xp: 3880, streak: 55 },
  { id: 'u_5', name: 'Thanh Bình N5', avatar: '🐸', level: 'N5', xp: 2150, streak: 8 },
  { id: 'u_6', name: 'Kaito Kun', avatar: '🐨', level: 'N3', xp: 1980, streak: 3 },
  { id: 'u_7', name: 'Hồng Ngọc', avatar: '🦄', level: 'N4', xp: 1450, streak: 5 }
];
