// Topics 31 to 40 of JLPT N4
module.exports = [
  {
    topicNumber: 31,
    lessonNumber: 46,
    pattern: "「もう」 và 「まだ」",
    structure: "1. もう + V-ました (Đã rồi) / 2. まだ + V-ていません (Vẫn chưa) / 3. まだ + V-ています (Vẫn đang) / 4. もう + V-ません (Không còn nữa)",
    meaning: "Đã làm rồi vs Vẫn chưa làm; Vẫn đang tiếp diễn vs Không còn nữa",
    explanation: "Bộ đôi phó từ chỉ trạng thái tiến độ thời gian cốt lõi trong tiếng Nhật. Nắm chắc 4 cấu trúc kết hợp khẳng định - phủ định của もう và まだ.",
    exampleJp: "もう昼ご飯を食べましたか。いいえ、まだ食べていません。",
    exampleVi: "Bạn đã ăn cơm trưa chưa? Chưa, tôi vẫn chưa ăn.",
    overview: "Chuyên đề phân biệt trạng thái thời gian kinh điển trong Minna bài 31 & 46. Đây là bẫy ngữ pháp thường trực trong các bài thi nghe hiểu và ngữ pháp N4.",
    formationRules: [
      { partOfSpeech: "Đã làm xong", rule: "もう + V-ました", example: "もう宿題をしました (Tôi đã làm bài tập rồi)", meaning: "Hành động đã hoàn tất" },
      { partOfSpeech: "Vẫn chưa làm", rule: "まだ + V-ていません", example: "まだ宿題をしていません (Tôi vẫn chưa làm bài tập)", meaning: "Chưa hoàn tất, tuyệt đối không dùng まだ〜ませんでした" },
      { partOfSpeech: "Vẫn đang tiếp diễn", rule: "まだ + V-ています", example: "まだ雨が降っています (Trời vẫn đang mưa)", meaning: "Trạng thái vẫn tiếp tục" },
      { partOfSpeech: "Không còn nữa", rule: "もう + V-ません / V-ない", example: "もうお腹がいっぱいで、食べられません (Đã no rồi không thể ăn thêm được nữa)", meaning: "Chấm dứt khả năng/hành động" }
    ],
    usageGuide: {
      whenToUse: ["Hỏi và trả lời tiến độ hoàn thành công việc, báo cáo sếp."],
      whenNotToUse: ["Khi trả lời cho câu hỏi 'Đã làm chưa?', nếu chưa làm TUYỆT ĐỐI KHÔNG NÓI 'まだ〜ませんでした' (đây là lỗi sai số 1 của người học). Phải nói 'まだ〜ていません'!"],
      subjectConstraint: "Không giới hạn.",
      nuance: "Chính xác về trạng thái hoàn tất."
    },
    notes: [
      "⚠️ Lỗi sai sống còn: Khi chưa làm, trả lời 'いいえ、まだです' hoặc 'いいえ、まだ食べていません'. Nếu nói 'いいえ、食べませんでした' là người nghe hiểu nhầm bạn nhịn luôn không thèm ăn!"
    ],
    memoryTip: "🧠 Nhớ: 'Hỏi MOU thì đáp MADA TE IMASEN; Tuyệt đối không dùng MADA MASENDESHITA!'",
    similarGrammars: [
      { similarStructure: "まだ〜ていません vs 〜ませんでした", difference: "まだ〜ていません: hiện tại chưa làm nhưng tương lai sẽ làm. 〜ませんでした: quá khứ đã không làm (chấm dứt luôn).", comparisonExample: "まだ宿題をしていません (Tí nữa sẽ làm) vs 昨日は宿題をしませんでした (Hôm qua không làm)." }
    ],
    examples: [
      { japanese: "新幹線はもう出発しましたか。", vietnamese: "Tàu Shinkansen đã khởi hành chưa?", explanation: "Hỏi hoàn tất bằng もう + V-ました." },
      { japanese: "12時ですが、彼はまだ寝ています。", vietnamese: "Đã 12 giờ trưa rồi mà anh ấy vẫn còn đang ngủ.", explanation: "Trạng thái tiếp diễn bằng まだ + V-ています." }
    ],
    exercises: [
      {
        id: "n4_t31_ex1",
        type: "multiple_choice",
        question: "A: 'もうレポートを書きましたか。' - B: 'いいえ、（　　）。'",
        choices: ["まだ書いていません", "書きませんでした", "もう書きません", "まだ書きました"],
        correct_answer: "まだ書いていません",
        explanation: "Trả lời phủ định cho câu hỏi hoàn tất 'もう〜ましたか' bắt buộc là 'まだ〜ていません'."
      }
    ]
  },
  {
    topicNumber: 32,
    lessonNumber: 42,
    pattern: "～ために、～ように (Chỉ mục đích)",
    structure: "1. V-dict / Nの + ために (Mục đích có ý chí) vs 2. V-khả năng / V-nai + ように (Mục đích ngoài tầm kiểm soát)",
    meaning: "Để... / Nhằm mục đích... / Để có thể...",
    explanation: "Cả hai cấu trúc đều mang nghĩa 'để làm gì', nhưng ために dùng cho mục đích chủ động có ý chí của cùng một chủ thể; còn ように dùng cho mục đích là trạng thái, khả năng hoặc khác chủ thể.",
    exampleJp: "家を買うために、貯金しています (Mua nhà) vs よく見えるように、前の方に座ります (Để nhìn rõ).",
    exampleVi: "Để mua nhà (hành động ý chí có thể kiểm soát) vs Để có thể nhìn rõ (trạng thái ngoài tầm kiểm soát).",
    overview: "Chuyên đề Phân biệt Mục đích ために và ように trong Minna bài 42. Đây là một trong những điểm ngữ pháp được coi là 'kinh điển nhất' của trình độ N4, xuất hiện đều đặn trong mọi kỳ thi JLPT.",
    formationRules: [
      { partOfSpeech: "～ために (Có ý chí)", rule: "Động từ ý chí (V-dict) / Danh từ (N + の) + ために", example: "留学するために / 健康のために", meaning: "Chủ ngữ 2 vế PHẢI CÙNG LÀ 1 NGƯỜI" },
      { partOfSpeech: "～ように (Không ý chí / Khả năng / Phủ định)", rule: "V-khả năng / V không ý chí (わかる, 見える) / V-nai + ように", example: "合格できるように / 風邪をひかないように", meaning: "Mục đích là trạng thái hoặc mong muốn người khác" }
    ],
    usageGuide: {
      whenToUse: ["1. Dùng ために khi hành động vế 1 là hành động có ý chí kiểm soát được (mua nhà, học tập, mở công ty, kết hôn).", "2. Dùng ように khi hành động vế 1 ở thể khả năng (để có thể bơi), thể phủ định (để không bị muộn), hoặc 2 vế khác chủ ngữ (để con học tốt)."],
      whenNotToUse: ["CẤM dùng V thể phủ định (V-nai) trước ために! Để không bị... BẮT BUỘC dùng '〜ないように'."],
      subjectConstraint: "ために: 2 vế cùng chủ ngữ. ように: 2 vế có thể khác chủ ngữ.",
      nuance: "Chủ động kiểm soát (ために) vs Trạng thái hướng tới (ように)."
    },
    notes: [
      "⚠️ 3 dấu hiệu nhận biết dùng ように 100% ăn điểm:",
      "1. Động từ thể Khả năng (話せるように, 合格できるように).",
      "2. Động từ thể Phủ định (遅刻しないように, 忘れないように).",
      "3. Hai vế khác chủ ngữ (子どもが勉強するように、部屋を静かにする)."
    ],
    memoryTip: "🧠 Nhớ: 'Ý chí mua nhà dùng TAMENI; Thể khả năng hoặc NAI dùng YOU NI!'",
    similarGrammars: [
      { similarStructure: "〜ために vs 〜ように", difference: "ために đi với V ý chí, danh từ thêm の. ように đi với V khả năng, thể phủ định ない, động từ vô ý chí.", comparisonExample: "大学に入るために勉強する (Ý chí thi vào) vs 大学に入れるように勉強する (Để có thể đỗ vào - thể khả năng)." }
    ],
    examples: [
      { japanese: "将来自分の店を持つために、一生懸命働いています。", vietnamese: "Để tương lai có cửa hàng riêng, tôi đang làm việc chăm chỉ.", explanation: "Động từ ý chí 持つ + ために." },
      { japanese: "風邪をひかないように、暖かい服を着てください。", vietnamese: "Để không bị cảm lạnh, hãy mặc quần áo ấm vào nhé.", explanation: "Thể phủ định ひかない + ように." }
    ],
    exercises: [
      {
        id: "n4_t32_ex1",
        type: "multiple_choice",
        question: "Chọn từ thích hợp: 日本語が上手に話せる（　　）、毎日シャドーイングをしています。",
        choices: ["ように", "ために", "ので", "のに"],
        correct_answer: "ように",
        explanation: "Động từ đứng trước là thể khả năng '話せる' nên bắt buộc dùng 'ように'."
      }
    ]
  },
  {
    topicNumber: 33,
    lessonNumber: 44,
    pattern: "複合動詞: Động từ ghép",
    structure: "V(bỏ ます) + [忘れます / 過ぎます / 始めます / 出します / 続けます / 終わります / 直します / かえます]",
    meaning: "Quên làm, làm quá, bắt đầu làm, đột nhiên làm, tiếp tục làm, làm xong, làm lại, đổi cái khác...",
    explanation: "Ghép động từ hành động bỏ ます với một động từ bổ trợ phía sau để tạo nên ý nghĩa phong phú về trạng thái và diễn trình của hành động.",
    exampleJp: "雨が急に降り出しました。",
    exampleVi: "Trời đột nhiên đổ mưa bất chợt.",
    overview: "Chuyên đề Động từ ghép trong Minna bài 44. Giúp câu văn tiếng Nhật phong phú, tự nhiên và sinh động hơn rất nhiều.",
    formationRules: [
      { partOfSpeech: "～始める / ～出す", rule: "V(bỏ ます) + 始める (bắt đầu tuần tự) / 出す (bất chợt)", example: "読み始める (bắt đầu đọc) / 泣き出す (bật khóc bất chợt)", meaning: "Khởi đầu hành động" },
      { partOfSpeech: "～終わる", rule: "V(bỏ ます) + 終わる", example: "読み終わる (đọc xong), 食べ終わる (ăn xong)", meaning: "Kết thúc hành động" },
      { partOfSpeech: "～続ける", rule: "V(bỏ ます) + 続ける", example: "走り続ける (chạy liên tục), 勉強し続ける (tiếp tục học)", meaning: "Duy trì liên tục" },
      { partOfSpeech: "～忘れる", rule: "V(bỏ ます) + 忘れる", example: "傘を持ち忘れた (quên mang theo ô), 鍵をかけ忘れた (quên khóa cửa)", meaning: "Quên làm điều gì" },
      { partOfSpeech: "～直す", rule: "V(bỏ ます) + 直す", example: "書き直す (viết lại), 考え直す (suy nghĩ lại)", meaning: "Làm lại lần nữa cho tốt hơn" }
    ],
    usageGuide: {
      whenToUse: ["Biểu đạt cụ thể tiến trình: khởi phát, kết thúc, làm lại, quên làm, duy trì liên tục."],
      whenNotToUse: ["Động từ đứng trước bắt buộc bỏ ます ghép liền."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Tự nhiên, cô đọng, giàu hình ảnh."
    },
    notes: [
      "⚠️ Phân biệt 〜始める (bắt đầu có chủ đích) vs 〜出す (đột ngột bộc phát ngoài ý muốn như trời mưa, trẻ con khóc ré lên).",
      "⚠️ Phân biệt 〜直す (làm lại cho đúng) và 〜かえる (thay đổi chuyển sang cái khác: 乗り換える - chuyển tàu, 履き替える - thay giày)."
    ],
    memoryTip: "🧠 Nhớ: 'V bỏ MASU ghép liền: Hajimeru bắt đầu, Owaru hoàn tất, Naosu làm lại, Tsudukeru triền miên!'",
    similarGrammars: [
      { similarStructure: "〜始める vs 〜出す", difference: "降り始める: trời bắt đầu lác đác mưa (bình thường). 降り出す: mây đen ập đến đổ mưa rào bất ngờ.", comparisonExample: "赤ちゃんが泣き出した (Đứa bé đột nhiên khóc thét lên)." }
    ],
    examples: [
      { japanese: "この本を全部読み終わったら、返却してください。", vietnamese: "Khi đọc xong toàn bộ cuốn sách này thì xin hãy đem trả nhé.", explanation: "読み終わる: đọc xong." },
      { japanese: "レポートをもう一度最初から書き直しました。", vietnamese: "Tôi đã viết lại bản báo cáo từ đầu thêm một lần nữa.", explanation: "書き直す: viết lại." }
    ],
    exercises: [
      {
        id: "n4_t33_ex1",
        type: "multiple_choice",
        question: "Chọn từ đúng: 外出するとき、電気を消し（　　）しまいました。",
        choices: ["忘れ", "終わり", "出し", "直し"],
        correct_answer: "忘れ",
        explanation: "Quên tắt điện đi ra ngoài dùng động từ ghép '消し忘れ(てしまいました)'."
      }
    ]
  },
  {
    topicNumber: 34,
    lessonNumber: 44,
    pattern: "～すぎる",
    structure: "V(bỏ ます) / A-i(bỏ い) / A-na(bỏ な) + すぎる / すぎます",
    meaning: "Quá... (Vượt quá mức độ thông thường, gây hại hoặc phiền phức)",
    explanation: "Biểu thị một hành động hoặc trạng thái diễn ra vượt quá giới hạn cho phép hoặc mức độ bình thường, thường mang ý nghĩa tiêu cực, không tốt.",
    exampleJp: "昨日お酒を飲みすぎました。",
    exampleVi: "Hôm qua tôi đã uống quá nhiều rượu.",
    overview: "Mẫu câu chỉ sự thái quá trong Minna bài 44. Động từ ghép với すぎる sẽ trở thành một động từ nhóm 2 (chia thể て thành すぎて, quá khứ là すぎました).",
    formationRules: [
      { partOfSpeech: "Động từ", rule: "V(bỏ ます) + すぎる", example: "食べすぎる (ăn quá nhiều), 働きすぎる (làm việc quá sức)", meaning: "Hành động thái quá" },
      { partOfSpeech: "Tính từ đuôi い", rule: "A-i (bỏ い) + すぎる", example: "高すぎる (quá đắt), 辛すぎる (quá cay)", meaning: "Độ tính chất vượt mức" },
      { partOfSpeech: "Tính từ đuôi な", rule: "A-na (bỏ な) + すぎる", example: "暇すぎる (quá rảnh rỗi), 複雑すぎる (quá phức tạp)", meaning: "Trạng thái vượt mức" }
    ],
    usageGuide: {
      whenToUse: ["Phàn nàn, nhắc nhở hoặc giải thích hậu quả do vượt quá giới hạn (ăn nhiều quá đau bụng, làm nhiều quá kiệt sức)."],
      whenNotToUse: ["Ít khi dùng cho những điều tích cực (để khen ngợi sự tốt đẹp tột cùng thường dùng とても, 素晴らしい)."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Tiêu cực, hối tiếc, quá đà."
    },
    notes: [
      "⚠️ Trở thành động từ nhóm 2: 食べすぎます → 食べすぎてお腹が痛い (Ăn quá nhiều nên bị đau bụng).",
      "⚠️ Ngoại lệ: Tính từ いい khi ghép với すぎる đổi thành 'よすぎる' (quá tốt)."
    ],
    memoryTip: "🧠 Nhớ: 'Cắt đuôi MASU, cắt I, cắt NA ghép liền SUGIRU; Ăn nhiều hại thân, đắt quá cháy túi!'",
    similarGrammars: [
      { similarStructure: "とても / あまり", difference: "とても chỉ mức độ rất nhiều (trung tính hoặc tích cực). すぎる nhấn mạnh sự thái quá gây hậu quả xấu.", comparisonExample: "とてもおいしい (Rất ngon - khen) vs 甘すぎる (Quá ngọt - chê ngấy)." }
    ],
    examples: [
      { japanese: "この問題は難しすぎて、全然わかりません。", vietnamese: "Bài toán này quá khó nên tôi hoàn toàn không hiểu.", explanation: "A-i bỏ い + すぎて." },
      { japanese: "最近働きすぎて、体を壊してしまいました。", vietnamese: "Gần đây làm việc quá sức nên tôi đã bị ốm.", explanation: "V-masu bỏ ます + すぎて." }
    ],
    exercises: [
      {
        id: "n4_t34_ex1",
        type: "multiple_choice",
        question: "Dạng đúng của tính từ '辛い' (cay) khi nói 'quá cay' là:",
        choices: ["辛すぎる", "辛いすぎる", "辛くすぎる", "辛くてすぎる"],
        correct_answer: "辛すぎる",
        explanation: "Tính từ đuôi い bỏ 'い' ghép trực tiếp với すぎる: 辛すぎる."
      }
    ]
  },
  {
    topicNumber: 35,
    lessonNumber: 44,
    pattern: "～やすい、～にくい",
    structure: "V(bỏ ます) + やすい (Dễ làm) / にくい (Khó làm)",
    meaning: "Dễ làm gì... / Khó làm gì... (Biến thành tính từ đuôi -i)",
    explanation: "Ghép vào sau động từ bỏ ます để miêu tả đặc tính của một đồ vật hoặc hoàn cảnh khiến hành động diễn ra dễ dàng hoặc khó khăn. Từ phái sinh đóng vai trò như một tính từ đuôi い.",
    exampleJp: "このペンはとても書きやすいです。",
    exampleVi: "Chiếc bút này viết rất êm (rất dễ viết).",
    overview: "Mẫu câu chỉ tính chất dễ - khó của thao tác trong Minna bài 44. Cực kỳ thông dụng khi đi mua sắm hoặc đánh giá chất lượng sản phẩm.",
    formationRules: [
      { partOfSpeech: "Dễ làm", rule: "V(bỏ ます) + やすい", example: "使いやすい (dễ sử dụng), 飲みやすい (dễ uống), わかりやすい (dễ hiểu)", meaning: "Đặc tính dễ thao tác" },
      { partOfSpeech: "Khó làm", rule: "V(bỏ ます) + にくい", example: "使いにくい (khó sử dụng), 読みにくい (khó đọc), 歩きにくい (khó đi bộ)", meaning: "Đặc tính khó thao tác" }
    ],
    usageGuide: {
      whenToUse: ["1. Đánh giá tính năng của sản phẩm, đồ gia dụng, ứng dụng phần mềm.", "2. Chỉ xu hướng dễ xảy ra biến cố (trời mưa đường dễ trơn trượt, mùa đông dễ bị cảm)."],
      whenNotToUse: ["Không dùng để đánh giá năng lực chủ quan của người làm (tôi không biết bơi không nói '泳ぎにくい', mà nói '泳げない')."],
      subjectConstraint: "Vật phẩm hoặc hiện tượng mang đặc tính.",
      nuance: "Khách quan, chia đuôi như tính từ đuôi い (〜やすかった, 〜やすくない)."
    },
    notes: [
      "⚠️ Chia như tính từ đuôi い: 使いやすい → 使いやすくて便利 (Dễ dùng và tiện lợi) / 使いやすくない (Không dễ dùng).",
      "⚠️ Trợ từ đi trước cụm từ này thường là が: この薬は苦くなくて、子どもでも飲みやすいです."
    ],
    memoryTip: "🧠 Nhớ: 'V bỏ MASU thêm YASUI là dễ; thêm NIKUI là khó; chia đuôi y hệt tính từ đuôi I!'",
    similarGrammars: [
      { similarStructure: "〜が簡単 / 〜が難しい", difference: "やすい/にくい ghép trực tiếp sau V nhấn mạnh vào bản chất trải nghiệm công cụ. 簡単/難しい là tính từ độc lập.", comparisonExample: "この本は読みやすい (Chữ to, tranh minh họa dễ đọc) vs この本は簡単だ (Nội dung cuốn sách đơn giản)." }
    ],
    examples: [
      { japanese: "この靴は軽くて、とても歩きやすいです。", vietnamese: "Đôi giày này nhẹ nên đi bộ rất êm và dễ đi.", explanation: "V-masu bỏ ます + やすい." },
      { japanese: "雨の日は事故が起きやすいので、注意してください。", vietnamese: "Ngày mưa rất dễ xảy ra tai nạn nên xin hãy chú ý cẩn thận.", explanation: "Khuynh hướng dễ xảy ra bằng 起きやすい." }
    ],
    exercises: [
      {
        id: "n4_t35_ex1",
        type: "multiple_choice",
        question: "Dạng phủ định quá khứ của 'dễ dùng' (使いやすい) là:",
        choices: ["使いやすくなかった", "使いやすいでした", "使いやすかった", "使いにくかった"],
        correct_answer: "使いやすくなかった",
        explanation: "Chia như tính từ đuôi い: やすい → phủ định quá khứ là やすくなかった."
      }
    ]
  },
  {
    topicNumber: 36,
    lessonNumber: 37,
    pattern: "受身形: Thể bị động",
    structure: "Nhóm 1: [u] → [a]れる / Nhóm 2: [ru] → [rareru] / Nhóm 3: される, こられる",
    meaning: "Bị / Được ai đó làm gì (Bị động trực tiếp, gián tiếp, phiền toái, sở hữu)",
    explanation: "Đổi vai trò của tân ngữ lên làm chủ ngữ để miêu tả sự việc từ góc nhìn của người chịu tác động. Có thể mang nghĩa tích cực (được khen) hoặc tiêu cực (bị mắng, bị giẫm chân).",
    exampleJp: "私は先生に褒められました。",
    exampleVi: "Tôi đã được thầy giáo khen ngợi.",
    overview: "Chuyên đề Thể bị động trong Minna bài 37. Là một trong những thể biến đổi ngữ pháp đỉnh cao của N4 với 5 phân nhánh: Bị động trực tiếp, Bị động gián tiếp (phiền toái), Bị động vật sở hữu, Bị động bởi danh nhân (によって), và Bị động đồ vật.",
    formationRules: [
      { partOfSpeech: "Nhóm 1", rule: "Đổi âm [u] thành âm hàng [a] + れる", example: "叱る → 叱られる (bị mắng), 踏む → 踏まれる (bị giẫm), 言う → 言われる (bị nói)", meaning: "Lưu ý đuôi u → wa: 買う → 買われる" },
      { partOfSpeech: "Nhóm 2", rule: "Bỏ ます thêm られる", example: "褒める → 褒められる (được khen), 食べる → 食べられる (bị ăn mất)", meaning: "Giống hệt thể khả năng nhóm 2" },
      { partOfSpeech: "Nhóm 3", rule: "Bất quy tắc", example: "する → される, 来る → 来(こ)られる", meaning: "Học thuộc lòng" }
    ],
    usageGuide: {
      whenToUse: ["1. Bị động trực tiếp: A は B に + V bị động (A bị/được B làm gì).", "2. Bị động vật sở hữu: A は B に [Đồ của A] を + V bị động (Tôi bị ai đó giẫm vào chân: 私は誰かに足を踏まれた).", "3. Bị động phiền toái (迷惑受身): Tôi bị dính mưa: 私は雨に降られた.", "4. Bị động phát minh, sáng chế: Đi với によって (Được phát minh bởi ai: 電話はベルによって発明された)."],
      whenNotToUse: ["Không dùng trợ từ を cho tác nhân gây ra hành động (tác nhân BẮT BUỘC đi với に)."],
      subjectConstraint: "Người chịu tác động là chủ ngữ.",
      nuance: "Chịu tác động, thường có sắc thái phiền toái hoặc cảm ơn."
    },
    notes: [
      "⚠️ Quy tắc trợ từ vàng: Người tác động BẮT BUỘC đi với trợ từ に (A は B に...); Riêng phát minh/sáng tác đi với によって.",
      "⚠️ Bị động phiền toái (kinh điển): 雨に降られました (Tôi bị dính mưa phiền toái), 赤ちゃんに泣かれました (Tôi bị đứa bé khóc quấy không ngủ được)."
    ],
    memoryTip: "🧠 Nhớ: 'Nhóm 1 hàng A thêm RERU; Nhóm 2 thêm RARERU; Kẻ tác động phải đi với NI!'",
    similarGrammars: [
      { similarStructure: "受身 (Bị động) vs 使役 (Sai khiến)", difference: "Bị động: れる/られる (bị/được làm). Sai khiến: せる/させる (bắt/cho phép làm).", comparisonExample: "先生に褒められた (Được thầy khen - bị động) vs 先生に本を読ませられた (Bị thầy bắt đọc sách - sai khiến bị động)." }
    ],
    examples: [
      { japanese: "満員電車で足を踏まれました。", vietnamese: "Tôi đã bị giẫm vào chân trên chuyến tàu đông nghẹt.", explanation: "Bị động vật sở hữu (Chân của tôi) bằng 足を踏まれた." },
      { japanese: "このお寺は500年前に建てられました。", vietnamese: "Ngôi chùa này được xây dựng cách đây 500 năm.", explanation: "Bị động đồ vật không cần nhắc tới chủ thể." }
    ],
    exercises: [
      {
        id: "n4_t36_ex1",
        type: "multiple_choice",
        question: "Dạng bị động đúng của động từ 呼びます (gọi - nhóm 1) là:",
        choices: ["呼ばれる", "呼びられる", "呼べる", "呼ぶれる"],
        correct_answer: "呼ばれる",
        explanation: "Đổi âm bi thành ba + れる: 呼びます → 呼ばれる."
      }
    ]
  },
  {
    topicNumber: 37,
    lessonNumber: 48,
    pattern: "使役形: Thể sai khiến",
    structure: "Nhóm 1: [u] → [a]せる / Nhóm 2: [ru] → [saseru] / Nhóm 3: させる, こさせる",
    meaning: "Bắt làm / Cho phép làm... / Làm cho (ai đó phát sinh cảm xúc)",
    explanation: "Biểu thị việc người có quyền hạn ra lệnh, bắt buộc hoặc cho phép cấp dưới, con cái làm một hành động nào đó; hoặc làm phát sinh cảm xúc (lo lắng, cười, khóc) ở người khác.",
    exampleJp: "母は弟に部屋を掃除させました。",
    exampleVi: "Mẹ bắt em trai dọn dẹp phòng.",
    overview: "Chuyên đề Thể sai khiến trong Minna bài 48. Đóng vai trò then chốt trong giao tiếp gia đình, quản lý cấp dưới và mẫu xin phép lịch sự kinh điển: 〜させていただけませんか.",
    formationRules: [
      { partOfSpeech: "Nhóm 1", rule: "Đổi âm [u] thành âm hàng [a] + せる", example: "書く → 書かせる (bắt viết), 飲む → 飲ませる (bắt uống), 行く → 行かせる (cho đi)", meaning: "Hàng a + せる" },
      { partOfSpeech: "Nhóm 2", rule: "Bỏ ます thêm させる", example: "食べる → 食べさせる (cho ăn / bắt ăn), 見る → 見させる (cho xem)", meaning: "Thêm させる" },
      { partOfSpeech: "Nhóm 3", rule: "Bất quy tắc", example: "する → させる, 来る → 来(こ)させる", meaning: "Học thuộc lòng" }
    ],
    usageGuide: {
      whenToUse: ["1. Bắt buộc hoặc cho phép người dưới, con cái, động vật làm gì.", "2. Sai khiến cảm xúc: A làm cho B lo lắng/vui vẻ (A は B を 心配させる/喜ばせる).", "3. Mẫu xin phép cực kỳ lịch sự: V-sai khiến ていただけませんか (Làm ơn cho phép tôi được làm việc này)."],
      whenNotToUse: ["Tuyệt đối không dùng đứng một mình với người trên hoặc người ngoài vì mang tính hách dịch áp đặt."],
      subjectConstraint: "Người bề trên ra lệnh cho người bề dưới.",
      nuance: "Áp đặt hoặc cho phép rộng rãi."
    },
    notes: [
      "⚠️ Trợ từ trong câu sai khiến:",
      "1. Nếu động từ là Tự động từ: Người bị bắt đi với trợ từ を (子どもを走らせる).",
      "2. Nếu động từ là Tha động từ (có tân ngữ を rồi): Người bị bắt chuyển sang đi với trợ từ に (子どもに本を読ませる - để tránh lặp 2 chữ を).",
      "⚠️ Mẫu xin phép kinh điển: '今日は早く帰らせてください' (Xin hãy cho phép tôi về sớm hôm nay)."
    ],
    memoryTip: "🧠 Nhớ: 'Nhóm 1 hàng A thêm SERU; Nhóm 2 thêm SASERU; Xin phép cho tôi làm thì SASETE KUDASAI!'",
    similarGrammars: [
      { similarStructure: "〜させてください vs 〜てください", difference: "〜てください: Yêu cầu đối phương làm. 〜させてください: Xin phép cho chính bản thân tôi được làm!", comparisonExample: "休んでください (Bạn hãy nghỉ đi) vs 休ませてください (Làm ơn cho tôi xin nghỉ)." }
    ],
    examples: [
      { japanese: "先生は学生に漢字を覚えさせました。", vietnamese: "Thầy giáo bắt học sinh học thuộc chữ Hán.", explanation: "Tha động từ: người nhận lệnh đi với に (学生に)." },
      { japanese: "体調が悪いので、今日は早く帰らせていただけませんか。", vietnamese: "Vì trong người không khỏe, tôi có thể xin phép về sớm hôm nay được không ạ?", explanation: "Mẫu xin phép lịch sự tối đa bằng 帰らせていただけませんか." }
    ],
    exercises: [
      {
        id: "n4_t37_ex1",
        type: "multiple_choice",
        question: "Muốn xin phép sếp cho bản thân được nói ý kiến, ta nói:",
        choices: [
          "意見を言わせてください。",
          "意見を言ってください。",
          "意見を言われてください。",
          "意見を言うてください。"
        ],
        correct_answer: "意見を言わせてください。",
        explanation: "Xin phép cho chính mình làm hành động gì dùng Thể sai khiến thể て + ください: 言わせてください."
      }
    ]
  },
  {
    topicNumber: 38,
    lessonNumber: 33,
    pattern: "Thể mệnh lệnh & Cấm chỉ (命令形 & 禁止形)",
    structure: "Mệnh lệnh: Nhóm 1: [u] → [e] / Nhóm 2: [ru] → [ro] / Nhóm 3: しろ, こい; Cấm chỉ: V-dict + な",
    meaning: "Làm đi! (Mệnh lệnh) / Cấm làm! (Cấm chỉ)",
    explanation: "Thể hiện quyền lực ra lệnh dứt khoát hoặc cấm đoán tuyệt đối, thường dùng trong biển báo giao thông, cổ vũ thể thao, tình huống cứu hộ khẩn cấp hoặc sếp mắng mỏ.",
    exampleJp: "止まれ！ (Dừng lại!) / 入るな！ (Cấm vào!)",
    exampleVi: "Dừng lại! (biển báo dừng) / Cấm vào! (biển báo cấm)",
    overview: "Chuyên đề Thể mệnh lệnh và Cấm chỉ trong Minna bài 33. Rất quan trọng khi đọc hiểu các biển báo công cộng tại Nhật Bản và hiểu rõ 4 cấp độ mệnh lệnh trong tiếng Nhật.",
    formationRules: [
      { partOfSpeech: "Mệnh lệnh Nhóm 1", rule: "Đổi âm [u] thành âm hàng [e]", example: "行く → 行け (Đi đi!), 飲む → 飲め (Uống đi!), 待つ → 待て (Đợi đấy!)", meaning: "Hàng e" },
      { partOfSpeech: "Mệnh lệnh Nhóm 2", rule: "Bỏ ます thêm ろ", example: "食べる → 食べろ (Ăn đi!), 見る → 見ろ (Nhìn đi!)", meaning: "Thêm ろ" },
      { partOfSpeech: "Mệnh lệnh Nhóm 3", rule: "Bất quy tắc", example: "する → しろ, 来る → 来(こ)い", meaning: "Học thuộc lòng" },
      { partOfSpeech: "Cấm chỉ (Mọi nhóm)", rule: "V thể từ điển (辞書形) + な", example: "行くな (Cấm đi!), 飲むな (Cấm uống!), 触るな (Cấm sờ!)", meaning: "Thêm な ngay sau thể từ điển" }
    ],
    usageGuide: {
      whenToUse: ["1. Biển báo hiệu công cộng, giao thông (止まれ, 進入禁止, 触るな).", "2. Cổ vũ thể thao náo nhiệt (頑張れ！ - Cố lên!).", "3. Huấn luyện quân ngũ, cảnh sát truy bắt tội phạm, tình huống cháy nổ khẩn cấp (逃げろ！ - Chạy ngay đi!)."],
      whenNotToUse: ["Tuyệt đối không dùng trong giao tiếp đời thường với người khác vì mang tính thô lỗ, xúc phạm."],
      subjectConstraint: "Người bề trên hoặc tình huống khẩn cấp.",
      nuance: "Cực kỳ gay gắt, dứt khoát, đanh thép."
    },
    notes: [
      "⚠️ 4 cấp độ ra lệnh trong tiếng Nhật:",
      "1. 〜ろ / 〜な (Mệnh lệnh đanh thép / Cấm chỉ thô lỗ).",
      "2. 〜なさい (Bố mẹ nhắc con cái, giáo viên bảo học trò: 早く起きなさい).",
      "3. 〜てください (Yêu cầu lịch sự thông thường: 書いてください).",
      "4. 〜ていただけませんか (Nhờ vả cung kính hết mực)."
    ],
    memoryTip: "🧠 Nhớ: 'Mệnh lệnh nhóm 1 đổi sang hàng Ê; Cấm chỉ cứ lấy V-dict thêm NA!'",
    similarGrammars: [
      { similarStructure: "〜なさい", difference: "〜なさい mang tính chất răn dạy của cha mẹ với con cái. Thể mệnh lệnh 〜ろ là mệnh lệnh thô ráp trực tiếp.", comparisonExample: "宿題をしなさい (Mẹ nhắc con làm bài) vs 早くしろ！ (Ra lệnh quát tháo)." }
    ],
    examples: [
      { japanese: "危ない！そこから離れろ！", vietnamese: "Nguy hiểm! Tránh xa khỏi chỗ đó mau!", explanation: "Mệnh lệnh khẩn cấp bằng 離れろ." },
      { japanese: "ここにゴミを捨てるな。", vietnamese: "Cấm vứt rác ở đây.", explanation: "Biển báo cấm bằng V-dict + な." }
    ],
    exercises: [
      {
        id: "n4_t38_ex1",
        type: "multiple_choice",
        question: "Dạng cấm chỉ đúng của động từ '入ります' (vào) là:",
        choices: ["入るな", "入りな", "入るなさい", "入れな"],
        correct_answer: "入るな",
        explanation: "Cấm chỉ tạo bằng V thể từ điển + な: 入るな (Cấm vào)."
      }
    ]
  },
  {
    topicNumber: 39,
    lessonNumber: 41,
    pattern: "～てあげます、～てくれます、～てもらいます",
    structure: "1. V-て + あげます / 2. V-て + くれます / 3. V-て + もらいます",
    meaning: "1. Làm giúp cho ai / 2. Ai đó làm giúp cho tôi / 3. Được ai đó làm giúp cho",
    explanation: "Hệ thống Cho - Nhận hành động trong tiếng Nhật. Phân định rạch ròi chiều chuyển động của ân huệ giúp đỡ giữa người nói và những người xung quanh.",
    exampleJp: "友達が宿題を手伝ってくれました。",
    exampleVi: "Bạn tôi đã giúp tôi làm bài tập về nhà.",
    overview: "Chuyên đề Cho - Nhận hành động trong Minna bài 41. Đây là nét văn hóa đặc sắc về lòng biết ơn của người Nhật, luôn có mặt trong các bài hội thoại N4.",
    formationRules: [
      { partOfSpeech: "～てあげます", rule: "Tôi (hoặc phe tôi) làm giúp cho người khác", example: "私は妹に自転車を直してあげました", meaning: "Chiều hành động hướng ra ngoài" },
      { partOfSpeech: "～てくれます", rule: "Người khác làm giúp cho tôi (hoặc phe tôi)", example: "田中さんが私に傘を貸してくれました", meaning: "Chiều hành động hướng vào tôi (Tôi là người hưởng lợi)" },
      { partOfSpeech: "～てもらいます", rule: "Tôi nhận được sự giúp đỡ từ người khác", example: "私は先生に日本語を教えてもらいました", meaning: "Chủ ngữ là TÔI, người giúp đi với に" }
    ],
    usageGuide: {
      whenToUse: ["Bày tỏ hành động giúp đỡ và lòng biết ơn đối với người đã hỗ trợ mình."],
      whenNotToUse: ["Hạn chế dùng '〜てあげます' trực tiếp với người bề trên vì mang sắc thái khoe khoang, kể công ban ơn. Với người trên nên dùng '〜お/ご...します'."],
      subjectConstraint: "〜てくれます: Chủ ngữ là NGƯỜI GIÚP, hướng tới 私に. 〜てもらいます: Chủ ngữ là NGƯỜI NHẬN (私).",
      nuance: "Chân thành, cảm kích."
    },
    notes: [
      "⚠️ Phân biệt sống còn giữa くれます và もらいます:",
      "1. 田中さんが 私に 手伝ってくれました (Chủ ngữ là Tanaka, đi với が/は, tôi đi với に).",
      "2. 私は 田中さんに 手伝ってもらいました (Chủ ngữ là Tôi, Tanaka đi với に)."
    ],
    memoryTip: "🧠 Nhớ: 'KUREMASU thì người khác là chủ ngữ; MORAIMASU thì TÔI là chủ ngữ nhận ơn!'",
    similarGrammars: [
      { similarStructure: "Kính ngữ của Cho Nhận", difference: "てあげます → てさしあげます (khiêm tốn); てくれます → てくださいます (kính cẩn); てもらいます → ていただきます (khiêm cung).", comparisonExample: "先生が教えてくださいました (Thầy dạy cho tôi) vs 先生に教えていただきました (Tôi được thầy chỉ dạy)." }
    ],
    examples: [
      { japanese: "誕生日に父が時計を買ってくれました。", vietnamese: "Vào ngày sinh nhật, bố đã mua tặng tôi một chiếc đồng hồ.", explanation: "Bố làm cho tôi dùng てくれました." },
      { japanese: "道がわからなかったので、警察官に教えてもらいました。", vietnamese: "Vì không biết đường nên tôi đã được chú cảnh sát chỉ đường giúp.", explanation: "Tôi nhận được sự giúp đỡ bằng てもらいました." }
    ],
    exercises: [
      {
        id: "n4_t39_ex1",
        type: "multiple_choice",
        question: "Chọn từ đúng: 友達が駅まで車で（　　）ました。",
        choices: ["送ってくれ", "送ってもらい", "送ってあげ", "送ってやり"],
        correct_answer: "送ってくれ",
        explanation: "Chủ ngữ là '友達が' (bạn) làm hành động chở tôi đến ga, nên phải dùng '送ってくれました'."
      }
    ]
  },
  {
    topicNumber: 40,
    lessonNumber: 29,
    pattern: "～てしまう",
    structure: "V-て + しまう / しまいました (Khẩu ngữ: ちゃう / じゃう)",
    meaning: "1. Đã hoàn thành xong trọn vẹn / 2. Lỡ... (Tiếc nuối, ân hận về việc ngoài ý muốn)",
    explanation: "Có 2 nghĩa chính: 1. Hoàn thành dứt điểm toàn bộ hành động (thường đi với もう); 2. Diễn tả tâm trạng lỡ, tiếc nuối, ân hận khi lỡ làm mất đồ, làm hỏng hoặc sự việc không may xảy ra.",
    exampleJp: "財布を電車の中に忘れてしまいました。",
    exampleVi: "Tôi đã lỡ để quên ví trên tàu điện mất rồi.",
    overview: "Mẫu câu hoàn thành và nuối tiếc quen thuộc trong Minna bài 29. Dạng khẩu ngữ 'ちゃう / じゃう' cực kỳ thông dụng trong giao tiếp người Nhật bản xứ.",
    formationRules: [
      { partOfSpeech: "Hoàn tất trọn vẹn", rule: "V-て + しまいました", example: "この本を全部読んでしまいました (Tôi đã đọc xong sạch cuốn sách này rồi)", meaning: "Hành động kết thúc trọn vẹn" },
      { partOfSpeech: "Lỡ / Tiếc nuối", rule: "V-て + しまいました", example: "パスポートを落としてしまいました (Tôi lỡ làm đánh rơi hộ chiếu mất rồi)", meaning: "Sự cố đáng tiếc ngoài ý muốn" },
      { partOfSpeech: "Dạng đàm thoại thân mật", rule: "〜てしまう → 〜ちゃう / 〜でしまう → 〜じゃう", example: "食べちゃう (ăn hết luôn / lỡ ăn mất), 飲んじゃう (uống sạch)", meaning: "Khẩu ngữ thường ngày" }
    ],
    usageGuide: {
      whenToUse: ["1. Nhấn mạnh việc đã xử lý dứt điểm công việc.", "2. Bày tỏ sự hối hận, áy náy khi mắc lỗi hoặc gặp sự cố rủi ro."],
      whenNotToUse: ["Không dùng nghĩa tiếc nuối cho những việc vui mừng, may mắn."],
      subjectConstraint: "Không giới hạn.",
      nuance: "Dứt khoát (hoàn thành) hoặc thảng thốt, buồn bã (tiếc nuối)."
    },
    notes: [
      "⚠️ Khẩu ngữ: てしまう biến thành ちゃう (忘れてしまう → 忘れちゃう); でしまう biến thành じゃう (飲んでしまう → 飲んじゃう)."
    ],
    memoryTip: "🧠 Nhớ: 'TE SHIMAU là xong xuôi tất cả; hoặc là LỠ DẠI ôm mặt tiếc thương!'",
    similarGrammars: [
      { similarStructure: "〜てしまった vs 〜ました", difference: "宿題をしました (Thông báo bình thường đã làm xong). 宿題をしてしまいました (Nhấn mạnh đã làm xong sạch sẽ gọn gàng trút được gánh nặng).", comparisonExample: "忘れました (Tôi đã quên) vs 忘れてしまいました (Tôi lỡ quên mất rồi - đầy áy náy)." }
    ],
    examples: [
      { japanese: "大切なカメラを壊してしまいました。", vietnamese: "Tôi lỡ làm hỏng mất chiếc máy ảnh quý giá rồi.", explanation: "Sự cố đáng tiếc bằng 壊してしまいました." },
      { japanese: "宿題はもう全部やってしまいました。", vietnamese: "Bài tập về nhà thì tôi đã làm xong sạch sẽ hết cả rồi.", explanation: "Hoàn tất trọn vẹn." }
    ],
    exercises: [
      {
        id: "n4_t40_ex1",
        type: "multiple_choice",
        question: "Dạng khẩu ngữ của '忘れてしまいました' (lỡ quên mất rồi) là:",
        choices: ["忘れちゃいました", "忘れじゃいました", "忘れたいでした", "忘れるちゃいました"],
        correct_answer: "忘れちゃいました",
        explanation: "Động từ thể て đuôi 'てしまう' chuyển sang khẩu ngữ thành 'ちゃう / ちゃいました'."
      }
    ]
  }
];
