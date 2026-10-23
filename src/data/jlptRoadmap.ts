import type { JLPTLevel, StudyRoadmapConfig } from "../types";

export interface RoadmapStage {
  name: string;
  subtitle: string;
  words: string[];
  grammar: string[];
  reading: string[];
  listening: string[];
  outcome: string;
  checkpoint: string;
}
export interface LevelJourney {
  title: string;
  japanese: string;
  description: string;
  prerequisite: string;
  stages: RoadmapStage[];
}
const stage = (
  name: string,
  subtitle: string,
  words: string[],
  grammar: string[],
  reading: string[],
  listening: string[],
  outcome: string,
  checkpoint: string,
): RoadmapStage => ({
  name,
  subtitle,
  words,
  grammar,
  reading,
  listening,
  outcome,
  checkpoint,
});

export const JLPT_JOURNEYS: Record<JLPTLevel, LevelJourney> = {
  N5: {
    title: "Bước đầu đến Nhật Bản",
    japanese: "はじめの一歩",
    description: "Từ bảng chữ đến những câu chuyện nhỏ trong cuộc sống.",
    prerequisite:
      "Bắt đầu từ nền tảng. Nếu chưa đọc được kana, dành thêm thời gian cho chặng 1 trước khi đi tiếp.",
    stages: [
      stage(
        "Cánh cổng kana",
        "Đọc được, nghe được, bắt đầu nói được",
        [
          "Hiragana: âm cơ bản, âm đục, âm ghép",
          "Katakana: từ mượn, trường âm, âm ngắt",
          "Số đếm, giờ, ngày tháng; 一・二・三・日・月",
        ],
        [
          "N は N です／ではありません",
          "これ・それ・あれ／この・その・あの",
          "Trợ từ は・の・か và câu hỏi 何・だれ",
        ],
        [
          "Đọc tên, số điện thoại và bảng giờ đơn giản",
          "Nhận diện từ katakana trên thực đơn",
        ],
        [
          "Phân biệt trường âm và âm ngắt",
          "Nghe giới thiệu tên, tuổi và quốc tịch",
        ],
        "Tự giới thiệu 4 câu; đọc kana không dựa vào romaji.",
        "Đọc 20 từ kana, nghe 5 thông tin cá nhân; ghi lại âm còn nhầm.",
      ),
      stage(
        "Một ngày của bạn",
        "Thời gian, địa điểm và thói quen",
        [
          "Đồ vật, trường học, gia đình; 人・子・父・母",
          "Động từ sinh hoạt; 行・来・食・飲",
          "Ngày trong tuần, phương tiện; 火・水・木・金・土",
        ],
        [
          "Vます・ません・ました・ませんでした",
          "Trợ từ を・に・へ・で・と",
          "Thời gian から／まで; いつ・どこ",
        ],
        [
          "Đọc lịch sinh hoạt và thời khóa biểu",
          "Tìm thời gian, nơi chốn trong tin nhắn",
        ],
        [
          "Nghe giờ hẹn và phương tiện di chuyển",
          "Nghe chuỗi hoạt động trong một ngày",
        ],
        "Kể được lịch một ngày với thời gian và địa điểm.",
        "Trả lời 10 câu về trợ từ; nghe và điền 5 mốc thời gian.",
      ),
      stage(
        "Thế giới quanh mình",
        "Miêu tả, so sánh và tìm đồ vật",
        [
          "Màu sắc, thời tiết; 天・気・雨・空",
          "Mua sắm, giá tiền; 円・百・千・万",
          "Vị trí và nơi chốn; 上・下・中・外",
        ],
        [
          "Tính từ い／な: hiện tại, quá khứ, phủ định",
          "あります／います và từ chỉ vị trí",
          "より／のほうが; いちばん",
        ],
        [
          "Đọc mô tả phòng và thông tin cửa hàng",
          "So sánh giá, giờ mở cửa, đặc điểm sản phẩm",
        ],
        ["Nghe chọn đồ vật theo đặc điểm", "Nghe chỉ vị trí người và vật"],
        "Miêu tả căn phòng và chọn một món đồ theo điều kiện.",
        "Đọc một quảng cáo, nghe 5 câu chọn hình; giải thích từ khóa.",
      ),
      stage(
        "Kết nối bằng lời nói",
        "Nhờ giúp đỡ, mời và kể việc đang làm",
        [
          "Sức khỏe, cơ thể; 手・目・口・耳",
          "Hoạt động thường ngày; 見・聞・読・書",
          "Sở thích và lời mời; 友・会・話",
        ],
        [
          "Thể て và ～てください／～てもいいです",
          "～てはいけません／～ています",
          "～ましょう／～ませんか; ～たいです",
        ],
        [
          "Đọc lời nhắn và hướng dẫn ngắn",
          "Tìm yêu cầu hoặc điều bị cấm trong thông báo",
        ],
        [
          "Nghe yêu cầu và chọn hành động tiếp theo",
          "Shadowing 3 câu lời mời, lời nhờ vả",
        ],
        "Hiểu lời nhờ vả và trả lời một lời mời đơn giản.",
        "Tự chia 10 động từ sang thể て; nghe 5 yêu cầu không nhìn chữ.",
      ),
      stage(
        "Ghép thành câu chuyện",
        "Kết nối nguyên nhân và trình tự",
        [
          "Du lịch, nghỉ lễ; 山・川・海・駅",
          "Từ chỉ tần suất và trình tự",
          "Ôn kanji qua cặp từ và câu ngắn",
        ],
        [
          "Thể ない; ～ないでください",
          "～から; ～てから; ～前に／～後で",
          "Thể た; ～が好きです／～が上手です",
        ],
        ["Đọc đoạn kể sinh hoạt 5–8 câu", "Tìm ai, làm gì, khi nào và vì sao"],
        [
          "Nghe hội thoại ngắn, ghi người và hành động",
          "Nghe phản hồi phù hợp trong tình huống quen thuộc",
        ],
        "Hiểu một đoạn ngắn về sinh hoạt và kể lại ý chính.",
        "Làm một bộ câu hỏi hỗn hợp; phân loại lỗi từ, trợ từ, nghe và đọc.",
      ),
      stage(
        "Sẵn sàng N5",
        "Ôn có mục tiêu, luyện theo thời gian",
        [
          "Ôn sổ từ sai; đọc kanji trong ngữ cảnh",
          "Phân biệt từ gần âm và lượng từ",
          "Nhắc lại từ cũ sau 1, 3 và 7 ngày",
        ],
        [
          "Ôn trợ từ và toàn bộ cách chia đã học",
          "Sắp xếp thành câu; điền ngữ pháp trong đoạn",
          "So sánh cặp mẫu thường nhầm",
        ],
        [
          "Luyện đoạn ngắn và tìm thông tin",
          "Làm đề luyện N5, xem lại từng phương án sai",
        ],
        [
          "Luyện nghe nhiệm vụ, hội thoại và phản hồi",
          "Nghe lại câu sai rồi shadowing với phụ đề",
        ],
        "Hoàn thành đề luyện và biết rõ phần cần ôn tiếp.",
        "Làm đề luyện đủ phần; chữa lỗi vào hôm sau, không chỉ xem điểm.",
      ),
    ],
  },
  N4: {
    title: "Tự tin trong đời sống",
    japanese: "毎日を、もっと自由に",
    description: "Hiểu hội thoại quen thuộc, đọc thông báo và kể trải nghiệm.",
    prerequisite:
      "Đã đọc kana và nắm nền tảng N5: trợ từ, thể て, ない, た và tính từ. Chưa chắc phần nào thì ôn lại trước.",
    stages: [
      stage(
        "Xây nền vững chắc",
        "Nối kiến thức N5 với thể thông thường",
        [
          "Sinh hoạt, nhà cửa; 住・家・部・屋",
          "Lịch hẹn và công việc; 仕・事・働・休",
          "Ôn động từ theo nhóm và cặp tự／tha động từ",
        ],
        [
          "Thể thông thường; ～と思います／～と言います",
          "Mệnh đề bổ nghĩa danh từ",
          "～んです và cách giải thích tình huống",
        ],
        [
          "Đọc lời nhắn gia đình và lịch làm việc",
          "Tìm chủ ngữ của mệnh đề dài",
        ],
        [
          "Nghe lý do đổi lịch và lời giải thích",
          "Shadowing câu dùng ～んです",
        ],
        "Hiểu lời giải thích và viết một đoạn kể sinh hoạt.",
        "Luyện 10 câu thể thông thường; đọc 2 lời nhắn và xác định người làm.",
      ),
      stage(
        "Lựa chọn và kế hoạch",
        "Khả năng, dự định và lời khuyên",
        [
          "Học tập, kỹ năng; 勉・強・習・教",
          "Kế hoạch du lịch; 旅・地・図・道",
          "Thời tiết và mùa; 春・夏・秋・冬",
        ],
        [
          "Thể khả năng; ～ことができます",
          "～つもり／～予定; thể ý chí＋と思っています",
          "～ほうがいい／～なければなりません",
        ],
        [
          "Đọc kế hoạch và hướng dẫn đăng ký",
          "Tìm điều kiện, thời hạn và việc cần làm",
        ],
        [
          "Nghe lựa chọn hoạt động và lịch trình",
          "Nghe lời khuyên để chọn cách xử lý",
        ],
        "Nói được dự định và hiểu điều kiện của một kế hoạch.",
        "So sánh つもり／予定; nghe 5 tình huống chọn hành động.",
      ),
      stage(
        "Điều kiện và thay đổi",
        "Diễn đạt nếu, khi và dần dần",
        [
          "Sức khỏe, bệnh viện; 病・院・体・薬",
          "Máy móc và thao tác; 電・機・開・閉",
          "Từ chỉ biến đổi, mức độ và kết quả",
        ],
        [
          "～たら／～ば／～と／～なら",
          "～ようになる／～ようにする",
          "～てしまう／～ておく; ～ながら",
        ],
        [
          "Đọc hướng dẫn sử dụng và quy định",
          "Theo dõi thứ tự thao tác và điều kiện",
        ],
        [
          "Nghe sự cố và cách giải quyết",
          "Nghe điều kiện làm thay đổi lựa chọn",
        ],
        "Hiểu hướng dẫn có điều kiện và kể một thay đổi của bản thân.",
        "Đối chiếu 4 cách nói điều kiện; tìm lỗi trong 5 hướng dẫn.",
      ),
      stage(
        "Quan hệ và cảm xúc",
        "Cho nhận, yêu cầu và suy đoán",
        [
          "Quan hệ xã hội; 親・兄・弟・姉・妹",
          "Cảm xúc, lời cảm ơn và xin lỗi",
          "Đồ dùng, quà tặng; 品・物・持・送",
        ],
        [
          "あげる／くれる／もらう; ～てあげる／くれる／もらう",
          "～そうです／～ようです／～かもしれません",
          "Thể bị động cơ bản; kính ngữ quen thuộc",
        ],
        [
          "Đọc email nhờ vả và thư cảm ơn",
          "Xác định người cho, người nhận và sắc thái",
        ],
        ["Nghe lời nhờ vả gián tiếp", "Nghe chọn đáp lời phù hợp quan hệ"],
        "Theo dõi đúng người làm, người nhận và cảm xúc trong hội thoại.",
        "Vẽ mũi tên người cho／nhận cho 5 câu; nghe 5 lời đáp.",
      ),
      stage(
        "Đọc và nghe có chiến lược",
        "Tìm thông tin, giữ mạch câu chuyện",
        [
          "Thông báo, dịch vụ; 場・所・使・用",
          "Phó từ và từ nối: それで・しかし・それに",
          "Ôn cách đọc kanji theo cụm thay vì từng chữ",
        ],
        [
          "～ので／～のに／～ても",
          "～かどうか／～か; ～ところ／～ばかり",
          "Sắp xếp câu và ngữ pháp trong đoạn",
        ],
        [
          "Đọc đoạn kể trải nghiệm và ý kiến",
          "Tìm chi tiết trong lịch, quảng cáo và thông báo",
        ],
        ["Nghe nhiệm vụ và nắm ý chính", "Ghi lựa chọn bị loại cùng lý do"],
        "Đọc để lấy thông tin và nghe được quyết định cuối cùng.",
        "Làm bộ đọc＋nghe; mỗi câu sai ghi bằng chứng từ bài.",
      ),
      stage(
        "Bứt phá N4",
        "Đề luyện, chữa lỗi và củng cố",
        [
          "Ôn từ gần nghĩa, cách dùng và lượng từ",
          "Ôn chữ sai theo chu kỳ 1–3–7 ngày",
          "Luyện từ vựng trong đoạn, tránh học nghĩa rời",
        ],
        [
          "Lập bảng cặp mẫu dễ nhầm",
          "Luyện sắp xếp câu và đoạn văn",
          "Ôn điều kiện, cho nhận và cách chia",
        ],
        [
          "Làm đề N4 có giới hạn thời gian",
          "Chữa đọc: ý chính, chi tiết, suy luận",
        ],
        ["Làm bài nghe N4 không mở phụ đề", "Nghe lại rồi shadowing đoạn sai"],
        "Có hồ sơ lỗi rõ ràng và nhịp làm bài ổn định.",
        "Làm đề luyện đủ phần, dành một buổi chữa lỗi và thử lại sau 3 ngày.",
      ),
    ],
  },
  N3: {
    title: "Mở rộng thế giới của bạn",
    japanese: "世界が広がる",
    description:
      "Đi từ tiếng Nhật quen thuộc đến ý kiến, tin tức và hội thoại dài hơn.",
    prerequisite:
      "Đã nắm N4, đọc được đoạn sinh hoạt và hiểu hội thoại ngắn. Ôn cách chia, điều kiện và cho nhận nếu còn lẫn.",
    stages: [
      stage(
        "Bắc cầu lên trung cấp",
        "Từ câu đơn đến ngữ cảnh",
        [
          "Đời sống đô thị, giao thông, nhà ở",
          "Kanji bộ thủ và từ ghép: 運・転・通・勤",
          "Phó từ chỉ mức độ và tần suất",
        ],
        [
          "～ことになった／～ことにした",
          "～ように／～ために",
          "～ている／～てある／～ておく",
        ],
        [
          "Đọc email thông báo và hướng dẫn",
          "Tách mệnh đề, xác định từ thay thế",
        ],
        ["Nghe thông báo, ghi việc và thời hạn", "Shadowing theo cụm nghĩa"],
        "Theo dõi việc cần làm qua một thông báo dài.",
        "Đọc 2 thông báo; nghe lại và ghi đủ ai／việc／hạn.",
      ),
      stage(
        "Kể chuyện và giải thích",
        "Trình tự, nguyên nhân và kết quả",
        [
          "Trải nghiệm, học tập, nghề nghiệp",
          "Từ ghép hành động: 経・験・説・明",
          "Từ nối biểu thị kết quả và đối lập",
        ],
        [
          "～うちに／～間に／～たびに",
          "～おかげで／～せいで／～によって",
          "～たところ／～ところだった",
        ],
        [
          "Đọc đoạn kể trải nghiệm và bài giải thích",
          "Dựng trục thời gian, tìm nguyên nhân",
        ],
        ["Nghe câu chuyện và thứ tự sự kiện", "Nghe nguyên nhân của thay đổi"],
        "Tóm tắt được diễn biến và lý do bằng 3–5 câu.",
        "Đọc một bài rồi tóm tắt; nghe và sắp xếp 5 sự kiện.",
      ),
      stage(
        "Hiểu ý kiến và sắc thái",
        "Dự đoán, đánh giá và so sánh",
        [
          "Cảm xúc, đánh giá, thái độ",
          "Tin tức quen thuộc: 社・会・意・見",
          "Phân biệt từ gần nghĩa trong ngữ cảnh",
        ],
        [
          "～はず／～わけ／～べき",
          "～らしい／～ようだ／～みたいだ",
          "～ほど／～くらい／～ば～ほど",
        ],
        [
          "Đọc đoạn ý kiến và tìm quan điểm tác giả",
          "Tách sự thật khỏi đánh giá",
        ],
        [
          "Nghe thái độ và lý do đồng ý／phản đối",
          "Nhận biết kết luận sau từ nối",
        ],
        "Hiểu ý kiến và mức chắc chắn của người nói.",
        "So sánh 5 cặp sắc thái; giải thích bằng chứng cho đáp án đọc.",
      ),
      stage(
        "Hội thoại có chiều sâu",
        "Quan hệ, nhờ vả và hành động",
        [
          "Công sở, dịch vụ, lịch hẹn",
          "Kính ngữ thông dụng; 連・絡・相・談",
          "Cụm cố định trong email và hội thoại",
        ],
        [
          "Bị động, sai khiến, sai khiến bị động",
          "～てもらえませんか／～ていただけませんか",
          "～ばかり／～だけでなく／～さえ",
        ],
        [
          "Đọc email trao đổi và quy định",
          "Theo dõi đối tượng của lời yêu cầu",
        ],
        [
          "Nghe nhiệm vụ có nhiều điều kiện",
          "Luyện phản hồi nhanh và biểu đạt lời nói",
        ],
        "Nắm được quan hệ và quyết định trong hội thoại công việc.",
        "Vẽ sơ đồ người làm; nghe 5 nhiệm vụ có ít nhất 2 điều kiện.",
      ),
      stage(
        "Đọc sâu, nghe chủ động",
        "Dùng cấu trúc để tìm đáp án",
        [
          "Từ trừu tượng về xã hội và học tập",
          "Từ nối: つまり・一方・ところが",
          "Ôn kanji và nghĩa từ theo bài đọc",
        ],
        [
          "Ngữ pháp trong đoạn và liên kết câu",
          "Sắp xếp câu dựa trên trợ từ và mệnh đề",
          "Ôn điểm nhầm từ sổ lỗi",
        ],
        [
          "Luyện bài ngắn, trung bình, dài và tìm thông tin",
          "Đặt tiêu đề cho từng đoạn trước khi làm câu hỏi",
        ],
        [
          "Nghe ý chính, nhiệm vụ, điểm thông tin",
          "Nghe lần đầu không dừng; lần sau tìm đoạn bằng chứng",
        ],
        "Xác định ý chính mà không dịch mọi từ.",
        "Làm bộ đọc／nghe tính giờ; ghi từ khóa và đoạn bằng chứng.",
      ),
      stage(
        "Về đích N3",
        "Làm đề và nâng phần yếu",
        [
          "Ôn cách đọc, chính tả, diễn đạt tương đương",
          "Luyện cách dùng từ trong câu",
          "Ôn sổ lỗi sau 1–3–7 ngày",
        ],
        [
          "Ôn mẫu theo chức năng và sắc thái",
          "Luyện sắp xếp câu trong thời gian giới hạn",
          "Luyện ngữ pháp trong văn bản",
        ],
        [
          "Làm đề luyện N3 và chữa theo dạng",
          "Rút thời gian ở bài dễ, giữ thời gian cho bài dài",
        ],
        ["Làm nghe liền mạch không phụ đề", "Chép và shadowing đoạn sai"],
        "Theo dõi độ chính xác từng dạng và có kế hoạch ôn tiếp.",
        "Làm 2 lượt đề khác nhau, chữa lỗi giữa hai lượt; không suy điểm JLPT từ % đúng.",
      ),
    ],
  },
  N2: {
    title: "Chinh phục những ý tưởng lớn",
    japanese: "考えを、深く読み解く",
    description:
      "Đọc lập luận, theo dõi tin tức và xử lý tiếng Nhật trong nhiều tình huống.",
    prerequisite:
      "Nền N3 vững; có thể đọc bài trung bình và nghe hội thoại tốc độ tự nhiên về chủ đề quen thuộc.",
    stages: [
      stage(
        "Nền tảng học thuật",
        "Từ ghép, collocation và cấu trúc",
        [
          "Từ ghép Hán Nhật về giáo dục, công việc",
          "Cặp tự／tha động từ và cụm dùng cố định",
          "Cách đọc nhiều âm và từ đồng âm",
        ],
        [
          "～に関して／～について／～をめぐって",
          "～に対して／～にとって／～として",
          "～によると／～とのことだ",
        ],
        [
          "Đọc bài giải thích, xác định chủ đề từng đoạn",
          "Tìm phạm vi của mệnh đề bổ nghĩa",
        ],
        [
          "Nghe tường thuật và thông báo công việc",
          "Ghi chủ đề, vấn đề và kết luận",
        ],
        "Tách được cấu trúc một bài giải thích và dùng từ đúng cụm.",
        "Tóm tắt bài 3 đoạn; đối chiếu 5 cặp mẫu có phạm vi khác nhau.",
      ),
      stage(
        "Lập luận và đối chiếu",
        "Đi theo dòng suy nghĩ tác giả",
        [
          "Kinh tế, xã hội, môi trường",
          "Từ nối nhượng bộ, bổ sung và phản biện",
          "Từ gần nghĩa: sắc thái, chủ thể, kết hợp",
        ],
        [
          "～ものの／～とはいえ／～ながらも",
          "～一方で／～反面／～に比べて",
          "～わけではない／～とは限らない",
        ],
        [
          "Đọc ý kiến và xác định luận điểm／dẫn chứng",
          "Theo dõi câu phủ định và ngoại lệ",
        ],
        [
          "Nghe đồng ý một phần và ý kiến đối lập",
          "Nhận diện kết luận được sửa ở cuối",
        ],
        "Hiểu kết luận và giới hạn của một lập luận.",
        "Gạch luận điểm, dẫn chứng và ngoại lệ; nghe 5 ý kiến đối lập.",
      ),
      stage(
        "Sắc thái trong ngữ cảnh",
        "Ý định, đánh giá và tính tất yếu",
        [
          "Thái độ, mức độ và đánh giá",
          "Từ trừu tượng và cách diễn đạt tương đương",
          "Thành ngữ thường gặp trong báo và đời sống",
        ],
        [
          "～ざるを得ない／～わけにはいかない",
          "～かねる／～かねない／～得る",
          "～ものだ／～ことだ／～ことはない",
        ],
        [
          "Đọc nhận xét và bài tư vấn",
          "Giải nghĩa biểu đạt dựa vào câu trước／sau",
        ],
        [
          "Nghe ngụ ý và cảm xúc qua cách nói",
          "Theo dõi lời đề nghị gián tiếp",
        ],
        "Phân biệt mẫu gần nghĩa bằng bối cảnh và thái độ.",
        "Tạo 2 bối cảnh đối lập cho mỗi cặp mẫu; kiểm tra cách dùng từ.",
      ),
      stage(
        "Đọc đa nguồn",
        "So sánh, tổng hợp và tìm thông tin",
        [
          "Quy định, dịch vụ, đăng ký, hợp đồng",
          "Cụm diễn đạt điều kiện và hạn chế",
          "Từ tham chiếu và liên kết nội dung",
        ],
        [
          "～に限り／～限り／～に限らず",
          "～に応じて／～に伴って／～につれて",
          "～上で／～上に／～上は",
        ],
        [
          "Đọc hai văn bản và đối chiếu điểm chung／khác",
          "Tìm thông tin từ nhiều điều kiện",
        ],
        [
          "Nghe hướng dẫn, bỏ lựa chọn không phù hợp",
          "Luyện hội thoại dài với bảng ghi điều kiện",
        ],
        "Tổng hợp thông tin để chọn phương án thỏa tất cả điều kiện.",
        "Đọc 2 thông báo cùng chủ đề; lập bảng điều kiện trước khi chọn.",
      ),
      stage(
        "Tốc độ và độ chính xác",
        "Đọc dài và nghe tích hợp",
        [
          "Ôn từ qua bài bình luận và tin tức",
          "Phân biệt từ viết và khẩu ngữ",
          "Từ sai thường gặp trong đề luyện",
        ],
        [
          "Sắp xếp câu dài theo cặp liên kết",
          "Ngữ pháp văn bản và liên kết logic",
          "Ôn mẫu từ sổ lỗi thay vì ôn dàn trải",
        ],
        [
          "Luyện bài dài: mục đích, luận điểm, kết luận",
          "Đọc tính giờ, xem lại chỗ mất thời gian",
        ],
        [
          "Luyện hiểu tổng hợp và phản hồi nhanh",
          "Nghe toàn bài trước, tìm bằng chứng sau",
        ],
        "Giữ được mạch bài dài và xử lý lựa chọn hiệu quả.",
        "Làm bộ đọc dài／nghe tích hợp; ghi thời gian và lý do sai.",
      ),
      stage(
        "Chiến lược N2",
        "Đề luyện có phản hồi",
        [
          "Ôn kanji, cách dùng và diễn đạt tương đương",
          "Ôn collocation từ câu đã sai",
          "Hệ thống sổ lỗi theo dạng câu hỏi",
        ],
        [
          "Ôn nhóm mẫu sắc thái và điều kiện",
          "Luyện ngữ pháp văn bản tính giờ",
          "Kiểm tra lại lỗi sau 3 ngày",
        ],
        [
          "Làm đề luyện N2 liền mạch",
          "Phân bổ thời gian theo kết quả luyện thực tế",
        ],
        [
          "Làm toàn bộ phần nghe không dừng",
          "Chép đoạn sai và luyện lại ở tốc độ gốc",
        ],
        "Có nhịp làm bài và chiến lược riêng cho phần yếu.",
        "Làm đề, chữa từng phương án, thử lại lỗi; theo dõi từng kỹ năng riêng.",
      ),
    ],
  },
  N1: {
    title: "Đọc sâu, hiểu tinh tế",
    japanese: "言葉の、その先へ",
    description:
      "Đọc nội dung phức tạp, hiểu sắc thái và theo dõi lập luận ở tốc độ tự nhiên.",
    prerequisite:
      "Nền N2 chắc; quen đọc bài dài và nghe hội thoại／tin tức tự nhiên. Dành thêm thời gian cho từ trừu tượng nếu cần.",
    stages: [
      stage(
        "Vốn từ có chiều sâu",
        "Từ trừu tượng và cách dùng chính xác",
        [
          "Từ học thuật, chính luận và biểu đạt văn viết",
          "Từ đồng âm, đa nghĩa, collocation",
          "Kanji ít gặp và từ ghép đọc đặc biệt",
        ],
        [
          "～に至る／～に至って／～に至っては",
          "～をもって／～をもってしても",
          "～に即して／～に則って／～を踏まえて",
        ],
        [
          "Đọc bài giải thích chuyên sâu",
          "Tách định nghĩa, ví dụ và phạm vi nhận định",
        ],
        [
          "Nghe bài nói một chủ đề có cấu trúc",
          "Tóm tắt luận điểm bằng từ khóa",
        ],
        "Hiểu cách dùng từ trừu tượng qua văn cảnh cụ thể.",
        "Lập sổ collocation 10 mục; tóm tắt một bài giải thích không dịch từng câu.",
      ),
      stage(
        "Logic và hàm ý",
        "Quan điểm, tiền đề và giới hạn",
        [
          "Từ đánh giá, lập trường và mức độ chắc chắn",
          "Biểu đạt quan hệ nhân quả phức tạp",
          "Từ nối chuyển hướng và tổng kết",
        ],
        [
          "～といえども／～とはいえ／～であれ",
          "～からといって／～としたところで",
          "～までもない／～には及ばない",
        ],
        [
          "Đọc bình luận; phân biệt luận điểm và tiền đề",
          "Xác định hàm ý, lời phản biện và ngoại lệ",
        ],
        [
          "Nghe thái độ không được nói trực tiếp",
          "Theo dõi lý do người nói đổi lập trường",
        ],
        "Giải thích được hàm ý bằng bằng chứng trong bài.",
        "Viết một câu kết luận và hai câu bằng chứng; đối chiếu phương án gây nhiễu.",
      ),
      stage(
        "Sắc thái nâng cao",
        "Văn phong, cảm xúc và dụng ý",
        [
          "Thành ngữ, phó từ và từ tượng thanh phổ biến",
          "Sắc thái trang trọng／khẩu ngữ／văn chương",
          "Từ gần nghĩa phân biệt bằng chủ thể và kết hợp",
        ],
        [
          "～ずにはおかない／～ずにはすまない",
          "～を禁じ得ない／～に堪えない",
          "～ともなく／～なり／～や否や",
        ],
        [
          "Đọc tùy bút và đoạn giàu sắc thái",
          "Tìm cảm xúc và mục đích biểu đạt",
        ],
        [
          "Nghe ngụ ý, mức lịch sự và biểu đạt gián tiếp",
          "Phản hồi nhanh theo mục đích người nói",
        ],
        "Nhận ra sắc thái và chọn biểu đạt phù hợp ngữ cảnh.",
        "Đối chiếu 5 cặp mẫu; ghi câu thật và lý do dùng thay vì chỉ dịch nghĩa.",
      ),
      stage(
        "Tổng hợp đa góc nhìn",
        "So sánh và xây bản đồ lập luận",
        [
          "Chủ đề xã hội, khoa học, văn hóa",
          "Từ chỉ xu hướng và lập luận đối chiếu",
          "Cụm từ điều kiện, phạm vi và quy tắc",
        ],
        [
          "～いかんで／～いかんにかかわらず",
          "～を問わず／～にかかわる／～にかかわらず",
          "～にひきかえ／～にもまして",
        ],
        [
          "Đọc hai quan điểm và tìm điểm giao nhau",
          "Tìm thông tin dưới nhiều ràng buộc",
        ],
        [
          "Nghe nhiều người nêu ý kiến",
          "Ghi bảng lựa chọn, điều kiện và kết luận cuối",
        ],
        "Tổng hợp quan điểm mà không đánh đồng các tác giả.",
        "So sánh 2 bài cùng chủ đề; ghi riêng lập trường và dẫn chứng của từng người.",
      ),
      stage(
        "Sức bền đọc và nghe",
        "Theo dõi nội dung dài ở tốc độ gốc",
        [
          "Ôn từ trong bài dài và tài liệu thực tế",
          "Hệ thống từ dễ nhầm theo cách dùng",
          "Luyện diễn đạt tương đương và sắc thái",
        ],
        [
          "Ngữ pháp trong văn bản dài",
          "Sắp xếp câu có nhiều mệnh đề phụ",
          "Ôn nhóm lỗi lặp lại từ sổ lỗi",
        ],
        [
          "Luyện bài dài: kết cấu, mục đích, quan điểm",
          "Đọc liền mạch rồi quay lại chi tiết cần tìm",
        ],
        [
          "Nghe bài dài, hiểu tổng hợp và điểm thông tin",
          "Shadowing chọn lọc câu chứa lỗi nghe",
        ],
        "Giữ được mạch ý và ổn định độ chính xác ở cuối bài.",
        "Luyện một phiên đọc／nghe dài; so sánh lỗi đầu và cuối phiên.",
      ),
      stage(
        "Sẵn sàng N1",
        "Tối ưu chiến lược làm bài",
        [
          "Ôn chữ và từ theo tần suất lỗi cá nhân",
          "Kiểm tra cách dùng trong ngữ cảnh mới",
          "Nhắc lại sổ lỗi, tránh dồn kiến thức mới",
        ],
        [
          "Ôn sắc thái và điều kiện dùng mẫu",
          "Luyện sắp xếp câu có giới hạn thời gian",
          "Chữa ngữ pháp theo logic văn bản",
        ],
        [
          "Làm đề luyện N1, theo dõi thời gian từng dạng",
          "Chữa phương án nhiễu và lập luận bài đọc",
        ],
        [
          "Làm nghe ở tốc độ gốc, không dừng／phụ đề",
          "Nghe lại và giải thích bằng chứng cho lựa chọn",
        ],
        "Hoàn thành đề luyện với chiến lược dựa trên điểm yếu thực tế.",
        "Làm đề đủ phần và dành phiên riêng chữa lỗi; tiếp tục ôn phần chưa vững.",
      ),
    ],
  },
};

