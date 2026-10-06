import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './lib/authFetch';
import App from './App';
import './index.css';
import './brandTheme.css';
import './brandUtilities.css';
import './responsive.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { getDefaultReminderSettings, syncRemindersWithServiceWorker } from './utils/notifications';
import { BRAND_NAME } from './constants/brand';
import { AppErrorBoundary } from './utils/lazyWithRetry';

function StartupReady() {
  useEffect(() => { (window as any).nihongoAppStarted?.(); }, []);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary fallbackTitle="Trang học chưa tải được">
    <BrowserRouter>
      <ThemeProvider><AuthProvider>
        <App />
        <StartupReady />
      </AuthProvider></ThemeProvider>
    </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
);

// Register Service Worker for PWA / Background Notifications / Offline Support in production
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // Unregister any active Service Worker in dev mode to avoid stale module caching
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log(`${BRAND_NAME} ServiceWorker registered successfully:`, reg.scope);
          // Sync current reminder settings on startup
          const settings = getDefaultReminderSettings();
          syncRemindersWithServiceWorker(settings).catch(() => {});
        })
        .catch((err) => {
          console.warn(`${BRAND_NAME} ServiceWorker registration failed:`, err);
        });
    });
  }
}
