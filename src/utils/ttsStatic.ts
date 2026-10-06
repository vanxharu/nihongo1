/**
 * Dùng chung cho trình duyệt và script tạo mp3 (không phụ thuộc DOM).
 * File tạo sẵn nằm ở /audio/tts/<giọng>/<tốc độ>/<hash>.mp3
 */

export function cleanJapaneseTextForSpeech(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Strip HTML tags (like <ruby>漢字<rt>かんじ</rt></ruby>)
  if (cleaned.includes('<')) {
    cleaned = cleaned.replace(/<rt[^>]*>[\s\S]*?<\/rt>/gi, '');
    cleaned = cleaned.replace(/<rp[^>]*>[\s\S]*?<\/rp>/gi, '');
    cleaned = cleaned.replace(/<[^>]+>/g, '');
  }

  // 2. Remove speaker label prefixes like "山田：" or "A:" or "Nam:"
  cleaned = cleaned.replace(/^(男|女|男性|女性|山田|田中|佐藤|鈴木|Keita|Nanami|Nam|Nữ|A|B)[:：]\s*/i, '');

  // 3. Remove reading in brackets if paired with kanji: 食べる(たべる) -> 食べる
  cleaned = cleaned.replace(/([\u4e00-\u9faf]+)[（(][\u3040-\u309f\u30a0-\u30ff]+[）)]/g, '$1');
  cleaned = cleaned.replace(/([\u4e00-\u9faf]+)\[[\u3040-\u309f\u30a0-\u30ff]+\]/g, '$1');

  // 4. Remove leftover bracket characters, quotation marks, punctuation noise
  cleaned = cleaned.replace(/[【】\[\]()（）「」『』""''“”]/g, ' ');

  // 5. Remove slash or tildes which might be read weirdly (e.g. ～, 〜, ／)
  cleaned = cleaned.replace(/[／/]/g, ' ');
  cleaned = cleaned.replace(/[～〜~]/g, '');

  // 6. Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}


// cyrb53: hash 53-bit đồng bộ, đủ ít va chạm cho vài chục nghìn câu.
export function ttsHash(str: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}

export const STATIC_TTS_VOICES = ['ja-JP-NanamiNeural', 'ja-JP-KeitaNeural'] as const;
// Chỉ tạo sẵn 2 tốc độ app thực sự dùng: từ đơn (-4%) và câu (+0%).
export const STATIC_TTS_RATES = ['-4%', '+0%'] as const;

export function staticTtsPath(cleanText: string, voice: string, rate: string): string | null {
  if (!(STATIC_TTS_VOICES as readonly string[]).includes(voice)) return null;
  if (!(STATIC_TTS_RATES as readonly string[]).includes(rate)) return null;
  const v = voice.includes('Keita') ? 'keita' : 'nanami';
  const r = rate === '+0%' ? 'r0' : 'rm4';
  return `audio/tts/${v}/${r}/${ttsHash(cleanText)}.mp3`;
}

export function staticTtsUrl(cleanText: string, voice: string, rate: string): string | null {
  const path = staticTtsPath(cleanText, voice, rate);
  return path ? `/${path}` : null;
}
