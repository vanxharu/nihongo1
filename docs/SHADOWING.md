# Shadowing YouTube

Open `/shadowing`, select a library video or paste a YouTube link. The library reuses the application's existing video metadata; availability and embed permission depend on each uploader.

In **Tải / nhập phụ đề**, request Japanese captions or import SRT/VTT. Plain text is also supported; use **Lưu mốc karaoke** to assign sentence boundaries. Caption edits and timings are saved locally for the current video. Clicking a transcript card seeks the player to that sentence.

Karaoke follows the YouTube playback clock, including speed changes and backwards seeks. Sentence timestamps are authoritative; progress within each sentence is interpolated by text length, not forced alignment to recorded speech. SRT/VTT need to match the selected video. Repeating a sentence includes a configurable pause for speaking practice.

**Nghe · Viết chính tả** puts a dictation panel beside the video and hides the transcript and analysis until the learner reveals the answer. Learners can type or assemble shuffled word chunks, reveal individual word hints, check their answer, and move between sentences. Answer comparison ignores punctuation, spacing and fullwidth forms, but preserves Japanese spelling. Duplicate words have independent selectable IDs. Wrong-answer and replay counters apply to the current sentence and reset on sentence changes. The playback button can pause at the sentence end; replaying does not erase the answer. It does not score recorded pronunciation or transcribe microphone audio.

**Phân tích bằng file Claude**: mở tab **Phân tích**, chọn **Tải prompt cho Claude**, gửi file `.txt` cho Claude rồi tải file JSON hoàn chỉnh và chọn **Nhập JSON phân tích**. Không cần Claude API key. Ứng dụng không tự gọi AI khi phát, chuyển câu hoặc mở phân tích. Kết quả được dùng cho bản dịch, furigana, từ vựng, kanji, ngữ pháp và flashcard.

JSON có dạng `{ "version": 1, "videoId": "...", "sentences": [{ "id": "...", "text": "...", "analysis": { "source": "ai", "translation": "...", "readings": [], "vocabulary": [], "kanji": [], "grammar": [] } }] }`. Prompt tải xuống mô tả đầy đủ các trường con. Giữ nguyên ID và text được xuất từ phụ đề hiện tại. Không sửa mốc thời gian hoặc yêu cầu Claude đoán thời gian từ văn bản.

File được kiểm tra toàn bộ trước khi lưu: đúng video, đúng ID/nội dung câu, không trùng ID, đúng kiểu dữ liệu, tối đa 500 câu và 5 MB/file. Có thể nhập từng phần, các câu khác đã nhập được giữ lại. Sửa phụ đề làm ID/text khác thì cần xuất lại prompt cho các câu đó. File lỗi không ghi đè dữ liệu đã có.

Nhập JSON lưu trên trình duyệt hiện tại. Dùng **Xuất JSON đã lưu** để sao lưu hoặc chuyển máy. Muốn phát hành kết quả tĩnh cho mọi người, lưu JSON đã xuất vào `public/shadowing-analysis/<videoId>.json`, commit rồi deploy Vercel. Ứng dụng tự đọc file này, ưu tiên kết quả nhập trên trình duyệt nếu có. Đường dẫn asset không có file vẫn cho phép nhập thủ công.

The Express development server and Vercel functions share handlers in `src/server/shadowing.ts`. Caption requests have bounded network timeouts. When captions cannot be obtained, manual import stays available.

Vercel uses native Node ESM: API entry points and their runtime dependencies use explicit `.js` import extensions.

YouTube may refuse transcript requests from cloud servers even when the same video has captions available locally. Configure the server-only `SUPADATA_API_KEY` environment variable to enable a managed original-caption fallback (Supadata `/v1/transcript`, `mode=native`, `lang=ja`). It never silently substitutes translated English or generated AI text for Japanese captions. Add the key to Production in Vercel and redeploy; do not place it in browser variables or source control. Requests consume the provider account's quota. Without the key, cloud restrictions remain an external limitation; API failures are reported as readable JSON errors.

Checks: `npm run lint`, `npm run build`.

Bài 05 (`R1Oy-PqXhz4`) có sẵn file phân tích tĩnh cho đủ 322 dòng, khớp ID/text bộ phụ đề website chính ngày 2026-10-18 (revision `df4262b1-01fd-408f-bd21-b1a9ae54c6e0`). Bản này do ChatGPT biên soạn ghi chú ngữ pháp theo ngữ cảnh, bổ sung từ vựng, dùng từ điển app cho kanji/từ vựng và kế thừa bản dịch/furigana đã có. Chưa đối chiếu âm thanh; 21 đoạn nghi lỗi nhận dạng được ghi chú, giữ nguyên text và thời gian. Nhãn số câu/phương án không bị tạo ngữ pháp giả. Chạy `node --import tsx scripts/build-shadowing-static-analysis.ts` để tái tạo JSON và prompt Claude. Prompt xuất sẵn tại `public/shadowing-analysis/R1Oy-PqXhz4-claude.txt`.

## Toàn bộ 10 đề

`public/shadowing-captions/` chứa bản chụp phụ đề app đã lưu của đủ 10 đề (3.384 dòng), tải từ endpoint video của website chính ngày 2026-10-18. Dữ liệu gốc có dòng bị ngắt giữa mệnh đề và có lỗi nhận dạng. Không tự gộp các dòng đã lưu: ID, text và mốc phải khớp với file phân tích.

Chạy `node --import tsx scripts/build-shadowing-catalog-analysis.ts` để tạo 10 JSON và 10 prompt Claude trong `public/shadowing-analysis/`. `manifest.json` ghi số dòng, độ phủ từ vựng/kanji/ngữ pháp, phương pháp và hash nguồn từng đề. Bài 05 giữ ghi chú ngữ pháp theo ngữ cảnh đã biên soạn; 9 đề còn lại tách từ bằng Kuromoji, tra từ điển app, nhận diện cấu trúc bằng quy tắc có ví dụ do ChatGPT biên soạn. Đây là phân tích học tập tĩnh bằng từ điển/quy tắc, **chưa phải phân tích Claude và chưa kiểm tra audio**. Bản dịch và readings kế thừa app. Những dòng chưa nhận diện được cấu trúc để mảng grammar rỗng; nhãn số không bị tạo ngữ pháp giả. Lời cảnh báo về dòng bị ngắt/nhận dạng sai được hiển thị trong bảng phân tích.

Có thể thay từng JSON bằng kết quả Claude sau khi kiểm tra nội dung. Prompt giữ nguyên ID/text và cho phép chia nhiều file nhỏ. Không cần lấy lại phụ đề từ YouTube để làm bước này.

Kiểm tra: `node --import tsx --test tests/shadowingAnalysisFile.test.ts`, `npm run lint`, `npm run build`.
