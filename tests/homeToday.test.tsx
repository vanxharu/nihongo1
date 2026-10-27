import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { pickWordOfDay, TodayLessons, WeekStrip } from '../src/components/home/HomeToday';
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

test('today lessons render three timed tasks for a fresh profile', () => {
  const html = renderToStaticMarkup(<MemoryRouter><TodayLessons userProfile={{ targetLevel: 'N4' } as any} /></MemoryRouter>);
  assert.equal((html.match(/phút/g) || []).length, 3);
  assert.match(html, /Ngày 1\//);
});
