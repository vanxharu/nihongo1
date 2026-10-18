import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import KaraokeCaption from '../src/components/shadowing/KaraokeCaption';

function render(text: string, analysis: any, furigana = true) {
  return renderToStaticMarkup(<KaraokeCaption text={text} time={0} start={0} end={5} analysis={analysis} furigana={furigana} />);
}

test('browser segmentation cannot swallow a reading inside a prefixed word', () => {
  assert.match(render('ご利用ください', { readings: [{ word: '利用', reading: 'りよう' }] }), /<rt>りよう<\/rt>/);
  assert.match(render('お車の方にお願いいたします', { readings: [{ word: '車', reading: 'くるま' }, { word: '方', reading: 'ほう' }] }), /<rt>おねがい<\/rt>/);
});

test('reading preferences retain katakana and numbers and respect the off switch', () => {
  const analysis = { readings: [{ word: 'いま', reading: 'いま' }, { word: 'コンビニ', reading: 'こんびに' }, { word: '3本', reading: 'さんぼん' }] };
  const html = render('いまコンビニで3本', analysis);
  assert.doesNotMatch(html, /<rt>いま<\/rt>/);
  assert.match(html, /<rt>こんびに<\/rt>/);
  assert.match(html, /<rt>さんぼん<\/rt>/);
  assert.doesNotMatch(render('いまコンビニで3本', analysis, false), /<rt>/);
});

test('all kanji in the 10 prepared lessons have rendered readings', () => {
  let count = 0;
  for (const file of fs.readdirSync('public/shadowing-analysis').filter(f => f.endsWith('.json') && f !== 'manifest.json')) {
    for (const sentence of JSON.parse(fs.readFileSync(`public/shadowing-analysis/${file}`, 'utf8')).sentences) {
      count++;
      for (const match of render(sentence.text, sentence.analysis).matchAll(/<ruby>(.*?)<\/ruby>/g)) {
        const base = match[1].split('<rt>')[0].replace(/<[^>]*>/g, '');
        if (/\p{Script=Han}/u.test(base)) assert.match(match[1], /<rt>.+?<\/rt>/, `${file}: ${sentence.text} / ${base}`);
      }
    }
  }
  assert.equal(count, 3384);
});
