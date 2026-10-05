import type { VocabularyItem, JLPTLevel } from '../types';
// A small offline practice pack; later days review these words when the pack ends.
const packs: Partial<Record<JLPTLevel, string[][]>> = {
    N2: [
        ['影響', 'えいきょう', 'ảnh hưởng', '天気は売り上げに影響する。', 'Thời tiết ảnh hưởng đến doanh số.'],
        ['状況', 'じょうきょう', 'tình hình', '今の状況を説明してください。', 'Hãy giải thích tình hình hiện tại.'],
        ['責任', 'せきにん', 'trách nhiệm', 'この仕事には責任がある。', 'Công việc này đi kèm trách nhiệm.'],
        ['判断', 'はんだん', 'phán đoán, quyết định', '情報を集めてから判断する。', 'Tôi thu thập thông tin rồi mới quyết định.'],
        ['提案', 'ていあん', 'đề xuất', '会議で新しい方法を提案した。', 'Tôi đã đề xuất phương pháp mới tại cuộc họp.'],
        ['条件', 'じょうけん', 'điều kiện', '応募の条件を確認する。', 'Tôi kiểm tra điều kiện ứng tuyển.'],
        ['効果', 'こうか', 'hiệu quả', 'この方法は効果がある。', 'Phương pháp này có hiệu quả.'],
        ['改善', 'かいぜん', 'cải thiện', '生活習慣を改善したい。', 'Tôi muốn cải thiện thói quen sinh hoạt.'],
        ['評価', 'ひょうか', 'đánh giá', '努力が高く評価された。', 'Nỗ lực đã được đánh giá cao.'],
        ['傾向', 'けいこう', 'xu hướng', '価格は上がる傾向にある。', 'Giá cả đang có xu hướng tăng.'],
    ],
    N1: [
        ['概念', 'がいねん', 'khái niệm', 'この概念を具体例で説明する。', 'Tôi giải thích khái niệm này bằng ví dụ cụ thể.'],
        ['根拠', 'こんきょ', 'căn cứ', '判断の根拠を示してください。', 'Hãy nêu căn cứ của quyết định.'],
        ['妥協', 'だきょう', 'thỏa hiệp', '双方が妥協して合意に達した。', 'Hai bên thỏa hiệp và đạt được đồng thuận.'],
        ['矛盾', 'むじゅん', 'mâu thuẫn', 'その説明には矛盾がある。', 'Lời giải thích đó có mâu thuẫn.'],
        ['把握', 'はあく', 'nắm bắt', '現状を正確に把握する必要がある。', 'Cần nắm bắt chính xác hiện trạng.'],
        ['措置', 'そち', 'biện pháp xử lý', '安全のために措置を講じた。', 'Đã áp dụng biện pháp để bảo đảm an toàn.'],
        ['兆候', 'ちょうこう', 'dấu hiệu, triệu chứng', '回復の兆候が見られる。', 'Có thể thấy dấu hiệu hồi phục.'],
        ['見解', 'けんかい', 'quan điểm', '専門家の見解を聞いた。', 'Tôi đã nghe quan điểm của chuyên gia.'],
        ['配慮', 'はいりょ', 'sự quan tâm, cân nhắc', '周囲への配慮を忘れない。', 'Không quên quan tâm đến những người xung quanh.'],
        ['是正', 'ぜせい', 'chấn chỉnh, sửa sai', '不公平な制度を是正する。', 'Chấn chỉnh chế độ bất công.'],
    ],
};
export const ROADMAP_ADVANCED_WORDS: VocabularyItem[] = Object.entries(packs).flatMap(([level, words]) => words.map(([kanji, hiragana, meaning, exampleSentence, exampleTranslation], i) => ({
    id: `roadmap-${level}-${i}`, level: level as JLPTLevel, kanji, hiragana, meaning,
    exampleSentence, exampleTranslation, lessonId: `roadmap-${level}`, lessonName: 'Từ vựng luyện tập trong lộ trình',
})));
