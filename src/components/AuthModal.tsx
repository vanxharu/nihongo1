import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, X, Copy, Check, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import JpStudyLogo from './JpStudyLogo';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { SignupSteps } from './ui/AuthFx';
import { accountAvatar } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, login, loginWithGoogle, register, lastAuthError, clearAuthError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [gPhase, setGPhase] = useState<'idle' | 'busy' | 'ok'>('idle');
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ok'>('idle');
  const [showPw, setShowPw] = useState(false);
  const [caps, setCaps] = useState(false);
  const [shake, setShake] = useState(0);
  const [welcome, setWelcome] = useState(false);
  const [fromGoogle, setFromGoogle] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    if (lastAuthError) {
      setErrorCode(lastAuthError.code);
      if (lastAuthError.code === 'auth/unauthorized-domain') {
        setError(`Tên miền "${currentHostname}" chưa được cấp phép trong Firebase Authentication của dự án nihongo-fd01e.`);
      } else {
        setError(lastAuthError.message);
      }
    }
  }, [lastAuthError, currentHostname]);

  const dialogRef = useDialogFocus(isOpen, () => { clearAuthError(); onClose(); });
  if (!isOpen) return null;

  const handleCopyHostname = () => {
    if (navigator.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleClose = () => {
    clearAuthError();
    onClose();
  };

  const explain = (err: any) => {
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') return 'Sai thông tin đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại.';
    if (err.code === 'auth/user-not-found') return 'Tài khoản không tồn tại. Vui lòng kiểm tra lại tên đăng nhập hoặc email.';
    if (err.code === 'auth/email-already-in-use') return 'Email này đã được sử dụng bởi một tài khoản khác.';
    if (err.code === 'auth/invalid-email') return 'Địa chỉ email hoặc tên đăng nhập không hợp lệ.';
    return err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setErrorCode(''); clearAuthError();
    if (!identifier.trim() || !password) {
      setError('Vui lòng nhập tên đăng nhập hoặc email và mật khẩu.');
      return;
    }
    setPhase('loading');
    try {
      await login(identifier.trim(), password);
      setPhase('ok');
      setTimeout(() => { setWelcome(true); setTimeout(handleClose, 1200); }, 650);
    } catch (err: any) {
      console.error(err);
      setPhase('idle');
      setErrorCode(err.code || '');
      setError(explain(err));
      setFromGoogle(false);
      setShake(n => n + 1);
    }
  };

  const handleGoogle = async () => {
    if (gPhase !== 'idle') return;
    setGPhase('busy'); setError(''); setErrorCode(''); setFromGoogle(true);
    try {
      await loginWithGoogle();
      setGPhase('ok');
      setTimeout(() => { setWelcome(true); setTimeout(handleClose, 1200); }, 650);
    } catch (err: any) {
      setGPhase('idle');
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setErrorCode(err.code || '');
        setError(err.code === 'auth/popup-blocked' ? 'Trình duyệt chặn cửa sổ đăng nhập. Cho phép cửa sổ bật lên rồi thử lại.' : err.code === 'auth/operation-not-allowed' ? 'Đăng nhập Google chưa được bật trong Firebase của ứng dụng. Bạn vẫn có thể đăng nhập bằng email.' : err.code === 'auth/unauthorized-domain' ? 'Tên miền này chưa được cấp phép đăng nhập trong Firebase.' : 'Chưa đăng nhập được bằng Google. Hãy thử lại hoặc dùng email.');
      }
    }
  };

  const welcomeName = user?.displayName || identifier.split('@')[0] || 'bạn';

  const handleRegister = async (v: { username: string; displayName: string; email: string; password: string }) => {
    clearAuthError();
    try {
      await register(v.email, v.password, v.displayName || undefined, v.username || undefined);
      setTimeout(handleClose, 1400);
      return '';
    } catch (err: any) {
      console.error(err);
      return explain(err);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Đăng nhập"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-h-[94vh] overflow-y-auto"
        style={{ maxWidth: 400, borderRadius: 30 }}
      >
      <div key={shake} className={`u062${shake ? ' shake' : ''}${welcome ? ' is-in' : ''}`}>
        <div className="u062-pane u062-login">
        <button type="button" onClick={handleClose} aria-label="Đóng" className="u062-x"><X className="w-5 h-5" /></button>

        <div className="u062-head">
          <div className="flex justify-center"><JpStudyLogo size="lg" layout="vertical" dark={false} showSubtitle={false} /></div>
          <p>{isLogin ? 'Đăng nhập để đồng bộ tiến trình học trên mọi thiết bị.' : 'Tạo tài khoản để lưu từ vựng, ngữ pháp, chữ Hán và tiến độ học.'}</p>
        </div>

        <div className="u062-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={isLogin} onClick={() => { setIsLogin(true); setError(''); setErrorCode(''); }}>Đăng nhập</button>
          <button type="button" role="tab" aria-selected={!isLogin} onClick={() => { setIsLogin(false); setError(''); setErrorCode(''); }}>Đăng ký</button>
        </div>

        <button type="button" disabled={gPhase === 'busy'} onClick={handleGoogle} className={`u066-b${gPhase === 'busy' ? ' busy' : ''}${gPhase === 'ok' ? ' ok' : ''}`} aria-busy={gPhase === 'busy'}>
          <span className="u066-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853"/><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.6z" fill="#FBBC05"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z" fill="#EA4335"/></svg></span>
          <span className="u066-tx">{gPhase === 'ok' ? 'Đã kết nối Google' : 'Tiếp tục với Google'}</span>
          <span className="u066-st" aria-hidden="true"><i></i><svg viewBox="0 0 22 22"><path d="M5 11.5l4 4L17 7"/></svg></span>
        </button>
        <div className="u066-or">hoặc dùng email</div>

        {/* Specialized Help Card for Unauthorized Domain */}
        {errorCode === 'auth/unauthorized-domain' ? (
          <div className="mb-4 bg-amber-50/90 border border-amber-300 rounded-2xl p-4 text-left shadow-sm">
            <div className="flex items-start gap-2.5 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Cần thêm tên miền vào Firebase</h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Firebase dự án <strong className="font-mono">nihongo-fd01e</strong> chưa cấp phép tên miền hiện tại:
                </p>
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-2.5 my-2.5 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-slate-800 break-all select-all">{currentHostname}</span>
              <button
                type="button"
                onClick={handleCopyHostname}
                className="shrink-0 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedDomain ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDomain ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>

            <div className="text-[11px] text-amber-900 space-y-1 mb-3 bg-amber-100/60 p-2.5 rounded-xl">
              <p className="font-bold">Cách thêm tên miền trong 30 giây:</p>
              <p>1. Vào <strong>Firebase Console</strong> dự án <strong className="font-mono">nihongo-fd01e</strong></p>
              <p>2. Chọn <strong>Authentication</strong> → tab <strong>Settings</strong> → mục <strong>Authorized domains</strong></p>
              <p>3. Bấm <strong>Add domain</strong>, dán tên miền trên và bấm <strong>Add</strong>.</p>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <a
                href="https://console.firebase.google.com/project/nihongo-fd01e/authentication/settings"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Mở Firebase Settings</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {isInIframe && (
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Mở tab mới
                </button>
              )}
            </div>
          </div>
        ) : error && fromGoogle ? (
          /* Lỗi đăng nhập Google */
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="text-left">
              <span className="text-xs font-medium text-rose-700 block">{error}</span>
              {errorCode && <span className="text-[10px] font-mono text-rose-500 mt-1 block">Mã lỗi: {errorCode}</span>}
            </div>
          </div>
        ) : null}

        {/* Input Form */}
        {!isLogin ? (
          <SignupSteps onSubmit={handleRegister} />
        ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="u062-f">
            <label htmlFor="auth-identifier">Tên đăng nhập hoặc Email</label>
            <div className="u062-box">
              <input type="text" id="auth-identifier" placeholder="username hoặc email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required />
            </div>
          </div>
          <div className={`u062-f${error && !fromGoogle ? ' bad' : ''}`}>
            <label htmlFor="auth-password">Mật khẩu</label>
            <span className={`u062-caps${caps ? ' on' : ''}`} aria-live="polite">Caps Lock đang bật</span>
            <div className="u062-box">
              <input id="auth-password" type={showPw ? 'text' : 'password'} placeholder="Nhập mật khẩu" value={password} autoComplete="current-password" required minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock') ?? false)}
                aria-invalid={error && !fromGoogle ? true : undefined} aria-describedby="auth-pw-err" />
              <button className="u062-eye" type="button" aria-pressed={showPw} aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPw(v => !v)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><g className="u062-lid"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></g><path className="u062-slash" d="M4 4l16 16" /></svg>
              </button>
            </div>
            <div className="u062-err"><span id="auth-pw-err" role="alert">{fromGoogle ? '' : error}</span></div>
          </div>
          <button className={`u062-go${phase === 'loading' ? ' busy' : ''}${phase === 'ok' ? ' ok' : ''}`} type="submit" disabled={phase !== 'idle'} aria-label={phase === 'loading' ? 'Đang kiểm tra' : phase === 'ok' ? 'Đã đăng nhập' : undefined}>
            <span>Đăng nhập</span><i aria-hidden="true"></i>
            <svg viewBox="0 0 26 26" aria-hidden="true"><path d="M6 13.5l4.5 4.5L20 8.5" /></svg>
          </button>
        </form>
        )}
        </div>

        <div className="u062-hi" aria-hidden={!welcome}>
          <span className="u062-av" aria-hidden="true">{accountAvatar('', user) ? <img src={accountAvatar('', user)} alt="" referrerPolicy="no-referrer" /> : welcomeName.charAt(0).toUpperCase()}</span>
          <h3>Chào mừng, {welcomeName}</h3>
          <p>Đang đưa bạn vào ứng dụng…</p>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
