import { ExpressiveReveal } from './ui/ExpressiveReveal';
import { scale } from '@animate-ui/react/utils/motion';
import { Button as AnimatedButton } from '@animate-ui/react/primitives/buttons/button';
import './readingTheme.css';
import React, { useMemo, useState } from 'react';
import exams from '../data/readingExams.json';
import { BookOpen, ChevronLeft, ChevronRight, Search, CheckCircle2 } from 'lucide-react';

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
  const [libraryTab, setLibraryTab] = useState('library');
  const [librarySearch, setLibrarySearch] = useState('');
  const [rowPages, setRowPages] = useState<Record<string, number>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
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
    const query = librarySearch.trim().toLocaleLowerCase('vi');
    const filtered = EXAMS.filter(e => (libraryTab === 'library' || libraryTab === 'mine' || e.level === libraryTab) &&
      (libraryTab !== 'mine' || scores[e.id] !== undefined) &&
      (!query || (e.title + ' ' + e.parts.flatMap(p => p.items.flatMap(i => i.lines.map(l => l.vi))).join(' ')).toLocaleLowerCase('vi').includes(query)));
    const groups = [
      { id: 'n4-general', title: 'N4 · Luyện đọc theo chủ đề', items: filtered.filter(e => e.level === 'N4' && !e.id.startsWith('minna-')) },
      { id: 'n4-minna', title: 'N4 · Minna Topikku 25', items: filtered.filter(e => e.level === 'N4' && e.id.startsWith('minna-')) },
      ...['N5', 'N3', 'N2', 'N1'].map(level => ({ id: level, title: level, items: filtered.filter(e => e.level === level) })),
    ].filter(g => g.items.length);
    return (
      <div id="ai-reading-container" className="reading-library">
        <header className="reading-library-hero">
          <ExpressiveReveal inView={false}><span className="reading-library-symbol"><BookOpen size={22} /></span></ExpressiveReveal>
          <h1>Đọc hiểu</h1>
          <p>Đọc từng câu, hiểu từng ý.<br />Khám phá bài đọc tiếng Nhật và luyện tập theo trình độ của bạn.</p>
        </header>
        <div className="reading-library-tools">
          <nav className="reading-library-tabs" aria-label="Danh mục bài đọc">
            {[['library', 'Thư viện'], ['mine', 'Bài của bạn'], ...['N5', 'N4', 'N3', 'N2', 'N1'].map(l => [l, l])].map(([id, label]) =>
              <AnimatedButton type="button" key={id} aria-current={libraryTab === id ? 'page' : undefined} onClick={() => { setLibraryTab(id); setRowPages({}); }} className={libraryTab === id ? 'is-active' : ''}>{label}</AnimatedButton>)}
          </nav>
          <label className="reading-library-search"><Search size={16} /><input aria-label="Tìm bài đọc" placeholder="Tìm bài đọc…" value={librarySearch} onChange={e => { setLibrarySearch(e.target.value); setRowPages({}); }} /></label>
        </div>
        {groups.length === 0 && <div className="reading-library-empty"><BookOpen size={32} /><h2>{libraryTab === 'mine' ? 'Chưa có bài đã làm' : 'Chưa có bài đọc phù hợp'}</h2><p>{libraryTab === 'mine' ? 'Hoàn thành một bài đọc để xem lại kết quả tại đây.' : query ? 'Thử tìm bằng từ khóa khác.' : 'Hiện thư viện có bài đọc N4. Các cấp độ khác sẽ được bổ sung sau.'}</p><AnimatedButton type="button" onClick={() => { setLibraryTab('library'); setLibrarySearch(''); }}>Về thư viện</AnimatedButton></div>}
        {groups.map(group => {
          const expanded = !!expandedRows[group.id];
          const page = Math.min(rowPages[group.id] || 0, Math.max(0, Math.ceil(group.items.length / 4) - 1));
          const visible = expanded ? group.items : group.items.slice(page * 4, page * 4 + 4);
          return <section className="reading-library-section" key={group.id} aria-label={group.title}>
            <div className="reading-library-row-heading"><h2>{group.title} <small>({group.items.length} bộ bài)</small></h2><AnimatedButton type="button" aria-expanded={expanded} onClick={() => setExpandedRows(prev => ({ ...prev, [group.id]: !prev[group.id] }))}>{expanded ? 'Thu gọn' : 'Xem tất cả'} <ChevronRight size={14} /></AnimatedButton></div>
            <div className="reading-library-row">
              <ul className="reading-library-cards">
                {visible.map((e, index) => {
                  const lines = e.parts.flatMap(p => p.items.flatMap(i => i.lines));
                  const characters = lines.reduce((n, l) => n + l.jp.replace(/\s/g, '').length, 0);
                  const title = e.title.replace(/^Minna Topikku 25 · /, '');
                  const description = lines.find(l => l.vi.trim())?.vi || e.parts[0]?.title || 'Luyện đọc hiểu tiếng Nhật';
                  return <ExpressiveReveal key={e.id} index={index}><li><AnimatedButton type="button" tapScale={scale.choice} className="reading-library-card" onClick={() => open(e.id)}>
                    <div className="reading-library-cover"><img src={e.id.startsWith('minna-') ? '/reading/reading-study.png' : '/reading/reading-conversation.png'} alt="" width="480" height="270" loading="lazy" /><span className="reading-library-level">{e.level}</span><span className="reading-library-count">{totalQ(e)} câu</span>{scores[e.id] !== undefined && <span className="reading-library-completed"><CheckCircle2 size={12} /> {scores[e.id]}/{totalQ(e)}</span>}</div>
                    <h3>{title}</h3><p>{description}</p><small>{characters.toLocaleString('vi-VN')} ký tự · {e.parts.length} phần</small>
                  </AnimatedButton></li></ExpressiveReveal>;
                })}
              </ul>
              {!expanded && group.items.length > 4 && <div className="reading-library-paging"><AnimatedButton type="button" disabled={page === 0} aria-label={'Hàng trước: ' + group.title} onClick={() => setRowPages(prev => ({ ...prev, [group.id]: page - 1 }))}><ChevronLeft size={18} /></AnimatedButton><span>{page + 1} / {Math.ceil(group.items.length / 4)}</span><AnimatedButton type="button" disabled={(page + 1) * 4 >= group.items.length} aria-label={'Hàng tiếp theo: ' + group.title} onClick={() => setRowPages(prev => ({ ...prev, [group.id]: page + 1 }))}><ChevronRight size={18} /></AnimatedButton></div>}
            </div>
          </section>;
        })}
      </div>
    );
  }

  const total = totalQ(exam); const done = Object.keys(answers).length;
  const score = exam.parts.flatMap(p => p.items.flatMap(i => i.questions)).filter(q => answers[q.n] === q.answer).length;
  return (
    <div id="ai-reading-container" className="w-full max-w-3xl mx-auto space-y-5 pb-24 p-1">
      <div className="flex items-center justify-between gap-2">
        <AnimatedButton type="button" onClick={() => setExamId(null)} className="px-3 py-1.5 rounded-xl reading-soft border border-[var(--ui-line)] text-sm font-bold cursor-pointer">← Danh sách đề</AnimatedButton>
        <label className="flex items-center gap-2 text-xs text-[var(--ui-muted)] cursor-pointer"><input type="checkbox" checked={furi} onChange={e => setFuri(e.target.checked)} /> Furigana</label>
      </div>
      <h1 className="text-lg font-bold text-[var(--ui-ink)]">{exam.title}</h1>
      {submitted && (
        <div role="status" className="reading-surface border border-emerald-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-2">
          <strong className="text-[var(--ui-ink)]">Kết quả: {score}/{total} câu đúng</strong>
          <AnimatedButton type="button" onClick={() => open(exam.id)} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer">Làm lại</AnimatedButton>
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
                <AnimatedButton type="button" onClick={() => setVi(v => ({ ...v, [key]: !v[key] }))} className="text-xs text-indigo-400 font-bold cursor-pointer">{vi[key] ? 'Ẩn bản dịch' : 'Xem bản dịch'}</AnimatedButton>
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
            <AnimatedButton type="button" onClick={submit} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer">Nộp bài</AnimatedButton>
          </div>
        </div>)}
    </div>
  );
}
