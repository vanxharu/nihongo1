#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Rename images downloaded from AI Studio into ordered vocabulary ids.
 *
 *   node scripts/import-ordered-images.mjs                 # dry run: show the mapping
 *   node scripts/import-ordered-images.mjs --sheet         # dry run + inbox-sheet.html preview
 *   node scripts/import-ordered-images.mjs --apply         # rename/move for real
 *   node scripts/import-ordered-images.mjs --apply --sheet # rename + preview of the final state
 *
 * Files are sorted by modification time (download order), then by name.
 * The first id comes from --start, otherwise it continues where the last run stopped.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vocabularyPath = path.join(root, 'src/data/tangoN4Vocab.ts');
const defaultInbox = path.join(root, 'imports/vocab-n4/inbox');
const defaultOutput = path.join(root, 'imports/vocab-n4');
const stateFileName = '.state.json';

const args = process.argv.slice(2);
const hasFlag = name => args.includes(name);
const optionValue = name => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};

const inbox = path.resolve(root, optionValue('--inbox') || defaultInbox);
const output = path.resolve(root, optionValue('--out') || defaultOutput);
const statePath = path.join(inbox, stateFileName);
const sheetPath = path.join(inbox, 'inbox-sheet.html');
const dryRun = !hasFlag('--apply');
const writeSheet = hasFlag('--sheet');
const force = hasFlag('--force');
const startOption = optionValue('--start');

const supportedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.bmp', '.tif', '.tiff']);

const vocabularySource = await fs.readFile(vocabularyPath, 'utf8');
const words = JSON.parse(vocabularySource.slice(vocabularySource.indexOf('= [') + 2, vocabularySource.lastIndexOf(']') + 1));
const numericId = word => Number(String(word.id).split('_').pop());
const wordByNumber = new Map(words.map(word => [numericId(word), word]));
const firstNumber = Math.min(...words.map(numericId));
const lastNumber = Math.max(...words.map(numericId));

// Words that still need an illustration are exactly the ones in the prompt bundle.
const readPromptStart = async () => {
  try {
    const firstLine = (await fs.readFile(path.join(root, 'imports/vocab-n4/prompts.jsonl'), 'utf8'))
      .split(/\r?\n/).find(Boolean);
    const id = JSON.parse(firstLine)?.id;
    const number = Number(String(id || '').split('_').pop());
    return Number.isFinite(number) ? number : 229;
  } catch {
    return 229;
  }
};
const promptStart = await readPromptStart();

const readState = async () => {
  try {
    return JSON.parse(await fs.readFile(statePath, 'utf8'));
  } catch {
    return {};
  }
};

// Without --start, continue from the last run, or from the first number that has no file yet.
const firstFreeNumber = async () => {
  const existing = await fs.readdir(output).catch(() => []);
  const used = new Set(existing.map(name => Number(name.match(/^tango_n4_(\d+)(?:-v\d+)?\./)?.[1] || 0)));
  for (let number = promptStart; number <= lastNumber; number += 1) {
    if (!used.has(number)) return number;
  }
  return lastNumber + 1;
};

const state = await readState();
const startNumber = startOption
  ? Number(startOption)
  : state.nextNumber
    ? Number(state.nextNumber)
    : await firstFreeNumber();

if (!Number.isFinite(startNumber) || startNumber < firstNumber || startNumber > lastNumber + 1) {
  console.error(`Invalid --start ${startOption ?? startNumber}: expected a number between ${firstNumber} and ${lastNumber + 1}.`);
  process.exit(1);
}

const inboxExists = await fs.stat(inbox).then(stats => stats.isDirectory(), () => false);
if (!inboxExists) {
  if (dryRun) {
    console.log(`Inbox folder does not exist yet: ${path.relative(root, inbox)}`);
    console.log('Create it and put your downloaded images inside, then run this script again.');
    process.exit(0);
  }
  await fs.mkdir(inbox, { recursive: true });
}

