import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './lib/authFetch';
import App from './App';
import './index.css';
import './brandTheme.css';
import './brandUtilities.css';
import './responsive.css';
import { AnimateUIProvider } from '@animate-ui/react/provider';
import { ReducedMotionConfig } from '@animate-ui/react/utils/motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { BRAND_NAME } from './constants/brand';
import { AppErrorBoundary } from './utils/lazyWithRetry';

import { installCustomLlmHeaders } from './utils/aiCustomKey';
import { LazyMotion } from 'motion/react';
const loadMotionFeatures = () => import('./motionFeatures').then(mod => mod.default);
installCustomLlmHeaders();

// PwaInstallPrompt is lazy-loaded; Chrome/Edge may fire beforeinstallprompt before its chunk arrives.
// Capture it here (same preventDefault the component does) so the component can pick it up on mount.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).__pwaInstallEvent = e;
  });
}

function StartupReady() {
  useEffect(() => { (window as any).nihongoAppStarted?.(); }, []);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary fallbackTitle="Trang học chưa tải được">
    <BrowserRouter>
      <ThemeProvider><AuthProvider>
        <AnimateUIProvider tempo={1}><ReducedMotionConfig><LazyMotion features={loadMotionFeatures}><App /></LazyMotion></ReducedMotionConfig></AnimateUIProvider>
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
          // Loaded on demand: notifications.ts pulls the Japanese dictionaries into the bundle.
          import('./utils/notifications')
            .then(({ getDefaultReminderSettings, syncRemindersWithServiceWorker }) => syncRemindersWithServiceWorker(getDefaultReminderSettings()))
            .catch(() => {});
        })
        .catch((err) => {
          console.warn(`${BRAND_NAME} ServiceWorker registration failed:`, err);
        });
    });
  }
}
