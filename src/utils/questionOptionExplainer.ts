import { ExamQuestion, StudyBookQuestion } from '../types';
import { getBunpouDetail } from '../data/bunpouExplanations';
import { getChoukaiDetail } from '../data/choukaiExplanations';
import { JLPT_VOCAB_DB } from './japaneseSentenceAnnotator';

export interface OptionAnalysisItem {
  index: number;
  optionText: string;
  isCorrect: boolean;
  statusTag: '⭕ ĐÚNG' | '❌ SAI';
  reason: string;
  trapType?: string;
}

export interface DetailedQuestionCorrection {
  questionId: string;
  vietnameseTranslation: string;
  optionsAnalysis: OptionAnalysisItem[];
  coreRule: string;
  memoryTip: string;
  hanVietBreakdown?: string;
  grammarFocus?: string;
}

/**
 * Intelligent analyzer that inspects Japanese JLPT questions and generates
 * comprehensive reasons for why the correct option is right AND why each
 * of the other 3 options is wrong (traps, phonetic confusion, particle mismatch, nuance).
 */
export function getDetailedQuestionCorrection(q: ExamQuestion): DetailedQuestionCorrection {
  const options = q.options || [];
  const correctIdx = q.correctIndex;
  const correctOpt = options[correctIdx] || '';
  const explanation = q.explanation || '';
  const hint = q.hint || '';
  const questionText = q.question || '';
  const section = q.section || 'moji-goi';

  // Check dedicated Bunpou Database first
  const bunpouDetail = getBunpouDetail(q.id);
  if (bunpouDetail) {
    return {
      questionId: q.id,
      vietnameseTranslation: bunpouDetail.fullSentenceTranslation,
      optionsAnalysis: bunpouDetail.options.map(opt => ({
        index: opt.index,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
        statusTag: opt.statusTag,
        reason: opt.reason,
        trapType: opt.trapNote || (opt.isCorrect ? 'Điểm ngữ pháp chuẩn' : 'Bẫy ngữ pháp')
      })),
      coreRule: bunpouDetail.correctReason,
      memoryTip: `Trọng tâm ngữ pháp: ${bunpouDetail.grammarPoint}`,
      grammarFocus: bunpouDetail.grammarPoint
    };
  }

  // Check dedicated Choukai Database
  const choukaiDetail = getChoukaiDetail(q.id);
  if (choukaiDetail) {
    return {
      questionId: q.id,
      vietnameseTranslation: choukaiDetail.questionVi,
      optionsAnalysis: choukaiDetail.optionsAnalysis.map(opt => ({
        index: opt.index,
        optionText: opt.textJa,
        isCorrect: opt.isCorrect,
        statusTag: opt.isCorrect ? '⭕ ĐÚNG' : '❌ SAI',
        reason: `${opt.textVi}: ${opt.reason}`,
        trapType: opt.isCorrect ? 'Thông tin chuẩn xác' : 'Bẫy thông tin nghe'
      })),
      coreRule: choukaiDetail.keyPoint,
      memoryTip: 'Mẹo Choukai: Chú ý nghe kỹ câu chốt ở cuối đoạn đối thoại và xác định ai là người thực hiện hành động.'
    };
  }

  // 1. Vietnamese translation of sentence
  let vietnameseTranslation = '';
  if (explanation.includes('Cả câu:') || explanation.includes('cả câu:')) {
    const parts = explanation.split(/(?:Cả câu:|cả câu:)/i);
    if (parts[1]) {
      vietnameseTranslation = parts[1].split('.')[0].trim();
    }
  }
  if (!vietnameseTranslation && hint && !hint.startsWith('Chọn')) {
    vietnameseTranslation = hint;
  }
  if (!vietnameseTranslation) {
    // Generate context translation or meaningful breakdown
    if (questionText.includes('発音')) {
      vietnameseTranslation = 'Phát âm tiếng Nhật dễ hơn tiếng Anh.';
    } else if (questionText.includes('災害')) {
      vietnameseTranslation = 'Khu vực này hầu như năm nào cũng phải gánh chịu thiên tai.';
    } else if (questionText.includes('署名')) {
      vietnameseTranslation = 'Sau khi xác nhận nội dung hợp đồng, xin vui lòng ký tên vào đây.';
    } else if (questionText.includes('募る')) {
      vietnameseTranslation = 'Chúng tôi đã quyết định trưng cầu rộng rãi ý kiến của người dân thị trấn.';
    } else if (questionText.includes('冷静')) {
      vietnameseTranslation = 'Anh ấy lúc nào cũng phán đoán tình hình một cách bình tĩnh.';
    } else if (questionText.includes('需要')) {
      vietnameseTranslation = 'Nhu cầu đối với sản phẩm mới đang tăng lên nhanh chóng.';
    } else {
      vietnameseTranslation = hint || 'Dịch nghĩa và ngữ cảnh câu hỏi trong đề thi.';
    }
  }

  // 2. Generate Option-by-Option Analysis (Why correct, Why wrong)
  const optionsAnalysis: OptionAnalysisItem[] = options.map((opt, idx) => {
    const isCorrect = idx === correctIdx;

    if (isCorrect) {
      let rightReason = '';
      if (q.optionExplanations && q.optionExplanations[idx]) {
        rightReason = q.optionExplanations[idx];
      } else if (section === 'moji-goi') {
        rightReason = `ĐÁP ÁN CHÍNH XÁC: Đúng cách đọc/chữ Hán chuẩn「${opt}」, phù hợp hoàn hảo với nghĩa của câu.`;
        if (explanation) {
          rightReason = `ĐÁP ÁN CHÍNH XÁC: ${explanation}`;
        }
      } else if (section === 'bunpou') {
        rightReason = `ĐÁP ÁN CHÍNH XÁC: Phù hợp cấu trúc ngữ pháp và sự kết hợp từ (kết nối trước/sau, sắc thái tự nhiên).`;
        if (explanation) {
          rightReason = `ĐÁP ÁN CHÍNH XÁC: ${explanation}`;
        }
      } else {
        rightReason = explanation || `ĐÁP ÁN CHÍNH XÁC: Phù hợp với nội dung và lập luận trong bài đọc/nghe.`;
      }

      return {
        index: idx,
        optionText: opt,
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: rightReason,
      };
    }

    // Explaining why this incorrect option is WRONG
    let wrongReason = '';
    let trapType = 'Bẫy thường gặp';

    if (q.optionExplanations && q.optionExplanations[idx]) {
      wrongReason = q.optionExplanations[idx];
    } else if (section === 'moji-goi') {
      // Analyze phonetic or kanji traps
      if (opt.length === correctOpt.length) {
        if (opt.includes('っ') && !correctOpt.includes('っ')) {
          wrongReason = `Sai vì có âm ngắt「っ」(đây là bẫy thêm âm ngắt không đúng của đề thi).`;
          trapType = 'Bẫy âm ngắt';
        } else if (!opt.includes('っ') && correctOpt.includes('っ')) {
          wrongReason = `Sai vì thiếu âm ngắt「っ」(chữ này bắt buộc phải đọc có âm ngắt).`;
          trapType = 'Bẫy thiếu âm ngắt';
        } else if (opt.includes('う') && !correctOpt.includes('う')) {
          wrongReason = `Sai vì thừa trường âm「う」(từ này không có trường âm).`;
          trapType = 'Bẫy trường âm thừa';
        } else if (!opt.includes('う') && correctOpt.includes('う')) {
          wrongReason = `Sai vì thiếu trường âm「う」(chữ Hán này có trường âm).`;
          trapType = 'Bẫy thiếu trường âm';
        } else if (hasVoicingDiff(opt, correctOpt)) {
          wrongReason = `Sai vì nhầm âm đục/âm trong (dấu Tenten「゛」hoặc Maru「゜」).`;
          trapType = 'Bẫy biến âm (Tenten)';
        } else {
          wrongReason = `Sai cách đọc: Từ「${opt}」không phải là cách phát âm của chữ Hán trong câu này.`;
          trapType = 'Sai âm On/Kun';
        }
      } else {
        wrongReason = `Sai từ vựng:「${opt}」mang ý nghĩa khác hoặc không ghép đúng với ngữ cảnh câu.`;
        trapType = 'Sai nghĩa từ vựng';
      }
    } else if (section === 'bunpou') {
      if (['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'より', 'から'].includes(opt)) {
        wrongReason = `Sai trợ từ: Trợ từ「${opt}」không kết hợp đúng với động từ/tính từ hoặc không đúng chức năng ngữ pháp trong câu.`;
        trapType = 'Sai trợ từ';
      } else {
        wrongReason = `Sai cấu trúc:「${opt}」không đi với thể tiếp nối của động từ đứng trước hoặc mang sắc thái nghĩa không tương thích.`;
        trapType = 'Sai cấu trúc ngữ pháp';
      }
    } else {
      wrongReason = `Sai nội dung: Thông tin「${opt}」trái ngược hoặc không được đề cập trong bài đọc/nghe.`;
      trapType = 'Sai lập luận văn bản';
    }

    return {
      index: idx,
      optionText: opt,
      isCorrect: false,
      statusTag: '❌ SAI',
      reason: wrongReason,
      trapType
    };
  });

  // 3. Core Rule & Memory Tip
  let coreRule = explanation || 'Nắm vững cách đọc âm On/Kun và quy tắc biến âm.';
  let memoryTip = 'Đọc to từ vựng và ghi nhớ mặt chữ Kanji cùng ví dụ câu thực tế để phản xạ tức thì.';

  if (section === 'moji-goi') {
    memoryTip = 'Mẹo JLPT: Đề thi thường gài bẫy bằng cách thêm/bớt âm ngắt (っ), trường âm (う/い) hoặc đổi âm đục. Hãy kiểm tra kỹ từng kana!';
  } else if (section === 'bunpou') {
    memoryTip = 'Mẹo JLPT: Chú ý dạng chia của từ đứng liền trước chỗ trống (thể từ điển, thể て, thể ない, thể Ta hay Danh từ + の) để loại trừ ngay đáp án sai.';
  } else if (section === 'dokkai') {
    memoryTip = 'Mẹo JLPT: Đọc câu hỏi trước, xác định từ khóa, tìm đúng đoạn chứa từ khóa trong bài và chú ý các liên từ chỉ sự tương phản (しかし, だが, ところが).';
  } else if (section === 'choukai') {
    memoryTip = 'Mẹo JLPT: Ghi chú lại thời gian, địa điểm, chủ thể hành động và quyết định cuối cùng (ở cuối bài nghe).';
  }

  return {
    questionId: q.id,
    vietnameseTranslation,
    optionsAnalysis,
    coreRule,
    memoryTip
  };
}

function hasVoicingDiff(a: string, b: string): boolean {
  const pairs: Record<string, string> = {
    'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご',
    'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ', 'そ': 'ぞ',
    'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど',
    'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ', 'へ': 'べ', 'ほ': 'ぼ'
  };
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const ca = a[i];
    const cb = b[i];
    if (pairs[ca] === cb || pairs[cb] === ca) return true;
  }
  return false;
}

