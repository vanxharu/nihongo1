import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { attachForcedAlignment } from '../src/server/shadowingAlignment.js';
import { parseShadowingAlignment } from '../src/utils/shadowing.js';
import { parseYouTubeWordCaptions } from '../src/server/shadowingNativeTiming.js';

// Administrator-only offline job. Never expose a paid alignment endpoint publicly.
const args = process.argv.slice(2);
function option(name: string) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; }
const videoId = option('--video-id');
if (!videoId || !/^[\w-]{11}$/.test(videoId)) throw new Error('Dùng --video-id với ID YouTube hợp lệ.');
const root = fileURLToPath(new URL('..', import.meta.url));
const nativePath = option('--youtube-srv3');
if (nativePath) {
  const cues = parseYouTubeWordCaptions(await readFile(nativePath, 'utf8'));
  const packet = { version: 1, videoId, source: 'youtube-native-word-onsets', cues };
  parseShadowingAlignment(packet, videoId);
  const output = resolve(root, 'public/shadowing-alignments', `${videoId}.json`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(packet));
  console.log(`Đã lưu ${cues.length} câu, ${cues.filter(c => c.timings?.length).length} câu có mốc từ gốc.`);
  process.exit(0);
}
const transcriptPath = option('--transcript');
const baseUrl = process.env.SHADOWING_SITE_URL || 'https://nihongojlpt.vercel.app';
let transcript: any;
if (transcriptPath) transcript = JSON.parse(await readFile(transcriptPath, 'utf8'));
else {
  const response = await fetch(`${baseUrl}/api/shadowing/transcript?videoId=${videoId}`, { signal: AbortSignal.timeout(40000) });
  if (!response.ok) throw new Error(`Không lấy được phụ đề gốc: HTTP ${response.status}`);
  transcript = await response.json();
}
const cues = transcript.cues;
if (!Array.isArray(cues) || !cues.length || cues.length > 500 || cues.some(c => !c || typeof c.text !== 'string' || !c.text.trim() || c.text.length > 1000)) throw new Error('Phụ đề đầu vào không hợp lệ.');
const text = cues.map(c => c.text).join('\n');
let alignment: any;
const alignmentPath = option('--alignment');
if (alignmentPath) alignment = JSON.parse(await readFile(alignmentPath, 'utf8'));
else {
  const audioPath = option('--audio');
  if (!audioPath || !process.env.ELEVENLABS_API_KEY) throw new Error('Cần --audio là âm thanh gốc từ giây 0 và ELEVENLABS_API_KEY trong môi trường (không ghi khóa vào mã nguồn).');
  const audio = await readFile(audioPath);
  if (audio.length > 200 * 1024 * 1024) throw new Error('Âm thanh vượt quá giới hạn 200 MB của công cụ.');
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(audio)]), audioPath.split(/[\\/]/).at(-1)!);
  form.set('text', text);
  console.log(`Đang căn chỉnh ${cues.length} câu với âm thanh gốc…`);
  const response = await fetch('https://api.elevenlabs.io/v1/forced-alignment', {
    method: 'POST', headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }, body: form,
    signal: AbortSignal.timeout(600000),
  });
  // Never print response bodies, headers, or credentials.
  if (!response.ok) throw new Error(`ElevenLabs không căn chỉnh được: HTTP ${response.status}`);
  alignment = await response.json();
  const saveResult = option('--save-result');
  if (saveResult) await writeFile(saveResult, JSON.stringify(alignment));
}
const result = { version: 1, videoId, source: 'elevenlabs-forced-alignment', cues: attachForcedAlignment(cues, alignment) };
parseShadowingAlignment(result, videoId);
const output = resolve(root, 'public/shadowing-alignments', `${videoId}.json`);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(result));
console.log(`Đã lưu ${result.cues.length} câu, ${result.cues.filter(c => c.timings?.length).length} câu có mốc từng chữ: ${output}`);
