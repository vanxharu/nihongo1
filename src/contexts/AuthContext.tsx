import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types';

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
  register: (email: string, pass: string, displayName?: string, username?: string) => Promise<void>;
  quickLogin: (identifier?: string, name?: string) => Promise<void>;
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
  const parseDbUser = (dbData: any): UserProfile => {
    const parsed: UserProfile = {
      uid: dbData.uid || undefined,
      email: dbData.email || undefined,
      username: dbData.username || undefined,
      name: dbData.name || 'Học viên JLPT',
      avatar: dbData.avatar || '🦊',
      targetLevel: (dbData.targetLevel || dbData.target_level || 'N4') as any,
      xp: dbData.xp !== null && dbData.xp !== undefined ? dbData.xp : 0,
      streak: dbData.streak !== null && dbData.streak !== undefined ? dbData.streak : 0,
      coins: dbData.coins !== null && dbData.coins !== undefined ? dbData.coins : 0,
      lastActiveDate: dbData.lastActiveDate || dbData.last_active_date || undefined,
      studyDays: dbData.studyDays ? (typeof dbData.studyDays === 'string' ? JSON.parse(dbData.studyDays) : dbData.studyDays) : [],
      completedLessons: dbData.completedLessons ? (typeof dbData.completedLessons === 'string' ? JSON.parse(dbData.completedLessons) : dbData.completedLessons) : [],
      vocabStatus: dbData.vocabStatus ? (typeof dbData.vocabStatus === 'string' ? JSON.parse(dbData.vocabStatus) : dbData.vocabStatus) : {},
      grammarStatus: dbData.grammarStatus ? (typeof dbData.grammarStatus === 'string' ? JSON.parse(dbData.grammarStatus) : dbData.grammarStatus) : {},
      kanjiStatus: dbData.kanjiStatus ? (typeof dbData.kanjiStatus === 'string' ? JSON.parse(dbData.kanjiStatus) : dbData.kanjiStatus) : {},
      dailyTestResults: dbData.dailyTestResults ? (typeof dbData.dailyTestResults === 'string' ? JSON.parse(dbData.dailyTestResults) : dbData.dailyTestResults) : [],
      lastPosition: dbData.lastPosition ? (typeof dbData.lastPosition === 'string' ? JSON.parse(dbData.lastPosition) : dbData.lastPosition) : undefined,
      notificationSettings: dbData.notificationSettings || dbData.notification_settings 
        ? (typeof (dbData.notificationSettings || dbData.notification_settings) === 'string' 
            ? JSON.parse(dbData.notificationSettings || dbData.notification_settings) 
            : (dbData.notificationSettings || dbData.notification_settings))
        : undefined,
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
    if (!auth.currentUser) return;
    try {
      const idToken = await auth.currentUser.getIdToken(false);
      setToken(idToken);

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const parsed = parseDbUser(data.user);
          
          // Rich feature: If a guest studied without an account, merge their local progress into their new cloud account
          const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedLocal && parsed.xp === 0) {
            try {
              const localProfile = JSON.parse(savedLocal) as UserProfile;
              // STRICT HYGIENE: Only merge if localProfile was a guest (no uid) or matched the exact same user
              const isGuestSession = !localProfile.uid || localProfile.uid === parsed.uid;
              if (isGuestSession && localProfile.xp > 0) {
                console.log("Merging guest profile progress into new cloud database account...");
                const mergedProfile = await updateDbProfileWithToken(idToken, {
                  name: localProfile.name !== 'Học viên JLPT' ? localProfile.name : parsed.name,
                  avatar: localProfile.avatar || parsed.avatar,
                  targetLevel: localProfile.targetLevel || parsed.targetLevel,
                  xp: localProfile.xp,
                  streak: Math.max(localProfile.streak, parsed.streak),
                  coins: localProfile.coins,
                  studyDays: localProfile.studyDays,
                  completedLessons: localProfile.completedLessons,
                  vocabStatus: localProfile.vocabStatus,
                  grammarStatus: localProfile.grammarStatus,
                  kanjiStatus: localProfile.kanjiStatus,
                  dailyTestResults: localProfile.dailyTestResults,
                  lastPosition: localProfile.lastPosition || parsed.lastPosition
                });
                if (mergedProfile) {
                  setDbUser(mergedProfile);
                  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedProfile));
                  return;
                }
              }
            } catch (mergeErr) {
              console.warn("Could not merge local profile into DB:", mergeErr);
            }
          }

          setDbUser(parsed);
          // Sync with local storage too for backup/instant load
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        }
      }
    } catch (error) {
      console.warn('Could not sync profile with server (running in local mode):', error);
    }
  };

  const updateDbProfileWithToken = async (activeToken: string, updatedFields: Partial<UserProfile>): Promise<UserProfile | null> => {
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
          const parsed = parseDbUser(data.user);
          setDbUser(parsed);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Error updating profile on server, saved locally:', error);
    }
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
        const syncResponse = await fetch('/api/user/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });
        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          if (syncData.success && syncData.user) {
            const parsed = parseDbUser(syncData.user);
            setDbUser(parsed);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
            checkAndApplyRedirect(parsed.role);
          }
        }
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

        const syncResponse = await fetch('/api/user/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });
        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          if (syncData.success && syncData.user) {
            const parsed = parseDbUser(syncData.user);
            setDbUser(parsed);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
            checkAndApplyRedirect(parsed.role);
          }
        }
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
  const loadOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    // 1. Base profile from Firebase user info
    const defaultProfile: UserProfile = {
      name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Học viên JLPT'),
      avatar: firebaseUser.photoURL || '🦊',
      targetLevel: 'N4',
      xp: 0,
      streak: 1,
      coins: 0,
      lastActiveDate: new Date().toISOString().split('T')[0] || '',
      studyDays: [new Date().toISOString().split('T')[0] || ''],
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
        }
      });
      const contentType = syncResponse.headers.get('content-type') || '';
      if (syncResponse.ok && contentType.includes('application/json')) {
        const syncData = await syncResponse.json();
        if (syncData.success && syncData.user) {
          const parsed = parseDbUser(syncData.user);
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
        if (parsed && parsed.name && parsed.name !== 'Học viên JLPT') {
          console.log('[AUTH] Profile: LOADED');
          return {
            ...parsed,
            avatar: firebaseUser.photoURL || parsed.avatar,
            role: parsed.role || 'user'
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

  const quickLogin = async (identifierInput?: string, nameInput?: string) => {
    setLoading(true);
    setAuthStatus('AUTHENTICATING');
    clearAuthError();
    try {
      const identifier = (identifierInput || '').trim();
      if (!identifier) {
        throw new Error('Vui lòng cung cấp email hoặc tên đăng nhập để tiếp tục.');
      }
      const response = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, email: identifier, name: nameInput })
      });

      if (!response.ok) {
        throw new Error('Đăng nhập nhanh thất bại');
      }

      const data = await response.json();
      if (data.success && data.user) {
        const sessionToken = data.token;
        const fbUser = data.firebaseUser;

        const syntheticUser: any = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          emailVerified: true,
          getIdToken: async () => sessionToken
        };

        setUser(syntheticUser);
        setToken(sessionToken);

        const parsed = parseDbUser(data.user);
        setDbUser(parsed);

        // Store session for persistence across page refreshes
        try {
          localStorage.setItem('jpstudy_app_session_v1', JSON.stringify({
            token: sessionToken,
            firebaseUser: fbUser
          }));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        } catch (e) {
          console.warn('Could not save session to localStorage:', e);
        }

        setAuthStatus('AUTHENTICATED');
        setLastAuthError(null);
        checkAndApplyRedirect(parsed.role);
      }
    } catch (err: any) {
      console.error('Quick login error:', err);
      setAuthStatus('ERROR');
      setLastAuthError({
        code: 'quick-login-failed',
        message: err?.message || 'Không thể đăng nhập. Vui lòng thử lại.'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
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

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        setLastAuthError(null);
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
        // Check if there is an active local app session
        try {
          const rawSession = localStorage.getItem('jpstudy_app_session_v1');
          if (rawSession) {
            const { token: sessionToken, firebaseUser: fbUser } = JSON.parse(rawSession);
            if (sessionToken && fbUser) {
              const syntheticUser: any = {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                photoURL: fbUser.photoURL,
                emailVerified: true,
                getIdToken: async () => sessionToken
              };
              setUser(syntheticUser);
              setToken(sessionToken);
              setAuthStatus('AUTHENTICATED');
              setLoading(false);
              console.log('[AUTH] Authentication: COMPLETE (session restored)');
              return;
            }
          }
        } catch (sessionErr) {
          console.warn('[AUTH] Could not restore app session:', sessionErr);
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
      register,
      quickLogin,
      logout,
      syncProfile,
      updateDbProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
