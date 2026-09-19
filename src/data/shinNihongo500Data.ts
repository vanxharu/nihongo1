import { StudyBook } from '../types';
import { SHIN_500_WEEK_1 } from './shinNihongo500/week1';
import { SHIN_500_WEEK_2 } from './shinNihongo500/week2';
import { SHIN_500_WEEK_3 } from './shinNihongo500/week3';
import { SHIN_500_WEEK_4 } from './shinNihongo500/week4';

export const SHIN_NIHONGO_500_N4_N5: StudyBook = {
  id: 'book_shin_nihongo_500_n4_n5',
  title: 'Shin Nihongo 500 Mon N4-N5 (新にほんご500問)',
  japaneseTitle: '「日本語能力試験」N4・N5 合格力養成！新にほんご500問［文字・語い・文法まとめドリル］',
  author: '松本紀子・佐々木仁子 (Noriko Matsumoto, Hitoko Sasaki)',
  publisher: 'アスク出版 (ASK Publishing)',
  level: 'N4',
  coverBadge: '4 Tuần - 500 Câu Trọng Điểm: Chữ Hán, Từ Vựng, Ngữ Pháp',
  description: 'Bộ giáo trình luyện thi cấp tốc N4-N5 danh tiếng của tác giả Matsumoto Noriko & Sasaki Hitoko (ASK Publishing). Thiết kế theo chu trình 4 tuần học, mỗi tuần 7 ngày bao phủ toàn diện 3 kỹ năng: 文字 (Chữ Hán), 語い (Từ vựng), 文法 (Ngữ pháp) với đáp án và giải thích song ngữ Nhật - Việt chuẩn xác 100% từ giáo trình.',
  themeColor: 'amber',
  gradient: 'from-amber-600 via-orange-600 to-red-600',
  category: 'Mock Test',
  estimatedHours: 18,
  learnersCount: '2,650',
  totalQuestions: 500,
  units: [
    ...SHIN_500_WEEK_1,
    ...SHIN_500_WEEK_2,
    ...SHIN_500_WEEK_3,
    ...SHIN_500_WEEK_4
  ]
};
