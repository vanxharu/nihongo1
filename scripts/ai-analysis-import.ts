// Usage: npx tsx scripts/ai-analysis-import.ts file.jsonl
// Each line: {"k":kind,"t":text,"tr":translation,"s":summary,"p":[[title,body],...]} → public/ai-analysis/{hash}.json
import { readFileSync, writeFileSync } from 'node:fs';
import { analysisPath } from './ai-analysis-items.js';
import { validInput, parseAnalysis } from '../src/server/aiAnalysis.js';
let n = 0;
for (const line of readFileSync(process.argv[2], 'utf8').split('\n').filter(l => l.trim())) {
  const e = JSON.parse(line);
  const input = validInput(e.k, e.t, undefined);
  if (!input) throw new Error(`Invalid item: ${line.slice(0, 80)}`);
  const analysis = parseAnalysis(JSON.stringify({ translation: e.tr || '', summary: e.s || '', points: (e.p || []).map(([title, body]: string[]) => ({ title, body })) }));
  writeFileSync(analysisPath(input.kind, input.text), JSON.stringify({ kind: input.kind, text: input.text, analysis: { ...analysis, model: 'claude-opus-5-5 (soạn sẵn)', createdAt: '2026-10-28' } }));
  n++;
}
console.log(`imported ${n}`);
