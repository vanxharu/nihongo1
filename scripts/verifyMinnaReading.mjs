#!/usr/bin/env node
// Check structural integrity and verify the selected answers against the
// scanned book's official answer key (PDF physical pages 162–166).
// Image-dependent, short-answer, and adapted questions are NOT automatically
// certified to reproduce the original pages verbatim.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const exams = JSON.parse(readFileSync(join(root, 'src/data/readingExams.json'), 'utf8'));
const audit = JSON.parse(readFileSync(join(root, 'src/data/minnaOfficialKeyAudit.json'), 'utf8'));
const errors = [];
let answerChecks = 0;
let textChecks = 0;
let questionCount = 0;
let vocabularyCount = 0;

for (let lesson = 26; lesson <= 50; lesson++) {
  const exam = exams.find(e => e.id === `minna-topikku-${lesson}`);
  if (!exam) {
    errors.push(`Lesson ${lesson} is absent`);
    continue;
  }
  const questions = exam.parts.flatMap(part => part.items.flatMap(item => item.questions));
  questionCount += questions.length;
  vocabularyCount += exam.parts
    .filter(part => part.title.startsWith('付録語彙'))
    .flatMap(part => part.items.flatMap(item => item.lines)).length;
  const byNumber = new Map();
  for (const q of questions) {
    if (byNumber.has(q.n)) errors.push(`Lesson ${lesson}: duplicate question ${q.n}`);
    byNumber.set(q.n, q);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      errors.push(`Lesson ${lesson}/Q${q.n}: invalid answer index`);
    if (q.options.length !== q.optionsF.length)
      errors.push(`Lesson ${lesson}/Q${q.n}: options and furigana choices differ in length`);
  }
  for (const [key, expected] of Object.entries(audit.indexChecks[String(lesson)] || {})) {
    const q = byNumber.get(Number(key));
    if (!q || q.answer !== expected)
      errors.push(`Lesson ${lesson}/Q${key}: expected index ${expected}, got ${q?.answer ?? 'missing'}`);
    answerChecks++;
  }
  for (const [key, expected] of Object.entries(audit.textChecks[String(lesson)] || {})) {
    const q = byNumber.get(Number(key));
    const selected = q?.options[q.answer] || '';
    if (!selected.includes(expected))
      errors.push(`Lesson ${lesson}/Q${key}: selected '${selected}' does not contain '${expected}'`);
    textChecks++;
  }
}

console.log(`Minna reading: 25 lessons, ${questionCount} questions, ${vocabularyCount} curated vocabulary entries.`);
console.log(`Source-key assertions: ${answerChecks} indices and ${textChecks} answer-text fragments.`);
if (errors.length) {
  for (const issue of errors) console.error('FAIL:', issue);
  process.exitCode = 1;
} else {
  console.log('PASS: all currently mapped source-key and structural assertions.');
  console.log('Note: this does not certify full-text PDF transcription, drawings, or adapted questions.');
}
