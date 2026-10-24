import './readingTheme.css';
import React, { useMemo, useState } from 'react';
import exams from '../data/readingExams.json';

type Q = { n: number; q: string; qF: string; options: string[]; optionsF: string[]; answer: number; exp: string };
type Item = { intro?: string; introF?: string; introVi?: string; lines: { jp: string; f: string; vi: string }[]; questions: Q[] };
type Part = { title: string; instruction: string; items: Item[] };
type Exam = { id: string; title: string; level: string; source: string; parts: Part[] };
const EXAMS = exams as Exam[];
const SCORE_KEY = 'reading_exam_scores_v1';
const readScores = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(SCORE_KEY) || '{}'); } catch { return {}; } };
const totalQ = (e: Exam) => e.parts.reduce((n, p) => n + p.items.reduce((m, i) => m + i.questions.length, 0), 0);

// "[漢字](かな)" → <ruby>; showFurigana=false giữ chữ gốc.
function Jp({ f, plain, furi }: { f: string; plain: string; furi: boolean }) {
  if (!furi) return <>{plain}</>;
  const out: React.ReactNode[] = []; let last = 0; let k = 0;
  for (const m of f.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    if (m.index! > last) out.push(f.slice(last, m.index));
    out.push(<ruby key={k++}>{m[1]}<rt className="text-[0.55em]">{m[2]}</rt></ruby>);
    last = m.index! + m[0].length;
  }
  out.push(f.slice(last));
  return <>{out}</>;
}

