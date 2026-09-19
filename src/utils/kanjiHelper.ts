/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KANJI_TO_HAN_VIET } from './japaneseUtils';
import { KANJI_DICTIONARY } from '../data/kanjiDictionary';

export interface KanjiCategoryInfo {
  name: string;
  emoji: string;
  colorName: string; // "blue" | "emerald" | "orange" | "amber" | "rose" | "purple" | "indigo" | "cyan" | "slate"
  bg: string;
  text: string;
  border: string;
  lightBg: string;
  lightText: string;
  lightBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  kanjis: Set<string>;
}

export const KANJI_CATEGORIES: KanjiCategoryInfo[] = [
  // 1. Red / Fire / Heat / Summer / Blood
  {
    name: "Màu đỏ / Lửa / Nhiệt độ",
    emoji: "🔥",
    colorName: "rose",
    bg: "bg-rose-500",
    text: "text-white",
    border: "border-rose-600",
    lightBg: "bg-rose-50/90 dark:bg-rose-950/40",
    lightText: "text-rose-600 dark:text-rose-400",
    lightBorder: "border-rose-200 dark:border-rose-800",
    badgeBg: "bg-rose-100 dark:bg-rose-900/50",
    badgeText: "text-rose-700 dark:text-rose-200",
    badgeBorder: "border-rose-300 dark:border-rose-700",
    kanjis: new Set(["赤", "紅", "朱", "火", "炎", "熱", "暑", "焼", "燃", "血", "怒", "痛", "夏", "陽", "暖", "焦", "照", "危", "激", "烈"])
  },
  // 2. Water / Ocean / River / Rain / Cool
  {
    name: "Nước / Biển / Sông hồ",
    emoji: "💧",
    colorName: "sky",
    bg: "bg-sky-500",
    text: "text-white",
    border: "border-sky-600",
    lightBg: "bg-sky-50/90 dark:bg-sky-950/40",
    lightText: "text-sky-600 dark:text-sky-400",
    lightBorder: "border-sky-200 dark:border-sky-800",
    badgeBg: "bg-sky-100 dark:bg-sky-900/50",
    badgeText: "text-sky-700 dark:text-sky-200",
    badgeBorder: "border-sky-300 dark:border-sky-700",
    kanjis: new Set(["水", "海", "川", "河", "池", "湖", "雨", "波", "港", "洗", "泳", "泣", "涙", "涼", "清", "流", "深", "浅", "洋", "湯", "湾", "汁", "潮", "浮", "沈", "浴", "飲"])
  },
  // 3. Ice / Snow / Cold / Winter
  {
    name: "Băng tuyết / Lạnh / Mùa đông",
    emoji: "❄️",
    colorName: "cyan",
    bg: "bg-cyan-500",
    text: "text-white",
    border: "border-cyan-600",
    lightBg: "bg-cyan-50/90 dark:bg-cyan-950/40",
    lightText: "text-cyan-600 dark:text-cyan-400",
    lightBorder: "border-cyan-200 dark:border-cyan-800",
    badgeBg: "bg-cyan-100 dark:bg-cyan-900/50",
    badgeText: "text-cyan-700 dark:text-cyan-200",
    badgeBorder: "border-cyan-300 dark:border-cyan-700",
    kanjis: new Set(["氷", "雪", "寒", "冬", "冷", "凍", "霜"])
  },
  // 4. Nature / Tree / Forest / Plant / Leaf
  {
    name: "Cây cối / Rừng / Thiên nhiên",
    emoji: "🌿",
    colorName: "emerald",
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-700",
    lightBg: "bg-emerald-50/90 dark:bg-emerald-950/40",
    lightText: "text-emerald-600 dark:text-emerald-400",
    lightBorder: "border-emerald-200 dark:border-emerald-800",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    badgeText: "text-emerald-700 dark:text-emerald-200",
    badgeBorder: "border-emerald-300 dark:border-emerald-700",
    kanjis: new Set(["木", "林", "森", "草", "葉", "枝", "根", "植", "春", "菜", "苗", "芽", "松", "竹", "農", "野", "原"])
  },
  // 5. Flower / Love / Heart / Beauty
  {
    name: "Hoa / Tình cảm / Yêu thương",
    emoji: "🌸",
    colorName: "pink",
    bg: "bg-pink-500",
    text: "text-white",
    border: "border-pink-600",
    lightBg: "bg-pink-50/90 dark:bg-pink-950/40",
    lightText: "text-pink-600 dark:text-pink-400",
    lightBorder: "border-pink-200 dark:border-pink-800",
    badgeBg: "bg-pink-100 dark:bg-pink-900/50",
    badgeText: "text-pink-700 dark:text-pink-200",
    badgeBorder: "border-pink-300 dark:border-pink-700",
    kanjis: new Set(["花", "桜", "梅", "愛", "恋", "心", "好", "嬉", "喜", "笑", "咲", "幸", "福", "甘", "美"])
  },
  // 6. Sun / Light / Bright / Yellow
  {
    name: "Mặt trời / Ánh sáng / Màu vàng",
    emoji: "☀️",
    colorName: "amber",
    bg: "bg-amber-500",
    text: "text-slate-900",
    border: "border-amber-600",
    lightBg: "bg-amber-50/90 dark:bg-amber-950/40",
    lightText: "text-amber-600 dark:text-amber-400",
    lightBorder: "border-amber-200 dark:border-amber-800",
    badgeBg: "bg-amber-100 dark:bg-amber-900/50",
    badgeText: "text-amber-800 dark:text-amber-200",
    badgeBorder: "border-amber-300 dark:border-amber-700",
    kanjis: new Set(["黄", "日", "明", "光", "輝", "朝", "昼", "晴", "星", "曜", "灯", "電"])
  },
  // 7. Money / Gold / Finance / Economy
  {
    name: "Tiền bạc / Vàng / Kinh tế",
    emoji: "💰",
    colorName: "yellow",
    bg: "bg-yellow-500",
    text: "text-slate-900",
    border: "border-yellow-600",
    lightBg: "bg-yellow-50/90 dark:bg-yellow-950/40",
    lightText: "text-yellow-700 dark:text-yellow-400",
    lightBorder: "border-yellow-300 dark:border-yellow-700",
    badgeBg: "bg-yellow-100 dark:bg-yellow-900/50",
    badgeText: "text-yellow-800 dark:text-yellow-200",
    badgeBorder: "border-yellow-300 dark:border-yellow-700",
    kanjis: new Set(["金", "円", "銭", "財", "富", "宝", "買", "売", "価", "費", "税", "賃", "貯", "貸", "借", "貨", "販", "益", "収", "算", "億", "万", "千", "百"])
  },
  // 8. Earth / Mountain / Stone / Soil / Tea
  {
    name: "Đất / Núi đá / Trà",
    emoji: "⛰️",
    colorName: "stone",
    bg: "bg-stone-600",
    text: "text-white",
    border: "border-stone-700",
    lightBg: "bg-stone-100/90 dark:bg-stone-900/50",
    lightText: "text-stone-700 dark:text-stone-300",
    lightBorder: "border-stone-300 dark:border-stone-700",
    badgeBg: "bg-stone-200 dark:bg-stone-800",
    badgeText: "text-stone-800 dark:text-stone-200",
    badgeBorder: "border-stone-300 dark:border-stone-700",
    kanjis: new Set(["土", "地", "山", "石", "岩", "砂", "田", "畑", "坂", "道", "岸", "炭", "茶", "橋"])
  },
  // 9. Blue / Sky / Space / Air
  {
    name: "Xanh lam / Bầu trời / Quốc gia",
    emoji: "🌊",
    colorName: "blue",
    bg: "bg-blue-600",
    text: "text-white",
    border: "border-blue-700",
    lightBg: "bg-blue-50/90 dark:bg-blue-950/40",
    lightText: "text-blue-600 dark:text-blue-400",
    lightBorder: "border-blue-200 dark:border-blue-800",
    badgeBg: "bg-blue-100 dark:bg-blue-900/50",
    badgeText: "text-blue-700 dark:text-blue-200",
    badgeBorder: "border-blue-300 dark:border-blue-700",
    kanjis: new Set(["青", "碧", "空", "天", "雲", "風", "気", "宙", "宇", "国", "県", "市", "町", "村", "洲", "図", "島", "区"])
  },
  // 10. Purple / Night / Mysterious / Time
  {
    name: "Màu tím / Ban đêm / Thời gian",
    emoji: "🌙",
    colorName: "purple",
    bg: "bg-purple-600",
    text: "text-white",
    border: "border-purple-700",
    lightBg: "bg-purple-50/90 dark:bg-purple-950/40",
    lightText: "text-purple-600 dark:text-purple-400",
    lightBorder: "border-purple-200 dark:border-purple-800",
    badgeBg: "bg-purple-100 dark:bg-purple-900/50",
    badgeText: "text-purple-700 dark:text-purple-200",
    badgeBorder: "border-purple-300 dark:border-purple-700",
    kanjis: new Set(["紫", "夜", "晩", "夕", "暗", "夢", "神", "魂", "魔", "幻", "幽", "月", "時", "年", "週", "期", "暦", "酒"])
  },
  // 11. Black / Shadow / Darkness
  {
    name: "Màu đen / Bóng tối",
    emoji: "⬛",
    colorName: "zinc",
    bg: "bg-zinc-800",
    text: "text-white",
    border: "border-zinc-900",
    lightBg: "bg-zinc-100/90 dark:bg-zinc-900/60",
    lightText: "text-zinc-800 dark:text-zinc-200",
    lightBorder: "border-zinc-300 dark:border-zinc-700",
    badgeBg: "bg-zinc-200 dark:bg-zinc-800",
    badgeText: "text-zinc-800 dark:text-zinc-200",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    kanjis: new Set(["黒", "影", "墨", "悪", "死", "亡", "怖", "鬼"])
  },
  // 12. White / Silver / Pure
  {
    name: "Màu trắng / Bạc / Tinh khôi",
    emoji: "⚪",
    colorName: "slate",
    bg: "bg-slate-500",
    text: "text-white",
    border: "border-slate-600",
    lightBg: "bg-slate-100/90 dark:bg-slate-900/50",
    lightText: "text-slate-700 dark:text-slate-300",
    lightBorder: "border-slate-300 dark:border-slate-700",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeText: "text-slate-700 dark:text-slate-200",
    badgeBorder: "border-slate-300 dark:border-slate-700",
    kanjis: new Set(["白", "銀", "素", "清", "潔", "絹"])
  },
  // 13. Study / Books / Knowledge / Language
  {
    name: "Học tập / Tri thức / Ngôn ngữ",
    emoji: "📚",
    colorName: "indigo",
    bg: "bg-indigo-600",
    text: "text-white",
    border: "border-indigo-700",
    lightBg: "bg-indigo-50/90 dark:bg-indigo-950/40",
    lightText: "text-indigo-600 dark:text-indigo-400",
    lightBorder: "border-indigo-200 dark:border-indigo-800",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900/50",
    badgeText: "text-indigo-700 dark:text-indigo-200",
    badgeBorder: "border-indigo-300 dark:border-indigo-700",
    kanjis: new Set(["学", "教", "校", "文", "知", "書", "辞", "典", "語", "話", "読", "習", "究", "研", "問", "題", "試", "験", "勉", "強", "筆", "帳", "記", "論", "説", "字", "考", "意"])
  },
  // 14. Human / Family / Body
  {
    name: "Con người / Thân thể",
    emoji: "👤",
    colorName: "teal",
    bg: "bg-teal-600",
    text: "text-white",
    border: "border-teal-700",
    lightBg: "bg-teal-50/90 dark:bg-teal-950/40",
    lightText: "text-teal-700 dark:text-teal-300",
    lightBorder: "border-teal-200 dark:border-teal-800",
    badgeBg: "bg-teal-100 dark:bg-teal-900/50",
    badgeText: "text-teal-700 dark:text-teal-200",
    badgeBorder: "border-teal-300 dark:border-teal-700",
    kanjis: new Set(["人", "者", "員", "民", "友", "親", "私", "男", "女", "子", "父", "母", "兄", "姉", "弟", "妹", "夫", "妻", "族", "達", "郎", "主", "己", "彼", "身", "体", "顔", "頭", "手", "足", "目", "耳", "口", "歯", "首", "骨", "毛", "誰", "君", "僕", "児", "孫", "老", "祖", "婦", "娘", "客", "仲"])
  },
  // 15. Workplace / Company / Architecture
  {
    name: "Công ty / Tổ chức / Nơi chốn",
    emoji: "🏢",
    colorName: "orange",
    bg: "bg-orange-500",
    text: "text-white",
    border: "border-orange-600",
    lightBg: "bg-orange-50/90 dark:bg-orange-950/40",
    lightText: "text-orange-700 dark:text-orange-400",
    lightBorder: "border-orange-200 dark:border-orange-800",
    badgeBg: "bg-orange-100 dark:bg-orange-900/50",
    badgeText: "text-orange-700 dark:text-orange-200",
    badgeBorder: "border-orange-300 dark:border-orange-700",
    kanjis: new Set(["会", "社", "業", "職", "働", "事", "務", "局", "院", "館", "所", "店", "営", "企", "構", "組", "団", "役", "部", "課", "署", "建", "物", "築", "場", "合", "関", "係", "設", "備", "官", "省", "庁", "支", "委"])
  }
];

