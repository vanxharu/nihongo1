# Phân tích AI soạn sẵn — tiến trình

Phân tích soạn sẵn nằm ở `public/ai-analysis/{hash}.json` (hash = sha256 của `kind\ntext`, 40 ký tự).
Nút ✨ đọc file tĩnh trước; chưa có thì mới gọi API.

Làm tiếp từ đâu: chạy `npx tsx scripts/ai-analysis-todo.ts <nhóm> <số bài>`.
Script tự bỏ qua mục đã có file, nên luôn in đúng phần tiếp theo:
- `vocab` — Tango N4 theo bài (`vocab:tango_c1_s3` …), mỗi từ gồm 1 mục từ + 1 mục câu ví dụ
- `grammar` — ngữ pháp N4 theo bài (`grammar:N4:30` …)
- `video` — câu thoại video Shadowing mới, video ngắn trước

Viết phân tích theo đúng thứ tự todo → ghép bằng `pair.py` (scratchpad) hoặc tự tạo JSONL
`{"k","t","tr","s","p":[[tiêu đề, nội dung]]}` → `npx tsx scripts/ai-analysis-import.ts file.jsonl`.

## Cách viết (theo mẫu Văn chọn)
- Câu ví dụ & câu thoại video: chia câu thành CỤM theo thứ tự; mỗi point: title = cụm chép nguyên văn từ câu
  (cụm không chồng nhau), body = "nghĩa" + giải thích từ vựng/ngữ pháp trong cụm (thể chia, trợ từ, vì sao, dễ nhầm với gì).
  summary để rỗng. Kiểm tra mọi cụm khớp câu: chạy analysisHighlights (mọi point phải nằm trong usedPoints).
- Từ vựng: các point đầu = từng chữ Hán/phần của từ (title chép từ từ, body = "nghĩa" · Hán Việt · cách đọc), sau đó Cách dùng / Phân biệt / Lưu ý.
- Ngữ pháp: các point đầu = từng phần tiếng Nhật trong mẫu (chép từ mẫu, không chồng nhau), sau đó Ví dụ / Phân biệt / Lưu ý.

## Đã xong
- 2026-10-28: Tango N4 bài tango_c1_s1, tango_c1_s2 (52 từ + 52 câu ví dụ); ngữ pháp N4 bài 26–29 (12 mẫu);
  video WDpZjB_1PHE, K65rdMF4tuo (Nihongo con Teppei, 94 câu). Tổng: 210 mục.

- 2026-10-28 (tối): XONG toàn bộ Tango N4 (36 bài, 1787 mục từ + câu ví dụ) và toàn bộ ngữ pháp N4 (110 mẫu + 1 mẫu gộp んです/んですが của bản production).

## Tiếp theo
- video: video ngắn tiếp theo theo todo (94/9951 câu)
- Chưa làm: câu hỏi thi, bài đọc hiểu, Tango N5/N3 (cần thêm vào scripts/ai-analysis-items.ts)
