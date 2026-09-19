const fs = require('fs');

// Extract Unit 4 from shinNihongo500Data.ts (q126 - q155)
const content = fs.readFileSync('src/data/shinNihongo500Data.ts', 'utf8');
const lines = content.split('\n');
const u4Start = lines.findIndex(l => l.includes("id: 's500_w2_u1'"));
const u4Lines = lines.slice(u4Start - 1, lines.length - 3); // till closing brace of unit 4

// Questions 156 to 185 (Unit 5: Week 2 Day 3 & 4)
const q156_to_185 = [
  {
    id: 's500_q156',
    number: 156,
    sectionTitle: '第2週 3日目 [文字]',
    question: '夏休みには いつも 家族で 旅行します。',
    options: ['りょうこ', 'りょうこう', 'りょこ', 'りょこう'],
    correctIndex: 3,
    hint: 'Nghỉ hè lúc nào tôi cũng cùng gia đình đi du lịch.',
    explanation: '【Đáp án 4: りょこう】(Sách trang 101): 旅行 (りょこう: du lịch).'
  },
  {
    id: 's500_q157',
    number: 157,
    sectionTitle: '第2週 3日目 [語い]',
    question: '夜中に 何度も 目が＿＿＿。',
    options: ['あけました', 'さめました', 'とまりました', 'おきました'],
    correctIndex: 1,
    hint: 'Nửa đêm tôi tỉnh giấc mấy lần.',
    explanation: '【Đáp án 2: さめました】(Sách trang 101): 目が覚める (めがさめる: tỉnh giấc, thức giấc).'
  },
  {
    id: 's500_q158',
    number: 158,
    sectionTitle: '第2週 3日目 [文法]',
    question: 'A「これ、あなたが したの？」\nB「いや、＿＿＿しないよ。」',
    options: ['それを', 'そう', 'そんなに', 'そんなこと'],
    correctIndex: 3,
    hint: 'A: "Cái này cậu làm đấy à?" B: "Không, tôi chẳng làm chuyện như thế đâu."',
    explanation: '【Đáp án 4: そんなこと】(Sách trang 101): そんなこと (chuyện như thế đó, việc như vậy).'
  },
  {
    id: 's500_q159',
    number: 159,
    sectionTitle: '第2週 3日目 [文字]',
    question: 'うさぎは 目が 赤い。',
    options: ['目', '耳', '首', '足'],
    correctIndex: 0,
    hint: 'Thỏ có mắt màu đỏ.',
    explanation: '【Đáp án 1: 目】(Sách trang 103): 目 (め: mắt), 耳 (みみ: tai), 首 (くび: cổ), 足 (あし: chân).'
  },
  {
    id: 's500_q160',
    number: 160,
    sectionTitle: '第2週 3日目 [語い]',
    question: 'ご両親は お元気ですか。',
    options: ['いもうと', 'かあさま', 'おくさん', 'りょうしん'],
    correctIndex: 3,
    hint: 'Bố mẹ bạn có khỏe không?',
    explanation: '【Đáp án 4: りょうしん】(Sách trang 103): ご両親 (ごりょうしん: bố mẹ, kính ngữ).'
  },
  {
    id: 's500_q161',
    number: 161,
    sectionTitle: '第2週 3日目 [文法]',
    question: 'A「今日の 試験、ぜんぜん できませんでした。」\nB「＿＿＿むずかしかったんですか。」',
    options: ['どんな ように', 'そんなに', 'こんなに', 'あんなに'],
    correctIndex: 1,
    hint: 'A: "Hôm nay em chẳng làm bài thi được chút nào cả." B: "Khó đến mức độ thế cơ à?"',
    explanation: '【Đáp án 2: そんなに】(Sách trang 103): そんなに (đến mức như thế, như lời đối phương vừa nói).'
  },
  {
    id: 's500_q162',
    number: 162,
    sectionTitle: '第2週 3日目 [文字]',
    question: '走ったら、8時の バスに 間に合うかもしれない。',
    options: ['めにあう', 'みにあう', 'まにあう', 'もにあう'],
    correctIndex: 2,
    hint: 'Nếu chạy thì có lẽ sẽ kịp chuyến xe buýt 8 giờ.',
    explanation: '【Đáp án 3: まにあう】(Sách trang 105): 間に合う (まにあう: kịp giờ).'
  },
  {
    id: 's500_q163',
    number: 163,
    sectionTitle: '第2週 3日目 [語い]',
    question: '最近、タバコを＿＿＿人が 減りましたね。',
    options: ['くう', 'すう', 'ふく', 'はく'],
    correctIndex: 1,
    hint: 'Gần đây người hút thuốc lá đã giảm đi nhỉ.',
    explanation: '【Đáp án 2: すう】(Sách trang 105): タバコを吸う (すう: hút thuốc).'
  },
  {
    id: 's500_q164',
    number: 164,
    sectionTitle: '第2週 3日目 [文法]',
    question: '＿＿＿、ぜんぶ 食べました。',
    options: ['のこしないで', 'のこらないで', 'のこさないで', 'のこって ないで'],
    correctIndex: 2,
    hint: 'Không để thừa lại chút nào, tôi đã ăn hết sạch.',
    explanation: '【Đáp án 3: のこさないで】(Sách trang 105): 残す (のこす: để thừa lại) -> 残さないで (mà không để thừa lại).'
  },
  {
    id: 's500_q165',
    number: 165,
    sectionTitle: '第2週 3日目 [文字]',
    question: '今、何と 言いましたか。',
    options: ['話しました', '白いました', '言いました', '語いました'],
    correctIndex: 2,
    hint: 'Vừa rồi bạn đã nói gì thế?',
    explanation: '【Đáp án 3: 言いました】(Sách trang 107): 言う (いう: nói).'
  },
  {
    id: 's500_q166',
    number: 166,
    sectionTitle: '第2週 3日目 [語い]',
    question: '＿＿＿が 悪いんです。早く 帰っても いいですか。',
    options: ['からだ', 'げんき', 'くうき', 'きぶん'],
    correctIndex: 3,
    hint: 'Tâm trạng/sức khỏe tôi không được tốt. Tôi xin phép về sớm được không?',
    explanation: '【Đáp án 4: きぶん】(Sách trang 107): 気分が悪い (きぶんがわるい: người khó chịu, không khỏe).'
  },
  {
    id: 's500_q167',
    number: 167,
    sectionTitle: '第2週 3日目 [文法]',
    question: 'この ゲームを したいけれど、＿＿＿が 分からない。',
    options: ['やりこと', 'やりかた', 'あそぶこと', 'あそぶかた'],
    correctIndex: 1,
    hint: 'Tôi muốn chơi trò này nhưng không biết cách chơi.',
    explanation: '【Đáp án 2: やりかた】(Sách trang 107): V(thể ます bỏ ます) + 方 (かた: cách làm gì) -> やり方 (cách làm, cách chơi).'
  },
  {
    id: 's500_q168',
    number: 168,
    sectionTitle: '第2週 3日目 [文字]',
    question: 'あの 木には 小鳥が たくさん います。',
    options: ['こちょう', 'おとり', 'ちどり', 'ことり'],
    correctIndex: 3,
    hint: 'Trên cái cây kia có rất nhiều chú chim non.',
    explanation: '【Đáp án 4: ことり】(Sách trang 109): 小鳥 (ことり: chim non, chim nhỏ).'
  },
  {
    id: 's500_q169',
    number: 169,
    sectionTitle: '第2週 3日目 [語い]',
    question: 'あのう、ここに＿＿＿いいですか。',
    options: ['すわっても', 'さわっても', 'まわっても', 'わって'],
    correctIndex: 0,
    hint: 'Xin lỗi, tôi có thể ngồi ở đây được không?',
    explanation: '【Đáp án 1: すわっても】(Sách trang 109): 座る (すわる: ngồi) -> 座ってもいいですか (ngồi có được không?).'
  },
  {
    id: 's500_q170',
    number: 170,
    sectionTitle: '第2週 3日目 [文法]',
    question: '＿＿＿が 違う お皿ですが、ねだんは 同じです。',
    options: ['大きく', '大きいさ', '大きさ', '大きいの'],
    correctIndex: 2,
    hint: 'Mặc dù kích cỡ đĩa khác nhau nhưng giá tiền là như nhau.',
    explanation: '【Đáp án 3: 大きさ】(Sách trang 109): A(bỏ い) + さ = danh từ hóa tính chất/độ lớn -> 大きさ (kích cỡ, độ lớn).'
  },
  {
    id: 's500_q171',
    number: 171,
    sectionTitle: '第2週 4日目 [文字]',
    question: 'あそこの 店員さんは 親切です。',
    options: ['てんにん', 'てんいん', 'でんいん', 'でんにん'],
    correctIndex: 1,
    hint: 'Nhân viên bán hàng đằng kia rất thân thiện nhiệt tình.',
    explanation: '【Đáp án 2: てんいん】(Sách trang 111): 店員 (てんいん: nhân viên bán hàng).'
  },
  {
    id: 's500_q172',
    number: 172,
    sectionTitle: '第2週 4日目 [語い]',
    question: 'くつを ぬいで、スリッパに＿＿＿ください。',
    options: ['ぬぎかえて', 'いれあけて', 'きがえて', 'はきかえて'],
    correctIndex: 3,
    hint: 'Hãy cởi giày ra và đổi sang đi dép đi trong nhà.',
    explanation: '【Đáp án 4: はきかえて】(Sách trang 111): 履き替える (はきかえる: thay/đổi giày dép quần dưới).'
  },
  {
    id: 's500_q173',
    number: 173,
    sectionTitle: '第2週 4日目 [文法]',
    question: '田中さん、このごろ とても＿＿＿ね。',
    options: ['きれいになりました', 'きれいにしました', 'きれいな 人です', 'きれいだったです'],
    correctIndex: 0,
    hint: 'Chị Tanaka dạo này trở nên rất xinh đẹp nhỉ.',
    explanation: '【Đáp án 1: きれいになりました】(Sách trang 111): Tính từ đuôi な + になる (trở nên...): きれいになりました.'
  },
  {
    id: 's500_q174',
    number: 174,
    sectionTitle: '第2週 4日目 [文字]',
    question: 'だれかが 門の 所に 立っている。',
    options: ['立って', '建って', '待って', '出って'],
    correctIndex: 0,
    hint: 'Có ai đó đang đứng ở chỗ cổng.',
    explanation: '【Đáp án 1: 立って】(Sách trang 113): 立つ (たつ: đứng).'
  },
  {
    id: 's500_q175',
    number: 175,
    sectionTitle: '第2週 4日目 [語い]',
    question: '＿＿＿を 引いて、学校を 休みました。',
    options: ['けが', 'りょこう', 'びょうき', 'かぜ'],
    correctIndex: 3,
    hint: 'Bị cảm cúm nên tôi đã nghỉ học.',
    explanation: '【Đáp án 4: かぜ】(Sách trang 113): 風邪を引く (かぜをひく: bị cảm).'
  },
  {
    id: 's500_q176',
    number: 176,
    sectionTitle: '第2週 4日目 [文法]',
    question: 'この テストで 100点を＿＿＿無理だろう。',
    options: ['とったのは', 'とるのは', 'とったら', 'とれば'],
    correctIndex: 1,
    hint: 'Đạt 100 điểm ở bài thi này có lẽ là điều không tưởng.',
    explanation: '【Đáp án 2: とるのは】(Sách trang 113): Vるの (danh từ hóa hành động: việc đạt được 100 điểm).'
  },
  {
    id: 's500_q177',
    number: 177,
    sectionTitle: '第2週 4日目 [文字]',
    question: 'もう 一度 大きい 声で 言って ください。',
    options: ['おと', 'こと', 'こえ', 'おん'],
    correctIndex: 2,
    hint: 'Xin hãy nói to lại một lần nữa.',
    explanation: '【Đáp án 3: こえ】(Sách trang 115): 声 (こえ: giọng nói, tiếng nói).'
  },
  {
    id: 's500_q178',
    number: 178,
    sectionTitle: '第2週 4日目 [語い]',
    question: '休みの 日は 家で 音楽を 聞いたり ギターを＿＿＿して います。',
    options: ['つけたり', 'ひいたり', 'おしたり', 'ふいたり'],
    correctIndex: 1,
    hint: 'Vào ngày nghỉ tôi ở nhà nghe nhạc và chơi gảy đàn guitar.',
    explanation: '【Đáp án 2: ひいたり】(Sách trang 115): ギターを弾く (ひく: chơi đàn gảy, guitar, piano).'
  },
  {
    id: 's500_q179',
    number: 179,
    sectionTitle: '第2週 4日目 [文法]',
    question: '私は 犬に おもちゃを＿＿＿。',
    options: ['買って やった', '買って もらった', '買って くれた', '買って くださった'],
    correctIndex: 0,
    hint: 'Tôi đã mua đồ chơi cho con chó cưng.',
    explanation: '【Đáp án 1: 買って やった】(Sách trang 115): 〜てやる (làm gì cho động vật, thú nuôi, cây cối, người bề dưới).'
  },
  {
    id: 's500_q180',
    number: 180,
    sectionTitle: '第2週 4日目 [文字]',
    question: 'あの 店で 飲み物を 買いましょう。',
    options: ['館', '家', '屋', '店'],
    correctIndex: 3,
    hint: 'Chúng ta hãy mua đồ uống ở tiệm đằng kia nhé.',
    explanation: '【Đáp án 4: 店】(Sách trang 117): 店 (みせ: cửa hàng, tiệm).'
  },
  {
    id: 's500_q181',
    number: 181,
    sectionTitle: '第2週 4日目 [語い]',
    question: 'お客さんが 来るから、まどガラスを＿＿＿。',
    options: ['みがきましょう', 'せんたくしましょう', 'かたづけましょう', 'けしましょう'],
    correctIndex: 0,
    hint: 'Vì có khách đến nên hãy lau chùi bóng loáng cửa kính cửa sổ.',
    explanation: '【Đáp án 1: みがきましょ う】(Sách trang 117): 磨く (みがく: đánh, lau chùi cho bóng).'
  },
  {
    id: 's500_q182',
    number: 182,
    sectionTitle: '第2週 4日目 [文法]',
    question: 'この ネクタイは 妻が＿＿＿。',
    options: ['作って あげました', '作って くださいました', '作って くれました', '作って やりました'],
    correctIndex: 2,
    hint: 'Chiếc cà vạt này là do vợ làm cho tôi.',
    explanation: '【Đáp án 3: 作って くれました】(Sách trang 117): (người khác) が (tôi) に〜てくれる (làm gì cho tôi).'
  },
  {
    id: 's500_q183',
    number: 183,
    sectionTitle: '第2週 4日目 [文字]',
    question: '社長は 京都へ 行きました。',
    options: ['きょうと', 'きょうど', 'きゅうと', 'きゅうど'],
    correctIndex: 0,
    hint: 'Giám đốc đã đi Kyoto rồi.',
    explanation: '【Đáp án 1: きょうと】(Sách trang 119): 京都 (きょうと: cố đô Kyoto).'
  },
  {
    id: 's500_q184',
    number: 184,
    sectionTitle: '第2週 4日目 [語い]',
    question: 'この プールは、まん中が いちばん＿＿＿から、気をつけて ください。',
    options: ['とおい', 'あさい', 'ふかい', 'あんぜん'],
    correctIndex: 2,
    hint: 'Bể bơi này ở chính giữa là sâu nhất nên hãy chú ý cẩn thận.',
    explanation: '【Đáp án 3: ふかい】(Sách trang 119): 深い (ふかい: sâu) ⇔ 浅い (あさい: nông).'
  },
  {
    id: 's500_q185',
    number: 185,
    sectionTitle: '第2週 4日目 [文法]',
    question: 'きのう、田中さんの お父さんに 食事に 連れて いって＿＿＿。',
    options: ['あげました', 'くださいました', 'さしあげました', 'いただきました'],
    correctIndex: 3,
    hint: 'Hôm qua tôi được bố của anh Tanaka dẫn đi ăn cơm.',
    explanation: '【Đáp án 4: いただきました】(Sách trang 119): 〜ていただく (khiêm nhường ngữ của 〜てもらう: được người trên làm cho).'
  }
];

