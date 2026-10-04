import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Headphones, Link2 } from 'lucide-react';
import { DEFAULT_YOUTUBE_LISTENING_VIDEOS } from '../../data/youtubeListeningSeedData';
import { formatDuration } from '../../utils/youtubeUtils';
import { parseShadowingVideoId, parseShadowingTime, ShadowingCue, ShadowingAnalysis } from '../../utils/shadowing';
import ShadowingPlayer, { ShadowingPlayerHandle } from './ShadowingPlayer';
import KaraokeCaption from './KaraokeCaption';
import DictationPanel from './DictationPanel';
import SentenceInsights from './SentenceInsights';
import { activeShadowingCue, normalizeShadowingTimeline, readShadowingResponse } from '../../utils/shadowing';
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
  const [notice, setNotice] = useState('');
  const [insightCue, setInsightCue] = useState<ShadowingCue | null>(null);
  const [, refreshAnalysis] = useState(0);
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
  const displayed = mode === 'dictation' ? cues[selected] : active >= 0 ? cues[active] : null;
  const displayedAnalysis = displayed ? cache.current.get(displayed.text) || null : null;
  useEffect(() => {
    if (active >= 0 && mode !== 'dictation' && active !== selected) {
      selectCue(active);
      const card = document.getElementById(`shadowing-cue-${active}`);
      const container = card?.parentElement;
      if (card && container) container.scrollTo({ top: card.offsetTop - container.offsetTop, behavior: 'smooth' });
    }
  }, [active, mode]);

  function selectCue(index: number, source = cues) {
    const cue = source[index];
    if (!cue) return;
    setSelected(index); setSentence(cue.text); setRevealed(false);
    if (cue.start !== null && cue.end !== null) { setStart(String(cue.start)); setEnd(String(cue.end)); }
  }

  useEffect(() => {
    transcriptRequest.current?.abort();
    setCues([]); setSentence(''); setSelected(0);
    setInsightCue(null);
    setNotice(''); setCurrentTime(0); setStart('0'); setEnd('10');
    setRevealed(false);
    if (videoId) {
      setUrlInput(`https://www.youtube.com/watch?v=${videoId}`);
      let restored = false;
      try {
        const saved = JSON.parse(localStorage.getItem(`shadowing-cues:${videoId}`) || '[]');
        if (Array.isArray(saved) && saved.length && saved.every(c => c && typeof c.text === 'string' && typeof c.id === 'string' && (c.start === null || Number.isFinite(c.start)) && (c.end === null || Number.isFinite(c.end)))) {
          const restoredCues = normalizeShadowingTimeline(saved.slice(0, 500));
          setCues(restoredCues); selectCue(0, restoredCues);
          restored = true;
        }
      } catch {}
      if (!restored) void loadCaptions();
    }
    return () => { transcriptRequest.current?.abort(); };
  }, [videoId]);

  function applyCues(next: ShadowingCue[]) {
    next = normalizeShadowingTimeline(next);
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
    setNotice('');
    try {
      const res = await fetch(`/api/shadowing/transcript?videoId=${videoId}`, { signal: controller.signal });
      const data = await readShadowingResponse(res);
      if (!res.ok) throw new Error(data.error || 'Không lấy được phụ đề.');
      if (!Array.isArray(data.cues) || !data.cues.length) throw new Error('Video không có phụ đề tiếng Nhật.');
      if (controller.signal.aborted) return;
      applyCues(data.cues);
    } catch (error) {
      if (!controller.signal.aborted) setNotice(error instanceof Error ? error.message : 'Không lấy được phụ đề.');
      else if (controller.signal.reason === 'timeout') setNotice('Tải phụ đề quá lâu. Hãy tải lại trang để thử lại.');
    } finally {
      clearTimeout(timer);
    }
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
            <div role="button" tabIndex={displayed ? 0 : -1} aria-label="Xem nghĩa và phân tích câu đang phát" aria-disabled={!displayed} onClick={() => displayed && setInsightCue({ ...displayed })} onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && displayed) { e.preventDefault(); setInsightCue({ ...displayed }); } }} className="cursor-pointer rounded-lg outline-none hover:bg-violet-500/10 focus-visible:ring-2 focus-visible:ring-violet-400">
<KaraokeCaption text={displayed?.text || (cues.length ? '' : 'Đang tải phụ đề…')} time={currentTime} start={displayed?.start ?? null} end={displayed?.end ?? null} analysis={displayedAnalysis} furigana={furigana} /></div>{translation && displayedAnalysis?.translation && <p className="mt-3 text-center text-sm text-slate-300">{displayedAnalysis.translation}</p>}
            {mode === 'dictation' && revealed && <button className="mt-3 text-sm underline" onClick={() => setRevealed(false)}>Ẩn đáp án</button>}
          </section>}


        </div>
        <div className="space-y-4">
          {insightCue && (mode === 'shadowing' || revealed) && <SentenceInsights key={videoId + insightCue.text} videoId={videoId || ''} cue={insightCue} cached={cache.current.get(insightCue.text)} onClose={() => setInsightCue(null)} onResult={(text, data) => { cache.current.set(text, data); refreshAnalysis(n => n + 1); }} />}
          {mode === 'dictation' && <DictationPanel key={`${videoId}:${selected}:${sentence}`} sentence={sentence} autoPause={autoPause} onAutoPause={value => { playerRef.current?.pause(); setAutoPause(value); }} onPlay={() => playerRef.current?.playSentence(parseShadowingTime(start), parseShadowingTime(end), autoPause) || false} onReveal={setRevealed} onPrevious={() => jumpCue(selected - 1)} onNext={() => jumpCue(selected + 1)} hasPrevious={selected > 0} hasNext={selected < cues.length - 1} />}
          {(mode === 'shadowing' || revealed) && <>
          <section className="rounded-xl bg-[#101010] p-3"><h2 className="mb-3 text-sm font-bold">BẢN CHÉP · {cues.length} câu</h2>            <div className="shadowing-transcript space-y-2 overflow-y-auto">{cues.map((cue, i) => {
              const isActive = active === i;
              return <button id={`shadowing-cue-${i}`} key={cue.id} aria-pressed={selected === i} onClick={() => isActive ? setInsightCue({ ...cue }) : jumpCue(i)} className={`w-full rounded-xl border p-3 text-left ${isActive ? 'border-blue-400 bg-blue-500/15' : selected === i ? 'border-violet-400 bg-violet-400/10' : 'border-slate-800 bg-slate-950'}`}><span className="mb-1 block text-xs text-slate-400">#{i + 1} · {cue.start === null ? 'Đặt mốc thủ công' : formatDuration(cue.start)}</span>{mode === 'dictation' && !revealed ? <span className="text-sm">Lời thoại đang ẩn · bấm để nghe</span> : <KaraokeCaption text={cue.text} time={currentTime} start={cue.start} end={cue.end} analysis={cache.current.get(cue.text) || null} furigana={furigana} />}{translation && (mode !== 'dictation' || revealed) && cache.current.get(cue.text)?.translation && <p className="mt-2 text-xs italic text-slate-400">{cache.current.get(cue.text)?.translation}</p>}</button>;
            })}</div>
{!cues.length && <p className="p-3 text-sm text-slate-400">Chưa tải được phụ đề tiếng Nhật cho video này.</p>}</section>
          </>}
        </div>
      </div>
    </>}
  </div>;
}
