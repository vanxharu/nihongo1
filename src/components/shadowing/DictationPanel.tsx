import React, { useMemo, useState } from 'react';
import { Eye, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { dictationChunks, normalizeDictation, shuffledChunkIds } from '../../utils/shadowing';
import { playCorrectSound, playIncorrectSound } from '../../utils/audio';

interface Props {
  sentence: string;
  autoPause: boolean;
  onAutoPause: (value: boolean) => void;
  onPlay: () => boolean;
  onReveal: (value: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export default function DictationPanel(props: Props) {
  const [mode, setMode] = useState<'typing' | 'chunks'>('typing');
  const [answer, setAnswer] = useState('');
  const [picked, setPicked] = useState<number[]>([]);
  const [hints, setHints] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [replays, setReplays] = useState(0);
  const [feedback, setFeedback] = useState('Hãy bắt đầu nghe và gõ lại câu bạn nghe được.');
  const [correct, setCorrect] = useState(false);
  const chunks = useMemo(() => dictationChunks(props.sentence), [props.sentence]);
  const order = useMemo(() => shuffledChunkIds(chunks.length), [chunks]);
  const value = mode === 'typing' ? answer : picked.map(id => chunks[id]).join('');
  function edit() { setCorrect(false); props.onReveal(false); }
  function check() {
    if (!normalizeDictation(value) || !normalizeDictation(props.sentence)) return;
    const matched = normalizeDictation(value) === normalizeDictation(props.sentence);
    setCorrect(matched); props.onReveal(matched);
    if (matched) { playCorrectSound(); setFeedback('Chính xác! Bạn có thể chuyển sang câu tiếp theo.'); }
    else { playIncorrectSound(); setMistakes(n => n + 1); setFeedback('Chưa khớp lời thoại. Hãy nghe lại, kiểm tra từ còn thiếu hoặc dùng gợi ý từng từ.'); }
  }
  function listen(replay: boolean) {
    if (props.onPlay() && replay) setReplays(n => n + 1);
  }
  const small = 'inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-600 px-2 disabled:opacity-40';
  return <div className="space-y-3">
    <section className="dictation-panel rounded-xl border border-slate-600 p-3">
      <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold">CHÉP CHÍNH TẢ</h2><label className="flex items-center gap-2 text-xs">Tự ngắt câu<input type="checkbox" role="switch" checked={props.autoPause} onChange={e => props.onAutoPause(e.target.checked)} /></label></div>
      <div className="my-3 flex gap-2 rounded-lg border border-slate-700 p-2">
        <button className={small} aria-label="Câu chính tả trước" disabled={!props.hasPrevious} onClick={props.onPrevious}><SkipBack size={16} /></button>
        <button className={small} aria-label="Nghe lại câu chính tả" disabled={!props.sentence} onClick={() => listen(true)}><RotateCcw size={16} /></button>
        <button className={small} aria-label="Phát câu chính tả" disabled={!props.sentence} onClick={() => listen(false)}><Play size={16} /></button>
        <button className={small} aria-label="Câu chính tả tiếp" disabled={!props.hasNext} onClick={props.onNext}><SkipForward size={16} /></button>
      </div>
      <div role="tablist" aria-label="Cách làm chính tả" className="mb-3 flex rounded-lg border border-slate-600 p-1">{([['typing', 'Gõ chính tả'], ['chunks', 'Ghép câu']] as const).map(([id, label]) => <button key={id} role="tab" aria-selected={mode === id} className={`min-h-10 flex-1 rounded-md text-sm ${mode === id ? 'bg-blue-600 text-white' : 'text-slate-400'}`} onClick={() => { setMode(id); edit(); setFeedback(id === 'chunks' ? 'Chạm các mảnh để ghép thành câu bạn nghe được.' : 'Gõ lại câu bạn nghe được.'); }}>{label}</button>)}</div>
      {mode === 'typing' ? <><label htmlFor="dictation-answer" className="mb-2 block text-xs text-slate-400">GÕ NHỮNG GÌ BẠN NGHE ĐƯỢC:</label><textarea id="dictation-answer" value={answer} maxLength={2000} rows={4} placeholder="Gõ câu trả lời của bạn tại đây…" className="w-full rounded-lg border border-slate-600 bg-[#101010] p-3 text-sm focus:border-blue-400 focus:outline-none" onChange={e => { setAnswer(e.target.value); edit(); }} />
        <div className="mt-3 flex flex-wrap gap-2">{chunks.map((word, index) => <button key={index} aria-label={`Gợi ý từ ${index + 1}`} aria-pressed={hints.includes(index)} className={`${small} flex-col gap-1 text-xs`} onClick={() => setHints(current => current.includes(index) ? current.filter(i => i !== index) : [...current, index])}><Eye size={12} />{hints.includes(index) ? word : '•'.repeat(Math.min(Array.from(word).length, 8))}</button>)}</div><p className="mt-2 text-xs text-slate-400">Bấm biểu tượng con mắt để hiện từng từ.</p></> : <><p className="mb-2 text-xs text-slate-400">CHẠM CÁC MẢNH ĐỂ GHÉP THÀNH CÂU:</p><div className="flex min-h-24 flex-wrap items-start gap-2 rounded-lg border border-slate-600 p-2">{picked.map((id, index) => <button key={id} className={small} aria-label={`Bỏ mảnh ${index + 1}: ${chunks[id]}`} onClick={() => { setPicked(current => current.filter(item => item !== id)); edit(); }}>{chunks[id]}</button>)}{!picked.length && <span className="text-xs text-slate-500">Chọn từ bên dưới · bấm mảnh đã chọn để bỏ</span>}</div><div className="my-3 flex flex-wrap gap-2">{order.map(id => <button key={id} className={small} disabled={picked.includes(id)} onClick={() => { setPicked(current => [...current, id]); edit(); }}>{chunks[id]}</button>)}</div><button className="mb-2 text-xs text-slate-400 underline" onClick={() => { setPicked([]); edit(); }}>Xếp lại từ đầu</button></>}
      <button disabled={!normalizeDictation(value) || !normalizeDictation(props.sentence)} onClick={check} className="mt-3 min-h-11 w-full rounded-lg bg-amber-400 text-sm font-bold text-slate-950 disabled:opacity-40">KIỂM TRA ĐÁP ÁN</button>
      <button disabled={!props.hasNext} onClick={props.onNext} className="mt-2 min-h-11 w-full rounded-lg bg-blue-600 text-sm font-bold disabled:opacity-40">TIẾP THEO ▷</button>
      {!!props.sentence && !correct && <button className="mt-3 text-xs text-slate-400 underline" onClick={() => { props.onReveal(true); setFeedback('Đã hiện lời thoại để đối chiếu.'); }}>Hiện lời thoại để đối chiếu</button>}
      {!props.sentence && <p className="mt-3 text-xs text-amber-300">Tải hoặc nhập phụ đề để bắt đầu.</p>}
    </section>
    <div className="grid grid-cols-2 gap-2"><div className="dictation-panel rounded-lg border border-slate-600 p-3"><p className="text-xs text-red-300">Lỗi sai</p><strong aria-label="Số lần trả lời sai">{mistakes}</strong></div><div className="dictation-panel rounded-lg border border-slate-600 p-3"><p className="text-xs text-blue-300">Lượt phát lại</p><strong aria-label="Số lượt phát lại">{replays}</strong></div></div>
    <p role="status" className={`dictation-panel rounded-lg border p-3 text-sm ${correct ? 'border-emerald-500 text-emerald-300' : 'border-slate-600 text-amber-200'}`}>{feedback}</p>
  </div>;
}