// Questions 186 to 250 (Unit 6: Week 2 Day 5~7)
const q186_to_250 = [
  {
    id: 's500_q186',
    number: 186,
    sectionTitle: '第2週 5日目 [文字]',
    question: 'この へんは 古い 建物が多い。',
    options: ['たでもの', 'だてもの', 'たてもの', 'けんぶつ'],
    correctIndex: 2,
    hint: 'Khu vực này có nhiều tòa nhà cũ.',
    explanation: '【Đáp án 3: たてもの】(Sách trang 121): 建物 (たてもの: tòa nhà, công trình).'
  },
  {
    id: 's500_q187',
    number: 187,
    sectionTitle: '第2週 5日目 [語い]',
    question: 'さあ、ピアノに 合わせて 大きな 声で＿＿＿。',
    options: ['つくりましょう', 'だしましょう', 'おどりましょう', 'うたいましょう'],
    correctIndex: 3,
    hint: 'Nào, cùng hòa theo tiếng đàn piano mà cất cao giọng hát lên nhé.',
    explanation: '【Đáp án 4: うたいましょう】(Sách trang 121): 歌う (うたう: hát).'
  },
  {
    id: 's500_q188',
    number: 188,
    sectionTitle: '第2週 5日目 [文法]',
    question: '私は、来週 カナダへ＿＿＿と思って います。',
    options: ['帰ろう', '帰りましょう', '帰る', '帰ります'],
    correctIndex: 0,
    hint: 'Tôi định tuần sau sẽ về Canada.',
    explanation: '【Đáp án 1: 帰ろう】(Sách trang 121): Thể ý chí (意向形) + と思っています: dự định làm gì.'
  },
  {
    id: 's500_q189',
    number: 189,
    sectionTitle: '第2週 5日目 [文字]',
    question: 'いっしょに 昼ご飯を 食べませんか。',
    options: ['晩', '夕', '昼', '夜'],
    correctIndex: 2,
    hint: 'Cùng nhau ăn bữa trưa không?',
    explanation: '【Đáp án 3: 昼】(Sách trang 123): 昼 (ひる: ban trưa, buổi trưa).'
  },
  {
    id: 's500_q190',
    number: 190,
    sectionTitle: '第2週 5日目 [語い]',
    question: 'A「この トマト、どこで 買ったの？」\nB「駅前の＿＿＿さん。」',
    options: ['さかや', 'やおや', 'さかなや', 'やさいや'],
    correctIndex: 1,
    hint: 'A: "Cà chua này mua ở đâu thế?" B: "Tiệm bán rau củ trước nhà ga."',
    explanation: '【Đáp án 2: やおや】(Sách trang 123): 八百屋 (やおや: cửa hàng bán rau củ quả).'
  },
  {
    id: 's500_q191',
    number: 191,
    sectionTitle: '第2週 5日目 [文法]',
    question: '田中さんは、仕事が 忙しいので パーティーには 行けない＿＿＿。',
    options: ['って 言ってたよ', 'ってと 言ってたよ', 'のを 言ってたよ', 'との 言ってたよ'],
    correctIndex: 0,
    hint: 'Tanaka đã nói là công việc bận rộn nên không thể đến dự bữa tiệc đấy.',
    explanation: '【Đáp án 1: って 言ってたよ】(Sách trang 123): 〜って (trích dẫn văn nói thân mật thay cho と).'
  },
  {
    id: 's500_q192',
    number: 192,
    sectionTitle: '第2週 5日目 [文字]',
    question: '学生の ころ、東京に 住んでいました。',
    options: ['つんで', 'すんで', 'そんで', 'しんで'],
    correctIndex: 1,
    hint: 'Hồi còn là sinh viên, tôi đã từng sống ở Tokyo.',
    explanation: '【Đáp án 2: すんで】(Sách trang 125): 住む (すむ: cư trú, sống).'
  },
  {
    id: 's500_q193',
    number: 193,
    sectionTitle: '第2週 5日目 [語い]',
    question: '庭に 木を もう 一本＿＿＿。',
    options: ['うえました', 'きりました', 'とりました', 'かざりました'],
    correctIndex: 0,
    hint: 'Tôi đã trồng thêm một cái cây nữa trong vườn.',
    explanation: '【Đáp án 1: うえました】(Sách trang 125): 植える (うえる: trồng cây).'
  },
  {
    id: 's500_q194',
    number: 194,
    sectionTitle: '第2週 5日目 [文法]',
    question: 'ときどき＿＿＿が 食べたくなります。',
    options: ['母は 作った 料理', '母に 作ったの 料理', '母の 作った 料理', '母が 作ったの 料理'],
    correctIndex: 2,
    hint: 'Thỉnh thoảng tôi lại thèm ăn món ăn mà mẹ nấu.',
    explanation: '【Đáp án 3: 母の 作った 料理】(Sách trang 125): Trong mệnh đề định ngữ bổ nghĩa cho danh từ, trợ từ が có thể thay bằng の.'
  },
  {
    id: 's500_q195',
    number: 195,
    sectionTitle: '第2週 5日目 [文字]',
    question: '冬休みに 山へ 行きます。',
    options: ['秋', '春', '夏', '冬'],
    correctIndex: 3,
    hint: 'Vào kỳ nghỉ đông tôi sẽ đi leo núi.',
    explanation: '【Đáp án 4: 冬】(Sách trang 127): 冬 (ふゆ: mùa đông).'
  },
  {
    id: 's500_q196',
    number: 196,
    sectionTitle: '第2週 5日目 [語い]',
    question: '家から 駅まで 約 300＿＿＿です。',
    options: ['メートル', 'センチ', 'グラム', 'キロ'],
    correctIndex: 0,
    hint: 'Từ nhà đến ga khoảng 300 mét.',
    explanation: '【Đáp án 1: メートル】(Sách trang 127): メートル (mét, m).'
  },
  {
    id: 's500_q197',
    number: 197,
    sectionTitle: '第2週 5日目 [文法]',
    question: '私は＿＿＿とき パジャマを 着ます。',
    options: ['ねた', 'ねている', 'ねる', 'ねられた'],
    correctIndex: 2,
    hint: 'Khi đi ngủ tôi mặc đồ pijama.',
    explanation: '【Đáp án 3: ねる】(Sách trang 127): Vる + とき (trước khi hoặc khi thực hiện hành động: lúc ngủ).'
  },
  {
    id: 's500_q198',
    number: 198,
    sectionTitle: '第2週 5日目 [文字]',
    question: 'あの 道は 今、水道の 工事を して います。',
    options: ['こおじ', 'こうじ', 'くうじ', 'こんじ'],
    correctIndex: 1,
    hint: 'Con đường kia hiện đang thi công đường ống nước.',
    explanation: '【Đáp án 2: こうじ】(Sách trang 129): 工事 (こうじ: công trình thi công, sửa chữa).'
  },
  {
    id: 's500_q199',
    number: 199,
    sectionTitle: '第2週 5日目 [語い]',
    question: 'A「じゃ、また 明日。」\nB「＿＿＿。」',
    options: ['ただいま', 'おかげさまで', 'あとで', 'おやすみなさい'],
    correctIndex: 3,
    hint: 'A: "Thế nhé, hẹn mai gặp lại." B: "Chúc ngủ ngon nhé."',
    explanation: '【Đáp án 4: おやすみなさい】(Sách trang 129): おやすみなさい (chúc ngủ ngon / chào khi chia tay vào buổi tối muộn).'
  },
  {
    id: 's500_q200',
    number: 200,
    sectionTitle: '第2週 5日目 [文法]',
    question: '朝、学校に＿＿＿、お弁当を 買って きました。',
    options: ['来た 前に', '来る 前に', '来る 後で', '来た 後で'],
    correctIndex: 1,
    hint: 'Buổi sáng, trước khi đến trường tôi đã mua cơm hộp mang theo.',
    explanation: '【Đáp án 2: 来る 前に】(Sách trang 129): Vる + 前に (trước khi làm gì).'
  },
  {
    id: 's500_q201',
    number: 201,
    sectionTitle: '第2週 6日目 [文字]',
    question: '泳いだら、耳に 水が 入った。',
    options: ['いった', 'はいった', 'へいった', 'へえった'],
    correctIndex: 1,
    hint: 'Bơi xong thì nước lọt vào trong tai.',
    explanation: '【Đáp án 2: はいった】(Sách trang 131): 入る (はいる: vào, lọt vào).'
  },
  {
    id: 's500_q202',
    number: 202,
    sectionTitle: '第2週 6日目 [語い]',
    question: 'スーツケースから くつを＿＿＿。',
    options: ['はきました', 'だしました', 'いれました', 'みせました'],
    correctIndex: 1,
    hint: 'Tôi đã lấy đôi giày ra khỏi va ly.',
    explanation: '【Đáp án 2: だしました】(Sách trang 131): 出す (だす: lấy ra) ⇔ 入れる (いれる: bỏ vào).'
  },
  {
    id: 's500_q203',
    number: 203,
    sectionTitle: '第2週 6日目 [文法]',
    question: '家を＿＿＿、一生懸命 働いて います。',
    options: ['買おうから', '買う 前に', '買う ときに', '買う ために'],
    correctIndex: 3,
    hint: 'Để mua nhà, tôi đang làm việc chăm chỉ hết sức mình.',
    explanation: '【Đáp án 4: 買う ために】(Sách trang 131): Vる + ために (để, nhằm mục đích thực hiện hành động).'
  },
  {
    id: 's500_q204',
    number: 204,
    sectionTitle: '第2週 6日目 [文字]',
    question: '白い 洋服を＿＿＿人は だれですか。',
    options: ['着ている', '切ている', '来ている', '気ている'],
    correctIndex: 0,
    hint: 'Người đang mặc bộ âu phục trắng là ai thế?',
    explanation: '【Đáp án 1: 着ている】(Sách trang 133): 着る (きる: mặc).'
  },
  {
    id: 's500_q205',
    number: 205,
    sectionTitle: '第2週 6日目 [語い]',
    question: '台風で 庭の 木が＿＿＿しまった。',
    options: ['こわれて', 'ふんで', 'にげて', 'おれて'],
    correctIndex: 3,
    hint: 'Do bão nên cái cây trong vườn đã bị gãy mất.',
    explanation: '【Đáp án 4: おれて】(Sách trang 133): 折れる (おれる: gãy).'
  },
  {
    id: 's500_q206',
    number: 206,
    sectionTitle: '第2週 6日目 [文法]',
    question: '事故で 電車が おくれた＿＿＿、会議に 間に合わなかった。',
    options: ['とき', 'ため', 'あとで', 'からで'],
    correctIndex: 1,
    hint: 'Vì xe điện bị trễ do sự cố, nên tôi đã không kịp cuộc họp.',
    explanation: '【Đáp án 2: ため】(Sách trang 133): Vた + ため (chỉ nguyên nhân, lý do một cách khách quan).'
  },
  {
    id: 's500_q207',
    number: 207,
    sectionTitle: '第2週 6日目 [文字]',
    question: '金曜日の 夜九時から、テレビを 見ます。',
    options: ['ひる', 'ゆる', 'よる', 'やる'],
    correctIndex: 2,
    hint: 'Từ 9 giờ tối thứ Sáu, tôi xem tivi.',
    explanation: '【Đáp án 3: よる】(Sách trang 135): 夜 (よる: ban đêm, buổi tối).'
  },
  {
    id: 's500_q208',
    number: 208,
    sectionTitle: '第2週 6日目 [語い]',
    question: '分からない ところを 先生に＿＿＿した。',
    options: ['もんだい', 'ふくしゅう', 'れんしゅう', 'しつもん'],
    correctIndex: 3,
    hint: 'Chỗ không hiểu tôi đã đặt câu hỏi hỏi thầy giáo.',
    explanation: '【Đáp án 4: しつもん】(Sách trang 135): 質問する (しつもんする: đặt câu hỏi, hỏi).'
  },
  {
    id: 's500_q209',
    number: 209,
    sectionTitle: '第2週 6日目 [文法]',
    question: '今日は、遊びに 行けません。たくさん 宿題が ある＿＿＿。',
    options: ['からです', 'はずです', 'つもりです', 'ところです'],
    correctIndex: 0,
    hint: 'Hôm nay tôi không thể đi chơi được. Là bởi vì có rất nhiều bài tập.',
    explanation: '【Đáp án 1: からです】(Sách trang 135): 〜からです (là vì..., giải thích nguyên nhân).'
  },
  {
    id: 's500_q210',
    number: 210,
    sectionTitle: '第2週 6日目 [文字]',
    question: '右と 左を よく 見て、＿＿＿を わたろう。',
    options: ['道', '町', '進', '歩'],
    correctIndex: 0,
    hint: 'Hãy nhìn kĩ bên phải bên trái rồi hãy sang đường.',
    explanation: '【Đáp án 1: 道】(Sách trang 137): 道 (みち: con đường).'
  },
  {
    id: 's500_q211',
    number: 211,
    sectionTitle: '第2週 6日目 [語い]',
    question: '早く 帰って、明日の 旅行の＿＿＿をしなきゃ。',
    options: ['あんない', 'かんけい', 'よてい', 'したく'],
    correctIndex: 3,
    hint: 'Phải về sớm để chuẩn bị cho chuyến du lịch ngày mai thôi.',
    explanation: '【Đáp án 4: したく】(Sách trang 137): 支度 (したく: chuẩn bị hành trang đồ đạc).'
  },
  {
    id: 's500_q212',
    number: 212,
    sectionTitle: '第2週 6日目 [文法]',
    question: 'A「リンさん、このごろ 来ないね。」\nB「え？ 彼女、＿＿＿、知らないの？」',
    options: ['帰国したの こと', '帰国した こと', '帰国したと というの こと', '帰国したと というのが'],
    correctIndex: 1,
    hint: 'A: "Linh dạo này không đến nhỉ." B: "Hả? Cậu không biết chuyện cô ấy đã về nước rồi à?"',
    explanation: '【Đáp án 2: 帰国した こと】(Sách trang 137): V(thể thường) + こと (việc/chuyện gì đó).'
  },
  {
    id: 's500_q213',
    number: 213,
    sectionTitle: '第2週 6日目 [文字]',
    question: '楽しい 時間は 短いです。',
    options: ['みちかい', 'みじかい', 'まちかい', 'まじかい'],
    correctIndex: 1,
    hint: 'Thời gian vui vẻ trôi qua rất ngắn ngủi.',
    explanation: '【Đáp án 2: みじかい】(Sách trang 139): 短い (みじかい: ngắn).'
  },
  {
    id: 's500_q214',
    number: 214,
    sectionTitle: '第2週 6日目 [語い]',
    question: 'さあ、おさらを 出して。おはしも ちゃんと＿＿＿ね。',
    options: ['ならべて', 'ならんで', 'ならって', 'ならして'],
    correctIndex: 0,
    hint: 'Nào, hãy lấy đĩa ra. Đũa cũng xếp ngay ngắn nhé.',
    explanation: '【Đáp án 1: ならべて】(Sách trang 139): 並べる (ならべる: sắp xếp ngay ngắn hàng lối, tha động từ).'
  },
  {
    id: 's500_q215',
    number: 215,
    sectionTitle: '第2週 6日目 [文法]',
    question: 'まだ テレビを 見て いるの？ 早く＿＿＿。',
    options: ['寝ろう', '寝てやろう', '寝なさい', '寝てなさい'],
    correctIndex: 2,
    hint: 'Còn xem tivi nữa à? Mau đi ngủ đi!',
    explanation: '【Đáp án 3: 寝なさい】(Sách trang 139): V(thể ます bỏ ます) + なさい (lời sai bảo, nhắc nhở của bố mẹ với con cái).'
  },
  {
    id: 's500_q216',
    number: 216,
    sectionTitle: '第2週 7日目 [文字]',
    question: '毎日、八百屋で 買い物を します。',
    options: ['よおや', 'やおや'],
    correctIndex: 1,
    hint: 'Hàng ngày tôi đều mua đồ ở tiệm rau củ.',
    explanation: '【Đáp án 2: やおや】(Sách trang 141): 八百屋 (やおや: tiệm rau quả).'
  },
  {
    id: 's500_q217',
    number: 217,
    sectionTitle: '第2週 7日目 [文字]',
    question: '日本語は まだ 下手です。',
    options: ['手下', '下手'],
    correctIndex: 1,
    hint: 'Tiếng Nhật của tôi vẫn còn kém.',
    explanation: '【Đáp án 2: 下手】(Sách trang 141): 下手 (へた: kém cỏi).'
  },
  {
    id: 's500_q218',
    number: 218,
    sectionTitle: '第2週 7日目 [語い]',
    question: '＿＿＿、いらっしゃいますか。',
    options: ['ご主人', 'お主人'],
    correctIndex: 0,
    hint: 'Chồng của chị có nhà không ạ?',
    explanation: '【Đáp án 1: ご主人】(Sách trang 141): ご主人 (chồng của đối phương, kính ngữ).'
  },
  {
    id: 's500_q219',
    number: 219,
    sectionTitle: '第2週 7日目 [語い]',
    question: '今日は、強い 風が＿＿＿そうです。',
    options: ['はく', 'ふく'],
    correctIndex: 1,
    hint: 'Nghe nói hôm nay gió mạnh sẽ thổi.',
    explanation: '【Đáp án 2: ふく】(Sách trang 141): 風が吹く (ふく: gió thổi).'
  },
  {
    id: 's500_q220',
    number: 220,
    sectionTitle: '第2週 7日目 [文法]',
    question: '友だちに 田中さんの 電話番号を 教えて＿＿＿。',
    options: ['もらいました', 'くれました'],
    correctIndex: 0,
    hint: 'Tôi đã được bạn cho số điện thoại của Tanaka.',
    explanation: '【Đáp án 1: もらいました】(Sách trang 141): 友だちに〜てもらう (được bạn làm gì cho).'
  },
  {
    id: 's500_q221',
    number: 221,
    sectionTitle: '第2週 7日目 [文法]',
    question: '洋服を＿＿＿デパートへ 行きました。',
    options: ['買う とき', '買おうと 思って'],
    correctIndex: 1,
    hint: 'Tôi đã đi trung tâm thương mại với ý định mua quần áo.',
    explanation: '【Đáp án 2: 買おうと 思って】(Sách trang 141): Vようと思って (nghĩ/định làm gì).'
  },
  {
    id: 's500_q222',
    number: 222,
    sectionTitle: '第2週 7日目 [文字]',
    question: '荷物は ここに おいて ください。',
    options: ['にもの', 'にもつ'],
    correctIndex: 1,
    hint: 'Hành lý xin hãy để ở đây.',
    explanation: '【Đáp án 2: にもつ】(Sách trang 142): 荷物 (にもつ: hành lý, đồ đạc).'
  },
  {
    id: 's500_q223',
    number: 223,
    sectionTitle: '第2週 7日目 [文字]',
    question: 'お金が 足りない。',
    options: ['足りない', '手りない'],
    correctIndex: 0,
    hint: 'Tiền không đủ.',
    explanation: '【Đáp án 1: 足りない】(Sách trang 142): 足りる (たりる: đủ).'
  },
  {
    id: 's500_q224',
    number: 224,
    sectionTitle: '第2週 7日目 [語い]',
    question: 'あの 橋を＿＿＿と 海が 見えます。',
    options: ['つたえる', 'わたる'],
    correctIndex: 1,
    hint: 'Hễ qua cây cầu kia là nhìn thấy biển.',
    explanation: '【Đáp án 2: わたる】(Sách trang 142): 渡る (わたる: băng qua cầu/đường).'
  },
  {
    id: 's500_q225',
    number: 225,
    sectionTitle: '第2週 7日目 [語い]',
    question: 'せんたく機が＿＿＿から、せんたくできない。',
    options: ['こわれた', 'こわした'],
    correctIndex: 0,
    hint: 'Máy giặt bị hỏng nên không giặt được.',
    explanation: '【Đáp án 1: こわれた】(Sách trang 142): 壊れる (こわれる: bị hỏng, tự động từ).'
  },
  {
    id: 's500_q226',
    number: 226,
    sectionTitle: '第2週 7日目 [文法]',
    question: 'あの 人の 話は、うそ＿＿＿だから、信じないで。',
    options: ['だけ', 'ばかり'],
    correctIndex: 1,
    hint: 'Chuyện của người đó toàn là nói dối, đừng tin.',
    explanation: '【Đáp án 2: ばかり】(Sách trang 142): Nばかり (toàn là..., đầy rẫy sự tiêu cực).'
  },
  {
    id: 's500_q227',
    number: 227,
    sectionTitle: '第2週 7日目 [文法]',
    question: '私は、お酒は ビールしか＿＿＿。',
    options: ['飲めないん', '飲むん'],
    correctIndex: 0,
    hint: 'Rượu thì tôi chỉ uống được mỗi bia thôi.',
    explanation: '【Đáp án 1: 飲めないん】(Sách trang 142): しか〜ない (chỉ duy nhất).'
  },
  {
    id: 's500_q228',
    number: 228,
    sectionTitle: '第2週 7日目 [文字]',
    question: 'パーティーは たのしかったです。',
    options: ['たのしかった', 'うれしかった'],
    correctIndex: 0,
    hint: 'Bữa tiệc rất vui vẻ.',
    explanation: '【Đáp án 1: たのしかった】(Sách trang 143): 楽しい (たのしい: vui vẻ).'
  },
  {
    id: 's500_q229',
    number: 229,
    sectionTitle: '第2週 7日目 [文字]',
    question: 'あの 店員さんは 親切です。',
    options: ['親切', '新切'],
    correctIndex: 0,
    hint: 'Nhân viên bán hàng đằng kia tốt bụng thân thiện.',
    explanation: '【Đáp án 1: 親切】(Sách trang 143): 親切 (しんせつ: tử tế, thân thiện).'
  },
  {
    id: 's500_q230',
    number: 230,
    sectionTitle: '第2週 7日目 [語い]',
    question: 'ここに＿＿＿すわりましょう。',
    options: ['ならんで', 'やすんで'],
    correctIndex: 0,
    hint: 'Chúng ta hãy ngồi xếp thành hàng ở đây nhé.',
    explanation: '【Đáp án 1: ならんで】(Sách trang 143): 並ぶ (ならぶ: xếp hàng, đứng/ngồi thành hàng).'
  },
  {
    id: 's500_q231',
    number: 231,
    sectionTitle: '第2週 7日目 [語い]',
    question: 'へやに 花を＿＿＿。',
    options: ['うえましょう', 'かざりましょう'],
    correctIndex: 1,
    hint: 'Hãy trang trí hoa trong căn phòng nhé.',
    explanation: '【Đáp án 2: かざりましょう】(Sách trang 143): 飾る (かざる: trang trí, cắm hoa trang trí).'
  },
  {
    id: 's500_q232',
    number: 232,
    sectionTitle: '第2週 7日目 [文法]',
    question: '今日も 寒かったけれど、昨日＿＿＿じゃ なかったね。',
    options: ['より', 'ほど'],
    correctIndex: 1,
    hint: 'Hôm nay trời cũng lạnh nhưng không đến mức như hôm qua nhỉ.',
    explanation: '【Đáp án 2: ほど】(Sách trang 143): 〜ほど〜ない (không bằng, không đến mức như...).'
  },
  {
    id: 's500_q233',
    number: 233,
    sectionTitle: '第2週 7日目 [文法]',
    question: '＿＿＿時間が あるから、ゆっくりしよう。',
    options: ['まだ', 'もう'],
    correctIndex: 0,
    hint: 'Vẫn còn thời gian nên cứ thong thả nhé.',
    explanation: '【Đáp án 1: まだ】(Sách trang 143): まだ (vẫn còn).'
  },
  {
    id: 's500_q234',
    number: 234,
    sectionTitle: '第2週 7日目 [文字]',
    question: '今夜は 月が きれいです。',
    options: ['こんや', 'こんばん'],
    correctIndex: 0,
    hint: 'Đêm nay trăng thật đẹp.',
    explanation: '【Đáp án 1: こんや】(Sách trang 144): 今夜 (こんや: đêm nay).'
  },
  {
    id: 's500_q235',
    number: 235,
    sectionTitle: '第2週 7日目 [文字]',
    question: '来月の 二十日に 国へ 帰ります。',
    options: ['二日', '二十日'],
    correctIndex: 1,
    hint: 'Vào ngày 20 tháng sau tôi sẽ về nước.',
    explanation: '【Đáp án 2: 二十日】(Sách trang 144): 二十日 (はつか: ngày 20).'
  },
  {
    id: 's500_q236',
    number: 236,
    sectionTitle: '第2週 7日目 [語い]',
    question: '教科書を わすれたので、となりの 人に＿＿＿もらった。',
    options: ['かえして', 'みせて'],
    correctIndex: 1,
    hint: 'Vì quên sách giáo khoa nên tôi đã nhờ người bên cạnh cho xem nhờ.',
    explanation: '【Đáp án 2: みせて】(Sách trang 144): 見せる (みせる: cho xem) -> 見せてもらう.'
  },
  {
    id: 's500_q237',
    number: 237,
    sectionTitle: '第2週 7日目 [語い]',
    question: 'もうすぐ お客さんが 来るから、テーブルの 上を＿＿＿ください。',
    options: ['かたづけて', 'さわって'],
    correctIndex: 0,
    hint: 'Sắp có khách đến nên hãy dọn dẹp mặt bàn đi.',
    explanation: '【Đáp án 1: かたづけて】(Sách trang 144): 片付ける (かたづける: thu dọn, dọn dẹp).'
  },
  {
    id: 's500_q238',
    number: 238,
    sectionTitle: '第2週 7日目 [文法]',
    question: 'くだものの 中で、＿＿＿がいちばん 好きですか。',
    options: ['なに', 'どっち'],
    correctIndex: 0,
    hint: 'Trong các loại hoa quả, bạn thích loại nào nhất?',
    explanation: '【Đáp án 1: なに】(Sách trang 144): なにがいちばん (cái gì nhất trong phạm vi từ 3 trở lên).'
  },
  {
    id: 's500_q239',
    number: 239,
    sectionTitle: '第2週 7日目 [文法]',
    question: 'うるさいよ。静か＿＿＿。',
    options: ['になって', 'にして'],
    correctIndex: 1,
    hint: 'Ồn ào quá đấy. Hãy trật tự đi!',
    explanation: '【Đáp án 2: にして】(Sách trang 144): 〜にする (chủ động làm cho trạng thái trở nên...: 静かにして).'
  },
  {
    id: 's500_q240',
    number: 240,
    sectionTitle: '第2週 7日目 [文字]',
    question: '去年の 九月 ここのかに 日本へ 来ました。',
    options: ['ここのか', 'くにち'],
    correctIndex: 0,
    hint: 'Tôi đã đến Nhật vào ngày mùng 9 tháng 9 năm ngoái.',
    explanation: '【Đáp án 1: ここのか】(Sách trang 145): 九日 (ここのか: ngày mùng 9).'
  },
  {
    id: 's500_q241',
    number: 241,
    sectionTitle: '第2週 7日目 [文字]',
    question: '旅行会社で 働いて います。',
    options: ['族行', '旅行'],
    correctIndex: 1,
    hint: 'Tôi đang làm việc tại một công ty du lịch.',
    explanation: '【Đáp án 2: 旅行】(Sách trang 145): 旅行 (りょこう: du lịch).'
  },
  {
    id: 's500_q242',
    number: 242,
    sectionTitle: '第2週 7日目 [語い]',
    question: '明日の 朝、早く＿＿＿さんぽしましょう。',
    options: ['おきて', 'さめて'],
    correctIndex: 0,
    hint: 'Sáng mai hãy dậy sớm đi dạo bộ nhé.',
    explanation: '【Đáp án 1: おきて】(Sách trang 145): 起きる (おきる: thức dậy).'
  },
  {
    id: 's500_q243',
    number: 243,
    sectionTitle: '第2週 7日目 [語い]',
    question: 'この 川は＿＿＿ですが、およぐのは 危険です。',
    options: ['ふかい', 'あさい'],
    correctIndex: 1,
    hint: 'Con sông này nông nhưng bơi lội thì rất nguy hiểm.',
    explanation: '【Đáp án 2: あさい】(Sách trang 145): 浅い (あさい: nông cạn).'
  },
  {
    id: 's500_q244',
    number: 244,
    sectionTitle: '第2週 7日目 [文法]',
    question: '試験に 受かったよ。＿＿＿勉強しなかったのに。',
    options: ['どんなに', 'そんなに'],
    correctIndex: 1,
    hint: 'Tôi đỗ kỳ thi rồi. Mặc dù chẳng ôn học nhiều đến thế.',
    explanation: '【Đáp án 2: そんなに】(Sách trang 145): そんなに〜ない (không nhiều đến mức như thế).'
  },
  {
    id: 's500_q245',
    number: 245,
    sectionTitle: '第2週 7日目 [文法]',
    question: 'おなかが すいたね。ラーメン＿＿＿食べようか。',
    options: ['のほう', 'でも'],
    correctIndex: 1,
    hint: 'Đói bụng rồi nhỉ. Hay chúng mình đi ăn mì ramen hay gì đó nhé?',
    explanation: '【Đáp án 2: でも】(Sách trang 145): Nでも (đưa ra một gợi ý tiêu biểu: hay là ăn gì đó như mì ramen).'
  },
  {
    id: 's500_q246',
    number: 246,
    sectionTitle: '第2週 7日目 [文字]',
    question: 'ご都合が よければ 明日 お会いしたいのですが。',
    options: ['とごう', 'つごう'],
    correctIndex: 1,
    hint: 'Nếu thuận tiện thì ngày mai tôi muốn được gặp bạn.',
    explanation: '【Đáp án 2: つごう】(Sách trang 146): 都合 (つごう: sự thuận tiện, điều kiện thời gian).'
  },
  {
    id: 's500_q247',
    number: 247,
    sectionTitle: '第2週 7日目 [文字]',
    question: 'ひとりで 着物が きられますか。',
    options: ['着物', '果物'],
    correctIndex: 0,
    hint: 'Bạn có thể tự mặc trang phục Kimono một mình được không?',
    explanation: '【Đáp án 1: 着物】(Sách trang 146): 着物 (きもの: trang phục Kimono truyền thống).'
  },
  {
    id: 's500_q248',
    number: 248,
    sectionTitle: '第2週 7日目 [語い]',
    question: '食事の＿＿＿が できましたよ。',
    options: ['したく', 'よてい'],
    correctIndex: 0,
    hint: 'Cơm nước chuẩn bị xong rồi đấy.',
    explanation: '【Đáp án 1: したく】(Sách trang 146): 支度 (したく: chuẩn bị cơm nước, đồ đạc).'
  },
  {
    id: 's500_q249',
    number: 249,
    sectionTitle: '第2週 7日目 [語い]',
    question: 'そこ ガラスが 落ちて いるから＿＿＿。',
    options: ['ふまないで', 'にげないで'],
    correctIndex: 0,
    hint: 'Ở chỗ đó có mảnh kính rơi vỡ đấy, đừng dẫm vào.',
    explanation: '【Đáp án 1: ふまないで】(Sách trang 146): 踏む (ふむ: giẫm, đạp lên).'
  },
  {
    id: 's500_q250',
    number: 250,
    sectionTitle: '第2週 7日目 [文法]',
    question: 'おふろに＿＿＿後で いつも ビールを 飲みます。',
    options: ['入る', '入った'],
    correctIndex: 1,
    hint: 'Sau khi tắm bồn xong tôi lúc nào cũng uống một cốc bia.',
    explanation: '【Đáp án 2: 入った】(Sách trang 146): Vた + 後で (sau khi làm V).'
  }
];

