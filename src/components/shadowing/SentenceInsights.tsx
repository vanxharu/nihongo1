import React, { useEffect, useRef, useState } from 'react';
import { ShadowingAnalysis, ShadowingCue, readShadowingResponse } from '../../utils/shadowing';

export default function SentenceInsights({ cue, videoId, cached, onResult, onClose }: {
  cue: ShadowingCue; videoId: string; cached?: ShadowingAnalysis;
  onResult: (text: string, data: ShadowingAnalysis) => void; onClose: () => void;
}) {
  const [data, setData] = useState<ShadowingAnalysis | null>(cached || null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [tab, setTab] = useState<'meaning' | 'vocabulary' | 'kanji' | 'grammar'>('meaning');
  const resultRef = useRef(onResult); resultRef.current = onResult;
  useEffect(() => {
    if (cached) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), 35000);
    setError(''); setData(null);
    void (async () => {
      try {
        const response = await fetch('/api/shadowing/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sentence: cue.text }), signal: controller.signal });
        const result = await readShadowingResponse(response);
        if (!Array.isArray(result.vocabulary) || !Array.isArray(result.kanji) || !Array.isArray(result.grammar)) throw new Error('Kết quả phân tích chưa hợp lệ.');
        if (controller.signal.aborted) return;
        setData(result); resultRef.current(cue.text, result);
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Chưa phân tích được câu này.');
        else if (controller.signal.reason === 'timeout') setError('Phân tích quá lâu. Bạn có thể thử lại.');
      } finally { clearTimeout(timer); }
    })();
    return () => { clearTimeout(timer); controller.abort(); };
  }, [cue.text, videoId, retry]);
  return <section aria-label="Nghĩa và phân tích câu đã chọn" className="rounded-xl border border-violet-400/40 bg-slate-950 p-4">
    <div className="flex items-center justify-between gap-2"><h2 className="font-bold">Câu đã chọn</h2><button onClick={onClose} aria-label="Đóng phân tích câu" className="rounded-lg px-3 py-2 hover:bg-slate-800">✕</button></div>
    <p lang="ja" className="my-3 text-lg leading-relaxed">{cue.text}</p>
    <nav aria-label="Nội dung phân tích" className="mb-4 flex flex-wrap gap-2">{([['meaning','Nghĩa'],['vocabulary','Từ vựng'],['kanji','Kanji'],['grammar','Ngữ pháp']] as const).map(([id,label]) => <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)} className={`rounded-lg px-3 py-2 text-sm ${tab === id ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{label}</button>)}</nav>
    {error ? <div role="alert"><p className="text-sm text-amber-200">{error}</p><button className="mt-3 rounded-lg bg-violet-600 px-3 py-2" onClick={() => setRetry(n => n + 1)}>Thử lại</button></div> : !data ? <p role="status" className="text-sm text-slate-400">Đang xem nghĩa và phân tích…</p> : <div className="space-y-3 text-sm leading-relaxed">
      {tab === 'meaning' && <p>{data.translation || 'Chưa có bản dịch câu này. Bạn có thể xem nghĩa từng từ ở tab Từ vựng.'}</p>}
      {tab === 'vocabulary' && <>{data.vocabulary.map((v,i) => <article key={i} className="rounded-lg bg-slate-900 p-3"><h3 className="text-lg font-bold text-cyan-200">{v.word} <span className="text-sm font-normal">{v.reading}</span></h3><p>{v.meaning}</p>{v.type && <p className="text-xs text-slate-400">{v.type}</p>}</article>)}{!data.vocabulary.length && <p>Chưa tìm thấy từ vựng trong câu này.</p>}</>}
      {tab === 'kanji' && <>{data.kanji.map(k => <article key={k.character} className="rounded-lg bg-slate-900 p-3"><h3 className="text-2xl font-bold text-amber-200">{k.character} <span className="text-sm">{k.meaning}</span></h3><p>Âm On: {k.onyomi || '—'} · Âm Kun: {k.kunyomi || '—'}</p>{k.radical && <p>Bộ thủ: {k.radical}</p>}{k.components && <p>Cấu tạo: {k.components}</p>}{k.mnemonic && <p>{k.mnemonic}</p>}</article>)}{!data.kanji.length && <p>Chưa có dữ liệu kanji cho câu này.</p>}</>}
      {tab === 'grammar' && <>{data.grammar.map((g,i) => <article key={i} className="rounded-lg bg-slate-900 p-3"><h3 className="font-bold text-violet-200">{g.pattern}</h3><p>{g.meaning}</p><p className="whitespace-pre-line">{g.explanation}</p>{g.example && <p className="mt-2 whitespace-pre-line text-slate-300">{g.example}</p>}</article>)}{!data.grammar.length && <p>Chưa có phân tích ngữ pháp cho câu này.</p>}</>}
      {data.note && <p className="border-t border-slate-800 pt-3 text-xs text-slate-400">{data.note}</p>}
    </div>}
  </section>;
}
