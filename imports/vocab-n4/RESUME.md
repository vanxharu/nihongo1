# Nhắc việc cho phiên tiếp theo (28 mục trình tự)

## Bối cảnh đã dừng
- Ngày 25-10 dừng do **hết hạn mức tạo ảnh Flow** (user xác nhận).
- Tất cả tab Flow đã đóng. Tab mới đợt cuối chạy trong **project mới hoàn toàn** (title "Tháng 10 25 - 13:31"), chỉ kịp submit số **315 ×3** (bug submitting chưa release) — tile chưa kịp tạo/binding.
- Không mất tiến độ gì: tiến độ thật = file PNG trên đĩa + `src/data/vocabularyIllustrations.json`.

## Trạng thái hiện tại
- Ảnh thật đã harvest + import: **555/666** (89,4% dải 229–894; tổng app 783/894).
- Còn thiếu **111 số** (39 inflight + 72 gap): xem `todo.json` (tự sinh từ `compute-todo.mjs`).
- Số 315 nếu hoàn tất trong đêm trong project cũ `bdfe81d4-…` → mai mở lại project đó harvest miễn phí trước khi submit lại.

## Trình tự làm tiếp (mai)
1. Kiểm tra hạn mức Flow đã reset (ngày mới / quota hiển thị trong Dashboard).
2. Mở `flow.google.com` → project cũ (feed chứa tile hoàn tất ban đêm) hoặc project mới tùy; nếu UP project cũ có tile hoàn tất của số trong 111 → install engine harvest trước (bản v4 tick: chỉ capture, không submit).
3. Sau khi harvest sạch tile cũ → mở 1 phiên mới / dùng chính project đó, **collapse số 315 ra khỏi danh sách nếu đã capture**.
4. Chạy engine v5 single-tab (script đã dùng ngày 25-10): fill `div[contenteditable=true]` bằng `execCommand('insertText')`, force caret, `browser.press Enter`, `__flowPressVerify`.
5. **ĐÃ FIX BUG submitting**: giữ patch `__flowInFlight` (stale 60s) — tránh submit trùng số khi tile chưa binding.
6. Nhịp: pass ≤ 3 press + sleep 60–90s; pending cap 6; khi tile lỗi "Không thành công – lượng truy cập cao…" → auto “Thử lại” throttle 12s/tile, KHÔNG dead numbers.
7. Khi file PNG ≥ 24: `npm run import:vocab` + `Move-Item .\imports\vocab-n4\tango_n4_*.png .\imports\vocab-n4\done\`.
8. Theo dõi hạn mức: khi message hết hạn mức lại xuất hiện → dừng ngay, ghi snapshot, chờ ngày sau.
9. Khi đủ 666: `node .\imports\vocab-n4\compute-todo.mjs` → missing = 0; verify random vài id; tổng kết 894/894.
10. (Khuyến nghị) Xoá/rotate `GEMINI_API_KEY` trong `.env` (đã lộ trong chat trước đó).

## Tổng quan ngắn
- Script tính dư thiếu: `imports/vocab-n4/compute-todo.mjs` (node) — cập nhật `todo.json`.
- Server `server.ts`: `/api/vocab-prompts` (GET, port 3000), `/api/vocab-flow-done` (POST items[{number,src}]).
- Import: `scripts/import-vocab-illustrations.mjs` (resize 288 WebP, versioning `-v`).
- Prompt nguồn: `imports/vocab-n4/prompts.jsonl` (666).
