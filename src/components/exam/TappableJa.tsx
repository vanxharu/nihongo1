import React, { useMemo, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { TANGO_N3_VOCABULARY, TANGO_N4_VOCABULARY, TANGO_N5_VOCABULARY, VOCABULARY_DATA } from '../../data';
import { getDokkaiTranslation } from '../../data/dokkaiTranslations';
import { speakJapanese } from '../../utils/audio';

export interface Hit { word: string; reading: string; meaning: string }
type Dict = Map<string, Hit>;
let dict: Dict | null = null;
const SUFFIX = 'いるうくぐすつぬぶむ';

// Từ điển tra nhanh dựng từ kho từ vựng sẵn có (N5–N3 + từ riêng); dựng 1 lần khi cần.
function getDict(): Dict {
  if (dict) return dict;
  dict = new Map();
  for (const v of [...VOCABULARY_DATA, ...TANGO_N5_VOCABULARY, ...TANGO_N4_VOCABULARY, ...TANGO_N3_VOCABULARY]) {
    const hit = { word: v.kanji || v.hiragana, reading: v.hiragana, meaning: v.vietnameseMeaning || v.meaning };
    if (!hit.meaning) continue;
    for (const k of new Set([v.kanji, v.hiragana].filter(Boolean) as string[])) {
      if (k.length < 2 && !/[一-龯]/.test(k)) continue; // bỏ trợ từ 1 chữ
      if (!dict.has(k)) dict.set(k, hit);
      // dạng chia: bỏ đuôi (楽しい → 楽し) để khớp 楽しかった
      if (k.length >= 3 && SUFFIX.includes(k.slice(-1)) && !dict.has(k.slice(0, -1))) dict.set(k.slice(0, -1), hit);
    }
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
export const TappableJa: React.FC<{ text: string; highlight?: boolean }> = ({ text, highlight }) => {
  const [sel, setSel] = useState<Hit | null>(null);
  const parts = useMemo(() => segment(text), [text]);
  return (
    <>
      {parts.map((p, i) => p.hit
        ? <button key={i} type="button" onClick={e => { e.stopPropagation(); setSel(p.hit!); }} className={`cursor-pointer border-b border-dotted border-[#F4A643] ${highlight ? 'bg-[#FEF3C7]' : ''}`}>{p.t}</button>
        : <React.Fragment key={i}>{p.t}</React.Fragment>)}
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
        </span>
      )}
    </>
  );
};

/** Bảng từ vựng + dịch từng câu của bài đọc. */
export const ReadingHelper: React.FC<{ qid: string; passage: string; question: string }> = ({ qid, passage, question }) => {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const words = useMemo(() => open ? vocabIn(passage) : [], [open, passage]);
  const tr = useMemo(() => {
    const e = getDokkaiTranslation(qid, question + passage);
    // chỉ nhận bản dịch khi các câu của nó thật sự nằm trong đoạn này
    return e && e.sentenceBreakdown.length && e.sentenceBreakdown.every(s => passage.replace(/\s/g, '').includes(s.ja.replace(/\s/g, '').slice(0, 8))) ? e : undefined;
  }, [qid, passage, question]);
  const sentences = useMemo(() => passage.split(/(?<=[。！？])/).map(s => s.trim()).filter(Boolean), [passage]);
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
            {sentences.map((s, i) => (
              <div key={i}>
                <button type="button" onClick={() => setSent(sent === i ? null : i)} className={`text-left leading-7 cursor-pointer ${sent === i ? 'bg-[#FEF3C7]' : ''}`}>{s}</button>
                {sent === i && <p className="text-[13px] text-[#047857] pl-3">{tr?.sentenceBreakdown.find(b => s.replace(/\s/g, '').startsWith(b.ja.replace(/\s/g, '').slice(0, 8)))?.vi ?? 'Chưa có bản dịch cho câu này.'}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
