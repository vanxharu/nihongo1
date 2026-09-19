import React, { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Play, RotateCcw, AlertTriangle, ExternalLink, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatResumeTime, formatDuration } from '../../utils/youtubeUtils';
import { 
  getLocalVideoProgress, 
  saveToLocalStorage, 
  syncProgressToServer, 
  shouldShowResumeBanner,
  isProgressCompleted,
  resolveLatestProgress,
  flushPendingSync
} from '../../utils/listeningProgressStorage';
import { UserVideoProgress } from '../../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export interface YouTubePlayerRef {
  seekTo: (seconds: number, autoPlay?: boolean) => Promise<boolean>;
  play: () => void;
  pause: () => void;
  playSnippet: (
    startTime: number, 
    endTime?: number, 
    context?: { questionId?: string; videoId?: string; isOriginal?: boolean }
  ) => Promise<boolean>;
  loadAndSeek: (videoId: string, startTime: number, endTime?: number, questionId?: string) => Promise<boolean>;
  getCurrentTime: () => number;
  getDuration: () => number;
  isReady: () => boolean;
}

export interface YouTubePlayerProps {
  videoId: string;
  userId?: string;
  initialTime?: number;
  initialDuration?: number;
  initialCompleted?: boolean;
  onProgress?: (currentTime: number, duration: number, isCompleted: boolean) => void;
  onCompleted?: () => void;
  onResetProgress?: () => void;
  title?: string;
  level?: string;
  durationSeconds?: number;
  autoPlay?: boolean;
  showSnippetControls?: boolean;
  sourceName?: string;
  sourceUrl?: string;
  lockSeeking?: boolean;
}

