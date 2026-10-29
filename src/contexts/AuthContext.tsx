import { connectCloudLearning, stopCloudLearning } from '../utils/cloudLearningState';
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types';

import { localDateStr } from '../utils/localDate';
export const getAuthPlatform = (): 'pwa' | 'mobile' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  const isPwa = window.matchMedia?.('(display-mode: standalone)')?.matches || (window.navigator as any)?.standalone === true;
  if (isPwa) return 'pwa';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return 'mobile';
  return 'desktop';
};

export type AuthStatus = 
  | 'AUTH_INITIALIZING' 
  | 'AUTHENTICATING' 
  | 'AUTHENTICATED' 
  | 'UNAUTHENTICATED' 
  | 'AUTH_ERROR'
  | 'INITIALIZING'
  | 'ERROR';

export interface AuthErrorInfo {
  code: string;
  message: string;
}

interface AuthContextType {
  user: User | null;
  dbUser: UserProfile | null;
  token: string | null;
  loading: boolean;
  authStatus: AuthStatus;
  lastAuthError: AuthErrorInfo | null;
  clearAuthError: () => void;
  login: (identifier: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, pass: string, displayName?: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  syncProfile: () => Promise<void>;
  updateDbProfile: (updatedFields: Partial<UserProfile>) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const LOCAL_STORAGE_KEY = 'nhai_kanji_user_profile_v1';
// Chưa có ảnh, hoặc ảnh mặc định cũ (🦊 tài khoản mới, 🐕 hồ sơ khách) = chưa chọn ảnh riêng → dùng ảnh tài khoản Google.
export const isDefaultAvatar = (a?: string | null) => !a || a === '🦊' || a === '🐕';
// Ảnh hiện tại của tài khoản Google nằm ở providerData (Firebase cập nhật mỗi lần đăng nhập); user.photoURL giữ ảnh lúc
// tạo tài khoản nên có thể là link cũ đã chết (đổi ảnh Google), hoặc rỗng khi tạo bằng mật khẩu rồi mới liên kết Google.
const googlePhoto = (u?: User | null) => u?.providerData.find(p => p.providerId === 'google.com' && p.photoURL)?.photoURL || u?.photoURL || u?.providerData.find(p => p.photoURL)?.photoURL || '';
const isGoogleHosted = (a?: string | null) => !!a && /^https:\/\/[^/]*googleusercontent\.com\//.test(a);
/** Ảnh hiển thị: ảnh người dùng tự chọn giữ nguyên; ảnh mặc định hoặc link ảnh Google cũ → ảnh Google hiện tại. */
export const accountAvatar = (a: string | null | undefined, u?: User | null) => {
  const fresh = googlePhoto(u);
  return isDefaultAvatar(a) || (isGoogleHosted(a) && fresh && fresh !== a) ? fresh || '' : a!;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // CRITICAL SECURITY: Never trust cached role from localStorage for admin privileges before server verification!
        return {
          ...parsed,
          role: 'user'
        };
      }
    } catch (e) {
      console.warn("Could not load initial user profile from localStorage:", e);
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('AUTH_INITIALIZING');
  const [lastAuthError, setLastAuthError] = useState<AuthErrorInfo | null>(null);

  const clearAuthError = () => setLastAuthError(null);

  const checkAndApplyRedirect = (userRole?: string) => {
    try {
      const savedUrl = sessionStorage.getItem('jpstudy_redirect_after_login') || sessionStorage.getItem('auth_return_url');
      if (savedUrl) {
        sessionStorage.removeItem('jpstudy_redirect_after_login');
        sessionStorage.removeItem('auth_return_url');
        // Validate internal route strictly (must start with single '/', not '//')
        if (savedUrl.startsWith('/') && !savedUrl.startsWith('//')) {
          if (savedUrl.startsWith('/admin')) {
            if (userRole === 'admin') {
              navigate(savedUrl, { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          } else {
            navigate(savedUrl, { replace: true });
          }
        }
      }
    } catch (e) {
      console.warn('Could not process redirect after login:', e);
    }
  };

  // Helper to parse the DB user response safely
  // A single corrupted column must not break the whole profile sync.
const safeJson = (value: unknown, fallback: any) => {
  if (typeof value !== 'string') return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
};

const parseDbUser = (dbData: any): UserProfile => {
    const parsed: UserProfile = {
      uid: dbData.uid || undefined,
      email: dbData.email || undefined,
      username: dbData.username || undefined,
      name: dbData.name || 'Học viên JLPT',
      // Chưa chọn ảnh riêng → ảnh tài khoản Google (server không lưu ảnh này, nên mọi lần đọc lại hồ sơ đều phải gắn lại).
      avatar: dbData.uid && dbData.uid === auth.currentUser?.uid ? accountAvatar(dbData.avatar, auth.currentUser) : isDefaultAvatar(dbData.avatar) ? '' : dbData.avatar,
      targetLevel: (dbData.targetLevel || dbData.target_level || 'N4') as any,
      xp: dbData.xp !== null && dbData.xp !== undefined ? dbData.xp : 0,
      streak: dbData.streak !== null && dbData.streak !== undefined ? dbData.streak : 0,
      coins: dbData.coins !== null && dbData.coins !== undefined ? dbData.coins : 0,
      lastActiveDate: dbData.lastActiveDate || dbData.last_active_date || undefined,
      studyDays: safeJson(dbData.studyDays, []),
      completedLessons: safeJson(dbData.completedLessons, []),
      vocabStatus: safeJson(dbData.vocabStatus, {}),
      myWords: safeJson(dbData.myWords, []),
      grammarStatus: safeJson(dbData.grammarStatus, {}),
      kanjiStatus: safeJson(dbData.kanjiStatus, {}),
      dailyTestResults: safeJson(dbData.dailyTestResults, []),
      studyRoadmap: dbData.studyRoadmap,
      studyTrack: dbData.studyTrack === 'business' ? 'business' : undefined,
      shadowingStats: dbData.shadowingStats,
      unlockedBadges: dbData.unlockedBadges,
      savedWords: dbData.savedWords,
      savedVocab: dbData.savedVocab,
      lastPosition: safeJson(dbData.lastPosition, undefined),
      notificationSettings: safeJson(dbData.notificationSettings || dbData.notification_settings, undefined),
      role: dbData.role || 'user'
    };

    if (parsed.notificationSettings) {
      try {
        localStorage.setItem('jpstudy_reminder_settings', JSON.stringify(parsed.notificationSettings));
      } catch (e) {
        console.warn('Failed to sync notification settings to localStorage:', e);
      }
    }

    return parsed;
  };

  const syncProfile = async () => {
    if(!auth.currentUser)return;
    chosenTargetRef.current=undefined;
    const parsed=await loadOrCreateProfile(auth.currentUser);setDbUser(parsed);localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(parsed));
  };

  // Only the newest save may overwrite state; an older, slower response would revert fields (e.g. targetLevel back to N4).
  const profileSeqRef = useRef(0);
  // Latest target level the user picked; a concurrent save's response may carry a stale value from before it was written.
  const chosenTargetRef = useRef<string | undefined>(undefined);
  const updateDbProfileWithToken = async (activeToken: string, updatedFields: Partial<UserProfile>): Promise<UserProfile | null> => {
    const seq = ++profileSeqRef.current;
    if (updatedFields.targetLevel) chosenTargetRef.current = updatedFields.targetLevel;
    // Optimistically update local state first
    let optimisticProfile: UserProfile | null = null;
    setDbUser((prev) => {
      if (!prev) return null;
      optimisticProfile = { ...prev, ...updatedFields };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(optimisticProfile));
      } catch (e) {
        // ignore
      }
      return optimisticProfile;
    });

    try {
      // Create request payload
      const payload: any = { ...updatedFields };
      
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const parsed = { ...parseDbUser(data.user), ...(chosenTargetRef.current && { targetLevel: chosenTargetRef.current as any }), ...updatedFields };
          if (seq !== profileSeqRef.current) return parsed;
          setDbUser(parsed);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Error updating profile on server, saved locally:', error);
    }
    if (updatedFields.studyRoadmap !== undefined) throw new Error('Chưa đồng bộ được lộ trình lên máy chủ.');
    return optimisticProfile;
  };

  const updateDbProfile = async (updatedFields: Partial<UserProfile>): Promise<UserProfile | null> => {
    const activeToken = user ? await user.getIdToken() : null;
    if (!activeToken) return null;
    if (activeToken !== token) {
      setToken(activeToken);
    }
    return updateDbProfileWithToken(activeToken, updatedFields);
  };

  const loginWithGoogle = async () => {
    clearAuthError();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const started = Date.now();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      // Popup blocked, or closed within 3s (browsers that cut the popup<->page channel): full-page redirect instead.
      if (err?.code === 'auth/popup-blocked' || (err?.code === 'auth/popup-closed-by-user' && Date.now() - started < 3000)) {
        try { sessionStorage.setItem('auth_return_url', location.pathname + location.search); } catch { /* ignore */ }
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  };

  const login = async (identifier: string, pass: string) => {
    setLoading(true);
    setAuthStatus('AUTHENTICATING');
    clearAuthError();
    try {
      let effectiveEmail = (identifier || '').trim();
      
      // If user entered a username (does not contain @), resolve to account email
      if (!effectiveEmail.includes('@')) {
        const resolveRes = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: effectiveEmail })
        });
        
        if (resolveRes.ok) {
          const resolveData = await resolveRes.json();
          if (resolveData.success && resolveData.email) {
            effectiveEmail = resolveData.email;
          } else {
            const err: any = new Error(resolveData.error || 'Không tìm thấy tài khoản với tên đăng nhập này.');
            err.code = 'auth/user-not-found';
            throw err;
          }
        } else {
          const resolveData = await resolveRes.json().catch(() => ({}));
          const err: any = new Error(resolveData.error || 'Không tìm thấy tài khoản với tên đăng nhập này.');
          err.code = 'auth/user-not-found';
          throw err;
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, effectiveEmail, pass);
      if (userCredential && userCredential.user) {
        const idToken = await userCredential.user.getIdToken();
        setToken(idToken);
        const parsed=await loadOrCreateProfile(userCredential.user);
        setDbUser(parsed);localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(parsed));checkAndApplyRedirect(parsed.role);
      }
      setAuthStatus('AUTHENTICATED');
    } catch (err: any) {
      setAuthStatus('ERROR');
      setLastAuthError({
        code: err?.code || 'auth/login-failed',
        message: err?.message || 'Đăng nhập không thành công.'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, displayName?: string, username?: string) => {
    setLoading(true);
    setAuthStatus('AUTHENTICATING');
    clearAuthError();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const chosenName = displayName || username || email.split('@')[0];
      if (userCredential && userCredential.user) {
        await firebaseUpdateProfile(userCredential.user, {
          displayName: chosenName
        });
      }
      if (userCredential && userCredential.user) {
        const idToken = await userCredential.user.getIdToken();
        setToken(idToken);

        // Update profile in DB with chosen username and name
        const cleanUsername = username ? username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '') : undefined;
        try {
          await fetch('/api/user/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              name: chosenName,
              username: cleanUsername
            })
          });
        } catch (profileErr) {
          console.warn('Could not save username on registration:', profileErr);
        }

        const parsed=await loadOrCreateProfile(userCredential.user);
        setDbUser(parsed);localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(parsed));checkAndApplyRedirect(parsed.role);
      }
      setAuthStatus('AUTHENTICATED');
    } catch (err: any) {
      setAuthStatus('ERROR');
      setLastAuthError({
        code: err?.code || 'auth/register-failed',
        message: err?.message || 'Đăng ký không thành công.'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper to load existing profile or create a default one for a verified Firebase user
  const profileLoadingRef=useRef<{uid:string;promise:Promise<UserProfile>}|null>(null);
  const loadOrCreateProfile=(firebaseUser:User):Promise<UserProfile>=>{
    if(profileLoadingRef.current?.uid===firebaseUser.uid)return profileLoadingRef.current.promise;
    const promise=loadProfile(firebaseUser).finally(()=>{if(profileLoadingRef.current?.promise===promise)profileLoadingRef.current=null;});
    profileLoadingRef.current={uid:firebaseUser.uid,promise};return promise;
  };
  const loadProfile = async (firebaseUser: User): Promise<UserProfile> => {
    let profileBeforeSync:any=null;try{profileBeforeSync=JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)||'null');}catch{}
    // 1. Base profile from Firebase user info
    const defaultProfile: UserProfile = {
      name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Học viên JLPT'),
      avatar: googlePhoto(firebaseUser),
      targetLevel: 'N4',
      xp: 0,
      streak: 1,
      coins: 0,
      lastActiveDate: localDateStr(),
      studyDays: [localDateStr()],
      completedLessons: [],
      vocabStatus: {},
      grammarStatus: {},
      kanjiStatus: {},
      dailyTestResults: [],
      role: 'user'
    };

    // 2. Fetch and synchronize profile with server database
    try {
      const idToken = await firebaseUser.getIdToken();
      setToken(idToken);
      const syncResponse = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        signal: AbortSignal.timeout(8000) // a hung server must not keep the header on "Đang kiểm tra..." forever
      });
      const contentType = syncResponse.headers.get('content-type') || '';
      if (syncResponse.ok && contentType.includes('application/json')) {
        const syncData = await syncResponse.json();
        if(syncData.success && syncData.user?.profileMigrationVersion===0){
          const cached=profileBeforeSync;
          const profile=cached&&(!cached.uid||cached.uid===firebaseUser.uid)?{...cached,avatar:isDefaultAvatar(cached.avatar)?undefined:cached.avatar}:{}; // ảnh mặc định của hồ sơ khách không được đè ảnh Google đã lưu
          const migration=await fetch('/api/user/import-browser',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${idToken}`},body:JSON.stringify({profile})});
          if(!migration.ok)throw new Error('Không nhập được tiến độ cũ lên Firebase.');
          const imported=await migration.json();syncData.user=imported.user;
        }
        // Đồng bộ dữ liệu học (tải/đẩy nhiều phần) chạy nền: không bắt màn đăng nhập chờ; xong sẽ phát 'learning-cloud-restored' để app nạp lại.
        void connectCloudLearning(firebaseUser).catch(e => console.warn('[AUTH] Cloud learning sync failed:', e));
        if (syncData.success && syncData.user) {
          const parsed = parseDbUser(syncData.user);
          // Chưa chọn ảnh riêng, hoặc link ảnh Google đã cũ → dùng ảnh hiện tại của tài khoản mail.
          const fresh = accountAvatar(syncData.user.avatar, firebaseUser);
          if (fresh && (fresh !== syncData.user.avatar || isGoogleHosted(fresh))) {
            parsed.avatar = fresh;
            // Lưu lên hồ sơ: máy chủ chép ảnh Google thành ảnh nhúng (link Google có thể bị trình duyệt chặn hoặc hết hạn).
            try {
              const saved = await fetch('/api/user/profile', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` }, body: JSON.stringify({ avatar: fresh }), signal: AbortSignal.timeout(8000) }).then(r => r.ok ? r.json() : null);
              if (typeof saved?.user?.avatar === 'string' && saved.user.avatar.startsWith('data:image/')) parsed.avatar = saved.user.avatar;
            } catch { /* giữ link Google */ }
          }
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          console.log('[AUTH] Profile: LOADED');
          return parsed;
        }
      }
    } catch (syncErr) {
      console.warn('[AUTH] Notice while syncing profile with database:', syncErr);
    }

    // 3. Fallback to cached profile if present and valid
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.uid===firebaseUser.uid && parsed.name && parsed.name !== 'Học viên JLPT') {
          console.log('[AUTH] Profile: LOADED');
          return {
            ...parsed,
            avatar: accountAvatar(parsed.avatar, firebaseUser) || parsed.avatar,
            role: 'user'
          };
        }
      }
    } catch (e) {
      // ignore
    }

    console.log('[AUTH] Profile: CREATED');
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  };

  const logout = async () => {
    await stopCloudLearning();
    setLoading(true);
    try {
      try {
        await signOut(auth);
      } catch (e) {
        // ignore
      }
      setUser(null);
      setDbUser(null);
      setToken(null);
      setAuthStatus('UNAUTHENTICATED');
      setLastAuthError(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('jpstudy_app_session_v1');
    } finally {
      setLoading(false);
    }
  };

  // Integrated Auth Lifecycle (Pure Firebase onAuthStateChanged)
  useEffect(() => {
    let isMounted = true;
    setAuthStatus('INITIALIZING');

    getRedirectResult(auth).catch((e) => {
      console.error('[AUTH] Redirect sign-in failed:', e?.code, e?.message);
      if (isMounted) setLastAuthError({ code: e?.code || 'auth/redirect-failed', message: 'Đăng nhập Google thất bại.' });
    });
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        setLastAuthError(null);
        // Đã có hồ sơ lưu máy của đúng tài khoản → vào app ngay, đồng bộ server chạy nền rồi cập nhật.
        try {
          const c = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || 'null');
          if (c && c.uid === currentUser.uid && c.name && c.name !== 'Học viên JLPT' && isMounted) {
            setDbUser({ ...c, avatar: accountAvatar(c.avatar, currentUser), role: 'user' }); // quyền admin chỉ tin server
            setAuthStatus('AUTHENTICATED');
            setLoading(false);
          }
        } catch { /* no cache */ }
        try {
          const profile = await loadOrCreateProfile(currentUser);
          if (isMounted) {
            setDbUser(profile);
            setAuthStatus('AUTHENTICATED');
            setLoading(false);
            console.log('[AUTH] Authentication: COMPLETE');
            checkAndApplyRedirect(profile.role);
          }
        } catch (profileErr) {
          console.error('[AUTH] Error loading profile:', profileErr);
          if (isMounted) {
            setAuthStatus('AUTHENTICATED');
            setLoading(false);
          }
        }
      } else {
        // Drop any legacy unsigned app session left by the removed quick-login.
        try {
          localStorage.removeItem('jpstudy_app_session_v1');
        } catch {
          // ignore
        }

        setDbUser(null);
        setToken(null);
        setUser(null);
        setAuthStatus('UNAUTHENTICATED');
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Proactively check ID token every 15 minutes if there is an active user
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;
        const freshToken = await user.getIdToken(false);
        if (freshToken) {
          setToken(freshToken);
        }
      } catch (err: any) {
        // Network errors or offline states are transient; Firebase automatically retries when online
        console.warn("Soft token check encountered network issue (will retry automatically):", err?.message || err);
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [user]);

  // Check token on tab focus/visibility change (throttled, non-blocking)
  useEffect(() => {
    if (!user) return;

    let lastCheckTime = Date.now();

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        // Throttle check: Firebase tokens last 1 hour, so checking at most once every 5 minutes on tab focus is plenty
        if (now - lastCheckTime < 5 * 60 * 1000) {
          return;
        }
        lastCheckTime = now;

        // Skip if browser is currently offline or waking from sleep without network connectivity
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return;
        }

        try {
          // Use getIdToken(false) to return the valid cached token or refresh only if needed
          const freshToken = await user.getIdToken(false);
          if (freshToken) {
            setToken(freshToken);
          }
        } catch (err: any) {
          // Softly warn on network errors (e.g. auth/network-request-failed) rather than logging an error
          console.warn("Could not refresh token on tab focus (will retry when network is ready):", err?.message || err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      dbUser,
      token,
      loading,
      authStatus,
      lastAuthError,
      clearAuthError,
      login,
      loginWithGoogle,
      register,
      logout,
      syncProfile,
      updateDbProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
