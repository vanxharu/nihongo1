import React, { useEffect, useMemo, useState } from 'react';
import SenseMeaning, { sentenceOf } from '../ui/SenseMeaning';
import { buildLookup, wordSpans, type Hit, type JaToken } from '../../utils/jaWords';
import { Volume2, X } from 'lucide-react';
import { TANGO_N3_VOCABULARY, TANGO_N4_VOCABULARY, TANGO_N5_VOCABULARY, VOCABULARY_DATA } from '../../data';
import { getDokkaiTranslation } from '../../data/dokkaiTranslations';
import study from '../../data/examStudyData.json';
import { speakJapanese } from '../../utils/audio';

let lookup: ReturnType<typeof buildLookup> | null = null;
const tokenCache = new Map<string, Promise<JaToken[]>>();

// Tra từ dựng từ kho từ vựng sẵn có (N5–N3); kho riêng cho đề thi (examStudyData.json) được ưu tiên.
function getLookup() {
  return lookup ||= buildLookup([
    ...Object.entries(study.glossary as Record<string, { r: string; m: string }>).map(([k, g]) => ({ kanji: k, hiragana: g.r, meaning: g.m, core: true })),
    ...[TANGO_N5_VOCABULARY, TANGO_N4_VOCABULARY, VOCABULARY_DATA, TANGO_N3_VOCABULARY].flatMap((list, i) => list.map(v => ({ kanji: v.kanji, hiragana: v.hiragana, meaning: v.vietnameseMeaning || v.meaning, core: i < 2 }))),
  ]);
}

