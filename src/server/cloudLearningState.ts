import { createHash } from 'node:crypto';
import { firebaseDb } from './firebaseStore';
// Learning data only. Tokens, login state, roles and provider keys never enter this store.
import { isLearningStorageKey as learningKey } from '../utils/learningStateKeys';
export { isLearningStorageKey as learningKey } from '../utils/learningStateKeys';
const refFor=(uid:string,key:string)=>firebaseDb().collection('app_users').doc(uid).collection('learning_state').doc(createHash('sha256').update(key).digest('hex'));
export async function getLearningState(uid:string){
  const entries=await firebaseDb().collection('app_users').doc(uid).collection('learning_state').get();
  const result=[];for(const doc of entries.docs){const meta=doc.data();if(!learningKey(meta.key))continue;const value=await firebaseDb().runTransaction(async tx=>{const current=(await tx.get(doc.ref)).data()!;if(current.deleted)return {...current,value:null};const parts=current.count?await tx.getAll(...Array.from({length:current.count},(_,i)=>doc.ref.collection('parts').doc(String(i)))):[];return {key:current.key,value:parts.map(p=>p.data()?.text||'').join(''),updatedAt:current.updatedAt};});result.push(value);}return result;
}
export async function saveLearningState(uid:string,entries:any[]){
  if(!Array.isArray(entries)||entries.length>40)throw new Error('INVALID_STATE');
  for(const entry of entries){if(typeof entry?.key!=='string'||!learningKey(entry.key)||(entry.value!==null&&typeof entry.value!=='string')||(entry.value?.length||0)>6000000)throw new Error('INVALID_STATE');}
  for(const entry of entries){const ref=refFor(uid,entry.key);const timestamp=Math.min(Date.now()+60000,Number(entry.updatedAt)||Date.now());await firebaseDb().runTransaction(async tx=>{const previous=(await tx.get(ref)).data();if(previous?.updatedAt>timestamp)return;const value=entry.value;const count=value===null?0:Math.ceil(value.length/200000);for(let i=0;i<count;i++)tx.set(ref.collection('parts').doc(String(i)),{text:value.slice(i*200000,(i+1)*200000)});tx.set(ref,{key:entry.key,count,updatedAt:timestamp,deleted:value===null});});}
}

export async function stageLearningState(uid:string,input:any){
  if(typeof input.key!=='string'||!learningKey(input.key)||typeof input.generation!=='string'||!/^[\w-]{1,80}$/.test(input.generation))throw new Error('INVALID_STATE');
  const target=refFor(uid,input.key);const upload=target.collection('uploads').doc(input.generation);
  if(input.action==='begin'){if(!Number.isInteger(input.count)||input.count<1||input.count>50||!Number.isInteger(input.length)||input.length<1||input.length>6000000)throw new Error('INVALID_STATE');await upload.set({key:input.key,count:input.count,length:input.length,updatedAt:Math.min(Date.now()+60000,Number(input.updatedAt)||Date.now())});return;}
  const meta=(await upload.get()).data();if(!meta)throw new Error('INVALID_STATE');
  if(input.action==='part'){if(!Number.isInteger(input.index)||input.index<0||input.index>=meta.count||typeof input.text!=='string'||input.text.length>200000)throw new Error('INVALID_STATE');await upload.collection('parts').doc(String(input.index)).set({text:input.text});return;}
  if(input.action!=='commit')throw new Error('INVALID_STATE');
  await firebaseDb().runTransaction(async tx=>{const current=(await tx.get(target)).data();if(current?.updatedAt>meta.updatedAt)return;const parts=await tx.getAll(...Array.from({length:meta.count},(_,i)=>upload.collection('parts').doc(String(i))));if(parts.some(p=>!p.exists)||parts.reduce((n,p)=>n+p.data()!.text.length,0)!==meta.length)throw new Error('INCOMPLETE_STATE');parts.forEach((part,i)=>tx.set(target.collection('parts').doc(String(i)),{text:part.data()!.text}));tx.set(target,{key:meta.key,count:meta.count,updatedAt:meta.updatedAt,deleted:false});});
  await firebaseDb().recursiveDelete(upload);
}
export async function learningStateManifest(uid:string){return (await firebaseDb().collection('app_users').doc(uid).collection('learning_state').get()).docs.map(d=>{const v=d.data();return {key:v.key,count:v.count,updatedAt:v.updatedAt,deleted:v.deleted};}).filter(v=>learningKey(v.key));}
export async function learningStatePart(uid:string,key:string,index:number,version:number){
  if(!learningKey(key)||!Number.isInteger(index)||index<0)throw new Error('INVALID_STATE');const ref=refFor(uid,key);
  return firebaseDb().runTransaction(async tx=>{const meta=(await tx.get(ref)).data();if(!meta||meta.deleted||index>=meta.count)throw new Error('INVALID_STATE');if(meta.updatedAt!==version)throw new Error('STATE_CHANGED');const part=(await tx.get(ref.collection('parts').doc(String(index)))).data();if(!part)throw new Error('INVALID_STATE');return {text:part.text};});
}
