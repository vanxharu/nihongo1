/**
 * Japanese pitch accent (dấu nhấn) lookup. Data: Kanjium (CC BY-SA 4.0), see src/data/pitchAccents.ts.
 * Words not in the dictionary return type null — the UI shows the plain reading instead of a guess.
 */
import { PITCH_ACCENTS } from '../data/pitchAccents';

export interface MoraPitch {
  char: string;
  isHigh: boolean;
  hasDrop: boolean;
}

export const toHiragana = (s: string) => (s || '').replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
/** Drop notes like "(心配を)" and spacing/tilde so "(心配を) かける" matches "かける". */
export const cleanWord = (s: string) => (s || '').replace(/[（(][^）)]*[）)]|〈[^〉]*〉|\[|\]/g, '').replace(/[\s～〜~、。?？!！]/g, '');

export function pitchKey(kanji: string, reading: string): string {
  const r = toHiragana(cleanWord(reading));
  if (!r || !/^[ぁ-ゖー]+$/.test(r)) return '';
  return `${cleanWord(kanji) || r}|${r}`;
}

/** Split kana into moras: small ゃゅょ and small vowels (ファ, ティ) join the previous kana; っ and ー count. */
export function getMoras(reading: string): string[] {
  const moras: string[] = [];
  for (const ch of Array.from(reading || '')) {
    if (/[ゃゅょャュョぁぃぅぇぉァィゥェォゎヮ]/.test(ch) && moras.length) moras[moras.length - 1] += ch;
    else moras.push(ch);
  }
  return moras;
}

export function getPitchAccent(kanji: string, reading: string, meaning = ''): { type: number | null; name: string; vietnameseName: string; explanation: string } {
  const key = pitchKey(kanji, reading);
  const type = key ? PITCH_ACCENTS[key] ?? PITCH_ACCENTS[`${key}#${meaning}`] ?? null : null;
  const n = getMoras(cleanWord(reading)).length;
  if (type === null) return { type, name: '', vietnameseName: 'Chưa có dữ liệu dấu nhấn', explanation: 'Từ này chưa có trong từ điển dấu nhấn.' };
  if (type === 0) return { type, name: 'Heiban', vietnameseName: 'Bằng phẳng (Heiban)', explanation: 'Âm đầu thấp, lên cao từ âm thứ hai và đi ngang. Trợ từ đi kèm giữ giọng cao.' };
  if (type === 1) return { type, name: 'Atamadaka', vietnameseName: 'Cao đầu (Atamadaka)', explanation: 'Âm đầu cao, từ âm thứ hai trở đi hạ thấp xuống. Trợ từ đi kèm giữ giọng thấp.' };
  if (type >= n) return { type, name: 'Odaka', vietnameseName: `Cao đuôi (Odaka - Loại ${type})`, explanation: 'Âm đầu thấp, lên cao từ âm thứ hai và giữ cao đến hết từ; trợ từ đi kèm ngay sau đó hạ thấp giọng.' };
  return { type, name: 'Nakadaka', vietnameseName: `Cao giữa (Nakadaka - Loại ${type})`, explanation: `Âm đầu thấp, lên cao từ âm thứ hai và hạ xuống ngay sau âm thứ ${type}. Trợ từ đi kèm giọng thấp.` };
}

/** High/low per mora. type = mora after which pitch drops (0 = no drop). */
export function calculateMoraPitches(reading: string, type: number): MoraPitch[] {
  return getMoras(cleanWord(reading)).map((char, i) => {
    const pos = i + 1;
    if (type === 0) return { char, isHigh: pos > 1, hasDrop: false };
    if (type === 1) return { char, isHigh: pos === 1, hasDrop: pos === 1 };
    return { char, isHigh: pos > 1 && pos <= type, hasDrop: pos === type };
  });
}
