import { DailyExam } from '../types';

// Nguồn: https://jlpt.jp/e/samples/sample09.html (đề mẫu công khai của Japan Foundation / JEES, 2009). Phần nghe: 4 câu có âm thanh trong bản mẫu (cắt từ N4Sample.mp3).
export const REAL_EXAMS_N4_OFFICIAL: DailyExam =  {
  "id": "jlpt_n4_official_sample",
  "title": "JLPT N4 – Đề mẫu chính thức (Japan Foundation / JEES)",
  "level": "N4",
  "year": "2009",
  "session": "Sample Questions",
  "category": "official_past",
  "durationMinutes": 55,
  "questions": [
    {
      "id": "n4_of_v1",
      "question": "あには バスで 会社に 【通って】 います。",
      "hint": "Cách đọc Kanji của 【通って】",
      "options": [
        "むかって",
        "かよって",
        "わたって",
        "もどって"
      ],
      "correctIndex": 1,
      "section": "moji-goi",
      "explanation": "通う đọc là かよう: đi làm/đi học đều đặn bằng phương tiện. 通って = かよって."
    },
    {
      "id": "n4_of_v2",
      "question": "わたしの せんもんは 【医学】です。",
      "hint": "Cách đọc Kanji của 【医学】",
      "options": [
        "かがく",
        "いがく",
        "すうがく",
        "ぶんがく"
      ],
      "correctIndex": 1,
      "section": "moji-goi",
      "explanation": "医学 đọc là いがく (y học). 化学 = かがく, 数学 = すうがく, 文学 = ぶんがく."
    },
    {
      "id": "n4_of_v3",
      "question": "ふねで にもつを 【おくります】。",
      "hint": "Chọn chữ Hán đúng của 【おくります】",
      "options": [
        "近ります",
        "逆ります",
        "辺ります",
        "送ります"
      ],
      "correctIndex": 3,
      "section": "moji-goi",
      "explanation": "おくる (gửi) viết là 送る. Các lựa chọn khác là chữ có hình dáng gần giống."
    },
    {
      "id": "n4_of_v4",
      "question": "毎日 ラジオで 【おんがく】を 聞いています。",
      "hint": "Chọn chữ Hán đúng của 【おんがく】",
      "options": [
        "音楽",
        "音樂",
        "音薬",
        "音藥"
      ],
      "correctIndex": 0,
      "section": "moji-goi",
      "explanation": "おんがく (âm nhạc) viết là 音楽. 薬 (くすり: thuốc) là chữ gây nhầm lẫn."
    },
    {
      "id": "n4_of_v5",
      "question": "スーパーで もらった（　　）を 見ると、何を 買ったか わかります。",
      "hint": "Điền từ thích hợp vào ( )",
      "options": [
        "レジ",
        "レシート",
        "おつり",
        "さいふ"
      ],
      "correctIndex": 1,
      "section": "moji-goi",
      "explanation": "レシート (biên lai) cho biết đã mua gì. レジ = quầy thu ngân, おつり = tiền thối, さいふ = ví."
    },
    {
      "id": "n4_of_v6",
      "question": "（　　）しないで、どうぞ たくさん 食べて ください。",
      "hint": "Điền từ thích hợp vào ( )",
      "options": [
        "しつれい",
        "しっぱい",
        "えんりょ",
        "はんたい"
      ],
      "correctIndex": 2,
      "section": "moji-goi",
      "explanation": "えんりょしないで = đừng ngại/khách sáo. Mẫu câu mời ăn thường dùng."
    },
    {
      "id": "n4_of_v7",
      "question": "【だいどころに りょうりが のこって います。】",
      "hint": "Chọn câu có nghĩa gần giống nhất",
      "options": [
        "りょうりは だいどころに まだ あります。",
        "りょうりは だいどころに もう ありません。",
        "だいどころで りょうりを つくって います。",
        "だいどころで りょうりを ようい して います。"
      ],
      "correctIndex": 0,
      "section": "moji-goi",
      "explanation": "のこっています = vẫn còn lại. Đáp án 1 nói món ăn vẫn còn ở bếp."
    },
    {
      "id": "n4_of_v8",
      "question": "【パスポート ばんごうを しらせて ください。】",
      "hint": "Chọn câu có nghĩa gần giống nhất",
      "options": [
        "パスポート ばんごうを うつして ください。",
        "パスポート ばんごうを なおして ください。",
        "パスポート ばんごうを きめて ください。",
        "パスポート ばんごうを おしえて ください。"
      ],
      "correctIndex": 3,
      "section": "moji-goi",
      "explanation": "しらせる = cho biết, thông báo ≈ おしえる."
    },
    {
      "id": "n4_of_v9",
      "question": "Cách dùng đúng của từ 【けんぶつ】",
      "hint": "Chọn câu dùng từ đúng",
      "options": [
        "きのう、いもうとと 大きな 花を けんぶつしました。",
        "きのう、テレビで にほんの ニュースを けんぶつしました。",
        "きのう、ともだちと きょうとの まちを けんぶつしました。",
        "きのう、しごとで 車の こうじょうを けんぶつしました。"
      ],
      "correctIndex": 2,
      "section": "moji-goi",
      "explanation": "けんぶつ (見物) = đi tham quan, ngắm cảnh (phố, địa danh). Câu 3 dùng đúng nghĩa. Nếu đến xem nhà máy là 見学."
    },
    {
      "id": "n4_of_v10",
      "question": "Cách dùng đúng của từ 【じゅうしょ】",
      "hint": "Chọn câu dùng từ đúng",
      "options": [
        "としょかんの となりの じゅうしょは ゆうびんきょくです。",
        "あしたの かいぎの じゅうしょは 5かいです。",
        "ここに あなたの うちの じゅうしょを かいて ください。",
        "わたしに Eメールの じゅうしょを おしえて ください。"
      ],
      "correctIndex": 2,
      "section": "moji-goi",
      "explanation": "じゅうしょ (住所) = địa chỉ nhà. Địa chỉ email là アドレス, nơi họp là 場所."
    },
    {
      "id": "n4_of_g1",
      "question": "A「わたしの けしゴム、見ませんでしたか。」\nB「あ、つくえの 下に（　　）よ。」",
      "hint": "Điền vào ( )",
      "options": [
        "おちて います",
        "おちて いません",
        "おちます",
        "おちません"
      ],
      "correctIndex": 0,
      "section": "bunpou",
      "explanation": "Trạng thái đang nằm đó: 〜ている. 落ちている = đang rơi (nằm) dưới đất."
    },
    {
      "id": "n4_of_g2",
      "question": "（病院で）\nA「先生、もう 薬を 飲まなくても いいですか。」\nB「いいえ、来週の月曜日までは（　　）。」",
      "hint": "Điền vào ( )",
      "options": [
        "飲んでも いいです",
        "飲まないで ください",
        "飲んで ください",
        "飲んでは いけません"
      ],
      "correctIndex": 2,
      "section": "bunpou",
      "explanation": "「飲まなくてもいいですか」 hỏi có cần uống không; trả lời \"không\" nghĩa là vẫn phải uống: 飲んでください."
    },
    {
      "id": "n4_of_g3",
      "question": "大川「山下さん、おれいの 手紙は もう 出しましたか。」\n山下「いいえ、＿＿＿ ＿＿＿ ★ ＿＿＿ です。」",
      "hint": "Chọn từ điền vào ★",
      "options": [
        "書いて",
        "今",
        "ところ",
        "いる"
      ],
      "correctIndex": 3,
      "section": "bunpou",
      "explanation": "Thứ tự đúng: 今 → 書いて → いる → ところ (\"đang viết\"). Từ ở ★ là いる (đáp án 4)."
    },
    {
      "id": "n4_of_g4",
      "question": "山田さんは ＿＿＿ ★ ＿＿＿ ＿＿＿ です。",
      "hint": "Chọn từ điền vào ★",
      "options": [
        "上手",
        "ギターも",
        "ひけるし",
        "歌も"
      ],
      "correctIndex": 2,
      "section": "bunpou",
      "explanation": "Thứ tự đúng: ギターも → ひけるし → 歌も → 上手 (\"biết chơi guitar, hát cũng giỏi\"). Từ ở ★ là ひけるし (đáp án 3)."
    },
    {
      "id": "n4_of_g5",
      "question": "【5】に 入るもの",
      "hint": "Điền vào chỗ trống 【5】",
      "options": [
        "も",
        "が",
        "や",
        "は"
      ],
      "correctIndex": 3,
      "section": "bunpou",
      "explanation": "「今のアパートは大学まで〜」: は nêu chủ đề, đối chiếu với căn hộ cũ.",
      "readingPassage": "田中さん、お元気ですか。わたしは 先週、大学の 近くに ひっこしを しました。前は アパートから 大学まで 電車と バスで 1時間半ぐらい かかりました。でも、今の アパート【5】大学まで 歩いて 10分ぐらいです。【6】、ここに ひっこす ことに しました。少し せまいですが、新しくて きれいだし、近所に スーパーも あります。駅からも 近くて、生活が とても【7】。それに、アパートの へやの まどから 見える けしきも いいです。だから、ひっこしを して 本当に よかったと【8】。この 手紙と いっしょに、わたしの へやの まどから 見た けしきの 写真を【9】。それでは、また。\n2010年2月25日 アリ",
      "imageUrl": "/exams/n4_official_sample_letter.png"
    },
    {
      "id": "n4_of_g6",
      "question": "【6】に 入るもの",
      "hint": "Điền vào chỗ trống 【6】",
      "options": [
        "しかし",
        "それで",
        "たとえば",
        "それから"
      ],
      "correctIndex": 1,
      "section": "bunpou",
      "explanation": "Vế sau là kết quả của vế trước (gần trường, đi 10 phút) nên dùng それで (\"vì thế\").",
      "readingPassage": "田中さん、お元気ですか。わたしは 先週、大学の 近くに ひっこしを しました。前は アパートから 大学まで 電車と バスで 1時間半ぐらい かかりました。でも、今の アパート【5】大学まで 歩いて 10分ぐらいです。【6】、ここに ひっこす ことに しました。少し せまいですが、新しくて きれいだし、近所に スーパーも あります。駅からも 近くて、生活が とても【7】。それに、アパートの へやの まどから 見える けしきも いいです。だから、ひっこしを して 本当に よかったと【8】。この 手紙と いっしょに、わたしの へやの まどから 見た けしきの 写真を【9】。それでは、また。\n2010年2月25日 アリ",
      "imageUrl": "/exams/n4_official_sample_letter.png"
    },
    {
      "id": "n4_of_g7",
      "question": "【7】に 入るもの",
      "hint": "Điền vào chỗ trống 【7】",
      "options": [
        "便利に なりました",
        "便利だそうです",
        "便利だからです",
        "便利でしょうか"
      ],
      "correctIndex": 0,
      "section": "bunpou",
      "explanation": "Diễn tả sự thay đổi sau khi chuyển nhà: 便利になりました (đã trở nên tiện lợi).",
      "readingPassage": "田中さん、お元気ですか。わたしは 先週、大学の 近くに ひっこしを しました。前は アパートから 大学まで 電車と バスで 1時間半ぐらい かかりました。でも、今の アパート【5】大学まで 歩いて 10分ぐらいです。【6】、ここに ひっこす ことに しました。少し せまいですが、新しくて きれいだし、近所に スーパーも あります。駅からも 近くて、生活が とても【7】。それに、アパートの へやの まどから 見える けしきも いいです。だから、ひっこしを して 本当に よかったと【8】。この 手紙と いっしょに、わたしの へやの まどから 見た けしきの 写真を【9】。それでは、また。\n2010年2月25日 アリ",
      "imageUrl": "/exams/n4_official_sample_letter.png"
    },
    {
      "id": "n4_of_g8",
      "question": "【8】に 入るもの",
      "hint": "Điền vào chỗ trống 【8】",
      "options": [
        "思うようです",
        "思って います",
        "思ったようです",
        "思って いました"
      ],
      "correctIndex": 1,
      "section": "bunpou",
      "explanation": "Cảm nghĩ hiện tại của người viết: 〜と思っています.",
      "readingPassage": "田中さん、お元気ですか。わたしは 先週、大学の 近くに ひっこしを しました。前は アパートから 大学まで 電車と バスで 1時間半ぐらい かかりました。でも、今の アパート【5】大学まで 歩いて 10分ぐらいです。【6】、ここに ひっこす ことに しました。少し せまいですが、新しくて きれいだし、近所に スーパーも あります。駅からも 近くて、生活が とても【7】。それに、アパートの へやの まどから 見える けしきも いいです。だから、ひっこしを して 本当に よかったと【8】。この 手紙と いっしょに、わたしの へやの まどから 見た けしきの 写真を【9】。それでは、また。\n2010年2月25日 アリ",
      "imageUrl": "/exams/n4_official_sample_letter.png"
    },
    {
      "id": "n4_of_g9",
      "question": "【9】に 入るもの",
      "hint": "Điền vào chỗ trống 【9】",
      "options": [
        "送って みませんか",
        "送って ください",
        "送りましょうか",
        "送ります"
      ],
      "correctIndex": 3,
      "section": "bunpou",
      "explanation": "Người viết nói về việc mình sẽ làm cùng lá thư: 写真を送ります (tôi gửi kèm ảnh).",
      "readingPassage": "田中さん、お元気ですか。わたしは 先週、大学の 近くに ひっこしを しました。前は アパートから 大学まで 電車と バスで 1時間半ぐらい かかりました。でも、今の アパート【5】大学まで 歩いて 10分ぐらいです。【6】、ここに ひっこす ことに しました。少し せまいですが、新しくて きれいだし、近所に スーパーも あります。駅からも 近くて、生活が とても【7】。それに、アパートの へやの まどから 見える けしきも いいです。だから、ひっこしを して 本当に よかったと【8】。この 手紙と いっしょに、わたしの へやの まどから 見た けしきの 写真を【9】。それでは、また。\n2010年2月25日 アリ",
      "imageUrl": "/exams/n4_official_sample_letter.png"
    },
    {
      "id": "n4_of_r10",
      "question": "インターネットで、「中野コーヒー」から 100グラム 400円の コーヒーを 500グラム 買いたいです。いくらに なりますか。",
      "hint": "Đọc hiểu (đoạn ngắn)",
      "options": [
        "1,700円",
        "1,800円",
        "2,000円",
        "2,200円"
      ],
      "correctIndex": 1,
      "section": "dokkai",
      "explanation": "500g × 4 (400円/100g) = 2,000円. Từ 500g trở lên: phí ship miễn phí và giảm 200円 → 1,800円.",
      "readingPassage": "コーヒーが 好きな 人に、便利な お店を 紹介します。\n「中野コーヒー」では、インターネットで コーヒーを 買う ことが できます。\nコーヒーを 送って もらうには、普通 200円 かかりますが、500グラム 以上 頼むと、ただに なります。\nそして、500グラム 以上 買うと、200円 安く なります。\nお店で コーヒーを 選ぶのも 楽しいですが、忙しい ときなど、一度 利用して みませんか。",
      "imageUrl": "/exams/n4_official_sample_coffee.png"
    },
    {
      "id": "n4_of_r11",
      "question": "日本では、引っ越しを したとき、どんな 習慣が ありますか。",
      "hint": "Đọc hiểu (đoạn trung)",
      "options": [
        "小さな 物を 持って 近所に あいさつする。",
        "隣の 人に 何か 小さな 物を 渡す。",
        "隣の 人に あいさつの 手紙を 書いて 出す。",
        "あいさつの 手紙を 自分の 家の 玄関に はる。"
      ],
      "correctIndex": 0,
      "section": "dokkai",
      "explanation": "Bài viết: 小さな品物を持って近所にあいさつに行くことが多い.",
      "readingPassage": "日本では、むかしから 引っ越しを したとき、近所の 家へ あいさつに 行く 習慣が あります。「これから いろいろ お世話に なります。どうぞ よろしく お願いします。」という 意味です。\nアパートや マンションでは、自分の 部屋の 隣に 住んでいる 人や、上の 部屋と 下の 部屋に 住んでいる 人などに あいさつを します。引っ越しを したら、すぐに あいさつに 行きましょう。あいさつに 行く ときは、小さな 品物を 持って 行く ことが 多いです。例えば、タオルや せっけん、おかしなどです。しかし、大事なのは あいさつを する ことなのですから、どんな 物を 持って 行くかは あまり 心配しなくても いいです。あいさつに 行ったけれども、留守だった ときは、あいさつの ことばを 書いた 手紙などを 玄関の ポストに 入れて おくのが いいです。\n最近は、「引っ越しの あいさつ」を しない 人も 多く なっています。特に、一人で 住むときは、あいさつを しない 人が たくさん います。しかし、私は 「引っ越しの あいさつ」は、やはり いい 習慣だと 思います。"
    },
    {
      "id": "n4_of_r12",
      "question": "どうして「引っ越しの あいさつ」を しますか。",
      "hint": "Đọc hiểu (đoạn trung)",
      "options": [
        "アパートなどに 住むときは、ほとんどの 人が しているから。",
        "引っ越しを したら、必ず しなければ ならないから。",
        "「これから ここに 住みます」と 知らせないと、失礼だから。",
        "「よろしく お願いします」という 気持ちを 伝えたいから。"
      ],
      "correctIndex": 3,
      "section": "dokkai",
      "explanation": "Ý nghĩa của lời chào: 「これからいろいろお世話になります。どうぞよろしくお願いします。」",
      "readingPassage": "日本では、むかしから 引っ越しを したとき、近所の 家へ あいさつに 行く 習慣が あります。「これから いろいろ お世話に なります。どうぞ よろしく お願いします。」という 意味です。\nアパートや マンションでは、自分の 部屋の 隣に 住んでいる 人や、上の 部屋と 下の 部屋に 住んでいる 人などに あいさつを します。引っ越しを したら、すぐに あいさつに 行きましょう。あいさつに 行く ときは、小さな 品物を 持って 行く ことが 多いです。例えば、タオルや せっけん、おかしなどです。しかし、大事なのは あいさつを する ことなのですから、どんな 物を 持って 行くかは あまり 心配しなくても いいです。あいさつに 行ったけれども、留守だった ときは、あいさつの ことばを 書いた 手紙などを 玄関の ポストに 入れて おくのが いいです。\n最近は、「引っ越しの あいさつ」を しない 人も 多く なっています。特に、一人で 住むときは、あいさつを しない 人が たくさん います。しかし、私は 「引っ越しの あいさつ」は、やはり いい 習慣だと 思います。"
    },
    {
      "id": "n4_of_r13",
      "question": "①手紙などを 玄関の ポストに 入れて おくのは どうしてですか。",
      "hint": "Đọc hiểu (đoạn trung)",
      "options": [
        "あいさつに 来た ことを 知らせたいから。",
        "あとで 品物を 取りに 来て ほしいから。",
        "暇な ときに 遊びに 来て ほしいから。",
        "あとで 連絡して もらいたいから。"
      ],
      "correctIndex": 0,
      "section": "dokkai",
      "explanation": "Khi vắng nhà, để lại thư để người ở đó biết mình đã đến chào.",
      "readingPassage": "日本では、むかしから 引っ越しを したとき、近所の 家へ あいさつに 行く 習慣が あります。「これから いろいろ お世話に なります。どうぞ よろしく お願いします。」という 意味です。\nアパートや マンションでは、自分の 部屋の 隣に 住んでいる 人や、上の 部屋と 下の 部屋に 住んでいる 人などに あいさつを します。引っ越しを したら、すぐに あいさつに 行きましょう。あいさつに 行く ときは、小さな 品物を 持って 行く ことが 多いです。例えば、タオルや せっけん、おかしなどです。しかし、大事なのは あいさつを する ことなのですから、どんな 物を 持って 行くかは あまり 心配しなくても いいです。あいさつに 行ったけれども、留守だった ときは、あいさつの ことばを 書いた 手紙などを 玄関の ポストに 入れて おくのが いいです。\n最近は、「引っ越しの あいさつ」を しない 人も 多く なっています。特に、一人で 住むときは、あいさつを しない 人が たくさん います。しかし、私は 「引っ越しの あいさつ」は、やはり いい 習慣だと 思います。"
    },
    {
      "id": "n4_of_r14",
      "question": "最近は、どんな 人が 増えて いますか。",
      "hint": "Đọc hiểu (đoạn trung)",
      "options": [
        "一人で 住む 人",
        "ほかの 人と 住む 人",
        "「引っ越しの あいさつ」を する 人",
        "「引っ越しの あいさつ」を しない 人"
      ],
      "correctIndex": 3,
      "section": "dokkai",
      "explanation": "Bài viết: 最近は「引っ越しのあいさつ」をしない人も多くなっています.",
      "readingPassage": "日本では、むかしから 引っ越しを したとき、近所の 家へ あいさつに 行く 習慣が あります。「これから いろいろ お世話に なります。どうぞ よろしく お願いします。」という 意味です。\nアパートや マンションでは、自分の 部屋の 隣に 住んでいる 人や、上の 部屋と 下の 部屋に 住んでいる 人などに あいさつを します。引っ越しを したら、すぐに あいさつに 行きましょう。あいさつに 行く ときは、小さな 品物を 持って 行く ことが 多いです。例えば、タオルや せっけん、おかしなどです。しかし、大事なのは あいさつを する ことなのですから、どんな 物を 持って 行くかは あまり 心配しなくても いいです。あいさつに 行ったけれども、留守だった ときは、あいさつの ことばを 書いた 手紙などを 玄関の ポストに 入れて おくのが いいです。\n最近は、「引っ越しの あいさつ」を しない 人も 多く なっています。特に、一人で 住むときは、あいさつを しない 人が たくさん います。しかし、私は 「引っ越しの あいさつ」は、やはり いい 習慣だと 思います。"
    },
    {
      "id": "n4_of_r15",
      "question": "今日は 1日です。ビールの 瓶が たくさん あって、早く 捨てたいです。何日に どこに 捨てられますか。",
      "hint": "Đọc hiểu (tìm thông tin) — xem thông báo A và lịch B",
      "options": [
        "1日に ごみ箱A",
        "2日に ごみ箱C",
        "6日に ごみ箱D",
        "7日に ごみ箱B"
      ],
      "correctIndex": 1,
      "section": "dokkai",
      "explanation": "Chai bia thuộc loại 瓶・缶: ごみ箱C, thứ Sáu hằng tuần. Ngày 1 là thứ Năm nên thứ Sáu đầu tiên là ngày 2.",
      "imageUrl": "/exams/n4_official_sample_gomi.png"
    },
    {
      "id": "n4_of_r16",
      "question": "今日は 1日です。古い 本棚と カセットテープが あって、早く 捨てたいです。何日に どこに 捨てられますか。",
      "hint": "Đọc hiểu (tìm thông tin) — xem thông báo A và lịch B",
      "options": [
        "本棚を 1日に ごみ箱A、カセットテープを 2日に ごみ箱C",
        "本棚を 1日に ごみ箱A、カセットテープを 7日に ごみ箱B",
        "本棚を 6日に ごみ箱D、カセットテープを 7日に ごみ箱B",
        "本棚を 6日に ごみ箱D、カセットテープを 2日に ごみ箱C"
      ],
      "correctIndex": 2,
      "section": "dokkai",
      "explanation": "本棚 = 大きいごみ: ごみ箱D, thứ Ba đầu tháng = ngày 6. カセットテープ = 燃えないごみ: ごみ箱B, thứ Tư hằng tuần = ngày 7.",
      "imageUrl": "/exams/n4_official_sample_gomi.png"
    },
    {
      "id": "n4_of_c1",
      "audioUrl": "/audio/n4_official_sample_l1.mp3",
      "imageUrl": "/exams/n4_official_sample_l1.png",
      "question": "【問題1 - 2番】\n先生が生徒に話しています。生徒はパン工場の見学に行くとき、何を持っていかなければなりませんか。",
      "hint": "Nghe và chọn tranh đúng",
      "options": [
        "1番",
        "2番",
        "3番",
        "4番"
      ],
      "correctIndex": 3,
      "section": "choukai",
      "explanation": "Cơm hộp do nhà máy chuẩn bị; máy ảnh không được mang; phải mang đồ uống và ô (傘). Đáp án 4.",
      "audioScript": "先生：えー、来週、パン工場の見学に行きます。午前9時にここを出発します。お弁当は自分で持っていく予定でしたが、工場の人が用意してくれます。一緒に食堂で食べます。でも、飲み物は自分で持っていってください。工場では写真は撮れないので、カメラは持っていってはいけません。あ、それから、傘を忘れないでください。バスを降りてから、少し歩きます。雨が降るかもしれませんからね。何か質問ありますか。"
    },
    {
      "id": "n4_of_c2",
      "audioUrl": "/audio/n4_official_sample_l2.mp3",
      "question": "【問題2 - 2番】\n男の人と女の人が学校で話しています。男の人はどうして一時間目の授業を休みましたか。",
      "hint": "Nghe và chọn lý do",
      "options": [
        "電車が おくれたから",
        "ねぼうしたから",
        "うちに さいふを わすれたから",
        "バスの 中に さいふを わすれたから"
      ],
      "correctIndex": 2,
      "section": "choukai",
      "explanation": "Anh ấy quên ví ở nhà rồi quay về lấy (家まで取りに戻った). Không phải để quên trên xe buýt. Đáp án 3.",
      "audioScript": "M：一時間目、出られなかったよ…。\nF：電車が遅れたんでしょう？ほかにも来てない人いたよ。\nM：うん、僕はバスなんだ。\nF：じゃ、寝坊？\nM：ううん。財布を忘れてしまって…。\nF：えー、大変！\nM：うん。それで、家まで取りに戻ったんだ。\nF：なーんだ、バスの中に忘れたのかと思った！びっくりした〜。"
    },
    {
      "id": "n4_of_c3",
      "audioUrl": "/audio/n4_official_sample_l3.mp3",
      "imageUrl": "/exams/n4_official_sample_l3.png",
      "question": "【問題3 - 1番】\n仕事が終わって帰ります。何と言いますか。",
      "hint": "Nhìn tranh, nghe câu hỏi rồi chọn câu đáp đúng (1〜3)",
      "options": [
        "お邪魔します。",
        "お大事に。",
        "お先に失礼します。"
      ],
      "correctIndex": 2,
      "section": "choukai",
      "explanation": "Khi về trước đồng nghiệp ở công ty: お先に失礼します. Đáp án 3.",
      "audioScript": "仕事が終わって帰ります。何と言いますか。\n1．お邪魔します。\n2．お大事に。\n3．お先に失礼します。"
    },
    {
      "id": "n4_of_c4",
      "audioUrl": "/audio/n4_official_sample_l4.mp3",
      "question": "【問題4 - 1番】\nジュース買いに行きますけど、何か買ってきましょうか。",
      "hint": "Không có tranh — nghe câu rồi chọn câu đáp phù hợp",
      "options": [
        "ええ、いいですよ。",
        "そうですか。おいしそうですね。",
        "あ、コーヒー、お願いします。"
      ],
      "correctIndex": 2,
      "section": "choukai",
      "explanation": "Người kia hỏi \"có cần mua gì không\": đáp lại bằng cách nhờ mua. Đáp án 3.",
      "audioScript": "F：ジュース買いに行きますけど、何か買ってきましょうか。\nM：1．ええ、いいですよ。\n　 2．そうですか。おいしそうですね。\n　 3．あ、コーヒー、お願いします。"
    }
  ]
};
