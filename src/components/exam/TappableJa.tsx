import React, { useMemo, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { TANGO_N3_VOCABULARY, TANGO_N4_VOCABULARY, TANGO_N5_VOCABULARY, VOCABULARY_DATA } from '../../data';
import { getDokkaiTranslation } from '../../data/dokkaiTranslations';
import study from '../../data/examStudyData.json';
import openjlpt from '../../data/openjlptGlossary.json';
import { speakJapanese } from '../../utils/audio';

export interface Hit { word: string; reading: string; meaning: string; ext?: boolean }
type Dict = Map<string, Hit>;
let dict: Dict | null = null;
const SUFFIX = 'いるうくぐすつぬぶむ';

// Từ điển tra nhanh dựng từ kho từ vựng sẵn có (N5–N3 + từ riêng); dựng 1 lần khi cần.
function getDict(): Dict {
  if (dict) return dict;
  dict = new Map();
  const add = (k: string, hit: Hit) => {
    dict!.set(k, hit);
    // dạng chia: bỏ đuôi (楽しい → 楽し, 泳ぐ → 泳) để khớp 楽しかった, 泳げる
    if (k.length >= 2 && /[\u4e00-\u9faf]/.test(k[0]) && SUFFIX.includes(k.slice(-1)) && !dict!.has(k.slice(0, -1))) dict!.set(k.slice(0, -1), hit);
  };
  // Kho bổ sung riêng cho đề thi (examStudyData.json) được ưu tiên hơn kho chung.
  for (const [k, g] of Object.entries(study.glossary as Record<string, { r: string; m: string }>)) add(k, { word: k, reading: g.r, meaning: g.m });
  for (const v of [...VOCABULARY_DATA, ...TANGO_N5_VOCABULARY, ...TANGO_N4_VOCABULARY, ...TANGO_N3_VOCABULARY]) {
    const hit = { word: v.kanji || v.hiragana, reading: v.hiragana, meaning: v.vietnameseMeaning || v.meaning };
    if (!hit.meaning) continue;
    for (const k of new Set([v.kanji, v.hiragana].filter(Boolean) as string[])) {
      if (k.length < 2 && !/[一-龯]/.test(k)) continue; // bỏ trợ từ 1 chữ
      if (!dict.has(k)) add(k, hit);
    }
  }
  // Từ N5–N1 còn thiếu: OpenJLPT (CC BY-SA 4.0, JMdict), nghĩa tiếng Anh; chỉ bổ sung, không ghi đè.
  for (const [k, [r, m]] of Object.entries(openjlpt as Record<string, [string, string]>)) {
    if (k.length < 2 && !/[一-龯]/.test(k)) continue;
    if (!dict.has(k)) add(k, { word: k, reading: r, meaning: `(EN) ${m}`, ext: true });
  }
  return dict;
}

/** Cắt chuỗi theo khớp dài nhất với từ điển. */
export function segment(text: string): { t: string; hit?: Hit }[] {
  const d = getDict(); const out: { t: string; hit?: Hit }[] = []; let buf = '';
  for (let i = 0; i < text.length;) {
    let found = false;
    if (/[぀-ヿ一-龯]/.test(text[i])) {
      for (let L = Math.min(8, text.length - i); L >= 2 || (L === 1 && /[一-龯]/.test(text[i])); L--) {
        const hit = d.get(text.slice(i, i + L));
        if (hit) { if (buf) out.push({ t: buf }); buf = ''; out.push({ t: text.slice(i, i + L), hit }); i += L; found = true; break; }
      }
    }
    if (!found) buf += text[i++];
  }
  if (buf) out.push({ t: buf });
  return out;
}

/** Từ trong đoạn (không trùng) cho bảng từ vựng. */
export function vocabIn(text: string): Hit[] {
  const seen = new Set<string>(); const r: Hit[] = [];
  for (const s of segment(text)) if (s.hit && !seen.has(s.hit.word)) { seen.add(s.hit.word); r.push(s.hit); }
  return r;
}

/** Văn bản tiếng Nhật chạm-từ-hiện-nghĩa. */
export const TappableJa: React.FC<{ text: string; highlight?: boolean; marks?: string[] }> = ({ text, highlight, marks }) => {
  const [sel, setSel] = useState<Hit | null>(null);
  // marks: các câu dẫn tới đáp án — tô vàng khi đã hiện đáp án.
  const parts = useMemo(() => {
    const ms = (marks || []).filter(m => m && text.includes(m));
    if (!ms.length) return segment(text).map(x => ({ ...x, mark: false }));
    const re = new RegExp(`(${ms.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
    return text.split(re).flatMap((piece, i) => segment(piece).map(x => ({ ...x, mark: i % 2 === 1 })));
  }, [text, marks]);
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
          <span className="mt-1 block text-sm">{sel.meaning}</span>
          {sel.ext && <span className="mt-2 block text-[10px] text-[#786D5E]">Nguồn: OpenJLPT · JMdict (EDRDG), CC BY-SA 4.0</span>}
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
  const words = useMemo(() => open ? vocabIn(passage) : [], [open, passage]);
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
            {words.length ? <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">{words.map(w => <li key={w.word}><b>{w.word}</b> <span className="text-[#786D5E]">{w.reading}</span> — {w.meaning}</li>)}</ul> : <p className="text-[#786D5E]">Không có từ nào khớp kho từ vựng.</p>}
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
