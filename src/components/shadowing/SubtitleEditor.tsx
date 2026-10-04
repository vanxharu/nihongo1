import React, { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { parseShadowingSubtitles, parseShadowingTime, readShadowingResponse } from '../../utils/shadowing';
import type { ShadowingCue } from '../../utils/shadowing';

export default function SubtitleEditor({ videoId, title, cues, selected, revision, onChange, onSaved }: {
  videoId: string; title: string; cues: ShadowingCue[]; selected: number; revision: string | null;
  onChange: (cues: ShadowingCue[]) => void; onSaved: (revision: string, title: string) => void;
}) {
  const [name, setName] = useState(title || 'Video Shadowing của tôi');
  const [bulk, setBulk] = useState('');
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('5');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (title) setName(title); }, [title]);
  useEffect(() => {
    const cue = cues[selected];
    setText(cue?.text || ''); setTranslation(cue?.translation || '');
    setStart(String(cue?.start ?? 0)); setEnd(String(cue?.end ?? 5));
  }, [selected, cues]);
  function saveLine(add = false) {
    const from = parseShadowingTime(start), to = parseShadowingTime(end);
    if (!text.trim() || from === null || to === null || to <= from) { setNotice('Nhập câu và thời gian kết thúc lớn hơn bắt đầu.'); return; }
    const previous = !add ? cues[selected] : null;
    const sameText = previous?.text === text.trim();
    const next: ShadowingCue = { id: previous?.id || `manual-${crypto.randomUUID()}`, text: text.trim(), start: from, end: to, translation: translation.trim() };
    if (sameText) next.readings = previous.readings;
    if (sameText && previous.start === from && previous.end === to) next.timings = previous.timings;
    const result = [...cues];
    if (previous) result[selected] = next; else result.push(next);
    onChange(result); setNotice('Đã cập nhật bản nháp. Bấm Lưu vào database để đồng bộ.');
  }
  async function prepareAndSave(prepare: boolean) {
    if (!auth.currentUser) { setNotice('Hãy đăng nhập bằng Google để lưu video và phụ đề của bạn.'); return; }
    if (!cues.length) { setNotice('Thêm ít nhất một câu có mốc thời gian.'); return; }
    setBusy(true); setNotice('');
    try {
      const token = await auth.currentUser.getIdToken();
      let next = [...cues];
      if (prepare) {
        for (let i = 0; i < next.length; i += 25) {
          setNotice(`Đang chuẩn bị cách đọc và bản dịch: ${i}/${next.length} câu…`);
          const response = await fetch('/api/shadowing/prepare', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ cues: next.slice(i, i + 25) }), signal: AbortSignal.timeout(90000) });
          const result = await readShadowingResponse(response);
          if (!response.ok || !Array.isArray(result.cues)) throw new Error(result.error || 'Chưa chuẩn bị được phụ đề.');
          next.splice(i, result.cues.length, ...result.cues);
          onChange([...next]);
        }
      }
      const response = await fetch('/api/shadowing/video', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ videoId, title: name, cues: next, revision }) });
      const result = await readShadowingResponse(response);
      if (!response.ok) throw new Error(result.error || 'Chưa lưu được phụ đề.');
      onSaved(result.revision, name); setNotice(`Đã lưu ${next.length} câu vào database của bạn.`);
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Chưa lưu được dữ liệu. Bản nháp vẫn được giữ.'); }
    finally { setBusy(false); }
  }
  const field = 'w-full rounded-lg border border-slate-600 bg-slate-950 p-2 text-slate-100';
  return <section aria-label="Soạn phụ đề video" className="space-y-3 rounded-xl border border-slate-600 bg-slate-900 p-4">
    <h2 className="font-bold">Soạn phụ đề</h2>
    <label className="block text-sm">Tên video<input className={field} value={name} onChange={e => setName(e.target.value)} /></label>
    <details><summary className="cursor-pointer text-sm">Nhập SRT / VTT hoặc tải file</summary>
      <input type="file" accept=".srt,.vtt,text/plain" aria-label="File phụ đề" onChange={async e => { const file = e.target.files?.[0]; if (file && file.size <= 2_000_000) setBulk(await file.text()); else setNotice('Chọn file phụ đề dưới 2 MB.'); }} />
      <textarea aria-label="Nội dung SRT hoặc VTT" className={`${field} mt-2 min-h-28`} value={bulk} onChange={e => setBulk(e.target.value)} />
      <button className="mt-2 rounded-lg bg-slate-700 p-2" disabled={busy} onClick={() => { const parsed = parseShadowingSubtitles(bulk); if (!parsed.length || parsed.some(c => c.start === null || c.end === null)) { setNotice('Cần phụ đề SRT/VTT có mốc thời gian.'); return; } onChange(parsed); setNotice('Đã nhập phụ đề vào bản nháp.'); }}>Dùng phụ đề này</button>
    </details>
    <p className="text-sm text-slate-400">Câu {selected + 1} · chọn câu trong bản chép để sửa</p>
    <label className="block text-sm">Tiếng Nhật<textarea className={`${field} min-h-20`} disabled={busy} value={text} onChange={e => { setText(e.target.value); setTranslation(''); }} /></label>
    <div className="grid grid-cols-2 gap-2"><label className="text-sm">Bắt đầu (giây / mm:ss)<input className={field} value={start} onChange={e => setStart(e.target.value)} /></label><label className="text-sm">Kết thúc<input className={field} value={end} onChange={e => setEnd(e.target.value)} /></label></div>
    <label className="block text-sm">Nghĩa tiếng Việt<textarea className={field} value={translation} onChange={e => setTranslation(e.target.value)} /></label>
    <div className="flex flex-wrap gap-2"><button className="rounded-lg bg-slate-700 p-2" disabled={busy} onClick={() => saveLine()}>Cập nhật câu</button><button className="rounded-lg bg-slate-700 p-2" disabled={busy} onClick={() => saveLine(true)}>Thêm câu mới</button><button className="rounded-lg bg-slate-700 p-2" disabled={busy || !cues.length} onClick={() => onChange(cues.filter((_, i) => i !== selected))}>Bỏ câu khỏi bản nháp</button></div>
    <div className="flex flex-wrap gap-2"><button className="rounded-lg bg-violet-600 p-2 disabled:opacity-40" disabled={busy} onClick={() => prepareAndSave(true)}>Tạo Furigana, dịch và lưu</button><button className="rounded-lg bg-blue-600 p-2 disabled:opacity-40" disabled={busy} onClick={() => prepareAndSave(false)}>Lưu vào database</button></div>
    {notice && <p role="status" className="text-sm text-amber-200">{notice}</p>}
  </section>;
}
