import React, { useMemo, useState } from 'react';
import { FORMS, RULES, VERBS, conjugate, type FormId, type Verb, type VerbGroup } from '../data/verbConjugation';
import type { VocabularyItem } from '../types';

const norm = (s: string) => s.replace(/[\s。、]/g, '');
const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
type Q = { verb: Verb; form: FormId };
type Mode = 'choice' | 'type';
const COMMON: FormId[] = ['te', 'ta', 'nai', 'dict'];
// て/た nhóm 1 có 5 luật theo âm cuối: chỉ hiện luật đúng với động từ đang hỏi.
const TE_LINE: Record<string, number> = { う: 0, つ: 0, る: 0, ぶ: 1, む: 1, ぬ: 1, く: 2, ぐ: 3, す: 4 };
function ruleFor(q: Q): string {
  const lines = RULES[q.form as Exclude<FormId, 'masu'>][q.verb.g - 1].split('｜');
  if (q.verb.g === 1 && (q.form === 'te' || q.form === 'ta')) {
    if (q.verb.kana === 'いく') return `き → ${q.form === 'te' ? 'いて' : 'いた'}, riêng いきます → ${q.form === 'te' ? 'いって' : 'いった'} (ngoại lệ)`;
    return lines[TE_LINE[q.verb.kana.slice(-1)]].replace(/（.*?）/, '');
  }
  return lines[0];
}
const GROUP_STYLE = ['', 'bg-pink-100 text-pink-800', 'bg-emerald-100 text-emerald-800', 'bg-sky-100 text-sky-800'];

// Động từ nhóm 1 có đuôi る nhưng nhìn giống nhóm 2 (dùng chữ Hán để phân biệt).
const G1_RU = new Set(['帰る', '入る', '走る', '知る', '切る', '要る', '参る', '減る', '照る', '滑る', '握る', '散る', '蹴る', '限る', '焦る', '茂る', '湿る', '練る']);
const E_I_ROW = 'いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ';
const clean = (s: string) => s.replace(/〈する〉/g, 'する').replace(/[(（][^)）]*[)）]/g, '').replace(/\s/g, '');
/** Lấy động từ từ từ vựng bài học (thẻ có partOfSpeech '動'); bỏ những thẻ không chia được. */
export function verbsFromItems(items: VocabularyItem[]): Verb[] {
  const out: Verb[] = [];
  for (const it of items) {
    if (it.partOfSpeech !== '動') continue;
    let kanji = clean(it.kanji || ''); const kana = clean(it.hiragana || '');
    if (!kana || /[～〜~/／・、,]/.test(kanji + kana) || !/[うくぐすつぬぶむる]$/.test(kana)) continue;
    if (kanji.slice(-1) !== kana.slice(-1)) kanji = kana;
    let g: VerbGroup = 1;
    if (/する$/.test(kana) || kana.endsWith('くる')) g = 3;
    else if (kana.endsWith('る') && kana.length > 1 && E_I_ROW.includes(kana[kana.length - 2]) && !G1_RU.has(kanji)) g = 2;
    out.push({ kanji, kana, g, vi: it.meaning });
  }
  return out;
}

const TE_ENDS: [string, string][] = [['って', 'った'], ['んで', 'んだ'], ['いて', 'いた'], ['いで', 'いだ'], ['して', 'した']];
/** 3 đáp án nhiễu: áp sai quy tắc nhóm / sai đuôi て-た, rồi đến thể khác của cùng động từ. */
function distractors(q: Q, correct: string): string[] {
  const { kana, g } = q.verb;
  const wrong: string[] = [];
  if (g === 1) wrong.push(conjugate(kana, 2, q.form)); else if (g === 2) wrong.push(conjugate(kana, 1, q.form));
  if (g === 1 && (q.form === 'te' || q.form === 'ta')) TE_ENDS.forEach(e => wrong.push(kana.slice(0, -1) + e[q.form === 'te' ? 0 : 1]));
  const other = shuffle(FORMS.filter(f => f.id !== q.form).map(f => conjugate(kana, g, f.id)));
  const uniq = [...new Set([...shuffle(wrong), ...other])].filter(x => x !== correct);
  return uniq.slice(0, 3);
}

