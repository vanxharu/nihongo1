// Dựng bài đọc hoàn chỉnh (furigana, token tra từ, Hán Việt) từ dữ liệu admin nhập bằng Excel.
export interface ImportVocab { word: string; reading: string; pos: string; hanViet: string; meaning: string; level: string }
export interface ImportQuiz { question: string; options: string[]; correct: number; explanation: string; type?: string }
export interface ImportLesson {
  id: string; title: string; titleVi: string; level: string; topic: string; imageUrl: string;
  sentences: [string, string][]; vocab: ImportVocab[]; quizzes: ImportQuiz[];
}

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
async function furi(kuro: any, text: string): Promise<string> {
  let out = '';
  for (const p of text.split(OVERRIDE_RE)) {
    if (!p) continue;
    out += OVERRIDE[p] ? `[${p}](${OVERRIDE[p]})` : toBrackets(await kuro.convert(p, { mode: 'furigana', to: 'hiragana' }));
  }
  return mergeAdjacent(out);
}
// Token cho popup tra từ: mỗi mảnh (chữ Hán / okurigana) mang dạng từ điển (伝えました → 伝える).
async function tokensOf(kuro: any, text: string) {
  const out: { text: string; furigana?: string; word: string }[] = [];
  for (const t of await kuro._analyzer.parse(text)) {
    const surface: string = t.surface_form;
    if (/^\s+$/.test(surface)) { out.push({ text: surface, word: '' }); continue; }
    const hasKanji = /[一-龯]/.test(surface);
    const word = hasKanji && t.basic_form && t.basic_form !== '*' ? t.basic_form : surface;
    if (!hasKanji) { out.push({ text: surface, word }); continue; }
    for (const m of (await furi(kuro, surface)).matchAll(/\[([^\]]+)\]\(([^)]+)\)|([^[]+)/g)) {
      if (m[1]) out.push({ text: m[1], furigana: m[2], word }); else out.push({ text: m[3], word });
    }
  }
  return out;
}

const GRADIENTS: [string, string][] = [['#2563eb', '#38bdf8'], ['#ea580c', '#fbbf24'], ['#db2777', '#fb7185'], ['#16a34a', '#a3e635'], ['#7c3aed', '#a78bfa'], ['#0891b2', '#67e8f9'], ['#b91c1c', '#f97316'], ['#0d9488', '#5eead4']];

export async function buildReadingLesson(kuro: any, a: ImportLesson, hanVietOf: (w: string) => string) {
  const paras: string[] = [];
  for (let i = 0; i < a.sentences.length; i += 3) paras.push(a.sentences.slice(i, i + 3).map(s => s[0]).join(''));
  const jp = paras.join('\n\n');
  const rawTokens: any[] = [];
  for (let i = 0; i < paras.length; i++) { if (i) rawTokens.push({ text: '\n\n', word: '' }); rawTokens.push(...(await tokensOf(kuro, paras[i]))); }
  const hash = [...a.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const [from, to] = GRADIENTS[hash % GRADIENTS.length];
  return {
    id: a.id, fromLibrary: true, topic: a.topic, title: a.title, titleVi: a.titleVi, level: a.level,
    japanesePassage: jp,
    furiganaPassage: (await Promise.all(paras.map(p => furi(kuro, p)))).join('\n\n'),
    vietnamesePassage: paras.map((_, i) => a.sentences.slice(i * 3, i * 3 + 3).map(s => s[1]).join(' ')).join('\n\n'),
    sentenceBreakdown: await Promise.all(a.sentences.map(async ([j, v]) => ({ japanese: j, furigana: await furi(kuro, j), vietnamese: v }))),
    rawTokens,
    vocabularyList: a.vocab.map(v => ({ kanji: v.word, word: v.word, hiragana: v.reading, reading: v.reading, partOfSpeech: v.pos, hanViet: v.hanViet || (/[一-龯]/.test(v.word) ? hanVietOf(v.word) : ''), meaning: v.meaning, level: v.level })),
    usedGrammar: [],
    quizzes: a.quizzes.map(q => ({ question: q.question, questionType: q.type || '', questionTypeVn: q.type || '', options: q.options, correctIndex: q.correct, explanation: q.explanation, questionOrigin: 'ai', answerOrigin: 'ai-inferred' })),
    imageUrl: a.imageUrl || '', thumb: { kanji: ([...a.title].find(c => /[一-龯]/.test(c)) || a.title[0] || '読'), from, to },
    sourceName: 'Bài đọc Nihongo', questionOrigin: 'ai',
  };
}
