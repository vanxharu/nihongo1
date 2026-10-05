import test from 'node:test';
import assert from 'node:assert/strict';
import { roadmapLesson, dailySlice, quizChoices } from '../src/data/roadmapLessons.ts';

test('daily lesson is stable, changes by day and never mixes JLPT levels', () => {
  for (const level of ['N5','N4','N3','N2','N1']) {
    const lesson = roadmapLesson(level, 1);
    assert.ok(lesson.words.length > 0 && lesson.grammar.length > 0 && lesson.kanji.length > 0);
    assert.deepEqual(lesson, roadmapLesson(level, 1));
    for (const category of ['words','grammar','kanji']) {
      assert.ok(lesson[category].every(item => item.level === level));
      assert.equal(new Set(lesson[category].map(item => item.id)).size, lesson[category].length);
    }
  }
  assert.notDeepEqual(roadmapLesson('N5',1).words, roadmapLesson('N5',2).words);
});
test('short and empty datasets cannot produce undefined or duplicate items', () => {
  assert.deepEqual(dailySlice([], 60, 8), []);
  assert.deepEqual(dailySlice(['a','b'], 60, 8).sort(), ['a','b']);
});
test('answer appears exactly once and distractors are distinct', () => {
  for (let day=1; day<=90; day++) {
    const options=quizChoices('correct',['correct','wrong','wrong','','other','third'],day);
    assert.equal(options.filter(x=>x==='correct').length,1);
    assert.equal(new Set(options).size,options.length);
    assert.equal(options.length,4);
  }
});
