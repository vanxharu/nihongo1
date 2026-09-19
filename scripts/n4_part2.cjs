// Topics 11 to 20 of JLPT N4
module.exports = [
  {
    topicNumber: 11,
    lessonNumber: 31,
    pattern: "～ようと思います / ようと思っています",
    structure: "V-ý chí (意向形) + と思います / と思っています",
    meaning: "Định / Đang có ý định làm gì",
    explanation: "Diễn tả dự định làm một việc gì đó của người nói. Dùng 'と思います' cho ý định vừa nảy sinh tại thời điểm nói; dùng 'と思っています' cho ý định đã hình thành từ trước và vẫn đang tiếp diễn.",
    exampleJp: "日本へ留学しようと思っています。",
    exampleVi: "Tôi đang có dự định sẽ đi du học Nhật Bản.",
    overview: "Mẫu câu dự định then chốt trong Minna bài 31. Khác biệt then chốt giữa 'と思います' và 'と思っています' thường xuyên xuất hiện trong các câu hỏi ngữ pháp đánh lừa của kỳ thi JLPT N4.",
    formationRules: [
      { partOfSpeech: "Động từ thể ý chí", rule: "V-ý chí + と思います", example: "国へ帰ろうと思います (Tôi nghĩ mình sẽ về nước - vừa nảy sinh ý định)", meaning: "Ý định bộc phát, chỉ dùng cho ngôi thứ 1" },
      { partOfSpeech: "Động từ thể ý chí", rule: "V-ý chí + と思っています", example: "新しい車を買おうと思っています (Tôi đang dự định mua xe mới - ấp ủ từ trước)", meaning: "Ý định ấp ủ, dùng được cho cả ngôi thứ 1 và ngôi thứ 3" }
    ],
    usageGuide: {
      whenToUse: ["Bày tỏ dự định, kế hoạch cá nhân.", "Dùng 'と思っています' khi nói về dự định của người thứ 3 (VD: 彼は日本へ行こうと思っています)."],
      whenNotToUse: ["Tuyệt đối KHÔNG dùng 'と思います' cho người thứ 3 (không được nói: 彼は行こうと思います)."],
      subjectConstraint: "と思います chỉ dùng cho ngôi 1. と思っています dùng cho cả ngôi 1 và ngôi 3.",
      nuance: "Mang tính chủ quan của người nói, chưa có lịch trình ấn định khách quan như 予定."
    },
    notes: [
      "⚠️ Phân biệt ngôi: Khi nói về dự định của bạn bè, người khác: '田中さんは会社を辞めようと思っています' (Đúng). Nếu dùng '辞めようと思います' là SAI ngữ pháp!"
    ],
    memoryTip: "🧠 Nhớ: 'Ý định tức thì dùng TO OMOIMASU; Ấp ủ chuẩn bị và nói về người khác thì dùng TO OMOTTE IMASU!'",
    similarGrammars: [
      { similarStructure: "〜つもりです", difference: "〜つもり mang ý chí kiên quyết hơn (quyết tâm làm). 〜ようと思う mang tính thăm dò, suy nghĩ trong đầu nhiều hơn.", comparisonExample: "タバコをやめようと思っています (Đang nghĩ sẽ bỏ thuốc) vs タバコをやめるつもりです (Quyết tâm bỏ thuốc)." }
    ],
    examples: [
      { japanese: "週末は家でゆっくり休もうと思います。", vietnamese: "Cuối tuần tôi định sẽ ở nhà nghỉ ngơi thong thả.", explanation: "Ý định tại thời điểm nói." },
      { japanese: "来年、JLPT N4を受けようと思っています。", vietnamese: "Tôi đang có dự định năm tới sẽ thi JLPT N4.", explanation: "Ý định ấp ủ từ trước bằng と思っています." }
    ],
    exercises: [
      {
        id: "n4_t11_ex1",
        type: "multiple_choice",
        question: "Chọn câu đúng khi nói về dự định của anh Tanaka: 'Anh Tanaka đang định mua nhà':",
        choices: ["田中さんは家を買おうと思っています。", "田中さんは家を買おうと思います。", "田中さんは家を買うと思います。", "田中さんは家を買ったと思います。"],
        correct_answer: "田中さんは家を買おうと思っています。",
        explanation: "Nói về dự định của người thứ 3 bắt buộc dùng thể tiếp diễn 'と思っています'."
      }
    ]
  },
  {
    topicNumber: 12,
    lessonNumber: 36,
    pattern: "～ようになる / ～なくなる",
    structure: "V-khả năng + ようになる / V-khả năng(phủ định) + なくなる",
    meaning: "Trở nên có thể... / Không còn có thể... (Biến đổi về khả năng, thói quen)",
    explanation: "Diễn tả sự thay đổi trạng thái từ chưa biết làm sang đã làm được (ようになる), hoặc từ từng làm được sang không còn làm được nữa (なくなる).",
    exampleJp: "毎日練習して、日本語が上手に話せるようになりました。",
    exampleVi: "Luyện tập mỗi ngày nên tôi đã trở nên có thể nói tiếng Nhật thành thạo.",
    overview: "Mẫu câu chỉ sự chuyển biến năng lực hoặc tập quán trong Minna bài 36. Cực kỳ thông dụng để khoe sự tiến bộ khi học tập một kỹ năng mới.",
    formationRules: [
      { partOfSpeech: "Chưa thể → Có thể", rule: "V-khả năng / V-dict + ようになる", example: "読めるようになる (Trở nên đọc được), 食べるようになる (Bắt đầu ăn được)", meaning: "Biến đổi tích cực sang có thể" },
      { partOfSpeech: "Có thể → Không thể", rule: "V-khả năng(phủ định) bỏ い + くなる", example: "読めなくなる (Không còn đọc được nữa), 食べなくなる (Không còn ăn nữa)", meaning: "Biến đổi sang không thể" }
    ],
    usageGuide: {
      whenToUse: ["Diễn tả sự tiến bộ kỹ năng sau một quá trình nỗ lực (biết bơi, nói được ngoại ngữ, đi được xe đạp).", "Diễn tả sự thay đổi thói quen theo thời gian (hồi nhỏ không ăn được cá, giờ ăn được)."],
      whenNotToUse: ["Không dùng cho những hành động tức thời chỉ trong tích tắc."],
      subjectConstraint: "Người hoặc thực thể trải qua sự biến đổi.",
      nuance: "Quá trình biến đổi tự nhiên qua thời gian."
    },
    notes: [
      "⚠️ Động từ đứng trước 'ようになる' thường là Động từ thể khả năng (話せる, 泳げる) hoặc động từ tự phát biểu thị trạng thái không có ý chí."
    ],
    memoryTip: "🧠 Nhớ: 'Tiến bộ thì YOU NI NARU (đã làm được rồi); Thoái lui thì NAKUNARU (hết làm được rồi)!'",
    similarGrammars: [
      { similarStructure: "〜ようにする", difference: "〜ようになる là trạng thái biến đổi tự nhiên (trở nên). 〜ようにする là nỗ lực chủ quan của bản thân (cố gắng làm gì).", comparisonExample: "早く起きられるようになった (Tự nhiên đã dậy sớm được rồi) vs 早く起きるようにしている (Tôi đang cố gắng dậy sớm)." }
    ],
    examples: [
      { japanese: "眼鏡をかければ、小さい字もよく見えるようになります。", vietnamese: "Nếu đeo kính vào thì bạn sẽ nhìn rõ được cả những chữ nhỏ.", explanation: "Biến đổi khả năng bằng 見えるようになる." },
      { japanese: "忙しくて、最近本を読まなくなりました。", vietnamese: "Vì bận rộn nên gần đây tôi không còn đọc sách nữa.", explanation: "Thay đổi thói quen bằng 読まなくなる." }
    ],
    exercises: [
      {
        id: "n4_t12_ex1",
        type: "multiple_choice",
        question: "Chọn dạng đúng: 練習すれば、誰でも泳げる（　　）よ。",
        choices: ["ようになる", "ようにする", "ようにある", "ようにつく"],
        correct_answer: "ようになる",
        explanation: "Biểu thị sự biến đổi năng lực 'trở nên có thể bơi được' dùng 'ようになる'."
      }
    ]
  },
  {
    topicNumber: 13,
    lessonNumber: 36,
    pattern: "～ようにする",
    structure: "V-dict / V-nai + ようにする / ようにしてください",
    meaning: "Cố gắng làm / Cố gắng không làm... (Tạo thói quen hoặc nhắc nhở nhẹ nhàng)",
    explanation: "Biểu thị nỗ lực có ý thức của bản thân nhằm hình thành một thói quen tốt; hoặc dùng '〜ようにしてください' để nhắc nhở, khuyên bảo đối phương một cách khéo léo, gián tiếp.",
    exampleJp: "健康のために、毎日野菜を食べるようにしています。",
    exampleVi: "Vì sức khỏe, mỗi ngày tôi đều cố gắng ăn nhiều rau.",
    overview: "Mẫu câu nỗ lực rèn luyện và nhắc nhở tinh tế trong Minna bài 36. Được ưa chuộng đặc biệt trong môi trường công sở Nhật Bản khi muốn yêu cầu đồng nghiệp tuân thủ quy định một cách mềm mại.",
    formationRules: [
      { partOfSpeech: "Cố gắng làm thói quen", rule: "V-dict + ようにしています", example: "毎日運動するようにしています (Tôi cố gắng tập thể dục mỗi ngày)", meaning: "Đang duy trì nỗ lực thường xuyên" },
      { partOfSpeech: "Cố gắng tránh / kiêng", rule: "V-nai + ようにしています", example: "甘い物を食べないようにしています (Tôi cố gắng không ăn đồ ngọt)", meaning: "Nỗ lực kiềm chế" },
      { partOfSpeech: "Khuyên bảo nhẹ nhàng", rule: "V-dict / V-nai + ようにしてください", example: "明日は遅刻しないようにしてください (Ngày mai xin cố gắng đừng đi muộn nhé)", meaning: "Nhắc nhở gián tiếp lịch sự" }
    ],
    usageGuide: {
      whenToUse: ["1. Tự nhắc nhở bản thân duy trì nỗ lực thành thói quen (ようにしています).", "2. Đưa ra chỉ thị, nhắc nhở đồng nghiệp/cấp dưới một cách nhã nhặn (ようにしてください)."],
      whenNotToUse: ["Tuyệt đối không dùng '〜ようにしてください' cho yêu cầu hành động CẦN LÀM NGAY TẠI CHỖ (VD: 'Đưa tôi cây bút' không được nói 'ペンを渡すようにしてください', mà phải nói 'ペンを渡してください')."],
      subjectConstraint: "Bản thân (nỗ lực) hoặc đối phương (nhắc nhở).",
      nuance: "Nhẹ nhàng, gián tiếp, lịch thiệp."
    },
    notes: [
      "⚠️ Phân biệt với ください thông thường: 〜てください là mệnh lệnh trực tiếp; 〜ようにしてください là nhắc nhở tuân thủ thói quen hoặc quy tắc dài hạn."
    ],
    memoryTip: "🧠 Nhớ: 'Cố gắng thành thói quen thì YOU NI SURU; Yêu cầu ngay lập tức thì TE KUDASAI!'",
    similarGrammars: [
      { similarStructure: "〜ようにしてください vs 〜てください", difference: "てください dùng cho hành động tức thì. ようにしてください dùng cho thói quen hoặc hành động xảy ra trong tương lai cần lưu ý.", comparisonExample: "窓を開けてください。(Hãy mở cửa sổ ngay) vs 窓を閉めるようにしてください。(Hãy luôn chú ý đóng cửa sổ khi ra về)." }
    ],
    examples: [
      { japanese: "寝る前に、スマホを見ないようにしています。", vietnamese: "Tôi đang cố gắng không xem điện thoại trước khi đi ngủ.", explanation: "Tạo thói quen tốt bằng V-nai ようにしています." },
      { japanese: "出かけるときは、必ず鍵をかけるようにしてください。", vietnamese: "Khi ra ngoài, xin hãy luôn chú ý khóa cửa cẩn thận nhé.", explanation: "Nhắc nhở quy tắc bằng ようにしてください." }
    ],
    exercises: [
      {
        id: "n4_t13_ex1",
        type: "multiple_choice",
        question: "Chọn câu đúng để nhắc nhở khéo léo: 'Từ nay xin hãy chú ý đừng đến muộn':",
        choices: ["遅刻しないようにしてください。", "遅刻しないでください。", "遅刻しなくなるようにしてください。", "遅刻しないようにします。"],
        correct_answer: "遅刻しないようにしてください。",
        explanation: "Nhắc nhở tuân thủ quy tắc dài hạn một cách khéo léo dùng '〜ないようにしてください'."
      }
    ]
  },
  {
    topicNumber: 14,
    lessonNumber: 31,
    pattern: "～つもりです",
    structure: "V-dict / V-nai + つもりです (Phủ định: つもりはない / つもりはありません)",
    meaning: "Dự định / Quyết tâm sẽ làm (không làm) điều gì",
    explanation: "Thể hiện ý chí, quyết tâm chắc chắn của người nói về việc sẽ thực hiện hoặc dứt khoát không thực hiện một hành động nào đó trong tương lai.",
    exampleJp: "大学を卒業したら、日本で働くつもりです。",
    exampleVi: "Sau khi tốt nghiệp đại học, tôi dự định sẽ làm việc tại Nhật Bản.",
    overview: "Mẫu câu dự định có tính quyết tâm cao trong Minna bài 31. Khác với 〜ようと思います (mới là ý nghĩ), 〜つもり biểu thị ý chí kiên định đã có sự suy tính kỹ càng.",
    formationRules: [
      { partOfSpeech: "Dự định sẽ làm", rule: "V thể từ điển (辞書形) + つもりです", example: "国へ帰るつもりです (Tôi dự định sẽ về nước)", meaning: "Quyết tâm làm V" },
      { partOfSpeech: "Dự định không làm (cách 1)", rule: "V thể ない + つもりです", example: "結婚しないつもりです (Tôi định sẽ không kết hôn)", meaning: "Cách nói thông dụng" },
      { partOfSpeech: "Dự định không làm (cách 2)", rule: "V-dict + つもりはありません", example: "行くつもりはありません (Tôi hoàn toàn không có ý định đi)", meaning: "Phủ định dứt khoát, mạnh mẽ hơn" }
    ],
    usageGuide: {
      whenToUse: ["Trình bày ý định, quyết tâm cá nhân có tính chuẩn bị."],
      whenNotToUse: ["Không dùng trực tiếp để hỏi kế hoạch của cấp trên, sếp (mang sắc thái hỏi dồn, thiếu lễ phép). Với người trên phải hỏi: 〜ご予定ですか."],
      subjectConstraint: "Chủ yếu là ngôi thứ nhất (bản thân).",
      nuance: "Ý chí chủ quan mạnh mẽ, quyết tâm cao."
    },
    notes: [
      "⚠️ Động từ đứng trước つもり BẮT BUỘC ở thì hiện tại (V-dict hoặc V-nai). Tuyệt đối không chia V-ta trước つもり (không có '行ったつもりです' mang nghĩa dự định; mẫu 'V-ta + つもり' mang nghĩa hoàn toàn khác: 'ngỡ rằng/tưởng rằng').",
      "⚠️ Nếu muốn nói về dự định trong quá khứ mà không thành thì chia quá khứ ở cuối: 〜つもりでした (Tôi đã từng định... nhưng không làm được)."
    ],
    memoryTip: "🧠 Nhớ: 'TSUMORI là quyết tâm sắt đá; Trước TSUMORI chỉ dùng V-dict hoặc V-nai!'",
    similarGrammars: [
      { similarStructure: "〜予定です", difference: "つもり là ý chí chủ quan tự quyết định. 予定 là kế hoạch khách quan đã được lên lịch trình sẵn có thể do tổ chức phân công.", comparisonExample: "明日休むつもりです (Tôi tự định nghỉ) vs 明日出張の予定です (Lịch trình công ty phân công đi công tác)." }
    ],
    examples: [
      { japanese: "夏休みはどこへも行かないつもりです。", vietnamese: "Kỳ nghỉ hè tôi dự định sẽ không đi đâu cả.", explanation: "Dự định không làm bằng V-nai つもりです." },
      { japanese: "たばこはもう二度と吸わないつもりです。", vietnamese: "Tôi quyết tâm sẽ không bao giờ hút thuốc nữa.", explanation: "Hạ quyết tâm mạnh mẽ." }
    ],
    exercises: [
      {
        id: "n4_t14_ex1",
        type: "multiple_choice",
        question: "Chọn câu đúng khi nói 'Tôi đã từng định đi du lịch nhưng bận quá nên thôi':",
        choices: ["旅行に行くつもりでした。", "旅行に行ったつもりです。", "旅行に行くつもりです。", "旅行に行かないつもりでした。"],
        correct_answer: "旅行に行くつもりでした。",
        explanation: "Dự định trong quá khứ mà không thực hiện được chia đuôi '〜つもりでした'."
      }
    ]
  },
  {
    topicNumber: 15,
    lessonNumber: 31,
    pattern: "～予定です",
    structure: "V-dict + 予定です / N + の予定です",
    meaning: "Có kế hoạch / Lịch trình dự kiến làm gì",
    explanation: "Diễn tả một kế hoạch, sự kiện hoặc lịch trình đã được sắp xếp, ấn định khách quan từ trước.",
    exampleJp: "来週から出張の予定です。",
    exampleVi: "Theo lịch trình thì tuần sau tôi sẽ đi công tác.",
    overview: "Mẫu câu diễn đạt lịch trình khách quan trong Minna bài 31. Đây là mẫu lịch sự và an toàn nhất để nói về kế hoạch công việc trong doanh nghiệp Nhật Bản.",
    formationRules: [
      { partOfSpeech: "Động từ", rule: "V thể từ điển + 予定です", example: "飛行機は10時に到着する予定です (Máy bay dự kiến hạ cánh lúc 10 giờ)", meaning: "Lịch trình hành động" },
      { partOfSpeech: "Danh từ", rule: "N + の予定です", example: "会議の予定です (Theo lịch là họp)", meaning: "Danh từ nối bằng の" }
    ],
    usageGuide: {
      whenToUse: ["Nói về lịch trình tàu xe, chuyến bay, cuộc họp, sự kiện công ty, đám cưới, kỳ nghỉ đã chốt ngày giờ.", "Có thể dùng hỏi lịch trình của cấp trên rất lịch sự: 〜ご予定ですか."],
      whenNotToUse: ["Không dùng cho những suy nghĩ bộc phát chưa có sự sắp xếp khách quan."],
      subjectConstraint: "Người, tổ chức hoặc sự vật hiện tượng có lịch trình.",
      nuance: "Khách quan, chính xác, có căn cứ lịch biểu rõ ràng."
    },
    notes: [
      "⚠️ Khi đi với Danh từ bắt buộc phải có trợ từ 'の': N + の予定です (VD: 出張の予定, không nói 出張予定です)."
    ],
    memoryTip: "🧠 Nhớ: 'YOTEI là lịch trình chốt sẵn; Động từ V-dict, Danh từ thêm NO!'",
    similarGrammars: [
      { similarStructure: "〜つもり vs 〜予定", difference: "つもり: ý định chủ quan (tôi muốn thế). 予定: lịch trình khách quan (đã được ấn định, có thể do người khác lên lịch).", comparisonExample: "来月日本へ行くつもりです。(Tôi tự định đi) vs 来月日本へ行く予定です。(Công ty đã book vé ấn định ngày đi)." }
    ],
    examples: [
      { japanese: "新幹線は何時に出発する予定ですか。", vietnamese: "Tàu Shinkansen dự kiến khởi hành lúc mấy giờ?", explanation: "Hỏi lịch trình tàu bằng 予定ですか." },
      { japanese: "午後から部長と面談の予定です。", vietnamese: "Chiều nay theo lịch tôi có buổi phỏng vấn với trưởng phòng.", explanation: "Lịch trình công việc bằng N + の予定." }
    ],
    exercises: [
      {
        id: "n4_t15_ex1",
        type: "multiple_choice",
        question: "Chọn từ thích hợp: 来週は（　　）予定です。",
        choices: ["出張の", "出張な", "出張だ", "出張で"],
        correct_answer: "出張の",
        explanation: "Danh từ nối với 予定 bằng trợ từ 'の': 出張の予定."
      }
    ]
  },
  {
    topicNumber: 16,
    lessonNumber: 26,
    pattern: "Các mẫu câu sử dụng trợ từ「と」(～と思う / ～と言いました)",
    structure: "[Thể thông thường] + と思う / [Mệnh đề trích dẫn] + と言いました",
    meaning: "1. Tôi nghĩ rằng / 2. Đã nói rằng (Trích dẫn trực tiếp & gián tiếp)",
    explanation: "Trợ từ と dùng để liên kết nội dung suy nghĩ trong đầu (〜と思う) hoặc nội dung phát ngôn được trích dẫn lại (〜と言う).",
    exampleJp: "明日は雨が降ると思います。",
    exampleVi: "Tôi nghĩ rằng ngày mai trời sẽ mưa.",
    overview: "Chuyên đề về Trợ từ と đóng vai trò mở ngoặc trích dẫn trong tiếng Nhật (ôn tập Minna 21 và mở rộng N4). Rất quan trọng khi thể hiện quan điểm cá nhân hoặc truyền đạt thông điệp của người khác.",
    formationRules: [
      { partOfSpeech: "Bày tỏ suy nghĩ", rule: "[Thể thông thường] + と思います", example: "日本は物価が高いと思います (Tôi nghĩ giá cả ở Nhật đắt đỏ)", meaning: "Ý kiến, nhận định cá nhân" },
      { partOfSpeech: "Trích dẫn gián tiếp", rule: "[Thể thông thường] + と言いました", example: "田中さんは明日休むと言っていました (Anh Tanaka nói rằng ngày mai anh ấy nghỉ)", meaning: "Thuật lại lời nói của người khác" },
      { partOfSpeech: "Trích dẫn trực tiếp", rule: "「Câu nguyên văn」+ と言いました", example: "先生は「静かにしてください」と言いました (Thầy giáo nói: 'Xin hãy giữ trật tự')", meaning: "Trích dẫn nguyên văn trong ngoặc kép" }
    ],
    usageGuide: {
      whenToUse: ["1. Bày tỏ ý kiến một cách khiêm tốn, tránh khẳng định thô thiển (dùng と思います).", "2. Báo cáo lại lời sếp dặn hoặc thông tin người khác vừa nhắn nhủ."],
      whenNotToUse: ["Khi khẳng định một chân lý khoa học hiển nhiên (mặt trời mọc ở hướng đông) thì không dùng と思います."],
      subjectConstraint: "と思います chỉ dùng cho tôi (ngôi 1). と思っています dùng cho người khác.",
      nuance: "Lịch sự, tôn trọng góc nhìn người nghe."
    },
    notes: [
      "⚠️ Phủ định của 'Tôi nghĩ là không...': Có 2 cách nói: '〜ないと思います' (phổ biến trong tiếng Nhật) hoặc '〜とは思わない' (nhấn mạnh phủ định quan điểm)."
    ],
    memoryTip: "🧠 Nhớ: 'Nghĩ gì nói gì: bỏ vào thể thường, thêm TO OMOIMASU hoặc TO IIMASHITA!'",
    similarGrammars: [
      { similarStructure: "〜そうです (nghe nói)", difference: "と言っていました là trích dẫn người cụ thể nói. そうです là nghe đồn từ nguồn thông tin đại chúng hoặc gián tiếp.", comparisonExample: "田中さんが来ると言っていました (Chính anh Tanaka nói) vs 雨が降るそうです (Nghe dự báo thời tiết nói)." }
    ],
    examples: [
      { japanese: "この問題は難しすぎると思います。", vietnamese: "Tôi nghĩ rằng bài toán này quá khó.", explanation: "Bày tỏ quan điểm cá nhân bằng と思います." },
      { japanese: "社長は会議に参加できないとおっしゃいました。", vietnamese: "Giám đốc đã nói rằng ông không thể tham gia cuộc họp được.", explanation: "Trích dẫn kính ngữ của người bề trên." }
    ],
    exercises: [
      {
        id: "n4_t16_ex1",
        type: "multiple_choice",
        question: "Chọn dạng đúng: 彼は来週（　　）と言っていました。",
        choices: ["来る", "来ます", "来い", "来て"],
        correct_answer: "来る",
        explanation: "Trong mệnh đề trích dẫn gián tiếp, động từ chia ở thể thông thường: 来る."
      }
    ]
  },
  {
    topicNumber: 17,
    lessonNumber: 29,
    pattern: "Tự động từ và tha động từ (自動詞 & 他動詞)",
    structure: "N + が + Tự động từ (自動詞) / N + は + Tân ngữ + を + Tha động từ (他動詞)",
    meaning: "Trạng thái tự phát (Tự động từ) vs Hành động có chủ đích của con người (Tha động từ)",
    explanation: "Tự động từ mô tả hiện tượng tự nhiên, trạng thái tự diễn ra đi với trợ từ が; Tha động từ mô tả hành động có chủ ý của con người tác động lên vật đi với trợ từ を.",
    exampleJp: "ドアが開きました (Cửa mở) vs ドアを開けました (Tôi mở cửa).",
    exampleVi: "Cửa tự mở (tự động từ) vs Ai đó mở cửa (tha động từ).",
    overview: "Chuyên đề Tự động từ - Tha động từ trong Minna bài 29. Đây là chuyên đề quan trọng hàng đầu của N4 với 70 cặp động từ kinh điển hay gặp nhất trong kỳ thi JLPT.",
    formationRules: [
      { partOfSpeech: "Quy tắc đuôi -ARU / -ERU", rule: "-ARU là tự động từ, -ERU là tha động từ", example: "閉まる (tự đóng) ↔ 閉める (đóng cửa), 止まる (tự dừng) ↔ 止める (dừng xe)", meaning: "Quy tắc phổ biến nhất" },
      { partOfSpeech: "Quy tắc đuôi -ERU / -ASU", rule: "-ERU là tự động từ, -ASU là tha động từ", example: "出る (tự ra) ↔ 出す (lấy ra), 逃げる (tự trốn) ↔ 逃がす (thả đi)", meaning: "Tha động từ tận cùng bằng su" },
      { partOfSpeech: "Quy tắc đuôi -U / -ASU", rule: "-U là tự động từ, -ASU là tha động từ", example: "動く (tự chuyển động) ↔ 動かす (di chuyển vật)", meaning: "Hàng u và asu" }
    ],
    usageGuide: {
      whenToUse: ["Dùng tự động từ khi chỉ quan tâm đến hiện trạng của sự vật (cửa đang mở, đèn đang sáng, xe đang đỗ).", "Dùng tha động từ khi nhấn mạnh ai đã làm việc đó (tôi bật đèn, anh ấy tắt quạt)."],
      whenNotToUse: ["Không dùng trợ từ を trước tự động từ (ngoại lệ: bay qua bầu trời, đi dạo công viên: 空を飛ぶ, 公園を散歩する)."],
      subjectConstraint: "Tự động từ: sự vật là chủ ngữ. Tha động từ: con người là chủ ngữ tác động.",
      nuance: "Tự nhiên, khách quan (Tự động từ) vs Chủ đích, tác động (Tha động từ)."
    },
    notes: [
      "⚠️ Trợ từ vàng: N + が + Tự động từ (窓が開く); N + を + Tha động từ (窓を開ける).",
      "⚠️ Bảng cặp từ kinh điển: 開く/開ける, 閉まる/閉める, つく/つける, 消える/消す, 割れる/割る, 折れる/折る, 破れる/破る, 汚れる/汚す, 壊れる/壊す, 落ちる/落とす."
    ],
    memoryTip: "🧠 Nhớ: 'Tự động từ đi với GÁ, mô tả sự việc tự nhiên; Tha động từ đi với Ố, con người thò tay tác động!'",
    similarGrammars: [
      { similarStructure: "〜ています (tự động từ) vs 〜てあります (tha động từ)", difference: "ドアが開いています (Cửa đang mở - tự nhiên). ドアが開けてあります (Cửa đã được mở sẵn có chủ đích chuẩn bị).", comparisonExample: "窓が閉まっています (Cửa sổ đóng) vs 窓が閉めてあります (Cửa sổ đã được ai đó đóng sẵn)." }
    ],
    examples: [
      { japanese: "電気がつきました。", vietnamese: "Điện đã sáng (tự nhiên sáng).", explanation: "Tự động từ つく đi với が." },
      { japanese: "部屋の電気を消してください。", vietnamese: "Xin hãy tắt đèn phòng đi.", explanation: "Tha động từ 消す đi với を." }
    ],
    exercises: [
      {
        id: "n4_t17_ex1",
        type: "multiple_choice",
        question: "Chọn từ đúng: 風で窓が（　　）ました。",
        choices: ["開きました", "開けました", "閉めました", "消しました"],
        correct_answer: "開きました",
        explanation: "Gió thổi làm cửa sổ tự mở ra, có trợ từ 'が' nên phải dùng tự động từ '開きました'."
      }
    ]
  },
  {
    topicNumber: 18,
    lessonNumber: 35,
    pattern: "Câu điều kiện ～ば (条件形)",
    structure: "Nhóm 1: [u] → [e]ば / Nhóm 2: [ru] → [re]ば / Nhóm 3: すれば, くれば / A-i: ければ / A-na & N: なら(ば)",
    meaning: "Nếu... thì... (Điều kiện giả định logic, mang tính tất yếu)",
    explanation: "Diễn tả điều kiện cần thiết để một kết quả hoặc hành động xảy ra. Nhấn mạnh vào quy luật tự nhiên, chân lý hoặc phương pháp để đạt được mục đích.",
    exampleJp: "ボタンを押せば、窓が開きます。",
    exampleVi: "Nếu nhấn nút thì cửa sổ sẽ mở ra.",
    overview: "Thể điều kiện 〜ば trong Minna bài 35. Là một trong 4 trụ cột câu điều kiện của tiếng Nhật (ば, たら, と, なら).",
    formationRules: [
      { partOfSpeech: "Nhóm 1", rule: "Đổi âm [u] thành âm [e] + ば", example: "行けば, 読めば, 話せば, 買えば", meaning: "Hàng [i]masu → hàng [e]ba" },
      { partOfSpeech: "Nhóm 2", rule: "Bỏ ます thêm れば", example: "食べれば, 見れば, 調べれば", meaning: "Thêm れば" },
      { partOfSpeech: "Nhóm 3", rule: "Bất quy tắc", example: "すれば, 来(く)れば", meaning: "Học thuộc lòng" },
      { partOfSpeech: "Tính từ đuôi い & Phủ định ない", rule: "Bỏ い thêm ければ", example: "高ければ, 安ければ, なければ (nếu không có)", meaning: "Đuôi ければ" },
      { partOfSpeech: "Tính từ đuôi な & Danh từ", rule: "Thêm なら(ば)", example: "暇なら(ば), 静かなら(ば), 雨なら(ば)", meaning: "Thêm なら" }
    ],
    usageGuide: {
      whenToUse: ["1. Chỉ dẫn thao tác máy móc, chỉ đường (nhấn nút thì mở).", "2. Quy luật tự nhiên, công thức toán học.", "3. Thành ngữ, tục ngữ, cách nói quán dụng: 〜ば〜ほど (càng... càng...)."],
      whenNotToUse: ["Nếu vế sau là mệnh lệnh, ý chí, rủ rê (てください, ましょう, つもり) thì chủ ngữ 2 vế KHÔNG ĐƯỢC cùng là một người (trừ khi vế 1 là tính từ hoặc trạng thái). Trường hợp đó phải dùng 〜たら."],
      subjectConstraint: "Quy luật logic giữa 2 sự việc.",
      nuance: "Trang trọng, logic, tất yếu."
    },
    notes: [
      "⚠️ Dạng phủ định: V-ない đổi thành V-なければ (VD: 行かなければ - nếu không đi).",
      "⚠️ Tục ngữ kinh điển: '聞くは一時の恥、聞かぬは一生の恥' và '住めば都' (Ở đâu quen đó sẽ thành quê hương)."
    ],
    memoryTip: "🧠 Nhớ: 'Nhóm 1 đổi sang hàng Ê thêm BA; Tính từ đuôi I đổi thành KEREBA; Phủ định đổi thành NAKEREBA!'",
    similarGrammars: [
      { similarStructure: "〜たら", difference: "〜たら là câu điều kiện đa dụng nhất dùng được cho mọi tình huống giao tiếp thường ngày. 〜ば nghiêng về quy luật logic, học thuật, lý thuyết hơn.", comparisonExample: "安ければ買います。(Logic: nếu rẻ thì sẽ mua) vs 安かったら買ってください。(Mệnh lệnh vế sau bắt buộc dùng たら)." }
    ],
    examples: [
      { japanese: "春になれば、桜の花が咲きます。", vietnamese: "Nếu mùa xuân đến thì hoa anh đào sẽ nở.", explanation: "Quy luật tự nhiên của đất trời bằng 〜ば." },
      { japanese: "安ければ、たくさん買いたいです。", vietnamese: "Nếu rẻ thì tôi muốn mua thật nhiều.", explanation: "Điều kiện giả định tính từ bằng ければ." }
    ],
    exercises: [
      {
        id: "n4_t18_ex1",
        type: "multiple_choice",
        question: "Dạng điều kiện đúng của động từ 飲みます (nhóm 1) là:",
        choices: ["飲めば", "飲みれば", "飲まば", "飲むば"],
        correct_answer: "飲めば",
        explanation: "Động từ nhóm 1 đổi âm i thành e + ば: 飲みます → 飲めば."
      }
    ]
  },
  {
    topicNumber: 19,
    lessonNumber: 35,
    pattern: "Câu điều kiện ～たら",
    structure: "[Thể quá khứ た / かった / だった] + ら",
    meaning: "Nếu... thì... / Sau khi... thì...",
    explanation: "Mẫu câu điều kiện phổ biến và linh hoạt nhất trong tiếng Nhật. Có 2 nghĩa chính: 1. Giả định điều kiện (nếu); 2. Tuần tự thời gian (sau khi hoàn thành vế 1 thì làm vế 2).",
    exampleJp: "雨が降ったら、試合は中止になります。",
    exampleVi: "Nếu trời mưa thì trận đấu sẽ bị hủy bỏ.",
    overview: "Mẫu câu điều kiện toàn năng trong Minna bài 25 & 35. Khác với ば và と, vế sau của 〜たら có thể thoải mái sử dụng mọi dạng câu: mệnh lệnh, nhờ vả, ý chí, rủ rê, khuyên bảo.",
    formationRules: [
      { partOfSpeech: "Động từ", rule: "V-た + ら / V-なかった + ら", example: "行ったら (nếu đi), 行かなかったら (nếu không đi)", meaning: "Động từ thể た thêm ら" },
      { partOfSpeech: "Tính từ đuôi い", rule: "A-i (bỏ い) + かった + ら", example: "安かったら (nếu rẻ), 寒かったら (nếu lạnh)", meaning: "Thể quá khứ tính từ thêm ら" },
      { partOfSpeech: "Tính từ đuôi な & Danh từ", rule: "A-na / N + だった + ら", example: "暇だったら (nếu rảnh), 雨だったら (nếu trời mưa)", meaning: "だった thêm ら" }
    ],
    usageGuide: {
      whenToUse: ["1. Giả định tình huống 1 lần trong đời sống hàng ngày.", "2. Vế sau chứa mệnh lệnh (てください), rủ rê (ましょう), ý chí (つもり), khuyên bảo (ほうがいい).", "3. Hành động xảy ra xong rồi mới làm hành động kế tiếp (sau khi tới ga thì gọi cho tôi nhé)."],
      whenNotToUse: ["Không dùng cho quy luật chân lý tất yếu hiển nhiên của khoa học tự nhiên (khi đó phải dùng 〜と)."],
      subjectConstraint: "Linh hoạt nhất trong 4 mẫu điều kiện.",
      nuance: "Tự nhiên, gần gũi, đa dụng."
    },
    notes: [
      "⚠️ Phân biệt 2 ý nghĩa: '日本へ行ったら、寿司を食べたい' (Nếu sang Nhật: điều kiện chưa chắc xảy ra) vs '10時になったら、出かけましょう' (Khi tới 10 giờ: tuần tự thời gian chắc chắn tới).",
      "⚠️ Nếu muốn nhờ vả đối phương thì CHỈ ĐƯỢC DÙNG 〜たら, không được dùng 〜と hay 〜ば: '時間が合ったら、手伝ってください' (Đúng)."
    ],
    memoryTip: "🧠 Nhớ: 'Cứ chia về thể TẢ rồi thêm RA; Muốn rủ muốn xin cứ dùng TARA!'",
    similarGrammars: [
      { similarStructure: "〜ば vs 〜たら", difference: "Vế 2 là mệnh lệnh (てください), ý muốn cá nhân (たい) → Ưu tiên tuyệt đối dùng 〜たら!", comparisonExample: "駅に着いたら、電話してください。(Bắt buộc dùng たら vì vế sau là nhờ vả ください)." }
    ],
    examples: [
      { japanese: "お金がたくさんあったら、世界旅行をしたいです。", vietnamese: "Nếu có nhiều tiền, tôi muốn đi du lịch vòng quanh thế giới.", explanation: "Giả định mong muốn cá nhân bằng V-た + ら." },
      { japanese: "仕事が終わったら、飲みに行きましょう。", vietnamese: "Sau khi xong việc thì đi uống một ly nhé.", explanation: "Tuần tự thời gian kết hợp rủ rê." }
    ],
    exercises: [
      {
        id: "n4_t19_ex1",
        type: "multiple_choice",
        question: "Chọn câu đúng khi muốn nói 'Nếu ngày mai trời đẹp thì hãy đi dã ngoại nhé':",
        choices: ["明日いい天気だったら、ピクニックに行きましょう。", "明日いい天気だと、ピクニックに行きましょう。", "明日いい天気なら、ピクニックに行きましょうか。", "明日いい天気になれば、ピクニックに行きましょう。"],
        correct_answer: "明日いい天気だったら、ピクニックに行きましょう。",
        explanation: "Khi vế sau là câu rủ rê (〜ましょう), mẫu câu điều kiện thích hợp và tự nhiên nhất là 〜たら."
      }
    ]
  },
  {
    topicNumber: 20,
    lessonNumber: 35,
    pattern: "Câu điều kiện ～と",
    structure: "V-dict / V-nai / A-i / A-naだ / Nだ + と",
    meaning: "Hễ mà... thì... / Cứ hễ... là...",
    explanation: "Diễn tả một mối liên hệ tất yếu, máy móc hoặc tự nhiên: cứ hễ hành động vế 1 xảy ra thì hành động vế 2 sẽ tự động xảy ra theo một hệ quả đương nhiên.",
    exampleJp: "このボタンを押すと、おつりが出ます。",
    exampleVi: "Hễ bấm cái nút này thì tiền thừa sẽ chạy ra.",
    overview: "Mẫu câu điều kiện tất yếu trong Minna bài 23 & 35. Đặc trưng lớn nhất của 〜と là tính khách quan máy móc, tuyệt đối không bị chi phối bởi ý chí hay cảm xúc của con người.",
    formationRules: [
      { partOfSpeech: "Động từ", rule: "V-dict / V-nai + と", example: "右へ曲がると (Hễ rẽ phải thì...)", meaning: "Động từ thể từ điển hoặc thể ない" },
      { partOfSpeech: "Tính từ đuôi い", rule: "A-i + と", example: "寒くなると (Hễ trời trở lạnh thì...)", meaning: "Tính từ đuôi い giữ nguyên" },
      { partOfSpeech: "Tính từ đuôi な & Danh từ", rule: "A-na / N + だ + と", example: "春だと (Hễ là mùa xuân thì...)", meaning: "Thêm だ" }
    ],
    usageGuide: {
      whenToUse: ["1. Thao tác máy móc (bấm nút thì nước chảy, kéo cần gạt thì đèn sáng).", "2. Hướng dẫn chỉ đường (đi thẳng 100m rẽ phải thì sẽ thấy bưu điện).", "3. Quy luật tự nhiên hiển nhiên (nước sôi đến 100 độ thì bốc hơi).", "4. Phát hiện bất ngờ sau khi làm V1 (vừa mở cửa ra thì thấy trời đổ mưa)."],
      whenNotToUse: ["CẤM DÙNG mệnh lệnh, nhờ vả, rủ rê, ý chí ở vế sau (KHÔNG ĐƯỢC dùng ください, ましょう, つもり, たい sau と)."],
      subjectConstraint: "Khách quan, máy móc.",
      nuance: "Tất yếu, phản xạ tức thì."
    },
    notes: [
      "⚠️ Lỗi chí mạng trong JLPT: Không bao giờ được dùng '〜と、〜てください' (VD: '雨が降ると、傘を持って行ってください' là SAI hoàn toàn! Bắt buộc phải dùng たら)."
    ],
    memoryTip: "🧠 Nhớ: 'TO là công tắc máy móc: Bấm nút là máy chạy; Cấm tiệt mệnh lệnh rủ rê!'",
    similarGrammars: [
      { similarStructure: "〜たら vs 〜と", difference: "〜と mang tính máy móc tất nhiên 100%, cấm dùng mệnh lệnh. 〜たら dùng được cho cả giả định lẫn mệnh lệnh.", comparisonExample: "ボタンを押すと、ドアが開きます (Máy móc tự mở) vs 時間があったら、来てください (Nhờ vả phải dùng たら)." }
    ],
    examples: [
      { japanese: "この道をまっすぐ行くと、左側に銀行があります。", vietnamese: "Cứ đi thẳng con đường này thì bên tay trái sẽ có ngân hàng.", explanation: "Chỉ dẫn đường đi bằng 〜と." },
      { japanese: "朝起きると、雪が降っていました。", vietnamese: "Sáng vừa thức dậy thì tôi phát hiện tuyết đang rơi.", explanation: "Phát hiện sự việc bằng 〜と." }
    ],
    exercises: [
      {
        id: "n4_t20_ex1",
        type: "multiple_choice",
        question: "Chọn câu viết đúng ngữ pháp:",
        choices: [
          "右へ曲がると、スーパーがあります。",
          "右へ曲がると、スーパーへ行ってください。",
          "右へ曲がると、スーパーへ行きましょう。",
          "右へ曲がると、スーパーへ行くつもりです。"
        ],
        correct_answer: "右へ曲がると、スーパーがあります。",
        explanation: "Vế sau của cấu trúc điều kiện 〜と tuyệt đối không dùng mệnh lệnh (てください), rủ rê (ましょう) hay ý chí (つもり)."
      }
    ]
  }
];
