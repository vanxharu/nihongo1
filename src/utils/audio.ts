/**
 * Utility for synthesizing feedback sound effects (correct "ting" and incorrect "buzz")
 * using the Web Audio API without needing external static file assets.
 */

import { showLearningFeedback } from './learningMotion';
import { cleanJapaneseTextForSpeech, parseDialogueTurns, assignDialogueVoices } from './ttsStatic';
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
  showLearningFeedback('correct');
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
  showLearningFeedback('incorrect');
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
  showLearningFeedback('milestone');
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

export function normalizeVoiceChoice(voice: string): AzureVoiceChoice {
  const value = (voice || '').trim();
  if (value.startsWith('device:') && value.length > 7) return value;
  const lower = value.toLowerCase();
  const preset = PRESET_JAPANESE_VOICES.find(v => v.id.toLowerCase() === lower || v.name.toLowerCase() === lower);
  return preset?.id || 'ja-JP-NanamiNeural';
}

export function getDeviceVoiceId(voice: SpeechSynthesisVoice): AzureVoiceChoice {
  return `device:${voice.voiceURI || voice.name}`;
}

export function isDeviceVoiceSelected(selected: string, voice: SpeechSynthesisVoice): boolean {
  return selected === getDeviceVoiceId(voice) || selected === `device:${voice.name}`;
}

// Không còn chọn giọng: mỗi lần đọc chọn ngẫu nhiên Nanami (nữ) hoặc Keita (nam).
export function randomVoice(): AzureVoiceChoice {
  return Math.random() < 0.5 ? 'ja-JP-NanamiNeural' : 'ja-JP-KeitaNeural';
}

function findBestJapaneseVoice(preferredVoiceName?: string): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;

  const voices = getDeviceJapaneseVoices();
  if (!voices || voices.length === 0) return null;

  // If a specific device voice is requested
  if (preferredVoiceName && preferredVoiceName.startsWith('device:')) {
    const targetName = preferredVoiceName.replace('device:', '');
    const japaneseVoices = getDeviceJapaneseVoices();
    const matched = japaneseVoices.find(v => v.voiceURI === targetName) || japaneseVoices.find(v => v.name === targetName);
    if (matched) {
      return matched;
    }
  }

  const targetVoiceStr = (preferredVoiceName || '').toLowerCase();
  const preset = PRESET_JAPANESE_VOICES.find(v => v.id.toLowerCase() === targetVoiceStr);
  const exact = preset && getDeviceJapaneseVoices().find(v => v.name.toLowerCase().includes(preset.name.toLowerCase()) || v.voiceURI.toLowerCase().includes(preset.id.toLowerCase()));
  if (exact) return exact;
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
      return match;
    }
  }

  // 2. Any voice explicitly tagged with ja-JP / ja_JP
  const exactJaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
  if (exactJaVoice) {
    return exactJaVoice;
  }

  // 3. Fallback to any voice starting with ja
  const fallbackJa = voices.find(v => v.lang.toLowerCase().startsWith('ja'));
  if (fallbackJa) {
    return fallbackJa;
  }

  return null;
}

export interface JapaneseSpeechHandle { stop: () => void }

export interface JapaneseSpeechStatus {
  state: 'playing' | 'completed' | 'cancelled' | 'failed';
  provider: 'azure' | 'google' | 'device';
  voice: string;
  message?: string;
}

let activeSpeech: JapaneseSpeechHandle | null = null;

let activeDialogue: JapaneseSpeechHandle | null = null;

export function stopJapaneseSpeech(): void {
  activeDialogue?.stop();
  activeSpeech?.stop();
}

export { cleanJapaneseTextForSpeech };

/**
 * Microsoft Azure Neural Voice Text-To-Speech Synthesis helper:
 * - ja-JP-NanamiNeural (Nữ ⭐⭐⭐⭐⭐: Giọng phát thanh viên Tokyo, trong trẻo, chuẩn JLPT)
 * - ja-JP-KeitaNeural (Nam ⭐⭐⭐⭐⭐: Giọng đọc chuẩn đề thi JLPT N4-N2, trầm ấm, dứt khoát)
 */
export function preloadJapaneseAudio(text: string, voice?: AzureVoiceChoice) {
  if (!text || typeof window === 'undefined') return;
  const clean = cleanJapaneseTextForSpeech(text);
  if (!clean) return;
  const selectedVoice = normalizeVoiceChoice(voice || randomVoice());
  if (selectedVoice.startsWith('device:')) return;
  const audio = new Audio(`/api/tts?text=${encodeURIComponent(clean)}&voice=${encodeURIComponent(selectedVoice)}&rate=%2B0%25`);
  audio.preload = 'auto';
}

type SpeakOptions = {
  isSentence?: boolean;
  pitch?: number;
  voice?: AzureVoiceChoice;
  onStatus?: (status: JapaneseSpeechStatus) => void;
};

