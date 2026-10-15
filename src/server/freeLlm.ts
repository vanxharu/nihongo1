import { AsyncLocalStorage } from 'node:async_hooks';
import type { Request, Response, NextFunction } from 'express';

// Model ngôn ngữ miễn phí dùng chung cho mọi tính năng AI (OpenAI-compatible, mặc định Pollinations, không cần key).
export const FREE_LLM_DEFAULT_URL = 'https://text.pollinations.ai/openai';
export const FREE_LLM_DEFAULT_MODEL = 'openai-fast';

let cfg = { baseUrl: '', model: '', apiKey: '' };
export function setFreeLLMConfig(c: { baseUrl?: string; model?: string; apiKey?: string }) {
  cfg = { baseUrl: c.baseUrl || '', model: c.model || '', apiKey: c.apiKey || '' };
}
// Cấu hình riêng của từng người dùng, gửi kèm mỗi request qua header (không lưu trên server).
const perRequest = new AsyncLocalStorage<{ baseUrl: string; model: string; apiKey: string }>();

// Chống SSRF: chỉ https và không trỏ vào mạng nội bộ.
export function isSafeLlmUrl(u: string): boolean {
  try {
    const x = new URL(u);
    const h = x.hostname.toLowerCase();
    return x.protocol === 'https:' && !/^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[|.*\.(local|internal)$)/.test(h) && h.includes('.');
  } catch { return false; }
}

export function userLlmMiddleware(req: Request, _res: Response, next: NextFunction) {
  const baseUrl = String(req.headers['x-llm-base-url'] || '');
  if (!baseUrl || !isSafeLlmUrl(baseUrl)) return next();
  perRequest.run({ baseUrl, model: String(req.headers['x-llm-model'] || ''), apiKey: String(req.headers['x-llm-key'] || '') }, next);
}

export function getFreeLLMConfig() {
  const u = perRequest.getStore();
  return {
    baseUrl: (u?.baseUrl || cfg.baseUrl || FREE_LLM_DEFAULT_URL).trim(),
    model: (u?.baseUrl ? u.model || FREE_LLM_DEFAULT_MODEL : cfg.model || FREE_LLM_DEFAULT_MODEL).trim(),
    apiKey: (u?.baseUrl ? u.apiKey : cfg.apiKey || '').trim(),
  };
}

export async function callFreeLLM(options: {
  prompt: string; systemInstruction?: string; json?: boolean; maxTokens?: number; timeoutMs?: number;
  override?: { baseUrl?: string; model?: string; apiKey?: string };
}): Promise<string> {
  const c = { ...getFreeLLMConfig(), ...(options.override || {}) };
  if (!isSafeLlmUrl(c.baseUrl)) throw new Error('Địa chỉ API không hợp lệ (cần https công khai).');
  const messages: any[] = [];
  if (options.systemInstruction) messages.push({ role: 'system', content: options.systemInstruction });
  messages.push({ role: 'user', content: options.prompt });
  const r = await fetch(c.baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(c.apiKey ? { Authorization: `Bearer ${c.apiKey}` } : {}) },
    body: JSON.stringify({ model: c.model, messages, temperature: 0.7, max_tokens: options.maxTokens || 6000, ...(c.baseUrl === FREE_LLM_DEFAULT_URL ? { reasoning_effort: 'low' } : {}) }),
    signal: AbortSignal.timeout(options.timeoutMs || 50000),
  });
  if (!r.ok) throw new Error(`Model miễn phí trả lỗi ${r.status}`);
  const data: any = await r.json();
  const text = String(data?.choices?.[0]?.message?.content || '').trim();
  if (!text) throw new Error('Model miễn phí trả về nội dung rỗng');
  if (!options.json) return text;
  const body = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const m = body.match(/[\[{][\s\S]*[\]}]/); // model có thể thêm chữ ngoài JSON
  if (!m) throw new Error('Model miễn phí không trả JSON hợp lệ');
  JSON.parse(m[0]);
  return m[0];
}

export const hasMedia = (contents: any): boolean =>
  Array.isArray(contents) && contents.some((c: any) => c?.inlineData || c?.fileData || (c?.parts || []).some((p: any) => p?.inlineData || p?.fileData));

const textOf = (c: any): string =>
  typeof c === 'string' ? c : Array.isArray(c) ? c.map(textOf).filter(Boolean).join('\n') : c?.parts ? textOf(c.parts) : typeof c?.text === 'string' ? c.text : '';

// Đổi responseSchema kiểu Gemini thành JSON mẫu để model điền vào (model nhỏ hay chép nguyên schema nếu đưa schema thô).
const skeleton = (sc: any): any => {
  const t = String(sc?.type || '').toUpperCase();
  if (t === 'OBJECT') return Object.fromEntries(Object.entries(sc.properties || {}).map(([k, v]) => [k, skeleton(v)]));
  if (t === 'ARRAY') return [skeleton(sc.items)];
  if (t === 'INTEGER' || t === 'NUMBER') return 0;
  if (t === 'BOOLEAN') return false;
  return '...';
};

// Nhận tham số kiểu Gemini generateContent, trả về { text } như Gemini.
export async function freeGenerate(options: { contents: any; config?: any }): Promise<{ text: string }> {
  const config = options.config || {};
  const json = config.responseMimeType === 'application/json' || !!config.responseSchema;
  let system = typeof config.systemInstruction === 'string' ? config.systemInstruction : textOf(config.systemInstruction);
  if (json) system += `\nChỉ trả về đúng một JSON hợp lệ, không markdown.${config.responseSchema ? ` JSON phải đúng cấu trúc mẫu sau, thay mọi giá trị mẫu bằng nội dung thật: ${JSON.stringify(skeleton(config.responseSchema))}` : ''}`;
  let last: any;
  const t0 = Date.now();
  for (let i = 0; i < 2; i++) {
    if (i && Date.now() - t0 > 20000) break; // Vercel giới hạn 60s: không thử lại khi đã chờ lâu
    try {
      return { text: await callFreeLLM({ prompt: textOf(options.contents), systemInstruction: system || undefined, json, maxTokens: config.maxOutputTokens ? config.maxOutputTokens + 3000 : undefined }) };
    } catch (e) { last = e; }
  }
  throw last;
}

// Bọc handler của các hàm api/*.ts riêng (không đi qua Express app) để cũng nhận key người dùng.
export const withUserLlm = (h: (req: any, res: any) => any) => (req: any, res: any) => {
  let r: any; let ran = false;
  userLlmMiddleware(req, res, () => { ran = true; r = h(req, res); });
  return ran ? r : h(req, res);
};
