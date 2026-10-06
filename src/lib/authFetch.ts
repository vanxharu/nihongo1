import { auth } from './firebase';

/**
 * Same-origin /api/ requests carry the signed-in user's Firebase ID token, so the server can tell users apart
 * (e.g. per-user listening progress) without trusting a client-supplied uid. Guests send no header.
 * The token is never attached to other origins or to a request that already sets Authorization.
 */
if (typeof window !== 'undefined' && !(window as any).__authFetchInstalled) {
  (window as any).__authFetchInstalled = true;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(raw, window.location.href);
      const user = auth.currentUser;
      if (user && url.origin === window.location.origin && url.pathname.startsWith('/api/')) {
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
          return nativeFetch(input, { ...init, headers });
        }
      }
    } catch { /* fall through to a plain request */ }
    return nativeFetch(input, init);
  };
}