/**
 * Đọc văn bản tiếng Nhật. Nếu là hội thoại (男：…/女：…, A：…/B：…, tên：…)
 * thì mỗi người nói một giọng (nữ Nanami, nam Keita) theo thứ tự.
 */
export function speakJapanese(
  text: string,
  rate?: number,
  onEnd?: () => void,
  options?: SpeakOptions
): JapaneseSpeechHandle {
  const turns = options?.voice ? null : parseDialogueTurns(text || '');
  if (!turns) return speakSingle(text, rate, onEnd, options);

  stopJapaneseSpeech();
  const voices = assignDialogueVoices(turns);
  let index = 0;
  let stopped = false;
  let gap: ReturnType<typeof setTimeout> | undefined;
  let inner: JapaneseSpeechHandle | null = null;
  let anyPlayed = false;

  const end = (state: 'completed' | 'cancelled' | 'failed', message?: string) => {
    if (activeDialogue === handle) activeDialogue = null;
    options?.onStatus?.({ state, provider: 'azure', voice: voices[Math.min(index, voices.length - 1)], message });
    if (state !== 'cancelled') onEnd?.();
  };
  const handle: JapaneseSpeechHandle = {
    stop: () => {
      if (stopped) return;
      stopped = true;
      clearTimeout(gap);
      inner?.stop();
      end('cancelled');
    },
  };
  activeDialogue = handle;

  const next = () => {
    if (stopped) return;
    if (index >= turns.length) { stopped = true; end(anyPlayed ? 'completed' : 'failed'); return; }
    const i = index;
    inner = speakSingle(turns[i].text, rate, undefined, {
      isSentence: true,
      pitch: options?.pitch,
      voice: voices[i] as AzureVoiceChoice,
      onStatus: (st) => {
        if (stopped) return;
        if (st.state === 'playing') { anyPlayed = true; options?.onStatus?.(st); }
        else if (st.state === 'completed' || st.state === 'failed') {
          index = i + 1;
          gap = setTimeout(next, 250);
        }
      },
    }, true);
  };
  next();
  return handle;
}

