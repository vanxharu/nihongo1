import React, { useEffect, useRef, useState } from 'react';
import { toast } from './ui/Toasts';

// Sách PDF cá nhân: lưu trong IndexedDB của trình duyệt, không upload lên server.
const DB = 'my-books', STORE = 'pdf';
const open = () => new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(STORE);
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const tx = async <T,>(mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>) => {
  const db = await open();
  return new Promise<T>((res, rej) => {
    const q = f(db.transaction(STORE, mode).objectStore(STORE));
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
};

export default function MyBooks() {
  const [names, setNames] = useState<string[]>([]);
  const [cur, setCur] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const refresh = () => tx<IDBValidKey[]>('readonly', s => s.getAllKeys()).then(k => setNames(k.map(String))).catch(() => setErr('Trình duyệt không cho lưu sách (chế độ riêng tư?).'));
  useEffect(() => { refresh(); }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const add = async (files: FileList | null) => {
    for (const f of Array.from(files || [])) {
      try { await tx('readwrite', s => s.put(f, f.name)); } catch { setErr('Không lưu được ' + f.name); }
    }
    refresh();
  };
  const show = async (n: string) => {
    const f = await tx<Blob>('readonly', s => s.get(n));
    if (f) { setCur(n); setUrl(URL.createObjectURL(f)); }
  };
  const del = async (n: string) => {
    const blob = await tx<Blob>('readonly', s => s.get(n));
    await tx('readwrite', s => s.delete(n));
    if (blob) toast('Đã xóa "' + n + '"', async () => { await tx('readwrite', s => s.put(blob, n)); refresh(); });
    if (cur === n) { setCur(null); setUrl(null); }
    refresh();
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Sách của tôi</h1>
      <p className="text-sm text-slate-500">
        Thêm file PDF sách luyện thi (Soumatome N4…). File chỉ lưu trong trình duyệt của bạn, không tải lên máy chủ; sách hiển thị nguyên bản thiết kế của nhà xuất bản.
      </p>
      <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white" onClick={() => input.current?.click()}>+ Thêm PDF</button>
      <input ref={input} type="file" accept="application/pdf" multiple hidden onChange={e => { add(e.target.files); e.target.value = ''; }} />
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <ul className="space-y-2">
        {names.map(n => (
          <li key={n} className={'flex items-center gap-2 p-3 rounded-lg border ' + (cur === n ? 'border-indigo-500' : 'border-slate-200')}>
            <button className="flex-1 text-left truncate" onClick={() => show(n)}>📖 {n}</button>
            <button className="text-sm text-red-600" onClick={() => del(n)}>Xóa</button>
          </li>
        ))}
        {!names.length && <li className="text-sm text-slate-400">Chưa có sách nào.</li>}
      </ul>
      {url && <iframe title={cur || 'pdf'} src={url} className="w-full rounded-lg border" style={{ height: '80vh' }} />}
    </div>
  );
}
