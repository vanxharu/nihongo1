/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Grammar Content Generation Prompts and Schemas
 * Used by AI Service to dynamically redesign Grammar Lessons, Examples, Mnemonics, and Exercises
 */

export const GRAMMAR_SYSTEM_PROMPT = `Bạn là một chuyên gia sư phạm tiếng Nhật hàng đầu và tác giả giáo trình JLPT uy tín.
Nhiệm vụ của bạn là: PHÂN TÍCH sâu sắc một mẫu ngữ pháp tiếng Nhật và THIẾT KẾ TOÀN BỘ BÀI HỌC CHUẨN MỰC gồm:

1. TỔNG QUAN & BẢN CHẤT CỐT LÕI (overview)
2. CÔNG THỨC & QUY TẮC KẾT HỢP CHI TIẾT (formationRules):
   - Động từ (thể ます, thể て, thể từ điển...), Danh từ, Tính từ đuôi い, Tính từ đuôi な.
   - Kèm ví dụ biến đổi cụ thể (từ gốc -> dạng sau khi ghép).
3. HƯỚNG DẪN SỬ DỤNG (usageGuide):
   - whenToUse: Dùng trong các trường hợp nào.
   - whenNotToUse: Những tình huống tuyệt đối không dùng hoặc nghe kỳ cục.
   - subjectConstraint: Quy tắc về chủ ngữ (cùng chủ ngữ hay khác chủ ngữ, hành động chính là vế nào).
   - nuance: Sắc thái cảm xúc hoặc bối cảnh phù hợp (thân mật, trang trọng, văn viết, văn nói...).
4. LƯU Ý & CÁC LỖI NGƯỜI VIỆT THƯỜNG MẮC (notes):
   - Phân tích những thói quen dịch nghĩa tiếng Việt dẫn đến dùng sai mẫu này.
5. MẸO GHI NHỚ THÔNG MINH (memoryTip):
   - Mẹo liên tưởng vui, trực quan, dễ nhớ dựa trên hình thức, ý nghĩa hoặc ngữ cảnh thực tế. Tuyệt đối không bịa đặt nguồn gốc lịch sử của ngữ pháp.
6. SO SÁNH NGỮ PHÁP DỄ NHẦM LẪN (similarGrammars):
   - Chỉ ra 1-2 mẫu ngữ pháp gần nghĩa hoặc dễ gây bối rối (Ví dụ: 〜ながら vs 〜つつ; 〜てから vs 〜たあとで).
   - Giải thích ngắn gọn điểm khác biệt cốt lõi.
7. VÍ DỤ MẪU NGỮ CẢNH THỰC TẾ (examples):
   - 3 đến 5 câu ví dụ chuẩn ngữ pháp, tự nhiên như người bản xứ.
   - Đa dạng bối cảnh: Giao tiếp hàng ngày, Công sở/Công việc, Trường học, Mua sắm/Nhà hàng, Gia đình/Thời gian rảnh.
   - Mỗi ví dụ gồm: japanese, hiragana, vietnamese, explanation, context.
8. BÀI TẬP KIỂM TRA ĐA DẠNG, SỐ LƯỢNG NHIỀU (exercises):
   - Soạn từ 10 đến 15 bài tập kiểm tra trắc nghiệm và vận dụng sâu sắc:
     * multiple_choice (Trắc nghiệm chọn đáp án đúng trong 4 phương án)
     * fill_in_blank (Điền dạng chia thích hợp của từ)
     * choose_correct_sentence (Chọn câu viết ngữ pháp chính xác nhất)
     * error_correction (Phát hiện và sửa lỗi dùng sai cấu trúc)
     * situational (Xử lý tình huống giao tiếp phù hợp)
   - Mỗi bài tập có đầy đủ: id, type, question, choices (4 phương án rõ ràng), correct_answer, explanation (giải thích chi tiết vì sao đúng và phân tích bẫy sai), sentence_full, sentence_hiragana, translation.

Bắt buộc trả về đúng 1 đối tượng JSON duy nhất (không bọc trong markdown, không có lời dẫn ngoài JSON).`;

