/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GrammarItem, UserProfile } from '../types';

/**
 * Normalizes a grammar structure string into a canonical comparison key.
 * Removes extra whitespace, fullwidth variants, Unicode inconsistencies,
 * and normalizes common grammatical notation variants (e.g., V1 vs V, V-stem vs V(bỏ ます)).
 */
export function normalizeGrammarPattern(str?: string): string {
  if (!str) return '';

  let s = str
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\u3000\u00A0\r\n\t]+/g, '')
    .replace(/[\(（]/g, '(')
    .replace(/[\)）]/g, ')')
    .replace(/[\[\]【】]/g, '')
    .replace(/[〜～~]/g, '~')
    .replace(/[・·•]/g, '')
    .replace(/[\/／]/g, '/')
    .replace(/[…\.\,、]+$/g, ''); // strip trailing dots or commas

  // 1. Verb stem notations
  s = s.replace(/v[12]?\(bỏます\)/g, 'vstem');
  s = s.replace(/v[12]?\(bomasu\)/g, 'vstem');
  s = s.replace(/v[12]?-?stem/g, 'vstem');
  s = s.replace(/v[12]?\(thểます\)/g, 'vstem');

  // 2. Verb dictionary / ru form
  s = s.replace(/v[12]?\(thểtừđiển\)/g, 'vdict');
  s = s.replace(/v[12]?\(từđiển\)/g, 'vdict');
  s = s.replace(/v[12]?-?dict/g, 'vdict');

  // 3. Verb nai form
  s = s.replace(/v[12]?\(thểnại\)/g, 'vnai');
  s = s.replace(/v[12]?\(thểない\)/g, 'vnai');
  s = s.replace(/v[12]?-?nai/g, 'vnai');
  s = s.replace(/v[12]?-?ない/g, 'vnai');

  // 4. Verb ta form
  s = s.replace(/v[12]?\(thểた\)/g, 'vta');
  s = s.replace(/v[12]?-?た/g, 'vta');
  s = s.replace(/v[12]?-?ta/g, 'vta');

  // 5. Verb te form
  s = s.replace(/v[12]?\(thểて\)/g, 'vte');
  s = s.replace(/v[12]?-?て(?!ある|おく|みる|いる)/g, 'vte');
  s = s.replace(/v[12]?-?te(?!iru)/g, 'vte');
  s = s.replace(/v[12]?-?teiru/g, 'vteiru');
  s = s.replace(/v[12]?-?ている/g, 'vteiru');

  // 6. Volitional form
  s = s.replace(/v[12]?\(thểýchí[^)]*\)/g, 'vvol');
  s = s.replace(/v[12]?-?ý chí/g, 'vvol');

  // 7. Conditional form
  s = s.replace(/v[12]?-?ba/g, 'vba');
  s = s.replace(/v[12]?\(thểba\)/g, 'vba');

  // 8. Adjective / Noun notations
  s = s.replace(/a\(bỏい\/な\)/g, 'astem');
  s = s.replace(/a\(bỏい\)/g, 'astem');
  s = s.replace(/a-stem/g, 'astem');
  s = s.replace(/n-no/g, 'nno');
  s = s.replace(/nの/g, 'nno');

  // 9. Trailing/leading auxiliary markers
  s = s.replace(/\+v2$/g, '');
  s = s.replace(/、v2$/g, '');
  s = s.replace(/、~$/g, '');
  s = s.replace(/\(nghenói\)/g, '');

  // 10. Auxiliary endings variations
  s = s.replace(/みる\/みます/g, 'みます');
  s = s.replace(/おく\/おきます/g, 'おきます');
  s = s.replace(/ある\/あります/g, 'あります');
  s = s.replace(/すぎる\/すぎます/g, 'すぎます');

  // 11. Normalize operator signs
  s = s.replace(/[\+\-]/g, '+');

  // 12. Strip generic grammar descriptor words that cause false mismatches
  s = s.replace(/thểthôngthường/g, '');
  s = s.replace(/thểthường/g, '');
  s = s.replace(/kếtluận/g, '');
  s = s.replace(/phánđoán/g, '');
  s = s.replace(/địnhngữ/g, '');

  // 13. High-level semantic pattern clustering for standard Minna no Nihongo patterns
  // a) Lesson 28: 〜し、〜し (Listing reasons)
  if (s.includes('し') && (s.includes('し、') || s.includes('~し') || (s.match(/し/g) || []).length >= 2)) {
    return 'semantic_pattern_shi_shi';
  }

  // b) Lesson 19: 〜たり、〜たり (Representative actions)
  if (s.includes('tari') || (s.match(/たり/g) || []).length >= 2) {
    return 'semantic_pattern_tari_tari';
  }

  // c) Lesson 37: Passive form (受身形 - れる / られる)
  if (s.includes('bịđộng') || s.includes('受身') || (s.includes('れる') && s.includes('られる')) || s.includes('rareru')) {
    return 'semantic_pattern_ukemi_passive';
  }

  // d) Lesson 48: Causative form (使役形 - せる / させる)
  if (s.includes('saikhiến') || s.includes('使役') || (s.includes('せる') && s.includes('させる')) || s.includes('saseru')) {
    return 'semantic_pattern_shieki_causative';
  }

  // e) Lesson 33: Imperative and Prohibitive (命令形 / 禁止形)
  if (s.includes('mệnhlệnh') || s.includes('cấmchỉ') || s.includes('cấmđoán') || s.includes('命令') || s.includes('禁止')) {
    return 'semantic_pattern_meirei_kinshi';
  }

  // f) Lesson 35: Conditional form (条件形 - ば)
  if (s.includes('điềukiện') || s.includes('条件') || s.includes('ば') || s.includes('vba')) {
    return 'semantic_pattern_jouken_ba';
  }

  // g) Lesson 49: Honorifics (尊敬語 - おV-stemになります)
  if (!s.includes('khiêmnhường') && (s.includes('tônkính') || s.includes('尊敬') || s.includes('になります'))) {
    return 'semantic_pattern_sonkeigo';
  }

  // h) Lesson 50: Humble form (謙譲語 - おV-stemします)
  if (s.includes('khiêmnhường') || s.includes('謙譲') || (s.includes('お') && s.includes('します') && s.includes('いたします'))) {
    return 'semantic_pattern_kenjougo';
  }

  // i) Lesson 30: V-te arimasu (Transitive state)
  if ((s.includes('thađộngtừ') || s.includes('他動詞')) && (s.includes('ある') || s.includes('あります') || s.includes('てある'))) {
    return 'semantic_pattern_te_arimasu';
  }

  // j) Lesson 29: Jidoushi + te imasu (Intransitive state)
  if ((s.includes('tựđộngtừ') || s.includes('自動詞')) && (s.includes('いる') || s.includes('います') || s.includes('ている'))) {
    return 'semantic_pattern_jidoushi_teimasu';
  }

  // k) Lesson 29: V-te shimau (Regret / completion)
  if (s.includes('しまいます') || s.includes('しまう') || s.includes('ちゃう') || s.includes('じゃう')) {
    return 'semantic_pattern_te_shimau';
  }

  // l) Lesson 30: V-te oku (Preparation)
  if (s.includes('おきます') || s.includes('おく') || s.includes('とく') || s.includes('どく')) {
    return 'semantic_pattern_te_oku';
  }

  // m) Lesson 40: ~ka douka
  if (s.includes('かどうか')) {
    return 'semantic_pattern_ka_douka';
  }

  // n) Lesson 26: 〜んです / 〜んですが
  if (s.includes('んです') || s.includes('んだ') || s.includes('んですが') || s.includes('ndesu')) {
    return 'semantic_pattern_ndesu';
  }

  // o) Lesson 21: 〜と思う / 〜と言いました
  if (s.includes('とおもう') || s.includes('とおもいます') || s.includes('といいます') || s.includes('といいました') || (s.includes('tríchdẫn') && s.includes('nghĩ'))) {
    return 'semantic_pattern_to_omou_to_iu';
  }

  return s;
}

