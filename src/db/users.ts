import { firebaseDb, clean } from '../server/firebaseStore';
import { getBootstrapAdminEmails, isBootstrapAdmin } from '../server/bootstrapAdmin';
export { getBootstrapAdminEmails } from '../server/bootstrapAdmin';
export const ADMIN_EMAILS=getBootstrapAdminEmails();
const collection=()=>firebaseDb().collection('app_users');
const jsonFields=['studyDays','completedLessons','vocabStatus','grammarStatus','kanjiStatus','dailyTestResults','lastPosition','notificationSettings','myWords'];
export function profilePatch(fields:any,allowRoleChange=false) {
  const out:any={};
  for(const key of ['name','avatar','targetLevel','lastActiveDate'])if(typeof fields[key]==='string')out[key]=fields[key];
  if(fields.studyTrack==='business'||fields.studyTrack==='jlpt')out.studyTrack=fields.studyTrack;
  if(typeof fields.username==='string')out.username=fields.username.toLowerCase().trim().replace(/[^a-z0-9_]/g,'');
  for(const key of ['xp','streak','coins'])if(Number.isFinite(fields[key]))out[key]=Math.min(10000000,Math.max(0,fields[key]));
  for(const key of jsonFields)if(fields[key]!==undefined){const value=typeof fields[key]==='string'?JSON.parse(fields[key]):fields[key];out[key]=JSON.stringify(value);}
  if(allowRoleChange){if(fields.role==='admin'||fields.role==='user')out.role=fields.role;if(typeof fields.isVip==='boolean')out.isVip=fields.isVip;}
  return clean(out);
}
export async function getOrCreateUser(uid:string,email:string,emailVerified=false) {
  const ref=collection().doc(uid);const normalized=(email||'').trim().toLowerCase();
  return firebaseDb().runTransaction(async tx=>{
    const snapshot=await tx.get(ref);const existing=snapshot.data();
    if(existing){if(isBootstrapAdmin(normalized,emailVerified)&&existing.role!=='admin'){tx.update(ref,{role:'admin'});return {...existing,role:'admin'};}return existing;}
    const today=new Date().toISOString().slice(0,10);
    const value={id:uid,uid,email:normalized,username:normalized.split('@')[0].replace(/[^a-z0-9_]/g,''),name:normalized.split('@')[0]||'Học viên JLPT',avatar:'',targetLevel:'N4',xp:0,streak:0,coins:0,lastActiveDate:today,studyDays:JSON.stringify([today]),completedLessons:'[]',vocabStatus:'{}',grammarStatus:'{}',kanjiStatus:'{}',dailyTestResults:'[]',role:isBootstrapAdmin(normalized,emailVerified)?'admin':'user',isVip:false,createdAt:new Date().toISOString(),profileMigrationVersion:0};
    tx.create(ref,value);return value;
  });
}
export async function updateUserProfile(uid:string,fields:any,allowRoleChange=false) {
  const patch=profilePatch(fields,allowRoleChange);const ref=collection().doc(uid);
  return firebaseDb().runTransaction(async tx=>{const snapshot=await tx.get(ref);if(!snapshot.exists)throw new Error('USER_NOT_FOUND');tx.update(ref,patch);return {...snapshot.data(),...patch};});
}
export async function getAllUsers(){return (await collection().get()).docs.map(d=>d.data());}
export async function deleteUserByUid(uid:string){const ref=collection().doc(uid);const previous=(await ref.get()).data();await firebaseDb().recursiveDelete(ref);return previous?[previous]:[];}
export async function findUserByIdentifier(identifier:string){const key=identifier.trim().toLowerCase();if(!key)return null;const rows=await getAllUsers();return rows.find(u=>[u.username,u.email,u.name,u.email?.split('@')[0]].some(v=>typeof v==='string'&&v.toLowerCase()===key))||null;}
export async function importBrowserProfile(uid:string,fields:any){
  const ref=collection().doc(uid);const patch=profilePatch(fields);
  return firebaseDb().runTransaction(async tx=>{const snapshot=await tx.get(ref);const previous=snapshot.data();if(!previous)throw new Error('USER_NOT_FOUND');if(previous.profileMigrationVersion>=1)return previous;
    const incoming=Number(patch.xp)||0;const existing=Number(previous.xp)||0;
    // Preserve a server profile that has already accumulated more progress.
    const merged={...previous,...(incoming>=existing?patch:{}),xp:Math.max(existing,incoming),role:previous.role,isVip:previous.isVip||false,profileMigrationVersion:1};
    for(const key of ['studyDays','completedLessons']){const parse=(v:any)=>{try{return JSON.parse(v||'[]');}catch{return [];}};merged[key]=JSON.stringify([...new Set([...parse(previous[key]),...parse(patch[key])])]);}
    for(const key of ['vocabStatus','grammarStatus','kanjiStatus']){const parse=(v:any)=>{try{return JSON.parse(v||'{}');}catch{return {};}};merged[key]=JSON.stringify({...parse(patch[key]),...parse(previous[key])});}
    merged.streak=Math.max(Number(previous.streak)||0,Number(patch.streak)||0);
    tx.set(ref,clean(merged));return merged;
  });
}
