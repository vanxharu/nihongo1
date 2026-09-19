/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getHanViet } from './japaneseUtils';
import { getKanjiCategory } from './kanjiHelper';

export interface AssociativeColorTheme {
  // Tailwind text classes
  text: string;           // e.g. 'text-rose-600 dark:text-rose-400'
  furigana: string;       // e.g. 'text-rose-500 dark:text-rose-300'
  // Background and borders
  bg: string;             // e.g. 'bg-rose-50 dark:bg-rose-950/40'
  border: string;         // e.g. 'border-rose-200 dark:border-rose-800'
  // Badges & chips
  badgeBg: string;        // e.g. 'bg-rose-100 dark:bg-rose-900/50'
  badgeText: string;      // e.g. 'text-rose-700 dark:text-rose-200'
  badgeBorder: string;    // e.g. 'border-rose-300 dark:border-rose-700'
  glow: string;           // e.g. 'shadow-rose-500/20'
  hex: string;            // e.g. '#f43f5e'
  label: string;          // e.g. 'Lửa / Màu đỏ / Nhiệt huyết'
  emoji: string;          // e.g. '🔥'
}

// Pre-defined rich semantic palette
export const COLOR_THEMES: Record<string, AssociativeColorTheme> = {
  // 1. Red / Fire / Hot / Energy / Blood / Passion
  red: {
    text: 'text-rose-600 dark:text-rose-400',
    furigana: 'text-rose-500 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/80',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/50',
    badgeText: 'text-rose-700 dark:text-rose-200',
    badgeBorder: 'border-rose-300 dark:border-rose-700',
    glow: 'shadow-rose-500/20',
    hex: '#e11d48',
    label: 'Màu đỏ / Lửa / Nhiệt độ',
    emoji: '🔥'
  },
  // 2. Blue / Water / Ocean / Rain / Cool
  water: {
    text: 'text-sky-600 dark:text-sky-400',
    furigana: 'text-sky-500 dark:text-sky-300',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-200 dark:border-sky-800/80',
    badgeBg: 'bg-sky-100 dark:bg-sky-900/50',
    badgeText: 'text-sky-700 dark:text-sky-200',
    badgeBorder: 'border-sky-300 dark:border-sky-700',
    glow: 'shadow-sky-500/20',
    hex: '#0284c7',
    label: 'Nước / Biển / Mát mẻ',
    emoji: '💧'
  },
  // 3. Deep Blue / Blue Color
  blue: {
    text: 'text-blue-600 dark:text-blue-400',
    furigana: 'text-blue-500 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/80',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
    badgeText: 'text-blue-700 dark:text-blue-200',
    badgeBorder: 'border-blue-300 dark:border-blue-700',
    glow: 'shadow-blue-500/20',
    hex: '#2563eb',
    label: 'Xanh lam / Da trời',
    emoji: '🌊'
  },
  // 4. Ice / Snow / Cold / Winter
  ice: {
    text: 'text-cyan-600 dark:text-cyan-300',
    furigana: 'text-cyan-500 dark:text-cyan-200',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    border: 'border-cyan-200 dark:border-cyan-800/80',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-900/50',
    badgeText: 'text-cyan-700 dark:text-cyan-200',
    badgeBorder: 'border-cyan-300 dark:border-cyan-700',
    glow: 'shadow-cyan-500/20',
    hex: '#0891b2',
    label: 'Băng tuyết / Mùa đông',
    emoji: '❄️'
  },
  // 5. Emerald Green / Nature / Tree / Forest / Plants / Spring
  green: {
    text: 'text-emerald-600 dark:text-emerald-400',
    furigana: 'text-emerald-500 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/80',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    badgeText: 'text-emerald-700 dark:text-emerald-200',
    badgeBorder: 'border-emerald-300 dark:border-emerald-700',
    glow: 'shadow-emerald-500/20',
    hex: '#059669',
    label: 'Cây cối / Rừng / Thiên nhiên',
    emoji: '🌿'
  },
  // 6. Yellow / Sun / Gold / Bright / Afternoon
  yellow: {
    text: 'text-amber-600 dark:text-amber-400',
    furigana: 'text-amber-500 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/80',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
    badgeText: 'text-amber-800 dark:text-amber-200',
    badgeBorder: 'border-amber-300 dark:border-amber-700',
    glow: 'shadow-amber-500/20',
    hex: '#d97706',
    label: 'Mặt trời / Ánh sáng / Màu vàng',
    emoji: '☀️'
  },
  // 7. Gold / Money / Finance / Wealth / Price / Treasure
  gold: {
    text: 'text-yellow-600 dark:text-yellow-400',
    furigana: 'text-yellow-600 dark:text-yellow-300',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-300 dark:border-yellow-800/80',
    badgeBg: 'bg-yellow-100 dark:bg-yellow-900/50',
    badgeText: 'text-yellow-800 dark:text-yellow-200',
    badgeBorder: 'border-yellow-300 dark:border-yellow-700',
    glow: 'shadow-yellow-500/20',
    hex: '#ca8a04',
    label: 'Tiền bạc / Vàng / Kinh tế',
    emoji: '💰'
  },
  // 8. Orange / Sunset / Energy / Delicious Food
  orange: {
    text: 'text-orange-600 dark:text-orange-400',
    furigana: 'text-orange-500 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-800/80',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/50',
    badgeText: 'text-orange-700 dark:text-orange-200',
    badgeBorder: 'border-orange-300 dark:border-orange-700',
    glow: 'shadow-orange-500/20',
    hex: '#ea580c',
    label: 'Màu cam / Hoàng hôn / Ẩm thực',
    emoji: '🍊'
  },
  // 9. Pink / Flowers / Blossom / Sweet / Love / Beauty
  pink: {
    text: 'text-pink-600 dark:text-pink-400',
    furigana: 'text-pink-500 dark:text-pink-300',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-pink-200 dark:border-pink-800/80',
    badgeBg: 'bg-pink-100 dark:bg-pink-900/50',
    badgeText: 'text-pink-700 dark:text-pink-200',
    badgeBorder: 'border-pink-300 dark:border-pink-700',
    glow: 'shadow-pink-500/20',
    hex: '#db2777',
    label: 'Hoa / Hoa anh đào / Yêu thương',
    emoji: '🌸'
  },
  // 10. Purple / Night / Mystical / Emotion / Royal
  purple: {
    text: 'text-purple-600 dark:text-purple-400',
    furigana: 'text-purple-500 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/80',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/50',
    badgeText: 'text-purple-700 dark:text-purple-200',
    badgeBorder: 'border-purple-300 dark:border-purple-700',
    glow: 'shadow-purple-500/20',
    hex: '#9333ea',
    label: 'Màu tím / Ban đêm / Huyền bí',
    emoji: '🌙'
  },
  // 11. Indigo / Study / Knowledge / Language / Mind
  indigo: {
    text: 'text-indigo-600 dark:text-indigo-400',
    furigana: 'text-indigo-500 dark:text-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800/80',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/50',
    badgeText: 'text-indigo-700 dark:text-indigo-200',
    badgeBorder: 'border-indigo-300 dark:border-indigo-700',
    glow: 'shadow-indigo-500/20',
    hex: '#4f46e5',
    label: 'Học tập / Tri thức / Ngôn ngữ',
    emoji: '📚'
  },
  // 12. Brown / Earth / Soil / Tea / Wood / Mountain
  brown: {
    text: 'text-stone-700 dark:text-amber-300',
    furigana: 'text-stone-600 dark:text-amber-400',
    bg: 'bg-stone-100 dark:bg-stone-900/50',
    border: 'border-stone-300 dark:border-stone-700',
    badgeBg: 'bg-stone-200 dark:bg-stone-800',
    badgeText: 'text-stone-800 dark:text-stone-200',
    badgeBorder: 'border-stone-300 dark:border-stone-700',
    glow: 'shadow-stone-500/20',
    hex: '#78716c',
    label: 'Đất / Đá / Núi / Trà',
    emoji: '⛰️'
  },
  // 13. Black / Shadow / Darkness
  black: {
    text: 'text-zinc-800 dark:text-zinc-200',
    furigana: 'text-zinc-600 dark:text-zinc-400',
    bg: 'bg-zinc-100 dark:bg-zinc-900/60',
    border: 'border-zinc-300 dark:border-zinc-700',
    badgeBg: 'bg-zinc-200 dark:bg-zinc-800',
    badgeText: 'text-zinc-800 dark:text-zinc-200',
    badgeBorder: 'border-zinc-300 dark:border-zinc-700',
    glow: 'shadow-zinc-500/20',
    hex: '#27272a',
    label: 'Màu đen / Bóng tối',
    emoji: '⬛'
  },
  // 14. White / Silver / Purity / Cloud
  white: {
    text: 'text-slate-600 dark:text-slate-200',
    furigana: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-900/50',
    border: 'border-slate-300 dark:border-slate-700',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-200',
    badgeBorder: 'border-slate-300 dark:border-slate-700',
    glow: 'shadow-slate-500/20',
    hex: '#64748b',
    label: 'Màu trắng / Bạc / Tinh khôi',
    emoji: '⚪'
  },
  // 15. Default Neutral / Slate
  neutral: {
    text: 'text-slate-900 dark:text-slate-100',
    furigana: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-900/40',
    border: 'border-slate-200 dark:border-slate-800',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200 dark:border-slate-700',
    glow: 'shadow-slate-500/10',
    hex: '#334155',
    label: 'Tổng quát',
    emoji: '💮'
  }
};

