import React, { useMemo, useState } from 'react';
import SearchPicker from './ui/SearchPicker';
import { KANJI_MASTER_N4, MASTER_SENTENCES, type MasterLesson, type MasterWord } from '../data/kanjiMasterN4';

const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const ALL_WORDS: MasterWord[] = KANJI_MASTER_N4.flatMap(l => l.words);
const hasKanji = (w: MasterWord) => /[\u4e00-\u9fff]/.test(w.word);

function SentenceBuilder({ lesson, storeKey, onDone }: { lesson: MasterLesson; storeKey: string; onDone: () => void }) {
  const items = useMemo(() => shuffle(MASTER_SENTENCES[lesson.id] || []), [lesson]);
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [res, setRes] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const cur = items[i];
  const pool = useMemo(() => (cur ? shuffle(cur.ja.map((t, id) => ({ t, id }))) : []), [cur]);
  const best = (() => { try { return Number(localStorage.getItem(storeKey)) || 0; } catch { return 0; } })();
  if (!items.length) return <p className="text-sm text-slate-500">Chưa có câu.</p>;
  if (i >= items.length) {
    try { if (score > best) localStorage.setItem(storeKey, String(score)); } catch { /* ignore */ }
    return (
      <div className="text-center py-8 space-y-3">
        <div className="text-4xl font-black text-emerald-600">{score}/{items.length}</div>
        <button onClick={onDone} className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">Làm lại</button>
      </div>
    );
  }
  const ans = placed.map(id => cur.ja[id]).join('');
  const full = cur.ja.join('');
  // gợi ý: từ vựng của bài xuất hiện trong câu
  const hints = [...lesson.words, ...ALL_WORDS].filter((w, n, a) => full.includes(w.word) && hasKanji(w) && a.findIndex(x => x.word === w.word) === n).slice(0, 4);
  const check = () => { const ok = ans === full; setRes(ok); if (ok) setScore(s => s + 1); };
  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 font-mono">{i + 1}/{items.length}</div>
      <div className="font-bold text-slate-900">{cur.vi}</div>
      <div className="text-xs text-slate-500 space-y-0.5">{hints.map(w => <div key={w.word}>{w.word}（{w.reading}）: {w.meaning}</div>)}</div>
      <div className={`min-h-[52px] flex flex-wrap gap-2 p-2 rounded-xl border-2 border-dashed ${res === null ? 'border-slate-300' : res ? 'border-emerald-500 bg-emerald-50' : 'border-rose-400 bg-rose-50'}`}>
        {placed.map(id => <button key={id} disabled={res !== null} onClick={() => setPlaced(p => p.filter(x => x !== id))} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-base font-bold">{cur.ja[id]}</button>)}
      </div>
      {res === false && <div className="text-sm text-emerald-700 font-bold">Đáp án: {full}</div>}
      <div className="flex flex-wrap gap-2">
        {pool.map(c => <button key={c.id} disabled={res !== null || placed.includes(c.id)} onClick={() => setPlaced(p => [...p, c.id])} className={`px-3 py-1.5 rounded-lg border border-slate-200 text-base font-bold bg-white ${placed.includes(c.id) ? 'opacity-30' : ''}`}>{c.t}</button>)}
      </div>
      {res === null
        ? <button disabled={placed.length !== cur.ja.length} onClick={check} className="w-full py-2.5 rounded-xl bg-emerald-600 disabled:opacity-40 text-white text-sm font-bold">Kiểm tra</button>
        : <button onClick={() => { setI(i + 1); setPlaced([]); setRes(null); }} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">Tiếp</button>}
    </div>
  );
}


/** Ghép câu: chọn bài rồi xếp các cụm thành câu tiếng Nhật hoàn chỉnh. */
export default function KanjiSentences() {
  const [id, setId] = useState(KANJI_MASTER_N4[0].id);
  const [run, setRun] = useState(0);
  const chapters = useMemo(() => [...new Set(KANJI_MASTER_N4.map(l => l.chapter))].map(c => { const ls = KANJI_MASTER_N4.filter(l => l.chapter === c); return { label: `Chương ${c}: ${ls[0].chapterTitle}`, items: ls.map(l => ({ value: l.id, label: `Bài ${l.id} ${l.title}` })) }; }), []);
  const lesson = KANJI_MASTER_N4.find(l => l.id === id)!;
  return (
    <section className="rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold">Ghép câu</h3>
        <div className="w-56"><SearchPicker value={id} onChange={v => { setId(v); setRun(r => r + 1); }} placeholder="Tìm bài hoặc chương…" groups={chapters} /></div>
      </div>
      <SentenceBuilder key={`${id}${run}`} lesson={lesson} storeKey={`kmn4_${id}_sentence`} onDone={() => setRun(r => r + 1)} />
      <p className="text-xs text-slate-500">Câu do app tự soạn để luyện, không phải câu trong sách.</p>
    </section>
  );
}
