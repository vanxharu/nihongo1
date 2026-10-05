import { auth } from '../lib/firebase';

/**
 * Builds request headers carrying the signed-in user's Firebase ID token.
 * The server only trusts verified Firebase tokens, so every protected API call
 * must go through this helper.
 */
export async function authHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...extra };
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
  } catch (err) {
    console.warn('[AUTH] Could not get ID token for request:', err);
  }
  return headers;
}
