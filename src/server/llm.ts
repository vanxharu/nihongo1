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
export async function generateGemini(options: { contents: any; model?: string; config?: any; apiKey?: string }) {
  // Groq is the primary server-side provider when configured.
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && !options.apiKey && !perRequest.getStore()?.apiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + groqKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_completion_tokens: Math.min(options.config?.maxOutputTokens || 4096, 8192),
        ...(options.config?.responseMimeType === 'application/json' ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          ...(options.config?.systemInstruction ? [{ role: 'system', content: String(options.config.systemInstruction) }] : []),
          { role: 'user', content: typeof options.contents === 'string' ? options.contents : JSON.stringify(options.contents) },
        ],
      }),
      signal: AbortSignal.timeout(85000),
    });
    const data: any = await response.json();
    if (!response.ok) throw new Error('Groq API (' + response.status + '): ' + (data.error?.message || 'Request failed'));
    return { text: data.choices?.[0]?.message?.content || '' } as any;
  }
  // Claude is the primary provider when configured; existing callers retain their JSON contract.
  const claudeKey = process.env.ANTHROPIC_API_KEY || '';
  if (claudeKey) {
    const system = String(options.config?.systemInstruction || '');
    const contents = typeof options.contents === 'string' ? options.contents : JSON.stringify(options.contents);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',
        max_tokens: options.config?.maxOutputTokens || 4096,
        ...(system ? { system: system + (options.config?.responseMimeType === 'application/json' ? '\\nReturn ONLY valid JSON.' : '') } : {}),
        messages: [{ role: 'user', content: contents }],
      }),
      signal: AbortSignal.timeout(90000),
    });
    const data: any = await response.json();
    if (!response.ok) throw new Error('Claude API: ' + (data.error?.message || response.status));
    return { text: (data.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('') } as any;
  }
  const client = getGeminiClient(options.apiKey);
  const primary = getLlmConfig().model || options.model || DEFAULT_GEMINI_MODEL;
  let lastError: any = null;
  for (const model of [primary, ...FALLBACK_MODELS.filter(m => m !== primary)]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await client.models.generateContent({ contents: options.contents, config: options.config, model });
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code || '';
        const msg = (err?.message || '').toLowerCase();
        const isNotFound = status === 404 || status === 'NOT_FOUND' || msg.includes('not found') || msg.includes('no longer available');
        const transient = status === 503 || status === 429 || status === 'UNAVAILABLE' || status === 'RESOURCE_EXHAUSTED' || msg.includes('high demand') || msg.includes('quota') || msg.includes('rate') || isNotFound;
        if (!transient) throw err;
        if (attempt === 0) await new Promise(r => setTimeout(r, 350));
      }
    }
  }
  throw lastError;
}

// Gọi nhanh dạng prompt → chuỗi (kèm JSON nếu json=true).
export async function callLLM(options: { prompt: string; systemInstruction?: string; json?: boolean; maxTokens?: number; override?: { apiKey?: string; model?: string } }): Promise<string> {
  const res = await generateGemini({
    contents: options.prompt,
    apiKey: options.override?.apiKey,
    model: options.override?.model,
    config: { systemInstruction: options.systemInstruction, maxOutputTokens: options.maxTokens, ...(options.json ? { responseMimeType: 'application/json' } : {}) },
  });
  const text = (res.text || '').trim();
  if (!text) throw new Error('AI trả về nội dung rỗng');
  return text;
}
