const fs = require('fs');
const path = require('path');
const allTopics = require('./n4_all_topics.cjs');

const aiContentsPath = path.join(__dirname, '../src/data/grammarAiContents.json');
const aiContents = JSON.parse(fs.readFileSync(aiContentsPath, 'utf8'));

allTopics.forEach(t => {
  const base = aiContents[t.pattern] || aiContents[t.structure];
  if (base) {
    aiContents[`g_n4_topic_${t.topicNumber}`] = base;
  }
});

fs.writeFileSync(aiContentsPath, JSON.stringify(aiContents, null, 2), 'utf8');
console.log(`Updated grammarAiContents.json with fallback keys. Total keys: ${Object.keys(aiContents).length}`);
