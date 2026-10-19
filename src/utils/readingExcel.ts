import * as XLSX from 'xlsx';

// Form Excel gồm 3 sheet; tên cột so khớp sau khi bỏ dấu, khoảng trắng, chữ hoa.
export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]/g, '');
export const SHEETS = { reading: 'Bài đọc', vocab: 'Từ vựng', quiz: 'Câu hỏi' };
export const READ_COLS = ['Mã bài', 'Tiêu đề', 'Tiêu đề (Việt)', 'JLPT', 'Chủ đề', 'Ảnh thumbnail', 'Bài đọc', 'Bản dịch'];
export const VOCAB_COLS = ['Mã bài', 'Từ vựng', 'Cách đọc', 'Loại từ', 'Hán Việt', 'Nghĩa', 'JLPT'];
export const QUIZ_COLS = ['Mã bài', 'STT', 'Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng', 'Giải thích', 'Dạng câu hỏi'];

export interface Lesson { id: string; title: string; titleVi: string; level: string; topic: string; imageUrl: string; sentences: [string, string][]; vocab: any[]; quizzes: any[] }
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