// 1. Direct Kanji Character to Theme mapping
const KANJI_ASSOCIATIVE_MAP: Record<string, string> = {
  // Red / Fire / Heat / Blood / Danger / Summer
  '赤': 'red', '紅': 'red', '朱': 'red', '火': 'red', '炎': 'red', '熱': 'red', '暑': 'red', '焼': 'red',
  '燃': 'red', '血': 'red', '怒': 'red', '痛': 'red', '夏': 'red', '陽': 'red', '暖': 'red', '危': 'red',
  '険': 'red', '激': 'red', '烈': 'red', '焦': 'red', '照': 'red', '夕': 'orange',

  // Water / Rain / Ocean / River / Pond / Swim / Clean / Cool
  '水': 'water', '海': 'water', '川': 'water', '河': 'water', '池': 'water', '湖': 'water', '雨': 'water',
  '波': 'water', '港': 'water', '洗': 'water', '泳': 'water', '泣': 'water', '涙': 'water', '涼': 'water',
  '清': 'water', '流': 'water', '深': 'water', '浅': 'water', '洋': 'water', '湯': 'water', '湾': 'water',
  '浮': 'water', '沈': 'water', '浴': 'water', '酒': 'purple', '飲': 'water', '汁': 'water', '潮': 'water',

  // Ice / Cold / Snow / Winter / Freeze
  '氷': 'ice', '雪': 'ice', '寒': 'ice', '冬': 'ice', '冷': 'ice', '凍': 'ice', '霜': 'ice',

  // Blue / Sky
  '青': 'blue', '碧': 'blue', '空': 'blue', '天': 'blue', '雲': 'blue', '風': 'blue', '気': 'blue',

  // Green / Tree / Wood / Forest / Leaf / Plant / Flower / Grass / Nature / Spring
  '緑': 'green', '木': 'green', '林': 'green', '森': 'green', '草': 'green', '葉': 'green', '枝': 'green',
  '根': 'green', '植': 'green', '春': 'green', '菜': 'green', '生': 'green', '松': 'green', '竹': 'green',
  '茶': 'brown', '農': 'green', '野': 'green', '原': 'green', '苗': 'green', '芽': 'green', '花': 'pink',
  '桜': 'pink', '梅': 'pink',

  // Yellow / Sun / Bright / Light / Morning / Noon
  '黄': 'yellow', '日': 'yellow', '明': 'yellow', '光': 'yellow', '輝': 'yellow', '朝': 'yellow', '昼': 'yellow',
  '星': 'yellow', '灯': 'yellow', '電': 'yellow', '晴': 'yellow',

  // Gold / Money / Wealth / Finance / Buy / Sell / Price
  '金': 'gold', '円': 'gold', '銀': 'white', '銭': 'gold', '財': 'gold', '富': 'gold', '宝': 'gold',
  '買': 'gold', '売': 'gold', '価': 'gold', '費': 'gold', '税': 'gold', '賃': 'gold', '貯': 'gold',
  '貸': 'gold', '借': 'gold', '貨': 'gold', '販': 'gold', '益': 'gold', '収': 'gold', '算': 'gold',

  // Pink / Love / Heart / Romantic / Sweet / Girl
  '愛': 'pink', '恋': 'pink', '心': 'pink', '好': 'pink', '嬉': 'pink', '喜': 'pink', '笑': 'pink',
  '女': 'pink', '娘': 'pink', '婦': 'pink', '姉': 'pink', '妹': 'pink', '母': 'pink', '美': 'pink',
  '甘': 'pink', '幸': 'pink', '福': 'pink',

  // Purple / Night / Evening / Dream / Mysterious / Spirit
  '紫': 'purple', '晩': 'purple', '夢': 'purple', '神': 'purple', '魂': 'purple',
  '魔': 'purple', '幻': 'purple', '幽': 'purple', '月': 'purple',

  // Earth / Soil / Mountain / Rock / Stone / Field / Brown
  '土': 'brown', '地': 'brown', '山': 'brown', '石': 'brown', '岩': 'brown', '砂': 'brown', '田': 'brown',
  '畑': 'brown', '坂': 'brown', '道': 'brown', '橋': 'brown', '炭': 'brown', '岸': 'brown',

  // Black / Dark / Shadow / Evil
  '黒': 'black', '暗': 'black', '影': 'black', '墨': 'black', '悪': 'black', '死': 'black', '亡': 'black',
  '夜': 'black', '怖': 'black', '鬼': 'black',

  // White / Pure / Silver / Cloud / Snow
  '白': 'white', '素': 'white', '潔': 'white',

  // Indigo / Books / Education / Study / Language / Communication
  '学': 'indigo', '教': 'indigo', '校': 'indigo', '本': 'indigo', '書': 'indigo', '読': 'indigo', '語': 'indigo',
  '話': 'indigo', '言': 'indigo', '文': 'indigo', '字': 'indigo', '知': 'indigo', '習': 'indigo', '勉': 'indigo',
  '強': 'indigo', '研': 'indigo', '究': 'indigo', '問': 'indigo', '題': 'indigo', '試': 'indigo', '験': 'indigo',
  '辞': 'indigo', '典': 'indigo', '筆': 'indigo', '紙': 'indigo', '記': 'indigo', '論': 'indigo', '説': 'indigo'
};

