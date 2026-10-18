import 'dotenv/config';
import { listContent, saveContent } from '../src/server/firebaseStore';
import allTopics from './n4_all_topics.cjs';
for (const topic of allTopics as any[]) {
  const structure=topic.structure||topic.grammar||topic.title;
  if(!structure)continue;
  const id=`n4_${Buffer.from(String(structure)).toString('base64url')}`;
  const existing=(await listContent('grammars')).find(v=>v.structure===structure);
  if(!existing)await saveContent('grammars',{...topic,structure,level:'N4',lessonId:topic.lessonId||'n4_custom'},id);
}
console.log('N4 grammar import to Firebase completed.');
