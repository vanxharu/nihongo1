import { firebaseDb, clean } from '../server/firebaseStore';
import { getBootstrapAdminEmails, isBootstrapAdmin } from '../server/bootstrapAdmin';
export { getBootstrapAdminEmails } from '../server/bootstrapAdmin';
export const ADMIN_EMAILS=getBootstrapAdminEmails();
const collection=()=>firebaseDb().collection('app_users');
export const MAX_NAME_LENGTH=40;
export const normalizeUsername=(v:unknown)=>typeof v==='string'?v.toLowerCase().trim().replace(/[^a-z0-9_]/g,'').slice(0,32):'';
// Emoji / short text, an https image URL, or an inlined image data URL (profile photos are kept under ~300 KB).
export function isAllowedAvatar(v:string){return v===''||(v.length<=16&&!/[<>"']/.test(v))||(/^https:\/\/[^\s"'<>]+$/.test(v)&&v.length<=2048)||(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v)&&v.length<=450_000);}
const jsonFields=['studyDays','completedLessons','vocabStatus','grammarStatus','kanjiStatus','dailyTestResults','lastPosition','notificationSettings','myWords'];
export function profilePatch(fields:any,allowRoleChange=false) {
  const out:any={};
  for(const key of ['targetLevel','lastActiveDate'])if(typeof fields[key]==='string')out[key]=fields[key].slice(0,32);
  if(typeof fields.name==='string'){const name=fields.name.trim().slice(0,MAX_NAME_LENGTH);if(name)out.name=name;}
  if(typeof fields.avatar==='string'&&isAllowedAvatar(fields.avatar))out.avatar=fields.avatar;
  if(fields.studyTrack==='business'||fields.studyTrack==='jlpt')out.studyTrack=fields.studyTrack;
  if(fields.xpToday&&typeof fields.xpToday.d==='string'&&Number.isFinite(fields.xpToday.n))out.xpToday={d:fields.xpToday.d,n:fields.xpToday.n};
  if(typeof fields.username==='string'){const username=normalizeUsername(fields.username);if(username)out.username=username;}
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
// Login by username: only the username field is matched (never the display name, which anyone can set),
// with an indexed query instead of reading every profile. Ambiguous legacy duplicates resolve to nobody.
export async function findUserByUsername(identifier:string){const key=normalizeUsername(identifier);if(!key)return null;
  const docs=(await collection().where('username','==',key).limit(2).get()).docs;return docs.length===1?docs[0].data():null;}
export async function isUsernameTaken(username:string,uid:string){const key=normalizeUsername(username);if(!key)return false;
  return (await collection().where('username','==',key).limit(2).get()).docs.some(d=>d.id!==uid);}
// Public leaderboard: only the top entries and only the fields it shows (no progress blobs, no email).
const LEADERBOARD_FIELDS=['uid','email','name','avatar','targetLevel','xp','streak','isVip'];
export async function getLeaderboardUsers(limit=50){return (await collection().orderBy('xp','desc').limit(limit).select(...LEADERBOARD_FIELDS).get()).docs.map(d=>d.data());}
export const IMPORT_MAX_XP=20_000,IMPORT_MAX_COINS=2_000,IMPORT_MAX_DAYS=60;
export async function importBrowserProfile(uid:string,fields:any){
  const ref=collection().doc(uid);const patch=profilePatch(fields);delete patch.username;
  // One-time migration of guest progress kept in the browser. Values come from the client, so they are
  // capped: XP/coins to what a guest can plausibly earn, study days to real recent dates, streak to those days.
  const today=new Date().toISOString().slice(0,10);const oldest=new Date(Date.now()-IMPORT_MAX_DAYS*86_400_000).toISOString().slice(0,10);
  if(patch.studyDays!==undefined){let days:any[]=[];try{days=JSON.parse(patch.studyDays);}catch{}patch.studyDays=JSON.stringify((Array.isArray(days)?days:[]).filter(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&d>=oldest&&d<=today));}
  const importedDays=(()=>{try{return JSON.parse(patch.studyDays||'[]').length;}catch{return 0;}})();
  if(patch.xp!==undefined)patch.xp=Math.min(patch.xp,IMPORT_MAX_XP);
  if(patch.coins!==undefined)patch.coins=Math.min(patch.coins,IMPORT_MAX_COINS);
  if(patch.streak!==undefined)patch.streak=Math.min(patch.streak,importedDays);
  delete patch.xpToday;
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
