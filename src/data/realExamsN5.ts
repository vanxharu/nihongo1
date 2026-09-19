import { DailyExam } from '../types';

export const REAL_EXAMS_N5: DailyExam[] = [
  {
    id: 'jlpt_n5_official_past_2024_07',
    title: 'Đề thi chính thức JLPT N5 - Tháng 07/2024',
    level: 'N5',
    year: '2024',
    session: 'Tháng 07/2024',
    category: 'official_past',
    durationMinutes: 105,
    questions: [
      // --- 問題1: ___の言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n5_2407_m1_1',
        question: 'あそこに【白い】車が止まっています。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['しろい', 'くろい', 'あかい', 'あおい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '白い đọc là しろい (shiroi), có nghĩa là màu trắng.'
      },
      {
        id: 'n5_2407_m1_2',
        question: '毎朝、7時に【起きます】。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['ねます', 'おきます', 'いきます', 'きます'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: '起きます đọc là おきます (okimasu), có nghĩa là thức dậy.'
      },
      {
        id: 'n5_2407_m1_3',
        question: '駅の【前】で友達と会いました。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['まえ', 'うしろ', 'なか', 'そと'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '前 đọc là まえ (mae), có nghĩa là phía trước.'
      },
      {
        id: 'n5_2407_m1_4',
        question: '昨日のテストはとても【難しかった】です。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['やさしかった', 'むずかしかった', 'たのしかった', 'おもしろかった'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: '難しかった đọc là むずかしかった (muzukashikatta), có nghĩa là khó.'
      },
      {
        id: 'n5_2407_m1_5',
        question: '公園で【子ども】たちが遊んでいます。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['おとな', 'こども', 'おんな', 'おとこ'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: '子ども đọc là こども (kodomo), có nghĩa là trẻ em.'
      },
      {
        id: 'n5_2407_m1_6',
        question: 'この川で【魚】を釣ることができます。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['さかな', 'とり', 'いぬ', 'ねこ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '魚 đọc là さかな (sakana), có nghĩa là con cá.'
      },
      {
        id: 'n5_2407_m1_7',
        question: '来週、【友だち】と海へ行きます。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['かぞく', 'きょうだい', 'ともだち', 'りょうしん'],
        correctIndex: 2,
        section: 'moji-goi',
        explanation: '友だち đọc là ともだち (tomodachi), có nghĩa là bạn bè.'
      },

      // --- 問題2: ___の言葉を漢字で書くとき、最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n5_2407_m2_1',
        question: 'あしたは 【あめ】が ふるでしょう。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['雨', '雪', '雲', '風'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'あめ viết Kanji là 雨 (Vũ - mưa).'
      },
      {
        id: 'n5_2407_m2_2',
        question: 'つくえの うえに ほんが 【ごさつ】 あります。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['五冊', '五本', '五枚', '五台'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'ごさつ (5 cuốn sách) viết Kanji là 五冊.'
      },
      {
        id: 'n5_2407_m2_3',
        question: 'へやの でんきを 【けして】 ください。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['点して', '消して', '落して', '切して'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: 'けして viết Kanji là 消して (tắt đèn).'
      },
      {
        id: 'n5_2407_m2_4',
        question: '父は 【まいあさ】 しんぶんを よみます。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['毎朝', '毎夕', '毎週', '毎日'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'まいあさ viết Kanji là 毎朝 (Mỗi triêu - mỗi sáng).'
      },
      {
        id: 'n5_2407_m2_5',
        question: 'わたしの 【いえ】は えきから ちかいです。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['店', '家', '部屋', '門'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: 'いえ viết Kanji là 家 (Gia - ngôi nhà).'
      },

      // --- 問題3: （　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n5_2407_m3_1',
        question: 'のどが かわいたので、（　　）を 飲みたいです。',
        hint: 'Điền từ phù hợp vào chỗ trống （）',
        options: ['ジュース', 'ごはん', 'パン', 'くだもの'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'Khát nước nên muốn uống ジュース (nước hoa quả/nước ngọt).'
      },
      {
        id: 'n5_2407_m3_2',
        question: 'スーパーで たくさん 買い物を したので、にもつが （　　）です。',
        hint: 'Điền tính từ phù hợp vào chỗ trống （）',
        options: ['おもい', 'かるい', 'やすい', 'あかるい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'Mua nhiều đồ nên hành lý 重い (おもい - nặng).'
      },
      {
        id: 'n5_2407_m3_3',
        question: '部屋が 暗いですね。（　　）を つけましょう。',
        hint: 'Điền từ phù hợp vào chỗ trống （）',
        options: ['テレビ', '電気', 'ラジオ', 'ドア'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: 'Phòng tối nên bật 電気 (でんき - điện/đèn).'
      },
      {
        id: 'n5_2407_m3_4',
        question: 'この ズボンは ちょっと （　　）ですね。もっと 大きいのは ありますか。',
        hint: 'Điền tính từ phù hợp vào chỗ trống （）',
        options: ['ながい', 'ひろい', 'きつい', 'たかい'],
        correctIndex: 2,
        section: 'moji-goi',
        explanation: 'きつい có nghĩa là chật (hỏi quần lớn hơn).'
      },
      {
        id: 'n5_2407_m3_5',
        question: '毎朝 7時に 家を （　　）。',
        hint: 'Điền động từ phù hợp vào chỗ trống （）',
        options: ['出ます', '入ります', '着きます', '帰ります'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '家を出る (rời khỏi nhà vào lúc 7h sáng).'
      },

      // --- 問題4: ___の言葉に意味が最も近いものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n5_2407_m4_1',
        question: 'この へやは 【ひろい】です。',
        hint: 'Chọn câu có ý nghĩa gần nhất',
        options: [
          'この へやは おおきいです。',
          'この へやは ちいさいです。',
          'この へやは あかるいです。',
          'この へやは くらいです。'
        ],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '広い (rộng rãi) tương đồng với 大きい (lớn).'
      },
      {
        id: 'n5_2407_m4_2',
        question: '山田さんは 【えいごが じょうずです】。',
        hint: 'Chọn câu có ý nghĩa gần nhất',
        options: [
          '山田さんは えいごが へたです。',
          '山田さんは えいごが とても よく できます。',
          '山田さんは えいごを べんきょうして いません。',
          '山田さんは えいごが きらいです。'
        ],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: '英語が上手 = 英語がとてもよくできます (tiếng Anh rất giỏi).'
      },
      {
        id: 'n5_2407_m4_3',
        question: 'きのうは 【やすみでした】。',
        hint: 'Chọn câu có ý nghĩa gần nhất',
        options: [
          'きのうは 学校へ 行きませんでした。',
          'きのうは 学校へ 行きました。',
          'きのうは 勉強を たくさん しました。',
          'きのうは 仕事が 忙しかったです。'
        ],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '休みでした = 学校へ行きませんでした (được nghỉ, không đến trường).'
      },

      // --- 文法 問題1: （　　）に入る最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n5_2407_g1_1',
        question: 'わたしは 毎朝、パン（　　）牛乳を 食べます。',
        hint: 'Chọn trợ từ thích hợp vào chỗ trống （）',
        options: ['と', 'に', 'で', 'を'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'Liệt kê danh từ: パンと牛乳 (bánh mì VÀ sữa).'
      },
      {
        id: 'n5_2407_g1_2',
        question: '田中さんは どこ（　　）いませんでした。',
        hint: 'Chọn trợ từ thích hợp vào chỗ trống （）',
        options: ['にも', 'でも', 'へも', 'をも'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'どこにも + Phủ định: không có ở bất cứ đâu (chỉ sự tồn tại: にも).'
      },
      {
        id: 'n5_2407_g1_3',
        question: 'きのうは 雨が 降っていた（　　）、どこへも 行きませんでした。',
        hint: 'Chọn liên từ nguyên nhân thích hợp',
        options: ['から', 'ので', 'けれど', 'でも'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'Thể thường/lịch sự + から: Vì trời mưa nên...'
      },
      {
        id: 'n5_2407_g1_4',
        question: 'すみません、その 辞書を （　　）ください。',
        hint: 'Chọn dạng động từ chia thích hợp',
        options: ['見せて', '見せる', '見せた', '見せない'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-てください: Xin hãy cho tôi xem cuốn từ điển đó.'
      },
      {
        id: 'n5_2407_g1_5',
        question: '駅まで 歩いて 15分（　　）かかります。',
        hint: 'Chọn trợ từ chỉ ước lượng thích hợp',
        options: ['ぐらい', 'ごろ', 'だけ', 'しか'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'Chỉ khoảng lượng thời gian dùng ぐらい / くらい (khoảng 15 phút).'
      },
      {
        id: 'n5_2407_g1_6',
        question: 'あした 一緒に 映画を （　　）か。',
        hint: 'Chọn mẫu câu rủ rê thích hợp',
        options: ['見ませんか', '見ます', '見ました', '見ない'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-ませんか dùng để rủ rê cùng làm gì đó.'
      },

      // --- 文法 問題2: 次の文の ★ に入る最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n5_2407_g2_1',
        question: 'わたしは 昨日 デパートで ★ ____ ____ ____ 買いました。\n(1) くつを  (2) あかい  (3) きれいな',
        hint: 'Sắp xếp: わたしは 昨日 デパートで (3)きれいな★ (2)あかい (1)くつを 買いました。',
        options: ['(3) きれいな', '(2) あかい', '(1) くつを', 'なし'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'Thứ tự đúng: きれいな(3)★ あかい(2) くつを(1). Vị trí ngôi sao là (3).'
      },
      {
        id: 'n5_2407_g2_2',
        question: '図書館では ____ ____ ★ ____ いけません。\n(1) 声で  (2) 大声な  (3) 話しては  (4) 大きな',
        hint: 'Sắp xếp: 図書館では (4)大きな (1)声で (3)話しては★ いけません。',
        options: ['(4) 大きな', '(1) 声で', '(3) 話しては', '(2) 大声な'],
        correctIndex: 2,
        section: 'bunpou',
        explanation: 'Thứ tự đúng: 大きな(4) 声で(1) 話しては(3)★ いけません. Vị trí ngôi sao là (3).'
      },

      // --- 読解 (Dokkai) ---
      {
        id: 'n5_2407_d1',
        question: '【短文】次の文章を読んで、質問に答えなさい。\n\n「山田さんの家は駅から歩いて10分です。近くに大きいスーパーや公園があります。部屋はあまり広くありませんが、静かでとてもきれいです。家賃も高くないので、山田さんはこの部屋がとても気に入っています。」\n\n質問：山田さんの部屋について、正しいものはどれですか。',
        hint: 'Đọc kỹ các đặc điểm về căn phòng của anh Yamada',
        options: [
          '駅から遠くて、家賃が高いです。',
          '部屋は広くないですが、静かできれいです。',
          '近くにスーパーも公園もありません。',
          '部屋はとても広くて、にぎやかです。'
        ],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Đoạn văn viết rõ: "部屋はあまり広くありませんが、静かでとてもきれいです" -> Phòng không rộng lắm nhưng yên tĩnh và sạch đẹp.'
      },
      {
        id: 'n5_2407_d2',
        question: '【情報検索】次の案内を読んで、質問に答えなさい。\n\n「【図書館の利用案内】\n・開館時間：午前9時00分〜午後7時00分\n・休館日：毎週月曜日（月曜日が祝日の場合は開館、火曜日が休み）\n・本を借りられる冊数：1人5冊まで（2週間）\n※休館日は本を返却ポストに返してください。」\n\n質問：月曜日が祝日のとき、図書館は何曜日が休みになりますか。',
        hint: 'Xem phần ghi chú trong ngoặc về ngày nghỉ khi thứ hai là ngày lễ',
        options: ['月曜日', '火曜日', '水曜日', '日曜日'],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Trong thông báo ghi rõ: "月曜日が祝日の場合は開館、火曜日が休み" -> Khi thứ Hai là ngày lễ thì thư viện sẽ nghỉ vào thứ Ba (火曜日).'
      },

      // --- 聴解 (Choukai) ---
      {
        id: 'n5_2407_c1',
        question: '【問題1 - 課題理解】男の人と女の人が話しています。男の人はこれから何をしますか。',
        hint: 'Nghe kịch bản và xác định hành động của người nam sau đây',
        options: ['窓を閉める', 'エアコンをつける', 'お茶を入れる', 'テレビを消す'],
        correctIndex: 1,
        section: 'choukai',
        audioScript: '女：あ、部屋の中がちょっと暑いですね。\n男：そうですね。窓を開けましょうか。\n女：外は工事の音がうるさいですから、エアコンをつけてもらえますか。\n男：分かりました。リモコンはどこですか。\n女：机の上にありますよ。\n男：はい、つけますね。',
        explanation: 'Nữ bảo "エアコンをつけてもらえますか" và nam đáp "はい、つけますね" -> Người nam sẽ bật điều hòa (エアコンをつける).'
      },
      {
        id: 'n5_2407_c2',
        question: '【問題2 - ポイント理解】学生と先生が話しています。明日のテストは何時から始まりますか。',
        hint: 'Nghe xác định thời gian bắt đầu bài kiểm tra',
        options: ['9:00', '9:30', '10:00', '10:30'],
        correctIndex: 1,
        section: 'choukai',
        audioScript: '学生：先生、明日の日本語のテストは何時からですか。\n先生：いつもは9時からですが、明日は教室の準備がありますので、9時半から始まります。遅れないように来てください。\n学生：はい、9時半ですね。分かりました。',
        explanation: 'Thầy giáo dặn: "明日は教室の準備がありますので、9時半から始まります" -> Bắt đầu lúc 9:30.'
      }
    ]
  },

  {
    id: 'jlpt_n5_official_past_2023_12',
    title: 'Đề thi chính thức JLPT N5 - Tháng 12/2023',
    level: 'N5',
    year: '2023',
    session: 'Tháng 12/2023',
    category: 'official_past',
    durationMinutes: 105,
    questions: [
      {
        id: 'n5_2312_m1_1',
        question: '私の【教室】は３階にあります。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['きょうしつ', 'しょくどう', 'じむしょ', 'へや'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '教室 đọc là きょうしつ (kyoushitsu), có nghĩa là phòng học.'
      },
      {
        id: 'n5_2312_m1_2',
        question: 'この【時計】は田中さんにもらいました。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['じかん', 'とけい', 'でんわ', 'てちょう'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: '時計 đọc là とけい (tokei), có nghĩa là đồng hồ.'
      },
      {
        id: 'n5_2312_m1_3',
        question: '【外国】の文化について勉強しています。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['がいこく', 'こくさい', 'りょこう', 'ちず'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '外国 đọc là がいこく (gaikoku), có nghĩa là nước ngoài.'
      },
      {
        id: 'n5_2312_m2_1',
        question: 'まいばん おんがくを 【ききます】。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['聞きます', '見ます', '読みます', '書きます'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'ききます Kanji là 聞きます (Văn - nghe).'
      },
      {
        id: 'n5_2312_g1_1',
        question: '木村さんは 英語（　　）上手です。',
        hint: 'Chọn trợ từ thích hợp vào chỗ trống （）',
        options: ['を', 'が', 'は', 'で'],
        correctIndex: 1,
        section: 'bunpou',
        explanation: 'Mẫu câu chỉ khả năng/sở trường: [Đối tượng/Năng lực] + が 上手です.'
      },
      {
        id: 'n5_2312_g1_2',
        question: '日曜日は 掃除を（　　）洗濯を したり しました。',
        hint: 'Chọn dạng kết hợp đúng',
        options: ['したり', 'して', 'すると', 'したら'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'Liệt kê hành động tiêu biểu: 〜たり 〜たり します.'
      },
      {
        id: 'n5_2312_d1',
        question: '【短文】「ワンさんは毎朝7時に起きます。シャワーを浴びてから、パンと卵を食べて、コーヒーを飲みます。それから8時に家を出て、電車で会社へ行きます。」\n\n質問：ワンさんは朝ご飯の前に何をしますか。',
        hint: 'Tìm hành động xảy ra trước khi ăn sáng',
        options: ['会社へ行きます', 'シャワーを浴びます', '電車に乗ります', 'コーヒーを飲みます'],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Bài viết ghi: "シャワーを浴びてから、パンと卵を食べて..." -> Tắm vòi sen trước khi ăn sáng.'
      },
      {
        id: 'n5_2312_c1',
        question: '【問題1】男の人と女の人が話しています。二人は明日、何時に会いますか。',
        hint: 'Xác định giờ hẹn gặp',
        options: ['8:30', '9:00', '9:30', '10:00'],
        correctIndex: 1,
        section: 'choukai',
        audioScript: '男：明日、駅前で何時に待ち合わせしましょうか。\n女：映画は10時からですから、9時はいかがですか。\n男：そうですね。じゃあ9時に駅の改札前で。',
        explanation: 'Họ hẹn gặp nhau lúc 9:00 (9時に駅の改札前で).'
      }
    ]
  }
];
