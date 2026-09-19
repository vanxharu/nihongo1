import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Sparkles, X, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, loginWithGoogle, googleAuthMessage } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      setLoading(false);
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('Mật khẩu phải dài ít nhất 6 ký tự.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, displayName || undefined);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      let vietnameseMsg = 'Đã xảy ra lỗi. Vui lòng thử lại.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        vietnameseMsg = 'Sai thông tin đăng nhập. Vui lòng kiểm tra lại.';
      } else if (err.code === 'auth/user-not-found') {
        vietnameseMsg = 'Tài khoản không tồn tại.';
      } else if (err.code === 'auth/email-already-in-use') {
        vietnameseMsg = 'Email này đã được sử dụng bởi một tài khoản khác.';
      } else if (err.code === 'auth/invalid-email') {
        vietnameseMsg = 'Địa chỉ email không hợp lệ.';
      } else if (err.message) {
        vietnameseMsg = err.message;
      }
      setError(vietnameseMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Bạn đã đóng cửa sổ đăng nhập.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Tên miền này chưa được cấp phép trong Firebase Authentication Authorized Domains.');
      } else if (err?.code === 'auth/account-exists-with-different-credential') {
        setError('Email này đã liên kết với phương thức đăng nhập khác. Vui lòng đăng nhập bằng Email & Mật khẩu.');
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi khi đăng nhập bằng Google. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Top Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-500 via-purple-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Sparkles className="w-6 h-6 fill-slate-100" />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-950">
            {isLogin ? 'Chào mừng quay trở lại!' : 'Bắt đầu học ngay!'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin 
              ? 'Đăng nhập để đồng bộ tiến trình học, bài đã thuộc & vị trí đang học trên tất cả thiết bị.' 
              : 'Đăng ký tài khoản để lưu từ vựng, ngữ pháp, Hán tự & tự động quay lại đúng chỗ khi học máy khác.'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-50 p-1.5 rounded-xl mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
              isLogin ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
              !isLogin ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Đăng ký
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <span className="text-xs font-medium text-rose-700">{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên hiển thị</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: Neko-chan"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-100 rounded-xl text-sm focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50/50/50"
                />
                <UserPlus className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Địa chỉ Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-100 rounded-xl text-sm focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50/50/50"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-100 rounded-xl text-sm focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50/50/50"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-600 hover:bg-slate-500 active:bg-slate-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-slate-600/10 cursor-pointer"
          >
            {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-50" />
          </div>
          <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">Hoặc tiếp tục với</span>
        </div>

        {/* Google OAuth Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || !!googleAuthMessage}
          className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-75 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-slate-700 shadow-xs"
        >
          {googleAuthMessage ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
              <span>{googleAuthMessage}</span>
            </>
          ) : (
            <>
              <Chrome className="w-4 h-4 text-slate-700" />
              <span>Đăng nhập với Google</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
