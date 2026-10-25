# N4 vocabulary illustrations — import folder

Thư mục này dùng để nhận ảnh minh họa từ vựng N4 do bạn tạo bên ngoài (AI Studio, Midjourney, v.v.).

## 1. Bộ prompt

| File | Nội dung |
|---|---|
| `prompts.csv` | 666 prompt (id 229–894), mở bằng Excel/Google Sheets |
| `prompts.jsonl` | Cùng dữ liệu, mỗi dòng 1 JSON — dùng để chạy batch bằng script/API |
| `prompts/tango_n4_<số>.txt` | Mỗi từ 1 file prompt riêng, tên khớp với ảnh cần tạo |
| `prompts-batch.txt` | 67 lô × 10 từ, dán thẳng vào chat AI (Gemini/ChatGPT/Copilot) |
| `studio.html` | Trang click-to-copy 666 prompt + theo dõi tiến độ — mở bằng trình duyệt |
| `inbox/` | Nơi bỏ ảnh vừa tải về, chưa cần đổi tên |
| `manifest.csv` | Danh sách đủ 894 từ (id, kanji, hiragana, nghĩa, ví dụ) |

Prompt đã theo đúng spec của 228 ảnh gốc: tranh textbook Nhật đen trắng, nét xám mảnh, nền trắng, 1:1, không chữ/số/logo.

### Master style prompt (dán vào ô style/system nếu công cụ có)

```text
Create a square 1:1 black-and-white Japanese textbook illustration series.
Thin gray outlines, light gray shading, plain white background, simple clean line art,
one centered scene per image, generous white space, readable at 104 pixels, family friendly.
No text, letters, numbers, Japanese characters, logos, watermark, color, gradients,
photorealism, or decorative frame. Keep every image in exactly the same line weight,
shading, and composition style.
```

> Mẹo giữ style đồng nhất: nếu công cụ tạo ảnh hỗ trợ ảnh tham chiếu, đính kèm 1–2 ảnh gốc trong `public/vocabulary-illustrations/n4/` (ví dụ `tango_n4_7.webp`, `tango_n4_45.webp`) làm reference.

## 2. Đặt tên ảnh

Lưu ảnh vào `inbox/` (khuyến nghị, script tự đổi tên) hoặc **chính thư mục này** (`imports/vocab-n4/`) nếu bạn đã đặt tên sẵn. Tên file hợp lệ:

- `tango_n4_229.png` ← khuyến nghị
- `229.png`
- `給料.png` (khớp theo kanji, hỗ trợ cả hiragana)

