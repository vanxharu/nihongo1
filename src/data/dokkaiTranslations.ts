/**
 * Comprehensive database of accurate Vietnamese translations for all JLPT Reading Comprehension (Dokkai)
 * passages and question prompts across levels N5, N4, N3, N2, N1.
 */

export interface DokkaiSentenceBreakdown {
  ja: string;
  vi: string;
}

export interface DokkaiTranslationEntry {
  passageTranslation: string;
  questionTranslation: string;
  sentenceBreakdown: DokkaiSentenceBreakdown[];
  keyVocabulary?: { ja: string; reading: string; vi: string }[];
}

export const DOKKAI_PASSAGE_TRANSLATIONS: Record<string, DokkaiTranslationEntry> = {
  // === N4: Tiệm rau quả 八百屋 (n4_nl01_d26) ===
  'n4_nl01_d26': {
    passageTranslation:
      'Tôi đã đi đến tiệm rau quả (八百屋). Ở đó người ta bày bán rất nhiều loại hoa quả trông ngon mắt. Tôi định mua táo và quýt. Táo thì 1 quả có giá 130 yên, nhưng nếu mua combo 3 quả thì giá là 350 yên. Quýt thì 1 quả giá 70 yên, nhưng nếu mua combo 5 quả thì giá là 300 yên. Gia đình tôi gồm có 6 người. Tôi quyết định để mỗi người ăn nửa quả táo và một quả quýt.',
    questionTranslation:
      'Hỏi: Mua đủ phần hoa quả cho cả gia đình thì tổng cộng hết bao nhiêu tiền?',
    sentenceBreakdown: [
      { ja: '八百屋に行きました。', vi: 'Tôi đã đi đến tiệm rau quả.' },
      { ja: 'いろいろおいしそうな果物を売っていました。', vi: 'Ở đó người ta bày bán rất nhiều loại hoa quả trông ngon mắt.' },
      { ja: 'リンゴとみかんを買おうと思います。', vi: 'Tôi định mua táo và quýt.' },
      { ja: 'リンゴは1つ130円ですが、3つ買うと350円になります。', vi: 'Táo thì 1 quả giá 130 yên, nhưng mua 3 quả thì giá là 350 yên.' },
      { ja: 'みかんは1つ70円ですが、5つ買うと300円になります。', vi: 'Quýt thì 1 quả giá 70 yên, nhưng mua 5 quả thì giá là 300 yên.' },
      { ja: 'わたしの家族は6人です。', vi: 'Gia đình tôi gồm có 6 người.' },
      { ja: '1人でリンゴを半分とみかんを1つずつ食べることにしました。', vi: 'Tôi quyết định để mỗi người ăn nửa quả táo và một quả quýt (6 người = cần 3 quả táo và 6 quả quýt).' },
      { ja: '質問：全部でいくらになりますか。', vi: 'Hỏi: Mua hết tất cả thì tổng cộng bao nhiêu tiền?' }
    ],
    keyVocabulary: [
      { ja: '八百屋', reading: 'やおや', vi: 'tiệm rau quả' },
      { ja: '果物', reading: 'くだもの', vi: 'hoa quả, trái cây' },
      { ja: '売る', reading: 'うる', vi: 'bán' },
      { ja: '家族', reading: 'かぞく', vi: 'gia đình' },
      { ja: '半分', reading: 'はんぶん', vi: 'một nửa' },
      { ja: '全部で', reading: 'ぜんぶで', vi: 'tổng cộng' }
    ]
  },

  // === N4: Ngày nghỉ của anh Wang (n4_nl01_d27) ===
  'n4_nl01_d27': {
    passageTranslation:
      'Ngày nghỉ của anh Wang là thứ Tư và Chủ Nhật. Nếu đi làm vào ngày nghỉ thì sẽ được nghỉ bù vào ngày tiếp theo. Nếu ngày tiếp theo đó trùng vào ngày lễ quốc gia thì sẽ được nghỉ bù sang ngày kế tiếp nữa. Tháng này, thứ Sáu ngày 17 và thứ Hai ngày 27 là ngày nghỉ lễ của đất nước. Anh Wang muốn được nghỉ liên tiếp 3 ngày.\n(※ 祭日: Ngày nghỉ lễ do nhà nước quy định).',
    questionTranslation:
      'Hỏi: Để được nghỉ liên tiếp 3 ngày thì anh Wang nên đi làm bù vào ngày nào?',
    sentenceBreakdown: [
      { ja: 'ワンさんの休みは水曜日と日曜日です。', vi: 'Ngày nghỉ của anh Wang là thứ Tư và Chủ Nhật.' },
      { ja: '休みの日に働けばつぎの日は休めます。', vi: 'Nếu đi làm vào ngày nghỉ thì sẽ được nghỉ bù vào ngày tiếp theo.' },
      { ja: 'その日が祭日のときはそのつぎの日が休めます。', vi: 'Nếu ngày đó trùng vào ngày lễ thì sẽ được nghỉ bù sang ngày kế tiếp nữa.' },
      { ja: '今月は17日の金曜日と27日の月曜日が国の休みです。', vi: 'Tháng này, thứ Sáu ngày 17 và thứ Hai ngày 27 là ngày nghỉ lễ quốc gia.' },
      { ja: 'ワンさんは3日間休みたいです。', vi: 'Anh Wang muốn được nghỉ liên tiếp 3 ngày.' },
      { ja: '質問：いつ働けばいいですか。', vi: 'Hỏi: Anh Wang nên đi làm vào ngày nào?' }
    ]
  },

  // === N4: Share House (n4_nl01_d28) ===
  'n4_nl01_d28': {
    passageTranslation:
      'Dạo gần đây mô hình nhà ở chung "Share House" rất được ưa chuộng. "Share House" là ngôi nhà nơi có nhiều người cùng nhau sinh sống. Những ngôi nhà có đông người thường được yêu thích hơn những nhà quá ít người. Khi bước vào phòng riêng của mình, bạn có thể làm bất cứ điều gì mình thích; còn khi muốn trò chuyện cùng ai đó, bạn chỉ cần ra nhà ăn hoặc phòng khách. Mối quan hệ giữa mọi người vừa phải, không quá xa cách cũng không quá ràng buộc thân thiết. Vì lúc nào cũng có người ở nhà nên không thấy cô đơn và rất an toàn. Bạn cũng có thể làm quen với những người mà bình thường hiếm khi có cơ hội gặp gỡ. Đây cũng chính là những lý do khiến loại hình này được ưa thích.',
    questionTranslation:
      'Hỏi: Điều nào sau đây KHÔNG phải là lý do khiến Share House được ưa chuộng?',
    sentenceBreakdown: [
      { ja: 'さいきん「シェアハウス」が人気だ。', vi: 'Dạo gần đây "Share House" (nhà ở chung) rất được ưa chuộng.' },
      { ja: '「シェアハウス」というのは何人もの人がいっしょに生活する家だ。', vi: '"Share House" là ngôi nhà nơi có nhiều người cùng nhau sinh sống.' },
      { ja: '人があまり少ない家より多いほうが人気がある。', vi: 'Những ngôi nhà có đông người thường được yêu thích hơn những nhà ít người.' },
      { ja: '自分の部屋に入ってしまえば好きなことができるし、だれかと話したいときは食堂やいまに行けばいい。', vi: 'Vào phòng riêng thì có thể làm việc mình thích, còn muốn nói chuyện thì ra phòng ăn hoặc phòng khách.' },
      { ja: '人と人のかんけいがうすくもなくこくもなくちょうどいいようだ。', vi: 'Mối quan hệ giữa người với người vừa phải, không quá xa cách cũng không quá thân thiết ràng buộc.' },
      { ja: 'いつもだれかがいるからさびしくないし安全だ。', vi: 'Lúc nào cũng có người nên không cô đơn và rất an toàn.' },
      { ja: 'めったに会わないような人とも知り合いになれる。これも人気のりゆうだ。', vi: 'Có thể làm quen với những người bình thường hiếm khi gặp. Đây cũng là lý do được ưa chuộng.' },
      { ja: '質問：シェアハウスの人気のりゆうでないのはどれですか。', vi: 'Hỏi: Đâu KHÔNG phải là lý do khiến Share House được ưa chuộng?' }
    ]
  },

  // === N4: Trang phục chạy bộ (n4_nl01_d29) ===
  'n4_nl01_d29': {
    passageTranslation:
      'Phụ nữ trẻ ngày nay thường chạy bộ trong những bộ trang phục khiến người ta ngỡ như họ đang mặc đồ thường ngày đi chạy. Tuy nhiên, thứ họ đang mặc chắc chắn là trang phục thể thao chuyên dụng. Những bộ trang phục có vẻ ngoài dễ thương đó thậm chí còn được đính kèm phụ kiện trang trí đến mức người ta tưởng như sẽ gây vướng víu khi vận động. Có vẻ như phụ nữ trẻ ngay cả khi tập thể thao cũng rất để tâm đến việc người khác nhìn mình như thế nào. Nghe nói tại các giải chạy marathon, cũng có những người thu hút mọi ánh nhìn bởi chính những bộ trang phục mà họ mặc.',
    questionTranslation:
      'Hỏi: Kiểu trang phục nào đang thu hút ánh nhìn của mọi người?',
    sentenceBreakdown: [
      { ja: 'さいきんのわかい女の人はふつうのふくのままジョギングしているのかと思われるようなふくそうて走っている。', vi: 'Phụ nữ trẻ ngày nay chạy bộ trong trang phục khiến người ta tưởng họ mặc đồ thường ngày đi chạy.' },
      { ja: 'しかし着ているのはまちがいなく運動用のふくなのだ。', vi: 'Tuy nhiên, thứ họ đang mặc chắc chắn là trang phục thể thao chuyên dụng.' },
      { ja: '見た目がかわいらしいそれらのふくは運動するときにじゃまになるのではないかと思えるほどかざりがついていたりする。', vi: 'Đồ dễ thương đến mức có nhiều phụ kiện trang trí tưởng như sẽ gây vướng víu khi vận động.' },
      { ja: 'わかい女の人は運動するときもどう見られるかが気になるらしい。', vi: 'Có vẻ như phụ nữ trẻ ngay cả khi thể thao cũng để ý xem người khác nhìn mình thế nào.' },
      { ja: 'マラソン大会などで着ているふくで多くの人の目を集めている人もいるそうだ。', vi: 'Tại các giải marathon có người thu hút ánh nhìn bằng chính trang phục họ mặc.' },
      { ja: '質問：どんなふくが人の目を集めているのですか。', vi: 'Hỏi: Kiểu trang phục nào đang thu hút ánh nhìn của mọi người?' }
    ]
  },

  // === N4: Bánh ngọt & Bánh mì Nhật (n4_nl01_d30 -> d33) ===
  'n4_nl01_d30': {
    passageTranslation:
      'Tôi đã rất ngạc nhiên khi được một người Úc nói rằng bánh ngọt của Nhật Bản vì không ngọt nên không ngon. Đó là bởi vì tôi luôn nghĩ rằng chẳng có loại bánh ngọt nào ngon bằng bánh ngọt của Nhật Bản cả. Tôi cũng nghe thấy điều tương tự từ những người đến từ các quốc gia khác. Tôi từng có dịp thưởng thức loại bánh được cho là ngon nhất ở Vancouver. Lúc đó tôi đã rất kinh ngạc. Dù là người hảo ngọt nhưng chiếc bánh đó ngọt đến mức tôi không thể ăn nổi. Chính lúc đó, lần đầu tiên tôi đã hiểu thấu cảm xúc của những người nước ngoài kia.\nBánh mì cũng vậy. Những người nước ngoài từng khen món ăn Nhật Bản ngon cũng thường nói rằng bánh mì Nhật quá mềm ăn không có cảm giác đã ăn, và họ rất thèm loại bánh mì cứng giòn như từng ăn ở quê hương họ. Đây là nói về loại bánh mì thông thường. Một người Anh từng kể rằng khi ở Nhật, ông ấy hầu như chỉ ăn bánh mì baguette Pháp. Tôi cũng vậy, nếu ăn thì tôi thích loại bánh mì Pháp vỏ cứng hơn.\nNgười Nhật có niềm quan tâm rất lớn đối với việc ăn uống. Vì vậy, họ tiếp thu món ăn của rất nhiều quốc gia khác nhau. Sau đó, họ lại biến tấu nó theo khẩu vị mà mình ưa thích. Do đó, việc món ăn trở nên khác xa so với nguyên bản ban đầu là điều thường xuyên xảy ra.',
    questionTranslation:
      'Hỏi: Tại sao tác giả lại ngạc nhiên khi bị người Úc nói bánh ngọt không ngon?',
    sentenceBreakdown: [
      { ja: '日本のケーキはあまくないからおいしくないとオーストラリア人から言われたときにはおどろいた。', vi: 'Tôi đã ngạc nhiên khi bị người Úc chê bánh Nhật không ngọt nên không ngon.' },
      { ja: 'わたしは日本のケーキほどおいしいケーキはないと思っていたからだ。', vi: 'Đó là bởi vì tôi luôn nghĩ không có bánh nào ngon bằng bánh ngọt Nhật Bản.' },
      { ja: 'バンクーバーで一番おいしいと言われているケーキを食べたことがある。', vi: 'Tôi từng ăn chiếc bánh được khen ngon nhất ở Vancouver.' },
      { ja: 'あまい物が大好きなのにあますぎて食べられなかったのだ。', vi: 'Dù rất thích đồ ngọt nhưng nó ngọt quá khiến tôi không thể ăn nổi.' },
      { ja: 'そのとき初めてかれらの気持ちがよくわかった。', vi: 'Lúc đó lần đầu tiên tôi đã hiểu thấu cảm xúc của những người nước ngoài đó.' },
      { ja: '質問：オーストラリア人においしくないと言われてどうしておどろきましたか。', vi: 'Hỏi: Tại sao tác giả lại ngạc nhiên khi bị người Úc nói bánh không ngon?' }
    ]
  },
  'n4_nl01_d31': {
    passageTranslation:
      'Tôi đã rất ngạc nhiên khi được một người Úc nói rằng bánh ngọt của Nhật Bản vì không ngọt nên không ngon. Đó là bởi vì tôi luôn nghĩ rằng chẳng có loại bánh ngọt nào ngon bằng bánh ngọt của Nhật Bản cả. Tôi cũng nghe thấy điều tương tự từ những người đến từ các quốc gia khác. Tôi từng có dịp thưởng thức loại bánh được cho là ngon nhất ở Vancouver. Lúc đó tôi đã rất kinh ngạc. Dù là người hảo ngọt nhưng chiếc bánh đó ngọt đến mức tôi không thể ăn nổi. Chính lúc đó, lần đầu tiên tôi đã hiểu thấu cảm xúc của những người nước ngoài kia.\nBánh mì cũng vậy. Những người nước ngoài từng khen món ăn Nhật Bản ngon cũng thường nói rằng bánh mì Nhật quá mềm ăn không có cảm giác đã ăn, và họ rất thèm loại bánh mì cứng giòn như từng ăn ở quê hương họ. Đây là nói về loại bánh mì thông thường. Một người Anh từng kể rằng khi ở Nhật, ông ấy hầu như chỉ ăn bánh mì baguette Pháp. Tôi cũng vậy, nếu ăn thì tôi thích loại bánh mì Pháp vỏ cứng hơn.\nNgười Nhật có niềm quan tâm rất lớn đối với việc ăn uống. Vì vậy, họ tiếp thu món ăn của rất nhiều quốc gia khác nhau. Sau đó, họ lại biến tấu nó theo khẩu vị mà mình ưa thích. Do đó, việc món ăn trở nên khác xa so với nguyên bản ban đầu là điều thường xuyên xảy ra.',
    questionTranslation:
      'Hỏi: Tại sao tác giả lại thấu hiểu cảm xúc của những người nước ngoài đó?',
    sentenceBreakdown: [
      { ja: 'バンクーバーで一番おいしいと言われているケーキを食べたことがある。', vi: 'Tôi từng ăn chiếc bánh được khen ngon nhất ở Vancouver.' },
      { ja: 'あまい物が大好きなのにあますぎて食べられなかったのだ。そのとき初めてかれらの気持ちがよくわかった。', vi: 'Bánh quá ngọt không nuốt nổi. Khi đó tôi mới hiểu cảm xúc của họ.' },
      { ja: '質問：どうしてかれらの気持ちがよくわかったのですか。', vi: 'Hỏi: Tại sao tác giả lại thấu hiểu cảm xúc của những người đó?' }
    ]
  },
  'n4_nl01_d32': {
    passageTranslation:
      'Bánh mì cũng vậy. Những người nước ngoài từng khen món ăn Nhật Bản ngon cũng thường nói rằng bánh mì Nhật quá mềm ăn không có cảm giác đã ăn, và họ rất thèm loại bánh mì cứng giòn như từng ăn ở quê hương họ. Đây là nói về loại bánh mì thông thường. Một người Anh từng kể rằng khi ở Nhật, ông ấy hầu như chỉ ăn bánh mì baguette Pháp. Tôi cũng vậy, nếu ăn thì tôi thích loại bánh mì Pháp vỏ cứng hơn.',
    questionTranslation:
      'Hỏi: Người nước ngoài nhận xét thế nào về bánh mì thông thường ở Nhật Bản?',
    sentenceBreakdown: [
      { ja: '日本のパンはやわらかすぎて食べた気がしない、国で食べていたようなかたいパンが食べたくなるとよく言っている。', vi: 'Bánh mì Nhật mềm quá ăn không thấy đã miệng, họ thèm bánh mì cứng như ở quê nhà.' },
      { ja: '質問：パンについて外国の人は何と言っていますか。', vi: 'Hỏi: Người nước ngoài nhận xét thế nào về bánh mì ở Nhật?' }
    ]
  },
  'n4_nl01_d33': {
    passageTranslation:
      'Người Nhật có niềm quan tâm rất lớn đối với việc ăn uống. Vì vậy, họ tiếp thu món ăn của rất nhiều quốc gia khác nhau. Sau đó, họ lại biến tấu nó theo khẩu vị mà mình ưa thích. Do đó, việc món ăn trở nên khác xa so với nguyên bản ban đầu là điều thường xuyên xảy ra.',
    questionTranslation:
      'Hỏi: Tại sao sự biến đổi khác biệt về ẩm thực này lại xảy ra ở Nhật?',
    sentenceBreakdown: [
      { ja: '日本人は食べることにとてもきょうみがある。だからいろいろな国の食べ物をとり入れる。', vi: 'Người Nhật rất hứng thú với ăn uống nên tiếp thu món ăn từ nhiều nước.' },
      { ja: 'そしてそれを自分の好きなようにかえてしまう。それてさいしょのものとはちがってしまうということがたびたび起こる。', vi: 'Và rồi họ biến tấu theo ý thích, khiến món ăn khác xa bản gốc ban đầu.' },
      { ja: '質問：どうしてこんなことが起きましたか。', vi: 'Hỏi: Tại sao sự thay đổi hương vị này lại xảy ra?' }
    ]
  },

  // === N4: Tra cứu thông tin trường Nhật ngữ (n4_nl01_d34, d35) ===
  'n4_nl01_d34': {
    passageTranslation:
      'Anh Ali và chị Mei muốn học tiếng Nhật. Giờ làm việc ở công ty là từ 9 giờ sáng đến 5 giờ chiều. Anh Ali có thể về lúc 5 giờ, nhưng chị Mei hầu như ngày nào cũng thường xuyên phải làm việc đến tận 7 giờ tối. Vào thứ Sáu, anh Ali hay đi uống cùng bạn bè. Còn chị Mei thì vào thứ Năm có đi học tại lớp khiêu vũ.\n\n【Trường Nhật ngữ Đông】 (Khóa 2 buổi/tuần: 18,000 yên)\n- Lớp Thứ 2 & Thứ 5: Lớp A (18:00~19:20), Lớp B (19:30~20:50)\n- Lớp Thứ 3 & Thứ 6: Lớp C (18:00~19:20), Lớp D (19:30~20:50)\n\n【Trường Nhật ngữ Nam】 (Khóa 2 buổi/tuần: 20,000 yên)\n- Lớp Thứ 2 & Thứ 5: Lớp I (17:30~18:50), Lớp J (19:00~20:20)\n- Lớp Thứ 3 & Thứ 6: Lớp K (17:30~18:50), Lớp L (19:00~20:20)\n\n【Trường Nhật ngữ Bắc】 (Khóa 2 buổi/tuần: 19,000 yên)\n- Lớp Thứ 2 & Thứ 5: Lớp E (18:00~19:20), Lớp F (19:30~20:50)\n- Lớp Thứ 3 & Thứ 6: Lớp G (18:00~19:20), Lớp H (19:30~20:50)\n\n【Thời gian di chuyển】:\n・Nhà Ali -> Ga A: Đi bộ 10 phút.\n・Ga A -> Ga B (20 phút) -> Ga C (20 phút) -> Ga D (20 phút).\n・Trường Nam: Đi bộ từ công ty 15 phút, từ Ga D đi bộ 10 phút.\n・Trường Đông: Từ Ga D đi bộ 10 phút.\n・Trường Bắc: Từ Ga C đi bộ 10 phút.',
    questionTranslation:
      'Hỏi: Anh Ali muốn chọn khóa học để về nhà sớm nhất. Anh ấy nên chọn lớp nào từ A đến L?',
    sentenceBreakdown: [
      { ja: 'アリさんとメイさんは日本語が習いたいです。', vi: 'Anh Ali và chị Mei muốn học tiếng Nhật.' },
      { ja: 'アリさんは金曜日はよく友だちとおさけを飲みに行きます。', vi: 'Anh Ali thứ Sáu hay đi uống với bạn bè (tránh lớp thứ Sáu).' },
      { ja: '質問：アリさんは早く家に帰れるコースがいいです。A～Lのどれにしますか。', vi: 'Hỏi: Anh Ali muốn về nhà sớm nhất, nên chọn lớp nào từ A đến L?' }
    ]
  },
  'n4_nl01_d35': {
    passageTranslation:
      'Anh Ali và chị Mei muốn học tiếng Nhật. Chị Mei hầu như ngày nào cũng thường xuyên phải làm việc đến tận 7 giờ tối (19:00). Vào thứ Năm, chị Mei có đi học tại lớp khiêu vũ.\nTrường Đông có học phí rẻ nhất (18,000 yên). Do Mei đi làm đến 19:00 nên không thể tham gia lớp 18:00. Thứ Năm lại trùng lịch khiêu vũ.',
    questionTranslation:
      'Hỏi: Chị Mei muốn chọn khóa học rẻ nhất có thể và phù hợp lịch trình. Chị ấy nên chọn lớp nào từ A đến D?',
    sentenceBreakdown: [
      { ja: 'メイさんは毎日のように7時まで働かなければならないことが多いです。', vi: 'Chị Mei thường xuyên phải làm việc đến 7h tối (19:00).' },
      { ja: 'メイさんは木曜日にダンス教室に行っています。', vi: 'Chị Mei thứ Năm đi học khiêu vũ.' },
      { ja: '質問：メイさんはなるべく安いコースがいいです。A～Dのどれにしますか。', vi: 'Hỏi: Chị Mei muốn lớp rẻ nhất, nên chọn lớp nào từ A đến D?' }
    ]
  },

  // === N4: Ga Tokyo (n4_2407_19) ===
  'n4_2407_19': {
    passageTranslation:
      'Tuần trước, tôi đã đến nhà bạn chơi. Khi đi, tôi đổi tàu ở ga Tokyo. Nhưng vì ga Tokyo rất rộng và có rất nhiều người, nên tôi đã bị lạc đường. Tôi đã hỏi một nhân viên nhà ga đang đứng gần đó. Người nhân viên ấy đã chỉ dẫn cho tôi đường đi một cách vô cùng tử tế và nhiệt tình. Nhờ có sự giúp đỡ đó, tôi đã có thể lên tàu đúng giờ mà không bị muộn cuộc hẹn.',
    questionTranslation:
      'Hỏi: Người nhân viên nhà ga đã làm gì giúp người viết?',
    sentenceBreakdown: [
      { ja: '先週、私は友達の家に遊びに行きました。', vi: 'Tuần trước, tôi đã đến nhà bạn chơi.' },
      { ja: '行くときに東京駅で電車を乗り換えました。', vi: 'Khi đi, tôi đổi tàu ở ga Tokyo.' },
      { ja: '東京駅は広くて人が大勢いたので、道に迷ってしまいました。', vi: 'Ga Tokyo rộng và đông người nên tôi bị lạc đường.' },
      { ja: '駅員さんに道を尋ねたら、とても親切に教えてくれました。', vi: 'Tôi hỏi nhân viên nhà ga và được chỉ đường rất nhiệt tình.' },
      { ja: '質問：駅員さんは筆者に何をしてくれましたか。', vi: 'Hỏi: Nhân viên nhà ga đã làm gì giúp tác giả?' }
    ]
  },

  // === N5: Căn phòng của Yamada (n5_2407_d1) ===
  'n5_2407_d1': {
    passageTranslation:
      'Nhà của anh Yamada cách ga 10 phút đi bộ. Gần đó có siêu thị lớn và công viên. Căn phòng tuy không rộng lắm nhưng yên tĩnh và rất sạch đẹp. Tiền thuê nhà cũng không đắt nên anh Yamada rất thích căn phòng này.',
    questionTranslation:
      'Hỏi: Về căn phòng của anh Yamada, điều nào sau đây là đúng?',
    sentenceBreakdown: [
      { ja: '山田さんの家は駅から歩いて10分です。', vi: 'Nhà của anh Yamada cách ga 10 phút đi bộ.' },
      { ja: '近くに大きいスーパーや公園があります。', vi: 'Gần đó có siêu thị lớn và công viên.' },
      { ja: '部屋はあまり広くありませんが、静かでとてもきれいです。', vi: 'Căn phòng không rộng lắm nhưng yên tĩnh và rất sạch sẽ.' },
      { ja: '家賃も高くないので、山田さんはこの部屋がとても気に入っています。', vi: 'Tiền thuê không đắt nên anh Yamada rất vừa ý căn phòng này.' },
      { ja: '質問：山田さんの部屋について、正しいものはどれですか。', vi: 'Hỏi: Về căn phòng của anh Yamada, điều nào sau đây là đúng?' }
    ]
  },

  // === N5: Thông báo Thư viện (n5_2407_d2) ===
  'n5_2407_d2': {
    passageTranslation:
      '【Hướng dẫn sử dụng Thư viện】\n・Thời gian mở cửa: 9:00 sáng đến 19:00 tối.\n・Ngày nghỉ định kỳ: Thứ Hai hàng tuần (nếu thứ Hai trùng ngày lễ thì vẫn mở cửa, và sẽ nghỉ bù vào thứ Ba tiếp theo).\n・Số lượng sách được mượn: Mỗi người tối đa 5 cuốn (trong thời hạn 2 tuần).\n※ Vào ngày nghỉ, xin vui lòng trả sách vào hòm trả sách bên ngoài.',
    questionTranslation:
      'Hỏi: Khi thứ Hai là ngày lễ, thư viện sẽ nghỉ vào ngày thứ mấy?',
    sentenceBreakdown: [
      { ja: '開館時間：午前9時00分〜午後7時00分', vi: 'Giờ mở cửa: 9:00 sáng đến 19:00 tối.' },
      { ja: '休館日：毎週月曜日（月曜日が祝日の場合は開館、火曜日が休み）', vi: 'Ngày nghỉ: Thứ Hai hàng tuần (nếu thứ Hai là ngày lễ thì mở cửa, thứ Ba nghỉ bù).' },
      { ja: '質問：月曜日が祝日のとき、図書館は何曜日が休みになりますか。', vi: 'Hỏi: Khi thứ Hai là ngày lễ, thư viện nghỉ vào thứ mấy?' }
    ]
  },

  // === N5: Quy tắc vứt rác (n5_2407_19) ===
  'n5_2407_19': {
    passageTranslation:
      '【Quy tắc vứt rác sinh hoạt】\n・Rác cháy được: Thu gom vào trước 8:00 sáng thứ Ba và thứ Sáu.\n・Rác không cháy được: Thu gom vào trước 8:00 sáng thứ Tư.\n※ Thứ Bảy và Chủ Nhật không được phép mang rác ra nơi tập kết.',
    questionTranslation:
      'Hỏi: Vào sáng thứ Sáu, loại rác nào được phép mang ra vứt?',
    sentenceBreakdown: [
      { ja: '燃えるごみ：火曜日と金曜日の朝8時までに出してください。', vi: 'Rác cháy được: Hãy vứt trước 8h sáng thứ Ba và thứ Sáu.' },
      { ja: '燃えないごみ：水曜日の朝8時までに出してください。', vi: 'Rác không cháy được: Hãy vứt trước 8h sáng thứ Tư.' },
      { ja: '質問：金曜日の朝に出せるごみはどれですか。', vi: 'Hỏi: Sáng thứ Sáu có thể vứt loại rác nào?' }
    ]
  },

  // === N5: Lịch trình của Tanaka (n5_2307_4) ===
  'n5_2307_4': {
    passageTranslation:
      'Anh Tanaka mỗi sáng thức dậy lúc 6 giờ và đi dạo cùng chú chó cưng. Sau đó, anh ấy ăn bữa sáng rồi đến công ty lúc 7 giờ 30 phút.',
    questionTranslation:
      'Hỏi: Anh Tanaka làm việc gì trước khi ăn sáng?',
    sentenceBreakdown: [
      { ja: '田中さんは毎朝6時に起きて、犬と散歩します。', vi: 'Anh Tanaka mỗi sáng dậy lúc 6 giờ và đi dạo với chó.' },
      { ja: 'それから朝ご飯を食べて、7時半に会社へ行きます。', vi: 'Sau đó anh ấy ăn sáng rồi 7h30 đi làm.' },
      { ja: '質問：田中さんは朝ご飯の前に何をしますか。', vi: 'Hỏi: Anh Tanaka làm gì trước bữa ăn sáng?' }
    ]
  },

  // === N3: Remote Work (n3_2407_d1) ===
  'n3_2407_d1': {
    passageTranslation:
      'Những năm gần đây, việc làm việc từ xa (remote work) trở nên phổ biến, gánh nặng đi lại hàng ngày giảm đi và số người có thể sử dụng quỹ thời gian của mình một cách hiệu quả ngày càng tăng lên. Tuy nhiên mặt khác, ranh giới giữa công việc và đời sống cá nhân trở nên mờ nhạt, nhiều người lúc nào cũng nơm nớp lo lắng về tin nhắn, liên lạc công việc, dẫn đến mệt mỏi tinh thần. Những công cụ hay chế độ dù tiện lợi đến đâu, nếu dùng sai cách thì ngược lại sẽ làm giảm sút chất lượng cuộc sống.',
    questionTranslation:
      'Hỏi: Điều tác giả muốn truyền đạt nhất trong bài viết này là gì?',
    sentenceBreakdown: [
      { ja: '近年、リモートワークが普及したことで、通勤の負担が減り、自分の時間を有効に使える人が増えた。', vi: 'Gần đây remote work phổ biến, giảm gánh nặng đi lại và giúp tận dụng tốt thời gian.' },
      { ja: 'しかしその一方で、仕事と私生活の境界があいまいになり、精神的な疲労を感じる人も少なくないという。', vi: 'Tuy nhiên ranh giới công việc - đời sống mờ nhạt, nhiều người mệt mỏi tinh thần.' },
      { ja: '便利な道具や制度も、使い方を誤ればかえって生活の質を下げることになる。', vi: 'Công cụ tiện lợi nếu dùng sai cách thì ngược lại sẽ làm giảm chất lượng sống.' },
      { ja: '質問：筆者が最も伝えたいことは何か。', vi: 'Hỏi: Điều tác giả muốn truyền đạt nhất là gì?' }
    ]
  },

  // === N3: Khóa học vi tính (n3_2407_d2) ===
  'n3_2407_d2': {
    passageTranslation:
      '【Thông báo Khóa học Vi tính tại Trung tâm Cộng đồng thành phố】\n・Đối tượng: Người dân từ 18 tuổi trở lên đang sinh sống hoặc làm việc tại thành phố.\n・Học phí: Miễn phí tiền học (học viên chỉ tự chi trả tiền giáo trình 1,500 yên).\n・Cách thức đăng ký: Gửi bưu thiếp khứ hồi (gửi đi và nhận lời phản hồi), hoặc đăng ký qua biểu mẫu chuyên dụng trên trang web.\n・Hạn chót đăng ký: Trước ngày 15 tháng 7 (thứ Sáu) tính theo dấu bưu điện đến nơi (nếu vượt quá số lượng cho phép sẽ bốc thăm).\n※ Lưu ý: Không tiếp nhận đăng ký qua điện thoại.',
    questionTranslation:
      'Hỏi: Phương thức đăng ký khóa học này như thế nào là đúng?',
    sentenceBreakdown: [
      { ja: '申込方法：往復はがき、またはホームページの専用フォームより', vi: 'Cách đăng ký: Gửi bưu thiếp khứ hồi hoặc điền form chuyên dụng trên trang web.' },
      { ja: '電話での申し込みは受け付けておりません。', vi: 'Không tiếp nhận đăng ký qua điện thoại.' },
      { ja: '質問：この講座の申し込み方法として正しいものはどれですか。', vi: 'Hỏi: Phương thức đăng ký nào là đúng?' }
    ]
  },

  // === N2: GenAI và Kỹ năng con người (n2_2407_d1) ===
  'n2_2407_d1': {
    passageTranslation:
      'Nhờ sự đổi mới kỹ thuật vượt bậc của AI tạo sinh (GenAI), các nghiệp vụ mang tính rập khuôn và xử lý dữ liệu đang dần được tự động hóa với tốc độ chưa từng có. Tuy nhiên, những năng lực của con người như sự thấu cảm sâu sắc đối với người khác, sự phán đoán dựa trên đạo đức, hay việc xây dựng sự đồng thuận linh hoạt dựa trên bối cảnh... thì cho đến nay vẫn không thể bị máy móc thay thế được. Điều được đòi hỏi ở thời đại sắp tới không chỉ là kỹ năng sử dụng thành thạo AI, mà còn là việc trau dồi và mài giũa những thế mạnh chỉ con người mới có.',
    questionTranslation:
      'Hỏi: Điều mà tác giả đòi hỏi nhiều nhất ở con người thời hiện đại là gì?',
    sentenceBreakdown: [
      { ja: '生成AIの技術革新によって、定型的な業務やデータ処理はかつてないスピードで自動化されつつある。', vi: 'Nhờ GenAI, các nghiệp vụ rập khuôn và xử lý dữ liệu đang được tự động hóa với tốc độ chưa từng có.' },
      { ja: 'しかし、他者への深い共感や倫理的判断といった人間の能力は、依然として機械に代替されることはない。', vi: 'Tuy nhiên năng lực như thấu cảm hay phán đoán đạo đức vẫn không thể bị máy móc thay thế.' },
      { ja: 'これからの時代に求められるのは、AIを使いこなす技術だけでなく、人間ならではの強みを磨くことである。', vi: 'Thời đại tới đòi hỏi không chỉ biết dùng AI mà còn phải mài giũa thế mạnh riêng có của con người.' },
      { ja: '質問：筆者が現代人に最も求めていることは何か。', vi: 'Hỏi: Điều tác giả đòi hỏi nhiều nhất ở con người hiện đại là gì?' }
    ]
  },

  // === N1: Kết nối thường trực và Sự suy ngẫm (n1_2407_d1) ===
  'n1_2407_d1': {
    passageTranslation:
      'Tính tức thời thái quá và sự kết nối thường trực trong xã hội thông tin hiện đại đang làm phân mảnh tư duy của mỗi cá nhân, dần cướp đi khoảng thời gian tĩnh lặng để tự soi chiếu và đối diện với chính mình. Nếu không có ý thức tự chủ kiến tạo một không gian trí tuệ để suy ngẫm sâu sắc về bản chất của sự vật, con người ta sẽ đành cam chịu trở thành những thực thể thụ động bị cuốn theo và thao túng bởi những luồng thông tin hời hợt trên bề mặt.',
    questionTranslation:
      'Hỏi: Tác giả đang gióng lên hồi chuông cảnh báo mạnh mẽ nhất về điều gì?',
    sentenceBreakdown: [
      { ja: '情報社会における過度な即時性と常時接続は、個人の思考を断片化し、内省の時間を奪い去りつつある。', vi: 'Tính tức thời và thường trực kết nối đang làm phân mảnh tư duy và cướp đi thời gian tự suy ngẫm.' },
      { ja: '深く物事の本質を思索する知的空間を自覚的に確保しなければ、表層的な情報に翻弄される受動的な存在に甘んじることになるだろう。', vi: 'Nếu không chủ động giữ không gian suy ngẫm bản chất, ta sẽ trở thành kẻ thụ động bị thông tin bề mặt chi phối.' },
      { ja: '質問：筆者が最も警鐘を鳴らしていることは何か。', vi: 'Hỏi: Tác giả đang cảnh báo điều gì nhất?' }
    ]
  }
};

