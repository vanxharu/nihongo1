import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, RotateCcw, Headphones, Repeat2 } from 'lucide-react';
import type { ShadowingCue } from '../../utils/shadowing';
import { formatDuration } from '../../utils/youtubeUtils';

export default function ShadowingPractice({videoId,cue,onPlay,onPrevious,onNext}:{
 videoId:string;cue?:ShadowingCue;onPlay:(repeat:boolean)=>void;onPrevious:()=>void;onNext:()=>void;
}) {
 const recorder=useRef<MediaRecorder|null>(null);
 const stream=useRef<MediaStream|null>(null);
 const chunks=useRef<Blob[]>([]);
 const url=useRef<string|null>(null);
 const [audio,setAudio]=useState<string|null>(null);
 const [recording,setRecording]=useState(false);
 const [error,setError]=useState('');
 const [repeats,setRepeats]=useState(0);
 const [hideText,setHideText]=useState(false);
 const [history,setHistory]=useState<Record<string,number>>({});
 const storageKey='nihon:shadowing-practice:'+videoId;
 useEffect(()=>{try{setHistory(JSON.parse(localStorage.getItem(storageKey)||'{}'));}catch{setHistory({});}},[storageKey]);
 useEffect(()=>()=>{recorder.current?.stop();stream.current?.getTracks().forEach(t=>t.stop());if(url.current)URL.revokeObjectURL(url.current);},[]);
 useEffect(()=>{if(url.current)URL.revokeObjectURL(url.current);url.current=null;setAudio(null);setRepeats(0);setError('');},[videoId,cue?.id]);
 const start=async()=>{
   setError('');
   if(!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder==='undefined'){setError('Trình duyệt không hỗ trợ ghi âm. Hãy mở trang bằng HTTPS trên Chrome hoặc Safari mới.');return;}
   try{
     const media=await navigator.mediaDevices.getUserMedia({audio:true});stream.current=media;
     const rec=new MediaRecorder(media);recorder.current=rec;chunks.current=[];
     rec.ondataavailable=e=>{if(e.data.size)chunks.current.push(e.data);};
     rec.onstop=()=>{const blob=new Blob(chunks.current,{type:rec.mimeType||'audio/webm'});if(url.current)URL.revokeObjectURL(url.current);url.current=URL.createObjectURL(blob);setAudio(url.current);media.getTracks().forEach(t=>t.stop());stream.current=null;setRecording(false);};
     rec.start();setRecording(true);
   }catch{setError('Không truy cập được micro. Hãy cấp quyền micro cho trang rồi thử lại.');}
 };
 const stop=()=>{if(recorder.current?.state==='recording')recorder.current.stop();};
 const practice=()=>{if(!cue)return;onPlay(true);setRepeats(n=>n+1);const id=cue.id;setHistory(p=>{const next={...p,[id]:(p[id]||0)+1};try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{}return next;});};
 return <section className="space-y-4" aria-label="Luyện nói Shadowing">
  <div className="flex items-center justify-between"><div><h3 className="text-base font-bold text-[var(--ui-text)]">Luyện nói theo nhân vật</h3><p className="text-xs text-[var(--ui-muted)]">Nghe → nhắc lại → ghi âm → so sánh</p></div><span className="rounded-full bg-[var(--ui-soft)] px-3 py-1 text-xs text-[var(--ui-primary)]">{cue?history[cue.id]||0:0} lượt luyện</span></div>
  {!cue?<p className="text-sm text-[var(--ui-muted)]">Hãy chọn một câu có phụ đề để bắt đầu.</p>:<>
   <div className="rounded-xl border border-white/10 bg-[var(--ui-soft)] p-4">
    <p className="mb-2 text-xs text-[var(--ui-muted)]">Câu đang luyện · {cue.start===null?'Chưa có mốc thời gian':formatDuration(cue.start)}</p>
    <button onClick={()=>setHideText(v=>!v)} className="mb-3 text-xs text-[var(--ui-primary)] underline">{hideText?'Hiện lời thoại':'Ẩn lời thoại để thử sức'}</button>
    <p lang="ja" className="min-h-12 text-xl font-semibold leading-relaxed text-[var(--ui-primary)]">{hideText?'••••••••':cue.text}</p>
    {!hideText&&cue.translation&&<p className="mt-2 text-sm text-[var(--ui-muted)]">{cue.translation}</p>}
   </div>
   <div className="grid grid-cols-2 gap-2">
    <button onClick={()=>onPlay(false)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--ui-line)] bg-[var(--ui-soft)] font-semibold"><Headphones size={17}/> Nghe mẫu</button>
    <button onClick={practice} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--ui-primary)] font-semibold text-white"><Repeat2 size={17}/> Nghe & dừng</button>
   </div>
   <button onClick={recording?stop:start} className={`flex w-full min-h-14 items-center justify-center gap-2 rounded-xl font-bold ${recording?'bg-rose-600 text-[var(--ui-text)]':'bg-[var(--ui-soft)] text-[var(--ui-text)] border border-[var(--ui-primary)]'}`}>{recording?<><Square size={18}/> Dừng ghi âm</>:<><Mic size={18}/> Ghi âm giọng của tôi</>}</button>
   {audio&&<div className="rounded-xl bg-[var(--ui-soft)] p-3"><p className="mb-2 text-xs text-[var(--ui-muted)]">Bản ghi của bạn (chỉ lưu tạm trên thiết bị)</p><audio controls src={audio} className="w-full" /><button onClick={()=>{if(url.current)URL.revokeObjectURL(url.current);url.current=null;setAudio(null);}} className="mt-2 flex items-center gap-1 text-xs text-[var(--ui-primary)]"><RotateCcw size={13}/> Ghi lại</button></div>}
   {error&&<p role="alert" className="text-sm text-rose-300">{error}</p>}
   <div className="flex gap-2"><button onClick={onPrevious} className="flex-1 rounded-xl border border-[var(--ui-line)] p-3 text-sm">← Câu trước</button><button onClick={onNext} className="flex-1 rounded-xl border border-[var(--ui-line)] p-3 text-sm">Câu tiếp →</button></div>
   <p className="text-xs text-[var(--ui-muted)]">Bản ghi chỉ dùng để tự nghe đối chiếu; không tự chấm điểm phát âm. Số lượt luyện được lưu trên thiết bị.</p>
  </>}
 </section>;
}