// 2. Meaning & Hiragana keyword associations
const KEYWORD_ASSOCIATION_RULES: { keywords: string[]; theme: string }[] = [
  // Red
  { keywords: ['đỏ', 'hồng', 'lửa', 'nóng', 'máu', 'cháy', 'mùa hè', 'akai', 'honoo', 'hi', 'natsu', 'atsui', 'chi', 'yakedo'], theme: 'red' },
  // Water
  { keywords: ['nước', 'biển', 'sông', 'hồ', 'mưa', 'bơi', 'mát', 'uống', 'mizu', 'umi', 'kawa', 'ike', 'ame', 'oyogu', 'nomu', 'shiru'], theme: 'water' },
  // Ice
  { keywords: ['băng', 'tuyết', 'lạnh', 'buốt', 'mùa đông', 'yuki', 'koori', 'samui', 'tsumetai', 'fuyu'], theme: 'ice' },
  // Blue
  { keywords: ['xanh da trời', 'xanh dương', 'bầu trời', 'gió', 'aoi', 'sora', 'kaze', 'tenki'], theme: 'blue' },
  // Green
  { keywords: ['xanh lá', 'xanh lục', 'cây', 'rừng', 'lá', 'cỏ', 'mùa xuân', 'rau', 'midori', 'ki', 'mori', 'hayashi', 'kusa', 'haru', 'yasai'], theme: 'green' },
  // Pink
  { keywords: ['hoa', 'hoa anh đào', 'yêu', 'thích', 'trái tim', 'nụ cười', 'ngọt', 'hana', 'sakura', 'ai', 'koi', 'kokoro', 'suki', 'egao', 'amai'], theme: 'pink' },
  // Yellow / Sun
  { keywords: ['vàng', 'mặt trời', 'sáng', 'buổi sáng', 'buổi trưa', 'kiiro', 'taiyou', 'hikari', 'asa', 'hiru'], theme: 'yellow' },
  // Gold / Money
  { keywords: ['tiền', 'yên', 'vàng', 'giàu', 'mua', 'bán', 'giá', 'chi phí', 'kane', 'okane', 'en', 'kin', 'kai', 'uri', 'nedan'], theme: 'gold' },
  // Orange
  { keywords: ['cam', 'màu cam', 'hoàng hôn', 'ấm', 'daidai', 'yuugata', 'atatakai'], theme: 'orange' },
  // Purple
  { keywords: ['tím', 'màu tím', 'đêm', 'buổi tối', 'huyền bí', 'murasaki', 'yoru', 'ban'], theme: 'purple' },
  // Black
  { keywords: ['đen', 'tối', 'bóng', 'kuroi', 'kurai', 'kage'], theme: 'black' },
  // White
  { keywords: ['trắng', 'bạc', 'tinh khôi', 'shiroi', 'gin'], theme: 'white' },
  // Brown
  { keywords: ['đất', 'núi', 'đá', 'nâu', 'trà', 'tsuchi', 'yama', 'ishi', 'chairo', 'ocha'], theme: 'brown' },
  // Indigo / Study
  { keywords: ['học', 'sách', 'đọc', 'viết', 'nói', 'tiếng', 'ngữ', 'trường', 'bài thi', 'benkyou', 'hon', 'yomu', 'kaku', 'hanasu', 'nihongo', 'gakkou'], theme: 'indigo' }
];

