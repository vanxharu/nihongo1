import React, { useEffect, useMemo, useState } from 'react';
import type { ShadowingCue, ShadowingAnalysis } from '../../utils/shadowing';
import { normalizeDictation } from '../../utils/shadowing';
import { Volume2 } from 'lucide-react';

type Tab = 'vocabulary' | 'kanji' | 'grammar' | 'cards' | 'quiz';
type Saved = { id: string; text: string; translation: string; due: number; interval: number; seen: number };
const storeKey = (videoId: string) => 'nihon:video-learning:v1:' + videoId;
function load(videoId: string): Saved[] { try { const v = JSON.parse(localStorage.getItem(storeKey(videoId)) || '[]'); return Array.isArray(v) ? v.filter(x=>x && typeof x.id==='string' && typeof x.text==='string') : []; } catch { return []; } }
const unique = <T extends { word?: string; character?: string; pattern?: string }>(items:T[], key:keyof T) => [...new Map(items.map(x=>[String(x[key]),x])).values()];
function speak(text:string) { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='ja-JP'; u.rate=.85; speechSynthesis.speak(u); }
export default function VideoLearningPanel({videoId,cues,selected,onJump,analysis,onAnalyze,busy,revision}:{
 videoId:string; cues:ShadowingCue[]; selected:number; onJump:(index:number)=>void;
 analysis:Map<string,ShadowingAnalysis>; onAnalyze:(cue:ShadowingCue)=>void; busy?:boolean; revision?:number;
}) {
 const [tab,setTab]=useState<Tab>('vocabulary');
 const [cards,setCards]=useState<Saved[]>(()=>load(videoId));
 const [flip,setFlip]=useState(false);
 const [cardIndex,setCardIndex]=useState(0);
 const [answer,setAnswer]=useState('');
 const [checked,setChecked]=useState(false);
 const [score,setScore]=useState({correct:0,total:0});
 useEffect(()=>{setCards(load(videoId));setCardIndex(0);setTab('vocabulary');setScore({correct:0,total:0});},[videoId]);
 useEffect(()=>{try{localStorage.setItem(storeKey(videoId),JSON.stringify(cards));}catch{}},[videoId,cards]);
 const analyses=useMemo(()=>{const result=analysis.get(cues[selected]?.text||'');return result?[result]:[];},[cues,analysis,selected,busy,revision]);
 const vocab=useMemo(()=>unique(analyses.flatMap(a=>a.vocabulary||[]),'word'),[analyses]);
 const kanji=useMemo(()=>unique(analyses.flatMap(a=>a.kanji||[]),'character'),[analyses]);
 const grammar=useMemo(()=>unique(analyses.flatMap(a=>a.grammar||[]),'pattern'),[analyses]);
 const save=(text:string,translation:string)=>setCards(p=>p.some(c=>c.id===text)?p:[...p,{id:text,text,translation,due:0,interval:0,seen:0}]);
 const review=(good:boolean)=>{const item=cards[cardIndex];if(!item)return;setCards(p=>p.map(c=>c.id!==item.id?c:{...c,interval:good?Math.min(60,Math.max(1,c.interval*2)):1,due:Date.now()+(good?Math.min(60,Math.max(1,c.interval*2)):1)*86400000,seen:c.seen+1}));setFlip(false);setCardIndex(i=>Math.min(i+1,Math.max(0,cards.length-1)));};
 const quizCards=cards.filter(c=>c.translation.trim());
 const question=quizCards[score.total%Math.max(1,quizCards.length)];
 const tabs:{id:Tab;label:string}[]=[{id:'vocabulary',label:'Từ vựng'},{id:'kanji',label:'Kanji'},{id:'grammar',label:'Ngữ pháp'},{id:'cards',label:'Flashcard'},{id:'quiz',label:'Kiểm tra'}];
 return <section className="overflow-hidden rounded-2xl border border-[var(--ui-line)] bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-sm">
 <div className="border-b border-[var(--ui-line)] bg-[var(--ui-soft)] px-4 py-3"><h3 className="font-bold text-[var(--ui-text)]">Phân tích bài nghe</h3><p className="text-xs text-[var(--ui-muted)]">Hiển thị kết quả từ file phân tích theo câu đang phát.</p></div>
 <div className="flex overflow-x-auto border-b border-[var(--ui-line)]" role="tablist" aria-label="Phân tích và ôn tập">{tabs.map(t=><button key={t.id} role="tab" aria-selected={tab===t.id} onClick={()=>setTab(t.id)} className={`shrink-0 px-4 py-3 text-xs font-semibold border-b-2 ${tab===t.id?'border-[var(--ui-primary)] text-[var(--ui-primary)]':'border-transparent text-[var(--ui-muted)]'}`}>{t.label}{t.id==='cards'?` (${cards.length})`:''}</button>)}</div>
 <div className="p-3 sm:p-4 space-y-3 max-h-[520px] overflow-y-auto">
 {analyses[0]?.note && <p className="rounded-lg bg-[var(--ui-soft)] p-2 text-xs text-[var(--ui-muted)]">{analyses[0].note}</p>}
 {tab==='vocabulary'&&<>{vocab.length===0?<p className="text-sm text-[var(--ui-muted)]">Chưa có dữ liệu từ vựng cho câu đang phát. Hãy nhập JSON phân tích từ Claude ở phía trên.</p>:vocab.map(v=><div key={v.word} className="border-b border-[var(--ui-line)] pb-3"><div className="flex justify-between"><b lang="ja">{v.word} {/\p{Script=Han}/u.test(v.word) && v.reading && <span className="font-normal text-sm text-[var(--ui-muted)]">{v.reading}</span>}</b><button onClick={()=>save(v.word,v.meaning)} className="text-[var(--ui-primary)]">＋ Thẻ</button></div><p className="text-sm">{v.meaning}</p></div>)}</>}
 {tab==='kanji'&&<>{kanji.length===0?<p className="text-sm text-[var(--ui-muted)]">Chưa có dữ liệu Kanji cho câu đang phát.</p>:kanji.map(k=><div key={k.character} className="flex gap-4 border-b border-[var(--ui-line)] pb-3"><span className="text-5xl" lang="ja">{k.character}</span><div className="text-sm flex-1"><b>{k.meaning||'Chưa có nghĩa'}</b><p>ON: {k.onyomi||'—'} · KUN: {k.kunyomi||'—'}</p><button className="text-[var(--ui-primary)] mt-2" onClick={()=>save(k.character,k.meaning||'')}>＋ Flashcard</button></div></div>)}</>}
 {tab==='grammar'&&<>{grammar.length===0?<p className="text-sm text-[var(--ui-muted)]">Chưa có dữ liệu ngữ pháp cho câu đang phát.</p>:grammar.map(g=><div key={g.pattern} className="border-b border-[var(--ui-line)] pb-3"><b className="text-[var(--ui-primary)]">{g.pattern}</b><p className="text-sm font-medium">{g.meaning}</p><p className="text-sm text-[var(--ui-muted)]">{g.explanation}</p>{g.example&&<p lang="ja" className="text-sm mt-1">{g.example}</p>}</div>)}</>}
 {tab==='cards'&&<>{cards.length===0?<p className="text-sm text-[var(--ui-muted)]">Lưu câu thoại, từ vựng hoặc Kanji để tạo flashcard riêng cho video này.</p>:<><p className="text-xs text-[var(--ui-muted)]">Thẻ {Math.min(cardIndex+1,cards.length)}/{cards.length} · Đến hạn: {cards.filter(c=>c.due<=Date.now()).length}</p><button onClick={()=>setFlip(v=>!v)} className="w-full min-h-44 rounded-2xl bg-[var(--ui-soft)] p-6 text-center"><span className="text-xs text-[var(--ui-muted)]">{flip?'Nghĩa':'Chạm để lật thẻ'}</span><div className="text-2xl font-bold mt-4" lang={flip?undefined:'ja'}>{flip?(cards[cardIndex]?.translation||'Chưa có bản dịch'):cards[cardIndex]?.text}</div></button><div className="flex gap-2"><button className="flex-1 border rounded-xl p-3" onClick={()=>setCardIndex(i=>(i+cards.length-1)%cards.length)}>←</button><button className="flex-1 border rounded-xl p-3" onClick={()=>speak(cards[cardIndex].text)}><Volume2 size={18} className="mx-auto"/></button><button className="flex-1 border rounded-xl p-3" onClick={()=>{setCardIndex(i=>(i+1)%cards.length);setFlip(false);}}>→</button></div><div className="flex gap-2"><button onClick={()=>review(false)} className="flex-1 bg-amber-100 text-amber-900 rounded-xl p-3">Cần ôn lại</button><button onClick={()=>review(true)} className="flex-1 bg-amber-400 text-slate-950 rounded-xl p-3">Đã nhớ</button></div><button className="text-xs text-rose-600 underline" onClick={()=>{setCards(p=>p.filter(c=>c.id!==cards[cardIndex].id));setCardIndex(0);}}>Xóa thẻ này</button></>}</>}
 {tab==='quiz'&&<>{quizCards.length<2?<p className="text-sm text-[var(--ui-muted)]">Cần ít nhất 2 thẻ có bản dịch để kiểm tra. Hãy lưu thêm câu hoặc từ vựng đã được phân tích.</p>:<><p className="text-sm text-[var(--ui-muted)]">Đúng {score.correct}/{score.total}</p><h3 lang="ja" className="text-xl font-bold">{question.text}</h3><p className="text-xs text-[var(--ui-muted)]">Nhập nghĩa hoặc bản dịch của thẻ này</p><input className="w-full rounded-xl border px-3 py-3 text-slate-900" value={answer} onChange={e=>{setAnswer(e.target.value);setChecked(false);}} placeholder="Nhập câu trả lời..."/>{checked&&<p className="text-sm">Đáp án đã lưu: <b>{question.translation}</b></p>}<button className="rounded-xl bg-[var(--ui-primary)] text-white px-4 py-3" onClick={()=>{if(!checked){setChecked(true);return;}setScore(p=>({total:p.total+1,correct:p.correct+(normalizeDictation(answer)===normalizeDictation(question.translation)?1:0)}));setAnswer('');setChecked(false);}}>{checked?'Câu tiếp theo →':'Hiện đáp án'}</button><button className="ml-3 text-sm underline" onClick={()=>{setScore({correct:0,total:0});setAnswer('');setChecked(false);}}>Làm lại</button></>}</>}
 </div></section>;
}
