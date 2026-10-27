import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renameVocabularyAsset } from './rename-vocab-asset.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const images = [];
for (const level of ['n4', 'n3']) {
  const source = await fs.readFile(path.join(root, `src/data/tango${level.toUpperCase()}Vocab.ts`), 'utf8');
  const words = JSON.parse(source.slice(source.indexOf('= [') + 2, source.lastIndexOf(']') + 1));
  const directory = path.join(root, `public/vocabulary-illustrations/${level}`);
  await fs.mkdir(directory, { recursive: true });
  const files = new Set(await fs.readdir(directory));
  const found = words.flatMap(word => {
    const versionPattern = new RegExp(`^${word.id}-v(\\d+)\\.webp$`);
    const versions = [...files].flatMap(name => {
      const match = name.match(versionPattern);
      return match ? [{ name, version: Number(match[1]) }] : [];
    }).sort((left, right) => right.version - left.version);
    const filename = versions[0]?.name || (files.has(`${word.id}.webp`) ? `${word.id}.webp` : null);
    return filename ? [{
      id: word.id, word: word.kanji, reading: word.hiragana,
      src: `/vocabulary-illustrations/${level}/${filename}`,
      alt: `Minh họa ngữ cảnh của ${word.kanji || word.hiragana}`,
    }] : [];
  });
  images.push(...found);
  console.log(`${level.toUpperCase()} illustrations: ${found.length}/${words.length}`);
}
const destination = path.join(root, 'src/data/vocabularyIllustrations.json');
const temporary = destination + '.' + process.pid + '.tmp';
try {
  await fs.writeFile(temporary, JSON.stringify(images, null, 2) + '\n');
  await renameVocabularyAsset(temporary, destination);
} finally {
  await fs.rm(temporary, { force: true });
}