export const ROADMAP_LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];
export const GUEST_ROADMAP_KEY = "nihongo_guest_roadmap_v2";
export function readGuestRoadmap(): StudyRoadmapConfig | undefined {
  try {
    const value = JSON.parse(localStorage.getItem(GUEST_ROADMAP_KEY) || "null");
    if (
      value &&
      ROADMAP_LEVELS.includes(value.targetLevel) &&
      [30, 60, 90].includes(value.durationDays) &&
      Array.isArray(value.completedDays)
    )
      return normalizedRoadmap(value, value.targetLevel, value.startDate);
  } catch {
    /* Guest storage can be unavailable. */
  }
  return undefined;
}
export const stageRange = (index: number, duration: number) => ({
  start: Math.floor((index * duration) / 6) + 1,
  end: Math.floor(((index + 1) * duration) / 6),
});
export function roadmapDay(
  level: JLPTLevel,
  duration: number,
  requestedDay: number,
) {
  const day = Math.min(duration, Math.max(1, requestedDay));
  const index = Math.min(5, Math.ceil((day * 6) / duration) - 1);
  const chapter = JLPT_JOURNEYS[level].stages[index];
  const range = stageRange(index, duration);
  const offset = day - range.start;
  const checkpoint = day === range.end;
  const pick = (items: string[]) => items[offset % items.length];
  const minutes =
    duration === 30
      ? [20, 20, 15, 15, 5]
      : duration === 60
        ? [12, 12, 10, 10, 6]
        : [8, 8, 7, 7, 5];
  const tasks = [
    {
      id: "words",
      label: "Từ vựng & Kanji",
      text: pick(chapter.words),
      action: "Học từ vựng",
      route: `/jlpt/${level}/vocabulary`,
      minutes: minutes[0],
      method:
        "Đọc → nhớ nghĩa → đặt câu. Ôn từ sai trước khi thêm từ mới; mở phần Kanji để kiểm tra cách đọc trong từ ghép.",
    },
    {
      id: "grammar",
      label: "Ngữ pháp",
      text: pick(chapter.grammar),
      action: "Mở ngữ pháp",
      route: `/jlpt/${level}/grammar`,
      minutes: minutes[1],
      method:
        "Đọc cấu trúc và điều kiện dùng; viết 2 câu riêng, rồi luyện chọn mẫu và sắp xếp câu.",
    },
    {
      id: "reading",
      label: "Đọc hiểu",
      text: pick(chapter.reading),
      action: "Luyện đọc",
      route: `/jlpt/${level}/reading`,
      minutes: minutes[2],
      method:
        "Đọc không tra từ ở lượt đầu. Tìm bằng chứng cho đáp án; lượt sau mới tra từ và tóm tắt ý chính.",
    },
    {
      id: "listening",
      label: "Nghe",
      text: pick(chapter.listening),
      action: "Mở Shadowing",
      route: "/shadowing",
      minutes: minutes[3],
      method:
        "Nghe các câu ví dụ ngay trong lớp học, chọn nghĩa phù hợp rồi đối chiếu bản chép khi kiểm tra đáp án. Phát lại và đọc nhại những câu chưa nghe rõ.",
    },
    {
      id: "review",
      label: checkpoint ? "Kiểm tra cuối chặng" : "Ôn & sổ lỗi",
      text: checkpoint
        ? chapter.checkpoint
        : "Ôn lỗi hôm trước, nhắc lại kiến thức sau 1–3–7 ngày.",
      action: checkpoint ? "Mở luyện thi" : "Mở sổ tay",
      route: checkpoint ? `/jlpt/${level}` : "/so-tay",
      minutes: minutes[4],
      method: checkpoint
        ? "Dành thêm thời gian nếu cần. Ghi câu sai, lý do sai và cách sửa; mục tiêu là biết phần cần ôn, không quy đổi % đúng thành điểm JLPT."
        : "Ghi 3 điều đã nhớ và 1 lỗi cần sửa. Với nội dung khó, lặp lại buổi học thay vì tăng lượng kiến thức mới.",
    },
  ];
  return {
    day,
    index,
    chapter,
    checkpoint,
    tasks,
    minutes: minutes.reduce((a, b) => a + b, 0),
  };
}

