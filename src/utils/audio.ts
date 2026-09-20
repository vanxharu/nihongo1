/**
 * Utility for synthesizing feedback sound effects (correct "ting" and incorrect "buzz")
 * using the Web Audio API without needing external static file assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  const saved = localStorage.getItem('jlpt_sound_enabled');
  return saved !== 'false'; // default to true
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem('jlpt_sound_enabled', enabled ? 'true' : 'false');
  // Dispatch a custom event to notify components that sound settings changed
  window.dispatchEvent(new Event('jlpt_sound_setting_changed'));
}

/**
 * Plays a pleasant double chime "ting" sound for correct answers
 */
export function playCorrectSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First tone (pleasant sine)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.50, now); // C6
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second delayed tone for the chime effect (E6 to G6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.23); // G6

    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch (e) {
    console.warn('Web Audio API not allowed or supported yet:', e);
  }
}

/**
 * Plays a descending low "buzz" sound for incorrect answers
 */
export function playIncorrectSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Use dual oscillators (one triangle, one sawtooth) for a rich "buzz" sound
    osc1.type = 'triangle';
    osc2.type = 'sawtooth';

    // Slide down in frequency
    osc1.frequency.setValueAtTime(130.81, now); // C3
    osc1.frequency.linearRampToValueAtTime(98.00, now + 0.25); // G2

    osc2.frequency.setValueAtTime(131.5, now); // slightly detuned for chorus effect
    osc2.frequency.linearRampToValueAtTime(98.5, now + 0.25);

    // Soften the harshness of the sawtooth with a lowpass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);
    osc2.start(now);
    osc2.stop(now + 0.35);
  } catch (e) {
    console.warn('Web Audio API not allowed or supported yet:', e);
  }
}

/**
 * Plays a cute, high-pitched Japanese spirit bell chime for the Kitsune Mascot
 */
export function playKitsuneSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Bell Ring 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Bell Ring 2 (Sparkly harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.22);

    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.10);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.22);
  } catch (e) {
    console.warn('Web Audio API not allowed or supported yet:', e);
  }
}

/**
 * Plays a cute, soft double owl hoot sound "hooh-hooh" (aliased to Kitsune sound)
 */
export function playOwlSound() {
  playKitsuneSound();
}

/**
 * Plays a grand, satisfying ascending chime for major milestones & goals
 */
export function playMilestoneChime() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Notes of a beautiful major arpeggio: C5, E5, G5, C6, E6, G6
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    const delays = [0, 0.08, 0.16, 0.24, 0.32, 0.40];
    const volumes = [0.08, 0.08, 0.08, 0.1, 0.12, 0.12];
    const durations = [0.6, 0.6, 0.8, 1.0, 1.2, 1.5];

    notes.forEach((freq, index) => {
      const delay = delays[index];
      const vol = volumes[index];
      const dur = durations[index];
      const startTime = now + delay;

      // Primary tone (sine)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + dur);

      // Subtle high-pitch crystalline overtone (triangle wave at 2x frequency, very soft)
      const overtoneOsc = ctx.createOscillator();
      const overtoneGain = ctx.createGain();

      overtoneOsc.type = 'triangle';
      overtoneOsc.frequency.setValueAtTime(freq * 2, startTime);

      overtoneGain.gain.setValueAtTime(0, startTime);
      overtoneGain.gain.linearRampToValueAtTime(vol * 0.25, startTime + 0.03);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, startTime + dur * 0.7);

      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);

      overtoneOsc.start(startTime);
      overtoneOsc.stop(startTime + dur * 0.7);
    });
  } catch (e) {
    console.warn('Web Audio API not allowed or supported yet:', e);
  }
}

/**
 * Alias for playMilestoneChime for test/exam celebrations
 */
export const playCelebrationSound = playMilestoneChime;

// Cache for Japanese voices
let cachedJaVoice: SpeechSynthesisVoice | null = null;

export type AzureVoiceChoice = 
  | 'ja-JP-NanamiNeural' 
  | 'ja-JP-KeitaNeural' 
  | 'ja-JP-AoiNeural'
  | 'ja-JP-DaichiNeural'
  | 'ja-JP-MayuNeural'
  | 'ja-JP-NaokiNeural'
  | 'ja-JP-ShioriNeural'
  | 'nanami' 
  | 'keita'
  | string;

