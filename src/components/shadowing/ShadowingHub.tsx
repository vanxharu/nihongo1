import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Headphones, Link2, Download, Loader2 } from 'lucide-react';
import { DEFAULT_YOUTUBE_LISTENING_VIDEOS } from '../../data/youtubeListeningSeedData';
import { formatDuration } from '../../utils/youtubeUtils';
import { parseShadowingVideoId, parseShadowingTime, parseShadowingSubtitles, ShadowingCue, ShadowingAnalysis } from '../../utils/shadowing';
import ShadowingPlayer, { ShadowingPlayerHandle } from './ShadowingPlayer';
import KaraokeCaption from './KaraokeCaption';
import DictationPanel from './DictationPanel';
import { activeShadowingCue, readShadowingResponse } from '../../utils/shadowing';
import './shadowing.css';

const field = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 focus:border-amber-400 focus:outline-none';
const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 text-sm font-semibold hover:bg-slate-700 disabled:opacity-40';

export default function ShadowingHub() {
  const [params, setParams] = useSearchParams();
  const videoId = parseShadowingVideoId(params.get('v') || '');
  const [urlInput, setUrlInput] = useState(params.get('v') || '');
  const [cues, setCues] = useState<ShadowingCue[]>([]);
  const [selected, setSelected] = useState(0);
  const [sentence, setSentence] = useState('');
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('10');
  const [currentTime, setCurrentTime] = useState(0);
  const [importText, setImportText] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const transcriptRequest = useRef<AbortController | null>(null);
  const currentVideo = useRef(videoId);
  currentVideo.current = videoId;
  const playerRef = useRef<ShadowingPlayerHandle>(null);
  const [furigana, setFurigana] = useState(true);
  const [translation, setTranslation] = useState(true);
  const [mode, setMode] = useState<'shadowing' | 'dictation'>('shadowing');
  const [autoPause, setAutoPause] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [category, setCategory] = useState('Tất cả');
  const cache = useRef(new Map<string, ShadowingAnalysis>());
  const active = activeShadowingCue(cues, currentTime);
  const displayed = mode === 'dictation' ? cues[selected] : active >= 0 ? cues[active] : cues[selected];
  const displayedAnalysis = displayed ? cache.current.get(displayed.text) || null : null;
  useEffect(() => {
    if (active >= 0 && mode !== 'dictation' && active !== selected) {
      selectCue(active);
      const card = document.getElementById(`shadowing-cue-${active}`);
      const container = card?.parentElement;
      if (card && container) container.scrollTo({ top: card.offsetTop - container.offsetTop, behavior: 'smooth' });
    }
  }, [active]);

  function selectCue(index: number, source = cues) {
    const cue = source[index];
    if (!cue) return;
    setSelected(index); setSentence(cue.text); setRevealed(false);
    if (cue.start !== null && cue.end !== null) { setStart(String(cue.start)); setEnd(String(cue.end)); }
  }

  useEffect(() => {
    transcriptRequest.current?.abort();
    setLoading(false); setCues([]); setSentence(''); setSelected(0);
    setImportText(''); setNotice(''); setCurrentTime(0); setStart('0'); setEnd('10');
    setRevealed(false);
    if (videoId) {
      setUrlInput(`https://www.youtube.com/watch?v=${videoId}`);
      let restored = false;
      try {
        const saved = JSON.parse(localStorage.getItem(`shadowing-cues:${videoId}`) || '[]');
        if (Array.isArray(saved) && saved.length && saved.every(c => c && typeof c.text === 'string' && typeof c.id === 'string' && (c.start === null || Number.isFinite(c.start)) && (c.end === null || Number.isFinite(c.end)))) {
          setCues(saved.slice(0, 500)); selectCue(0, saved);
          restored = true;
        }
      } catch {}
      if (!restored) void loadCaptions();
    }
    return () => { transcriptRequest.current?.abort(); };
  }, [videoId]);

  function applyCues(next: ShadowingCue[]) {
    setCues(next); selectCue(0, next);
    if (videoId) { try { localStorage.setItem(`shadowing-cues:${videoId}`, JSON.stringify(next)); } catch {} }
  }

  function chooseVideo(input: string) {
    const id = parseShadowingVideoId(input);
    if (!id) { setNotice('Nhập link YouTube hợp lệ hoặc ID video gồm 11 ký tự.'); return; }
    setParams({ v: id });
  }

  async function loadCaptions() {
    if (!videoId) return;
    transcriptRequest.current?.abort();
    const controller = new AbortController(); transcriptRequest.current = controller;
    const timer = setTimeout(() => controller.abort('timeout'), 40000);
    setLoading(true); setNotice('');
    try {
      const res = await fetch(`/api/shadowing/transcript?videoId=${videoId}`, { signal: controller.signal });
      const data = await readShadowingResponse(res);
      if (!res.ok) throw new Error(data.error || 'Không lấy được phụ đề.');
      if (!Array.isArray(data.cues) || !data.cues.length) throw new Error('Video không có phụ đề tiếng Nhật.');
      if (controller.signal.aborted) return;
      applyCues(data.cues);
    } catch (error) {
      if (!controller.signal.aborted) setNotice(error instanceof Error ? error.message : 'Không lấy được phụ đề.');
      else if (controller.signal.reason === 'timeout') setNotice('Tải phụ đề quá lâu. Hãy thử lại hoặc nhập lời thoại bên dưới.');
    } finally {
      clearTimeout(timer);
      if (transcriptRequest.current === controller) setLoading(false);
    }
  }

  function importCaptions(text: string) {
    transcriptRequest.current?.abort(); setLoading(false);
    try {
      const next = parseShadowingSubtitles(text);
      if (!next.length) throw new Error('Chưa có lời thoại để nhập.');
      applyCues(next); setNotice(`Đã nhập ${next.length} câu. ${next[0].start === null ? 'Lời thoại chưa có thời gian; hãy đặt mốc cho đoạn luyện.' : 'Chọn một câu để luyện theo mốc phụ đề.'}`);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Không đọc được phụ đề.'); }
  }

  function jumpCue(index: number) {
    if (!cues[index]) return;
    playerRef.current?.pause();
    selectCue(index);
    const cue = cues[index];
    if (mode === 'dictation') playerRef.current?.playSentence(cue.start, cue.end, autoPause);
    else if (cue?.start !== null && cue?.start !== undefined) playerRef.current?.seek(cue.start);
  }
  const library = DEFAULT_YOUTUBE_LISTENING_VIDEOS.filter(v => v.status === 'active');
  const sources = [...new Set(library.map(v => v.source))];
  const sourceTitle = DEFAULT_YOUTUBE_LISTENING_VIDEOS.find(v => v.youtube_video_id === videoId)?.title;
  return <div className="shadowing-page mx-auto max-w-7xl space-y-5 px-4 py-5 pb-28 text-slate-100 sm:px-6">
    {!videoId && <header className="shadowing-banner rounded-2xl p-5 sm:p-7">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300"><Headphones size={16} /> Nghe · nhại · hiểu</span>
      <h1 className="mt-2 text-3xl font-black">ようこそ! Shadowing & Chép chính tả</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">Nghe một đoạn YouTube, nhại lại theo nhịp và ngữ điệu, luyện nghe và chép chính tả theo từng câu.</p>
      <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={e => { e.preventDefault(); chooseVideo(urlInput); }}>
        <label className="sr-only" htmlFor="shadowing-youtube">Đường dẫn video YouTube</label>
        <input id="shadowing-youtube" className={field} value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Dán link YouTube hoặc ID video…" />
        <button className={`${button} shrink-0 bg-amber-400 text-slate-950 hover:bg-amber-300`}><Link2 size={16} />Mở video</button>
      </form>
    </header>}
    {notice && <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{notice}</p>}
    {!videoId ? <section className="space-y-6">
      <div><h2 className="text-2xl font-black">Shadowing & Chép chính tả</h2><p className="mt-2 text-sm text-slate-300">Nghe từng câu, bắt chước phát âm và chép chính tả từ video YouTube.</p></div>
      {library[0] && category === 'Tất cả' && <div className="grid items-center gap-5 md:grid-cols-2"><button onClick={() => chooseVideo(library[0].youtube_video_id)} aria-label="Mở bài luyện nổi bật" className="overflow-hidden rounded-xl"><img src={library[0].thumbnail} alt={library[0].title} className="aspect-video w-full object-cover" /></button><div><span className="text-xs font-bold uppercase tracking-widest text-violet-300">Bắt đầu luyện</span><h3 className="mt-2 text-xl font-bold">{library[0].title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-300">{library[0].description}</p><button className={`${button} mt-4 bg-violet-600`} onClick={() => chooseVideo(library[0].youtube_video_id)}>▶ Luyện cùng video</button></div></div>}
      <nav aria-label="Nguồn video" className="flex gap-2 overflow-x-auto border-b border-slate-500/30 pb-3">{['Tất cả', ...sources].map(source => <button key={source} onClick={() => setCategory(source)} className={`shrink-0 rounded-lg px-3 py-2 text-sm ${category === source ? 'bg-violet-500 text-white' : 'bg-slate-950/40 text-slate-300'}`}>{source}</button>)}</nav>
      {sources.filter(source => category === 'Tất cả' || category === source).map(source => <section key={source}><h3 className="mb-3 font-bold">{source}</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{library.filter(v => v.source === source).map(v => <button key={v.id} onClick={() => chooseVideo(v.youtube_video_id)} className="overflow-hidden rounded-xl bg-slate-950/40 text-left hover:ring-2 hover:ring-violet-400"><div className="relative"><img src={v.thumbnail} alt="" loading="lazy" className="aspect-video w-full object-cover" /><span className="absolute bottom-2 right-2 rounded bg-black/80 px-1 text-xs">{v.duration}</span></div><div className="p-3"><h4 className="line-clamp-2 text-sm font-bold">{v.title}</h4><p className="mt-2 text-xs text-slate-400">{v.level} · Luyện từng câu</p></div></button>)}</div></section>)}
    </section> : <>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2"><button onClick={() => setParams({})} className={button}>‹ Thư viện</button><button onClick={() => { setMode('shadowing'); setRevealed(false); }} className={`${button} ${mode === 'shadowing' ? 'bg-blue-600' : ''}`}>Bắt chước phát âm</button><button onClick={() => { setMode('dictation'); setRevealed(false); }} className={`${button} ${mode === 'dictation' ? 'bg-blue-600' : ''}`}>Nghe · Viết chính tả</button></div>
          {sourceTitle && <h2 className="text-sm font-semibold text-slate-300">{sourceTitle}</h2>}
          <ShadowingPlayer ref={playerRef} key={videoId} videoId={videoId} start={parseShadowingTime(start)} end={parseShadowingTime(end)} sentenceKey={sentence} onTime={setCurrentTime} compact={mode === 'dictation'} />

          {(mode === 'shadowing' || revealed) && <section className="rounded-xl border border-slate-600 bg-[#101010] p-5">
            <div className="mb-3 flex justify-end gap-3 text-xs"><label><input type="checkbox" checked={furigana} onChange={e => setFurigana(e.target.checked)} /> Furigana</label><label><input type="checkbox" checked={translation} onChange={e => setTranslation(e.target.checked)} /> Bản dịch</label></div>
            <KaraokeCaption text={displayed?.text || sentence || 'Tải hoặc nhập phụ đề để bắt đầu'} time={currentTime} start={displayed?.start ?? parseShadowingTime(start)} end={displayed?.end ?? parseShadowingTime(end)} analysis={displayedAnalysis} furigana={furigana} />{translation && displayedAnalysis?.translation && <p className="mt-3 text-center text-sm text-slate-300">{displayedAnalysis.translation}</p>}
            {mode === 'dictation' && revealed && <button className="mt-3 text-sm underline" onClick={() => setRevealed(false)}>Ẩn đáp án</button>}
            <p className="mt-3 text-center text-[11px] text-slate-500">Màu chữ chạy theo mốc từng câu; nhịp trong câu được ước lượng. </p>
          </section>}
          <details className="rounded-2xl border border-slate-700 bg-slate-900 p-4"><summary className="cursor-pointer font-bold">Tải / nhập phụ đề</summary>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">Lời thoại & phụ đề</h2><button className={button} disabled={loading} onClick={loadCaptions}>{loading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}Tải phụ đề Nhật</button></div>
            <p className="mb-3 text-xs leading-relaxed text-slate-400">Chọn câu để đặt đoạn luyện. Nếu YouTube không cung cấp phụ đề, dán lời thoại (mỗi dòng một câu) hoặc nhập file SRT/VTT của video.</p>
            <label className="sr-only" htmlFor="shadowing-import">Lời thoại hoặc phụ đề SRT/VTT</label>
            <textarea id="shadowing-import" value={importText} onChange={e => setImportText(e.target.value)} className={field} rows={3} placeholder="Dán lời thoại hoặc nội dung SRT/VTT…" maxLength={50000} />
            <div className="my-3 flex flex-wrap gap-2"><button className={button} onClick={() => importCaptions(importText)}>Dùng lời thoại</button><label className={`${button} cursor-pointer`}>Nhập SRT/VTT<input type="file" accept=".srt,.vtt,.txt" className="sr-only" onChange={async e => {
              const file = e.target.files?.[0]; e.target.value = '';
              if (!file) return;
              if (file.size > 150000) { setNotice('File quá lớn. Hãy nhập tối đa 150 KB.'); return; }
              const fileVideo = videoId;
              try { const text = await file.text(); if (currentVideo.current !== fileVideo) return; setImportText(text); importCaptions(text); } catch { if (currentVideo.current === fileVideo) setNotice('Không đọc được file phụ đề.'); }
            }} /></label></div>
          </details>

        </div>
        <div className="space-y-4">
          {mode === 'dictation' && <DictationPanel key={`${videoId}:${selected}:${sentence}`} sentence={sentence} autoPause={autoPause} onAutoPause={value => { playerRef.current?.pause(); setAutoPause(value); }} onPlay={() => playerRef.current?.playSentence(parseShadowingTime(start), parseShadowingTime(end), autoPause) || false} onReveal={setRevealed} onPrevious={() => jumpCue(selected - 1)} onNext={() => jumpCue(selected + 1)} hasPrevious={selected > 0} hasNext={selected < cues.length - 1} />}
          {(mode === 'shadowing' || revealed) && <>
          <section className="rounded-xl bg-[#101010] p-3"><h2 className="mb-3 text-sm font-bold">BẢN CHÉP · {cues.length} câu</h2>            <div className="shadowing-transcript space-y-2 overflow-y-auto">{cues.map((cue, i) => {
              const active = cue.start !== null && cue.end !== null && currentTime >= cue.start && currentTime < cue.end;
              return <button id={`shadowing-cue-${i}`} key={cue.id} aria-pressed={selected === i} onClick={() => jumpCue(i)} className={`w-full rounded-xl border p-3 text-left ${active ? 'border-blue-400 bg-blue-500/15' : selected === i ? 'border-violet-400 bg-violet-400/10' : 'border-slate-800 bg-slate-950'}`}><span className="mb-1 block text-xs text-slate-400">#{i + 1} · {cue.start === null ? 'Đặt mốc thủ công' : formatDuration(cue.start)}</span>{mode === 'dictation' && !revealed ? <span className="text-sm">Lời thoại đang ẩn · bấm để nghe</span> : <KaraokeCaption text={cue.text} time={currentTime} start={cue.start} end={cue.end} analysis={cache.current.get(cue.text) || null} furigana={furigana} />}{translation && (mode !== 'dictation' || revealed) && cache.current.get(cue.text)?.translation && <p className="mt-2 text-xs italic text-slate-400">{cache.current.get(cue.text)?.translation}</p>}</button>;
            })}</div>
{!cues.length && <p className="p-3 text-sm text-slate-400">Tải phụ đề Nhật hoặc nhập SRT/VTT ở bên trái để chữ chạy theo video.</p>}</section>
          </>}
        </div>
      </div>
    </>}
  </div>;
}
