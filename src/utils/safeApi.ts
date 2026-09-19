/**
 * Safe API Utilities to prevent SyntaxError: Unexpected token errors when rate limits
 * or network errors occur, with automatic offline/fallback recovery.
 */

export interface SafeFetchResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
  fallbackValue: T | null = null
): Promise<SafeFetchResult<T>> {
  try {
    const res = await fetch(url, options);
    
    if (!res.ok) {
      // e.g. 429 "Rate exceeded.", 502 Bad Gateway, 503 Service Unavailable
      let errText = '';
      try {
        errText = await res.text();
      } catch {
        errText = res.statusText;
      }
      return {
        ok: false,
        status: res.status,
        data: fallbackValue,
        error: errText.slice(0, 100) || `HTTP ${res.status}`
      };
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return {
        ok: true,
        status: res.status,
        data: data as T
      };
    }

    // Attempt to parse text in case content-type header was omitted or text/plain
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return {
        ok: true,
        status: res.status,
        data: data as T
      };
    } catch {
      return {
        ok: false,
        status: res.status,
        data: fallbackValue,
        error: 'Response is not valid JSON'
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: fallbackValue,
      error: err?.message || 'Network error'
    };
  }
}
