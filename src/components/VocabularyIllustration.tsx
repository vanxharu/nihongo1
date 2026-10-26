import React, { useState } from 'react';
import type { VocabularyItem } from '../types';
import images from '../data/vocabularyIllustrations.json';

type Illustration = { id: string; word: string; reading: string; src: string; alt: string };
const normalize = (value: string) => value.normalize('NFKC').replace(/\s+/g, '');
const records = images as Illustration[];
const byId = new Map(records.map(image => [image.id, image]));
const byWord = new Map(records.map(image => [`${normalize(image.word)}|${normalize(image.reading)}`, image]));

function getVocabularyIllustration(item: VocabularyItem) {
  if (item.level !== 'N4') return undefined;
  const direct = byId.get(item.id);
  if (direct && normalize(direct.reading) === normalize(item.hiragana)) return direct;
  return byWord.get(`${normalize(item.kanji)}|${normalize(item.hiragana)}`);
}

const preloadedSrcs = new Set<string>();

// Warm the HTTP cache for the whole deck up front so flashcards never render an
// empty illustration frame while the browser fetches the file on first card view.
export function preloadVocabularyIllustrations(items: Array<Pick<VocabularyItem, 'id' | 'level' | 'kanji' | 'hiragana'>>) {
  for (const item of items) {
    const image = getVocabularyIllustration(item as VocabularyItem);
    if (!image || preloadedSrcs.has(image.src)) continue;
    preloadedSrcs.add(image.src);
    // Fire-and-forget: browser caches the response for later <img> mounts.
    const img = new Image();
    img.src = image.src;
  }
}

export default function VocabularyIllustration({ item }: { item: VocabularyItem }) {
  const [failed, setFailed] = useState(false);
  const image = getVocabularyIllustration(item);
  if (!image || failed) return null;
  return (
    <div className="vocab-word-illustration">
      <img
        src={image.src}
        alt={image.alt}
        width={112}
        height={112}
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
