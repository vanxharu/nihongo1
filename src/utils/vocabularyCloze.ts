/** Mask the studied word, including kana spellings and spacing in imported examples. */
export function maskVocabularyInExample(sentence: string, item: { kanji?: string; hiragana?: string }): string {
  const candidates = [...new Set([item.kanji, item.hiragana]
    .filter((word): word is string => !!word)
    .map(word => word.normalize('NFC').replace(/\s/g, ''))
    .filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!sentence || !candidates.length) return sentence;

  const pattern = candidates.map(word => Array.from(word)
    .map(char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s*')).join('|');
  return sentence.normalize('NFC').replace(new RegExp(pattern, 'gu'), word =>
    '＿'.repeat(Array.from(word.replace(/\s/g, '')).length));
}
