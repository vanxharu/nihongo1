import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { renameVocabularyAsset } from './rename-vocab-asset.mjs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const level = (process.argv[process.argv.indexOf('--level') + 1] || '').match(/^n[345]$/) ? process.argv[process.argv.indexOf('--level') + 1] : 'n4';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vocabularyPath = path.join(root, `src/data/tango${level.toUpperCase()}Vocab.ts`);
const outputDirectory = path.join(root, `public/vocabulary-illustrations/${level}`);
const defaultSource = path.join(root, `imports/vocab-${level}`);
const manifestPath = path.join(defaultSource, 'manifest.csv');

const args = process.argv.slice(2);
const hasFlag = name => args.includes(name);
const optionValue = name => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};

const source = path.resolve(root, optionValue('--source') || defaultSource);
const dryRun = hasFlag('--dry-run');
const recursive = hasFlag('--recursive');
const writeManifest = hasFlag('--manifest');
const rebuildIndex = !hasFlag('--no-index');

const supportedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.bmp', '.tif', '.tiff']);
const stripDecorations = value => String(value || '')
  .replace(/[〈〉《》「」『』[\]（）(){}~～\s・]/g, '')
  .toLowerCase();
const stripBracketContents = value => String(value || '')
  .replace(/[〈《（(【[][^〉》）)】\]]*[〉》）)】\]]/g, '')
  .toLowerCase();
const wordAliases = value => {
  const variants = new Set();
  for (const text of [value, stripBracketContents(value)]) {
    const key = stripDecorations(text);
    if (key) variants.add(key);
  }
  return variants;
};

const vocabularySource = await fs.readFile(vocabularyPath, 'utf8');
const words = JSON.parse(vocabularySource.slice(vocabularySource.indexOf('= [') + 2, vocabularySource.lastIndexOf(']') + 1));
const wordsById = new Map(words.map(word => [word.id, word]));
const wordsByText = new Map();
for (const word of words) {
  for (const text of [word.kanji, word.hiragana]) {
    for (const key of wordAliases(text)) {
      if (key && !wordsByText.has(key)) wordsByText.set(key, word);
    }
  }
}

const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

if (writeManifest) {
  const rows = [
    ['id', 'filename', 'kanji', 'hiragana', 'english_meaning', 'english_example'].map(csvCell).join(','),
    ...words.map(word => [
      word.id,
      `${word.id}.png`,
      word.kanji,
      word.hiragana,
      word.englishMeaning,
      word.englishExampleTranslation,
    ].map(csvCell).join(',')),
  ];
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, '\uFEFF' + rows.join('\r\n') + '\r\n');
  console.log(`Manifest written: ${path.relative(root, manifestPath)} (${words.length} rows)`);
}

if (!dryRun) await fs.mkdir(outputDirectory, { recursive: true });

const listImages = async directory => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (recursive) files.push(...await listImages(entryPath));
      continue;
    }
    if (supportedExtensions.has(path.extname(entry.name).toLowerCase())) files.push(entryPath);
  }
  return files;
};

const sourceExists = await fs.stat(source).then(stats => stats.isDirectory(), () => false);
if (!sourceExists) {
  console.error(`Source folder not found: ${source}`);
  console.error('Create it and put your images there, or pass --source <folder>.');
  process.exit(writeManifest ? 0 : 1);
}

const files = (await listImages(source)).sort((left, right) => {
  const leftBase = path.basename(left);
  const rightBase = path.basename(right);
  const canonical = new RegExp(`^tango_${level}_\\d+\\.`, 'i');
  if (canonical.test(leftBase) !== canonical.test(rightBase)) return canonical.test(leftBase) ? -1 : 1;
  return leftBase.localeCompare(rightBase, undefined, { numeric: true });
});

if (!files.length) {
  console.log(`No supported images found in ${path.relative(root, source)}.`);
  process.exit(0);
}

