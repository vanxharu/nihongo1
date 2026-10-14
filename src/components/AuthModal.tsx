import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, X, Copy, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JpStudyLogo from './JpStudyLogo';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { PasswordField, SubmitButton, SignupSteps } from './ui/AuthFx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, loginWithGoogle, register, lastAuthError, clearAuthError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ok'>('idle');
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
      setTimeout(handleClose, 700);
    } catch (err: any) {
      console.error(err);
      setPhase('idle');
      setErrorCode(err.code || '');
      setError(explain(err));
    }
  };

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
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 relative overflow-y-auto"
      >
        {/* Top Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-500 via-purple-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <JpStudyLogo size="lg" layout="vertical" dark={false} showSubtitle={true} />
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isLogin 
              ? 'Đăng nhập để đồng bộ tiến trình học, bài đã thuộc & vị trí trên mọi thiết bị.' 
              : 'Tạo tài khoản để lưu từ vựng, ngữ pháp, chữ Hán và đồng bộ tiến độ học.'}
          </p>
        </div>

        <button type="button" disabled={loading} className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 font-bold text-slate-900 disabled:opacity-50" onClick={async () => {
          setLoading(true); setError(''); setErrorCode('');
          try { await loginWithGoogle(); handleClose(); }
          catch (err: any) {
            if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
              setErrorCode(err.code || '');
              setError(err.code === 'auth/popup-blocked' ? 'Trình duyệt chặn cửa sổ đăng nhập. Cho phép cửa sổ bật lên rồi thử lại.' : err.code === 'auth/operation-not-allowed' ? 'Đăng nhập Google chưa được bật trong Firebase của ứng dụng. Bạn vẫn có thể đăng nhập bằng email.' : err.code === 'auth/unauthorized-domain' ? 'Tên miền này chưa được cấp phép đăng nhập trong Firebase.' : 'Chưa đăng nhập được bằng Google. Hãy thử lại hoặc dùng email.');
            }
          } finally { setLoading(false); }
        }}><span aria-hidden="true" className="text-xl text-blue-600">G</span>{loading ? 'Đang đăng nhập…' : 'Tiếp tục với Google'}</button>
        {/* Tab Selection */}
        <div className="flex bg-slate-50 p-1.5 rounded-xl mb-4">
          <button
            onClick={() => { setIsLogin(true); setError(''); setErrorCode(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
              isLogin ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setErrorCode(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
              !isLogin ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Đăng ký
          </button>
        </div>

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
        ) : error ? (
          /* General Error Alert */
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
        <form onSubmit={handleSubmit} className={`space-y-4${error ? ' u062-shake' : ''}`} key={error}>
          <div>
            <label htmlFor="auth-identifier" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Tên đăng nhập hoặc Email
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập username hoặc email..."
                id="auth-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-100 rounded-xl text-sm focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50/50"
                required
                autoComplete="username"
              />
              {identifier.includes('@') ? (
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              ) : (
                <UserPlus className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              💡 Đăng nhập dễ dàng bằng Username (tên người dùng) hoặc Email.
            </span>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mật khẩu</label>
            <PasswordField id="auth-password" value={password} onChange={setPassword} autoComplete="current-password"
              leading={<Lock aria-hidden="true" />} />
          </div>

          <SubmitButton phase={phase} label="Đăng nhập" />
        </form>
        )}
      </motion.div>
    </div>
  );
}
