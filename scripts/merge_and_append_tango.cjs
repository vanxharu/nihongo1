const fs = require('fs');

// 1. Read KANJI_TO_HAN_VIET from japaneseUtils.ts
const utilsContent = fs.readFileSync('src/utils/japaneseUtils.ts', 'utf8');
const match = utilsContent.match(/export const KANJI_TO_HAN_VIET: Record<string, string> = \{([\s\S]*?)\n\};/);
const kanjiMap = {};
if (match) {
  const lines = match[1].split('\n');
  for (const line of lines) {
    const m = line.match(/'([^']+)':\s*'([^']+)'/);
    if (m) {
      kanjiMap[m[1]] = m[2];
    }
  }
}
console.log('Loaded kanji entries:', Object.keys(kanjiMap).length);

function getHanViet(text) {
  if (!text) return '';
  const kanjis = text.split('').filter(ch => /[\u4e00-\u9faf]/.test(ch));
  if (kanjis.length === 0) return '';
  return kanjis.map(ch => {
    const hv = kanjiMap[ch];
    if (hv) {
      return hv.split(/[,/]/)[0].trim().toUpperCase();
    }
    return '';
  }).filter(Boolean).join(' ');
}

// 2. Load all 4 parts
const partA = JSON.parse(fs.readFileSync('scripts/items_part_a.json', 'utf8'));
const partB = JSON.parse(fs.readFileSync('scripts/items_part_b.json', 'utf8'));
const partC = JSON.parse(fs.readFileSync('scripts/items_part_c.json', 'utf8'));
const partD = JSON.parse(fs.readFileSync('scripts/items_part_d.json', 'utf8'));

const allNewItems = [...partA, ...partB, ...partC, ...partD];
console.log('Total new items to append:', allNewItems.length);

// Verify sequence from 640 to 894
for (let i = 0; i < allNewItems.length; i++) {
  const expectedNum = 640 + i;
  if (allNewItems[i].number !== expectedNum) {
    console.error(`Number mismatch at index ${i}: expected ${expectedNum}, got ${allNewItems[i].number}`);
    process.exit(1);
  }
}
console.log('Sequence check passed: 640 to 894 complete!');

// 3. Mapping metadata
function getMetadata(num) {
  if (num >= 640 && num <= 699) {
    return {
      chapter: "Chương 6: 毎日の生活 (Cuộc sống hàng ngày)",
      section: "Sec 1: 毎日のこと (Sinh hoạt thường ngày)",
      lessonId: "tango_c6_s1",
      lessonName: "Sec 1: 毎日のこと (Sinh hoạt thường ngày)",
      lessonTitleJp: "毎日の生活 (Cuộc sống hàng ngày)"
    };
  }
  if (num >= 700 && num <= 716) {
    return {
      chapter: "Chương 6: 毎日の生活 (Cuộc sống hàng ngày)",
      section: "Sec 2: 仕事 (Công việc)",
      lessonId: "tango_c6_s2",
      lessonName: "Sec 2: 仕事 (Công việc)",
      lessonTitleJp: "毎日の生活 (Cuộc sống hàng ngày)"
    };
  }
  if (num >= 717 && num <= 734) {
    return {
      chapter: "Chương 6: 毎日の生活 (Cuộc sống hàng ngày)",
      section: "Sec 3: ファッション (Thời trang)",
      lessonId: "tango_c6_s3",
      lessonName: "Sec 3: ファッション (Thời trang)",
      lessonTitleJp: "毎日の生活 (Cuộc sống hàng ngày)"
    };
  }
  if (num >= 735 && num <= 750) {
    return {
      chapter: "Chương 6: 毎日の生活 (Cuộc sống hàng ngày)",
      section: "Sec 4: ようす① (Dáng vẻ, trạng thái 1)",
      lessonId: "tango_c6_s4",
      lessonName: "Sec 4: ようす① (Dáng vẻ, trạng thái 1)",
      lessonTitleJp: "毎日の生活 (Cuộc sống hàng ngày)"
    };
  }
  if (num >= 751 && num <= 781) {
    return {
      chapter: "Chương 6: 毎日の生活 (Cuộc sống hàng ngày)",
      section: "Sec 5: ようす② (Dáng vẻ, trạng thái 2)",
      lessonId: "tango_c6_s5",
      lessonName: "Sec 5: ようす② (Dáng vẻ, trạng thái 2)",
      lessonTitleJp: "毎日の生活 (Cuộc sống hàng ngày)"
    };
  }
  if (num >= 782 && num <= 799) {
    return {
      chapter: "Chương 7: 日本語のいろいろ (Tiếng Nhật phong phú)",
      section: "Sec 1: ニュース (Tin tức)",
      lessonId: "tango_c7_s1",
      lessonName: "Sec 1: ニュース (Tin tức)",
      lessonTitleJp: "日本語のいろいろ (Tiếng Nhật phong phú)"
    };
  }
  if (num >= 800 && num <= 815) {
    return {
      chapter: "Chương 7: 日本語のいろいろ (Tiếng Nhật phong phú)",
      section: "Sec 2: 約束 (Hẹn, lời hứa)",
      lessonId: "tango_c7_s2",
      lessonName: "Sec 2: 約束 (Hẹn, lời hứa)",
      lessonTitleJp: "日本語のいろいろ (Tiếng Nhật phong phú)"
    };
  }
  if (num >= 816 && num <= 840) {
    return {
      chapter: "Chương 7: 日本語のいろいろ (Tiếng Nhật phong phú)",
      section: "Sec 3: 気持ち (Tâm trạng, cảm xúc)",
      lessonId: "tango_c7_s3",
      lessonName: "Sec 3: 気持ち (Tâm trạng, cảm xúc)",
      lessonTitleJp: "日本語のいろいろ (Tiếng Nhật phong phú)"
    };
  }
  if (num >= 841 && num <= 862) {
    return {
      chapter: "Chương 7: 日本語のいろいろ (Tiếng Nhật phong phú)",
      section: "Sec 4: 副詞もおぼえよう！① (Hãy nhớ cả phó từ! 1)",
      lessonId: "tango_c7_s4",
      lessonName: "Sec 4: 副詞もおぼえよう！① (Hãy nhớ cả phó từ! 1)",
      lessonTitleJp: "日本語のいろいろ (Tiếng Nhật phong phú)"
    };
  }
  if (num >= 863 && num <= 885) {
    return {
      chapter: "Chương 7: 日本語のいろいろ (Tiếng Nhật phong phú)",
      section: "Sec 5: 副詞もおぼえよう！② (Hãy nhớ cả phó từ! 2)",
      lessonId: "tango_c7_s5",
      lessonName: "Sec 5: 副詞もおぼえよう！② (Hãy nhớ cả phó từ! 2)",
      lessonTitleJp: "日本語のいろいろ (Tiếng Nhật phong phú)"
    };
  }
  if (num >= 886 && num <= 894) {
    return {
      chapter: "Chương 7: 日本語のいろいろ (Tiếng Nhật phong phú)",
      section: "Sec 6: 接続詞もおぼえよう！ (Hãy nhớ cả liên từ!)",
      lessonId: "tango_c7_s6",
      lessonName: "Sec 6: 接続詞もおぼえよう！ (Hãy nhớ cả liên từ!)",
      lessonTitleJp: "日本語のいろいろ (Tiếng Nhật phong phú)"
    };
  }
  throw new Error(`Unknown item number ${num}`);
}

