// Usage: npx tsx scripts/build-pitch-accents.ts path/to/kanjium/accents.txt
// Source: Kanjium accents.txt (CC BY-SA 4.0) — https://github.com/mifunetoshiro/kanjium
// Only words found in the dictionary get an accent; nothing is guessed.
import { readFileSync, writeFileSync } from 'node:fs';
import { VOCABULARY_DATA } from '../src/data.js';
import { BUSINESS_VOCABULARY } from '../src/data/businessVocab.js';
import { pitchKey, cleanWord, toHiragana } from '../src/utils/pitchAccent.js';

const byWord = new Map<string, number>();     // word|reading
const byReading = new Map<string, Set<number>>();
const entries = new Map<string, [string, number][]>(); // reading -> [word, accent]
for (const line of readFileSync(process.argv[2], 'utf8').split('\n')) {
  const [word, reading, accents] = line.trim().split('\t');
  if (!word || !accents) continue;
  const r = toHiragana(reading || word);
  const a = Number(accents.match(/\d+/)?.[0]); // "(副)1,(形動)0" → first listed
  if (!Number.isInteger(a)) continue;
  if (!byWord.has(`${word}|${r}`)) byWord.set(`${word}|${r}`, a);
  (byReading.get(r) || byReading.set(r, new Set()).get(r)!).add(a);
  (entries.get(r) || entries.set(r, []).get(r)!).push([word, a]);
}

