const fs = require('fs');

// Unit 10: 第4週 1日目・2日目 (Q376 - Q405)
const q376_to_405 = [
  {
    id: 's500_q376',
    number: 376,
    sectionTitle: '第4週 1日目 [文字]',
    question: '兄は 大学の 研究者になりました。',
    options: ['けんきゅしゃ', 'けんきゅうにん', 'けんきゅうしゃ', 'けんきゅにん'],
    correctIndex: 2,
    hint: 'Anh trai tôi đã trở thành một nhà nghiên cứu ở trường đại học.',
    explanation: '【Đáp án 3: けんきゅうしゃ】(Sách trang 217): 研究者 (けんきゅうしゃ: nhà nghiên cứu).'
  },
  {
    id: 's500_q377',
    number: 377,
    sectionTitle: '第4週 1日目 [語い]',
    question: '田中さん、＿＿＿ですか。顔色が 悪いですよ。',
    options: ['なに', 'どうしたん', 'どうして', 'どうやって'],
    correctIndex: 1,
    hint: 'Anh Tanaka làm sao thế? Sắc mặt trông nhợt nhạt quá kìa.',
    explanation: '【Đáp án 2: どうしたん】(Sách trang 217): どうしたんですか (bạn bị làm sao thế?).'
  },
  {
    id: 's500_q378',
    number: 378,
    sectionTitle: '第4週 1日目 [文法]',
    question: 'あなたが＿＿＿、私も 行きません。',
    options: ['行かないなら', '行かないと', '行かなくて', '行かないで'],
    correctIndex: 0,
    hint: 'Nếu bạn không đi thì tôi cũng không đi.',
    explanation: '【Đáp án 1: 行かないなら】(Sách trang 217): 〜なら (tiếp nhận chủ đề của đối phương: nếu là vậy thì...).'
  },
  {
    id: 's500_q379',
    number: 379,
    sectionTitle: '第4週 1日目 [文字]',
    question: '自分の 意見を 言ってください。',
    options: ['意兄', '意見', '気見', '意見'],
    correctIndex: 3,
    hint: 'Xin hãy nêu lên ý kiến của bản thân.',
    explanation: '【Đáp án 4: 意見】(Sách trang 219): 意見 (いけん: ý kiến).'
  },
  {
    id: 's500_q380',
    number: 380,
    sectionTitle: '第4週 1日目 [語い]',
    question: '昨日は＿＿＿眠れましたか。',
    options: ['よく', 'ずっと', 'もっと', 'きっと'],
    correctIndex: 0,
    hint: 'Hôm qua bạn ngủ có ngon giấc không?',
    explanation: '【Đáp án 1: よく】(Sách trang 219): よく眠る (ngủ say, ngủ ngon).'
  },
  {
    id: 's500_q381',
    number: 381,
    sectionTitle: '第4週 1日目 [文法]',
    question: 'まっすぐ＿＿＿、右側に 郵便局が あります。',
    options: ['行けば', '行ったら', '行くなら', '行くと'],
    correctIndex: 3,
    hint: 'Hễ đi thẳng là sẽ thấy bưu điện nằm ở bên tay phải.',
    explanation: '【Đáp án 4: 行くと】(Sách trang 219): Vると (chỉ dẫn đường sá hiển nhiên: hễ đi là thấy).'
  },
  {
    id: 's500_q382',
    number: 382,
    sectionTitle: '第4週 1日目 [文字]',
    question: '広い 部屋に 住みたいです。',
    options: ['あかるい', 'せまい', 'ひろい', 'ちいさい'],
    correctIndex: 2,
    hint: 'Tôi muốn sống trong một căn phòng rộng rãi.',
    explanation: '【Đáp án 3: ひろい】(Sách trang 221): 広い (ひろい: rộng rãi).'
  },
  {
    id: 's500_q383',
    number: 383,
    sectionTitle: '第4週 1日目 [語い]',
    question: '＿＿＿、お名前は 何と おっしゃいますか。',
    options: ['すみません', 'しつれいですが', 'ごめんなさい', 'どうも'],
    correctIndex: 1,
    hint: 'Thất lễ nhưng xin phép hỏi quý danh của ngài là gì ạ?',
    explanation: '【Đáp án 2: しつれいですが】(Sách trang 221): 失礼ですが (xin thất lễ, dùng khi hỏi thông tin cá nhân của khách).'
  },
  {
    id: 's500_q384',
    number: 384,
    sectionTitle: '第4週 1日目 [文法]',
    question: 'すみません、その 本を＿＿＿。',
    options: ['取って あげませんか', '取って もらいませんか', '取って いただきませんか', '取って くださいませんか'],
    correctIndex: 3,
    hint: 'Xin lỗi, bạn có thể lấy giúp tôi cuốn sách đó được không ạ?',
    explanation: '【Đáp án 4: 取って くださいませんか】(Sách trang 221): 〜てくださいませんか (lời nhờ vả lịch sự).'
  },
  {
    id: 's500_q385',
    number: 385,
    sectionTitle: '第4週 1日目 [文字]',
    question: 'その 言葉の 意味を 教えてください。',
    options: ['意味', '意見', '意図', '意思'],
    correctIndex: 0,
    hint: 'Xin hãy cho tôi biết ý nghĩa của từ ngữ đó.',
    explanation: '【Đáp án 1: 意味】(Sách trang 223): 意味 (いみ: ý nghĩa).'
  },
  {
    id: 's500_q386',
    number: 386,
    sectionTitle: '第4週 1日目 [語い]',
    question: '時計の はりが＿＿＿。壊れたらしい。',
    options: ['とまらない', 'すすまない', 'まわらない', 'うごかない'],
    correctIndex: 3,
    hint: 'Kim đồng hồ không chạy. Hình như bị hỏng rồi.',
    explanation: '【Đáp án 4: うごかない】(Sách trang 223): 動く (うごく: cử động, kim đồng hồ chuyển động chạy).'
  },
  {
    id: 's500_q387',
    number: 387,
    sectionTitle: '第4週 1日目 [文法]',
    question: '社長は 明日 大阪へ＿＿＿。',
    options: ['行きます', '行かせます', '行かれます', '行かれますか'],
    correctIndex: 2,
    hint: 'Giám đốc ngày mai sẽ đi Osaka ạ.',
    explanation: '【Đáp án 3: 行かれます】(Sách trang 223): Thể bị động dùng làm tôn kính ngữ (受身形の尊敬語).'
  },
  {
    id: 's500_q388',
    number: 388,
    sectionTitle: '第4週 1日目 [文字]',
    question: '住所を 書いて ください。',
    options: ['じゅしょ', 'じょうしょ', 'じゅうしょ', 'じゅしょう'],
    correctIndex: 2,
    hint: 'Xin hãy viết địa chỉ.',
    explanation: '【Đáp án 3: じゅうしょ】(Sách trang 225): 住所 (じゅうしょ: địa chỉ).'
  },
  {
    id: 's500_q389',
    number: 389,
    sectionTitle: '第4週 1日目 [語い]',
    question: '＿＿＿田中さんから 電話が ありましたよ。',
    options: ['いま', 'このあいだ', 'さきほど', 'さっき'],
    correctIndex: 3,
    hint: 'Vừa ban nãy có điện thoại từ anh Tanaka đấy.',
    explanation: '【Đáp án 4: さっき】(Sách trang 225): さっき (vừa lúc nãy, cách nói thân mật).'
  },
  {
    id: 's500_q390',
    number: 390,
    sectionTitle: '第4週 1日目 [文法]',
    question: '部長は もう＿＿＿。',
    options: ['お帰りに なりましたか', '帰られました', '帰られましたか', 'お帰りしました'],
    correctIndex: 0,
    hint: 'Trưởng phòng đã về rồi ạ?',
    explanation: '【Đáp án 1: お帰りに なりましたか】(Sách trang 225): お〜になる (kính ngữ chuẩn: お帰りになりました).'
  },
  {
    id: 's500_q391',
    number: 391,
    sectionTitle: '第4週 2日目 [文字]',
    question: '地下鉄で 行きましょう。',
    options: ['ちげてつ', 'ちかてつ', 'ちかてっ', 'じかてつ'],
    correctIndex: 1,
    hint: 'Chúng ta hãy đi bằng tàu điện ngầm nhé.',
    explanation: '【Đáp án 2: ちかてつ】(Sách trang 227): 地下鉄 (ちかてつ: tàu điện ngầm).'
  },
  {
    id: 's500_q392',
    number: 392,
    sectionTitle: '第4週 2日目 [語い]',
    question: '友達の＿＿＿に 病院へ 行きました。',
    options: ['おみまい', 'おいわい', 'おれい', 'おねがい'],
    correctIndex: 0,
    hint: 'Tôi đã đến bệnh viện để thăm bạn ốm.',
    explanation: '【Đáp án 1: おみまい】(Sách trang 227): お見舞い (おみまい: thăm người ốm).'
  },
  {
    id: 's500_q393',
    number: 393,
    sectionTitle: '第4週 2日目 [文法]',
    question: '田中さんの 住所を＿＿＿。',
    options: ['しって いますか', 'ごぞんじですか', 'ごぞんじますか', 'ぞんじて いますか'],
    correctIndex: 1,
    hint: 'Bạn có biết địa chỉ của anh Tanaka không ạ?',
    explanation: '【Đáp án 2: ごぞんじですか】(Sách trang 227): ご存知ですか (tôn kính ngữ của 知っていますか).'
  },
  {
    id: 's500_q394',
    number: 394,
    sectionTitle: '第4週 2日目 [文字]',
    question: 'この かばんは 軽くて 丈夫です。',
    options: ['おもくて', 'うすくて', 'あつくて', 'かるくて'],
    correctIndex: 3,
    hint: 'Chiếc túi này nhẹ mà lại bền chắc.',
    explanation: '【Đáp án 4: かるくて】(Sách trang 229): 軽い (かるい: nhẹ).'
  },
  {
    id: 's500_q395',
    number: 395,
    sectionTitle: '第4週 2日目 [語い]',
    question: '健康のために、タバコを＿＿＿と 思います。',
    options: ['やめなければ', 'やめよう', 'やめたい', 'やめると'],
    correctIndex: 0,
    hint: 'Vì sức khỏe, tôi nghĩ là mình phải bỏ thuốc lá thôi.',
    explanation: '【Đáp án 1: やめなければ】(Sách trang 229): やめなければ（ならない）と思います (nghĩ là phải bỏ).'
  },
  {
    id: 's500_q396',
    number: 396,
    sectionTitle: '第4週 2日目 [文法]',
    question: '先生、昨日の 日曜日は 何を＿＿＿。',
    options: ['しましたか', 'いたしましたか', 'されましたか', 'なさいましたか'],
    correctIndex: 3,
    hint: 'Thưa thầy, chủ nhật hôm qua thầy đã làm gì ạ?',
    explanation: '【Đáp án 4: なさいましたか】(Sách trang 229): なさる (tôn kính ngữ của する).'
  },
  {
    id: 's500_q397',
    number: 397,
    sectionTitle: '第4週 2日目 [文字]',
    question: '今日は 用事が あります。',
    options: ['ようし', 'ようしゃ', 'ようじょ', 'ようじ'],
    correctIndex: 3,
    hint: 'Hôm nay tôi có việc bận.',
    explanation: '【Đáp án 4: ようじ】(Sách trang 231): 用事 (ようじ: việc bận).'
  },
  {
    id: 's500_q398',
    number: 398,
    sectionTitle: '第4週 2日目 [語い]',
    question: '準備が＿＿＿から 出かけましょう。',
    options: ['おわって', 'すんで', 'できて', 'ととのって'],
    correctIndex: 2,
    hint: 'Chuẩn bị xong xuôi rồi thì chúng ta xuất phát đi thôi.',
    explanation: '【Đáp án 3: できて】(Sách trang 231): 準備ができる (chuẩn bị hoàn tất).'
  },
  {
    id: 's500_q399',
    number: 399,
    sectionTitle: '第4週 2日目 [文法]',
    question: 'すみません、書くものを 貸して＿＿＿。',
    options: ['もらえませんか', 'くださりませんか', 'もらいませんか', 'いただきませんか'],
    correctIndex: 0,
    hint: 'Xin lỗi, bạn có thể cho tôi mượn đồ viết được không?',
    explanation: '【Đáp án 1: もらえませんか】(Sách trang 231): 〜てもらえませんか (nhờ người khác làm cho mình).'
  },
  {
    id: 's500_q400',
    number: 400,
    sectionTitle: '第4週 2日目 [文字]',
    question: '問題の 答えは べつの 紙に 書きなさい。',
    options: ['外', '別', '特', '同'],
    correctIndex: 1,
    hint: 'Hãy viết câu trả lời của câu hỏi vào tờ giấy khác.',
    explanation: '【Đáp án 2: 別】(Sách trang 233): 別 (べつ: khác, riêng biệt).'
  },
  {
    id: 's500_q401',
    number: 401,
    sectionTitle: '第4週 2日目 [語い]',
    question: 'これは もう いらないから＿＿＿。',
    options: ['すてます', 'なげます', 'はらいます', 'ひろいます'],
    correctIndex: 0,
    hint: 'Cái này không cần nữa nên tôi sẽ vứt bỏ đi.',
    explanation: '【Đáp án 1: すてます】(Sách trang 233): 捨てる (すてる: vứt rác, bỏ đi).'
  },
  {
    id: 's500_q402',
    number: 402,
    sectionTitle: '第4週 2日目 [文法]',
    question: '明日は 8時＿＿＿会社に 行かなくては いけません。',
    options: ['より', 'まで', 'でも', 'までに'],
    correctIndex: 3,
    hint: 'Ngày mai tôi phải đến công ty trước 8 giờ.',
    explanation: '【Đáp án 4: までに】(Sách trang 233): Nまでに (hạn chót thực hiện hành động: trước 8 giờ).'
  },
  {
    id: 's500_q403',
    number: 403,
    sectionTitle: '第4週 2日目 [文字]',
    question: '薬を もらう ために、2週間に 1回、病院に 通って います。',
    options: ['とおって', 'うたって', 'かよって', 'おこなって'],
    correctIndex: 2,
    hint: 'Để lấy thuốc, cứ 2 tuần 1 lần tôi lại đến bệnh viện thăm khám.',
    explanation: '【Đáp án 3: かよって】(Sách trang 235): 通う (かよう: đi lại đều đặn đến nơi nào).'
  },
  {
    id: 's500_q404',
    number: 404,
    sectionTitle: '第4週 2日目 [語い]',
    question: '日本語は、前より＿＿＿分かる ように なりました。',
    options: ['きっと', 'かならず', 'もう', 'ずっと'],
    correctIndex: 3,
    hint: 'Tiếng Nhật tôi đã hiểu tốt hơn trước rất nhiều.',
    explanation: '【Đáp án 4: ずっと】(Sách trang 235): ずっと (hơn hẳn, nhiều hơn nhiều).'
  },
  {
    id: 's500_q405',
    number: 405,
    sectionTitle: '第4週 2日目 [文法]',
    question: '書ける ところ＿＿＿書きました。',
    options: ['ほど', 'だけ', 'ぐらい', 'ばかり'],
    correctIndex: 1,
    hint: 'Chỗ nào có thể viết được thì tôi chỉ viết mỗi chỗ đó thôi.',
    explanation: '【Đáp án 2: だけ】(Sách trang 235): だけ (chỉ).'
  }
];

