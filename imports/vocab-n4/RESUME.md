# N4 illustrations — DONE (26-10-2026)

## Trạng thái: HOÀN THÀNH 666/666

- Dải 229–894: **666/666 ảnh thật** (`-v1.webp`), không thiếu số nào.
- Toàn bộ index: **894/894**, mọi entry đều có file trên đĩa.
- 111 số của phiên 26-10 đã tạo, harvest và import sạch: `unmatched = 0`, `tile lỗi = 0`.
- PNG gốc đã chuyển vào `imports/vocab-n4/done/` (666 file, local-only, gitignored).

## Cách chạy lại (nếu sau này cần thêm số mới)

1. `npm run dev` (port 3000) — API `/api/vocab-prompts` (GET) và `/api/vocab-flow-done` (POST).
2. Mở `flow.google.com/project/<id>`, cài đặt **Nano Banana 2.1 · 1:1 · x1**.
3. Trong page: fetch prompts, build `tokenMap` = normalized prompt → number.
4. Submit: `execCommand('insertText', prompt)` vào `div[contenteditable=true]` → focus editor → caret cuối → `browser.press Enter` (Enter phải là trusted event).
5. Harvest: với mỗi tile có `img[data-media-id]` chưa xử lý → bấm nút `aria-label="Sử dụng lại câu lệnh"` → chờ ~450ms → đọc editor → so khớp prompt → POST `{items:[{number, src}]}` → xoá editor.
6. Chạy 6 prompt song song (pending cap 6), mỗi vòng ~50s.
7. Khi đủ file: `npm run import:vocab` → `Move-Item imports/vocab-n4/tango_n4_*.png imports/vocab-n4/done/` → `node imports/vocab-n4/compute-todo.mjs`.

## Lưu ý kỹ thuật

- Tile Flow hiện chỉ có `aria-label` là tiêu đề tóm tắt do AI đặt (vd "Friend treating me to meal"), **không chứa prompt gốc** → phải dùng nút "Sử dụng lại câu lệnh" để lấy prompt chính xác.
- `applyCues`/shadowing không liên quan pipeline ảnh.
- `.env`: vẫn nên xoá/rotate `GEMINI_API_KEY` (đã lộ trong chat cũ).
