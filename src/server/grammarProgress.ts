import { firebaseDb, documentKey, clean } from './firebaseStore';
export function nextGrammarProgress(current:any, input:any, now=new Date()) {
  const attempts=(Number(current?.attempts)||0)+1;
  const correctCount=(Number(current?.correctCount)||0)+(input.isCorrect===true?1:0);
  const incorrectCount=(Number(current?.incorrectCount)||0)+(input.isCorrect===true?0:1);
  const gain=Number.isFinite(input.score)?Math.round(Math.max(0,Math.min(100,input.score))*.2):15;
  const masteryScore=input.isCorrect===true?Math.min(100,(Number(current?.masteryScore)||0)+gain):Math.max(0,(Number(current?.masteryScore)||0)-20);
  const status=masteryScore>=90&&attempts>=3?'mastered':masteryScore>=70?'practicing':input.isCorrect!==true||masteryScore<40?'review':'learning';
  const days=status==='mastered'?14:status==='practicing'?5:status==='review'?1:2;
  const mistakes=Array.isArray(current?.recentMistakes)?[...current.recentMistakes]:[];
  if(input.isCorrect!==true&&typeof input.mistakeText==='string')mistakes.unshift(input.mistakeText.slice(0,1000));
  return {grammarId:input.grammarId,status,masteryScore,attempts,correctCount,incorrectCount,accuracyRate:Math.round(correctCount/attempts*100),lastStudiedAt:now.toISOString(),nextReviewAt:new Date(now.getTime()+days*86400000).toISOString(),recentMistakes:mistakes.slice(0,5),needsReview:status==='review'||masteryScore<70};
}
export async function recordGrammarAttempt(uid:string,input:any){
  if(typeof input.grammarId!=='string'||!input.grammarId||input.grammarId.length>150||typeof input.isCorrect!=='boolean')throw new Error('INVALID_PROGRESS');
  const ref=firebaseDb().collection('app_users').doc(uid).collection('grammar_progress').doc(documentKey(input.grammarId));
  return firebaseDb().runTransaction(async tx=>{const current=(await tx.get(ref)).data();const next=nextGrammarProgress(current,input);tx.set(ref,clean(next));return next;});
}
export async function userGrammarProgress(uid:string){const snapshot=await firebaseDb().collection('app_users').doc(uid).collection('grammar_progress').get();return Object.fromEntries(snapshot.docs.map(d=>{const v=d.data();return [v.grammarId,{...v,needsReview:v.needsReview||new Date(v.nextReviewAt)<=new Date()}];}));}
