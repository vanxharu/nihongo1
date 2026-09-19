// Topics 41 to 49 of JLPT N4
module.exports = [
  {
    topicNumber: 41,
    lessonNumber: 30,
    pattern: "～てある",
    structure: "N + が + Tha động từ thể て + ある / あります",
    meaning: "Được làm sẵn (Trạng thái có chủ đích chuẩn bị của con người)",
    explanation: "Diễn tả một trạng thái hiện hữu là kết quả của một hành động do ai đó đã thực hiện có mục đích, có chủ ý từ trước.",
    exampleJp: "カレンダーに今月の予定が書いてあります。",
    exampleVi: "Trên tờ lịch có ghi sẵn kế hoạch của tháng này.",
    overview: "Mẫu câu chỉ trạng thái chuẩn bị có chủ đích trong Minna bài 30. Luôn đi với Tha động từ và trợ từ が, tạo nên sự đối ứng hoàn hảo với tự động từ đi với ています.",
    formationRules: [
      { partOfSpeech: "Tha động từ", rule: "N + が + Tha động từ thể て + あります", example: "壁に絵が掛けてあります (Trên tường có treo sẵn bức tranh)", meaning: "Vật mang trạng thái chuẩn bị" }
    ],
    usageGuide: {
      whenToUse: ["Miêu tả trạng thái đồ vật đã được con người sắp đặt, chuẩn bị sẵn phục vụ cho một mục đích nào đó."],
      whenNotToUse: ["TUYỆT ĐỐI KHÔNG dùng Tự động từ với てある (không được nói ドアが開いてある)."],
      subjectConstraint: "Đồ vật là chủ ngữ đi với が.",
      nuance: "Chủ đích, chuẩn bị sẵn, con người đã tác động."
    },
    notes: [
      "⚠️ Ma trận so sánh vàng Minna 29-30:",
      "1. 窓が開いています (Cửa sổ đang mở - Tự động từ + ている: chỉ thuần túy miêu tả hiện trạng tự nhiên).",
      "2. 窓が開けてあります (Cửa sổ đang được mở sẵn - Tha động từ + てある: ai đó đã cố tình mở ra để đón gió).",
      "⚠️ Trợ từ luôn chuyển thành が: 予定を書きます → 予定が書いてあります."
    ],
    memoryTip: "🧠 Nhớ: 'THA ĐỘNG TỪ đi với TE ARU; Trợ từ biến thành GÁ; có ai đó làm sẵn chờ ta!'",
    similarGrammars: [
      { similarStructure: "〜ています (tự động từ) vs 〜てあります (tha động từ)", difference: "ています: hiện trạng khách quan. てあります: có chủ đích sắp đặt của con người.", comparisonExample: "電気がついています (Đèn sáng) vs 電気がつけてあります (Đèn đã được bật sẵn chờ khách)." }
    ],
    examples: [
      { japanese: "机の上にメモが置いてあります。", vietnamese: "Trên bàn có đặt sẵn tờ giấy ghi chú.", explanation: "Tha động từ 置く + てあります." },
      { japanese: "パーティーの準備はもうしてあります。", vietnamese: "Sự chuẩn bị cho bữa tiệc thì đã được làm sẵn rồi.", explanation: "Làm sẵn bằng してあります." }
    ],
    exercises: [
      {
        id: "n4_t41_ex1",
        type: "multiple_choice",
        question: "Chọn từ đúng: 黒板に文字が（　　）あります。",
        choices: ["書いて", "書かれて", "書く", "書いた"],
        correct_answer: "書いて",
        explanation: "Tha động từ 書く chia thể て kết hợp với あります: 書いてあります."
      }
    ]
  },
  {
    topicNumber: 42,
    lessonNumber: 30,
    pattern: "～ておく",
    structure: "V-て + おく / おきます (Khẩu ngữ: とく / どく)",
    meaning: "1. Làm sẵn trước để chuẩn bị / 2. Làm để giữ nguyên trạng thái",
    explanation: "Diễn tả hành động làm trước một việc gì đó để chuẩn bị cho một thời điểm hoặc mục đích tiếp theo; hoặc giữ nguyên một hiện trạng không thay đổi.",
    exampleJp: "旅行の前に、ホテルの予約をしておきます。",
    exampleVi: "Trước chuyến đi du lịch, tôi sẽ đặt phòng khách sạn sẵn.",
    overview: "Mẫu câu chuẩn bị chủ động trong Minna bài 30. Trong khẩu ngữ đời sống, '〜ておく' thường được người Nhật rút gọn thành '〜とく'.",
    formationRules: [
      { partOfSpeech: "Chuẩn bị trước", rule: "V-て + おきます", example: "買っておく (mua sẵn), 調べておく (tra cứu trước)", meaning: "Hành động chuẩn bị tương lai" },
      { partOfSpeech: "Giữ nguyên trạng thái", rule: "V-て + おいてください", example: "窓を開けておいてください (Xin hãy cứ để cửa sổ mở nguyên như thế)", meaning: "Duy trì hiện trạng" },
      { partOfSpeech: "Khẩu ngữ thân mật", rule: "〜ておく → 〜とく / 〜でおく → 〜どく", example: "買っとく (mua trước nhé), 読んどく (đọc trước nhé)", meaning: "Cách nói ngắn gọn" }
    ],
    usageGuide: {
      whenToUse: ["1. Chuẩn bị trước tài liệu trước cuộc họp, chuẩn bị nguyên liệu trước khi nấu ăn.", "2. Dọn dẹp đồ đạc về vị trí cũ sau khi dùng xong (片付けておく).", "3. Cứ để nguyên đồ đạc như thế (そのままにしておいてください)."],
      whenNotToUse: ["Không dùng cho những hành động bộc phát tức thời không nhằm chuẩn bị cho điều gì."],
      subjectConstraint: "Con người chủ động thực hiện.",
      nuance: "Chủ động, chu đáo, có sự chuẩn bị."
    },
    notes: [
      "⚠️ Khẩu ngữ: ておく biến thành とく (見とく, 買っとく, 行っとく); でおく biến thành どく (飲んどく, 読んどく)."
    ],
    memoryTip: "🧠 Nhớ: 'TE OKU là lo xa chuẩn bị; Khẩu ngữ rút gọn thành TOKU!'",
    similarGrammars: [
      { similarStructure: "〜ておく vs 〜てある", difference: "〜ておく là hành vi con người đi làm sự chuẩn bị (Tôi đặt phòng trước). 〜てある là kết quả hiện hữu của sự chuẩn bị đó (Phòng đã được đặt sẵn).", comparisonExample: "チケットを買っておきます (Tôi sẽ mua vé trước) vs チケットが買ってあります (Vé đã được mua sẵn rồi)." }
    ],
    examples: [
      { japanese: "会議の前に資料をコピーしておいてください。", vietnamese: "Xin hãy photo sẵn tài liệu trước cuộc họp nhé.", explanation: "Chuẩn bị trước bằng ておいてください." },
      { japanese: "まだ使いますから、そのままにしておいてください。", vietnamese: "Vì tôi vẫn còn dùng nên xin hãy cứ để nguyên như thế nhé.", explanation: "Giữ nguyên hiện trạng." }
    ],
    exercises: [
      {
        id: "n4_t42_ex1",
        type: "multiple_choice",
        question: "Dạng khẩu ngữ của '準備しておきます' là:",
        choices: ["準備しときます", "準備しちゃいます", "準備しちゃきます", "準備しとけます"],
        correct_answer: "準備しときます",
        explanation: "Cụm しておきます chuyển sang khẩu ngữ rút gọn thành しときます."
      }
    ]
  },
  {
    topicNumber: 43,
    lessonNumber: 32,
    pattern: "～かもしれません、～はずです",
    structure: "1. [Thể thông thường (bỏ だ)] + かもしれません (Có lẽ ~50%) / 2. [Thể thông thường (A-naな/Nの)] + はずです (Chắc chắn logic)",
    meaning: "1. Có thể / Có lẽ... vs 2. Chắc chắn / Chắc hẳn là... (Logic có căn cứ)",
    explanation: "Hai cấp độ phán đoán logic then chốt của N4: 'かもしれません' biểu thị khả năng phỏng đoán mơ hồ khoảng 50-50; 'はずです' biểu thị sự chắc chắn dựa trên lý lẽ, bằng chứng hoặc lịch trình định sẵn.",
    exampleJp: "午後は雨が降るかもしれません vs 田中さんは今日来るはずです。",
    exampleVi: "Chiều nay có lẽ trời sẽ mưa (~50%) vs Anh Tanaka chắc chắn sẽ đến vì hôm qua anh ấy đã hứa (logic).",
    overview: "Chuyên đề Phán đoán xác suất và căn cứ logic trong Minna bài 32 & 46. Luôn là nội dung trọng điểm phân loại thí sinh trong phần đọc hiểu JLPT.",
    formationRules: [
      { partOfSpeech: "～かもしれません", rule: "[Thể thông thường (A-na / N bỏ だ)] + かもしれません", example: "雨かもしれません (có lẽ trời mưa), 暇かもしれません (có lẽ rảnh)", meaning: "Xác suất ~50%, có thể xảy ra hoặc không" },
      { partOfSpeech: "～はずです", rule: "[Thể thông thường (A-na + な / N + の)] + はずです", example: "来るはずです (chắc chắn sẽ tới), 休みなはずです (chắc chắn rảnh), 日本人の相談のはずです", meaning: "Chắc chắn dựa trên lý lẽ khách quan" }
    ],
    usageGuide: {
      whenToUse: ["1. Dùng かもしれません khi phòng ngừa rủi ro, dự đoán có khả năng xảy ra điều xấu.", "2. Dùng はずです khi có bằng chứng, giấy tờ, lịch hẹn cụ thể và sự việc hợp logic đương nhiên."],
      whenNotToUse: ["Không dùng はずです khi suy đoán bừa bãi không có bất kỳ cơ sở nào."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Có lẽ, thận trọng (かもしれません) vs Tự tin, logic (はずです)."
    },
    notes: [
      "⚠️ Cách nối với Danh từ:",
      "1. N + かもしれません (KHÔNG CÓ だ: 雨かもしれません).",
      "2. N + の + はずです (CÓ TRỢ TỪ の: 休みのતずです).",
      "⚠️ Khẩu ngữ của かもしれません là 'かも / かもね' (VD: 明日雨かも - Mai có khi mưa đấy)."
    ],
    memoryTip: "🧠 Nhớ: 'KAMOSHIREMASEN là năm ăn năm thua; HAZU DESU là chắc mẩm có sách mách có chứng!'",
    similarGrammars: [
      { similarStructure: "〜でしょう vs 〜はずです", difference: "〜でしょう là phán đoán chủ quan kèm ngữ điệu hỏi. 〜はずです là khẳng định dựa trên tính toán suy luận chắc chắn.", comparisonExample: "明日は暑いでしょう (Chắc mai nóng nhỉ) vs 鍵はポケットにあるはずです (Chìa khóa chắc chắn trong túi vì vừa cất vào xong)." }
    ],
    examples: [
      { japanese: "約束したから、彼は必ず来るはずです。", vietnamese: "Vì đã hứa rồi nên chắc chắn anh ấy sẽ đến.", explanation: "Có căn cứ lời hứa nên dùng はずです." },
      { japanese: "道が混んでいるので、遅れるかもしれません。", vietnamese: "Vì đường đang tắc nên có thể tôi sẽ đến muộn.", explanation: "Dự đoán rủi ro bằng かもしれません." }
    ],
    exercises: [
      {
        id: "n4_t43_ex1",
        type: "multiple_choice",
        question: "Chọn cách nối đúng với danh từ '病気' trước はずです:",
        choices: ["病気のはずです", "病気はずです", "病気なはずです", "病気だはずです"],
        correct_answer: "病気のはずです",
        explanation: "Danh từ nối với はずです bằng trợ từ 'の': 病気のはずです."
      }
    ]
  },
  {
    topicNumber: 44,
    lessonNumber: 40,
    pattern: "～てみる",
    structure: "V-て + みる / みます",
    meaning: "Thử làm việc gì xem sao",
    explanation: "Thực hiện một hành động nào đó với tâm thế thử nghiệm, trải nghiệm để xem kết quả, hương vị hoặc cảm giác ra sao.",
    exampleJp: "日本の着物を着てみたいです。",
    exampleVi: "Tôi muốn mặc thử trang phục Kimono của Nhật Bản xem sao.",
    overview: "Mẫu câu thử nghiệm trong Minna bài 40. Rất hay kết hợp với '〜たい' thành '〜てみたい' (muốn thử làm gì đó một lần trong đời).",
    formationRules: [
      { partOfSpeech: "Động từ", rule: "V-て + みる / みます / みて", example: "食べてみる (ăn thử), 行ってみる (đi thử), やってみる (làm thử)", meaning: "Động từ thể て + みる" }
    ],
    usageGuide: {
      whenToUse: ["1. Thử món ăn mới, mặc thử quần áo (được viết bằng chữ Hiragana: みる, không dùng Kanji 見る).", "2. Khuyên người khác hãy dũng cảm thử sức: やってみてください."],
      whenNotToUse: ["Tránh viết chữ 'みる' bằng chữ Hán '見る' khi mang nghĩa ngữ pháp là 'thử'."],
      subjectConstraint: "Người thực hiện trải nghiệm.",
      nuance: "Khám phá, thử nghiệm, tò mò."
    },
    notes: [
      "⚠️ Chú ý chữ viết: Chữ 'みる' trong 〜てみる bắt buộc viết bằng Hiragana (không viết là 食べて見る)."
    ],
    memoryTip: "🧠 Nhớ: 'TE MIRU là thử một phen; Viết bằng Hiragana chớ dùng chữ Hán!'",
    similarGrammars: [
      { similarStructure: "〜てみる vs 〜て見せる", difference: "てみる là thử làm. て見せる là làm cho người khác xem (biểu diễn hoặc chứng minh thực lực).", comparisonExample: "料理を作ってみる (Nấu thử ăn xem sao) vs 料理を作って見せる (Nấu trổ tài cho mọi người lác mắt xem)." }
    ],
    examples: [
      { japanese: "おいしそうな料理ですね。一口食べてみます。", vietnamese: "Món ăn trông ngon quá. Tôi ăn thử một miếng xem sao.", explanation: "Trải nghiệm ăn thử bằng 食べてみます." },
      { japanese: "このズボン、サイズが合うかどうか履いてみてもいいですか。", vietnamese: "Chiếc quần này, tôi có thể mặc thử xem có vừa kích cỡ không được không ạ?", explanation: "Xin phép mặc thử bằng 履いてみる." }
    ],
    exercises: [
      {
        id: "n4_t44_ex1",
        type: "multiple_choice",
        question: "Muốn nói 'Tôi muốn đi thử Nhật Bản một lần xem sao':",
        choices: ["日本へ行ってみたいです。", "日本へ行ってみます。", "日本へ行くみたいです。", "日本へ行ってみたです。"],
        correct_answer: "日本へ行ってみたいです。",
        explanation: "Thử làm kết hợp với mong muốn たい: 行ってみたいです."
      }
    ]
  },
  {
    topicNumber: 45,
    lessonNumber: 26,
    pattern: "～たらいいですか / たらどうですか",
    structure: "1. [Từ để hỏi] + V-た + らいいですか (Hỏi lời khuyên) / 2. V-た + らどうですか (Gợi ý, khuyên bảo)",
    meaning: "1. Nên làm thế nào thì tốt? vs 2. Sao bạn không thử làm... xem sao?",
    explanation: "Hai mẫu câu đưa ra và tiếp nhận lời khuyên đắt giá trong giao tiếp: 'たらいいですか' dùng khi người nói bế tắc cần sự chỉ dẫn; 'たらどうですか' dùng khi gợi ý cho người khác một giải pháp khả thi.",
    exampleJp: "どこでカメラを買ったらいいですか vs 先生に相談したらどうですか。",
    exampleVi: "Tôi nên mua máy ảnh ở đâu thì tốt? vs Sao bạn không thử thảo luận với thầy giáo xem sao?",
    overview: "Bộ đôi hỏi và khuyên trong Minna bài 26 & 32. Đặc biệt mẫu '〜たらいいですか' thường xuyên đi kèm cấu trúc mở đầu '〜んですが' để tạo nên đoạn hội thoại nhờ vả chuẩn mực Nhật Bản.",
    formationRules: [
      { partOfSpeech: "Hỏi xin lời khuyên", rule: "[Từ để hỏi (どこ/どう/何)] + V-た + らいいですか", example: "どうしたらいいですか (Tôi nên làm thế nào đây?)", meaning: "Xin lời khuyên" },
      { partOfSpeech: "Gợi ý đối phương", rule: "V-た + らどうですか", example: "薬を飲んだらどうですか (Sao bạn không uống thuốc đi?)", meaning: "Đề xuất phương án" }
    ],
    usageGuide: {
      whenToUse: ["1. Khi gặp khó khăn, không biết cách giải quyết cần người khác tư vấn.", "2. Đưa ra gợi ý nhẹ nhàng cho người đang gặp rắc rối."],
      whenNotToUse: ["Tránh dùng 'たらどうですか' với cấp trên vì vẫn mang tính khuyên bảo chỉ đường."],
      subjectConstraint: "Tôi (xin lời khuyên) vs Bạn (gợi ý đối phương).",
      nuance: "Cầu thị (たらいいですか) vs Thân thiện, gợi mở (たらどうですか)."
    },
    notes: [
      "⚠️ Combo thần thánh N4: [Bối cảnh]〜んですが、どうしたらいいですか (VD: 財布を落としたんですが、どうしたらいいですか - Tôi bị rơi mất ví, tôi nên làm thế nào bây giờ ạ?)."
    ],
    memoryTip: "🧠 Nhớ: 'Bế tắc hỏi TARA II DESU KA; Mách nước khuyên bạn TARA DOU DESU KA!'",
    similarGrammars: [
      { similarStructure: "〜ほうがいいです", difference: "ほうがいい là lời khuyên mang tính khẳng định mạnh mẽ. たらどうですか là gợi ý nhẹ nhàng, để ngỏ cho đối phương tự quyết định.", comparisonExample: "早く寝たほうがいい (Khuyên dứt khoát) vs 早く寝たらどうですか (Gợi ý nhẹ nhàng)." }
    ],
    examples: [
      { japanese: "頭が痛いなら、少し横になったらどうですか。", vietnamese: "Nếu bị đau đầu thì sao bạn không thử nằm nghỉ một lát xem sao?", explanation: "Gợi ý bằng たらどうですか." },
      { japanese: "日本語が上手になりたいんですが、どうやって勉強したらいいですか。", vietnamese: "Tôi muốn giỏi tiếng Nhật, tôi nên học thế nào thì tốt ạ?", explanation: "Hỏi xin phương pháp bằng したらいいですか." }
    ],
    exercises: [
      {
        id: "n4_t45_ex1",
        type: "multiple_choice",
        question: "Chọn từ đúng: パスポートを更新したいんですが、どこへ（　　）いいですか。",
        choices: ["行ったら", "行くと", "行けば", "行くなら"],
        correct_answer: "行ったら",
        explanation: "Hỏi xin lời khuyên chuẩn mực dùng cấu trúc: V-た + らいいですか."
      }
    ]
  },
  {
    topicNumber: 46,
    lessonNumber: 26,
    pattern: "～ていただけませんか",
    structure: "V-て + いただけませんか (hoặc V-て + くださいませんか / てもらえませんか)",
    meaning: "Làm ơn giúp tôi... có được không ạ? (Nhờ vả lịch sự tối đa)",
    explanation: "Mẫu câu nhờ vả, yêu cầu người khác làm việc gì giúp mình với thái độ cung kính, lịch thiệp và tôn trọng bậc nhất ở cấp độ N4.",
    exampleJp: "もう一度説明していただけませんか。",
    exampleVi: "Thầy/anh có thể làm ơn giải thích lại một lần nữa giúp tôi được không ạ?",
    overview: "Mẫu câu nhờ vả lịch thiệp đỉnh cao trong Minna bài 26. Là mẫu câu cứu cánh của mọi du học sinh và nhân viên khi cần nhờ người Nhật bản xứ giúp đỡ.",
    formationRules: [
      { partOfSpeech: "Mức độ lịch sự tối đa (N4)", rule: "V-て + いただけませんか", example: "教えていただけませんか (Làm ơn chỉ dạy giúp tôi)", meaning: "Dùng với sếp, thầy cô, người lạ" },
      { partOfSpeech: "Mức độ lịch sự vừa phải", rule: "V-て + くださいませんか", example: "手伝ってくださいませんか (Bạn giúp tôi được không)", meaning: "Lịch sự với đồng nghiệp" },
      { partOfSpeech: "Mức độ thân mật", rule: "V-て + もらえない？ / てくれない？", example: "教えてくれない？ (Chỉ cho mình với)", meaning: "Dùng với bạn bè thân" }
    ],
    usageGuide: {
      whenToUse: ["Nhờ vả sếp, cấp trên, giáo viên, đối tác khách hàng hoặc người lạ trên đường."],
      whenNotToUse: ["Không dùng với bạn bè thân thiết hoặc người trong gia đình vì quá khách sáo, xa cách."],
      subjectConstraint: "Đối phương là người thực hiện hành động giúp đỡ.",
      nuance: "Cực kỳ cung kính, nhã nhặn, tôn trọng đối phương tối đa."
    },
    notes: [
      "⚠️ Cấp bậc lịch sự tăng dần:",
      "〜てください (Hãy làm - mệnh lệnh nhẹ) < 〜てくださいませんか < 〜ていただけませんか (Cung kính nhất N4)."
    ],
    memoryTip: "🧠 Nhớ: 'Nhờ sếp chỉ dạy, nhờ thầy ra tay: Cứ TE ITADAKEMASEN KA là điểm mười lịch sự!'",
    similarGrammars: [
      { similarStructure: "〜てください", difference: "てください là yêu cầu trực tiếp. ていただけませんか là hỏi xem đối phương có thể hạ cố giúp mình được không, cho phép đối phương quyền từ chối nếu bận.", comparisonExample: "書いてください (Xin hãy viết) vs 書いていただけませんか (Làm ơn viết giúp tôi có được không ạ)." }
    ],
    examples: [
      { japanese: "すみませんが、写真を撮っていただけませんか。", vietnamese: "Xin lỗi, anh có thể làm ơn chụp giúp tôi một tấm ảnh được không ạ?", explanation: "Nhờ người lạ trên đường bằng ていただけませんか." },
      { japanese: "日本語の手紙をチェックしていただけませんか。", vietnamese: "Thầy có thể kiểm tra giúp em bức thư tiếng Nhật này được không ạ?", explanation: "Nhờ vả thầy giáo." }
    ],
    exercises: [
      {
        id: "n4_t46_ex1",
        type: "multiple_choice",
        question: "Cách nhờ vả lịch sự nhất khi nhờ sếp ký tài liệu là:",
        choices: [
          "サインしていただけませんか。",
          "サインしてください。",
          "サインしてくれ。",
          "サインしなさい。"
        ],
        correct_answer: "サインしていただけませんか。",
        explanation: "Mẫu câu nhờ vả tôn kính và trang trọng nhất đối với cấp trên là 〜ていただけませんか."
      }
    ]
  },
  {
    topicNumber: 47,
    lessonNumber: 40,
    pattern: "～か / ～かどうか",
    structure: "1. [Từ để hỏi] + [Thể thông thường (bỏ だ)] + か / 2. [Thể thông thường (bỏ だ)] + かどうか",
    meaning: "1. ...hay không (Câu hỏi lồng có từ để hỏi) / 2. Có... hay là không (Câu hỏi lồng Yes/No)",
    explanation: "Lồng một câu nghi vấn vào bên trong một câu lớn đóng vai trò làm thành phần phụ (như tân ngữ hoặc bổ ngữ cho động từ chính 調べる, 聞く, 忘れる).",
    exampleJp: "彼が何時に来るか知っていますか vs 明日雨が降るかどうか分かりません。",
    exampleVi: "Bạn có biết mấy giờ anh ấy đến không? (từ để hỏi) vs Tôi không biết ngày mai trời có mưa hay không (Yes/No).",
    overview: "Chuyên đề Câu hỏi lồng trong Minna bài 40. Rất quan trọng khi truyền đạt sự không chắc chắn hoặc kiểm tra thông tin trong công việc.",
    formationRules: [
      { partOfSpeech: "Có từ để hỏi (5W1H)", rule: "[Từ để hỏi] + [Thể thông thường (A-na/N bỏ だ)] + か", example: "どこへ行くか / 誰が来るか / 何を食べたか", meaning: "Câu hỏi lồng mở" },
      { partOfSpeech: "Không có từ để hỏi (Yes/No)", rule: "[Thể thông thường (A-na/N bỏ だ)] + かどうか", example: "正しいかどうか / 間に合うかどうか", meaning: "Lựa chọn có hoặc không" }
    ],
    usageGuide: {
      whenToUse: ["1. Có từ để hỏi: Đi với 誰, 何, いつ, どこ, どう + [Thể thường] + か.", "2. Không có từ để hỏi: Đi với [Thể thường] + かどうか."],
      whenNotToUse: ["CẢ HAI DẠNG: Tính từ đuôi な và Danh từ thể khẳng định hiện tại BẮT BUỘC BỎ だ (VD: 暇かどうか, 雨かどうか; KHÔNG CÓ だ!)."],
      subjectConstraint: "Chủ ngữ trong mệnh đề lồng đi với trợ từ が (彼が来るか).",
      nuance: "Chính xác, khách quan về mệnh đề phụ."
    },
    notes: [
      "⚠️ Trợ từ trong câu hỏi lồng: Chủ ngữ của mệnh đề con BẮT BUỘC dùng trợ từ 'が' thay vì 'は' (VD: 会議に誰が参加するか確認してください).",
      "⚠️ Bỏ だ: 先生かどうか (Đúng), 先生だかどうか (SAI!)."
    ],
    memoryTip: "🧠 Nhớ: 'Có từ để hỏi thì dùng KA; Không có từ hỏi thì KA DOU KA; Tính từ NA và N nhớ BỎ DA!'",
    similarGrammars: [
      { similarStructure: "〜か〜か", difference: "Có thể lặp lại 2 vế đối lập: 行くか行かないか (Đi hay không đi) hoàn toàn tương đương với 行くかどうか.", comparisonExample: "行くかどうか (Đi hay không) = 行くか行かないか." }
    ],
    examples: [
      { japanese: "箱の中に何が入っているか、見てみましょう。", vietnamese: "Hãy thử nhìn xem bên trong hộp có chứa cái gì nhé.", explanation: "Có từ để hỏi 何 + か." },
      { japanese: "間違いがないかどうか、もう一度確認してください。", vietnamese: "Xin hãy kiểm tra lại thêm một lần nữa xem có sai sót gì hay không.", explanation: "Câu hỏi lồng Yes/No bằng かどうか." }
    ],
    exercises: [
      {
        id: "n4_t47_ex1",
        type: "multiple_choice",
        question: "Chọn từ đúng: その話が本当（　　）わかりません。",
        choices: ["かどうか", "だかどうか", "なかどうか", "のかどうか"],
        correct_answer: "かどうか",
        explanation: "Tính từ đuôi な (本当) bỏ 'だ' ghép trực tiếp với かどうか: 本当かどうか."
      }
    ]
  },
  {
    topicNumber: 48,
    lessonNumber: 28,
    pattern: "～し～ (Liệt kê lý do/tính chất)",
    structure: "[Thể thông thường] + し、[Thể thông thường] + し、[Kết luận]",
    meaning: "Vừa... lại vừa... / Đã... lại còn... (Liệt kê nhiều lý do dẫn đến kết luận)",
    explanation: "Dùng để liệt kê từ hai lý do, nguyên nhân hoặc tính chất trở lên để dẫn đến một phán đoán, kết luận hoặc lựa chọn ở vế cuối cùng.",
    exampleJp: "この店は値段も安いし、料理もおいしいし、いつも混んでいます。",
    exampleVi: "Quán này giá cả vừa rẻ, món ăn lại vừa ngon, nên lúc nào cũng đông khách.",
    overview: "Mẫu câu liệt kê lý do đa chiều trong Minna bài 28. Giúp câu nói có tính thuyết phục cao hơn rất nhiều so với việc chỉ đưa ra một lý do đơn lẻ bằng から.",
    formationRules: [
      { partOfSpeech: "Động từ", rule: "V thể thông thường + し", example: "近いし (vừa gần), 歌も上手だし (hát lại hay)", meaning: "Động từ thể thường" },
      { partOfSpeech: "Tính từ đuôi い", rule: "A-i + し", example: "安いし、おいしいし", meaning: "A-i giữ nguyên" },
      { partOfSpeech: "Tính từ đuôi な & Danh từ", rule: "A-na / N + だ + し", example: "親切だし (vừa tốt bụng), 先生だし (lại là thầy giáo)", meaning: "BẮT BUỘC GIỮ LẠI だ" }
    ],
    usageGuide: {
      whenToUse: ["1. Liệt kê nhiều ưu điểm để khen ngợi, giới thiệu một địa điểm hay đồ vật.", "2. Liệt kê nhiều lý do biện bạch cho việc từ chối khéo léo (hôm nay vừa mệt lại vừa nhiều việc nên tôi xin phép về sớm)."],
      whenNotToUse: ["Tránh kết hợp các tính chất quá mâu thuẫn trái chiều trong cùng chuỗi liệt kê (không nói: vừa ngon lại vừa dở)."],
      subjectConstraint: "Các trợ từ thường biến đổi thành も để tăng tính liệt kê (も〜し、も〜し).",
      nuance: "Giàu sức thuyết phục, tự nhiên, sinh động."
    },
    notes: [
      "⚠️ Chú ý: Danh từ và tính từ đuôi な BẮT BUỘC phải có 'だ' trước し (VD: 暇だし, 雨だし; không được bỏ だ).",
      "⚠️ Trợ từ 'も': Để nhấn mạnh liệt kê, người Nhật thường thay trợ từ が/を bằng 'も' (VD: 頭も痛いし、熱もあるし)."
    ],
    memoryTip: "🧠 Nhớ: 'Vừa này vừa nọ thì dùng SHI; N và NA nhớ giữ DA đứng kề!'",
    similarGrammars: [
      { similarStructure: "〜から vs 〜し〜し", difference: "〜から chỉ nêu duy nhất 1 nguyên nhân. 〜し〜し nêu từ 2 nguyên nhân trở lên và ngụ ý vẫn còn những lý do khác nữa.", comparisonExample: "安いから買います (Mua vì rẻ) vs 安いし、デザインもいいから買います (Vừa rẻ mẫu mã lại đẹp nên mua)." }
    ],
    examples: [
      { japanese: "今日は天気もいいし、風もないし、絶好のハイキング日和です。", vietnamese: "Hôm nay thời tiết vừa đẹp, gió lại lặng, đúng là một ngày tuyệt vời để đi dã ngoại.", explanation: "Liệt kê nhiều điểm tốt bằng 〜し〜し." },
      { japanese: "疲れたし、お腹も空いたし、早く帰りたいです。", vietnamese: "Vừa mệt lại vừa đói bụng, tôi muốn về nhà sớm quá.", explanation: "Nêu các lý do biện hộ." }
    ],
    exercises: [
      {
        id: "n4_t48_ex1",
        type: "multiple_choice",
        question: "Chọn dạng đúng của tính từ đuôi な '親切' trước 'し':",
        choices: ["親切だし", "親切なし", "親切し", "親切にいし"],
        correct_answer: "親切だし",
        explanation: "Tính từ đuôi な khi đi với し phải giữ lại chữ だ: 親切だし."
      }
    ]
  },
  {
    topicNumber: 49,
    lessonNumber: 49,
    pattern: "敬語: Kính ngữ (Tôn kính ngữ, Khiêm nhường ngữ & Lịch sự ngữ)",
    structure: "1. 尊敬語 (Tôn kính ngữ): Nâng cao người nghe / 2. 謙譲語 (Khiêm nhường ngữ): Hạ mình khiêm tốn / 3. 丁寧語 (Lịch sự ngữ)",
    meaning: "Hệ thống Kính ngữ tiếng Nhật: Tôn kính người đối thoại và hạ mình thể hiện sự khiêm cung",
    explanation: "Đỉnh cao giao tiếp chuẩn mực trong Minna bài 49 & 50. Nắm vững bảng động từ đặc biệt, công thức chung お/ご, và quy tắc Trong/Ngoài (ウチとソト) trong văn hóa công sở Nhật.",
    exampleJp: "社長はいらっしゃいますか (Tôn kính ngữ) vs 私が参ります (Khiêm nhường ngữ).",
    exampleVi: "Giám đốc có ở đó không ạ? (Nâng sếp lên) vs Tôi xin phép đến ngay ạ (Hạ mình khiêm tốn).",
    overview: "Chuyên đề Kính ngữ toàn diện trong Minna bài 49 (Tôn kính ngữ) và bài 50 (Khiêm nhường ngữ). Là phần kiến thức bắt buộc trong mọi đề thi JLPT và đời sống văn phòng thực tế tại Nhật Bản.",
    formationRules: [
      { partOfSpeech: "1. Bảng Động từ đặc biệt", rule: "Học thuộc lòng các cặp từ tương ứng", example: "行きます/来ます/います → いらっしゃる (Tôn kính) / 参る (Khiêm nhường); 言います → おっしゃる (Tôn kính) / 申す (Khiêm nhường); 食べます/飲みます → 召し上がる (Tôn kính) / いただく (Khiêm nhường); 見ます → ご覧になる (Tôn kính) / 拝見する (Khiêm nhường); 知っています → ご存じです (Tôn kính) / 存じております (Khiêm nhường); します → なさる (Tôn kính) / いたす (Khiêm nhường)", meaning: "Bảng từ vựng đặc biệt sống còn" },
      { partOfSpeech: "2. Công thức Tôn kính ngữ", rule: "お + V(bỏ ます) + になります (hoặc chia thể bị động)", example: "お読みになります / お帰りになります", meaning: "Tôn vinh hành động của đối phương" },
      { partOfSpeech: "3. Công thức Khiêm nhường ngữ", rule: "お + V(bỏ ます) + します / いたします (Nhóm 3: ご + N + します)", example: "お持ちします (Tôi xách hộ) / ご案内します (Tôi xin hướng dẫn)", meaning: "Hạ mình khi làm cho người khác" }
    ],
    usageGuide: {
      whenToUse: ["1. Dùng Tôn kính ngữ khi chủ ngữ là: Khách hàng, Giám đốc, Thầy cô, Trưởng bối.", "2. Dùng Khiêm nhường ngữ khi chủ ngữ là: Bản thân tôi, Người trong gia đình tôi, Nhân viên công ty tôi.", "3. Quy tắc Trong - Ngoài (Uchi - Soto): Khi nói chuyện với khách hàng đối tác ngoài công ty, Giám đốc của mình cũng biến thành phe 'Uchi' (phải dùng khiêm nhường ngữ, không gọi là Shacho-san)."],
      whenNotToUse: ["TUYỆT ĐỐI KHÔNG dùng Tôn kính ngữ cho hành động của chính bản thân mình (không nói: 私は召し上がります - Tôi dùng bữa ngon lành; phải nói: いただきます)."],
      subjectConstraint: "Tôn kính: Đối phương. Khiêm nhường: Bản thân và phe mình.",
      nuance: "Trang trọng, cung kính, chuyên nghiệp hàng đầu."
    },
    notes: [
      "⚠️ Lỗi sai cấm kỵ: Tuyệt đối không nhầm lẫn giữa Tôn kính ngữ và Khiêm nhường ngữ! Tự nâng mình lên hoặc hạ thấp khách hàng xuống là thất lễ nghiêm trọng.",
      "⚠️ Tiền tố お và ご: お đi với từ thuần Nhật (お名前, お手紙); ご đi với từ gốc Hán (ご家族, ご意見, ご案内)."
    ],
    memoryTip: "🧠 Nhớ câu thần chú: 'TÔN KÍNH nâng bạn, KHIÊM NHƯỜNG hạ tôi; Khách ngoài là nhất, người nhà hạ sau!'",
    similarGrammars: [
      { similarStructure: "Ma trận 3 thể kính ngữ", difference: "丁寧語 (です/ます): Lịch sự thông thường. 尊敬語: Tôn vinh đối phương. 謙譲語: Hạ mình khiêm tốn.", comparisonExample: "先生が言いました (Thường) → 先生がおっしゃいました (Tôn kính). 自分が言いました → 私が申しました (Khiêm nhường)." }
    ],
    examples: [
      { japanese: "部長、こちらの資料をご覧になりましたか。", vietnamese: "Thưa trưởng phòng, ngài đã xem qua tài liệu này chưa ạ?", explanation: "Tôn kính ngữ của 見る: ご覧になる." },
      { japanese: "重そうですね。私が荷物をお持ちしましょうか。", vietnamese: "Trông có vẻ nặng nhỉ. Tôi xin phép xách hành lý giúp ngài nhé.", explanation: "Khiêm nhường ngữ: お持ちする." }
    ],
    exercises: [
      {
        id: "n4_t49_ex1",
        type: "multiple_choice",
        question: "Muốn hỏi khách hàng một cách tôn kính: 'Ngài dùng món gì ạ?':",
        choices: [
          "何を召し上がりますか。",
          "何をいただきますか。",
          "何を食べられますか。",
          "何を参りますか。"
        ],
        correct_answer: "何を召し上がりますか。",
        explanation: "Tôn kính ngữ của 食べる/飲む đối với khách hàng là '召し上がる'."
      }
    ]
  }
];