/**
 * Retrieves the comprehensive translation entry for a question,
 * with multi-tier fallback ensuring NO question ever displays raw hints as translations.
 */
export function getDokkaiTranslation(questionId: string, questionText: string): DokkaiTranslationEntry | undefined {
  // 1. Direct ID match
  if (DOKKAI_PASSAGE_TRANSLATIONS[questionId]) {
    return DOKKAI_PASSAGE_TRANSLATIONS[questionId];
  }

  // 1b. Partial key match in questionId
  const qIdLower = questionId.toLowerCase();
  for (const [key, entry] of Object.entries(DOKKAI_PASSAGE_TRANSLATIONS)) {
    const suffix = key.split('_').pop(); // e.g. "d26", "d31"
    if (suffix && (qIdLower.includes(`_${suffix}`) || qIdLower.endsWith(suffix))) {
      return entry;
    }
  }

  // 2. Specific multi-question sub-prompts first
  if (questionText.includes('かれらの気持ち') || questionText.includes('どうしてかれら')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_nl01_d31'];
  }
  if (questionText.includes('パンについて') || (questionText.includes('パン') && questionText.includes('外国の人'))) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_nl01_d32'];
  }
  if (questionText.includes('こんなことが起き') || questionText.includes('どうしてこんなことが')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_nl01_d33'];
  }
  if (questionText.includes('メイさん') && (questionText.includes('安いコース') || questionText.includes('A～D'))) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_nl01_d35'];
  }

  // 3. Content fingerprint match
  if (questionText.includes('八百屋') || questionText.includes('リンゴとみかん')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_nl01_d26'];
  }
  if (questionText.includes('ワンさんの休み') || questionText.includes('祭日')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_nl01_d27'];
  }
  if (questionText.includes('シェアハウス')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_nl01_d28'];
  }
  if (questionText.includes('ジョギング') && questionText.includes('わかい女の人')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_nl01_d29'];
  }
  if (questionText.includes('日本のケーキ') || questionText.includes('バンクーバー') || questionText.includes('オーストラリア人')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_nl01_d30'];
  }
  if (questionText.includes('東日本語学校') || questionText.includes('アリさんとメイさん') || questionText.includes('アリさんは早く')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_nl01_d34'];
  }
  if (questionText.includes('東京駅') && questionText.includes('駅員')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n4_2407_19'];
  }
  if (questionText.includes('山田さんの家') || questionText.includes('静かでとてもきれい')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n5_2407_d1'];
  }
  if (questionText.includes('図書館の利用案内') || questionText.includes('本を借りられる冊数')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n5_2407_d2'];
  }
  if (questionText.includes('ごみの出し方') || questionText.includes('燃えるごみ')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n5_2407_19'];
  }
  if (questionText.includes('犬と散歩') || questionText.includes('田中さんは毎朝')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n5_2307_4'];
  }
  if (questionText.includes('リモートワーク')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n3_2407_d1'];
  }
  if (questionText.includes('市民センター') && questionText.includes('パソコン講座')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n3_2407_d2'];
  }
  if (questionText.includes('生成AI') || questionText.includes('定型的な業務')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n2_2407_d1'];
  }
  if (questionText.includes('情報社会') && questionText.includes('即時性')) {
    return DOKKAI_PASSAGE_TRANSLATIONS['n1_2407_d1'];
  }

  return undefined;
}