export default function ReadingExam() {
  const [examId, setExamId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [furi, setFuri] = useState(true);
  const [vi, setVi] = useState<Record<string, boolean>>({});
  const [scores, setScores] = useState(readScores);
  const exam = useMemo(() => EXAMS.find(e => e.id === examId) || null, [examId]);

  const open = (id: string) => { setExamId(id); setAnswers({}); setSubmitted(false); setVi({}); window.scrollTo({ top: 0 }); };
  const submit = () => {
    if (!exam) return;
    const correct = exam.parts.flatMap(p => p.items.flatMap(i => i.questions)).filter(q => answers[q.n] === q.answer).length;
    const best = Math.max(correct, scores[exam.id] ?? -1);
    const next = { ...scores, [exam.id]: best };
    setScores(next); try { localStorage.setItem(SCORE_KEY, JSON.stringify(next)); } catch { /* storage bị chặn: chỉ giữ trong phiên */ }
    setSubmitted(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!exam) {
    return (
      <div id="ai-reading-container" className="w-full max-w-3xl mx-auto space-y-4 p-1">
        <header><h1 className="text-xl font-bold text-[var(--ui-ink)]">Đọc hiểu</h1><p className="text-sm text-[var(--ui-muted)]">Chọn một đề, làm xong bấm Nộp bài để xem điểm và giải thích.</p></header>
        {EXAMS.length === 0 && <p className="text-sm text-[var(--ui-muted)]">Chưa có đề nào.</p>}
        <ul className="grid gap-3 sm:grid-cols-2">
          {EXAMS.map(e => (
            <li key={e.id}><button type="button" onClick={() => open(e.id)} className="w-full text-left reading-surface border border-[var(--ui-line)] rounded-2xl p-4 space-y-1 hover:border-indigo-500 transition cursor-pointer">
              <span className="text-[10px] px-1.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">{e.level}</span>
              <strong className="block text-[var(--ui-ink)]">{e.title}</strong>
              <span className="block text-xs text-[var(--ui-muted)]">{e.parts.length} phần · {totalQ(e)} câu{scores[e.id] !== undefined ? ` · cao nhất ${scores[e.id]}/${totalQ(e)}` : ''}</span>
            </button></li>))}
        </ul>
      </div>
    );
  }

  const total = totalQ(exam); const done = Object.keys(answers).length;
  const score = exam.parts.flatMap(p => p.items.flatMap(i => i.questions)).filter(q => answers[q.n] === q.answer).length;
  return (
    <div id="ai-reading-container" className="w-full max-w-3xl mx-auto space-y-5 pb-24 p-1">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setExamId(null)} className="px-3 py-1.5 rounded-xl reading-soft border border-[var(--ui-line)] text-sm font-bold cursor-pointer">← Danh sách đề</button>
        <label className="flex items-center gap-2 text-xs text-[var(--ui-muted)] cursor-pointer"><input type="checkbox" checked={furi} onChange={e => setFuri(e.target.checked)} /> Furigana</label>
      </div>
      <h1 className="text-lg font-bold text-[var(--ui-ink)]">{exam.title}</h1>
      {submitted && (
        <div role="status" className="reading-surface border border-emerald-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-2">
          <strong className="text-[var(--ui-ink)]">Kết quả: {score}/{total} câu đúng</strong>
          <button type="button" onClick={() => open(exam.id)} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer">Làm lại</button>
        </div>)}
      {exam.parts.map((p, pi) => (
        <section key={pi} className="space-y-4" aria-label={p.title}>
          <div><h2 className="font-bold text-[var(--ui-ink)]">{p.title}</h2><p className="text-xs text-[var(--ui-muted)] font-jp">{p.instruction}</p></div>
          {p.items.map((it, ii) => {
            const key = `${pi}-${ii}`;
            return (
              <article key={key} className="reading-surface border border-[var(--ui-line)] rounded-2xl p-4 space-y-3">
                {it.intro && <p className="text-sm text-[var(--ui-muted)] font-jp" style={{ lineHeight: 2 }}><Jp f={it.introF || it.intro} plain={it.intro} furi={furi} /></p>}
                <div className="reading-soft border border-[var(--ui-line)] rounded-xl p-3 font-jp text-[var(--ui-ink)] space-y-1" style={{ lineHeight: 2.2 }}>
                  {it.lines.map((l, li) => <p key={li}><Jp f={l.f} plain={l.jp} furi={furi} />{vi[key] && <span className="block text-xs text-[var(--ui-muted)] font-sans" style={{ lineHeight: 1.5 }}>{l.vi}</span>}</p>)}
                </div>
                <button type="button" onClick={() => setVi(v => ({ ...v, [key]: !v[key] }))} className="text-xs text-indigo-400 font-bold cursor-pointer">{vi[key] ? 'Ẩn bản dịch' : 'Xem bản dịch'}</button>
                {it.questions.map(q => (
                  <fieldset key={q.n} className="space-y-1.5">
                    <legend className="font-jp text-[var(--ui-ink)] font-semibold" style={{ lineHeight: 2 }}>{q.n}. <Jp f={q.qF} plain={q.q} furi={furi} /></legend>
                    {q.options.map((o, oi) => {
                      const chosen = answers[q.n] === oi; const right = submitted && oi === q.answer; const wrong = submitted && chosen && oi !== q.answer;
                      return (
                        <label key={oi} className={`flex items-start gap-2 rounded-xl border px-3 py-2 font-jp cursor-pointer ${right ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-rose-500 bg-rose-500/10' : chosen ? 'border-indigo-500' : 'border-[var(--ui-line)]'}`} style={{ lineHeight: 2 }}>
                          <input type="radio" name={`q${q.n}`} className="mt-2" checked={chosen} disabled={submitted} onChange={() => setAnswers(a => ({ ...a, [q.n]: oi }))} />
                          <span className="text-[var(--ui-ink)]">{oi + 1}. <Jp f={q.optionsF[oi]} plain={o} furi={furi} />{right && ' ✓'}</span>
                        </label>);
                    })}
                    {submitted && <p className="text-sm text-[var(--ui-muted)]"><b className={answers[q.n] === q.answer ? 'text-emerald-500' : 'text-rose-500'}>{answers[q.n] === undefined ? 'Chưa trả lời.' : answers[q.n] === q.answer ? 'Đúng.' : 'Sai.'}</b> Đáp án: {q.answer + 1}. {q.exp}</p>}
                  </fieldset>))}
              </article>);
          })}
        </section>))}
      {!submitted && (
        <div className="fixed bottom-20 sm:bottom-4 inset-x-0 z-40 flex justify-center px-3 pointer-events-none">
          <div className="pointer-events-auto reading-surface border border-[var(--ui-line)] rounded-xl shadow-lg px-3 py-2 flex items-center gap-3">
            <span className="text-xs text-[var(--ui-muted)]">Đã làm {done}/{total}</span>
            <button type="button" onClick={submit} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer">Nộp bài</button>
          </div>
        </div>)}
    </div>
  );
}
