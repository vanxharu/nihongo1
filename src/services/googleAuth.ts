import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '../lib/firebase';

/**
 * Clean, dedicated Google Authentication Service for NihonGo!
 * Rebuilt from scratch using official Firebase Web Auth SDK modular APIs.
 */

// Initialize GoogleAuthProvider with minimal requested scopes (profile & email only)
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

console.log('[AUTH] Google provider initialized');

export interface GoogleSignInResult {
  success?: boolean;
  user?: User;
  cancelled?: boolean;
  isRedirect?: boolean;
  error?: any;
}

const RETURN_URL_KEY = 'nihongo_auth_return_url';

export class GoogleAuthService {
  /**
   * Initiates Google Sign-In with popup, falling back gracefully to redirect if blocked.
   */
  public static async signInWithGoogle(returnUrl?: string): Promise<GoogleSignInResult> {
    console.log('[AUTH] Login started');

    if (returnUrl && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(RETURN_URL_KEY, returnUrl);
      } catch (e) {
        // Storage might be restricted
      }
    }

    try {
      console.log('[AUTH] Login method: popup');
      const result: UserCredential = await signInWithPopup(auth, googleAuthProvider);
      console.log('[AUTH] OAuth completed');
      console.log('[AUTH] Firebase user: FOUND');
      return {
        success: true,
        user: result.user
      };
    } catch (error: any) {
      const code = error?.code || '';

      // User closed popup deliberately
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        console.log('[AUTH] User closed Google popup');
        return { cancelled: true };
      }

      // If popup is blocked by browser/extension, seamlessly fallback to official redirect
      if (code === 'auth/popup-blocked') {
        console.warn('[AUTH] Popup blocked by browser. Falling back to official redirect...');
        console.log('[AUTH] Login method: redirect');
        try {
          await signInWithRedirect(auth, googleAuthProvider);
          return { isRedirect: true };
        } catch (redirectErr) {
          console.error('[AUTH] Redirect fallback failed:', redirectErr);
          throw redirectErr;
        }
      }

      console.error('[AUTH] Google Sign-In failed with error:', code, error);
      throw error;
    }
  }

  /**
   * Checks for redirect result upon returning from Google OAuth redirect.
   */
  public static async checkRedirectResult(): Promise<User | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        console.log('[AUTH] Redirect result: FOUND');
        console.log('[AUTH] OAuth completed');
        console.log('[AUTH] Firebase user: FOUND');
        return result.user;
      }
      console.log('[AUTH] Redirect result: NULL');
      return null;
    } catch (error: any) {
      console.error('[AUTH] Redirect result: ERROR', error?.code, error);
      throw error;
    }
  }

  /**
   * Single source of truth listener for Firebase Auth state.
   */
  public static listenAuthState(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('[AUTH] Firebase user: FOUND');
      } else {
        console.log('[AUTH] Firebase user: NULL');
      }
      callback(user);
    });
  }

  /**
   * Returns current authenticated Firebase user.
   */
  public static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Sign out current user.
   */
  public static async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  /**
   * Gets stored return URL and clears it from storage.
   */
  public static consumeReturnUrl(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const url = sessionStorage.getItem(RETURN_URL_KEY);
      sessionStorage.removeItem(RETURN_URL_KEY);
      return url;
    } catch {
      return null;
    }
  }

  /**
   * Translates Firebase error codes to user-friendly Vietnamese messages.
   */
  public static formatErrorMessage(error: any): string {
    const code = error?.code || '';
    const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

    switch (code) {
      case 'auth/unauthorized-domain':
        return `Tên miền "${currentHostname}" chưa được thêm vào mục Authorized domains trong Firebase Authentication (Console > Authentication > Settings > Authorized domains). Vui lòng thêm tên miền này để đăng nhập Google hoạt động.`;
      case 'auth/popup-blocked':
        return 'Trình duyệt hoặc tiện ích mở rộng đã chặn cửa sổ Popup Google. Ứng dụng sẽ tự động chuyển sang trang đăng nhập.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất. Vui lòng bấm đăng nhập lại khi sẵn sàng.';
      case 'auth/operation-not-allowed':
        return 'Phương thức đăng nhập Google chưa được kích hoạt trong Firebase Authentication Console (mục Sign-in method).';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng khi liên hệ với Google Authentication. Vui lòng kiểm tra lại kết nối Internet của bạn.';
      case 'auth/account-exists-with-different-credential':
        return 'Địa chỉ email này đã được đăng ký bằng phương thức khác (Email/Mật khẩu). Vui lòng đăng nhập bằng Email và mật khẩu của bạn.';
      case 'auth/internal-error':
        return 'Lỗi nội bộ từ Firebase Authentication. Vui lòng thử lại hoặc tải lại trang.';
      default:
        return error?.message || 'Đã xảy ra lỗi khi đăng nhập bằng Google. Vui lòng thử lại.';
    }
  }
}