export interface JapaneseVoiceOption {
  id: string;
  name: string;
  gender: 'female' | 'male';
  genderLabel: string;
  description: string;
  sampleText: string;
  badge?: string;
  isNeural: boolean;
}

export const PRESET_JAPANESE_VOICES: JapaneseVoiceOption[] = [
  {
    id: 'ja-JP-NanamiNeural',
    name: 'Nanami',
    gender: 'female',
    genderLabel: 'Nữ',
    description: 'Phát thanh viên Tokyo, trong trẻo, chuẩn thi JLPT',
    sampleText: 'こんにちは！七海です。日本語の勉強を一緒に頑張りましょう！',
    badge: 'Khuyên dùng ⭐5',
    isNeural: true,
  },
  {
    id: 'ja-JP-KeitaNeural',
    name: 'Keita',
    gender: 'male',
    genderLabel: 'Nam',
    description: 'Chuẩn đề thi JLPT N4-N2, trầm ấm, dứt khoát',
    sampleText: 'はじめまして！慶太です。JLPT合格を目指して頑張ろう！',
    badge: 'Chuẩn JLPT ⭐5',
    isNeural: true,
  },
  {
    id: 'ja-JP-AoiNeural',
    name: 'Aoi',
    gender: 'female',
    genderLabel: 'Nữ',
    description: 'Giọng nữ nhẹ nhàng, trẻ trung, đĩnh đạc tự nhiên',
    sampleText: '葵です！今日も楽しく日本語を練習しましょうね。',
    badge: 'Tự nhiên',
    isNeural: true,
  },
  {
    id: 'ja-JP-DaichiNeural',
    name: 'Daichi',
    gender: 'male',
    genderLabel: 'Nam',
    description: 'Giọng nam sôi nổi, năng động, phong cách hội thoại',
    sampleText: '大智です！毎日の積み重ねが合格への近道だよ。',
    badge: 'Sôi nổi',
    isNeural: true,
  },
  {
    id: 'ja-JP-MayuNeural',
    name: 'Mayu',
    gender: 'female',
    genderLabel: 'Nữ',
    description: 'Giọng nữ ấm áp, thân thiện, truyền cảm',
    sampleText: '真由です。一歩ずつ着実に進んでいきましょう。',
    badge: 'Ấm áp',
    isNeural: true,
  },
  {
    id: 'ja-JP-NaokiNeural',
    name: 'Naoki',
    gender: 'male',
    genderLabel: 'Nam',
    description: 'Giọng nam chững chạc, phát âm rõ từng chữ',
    sampleText: '直樹です。正しい発音とイントネーションを身につけましょう。',
    badge: 'Rõ ràng',
    isNeural: true,
  },
  {
    id: 'ja-JP-ShioriNeural',
    name: 'Shiori',
    gender: 'female',
    genderLabel: 'Nữ',
    description: 'Giọng nữ êm dịu, chuẩn phong cách đọc sách và tin tức',
    sampleText: '詩織です。落ち着いて日本語の文章を読み解きましょう。',
    badge: 'Điềm tĩnh',
    isNeural: true,
  },
];

export function getVoiceDisplayName(voiceId: string): string {
  if (!voiceId) return 'Nanami (Nữ)';
  const normalized = voiceId === 'nanami' ? 'ja-JP-NanamiNeural' : voiceId === 'keita' ? 'ja-JP-KeitaNeural' : voiceId;
  const found = PRESET_JAPANESE_VOICES.find(v => v.id === normalized);
  if (found) return `${found.name} (${found.genderLabel})`;
  if (voiceId.startsWith('device:')) {
    const rawName = voiceId.replace('device:', '');
    return `${rawName} (Thiết bị)`;
  }
  if (voiceId.toLowerCase().includes('keita')) return 'Keita (Nam)';
  if (voiceId.toLowerCase().includes('nanami')) return 'Nanami (Nữ)';
  return voiceId;
}

export function getDeviceJapaneseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    return voices.filter(v => 
      v.lang.toLowerCase().startsWith('ja') || 
      v.name.toLowerCase().includes('japanese') || 
      v.name.includes('日本語')
    );
  } catch (e) {
    return [];
  }
}

let currentPreferredVoice: AzureVoiceChoice = 'ja-JP-NanamiNeural';

export function getPreferredVoice(): AzureVoiceChoice {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('jlpt_preferred_voice') as AzureVoiceChoice;
    if (saved) {
      return saved;
    }
  }
  return currentPreferredVoice;
}