const resolveWord = file => {
  const base = path.basename(file, path.extname(file));
  const numeric = base.match(new RegExp(`^(?:tango[_-]?${level}[_-]?)?(\\d+)$`, 'i'));
  if (numeric) return wordsById.get(`tango_${level}_${Number(numeric[1])}`) || null;
  return wordsByText.get(stripDecorations(base)) || null;
};

const existingFiles = new Set(await fs.readdir(outputDirectory));
const highestVersion = wordId => {
  let version = 0;
  const pattern = new RegExp(`^${wordId}-v(\\d+)\\.webp$`);
  for (const name of existingFiles) {
    const match = name.match(pattern);
    if (match) version = Math.max(version, Number(match[1]));
  }
  return version;
};
const hasAnyImage = wordId => existingFiles.has(`${wordId}.webp`)
  || [...existingFiles].some(name => name.startsWith(`${wordId}-v`) && name.endsWith('.webp'));

const seen = new Map();
const unknown = [];
const duplicates = [];
const resolved = [];

for (const file of files) {
  const word = resolveWord(file);
  if (!word) {
    unknown.push(file);
    continue;
  }
  if (seen.has(word.id)) {
    duplicates.push({ id: word.id, kept: seen.get(word.id), skipped: file });
    continue;
  }
  seen.set(word.id, file);
  resolved.push({ word, file });
}

console.log(`Source: ${path.relative(root, source)}`);
console.log(`Images found: ${files.length} | matched: ${resolved.length} | unknown: ${unknown.length} | duplicates: ${duplicates.length}${dryRun ? ' (dry run)' : ''}`);

let imported = 0;
let failed = 0;
const failures = [];

for (const { word, file } of resolved) {
  const version = highestVersion(word.id) + 1;
  const assetId = hasAnyImage(word.id) ? `${word.id}-v${version}` : word.id;
  if (!dryRun) {
    const temporary = path.join(outputDirectory, `${assetId}.${process.pid}.tmp.webp`);
    try {
      await sharp(file)
        .flatten({ background: '#ffffff' })
        .resize(288, 288, { fit: 'contain', background: '#ffffff' })
        .webp({ quality: 84 })
        .toFile(temporary);
      await renameVocabularyAsset(temporary, path.join(outputDirectory, `${assetId}.webp`));
      existingFiles.add(`${assetId}.webp`);
      imported += 1;
      if (imported % 25 === 0) console.log(`  imported ${imported}/${resolved.length}`);
    } catch (error) {
      failed += 1;
      failures.push({ file, error: error.message });
      await fs.rm(temporary, { force: true });
    }
  }
}

if (unknown.length) {
  console.log('\nUnrecognised filenames (rename them to tango_${level}_<number>.<ext> or <number>.<ext>):');
  for (const file of unknown.slice(0, 20)) console.log(`  ${path.relative(source, file)}`);
  if (unknown.length > 20) console.log(`  ... and ${unknown.length - 20} more`);
}

if (duplicates.length) {
  console.log('\nDuplicate images for the same word (first one kept):');
  for (const item of duplicates.slice(0, 20)) {
    console.log(`  ${item.id}: kept ${path.basename(item.kept)}, skipped ${path.basename(item.skipped)}`);
  }
}

if (failures.length) {
  console.log('\nFailed conversions:');
  for (const item of failures.slice(0, 20)) console.log(`  ${path.relative(source, item.file)}: ${item.error}`);
}

const remaining = words.filter(word => !hasAnyImage(word.id));
console.log(`\n${dryRun ? 'Would import' : 'Imported'}: ${dryRun ? resolved.length : imported}`);
if (failed) console.log(`Failed: ${failed}`);
console.log(`Coverage: ${words.length - remaining.length}/${words.length}`);
if (remaining.length) console.log(`Still missing: ${remaining.length} (${remaining.slice(0, 5).map(word => word.id).join(', ')}...)`);

if (!dryRun && !failed && rebuildIndex) {
  await import('./build-vocab-illustration-index.mjs');
}
