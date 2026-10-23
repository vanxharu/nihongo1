// Furigana dạng [漢字](かな) cho văn bản tiếng Nhật (dùng khi dựng đề đọc hiểu).
// Các từ kuromoji hay đọc sai: ép cách đọc.
const OVERRIDE: Record<string, string> = {
  日本: 'にほん', 一月一日: 'いちがつついたち', 三日: 'みっか', 二日: 'ふつか', 二人: 'ふたり', 一人: 'ひとり', 今日: 'きょう', 昨日: 'きのう', 明日: 'あした',
  大人: 'おとな', 今朝: 'けさ', 上手: 'じょうず', 下手: 'へた', 果物: 'くだもの', 部屋: 'へや', 友達: 'ともだち', 時々: 'ときどき', 景色: 'けしき',
  今年: 'ことし', 去年: 'きょねん', 七夕: 'たなばた', 眼鏡: 'めがね', 毎日: 'まいにち', 今週: 'こんしゅう', 先週: 'せんしゅう', 来週: 'らいしゅう',
  今月: 'こんげつ', 来月: 'らいげつ', 先月: 'せんげつ', 週末: 'しゅうまつ', 午後: 'ごご', 午前: 'ごぜん', 家賃: 'やちん', 大切: 'たいせつ',
  大丈夫: 'だいじょうぶ', 一緒: 'いっしょ', 夕方: 'ゆうがた', 毎晩: 'まいばん', 毎週: 'まいしゅう', 今夜: 'こんや', 今晩: 'こんばん',
  八百屋: 'やおや', 三人: 'さんにん', 四人: 'よにん', 五人: 'ごにん', 一日中: 'いちにちじゅう',
};
const KEYS = Object.keys(OVERRIDE).sort((a, b) => b.length - a.length);
const OVERRIDE_RE = new RegExp(`(${KEYS.join('|')})`, 'g');
const toBrackets = (html: string) => html.replace(/<ruby>([^<]*)<rp>\(<\/rp><rt>([^<]*)<\/rt><rp>\)<\/rp><\/ruby>/g, '[$1]($2)');
const mergeAdjacent = (s: string) => {
  let prev = '';
  while (prev !== s) { prev = s; s = s.replace(/\[([^\]]+)\]\(([^)]+)\)\[([^\]]+)\]\(([^)]+)\)/g, '[$1$3]($2$4)'); }
  return s;
};
export async function furi(kuro: any, text: string): Promise<string> {
  let out = '';
  for (const p of text.split(OVERRIDE_RE)) {
    if (!p) continue;
    out += OVERRIDE[p] ? `[${p}](${OVERRIDE[p]})` : toBrackets(await kuro.convert(p, { mode: 'furigana', to: 'hiragana' }));
  }
  return mergeAdjacent(out);
}
