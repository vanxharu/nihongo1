import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vocabularyPath = path.join(root, 'src/data/tangoN4Vocab.ts');
const outputDirectory = path.join(root, 'imports/vocab-n4');
const promptDirectory = path.join(outputDirectory, 'prompts');

const args = process.argv.slice(2);
const optionValue = name => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};
const fromNumber = Number(optionValue('--from') || 229);
const toNumber = Number(optionValue('--to') || 894);

const style = [
  'Square 1:1 black-and-white Japanese textbook illustration in a consistent series style:',
  'thin gray outlines, light gray shading, plain white background, simple clean line art,',
  'one centered scene, generous white space, readable at small size, family friendly.',
].join(' ');

const constraints = [
  'No text, no letters, no numbers, no Japanese characters, no logos, no watermark,',
  'no color, no gradients, no photorealism, no decorative frame.',
].join(' ');

const buildPrompt = word => {
  const meaning = word.englishMeaning || word.meaning || '';
  const scene = word.englishExampleTranslation || `an everyday situation that clearly shows "${meaning}"`;
  return [
    style,
    '',
    `Word to illustrate: "${meaning}".`,
    `Scene: ${scene.replace(/\s+/g, ' ').trim()}`,
    '',
    `Make "${meaning}" immediately recognizable from the drawing alone.`,
    'If the meaning is abstract, show a simple everyday visual metaphor instead of symbols.',
    '',
    constraints,
  ].join('\n');
};

const csvCell = value => `"${String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;

const vocabularySource = await fs.readFile(vocabularyPath, 'utf8');
const words = JSON.parse(vocabularySource.slice(vocabularySource.indexOf('= [') + 2, vocabularySource.lastIndexOf(']') + 1));
const targets = words.filter(word => {
  const number = Number(word.id.split('_').pop());
  return number >= fromNumber && number <= toNumber;
});

await fs.mkdir(promptDirectory, { recursive: true });

const csvRows = [[
  'id', 'filename', 'kanji', 'hiragana', 'meaning_vi', 'meaning_en', 'example_en', 'prompt',
].map(csvCell).join(',')];
const jsonLines = [];

for (const word of targets) {
  const filename = `${word.id}.png`;
  const prompt = buildPrompt(word);
  const record = {
    id: word.id,
    filename,
    kanji: word.kanji,
    hiragana: word.hiragana,
    meaning_vi: word.meaning,
    meaning_en: word.englishMeaning,
    example_en: word.englishExampleTranslation,
    prompt,
  };
  csvRows.push([
    word.id, filename, word.kanji, word.hiragana,
    word.meaning, word.englishMeaning, word.englishExampleTranslation,
    prompt.replace(/\s*\n\s*/g, ' '),
  ].map(csvCell).join(','));
  jsonLines.push(JSON.stringify(record));
  await fs.writeFile(path.join(promptDirectory, `${word.id}.txt`), prompt + '\n');
}

await fs.writeFile(path.join(outputDirectory, 'prompts.csv'), '\uFEFF' + csvRows.join('\r\n') + '\r\n');
await fs.writeFile(path.join(outputDirectory, 'prompts.jsonl'), jsonLines.join('\n') + '\n');

// Batch file: ready to paste into a chat-style image tool, 10 words per block.
const batchSize = 10;
const compactStyle = 'black-and-white Japanese textbook line art, thin gray outlines, light gray shading, '
  + 'plain white background, one centered scene, generous white space, family friendly, '
  + 'no text, no letters, no numbers, no Japanese characters, no logos, no watermark, no color, '
  + 'no gradients, no photorealism, no decorative frame';
const batchBlocks = [];
for (let start = 0; start < targets.length; start += batchSize) {
  const slice = targets.slice(start, start + batchSize);
  const batchNumber = Math.floor(start / batchSize) + 1;
  const totalBatches = Math.ceil(targets.length / batchSize);
  const lines = [
    `### BATCH ${batchNumber}/${totalBatches} - images ${start + 1}-${start + slice.length} (${slice[0].id} .. ${slice[slice.length - 1].id})`,
    '',
    `Generate ${slice.length} separate square 1:1 images, one per numbered line below, all in the exact same style.`,
    `STYLE for every image: ${compactStyle}.`,
    '',
  ];
  slice.forEach((word, offset) => {
    const meaning = word.englishMeaning || word.meaning || '';
    const scene = String(word.englishExampleTranslation || `an everyday situation that clearly shows "${meaning}"`)
      .replace(/\s+/g, ' ').trim();
    lines.push(`${start + offset + 1}. ${word.id} - "${meaning}": ${scene}`);
  });
  batchBlocks.push(lines.join('\n'));
}
await fs.writeFile(
  path.join(outputDirectory, 'prompts-batch.txt'),
  batchBlocks.join('\n\n\n') + '\n',
);

