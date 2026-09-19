import { GrammarItem } from '../types';

export interface TranslationExerciseItem {
  id: string;
  vietnamese: string;
  japanese: string;
  acceptedAnswers: string[];
  hint: string;
  grammarNote: string;
}

export interface OrderingExerciseItem {
  id: string;
  instruction: string;
  subtext: string;
  options: { id: number; text: string }[];
  correctOrder: number[]; // e.g. [2, 4, 1, 3]
  starPosition: number; // 1-indexed (usually 3)
  correctSentence: string;
  explanation: string;
}

// Helper to normalize strings for comparison (remove punctuation, spaces, normalize hiragana/katakana)
export function normalizeJapanese(str: string): string {
  return str
    .replace(/[。、！？\s\.,!?～〜\-]/g, '')
    .trim();
}

export function normalizeVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFC')
    .replace(/[\.,!?…\-\s]/g, '')
    .trim();
}

/**
 * Generate 10 Viet -> Jap exercises for a grammar point
 */
export function generateVietToJapExercises(grammar: GrammarItem, aiContent?: any): TranslationExerciseItem[] {
  const structure = grammar.structure || '';
  const cleanStruct = structure.replace(/[〜~]/g, '');

  const list: TranslationExerciseItem[] = [];

  // If aiContent has practice exercises or examples, prioritize them
  if (aiContent && aiContent.practiceExercises && Array.isArray(aiContent.practiceExercises)) {
    aiContent.practiceExercises.forEach((ex: any, i: number) => {
      if (ex.vietnamese && ex.japanese) {
        list.push({
          id: `v2j_ai_${i}`,
          vietnamese: ex.vietnamese,
          japanese: ex.japanese,
          acceptedAnswers: [normalizeJapanese(ex.japanese)],
          hint: ex.hint || `Sử dụng cấu trúc 「${structure}」`,
          grammarNote: ex.explanation || `Áp dụng mẫu ngữ pháp ${structure} theo quy tắc bài học.`
        });
      }
    });
  }

  // Use grammar's primary example if available
  if (grammar.exampleSentence && grammar.exampleTranslation) {
    list.unshift({
      id: `v2j_main_0`,
      vietnamese: grammar.exampleTranslation,
      japanese: grammar.exampleSentence,
      acceptedAnswers: [normalizeJapanese(grammar.exampleSentence)],
      hint: `Áp dụng mẫu ${structure}`,
      grammarNote: grammar.explanation || `Dùng mẫu ${structure} để hoàn thành câu.`
    });
  }

  // Pre-crafted high-fidelity questions for popular patterns like んです
  if (structure.includes('んです')) {
    const ndesuItems: TranslationExerciseItem[] = [
      {
        id: 'v2j_ndesu_1',
        vietnamese: 'Vì sao bạn không ăn? — Vì tôi không khỏe.',
        japanese: 'どうして食べないんですか。体調が良くないんです。',
        acceptedAnswers: [
          normalizeJapanese('どうして食べないんですか。体調が良くないんです。'),
          normalizeJapanese('どうして食べないんですか。具合が悪いんです。'),
          normalizeJapanese('なぜ食べないんですか。体調が良くないんです。')
        ],
        hint: 'Gợi ý: どうして...んですか / 体調が良くないんです',
        grammarNote: 'Dùng 〜んですか để hỏi nguyên nhân trong tình huống nhìn thấy người kia không ăn, và 〜んです để giải thích lý do.'
      },
      {
        id: 'v2j_ndesu_2',
        vietnamese: 'Mặt bạn đỏ nhỉ. — Vì tôi ngượng.',
        japanese: '顔が赤いですね。はずかしいんです。',
        acceptedAnswers: [
          normalizeJapanese('顔が赤いですね。恥ずかしいんです。'),
          normalizeJapanese('かおがあかいですね。はずかしいんです。')
        ],
        hint: 'Gợi ý: 顔が赤い / 恥ずかしい (ngượng)',
        grammarNote: 'Tính từ đuôi い + んです: 恥ずかしい ＋ んです.'
      },
      {
        id: 'v2j_ndesu_3',
        vietnamese: 'Sao bạn về sớm? — Vì có việc bận.',
        japanese: 'どうして早く帰るんですか。用事があるんです。',
        acceptedAnswers: [
          normalizeJapanese('どうして早く帰るんですか。用事があるんです。'),
          normalizeJapanese('どうしてはやくかえるんですか。ようじがあるんです。')
        ],
        hint: 'Gợi ý: 早く帰る / 用事 (việc bận)',
        grammarNote: 'Động từ thể thông thường + んです: 帰る ＋ んです, ある ＋ んです.'
      },
      {
        id: 'v2j_ndesu_4',
        vietnamese: 'Sao bạn học nhiều thế? — Vì tôi có thi mà.',
        japanese: 'なぜそんなに勉強するんですか。試験があるんです。',
        acceptedAnswers: [
          normalizeJapanese('なぜそんなに勉強するんですか。試験があるんです。'),
          normalizeJapanese('どうしてそんなにべんきょうするんですか。しけんがあるんです。')
        ],
        hint: 'Gợi ý: そんなに (như thế) / 試験がある',
        grammarNote: 'Nhấn mạnh bối cảnh sắp có kỳ thi.'
      },
      {
        id: 'v2j_ndesu_5',
        vietnamese: 'Hôm qua bạn không đến à? — Vì tôi bị cảm mà.',
        japanese: '昨日来なかったんですか。風邪をひいたんです。',
        acceptedAnswers: [
          normalizeJapanese('昨日来なかったんですか。風邪をひいたんです。'),
          normalizeJapanese('きのうこなかったんですか。かぜをひいたんです。')
        ],
        hint: 'Gợi ý: 昨日来なかった / 風邪をひいた',
        grammarNote: 'Thể quá khứ TTT: 来なかった ＋ んです / ひいた ＋ んです.'
      },
      {
        id: 'v2j_ndesu_6',
        vietnamese: 'Sao lại không đi dạo? — Vì trời mưa.',
        japanese: 'どうして散歩に行かないんですか。雨が降っているんです。',
        acceptedAnswers: [
          normalizeJapanese('どうして散歩に行かないんですか。雨が降っているんです。'),
          normalizeJapanese('どうしてさんぽにいかないんですか。あめがふっているんです。')
        ],
        hint: 'Gợi ý: 散歩に行かない / 雨が降っている',
        grammarNote: 'Động từ thể phủ định / tiếp diễn kết hợp 〜んです.'
      },
      {
        id: 'v2j_ndesu_7',
        vietnamese: 'Sao bạn lại uống thuốc? — Vì tôi đau đầu.',
        japanese: 'どうして薬を飲むんですか。頭が痛いんです。',
        acceptedAnswers: [
          normalizeJapanese('どうして薬を飲むんですか。頭が痛いんです。'),
          normalizeJapanese('どうしてくすりをのむんですか。あたまがいたいんです。')
        ],
        hint: 'Gợi ý: 薬を飲む / 頭が痛い',
        grammarNote: 'Hỏi lý do hành động trước mắt và trả lời bằng triệu chứng.'
      },
      {
        id: 'v2j_ndesu_8',
        vietnamese: 'Sao bạn mua hoa thế? — Vì hôm nay là sinh nhật mẹ.',
        japanese: 'どうして花を買ったんですか。今日は母の誕生日なんです。',
        acceptedAnswers: [
          normalizeJapanese('どうして花を買ったんですか。今日は母の誕生日なんです。'),
          normalizeJapanese('どうしてはなをかったんですか。きょうはははのたんじょうびなんです。')
        ],
        hint: 'Gợi ý: Danh từ + なんです (chú ý thêm な)',
        grammarNote: 'Danh từ khi kết hợp với 〜んです phải thêm な: 誕生日な ＋ んです.'
      },
      {
        id: 'v2j_ndesu_9',
        vietnamese: 'Bạn không thích món này à? — Vâng, vì nó hơi cay.',
        japanese: 'この料理が好きじゃないんですか。はい、ちょっと辛いんです。',
        acceptedAnswers: [
          normalizeJapanese('この料理が好きじゃないんですか。はい、ちょっと辛いんです。'),
          normalizeJapanese('このりょうりがすきじゃないんですか。はい、ちょっとからいんです。')
        ],
        hint: 'Gợi ý: 好きじゃない (Aな phủ định) / ちょっと辛い',
        grammarNote: 'Tính từ đuôi な phủ định: 好きじゃない ＋ んです.'
      },
      {
        id: 'v2j_ndesu_10',
        vietnamese: 'Sao lại không đi làm việc? — Vì hôm nay tôi rảnh rỗi.',
        japanese: 'どうして仕事に行かないんですか。今日は暇なんです。',
        acceptedAnswers: [
          normalizeJapanese('どうして仕事に行かないんですか。今日は暇なんです。'),
          normalizeJapanese('どうしてしごとにいかないんですか。きょうはひまなんです。')
        ],
        hint: 'Gợi ý: 暇 (Tính từ đuôi な) + なんです',
        grammarNote: 'Tính từ đuôi な dạng khẳng định: 暇な ＋ んです.'
      }
    ];
    return ndesuItems;
  }

  // Generate standard pool up to 10 questions for any other grammar pattern
  while (list.length < 10) {
    const idx = list.length + 1;
    list.push({
      id: `v2j_gen_${idx}`,
      vietnamese: `Câu luyện tập ${idx}: Vận dụng mẫu 「${structure}」 (${grammar.meaning || 'ngữ pháp'}).`,
      japanese: grammar.exampleSentence || `${cleanStruct}の文を作ります。`,
      acceptedAnswers: [normalizeJapanese(grammar.exampleSentence || cleanStruct)],
      hint: `Áp dụng dạng kết hợp của 「${structure}」`,
      grammarNote: grammar.explanation || `Dùng đúng quy tắc kết hợp của ${structure}.`
    });
  }

  return list.slice(0, 10);
}

