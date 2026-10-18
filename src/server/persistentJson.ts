import fs from 'node:fs';import path from 'node:path';import { AsyncLocalStorage } from 'node:async_hooks';
import { firebaseDb, documentKey, clean } from './firebaseStore';
const snapshots=new AsyncLocalStorage<Map<string,any>>();
export function persistentRequest<T>(callback:()=>T):T{return snapshots.run(new Map(),callback);}
const refFor=(file:string)=>firebaseDb().collection('persistent_json').doc(documentKey(path.relative(process.cwd(),file)));
export async function persistentJsonExists(file:string){return (await refFor(file).get()).exists||fs.existsSync(file);}
const equal=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b);
export function mergeJsonChanges(before:any,incoming:any,latest:any):any {
  if(equal(before,incoming))return latest;
  if(incoming&&latest&&typeof incoming==='object'&&!Array.isArray(incoming)&&!Array.isArray(latest)){
    if(Number(latest.updatedAt)>Number(incoming.updatedAt)&&Number(incoming.updatedAt)>0)return latest;
    const out={...latest};for(const key of new Set([...Object.keys(before||{}),...Object.keys(incoming)])){
      if(['__proto__','constructor','prototype'].includes(key))continue;
      if(!Object.prototype.hasOwnProperty.call(incoming,key)){if(Object.prototype.hasOwnProperty.call(before||{},key))delete out[key];}
      else out[key]=mergeJsonChanges(before?.[key],incoming[key],latest[key]);
    }return out;
  }
  if(Array.isArray(before)&&Array.isArray(incoming)&&Array.isArray(latest)){
    const identity=(v:any)=>v&&typeof v==='object'?(v.id||v.attemptId||(v.questionId&&v.youtubeVideoId?`${v.questionId}:${v.youtubeVideoId}`:undefined)):undefined;
    if([...before,...incoming,...latest].every(v=>identity(v)!==undefined)){
      const map=(a:any[])=>Object.fromEntries(a.map(v=>[String(identity(v)),v]));return Object.values(mergeJsonChanges(map(before),map(incoming),map(latest)));
    }
    if(incoming.length>=before.length&&before.every((v,i)=>equal(v,incoming[i]))){const result=[...latest];for(const v of incoming.slice(before.length))if(!result.some(p=>equal(p,v)))result.push(v);return result;}
  }
  return incoming;
}
async function readWithin(tx:any,ref:any){const meta=(await tx.get(ref)).data();if(!meta)return null;const refs=Array.from({length:meta.count},(_,i)=>ref.collection('parts').doc(String(i)));const parts=refs.length?await tx.getAll(...refs):[];if(parts.some((p:any)=>!p.exists))throw new Error('INCOMPLETE_DATA');return {value:JSON.parse(parts.map((p:any)=>p.data()!.text).join(''))};}
function writeWithin(tx:any,ref:any,value:any){const text=JSON.stringify(value);if(Buffer.byteLength(text)>8000000)throw new Error('DATA_TOO_LARGE');const count=Math.ceil(text.length/200000);for(let i=0;i<count;i++)tx.set(ref.collection('parts').doc(String(i)),{text:text.slice(i*200000,(i+1)*200000)});tx.set(ref,{count,updatedAt:new Date().toISOString()});}
export async function writePersistentJson(file:string,value:any){
  const ref=refFor(file);const before=snapshots.getStore()?.get(file);
  await firebaseDb().runTransaction(async tx=>{const stored=await readWithin(tx,ref);const latest=stored?.value;const merged=before===undefined?value:mergeJsonChanges(before,value,latest??(Array.isArray(value)?[]:{}));writeWithin(tx,ref,merged);});
}
export async function readPersistentJson(file:string):Promise<any>{
  const ref=refFor(file);let stored=await firebaseDb().runTransaction(tx=>readWithin(tx,ref));
  if(!stored){const seed=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};await firebaseDb().runTransaction(async tx=>{if((await tx.get(ref)).exists)return;writeWithin(tx,ref,clean(seed));});stored=await firebaseDb().runTransaction(tx=>readWithin(tx,ref));}
  const value=stored!.value;const scope=snapshots.getStore();if(scope&&!scope.has(file))scope.set(file,clean(value));return value;
}
