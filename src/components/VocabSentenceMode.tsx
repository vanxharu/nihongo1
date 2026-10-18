import React, { useEffect, useState } from 'react';
import type { VocabularyItem } from '../types';

// Bỏ khoảng trắng và dấu câu để so sánh câu người học gõ với câu mẫu.
const norm = (s: string) => s.replace(/[\s。、．，,.!！?？「」『』・〜~]/g, '');

/** Đặt câu: đọc nghĩa tiếng Việt + từ gợi ý, gõ lại cả câu tiếng Nhật (bàn phím IME của người học). */
export default function VocabSentenceMode({ item, onNext }: { item: VocabularyItem; onNext: () => void }) {
  const [text, setText] = useState('');
  const [res, setRes] = useState<'ok' | 'bad' | null>(null);
  useEffect(() => { setText(''); setRes(null); }, [item]);
  const answer = item.exampleSentence || '';
  const kana = item.exampleReading || '';
  if (!answer || !item.exampleTranslation) {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-3">
        <p className="text-sm text-slate-500">Từ này chưa có câu ví dụ.</p>
        <button onClick={onNext} className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold">Từ tiếp</button>
      </div>
    );
  }
  const check = () => {
    const t = norm(text);
    setRes(t && (t === norm(answer) || (kana && t === norm(kana))) ? 'ok' : 'bad');
  };
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="text-center space-y-1">
        <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wide">Viết câu tiếng Nhật:</span>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{item.exampleTranslation}</h3>
      </div>
      <div className="text-sm text-slate-500 text-center">
        Gợi ý: <b>{item.kanji || item.hiragana}</b>（{item.hiragana}）: {item.meaning}
      </div>
      <textarea
        value={text}
        rows={2}
        disabled={res === 'ok'}
        onChange={e => { setText(e.target.value); setRes(null); }}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); res === 'ok' ? onNext() : check(); } }}
        placeholder="日本語で書いてください"
        lang="ja"
        className={`w-full rounded-xl border-2 p-3 text-lg text-slate-900 ${res === 'ok' ? 'border-emerald-500 bg-emerald-50' : res === 'bad' ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}
      />
      {res === 'bad' && <p className="text-sm text-rose-600 font-bold">Chưa đúng, thử lại hoặc xem đáp án.</p>}
      {res === 'ok' && <p className="text-sm text-emerald-700 font-bold">Chính xác! {answer}</p>}
      <div className="flex gap-2">
        {res !== 'ok' && <button onClick={() => { setText(answer); setRes('bad'); }} className="px-4 py-2.5 rounded-xl border text-sm font-bold text-slate-700 bg-white">Xem đáp án</button>}
        {res === 'ok'
          ? <button onClick={onNext} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">Từ tiếp</button>
          : <button disabled={!text.trim()} onClick={check} className="flex-1 py-2.5 rounded-xl bg-amber-600 disabled:opacity-40 text-white text-sm font-bold">Kiểm tra</button>}
      </div>
      {res === 'bad' && <button onClick={onNext} className="w-full text-xs text-slate-500 underline">Bỏ qua</button>}
    </div>
  );
}
