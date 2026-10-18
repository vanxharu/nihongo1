import { backupLearning, restoreLearning } from './offlineLearning';
import type { User } from 'firebase/auth';
import { isLearningStorageKey as allowed } from './learningStateKeys';
let generation=0;
let stopCurrent:(()=>void)|undefined;
export async function connectCloudLearning(user:User){
  const currentGeneration=++generation;stopCurrent?.();let stopped=false,busy=false;const dirty=new Map<string,any>();const observed=new Map<string,string|null>();
  const ownerKey='jpstudy_learning_owner';const pendingKey=`jpstudy_learning_pending:${user.uid}`;

  const keys=()=>Object.keys(localStorage).filter(allowed);
  let legacy:any=null;try{legacy=JSON.parse(localStorage.getItem('nhai_kanji_user_profile_v1')||'null');}catch{}
  const before=localStorage.getItem(ownerKey)||legacy?.uid;
  if(before&&before!==user.uid){await backupLearning(before,Object.fromEntries(keys().map(key=>[key,localStorage.getItem(key)])));for(const key of keys())localStorage.removeItem(key);}
  let restoredLocal=false;if(before!==user.uid||!keys().length){const restore=await restoreLearning(user.uid);for(const [key,value]of Object.entries(restore))if(allowed(key)&&typeof value==='string'){localStorage.setItem(key,value);restoredLocal=true;}}
  localStorage.setItem(ownerKey,user.uid);
  try{for(const entry of JSON.parse(localStorage.getItem(pendingKey)||'[]'))if(allowed(entry.key))dirty.set(entry.key,{...entry,value:localStorage.getItem(entry.key)});}catch{}
  const token=await user.getIdToken();
  const response=await fetch('/api/user/learning-state',{headers:{Authorization:`Bearer ${token}`}});
  if(!response.ok)throw new Error('Không tải được dữ liệu học tập từ Firebase.');
  const packet=await response.json();if(currentGeneration!==generation)return;
  const entries:any[]=[];
  for(let start=0;start<(packet.entries||[]).length;start+=4){const group=await Promise.all(packet.entries.slice(start,start+4).map(async(meta:any)=>{
    if(!allowed(meta.key))return null;
    if(meta.deleted)return {...meta,value:null};
    if(dirty.get(meta.key)?.updatedAt>meta.updatedAt)return {...meta,value:localStorage.getItem(meta.key)};
    let value='';for(let index=0;index<meta.count;index++){const part=await fetch(`/api/user/learning-state/part?key=${encodeURIComponent(meta.key)}&index=${index}&version=${meta.updatedAt}`,{headers:{Authorization:`Bearer ${token}`}});if(!part.ok)throw new Error('Không tải được dữ liệu học tập.');value+=(await part.json()).text;}return {...meta,value};
  }));entries.push(...group.filter(Boolean));}
  if(currentGeneration!==generation)return;
  const remote=new Map<string,any>(entries.map((v:any)=>[v.key,v]));let changed=false;
  for(const [key,entry]of remote){if(!allowed(key))continue;const pending=dirty.get(key);if(pending&&pending.updatedAt>entry.updatedAt)continue;const current=localStorage.getItem(key);if(current!==entry.value){if(entry.value===null)localStorage.removeItem(key);else localStorage.setItem(key,entry.value);changed=true;}dirty.delete(key);}
  for(const key of keys()){const value=localStorage.getItem(key);observed.set(key,value);if(!remote.has(key)&&!dirty.has(key))dirty.set(key,{key,value,updatedAt:Date.now()});}
  for(const key of remote.keys())if(!observed.has(key))observed.set(key,null);
  const persist=()=>localStorage.setItem(pendingKey,JSON.stringify([...dirty.values()].map(({key,updatedAt})=>({key,updatedAt}))));
  const scan=()=>{if(localStorage.getItem(ownerKey)!==user.uid)return;const all=new Set([...keys(),...observed.keys()]);for(const key of all){const value=localStorage.getItem(key);if(value!==observed.get(key)){observed.set(key,value);dirty.set(key,{key,value,updatedAt:Date.now()});}}persist();};
  const send=async(body:any,chunk=false)=>{const idToken=await user.getIdToken();const r=await fetch(chunk?'/api/user/import-learning-chunk':'/api/user/import-learning',{method:'POST',headers:{Authorization:`Bearer ${idToken}`,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('Cloud sync failed');};
  const flush=async()=>{if(stopped||busy)return;scan();if(!dirty.size)return;busy=true;try{
    const entries=[...dirty.values()].slice(0,30);let batch:any[]=[];let bytes=0;
    const acknowledge=(items:any[])=>{for(const entry of items)if(dirty.get(entry.key)===entry)dirty.delete(entry.key);persist();};
    const smallBatch=async()=>{if(batch.length){await send({entries:batch});acknowledge(batch);batch=[];bytes=0;}};
    for(const entry of entries){const size=new Blob([JSON.stringify(entry)]).size;
      if(size>1000000){await smallBatch();const generation=crypto.randomUUID();const count=Math.ceil(entry.value.length/200000);await send({...entry,value:undefined,action:'begin',generation,count,length:entry.value.length},true);for(let index=0;index<count;index++)await send({action:'part',key:entry.key,generation,index,text:entry.value.slice(index*200000,(index+1)*200000)},true);await send({action:'commit',key:entry.key,generation},true);acknowledge([entry]);}
      else{if(bytes+size>1500000)await smallBatch();batch.push(entry);bytes+=size;}
    }await smallBatch();
  }catch{/* Pending changes remain on this device for a retry. */}finally{busy=false;}};

  const timer=window.setInterval(()=>void flush(),5000);const visibility=()=>{if(document.hidden)void flush();};document.addEventListener('visibilitychange',visibility);
  stopCurrent=()=>{scan();stopped=true;window.clearInterval(timer);document.removeEventListener('visibilitychange',visibility);};
  if(changed||restoredLocal||before!==user.uid)window.dispatchEvent(new Event('learning-cloud-restored'));
  await flush();
}
export async function stopCloudLearning(){generation++;stopCurrent?.();stopCurrent=undefined;const uid=localStorage.getItem('jpstudy_learning_owner');if(uid){const keys=Object.keys(localStorage).filter(allowed);await backupLearning(uid,Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)])));for(const key of keys)localStorage.removeItem(key);window.dispatchEvent(new Event('learning-cloud-restored'));}}
