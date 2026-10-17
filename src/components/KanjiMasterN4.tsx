import React, { useMemo, useState } from 'react';
import SlidingTabs from './ui/SlidingTabs';
import { KANJI_MASTER_N4, masterKanjiInfo, type MasterLesson, type MasterWord } from '../data/kanjiMasterN4';

type Tab = 'kanji' | 'read' | 'write' | 'review';
type Q = { prompt: string; sub: string; options: string[]; answer: string };

const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const ALL_WORDS: MasterWord[] = KANJI_MASTER_N4.flatMap(l => l.words);
const hasKanji = (w: MasterWord) => /[一-鿿]/.test(w.word);

const pick = (words: MasterWord[], mode: 'read' | 'write'): Q[] => shuffle(words.filter(hasKanji)).map(w => {
  const key = (x: MasterWord) => (mode === 'read' ? x.reading : x.word);
  // distractor ưu tiên cùng bài, thiếu thì lấy toàn sách
  const pool = shuffle([...words, ...ALL_WORDS]).filter(x => hasKanji(x) && key(x) !== key(w));
  const opts = [...new Set(pool.map(key))].slice(0, 3);
  return mode === 'read'
    ? { prompt: w.word, sub: 'Chọn cách đọc', options: shuffle([w.reading, ...opts]), answer: w.reading }
    : { prompt: w.reading, sub: `${w.meaning} — chọn chữ Hán`, options: shuffle([w.word, ...opts]), answer: w.word };
});

function Quiz({ qs, storeKey, onDone }: { qs: Q[]; storeKey: string; onDone?: () => void }) {
  const [i, setI] = useState(0); const [sel, setSel] = useState<string | null>(null); const [score, setScore] = useState(0);
  const best = (() => { try { return Number(localStorage.getItem(storeKey)) || 0; } catch { return 0; } })();
  if (!qs.length) return <p className="text-sm text-slate-500">Chưa có câu hỏi.</p>;
  if (i >= qs.length) {
    try { if (score > best) localStorage.setItem(storeKey, String(score)); } catch { /* ignore */ }
    return (
      <div className="text-center py-8 space-y-3">
        <div className="text-4xl font-black text-emerald-600">{score}/{qs.length}</div>
        <p className="text-xs text-slate-500">Kỷ lục: {Math.max(best, score)}/{qs.length}</p>
        <button onClick={() => { setI(0); setScore(0); setSel(null); onDone?.(); }} className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">Làm lại</button>
      </div>
    );
  }
  const q = qs[i];
  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500 font-mono">{i + 1}/{qs.length}</div>
      <div className="text-center py-4"><div className="text-4xl font-black text-slate-900">{q.prompt}</div><div className="text-xs text-slate-500 mt-1">{q.sub}</div></div>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map(o => {
          const st = sel === null ? 'border-slate-200 bg-white' : o === q.answer ? 'border-emerald-500 bg-emerald-50' : o === sel ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white opacity-60';
          return <button key={o} disabled={sel !== null} onClick={() => { setSel(o); if (o === q.answer) setScore(s => s + 1); }} className={`py-3 rounded-xl border-2 text-base font-bold ${st}`}>{o}</button>;
        })}
      </div>
      {sel !== null && <button onClick={() => { setI(i + 1); setSel(null); }} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">Tiếp</button>}
    </div>
  );
}

function Lesson({ lesson, back }: { lesson: MasterLesson; back: () => void }) {
  const [tab, setTab] = useState<Tab>('kanji');
  const [run, setRun] = useState(0);
  const read = useMemo(() => pick(lesson.words, 'read'), [lesson, run]);
  const write = useMemo(() => pick(lesson.words, 'write'), [lesson, run]);
  const review = useMemo(() => shuffle([...pick(lesson.words, 'read'), ...pick(lesson.words, 'write')]).slice(0, 20), [lesson, run]);
  const k = (t: string) => `kmn4_${lesson.id}_${t}`;
  return (
    <div className="space-y-3">
      <button onClick={back} className="text-xs font-bold text-slate-500">← Danh sách bài</button>
      <h3 className="text-base font-bold">Bài {lesson.id}: {lesson.title}</h3>
      <SlidingTabs<Tab> id="kmn4" value={tab} onChange={setTab} items={[['kanji', 'Chữ Hán'], ['read', 'Luyện đọc'], ['write', 'Luyện viết'], ['review', 'Ôn tập']]} />
      {tab === 'kanji' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lesson.kanji.map(c => { const i = masterKanjiInfo(c); return (
              <div key={c} className="flex gap-3 items-center p-3 rounded-xl border border-slate-100 bg-white">
                <div className="text-4xl font-black w-14 text-center">{c}</div>
                <div className="text-xs leading-5 min-w-0">
                  <div className="font-bold text-slate-900">{i?.han_viet} · {i?.meaning}</div>
                  <div className="text-slate-500">音 {i?.onyomi || '—'}</div>
                  <div className="text-slate-500">訓 {i?.kunyomi || '—'}{i?.strokes ? ` · ${i.strokes} nét` : ''}</div>
                </div>
              </div>); })}
          </div>
          <h4 className="text-xs font-bold text-slate-500 pt-2">Từ vựng</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {lesson.words.map(w => <div key={w.word} className="text-sm px-3 py-2 rounded-lg bg-slate-50"><b>{w.word}</b> <span className="text-slate-500">【{w.reading}】</span> {w.meaning}</div>)}
          </div>
        </>
      )}
      {tab === 'read' && <Quiz key={`r${run}`} qs={read} storeKey={k('read')} onDone={() => setRun(r => r + 1)} />}
      {tab === 'write' && <Quiz key={`w${run}`} qs={write} storeKey={k('write')} onDone={() => setRun(r => r + 1)} />}
      {tab === 'review' && <Quiz key={`v${run}`} qs={review} storeKey={k('review')} onDone={() => setRun(r => r + 1)} />}
    </div>
  );
}

export default function KanjiMasterN4() {
  const [cur, setCur] = useState<MasterLesson | null>(null);
  if (cur) return <Lesson lesson={cur} back={() => setCur(null)} />;
  const chapters = [...new Set(KANJI_MASTER_N4.map(l => l.chapter))];
  const best = (id: string) => { try { return localStorage.getItem(`kmn4_${id}_review`); } catch { return null; } };
  return (
    <div className="space-y-4">
      {chapters.map(c => { const ls = KANJI_MASTER_N4.filter(l => l.chapter === c); return (
        <section key={c}>
          <h3 className="text-xs font-bold text-slate-500 mb-1.5">Chương {c}: {ls[0].chapterTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ls.map(l => (
              <button key={l.id} onClick={() => setCur(l)} className="text-left p-3 rounded-xl border border-slate-100 bg-white hover:border-emerald-300">
                <div className="text-sm font-bold">{l.id} {l.title}</div>
                <div className="text-lg tracking-wider text-slate-700">{l.kanji.join('')}</div>
                {best(l.id) && <div className="text-[10px] text-emerald-600 font-bold">Ôn tập: {best(l.id)}/20</div>}
              </button>))}
          </div>
        </section>); })}
    </div>
  );
}
