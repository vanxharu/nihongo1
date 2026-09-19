const fs = require('fs');
const path = require('path');
const n4Items = require('./n4_grammar_data_export.json');

const dataPath = path.join(__dirname, '../src/data.ts');
let content = fs.readFileSync(dataPath, 'utf8');

// Format n4Items as TypeScript objects
const tsEntries = n4Items.map(item => `  {
    id: ${JSON.stringify(item.id)},
    lessonNumber: ${item.lessonNumber},
    lessonName: ${JSON.stringify(item.lessonName)},
    structure: ${JSON.stringify(item.structure)},
    meaning: ${JSON.stringify(item.meaning)},
    explanation: ${JSON.stringify(item.explanation)},
    exampleSentence: ${JSON.stringify(item.exampleSentence)},
    exampleTranslation: ${JSON.stringify(item.exampleTranslation)},
    level: 'N4',
    wordsToReorder: ${JSON.stringify(item.wordsToReorder)},
    correctSentence: ${JSON.stringify(item.correctSentence)}
  }`).join(',\n');

const targetStr = `  {
    id: 'g_n4_mn26_1',
    structure: '〜んです',
    meaning: 'Nhấn mạnh ý muốn nói/giải thích lý do',
    explanation: 'Sử dụng khi người nói muốn giải thích nguyên nhân, lý do, hoặc nhấn mạnh một thông tin muốn trình bày với người đối thoại.',
    exampleSentence: '体調が良くないんです。',
    exampleTranslation: 'Vì tôi không khỏe.',
    level: 'N4',
    wordsToReorder: ['良くない', 'んです', '体調が'],
    correctSentence: '体調が良くないんです'
  },
  {
    id: 'test_nagara',
    structure: '〜ながら',
    meaning: 'Vừa làm V1 vừa làm V2',
    explanation: 'Diễn tả hai hành động diễn ra đồng thời cùng một lúc do cùng một người thực hiện, hành động thứ hai là hành động chính.',
    exampleSentence: '音楽を聞きながら、宿題をしています。',
    exampleTranslation: 'Tôi vừa nghe nhạc vừa làm bài tập về nhà.',
    level: 'N4',
    wordsToReorder: ['音楽を聞きながら', '宿題を', 'しています'],
    correctSentence: '音楽を聞きながら宿題をしています'
  }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, tsEntries);
  fs.writeFileSync(dataPath, content, 'utf8');
  console.log('Successfully updated src/data.ts with all 49 N4 grammar items!');
} else {
  console.error('Target string not found in src/data.ts');
}
