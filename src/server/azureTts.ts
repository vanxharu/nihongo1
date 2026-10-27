import { Communicate } from 'edge-tts-universal';

// In-memory cache for synthesized audio to make repeated words instant (< 5ms)
const audioCache = new Map<string, Buffer>();
// Edge websocket treo: sau một lần hỏng, 60s tới trả lỗi ngay để client chuyển giọng dự phòng, không bắt chờ.
let edgeDownUntil = 0;
const MAX_CACHE_SIZE = 1000;

export type AzureVoice = 
  | 'ja-JP-NanamiNeural' 
  | 'ja-JP-KeitaNeural' 
  | 'ja-JP-AoiNeural'
  | 'ja-JP-DaichiNeural'
  | 'ja-JP-MayuNeural'
  | 'ja-JP-NaokiNeural'
  | 'ja-JP-ShioriNeural'
  | 'nanami' 
  | 'keita';

/**
 * Normalizes voice request names to supported Azure / Edge Japanese Neural Voices
 */
export function normalizeJapaneseVoice(voice: string = 'ja-JP-NanamiNeural'): string {
  const lower = (voice || '').toLowerCase().trim();
  if (lower.includes('keita') || lower === 'male' || lower === 'nam') {
    return 'ja-JP-KeitaNeural';
  }
  if (lower.includes('aoi')) {
    return 'ja-JP-AoiNeural';
  }
  if (lower.includes('daichi')) {
    return 'ja-JP-DaichiNeural';
  }
  if (lower.includes('mayu')) {
    return 'ja-JP-MayuNeural';
  }
  if (lower.includes('naoki')) {
    return 'ja-JP-NaokiNeural';
  }
  if (lower.includes('shiori')) {
    return 'ja-JP-ShioriNeural';
  }
  if (lower.includes('nanami') || lower === 'female' || lower === 'nu' || lower === 'nữ') {
    return 'ja-JP-NanamiNeural';
  }
  if (voice.startsWith('ja-JP-')) {
    return voice;
  }
  return 'ja-JP-NanamiNeural';
}

/**
 * Synthesizes Japanese speech using Microsoft Edge / Azure Neural Voices:
 * - ja-JP-NanamiNeural (Nữ - Giọng chuẩn phát thanh viên Tokyo, trong trẻo, tự nhiên)
 * - ja-JP-KeitaNeural (Nam - Giọng chuẩn đề thi JLPT, trầm ấm, dứt khoát)
 * @param text The Japanese text to synthesize
 * @param voice Voice selection: 'nanami' | 'keita' | 'ja-JP-NanamiNeural' | 'ja-JP-KeitaNeural'
 * @param rateRate Speech rate (e.g. "+0%", "-4%", "+5%")
 * @param pitch Speech pitch (e.g. "+0Hz")
 * @returns Audio Buffer (MP3 24kHz)
 */
export async function synthesizeAzureSpeech(
  text: string,
  voice: string = 'ja-JP-NanamiNeural',
  rateRate: string = '+0%',
  pitch: string = '+0Hz'
): Promise<Buffer> {
  const cleanText = text.trim();
  if (!cleanText) {
    return Buffer.alloc(0);
  }

  const targetVoice = normalizeJapaneseVoice(voice);
  const cacheKey = `tts:${targetVoice}:${rateRate}:${pitch}:${cleanText}`;

  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  if (Date.now() < edgeDownUntil) throw new Error('Edge TTS unavailable');
  // The Edge websocket fails or stalls now and then: one attempt capped at 4s (client falls back on error).
  const synth = async () => {
    const comm = new Communicate(cleanText, {
      voice: targetVoice,
      rate: rateRate || '+0%',
      pitch: pitch || '+0Hz',
    });
    const chunks: Buffer[] = [];
    for await (const chunk of comm.stream()) {
      if (chunk.type === 'audio' && chunk.data) chunks.push(chunk.data);
    }
    return chunks;
  };
  try {
    let chunks: Buffer[] = [];
    for (let attempt = 0; attempt < 1 && chunks.length === 0; attempt++) {
      try {
        chunks = await Promise.race([
          synth(),
          new Promise<Buffer[]>((_, rej) => setTimeout(() => rej(new Error('TTS timeout')), 4000)),
        ]);
      } catch (e) {
        edgeDownUntil = Date.now() + 60_000; throw e;
      }
    }

    if (chunks.length === 0) {
      throw new Error(`Empty audio stream received for voice ${targetVoice}`);
    }

    const finalAudio = Buffer.concat(chunks);

    if (audioCache.size >= MAX_CACHE_SIZE) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, finalAudio);

    return finalAudio;
  } catch (error: any) {
    console.error(`Edge TTS synthesis error for voice ${targetVoice}:`, error?.message || error);
    throw error;
  }
}

// Backward compatibility alias
export const synthesizeNanamiSpeech = (text: string, rate: string = '+0%', pitch: string = '+0Hz') => 
  synthesizeAzureSpeech(text, 'ja-JP-NanamiNeural', rate, pitch);


// Edge-TTS parameters come straight from the client: cap the text and allow only well-formed voice/rate/pitch.
export function ttsParams(text: unknown, voice: unknown, rate: unknown, pitch: unknown) {
  const t = String(text ?? '').trim();
  if (t.length > 600) return null;
  const v = /^[a-z]{2}-[A-Z]{2}-\w{2,30}Neural$/.test(String(voice)) ? String(voice) : 'ja-JP-NanamiNeural';
  const r = /^[+-]\d{1,3}%$/.test(String(rate)) ? String(rate) : '+0%';
  const p = /^[+-]\d{1,3}Hz$/.test(String(pitch)) ? String(pitch) : '+0Hz';
  return { text: t, voice: v, rate: r, pitch: p };
}