// Self-contained helper page: click-to-copy prompts + progress tracking (localStorage).
const studioInboxPath = path.join(outputDirectory, 'inbox');
const studioItems = targets.map(word => ({
  id: word.id,
  n: Number(word.id.split('_').pop()),
  kanji: word.kanji || '',
  hiragana: word.hiragana || '',
  vi: word.meaning || '',
  en: word.englishMeaning || '',
  prompt: buildPrompt(word),
}));

const studioHtml = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>N4 Studio Prompts — ${studioItems.length} từ</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0f1115; color: #e6e8ec; font: 15px/1.5 system-ui, "Segoe UI", sans-serif; }
  header { position: sticky; top: 0; z-index: 10; background: rgba(15,17,21,.92); backdrop-filter: blur(8px); border-bottom: 1px solid #23262e; padding: 14px 18px; }
  h1 { font-size: 16px; margin: 0 0 10px; font-weight: 600; }
  .bar { height: 6px; background: #1c1f26; border-radius: 99px; overflow: hidden; margin-bottom: 6px; }
  #fill { height: 100%; width: 0; background: linear-gradient(90deg,#3b82f6,#22c55e); transition: width .2s; }
  #progress { font-size: 12px; color: #9aa3b2; }
  .tools { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 10px; }
  input[type=search] { flex: 1 1 220px; min-width: 180px; padding: 8px 10px; border-radius: 8px; border: 1px solid #2b2f39; background: #151821; color: inherit; }
  button { padding: 7px 11px; border-radius: 8px; border: 1px solid #2b2f39; background: #171a22; color: #cfd5e0; cursor: pointer; font-size: 13px; }
  button:hover { background: #1d212b; }
  button.active { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }
  a.link { padding: 7px 11px; border-radius: 8px; border: 1px solid #2b2f39; color: #93c5fd; text-decoration: none; font-size: 13px; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; padding: 16px 18px 60px; }
  .card { background: #14171e; border: 1px solid #23262e; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 6px; }
  .card[data-done="1"] { border-color: #14532d; background: #101a14; }
  .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .num { font-size: 11px; color: #7c8698; font-variant-numeric: tabular-nums; }
  .jp { font-size: 20px; font-weight: 700; }
  .kana { font-size: 12px; color: #8b93a3; }
  .vi { font-size: 13px; color: #c3cad6; }
  .en { font-size: 12px; color: #7f8899; }
  .file { font-family: ui-monospace, Consolas, monospace; font-size: 11px; color: #93c5fd; cursor: pointer; }
  pre { margin: 4px 0 0; padding: 8px; background: #0c0e13; border: 1px solid #22252d; border-radius: 8px; font: 11px/1.45 ui-monospace, Consolas, monospace; color: #9ba4b4; max-height: 96px; overflow: auto; white-space: pre-wrap; }
  .actions { display: flex; gap: 8px; margin-top: 4px; }
  .actions button { flex: 1; }
  .copy { background: #1e3a8a; border-color: #1e40af; color: #dbeafe; }
  label.done { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #9aa3b2; cursor: pointer; }
  #toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%) translateY(20px); background: #16a34a; color: #fff; padding: 9px 16px; border-radius: 99px; font-size: 13px; opacity: 0; pointer-events: none; transition: all .2s; }
  #toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  .empty { padding: 40px; color: #7c8698; grid-column: 1/-1; text-align: center; }
</style>
</head>
<body>
<header>
  <h1>N4 — ${studioItems.length} prompt minh họa</h1>
  <div class="bar"><div id="fill"></div></div>
  <div id="progress"></div>
  <div class="tools">
    <input id="search" type="search" placeholder="Tìm: 給料 / lương / salary / 229">
    <button data-filter="todo" class="active">Chưa làm</button>
    <button data-filter="all">Tất cả</button>
    <button data-filter="done">Đã làm</button>
    <a class="link" href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Mở AI Studio ↗</a>
    <button id="copyNext">Copy prompt kế tiếp (N)</button>
    <button id="copyInbox" title="Dán vào ô địa chỉ của hộp thoại lưu file">Copy path inbox</button>
    <button id="reset">Reset</button>
  </div>
</header>
<main id="grid"></main>
<div id="toast"></div>
<script>
const ITEMS = ${JSON.stringify(studioItems)};
const INBOX_PATH = ${JSON.stringify(studioInboxPath)};
const STORE = 'vocab-n4-studio-done-v1';
const done = new Set(JSON.parse(localStorage.getItem(STORE) || '[]'));
let filter = 'todo';
let query = '';

const grid = document.getElementById('grid');
const fill = document.getElementById('fill');
const progress = document.getElementById('progress');
const search = document.getElementById('search');
const toast = document.getElementById('toast');

const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save = () => localStorage.setItem(STORE, JSON.stringify([...done]));
const fileName = id => id + '.png';

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1400);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

function visible() {
  const q = query.trim().toLowerCase();
  return ITEMS.filter(item => {
    if (filter === 'todo' && done.has(item.id)) return false;
    if (filter === 'done' && !done.has(item.id)) return false;
    if (!q) return true;
    return [item.id, String(item.n), item.kanji, item.hiragana, item.vi, item.en]
      .join(' ').toLowerCase().includes(q);
  });
}

function render() {
  const list = visible();
  grid.innerHTML = list.length ? list.map(item => \`
    <article class="card" data-id="\${item.id}" data-done="\${done.has(item.id) ? 1 : 0}">
      <div class="row">
        <span class="num">\${item.n} · \${esc(item.id)}</span>
        <label class="done"><input type="checkbox" \${done.has(item.id) ? 'checked' : ''} data-toggle="\${item.id}"> đã tạo</label>
      </div>
      <div class="jp">\${esc(item.kanji)}</div>
      <div class="kana">\${esc(item.hiragana)}</div>
      <div class="vi">\${esc(item.vi)}</div>
      <div class="en">\${esc(item.en)}</div>
      <div class="row"><span class="file" data-copyfile="\${esc(fileName(item.id))}">\${esc(fileName(item.id))}</span></div>
      <pre>\${esc(item.prompt)}</pre>
      <div class="actions">
        <button class="copy" data-copy="\${item.id}">Copy prompt</button>
      </div>
    </article>\`).join('') : '<div class="empty">Không có từ nào khớp.</div>';
  progress.textContent = \`\${done.size}/\${ITEMS.length} ảnh đã tạo\`;
  fill.style.width = (done.size / ITEMS.length * 100) + '%';
}

function nextItem() {
  return ITEMS.find(item => !done.has(item.id)) || null;
}

grid.addEventListener('click', async event => {
  const copyBtn = event.target.closest('[data-copy]');
  if (copyBtn) {
    const item = ITEMS.find(entry => entry.id === copyBtn.dataset.copy);
    if (item && await copyText(item.prompt)) showToast('Đã copy prompt — lưu ảnh là ' + fileName(item.id));
    return;
  }
  const file = event.target.closest('[data-copyfile]');
  if (file) {
    if (await copyText(file.dataset.copyfile)) showToast('Đã copy tên file');
  }
});

grid.addEventListener('change', event => {
  const box = event.target.closest('[data-toggle]');
  if (!box) return;
  if (box.checked) done.add(box.dataset.toggle); else done.delete(box.dataset.toggle);
  save();
  render();
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(other => other.classList.toggle('active', other === button));
    render();
  });
});

search.addEventListener('input', () => { query = search.value; render(); });

document.getElementById('copyNext').addEventListener('click', async () => {
  const item = nextItem();
  if (!item) { showToast('Xong hết rồi 🎉'); return; }
  await copyText(item.prompt);
  showToast('Prompt ' + item.n + ' (' + fileName(item.id) + ')');
  const card = document.querySelector('[data-id="' + item.id + '"]');
  if (card) card.scrollIntoView({ block: 'center', behavior: 'smooth' });
});

document.getElementById('copyInbox').addEventListener('click', async () => {
  if (await copyText(INBOX_PATH)) showToast('Đã copy: ' + INBOX_PATH);
});

document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Xoá toàn bộ đánh dấu đã tạo?')) return;
  done.clear(); save(); render();
});

document.addEventListener('keydown', event => {
  if (event.target.matches('input, textarea')) return;
  if (event.key.toLowerCase() === 'n') document.getElementById('copyNext').click();
  if (event.key === '/') { event.preventDefault(); search.focus(); }
});

render();
</script>
</body>
</html>
`;

await fs.writeFile(path.join(outputDirectory, 'studio.html'), studioHtml);

console.log(`Prompts generated: ${targets.length} (${targets[0]?.id} .. ${targets[targets.length - 1]?.id})`);
console.log(`  ${path.relative(root, path.join(outputDirectory, 'prompts.csv'))}`);
console.log(`  ${path.relative(root, path.join(outputDirectory, 'prompts.jsonl'))}`);
console.log(`  ${path.relative(root, promptDirectory)}/ (one .txt per word)`);
console.log(`  ${path.relative(root, path.join(outputDirectory, 'prompts-batch.txt'))} (blocks of 10 for chat tools)`);
console.log(`  ${path.relative(root, path.join(outputDirectory, 'studio.html'))} (click-to-copy helper, open in a browser)`);
if (targets.length) {
  console.log('\nSample prompt (' + targets[0].id + '):\n');
  console.log(buildPrompt(targets[0]));
}
