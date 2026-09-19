import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Gauge, ShieldAlert, Sparkles } from 'lucide-react';

interface ListeningAudioPlayerProps {
  audioUrl?: string;
  transcriptText?: string;
  isMockTest?: boolean;
  allowedReplays?: number; // 0 = unlimited
  replaysUsed: number;
  onReplayUsed?: () => void;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export const ListeningAudioPlayer: React.FC<ListeningAudioPlayerProps> = ({
  audioUrl,
  transcriptText,
  isMockTest = false,
  allowedReplays = 0,
  replaysUsed,
  onReplayUsed,
  autoPlay = false,
  onEnded
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioSource, setAudioSource] = useState<string>('');
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Compute effective audio URL
  useEffect(() => {
    if (audioUrl && (audioUrl.startsWith('http') || audioUrl.startsWith('/') || audioUrl.startsWith('data:'))) {
      setAudioSource(audioUrl);
      setIsLoadingAudio(false);
    } else if (transcriptText) {
      // Synthesize natural Japanese speech using /api/tts endpoint
      const cleanJapanese = transcriptText
        .replace(/[A-Za-z0-9_]+：/g, '') // remove speaker labels if any
        .replace(/（\d+）/g, '')
        .trim();
      const encoded = encodeURIComponent(cleanJapanese);
      const voice = 'ja-JP-NanamiNeural';
      const ttsUrl = `/api/tts?text=${encoded}&voice=${voice}&rate=%2B0%25`;
      setAudioSource(ttsUrl);
      setIsLoadingAudio(false);
    } else {
      setAudioSource('');
    }
  }, [audioUrl, transcriptText]);

  // Audio lifecycle & event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoadingAudio(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onEnded]);

  // Auto-play when source changes if requested
  useEffect(() => {
    if (autoPlay && audioRef.current && audioSource) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay blocked by browser policy until user interacts
          console.warn('Autoplay prevented by browser:', err);
        });
      }
    }
  }, [audioSource, autoPlay]);

  // Update speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = isMockTest ? 1.0 : playbackRate;
    }
  }, [playbackRate, isMockTest]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.warn('Play error:', e));
    }
  }, [isPlaying]);

  const handleReplay = useCallback(() => {
    if (isMockTest && allowedReplays > 0 && replaysUsed >= allowedReplays) {
      return; // Replay limit exceeded in mock test
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      if (onReplayUsed) onReplayUsed();
    }
  }, [isMockTest, allowedReplays, replaysUsed, onReplayUsed]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(target)) {
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const canReplay = !isMockTest || allowedReplays === 0 || replaysUsed < allowedReplays;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md">
      <audio ref={audioRef} src={audioSource} preload="metadata" />

      {/* Top status bar */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-400 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {isPlaying ? 'Đang phát hội thoại' : 'Âm thanh sẵn sàng'}
          </span>
          {isMockTest && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium text-[11px]">
              <ShieldAlert className="w-3 h-3" />
              Thi chuẩn JLPT (Khóa tốc độ)
            </span>
          )}
        </div>

        {/* Replay indicator */}
        {isMockTest && allowedReplays > 0 ? (
          <span className={`font-semibold ${replaysUsed >= allowedReplays ? 'text-rose-400' : 'text-slate-300'}`}>
            Đã nghe lại: {replaysUsed}/{allowedReplays} lần
          </span>
        ) : (
          <span className="text-slate-400 hidden sm:inline">Phím tắt: [Space] Phát / Dừng • [R] Nghe lại</span>
        )}
      </div>

      {/* Audio Waveform visualization */}
      <div className="h-10 sm:h-12 w-full flex items-center justify-center gap-1 my-2 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
        {Array.from({ length: 28 }).map((_, i) => {
          const heightFactor = isPlaying 
            ? Math.sin((i * 0.4) + (currentTime * 4)) * 0.45 + 0.55
            : 0.2;
          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlaying ? 'bg-emerald-400' : 'bg-slate-700'
              }`}
              style={{
                height: `${Math.max(12, Math.round(heightFactor * 36))}px`,
                opacity: (currentTime / (duration || 1)) >= (i / 28) ? 1 : 0.45
              }}
            />
          );
        })}
      </div>

      {/* Seek Progress Bar */}
      <div className="space-y-1.5 mt-3">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={isMockTest}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-75 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          {/* Play / Pause button */}
          <button
            type="button"
            id="btn-listening-play-pause"
            onClick={togglePlay}
            disabled={isLoadingAudio}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            title={isPlaying ? 'Tạm dừng (Space)' : 'Phát audio (Space)'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
          </button>

          {/* Replay button */}
          <button
            type="button"
            id="btn-listening-replay"
            onClick={handleReplay}
            disabled={!canReplay}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              canReplay
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95'
                : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
            }`}
            title="Nghe lại từ đầu (Phím R)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Phát lại</span>
          </button>
        </div>

        {/* Speed Controls (Locked in Mock Test) */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
          {[0.75, 1.0, 1.25].map((speed) => (
            <button
              key={speed}
              type="button"
              disabled={isMockTest}
              onClick={() => setPlaybackRate(speed)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                playbackRate === speed
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              } ${isMockTest ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Volume & Mute */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