/**
 * Calculates a completeness score for a grammar item to decide which record
 * should be the primary when merging duplicates.
 */
export function scoreGrammarItem(item: Partial<GrammarItem>): number {
  let score = 0;

  // Prefer canonical IDs that exist in rich AI database (like g_90)
  if (item.id === 'g_90' || item.id === '90') score += 100;
  if (item.id && !item.id.includes('temp') && !item.id.includes('fallback')) score += 10;

  // Richness of explanation
  if (item.explanation) {
    score += Math.min(item.explanation.trim().length, 120);
  }

  // Examples
  if (item.exampleSentence) score += 60;
  if (item.exampleTranslation) score += 30;

  // Meaning
  if (item.meaning) {
    score += Math.min(item.meaning.trim().length, 40);
  }

  // Interactive sentence puzzle
  if (Array.isArray(item.wordsToReorder) && item.wordsToReorder.length > 0) score += 25;
  if (item.correctSentence) score += 15;

  // AI enhanced metadata
  if (item.formationRules && item.formationRules.length > 0) score += 20;
  if (item.usageGuide && Object.keys(item.usageGuide).length > 0) score += 20;
  if (item.exercises && item.exercises.length > 0) score += 20;
  if (item.isAiEnhanced) score += 30;

  // Formatting aesthetics: prefers structures with neat spacing around '+'
  if (item.structure && item.structure.includes(' + ')) score += 5;

  return score;
}

