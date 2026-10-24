// Gemini dùng chung cho mọi tính năng AI. Key: của người dùng (header x-llm-key, lưu ở trình duyệt họ) hoặc GEMINI_API_KEY của hệ thống.
import { AsyncLocalStorage } from 'node:async_hooks';
import { GoogleGenAI } from '@google/genai';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-3.1-pro-preview', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

const perRequest = new AsyncLocalStorage<{ apiKey: string; model: string }>();

export function userLlmMiddleware(req: any, _res: any, next: () => void) {
  const apiKey = String(req.headers['x-llm-key'] || '').trim();
  if (!apiKey) return next();
  perRequest.run({ apiKey, model: String(req.headers['x-llm-model'] || '').trim() }, next);
}

// Bọc handler của các hàm api/*.ts riêng (không đi qua Express app) để cũng nhận key người dùng.
export const withUserLlm = (h: (req: any, res: any) => any) => (req: any, res: any) => {
  let r: any; let ran = false;
  userLlmMiddleware(req, res, () => { ran = true; r = h(req, res); });
  return ran ? r : h(req, res);
};

export function getLlmConfig() {
  const u = perRequest.getStore();
  return { apiKey: u?.apiKey || process.env.GEMINI_API_KEY || '', model: u?.model || '' };
}

const clients = new Map<string, GoogleGenAI>();
export function getGeminiClient(apiKey = getLlmConfig().apiKey): GoogleGenAI {
  if (!apiKey) throw new Error('Chưa có Gemini API key. Hãy nhập key của bạn trong "Cấu hình API".');
  let c = clients.get(apiKey);
  if (!c) { c = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } }); clients.set(apiKey, c); }
  return c;
}

// generateContent với tự chuyển model khi quá tải (503/429/404). Model người dùng chọn được thử trước.
// Groq retired llama-3.3-70b-versatile for public API users on 2026-08-16.
// GPT-OSS 120B and 20B are supported replacement model IDs.
const GROQ_PRIMARY_MODEL = 'openai/gpt-oss-120b';
const GROQ_BACKUP_MODEL = 'openai/gpt-oss-20b';
// Keep sequential failovers well within Vercel's serverless execution limit.
const GROQ_TIMEOUT_MS = 9000;
const GEMINI_TIMEOUT_MS = 9000;

