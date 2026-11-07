/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VocabularyItem } from './types';
import { TANGO_N4_VOCABULARY } from './data/tangoN4Vocab.js';
import { TANGO_N5_VOCABULARY } from './data/tangoN5Vocab.js';
import { TANGO_N3_VOCABULARY } from './data/tangoN3Vocab.js';

export { TANGO_N4_VOCABULARY, TANGO_N5_VOCABULARY, TANGO_N3_VOCABULARY };

export const VOCABULARY_DATA: VocabularyItem[] = [
  ...TANGO_N4_VOCABULARY,
  ...TANGO_N5_VOCABULARY,
  ...TANGO_N3_VOCABULARY
];

// Small catalogs live in data/coreData.ts so pages that only need them do not pull the
// three Tango vocabulary sets (~370 KB gzip) imported above.
export * from './data/coreData';
