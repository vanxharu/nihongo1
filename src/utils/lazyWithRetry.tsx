import React, { lazy } from 'react';

/**
 * Robust lazy loading with automatic retry for dynamic imports.
 * Handles network hiccups, dev server restarts, and stale deployment chunks.
 */
// Sau mỗi lần deploy, tab đang mở vẫn trỏ tới các file JS cũ (đã bị xoá) → lỗi tải module.
// Phát hiện bản mới bằng cách so file index trong HTML hiện tại với file trang đang chạy.
async function newBuildAvailable(): Promise<boolean> {
  try {
    const current = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/index-"]')?.getAttribute('src');
    if (!current) return false;
    const html = await (await fetch('/', { cache: 'no-store' })).text();
    return !html.includes(current);
  } catch { return false; }
}
const RELOAD_KEY = 'chunk-reload-at';
function reloadOnceForNewBuild(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 30000) return false; // vừa tải lại mà vẫn lỗi: không lặp vô hạn
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch { /* storage bị chặn: vẫn tải lại một lần */ }
  window.location.reload();
  return true;
}

export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 4,
  interval = 800
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: any = null;
    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error;
        // Lỗi do bản deploy mới (không phải mạng chập chờn): tải lại trang ngay, khỏi chờ thử lại ~5 giây.
        // Chỉ xảy ra lúc chuyển sang mục mới, nên không làm mất bài đang làm.
        if (i === 0 && await newBuildAvailable() && reloadOnceForNewBuild()) return new Promise<never>(() => {});
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, interval * (i + 1)));
        }
      }
    }

    // Check if it is a dynamic import or chunk loading failure
    const isChunkError = 
      lastError instanceof Error && 
      (lastError.message.includes('Failed to fetch dynamically imported module') ||
       lastError.message.includes('Loading chunk') ||
       lastError.message.includes('dynamically imported module') ||
       lastError.message.includes('Importing a module script failed') ||
       lastError.message.includes('error loading dynamically imported module'));
    
    // A stale chunk or a temporary network failure must not force a full-page
    // refresh: the user may be halfway through an exercise or an exam.
    // Let AppErrorBoundary show a manual retry button instead.
    if (isChunkError) {
      console.warn('[NIHON] Dynamic module failed after retries; waiting for user action.', lastError);
    }

    throw lastError;
  });
}

export interface AppErrorBoundaryProps {
  children?: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

export interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public override state: AppErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    (window as any).nihongoAppStarted?.();
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
    if (typeof window !== 'undefined') {
      if ((window as any).nihongoRefreshPage) (window as any).nihongoRefreshPage();
      else window.location.reload();
    }
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mb-4 shadow-lg">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">
            {this.props.fallbackTitle || 'Không thể tải mô-đun bài học'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Đã có sự gián đoạn khi nạp tài nguyên dữ liệu đề thi / bài học. Bạn có thể bấm nút thử lại bên dưới để nạp lại ngay.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95"
          >
            🔄 Tải Lại Mô-đun
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
