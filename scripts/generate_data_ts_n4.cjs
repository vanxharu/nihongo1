const fs = require('fs');
const path = require('path');
const allTopics = require('./n4_all_topics.cjs');

function splitJp(str) {
  if (!str) return [];
  const clean = str.replace(/[。！？\s]/g, '');
  if (clean.length <= 4) return [clean];
  const parts = [];
  const mid = Math.floor(clean.length / 2);
  parts.push(clean.substring(0, mid));
  parts.push(clean.substring(mid));
  return parts;
}

const n4Items = allTopics.map(t => {
  const exampleJp = t.exampleJp || (t.examples && t.examples[0] && t.examples[0].japanese) || '';
  const exampleVi = t.exampleVi || (t.examples && t.examples[0] && t.examples[0].vietnamese) || '';
  return {
    id: `g_n4_topic_${t.topicNumber}`,
    lessonNumber: t.lessonNumber,
    lessonName: `Bài ${t.lessonNumber}`,
    structure: t.pattern || t.structure,
    meaning: t.meaning,
    explanation: t.explanation,
    exampleSentence: exampleJp,
    exampleTranslation: exampleVi,
    level: 'N4',
    wordsToReorder: splitJp(exampleJp),
    correctSentence: exampleJp.replace(/[。！？\s]/g, '')
  };
});

fs.writeFileSync(
  path.join(__dirname, 'n4_grammar_data_export.json'),
  JSON.stringify(n4Items, null, 2),
  'utf8'
);

console.log(`Exported ${n4Items.length} items to n4_grammar_data_export.json`);
