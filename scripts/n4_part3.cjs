// Topics 21 to 30 of JLPT N4
module.exports = [
  {
    topicNumber: 21,
    lessonNumber: 35,
    pattern: "Câu điều kiện ～なら",
    structure: "N / [Thể thông thường (bỏ だ)] + なら",
    meaning: "Nếu là... / Trong trường hợp là... (Tiếp nhận chủ đề để đưa ra lời khuyên, gợi ý)",
    explanation: "Dùng khi người nói tiếp nhận một chủ đề, thông tin từ đối phương đưa ra, rồi dựa trên thông tin đó để đưa ra ý kiến, phán đoán, gợi ý hoặc lời khuyên.",
    exampleJp: "日本料理を食べるなら、あのお店が一番いいですよ。",
    exampleVi: "Nếu là ăn món Nhật thì quán kia là số một đấy nhé.",
    overview: "Mẫu câu điều kiện tiếp nhận chủ đề nổi tiếng trong Minna bài 35. Khác hẳn với と, ば, たら, cấu trúc 〜なら không yêu cầu vế 1 phải xảy ra trước vế 2.",
    formationRules: [
      { partOfSpeech: "Danh từ", rule: "N + なら", example: "パソコンなら (Nếu là máy tính), 京都なら (Nếu là Kyoto)", meaning: "Danh từ ghép trực tiếp với なら" },
      { partOfSpeech: "Động từ thể thông thường", rule: "V-dict / V-ta + なら", example: "行くなら (Nếu bạn định đi), 買ったなら (Nếu bạn đã mua rồi)", meaning: "Động từ thể thường" },
      { partOfSpeech: "Tính từ đuôi い", rule: "A-i + なら", example: "暑いなら (Nếu trời nóng)", meaning: "A-i giữ nguyên" },
      { partOfSpeech: "Tính từ đuôi な", rule: "A-na (bỏ だ) + なら", example: "嫌なら (Nếu không thích), 暇なら (Nếu rảnh)", meaning: "Bỏ だ" }
    ],
    usageGuide: {
      whenToUse: ["1. Bắt lấy từ khóa của đối phương để đưa ra gợi ý, mách nước (A: Tôi muốn mua máy ảnh. B: Nếu là máy ảnh thì hãy tới Akihabara).", "2. Đưa ra điều kiện tiên quyết trước khi hành động xảy ra."],
      whenNotToUse: ["Không dùng cho quy luật tự nhiên hay phản xạ máy móc."],
      subjectConstraint: "Vế 2 thường là lời khuyên, mệnh lệnh, phán đoán của người nói.",
      nuance: "Nhấn mạnh vào chủ đề được đưa ra làm tiền đề."
    },
    notes: [
      "⚠️ Quy luật thời gian đảo ngược: Với 〜たら thì vế 1 bắt buộc xảy ra trước (Vé 1 xong rồi mới đến Vế 2). Nhưng với 〜なら thì hành động ở vế 2 có thể chuẩn bị trước khi vế 1 xảy ra! Ví dụ: '日本へ行くなら、カメラを買ったほうがいい' (Nếu định đi Nhật thì nên mua máy ảnh từ bây giờ).",
      "⚠️ Khẩu hiệu an toàn giao thông nổi tiếng: '飲んだら乗るな、乗るなら飲むな' (Đã uống thì không lái, nếu định lái thì không uống)!"
    ],
    memoryTip: "🧠 Nhớ: 'Tiếp lời đối phương thì dùng NARA; Vế 2 chuẩn bị trước vế 1!'",
    similarGrammars: [
      { similarStructure: "〜たら vs 〜なら", difference: "〜たら: Hành động 1 xong mới làm 2. 〜なら: Chuẩn bị hành động 2 trước khi làm hành động 1.", comparisonExample: "日本へ行ったら、着物を買います。(Đến Nhật rồi mới mua kimono) vs 日本へ行くなら、両替しておきなさい。(Nếu định đi Nhật thì hãy đổi tiền trước từ bây giờ)." }
    ],
    examples: [
      { japanese: "スキーに行くなら、長野県がおすすめです。", vietnamese: "Nếu định đi trượt tuyết thì tỉnh Nagano là nơi rất đáng thử.", explanation: "Đưa ra gợi ý địa điểm bằng 〜なら." },
      { japanese: "わからないなら、先生に聞いてください。", vietnamese: "Nếu không hiểu thì hãy hỏi thầy giáo nhé.", explanation: "Đưa ra lời khuyên mệnh lệnh bằng 〜なら." }
    ],
    exercises: [
      {
        id: "n4_t21_ex1",
        type: "multiple_choice",
        question: "A: '来月北海道へ旅行に行きます。' - B: '北海道へ（　　）、カニを食べたほうがいいですよ。'",
        choices: ["行くなら", "行くと", "行けば", "行ったら"],
        correct_answer: "行くなら",
        explanation: "Tiếp nhận thông tin đối phương vừa nói để đưa ra lời khuyên gợi ý thì dùng '行くなら'."
      }
    ]
  },
  {
    topicNumber: 22,
    lessonNumber: 45,
    pattern: "～場合は",
    structure: "V-thể thường / A-i / A-naな / Nの + 場合(は)",
    meaning: "Trong trường hợp... / Nếu tình huống... xảy ra",
    explanation: "Giả định về một tình huống, sự cố hoặc trường hợp cụ thể có thể xảy ra trong thực tế, thường dùng trong các hướng dẫn, nội quy, biển báo, điều khoản hợp đồng.",
    exampleJp: "火事や地震の場合は、エレベーターを使わないでください。",
    exampleVi: "Trong trường hợp có hỏa hoạn hoặc động đất, xin đừng sử dụng thang máy.",
    overview: "Mẫu câu giả định tình huống trang trọng trong Minna bài 45. Đây là mẫu ngữ pháp tiêu chuẩn trong các bản thông báo khẩn cấp, tài liệu hướng dẫn an toàn nơi công cộng ở Nhật.",
    formationRules: [
      { partOfSpeech: "Động từ thể thông thường", rule: "V-dict / V-ta / V-nai + 場合(は)", example: "遅れる場合 (trong trường hợp đến muộn), 故障した場合 (trong trường hợp bị hỏng)", meaning: "Động từ thể thường" },
      { partOfSpeech: "Tính từ đuôi い", rule: "A-i + 場合(は)", example: "都合が悪い場合 (trong trường hợp không tiện)", meaning: "A-i giữ nguyên" },
      { partOfSpeech: "Tính từ đuôi な", rule: "A-na + な + 場合(は)", example: "必要な場合 (trong trường hợp cần thiết)", meaning: "Thêm な" },
      { partOfSpeech: "Danh từ", rule: "N + の + 場合(は)", example: "事故の場合 (trong trường hợp xảy ra tai nạn)", meaning: "Thêm の" }
    ],
    usageGuide: {
      whenToUse: ["1. Nêu cách xử lý khi gặp tình huống khẩn cấp, sự cố kỹ thuật, thiên tai.", "2. Quy định hợp đồng, điều khoản bảo hành dịch vụ."],
      whenNotToUse: ["Không dùng cho những giả định hoàn toàn viển vông, không có thực (như 'nếu tôi là chim')."],
      subjectConstraint: "Tình huống khách quan có thể xảy ra.",
      nuance: "Trang trọng, quy chuẩn, văn phong thông báo."
    },
    notes: [
      "⚠️ Chú ý cách nối: Danh từ phải có 'の' (雨の場合), Tính từ đuôi な phải có 'な' (暇な場合).",
      "⚠️ Vế sau của 場合は thường là cách xử lý, phương án ứng phó, không dùng ở thì quá khứ."
    ],
    memoryTip: "🧠 Nhớ: 'BAAI là tình huống khẩn cấp; Danh từ thêm NO, Tính từ NA thêm NA!'",
    similarGrammars: [
      { similarStructure: "〜たら", difference: "〜たら dùng tự nhiên trong văn nói thường ngày. 〜場合は trang trọng, mang tính quy định, thông cáo chính thức.", comparisonExample: "雨が降ったら、家にいます (Văn nói thân mật) vs 雨天の場合は、順延いたします (Văn bản thông báo chính thức)." }
    ],
    examples: [
      { japanese: "領収書が必要な場合は、係員にお申し付けください。", vietnamese: "Trong trường hợp cần hóa đơn, xin hãy báo với nhân viên phụ trách.", explanation: "A-na な + 場合は." },
      { japanese: "パスワードを忘れた場合は、こちらをクリックしてください。", vietnamese: "Trong trường hợp quên mật khẩu, xin vui lòng nhấp chuột vào đây.", explanation: "V-ta + 場合は trong giao diện phần mềm." }
    ],
    exercises: [
      {
        id: "n4_t22_ex1",
        type: "multiple_choice",
        question: "Chọn từ thích hợp: 台風（　　）場合は、学校は休みになります。",
        choices: ["の", "な", "だ", "に"],
        correct_answer: "の",
        explanation: "Danh từ 台風 kết hợp với 場合は phải có trợ từ 'の': 台風の場合."
      }
    ]
  },
  {
    topicNumber: 23,
    lessonNumber: 34,
    pattern: "～とき (Quy tắc kết hợp thời gian)",
    structure: "V-dict + とき (Trước khi làm V) vs V-た + とき (Sau khi đã làm V xong)",
    meaning: "Khi / Lúc làm việc gì...",
    explanation: "Quy tắc thời gian giữa việc dùng V thể từ điển hay V thể た trước danh từ 'とき'. Dùng V-dict khi hành động vế 1 chưa hoàn tất; dùng V-た khi hành động vế 1 đã xảy ra xong.",
    exampleJp: "日本へ行くとき、カメラを買いました vs 日本へ行ったとき、カメラを買いました。",
    exampleVi: "Trước khi đi Nhật tôi đã mua máy ảnh (ở VN) vs Khi đã sang tới Nhật rồi tôi mới mua máy ảnh (tại Nhật).",
    overview: "Chuyên đề phân biệt thời điểm hành động với 'とき' trong Minna bài 23 & 34. Đây là một câu hỏi kinh điển mà đề thi JLPT N4 rất thích kiểm tra để phân loại thí sinh.",
    formationRules: [
      { partOfSpeech: "Chưa hoàn tất (trước)", rule: "V thể từ điển (辞書形) + とき", example: "寝るとき、電気を消します (Lúc chuẩn bị ngủ thì tắt đèn - chưa ngủ đã tắt)", meaning: "Hành động chưa diễn ra" },
      { partOfSpeech: "Đã hoàn tất (sau)", rule: "V thể た (過去形) + とき", example: "起きたとき、窓を開けます (Lúc đã thức dậy rồi thì mở cửa sổ)", meaning: "Hành động đã hoàn thành xong" }
    ],
    usageGuide: {
      whenToUse: ["Xác định mốc thời điểm hành động vế 2 diễn ra trước hay sau hành động vế 1."],
      whenNotToUse: ["Tránh nhầm lẫn vị trí mua sắm/hành động dựa trên thể của động từ."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Chính xác về mặt thời gian và thứ tự sự kiện."
    },
    notes: [
      "⚠️ Câu đố kinh điển N4: '国へ帰るとき、お土産を買いました' (Mua quà ở Nhật trước khi về nước) KHÁC VỚI '国へ帰ったとき、お土産を買いました' (Về tới quê hương rồi mới đi mua quà).",
      "⚠️ Trợ từ に: Khi muốn nhấn mạnh thời điểm chính xác tức thì có thể thêm に (〜ときに), nếu là khoảng thời gian kéo dài thì không cần に."
    ],
    memoryTip: "🧠 Nhớ: 'V-dict TOKI là chưa xong việc; V-ta TOKI là việc đã rồi!'",
    similarGrammars: [
      { similarStructure: "〜まえに vs 〜あとで", difference: "V-dict とき tương đương 〜まえに. V-た とき tương đương 〜あとで.", comparisonExample: "ご飯を食べるとき、手を洗います (Trước khi ăn) vs ご飯を食べたとき、薬を飲みます (Sau khi ăn)." }
    ],
    examples: [
      { japanese: "出かけるとき、「行ってきます」と言います。", vietnamese: "Lúc ra khỏi nhà (chuẩn bị đi), người ta nói 'Ittekimasu'.", explanation: "V-dict とき (chưa ra khỏi nhà đã nói)." },
      { japanese: "日本に着いたとき、友達に電話しました。", vietnamese: "Khi đã đến Nhật Bản (đã hạ cánh xong), tôi gọi điện cho bạn bè.", explanation: "V-た とき (đáp máy bay xong mới gọi)." }
    ],
    exercises: [
      {
        id: "n4_t23_ex1",
        type: "multiple_choice",
        question: "Chọn câu đúng để diễn tả: 'Lúc đi ra ngoài (chưa bước ra), tôi đã khóa cửa phòng cẩn thận':",
        choices: [
          "部屋を出るとき、鍵をかけました。",
          "部屋を出たとき、鍵をかけました。",
          "部屋を出るのに、鍵をかけました。",
          "部屋を出たら、鍵をかけました。"
        ],
        correct_answer: "部屋を出るとき、鍵をかけました。",
        explanation: "Khóa cửa trước khi bước ra khỏi phòng nên động từ phải ở thể từ điển: 出るとき."
      }
    ]
  },
  {
    topicNumber: 24,
    lessonNumber: 43,
    pattern: "～よう、～みたい",
    structure: "N + のような / みたいな + N; N + のように / みたいに + V; [Thể thông thường] + ようだ / みたいだ",
    meaning: "Giống như... / Cứ như là... / Có vẻ như... (So sánh ví von & Phỏng đoán)",
    explanation: "Dùng để so sánh ví von hai sự vật có tính chất tương tự (cứ như là...), hoặc đưa ra phán đoán dựa trên cảm giác, trực giác hoặc thông tin quan sát được.",
    exampleJp: "彼女は太陽のように明るい人です。",
    exampleVi: "Cô ấy là một người rạng rỡ tươi sáng giống như ánh mặt trời.",
    overview: "Chuyên đề so sánh ví von và suy đoán trực giác trong Minna bài 43 & 47. 〜ようだ mang tính văn viết, trang trọng; còn 〜みたいだ là dạng khẩu ngữ thân mật thường ngày cực kỳ quen thuộc trong anime, manga.",
    formationRules: [
      { partOfSpeech: "Bổ nghĩa cho Danh từ", rule: "N + のような + N (hoặc N + みたいな + N)", example: "天使のような笑顔 / 天使みたいな笑顔 (Nụ cười như thiên thần)", meaning: "So sánh tính chất" },
      { partOfSpeech: "Bổ nghĩa cho Động từ/Tính từ", rule: "N + のように + V (hoặc N + みたいに + V)", example: "鳥のように飛ぶ / 鳥みたいに飛ぶ (Bay lượn như chim)", meaning: "So sánh cách thức" },
      { partOfSpeech: "Cuối câu kết thúc", rule: "[Thể thông thường] + ようです / みたいです", example: "雨が降っているようです / 雨が降っているみたいです (Hình như trời đang mưa)", meaning: "Phán đoán trực giác" }
    ],
    usageGuide: {
      whenToUse: ["1. So sánh ví von hình ảnh biểu cảm nghệ thuật.", "2. Phỏng đoán dựa trên cảm nhận 5 giác quan hoặc trực giác bản thân."],
      whenNotToUse: ["Tránh dùng 〜みたい với cấp trên trong văn bản hành chính vì mang tính khẩu ngữ suồng sã."],
      subjectConstraint: "Không giới hạn.",
      nuance: "〜よう lịch sự trang trọng; 〜みたい thân mật, tự nhiên."
    },
    notes: [
      "⚠️ Cách nối danh từ: Danh từ đi với よう bắt buộc có 'の' (N + のよう), nhưng đi với みたい thì GHÉP TRỰC TIẾP (N + みたい, KHÔNG CÓ の!). Ví dụ: '子どもみたい', không được nói '子どものみたい'."
    ],
    memoryTip: "🧠 Nhớ: 'YOU thì cần NO (N の よう), MITAI đi liền (N みたい); Giống như chim bay, rực rỡ như hoa!'",
    similarGrammars: [
      { similarStructure: "〜ようだ vs 〜みたいだ", difference: "Về ngữ nghĩa giống hệt nhau. Nhưng ようだ lịch sự, dùng trong văn viết; みたいだ dùng trong giao tiếp khẩu ngữ thân mật.", comparisonExample: "夢のようです。(Văn phong lịch sự) vs 夢みたい！(Khẩu ngữ cảm thán)." }
    ],
    examples: [
      { japanese: "彼は日本人のように上手に日本語を話します。", vietnamese: "Anh ấy nói tiếng Nhật giỏi y như người Nhật vậy.", explanation: "So sánh ví von bằng N + のように + Động từ." },
      { japanese: "隣の部屋に誰もいないみたいです。", vietnamese: "Hình như trong phòng bên cạnh không có ai cả.", explanation: "Suy đoán trực giác bằng みたいです." }
    ],
    exercises: [
      {
        id: "n4_t24_ex1",
        type: "multiple_choice",
        question: "Chọn câu đúng khi dùng みたい với danh từ 'đứa trẻ':",
        choices: ["子どもみたいな話し方", "子どものみたいな話し方", "子どもだみたいな話し方", "子どもなみたいな話し方"],
        correct_answer: "子どもみたいな話し方",
        explanation: "Danh từ ghép trực tiếp với みたい, sau đó bổ nghĩa cho danh từ sau bằng な: 子どもみたいな話し方."
      }
    ]
  },
  {
    topicNumber: 25,
    lessonNumber: 47,
    pattern: "～そうです (Truyền đạt 伝聞 & Trạng thái 様態)",
    structure: "1. Truyền đạt: Thể thông thường + そうです / 2. Trạng thái: V(bỏ ます) / A(bỏ い/な) + そうです",
    meaning: "1. Nghe nói là... (Truyền đạt) / 2. Trông có vẻ... / Sắp... (Trạng thái bề ngoài)",
    explanation: "Chữ そうです có 2 chức năng ngữ pháp hoàn toàn khác nhau tùy thuộc vào cách chia: Chia thể thông thường là 'Nghe nói lại'; Bỏ đuôi ます / い / な là 'Nhìn vẻ bề ngoài phán đoán sắp xảy ra'.",
    exampleJp: "雨が降るそうです (Nghe nói trời sẽ mưa) vs 雨が降りそうです (Trông trời có vẻ sắp mưa).",
    exampleVi: "Nghe dự báo nói trời sẽ mưa (truyền đạt) vs Nhìn trời mây đen ngòm sắp đổ mưa (trạng thái).",
    overview: "Chuyên đề siêu trọng tâm của Minna bài 43 & 47. Sự khác biệt giữa 伝聞 (nghe nói) và 様態 (trông có vẻ) là câu hỏi kinh điển có mặt trong hầu như mọi đề thi JLPT N4.",
    formationRules: [
      { partOfSpeech: "1. Truyền đạt (Nghe nói)", rule: "Thể thông thường (普通形) + そうです", example: "降るそうです (nghe nói sẽ mưa), おいしいそうです (nghe nói ngon), 暇だそうです (nghe nói rảnh)", meaning: "Giữ nguyên thể thông thường" },
      { partOfSpeech: "2. Trạng thái (Trông có vẻ)", rule: "V(bỏ ます) / A-i(bỏ い) / A-na(bỏ な) + そうです", example: "降りそうです (trông sắp mưa), おいしそうです (trông có vẻ ngon), 元気そうです (trông có vẻ khỏe mạnh)", meaning: "Bỏ đuôi ghép そうです" },
      { partOfSpeech: "Ngoại lệ đặc biệt", rule: "いい / よい → よさそうです, ない → なさそうです", example: "よさそうです (trông có vẻ tốt), なさそうです (trông có vẻ không có)", meaning: "Biến âm đặc biệt phải thuộc lòng" }
    ],
    usageGuide: {
      whenToUse: ["1. Truyền đạt: Kể lại thông tin nghe được từ báo đài, thời sự, lời người khác (thường đi với nguồn tin: 〜によると).", "2. Trạng thái: Nhìn trực tiếp bằng mắt thấy sự việc sắp xảy ra hoặc đồ ăn ngon, người khỏe."],
      whenNotToUse: ["Tuyệt đối không dùng trạng thái 'おいしそうです' sau khi ĐÃ NẾM THỬ thức ăn (đã nếm rồi thì phải nói おいしいです).", "Không dùng trạng thái với màu sắc trực quan hiển nhiên (không nói 赤そうです cho quả táo đỏ chót)."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Khách quan truyền tin (Truyền đạt) vs Cảm nhận trực quan tức thời (Trạng thái)."
    },
    notes: [
      "⚠️ Phủ định của Trạng thái: V-masu bỏ ます + そうにない / そうもありません (VD: 雨は止みそうにありません - Trời trông không có vẻ gì là sắp tạnh mưa cả).",
      "⚠️ Hai ngoại lệ sống còn trong JLPT: いい → よさそうです; ない → なさそうです."
    ],
    memoryTip: "🧠 Nhớ: 'Thể thường SOU DESU là nghe người nói; Cắt đuôi SOU DESU là mắt mình trông!'",
    similarGrammars: [
      { similarStructure: "伝聞 (Nghe nói) vs 様態 (Trông có vẻ)", difference: "降るそうです: tai nghe đài nói. 降りそうです: mắt thấy mây đen sấm chớp.", comparisonExample: "明日は暑いそうです (Đài dự báo ngày mai nóng) vs 今日は暑そうですね (Trông mồ hôi nhễ nhại có vẻ nóng bức)." }
    ],
    examples: [
      { japanese: "天気予報によると、明日は雪が降るそうです。", vietnamese: "Theo dự báo thời tiết, nghe nói ngày mai trời sẽ có tuyết rơi.", explanation: "Truyền đạt thông tin từ nguồn 〜によると." },
      { japanese: "このケーキ、とてもおいしそうですね。", vietnamese: "Chiếc bánh ngọt này trông có vẻ ngon quá nhỉ.", explanation: "Trạng thái cảm nhận thị giác bằng おいしそう." }
    ],
    exercises: [
      {
        id: "n4_t25_ex1",
        type: "multiple_choice",
        question: "Dạng đúng của tính từ 'いい' khi chia sang dạng 'Trông có vẻ tốt' là:",
        choices: ["よさそうです", "いいそうです", "いさそうです", "よくそうです"],
        correct_answer: "よさそうです",
        explanation: "Ngoại lệ đặc biệt: tính từ いい chuyển thành よさそうです."
      }
    ]
  },
  {
    topicNumber: 26,
    lessonNumber: 47,
    pattern: "～らしいです",
    structure: "N / [Thể thông thường (bỏ だ)] + らしいです",
    meaning: "Nghe nói là... / Dường như là... / Đúng chất là...",
    explanation: "Đưa ra suy đoán có căn cứ dựa trên những thông tin gián tiếp nghe ngóng được hoặc quan sát được từ môi trường xung quanh, tính khách quan cao.",
    exampleJp: "うわさによると、あの二人は結婚するらしいです。",
    exampleVi: "Theo lời đồn thì dường như hai người đó sắp kết hôn.",
    overview: "Mẫu câu phán đoán dựa trên thông tin gián tiếp trong Minna bài 47. Mang độ tin cậy và khách quan tương đối cao, thường thấy trong các bản tin báo chí hoặc thảo luận đời sống.",
    formationRules: [
      { partOfSpeech: "Danh từ", rule: "N + らしい", example: "雨らしい (hình như trời mưa), 日本人らしい (đúng chất người Nhật)", meaning: "N ghép trực tiếp" },
      { partOfSpeech: "Động từ thể thường", rule: "V-thể thường + らしい", example: "行くらしい (nghe nói sẽ đi), やめたらしい (nghe nói đã nghỉ)", meaning: "Động từ thể thường" },
      { partOfSpeech: "Tính từ đuôi い", rule: "A-i + らしい", example: "忙しいらしい (hình như bận rộn)", meaning: "A-i giữ nguyên" },
      { partOfSpeech: "Tính từ đuôi な", rule: "A-na (bỏ だ) + らしい", example: "親切らしい (dường như rất tốt bụng)", meaning: "Bỏ だ" }
    ],
    usageGuide: {
      whenToUse: ["1. Suy đoán sự việc dựa trên tin đồn hoặc thông tin người khác bàn tán xung quanh.", "2. Mang ý nghĩa 'đúng bản chất, đúng phẩm chất điển hình': N + らしい (VD: 男らしい - ga-lăng nam tính, 子どもらしい - hồn nhiên đúng chất trẻ con)."],
      whenNotToUse: ["Không dùng khi tự mình nhìn thấy sự việc trước mắt."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Khách quan, đáng tin, nghe ngóng từ nhiều phía."
    },
    notes: [
      "⚠️ Cách nối danh từ và tính từ đuôi な: Không có だ (親切らしい, 雨らしい; tuyệt đối không nói 親切だらしい hay 雨だらしい)."
    ],
    memoryTip: "🧠 Nhớ: 'RASHII là nghe ngóng đáng tin cậy; Bỏ DA ghép thẳng với Danh từ!'",
    similarGrammars: [
      { similarStructure: "〜そうです (truyền đạt) vs 〜らしい", difference: "そうです truyền đạt 100% nguyên văn lời nói của nguồn tin. らしい là người nói nghe ngóng xong tự đưa ra phán đoán đánh giá của mình.", comparisonExample: "雨だそうです (Người ta bảo trời mưa) vs 雨らしい (Thấy mọi người mang ô vào, đoán là trời mưa)." }
    ],
    examples: [
      { japanese: "田中さんは最近とても忙しいらしいです。", vietnamese: "Dường như dạo này anh Tanaka rất bận rộn.", explanation: "Suy đoán dựa trên thông tin nghe ngóng." },
      { japanese: "今日は春らしい暖かい日ですね。", vietnamese: "Hôm nay là một ngày ấm áp đúng chất mùa xuân nhỉ.", explanation: "Biểu thị tính chất điển hình bằng N + らしい." }
    ],
    exercises: [
      {
        id: "n4_t26_ex1",
        type: "multiple_choice",
        question: "Chọn dạng đúng: 彼は（　　）らしいです。",
        choices: ["病気", "病気だ", "病気な", "病気で"],
        correct_answer: "病気",
        explanation: "Danh từ ghép trực tiếp với らしい, không có だ hay な: 病気らしいです."
      }
    ]
  },
  {
    topicNumber: 27,
    lessonNumber: 47,
    pattern: "Phân biệt ～よう、～みたい、～そう và ～らしい",
    structure: "Bảng so sánh 4 sắc thái suy đoán: よう (cảm quan cá nhân) / みたい (khẩu ngữ) / そう (trực quan tức thì) / らしい (gián tiếp khách quan)",
    meaning: "Tổng hợp ma trận phân biệt 4 cấu trúc phán đoán hình thái N4",
    explanation: "Tổng hợp bảng so sánh giác quan và hoàn cảnh sử dụng của 4 mẫu câu suy đoán kinh điển, kèm 8 bài tập trắc nghiệm thực tế chuẩn JLPT N4.",
    exampleJp: "おいしそう (nhìn thấy thèm) vs おいしいらしい (nghe đồn là ngon) vs おいしいようだ (cảm nhận chắc là ngon) vs おいしいみたい (khẩu ngữ thân mật).",
    exampleVi: "Nhìn vẻ bề ngoài (そう) vs Nghe nhiều nguồn đồn thổi (らしい) vs Cảm nhận cá nhân (よう) vs Hội thoại hàng ngày (みたい).",
    overview: "Chuyên đề phân biệt 4 mẫu câu suy đoán then chốt nhất trong toàn bộ chương trình N4. Nắm vững ma trận này giúp học viên xử lý trọn vẹn mọi câu hỏi đọc hiểu và ngữ pháp liên quan.",
    formationRules: [
      { partOfSpeech: "～そう (様態)", rule: "V-masu bỏ masu / A bỏ đuôi + そう", example: "雨が降りそう (nhìn mây đen đoán sắp mưa)", meaning: "Trực quan thị giác tức thời" },
      { partOfSpeech: "～らしい", rule: "N / Thể thông thường bỏ だ + らしい", example: "雨らしい (thấy mọi người cầm ô ướt)", meaning: "Thông tin gián tiếp có căn cứ" },
      { partOfSpeech: "～よう", rule: "Nの / Thể thông thường + よう", example: "雨のようだ (cảm nhận thời tiết suy đoán)", meaning: "Cảm quan, suy luận cá nhân" },
      { partOfSpeech: "～みたい", rule: "N / Thể thông thường bỏ だ + みたい", example: "雨みたい (văn nói thân mật của よう)", meaning: "Khẩu ngữ thường ngày" }
    ],
    usageGuide: {
      whenToUse: ["1. Dùng そう khi đánh giá ngay trước mắt bằng mắt nhìn (trông sắp đổ, trông có vẻ nặng).", "2. Dùng らしい khi tổng hợp thông tin nghe được từ người ngoài.", "3. Dùng よう trong văn phong trang trọng, bài luận.", "4. Dùng みたい trong nói chuyện với bạn bè, người thân."],
      whenNotToUse: ["Không nhầm lẫn cách nối đuôi của Danh từ giữa 4 dạng."],
      subjectConstraint: "Tùy thuộc vào góc nhìn của người nói.",
      nuance: "Thị giác (そう) > Tin cậy gián tiếp (らしい) > Cảm quan nội tâm (よう) > Khẩu ngữ (みたい)."
    },
    notes: [
      "⚠️ 8 câu hỏi luyện tập có đáp án chuẩn từ tài liệu:",
      "1. 外が暗くなってきました。雨が（降りそうです）。",
      "2. 先生の話では、試験はそれほど（難しくないそうです）。",
      "3. 彼はまるで何でも知っている（かのように）話します。",
      "4. あの二人は本当に仲がいい（らしいです）。",
      "5. この料理は辛（そう）に見えますが、甘いです。",
      "6. 田中さんは今日は（来ないみたい）ですね。",
      "7. 彼女は子どもの（ような）純粋な心を持っています。",
      "8. 天気予報によると明日は大雨になる（そうです）。"
    ],
    memoryTip: "🧠 Nhớ câu thần chú: 'SOU là mắt nhìn; RASHII là tai nghe; YOU là suy ngẫm; MITAI là văn trò chuyện!'",
    similarGrammars: [
      { similarStructure: "Ma trận 4 giác quan", difference: "Khác biệt về nguồn gốc thông tin: Mắt thấy (そう), Tai nghe (そうです/らしい), Não bộ suy luận (よう/みたい).", comparisonExample: "おいしそう (nhìn bánh) vs おいしいらしい (nghe bạn khen ngon) vs おいしいようだ (đọc thành phần đoán ngon)." }
    ],
    examples: [
      { japanese: "荷物が重そうですね。お持ちしましょうか。", vietnamese: "Hành lý trông có vẻ nặng nhỉ. Tôi xách giúp bạn nhé.", explanation: "Mắt thấy đồ nặng dùng そう." },
      { japanese: "田中さんはもう帰ったらしいです。", vietnamese: "Nghe đồn hình như anh Tanaka đã về rồi.", explanation: "Thu thập thông tin gián tiếp dùng らしい." }
    ],
    exercises: [
      {
        id: "n4_t27_ex1",
        type: "multiple_choice",
        question: "Nhìn thấy bầu trời kéo mây đen kịt và sắp đổ mưa ngay trước mắt, ta nói:",
        choices: ["雨が降りそうです。", "雨が降るそうです。", "雨が降るらしいです。", "雨が降るようです。"],
        correct_answer: "雨が降りそうです。",
        explanation: "Hiện tượng sắp xảy ra ngay trước mắt nhìn thấy bằng thị giác dùng V-masu bỏ ます + そうです: 降りそうです."
      }
    ]
  },
  {
    topicNumber: 28,
    lessonNumber: 42,
    pattern: "～には",
    structure: "N + には / V-dict + のには",
    meaning: "Đối với... / Để mà... thì cần thiết...",
    explanation: "Dùng để biểu thị lập trường, góc nhìn đánh giá ('đối với ai đó thì...'); hoặc biểu thị mục đích cần thiết ('để làm được việc này thì cần...').",
    exampleJp: "この靴は山登りには便利です。",
    exampleVi: "Đôi giày này thì rất tiện lợi cho việc leo núi.",
    overview: "Mẫu trợ từ kép quan trọng trong Minna bài 42, thường đi cùng các tính từ chỉ sự cần thiết, hữu ích (便利, 必要, 役に立つ) hoặc mức độ khó dễ đối với một đối tượng.",
    formationRules: [
      { partOfSpeech: "Danh từ", rule: "N + には", example: "私には難しすぎる (Đối với tôi thì quá khó)", meaning: "Đứng trên lập trường của N" },
      { partOfSpeech: "Động từ", rule: "V-dict + のには", example: "日本で生活するのには、お金がかかる (Để sinh sống ở Nhật thì tốn tiền)", meaning: "Để phục vụ cho mục đích" }
    ],
    usageGuide: {
      whenToUse: ["1. Đưa ra đánh giá dưới góc độ của một đối tượng cụ thể (đối với trẻ con thì cái này nguy hiểm).", "2. Nêu điều kiện hoặc chi phí để hoàn thành một mục đích."],
      whenNotToUse: ["Không nhầm với trợ từ に chỉ thời gian hay địa điểm thuần túy."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Rõ ràng về phạm vi áp dụng."
    },
    notes: [
      "⚠️ Trợ từ は sau に có tác dụng nhấn mạnh chủ đề được đem ra so sánh hoặc đánh giá."
    ],
    memoryTip: "🧠 Nhớ: 'NI WA là đối với tôi; hoặc để hoàn thành mục đích đã đề ra!'",
    similarGrammars: [
      { similarStructure: "〜にとって", difference: "〜にとって chỉ lập trường đánh giá (đối với tôi). 〜には dùng được cho cả lập trường lẫn mục đích thao tác đồ vật.", comparisonExample: "私にとって大切な人 (Người quan trọng với tôi) vs 切るのにはハサミを使う (Dùng kéo để cắt)." }
    ],
    examples: [
      { japanese: "健康を維持するには、適度な運動が必要です。", vietnamese: "Để duy trì sức khỏe thì việc vận động điều độ là rất cần thiết.", explanation: "Mục đích bằng V-dict + には." },
      { japanese: "外国人には日本の生活習慣が珍しいです。", vietnamese: "Đối với người nước ngoài thì tập quán sinh hoạt Nhật Bản rất mới lạ.", explanation: "Lập trường đối tượng bằng N + には." }
    ],
    exercises: [
      {
        id: "n4_t28_ex1",
        type: "multiple_choice",
        question: "Chọn từ đúng: 東京へ行く（　　）、新幹線が一番便利です。",
        choices: ["のには", "のでは", "のにも", "のにが"],
        correct_answer: "のには",
        explanation: "Để làm mục đích đi Tokyo thì shinkansen tiện nhất: 東京へ行くのには."
      }
    ]
  },
  {
    topicNumber: 29,
    lessonNumber: 44,
    pattern: "～にする",
    structure: "1. N + にする / 2. V-dict + ことにする",
    meaning: "1. Quyết định chọn... (món ăn, đồ vật) / 2. Quyết định làm việc gì...",
    explanation: "Dùng khi người nói đưa ra lựa chọn, quyết định từ nhiều phương án khác nhau (chọn món trong nhà hàng) hoặc tự quyết định thực hiện một hành động (ことにする).",
    exampleJp: "私はコーヒーにします。",
    exampleVi: "Tôi xin chọn cà phê (gọi món).",
    overview: "Mẫu câu chọn lựa và quyết định trong Minna bài 44. Cực kỳ quen thuộc khi đi ăn nhà hàng, mua sắm hoặc đặt ra kế hoạch tương lai.",
    formationRules: [
      { partOfSpeech: "Chọn danh từ / món đồ", rule: "N + にする / にします", example: "ラーメンにします (Tôi chọn mì ramen)", meaning: "Quyết định lấy N" },
      { partOfSpeech: "Quyết định hành động", rule: "V-dict / V-nai + ことにする", example: "毎朝走ることにしました (Tôi quyết định mỗi sáng sẽ chạy bộ)", meaning: "Tự quyết định làm V" }
    ],
    usageGuide: {
      whenToUse: ["1. Gọi món ở nhà hàng, quán ăn, quán cà phê.", "2. Đưa ra quyết định mua món đồ nào giữa các lựa chọn.", "3. Quyết định thay đổi thói quen lối sống (ことにする)."],
      whenNotToUse: ["Không nhầm với 〜になる (trở thành trạng thái tự nhiên)."],
      subjectConstraint: "Chủ thể đưa ra quyết định có ý chí.",
      nuance: "Chủ động, có tính lựa chọn dứt khoát."
    },
    notes: [
      "⚠️ Phân biệt sống còn: '〜にする' là con người CHỦ ĐỘNG quyết định (VD: コーヒーにする); còn '〜になる' là kết quả TỰ BIẾN ĐỔI khách quan (VD: 春になる - trời sang xuân)."
    ],
    memoryTip: "🧠 Nhớ: 'Gọi món chọn đồ thì dùng NI SURU; Quyết tâm hành động dùng KOTO NI SURU!'",
    similarGrammars: [
      { similarStructure: "〜ことにする vs 〜ことになる", difference: "〜ことにする là tự bản thân tôi quyết định. 〜ことになる là quyết định của tập thể, cơ quan, công ty phân công (tôi chỉ tuân theo).", comparisonExample: "大阪へ転勤することにしました (Tôi tự xin chuyển đi) vs 大阪へ転勤することになりました (Công ty ra quyết định điều chuyển tôi đi)." }
    ],
    examples: [
      { japanese: "昼ご飯は何にしますか。うどんにします。", vietnamese: "Bữa trưa bạn chọn món gì? Tôi chọn mì Udon.", explanation: "Chọn món bằng N + にします." },
      { japanese: "今年からタバコをやめることにしました。", vietnamese: "Từ năm nay tôi quyết định sẽ cai thuốc lá.", explanation: "Quyết tâm hành động bằng ことにしました." }
    ],
    exercises: [
      {
        id: "n4_t29_ex1",
        type: "multiple_choice",
        question: "Ở quán nước, khi người phục vụ hỏi: 'ご注文は何にしますか', bạn muốn chọn hồng trà thì trả lời:",
        choices: ["紅茶にします。", "紅茶になります。", "紅茶にあります。", "紅茶にいきます。"],
        correct_answer: "紅茶にします。",
        explanation: "Chọn món đồ ăn thức uống dùng công thức 'N + にします': 紅茶にします."
      }
    ]
  },
  {
    topicNumber: 30,
    lessonNumber: 44,
    pattern: "Tính từ + する (Làm cho...)",
    structure: "A-i (bỏ い) + く + する / A-na (bỏ な) + に + する",
    meaning: "Làm cho... trở nên... / Làm biến đổi tính chất...",
    explanation: "Biểu thị tác động có chủ ý của con người làm biến đổi trạng thái, kích thước, số lượng hoặc tính chất của một sự vật.",
    exampleJp: "部屋をきれいにしてください。",
    exampleVi: "Xin hãy dọn dẹp phòng cho sạch sẽ.",
    overview: "Mẫu câu tác động biến đổi tính chất trong Minna bài 44. Thể hiện sự chủ động của con người đối lập với sự biến đổi tự nhiên của cấu trúc 'Tính từ + なる'.",
    formationRules: [
      { partOfSpeech: "Tính từ đuôi い", rule: "A-i (bỏ い) + く + する", example: "安くする (làm cho rẻ đi / giảm giá), 短くする (cắt ngắn đi), 音を小さくする (vặn nhỏ âm thanh)", meaning: "Đổi đuôi い thành く + する" },
      { partOfSpeech: "Tính từ đuôi な", rule: "A-na (bỏ な) + に + する", example: "静かにする (làm cho trật tự), きれいにする (làm sạch sẽ), 簡単にする (làm đơn giản hóa)", meaning: "Đổi đuôi な thành に + する" }
    ],
    usageGuide: {
      whenToUse: ["Yêu cầu hoặc hành động điều chỉnh âm lượng, độ dài, màu sắc, giá cả, mức độ sạch sẽ của sự vật."],
      whenNotToUse: ["Không dùng cho sự biến đổi tự nhiên của thời tiết hay tuổi tác (trời trở lạnh tự nhiên phải dùng 寒くなる)."],
      subjectConstraint: "Con người thực hiện hành động tác động.",
      nuance: "Chủ động, có hành động cụ thể."
    },
    notes: [
      "⚠️ Khẩu lệnh kinh điển trong lớp học: '静かにしてください！' (Xin hãy trật tự!)."
    ],
    memoryTip: "🧠 Nhớ: 'A-i đổi KU SURU; A-na đổi NI SURU; Con người ra tay biến đổi vạn vật!'",
    similarGrammars: [
      { similarStructure: "Tính từ + する vs Tính từ + なる", difference: "Tính từ + する: con người tác động (tha động từ). Tính từ + なる: tự nhiên biến đổi (tự động từ).", comparisonExample: "部屋を暖かくします (Tôi bật lò sưởi làm ấm phòng) vs 部屋が暖かくなりました (Phòng tự ấm lên rồi)." }
    ],
    examples: [
      { japanese: "テレビの音をもう少し大きくしてください。", vietnamese: "Xin hãy vặn âm thanh tivi to hơn một chút nữa.", explanation: "A-i: 大きくする." },
      { japanese: "髪を短く切りました。", vietnamese: "Tôi đã cắt tóc cho ngắn đi.", explanation: "Tác động làm ngắn bằng 短くする." }
    ],
    exercises: [
      {
        id: "n4_t30_ex1",
        type: "multiple_choice",
        question: "Chọn câu đúng khi bảo học sinh 'Hãy giữ trật tự':",
        choices: ["静かにしてください。", "静かくしてください。", "静かになってください。", "静かのにしてください。"],
        correct_answer: "静かにしてください。",
        explanation: "Tính từ đuôi な khi đi với する phải đổi 'な' thành 'に': 静かにしてください."
      }
    ]
  }
];