/**
 * Merges two equivalent grammar items, preserving the richest data from both
 * and recording all IDs for backward-compatible user progress tracking.
 */
export function mergeTwoGrammarItems(primary: GrammarItem, secondary: GrammarItem): GrammarItem {
  const mergedIds = Array.from(
    new Set([
      ...(primary.mergedIds || [primary.id]),
      ...(secondary.mergedIds || [secondary.id]),
      primary.id,
      secondary.id
    ].filter(Boolean))
  );

  const altStructures = Array.from(
    new Set([
      ...(primary.altStructures || []),
      ...(secondary.altStructures || []),
      primary.structure,
      secondary.structure
    ].filter(Boolean))
  );

  const merged: GrammarItem = {
    ...primary,
    mergedIds,
    altStructures,
    meaning: primary.meaning || secondary.meaning || '',
    explanation: (primary.explanation && primary.explanation.length >= (secondary.explanation?.length || 0))
      ? primary.explanation
      : (secondary.explanation || primary.explanation || ''),
    exampleSentence: primary.exampleSentence || secondary.exampleSentence || '',
    exampleTranslation: primary.exampleTranslation || secondary.exampleTranslation || '',
    wordsToReorder: (primary.wordsToReorder && primary.wordsToReorder.length > 0)
      ? primary.wordsToReorder
      : (secondary.wordsToReorder || []),
    correctSentence: primary.correctSentence || secondary.correctSentence || primary.exampleSentence || '',
    formationRules: (primary.formationRules && primary.formationRules.length > 0)
      ? primary.formationRules
      : secondary.formationRules,
    usageGuide: primary.usageGuide || secondary.usageGuide,
    notes: (primary.notes && primary.notes.length > 0) ? primary.notes : secondary.notes,
    memoryTip: primary.memoryTip || secondary.memoryTip,
    exercises: (primary.exercises && primary.exercises.length > 0) ? primary.exercises : secondary.exercises,
    examples: (primary.examples && primary.examples.length > 0) ? primary.examples : secondary.examples,
    isAiEnhanced: Boolean(primary.isAiEnhanced || secondary.isAiEnhanced)
  };

  return merged;
}

/**
 * Deduplicates a list of GrammarItem records across all lessons.
 * 1. Groups by lesson (lessonNumber or lessonId).
 * 2. Normalizes grammar patterns to identify duplicates regardless of spacing,
 *    Unicode differences, bracket styles, or shorthand notations.
 * 3. Merges duplicates into a single record with the most complete explanation/examples.
 * 4. Maintains all original IDs in `mergedIds` so user progress is never lost.
 */
