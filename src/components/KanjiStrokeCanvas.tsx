import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Play, Pause, Hash, Loader2, Check } from 'lucide-react';

export interface StrokeItem {
  d: string;
  number: number;
  numX?: number;
  numY?: number;
}

export interface StrokeOrderData {
  character: string;
  code?: string;
  viewBox?: string;
  strokeCount: number;
  strokes: StrokeItem[];
}

interface KanjiStrokeCanvasProps {
  strokeData: StrokeOrderData | null;
  loading: boolean;
  activeCharacter: string;
}

// Crisp calligraphy purple color matching modern UI
const KANJI_STROKE_COLOR = '#a855f7';
const KANJI_GHOST_COLOR = 'rgba(168, 85, 247, 0.12)';

export const KanjiStrokeCanvas: React.FC<KanjiStrokeCanvasProps> = ({
  strokeData,
  loading,
  activeCharacter
}) => {
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState<number>(0);
  const [strokeProgress, setStrokeProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1); // 1x, 1.5x, 0.75x

  const lengthsRef = useRef<number[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate path lengths when strokeData changes
  useEffect(() => {
    if (!strokeData || strokeData.strokes.length === 0) {
      lengthsRef.current = [];
      setCurrentStrokeIdx(0);
      setStrokeProgress(0);
      setIsPlaying(false);
      return;
    }

    const calculatedLengths = strokeData.strokes.map((s) => {
      try {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', s.d);
        const len = p.getTotalLength();
        return len && len > 5 ? len : 100;
      } catch {
        return 100;
      }
    });

    lengthsRef.current = calculatedLengths;

    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

    setCurrentStrokeIdx(0);
    setStrokeProgress(0);
    setIsPlaying(true);
  }, [strokeData, activeCharacter]);

  // Main 60fps Animation Loop
  useEffect(() => {
    if (!strokeData || strokeData.strokes.length === 0 || !isPlaying) {
      return;
    }

    const totalStrokes = strokeData.strokes.length;

    // If all strokes are drawn, finish
    if (currentStrokeIdx >= totalStrokes) {
      setIsPlaying(false);
      setStrokeProgress(1);
      return;
    }

    const strokeLen = lengthsRef.current[currentStrokeIdx] || 100;
    // Calligraphy speed adjusted by multiplier
    const baseDuration = Math.max(180, Math.min(420, strokeLen * 3.8));
    const strokeDuration = baseDuration / speed;

    let startTimestamp: number | null = null;

    const stepAnimation = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const rawProgress = Math.min(1, elapsed / strokeDuration);

      // Smooth ease-out for natural ink flowing
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2.2);
      setStrokeProgress(easedProgress);

      if (rawProgress < 1) {
        animFrameIdRef.current = requestAnimationFrame(stepAnimation);
      } else {
        setStrokeProgress(1);

        // Small natural 80ms pause before lifting brush to next stroke
        pauseTimerRef.current = setTimeout(() => {
          setCurrentStrokeIdx((prev) => prev + 1);
          setStrokeProgress(0);
        }, 80 / speed);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(stepAnimation);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
    };
  }, [strokeData, currentStrokeIdx, isPlaying, speed]);

  // Replay from stroke 1
  const handleReplay = useCallback(() => {
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

    setCurrentStrokeIdx(0);
    setStrokeProgress(0);
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!isPlaying && currentStrokeIdx >= (strokeData?.strokes.length || 0)) {
      handleReplay();
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [isPlaying, currentStrokeIdx, strokeData, handleReplay]);

  const toggleSpeed = useCallback(() => {
    setSpeed(prev => {
      if (prev === 1) return 1.5;
      if (prev === 1.5) return 0.75;
      return 1;
    });
  }, []);

  const totalStrokes = strokeData?.strokeCount || 0;
  const isFinished = !isPlaying && currentStrokeIdx >= totalStrokes && totalStrokes > 0;

  return (
    <div className="flex flex-col items-center justify-start w-full select-none">
      {/* Stroke Canvas Box */}
      <div 
        onClick={() => {
          if (isFinished) handleReplay();
        }}
        className={`relative w-[230px] h-[230px] sm:w-[250px] sm:h-[250px] bg-[#16161d] border border-zinc-800 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl shadow-black/40 ring-1 ring-white/5 transition-all ${
          isFinished ? 'cursor-pointer hover:border-purple-500/40' : ''
        }`}
      >
        {/* Calligraphy 4-Quadrants Grid & Corner Marks */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none stroke-zinc-800/80"
          strokeDasharray="4 4"
          strokeWidth="1"
        >
          <line x1="50%" y1="0" x2="50%" y2="100%" />
          <line x1="0" y1="50%" x2="100%" y2="50%" />
          {/* Subtle diagonal lines */}
          <line x1="0" y1="0" x2="100%" y2="100%" strokeDasharray="2 6" strokeWidth="0.8" className="stroke-zinc-800/40" />
          <line x1="100%" y1="0" x2="0" y2="100%" strokeDasharray="2 6" strokeWidth="0.8" className="stroke-zinc-800/40" />
        </svg>

        {/* Top-Right Stroke Status Chip */}
        {totalStrokes > 0 && (
          <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
            <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
              isFinished
                ? 'bg-purple-950/70 text-purple-200 border-purple-800/60'
                : 'bg-zinc-900/90 text-zinc-400 border-zinc-800'
            }`}>
              {isFinished ? (
                <>
                  <Check className="w-3 h-3 text-purple-300" />
                  <span>{totalStrokes}/{totalStrokes} nét</span>
                </>
              ) : (
                <span>Nét {Math.min(totalStrokes, currentStrokeIdx + 1)}/{totalStrokes}</span>
              )}
            </span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
            <span className="text-xs">Đang nạp nét vẽ...</span>
          </div>
        ) : strokeData && strokeData.strokes.length > 0 ? (
          /* SVG STROKE CANVAS WITH CRISP, SHARP VECTOR PATHS */
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
            <svg
              viewBox={strokeData.viewBox || '0 0 109 109'}
              className="w-full h-full overflow-visible"
            >
              {/* 1. Ghost background template (all strokes in faint outline for context) */}
              <g opacity="0.6">
                {strokeData.strokes.map((s, idx) => (
                  <path
                    key={`ghost-${activeCharacter}-${idx}`}
                    d={s.d}
                    fill="none"
                    stroke={KANJI_GHOST_COLOR}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </g>

              {/* 2. Active Crisp Drawn Strokes - NO blurry glow filter */}
              <g>
                {strokeData.strokes.map((s, idx) => {
                  if (idx > currentStrokeIdx) return null;

                  const isCurrentlyDrawing = idx === currentStrokeIdx && isPlaying;
                  const pathLen = lengthsRef.current[idx] || 100;
                  const dashOffset = isCurrentlyDrawing ? pathLen * (1 - strokeProgress) : 0;

                  return (
                    <path
                      key={`stroke-${activeCharacter}-${idx}`}
                      d={s.d}
                      fill="none"
                      stroke={KANJI_STROKE_COLOR}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: isCurrentlyDrawing ? `${pathLen} ${pathLen}` : 'none',
                        strokeDashoffset: isCurrentlyDrawing ? dashOffset : 0,
                      }}
                    />
                  );
                })}
              </g>

              {/* 3. Small, Elegant Circular Number Badges */}
              {showNumbers && strokeData.strokes.map((s, idx) => {
                if (idx > currentStrokeIdx) return null;

                const x = s.numX !== undefined ? s.numX : 50;
                const y = s.numY !== undefined ? s.numY : 50;
                const isCurrent = idx === currentStrokeIdx;
                const isTwoDigit = s.number >= 10;
                const radius = isTwoDigit ? 4.4 : 3.6;

                return (
                  <g key={`num-${activeCharacter}-${idx}`} className="select-none pointer-events-none">
                    {/* Badge circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={isCurrent ? '#f59e0b' : '#1e1a2e'}
                      stroke={isCurrent ? '#fbbf24' : '#d97706'}
                      strokeWidth="0.8"
                    />
                    {/* Number text */}
                    <text
                      x={x}
                      y={y}
                      fill={isCurrent ? '#18181b' : '#fef3c7'}
                      fontSize={isTwoDigit ? '3.8' : '4.4'}
                      fontWeight="bold"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {s.number}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          /* Fallback Calligraphy rendering if offline */
          <div className="relative flex items-center justify-center select-none">
            <span className="text-7xl font-bold font-jp text-white">
              {activeCharacter}
            </span>
          </div>
        )}
      </div>

      {/* Control Toolbar under Canvas */}
      <div className="flex items-center justify-center gap-2 mt-2.5">
        {/* Replay */}
        <button
          type="button"
          onClick={handleReplay}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition cursor-pointer active:scale-95"
          title="Vẽ lại nét từ đầu"
        >
          <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
          <span>Vẽ lại</span>
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePlayPause}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition cursor-pointer active:scale-95"
          title={isPlaying ? "Tạm dừng" : "Tiếp tục vẽ"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Dừng</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFinished ? "Xem lại" : "Tiếp tục"}</span>
            </>
          )}
        </button>

        {/* Toggle Numbers */}
        <button
          type="button"
          onClick={() => setShowNumbers(prev => !prev)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer active:scale-95 ${
            showNumbers 
              ? 'bg-purple-950/60 text-purple-200 border-purple-800/60' 
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
          title="Bật/Tắt số thứ tự nét"
        >
          <Hash className="w-3.5 h-3.5 text-amber-400" />
          <span>{showNumbers ? "Ẩn số" : "Hiện số"}</span>
        </button>

        {/* Speed */}
        <button
          type="button"
          onClick={toggleSpeed}
          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono transition cursor-pointer active:scale-95"
          title="Tốc độ vẽ"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
};
