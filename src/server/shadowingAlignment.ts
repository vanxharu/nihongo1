import type { ShadowingCue, ShadowingTextTiming } from '../utils/shadowing.js';
import { validShadowingTimings } from '../utils/shadowing.js';

/** Map measured character timestamps back to the original Japanese caption text. */
export function attachForcedAlignment(cues: ShadowingCue[], data: any): ShadowingCue[] {
  if (!Array.isArray(data?.characters) || !data.characters.length) throw new Error('Dịch vụ chưa trả mốc từng chữ.');
  const characters: { text: string; start: number; end: number }[] = [];
  let previousEnd = 0;
  for (const item of data.characters) {
    if (!item || typeof item.text !== 'string' || !Number.isFinite(item.start) || !Number.isFinite(item.end) ||
        item.start < previousEnd - 0.001 || item.end < item.start) throw new Error('Mốc âm thanh không hợp lệ hoặc bị đảo thứ tự.');
    // Do not split multi-character records and invent timing for each character.
    if (Array.from(item.text).length !== 1) throw new Error('Dữ liệu căn chỉnh phải có mốc riêng cho từng chữ.');
    previousEnd = item.end;
    if (!/^\s$/u.test(item.text)) characters.push(item);
  }
  const expected = cues.map(cue => cue.text).join('').replace(/\s/g, '');
  if (characters.map(c => c.text).join('') !== expected) throw new Error('Nội dung căn chỉnh không khớp phụ đề gốc.');
  let index = 0;
  const result = cues.map(cue => {
    const timings: ShadowingTextTiming[] = [];
    let offset = 0;
    for (const char of cue.text) {
      if (!/^\s$/u.test(char)) {
        const measured = characters[index++];
        timings.push({ ...measured, textStart: offset, textEnd: offset + char.length });
      }
      offset += char.length;
    }
    if (!timings.length) throw new Error('Có câu phụ đề rỗng.');
    // Music/noise labels and unrecognized utterances have no trustworthy speech timing.
    if (/^\[[^\]]+\]$/.test(cue.text.trim()) || timings.at(-1)!.end <= timings[0].start) {
      const fallback = { ...cue }; delete fallback.timings; return fallback;
    }
    const result = { ...cue, start: timings[0].start, end: Math.max(timings.at(-1)!.end, timings[0].start + 0.001), timings };
    if (!validShadowingTimings(result)) throw new Error('Không thể ghép mốc âm thanh với câu phụ đề.');
    return result;
  });
  result.sort((a, b) => a.start! - b.start!);
  result.forEach((cue, index) => {
    const next = result.slice(index + 1).find(item => item.start! > cue.start!);
    if (next) cue.end = Math.min(cue.end!, next.start!);
    // If an unrecognized caption overlaps recognized speech, do not invent its timing.
    if (cue.timings && !validShadowingTimings(cue)) delete cue.timings;
  });
  return result;
}
