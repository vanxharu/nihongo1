// Turns an analysis' "Từ vựng" / "Ngữ pháp" points into highlight ranges on the analysed text (design 4).
export type Highlight = { start: number; end: number; type: 'vocab' | 'grammar' | 'chunk'; label: string; reading: string; meaning: string; inner?: Highlight[] };
type Point = { title: string; body: string };

const JP = /[぀-ヿ㐀-鿿々ー]/;
const escape = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Match ignoring the spaces textbook sentences put between words (ランチの 時間).
// Commas are ignored too, so a chunk written without 、 still matches 毎日、3時に.
const looseRegex = (s: string) => new RegExp([...s.replace(/[\s、，,]+/g, '')].map(escape).join('[\\s、，,]*'));

function vocabItems(body: string) {
  return body.split(/\s·\s/).map(part => {
    const m = part.match(/^\s*([^:：（(]+?)\s*(?:[（(]([^）)]*)[）)])?\s*[:：]\s*(.+)$/s);
    return m && JP.test(m[1]) ? { term: m[1].trim(), reading: m[2]?.trim() || '', meaning: m[3].trim() } : null;
  }).filter(Boolean) as { term: string; reading: string; meaning: string }[];
}

function grammarItems(body: string) {
  // "N の 時間: giờ dành cho N (…). もうすぐ + N です: sắp đến N."
  return body.split(/(?<=[.。])\s+(?=\S*[぀-ヿ㐀-鿿]|[NVA])/).map(part => {
    const i = part.search(/[:：]/);
    if (i < 0) return null;
    const pattern = part.slice(0, i).trim();
    // Longest run of Japanese words in the pattern is what appears in the sentence (の 時間, ところです).
    const runs = pattern.split(/\s*\+\s*|[〜～]|\b[NVA][\w-]*(?:\([^)]*\))?\s*/).map(r => r.trim()).filter(r => JP.test(r));
    const key = runs.sort((a, b) => b.replace(/\s/g, '').length - a.replace(/\s/g, '').length)[0];
    return key && key.replace(/\s/g, '').length >= 2 ? { key, label: pattern, meaning: part.slice(i + 1).trim().replace(/\.$/, '') } : null;
  }).filter(Boolean) as { key: string; label: string; meaning: string }[];
}

/** Non-overlapping highlights in text order, plus which points were fully turned into highlights. */
export function analysisHighlights(text: string, points: Point[]) {
  const found: Highlight[] = [];
  const used = new Set<number>();
  const free = (s: number, e: number) => found.every(h => e <= h.start || s >= h.end);
  // Sentence analyses split the sentence into quoted chunks (title = the chunk itself): those come first.
  points.forEach((p, i) => {
    if (/từ vựng|ngữ pháp/i.test(p.title) || !JP.test(p.title)) return;
    const m = looseRegex(p.title).exec(text);
    if (m && free(m.index, m.index + m[0].length)) {
      found.push({ start: m.index, end: m.index + m[0].length, type: 'chunk', label: p.title, reading: '', meaning: p.body });
      used.add(i);
    }
  });
  // Grammar before vocab: a word inside a grammar match (時間 in の 時間) is shown inside that match's card.
  const order = points.map((p, i) => i).sort((a, b) => Number(/ngữ pháp/i.test(points[b].title)) - Number(/ngữ pháp/i.test(points[a].title)));
  order.forEach(i => {
    const p = points[i];
    const vocab = /từ vựng/i.test(p.title), grammar = /ngữ pháp/i.test(p.title);
    if (!vocab && !grammar) return;
    const items = vocab ? vocabItems(p.body).map(v => ({ key: v.term, label: v.term, reading: v.reading, meaning: v.meaning }))
      : grammarItems(p.body).map(g => ({ ...g, reading: '' }));
    let hits = 0;
    for (const it of items) {
      const re = new RegExp(looseRegex(it.key).source, 'g');
      for (let m; (m = re.exec(text));) {
        const h: Highlight = { start: m.index, end: m.index + m[0].length, type: vocab ? 'vocab' : 'grammar', label: it.label, reading: it.reading, meaning: it.meaning };
        if (free(h.start, h.end)) { found.push(h); hits++; break; }
        const outer = vocab && found.find(g => g.type === 'grammar' && g.start <= h.start && h.end <= g.end);
        if (outer) { (outer.inner ||= []).push(h); hits++; break; }
      }
    }
    if (items.length && hits === items.length) used.add(i);
  });
  return { highlights: found.sort((a, b) => a.start - b.start), usedPoints: used };
}
