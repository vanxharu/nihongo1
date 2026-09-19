export interface OptionExplanationDetail {
  index: number;
  optionText: string;
  isCorrect: boolean;
  statusTag: '⭕ ĐÚNG' | '❌ SAI';
  reason: string;
  grammarPoint?: string;
  trapNote?: string;
}

export interface BunpouQuestionDetail {
  id: string;
  fullSentenceTranslation: string;
  grammarPoint: string;
  correctReason: string;
  options: OptionExplanationDetail[];
}

export const BUNPOU_EXPLANATION_DATABASE: Record<string, BunpouQuestionDetail> = {
  // --- N4 Đề 1 (Nihongo Learning 01) ---
  'n4_nl01_g1': {
    id: 'n4_nl01_g1',
    fullSentenceTranslation: 'A: "Cái bánh ngọt đó là do cậu tự làm à?"\nB: "Ừ, cậu ăn thử xem có ngon hay không nhé."',
    grammarPoint: 'V-てみる: Thử làm một việc gì đó để biết cảm giác / kết quả',
    correctReason: 'Đáp án 2「みて」(V-てみる) chính xác vì B mời A ăn thử chiếc bánh mình làm để đánh giá xem có ngon hay không (おいしいかどうか 食べてみて).',
    options: [
      {
        index: 0,
        optionText: 'おいて',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai cấu trúc:「V-ておく」diễn tả việc làm sẵn một hành động để chuẩn bị cho mục đích sau này hoặc giữ nguyên hiện trạng, không dùng để nói "ăn thử xem sao".',
        grammarPoint: 'V-ておく (làm sẵn / để nguyên)'
      },
      {
        index: 1,
        optionText: 'みて',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác:「V-てみる」mang nghĩa "thử làm điều gì đó". Đi với「おいしいかどうか」(có ngon hay không) tạo thành câu rủ/mời rất tự nhiên: "Ăn thử xem sao".',
        grammarPoint: 'V-てみる (thử làm gì)'
      },
      {
        index: 2,
        optionText: 'きて',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai sắc thái:「V-てくる」diễn tả hành động làm gì đó rồi quay lại hoặc hướng dần về người nói, không hợp nghĩa khi mời người khác nếm thử.',
        grammarPoint: 'V-てくる (làm gì rồi đến)'
      },
      {
        index: 3,
        optionText: 'あって',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai ngữ pháp:「V-てある」chỉ trạng thái của tha động từ đã được chuẩn bị sẵn (ví dụ: ケーキが買ってある), không dùng làm đuôi câu sai khiến/mời mọc「食べてあって」.',
        grammarPoint: 'V-てある (trạng thái có chủ ý)'
      }
    ]
  },

  'n4_nl01_g2': {
    id: 'n4_nl01_g2',
    fullSentenceTranslation: 'A: "Mặt mày tái xanh thế kia, bạn bị làm sao vậy?"\nB: "Vì tôi uống quá nhiều bia đấy."',
    grammarPoint: 'V-ます (bỏ ます) + すぎる: Làm gì đó quá mức gây ra hậu quả xấu',
    correctReason: 'Đáp án 3「飲みすぎた」chính xác: Động từ 飲む bỏ ます thành 飲み + すぎた diễn tả việc uống bia quá mức dẫn đến hậu quả mặt xanh xao.',
    options: [
      {
        index: 0,
        optionText: '飲んだから',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai kết hợp: Đuôi câu đã có「んです」để giải thích lý do rồi, không được kết hợp chồng chéo「〜からんです」. Nếu dùng thì phải là「飲んだんです」.',
        trapNote: 'Bẫy lặp từ chỉ nguyên nhân (から + んです)'
      },
      {
        index: 1,
        optionText: '飲む',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai thì của động từ:「飲む」ở thì hiện tại/tương lai, trong khi việc uống bia đã xảy ra trong quá khứ dẫn đến trạng thái mặt tái mét hiện tại.',
        trapNote: 'Sai thì thời gian'
      },
      {
        index: 2,
        optionText: '飲みすぎた',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác: 飲む -> bỏ ます ghép すぎる -> 飲みすぎた (đã uống quá chén). Kết hợp với「んです」thành「飲みすぎたんです」(Vì tôi đã lỡ uống quá chén đấy ạ).',
        grammarPoint: 'V(stem) + すぎる (quá mức)'
      },
      {
        index: 3,
        optionText: '飲んですぎた',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai quy tắc chia: Cấu trúc「すぎる」phải đi trực tiếp với thể Masu bỏ Masu (飲み), tuyệt đối KHÔNG đi với thể て (飲んで).',
        trapNote: 'Sai hình thái chia thể て với すぎる'
      }
    ]
  },

  'n4_nl01_g3': {
    id: 'n4_nl01_g3',
    fullSentenceTranslation: 'A: "Xin lỗi, vì tôi bị đau đầu nên xin phép cho tôi được nghỉ việc/nghỉ học..."\nB: "Tôi hiểu rồi. Bạn giữ gìn sức khỏe nhé."',
    grammarPoint: 'V-(さ)せてほしい (Thể sai khiến + てほしい): Xin phép đối phương cho chính bản thân mình được làm gì',
    correctReason: 'Đáp án 4「休ませて ほしいんですが」chính xác: Người nói (A) là người đau đầu và muốn xin đối phương (B) cho phép mình được nghỉ.',
    options: [
      {
        index: 0,
        optionText: '休んで ください',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai chủ thể:「V-てください」là yêu cầu đối phương (B) hãy nghỉ ngơi, trong khi chính A mới là người bị đau đầu muốn xin phép nghỉ.',
        trapNote: 'Nhầm lẫn chủ ngữ người hành động'
      },
      {
        index: 1,
        optionText: '休まれて ください',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai cấu trúc: Không tồn tại dạng kết hợp thể bị động/kính ngữ「休まれてください」để xin phép bản thân nghỉ.',
        trapNote: 'Cấu trúc kính ngữ bị động sai'
      },
      {
        index: 2,
        optionText: '休んで ほしいんですが',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai chủ thể:「V-てほしい」là muốn đối phương làm hành động (Tôi muốn bạn nghỉ ngơi), không dùng để xin phép cho chính mình.',
        trapNote: 'Nhầm giữa V-てほしい (muốn bạn làm) và V-させてほしい (cho phép tôi làm)'
      },
      {
        index: 3,
        optionText: '休ませて ほしいんですが',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác: 休む chuyển sang sai khiến là 休ませる (cho nghỉ) + てほしい (muốn được) -> 休ませてほしい (Muốn được cho phép nghỉ), là cách xin nghỉ việc/nghỉ học lịch sự chuẩn mực.',
        grammarPoint: '使役形 + てほしい (Xin phép cho bản thân)'
      }
    ]
  },

  'n4_nl01_g4': {
    id: 'n4_nl01_g4',
    fullSentenceTranslation: 'A: "Yamashita này, kỳ nghỉ hè cậu định làm gì?"\nB: "Mình dự định sẽ về nước."',
    grammarPoint: 'V-る / V-ない + つもりです: Diễn tả ý định, kế hoạch của bản thân',
    correctReason: 'Đáp án 1「つもり」chính xác:「帰るつもりです」diễn tả dự định chắc chắn của chính người nói B.',
    options: [
      {
        index: 0,
        optionText: 'つもり',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác:「V-る + つもりです」diễn tả dự định có ý chí của ngôi thứ nhất (Tôi dự định về nước).',
        grammarPoint: 'V-る + つもり (Dự định)'
      },
      {
        index: 1,
        optionText: 'はず',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai sắc thái:「はずです」dùng để phán đoán về người khác dựa trên căn cứ (chắc chắn là...), không dùng để nói về ý định của chính mình.',
        grammarPoint: 'V-る + はず (Chắc chắn là)'
      },
      {
        index: 2,
        optionText: 'よう',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai ngữ pháp:「〜ようです」chỉ sự phỏng đoán dựa trên thị giác/nghe ngóng (dường như là), không dùng cho ý định chủ quan.',
        grammarPoint: 'V-る + よう (Hình như)'
      },
      {
        index: 3,
        optionText: 'ばかり',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai cấu trúc:「帰るばかりです」nghĩa là "chỉ toàn về" hoặc "chỉ còn chờ về", không phải cách trả lời tự nhiên cho câu hỏi "dự định làm gì".',
        grammarPoint: 'V-る + ばかり'
      }
    ]
  },

  'n4_nl01_g5': {
    id: 'n4_nl01_g5',
    fullSentenceTranslation: 'A: "Bữa tiệc hôm trước có vui không?"\nB: "Vui lắm, giá mà bạn cũng đến thì tốt biết mấy."',
    grammarPoint: 'V-ばよかったのに: Giá mà... thì hay biết mấy (Diễn tả sự tiếc nuối cho đối phương)',
    correctReason: 'Đáp án 1「来れば よかったのに」chính xác: Diễn tả sự tiếc nuối vì người nghe A đã không tham gia bữa tiệc.',
    options: [
      {
        index: 0,
        optionText: '来れば よかったのに',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác:「〜ばよかったのに」thể hiện sự tiếc nuối khi việc trong quá khứ đã không xảy ra: "Giá mà cậu đến thì vui biết mấy".',
        grammarPoint: 'V-ばよかったのに (Giá mà...)'
      },
      {
        index: 1,
        optionText: '来れば よかったので',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai liên từ: Đuôi「ので」chỉ nguyên nhân (vì đã tốt nên...), câu bị lửng lơ và vô nghĩa.',
        trapNote: 'Nhầm liên từ のに (tiếc nuối) với ので (nguyên nhân)'
      },
      {
        index: 2,
        optionText: '来れば いいはずです',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai thì:「来ればいい」là thì hiện tại/tương lai, trong khi bữa tiệc「この間のパーティー」đã diễn ra trong quá khứ.',
        trapNote: 'Sai thì quá khứ'
      },
      {
        index: 3,
        optionText: '来れば よく なった はずです',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai cách diễn đạt: Cách ghép từ gượng gạo và không tự nhiên trong tiếng Nhật giao tiếp.',
        trapNote: 'Ghép từ sai ngữ cảnh'
      }
    ]
  },

  'n4_nl01_g6': {
    id: 'n4_nl01_g6',
    fullSentenceTranslation: 'A: "Xin lỗi, liệu đêm khuya cũng phải mở cửa tiệm hay sao ạ?"\nB: "Không, tôi nghĩ là không cần mở cũng được đâu."',
    grammarPoint: 'V-なくてもいい: Không cần làm gì đó cũng được',
    correctReason: 'Đáp án 3「開けなくても いい」chính xác: Câu hỏi của A là「開けなければならない」(phải mở), khi trả lời phủ định「いいえ」thì mẫu đối ứng là「開けなくてもいい」(không cần mở).',
    options: [
      {
        index: 0,
        optionText: '開けても いい',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Mâu thuẫn ngữ nghĩa: B trả lời「いいえ」(Không), do đó không thể nói「開けてもいい」(mở cũng được).',
        trapNote: 'Mâu thuẫn với từ phủ định いいえ'
      },
      {
        index: 1,
        optionText: '開けない はずだ',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Không hợp ngữ cảnh:「開けないはずだ」(chắc là sẽ không mở) là phán đoán về bên thứ ba, không trả lời đúng trọng tâm câu hỏi về quy định nghĩa vụ.',
        grammarPoint: 'はずだ (phán đoán)'
      },
      {
        index: 2,
        optionText: '開けなくても いい',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác: Phủ định của「〜なければならない」(phải làm) là「〜なくてもいい」(không cần làm cũng được).',
        grammarPoint: 'V-なくてもいい (Không cần làm)'
      },
      {
        index: 3,
        optionText: '開けなければ',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Câu chưa hoàn chỉnh:「開けなければ」mới là điều kiện cần (nếu không mở...), thiếu đuôi câu hoàn chỉnh.',
        trapNote: 'Câu lửng chưa xong cấu trúc'
      }
    ]
  },

  'n4_nl01_g7': {
    id: 'n4_nl01_g7',
    fullSentenceTranslation: 'A: "Tôi định dọn món ăn này cho các cụ lớn tuổi."\nB: "Món này cứng khó nhai lắm, tôi nghĩ là không ổn đâu."',
    grammarPoint: 'V-ます (bỏ ます) + にくい: Khó thực hiện một hành động nào đó',
    correctReason: 'Đáp án 4「かたくて 食べにくい」chính xác: Cứng (かたくて) dẫn đến khó ăn (食べにくい), làm lý do cho vế sau「無理だと思います」(không ổn đâu).',
    options: [
      {
        index: 0,
        optionText: 'かたいので 食べられる',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Vô lý về logic: "Vì cứng nên có thể ăn được" là mâu thuẫn trực tiếp với kết luận "không ổn đâu".',
        trapNote: 'Mâu thuẫn logic nhân quả'
      },
      {
        index: 1,
        optionText: 'かたすぎないので 食べた',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai thì và sai nghĩa: "Vì không quá cứng nên đã ăn", không liên quan đến việc khuyên can không nên dọn món.',
        trapNote: 'Không hợp ngữ cảnh khuyên can'
      },
      {
        index: 2,
        optionText: 'かたくて 食べやすい',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Mâu thuẫn:「食べやすい」(dễ ăn) trái nghĩa với thực tế món bị cứng (かたい).',
        trapNote: 'Nhầm lẫn やすい (dễ) và にくい (khó)'
      },
      {
        index: 3,
        optionText: 'かたくて 食べにくい',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác:「食べにくい」(khó ăn) bổ sung lý do tại sao người lớn tuổi không ăn được món cứng này.',
        grammarPoint: 'V(stem) + にくい (Khó làm gì)'
      }
    ]
  },

  'n4_nl01_g8': {
    id: 'n4_nl01_g8',
    fullSentenceTranslation: 'A: "Anh Wang sau khi tốt nghiệp thì sẽ làm gì thế?"\nB: "Tôi đang có dự định sẽ về nước."',
    grammarPoint: 'Thể ý chí V-よう + と思っています: Đang dự định / ấp ủ làm gì',
    correctReason: 'Đáp án 1「帰ろう」chính xác: Thể ý chí của 帰る (nhóm 1) là 帰ろう. Đi với「と思っています」để biểu đạt ý chí đã nung nấu từ trước.',
    options: [
      {
        index: 0,
        optionText: '帰ろう',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác: Động từ nhóm 1 chia thể ý chí: 帰る -> 帰ろう. Cấu trúc: 意向形 + と思っています.',
        grammarPoint: 'V-よう + と思っています (Ấp ủ dự định)'
      },
      {
        index: 1,
        optionText: '帰る',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai thể: Đi liền trước「と思っています」bắt buộc phải là Thể ý chí (帰ろう), không dùng thể từ điển nguyên thể.',
        trapNote: 'Dùng nhầm thể từ điển thay vì ý chí'
      },
      {
        index: 2,
        optionText: '帰って いる',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai ngữ nghĩa:「帰っていると思っています」(Tôi nghĩ rằng tôi đang về nước) là nhận định sai lệch về bản thân.',
        trapNote: 'Sai sắc thái ý định'
      },
      {
        index: 3,
        optionText: '帰る つもり',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Thừa cấu trúc: Nếu dùng「つもり」thì phải nói「帰るつもりです」, không ghép chồng「帰るつもりと思っています」.',
        trapNote: 'Chồng chéo cấu trúc つもり và と思っています'
      }
    ]
  },

  'n4_nl01_g9': {
    id: 'n4_nl01_g9',
    fullSentenceTranslation: 'A: "Bạn đã xem bức tranh của tôi chưa?"\nB: "Vâng, lúc nãy tôi đã vinh dự được chiêm ngưỡng ở đằng kia rồi ạ."',
    grammarPoint: 'Khiêm nhường ngữ: 拝見させていただきます (Được phép xem/chiêm ngưỡng)',
    correctReason: 'Đáp án 4「はいけんさせて いただきました」chính xác: 拝見 (hai-ken) là khiêm nhường ngữ của 見る, kết hợp với thể xin phép/được phép (〜させていただきました) thể hiện sự tôn kính cao nhất với tác phẩm của người khác.',
    options: [
      {
        index: 0,
        optionText: 'はいけんに なりました',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai cấu trúc:「お〜になる」là mẫu Tôn kính ngữ (dành cho hành động của đối phương), không được gắn vào từ khiêm nhường ngữ 拝見.',
        trapNote: 'Lẫn lộn Tôn kính ngữ và Khiêm nhường ngữ'
      },
      {
        index: 1,
        optionText: 'はいけんされて いただきました',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai cấu trúc ngữ pháp: Ghép dạng bị động「拝見されて」rồi thêm「いただきました」là sai quy tắc kính ngữ.',
        trapNote: 'Cấu trúc kính ngữ sai chuẩn'
      },
      {
        index: 2,
        optionText: 'はいけんさせました',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai ý nghĩa:「拝見させました」nghĩa là "bắt/cho phép ai đó chiêm ngưỡng", trở thành thái độ trịch thượng.',
        trapNote: 'Sai thể sai khiến một chiều'
      },
      {
        index: 3,
        optionText: 'はいけんさせて いただきました',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác: 拝見する (khiêm nhường ngữ) + させていだだく (được người khác cho phép làm) tạo thành cách nói khiêm nhường, tao nhã tuyệt đối.',
        grammarPoint: '謙譲語: 拝見させていただきます'
      }
    ]
  },

  'n4_nl01_g10': {
    id: 'n4_nl01_g10',
    fullSentenceTranslation: 'A: "Sao chiếc cặp lại bị vứt ở ngay cửa ra vào thế này?"\nB: "Thằng nhóc Masao lại để nguyên cặp chưa dọn mà đã chạy tót đi chơi rồi đấy."',
    grammarPoint: 'V-ない + まま: Giữ nguyên trạng thái chưa làm gì đó mà thực hiện hành động khác',
    correctReason: 'Đáp án 2「かたづけないまま」chính xác: Động từ 片付ける (dọn dẹp) chia phủ định かたづけない + まま (để nguyên tình trạng chưa dọn dẹp) mà đã đi chơi.',
    options: [
      {
        index: 0,
        optionText: 'かたづけたまま',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai logic:「かたづけたまま」(sau khi dọn dẹp xong thì để nguyên) mâu thuẫn với việc chiếc cặp vẫn đang bị vứt bừa bãi ở cửa ra vào.',
        trapNote: 'Trái ngược với tình trạng thực tế của câu'
      },
      {
        index: 1,
        optionText: 'かたづけないまま',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác: V-ない + まま: "để nguyên trạng thái chưa dọn dẹp" mà đã đi chơi.',
        grammarPoint: 'V-ない + まま (Giữ nguyên tình trạng)'
      },
      {
        index: 2,
        optionText: 'かたづけないながら',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai ngữ pháp: Cấu trúc「ながら」(vừa... vừa...) chỉ đi với V-Masu bỏ Masu khẳng định, không đi với dạng phủ định「〜ないながら」.',
        trapNote: 'ながら không đi với V-ない'
      },
      {
        index: 3,
        optionText: 'かたづけながら',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai ngữ nghĩa:「かたづけながら」(vừa dọn dẹp vừa đi chơi) là phi lý và mâu thuẫn với việc cặp bị vứt ở cửa.',
        grammarPoint: 'V-ながら (vừa làm A vừa làm B)'
      }
    ]
  },

  'n4_nl01_g11': {
    id: 'n4_nl01_g11',
    fullSentenceTranslation: 'A: "Nếu định đi ra ngoài thì bạn nên mặc áo khoác vào nhé."\nB: "Trời không lạnh đến mức đó đâu nên mình ổn mà."',
    grammarPoint: 'V-る + なら: Nếu định làm gì (đưa ra lời khuyên chuẩn bị trước)',
    correctReason: 'Đáp án 3「出かけるなら」chính xác:「なら」dùng khi đưa ra lời khuyên hoặc yêu cầu cần làm trước khi một hành động (ra ngoài) diễn ra.',
    options: [
      {
        index: 0,
        optionText: '出かければ',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai logic thời gian:「出かければ」(nếu đã ra ngoài rồi thì mặc áo khoác) là vô lý vì áo khoác phải mặc trước khi bước ra khỏi nhà.',
        grammarPoint: '〜ば (điều kiện thuận)'
      },
      {
        index: 1,
        optionText: '出かけたら',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai thứ tự:「出かけたら」nghĩa là sau khi đã ra khỏi nhà rồi mới làm, không thể mặc áo khoác sau khi đã đi ra ngoài.',
        grammarPoint: '〜たら (sau khi làm xong A thì B)'
      },
      {
        index: 2,
        optionText: '出かけるなら',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác:「V-る + なら」đặc trưng cho việc chuẩn bị trước: "Nếu cậu định ra ngoài thì (trước đó) nên mặc áo ấm vào".',
        grammarPoint: 'V-る + なら (Nếu định làm...)'
      },
      {
        index: 3,
        optionText: '出かけると',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai cấu trúc: Mẫu「〜と」chỉ quy luật tự nhiên hoặc hệ quả tất yếu, vế sau không được dùng câu khuyên nhủ「〜ほうがいい」.',
        trapNote: 'Cấu trúc 〜と không đi với câu khuyên nhủ/mệnh lệnh'
      }
    ]
  },

  'n4_nl01_g12': {
    id: 'n4_nl01_g12',
    fullSentenceTranslation: 'A: "Năm nay mưa nhiều ghê nhỉ."\nB: "Ừ, nhưng mà vẫn không nhiều bằng năm ngoái đâu."',
    grammarPoint: 'N + ほど〜ない: Không bằng N (So sánh kém)',
    correctReason: 'Đáp án 1「去年ほどでは ない」chính xác: Cấu trúc「Nほど〜ない」nghĩa là không bằng năm ngoái, phù hợp với liên từ đảo nghịch「でも」(nhưng).',
    options: [
      {
        index: 0,
        optionText: '去年ほどでは ない',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác:「去年ほどではない」mang nghĩa "không mưa nhiều đến mức như năm ngoái", hoàn toàn ăn khớp với chữ「でも」.',
        grammarPoint: 'N + ほど〜ない (Không bằng)'
      },
      {
        index: 1,
        optionText: '去年より ふって いる',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Mâu thuẫn ngữ cảnh: Nếu là "mưa nhiều hơn năm ngoái" thì không dùng từ nối đảo ngược「でも」(nhưng).',
        trapNote: 'Mâu thuẫn với liên từ でも'
      },
      {
        index: 2,
        optionText: '去年と 同じぐらい ふって いる',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Không phù hợp: "Mưa tương đương năm ngoái" không tạo ra sắc thái tương phản cần thiết sau「でも」.',
        trapNote: 'Không có sắc thái tương phản'
      },
      {
        index: 3,
        optionText: '去年ほど ふって いる',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai cấu trúc:「ほど」chỉ mức độ so sánh kém bắt buộc phải đi với thể phủ định (ない), không đi với khẳng định「ふっている」.',
        trapNote: 'ほど bắt buộc đi với thể phủ định'
      }
    ]
  },

  'n4_nl01_g13': {
    id: 'n4_nl01_g13',
    fullSentenceTranslation: 'A: "Yamashita đến muộn quá nhỉ. Không biết có chuyện gì nữa."\nB: "Yên tâm đi. Chắc chắn anh ấy sẽ đến ngay thôi."',
    grammarPoint: 'V-る + はずだ: Chắc chắn là... (Phán đoán có căn cứ xác thực)',
    correctReason: 'Đáp án 4「もうすぐ 着く はずだ」chính xác: Để trấn an A (大丈夫), B đưa ra phán đoán chắc chắn: "Chắc chắn là sắp tới nơi rồi".',
    options: [
      {
        index: 0,
        optionText: 'すぐ 着かない',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Mâu thuẫn: Nói "Không đến ngay đâu" thì không thể là lý do để khuyên bạn "Yên tâm đi" (大丈夫).',
        trapNote: 'Mâu thuẫn trực tiếp với lời trấn an'
      },
      {
        index: 1,
        optionText: 'もうすぐ 着く つもりだ',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai chủ ngữ:「つもり」chỉ dùng cho dự định của chính người nói, không dùng「つもりだ」cho hành động của Yamashita.',
        trapNote: 'Dùng つもり cho ngôi thứ ba'
      },
      {
        index: 2,
        optionText: 'もうすぐ 着いた',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai ngữ pháp:「もうすぐ」(sắp sửa) chỉ tương lai gần, không thể đi với động từ quá khứ「着いた」.',
        trapNote: 'Mâu thuẫn giữa もうすぐ và thì quá khứ'
      },
      {
        index: 3,
        optionText: 'もうすぐ 着く はずだ',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác:「V-る + はずだ」thể hiện niềm tin chắc chắn: "Sắp tới nơi rồi, không phải lo".',
        grammarPoint: 'V-る + はずだ (Chắc chắn sẽ)'
      }
    ]
  },

  'n4_nl01_g14': {
    id: 'n4_nl01_g14',
    fullSentenceTranslation: 'A: "Ái chà, mây đen kéo đến rồi kìa."\nB: "Thật đấy. Trông trời có vẻ sắp đổ mưa rồi."',
    grammarPoint: 'V-ます (bỏ ます) + そうです: Có vẻ sắp... (Dự đoán sắp xảy ra dựa trên hiện tượng mắt thấy)',
    correctReason: 'Đáp án 2「ふりだしそうです」chính xác: 降り出す (bắt đầu mưa) bỏ ます thành 降り出し + そうです = có vẻ trời sắp bắt đầu đổ mưa.',
    options: [
      {
        index: 0,
        optionText: 'ふって くるそうです',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai ý nghĩa: Thể từ điển + そうです là truyền ngôn (nghe nói là sẽ mưa), trong khi ở đây cả hai đang trực tiếp nhìn thấy mây đen.',
        trapNote: 'Nhầm lẫn giữa そうだ (nghe đồn) và そうだ (trông có vẻ)'
      },
      {
        index: 1,
        optionText: 'ふりだしそうです',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác: 降り出す (đổ mưa) -> 降り出し + そうです diễn tả hiện tượng sắp sửa xảy ra ngay trước mắt: "Trời sắp mưa to rồi".',
        grammarPoint: 'V(stem) + そうです (Sắp xảy ra)'
      },
      {
        index: 2,
        optionText: 'ふって きた はずでしょう',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai thời điểm: Mưa vẫn chưa rơi mà mây đen mới kéo đến, không thể dùng thể quá khứ「ふってきた」.',
        trapNote: 'Sai trạng thái thực tế'
      },
      {
        index: 3,
        optionText: 'ふりそうにも ありません',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Mâu thuẫn:「降るそうにもありません」(không có vẻ gì là sẽ mưa) đi ngược lại việc mây đen đang vần vũ.',
        trapNote: 'Trái ngược với dấu hiệu mây đen'
      }
    ]
  },

  'n4_nl01_g15': {
    id: 'n4_nl01_g15',
    fullSentenceTranslation: 'A: "Cậu có biết bài thi ngày mai có khó hay không không?"\nB: "Ừ, nghe nói là khó đấy."',
    grammarPoint: 'Thể thông thường + かどうか: Có... hay không',
    correctReason: 'Đáp án 3「むずかしいか どうか」chính xác: Lồng câu hỏi nghi vấn không có từ để hỏi vào trong câu lớn: "Biết liệu nó có khó hay không".',
    options: [
      {
        index: 0,
        optionText: 'むずかしいようと',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai cấu trúc: Không tồn tại dạng kết hợp「ようと知っている」trong tiếng Nhật.',
        trapNote: 'Sai cấu trúc kết hợp từ'
      },
      {
        index: 1,
        optionText: 'むずかしそうか',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Không chuẩn ngữ pháp: Trong câu hỏi lồng về tính chất khách quan của đề thi, dùng trực tiếp tính từ thông thường「難しいかどうか」.',
        trapNote: 'Dùng nhầm そう'
      },
      {
        index: 2,
        optionText: 'むずかしいか どうか',
        isCorrect: true,
        statusTag: '⭕ ĐÚNG',
        reason: 'Chính xác: Cấu trúc câu hỏi lồng: [Mệnh đề] + かどうか + 知っている: "Có biết là bài thi có khó hay không không".',
        grammarPoint: '〜かどうか (Liệu có... hay không)'
      },
      {
        index: 3,
        optionText: 'むずかしそうと',
        isCorrect: false,
        statusTag: '❌ SAI',
        reason: 'Sai ngữ pháp: Không thể dùng trợ từ「と」kết nối với động từ「知っている」trong ngữ cảnh này.',
        trapNote: 'Sai trợ từ liên kết'
      }
    ]
  }
};

/**
 * Intelligent helper to retrieve the exact translation, explanations,
 * and individual breakdown for every option.
 */
export function getBunpouDetail(questionId: string): BunpouQuestionDetail | undefined {
  return BUNPOU_EXPLANATION_DATABASE[questionId];
}
