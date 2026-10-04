import type { YouTubeListeningVideo } from '../types';

// Verified against YouTube metadata: embeddable, Japanese captions, 2024/2025 editions.
// These are publisher-created practice tests, not official JLPT past papers.
const videos: [string, number, number][] = [
  ['2Qk4Hq1WqUA', 2025, 2112],
  ['7vv2YNmlROc', 2025, 2162],
  ['v38qUhLDFTM', 2025, 2105],
  ['mrzhud1WQzY', 2025, 2252],
  ['R1Oy-PqXhz4', 2024, 1837],
  ['j3rAe7JAlJQ', 2024, 2225],
  ['-O88m_t7E4c', 2024, 1967],
  ['XwsqZyNPRus', 2024, 1881],
  ['GS5s4yBla1c', 2024, 1595],
  ['uulD42uByjU', 2024, 1897],
];

export const SHADOWING_VIDEOS: YouTubeListeningVideo[] = videos.map(([id, year, seconds], index) => ({
  id: `shadowing-n4-${id}`, code: `N4 Đề luyện ${index + 1}`,
  title: `N4 · Đề luyện nghe ${String(index + 1).padStart(2, '0')} · ${year}`,
  youtube_url: `https://www.youtube.com/watch?v=${id}`, youtube_video_id: id,
  level: 'N4', category: 'Listening Practice', source: 'The Nihongo Nook',
  source_url: `https://www.youtube.com/watch?v=${id}`,
  description: `Đề luyện nghe JLPT N4 phiên bản ${year}, có đáp án và phụ đề tiếng Nhật. Nguồn: The Nihongo Nook. Đây là đề luyện do kênh biên soạn.`,
  duration: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
  durationSeconds: seconds, thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  has_answers: true, status: 'active', order: index + 1,
  createdAt: '2026-10-04T00:00:00.000Z', updatedAt: '2026-10-04T00:00:00.000Z',
}));
