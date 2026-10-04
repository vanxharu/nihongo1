# Shadowing YouTube

Open `/shadowing`, select a library video or paste a YouTube link. The library reuses the application's existing video metadata; availability and embed permission depend on each uploader.

In **Tải / nhập phụ đề**, request Japanese captions or import SRT/VTT. Plain text is also supported; use **Lưu mốc karaoke** to assign sentence boundaries. Caption edits and timings are saved locally for the current video. Clicking a transcript card seeks the player to that sentence.

Karaoke follows the YouTube playback clock, including speed changes and backwards seeks. Sentence timestamps are authoritative; progress within each sentence is interpolated by text length, not forced alignment to recorded speech. SRT/VTT need to match the selected video. Repeating a sentence includes a configurable pause for speaking practice.

**Nghe · Viết chính tả** puts a dictation panel beside the video and hides the transcript and analysis until the learner reveals the answer. Learners can type or assemble shuffled word chunks, reveal individual word hints, check their answer, and move between sentences. Answer comparison ignores punctuation, spacing and fullwidth forms, but preserves Japanese spelling. Duplicate words have independent selectable IDs. Wrong-answer and replay counters apply to the current sentence and reset on sentence changes. The playback button can pause at the sentence end; replaying does not erase the answer. It does not score recorded pronunciation or transcribe microphone audio.

**Phân tích câu** returns vocabulary, kanji, readings, Vietnamese translation and grammar. Configure `OPENAI_API_KEY` (optional `OPENAI_MODEL`) or `GEMINI_API_KEY` (optional `SHADOWING_AI_MODEL`) on the server to enable contextual translation and grammar. Without a key, or when AI fails, built-in vocabulary and kanji remain available; translations and grammar are not fabricated. Furigana uses vocabulary readings returned by the analysis; unknown readings are omitted.

The Express development server and Vercel functions share handlers in `src/server/shadowing.ts`. Caption requests have bounded network timeouts. When captions cannot be obtained, manual import stays available.

Checks: `npm run lint`, `npm run build`, `npm run test:shadowing`, `npm run test:audio`.
