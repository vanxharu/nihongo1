import { StudyBookUnit } from '../../types';

export const SHIN_500_WEEK_1: StudyBookUnit[] = [
    {
      id: 's500_w1_u1',
      unitNumber: 1,
      title: '第1週 1日目・2日目: 文字・語い・文法 (Câu 1 - 30)',
      japaneseTitle: '第1週 1日目〜2日目',
      pageRange: 'Trang 12 - 31',
      topic: 'Chữ Hán (町, 人口, 会社員, 四時, 今年), Từ vựng (エアコン, お手洗い, 授業), Ngữ pháp (で, と, まで, か, ふつか)',
      description: 'Luyện tập 30 câu hỏi trọng điểm ngày thứ 1 và thứ 2 của tuần 1: đọc chữ Hán, chọn từ vựng đúng ngữ cảnh và trợ từ ngữ pháp cơ bản.',
      questions: [
        {
          id: 's500_q1',
          number: 1,
          sectionTitle: '第1週 1日目 [文字]',
          question: 'この 町の <u>人口</u>は どのぐらいですか。',
          options: ['にんこう', 'ひとくち', 'じんこう', 'いりぐち'],
          correctIndex: 2,
          hint: 'Dân số của thị trấn này khoảng bao nhiêu?',
          explanation: '【Đáp án 3: じんこう】(Sách trang 13): 人口 (じんこう: dân số). 町 (チョウ／まち: thị trấn, thị xã). 口 (コウ／くち: mồm, miệng; 人口: dân số; 入り口: lối vào).'
        },
        {
          id: 's500_q2',
          number: 2,
          sectionTitle: '第1週 1日目 [語い]',
          question: '暑いですね。エアコンを＿＿＿。',
          options: ['つけましょう', 'あけましょう', 'おしましょう', 'ひらきましょう'],
          correctIndex: 0,
          hint: 'Nóng nhỉ! Bật điều hòa lên đi!',
          explanation: '【Đáp án 1: つけましょう】(Sách trang 13): つける (bật) ⇔ 消す (けす: tắt). エアコンをつける: bật máy lạnh/điều hòa.'
        },
        {
          id: 's500_q3',
          number: 3,
          sectionTitle: '第1週 1日目 [文法]',
          question: '黒い ペン＿＿＿ 書いて ください。',
          options: ['を', 'に', 'が', 'で'],
          correctIndex: 3,
          hint: 'Hãy viết bằng bút đen!',
          explanation: '【Đáp án 4: で】(Sách trang 13): Nで (N = 道具・方法 tool, method / dụng cụ, phương pháp). Viết bằng bút đen: 黒いペンで書いてください.'
        },
        {
          id: 's500_q4',
          number: 4,
          sectionTitle: '第1週 1日目 [文字]',
          question: 'あの 人は <u>かいしゃいん</u>です。',
          options: ['会社人', '会社員', '社会人', '社会員'],
          correctIndex: 1,
          hint: 'Anh ấy là nhân viên công ty.',
          explanation: '【Đáp án 2: 会社員】(Sách trang 15): 会社員 (かいしゃいん: nhân viên công ty). 会 (カイ / あ・う: gặp), 社 (シャ: công ty), 員 (イン: thành viên).'
        },
        {
          id: 's500_q5',
          number: 5,
          sectionTitle: '第1週 1日目 [語い]',
          question: 'ああ、のどが＿＿＿。つめたい 水が 飲みたい。',
          options: ['いたかった', 'かわいた', 'すいた', 'ぬれた'],
          correctIndex: 1,
          hint: 'Ôi, khát nước quá. Tôi muốn uống nước lạnh.',
          explanation: '【Đáp án 2: かわいた】(Sách trang 15): のどがかわく (khát nước). おなかがすく (đói bụng), 服がぬれる (quần áo bị ướt).'
        },
        {
          id: 's500_q6',
          number: 6,
          sectionTitle: '第1週 1日目 [文法]',
          question: '田中さんは イギリス人＿＿＿結婚しました。',
          options: ['と', 'に', 'を', 'へ'],
          correctIndex: 0,
          hint: 'Anh Tanaka kết hôn với người Anh.',
          explanation: '【Đáp án 1: と】(Sách trang 15): Nと (*相手を表す describing the other person / chỉ đối tượng). 結婚する (kết hôn cùng ai: 〜と結婚する).'
        },
        {
          id: 's500_q7',
          number: 7,
          sectionTitle: '第1週 1日目 [文字]',
          question: '今、<u>四時</u>です。',
          options: ['よじ', 'しじ', 'ようじ', 'よんじ'],
          correctIndex: 0,
          hint: 'Bây giờ là 4 giờ.',
          explanation: '【Đáp án 1: よじ】(Sách trang 17): 四時 (よじ: 4 giờ). 四分 (よんぷん), 四つ (よっつ).'
        },
        {
          id: 's500_q8',
          number: 8,
          sectionTitle: '第1週 1日目 [語い]',
          question: 'すみません、お手洗いを＿＿＿ください。',
          options: ['かけて', 'かりて', 'かえして', 'かして'],
          correctIndex: 3,
          hint: 'Xin lỗi, cho tôi đi vệ sinh nhờ cái!',
          explanation: '【Đáp án 4: かして】(Sách trang 17): お手洗いを貸してください (Trong trường hợp là "nhà vệ sinh" hay "điện thoại", người ta dùng 貸してください với nghĩa là muốn dùng nhờ).'
        },
        {
          id: 's500_q9',
          number: 9,
          sectionTitle: '第1週 1日目 [文法]',
          question: 'この 道＿＿＿まっすぐ 行って ください。',
          options: ['に', 'を', 'で', 'が'],
          correctIndex: 1,
          hint: 'Hãy đi thẳng con đường này!',
          explanation: '【Đáp án 2: を】(Sách trang 17): Nを (*N = 場所 place / chỗ, địa điểm đi qua/rời khỏi). この道をまっすぐ行ってください.'
        },
        {
          id: 's500_q10',
          number: 10,
          sectionTitle: '第1週 1日目 [文字]',
          question: '<u>ことし</u> 日本へ 来ました。',
          options: ['来年', '去年', '本年', '今年'],
          correctIndex: 3,
          hint: 'Năm nay tôi đã đến Nhật Bản.',
          explanation: '【Đáp án 4: 今年】(Sách trang 19): 今年 (ことし: năm nay). 来年 (らいねん: năm tới), 去年 (きょねん: năm ngoái).'
        },
        {
          id: 's500_q11',
          number: 11,
          sectionTitle: '第1週 1日目 [語い]',
          question: 'あの 先生の 授業は＿＿＿。',
          options: ['つまる', 'つまらない', 'つもる', 'つもらない'],
          correctIndex: 1,
          hint: 'Giờ giảng của thầy giáo đấy buồn tẻ.',
          explanation: '【Đáp án 2: つまらない】(Sách trang 19): つまらない (chán, buồn tẻ ⇔ 面白い: thú vị). つもる (chất đống: 雪が積もる).'
        },
        {
          id: 's500_q12',
          number: 12,
          sectionTitle: '第1週 1日目 [文法]',
          question: '先月 日本に 来ました。来月の 10日＿＿＿います。',
          options: ['まで', 'から', 'か', 'でも'],
          correctIndex: 0,
          hint: 'Tôi đã đến Nhật Bản vào tháng trước. Tôi ở đến ngày mùng 10 tháng sau.',
          explanation: '【Đáp án 1: まで】(Sách trang 19): N1から N2まで (từ N1 đến N2; N1, N2 = 時間・場所 time, place / thời gian, địa điểm).'
        },
        {
          id: 's500_q13',
          number: 13,
          sectionTitle: '第1週 1日目 [文字]',
          question: '<u>今日</u>は 日曜日で、休みです。',
          options: ['きょう', 'きゅう', 'ほんじつ', 'こにち'],
          correctIndex: 0,
          hint: 'Hôm nay là chủ nhật, được nghỉ.',
          explanation: '【Đáp án 1: きょう】(Sách trang 21): 今日 (きょう: hôm nay). 毎日 (まいにち), 休日 (きゅうじつ).'
        },
        {
          id: 's500_q14',
          number: 14,
          sectionTitle: '第1週 1日目 [語い]',
          question: 'これは、＿＿＿食べられない。',
          options: ['まずくて', 'おいしくて', 'やすくて', 'きらくて'],
          correctIndex: 0,
          hint: 'Cái này dở không thể ăn được.',
          explanation: '【Đáp án 1: まずくて】(Sách trang 21): まずい (dở, không ngon ⇔ おいしい: ngon). やすい (rẻ ⇔ たかい: đắt).'
        },
        {
          id: 's500_q15',
          number: 15,
          sectionTitle: '第1週 1日目 [文法]',
          question: 'では、土曜日＿＿＿日曜日にもう一度電話します。',
          options: ['に', 'も', 'や', 'か'],
          correctIndex: 3,
          hint: 'Vậy thứ bảy hoặc chủ nhật tôi sẽ gọi điện lại một lần nữa.',
          explanation: '【Đáp án 4: か】(Sách trang 21): 〜か（〜か） (or / hoặc). コーヒーか紅茶はいかがですか。'
        },
        {
          id: 's500_q16',
          number: 16,
          sectionTitle: '第1週 2日目 [文字]',
          question: 'これから 日本語を <u>勉強</u>します。',
          options: ['ばんきゅう', 'べんきょう', 'べんきゅう', 'ばんきょう'],
          correctIndex: 1,
          hint: 'Từ giờ tôi sẽ học tiếng Nhật.',
          explanation: '【Đáp án 2: べんきょう】(Sách trang 23): 勉強 (べんきょう: học tập). 勉 (ベン: nỗ lực), 強 (キョウ / つよ・い: mạnh).'
        },
        {
          id: 's500_q17',
          number: 17,
          sectionTitle: '第1週 2日目 [語い]',
          question: '今日が＿＿＿で、明日が 三日です。',
          options: ['はつか', 'ふつか', 'よっか', 'はたち'],
          correctIndex: 1,
          hint: 'Hôm nay là mùng hai, ngày mai là mùng ba.',
          explanation: '【Đáp án 2: ふつか】(Sách trang 23): 二日 (ふつか: ngày mùng 2). 一日 (ついたち), 三日 (みっか), 四日 (よっか), 二十日 (はつか), 二十歳 (はたち).'
        },
        {
          id: 's500_q18',
          number: 18,
          sectionTitle: '第1週 2日目 [文法]',
          question: '＿＿＿フランス語が できる 人は いませんか。',
          options: ['だれが', 'だれか', 'だれでも', 'だれも'],
          correctIndex: 1,
          hint: 'Có ai nói được tiếng Pháp không?',
          explanation: '【Đáp án 2: だれか】(Sách trang 23): だれか (somebody / ai đó). だれでも (anybody / ai cũng), だれも〜ない (nobody / không ai).'
        },
        {
          id: 's500_q19',
          number: 19,
          sectionTitle: '第1週 2日目 [文字]',
          question: '父は フランス語が <u>じょうず</u>です。',
          options: ['下手', '手上', '手下', '上手'],
          correctIndex: 3,
          hint: 'Bố tôi giỏi tiếng Pháp.',
          explanation: '【Đáp án 4: 上手】(Sách trang 25): 上手 (じょうず: giỏi) ⇔ 下手 (へた: kém). 父 (フ／ちち: bố).'
        },
        {
          id: 's500_q20',
          number: 20,
          sectionTitle: '第1週 2日目 [語い]',
          question: 'A「東京まで あと どのくらい かかりますか。」\nB「もうすぐ＿＿＿よ。」',
          options: ['つきます', 'でます', 'うごきます', 'かえります'],
          correctIndex: 0,
          hint: 'A: Còn bao lâu nữa thì tới Tokyo? B: Sắp tới nơi rồi.',
          explanation: '【Đáp án 1: つきます】(Sách trang 25): 着く (つ・く: đến nơi), 出る (で・る: rời khỏi), 動く (うご・く: chuyển động), 帰る (かえ・る: về nhà).'
        },
        {
          id: 's500_q21',
          number: 21,
          sectionTitle: '第1週 2日目 [文法]',
          question: 'これは 日本語で＿＿＿言いますか。',
          options: ['なに', 'どう', 'どうやって', 'なぜ'],
          correctIndex: 1,
          hint: 'Cái này Tiếng Nhật nói như thế nào?',
          explanation: '【Đáp án 2: どう】(Sách trang 25): どう言いますか (nói thế nào). [OK: 何と言いますか]. どうやって = bằng phương pháp nào.'
        },
        {
          id: 's500_q22',
          number: 22,
          sectionTitle: '第1週 2日目 [文字]',
          question: '<u>駅</u>まで、タクシーで 十分です。',
          options: ['いき', 'あき', 'うき', 'えき'],
          correctIndex: 3,
          hint: 'Đến ga mất 10 phút đi bằng taxi.',
          explanation: '【Đáp án 4: えき】(Sách trang 27): 駅 (えき: nhà ga). 十 (ジュウ), 分 (フン・ブン / わ・ける).'
        },
        {
          id: 's500_q23',
          number: 23,
          sectionTitle: '第1週 2日目 [語い]',
          question: '＿＿＿、失礼ですが、田中さんでは ありませんか。',
          options: ['ええ', 'あのう', 'ああ', 'じゃあ'],
          correctIndex: 1,
          hint: 'Xin lỗi anh cho tôi hỏi. Anh có phải là anh Tanaka không ạ?',
          explanation: '【Đáp án 2: あのう】(Sách trang 27): あの（う）: Dùng khi gọi/thu hút sự chú ý của đối phương. ああ: ôi, giật cả mình!'
        },
        {
          id: 's500_q24',
          number: 24,
          sectionTitle: '第1週 2日目 [文法]',
          question: 'きのうは、そんなに＿＿＿ね。',
          options: ['寒くないでした', '寒くなかったです', '寒くなかったでした', '寒かったでは ないです'],
          correctIndex: 1,
          hint: 'Hôm qua không đến mức lạnh lắm nhỉ!',
          explanation: '【Đáp án 2: 寒くなかったです】(Sách trang 27): Tính từ đuôi い dạng quá khứ phủ định: 寒い → 寒くない → 寒くなかったです.'
        },
        {
          id: 's500_q25',
          number: 25,
          sectionTitle: '第1週 2日目 [文字]',
          question: '<u>けさ</u>は 七時に 起きて ジョギングしました。',
          options: ['本朝', '分朝', '会朝', '今朝'],
          correctIndex: 3,
          hint: 'Sáng nay, tôi dậy lúc 7 giờ rồi đi bộ.',
          explanation: '【Đáp án 4: 今朝】(Sách trang 29): 今朝 (けさ: sáng nay). 朝 (チョウ／あさ: buổi sáng), 起 (お・きる: thức dậy).'
        },
        {
          id: 's500_q26',
          number: 26,
          sectionTitle: '第1週 2日目 [語い]',
          question: 'チャンネルを かえるから、テレビの＿＿＿を取って ください。',
          options: ['リモコン', 'パソコン', 'エアコン', 'コンピューター'],
          correctIndex: 0,
          hint: 'Tôi muốn chuyển kênh nên lấy cho tôi cái điều khiển ti vi nào!',
          explanation: '【Đáp án 1: リモコン】(Sách trang 29): リモコン (cái điều khiển từ xa), パソコン (máy vi tính), エアコン (máy điều hòa).'
        },
        {
          id: 's500_q27',
          number: 27,
          sectionTitle: '第1週 2日目 [文法]',
          question: '私は テニスが 好きですが、上手＿＿＿。',
          options: ['ありません', 'ないです', 'なりません', 'じゃ ありません'],
          correctIndex: 3,
          hint: 'Tôi thích chơi tenis nhưng không giỏi.',
          explanation: '【Đáp án 4: じゃ ありません】(Sách trang 29): Tính từ đuôi な phủ định: 上手だ → 上手じゃない / 上手じゃありません.'
        },
        {
          id: 's500_q28',
          number: 28,
          sectionTitle: '第1週 2日目 [文字]',
          question: '休みの 日は <u>母</u>に 電話を します。',
          options: ['はは', 'ちち', 'まま', 'かか'],
          correctIndex: 0,
          hint: 'Vào ngày nghỉ, tôi gọi điện thoại cho mẹ.',
          explanation: '【Đáp án 1: はは】(Sách trang 31): 母 (はは: mẹ mình; お母さん: mẹ người khác). 電話 (でんわ).'
        },
        {
          id: 's500_q29',
          number: 29,
          sectionTitle: '第1週 2日目 [語い]',
          question: 'A「ただいま。」\nB「＿＿＿。」',
          options: ['いってきます', 'いただきます', 'いらっしゃいませ', 'おかえりなさい'],
          correctIndex: 3,
          hint: 'A: Anh về rồi đây! B: Anh đã về rồi ạ!',
          explanation: '【Đáp án 4: おかえりなさい】(Sách trang 31): ただいま (Tôi đã về) - おかえりなさい (Chào bạn đã về). いってきます - いってらっしゃい.'
        },
        {
          id: 's500_q30',
          number: 30,
          sectionTitle: '第1週 2日目 [文法]',
          question: '田中さんは＿＿＿やさしい 人です。',
          options: ['きれいで', 'きれくて', 'きれいと', 'きれい'],
          correctIndex: 0,
          hint: 'Chị Tanaka là một người đẹp và tốt bụng.',
          explanation: '【Đáp án 1: きれいで】(Sách trang 31): Nối tính từ đuôi な dùng で: きれいな ＋ やさしい → きれいで優しい人.'
        }
      ]
    },

    // =======================================================================
    // TUẦN 1: 3日目〜4日目
    // =======================================================================
    {
      id: 's500_w1_u2',
      unitNumber: 2,
      title: '第1週 3日目・4日目: 文字・語い・文法 (Câu 31 - 60)',
      japaneseTitle: '第1週 3日目〜4日目',
      pageRange: 'Trang 32 - 51',
      topic: 'Chữ Hán (学生, 本屋, 明るい, 午後, 車), Từ vựng (でかける, うすい, うるさい), Ngữ pháp (〜の, 〜ている, あげる/もらう)',
      description: '30 câu hỏi luyện tập sâu về đọc Hán tự, phó từ cảm xúc và cấu trúc bổ nghĩa cho danh từ / cho nhận.',
      questions: [
        {
          id: 's500_q31',
          number: 31,
          sectionTitle: '第1週 3日目 [文字]',
          question: '先生が <u>学生</u>に 話を します。',
          options: ['がせい', 'がくせい', 'がくせん', 'がっせい'],
          correctIndex: 1,
          hint: 'Thầy giáo nói chuyện với sinh viên.',
          explanation: '【Đáp án 2: がくせい】(Sách trang 33): 学生 (がくせい: học sinh, sinh viên). 先生 (せんせい).'
        },
        {
          id: 's500_q32',
          number: 32,
          sectionTitle: '第1週 3日目 [語い]',
          question: 'いい 天気だから、どこかへ＿＿＿か。',
          options: ['でかけません', 'でません', 'あそびません', 'きません'],
          correctIndex: 0,
          hint: 'Trời đẹp, vì vậy đi đâu đó chơi không?',
          explanation: '【Đáp án 1: でかけません】(Sách trang 33): でかける (đi ra ngoài). [OK: 遊びに行きませんか].'
        },
        {
          id: 's500_q33',
          number: 33,
          sectionTitle: '第1週 3日目 [文法]',
          question: 'A「あなたの コーヒーカップは どれですか。」\nB「いちばん＿＿＿です。」',
          options: ['大きかった', '大きもの', '大きいの', '大きい'],
          correctIndex: 2,
          hint: 'A: Cốc cà phê của bạn là cái nào? B: Cốc to nhất.',
          explanation: '【Đáp án 3: 大きいの】(Sách trang 33): 〜の (trợ từ dùng thay thế cho một danh từ đã nói đến ở đằng trước: 大きいコーヒーカップ → 大きいの).'
        },
        {
          id: 's500_q34',
          number: 34,
          sectionTitle: '第1週 3日目 [文字]',
          question: '<u>ほんや</u>は 駅の 前に あります。',
          options: ['書店', '書屋', '本店', '本屋'],
          correctIndex: 3,
          hint: 'Hiệu sách nằm ở trước nhà ga.',
          explanation: '【Đáp án 4: 本屋】(Sách trang 35): 本屋 (ほんや: hiệu sách = 書店: しょてん).'
        },
        {
          id: 's500_q35',
          number: 35,
          sectionTitle: '第1週 3日目 [語い]',
          question: '毎朝、6時に＿＿＿仕事に 行きます。',
          options: ['おいて', 'おきて', 'おこして', 'おして'],
          correctIndex: 1,
          hint: 'Hàng sáng, tôi dậy lúc 6 giờ và đi làm.',
          explanation: '【Đáp án 2: おきて】(Sách trang 35): 起きる (お・きる: thức dậy), 起こす (お・こす: đánh thức ai dậy).'
        },
        {
          id: 's500_q36',
          number: 36,
          sectionTitle: '第1週 3日目 [文法]',
          question: 'あの＿＿＿人は だれですか。',
          options: ['かみは 長いの', 'かみは 長い', 'かみの 長いの', 'かみの 長い'],
          correctIndex: 3,
          hint: 'Người tóc dài kia là ai đấy?',
          explanation: '【Đáp án 4: かみの 長い】(Sách trang 35): N1の〜N2 (*連体修飾節 định ngữ bổ nghĩa cho danh từ: 髪の長い人 = 髪が長い人).'
        },
        {
          id: 's500_q37',
          number: 37,
          sectionTitle: '第1週 3日目 [文字]',
          question: '田中さんは <u>明るい</u> 人です。',
          options: ['あかるい', 'あきるい', 'あくるい', 'あけるい'],
          correctIndex: 0,
          hint: 'Anh Tanaka là người vui vẻ, tươi sáng.',
          explanation: '【Đáp án 1: あかるい】(Sách trang 37): 明るい (あかるい: sáng sủa, vui tươi).'
        },
        {
          id: 's500_q38',
          number: 38,
          sectionTitle: '第1週 3日目 [語い]',
          question: 'この 紙は＿＿＿ですが、とても じょうぶです。',
          options: ['うすい', 'あつい', 'こい', 'すずしい'],
          correctIndex: 0,
          hint: 'Giấy này mỏng nhưng rất chắc chắn.',
          explanation: '【Đáp án 1: うすい】(Sách trang 37): 薄い (うすい: mỏng, nhạt ⇔ 厚い: あつい dày; 濃い: こい đậm).'
        },
        {
          id: 's500_q39',
          number: 39,
          sectionTitle: '第1週 3日目 [文法]',
          question: '私は あの 人を＿＿＿。',
          options: ['しません', 'していません', 'しりません', 'しって いません'],
          correctIndex: 2,
          hint: 'Tôi không biết người đó.',
          explanation: '【Đáp án 3: しりません】(Sách trang 37): 知っている (biết) ⇔ 知りません (không biết). Không nói: 知っていません.'
        },
        {
          id: 's500_q40',
          number: 40,
          sectionTitle: '第1週 3日目 [文字]',
          question: '明日の <u>ごご</u>は 雨でしょう。',
          options: ['牛後', '午後', '午前', '牛前'],
          correctIndex: 1,
          hint: 'Có lẽ chiều mai trời sẽ mưa.',
          explanation: '【Đáp án 2: 午後】(Sách trang 39): 午後 (ごご: buổi chiều ⇔ 午前: ごぜん buổi sáng).'
        },
        {
          id: 's500_q41',
          number: 41,
          sectionTitle: '第1週 3日目 [語い]',
          question: '赤ちゃんの 泣き声が＿＿＿、ねられなかった。',
          options: ['げんきで', 'うるさくて', 'にぎやかで', 'いそがしくて'],
          correctIndex: 1,
          hint: 'Tiếng trẻ nhỏ khóc ầm ĩ, không tài nào ngủ được.',
          explanation: '【Đáp án 2: うるさくて】(Sách trang 39): うるさい (ồn ào, ầm ĩ ⇔ 静かな: yên tĩnh). にぎやかな (nhộn nhịp).'
        },
        {
          id: 's500_q42',
          number: 42,
          sectionTitle: '第1週 3日目 [文法]',
          question: '近くの スーパーは 夜 10時まで＿＿＿。',
          options: ['あいて います', 'あけて います', 'あきます', 'あけます'],
          correctIndex: 0,
          hint: 'Siêu thị ở gần mở cửa đến 10 giờ đêm.',
          explanation: '【Đáp án 1: あいて います】(Sách trang 39): Tự động từ 開く: 開いています (đang mở cửa trạng thái).'
        },
        {
          id: 's500_q43',
          number: 43,
          sectionTitle: '第1週 3日目 [文字]',
          question: 'ガソリンが 高くても <u>車</u>に のります。',
          options: ['しゃ', 'ちゃ', 'かるま', 'くるま'],
          correctIndex: 3,
          hint: 'Cho dù xăng đắt, tôi cũng vẫn đi ô tô.',
          explanation: '【Đáp án 4: くるま】(Sách trang 41): 車 (くるま / シャ: ô tô, xe).'
        },
        {
          id: 's500_q44',
          number: 44,
          sectionTitle: '第1週 3日目 [語い]',
          question: '明日は 雪が＿＿＿そうですよ。',
          options: ['おりる', 'ふる', 'おちる', 'とまる'],
          correctIndex: 1,
          hint: 'Nghe nói ngày mai tuyết rơi đấy.',
          explanation: '【Đáp án 2: ふる】(Sách trang 41): 雪が降る (tuyết rơi), 雨が降る (mưa rơi).'
        },
        {
          id: 's500_q45',
          number: 45,
          sectionTitle: '第1週 3日目 [文法]',
          question: 'A「すてきな シャツですね。」\nB「ありがとうございます。兄に＿＿＿。」',
          options: ['もらったんです', 'あげたんです', 'くれたんです', 'やったんです'],
          correctIndex: 0,
          hint: 'A: Áo đẹp thế nhỉ! B: Cảm ơn! Anh tôi cho đấy.',
          explanation: '【Đáp án 1: もらったんです】(Sách trang 41): Nに/からもらう (nhận từ ai). 兄にもらったんです: nhận được từ anh trai.'
        },
        {
          id: 's500_q46',
          number: 46,
          sectionTitle: '第1週 4日目 [文字]',
          question: '<u>先月</u>、花見を しました。',
          options: ['せんげつ', 'せんがつ', 'さんがつ', 'さんげつ'],
          correctIndex: 0,
          hint: 'Tháng trước tôi đi ngắm hoa.',
          explanation: '【Đáp án 1: せんげつ】(Sách trang 43): 先月 (せんげつ: tháng trước). 花見 (はなみ: ngắm hoa).'
        },
        {
          id: 's500_q47',
          number: 47,
          sectionTitle: '第1週 4日目 [語い]',
          question: 'この へやは、だんぼうが 入って いて＿＿＿です。',
          options: ['さむい', 'つめたい', 'あたたかい', 'すずしい'],
          correctIndex: 2,
          hint: 'Phòng này có điều hòa nóng nên ấm.',
          explanation: '【Đáp án 3: あたたかい】(Sách trang 43): 暖かい (あたたかい: ấm áp), 冷たい (つめたい: lạnh), 涼しい (すずしい: mát).'
        },
        {
          id: 's500_q48',
          number: 48,
          sectionTitle: '第1週 4日目 [文法]',
          question: '私は、先月から 子どもに 英語を＿＿＿。',
          options: ['教えます', '教えました', '教えたんです', '教えています'],
          correctIndex: 3,
          hint: 'Tôi đang dạy tiếng Anh cho trẻ con từ tháng trước.',
          explanation: '【Đáp án 4: 教えています】(Sách trang 43): Vている biểu thị hành động đang tiếp diễn hoặc thói quen/nghề nghiệp liên tục.'
        },
        {
          id: 's500_q49',
          number: 49,
          sectionTitle: '第1週 4日目 [文字]',
          question: '一か月に <u>いっかい</u>、友だちと 会います。',
          options: ['一度', '一回', '一会', '一目'],
          correctIndex: 1,
          hint: 'Tôi gặp bạn bè tháng một lần.',
          explanation: '【Đáp án 2: 一回】(Sách trang 45): 一回 (いっかい: một lần). 回 (カイ / まわ・る).'
        },
        {
          id: 's500_q50',
          number: 50,
          sectionTitle: '第1週 4日目 [語い]',
          question: 'ここから 駅まで どのくらい 時間が＿＿＿か。',
          options: ['かけます', 'かかります', 'あります', 'すぎます'],
          correctIndex: 1,
          hint: 'Từ đây đến ga mất bao nhiêu thời gian?',
          explanation: '【Đáp án 2: かかります】(Sách trang 45): 時間がかかる (mất thời gian), お金がかかる (tốn tiền).'
        },
        {
          id: 's500_q51',
          number: 51,
          sectionTitle: '第1週 4日目 [文法]',
          question: '田中さん、今日も＿＿＿ね。まだ 病気かな。',
          options: ['こない', 'きない', 'くない', 'いかない'],
          correctIndex: 0,
          hint: 'Anh Tanaka hôm nay cũng không đến nhỉ. Chắc vẫn còn ốm chăng?',
          explanation: '【Đáp án 1: こない】(Sách trang 45): Động từ 来る (くる) chia phủ định thể ngắn là 来ない (こない).'
        },
        {
          id: 's500_q52',
          number: 52,
          sectionTitle: '第1週 4日目 [文字]',
          question: '電車で <u>新聞</u>を 読みます。',
          options: ['しんぶん', 'しんむん', 'しんもん', 'しんぼん'],
          correctIndex: 0,
          hint: 'Tôi đọc báo trong tàu điện.',
          explanation: '【Đáp án 1: しんぶん】(Sách trang 47): 新聞 (しんぶん: báo chí). 新 (シン / あたら・しい: mới), 聞 (ブン / き・く: nghe).'
        },
        {
          id: 's500_q53',
          number: 53,
          sectionTitle: '第1週 4日目 [語い]',
          question: '＿＿＿が ないから、洗えないよ。',
          options: ['せんざい', 'せんたく', 'クリーニング', 'そうじ'],
          correctIndex: 0,
          hint: 'Không có nước rửa bát nên không thể rửa được đâu đấy.',
          explanation: '【Đáp án 1: せんざい】(Sách trang 47): 洗剤 (せんざい: xà phòng, nước rửa bát, bột giặt). 洗濯 (せんたく: giặt giũ).'
        },
        {
          id: 's500_q54',
          number: 54,
          sectionTitle: '第1週 4日目 [文法]',
          question: '田中さん、今度 いっしょに 映画に＿＿＿か。',
          options: ['行くでしょう', '行きませんか', '行きましょうか', '行くません'],
          correctIndex: 1,
          hint: 'Anh Tanaka này, lần tới cùng tôi đi xem phim không?',
          explanation: '【Đáp án 2: 行きませんか】(Sách trang 47): Vませんか / Vない? (*誘いを表す thể hiện ý rủ rê mời mọc).'
        },
        {
          id: 's500_q55',
          number: 55,
          sectionTitle: '第1週 4日目 [文字]',
          question: '五時に 学校から <u>かえりました</u>。',
          options: ['借りました', '入りました', '通りました', '帰りました'],
          correctIndex: 3,
          hint: '5 giờ, tôi đi học về.',
          explanation: '【Đáp án 4: 帰りました】(Sách trang 49): 帰る (か・える: về nhà, về nước).'
        },
        {
          id: 's500_q56',
          number: 56,
          sectionTitle: '第1週 4日目 [語い]',
          question: 'あ、この 車、ガソリンが ほとんど＿＿＿いないよ。',
          options: ['かって', 'はいって', 'いれて', 'なくなって'],
          correctIndex: 1,
          hint: 'A, xe ô tô này hầu như không còn xăng.',
          explanation: '【Đáp án 2: はいって】(Sách trang 49): 入る (はい・る: có, chứa trong đó). ガソリンが入っていない.'
        },
        {
          id: 's500_q57',
          number: 57,
          sectionTitle: '第1週 4日目 [文法]',
          question: 'A「まどを＿＿＿。」\nB「はい、おねがいします。」',
          options: ['開けましょうか', '開けても いいですか', '開けなさい', '開けて くれませんか'],
          correctIndex: 0,
          hint: 'A: Tôi có thể mở cửa sổ ra được không? B: Vâng, nhờ anh mở ra!',
          explanation: '【Đáp án 1: 開けましょうか】(Sách trang 49): Vましょうか (Shall I ~? / Tôi làm giúp ~ được không?).'
        },
        {
          id: 's500_q58',
          number: 58,
          sectionTitle: '第1週 4日目 [文字]',
          question: 'あの 子は 私の <u>妹</u>です。',
          options: ['いもと', 'いもうと', 'おとと', 'おとうと'],
          correctIndex: 1,
          hint: 'Đứa bé này là em gái tôi.',
          explanation: '【Đáp án 2: いもうと】(Sách trang 51): 妹 (いもうと: em gái). 弟 (おとうと: em trai).'
        },
        {
          id: 's500_q59',
          number: 59,
          sectionTitle: '第1週 4日目 [語い]',
          question: '明日は テストが あるから、学校へ 行くのが＿＿＿です。',
          options: ['いや', 'ひどい', 'むり', 'きらい'],
          correctIndex: 0,
          hint: 'Ngày mai có bài kiểm tra nên tôi không muốn đến trường.',
          explanation: '【Đáp án 1: いや】(Sách trang 51): いやな (ghét, không thích), むりな (quá sức, không thể).'
        },
        {
          id: 's500_q60',
          number: 60,
          sectionTitle: '第1週 4日目 [文法]',
          question: 'のどが かわいたね。何か＿＿＿よ。',
          options: ['飲んだ', '飲もう', '飲みなさい', '飲んでない'],
          correctIndex: 1,
          hint: 'Khát nhỉ! Uống cái gì đi thôi.',
          explanation: '【Đáp án 2: 飲もう】(Sách trang 51): Vよう (*意向形 thể ý chí: 飲む → 飲もう: cùng uống nào).'
        }
      ]
    },

    // =======================================================================
    // TUẦN 1: 5日目〜6日目 & 7日目 (Ôn tập)
    // =======================================================================
    {
      id: 's500_w1_u3',
      unitNumber: 3,
      title: '第1週 5日目〜7日目: Tổng ôn tuần 1 (Câu 61 - 125)',
      japaneseTitle: '第1週 5日目〜7日目（復習）',
      pageRange: 'Trang 52 - 78',
      topic: 'Chữ Hán (英語, 切る, 有名, 去年, 林, 働く), Từ vựng (重い, さす, きょうだい), Ngữ pháp (〜たい, 〜から, 〜ないで, 7日目テスト)',
      description: 'Tổng kết tuần 1 từ câu 61 đến 125 bao gồm toàn bộ bài tập ngày 5, ngày 6 và bài test tổng hợp ngày thứ 7.',
      questions: [
        {
          id: 's500_q61',
          number: 61,
          sectionTitle: '第1週 5日目 [文字]',
          question: '<u>英語</u>の 歌を 歌いましょう。',
          options: ['えご', 'えが', 'えいご', 'えいが'],
          correctIndex: 2,
          hint: 'Hãy hát một bài tiếng Anh nào!',
          explanation: '【Đáp án 3: えいご】(Sách trang 53): 英語 (えいご: tiếng Anh). 歌 (うた: bài hát).'
        },
        {
          id: 's500_q62',
          number: 62,
          sectionTitle: '第1週 5日目 [語い]',
          question: 'この ベッドは＿＿＿、一人で 動かせない。',
          options: ['あつくて', 'おもくて', 'おおくて', 'かたくて'],
          correctIndex: 1,
          hint: 'Cái giường này nặng, một người không thể xê dịch được.',
          explanation: '【Đáp án 2: おもくて】(Sách trang 53): 重い (おもい: nặng ⇔ 軽い: かるい nhẹ).'
        },
        {
          id: 's500_q63',
          number: 63,
          sectionTitle: '第1週 5日目 [文法]',
          question: '一年前は、ひらがなも＿＿＿が、今は 漢字も だいぶ 分かります。',
          options: ['読めませんでした', '読みませんでした', '読んで いませんでした', '読まなかったです'],
          correctIndex: 0,
          hint: 'Một năm trước, đến cả chữ Hiragana tôi cũng không đọc được nhưng bây giờ thì chữ Hán cũng biết được khá nhiều.',
          explanation: '【Đáp án 1: 読めませんでした】(Sách trang 53): Thể khả năng Vられる: 読む → 読める → 読めませんでした.'
        },
        {
          id: 's500_q64',
          number: 64,
          sectionTitle: '第1週 5日目 [文字]',
          question: '大きいから 半分に <u>きって</u> ください。',
          options: ['聞いて', '来て', '切って', '着て'],
          correctIndex: 2,
          hint: 'To nên hãy cắt đôi ra!',
          explanation: '【Đáp án 3: 切って】(Sách trang 55): 切る (き・る: cắt). 大 (ダイ / おお・きい), 半 (ハン).'
        },
        {
          id: 's500_q65',
          number: 65,
          sectionTitle: '第1週 5日目 [語い]',
          question: 'A「新しい 仕事は どうですか。」\nB「うーん、あんまり＿＿＿…。」',
          options: ['いそがないんです', 'いそがしいんです', 'ゆっくりなんです', 'おもしろくないんです'],
          correctIndex: 3,
          hint: 'A: Công việc mới thế nào? B: Ừ, chẳng thú vị lắm.',
          explanation: '【Đáp án 4: おもしろくないんです】(Sách trang 55): 面白い (thú vị) ⇔ つまらない. あんまり＋Phủ định: không thú vị lắm.'
        },
        {
          id: 's500_q66',
          number: 66,
          sectionTitle: '第1週 5日目 [文法]',
          question: 'もしもし、もしもし、よく＿＿＿んですが…。',
          options: ['聞こえない', '聞いてない', '聞けない', '聞かない'],
          correctIndex: 0,
          hint: 'A lô... A lô... Không nghe rõ...',
          explanation: '【Đáp án 1: 聞こえない】(Sách trang 55): 聞こえる (tiếng tự lọt vào tai, nghe thấy) ⇔ 聞こえない.'
        },
        {
          id: 's500_q67',
          number: 67,
          sectionTitle: '第1週 5日目 [文字]',
          question: 'あの 女の人は <u>有名な</u> 歌手です。',
          options: ['ようめい', 'ゆうめい', 'ゆうみん', 'ようみん'],
          correctIndex: 1,
          hint: 'Người phụ nữ ấy là ca sỹ nổi tiếng.',
          explanation: '【Đáp án 2: ゆうめい】(Sách trang 57): 有名な (ゆうめいな: nổi tiếng).'
        },
        {
          id: 's500_q68',
          number: 68,
          sectionTitle: '第1週 5日目 [語い]',
          question: '荷物を たくさん 持って かさを＿＿＿のは たいへんだ。',
          options: ['あける', 'さす', 'つける', 'はく'],
          correctIndex: 1,
          hint: 'Vừa mang nhiều đồ vừa cầm ô khá vất vả.',
          explanation: '【Đáp án 2: さす】(Sách trang 57): 傘を差す (かさをさす: che ô, cầm ô).'
        },
        {
          id: 's500_q69',
          number: 69,
          sectionTitle: '第1週 5日目 [文法]',
          question: 'A「田中さんも 中村さんも 来て いましたよ。」\nB「私も みんなに＿＿＿です。」',
          options: ['会えなかった', '会いたかった', '会いたいでした', '会いたくなった'],
          correctIndex: 1,
          hint: 'A: Cả anh Tanaka và anh Nakamura đều đến đấy! B: Tôi cũng đã gặp mọi người rồi.',
          explanation: '【Đáp án 2: 会いたかった】(Sách trang 57): Thể Vたい dạng quá khứ: 会いたい → 会いたかったです.'
        },
        {
          id: 's500_q70',
          number: 70,
          sectionTitle: '第1週 5日目 [文字]',
          question: '兄は <u>きょねん</u>、大学に 入りました。',
          options: ['前年', '今年', '来年', '去年'],
          correctIndex: 3,
          hint: 'Năm ngoái, anh trai tôi vào đại học.',
          explanation: '【Đáp án 4: 去年】(Sách trang 59): 去年 (きょねん: năm ngoái).'
        },
        {
          id: 's500_q71',
          number: 71,
          sectionTitle: '第1週 5日目 [語い]',
          question: '熱が＿＿＿ましたか。',
          options: ['さがり', 'さげ', 'おり', 'おち'],
          correctIndex: 0,
          hint: 'Đã hạ sốt chưa?',
          explanation: '【Đáp án 1: さがり】(Sách trang 59): 下がる (さがる: hạ, xuống ⇔ 上がる: lên). 熱が下がりましたか.'
        },
        {
          id: 's500_q72',
          number: 72,
          sectionTitle: '第1週 5日目 [文法]',
          question: '明日の 夕方ごろから、雨が 強く＿＿＿でしょう。',
          options: ['ふる', 'ふり', 'ふった', 'ふって いる'],
          correctIndex: 0,
          hint: 'Có lẽ từ chiều mai trời sẽ mưa to.',
          explanation: '【Đáp án 1: ふる】(Sách trang 59): Thể thông thường (nguyên mẫu) + でしょう (*推量を表す: dự đoán).'
        },
        {
          id: 's500_q73',
          number: 73,
          sectionTitle: '第1週 5日目 [文字]',
          question: 'あの <u>林</u>の 中を 歩いて 行きませんか。',
          options: ['あぬいて', 'あるいて', 'あのいて', 'あろいて'],
          correctIndex: 1,
          hint: 'Đi bộ vào trong rừng kia không?',
          explanation: '【Đáp án 2: あるいて】(Sách trang 61): 歩く (ある・く: đi bộ). 林 (はやし: rừng thưa).'
        },
        {
          id: 's500_q74',
          number: 74,
          sectionTitle: '第1週 5日目 [語い]',
          question: '私は 3人＿＿＿の まん中です。',
          options: ['こども', 'ふうふ', 'きょうだい', 'かぞく'],
          correctIndex: 2,
          hint: 'Tôi là con thứ hai trong gia đình có ba anh em.',
          explanation: '【Đáp án 3: きょうだい】(Sách trang 61): 3人兄弟 (3 anh chị em tính cả bản thân).'
        },
        {
          id: 's500_q75',
          number: 75,
          sectionTitle: '第1週 5日目 [文法]',
          question: '私は 歌が＿＿＿、カラオケに 行きたくない。',
          options: ['へたから', 'へたながら', 'へただから', 'へたでから'],
          correctIndex: 2,
          hint: 'Tôi hát dở nên không muốn đi karaoke.',
          explanation: '【Đáp án 3: へただから】(Sách trang 61): Tính từ đuôi な + だから (*理由 lý do: 下手だから = 下手なので).'
        },
        {
          id: 's500_q76',
          number: 76,
          sectionTitle: '第1週 6日目 [文字]',
          question: 'ここに <u>名前</u>と 電話番号を 書いて ください。',
          options: ['なまえ', 'なめえ', 'なめい', 'なまい'],
          correctIndex: 0,
          hint: 'Hãy viết tên và số điện thoại liên lạc vào đây!',
          explanation: '【Đáp án 1: なまえ】(Sách trang 63): 名前 (なまえ: tên họ).'
        },
        {
          id: 's500_q77',
          number: 77,
          sectionTitle: '第1週 6日目 [語い]',
          question: 'この ビルは＿＿＿ですね。何階まで あるのでしょうか。',
          options: ['たかい', 'ほそい', 'ふとい', 'ながい'],
          correctIndex: 0,
          hint: 'Tòa nhà này cao nhỉ! Có bao nhiêu tầng vậy?',
          explanation: '【Đáp án 1: たかい】(Sách trang 63): 高い (たかい: cao ⇔ 低い: ひくい thấp).'
        },
        {
          id: 's500_q78',
          number: 78,
          sectionTitle: '第1週 6日目 [文法]',
          question: 'かぜを＿＿＿、学校を 休みました。',
          options: ['引きて', '引くから', '引いて', '引きたから'],
          correctIndex: 2,
          hint: 'Tôi bị cảm nên nghỉ học.',
          explanation: '【Đáp án 3: 引いて】(Sách trang 63): Vて (~て / ~で: vì lí do gì: 風邪を引いて、学校を休んだ).'
        },
        {
          id: 's500_q79',
          number: 79,
          sectionTitle: '第1週 6日目 [文字]',
          question: 'ちょっと <u>ちず</u>を 見せて ください',
          options: ['池国', '池図', '地国', '地図'],
          correctIndex: 3,
          hint: 'Cho tôi xem bản đồ một chút!',
          explanation: '【Đáp án 4: 地図】(Sách trang 65): 地図 (ちず: bản đồ).'
        },
        {
          id: 's500_q80',
          number: 80,
          sectionTitle: '第1週 6日目 [語い]',
          question: '会社まで 遠いので、毎日電車で＿＿＿のは たいへんです。',
          options: ['つとめる', 'はたらく', 'のる', 'かよう'],
          correctIndex: 3,
          hint: 'Đến công ty xa nên hàng ngày tôi đi đi về về bằng tàu điện khá vất vả.',
          explanation: '【Đáp án 4: かよう】(Sách trang 65): 通う (かよ・う: đi lại đều đặn). 電車で通うのは大変です.'
        },
        {
          id: 's500_q81',
          number: 81,
          sectionTitle: '第1週 6日目 [文法]',
          question: '朝＿＿＿すぐに シャワーを あびます。',
          options: ['起きるから', '起きた', '起きて', '起きたから'],
          correctIndex: 2,
          hint: 'Buổi sáng thức dậy, tôi tắm vòi hoa sen luôn.',
          explanation: '【Đáp án 3: 起きて】(Sách trang 65): Vて（すぐに）: làm gì đó ngay sau khi (起きてすぐに).'
        },
        {
          id: 's500_q82',
          number: 82,
          sectionTitle: '第1週 6日目 [文字]',
          question: '来週、<u>国</u>へ 帰ります。',
          options: ['こに', 'にく', 'くに', 'こく'],
          correctIndex: 2,
          hint: 'Tuần sau, tôi về Mỹ / về nước.',
          explanation: '【Đáp án 3: くに】(Sách trang 67): 国 (くに: đất nước, quê hương).'
        },
        {
          id: 's500_q83',
          number: 83,
          sectionTitle: '第1週 6日目 [語い]',
          question: '＿＿＿家ですが、一度 あそびに 来て ください。',
          options: ['ほそい', 'せまい', 'すくない', 'ちょっと'],
          correctIndex: 1,
          hint: 'Nhà tôi hơi chật nhưng hãy đến chơi một lần cho biết!',
          explanation: '【Đáp án 2: せまい】(Sách trang 67): 狭い (せまい: hẹp, chật chội ⇔ 広い: ひろい rộng).'
        },
        {
          id: 's500_q84',
          number: 84,
          sectionTitle: '第1週 6日目 [文法]',
          question: '宿題を＿＿＿学校へ 来ました。',
          options: ['しないから', 'しないで', 'しないが', 'しないて'],
          correctIndex: 1,
          hint: 'Tôi đã không làm bài tập mà đến trường.',
          explanation: '【Đáp án 2: しないで】(Sách trang 67): Vないで (without -ing / không V mà: 宿題をしないで学校へ来た).'
        },
        {
          id: 's500_q85',
          number: 85,
          sectionTitle: '第1週 6日目 [文字]',
          question: '図書館で 本を <u>かります</u>。',
          options: ['借ります', '貸ります', '質ります', '便ります'],
          correctIndex: 0,
          hint: 'Tôi mượn sách ở thư viện.',
          explanation: '【Đáp án 1: 借ります】(Sách trang 69): 借りる (か・りる: mượn ⇔ 貸す: か・す cho mượn).'
        },
        {
          id: 's500_q86',
          number: 86,
          sectionTitle: '第1週 6日目 [語い]',
          question: 'この たなは とても＿＿＿使いやすいです。',
          options: ['だいじょうぶで', 'たいへんで', 'じょうぶで', 'よわくて'],
          correctIndex: 2,
          hint: 'Cái giá này vừa rất chắc chắn vừa dễ sử dụng.',
          explanation: '【Đáp án 3: じょうぶで】(Sách trang 69): 丈夫な (じょうぶな: bền, chắc chắn).'
        },
        {
          id: 's500_q87',
          number: 87,
          sectionTitle: '第1週 6日目 [文法]',
          question: 'レストランで＿＿＿話しましょう。',
          options: ['食べなくて', '食べないで', '食べるから', '食べながら'],
          correctIndex: 3,
          hint: 'Vừa ăn uống vừa nói chuyện ở nhà hàng nào!',
          explanation: '【Đáp án 4: 食べながら】(Sách trang 69): V1ながら V2 (vừa V1 vừa V2): 食べながら話しましょう.'
        },
        {
          id: 's500_q88',
          number: 88,
          sectionTitle: '第1週 6日目 [文字]',
          question: '弟は レストランで <u>働いて</u> います。',
          options: ['はらたいて', 'はたらいて', 'はだらいて', 'はらだいて'],
          correctIndex: 1,
          hint: 'Em trai tôi đang làm ở nhà hàng.',
          explanation: '【Đáp án 2: はたらいて】(Sách trang 71): 働く (はたら・く: làm việc).'
        },
        {
          id: 's500_q89',
          number: 89,
          sectionTitle: '第1週 6日目 [語い]',
          question: 'ここまで 遠かったでしょう。＿＿＿いらっしゃいました。',
          options: ['こんなに', 'いつも', 'とても', 'よく'],
          correctIndex: 3,
          hint: 'Đến đây xa phải không? Anh đến được đây quý hóa lắm!',
          explanation: '【Đáp án 4: よく】(Sách trang 71): よく (rất, khéo / chào đón nồng nhiệt: よく いらっしゃいました).'
        },
        {
          id: 's500_q90',
          number: 90,
          sectionTitle: '第1週 6日目 [文法]',
          question: '病気は なおりました。もう＿＿＿食べられます。',
          options: ['なんでも', 'なにも', 'ぜんぜん', 'あんまり'],
          correctIndex: 0,
          hint: 'Khỏi bệnh rồi. Giờ thì cái gì cũng có thể ăn.',
          explanation: '【Đáp án 1: なんでも】(Sách trang 71): 何でも (anything / cái gì cũng). なにも〜ない (chẳng gì cả).'
        },
        // 7日目 (復習 91 - 125)
        {
          id: 's500_q91',
          number: 91,
          sectionTitle: '第1週 7日目 復習 [文字]',
          question: 'デパートの <u>屋上</u>に 上がる。',
          options: ['やじょう', 'おくじょう'],
          correctIndex: 1,
          hint: 'Lên sân thượng của trung tâm thương mại.',
          explanation: '【Đáp án 2: おくじょう】(Sách trang 73): 屋上 (おくじょう: sân thượng).'
        },
        {
          id: 's500_q92',
          number: 92,
          sectionTitle: '第1週 7日目 復習 [文字]',
          question: 'ラジオを <u>ききます</u>。',
          options: ['聞きます', '開きます'],
          correctIndex: 0,
          hint: 'Nghe đài phát thanh.',
          explanation: '【Đáp án 1: 聞きます】(Sách trang 73): 聞く (き・く: nghe).'
        },
        {
          id: 's500_q93',
          number: 93,
          sectionTitle: '第1週 7日目 復習 [語い]',
          question: 'ちょっと＿＿＿です。エアコンの 温度を 上げて ください。',
          options: ['あたたかい', 'さむい'],
          correctIndex: 1,
          hint: 'Hơi lạnh đấy. Tăng nhiệt độ điều hòa lên giúp tôi!',
          explanation: '【Đáp án 2: さむい】(Sách trang 73): 寒い (さむい: lạnh).'
        },
        {
          id: 's500_q94',
          number: 94,
          sectionTitle: '第1週 7日目 復習 [語い]',
          question: 'A「それ、買ったの？」\nB「ううん、図書館で＿＿＿。」',
          options: ['かりたの', 'かしたの'],
          correctIndex: 0,
          hint: 'A: Cái đó mua à? B: Không, mượn ở thư viện đấy.',
          explanation: '【Đáp án 1: かりたの】(Sách trang 73): 借りる (かりる: mượn).'
        },
        {
          id: 's500_q95',
          number: 95,
          sectionTitle: '第1週 7日目 復習 [文法]',
          question: '今日は、あまり＿＿＿です。',
          options: ['暑くなかった', '暑いじゃなかった'],
          correctIndex: 0,
          hint: 'Hôm nay không nóng lắm.',
          explanation: '【Đáp án 1: 暑くなかった】(Sách trang 73): Tính từ đuôi い: 暑い → 暑くなかったです.'
        },
        {
          id: 's500_q96',
          number: 96,
          sectionTitle: '第1週 7日目 復習 [文法]',
          question: 'インターネット＿＿＿調べる。',
          options: ['が', 'で'],
          correctIndex: 1,
          hint: 'Tra cứu bằng Internet.',
          explanation: '【Đáp án 2: で】(Sách trang 73): インターネットで (chỉ phương tiện, cách thức).'
        },
        {
          id: 's500_q97',
          number: 97,
          sectionTitle: '第1週 7日目 復習 [文字]',
          question: '<u>大人</u>は 千円、子どもは 五百円です。',
          options: ['おとな', 'おたな'],
          correctIndex: 0,
          hint: 'Người lớn 1000 yên, trẻ em 500 yên.',
          explanation: '【Đáp án 1: おとな】(Sách trang 74): 大人 (おとな: người lớn).'
        },
        {
          id: 's500_q98',
          number: 98,
          sectionTitle: '第1週 7日目 復習 [文字]',
          question: '<u>ちず</u>を かきましょうか。',
          options: ['地理', '地図'],
          correctIndex: 1,
          hint: 'Tôi vẽ bản đồ nhé?',
          explanation: '【Đáp án 2: 地図】(Sách trang 74): 地図 (ちず: bản đồ).'
        },
        {
          id: 's500_q99',
          number: 99,
          sectionTitle: '第1週 7日目 復習 [語い]',
          question: 'しょうゆが＿＿＿なったから、買って きて。',
          options: ['すくなく', 'ちょっと'],
          correctIndex: 0,
          hint: 'Nước tương sắp hết rồi, đi mua về nhé.',
          explanation: '【Đáp án 1: すくなく】(Sách trang 74): 少ない (すくない) → 少なくなる (trở nên ít đi).'
        },
        {
          id: 's500_q100',
          number: 100,
          sectionTitle: '第1週 7日目 復習 [語い]',
          question: '家に 帰ったら、すぐに パソコンを＿＿＿。',
          options: ['おします', 'つけます'],
          correctIndex: 1,
          hint: 'Về đến nhà là bật máy tính ngay.',
          explanation: '【Đáp án 2: つけます】(Sách trang 74): パソコンをつける (bật máy tính).'
        }
,
        {
          id: 's500_q101',
          number: 101,
          sectionTitle: '第1週 7日目 [文法]',
          question: "今日の 授業は＿＿＿でしたか。",
          options: ["どう","どうやって"],
          correctIndex: 0,
          hint: "Tiết học hôm nay thế nào?",
          explanation: "【Đáp án 1: どう】(Sách trang 73): どうでしたか (thế nào rồi, hỏi về trạng thái/cảm tưởng). どうやって (bằng cách nào, hỏi phương pháp)."
        },
        {
          id: 's500_q102',
          number: 102,
          sectionTitle: '第1週 7日目 [文法]',
          question: "弟は、今ごろ ゲームを＿＿＿。",
          options: ["やります","やっているでしょう"],
          correctIndex: 1,
          hint: "Em trai tôi tầm này chắc đang chơi game.",
          explanation: "【Đáp án 2: やっているでしょう】(Sách trang 73): 〜ているでしょう (suy đoán hành động đang diễn ra vào thời điểm hiện tại: chắc là đang...)."
        },
        {
          id: 's500_q103',
          number: 103,
          sectionTitle: '第1週 7日目 [文字]',
          question: "この <u>時計</u>は スイスのです。",
          options: ["とかい","とけい"],
          correctIndex: 1,
          hint: "Chiếc đồng hồ này là của Thụy Sĩ.",
          explanation: "【Đáp án 2: とけい】(Sách trang 74): 時計 (とけい: đồng hồ)."
        },
        {
          id: 's500_q104',
          number: 104,
          sectionTitle: '第1週 7日目 [文字]',
          question: "<u>おさきに</u> しつれいします。",
          options: ["お先に","お前に"],
          correctIndex: 0,
          hint: "Tôi xin phép về trước.",
          explanation: "【Đáp án 1: お先に】(Sách trang 74): お先に失礼します (おさきにしつれいします: chào khi về trước)."
        },
        {
          id: 's500_q105',
          number: 105,
          sectionTitle: '第1週 7日目 [語い]',
          question: "花を もらったけれど、＿＿＿花びんが ない。",
          options: ["いれる","はいれる"],
          correctIndex: 0,
          hint: "Được tặng hoa nhưng không có bình hoa để cắm vào.",
          explanation: "【Đáp án 1: いれる】(Sách trang 74): 入れる (tha động từ: cắm/bỏ vào bình). 入る (tự động từ: đi vào)."
        },
        {
          id: 's500_q106',
          number: 106,
          sectionTitle: '第1週 7日目 [語い]',
          question: "この へんは 人が 少なくて とても＿＿＿です。",
          options: ["にぎやか","しずか"],
          correctIndex: 1,
          hint: "Vùng này ít người nên rất yên tĩnh.",
          explanation: "【Đáp án 2: しずか】(Sách trang 74): 静か (しずか: yên tĩnh) ⇔ にぎやか (nhộn nhịp)."
        },
        {
          id: 's500_q107',
          number: 107,
          sectionTitle: '第1週 7日目 [文法]',
          question: "よく＿＿＿。もう一度 お願いします。",
          options: ["聞こえませんでした","聞きませんでした"],
          correctIndex: 0,
          hint: "Tôi không nghe rõ. Xin hãy nói lại lần nữa.",
          explanation: "【Đáp án 1: 聞こえませんでした】(Sách trang 74): 聞こえる (khả năng tiếp nhận âm thanh tự nhiên: nghe thấy/nghe rõ)."
        },
        {
          id: 's500_q108',
          number: 108,
          sectionTitle: '第1週 7日目 [文法]',
          question: "この カレー、あまり＿＿＿ね。",
          options: ["からいです","からくありません"],
          correctIndex: 1,
          hint: "Món cà ri này không cay lắm nhỉ.",
          explanation: "【Đáp án 2: からくありません】(Sách trang 74): あまり〜ない (không... lắm): あまり辛くありません."
        },
        {
          id: 's500_q109',
          number: 109,
          sectionTitle: '第1週 7日目 [文字]',
          question: "すみません、<u>上着</u>を ぬいても いいですか。",
          options: ["うわぎ","うえき"],
          correctIndex: 0,
          hint: "Xin lỗi, tôi có thể cởi áo khoác ngoài được không?",
          explanation: "【Đáp án 1: うわぎ】(Sách trang 75): 上着 (うわぎ: áo khoác ngoài)."
        },
        {
          id: 's500_q110',
          number: 110,
          sectionTitle: '第1週 7日目 [文字]',
          question: "みんなで <u>わけましょう</u>。",
          options: ["分けましょう","半けましょう"],
          correctIndex: 0,
          hint: "Mọi người hãy chia nhau nhé.",
          explanation: "【Đáp án 1: 分けましょう】(Sách trang 75): 分ける (わける: chia ra)."
        },
        {
          id: 's500_q111',
          number: 111,
          sectionTitle: '第1週 7日目 [語い]',
          question: "この 問題が わかる 人は、手を＿＿＿ください。",
          options: ["あげて","あがって"],
          correctIndex: 0,
          hint: "Ai hiểu câu hỏi này xin hãy giơ tay lên.",
          explanation: "【Đáp án 1: あげて】(Sách trang 75): 手をあげる (giơ tay lên, tha động từ)."
        },
        {
          id: 's500_q112',
          number: 112,
          sectionTitle: '第1週 7日目 [語い]',
          question: "明日は 旅行に 行くので、早く 家を＿＿＿。",
          options: ["でます","いそぎます"],
          correctIndex: 0,
          hint: "Ngày mai đi du lịch nên tôi sẽ ra khỏi nhà sớm.",
          explanation: "【Đáp án 1: でます】(Sách trang 75): 家を出る (ra khỏi nhà: 〜を出る)."
        },
        {
          id: 's500_q113',
          number: 113,
          sectionTitle: '第1週 7日目 [文法]',
          question: "この 問題は＿＿＿できません。",
          options: ["むずかしくて","むずかしかったから"],
          correctIndex: 0,
          hint: "Câu hỏi này khó quá nên tôi không làm được.",
          explanation: "【Đáp án 1: むずかしくて】(Sách trang 75): Aくて〜 (chỉ nguyên nhân hệ quả tự nhiên: khó quá nên không thể làm)."
        },
        {
          id: 's500_q114',
          number: 114,
          sectionTitle: '第1週 7日目 [文法]',
          question: "私の 誕生日に 父が 時計を＿＿＿。",
          options: ["あげました","くれました"],
          correctIndex: 1,
          hint: "Vào ngày sinh nhật tôi, bố đã tặng đồng hồ cho tôi.",
          explanation: "【Đáp án 2: くれました】(Sách trang 75): (người khác) が (tôi) に くれます (tặng cho tôi)."
        },
        {
          id: 's500_q115',
          number: 115,
          sectionTitle: '第1週 7日目 [文字]',
          question: "<u>午前中</u>は ひまです。",
          options: ["ごぜんちゅう","ごぜんじゅう"],
          correctIndex: 0,
          hint: "Suốt buổi sáng tôi rảnh rỗi.",
          explanation: "【Đáp án 1: ごぜんちゅう】(Sách trang 76): 午前中 (ごぜんちゅう: trong buổi sáng)."
        },
        {
          id: 's500_q116',
          number: 116,
          sectionTitle: '第1週 7日目 [文字]',
          question: "友だちが <u>にゅういん</u> して います。",
          options: ["入院","入学"],
          correctIndex: 0,
          hint: "Bạn tôi đang nằm viện.",
          explanation: "【Đáp án 1: 入院】(Sách trang 76): 入院 (にゅういん: nhập viện)."
        },
        {
          id: 's500_q117',
          number: 117,
          sectionTitle: '第1週 7日目 [語い]',
          question: "むすこは 大阪の 会社に＿＿＿います。",
          options: ["はたらいて","つとめて"],
          correctIndex: 1,
          hint: "Con trai tôi đang làm việc tại một công ty ở Osaka.",
          explanation: "【Đáp án 2: つとめて】(Sách trang 76): 会社に勤める (làm việc/công tác tại công ty, đi với trợ từ に)."
        },
        {
          id: 's500_q118',
          number: 118,
          sectionTitle: '第1週 7日目 [語い]',
          question: "こんなに＿＿＿本を 持って いくのは たいへんです。",
          options: ["あつい","ふとい"],
          correctIndex: 0,
          hint: "Mang theo cuốn sách dày cộp thế này thật vất vả.",
          explanation: "【Đáp án 1: あつい】(Sách trang 76): 厚い (あつい: dày) dùng cho sách, áo ấm, v.v."
        },
        {
          id: 's500_q119',
          number: 119,
          sectionTitle: '第1週 7日目 [文法]',
          question: "朝から＿＿＿食べて いないから、おなかが すきました。",
          options: ["なにか","なにも"],
          correctIndex: 1,
          hint: "Từ sáng chưa ăn gì cả nên tôi đói bụng.",
          explanation: "【Đáp án 2: なにも】(Sách trang 76): 何も〜ない (hoàn toàn không ăn gì cả)."
        },
        {
          id: 's500_q120',
          number: 120,
          sectionTitle: '第1週 7日目 [文法]',
          question: "明日 試験だから、今日は＿＿＿勉強します。",
          options: ["寝ないで","寝ながら"],
          correctIndex: 0,
          hint: "Mai thi rồi nên hôm nay tôi sẽ học thức trắng không ngủ.",
          explanation: "【Đáp án 1: 寝ないで】(Sách trang 76): Vないで (làm hành động mà không làm V khác: học mà không ngủ)."
        },
        {
          id: 's500_q121',
          number: 121,
          sectionTitle: '第1週 7日目 [文字]',
          question: "私は 四人<u>兄弟</u>の 一番上です。",
          options: ["きょうだい","けいだい"],
          correctIndex: 0,
          hint: "Tôi là con cả trong gia đình 4 anh chị em.",
          explanation: "【Đáp án 1: きょうだい】(Sách trang 77): 兄弟 (きょうだい: anh chị em)."
        },
        {
          id: 's500_q122',
          number: 122,
          sectionTitle: '第1週 7日目 [文字]',
          question: "これは <u>たいせつな</u> 本です。",
          options: ["大切な","大事な"],
          correctIndex: 0,
          hint: "Đây là cuốn sách quan trọng.",
          explanation: "【Đáp án 1: 大切な】(Sách trang 77): 大切な (たいせつな: quan trọng, quý giá)."
        },
        {
          id: 's500_q123',
          number: 123,
          sectionTitle: '第1週 7日目 [語い]',
          question: "私は 今年の 12月に＿＿＿になります。",
          options: ["はつか","はたち"],
          correctIndex: 1,
          hint: "Tôi sẽ tròn 20 tuổi vào tháng 12 năm nay.",
          explanation: "【Đáp án 2: はたち】(Sách trang 77): 二十歳 (はたち: 20 tuổi). 二十日 (はつか: ngày 20)."
        },
        {
          id: 's500_q124',
          number: 124,
          sectionTitle: '第1週 7日目 [語い]',
          question: "この たなは 安かったけれど、とても＿＿＿です。",
          options: ["じょうぶ","だいじょうぶ"],
          correctIndex: 0,
          hint: "Cái giá này tuy rẻ nhưng rất chắc chắn, bền.",
          explanation: "【Đáp án 1: じょうぶ】(Sách trang 77): 丈夫 (じょうぶ: chắc chắn, bền)."
        },
        {
          id: 's500_q125',
          number: 125,
          sectionTitle: '第1週 7日目 [文法]',
          question: "漢字は ぜんぜん＿＿＿ことが できません。",
          options: ["読む","読める"],
          correctIndex: 0,
          hint: "Tôi hoàn toàn không thể đọc được chữ Hán.",
          explanation: "【Đáp án 1: 読む】(Sách trang 77): V(thể từ điển) ことができる (mẫu câu chỉ khả năng: 読むことができる)."
        }
      ]
    },

    // =======================================================================
    // TUẦN 2: CHỌN LỌC (Câu 126 - 155)
];
