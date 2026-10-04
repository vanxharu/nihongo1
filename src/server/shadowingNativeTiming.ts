import { load } from 'cheerio';
import type { ShadowingCue } from '../utils/shadowing.js';
import { validShadowingTimings } from '../utils/shadowing.js';

/** Preserve srv3 word onsets which youtube-transcript otherwise discards. */
export function parseYouTubeWordCaptions(xml: string): ShadowingCue[] {
  if (!xml.includes('<timedtext') || xml.length > 2_000_000) return [];
  const $ = load(xml, { xml: true });
  const cues: ShadowingCue[] = [];
  $('body > p').each((_, element) => {
    const p = $(element);
    if (p.attr('a') === '1' || !p.attr('t') || !p.attr('d')) return;
    const start = Number(p.attr('t')) / 1000;
    const end = start + Number(p.attr('d')) / 1000;
    const text = p.text().trim();
    if (!text || text.length > 1000 || !Number.isFinite(start) || start < 0 || !Number.isFinite(end) || end <= start) return;
    const cue: ShadowingCue = { id: `youtube-${cues.length}`, text, start, end };
    const segments = p.children('s').toArray();
    if (segments.length > 1 && segments.some(s => $(s).attr('t') !== undefined)) {
      let offset = 0;
      const timings = segments.map((s, i) => {
        const segment = $(s);
        const word = segment.text();
        const onset = start + (i === 0 && segment.attr('t') === undefined ? 0 : Number(segment.attr('t') ?? NaN) / 1000);
        const timing = { text: word, textStart: offset, textEnd: offset + word.length, start: onset, end: onset };
        offset += word.length;
        return timing;
      });
      if (validShadowingTimings({ ...cue, timings })) cue.timings = timings;
    }
    cues.push(cue);
  });
  // Native caption durations include rolling display persistence, not speech duration.
  const result = cues.slice(0, 500).sort((a, b) => a.start! - b.start!);
  result.forEach((cue, i) => {
    const next = result.slice(i + 1).find(item => item.start! > cue.start!);
    if (next) cue.end = Math.min(cue.end!, next.start!);
    if (cue.timings && !validShadowingTimings(cue)) delete cue.timings;
  });
  return result;
}
