import { describe, expect, it } from 'vitest';
import { verbsFromItems } from '../src/components/VocabConjugateMode';
import type { VocabularyItem } from '../src/types';

const it_ = (kanji: string, hiragana: string, partOfSpeech = '動') => ({ kanji, hiragana, meaning: 'x', partOfSpeech } as VocabularyItem);
describe('verbsFromItems', () => {
  it('phân nhóm và lọc thẻ không phải động từ', () => {
    const v = verbsFromItems([it_('座る', 'すわる'), it_('帰る', 'かえる'), it_('食べる', 'たべる'), it_('勉強〈する〉', 'べんきょうする'), it_('来る', 'くる'), it_('本', 'ほん', '名'), it_('(心配を) かける', 'かける')]);
    expect(v.map(x => x.g)).toEqual([1, 1, 2, 3, 3, 2]);
    expect(v[3].kanji).toBe('勉強する');
    expect(v[5].kanji).toBe('かける');
  });
});
