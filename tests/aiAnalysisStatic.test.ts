import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { analysisKey } from '../src/server/aiAnalysis';

test('pre-written analyses are named by their kind+text hash and well formed', () => {
  for (const f of readdirSync('public/ai-analysis').filter(f => f.endsWith('.json'))) {
    const d = JSON.parse(readFileSync(`public/ai-analysis/${f}`, 'utf8'));
    assert.equal(f, `${analysisKey(d.kind, d.text)}.json`);
    assert.ok(Array.isArray(d.analysis.points) && d.analysis.points.length);
  }
});
