// Prints what the browser downloads before first paint (index.html scripts, modulepreloads, CSS)
// and the largest chunks overall. Usage: node scripts/report-bundle.mjs [distDir]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dist = process.argv[2] || 'dist';
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const kb = n => `${(n / 1024).toFixed(1)} KB`;
const size = file => {
  const buf = fs.readFileSync(path.join(dist, file));
  return { raw: buf.length, gz: zlib.gzipSync(buf, { level: 9 }).length };
};

const initial = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g)].map(m => m[1]);
let raw = 0, gz = 0;
console.log('## Initial load (from index.html)');
for (const file of [...new Set(initial)]) {
  const s = size(file); raw += s.raw; gz += s.gz;
  console.log(`${kb(s.gz).padStart(10)} gz ${kb(s.raw).padStart(10)}  ${file}`);
}
console.log(`TOTAL initial: ${kb(gz)} gzip, ${kb(raw)} raw`);

console.log('\n## Largest chunks');
const all = fs.readdirSync(path.join(dist, 'assets')).filter(f => /\.(js|css)$/.test(f))
  .map(f => ({ f, ...size(`assets/${f}`) })).sort((a, b) => b.raw - a.raw).slice(0, 15);
for (const c of all) console.log(`${kb(c.gz).padStart(10)} gz ${kb(c.raw).padStart(10)}  ${c.f}`);

const fonts = html.match(/fonts\.googleapis\.com\/css2\?[^"]+/g) || [];
console.log(`\n## Google Fonts in index.html: ${fonts.map(f => (f.match(/family=/g) || []).length).join(' + ') || 0} families`);