// A finite time budget is essential on Vercel (60s serverless limit).
async function withLlmTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('AI_PROVIDER_TIMEOUT')), ms);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function generateGemini(options: { contents: any; model?: string; config?: any; apiKey?: string }) {
  const userKey = options.apiKey || perRequest.getStore()?.apiKey;
  const groqKey = process.env.GROQ_API_KEY;

  // The server-level Groq key is tried first for visitors without a personal
  // Gemini key. Never return a fabricated response when a provider fails.
  if (groqKey && !userKey) {
    const candidates = [...new Set([
      process.env.GROQ_MODEL || GROQ_PRIMARY_MODEL,
      GROQ_PRIMARY_MODEL,
      GROQ_BACKUP_MODEL,
    ])];
    let groqError: unknown;
    for (const model of candidates) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + groqKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            temperature: 0.1,
            max_completion_tokens: Math.min(options.config?.maxOutputTokens || 2800, 4000),
            // GPT-OSS rejects reasoning_format (Groq 400); include_reasoning is supported.
            ...(model.startsWith('openai/gpt-oss-') ? { reasoning_effort: 'low', include_reasoning: false } : {}),
            ...(options.config?.responseMimeType === 'application/json' ? { response_format: { type: 'json_object' } } : {}),
            messages: [
              ...(options.config?.systemInstruction ? [{ role: 'system', content: String(options.config.systemInstruction) }] : []),
              { role: 'user', content: typeof options.contents === 'string' ? options.contents : JSON.stringify(options.contents) }
            ]
          }),
          signal: AbortSignal.timeout(GROQ_TIMEOUT_MS)
        });
        const data: any = await response.json();
        if (!response.ok) {
          const reason = String(data?.error?.message || response.statusText || 'Request failed');
          const err = new Error(`Groq ${response.status}: ${reason.slice(0, 180)}`);
          (err as any).status = response.status;
          throw err;
        }
        const content = data.choices?.[0]?.message?.content;
        if (typeof content !== 'string' || !content.trim()) throw new Error('Groq returned empty content');
        return { text: content, provider: 'groq', modelUsed: data.model || model } as any;
      } catch (err: any) {
        groqError = err;
        // Do not log secrets; record only the model and the upstream failure class.
        const status = err?.status || (err?.name === 'TimeoutError' ? 'timeout' : 'connection');
        console.warn('[LLM] Groq model failed:', model, status);
        // 401 means a bad key; 429 means the account quota is exhausted.
        // Trying another Groq model won't repair either problem.
        if (status === 401 || status === 429) break;
      }
    }
    if (!process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
      throw groqError || new Error('GROQ_UNAVAILABLE');
    }
  }

  const claudeKey = process.env.ANTHROPIC_API_KEY || '';
  if (claudeKey && !userKey) {
    try {
      const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5';
      const system = String(options.config?.systemInstruction || '');
      const contents = typeof options.contents === 'string' ? options.contents : JSON.stringify(options.contents);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model,
          max_tokens: Math.min(options.config?.maxOutputTokens || 2800, 4000),
          ...(system ? { system: system + (options.config?.responseMimeType === 'application/json' ? '\\nReturn ONLY valid JSON.' : '') } : {}),
          messages: [{ role: 'user', content: contents }]
        }),
        signal: AbortSignal.timeout(12000)
      });
      const data: any = await response.json();
      if (!response.ok) throw new Error('Claude API: ' + response.status);
      const content = (data.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
      if (!content.trim()) throw new Error('Claude returned empty content');
      return { text: content, provider: 'anthropic', modelUsed: data.model || model } as any;
    } catch (err: any) {
      console.warn('[LLM] Anthropic fallback failed:', err?.name || 'error');
      if (!process.env.GEMINI_API_KEY) throw err;
    }
  }

  const client = getGeminiClient(options.apiKey);
  const primary = getLlmConfig().model || options.model || DEFAULT_GEMINI_MODEL;
  // Avoid the old 4-model × 2-retry loop that ran past Vercel's 60-second limit.
  const candidates = [...new Set([primary, 'gemini-3.6-flash'])].slice(0, 2);
  let lastError: any;
  for (const model of candidates) {
    try {
      const response: any = await withLlmTimeout(
        client.models.generateContent({
          contents: options.contents,
          config: {
            ...options.config,
            httpOptions: { ...(options.config?.httpOptions || {}), timeout: GEMINI_TIMEOUT_MS }
          },
          model
        }),
        GEMINI_TIMEOUT_MS
      );
      if (!response?.text) throw new Error('Gemini returned empty content');
      return { text: response.text, provider: 'gemini', modelUsed: response.modelVersion || model } as any;
    } catch (err: any) {
      lastError = err;
      console.warn('[LLM] Gemini candidate failed:', model, err?.status || err?.name || 'error');
    }
  }
  throw lastError || new Error('ALL_AI_PROVIDERS_FAILED');
}

// Gọi nhanh dạng prompt → chuỗi (kèm JSON nếu json=true).
// Metadata is only returned after a real upstream model call has succeeded.
export async function callLLMWithInfo(options: { prompt: string; systemInstruction?: string; json?: boolean; maxTokens?: number; override?: { apiKey?: string; model?: string } }): Promise<{ text: string; provider: string; modelUsed: string }> {
  const res = await generateGemini({
    contents: options.prompt,
    apiKey: options.override?.apiKey,
    model: options.override?.model,
    config: { systemInstruction: options.systemInstruction, maxOutputTokens: options.maxTokens, ...(options.json ? { responseMimeType: 'application/json' } : {}) },
  });
  const text = (res.text || '').trim();
  if (!text) throw new Error('AI trả về nội dung rỗng');
  return {
    text,
    provider: (res as any).provider || 'gemini',
    modelUsed: (res as any).modelUsed || (res as any).modelVersion || getLlmConfig().model || DEFAULT_GEMINI_MODEL
  };
}

export async function callLLM(options: { prompt: string; systemInstruction?: string; json?: boolean; maxTokens?: number; override?: { apiKey?: string; model?: string } }): Promise<string> {
  return (await callLLMWithInfo(options)).text;
}