// Unit 11: 第4週 3日目・4日目 (Q406 - Q435)
const q406_to_435 = [
  {
    id: 's500_q406',
    number: 406,
    sectionTitle: '第4週 3日目 [文字]',
    question: '工場を 建てる 計画が 中止に なった。',
    options: ['けかく', 'けいが', 'けいかく', 'けいがく'],
    correctIndex: 2,
    hint: 'Kế hoạch xây dựng nhà máy đã bị đình chỉ hủy bỏ.',
    explanation: '【Đáp án 3: けいかく】(Sách trang 237): 計画 (けいかく: kế hoạch).'
  },
  {
    id: 's500_q407',
    number: 407,
    sectionTitle: '第4週 3日目 [語い]',
    question: 'A「味、どう？」\nB「ちょっと 塩が＿＿＿と 思うよ。」',
    options: ['のこらない', 'たりない', '入れたい', 'あまる'],
    correctIndex: 1,
    hint: 'A: "Mùi vị thế nào?" B: "Tôi thấy hình như hơi thiếu muối."',
    explanation: '【Đáp án 2: たりない】(Sách trang 237): 足りない (たりない: không đủ, thiếu).'
  },
  {
    id: 's500_q408',
    number: 408,
    sectionTitle: '第4週 3日目 [文法]',
    question: '日本語の 勉強は＿＿＿、楽しい。',
    options: ['大変なけれど', '大変けれど', '大変だが', '大変なため'],
    correctIndex: 2,
    hint: 'Việc học tiếng Nhật tuy vất vả nhưng mà vui.',
    explanation: '【Đáp án 3: 大変だが】(Sách trang 237): Tính từ な + だが (tuy... nhưng mà...).'
  },
  {
    id: 's500_q409',
    number: 409,
    sectionTitle: '第4週 3日目 [文字]',
    question: '春と 秋に しあいが あります。',
    options: ['仕会', '試会', '仕合', '試合'],
    correctIndex: 3,
    hint: 'Vào mùa xuân và mùa thu đều có các trận thi đấu.',
    explanation: '【Đáp án 4: 試合】(Sách trang 239): 試合 (しあい: trận thi đấu).'
  },
  {
    id: 's500_q410',
    number: 410,
    sectionTitle: '第4週 3日目 [語い]',
    question: '夕飯は、いつも 何時ごろ＿＿＿。',
    options: ['めしあがりますか', 'おっしゃいますか', 'ごちそうしますか', 'まいりますか'],
    correctIndex: 0,
    hint: 'Cơm tối bình thường ngài dùng bữa lúc mấy giờ ạ?',
    explanation: '【Đáp án 1: めしあがりますか】(Sách trang 239): 召し上がる (tôn kính ngữ của 食べる / 飲む).'
  },
  {
    id: 's500_q411',
    number: 411,
    sectionTitle: '第4週 3日目 [文法]',
    question: '私の 家は、せまい＿＿＿、古い です。',
    options: ['し', 'と', 'で', 'か'],
    correctIndex: 0,
    hint: 'Nhà của tôi vừa chật hẹp, lại còn cũ kỹ nữa.',
    explanation: '【Đáp án 1: し】(Sách trang 239): 〜し、〜し (liệt kê lý do, tính chất song song).'
  },
  {
    id: 's500_q412',
    number: 412,
    sectionTitle: '第4週 3日目 [文字]',
    question: 'この 黄色い 薬は 寝る前に 飲んで ください。',
    options: ['きろい', 'くろい', 'くいろい', 'きいろい'],
    correctIndex: 3,
    hint: 'Viên thuốc màu vàng này xin hãy uống trước khi đi ngủ.',
    explanation: '【Đáp án 4: きいろい】(Sách trang 241): 黄色い (きいろい: màu vàng).'
  },
  {
    id: 's500_q413',
    number: 413,
    sectionTitle: '第4週 3日目 [語い]',
    question: 'A「母の 具合が 悪いんです。」\nB「それは＿＿＿。お大事に。」',
    options: ['ざんねんです', 'すごいです', 'いけませんね', 'すみません'],
    correctIndex: 2,
    hint: 'A: "Mẹ tôi đang không được khỏe." B: "Thế thì gay rồi/không được rồi. Chúc bác mau khỏe."',
    explanation: '【Đáp án 3: いけませんね】(Sách trang 241): それはいけませんね (thế thì không ổn rồi, thể hiện sự đồng cảm lo lắng khi người khác ốm).'
  },
  {
    id: 's500_q414',
    number: 414,
    sectionTitle: '第4週 3日目 [文法]',
    question: '私は 歌が 下手＿＿＿歌いたく ありません。',
    options: ['なので', 'ので', 'ながら', 'から'],
    correctIndex: 0,
    hint: 'Vì hát dở nên tôi chẳng muốn hát chút nào.',
    explanation: '【Đáp án 1: なので】(Sách trang 241): Tính từ な + なので (vì...).'
  },
  {
    id: 's500_q415',
    number: 415,
    sectionTitle: '第4週 4日目 [文字]',
    question: 'そんな 自転車は どこで うって いますか。',
    options: ['売って', '買って', '作って', '乗って'],
    correctIndex: 0,
    hint: 'Chiếc xe đạp như thế được bán ở đâu vậy?',
    explanation: '【Đáp án 1: 売って】(Sách trang 243): 売る (うる: bán).'
  },
  {
    id: 's500_q416',
    number: 416,
    sectionTitle: '第4週 4日目 [語い]',
    question: 'あの ホテルは＿＿＿しないと 泊まれませんよ。',
    options: ['けいかく', 'よてい', 'じゅんび', 'よやく'],
    correctIndex: 3,
    hint: 'Khách sạn đó nếu không đặt phòng trước thì không ở được đâu.',
    explanation: '【Đáp án 4: よやく】(Sách trang 243): 予約する (よやくする: đặt phòng, đặt chỗ).'
  },
  {
    id: 's500_q417',
    number: 417,
    sectionTitle: '第4週 4日目 [文法]',
    question: 'さっき 聞いた＿＿＿、もう 忘れて しまいました。',
    options: ['だけ', 'ので', 'から', 'のに'],
    correctIndex: 3,
    hint: 'Mới nghe lúc nãy vậy mà đã quên mất tiêu rồi.',
    explanation: '【Đáp án 4: のに】(Sách trang 243): 〜のに (thế mà, biểu thị sự bất mãn ngạc nhiên).'
  },
  {
    id: 's500_q418',
    number: 418,
    sectionTitle: '第4週 4日目 [文字]',
    question: '風が 強いので、運転に 注意して ください。',
    options: ['よわい', 'つよい', 'こわい', 'きつい'],
    correctIndex: 1,
    hint: 'Vì gió thổi rất mạnh nên hãy chú ý khi lái xe.',
    explanation: '【Đáp án 2: つよい】(Sách trang 245): 強い (つよい: mạnh mẽ).'
  },
  {
    id: 's500_q419',
    number: 419,
    sectionTitle: '第4週 4日目 [語い]',
    question: 'A「すみません。部長の カップを 割って しまいました。」\nB「ああ、そう…。＿＿＿。」',
    options: ['ごめんなさい', 'しかたが ないね', 'だめに なったよ', 'あぶないよ'],
    correctIndex: 1,
    hint: 'A: "Em xin lỗi. Em lỡ làm vỡ mất chiếc cốc của trưởng phòng rồi ạ." B: "À, thế à... Đành chịu thôi/Chẳng còn cách nào khác."',
    explanation: '【Đáp án 2: しかたが ないね】(Sách trang 245): 仕方がない (không còn cách nào khác, đành vậy).'
  },
  {
    id: 's500_q420',
    number: 420,
    sectionTitle: '第4週 4日目 [文法]',
    question: '地震は＿＿＿来るか 分からないから こわい。',
    options: ['いつ', 'いつか', 'いつでも', 'いつも'],
    correctIndex: 0,
    hint: 'Động đất thì không biết xảy đến khi nào nên rất đáng sợ.',
    explanation: '【Đáp án 1: いつ】(Sách trang 245): いつ〜か分からない (không biết khi nào).'
  },
  {
    id: 's500_q421',
    number: 421,
    sectionTitle: '第4週 4日目 [文字]',
    question: '父は 毎晩、少し お酒を 飲んで 寝ます。',
    options: ['おこめ', 'おなべ', 'おつり', 'おさけ'],
    correctIndex: 3,
    hint: 'Bố tôi mỗi tối uống một chút rượu rồi đi ngủ.',
    explanation: '【Đáp án 4: おさけ】(Sách trang 247): お酒 (おさけ: rượu).'
  },
  {
    id: 's500_q422',
    number: 422,
    sectionTitle: '第4週 4日目 [語い]',
    question: 'A「いっしょに 行って くださいませんか。」\nB「ええ、＿＿＿。」',
    options: ['よろこんで', 'たのしんで', 'わすれないで', 'おかげさまで'],
    correctIndex: 0,
    hint: 'A: "Bạn có thể đi cùng với tôi được không?" B: "Vâng, tôi rất sẵn lòng ạ."',
    explanation: '【Đáp án 1: よろこんで】(Sách trang 247): 喜んで (よろこんで: tôi rất vui lòng/sẵn lòng đồng ý).'
  },
  {
    id: 's500_q423',
    number: 423,
    sectionTitle: '第4週 4日目 [文法]',
    question: '祖父が 急に 死んだ＿＿＿知らせが あった。',
    options: ['そうな', 'という', 'ようの', 'の'],
    correctIndex: 1,
    hint: 'Có tin báo rằng ông nội tôi đã đột ngột qua đời.',
    explanation: '【Đáp án 2: という】(Sách trang 247): 〜という知らせ (thông báo rằng là...).'
  },
  {
    id: 's500_q424',
    number: 424,
    sectionTitle: '第4週 4日目 [文字]',
    question: 'ならった 後で 試験を 受けました。',
    options: ['習った', '教った', '学った', '考った'],
    correctIndex: 0,
    hint: 'Sau khi học xong tôi đã tham gia kỳ thi.',
    explanation: '【Đáp án 1: 習った】(Sách trang 249): 習う (ならう: học tập).'
  },
  {
    id: 's500_q425',
    number: 425,
    sectionTitle: '第4週 4日目 [語い]',
    question: 'これは、ずいぶん＿＿＿の 話です。',
    options: ['ひさしぶり', 'このあいだ', 'むかし', 'このごろ'],
    correctIndex: 2,
    hint: 'Đây là câu chuyện từ ngày xửa ngày xưa rất lâu rồi.',
    explanation: '【Đáp án 3: むかし】(Sách trang 249): 昔 (むかし: ngày xưa).'
  },
  {
    id: 's500_q426',
    number: 426,
    sectionTitle: '第4週 4日目 [文法]',
    question: 'ゆうべ、電気を＿＿＿寝て しまった。',
    options: ['つければ', 'つけて みて', 'つけて おき', 'つけた まま'],
    correctIndex: 3,
    hint: 'Tối qua tôi đã để nguyên đèn bật sáng mà ngủ quên mất.',
    explanation: '【Đáp án 4: つけた まま】(Sách trang 249): Vた + まま (giữ nguyên trạng thái mà làm việc khác).'
  },
  {
    id: 's500_q427',
    number: 427,
    sectionTitle: '第4週 4日目 [文字]',
    question: 'この 時代の 小説の 文章は 読みにくい。',
    options: ['じだい', 'じたい', 'しだい', 'じでい'],
    correctIndex: 0,
    hint: 'Văn phong tiểu thuyết của thời đại này rất khó đọc.',
    explanation: '【Đáp án 1: じだい】(Sách trang 251): 時代 (じだい: thời đại).'
  },
  {
    id: 's500_q428',
    number: 428,
    sectionTitle: '第4週 4日目 [語い]',
    question: '＿＿＿しないで めしあがって ください。',
    options: ['けっこう', 'えんりょ', 'そんけい', 'ていねい'],
    correctIndex: 1,
    hint: 'Xin đừng ngần ngại, cứ tự nhiên dùng bữa đi ạ.',
    explanation: '【Đáp án 2: えんりょ】(Sách trang 251): 遠慮しないで (đừng khách sáo/ngại ngùng).'
  },
  {
    id: 's500_q429',
    number: 429,
    sectionTitle: '第4週 4日目 [文法]',
    question: '辞書を＿＿＿日本語の 本を 読みたい。',
    options: ['使わずで', '使わずに', '使って ないで', '使わない ようで'],
    correctIndex: 1,
    hint: 'Tôi muốn đọc sách tiếng Nhật mà không cần dùng đến từ điển.',
    explanation: '【Đáp án 2: 使わずに】(Sách trang 251): Vずに = Vないで (mà không làm gì).'
  },
  {
    id: 's500_q430',
    number: 430,
    sectionTitle: '第4週 4日目 [文字]',
    question: 'くらい 空に 星が ひかって いる。',
    options: ['黒い', '天い', '夜い', '暗い'],
    correctIndex: 3,
    hint: 'Trên bầu trời tối tăm những vì sao đang lấp lánh tỏa sáng.',
    explanation: '【Đáp án 4: 暗い】(Sách trang 253): 暗い (くらい: tối, u tối).'
  },
  {
    id: 's500_q431',
    number: 431,
    sectionTitle: '第4週 4日目 [語い]',
    question: '＿＿＿日本語が 話せませんでした。',
    options: ['はじめは', 'はじめて', 'はじめに', 'はじまって'],
    correctIndex: 0,
    hint: 'Ban đầu tôi không nói được tiếng Nhật.',
    explanation: '【Đáp án 1: はじめは】(Sách trang 253): 初めは (ban đầu thì...).'
  },
  {
    id: 's500_q432',
    number: 432,
    sectionTitle: '第4週 4日目 [文法]',
    question: '今日は 一日中 寒くて、＿＿＿。',
    options: ['冬だようです', '冬だそうです', '冬の ようでした', '冬の みたいでした'],
    correctIndex: 2,
    hint: 'Hôm nay cả ngày trời lạnh, cứ như thể là mùa đông vậy.',
    explanation: '【Đáp án 3: 冬の ようでした】(Sách trang 253): Nのようでした (cứ như là...).'
  },
  {
    id: 's500_q433',
    number: 433,
    sectionTitle: '第4週 4日目 [文字]',
    question: '部長の となりに 座って いる 人は 奥さんです。',
    options: ['さわって', 'そわって', 'しわって', 'すわって'],
    correctIndex: 3,
    hint: 'Người đang ngồi cạnh trưởng phòng là phu nhân của ông ấy.',
    explanation: '【Đáp án 4: すわって】(Sách trang 255): 座る (すわる: ngồi).'
  },
  {
    id: 's500_q434',
    number: 434,
    sectionTitle: '第4週 4日目 [語い]',
    question: '＿＿＿だめでしたか。残念です。',
    options: ['やっぱり', 'やっと', 'きっと', 'かならず'],
    correctIndex: 0,
    hint: 'Quả nhiên là không được à? Tiếc thật đấy.',
    explanation: '【Đáp án 1: やっぱり】(Sách trang 255): やっぱり (quả đúng như dự đoán).'
  },
  {
    id: 's500_q435',
    number: 435,
    sectionTitle: '第4週 4日目 [文法]',
    question: 'A「一郎、まだ 起きて いるかな。」\nB「部屋の 電気が 消えて いるから、もう＿＿＿だよ。」',
    options: ['寝るそう', '寝たよう', '寝そう', '寝よう'],
    correctIndex: 1,
    hint: 'A: "Không biết Ichiro còn thức không nhỉ." B: "Đèn phòng tắt rồi nên hình như cậu ấy ngủ rồi đấy."',
    explanation: '【Đáp án 2: 寝たよう】(Sách trang 255): 〜ようだ (suy đoán dựa trên quan sát thị giác: dường như đã ngủ).'
  }
];

