// Word lookup on morphological tokens (kuromoji): taps hit whole words, never pieces of other words.
export type JaToken = { s: string; b: string; p: string; r?: string }; // surface, basic form, part of speech, reading (katakana)
export interface Hit { word: string; reading: string; meaning: string; alts?: string[] }
export type Entry = { kanji?: string | null; hiragana?: string | null; meaning?: string | null; core?: boolean };

const KANJI = /[㐀-鿿々]/;
type Cand = Hit & { core?: boolean };
const toHira = (s: string) => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const SKIP = /^(助詞|助動詞|記号|フィラー|感動詞)$/;

/** Lookup by written form. Kana keys only resolve when the reading is unambiguous, and keep the kana as the word. */
export function buildLookup(entries: Entry[]) {
  const byKanji = new Map<string, Hit>(), byKana = new Map<string, Cand[]>();
  for (const e of entries) {
    // べんきょう(する), ～さん: keys are the bare written word
    const clean = (x?: string | null) => (x || '').replace(/[（(]する[）)]|[～〜~・\s]/g, '').trim();
    const kana = clean(e.hiragana), kanji = clean(e.kanji), meaning = (e.meaning || '').trim();
    if (!meaning || !(kana || kanji)) continue;
    const written = KANJI.test(kanji) ? kanji : kanji || kana; // kana/katakana words: written form is the kana
    if (KANJI.test(kanji)) { if (!byKanji.has(kanji)) byKanji.set(kanji, { word: kanji, reading: kana, meaning }); }
    for (const k of new Set([kana, KANJI.test(kanji) ? '' : kanji].filter(Boolean).map(toHira))) {
      const list = byKana.get(k) || []; list.push({ word: written, reading: kana || kanji, meaning, core: e.core }); byKana.set(k, list);
    }
  }
  const words = (m: string) => new Set(m.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean));
  const related = (a: string, b: string) => { const x = words(a); return [...words(b)].some(w => x.has(w)); };
  return (key: string, inflected = false): Hit | undefined => {
    if (!key || key === '*') return;
    if (byKanji.has(key)) return byKanji.get(key);
    if (KANJI.test(key)) return;
    // verbs/adjectives: only entries ending like the dictionary form (よる the verb is not 夜)
    let list = (byKana.get(toHira(key)) || []).filter(h => !inflected || h.word.endsWith(key.slice(-1)));
    // Same reading, unrelated meanings (はし: đũa / cầu, かえる: về / đổi): not guessed.
    // A rare homograph (或 for ある) does not block the core-vocabulary word.
    const clash = (l: Cand[]) => l.some(a => l.some(b => !related(a.meaning, b.meaning)));
    if (clash(list)) {
      const core = list.filter(h => h.core);
      // Still ambiguous: keep every meaning; wordSpans picks the one the sentence's translation uses.
      if (!core.length || clash(core)) return { word: key, reading: toHira(key), meaning: '', alts: [...new Set(list.map(h => h.meaning))] };
      list = core;
    }
    // Kana in the text is shown as kana; a kanji entry is used only for longer readings (not いた → 板).
    const h = list.find(h => !KANJI.test(h.word)) ?? (key.length >= 3 ? list[0] : undefined);
    return h && { word: key, reading: KANJI.test(h.word) ? h.word : h.reading, meaning: h.meaning };
  };
}

/** Split text into spans along token boundaries; content words get their dictionary hit. */
export function wordSpans(tokens: JaToken[], lookup: (k: string, inflected?: boolean) => Hit | undefined, context = '') {
  const out: { t: string; hit?: Hit }[] = [];
  const ctx = syllables(context);
  const plain = (t: string) => { const last = out[out.length - 1]; if (last && !last.hit) last.t += t; else out.push({ t }); };
  for (let i = 0; i < tokens.length;) {
    const tk = tokens[i];
    // A kana word misread as particles (べ|ん|きょう) can only start right after a space or punctuation.
    const skip = SKIP.test(tk.p);
    if (skip && i > 0 && tokens[i - 1].p !== '記号') { plain(tk.s); i++; continue; }
    // Words the tokenizer split (日本語 教室, kana-only し|ごと, べん|きょう) are taken whole when the dictionary has them.
    let done = false;
    for (let j = Math.min(tokens.length, i + 6); j > i + 1; j--) {
      const run = tokens.slice(i, j);
      if (run.some(t => t.p === '記号') || SKIP.test(run[run.length - 1].p)) continue;
      const hit = lookup(run.map(t => t.s).join(''));
      if (hit && !hit.alts) { out.push({ t: run.map(t => t.s).join(''), hit }); i = j; done = true; break; }
    }
    if (done) continue;
    if (skip) { plain(tk.s); i++; continue; }
    // Conjugated verbs/adjectives are looked up by dictionary form (行き → 行く, not the noun 行き).
    const inflects = /^(動詞|形容詞)$/.test(tk.p) && tk.b !== tk.s;
    const hit = inflects ? lookup(tk.b, true) || lookup(tk.s) : lookup(tk.s) || (tk.b !== tk.s ? lookup(tk.b) : undefined);
    // Kanji the dictionary only lists in kana (毎日 → まいにち, 作っ → つくる): use the tokenizer's reading.
    const viaReading = !hit && KANJI.test(tk.s) && tk.r && tk.r !== '*' ? readingHit(tk, lookup) : undefined;
    if (hit || viaReading) out.push({ t: tk.s, hit: hit || viaReading }); else plain(tk.s);
    i++;
  }
  // Homographs (はし: đũa / cầu): the meaning whose words appear in the sentence's translation; else all of them.
  for (const o of out) if (o.hit?.alts) {
    const score = (m: string) => [...syllables(m)].filter(w => ctx.has(w)).length;
    const best = [...o.hit.alts].sort((a, b) => score(b) - score(a))[0];
    o.hit = { ...o.hit, meaning: score(best) > 0 && o.hit.alts.filter(a => score(a) === score(best)).length === 1 ? best : `Nhiều nghĩa: ${o.hit.alts.join(' / ')}` };
  }
  return out;
}

const STOP = new Set(['của', 'là', 'và', 'có', 'một', 'những', 'các', 'cho', 'được', 'với', 'người', 'cái', 'sự', 'việc', 'đi', 'làm', 'ở', 'thì', 'này', 'đó']);
function syllables(m: string) { return new Set(m.toLowerCase().split(/[^\p{L}]+/u).filter(w => w && !STOP.has(w))); }

function readingHit(tk: JaToken, lookup: (k: string, inflected?: boolean) => Hit | undefined): Hit | undefined {
  const tail = tk.s.match(/[぀-ゟ]*$/)![0], stem = tk.s.slice(0, tk.s.length - tail.length), r = toHira(tk.r!);
  if (!r.endsWith(tail)) return;
  const inflects = /^(動詞|形容詞)$/.test(tk.p) && tk.b.startsWith(stem) && tk.b !== tk.s;
  const word = inflects ? tk.b : tk.s, reading = inflects ? r.slice(0, r.length - tail.length) + tk.b.slice(stem.length) : r;
  const h = lookup(reading, inflects);
  return h && { word, reading, meaning: h.meaning, alts: h.alts };
}
