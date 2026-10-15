// Gemini API key riêng của người dùng (lưu trong trình duyệt này, gửi kèm mọi yêu cầu /api/ cùng nguồn).
const KEY = 'nihongo_custom_llm_v1';
export interface CustomLlm { model: string; apiKey: string }

export const readCustomLlm = (): CustomLlm | null => {
  try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v?.apiKey ? v : null; } catch { return null; }
};
export const saveCustomLlm = (v: CustomLlm | null) => {
  try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch { /* chế độ riêng tư: bỏ qua */ }
};

let patched = false;
export function installCustomLlmHeaders() {
  if (patched || typeof window === 'undefined') return;
  patched = true;
  const orig = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const cfg = readCustomLlm();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (cfg && /^(\/api\/|https?:\/\/[^/]*\/api\/)/.test(url) && (url.startsWith('/') || url.startsWith(location.origin))) {
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      headers.set('x-llm-key', cfg.apiKey);
      if (cfg.model) headers.set('x-llm-model', cfg.model);
      return orig(input, { ...init, headers });
    }
    return orig(input, init);
  };
}
