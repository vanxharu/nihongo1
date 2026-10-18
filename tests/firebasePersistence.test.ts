import { test } from 'node:test';import assert from 'node:assert/strict';import { build } from 'esbuild';import fs from 'node:fs';import { createRequire } from 'node:module';
const docs=new Map<string,any>();const clone=(v:any)=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
function ref(path:string):any{return {path,collection:(name:string)=>collection(`${path}/${name}`),get:async()=>snapshot(path),set:async(v:any)=>{docs.set(path,clone(v));},update:async(v:any)=>{docs.set(path,{...docs.get(path),...clone(v)});},delete:async()=>{docs.delete(path);}};}
function snapshot(path:string):any{return {exists:docs.has(path),ref:ref(path),data:()=>clone(docs.get(path))};}
function collection(path:string):any{return {doc:(id:string)=>ref(`${path}/${id}`),get:async()=>({docs:[...docs.keys()].filter(k=>k.startsWith(path+'/')&&!k.slice(path.length+1).includes('/')).map(snapshot)})};}
let queue=Promise.resolve();const db:any={collection,getAll:async(...refs:any[])=>refs.map(r=>snapshot(r.path)),recursiveDelete:async(r:any)=>{for(const key of docs.keys())if(key===r.path||key.startsWith(r.path+'/'))docs.delete(key);},batch:()=>{const writes:any[]=[];return {set:(r:any,v:any)=>writes.push([r.path,clone(v)]),commit:async()=>{for(const [p,v]of writes)docs.set(p,v);}};},runTransaction:(fn:any)=>{
 const run=queue.then(async()=>{const writes:any[]=[];let writing=false;const tx:any={get:async(r:any)=>{assert(!writing,'reads must precede writes');return snapshot(r.path);},getAll:async(...rs:any[])=>{assert(!writing);return rs.map(r=>snapshot(r.path));},set:(r:any,v:any)=>{writing=true;writes.push([r.path,clone(v)]);},create:(r:any,v:any)=>{writing=true;assert(!docs.has(r.path));writes.push([r.path,clone(v)]);},update:(r:any,v:any)=>{writing=true;writes.push([r.path,{...docs.get(r.path),...clone(v)}]);}};const value=await fn(tx);for(const [p,v]of writes)docs.set(p,v);return value;});queue=run.catch(()=>{});return run;
}};(globalThis as any).__firebaseTestDb=db;
const outfile='node_modules/.cache/firebase-migration-test.cjs';fs.mkdirSync('node_modules/.cache',{recursive:true});
await build({stdin:{contents:`export * from './src/db/users';export * from './src/server/firebaseStore';export * from './src/server/grammarProgress';export * from './src/server/cloudLearningState';export * from './src/server/persistentJson';export * from './src/server/userFiles';`,resolveDir:process.cwd()},outfile,bundle:true,platform:'node',format:'cjs',packages:'external',plugins:[{name:'firebase-fixture',setup(b){b.onResolve({filter:/shadowingStore$/},()=>({path:'db',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const shadowingDatabase=()=>globalThis.__firebaseTestDb;'}));}}]});
const api=createRequire(import.meta.url)('../'+outfile);
test('profiles persist, import once, preserve progress and forbid privilege import',async()=>{
 process.env.ADMIN_EMAILS='owner@example.com';const user=await api.getOrCreateUser('owner','owner@example.com',true);assert.equal(user.role,'admin');
 await api.updateUserProfile('owner',{xp:30,name:'Học viên',role:'user',isVip:true});const imported=await api.importBrowserProfile('owner',{xp:50,completedLessons:['n4-1'],role:'user',isVip:true,uid:'attacker',email:'attacker'});assert.equal(imported.xp,50);assert.equal(imported.role,'admin');assert.equal(imported.isVip,false);assert.equal(imported.uid,'owner');
 assert.equal((await api.importBrowserProfile('owner',{xp:9999})).xp,50);assert.equal((await api.getAllUsers()).length,1);
 const normal=await api.getOrCreateUser('unverified','owner@example.com',false);assert.equal(normal.role,'user');
 await api.updateUserProfile('unverified',{role:'admin'},false);assert.equal((await api.getOrCreateUser('unverified','owner@example.com',false)).role,'user');
});
test('catalog edits and tombstones survive reads without resurrecting static data',async()=>{
 const original=await api.listContent('vocabularies');assert(original.length>3000);const first=original[0];await api.saveContent('vocabularies',{meaning:'Đã sửa',reading:'よみ'},first.id);const changed=(await api.listContent('vocabularies')).find((v:any)=>v.id===first.id);assert.equal(changed.meaning,'Đã sửa');assert.equal(changed.hiragana,'よみ');await api.removeContent('vocabularies',first.id);assert(!(await api.listContent('vocabularies')).some((v:any)=>v.id===first.id));
});
test('progress increments transactionally and remains partitioned by caller',async()=>{
 await Promise.all([api.recordGrammarAttempt('owner',{grammarId:'g1',isCorrect:true}),api.recordGrammarAttempt('owner',{grammarId:'g1',isCorrect:false,mistakeText:'Lỗi'})]);const map=await api.userGrammarProgress('owner');assert.equal(map.g1.attempts,2);assert.equal(map.g1.correctCount,1);assert.deepEqual(await api.userGrammarProgress('unverified'),{});
});
test('large learning state chunks, deletion, stale updates and credential filtering',async()=>{
 assert(api.learningKey('todaii_saved_words_v1'));assert(api.learningKey('nihongo_custom_reading_history_v1'));assert(!api.learningKey('nihongo_custom_llm_v1'));assert(!api.learningKey('auth_token'));
 const key='nihon:video-learning:v1:test';await api.saveLearningState('owner',[{key,value:'',updatedAt:2}]);assert.equal((await api.getLearningState('owner'))[0].value,'');
 const value='日本語'.repeat(150000);const count=Math.ceil(value.length/200000);await api.stageLearningState('owner',{action:'begin',key,generation:'upload-1',count,length:value.length,updatedAt:50});for(let i=0;i<count;i++)await api.stageLearningState('owner',{action:'part',key,generation:'upload-1',index:i,text:value.slice(i*200000,(i+1)*200000)});await api.stageLearningState('owner',{action:'commit',key,generation:'upload-1'});
 assert.equal((await api.getLearningState('owner'))[0].value,value);await api.saveLearningState('owner',[{key,value:'stale',updatedAt:1}]);assert.equal((await api.getLearningState('owner'))[0].value,value);
 await api.saveLearningState('owner',[{key,value:null,updatedAt:60}]);assert.equal((await api.getLearningState('owner'))[0].value,null);assert.deepEqual(await api.getLearningState('unverified'),[]);
});
test('persistent JSON is chunked and imported only once',async()=>{
 const file='/workspace/scratch/afc75b3ad22b/firebase-test-seed.json';fs.writeFileSync(file,JSON.stringify({seed:true}));assert.deepEqual(await api.readPersistentJson(file),{seed:true});const v={text:'かな'.repeat(150000)};await api.writePersistentJson(file,v);fs.writeFileSync(file,'{}');assert.deepEqual(await api.readPersistentJson(file),v);fs.unlinkSync(file);
});
test('PDF parts stay private and a deletion leaves a synchronization tombstone',async()=>{
 const meta={id:'pdf_test',title:'PDF',fileName:'test.pdf'};const data='data:application/pdf;base64,JVBERi0xLjQ=';await api.writeUserFile('owner',{action:'begin',id:meta.id,generation:'g1',count:1,totalLength:data.length,metadata:meta});await api.writeUserFile('owner',{action:'part',id:meta.id,generation:'g1',index:0,data});await api.writeUserFile('owner',{action:'commit',id:meta.id,generation:'g1'});assert.equal((await api.userFilePart('owner',meta.id,0)).data,data);assert.deepEqual(await api.listUserFiles('unverified'),[]);await assert.rejects(api.userFilePart('unverified',meta.id,0));await api.writeUserFile('owner',{action:'delete',id:meta.id});assert.equal((await api.listUserFiles('owner'))[0].deleted,true);
});

test('listening JSON merges concurrent user and video updates',async()=>{
 const file='/workspace/scratch/afc75b3ad22b/listening-merge-test.json';fs.writeFileSync(file,'{}');await api.readPersistentJson(file);
 let firstReady:any;const ready=new Promise(r=>firstReady=r);let secondWritten:any;const done=new Promise(r=>secondWritten=r);
 await Promise.all([
  api.persistentRequest(async()=>{const value=await api.readPersistentJson(file);firstReady();await done;value.first={video:{currentTime:5,updatedAt:100}};await api.writePersistentJson(file,value);}),
  api.persistentRequest(async()=>{await ready;const value=await api.readPersistentJson(file);value.second={video:{currentTime:20,updatedAt:200}};await api.writePersistentJson(file,value);secondWritten();})
 ]);
 const result=await api.readPersistentJson(file);assert.equal(result.first.video.currentTime,5);assert.equal(result.second.video.currentTime,20);fs.unlinkSync(file);
});
