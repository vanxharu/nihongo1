/** Chia động từ từ dạng từ điển. Quy tắc theo bảng 11 thể (nhóm 1/2/3). */
export type VerbGroup = 1 | 2 | 3;
export type FormId = 'masu' | 'te' | 'ta' | 'nai' | 'volitional' | 'dict' | 'conditional' | 'passive' | 'potential' | 'imperative' | 'prohibitive' | 'causative';
export interface Verb { kanji: string; kana: string; g: VerbGroup; vi: string }

export const FORMS: { id: FormId; jp: string; vi: string }[] = [
  { id: 'te', jp: 'て形', vi: 'Thể て' }, { id: 'ta', jp: 'た形', vi: 'Thể た' }, { id: 'nai', jp: 'ない形', vi: 'Thể ない' },
  { id: 'dict', jp: '辞書形', vi: 'Thể từ điển' }, { id: 'volitional', jp: '意向形', vi: 'Thể ý chí' }, { id: 'conditional', jp: '条件形', vi: 'Thể điều kiện' },
  { id: 'passive', jp: '受身形', vi: 'Thể bị động' }, { id: 'potential', jp: '可能形', vi: 'Thể khả năng' }, { id: 'imperative', jp: '命令形', vi: 'Thể mệnh lệnh' },
  { id: 'prohibitive', jp: '禁止形', vi: 'Thể cấm chỉ' }, { id: 'causative', jp: '使役形', vi: 'Thể sử dịch' },
];

// Mô tả quy tắc cho từng nhóm (theo bảng tham khảo).
export const RULES: Record<Exclude<FormId, 'masu'>, [string, string, string]> = {
  te: ['い・ち・り → って｜み・び・に → んで｜き → いて｜ぎ → いで｜し → して（いきます → いって*）', 'Vます bỏ ます + て', 'します → して｜きます → きて'],
  ta: ['い・ち・り → った｜み・び・に → んだ｜き → いた｜ぎ → いだ｜し → した（いきます → いった*）', 'Vます bỏ ます + た', 'します → した｜きます → きた'],
  nai: ['Hàng い chuyển sang hàng あ + ない（い → わ + ない）', 'Vます bỏ ます + ない', 'します → しない｜きます → こない'],
  dict: ['Hàng い → hàng う', 'Vます bỏ ます + る', 'します → する｜きます → くる'],
  volitional: ['Hàng い → hàng お + う', 'Vます bỏ ます + よう', 'します → しよう｜きます → こよう'],
  conditional: ['Hàng い → hàng え + ば', 'Vます bỏ ます + れば', 'します → すれば｜きます → くれば'],
  passive: ['Hàng い → hàng あ + れます（い → わ + れます）', 'Vます bỏ ます + られます', 'します → されます｜きます → こられます'],
  potential: ['Hàng い → hàng え + ます', 'Vます bỏ ます + られます', 'します → できます｜きます → こられます'],
  imperative: ['Hàng い → hàng え（bỏ ます）', 'Vます bỏ ます + ろ', 'します → しろ｜きます → こい'],
  prohibitive: ['Thể từ điển + な', 'Thể từ điển + な', 'します → するな｜きます → くるな'],
  causative: ['Hàng い → hàng あ + せます（い → わ + せます）', 'Vます bỏ ます + させます', 'します → させます｜きます → こさせます'],
};

