/**
 * YouTube Utility Functions for JLPT Listening Module
 */

/**
 * Regular expressions for matching various YouTube URL formats:
 * - https://www.youtube.com/watch?v=...
 * - https://m.youtube.com/watch?v=...
 * - https://youtu.be/...
 * - https://www.youtube.com/embed/...
 * - https://www.youtube.com/shorts/...
 * - Direct 11-character Video ID
 */
export interface YouTubeParseResult {
  videoId: string | null;
  isValid: boolean;
  isShorts: boolean;
  cleanUrl: string;
  error?: string;
}

export function extractYouTubeVideoId(input: string): YouTubeParseResult {
  if (!input || typeof input !== 'string') {
    return {
      videoId: null,
      isValid: false,
      isShorts: false,
      cleanUrl: '',
      error: 'Vui lòng nhập đường dẫn URL YouTube hoặc ID video'
    };
  }

  const trimmed = input.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return {
      videoId: trimmed,
      isValid: true,
      isShorts: false,
      cleanUrl: `https://www.youtube.com/watch?v=${trimmed}`
    };
  }

  try {
    // Check for YouTube shorts
    const isShorts = trimmed.includes('/shorts/');

    // Match video ID from URL
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        const videoId = match[1];
        return {
          videoId,
          isValid: true,
          isShorts,
          cleanUrl: `https://www.youtube.com/watch?v=${videoId}`,
          error: isShorts 
            ? 'Cảnh báo: Đây là định dạng YouTube Shorts. Video bài thi nghe JLPT nên ưu tiên video tiêu chuẩn (16:9).'
            : undefined
        };
      }
    }

    return {
      videoId: null,
      isValid: false,
      isShorts: false,
      cleanUrl: '',
      error: 'Đường dẫn YouTube không hợp lệ. Vui lòng nhập link dạng youtube.com/watch?v=... hoặc youtu.be/...'
    };
  } catch {
    return {
      videoId: null,
      isValid: false,
      isShorts: false,
      cleanUrl: '',
      error: 'Không thể phân tích URL YouTube này'
    };
  }
}

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format timestamp display (e.g. 18:25)
 */
export function formatResumeTime(totalSeconds: number): string {
  return formatDuration(totalSeconds);
}

/**
 * Get standard YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Friendly time ago in Vietnamese
 */
export function timeAgoVi(dateString: string): string {
  if (!dateString) return 'Chưa xem';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}
