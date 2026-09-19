/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GrammarItem } from '../types';

export type ClozeQuizType =
  | 'particle'
  | 'conjugation'
  | 'pattern'
  | 'star_order'
  | 'synonym'
  | 'dialogue'
  | 'nuance'
  | 'collocation'
  | 'passage'
  | 'correct_usage';

export interface GrammarClozeQuestion {
  id: string;
  questionNumber: number; // 1 to 10
  type: ClozeQuizType;
  typeName: string;
  typeBadgeColor: string;
  prompt: string;
  sentenceWithBlank: string; // Question sentence with [ ______ ] or formatting
  targetBlankWord: string;   // The correct answer / blank word
  sentenceFull: string;      // The complete correct Japanese sentence
  translation: string;       // Vietnamese translation / context (100% unique per question)
  options: string[];         // 4 multiple-choice options
  correctOptionIndex: number;
  explanation: string;
  starOrderPositions?: string[]; // For star question: array of 4 ordered fragments
  contextDialog?: { speakerA: string; speakerB: string }; // For dialogue question
}

// Clean structure string to get clean pattern keyword without brackets or symbols
function cleanPattern(str: string): string {
  if (!str) return '';
  return str
    .replace(/[〜~\[\]]/g, '')
    .replace(/Plain Form|PlinForm|PlainForm|V-te|V-ta|V-nai|V-masu|V-dict|A-i|A-na|N1|N2|N/gi, '')
    .replace(/[\(\)]/g, '')
    .trim();
}

function shuffleOptions<T>(array: T[]): T[] {
  return [...array].sort(() => 0.5 - Math.random());
}

/**
 * Sanitize and validate every quiz question:
 * Guarantee that correctOptionIndex accurately points to targetBlankWord within options!
 */
export function sanitizeQuizQuestions(questions: GrammarClozeQuestion[]): GrammarClozeQuestion[] {
  return questions.map(q => {
    const opts = Array.isArray(q.options) ? q.options : [];
    let correctIdx = opts.indexOf(q.targetBlankWord);
    
    // If targetBlankWord is in options, always assign correctOptionIndex to its actual index
    if (correctIdx !== -1) {
      return {
        ...q,
        correctOptionIndex: correctIdx
      };
    }
    
    // If targetBlankWord was not found directly, check if any option starts with targetBlankWord or vice-versa
    const fuzzyIdx = opts.findIndex(opt => opt && q.targetBlankWord && (opt.includes(q.targetBlankWord) || q.targetBlankWord.includes(opt)));
    if (fuzzyIdx !== -1) {
      return {
        ...q,
        correctOptionIndex: fuzzyIdx
      };
    }

    return {
      ...q,
      correctOptionIndex: q.correctOptionIndex >= 0 && q.correctOptionIndex < opts.length ? q.correctOptionIndex : 0
    };
  });
}

// =========================================================================
// N5 LESSON-SPECIFIC 10-QUESTION GENERATORS (Minna no Nihongo Lessons 1 - 25)
// =========================================================================

