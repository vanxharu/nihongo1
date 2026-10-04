export interface ShadowingCue {
  id: string;
  text: string;
  start: number | null;
  end: number | null;
}

export interface ShadowingAnalysis {
  source: 'ai' | 'dictionary';
  translation: string;
  vocabulary: { word: string; reading: string; meaning: string; type?: string }[];
  kanji: { character: string; meaning: string; onyomi: string; kunyomi: string; radical?: string; components?: string; mnemonic?: string }[];
  grammar: { pattern: string; meaning: string; explanation: string; example?: string }[];
  note?: string;
}

/** Sentence timestamps cannot identify exact speech boundaries; interpolate by character. */
export function karaokeProgress(time: number, start: number | null, end: number | null): number {
  if (start === null || end === null || end <= start || !Number.isFinite(time)) return 0;
  return Math.max(0, Math.min(1, (time - start) / (end - start)));
}

export function activeShadowingCue(cues: ShadowingCue[], time: number): number {
  // Prefer the latest starting cue when automatic captions overlap.
  let active = -1;
  cues.forEach((cue, index) => {
    if (cue.start !== null && cue.end !== null && time >= cue.start && time < cue.end &&
      (active < 0 || cue.start >= cues[active].start!)) active = index;
  });
  return active;
}

export function parseShadowingVideoId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : /^\/(embed|shorts|live)\/([\w-]+)/.exec(url.pathname)?.[2] || null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

export function parseShadowingTime(input: string): number | null {
  const value = input.trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(value) && !/^\d+:\d{2}(?::\d{2})?(?:\.\d+)?$/.test(value)) return null;
  const parts = value.split(':').map(Number);
  if (parts.slice(1).some(p => p >= 60)) return null;
  const time = parts.reduce((sum, part) => sum * 60 + part, 0);
  return Number.isFinite(time) && time >= 0 ? time : null;
}

export function validateShadowingRange(start: number | null, end: number | null, duration?: number): string | null {
  if (start === null || end === null || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) return 'Nhập mốc bắt đầu và kết thúc hợp lệ (ví dụ 00:10 → 00:18).';
  if (end - start > 120) return 'Mỗi đoạn luyện tối đa 2 phút. Hãy chọn một câu hoặc đoạn ngắn hơn.';
  if (duration && end > duration + 0.25) return 'Mốc kết thúc vượt quá thời lượng video.';
  return null;
}

function cleanCaption(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

export function parseShadowingSubtitles(input: string): ShadowingCue[] {
  if (input.length > 50000) throw new Error('Phụ đề quá dài. Hãy nhập tối đa 50.000 ký tự mỗi lần.');
  const lines = input.replace(/\r/g, '').split('\n');
  const cues: ShadowingCue[] = [];
  const timed = lines.some(line => line.includes('-->'));
  if (!timed) {
    return lines.map(cleanCaption).filter(Boolean).slice(0, 500).map((text, index) => ({ id: `manual-${index}`, text, start: null, end: null }));
  }
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes('-->')) continue;
    const match = /^(\S+)\s+-->\s+(\S+)/.exec(lines[i].trim());
    const start = match ? parseShadowingTime(match[1]) : null;
    const end = match ? parseShadowingTime(match[2]) : null;
    if (start === null || end === null || end <= start) throw new Error('Có mốc thời gian phụ đề không hợp lệ. Hãy kiểm tra file SRT/VTT.');
    const textLines: string[] = [];
    while (i + 1 < lines.length && lines[i + 1].trim()) textLines.push(lines[++i]);
    const text = cleanCaption(textLines.join(' '));
    if (text) cues.push({ id: `caption-${cues.length}`, text, start, end });
    if (cues.length >= 500) break;
  }
  return cues.sort((a, b) => a.start! - b.start!);
}