const entries = await fs.readdir(inbox, { withFileTypes: true });
const files = [];
for (const entry of entries) {
  if (!entry.isFile()) continue;
  if (entry.name.startsWith('.')) continue;
  if (!supportedExtensions.has(path.extname(entry.name).toLowerCase())) continue;
  const filePath = path.join(inbox, entry.name);
  const stats = await fs.stat(filePath);
  files.push({ name: entry.name, path: filePath, mtime: stats.mtimeMs, size: stats.size });
}

if (!files.length) {
  console.log(`No images found in ${path.relative(root, inbox)}.`);
  console.log('Download your AI Studio images into that folder, then run this script again.');
  process.exit(0);
}

files.sort((left, right) => left.mtime - right.mtime
  || left.name.localeCompare(right.name, undefined, { numeric: true }));

const targetNames = new Set(await fs.readdir(output).catch(() => []));
const assignments = [];
const skipped = [];

for (const [index, file] of files.entries()) {
  const number = startNumber + index;
  const word = wordByNumber.get(number);
  if (!word) {
    skipped.push({ ...file, reason: `no vocabulary word for number ${number}` });
    continue;
  }
  const targetName = `tango_n4_${number}${path.extname(file.name).toLowerCase()}`;
  const targetPath = path.join(output, targetName);
  assignments.push({ ...file, number, word, targetName, targetPath });
}

// A file already in the output folder would be overwritten: skip unless --force.
const writable = [];
for (const assignment of assignments) {
  const taken = targetNames.has(assignment.targetName)
    || await fs.stat(assignment.targetPath).then(() => true, () => false);
  if (taken && !force) {
    skipped.push({ ...assignment, reason: `${assignment.targetName} already exists (use --force to replace)` });
    continue;
  }
  writable.push(assignment);
}

const pad = value => String(value).padStart(4, ' ');
console.log(`Inbox: ${path.relative(root, inbox)} | images: ${files.length}`);
console.log(dryRun ? 'Mode: dry run (nothing is changed)' : 'Mode: apply');
console.log(`Assigning ids ${startNumber}…${startNumber + files.length - 1}`);
console.log('');

for (const item of assignments) {
  const status = writable.includes(item) ? (dryRun ? 'would rename' : 'rename') : 'skip';
  console.log(`  ${status.padEnd(11)} ${item.name} -> ${item.targetName}  (${item.word.kanji || item.word.hiragana})`);
}

if (skipped.length) {
  console.log('\nSkipped:');
  for (const item of skipped) console.log(`  ${item.name}: ${item.reason}`);
}

if (dryRun) {
  if (writable.length) {
    console.log(`\nWould rename ${writable.length} image(s) into ${path.relative(root, output)}.`);
    console.log('Run again with --apply to do it, then "npm run import:vocab".');
  }
} else {
  let moved = 0;
  for (const item of writable) {
    await fs.rename(item.path, item.targetPath);
    moved += 1;
  }
  if (moved) {
    const nextNumber = startNumber + files.length;
    await fs.writeFile(statePath, JSON.stringify({
      nextNumber,
      lastRunAt: new Date().toISOString(),
      movedThisRun: moved,
    }, null, 2) + '\n');
    console.log(`\nRenamed ${moved} image(s). Next run will start at ${nextNumber}.`);
    console.log('Next: "npm run import:vocab" to resize + rebuild the illustration index.');
  }
  // Keep the inbox clean: leftovers would otherwise be assigned to later ids on the next run.
  if (skipped.length) {
    const skipFolder = path.join(inbox, 'skipped');
    await fs.mkdir(skipFolder, { recursive: true });
    for (const item of skipped) {
      await fs.rename(item.path, path.join(skipFolder, item.name));
    }
    console.log(`Moved ${skipped.length} skipped file(s) to ${path.relative(root, skipFolder)}.`);
  }
}

