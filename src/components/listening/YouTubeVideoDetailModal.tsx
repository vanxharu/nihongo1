import React, { useRef, useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  ExternalLink, 
  Share2,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { YouTubeListeningVideo, UserVideoProgress } from '../../types';
import { YouTubePlayer, YouTubePlayerRef } from './YouTubePlayer';
import { DraftAnswerSheet } from './DraftAnswerSheet';

interface YouTubeVideoDetailModalProps {
  video: YouTubeListeningVideo;
  userId?: string;
  progress?: UserVideoProgress;
  onClose: () => void;
  onToggleBookmark: (videoId: string) => void;
  onToggleCompleted: (videoId: string) => void;
  onProgressUpdate: (videoId: string, currentTime: number, duration: number, isCompleted?: boolean) => void;
  onCompleted: (videoId: string) => void;
  onResetProgress?: (videoId: string) => void;
  onEarnXp?: (amount: number, reason: string) => void;
}

export const YouTubeVideoDetailModal: React.FC<YouTubeVideoDetailModalProps> = ({
  video,
  userId = 'default_user',
  progress,
  onClose,
  onToggleBookmark,
  onToggleCompleted,
  onProgressUpdate,
  onCompleted,
  onResetProgress,
  onEarnXp
}) => {
  const playerRef = useRef<YouTubePlayerRef>(null);
  const [showAnswerSheet, setShowAnswerSheet] = useState<boolean>(true);

  // Preserve initial resume time for YouTube video player
  const initialTimeRef = useRef<number>(progress?.currentTime || 0);

  // Quick seeking helpers
  const handleRewind = (seconds: number = 5) => {
    if (playerRef.current) {
      const cur = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, cur - seconds), true);
    }
  };

  const handleForward = (seconds: number = 10) => {
    if (playerRef.current) {
      const cur = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(cur + seconds, true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Luyện nghe JLPT ${video.level}: ${video.title}`,
        url: video.youtube_url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(video.youtube_url);
      alert('Đã sao chép liên kết video vào bộ nhớ tạm!');
    }
  };

  const isBookmarked = progress?.bookmarked || false;
  const isCompleted = progress?.completed || false;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl xl:max-w-7xl bg-[#0b101c] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[96vh]">
        
        {/* Modal Top Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs shrink-0">
                  JLPT {video.level}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">
                  {video.title}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Answer Sheet Visibility Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAnswerSheet(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showAnswerSheet
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Bật/tắt bảng chọn đáp án nháp"
            >
              <span>📝 Bảng đáp án</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-extrabold text-emerald-400">
                {showAnswerSheet ? 'BẬT' : 'TẮT'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(video.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isBookmarked ? 'Đã lưu vào danh sách' : 'Lưu bài nghe này'}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer hidden sm:flex"
              title="Chia sẻ"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable with Side-by-Side on Desktop */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5">
          <div className={`grid grid-cols-1 ${showAnswerSheet ? 'lg:grid-cols-12 gap-5' : ''} items-start`}>
            
            {/* Left/Main Column: YouTube Player + Controls */}
            <div className={`space-y-3.5 ${showAnswerSheet ? 'lg:col-span-7 xl:col-span-8' : 'w-full'}`}>
              
              {/* YouTube Player */}
              <div className="rounded-2xl overflow-hidden border border-slate-800/80 bg-black shadow-xl">
                <YouTubePlayer
                  ref={playerRef}
                  videoId={video.youtube_video_id}
                  userId={userId}
                  initialTime={initialTimeRef.current}
                  initialDuration={progress?.duration || video.durationSeconds || 0}
                  initialCompleted={isCompleted}
                  title={video.title}
                  sourceName={video.source}
                  sourceUrl={video.source_url}
                  onProgress={(cur, dur, isComp) => {
                    onProgressUpdate(video.id, cur, dur, isComp);
                  }}
                  onCompleted={() => {
                    onCompleted(video.id);
                    if (onEarnXp) {
                      onEarnXp(50, `Hoàn thành bài nghe ${video.level}: ${video.title}`);
                    }
                  }}
                  onResetProgress={() => {
                    if (onResetProgress) onResetProgress(video.id);
                  }}
                />
              </div>

              {/* Quick Playback Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRewind(5)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Tua lại 5 giây để nghe lại câu vừa rồi"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                    <span>-5s</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleForward(10)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Tua tới 10 giây"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-teal-400" />
                    <span>+10s</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleCompleted(video.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCompleted ? '✓ Đã hoàn thành (+50 XP)' : 'Đánh dấu đã học'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {video.source && (
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      Kênh: <strong className="text-slate-300 font-semibold">{video.source}</strong>
                    </span>
                  )}
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors py-1.5 px-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold"
                  >
                    <span>Mở trên YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Draft Answer Sheet (always visible side-by-side on desktop, or stacked on mobile) */}
            {showAnswerSheet && (
              <div className="lg:col-span-5 xl:col-span-4 mt-4 lg:mt-0">
                <DraftAnswerSheet 
                  storageKey={`draft_answers_${video.youtube_video_id || video.id}`} 
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
