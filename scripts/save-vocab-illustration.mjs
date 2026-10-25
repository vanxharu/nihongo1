import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { renameVocabularyAsset } from './rename-vocab-asset.mjs';

const [source, id] = process.argv.slice(2);
if (!source || !/^tango_n4_\d+$/.test(id || '')) throw new Error('Expected an image path and a Tango N4 id.');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); } catch {
  const bundled = process.env.NIHON_IMAGE_NODE_MODULES;
  if (!bundled) throw new Error('Provide sharp or NIHON_IMAGE_NODE_MODULES for local image encoding.');
  sharp = require(path.join(bundled, 'sharp'));
}
const directory = path.join(root, 'public/vocabulary-illustrations/n4');
await fs.mkdir(directory, { recursive: true });
const versionPattern = new RegExp(`^${id}-v(\\d+)\\.webp$`);
const existingVersions = (await fs.readdir(directory)).map(name => Number(name.match(versionPattern)?.[1]) || 0);
const hasBase = await fs.stat(path.join(directory, `${id}.webp`)).then(() => true, () => false);
const version = Math.max(0, ...existingVersions) + 1;
const assetId = hasBase || existingVersions.length ? `${id}-v${version}` : id;
const temporary = path.join(directory, `${assetId}.${process.pid}.tmp.webp`);
await sharp(source).resize(288, 288, { fit: 'contain', background: '#ffffff' }).webp({ quality: 84 }).toFile(temporary);
await renameVocabularyAsset(temporary, path.join(directory, `${assetId}.webp`));
await import('./build-vocab-illustration-index.mjs');