/** Hiện dạng chia một lần; chỉ thêm dòng kana khi khác với dạng kanji. */
function ConjText({ verb, form, cls, sub }: { verb: Verb; form: FormId; cls: string; sub: string }) {
  const k = conjugate(verb.kanji, verb.g, form, true), h = conjugate(verb.kana, verb.g, form);
  return <><div className={cls} lang="ja">{k}</div>{k !== h && <div className={sub} lang="ja">{h}</div>}</>;
}

function FormGrid({ verb, hi }: { verb: Verb; hi?: FormId }) {
  return (
    <div className="grid grid-cols-2 gap-1.5" lang="ja">
      {FORMS.map(f => (
        <div key={f.id} className={`rounded-lg border px-2 py-1.5 ${f.id === hi ? 'border-pink-400 bg-pink-50' : 'border-slate-200 bg-white'}`}>
          <div className="text-[11px] text-slate-600">{f.jp} · {f.vi}</div>
          <ConjText verb={verb} form={f.id} cls="text-sm font-bold text-slate-900" sub="text-xs text-slate-600" />
        </div>
      ))}
    </div>
  );
}

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

const pill = (on: boolean) => `min-h-[44px] px-3 rounded-full text-sm font-bold border ${on ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-slate-700 border-slate-300'}`;

