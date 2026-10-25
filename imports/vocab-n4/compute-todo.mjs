import fs from 'node:fs';
import path from 'node:path';

const HERE = import.meta.dirname; // imports/vocab-n4
const ROOT = path.join(HERE, '..', '..');

const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/vocabularyIllustrations.json'), 'utf8'));
const real = new Set();
const listReal = [];
for (const v of Object.values(idx)) {
  const m = String(v?.id || '').match(/tango_n4_(\d+)$/);
  if (!m) continue;
  const num = Number(m[1]);
  if (typeof v?.src === 'string' && /-v\d+\.webp$/i.test(v.src)) {
    real.add(num);
    listReal.push(num);
  }
}

const waitFiles = fs.readdirSync(HERE)
  .map(f => (f.match(/^tango_n4_(\d+)\.png$/i) || [])[1])
  .filter(Boolean)
  .map(Number);
const pend = new Set(waitFiles);

const allNeeded = [];
for (let n = 229; n <= 894; n++) allNeeded.push(n);
const harvested = allNeeded.filter(n => real.has(n) || pend.has(n));
const missing = allNeeded.filter(n => !real.has(n) && !pend.has(n));

let snapshot = null;
try { snapshot = JSON.parse(fs.readFileSync(path.join(HERE, 'inflight-snapshot.json'), 'utf8')); } catch {}
const inflightNums = new Set();
if (snapshot?.tabs) {
  for (const t of Object.values(snapshot.tabs)) {
    for (const n of (t.pending || [])) inflightNums.add(Number(n));
  }
}
const inflightTodos = missing.filter(n => inflightNums.has(n));
const gapTodos = missing.filter(n => !inflightNums.has(n));

const todo = {
  generatedAt: new Date().toISOString(),
  needed: allNeeded.length,
  harvested: harvested.length,
  missing: missing.length,
  inflightOrFailed: inflightTodos,
  inflightCount: inflightTodos.length,
  gapTodos,
  gapCount: gapTodos.length,
  snapshotRef: 'inflight-snapshot.json',
  note: 'inflightOrFailed = cac so vua submit khi ngung pump (dang tao tren Flow hoac tile mat/loi). gapTodos = so con thieu keo dai tu 229-894 sau khi tru harvested (chua submit thanh cong). De chay lai: submit lai prompt cua tat ca so trong 2 danh sach nay.'
};
fs.writeFileSync(path.join(HERE, 'todo.json'), JSON.stringify(todo, null, 2));

console.log('needed:', allNeeded.length, '| harvested:', harvested.length, '| missing:', missing.length);
console.log('inflow/failed snapshot hits:', inflightTodos.length, '->', inflightTodos.join(','));
console.log('gap todos:', gapTodos.length);
console.log('gap nums:', gapTodos.join(','));
