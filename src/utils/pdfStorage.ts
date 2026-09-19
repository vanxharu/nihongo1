/**
 * Utility for persisting imported PDF exam files in browser storage (IndexedDB + localStorage fallback)
 */

export interface SavedPdfExam {
  id: string;
  title: string;
  fileName: string;
  importedAt: string;
  fileDataUrl: string; // Base64 PDF data
  sizeBytes: number;
  level?: string;
}

const STORAGE_KEY = 'jpstudy_saved_pdf_exams_v1';
const DB_NAME = 'JpStudyPdfStore';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_files';

// Helper to open IndexedDB
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an imported PDF exam into permanent browser storage
 */
export async function savePdfExamToLibrary(file: File, customTitle?: string, level: string = 'N2'): Promise<SavedPdfExam> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const record: SavedPdfExam = {
          id: `pdf_lib_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: customTitle || file.name.replace(/\.pdf$/i, ''),
          fileName: file.name,
          importedAt: new Date().toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          fileDataUrl: dataUrl,
          sizeBytes: file.size,
          level
        };

        // Try IndexedDB first
        try {
          const db = await openIndexedDB();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(record);
          tx.oncomplete = () => resolve(record);
          tx.onerror = () => throwFallback(record);
        } catch (dbErr) {
          throwFallback(record);
        }

        function throwFallback(rec: SavedPdfExam) {
          try {
            const existing = getSavedPdfExamsFromLocalStorage();
            const updated = [rec, ...existing.filter(item => item.id !== rec.id)].slice(0, 20); // Keep max 20
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            resolve(rec);
          } catch (e) {
            reject(new Error('Bộ nhớ trình duyệt đã đầy. Không thể lưu file PDF dung lượng lớn này.'));
          }
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc tệp PDF.'));
    reader.readAsDataURL(file);
  });
}

function getSavedPdfExamsFromLocalStorage(): SavedPdfExam[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get all saved PDF exams from library
 */
export async function getAllSavedPdfExams(): Promise<SavedPdfExam[]> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const idbResults: SavedPdfExam[] = req.result || [];
        const localResults = getSavedPdfExamsFromLocalStorage();
        // Merge & deduplicate
        const map = new Map<string, SavedPdfExam>();
        idbResults.forEach(item => map.set(item.id, item));
        localResults.forEach(item => map.set(item.id, item));
        resolve(Array.from(map.values()).sort((a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime()));
      };
      req.onerror = () => {
        resolve(getSavedPdfExamsFromLocalStorage());
      };
    });
  } catch {
    return getSavedPdfExamsFromLocalStorage();
  }
}

/**
 * Delete a saved PDF exam from library
 */
export async function deleteSavedPdfExam(id: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (e) {
    console.warn("IndexedDB delete error:", e);
  }

  try {
    const existing = getSavedPdfExamsFromLocalStorage();
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("LocalStorage delete error:", e);
  }
}
