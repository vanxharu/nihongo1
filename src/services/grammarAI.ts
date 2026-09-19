/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Grammar AI Service
 * Manages generating, previewing, persisting, and caching AI-redesigned examples and exercises
 */

import { GrammarAiContent, GrammarExample, GrammarExercise, JLPTLevel, GrammarFormationRule, SimilarGrammarComparison, UserGrammarProgress } from '../types';

export interface GenerateGrammarParams {
  grammarId: string;
  grammar: string;
  meaning: string;
  level: JLPTLevel | string;
  explanation?: string;
  mode?: 'all' | 'examples' | 'exercises';
  existing_examples?: any[];
  existing_exercises?: any[];
}

export interface SaveGrammarPayload {
  grammarId: string;
  grammar: string;
  level: string;
  overview?: string;
  formationRules?: GrammarFormationRule[];
  usageGuide?: {
    whenToUse?: string[];
    whenNotToUse?: string[];
    subjectConstraint?: string;
    nuance?: string;
  };
  notes?: string[];
  memoryTip?: string;
  similarGrammars?: SimilarGrammarComparison[];
  examples: GrammarExample[];
  exercises: GrammarExercise[];
}

const LOCAL_STORAGE_CACHE_KEY = 'jlpt_grammar_ai_contents_v1';
const LOCAL_STORAGE_PROGRESS_KEY = 'jlpt_grammar_user_progress_v1';
const inMemoryCache = new Map<string, GrammarAiContent>();

/**
 * Get cached content from memory or localStorage
 */
export function getLocalCachedGrammarContent(grammarId: string): GrammarAiContent | null {
  if (!grammarId) return null;
  const key = grammarId.trim();

  if (inMemoryCache.has(key)) {
    return inMemoryCache.get(key) || null;
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (raw) {
      const parsed: Record<string, GrammarAiContent> = JSON.parse(raw);
      if (parsed[key]) {
        inMemoryCache.set(key, parsed[key]);
        return parsed[key];
      }
    }
  } catch (err) {
    console.warn('[Grammar AI Service] Local read cache error:', err);
  }

  return null;
}

/**
 * Update local cache
 */
export function setLocalCachedGrammarContent(data: GrammarAiContent): void {
  if (!data || !data.grammarId) return;
  const key = data.grammarId.trim();

  inMemoryCache.set(key, data);

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    const parsed: Record<string, GrammarAiContent> = raw ? JSON.parse(raw) : {};
    parsed[key] = data;
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(parsed));
  } catch (err) {
    console.warn('[Grammar AI Service] Local save cache error:', err);
  }
}

/**
 * 1. Request AI to generate complete lesson (Overview, Formation, Usage, Notes, Memory Tip, Similar, Examples & Exercises)
 */
export async function generateGrammarAiContent(params: GenerateGrammarParams): Promise<{
  success: boolean;
  data?: {
    grammar: string;
    level: string;
    overview?: string;
    formationRules?: GrammarFormationRule[];
    usageGuide?: any;
    notes?: string[];
    memoryTip?: string;
    similarGrammars?: SimilarGrammarComparison[];
    examples: GrammarExample[];
    exercises: GrammarExercise[];
  };
  error?: string;
}> {
  try {
    const res = await fetch('/api/grammar/ai-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `HTTP ${res.status}`);
    }

    return {
      success: true,
      data: json.data
    };
  } catch (err: any) {
    console.error('[Grammar AI Service] Generation failed:', err);
    return {
      success: false,
      error: err.message || 'Không thể tạo nội dung ngữ pháp qua AI. Vui lòng thử lại.'
    };
  }
}

/**
 * 2. Save confirmed AI content directly to the website database and file system
 */
export async function saveGrammarContentToWebsite(payload: SaveGrammarPayload): Promise<{
  success: boolean;
  item?: GrammarAiContent;
  error?: string;
}> {
  try {
    const res = await fetch('/api/grammar/save-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `HTTP ${res.status}`);
    }

    // Update local cache
    if (json.item) {
      setLocalCachedGrammarContent(json.item);
    }

    return {
      success: true,
      item: json.item
    };
  } catch (err: any) {
    console.error('[Grammar AI Service] Save failed:', err);
    return {
      success: false,
      error: err.message || 'Không thể lưu nội dung vào website.'
    };
  }
}

/**
 * 3. Fetch all saved AI grammar contents from the server
 */