export function normalizedRoadmap(
  saved: StudyRoadmapConfig | undefined,
  level: JLPTLevel,
  today: string,
): StudyRoadmapConfig {
  if (!saved || saved.targetLevel !== level)
    return {
      targetLevel: level,
      durationDays: 60,
      startDate: today,
      currentDay: 1,
      completedDays: [],
      dailyTasks: {},
      curriculumVersion: 2,
    };
  const durationDays = [30, 60, 90].includes(saved.durationDays)
    ? saved.durationDays
    : 60;
  const completedDays = [...new Set(saved.completedDays || [])].filter(
    (d) => Number.isInteger(d) && d >= 1 && d <= durationDays,
  );
  const currentDay =
    Array.from({ length: durationDays }, (_, i) => i + 1).find(
      (d) => !completedDays.includes(d),
    ) || durationDays;
  const dailyTasks: Record<string, string[]> = {};
  for (const [day, tasks] of Object.entries(saved.dailyTasks || {})) {
    if (+day > 0 && +day <= durationDays && Array.isArray(tasks))
      dailyTasks[day] = tasks.filter((t) =>
        ["words", "grammar", "reading", "listening", "review"].includes(t),
      );
  }
  return { ...saved, durationDays, completedDays, currentDay, dailyTasks };
}
export function completeRoadmapDay(
  plan: StudyRoadmapConfig,
  day: number,
): StudyRoadmapConfig {
  const completedDays = [...new Set([...plan.completedDays, day])].sort(
    (a, b) => a - b,
  );
  const currentDay =
    Array.from({ length: plan.durationDays }, (_, i) => i + 1).find(
      (d) => !completedDays.includes(d),
    ) || plan.durationDays;
  return { ...plan, completedDays, currentDay, curriculumVersion: 2 };
}
