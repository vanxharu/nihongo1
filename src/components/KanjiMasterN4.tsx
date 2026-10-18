import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KANJI_N4_SOURCE } from '../data/kanjiMasterN4Source';
import SearchInput from './ui/SearchInput';
import KanjiSentences from './KanjiSentences';
import RAW_PAGES from '../data/kanjiMasterN4Ocr.json';
import { BookOpen, Layers, PenLine, RotateCcw, Volume2, ChevronLeft, ChevronRight, CheckCircle2, LockKeyhole, Search } from 'lucide-react';

/** Source: user-provided scanned "Kanji Master N4.pdf", chapter 1 lesson 1, PDF pages 2–6.
 * Transcribe only clearly visible material. Do not merge with legacy dictionary, vocabulary, AI, or API content.
 * Additional pages remain unpublished until they have been verified against the scan.
 */
type Entry = { glyph: string; reading: string; strokes: number; page: number };
const ENTRIES: Entry[] = [
  { glyph: '家', reading: 'いえ・や・カ', strokes: 10, page: 3 },
  { glyph: '族', reading: 'ゾク', strokes: 11, page: 3 },
  { glyph: '兄', reading: 'あに・キョウ・ケイ', strokes: 5, page: 4 },
  { glyph: '弟', reading: 'おとうと・テイ・ダイ', strokes: 7, page: 4 },
  { glyph: '姉', reading: 'あね・シ', strokes: 8, page: 5 },
  { glyph: '妹', reading: 'いもうと・マイ', strokes: 8, page: 5 },
  { glyph: '私', reading: 'わたし・シ', strokes: 7, page: 6 },
  { glyph: '育', reading: 'そだつ・そだてる・イク', strokes: 8, page: 6 },
];
const KEY = 'nihongo_kanji_pdf_n4_v1';
type Progress = { seen: string[]; written: string[]; starred: string[]; wrong: string[]; last: number; flipped: boolean; attempts: { at: string; score: number; total: number }[] };
const blank = (): Progress => ({ seen: [], written: [], starred: [], wrong: [], last: 0, flipped: false, attempts: [] });
function load(): Progress { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && Array.isArray(v.seen) ? { ...blank(), ...v } : blank(); } catch { return blank(); } }
const unique = (a: string[]) => [...new Set(a)];
function speak(s: string) { if (typeof window === 'undefined' || !('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(s); u.lang = 'ja-JP'; u.rate = .85; window.speechSynthesis.speak(u); }
function WritingPad({ glyph, onDone }: { glyph: string; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  useEffect(() => { ref.current?.getContext('2d')?.clearRect(0,0,320,320); setHasInk(false); }, [glyph]);
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); return { x:(e.clientX-r.left)*320/r.width, y:(e.clientY-r.top)*320/r.height }; };
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); const p = point(e); const ctx = ref.current!.getContext('2d')!; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.strokeStyle='#3b82f6'; ctx.lineWidth=8; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineTo(p.x+.1,p.y+.1); ctx.stroke(); setHasInk(true); };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const p = point(e); const ctx = ref.current!.getContext('2d')!; ctx.lineTo(p.x,p.y); ctx.stroke(); };
  return <div className="space-y-3"><div className="relative mx-auto w-full max-w-[320px] aspect-square rounded-3xl border-2 border-teal-200 bg-white overflow-hidden"><div className="absolute inset-0 flex items-center justify-center text-[220px] text-slate-100 select-none pointer-events-none">{glyph}</div><div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'linear-gradient(to right, transparent calc(50% - .5px), #cbd5e1 50%, transparent calc(50% + .5px)), linear-gradient(to bottom, transparent calc(50% - .5px), #cbd5e1 50%, transparent calc(50% + .5px))'}}/><canvas ref={ref} width={320} height={320} onPointerDown={start} onPointerMove={move} onPointerUp={()=>drawing.current=false} onPointerCancel={()=>drawing.current=false} className="relative w-full h-full touch-none" aria-label={'Viết chữ '+glyph}/></div><div className="flex gap-3"><button className="flex-1 rounded-xl border p-3" onClick={()=>{ref.current?.getContext('2d')?.clearRect(0,0,320,320);setHasInk(false);}}>Viết lại</button><button disabled={!hasInk} className="flex-1 rounded-xl bg-teal-700 text-white p-3 disabled:opacity-40" onClick={onDone}>Đã đối chiếu mẫu</button></div><p className="text-xs text-slate-500">Tự đối chiếu với hình và thứ tự nét trong sách (trang {ENTRIES.find(x=>x.glyph===glyph)?.page}). Không chấm tự động khi chưa có mẫu nét được xác minh.</p></div>;
}
export default function KanjiMasterN4() {
  const [progress,setProgress] = useState<Progress>(load);
  const [screen,setScreen] = useState<'home'|'cards'|'write'|'quiz'>('home');
  const [index,setIndex] = useState(()=>load().last);
  const [flipped,setFlipped] = useState(()=>load().flipped);
  const [search,setSearch] = useState('');
  const [showSourcePages,setShowSourcePages] = useState(false);
  const [pageNotes,setPageNotes] = useState<Record<number,string>>(()=>{try{return JSON.parse(localStorage.getItem('nihongo_kanji_pdf_page_notes_v1')||'{}')}catch{return {}}});
  const [editingPage,setEditingPage] = useState<number|null>(null);
  const [ocrSearch,setOcrSearch] = useState('');
  const [level,setLevel] = useState<'N5'|'N4'|'N3'|'N2'|'N1'>('N4');
  const [reviewed,setReviewed] = useState<Record<number,{status:'draft'|'checked';examples:string;mnemonic:string;meaning:string;readings:string;notes:string}>>(()=>{try{return JSON.parse(localStorage.getItem('nihon:kanji:ocr-review:v1')||'{}')}catch{return {}}});
  const [reviewPage,setReviewPage] = useState(2);
  const [reviewOpen,setReviewOpen] = useState(false);
  const [detailGlyph,setDetailGlyph] = useState<string|null>(null);
  const [detailTab,setDetailTab] = useState<'kanji'|'examples'|'vocabulary'>('kanji');
  const [studyNotes,setStudyNotes] = useState<Record<string,{meaning:string;onyomi:string;kunyomi:string;mnemonic:string;examples:string;vocabulary:string;sourcePage:number;checked:boolean}>>(()=>{try{return JSON.parse(localStorage.getItem('nihon:kanji:book-study:v1')||'{}')}catch{return {}}});
  useEffect(()=>{try{localStorage.setItem('nihon:kanji:book-study:v1',JSON.stringify(studyNotes));}catch{}},[studyNotes]);
  const detailEntry=ENTRIES.find(e=>e.glyph===detailGlyph);
  const detailNote=detailGlyph?studyNotes[detailGlyph]:undefined;
  const changeStudyNote=(key:'meaning'|'onyomi'|'kunyomi'|'mnemonic'|'examples'|'vocabulary',value:string)=>{if(!detailEntry)return;setStudyNotes(prev=>({...prev,[detailEntry.glyph]:{meaning:'',onyomi:'',kunyomi:'',mnemonic:'',examples:'',vocabulary:'',sourcePage:detailEntry.page,...prev[detailEntry.glyph],[key]:value,checked:false}}));};

  const [autoplay,setAutoplay] = useState(false);
  const [showShortcuts,setShowShortcuts] = useState(false);
  useEffect(()=>{try{localStorage.setItem('nihon:kanji:ocr-review:v1',JSON.stringify(reviewed));}catch{}},[reviewed]);
  const review = reviewed[reviewPage] || {status:'draft' as const,examples:'',mnemonic:'',meaning:'',readings:'',notes:''};
  const updateReview = (patch:Partial<typeof review>)=>setReviewed(p=>({...p,[reviewPage]:{...review,...patch}}));
  const reviewedCount = Object.values(reviewed).filter(v=>v.status==='checked').length;
  const shuffled = ()=>{setIndex(Math.floor(Math.random()*ENTRIES.length));setFlipped(false);};
  useEffect(()=>{if(screen!=='cards')return;const handler=(e:KeyboardEvent)=>{if(['INPUT','TEXTAREA'].includes((e.target as HTMLElement)?.tagName))return;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d'){next();}else if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a'){previous();}else if(e.code==='Space'){e.preventDefault();setFlipped(v=>!v);}else if(e.key.toLowerCase()==='z'){mark('seen',entry.glyph);next();}else if(e.key.toLowerCase()==='x'){mark('wrong',entry.glyph);next();}else if(e.key.toLowerCase()==='p'){setAutoplay(v=>!v);}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[screen,index]);
  useEffect(()=>{if(screen==='cards'&&autoplay)speak(entry.glyph);},[screen,index,autoplay]);
  useEffect(()=>{try{localStorage.setItem('nihongo_kanji_pdf_page_notes_v1',JSON.stringify(pageNotes))}catch{}},[pageNotes]);
  const [filter,setFilter] = useState<'all'|'starred'|'wrong'>('all');
  const [quizIndex,setQuizIndex] = useState(0);
  const [choice,setChoice] = useState<string|null>(null);
  const [results,setResults] = useState<boolean[]>([]);
  const [finished,setFinished] = useState(false);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(progress));}catch{}},[progress]);
  useEffect(()=>{setProgress(p=>({...p,last:index,flipped}));},[index,flipped]);
  const entry = ENTRIES[Math.min(index,ENTRIES.length-1)];
  const ocrPages = useMemo(()=>RAW_PAGES.filter(p=>!ocrSearch || p.text.toLowerCase().includes(ocrSearch.toLowerCase()) || String(p.page)===ocrSearch.trim()),[ocrSearch]);
  const filtered = useMemo(()=>ENTRIES.filter(x=>(filter==='all'||(filter==='starred'?progress.starred:progress.wrong).includes(x.glyph))&& (x.glyph.includes(search)||x.reading.includes(search))),[search,filter,progress]);
  const mark = (field:'seen'|'written'|'starred'|'wrong',glyph:string,remove=false)=>setProgress(p=>({...p,[field]:remove?p[field].filter(x=>x!==glyph):unique([...p[field],glyph])}));
  const next = () => { setFlipped(false); setIndex(i=>(i+1)%ENTRIES.length); };
  const previous = () => { setFlipped(false); setIndex(i=>(i+ENTRIES.length-1)%ENTRIES.length); };
  const begin = (s:'cards'|'write'|'quiz')=>{setScreen(s);if(s==='quiz'){setQuizIndex(0);setResults([]);setChoice(null);setFinished(false);}};
  const answer = ENTRIES[quizIndex];
  const options = useMemo(()=>answer ? [answer.glyph,...ENTRIES.filter(x=>x.glyph!==answer.glyph).slice(0,3).map(x=>x.glyph)].sort((a,b)=>((a.charCodeAt(0)*13+quizIndex*17)%11)-((b.charCodeAt(0)*13+quizIndex*17)%11)) : [],[quizIndex]);
  const recordAnswer = () => { if(!answer||choice===null)return;const ok=choice===answer.glyph;setResults(r=>[...r,ok]);if(!ok)mark('wrong',answer.glyph);setChoice(null);if(quizIndex===ENTRIES.length-1){setFinished(true);setProgress(p=>({...p,attempts:[...p.attempts,{at:new Date().toISOString(),score:results.filter(Boolean).length+(ok?1:0),total:ENTRIES.length}]}));}else setQuizIndex(i=>i+1);};
  const sourceReview = <section className="rounded-2xl border border-sky-200 bg-white p-4 space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-lg font-bold">Duyệt OCR · {reviewedCount}/154 trang</h3><p className="text-xs text-amber-700">OCR thô có lỗi. Chỉ đánh dấu đã đối chiếu sau khi xem bản PDF gốc.</p></div><button className="rounded-lg bg-sky-600 px-3 py-2 text-white" onClick={()=>setReviewOpen(v=>!v)}>{reviewOpen?'Thu gọn':'Mở duyệt OCR'}</button></div>{reviewOpen&&<><div className="flex items-center gap-2"><button onClick={()=>setReviewPage(p=>Math.max(1,p-1))} className="rounded-lg border p-2">←</button><select aria-label="Chọn trang OCR" value={reviewPage} onChange={e=>setReviewPage(Number(e.target.value))} className="flex-1 rounded-lg border p-2">{RAW_PAGES.map(p=><option key={p.page} value={p.page}>Trang {p.page} {reviewed[p.page]?.status==='checked'?'✓':''}</option>)}</select><button onClick={()=>setReviewPage(p=>Math.min(154,p+1))} className="rounded-lg border p-2">→</button></div><pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-100 p-3 text-xs">{RAW_PAGES[reviewPage-1]?.text||'Không có OCR'}</pre>{([['meaning','Ý nghĩa / Hán Việt'],['readings','Âm On / Kun'],['examples','Ví dụ trong sách'],['mnemonic','Mẹo nhớ trong sách'],['notes','Ghi chú đối chiếu PDF']] as const).map(([key,label])=><label key={key} className="block text-sm font-semibold">{label}<textarea className="mt-1 block min-h-16 w-full rounded-xl border p-2 font-normal" value={review[key]} onChange={e=>updateReview({[key]:e.target.value})} placeholder="Chỉ chép nội dung đọc rõ từ trang PDF, không suy đoán"/></label>)}<div className="flex flex-wrap items-center gap-2"><button onClick={()=>updateReview({status:'draft'})} className="rounded-lg border px-3 py-2">Lưu bản nháp</button><button onClick={()=>{updateReview({status:'checked'});setReviewPage(p=>Math.min(154,p+1));}} className="rounded-lg bg-emerald-600 px-3 py-2 text-white">Đã đối chiếu PDF · trang tiếp →</button></div><p className="text-xs text-slate-500">Dữ liệu duyệt lưu trong trình duyệt này. Không tự nhập vào thẻ hoặc kiểm tra cho đến khi có bộ dữ liệu được xác thực và xuất bản.</p></>}</section>;
  const nav = <button onClick={()=>setScreen('home')} className="text-teal-700 font-semibold text-sm flex items-center gap-1"><ChevronLeft size={18}/> Về danh sách bài</button>;
  return <div className="mx-auto max-w-5xl px-3 sm:px-5 py-5 text-slate-800 space-y-5">
    <div className="kmn4-hero rounded-3xl bg-gradient-to-br from-[#123e46] via-[#17656a] to-[#27918b] text-white p-6 sm:p-8 shadow-lg"><p className="text-xs font-bold tracking-[.2em] text-teal-100">KANJI MASTER · GIÁO TRÌNH N4</p><h1 className="text-3xl sm:text-4xl font-black mt-2">Học Kanji theo sách</h1><p className="mt-2 text-teal-50/90 max-w-xl">Flashcard, luyện viết và kiểm tra theo đúng thứ tự nội dung đã đối chiếu từ PDF. Không sử dụng kho Kanji cũ.</p><div className="grid grid-cols-3 gap-3 mt-6"><div><div className="text-2xl font-black">{progress.seen.length}/8</div><div className="text-xs text-teal-100">Chữ đã xem</div></div><div><div className="text-2xl font-black">{progress.written.length}/8</div><div className="text-xs text-teal-100">Đã luyện viết</div></div><div><div className="text-2xl font-black">{progress.attempts.length}</div><div className="text-xs text-teal-100">Lượt kiểm tra</div></div></div></div>
    {screen==='home' && <div className="space-y-4">
      <section className="rounded-2xl border border-sky-100 p-4 sm:p-6" style={{backgroundImage:'linear-gradient(90deg,rgba(219,239,255,.85) 1px,transparent 1px),linear-gradient(rgba(219,239,255,.85) 1px,transparent 1px)',backgroundSize:'36px 36px',backgroundColor:'#eaf5ff'}}>
       <h2 className="mb-4 text-xl font-bold">Khám phá Kanji theo trình độ</h2>
       <div className="grid grid-cols-3 gap-2">{(['N5','N4','N3','N2','N1'] as const).map(l=><button key={l} onClick={()=>setLevel(l)} className={`rounded-xl border p-3 font-bold ${level===l?'border-emerald-300 bg-emerald-100 text-emerald-800':'border-white bg-white/70 text-slate-500'}`}>{l}{l!=='N4'&&<span className="ml-1 text-xs">◇</span>}</button>)}<div className="rounded-xl border bg-white/70 p-3 text-center text-sm">Bộ thủ</div></div>
       <div className="mt-5 rounded-2xl border border-white/70 bg-white/65 p-4">
        <div className="mb-4 flex flex-wrap justify-center gap-3"><button onClick={()=>begin('cards')} className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-3 font-semibold text-emerald-800"><Layers size={18}/> Flashcard</button><button onClick={()=>begin('write')} className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-3 font-semibold text-emerald-800"><PenLine size={18}/> Luyện viết</button><button onClick={()=>begin('quiz')} className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-3 font-semibold text-emerald-800"><CheckCircle2 size={18}/> Kiểm tra</button></div>
        {level==='N4'?<><p className="mb-3 text-xs text-slate-600">Kanji Master N4 · Chạm vào chữ để xem Kanji, mẹo nhớ, ví dụ và từ vựng · 154 trang OCR cần đối chiếu</p><div className="mb-3 flex gap-2"><SearchInput className="min-w-0 flex-1" value={search} onChange={setSearch} placeholder="Tìm Kanji hoặc cách đọc" count={filtered.length}/><select aria-label="Bộ lọc" value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} className="rounded-lg border px-2"><option value="all">Tất cả</option><option value="starred">Đã lưu</option><option value="wrong">Cần ôn</option></select></div><div className="grid grid-cols-4 gap-2 sm:grid-cols-8">{filtered.map(x=><button key={x.glyph} onClick={()=>{setDetailGlyph(x.glyph);setDetailTab('kanji');}} className="aspect-square rounded-lg border border-emerald-200 bg-emerald-50 text-center text-3xl text-emerald-800 hover:bg-emerald-200">{x.glyph}</button>)}</div></>:<p className="rounded-xl bg-white p-4 text-sm text-slate-600">Chưa có bộ dữ liệu {level} đã xác minh trong giáo trình Kanji Master N4. Không hiển thị chữ từ nguồn ngoài.</p>}
       </div>
      </section>
      {detailEntry && <section className="rounded-3xl border border-teal-200 bg-white shadow-sm overflow-hidden" aria-label="Chi tiết Kanji theo giáo trình">
        <div className="flex items-center justify-between bg-teal-50 p-4"><div><p className="text-xs font-bold tracking-widest text-teal-700">KANJI MASTER N4 · BÀI 1</p><h3 className="mt-1 text-lg font-bold">Học chữ {detailEntry.glyph} theo sách</h3></div><button onClick={()=>setDetailGlyph(null)} aria-label="Đóng chi tiết" className="rounded-full border bg-white px-3 py-2">✕</button></div>
        <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr]"><div className="flex flex-col items-center justify-center rounded-2xl border bg-slate-50 p-5"><span lang="ja" className="text-8xl text-slate-800">{detailEntry.glyph}</span><button onClick={()=>speak(detailEntry.glyph)} className="mt-3 flex items-center gap-2 rounded-xl bg-teal-100 px-3 py-2 text-teal-800"><Volume2 size={17}/> Nghe chữ</button><span className="mt-3 text-xs text-slate-500">Trang sách {detailEntry.page}</span></div>
          <div className="space-y-3"><div className="grid grid-cols-3 gap-2">{([['kanji','Kanji'],['examples','Ví dụ'],['vocabulary','Từ vựng']] as const).map(([id,label])=><button key={id} onClick={()=>setDetailTab(id)} className={`rounded-xl px-2 py-3 text-sm font-bold ${detailTab===id?'bg-teal-700 text-white':'bg-slate-100 text-slate-600'}`}>{label}</button>)}</div>
          {detailTab==='kanji'&&<div className="space-y-3"><div className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-xl bg-slate-50 p-3"><span className="text-xs text-slate-500">Cách đọc đã ghi</span><p className="font-semibold">{detailEntry.reading}</p></div><div className="rounded-xl bg-slate-50 p-3"><span className="text-xs text-slate-500">Số nét (chưa đối chiếu)</span><p className="font-semibold">{detailEntry.strokes}</p></div></div>{([['meaning','Ý nghĩa / Hán Việt'],['onyomi','Âm On trong sách'],['kunyomi','Âm Kun trong sách'],['mnemonic','Mẹo nhớ theo sách']] as const).map(([key,label])=><label key={key} className="block text-sm font-semibold">{label}<textarea value={detailNote?.[key]||''} onChange={e=>changeStudyNote(key,e.target.value)} placeholder="Chưa được chép và xác minh từ PDF" className="mt-1 min-h-14 w-full rounded-xl border p-3 font-normal"/></label>)}</div>}
          {detailTab==='examples'&&<label className="block text-sm font-semibold">Ví dụ và câu mẫu trong sách<textarea value={detailNote?.examples||''} onChange={e=>changeStudyNote('examples',e.target.value)} placeholder="Ghi đúng câu tiếng Nhật, cách đọc và nghĩa trong sách; mỗi ví dụ một dòng" className="mt-2 min-h-44 w-full rounded-xl border p-3 font-normal"/></label>}
          {detailTab==='vocabulary'&&<label className="block text-sm font-semibold">Từ vựng đi kèm chữ Kanji<textarea value={detailNote?.vocabulary||''} onChange={e=>changeStudyNote('vocabulary',e.target.value)} placeholder="Từ vựng · cách đọc · nghĩa theo sách; mỗi từ một dòng" className="mt-2 min-h-44 w-full rounded-xl border p-3 font-normal"/></label>}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{detailNote?.checked?'Đã được người học đánh dấu đối chiếu với sách.':'Nội dung bổ sung là ghi chú học tập, chưa được xác minh với PDF. Không tự động dùng làm đáp án kiểm tra.'}</div>
          <button onClick={()=>{if(!detailEntry)return;setStudyNotes(p=>({...p,[detailEntry.glyph]:{meaning:'',onyomi:'',kunyomi:'',mnemonic:'',examples:'',vocabulary:'',sourcePage:detailEntry.page,...p[detailEntry.glyph],checked:true}}));}} className="rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800">Tôi đã đối chiếu nội dung với sách</button>
          </div></div></section>}
      <KanjiSentences />
      {sourceReview}
      <section className="rounded-2xl border bg-white p-4"><div className="flex items-center gap-2 font-bold"><Search size={18}/> OCR gốc · 154 trang</div><p className="mt-1 text-xs text-amber-700">Bản nhận dạng thô, chưa xác minh; có thể sai Kanji, ví dụ và mẹo nhớ.</p><SearchInput className="mt-3" value={ocrSearch} onChange={setOcrSearch} placeholder="Tìm nội dung OCR hoặc số trang" count={ocrPages.length}/><div className="mt-3 max-h-72 space-y-2 overflow-auto">{ocrPages.map(p=><details key={p.page} className="rounded-lg border p-2"><summary className="cursor-pointer text-sm font-semibold">Trang {p.page} · {reviewed[p.page]?.status==='checked'?'Đã đánh dấu đối chiếu':'Chưa duyệt'}</summary><pre className="mt-2 whitespace-pre-wrap text-xs">{p.text||'Không đọc được'}</pre><button onClick={()=>{setReviewPage(p.page);setReviewOpen(true);}} className="mt-2 text-sm text-sky-700 underline">Duyệt trang này</button></details>)}</div></section>
    </div>}
    {screen==='cards' && <div className="space-y-3">{nav}
     <div className="relative overflow-hidden rounded-[30px] bg-[#303b60] text-white shadow-2xl">
      <div className="flex justify-between p-4"><span className="text-xs text-slate-300">Kanji Master N4 · Bài 1</span><button aria-label="Yêu thích" onClick={()=>mark('starred',entry.glyph,progress.starred.includes(entry.glyph))} className="text-2xl text-amber-300">{progress.starred.includes(entry.glyph)?'★':'☆'}</button></div>
      <button onClick={()=>{setFlipped(v=>!v);mark('seen',entry.glyph);}} className="flex min-h-[340px] w-full flex-col items-center justify-center gap-5 px-5 text-center">
       <span lang="ja" className="text-[112px] leading-none font-normal">{entry.glyph}</span>
       {flipped?<><span className="text-2xl text-slate-200">{entry.reading}</span><span className="text-sm text-amber-300">PDF trang {entry.page} · {entry.strokes} nét</span><span className="text-xs text-slate-300">Ý nghĩa, ví dụ và mẹo nhớ: xem bản đối chiếu PDF ở trang chủ</span></>:<span className="text-sm text-slate-400">Nhấn vào thẻ để lật</span>}
      </button>
      <div className="border-t border-white/10 bg-[#374368] p-3 text-center text-sm text-slate-300">Vuốt hoặc nhấn vào thẻ để lật</div>
      <div className="flex items-center justify-around gap-1 bg-[#1c2541] p-3">
       <button aria-label="Chưa biết" onClick={()=>{mark('wrong',entry.glyph);next();}} className="rounded-full bg-rose-950 px-3 py-2 text-rose-400">✕</button>
       <span className="text-sm tabular-nums">{index+1} / {ENTRIES.length}</span>
       <button aria-label="Đã biết" onClick={()=>{mark('seen',entry.glyph);next();}} className="rounded-full bg-emerald-950 px-3 py-2 text-emerald-400">✓</button>
       <span className="rounded-xl bg-white/10 px-2 py-2 text-xs">JP→Đọc</span>
       <button aria-label="Viết lại thẻ" onClick={()=>setFlipped(false)} className="p-2"><RotateCcw size={18}/></button>
       <button aria-label="Phát âm" onClick={()=>speak(entry.glyph)} className="p-2"><Volume2 size={18}/></button>
       <button aria-label="Xáo trộn" onClick={shuffled} className="p-2">⤨</button>
       <button aria-label="Phím tắt" onClick={()=>setShowShortcuts(v=>!v)} className="p-2">⚙</button>
      </div>
     </div>
     {showShortcuts&&<div className="rounded-xl border bg-white p-4 text-sm"><h3 className="font-bold">Phím tắt bàn phím</h3><p>← / A: Thẻ trước · → / D: Thẻ tiếp · Space: Lật thẻ · Z: Đã biết · X: Chưa biết · P: Tự động đọc</p><button onClick={()=>setAutoplay(v=>!v)} className="mt-2 rounded-lg bg-sky-100 p-2">{autoplay?'Tắt tự động đọc':'Bật tự động đọc'}</button></div>}
     <div className="flex gap-2"><button onClick={previous} className="flex-1 rounded-xl border bg-white p-3">← Trước</button><button onClick={()=>begin('write')} className="flex-1 rounded-xl border bg-white p-3">Luyện viết</button><button onClick={next} className="flex-1 rounded-xl border bg-white p-3">Tiếp →</button></div>
    </div>}
    {screen==='write' && <div className="mx-auto max-w-xl space-y-5">{nav}<header className="flex items-center justify-between rounded-xl bg-white p-3"><h2 className="text-xl font-bold">✍ Luyện viết</h2><span className="text-slate-500">{index+1}/{ENTRIES.length}</span></header><div className="py-4 text-center"><p className="text-3xl font-bold text-blue-600">{entry.glyph}</p><p className="mt-2 text-sm text-slate-500">Trang PDF {entry.page} · {entry.strokes} nét (chưa có dữ liệu nét động)</p></div><WritingPad glyph={entry.glyph} onDone={()=>{mark('written',entry.glyph);next();}}/><div className="flex gap-2"><button onClick={previous} className="flex-1 rounded-xl border bg-white p-3">← Chữ trước</button><button onClick={next} className="flex-1 rounded-xl bg-blue-500 p-3 font-bold text-white">Chữ tiếp theo →</button></div><p className="text-center text-xs text-slate-500">Có thể viết tự do trên ô. Chưa hỗ trợ kiểm tra thứ tự nét tự động vì chưa có mẫu nét đã đối chiếu.</p></div>}
    {screen==='quiz' && <>{nav}<div className="rounded-2xl border bg-white p-6 space-y-5">{finished?<><h2 className="text-2xl font-black">Đã hoàn thành!</h2><p>Kết quả: {results.filter(Boolean).length}/{ENTRIES.length}. Kết quả được lưu trên thiết bị.</p><button onClick={()=>begin('quiz')} className="rounded-xl bg-teal-700 text-white px-5 py-3 flex items-center gap-2"><RotateCcw size={18}/> Làm lại</button></>:<><div className="flex justify-between text-sm text-slate-500"><span>Chọn chữ tương ứng với cách đọc trong sách</span><span>{quizIndex+1}/{ENTRIES.length}</span></div><h2 className="text-3xl font-bold text-center py-5">{answer.reading}</h2><div className="grid grid-cols-2 gap-3">{options.map(g=><button key={g} onClick={()=>setChoice(g)} className={`rounded-xl border-2 py-5 text-5xl ${choice===g?'border-teal-700 bg-teal-50':'border-slate-100'}`}>{g}</button>)}</div><button disabled={!choice} onClick={recordAnswer} className="w-full rounded-xl bg-teal-700 text-white py-3 font-semibold disabled:opacity-40">Xác nhận đáp án →</button></>}</div></>}
    <p className="text-xs text-slate-500">Tiến độ của giao diện mới được lưu riêng trên thiết bị; dữ liệu cũ không được đưa vào nội dung học. Nội dung chưa đối chiếu PDF không được công bố.</p>
  </div>;
}