/** Chia động từ: luyện theo động từ của bài đang học, chọn đáp án hoặc gõ; có bảng chia đầy đủ và ôn lại câu sai. */
export default function VocabConjugateMode({ items = [] }: { items?: VocabularyItem[] }) {
  const lessonVerbs = useMemo(() => verbsFromItems(items), [items]);
  const [view, setView] = useState<'practice' | 'rules'>('practice');
  const [ruleForm, setRuleForm] = useState<Exclude<FormId, 'masu'>>('te');
  const pool = lessonVerbs.length >= 3 ? lessonVerbs : VERBS;
  const [mode, setMode] = useState<Mode>('choice');
  const [picked, setPicked] = useState<FormId[]>(COMMON);
  const [run, setRun] = useState(0);
  const [retry, setRetry] = useState<Q[] | null>(null);
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const [res, setRes] = useState<'ok' | 'bad' | null>(null);
  const [hint, setHint] = useState(false);
  const [wrong, setWrong] = useState<Q[]>([]);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const qs: Q[] = useMemo(() => retry ?? shuffle(pool.flatMap(verb => picked.map(form => ({ verb, form })))).slice(0, 20), [pool, picked, run, retry]);
  const reset = () => { setI(0); setText(''); setChosen(null); setRes(null); setHint(false); setWrong([]); setScore({ ok: 0, total: 0 }); };
  const restart = (r: Q[] | null = null) => { setRetry(r); setRun(n => n + 1); reset(); };
  const togglePicked = (id: FormId) => { setPicked(p => p.includes(id) ? (p.length > 1 ? p.filter(x => x !== id) : p) : [...p, id]); restart(); };
  const q = qs[i];
  const kanaAns = q ? conjugate(q.verb.kana, q.verb.g, q.form) : '';
  const kanjiAns = q ? conjugate(q.verb.kanji, q.verb.g, q.form, true) : '';
  const options = useMemo(() => q ? shuffle([kanaAns, ...distractors(q, kanaAns)]) : [], [q, kanaAns]);
  const grade = (ok: boolean) => { setRes(ok ? 'ok' : 'bad'); setScore(s => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 })); if (!ok) setWrong(w => [...w, q]); };
  const check = () => { const t = norm(text); grade(t === norm(kanaAns) || t === norm(kanjiAns)); };
  const choose = (o: string) => { if (res) return; setChosen(o); grade(o === kanaAns); };
  const next = () => { setI(n => n + 1); setText(''); setChosen(null); setRes(null); setHint(false); };
  const form = q && FORMS.find(f => f.id === q.form)!;
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="inline-flex p-1 rounded-full bg-slate-100 border border-slate-200">
        {([['practice', 'Luyện tập'], ['rules', 'Quy tắc']] as const).map(([k, l]) => <button key={k} onClick={() => setView(k)} className={`min-h-[44px] px-4 rounded-full text-sm font-bold ${view === k ? 'bg-pink-500 text-white' : 'text-slate-700'}`}>{l}</button>)}
      </div>
      {view === 'rules' && <Rules form={ruleForm} setForm={setRuleForm} />}
      {view === 'practice' && (
        <>
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Nguồn động từ và cách trả lời">
            <button aria-pressed={mode === 'choice'} onClick={() => setMode('choice')} className={pill(mode === 'choice')}>Chọn đáp án</button>
            <button aria-pressed={mode === 'type'} onClick={() => setMode('type')} className={pill(mode === 'type')}>Gõ</button>
          </div>
          {lessonVerbs.length < 3 && <p className="text-xs text-slate-600">Bài này chưa có đủ động từ, đang dùng động từ cơ bản.</p>}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Chọn thể cần luyện">
            {FORMS.map(f => <button key={f.id} aria-pressed={picked.includes(f.id)} onClick={() => togglePicked(f.id)} className={pill(picked.includes(f.id))}>{f.jp}</button>)}
          </div>
          {!q ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl font-black text-emerald-600">{score.ok}/{score.total}</div>
              <div className="flex justify-center gap-2">
                {wrong.length > 0 && <button onClick={() => restart(shuffle(wrong))} className="min-h-[44px] px-5 rounded-xl border-2 border-pink-500 text-pink-600 text-sm font-bold">Ôn lại {wrong.length} câu sai</button>}
                <button onClick={() => restart()} className="min-h-[44px] px-6 rounded-xl bg-pink-500 text-white text-sm font-bold">Làm lại</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono"><span>{i + 1}/{qs.length}{retry ? ' · ôn câu sai' : ''}</span><span>Đúng {score.ok}/{score.total}</span></div>
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-pink-500 transition-[width]" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
              <div className="text-center space-y-1">
                <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-extrabold ${GROUP_STYLE[q.verb.g]}`}>NHÓM {q.verb.g}</span>
                <ConjText verb={q.verb} form="masu" cls="text-3xl font-extrabold text-slate-900" sub="text-sm text-slate-600" />
                <div className="text-sm text-slate-600">{q.verb.vi}</div>
                <div className="text-base font-bold text-pink-600">→ {form!.jp} <span className="text-slate-600 font-normal">({form!.vi})</span></div>
              </div>
              {res === null && (hint
                ? <p className="text-sm rounded-lg bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2">{ruleFor(q)}</p>
                : <button onClick={() => setHint(true)} className="mx-auto block min-h-[44px] px-4 text-sm font-bold text-amber-700 underline">Gợi ý quy tắc</button>)}
              {mode === 'choice' ? (
                <div className="grid grid-cols-2 gap-2" lang="ja">
                  {options.map(o => {
                    const show = res !== null;
                    const cls = show ? (o === kanaAns ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : o === chosen ? 'border-rose-400 bg-rose-50 text-rose-900' : 'border-slate-200 bg-white text-slate-500') : 'border-slate-300 bg-white text-slate-900 hover:border-pink-400';
                    return <button key={o} disabled={show} onClick={() => choose(o)} className={`min-h-[52px] rounded-xl border-2 px-2 text-lg font-bold ${cls}`}>{o}</button>;
                  })}
                </div>
              ) : (
                <input
                  value={text} disabled={res === 'ok'} lang="ja" autoFocus
                  onChange={e => { setText(e.target.value); setRes(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); res === 'ok' ? next() : text.trim() && check(); } }}
                  placeholder="Gõ kết quả (kana hoặc kanji)"
                  className={`w-full min-h-[48px] rounded-xl border-2 px-3 text-lg text-slate-900 ${res === 'ok' ? 'border-emerald-500 bg-emerald-50' : res === 'bad' ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}
                />
              )}
              {res === 'ok' && <p className="text-sm font-bold text-emerald-700">Chính xác!</p>}
              {res === 'bad' && <p className="text-sm font-bold text-rose-700">Đáp án: {kanjiAns === kanaAns ? kanaAns : `${kanjiAns}（${kanaAns}）`}<br /><span className="font-normal text-slate-700">{ruleFor(q)}</span></p>}
              {res !== null && <FormGrid verb={q.verb} hi={q.form} />}
              <div className="flex gap-2">
                {res === null && mode === 'type' && <button onClick={() => { setText(kanaAns); grade(false); }} className="min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700">Xem đáp án</button>}
                {res === null && mode === 'type' && <button disabled={!text.trim()} onClick={check} className="flex-1 min-h-[44px] rounded-xl bg-pink-500 disabled:opacity-40 text-white text-sm font-bold">Kiểm tra</button>}
                {res !== null && <button onClick={next} autoFocus className="flex-1 min-h-[44px] rounded-xl bg-slate-900 text-white text-sm font-bold">Tiếp</button>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
