import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KANJI_MASTER_N4, masterKanjiInfo, type MasterLesson, type MasterWord } from '../data/kanjiMasterN4';

type Attempt = { id: string; lesson: string; mode: string; score: number; total: number; at: string };
type Progress = { current: string | null; step: 'learn' | 'write' | 'quiz'; index: number; learned: string[]; written: string[]; attempts: Attempt[]; reviews: Record<string, { due: string; interval: number; misses: number }>; reports: { lesson: string; kanji: string; note: string; at: string }[] };
const KEY = 'nihongo_kanji_n4_progress_v2';
const empty = (): Progress => ({ current: null, step: 'learn', index: 0, learned: [], written: [], attempts: [], reviews: {}, reports: [] });
function read(): Progress { try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); return p && typeof p === 'object' ? { ...empty(), ...p } : empty(); } catch { return empty(); } }
const unique = (xs: string[]) => [...new Set(xs)];
const shuffle = <T,>(xs: T[]) => [...xs].sort(() => Math.random() - .5);
const hasKanji = (s: string) => /[\u3400-\u9fff]/.test(s);
const allWords = KANJI_MASTER_N4.flatMap(l => l.words).filter(w => hasKanji(w.word) && w.reading);
function speak(text: string, rate: number) { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = rate; speechSynthesis.speak(u); }
function Canvas({ onComplete }: { onComplete: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const active = useRef(false);
  const [drawn, setDrawn] = useState(false);
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => { const el = canvas.current!; const rect = el.getBoundingClientRect(); return { x: (e.clientX - rect.left) * el.width / rect.width, y: (e.clientY - rect.top) * el.height / rect.height }; };
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => { e.currentTarget.setPointerCapture(e.pointerId); active.current = true; const p = point(e); const ctx = canvas.current!.getContext('2d')!; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineWidth = 8; ctx.strokeStyle = '#0f766e'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineTo(p.x + .1, p.y + .1); ctx.stroke(); setDrawn(true); };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => { if (!active.current) return; const p = point(e); const ctx = canvas.current!.getContext('2d')!; ctx.lineTo(p.x, p.y); ctx.stroke(); };
  return <div className="space-y-3"><canvas ref={canvas} width={320} height={320} onPointerDown={start} onPointerMove={move} onPointerUp={() => active.current = false} onPointerCancel={() => active.current = false} className="w-full max-w-80 mx-auto aspect-square bg-white border-2 border-dashed rounded-2xl touch-none" aria-label="Bảng luyện viết Kanji"/><div className="flex gap-2"><button className="flex-1 rounded-xl border py-3" onClick={() => { canvas.current?.getContext('2d')?.clearRect(0,0,320,320); setDrawn(false); }}>Viết lại</button><button disabled={!drawn} className="flex-1 rounded-xl bg-teal-700 text-white py-3 disabled:opacity-40" onClick={onComplete}>Đã tự đối chiếu ✓</button></div><p className="text-xs text-slate-500">Tự đối chiếu với mẫu. Không tự chấm thứ tự nét khi PDF không cung cấp dữ liệu nét.</p></div>;
}
export default function KanjiMasterN4() {
  const [p, setP] = useState<Progress>(read);
  const [lessonId, setLessonId] = useState<string | null>(() => read().current);
  const [step, setStep] = useState<Progress['step']>(() => read().step);
  const [idx, setIdx] = useState(() => read().index);
  const [rate, setRate] = useState(.85);
  const [mode, setMode] = useState<'read'|'write'|'mixed'>('mixed');
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [run, setRun] = useState(0);
  const [report, setReport] = useState(false);
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [dueOnly, setDueOnly] = useState(false);
  const lesson = KANJI_MASTER_N4.find(l => l.id === lessonId);
  const save = (fn: (prev: Progress) => Progress) => setP(prev => fn(prev));
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ } }, [p]);
  useEffect(() => { save(old => ({ ...old, current: lessonId, step, index: idx })); }, [lessonId, step, idx]);
  const today = new Date().toISOString();
  const due = Object.entries(p.reviews).filter(([,r]) => r.due <= today).length;
  const completed = KANJI_MASTER_N4.filter(l => l.kanji.every(k => p.learned.includes(k) && p.written.includes(k)) && p.attempts.some(a => a.lesson === l.id && a.mode === 'mixed' && a.total > 0 && a.score / a.total >= .8));
  const words = useMemo(() => lesson?.words.filter(w => hasKanji(w.word) && w.reading) || [], [lesson]);
  const questions = useMemo(() => {
    if (!lesson) return [];
    const source = mode === 'mixed' ? shuffle(words).map((w,i) => ({ w, kind: i % 2 ? 'write' : 'read' })) : shuffle(words).map(w => ({ w, kind: mode }));
    return source.map(({w,kind}) => { const correct = kind === 'read' ? w.reading : w.word; const pool = unique(shuffle(allWords.filter(x => x.word !== w.word).map(x => kind === 'read' ? x.reading : x.word))).filter(Boolean).filter(x => x !== correct).slice(0,3); return { word: w.word, prompt: kind === 'read' ? w.word : w.reading, correct, options: shuffle([correct, ...pool]), kind }; });
  }, [lessonId, mode, run]);
  const open = (l: MasterLesson) => { setLessonId(l.id); setStep('learn'); setIdx(0); setAnswers([]); setSelected(null); };
  const markReview = (kanji: string, correct: boolean) => save(old => { const previous = old.reviews[kanji]; const interval = correct ? Math.min(60, Math.max(1, (previous?.interval || 0) * 2)) : 1; const dueAt = new Date(Date.now() + interval * 86400000).toISOString(); return { ...old, reviews: { ...old.reviews, [kanji]: { due: dueAt, interval, misses: (previous?.misses || 0) + (correct ? 0 : 1) } } }; });
  const submit = () => { if (!lesson || !questions.length) return; const score = answers.filter(Boolean).length; const attempt: Attempt = { id: `${Date.now()}-${Math.random()}`, lesson: lesson.id, mode, score, total: questions.length, at: new Date().toISOString() }; save(old => ({ ...old, attempts: [...old.attempts, attempt] })); setRun(r => r + 1); setAnswers([]); setSelected(null); setStep('learn'); setIdx(0); window.alert(`Kết quả: ${score}/${questions.length} (${Math.round(score/questions.length*100)}%). ${mode === 'mixed' && score/questions.length >= .8 ? 'Đạt yêu cầu kiểm tra.' : 'Có thể luyện lại bất kỳ lúc nào.'}`); };
  const totalKanji = unique(KANJI_MASTER_N4.flatMap(l => l.kanji)).length;
  if (!lesson) return <div className="space-y-5 text-slate-800">
    <div className="rounded-3xl bg-gradient-to-br from-teal-800 to-cyan-700 text-white p-5"><p className="text-sm opacity-80">KANJI MASTER · N4</p><h2 className="text-2xl font-black mt-1">Học theo nhịp của bạn</h2><div className="grid grid-cols-3 gap-2 mt-5 text-center"><div><b className="text-xl">{completed.length}/{KANJI_MASTER_N4.length}</b><p className="text-xs">Bài hoàn thành</p></div><div><b className="text-xl">{p.learned.length}/{totalKanji}</b><p className="text-xs">Kanji đã học</p></div><div><b className="text-xl">{due}</b><p className="text-xs">Đến hạn ôn</p></div></div><div className="h-2 bg-white/25 rounded-full mt-4"><div className="h-full bg-white rounded-full" style={{width:`${completed.length/KANJI_MASTER_N4.length*100}%`}} /></div></div>
    <div className="grid grid-cols-2 gap-3"><button className="rounded-2xl bg-teal-50 text-teal-900 p-4 text-left font-bold" onClick={() => { const l = KANJI_MASTER_N4.find(x => x.id === p.current) || KANJI_MASTER_N4[0]; if (l) { setLessonId(l.id); setStep(p.step); setIdx(p.index); } }}>▶ Tiếp tục học</button><button className="rounded-2xl bg-amber-50 text-amber-900 p-4 text-left font-bold" onClick={() => setDueOnly(v => !v)}>↻ Ôn ngay · {due}</button></div>
    <input className="w-full rounded-xl border px-4 py-3" placeholder="Tìm chữ Kanji, nghĩa hoặc bài học..." value={search} onChange={e => setSearch(e.target.value)} />
    {dueOnly && <div className="rounded-xl bg-amber-50 p-3 text-sm">Kanji đến hạn: {Object.keys(p.reviews).filter(k => p.reviews[k].due <= today).join('、') || 'Chưa có chữ đến hạn.'} <button className="underline ml-2" onClick={() => setDueOnly(false)}>Xem tất cả</button></div>}
    {unique(KANJI_MASTER_N4.map(l => String(l.chapter))).map(ch => <section key={ch} className="space-y-2"><h3 className="font-bold">Chương {ch}</h3><div className="grid sm:grid-cols-2 gap-2">{KANJI_MASTER_N4.filter(l => String(l.chapter) === ch).filter(l => !search || `${l.title} ${l.kanji.join('')} ${l.words.map(w => w.meaning).join(' ')}`.toLowerCase().includes(search.toLowerCase())).map(l => <button key={l.id} onClick={() => open(l)} className="rounded-xl border bg-white p-4 text-left hover:border-teal-500"><div className="flex justify-between"><b>Bài {l.id} · {l.title}</b>{completed.some(c => c.id === l.id) && <span className="text-teal-700">✓</span>}</div><div className="text-xl mt-2">{l.kanji.join(' ')}</div></button>)}</div></section>)}
    <p className="text-xs text-slate-500">Dữ liệu tiến độ lưu trên thiết bị. Đồng bộ tài khoản cần tích hợp với cơ chế xác thực hiện có.</p>
  </div>;
  const char = lesson.kanji[Math.min(idx, lesson.kanji.length - 1)];
  const info = masterKanjiInfo(char);
  const q = questions[answers.length];
  return <div className="space-y-4 text-slate-800"><button onClick={() => setLessonId(null)} className="text-sm text-teal-700 font-bold">← Về trang Kanji</button><h2 className="text-xl font-black">Bài {lesson.id}: {lesson.title}</h2><div className="grid grid-cols-3 gap-2 text-xs font-bold">{(['learn','write','quiz'] as const).map((s,i) => <button key={s} onClick={() => {setStep(s);setIdx(0);setAnswers([]);setSelected(null);}} className={`rounded-xl py-3 ${step === s ? 'bg-teal-700 text-white' : 'bg-slate-100'}`}>{i+1}. {['Học chữ','Luyện viết','Kiểm tra'][i]}</button>)}</div>
    {step !== 'quiz' && <><div className="text-xs text-slate-500 text-center">{idx+1}/{lesson.kanji.length}</div><div className="rounded-3xl border bg-white p-6 text-center"><div className="text-8xl font-black">{char}</div><div className="mt-3 text-lg font-bold">{info?.han_viet || '—'} · {info?.meaning || 'Chưa có dữ liệu'}</div><p className="text-sm mt-2">音 {info?.onyomi || '—'} · 訓 {info?.kunyomi || '—'}</p><div className="flex justify-center gap-3 mt-4"><button className="rounded-xl bg-slate-100 px-4 py-2" onClick={() => speak(char,rate)}>🔊 Nghe</button><select aria-label="Tốc độ phát âm" value={rate} onChange={e => setRate(Number(e.target.value))} className="rounded-xl border px-2"><option value={.65}>Chậm</option><option value={.85}>Vừa</option><option value={1}>Bình thường</option></select></div></div>
    {step === 'learn' && <><div className="space-y-2">{lesson.words.filter(w => w.word.includes(char)).map(w => <div key={w.word} className="flex justify-between gap-2 rounded-xl bg-slate-50 p-3"><div><b>{w.word}</b> · {w.reading}<div className="text-sm">{w.meaning}</div></div><button aria-label={`Nghe ${w.word}`} onClick={() => speak(w.word,rate)}>🔊</button></div>)}</div><button className="w-full rounded-xl bg-teal-700 text-white py-3 font-bold" onClick={() => { save(old => ({...old,learned:unique([...old.learned,char])})); if (idx+1 < lesson.kanji.length) setIdx(i => i+1); else {setIdx(0);setStep('write');} }}>Đã học · Tiếp tục →</button></>}
    {step === 'write' && <Canvas key={char} onComplete={() => {save(old => ({...old,written:unique([...old.written,char])})); if (idx+1 < lesson.kanji.length) setIdx(i => i+1); else {setIdx(0);setStep('quiz');}}}/>}</>}
    {step === 'quiz' && <div className="space-y-4"><div className="flex gap-2 flex-wrap">{(['read','write','mixed'] as const).map(m => <button key={m} onClick={() => {setMode(m);setAnswers([]);setSelected(null);}} className={`rounded-lg px-3 py-2 text-sm ${mode === m ? 'bg-teal-700 text-white' : 'bg-slate-100'}`}>{({read:'Chọn cách đọc',write:'Chọn chữ Hán',mixed:'Kiểm tra hỗn hợp'})[m]}</button>)}</div>{q ? <><p className="text-xs">Câu {answers.length+1}/{questions.length}</p><div className="text-4xl text-center font-black py-5">{q.prompt}</div><div className="grid grid-cols-2 gap-2">{q.options.map(o => <button key={o} disabled={selected !== null} onClick={() => {setSelected(o);markReview(q.word,o === q.correct);}} className={`rounded-xl border-2 p-3 font-bold ${selected !== null && o === q.correct ? 'border-emerald-500 bg-emerald-50' : selected === o ? 'border-rose-500 bg-rose-50' : 'bg-white'}`}>{o}</button>)}</div>{selected !== null && <><p className="text-sm">{selected === q.correct ? '✓ Chính xác!' : `Chưa đúng. Đáp án: ${q.correct}`}</p><button className="w-full rounded-xl bg-teal-700 text-white py-3" onClick={() => {setAnswers(a => [...a,selected === q.correct]);setSelected(null);}}>Câu tiếp theo →</button></>}</> : <button onClick={submit} className="w-full rounded-xl bg-teal-700 text-white py-3">Xem kết quả và lưu lịch sử</button>}</div>}
    <div className="border-t pt-4"><button className="text-sm text-slate-500 underline" onClick={() => setReport(v => !v)}>Báo lỗi nội dung</button>{report && <div className="space-y-2 mt-2"><textarea className="w-full rounded-xl border p-3" placeholder="Mô tả lỗi và vị trí trong PDF" value={note} onChange={e => setNote(e.target.value)}/><button disabled={!note.trim()} className="rounded-xl bg-slate-800 text-white px-4 py-2 disabled:opacity-40" onClick={() => {save(old => ({...old,reports:[...old.reports,{lesson:lesson.id,kanji:char,note,at:new Date().toISOString()}]}));setReport(false);setNote('');}}>Lưu báo cáo trên thiết bị</button></div>}</div>
  </div>;
}