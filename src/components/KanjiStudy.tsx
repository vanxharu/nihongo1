import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ListChecks, Keyboard, Languages, PenLine, FileText, Volume2, RotateCcw, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import SearchPicker from './ui/SearchPicker';
import KanjiSentences from './KanjiSentences';
import KanjiBookPages from './KanjiBookPages';
import { KANJI_MASTER_N4, masterKanjiInfo } from '../data/kanjiMasterN4';

type Mode = 'card' | 'quiz' | 'type' | 'words' | 'sentence' | 'book';
const MODES: { id: Mode; label: string; Icon: typeof BookOpen }[] = [
  { id: 'card', label: 'Lật thẻ', Icon: BookOpen },
  { id: 'quiz', label: 'Trắc nghiệm', Icon: ListChecks },
  { id: 'type', label: 'Luyện gõ', Icon: Keyboard },
  { id: 'words', label: 'Từ ghép', Icon: Languages },
  { id: 'sentence', label: 'Đặt câu', Icon: PenLine },
  { id: 'book', label: 'Trang sách', Icon: FileText },
];
const LS = 'nihon:kanji:study:v1'; // { known: string[] }
const loadKnown = (): string[] => { try { return JSON.parse(localStorage.getItem(LS) || '{}').known || []; } catch { return []; } };
const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const speak = (t: string) => { try { const u = new SpeechSynthesisUtterance(t); u.lang = 'ja-JP'; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* ignore */ } };
const toHira = (s: string) => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const kunBase = (k: string) => k.split(',').map(x => x.trim()).filter(Boolean);
const readingsOf = (g: string): string[] => {
  const i = masterKanjiInfo(g); if (!i) return [];
  const on = i.onyomi.split(',').map(x => x.trim()).filter(Boolean);
  const kun = kunBase(i.kunyomi);
  return [...on, ...kun, ...kun.map(k => k.split('.')[0])].map(r => toHira(r.replace(/[.\-]/g, ''))).filter(Boolean);
};
const meaningOf = (g: string) => masterKanjiInfo(g)?.meaning || '';

