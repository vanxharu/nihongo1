import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onIdTokenChanged, 
  User,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  dbUser: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load initial user profile from localStorage:", e);
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to parse the DB user response safely
  const parseDbUser = (dbData: any): UserProfile => {
    const isOwner = (auth.currentUser && auth.currentUser.email && auth.currentUser.email.toLowerCase() === 'vanvan20001220@gmail.com') || false;
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
      role: (dbData.role === 'admin' || isOwner) ? 'admin' : (dbData.role || 'user')
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
          
          // Rich feature: If the user has high XP locally, but the brand new synced DB user has 0 or default low XP,
          // let's merge their local progress into the database!
          const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedLocal && parsed.xp === 0) {
            try {
              const localProfile = JSON.parse(savedLocal) as UserProfile;
              if (localProfile.xp > 0) {
                console.log("Merging local profile progress into new cloud database account...");
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
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, displayName?: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && userCredential.user) {
        await firebaseUpdateProfile(userCredential.user, {
          displayName: displayName
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setDbUser(null);
      setToken(null);
      // Clean up local cache if logging out, or keep it as guest profile?
      // Better to clear local storage so the next guest doesn't see old user's details,
      // but let's reset it to guest/default values.
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Hydrate from local storage or create default profile immediately
        setDbUser((prev) => {
          if (prev) return prev;
          try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) return JSON.parse(saved);
          } catch (e) {
            // ignore
          }
          const isOwner = (currentUser.email && currentUser.email.toLowerCase() === 'vanvan20001220@gmail.com') || false;
          return {
            name: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Học viên JLPT'),
            avatar: currentUser.photoURL || '🦊',
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
            role: isOwner ? 'admin' : 'user'
          };
        });

        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
          // Sync with back-end to fetch profile
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
              setDbUser(parsed);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
            }
          }
        } catch (error) {
          console.warn("Could not sync profile with server on auth change (using cached local profile):", error);
        }
      } else {
        setDbUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      dbUser,
      token,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      syncProfile,
      updateDbProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