export const DEFAULT_CATEGORY: Omit<KanjiCategoryInfo, 'kanjis'> = {
  name: "Khác / Bổ trợ",
  emoji: "💮",
  colorName: "slate",
  bg: "bg-slate-600",
  text: "text-white",
  border: "border-slate-700",
  lightBg: "bg-slate-50/90 dark:bg-slate-900/40",
  lightText: "text-slate-700 dark:text-slate-300",
  lightBorder: "border-slate-200 dark:border-slate-800",
  badgeBg: "bg-slate-100 dark:bg-slate-800",
  badgeText: "text-slate-700 dark:text-slate-300",
  badgeBorder: "border-slate-200 dark:border-slate-700"
};

/**
 * Returns color category info for a single Kanji character
 */
export function getKanjiCategory(kanjiChar: string): Omit<KanjiCategoryInfo, 'kanjis'> {
  const cat = KANJI_CATEGORIES.find(c => c.kanjis.has(kanjiChar));
  return cat ? cat : DEFAULT_CATEGORY;
}

/**
 * Common Kanji Meaning and descriptions dictionary (Vietnam-optimized)
 * Provides immediate local fallbacks when DB / API is slow or offline
 */
export const LOCAL_KANJI_DICTIONARY: Record<string, { meaning: string; onyomi: string; kunyomi: string; radical: string; strokes: number }> = {
  '会': { meaning: 'Hội (hội họp, gặp gỡ)', onyomi: 'カイ, エ', kunyomi: 'あ.う', radical: '人 (Nhân)', strokes: 6 },
  '社': { meaning: 'Xã (xã hội, công ty)', onyomi: 'シャ', kunyomi: 'やしろ', radical: '示 (Thị)', strokes: 7 },
  '国': { meaning: 'Quốc (quốc gia, đất nước)', onyomi: 'コク', kunyomi: 'くに', radical: '囗 (Vi)', strokes: 8 },
  '際': { meaning: 'Tế (giao tế, ranh giới)', onyomi: 'サイ', kunyomi: 'きわ', radical: '阜 (Phụ)', strokes: 14 },
  '関': { meaning: 'Quan (liên quan, hải quan)', onyomi: 'カン', kunyomi: 'せき, かか.わる', radical: '門 (Môn)', strokes: 14 },
  '係': { meaning: 'Hệ (quan hệ, liên kết)', onyomi: 'ケイ', kunyomi: 'かか.る, かかり', radical: '人 (Nhân)', strokes: 9 },
  '学': { meaning: 'Học (học tập, trường học)', onyomi: 'ガク', kunyomi: 'まな.ぶ', radical: '子 (Tử)', strokes: 8 },
  '生': { meaning: 'Sinh (sinh sống, học sinh)', onyomi: 'セイ, ショウ', kunyomi: 'い.きる, う.まれる', radical: '生 (Sinh)', strokes: 5 },
  '先': { meaning: 'Tiên (đi trước, tương lai)', onyomi: 'セン', kunyomi: 'さき, まず', radical: '儿 (Nhân đi)', strokes: 6 },
  '校': { meaning: 'Hiệu (trường học, so sánh)', onyomi: 'コウ', kunyomi: 'かせ', radical: '木 (Mộc)', strokes: 10 },
  '教': { meaning: 'Giáo (giáo dục, giảng dạy)', onyomi: 'キョウ', kunyomi: 'おし.える, おそ.わる', radical: '攴 (Phộc)', strokes: 11 },
  '文': { meaning: 'Văn (văn chương, ngôn ngữ)', onyomi: 'ブン, モン', kunyomi: 'ふみ', radical: '文 (Văn)', strokes: 4 },
  '知': { meaning: 'Tri (tri thức, hiểu biết)', onyomi: 'チ', kunyomi: 'し.る', radical: '矢 (Thỉ)', strokes: 8 },
  '時': { meaning: 'Thời (thời gian, giờ giấc)', onyomi: 'ジ', kunyomi: 'とき', radical: '日 (Nhật)', strokes: 10 },
  '日': { meaning: 'Nhật (mặt trời, ngày)', onyomi: 'ニチ, ジツ', kunyomi: 'ひ, -び, -か', radical: '日 (Nhật)', strokes: 4 },
  '月': { meaning: 'Nguyệt (mặt trăng, tháng)', onyomi: 'ゲツ, ガツ', kunyomi: 'つき', radical: '月 (Nguyệt)', strokes: 4 },
  '年': { meaning: 'Niên (năm, tuổi tác)', onyomi: 'ネン', kunyomi: 'とし', radical: '干 (Can)', strokes: 6 },
  '週': { meaning: 'Chu (tuần lễ, chu kỳ)', onyomi: 'シュウ', kunyomi: 'まわ.り', radical: '辵 (Sước)', strokes: 11 },
  '心': { meaning: 'Tâm (trái tim, tâm trí)', onyomi: 'シン', kunyomi: 'こころ', radical: '心 (Tâm)', strokes: 4 },
  '愛': { meaning: 'Ái (yêu thương, ái tình)', onyomi: 'アイ', kunyomi: 'いと.しい', radical: '心 (Tâm)', strokes: 13 },
  '情': { meaning: 'Tình (tình cảm, sự tình)', onyomi: 'ジョウ, セイ', kunyomi: 'なさ.け', radical: '心 (Tâm)', strokes: 11 },
  '感': { meaning: 'Cảm (cảm giác, cảm động)', onyomi: 'カン', kunyomi: 'かん.じる', radical: '心 (Tâm)', strokes: 13 },
  '思': { meaning: 'Tư (suy nghĩ, tư duy)', onyomi: 'シ', kunyomi: 'おも.う', radical: '心 (Tâm)', strokes: 9 },
  '金': { meaning: 'Kim (vàng, tiền bạc)', onyomi: 'キン, コン', kunyomi: 'かね, かな-', radical: '金 (Kim)', strokes: 8 },
  '銀': { meaning: 'Ngân (bạc, ngân hàng)', onyomi: 'ギン', kunyomi: 'しろがね', radical: '金 (Kim)', strokes: 14 },
  '経': { meaning: 'Kinh (kinh tế, trải qua)', onyomi: 'ケイ, キョウ', kunyomi: 'へ.る, たつ', radical: '糸 (Mịch)', strokes: 11 },
  '済': { meaning: 'Tế (kinh tế, kết thúc)', onyomi: 'サイ, セイ', kunyomi: 'す.む, す.ます', radical: '水 (Thủy)', strokes: 11 },
  '費': { meaning: 'Phí (chi phí, phí tổn)', onyomi: 'ヒ', kunyomi: 'つい.やす', radical: '貝 (Bối)', strokes: 12 },
  '行': { meaning: 'Hành (đi lại, thực hành)', onyomi: 'コウ, ギョウ, アン', kunyomi: 'い.く, ゆ.く, おこな.う', radical: '行 (Hành)', strokes: 6 },
  '来': { meaning: 'Lai (đến, tương lai)', onyomi: 'ライ', kunyomi: 'く.る, きた.る', radical: '木 (Mộc)', strokes: 7 },
  '動': { meaning: 'Động (chuyển động, lao động)', onyomi: 'ドウ', kunyomi: 'うご.く, うご.かす', radical: '力 (Lực)', strokes: 11 },
  '運': { meaning: 'Vận (vận chuyển, số phận)', onyomi: 'ウン', kunyomi: 'はこ.ぶ', radical: '辵 (Sước)', strokes: 12 },
  '歩': { meaning: 'Bộ (đi bộ, nhịp bước)', onyomi: 'ホ, ブ, フ', kunyomi: 'ある.く, あゆ.む', radical: '止 (Chỉ)', strokes: 8 },
  '大': { meaning: 'Đại (to lớn, quan trọng)', onyomi: 'ダイ, タイ', kunyomi: 'おお.きい', radical: '大 (Đại)', strokes: 3 },
  '小': { meaning: 'Tiểu (nhỏ bé, ít ỏi)', onyomi: 'ショウ', kunyomi: 'ちい.さい, こ-', radical: '小 (Tiểu)', strokes: 3 },
  '中': { meaning: 'Trung (ở giữa, trung tâm)', onyomi: 'チュウ', kunyomi: 'なか', radical: '丨 (Côn)', strokes: 4 },
  '長': { meaning: 'Trường, Trưởng (dài, người đứng đầu)', onyomi: 'チョウ', kunyomi: 'なが.い, おさ', radical: '長 (Trường)', strokes: 8 },
  '高': { meaning: 'Cao (cao ráo, đắt đỏ)', onyomi: 'コウ', kunyomi: 'たか.い', radical: '高 (Cao)', strokes: 10 },
  '安': { meaning: 'An (an toàn, giá rẻ)', onyomi: 'アン', kunyomi: 'やす.い', radical: '女 (Nữ)', strokes: 6 },
  '新': { meaning: 'Tân (mới mẻ, tươi mới)', onyomi: 'シン', kunyomi: 'あたら.しい, あら.た', radical: '斤 (Cân)', strokes: 13 },
  '古': { meaning: 'Cổ (cũ kỹ, cổ xưa)', onyomi: 'コ', kunyomi: 'ふる.い', radical: '口 (Khẩu)', strokes: 5 },
  '本': { meaning: 'Bản (sách vở, cội nguồn)', onyomi: 'ホン', kunyomi: 'もと', radical: '木 (Mộc)', strokes: 5 },
  '語': { meaning: 'Ngữ (ngôn ngữ, lời nói)', onyomi: 'ゴ', kunyomi: 'かた.る, かた.らう', radical: '言 (Ngôn)', strokes: 14 },
  '話': { meaning: 'Thoại (trò chuyện, câu chuyện)', onyomi: 'ワ', kunyomi: 'はな.す, はなし', radical: '言 (Ngôn)', strokes: 13 },
  '言': { meaning: 'Ngôn (nói, phát ngôn)', onyomi: 'ゲン, ゴン', kunyomi: 'い.う, こと', radical: '言 (Ngôn)', strokes: 7 },
  '読': { meaning: 'Độc (đọc sách, xem)', onyomi: 'ドク, トク', kunyomi: 'よ.む', radical: '言 (Ngôn)', strokes: 14 },
  '書': { meaning: 'Thư (viết, cuốn sách)', onyomi: 'ショ', kunyomi: 'か.く', radical: '曰 (Viết)', strokes: 10 },
  '聞': { meaning: 'Văn, Vấn (nghe, hỏi thăm)', onyomi: 'ブン, モン', kunyomi: 'き.く, き.こえる', radical: '耳 (Nhĩ)', strokes: 14 },
  '見': { meaning: 'Kiến (nhìn, thấy, quan điểm)', onyomi: 'ケン', kunyomi: 'み.る, み.える, み.せる', radical: '見 (Kiến)', strokes: 7 },
  '食': { meaning: 'Thực (ăn uống, món ăn)', onyomi: 'ショク, ジキ', kunyomi: 'た.べる, く.う', radical: '食 (Thực)', strokes: 9 },
  '飲': { meaning: 'Ẩm (uống nước)', onyomi: 'イン', kunyomi: 'の.む', radical: '食 (Thực)', strokes: 12 },
  '買': { meaning: 'Mãi (mua sắm)', onyomi: 'バイ', kunyomi: 'か.う', radical: '貝 (Bối)', strokes: 12 },
  '売': { meaning: 'Mại (bán hàng, kinh doanh)', onyomi: 'バイ', kunyomi: 'う.る, う.れる', radical: '士 (Sĩ)', strokes: 7 },
  '出': { meaning: 'Xuất (ra ngoài, xuất hiện)', onyomi: 'シュツ, スイ', kunyomi: 'で.る, だ.す', radical: '凵 (Khảm)', strokes: 5 },
  '入': { meaning: 'Nhập (vào trong, gia nhập)', onyomi: 'ニュウ', kunyomi: 'はい.る, い.れる', radical: '入 (Nhập)', strokes: 2 },
  '立': { meaning: 'Lập (đứng dậy, thành lập)', onyomi: 'リツ, リュウ', kunyomi: 'た.つ, た.てる', radical: '立 (Lập)', strokes: 5 },
  '休': { meaning: 'Hưu (nghỉ ngơi, nghỉ phép)', onyomi: 'キュウ', kunyomi: 'やす.む, やす.まる', radical: '人 (Nhân)', strokes: 6 },
  '体': { meaning: 'Thể (cơ thể, thể chất)', onyomi: 'タイ, テイ', kunyomi: 'からだ', radical: '人 (Nhân)', strokes: 7 },
  '人': { meaning: 'Nhân (con người)', onyomi: 'ジン, ニン', kunyomi: 'ひと', radical: '人 (Nhân)', strokes: 2 },
  '友': { meaning: 'Hữu (bạn bè, bằng hữu)', onyomi: 'ユウ', kunyomi: 'とも', radical: '又 (Hựu)', strokes: 4 },
  '父': { meaning: 'Phụ (người cha, phụ thân)', onyomi: 'フ', kunyomi: 'ちち, とう', radical: '父 (Phụ)', strokes: 4 },
  '母': { meaning: 'Mẫu (người mẹ, mẫu thân)', onyomi: 'ボ', kunyomi: 'はは, かあ', radical: '毋 (Vô)', strokes: 5 },
  '子': { meaning: 'Tử (đứa con, trẻ nhỏ)', onyomi: 'シ, ス', kunyomi: 'こ', radical: '子 (Tử)', strokes: 3 },
  '男': { meaning: 'Nam (đàn ông, nam giới)', onyomi: 'ダン, ナン', kunyomi: 'おとこ', radical: '田 (Điền)', strokes: 7 },
  '女': { meaning: 'Nữ (phụ nữ, nữ giới)', onyomi: 'ジョ, ニョ', kunyomi: 'おんな, め', radical: '女 (Nữ)', strokes: 3 },
  '勉': { meaning: 'Miễn (cố gắng, chăm chỉ)', onyomi: 'ベン', kunyomi: 'つと.める', radical: '力 (Lực)', strokes: 10 },
  '強': { meaning: 'Cường (mạnh mẽ, kiên cường)', onyomi: 'キョウ, ゴウ', kunyomi: 'つよ.い, つよ.まる', radical: '弓 (Cung)', strokes: 11 },
  '試': { meaning: 'Thí (thử nghiệm, thi cử)', onyomi: 'シ', kunyomi: 'こころ.みる, ため.す', radical: '言 (Ngôn)', strokes: 13 },
  '験': { meaning: 'Nghiệm (thử nghiệm, trải nghiệm)', onyomi: 'ケン, ゲン', kunyomi: 'ため.す', radical: '馬 (Mã)', strokes: 18 },
  '業': { meaning: 'Nghiệp (công việc, nghề nghiệp)', onyomi: 'ギョウ, ゴウ', kunyomi: 'わざ', radical: '木 (Mộc)', strokes: 13 },
  '職': { meaning: 'Chức (chức vụ, nghề nghiệp)', onyomi: 'ショク', kunyomi: 'つとめ', radical: '耳 (Nhĩ)', strokes: 18 },
  '員': { meaning: 'Viên (thành viên, nhân viên)', onyomi: 'イン', kunyomi: 'かず', radical: '口 (Khẩu)', strokes: 10 },
  '店': { meaning: 'Điếm (cửa tiệm, quán ăn)', onyomi: 'テン', kunyomi: 'みせ', radical: '广 (Quảng)', strokes: 8 },
  '所': { meaning: 'Sở (nơi chốn, địa điểm)', onyomi: 'ショ', kunyomi: 'ところ', radical: '戸 (Hộ)', strokes: 8 },
  '場': { meaning: 'Tràng, Trường (quảng trường, địa điểm)', onyomi: 'ジョウ', kunyomi: 'ば', radical: '土 (Thổ)', strokes: 12 },
  '合': { meaning: 'Hợp (phù hợp, hợp nhất)', onyomi: 'ゴウ, ガッ', kunyomi: 'あ.う, あ.わせる', radical: '口 (Khẩu)', strokes: 6 },
  '問': { meaning: 'Vấn (hỏi thăm, câu hỏi)', onyomi: 'モン', kunyomi: 'と.う, と.い', radical: '口 (Khẩu)', strokes: 11 },
  '題': { meaning: 'Đề (chủ đề, tiêu đề)', onyomi: 'ダイ', kunyomi: 'ひたい', radical: '頁 (Hiệt)', strokes: 18 },
  '空': { meaning: 'Không (bầu trời, trống rỗng)', onyomi: 'クウ', kunyomi: 'そら, あ.く, から', radical: '穴 (Huyệt)', strokes: 8 },
  '海': { meaning: 'Hải (biển cả, đại dương)', onyomi: 'カイ', kunyomi: 'うみ', radical: '水 (Thủy)', strokes: 9 },
  '山': { meaning: 'Sơn (núi non)', onyomi: 'サン, セン', kunyomi: 'やま', radical: '山 (Sơn)', strokes: 3 },
  '川': { meaning: 'Xuyên (con sông, dòng suối)', onyomi: 'セン', kunyomi: 'かわ', radical: '巛 (Xuyên)', strokes: 3 },
  '雨': { meaning: 'Vũ (cơn mưa)', onyomi: 'ウ', kunyomi: 'あめ, あま', radical: '雨 (Vũ)', strokes: 8 },
  '天': { meaning: 'Thiên (trời cao, thời tiết)', onyomi: 'テン', kunyomi: 'あめ, あま', radical: '大 (Đại)', strokes: 4 },
  '気': { meaning: 'Khí (khí chất, tâm trạng, khí trời)', onyomi: 'キ, ケ', kunyomi: 'いき', radical: '气 (Khí)', strokes: 6 },
  '車': { meaning: 'Xa (xe cộ, ô tô)', onyomi: 'シャ', kunyomi: 'くるま', radical: '車 (Xa)', strokes: 7 },
  '駅': { meaning: 'Dịch (nhà ga xe lửa)', onyomi: 'エキ', kunyomi: 'うまや', radical: '馬 (Mã)', strokes: 14 },
  '電': { meaning: 'Điện (điện lực, tia chớp)', onyomi: 'デン', kunyomi: 'いなずま', radical: '雨 (Vũ)', strokes: 13 },
  '道': { meaning: 'Đạo (con đường, đạo lý)', onyomi: 'ドウ, トウ', kunyomi: 'みち', radical: '辵 (Sước)', strokes: 12 },
  '手': { meaning: 'Thủ (bàn tay, tay nghề)', onyomi: 'シュ', kunyomi: 'て, た', radical: '手 (Thủ)', strokes: 4 },
  '足': { meaning: 'Túc (chân, đầy đủ)', onyomi: 'ソク', kunyomi: 'あし, た.りる', radical: '足 (Túc)', strokes: 7 },
  '目': { meaning: 'Mục (con mắt, mục lục)', onyomi: 'モク, ボク', kunyomi: 'め, ま-', radical: '目 (Mục)', strokes: 5 },
  '耳': { meaning: 'Nhĩ (lỗ tai)', onyomi: 'ジ', kunyomi: 'みみ', radical: '耳 (Nhĩ)', strokes: 6 },
  '口': { meaning: 'Khẩu (miệng, cửa ngõ)', onyomi: 'コウ, ク', kunyomi: 'くち', radical: '口 (Khẩu)', strokes: 3 }
};

