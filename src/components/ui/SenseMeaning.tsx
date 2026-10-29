import React, { useEffect, useState } from 'react';
import { unresolvedAlts } from '../../utils/jaWords';

const cache = new Map<string, Promise<number>>();
function pick(word: string, sentence: string, options: string[]) {
  const key = JSON.stringify([word, sentence, options]);
  let p = cache.get(key);
  if (!p) {
    p = fetch('/api/ja/sense', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word, sentence, options }) })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status)))).then(d => d.index as number);
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
}

/** The sentence closest to `word` (texts can be whole passages). */
export function sentenceOf(text: string, word: string) {
  return text.split(/(?<=[。！？!?\n])/).find(s => s.includes(word))?.trim().slice(0, 400) || text.slice(0, 400);
}

/** Meaning of a word; a homograph the translation did not settle ("Nhiều nghĩa: a / b") is resolved by AI from the sentence. */
export default function SenseMeaning({ word, meaning, sentence }: { word: string; meaning: string; sentence: string }) {
  const alts = unresolvedAlts(meaning);
  const [picked, setPicked] = useState<{ key: string; m: string | null } | null>(null);
  const key = word + '\n' + sentence + '\n' + meaning;
  useEffect(() => {
    if (!alts || !sentence.trim()) return;
    let live = true;
    pick(word, sentence, alts).then(i => { if (live) setPicked({ key, m: alts[i] }); }, () => { if (live) setPicked({ key, m: null }); });
    return () => { live = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!alts) return <>{meaning}</>;
  const got = picked?.key === key ? picked.m : undefined;
  if (got) return <>{got} <span className="text-[11px] opacity-70">(nghĩa theo câu)</span></>;
  return <>{meaning}{got === undefined && <span className="text-[11px] opacity-70"> · đang xác định nghĩa theo câu…</span>}</>;
}
