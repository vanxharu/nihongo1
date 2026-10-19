// Tạo form Excel trống nhập bài đọc (giống nút "Tải file mẫu" trong admin). Chạy: node scripts/makeReadingTemplate.mjs out.xlsx
import { createRequire } from 'node:module';
const XLSX = createRequire(import.meta.url)('xlsx');
const wb = XLSX.utils.book_new();
const sheet = (rows, widths) => { const ws = XLSX.utils.aoa_to_sheet(rows); ws['!cols'] = widths.map(wch => ({ wch })); return ws; };
XLSX.utils.book_append_sheet(wb, sheet([['Mã bài','Tiêu đề','Tiêu đề (Việt)','JLPT','Chủ đề','Ảnh thumbnail','Bài đọc','Bản dịch'],
  ['bai-001','朝の電車','Chuyến tàu buổi sáng','N4','Cuộc sống','https://example.com/anh-bai-001.jpg','わたしは毎朝、七時の電車に乗って会社へ行きます。\n朝の電車はいつも込んでいて、座ることができません。','Mỗi sáng tôi đi chuyến tàu 7 giờ đến công ty.\nTàu buổi sáng lúc nào cũng đông nên tôi không thể ngồi được.']], [10,18,24,7,14,36,60,60]), 'Bài đọc');
XLSX.utils.book_append_sheet(wb, sheet([['Mã bài','Từ vựng','Cách đọc','Loại từ','Hán Việt','Nghĩa','JLPT'],
  ['bai-001','毎朝','まいあさ','danh từ','MỖI TRIỀU','mỗi sáng','N4'],['bai-001','座る','すわる','động từ','TỌA','ngồi','N5']], [10,14,14,12,16,24,7]), 'Từ vựng');
XLSX.utils.book_append_sheet(wb, sheet([['Mã bài','STT','Câu hỏi','Đáp án A','Đáp án B','Đáp án C','Đáp án D','Đáp án đúng','Giải thích','Dạng câu hỏi'],
  ['bai-001',1,'「わたし」はどうして朝の電車で座ることができませんか。','電車が古いから','電車がいつも込んでいるから','電車が短いから','会社が遠いから','B','「朝の電車はいつも込んでいて、座ることができません。」と書いてあります。','Hỏi lý do']], [10,6,40,20,20,20,20,12,50,14]), 'Câu hỏi');
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
  ['Quy tắc điền form bài đọc'],
  ['File có 3 sheet: "Bài đọc", "Từ vựng", "Câu hỏi". Dòng 1 của mỗi sheet là tên cột, không đổi tên cột. Xóa dòng mẫu rồi nhập dữ liệu của bạn.'],
  ['Mã bài: chữ không dấu, số, gạch ngang (ví dụ bai-001). Mỗi bài một mã duy nhất; sheet "Từ vựng" và "Câu hỏi" ghi cùng Mã bài để gắn vào bài. Nhập lại cùng Mã bài sẽ ghi đè bài cũ.'],
  ['Sheet "Bài đọc" — mỗi bài MỘT dòng. Bắt buộc: Mã bài, Tiêu đề, Bài đọc. Tùy chọn: Tiêu đề (Việt), JLPT (N1-N5, mặc định N4), Chủ đề.'],
  ['Bài đọc: mỗi CÂU một dòng trong ô (xuống dòng bằng Alt+Enter). Chỉ viết chữ Nhật thường, KHÔNG cần ghi furigana — app tự thêm.'],
  ['Bản dịch: nghĩa tiếng Việt, mỗi dòng ứng với đúng một câu ở cột Bài đọc (cùng thứ tự, cùng số dòng).'],
  ['Ảnh thumbnail: link ảnh bắt đầu bằng https://. Để trống thì app tự tạo ảnh màu kèm chữ Hán.'],
  ['Sheet "Từ vựng" — mỗi từ MỘT dòng. Bắt buộc: Mã bài, Từ vựng. Nên điền: Cách đọc (hiragana), Loại từ, Hán Việt (viết hoa, để trống thì app tự tra), Nghĩa, JLPT.'],
  ['Từ vựng ghi ở DẠNG TỪ ĐIỂN (ví dụ 伝える, không ghi 伝えました) để khớp khi người học bấm vào từ.'],
  ['Sheet "Câu hỏi" — mỗi câu MỘT dòng, đúng 4 đáp án. Bắt buộc: Mã bài, Câu hỏi, Đáp án A-D (đủ 4), Đáp án đúng (A/B/C/D hoặc 1-4). Nên điền Giải thích; Dạng câu hỏi là tùy chọn; STT chỉ để theo dõi.'],
  ['Mỗi ô tối đa 2000 ký tự. Nội dung nên tự soạn hoặc có bản quyền của bạn.'],
]), 'Hướng dẫn');
XLSX.writeFile(wb, process.argv[2] || 'Mau_Nhap_Bai_Doc.xlsx');
