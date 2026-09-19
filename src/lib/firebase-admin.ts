import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json' assert { type: "json" };

let authInstance: any = null;

try {
  if (!getApps().length) {
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
  authInstance = getAuth();
} catch (e: any) {
  console.warn('[Firebase Admin] Initialization deferred or fallback:', e?.message || e);
}

export const adminAuth = authInstance;