export async function fetchAllAiGrammarContents(): Promise<Record<string, GrammarAiContent>> {
  try {
    const res = await fetch('/api/grammar/all-ai-contents');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.success && json.data) {
      // Sync into local cache
      const map: Record<string, GrammarAiContent> = json.data;
      Object.keys(map).forEach(key => {
        inMemoryCache.set(key, map[key]);
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(map));
      } catch (e) {
        // ignore quota errors
      }
      return map;
    }
  } catch (err) {
    console.warn('[Grammar AI Service] Could not fetch all AI contents, reading local cache:', err);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * 4. Rollback to previously backed up version
 */
export async function rollbackGrammarAiContent(grammarId: string): Promise<{
  success: boolean;
  item?: GrammarAiContent;
  error?: string;
}> {
  try {
    const res = await fetch('/api/grammar/rollback-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grammarId })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `HTTP ${res.status}`);
    }

    if (json.item) {
      setLocalCachedGrammarContent(json.item);
    }

    return {
      success: true,
      item: json.item
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Không thể khôi phục phiên bản trước.'
    };
  }
}

/**
 * 5. Record attempt and update Spaced Repetition mastery score
 */
export async function recordGrammarAttempt(params: {
  userUid: string;
  grammarId: string;
  isCorrect: boolean;
  score?: number;
  mistakeText?: string;
}): Promise<UserGrammarProgress | null> {
  try {
    const res = await fetch('/api/grammar/progress/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const json = await res.json();
    if (json.success && json.progress) {
      // Sync local progress store
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
        const map = raw ? JSON.parse(raw) : {};
        map[params.grammarId] = json.progress;
        localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(map));
      } catch (e) {}
      return json.progress;
    }
  } catch (e) {
    console.warn('[Grammar AI Service] Error recording progress:', e);
  }

  // Local fallback calculation
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const existing = map[params.grammarId] || {
      grammarId: params.grammarId,
      status: 'learning',
      masteryScore: 0,
      attempts: 0,
      correctCount: 0,
      incorrectCount: 0,
      accuracyRate: 0
    };

    const attempts = existing.attempts + 1;
    const correctCount = existing.correctCount + (params.isCorrect ? 1 : 0);
    const incorrectCount = existing.incorrectCount + (params.isCorrect ? 0 : 1);
    const accuracyRate = Math.round((correctCount / attempts) * 100);
    const masteryScore = params.isCorrect ? Math.min(100, existing.masteryScore + 20) : Math.max(0, existing.masteryScore - 20);

    const updated: UserGrammarProgress = {
      grammarId: params.grammarId,
      status: masteryScore >= 85 ? 'mastered' : masteryScore >= 60 ? 'practicing' : 'learning',
      masteryScore,
      attempts,
      correctCount,
      incorrectCount,
      accuracyRate,
      lastStudiedAt: new Date().toISOString(),
      needsReview: !params.isCorrect || masteryScore < 60
    };

    map[params.grammarId] = updated;
    localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(map));
    return updated;
  } catch (e) {
    return null;
  }
}

/**
 * 6. Fetch user's grammar progress map
 */
export async function fetchUserGrammarProgress(userUid: string): Promise<Record<string, UserGrammarProgress>> {
  if (!userUid) return {};

  try {
    const res = await fetch(`/api/grammar/progress/user/${encodeURIComponent(userUid)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.progressMap) {
        try {
          localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(json.progressMap));
        } catch (e) {}
        return json.progressMap;
      }
    }
  } catch (e) {
    console.warn('[Grammar AI Service] Failed to fetch remote progress, fallback to local:', e);
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * 7. Generate Personalized AI Review Quiz
 */
export async function generatePersonalizedReview(params: {
  userUid: string;
  level: JLPTLevel | string;
  targetGrammars: Array<{ id: string; structure: string; meaning: string }>;
}): Promise<{
  reviewTitle?: string;
  questions?: Array<{
    id: string;
    targetGrammar: string;
    question: string;
    choices: string[];
    correct_answer: string;
    explanation: string;
    sentence_full: string;
    translation: string;
  }>;
} | null> {
  try {
    const res = await fetch('/api/grammar/personalized-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (e) {
    console.error('[Grammar AI Service] Failed to generate personalized review:', e);
  }
  return null;
}

/**
 * 8. Ask AI Tutor (Hỏi AI Trợ Giảng hoặc sử dụng các nút hỏi nhanh)
 */
export async function askAiTutor(params: {
  grammarStructure: string;
  grammarMeaning?: string;
  level?: string;
  userQuery?: string;
  quickAction?: 'easier_explanation' | 'more_examples' | 'find_error' | 'more_exercise';
}): Promise<string> {
  try {
    const res = await fetch('/api/grammar/ai-tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const json = await res.json();
    if (json.success && json.reply) {
      return json.reply;
    }
    throw new Error(json.error || 'Không nhận được phản hồi từ AI Tutor');
  } catch (err: any) {
    console.error('[Grammar AI Tutor error]:', err);
    throw err;
  }
}

/**
 * 9. Fetch Similar Question (Tạo câu hỏi tương tự sau khi làm sai)
 */
export async function fetchSimilarQuestion(params: {
  grammarStructure: string;
  grammarMeaning?: string;
  level?: string;
  failedQuestion?: string;
}): Promise<GrammarExercise | null> {
  try {
    const res = await fetch('/api/grammar/similar-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const json = await res.json();
    if (json.success && json.question) {
      return json.question;
    }
  } catch (err) {
    console.error('[Similar Question error]:', err);
  }
  return null;
}

