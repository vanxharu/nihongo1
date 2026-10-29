import React, { useEffect, useMemo, useState } from 'react';
import type { Hit } from '../../utils/jaWords';
import SenseMeaning from '../ui/SenseMeaning';
import { createPortal } from 'react-dom';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { analysisHighlights } from '../../utils/analysisHighlights';

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
  const [picked, setPicked] = useState(0);
  // Design 4: vocab/grammar points drawn as highlights on the text itself; other points stay below.
  const marked = useMemo(() => result && text.length <= 400 ? analysisHighlights(text, result.points) : null, [result, text]);
  const hl = marked?.highlights.length ? marked.highlights : null;
  const sel = hl?.[Math.min(picked, hl.length - 1)];
  // Words inside the picked chunk (kuromoji); homographs take the meaning this analysis' translation uses.
  const [words, setWords] = useState<{ start: number; t: string; hit: Hit }[]>([]);
  useEffect(() => {
    if (!hl?.some(h => h.type === 'chunk') || kind === 'vocab' || kind === 'grammar') return;
    let live = true;
    const ctx = [result!.translation, ...result!.points.map(p => p.body)].join(' ');
    import('../exam/TappableJa').then(m => m.wordsFor(text, ctx)).then(sp => {
      let at = 0; const out: { start: number; t: string; hit: Hit }[] = [];
      for (const x of sp) { if (x.hit) out.push({ start: at, t: x.t, hit: x.hit }); at += x.t.length; }
      if (live) setWords(out);
    }, () => {});
    return () => { live = false; };
  }, [hl, kind, result, text]);
  const inChunk = sel?.type === 'chunk' ? words.filter(w => w.start >= sel.start && w.start + w.t.length <= sel.end) : [];

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
              {hl ? <p lang="ja" className="mt-2 text-xl sm:text-2xl font-bold leading-[1.9] whitespace-pre-line">{hl.map((h, i) => <React.Fragment key={i}>
                  {text.slice(i ? hl[i - 1].end : 0, h.start)}
                  <button type="button" onClick={() => setPicked(i)} aria-pressed={sel === h} aria-label={`${h.label}: ${h.meaning}`}
                    className="cursor-pointer rounded-sm px-0.5 font-bold"
                    style={h.type === 'vocab' ? { background: sel === h ? '#3B82F6' : 'rgba(59,130,246,.18)', color: sel === h ? '#fff' : 'inherit', borderBottom: '3px solid #3B82F6' }
                      : h.type === 'chunk' ? { background: sel === h ? 'rgba(13,148,136,.32)' : 'rgba(13,148,136,.12)', borderBottom: '3px solid #0D9488' }
                      : { background: sel === h ? 'rgba(234,88,12,.35)' : 'rgba(234,88,12,.16)', borderBottom: '3px dashed #EA580C' }}>{text.slice(h.start, h.end)}</button>
                </React.Fragment>)}{text.slice(hl[hl.length - 1].end)}</p>
              : <p lang="ja" className="mt-1 text-base font-bold line-clamp-3 whitespace-pre-line">{text}</p>}</div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="p-1.5 rounded-lg cursor-pointer hover:bg-[color:var(--ui-tint)]"><X size={18} /></button>
          </div>
          {state === 'loading' && <p className="flex items-center gap-2 py-6 text-sm" style={{ color: 'var(--ui-muted)' }}><Loader2 size={16} className="animate-spin" /> Đang tải phân tích…</p>}
          {state === 'login' && <p className="py-4 text-sm">Nội dung này chưa có ai phân tích. Hãy <b>đăng nhập</b> để tạo phân tích bằng AI — kết quả sẽ được lưu cho mọi người cùng xem.</p>}
          {state === 'error' && <p className="py-4 text-sm text-rose-400">{error} <button type="button" className="underline cursor-pointer" onClick={() => void run()}>Thử lại</button></p>}
          {state === 'done' && result && <div className="space-y-3 text-sm leading-relaxed">
            {hl && sel && <>
              <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--ui-muted)' }}>
                {hl.some(h => h.type === 'chunk') && <span className="flex items-center gap-1.5"><i className="inline-block w-4" style={{ borderBottom: '3px solid #0D9488' }} />Cụm câu</span>}
                {hl.some(h => h.type === 'vocab') && <span className="flex items-center gap-1.5"><i className="inline-block w-4" style={{ borderBottom: '3px solid #3B82F6' }} />Từ vựng</span>}
                {hl.some(h => h.type === 'grammar') && <span className="flex items-center gap-1.5"><i className="inline-block w-4" style={{ borderBottom: '3px dashed #EA580C' }} />Ngữ pháp</span>}
                <span>Bấm vào phần tô màu để xem</span>
              </div>
              <div className="rounded-xl p-3" style={{ border: `1px solid ${sel.type === 'vocab' ? 'rgba(59,130,246,.45)' : sel.type === 'chunk' ? 'rgba(13,148,136,.45)' : 'rgba(234,88,12,.45)'}`, background: sel.type === 'vocab' ? 'rgba(59,130,246,.08)' : sel.type === 'chunk' ? 'rgba(13,148,136,.08)' : 'rgba(234,88,12,.08)' }}>
                <p className="flex flex-wrap items-baseline gap-2"><b lang="ja" className="text-lg">{sel.label}</b>{sel.reading && <span lang="ja" style={{ color: 'var(--ui-muted)' }}>{sel.reading}</span>}</p>
                <p className="text-[15px] whitespace-pre-line">{sel.meaning}</p>
                {sel.inner?.map((w, i) => <p key={i} className="mt-1 text-[13px]"><b lang="ja">{w.label}</b>{w.reading && <span lang="ja" style={{ color: 'var(--ui-muted)' }}> {w.reading}</span>}: {w.meaning}</p>)}
                {inChunk.length > 0 && <div className="mt-2 pt-2 text-[13px] space-y-0.5" style={{ borderTop: '1px dashed var(--ui-line, #384156)' }}>
                  <p className="text-xs font-bold" style={{ color: 'var(--ui-muted)' }}>Từ trong cụm</p>
                  {inChunk.map(w => <p key={w.start}><b lang="ja">{w.hit.word}</b>{w.hit.reading && w.hit.reading !== w.hit.word && <span lang="ja" style={{ color: 'var(--ui-muted)' }}> {w.hit.reading}</span>}: <SenseMeaning word={w.hit.word} meaning={w.hit.meaning} sentence={text.length <= 400 ? text : w.t} /></p>)}
                </div>}
              </div>
            </>}
            {result.translation && <div className={hl ? 'pt-3' : ''} style={hl ? { borderTop: '1px solid var(--ui-line, #384156)' } : undefined}>{!hl && <p className="text-xs font-bold mb-1" style={{ color: 'var(--ui-muted)' }}>Dịch</p>}<p className={`whitespace-pre-line ${hl ? 'text-base' : ''}`}>{result.translation}</p></div>}
            {result.summary && <p className="whitespace-pre-line">{result.summary}</p>}
            {result.points.map((p, i) => marked?.usedPoints.has(i) ? null : <div key={i} className="rounded-xl p-3" style={{ background: 'var(--ui-soft, #232b40)' }}><p className="font-bold mb-1">{p.title}</p><p className="whitespace-pre-line">{p.body}</p></div>)}
            <p className="text-[11px]" style={{ color: 'var(--ui-muted)' }}>Phân tích bằng AI, có thể chưa chính xác — hãy đối chiếu với giáo trình.</p>
          </div>}
        </div>
      </div>, document.body)}
  </>;
}
