import type { YouTubeListeningVideo } from '../types';
import { SHADOWING_EXTRA } from './shadowingExtra.js';

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

const NOOK: YouTubeListeningVideo[] = videos.map(([id, year, seconds], index) => ({
  id: `shadowing-n4-${id}`, code: `N4 Đề luyện ${index + 1}`,
  title: `Bài ${String(index + 1).padStart(2, '0')} · ${year}`,
  youtube_url: `https://www.youtube.com/watch?v=${id}`, youtube_video_id: id,
  level: 'N4', category: 'Listening Practice', source: 'The Nihongo Nook',
  source_url: `https://www.youtube.com/watch?v=${id}`,
  description: `Đề luyện nghe JLPT N4 phiên bản ${year}, có đáp án và phụ đề tiếng Nhật. Nguồn: The Nihongo Nook. Đây là đề luyện do kênh biên soạn.`,
  duration: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
  durationSeconds: seconds, thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  has_answers: true, status: 'active', order: index + 1,
  createdAt: '2026-10-04T00:00:00.000Z', updatedAt: '2026-10-04T00:00:00.000Z',
}));

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const counters: Record<string, number> = {};
// Added 2026-10-28: channel practice tests and learner podcasts; captions are YouTube Japanese captions (no Vietnamese).
const EXTRA: YouTubeListeningVideo[] = SHADOWING_EXTRA.map(([id, seconds, source, level, kind, original]) => {
  const n = counters[source] = (counters[source] || 0) + 1;
  const exam = kind === 'exam';
  return {
    id: `shadowing-${kind}-${id}`, code: exam ? `N4 Đề ${n}` : `Podcast ${n}`,
    title: exam ? `Đề luyện nghe N4 · Bài ${String(n).padStart(2, '0')}` : original,
    youtube_url: `https://www.youtube.com/watch?v=${id}`, youtube_video_id: id, level, category: 'Listening Practice', source,
    source_url: `https://www.youtube.com/watch?v=${id}`,
    description: exam ? `Đề luyện nghe JLPT N4 do kênh ${source} biên soạn, có đáp án trong video và phụ đề tiếng Nhật.` : `Podcast tiếng Nhật cho người học của kênh ${source}, có phụ đề tiếng Nhật.`,
    duration: mmss(seconds), durationSeconds: seconds, thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    has_answers: exam, status: 'active', order: 100 + n, createdAt: '2026-10-28T00:00:00.000Z', updatedAt: '2026-10-28T00:00:00.000Z',
  };
});

export const SHADOWING_VIDEOS: YouTubeListeningVideo[] = [...NOOK, ...EXTRA];
