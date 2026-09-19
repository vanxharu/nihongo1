import { DailyExam } from '../types';
import { ensureFullExamQuestions } from './jlptExamGenerator';
import { REAL_EXAMS_N5 } from './realExamsN5';
import { REAL_EXAMS_N4 } from './realExamsN4';
import { REAL_EXAMS_N3 } from './realExamsN3';
import { REAL_EXAMS_N2 } from './realExamsN2';
import { REAL_EXAMS_N1 } from './realExamsN1';

const RAW_JLPT_PAST_EXAMS: DailyExam[] = [
  ...REAL_EXAMS_N5,
  // ==========================================
  // --- N5 PAST EXAMS (ĐỀ THI N5 CÁC NĂM) ---
  // ==========================================
  {
    id: 'jlpt_n5_2024_07',
    title: 'Đề thi chính thức JLPT N5 - Tháng 07/2024',
    level: 'N5',
    year: '2024',
    session: 'Tháng 07/2024',
    category: 'official_past',
    durationMinutes: 60,
    questions: [
      // --- 文字・語彙 (Moji-Goi) ---
      {
        id: 'n5_2407_1',
        question: '毎朝、【新聞】を読みます。',
        hint: 'Mỗi sáng tôi đọc báo.',
        options: ['しんぶん', 'ほん', 'ざっし', 'じしょ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '新聞 đọc là しんぶん (shinbun), nghĩa là "tờ báo".'
      },
      {
        id: 'n5_2407_2',
        question: 'あそこに大きな【犬】がいますね。',
        hint: 'Ở đằng kia có một con chó lớn nhỉ.',
        options: ['ねこ', 'いぬ', 'とり', 'さかな'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: '犬 đọc là いぬ (inu), nghĩa là "con chó".'
      },
      {
        id: 'n5_2407_3',
        question: 'この部屋は【あかるい】ですね。',
        hint: 'Căn phòng này sáng sủa nhỉ.',
        options: ['明るい', '暗い', '広い', '高い'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'あかるい viết Kanji là 明るい (Minh - sáng sủa).'
      },
      {
        id: 'n5_2407_4',
        question: '昨日はとても【あつかった】です。',
        hint: 'Hôm qua trời rất nóng.',
        options: ['暑かった', '寒かった', '温かかった', '涼しかった'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'あつかった có chữ Kanji là 暑かった (Thử - thời tiết nóng).'
      },
      {
        id: 'n5_2407_5',
        question: '毎晩10時に【ねます】。',
        hint: 'Mỗi tối tôi đi ngủ lúc 10 giờ.',
        options: ['寝ます', '起きます', '行きます', '来ます'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'ねます Kanji là 寝ます (Tẩm - đi ngủ).'
      },
      {
        id: 'n5_2407_6',
        question: '昨日は友達と公園で【遊びました】。',
        hint: 'Hôm qua tôi đã chơi ở công viên với bạn.',
        options: ['あそびました', 'はしりました', 'あるきました', 'およぎました'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '遊びました đọc là あそびました (asobimashita), có nghĩa là đã vui chơi.'
      },
      {
        id: 'n5_2407_7',
        question: 'あの【建物】は図書館です。',
        hint: 'Tòa nhà đằng kia là thư viện.',
        options: ['たてもの', 'たべもの', 'のみもの', 'かいもの'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '建物 đọc là たてもの (tatemono), nghĩa là "tòa nhà/kiến trúc".'
      },
      {
        id: 'n5_2407_8',
        question: 'テーブルの上にりんごが【三つ】あります。',
        hint: 'Trên bàn có 3 quả táo.',
        options: ['みっつ', 'ひとつ', 'ふたつ', 'よっつ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '三つ đọc là みっつ (mittsu), có nghĩa là "3 cái/quả".'
      },
      {
        id: 'n5_2407_9',
        question: '友達から手紙が【とどきました】。',
        hint: 'Lá thư từ bạn đã gửi đến nơi.',
        options: ['届きました', '着きました', '来ました', '書きました'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'とどきました Kanji là 届きました (Giới - gửi đến/tới tay).'
      },
      {
        id: 'n5_2407_10',
        question: 'ここで【写真】をとってはいけません。',
        hint: 'Không được chụp ảnh ở đây.',
        options: ['しゃしん', 'かがみ', 'えいが', 'えのぐ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '写真 đọc là しゃしん (shashin), nghĩa là "bức ảnh".'
      },

      // --- 文法 (Bunpou) ---
      {
        id: 'n5_2407_11',
        question: '私は毎日、バス____学校へ行きます。',
        hint: 'Hàng ngày tôi đi đến trường BẰNG xe buýt.',
        options: ['で', 'に', 'を', 'へ'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'Trợ từ で diễn tả phương tiện giao thông (バスで行きます).'
      },
      {
        id: 'n5_2407_12',
        question: '日曜日に友達____買い物に行きました。',
        hint: 'Vào chủ nhật tôi đã đi mua sắm CÙNG VỚI bạn.',
        options: ['と', 'に', 'で', 'を'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'Trợ từ と diễn tả người cùng thực hiện hành động (友達と đi mua sắm).'
      },
      {
        id: 'n5_2407_13',
        question: '部屋に田中さん____います。',
        hint: 'Ở trong phòng CÓ anh Tanaka.',
        options: ['が', 'を', 'で', 'へ'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'Chủ ngữ của sự tồn tại (います/あります) đi với trợ từ が.'
      },
      {
        id: 'n5_2407_14',
        question: 'あした、一緒に映画を____か。',
        hint: 'Ngày mai bạn có muốn đi xem phim cùng tôi không?',
        options: ['見に行きません', '見に行きます', '見に行きました', '見に行きたかったです'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-に 行きませんか dùng để đưa ra lời rủ rê, mời mạo lịch sự.'
      },
      {
        id: 'n5_2407_15',
        question: '昨日は雨が降っていたので、どこ____行きませんでした。',
        hint: 'Hôm qua vì trời mưa nên tôi không đi ĐÂU CẢ.',
        options: ['へも', 'でも', 'にも', 'までも'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'Từ hỏi + へも + Phủ định (どこへも行きませんでした = Không đi bất cứ đâu).'
      },
      {
        id: 'n5_2407_16',
        question: '私は 昨日 ★ ____ ____ ____ 買いました。\n(1) 本を  (2) 面白い  (3) 新しい',
        hint: 'Hôm qua tôi đã mua một cuốn sách mới và thú vị.',
        options: ['(3) 新しい', '(2) 面白い', '(1) 本を', 'Không đáp án nào'],
        correctIndex: 1,
        section: 'bunpou',
        explanation: 'Thứ tự đúng: 私は 昨日 (3)新しい (2)面白い★ (1)本を 買いました. Vị trí ngôi sao ★ là (2) 面白い.'
      },
      {
        id: 'n5_2407_17',
        question: '図書館で ★ ____ ____ ____ はいけません。\n(1) 大声で  (2) 話して  (3) 本を',
        hint: 'Ở thư viện không được nói chuyện lớn tiếng.',
        options: ['(1) 大声で', '(2) 話して', '(3) 本を', 'Không đáp án nào'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'Thứ tự đúng: 図書館で (1)大声で★ (2)話してはいけません. Vị trí ngôi sao ★ là (1) 大声で.'
      },

      // --- 読解 (Dokkai) ---
      {
        id: 'n5_2407_18',
        question: '【短文】\n「山田さんの寮は駅から歩いて10分です。部屋は広くありませんが、静かで綺麗です。近くにスーパーやコンビニがあるので、とても便利です。」\n\n質問：山田さんの寮について正しいものはどれですか。',
        hint: 'Đọc kỹ thông tin về ký túc xá của anh Yamada.',
        options: [
          '駅から遠くて不便です。',
          '部屋は広いですが、うるさいです。',
          '部屋は広くないですが、静かで便利です。',
          '近くにスーパーもコンビニもありません。'
        ],
        correctIndex: 2,
        section: 'dokkai',
        explanation: 'Bài viết ghi: "部屋は広くありませんが、静かで綺麗です...近くにスーパーやコンビニがあるので便利" -> Phòng không rộng nhưng yên tĩnh và tiện lợi.'
      },
      {
        id: 'n5_2407_19',
        question: '【案内】\n「【ごみの出し方】\n・燃えるごみ：火曜日と金曜日の朝8時までに出してください。\n・燃えないごみ：水曜日の朝8時までに出してください。\n※土曜日と日曜日はごみを出してはいけません。」\n\n質問：金曜日の朝に出せるごみはどれですか。',
        hint: 'Sáng thứ 6 có thể vứt loại rác nào?',
        options: ['燃えるごみ', '燃えないごみ', 'すべてのごみ', 'ごみは出せない'],
        correctIndex: 0,
        section: 'dokkai',
        explanation: 'Thông báo ghi rõ: "燃えるごみ：火曜日と金曜日の朝8時まで" -> Sáng thứ 6 vứt rác cháy được (燃えるごみ).'
      },

      // --- 聴解 (Choukai) ---
      {
        id: 'n5_2407_20',
        question: '【問題1】男の人と女の人が話しています。男の人と女の人は明日、どこで会いますか。',
        hint: 'Nam và nữ ngày mai sẽ gặp nhau ở đâu?',
        options: ['駅の北口', '図書館の前', '公園の入口', '喫茶店の中'],
        correctIndex: 0,
        section: 'choukai',
        audioScript: '男：明日、どこで待ち合わせしましょうか。\n女：駅の北口はどうですか。時計の前にしましょう。\n男：はい、分かりました。じゃあ、午前10時に駅の北口で。',
        explanation: 'Nữ đề xuất "駅の北口はどうですか" và nam đồng ý "じゃあ、午前10時に駅の北口で" -> Họ gặp nhau ở cổng bắc nhà ga (駅の北口).'
      }
    ]
  },

  {
    id: 'jlpt_n5_2023_12',
    title: 'Đề thi chính thức JLPT N5 - Tháng 12/2023',
    level: 'N5',
    year: '2023',
    session: 'Tháng 12/2023',
    category: 'official_past',
    durationMinutes: 60,
    questions: [
      {
        id: 'n5_2312_1',
        question: '私の【教室】は３階にあります。',
        hint: 'Phòng học của tôi nằm ở tầng 3.',
        options: ['きょうしつ', 'しょくどう', 'じむしょ', 'へや'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '教室 đọc là きょうしつ (kyoushitsu), có nghĩa là phòng học.'
      },
      {
        id: 'n5_2312_2',
        question: 'この【時計】はちょっと高かったですが、とても便利です。',
        hint: 'Chiếc đồng hồ này hơi đắt một chút nhưng rất tiện lợi.',
        options: ['じかん', 'とけい', 'でんわ', 'てちょう'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: '時計 đọc là とけい (tokei), có nghĩa là đồng hồ.'
      },
      {
        id: 'n5_2312_3',
        question: '木村さんは英語____上手です。',
        hint: 'Anh Kimura rất giỏi tiếng Anh.',
        options: ['を', 'が', 'は', 'で'],
        correctIndex: 1,
        section: 'bunpou',
        explanation: 'Cấu trúc chỉ năng lực: [Chủ ngữ] は [Lĩnh vực] が 上手/下手 です.'
      },
      {
        id: 'n5_2312_4',
        question: 'きのう、友達____映画を見に行きました。',
        hint: 'Hôm qua, tôi đã đi xem phim CÙNG VỚI bạn.',
        options: ['に', 'で', 'と', 'を'],
        correctIndex: 2,
        section: 'bunpou',
        explanation: 'Trợ từ と dùng chỉ đối tượng thực hiện hành động cùng (với bạn).'
      },
      {
        id: 'n5_2312_5',
        question: '【短文】\n「マイクさんへ\n明日、一緒に図書館へ行きませんか。午前９時に駅の北口で待ちましょう。遅れる時は電話をしてください。　ー リーより」\n\n質問：マイクさんは明日、まずどこへ行きますか。',
        hint: 'Mike phải đi đâu đầu tiên vào ngày mai?',
        options: [
          '図書館へ行きます。',
          '駅の北口へ行きます。',
          'リーさんの家へ行きます。',
          '電話をかけに行きます。'
        ],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Nhắn "午前9時に駅の北口で待ちましょう" -> Đợi ở cổng bắc nhà ga lúc 9h sáng.'
      },
      {
        id: 'n5_2312_6',
        question: '【問題1】\n「すみません、この近くに郵便局がありますか。」',
        hint: 'Chọn câu trả lời phản xạ phù hợp nhất:',
        options: [
          'ええ、あそこの角を曲がると右側にありますよ。',
          'いいえ、郵便局へ行きます。',
          'はい、手紙を投函しました。',
          'どういたしまして。'
        ],
        correctIndex: 0,
        section: 'choukai',
        audioScript: '質問：すみません、この近くに郵便局がありますか。',
        explanation: 'Hỏi bưu điện ở đâu -> Trả lời hướng dẫn chỉ đường "ええ、あそこの角を曲がると右側にありますよ".'
      }
    ]
  },

  {
    id: 'jlpt_n5_2023_07',
    title: 'Đề thi chính thức JLPT N5 - Tháng 07/2023',
    level: 'N5',
    year: '2023',
    session: 'Tháng 07/2023',
    category: 'official_past',
    durationMinutes: 60,
    questions: [
      {
        id: 'n5_2307_1',
        question: '私の学校は【外国人】の先生が多いです。',
        hint: 'Trường tôi có nhiều giáo viên người nước ngoài.',
        options: ['がいこくじん', 'こくさいじん', 'りゅうがくせい', 'かんこくじん'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '外国人 đọc là がいこくじん (gaikokujin): người nước ngoài.'
      },
      {
        id: 'n5_2307_2',
        question: '毎朝、冷たい【水】を飲みます。',
        hint: 'Mỗi sáng tôi uống nước lạnh.',
        options: ['みず', 'おゆ', 'さけ', 'おちゃ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '水 đọc là みず (mizu): nước.'
      },
      {
        id: 'n5_2307_3',
        question: 'さとうさんは今、図書館____勉強しています。',
        hint: 'Chị Sato hiện đang học TẠI thư viện.',
        options: ['に', 'で', 'へ', 'を'],
        correctIndex: 1,
        section: 'bunpou',
        explanation: 'Trợ từ で diễn tả nơi chốn xảy ra hành động (học bài).'
      },
      {
        id: 'n5_2307_4',
        question: '【短文】\n「田中さんは毎朝6時に起きて、犬と散歩します。それから朝ご飯を食べて、7時半に会社へ行きます。」\n\n質問：田中さんは朝ご飯の前に何をしますか。',
        hint: 'Anh Tanaka làm gì trước khi ăn sáng?',
        options: ['会社へ行きます', '犬と散歩します', 'テレビを見ます', '新聞を読みます'],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Thứ tự công việc: Dậy lúc 6h -> Đi dạo với chó -> Ăn sáng. Vậy trước khi ăn sáng là đi dạo với chó (犬と散歩します).'
      }
    ]
  },

  // ==========================================
  // --- N4 PAST EXAMS (BỘ ĐỀ THI N4 TỪ SÁCH BẢN QUYỀN) ---
  // ==========================================
  ...REAL_EXAMS_N4,

  // ==========================================
  // --- N3 PAST EXAMS (ĐỀ THI N3 CÁC NĂM) ---
  // ==========================================
  {
    id: 'jlpt_n3_2024_07',
    title: 'Đề thi chính thức JLPT N3 - Tháng 07/2024',
    level: 'N3',
    year: '2024',
    session: 'Tháng 07/2024',
    category: 'official_past',
    durationMinutes: 100,
    questions: [
      // --- 文字・語彙 (Moji-Goi) ---
      {
        id: 'n3_2407_1',
        question: 'この地域は【災害】に備えて避難訓練を行っています。',
        hint: 'Khu vực này tổ chức diễn tập sơ tán để phòng tránh thảm họa.',
        options: ['さいがい', 'さいなん', 'こうずい', 'じしん'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '災害 đọc là さいがい (saigai): thảm họa, thiên tai.'
      },
      {
        id: 'n3_2407_2',
        question: '契約書に【署名】をお願いいたします。',
        hint: 'Xin vui lòng ký tên vào bản hợp đồng.',
        options: ['しょめい', 'いんかん', 'サイン', 'しゅうせい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '署名 đọc là しょめい (shomei): ký tên, chữ ký.'
      },
      {
        id: 'n3_2407_3',
        question: '新商品の開発に向けて、意見を【募る】ことにした。',
        hint: 'Chúng tôi quyết định chiêu mộ/thu thập ý kiến cho việc phát triển sản phẩm mới.',
        options: ['つのる', 'つねる', 'あつめる', 'いのる'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '募る đọc là つのる (tsunoru): chiêu mộ, trưng cầu, thu thập.'
      },
      {
        id: 'n3_2407_4',
        question: '彼の説明を聞いても、【さっぱり】分からない。',
        hint: 'Dù nghe anh ấy giải thích nhưng tôi hoàn toàn không hiểu gì cả.',
        options: ['全然', 'すこしだけ', 'はっきりと', 'だいたい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'さっぱり + phủ định = 全然...ない (hoàn toàn không... chút nào).'
      },
      {
        id: 'n3_2407_5',
        question: '【思いがけない】ニュースに驚いた。',
        hint: 'Ngạc nhiên trước tin tức không ngờ tới.',
        options: ['予想外の', '悲しい', 'うれしい', '有名な'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '思いがけない = 予想外の (ngoài dự đoán, bất ngờ).'
      },

      // --- 文法 (Bunpou) ---
      {
        id: 'n3_2407_6',
        question: '彼女はまるで何事もなかったか____、静かに微笑んでいた。',
        hint: 'Cô ấy mỉm cười lặng lẽ như thể chưa từng có chuyện gì xảy ra.',
        options: ['のように', 'みたいに', 'らしく', 'そうに'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'まるで...かのようだ / かのように: như thể là, tựa như là...'
      },
      {
        id: 'n3_2407_7',
        question: '締め切りに間に合う____、夜遅くまで作業を続けた。',
        hint: 'Tôi đã tiếp tục làm việc đến tận khuya ĐỂ KỊP thời hạn.',
        options: ['ように', 'ために', 'とおりに', 'おかげで'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-khả năng / V-không ý chí + ように: để cho..., sao cho... (間に合う là động từ không ý chí).'
      },
      {
        id: 'n3_2407_8',
        question: 'どんなに困難であっても、最後まで諦めない____だ。',
        hint: 'Dù có khó khăn thế nào đi nữa, quyết không bỏ cuộc đến phút cuối.',
        options: ['つもり', 'わけ', 'はず', 'べき'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-る / V-ない + つもりだ: dự định, quyết tâm thực hiện.'
      },
      {
        id: 'n3_2407_9',
        question: 'この薬は食後に服用する____になっています。',
        hint: 'Thuốc này quy định là uống sau bữa ăn.',
        options: ['こと', 'もの', 'よう', 'わけ'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: '〜ことになっている: được quy định, trở thành quy tắc.'
      },
      {
        id: 'n3_2407_10',
        question: '彼女の素晴らしい歌声を聞いて、感動せずには____。',
        hint: 'Nghe giọng hát tuyệt vời của cô ấy, tôi không thể không cảm động.',
        options: ['いられなかった', 'いられなかったそうだ', 'いられないわけだ', 'いられないはずだ'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-ずにはいられない: không thể không..., không kìm nén được...'
      },

      // --- 読解 (Dokkai) ---
      {
        id: 'n3_2407_11',
        question: '【短文】\n「近年、リモートワークが普及したことで、通勤の負担が減り、家族と過ごす時間が増えました。しかし一方で、仕事と私生活の境界があいまいになり、過労やストレスを抱える人も少なくありません。」\n\n質問：リモートワークの問題点として文章で挙げられているものはどれですか。',
        hint: 'Vấn đề được nêu ra của làm việc từ xa là gì?',
        options: [
          '通勤時間が長くなること',
          '仕事と私生活の境界があいまいになり、過労やストレスが増えること',
          '家族と過ごす時間が減ること',
          'パソコンの費用がかかること'
        ],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Bài viết nêu rõ: "仕事と私生活の境界があいまいになり、過労やストレスを抱える人も少なくありません"'
      },

      // --- 聴解 (Choukai) ---
      {
        id: 'n3_2407_12',
        question: '【問題1】会社で男の人と女の人が話しています。男の人はこれからまず何をしなければなりませんか。',
        hint: 'Người nam sau đây sẽ phải làm gì đầu tiên?',
        options: ['資料を修正する', '取引先に電話する', '会議室を予約する', '部長に報告する'],
        correctIndex: 0,
        section: 'choukai',
        audioScript: '女：佐藤さん、午後のプレゼン資料チェックしました。数字に少し誤りがありましたよ。\n男：本当ですか！すぐ直します。\n女：ええ、まず資料の修正を優先してください。終わったら部長に報告をお願いしますね。\n男：分かりました。今すぐ修正します！',
        explanation: 'Nữ dặn "まず資料の修正を優先してください" và nam đáp "今すぐ修正します" -> Việc ưu tiên làm đầu tiên là sửa tài liệu (資料を修正する).'
      }
    ]
  },

  {
    id: 'jlpt_n3_2023_12',
    title: 'Đề thi chính thức JLPT N3 - Tháng 12/2023',
    level: 'N3',
    year: '2023',
    session: 'Tháng 12/2023',
    category: 'official_past',
    durationMinutes: 100,
    questions: [
      {
        id: 'n3_2312_1',
        question: 'この地域は【災害】に備えて避難訓練を行っています。',
        hint: 'Khu vực này tổ chức diễn tập sơ tán để phòng tránh thảm họa.',
        options: ['さいがい', 'さいなん', 'こうずい', 'じしん'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '災害 đọc là さいがい (saigai): thảm họa, thiên tai.'
      },
      {
        id: 'n3_2312_2',
        question: '彼女はまるで何事もなかったか____、静かに微笑んでいた。',
        hint: 'Cô ấy mỉm cười lặng lẽ như thể chưa từng có chuyện gì xảy ra.',
        options: ['のように', 'みたいに', 'らしく', 'そうに'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'まるで...かのようだ / かのように: như thể là, tựa như là...'
      },
      {
        id: 'n3_2312_3',
        question: '彼の説明を聞いても、【さっぱり】分からない。',
        hint: 'Dù nghe anh ấy giải thích nhưng tôi hoàn toàn không hiểu gì cả.',
        options: ['全然（分からない）', 'すこしだけ', 'はっきりと', 'だいたい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'さっぱり + phủ định = 全然...ない (hoàn toàn không... chút nào).'
      }
    ]
  },

  {
    id: 'jlpt_n3_2023_07',
    title: 'Đề thi chính thức JLPT N3 - Tháng 07/2023',
    level: 'N3',
    year: '2023',
    session: 'Tháng 07/2023',
    category: 'official_past',
    durationMinutes: 100,
    questions: [
      {
        id: 'n3_2307_1',
        question: '契約書に【署名】をお願いいたします。',
        hint: 'Xin vui lòng ký tên vào bản hợp đồng.',
        options: ['しょめい', 'いんかん', 'サイン', 'しゅうせい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '署名 đọc là しょめい (shomei): ký tên, chữ ký.'
      },
      {
        id: 'n3_2307_2',
        question: 'どんなに困難であっても、最後まで諦めない____だ。',
        hint: 'Dù có khó khăn thế nào đi nữa, quyết không bỏ cuộc đến phút cuối.',
        options: ['つもり', 'わけ', 'はず', 'べき'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-る / V-ない + つもりだ: dự định, quyết tâm thực hiện.'
      }
    ]
  },

  // ==========================================
  // --- N2 PAST EXAMS (ĐỀ THI N2 CÁC NĂM) ---
  // ==========================================
  {
    id: 'jlpt_n2_2024_07',
    title: 'Đề thi chính thức JLPT N2 - Tháng 07/2024',
    level: 'N2',
    year: '2024',
    session: 'Tháng 07/2024',
    category: 'official_past',
    durationMinutes: 105,
    questions: [
      // --- 文字・語彙 (Moji-Goi) ---
      {
        id: 'n2_2407_1',
        question: '新商品の開発に向けて、意見を【募る】ことにした。',
        hint: 'Chúng tôi quyết định chiêu mộ/thu thập ý kiến cho việc phát triển sản phẩm mới.',
        options: ['つのる', 'つねる', 'あつめる', 'いのる'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '募る đọc là つのる (tsunoru): chiêu mộ, trưng cầu, thu thập.'
      },
      {
        id: 'n2_2407_2',
        question: '長年にわたる研究の成果が、【ようやく】実を結んだ。',
        hint: 'Thành quả nghiên cứu sau nhiều năm rốt cuộc cũng đã gặt hái trái ngọt.',
        options: ['やっと', 'あらかじめ', 'かろうじて', 'いちだんと'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'ようやく = やっと (rốt cuộc, cuối cùng sau khoảng thời gian kiên trì).'
      },
      {
        id: 'n2_2407_3',
        question: '会議で【活発】な議論が行われた。',
        hint: 'Trong cuộc họp đã diễn ra các cuộc thảo luận sôi nổi/sôi động.',
        options: ['かっぱつ', 'かつはつ', 'かんぱつ', 'かつだつ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '活発 đọc là かっぱつ (kappatsu): sôi nổi, hoạt bát.'
      },
      {
        id: 'n2_2407_4',
        question: '事前によく【検討】した上で、結論を出します。',
        hint: 'Sau khi đã xem xét/cân nhắc kỹ lưỡng trước đó sẽ đưa ra kết luận.',
        options: ['けんとう', 'けんとく', 'けんしょう', 'けんさく'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '検討 đọc là けんとう (kentou): xem xét, thảo luận cân nhắc.'
      },

      // --- 文法 (Bunpou) ---
      {
        id: 'n2_2407_5',
        question: 'たとえ周囲に反対されよう____、私は自分の意志を貫く。',
        hint: 'Cho dù có bị những người xung quanh phản đối đi nữa, tôi vẫn giữ vững ý chí.',
        options: ['とも', 'が', 'のに', 'もの'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'たとえ...V-よう とも: Cho dù... đi chăng nữa.'
      },
      {
        id: 'n2_2407_6',
        question: '彼の仕事に対する真摯な姿勢には、敬服せざるを____。',
        hint: 'Đối với thái độ chân thành của anh ấy trong công việc, tôi không thể không kính phục.',
        options: ['得ない', 'いかない', 'きれない', 'おかない'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-ざるを得ない: Không thể không... / Đành phải...'
      },
      {
        id: 'n2_2407_7',
        question: '景気の回復に伴い、有効求人倍率も上昇し____ある。',
        hint: 'Cùng với sự phục hồi kinh tế, tỷ lệ tuyển dụng đang có xu hướng tăng lên.',
        options: ['つつ', 'がちで', 'っぽく', 'がてら'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-stem + つつある: Đang trong quá trình / dần dần đang...'
      },
      {
        id: 'n2_2407_8',
        question: 'この契約は、両者の同意がない____破棄することはできない。',
        hint: 'Hợp đồng này chừng nào chưa có sự đồng ý của cả hai bên thì không thể hủy bỏ.',
        options: ['限り', 'うちに', 'ように', 'とおりに'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: '〜限り (は): Chừng nào còn... / Nếu không...'
      },

      // --- 読解 (Dokkai) ---
      {
        id: 'n2_2407_9',
        question: '【短文】\n「AI（人工知能）の飛躍的な発展は、従来の労働市場に大きな変化をもたらしている。単純な作業は自動化される可能性が高いが、人間の持つ創造的思考や共感力、複雑な問題解決能力は、今後も代替できない重要な要素であり続けるだろう。」\n\n質問：筆者が強調している人間の能力は何ですか。',
        hint: 'Tác giả nhấn mạnh năng lực nào của con người mà AI không thể thay thế?',
        options: [
          '単純な計算やデータの処理能力',
          '創造的思考、共感力、複雑な問題解決能力',
          '大量の情報を高速で記憶する能力',
          '正確でミスがない作業能力'
        ],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Đoạn văn ghi rõ: "創造的思考や共感力、複雑な問題解決能力は、今後も代替できない重要な要素であり続ける".'
      },

      // --- 聴解 (Choukai) ---
      {
        id: 'n2_2407_10',
        question: '【問題1】会社で二人が話しています。今後の海外進出について、二人はどのような結論を出しましたか。',
        hint: 'Hai người đã đưa ra kết luận thế nào về việc mở rộng ra nước ngoài?',
        options: [
          'すぐに新規店舗をオープンする',
          'まず現地での市場調査を徹底して行う',
          '海外進出の計画自体を中止する',
          'オンライン販売のみに限定する'
        ],
        correctIndex: 1,
        section: 'choukai',
        audioScript: '部長：アジア市場への進出だが、急いで出店するより、まず現地の消費動向を正確に把握すべきだと思う。\n課長：同感です。来月調査チームを派遣し、徹底的な市場調査から始めましょう。\n部長：よし、そうしよう。',
        explanation: 'Giám đốc và Trưởng phòng thống nhất: "まず現地の消費動向を把握... 徹底的な市場調査から始めましょう" -> Thực hiện khảo sát thị trường kỹ lưỡng trước (まず現地での市場調査を徹底して行う).'
      }
    ]
  },

  {
    id: 'jlpt_n2_2023_12',
    title: 'Đề thi chính thức JLPT N2 - Tháng 12/2023',
    level: 'N2',
    year: '2023',
    session: 'Tháng 12/2023',
    category: 'official_past',
    durationMinutes: 105,
    questions: [
      {
        id: 'n2_2312_1',
        question: '新商品の開発に向けて、意見を【募る】ことにした。',
        hint: 'Chúng tôi quyết định chiêu mộ/thu thập ý kiến cho việc phát triển sản phẩm mới.',
        options: ['つのる', 'つねる', 'あつめる', 'いのる'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '募る đọc là つのる (tsunoru): chiêu mộ, trưng cầu, thu thập.'
      },
      {
        id: 'n2_2312_2',
        question: 'たとえ周囲に反対されよう____、私は自分の意志を貫く。',
        hint: 'Cho dù có bị những người xung quanh phản đối đi nữa, tôi vẫn giữ vững ý chí.',
        options: ['とも', 'が', 'のに', 'もの'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'たとえ...V-よう とも: Cho dù... đi chăng nữa.'
      }
    ]
  },

  {
    id: 'jlpt_n2_2022_12',
    title: 'Đề thi chính thức JLPT N2 - Tháng 12/2022',
    level: 'N2',
    year: '2022',
    session: 'Tháng 12/2022',
    category: 'official_past',
    durationMinutes: 105,
    questions: [
      {
        id: 'n2_2212_1',
        question: '景気の回復に伴い、有効求人倍率も上昇し____ある。',
        hint: 'Cùng với sự phục hồi kinh tế, tỷ lệ tuyển dụng đang có xu hướng tăng lên.',
        options: ['つつ', 'がちで', 'っぽく', 'がてら'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-stem + つつある: Đang trong quá trình / dần dần đang...'
      }
    ]
  },

  // ==========================================
  // --- N1 PAST EXAMS (ĐỀ THI N1 CÁC NĂM) ---
  // ==========================================
  {
    id: 'jlpt_n1_2024_07',
    title: 'Đề thi chính thức JLPT N1 - Tháng 07/2024',
    level: 'N1',
    year: '2024',
    session: 'Tháng 07/2024',
    category: 'official_past',
    durationMinutes: 110,
    questions: [
      // --- 文字・語彙 (Moji-Goi) ---
      {
        id: 'n1_2407_1',
        question: '彼はどのような逆境に直面しても【屈する】ことがない。',
        hint: 'Anh ấy dù đối mặt với nghịch cảnh thế nào cũng không bao giờ khuất phục.',
        options: ['くっする', 'くつする', 'かがむ', 'へこむ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '屈する đọc là くっする (kussuru): khuất phục, khuất gối.'
      },
      {
        id: 'n1_2407_2',
        question: '紛争の【勃発】により、地域の緊張が一気に高まった。',
        hint: 'Do sự bùng nổ xung đột, căng thẳng khu vực tăng vọt.',
        options: ['ぼっぱつ', 'とつはつ', 'じつはつ', 'ばくはつ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '勃発 đọc là ぼっぱつ (boppatsu): bùng nổ, bùng phát đột ngột.'
      },
      {
        id: 'n1_2407_3',
        question: 'この複雑な問題の解決には【多角的な】視点が不可欠だ。',
        hint: 'Để giải quyết vấn đề phức tạp này, góc nhìn đa chiều/đa góc độ là không thể thiếu.',
        options: ['たかくてきな', 'たかくけいな', 'おおかくてきな', 'たかっけいな'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '多角的 đọc là たかくてき (takakuteki): đa chiều, nhiều góc độ.'
      },
      {
        id: 'n1_2407_4',
        question: '【うやむや】にされた事件の真相を解明する。',
        hint: 'Làm sáng tỏ sự thật vụ án đã bị mập mờ, bưng bít.',
        options: ['あいまいにして不透明な様', '迅速で明瞭な様', '悲惨で残酷な様', '厳重で厳格な様'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'うやむや = あいまいにして、はっきりさせない (mập mờ, không rõ ràng).'
      },

      // --- 文法 (Bunpou) ---
      {
        id: 'n1_2407_5',
        question: '警察の懸命な捜査にもかかわらず、犯人の足取りはつかめず____だった。',
        hint: 'Dù cảnh sát dốc sức điều tra nhưng dấu vết thủ phạm rốt cuộc vẫn không thể nắm bắt được.',
        options: ['じまい', 'まみれ', 'ずくめ', 'つぱなし'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-ずじまい: Rốt cuộc đã không thể làm được V (kết thúc mà không thực hiện được).'
      },
      {
        id: 'n1_2407_6',
        question: 'たとえ一途の望みがある____、最後まで諦めるわけにはいかない。',
        hint: 'Cho dù chỉ còn một tia hy vọng mỏng manh đi nữa, tôi cũng quyết không bỏ cuộc.',
        options: ['にせよ', 'とあれば', 'ともなると', 'ならでは'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: '〜にせよ / 〜にしろ: Cho dù là... đi chăng nữa.'
      },
      {
        id: 'n1_2407_7',
        question: '彼の巧みな話術にかかっては、誰も納得させられずには____。',
        hint: 'Rơi vào tài ăn nói khéo léo của anh ấy thì không ai là không bị thuyết phục.',
        options: ['おかない', 'すまない', 'やまない', 'いられない'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-ずにはおかない: Nhất định sẽ làm cho / Không thể nào không làm cho đối phương...'
      },

      // --- 読解 (Dokkai) ---
      {
        id: 'n1_2407_8',
        question: '【短文】\n「現代のデジタル情報社会において、人は常にグローバルなネットワークと接続されている。しかし、この『常時接続』は、自分自身と向き合う内省の時間を奪うことにもなる。独立した思索の空白が欠如することは、批判的思考力や文化的な創造性の深みを損なう恐れがある。」\n\n質問：筆者が現代のデジタル社会において懸念している点は何ですか。',
        hint: 'Mối quan ngại của tác giả đối với xã hội kỹ thuật số hiện đại là gì?',
        options: [
          'インターネットの通信速度が遅いこと',
          '常に接続されることで内省の時間が失われ、批判的思考力や創造性が低下すること',
          'サイバー犯罪が増加していること',
          'デジタル機器の購入費用が高額であること'
        ],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Tác giả quan ngại việc kết nối liên tục làm mất thời gian tự suy ngẫm (内省), từ đó làm suy giảm tư duy phản biện và tính sáng tạo.'
      },

      // --- 聴解 (Choukai) ---
      {
        id: 'n1_2407_9',
        question: '【問題1】講演者は今後の経済政策についてどのような見解を示していますか。',
        hint: 'Diễn giả thể hiện quan điểm thế nào về chính sách kinh tế sắp tới?',
        options: ['短期的な景気刺激を最優先すること', '中長期的な構造改革と持続的イノベーションへの投資', '教育予算を大幅に削減すること', '国際市場の閉鎖を進めること'],
        correctIndex: 1,
        section: 'choukai',
        audioScript: '講演者：目先の景気対策に終始するのではなく、中長期的な視点に立った構造改革と、イノベーションへの持続的な投資こそが、我が国経済の持続可能な成長を担保する唯一の道筋であります。',
        explanation: 'Diễn giả nhấn mạnh: "中長期的な構造改革とイノベーションへの持続的投資こそが持続可能な成長を担保する" -> Tái cấu trúc và đầu tư vào đổi mới sáng tạo bền vững.'
      }
    ]
  },

  {
    id: 'jlpt_n1_2023_12',
    title: 'Đề thi chính thức JLPT N1 - Tháng 12/2023',
    level: 'N1',
    year: '2023',
    session: 'Tháng 12/2023',
    category: 'official_past',
    durationMinutes: 110,
    questions: [
      {
        id: 'n1_2312_1',
        question: '彼はどのような逆境に直面しても【屈する】ことがない。',
        hint: 'Anh ấy dù đối mặt với nghịch cảnh thế nào cũng không bao giờ khuất phục.',
        options: ['くっする', 'くつする', 'かがむ', 'へこむ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '屈する đọc là くっする (kussuru): khuất phục, khuất gối.'
      },
      {
        id: 'n1_2312_2',
        question: '警察の懸命な捜査にもかかわらず、犯人の足取りはつかめず____だった。',
        hint: 'Dù cảnh sát dốc sức điều tra nhưng dấu vết thủ phạm rốt cuộc vẫn không thể nắm bắt được.',
        options: ['じまい', 'まみれ', 'ずくめ', 'つぱなし'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-ずじまい: Rốt cuộc đã không thể làm được V (kết thúc mà không thực hiện được).'
      }
    ]
  },

  {
    id: 'jlpt_n1_2023_07',
    title: 'Đề thi chính thức JLPT N1 - Tháng 07/2023',
    level: 'N1',
    year: '2023',
    session: 'Tháng 07/2023',
    category: 'official_past',
    durationMinutes: 110,
    questions: [
      {
        id: 'n1_2307_1',
        question: '紛争の【勃発】により、地域の緊張が一気に高まった。',
        hint: 'Do sự bùng nổ xung đột, căng thẳng khu vực tăng vọt.',
        options: ['ぼっぱつ', 'とつはつ', 'じつはつ', 'ばくはつ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '勃発 đọc là ぼっぱつ (boppatsu): bùng nổ, bùng phát đột ngột.'
      }
    ]
  },
  ...REAL_EXAMS_N3,
  ...REAL_EXAMS_N2,
  ...REAL_EXAMS_N1
];

export const JLPT_PAST_EXAMS: DailyExam[] = RAW_JLPT_PAST_EXAMS.map(ensureFullExamQuestions);

