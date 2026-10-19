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
  ['word', 'Từ vựng', ['tuvung', 'word', 'tuvidu']],
  ['wordReading', 'Cách đọc từ', ['cachdoctu', 'wordreading', 'cachdoctuvidu']],
  ['wordMeaning', 'Nghĩa từ', ['nghiatu', 'wordmeaning', 'nghiatuvidu']],
  ['sentence', 'Câu ví dụ', ['cauvidu', 'sentence']],
  ['sentenceVi', 'Dịch câu', ['dichcau', 'sentencevi']],
];
// Thông tin của chữ (không phải của từ): dòng sau của cùng một chữ được bỏ trống.
const KANJI_FIELDS = ['chapterTitle', 'lessonTitle', 'onyomi', 'kunyomi', 'hanViet', 'meaning', 'strokes', 'level', 'mnemonic'];
const KANJI_RE = /[\u4e00-\u9fff々〆]/g;
/** Chữ Hán trong câu chưa có furigana ghi tay (dạng 家[いえ] hoặc {家|いえ}). */
const missingFurigana = (sentence: string) =>
  [...new Set((sentence.replace(/[\u4e00-\u9fff々〆ヶ]+\[[^\]]*\]/g, '').replace(/\{[^}|]*\|[^}]*\}/g, '').match(KANJI_RE)) || [])];
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function AdminKanjiImport({ onChanged }: { onChanged?: () => void }) {
  const { token } = useAuth();
  const [rows, setRows] = useState<KanjiRow[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [warns, setWarns] = useState<string[]>([]);
  const [errRows, setErrRows] = useState<{ row: KanjiRow; miss: string[] }[]>([]);
  const [replace, setReplace] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const template = () => {
    const ws = XLSX.utils.aoa_to_sheet([COLS.map(c => c[1]),
      [1, 'Gia đình', 1, 'Người trong nhà', '家', 'カ, ケ', 'いえ, や', 'GIA', 'nhà, gia đình', 10, 'N4', 'Mái nhà (宀) che con lợn (豕): nhà có người có của', '家', 'いえ', 'nhà', '私の家は駅の近くです。', 'Nhà tôi ở gần ga.'],
      [1, 'Gia đình', 1, 'Người trong nhà', '家', '', '', '', '', '', '', '', '家族', 'かぞく', 'gia đình', '私の家族は四人です。', 'Gia đình tôi có bốn người.'],
      [1, 'Gia đình', 1, 'Người trong nhà', '家', '', '', '', '', '', '', '', '大家', 'おおや', 'chủ nhà', '大家さんは親切な人です。', 'Chủ nhà là người tốt bụng.'],
      [1, 'Gia đình', 1, 'Người trong nhà', '兄', 'ケイ, キョウ', 'あに', 'HUYNH', 'anh trai', 5, 'N4', '', '兄', 'あに', 'anh trai (của mình)', '兄は大学で勉強しています。', 'Anh trai tôi đang học ở đại học.'],
      [1, 'Gia đình', 1, 'Người trong nhà', '兄', '', '', '', '', '', '', '', '兄弟', 'きょうだい', 'anh em', '兄弟は二人います。', 'Tôi có hai anh em.'],
      [2, 'Nơi làm việc', 1, 'Công ty', '働', 'ドウ', 'はたら.く', 'ĐỘNG', 'làm việc', 13, 'N4', '', '働く', 'はたらく', 'làm việc', '父は銀行で働いています。', 'Bố tôi làm việc ở ngân hàng.'],
    ]);
    ws['!cols'] = [8, 16, 6, 18, 8, 14, 18, 10, 16, 8, 7, 34, 14, 14, 20, 30, 32].map(wch => ({ wch }));
    const guide = XLSX.utils.aoa_to_sheet([
      ['Quy tắc điền'],
      ['Mỗi dòng là MỘT TỪ VỰNG của một chữ Hán, kèm đúng một câu ví dụ. Chữ có 3 từ thì có 3 dòng. App chỉ đọc sheet "Kanji" (sheet đầu tiên); dòng 1 là tên cột. Xóa các dòng mẫu rồi nhập dữ liệu của bạn.'],
      ['Bắt buộc: Chương (số), Bài (số thứ tự trong chương), Kanji. Các cột còn lại tùy chọn.'],
      ['Thông tin của chữ (Tên chương, Tên bài, Âm On, Âm Kun, Hán Việt, Nghĩa, Số nét, JLPT, Mẹo nhớ) chỉ cần điền ở dòng đầu của chữ; các dòng sau của cùng chữ để trống thì app tự lấy từ dòng đầu.'],
      ['Một dòng được nhận diện bằng Chương + Bài + Kanji + Từ vựng; nhập lại cùng bộ này thì cập nhật dòng cũ.'],
      ['Âm On (katakana) và Âm Kun (hiragana): nhiều âm ngăn bằng dấu phẩy; phần okurigana ngăn bằng dấu chấm (ví dụ そだ.つ).'],
      ['Hán Việt: viết hoa. JLPT: N1 đến N5, để trống hoặc sai thì mặc định N4. Số nét: số nguyên.'],
      ['Từ vựng, Cách đọc từ, Nghĩa từ: từ chứa chữ Hán đó (ví dụ 家族 / かぞく / gia đình). Dùng cho thẻ và chế độ Viết Hán.'],
      ['Câu ví dụ + Dịch câu: một câu cho từ vựng của dòng đó. Cần có để dùng Đặt câu, Ghép câu, Đọc hiểu. Có thể viết furigana tay dạng 二人[ふたり].'],
      ['Mỗi ô tối đa 500 ký tự. Nội dung nên tự soạn, không chép ví dụ/bài tập của sách.'],
    ]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Kanji'); XLSX.utils.book_append_sheet(wb, guide, 'Hướng dẫn'); XLSX.writeFile(wb, 'Mau_Nhap_Kanji_Moi.xlsx');
  };
  const exportAll = async () => {
    try {
      const all: KanjiRow[] = await (await fetch('/api/kanji-master', { cache: 'no-store' })).json();
      if (!Array.isArray(all) || !all.length) { setMsg({ ok: false, text: 'Chưa có dữ liệu để xuất.' }); return; }
      all.sort((a, b) => a.chapter - b.chapter || a.lesson - b.lesson);
      const ws = XLSX.utils.aoa_to_sheet([COLS.map(c => c[1]), ...all.map(r => COLS.map(c => (r as any)[c[0]] ?? ''))]);
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Kanji'); XLSX.writeFile(wb, `Kanji_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch { setMsg({ ok: false, text: 'Không xuất được dữ liệu.' }); }
  };
  const parse = async (file: File) => {
    setMsg(null); setRows([]); setSkipped([]); setWarns([]); setErrRows([]);
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]]);
      const out: KanjiRow[] = []; const bad: number[] = [];
      const errs: { row: KanjiRow; miss: string[] }[] = []; const seen = new Map<string, number>(); const w: string[] = []; const heads = new Map<string, KanjiRow>();
      for (const [n, r] of raw.entries()) {
        const o: Record<string, unknown> = {};
        const byKey = new Map(Object.entries(r).map(([k, v]) => [norm(k), v]));
        for (const [field, , aliases] of COLS) { const hit = aliases.find(a => byKey.has(a)); o[field] = hit ? byKey.get(hit) : ''; }
        const row = o as unknown as KanjiRow;
        row.kanji = String(row.kanji ?? '').trim(); row.chapter = Number(row.chapter); row.lesson = Number(row.lesson);
        if (!row.kanji || !(row.chapter > 0) || !(row.lesson > 0)) { bad.push(n + 2); continue; }
        row.word = String(row.word ?? '').trim();
        // Dòng thứ 2 trở đi của cùng một chữ có thể bỏ trống phần thông tin của chữ: lấy từ dòng đầu.
        const hk = `${row.chapter}-${row.lesson}-${row.kanji}`;
        const head = heads.get(hk);
        if (head) { for (const f of KANJI_FIELDS) if (!String((row as any)[f] ?? '').trim()) (row as any)[f] = (head as any)[f]; } else heads.set(hk, row);
        const key = `${row.chapter}-${row.lesson}-${row.kanji}-${row.word}`;
        if (seen.has(key)) { w.push(`Dòng ${n + 2} trùng dòng ${seen.get(key)} (${key}) — dòng sau sẽ ghi đè.`); out.splice(out.findIndex(x => `${x.chapter}-${x.lesson}-${x.kanji}-${x.word}` === key), 1); }
        seen.set(key, n + 2);
        if (!String(row.onyomi || '').trim() && !String(row.kunyomi || '').trim()) w.push(`Dòng ${n + 2} (${key}): thiếu cả Âm On và Âm Kun nên Luyện gõ không có đáp án.`);
        if (!String(row.meaning || '').trim()) w.push(`Dòng ${n + 2} (${key}): thiếu Nghĩa.`);
        if (row.word && !String(row.sentence || '').trim()) w.push(`Dòng ${n + 2} (${key}): từ này chưa có Câu ví dụ.`);
        const miss = missingFurigana(String(row.sentence || ''));
        if (miss.length) { errs.push({ row, miss }); w.push(`Dòng ${n + 2} (${key}): câu ví dụ thiếu furigana cho ${miss.join(', ')}.`); }
        out.push(row);
      }
      if (!out.length) setMsg({ ok: false, text: 'Không có dòng hợp lệ. Mỗi dòng cần Chương, Bài (số) và Kanji. Hãy tải file mẫu để đối chiếu tên cột.' });
      setRows(out); setSkipped(bad); setWarns(w); setErrRows(errs.filter(e => out.includes(e.row)));
    } catch { setMsg({ ok: false, text: 'Không đọc được file này.' }); }
  };
  const downloadErrors = () => {
    const ws = XLSX.utils.aoa_to_sheet([[...COLS.map(c => c[1]), 'Lỗi'], ...errRows.map(e => [...COLS.map(c => (e.row as any)[c[0]] ?? ''), `Thiếu furigana: ${e.miss.join(', ')}`])]);
    ws['!cols'] = [8, 16, 6, 18, 8, 14, 18, 10, 16, 8, 7, 34, 14, 14, 20, 30, 32, 24].map(wch => ({ wch }));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Kanji'); XLSX.writeFile(wb, 'Kanji_Loi_Furigana.xlsx');
  };
  const call = async (url: string, body?: unknown) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body ?? {}) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.success) throw new Error(j.error || 'Máy chủ chưa xác nhận lưu.');
    return j;
  };
  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      let n = 0; for (let i = 0; i < rows.length; i += 200) n += (await call('/api/admin/kanji-master/import', { items: rows.slice(i, i + 200) })).count;
      let removed = 0;
      if (replace) {
        const keep = new Set(rows.map(r => `${r.chapter}-${r.lesson}-${r.kanji}-${r.word}`));
        const old = await (await fetch('/api/kanji-master', { cache: 'no-store' })).json();
        const stale = (Array.isArray(old) ? old : []).map((o: any) => String(o.id)).filter((id: string) => !keep.has(id));
        for (let i = 0; i < stale.length; i += 500) removed += (await call('/api/admin/kanji-master/delete', { ids: stale.slice(i, i + 500) })).count;
      }
      setMsg({ ok: true, text: `Đã lưu ${n} chữ Kanji${removed ? `, xóa ${removed} chữ cũ không có trong file` : ''}.` }); setRows([]); setWarns([]); onChanged?.();
    }
    catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); }
  };
  const clear = async () => {
    setBusy(true); setMsg(null);
    try { const j = await call('/api/admin/kanji-master/clear'); setMsg({ ok: true, text: `Đã xóa ${j.count} chữ Kanji.` }); onChanged?.(); }
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
        <button type="button" onClick={exportAll} className={`${btn} bg-slate-100 dark:bg-slate-800`}><Download size={16} /> Xuất dữ liệu hiện có</button>
        <label className={`${btn} bg-emerald-600 text-white cursor-pointer`}><UploadCloud size={16} /> Chọn file Excel
          <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) parse(f); e.target.value = ''; }} /></label>
      </div>
      {rows.length > 0 && (<>
        <p className="text-xs font-semibold">{rows.length} chữ · {lessons} bài{skipped.length ? ` · bỏ qua ${skipped.length} dòng thiếu Chương/Bài/Kanji (dòng ${skipped.slice(0, 15).join(', ')}${skipped.length > 15 ? '…' : ''})` : ''}</p>
        <div className="max-h-48 overflow-auto text-xs rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full"><tbody>{rows.slice(0, 30).map((r, i) => <tr key={i} className="border-b border-slate-100 dark:border-slate-800"><td className="p-1.5">{r.chapter}-{r.lesson}</td><td className="p-1.5 text-base" lang="ja">{r.kanji}</td><td className="p-1.5" lang="ja">{r.onyomi} {r.kunyomi}</td><td className="p-1.5">{r.hanViet}</td><td className="p-1.5">{r.meaning}</td></tr>)}</tbody></table>
          {rows.length > 30 && <p className="p-2 text-slate-500">…và {rows.length - 30} dòng nữa</p>}
        </div>
        {warns.length > 0 && <ul className="max-h-32 overflow-auto text-xs text-amber-700 space-y-0.5" aria-label="Cảnh báo">{warns.slice(0, 40).map((x, i) => <li key={i}>⚠ {x}</li>)}{warns.length > 40 && <li>…và {warns.length - 40} cảnh báo nữa</li>}</ul>}
        {errRows.length > 0 && <button type="button" onClick={downloadErrors} className={`${btn} bg-amber-100 text-amber-900`}><Download size={16} /> Tải {errRows.length} dòng thiếu furigana (đúng form, sửa rồi nhập đè)</button>}
        <label className="flex items-center gap-2 text-xs min-h-[44px]"><input type="checkbox" checked={replace} onChange={e => setReplace(e.target.checked)} /> Thay thế toàn bộ: xóa các chữ cũ không có trong file này (sau khi lưu thành công)</label>
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
