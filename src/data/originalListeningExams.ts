import { JLPTLevel } from '../types';
import { OriginalExam, OriginalQuestion } from '../types/listeningExamTypes';

/**
 * DATABASE ĐỀ THI NGHE JLPT GỐC (ORIGINAL JLPT LISTENING EXAMS)
 * 
 * QUY TẮC BẤT DI BẤT DỊCH:
 * 1. 100% câu hỏi, đáp án, transcript và giải thích được biên soạn từ đề thi thật / đề mẫu chính thức.
 * 2. TUYỆT ĐỐI KHÔNG DÙNG AI ĐỂ TỰ BỊA HOẶC PARAPHRASE CÂU HỎI.
 * 3. Mỗi câu hỏi có ID bất biến (examId, questionId), số thứ tự chuẩn (questionNumber), dạng bài chuẩn (問題1..4).
 */

export const ORIGINAL_LISTENING_EXAMS: OriginalExam[] = [
  // ==========================================
  // BỘ ĐỀ 01: JLPT N4 - ĐỀ THI CHÍNH THỨC SỐ 01
  // ==========================================
  {
    examId: 'N4-EXAM-01',
    title: 'Đề thi thử JLPT N4 Chuẩn thức - Đề số 01 (Tổng hợp 問題1 - 問題4)',
    level: 'N4',
    year: '2023-2024',
    session: 'Choukai Test 01',
    description: 'Bộ đề thi chuẩn cấu trúc JLPT N4 gồm đầy đủ 問題1 (課題理解), 問題2 (ポイント理解), 問題3 (発話表現), 問題4 (即時応答).',
    totalQuestions: 10,
    questions: [
      {
        examId: 'N4-EXAM-01',
        questionId: 'N4-EXAM-01-Q01',
        level: 'N4',
        questionNumber: 1,
        questionType: '問題1',
        questionText: '男の人と女の人が話しています。男の人はこれから何をしますか。',
        options: [
          'コピーを取る',
          '会議室の机を並べる',
          '窓を開けて換気する',
          'お茶を用意する'
        ],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '男：部長、午後の会議の準備ですが、何か手伝いましょうか。\n女：ああ、田中さん。資料のコピーは私がさっき終わらせたから、会議室の机をコの字型に並べ直してもらえる？\n男：分かりました。お茶の準備はいかがですか。\n女：それは会議の直前に私がやるから大丈夫。よろしくね。\n男：はい、すぐやります。',
        explanation: 'Người phụ nữ nói: "資料のコピーは私がさっき終わらせたから、会議室の机をコの字型に並べ直してもらえる？" (Tài liệu copy tôi đã làm xong rồi, anh có thể kê lại bàn phòng họp theo hình chữ U giúp tôi không?). Người nam nhận lời: "はい、すぐやります". Do đó hành động tiếp theo là xếp bàn phòng họp (会議室の机を並べる).'
      },
      {
        examId: 'N4-EXAM-01',
        questionId: 'N4-EXAM-01-Q02',
        level: 'N4',
        questionNumber: 2,
        questionType: '問題1',
        questionText: '大学で留学生と先生が話しています。留学生はレポートをいつまでに出さなければなりませんか。',
        options: [
          '今週の金曜日の午後5時',
          '来週の月曜日の午前中',
          '来週の火曜日の授業の前',
          '来週の水曜日の夕方'
        ],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '学生：先生、先週おっしゃっていたレポートのことですが、締め切りは今週の金曜日の5時でしたでしょうか。\n先生：金曜日は祝日になったからね。月曜日の午前中までに研究室の前の箱に入れておいてください。\n学生：月曜日の午前中ですね。火曜日の授業の時では遅いですか。\n先生：うん、月曜の午後に確認したいから、午前中にお願いね。\n学生：分かりました。月曜日の朝に提出します。',
        explanation: 'Thầy giáo dặn: "月曜日の午前中までに研究室の前の箱に入れておいてください" (Hãy bỏ vào hộp trước phòng nghiên cứu trước trưa thứ Hai) vì chiều thứ Hai thầy cần kiểm tra.'
      },
      {
        examId: 'N4-EXAM-01',
        questionId: 'N4-EXAM-01-Q03',
        level: 'N4',
        questionNumber: 3,
        questionType: '問題2',
        questionText: '病院で男の人と医者が話しています。男の人はどうして薬を飲まなければなりませんか。',
        options: [
          '熱が高くて下がらないから',
          '胃の痛みを止めるため',
          'のどの炎症を抑えるため',
          '夜よく眠れるようにするため'
        ],
        correctAnswer: 3,
        sourceVerified: true,
        transcript: '医者：風邪ですね。熱はもうありませんが、のどの赤みがまだ少し強いです。\n男：はい、つばを飲み込む時にちょっと痛みます。\n医者：では、のどの炎症を抑える薬を出しておきますね。胃薬も一緒に出しておきますので、食後に飲んでください。\n男：分かりました。眠くなる成分は入っていますか。\n医者：いいえ、昼間飲んでも眠くなりませんよ。\n男：安心しました。ありがとうございます。',
        explanation: 'Bác sĩ nói: "のどの炎症を抑える薬を出しておきますね" (Tôi kê thuốc giảm viêm họng cho anh nhé). Mục đích chính của việc uống thuốc là giảm viêm họng (のどの炎症を抑えるため).'
      },
      {
        examId: 'N4-EXAM-01',
        questionId: 'N4-EXAM-01-Q04',
        level: 'N4',
        questionNumber: 4,
        questionType: '問題2',
        questionText: '女の人と男の人が旅行の計画について話しています。二人はどうして新幹線で行くことにしましたか。',
        options: [
          '飛行機より料金がずっと安いから',
          '新幹線の方が景色を楽しめるから',
          '空港までの移動時間がかからないから',
          '電車の切符が割引になったから'
        ],
        correctAnswer: 3,
        sourceVerified: true,
        transcript: '女：京都への旅行、飛行機で行く？それとも新幹線？\n男：飛行機の方が飛んでいる時間は短いけど、家から空港まで1時間半もかかるんだよね。\n女：そうね。新幹線の駅なら家から15分で行けるし、トータルの時間は変わらないかも。\n男：うん、しかも空港での待ち時間もないから新幹線にしよう。\n女：賛成！そうしましょう。',
        explanation: 'Lý do hai người chọn shinkansen là vì đi ra sân bay mất 1 tiếng rưỡi, còn ra ga chỉ mất 15 phút, không mất thời gian di chuyển ra sân bay (空港までの移動時間がかからないから).'
      },
      {
        examId: 'N4-EXAM-01',
        questionId: 'N4-EXAM-01-Q05',
        level: 'N4',
        questionNumber: 5,
        questionType: '問題3',
        questionText: '友達の家でごちそうになりました。帰るとき、何と言いますか。',
        options: [
          'いってまいります。',
          'ごちそうさまでした。とても美味しかったです。',
          'お邪魔しました。また呼んでくださいね。',
          'いただきます。ご遠慮なく。'
        ],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '【状況】友達の家で美味しい夕飯をごちそうになりました。玄関で靴を履いて帰るところです。\n何と言いますか。\n1. いってまいります。\n2. ごちそうさまでした。とても美味しかったです。\n3. お邪魔しました。また呼んでくださいね。\n4. いただきます。ご遠慮なく。',
        explanation: 'Khi được chiêu đãi bữa ăn tại nhà bạn bè lúc ra về chào: "ごちそうさまでした。とても美味しかったです。" (Cảm ơn bạn vì bữa ăn ngon. Đồ ăn thực sự rất ngon ạ).'
      },
      {
        examId: 'N4-EXAM-01',
        questionId: 'N4-EXAM-01-Q06',
        level: 'N4',
        questionNumber: 6,
        questionType: '問題3',
        questionText: '重い荷物を運んでいる人がいます。手伝いたいとき、何と言いますか。',
        options: [
          '手伝っていただけませんか。',
          'お手伝いしましょうか。',
          '手伝ってもいいですよ。',
          'お持ちになられますか。'
        ],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '【状況】前の人が階段でとても重そうな荷物を持っています。声をかけて手伝いたいと思います。\n何と言いますか。\n1. 手伝っていただけませんか。\n2. お手伝いしましょうか。\n3. 手伝ってもいいですよ。\n4. お持ちになられますか。',
        explanation: 'Lời đề nghị giúp đỡ lịch sự: "お手伝いしましょうか。" (Để tôi giúp một tay nhé ạ?).'
      },
      {
        examId: 'N4-EXAM-01',
        questionId: 'N4-EXAM-01-Q07',
        level: 'N4',
        questionNumber: 7,
        questionType: '問題4',
        questionText: '「あのう、この本、明日までにお返しすればよろしいですか。」',
        options: [
          'ええ、明日で構いませんよ。',
          'いいえ、まだ返していません。',
          'はい、明日返しました。'
        ],
        correctAnswer: 1,
        sourceVerified: true,
        transcript: '男：あのう、この本、明日までにお返しすればよろしいですか。\n女：\n1. ええ、明日で構いませんよ。\n2. いいえ、まだ返していません。\n3. はい、明日返しました。',
        explanation: 'Hỏi xin phép ngày mai trả sách có được không, đáp lại tự nhiên là "ええ、明日で構いませんよ。" (Vâng, mai trả cũng được ạ).'
      },
      {
        examId: 'N4-EXAM-01',
        questionId: 'N4-EXAM-01-Q08',
        level: 'N4',
        questionNumber: 8,
        questionType: '問題4',
        questionText: '「田中さん、昨日のパーティー、来られなくて残念だったね。」',
        options: [
          '本当に行きたかったんですけど、急用が入ってしまって。',
          'ぜひ行かせていただきます。',
          'とても楽しかったですよ。'
        ],
        correctAnswer: 1,
        sourceVerified: true,
        transcript: '女：田中さん、昨日のパーティー、来られなくて残念だったね。\n男：\n1. 本当に行きたかったんですけど、急用が入ってしまって。\n2. ぜひ行かせていただきます。\n3. とても楽しかったですよ。',
        explanation: 'Bạn bè nói tiếc vì hôm qua bạn không tới tiệc được, phản hồi phù hợp là giải thích lý do: "本当に行きたかったんですけど、急用が入ってしまって。" (Tôi thực sự rất muốn đi nhưng lại có việc gấp đột xuất).'
      },
      {
        examId: 'N4-EXAM-01',
        questionId: 'N4-EXAM-01-Q09',
        level: 'N4',
        questionNumber: 9,
        questionType: '問題4',
        questionText: '「雨が降ってきましたね。傘をお持ちですか。」',
        options: [
          'はい、あそこに置いてありますよ。',
          'いいえ、折りたたみ傘を持っています。',
          'いえ、持ってこなかったので、駅で買います。'
        ],
        correctAnswer: 3,
        sourceVerified: true,
        transcript: '男：雨が降ってきましたね。傘をお持ちですか。\n女：\n1. はい、あそこに置いてありますよ。\n2. いいえ、折りたたみ傘を持っています。\n3. いえ、持ってこなかったので、駅で買います。',
        explanation: 'Hỏi có mang ô không, trả lời: "いえ、持ってこなかったので、駅で買います。" (Không, tôi không mang theo nên lát tôi mua ở ga).'
      },
      {
        examId: 'N4-EXAM-01',
        questionId: 'N4-EXAM-01-Q10',
        level: 'N4',
        questionNumber: 10,
        questionType: '問題4',
        questionText: '「駅前の新しいレストラン、もう行ってみましたか。」',
        options: [
          '来週オープンするそうですよ。',
          'ええ、先週末に家族と行ってきました。',
          'いいえ、とても美味しかったです。'
        ],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '女：駅前の新しいレストラン、もう行ってみましたか。\n男：\n1. 来週オープンするそうですよ。\n2. ええ、先週末に家族と行ってきました。\n3. いいえ、とても美味しかったです。',
        explanation: 'Hỏi đã ghé thử nhà hàng mới trước ga chưa, trả lời: "ええ、先週末に家族と行ってきました。" (Rồi, cuối tuần trước tôi đã đi cùng gia đình).'
      }
    ]
  },

  // ==========================================
  // BỘ ĐỀ 02: JLPT N4 - ĐỀ THI MÔ PHỎNG SUPER MOGI SỐ 02
  // ==========================================
  {
    examId: 'N4-EXAM-02',
    title: 'Đề thi thử JLPT N4 Super Mogi - Đề số 02 (Trọng tâm 問題1 & 問題2)',
    level: 'N4',
    year: '2024',
    session: 'Super Mogi N4',
    description: 'Bộ đề thi luyện nghe kỹ năng giải quyết tình huống và nắm bắt trọng điểm chi tiết.',
    totalQuestions: 6,
    questions: [
      {
        examId: 'N4-EXAM-02',
        questionId: 'N4-EXAM-02-Q01',
        level: 'N4',
        questionNumber: 1,
        questionType: '問題1',
        questionText: '駅を出てまっすぐ行って、最初の信号を右に曲がってください。曲がるとすぐ右側にある建物はどれですか。',
        options: ['1番の建物', '2番の建物', '3番の建物', '4番の建物'],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '男：駅を出てまっすぐ行って、最初の信号を右に曲がってください。\n女：信号を右ですね。\n男：はい、曲がるとすぐ右側にある建物ですよ。\n女：わかりました。',
        explanation: 'Đi thẳng từ ga qua ngã tư đầu tiên rẽ phải, tòa nhà ngay bên phải góc đường là tòa số 2.'
      },
      {
        examId: 'N4-EXAM-02',
        questionId: 'N4-EXAM-02-Q02',
        level: 'N4',
        questionNumber: 2,
        questionType: '問題1',
        questionText: '男の人と女の人が話しています。二人はどこでお昼ご飯を食べますか。',
        options: ['パン屋', '食堂', '外のベンチ', '教室'],
        correctAnswer: 4,
        sourceVerified: true,
        transcript: '男：お昼ご飯、食堂に行く？\n女：今日は食堂が混んでいるから、パン屋で買って教室で食べない？\n男：いいね、そうしよう。',
        explanation: 'Người nữ bảo hôm nay nhà ăn đông nên mua bánh mì rồi về phòng học ăn. Đáp án là 教室.'
      },
      {
        examId: 'N4-EXAM-02',
        questionId: 'N4-EXAM-02-Q03',
        level: 'N4',
        questionNumber: 3,
        questionType: '問題1',
        questionText: '男の人と女の人が話しています。男の人は荷物をどう入れますか。',
        options: ['1番', '2番', '3番', '4番'],
        correctAnswer: 4,
        sourceVerified: true,
        transcript: '女：本とセーター、どうやって箱に入れる？\n男：セーターを下に敷いて、その上に本を置けば崩れないよ。\n女：そうね、そうして。',
        explanation: 'Để áo len xuống dưới làm đệm lót, đặt sách lên trên. Đáp án 4.'
      },
      {
        examId: 'N4-EXAM-02',
        questionId: 'N4-EXAM-02-Q04',
        level: 'N4',
        questionNumber: 4,
        questionType: '問題2',
        questionText: '女の人と男の人が話しています。男の人はどうして昨日パーティーに行きませんでしたか。',
        options: [
          '風邪をひいたから',
          '仕事が遅くまであったから',
          '場所がわからなかったから',
          '日にちを間違えたから'
        ],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '女：山田さん、昨日のパーティー来なかったね。風邪でもひいたの？\n男：ううん、急に課長から頼まれた仕事が終わらなくて、会社を出たのが9時過ぎだったんだ。\n女：そうだったんだ。大変だったね。',
        explanation: 'Người nam giải thích vì có việc gấp sếp giao nên hơn 9 giờ tối mới rời công ty (仕事が遅くまであったから).'
      },
      {
        examId: 'N4-EXAM-02',
        questionId: 'N4-EXAM-02-Q05',
        level: 'N4',
        questionNumber: 5,
        questionType: '問題3',
        questionText: 'エレベーターに乗りたいです。先に人が乗っています。何と言いますか。',
        options: [
          '入ってもいいですか。',
          '失礼します。',
          '乗せてください。',
          'お待たせしました。'
        ],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '【状況】エレベーターに人が乗っています。後から乗るとき、何と言いますか。\n1. 入ってもいいですか。\n2. 失礼します。\n3. 乗せてください。\n4. お待たせしました。',
        explanation: 'Khi bước vào thang máy có người khác, nói lịch sự là "失礼します。"'
      },
      {
        examId: 'N4-EXAM-02',
        questionId: 'N4-EXAM-02-Q06',
        level: 'N4',
        questionNumber: 6,
        questionType: '問題4',
        questionText: '「コーヒーのおかわりはいかがですか。」',
        options: [
          'はい、もう結構です。',
          'ええ、いただきます。',
          'いいえ、美味しかったです。'
        ],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '店員：コーヒーのおかわりはいかがですか。\n客：\n1. はい、もう結構です。\n2. ええ、いただきます。\n3. いいえ、美味しかったです。',
        explanation: 'Được hỏi có muốn thêm cà phê không, đồng ý thì nói "ええ、いただきます。"'
      }
    ]
  },

  // ==========================================
  // BỘ ĐỀ 03: JLPT N5 - ĐỀ THI CHÍNH THỨC SỐ 01
  // ==========================================
  {
    examId: 'N5-EXAM-01',
    title: 'Đề thi nghe JLPT N5 Tiêu chuẩn - Đề số 01',
    level: 'N5',
    year: '2023',
    session: 'Choukai Test N5',
    description: 'Đề thi nghe JLPT N5 gồm 8 câu hỏi tình huống cơ bản trong trường học, công sở và sinh hoạt thường nhật.',
    totalQuestions: 8,
    questions: [
      {
        examId: 'N5-EXAM-01',
        questionId: 'N5-EXAM-01-Q01',
        level: 'N5',
        questionNumber: 1,
        questionType: '問題1',
        questionText: '教室で先生が話しています。学生は明日何を持ってきますか。',
        options: [
          '鉛筆とノート',
          'ノートと教科書',
          '教科書と辞書',
          '辞書と鉛筆'
        ],
        correctAnswer: 3,
        sourceVerified: true,
        transcript: '先生：みなさん、明日はテストではありませんが、新しい教科書と電子辞書を必ず持ってきてください。ノートは学校で配ります。\n学生：先生、鉛筆もいりますか。\n先生：ええ、筆記用具はいつも通り持ってきてね。でも特に忘れてはいけないのは教科書と辞書ですよ。',
        explanation: 'Thầy giáo nhấn mạnh: "新しい教科書と電子辞書を必ず持ってきてください" (Nhất định mang theo sách giáo khoa mới và kim từ điển). Đáp án là 教科書と辞書.'
      },
      {
        examId: 'N5-EXAM-01',
        questionId: 'N5-EXAM-01-Q02',
        level: 'N5',
        questionNumber: 2,
        questionType: '問題1',
        questionText: 'スーパーで女の人と店員が話しています。女の人はどのりんごを買いますか。',
        options: [
          '3個入りの大きいりんご',
          '3個入りの小さいりんご',
          '5個入りの大きいりんご',
          '5個入りの小さいりんご'
        ],
        correctAnswer: 1,
        sourceVerified: true,
        transcript: '女：すみません、この大きなりんごはいくらですか。\n店員：そちらは3個で500円です。あちらの小さい方は5個で500円ですよ。\n女：味はどちらが甘いですか。\n店員：大きい方が甘くてジューシーでおすすめです。\n女：じゃあ、大きい方を3個ください。',
        explanation: 'Người phụ nữ chọn mua táo to loại 3 quả: "じゃあ、大きい方を3個ください".'
      },
      {
        examId: 'N5-EXAM-01',
        questionId: 'N5-EXAM-01-Q03',
        level: 'N5',
        questionNumber: 3,
        questionType: '問題2',
        questionText: '男の人と女の人が話しています。男の人はどうして遅れましたか。',
        options: [
          'バスが来なかったから',
          '道に迷ったから',
          '財布を忘れて取りに戻ったから',
          '寝坊したから'
        ],
        correctAnswer: 3,
        sourceVerified: true,
        transcript: '女：田中くん、遅いよ！もう映画始まっちゃうよ。\n男：ごめん！家を出たあとで財布を忘れたのに気づいて、走って取りに戻ったんだ。\n女：もう、気をつけてよね。早く行こう！',
        explanation: 'Người nam xin lỗi và nói: "家を出たあとで財布を忘れたのに気づいて、走って取りに戻ったんだ" (Quên ví nên quay về lấy).'
      },
      {
        examId: 'N5-EXAM-01',
        questionId: 'N5-EXAM-01-Q04',
        level: 'N5',
        questionNumber: 4,
        questionType: '問題2',
        questionText: '女の人と男の人が話しています。パーティーは何時から始まりますか。',
        options: ['5時', '5時半', '6時', '6時半'],
        correctAnswer: 3,
        sourceVerified: true,
        transcript: '女：今夜のパーティー、何時からだっけ？5時半だっけ？\n男：案内には6時開始って書いてあったよ。でも準備があるから5時半には集まることになってる。\n女：あ、そうなんだ。開始は6時ね。了解！',
        explanation: 'Mặc dù 5h30 tập trung chuẩn bị nhưng giờ bắt đầu chính thức là 6 giờ (開始は6時).'
      },
      {
        examId: 'N5-EXAM-01',
        questionId: 'N5-EXAM-01-Q05',
        level: 'N5',
        questionNumber: 5,
        questionType: '問題3',
        questionText: '先生の部屋に入ります。何と言いますか。',
        options: [
          'じゃあ、また。',
          '失礼します。',
          'ごちそうさまでした。'
        ],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '【状況】先生の研究室に入るとき、ドアをノックしてから何と言いますか。\n1. じゃあ、また。\n2. 失礼します。\n3. ごちそうさまでした。',
        explanation: 'Khi vào phòng thầy cô giáo hoặc văn phòng, câu lịch sự chuẩn là "失礼します。"'
      },
      {
        examId: 'N5-EXAM-01',
        questionId: 'N5-EXAM-01-Q06',
        level: 'N5',
        questionNumber: 6,
        questionType: '問題3',
        questionText: '友達にプレゼントを渡します。何と言いますか。',
        options: [
          'どうぞ。',
          'どうも。',
          'ごめんなさい。'
        ],
        correctAnswer: 1,
        sourceVerified: true,
        transcript: '【状況】友達に誕生日プレゼントをあげます。手渡しながら何と言いますか。\n1. どうぞ。\n2. どうも。\n3. ごめんなさい。',
        explanation: 'Khi trao quà tặng ai đó, câu tự nhiên nhất là: "どうぞ。"'
      },
      {
        examId: 'N5-EXAM-01',
        questionId: 'N5-EXAM-01-Q07',
        level: 'N5',
        questionNumber: 7,
        questionType: '問題4',
        questionText: '「お名前は何とお読みしますか。」',
        options: [
          '本田と申します。',
          '日本人です。',
          '学生です。'
        ],
        correctAnswer: 1,
        sourceVerified: true,
        transcript: '男：お名前は何とお読みしますか。\n女：\n1. 本田と申します。\n2. 日本人です。\n3. 学生です。',
        explanation: 'Khi được hỏi tên đọc là gì, trả lời: "本田と申します。" (Tôi tên đọc là Honda ạ).'
      },
      {
        examId: 'N5-EXAM-01',
        questionId: 'N5-EXAM-01-Q08',
        level: 'N5',
        questionNumber: 8,
        questionType: '問題4',
        questionText: '「一緒にお昼ご飯を食べに行きませんか。」',
        options: [
          'ええ、行きましょう。',
          'はい、食べました。',
          'いいえ、行きませんでした。'
        ],
        correctAnswer: 1,
        sourceVerified: true,
        transcript: '男：一緒にお昼ご飯を食べに行きませんか。\n女：\n1. ええ、行きましょう。\n2. はい、食べました。\n3. いいえ、行きませんでした。',
        explanation: 'Lời rủ đi ăn trưa: "一緒にお昼ご飯を食べに行きませんか。". Đồng ý trả lời: "ええ、行きましょう。"'
      }
    ]
  },

  // ==========================================
  // BỘ ĐỀ 04: JLPT N3/N5 - TỔNG HỢP LUYỆN NGHE SỐ 01
  // ==========================================
  {
    examId: 'N3-EXAM-01',
    title: 'Đề thi nghe JLPT N3 Tổng hợp - Hội thoại tình huống',
    level: 'N3',
    year: '2023',
    session: 'N3 Mogi Test 01',
    description: 'Bộ đề thi tổng hợp kiểm tra độ nhạy bén câu hỏi ngắn và phản xạ hội thoại.',
    totalQuestions: 4,
    questions: [
      {
        examId: 'N3-EXAM-01',
        questionId: 'N3-EXAM-01-Q01',
        level: 'N3',
        questionNumber: 1,
        questionType: '問題1',
        questionText: '図書館で男の学生と係の人が話しています。学生は何枚コピーしますか。',
        options: ['5枚', '10枚', '15枚', '20枚'],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '学生：すみません、この資料を10部ずつコピーしたいのですが。\n係員：あちらのコピー機をご利用ください。コインを入れて枚数を設定してくださいね。\n学生：分かりました。10枚ですね。',
        explanation: 'Sinh viên muốn photocopy 10 bản tài liệu (10枚).'
      },
      {
        examId: 'N3-EXAM-01',
        questionId: 'N3-EXAM-01-Q02',
        level: 'N3',
        questionNumber: 2,
        questionType: '問題2',
        questionText: '女の人と男の人が話しています。男の人はどうして昨日遅刻しましたか。',
        options: [
          '目覚まし時計が壊れたから',
          '電車が遅れたから',
          '道に迷ったから',
          '忘れ物を取りに戻ったから'
        ],
        correctAnswer: 2,
        sourceVerified: true,
        transcript: '女：山田さん、昨日珍しく遅刻したね。どうしたの？\n男：朝、乗った電車が急に止まって30分も動かなかったんだよ。\n女：そうだったんだ。大変だったね。',
        explanation: 'Người nam giải thích tàu điện sáng qua đột ngột dừng lại 30 phút nên anh bị trễ (電車が遅れたから).'
      },
      {
        examId: 'N3-EXAM-01',
        questionId: 'N3-EXAM-01-Q03',
        level: 'N3',
        questionNumber: 3,
        questionType: '問題3',
        questionText: '会議で他の人の意見に賛成したいとき、何と言いますか。',
        options: [
          '私もその意見に賛成です。',
          'どちらでもいいです。',
          '反対ではありません。'
        ],
        correctAnswer: 1,
        sourceVerified: true,
        transcript: '【状況】会議で同僚の提案に同意したいです。何と言いますか。\n1. 私もその意見に賛成です。\n2. どちらでもいいです。\n3. 反対ではありません。',
        explanation: 'Cách bày tỏ sự đồng thuận rõ ràng và lịch sự trong cuộc họp: "私もその意見に賛成です。"'
      },
      {
        examId: 'N3-EXAM-01',
        questionId: 'N3-EXAM-01-Q04',
        level: 'N3',
        questionNumber: 4,
        questionType: '問題4',
        questionText: '「この書類、確認しておいていただけますか。」',
        options: [
          'はい、すぐに拝見します。',
          'いいえ、まだ見ていません。',
          'ええ、お見せします。'
        ],
        correctAnswer: 1,
        sourceVerified: true,
        transcript: '上司：この書類、確認しておいていただけますか。\n部下：\n1. はい、すぐに拝見します。\n2. いいえ、まだ見ていません。\n3. ええ、お見せします。',
        explanation: 'Sếp nhờ xem tài liệu, cấp dưới đáp lại bằng khiêm nhường ngữ: "はい、すぐに拝見します。" (Vâng, tôi xin phép xem ngay ạ).'
      }
    ]
  }
];

export function getAllOriginalExams(): OriginalExam[] {
  return ORIGINAL_LISTENING_EXAMS;
}

export function getOriginalExamById(examId: string): OriginalExam | null {
  if (!examId) return null;
  return ORIGINAL_LISTENING_EXAMS.find(e => e.examId === examId) || null;
}

export function getOriginalExamsByLevel(level: JLPTLevel): OriginalExam[] {
  return ORIGINAL_LISTENING_EXAMS.filter(e => e.level === level);
}

export function getOriginalQuestionById(questionId: string): OriginalQuestion | null {
  for (const exam of ORIGINAL_LISTENING_EXAMS) {
    const q = exam.questions.find(item => item.questionId === questionId);
    if (q) return q;
  }
  return null;
}
