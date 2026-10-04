import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import { SHADOWING_VIDEOS } from '../src/data/shadowingVideos.js';
import { shadowingDatabase, validateStoredCues, writeVideo, readVideo } from '../src/server/shadowingStore.js';

dotenv.config({ path: '.shadowing-work/preparation.env', quiet: true });
const database = shadowingDatabase();
for (const video of SHADOWING_VIDEOS) {
  const packet = JSON.parse(await readFile(`.shadowing-work/prepared/${video.youtube_video_id}.json`, 'utf8'));
  if (!packet.complete || packet.videoId !== video.youtube_video_id || packet.cues.some((c: any) => !c.translation || !Array.isArray(c.readings))) throw new Error('Dữ liệu chưa chuẩn bị đủ');
  const cues = validateStoredCues(packet.cues);
  const ref = database.collection('shadowing_videos').doc(video.youtube_video_id);
  await writeVideo(ref, video.title, cues);
  const saved = await readVideo(ref);
  if (JSON.stringify(saved?.cues) !== JSON.stringify(cues)) throw new Error('Database chưa khớp dữ liệu đã chuẩn bị');
  console.log(`${video.code}: đã lưu và kiểm tra ${cues.length} câu trong database.`);
}
await database.terminate();
