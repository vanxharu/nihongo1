import { createHash, randomUUID } from 'node:crypto';
import { shadowingDatabase } from './shadowingStore';
import grammarAiSeed from '../data/grammarAiContents.json';
import { VOCABULARY_DATA, GRAMMAR_DATA, KANJI_DATA } from '../data';
export const clean = <T>(value:T):T => JSON.parse(JSON.stringify(value));
export const documentKey = (value:unknown) => Buffer.from(String(value)).toString('base64url');
export const firebaseDb = shadowingDatabase;
export async function readRecord(collection:string, id:string) { return (await firebaseDb().collection(collection).doc(documentKey(id)).get()).data() || null; }
export async function writeRecord(collection:string, id:string, value:any) { await firebaseDb().collection(collection).doc(documentKey(id)).set(clean(value)); return value; }
export async function listRecords(collection:string):Promise<any[]> { return (await firebaseDb().collection(collection).get()).docs.map(d=>d.data()); }
export type ContentKind = 'lessons'|'vocabularies'|'grammars'|'kanjis';
function seed(kind:ContentKind):any[] {
  if(kind==='vocabularies') return VOCABULARY_DATA.map(v=>({...v,word:v.kanji||v.hiragana,reading:v.hiragana,exampleJp:v.exampleSentence||'',exampleVi:v.exampleTranslation||''}));
  if(kind==='grammars') return GRAMMAR_DATA.length?GRAMMAR_DATA:[...new Map(Object.entries(grammarAiSeed).map(([key,v]:[string,any])=>{const id=String(v.grammarId||key).replace(/^g_/,'');return [id,{id,structure:v.grammar||'',meaning:v.meaning||v.overview||'',explanation:v.overview||'',level:v.level||'N4',lessonId:v.lessonId||'grammar_'+(v.level||'N4'),exampleJp:v.examples?.[0]?.japanese||'',exampleVi:v.examples?.[0]?.vietnamese||''}];})).values()];
  if(kind==='kanjis') return KANJI_DATA.map((v:any)=>({...v,kanji:v.kanji||v.character,meaningVi:v.meaningVi||v.meaning||'',lesson:v.lesson||v.lessonNumber||1}));
  return [...new Map(VOCABULARY_DATA.map(v=>[v.lessonId,{id:v.lessonId,lessonNumber:Number(v.lessonId.match(/(\d+)$/)?.[1]||1),titleVi:v.lessonName||'',titleJp:v.lessonTitleJp||'',level:v.level,curriculum:v.curriculum}])).values()];
}
const initialized = new Map<string,Promise<void>>();
async function ensureContent(kind:ContentKind) {
  if(!initialized.has(kind)) initialized.set(kind,(async()=>{
    const values=seed(kind); const version=createHash('sha256').update(JSON.stringify(values)).digest('hex').slice(0,16);
    const base=firebaseDb().collection('curriculum_seeds').doc(`${kind}-${version}`);
    if((await base.get()).exists)return;
    const chunks:any[][]=[];let chunk:any[]=[];let bytes=0;
    for(const value of values){const size=Buffer.byteLength(JSON.stringify(value));if(bytes+size>500000&&chunk.length){chunks.push(chunk);chunk=[];bytes=0;}chunk.push(value);bytes+=size;}if(chunk.length)chunks.push(chunk);
    const batch=firebaseDb().batch();chunks.forEach((items,i)=>batch.set(base.collection('chunks').doc(String(i)),{items:clean(items)}));
    batch.set(base,{version,count:values.length,createdAt:new Date().toISOString()});await batch.commit();
  })().catch(e=>{initialized.delete(kind);throw e;}));
  await initialized.get(kind);
}
export async function listContent(kind:ContentKind):Promise<any[]> {
  await ensureContent(kind);
  const version=createHash('sha256').update(JSON.stringify(seed(kind))).digest('hex').slice(0,16);
  const [parts,changes]=await Promise.all([firebaseDb().collection('curriculum_seeds').doc(`${kind}-${version}`).collection('chunks').get(),firebaseDb().collection(`curriculum_${kind}`).get()]);
  const rows=new Map<string,any>();for(const d of parts.docs)for(const item of d.data().items||[])rows.set(String(item.id),item);
  for(const d of changes.docs){const item=d.data();if(item.deleted)rows.delete(String(item.id));else rows.set(String(item.id),{...rows.get(String(item.id)),...item});}
  return [...rows.values()];
}
export async function saveContent(kind:ContentKind,value:any,id?:unknown) {
  let key=String(id||`firebase_${randomUUID()}`);const existing=id?(await listContent(kind)).find(v=>String(v.id)===key||String(v.id)===key.replace(/^[vg]_/,'')):null;if(existing)key=String(existing.id);
  const patch=clean(value);if(kind==='vocabularies'){if(patch.reading!==undefined)patch.hiragana=patch.reading;if(patch.exampleJp!==undefined)patch.exampleSentence=patch.exampleJp;if(patch.exampleVi!==undefined)patch.exampleTranslation=patch.exampleVi;}const row=clean({...existing,...patch,id:key,deleted:false});await writeRecord(`curriculum_${kind}`,key,row);return row;
}
export async function removeContent(kind:ContentKind,id:unknown) {const input=String(id);const row=(await listContent(kind)).find(v=>String(v.id)===input||String(v.id)===input.replace(/^[vg]_/,''));const key=String(row?.id||input);await writeRecord(`curriculum_${kind}`,key,{id:key,deleted:true});}
export async function bulkSaveContent(kind:ContentKind,values:any[]){
  const rows=values.map(value=>{const patch=clean(value);const id=String(patch.id||`import_${createHash('sha256').update(JSON.stringify([kind,patch.lessonId,patch.word,patch.reading,patch.meaning])).digest('hex').slice(0,32)}`);if(kind==='vocabularies'){patch.hiragana=patch.reading;patch.exampleSentence=patch.exampleJp||'';patch.exampleTranslation=patch.exampleVi||'';}return {...patch,id,deleted:false};});
  for(let start=0;start<rows.length;start+=300){const batch=firebaseDb().batch();for(const row of rows.slice(start,start+300))batch.set(firebaseDb().collection(`curriculum_${kind}`).doc(documentKey(row.id)),row,{merge:true});await batch.commit();}
  return rows;
}