export const N5_LESSON_QUIZZES: Record<number, (item: GrammarItem) => GrammarClozeQuestion[]> = {
  // Bài 1: N1 は N2 です / じゃありません / ですか / も / の
  1: (item) => [
    {
      id: `quiz_${item.id}_q1`,
      questionNumber: 1,
      type: 'particle',
      typeName: '1. Tình huống công sở: Chọn trợ từ chủ ngữ は',
      typeBadgeColor: 'bg-sky-950/60 border-sky-500/40 text-sky-300',
      prompt: 'Điền trợ từ thích hợp vào câu giới thiệu bản thân [ ______ ]:',
      sentenceWithBlank: '私 [ ______ ] マイク・ミラーです。会社員です。',
      targetBlankWord: 'は',
      sentenceFull: '私はマイク・ミラーです。会社員です。',
      translation: 'Tôi là Mike Miller. Tôi là nhân viên công ty.',
      options: shuffleOptions(['は', 'が', 'を', 'に']),
      correctOptionIndex: 0,
      explanation: 'Trợ từ「は」(đọc là wa) đứng sau danh từ「私」để đánh dấu chủ ngữ/chủ đề câu.'
    },
    {
      id: `quiz_${item.id}_q2`,
      questionNumber: 2,
      type: 'conjugation',
      typeName: '2. Tình huống trường học: Khẳng định & Phủ định',
      typeBadgeColor: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
      prompt: 'Chọn đuôi câu phủ định danh từ lịch sự phù hợp [ ______ ]:',
      sentenceWithBlank: 'サントスさんは先生 [ ______ ]。学生です。',
      targetBlankWord: 'じゃありません',
      sentenceFull: 'サントスさんは先生じゃありません。学生です。',
      translation: 'Anh Santos không phải là giáo viên. Anh ấy là học sinh.',
      options: shuffleOptions(['じゃありません', 'です', 'でした', 'くないです']),
      correctOptionIndex: 0,
      explanation: 'Phủ định của danh từ「先生」trong câu lịch sự là「先生じゃありません」(hoặc ではありません).'
    },
    {
      id: `quiz_${item.id}_q3`,
      questionNumber: 3,
      type: 'pattern',
      typeName: '3. Tình huống bệnh viện: Trợ từ đồng nhất も',
      typeBadgeColor: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      prompt: 'Chọn trợ từ mang nghĩa "cũng là" điền vào câu sau [ ______ ]:',
      sentenceWithBlank: '山田さんは医者です。ワンさん [ ______ ] 医者です。',
      targetBlankWord: 'も',
      sentenceFull: '山田さんは医者です。ワンさんも医者です。',
      translation: 'Anh Yamada là bác sĩ. Anh Wang cũng là bác sĩ.',
      options: shuffleOptions(['も', 'は', 'の', 'か']),
      correctOptionIndex: 0,
      explanation: 'Trợ từ「も」thay thế cho「は」khi danh từ có cùng tính chất với đối tượng trước đó.'
    },
    {
      id: `quiz_${item.id}_q4`,
      questionNumber: 4,
      type: 'star_order',
      typeName: '4. Tình huống công ty: Sắp xếp câu dấu sao ★ JLPT',
      typeBadgeColor: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
      prompt: 'Sắp xếp 4 mảnh câu và chọn từ nằm ở vị trí dấu [ ★ ]:',
      sentenceWithBlank: '[ ① ]  [ ② ]  [ ★ ]  [ ④ ]',
      targetBlankWord: '社員',
      sentenceFull: 'ミラーさんは IMCの 社員 です',
      translation: 'Anh Miller là nhân viên của công ty IMC.',
      options: shuffleOptions(['ミラーさんは', 'IMCの', '社員', 'です']),
      correctOptionIndex: 0,
      explanation: 'Thứ tự đúng: ミラーさんは (1) IMCの (2) ★社員 (3) です (4). Vị trí ngôi sao là「社員」.',
      starOrderPositions: ['ミラーさんは', 'IMCの', '社員', 'です']
    },
    {
      id: `quiz_${item.id}_q5`,
      questionNumber: 5,
      type: 'synonym',
      typeName: '5. Tình huống giao tiếp: Diễn đạt tương đương',
      typeBadgeColor: 'bg-teal-950/60 border-teal-500/40 text-teal-300',
      prompt: 'Chọn cách diễn đạt trang trọng hơn của câu「私は医者じゃありません」:',
      sentenceWithBlank: '「私は医者じゃありません」≒ [ ? ]',
      targetBlankWord: '私は医者ではありません。',
      sentenceFull: '私は医者ではありません。',
      translation: 'Tôi không phải là bác sĩ (cách nói trang trọng).',
      options: shuffleOptions([
        '私は医者ではありません。',
        '私は医者でした。',
        '私は医者ですか。',
        '私も医者じゃありません。'
      ]),
      correctOptionIndex: 0,
      explanation: '「ではありません」là dạng phủ định trang trọng trong văn viết và nghi lễ của「じゃありません」.'
    },
    {
      id: `quiz_${item.id}_q6`,
      questionNumber: 6,
      type: 'dialogue',
      typeName: '6. Tình huống hội thoại gặp gỡ lần đầu',
      typeBadgeColor: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300',
      prompt: 'Chọn câu đáp lễ phù hợp trong hội thoại giới thiệu:',
      sentenceWithBlank: 'A:「はじめまして。佐藤です。よろしくお願いします。」\nB:「[ ______ ]。」',
      targetBlankWord: 'こちらこそ、よろしくお願いします',
      sentenceFull: 'A:「はじめまして。佐藤です。よろしくお願いします。」\nB:「こちらこそ、よろしくお願いします。」',
      translation: 'A: Xin chào lần đầu gặp mặt. Tôi là Sato. Rất mong được giúp đỡ. / B: Chính tôi mới là người mong được giúp đỡ ạ.',
      options: shuffleOptions([
        'こちらこそ、よろしくお願いします',
        'いいえ、どういたしまして',
        'はい、そうです',
        'さようなら'
      ]),
      correctOptionIndex: 0,
      explanation: 'Khi đối phương nói よろしくお願いします, câu đáp lại lịch sự chuẩn nhất là「こちらこそ、よろしくお願いします」.'
    },
    {
      id: `quiz_${item.id}_q7`,
      questionNumber: 7,
      type: 'nuance',
      typeName: '7. Tình huống hỏi tuổi tác lịch sự',
      typeBadgeColor: 'bg-pink-950/60 border-pink-500/40 text-pink-300',
      prompt: 'Chọn cách hỏi tuổi lịch sự nhất với người lớn tuổi [ ______ ]:',
      sentenceWithBlank: '失礼ですが、お名前と [ ______ ] は？',
      targetBlankWord: 'おいくつ',
      sentenceFull: '失礼ですが、お名前とおいくつは？',
      translation: 'Xin thất lễ, cho tôi hỏi quý danh và tuổi của ngài là bao nhiêu ạ?',
      options: shuffleOptions(['おいくつ', 'なんさい', 'だれ', 'どこ']),
      correctOptionIndex: 0,
      explanation: '「おいくつ」là cách hỏi tuổi lịch sự hơn của「何歳 (なんさい)」.'
    },
    {
      id: `quiz_${item.id}_q8`,
      questionNumber: 8,
      type: 'collocation',
      typeName: '8. Tình huống chào hỏi: Cụm từ cố định',
      typeBadgeColor: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300',
      prompt: 'Điền từ đầu câu chào khi mới gặp lần đầu [ ______ ]:',
      sentenceWithBlank: '[ ______ ]。私はベトナムから来ました。',
      targetBlankWord: '初めまして',
      sentenceFull: '初めまして。私はベトナムから来ました。',
      translation: 'Rất hân hạnh được gặp bạn. Tôi đến từ Việt Nam.',
      options: shuffleOptions(['初めまして', 'おはよう', 'すみません', 'じゃあね']),
      correctOptionIndex: 0,
      explanation: '「初めまして」(Hajimemashite) dùng mở đầu khi gặp mặt ai đó lần đầu tiên.'
    },
    {
      id: `quiz_${item.id}_q9`,
      questionNumber: 9,
      type: 'passage',
      typeName: '9. Tình huống giới thiệu thành viên: Điền đoạn văn',
      typeBadgeColor: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300',
      prompt: 'Đọc đoạn văn giới thiệu và điền từ thích hợp:',
      sentenceWithBlank: 'あの方は木村先生です。あの方 [ ______ ] 日本人です。',
      targetBlankWord: 'も',
      sentenceFull: 'あの方は木村先生です。あの方も日本人です。',
      translation: 'Vị kia là thầy Kimura. Vị kia cũng là người Nhật Bản.',
      options: shuffleOptions(['も', 'の', 'か', 'と']),
      correctOptionIndex: 0,
      explanation: 'Dùng「も」khi bổ sung thêm một người nữa có cùng quốc tịch/đặc điểm.'
    },
    {
      id: `quiz_${item.id}_q10`,
      questionNumber: 10,
      type: 'correct_usage',
      typeName: '10. Tình huống chuẩn mực: Chọn câu đúng ngữ pháp',
      typeBadgeColor: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
      prompt: 'Trong 4 câu dưới đây, câu nào đúng ngữ pháp N5 Bài 1 nhất?',
      sentenceWithBlank: 'Chọn câu đúng chuẩn ngữ pháp:',
      targetBlankWord: 'あの人は誰ですか。山田さんです。',
      sentenceFull: 'あの人は誰ですか。山田さんです。',
      translation: 'Người kia là ai thế? Là anh Yamada đấy.',
      options: shuffleOptions([
        'あの人は誰ですか。山田さんです。',
        'あの人は誰の。山田さんじゃありません。',
        '私は学生じゃありませんです。',
        'サントスさんは先生もです。'
      ]),
      correctOptionIndex: 0,
      explanation: '「あの人は誰ですか」là câu hỏi danh tính chuẩn mực, trả lời bằng「山田さんです」.'
    }
  ],

  // Bài 2: これ / それ / あれ / この / その / あの / そうです / 誰の
  2: (item) => [
    {
      id: `quiz_${item.id}_q1`,
      questionNumber: 1,
      type: 'particle',
      typeName: '1. Tình huống phòng học: Trợ từ sở hữu の',
      typeBadgeColor: 'bg-sky-950/60 border-sky-500/40 text-sky-300',
      prompt: 'Điền trợ từ nối 2 danh từ chỉ sở hữu [ ______ ]:',
      sentenceWithBlank: 'これ [ ______ ] 私の日本語の本です。',
      targetBlankWord: 'は',
      sentenceFull: 'これは私の日本語の本です。',
      translation: 'Đây là cuốn sách tiếng Nhật của tôi.',
      options: shuffleOptions(['は', 'が', 'を', 'に']),
      correctOptionIndex: 0,
      explanation: '「これは」chỉ đồ vật ở gần người nói là chủ đề của câu.'
    },
    {
      id: `quiz_${item.id}_q2`,
      questionNumber: 2,
      type: 'conjugation',
      typeName: '2. Tình huống văn phòng phẩm: Phân biệt これ vs この',
      typeBadgeColor: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
      prompt: 'Chọn chỉ từ đứng trước danh từ「傘」[ ______ ]:',
      sentenceWithBlank: '[ ______ ] 傘は佐藤さんのですか。',
      targetBlankWord: 'この',
      sentenceFull: 'この傘は佐藤さんのですか。',
      translation: 'Chiếc ô này có phải của anh Sato không?',
      options: shuffleOptions(['この', 'これ', 'ここ', 'こちら']),
      correctOptionIndex: 0,
      explanation: 'Trước danh từ (傘) bắt buộc phải dùng「この / その / あの」, không dùng「これ」.'
    },
    {
      id: `quiz_${item.id}_q3`,
      questionNumber: 3,
      type: 'pattern',
      typeName: '3. Tình huống xác nhận đồ vật: Trả lời そうです',
      typeBadgeColor: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      prompt: 'Chọn câu đáp đúng khi xác nhận thông tin đúng [ ______ ]:',
      sentenceWithBlank: 'A:「それは辞書ですか。」\nB:「はい、[ ______ ]。」',
      targetBlankWord: 'そうです',
      sentenceFull: 'A:「それは辞書ですか。」\nB:「はい、そうです。」',
      translation: 'A: Đó là cuốn từ điển phải không? / B: Vâng, đúng như vậy.',
      options: shuffleOptions(['そうです', 'ちがいます', 'あります', 'います']),
      correctOptionIndex: 0,
      explanation: 'Khi đồng ý xác nhận danh từ trong câu hỏi「〜ですか」, dùng「はい、そうです」.'
    },
    {
      id: `quiz_${item.id}_q4`,
      questionNumber: 4,
      type: 'star_order',
      typeName: '4. Tình huống tìm đồ thất lạc: Sắp xếp câu dấu sao ★',
      typeBadgeColor: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
      prompt: 'Sắp xếp 4 mảnh câu và chọn từ nằm ở vị trí dấu [ ★ ]:',
      sentenceWithBlank: '[ ① ]  [ ② ]  [ ★ ]  [ ④ ]',
      targetBlankWord: 'だれの',
      sentenceFull: 'あの 鍵は だれの ですか',
      translation: 'Chiếc chìa khóa đằng kia là của ai thế?',
      options: shuffleOptions(['あの', '鍵は', 'だれの', 'ですか']),
      correctOptionIndex: 0,
      explanation: 'Thứ tự đúng: あの (1) 鍵は (2) ★だれの (3) ですか (4). Vị trí ngôi sao là「だれの」.',
      starOrderPositions: ['あの', '鍵は', 'だれの', 'ですか']
    },
    {
      id: `quiz_${item.id}_q5`,
      questionNumber: 5,
      type: 'synonym',
      typeName: '5. Tình huống đính chính thông tin: Phủ định',
      typeBadgeColor: 'bg-teal-950/60 border-teal-500/40 text-teal-300',
      prompt: 'Chọn câu đáp mang nghĩa "Không phải, nhầm rồi":',
      sentenceWithBlank: '「いいえ、違います」≒ [ ? ]',
      targetBlankWord: 'いいえ、そうじゃありません。',
      sentenceFull: 'いいえ、そうじゃありません。',
      translation: 'Không, không phải như vậy đâu ạ.',
      options: shuffleOptions([
        'いいえ、そうじゃありません。',
        'はい、そうです。',
        'どうぞよろしく。',
        'そうですか。'
      ]),
      correctOptionIndex: 0,
      explanation: '「いいえ、違います」đồng nghĩa với「いいえ、そうじゃありません」trong việc phủ nhận thông tin.'
    },
    {
      id: `quiz_${item.id}_q6`,
      questionNumber: 6,
      type: 'dialogue',
      typeName: '6. Tình huống tặng quà lưu niệm お土産',
      typeBadgeColor: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300',
      prompt: 'Chọn lời nói khi trao quà cho người khác [ ______ ]:',
      sentenceWithBlank: 'A:「これはベトナムのコーヒーです。[ ______ ]。」\nB:「どうもありがとうございます。」',
      targetBlankWord: 'どうぞ',
      sentenceFull: 'A:「これはベトナムのコーヒーです。どうぞ。」\nB:「どうもありがとうございます。」',
      translation: 'A: Đây là cà phê của Việt Nam. Xin mời bạn nhận ạ. / B: Xin chân thành cảm ơn bạn.',
      options: shuffleOptions(['どうぞ', 'どうも', 'そうです', 'だれ']),
      correctOptionIndex: 0,
      explanation: 'Khi đưa vật gì đó cho người khác, người Nhật thường nói「どうぞ」(Xin mời).'
    },
    {
      id: `quiz_${item.id}_q7`,
      questionNumber: 7,
      type: 'nuance',
      typeName: '7. Tình huống nhận ra thông tin mới そうですか',
      typeBadgeColor: 'bg-pink-950/60 border-pink-500/40 text-pink-300',
      prompt: 'Chọn câu thể hiện sự tiếp nhận thông tin mới「Ra là vậy」:',
      sentenceWithBlank: 'A:「この手帳は山田さんのですよ。」\nB:「あ、[ ______ ]。」',
      targetBlankWord: 'そうですか',
      sentenceFull: 'A:「この手帳は山田さんのですよ。」\nB:「あ、そうですか。」',
      translation: 'A: Cuốn sổ tay này là của anh Yamada đấy. / B: À, ra thế à (tôi hiểu rồi).',
      options: shuffleOptions(['そうですか', 'そうです', 'ちがいます', 'どれですか']),
      correctOptionIndex: 0,
      explanation: '「そうですか」(hạ giọng ở cuối) dùng khi tiếp nhận một thông tin mới mà mình chưa biết.'
    },
    {
      id: `quiz_${item.id}_q8`,
      questionNumber: 8,
      type: 'collocation',
      typeName: '8. Tình huống hỏi lựa chọn giữa 2 vật',
      typeBadgeColor: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300',
      prompt: 'Điền từ hỏi lựa chọn giữa hai cái [ ______ ]:',
      sentenceWithBlank: 'これは「9」ですか、[ ______ ]「7」ですか。',
      targetBlankWord: 'それとも',
      sentenceFull: 'これは「9」ですか、それとも「7」ですか。',
      translation: 'Đây là số 9 hay là số 7 vậy?',
      options: shuffleOptions(['それとも', 'そして', 'それから', 'だから']),
      correctOptionIndex: 0,
      explanation: '「それとも」(hoặc là) dùng nối 2 câu hỏi lựa chọn A hay B.'
    },
    {
      id: `quiz_${item.id}_q9`,
      questionNumber: 9,
      type: 'passage',
      typeName: '9. Tình huống phân loại đồ dùng cá nhân: Đoạn văn',
      typeBadgeColor: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300',
      prompt: 'Đọc đoạn văn và chọn từ nối danh từ sở hữu phù hợp:',
      sentenceWithBlank: '机の上に時計があります。あれは先生 [ ______ ] 時計です。',
      targetBlankWord: 'の',
      sentenceFull: '机の上に時計があります。あれは先生の時計です。',
      translation: 'Trên bàn có chiếc đồng hồ. Kia là đồng hồ của thầy giáo.',
      options: shuffleOptions(['の', 'は', 'も', 'と']),
      correctOptionIndex: 0,
      explanation: 'Trợ từ「の」nối 2 danh từ biểu thị quan hệ sở hữu「先生の時計」(đồng hồ của thầy).'
    },
    {
      id: `quiz_${item.id}_q10`,
      questionNumber: 10,
      type: 'correct_usage',
      typeName: '10. Tình huống chuẩn mực: Chọn câu đúng ngữ pháp',
      typeBadgeColor: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
      prompt: 'Trong 4 câu dưới đây, câu nào dùng chỉ từ và trợ từ chuẩn xác nhất?',
      sentenceWithBlank: 'Chọn câu đúng chuẩn ngữ pháp:',
      targetBlankWord: 'この雑誌は自動車の雑誌です。',
      sentenceFull: 'この雑誌は自動車の雑誌です。',
      translation: 'Cuốn tạp chí này là tạp chí về ô tô.',
      options: shuffleOptions([
        'この雑誌は自動車の雑誌です。',
        'これ雑誌は自動車の雑誌です。',
        'このは自動車の雑誌です。',
        'その雑誌は自動車に雑誌です。'
      ]),
      correctOptionIndex: 0,
      explanation: '「この雑誌」bổ nghĩa đúng danh từ, và「自動車の雑誌」dùng đúng trợ từ の chỉ thể loại/nội dung.'
    }
  ],

  // Bài 14: V-te ください / V-te います / V-stem ましょうか
  14: (item) => [
    {
      id: `quiz_${item.id}_q1`,
      questionNumber: 1,
      type: 'particle',
      typeName: '1. Tình huống công sở: Trợ từ địa điểm hành động',
      typeBadgeColor: 'bg-sky-950/60 border-sky-500/40 text-sky-300',
      prompt: 'Điền trợ từ chỉ địa điểm tiếp nhận hành động [ ______ ]:',
      sentenceWithBlank: 'ここに住所とお名前 [ ______ ] 書いてください。',
      targetBlankWord: 'を',
      sentenceFull: 'ここに住所とお名前を書いてください。',
      translation: 'Xin hãy viết địa chỉ và họ tên của bạn vào đây.',
      options: shuffleOptions(['を', 'に', 'で', 'は']),
      correctOptionIndex: 0,
      explanation: 'Trợ từ「を」đánh dấu tân ngữ trực tiếp (địa chỉ và họ tên) của động từ「書いてください」.'
    },
    {
      id: `quiz_${item.id}_q2`,
      questionNumber: 2,
      type: 'conjugation',
      typeName: '2. Tình huống ga tàu: Chia động từ thể Te (V-te)',
      typeBadgeColor: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
      prompt: 'Chia động từ「待つ」(chờ đợi) sang thể Te để điền vào mẫu yêu cầu lịch sự:',
      sentenceWithBlank: '少々ここで [ ______ ] ください。',
      targetBlankWord: '待って',
      sentenceFull: '少々ここで待ってください。',
      translation: 'Xin vui lòng chờ ở đây một chút ạ.',
      options: shuffleOptions(['待って', '待ちて', '待った', '待たない']),
      correctOptionIndex: 0,
      explanation: 'Động từ nhóm 1 tận cùng là「つ」chuyển sang thể Te thành「って」(待つ ➔ 待って).'
    },
    {
      id: `quiz_${item.id}_q3`,
      questionNumber: 3,
      type: 'pattern',
      typeName: '3. Tình huống phòng học: Đang diễn ra (V-te います)',
      typeBadgeColor: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      prompt: 'Chọn đuôi câu diễn tả hành động đang tiếp diễn [ ______ ]:',
      sentenceWithBlank: '学生たちは今、教室で日本語を [ ______ ]。',
      targetBlankWord: '勉強しています',
      sentenceFull: '学生たちは今、教室で日本語を勉強しています。',
      translation: 'Các bạn học sinh bây giờ đang học tiếng Nhật trong phòng học.',
      options: shuffleOptions(['勉強しています', '勉強してください', '勉強しましょう', '勉強しました']),
      correctOptionIndex: 0,
      explanation: 'Cấu trúc「V-te います」kết hợp với「今」để diễn tả hành động đang diễn ra tại thời điểm nói.'
    },
    {
      id: `quiz_${item.id}_q4`,
      questionNumber: 4,
      type: 'star_order',
      typeName: '4. Tình huống giúp đỡ người khác: Sắp xếp câu dấu sao ★',
      typeBadgeColor: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
      prompt: 'Sắp xếp 4 mảnh câu và chọn từ nằm ở vị trí dấu [ ★ ]:',
      sentenceWithBlank: '[ ① ]  [ ② ]  [ ★ ]  [ ④ ]',
      targetBlankWord: '傘を',
      sentenceFull: '雨ですから 傘を 貸し ましょうか',
      translation: 'Vì trời mưa nên tôi cho bạn mượn ô nhé?',
      options: shuffleOptions(['雨ですから', '傘を', '貸し', 'ましょうか']),
      correctOptionIndex: 0,
      explanation: 'Thứ tự đúng: 雨ですから (1) ★傘を (2) 貸し (3) ましょうか (4). Vị trí ngôi sao là「傘を」.',
      starOrderPositions: ['雨ですから', '傘を', '貸し', 'ましょうか']
    },
    {
      id: `quiz_${item.id}_q5`,
      questionNumber: 5,
      type: 'synonym',
      typeName: '5. Tình huống phòng họp: Diễn đạt tương đương',
      typeBadgeColor: 'bg-teal-950/60 border-teal-500/40 text-teal-300',
      prompt: 'Chọn câu diễn đạt cùng ý nghĩa với lời đề nghị「窓を開けましょうか」:',
      sentenceWithBlank: '「窓を開けましょうか」≒ [ ? ]',
      targetBlankWord: '私が窓を開けましょうか。(Tôi mở cửa sổ giúp bạn nhé)',
      sentenceFull: '私が窓を開けましょうか。',
      translation: 'Để tôi mở cửa sổ giúp bạn nhé (chủ động đề nghị giúp đỡ).',
      options: shuffleOptions([
        '私が窓を開けましょうか。(Tôi mở cửa sổ giúp bạn nhé)',
        '窓を開けてください。(Hãy mở cửa sổ ra)',
        '窓を開けてはいけません。(Cấm mở cửa sổ)',
        '窓が開いています。(Cửa sổ đang mở sẵn)'
      ]),
      correctOptionIndex: 0,
      explanation: '「〜ましょうか」là lời đề nghị của người nói chủ động làm việc gì đó giúp đối phương.'
    },
    {
      id: `quiz_${item.id}_q6`,
      questionNumber: 6,
      type: 'dialogue',
      typeName: '6. Tình huống mang vác hành lý nặng',
      typeBadgeColor: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300',
      prompt: 'Chọn câu đáp lại khi được người khác ngỏ ý giúp đỡ [ ______ ]:',
      sentenceWithBlank: 'A:「荷物を持ちましょうか。」\nB:「すみません、[ ______ ]。」',
      targetBlankWord: 'お願いします',
      sentenceFull: 'A:「荷物を持ちましょうか。」\nB:「すみません、お願いします。」',
      translation: 'A: Để tôi xách hành lý giúp bạn nhé? / B: Xin lỗi, nhờ bạn giúp tôi với ạ.',
      options: shuffleOptions(['お願いします', 'どういたしまして', 'いいえ、ちがいます', 'ごちそうさまでした']),
      correctOptionIndex: 0,
      explanation: 'Khi đồng ý nhận sự giúp đỡ của đối phương, câu đáp lễ lịch sự là「すみません、お願いします」.'
    },
    {
      id: `quiz_${item.id}_q7`,
      questionNumber: 7,
      type: 'nuance',
      typeName: '7. Tình huống thời tiết: Mưa đang rơi',
      typeBadgeColor: 'bg-pink-950/60 border-pink-500/40 text-pink-300',
      prompt: 'Chọn dạng động từ miêu tả hiện tượng thời tiết đang xảy ra [ ______ ]:',
      sentenceWithBlank: '外を見てください。雪が [ ______ ]。',
      targetBlankWord: '降っています',
      sentenceFull: '外を見てください。雪が降っています。',
      translation: 'Hãy nhìn ra ngoài xem kìa. Tuyết đang rơi đấy.',
      options: shuffleOptions(['降っています', '降ってください', '降ります', '降りました']),
      correctOptionIndex: 0,
      explanation: 'Hiện tượng tự nhiên đang tiếp diễn dùng「雪が降っています」(Tuyết đang rơi).'
    },
    {
      id: `quiz_${item.id}_q8`,
      questionNumber: 8,
      type: 'collocation',
      typeName: '8. Tình huống gọi taxi: Phó từ hô ứng',
      typeBadgeColor: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300',
      prompt: 'Điền phó từ chỉ tốc độ đi kèm với lời yêu cầu [ ______ ]:',
      sentenceWithBlank: '急いでいますから、[ ______ ] 走ってください。',
      targetBlankWord: '早く',
      sentenceFull: '急いでいますから、早く走ってください。',
      translation: 'Vì tôi đang vội nên xin bác tài hãy chạy nhanh lên nhé.',
      options: shuffleOptions(['早く', 'ゆっくり', 'あまり', 'とても']),
      correctOptionIndex: 0,
      explanation: '「急いでいます」(đang vội) đi liền với yêu cầu「早く」(nhanh lên).'
    },
    {
      id: `quiz_${item.id}_q9`,
      questionNumber: 9,
      type: 'passage',
      typeName: '9. Tình huống văn phòng làm việc: Điền đoạn văn',
      typeBadgeColor: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300',
      prompt: 'Đọc đoạn văn và điền cấu trúc nhờ vả phù hợp:',
      sentenceWithBlank: '部長は今、電話をかけています。この資料を [ ______ ] ください。',
      targetBlankWord: '読んで',
      sentenceFull: '部長は今、電話をかけています。この資料を読んでください。',
      translation: 'Trưởng phòng hiện đang gọi điện thoại. Bạn hãy đọc tài liệu này nhé.',
      options: shuffleOptions(['読んで', '読む', '読んだ', '読まない']),
      correctOptionIndex: 0,
      explanation: 'Yêu cầu lịch sự「〜てください」yêu cầu động từ chia về thể Te (読む ➔ 読んで).'
    },
    {
      id: `quiz_${item.id}_q10`,
      questionNumber: 10,
      type: 'correct_usage',
      typeName: '10. Tình huống chuẩn mực: Chọn câu đúng ngữ pháp',
      typeBadgeColor: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
      prompt: 'Trong 4 câu dưới đây, câu nào dùng thể Te và mẫu câu chuẩn xác nhất?',
      sentenceWithBlank: 'Chọn câu đúng chuẩn ngữ pháp:',
      targetBlankWord: 'エアコンをつけてもいいですか。',
      sentenceFull: 'エアコンをつけてもいいですか。',
      translation: 'Tôi bật điều hòa có được không ạ?',
      options: shuffleOptions([
        'エアコンをつけてもいいですか。',
        'エアコンをつけてくださいでした。',
        'エアコンをつけましょうですか。',
        'エアコンをつけるてください。'
      ]),
      correctOptionIndex: 0,
      explanation: '「エアコンをつけてもいいですか」là cấu trúc xin phép đúng ngữ pháp chuẩn N5.'
    }
  ]
};

