import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, UploadCloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Form Excel gồm 3 sheet; tên cột so khớp sau khi bỏ dấu, khoảng trắng, chữ hoa.
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]/g, '');
const SHEETS = { reading: 'Bài đọc', vocab: 'Từ vựng', quiz: 'Câu hỏi' };
const READ_COLS = ['Mã bài', 'Tiêu đề', 'Tiêu đề (Việt)', 'JLPT', 'Chủ đề', 'Ảnh thumbnail', 'Bài đọc', 'Bản dịch'];
const VOCAB_COLS = ['Mã bài', 'Từ vựng', 'Cách đọc', 'Loại từ', 'Hán Việt', 'Nghĩa', 'JLPT'];
const QUIZ_COLS = ['Mã bài', 'STT', 'Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng', 'Giải thích', 'Dạng câu hỏi'];

interface Lesson { id: string; title: string; titleVi: string; level: string; topic: string; imageUrl: string; sentences: [string, string][]; vocab: any[]; quizzes: any[] }
const str = (v: unknown) => String(v ?? '').replace(/\r/g, '').trim();
const getRows = (wb: XLSX.WorkBook, name: string) => {
  const key = norm(name); const sn = wb.SheetNames.find(n => norm(n) === key);
  return sn ? XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sn]).map(r => new Map(Object.entries(r).map(([k, v]) => [norm(k), v]))) : [];
};
const cell = (r: Map<string, unknown>, col: string, ...alt: string[]) => { for (const k of [col, ...alt]) { const v = r.get(norm(k)); if (v !== undefined && str(v) !== '') return str(v); } return ''; };

export function parseReadingWorkbook(wb: XLSX.WorkBook) {
  const errors: string[] = []; const warns: string[] = [];
  const lessons = new Map<string, Lesson>();
  getRows(wb, SHEETS.reading).forEach((r, i) => {
    const row = i + 2; const id = cell(r, 'Mã bài');
    if (!id) { if (cell(r, 'Tiêu đề') || cell(r, 'Bài đọc')) errors.push(`Sheet "Bài đọc" dòng ${row}: thiếu Mã bài.`); return; }
    if (lessons.has(id)) { errors.push(`Sheet "Bài đọc" dòng ${row}: Mã bài "${id}" bị trùng.`); return; }
    const title = cell(r, 'Tiêu đề'); const jp = cell(r, 'Bài đọc').split('\n').map(s => s.trim()).filter(Boolean); const vi = cell(r, 'Bản dịch').split('\n').map(s => s.trim()).filter(Boolean);
    if (!title) errors.push(`Bài ${id}: thiếu Tiêu đề.`);
    if (!jp.length) { errors.push(`Bài ${id}: thiếu nội dung Bài đọc.`); return; }
    if (vi.length !== jp.length) warns.push(`Bài ${id}: Bài đọc có ${jp.length} câu nhưng Bản dịch có ${vi.length} dòng — câu thiếu bản dịch sẽ để trống.`);
    const img = cell(r, 'Ảnh thumbnail', 'Thumbnail', 'Ảnh');
    if (img && !/^(https:\/\/|\/)/.test(img)) warns.push(`Bài ${id}: Ảnh thumbnail phải là link https:// (hoặc đường dẫn bắt đầu bằng /) — sẽ dùng ảnh tự tạo.`);
    const lv = cell(r, 'JLPT').toUpperCase();
    lessons.set(id, { id, title, titleVi: cell(r, 'Tiêu đề (Việt)', 'Tiêu đề Việt'), level: /^N[1-5]$/.test(lv) ? lv : 'N4', topic: cell(r, 'Chủ đề'), imageUrl: /^(https:\/\/|\/)/.test(img) ? img : '', sentences: jp.map((j, k) => [j, vi[k] || ''] as [string, string]), vocab: [], quizzes: [] });
  });
  getRows(wb, SHEETS.vocab).forEach((r, i) => {
    const row = i + 2; const id = cell(r, 'Mã bài'); const word = cell(r, 'Từ vựng', 'Từ');
    if (!id && !word) return;
    const l = lessons.get(id); if (!l) { errors.push(`Sheet "Từ vựng" dòng ${row}: Mã bài "${id}" không có trong sheet "Bài đọc".`); return; }
    if (!word) { errors.push(`Sheet "Từ vựng" dòng ${row}: thiếu Từ vựng.`); return; }
    if (!cell(r, 'Nghĩa')) warns.push(`Từ "${word}" (bài ${id}, dòng ${row}): thiếu Nghĩa.`);
    if (!cell(r, 'Cách đọc')) warns.push(`Từ "${word}" (bài ${id}, dòng ${row}): thiếu Cách đọc.`);
    const lv = cell(r, 'JLPT').toUpperCase();
    l.vocab.push({ word, reading: cell(r, 'Cách đọc'), pos: cell(r, 'Loại từ'), hanViet: cell(r, 'Hán Việt'), meaning: cell(r, 'Nghĩa'), level: /^N[1-5]$/.test(lv) ? lv : l.level });
  });
  getRows(wb, SHEETS.quiz).forEach((r, i) => {
    const row = i + 2; const id = cell(r, 'Mã bài'); const q = cell(r, 'Câu hỏi');
    if (!id && !q) return;
    const l = lessons.get(id); if (!l) { errors.push(`Sheet "Câu hỏi" dòng ${row}: Mã bài "${id}" không có trong sheet "Bài đọc".`); return; }
    const options = ['A', 'B', 'C', 'D'].map(c => cell(r, `Đáp án ${c}`, c));
    const ans = cell(r, 'Đáp án đúng', 'Đáp án').toUpperCase(); const correct = 'ABCD'.indexOf(ans[0] || '#') >= 0 && ans.length === 1 ? 'ABCD'.indexOf(ans) : /^[1-4]$/.test(ans) ? Number(ans) - 1 : -1;
    if (!q || options.some(o => !o)) { errors.push(`Sheet "Câu hỏi" dòng ${row} (bài ${id}): cần Câu hỏi và đủ 4 đáp án A-D.`); return; }
    if (correct < 0) { errors.push(`Sheet "Câu hỏi" dòng ${row} (bài ${id}): Đáp án đúng phải là A, B, C hoặc D.`); return; }
    const exp = cell(r, 'Giải thích'); if (!exp) warns.push(`Câu hỏi dòng ${row} (bài ${id}): thiếu Giải thích.`);
    l.quizzes.push({ question: q, options, correct, explanation: exp, type: cell(r, 'Dạng câu hỏi') });
  });
  const list = [...lessons.values()];
  for (const l of list) { if (!l.vocab.length) warns.push(`Bài ${l.id}: chưa có từ vựng.`); if (!l.quizzes.length) warns.push(`Bài ${l.id}: chưa có câu hỏi.`); }
  return { lessons: list, errors, warns };
}