export function setPreferredVoice(voice: AzureVoiceChoice) {
  currentPreferredVoice = voice;
  if (typeof window !== 'undefined') {
    localStorage.setItem('jlpt_preferred_voice', voice);
    // Stop any existing audio so new voice takes effect immediately
    if (activeAudioElement) {
      try {
        activeAudioElement.pause();
        activeAudioElement.src = '';
        activeAudioElement = null;
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    window.dispatchEvent(new CustomEvent('jlpt_voice_changed', { detail: { voice } }));
  }
}

function findBestJapaneseVoice(preferredVoiceName?: string): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // If a specific device voice is requested
  if (preferredVoiceName && preferredVoiceName.startsWith('device:')) {
    const targetName = preferredVoiceName.replace('device:', '');
    const matched = voices.find(v => v.name === targetName || v.voiceURI === targetName);
    if (matched) {
      cachedJaVoice = matched;
      return matched;
    }
  }

  const targetVoiceStr = (preferredVoiceName || getPreferredVoice()).toLowerCase();
  const isMalePreferred = targetVoiceStr.includes('keita') || targetVoiceStr.includes('daichi') || targetVoiceStr.includes('naoki') || targetVoiceStr.includes('male');

  // 1. Premium Microsoft Azure Neural voice prioritisation
  const priorityVoiceNames = isMalePreferred ? [
    'Microsoft Keita Online (Natural) - Japanese (Japan)',
    'Microsoft Daichi Online (Natural) - Japanese (Japan)',
    'Microsoft Naoki Online (Natural) - Japanese (Japan)',
    'Microsoft Keita',
    'ja-JP-KeitaNeural',
    'ja-JP-DaichiNeural',
    'ja-JP-NaokiNeural',
    'Keita',
    'Otoya',
    'Hattori',
    'Google 日本語',
    'Google Japanese',
    'Microsoft Nanami Online (Natural) - Japanese (Japan)',
    'Microsoft Nanami',
    'ja-JP-NanamiNeural',
    'Nanami',
    'Kyoko',
    'Siri'
  ] : [
    'Microsoft Nanami Online (Natural) - Japanese (Japan)',
    'Microsoft Aoi Online (Natural) - Japanese (Japan)',
    'Microsoft Mayu Online (Natural) - Japanese (Japan)',
    'Microsoft Shiori Online (Natural) - Japanese (Japan)',
    'Microsoft Nanami',
    'ja-JP-NanamiNeural',
    'ja-JP-AoiNeural',
    'ja-JP-MayuNeural',
    'ja-JP-ShioriNeural',
    'Nanami',
    'Kyoko',
    'Google 日本語',
    'Google Japanese',
    'Microsoft Keita Online (Natural) - Japanese (Japan)',
    'Microsoft Keita',
    'ja-JP-KeitaNeural',
    'Keita',
    'Siri'
  ];

  for (const name of priorityVoiceNames) {
    const match = voices.find(v => v.name.includes(name) || v.voiceURI.includes(name));
    if (match) {
      cachedJaVoice = match;
      return match;
    }
  }

  // 2. Any voice explicitly tagged with ja-JP / ja_JP
  const exactJaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
  if (exactJaVoice) {
    cachedJaVoice = exactJaVoice;
    return exactJaVoice;
  }

  // 3. Fallback to any voice starting with ja
  const fallbackJa = voices.find(v => v.lang.toLowerCase().startsWith('ja'));
  if (fallbackJa) {
    cachedJaVoice = fallbackJa;
    return fallbackJa;
  }

  return null;
}

// Preload voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedJaVoice = null;
    findBestJapaneseVoice();
  };
  findBestJapaneseVoice();
}

// Active Audio element to control playback
let activeAudioElement: HTMLAudioElement | null = null;

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

/**
 * Microsoft Azure Neural Voice Text-To-Speech Synthesis helper:
 * - ja-JP-NanamiNeural (Nữ ⭐⭐⭐⭐⭐: Giọng phát thanh viên Tokyo, trong trẻo, chuẩn JLPT)
 * - ja-JP-KeitaNeural (Nam ⭐⭐⭐⭐⭐: Giọng đọc chuẩn đề thi JLPT N4-N2, trầm ấm, dứt khoát)
 */