if (writeSheet) {
  const allImages = (await fs.readdir(output))
    .filter(name => supportedExtensions.has(path.extname(name).toLowerCase()))
    .sort((left, right) => {
      const leftNumber = Number(left.match(/_(\d+)/)?.[1] || 0);
      const rightNumber = Number(right.match(/_(\d+)/)?.[1] || 0);
      return leftNumber - rightNumber || left.localeCompare(right);
    });

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));

  const cards = allImages.map(name => {
    const number = Number(name.match(/_(\d+)/)?.[1] || 0);
    const word = wordByNumber.get(number);
    return `
    <figure>
      <img loading="lazy" src="../${encodeURI(name)}" alt="${esc(name)}">
      <figcaption>
        <strong>${pad(number)} · ${esc(word?.kanji || '')}</strong>
        <span>${esc(word?.hiragana || '')} — ${esc(word?.meaning || '')}</span>
        <code>${esc(name)}</code>
      </figcaption>
    </figure>`;
  }).join('');

  const pending = files.filter(file => !writable.includes(file) || dryRun).map(file => {
    const assignment = assignments.find(item => item.path === file.path);
    return assignment ? { ...assignment, status: 'pending' } : { ...file, status: 'unassigned' };
  });

  const pendingCards = pending.map(item => `
    <figure class="pending">
      <img loading="lazy" src="${encodeURI(path.basename(item.path))}" alt="${esc(item.name)}">
      <figcaption>
        <strong>${item.targetName ? `${pad(item.number)} → ${esc(item.targetName)}` : esc(item.name)}</strong>
        <span>${esc(item.word?.kanji || '')} ${esc(item.word?.meaning || '')}</span>
        <code>${esc(item.name)}</code>
      </figcaption>
    </figure>`).join('');

  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inbox N4 — kiểm tra thứ tự ảnh</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0f1115; color: #e6e8ec; font: 14px/1.5 system-ui, "Segoe UI", sans-serif; }
  header { position: sticky; top: 0; background: rgba(15,17,21,.95); border-bottom: 1px solid #23262e; padding: 14px 20px; backdrop-filter: blur(8px); }
  h1 { font-size: 16px; margin: 0 0 4px; }
  p { margin: 0; color: #9aa3b2; font-size: 13px; }
  h2 { font-size: 14px; margin: 24px 20px 0; color: #93c5fd; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; padding: 16px 20px 60px; }
  figure { margin: 0; background: #14171e; border: 1px solid #23262e; border-radius: 10px; overflow: hidden; }
  figure.pending { border-color: #7c5b12; }
  img { display: block; width: 100%; aspect-ratio: 1; object-fit: contain; background: #fff; }
  figcaption { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px 10px; }
  strong { font-size: 13px; }
  span { font-size: 11px; color: #9aa3b2; }
  code { font-size: 10px; color: #7f8899; font-family: ui-monospace, Consolas, monospace; word-break: break-all; }
  .empty { padding: 40px; color: #7c8698; }
</style>
</head>
<body>
<header>
  <h1>Inbox N4 — kiểm tra thứ tự ảnh</h1>
  <p>${dryRun ? 'Chưa áp dụng: đây là thứ tự sẽ gán.' : 'Đã áp dụng: ảnh trong imports/vocab-n4 và ảnh mới xếp theo id.'}
     Ảnh được sắp theo thời gian tải về (cũ nhất trước).</p>
</header>
${pendingCards ? `<h2>Trong hộp thư chờ xử lý (${pending.length})</h2><main>${pendingCards}</main>` : ''}
<h2>Thư viện hiện tại (${allImages.length})</h2>
${allImages.length ? `<main>${cards}</main>` : '<p class="empty">Chưa có ảnh nào trong imports/vocab-n4.</p>'}
</body>
</html>
`;

  await fs.writeFile(sheetPath, html);
  console.log(`Preview written: ${path.relative(root, sheetPath)}`);
}
