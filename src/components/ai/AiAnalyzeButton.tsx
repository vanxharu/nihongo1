import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { auth } from '../../lib/firebase';

export type AiKind = 'vocab' | 'sentence' | 'reading' | 'video' | 'grammar' | 'question';
type Analysis = { translation: string; summary: string; points: { title: string; body: string }[] };
const TITLES: Record<AiKind, string> = { vocab: 'Phân tích từ vựng', sentence: 'Phân tích câu ví dụ', reading: 'Phân tích bài đọc', video: 'Phân tích câu thoại', grammar: 'Phân tích ngữ pháp', question: 'Phân tích câu hỏi' };
const memo = new Map<string, Analysis>();

async function post(url: string, body: unknown) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

// Pre-written analyses ship as static files named like the server key (sha256 of kind + text).
async function staticAnalysis(kind: string, text: string): Promise<Analysis | null> {
  try {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${kind}\n${text.trim()}`));
    const key = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
    const r = await fetch(`/ai-analysis/${key}.json`);
    if (!r.ok || !r.headers.get('content-type')?.includes('json')) return null;
    return (await r.json()).analysis || null;
  } catch { return null; }
}

/** Nút icon "Phân tích AI": xem bản phân tích đã lưu chung; chưa có thì người đã đăng nhập tạo mới (lưu cho mọi người). */
export default function AiAnalyzeButton({ kind, text, context, className = '', size = 16 }: { kind: AiKind; text: string; context?: string; className?: string; size?: number }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'login' | 'error'>('idle');
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState('');
  const key = `${kind}\n${text.trim()}`;

  const run = async () => {
    setOpen(true);
    if (memo.has(key)) { setResult(memo.get(key)!); setState('done'); return; }
    setState('loading'); setError('');
    try {
      const ready = await staticAnalysis(kind, text);
      if (ready) { memo.set(key, ready); setResult(ready); setState('done'); return; }
      const found = await post('/api/ai/analysis/lookup', { kind, text });
      if (found.status === 200 && found.data.analysis) { memo.set(key, found.data.analysis); setResult(found.data.analysis); setState('done'); return; }
      if (found.status !== 404) throw new Error(found.data.error || 'Không đọc được phân tích.');
      if (!auth.currentUser) { setState('login'); return; }
      const made = await post('/api/ai/analysis', { kind, text, context });
      if (made.status !== 200 || !made.data.analysis) throw new Error(made.data.error || 'AI chưa phân tích được.');
      memo.set(key, made.data.analysis); setResult(made.data.analysis); setState('done');
    } catch (e) { setError(e instanceof Error ? e.message : 'Có lỗi xảy ra.'); setState('error'); }
  };

  if (!text?.trim()) return null;
  return <>
    <button type="button" onClick={e => { e.stopPropagation(); void run(); }} title={TITLES[kind] + ' bằng AI'} aria-label={TITLES[kind] + ' bằng AI'}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 cursor-pointer transition-colors hover:bg-[color:var(--ui-tint)] ${className}`} style={{ color: 'var(--ui-primary, #f2b35e)' }}>
      <Sparkles size={size} aria-hidden />
    </button>
    {open && createPortal(
      <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={TITLES[kind]}>
        <div className="w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl text-left" style={{ background: 'var(--ui-surface, #1b2236)', color: 'var(--ui-ink, #f1f5f9)', border: '1px solid var(--ui-line, #384156)' }} onClick={e => e.stopPropagation()}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0"><p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide" style={{ color: 'var(--ui-primary, #f2b35e)' }}><Sparkles size={13} /> {TITLES[kind]}</p>
              <p lang="ja" className="mt-1 text-base font-bold line-clamp-3 whitespace-pre-line">{text}</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="p-1.5 rounded-lg cursor-pointer hover:bg-[color:var(--ui-tint)]"><X size={18} /></button>
          </div>
          {state === 'loading' && <p className="flex items-center gap-2 py-6 text-sm" style={{ color: 'var(--ui-muted)' }}><Loader2 size={16} className="animate-spin" /> Đang tải phân tích…</p>}
          {state === 'login' && <p className="py-4 text-sm">Nội dung này chưa có ai phân tích. Hãy <b>đăng nhập</b> để tạo phân tích bằng AI — kết quả sẽ được lưu cho mọi người cùng xem.</p>}
          {state === 'error' && <p className="py-4 text-sm text-rose-400">{error} <button type="button" className="underline cursor-pointer" onClick={() => void run()}>Thử lại</button></p>}
          {state === 'done' && result && <div className="space-y-3 text-sm leading-relaxed">
            {result.translation && <div><p className="text-xs font-bold mb-1" style={{ color: 'var(--ui-muted)' }}>Dịch</p><p className="whitespace-pre-line">{result.translation}</p></div>}
            {result.summary && <p className="whitespace-pre-line">{result.summary}</p>}
            {result.points.map((p, i) => <div key={i} className="rounded-xl p-3" style={{ background: 'var(--ui-soft, #232b40)' }}><p className="font-bold mb-1">{p.title}</p><p className="whitespace-pre-line">{p.body}</p></div>)}
            <p className="text-[11px]" style={{ color: 'var(--ui-muted)' }}>Phân tích bằng AI, có thể chưa chính xác — hãy đối chiếu với giáo trình.</p>
          </div>}
        </div>
      </div>, document.body)}
  </>;
}
