import React, { useEffect, useState } from 'react';
import { unresolvedAlts } from '../../utils/jaWords';

const cache = new Map<string, Promise<number>>();
const post = (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
async function ask(body: { word: string; sentence: string; options: string[] }) {
  const saved = await post('/api/ja-sense-lookup', body).catch(() => null);
  if (saved?.ok) return (await saved.json()).index as number;
  const r = await post('/api/ja/sense', body);
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()).index as number;
}
function pick(word: string, sentence: string, options: string[]) {
  const key = JSON.stringify([word, sentence, options]);
  let p = cache.get(key);
  if (!p) {
    // one delayed retry for a transient provider error / short rate-limit burst
    p = ask({ word, sentence, options }).catch(() => new Promise<number>((ok, no) => setTimeout(() => ask({ word, sentence, options }).then(ok, no), 4000)));
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
}

/** The sentence that contains offset `at` of `text` (texts can be whole passages). */
export function sentenceAt(text: string, at = 0) {
  let start = 0;
  for (const s of text.split(/(?<=[。！？!?\n])/)) { if (at < start + s.length) return s.trim().slice(0, 400); start += s.length; }
  return text.slice(0, 400);
}

/** Meaning of a word; a homograph the translation did not settle ("Nhiều nghĩa: a / b") is resolved by AI from the sentence. */
export default function SenseMeaning({ word, meaning, sentence }: { word: string; meaning: string; sentence: string }) {
  const alts = unresolvedAlts(meaning);
  const [picked, setPicked] = useState<{ key: string; m: string | null } | null>(null);
  const [round, setRound] = useState(0);
  const key = word + '\n' + sentence + '\n' + meaning + '\n' + round;
  useEffect(() => {
    if (!alts || !sentence.trim()) return;
    let live = true;
    pick(word, sentence, alts).then(i => { if (live) setPicked({ key, m: alts[i] }); }, () => { if (live) setPicked({ key, m: null }); });
    return () => { live = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!alts) return <>{meaning}</>;
  const got = picked?.key === key ? picked.m : undefined;
  if (got) return <>{got} <span className="text-[11px] opacity-70">(nghĩa theo câu)</span></>;
  return <>{meaning}{got === undefined
    ? <span className="text-[11px] opacity-70"> · đang xác định nghĩa theo câu…</span>
    : <button type="button" onClick={e => { e.stopPropagation(); setRound(r => r + 1); }} className="ml-1 text-[11px] underline cursor-pointer">Thử lại</button>}</>;
}
