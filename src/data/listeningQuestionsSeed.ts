import { ListeningExamData } from '../types/listeningExamTypes';

export const SEED_LISTENING_EXAMS: ListeningExamData[] = [
  // ==========================================
  // N4 Listening 01 - YouTube ID: 2Qk4Hq1WqUA
  // ==========================================
  {
    id: 'n4-exam-01',
    youtubeVideoId: '2Qk4Hq1WqUA',
    title: 'N4 Listening 01 - JLPT N4 Practice Test with Answers',
    level: 'N4',
    questionType: 'Tổng hợp (問題1 - 問題4)',
    description: 'Bộ câu hỏi chuẩn JLPT N4 bao gồm 問題1 (課題理解), 問題2 (ポイント理解), 問題3 (発話表現), 問題4 (即時応答).',
    questions: [
      {
        questionId: 'N4-001',
        youtubeVideoId: '2Qk4Hq1WqUA',
        questionType: '問題1',
        question: '男の人と女の人が話しています。男の人はこれから何をしますか。',
        options: [
          'コピーを取る',
          '会議室の机を並べる',
          '窓を開けて換気する',
          'お茶を用意する'
        ],
        answer: 2,
        startTime: 65,
        endTime: 145,
        transcript: '男：部長、午後の会議の準備ですが、何か手伝いましょうか。\n女：ああ、田中さん。資料のコピーは私がさっき終わらせたから、会議室の机をコの字型に並べ直してもらえる？\n男：分かりました。お茶の準備はいかがですか。\n女：それは会議の直前に私がやるから大丈夫。よろしくね。\n男：はい、すぐやります。',
        explanation: 'Người phụ nữ nói rõ: "資料のコピーは私がさっき終わらせたから、会議室の机をコの字型に並べ直してもらえる？" (Tài liệu copy tôi đã làm xong rồi, anh có thể kê lại bàn trong phòng họp theo hình chữ U giúp tôi không?). Người nam trả lời: "はい、すぐやります" (Vâng, tôi sẽ làm ngay). Vì vậy, việc người nam sẽ làm tiếp theo là xếp bàn phòng họp (会議室の机を並べる).'
      },
      {
        questionId: 'N4-002',
        youtubeVideoId: '2Qk4Hq1WqUA',
        questionType: '問題1',
        question: '大学で留学生と先生が話しています。留学生はレポートをいつまでに出さなければなりませんか。',
        options: [
          '今週の金曜日の午後5時',
          '来週の月曜日の午前中',
          '来週の火曜日の授業の前',
          '来週の水曜日の夕方'
        ],
        answer: 2,
        startTime: 150,
        endTime: 235,
        transcript: '学生：先生、先週おっしゃっていたレポートのことですが、締め切りは今週の金曜日の5時でしたでしょうか。\n先生：金曜日は祝日になったからね。月曜日の午前中までに研究室の前の箱に入れておいてください。\n学生：月曜日の午前中ですね。火曜日の授業の時では遅いですか。\n先生：うん、月曜の午後に確認したいから、午前中にお願いね。\n学生：分かりました。月曜日の朝に提出します。',
        explanation: 'Thầy giáo giải thích rằng thứ Sáu là ngày lễ, nên dặn sinh viên: "月曜日の午前中までに研究室の前の箱に入れておいてください" (Hãy bỏ vào hộp trước phòng nghiên cứu trước trưa thứ Hai). Người nam xin nộp vào tiết học thứ Ba nhưng thầy từ chối vì muốn kiểm tra vào chiều thứ Hai.'
      },
      {
        questionId: 'N4-003',
        youtubeVideoId: '2Qk4Hq1WqUA',
        questionType: '問題2',
        question: '病院で男の人と医者が話しています。男の人はどうして薬を飲まなければなりませんか。',
        options: [
          '熱が高くて下がらないから',
          '胃の痛みを止めるため',
          'のどの炎症を抑えるため',
          '夜よく眠れるようにするため'
        ],
        answer: 3,
        startTime: 240,
        endTime: 330,
        transcript: '医者：風邪ですね。熱はもうありませんが、のどの赤みがまだ少し強いです。\n男：はい、つばを飲み込む時にちょっと痛みます。\n医者：では、のどの炎症を抑える薬を出しておきますね。胃薬も一緒に出しておきますので、食後に飲んでください。\n男：分かりました。眠くなる成分は入っていますか。\n医者：いいえ、昼間飲んでも眠くなりませんよ。\n男：安心しました。ありがとうございます。',
        explanation: 'Bác sĩ nói: "のどの炎症を抑える薬を出しておきますね" (Tôi kê thuốc giảm viêm họng cho anh nhé). Người đàn ông cũng xác nhận cổ họng bị đau khi nuốt nước bọt. Vì vậy mục đích uống thuốc chính là để giảm viêm họng (のどの炎症を抑えるため).'
      },
      {
        questionId: 'N4-004',
        youtubeVideoId: '2Qk4Hq1WqUA',
        questionType: '問題2',
        question: '女の人と男の人が旅行の計画について話しています。二人はどうして新幹線で行くことにしましたか。',
        options: [
          '飛行機より料金がずっと安いから',
          '新幹線の方が景色を楽しめるから',
          '空港までの移動時間がかからないから',
          '電車の切符が割引になったから'
        ],
        answer: 3,
        startTime: 335,
        endTime: 425,
        transcript: '女：京都への旅行、飛行機で行く？それとも新幹線？\n男：飛行機の方が飛んでいる時間は短いけど、家から空港まで1時間半もかかるんだよね。\n女：そうね。新幹線の駅なら家から15分で行けるし、トータルの時間は変わらないかも。\n男：うん、しかも空港での待ち時間もないから新幹線にしよう。\n女：賛成！そうしましょう。',
        explanation: 'Người nam phân tích: nhà đến sân bay mất tận 1 tiếng rưỡi, còn ga shinkansen chỉ mất 15 phút, không mất thời gian di chuyển và chờ đợi ở sân bay. Vì thế họ chọn shinkansen vì tiết kiệm thời gian đi ra sân bay (空港までの移動時間がかからないから).'
      },
      {
        questionId: 'N4-005',
        youtubeVideoId: '2Qk4Hq1WqUA',
        questionType: '問題3',
        question: '友達の家でごちそうになりました。帰るとき、何と言いますか。',
        options: [
          'いってまいります。',
          'ごちそうさまでした。とても美味しかったです。',
          'お邪魔しました。また呼んでくださいね。',
          'いただきます。ご遠慮なく。'
        ],
        answer: 2,
        startTime: 430,
        endTime: 505,
        transcript: '【状況】友達の家で美味しい夕飯をごちそうになりました。玄関で靴を履いて帰るところです。\n何と言いますか。\n1. いってまいります。\n2. ごちそうさまでした。とても美味しかったです。\n3. お邪魔しました。また呼んでくださいね。\n4. いただきます。ご遠慮なく。',
        explanation: 'Khi được mời ăn ngon tại nhà bạn bè và lúc chuẩn bị ra về, câu lịch sự và tự nhiên nhất để cảm ơn bữa ăn là: "ごちそうさまでした。とても美味しかったです。" (Cảm ơn bạn vì bữa ăn ngon. Đồ ăn thực sự rất ngon ạ).'
      },
      {
        questionId: 'N4-006',
        youtubeVideoId: '2Qk4Hq1WqUA',
        questionType: '問題3',
        question: '重い荷物を運んでいる人がいます。手伝いたいとき、何と言いますか。',
        options: [
          '手伝っていただけませんか。',
          'お手伝いしましょうか。',
          '手伝ってもいいですよ。',
          'お持ちになられますか。'
        ],
        answer: 2,
        startTime: 510,
        endTime: 575,
        transcript: '【状況】前の人が階段でとても重そうな荷物を持っています。声をかけて手伝いたいと思います。\n何と言いますか。\n1. 手伝っていただけませんか。\n2. お手伝いしましょうか。\n3. 手伝ってもいいですよ。\n4. お持ちになられますか。',
        explanation: 'Khi muốn chủ động đề nghị giúp đỡ ai đó một cách khiêm nhường, mẫu câu chuẩn là: "お手伝いしましょうか。" (Để tôi giúp một tay nhé ạ?).'
      },
      {
        questionId: 'N4-007',
        youtubeVideoId: '2Qk4Hq1WqUA',
        questionType: '問題4',
        question: '「あのう、この本、明日までにお返しすればよろしいですか。」',
        options: [
          'ええ、明日で構いませんよ。',
          'いいえ、まだ返していません。',
          'はい、明日返しました。'
        ],
        answer: 1,
        startTime: 580,
        endTime: 640,
        transcript: '男：あのう、この本、明日までにお返しすればよろしいですか。\n女：\n1. ええ、明日で構いませんよ。\n2. いいえ、まだ返していません。\n3. はい、明日返しました。',
        explanation: 'Câu hỏi là: "Quyển sách này tôi trả trước ngày mai có được không ạ?". Câu trả lời phù hợp là phương án 1: "ええ、明日で構いませんよ。" (Vâng, ngày mai cũng không sao đâu ạ).'
      },
      {
        questionId: 'N4-008',
        youtubeVideoId: '2Qk4Hq1WqUA',
        questionType: '問題4',
        question: '「田中さん、昨日のパーティー、来られなくて残念だったね。」',
        options: [
          '本当に行きたかったんですけど、急用が入ってしまって。',
          'ぜひ行かせていただきます。',
          'とても楽しかったですよ。'
        ],
        answer: 1,
        startTime: 645,
        endTime: 705,
        transcript: '女：田中さん、昨日のパーティー、来られなくて残念だったね。\n男：\n1. 本当に行きたかったんですけど、急用が入ってしまって。\n2. ぜひ行かせていただきます。\n3. とても楽しかったですよ。',
        explanation: 'Người bạn nói: "Tanaka ơi, tiệc hôm qua cậu không đến được tiếc ghê". Tanaka cần bày tỏ lý do tiếc nuối: "本当に行きたかったんですけど、急用が入ってしまって。" (Tôi thực sự rất muốn đi nhưng lại có việc gấp đột xuất).'
      },
      {
        questionId: 'N4-009',
        youtubeVideoId: '2Qk4Hq1WqUA',
        questionType: '問題4',
        question: '「雨が降ってきましたね。傘をお持ちですか。」',
        options: [
          'はい、あそこに置いてありますよ。',
          'いいえ、折りたたみ傘を持っています。',
          'いえ、持ってこなかったので、駅で買います。'
        ],
        answer: 3,
        startTime: 710,
        endTime: 770,
        transcript: '男：雨が降ってきましたね。傘をお持ちですか。\n女：\n1. はい、あそこに置いてありますよ。\n2. いいえ、折りたたみ傘を持っています。\n3. いえ、持ってこなかったので、駅で買います。',
        explanation: 'Khi được hỏi có mang dù không, phương án 3 phản hồi chính xác: "いえ、持ってこなかったので、駅で買います。" (Không, tôi không mang theo nên lát tôi sẽ mua ở ga).'
      },
      {
        questionId: 'N4-010',
        youtubeVideoId: '2Qk4Hq1WqUA',
        questionType: '問題4',
        question: '「駅前の新しいレストラン、もう行ってみましたか。」',
        options: [
          '来週オープンするそうですよ。',
          'ええ、先週末に家族と行ってきました。',
          'いいえ、とても美味しかったです。'
        ],
        answer: 2,
        startTime: 775,
        endTime: 840,
        transcript: '女：駅前の新しいレストラン、もう行ってみましたか。\n男：\n1. 来週オープンするそうですよ。\n2. ええ、先週末に家族と行ってきました。\n3. いいえ、とても美味しかったです。',
        explanation: 'Hỏi "Bạn đã thử ghé nhà hàng mới trước ga chưa?", trả lời "ええ、先週末に家族と行ってきました。" (Rồi, cuối tuần trước tôi đã đi cùng gia đình).'
      }
    ]
  },

  // ==========================================
  // N5 Listening 01 - YouTube ID: I3kvL128MIQ
  // ==========================================
  {
    id: 'n5-exam-01',
    youtubeVideoId: 'I3kvL128MIQ',
    title: 'N5 Listening 01 - Đề luyện thi nghe JLPT N5 có đáp án',
    level: 'N5',
    questionType: 'Tổng hợp (問題1 - 問題4)',
    description: 'Đề thi nghe JLPT N5 tiêu chuẩn gồm 8 câu hỏi tình huống thường ngày trong trường học, siêu thị và công sở.',
    questions: [
      {
        questionId: 'N5-001',
        youtubeVideoId: 'I3kvL128MIQ',
        questionType: '問題1',
        question: '教室で先生が話しています。学生は明日何を持ってきますか。',
        options: [
          'ノートと鉛筆',
          '教科書と辞書',
          'ノートと写真',
          '辞書と写真'
        ],
        answer: 3,
        startTime: 50,
        endTime: 125,
        transcript: '先生：みなさん、明日は家族についてのスピーチをします。ノートと、家族の写真を忘れずに持ってきてください。教科書や辞書は要りません。\n学生：先生、写真は携帯電話の中のものでもいいですか。\n先生：紙の写真がいいですが、なければ携帯でも構いません。ノートと写真ですよ。',
        explanation: 'Giáo viên yêu cầu: "ノートと、家族の写真を忘れずに持ってきてください。教科書や辞書は要りません。" (Mọi người nhớ mang theo vở và ảnh gia đình nhé. Sách giáo khoa và từ điển không cần mang).'
      },
      {
        questionId: 'N5-002',
        youtubeVideoId: 'I3kvL128MIQ',
        questionType: '問題1',
        question: '男の人と女の人が話しています。女の人は何番のバスに乗りますか。',
        options: [
          '1番のバス',
          '3番のバス',
          '5番のバス',
          '8番のバス'
        ],
        answer: 2,
        startTime: 130,
        endTime: 210,
        transcript: '女：すみません、市役所へ行きたいんですが、何番のバスですか。\n男：市役所ですね。1番と3番と5番が行きますよ。\n女：一番早く着くのはどれですか。\n男：3番の急行バスですね。あ、ちょうど今来ましたよ。\n女：ありがとうございます！',
        explanation: 'Người đàn ông cho biết xe số 1, 3, 5 đều đến toà thị chính, nhưng nhanh nhất là xe buýt tốc hành số 3 (3番の急行バス). Người phụ nữ lên xe số 3.'
      },
      {
        questionId: 'N5-003',
        youtubeVideoId: 'I3kvL128MIQ',
        questionType: '問題2',
        question: '男の人がパン屋でパンを買っています。男の人はパンをいくつ買いましたか。',
        options: [
          '2つ',
          '3つ',
          '4つ',
          '5つ'
        ],
        answer: 3,
        startTime: 215,
        endTime: 295,
        transcript: '店員：いらっしゃいませ。\n男：メロンパンを2つと、カレーパンを2つください。\n店員：申し訳ありません、メロンパンは今1つしか残っていません。\n男：あ、そうですか。じゃあ、メロンパン1つと、カレーパンを3つにしてください。\n店員：かしこまりました。合計4つですね。',
        explanation: 'Ban đầu người nam định mua 2 bánh melon và 2 bánh curry. Nhưng vì bánh melon chỉ còn 1 cái nên anh đổi thành: 1 bánh melon + 3 bánh curry = tổng cộng 4 cái (合計4つ).'
      },
      {
        questionId: 'N5-004',
        youtubeVideoId: 'I3kvL128MIQ',
        questionType: '問題2',
        question: '女の人と男の人が話しています。二人はどこで会いますか。',
        options: [
          '駅の改札口',
          '映画館の入口',
          '本屋の前',
          '喫茶店の中'
        ],
        answer: 3,
        startTime: 300,
        endTime: 385,
        transcript: '女：明日の待ち合わせ、駅の改札口にする？\n男：明日は土曜日だから改札口は人が多くて見つけにくいよ。映画館の隣の本屋の前はどう？\n女：あそこね、分かりやすくていいね。じゃあ2時に本屋の前ね。\n男：了解！',
        explanation: 'Họ thống nhất không gặp ở cửa soát vé vì đông người, mà chọn gặp ở trước hiệu sách cạnh rạp chiếu phim (映画館の隣の本屋の前).'
      },
      {
        questionId: 'N5-005',
        youtubeVideoId: 'I3kvL128MIQ',
        questionType: '問題3',
        question: 'レストランで注文したいとき、店員に何と言いますか。',
        options: [
          'すみません。',
          'ごめんなさい。',
          '失礼しました。',
          'どうも。'
        ],
        answer: 1,
        startTime: 390,
        endTime: 450,
        transcript: '【状況】レストランでメニューが決まりました。店員を呼んで注文したいです。\n何と言いますか。\n1. すみません。\n2. ごめんなさい。\n3. 失礼しました。\n4. どうも。',
        explanation: 'Trong nhà hàng ở Nhật Bản, khi muốn gọi nhân viên phục vụ để gọi món, câu chào chuẩn xác nhất là giơ tay và nói "すみません。" (Xin lỗi / Cho tôi gọi món ạ).'
      },
      {
        questionId: 'N5-006',
        youtubeVideoId: 'I3kvL128MIQ',
        questionType: '問題3',
        question: '朝、会社の同僚に会いました。何と言いますか。',
        options: [
          'おやすみなさい。',
          'おはようございます。',
          'こんにちは。',
          'さようなら。'
        ],
        answer: 2,
        startTime: 455,
        endTime: 515,
        transcript: '【状況】朝、会社の入口で同僚の山下さんに会いました。\n何と言いますか。\n1. おやすみなさい。\n2. おはようございます。\n3. こんにちは。\n4. さようなら。',
        explanation: 'Chào buổi sáng đồng nghiệp dùng: "おはようございます。" (Chào buổi sáng).'
      },
      {
        questionId: 'N5-007',
        youtubeVideoId: 'I3kvL128MIQ',
        questionType: '問題4',
        question: '「お茶をどうぞ。」',
        options: [
          'どういたしまして。',
          'いただきます。',
          'ごちそうさまでした。'
        ],
        answer: 2,
        startTime: 520,
        endTime: 575,
        transcript: '女：お茶をどうぞ。\n男：\n1. どういたしまして。\n2. いただきます。\n3. ごちそうさまでした。',
        explanation: 'Khi được mời uống trà "お茶をどうぞ", người nhận đáp lại lịch sự trước khi uống là: "いただきます。" (Cảm ơn, tôi xin phép dùng ạ).'
      },
      {
        questionId: 'N5-008',
        youtubeVideoId: 'I3kvL128MIQ',
        questionType: '問題4',
        question: '「一緒にお昼ご飯を食べに行きませんか。」',
        options: [
          'ええ、行きましょう。',
          'はい、食べました。',
          'いいえ、行きませんでした。'
        ],
        answer: 1,
        startTime: 580,
        endTime: 635,
        transcript: '男：一緒にお昼ご飯を食べに行きませんか。\n女：\n1. ええ、行きましょう。\n2. はい、食べました。\n3. いいえ、行きませんでした。',
        explanation: 'Lời rủ rê: "一緒にお昼ご飯を食べに行きませんか。" (Đi ăn trưa cùng nhau không?). Phản hồi đồng ý tự nhiên nhất là: "ええ、行きましょう。" (Ừ, cùng đi nhé).'
      }
    ]
  },

  // ==========================================
  // N3 Listening 01 - YouTube ID: HG0WgzruVHU / general fallback
  // ==========================================
  {
    id: 'n3-exam-01',
    youtubeVideoId: 'HG0WgzruVHU',
    title: 'N5 Listening 02 - JLPT Choukai Practice Test with Answers',
    level: 'N5',
    questionType: 'Tổng hợp (問題1 - 問題4)',
    description: 'Bộ đề thi tổng hợp kiểm tra độ nhạy bén câu hỏi ngắn và bài hội thoại thường ngày.',
    questions: [
      {
        questionId: 'N5-02-01',
        youtubeVideoId: 'HG0WgzruVHU',
        questionType: '問題1',
        question: '図書館で男の学生と係の人が話しています。学生は何枚コピーしますか。',
        options: [
          '5枚',
          '10枚',
          '15枚',
          '20枚'
        ],
        answer: 2,
        startTime: 45,
        endTime: 120,
        transcript: '学生：すみません、この資料を10部ずつコピーしたいのですが。\n係員：あちらのコピー機をご利用ください。コインを入れて枚数を設定してくださいね。\n学生：分かりました。10枚ですね。',
        explanation: 'Sinh viên muốn photocopy 10 bản tài liệu (10枚).'
      },
      {
        questionId: 'N5-02-02',
        youtubeVideoId: 'HG0WgzruVHU',
        questionType: '問題2',
        question: '女の人と男の人が話しています。男の人はどうして昨日遅刻しましたか。',
        options: [
          '目覚まし時計が壊れたから',
          '電車が遅れたから',
          '道に迷ったから',
          '忘れ物を取りに戻ったから'
        ],
        answer: 2,
        startTime: 125,
        endTime: 200,
        transcript: '女：山田さん、昨日珍しく遅刻したね。どうしたの？\n男：朝、乗った電車が急に止まって30分も動かなかったんだよ。\n女：そうだったんだ。大変だったね。',
        explanation: 'Người nam giải thích tàu điện sáng qua đột ngột dừng lại 30 phút nên anh bị trễ (電車が遅れたから).'
      }
    ]
  }
];

export function getExamByVideoId(videoId: string): ListeningExamData | null {
  if (!videoId) return null;
  return SEED_LISTENING_EXAMS.find(e => e.youtubeVideoId === videoId) || null;
}
