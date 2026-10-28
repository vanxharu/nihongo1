import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { SHADOWING_VIDEOS } from '../src/data/shadowingVideos';
import { validateStoredCues } from '../src/server/shadowingStore';
import { SHADOWING_EXTRA } from '../src/data/shadowingExtra';

test('shadowing catalog has unique videos, each with prepared sentences and furigana', () => {
  const ids = SHADOWING_VIDEOS.map(v => v.youtube_video_id);
  assert.equal(new Set(ids).size, ids.length);
  for (const [id] of SHADOWING_EXTRA) {
    const packet = JSON.parse(readFileSync(`public/shadowing-prepared/${id}.json`, 'utf8'));
    assert.equal(packet.sentenceVersion, '2026-10-04-v1');
    const cues = validateStoredCues(packet.cues);
    assert.ok(cues.length > 20 && cues.every(c => Array.isArray(c.readings)));
  }
  for (const id of ids) assert.ok(existsSync(`public/shadowing-prepared/${id}.json`) || existsSync(`public/shadowing-captions/${id}.json`), id);
});