/**
 * Gets associative theme color for a single Kanji character based on its nature and Sino-Vietnamese roots
 */
export function getKanjiAssociativeColor(kanjiChar: string): AssociativeColorTheme {
  if (!kanjiChar || typeof kanjiChar !== 'string') return COLOR_THEMES.neutral;

  try {
    // 1. Direct lookup from KANJI_ASSOCIATIVE_MAP
    const themeKey = KANJI_ASSOCIATIVE_MAP[kanjiChar];
    if (themeKey && COLOR_THEMES[themeKey]) {
      return COLOR_THEMES[themeKey];
    }

    // 2. Category lookup from kanjiHelper
    const cat = getKanjiCategory(kanjiChar);
    if (cat && cat.colorName && COLOR_THEMES[cat.colorName]) {
      return COLOR_THEMES[cat.colorName];
    }

    // 3. Sino-Vietnamese / Han Viet heuristic lookup
    const hv = getHanViet(kanjiChar);
    if (hv) {
      if (/HỎA|NHIỆT|THIÊU|ĐỎ|XÍ|VIÊN|HẠ|TIÊU|XUY|DOANH|CẤP|BẠO|CẢNH|THÁI|VIỆN|BẤT|NỘ|THẦN|CANH|THÁI|NANG|DUNG|TẠO|TỘC|CAO|TĂNG|NỔI|PHẤN|THẮNG|PHÙ|HOẠT/i.test(hv)) return COLOR_THEMES.red;
      if (/THỦY|HẢI|GIANG|HÀ|TRẠCH|TẮC|TẨY|LỆ|DỊCH|HỒ|SÔNG|LƯU|THANH|LƯƠNG|TRẢO|HÃN|TIỂU|ẨM|NƯỚC|TRIỀU|TẬP|BÁCH|TUYẾN|KHÍCH|TÍCH|TĂM|TRUYỀN/i.test(hv)) return COLOR_THEMES.water;
      if (/BĂNG|TUYẾT|HÀN|ĐÔNG|LÃNH|ĐỐNG|SƯƠNG|NGƯNG/i.test(hv)) return COLOR_THEMES.ice;
      if (/MỘC|THẢO|LÂM|SÂM|DIỆP|THÁI|XUÂN|THỰC|CHỦNG|CĂN|ĐỒNG|NHƯỢC|MI苗|NÔNG|DÃ|NGUYÊN|THUẬT|CÂY|RỪNG|HOA|TRỒNG|LÚA|MIỆN|CHÍ|CỤC|KHÔ|LIỄU|HOÀNG|TÙNG|CHÍ|CƠ/i.test(hv)) return COLOR_THEMES.green;
      if (/NHẬT|QUANG|MINH|HOÀNG|SÁNG|TINH|ĐIỆN|THỜI|TRIỀU|TRƯA|DUYỆT|HIỂN|XƯƠNG|KIM|HỐI|TINH|BẢN|TÂN|NGUYÊN|SƠ|ĐẦU|PHONG|PHÚ/i.test(hv)) return COLOR_THEMES.yellow;
      if (/KIM|TIỀN|TÀI|PHÚ|BẢO|MẠI|GIÁ|PHÍ|THUẾ|THẢO|TOÁN|ỨC|VẠN|THIÊN|BÁCH|THƯƠNG|BÍCH|NGÂN|TẢI|TÍCH|TRỢ|KEO|CẤU|MẠI|ĐA|THỊNH/i.test(hv)) return COLOR_THEMES.gold;
      if (/HỘI|XÃ|NGHIỆP|CHỨC|ĐỘNG|SỰ|VỤ|CỤC|VIỆN|QUÁN|SỞ|TIỆM|DOANH|XÍ|CẤU|TỔ|ĐOÀN|DỊCH|BỘ|KHÓA|TRÚC|TRƯỜNG|QUAN|HỆ|THIẾT|BỊ|XA|ĐIỆN|THUYỀN|PHI|CƠ|TẨU|HÀNG|CHUYỂN|VẬN|LỘ|THÔNG|HÀNH|LAI|VÃNG|KIẾN|VẬT|CÔNG|SĨ|NHẬP|XUẤT|TIẾN|THOÁI|TỤC|LẬP|CHỈ|KHỞI|PHÓ|QUẢN|CHẾ|TẠO|ĐỒ|CHÍNH|THỦ|ÁN/i.test(hv)) return COLOR_THEMES.orange;
      if (/ÁI|LUYẾN|TÂM|NỮ|MẪU|TỶ|MUỘI|ANH|ĐÀO|HỶ|TIẾU|PHÚC|HẠNH|NHÂN|THIỆN|ƯU|NỤ|MĨ|MỸ|TÌNH|CẢM|SẮC|ĐỨC|CÔ|TỪ|THƯƠNG|HOÀ|NHẪN|ÁI|THÍCH/i.test(hv)) return COLOR_THEMES.pink;
      if (/TÍM|DẠ|VÃN|TỊCH|AM|MỘNG|THẦN|HỒN|MA|HUYỄN|U|NGUYỆT|T TửU|TỰ|TẾ|KỲ|THỀ|LINH|TÔN|TẬP|HỘI|THỜI|NIÊN|CHU/i.test(hv)) return COLOR_THEMES.purple;
      if (/HỌC|GIÁO|HIỆU|VĂN|TRI|THƯ|TỪ|ĐIỂN|NGỮ|THOẠI|ĐỘC|TẬP|CỨU|NGHIÊN|VẤN|ĐỀ|THÍ|NGHIỆM|BÚT|KÝ|LUẬN|THUYẾT|TỰ|NGÔN|KHOA|LÝ|SÁCH|VIẾT|CHƯƠNG|NGHI|LỄ|KHẢO|KÍNH|QUY|TẮC|ĐIỂN/i.test(hv)) return COLOR_THEMES.indigo;
      if (/THỔ|ĐỊA|SƠN|THẠCH|NHAM|SA|ĐIỀN|BÀO|ĐẠO|TRÀ|CẦU|LỤC|VỰC|THÀNH|PHỤ|CỐ|NÚI|ĐẤT|ĐÁ|TRÂN|GIA|TẰNG|TRÚC|CƠ|SỞ|PHÒNG|ỐC|ĐÌNH/i.test(hv)) return COLOR_THEMES.brown;
      if (/THANH|BÍCH|KHÔNG|THIÊN|VÂN|PHONG|KHÍ|TRỤ|VŨ|QUỐC|HUYỆN|THỊ|ĐINH|THÔN|CHÂU|ĐẢO|KHU|TRUYỀN|CỰ|TOÀN|PHƯƠNG|VỰC|GIỚI|THẾ|BIÊN|NGOẠI|NỘI|ĐẠI/i.test(hv)) return COLOR_THEMES.blue;
      if (/NHÂN|GIẢ|VIÊN|DÂN|HỮU|THÂN|TƯ|NAM|HUYNH|ĐỆ|PHU|THÊ|TỘC|ĐẠT|LANG|CHỦ|KỶ|THA|THỂ|NHAN|ĐẦU|THỦ|TÚC|MỤC|NHĨ|KHẨU|CỐT|MAO|LÃO|TỔ|TRỌNG|KIỆN|KHANG|Y|MẠNG|MỆNH|SINH|TÍNH|THỌ|TIÊN|BỐI|ĐỐI|NINH|BẠN/i.test(hv)) return COLOR_THEMES.teal;
    }

    // 4. Stable, colorful fallback based on character code
    const code = kanjiChar.charCodeAt(0) || 0;
    const fallbacks = [
      COLOR_THEMES.indigo,
      COLOR_THEMES.teal,
      COLOR_THEMES.orange,
      COLOR_THEMES.blue,
      COLOR_THEMES.green,
      COLOR_THEMES.brown,
      COLOR_THEMES.purple,
      COLOR_THEMES.gold
    ];
    return fallbacks[Math.abs(code) % fallbacks.length] || COLOR_THEMES.neutral;
  } catch {
    return COLOR_THEMES.neutral;
  }
}

