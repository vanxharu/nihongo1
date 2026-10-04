import { readFile, writeFile } from 'node:fs/promises';
import { SHADOWING_VIDEOS } from '../src/data/shadowingVideos.js';
import { parseYouTubeWordCaptions } from '../src/server/shadowingNativeTiming.js';
import { validShadowingTimings } from '../src/utils/shadowing.js';
import type { ShadowingCue } from '../src/utils/shadowing.js';

// Import only measured onsets from downloaded original Japanese srv3 captions.
// Exact text and timestamp matching keeps translations attached to their original cues.
for (const video of SHADOWING_VIDEOS) {
  const id = video.youtube_video_id;
  const path = `.shadowing-work/prepared/${id}.json`;
  const packet = JSON.parse(await readFile(path, 'utf8'));
  const native = parseYouTubeWordCaptions(await readFile(`.shadowing-work/${id}.ja.srv3`, 'utf8'));
  if (!native.length) throw new Error(`${id}: thiếu phụ đề gốc`);
  let matched = 0;
  for (const cue of packet.cues as ShadowingCue[]) {
    const original = native.find(n => n.text === cue.text && Math.abs(n.start! - cue.start!) < 0.1);
    if (original?.timings && validShadowingTimings({ ...cue, timings: original.timings })) {
      cue.timings = original.timings;
      matched++;
    }
  }
  packet.timingSource = 'youtube-native-word-onsets';
  packet.timedCueCount = matched;
  await writeFile(path, JSON.stringify(packet));
  console.log(`${video.code}: ${matched}/${packet.cues.length} câu có mốc từ gốc.`);
}
