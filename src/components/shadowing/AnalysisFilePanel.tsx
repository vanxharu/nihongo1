import React, { useRef, useState } from 'react';
import type { ShadowingAnalysis, ShadowingCue } from '../../utils/shadowing';
import { claudeShadowingPrompt, MAX_ANALYSIS_FILE_BYTES, parseShadowingAnalysisFile, type ShadowingAnalysisFile } from '../../utils/shadowingAnalysisFile';

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function AnalysisFilePanel({ videoId, cues, analysis, onImport }: {
  videoId: string; cues: ShadowingCue[]; analysis: Map<string, ShadowingAnalysis>;
  onImport: (packet: ShadowingAnalysisFile) => void;
}) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const current = useRef({ videoId, cues }); current.current = { videoId, cues };
  const count = cues.filter(c => analysis.has(c.text)).length;
  const button = 'rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 disabled:opacity-40';
  return <section aria-label="Phân tích bằng file Claude" className="space-y-3 rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100">
    <h3 className="font-bold">Phân tích phụ đề bằng Claude</h3>
    <p className="text-sm text-slate-300">1. Tải prompt → 2. Gửi file đó cho Claude, tải JSON kết quả → 3. Nhập JSON tại đây.</p>
    <div className="flex flex-wrap gap-2">
      <button className={button} disabled={!cues.length} onClick={() => download(`shadowing-${videoId}-claude.txt`, claudeShadowingPrompt(videoId, cues), 'text/plain;charset=utf-8')}>Tải prompt cho Claude</button>
      <label className={`${button} cursor-pointer focus-within:ring-2 focus-within:ring-amber-400 ${!cues.length || busy ? 'opacity-40' : ''}`}>Nhập JSON phân tích
        <input aria-label="Nhập JSON phân tích" type="file" accept=".json,application/json" className="sr-only" disabled={!cues.length || busy} onChange={async e => {
          const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; if (!file) return;
          const target = { videoId, cues }; setBusy(true); setMessage('');
          try {
            if (file.size > MAX_ANALYSIS_FILE_BYTES) throw new Error('File quá lớn. Giới hạn 5 MB mỗi file.');
            const content = await file.text();
            if (current.current.videoId !== target.videoId || current.current.cues !== target.cues) return;
            let value: unknown; try { value = JSON.parse(content.replace(/^\uFEFF/, '')); } catch { throw new Error('JSON không hợp lệ. Hãy yêu cầu Claude xuất file JSON hoàn chỉnh.'); }
            const packet = parseShadowingAnalysisFile(value, videoId, cues);
            onImport(packet); setMessage(`Đã nhập và lưu ${packet.sentences.length} câu. Có thể nhập tiếp file khác.`);
          } catch (error) { setMessage(error instanceof Error ? error.message : 'Không nhập được file.'); }
          finally { setBusy(false); }
        }} />
      </label>
      <button className={button} disabled={!count} onClick={() => {
        const packet: ShadowingAnalysisFile = { version: 1, videoId, sentences: cues.filter(c => analysis.has(c.text)).map(c => ({ id: c.id, text: c.text, analysis: analysis.get(c.text)! })) };
        download(`shadowing-${videoId}.json`, JSON.stringify(packet, null, 2), 'application/json');
      }}>Xuất JSON đã lưu</button>
    </div>
    <p className="text-xs text-slate-400">Đã có phân tích {count}/{cues.length} câu. File nhập được lưu trên trình duyệt này; xuất JSON để sao lưu hoặc chuyển máy.</p>
    <p role="status" className="text-sm text-amber-200">{busy ? 'Đang đọc file…' : message}</p>
  </section>;
}