function speakSingle(
  text: string,
  rate?: number,
  onEnd?: () => void,
  options?: SpeakOptions,
  keepDialogue = false
): JapaneseSpeechHandle {
  if (keepDialogue) activeSpeech?.stop(); else stopJapaneseSpeech();

  let finished = false;
  let audio: HTMLAudioElement | null = null;
  let utterance: SpeechSynthesisUtterance | null = null;
  let clearVoiceWait: (() => void) | null = null;
  let provider: JapaneseSpeechStatus['provider'] = 'azure';
  const chosenVoice = normalizeVoiceChoice(options?.voice || randomVoice());
  let actualVoice: string = chosenVoice;
  let message: string | undefined;
  let googleStarted = false;
  let webSpeechStarted = false;

  const detachAudio = () => {
    const previous = audio;
    audio = null;
    if (!previous) return;
    previous.onended = null;
    previous.onerror = null;
    previous.onplaying = null;
    try { previous.pause(); previous.removeAttribute('src'); previous.load(); } catch {}
  };
  const finish = (state: 'completed' | 'cancelled' | 'failed', errorMessage?: string) => {
    if (finished) return;
    finished = true;
    clearVoiceWait?.();
    clearVoiceWait = null;
    detachAudio();
    if (utterance) {
      utterance.onend = null;
      utterance.onerror = null;
      utterance.onstart = null;
      if (typeof window !== 'undefined') {
        if ((window as any)._jlptActiveUtterance === utterance) delete (window as any)._jlptActiveUtterance;
        if (state === 'cancelled') {
          try { window.speechSynthesis.cancel(); } catch {}
        }
      }
      utterance = null;
    }
    if (activeSpeech === handle) activeSpeech = null;
    options?.onStatus?.({ state, provider, voice: actualVoice, message: errorMessage || message });
    // Cancellation is separate: legacy onEnd callbacks may start microphones or advance lessons.
    if (state !== 'cancelled') onEnd?.();
  };
  const handle: JapaneseSpeechHandle = { stop: () => finish('cancelled') };
  activeSpeech = handle;

  const cleanText = cleanJapaneseTextForSpeech(text || '');
  if (!cleanText || typeof window === 'undefined') {
    finish(cleanText ? 'failed' : 'completed');
    return handle;
  }

  const isSentence = options?.isSentence ?? (cleanText.length > 8 || /[。！？、]/.test(cleanText));
  let selectedVoice = chosenVoice;
  if (!options?.voice && !selectedVoice.startsWith('device:')) {
    if (/^(男|A|男性|山田|佐藤|Keita|Nam)[:：]/i.test(text.trim())) selectedVoice = 'ja-JP-KeitaNeural';
    else if (/^(女|B|女性|田中|鈴木|Nanami|Nữ)[:：]/i.test(text.trim())) selectedVoice = 'ja-JP-NanamiNeural';
  }
  actualVoice = selectedVoice;
  const encodedText = encodeURIComponent(cleanText);
  const pct = Math.round(((rate ?? (isSentence ? 1 : 0.96)) - 1) * 100);
  const azureRate = `${pct >= 0 ? '+' : ''}${pct}%`;
  const reportPlaying = () => {
    if (!finished) options?.onStatus?.({ state: 'playing', provider, voice: actualVoice, message });
  };

  const runWebSpeech = () => {
    if (finished || webSpeechStarted) return;
    webSpeechStarted = true;
    detachAudio();
    provider = 'device';
    if (!('speechSynthesis' in window)) {
      finish('failed', 'Trình duyệt không hỗ trợ giọng đọc thiết bị.');
      return;
    }
    const synthesis = window.speechSynthesis;
    const speak = () => {
      if (finished) return;
      try {
        const voice = findBestJapaneseVoice(selectedVoice);
        if (!voice) {
          finish('failed', 'Không tìm thấy giọng tiếng Nhật trên thiết bị.');
          return;
        }
        actualVoice = getDeviceVoiceId(voice);
        if (selectedVoice.startsWith('device:') && !isDeviceVoiceSelected(selectedVoice, voice)) {
          message = `Giọng đã lưu không còn khả dụng. Đang dùng ${voice.name}.`;
        } else if (!selectedVoice.startsWith('device:')) {
          message = `Giọng AI không khả dụng. Đang dùng giọng thiết bị ${voice.name}.`;
        }
        utterance = new SpeechSynthesisUtterance(cleanText);
        (window as any)._jlptActiveUtterance = utterance;
        utterance.lang = 'ja-JP';
        utterance.voice = voice;
        utterance.rate = rate ?? (isSentence ? 0.98 : 0.92);
        utterance.pitch = options?.pitch ?? 1;
        utterance.onstart = reportPlaying;
        utterance.onend = () => finish('completed');
        utterance.onerror = (event) => {
          if (finished) return;
          if (event.error === 'canceled' || event.error === 'interrupted') finish('cancelled');
          else finish('failed', 'Không thể phát giọng đọc thiết bị.');
        };
        synthesis.speak(utterance);
      } catch {
        finish('failed', 'Không thể phát giọng đọc thiết bị.');
      }
    };
    // Device lists often arrive asynchronously on the first page load.
    const requestedVoiceReady = () => {
      const voices = getDeviceJapaneseVoices();
      return selectedVoice.startsWith('device:')
        ? voices.some(voice => isDeviceVoiceSelected(selectedVoice, voice))
        : voices.length > 0;
    };
    if (requestedVoiceReady()) {
      speak();
    } else {
      let timer: ReturnType<typeof setTimeout>;
      const ready = () => {
        if (!requestedVoiceReady()) return;
        clearVoiceWait?.();
        clearVoiceWait = null;
        speak();
      };
      clearVoiceWait = () => {
        clearTimeout(timer);
        synthesis.removeEventListener('voiceschanged', ready);
      };
      synthesis.addEventListener('voiceschanged', ready);
      timer = setTimeout(() => {
        clearVoiceWait?.();
        clearVoiceWait = null;
        speak();
      }, 1500);
      ready();
    }
  };

  const playAudio = (url: string, next: () => void) => {
    if (finished) return;
    detachAudio();
    let current: HTMLAudioElement | null = null;
    const fail = () => {
      if (finished || (current && audio !== current)) return;
      detachAudio();
      next();
    };
    try {
      current = new Audio(url);
      audio = current;
      // Azure already applies rate while synthesizing; do not multiply it again.
      current.playbackRate = provider === 'azure' ? 1 : (rate ?? (isSentence ? 1 : 0.95));
      current.onplaying = () => { if (audio === current) reportPlaying(); };
      current.onended = () => { if (audio === current) finish('completed'); };
      current.onerror = fail;
      current.play()?.catch(fail);
    } catch { fail(); }
  };
  const runGoogle = () => {
    if (finished || googleStarted) return;
    googleStarted = true;
    provider = 'google';
    actualVoice = 'Google Japanese';
    message = 'Giọng AI không khả dụng. Đang dùng giọng tiếng Nhật thay thế của Google.';
    playAudio(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=${encodedText}`, runWebSpeech);
  };

  if (selectedVoice.startsWith('device:')) runWebSpeech();
  else playAudio(`/api/tts?text=${encodedText}&voice=${encodeURIComponent(selectedVoice)}&rate=${encodeURIComponent(azureRate)}`, runGoogle);
  return handle;
}