/**
 * Resolves associative theme for an entire word or vocabulary item
 */
export function getWordAssociativeColor(
  word: string, 
  meaning: string = '', 
  hiragana: string = ''
): AssociativeColorTheme {
  try {
    if (!word && !meaning && !hiragana) return COLOR_THEMES.neutral;

    // 1. Check primary Kanji characters in word
    const kanjiChars = (word || '').split('').filter(c => /[\u4e00-\u9faf]/.test(c));
    for (const c of kanjiChars) {
      const directThemeKey = KANJI_ASSOCIATIVE_MAP[c];
      if (directThemeKey && directThemeKey !== 'neutral' && COLOR_THEMES[directThemeKey]) {
        return COLOR_THEMES[directThemeKey];
      }
    }

    // 2. Check meaning & hiragana keywords
    const combinedText = `${meaning} ${hiragana} ${word}`.toLowerCase();
    for (const rule of KEYWORD_ASSOCIATION_RULES) {
      for (const kw of rule.keywords) {
        if (combinedText.includes(kw.toLowerCase())) {
          if (COLOR_THEMES[rule.theme]) {
            return COLOR_THEMES[rule.theme];
          }
        }
      }
    }

    // 3. If there are kanji characters, return their default theme or neutral
    if (kanjiChars.length > 0) {
      const res = getKanjiAssociativeColor(kanjiChars[0]);
      if (res) return res;
    }

    return COLOR_THEMES.neutral;
  } catch {
    return COLOR_THEMES.neutral;
  }
}