Định dạng nhận: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.gif`, `.bmp`, `.tif`, `.tiff`.

Ảnh không cần đúng 288×288 — script tự đưa về 288×288, nền trắng, WebP quality 84.

## 3. Đường miễn phí: AI Studio web + `studio.html`

Free tier của Gemini API **không có quyền tạo ảnh** (`limit: 0`), nhưng trang web AI Studio thì vẫn tạo được miễn phí. Quy trình:

### Bước 1 — lấy prompt

Mở `imports/vocab-n4/studio.html` bằng trình duyệt (double-click). Trang có đủ 666 prompt, đánh dấu tiến độ bằng `localStorage`.

- `Copy prompt kế tiếp (N)` hoặc phím `N`: copy prompt của từ chưa làm, tự cuộn tới thẻ đó.
- `/`: nhảy vào ô tìm kiếm (tìm theo kanji, hiragana, nghĩa, số).
- Click vào tên file `tango_n4_xxx.png` để copy đúng tên đó.
- Tick "đã tạo" sau mỗi ảnh → thanh tiến độ chạy.

### Bước 2 — tạo ảnh

Mở https://aistudio.google.com/ → chọn model **Nano Banana 2** (`gemini-3.1-flash-image`) → dán prompt → chạy → tải ảnh về.

Giữ style đồng nhất: gắn kèm 1 ảnh gốc (ví dụ `public/vocabulary-illustrations/n4/tango_n4_7.webp`) làm ảnh tham chiếu trong ô chat, kèm câu "match this line weight and shading".

**Tạo đúng thứ tự 229 → 894**, vì bước sau gán id theo thời gian tải về.

### Bước 3 — bỏ ảnh vào inbox

Tải ảnh vào:

```text
imports/vocab-n4/inbox/
```

Không cần đổi tên — cứ để tên AI Studio đặt (`Gemini_Generated_Image_xxxx.png`).

### Bước 4 — gán id theo thứ tự

```bash
npm run vocab:inbox          # xem trước mapping, không đổi gì
npm run vocab:inbox:sheet    # + tạo inbox/inbox-sheet.html để kiểm tra bằng mắt
npm run vocab:inbox:apply    # đổi tên thật + chuyển sang imports/vocab-n4/
```

- Sắp theo **thời gian tải về** (cũ nhất trước), rồi tới tên file.
- Id bắt đầu từ `--start <số>`; mặc định lấy id trống đầu tiên trong dải prompt (229…), sau đó ghi vào `inbox/.state.json` để lần sau chạy tiếp.
- Ảnh trùng đích hoặc không khớp từ nào được chuyển vào `inbox/skipped/` kèm lý do.
- Đổi thứ tự nếu cần: `npm run vocab:inbox -- --start 300`.
- Thứ tự sai: xoá `inbox/.state.json`, đổi tên ảnh theo ý muốn rồi chạy lại.

### Bước 5 — import vào app

```bash
npm run import:vocab
```

## 4. Tạo ảnh tự động bằng Gemini API (cần bật billing)

Free tier hiện trả `429 … limit: 0` cho mọi model ảnh — phải bật billing trong AI Studio (~$27–45 cho 666 ảnh với Nano Banana 2). Thêm key vào `.env` ở gốc dự án:

```bash
GEMINI_API_KEY=your_key_here
```

Kiểm tra key và danh sách model ảnh khả dụng:

```bash
npm run image:probe
```

Các model ảnh đã xác nhận có trên key hiện tại:

| Model | Tên | Ghi chú |
|---|---|---|
| `gemini-3.1-flash-image` | Nano Banana 2 | mặc định, nhanh + theo prompt tốt |
| `gemini-3-pro-image` | Nano Banana Pro | chất lượng cao nhất, chậm/đắt hơn |
| `gemini-3.1-flash-lite-image` | Nano Banana 2 Lite | rẻ nhất, nét đơn giản hơn |
| `gemini-2.5-flash-image` | Nano Banana | bản cũ, vẫn dùng được |

Chạy thử 3 ảnh (kèm ảnh gốc làm style reference):

```bash
node scripts/generate-images-gemini.mjs --limit 3 --reference public/vocabulary-illustrations/n4/tango_n4_7.webp
```

Chạy toàn bộ 666 ảnh (tự bỏ qua ảnh đã có, tự dừng khi hết quota):

```bash
npm run image:gemini
```

- Ảnh lưu vào chính thư mục này: `tango_n4_229.png` …
- Hết quota ngày → chạy lại lệnh trên vào hôm sau, script tiếp tục từ chỗ dừng.
- Log lỗi/từ chối: `imports/vocab-n4/gemini-failures.json`
- Tuỳ chọn: `--from 300 --to 400`, `--ids tango_n4_229,tango_n4_230`, `--force`, `--delay 8000`, `--model <tên-model>`.

## 5. Import

```bash
npm run import:vocab
```

Script sẽ:

1. Quét ảnh trong thư mục này (thêm `--recursive` nếu có thư mục con).
2. Khớp tên file với từ vựng (theo số, kanji hoặc hiragana).
3. Resize → `public/vocabulary-illustrations/n4/`.
4. Nếu từ đã có ảnh, tạo bản mới `tango_n4_<số>-v1.webp`, `-v2`… (không ghi đè, không làm hỏng ảnh đang chạy).
5. Cập nhật `src/data/vocabularyIllustrations.json` để app dùng ảnh mới nhất.

Kiểm tra trước khi ghi:

```bash
node scripts/import-vocab-illustrations.mjs --dry-run
```

Chạy lại nhiều lần thoải mái: ảnh đã import sẽ được đánh version mới, ảnh lỗi/không nhận diện được sẽ được liệt kê.

## 6. Trạng thái hiện tại

- `tango_n4_1` … `tango_n4_228`: **ảnh minh họa gốc** (giữ nguyên).
- `tango_n4_229` … `tango_n4_894`: **ảnh placeholder icon** (cần thay bằng ảnh từ prompt).
- Tạo lại prompt: `npm run vocab:prompts`
- Tạo lại manifest: `npm run vocab:manifest`

## 7. Kiểm tra kết quả

```bash
node scripts/build-vocab-illustration-index.mjs
```

Mở app → `http://localhost:3000/jlpt/N4/vocabulary` để xem thẻ từ vựng.
