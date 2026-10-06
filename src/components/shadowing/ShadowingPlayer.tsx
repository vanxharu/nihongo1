import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Play, Square, RotateCcw, ExternalLink, SkipBack, SkipForward } from 'lucide-react';
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
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}
export interface ShadowingPlayerHandle { seek: (time: number) => void; pause: () => void; playSentence: (start: number | null, end: number | null, autoPause: boolean) => boolean }

const ShadowingPlayer = forwardRef<ShadowingPlayerHandle, Props>(function ShadowingPlayer({ videoId, start, end, onTime, compact, onPrev, onNext, hasPrev, hasNext }, ref) {
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

  const speedOptions = [0.5, 0.75, 1, 1.25];
  const repeatOptions = [1, 3, 5];
  const gapOptions = [0, 3, 5, 8];

  return (
    <section className="shadowing-player overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
      {/* Video — hidden in dictation compact mode to save space */}
      {!compact && <div ref={host} className="shadowing-video aspect-video w-full bg-black" />}
      {compact && <div ref={host} className="shadowing-video" style={{ height: 0, overflow: 'hidden' }} />}

      {/* Controls */}
      <div className="px-3 py-2.5 space-y-2">

        {/* Row 1: prev · play/stop · next + speed pill */}
        <div className="flex items-center gap-2">
          {(onPrev || onNext) && (
            <button
              disabled={!hasPrev}
              onClick={onPrev}
              aria-label="Câu trước"
              className="shadowing-ctrl-btn"
            >
              <SkipBack size={16} />
            </button>
          )}

          <button
            disabled={!ready}
            onClick={running ? stop : playSegment}
            aria-label={running ? 'Dừng' : 'Nghe & nhại đoạn này'}
            className="shadowing-play-btn"
          >
            {running ? <Square size={18} /> : <Play size={18} />}
            <span className="text-xs font-semibold">{running ? 'Dừng' : 'Phát đoạn này'}</span>
          </button>

          {(onPrev || onNext) && (
            <button
              disabled={!hasNext}
              onClick={onNext}
              aria-label="Câu sau"
              className="shadowing-ctrl-btn"
            >
              <SkipForward size={16} />
            </button>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {/* Speed pills */}
            {speedOptions.map(n => (
              <button
                key={n}
                onClick={() => setSpeed(n)}
                className={`shadowing-pill${speed === n ? ' shadowing-pill-active' : ''}`}
              >
                {n}×
              </button>
            ))}
          </div>

          {!ready && (
            <button aria-label="Tải lại video" onClick={() => setReload(n => n + 1)} className="shadowing-ctrl-btn">
              <RotateCcw size={15} />
            </button>
          )}
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noreferrer"
            className="shadowing-ctrl-btn"
            aria-label="Mở YouTube"
          >
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Row 2: Lặp + Nghỉ pills (only in shadowing mode) */}
        {!compact && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="shrink-0">Lặp:</span>
            {repeatOptions.map(n => (
              <button
                key={n}
                onClick={() => setRepeats(n)}
                className={`shadowing-pill${repeats === n ? ' shadowing-pill-active' : ''}`}
              >
                {n} lần
              </button>
            ))}
            <span className="ml-3 shrink-0">Nghỉ nhại:</span>
            {gapOptions.map(n => (
              <button
                key={n}
                onClick={() => setGap(n)}
                className={`shadowing-pill${gap === n ? ' shadowing-pill-active' : ''}`}
              >
                {n === 0 ? 'Không' : `${n}s`}
              </button>
            ))}
          </div>
        )}

        {message && <p role="status" className="text-xs text-amber-200">{message}</p>}
      </div>
    </section>
  );
});
export default ShadowingPlayer;
