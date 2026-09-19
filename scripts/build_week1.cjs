const fs = require('fs');

// Read existing week 1 from shinNihongo500Data.ts
const content = fs.readFileSync('src/data/shinNihongo500Data.ts', 'utf8');

// Q101 to Q125 questions to complete Unit 3 (Week 1 Day 5~7)
const q101_to_125 = [
  {
    id: 's500_q101',
    number: 101,
    sectionTitle: '第1週 7日目 [文法]',
    question: '今日の 授業は＿＿＿でしたか。',
    options: ['どう', 'どうやって'],
    correctIndex: 0,
    hint: 'Tiết học hôm nay thế nào?',
    explanation: '【Đáp án 1: どう】(Sách trang 73): どうでしたか (thế nào rồi, hỏi về trạng thái/cảm tưởng). どうやって (bằng cách nào, hỏi phương pháp).'
  },
  {
    id: 's500_q102',
    number: 102,
    sectionTitle: '第1週 7日目 [文法]',
    question: '弟は、今ごろ ゲームを＿＿＿。',
    options: ['やります', 'やっているでしょう'],
    correctIndex: 1,
    hint: 'Em trai tôi tầm này chắc đang chơi game.',
    explanation: '【Đáp án 2: やっているでしょう】(Sách trang 73): 〜ているでしょう (suy đoán hành động đang diễn ra vào thời điểm hiện tại: chắc là đang...).'
  },
  {
    id: 's500_q103',
    number: 103,
    sectionTitle: '第1週 7日目 [文字]',
    question: 'この 時計は スイスのです。',
    options: ['とかい', 'とけい'],
    correctIndex: 1,
    hint: 'Chiếc đồng hồ này là của Thụy Sĩ.',
    explanation: '【Đáp án 2: とけい】(Sách trang 74): 時計 (とけい: đồng hồ).'
  },
  {
    id: 's500_q104',
    number: 104,
    sectionTitle: '第1週 7日目 [文字]',
    question: 'おさきに しつれいします。',
    options: ['お先に', 'お前に'],
    correctIndex: 0,
    hint: 'Tôi xin phép về trước.',
    explanation: '【Đáp án 1: お先に】(Sách trang 74): お先に失礼します (おさきにしつれいします: chào khi về trước).'
  },
  {
    id: 's500_q105',
    number: 105,
    sectionTitle: '第1週 7日目 [語い]',
    question: '花を もらったけれど、＿＿＿花びんが ない。',
    options: ['いれる', 'はいれる'],
    correctIndex: 0,
    hint: 'Được tặng hoa nhưng không có bình hoa để cắm vào.',
    explanation: '【Đáp án 1: いれる】(Sách trang 74): 入れる (tha động từ: cắm/bỏ vào bình). 入る (tự động từ: đi vào).'
  },
  {
    id: 's500_q106',
    number: 106,
    sectionTitle: '第1週 7日目 [語い]',
    question: 'この へんは 人が 少なくて とても＿＿＿です。',
    options: ['にぎやか', 'しずか'],
    correctIndex: 1,
    hint: 'Vùng này ít người nên rất yên tĩnh.',
    explanation: '【Đáp án 2: しずか】(Sách trang 74): 静か (しずか: yên tĩnh) ⇔ にぎやか (nhộn nhịp).'
  },
  {
    id: 's500_q107',
    number: 107,
    sectionTitle: '第1週 7日目 [文法]',
    question: 'よく＿＿＿。もう一度 お願いします。',
    options: ['聞こえませんでした', '聞きませんでした'],
    correctIndex: 0,
    hint: 'Tôi không nghe rõ. Xin hãy nói lại lần nữa.',
    explanation: '【Đáp án 1: 聞こえませんでした】(Sách trang 74): 聞こえる (khả năng tiếp nhận âm thanh tự nhiên: nghe thấy/nghe rõ).'
  },
  {
    id: 's500_q108',
    number: 108,
    sectionTitle: '第1週 7日目 [文法]',
    question: 'この カレー、あまり＿＿＿ね。',
    options: ['からいです', 'からくありません'],
    correctIndex: 1,
    hint: 'Món cà ri này không cay lắm nhỉ.',
    explanation: '【Đáp án 2: からくありません】(Sách trang 74): あまり〜ない (không... lắm): あまり辛くありません.'
  },
  {
    id: 's500_q109',
    number: 109,
    sectionTitle: '第1週 7日目 [文字]',
    question: 'すみません、上着を ぬいても いいですか。',
    options: ['うわぎ', 'うえき'],
    correctIndex: 0,
    hint: 'Xin lỗi, tôi có thể cởi áo khoác ngoài được không?',
    explanation: '【Đáp án 1: うわぎ】(Sách trang 75): 上着 (うわぎ: áo khoác ngoài).'
  },
  {
    id: 's500_q110',
    number: 110,
    sectionTitle: '第1週 7日目 [文字]',
    question: 'みんなで わけましょう。',
    options: ['分けましょう', '半けましょう'],
    correctIndex: 0,
    hint: 'Mọi người hãy chia nhau nhé.',
    explanation: '【Đáp án 1: 分けましょう】(Sách trang 75): 分ける (わける: chia ra).'
  },
  {
    id: 's500_q111',
    number: 111,
    sectionTitle: '第1週 7日目 [語い]',
    question: 'この 問題が わかる 人は、手を＿＿＿ください。',
    options: ['あげて', 'あがって'],
    correctIndex: 0,
    hint: 'Ai hiểu câu hỏi này xin hãy giơ tay lên.',
    explanation: '【Đáp án 1: あげて】(Sách trang 75): 手をあげる (giơ tay lên, tha động từ).'
  },
  {
    id: 's500_q112',
    number: 112,
    sectionTitle: '第1週 7日目 [語い]',
    question: '明日は 旅行に 行くので、早く 家を＿＿＿。',
    options: ['でます', 'いそぎます'],
    correctIndex: 0,
    hint: 'Ngày mai đi du lịch nên tôi sẽ ra khỏi nhà sớm.',
    explanation: '【Đáp án 1: でます】(Sách trang 75): 家を出る (ra khỏi nhà: 〜を出る).'
  },
  {
    id: 's500_q113',
    number: 113,
    sectionTitle: '第1週 7日目 [文法]',
    question: 'この 問題は＿＿＿できません。',
    options: ['むずかしくて', 'むずかしかったから'],
    correctIndex: 0,
    hint: 'Câu hỏi này khó quá nên tôi không làm được.',
    explanation: '【Đáp án 1: むずかしくて】(Sách trang 75): Aくて〜 (chỉ nguyên nhân hệ quả tự nhiên: khó quá nên không thể làm).'
  },
  {
    id: 's500_q114',
    number: 114,
    sectionTitle: '第1週 7日目 [文法]',
    question: '私の 誕生日に 父が 時計を＿＿＿。',
    options: ['あげました', 'くれました'],
    correctIndex: 1,
    hint: 'Vào ngày sinh nhật tôi, bố đã tặng đồng hồ cho tôi.',
    explanation: '【Đáp án 2: くれました】(Sách trang 75): (người khác) が (tôi) に くれます (tặng cho tôi).'
  },
  {
    id: 's500_q115',
    number: 115,
    sectionTitle: '第1週 7日目 [文字]',
    question: '午前中は ひまです。',
    options: ['ごぜんちゅう', 'ごぜんじゅう'],
    correctIndex: 0,
    hint: 'Suốt buổi sáng tôi rảnh rỗi.',
    explanation: '【Đáp án 1: ごぜんちゅう】(Sách trang 76): 午前中 (ごぜんちゅう: trong buổi sáng).'
  },
  {
    id: 's500_q116',
    number: 116,
    sectionTitle: '第1週 7日目 [文字]',
    question: '友だちが にゅういん して います。',
    options: ['入院', '入学'],
    correctIndex: 0,
    hint: 'Bạn tôi đang nằm viện.',
    explanation: '【Đáp án 1: 入院】(Sách trang 76): 入院 (にゅういん: nhập viện).'
  },
  {
    id: 's500_q117',
    number: 117,
    sectionTitle: '第1週 7日目 [語い]',
    question: 'むすこは 大阪の 会社に＿＿＿います。',
    options: ['はたらいて', 'つとめて'],
    correctIndex: 1,
    hint: 'Con trai tôi đang làm việc tại một công ty ở Osaka.',
    explanation: '【Đáp án 2: つとめて】(Sách trang 76): 会社に勤める (làm việc/công tác tại công ty, đi với trợ từ に).'
  },
  {
    id: 's500_q118',
    number: 118,
    sectionTitle: '第1週 7日目 [語い]',
    question: 'こんなに＿＿＿本を 持って いくのは たいへんです。',
    options: ['あつい', 'ふとい'],
    correctIndex: 0,
    hint: 'Mang theo cuốn sách dày cộp thế này thật vất vả.',
    explanation: '【Đáp án 1: あつい】(Sách trang 76): 厚い (あつい: dày) dùng cho sách, áo ấm, v.v.'
  },
  {
    id: 's500_q119',
    number: 119,
    sectionTitle: '第1週 7日目 [文法]',
    question: '朝から＿＿＿食べて いないから、おなかが すきました。',
    options: ['なにか', 'なにも'],
    correctIndex: 1,
    hint: 'Từ sáng chưa ăn gì cả nên tôi đói bụng.',
    explanation: '【Đáp án 2: なにも】(Sách trang 76): 何も〜ない (hoàn toàn không ăn gì cả).'
  },
  {
    id: 's500_q120',
    number: 120,
    sectionTitle: '第1週 7日目 [文法]',
    question: '明日 試験だから、今日は＿＿＿勉強します。',
    options: ['寝ないで', '寝ながら'],
    correctIndex: 0,
    hint: 'Mai thi rồi nên hôm nay tôi sẽ học thức trắng không ngủ.',
    explanation: '【Đáp án 1: 寝ないで】(Sách trang 76): Vないで (làm hành động mà không làm V khác: học mà không ngủ).'
  },
  {
    id: 's500_q121',
    number: 121,
    sectionTitle: '第1週 7日目 [文字]',
    question: '私は 四人兄弟の 一番上です。',
    options: ['きょうだい', 'けいだい'],
    correctIndex: 0,
    hint: 'Tôi là con cả trong gia đình 4 anh chị em.',
    explanation: '【Đáp án 1: きょうだい】(Sách trang 77): 兄弟 (きょうだい: anh chị em).'
  },
  {
    id: 's500_q122',
    number: 122,
    sectionTitle: '第1週 7日目 [文字]',
    question: 'これは たいせつな 本です。',
    options: ['大切な', '大事な'],
    correctIndex: 0,
    hint: 'Đây là cuốn sách quan trọng.',
    explanation: '【Đáp án 1: 大切な】(Sách trang 77): 大切な (たいせつな: quan trọng, quý giá).'
  },
  {
    id: 's500_q123',
    number: 123,
    sectionTitle: '第1週 7日目 [語い]',
    question: '私は 今年の 12月に＿＿＿になります。',
    options: ['はつか', 'はたち'],
    correctIndex: 1,
    hint: 'Tôi sẽ tròn 20 tuổi vào tháng 12 năm nay.',
    explanation: '【Đáp án 2: はたち】(Sách trang 77): 二十歳 (はたち: 20 tuổi). 二十日 (はつか: ngày 20).'
  },
  {
    id: 's500_q124',
    number: 124,
    sectionTitle: '第1週 7日目 [語い]',
    question: 'この たなは 安かったけれど、とても＿＿＿です。',
    options: ['じょうぶ', 'だいじょうぶ'],
    correctIndex: 0,
    hint: 'Cái giá này tuy rẻ nhưng rất chắc chắn, bền.',
    explanation: '【Đáp án 1: じょうぶ】(Sách trang 77): 丈夫 (じょうぶ: chắc chắn, bền).'
  },
  {
    id: 's500_q125',
    number: 125,
    sectionTitle: '第1週 7日目 [文法]',
    question: '漢字は ぜんぜん＿＿＿ことが できません。',
    options: ['読む', '読める'],
    correctIndex: 0,
    hint: 'Tôi hoàn toàn không thể đọc được chữ Hán.',
    explanation: '【Đáp án 1: 読む】(Sách trang 77): V(thể từ điển) ことができる (mẫu câu chỉ khả năng: 読むことができる).'
  }
];

