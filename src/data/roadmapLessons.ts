import { VOCABULARY_DATA, GRAMMAR_DATA, KANJI_DATA } from '../data';
import type { JLPTLevel } from '../types';
import { KANJI_DICTIONARY } from './kanjiDictionary';
import { FALLBACK_PATTERNS } from '../components/grammarData';
import { ROADMAP_ADVANCED_WORDS } from './roadmapAdvancedWords';
export function dailySlice<T>(items: T[], day: number, count: number): T[] {
    if (!items.length)
        return [];
    return Array.from({ length: Math.min(count, items.length) }, (_, i) => items[((day - 1) * count + i) % items.length]);
}
export function roadmapLesson(level: JLPTLevel, day: number) {
    const words = [...new Map([...VOCABULARY_DATA, ...ROADMAP_ADVANCED_WORDS].filter(v => v.level === level).map(v => [v.kanji + ':' + v.hiragana, v])).values()];
    const grammar = Object.entries(FALLBACK_PATTERNS[level] || {}).flatMap(([lesson, items]) => items.map((g, i) => ({ ...g, id: `roadmap-${level}-${lesson}-${i}`, level })));
    return {
        words: dailySlice(words, day, 8),
        grammar: dailySlice(grammar.length ? grammar : GRAMMAR_DATA.filter(g => g.level === level), day, 2),
        kanji: dailySlice([...new Map([
                ...KANJI_DATA.filter(k => k.level === level),
                ...Object.values(KANJI_DICTIONARY).filter(k => k.level === level).map(k => ({
                    id: `dictionary-${k.kanji}`, character: k.kanji, meaning: k.meaning,
                    onyomi: k.onyomi, kunyomi: k.kunyomi, strokesCount: k.strokes || 0,
                    level, exampleWords: KANJI_DATA.find(item => item.character === k.kanji)?.exampleWords || [], mnemonic: k.mnemonic,
                })),
            ].map(k => [k.character, k])).values()], day, 3),
        wordPool: words,
    };
}
export function quizChoices(answer: string, alternatives: string[], seed: number): string[] {
    const others = [...new Set(alternatives.filter(x => x && x !== answer))].slice(0, 3);
    const choices = [...others];
    choices.splice(seed % (choices.length + 1), 0, answer);
    return choices;
}
