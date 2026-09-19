import { UserVideoProgress } from '../types';

/**
 * Key prefix for per-video local storage backup
 */
export const PER_VIDEO_STORAGE_PREFIX = 'jlpt_listening_progress_';

/**
 * Master local storage key for all video progress
 */
export const MASTER_STORAGE_KEY = 'jlpt_youtube_listening_progress';

/**
 * Key for pending offline sync items
 */
export const PENDING_SYNC_KEY = 'jlpt_listening_pending_sync';

/**
 * Safely parse epoch timestamp from UserVideoProgress
 */
export function getProgressTimestamp(progress?: Partial<UserVideoProgress> | null): number {
  if (!progress) return 0;
  if (typeof progress.updatedAt === 'number' && !isNaN(progress.updatedAt)) {
    return progress.updatedAt;
  }
  if (progress.lastWatchedAt) {
    const t = new Date(progress.lastWatchedAt).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

/**
 * Compare two progress objects and return the latest one based on timestamp
 */
export function resolveLatestProgress(
  a?: UserVideoProgress | null,
  b?: UserVideoProgress | null
): UserVideoProgress | null {
  if (!a && !b) return null;
  if (!a) return b || null;
  if (!b) return a || null;

  const timeA = getProgressTimestamp(a);
  const timeB = getProgressTimestamp(b);

  if (timeB > timeA) {
    return {
      ...b,
      bookmarked: b.bookmarked !== undefined ? b.bookmarked : a.bookmarked
    };
  }

  return {
    ...a,
    bookmarked: a.bookmarked !== undefined ? a.bookmarked : b.bookmarked
  };
}

/**
 * Check if the resume banner should be shown to the user
 * Requirement:
 * - currentTime >= 5 seconds
 * - currentTime / duration < 95%
 * - Not marked completed
 */
export function shouldShowResumeBanner(
  currentTime: number,
  duration: number,
  completed?: boolean
): boolean {
  if (completed) return false;
  if (currentTime < 5) return false;
  if (duration > 0 && (currentTime / duration) >= 0.95) return false;
  return true;
}

/**
 * Check if a progress represents completion (>= 95% or explicitly flagged)
 */
export function isProgressCompleted(
  currentTime: number,
  duration: number,
  completedFlag?: boolean
): boolean {
  if (completedFlag) return true;
  if (duration > 0 && (currentTime / duration) >= 0.95) return true;
  return false;
}

/**
 * Get individual video progress from localStorage
 */
export function getLocalVideoProgress(videoId: string): UserVideoProgress | null {
  if (!videoId || typeof window === 'undefined') return null;

  try {
    // 1. Check per-video individual key first
    const item = localStorage.getItem(`${PER_VIDEO_STORAGE_PREFIX}${videoId}`);
    let perVideoData: UserVideoProgress | null = null;
    if (item) {
      perVideoData = JSON.parse(item);
    }

    // 2. Check master progress map
    const masterStr = localStorage.getItem(MASTER_STORAGE_KEY);
    let masterData: UserVideoProgress | null = null;
    if (masterStr) {
      const masterMap = JSON.parse(masterStr);
      masterData = masterMap[videoId] || null;
    }

    // Return the latest between the two
    return resolveLatestProgress(perVideoData, masterData);
  } catch {
    return null;
  }
}

/**
 * Get all progress from master local storage
 */
export function getAllLocalProgress(): Record<string, UserVideoProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(MASTER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save progress strictly to local storage (both per-video key and master dictionary)
 */
export function saveToLocalStorage(progress: UserVideoProgress): void {
  if (!progress || !progress.videoId || typeof window === 'undefined') return;

  try {
    const now = Date.now();
    const cleanRecord: UserVideoProgress = {
      ...progress,
      updatedAt: progress.updatedAt || now,
      lastWatchedAt: progress.lastWatchedAt || new Date(now).toISOString()
    };

    // 1. Per-video key: jlpt_listening_progress_{videoId}
    localStorage.setItem(
      `${PER_VIDEO_STORAGE_PREFIX}${progress.videoId}`,
      JSON.stringify(cleanRecord)
    );

    // 2. Master dictionary: jlpt_youtube_listening_progress
    const currentMaster = getAllLocalProgress();
    currentMaster[progress.videoId] = cleanRecord;
    localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(currentMaster));
  } catch {
    // ignore storage quota errors safely
  }
}

/**
 * Enqueue video for offline sync
 */
export function enqueueOfflineSync(progress: UserVideoProgress): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    const list: UserVideoProgress[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(item => item.videoId === progress.videoId);
    if (idx >= 0) {
      list[idx] = progress;
    } else {
      list.push(progress);
    }
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * Send progress to server with fallback to keepalive/sendBeacon during unload
 */
export function syncProgressToServer(
  userId: string,
  progress: UserVideoProgress,
  options: { isUnloading?: boolean } = {}
): void {
  if (typeof window === 'undefined') return;

  const payload = {
    userId: userId || 'default_user',
    videoId: progress.videoId,
    currentTime: progress.currentTime,
    duration: progress.duration,
    completed: progress.completed,
    progressPercent: progress.progressPercent,
    bookmarked: progress.bookmarked,
    updatedAt: progress.updatedAt || Date.now(),
    lastWatchedAt: progress.lastWatchedAt || new Date().toISOString()
  };

  // If page is unloading/hidden, prefer navigator.sendBeacon or fetch with keepalive: true
  if (options.isUnloading) {
    const jsonString = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const success = navigator.sendBeacon('/api/listening/progress/beacon', blob);
        if (success) return;
      } catch {}
    }

    // Fallback to fetch with keepalive
    try {
      fetch('/api/listening/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonString,
        keepalive: true
      }).catch(() => {});
    } catch {}
    return;
  }

  // Standard non-blocking fetch
  if (!navigator.onLine) {
    enqueueOfflineSync(progress);
    return;
  }

  fetch('/api/listening/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .catch(() => {
      enqueueOfflineSync(progress);
    });
}

/**
 * Flush all offline pending sync records when network connectivity returns
 */
export function flushPendingSync(userId: string): void {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    if (!raw) return;
    const list: UserVideoProgress[] = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return;

    fetch('/api/listening/progress/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId || 'default_user',
        records: list
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          localStorage.removeItem(PENDING_SYNC_KEY);
        }
      })
      .catch(() => {});
  } catch {}
}