// Unit 12: 第4週 5日目〜7日目 (Q436 - Q500)
const q436_to_500 = [
  {
    id: 's500_q436',
    number: 436,
    sectionTitle: '第4週 5日目 [文字]',
    question: '主人は 野菜しか 食べません。',
    options: ['やそい', 'やさい', 'やせい', 'やすい'],
    correctIndex: 1,
    hint: 'Chồng tôi chỉ ăn mỗi rau thôi.',
    explanation: '【Đáp án 2: やさい】(Sách trang 257): 野菜 (やさい: rau củ).'
  },
  {
    id: 's500_q437',
    number: 437,
    sectionTitle: '第4週 5日目 [語い]',
    question: '＿＿＿ください。この 病気は すぐに なお りますよ。',
    options: ['びっくりして', 'おどろいて', 'しんじないで', 'あんしんして'],
    correctIndex: 3,
    hint: 'Xin hãy yên tâm. Bệnh này sẽ khỏi ngay thôi mà.',
    explanation: '【Đáp án 4: あんしんして】(Sách trang 257): 安心する (あんしんする: an tâm).'
  },
  {
    id: 's500_q438',
    number: 438,
    sectionTitle: '第4週 5日目 [文法]',
    question: '空が 明るく なって きた。もうすぐ 雨が＿＿＿。',
    options: ['やみそうだ', 'やむそうだ', 'やんでそうだ', 'やめそうだ'],
    correctIndex: 0,
    hint: 'Bầu trời đã sáng dần lên rồi. Mưa sắp tạnh rồi đấy.',
    explanation: '【Đáp án 1: やみそうだ】(Sách trang 257): V(bỏ ます) + そうだ (sắp sửa xảy ra).'
  },
  {
    id: 's500_q439',
    number: 439,
    sectionTitle: '第4週 5日目 [文字]',
    question: 'どんな 作文を 書くか かんがえて います。',
    options: ['思えて', '研えて', '究えて', '考えて'],
    correctIndex: 3,
    hint: 'Tôi đang suy nghĩ xem nên viết bài văn như thế nào.',
    explanation: '【Đáp án 4: 考えて】(Sách trang 259): 考える (かんがえる: suy nghĩ).'
  },
  {
    id: 's500_q440',
    number: 440,
    sectionTitle: '第4週 5日目 [語い]',
    question: 'この 答えは 本当に＿＿＿でしょうか。',
    options: ['ただしい', 'やさしい', 'あう', 'ちょうどいい'],
    correctIndex: 0,
    hint: 'Câu trả lời này liệu có thực sự chính xác không nhỉ?',
    explanation: '【Đáp án 1: ただしい】(Sách trang 259): 正しい (ただしい: đúng đắn, chính xác).'
  },
  {
    id: 's500_q441',
    number: 441,
    sectionTitle: '第4週 5日目 [文法]',
    question: 'A「田中さん、明日は＿＿＿ですよ。」\nB「ああ、そう 言って いましたね。」',
    options: ['休みよう', '休むそう', '休みたい', '休みそう'],
    correctIndex: 1,
    hint: 'A: "Nghe nói anh Tanaka ngày mai nghỉ đấy." B: "À, anh ấy có nói thế thật nhỉ."',
    explanation: '【Đáp án 2: 休むそう】(Sách trang 259): V(thể thường) + そうだ (nghe nói là...).'
  },
  {
    id: 's500_q442',
    number: 442,
    sectionTitle: '第4週 5日目 [文字]',
    question: '台所で 料理を します。',
    options: ['たいところ', 'たいしょ', 'だいじょ', 'だいどころ'],
    correctIndex: 3,
    hint: 'Nấu ăn trong nhà bếp.',
    explanation: '【Đáp án 4: だいどころ】(Sách trang 261): 台所 (だいどころ: nhà bếp).'
  },
  {
    id: 's500_q443',
    number: 443,
    sectionTitle: '第4週 5日目 [語い]',
    question: '急がないと 会議に＿＿＿よ。',
    options: ['おそくなります', 'おくれます', 'まてません', 'まにあいます'],
    correctIndex: 1,
    hint: 'Nếu không khẩn trương thì sẽ bị muộn cuộc họp đấy.',
    explanation: '【Đáp án 2: おくれます】(Sách trang 261): 遅れる (おくれる: trễ, muộn).'
  },
  {
    id: 's500_q444',
    number: 444,
    sectionTitle: '第4週 5日目 [文法]',
    question: '来年、父と 母が 日本に＿＿＿。',
    options: ['来る ようだろう', '来る かもしれない', '来る みたいだろう', '来る そうかもしれない'],
    correctIndex: 1,
    hint: 'Năm sau có lẽ bố mẹ tôi sẽ sang Nhật Bản.',
    explanation: '【Đáp án 2: 来る かもしれない】(Sách trang 261): 〜かもしれない (có lẽ, có thể).'
  },
  {
    id: 's500_q445',
    number: 445,
    sectionTitle: '第4週 5日目 [文字]',
    question: 'フライパンを ひに かけて、肉を やきます。',
    options: ['水', '木', '土', '火'],
    correctIndex: 3,
    hint: 'Đặt chảo lên ngọn lửa rồi nướng thịt.',
    explanation: '【Đáp án 4: 火】(Sách trang 263): 火 (ひ: ngọn lửa).'
  },
  {
    id: 's500_q446',
    number: 446,
    sectionTitle: '第4週 5日目 [語い]',
    question: '田中さん、＿＿＿よく 遅刻 しますね。',
    options: ['さいきん', 'さっき', 'しばらく', 'こんど'],
    correctIndex: 0,
    hint: 'Anh Tanaka dạo gần đây hay đi muộn nhỉ.',
    explanation: '【Đáp án 1: さいきん】(Sách trang 263): 最近 (さいきん: gần đây).'
  },
  {
    id: 's500_q447',
    number: 447,
    sectionTitle: '第4週 5日目 [文法]',
    question: 'A「あなた、今日も 遅く なるの？」\nB「いや、早く 帰る＿＿＿。」',
    options: ['みたいだ', 'ようだ', 'つもりだ', 'らしい'],
    correctIndex: 2,
    hint: 'A: "Hôm nay anh lại về muộn à?" B: "Không, anh định về sớm mà."',
    explanation: '【Đáp án 3: つもりだ】(Sách trang 263): Vる + つもりだ (dự định của bản thân).'
  },
  {
    id: 's500_q448',
    number: 448,
    sectionTitle: '第4週 6日目 [文字]',
    question: '子どもの ときは 体が 弱かったです。',
    options: ['からだ', 'かだら', 'かなだ', 'かだな'],
    correctIndex: 0,
    hint: 'Hồi còn nhỏ cơ thể tôi rất yếu ớt.',
    explanation: '【Đáp án 1: からだ】(Sách trang 265): 体 (からだ: cơ thể).'
  },
  {
    id: 's500_q449',
    number: 449,
    sectionTitle: '第4週 6日目 [語い]',
    question: 'では、明日の 4時ごろ 事務所で＿＿＿。',
    options: ['ごらんに なります', 'おいでに なります', 'おまちして います', 'いらっしゃいます'],
    correctIndex: 2,
    hint: 'Vậy thì vào khoảng 4 giờ chiều mai tôi xin được đón đợi ngài tại văn phòng ạ.',
    explanation: '【Đáp án 3: おまちして います】(Sách trang 265): お待ちしています (khiêm nhường ngữ).'
  },
  {
    id: 's500_q450',
    number: 450,
    sectionTitle: '第4週 6日目 [文法]',
    question: '田中さんは、もう 大学を 出て 働いて いる＿＿＿だ。',
    options: ['つもり', 'らしい', 'かもしれない', 'はず'],
    correctIndex: 3,
    hint: 'Anh Tanaka chắc chắn là đã tốt nghiệp đại học và đang đi làm rồi.',
    explanation: '【Đáp án 4: はず】(Sách trang 265): 〜はずだ (chắc chắn dựa trên căn cứ hợp lý).'
  },
  {
    id: 's500_q451',
    number: 451,
    sectionTitle: '第4週 6日目 [文字]',
    question: 'それと これは 同じ 場所の 写真ですね。',
    options: ['しゃじん', 'しゃしん', 'ちゃしん', 'じゃしん'],
    correctIndex: 1,
    hint: 'Bức ảnh đó và bức này là cùng chụp ở một địa điểm nhỉ.',
    explanation: '【Đáp án 2: しゃしん】(Sách trang 267): 写真 (しゃしん: bức ảnh).'
  },
  {
    id: 's500_q452',
    number: 452,
    sectionTitle: '第4週 6日目 [語い]',
    question: '動物を＿＿＿いけません。',
    options: ['こわしては', 'しんでは', 'なくしては', 'いじめては'],
    correctIndex: 3,
    hint: 'Không được bắt nạt ngược đãi động vật.',
    explanation: '【Đáp án 4: いじめては】(Sách trang 267): 苛める (いじめる: bắt nạt, hành hạ).'
  },
  {
    id: 's500_q453',
    number: 453,
    sectionTitle: '第4週 6日目 [文法]',
    question: '田中さんが そんな ことを＿＿＿。',
    options: ['言う はずが ない', '言う つもりは ない', '言う らしくない', '言う ようでは ない'],
    correctIndex: 0,
    hint: 'Người như Tanaka không đời nào lại nói ra những lời như thế.',
    explanation: '【Đáp án 1: 言う はずが ない】(Sách trang 267): 〜はずがない (tuyệt đối không thể nào có chuyện...).'
  },
  {
    id: 's500_q454',
    number: 454,
    sectionTitle: '第4週 6日目 [文字]',
    question: 'この 和室の 雨戸は 古くて 重いので しめるのに 力が いります。',
    options: ['開める', '引める', '押める', '閉める'],
    correctIndex: 3,
    hint: 'Cửa chớp phòng kiểu Nhật này cũ và nặng nên đóng vào cần nhiều sức.',
    explanation: '【Đáp án 4: 閉める】(Sách trang 269): 閉める (しめる: đóng).'
  },
  {
    id: 's500_q455',
    number: 455,
    sectionTitle: '第4週 6日目 [語い]',
    question: '＿＿＿寒くなって きましたね。',
    options: ['だいたい', 'ずいぶん', 'たいてい', 'きっと'],
    correctIndex: 1,
    hint: 'Trời đã trở nên lạnh hơn khá nhiều rồi nhỉ.',
    explanation: '【Đáp án 2: ずいぶん】(Sách trang 269): ずいぶん (khá là, tương đối nhiều).'
  },
  {
    id: 's500_q456',
    number: 456,
    sectionTitle: '第4週 6日目 [文法]',
    question: '毎日 子どもに、車に＿＿＿言って います。',
    options: ['気を つけるかと', '気を つける ように', '気を つけようと して', '気を つける ようだと'],
    correctIndex: 1,
    hint: 'Hàng ngày tôi đều dặn các con chú ý cẩn thận xe cộ.',
    explanation: '【Đáp án 2: 気を つける ように】(Sách trang 269): 〜ように言う (truyền đạt lời căn dặn).'
  },
  {
    id: 's500_q457',
    number: 457,
    sectionTitle: '第4週 6日目 [文字]',
    question: 'うちの 犬は 毎朝 新聞を 取って 来て くれます。',
    options: ['もって', 'とって', 'つって', 'そって'],
    correctIndex: 1,
    hint: 'Chú chó nhà tôi mỗi sáng đều lấy báo mang lại cho tôi.',
    explanation: '【Đáp án 2: とって】(Sách trang 271): 取る (とる: lấy, ngậm lấy).'
  },
  {
    id: 's500_q458',
    number: 458,
    sectionTitle: '第4週 6日目 [語い]',
    question: '今日は、一日＿＿＿、雨が ふって いました。',
    options: ['かん', 'ちゅう', 'くらい', 'じゅう'],
    correctIndex: 3,
    hint: 'Hôm nay suốt cả một ngày trời đều mưa.',
    explanation: '【Đáp án 4: じゅう】(Sách trang 271): 一日中 (いちにちじゅう: suốt cả ngày).'
  },
  {
    id: 's500_q459',
    number: 459,
    sectionTitle: '第4週 6日目 [文法]',
    question: '毎朝、コップ 1杯の 水を＿＿＿。',
    options: ['飲む ように して います', '飲むだろうと 思います', '飲もうと して います', '飲む ことを 思います'],
    correctIndex: 0,
    hint: 'Mỗi sáng tôi đều cố gắng tạo thói quen uống 1 ly nước đầy.',
    explanation: '【Đáp án 1: 飲む ように して います】(Sách trang 271): 〜ようにしている (cố gắng duy trì một thói quen tốt).'
  },
  {
    id: 's500_q460',
    number: 460,
    sectionTitle: '第4週 6日目 [文字]',
    question: 'その 真ん中の 黒い ボタンを おして ください。',
    options: ['押して', '貸して', '足して', '出して'],
    correctIndex: 0,
    hint: 'Hãy ấn vào nút màu đen ở chính giữa đó.',
    explanation: '【Đáp án 1: 押して】(Sách trang 273): 押す (おす: ấn, bấm).'
  },
  {
    id: 's500_q461',
    number: 461,
    sectionTitle: '第4週 6日目 [語い]',
    question: 'A「先日は、ありがとう ございました。」\nB「＿＿＿。」',
    options: ['おかげさまで', 'こちらこそ', 'おきのどくに', 'ごめんください'],
    correctIndex: 1,
    hint: 'A: "Hôm trước thật sự cảm ơn anh rất nhiều." B: "Chính tôi mới là người phải cảm ơn ạ."',
    explanation: '【Đáp án 2: こちらこそ】(Sách trang 273): こちらこそ (chính chúng tôi/tôi mới phải thế).'
  },
  {
    id: 's500_q462',
    number: 462,
    sectionTitle: '第4週 6日目 [文法]',
    question: '毎日 練習して、だんだん＿＿＿。',
    options: ['話せるかもしれない', '話せない はずが ない', '話せる ように して きた', '話せる ように なって きた'],
    correctIndex: 3,
    hint: 'Luyện tập mỗi ngày nên dần dần tôi đã có thể nói được.',
    explanation: '【Đáp án 4: 話せる ように なって きた】(Sách trang 273): 〜ようになってきた (dần dần biến đổi đạt được khả năng mới).'
  },
  {
    id: 's500_q463',
    number: 463,
    sectionTitle: '第4週 6日目 [文字]',
    question: '一人じゃ 重いので、ちょっと 手を 貸して ください。',
    options: ['かして', 'だして', 'たして', 'さして'],
    correctIndex: 0,
    hint: 'Một người thì nặng quá, hãy giúp tôi một tay với.',
    explanation: '【Đáp án 1: かして】(Sách trang 275): 貸す (かす) -> 手を貸す (giúp một tay).'
  },
  {
    id: 's500_q464',
    number: 464,
    sectionTitle: '第4週 6日目 [語い]',
    question: 'A「ごはん、まだ？」\nB「あと ちょっとで＿＿＿よ。」',
    options: ['うまい', 'やれる', 'できる', 'あがる'],
    correctIndex: 2,
    hint: 'A: "Cơm vẫn chưa xong à?" B: "Còn một chút nữa là xong ngay rồi đấy."',
    explanation: '【Đáp án 3: できる】(Sách trang 275): ごはんができる (cơm nấu xong).'
  },
  {
    id: 's500_q465',
    number: 465,
    sectionTitle: '第4週 6日目 [文法]',
    question: '映画は 今＿＿＿。',
    options: ['始まる ように なった', '始まって いる ときだ', '始まった ところだ', '始まった ままだ'],
    correctIndex: 2,
    hint: 'Bộ phim vừa mới bắt đầu xong tức thì.',
    explanation: '【Đáp án 3: 始まった ところだ】(Sách trang 275): Vた + ところだ (vừa mới làm gì xong tức thì).'
  },
  // Day 7 Review (Q466 - Q500)
  {
    id: 's500_q466',
    number: 466,
    sectionTitle: '第4週 7日目 [文字]',
    question: '風邪で 学校を 休む。',
    options: ['ふぜ', 'かぜ'],
    correctIndex: 1,
    hint: 'Nghỉ học vì bị cảm cúm.',
    explanation: '【Đáp án 2: かぜ】(Sách trang 276): 風邪 (かぜ: bệnh cảm).'
  },
  {
    id: 's500_q467',
    number: 467,
    sectionTitle: '第4週 7日目 [文字]',
    question: 'たいふうで 天気が 悪いです。',
    options: ['大風', '台風'],
    correctIndex: 1,
    hint: 'Thời tiết xấu vì có bão.',
    explanation: '【Đáp án 2: 台風】(Sách trang 276): 台風 (たいふう: cơn bão).'
  },
  {
    id: 's500_q468',
    number: 468,
    sectionTitle: '第4週 7日目 [語い]',
    question: '田中さんが 亡くなったと 聞いて、すごく＿＿＿。',
    options: ['びっくりした', 'しんじない'],
    correctIndex: 0,
    hint: 'Nghe tin Tanaka qua đời tôi đã vô cùng bàng hoàng sửng sốt.',
    explanation: '【Đáp án 1: びっくりした】(Sách trang 276): びっくりした (giật mình, bàng hoàng).'
  },
  {
    id: 's500_q469',
    number: 469,
    sectionTitle: '第4週 7日目 [語い]',
    question: 'お湯を わかして ください。',
    options: ['はじめに', 'はじめて'],
    correctIndex: 0,
    hint: 'Đầu tiên hãy đun sôi nước nhé.',
    explanation: '【Đáp án 1: はじめに】(Sách trang 276): 初めに (trước tiên, đầu tiên).'
  },
  {
    id: 's500_q470',
    number: 470,
    sectionTitle: '第4週 7日目 [文法]',
    question: '＿＿＿赤ちゃんですね。',
    options: ['元気そうな', '元気だ そうな'],
    correctIndex: 0,
    hint: 'Một em bé trông có vẻ thật khỏe khoắn nhỉ.',
    explanation: '【Đáp án 1: 元気そうな】(Sách trang 276): Tính từ な + そうなN (trông có vẻ...).'
  },
  {
    id: 's500_q471',
    number: 471,
    sectionTitle: '第4週 7日目 [文法]',
    question: 'ここは、くつを＿＿＿上がって ください。',
    options: ['はいて まま', 'はいた まま'],
    correctIndex: 1,
    hint: 'Chỗ này xin hãy cứ đi nguyên giày mà bước lên.',
    explanation: '【Đáp án 2: はいた まま】(Sách trang 276): Vた + まま (giữ nguyên).'
  },
  {
    id: 's500_q472',
    number: 472,
    sectionTitle: '第4週 7日目 [文字]',
    question: 'この 道は 今、通れません。',
    options: ['かよれません', 'とおれません'],
    correctIndex: 1,
    hint: 'Con đường này bây giờ không thể đi qua được.',
    explanation: '【Đáp án 2: とおれません】(Sách trang 277): 通る (とおる) -> 通れる.'
  },
  {
    id: 's500_q473',
    number: 473,
    sectionTitle: '第4週 7日目 [文字]',
    question: 'ガスの ひを 止めて ください。',
    options: ['水', '火'],
    correctIndex: 1,
    hint: 'Hãy tắt lửa bếp ga đi.',
    explanation: '【Đáp án 2: 火】(Sách trang 277): 火 (ひ: lửa).'
  },
  {
    id: 's500_q474',
    number: 474,
    sectionTitle: '第4週 7日目 [語い]',
    question: '＿＿＿どこの 家にも テレビが あります。',
    options: ['まだ', 'たいてい'],
    correctIndex: 1,
    hint: 'Hầu như ở bất kỳ ngôi nhà nào cũng đều có tivi.',
    explanation: '【Đáp án 2: たいてい】(Sách trang 277): たいてい (hầu hết, đại đa số).'
  },
  {
    id: 's500_q475',
    number: 475,
    sectionTitle: '第4週 7日目 [語い]',
    question: 'テレビの ニュースを 見て＿＿＿、そのことを 知った。',
    options: ['はじめて', 'はじまって'],
    correctIndex: 0,
    hint: 'Sau khi xem tin tức trên tivi tôi mới lần đầu biết việc đó.',
    explanation: '【Đáp án 1: はじめて】(Sách trang 277): 〜てはじめて (chỉ sau khi... mới...).'
  },
  {
    id: 's500_q476',
    number: 476,
    sectionTitle: '第4週 7日目 [文法]',
    question: '漢字は 書かない＿＿＿おぼえられません。',
    options: ['と', 'ば'],
    correctIndex: 0,
    hint: 'Chữ Hán nếu không viết thì không thể nào nhớ được.',
    explanation: '【Đáp án 1: と】(Sách trang 277): 〜ないと〜られない (nếu không... thì không thể).'
  },
  {
    id: 's500_q477',
    number: 477,
    sectionTitle: '第4週 7日目 [文法]',
    question: '書ける ところ＿＿＿書いて ください。',
    options: ['だけ', 'ぐらい'],
    correctIndex: 0,
    hint: 'Chỗ nào viết được thì xin hãy cứ viết mỗi chỗ đó thôi.',
    explanation: '【Đáp án 1: だけ】(Sách trang 277): だけ (chỉ).'
  },
  {
    id: 's500_q478',
    number: 478,
    sectionTitle: '第4週 7日目 [文字]',
    question: '試合は どうでしたか。',
    options: ['しあい', 'しごう'],
    correctIndex: 0,
    hint: 'Trận đấu kết quả thế nào rồi?',
    explanation: '【Đáp án 1: しあい】(Sách trang 278): 試合 (しあい: trận đấu).'
  },
  {
    id: 's500_q479',
    number: 479,
    sectionTitle: '第4週 7日目 [文字]',
    question: 'こころから そう 思います。',
    options: ['心', '頭'],
    correctIndex: 0,
    hint: 'Tôi thực lòng từ tận đáy lòng nghĩ như thế.',
    explanation: '【Đáp án 1: 心】(Sách trang 278): 心 (こころ: trái tim, tấm lòng).'
  },
  {
    id: 's500_q480',
    number: 480,
    sectionTitle: '第4週 7日目 [語い]',
    question: '先生は まだ それを＿＿＿いません。',
    options: ['ごらんになって', 'はいけんして'],
    correctIndex: 0,
    hint: 'Thầy giáo vẫn chưa xem tài liệu đó ạ.',
    explanation: '【Đáp án 1: ごらんになって】(Sách trang 278): ご覧になる (tôn kính ngữ của 見る).'
  },
  {
    id: 's500_q481',
    number: 481,
    sectionTitle: '第4週 7日目 [語い]',
    question: '旅行の 計画が＿＿＿残念です。',
    options: ['いやに なって', 'だめに なって'],
    correctIndex: 1,
    hint: 'Kế hoạch chuyến du lịch bị đổ bể hỏng mất nên thật tiếc.',
    explanation: '【Đáp án 2: だめに なって】(Sách trang 278): だめになる (bị hỏng, đổ bể).'
  },
  {
    id: 's500_q482',
    number: 482,
    sectionTitle: '第4週 7日目 [文法]',
    question: '駅前の レストランは とても＿＿＿です。',
    options: ['おいしそう', 'おいしいそう'],
    correctIndex: 0,
    hint: 'Nhà hàng trước ga trông có vẻ rất ngon miệng.',
    explanation: '【Đáp án 1: おいしそう】(Sách trang 278): A(bỏ い) + そう (trông có vẻ ngon).'
  },
  {
    id: 's500_q483',
    number: 483,
    sectionTitle: '第4週 7日目 [文法]',
    question: '間違った＿＿＿、消しゴムで 消しました。',
    options: ['ので', 'のに'],
    correctIndex: 0,
    hint: 'Vì bị viết sai nên tôi đã lấy tẩy xóa đi.',
    explanation: '【Đáp án 1: ので】(Sách trang 278): 〜ので (vì... nguyên nhân hệ quả rõ ràng).'
  },
  {
    id: 's500_q484',
    number: 484,
    sectionTitle: '第4週 7日目 [文字]',
    question: 'この 料理の 味が 好きです。',
    options: ['あじ', 'だし'],
    correctIndex: 0,
    hint: 'Tôi thích mùi vị của món ăn này.',
    explanation: '【Đáp án 1: あじ】(Sách trang 279): 味 (あじ: mùi vị).'
  },
  {
    id: 's500_q485',
    number: 485,
    sectionTitle: '第4週 7日目 [文字]',
    question: '雨が ふって きた。',
    options: ['降って', '下って'],
    correctIndex: 0,
    hint: 'Trời đã đổ mưa rơi xuống.',
    explanation: '【Đáp án 1: 降って】(Sách trang 279): 降る (ふる: mưa rơi).'
  },
  {
    id: 's500_q486',
    number: 486,
    sectionTitle: '第4週 7日目 [語い]',
    question: '友だちに 本を 貸して あげたら＿＿＿に お菓子を くれた。',
    options: ['おいわい', 'おれい'],
    correctIndex: 1,
    hint: 'Cho bạn mượn sách thì bạn ấy đã tặng bánh kẹo để cảm ơn.',
    explanation: '【Đáp án 2: おれい】(Sách trang 279): お礼 (おれい: quà cảm ơn).'
  },
  {
    id: 's500_q487',
    number: 487,
    sectionTitle: '第4週 7日目 [語い]',
    question: 'この 荷物、いつ＿＿＿か。',
    options: ['とどきました', 'うごきました'],
    correctIndex: 0,
    hint: 'Kiện hàng này đã được chuyển đến từ lúc nào thế?',
    explanation: '【Đáp án 1: とどきました】(Sách trang 279): 届く (とどく: hàng hóa chuyển tới nơi).'
  },
  {
    id: 's500_q488',
    number: 488,
    sectionTitle: '第4週 7日目 [文法]',
    question: '田中さんは 女の人＿＿＿しゃべり方を する。',
    options: ['みたいな', 'ような'],
    correctIndex: 0,
    hint: 'Tanaka có cách nói chuyện hệt như một người phụ nữ.',
    explanation: '【Đáp án 1: みたいな】(Sách trang 279): Nみたいな + N (giống hệt như là...).'
  },
  {
    id: 's500_q489',
    number: 489,
    sectionTitle: '第4週 7日目 [文法]',
    question: 'レポートは、来週の 金曜日＿＿＿出して ください。',
    options: ['まで', 'までに'],
    correctIndex: 1,
    hint: 'Báo cáo xin hãy nộp trước thứ Sáu tuần sau.',
    explanation: '【Đáp án 2: までに】(Sách trang 279): 〜までに (hạn chót hoàn thành).'
  },
  {
    id: 's500_q490',
    number: 490,
    sectionTitle: '第4週 7日目 [文字]',
    question: '文字を もう 少し 大きく しましょう。',
    options: ['もじ', 'ぶんじ'],
    correctIndex: 0,
    hint: 'Chúng ta hãy chỉnh cỡ chữ to hơn một chút nhé.',
    explanation: '【Đáp án 1: もじ】(Sách trang 280): 文字 (もじ: mặt chữ, ký tự).'
  },
  {
    id: 's500_q491',
    number: 491,
    sectionTitle: '第4週 7日目 [文字]',
    question: 'パスポートは ひきだしの 中です。',
    options: ['引き出し', '押し出し'],
    correctIndex: 0,
    hint: 'Hộ chiếu ở bên trong ngăn kéo.',
    explanation: '【Đáp án 1: 引き出し】(Sách trang 280): 引き出し (ひきだし: ngăn kéo tủ).'
  },
  {
    id: 's500_q492',
    number: 492,
    sectionTitle: '第4週 7日目 [語い]',
    question: '私は、ある 先生を たいへん＿＿＿して います。',
    options: ['そんけい', 'えんりょ'],
    correctIndex: 0,
    hint: 'Tôi rất mực tôn kính một vị thầy giáo.',
    explanation: '【Đáp án 1: そんけい】(Sách trang 280): 尊敬する (そんけいする: tôn kính).'
  },
  {
    id: 's500_q493',
    number: 493,
    sectionTitle: '第4週 7日目 [語い]',
    question: '長い 時間が かかったけれど、家が＿＿＿完成した。',
    options: ['ずっと', 'やっと'],
    correctIndex: 1,
    hint: 'Tuy tốn nhiều thời gian nhưng cuối cùng ngôi nhà cũng hoàn thành.',
    explanation: '【Đáp án 2: やっと】(Sách trang 280): やっと (cuối cùng thì sau nhiều nỗ lực vất vả).'
  },
  {
    id: 's500_q494',
    number: 494,
    sectionTitle: '第4週 7日目 [文法]',
    question: 'できるだけ 野菜を 食べる ように＿＿＿。',
    options: ['して います', 'なって います'],
    correctIndex: 0,
    hint: 'Tôi đang cố gắng hết sức để ăn nhiều rau.',
    explanation: '【Đáp án 1: して います】(Sách trang 280): 〜ようにしている (nỗ lực duy trì thói quen cá nhân).'
  },
  {
    id: 's500_q495',
    number: 495,
    sectionTitle: '第4週 7日目 [文法]',
    question: 'ひらがなも よく 読めないのに、漢字が 読める＿＿＿。',
    options: ['つもりが ない', 'はずが ない'],
    correctIndex: 1,
    hint: 'Đến chữ Hiragana còn chưa đọc rành thì làm sao mà đọc được chữ Hán chứ.',
    explanation: '【Đáp án 2: はずが ない】(Sách trang 280): 〜はずがない (làm sao mà... được chứ, phủ định hoàn toàn).'
  },
  {
    id: 's500_q496',
    number: 496,
    sectionTitle: '第4週 7日目 [文字]',
    question: 'あの 男の 人は ちから持ちだ。',
    options: ['力', '刀'],
    correctIndex: 0,
    hint: 'Người đàn ông kia rất khỏe mạnh lực lưỡng.',
    explanation: '【Đáp án 1: 力】(Sách trang 281): 力 (ちから: sức lực).'
  },
  {
    id: 's500_q497',
    number: 497,
    sectionTitle: '第4週 7日目 [文字]',
    question: '部長の 代わりに 来ました。',
    options: ['かわり', 'こわり'],
    correctIndex: 0,
    hint: 'Tôi đến thay cho trưởng phòng.',
    explanation: '【Đáp án 1: かわり】(Sách trang 281): 代わり (かわり: thay thế).'
  },
  {
    id: 's500_q498',
    number: 498,
    sectionTitle: '第4週 7日目 [語い]',
    question: '＿＿＿田中さんから 電話が ありました。',
    options: ['しばらく', 'ひさしぶりに'],
    correctIndex: 1,
    hint: 'Lâu lắm rồi mới lại nhận được điện thoại từ anh Tanaka.',
    explanation: '【Đáp án 2: ひさしぶりに】(Sách trang 281): 久しぶりに (sau một khoảng thời gian dài mới lại...).'
  },
  {
    id: 's500_q499',
    number: 499,
    sectionTitle: '第4週 7日目 [語い]',
    question: 'お金を 貸して あげるけど、＿＿＿返してね。',
    options: ['かならず', 'やっぱり'],
    correctIndex: 0,
    hint: 'Tôi cho bạn mượn tiền nhưng nhất định phải trả lại đấy nhé.',
    explanation: '【Đáp án 1: かならず】(Sách trang 281): 必ず (かならず: nhất định).'
  },
  {
    id: 's500_q500',
    number: 500,
    sectionTitle: '第4週 7日目 [文法]',
    question: '田中先生、この 本を＿＿＿か。',
    options: ['お読み しました', 'お読みに なりました'],
    correctIndex: 1,
    hint: 'Thưa thầy Tanaka, thầy đã đọc cuốn sách này chưa ạ?',
    explanation: '【Đáp án 2: お読みに なりました】(Sách trang 281): お読みに なりましたか (kính ngữ tôn kính おV(bỏ ます)になる của 読む).'
  }
];

