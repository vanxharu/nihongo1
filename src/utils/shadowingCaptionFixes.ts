// Corrections for words YouTube auto-captions mis-hear, applied when building prepared sentences.
// Only fixes confirmed from the sentence context; video-specific when the same string is valid elsewhere.
const ALL = '*';
export const CAPTION_FIXES: [video: string, find: RegExp, replace: string][] = [
  // Show name "Nihongo con Teppei" heard as コンテ / コン鉄 / コンペ / 婚てぺ / 根てぺ / 日本平 …
  [ALL, /日本語(?:の)?(?:コンテぺ平|コンテぺ|コンテ|コン鉄|コンペ|婚てぺ|根てぺ|てぺ)/g, '日本語con Teppei'],
  [ALL, /日本平の時間/g, '日本語con Teppeiの時間'],
  ['t2bAaub_G6o', /役員立つ/g, '役に立つ'],
  ['t2bAaub_G6o', /完全な初球/g, '完全な初級'],
  ['o98AN6fmnug', /週慣/g, '習慣'],
  ['W7OPNaqIFUY', /今を行きましょう/g, '今を生きましょう'],
  // Shiho: crossing the Thai–Lao border overland (陸路) — タイ heard as タ / 体, 国境 as 目標.
  ['HgatfkTSbjc', /陸クロ|リクロ/g, '陸路'],
  ['HgatfkTSbjc', /目標を/g, '国境を'],
  ['HgatfkTSbjc', /(昔の|今の)体/g, '$1タイ'],
  ['HgatfkTSbjc', /タ(?=に|から|と|は|みたい|の)/g, 'タイ'],
];

export function fixCaption(video: string, text: string) {
  return CAPTION_FIXES.reduce((t, [v, re, to]) => (v === ALL || v === video ? t.replace(re, to) : t), text);
}

/** Auto-caption pieces worth keeping: Japanese, or numbers / short codes spoken inside Japanese (1番, N4, ATM). */
export const keepCaptionPiece = (text: string) =>
  /[぀-ヿ㐀-鿿]/.test(text) || /^[。？！?!]+$/.test(text.trim()) || (/[0-9０-９A-Z]/.test(text) && !/[a-z]{4,}/.test(text));