export default function AdminReadingImport() {
  const { token } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warns, setWarns] = useState<string[]>([]);
  const [existing, setExisting] = useState<{ id: string; title: string; questionCount: number; wordCount: number }[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = () => fetch('/api/reading/library', { cache: 'no-store' }).then(r => r.ok ? r.json() : []).then(setExisting).catch(() => setExisting([]));
  useEffect(() => { load(); }, []);

  const template = () => {
    const wb = XLSX.utils.book_new();
    const sheet = (rows: unknown[][], widths: number[]) => { const ws = XLSX.utils.aoa_to_sheet(rows); ws['!cols'] = widths.map(wch => ({ wch })); return ws; };
    XLSX.utils.book_append_sheet(wb, sheet([READ_COLS,
      ['bai-001', '朝の電車', 'Chuyến tàu buổi sáng', 'N4', 'Cuộc sống', 'https://example.com/anh-bai-001.jpg', 'わたしは毎朝、七時の電車に乗って会社へ行きます。\n朝の電車はいつも込んでいて、座ることができません。', 'Mỗi sáng tôi đi chuyến tàu 7 giờ đến công ty.\nTàu buổi sáng lúc nào cũng đông nên tôi không thể ngồi được.'],
    ], [10, 18, 24, 7, 14, 36, 60, 60]), SHEETS.reading);
    XLSX.utils.book_append_sheet(wb, sheet([VOCAB_COLS,
      ['bai-001', '毎朝', 'まいあさ', 'danh từ', 'MỖI TRIỀU', 'mỗi sáng', 'N4'],
      ['bai-001', '座る', 'すわる', 'động từ', 'TỌA', 'ngồi', 'N5'],
    ], [10, 14, 14, 12, 16, 24, 7]), SHEETS.vocab);
    XLSX.utils.book_append_sheet(wb, sheet([QUIZ_COLS,
      ['bai-001', 1, '「わたし」はどうして朝の電車で座ることができませんか。', '電車が古いから', '電車がいつも込んでいるから', '電車が短いから', '会社が遠いから', 'B', '「朝の電車はいつも込んでいて、座ることができません。」と書いてあります。', 'Hỏi lý do'],
    ], [10, 6, 40, 20, 20, 20, 20, 12, 50, 14]), SHEETS.quiz);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['Quy tắc điền form bài đọc'],
      ['File có 3 sheet: "Bài đọc", "Từ vựng", "Câu hỏi". Dòng 1 của mỗi sheet là tên cột, không đổi tên cột. Xóa dòng mẫu rồi nhập dữ liệu của bạn.'],
      ['Mã bài: chữ không dấu, số, gạch ngang (ví dụ bai-001). Mỗi bài một mã duy nhất; các sheet "Từ vựng" và "Câu hỏi" ghi cùng Mã bài để gắn vào bài. Nhập lại cùng Mã bài sẽ cập nhật (ghi đè) bài cũ.'],
      ['Sheet "Bài đọc" — mỗi bài MỘT dòng. Bắt buộc: Mã bài, Tiêu đề, Bài đọc. Tiêu đề (Việt), JLPT (N1-N5, mặc định N4), Chủ đề là tùy chọn.'],
      ['Bài đọc: mỗi CÂU một dòng trong ô (xuống dòng bằng Alt+Enter). Chỉ viết chữ Nhật thường, KHÔNG cần ghi furigana — app tự thêm furigana.'],
      ['Bản dịch: nghĩa tiếng Việt, mỗi dòng ứng với đúng một câu ở cột Bài đọc (cùng thứ tự, cùng số dòng).'],
      ['Ảnh thumbnail: link ảnh bắt đầu bằng https:// (ảnh vuông hoặc 16:9). Để trống thì app tự tạo ảnh màu kèm chữ Hán.'],
      ['Sheet "Từ vựng" — mỗi từ MỘT dòng. Bắt buộc: Mã bài, Từ vựng. Nên điền: Cách đọc (hiragana), Loại từ (danh từ, động từ, tính từ…), Hán Việt (viết hoa, để trống thì app tự tra), Nghĩa, JLPT. Từ trong danh sách này sẽ hiện nghĩa khi người học bấm vào từ trong bài.'],
      ['Từ vựng ghi ở DẠNG TỪ ĐIỂN (ví dụ 伝える, không ghi 伝えました) để khớp khi bấm từ.'],
      ['Sheet "Câu hỏi" — mỗi câu MỘT dòng, đúng 4 đáp án. Bắt buộc: Mã bài, Câu hỏi, Đáp án A-D (đủ 4), Đáp án đúng (một chữ A/B/C/D hoặc số 1-4). Nên điền Giải thích; Dạng câu hỏi (ví dụ Hỏi lý do) là tùy chọn. STT chỉ để bạn theo dõi, app giữ thứ tự dòng.'],
      ['Mỗi ô tối đa 2000 ký tự. Nội dung nên tự soạn hoặc có bản quyền của bạn.'],
    ]), 'Hướng dẫn');
    XLSX.writeFile(wb, 'Mau_Nhap_Bai_Doc.xlsx');
  };

  const parse = async (file: File) => {
    setMsg(null); setLessons([]); setErrors([]); setWarns([]);
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      if (!wb.SheetNames.some(n => norm(n) === norm(SHEETS.reading))) { setMsg({ ok: false, text: 'Không thấy sheet "Bài đọc". Hãy dùng file mẫu và giữ nguyên tên sheet.' }); return; }
      const r = parseReadingWorkbook(wb);
      setErrors(r.errors); setWarns(r.warns); setLessons(r.errors.length ? [] : r.lessons);
      if (!r.lessons.length && !r.errors.length) setMsg({ ok: false, text: 'Sheet "Bài đọc" chưa có bài nào.' });
    } catch { setMsg({ ok: false, text: 'Không đọc được file này.' }); }
  };
  const call = async (url: string, body?: unknown) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body ?? {}) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.success) throw new Error(j.error || 'Máy chủ chưa xác nhận lưu.');
    return j;
  };
  const save = async () => {
    setBusy(true); setMsg(null); let n = 0;
    try {
      for (const l of lessons) { await call('/api/admin/reading-library/import', { lesson: l }); n++; }
      setMsg({ ok: true, text: `Đã lưu ${n} bài đọc.` }); setLessons([]); setWarns([]); load();
    } catch (e: any) { setMsg({ ok: false, text: `${e.message} (đã lưu ${n}/${lessons.length} bài, có thể nhập lại để lưu tiếp)` }); load(); } finally { setBusy(false); }
  };
  const remove = async (id: string) => { try { await call('/api/admin/reading-library/delete', { ids: [id] }); load(); } catch (e: any) { setMsg({ ok: false, text: e.message }); } };
  const clear = async () => {
    setBusy(true); setMsg(null);
    try { const j = await call('/api/admin/reading-library/clear'); setMsg({ ok: true, text: `Đã xóa ${j.count} bài đọc.` }); load(); }
    catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); setConfirmClear(false); }
  };
  const btn = 'min-h-[44px] px-4 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50';

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3" aria-label="Nhập bài đọc từ Excel">
      <h3 className="font-bold text-sm">Nhập bài đọc từ Excel</h3>
      <p className="text-xs text-slate-500">File gồm 3 sheet: Bài đọc, Từ vựng, Câu hỏi (nối với nhau bằng Mã bài). App tự thêm furigana và chuẩn bị tra từ; bạn chỉ nhập nội dung. Tải file mẫu để xem quy tắc ở sheet "Hướng dẫn".</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={template} className={`${btn} bg-slate-100 dark:bg-slate-800`}><Download size={16} /> Tải file mẫu</button>
        <label className={`${btn} bg-emerald-600 text-white cursor-pointer`}><UploadCloud size={16} /> Chọn file Excel
          <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) parse(f); e.target.value = ''; }} /></label>
      </div>
      {errors.length > 0 && <ul className="max-h-40 overflow-auto text-xs text-rose-600 space-y-0.5" aria-label="Lỗi">{errors.slice(0, 50).map((x, i) => <li key={i}>✖ {x}</li>)}{errors.length > 50 && <li>…và {errors.length - 50} lỗi nữa</li>}<li className="font-bold">Sửa các lỗi trên trong file rồi chọn lại file (chưa lưu gì).</li></ul>}
      {lessons.length > 0 && (<>
        <p className="text-xs font-semibold">{lessons.length} bài · {lessons.reduce((a, l) => a + l.vocab.length, 0)} từ vựng · {lessons.reduce((a, l) => a + l.quizzes.length, 0)} câu hỏi</p>
        <div className="max-h-48 overflow-auto text-xs rounded-lg border border-slate-200 dark:border-slate-700"><table className="w-full"><tbody>
          {lessons.map(l => <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800"><td className="p-1.5 font-mono">{l.id}</td><td className="p-1.5" lang="ja">{l.title}</td><td className="p-1.5">{l.level}</td><td className="p-1.5">{l.sentences.length} câu · {l.vocab.length} từ · {l.quizzes.length} hỏi</td>{existing.some(e => e.id === l.id) && <td className="p-1.5 text-amber-700">ghi đè</td>}</tr>)}
        </tbody></table></div>
        {warns.length > 0 && <ul className="max-h-32 overflow-auto text-xs text-amber-700 space-y-0.5" aria-label="Cảnh báo">{warns.slice(0, 40).map((x, i) => <li key={i}>⚠ {x}</li>)}{warns.length > 40 && <li>…và {warns.length - 40} cảnh báo nữa</li>}</ul>}
        <button type="button" disabled={busy} onClick={save} className={`${btn} bg-blue-600 text-white`}>{busy ? 'Đang lưu…' : `Lưu ${lessons.length} bài`}</button>
      </>)}
      <div className="space-y-1">
        <p className="text-xs font-semibold">Bài đang có ({existing.length})</p>
        {existing.length > 0 && <div className="max-h-40 overflow-auto text-xs rounded-lg border border-slate-200 dark:border-slate-700"><table className="w-full"><tbody>
          {existing.map(e => <tr key={e.id} className="border-b border-slate-100 dark:border-slate-800"><td className="p-1.5 font-mono">{e.id}</td><td className="p-1.5" lang="ja">{e.title}</td><td className="p-1.5">{e.wordCount} từ · {e.questionCount} hỏi</td><td className="p-1.5 text-right"><button type="button" onClick={() => remove(e.id)} className="text-rose-600 font-bold cursor-pointer">Xóa</button></td></tr>)}
        </tbody></table></div>}
      </div>
      <div>
        {!confirmClear ? <button type="button" onClick={() => setConfirmClear(true)} className={`${btn} text-rose-600 border border-rose-300`}>Xóa toàn bộ bài đọc</button>
          : <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-bold text-rose-600">Xóa hết bài đọc đã nhập?</span>
            <button type="button" disabled={busy} onClick={clear} className={`${btn} bg-rose-600 text-white`}>Xóa</button>
            <button type="button" onClick={() => setConfirmClear(false)} className={`${btn} bg-slate-100 dark:bg-slate-800`}>Hủy</button></div>}
      </div>
      {msg && <p role="status" className={`text-xs font-semibold ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>}
    </section>
  );
}
