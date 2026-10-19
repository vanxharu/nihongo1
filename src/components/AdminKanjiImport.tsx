import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, UploadCloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { KanjiRow } from '../data/kanjiAsVocab';

// Tên cột trong Excel → trường dữ liệu (so khớp sau khi bỏ dấu, khoảng trắng, chữ hoa).
const COLS: [keyof KanjiRow, string, string[]][] = [
  ['chapter', 'Chương', ['chuong', 'chapter']],
  ['chapterTitle', 'Tên chương', ['tenchuong', 'chaptertitle']],
  ['lesson', 'Bài', ['bai', 'lesson']],
  ['lessonTitle', 'Tên bài', ['tenbai', 'lessontitle']],
  ['kanji', 'Kanji', ['kanji', 'chuhan']],
  ['onyomi', 'Âm On', ['amon', 'onyomi', 'on']],
  ['kunyomi', 'Âm Kun', ['amkun', 'kunyomi', 'kun']],
  ['hanViet', 'Hán Việt', ['hanviet']],
  ['meaning', 'Nghĩa', ['nghia', 'meaning']],
  ['strokes', 'Số nét', ['sonet', 'strokes']],
  ['level', 'JLPT', ['jlpt', 'level', 'capdo']],
  ['mnemonic', 'Mẹo nhớ', ['meonho', 'mnemonic']],
  ['words', 'Từ ví dụ', ['tuvidu', 'words', 'word']],
  ['sentence', 'Câu ví dụ', ['cauvidu', 'sentence']],
  ['sentenceVi', 'Dịch câu', ['dichcau', 'sentencevi']],
];
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function AdminKanjiImport() {
  const { token } = useAuth();
  const [rows, setRows] = useState<KanjiRow[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const template = () => {
    const ws = XLSX.utils.aoa_to_sheet([COLS.map(c => c[1]), [1, 'Tên chương', 1, 'Tên bài', '家', 'カ, ケ', 'いえ, や', 'GIA', 'nhà', 10, 'N4', '', '家族(かぞく)=gia đình; 家(いえ)=nhà', '', '']]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Kanji'); XLSX.writeFile(wb, 'Mau_Nhap_Kanji.xlsx');
  };
  const parse = async (file: File) => {
    setMsg(null); setRows([]); setSkipped(0);
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]]);
      const out: KanjiRow[] = []; let bad = 0;
      for (const r of raw) {
        const o: Record<string, unknown> = {};
        const byKey = new Map(Object.entries(r).map(([k, v]) => [norm(k), v]));
        for (const [field, , aliases] of COLS) { const hit = aliases.find(a => byKey.has(a)); o[field] = hit ? byKey.get(hit) : ''; }
        const row = o as unknown as KanjiRow;
        row.kanji = String(row.kanji ?? '').trim(); row.chapter = Number(row.chapter); row.lesson = Number(row.lesson);
        if (!row.kanji || !(row.chapter > 0) || !(row.lesson > 0)) { bad++; continue; }
        out.push(row);
      }
      if (!out.length) setMsg({ ok: false, text: 'Không có dòng hợp lệ. Mỗi dòng cần Chương, Bài (số) và Kanji. Hãy tải file mẫu để đối chiếu tên cột.' });
      setRows(out); setSkipped(bad);
    } catch { setMsg({ ok: false, text: 'Không đọc được file này.' }); }
  };
  const call = async (url: string, body?: unknown) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body ?? {}) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.success) throw new Error(j.error || 'Máy chủ chưa xác nhận lưu.');
    return j;
  };
  const save = async () => {
    setBusy(true); setMsg(null);
    try { let n = 0; for (let i = 0; i < rows.length; i += 200) n += (await call('/api/admin/kanji-master/import', { items: rows.slice(i, i + 200) })).count; setMsg({ ok: true, text: `Đã lưu ${n} chữ Kanji.` }); setRows([]); }
    catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); }
  };
  const clear = async () => {
    setBusy(true); setMsg(null);
    try { const j = await call('/api/admin/kanji-master/clear'); setMsg({ ok: true, text: `Đã xóa ${j.count} chữ Kanji.` }); }
    catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); setConfirmClear(false); }
  };
  const btn = 'min-h-[44px] px-4 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50';
  const lessons = new Set(rows.map(r => `${r.chapter}-${r.lesson}`)).size;

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3" aria-label="Nhập Kanji Master từ Excel">
      <h3 className="font-bold text-sm">Nhập Kanji Master từ Excel</h3>
      <p className="text-xs text-slate-500">Mỗi dòng là một chữ Hán. Cần cột Chương, Bài, Kanji; các cột còn lại tùy chọn. Âm On/Kun và Từ ví dụ ngăn nhiều giá trị bằng dấu , hoặc ; (từ ví dụ: 家族(かぞく)=gia đình; 家(いえ)=nhà). Nhập lại cùng Chương-Bài-Kanji sẽ cập nhật dòng cũ.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={template} className={`${btn} bg-slate-100 dark:bg-slate-800`}><Download size={16} /> Tải file mẫu</button>
        <label className={`${btn} bg-emerald-600 text-white cursor-pointer`}><UploadCloud size={16} /> Chọn file Excel
          <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) parse(f); e.target.value = ''; }} /></label>
      </div>
      {rows.length > 0 && (<>
        <p className="text-xs font-semibold">{rows.length} chữ · {lessons} bài{skipped ? ` · bỏ qua ${skipped} dòng thiếu Chương/Bài/Kanji` : ''}</p>
        <div className="max-h-48 overflow-auto text-xs rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full"><tbody>{rows.slice(0, 30).map((r, i) => <tr key={i} className="border-b border-slate-100 dark:border-slate-800"><td className="p-1.5">{r.chapter}-{r.lesson}</td><td className="p-1.5 text-base" lang="ja">{r.kanji}</td><td className="p-1.5" lang="ja">{r.onyomi} {r.kunyomi}</td><td className="p-1.5">{r.hanViet}</td><td className="p-1.5">{r.meaning}</td></tr>)}</tbody></table>
          {rows.length > 30 && <p className="p-2 text-slate-500">…và {rows.length - 30} dòng nữa</p>}
        </div>
        <button type="button" disabled={busy} onClick={save} className={`${btn} bg-blue-600 text-white`}>{busy ? 'Đang lưu…' : `Lưu ${rows.length} chữ`}</button>
      </>)}
      <div>
        {!confirmClear ? <button type="button" onClick={() => setConfirmClear(true)} className={`${btn} text-rose-600 border border-rose-300`}>Xóa toàn bộ dữ liệu Kanji</button>
          : <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-bold text-rose-600">Xóa hết Kanji đã nhập?</span>
            <button type="button" disabled={busy} onClick={clear} className={`${btn} bg-rose-600 text-white`}>Xóa</button>
            <button type="button" onClick={() => setConfirmClear(false)} className={`${btn} bg-slate-100 dark:bg-slate-800`}>Hủy</button></div>}
      </div>
      {msg && <p role="status" className={`text-xs font-semibold ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>}
    </section>
  );
}
