import React from 'react';
import { Play, Bookmark, BookmarkCheck, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { YouTubeListeningVideo, UserVideoProgress, JLPTLevel } from '../../types';
import { formatDuration } from '../../utils/youtubeUtils';

interface YouTubeVideoCardProps {
  video: YouTubeListeningVideo;
  progress?: UserVideoProgress;
  onSelect: (video: YouTubeListeningVideo) => void;
  onToggleBookmark: (videoId: string, e: React.MouseEvent) => void;
}

const LEVEL_COLORS: Record<JLPTLevel, { bg: string; text: string; border: string }> = {
  N5: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  N4: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  N3: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  N2: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  N1: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' }
};

const CATEGORY_LABELS: Record<string, string> = {
  'Official Sample': 'Đề mẫu chính thức',
  'Sample Exam': 'Đề thi mẫu',
  'Listening Practice': 'Luyện tập nghe',
  'Mock Test': 'Thi thử (Mock Test)',
  'JLPT-style': 'Dạng đề JLPT'
};

export const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({
  video,
  progress,
  onSelect,
  onToggleBookmark
}) => {
  const isBookmarked = progress?.bookmarked || false;
  const isCompleted = progress?.completed || false;
  const currentTime = progress?.currentTime || 0;
  const duration = progress?.duration || video.durationSeconds || 0;
  const percent = progress?.progressPercent || (duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0);
  const inProgress = !isCompleted && (percent > 0 || currentTime >= 5);
  const levelStyle = LEVEL_COLORS[video.level] || LEVEL_COLORS.N4;

  return (
    <div 
      onClick={() => onSelect(video)}
      className="group relative bg-[#121927] hover:bg-[#161f32] border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg hover:shadow-2xl hover:shadow-emerald-950/20 cursor-pointer"
    >
      {/* Thumbnail with overlay & duration */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={video.thumbnail || `https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtube_video_id}/mqdefault.jpg`;
          }}
        />

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Center Play Button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Top Badges: Level & Code */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className={`px-2 py-0.5 text-xs font-extrabold rounded-md ${levelStyle.bg} ${levelStyle.text} border ${levelStyle.border} backdrop-blur-md shadow-sm`}>
            {video.level}
          </span>
          {video.code && (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-sm">
              {video.code}
            </span>
          )}
        </div>

        {/* Bookmark Button top-right */}
        <button
          type="button"
          aria-label={isBookmarked ? 'Bỏ lưu bài nghe' : 'Lưu bài nghe'}
          onClick={(e) => onToggleBookmark(video.id, e)}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
            isBookmarked 
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' 
              : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80 border border-white/10'
          }`}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>

        {/* Bottom Right: Duration */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-white/10">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{video.duration}</span>
          </div>
        )}

        {/* Progress Bar along the bottom of thumbnail */}
        {(percent > 0 || isCompleted) && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800/80">
            <div 
              className={`h-full transition-all duration-300 ${
                isCompleted 
                  ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' 
                  : 'bg-teal-400'
              }`}
              style={{ width: `${Math.min(100, isCompleted ? 100 : percent)}%` }}
            />
          </div>
        )}
      </div>

      {/* Content details */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          {/* Category & Single Progress Status */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50 truncate max-w-[140px]">
              {CATEGORY_LABELS[video.category] || video.category}
            </span>

            {/* Single clean status indicator (no duplicate times) */}
            {isCompleted ? (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã học</span>
              </span>
            ) : inProgress ? (
              <span className="text-[11px] font-bold text-teal-400 shrink-0">
                {percent}% • {formatDuration(currentTime)}
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-500 shrink-0">
                Chưa học
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
            {video.title}
          </h3>
        </div>

        {/* Compact bottom bar: Source channel + Action Button */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400 truncate max-w-[140px] sm:max-w-[170px]" title={video.source}>
            {video.source}
          </span>

          {isCompleted ? (
            <button
              type="button"
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Nghe lại</span>
            </button>
          ) : inProgress ? (
            <button
              type="button"
              className="px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-sm shadow-teal-500/20 shrink-0 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Tiếp tục</span>
            </button>
          ) : (
            <button
              type="button"
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Bắt đầu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

