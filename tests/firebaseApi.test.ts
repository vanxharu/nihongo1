import { test } from 'node:test';import assert from 'node:assert/strict';import { build } from 'esbuild';import fs from 'node:fs';import { createRequire } from 'node:module';
const records=new Map<string,any>();const copy=(v:any)=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const snap=(path:string):any=>({ref:ref(path),exists:records.has(path),data:()=>copy(records.get(path))});
const ref=(path:string):any=>({path,collection:(name:string)=>collection(path+'/'+name),get:async()=>snap(path),set:async(v:any)=>records.set(path,copy(v)),update:async(v:any)=>records.set(path,{...records.get(path),...copy(v)})});
const collection=(path:string):any=>({doc:(id:string)=>ref(path+'/'+id),get:async()=>({docs:[...records.keys()].filter(p=>p.startsWith(path+'/')&&!p.slice(path.length+1).includes('/')).map(snap)})});
const database:any={collection,getAll:async(...refs:any[])=>refs.map(r=>snap(r.path)),batch:()=>{const work:any[]=[];return {set:(r:any,v:any)=>work.push([r.path,copy(v)]),commit:async()=>{for(const [p,v]of work)records.set(p,v);}};},recursiveDelete:async(r:any)=>{for(const p of records.keys())if(p===r.path||p.startsWith(r.path+'/'))records.delete(p);},runTransaction:async(fn:any)=>{const writes:any[]=[];const tx={get:async(r:any)=>snap(r.path),getAll:async(...refs:any[])=>refs.map(r=>snap(r.path)),set:(r:any,v:any)=>writes.push([r.path,copy(v)]),create:(r:any,v:any)=>writes.push([r.path,copy(v)]),update:(r:any,v:any)=>writes.push([r.path,{...records.get(r.path),...copy(v)}])};const result=await fn(tx);for(const [p,v]of writes)records.set(p,v);return result;}};
(globalThis as any).__apiFirebase=database;
const shadowingSource=fs.readFileSync('src/server/shadowingStore.ts','utf8');const exports=[...shadowingSource.matchAll(/export (?:async )?function (\w+)/g)].map(m=>m[1]);
process.env.VERCEL='1';process.env.ADMIN_EMAILS='admin@example.com';
const out='node_modules/.cache/firebase-api-test.cjs';fs.mkdirSync('node_modules/.cache',{recursive:true});
await build({entryPoints:['server.ts'],outfile:out,bundle:true,platform:'node',format:'cjs',packages:'external',plugins:[{name:'external-services',setup(b){
 b.onResolve({filter:/shadowingStore(?:\.js)?$/},()=>({path:'firestore',namespace:'fixture'}));
 b.onResolve({filter:/lib\/firebase-admin$/},()=>({path:'auth',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='auth'?`export const adminAuth={verifyIdToken:async token=>{if(!token.startsWith('fixture:'))throw Error('Invalid');return JSON.parse(token.slice(8));}};`:`export const shadowingDatabase=()=>globalThis.__apiFirebase;${exports.filter(n=>n!=='shadowingDatabase').map(n=>`export const ${n}=()=>{};`).join('')}`}));
}}]});
const app=createRequire(import.meta.url)('../'+out).default;
test('authenticated API flow persists to Firebase and preserves response contracts',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const token='fixture:'+JSON.stringify({uid:'api-owner',email:'admin@example.com',email_verified:true});
 const request=async(path:string,body?:any,auth=token)=>fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${auth}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 try{
  const sync=await request('/api/user/sync',{});assert.equal(sync.status,200);assert.equal((await sync.json()).user.role,'admin');
  const users=await request('/api/admin/users');assert.equal(users.status,200);assert.equal((await users.json()).users[0].uid,'api-owner');
  const catalog=await request('/api/vocabularies');assert.equal(catalog.headers.get('x-data-store'),'firestore');assert((await catalog.json()).length>3000);
  const imported=await request('/api/admin/vocabularies/import',{items:[{reading:'てすと',word:'テスト',meaning:'kiểm tra',lessonNumber:99,level:'N4'}]});assert.equal(imported.status,200);const item=(await imported.json()).items[0];assert.equal(item.hiragana,'てすと');
  const updated=await request('/api/user/profile',{xp:42,role:'user',userId:'another-user'});assert.equal(updated.status,200);assert.equal((await updated.json()).user.xp,42);assert(records.has('app_users/api-owner'));assert(!records.has('app_users/another-user'));
  await request('/api/grammar/progress/record',{userUid:'another-user',grammarId:'g-test',isCorrect:true});const progress=await request('/api/grammar/progress/user/api-owner');assert.equal((await progress.json()).progressMap['g-test'].attempts,1);assert(!records.has('app_users/another-user/grammar_progress/Zy10ZXN0'));
  const normal='fixture:'+JSON.stringify({uid:'normal',email:'normal@example.com',email_verified:true});assert.equal((await request('/api/admin/users',undefined,normal)).status,403);assert.equal((await request('/api/grammar/progress/user/api-owner',undefined,normal)).status,403);
  const learning=await request('/api/user/import-learning',{entries:[{key:'todaii_saved_words_v1',value:'[]',updatedAt:100}]});assert.equal(learning.status,200);const manifest=await request('/api/user/learning-state');assert.equal((await manifest.json()).entries[0].key,'todaii_saved_words_v1');
  const invalid=await request('/api/user/import-learning',{entries:[{key:'auth_token',value:'bad'}]});assert.equal(invalid.status,400);
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
