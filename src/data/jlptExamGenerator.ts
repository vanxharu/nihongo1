import { DailyExam, ExamQuestion } from '../types';

// Standard Question Count Breakdown per JLPT Level
export const JLPT_LEVEL_TARGETS: Record<string, { mojiGoi: number; bunpou: number; dokkai: number; choukai: number; total: number; duration: number }> = {
  'N5': { mojiGoi: 35, bunpou: 23, dokkai: 4, choukai: 5, total: 67, duration: 105 },
  'N4': { mojiGoi: 35, bunpou: 25, dokkai: 5, choukai: 5, total: 70, duration: 125 },
  'N3': { mojiGoi: 35, bunpou: 22, dokkai: 11, choukai: 5, total: 73, duration: 140 },
  'N2': { mojiGoi: 30, bunpou: 21, dokkai: 15, choukai: 5, total: 71, duration: 155 },
  'N1': { mojiGoi: 25, bunpou: 19, dokkai: 17, choukai: 5, total: 66, duration: 170 },
};

// ============================================
// LEVEL-SPECIFIC AUTHENTIC QUESTION POOLS
// ============================================

// N5 AUTHENTIC POOLS
const N5_MOJI_GOI: Omit<ExamQuestion, 'id'>[] = [
  { question: '毎朝、【新聞】を読みます。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['しんぶん', 'ほん', 'ざっし', 'じしょ'], correctIndex: 0, section: 'moji-goi', explanation: '新聞 (しんぶん) nghĩa là tờ báo.' },
  { question: 'あそこに大きな【犬】がいますね。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['ねこ', 'いぬ', 'とり', 'さかな'], correctIndex: 1, section: 'moji-goi', explanation: '犬 (いぬ) nghĩa là con chó.' },
  { question: 'この部屋は【あかるい】ですね。', hint: 'Chữ Kanji đúng của từ trong ngoặc 【】', options: ['明るい', '暗い', '広い', '高い'], correctIndex: 0, section: 'moji-goi', explanation: 'あかるい = 明るい (sáng sủa).' },
  { question: '昨日はとても【あつかった】です。', hint: 'Chữ Kanji đúng của từ trong ngoặc 【】', options: ['暑かった', '寒かった', '温かかった', '涼しかった'], correctIndex: 0, section: 'moji-goi', explanation: 'あつかった = 暑かった (thời tiết nóng).' },
  { question: '毎晩10時に【ねます】。', hint: 'Chữ Kanji đúng của từ trong ngoặc 【】', options: ['寝ます', '起きます', '行きます', '来ます'], correctIndex: 0, section: 'moji-goi', explanation: 'ねます = 寝ます (đi ngủ).' },
  { question: '昨日は友達と公園で【遊びました】。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['あそびました', 'はしりました', 'あるきました', 'およぎました'], correctIndex: 0, section: 'moji-goi', explanation: '遊びました = あそびました (đã vui chơi).' },
  { question: 'あの【建物】は図書館です。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['たてもの', 'たべもの', 'のみもの', 'かいもの'], correctIndex: 0, section: 'moji-goi', explanation: '建物 = たてもの (tòa nhà).' },
  { question: 'テーブルの上にりんごが【三つ】あります。', hint: 'Cách đọc từ trong ngoặc 【】', options: ['みっつ', 'ひとつ', 'ふたつ', 'よっつ'], correctIndex: 0, section: 'moji-goi', explanation: '三つ = みっつ (3 cái/quả).' },
  { question: '友達から手紙が【とどきました】。', hint: 'Chữ Kanji đúng của từ trong ngoặc 【】', options: ['届きました', '着きました', '来ました', '書きました'], correctIndex: 0, section: 'moji-goi', explanation: 'とどきました = 届きました (đã gửi tới nơi).' },
  { question: 'ここで【写真】をとってはいけません。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['しゃしん', 'かがみ', 'えいが', 'えのぐ'], correctIndex: 0, section: 'moji-goi', explanation: '写真 = しゃしん (bức ảnh).' },
  { question: '【電車】の中で本を読みます。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['でんしゃ', 'じどうしゃ', 'じてんしゃ', 'ひこうき'], correctIndex: 0, section: 'moji-goi', explanation: '電車 = でんしゃ (tàu điện).' },
  { question: '【高い】山に登りたいです。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['たかい', 'ひくい', 'ながい', 'みじかい'], correctIndex: 0, section: 'moji-goi', explanation: '高い = たかい (cao).' },
  { question: '冷たい【水】を飲みます。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['みず', 'おゆ', 'さけ', 'スープ'], correctIndex: 0, section: 'moji-goi', explanation: '水 = みず (nước).' },
  { question: '【白】いシャツを着ています。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['しろ', 'くろ', 'あか', 'あお'], correctIndex: 0, section: 'moji-goi', explanation: '白 = しろ (màu trắng).' },
  { question: '図書館で【本】を借りました。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['ほん', 'ざっし', 'ノート', 'じしょ'], correctIndex: 0, section: 'moji-goi', explanation: '本 = ほん (sách).' },
  { question: 'パンと【牛乳】を買いました。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['ぎゅうにゅう', 'おちゃ', 'みず', 'ジュース'], correctIndex: 0, section: 'moji-goi', explanation: '牛乳 = ぎゅうにゅう (sữa bò).' },
  { question: '【夏】休みに海へ行きます。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['なつ', 'ふゆ', 'はる', 'あき'], correctIndex: 0, section: 'moji-goi', explanation: '夏 = なつ (mùa hè).' },
  { question: '【右】に曲がってください。', hint: 'Cách đọc Kanji trong ngoặc 【】', options: ['みぎ', 'ひだり', 'きた', 'みなみ'], correctIndex: 0, section: 'moji-goi', explanation: '右 = みぎ (bên phải).' },
  { question: '毎朝シャワーを（　　）。', hint: 'Điền động từ đúng vào chỗ trống （）', options: ['あびます', 'のみます', 'はいります', 'あらいます'], correctIndex: 0, section: 'moji-goi', explanation: 'シャワーをあびる (tắm vòi sen).' },
  { question: 'デパートで（　　）を買いました。', hint: 'Điền từ Katakana thích hợp', options: ['カメラ', 'ドア', 'プール', 'ノート'], correctIndex: 0, section: 'moji-goi', explanation: 'カメラ = camera (máy ảnh).' }
];

const N5_BUNPOU: Omit<ExamQuestion, 'id'>[] = [
  { question: '私は毎日、バス（　　）学校へ行きます。', hint: 'Chọn trợ từ chỉ phương tiện', options: ['で', 'に', 'を', 'へ'], correctIndex: 0, section: 'bunpou', explanation: 'Trợ từ で chỉ phương tiện di chuyển.' },
  { question: '日曜日に友達（　　）買い物に行きました。', hint: 'Chọn trợ từ đi cùng ai', options: ['と', 'に', 'で', 'を'], correctIndex: 0, section: 'bunpou', explanation: 'Trợ từ と chỉ người cùng làm việc.' },
  { question: '部屋に田中さん（　　）います。', hint: 'Chọn trợ từ chủ ngữ tồn tại', options: ['が', 'を', 'で', 'へ'], correctIndex: 0, section: 'bunpou', explanation: 'Chủ ngữ của sự tồn tại (います) đi với が.' },
  { question: '昨日は熱があった（　　）、学校を休んだ。', hint: 'Chọn liên từ nguyên nhân', options: ['から', 'けれど', 'で', 'のに'], correctIndex: 0, section: 'bunpou', explanation: '〜から: Vì... nên.' },
  { question: '今からラジオを聞き（　　）ご飯を食べます。', hint: 'Chọn mẫu câu đồng thời hai hành động', options: ['ながら', 'て', 'たり', 'あとで'], correctIndex: 0, section: 'bunpou', explanation: 'V-bỏ-masu + ながら: vừa làm A vừa làm B.' },
  { question: 'ここに名前を（　　）ください。', hint: 'Chọn dạng thể Te', options: ['書いて', '書きます', '書かないで', '書いた'], correctIndex: 0, section: 'bunpou', explanation: 'V-てください: Xin hãy viết tên.' },
  { question: '公園へ散歩（　　）行きます。', hint: 'Chọn trợ từ chỉ mục đích', options: ['に', 'で', 'を', 'へ'], correctIndex: 0, section: 'bunpou', explanation: 'N + に行きます: Đi để dạo bộ.' }
];

// Padding / exam completing helper
export function ensureFullExamQuestions(exam: DailyExam): DailyExam {
  const level = exam.level || 'N5';
  const targets = JLPT_LEVEL_TARGETS[level] || JLPT_LEVEL_TARGETS['N5'];
  
  const existingQuestions = [...exam.questions];
  const mojiGoi = existingQuestions.filter(q => q.section === 'moji-goi');
  const bunpou = existingQuestions.filter(q => q.section === 'bunpou');
  const dokkai = existingQuestions.filter(q => q.section === 'dokkai');
  const choukai = existingQuestions.filter(q => q.section === 'choukai');

  // If exam already has substantial questions (e.g. 15+ questions), keep it as authentic as possible
  if (existingQuestions.length >= 10) {
    return {
      ...exam,
      durationMinutes: targets.duration
    };
  }

  const padSection = (
    currentList: ExamQuestion[], 
    targetCount: number, 
    pool: Omit<ExamQuestion, 'id'>[], 
    sectionKey: 'moji-goi' | 'bunpou' | 'dokkai' | 'choukai'
  ): ExamQuestion[] => {
    const result = [...currentList];
    let poolIdx = 0;
    while (result.length < Math.min(targetCount, pool.length)) {
      const template = pool[poolIdx % pool.length];
      const qNum = result.length + 1;
      const newQ: ExamQuestion = {
        ...template,
        id: `${exam.id}_${sectionKey}_${qNum}`,
        section: sectionKey,
        question: template.question
      };
      result.push(newQ);
      poolIdx++;
    }
    return result;
  };

  const fullMojiGoi = padSection(mojiGoi, 8, N5_MOJI_GOI, 'moji-goi');
  const fullBunpou = padSection(bunpou, 6, N5_BUNPOU, 'bunpou');
  const fullDokkai = dokkai;
  const fullChoukai = choukai;

  return {
    ...exam,
    questions: [...fullMojiGoi, ...fullBunpou, ...fullDokkai, ...fullChoukai],
    durationMinutes: targets.duration,
  };
}
