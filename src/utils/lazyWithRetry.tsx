import React, { lazy } from 'react';

/**
 * Robust lazy loading with automatic retry for dynamic imports.
 * Handles network hiccups, dev server restarts, and stale deployment chunks.
 */
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
       lastError.message.includes('dynamically imported module'));
    
    if (isChunkError && typeof window !== 'undefined') {
      const now = Date.now();
      const lastReload = parseInt(sessionStorage.getItem('last_chunk_reload_ts') || '0', 10);
      if (now - lastReload > 12000) {
        sessionStorage.setItem('last_chunk_reload_ts', now.toString());
        window.location.reload();
      }
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
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
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
