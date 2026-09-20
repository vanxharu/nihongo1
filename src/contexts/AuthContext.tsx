import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onIdTokenChanged, 
  User,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, googleAuthProvider, browserPopupRedirectResolver } from '../lib/firebase';
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
  googleAuthMessage: string | null;
  lastAuthError: AuthErrorInfo | null;
  clearAuthError: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, displayName?: string) => Promise<void>;
  loginWithGoogle: (returnUrl?: string) => Promise<void>;
  quickLogin: (email?: string, name?: string) => Promise<void>;
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
  const [googleAuthMessage, setGoogleAuthMessage] = useState<string | null>(null);
  const [lastAuthError, setLastAuthError] = useState<AuthErrorInfo | null>(null);
  const redirectHandledRef = useRef<boolean>(false);

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

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setAuthStatus('AUTHENTICATING');
    clearAuthError();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
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

  const register = async (email: string, pass: string, displayName?: string) => {
    setLoading(true);
    setAuthStatus('AUTHENTICATING');
    clearAuthError();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && userCredential.user) {
        await firebaseUpdateProfile(userCredential.user, {
          displayName: displayName
        });
      }
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
        code: err?.code || 'auth/register-failed',
        message: err?.message || 'Đăng ký không thành công.'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (returnUrl?: string) => {
    const platform = getAuthPlatform();
    console.log('[AUTH] Login started');
    console.log(`[AUTH] Platform: ${platform}`);
    setAuthStatus('AUTHENTICATING');
    setGoogleAuthMessage('Đang kết nối với Google...');
    setLoading(true);

    // Save current path to restore after redirect if popup is blocked
    try {
      const currentFullPath = location.pathname + location.search + location.hash;
      const targetUrl = returnUrl || currentFullPath;
      if (targetUrl && !targetUrl.startsWith('/login') && targetUrl !== '/') {
        sessionStorage.setItem('auth_return_url', targetUrl);
        sessionStorage.setItem('jpstudy_redirect_after_login', targetUrl);
      }
    } catch (e) {
      console.warn('[AUTH] Could not save auth_return_url to sessionStorage:', e);
    }

    console.log('[AUTH] Method: popup');

    try {
      // Standard popup call without custom resolver to prevent transient activation loss
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result && result.user) {
        console.log('[AUTH] Firebase currentUser: FOUND');
        console.log('[AUTH] Profile loading');
        setUser(result.user);
        setLastAuthError(null);

        // Immediately update dbUser with basic info so UI updates instantly
        const initialProfile: UserProfile = {
          name: result.user.displayName || (result.user.email ? result.user.email.split('@')[0] : 'Học viên JLPT'),
          avatar: result.user.photoURL || '🦊',
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

        setDbUser((prev) => {
          if (prev && prev.name && prev.name !== 'Học viên JLPT') {
            return { ...prev, avatar: result.user.photoURL || prev.avatar };
          }
          return initialProfile;
        });

        // Sync with backend if available
        try {
          const idToken = await result.user.getIdToken();
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
              setDbUser(parsed);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
              checkAndApplyRedirect(parsed.role);
            }
          }
        } catch (syncErr) {
          console.warn('[AUTH] Immediate database sync notice:', syncErr);
        }

        // Restore return URL
        try {
          const savedUrl = sessionStorage.getItem('auth_return_url') || sessionStorage.getItem('jpstudy_redirect_after_login');
          if (savedUrl) {
            sessionStorage.removeItem('auth_return_url');
            sessionStorage.removeItem('jpstudy_redirect_after_login');
            const currentFullPath = location.pathname + location.search + location.hash;
            if (savedUrl.startsWith('/') && !savedUrl.startsWith('//') && savedUrl !== currentFullPath) {
              navigate(savedUrl, { replace: true });
            }
          }
        } catch (e) {
          // ignore
        }

        console.log('[AUTH] Authentication complete');
        setAuthStatus('AUTHENTICATED');
        setGoogleAuthMessage(null);
        return;
      }
    } catch (error: any) {
      const errorCode = error?.code || '';

      // Case 1: User deliberately closed the popup window - DO NOT redirect loop!
      if (errorCode === 'auth/popup-closed-by-user') {
        console.log('[AUTH] Popup closed by user');
        setAuthStatus('UNAUTHENTICATED');
        setGoogleAuthMessage(null);
        setLoading(false);
        setLastAuthError({
          code: 'auth/popup-closed-by-user',
          message: 'Bạn đã đóng cửa sổ đăng nhập Google. Vui lòng bấm đăng nhập lại khi sẵn sàng.'
        });
        const closedErr = new Error('Bạn đã đóng cửa sổ đăng nhập.');
        (closedErr as any).code = 'auth/popup-closed-by-user';
        return;
      }

      // Case 2: Popup blocked by browser policy, or unsupported in environment -> fallback to redirect
      if (
        errorCode === 'auth/popup-blocked' ||
        errorCode === 'auth/cancelled-popup-request' ||
        errorCode === 'auth/operation-not-supported-in-this-environment'
      ) {
        console.warn('[AUTH] Popup blocked, falling back to redirect flow');
        console.log('[AUTH] Method: redirect');
        setGoogleAuthMessage('Đang chuyển sang đăng nhập Google (redirect)...');
        await signInWithRedirect(auth, googleAuthProvider);
        return;
      }

      // Case 3: Other errors
      console.error(`[AUTH] Error: code=${errorCode} message=${error?.message || ''}`);
      setAuthStatus('AUTH_ERROR');
      setGoogleAuthMessage(null);
      setLoading(false);

      let userFriendlyMessage = error?.message || 'Đăng nhập bằng Google không thành công.';
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      if (errorCode === 'auth/unauthorized-domain') {
        userFriendlyMessage = `Tên miền "${currentHost}" chưa được cấp phép trong Firebase Authentication của dự án nihongo-fd01e.`;
      } else if (errorCode === 'auth/operation-not-allowed') {
        userFriendlyMessage = 'Phương thức đăng nhập Google chưa được kích hoạt trong Firebase Authentication Console.';
      } else if (errorCode === 'auth/network-request-failed') {
        userFriendlyMessage = 'Lỗi kết nối mạng khi liên hệ với Google Authentication. Vui lòng kiểm tra Internet.';
      } else if (errorCode === 'auth/internal-error') {
        userFriendlyMessage = 'Lỗi nội bộ Firebase Authentication. Vui lòng tải lại trang và thử lại.';
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
        userFriendlyMessage = 'Email này đã liên kết với phương thức đăng nhập khác. Vui lòng đăng nhập bằng Email & Mật khẩu.';
      }

      setLastAuthError({
        code: errorCode,
        message: userFriendlyMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (emailInput?: string, nameInput?: string) => {
    setLoading(true);
    setAuthStatus('AUTHENTICATING');
    clearAuthError();
    try {
      const email = (emailInput || '').toLowerCase().trim();
      if (!email) {
        throw new Error('Vui lòng cung cấp địa chỉ email để đăng nhập.');
      }
      const response = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: nameInput })
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
      setGoogleAuthMessage(null);
      setLastAuthError(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('jpstudy_app_session_v1');
    } finally {
      setLoading(false);
    }
  };

  // Integrated Auth Lifecycle
  useEffect(() => {
    let isMounted = true;
    let unsubscribeAuth: (() => void) | null = null;

    const initAuth = async () => {
      const platform = getAuthPlatform();
      console.log(`[AUTH] Platform: ${platform}`);
      console.log('[AUTH] Processing redirect result');

      let redirectUser: User | null = null;

      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('[AUTH] Redirect returned');
          console.log('[AUTH] Redirect result: FOUND');
          console.log('[AUTH] Firebase currentUser: FOUND');
          console.log('[AUTH] Profile loading');
          redirectUser = result.user;
          setUser(result.user);
          setLastAuthError(null);

          const initialProfile: UserProfile = {
            name: result.user.displayName || (result.user.email ? result.user.email.split('@')[0] : 'Học viên JLPT'),
            avatar: result.user.photoURL || '🦊',
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

          setDbUser((prev) => {
            if (prev && prev.name && prev.name !== 'Học viên JLPT') {
              return { ...prev, avatar: result.user.photoURL || prev.avatar };
            }
            return initialProfile;
          });

          try {
            const idToken = await result.user.getIdToken();
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
                setDbUser(parsed);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
                checkAndApplyRedirect(parsed.role);
              }
            }
          } catch (syncErr) {
            console.warn('[AUTH] Immediate database sync notice after redirect:', syncErr);
          }

          console.log('[AUTH] Authentication complete');
          setAuthStatus('AUTHENTICATED');
          setGoogleAuthMessage(null);
          setLoading(false);

          // Restore saved return URL if available
          try {
            const savedUrl = sessionStorage.getItem('auth_return_url') || sessionStorage.getItem('jpstudy_redirect_after_login');
            if (savedUrl) {
              sessionStorage.removeItem('auth_return_url');
              sessionStorage.removeItem('jpstudy_redirect_after_login');
              const currentFullPath = location.pathname + location.search + location.hash;
              if (savedUrl.startsWith('/') && !savedUrl.startsWith('//') && savedUrl !== currentFullPath) {
                console.log(`[AUTH] Restoring return URL: ${savedUrl}`);
                navigate(savedUrl, { replace: true });
              }
            }
          } catch (storageErr) {
            console.warn('[AUTH] Could not restore return URL from sessionStorage:', storageErr);
          }
        } else {
          console.log('[AUTH] Redirect result: NULL');
        }
      } catch (error: any) {
        const errorCode = error?.code || '';
        console.error('[AUTH] Redirect result: ERROR');
        console.error(`[AUTH] Error: code=${errorCode} message=${error?.message || ''}`);

        let userFriendlyMessage = error?.message || 'Đăng nhập bằng Google không thành công.';
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
        if (errorCode === 'auth/unauthorized-domain') {
          userFriendlyMessage = `Tên miền "${currentHost}" chưa được cấp phép trong Firebase Authentication của dự án nihongo-fd01e.`;
        } else if (errorCode === 'auth/operation-not-allowed') {
          userFriendlyMessage = 'Phương thức đăng nhập Google chưa được kích hoạt trong Firebase Authentication Console.';
        } else if (errorCode === 'auth/network-request-failed') {
          userFriendlyMessage = 'Lỗi kết nối mạng khi liên hệ với Google Authentication. Vui lòng kiểm tra Internet.';
        } else if (errorCode === 'auth/internal-error') {
          userFriendlyMessage = 'Lỗi nội bộ Firebase Authentication. Vui lòng tải lại trang và thử lại.';
        }

        if (errorCode) {
          setLastAuthError({
            code: errorCode,
            message: userFriendlyMessage
          });
        }
      }

      // Wait for Firebase authStateReady to guarantee IndexedDB persistence is loaded
      try {
        if (typeof (auth as any).authStateReady === 'function') {
          await (auth as any).authStateReady();
        }
      } catch (e) {
        // ignore
      }

      // Set up onIdTokenChanged as the single source of truth
      unsubscribeAuth = onIdTokenChanged(auth, async (currentUser) => {
        if (!isMounted) return;

        const effectiveUser = currentUser || redirectUser;
        if (effectiveUser) {
          console.log('[AUTH] onAuthStateChanged: FOUND');
          console.log('[AUTH] Firebase currentUser: FOUND');
          console.log('[AUTH] Profile loading');
          setUser(effectiveUser);

          // Hydrate from local storage or create default profile immediately
          setDbUser((prev) => {
            if (prev) return prev;
            try {
              const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
              if (saved) {
                const parsed = JSON.parse(saved);
                return {
                  ...parsed,
                  role: 'user'
                };
              }
            } catch (e) {
              // ignore
            }
            return {
              name: effectiveUser.displayName || (effectiveUser.email ? effectiveUser.email.split('@')[0] : 'Học viên JLPT'),
              avatar: effectiveUser.photoURL || '🦊',
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
          });

          try {
            const idToken = await effectiveUser.getIdToken();
            setToken(idToken);
            // Sync with backend to fetch profile
            const response = await fetch('/api/user/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              }
            });

            if (response.ok) {
              const contentType = response.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const data = await response.json();
                if (data.success && data.user) {
                  const parsed = parseDbUser(data.user);
                  setDbUser(parsed);
                  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
                  checkAndApplyRedirect(parsed.role);
                }
              }
            }
          } catch (error) {
            console.warn('[AUTH] Could not sync profile with server on auth change (using cached local profile):', error);
          }

          console.log('[AUTH] Authentication complete');
          setAuthStatus('AUTHENTICATED');
          setLoading(false);
        } else {
          console.log('[AUTH] onAuthStateChanged: NULL');
          console.log('[AUTH] Firebase currentUser: NULL');

          // Firebase has no currentUser. Check if there is an active local app session
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
                console.log('[AUTH] Authentication restored from session token');
                console.log('[AUTH] Authentication complete');
                setAuthStatus('AUTHENTICATED');
                setLoading(false);

                // Background sync
                fetch('/api/user/sync', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                  }
                }).then(async res => {
                  const ct = res.headers.get('content-type') || '';
                  if (res.ok && ct.includes('application/json')) {
                    return res.json();
                  }
                  return null;
                }).then(data => {
                  if (data && data.success && data.user) {
                    const parsed = parseDbUser(data.user);
                    setDbUser(parsed);
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
                    checkAndApplyRedirect(parsed.role);
                  }
                }).catch(() => {});
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
    };

    initAuth();

    return () => {
      isMounted = false;
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
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
      googleAuthMessage,
      lastAuthError,
      clearAuthError,
      login,
      register,
      loginWithGoogle,
      quickLogin,
      logout,
      syncProfile,
      updateDbProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