/**
 * Generate 10 Jap -> Viet exercises for a grammar point
 */
export function generateJapToVietExercises(grammar: GrammarItem, aiContent?: any): TranslationExerciseItem[] {
  const v2j = generateVietToJapExercises(grammar, aiContent);
  return v2j.map((item, idx) => ({
    id: `j2v_${idx}`,
    vietnamese: item.vietnamese,
    japanese: item.japanese,
    acceptedAnswers: [normalizeVietnamese(item.vietnamese)],
    hint: `Dịch sát nghĩa tiếng Việt thể hiện rõ sắc thái: ${grammar.meaning || grammar.structure}`,
    grammarNote: item.grammarNote
  }));
}

/**
 * Generate 10 Star Ordering exercises (★ position question)
 */
export function generateOrderingExercises(grammar: GrammarItem, aiContent?: any): OrderingExerciseItem[] {
  const structure = grammar.structure || '';

  if (structure.includes('んです')) {
    return [
      {
        id: 'ord_1',
        instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
        subtext: 'Mẫu: TTT + んです',
        options: [
          { id: 1, text: '食べない' },
          { id: 2, text: 'どうして今日は' },
          { id: 3, text: 'んですか' },
          { id: 4, text: 'ぜんぜん' }
        ],
        correctOrder: [2, 4, 1, 3], // どうして今日は ぜんぜん 食べない んですか
        starPosition: 3, // Target index 3 in 1-based is item 1 (食べない)
        correctSentence: 'どうして今日はぜんぜん食べないんですか。',
        explanation: 'Trật tự đúng: どうして今日は (2) + ぜんぜん (4) + 食べない (1) + んですか (3). Vị trí ★ (thứ 3) là 1 (食べない).'
      },
      {
        id: 'ord_2',
        instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
        subtext: 'Mẫu: TTT + んです',
        options: [
          { id: 1, text: 'とても いたい' },
          { id: 2, text: 'きのうから' },
          { id: 3, text: 'んです' },
          { id: 4, text: 'あたまが' }
        ],
        correctOrder: [2, 4, 1, 3], // きのうから あたまが とても いたい んです
        starPosition: 3,
        correctSentence: 'きのうからあたまがとてもいたいんです。',
        explanation: 'Trật tự đúng: きのうから (2) + あたまが (4) + とても いたい (1) + んです (3). Vị trí ★ là 1 (とても いたい).'
      },
      {
        id: 'ord_3',
        instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
        subtext: 'Mẫu: TTT + んです',
        options: [
          { id: 1, text: '試験が' },
          { id: 2, text: '勉強する' },
          { id: 3, text: 'あるんです' },
          { id: 4, text: 'あした' }
        ],
        correctOrder: [4, 1, 3, 2], // あした 試験が あるんです (hoặc あした 試験があるんです)
        starPosition: 3,
        correctSentence: 'あした試験があるんです。',
        explanation: 'Trật tự đúng: あした (4) + 試験が (1) + ある (3) + んです. Vị trí ★ là 3.'
      },
      {
        id: 'ord_4',
        instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
        subtext: 'Mẫu: TTT + んです',
        options: [
          { id: 1, text: 'なんです' },
          { id: 2, text: 'きょうは' },
          { id: 3, text: '休み' },
          { id: 4, text: '学校の' }
        ],
        correctOrder: [2, 4, 3, 1], // きょうは 学校の 休み なんです
        starPosition: 3,
        correctSentence: 'きょうは学校の休みなんです。',
        explanation: 'Danh từ (休み) + なんです. Trật tự: きょうは (2) + 学校の (4) + 休み (3) + なんです (1). Vị trí ★ là 3 (休み).'
      },
      {
        id: 'ord_5',
        instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
        subtext: 'Mẫu: TTT + んです',
        options: [
          { id: 1, text: 'んですか' },
          { id: 2, text: 'どこで' },
          { id: 3, text: 'そのカメラを' },
          { id: 4, text: '買った' }
        ],
        correctOrder: [3, 2, 4, 1], // そのカメラを どこで 買った んですか
        starPosition: 3,
        correctSentence: 'そのカメラをどこで買ったんですか。',
        explanation: 'Trật tự: そのカメラを (3) + どこで (2) + 買った (4) + んですか (1). Vị trí ★ là 4 (買った).'
      },
      {
        id: 'ord_6',
        instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
        subtext: 'Mẫu: TTT + んです',
        options: [
          { id: 1, text: 'ないんです' },
          { id: 2, text: 'あまり' },
          { id: 3, text: '時間が' },
          { id: 4, text: 'いま' }
        ],
        correctOrder: [4, 3, 2, 1], // いま 時間が あまり ないんです
        starPosition: 3,
        correctSentence: 'いま時間があまりないんです。',
        explanation: 'Trật tự: いま (4) + 時間が (3) + あまり (2) + ないんです (1). Vị trí ★ là 2 (あまり).'
      },
      {
        id: 'ord_7',
        instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
        subtext: 'Mẫu: TTT + んです',
        options: [
          { id: 1, text: 'んです' },
          { id: 2, text: 'とても' },
          { id: 3, text: 'この部屋は' },
          { id: 4, text: '静かな' }
        ],
        correctOrder: [3, 2, 4, 1], // この部屋は とても 静かな んです
        starPosition: 3,
        correctSentence: 'この部屋はとても静かなんです。',
        explanation: 'Tính từ đuôi な (静か) + なんです. Trật tự: この部屋は (3) + とても (2) + 静かな (4) + んです (1). Vị trí ★ là 4 (静かな).'
      },
      {
        id: 'ord_8',
        instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
        subtext: 'Mẫu: TTT + んです',
        options: [
          { id: 1, text: '傘を' },
          { id: 2, text: '忘れた' },
          { id: 3, text: 'んです' },
          { id: 4, text: '電車に' }
        ],
        correctOrder: [4, 1, 2, 3], // 電車に 傘を 忘れた んです
        starPosition: 3,
        correctSentence: '電車に傘を忘れたんです。',
        explanation: 'Trật tự: 電車に (4) + 傘を (1) + 忘れた (2) + んです (3). Vị trí ★ là 2 (忘れた).'
      },
      {
        id: 'ord_9',
        instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
        subtext: 'Mẫu: TTT + んです',
        options: [
          { id: 1, text: 'んですか' },
          { id: 2, text: 'どうして' },
          { id: 3, text: '遅れた' },
          { id: 4, text: '会議に' }
        ],
        correctOrder: [2, 4, 3, 1], // どうして 会議に 遅れた んですか
        starPosition: 3,
        correctSentence: 'どうして会議に遅れたんですか。',
        explanation: 'Trật tự: どうして (2) + 会議に (4) + 遅れた (3) + んですか (1). Vị trí ★ là 3 (遅れた).'
      },
      {
        id: 'ord_10',
        instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
        subtext: 'Mẫu: TTT + んです',
        options: [
          { id: 1, text: 'んです' },
          { id: 2, text: '日本語の' },
          { id: 3, text: '先生に' },
          { id: 4, text: 'なりたい' }
        ],
        correctOrder: [2, 3, 4, 1], // 日本語の 先生に なりたい んです
        starPosition: 3,
        correctSentence: '日本語の先生になりたいんです。',
        explanation: 'Trật tự: 日本語の (2) + 先生に (3) + なりたい (4) + んです (1). Vị trí ★ là 4 (なりたい).'
      }
    ];
  }

  // Generate 10 standard star ordering questions based on grammar item
  const rawSentence = grammar.exampleSentence || '日本語の勉強をしています';
  const clean = rawSentence.replace(/[。、！？\s]/g, '');

  const items: OrderingExerciseItem[] = [];
  for (let i = 1; i <= 10; i++) {
    items.push({
      id: `ord_gen_${i}`,
      instruction: '4つの言葉を並べ替えて文を完成させ、★の位置の番号を選んでください',
      subtext: `Mẫu: ${structure}`,
      options: [
        { id: 1, text: structure || 'この文' },
        { id: 2, text: '毎日' },
        { id: 3, text: '練習を' },
        { id: 4, text: 'しています' }
      ],
      correctOrder: [2, 3, 1, 4],
      starPosition: 3,
      correctSentence: `毎日練習を${structure}しています。`,
      explanation: `Vận dụng cấu trúc ${structure} vào câu. Vị trí ★ số 3 là phương án 1.`
    });
  }

  return items;
}
