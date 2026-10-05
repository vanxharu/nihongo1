import type { JLPTLevel, ExamQuestion } from '../types';
import { REAL_EXAMS_N5 } from './realExamsN5';
import { REAL_EXAMS_N4 } from './realExamsN4';
import { REAL_EXAMS_N3 } from './realExamsN3';
import { REAL_EXAMS_N2 } from './realExamsN2';
import { REAL_EXAMS_N1 } from './realExamsN1';
import { patternPractice } from './roadmapPatternPractice';
export const EXERCISE_TYPES: Record<string, {
    name: string;
    instruction: string;
}> = {
    kanji: { name: 'Cách đọc kanji', instruction: 'Chọn cách đọc đúng của từ được đánh dấu.' },
    spelling: { name: 'Cách viết từ', instruction: 'Chọn cách viết đúng của từ được đánh dấu.' },
    context: { name: 'Từ vựng trong ngữ cảnh', instruction: 'Chọn từ phù hợp nhất với câu.' },
    paraphrase: { name: 'Diễn đạt tương đương', instruction: 'Chọn câu hoặc từ có nghĩa gần nhất.' },
    usage: { name: 'Cách dùng từ', instruction: 'Chọn câu sử dụng từ đúng nhất.' },
    grammar: { name: 'Chọn mẫu ngữ pháp', instruction: 'Chọn mẫu ngữ pháp phù hợp để hoàn thành câu.' },
    order: { name: 'Sắp xếp câu ★', instruction: 'Sắp xếp bốn phần thành câu đúng, rồi chọn phần nằm ở vị trí ★.' },
    textGrammar: { name: 'Ngữ pháp trong đoạn văn', instruction: 'Đọc ngữ cảnh và chọn cách nối câu hoặc mẫu ngữ pháp phù hợp.' },
    shortReading: { name: 'Đọc hiểu nội dung', instruction: 'Đọc đoạn văn và chọn đáp án dựa trên thông tin trong bài.' },
    information: { name: 'Tìm kiếm thông tin', instruction: 'Tìm thông tin phù hợp trong thông báo, bảng hoặc đoạn văn.' },
    listeningTask: { name: 'Nghe: hiểu nhiệm vụ', instruction: 'Nghe hội thoại và chọn việc hoặc phương án cần thực hiện.' },
    listeningKey: { name: 'Nghe: thông tin chính', instruction: 'Nghe và chọn thông tin quan trọng để trả lời câu hỏi.' },
    listeningOutline: { name: 'Nghe: ý chính', instruction: 'Nghe và chọn nội dung chính của đoạn nói.' },
    listeningExpression: { name: 'Nghe: diễn đạt', instruction: 'Chọn lời nói phù hợp với tình huống.' },
    listeningResponse: { name: 'Nghe: phản hồi nhanh', instruction: 'Nghe lời nói và chọn phản hồi phù hợp nhất.' },
    listeningIntegrated: { name: 'Nghe: tổng hợp', instruction: 'Kết hợp thông tin trong đoạn nghe để chọn đáp án.' },
};
export interface RoadmapExercise extends ExamQuestion {
    type: string;
}
const banks = { N5: REAL_EXAMS_N5, N4: REAL_EXAMS_N4, N3: REAL_EXAMS_N3, N2: REAL_EXAMS_N2, N1: REAL_EXAMS_N1 };
// These 50 files are shipped in public/audio; later source tracks have transcripts only.
const localAudio = new Set(Array.from({ length: 50 }, (_, i) => `/audio/track${String(i + 1).padStart(2, '0')}.mp3`));
export const exerciseText = (text = '') => text.replace(/\\+n/g, '\n');
export function exerciseType(q: ExamQuestion, level: JLPTLevel): string {
    const text = `${q.hint} ${q.question}`;
    if (q.section === 'bunpou')
        return /★/.test(q.question) ? 'order' : /【文章】|\[\s*\d+\s*\]/.test(q.question) ? 'textGrammar' : 'grammar';
    if (q.section === 'dokkai')
        return /bảng|lịch|thông báo|tìm kiếm|メール|お知らせ|案内/.test(text) ? 'information' : 'shortReading';
    if (q.section === 'choukai') {
        const problem = Number(q.question.match(/問題\s*([1-6])/)?.[1]);
        if (problem === 1)
            return 'listeningTask';
        if (problem === 2)
            return 'listeningKey';
        if (level === 'N4' || level === 'N5')
            return problem === 3 ? 'listeningExpression' : problem === 4 ? 'listeningResponse' : 'listeningTask';
        if (level === 'N3')
            return problem === 3 ? 'listeningOutline' : problem === 4 ? 'listeningExpression' : problem === 5 ? 'listeningResponse' : 'listeningTask';
        return problem === 3 ? 'listeningOutline' : problem === 4 ? 'listeningResponse' : problem >= 5 ? 'listeningIntegrated' : 'listeningTask';
    }
    if (/cách đọc|đọc.*kanji|kanji.*đọc|読み方/i.test(text))
        return 'kanji';
    if (/cách viết|viết.*kanji|chữ kanji|漢字で|表記/i.test(text))
        return 'spelling';
    if (/tương đương|đồng nghĩa|gần nghĩa|同じ意味|言い換え/i.test(text))
        return 'paraphrase';
    if (/cách dùng|使い方|用法/i.test(text))
        return 'usage';
    return 'context';
}
export function dailyExercises(level: JLPTLevel, day: number): RoadmapExercise[] {
    const pool: RoadmapExercise[] = patternPractice(level);
    const seen = new Set<string>();
    for (const exam of banks[level]) {
        let context: Partial<Record<ExamQuestion['section'], string>> = {};
        for (const q of exam.questions) {
            const text = exerciseText(q.question);
            if (text.includes('【文章】') && !text.includes('...'))
                context[q.section] = text;
            const passage = q.readingPassage || q.contextPassage || (text.includes('...') ? context[q.section] : undefined);
            if (text.includes('...') && !passage)
                continue;
            if (q.options.length < 3 || new Set(q.options).size !== q.options.length || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length)
                continue;
            if (q.section === 'choukai' && !q.audioUrl && !q.audioTrack && !q.audioScript)
                continue;
            const fingerprint = JSON.stringify([text, q.options, passage]);
            if (seen.has(fingerprint))
                continue;
            seen.add(fingerprint);
            const audioUrl = q.audioUrl?.startsWith('/audio/') && !localAudio.has(q.audioUrl) ? undefined : q.audioUrl;
            if (q.section === 'choukai' && !audioUrl && !q.audioTrack && !q.audioScript)
                continue;
            pool.push({ ...q, audioUrl, id: `${exam.id}:${q.id}`, question: text, contextPassage: passage ? exerciseText(passage) : undefined, type: exerciseType(q, level) });
        }
    }
    const groups = new Map<string, RoadmapExercise[]>();
    for (const q of pool)
        groups.set(q.type, [...(groups.get(q.type) || []), q]);
    const chosen: RoadmapExercise[] = [];
    // Rotate within each real question family; no generated filler or fabricated scores.
    for (const group of groups.values()) {
        const count = group.length > 1 ? 2 : 1;
        for (let i = 0; i < count; i++)
            chosen.push(group[((day - 1) * count + i) % group.length]);
    }
    const order = ['moji-goi', 'bunpou', 'dokkai', 'choukai'];
    const typeOrder = Object.keys(EXERCISE_TYPES);
    return chosen.map(q => {
        if (!q.id.startsWith('practice-'))
            return q;
        const shift = (day + q.id.length) % q.options.length;
        const options = [...q.options.slice(shift), ...q.options.slice(0, shift)];
        return { ...q, options, correctIndex: options.indexOf(q.options[q.correctIndex]) };
    }).sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section) || typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));
}
