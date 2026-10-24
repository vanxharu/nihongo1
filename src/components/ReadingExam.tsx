import './readingTheme.css';
import React, { useEffect, useMemo, useState } from 'react';
import exams from '../data/readingExams.json';

type Q = { n: number; q: string; qF: string; options: string[]; optionsF: string[]; answer: number; exp: string };
type Item = { intro?: string; introF?: string; introVi?: string; lines: { jp: string; f: string; vi: string }[]; questions: Q[] };
type Part = { title: string; instruction: string; items: Item[] };
type Exam = { id: string; title: string; level: string; source: string; parts: Part[] };
const EXAMS = exams as Exam[];
const VNJP_ORIGINAL_LINKS = [{"number":1,"title":"Thay đổi giờ học","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-e-1.html"},{"number":2,"title":"Thông báo nghỉ học đột xuất","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-e.html"},{"number":3,"title":"Thông báo trong ký túc xá","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-e-3.html"},{"number":4,"title":"Thông báo nơi làm việc","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-e-4.html"},{"number":5,"title":"Thông báo trong cửa hàng","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee5.html"},{"number":6,"title":"Hướng dẫn sử dụng dịch vụ","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee6.html"},{"number":7,"title":"Lưu ý khi tham gia sự kiện","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee7.html"},{"number":8,"title":"Hướng dẫn đăng ký","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee8.html"},{"number":9,"title":"Email liên lạc công việc","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee9.html"},{"number":10,"title":"Email xin nghỉ làm","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee10.html"},{"number":11,"title":"Email hỏi thông tin","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee11.html"},{"number":12,"title":"Email xác nhận lịch hẹn","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-e12.html"},{"number":13,"title":"Thư cảm ơn","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee13.html"},{"number":16,"title":"Sinh hoạt hằng ngày","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee16.html"},{"number":17,"title":"Kế hoạch cuối tuần","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee17.html"},{"number":18,"title":"Lịch sinh hoạt gia đình","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee18.html"},{"number":19,"title":"Thói quen buổi sáng","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee19.html"},{"number":20,"title":"Cuộc sống du học sinh","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee20.html"},{"number":21,"title":"Chia sẻ trải nghiệm cá nhân","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee21.html"},{"number":22,"title":"Sở thích và thời gian rảnh","url":"https://www.vnjpclub.com/luyen-doc-n4/n4-ee22.html"}];
const MINNA_LESSON_PAGES: Record<number, number> = {
  26:21,27:23,28:25,29:27,30:29,31:33,32:37,33:41,34:45,35:47,
  36:51,37:53,38:57,39:61,40:65,41:69,42:71,43:75,44:79,45:83,
  46:87,47:91,48:95,49:99,50:103
};
const MINNA_APPENDIX_PAGES = [110,112,114,116,118,120,122,124] as const;
const MINNA_REFERENCE_PAGES = [{ page: 126, label: 'Từ vựng bài 34–50' }, { page: 162, label: 'Đáp án chính thức' }, { page: 167, label: 'Hướng dẫn giáo viên' }, { page: 179, label: 'Bìa sau' }] as const;
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
  const [minnaPdfUrl, setMinnaPdfUrl] = useState<string | null>(null);
  const [minnaPage, setMinnaPage] = useState(21);
  const [minnaFileName, setMinnaFileName] = useState('');
  useEffect(() => () => { if (minnaPdfUrl) URL.revokeObjectURL(minnaPdfUrl); }, [minnaPdfUrl]);
  const onMinnaPdf = (file?: File) => {
    if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) return;
    setMinnaPdfUrl(URL.createObjectURL(file));
    setMinnaFileName(file.name);
  };
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
        <div className="reading-surface rounded-xl border border-[var(--ui-line)] p-3 text-sm text-[var(--ui-muted)]">
          <strong className="block text-[var(--ui-ink)]">Luyện đọc N4 theo chủ đề VNJPCLUB</strong>
          <p>Đã thêm bài luyện tập biên soạn mới theo các chủ đề thường gặp. Đọc bài gốc và lời giải tại <a href="https://www.vnjpclub.com/luyen-doc-n4/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline">VNJPCLUB ↗</a>.</p>
        </div>
        <section className="space-y-2"><h2 className="text-base font-bold text-[var(--ui-ink)]">VNJPCLUB · 20 bài đọc gốc</h2><p className="text-xs text-[var(--ui-muted)]">Bài 01 đã nhập vào NIHON. Các bài còn lại mở nội dung nguyên gốc trên VNJPCLUB; chưa được nhập để chấm điểm trực tiếp.</p><div className="grid gap-2 sm:grid-cols-2">{VNJP_ORIGINAL_LINKS.map(b => <a key={b.number} href={b.url} target="_blank" rel="noopener noreferrer" className="reading-surface border border-[var(--ui-line)] rounded-xl p-3 text-sm hover:border-indigo-500"><strong className="block text-[var(--ui-ink)]">Bài {String(b.number).padStart(2,'0')} · {b.title}</strong><span className="text-xs text-indigo-400">Xem bài gốc ↗</span></a>)}</div></section>
        <section className="reading-surface rounded-2xl border border-[var(--ui-line)] p-4 space-y-3">
          <h2 className="text-base font-bold text-[var(--ui-ink)]">Minna no Nihongo II · トピック25 (bài 26–50)</h2>
          <p className="text-xs text-[var(--ui-muted)]">25 bài (26–50) có đề chấm điểm tự động; các câu hỏi hình ảnh hoặc tự luận đôi khi được chuyển thể thành trắc nghiệm. Chọn đúng PDF sách từ máy để mở và so sánh trực tiếp; tệp chỉ được mở trong trình duyệt, không tải lên máy chủ. Số trang bên dưới là trang PDF thực tế.</p>
          <label className="block text-sm font-semibold text-[var(--ui-ink)]">Mở sách PDF trên máy
            <input type="file" accept="application/pdf,.pdf" onChange={e => onMinnaPdf(e.target.files?.[0])} className="mt-2 block w-full text-xs text-[var(--ui-muted)]" />
          </label>
          {minnaFileName && <p className="text-xs text-emerald-500">Đang xem: {minnaFileName}</p>}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {Array.from({ length: 25 }, (_, i) => i + 26).map(n => (
              <button key={n} type="button" onClick={() => setMinnaPage(MINNA_LESSON_PAGES[n])}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold ${minnaPage === MINNA_LESSON_PAGES[n] ? 'border-indigo-500 text-indigo-400' : 'border-[var(--ui-line)] text-[var(--ui-ink)]'}`}>
                Bài {n}<span className="block text-[10px] font-normal text-[var(--ui-muted)]">PDF trang {MINNA_LESSON_PAGES[n]}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--ui-muted)]">Phụ lục từ vựng đa ngôn ngữ (bắt đầu từ trang PDF 110; nội dung từ vựng được số hóa có chọn lọc):</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {MINNA_APPENDIX_PAGES.map(n => (
              <button key={n} type="button" onClick={() => setMinnaPage(n)}
                className={`rounded-lg border px-2 py-1.5 text-xs ${minnaPage === n ? 'border-indigo-500 text-indigo-400' : 'border-[var(--ui-line)] text-[var(--ui-ink)]'}`}>
                Trang {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--ui-muted)]">Các phần còn lại của tài liệu (đã xác minh vị trí theo trang PDF):</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MINNA_REFERENCE_PAGES.map(({ page, label }) => (
              <button key={page} type="button" onClick={() => setMinnaPage(page)}
                className={`rounded-lg border px-2 py-2 text-xs ${minnaPage === page ? 'border-indigo-500 text-indigo-400' : 'border-[var(--ui-line)] text-[var(--ui-ink)]'}`}>
                {label}<span className="block text-[10px] opacity-75">PDF trang {page}</span>
              </button>
            ))}
          </div>
          {minnaPdfUrl && <iframe key={minnaPage} title="Minna no Nihongo II Topikku 25" src={`${minnaPdfUrl}#page=${minnaPage || 1}`} className="w-full rounded-lg border border-[var(--ui-line)]" style={{ height: 'min(75vh, 780px)' }} />}
        </section>
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
