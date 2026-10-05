import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dailyExercises, EXERCISE_TYPES, exerciseText } from '../src/data/roadmapExercises.ts';

test('all levels get distinct question types and all four JLPT sections',()=>{
  for(const level of ['N5','N4','N3','N2','N1']) {
    const items=dailyExercises(level,1);
    assert.ok(new Set(items.map(q=>q.type)).size>=9);
    assert.deepEqual([...new Set(items.map(q=>q.section))],['moji-goi','bunpou','dokkai','choukai']);
    assert.equal(new Set(items.map(q=>q.id)).size,items.length);
    if(level==='N1')assert.ok(items.every(q=>q.type!=='spelling'));
    if(level==='N5')assert.ok(items.every(q=>q.type!=='usage'));
  }
});
test('all 90 days have answerable questions, full context and existing local assets',()=>{
  for(const level of ['N5','N4','N3','N2','N1']) for(let day=1;day<=90;day++) {
    for(const q of dailyExercises(level,day)) {
      assert.ok(EXERCISE_TYPES[q.type]);
      assert.ok(q.options.length>=3 && q.correctIndex>=0 && q.correctIndex<q.options.length);
      assert.equal(new Set(q.options).size,q.options.length);
      assert.ok(!q.question.includes('...')||q.contextPassage);
      if(q.section==='choukai')assert.ok(q.audioUrl||q.audioScript||q.audioTrack);
      for(const asset of [q.imageUrl,q.audioUrl])if(asset?.startsWith('/'))assert.ok(existsSync(new URL('../public'+asset,import.meta.url)),asset);
    }
  }
});
test('daily selection is repeatable, rotates questions and preserves answers after option rotation',()=>{
  assert.deepEqual(dailyExercises('N4',10),dailyExercises('N4',10));
  assert.notDeepEqual(dailyExercises('N4',1).map(q=>q.id),dailyExercises('N4',2).map(q=>q.id));
  const first=dailyExercises('N1',1).find(q=>q.id==='practice-N1-text');
  for(let day=2;day<=90;day++) {
    const q=dailyExercises('N1',day).find(q=>q.id===first.id);
    assert.equal(q.options[q.correctIndex],first.options[first.correctIndex]);
  }
  assert.equal(exerciseText('A\\nB\\\\nC'),'A\nB\nC');
});