const INK = '#f1f5f9';
export default function KanjiStudy() {
  const [lessonId, setLessonId] = useState(KANJI_MASTER_N4[0].id);
  const [mode, setMode] = useState<Mode>('card');
  const [known, setKnown] = useState<string[]>(loadKnown);
  useEffect(() => { try { localStorage.setItem(LS, JSON.stringify({ known })); } catch { /* ignore */ } }, [known]);
  const lesson = KANJI_MASTER_N4.find(l => l.id === lessonId)!;
  const total = KANJI_MASTER_N4.reduce((n, l) => n + l.kanji.length, 0);
  const doneHere = lesson.kanji.filter(k => known.includes(k)).length;
  const [jump, setJump] = useState(0);
  const groups = useMemo(() => {
    const m = new Map<number, { label: string; items: { value: string; label: string }[] }>();
    for (const l of KANJI_MASTER_N4) {
      if (!m.has(l.chapter)) m.set(l.chapter, { label: `Chương ${l.chapter} · ${l.chapterTitle}`, items: [] });
      m.get(l.chapter)!.items.push({ value: l.id, label: `Bài ${l.id} · ${l.title} (${l.kanji.join('')})` });
    }
    return [...m.values()];
  }, []);
  const mark = (g: string, ok: boolean) => setKnown(k => ok ? (k.includes(g) ? k : [...k, g]) : k.filter(x => x !== g));
  const pick = (id: string) => { setLessonId(id); setJump(0); };

  return (
    <div className="mx-auto w-full max-w-[780px] px-3 py-4 space-y-3">
      <div className="rounded-3xl p-4 space-y-3" style={{ background: '#1c2541', color: INK }}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold tracking-[.2em]" style={{ color: '#7dd3fc' }}>KANJI MASTER N4</p>
            <h2 className="text-lg font-black">Bài {lesson.id} · {lesson.title}</h2>
          </div>
          <div className="text-right text-xs" style={{ color: '#cbd5e1' }}><b className="text-base" style={{ color: INK }}>{known.length}</b>/{total} chữ đã thuộc</div>
        </div>
        <SearchPicker value={lessonId} onChange={pick} groups={groups} placeholder="Tìm bài hoặc chữ Hán…" />
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#2b3353' }}><div className="h-full bg-emerald-500 transition-all" style={{ width: `${(doneHere / lesson.kanji.length) * 100}%` }} /></div>
        <div className="flex flex-wrap gap-1.5">
          {lesson.kanji.map((k, i) => (
            <button key={k} onClick={() => { setJump(i); setMode('card'); }} lang="ja" aria-label={`Chữ ${k}`}
              className="min-h-[44px] min-w-[44px] rounded-xl text-xl font-bold border"
              style={{ background: known.includes(k) ? '#065f46' : '#2b3353', borderColor: i === jump && mode === 'card' ? '#38bdf8' : 'transparent', color: INK }}>{k}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-0.5 p-0.5 rounded-2xl border" style={{ background: '#151a2e', borderColor: '#2b3353' }} role="tablist">
        {MODES.map(({ id, label, Icon }) => (
          <button key={id} role="tab" aria-selected={mode === id} onClick={() => setMode(id)}
            className={`min-h-[48px] rounded-xl flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 text-[10.5px] sm:text-xs font-bold ${mode === id ? 'bg-blue-600 ring-1 ring-blue-400/50' : 'hover:bg-[#1f2642]'}`}
            style={{ color: mode === id ? '#fff' : '#94a3b8' }}>
            <Icon className="w-4 h-4 shrink-0" /><span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {mode === 'card' && <Cards key={lesson.id} glyphs={lesson.kanji} start={jump} known={known} mark={mark} />}
      {mode === 'quiz' && <Quiz key={lesson.id} glyphs={lesson.kanji} mark={mark} />}
      {mode === 'type' && <TypeMode key={lesson.id} glyphs={lesson.kanji} mark={mark} />}
      {mode === 'words' && <Words key={lesson.id} words={lesson.words} />}
      {mode === 'sentence' && <KanjiSentences />}
      {mode === 'book' && <KanjiBookPages lessonId={lessonId} />}
    </div>
  );
}

function Cards({ glyphs, start, known, mark }: { glyphs: string[]; start: number; known: string[]; mark: (g: string, ok: boolean) => void }) {
  const [order, setOrder] = useState(glyphs);
  const [i, setI] = useState(Math.min(start, glyphs.length - 1));
  const [flip, setFlip] = useState(false);
  const g = order[i]; const info = masterKanjiInfo(g);
  const go = (d: number) => { setFlip(false); setI(x => (x + d + order.length) % order.length); };
  return (
    <div className="rounded-[30px] overflow-hidden shadow-2xl" style={{ background: '#303b60', color: INK }}>
      <button onClick={() => setFlip(f => !f)} className="w-full min-h-[340px] flex flex-col items-center justify-center gap-3 px-5 text-center" aria-label="Lật thẻ">
        <span lang="ja" className="text-[112px] leading-none">{g}</span>
        {flip ? (<>
          <span className="text-2xl font-black" style={{ color: '#fbbf24' }}>{info?.han_viet}</span>
          <span className="text-base" style={{ color: '#e2e8f0' }}>{info?.meaning}</span>
          <span lang="ja" className="text-sm" style={{ color: '#cbd5e1' }}>音 {info?.onyomi || '—'} ・ 訓 {info?.kunyomi || '—'}</span>
          <span className="text-xs" style={{ color: '#94a3b8' }}>{info?.strokes ?? '?'} nét</span>
        </>) : <span className="text-sm" style={{ color: '#94a3b8' }}>Chạm để lật</span>}
      </button>
      <div className="flex items-center justify-around p-3" style={{ background: '#1c2541' }}>
        <button aria-label="Chưa thuộc" onClick={() => { mark(g, false); go(1); }} className="min-h-[44px] min-w-[44px] rounded-full bg-rose-950 text-rose-300 text-lg">✕</button>
        <button aria-label="Thẻ trước" onClick={() => go(-1)} className="min-h-[44px] min-w-[44px] grid place-items-center"><ChevronLeft /></button>
        <span className="text-sm tabular-nums">{i + 1} / {order.length}{known.includes(g) ? ' ✓' : ''}</span>
        <button aria-label="Thẻ tiếp" onClick={() => go(1)} className="min-h-[44px] min-w-[44px] grid place-items-center"><ChevronRight /></button>
        <button aria-label="Đã thuộc" onClick={() => { mark(g, true); go(1); }} className="min-h-[44px] min-w-[44px] rounded-full bg-emerald-950 text-emerald-300 text-lg">✓</button>
      </div>
      <div className="flex justify-center gap-2 p-2" style={{ background: '#1c2541' }}>
        <button aria-label="Phát âm" onClick={() => speak(g)} className="min-h-[44px] min-w-[44px] grid place-items-center"><Volume2 size={18} /></button>
        <button aria-label="Xáo trộn" onClick={() => { setOrder(shuffle(glyphs)); setI(0); setFlip(false); }} className="min-h-[44px] min-w-[44px] grid place-items-center"><Shuffle size={18} /></button>
        <button aria-label="Về đầu" onClick={() => { setOrder(glyphs); setI(0); setFlip(false); }} className="min-h-[44px] min-w-[44px] grid place-items-center"><RotateCcw size={18} /></button>
      </div>
    </div>
  );
}

const ALL = KANJI_MASTER_N4.flatMap(l => l.kanji);
type Q = { prompt: string; big: boolean; answer: string; options: string[]; glyph: string };
function buildQuiz(glyphs: string[]): Q[] {
  return shuffle(glyphs).map((g, n) => {
    const kind = n % 3; // 0 chữ→nghĩa, 1 chữ→Hán Việt, 2 nghĩa→chữ
    const others = shuffle(ALL.filter(x => x !== g));
    const f = kind === 0 ? meaningOf : (x: string) => masterKanjiInfo(x)?.han_viet || '';
    if (kind === 2) return { glyph: g, prompt: meaningOf(g), big: false, answer: g, options: shuffle([g, ...others.slice(0, 3)]) };
    const ans = f(g);
    const opts = [...new Set(others.map(f).filter(x => x && x !== ans))].slice(0, 3);
    return { glyph: g, prompt: g, big: true, answer: ans, options: shuffle([ans, ...opts]) };
  });
}
function Quiz({ glyphs, mark }: { glyphs: string[]; mark: (g: string, ok: boolean) => void }) {
  const [qs, setQs] = useState(() => buildQuiz(glyphs));
  const [i, setI] = useState(0); const [sel, setSel] = useState<string | null>(null); const [score, setScore] = useState(0);
  if (i >= qs.length) return (
    <Panel><div className="text-center space-y-3 py-6"><div className="text-4xl font-black text-emerald-400">{score}/{qs.length}</div>
      <button onClick={() => { setQs(buildQuiz(glyphs)); setI(0); setScore(0); setSel(null); }} className="min-h-[44px] px-5 rounded-xl bg-blue-600 font-bold" style={{ color: '#fff' }}>Làm lại</button></div></Panel>);
  const q = qs[i];
  const pickA = (o: string) => { if (sel) return; setSel(o); const ok = o === q.answer; if (ok) setScore(s => s + 1); mark(q.glyph, ok); };
  return (
    <Panel>
      <div className="text-xs font-mono" style={{ color: '#94a3b8' }}>{i + 1}/{qs.length}</div>
      <div lang="ja" className={`text-center ${q.big ? 'text-8xl' : 'text-2xl font-bold'} py-4`}>{q.prompt}</div>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map(o => {
          const st = !sel ? '#2b3353' : o === q.answer ? '#065f46' : o === sel ? '#9f1239' : '#2b3353';
          return <button key={o} lang="ja" onClick={() => pickA(o)} className="min-h-[56px] rounded-xl px-2 font-bold text-base" style={{ background: st, color: INK }}>{o}</button>;
        })}
      </div>
      {sel && <button onClick={() => { setI(i + 1); setSel(null); }} className="w-full min-h-[44px] rounded-xl bg-blue-600 font-bold" style={{ color: '#fff' }}>Tiếp →</button>}
    </Panel>
  );
}

function TypeMode({ glyphs, mark }: { glyphs: string[]; mark: (g: string, ok: boolean) => void }) {
  const [order, setOrder] = useState(() => shuffle(glyphs));
  const [i, setI] = useState(0); const [val, setVal] = useState(''); const [res, setRes] = useState<boolean | null>(null); const [score, setScore] = useState(0);
  if (i >= order.length) return (
    <Panel><div className="text-center space-y-3 py-6"><div className="text-4xl font-black text-emerald-400">{score}/{order.length}</div>
      <button onClick={() => { setOrder(shuffle(glyphs)); setI(0); setScore(0); setRes(null); setVal(''); }} className="min-h-[44px] px-5 rounded-xl bg-blue-600 font-bold" style={{ color: '#fff' }}>Làm lại</button></div></Panel>);
  const g = order[i]; const info = masterKanjiInfo(g);
  const check = () => { const ok = readingsOf(g).includes(toHira(val.trim())); setRes(ok); if (ok) setScore(s => s + 1); mark(g, ok); };
  return (
    <Panel>
      <div className="text-xs font-mono" style={{ color: '#94a3b8' }}>{i + 1}/{order.length}</div>
      <div lang="ja" className="text-center text-8xl py-2">{g}</div>
      <div className="text-center text-sm" style={{ color: '#cbd5e1' }}>{info?.meaning} · gõ một cách đọc bằng hiragana</div>
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { res === null ? check() : (setI(i + 1), setVal(''), setRes(null)); } }}
        disabled={res !== null} lang="ja" autoFocus aria-label="Cách đọc" placeholder="ひらがな"
        className="w-full min-h-[48px] rounded-xl px-3 text-lg text-center border" style={{ background: '#151a2e', color: INK, borderColor: res === null ? '#2b3353' : res ? '#10b981' : '#f43f5e' }} />
      {res !== null && <div lang="ja" className="text-center text-sm" style={{ color: res ? '#6ee7b7' : '#fda4af' }}>{res ? 'Đúng!' : 'Chưa đúng'} · 音 {info?.onyomi || '—'} ・ 訓 {info?.kunyomi || '—'}</div>}
      {res === null
        ? <button disabled={!val.trim()} onClick={check} className="w-full min-h-[44px] rounded-xl bg-blue-600 font-bold disabled:opacity-40" style={{ color: '#fff' }}>Kiểm tra</button>
        : <button onClick={() => { setI(i + 1); setVal(''); setRes(null); }} className="w-full min-h-[44px] rounded-xl bg-blue-600 font-bold" style={{ color: '#fff' }}>Tiếp →</button>}
    </Panel>
  );
}

function Words({ words }: { words: { word: string; reading: string; meaning: string }[] }) {
  const [hide, setHide] = useState(false);
  const [open, setOpen] = useState<string[]>([]);
  return (
    <Panel>
      <div className="flex items-center justify-between"><b>Từ ghép của bài ({words.length})</b>
        <button onClick={() => { setHide(h => !h); setOpen([]); }} className="min-h-[44px] px-3 rounded-lg text-xs font-bold" style={{ background: '#2b3353', color: INK }}>{hide ? 'Hiện nghĩa' : 'Ẩn nghĩa'}</button></div>
      <ul className="space-y-1.5">
        {words.map(w => { const show = !hide || open.includes(w.word); return (
          <li key={w.word}><button onClick={() => setOpen(o => o.includes(w.word) ? o.filter(x => x !== w.word) : [...o, w.word])} className="w-full min-h-[48px] flex items-center justify-between gap-2 rounded-xl px-3 text-left" style={{ background: '#2b3353', color: INK }}>
            <span lang="ja" className="text-xl font-bold">{w.word}</span>
            <span className="text-xs text-right" style={{ color: '#cbd5e1' }}>{show ? <><span lang="ja">{w.reading}</span> · {w.meaning}</> : '•••'}</span>
          </button></li>); })}
      </ul>
    </Panel>
  );
}

const Panel = ({ children }: { children: React.ReactNode }) => <div className="rounded-[24px] p-4 space-y-3 shadow-xl" style={{ background: '#303b60', color: INK }}>{children}</div>;