function tokens(text: string) {
  let p = tokenCache.get(text);
  if (!p) {
    p = fetch('/api/ja/tokens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status)))).then(d => d.tokens as JaToken[]);
    p.catch(() => tokenCache.delete(text));
    tokenCache.set(text, p);
  }
  return p;
}

/** Từ trong văn bản (kuromoji); từ đồng âm lấy nghĩa khớp bản dịch `context`. */
export async function wordsFor(text: string, context = '') {
  return wordSpans(await tokens(text), getLookup(), context);
}

/** null khi đang tải hoặc lỗi: hiện chữ thường, không đoán. */
export function useWordSpans(text: string, context = '') {
  const [spans, setSpans] = useState<{ key: string; spans: { t: string; hit?: Hit }[] } | null>(null);
  const key = text + '\n' + context;
  useEffect(() => {
    if (!text.trim()) return;
    let live = true;
    wordsFor(text, context).then(sp => { if (live) setSpans({ key, spans: sp }); }, () => {});
    return () => { live = false; };
  }, [text, context, key]);
  return spans?.key === key ? spans.spans : null;
}

/** Từ trong đoạn (không trùng) cho bảng từ vựng. */
export function useVocabIn(text: string, context = ''): Hit[] {
  const spans = useWordSpans(text, context);
  return useMemo(() => {
    const seen = new Set<string>(); const r: Hit[] = [];
    for (const s of spans || []) if (s.hit && !seen.has(s.t)) { seen.add(s.t); r.push(s.hit); }
    return r;
  }, [spans]);
}

export const WordsIn: React.FC<{ text: string }> = ({ text }) => {
  const w = useVocabIn(text).slice(0, 8);
  return w.length ? <p className="text-[13px]"><b>Từ trong câu:</b> {w.map((x, i) => <React.Fragment key={x.word}>{i > 0 && ' · '}{x.word} ({x.reading}) = <SenseMeaning word={x.word} meaning={x.meaning} sentence={sentenceOf(text, x.word)} /></React.Fragment>)}</p> : null;
};

/** Văn bản tiếng Nhật chạm-từ-hiện-nghĩa. */
export const TappableJa: React.FC<{ text: string; highlight?: boolean; marks?: string[] }> = ({ text, highlight, marks }) => {
  const [sel, setSel] = useState<Hit | null>(null);
  const spans = useWordSpans(text, useMemo(() => studySentences(text)?.map(s => s.vi).join(' ') ?? '', [text]));
  // marks: các câu dẫn tới đáp án — tô vàng khi đã hiện đáp án.
  const parts = useMemo(() => {
    const ranges = (marks || []).filter(Boolean).flatMap(m => { const i = text.indexOf(m); return i < 0 ? [] : [[i, i + m.length]]; });
    const out: { t: string; hit?: Hit; mark: boolean }[] = [];
    let at = 0;
    for (const sp of spans || [{ t: text }]) {
      // cắt đoạn chữ thường ở ranh giới câu được tô
      const cuts = sp.hit ? [] : ranges.flat().filter(c => c > at && c < at + sp.t.length).sort((a, b) => a - b);
      let from = at;
      for (const c of [...cuts, at + sp.t.length]) {
        out.push({ t: text.slice(from, c), hit: sp.hit, mark: ranges.some(([a, b]) => from >= a && from < b) });
        from = c;
      }
      at += sp.t.length;
    }
    return out;
  }, [text, marks, spans]);
  return (
    <>
      {parts.map((p, i) => p.hit
        ? <button key={i} type="button" onClick={e => { e.stopPropagation(); setSel(p.hit!); }} className="cursor-pointer border-b border-dotted border-[#F4A643]" style={highlight || p.mark ? { background: '#FDE68A', color: '#1F2639' } : undefined}>{p.t}</button>
        : p.mark ? <mark key={i} style={{ background: '#FDE68A', color: '#1F2639' }}>{p.t}</mark> : <React.Fragment key={i}>{p.t}</React.Fragment>)}
      {sel && (
        <span className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-2xl border border-[#EADFCF] bg-white p-4 shadow-2xl block text-left font-sans tracking-normal" role="dialog">
          <span className="flex items-start justify-between gap-2">
            <span><b className="text-lg">{sel.word}</b> <span className="text-sm text-[#786D5E]">{sel.reading}</span></span>
            <span className="flex gap-1">
              <button type="button" aria-label="Phát âm" onClick={() => speakJapanese(sel.reading || sel.word, 0.9)} className="p-1.5 rounded-lg hover:bg-[#F4EDE2] cursor-pointer"><Volume2 className="w-4 h-4" /></button>
              <button type="button" aria-label="Đóng" onClick={() => setSel(null)} className="p-1.5 rounded-lg hover:bg-[#F4EDE2] cursor-pointer"><X className="w-4 h-4" /></button>
            </span>
          </span>
          <span className="mt-1 block text-sm"><SenseMeaning word={sel.word} meaning={sel.meaning} sentence={sentenceOf(text, sel.word)} /></span>
        </span>
      )}
    </>
  );
};

type StudySentence = { ja: string; vi: string; for: string[] };
export const studySentences = (passage: string): StudySentence[] | undefined =>
  (study.passages as Record<string, { sentences: StudySentence[] }>)[passage.slice(0, 20)]?.sentences;

/** Bảng từ vựng + dịch từng câu của bài đọc (dữ liệu: examStudyData.json, hoặc bản dịch cũ nếu có). */
export const ReadingHelper: React.FC<{ qid: string; passage: string; question: string; revealed?: boolean }> = ({ qid, passage, question, revealed }) => {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const words = useVocabIn(open ? passage : '', useMemo(() => studySentences(passage)?.map(s => s.vi).join(' ') ?? '', [passage]));
  const data = useMemo(() => studySentences(passage), [passage]);
  const old = useMemo(() => {
    const e = data ? undefined : getDokkaiTranslation(qid, question + passage);
    // chỉ nhận bản dịch cũ khi các câu của nó thật sự nằm trong đoạn này
    return e && e.sentenceBreakdown.length && e.sentenceBreakdown.every(b => passage.replace(/\s/g, '').includes(b.ja.replace(/\s/g, '').slice(0, 8))) ? e : undefined;
  }, [data, qid, passage, question]);
  const sentences = useMemo(() => data ?? passage.split(/(?<=[。！？])|\n/).map(x => x.trim()).filter(Boolean).map(ja => ({ ja, for: [] as string[], vi: old?.sentenceBreakdown.find(b => ja.replace(/\s/g, '').startsWith(b.ja.replace(/\s/g, '').slice(0, 8)))?.vi ?? '' })), [data, passage, old]);
  return (
    <div className="space-y-2">
      <button type="button" onClick={() => setOpen(o => !o)} className="h-9 px-3 rounded-lg border border-[#EADFCF] bg-[#FDFBF7] text-xs font-bold cursor-pointer">{open ? 'Ẩn trợ giúp bài đọc' : 'Học từ vựng & dịch bài đọc'}</button>
      {open && (
        <div className="rounded-xl border border-[#EADFCF] bg-[#FDFBF7] p-3 text-sm space-y-3">
          <div>
            <p className="font-bold text-xs mb-1">Từ vựng ({words.length})</p>
            {words.length ? <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">{words.map(w => <li key={w.word}><b>{w.word}</b> <span className="text-[#786D5E]">{w.reading}</span> — <SenseMeaning word={w.word} meaning={w.meaning} sentence={sentenceOf(passage, w.word)} /></li>)}</ul> : <p className="text-[#786D5E]">Không có từ nào khớp kho từ vựng.</p>}
          </div>
          <div>
            <p className="font-bold text-xs mb-1">Chạm vào câu để xem bản dịch</p>
            {sentences.map((s, i) => {
              const lead = revealed && s.for.includes(qid);
              return (
                <div key={i}>
                  <button type="button" onClick={() => setSent(sent === i ? null : i)} className="text-left leading-7 cursor-pointer" style={lead || sent === i ? { background: lead ? '#FDE68A' : '#FEF3C7', color: '#1F2639' } : undefined}>{s.ja}</button>
                  {lead && <span className="ml-1 text-[11px] font-bold text-[#B45309]">← dẫn tới đáp án</span>}
                  {sent === i && <p className="text-[13px] text-[#10B981] pl-3">{s.vi || 'Chưa có bản dịch cho câu này.'}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
