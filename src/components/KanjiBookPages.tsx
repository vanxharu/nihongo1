import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { KANJI_MASTER_N4 } from '../data/kanjiMasterN4';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// File PDF chỉ nằm trong IndexedDB của trình duyệt này, không gửi đi đâu.
const DB = 'nihon-kanji-book', STORE = 'f', KEY = 'pdf', MAP = 'nihon:kanji:bookpages:v1';
const idb = (): Promise<IDBDatabase> => new Promise((res, rej) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const idbGet = async (): Promise<ArrayBuffer | undefined> => { const d = await idb(); return new Promise(res => { const q = d.transaction(STORE).objectStore(STORE).get(KEY); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); };
const idbSet = async (b: ArrayBuffer) => { const d = await idb(); return new Promise<void>((res, rej) => { const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(b, KEY); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }); };
// Mặc định chỉ gồm các bài đã xem trực tiếp trên bản scan; bài khác tự gán.
const DEFAULT_START: Record<string, number> = { '9-1': 137, '9-2': 143, '9-3': 149 };
const loadMap = (): Record<string, number> => { try { return { ...DEFAULT_START, ...JSON.parse(localStorage.getItem(MAP) || '{}') }; } catch { return { ...DEFAULT_START }; } };

export default function KanjiBookPages({ lessonId }: { lessonId: string }) {
  const [doc, setDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [err, setErr] = useState('');
  const [map, setMap] = useState(loadMap);
  const [page, setPage] = useState(1);
  const canvas = useRef<HTMLCanvasElement>(null);
  const open = async (buf: ArrayBuffer) => { try { setDoc(await pdfjsLib.getDocument({ data: buf.slice(0) }).promise); setErr(''); } catch { setErr('Không mở được file PDF này.'); } };
  useEffect(() => { idbGet().then(b => { if (b) open(b); }).catch(() => {}); }, []);
  const idx = KANJI_MASTER_N4.findIndex(l => l.id === lessonId);
  const start = map[lessonId];
  const next = KANJI_MASTER_N4.slice(idx + 1).map(l => map[l.id]).find(Boolean);
  useEffect(() => { if (start) setPage(start); }, [lessonId, start]);
  useEffect(() => {
    if (!doc) return; let dead = false;
    doc.getPage(Math.min(Math.max(page, 1), doc.numPages)).then(async p => {
      const vp = p.getViewport({ scale: 1.6 }); const c = canvas.current; if (!c || dead) return;
      c.width = vp.width; c.height = vp.height;
      await p.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise;
    }).catch(() => {});
    return () => { dead = true; };
  }, [doc, page]);
  const setStart = () => { const m = { ...map, [lessonId]: page }; setMap(m); try { localStorage.setItem(MAP, JSON.stringify(m)); } catch { /* ignore */ } };
  const lo = start || 1, hi = doc ? Math.min(doc.numPages, next ? next - 1 : doc.numPages) : 1;
  const btn = 'min-h-[44px] px-3 rounded-lg text-xs font-bold';
  const sty = { background: '#2b3353', color: '#f1f5f9' };

  return (
    <div className="rounded-[24px] p-4 space-y-3 shadow-xl" style={{ background: '#303b60', color: '#f1f5f9' }}>
      {!doc ? (
        <div className="space-y-2 text-sm">
          <p>Nạp file <b>Kanji Master N4.pdf</b> của bạn. File chỉ lưu trong trình duyệt này (IndexedDB), không tải lên server.</p>
          <input type="file" accept="application/pdf" aria-label="Chọn file PDF" className="block text-xs" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; const b = await f.arrayBuffer(); try { await idbSet(b); } catch { setErr('Không lưu được vào trình duyệt, lần sau phải nạp lại.'); } open(b); }} />
          {err && <p role="alert" style={{ color: '#fda4af' }}>{err}</p>}
        </div>
      ) : (<>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button className={btn} style={sty} disabled={page <= lo} onClick={() => setPage(p => p - 1)}>← Trước</button>
          <label className="flex items-center gap-1">Trang <input type="number" min={1} max={doc.numPages} value={page} onChange={e => setPage(Number(e.target.value) || 1)} className="w-16 min-h-[44px] rounded-lg px-2 text-center" style={{ background: '#151a2e', color: '#f1f5f9' }} /> / {doc.numPages}</label>
          <button className={btn} style={sty} disabled={page >= hi} onClick={() => setPage(p => p + 1)}>Sau →</button>
          <button className={btn} style={sty} onClick={setStart}>Gán trang này là đầu bài {lessonId}</button>
        </div>
        {!start && <p className="text-xs" style={{ color: '#fbbf24' }}>Chưa gán trang cho bài {lessonId}: lật tới trang tiêu đề bài rồi bấm "Gán".</p>}
        <canvas ref={canvas} className="w-full rounded-lg bg-white" aria-label={`Trang ${page} của sách`} />
      </>)}
    </div>
  );
}
