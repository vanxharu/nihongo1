import firebaseConfig from '../../firebase-applet-config.json' assert { type: 'json' };

export type PasswordCheck = 'ok' | 'invalid' | 'throttled' | 'unavailable';

// Checks an email/password pair with Firebase Auth's REST API (the same call the web SDK makes).
// Used so the username login only reveals the account email to someone who already knows the password.
export async function verifyFirebasePassword(email: string, password: string, origin?: string): Promise<PasswordCheck> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey;
  if (!apiKey) return 'unavailable';
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // Browser API keys are often restricted by HTTP referrer: pass on the page's origin.
    const referer = origin || process.env.APP_URL;
    if (referer && /^https?:\/\//.test(referer)) headers.Referer = referer.endsWith('/') ? referer : `${referer}/`;
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password, returnSecureToken: false }),
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) return 'ok';
    const message = String((await r.json().catch(() => ({})))?.error?.message || '');
    if (/TOO_MANY_ATTEMPTS/.test(message)) return 'throttled';
    if (/INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD|EMAIL_NOT_FOUND|USER_DISABLED|MISSING_PASSWORD/.test(message)) return 'invalid';
    console.error('[auth] signInWithPassword check failed:', r.status, message.slice(0, 120));
    return 'unavailable';
  } catch (e: any) {
    console.error('[auth] signInWithPassword check error:', e?.message || e);
    return 'unavailable';
  }
}