export function preloadJapaneseAudio(text: string, voice?: AzureVoiceChoice) {
  if (!text || typeof window === 'undefined') return;
  const clean = cleanJapaneseTextForSpeech(text);
  if (!clean) return;
  const selectedVoice = voice || getPreferredVoice();
  const audio = new Audio(`/api/tts?text=${encodeURIComponent(clean)}&voice=${encodeURIComponent(selectedVoice)}&rate=%2B0%25`);
  audio.preload = 'auto';
}

export function speakJapanese(
  text: string, 
  rate?: number, 
  onEnd?: () => void,
  options?: { isSentence?: boolean; pitch?: number; voice?: AzureVoiceChoice }
) {
  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  // Stop any ongoing audio playback
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.src = '';
    activeAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Clean text from unwanted punctuation/markup/HTML for smooth, natural reading
  const cleanText = cleanJapaneseTextForSpeech(text);
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const isSentence = options?.isSentence ?? (cleanText.length > 8 || /[。！？、]/.test(cleanText));
  
  // Determine voice: options.voice -> Auto-detect speaker prefix in original text -> preferredVoice
  let selectedVoice = options?.voice || getPreferredVoice();
  if (!options?.voice) {
    if (/^(男|A|男性|山田|佐藤|Keita|Nam)[:：]/i.test(text.trim())) {
      selectedVoice = 'ja-JP-KeitaNeural';
    } else if (/^(女|B|女性|田中|鈴木|Nanami|Nữ)[:：]/i.test(text.trim())) {
      selectedVoice = 'ja-JP-NanamiNeural';
    }
  }

  // Calculate Azure neural rate offset (JLPT N4-N2 cadence calibration)
  let azureRate = '+0%';
  if (rate !== undefined) {
    const pct = Math.round((rate - 1.0) * 100);
    azureRate = pct >= 0 ? `+${pct}%` : `${pct}%`;
  } else if (!isSentence) {
    azureRate = '-4%'; // clear articulation for single vocab
  }

  const encodedText = encodeURIComponent(cleanText);
  const voiceParam = encodeURIComponent(selectedVoice);
  const azureTtsUrl = `/api/tts?text=${encodedText}&voice=${voiceParam}&rate=${encodeURIComponent(azureRate)}`;

  let hasFallbackTriggered = false;

  const runFallbackSynthesis = () => {
    if (hasFallbackTriggered) return;
    hasFallbackTriggered = true;

    // Fallback 1: Try Google Translate TTS Audio
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=${encodedText}`;
    try {
      const gAudio = new Audio(googleTtsUrl);
      activeAudioElement = gAudio;
      gAudio.playbackRate = rate !== undefined ? rate : (isSentence ? 1.0 : 0.95);
      gAudio.onended = () => {
        activeAudioElement = null;
        if (onEnd) onEnd();
      };
      gAudio.onerror = () => {
        activeAudioElement = null;
        runWebSpeechFallback();
      };
      const p = gAudio.play();
      if (p !== undefined) {
        p.catch(() => {
          activeAudioElement = null;
          runWebSpeechFallback();
        });
      }
    } catch {
      runWebSpeechFallback();
    }
  };

  const runWebSpeechFallback = () => {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      (window as any)._jlptActiveUtterance = utterance;

      utterance.lang = 'ja-JP';
      const targetRate = rate !== undefined ? rate : (isSentence ? 0.98 : 0.92);
      utterance.rate = targetRate;
      utterance.pitch = options?.pitch ?? 1.0;

      const voice = findBestJapaneseVoice(selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        delete (window as any)._jlptActiveUtterance;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        delete (window as any)._jlptActiveUtterance;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Web Speech fallback error:', e);
      if (onEnd) onEnd();
    }
  };

  // Primary stream: If user selected a device voice specifically, use Web Speech API immediately
  if (selectedVoice.startsWith('device:')) {
    runWebSpeechFallback();
    return;
  }

  // Primary stream: Microsoft Azure Neural Voices (Nanami / Keita / Aoi / etc.)
  try {
    const audio = new Audio(azureTtsUrl);
    activeAudioElement = audio;

    const targetPlaybackRate = rate !== undefined ? rate : (isSentence ? 1.0 : 0.96);
    audio.playbackRate = targetPlaybackRate;

    audio.onended = () => {
      activeAudioElement = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      activeAudioElement = null;
      runFallbackSynthesis();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Azure Neural playback error, falling back:', err);
        activeAudioElement = null;
        runFallbackSynthesis();
      });
    }
  } catch (err) {
    runFallbackSynthesis();
  }
}


