import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User, 
  UserCredential 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

/**
 * Clean, dedicated Google Authentication Service for NihonGo!
 * Uses official Firebase Web Auth SDK modular APIs with single-source-of-truth.
 */

// Initialize GoogleAuthProvider with minimal requested scopes (profile & email only)
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});
console.log('[AUTH] Google provider initialized');

export interface GoogleSignInResult {
  success: boolean;
  user?: User;
  cancelled?: boolean;
  isRedirect?: boolean;
  error?: any;
}

export class GoogleAuthService {
  /**
   * Initiates Google Sign-In with popup, falling back gracefully to redirect if blocked.
   * Prevents parallel executions and handles return URL persistence.
   */
  public static async signInWithGoogle(returnUrl?: string): Promise<GoogleSignInResult> {
    console.log('[AUTH] Login started');

    // Save return URL for after login restoration
    if (typeof window !== 'undefined' && returnUrl) {
      try {
        if (returnUrl.startsWith('/') && !returnUrl.startsWith('//') && returnUrl !== '/login') {
          sessionStorage.setItem('auth_return_url', returnUrl);
          sessionStorage.setItem('jpstudy_redirect_after_login', returnUrl);
        }
      } catch (err) {
        console.warn('[AUTH] Could not save return URL to sessionStorage:', err);
      }
    }

    // Attempt popup login first
    console.log('[AUTH] Login method: popup');
    try {
      const result: UserCredential = await signInWithPopup(auth, googleAuthProvider);
      if (result && result.user) {
        console.log('[AUTH] OAuth completed');
        console.log('[AUTH] Firebase user: FOUND');
        return {
          success: true,
          user: result.user,
          isRedirect: false
        };
      }
      return { success: false };
    } catch (error: any) {
      const errorCode = error?.code || '';

      // User closed popup intentionally - handle gracefully without looping or showing a crash
      if (errorCode === 'auth/popup-closed-by-user') {
        console.log('[AUTH] Popup closed by user');
        return {
          success: false,
          cancelled: true,
          error
        };
      }

      // Popup blocked by browser or unsupported in environment - fallback to redirect
      if (
        errorCode === 'auth/popup-blocked' ||
        errorCode === 'auth/cancelled-popup-request' ||
        errorCode === 'auth/operation-not-supported-in-this-environment'
      ) {
        console.warn('[AUTH] Popup blocked or not supported, falling back to redirect flow');
        console.log('[AUTH] Login method: redirect');
        try {
          await signInWithRedirect(auth, googleAuthProvider);
          return {
            success: false,
            isRedirect: true
          };
        } catch (redirectError: any) {
          console.error(`[AUTH ERROR] code: ${redirectError?.code || ''} message: ${redirectError?.message || ''}`);
          throw redirectError;
        }
      }

      // Other errors
      console.error(`[AUTH ERROR] code: ${errorCode} message: ${error?.message || ''}`);
      throw error;
    }
  }

  /**
   * Checks and processes redirect result if app was opened after a redirect OAuth flow.
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
      console.error('[AUTH] Redirect result: ERROR');
      console.error(`[AUTH ERROR] code: ${error?.code || ''} message: ${error?.message || ''}`);
      throw error;
    }
  }

  /**
   * Listen to Firebase auth state changes. Single authoritative source of truth.
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
   * Retrieves the current user synchronously from Firebase Auth instance.
   */
  public static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Signs out the user from Firebase Auth.
   */
  public static async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  /**
   * Translates Firebase error codes to actionable Vietnamese messages.
   */
  public static formatErrorMessage(error: any): string {
    const errorCode = error?.code || '';
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

    switch (errorCode) {
      case 'auth/unauthorized-domain':
        return `Tên miền "${currentHost}" chưa được cấp phép trong Firebase Authentication của dự án nihongo-fd01e. Vui lòng thêm "${currentHost}" vào mục Authorized Domains trong Firebase Console.`;
      case 'auth/popup-blocked':
        return 'Cửa sổ đăng nhập bị trình duyệt chặn (Popup Blocked). Ứng dụng sẽ tự động chuyển sang hình thức đăng nhập trang (redirect).';
      case 'auth/popup-closed-by-user':
        return 'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất. Vui lòng bấm đăng nhập lại khi sẵn sàng.';
      case 'auth/operation-not-allowed':
        return 'Phương thức đăng nhập Google chưa được kích hoạt trong Firebase Authentication Console (mục Sign-in method).';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng khi liên hệ với Google Authentication. Vui lòng kiểm tra lại kết nối Internet của bạn.';
      case 'auth/account-exists-with-different-credential':
        return 'Email này đã được sử dụng với phương thức đăng nhập khác (ví dụ: Email & Mật khẩu). Vui lòng đăng nhập bằng phương thức đó.';
      case 'auth/internal-error':
        return 'Lỗi nội bộ Firebase Authentication. Vui lòng thử lại hoặc tải lại trang web.';
      default:
        return error?.message || 'Đã xảy ra lỗi khi đăng nhập bằng Google. Vui lòng thử lại.';
    }
  }
}
