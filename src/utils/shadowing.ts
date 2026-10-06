export interface ShadowingCue {
  id: string;
  text: string;
  start: number | null;
  end: number | null;
  timings?: ShadowingTextTiming[];
  readings?: { word: string; reading: string; offset?: number }[];
  translation?: string;
}

export interface ShadowingTextTiming {
  text: string;
  textStart: number;
  textEnd: number;
  start: number;
  end: number;
}

/** Reject stale/mismatched alignment rather than painting a different transcript. */
export function validShadowingTimings(cue: ShadowingCue): boolean {
  if (!Array.isArray(cue.timings) || !cue.timings.length || cue.start === null || cue.end === null) return false;
  let previousOffset = 0;
  let previousTime = cue.start;
  return cue.timings.every(t => {
    if (!t || !Number.isInteger(t.textStart) || !Number.isInteger(t.textEnd) || t.textStart < previousOffset ||
        t.textEnd <= t.textStart || cue.text.slice(t.textStart, t.textEnd) !== t.text ||
        !Number.isFinite(t.start) || !Number.isFinite(t.end) || t.start < previousTime || t.end < t.start ||
        t.end > cue.end! + 0.001) return false;
    previousOffset = t.textEnd; previousTime = t.end;
    return true;
  }) && cue.text.replace(/\s/g, '') === cue.timings.map(t => t.text).join('').replace(/\s/g, '');
}

/** Character/word onsets come from audio alignment, never sentence-length estimates. */
export function shadowingTextFill(time: number, offset: number, timings: ShadowingTextTiming[]): number {
  const timing = timings.find(t => offset >= t.textStart && offset < t.textEnd);
  return timing && Number.isFinite(time) && time >= timing.start ? 100 : 0;
}

/** Native captions supply onsets only; aligned audio can also supply word ends. */
export function currentShadowingWord(time: number, cueEnd: number | null, timings: ShadowingTextTiming[]): ShadowingTextTiming | undefined {
  if (!Number.isFinite(time) || cueEnd === null || time >= cueEnd) return undefined;
  const word = [...timings].reverse().find(t => time >= t.start);
  return word && (word.end === word.start || time < word.end) ? word : undefined;
}

/** Visual interpolation only: never store these estimates as measured word timing. */
export function karaokeVisualFill(time: number, offset: number, timings: ShadowingTextTiming[], cueEnd: number | null): number {
  const index = timings.findIndex(t => offset >= t.textStart && offset < t.textEnd);
  if (index < 0 || !Number.isFinite(time) || cueEnd === null) return 0;
  const word = timings[index];
  if (time < word.start) return 0;
  const finish = word.end > word.start ? word.end : Math.min(timings[index + 1]?.start ?? cueEnd, cueEnd, word.start + 0.9);
  if (finish <= word.start || time >= finish) return 100;
  const progress = (time - word.start) / (finish - word.start);
  const characters = Array.from(word.text);
  let position = 0, characterIndex = 0;
  for (const char of characters) { if (position >= offset - word.textStart) break; position += char.length; characterIndex++; }
  return Math.max(0, Math.min(100, (progress * characters.length - characterIndex) * 100));
}

export function parseShadowingAlignment(value: any, videoId: string): ShadowingCue[] {
  if (value?.version !== 1 || value.videoId !== videoId || !Array.isArray(value.cues) || !value.cues.length || value.cues.length > 500) throw new Error('Invalid alignment');
  if (!value.cues.every((cue: ShadowingCue) => cue && typeof cue.id === 'string' && typeof cue.text === 'string' && cue.text.length <= 1000 &&
      Number.isFinite(cue.start) && cue.start! >= 0 && Number.isFinite(cue.end) && cue.end! > cue.start! &&
      (cue.timings === undefined || validShadowingTimings(cue)))) throw new Error('Invalid alignment');
  if (!value.cues.some((cue: ShadowingCue) => validShadowingTimings(cue))) throw new Error('Missing measured timestamps');
  const cues: ShadowingCue[] = [...value.cues].sort((a, b) => a.start! - b.start!);
  if (cues.some((cue, i) => i > 0 && cue.start! < cues[i - 1].end! - 0.001)) throw new Error('Overlapping audio alignment');
  return cues;
}

export interface ShadowingAnalysis {
  readings?: { word: string; reading: string; offset?: number }[];
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

/** Rolling YouTube captions overlap; each sentence owns time until the next starts. */
export function normalizeShadowingTimeline(cues: ShadowingCue[]): ShadowingCue[] {
  const sorted = cues.map(cue => ({ ...cue })).sort((a, b) => (a.start ?? Infinity) - (b.start ?? Infinity));
  return sorted.map((cue, index) => {
    if (cue.start === null || cue.end === null) return cue;
    if (validShadowingTimings(cue)) return cue;
    const next = sorted.slice(index + 1).find(item => item.start !== null && item.start > cue.start!);
    return { ...cue, end: next?.start !== undefined && next.start !== null ? Math.min(cue.end, next.start) : cue.end };
  });
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

/** Keep the last caption visible across real gaps without inventing speech timing. */
export function visibleShadowingCue(cues: ShadowingCue[], time: number): number {
  let latest = -1;
  cues.forEach((cue, index) => {
    if (cue.start !== null && cue.start <= time &&
        (latest < 0 || cue.start >= cues[latest].start!)) latest = index;
  });
  return latest >= 0 ? latest : cues.length ? 0 : -1;
}

export function normalizeDictation(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
}

export async function readShadowingResponse(response: Response): Promise<any> {
  const body = await response.text();
  let data: any;
  try { data = JSON.parse(body); } catch {
    throw new Error(response.status >= 500
      ? 'Máy chủ xử lý phụ đề hoặc phân tích câu đang gặp lỗi. Hãy thử lại sau ít phút.'
      : 'Máy chủ chưa trả về dữ liệu hợp lệ. Hãy tải lại trang và thử lại.');
  }
  if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'Không lấy được dữ liệu. Hãy thử lại.');
  return data;
}

export function dictationChunks(text: string): string[] {
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;
  const parts = segmenter ? Array.from(segmenter.segment(text), part => part.segment) : Array.from(text);
  return parts.filter(part => normalizeDictation(part).length > 0);
}

export function shuffledChunkIds(length: number, random: () => number = Math.random): number[] {
  const ids = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  if (length > 1 && ids.every((id, index) => id === index)) ids.push(ids.shift()!);
  return ids;
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
