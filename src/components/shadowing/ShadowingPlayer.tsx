import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Play, Square, RotateCcw, ExternalLink } from 'lucide-react';
import { validateShadowingRange } from '../../utils/shadowing';

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.getElementById('youtube-iframe-api') || document.createElement('script');
    const interval = window.setInterval(() => { if (window.YT?.Player) complete(); }, 100);
    const timeout = window.setTimeout(() => complete(new Error('Không tải được trình phát YouTube. Hãy kiểm tra mạng và thử lại.')), 15000);
    function complete(error?: Error) {
      clearInterval(interval); clearTimeout(timeout);
      if (error) { apiPromise = null; reject(error); } else resolve();
    }
    if (!script.id) {
      script.id = 'youtube-iframe-api';
      (script as HTMLScriptElement).src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });
  return apiPromise;
}

interface Props {
  videoId: string;
  start: number | null;
  end: number | null;
  sentenceKey: string;
  onTime: (time: number) => void;
  compact?: boolean;
}
export interface ShadowingPlayerHandle { seek: (time: number) => void; pause: () => void; playSentence: (start: number | null, end: number | null, autoPause: boolean) => boolean }

const ShadowingPlayer = forwardRef<ShadowingPlayerHandle, Props>(function ShadowingPlayer({ videoId, start, end, onTime, compact }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<any>(null);
  const exercise = useRef<{ start: number; end: number; remaining: number; armed: boolean } | null>(null);
  const heldTime = useRef<number | null>(null);
  const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeRef = useRef(onTime);
  onTimeRef.current = onTime;
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [speed, setSpeed] = useState(1);
  const [repeats, setRepeats] = useState(3);
  const [gap, setGap] = useState(3);
  const [reload, setReload] = useState(0);
  const gapRef = useRef(gap);
  gapRef.current = gap;

  function stop() {
    exercise.current = null;
    heldTime.current = null;
    if (gapTimer.current) clearTimeout(gapTimer.current);
    gapTimer.current = null;
    player.current?.pauseVideo?.();
    setRunning(false);
    setMessage('');
  }

  useImperativeHandle(ref, () => ({
    seek(time) { stop(); onTimeRef.current(time); player.current?.seekTo?.(time, true); player.current?.playVideo?.(); },
    pause() { stop(); },
    playSentence(from, to, autoPause) {
      if (!ready) { setMessage('Video chưa sẵn sàng. Hãy thử lại sau khi video tải xong.'); return false; }
      const error = validateShadowingRange(from, to, player.current?.getDuration?.());
      if (error) { setMessage(error); return false; }
      stop();
      if (autoPause) exercise.current = { start: from!, end: to!, remaining: 1, armed: false };
      onTimeRef.current(from!); player.current.seekTo(from, true); player.current.playVideo();
      setRunning(autoPause); return true;
    },
  }));

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    setReady(false); setMessage('Đang tải video…');
    loadYouTubeApi().then(() => {
      if (disposed || !host.current) return;
      const target = document.createElement('div');
      host.current.replaceChildren(target);
      player.current = new window.YT.Player(target, {
        videoId, width: '100%', height: '100%',
        playerVars: { playsinline: 1, rel: 0, origin: window.location.origin, cc_lang_pref: 'ja', cc_load_policy: 1 },
        events: {
          onReady: () => { if (!disposed) { setReady(true); setMessage(''); } },
          onError: (event: any) => {
            if (disposed) return;
            stop(); setReady(false);
            setMessage([101, 150].includes(event.data) ? 'Video không cho phép nhúng. Hãy mở trên YouTube hoặc chọn video khác.' : 'Không phát được video. Video có thể riêng tư, bị gỡ hoặc bị giới hạn.');
          },
        },
      });
      timer = setInterval(() => {
        const instance = player.current;
        if (!instance?.getCurrentTime) return;
        const time = instance.getCurrentTime();
        const segment = exercise.current;
        const state = instance.getPlayerState?.();
        if (state === 1) heldTime.current = null;
        onTimeRef.current(heldTime.current ?? (segment && time >= segment.start ? Math.min(time, segment.end - 0.001) : time));
        if (!segment || state !== 1) return;
        if (time >= segment.start - 0.25 && time < segment.end) segment.armed = true;
        if (!segment.armed || time < segment.end) return;
        heldTime.current = segment.end - 0.001;
        instance.pauseVideo();
        segment.remaining -= 1;
        if (segment.remaining <= 0) {
          exercise.current = null; setRunning(false); setMessage('Đã luyện xong đoạn này. Bạn có thể nghe lại hoặc chọn câu tiếp theo.');
        } else {
          setMessage(`Đọc nhại lại trong ${gapRef.current} giây · còn ${segment.remaining} lượt`);
          gapTimer.current = setTimeout(() => {
            gapTimer.current = null;
            if (disposed || exercise.current !== segment) return;
            segment.armed = false;
            instance.seekTo(segment.start, true); instance.playVideo();
            setMessage(`Đang nghe · còn ${segment.remaining} lượt`);
          }, gapRef.current * 1000);
        }
      }, 50);
    }).catch(error => { if (!disposed) setMessage(error.message); });
    return () => {
      disposed = true;
      exercise.current = null;
      if (timer) clearInterval(timer);
      if (gapTimer.current) clearTimeout(gapTimer.current);
      gapTimer.current = null;
      player.current?.destroy?.(); player.current = null;
    };
  }, [videoId, reload]);

  useEffect(() => {
    if (!ready) return;
    const available: number[] = player.current?.getAvailablePlaybackRates?.() || [1];
    if (available.includes(speed)) player.current.setPlaybackRate(speed);
    else { setSpeed(1); setMessage('Video này chưa hỗ trợ tốc độ đã chọn. Đã dùng tốc độ 1×.'); }
  }, [speed, ready]);

  function playSegment() {
    const error = validateShadowingRange(start, end, player.current?.getDuration?.());
    if (error) { setMessage(error); return; }
    stop();
    exercise.current = { start: start!, end: end!, remaining: repeats, armed: false };
    onTimeRef.current(start!); player.current.seekTo(start, true); player.current.playVideo();
    setRunning(true); setMessage(`Đang nghe · ${repeats} lượt`);
  }

  return <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
    <div ref={host} className="shadowing-video aspect-video w-full bg-black" />
    <div className="space-y-3 p-4">
      {!compact && <>
      <div className="flex flex-wrap gap-3 text-xs text-slate-300">
        <label>Tốc độ <select aria-label="Tốc độ video" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="ml-1 rounded-lg bg-slate-800 p-2">{[0.5, 0.75, 1, 1.25].map(n => <option key={n} value={n}>{n}×</option>)}</select></label>
        <label>Lặp <select aria-label="Số lần lặp" value={repeats} onChange={e => setRepeats(Number(e.target.value))} className="ml-1 rounded-lg bg-slate-800 p-2">{[1, 3, 5].map(n => <option key={n} value={n}>{n} lần</option>)}</select></label>
        <label>Nghỉ để nhại <select aria-label="Thời gian đọc nhại" value={gap} onChange={e => setGap(Number(e.target.value))} className="ml-1 rounded-lg bg-slate-800 p-2">{[0, 3, 5, 8].map(n => <option key={n} value={n}>{n} giây</option>)}</select></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button disabled={!ready} onClick={playSegment} className="flex min-h-11 items-center gap-2 rounded-xl bg-violet-500 px-4 font-bold text-white disabled:opacity-40"><Play size={16} />Nghe & nhại đoạn này</button>
        <button disabled={!running} onClick={stop} className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-800 px-4 disabled:opacity-40"><Square size={15} />Dừng</button>
        {!ready && <button aria-label="Tải lại video" onClick={() => setReload(n => n + 1)} className="rounded-xl bg-slate-800 p-3"><RotateCcw size={16} /></button>}
        <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 p-2 text-xs text-slate-400"><ExternalLink size={14} />YouTube</a>
      </div>
      </>}
      {compact && <div className="flex items-center gap-3 text-xs"><label>Tốc độ <select aria-label="Tốc độ video" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="rounded bg-slate-800 p-2">{[0.5, 0.75, 1, 1.25].map(n => <option key={n} value={n}>{n}×</option>)}</select></label><button onClick={stop} className="rounded bg-slate-800 p-2">Dừng video</button>{!ready && <button onClick={() => setReload(n => n + 1)}>Tải lại video</button>}<a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer">YouTube ↗</a></div>}
      {message && <p role="status" className="text-sm text-amber-200">{message}</p>}
    </div>
  </section>;
});
export default ShadowingPlayer;