// =========================================================================
// N4 LESSON-SPECIFIC 10-QUESTION GENERATORS (Minna no Nihongo Lessons 26 - 50)
// =========================================================================

export const N4_LESSON_QUIZZES: Record<number, (item: GrammarItem) => GrammarClozeQuestion[]> = {
  // Bài 26: 〜んです / 〜んですが / どうして〜んですか
  26: (item) => [
    {
      id: `quiz_${item.id}_q1`,
      questionNumber: 1,
      type: 'particle',
      typeName: '1. Tình huống văn phòng: Trợ từ chủ ngữ trong mệnh đề んです',
      typeBadgeColor: 'bg-sky-950/60 border-sky-500/40 text-sky-300',
      prompt: 'Điền trợ từ nhấn mạnh chủ thể trong câu giải thích [ ______ ]:',
      sentenceWithBlank: '頭 [ ______ ] 痛いんです。少し休んでもいいですか。',
      targetBlankWord: 'が',
      sentenceFull: '頭が痛いんです。少し休んでもいいですか。',
      translation: 'Vì tôi bị đau đầu (giải thích lý do). Tôi có thể nghỉ một chút được không ạ?',
      options: shuffleOptions(['が', 'を', 'に', 'で']),
      correctOptionIndex: 0,
      explanation: 'Cụm từ chỉ triệu chứng cơ thể「頭が痛い」(đau đầu) luôn dùng trợ từ「が」.'
    },
    {
      id: `quiz_${item.id}_q2`,
      questionNumber: 2,
      type: 'conjugation',
      typeName: '2. Tình huống mua sắm: Thể kết hợp trước んです',
      typeBadgeColor: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
      prompt: 'Chọn dạng đúng của tính từ đuôi な trước「んです」[ ______ ]:',
      sentenceWithBlank: 'この町はとても [ ______ ] んです。',
      targetBlankWord: '静かな',
      sentenceFull: 'この町はとても静かなんです。',
      translation: 'Thị trấn này rất yên tĩnh đấy (chia sẻ thông tin cảm nhận).',
      options: shuffleOptions(['静かな', '静か', '静かで', '静かに']),
      correctOptionIndex: 0,
      explanation: 'Tính từ đuôi な khi đứng trước「んです」bắt buộc phải giữ nguyên「な」(静かなんです).'
    },
    {
      id: `quiz_${item.id}_q3`,
      questionNumber: 3,
      type: 'pattern',
      typeName: '3. Tình huống nhờ vả: Rào trước bằng 〜んですが',
      typeBadgeColor: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      prompt: 'Chọn cấu trúc mở lời lịch sự trước khi nhờ người khác giúp đỡ [ ______ ]:',
      sentenceWithBlank: '日本語の作文を書いた [ ______ ] 、ちょっと見ていただけませんか。',
      targetBlankWord: 'んですが',
      sentenceFull: '日本語の作文を書いたんですが、ちょっと見ていただけませんか。',
      translation: 'Tôi vừa viết một bài văn tiếng Nhật, bạn có thể xem qua giúp tôi một chút được không ạ?',
      options: shuffleOptions(['んですが', 'ので', 'から', 'けれど']),
      correctOptionIndex: 0,
      explanation: 'Cấu trúc「〜んですが、〜」dùng để nêu bối cảnh và rào trước một cách khéo léo trước khi nhờ vả.'
    },
    {
      id: `quiz_${item.id}_q4`,
      questionNumber: 4,
      type: 'star_order',
      typeName: '4. Tình huống giải thích đi muộn: Sắp xếp câu dấu sao ★',
      typeBadgeColor: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
      prompt: 'Sắp xếp 4 mảnh câu và chọn từ nằm ở vị trí dấu [ ★ ]:',
      sentenceWithBlank: '[ ① ]  [ ② ]  [ ★ ]  [ ④ ]',
      targetBlankWord: '止まった',
      sentenceFull: '事故で 電車が 止まった んです',
      translation: 'Do có tai nạn nên tàu điện bị dừng hoạt động đấy ạ (giải thích lý do).',
      options: shuffleOptions(['事故で', '電車が', '止まった', 'んです']),
      correctOptionIndex: 0,
      explanation: 'Thứ tự đúng: 事故で (1) 電車が (2) ★止まった (3) んです (4). Vị trí ngôi sao là「止まった」.',
      starOrderPositions: ['事故で', '電車が', '止まった', 'んです']
    },
    {
      id: `quiz_${item.id}_q5`,
      questionNumber: 5,
      type: 'synonym',
      typeName: '5. Tình huống hội thoại: Bản chất của んです',
      typeBadgeColor: 'bg-teal-950/60 border-teal-500/40 text-teal-300',
      prompt: 'Chọn cách hiểu chính xác nhất khi người nói dùng「体調が悪いんです」:',
      sentenceWithBlank: '「体調が悪いんです」のニュアンス ≒ [ ? ]',
      targetBlankWord: '相手に理由や事情を説明して理解を求めている (Giải thích lý do để đối phương thấu hiểu)',
      sentenceFull: '相手に理由や事情を説明して理解を求めている。',
      translation: 'Giải thích lý do, hoàn cảnh sức khỏe không tốt để tìm kiếm sự thấu hiểu từ đối phương.',
      options: shuffleOptions([
        '相手に理由や事情を説明して理解を求めている (Giải thích lý do để đối phương thấu hiểu)',
        '相手を厳しく注意している (Nghiêm khắc nhắc nhở)',
        'ただの独り言を言っている (Chỉ là độc thoại một mình)',
        '未来の予定を約束している (Hứa hẹn kế hoạch tương lai)'
      ]),
      correctOptionIndex: 0,
      explanation: '「んです」luôn mang sắc thái giải thích lý do, sự tình thực tế để tạo sự đồng cảm.'
    },
    {
      id: `quiz_${item.id}_q6`,
      questionNumber: 6,
      type: 'dialogue',
      typeName: '6. Tình huống tò mò hỏi lý do: どうして〜んですか',
      typeBadgeColor: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300',
      prompt: 'Đọc hội thoại và chọn câu trả lời tự nhiên nhất:',
      sentenceWithBlank: 'A:「きれいな着物を着ていますね。どこかへ行くんですか。」\nB:「ええ、[ ______ ] んです。」',
      targetBlankWord: '友達の結婚式に行く',
      sentenceFull: 'A:「きれいな着物を着ていますね。どこかへ行くんですか。」\nB:「ええ、友達の結婚式に行くんです。」',
      translation: 'A: Bạn mặc bộ Kimono đẹp quá nhỉ. Bạn đi đâu thế? / B: Vâng, tôi đi dự đám cưới của bạn bè đấy.',
      options: shuffleOptions([
        '友達の結婚式に行く',
        '友達の結婚式に行ったことがある',
        '友達の結婚式に行きたいです',
        '友達の結婚式に行かないで'
      ]),
      correctOptionIndex: 0,
      explanation: 'Khi trả lời câu hỏi「〜んですか」, người nói tiếp tục dùng「[Động từ thể thường] + んです」.'
    },
    {
      id: `quiz_${item.id}_q7`,
      questionNumber: 7,
      type: 'nuance',
      typeName: '7. Tình huống xin lời khuyên: どうしたらいいですか',
      typeBadgeColor: 'bg-pink-950/60 border-pink-500/40 text-pink-300',
      prompt: 'Chọn câu hỏi xin chỉ dẫn/lời khuyên chuẩn xác nhất [ ______ ]:',
      sentenceWithBlank: '財布を落としてしまったんですが、[ ______ ]。',
      targetBlankWord: 'どうすればいいですか',
      sentenceFull: '財布を落としてしまったんですが、どうすればいいですか。',
      translation: 'Tôi lỡ đánh rơi ví mất rồi, tôi nên làm thế nào bây giờ ạ?',
      options: shuffleOptions([
        'どうすればいいですか',
        'どうしてですか',
        'どうですか',
        'どちらですか'
      ]),
      correctOptionIndex: 0,
      explanation: 'Mẫu câu「〜んですが、どうすればいいですか」(hoặc どうしたらいいですか) dùng để xin lời khuyên khi gặp rắc rối.'
    },
    {
      id: `quiz_${item.id}_q8`,
      questionNumber: 8,
      type: 'collocation',
      typeName: '8. Tình huống nghi vấn: Từ để hỏi thích hợp',
      typeBadgeColor: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300',
      prompt: 'Điền từ để hỏi nguyên nhân kết hợp với「んですか」[ ______ ]:',
      sentenceWithBlank: '[ ______ ] 昨日のパーティーに来なかったんですか。',
      targetBlankWord: 'どうして',
      sentenceFull: 'どうして昨日のパーティーに来なかったんですか。',
      translation: 'Tại sao hôm qua bạn lại không đến bữa tiệc thế?',
      options: shuffleOptions(['どうして', 'どんな', 'だれ', 'いつ']),
      correctOptionIndex: 0,
      explanation: '「どうして〜んですか」là mẫu câu hỏi tại sao đầy quan tâm và lịch sự.'
    },
    {
      id: `quiz_${item.id}_q9`,
      questionNumber: 9,
      type: 'passage',
      typeName: '9. Tình huống học tập Nhật Bản: Điền đoạn văn',
      typeBadgeColor: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300',
      prompt: 'Đọc đoạn văn trải nghiệm và điền từ thích hợp:',
      sentenceWithBlank: '生け花を習いたいんですが、いい先生を [ ______ ] いただけませんか。',
      targetBlankWord: '紹介して',
      sentenceFull: '生け花を習いたいんですが、いい先生を紹介していただけませんか。',
      translation: 'Tôi muốn học cắm hoa nghệ thuật Ikebana, bạn có thể giới thiệu cho tôi một giáo viên giỏi được không ạ?',
      options: shuffleOptions(['紹介して', '紹介する', '紹介した', '紹介しなくて']),
      correctOptionIndex: 0,
      explanation: 'Cấu trúc nhờ vả trang trọng「〜ていただけませんか」yêu cầu động từ chia ở thể Te (紹介して).'
    },
    {
      id: `quiz_${item.id}_q10`,
      questionNumber: 10,
      type: 'correct_usage',
      typeName: '10. Tình huống chuẩn mực: Chọn câu đúng ngữ pháp',
      typeBadgeColor: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
      prompt: 'Trong 4 câu dưới đây, câu nào dùng「〜んです」chuẩn xác nhất?',
      sentenceWithBlank: 'Chọn câu đúng chuẩn ngữ pháp:',
      targetBlankWord: 'チケットを予約したいんですが、やり方を教えてください。',
      sentenceFull: 'チケットを予約したいんですが、やり方を教えてください。',
      translation: 'Tôi muốn đặt vé trước, xin hãy chỉ cho tôi cách làm với ạ.',
      options: shuffleOptions([
        'チケットを予約したいんですが、やり方を教えてください。',
        'チケットを予約したいんです、やり方を教えてください。',
        'チケットを予約したいますんですが、教えてください。',
        'チケットを予約するんですから、教えてください。'
      ]),
      correctOptionIndex: 0,
      explanation: '「〜たいんですが、教えてください」là cách diễn đạt tự nhiên và chính xác nhất trong N4.'
    }
  ]
};

