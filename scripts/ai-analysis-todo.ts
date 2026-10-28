// Usage: npx tsx scripts/ai-analysis-todo.ts [groupPrefix] [limitGroups]
// Prints progress per section and the next missing items (JSON lines) to write.
import { existsSync } from 'node:fs';
import { allItems, analysisPath } from './ai-analysis-items.js';
const [prefix = '', limit = '1'] = process.argv.slice(2);
const items = allItems();
const stats: Record<string, [number, number]> = {};
for (const i of items) { const s = (stats[i.group.split(':')[0]] ||= [0, 0]); s[1]++; if (existsSync(analysisPath(i.kind, i.text))) s[0]++; }
console.error(Object.entries(stats).map(([k, [d, t]]) => `${k}: ${d}/${t}`).join(' · '));
const groups: string[] = [];
for (const i of items) {
  if (!i.group.startsWith(prefix) || existsSync(analysisPath(i.kind, i.text))) continue;
  if (!groups.includes(i.group)) { if (groups.length >= Number(limit)) break; groups.push(i.group); }
  console.log(JSON.stringify({ k: i.kind, t: i.text, c: i.context }));
}