export interface StudyDistractorItem {
  index: number;
  optionNumber: number;
  text: string;
  reason: string;
  trapType?: string;
}

export interface StudyQuestionHintAnalysis {
  sentenceTranslation: string;
  completedJapaneseSentence: string;
  distractors: StudyDistractorItem[];
  correctOptionNumber: number;
  correctAnswerText: string;
}

/**
 * Returns the full Japanese sentence with the correct answer inserted into the blank
 */
export function getCompletedJapaneseSentence(question: StudyBookQuestion): string {
  const qText = question.question || '';
  const correctOpt = (question.options || [])[question.correctIndex ?? 0] || '';
  if (!correctOpt) return qText;

  if (/[＿_]{2,}|[（(]\s*[）)]|（\s*）/.test(qText)) {
    return qText.replace(/[＿_]{2,}|[（(]\s*[）)]|（\s*）/g, `【${correctOpt}】`);
  }
  return qText;
}

/**
 * Generates an instant, clear sentence translation and detailed explanation
 * of why each wrong distractor option is incorrect.
 */
export function getStudyQuestionHintAndDistractors(question: StudyBookQuestion): StudyQuestionHintAnalysis {
  const options = question.options || [];
  const correctIdx = question.correctIndex ?? 0;
  const correctOpt = options[correctIdx] || '';
  const explanation = question.explanation || '';
  const rawHint = question.hint?.trim() || '';

  // 1. Sentence Translation Extraction
  let sentenceTranslation = '';
  if (rawHint && !rawHint.toLowerCase().startsWith('chọn') && !rawHint.toLowerCase().startsWith('lưu ý')) {
    sentenceTranslation = rawHint.replace(/^(?:Gợi ý|Dịch câu|Dịch|Dịch nghĩa|Nghĩa câu|Ý nghĩa)\s*[:：]\s*/i, '').trim();
  }

  if (!sentenceTranslation && explanation) {
    // A. Match explicit "Dịch / Nghĩa câu / Cả câu"
    const transMatch = explanation.match(/(?:Dịch(?: nguyên câu| câu)?|Nghĩa câu|Cả câu|Toàn câu|Ý nghĩa)[:：]\s*([^.!\n]+[.!]?)/i);
    if (transMatch && transMatch[1]) {
      sentenceTranslation = transMatch[1].trim();
    }
    
    // B. Match Vietnamese translation inside parentheses, e.g. "明日友だちは行きますが、私は行きません (Ngày mai bạn tôi đi nhưng tôi thì không đi)"
    if (!sentenceTranslation) {
      const parenMatch = explanation.match(/[（\(]([A-ZÀ-Ỵa-zà-ỵ0-9\s,–—\-…'"?]{8,})[）\)]/);
      if (parenMatch && parenMatch[1] && !parenMatch[1].toLowerCase().startsWith('sách trang')) {
        sentenceTranslation = parenMatch[1].trim();
      }
    }

    // C. Match "Viết bằng bút đen: 黒いペンで書いてください"
    if (!sentenceTranslation) {
      const colonMatch = explanation.match(/(?:^|[\n.])([A-ZÀ-Ỵa-zà-ỵ0-9\s,–—\-…'"?]{6,})[:：]\s*[一-龯ぁ-んァ-ヶ]/);
      if (colonMatch && colonMatch[1]) {
        sentenceTranslation = colonMatch[1].trim();
      }
    }
  }

  if (!sentenceTranslation && rawHint) {
    sentenceTranslation = rawHint;
  }

  const completedJapaneseSentence = getCompletedJapaneseSentence(question);

  // 2. Distractor (Wrong Answers) Analysis
  const distractors: StudyDistractorItem[] = [];

  options.forEach((opt, idx) => {
    if (idx === correctIdx) return; // Only process wrong answers

    let reason = '';
    let trapType = 'Đáp án sai';

    // A. Check if option is specifically mentioned in the explanation text
    if (explanation) {
      const escapedOpt = opt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const directMatch = explanation.match(new RegExp(`(?:^|[\\s,.;/])(${escapedOpt}[^()（）]*[（(][^()（）]+[)）])`, 'i'));
      if (directMatch && directMatch[1]) {
        let content = directMatch[1].trim();
        // Remove leading option name if present so it doesn't duplicate "✕ (1) 来年: 来年 (らいねん...)"
        if (content.startsWith(opt)) {
          content = content.substring(opt.length).trim();
        }
        reason = content;
        trapType = 'Đã giải nghĩa trong sách';
      } else {
        const stem = opt.replace(/(ましょう|ました|ません|ない|たい|て|た|ます)$/, '');
        if (stem && stem.length >= 2) {
          const stemMatch = explanation.match(new RegExp(`(${stem}[^()（）]*[（(][^()（）]+[)）])`, 'i'));
          if (stemMatch && stemMatch[1]) {
            let content = stemMatch[1].trim();
            if (content.startsWith(opt)) {
              content = content.substring(opt.length).trim();
            }
            reason = content;
            trapType = 'Từ đồng âm/khác nghĩa';
          }
        }
      }
    }

    // B. Check dictionary JLPT_VOCAB_DB
    if (!reason && JLPT_VOCAB_DB[opt]) {
      const entry = JLPT_VOCAB_DB[opt];
      reason = `Nghĩa là: "${entry.meaning}"${entry.reading ? ` (${entry.reading})` : ''} - không hợp ngữ cảnh câu.`;
      trapType = 'Sai nghĩa từ vựng';
    }

    // C. Check particle rules
    if (!reason && ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'より', 'から', 'まで', 'も', 'か'].includes(opt)) {
      if (opt === 'を') {
        reason = `「を」dùng cho tân ngữ trực tiếp của ngoại động từ, không dùng ở đây.`;
      } else if (opt === 'に') {
        reason = `「に」chỉ mốc thời gian, đích đến hoặc đối tượng gián tiếp.`;
      } else if (opt === 'が') {
        reason = `「が」nhấn mạnh chủ ngữ hoặc tân ngữ tính từ/thể khả năng.`;
      } else if (opt === 'で') {
        reason = `「で」chỉ phương tiện, cách thức hoặc địa điểm diễn ra hành động.`;
      } else if (opt === 'と') {
        reason = `「と」chỉ đối tác cùng làm hành động hoặc liệt kê danh từ.`;
      } else if (opt === 'へ') {
        reason = `「へ」chỉ phương hướng di chuyển.`;
      } else if (opt === 'から') {
        reason = `「から」chỉ điểm xuất phát, nguồn gốc ("từ...").`;
      } else if (opt === 'まで') {
        reason = `「まで」chỉ mốc giới hạn, kết thúc ("cho đến...").`;
      } else {
        reason = `Trợ từ「${opt}」không đúng chức năng ngữ pháp câu này.`;
      }
      trapType = 'Sai trợ từ';
    }

    // D. Check common phonetic traps
    if (!reason && correctOpt) {
      if (opt.includes('っ') && !correctOpt.includes('っ')) {
        reason = `Thừa âm ngắt「っ」(từ gốc không có âm ngắt).`;
        trapType = 'Bẫy thừa âm ngắt';
      } else if (!opt.includes('っ') && correctOpt.includes('っ')) {
        reason = `Thiếu âm ngắt「っ」(từ này bắt buộc phải có âm ngắt).`;
        trapType = 'Bẫy thiếu âm ngắt';
      } else if (opt.includes('う') && !correctOpt.includes('う')) {
        reason = `Thừa trường âm「う」(phát âm ngắn, không kéo dài).`;
        trapType = 'Bẫy thừa trường âm';
      } else if (!opt.includes('う') && correctOpt.includes('う')) {
        reason = `Thiếu trường âm「う」(chữ này có trường âm kéo dài).`;
        trapType = 'Bẫy thiếu trường âm';
      } else if (hasVoicingDiff(opt, correctOpt)) {
        reason = `Nhầm lẫn giữa âm đục (Tenten「゛」/ Maru「゜」) và âm trong.`;
        trapType = 'Bẫy âm đục/trong';
      }
    }

    // E. Kanji difference checks
    if (!reason && /[\u4e00-\u9faf]/.test(opt)) {
      if (/[\u4e00-\u9faf]/.test(correctOpt)) {
        reason = `Mặt chữ「${opt}」không đúng chữ Hán chuẩn của từ này.`;
      } else {
        reason = `Nhầm cách viết chữ Hán của từ.`;
      }
      trapType = 'Sai chữ Kanji';
    }

    // F. Fallback general reason
    if (!reason) {
      reason = `Sai cách đọc hoặc không phù hợp với ngữ cảnh / ngữ pháp câu hỏi.`;
      trapType = 'Đáp án sai';
    }

    distractors.push({
      index: idx,
      optionNumber: idx + 1,
      text: opt,
      reason,
      trapType
    });
  });

  return {
    sentenceTranslation,
    completedJapaneseSentence,
    distractors,
    correctOptionNumber: correctIdx + 1,
    correctAnswerText: correctOpt
  };
}
