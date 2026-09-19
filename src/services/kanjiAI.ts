/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Kanji AI Mnemonic Service
 * Handles server-side AI mnemonic generation, caching (in-memory & localStorage),
 * and cache invalidation/regeneration for Kanji characters.
 */

export interface KanjiAiComponent {
  part: string;
  meaning: string;
}

export interface KanjiAiVocab {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiAiExample {
  japanese: string;
  hiragana: string;
  vietnamese: string;
}

export interface KanjiAiMnemonic {
  kanji: string;
  meaning: string;
  components: KanjiAiComponent[];
  memory_tip: string;
  memory_sentence: string;
  vocabulary: KanjiAiVocab[];
  example: KanjiAiExample;
  cachedAt?: number;
}

export interface FetchKanjiMnemonicParams {
  kanji: string;
  meaning?: string;
  onyomi?: string;
  kunyomi?: string;
  strokes?: number;
  radical?: string;
  level?: string;
  components?: string;
  forceRefresh?: boolean;
}

const STORAGE_CACHE_KEY = 'kanji_ai_mnemonic_cache_v1';
const memoryCache = new Map<string, KanjiAiMnemonic>();

/**
 * Retrieve cached Kanji mnemonic from in-memory map or localStorage
 */
export function getCachedKanjiMnemonic(kanji: string): KanjiAiMnemonic | null {
  if (!kanji) return null;
  const key = kanji.trim();

  // 1. Check in-memory cache
  if (memoryCache.has(key)) {
    return memoryCache.get(key) || null;
  }

  // 2. Check localStorage cache
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      const parsed: Record<string, KanjiAiMnemonic> = JSON.parse(raw);
      if (parsed && parsed[key]) {
        memoryCache.set(key, parsed[key]);
        return parsed[key];
      }
    }
  } catch (err) {
    console.warn('[Kanji AI Cache] Read error:', err);
  }

  return null;
}

/**
 * Save Kanji mnemonic to in-memory and localStorage cache
 */
export function setCachedKanjiMnemonic(kanji: string, data: KanjiAiMnemonic): void {
  if (!kanji || !data) return;
  const key = kanji.trim();
  const enrichedData: KanjiAiMnemonic = {
    ...data,
    cachedAt: Date.now()
  };

  // 1. In-memory
  memoryCache.set(key, enrichedData);

  // 2. LocalStorage
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    const parsed: Record<string, KanjiAiMnemonic> = raw ? JSON.parse(raw) : {};
    parsed[key] = enrichedData;
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(parsed));
  } catch (err) {
    console.warn('[Kanji AI Cache] Write error:', err);
  }
}

/**
 * Clear cached Kanji mnemonic (for single character or entire cache)
 */
export function clearKanjiMnemonicCache(kanji?: string): void {
  if (kanji) {
    const key = kanji.trim();
    memoryCache.delete(key);
    try {
      const raw = localStorage.getItem(STORAGE_CACHE_KEY);
      if (raw) {
        const parsed: Record<string, KanjiAiMnemonic> = JSON.parse(raw);
        delete parsed[key];
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(parsed));
      }
    } catch (err) {
      console.warn('[Kanji AI Cache] Delete error:', err);
    }
  } else {
    memoryCache.clear();
    try {
      localStorage.removeItem(STORAGE_CACHE_KEY);
    } catch (err) {
      console.warn('[Kanji AI Cache] Clear all error:', err);
    }
  }
}

/**
 * Fetch AI-generated Kanji mnemonic via backend API with timeout & caching
 */
export async function getKanjiMnemonicAI(params: FetchKanjiMnemonicParams): Promise<KanjiAiMnemonic> {
  const {
    kanji,
    meaning,
    onyomi,
    kunyomi,
    strokes,
    radical,
    level,
    components,
    forceRefresh = false
  } = params;

  if (!kanji || !kanji.trim()) {
    throw new Error('Chữ Kanji không hợp lệ.');
  }

  const trimmedKanji = kanji.trim();

  // Return cached result if available and not forced to refresh
  if (!forceRefresh) {
    const cached = getCachedKanjiMnemonic(trimmedKanji);
    if (cached) {
      return cached;
    }
  }

  // AbortController for network timeout (25 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch('/api/kanji/ai-mnemonic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        kanji: trimmedKanji,
        meaning,
        onyomi,
        kunyomi,
        strokes,
        radical,
        level,
        components,
        forceNew: forceRefresh
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const json = await response.json();

    if (!response.ok || !json.success) {
      const errorObj = new Error(json.error || 'Không thể tạo mẹo nhớ lúc này. Vui lòng thử lại.');
      (errorObj as any).isConfigError = json.isConfigError;
      throw errorObj;
    }

    const mnemonicData: KanjiAiMnemonic = json.data;

    // Save to cache
    setCachedKanjiMnemonic(trimmedKanji, mnemonicData);

    return mnemonicData;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Yêu cầu tạo mẹo nhớ bị quá thời gian (timeout). Vui lòng thử lại.');
    }
    throw err;
  }
}