export function deduplicateGrammars(items: GrammarItem[]): GrammarItem[] {
  if (!Array.isArray(items) || items.length === 0) return [];

  // Pass 1: Quick exact ID deduplication
  const idMap = new Map<string, GrammarItem>();
  for (const item of items) {
    if (!item || !item.id) continue;
    if (!idMap.has(item.id)) {
      idMap.set(item.id, item);
    } else {
      const existing = idMap.get(item.id)!;
      const primary = scoreGrammarItem(existing) >= scoreGrammarItem(item) ? existing : item;
      const secondary = primary === existing ? item : existing;
      idMap.set(item.id, mergeTwoGrammarItems(primary, secondary));
    }
  }

  const uniqueById = Array.from(idMap.values());

  // Pass 2: Group by lesson and deduplicate by normalized grammar structure
  const byLesson = new Map<string, GrammarItem[]>();

  for (const item of uniqueById) {
    const lessonKey = String(item.lessonNumber ?? item.lessonId ?? 'all');
    if (!byLesson.has(lessonKey)) {
      byLesson.set(lessonKey, []);
    }
    byLesson.get(lessonKey)!.push(item);
  }

  const result: GrammarItem[] = [];

  for (const [lessonKey, lessonItems] of byLesson.entries()) {
    const isLesson26 = lessonKey === '26' || lessonKey.endsWith('_26');
    const isLesson41 = lessonKey === '41' || lessonKey.endsWith('_41');

    const clusters = new Map<string, GrammarItem[]>();

    for (const item of lessonItems) {
      const pKey = normalizeGrammarPattern(item.structure);

      // Quarantine check: ~to omou / ~to iimashita belongs to Lesson 21, not Lesson 26
      if (isLesson26 && pKey === 'semantic_pattern_to_omou_to_iu') {
        continue;
      }

      // Quarantine check: ~te agemasu / ~te kuremasu / ~te moraimasu belongs to Lesson 24, not Lesson 41
      if (isLesson41 && (item.structure.includes('あげます') && item.structure.includes('くれます'))) {
        continue;
      }

      if (!clusters.has(pKey)) {
        clusters.set(pKey, []);
      }
      clusters.get(pKey)!.push(item);
    }

    for (const [pKey, cluster] of clusters.entries()) {
      if (cluster.length === 1) {
        const single = cluster[0];
        result.push({
          ...single,
          mergedIds: single.mergedIds || [single.id]
        });
      } else {
        // Sort cluster by completeness score descending
        cluster.sort((a, b) => scoreGrammarItem(b) - scoreGrammarItem(a));

        let merged = cluster[0];
        for (let i = 1; i < cluster.length; i++) {
          merged = mergeTwoGrammarItems(merged, cluster[i]);
        }

        // Special formatting for Lesson 26 ndesu cluster
        if (pKey === 'semantic_pattern_ndesu') {
          merged.structure = '[Thể thông thường] + んです (A-na / N: な + んです) / 〜んですが、〜';
          merged.meaning = 'Nhấn mạnh, giải thích nguyên nhân / lý do, bày tỏ sự quan tâm & Rào trước mở đầu khi nhờ vả';
        }

        result.push(merged);
      }
    }
  }

  return result;
}

/**
 * Checks a user's progress for a grammar item, checking both its primary ID
 * and any merged alias IDs.
 */
export function getGrammarStatusWithAliases(
  grammarStatusMap: Record<string, any> | undefined,
  grammar: GrammarItem | undefined
): any {
  if (!grammarStatusMap || !grammar) return undefined;

  // Direct ID check
  if (grammarStatusMap[grammar.id] !== undefined) {
    return grammarStatusMap[grammar.id];
  }

  // Check all merged alias IDs
  if (Array.isArray(grammar.mergedIds)) {
    for (const altId of grammar.mergedIds) {
      if (grammarStatusMap[altId] !== undefined) {
        return grammarStatusMap[altId];
      }
    }
  }

  return undefined;
}
