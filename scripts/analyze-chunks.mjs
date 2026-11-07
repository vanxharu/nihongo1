// Attributes the bytes of the startup chunks to source files / packages using source maps.
// Usage: vite build --sourcemap --outDir dist-analyze && node scripts/analyze-chunks.mjs dist-analyze
import fs from 'node:fs';
import path from 'node:path';
import { SourceMapConsumer } from 'source-map-js';

const dist = process.argv[2] || 'dist-analyze';
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const files = [...new Set([...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)].map(m => m[1]))];
const group = src => {
  const s = src.replace(/^(\.\.\/)+/, '').replace(/\\/g, '/');
  const nm = s.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  return nm ? `pkg:${nm[1]}` : s;
};
for (const file of files) {
  const code = fs.readFileSync(path.join(dist, file), 'utf8');
  const mapFile = path.join(dist, file + '.map');
  if (!fs.existsSync(mapFile)) continue;
  const consumer = new SourceMapConsumer(JSON.parse(fs.readFileSync(mapFile, 'utf8')));
  const lines = code.split('\n');
  const bytes = new Map();
  let prev = null;
  const flush = (line, endCol) => {
    if (!prev || prev.line !== line) return;
    const len = Math.max(0, endCol - prev.col);
    bytes.set(prev.key, (bytes.get(prev.key) || 0) + len);
  };
  consumer.eachMapping(m => {
    if (prev && prev.line !== m.generatedLine) flush(prev.line, lines[prev.line - 1].length);
    else if (prev) flush(m.generatedLine, m.generatedColumn);
    prev = { line: m.generatedLine, col: m.generatedColumn, key: m.source ? group(m.source) : '(no source)' };
  });
  if (prev) flush(prev.line, lines[prev.line - 1].length);
  const total = code.length;
  console.log(`\n## ${file} — ${(total / 1024).toFixed(1)} KB`);
  for (const [k, v] of [...bytes].sort((a, b) => b[1] - a[1]).slice(0, 30)) {
    console.log(`${(v / 1024).toFixed(1).padStart(8)} KB ${(100 * v / total).toFixed(1).padStart(5)}%  ${k}`);
  }
}
