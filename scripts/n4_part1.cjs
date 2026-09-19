// Dataset of 49 JLPT N4 grammar topics extracted from the 105-page N4 curriculum
module.exports = [
  {
    topicNumber: 1,
    lessonNumber: 26,
    pattern: "～んです",
    structure: "[Thể thông thường] + んです (A-na / N: な + んです)",
    meaning: "Nhấn mạnh, giải thích nguyên nhân / lý do, bày tỏ sự quan tâm",
    explanation: "Dùng để nhấn mạnh lý do, giải thích sự việc thực tế, hỏi han thông tin hoặc mở đầu câu chuyện trước khi nhờ vả (～んですが).",
    exampleJp: "どうして会社を休んだんですか。頭が痛かったんです。",
    exampleVi: "Tại sao anh lại nghỉ làm thế? Vì tôi bị đau đầu.",
    overview: "Mẫu câu ～んです là cấu trúc đàm thoại quan trọng bậc nhất trong Minna bài 26 và kỳ thi JLPT N4. Được dùng để bày tỏ sự tò mò, quan tâm, đưa ra lời giải thích chân thật về tình trạng bản thân hoặc làm câu đệm trước khi nhờ vả.",
    formationRules: [
      { partOfSpeech: "Động từ", rule: "Thể thông thường (V-dict / V-nai / V-ta / V-nakatta) + んです", example: "行くんです / 行かないんです / 行ったんです", meaning: "Động từ chia thể thường rồi ghép んです" },
      { partOfSpeech: "Tính từ đuôi い", rule: "A-i (giữ nguyên い) + んです", example: "痛いんです / 暑いんです", meaning: "Tính từ đuôi い giữ nguyên" },
      { partOfSpeech: "Tính từ đuôi な", rule: "A-na (bỏ だ thêm な) + んです", example: "暇なんです / 好きなんです", meaning: "Tuyệt đối không dùng だ, phải dùng なんです" },
      { partOfSpeech: "Danh từ", rule: "N + なんです", example: "病気なんです / 雨なんです", meaning: "Danh từ thêm なんです" }
    ],
    usageGuide: {
      whenToUse: [
        "1.1 Thể hiện sự quan tâm đến đối phương, muốn hỏi thêm thông tin hoặc cần lời giải thích khi thấy hiện tượng khác thường.",
        "1.2 Đặt câu hỏi về nguyên nhân, lý do (どうして〜んですか) và trả lời cho câu hỏi đó.",
        "1.3 Bổ sung, giải thích thêm nguyên nhân cho thông tin mình vừa đưa ra.",
        "1.4 Mở đầu câu chuyện, thu hút sự chú ý trước khi vào chủ đề chính hoặc nhờ vả (〜んですが、〜)."
      ],
      whenNotToUse: [
        "Không dùng để hỏi han người không liên quan hoặc người hoàn toàn xa lạ khi không có dấu hiệu gì bất thường.",
        "Không dùng khi chỉ đơn thuần thông báo một sự thật khách quan không cần giải thích nguyên nhân."
      ],
      subjectConstraint: "Có thể dùng cho bản thân hoặc hỏi đối phương.",
      nuance: "Mang sắc thái thân mật, tự nhiên, biểu cảm cao hơn so với mẫu 〜から / 〜ので thuần túy."
    },
    notes: [
      "⚠️ Lỗi chuyển đuôi: Danh từ và tính từ đuôi な thể khẳng định hiện tại phải đổi 'だ' thành 'な' (VD: 暇なんです, không được nói 暇だんです).",
      "⚠️ Cách nói thân mật (casual/suồng sã): Trong hội thoại bạn bè, '〜んですか' chuyển thành '〜の?', '〜んです' chuyển thành '〜んだ', '〜んですが' chuyển thành '〜んだけど'."
    ],
    memoryTip: "🧠 Nhớ công thức: 'Có chuyện mới hỏi, có lý do mới んです!' và quy tắc 'N/A-na phải có な trước ん'!",
    similarGrammars: [
      { similarStructure: "〜から / 〜ので", difference: "〜から/〜ので chỉ nêu nguyên nhân thuần túy ở mệnh đề phụ. Còn 〜んです đặt ở cuối câu để giải thích, trần tình toàn bộ tình huống cho người nghe thấu hiểu.", comparisonExample: "頭が痛いので、帰ります。(Chỉ nêu lý do khách quan) vs 頭が痛いんです。(Trần tình, phân bua mong được thông cảm)." }
    ],
    examples: [
      { japanese: "どうして昨日来なかったんですか。熱があったんです。", vietnamese: "Tại sao hôm qua bạn không đến? Vì tôi bị sốt.", explanation: "Hỏi và giải thích nguyên nhân bằng んです." },
      { japanese: "日本語を勉強したいんですが、いい先生を紹介していただけませんか。", vietnamese: "Tôi muốn học tiếng Nhật, bạn có thể giới thiệu cho tôi một giáo viên tốt được không?", explanation: "Dùng 〜んですが để mào đầu trước khi đưa ra lời nhờ vả lịch sự." },
      { japanese: "きれいな写真ですね。どこで撮ったんですか。", vietnamese: "Bức ảnh đẹp quá nhỉ. Bạn chụp ở đâu vậy?", explanation: "Bày tỏ sự quan tâm, tò mò muốn biết thông tin chi tiết." }
    ],
    exercises: [
      {
        id: "n4_t1_ex1",
        type: "multiple_choice",
        question: "Chọn câu đúng khi muốn nói 'Vì hôm nay tôi rảnh rỗi':",
        choices: ["今日は暇なんです。", "今日は暇だんです。", "今日は暇いです。", "今日は暇なんですの。"],
        correct_answer: "今日は暇なんです。",
        explanation: "Tính từ đuôi な khi đi với んです phải chuyển 'だ' thành 'な', tạo thành '暇なんです'."
      },
      {
        id: "n4_t1_ex2",
        type: "multiple_choice",
        question: "Điền vào chỗ trống để mào đầu câu nhờ vả: パスポートをなくした（　　）、どうすればいいですか。",
        choices: ["んですが", "ので", "から", "のに"],
        correct_answer: "んですが",
        explanation: "Mẫu câu ～んですが dùng để nêu bối cảnh, rào trước đón sau trước khi nhờ vả hoặc hỏi xin lời khuyên."
      }
    ]
  },
  {
    topicNumber: 2,
    lessonNumber: 32,
    pattern: "～ほうがいいです",
    structure: "V-た / V-ない + ほうがいいです",
    meaning: "Nên / Không nên làm gì (Đưa ra lời khuyên)",
    explanation: "Dùng khi đưa ra lời khuyên cụ thể, trực tiếp cho đối phương rằng nên làm (V-ta) hoặc không nên làm (V-nai) điều gì.",
    exampleJp: "熱があるなら、早く病院に行ったほうがいいですよ。",
    exampleVi: "Nếu bị sốt thì bạn nên đi bệnh viện sớm đi nhé.",
    overview: "Mẫu câu đưa ra lời khuyên trực tiếp trong Minna bài 32. Khi khuyên nên làm hành động gì, động từ bắt buộc chia ở thể quá khứ (V-ta ほうがいい), còn khuyên không nên làm thì chia ở thể phủ định (V-nai ほうがいい).",
    formationRules: [
      { partOfSpeech: "Khuyên nên làm", rule: "V-た + ほうがいいです", example: "早く寝たほうがいいです (Nên đi ngủ sớm)", meaning: "Động từ thể た" },
      { partOfSpeech: "Khuyên không nên làm", rule: "V-ない + ほうがいいです", example: "タバコを吸わないほうがいいです (Không nên hút thuốc)", meaning: "Động từ thể ない" }
    ],
    usageGuide: {
      whenToUse: ["Đưa ra lời khuyên trực tiếp cho người đang gặp vấn đề hoặc băn khoăn."],
      whenNotToUse: ["Tránh dùng với cấp trên, sếp hoặc đối tác vì mang sắc thái phán đoán áp đặt, có thể bị coi là thiếu lịch sự. Với cấp trên nên dùng 〜たらいかがでしょうか hoặc 〜ほうがよろしいかと存じます."],
      subjectConstraint: "Thường hướng tới đối phương (ngôi thứ 2).",
      nuance: "Lời khuyên mạnh mẽ, so sánh giữa 2 lựa chọn (làm điều này sẽ tốt hơn là không làm)."
    },
    notes: [
      "⚠️ Tuyệt đối không dùng V thể từ điển (V-dict + ほうがいい là SAI ngữ pháp chuẩn N4). Bắt buộc phải là V-た hoặc V-ない!"
    ],
    memoryTip: "🧠 Nhớ: 'Khuyên làm thì dùng TẢ (V-た), khuyên đừng thì dùng NAI (V-ない)'!",
    similarGrammars: [
      { similarStructure: "〜たらどうですか", difference: "〜たらどうですか mang ý gợi ý nhẹ nhàng (sao bạn không thử làm...), còn 〜ほうがいい mang tính định hướng lời khuyên mạnh mẽ hơn.", comparisonExample: "薬を飲んだらどうですか。(Gợi ý thử) vs 薬を飲んだほうがいいです。(Khuyên nên làm)" }
    ],
    examples: [
      { japanese: "風邪をひいたときは、お風呂に入らないほうがいいです。", vietnamese: "Khi bị cảm thì không nên tắm.", explanation: "Khuyên không nên làm bằng V-ないほうがいい." },
      { japanese: "毎日運動したほうがいいですよ。", vietnamese: "Bạn nên tập thể dục mỗi ngày nhé.", explanation: "Khuyên nên làm việc tốt cho sức khỏe bằng V-たほうがいい." }
    ],
    exercises: [
      {
        id: "n4_t2_ex1",
        type: "multiple_choice",
        question: "Chọn câu đúng để khuyên 'Bạn nên uống thuốc':",
        choices: ["薬を飲んだほうがいいです。", "薬を飲むほうがいいです。", "薬を飲みほうがいいです。", "薬を飲んでほうがいいです。"],
        correct_answer: "薬を飲んだほうがいいです。",
        explanation: "Khi khuyên nên làm hành động gì, phải dùng V-た + ほうがいいです (飲んだほうがいいです)."
      }
    ]
  },
  {
    topicNumber: 3,
    lessonNumber: 45,
    pattern: "～のに",
    structure: "V-thể thường / A-i / A-naな / Nな + のに",
    meaning: "Mặc dù... thế mà... / Dù... nhưng...",
    explanation: "Diễn tả sự tương phản đối lập mạnh mẽ giữa kết quả thực tế xảy ra so với kỳ vọng hoặc dự đoán thông thường, mang sắc thái tiếc nuối, ngạc nhiên hoặc bất mãn.",
    exampleJp: "一生懸命勉強したのに、不合格でした。",
    exampleVi: "Mặc dù đã học tập chăm chỉ hết sức thế mà lại thi trượt.",
    overview: "Mẫu câu tương phản đặc sắc trong Minna bài 45. Khác với が hay けれども (nối câu tương phản trung tính), 〜のに luôn chứa đựng cảm xúc chủ quan: tiếc nuối, thất vọng, trách móc hoặc ngạc nhiên trước một sự thật trái ngược.",
    formationRules: [
      { partOfSpeech: "Động từ", rule: "Thể thông thường + のに", example: "約束したのに (Mặc dù đã hẹn)", meaning: "V-thường + のに" },
      { partOfSpeech: "Tính từ đuôi い", rule: "A-i + のに", example: "高いのに (Mặc dù đắt)", meaning: "A-i giữ nguyên" },
      { partOfSpeech: "Tính từ đuôi な", rule: "A-na + な + のに", example: "静かなのに (Mặc dù yên tĩnh)", meaning: "Thêm な" },
      { partOfSpeech: "Danh từ", rule: "N + な + のに", example: "日曜日なのに (Mặc dù là chủ nhật)", meaning: "Thêm な" }
    ],
    usageGuide: {
      whenToUse: ["Biểu đạt sự việc vế 2 trái ngược hoàn toàn với lẽ thường hoặc mong đợi từ vế 1."],
      whenNotToUse: ["Vế 2 KHÔNG ĐƯỢC dùng câu mệnh lệnh, nhờ vả, ý chí, rủ rê (như ください, ましょう, つもり). Vế 2 phải là một sự việc thực tế đã xảy ra."],
      subjectConstraint: "Không giới hạn chủ ngữ.",
      nuance: "Chứa sắc thái tâm trạng: hối tiếc, bất bình, oán trách hoặc ngạc nhiên."
    },
    notes: [
      "⚠️ Danh từ và tính từ đuôi な phải dùng 'な + のに' (VD: 日曜日なのに, không được nói 日曜日なのに sai thành 日曜日だのに).",
      "⚠️ Đừng nhầm với 〜のに chỉ mục đích ở bài 38 (V-dict + のに使います: Dùng vào việc gì)."
    ],
    memoryTip: "🧠 Nhớ: 'のに mang tiếng thở dài' - cứ có のに là có sự tiếc nuối, bất ngờ!",
    similarGrammars: [
      { similarStructure: "〜けれども / 〜が", difference: "〜が/〜けれども chỉ nêu tương phản khách quan, vế sau có thể dùng mệnh lệnh/ý chí. Còn 〜のに vế sau chỉ là sự việc thực tế kèm cảm xúc bất mãn/tiếc nuối.", comparisonExample: "雨ですが、行きましょう。(Dùng が rủ rê được) vs 雨なのに、行きましょう。(SAI, không dùng のに với rủ rê)." }
    ],
    examples: [
      { japanese: "今日は日曜日なのに、働かなければなりません。", vietnamese: "Hôm nay mặc dù là chủ nhật thế mà tôi vẫn phải đi làm.", explanation: "Thể hiện sự bất mãn/tiếc nuối với thực tế." },
      { japanese: "薬を飲んだのに、熱が下がりません。", vietnamese: "Mặc dù đã uống thuốc rồi thế mà cơn sốt vẫn không hạ.", explanation: "Kết quả trái ngược với kỳ vọng điều trị." }
    ],
    exercises: [
      {
        id: "n4_t3_ex1",
        type: "multiple_choice",
        question: "Chọn dạng đúng điền vào chỗ trống: 彼は（　　）のに、全然手伝ってくれませんでした。",
        choices: ["暇な", "暇だ", "暇", "暇で"],
        correct_answer: "暇な",
        explanation: "Tính từ đuôi な trước のに phải có đuôi 'な' (暇なのに)."
      }
    ]
  },
  {
    topicNumber: 4,
    lessonNumber: 28,
    pattern: "～ながら",
    structure: "V1(bỏ ます) + ながら + V2",
    meaning: "Vừa làm V1 vừa làm V2",
    explanation: "Diễn tả hai hành động diễn ra đồng thời cùng lúc do cùng một người thực hiện. Trong đó V2 là hành động chính.",
    exampleJp: "音楽を聞きながら、宿題をしています。",
    exampleVi: "Tôi vừa nghe nhạc vừa làm bài tập về nhà.",
    overview: "Mẫu câu diễn đạt hành động song song quen thuộc trong Minna bài 28. Điểm cốt lõi là hai hành động do cùng một chủ thể thực hiện, và hành động ở vế 2 là trọng tâm chính.",
    formationRules: [
      { partOfSpeech: "Động từ nhóm 1", rule: "V(bỏ ます) + ながら", example: "飲みます → 飲みながら", meaning: "Bỏ ます" },
      { partOfSpeech: "Động từ nhóm 2", rule: "V(bỏ ます) + ながら", example: "食べます → 食べながら", meaning: "Bỏ ます" },
      { partOfSpeech: "Động từ nhóm 3", rule: "V(bỏ します/来ます) + ながら", example: "散歩しながら / 来(き)ながら", meaning: "Bỏ ます" }
    ],
    usageGuide: {
      whenToUse: ["Diễn tả 2 hành động diễn ra song song bởi cùng một người trong cùng khoảng thời gian."],
      whenNotToUse: ["Không dùng khi 2 hành động do 2 người khác nhau thực hiện (2 người khác nhau phải dùng 〜間に hoặc 〜一方で).", "Không dùng cho 2 hành động diễn ra trước sau tuần tự (làm xong A rồi làm B phải dùng 〜てから)."],
      subjectConstraint: "Chủ ngữ của V1 và V2 BẮT BUỘC phải là CÙNG MỘT NGƯỜI.",
      nuance: "V1 là phụ, V2 là chính."
    },
    notes: [
      "⚠️ Trật tự chính phụ: '音楽を聞きながら勉強する' (vừa nghe nhạc vừa học - học là chính) khác với '勉強しながら音楽を聞く' (vừa học vừa nghe nhạc - nghe nhạc là chính).",
      "⚠️ Động từ đứng trước ながら phải ở dạng bỏ ます. Tuyệt đối không dùng V thể từ điển hay thể て."
    ],
    memoryTip: "🧠 Nhớ: 'Một người hai tay, vế sau làm việc chính!'",
    similarGrammars: [
      { similarStructure: "〜つつ", difference: "〜つつ là mẫu ngữ pháp trung cấp N2 mang tính chất văn viết, trang trọng hơn của 〜ながら.", comparisonExample: "将来の進路を考えつつ、勉強に励んでいる。(Vừa suy ngẫm hướng đi tương lai vừa nỗ lực học tập)." }
    ],
    examples: [
      { japanese: "コーヒーを飲みながら、新聞を読みます。", vietnamese: "Tôi vừa uống cà phê vừa đọc báo.", explanation: "Hai hành động song song cùng lúc, đọc báo là chính." },
      { japanese: "歩きながら、スマホを使わないでください。", vietnamese: "Xin đừng vừa đi bộ vừa bấm điện thoại.", explanation: "Nhắc nhở an toàn." }
    ],
    exercises: [
      {
        id: "n4_t4_ex1",
        type: "multiple_choice",
        question: "Dạng chia đúng của động từ 話します trước ながら là:",
        choices: ["話しながら", "話すながら", "話してながら", "話したながら"],
        correct_answer: "話しながら",
        explanation: "Bỏ ます ghép trực tiếp với ながら: 話します → 話しながら."
      }
    ]
  },
  {
    topicNumber: 5,
    lessonNumber: 38,
    pattern: "～のが、～のは、～のに",
    structure: "V-dict + のは [Tính từ] です / V-dict + のが [Tính từ] です / V-dict + のに [使います/必要です]",
    meaning: "Việc làm V thì... / Để làm V thì cần thiết...",
    explanation: "Dùng trợ từ 'の' để danh từ hóa một động từ hoặc một mệnh đề hành động, biến nó thành chủ ngữ hoặc tân ngữ trong câu.",
    exampleJp: "日本で車を運転するのは難しいです。",
    exampleVi: "Việc lái xe ô tô ở Nhật Bản thì rất khó.",
    overview: "Chuyên đề Danh từ hóa động từ trong Minna bài 38. Bằng cách thêm 'の' vào sau động từ thể từ điển, chúng ta có thể đưa cả một hành động vào vị trí chủ ngữ (のは), tân ngữ đánh giá (のが), hoặc biểu thị mục đích (のに).",
    formationRules: [
      { partOfSpeech: "Nhấn mạnh chủ đề (のは)", rule: "V-dict + のは + [Tính từ / Danh từ] です", example: "テニスをするのは面白いです", meaning: "Việc làm V thì..." },
      { partOfSpeech: "Biểu thị sở thích, năng lực (のが)", rule: "V-dict + のが + [好き/上手/下手/速い/遅い] です", example: "絵を描くのが好きです", meaning: "Thích / Giỏi việc làm V" },
      { partOfSpeech: "Chỉ mục đích, công dụng (のに)", rule: "V-dict + のに + [使います/便利です/時間がかかります]", example: "このハサミは花を切るのに使います", meaning: "Dùng / Tiện lợi cho việc làm V" }
    ],
    usageGuide: {
      whenToUse: ["5.1 Thích/giỏi/kém làm việc gì: dùng V-dict + のが好き/上手/下手.", "5.2 Đưa cả một mệnh đề hành động lên làm chủ ngữ nhận xét: V-dict + のは...", "5.3 Mục đích, công dụng của đồ vật: V-dict + のに + 使います/役に立ちます."],
      whenNotToUse: ["Phân biệt với こと: Khi đứng trước です ở cuối câu định nghĩa (趣味は〜ことです) thì bắt buộc dùng こと."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Tự nhiên, mềm mại hơn trong văn nói hàng ngày."
    },
    notes: [
      "⚠️ Chỉ dùng 「の」 không dùng 「こと」 khi muốn nhấn mạnh tân ngữ/địa điểm/thời gian ở vị trí cuối câu: [Mệnh đề] のは + [N cụ thể] です (VD: 私が生まれたのはベトナムです).",
      "⚠️ Mẫu 'V-dict + のに' chỉ mục đích công dụng khác hoàn toàn với '〜のに' chỉ sự tương phản tiếc nuối (Mặc dù... thế mà...)."
    ],
    memoryTip: "🧠 Nhớ: 'Thích giỏi kém đi với のが; Mục đích công dụng đi với のに; Nhận định đánh giá đi với のは'!",
    similarGrammars: [
      { similarStructure: "V-dict + こと", difference: "こと mang tính khái quát, trừu tượng, trang trọng. の mang tính cụ thể, trực quan, gần gũi cảm giác.", comparisonExample: "私の趣味は映画を見ることです。(Bắt buộc dùng こと ở cuối câu)." }
    ],
    examples: [
      { japanese: "外国語を覚えるのは大変ですが、楽しいです。", vietnamese: "Việc ghi nhớ ngoại ngữ tuy vất vả nhưng rất vui.", explanation: "Dùng のは đưa hành động lên làm chủ đề câu." },
      { japanese: "彼は料理を作るのがとても上手です。", vietnamese: "Anh ấy nấu ăn rất giỏi.", explanation: "Dùng のが đi với tính từ chỉ năng lực 上手." },
      { japanese: "このカバンは重い荷物を運ぶのに便利です。", vietnamese: "Chiếc cặp này rất tiện lợi cho việc chở hành lý nặng.", explanation: "Dùng のに chỉ mục đích/tiện dụng." }
    ],
    exercises: [
      {
        id: "n4_t5_ex1",
        type: "multiple_choice",
        question: "Chọn từ thích hợp: 私は毎朝ジョギングをする（　　）が好きです。",
        choices: ["のが", "のは", "のを", "のに"],
        correct_answer: "のが",
        explanation: "Đi với tính từ biểu thị sở thích '好きです' bắt buộc dùng trợ từ 'のが'."
      }
    ]
  },
  {
    topicNumber: 6,
    lessonNumber: 27,
    pattern: "Động từ thể khả năng (可能形)",
    structure: "Nhóm 1: [u] → [eru] / Nhóm 2: [ru] → [rareru] / Nhóm 3: します → できます, 来ます → 来られます",
    meaning: "Có thể làm gì... (Năng lực cá nhân hoặc điều kiện cho phép)",
    explanation: "Biến đổi động từ để thể hiện năng lực bản thân hoặc điều kiện hoàn cảnh khách quan cho phép thực hiện hành động. Tân ngữ thường đi với trợ từ が thay cho を.",
    exampleJp: "私は漢字が500字読めます。",
    exampleVi: "Tôi có thể đọc được 500 chữ Hán.",
    overview: "Chuyên đề Thể khả năng trong Minna bài 27. Đây là một trong những thể biến đổi động từ trọng tâm nhất của JLPT N4, giúp câu nói ngắn gọn và tự nhiên hơn rất nhiều so với mẫu ことができます.",
    formationRules: [
      { partOfSpeech: "Nhóm 1", rule: "Đổi âm [u] thành âm [e] rồi thêm ます / る", example: "行きます(iku) → 行けます(ikeru), 読みます(yomu) → 読めます(yomeru), 買います(kau) → 買えます(kaeru)", meaning: "Đổi đuôi [i]masu thành [e]masu" },
      { partOfSpeech: "Nhóm 2", rule: "Bỏ ます thêm られます", example: "食べます → 食べられます, 見ます → 見られます", meaning: "Thêm られます (văn nói có thể rút gọn thành れます: ら抜き言葉)" },
      { partOfSpeech: "Nhóm 3", rule: "Bất quy tắc", example: "します → できます, 来(き)ます → 来(こ)られます", meaning: "Học thuộc lòng" }
    ],
    usageGuide: {
      whenToUse: ["1. Năng lực bản thân (VD: biết bơi, nói được tiếng Nhật, đọc được Kanji).", "2. Điều kiện hoàn cảnh khách quan (VD: có wifi nên xem được video, ở siêu thị này mua được đồ Việt Nam)."],
      whenNotToUse: ["Ngoại lệ: Động từ vốn dĩ đã mang nghĩa khả năng như わかる (hiểu), 知る (biết), 見える (nhìn thấy tự nhiên), 聞こえる (nghe thấy tự nhiên) KHÔNG chia thể khả năng."],
      subjectConstraint: "Chủ ngữ là người hoặc thực thể có khả năng.",
      nuance: "Tân ngữ trực tiếp vốn đi với trợ từ を chuyển thành trợ từ が (日本語を話します → 日本語が話せます)."
    },
    notes: [
      "⚠️ Trợ từ: '〜を V' chuyển thành '〜が V khả năng'.",
      "⚠️ Phân biệt: 見られます (có thể xem khi có điều kiện/thời gian) vs 見えます (tự nhiên lọt vào tầm mắt không cần nỗ lực).",
      "⚠️ Phân biệt: 聞けます (có thể nghe khi có cơ hội) vs 聞こえます (âm thanh tự vọng vào tai)."
    ],
    memoryTip: "🧠 Nhớ: 'Nhóm 1 đổi sang hàng Ê; Nhóm 2 thêm RARERU; Trợ từ を biến thành GÁ!'",
    similarGrammars: [
      { similarStructure: "V-dict + ことができる", difference: "Cùng nghĩa có thể làm gì, nhưng thể khả năng ngắn gọn, tự nhiên trong giao tiếp miệng; ことができる trang trọng hơn và có thể dùng cho năng lực cố định.", comparisonExample: "私はピアノが弾けます。(Khẩu ngữ tự nhiên) vs ピアノを弾くことができます。(Văn viết, trang trọng)." }
    ],
    examples: [
      { japanese: "一人で病院へ行けますか。", vietnamese: "Bạn có thể tự đi đến bệnh viện một mình được không?", explanation: "Hỏi về khả năng/năng lực thực hiện hành động." },
      { japanese: "この部屋から富士山が見えます。", vietnamese: "Từ căn phòng này có thể nhìn thấy núi Phú Sĩ.", explanation: "Dùng 見えます chỉ khả năng nhìn thấy tự nhiên." }
    ],
    exercises: [
      {
        id: "n4_t6_ex1",
        type: "multiple_choice",
        question: "Dạng thể khả năng đúng của động từ 泳ぎます (nhóm 1) là:",
        choices: ["泳げます", "泳ぎられます", "泳がれます", "泳ぐできます"],
        correct_answer: "泳げます",
        explanation: "Động từ nhóm 1 đổi âm gi thành ge: 泳ぎます → 泳げます."
      }
    ]
  },
  {
    topicNumber: 7,
    lessonNumber: 27,
    pattern: "～ことができる",
    structure: "V-dict + ことができる / ことができない",
    meaning: "Có thể / Không thể làm được hành động gì",
    explanation: "Diễn tả năng lực cá nhân hoặc hoàn cảnh cho phép thực hiện hành động, sử dụng cấu trúc danh từ hóa động từ bằng こと.",
    exampleJp: "このホテルでは無料Wi-Fiを使うことができます。",
    exampleVi: "Ở khách sạn này bạn có thể sử dụng Wi-Fi miễn phí.",
    overview: "Mẫu câu chỉ khả năng cổ điển và trang trọng, xuất hiện từ cuối N5 và củng cố toàn diện ở N4 khi so sánh đối ứng với Động từ thể khả năng.",
    formationRules: [
      { partOfSpeech: "Khẳng định", rule: "V thể từ điển (辞書形) + ことができる", example: "運転することができる (Có thể lái xe)", meaning: "V-dict + ことができる" },
      { partOfSpeech: "Phủ định", rule: "V thể từ điển + ことができない / ことができません", example: "入ることができません (Không thể vào)", meaning: "V-dict + ことができない" }
    ],
    usageGuide: {
      whenToUse: ["Trình bày trang trọng trong thông báo, biển báo, nội quy, quy định, hợp đồng.", "Giữ nguyên trợ từ を của tân ngữ (không bắt buộc đổi thành が như thể khả năng)."],
      whenNotToUse: ["Trong giao tiếp thân mật thường nhật, người Nhật chuộng dùng động từ thể khả năng ngắn gọn hơn."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Trang trọng, khách quan, rõ ràng."
    },
    notes: [
      "⚠️ Động từ trước ことができる BẮT BUỘC ở thể từ điển, không được chia thể ます hay thể た."
    ],
    memoryTip: "🧠 Nhớ: 'V-dict + KOTO GA DEKIRU: chuẩn mực, trang trọng, giữ nguyên trợ từ!'",
    similarGrammars: [
      { similarStructure: "Động từ thể khả năng (可能形)", difference: "Cùng nghĩa, nhưng ことができる giữ nguyên cấu trúc tân ngữ 'O を V' dễ dùng hơn, thể khả năng chuộng đổi sang 'O が V khả năng'.", comparisonExample: "車を運転することができます。(Giữ を) vs 車が運転できます。(Dùng が)." }
    ],
    examples: [
      { japanese: "パスポートがなければ、飛行機に乗ることができません。", vietnamese: "Nếu không có hộ chiếu thì không thể lên máy bay được.", explanation: "Diễn tả điều kiện quy định bằng ことができません." }
    ],
    exercises: [
      {
        id: "n4_t7_ex1",
        type: "multiple_choice",
        question: "Chọn dạng đúng: ここで写真を（　　）ことができます。",
        choices: ["撮る", "撮ります", "撮った", "撮り"],
        correct_answer: "撮る",
        explanation: "Trước ことができる phải là động từ ở thể từ điển: 撮る."
      }
    ]
  },
  {
    topicNumber: 8,
    lessonNumber: 28,
    pattern: "～かた (～方)",
    structure: "V(bỏ ます) + 方 (かた)",
    meaning: "Cách làm gì (cách đọc, cách viết, cách sử dụng, cách đi...)",
    explanation: "Biến một động từ thành một danh từ mang ý nghĩa phương thức, cách thức thực hiện hành động đó.",
    exampleJp: "この漢字の読み方を教えてください。",
    exampleVi: "Xin hãy chỉ cho tôi cách đọc của chữ Hán này.",
    overview: "Mẫu ghép từ cực kỳ thông dụng trong đời sống và giao tiếp N4, dùng để tạo nên danh từ chỉ cách thức hành động.",
    formationRules: [
      { partOfSpeech: "Động từ nhóm 1, 2, 3", rule: "V(bỏ ます) + 方 (かた)", example: "書きます → 書き方 (cách viết), 食べます → 食べ方 (cách ăn), します → し方 / やり方 (cách làm)", meaning: "Bỏ ます thêm 方" }
    ],
    usageGuide: {
      whenToUse: ["Hỏi hoặc hướng dẫn cách thao tác, sử dụng, phát âm, nấu nướng, đi lại."],
      whenNotToUse: ["Tránh nhầm với danh từ 方 (かた) nghĩa là 'vị/người' trong kính ngữ (この方)."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Tạo thành một cụm danh từ hoàn chỉnh, tân ngữ đi trước nối bằng trợ từ の."
    },
    notes: [
      "⚠️ Trợ từ biến đổi: Tân ngữ đi trước động từ vốn dùng trợ từ を thì khi chuyển sang danh từ với 〜方 phải dùng trợ từ の (VD: 漢字を読む → 漢字の読み方; 箸を使う → 箸の使い方)."
    ],
    memoryTip: "🧠 Nhớ: 'V bỏ MASU thêm KATA; Trợ từ biến thành NO!'",
    similarGrammars: [
      { similarStructure: "やり方 / 方法", difference: "〜方 ghép trực tiếp sau động từ. 方法 (phương pháp) là danh từ độc lập mang tính khoa học, kỹ thuật hơn.", comparisonExample: "使い方の説明 (Giải thích cách dùng) vs 解決の方法 (Phương pháp giải quyết)." }
    ],
    examples: [
      { japanese: "すしのおいしい食べ方を知っていますか。", vietnamese: "Bạn có biết cách ăn sushi ngon không?", explanation: "Dùng 〜方 tạo danh từ cách ăn." },
      { japanese: "地下鉄の乗り方を教えていただけませんか。", vietnamese: "Bạn có thể chỉ giúp tôi cách đi tàu điện ngầm được không?", explanation: "Nhờ vả hướng dẫn phương thức di chuyển." }
    ],
    exercises: [
      {
        id: "n4_t8_ex1",
        type: "multiple_choice",
        question: "Chọn câu đúng để nói 'cách sử dụng máy tính':",
        choices: ["パソコンの使い方", "パソコンを使います方", "パソコンを使う方", "パソコンを使い方"],
        correct_answer: "パソコンの使い方",
        explanation: "Động từ 使い(ます) + 方, tân ngữ nối bằng trợ từ の: パソコンの使い方."
      }
    ]
  },
  {
    topicNumber: 9,
    lessonNumber: 34,
    pattern: "～とおりに",
    structure: "V-dict / V-た + とおりに / N + のとおりに (hoặc N + どおりに)",
    meaning: "Theo như... / Đúng theo...",
    explanation: "Thực hiện một hành động y hệt, tuân thủ đúng theo chỉ dẫn, mô hình, kinh nghiệm hoặc bản vẽ đã cho.",
    exampleJp: "私が言うとおりに、書いてください。",
    exampleVi: "Xin hãy viết theo đúng như những gì tôi nói.",
    overview: "Mẫu câu chỉ sự mô phỏng, tuân thủ trong Minna bài 34. Rất hay gặp khi chỉ đường, nấu ăn theo sách hướng dẫn, làm việc theo quy trình công xưởng.",
    formationRules: [
      { partOfSpeech: "Động từ thể từ điển", rule: "V-dict + とおりに", example: "説明書に書いてあるとおりに (Theo đúng như viết trong hướng dẫn)", meaning: "Hành động chuẩn bị theo" },
      { partOfSpeech: "Động từ thể た", rule: "V-た + とおりに", example: "私が教えたとおりに (Theo đúng như những gì tôi đã dạy)", meaning: "Hành động đã xảy ra trước" },
      { partOfSpeech: "Danh từ", rule: "N + のとおりに / N + どおりに", example: "地図のとおりに (Theo bản đồ) / 計画どおりに (Theo kế hoạch)", meaning: "Danh từ có の hoặc biến âm どおり" }
    ],
    usageGuide: {
      whenToUse: ["Làm một việc gì đó bắt chước, tuân thủ hoàn toàn theo khuôn mẫu hoặc hướng dẫn có sẵn."],
      whenNotToUse: ["Không dùng khi làm khác hoặc làm sai lệch so với bản gốc."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Chính xác, nghiêm ngặt."
    },
    notes: [
      "⚠️ Biến âm: Khi ghép trực tiếp sau một số danh từ (như 計画, 予定, 希望), chữ とおり thường biến âm thành 'どおり' (VD: 計画どおりに, 予定どおりに)."
    ],
    memoryTip: "🧠 Nhớ: 'Theo mẫu đã vạch: Động từ thì TOORI, Danh từ thì thêm NO hoặc biến âm DOORI!'",
    similarGrammars: [
      { similarStructure: "〜ように", difference: "〜ように mang tính đại khái, ước lệ (hãy làm giống như...). 〜とおり mang tính chính xác từng chi tiết một theo khuôn mẫu.", comparisonExample: "見たとおりに話してください。(Khai báo chính xác y hệt những gì đã thấy)." }
    ],
    examples: [
      { japanese: "先生が言ったとおりに、発音してください。", vietnamese: "Xin hãy phát âm theo đúng như thầy giáo đã nói.", explanation: "V-た + とおりに." },
      { japanese: "計画どおりに工事が進んでいます。", vietnamese: "Công trình đang tiến triển đúng theo như kế hoạch.", explanation: "N + どおりに." }
    ],
    exercises: [
      {
        id: "n4_t9_ex1",
        type: "multiple_choice",
        question: "Chọn từ thích hợp: 線（　　）紙を切ってください。",
        choices: ["のとおりに", "どおり", "とおり", "にとおり"],
        correct_answer: "のとおりに",
        explanation: "Danh từ 線 (đường kẻ) đi với 'のとおりに': 線のとおりに (theo đường kẻ)."
      }
    ]
  },
  {
    topicNumber: 10,
    lessonNumber: 31,
    pattern: "Động từ thể ý chí (意向形)",
    structure: "Nhóm 1: [u] → [ou] / Nhóm 2: [ru] → [you] / Nhóm 3: します → しよう, 来ます → こよう",
    meaning: "Rủ rê, mời mọc (suồng sã) hoặc tự nhủ ý chí muốn làm gì",
    explanation: "Thể ý chí (意向形) là dạng thân mật của '〜ましょう'. Dùng trong đàm thoại suồng sã giữa bạn bè để rủ rê cùng làm, hoặc độc thoại tự hạ quyết tâm.",
    exampleJp: "ちょっと休もう。",
    exampleVi: "Nghỉ một chút nào! (Rủ rê bạn bè)",
    overview: "Chuyên đề Thể ý chí trong Minna bài 31. Đóng vai trò nền tảng để tạo nên các cấu trúc dự định trọng tâm như 〜ようと思います, 〜ようと思っています.",
    formationRules: [
      { partOfSpeech: "Nhóm 1", rule: "Đổi âm [u] thành âm hàng [o] rồi thêm [u]", example: "行きます(iku) → 行こう(ikou), 飲みます(nomu) → 飲もう(nomou), 待ちます(matsu) → まとう(matou)", meaning: "Hàng [i]masu chuyển thành [o]u" },
      { partOfSpeech: "Nhóm 2", rule: "Bỏ ます thêm よう", example: "食べます → 食べよう, 見ます → 見よう", meaning: "Thêm よう" },
      { partOfSpeech: "Nhóm 3", rule: "Bất quy tắc", example: "します → しよう, 来(き)ます → 来(こ)よう", meaning: "Học thuộc lòng" }
    ],
    usageGuide: {
      whenToUse: ["1. Rủ rê bạn bè thân thiết hoặc người dưới (thay cho 〜ましょう).", "2. Tự nhủ với bản thân (VD: Hôm nay sẽ ngủ sớm thôi!).", "3. Làm thành phần cấu tạo trong mẫu 〜ようと思う/思っている."],
      whenNotToUse: ["Tuyệt đối không dùng đứng một mình khi nói chuyện với cấp trên, sếp, người lớn tuổi vì mang tính xấc xược, thất lễ."],
      subjectConstraint: "Ngôi thứ nhất số ít (tự nhủ) hoặc ngôi thứ nhất số nhiều (chúng ta cùng làm).",
      nuance: "Thân mật, suồng sã, nhiệt huyết."
    },
    notes: [
      "⚠️ Cách phát âm: Nhóm 1 kết thúc bằng âm dài hàng [o] (VD: ikou phát âm là ikō kéo dài)."
    ],
    memoryTip: "🧠 Nhớ: 'Nhóm 1 đổi sang hàng Ô thêm U; Nhóm 2 thêm YOU; Shimasu thành Shiyou; Kimasu thành Koyou!'",
    similarGrammars: [
      { similarStructure: "〜ましょう", difference: "〜ましょう là cách rủ rê lịch sự (dùng với mọi đối tượng). Thể ý chí là cách rủ rê suồng sã thân mật (chỉ dùng với bạn bè bằng vai phải lứa hoặc người dưới).", comparisonExample: "行きましょう！(Lịch sự) vs 行こう！(Thân mật)." }
    ],
    examples: [
      { japanese: "今晩、おいしいラーメンを食べに行こう！", vietnamese: "Tối nay đi ăn ramen ngon đi!", explanation: "Rủ rê bạn bè bằng thể ý chí." },
      { japanese: "疲れたから、もう寝よう。", vietnamese: "Mệt rồi, đi ngủ thôi nào.", explanation: "Tự nhủ với bản thân." }
    ],
    exercises: [
      {
        id: "n4_t10_ex1",
        type: "multiple_choice",
        question: "Thể ý chí của động từ 買います (nhóm 1) là:",
        choices: ["買おう", "買よう", "買こう", "買しょう"],
        correct_answer: "買おう",
        explanation: "Âm i chuyển sang hàng o + u: 買います → 買おう."
      }
    ]
  }
];