// Combine into Unit 4, Unit 5, Unit 6
const unit4Str = u4Lines.join('\n');

const unit5Str = `    {
      id: 's500_w2_u2',
      unitNumber: 5,
      title: '第2週 3日目・4日目: 文字・語い・文法 (Câu 156 - 185)',
      japaneseTitle: '第2週 3日目〜4日目',
      pageRange: 'Trang 100 - 119',
      topic: 'Chữ Hán (旅行, 目, 言う, 店, 京都), Từ vựng (目が覚める, 吸う, はきかえる, みがく, 深い), Ngữ pháp (そんなに, やり方, 〜てやる, 〜てくれる, 〜ていただく)',
      description: 'Luyện tập 30 câu hỏi trọng điểm ngày thứ 3 và 4 tuần 2: cách nói kính ngữ, khiêm nhường ngữ và cấu trúc cho nhận.',
      questions: ` + JSON.stringify(q156_to_185, null, 8).replace(/^ {8}/gm, '        ') + `
    }`;

const unit6Str = `    {
      id: 's500_w2_u3',
      unitNumber: 6,
      title: '第2週 5日目〜7日目: Tổng ôn tuần 2 (Câu 186 - 250)',
      japaneseTitle: '第2週 5日目〜7日目（復習）',
      pageRange: 'Trang 120 - 146',
      topic: 'Chữ Hán (建物, 昼, 住む, 冬, 道), Từ vựng (やおや, 植える, 工事, しつもん, したく), Ngữ pháp (〜ようと思う, 〜ために, 〜こと, 7日目テスト)',
      description: '65 câu hỏi tổng ôn cuối tuần 2 bao gồm bài thi thực chiến ngày 7 kiểm tra toàn diện năng lực N4-N5.',
      questions: ` + JSON.stringify(q186_to_250, null, 8).replace(/^ {8}/gm, '        ') + `
    }`;

const fullWeek2 = `import { StudyBookUnit } from '../../types';\n\nexport const SHIN_500_WEEK_2: StudyBookUnit[] = [\n` +
  unit4Str + ',\n' + unit5Str + ',\n' + unit6Str + '\n];\n';

fs.writeFileSync('src/data/shinNihongo500/week2.ts', fullWeek2, 'utf8');
console.log('Week 2 successfully created with all 125 questions (126-250)!');
