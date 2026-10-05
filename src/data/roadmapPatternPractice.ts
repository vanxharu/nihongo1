import type { JLPTLevel } from '../types';
import type { RoadmapExercise } from './roadmapExercises';
// Original practice items in JLPT formats, not claimed to be official past questions.
const entries: Record<JLPTLevel, {
    passage: string;
    options: string[];
    explanation: string;
    phrase: string;
    paraphrases: string[];
    response: string;
    replies: string[];
}> = {
    N5: { passage: 'わたしは毎朝七時に起きます。きのうは日曜日でした。（　　）、学校へ行きませんでした。家で本を読みました。', options: ['それで', 'それから', 'でも', 'そして'], explanation: 'それで nối nguyên nhân với kết quả: vì là chủ nhật nên không đi học.', phrase: 'このへやは広くありません。', paraphrases: ['このへやはあまり広くないです。', 'このへやはとても広いです。', 'このへやは新しいです。', 'このへやは明るいです。'], response: '本を貸してくれて、ありがとうございました。', replies: ['どういたしまして。', 'いただきます。', 'いってきます。'] },
    N4: { passage: '来週、友達と京都へ旅行する予定です。ホテルはもう予約しました。（　　）、電車の切符はまだ買っていません。今日、駅で買うつもりです。', options: ['でも', 'だから', 'それに', '例えば'], explanation: 'でも đối chiếu việc đã đặt khách sạn với việc chưa mua vé tàu.', phrase: 'この道は危ないです。', paraphrases: ['この道は安全ではありません。', 'この道は便利です。', 'この道は短いです。', 'この道は静かです。'], response: 'すみません、明日の約束を午後に変えてもいいですか。', replies: ['はい、午後でも大丈夫です。', 'いいえ、昨日でした。', 'はい、変わりませんでした。'] },
    N3: { passage: '今日は大切な会議がある。朝から雨が強かった。（　　）、私はいつもより早く家を出た。おかげで、会議に間に合った。', options: ['そこで', 'それなのに', '例えば', 'ところが'], explanation: 'そこで cho biết quyết định xuất phát từ tình hình trước đó: mưa lớn nên đi sớm.', phrase: '会議を延期することになりました。', paraphrases: ['会議を予定より後に行います。', '会議を予定より早く行います。', '会議をやめることにしました。', '会議をもう一度行いました。'], response: '電車が遅れてしまって、少し遅れそうです。', replies: ['分かりました。気をつけて来てください。', '昨日は早かったですね。', 'もう帰ったことがあります。'] },
    N2: { passage: '在宅勤務には、通勤時間を節約できるという利点がある。（　　）、仕事と私生活の区別がつきにくいという問題もある。導入する際には、両面を考慮する必要がある。', options: ['その一方で', 'したがって', '具体的には', 'それと同じく'], explanation: 'その一方で đặt ưu điểm và vấn đề của làm việc tại nhà ở hai mặt đối lập.', phrase: 'この仕事は私には荷が重い。', paraphrases: ['私の力ではこの仕事は難しすぎる。', 'この仕事の荷物は軽い。', '私はこの仕事が嫌いだ。', 'この仕事はすぐに終わる。'], response: 'この案については、もう少し検討する時間をいただけませんか。', replies: ['承知しました。来週までにご意見をお願いします。', 'いいえ、昨日検討していません。', 'それでは、ご検討されました。'] },
    N1: { passage: 'この制度の導入によって、手続きに要する時間は大幅に短縮された。（　　）、すべての利用者が恩恵を受けているわけではない。操作に不慣れな人への支援が依然として課題である。', options: ['もっとも', 'ゆえに', 'それどころか', 'つまり'], explanation: 'もっとも bổ sung điều kiện giới hạn cho nhận xét tích cực trước đó: tuy vậy, không phải ai cũng hưởng lợi.', phrase: '彼の説明は要領を得ない。', paraphrases: ['彼の説明では肝心な点がはっきりしない。', '彼の説明は簡潔で分かりやすい。', '彼は説明する機会を得た。', '彼の説明には時間がかからない。'], response: '会議の開始時刻、繰り上げになったそうですよ。', replies: ['では、予定より早めに向かいましょう。', 'では、予定より遅く出発しましょう。', 'そうですか、会議は中止なんですね。'] },
};
export function patternPractice(level: JLPTLevel): RoadmapExercise[] {
    const p = entries[level];
    const question = (id: string, type: string, section: RoadmapExercise['section'], text: string, options: string[], explanation: string, extra: Partial<RoadmapExercise> = {}): RoadmapExercise => ({ id: `practice-${level}-${id}`, type, section, question: text, options, correctIndex: 0, hint: '', explanation, ...extra });
    const result = [
        question('text', 'textGrammar', 'bunpou', p.passage, p.options, p.explanation),
        question('paraphrase', 'paraphrase', 'moji-goi', `【${p.phrase}】とだいたい同じ意味の文を選んでください。`, p.paraphrases, `Diễn đạt tương đương: ${p.paraphrases[0]}`),
        question('response', 'listeningResponse', 'choukai', '話を聞いて、最もよい返事を選んでください。', p.replies, `Phản hồi phù hợp: ${p.replies[0]}`, { audioScript: p.response }),
    ];
    if (level === 'N2')
        result.push(question('order', 'order', 'bunpou', 'この制度は ____ ____ ★ ____ 問題がある。', ['見ると', '利用者の', '多くの', '立場から'], 'この制度は利用者の立場から見ると多くの問題がある。★ là 見ると.'));
    if (level === 'N1')
        result.push(question('order', 'order', 'bunpou', '彼は ____ ____ ★ ____ 続けた。', ['ものともせず', '周囲の', '研究を', '反対を'], '彼は周囲の反対をものともせず研究を続けた。★ là ものともせず.'));
    return result;
}
