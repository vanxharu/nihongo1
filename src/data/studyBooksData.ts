import { StudyBook } from '../types';
import { SHIN_NIHONGO_500_N4_N5 } from './shinNihongo500Data';

export const STUDY_BOOKS_DATA: StudyBook[] = [
  // =========================================================================
  // NIHONGO CHALLENGE N4 - BUNPOU TO YOMU RENSHUU (文法と読む練習)
  // =========================================================================
  {
    id: 'book_challenge_bunpou_yomu_n4',
    title: 'Nihongo Challenge N4 - Bunpou to Yomu Renshuu (文法と読む練習)',
    japaneseTitle: '「日本語能力試験」対策 にほんごチャレンジ N4［文法と読む練習］',
    author: '山辺真理子・飯塚睦・金成フミ恵 (Mariko Yamabe, Mutsumi Iizuka, Fumie Kanari)',
    publisher: 'アスク出版 (ASK Publishing)',
    level: 'N4',
    coverBadge: '32 Bài Ngữ Pháp + 15 Bài Đọc Hiểu + 8 Bài Ôn Tập',
    description: 'Sách ôn thi JLPT N4 chuyên sâu về Ngữ pháp và Đọc hiểu thuộc bộ Nihongo Challenge nổi tiếng. Luyện tập qua các câu chuyện sinh động của Carlos, Maria, Noi, Peter cùng đáp án, giải thích chính xác câu từ trong giáo trình.',
    themeColor: 'purple',
    gradient: 'from-purple-700 via-pink-600 to-rose-600',
    category: 'Grammar',
    estimatedHours: 14,
    learnersCount: '1,420',
    totalQuestions: 120,
    units: [
      {
        id: 'bunpou_yomu_u1',
        unitNumber: 1,
        title: '第1話 日本のお正月 (New Year\'s in Japan)',
        japaneseTitle: '1月-1 第1話 日本のお正月',
        pageRange: 'Trang 26 - 29',
        topic: 'Ngữ pháp: 〜ます／〜ません、〜ました／〜ませんでした、〜から〜まで、【場所】で',
        description: 'Mẫu câu thời thì cơ bản, phạm vi thời gian địa điểm và bài tập khoanh trắc nghiệm trang 28.',
        questions: [
          {
            id: 'by_u1_q1',
            number: 1,
            sectionTitle: '練習問題: に 何を入れますか。1・2・3・4から いちばん いい ものを 一つえらんでください。',
            question: 'カラオケ*に （　　） ます。',
            options: ['行く', '行か', '行き', '行こ'],
            correctIndex: 2,
            hint: 'Thể V-masu (bỏ ます) + ます',
            explanation: '【Đáp án 3: 行き】(Sách trang 26/28): 行く -> 行きます (Đi karaoke).'
          },
          {
            id: 'by_u1_q2',
            number: 2,
            sectionTitle: '練習問題',
            question: '牛乳*を （　　） ます。パンも 食べます。',
            options: ['飲み', '飲む', '飲も', '飲め'],
            correctIndex: 0,
            hint: 'Thể V-masu (bỏ ます) + ます',
            explanation: '【Đáp án 1: 飲み】(Sách trang 26/28): 飲む -> 飲みます (Uống sữa. Tôi cũng ăn cả bánh mì nữa).'
          },
          {
            id: 'by_u1_q3',
            number: 3,
            sectionTitle: '練習問題',
            question: '明日 友だちは 行きますが、私は （　　）。',
            options: ['行きます', '行きません', '行きました', '行きますか'],
            correctIndex: 1,
            hint: 'Trợ từ が chỉ sự đối lập (Ngày mai bạn tôi đi nhưng tôi thì...)',
            explanation: '【Đáp án 2: 行きません】(Sách trang 26/28): 明日友だちは行きますが、私は行きません (Ngày mai bạn tôi đi nhưng tôi thì không đi).'
          },
          {
            id: 'by_u1_q4',
            number: 4,
            sectionTitle: '練習問題',
            question: '昨日の 夜、あまり*ねません （　　）。',
            options: ['した', 'ます', 'でした', 'ました'],
            correctIndex: 2,
            hint: 'Thể quá khứ phủ định: 〜ませんでした',
            explanation: '【Đáp án 3: でした】(Sách trang 26/28): ねません ＋ でした -> ねませんでした (Tối qua tôi không ngủ được mấy).'
          },
          {
            id: 'by_u1_q5',
            number: 5,
            sectionTitle: '練習問題',
            question: '日本料理は あまり （　　）。',
            options: ['作ります', '作りました', '作りません', '作りませんでした'],
            correctIndex: 2,
            hint: 'あまり ＋ Phủ định hiện tại/thói quen',
            explanation: '【Đáp án 3: 作りません】(Sách trang 26/28): あまり ＋ 作りません (Món ăn Nhật thì tôi không mấy khi làm).'
          },
          {
            id: 'by_u1_q6',
            number: 6,
            sectionTitle: '練習問題',
            question: '「仕事は いつ 休みですか。」「来週の 月曜日 （　　） です。」',
            options: ['に／に', 'か／か', 'まで／まで', 'へ／へ'],
            correctIndex: 2,
            hint: 'Chỉ thời hạn cho đến khi nào',
            explanation: '【Đáp án 3: まで】(Sách trang 26/28): 来週の月曜日までです (Nghỉ cho đến thứ Hai tuần sau).'
          },
          {
            id: 'by_u1_q7',
            number: 7,
            sectionTitle: '練習問題',
            question: '新宿* （　　） 横浜* （　　） 電車に 乗ります。',
            options: ['から／まで', 'と／へ', 'と／まで', 'から／へ'],
            correctIndex: 0,
            hint: 'Từ điểm A đến điểm B: 〜から〜まで',
            explanation: '【Đáp án 1: から／まで】(Sách trang 26/28): 新宿から横浜まで (Đi tàu điện từ Shinjuku đến Yokohama).'
          },
          {
            id: 'by_u1_q8',
            number: 8,
            sectionTitle: '練習問題',
            question: 'つぎの 映画は 何時 （　　） ですか。',
            options: ['は', 'も', 'を', 'から'],
            correctIndex: 3,
            hint: 'Bắt đầu từ mấy giờ?',
            explanation: '【Đáp án 4: から】(Sách trang 26/28): 何時からですか (Bộ phim tiếp theo là từ mấy giờ?).'
          },
          {
            id: 'by_u1_q9',
            number: 9,
            sectionTitle: '練習問題',
            question: 'この おかし*は （　　） 買いましたか。',
            options: ['どこに', 'どこで', 'どこも', 'どこか'],
            correctIndex: 1,
            hint: 'Trợ từ chỉ địa điểm diễn ra hành động mua (買う)',
            explanation: '【Đáp án 2: どこで】(Sách trang 26/28): どこで買いましたか (Bạn đã mua bánh kẹo này ở đâu vậy?).'
          },
          {
            id: 'by_u1_q10',
            number: 10,
            sectionTitle: '練習問題',
            question: 'きっさ店* （1　） 話しました。',
            options: ['に', 'が', 'は', 'で'],
            correctIndex: 3,
            hint: 'Trợ từ chỉ nơi diễn ra hành động nói chuyện (話す)',
            explanation: '【Đáp án 4: で】(Sách trang 26/28): きっさ店で話しました (Tôi đã nói chuyện ở quán giải khát).'
          }
        ]
      },
      {
        id: 'bunpou_yomu_u2',
        unitNumber: 2,
        title: '第2話 雪が降りました (It snowed)',
        japaneseTitle: '1月-2 第2話 雪が降りました',
        pageRange: 'Trang 30 - 33',
        topic: 'Ngữ pháp: 〜ながら、...／〜たい・〜たくない／〜ことがある',
        description: 'Mẫu câu làm đồng thời hai việc (V vừa... vừa...), mong muốn (thích/không thích) và thỉnh thoảng có trải nghiệm/hành động.',
        questions: [
          {
            id: 'by_u2_q1',
            number: 1,
            sectionTitle: '練習問題: に 何を入れますか。1・2・3・4から いちばん いい ものを 一つえらんでください。',
            question: '駅まで （　　） ながら 話しましょう。',
            options: ['歩く', '歩き', '歩か', '歩け'],
            correctIndex: 1,
            hint: 'V-masu (bỏ ます) + ながら',
            explanation: '【Đáp án 2: 歩き】(Sách trang 30/32): 歩きながら話しましょう (Vừa đi bộ ra ga vừa nói chuyện nhé).'
          },
          {
            id: 'by_u2_q2',
            number: 2,
            sectionTitle: '練習問題',
            question: 'アイスクリーム*を （　　） ながら 公園を 散歩*しませんか。',
            options: ['食べる', '食べり', '食べ', '食べれ'],
            correctIndex: 2,
            hint: 'V-masu (bỏ ます) + ながら',
            explanation: '【Đáp án 3: 食べ】(Sách trang 30/32): 食べながら (Vừa ăn kem vừa đi dạo ở công viên nhé?).'
          },
          {
            id: 'by_u2_q3',
            number: 3,
            sectionTitle: '練習問題',
            question: '洗たく （　　） ながら そうじも します。',
            options: ['する', 'します', 'して', 'し'],
            correctIndex: 3,
            hint: 'する -> し ＋ ながら',
            explanation: '【Đáp án 4: し】(Sách trang 30/32): 洗たくしながら (Vừa giặt giũ vừa dọn dẹp nhà cửa).'
          },
          {
            id: 'by_u2_q4',
            number: 4,
            sectionTitle: '練習問題',
            question: 'だれにも* （　　） たくないです。',
            options: ['会う', '会え', '会い', '会お'],
            correctIndex: 2,
            hint: 'V-masu (bỏ ます) + たくない',
            explanation: '【Đáp án 3: 会い】(Sách trang 30/32): 会いたくないです (Tôi không muốn gặp bất kỳ ai cả).'
          },
          {
            id: 'by_u2_q5',
            number: 5,
            sectionTitle: '練習問題',
            question: '今日は 映画が （　　） たいです。買い物にも （　　） たいです。',
            options: ['見／行き', '見る／行き', '見／行く', '見る／行く'],
            correctIndex: 0,
            hint: 'Cả 2 động từ đều chia thể V-masu (bỏ ます) + たい',
            explanation: '【Đáp án 1: 見／行き】(Sách trang 30/32): 見たいです。行きたいです (Hôm nay tôi muốn xem phim. Tôi cũng muốn đi mua sắm nữa).'
          },
          {
            id: 'by_u2_q8',
            number: 8,
            sectionTitle: '練習問題',
            question: 'ときどき この きかい*を （　　） ことがあります。',
            options: ['使え', '使う', '使い', '使って'],
            correctIndex: 1,
            hint: 'V-ru (thể nguyên dạng) + ことがあります (Thỉnh thoảng làm việc gì đó)',
            explanation: '【Đáp án 2: 使う】(Sách trang 30/32): 使うことがあります (Thỉnh thoảng tôi có sử dụng chiếc máy này).'
          },
          {
            id: 'by_u2_q9',
            number: 9,
            sectionTitle: '練習問題',
            question: '家族と いっしょに レストランで （　　） ことがあります。',
            options: ['食事します', '食事して', '食事する', '食事し'],
            correctIndex: 2,
            hint: 'V-ru (thể nguyên dạng) + ことがあります',
            explanation: '【Đáp án 3: 食事する】(Sách trang 30/32): 食事することがあります (Thỉnh thoảng tôi có đi ăn nhà hàng cùng gia đình).'
          }
        ]
      },
      {
        id: 'bunpou_yomu_u3',
        unitNumber: 3,
        title: 'ふくしゅう問題 1 (第1話〜第4話)',
        japaneseTitle: '第1話〜第4話 ふくしゅう問題 1',
        pageRange: 'Trang 42 - 43',
        topic: 'Bài ôn tập tổng hợp 1: Ngữ pháp, trợ từ & Dấu sao ★',
        description: 'Kiểm tra tổng hợp kiến thức từ Bài 1 đến Bài 4 với các dạng bài tập khoanh trợ từ, thể động từ và sắp xếp từ dấu sao ★.',
        questions: [
          {
            id: 'by_u3_q1',
            number: 1,
            sectionTitle: '問題 I: に 何を入れますか。1・2・3・4から いちばん いい ものを 一つえらんでください。',
            question: '東京駅 （　　） 会いましょう。',
            options: ['に', 'で', 'を', 'へ'],
            correctIndex: 1,
            hint: 'Địa điểm diễn ra hành động gặp mặt (会う)',
            explanation: '【Đáp án 2: で】(Sách trang 42): 東京駅で会いましょう (Hãy gặp nhau ở ga Tokyo).'
          },
          {
            id: 'by_u3_q2',
            number: 2,
            sectionTitle: '問題 I',
            question: '駅から 学校 （　　） 走りました。',
            options: ['で', 'から', 'まで', 'と'],
            correctIndex: 2,
            hint: '駅から〜 (Từ ga đến đâu?)',
            explanation: '【Đáp án 3: まで】(Sách trang 42): 駅から学校まで走りました (Tôi đã chạy từ ga đến trường).'
          },
          {
            id: 'by_u3_q3',
            number: 3,
            sectionTitle: '問題 I',
            question: '友だちが 本 （　{を}　） くれました。',
            options: ['で', 'に', 'も', 'を'],
            correctIndex: 3,
            hint: 'Trợ từ chỉ tân ngữ cho/tặng (くれる)',
            explanation: '【Đáp án 4: を】(Sách trang 42): 本をくれました (Bạn đã tặng sách cho tôi).'
          },
          {
            id: 'by_u3_q4',
            number: 4,
            sectionTitle: '問題 I',
            question: '休みの 日は うちに いますが、たまに* （　　） ことがあります。',
            options: ['出かける', '出かけない', '出かけて', '出かけます'],
            correctIndex: 0,
            hint: 'V-ru + ことがあります (Thỉnh thoảng có làm việc gì đó)',
            explanation: '【Đáp án 1: 出かける】(Sách trang 42): 出かけることがあります (Ngày nghỉ tôi thường ở nhà, nhưng thỉnh thoảng cũng có đi ra ngoài).'
          },
          {
            id: 'by_u3_q5',
            number: 5,
            sectionTitle: '問題 I',
            question: '今夜は 寒いから、温かい スープが （　　） たいです。',
            options: ['飲みます', '飲んで', '飲み', '飲む'],
            correctIndex: 2,
            hint: 'V-masu (bỏ ます) + たいです',
            explanation: '【Đáp án 3: 飲み】(Sách trang 42): 飲みたいです (Đêm nay lạnh nên tôi muốn uống súp nóng).'
          },
          {
            id: 'by_u3_q6',
            number: 6,
            sectionTitle: '問題 I',
            question: 'アニメ*が （　　） だから、よく 見ます。',
            options: ['好きな', 'スキの', '好きだ', '好き'],
            correctIndex: 3,
            hint: 'Tính từ đuôi な + だから -> 好き ＋ だから',
            explanation: '【Đáp án 4: 好き】(Sách trang 42): 好きだから (Vì thích phim hoạt hình nên tôi rất hay xem).'
          },
          {
            id: 'by_u3_q7',
            number: 7,
            sectionTitle: '問題 I',
            question: 'ここに 名前と 住所を （　　） から、出して ください。',
            options: ['書き', '書いて', '書きた', '書きて'],
            correctIndex: 1,
            hint: 'V-te + から (Sau khi làm xong việc gì thì...)',
            explanation: '【Đáp án 2: 書いて】(Sách trang 42): 書いてから (Sau khi viết tên và địa chỉ vào đây thì hãy nộp nhé).'
          },
          {
            id: 'by_u3_q11',
            number: 11,
            sectionTitle: '問題 II: ★ に 入る ものは どれですか。1・2・3・4から いちばん いい ものを 一つえらんで ください。',
            question: 'ピーターさんの ____ ____ ★ ____ ですか。\n(1) 図書館  (2) 10分くらい  (3) まで  (4) うちから',
            options: ['(1) 図書館', '(2) 10分くらい', '(3) まで', '(4) うちから'],
            correctIndex: 2,
            hint: 'Sắp xếp: ピーターさんの (うちから) (図書館) (まで★) (10分くらい) ですか',
            explanation: '【Đáp án 3: まで】(Sách trang 43): Thứ tự đúng là: (4 うちから) (1 図書館) (3 まで★) (2 10分くらい). Ngôi sao ★ ở vị trí phương án 3 (まで).'
          },
          {
            id: 'by_u3_q12',
            number: 12,
            sectionTitle: '問題 II: Dấu sao ★',
            question: 'カルロスは、山田さん ____ ____ ★ ____ もらいました。\n(1) に  (2) を  (3) 日本語の  (4) 辞書',
            options: ['(1) に', '(2) を', '(3) 日本語の', '(4) 辞書'],
            correctIndex: 3,
            hint: 'Sắp xếp: 山田さん (に) (日本語の) (辞書★) (を) もらいました',
            explanation: '【Đáp án 4: 辞書】(Sách trang 43): Thứ tự đúng: (1 に) (3 日本語の) (4 辞書★) (2 を). Ngôi sao ★ rơi vào (4 辞書).'
          }
        ]
      },
      {
        id: 'bunpou_yomu_u4',
        unitNumber: 4,
        title: 'PART 2 読解: バレンタインデー & フィリピンのお正月',
        japaneseTitle: 'PART 2 読解 第1回・第2回',
        pageRange: 'Trang 204 - 205',
        topic: 'Đọc hiểu bài văn ngắn về văn hóa, lễ tết và phong tục các nước',
        description: 'Luyện tập đọc hiểu N4 theo định dạng đề thi chuẩn JLPT: Đọc đoạn văn và trả lời câu hỏi trắc nghiệm.',
        questions: [
          {
            id: 'by_u4_q1',
            number: 1,
            sectionTitle: '第1回 バレンタインデー (Valentine\'s day)',
            contextText: '2月14日は、日本ではバレンタインデーです。キリスト教の特別な日ですが、日本では、女の人が好きな人にチョコレートなどのプレゼントをする日になりました。世界にも同じような日があります。ブラジルでは、6月12日が「恋人の日」と呼ばれる日です。その日は、男の人も女の人もプレゼントを用意して、恋人におくります。\nブラジルでは、日本のようにチョコレートではなく、写真立てに写真を入れて、プレゼントするそうです。',
            question: 'ブラジルでは、だれがだれに何をにおくりますか。',
            options: [
              '女の人が好きな男の人にチョコレートをおくります。',
              '男の人が好きな女の人にチョコレートをおくります。',
              '恋人が恋人に写真立てをおくります。',
              '恋人がみんなに写真立てをおくります。'
            ],
            correctIndex: 2,
            hint: 'Đọc đoạn 2: ブラジルでは... 男の人も女の人も... 恋人に... 写真立てに写真を入れてプレゼントする',
            explanation: '【Đáp án 3】(Sách trang 204/313): Bài viết nêu rõ: Ở Brazil cả nam lẫn nữ đều chuẩn bị quà lồng ảnh vào khung hình (写真立て) để tặng cho người yêu (恋人).'
          },
          {
            id: 'by_u4_q2',
            number: 2,
            sectionTitle: '第2回 フィリピンのお正月 (New Year\'s in the Philippines)',
            contextText: 'フィリピンのお正月はとてもにぎやかです。12月31日は、家族みんなが集まって、12時になるのを待ちます。12時になったら、いろいろなところで花火をします。たくさんの人が、大声で歌います。太鼓など楽器をならして、さわぎます。\nパーティーが大好きなフィリピンの人たちは、12月のクリスマスから1月のお正月まで、毎日さわぎます。一年のはじめにパーティーをたくさんして、これから、一年がんばろうという気持ちになります。',
            question: 'フィリピンでは12月31日の12時になったら、何をしますか。',
            options: [
              'みんなが集まります。',
              '太鼓の音を待ちます。',
              '花火をしたり歌ったりします。',
              'パーティーをします。'
            ],
            correctIndex: 2,
            hint: 'Đọc câu: 12時になったら、いろいろなところで花火をします。たくさんの人が、大声で歌います。',
            explanation: '【Đáp án 3】(Sách trang 205/313): Khi 12 giờ đêm đến, ở Philippines mọi người bắn pháo hoa ở nhiều nơi và cất tiếng hát to (花火をしたり歌ったりします).'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // NIHONGO CHALLENGE N4 - KOTOBA (ことば)
  // =========================================================================
  {
    id: 'book_challenge_kotoba_n4',
    title: 'Nihongo Challenge N4 - Kotoba (ことば)',
    japaneseTitle: '「日本語能力試験」対策 にほんごチャレンジ N4［ことば］',
    author: '山崎由紀子 (Yukiko Yamazaki)',
    publisher: 'アスク出版 (ASK Publishing)',
    level: 'N4',
    coverBadge: '32 Bài Từ Vựng + 8 Bài Ôn Tập + 4 Bài Test Tổng Hợp',
    description: 'Sách ôn thi JLPT N4 chuyên sâu về Từ vựng (ことば) thuộc bộ Nihongo Challenge nổi tiếng. Cung cấp 600 từ vựng theo 32 chủ đề đời sống sinh động cùng đầy đủ bài tập luyện tập, bài ôn tập và đáp án chuẩn xác từ giáo trình.',
    themeColor: 'emerald',
    gradient: 'from-teal-600 via-emerald-600 to-green-600',
    category: 'Vocabulary',
    estimatedHours: 12,
    learnersCount: '1,890',
    totalQuestions: 150,
    units: [
      {
        id: 'kotoba_u1',
        unitNumber: 1,
        title: '① スーパーで買い物 (Shopping at the Supermarket)',
        japaneseTitle: '① スーパーで買い物',
        pageRange: 'Trang 16 - 17',
        topic: 'Từ vựng chủ đề Siêu thị & Mua sắm (スーパー、セール、割引、半額、品物...)',
        description: 'Luyện tập các từ vựng về đi siêu thị, giảm giá, đồ hạ giá và các phó từ chỉ mức độ.',
        questions: [
          {
            id: 'kt_u1_q1',
            number: 1,
            sectionTitle: 'れんしゅう 1: ( ) に入る ことばを えらんでください。',
            question: 'スポーツは 全部 好きですが、（　） サッカーが 好きです。',
            options: ['少し', '特に', 'ほとんど', '必ず'],
            correctIndex: 1,
            hint: 'スポーツは全部好きですが、特にサッカーが好きです',
            explanation: '【Đáp án 2: 特に】 (Sách trang 17/140): 「スポーツは 全部 好きですが、特に サッカーが 好きです。」 (Tôi thích tất cả các môn thể thao, nhưng đặc biệt thích bóng đá).'
          },
          {
            id: 'kt_u1_q2',
            number: 2,
            sectionTitle: 'れんしゅう 1',
            question: 'テストで 100点を 取って、とても （　）。',
            options: ['楽しい', '明るい', 'うれしい', 'おもしろい'],
            correctIndex: 2,
            hint: 'Đạt 100 điểm nên cảm thấy...',
            explanation: '【Đáp án 3: うれしい】 (Sách trang 17/140): 「テストで 100点を 取って、とても うれしい。」 (Đạt 100 điểm bài kiểm tra nên tôi rất vui).'
          },
          {
            id: 'kt_u1_q3',
            number: 3,
            sectionTitle: 'れんしゅう 1',
            question: 'この スーパーには （　） が たくさん あります。',
            options: ['品物', '半額', 'お金', 'セール'],
            correctIndex: 0,
            hint: 'Siêu thị có rất nhiều hàng hóa...',
            explanation: '【Đáp án 1: 品物】 (Sách trang 17/140): 「この スーパーには 品物が たくさん あります。」 (Siêu thị này có rất nhiều hàng hóa).'
          },
          {
            id: 'kt_u1_q4',
            number: 4,
            sectionTitle: 'れんしゅう 2: どちらがいいですか。えらんでください。',
            question: '宿題は （　） 終わりました。',
            options: ['a. ほとんど', 'b. あまり'],
            correctIndex: 0,
            hint: 'Hầu như đã xong bài tập',
            explanation: '【Đáp án a: ほとんど】 (Sách trang 17/140): 「宿題は ほとんど 終わりました。」 (Bài tập về nhà hầu như đã hoàn thành).'
          },
          {
            id: 'kt_u1_q5',
            number: 5,
            sectionTitle: 'れんしゅう 2',
            question: '今日までに 旅行の （　） を しなければ ならない。',
            options: ['a. 用意', 'b. 練習'],
            correctIndex: 0,
            hint: 'Chuẩn bị cho chuyến du lịch',
            explanation: '【Đáp án a: 用意】 (Sách trang 17/140): 「今日までに 旅行の 用意を しなければ ならない。」 (Cho đến hôm nay phải chuẩn bị cho chuyến du lịch).'
          },
          {
            id: 'kt_u1_q6',
            number: 6,
            sectionTitle: 'れんしゅう 2',
            question: 'まだ 仕事が （　） いるので、もう少し 会社に います。',
            options: ['a. 残って', 'b. 足りて'],
            correctIndex: 0,
            hint: 'Công việc còn lại...',
            explanation: '【Đáp án a: 残って】 (Sách trang 17/140): 「まだ 仕事が 残っているので、もう少し 会社に います。」 (Vì công việc vẫn còn dở dang nên tôi sẽ ở lại công ty thêm một chút).'
          },
          {
            id: 'kt_u1_q7',
            number: 7,
            sectionTitle: 'れんしゅう 2',
            question: '（　） 行きます。',
            options: ['a. 必ず', 'b. たくさん'],
            correctIndex: 0,
            hint: 'Nhất định sẽ đi',
            explanation: '【Đáp án a: 必ず】 (Sách trang 17/140): 「必ず 行きます。」 (Tôi nhất định sẽ đi).'
          }
        ]
      },
      {
        id: 'kotoba_u2',
        unitNumber: 2,
        title: '② ショッピング (Shopping)',
        japaneseTitle: '② ショッピング',
        pageRange: 'Trang 18 - 19',
        topic: 'Từ vựng Trang phục, Mua sắm (先輩、式、スーツ、ドレス、探す...)',
        description: 'Luyện tập các từ vựng về mua sắm quần áo, vest, váy, giày boots và mối quan hệ tiền bối - hậu bối.',
        questions: [
          {
            id: 'kt_u2_q1',
            number: 1,
            sectionTitle: 'れんしゅう 1: ( ) に入る ことばを えらんでください。',
            question: 'あの 黒い （　） を 着た 男の 人の 名前を 知っていますか。',
            options: ['ポケット', 'スカート', 'スーツ', 'ぼうし'],
            correctIndex: 2,
            hint: 'Bộ vest đen',
            explanation: '【Đáp án 3: スーツ】 (Sách trang 19/140): 「あの 黒い スーツを 着た 男の 人の 名前を 知っていますか。」 (Bạn có biết tên người đàn ông mặc bộ vest đen đó không?).'
          },
          {
            id: 'kt_u2_q2',
            number: 2,
            sectionTitle: 'れんしゅう 1',
            question: '今日の 映画は （　） おもしろくなかった。',
            options: ['全然', 'とても', 'たくさん', '必ず'],
            correctIndex: 0,
            hint: 'Hoàn toàn không hay',
            explanation: '【Đáp án 1: 全然】 (Sách trang 19/140): 「今日の 映画は 全然 おもしろくなかった。」 (Bộ phim hôm nay hoàn toàn không thú vị chút nào).'
          },
          {
            id: 'kt_u2_q3',
            number: 3,
            sectionTitle: 'れんしゅう 1',
            question: '彼は、学校の 1年上の （　） です。',
            options: ['後輩', '先生', '先輩', '父'],
            correctIndex: 2,
            hint: 'Khóa trên 1 năm (Tiền bối)',
            explanation: '【Đáp án 3: 先輩】 (Sách trang 19/140): 「彼は、学校の 1年上の 先輩です。」 (Anh ấy là tiền bối khóa trên 1 năm ở trường của tôi).'
          },
          {
            id: 'kt_u2_q4',
            number: 4,
            sectionTitle: 'れんしゅう 1',
            question: 'わたしは 女性だけど、（　） を つけるのが あまり 好きじゃない。',
            options: ['コート', 'ぼうし', 'スカート', 'アクセサリー'],
            correctIndex: 3,
            hint: 'Đeo đồ trang sức / phụ kiện',
            explanation: '【Đáp án 4: アクセサリー】 (Sách trang 19/140): 「わたしは 女性だけど、アクセサリーを つけるのが あまり 好きじゃない。」 (Tôi là phụ nữ nhưng không thích đeo trang sức/phụ kiện lắm).'
          },
          {
            id: 'kt_u2_q5',
            number: 5,
            sectionTitle: 'れんしゅう 2: どれがいいですか。えらんでください。',
            question: '冬は 寒いので、いつも （　） を はく。',
            options: ['a. サンダル', 'b. ブーツ'],
            correctIndex: 1,
            hint: 'Đi ủng/boots vào mùa đông',
            explanation: '【Đáp án b: ブーツ】 (Sách trang 19/140): 「冬は 寒いので、いつも ブーツを はく。」 (Mùa đông lạnh nên tôi luôn đi ủng/boots).'
          },
          {
            id: 'kt_u2_q6',
            number: 6,
            sectionTitle: 'れんしゅう 2',
            question: '新しい 部屋を （　） ならない。',
            options: ['a. 探さなければ', 'b. 決まらなければ'],
            correctIndex: 0,
            hint: 'Phải tìm phòng mới',
            explanation: '【Đáp án a: 探さなければ】 (Sách trang 19/140): 「新しい 部屋を 探さなければ ならない。」 (Phải tìm phòng ở mới).'
          },
          {
            id: 'kt_u2_q7',
            number: 7,
            sectionTitle: 'れんしゅう 2',
            question: '来年から、日本で 働くことが （　）。',
            options: ['a. 決めた', 'b. 決まった'],
            correctIndex: 1,
            hint: 'Đã được quyết định (Tự động từ 決まる)',
            explanation: '【Đáp án b: 決まった】 (Sách trang 19/140): 「来年から、日本で 働くことが 決まった。」 (Việc làm việc tại Nhật từ năm sau đã được quyết định).'
          }
        ]
      },
      {
        id: 'kotoba_u3',
        unitNumber: 3,
        title: '③ 近所迷惑 (A Neighborhood Nuisance)',
        japaneseTitle: '③ 近所迷惑',
        pageRange: 'Trang 20 - 21',
        topic: 'Từ vựng Xóm giềng & Gây phiền hà (近所、迷惑、駐車場、交番...)',
        description: 'Luyện tập các từ vựng về hàng xóm, đỗ xe, đồn cảnh sát, gieo phiền phức và không sao.',
        questions: [
          {
            id: 'kt_u3_q1',
            number: 1,
            sectionTitle: 'れんしゅう 1: どちらがいいですか。えらんでください。',
            question: 'ここで たばこを 吸っても （　）。',
            options: ['a. かまいますか', 'b. かまいませんか'],
            correctIndex: 1,
            hint: 'Mẫu câu xin phép 〜てもかまいませんか',
            explanation: '【Đáp án b: かまいませんか】 (Sách trang 21/140): 「ここで たばこを 吸っても かまいませんか。」 (Tôi hút thuốc ở đây có được không?).'
          },
          {
            id: 'kt_u3_q2',
            number: 2,
            sectionTitle: 'れんしゅう 1',
            question: '日本では、家と 家の （　） が せまい。',
            options: ['a. 間', 'b. 前'],
            correctIndex: 0,
            hint: 'Khoảng cách giữa các ngôi nhà (間)',
            explanation: '【Đáp án a: 間】 (Sách trang 21/140): 「日本では、家と 家の 間が せまい。」 (Ở Nhật Bản, khoảng cách giữa các ngôi nhà rất hẹp).'
          },
          {
            id: 'kt_u3_q3',
            number: 3,
            sectionTitle: 'れんしゅう 1',
            question: '駅の 前に 自転車を （　）、電車に 乗る。',
            options: ['a. 止まって', 'b. 止めて'],
            correctIndex: 1,
            hint: 'Tha động từ dừng/đỗ xe (止める)',
            explanation: '【Đáp án b: 止めて】 (Sách trang 21/140): 「駅の 前に 自転車を 止めて、電車に 乗る。」 (Dừng/đỗ xe đạp trước nhà ga rồi lên tàu điện).'
          },
          {
            id: 'kt_u3_q4',
            number: 4,
            sectionTitle: 'れんしゅう 1',
            question: '子どもたちが （　） いて、とても うるさい。',
            options: ['a. さわいで', 'b. 寝て'],
            correctIndex: 0,
            hint: 'Làm ồn, gào thét (さわぐ)',
            explanation: '【Đáp án a: さわいで】 (Sách trang 21/140): 「子どもたちが さわいで いて、とても うるさい。」 (Bọn trẻ đang làm ồn nên rất ồn ào).'
          },
          {
            id: 'kt_u3_q5',
            number: 5,
            sectionTitle: 'れんしゅう 2: Nối từ địa điểm',
            question: '① 車を 止めるところ （　）\n② 警官がいるところ （　）\n③ 電車が 止まるところ （　）\n④ 子どもが 遊ぶところ （　）',
            options: ['a. 交番', 'b. 駅', 'c. 公園', 'd. 駐車場'],
            correctIndex: 3,
            hint: 'Nơi đỗ xe là bãi đỗ xe (駐車場)',
            explanation: '【Đáp án ①d 駐車場, ②a 交番, ③b 駅, ④c 公園】 (Sách trang 21/140).'
          }
        ]
      },
      {
        id: 'kotoba_u4',
        unitNumber: 4,
        title: '④ 子どもの学校からの手紙 (Letter from School)',
        japaneseTitle: '④ 子どもの学校からの手紙',
        pageRange: 'Trang 22 - 23',
        topic: 'Từ vựng Trường học, Thảo luận & Thay thế (世話、出席、相談、かわりに...)',
        description: 'Luyện tập các từ vựng về thông báo nhà trường, dự giờ, tham dự tiệc, thảo luận và làm thay.',
        questions: [
          {
            id: 'kt_u4_q1',
            number: 1,
            sectionTitle: 'れんしゅう 1: ( ) に入る ことばを えらんでください。',
            question: '（　）、スーパーで 買い物(を) しました。',
            options: ['さっき', 'すぐに', 'いつ', 'まだ'],
            correctIndex: 0,
            hint: 'Vừa nãy (さっき)',
            explanation: '【Đáp án 1: さっき】 (Sách trang 23/140): 「さっき、スーパーで 買い物(を) しました。」 (Vừa nãy tôi đã đi mua sắm ở siêu thị).'
          },
          {
            id: 'kt_u4_q2',
            number: 2,
            sectionTitle: 'れんしゅう 1',
            question: '明日、パーティーに （　） する。',
            options: ['練習', '勉強', '用意', '出席'],
            correctIndex: 3,
            hint: 'Tham dự bữa tiệc (出席)',
            explanation: '【Đáp án 4: 出席】 (Sách trang 23/140): 「明日、パーティーに 出席する。」 (Ngày mai tôi sẽ tham dự bữa tiệc).'
          },
          {
            id: 'kt_u4_q3',
            number: 3,
            sectionTitle: 'れんしゅう 1',
            question: '（　） 早く 来てください。',
            options: ['たぶん', 'なるべく', 'とても', 'あまり'],
            correctIndex: 1,
            hint: 'Càng sớm càng tốt (なるべく)',
            explanation: '【Đáp án 2: なるべく】 (Sách trang 23/140): 「なるべく 早く 来てください。」 (Hãy cố gắng đến sớm nhất có thể nhé).'
          },
          {
            id: 'kt_u4_q4',
            number: 4,
            sectionTitle: 'れんしゅう 1',
            question: '仕事の ことを （　） しても いいですか。',
            options: ['相談', '練習', '遠慮', '世話'],
            correctIndex: 0,
            hint: 'Trao đổi, thảo luận (相談)',
            explanation: '【Đáp án 1: 相談】 (Sách trang 23/140): 「仕事の ことを 相談しても いいですか。」 (Tôi trao đổi/thảo luận về công việc có được không?).'
          },
          {
            id: 'kt_u4_q5',
            number: 5,
            sectionTitle: 'れんしゅう 2: Câu đồng nghĩa',
            question: '来月、わたしたちは 結婚式を <u>行います</u>。',
            targetWord: '行います',
            options: ['来月、わたしたちは 結婚式に 行きます。', '来月、わたしたちは 結婚式を します。', '来月、わたしたちは 結婚式に 来ます。', '来月、わたしたちは 結婚式に 出席します。'],
            correctIndex: 1,
            hint: '行う ＝ する (Tổ chức lễ kết hôn)',
            explanation: '【Đáp án 2】 (Sách trang 23/140): 「結婚式を行います」 đồng nghĩa với 「結婚式をします」 (Tháng sau chúng tôi sẽ tổ chức lễ kết hôn).'
          },
          {
            id: 'kt_u4_q6',
            number: 6,
            sectionTitle: 'れんしゅう 2: Câu đồng nghĩa',
            question: '友達の <u>かわりに</u>、わたしが 宿題を やった。',
            targetWord: 'かわりに',
            options: ['わたし じゃなくて、友達が 宿題を やった。', '友達 じゃなくて、わたしが 宿題を やった。', '友達と いっしょに、宿題を やった。', '友達も わたしも、同じ 宿題を やった。'],
            correctIndex: 1,
            hint: 'かわりに ＝ Không phải bạn mà là tôi làm',
            explanation: '【Đáp án 2】 (Sách trang 23/140): 「友達のかわりに」 nghĩa là không phải bạn, mà là tôi đã làm bài tập (友達 じゃなくて、わたしが 宿題を やった).'
          }
        ]
      },
      {
        id: 'kotoba_u5',
        unitNumber: 5,
        title: '1〜4 ふくしゅう問題 1 (Revision 1)',
        japaneseTitle: '1〜4 ふくしゅう問題 1',
        pageRange: 'Trang 24 - 25',
        topic: 'Bài ôn tập tổng hợp 1 (Bài 1 - Bài 4): Từ vựng & Cách dùng từ',
        description: 'Bài kiểm tra tổng hợp từ vựng Bài 1 đến Bài 4 theo định dạng đề thi chuẩn JLPT N4.',
        questions: [
          {
            id: 'kt_u5_q1',
            number: 1,
            sectionTitle: '問題 I: ( ) になにをいれますか。1・2・3・4から いちばん いいものを ひとつえらんでください。',
            question: 'すぐに 出かけるから、（　） しなさい。',
            options: ['そうだん', 'ようじ', 'ようい', 'しゅっせき'],
            correctIndex: 2,
            hint: 'Chuẩn bị ngay (用意しなさい)',
            explanation: '【Đáp án 3: ようい】 (Sách trang 24/140): 「すぐに 出かけるから、用意しなさい。」 (Vì sẽ đi ngay bây giờ nên hãy chuẩn bị đi).'
          },
          {
            id: 'kt_u5_q2',
            number: 2,
            sectionTitle: '問題 I',
            question: 'ちゅうしゃじょうに 車を （　）。',
            options: ['来る', 'とめる', 'とまる', '行く'],
            correctIndex: 1,
            hint: 'Đỗ xe (車をとめる)',
            explanation: '【Đáp án 2: とめる】 (Sách trang 24/140): 「ちゅうしゃじょうに 車を とめる。」 (Đỗ xe vào bãi đỗ xe).'
          },
          {
            id: 'kt_u5_q3',
            number: 3,
            sectionTitle: '問題 I',
            question: '今日は 子どもの （　） をしなければなりません。',
            options: ['あいさつ', 'せわ', 'わけ', 'ようじ'],
            correctIndex: 1,
            hint: 'Chăm sóc trẻ em (せわ)',
            explanation: '【Đáp án 2: せわ】 (Sách trang 24/140): 「今日は 子どもの せわをしなければなりません。」 (Hôm nay tôi phải chăm sóc con cái).'
          },
          {
            id: 'kt_u5_q4',
            number: 4,
            sectionTitle: '問題 I',
            question: 'ショッピングは （　） 時間をわすれてしまいます。',
            options: ['たのしくて', 'おいしくて', 'おそくて', 'やすくて'],
            correctIndex: 0,
            hint: 'Mua sắm rất vui (たのしくて)',
            explanation: '【Đáp án 1: たのしくて】 (Sách trang 24/140): 「ショッピングは たのしくて 時間をわすれてしまいます。」 (Đi mua sắm rất vui nên quên cả thời gian).'
          },
          {
            id: 'kt_u5_q5',
            number: 5,
            sectionTitle: '問題 I',
            question: 'のこった りょうりは、（　） しましょう。',
            options: ['たいせつ', 'そうじ', 'れいとう', 'ようい'],
            correctIndex: 2,
            hint: 'Thức ăn thừa thì cấp đông (れいとう)',
            explanation: '【Đáp án 3: れいとう】 (Sách trang 24/140): 「のこった りょうりは、れいとうしましょう。」 (Món ăn còn thừa lại thì hãy cấp đông/làm lạnh nhé).'
          },
          {
            id: 'kt_u5_q6',
            number: 6,
            sectionTitle: '問題 I',
            question: 'みじかい （　） でしたが、ありがとうございました。',
            options: ['こんど', 'ころ', 'あいだ', 'ようび'],
            correctIndex: 2,
            hint: 'Trong khoảng thời gian ngắn (みじかい あいだ)',
            explanation: '【Đáp án 3: あいだ】 (Sách trang 24/140): 「みじかい あいだでしたが、ありがとうございました。」 (Dù chỉ trong khoảng thời gian ngắn nhưng xin cảm ơn quý vị rất nhiều).'
          },
          {
            id: 'kt_u5_q7',
            number: 7,
            sectionTitle: '問題 I',
            question: 'けっこんしきは、（　） イベントです。',
            options: ['べんりな', 'とくべつな', 'きれいな', 'へんな'],
            correctIndex: 1,
            hint: 'Sự kiện đặc biệt (とくべつな)',
            explanation: '【Đáp án 2: とくべつな】 (Sách trang 24/140): 「けっこんしきは、とくべつな イベントです。」 (Lễ kết hôn là một sự kiện đặc biệt).'
          },
          {
            id: 'kt_u5_q8',
            number: 8,
            sectionTitle: '問題 I',
            question: 'このことを聞いたら、父はかならず （　） でしょう。',
            options: ['おこる', 'のこる', 'しかる', '足りる'],
            correctIndex: 0,
            hint: 'Tức giận (おこる)',
            explanation: '【Đáp án 1: おこる】 (Sách trang 24/140): 「このことを聞いたら、父はかならず おこるでしょう。」 (Nếu nghe thấy chuyện này, chắc chắn bố sẽ tức giận).'
          },
          {
            id: 'kt_u5_q9',
            number: 9,
            sectionTitle: '問題 I',
            question: '今日は とくに （　） もないので、いえで休もうと思います。',
            options: ['ようじ', 'ようい', 'ひま', '時間'],
            correctIndex: 0,
            hint: 'Không có việc bận (ようじ)',
            explanation: '【Đáp án 1: ようじ】 (Sách trang 24/140): 「今日は とくに ようじもないので、いえで休もうと思います。」 (Hôm nay đặc biệt không có việc gì bận nên tôi định nghỉ ở nhà).'
          },
          {
            id: 'kt_u5_q10',
            number: 10,
            sectionTitle: '問題 I',
            question: '車に乗っていたら、（　） おとがしてきました。',
            options: ['ふくざつな', 'たいせつな', 'かんたんな', 'へんな'],
            correctIndex: 3,
            hint: 'Tiếng động kỳ lạ (へんな おと)',
            explanation: '【Đáp án 4: へんな】 (Sách trang 24/140): 「車に乗っていたら、へんな おとがしてきました。」 (Khi đang ngồi trên xe thì nghe thấy tiếng động kỳ lạ).'
          },
          {
            id: 'kt_u5_q11',
            number: 11,
            sectionTitle: '問題 II: つぎの ____ の文と だいたい おなじ いみの 文を ひとつえらんでください。',
            question: '今日の しごとは <u>ほとんど</u> おわりました。',
            targetWord: 'ほとんど',
            options: ['今日の しごとは ぜんぶ おわりました。', '今日の しごとは あまり おわっていません。', '今日の しごとは 少し おわりました。', '今日の しごとは もうすぐ おわります。'],
            correctIndex: 3,
            hint: 'ほとんどおわりました ＝ もうすぐ おわります',
            explanation: '【Đáp án 4】 (Sách trang 25/140): 「ほとんどおわりました」 đồng nghĩa với 「もうすぐ おわります」 (Công việc hôm nay gần như đã xong / sắp xong rồi).'
          },
          {
            id: 'kt_u5_q12',
            number: 12,
            sectionTitle: '問題 II',
            question: 'この しなものを 買うには、<u>1000円では 足りません</u>。',
            targetWord: '1000円では 足りません',
            options: ['この しなものは、1000円です。', 'この しなものは、1000円より 安いです。', 'この しなものは、1000円で 買えます。', 'この しなものは、1000円で 買えません。'],
            correctIndex: 3,
            hint: '1000円では足りません ＝ 1000円で買えません',
            explanation: '【Đáp án 4】 (Sách trang 25/140): 「1000円では足りません」 nghĩa là 1000 yen không đủ mua (1000円で 買えません).'
          },
          {
            id: 'kt_u5_q13',
            number: 13,
            sectionTitle: '問題 III: つぎの ことばの つかいかたで いちばん いいものを 1・2・3・4から ひとつえらんでください。',
            question: 'かまう',
            options: ['ここに にもつを おいても かまいますか。', 'この へやは じゅうに つかって かまいません。', 'かれは せが ひくいことを かまっている。', 'よく かまって たべなさい。'],
            correctIndex: 1,
            hint: '〜てもかまいません',
            explanation: '【Đáp án 2】 (Sách trang 25/140): 「この へやは じゅうに つかって かまいません。」 (Căn phòng này bạn dùng tự do không sao cả).'
          },
          {
            id: 'kt_u5_q14',
            number: 14,
            sectionTitle: '問題 III',
            question: 'ちょうどいい',
            options: ['今日は 天気がよくて、とても ちょうどいい。', 'すみません。この日は、ちょうどいいんです。', 'あつい おふろに 入って、ちょうどいい。', 'ちょうどいい 時間に ついた。'],
            correctIndex: 3,
            hint: 'ちょうどいい 時間に ついた',
            explanation: '【Đáp án 4】 (Sách trang 25/140): 「ちょうどいい 時間に ついた。」 (Tôi đã đến vào đúng thời điểm thích hợp).'
          },
          {
            id: 'kt_u5_q15',
            number: 15,
            sectionTitle: '問題 III',
            question: 'ぜんぜん',
            options: ['しゅくだいは ぜんぜん やりました。', 'ぜんぜん さむくなってきた。', 'しごとが ぜんぜん おわらない。', 'おかしを もらって、ぜんぜん うれしい。'],
            correctIndex: 2,
            hint: 'ぜんぜん ＋ Phủ định (ぜんぜん〜ない)',
            explanation: '【Đáp án 3】 (Sách trang 25/140): 「しごとが ぜんぜん おわらない。」 (Công việc hoàn toàn không kết thúc được).'
          }
        ]
      }
    ]
  },
  SHIN_NIHONGO_500_N4_N5,
  // =========================================================================
  // N5 CURATED BOOKS
  // =========================================================================
  {
    id: 'book_minna_shokyu_1_n5',
    title: 'Minna no Nihongo Shokyu I - Honsatsu (みんなの日本語 初級I 本冊)',
    japaneseTitle: 'みんなの日本語 初級I 本冊［第2版］',
    author: 'スリーエーネットワーク (3A Corporation)',
    publisher: 'スリーエーネットワーク (3A Network)',
    level: 'N5',
    category: 'Grammar',
    coverBadge: '25 Bài Học Nhập Môn Chuẩn JLPT N5',
    description: 'Giáo trình tiếng Nhật kinh điển toàn cầu cho người mới bắt đầu. Bao gồm 25 bài học từ vựng, ngữ pháp cơ bản, hội thoại và mẫu câu luyện tập ngữ pháp trọng điểm kỳ thi JLPT N5.',
    themeColor: 'amber',
    gradient: 'from-amber-600 via-yellow-600 to-orange-600',
    estimatedHours: 20,
    learnersCount: '3,850',
    totalQuestions: 75,
    units: [
      {
        id: 'minna1_u1',
        unitNumber: 1,
        title: '第1課 わたしは マイク・ミラーです (Lesson 1: Self-introduction)',
        japaneseTitle: '第1課 わたしは マイク・ミラーです',
        pageRange: 'Trang 10 - 15',
        topic: 'Ngữ pháp: 〜は〜です、〜は〜じゃありません、〜は〜ですか、〜も〜です',
        description: 'Mẫu câu khẳng định, phủ định, nghi vấn và trợ từ も trong tiếng Nhật sơ cấp.',
        questions: [
          {
            id: 'm1_u1_q1',
            number: 1,
            sectionTitle: '文法練習 A',
            question: 'わたし （　） マイク・ミラーです。',
            options: ['は', 'が', 'を', 'に'],
            correctIndex: 0,
            hint: 'Trợ từ chỉ chủ đề câu: A は B です',
            explanation: '【Đáp án 1: は】 (Minna I - Bài 1): わたしは マイク・ミラーです (Tôi là Mike Miller).'
          },
          {
            id: 'm1_u1_q2',
            number: 2,
            sectionTitle: '文法練習 A',
            question: 'サントスさん （　） 学生じゃ ありません。会社員です。',
            options: ['は', 'も', 'が', 'で'],
            correctIndex: 0,
            hint: 'Trợ từ は đánh dấu chủ ngữ phủ định: A は B じゃありません',
            explanation: '【Đáp án 1: は】 (Minna I - Bài 1): サントスさんは 学生じゃありません (Anh Santos không phải là học sinh).'
          }
        ]
      },
      {
        id: 'minna1_u2',
        unitNumber: 2,
        title: '第2課 これは 辞書です (Lesson 2: Objects & Belongings)',
        japaneseTitle: '第2課 これは 辞書です',
        pageRange: 'Trang 16 - 21',
        topic: 'Ngữ pháp: これ／それ／あれ、この／その／あの、だれの〜',
        description: 'Chỉ định từ đồ vật và sở hữu cách trong tiếng Nhật cơ bản.',
        questions: [
          {
            id: 'm1_u2_q1',
            number: 1,
            sectionTitle: '文法練習 A',
            question: '（　） は 本です。',
            options: ['これ', 'この', 'ここ', 'こちら'],
            correctIndex: 0,
            hint: 'Chỉ định từ độc lập làm chủ ngữ: これ／それ／あれ',
            explanation: '【Đáp án 1: これ】: これ は 本です (Đây là quyển sách).'
          }
        ]
      }
    ]
  },
  {
    id: 'book_challenge_kanji_kotoba_n5',
    title: 'Nihongo Challenge N5 - Kanji to Kotoba (漢字とことば)',
    japaneseTitle: '「日本語能力試験」対策 にほんごチャレンジ N5［漢字とことば］',
    author: '飯塚睦・金成フミ恵 (Mutsumi Iizuka, Fumie Kanari)',
    publisher: 'アスク出版 (ASK Publishing)',
    level: 'N5',
    category: 'Vocabulary',
    coverBadge: '110 Chữ Hán Căn Bản + 300 Từ Vựng N5',
    description: 'Sách nhập môn Chữ Hán và Từ vựng cho kỳ thi JLPT N5 qua tranh minh họa vui nhộn, nét bút thuận và bài tập áp dụng thực tế đời sống tại Nhật Bản.',
    themeColor: 'emerald',
    gradient: 'from-emerald-700 via-teal-600 to-cyan-700',
    estimatedHours: 12,
    learnersCount: '2,140',
    totalQuestions: 60,
    units: [
      {
        id: 'ch_n5_u1',
        unitNumber: 1,
        title: '第1課 日・月・火・水・木・金・土 (Numbers & Days)',
        japaneseTitle: '第1課 カレンダーの漢字',
        pageRange: 'Trang 12 - 15',
        topic: 'Kanji & Từ vựng: Các ngày trong tuần và chữ Hán tự nhiên cơ bản',
        description: 'Cách đọc On/Kun và bài tập chọn từ cho các chữ Hán ngày trong tuần.',
        questions: [
          {
            id: 'ch5_u1_q1',
            number: 1,
            sectionTitle: '漢字の読み方',
            question: 'きょうは （日曜日） です。かっこ の かんじ の よみかた は？',
            options: ['にちようび', 'げつようび', 'かようび', 'すいようび'],
            correctIndex: 0,
            hint: '日 (nhật) + 曜日 (diệu nhật)',
            explanation: '【Đáp án 1: にちようび】: 日曜日 đọc là nichiyoubi (Chủ Nhật).'
          }
        ]
      }
    ]
  },
  // =========================================================================
  // N3 CURATED BOOKS
  // =========================================================================
  {
    id: 'book_shinkanzen_bunpou_n3',
    title: 'Shin Kanzen Master N3 - Bunpou (新完全マスター 文法)',
    japaneseTitle: '新完全マスター文法 日本語能力試験N3',
    author: '友松悦子・福島佐知・中村天良 (Etsuko Tomomatsu et al.)',
    publisher: 'スリーエーネットワーク (3A Network)',
    level: 'N3',
    category: 'Grammar',
    coverBadge: 'Giáo Trình Ngữ Pháp Chuyên Sâu JLPT N3',
    description: 'Bộ sách luyện thi uy tín hàng đầu cho kỳ thi N3. Phân biệt cặn kẽ sắc thái các ngữ pháp tương đồng, bài tập dạng đề thi thực tế có độ khó tương đương kỳ thi thật.',
    themeColor: 'blue',
    gradient: 'from-blue-700 via-indigo-700 to-violet-800',
    estimatedHours: 18,
    learnersCount: '2,980',
    totalQuestions: 90,
    units: [
      {
        id: 'sk_n3_u1',
        unitNumber: 1,
        title: '第1課 時間の前後を表す表現 (Time & Sequence)',
        japaneseTitle: '第1課 時間の前後 〜うちに／〜最中に',
        pageRange: 'Trang 14 - 17',
        topic: 'Ngữ pháp: 〜うちに、〜最中に、〜たびに',
        description: 'Mẫu câu diễn tả hành động diễn ra trong một khoảng thời gian nhất định.',
        questions: [
          {
            id: 'sk3_u1_q1',
            number: 1,
            sectionTitle: '問題1: 正しいものを一つ選んでください。',
            question: 'スープが 熱い （　）、どうぞ めしあがってください。',
            options: ['うちに', '最中に', 'たびに', 'あいだ'],
            correctIndex: 0,
            hint: 'Làm gì đó trong khi trạng thái vẫn chưa thay đổi (khi còn nóng)',
            explanation: '【Đáp án 1: うちに】: 「熱いうちに」 (Hãy ăn lúc canh còn nóng).'
          }
        ]
      }
    ]
  },
  {
    id: 'book_sou_matome_dokkai_n3',
    title: 'Nihongo Sou Matome N3 - Dokkai (日本語総まとめ 読解)',
    japaneseTitle: '「日本語能力試験」N3対策 日本語総まとめ［読解］',
    author: '佐々木仁子・松本紀子 (Hitoko Sasaki, Noriko Matsumoto)',
    publisher: 'アスク出版 (ASK Publishing)',
    level: 'N3',
    category: 'Reading',
    coverBadge: '6 Tuần Luyện Đọc Hiểu N3 Cấp Tốc',
    description: 'Chiến thuật làm bài đọc hiểu N3 qua 6 tuần: từ thông báo, tờ rơi quảng cáo ngắn đến bài văn trung bình và bài văn dài nghị luận.',
    themeColor: 'orange',
    gradient: 'from-orange-600 via-amber-600 to-rose-700',
    estimatedHours: 14,
    learnersCount: '2,320',
    totalQuestions: 60,
    units: [
      {
        id: 'sm_n3_u1',
        unitNumber: 1,
        title: '第1週 案内文やお知らせを読む (Notices & Announcements)',
        japaneseTitle: '第1週 お知らせと掲示板',
        pageRange: 'Trang 10 - 15',
        topic: 'Đọc hiểu tìm kiếm thông tin trên thông báo, bảng tin trường học',
        description: 'Kỹ năng scan thông tin thời gian, địa điểm, điều kiện tham gia.',
        questions: [
          {
            id: 'sm3_u1_q1',
            number: 1,
            sectionTitle: '情報検索問題',
            question: '図書館の休館日は いつですか。',
            contextText: '【図書館利用案内】\n開館時間: 9:00〜18:00\n休館日: 毎週月曜日（祝日の場合は翌平日）、毎月第3火曜日',
            options: ['毎週月曜日', '毎週日曜日', '毎週土曜日', '毎日開館'],
            correctIndex: 0,
            hint: 'Xem mục 休館日 (ngày đóng cửa)',
            explanation: '【Đáp án 1】: 休館日: 毎週月曜日 (Đóng cửa vào thứ Hai hàng tuần).'
          }
        ]
      }
    ]
  },
  // =========================================================================
  // N2 CURATED BOOKS
  // =========================================================================
  {
    id: 'book_shinkanzen_dokkai_n2',
    title: 'Shin Kanzen Master N2 - Dokkai (新完全マスター 読解)',
    japaneseTitle: '新完全マスター読解 日本語能力試験N2',
    author: '田代ひとみ・清水知子 (Hitomi Tashiro, Tomoko Shimizu)',
    publisher: 'スリーエーネットワーク (3A Network)',
    level: 'N2',
    category: 'Reading',
    coverBadge: 'Chuyên Sâu Đọc Hiểu N2 Đạt Điểm Tối Đa',
    description: 'Chuyên gia số 1 về rèn luyện tư duy đọc hiểu logic trung - cao cấp N2. Hướng dẫn phân tích luận điểm tác giả, từ nối, mệnh đề so sánh đối chiếu.',
    themeColor: 'teal',
    gradient: 'from-teal-700 via-emerald-800 to-cyan-900',
    estimatedHours: 22,
    learnersCount: '1,950',
    totalQuestions: 80,
    units: [
      {
        id: 'sk_n2_u1',
        unitNumber: 1,
        title: '第1部 短文読解: 筆者の主張をつかむ (Short Passages)',
        japaneseTitle: '第1部 筆者の意見をとらえる',
        pageRange: 'Trang 16 - 20',
        topic: 'Nhận diện luận điểm của tác giả qua các đuôi câu 〜のではないだろうか、〜べきだ',
        description: 'Chiến thuật xác định ý chính đoạn văn ngắn 200 chữ.',
        questions: [
          {
            id: 'sk2_u1_q1',
            number: 1,
            sectionTitle: '短文読解',
            question: '筆者は 最も何を言いたいのか。',
            options: ['言葉の使い方は時代と共に変化する', '若者言葉は正しくない', '辞書の言葉だけを使うべきだ', '変化を拒絶すべきだ'],
            correctIndex: 0,
            hint: 'Tác giả nêu quan điểm ngôn ngữ luôn vận động theo thời đại',
            explanation: '【Đáp án 1】: Tác giả nhấn mạnh ngôn từ phản ánh đời sống thực tế và luôn biến đổi theo thời gian.'
          }
        ]
      }
    ]
  },
  // =========================================================================
  // N1 CURATED BOOKS
  // =========================================================================
  {
    id: 'book_shinkanzen_goi_n1',
    title: 'Shin Kanzen Master N1 - Goi (新完全マスター 語彙)',
    japaneseTitle: '新完全マスター語彙 日本語能力試験N1',
    author: '伊能美恵子・本田ゆかり (Mieko Ino, Yukari Honda)',
    publisher: 'スリーエーネットワーク (3A Network)',
    level: 'N1',
    category: 'Vocabulary',
    coverBadge: 'Đỉnh Cao Từ Vựng Học Thuật & Báo Chí N1',
    description: 'Hơn 2,000 từ vựng cao cấp, thành ngữ 4 chữ Hán (四字熟語), quán dụng ngữ và từ tượng thanh tượng hình phục vụ kỳ thi JLPT N1 và đọc báo chí Nhật.',
    themeColor: 'purple',
    gradient: 'from-purple-900 via-violet-900 to-slate-900',
    estimatedHours: 30,
    learnersCount: '1,670',
    totalQuestions: 100,
    units: [
      {
        id: 'sk_n1_u1',
        unitNumber: 1,
        title: '第1課 人間の性質・感情を表すことば (Human Nature & Emotions)',
        japaneseTitle: '第1課 人の性格と感情',
        pageRange: 'Trang 12 - 17',
        topic: 'Từ vựng miêu tả tính cách, khí chất con người cao cấp',
        description: 'Luyện tập các từ vựng: 几帳面、大ざっぱ、おだやか、気さく...',
        questions: [
          {
            id: 'sk1_u1_q1',
            number: 1,
            sectionTitle: '語彙の用法',
            question: '彼は 時間や 約束に とても （　） な 性格だ。',
            options: ['几帳面', '大ざっぱ', 'いい加減', '気楽'],
            correctIndex: 0,
            hint: 'Tính cách chỉn chu, đúng giờ, tỉ mỉ (几帳面 - きちょうめん)',
            explanation: '【Đáp án 1: 几帳面】: 几帳面 (Kichoumen) chỉ người cẩn thận, ngăn nắp, chuẩn chỉ giờ giấc.'
          }
        ]
      }
    ]
  }
];