const YouTubePlayerComponent = (
  {
    videoId,
    userId = 'default_user',
    initialTime = 0,
    initialDuration = 0,
    initialCompleted = false,
    onProgress,
    onCompleted,
    onResetProgress,
    title,
    level,
    durationSeconds,
    autoPlay = false,
    showSnippetControls = true,
    sourceName,
    sourceUrl,
    lockSeeking = false
  }: YouTubePlayerProps,
  ref: React.Ref<YouTubePlayerRef>
) => {
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const isPlayerReadyRef = useRef<boolean>(false);
  const progressTimerRef = useRef<any>(null);
  const snippetRangeRef = useRef<{ start: number; end?: number } | null>(null);
  const snippetIntervalRef = useRef<any>(null);
  const isSnippetModeRef = useRef<boolean>(false);

  // Time references for seek and interval tracking
  const lastObservedTimeRef = useRef<number>(initialTime);
  const lastObservedClockRef = useRef<number>(Date.now());
  const latestDurationRef = useRef<number>(initialDuration);
  const isCompletedRef = useRef<boolean>(initialCompleted);
  const videoIdRef = useRef<string>(videoId);
  const userIdRef = useRef<string>(userId);

  // Keep callback references stable to prevent effect re-triggering
  const callbacksRef = useRef({
    onProgress,
    onCompleted,
    onResetProgress
  });

  videoIdRef.current = videoId;
  userIdRef.current = userId;
  callbacksRef.current = {
    onProgress,
    onCompleted,
    onResetProgress
  };
  if (initialCompleted) {
    isCompletedRef.current = true;
  }

  // Resolve best resume time by comparing prop vs localStorage ONCE per videoId
  const initialStartSec = useMemo(() => {
    const local = getLocalVideoProgress(videoId);
    let time = initialTime;
    if (local && local.currentTime !== undefined) {
      if (initialTime <= 0) time = local.currentTime;
      else time = Math.max(initialTime, local.currentTime);
    }
    const isComp = isProgressCompleted(time, initialDuration, initialCompleted);
    return (!isComp && time >= 5) ? Math.floor(time) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const [isApiReady, setIsApiReady] = useState<boolean>(() => {
    return typeof window !== 'undefined' && !!(window.YT && window.YT.Player);
  });
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Show resume banner if >= 5s and not completed
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(() => 
    shouldShowResumeBanner(initialStartSec, initialDuration, initialCompleted)
  );

  const [currentTimeDisplay, setCurrentTimeDisplay] = useState<number>(initialStartSec);
  const [durationDisplay, setDurationDisplay] = useState<number>(initialDuration);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(initialCompleted);

  // Core save routine - 100% stable, uses refs, never causes component re-renders
  const persistProgress = useCallback((time: number, dur: number, isUnloading: boolean = false, explicitCompleted?: boolean) => {
    const currentVideoId = videoIdRef.current;
    if (!currentVideoId) return;

    const currentUserId = userIdRef.current || 'default_user';
    const safeDuration = dur > 0 ? dur : (latestDurationRef.current || 0);
    const safeTime = Math.max(0, time);
    const completed = explicitCompleted !== undefined 
      ? explicitCompleted 
      : isProgressCompleted(safeTime, safeDuration, isCompletedRef.current);

    if (completed) {
      isCompletedRef.current = true;
    }

    const percent = safeDuration > 0 
      ? Math.min(100, Math.round((safeTime / safeDuration) * 100))
      : (completed ? 100 : 0);

    const now = Date.now();
    const progressRecord: UserVideoProgress = {
      videoId: currentVideoId,
      currentTime: safeTime,
      duration: safeDuration,
      completed,
      progressPercent: completed ? 100 : percent,
      bookmarked: false,
      updatedAt: now,
      lastWatchedAt: new Date(now).toISOString()
    };

    // 1. Immediately persist to localStorage
    saveToLocalStorage(progressRecord);

    // 2. Sync to server (or beacon if unloading)
    syncProgressToServer(currentUserId, progressRecord, { isUnloading });

    // 3. Notify parent callback
    if (callbacksRef.current.onProgress && safeDuration > 0) {
      callbacksRef.current.onProgress(safeTime, safeDuration, completed);
    }
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      setIsApiReady(true);
    };

    const checkInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        setIsApiReady(true);
        clearInterval(checkInterval);
      }
    }, 300);

    return () => clearInterval(checkInterval);
  }, []);

  // Listen to network reconnect to flush offline progress
  useEffect(() => {
    const handleOnline = () => {
      flushPendingSync(userIdRef.current);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Progress tracking loop with seek detection
  const stopProgressTracking = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const stopSnippetWatch = useCallback(() => {
    if (snippetIntervalRef.current) {
      clearInterval(snippetIntervalRef.current);
      snippetIntervalRef.current = null;
    }
    isSnippetModeRef.current = false;
  }, []);

  // Ensure player instance is ready before performing operations
  const ensurePlayerReady = useCallback((timeoutMs: number = 8000): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (isPlayerReadyRef.current && playerRef.current && typeof playerRef.current.seekTo === 'function') {
        console.log('[PLAYER] Ready');
        return resolve(playerRef.current);
      }
      const startWait = Date.now();
      const interval = setInterval(() => {
        if (isPlayerReadyRef.current && playerRef.current && typeof playerRef.current.seekTo === 'function') {
          clearInterval(interval);
          console.log('[PLAYER] Ready');
          return resolve(playerRef.current);
        }
        if (Date.now() - startWait > timeoutMs) {
          clearInterval(interval);
          console.error('[PLAYER][ERROR] Timeout waiting for YouTube Player to become ready');
          reject(new Error('Player ready timeout exceeded'));
        }
      }, 100);
    });
  }, []);

  // Ensure target video is actually loaded in the player before seeking
  const ensureVideoLoaded = useCallback(async (targetVideoId: string, timeoutMs: number = 8000): Promise<void> => {
    const player = await ensurePlayerReady();
    let currentVidId = '';
    try {
      currentVidId = player.getVideoData?.()?.video_id || videoIdRef.current;
    } catch {}

    console.log(`[PLAYER] Current Video: ${currentVidId || 'none'}`);
    console.log(`[TARGET] Target Video: ${targetVideoId}`);

    if (currentVidId === targetVideoId) {
      return;
    }

    console.log(`[YT] Switching video from ${currentVidId} to target ${targetVideoId}`);
    if (typeof player.loadVideoById === 'function') {
      player.loadVideoById({ videoId: targetVideoId });
    }

    return new Promise((resolve) => {
      const startWait = Date.now();
      const interval = setInterval(() => {
        try {
          const loadedId = player.getVideoData?.()?.video_id;
          if (loadedId === targetVideoId) {
            clearInterval(interval);
            videoIdRef.current = targetVideoId;
            return resolve();
          }
        } catch {}
        if (Date.now() - startWait > timeoutMs) {
          clearInterval(interval);
          videoIdRef.current = targetVideoId;
          resolve();
        }
      }, 150);
    });
  }, [ensurePlayerReady]);

  // Accurate seeking with verification, logging, and retry logic
  const seekToExact = useCallback(async (
    targetTime: number,
    autoPlay: boolean = true,
    maxRetries: number = 4,
    context?: { questionId?: string; videoId?: string; startTime?: number; endTime?: number; isOriginal?: boolean }
  ): Promise<boolean> => {
    let player: any = null;
    try {
      player = await ensurePlayerReady();
    } catch (err) {
      console.error('[YT][ERROR] Player not ready for seek:', err);
      return false;
    }

    const currentVideoId = player.getVideoData?.()?.video_id || videoIdRef.current;
    const targetVideoId = context?.videoId || videoIdRef.current;

    if (targetVideoId && currentVideoId && currentVideoId !== targetVideoId) {
      console.warn(`[ERROR] VIDEO_ID_MISMATCH: Current video ${currentVideoId} != Target video ${targetVideoId}. Switching video...`);
      await ensureVideoLoaded(targetVideoId);
    }

    let beforeTime = 0;
    try {
      beforeTime = player.getCurrentTime?.() || 0;
    } catch {}

    const qId = context?.questionId || 'N/A';
    const vId = targetVideoId || currentVideoId;
    const isOriginal = context?.isOriginal !== false;

    // Structured logging matching Section XXVII
    console.log(`[LISTENING]\nQuestion: ${qId}`);
    console.log(`[QUESTION SOURCE]\nOriginal: ${isOriginal}`);
    console.log(`[YOUTUBE]\nVideo ID: ${vId}`);
    if (context?.startTime !== undefined) {
      console.log(`[TIMESTAMP]\nStart: ${context.startTime.toFixed(2)}\nEnd: ${context.endTime !== undefined ? context.endTime.toFixed(2) : 'N/A'}`);
    }
    console.log(`[PLAYER]\nCurrent Video: ${player.getVideoData?.()?.video_id || currentVideoId}`);
    console.log(`[PLAYER]\nCurrent Time Before Seek: ${beforeTime.toFixed(2)}`);
    console.log(`[SEEK]\nRequested: ${targetTime.toFixed(2)}`);

    try {
      player.seekTo(targetTime, true);
      if (autoPlay && typeof player.playVideo === 'function') {
        player.playVideo();
      }
    } catch (e) {
      console.warn('[YT] Initial seek call failed, will retry in loop:', e);
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      await new Promise(r => setTimeout(r, 180 + attempt * 120));
      let actualTime = targetTime;
      try {
        actualTime = player.getCurrentTime?.() || 0;
      } catch {}

      const diff = Math.abs(actualTime - targetTime);
      // Considered success if within 1.25s tolerance or video started progressing past targetTime
      if (diff <= 1.25 || (actualTime >= targetTime && actualTime <= targetTime + 2.5)) {
        console.log(`[SEEK]\nActual: ${actualTime.toFixed(2)}`);
        console.log(`[SEEK]\nStatus: SUCCESS`);
        console.log(`[PLAYER]\nState: PLAYING`);
        lastObservedTimeRef.current = actualTime;
        lastObservedClockRef.current = Date.now();
        setCurrentTimeDisplay(actualTime);
        return true;
      }

      if (attempt < maxRetries) {
        console.warn(`[SEEK]\nStatus: RETRY (attempt ${attempt + 1}/${maxRetries})\nExpected: ${targetTime.toFixed(2)}\nActual: ${actualTime.toFixed(2)}`);
        try {
          player.seekTo(targetTime, true);
          if (autoPlay && typeof player.playVideo === 'function') {
            player.playVideo();
          }
        } catch {}
      } else {
        console.error(`[SEEK]\nStatus: FAILED\nExpected: ${targetTime.toFixed(2)}\nActual: ${actualTime.toFixed(2)}`);
      }
    }

    lastObservedTimeRef.current = targetTime;
    setCurrentTimeDisplay(targetTime);
    return false;
  }, [ensurePlayerReady, ensureVideoLoaded]);

  // Expose imperative handle for clean parent control (seek, snippet play, get time)
  useImperativeHandle(ref, () => ({
    seekTo: async (seconds: number, autoPlay: boolean = true) => {
      isSnippetModeRef.current = false;
      snippetRangeRef.current = null;
      stopSnippetWatch();
      return await seekToExact(seconds, autoPlay);
    },
    play: () => {
      isSnippetModeRef.current = false;
      snippetRangeRef.current = null;
      stopSnippetWatch();
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    },
    pause: () => {
      isSnippetModeRef.current = false;
      snippetRangeRef.current = null;
      stopSnippetWatch();
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    },
    playSnippet: async (startTime: number, endTime?: number, context?: { questionId?: string; videoId?: string; isOriginal?: boolean }) => {
      stopSnippetWatch();
      isSnippetModeRef.current = true;
      snippetRangeRef.current = { start: startTime, end: endTime };

      const targetVidId = context?.videoId || videoIdRef.current;
      if (targetVidId && targetVidId !== videoIdRef.current) {
        await ensureVideoLoaded(targetVidId);
      }

      const success = await seekToExact(startTime, true, 4, {
        questionId: context?.questionId,
        videoId: targetVidId,
        startTime,
        endTime,
        isOriginal: context?.isOriginal !== false
      });

      // High-resolution check: automatically pause ONLY when in snippet mode AND after having reached startTime
      if (success && endTime && endTime > startTime) {
        snippetIntervalRef.current = setInterval(() => {
          if (!isSnippetModeRef.current || !snippetRangeRef.current || snippetRangeRef.current.end !== endTime) {
            stopSnippetWatch();
            return;
          }
          if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            try {
              const cur = playerRef.current.getCurrentTime() || 0;
              // Guard: verify playback has started near or past startTime before evaluating endTime!
              // TUYỆT ĐỐI KHÔNG PAUSE nếu cur < startTime - 0.5
              if (cur < startTime - 0.5) {
                return;
              }
              if (cur >= endTime) {
                console.log(`[TIMESTAMP] Snippet reached end time ${endTime.toFixed(2)}s (current: ${cur.toFixed(2)}s) -> Pausing.`);
                playerRef.current.pauseVideo();
                snippetRangeRef.current = null;
                stopSnippetWatch();
              }
            } catch {}
          }
        }, 150);
      }

      return success;
    },
    loadAndSeek: async (targetVidId: string, startTime: number, endTime?: number, questionId?: string) => {
      await ensureVideoLoaded(targetVidId);
      return await seekToExact(startTime, true, 4, {
        questionId,
        videoId: targetVidId,
        startTime,
        endTime
      });
    },
    getCurrentTime: () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        return playerRef.current.getCurrentTime() || 0;
      }
      return lastObservedTimeRef.current;
    },
    getDuration: () => {
      if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
        return playerRef.current.getDuration() || latestDurationRef.current;
      }
      return latestDurationRef.current;
    },
    isReady: () => isPlayerReadyRef.current
  }), [stopSnippetWatch, seekToExact, ensureVideoLoaded]);

  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    lastObservedClockRef.current = Date.now();

    progressTimerRef.current = setInterval(() => {
      const player = playerRef.current;
      if (player && typeof player.getCurrentTime === 'function') {
        try {
          const current = player.getCurrentTime() || 0;
          const total = player.getDuration() || 0;
          const now = Date.now();
          const elapsedSec = (now - lastObservedClockRef.current) / 1000;

          if (total > 0 && total !== latestDurationRef.current) {
            latestDurationRef.current = total;
            setDurationDisplay(total);
          }

          // Seek detection: if difference between observed time and expected elapsed time > 2.5 seconds
          const expectedTime = lastObservedTimeRef.current + elapsedSec;
          const timeDiff = Math.abs(current - expectedTime);

          // Update tracking refs
          lastObservedTimeRef.current = current;
          lastObservedClockRef.current = now;
          setCurrentTimeDisplay(current);

          // Periodic save every 2.5s, or immediately on detected seek
          const isSeek = timeDiff > 2.5;
          persistProgress(current, total, false);

          if (isSeek) {
            // Seek detected: hide resume banner if user manually sought
            setShowResumeBanner(false);
          }
        } catch {
          // ignore YouTube player cross-origin transient errors
        }
      }
    }, 2500);
  }, [persistProgress, stopProgressTracking]);

  // Handle visibility change and beforeunload / pagehide
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const cur = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || latestDurationRef.current;
            persistProgress(cur, dur, true);
          } catch {}
        }
      }
    };

    const handlePageHide = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || latestDurationRef.current;
          persistProgress(cur, dur, true);
        } catch {}
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [persistProgress]);

  // Initialize YT Player - STABLE: ONLY runs when API becomes ready or videoId changes!
  useEffect(() => {
    if (!isApiReady || !videoId) return;

    setHasError(false);
    setErrorMessage('');
    setIsFinished(initialCompleted);

    // Clean up previous player if any
    stopProgressTracking();
    if (playerRef.current) {
      try {
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || latestDurationRef.current;
        persistProgress(cur, dur, true);
        playerRef.current.destroy();
      } catch {}
      playerRef.current = null;
    }

    if (!playerHostRef.current) return;

    // Reset host container DOM
    playerHostRef.current.innerHTML = '';
    const mountDiv = document.createElement('div');
    mountDiv.id = `yt-player-${videoId}`;
    mountDiv.style.width = '100%';
    mountDiv.style.height = '100%';
    playerHostRef.current.appendChild(mountDiv);

    const safeOrigin = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null')
      ? window.location.origin
      : undefined;

    const initPlayer = () => {
      if (!playerHostRef.current) return;
      try {
        playerRef.current = new window.YT.Player(mountDiv, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            ...(safeOrigin ? { origin: safeOrigin } : {}),
            start: initialStartSec
          },
          events: {
            onReady: (event: any) => {
              isPlayerReadyRef.current = true;
              setHasError(false);
              try {
                const dur = event.target.getDuration() || latestDurationRef.current;
                if (dur > 0) {
                  latestDurationRef.current = dur;
                  setDurationDisplay(dur);
                }

                // If starting at a resume point, update display
                if (initialStartSec > 0) {
                  lastObservedTimeRef.current = initialStartSec;
                  setCurrentTimeDisplay(initialStartSec);
                }
              } catch {}
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING
              if (event.data === 1) {
                setIsPlaying(true);
                setShowResumeBanner(false);
                startProgressTracking();
                // If user pressed Play directly in YouTube controls (not in snippet mode), cancel snippet watcher immediately
                if (!isSnippetModeRef.current) {
                  stopSnippetWatch();
                  snippetRangeRef.current = null;
                }
              } 
              // 2 = PAUSED
              else if (event.data === 2) {
                setIsPlaying(false);
                stopProgressTracking();
                if (!isSnippetModeRef.current) {
                  stopSnippetWatch();
                }
                try {
                  const current = playerRef.current.getCurrentTime() || 0;
                  const total = playerRef.current.getDuration() || latestDurationRef.current;
                  persistProgress(current, total, false);
                } catch {}
              } 
              // 0 = ENDED
              else if (event.data === 0) {
                setIsPlaying(false);
                setIsFinished(true);
                isCompletedRef.current = true;
                stopProgressTracking();
                try {
                  const total = playerRef.current.getDuration() || latestDurationRef.current;
                  persistProgress(total, total, false, true);
                } catch {}
                if (callbacksRef.current.onCompleted) {
                  callbacksRef.current.onCompleted();
                }
              }
            },
            onError: (event: any) => {
              setHasError(true);
              stopProgressTracking();
              if (event.data === 101 || event.data === 150) {
                setErrorMessage('Chủ sở hữu video không cho phép phát trực tiếp trên trang ngoài. Vui lòng mở xem trên YouTube.');
              } else if (event.data === 100) {
                setErrorMessage('Video này không tồn tại hoặc đã bị gỡ khỏi YouTube.');
              } else {
                setErrorMessage('Không thể phát video từ YouTube lúc này. Vui lòng mở trực tiếp trên YouTube.');
              }
            }
          }
        });
      } catch (err: any) {
        setHasError(true);
        setErrorMessage('Lỗi khởi tạo trình phát YouTube: ' + (err.message || ''));
      }
    };

    const timer = setTimeout(initPlayer, 50);

    return () => {
      clearTimeout(timer);
      isPlayerReadyRef.current = false;
      stopProgressTracking();
      stopSnippetWatch();
      // On unmount, save current position cleanly
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || latestDurationRef.current;
          persistProgress(cur, dur, true);
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      if (playerHostRef.current) {
        playerHostRef.current.innerHTML = '';
      }
    };
  }, [isApiReady, videoId]); // STRICTLY DEPENDS ON [isApiReady, videoId] ONLY!

  // Resume playback from saved position
  const handleResume = () => {
    setShowResumeBanner(false);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(initialStartSec, true);
      playerRef.current.playVideo();
      lastObservedTimeRef.current = initialStartSec;
      lastObservedClockRef.current = Date.now();
      persistProgress(initialStartSec, latestDurationRef.current, false);
    }
  };

  // Restart from beginning (0:00)
  const handleRestartFromBeginning = () => {
    setShowResumeBanner(false);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
      lastObservedTimeRef.current = 0;
      lastObservedClockRef.current = Date.now();
      setCurrentTimeDisplay(0);
      persistProgress(0, latestDurationRef.current, false, false);
      if (callbacksRef.current.onResetProgress) {
        callbacksRef.current.onResetProgress();
      }
    }
  };

  const youtubeDirectUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* 16:9 Video Container */}
      <div 
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
      >
        {/* Unmanaged YouTube player host - React will never diff or recreate iframe inside */}
        <div ref={playerHostRef} className="w-full h-full" />

        {/* Resume overlay banner if user has saved progress >= 5s */}
        {showResumeBanner && !hasError && initialStartSec >= 5 && (
          <div 
            id="youtube-resume-banner"
            className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto z-20 bg-slate-900/95 backdrop-blur-md border border-emerald-500/60 p-3 sm:px-4 sm:py-3 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs text-white max-w-lg animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-[13px] leading-tight">
                  Bạn đang nghe dở bài này
                </p>
                <p className="text-[11px] text-emerald-300 font-medium">
                  Đã nghe đến {formatResumeTime(initialStartSec)} {durationDisplay > 0 ? `/ ${formatDuration(durationDisplay)}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto pt-1 sm:pt-0">
              <button
                type="button"
                id="btn-resume-continue"
                onClick={handleResume}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Tiếp tục</span>
              </button>
              <button
                type="button"
                id="btn-resume-from-start"
                onClick={handleRestartFromBeginning}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-all cursor-pointer border border-slate-700"
              >
                <span>Từ đầu</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Fallback (video blocked or embed forbidden) */}
        {hasError && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">
              Video hiện không thể phát trực tiếp trên trang
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-5 leading-relaxed">
              {errorMessage || 'Chủ sở hữu video yêu cầu xem trực tiếp trên nền tảng YouTube.'}
            </p>
            <a
              href={youtubeDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở trên YouTube</span>
            </a>
          </div>
        )}

        {/* Finished Video celebration badge */}
        {isFinished && !hasError && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 p-3 rounded-xl shadow-xl flex items-center justify-between text-xs text-emerald-200">
            <span className="flex items-center gap-1.5 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Bạn đã hoàn thành bài nghe này! (+50 XP)
            </span>
            <button
              type="button"
              onClick={handleRestartFromBeginning}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nghe lại</span>
            </button>
          </div>
        )}
      </div>

      {/* Playback Controls & Attribution Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>
            Video được phát từ YouTube. Tự động lưu tiến độ nghe mỗi giây.
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentTimeDisplay > 5 && (
            <button
              type="button"
              onClick={handleRestartFromBeginning}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              title="Đặt lại và nghe lại từ đầu"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Học lại từ đầu</span>
            </button>
          )}

          {sourceName && (
            <div className="flex items-center gap-1">
              <span>Nguồn:</span>
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-300 hover:text-emerald-400 underline underline-offset-2 flex items-center gap-0.5"
                >
                  <span>{sourceName}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ) : (
                <span className="font-semibold text-slate-300">{sourceName}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const YouTubePlayer = React.memo(forwardRef<YouTubePlayerRef, YouTubePlayerProps>(YouTubePlayerComponent));
