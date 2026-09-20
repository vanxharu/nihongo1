import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children?: React.ReactNode;
  onRequireLogin?: () => void;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children, onRequireLogin }) => {
  const { user, dbUser, loading, authStatus } = useAuth();
  const location = useLocation();
  const hasTriggeredLogin = useRef(false);

  const isAuthPending = loading || authStatus === 'INITIALIZING' || authStatus === 'AUTHENTICATING';

  useEffect(() => {
    if (!isAuthPending && !user && !hasTriggeredLogin.current) {
      hasTriggeredLogin.current = true;
      try {
        const currentPath = location.pathname + location.search + location.hash;
        if (currentPath.startsWith('/') && !currentPath.startsWith('//')) {
          sessionStorage.setItem('jpstudy_redirect_after_login', currentPath);
          sessionStorage.setItem('auth_return_url', currentPath);
        }
      } catch (e) {
        // ignore storage errors
      }
      if (onRequireLogin) {
        onRequireLogin();
      }
    }
  }, [isAuthPending, user, location, onRequireLogin]);

  // 1. While auth state is initializing or checking: show graceful loading skeleton, NO REDIRECT
  if (isAuthPending) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-600 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Đang xác thực quyền truy cập
        </h3>
        <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">
          Hệ thống đang kiểm tra danh tính bảo mật và quyền quản trị viên...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated user: redirect to home (login modal will open if onRequireLogin was provided)
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // 3. Authenticated, but role is NOT admin: reject & redirect to home
  const isAdmin = dbUser && dbUser.role === 'admin';
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. Authorized admin user: render children
  return <>{children}</>;
};

export default AdminRoute;
