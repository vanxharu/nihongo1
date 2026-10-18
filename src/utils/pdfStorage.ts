import { auth } from '../lib/firebase';
import { uploadCloudPdf, cloudPdfMetadata, downloadCloudPdf, deleteCloudPdf } from './cloudPdf';
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
  ownerUid?: string;
  deleted?: boolean;
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
  const ownerUid = auth.currentUser?.uid;
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
          level, ownerUid
        };

        // Try IndexedDB first
        try {
          const db = await openIndexedDB();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(record);
          tx.oncomplete = () => {if(ownerUid)uploadCloudPdf(record).then(()=>resolve(record)).catch(reject);else resolve(record);};
          tx.onerror = () => throwFallback(record);
        } catch (dbErr) {
          throwFallback(record);
        }

        function throwFallback(rec: SavedPdfExam) {
          try {
            const existing = getSavedPdfExamsFromLocalStorage();
            const updated = [rec, ...existing.filter(item => item.id !== rec.id)].slice(0, 20); // Keep max 20
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            if(ownerUid)uploadCloudPdf(rec).then(()=>resolve(rec)).catch(reject);else resolve(rec);
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
async function localPdfExams(): Promise<SavedPdfExam[]> {
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

export async function getAllSavedPdfExams():Promise<SavedPdfExam[]>{
  const uid=auth.currentUser?.uid;const legacyOwner=localStorage.getItem('jpstudy_pdf_owner');
  const local=(await localPdfExams()).filter(record=>record.ownerUid?record.ownerUid===uid:!legacyOwner||legacyOwner===uid);
  if(auth.currentUser?.uid!==uid)return [];
  if(!uid)return local;
  if(!legacyOwner)localStorage.setItem('jpstudy_pdf_owner',uid);
  try{const remote=await cloudPdfMetadata(uid);const all=new Map(local.map(v=>[v.id,v]));for(const item of remote){if(item.deleted)all.delete(item.id);else if(!all.has(item.id))all.set(item.id,await downloadCloudPdf(item,uid));}
    const remoteIds=new Set(remote.map(v=>v.id));for(const item of local)if(!remoteIds.has(item.id))await uploadCloudPdf({...item,ownerUid:uid});
    return auth.currentUser?.uid===uid?[...all.values()]:[];
  }catch{return auth.currentUser?.uid===uid?local:[];}
}

/**
 * Delete a saved PDF exam from library
 */
export async function deleteSavedPdfExam(id: string): Promise<void> {
  const uid=auth.currentUser?.uid;
  if(uid)await deleteCloudPdf(id,uid);
  if(auth.currentUser?.uid!==uid)throw new Error('Tài khoản đã thay đổi. Hãy mở lại thư viện PDF.');
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
