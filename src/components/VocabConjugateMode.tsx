import React, { useMemo, useState } from 'react';
import { FORMS, RULES, VERBS, conjugate, type FormId, type Verb } from '../data/verbConjugation';

const norm = (s: string) => s.replace(/[\s。、]/g, '');
const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
type Q = { verb: Verb; form: FormId };
const GROUP_STYLE = ['', 'bg-pink-100 text-pink-800', 'bg-emerald-100 text-emerald-800', 'bg-sky-100 text-sky-800'];

function Rules({ form, setForm }: { form: Exclude<FormId, 'masu'>; setForm: (f: Exclude<FormId, 'masu'>) => void }) {
  const f = FORMS.find(x => x.id === form)!;
  const ex = (g: 1 | 2 | 3) => VERBS.filter(v => v.g === g).slice(0, g === 3 ? 2 : 3);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {FORMS.map(x => <button key={x.id} onClick={() => setForm(x.id as Exclude<FormId, 'masu'>)} className={`min-h-[44px] px-3 rounded-full text-sm font-bold border ${x.id === form ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-slate-700 border-slate-300'}`}>{x.jp}</button>)}
      </div>
      <h4 className="font-bold text-slate-900">{f.jp} · {f.vi}</h4>
      {[1, 2, 3].map(g => (
        <div key={g} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-extrabold ${GROUP_STYLE[g]}`}>NHÓM {g}</span>
          <p className="text-sm text-slate-800 whitespace-pre-line">{RULES[form][g - 1].replace(/｜/g, '\n')}</p>
          <ul className="text-sm text-slate-700">
            {ex(g as 1 | 2 | 3).map(v => <li key={v.kana}>{conjugate(v.kana, v.g, 'masu')} → <b className="text-emerald-700">{conjugate(v.kana, v.g, form)}</b></li>)}
          </ul>
        </div>
      ))}
      {form === 'conditional' && <p className="text-xs text-slate-600">Tính từ い: bỏ い + ければ（たかければ）· Tính từ な / Danh từ: + なら（きれいなら, あめなら）.</p>}
    </div>
  );
}

/** Chia động từ: cho thể ます, gõ lại theo thể được yêu cầu (kana hoặc kanji đều được). */
export default function VocabConjugateMode() {
  const [view, setView] = useState<'practice' | 'rules'>('practice');
  const [ruleForm, setRuleForm] = useState<Exclude<FormId, 'masu'>>('te');
  const [picked, setPicked] = useState<FormId[]>(['te']);
  const [run, setRun] = useState(0);
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [res, setRes] = useState<'ok' | 'bad' | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const qs: Q[] = useMemo(() => shuffle(VERBS.flatMap(verb => picked.map(form => ({ verb, form })))).slice(0, 20), [picked, run]);
  const togglePicked = (id: FormId) => { setPicked(p => p.includes(id) ? (p.length > 1 ? p.filter(x => x !== id) : p) : [...p, id]); setRun(r => r + 1); setI(0); setText(''); setRes(null); setScore({ ok: 0, total: 0 }); };
  const q = qs[i];
  const kanaAns = q ? conjugate(q.verb.kana, q.verb.g, q.form) : '';
  const kanjiAns = q ? conjugate(q.verb.kanji, q.verb.g, q.form, true) : '';
  const check = () => { const t = norm(text); const ok = t === norm(kanaAns) || t === norm(kanjiAns); setRes(ok ? 'ok' : 'bad'); if (ok) setScore(s => ({ ok: s.ok + 1, total: s.total + 1 })); else setScore(s => ({ ...s, total: s.total + 1 })); };
  const next = () => { setI(n => n + 1); setText(''); setRes(null); };
  const form = q && FORMS.find(f => f.id === q.form)!;
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="inline-flex p-1 rounded-full bg-slate-100 border border-slate-200">
        {([['practice', 'Luyện tập'], ['rules', 'Quy tắc']] as const).map(([k, l]) => <button key={k} onClick={() => setView(k)} className={`min-h-[44px] px-5 rounded-full text-sm font-bold ${view === k ? 'bg-pink-500 text-white' : 'text-slate-700'}`}>{l}</button>)}
      </div>
      {view === 'rules' ? <Rules form={ruleForm} setForm={setRuleForm} /> : (
        <>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Chọn thể cần luyện">
            {FORMS.map(f => <button key={f.id} aria-pressed={picked.includes(f.id)} onClick={() => togglePicked(f.id)} className={`min-h-[44px] px-3 rounded-full text-sm font-bold border ${picked.includes(f.id) ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-slate-700 border-slate-300'}`}>{f.jp}</button>)}
          </div>
          {!q ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl font-black text-emerald-600">{score.ok}/{score.total}</div>
              <button onClick={() => { setRun(r => r + 1); setI(0); setScore({ ok: 0, total: 0 }); }} className="min-h-[44px] px-6 rounded-xl bg-pink-500 text-white text-sm font-bold">Làm lại</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono"><span>{i + 1}/{qs.length}</span><span>Đúng {score.ok}/{score.total}</span></div>
              <div className="text-center space-y-1">
                <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-extrabold ${GROUP_STYLE[q.verb.g]}`}>NHÓM {q.verb.g}</span>
                <div className="text-3xl font-extrabold text-slate-900" lang="ja">{conjugate(q.verb.kanji, q.verb.g, 'masu', true)}</div>
                <div className="text-sm text-slate-600">{conjugate(q.verb.kana, q.verb.g, 'masu')} · {q.verb.vi}</div>
                <div className="text-base font-bold text-pink-600">→ {form!.jp} <span className="text-slate-600 font-normal">({form!.vi})</span></div>
              </div>
              <input
                value={text} disabled={res === 'ok'} lang="ja" autoFocus
                onChange={e => { setText(e.target.value); setRes(null); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); res === 'ok' ? next() : text.trim() && check(); } }}
                placeholder="Gõ kết quả (kana hoặc kanji)"
                className={`w-full min-h-[48px] rounded-xl border-2 px-3 text-lg text-slate-900 ${res === 'ok' ? 'border-emerald-500 bg-emerald-50' : res === 'bad' ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}
              />
              {res === 'ok' && <p className="text-sm font-bold text-emerald-700">Chính xác! {kanjiAns}（{kanaAns}）</p>}
              {res === 'bad' && <p className="text-sm font-bold text-rose-700">Chưa đúng. Đáp án: {kanjiAns}（{kanaAns}）<br /><span className="font-normal text-slate-700">{RULES[q.form as Exclude<FormId, 'masu'>][q.verb.g - 1].split('｜')[0]}</span></p>}
              <div className="flex gap-2">
                {res === null && <button onClick={() => { setText(kanaAns); setRes('bad'); setScore(s => ({ ...s, total: s.total + 1 })); }} className="min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700">Xem đáp án</button>}
                {res === null
                  ? <button disabled={!text.trim()} onClick={check} className="flex-1 min-h-[44px] rounded-xl bg-pink-500 disabled:opacity-40 text-white text-sm font-bold">Kiểm tra</button>
                  : <button onClick={next} className="flex-1 min-h-[44px] rounded-xl bg-slate-900 text-white text-sm font-bold">Tiếp</button>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
