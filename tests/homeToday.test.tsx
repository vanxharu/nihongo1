import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { pickWordOfDay, WeekStrip } from '../src/components/home/HomeToday';
import { TANGO_N4_VOCABULARY } from '../src/data/tangoN4Vocab';
import { localDateStr } from '../src/utils/localDate';

test('word of the day is stable within a day and changes the next day', () => {
  const a = pickWordOfDay(TANGO_N4_VOCABULARY, '2026-10-27');
  assert.equal(pickWordOfDay(TANGO_N4_VOCABULARY, '2026-10-27')?.id, a?.id);
  assert.notEqual(pickWordOfDay(TANGO_N4_VOCABULARY, '2026-10-28')?.id, a?.id);
  assert.equal(pickWordOfDay([], '2026-10-27'), undefined);
});

test('week strip marks today as studied and counts it', () => {
  const html = renderToStaticMarkup(<WeekStrip userProfile={{ studyDays: [localDateStr()], streak: 3 } as any} />);
  assert.match(html, /1\/7 ngày · chuỗi 3 ngày/);
});

test('business deck has unique ids, 14 topics and full examples', async () => {
  const { BUSINESS_VOCABULARY } = await import('../src/data/businessVocab');
  assert.equal(new Set(BUSINESS_VOCABULARY.map(v => v.id)).size, BUSINESS_VOCABULARY.length);
  assert.equal(new Set(BUSINESS_VOCABULARY.map(v => v.lessonId)).size, 14);
  for (const v of BUSINESS_VOCABULARY) assert.ok(v.kanji && v.hiragana && v.meaning && v.exampleSentence && v.exampleTranslation, v.id);
});

test('business target only switches the vocabulary track', async () => {
  const { targetChoice, targetPatch } = await import('../src/utils/studyTarget');
  assert.deepEqual(targetPatch('BIZ'), { studyTrack: 'business' });
  assert.deepEqual(targetPatch('N3'), { targetLevel: 'N3', studyTrack: 'jlpt' });
  assert.equal(targetChoice({ targetLevel: 'N4', studyTrack: 'business' }), 'BIZ');
  assert.equal(targetChoice({ targetLevel: 'N4' }), 'N4');
});
