# Căn chỉnh chữ với âm thanh gốc

Phụ đề Supadata chỉ có mốc cả câu. Không dùng độ dài câu để suy ra mốc từng chữ.
Trình phát giữ chữ trắng khi chưa có dữ liệu căn chỉnh; câu đang phát vẫn được chọn theo mốc phụ đề.

Nếu lấy được phụ đề YouTube `srv3`, công cụ giữ lại mốc bắt đầu các từ do YouTube cung cấp.
Các đoạn chỉ có một mốc cho cả câu không được coi là mốc từng từ:

```sh
npm run align:shadowing -- --video-id I3kvL128MIQ --youtube-srv3 /path/to/captions.ja.srv3
```

Các từ gồm nhiều ký tự đổi màu cùng lúc tại mốc từ gốc. Muốn mốc riêng từng ký tự,
chạy bước ElevenLabs bên dưới. File có thể chứa câu chưa có mốc từ; các câu đó giữ chữ trắng.

## Tạo dữ liệu một lần cho mỗi video

1. Chuẩn bị âm thanh gốc **từ giây 0**, không cắt phần mở đầu, không đổi tốc độ.
2. Đặt `ELEVENLABS_API_KEY` trong môi trường của máy chạy công cụ. Không đưa khóa vào GitHub.
3. Chạy:

```sh
npm run align:shadowing -- --video-id I3kvL128MIQ --audio /path/to/original.m4a
```

Công cụ lấy phụ đề gốc từ website, gửi âm thanh cùng nguyên văn phụ đề tới
`POST https://api.elevenlabs.io/v1/forced-alignment`, rồi ghép mốc từng chữ trở lại từng câu.
Đây là tác vụ quản trị ngoại tuyến có sử dụng hạn mức ElevenLabs; không chạy lại mỗi lần người dùng mở video.
Vercel không cần giữ khóa ElevenLabs để phát dữ liệu đã tạo.

Có thể dùng `--transcript /path/to/transcript.json` (dữ liệu `{ cues: [...] }`) khi đã tải phụ đề.
Dùng `--alignment /path/to/result.json` để nhập lại kết quả ElevenLabs đã có mà không gọi dịch vụ lần nữa.

Kết quả lưu tại `public/shadowing-alignments/<videoId>.json`. Chỉ triển khai file sau khi kiểm tra
đầu, giữa và cuối video. Âm thanh gốc và khóa dịch vụ không được triển khai cùng website.
File JSON có `version`, `videoId`, `source` và các `cues`; mỗi câu có `timings` gồm
`text`, `textStart`, `textEnd` (offset UTF-16 trong câu), `start`, `end` (giây trong video).

## Các điều kiện kiểm tra

- Nội dung căn chỉnh phải khớp nguyên văn phụ đề (chỉ bỏ qua khoảng trắng).
- Mỗi ký tự có mốc riêng; không chia đều mốc của một từ để giả lập mốc chữ.
- Mốc phải hữu hạn, không âm, theo thứ tự và không chồng các câu.
- File phải thuộc đúng video; chữ đổi màu từ thời điểm bắt đầu đo được.
- Tua lùi, dừng hoặc thay tốc độ dùng thời gian thực của YouTube, không dùng đồng hồ chạy riêng.
- Website kiểm tra file căn chỉnh ngay cả khi trình duyệt đã lưu phụ đề cũ.

Căn chỉnh âm thanh không sửa các từ nhận dạng sai trong phụ đề tự động. Cần kiểm tra nội dung
và độ khớp thực tế trước khi xuất bản; độ chính xác vẫn phụ thuộc chất lượng âm thanh và dịch vụ.

Tài liệu dịch vụ: https://elevenlabs.io/docs/api-reference/forced-alignment/create