// =========================================================================
// GENERAL SYNTHESIZER FOR ANY GRAMMAR ITEM / LESSON
// (Strictly uses vocabulary & kanji tailored to the target JLPT Level)
// =========================================================================

export function generateGrammarQuizSet(
  item: GrammarItem,
  allGrammars: GrammarItem[] = []
): GrammarClozeQuestion[] {
  const lvl = (item.level || 'N5').toUpperCase();
  const lessonNum = Number(item.lessonNumber || item.lessonId || 1);

  // 1. Check if we have an exact curated bank for N5
  if (lvl === 'N5' && N5_LESSON_QUIZZES[lessonNum]) {
    return sanitizeQuizQuestions(N5_LESSON_QUIZZES[lessonNum](item));
  }

  // 2. Check if we have an exact curated bank for N4
  if (lvl === 'N4' && N4_LESSON_QUIZZES[lessonNum]) {
    return sanitizeQuizQuestions(N4_LESSON_QUIZZES[lessonNum](item));
  }

  // 3. Dynamic synthesis with strict level-appropriate vocabulary & kanji
  const pattern = cleanPattern(item.structure) || item.structure;
  const structLower = (item.structure + ' ' + pattern).toLowerCase();
  const meaning = item.meaning || 'Mẫu ngữ pháp quan trọng';
  const exJp = item.exampleSentence || `${pattern}を使います。`;
  const exVi = item.exampleTranslation || meaning;

  const questions: GrammarClozeQuestion[] = [];

  // Q1: Particle (Trợ từ công sở / trường học phù hợp level)
  {
    let targetParticle = 'に';
    let blankSent = `山田先生 [ ______ ] 質問をしました。`;
    let fullSent = `山田先生に質問をしました。`;
    let trans = 'Tôi đã đặt câu hỏi cho thầy giáo Yamada.';
    let expl = `Trợ từ「に」chỉ đối tượng hướng tới của hành động hỏi (hỏi thầy Yamada).`;

    if (structLower.includes('で') || /で/.test(pattern)) {
      targetParticle = 'で';
      blankSent = `教室 [ ______ ] 日本語を勉強します。`;
      fullSent = `教室で日本語を勉強します。`;
      trans = 'Tôi học tiếng Nhật ở trong lớp học.';
      expl = `Trợ từ「で」chỉ địa điểm diễn ra hành động học tập.`;
    } else if (structLower.includes('を') || /を/.test(pattern)) {
      targetParticle = 'を';
      blankSent = `新しい単語 [ ______ ] 覚えます。`;
      fullSent = `新しい単語を覚えます。`;
      trans = 'Tôi ghi nhớ từ vựng mới.';
      expl = `Trợ từ「を」chỉ đối tượng tác động trực tiếp của hành động ghi nhớ.`;
    }

    const opts = shuffleOptions([targetParticle, 'は', 'が', 'と'].filter((v, i, a) => a.indexOf(v) === i));
    while (opts.length < 4) opts.push(['も', 'へ', 'から'][opts.length - 1] || 'より');

    questions.push({
      id: `quiz_${item.id}_q1`,
      questionNumber: 1,
      type: 'particle',
      typeName: '1. Tình huống học tập: Chọn trợ từ chuẩn',
      typeBadgeColor: 'bg-sky-950/60 border-sky-500/40 text-sky-300',
      prompt: 'Điền trợ từ chính xác vào chỗ trống trong câu sau [ ______ ]:',
      sentenceWithBlank: blankSent,
      targetBlankWord: targetParticle,
      sentenceFull: fullSent,
      translation: trans,
      options: opts,
      correctOptionIndex: opts.indexOf(targetParticle),
      explanation: expl
    });
  }

  // Q2: Conjugation (Chia thể đúng cấu trúc)
  {
    let verbForm = '勉強して';
    let blankSent = `毎日日本語を [ ______ ] います。`;
    let fullSent = `毎日日本語を勉強しています。`;
    let trans = 'Mỗi ngày tôi đều đang học tiếng Nhật.';
    let opts = shuffleOptions(['勉強して', '勉強した', '勉強する', '勉強し']);
    let expl = `Động từ chia ở thể Te (勉強して) kết hợp với「います」để tạo thành thì tiếp diễn hoặc thói quen.`;

    if (/ない|なくて|なければ/.test(structLower)) {
      verbForm = '忘れない';
      blankSent = `宿題を [ ______ ] でください。`;
      fullSent = `宿題を忘れないでください。`;
      trans = 'Xin đừng quên bài tập về nhà.';
      opts = shuffleOptions(['忘れない', '忘れて', '忘れた', '忘れる']);
      expl = `Cấu trúc yêu cầu động từ chia thể Nai (忘れない) kết hợp với「でください」.`;
    } else if (/ば|なら/.test(structLower)) {
      verbForm = '安ければ';
      blankSent = `値段が [ ______ ] 、買います。`;
      fullSent = `値段が安ければ、買います。`;
      trans = 'Nếu giá rẻ thì tôi sẽ mua.';
      opts = shuffleOptions(['安ければ', '安かったら', '安くて', '安いなら']);
      expl = `Tính từ đuôi い chia thể điều kiện「〜ば」bằng cách đổi い thành「ければ」(安ければ).`;
    } else if (/まえに|こと|つもり/.test(structLower)) {
      verbForm = '行く';
      blankSent = `日本へ [ ______ ] まえに、言葉を勉強します。`;
      fullSent = `日本へ行くまえに、言葉を勉強します。`;
      trans = 'Trước khi đi Nhật Bản, tôi học ngôn ngữ.';
      opts = shuffleOptions(['行く', '行って', '行った', '行かない']);
      expl = `Trước「まえに」động từ luôn để thể từ điển nguyên dạng (行く).`;
    }

    questions.push({
      id: `quiz_${item.id}_q2`,
      questionNumber: 2,
      type: 'conjugation',
      typeName: '2. Tình huống đời sống: Chia thể kết hợp',
      typeBadgeColor: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
      prompt: 'Chọn dạng chia động từ / tính từ chính xác điền vào [ ______ ]:',
      sentenceWithBlank: blankSent,
      targetBlankWord: verbForm,
      sentenceFull: fullSent,
      translation: trans,
      options: opts,
      correctOptionIndex: opts.indexOf(verbForm),
      explanation: expl
    });
  }

  // Q3: Central Grammar Pattern Fill-in (Điền chính xác mẫu ngữ pháp)
  {
    const targetGrammar = pattern || 'ことです';
    let blankSent = `私の趣味は本を読む [ ______ ]。`;
    let fullSent = `私の趣味は本を読む${targetGrammar}。`;
    let trans = `Sở thích của tôi là việc đọc sách.`;
    let expl = `Mẫu ngữ pháp「${targetGrammar}」thể hiện chính xác ý nghĩa「${meaning}」.`;

    if (exJp && exJp.includes(pattern)) {
      blankSent = exJp.replace(pattern, '[ ______ ]');
      fullSent = exJp;
      trans = exVi;
    }

    const fallbacks = ['ので', 'のに', 'ながら', 'ために', 'ように', 'から', 'まで']
      .filter(p => p !== targetGrammar)
      .slice(0, 3);
    const opts = shuffleOptions([targetGrammar, ...fallbacks]);

    questions.push({
      id: `quiz_${item.id}_q3`,
      questionNumber: 3,
      type: 'pattern',
      typeName: '3. Tình huống trọng tâm: Điền cấu trúc ngữ pháp',
      typeBadgeColor: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      prompt: 'Chọn cấu trúc ngữ pháp đúng nhất điền vào chỗ trống [ ______ ]:',
      sentenceWithBlank: blankSent,
      targetBlankWord: targetGrammar,
      sentenceFull: fullSent,
      translation: trans,
      options: opts,
      correctOptionIndex: opts.indexOf(targetGrammar),
      explanation: expl
    });
  }

  // Q4: JLPT Star Ordering ★ (Sắp xếp câu dấu sao)
  {
    let frags = ['日本語の', '勉強は', 'とても', '楽しいです'];
    let starIdx = 2; // 'とても'
    let trans = 'Việc học tiếng Nhật rất là thú vị.';
    let starWord = frags[starIdx];

    if (item.wordsToReorder && item.wordsToReorder.length >= 3) {
      frags = item.wordsToReorder.slice(0, 4);
      while (frags.length < 4) frags.push('です');
      starIdx = 1;
      starWord = frags[starIdx];
      trans = item.exampleTranslation || meaning;
    }

    const shuffled = shuffleOptions(frags);

    questions.push({
      id: `quiz_${item.id}_q4`,
      questionNumber: 4,
      type: 'star_order',
      typeName: '4. Tình huống JLPT: Sắp xếp câu dấu sao ★',
      typeBadgeColor: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
      prompt: 'Sắp xếp 4 mảnh câu theo thứ tự đúng và chọn từ nằm ở vị trí dấu [ ★ ]:',
      sentenceWithBlank: `[ ① ]  [ ② ]  [ ★ ]  [ ④ ]`,
      targetBlankWord: starWord,
      sentenceFull: frags.join(' '),
      translation: trans,
      options: shuffled,
      correctOptionIndex: shuffled.indexOf(starWord),
      explanation: `Thứ tự sắp xếp đúng là: ${frags.map((f, i) => (i === starIdx ? `★【${f}】` : f)).join(' ')}. Từ ở vị trí dấu sao là「${starWord}」.`,
      starOrderPositions: frags
    });
  }

  // Q5: Synonym / Nuance Selection (Diễn đạt tương đương)
  {
    const targetSentence = exJp || `この文法は「${pattern}」です。`;
    const optCorrect = `この表現の意味は「${meaning}」です。(Bản chất: ${meaning})`;
    const optWrong1 = `反対の意味を表しています。(Thể hiện ý nghĩa trái ngược)`;
    const optWrong2 = `過去の経験だけを述べています。(Chỉ nói về kinh nghiệm quá khứ)`;
    const optWrong3 = `厳しい禁止を表しています。(Cấm đoán nghiêm ngặt)`;

    const opts = shuffleOptions([optCorrect, optWrong1, optWrong2, optWrong3]);

    questions.push({
      id: `quiz_${item.id}_q5`,
      questionNumber: 5,
      type: 'synonym',
      typeName: '5. Tình huống ngữ nghĩa: Diễn đạt tương đương',
      typeBadgeColor: 'bg-teal-950/60 border-teal-500/40 text-teal-300',
      prompt: `Chọn cách hiểu hoặc diễn đạt tương đương chính xác nhất với câu「${targetSentence}」:`,
      sentenceWithBlank: `「 ${targetSentence} 」≒ [ ? ]`,
      targetBlankWord: optCorrect,
      sentenceFull: targetSentence,
      translation: exVi,
      options: opts,
      correctOptionIndex: opts.indexOf(optCorrect),
      explanation: `Mẫu ngữ pháp này mang ý nghĩa cốt lõi: ${meaning}.`
    });
  }

  // Q6: 2-Person Real-life Dialogue A & B (Hội thoại giao tiếp 2 người)
  {
    const speakerA = 'A:「日本語の勉強はどうですか。」';
    const speakerB = `B:「はい、${pattern ? pattern : 'とても'} 頑張っています。」`;
    const blankB = `B:「はい、[ ______ ] 頑張っています。」`;
    const targetWord = pattern ? pattern : '毎日';
    const trans = 'A: Việc học tiếng Nhật thế nào rồi? / B: Vâng, tôi đang rất nỗ lực cố gắng mỗi ngày.';
    const opts = shuffleOptions([targetWord, 'あまり', 'ぜんぜん', 'どうして'].filter((v, i, a) => a.indexOf(v) === i));
    while (opts.length < 4) opts.push(['いつも', 'ちょっと', 'たぶん'][opts.length - 1] || 'よく');

    questions.push({
      id: `quiz_${item.id}_q6`,
      questionNumber: 6,
      type: 'dialogue',
      typeName: '6. Tình huống giao tiếp hội thoại A & B',
      typeBadgeColor: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300',
      prompt: 'Đọc đoạn đối thoại A - B dưới đây và chọn từ thích hợp nhất điền vào chỗ trống:',
      sentenceWithBlank: `${speakerA}\n${blankB}`,
      targetBlankWord: targetWord,
      sentenceFull: `${speakerA}\n${speakerB}`,
      translation: trans,
      options: opts,
      correctOptionIndex: opts.indexOf(targetWord),
      explanation: `Trong hội thoại, phương án「${targetWord}」hoàn thiện câu trả lời tự nhiên và chuẩn xác nhất.`,
      contextDialog: { speakerA, speakerB }
    });
  }

  // Q7: Contextual & Logic Choice (Sắc thái & logic câu)
  {
    let targetWord = 'から';
    let testSentence = `時間がありません [ ______ ] 、急ぎましょう。`;
    let trans = 'Vì không có thời gian nên chúng ta hãy nhanh lên nào.';
    let expl = `Trợ từ nối「から」chỉ nguyên nhân lý do cho lời thúc giục hành động.`;

    if (/ので/.test(structLower)) {
      targetWord = 'ので';
      testSentence = `雨が降っている [ ______ ] 、傘を持っていきます。`;
      trans = 'Vì trời đang mưa nên tôi mang theo ô.';
      expl = `「ので」nêu lý do khách quan tự nhiên.`;
    } else if (/のに/.test(structLower)) {
      targetWord = 'のに';
      testSentence = `約束した [ ______ ] 、来ませんでした。`;
      trans = 'Đã hẹn trước thế mà lại không đến.';
      expl = `「のに」thể hiện sự thất vọng trái ngược với kỳ vọng.`;
    }

    const opts = shuffleOptions([targetWord, 'でも', 'ながら', 'ても'].filter((v, i, a) => a.indexOf(v) === i));
    while (opts.length < 4) opts.push(['より', 'ほど', 'ばかり'][opts.length - 1] || 'まで');

    questions.push({
      id: `quiz_${item.id}_q7`,
      questionNumber: 7,
      type: 'nuance',
      typeName: '7. Tình huống logic: Sắc thái câu văn',
      typeBadgeColor: 'bg-pink-950/60 border-pink-500/40 text-pink-300',
      prompt: 'Chọn từ mang sắc thái logic và tự nhiên nhất điền vào câu sau [ ______ ]:',
      sentenceWithBlank: testSentence,
      targetBlankWord: targetWord,
      sentenceFull: testSentence.replace('[ ______ ]', targetWord),
      translation: trans,
      options: opts,
      correctOptionIndex: opts.indexOf(targetWord),
      explanation: expl
    });
  }

  // Q8: Collocation & Responsive Adverb (Phó từ hô ứng)
  {
    let targetAdverb = 'ぜひ';
    let blankSent = `日本へ [ ______ ] 行きたいです。`;
    let fullSent = `日本へぜひ行きたいです。`;
    let trans = 'Tôi nhất định rất muốn đi Nhật Bản.';
    let expl = `Phó từ「ぜひ」thường hô ứng đi kèm với đuôi câu mong muốn「〜たい」(rất muốn, nhất định).`;

    if (/たら|ば|なら/.test(structLower)) {
      targetAdverb = 'もし';
      blankSent = `[ ______ ] 時間があれば、手伝ってください。`;
      fullSent = `もし時間があれば、手伝ってください。`;
      trans = 'Nếu có thời gian, xin hãy giúp tôi một tay nhé.';
      expl = `Phó từ「もし」thường đứng đầu câu điều kiện giả định (もし〜ば / たら).`;
    } else if (/ない/.test(structLower)) {
      targetAdverb = 'あまり';
      blankSent = `今日は [ ______ ] 寒くないです。`;
      fullSent = `今日はあまり寒くないです。`;
      trans = 'Hôm nay trời không lạnh lắm.';
      expl = `Phó từ「あまり」đi kèm với dạng phủ định「〜ない」(không... lắm).`;
    }

    const opts = shuffleOptions([targetAdverb, 'たぶん', 'ぜんぜん', 'すっかり'].filter((v, i, a) => a.indexOf(v) === i));
    while (opts.length < 4) opts.push(['ちょうど', 'ほとんど', 'とても'][opts.length - 1] || 'もっと');

    questions.push({
      id: `quiz_${item.id}_q8`,
      questionNumber: 8,
      type: 'collocation',
      typeName: '8. Tình huống hô ứng: Chọn phó từ đi kèm',
      typeBadgeColor: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300',
      prompt: 'Chọn phó từ hô ứng chính xác điền vào câu sau [ ______ ]:',
      sentenceWithBlank: blankSent,
      targetBlankWord: targetAdverb,
      sentenceFull: fullSent,
      translation: trans,
      options: opts,
      correctOptionIndex: opts.indexOf(targetAdverb),
      explanation: expl
    });
  }

  // Q9: Short Passage / Reading Story (Đoạn văn ngắn 2 câu)
  {
    let passage = `日本での生活は楽しいです。友達がたくさんできた [ ______ ] 、寂しくありません。`;
    let correctPassageWord = 'ので';
    let trans = 'Cuộc sống ở Nhật Bản rất vui. Vì đã kết bạn được với nhiều người nên tôi không hề cô đơn.';
    let expl = `Mẫu「ので」nối liền lý do có nhiều bạn bè với kết quả không bị cô đơn.`;

    const distractors = ['せいで', 'かわりに', 'とおりに', 'のに']
      .filter(w => w !== correctPassageWord)
      .slice(0, 3);
    const opts = shuffleOptions([correctPassageWord, ...distractors]);

    questions.push({
      id: `quiz_${item.id}_q9`,
      questionNumber: 9,
      type: 'passage',
      typeName: '9. Tình huống đoạn văn ngắn: Đọc hiểu điền từ',
      typeBadgeColor: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300',
      prompt: 'Đọc đoạn văn ngắn sau và chọn từ thích hợp nhất điền vào chỗ trống:',
      sentenceWithBlank: passage,
      targetBlankWord: correctPassageWord,
      sentenceFull: passage.replace('[ ______ ]', correctPassageWord),
      translation: trans,
      options: opts,
      correctOptionIndex: opts.indexOf(correctPassageWord),
      explanation: expl
    });
  }

  // Q10: JLPT Correct Usage (Chọn câu dùng đúng ngữ pháp)
  {
    const correctSentence = exJp || `日本語の文法を正しく使います。`;
    const trans = exVi || 'Sử dụng đúng ngữ pháp tiếng Nhật.';
    const wrong1 = `${correctSentence.replace(/[。]/g, '')}じゃありませんでした。(Sai ngữ cảnh)`;
    const wrong2 = `${correctSentence.replace(/[。]/g, '')}ながら寝ます。(Sai logic hành động)`;
    const wrong3 = `${correctSentence.replace(/[。]/g, '')}まえに。(Câu chưa hoàn chỉnh)`;
    const expl = `Câu「${correctSentence}」sử dụng cấu trúc ngữ pháp「${item.structure}」một cách tự nhiên, chuẩn mực và đúng ngữ cảnh nhất.`;

    const opts = shuffleOptions([correctSentence, wrong1, wrong2, wrong3]);

    questions.push({
      id: `quiz_${item.id}_q10`,
      questionNumber: 10,
      type: 'correct_usage',
      typeName: '10. Tình huống chuẩn mực: Chọn câu đúng ngữ pháp',
      typeBadgeColor: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
      prompt: `Trong 4 câu dưới đây, câu nào sử dụng cấu trúc ngữ pháp tự nhiên và đúng chuẩn nhất?`,
      sentenceWithBlank: `Chọn 1 câu đúng nhất trong 4 phương án sau:`,
      targetBlankWord: correctSentence,
      sentenceFull: correctSentence,
      translation: trans,
      options: opts,
      correctOptionIndex: opts.indexOf(correctSentence),
      explanation: expl
    });
  }

  return sanitizeQuizQuestions(questions);
}

/**
 * Backward compatibility helper for single question generator
 */
export function generateGrammarClozeQuestion(
  item: GrammarItem,
  allGrammars: GrammarItem[] = []
): GrammarClozeQuestion {
  const set = generateGrammarQuizSet(item, allGrammars);
  return set[0];
}