const unit10Str = `    {
      id: 's500_w4_u1',
      unitNumber: 10,
      title: '第4週 1日目・2日目: Kính ngữ & Điều kiện (Câu 376 - 405)',
      japaneseTitle: '第4週 1日目〜2日目',
      pageRange: 'Trang 216 - 235',
      topic: 'Chữ Hán (研究者, 意見, 住所, 地下鉄, 別), Từ vựng (どうしたん, よく, しつれいですが, さっき, すてる), Ngữ pháp (〜なら, 〜と, 〜てくださいませんか, お〜になる, 〜までに)',
      description: '30 câu hỏi trọng điểm ngày 1 và 2 tuần 4: mẫu câu điều kiện, kính ngữ trong giao tiếp công sở hàng ngày.',
      questions: ` + JSON.stringify(q376_to_405, null, 8).replace(/^ {8}/gm, '        ') + `
    }`;

const unit11Str = `    {
      id: 's500_w4_u2',
      unitNumber: 11,
      title: '第4週 3日目・4日目: Phó từ & Cảm xúc (Câu 406 - 435)',
      japaneseTitle: '第4週 3日目〜4日目',
      pageRange: 'Trang 236 - 255',
      topic: 'Chữ Hán (計画, 試合, 強い, 昔, 暗い), Từ vựng (たりない, めしあがる, しかたがない, よろこんで, えんりょ), Ngữ pháp (〜し, 〜のに, 〜という, 〜たまま, 〜ずに, 〜よう)',
      description: '30 câu hỏi trọng tâm ngày 3 và 4 tuần 4: kính ngữ cao cấp, phó từ cảm xúc và cấu trúc nguyên nhân hệ quả.',
      questions: ` + JSON.stringify(q406_to_435, null, 8).replace(/^ {8}/gm, '        ') + `
    }`;