// Re-read shinNihongo500Data.ts to get units 1, 2, 3
const lines = content.split('\n');
const u4Idx = lines.findIndex(l => l.includes("id: 's500_w2_u1'"));
const week1Content = lines.slice(18, u4Idx - 2).join('\n');

// Find insertion point before end of Unit 3 questions
// In week1Content, find the last question (q100) closing brace
const q100End = week1Content.lastIndexOf('        }');
const unit3End = week1Content.indexOf('      ]', q100End);

const beforeUnit3End = week1Content.slice(0, unit3End);
const afterUnit3End = week1Content.slice(unit3End);

const q101_to_125_str = ',\n' + q101_to_125.map(q => {
  return `        {
          id: '${q.id}',
          number: ${q.number},
          sectionTitle: '${q.sectionTitle}',
          question: ${JSON.stringify(q.question)},
          options: ${JSON.stringify(q.options)},
          correctIndex: ${q.correctIndex},
          hint: ${JSON.stringify(q.hint)},
          explanation: ${JSON.stringify(q.explanation)}
        }`;
}).join(',\n');

const fullWeek1Content = `import { StudyBookUnit } from '../../types';\n\nexport const SHIN_500_WEEK_1: StudyBookUnit[] = [\n` +
  beforeUnit3End + q101_to_125_str + '\n' + afterUnit3End +
  `\n];\n`;

fs.writeFileSync('src/data/shinNihongo500/week1.ts', fullWeek1Content, 'utf8');
console.log('Week 1 successfully updated with all 125 questions!');
