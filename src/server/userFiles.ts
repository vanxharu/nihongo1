import { firebaseDb, documentKey, clean } from './firebaseStore';
const files=(uid:string)=>firebaseDb().collection('app_users').doc(uid).collection('files');
const valid=(v:any)=>typeof v==='string'&&/^[\w-]{1,160}$/.test(v);
export async function listUserFiles(uid:string){return (await files(uid).get()).docs.map(d=>d.data()).filter(v=>v.ready||v.deleted).map(({generation,count,totalLength,...v})=>v);}
export async function userFilePart(uid:string,id:string,index:number){if(!valid(id)||!Number.isInteger(index)||index<0)throw new Error('INVALID_FILE');const ref=files(uid).doc(documentKey(id));const meta=(await ref.get()).data();if(!meta?.ready||index>=meta.count)throw new Error('FILE_NOT_FOUND');const part=(await ref.collection('uploads').doc(meta.generation).collection('parts').doc(String(index)).get()).data();if(!part)throw new Error('FILE_NOT_FOUND');return {data:part.data,count:meta.count};}
export async function writeUserFile(uid:string,input:any){
  if(!valid(input.id))throw new Error('INVALID_FILE');const ref=files(uid).doc(documentKey(input.id));
  if(input.action==='delete'){await firebaseDb().recursiveDelete(ref);await ref.set({id:input.id,deleted:true,ready:false});return;}
  if(!valid(input.generation))throw new Error('INVALID_FILE');const upload=ref.collection('uploads').doc(input.generation);
  if(input.action==='begin'){
    if(!Number.isInteger(input.count)||input.count<1||input.count>400||!Number.isInteger(input.totalLength)||input.totalLength<1||input.totalLength>70000000)throw new Error('INVALID_FILE');
    const m=input.metadata||{};await upload.set(clean({count:input.count,totalLength:input.totalLength,metadata:{id:input.id,title:String(m.title||'PDF').slice(0,250),fileName:String(m.fileName||'exam.pdf').slice(0,250),importedAt:String(m.importedAt||''),level:String(m.level||'N4'),sizeBytes:Math.max(0,Number(m.sizeBytes)||0),ownerUid:uid}}));return;
  }
  const meta=(await upload.get()).data();if(!meta)throw new Error('INVALID_FILE');
  if(input.action==='part'){if(!Number.isInteger(input.index)||input.index<0||input.index>=meta.count||typeof input.data!=='string'||input.data.length>200000)throw new Error('INVALID_FILE');await upload.collection('parts').doc(String(input.index)).set({data:input.data});return;}
  if(input.action==='commit'){
    const refs=Array.from({length:meta.count},(_,i)=>upload.collection('parts').doc(String(i)));const parts=await firebaseDb().getAll(...refs);const length=parts.reduce((n,p)=>n+(p.data()?.data?.length||0),0);
    if(parts.some(p=>!p.exists)||length!==meta.totalLength||!/^data:application\/(?:pdf|octet-stream);base64,JVBER/.test(parts[0].data()!.data))throw new Error('INVALID_FILE');
    await ref.set({...meta.metadata,generation:input.generation,count:meta.count,totalLength:meta.totalLength,ready:true});return;
  }
  throw new Error('INVALID_FILE');
}