const unit12Str = `    {
      id: 's500_w4_u3',
      unitNumber: 12,
      title: '第4週 5日目〜7日目: Tổng ôn tốt nghiệp & Thi thử 500 câu (Câu 436 - 500)',
      japaneseTitle: '第4週 5日目〜7日目（総仕上げ・完成ドリル）',
      pageRange: 'Trang 256 - 281',
      topic: 'Chữ Hán (野菜, 考える, 台所, 体, 写真, 閉める, 押す, 力), Từ vựng (あんしん, さいきん, おまちしています, いじめる, ずいぶん, やっと), Ngữ pháp (〜そうだ, 〜かもしれない, 〜はずだ, 〜はずがない, 〜ようにしている, 7日目総復習 35 câu)',
      description: '65 câu hỏi tổng kết toàn bộ 4 tuần học của bộ sách Shin Nihongo 500 Mon N4-N5, bao gồm trọn vẹn 35 câu test ngày 7 cán mốc 500/500 câu.',
      questions: ` + JSON.stringify(q436_to_500, null, 8).replace(/^ {8}/gm, '        ') + `
    }`;

const fullWeek4 = `import { StudyBookUnit } from '../../types';\n\nexport const SHIN_500_WEEK_4: StudyBookUnit[] = [\n` +
  unit10Str + ',\n' + unit11Str + ',\n' + unit12Str + '\n];\n';

fs.writeFileSync('src/data/shinNihongo500/week4.ts', fullWeek4, 'utf8');
console.log('Week 4 successfully created with all 125 questions (376-500)!');
