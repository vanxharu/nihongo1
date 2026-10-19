import React, { useEffect, useMemo, useState } from 'react';
import type { VocabularyItem } from '../types';

const norm = (s: string) => s.replace(/[\s。、．，,.]/g, '');
type W = { word: string; reading: string; meaning: string };
// relatedWords: "家族(かぞく)=gia đình ・ 家(いえ)=nhà" (xem kanjiRowsToVocab)
const parseWords = (item: VocabularyItem): W[] => {
  const out = String(item.relatedWords || '').split(' ・ ').map(s => s.trim().match(/^([^(（=]+)\s*[(（]([^)）]+)[)）]\s*=?\s*(.*)$/)).filter(Boolean)
    .map(m => ({ word: m![1].trim(), reading: m![2].trim(), meaning: m![3].trim() }));
  return out.length ? out : [{ word: item.kanji, reading: item.hiragana.split(' / ')[0], meaning: item.meaning }];
};

/** Viết chữ Hán: hiện từ bằng hiragana + nghĩa, người học gõ lại bằng chữ Hán (kiểu 書きましょう). */
export default function KanjiWriteMode({ item, onNext }: { item: VocabularyItem; onNext: () => void }) {
  const words = useMemo(() => parseWords(item), [item]);
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [res, setRes] = useState<'ok' | 'bad' | null>(null);
  useEffect(() => { setI(0); setText(''); setRes(null); }, [item]);
  const w = words[i];
  const check = () => setRes(norm(text) === norm(w.word) ? 'ok' : 'bad');
  const advance = () => { setText(''); setRes(null); if (i + 1 < words.length) setI(i + 1); else onNext(); };
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="text-center space-y-1">
        <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wide">Viết chữ Hán ({i + 1}/{words.length}):</span>
        <h3 lang="ja" className="text-3xl font-extrabold text-slate-900 dark:text-white">{w.reading}</h3>
        <p className="text-sm text-slate-500">{w.meaning}</p>
      </div>
      <input
        value={text} lang="ja" aria-label="Chữ Hán" placeholder="Gõ chữ Hán…" disabled={res === 'ok'} autoFocus
        onChange={e => { setText(e.target.value); setRes(null); }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); res === 'ok' ? advance() : check(); } }}
        className="w-full min-h-[48px] rounded-xl border border-slate-300 px-3 text-xl text-center"
      />
      {res === 'ok' && <p role="status" className="text-center text-sm font-bold text-emerald-600">Đúng!</p>}
      {res === 'bad' && <p role="status" className="text-center text-sm font-bold text-rose-600">Chưa đúng. Đáp án: <span lang="ja">{w.word}</span></p>}
      <div className="flex gap-2">
        {res === 'ok' || res === 'bad'
          ? <button onClick={advance} className="flex-1 min-h-[44px] rounded-xl bg-slate-900 text-white text-sm font-bold">Tiếp</button>
          : <button onClick={check} disabled={!text.trim()} className="flex-1 min-h-[44px] rounded-xl bg-slate-900 text-white text-sm font-bold disabled:opacity-40">Kiểm tra</button>}
      </div>
    </div>
  );
}