function getTypeFromPos(pos) {
  switch (pos) {
    case '名': return 'Danh từ';
    case '動': return 'Động từ';
    case 'イ形': return 'Tính từ đuôi い';
    case 'ナ形': return 'Tính từ đuôi な';
    case '名/ナ形': return 'Danh từ / Tính từ đuôi な';
    case '副': return 'Phó từ';
    case '接続': return 'Liên từ';
    case '連体': return 'Liên thể từ';
    default: return pos || 'Từ vựng';
  }
}

// 4. Format vocabulary items
const formattedItems = allNewItems.map(item => {
  const meta = getMetadata(item.number);
  const hanViet = getHanViet(item.word);
  const type = getTypeFromPos(item.partOfSpeech);

  return {
    id: `tango_n4_${item.number}`,
    kanji: item.word,
    hiragana: item.reading,
    partOfSpeech: item.partOfSpeech,
    type: type,
    meaning: item.meaning_vi,
    meaningEn: item.meaning_en,
    englishMeaning: item.meaning_en,
    hanViet: hanViet,
    exampleSentence: item.example_ja,
    exampleSentenceReading: item.example_reading || item.example_ja,
    exampleTranslation: item.example_vi,
    exampleSentenceMeaning: item.example_vi,
    exampleSentenceMeaningEn: item.example_en,
    englishExampleTranslation: item.example_en,
    level: "N4",
    curriculum: "tango",
    chapter: meta.chapter,
    section: meta.section,
    lessonId: meta.lessonId,
    lessonName: meta.lessonName,
    lessonTitleJp: meta.lessonTitleJp,
    originalNumber: item.number
  };
});

// 5. Update src/data/tangoN4Vocab.ts
const targetFile = 'src/data/tangoN4Vocab.ts';
const currentContent = fs.readFileSync(targetFile, 'utf8');

// Find end of item 639
const idx639 = currentContent.indexOf('"originalNumber": 639');
if (idx639 === -1) {
  console.error('Could not find item 639 in tangoN4Vocab.ts');
  process.exit(1);
}

const endOfItem639 = currentContent.indexOf('},', idx639);
if (endOfItem639 === -1) {
  console.error('Could not find end of item 639');
  process.exit(1);
}

const baseContent = currentContent.substring(0, endOfItem639 + 2); // includes '},'

// Serialize formattedItems nicely
const newItemsStr = formattedItems.map(item => {
  return JSON.stringify(item, null, 2).split('\n').map(line => '  ' + line).join('\n');
}).join(',\n');

const finalContent = baseContent + '\n' + newItemsStr + '\n];\n';

fs.writeFileSync(targetFile, finalContent);
console.log('Successfully updated', targetFile);
console.log('Total file size:', finalContent.length, 'bytes');