// Kana-only app words: which dictionary spelling is meant (chosen by meaning; values are looked up, not invented).
const SPELL: [string, RegExp | null, string][] = ([
  ['いつか',null,'何時か'],['しょうらい',null,'将来'],['つま',null,'妻'],['まご',null,'孫'],['げんかん',null,'玄関'],['すみ',null,'隅'],
  ['はる',/xuân/,'春'],['はる',null,'貼る'],['つける',null,'付ける'],['つく',null,'点く'],['ごみ',null,'塵'],['かん',null,'缶'],['とどく',null,'届く'],
  ['できる',null,'出来る'],['ゆめ',null,'夢'],['こうぎ',null,'講義'],['いく',null,'行く'],['うすい',null,'薄い'],['ふた',null,'蓋'],['やかん',null,'薬缶'],
  ['ふくろ',null,'袋'],['やむ',null,'止む'],['すく',null,'空く'],['さんせい',null,'賛成'],['けんか',null,'喧嘩'],['きみ',null,'君'],['なくす',null,'無くす'],
  ['わる',null,'割る'],['ひげ',null,'髭'],['ひじ',null,'肘'],['こし',null,'腰'],['つめ',null,'爪'],['やめる',null,'止める'],['きず',null,'傷'],
  ['ようす',null,'様子'],['ひま',null,'暇'],['ふかい',null,'深い'],['へる',null,'減る'],['わけ',null,'訳'],['きっと',null,'屹度'],['だいぶ',null,'大分'],
  ['とうとう',null,'到頭'],['きょうだい',null,'兄弟'],['いぬ',null,'犬'],['いる',/cần/,'要る'],['いる',null,'居る'],['ひとり',null,'一人'],['にほん',null,'日本'],
  ['かんこく',null,'韓国'],['いち',null,'一'],['ご',/tiếng/,'語'],['ご',null,'五'],['ろく',null,'六'],['はち',null,'八'],['じゅういち',null,'十一'],
  ['きょう',null,'今日'],['きのう',null,'昨日'],['かい',/lần/,'回'],['かい',/tầng/,'階'],['する',null,'為る'],['よく',null,'良く'],['かんじ',null,'漢字'],['いみ',null,'意味'],
  ['にっき',null,'日記'],['かいしゃ',null,'会社'],['こうじょう',null,'工場'],['しる',null,'知る'],['かちょう',null,'課長'],['しゃいん',null,'社員'],
  ['この',null,'此の'],['その',null,'其の'],['めいし',null,'名刺'],['かみ',/tóc/,'髪'],['かみ',/giấy/,'紙'],['しりょう',null,'資料'],['きる',/mặc/,'着る'],['きる',null,'切る'],
  ['こ',null,'個'],['ごろ',null,'頃'],['ごぜん',null,'午前'],['いま',null,'今'],['せ',null,'背'],['ふく',/lau/,'拭く'],['ふく',null,'服'],['あおい',null,'青い'],
  ['はく',null,'穿く'],['ぼうし',null,'帽子'],['せんだい',null,'仙台'],['こうべ',null,'神戸'],['あさ',null,'朝'],['ひる',null,'昼'],['よる',null,'夜'],
  ['けさ',null,'今朝'],['ねる',null,'寝る'],['みかん',null,'蜜柑'],['ごはん',null,'御飯'],['さとう',null,'砂糖'],['はし',/đũa/,'箸'],['はし',/cầu/,'橋'],
  ['さら',null,'皿'],['からい',null,'辛い'],['あまり',null,'余り'],['あんまり',null,'余り'],['さどう',null,'茶道'],['かく',/gãi/,'掻く'],['かく',/vẽ/,'描く'],['うみ',null,'海'],['よわい',null,'弱い'],
  ['てんき',null,'天気'],['ゆき',null,'雪'],['ふる',/rơi/,'降る'],['ふる',null,'振る'],['あつい',null,'暑い'],['かさ',null,'傘'],['きせつ',null,'季節'],['なる',null,'成る'],
  ['あき',null,'秋'],['おく',/triệu/,'億'],['おく',null,'置く'],['ぶっか',null,'物価'],['うる',null,'売る'],['かた',null,'方'],['げんきん',null,'現金'],
  ['かえる',/đổi/,'替える'],['おもい',null,'重い'],['あのかた',null,'あの方'],['さい',null,'歳'],['えき',null,'駅'],['のる',null,'乗る'],['かくえき',null,'各駅'],
  ['ちかい',null,'近い'],['みち',null,'道'],['わたる',null,'渡る'],['ちかく',null,'近く'],['ここ',null,'此処'],['ようじ',null,'用事'],['しめる',null,'閉める'],
  ['かぎ',null,'鍵'],['すわる',null,'座る'],['そうじ',null,'掃除'],['たてもの',null,'建物'],['わかい',null,'若い'],['せまい',null,'狭い'],['こしょう',null,'故障'],
  ['ちょうし',null,'調子'],['はやく',null,'早く'],['すう',null,'吸う'],['きんえん',null,'禁煙'],['かす',null,'貸す'],['ほんとう',null,'本当'],['こと',null,'事'],
  ['けいざい',null,'経済'],['また',null,'又'],['きく',null,'聞く'],['つなぐ',null,'繋ぐ'],['もてる',null,'持てる'],['むく',null,'剥く'],['ほうき',null,'帚'],
  ['かび',null,'黴'],['あわ',null,'泡'],['ためる',null,'貯める'],['たまる',null,'貯まる'],['ついでに',null,'序でに'],['やとう',null,'雇う'],['たとえ',null,'仮令'],
  ['はめる',null,'嵌める'],['あくび',null,'欠伸'],['ほる',null,'掘る'],['ふと',null,'不図'],['しま',null,'縞'],['たて',null,'縦'],['しゃべる',null,'喋る'],
  ['かける',null,'掛ける'],['しんせつな',null,'親切'],['ひまな',null,'暇'],['じょうずな',null,'上手'],['へたな',null,'下手'],['じょうぶな',null,'丈夫'],
  ['じゅうぶんな',null,'十分'],['たいへんな',null,'大変'],['いやな',null,'嫌'],['あいまいな',null,'曖昧'],['ざんねん',null,'残念'],['しんせつ',null,'親切'],['ひま',null,'暇'],['じょうず',null,'上手'],['へた',null,'下手'],['じょうぶ',null,'丈夫'],['じゅうぶん',null,'十分'],['たいへん',null,'大変'],['いや',null,'嫌'],['あいまい',null,'曖昧'],
] as [string, RegExp | null, string][]);
const out: Record<string, number> = {};
const conflicts = new Set<string>();
let found = 0, missing: string[] = [];
const words = [...VOCABULARY_DATA, ...BUSINESS_VOCABULARY];
for (const v of words) {
  const key = pitchKey(v.kanji || '', v.hiragana || '');
  if (!key) continue;
  const [w, r] = key.split('|');
  let a = byWord.get(`${w}|${r}`);
  if (a === undefined) for (const alt of (v.kanji || '').split(/[\/／・、,]/).map(cleanWord)) if ((a = byWord.get(`${alt}|${r}`)) !== undefined) break;
  // na-adjectives listed with な: 熱心な → 熱心
  if (a === undefined && /な$/.test(r) && /な$/.test(w)) a = byWord.get(`${w.slice(0, -1)}|${r.slice(0, -1)}`) ?? (byReading.get(r.slice(0, -1))?.size === 1 ? [...byReading.get(r.slice(0, -1))!][0] : undefined);
  // Mixed spelling (ろう下 → 廊下): every kanji the app writes must appear in the dictionary word; all such entries must agree.
  if (a === undefined && /[\u3400-\u9fff]/.test(w)) {
    const kanji = w.match(/[\u3400-\u9fff]/g)!;
    const hits = new Set((entries.get(r) || []).filter(([word]) => kanji.every(k => word.includes(k))).map(([, x]) => x));
    if (hits.size === 1) a = [...hits][0];
  }
  if (a === undefined) { const set = byReading.get(r); if (set?.size === 1) a = [...set][0]; }
  if (a === undefined && !/[\u3400-\u9fff]/.test(w)) {
    const bare = r.replace(/な$/, ''); // na-adjectives are listed without な
    const hit = SPELL.find(([rr, m]) => (rr === r || rr === bare) && (!m || m.test(v.meaning || '')));
    if (hit) a = byWord.get(`${hit[2]}|${hit[0]}`);
  }
  if (a === undefined) { missing.push(`${key}|${v.meaning}`); continue; }
  // Kana homographs (はし đũa/cầu) can differ: keep them per meaning, drop the shared key.
  const sense = `${key}#${v.meaning}`;
  if (key in out && out[key] !== a) { conflicts.add(key); }
  out[sense] = a; if (!(key in out)) out[key] = a; found++;
}
for (const k of conflicts) delete out[k];
// Per-meaning keys are only needed where the shared key was dropped.
for (const k of Object.keys(out)) if (k.includes('#') && !conflicts.has(k.split('#')[0])) delete out[k];
writeFileSync('src/data/pitchAccents.ts', `// Pitch accents (downstep mora, 0 = heiban) from Kanjium by Uros O., CC BY-SA 4.0:\n// https://github.com/mifunetoshiro/kanjium — generated by scripts/build-pitch-accents.ts\nexport const PITCH_ACCENTS: Record<string, number> = ${JSON.stringify(out)};\n`);
console.log(`words ${words.length}, keys found ${found}, missing ${missing.length}`);
writeFileSync(process.env.MISSING_OUT || '/dev/null', missing.join('\n'));