// [hàng あ, い, う, え, お] theo âm cuối của dạng từ điển
const ROWS: Record<string, string[]> = {
  う: ['わ', 'い', 'う', 'え', 'お'], く: ['か', 'き', 'く', 'け', 'こ'], ぐ: ['が', 'ぎ', 'ぐ', 'げ', 'ご'], す: ['さ', 'し', 'す', 'せ', 'そ'],
  つ: ['た', 'ち', 'つ', 'て', 'と'], ぬ: ['な', 'に', 'ぬ', 'ね', 'の'], ぶ: ['ば', 'び', 'ぶ', 'べ', 'ぼ'], む: ['ま', 'み', 'む', 'め', 'も'], る: ['ら', 'り', 'る', 'れ', 'ろ'],
};
const TE: Record<string, [string, string]> = { う: ['って', 'った'], つ: ['って', 'った'], る: ['って', 'った'], ぶ: ['んで', 'んだ'], む: ['んで', 'んだ'], ぬ: ['んで', 'んだ'], く: ['いて', 'いた'], ぐ: ['いで', 'いだ'], す: ['して', 'した'] };
const KURU: Record<FormId, string[]> = { // [kana, kanji]
  masu: ['きます', '来ます'], te: ['きて', '来て'], ta: ['きた', '来た'], nai: ['こない', '来ない'], volitional: ['こよう', '来よう'], dict: ['くる', '来る'],
  conditional: ['くれば', '来れば'], passive: ['こられます', '来られます'], potential: ['こられます', '来られます'], imperative: ['こい', '来い'], prohibitive: ['くるな', '来るな'], causative: ['こさせます', '来させます'],
};
const SURU: Record<FormId, string> = { masu: 'します', te: 'して', ta: 'した', nai: 'しない', volitional: 'しよう', dict: 'する', conditional: 'すれば', passive: 'されます', potential: 'できます', imperative: 'しろ', prohibitive: 'するな', causative: 'させます' };
const G2: Record<FormId, string> = { masu: 'ます', te: 'て', ta: 'た', nai: 'ない', volitional: 'よう', dict: 'る', conditional: 'れば', passive: 'られます', potential: 'られます', imperative: 'ろ', prohibitive: 'るな', causative: 'させます' };

/** dict: dạng từ điển (kana hoặc kanji); asKanji: true nếu dict là chữ Hán (để chọn 来 thay vì く/こ/き). */
export function conjugate(dict: string, g: VerbGroup, form: FormId, asKanji = false): string {
  if (g === 3) {
    if (dict.endsWith('する')) return dict.slice(0, -2) + SURU[form];
    return dict.slice(0, -2) + KURU[form][asKanji ? 1 : 0];
  }
  if (g === 2) {
    const base = dict.slice(0, -1);
    return base + G2[form];
  }
  const base = dict.slice(0, -1), end = dict.slice(-1), r = ROWS[end];
  const iku = dict === 'いく' || dict === '行く';
  switch (form) {
    case 'masu': return base + r[1] + 'ます';
    case 'te': return iku ? base + 'って' : base + TE[end][0];
    case 'ta': return iku ? base + 'った' : base + TE[end][1];
    case 'nai': return base + r[0] + 'ない';
    case 'volitional': return base + r[4] + 'う';
    case 'dict': return dict;
    case 'conditional': return base + r[3] + 'ば';
    case 'passive': return base + r[0] + 'れます';
    case 'potential': return base + r[3] + 'ます';
    case 'imperative': return base + r[3];
    case 'prohibitive': return dict + 'な';
    case 'causative': return base + r[0] + 'せます';
  }
}

const V = (kanji: string, kana: string, g: VerbGroup, vi: string): Verb => ({ kanji, kana, g, vi });
/** Danh sách cơ bản chỉ để dự phòng khi bài học không đủ động từ và để lấy ví dụ cho tab Quy tắc. */
export const VERBS: Verb[] = [
  V('買う', 'かう', 1, 'mua'), V('聞く', 'きく', 1, 'nghe'), V('泳ぐ', 'およぐ', 1, 'bơi'), V('話す', 'はなす', 1, 'nói chuyện'), V('待つ', 'まつ', 1, 'đợi'),
  V('飲む', 'のむ', 1, 'uống'), V('遊ぶ', 'あそぶ', 1, 'chơi'), V('死ぬ', 'しぬ', 1, 'chết'), V('帰る', 'かえる', 1, 'về'), V('行く', 'いく', 1, 'đi'),
  V('食べる', 'たべる', 2, 'ăn'), V('見る', 'みる', 2, 'xem'), V('起きる', 'おきる', 2, 'thức dậy'),
  V('する', 'する', 3, 'làm'), V('来る', 'くる', 3, 'đến'),
];
