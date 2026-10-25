import fs from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

export async function renameVocabularyAsset(source, destination) {
  for (let attempt = 0; ; attempt++) {
    try {
      await fs.rename(source, destination);
      return;
    } catch (error) {
      if (attempt === 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) throw error;
      await setTimeout(100 * 2 ** attempt);
    }
  }
}