/**
 * Returns single Kanji details locally
 */
export function getLocalKanjiDetails(char: string) {
  const dictEntry = KANJI_DICTIONARY[char];
  const h = (dictEntry?.han_viet || KANJI_TO_HAN_VIET[char] || '').toUpperCase();
  const d = LOCAL_KANJI_DICTIONARY[char];
  
  const onyomi = dictEntry?.onyomi || d?.onyomi || '—';
  const kunyomi = dictEntry?.kunyomi || d?.kunyomi || '—';
  const meaning = dictEntry?.meaning || (d ? d.meaning.split(' (')[0] : h ? h.toLowerCase() : 'chữ Hán');
  const radical = dictEntry?.radical || d?.radical || 'Chưa rõ';
  const strokes = dictEntry?.strokes || d?.strokes || 8;

  return {
    kanji: char,
    han_viet: h || char,
    meaning,
    onyomi,
    kunyomi,
    radical,
    strokes
  };
}

/**
 * Autocompletes and normalizes Kanji breakdown client-side to guarantee zero empty states.
 * Fulfills the "AUTO FIX POLICY" on client rendering.
 */
export function autoFixClientBreakdown(word: string, kana: string, currentMeaning: string, loadedBreakdown: any) {
  const kanjiChars = word.split('').filter(char => /[\u4e00-\u9faf]/.test(char));
  
  if (kanjiChars.length === 0) return null;
  
  // Keep track of auto-fixes applied
  const autoFixLogs: string[] = [];

  const processedBreakdown = kanjiChars.map(char => {
    const local = getLocalKanjiDetails(char);
    const apiMatch = loadedBreakdown?.kanji_breakdown?.find((b: any) => b.kanji === char);
    
    let han_viet = apiMatch?.han_viet || local.han_viet;
    let onyomi = (apiMatch?.onyomi && apiMatch.onyomi !== '—' && apiMatch.onyomi !== 'Chưa rõ') ? apiMatch.onyomi : local.onyomi;
    let kunyomi = (apiMatch?.kunyomi && apiMatch.kunyomi !== '—' && apiMatch.kunyomi !== 'Chưa rõ') ? apiMatch.kunyomi : local.kunyomi;
    let meaning = (apiMatch?.meaning && apiMatch.meaning !== 'Chưa rõ' && apiMatch.meaning.trim() !== '') ? apiMatch.meaning : local.meaning;
    let family = apiMatch?.family || [];

    // Auto fix corrections
    const expectedHanviet = (KANJI_TO_HAN_VIET[char] || '').toUpperCase();
    if (expectedHanviet && han_viet.toUpperCase() !== expectedHanviet) {
      autoFixLogs.push(`Sửa âm Hán Việt chữ "${char}": "${han_viet}" ➔ "${expectedHanviet}"`);
      han_viet = expectedHanviet;
    }

    if (!meaning || meaning === 'Chưa rõ' || meaning.trim() === '') {
      meaning = local.meaning;
      autoFixLogs.push(`Bổ sung nghĩa Hán Việt bị thiếu cho chữ "${char}" ➔ "${meaning}"`);
    }

    return {
      kanji: char,
      han_viet: han_viet.toUpperCase(),
      onyomi,
      kunyomi,
      meaning,
      family,
      category: getKanjiCategory(char)
    };
  });

  const combined_hanviet = processedBreakdown.map(b => b.han_viet).join(' ');
  
  // Custom smart formula for equation
  const formula = processedBreakdown.map(b => b.han_viet).join(' + ');
  const etymology = loadedBreakdown?.etymology || `${formula} ➔ ${currentMeaning}`;

  return {
    word,
    reading: kana,
    meaning: currentMeaning,
    combined_hanviet,
    kanji_breakdown: processedBreakdown,
    etymology,
    autoFixLogs
  };
}