export function buildGrammarContentUserPrompt(params: {
  grammar: string;
  meaning: string;
  level: string;
  explanation?: string;
  mode?: 'all' | 'examples' | 'exercises';
  existing_examples?: any[];
  existing_exercises?: any[];
}): string {
  const { grammar, meaning, level, explanation, mode = 'all', existing_examples = [], existing_exercises = [] } = params;

  return `Hãy phân tích và thiết kế bài học hoàn chỉnh cho mẫu ngữ pháp sau:

【MẪU NGỮ PHÁP】: ${grammar}
【Ý NGHĨA】: ${meaning}
【CẤP ĐỘ JLPT】: ${level || 'N4'}
【GIẢI THÍCH HIỆN TẠI】: ${explanation || 'Chưa có giải thích cụ thể.'}

${existing_examples && existing_examples.length > 0 ? `【VÍ DỤ HIỆN CÓ】:\n${JSON.stringify(existing_examples, null, 2)}` : ''}
${existing_exercises && existing_exercises.length > 0 ? `【BÀI TẬP HIỆN CÓ】:\n${JSON.stringify(existing_exercises, null, 2)}` : ''}

${
  mode === 'examples'
    ? 'YÊU CẦU: Tập trung làm mới 3-5 VÍ DỤ MẪU (examples) phong phú và các ghi chú thực tế.'
    : mode === 'exercises'
    ? 'YÊU CẦU: Soạn 10 đến 15 BÀI TẬP KIỂM TRA (exercises) trắc nghiệm đa dạng câu hỏi từ cơ bản đến nâng cao.'
    : 'YÊU CẦU: Thiết kế TOÀN BỘ bài học đầy đủ (Cấu trúc, Mẹo nhớ, Lưu ý, Dễ nhầm, 3-5 Ví dụ và từ 10 đến 15 Bài tập kiểm tra trắc nghiệm đa dạng).'
}

Hãy trả về JSON đúng chuẩn theo cấu trúc:
{
  "grammar": "${grammar}",
  "level": "${level || 'N4'}",
  "meaning": "${meaning}",
  "overview": "Bản chất cốt lõi 1-2 câu của mẫu ngữ pháp.",
  "formationRules": [
    {
      "partOfSpeech": "V(bỏ ます)",
      "rule": "V(bỏ ます) + ながら",
      "example": "飲みます → 飲みながら",
      "meaning": "Vừa uống vừa..."
    }
  ],
  "usageGuide": {
    "whenToUse": ["Dùng khi 2 hành động cùng xảy ra đồng thời do 1 người thực hiện"],
    "whenNotToUse": ["Không dùng khi 2 hành động do 2 người khác nhau thực hiện"],
    "subjectConstraint": "Hành động chính nằm ở vế sau, vế trước là hành động phụ đi kèm.",
    "nuance": "Tự nhiên trong cả văn nói hàng ngày lẫn văn phong công sở."
  },
  "notes": [
    "Người Việt thường nhầm lẫn giữa hành động chính và phụ, nhớ rằng vế sau mới là trọng tâm."
  ],
  "memoryTip": "Mẹo liên tưởng: Nhớ từ 'Nagara' như chiếc 'Cầu Nối' giữa 2 việc cùng làm một lúc!",
  "similarGrammars": [
    {
      "similarStructure": "〜つつ",
      "meaning": "Vừa... vừa...",
      "difference": "つつ mang tính văn viết trang trọng hơn, còn ながら phổ biến trong đời sống hàng ngày.",
      "comparisonExample": "働きつつ、勉強する (Văn phong trang trọng / bài viết)"
    }
  ],
  "examples": [
    {
      "japanese": "音楽を聴きながら、宿題をしています。",
      "hiragana": "おんがくをききながら、しゅくだいをしています。",
      "vietnamese": "Tôi vừa nghe nhạc vừa làm bài tập về nhà.",
      "explanation": "Kết hợp V(bỏ ます) + ながら. Hành động chính là làm bài tập.",
      "context": "Học tập"
    }
  ],
  "exercises": [
    {
      "id": "ex_1",
      "type": "multiple_choice",
      "question": "母は台所で料理を_____、歌を歌っています。",
      "choices": ["しますながら", "してながら", "しながら", "するながら"],
      "correct_answer": "しながら",
      "explanation": "Với động từ 'します' (thể ます là し), bỏ ます + ながら tạo thành しながら.",
      "sentence_full": "母は台所で料理をしながら、歌を歌っています。",
      "sentence_hiragana": "はははだいどころでりょうりをしながら、うたをうたっています。",
      "translation": "Mẹ tôi vừa nấu ăn trong bếp vừa hát."
    }
  ]
}`;
}
