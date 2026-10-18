/** Build the reviewed study notes against an exact saved transcript; never edit captions. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { localShadowingAnalysis } from '../src/server/shadowing';
import { parseShadowingAnalysisFile, claudeShadowingPrompt } from '../src/utils/shadowingAnalysisFile';
import type { ShadowingAnalysis } from '../src/utils/shadowing';
const videoId = 'R1Oy-PqXhz4';
const source = JSON.parse(await readFile(`public/shadowing-prepared/${videoId}.json`, 'utf8'));
// Contextual notes authored for this transcript, not inferred from video audio.
const grammarNotes = `
2|これから／～を始めます|Từ bây giờ / bắt đầu…|これから chỉ thời điểm sắp bắt đầu; を đánh dấu hoạt động được bắt đầu. 朝会 có khả năng là lỗi nhận dạng của 聴解, cần đối chiếu âm thanh.
4|Vてください|Hãy làm…|聞く → 聞いて + ください: yêu cầu người thi nghe câu hỏi trước.
5,120|～の中から／Vてください|Từ trong… / hãy…|1から4の中から giới hạn lựa chọn; 1つ chọn một đáp án. 選ぶ → 選んでください là lời hướng dẫn.
7,24,47,75,86,121,131,143,157,169,180,190|Vています|Đang làm…|話しています／説明しています diễn tả hành động nói hoặc giải thích đang diễn ra trong tình huống đề thi.
8,22|Vてはいけない／Vこと|Không được làm… / việc…|してはいけない bổ nghĩa こと: điều bị cấm làm. Chủ đề câu hỏi là việc người đàn ông không được làm hôm nay.
10|どうしましたか|Có chuyện gì vậy?|Câu hỏi lịch sự dùng khi thấy người khác gặp vấn đề; bác sĩ hỏi triệu chứng của bệnh nhân.
11|Aくて／～も／～んです|…và… / cũng / giải thích|痛い → 痛くて nối hai triệu chứng; も thêm đau họng bên cạnh đau đầu. んです cung cấp lời giải thích về tình trạng.
12,16|～ですか|Có phải… không? / vậy sao?|そうですか dùng để tiếp nhận hoặc xác nhận thông tin; やっぱり nhấn mạnh điều đã nghi ngờ trước đó.
13|Vましょう／～ね|Tôi/chúng ta làm… nhé|見ましょう là đề nghị kiểm tra họng; ちょっと làm lời nói nhẹ nhàng hơn, ね tìm sự đồng thuận.
14|Aくなる／Vています|Trở nên… / trạng thái kết quả|赤い → 赤くなる: trở nên đỏ. なっています miêu tả tình trạng họng đã đỏ lên; すごく nhấn mạnh mức độ.
17|～から／Vて、Vてください|Vì… / hãy làm A rồi B|あげますから nêu lý do: sẽ đưa thuốc. 飲んで nối việc uống thuốc với 寝てください: nghỉ ngơi sau khi uống thuốc.
18|～がある／Vに行く／～んです|Có… / đi để làm… / giải thích|仕事があって nêu lịch làm việc; 食べに行く là đi ăn. 会社の人と chỉ người đi cùng; んです giải thích vì sao khó nghỉ.
19|あまり～ない|Không… lắm|あまり đi với phủ định 良くない: không tốt lắm, lời nhận xét nhẹ của bác sĩ.
20|Vのは構いませんが／Vないようにしてください|Làm… thì được, nhưng / hãy cố đừng…|食べに行くの danh từ hóa việc đi ăn; が chuyển sang điều hạn chế. 飲まないようにしてください yêu cầu tránh uống rượu.
21,39,66,173|わかりました|Tôi hiểu rồi|Dạng lịch sự quá khứ của わかる dùng để xác nhận đã hiểu hoặc nhận lời. Trong câu 173 có thể chứa hai lượt nói.
25,30|Vたらいいですか|Nên làm… thì được?|止めたらいい hỏi cách hoặc vị trí phù hợp để đỗ xe; どこに chỉ nơi đến/vị trí đỗ.
26|お～の方／お願いいたします|Quý vị… / kính đề nghị|お車の方 là cách gọi lịch sự người đi ô tô. いたします là cách nói khiêm nhường của します.
27|～にございます|Có/ở tại…|ございます là cách nói trang trọng của あります. 建物の前に chỉ vị trí bãi đỗ ở phía trước tòa nhà.
28|Vないでください／～や～|Xin đừng… / …và…|止めないでください là yêu cầu không đỗ xe. や liệt kê các nơi như trước hồ bơi và cạnh ao.
29|～ので／Vないよう|Vì… / sao cho không…|困るので nêu lý do gây phiền cho hàng xóm. 止めないよう là lời đề nghị tránh đỗ xe trên đường.
32|～に電話をする|Gọi điện cho…|に đánh dấu người nhận cuộc gọi, ở đây là con trai. を đi với danh từ 電話 để tạo cụm gọi điện.
33,45,109,116|Vなければなりません|Phải làm…|しなければなりません diễn tả nghĩa vụ. まず hỏi hành động cần làm trước tiên, không phải mọi việc phải làm.
34|Vたい／Vことがある／～の|Muốn làm… / có việc…|頼みたいことがある: có việc muốn nhờ. だけど mở lời nhẹ nhàng; の cuối câu giải thích thân mật.
36|Vたまま／～かもしれない|Cứ để nguyên… / có lẽ…|ついたまま chỉ điều hòa vẫn đang bật; かもしれない diễn đạt sự không chắc chắn của người mẹ.
37,101|Vてくれる（ない）|Làm giúp tôi được không?|見てきてくれる nhờ đi xem rồi quay lại; 手伝ってくれない dùng câu hỏi phủ định để nhờ giúp đỡ.
40|～頃／Vの|Khoảng… / hỏi thân mật|何時頃 hỏi giờ gần đúng. 出かけるの là câu hỏi thân mật về giờ ra ngoài; 高一 có thể là tên riêng, không tự đoán cách đọc.
41|もうすぐ|Sắp, chẳng bao lâu nữa|もうすぐ出る: sắp ra khỏi nhà. よ báo thông tin người nghe chưa biết.
43|Vる時／Vてね|Khi làm… / nhớ làm… nhé|出かける時 đặt thời điểm trước/lúc ra ngoài; 閉めてね nhắc đóng cửa/khóa cẩn thận.
44|～も／Vのよ|Cũng… / nhớ… đấy|も thêm việc tắt điện trong phòng vào danh sách lời dặn. 消すのよ là lời nhắc thân mật có nhấn mạnh.
48,57|どのN／～に行きますか|Nào / đi đến…?|どの教室 hỏi phòng học nào; 53番の人 chỉ thí sinh mang số 53.
50|～が／～ので／Vて|…nhưng/nối lời / vì…|始めますが chuyển sang hướng dẫn; 人が多いので nêu lý do chia phòng. Chuỗi số 301からが304 có lỗi nhận dạng, không suy đoán đáp án từ câu này.
51|Vてある／Vています|Được… sẵn / đang có…|番号が書いてある: số đã được viết sẵn trên giấy. 持っています chỉ việc đang cầm/đang có tờ giấy.
52|～から／よくVてください|Vì… / hãy… kỹ|言いますから nêu lý do cần lắng nghe; よく聞いてください yêu cầu nghe kỹ số và phòng.
53|AからBまで／～に行ってください|Từ A đến B / hãy đến…|1番から30番 chỉ nhóm số 1–30; 301に行ってください yêu cầu nhóm này đến phòng 301.
54,55,56|～の人は|Những người… thì…|Chủ đề là nhóm số thí sinh. Các dòng bị ngắt và dính số nên không tự phục dựng ranh giới phòng/số khi chưa nghe lại.
59,73|これから／何をしますか|Tiếp theo sẽ làm gì?|これから hỏi hành động sắp thực hiện; cần phân biệt việc đã chuẩn bị xong với việc còn phải làm.
60|何をVばいいですか|Nên làm gì?|すればいい hỏi việc cần làm để chuẩn bị cuộc họp; あと nhấn mạnh phần việc còn lại.
62|Vた／～よね|Đã làm… / đúng không?|準備した là quá khứ thân mật. よね kiểm tra lại việc máy tính đã được chuẩn bị.
65|Vてくれる|Làm giúp tôi…|準備してくれる là nhờ chuẩn bị video. ビデオですか có thể là lượt đáp xác nhận của người kia trong cùng dòng.
67|何かありますか|Có gì nữa không?|何か hỏi một điều chưa xác định; あとは hỏi việc còn lại sau những việc đã nêu.
68|もう／大丈夫|Đã… rồi / ổn, đủ|もう大丈夫だよ: mọi thứ đã ổn, không còn yêu cầu thêm.
70|Vますね|Tôi sẽ làm… nhé|準備をしますね thông báo ý định chuẩn bị trà; 最後に là bước cuối cùng.
71|Vなくてもいい／～から|Không cần làm… / vì…|しなくてもいい cho phép không làm. 鈴木さんに頼んだから: đã nhờ Suzuki nên không cần chuẩn bị trà nữa.
76,84|Vてもいい|Được phép làm…|何を使ってもいい hỏi vật dụng được phép sử dụng trong kỳ thi.
77|～について／Vたいと思います|Về… / tôi muốn…|試験について giới thiệu chủ đề; お話ししたいと思います diễn đạt ý định nói một cách lịch sự.
78|Vて／Vてもいい|Làm A rồi/trong khi B / được phép…|ノートを見て受けてもいい: được thi trong khi xem vở ghi; quyền này sẽ bị giới hạn bởi câu tiếp theo.
79|VたN／～にしてください|Danh từ đã… / hãy chọn/quy định…|自分で書いたもの là thứ do chính mình viết. 必ず nhấn mạnh bắt buộc dùng vở tự ghi.
80|VたりVたりする／～はいけません|Làm những việc như… / không được…|コピーしたり、貼ったり liệt kê cách làm vở không được chấp nhận; したもの danh từ hóa sản phẩm đã làm.
81|～中に／～からね|Trong lúc… / vì… đấy|試験中に chỉ thời gian đang thi; チェックしますからね báo trước việc giáo viên sẽ kiểm tra vở.
82,115|Vてください|Hãy…|注意してください nhắc người nghe chú ý; trong câu 115 lý do là có thể phải trả 3000 yên.
83|Vていますが／Vないでください|Thường/đang… nhưng / xin đừng…|よく辞書を使っています nói thói quen dùng từ điển; 試験中は đặt giới hạn trong giờ thi, khi đó không được dùng.
87,106|この後／まず|Sau đây / trước tiên|Câu hỏi yêu cầu hành động đầu tiên sau cuộc hội thoại, không phải kế hoạch đi chơi ngày mai.
88|お先に失礼します|Tôi xin phép về trước|Lời chào khi rời nơi làm việc trước đồng nghiệp; đáp lại thường là お疲れさまでした.
89|Aいね|…nhỉ|早いね nhận xét giờ về hôm nay sớm; ね tìm sự chia sẻ với người nghe.
90|どこか／Vの|Đâu đó / hỏi thân mật|どこか行くの hỏi có định đi đâu không; か sau từ nghi vấn làm nghĩa không xác định.
91|Vに行く／～んです|Đi để… / giải thích|デパートに行く là đi đến trung tâm thương mại; これから chỉ kế hoạch ngay sau đây. んです bổ sung lời giải thích.
93,94|NはA／～よ|…thì… / thông báo|明日の夜は暇 hỏi tối mai có rảnh không; 暇ですよ là câu trả lời có nhấn mạnh thông tin.
96|Vに行こう|Cùng đi làm…|食べに行く: đi ăn. 行こう là thể ý chí thân mật dùng để rủ người nghe.
97|～が／Vよ|…sẽ… đấy|僕が nhấn mạnh người trả tiền là người nói; 払うよ là lời hứa thân mật.
98|～んですか|Có thật là được không?|いいんですか xác nhận lời đề nghị được mời trả tiền ăn; んですか hỏi lại điều vừa nghe với sắc thái ngạc nhiên.
100|だからさ|Vì thế / này…|Cụm nối khẩu ngữ dùng để dẫn đến lời nhờ vả; cần hiểu cùng câu 手伝ってくれない sau đó.
102|Vちゃう／～よ|Lỡ/hoàn tất… / nhấn mạnh|閉まっちゃいます là rút gọn của 閉まってしまいます: cửa hàng sẽ đóng mất, hàm ý lo lắng/tiếc.
104|～だけ|Chỉ…|1時間だけ giới hạn thời gian đồng ý giúp là một giờ; よ của dòng tiếp theo là tiểu từ cuối câu bị tách.
108|～にメッセージを残す|Để lại lời nhắn…|電話にメッセージを残しました chỉ việc đã để lại lời nhắn qua điện thoại của Yamada.
110|～でしょうか|Có phải… không ạ?|Cách hỏi lịch sự, mềm hơn ですか. おタ là đoạn nhận dạng không rõ, có thể liên quan お宅; cần nghe lại.
111|こちらは～です|Đây là…|Cách tự giới thiệu bên gọi điện, ở đây là cửa hàng cho thuê Minami.
112|おVますになる／Vられていない／～ので|Kính ngữ / chưa được… / vì…|お借りになった là kính ngữ của 借りた; 返されていない là bị động phủ định: DVD chưa được trả lại.
113|Vことができる／Vていらっしゃる|Có thể… / kính ngữ của Vている|借りることができます nói thời hạn được thuê; 借りていらっしゃいます kính trọng người thuê, ở đây đã giữ bảy ngày.
114|～と／可能形／～なくなる|Hễ… thì… / thể khả năng / trở nên không…|過ぎると nêu điều kiện dẫn đến kết quả; 借りられなくなります: sẽ không thể thuê DVD tiếp theo.
115|Vていただく／～ので|Được nhờ người khác làm… / vì…|払っていただきます là cách nói lịch sự yêu cầu khách trả tiền; số tiền nêu trong phụ đề là 3000円.
117,118,248|まず／その後／Vてください|Trước tiên / sau đó / hãy…|Hướng dẫn thứ tự nghe câu hỏi rồi xem đề; その後 chỉ bước tiếp theo.
119|Vる時間がある|Có thời gian để…|読む bổ nghĩa 時間: thời gian đọc đề. Không diễn tả khả năng đọc tiếng Nhật nói chung.
122,129|どうして／Vますか|Tại sao…?|Hỏi nguyên nhân chuyển nhà của người phụ nữ, không hỏi ưu điểm căn phòng.
123|Vるんだ|Sẽ… đấy / giải thích thân mật|引っ越すんだ thông báo dự định chuyển nhà vào tháng sau; んだ mang sắc thái giải thích.
124|Vて／期間くらい／～よね|Sau khi… / khoảng thời gian / đúng không?|住んで1年くらい: đã sống khoảng một năm; まだ nhấn mạnh mới chỉ, よね xác nhận lại.
125|～し／Aくて／～んだけど|…và còn… / nối tính từ / nhưng…|駅が近いし liệt kê ưu điểm; 広くていい nối rộng và tốt. だけど chuyển sang nhược điểm là người hàng xóm.
127|～のに／～と／Vてくる|Mặc dù… / hễ… / hành động hướng về người nói|何もしてないのに: dù chẳng làm gì. 通ると nêu tình huống lặp lại; 文句を言ってくる: cứ phàn nàn với mình.
128|Aくて／～さ|Vì… / tiểu từ khẩu ngữ|怖くて cho biết cảm giác sợ là lý do muốn chuyển nhà; さ là cách nói thân mật.
132,141|何時に／会う|Gặp lúc mấy giờ?|に đánh dấu thời điểm gặp; không nhầm với giờ bữa tiệc bắt đầu.
133|～から／～だよね|Bắt đầu từ… / đúng không?|3時半から nói tiệc bắt đầu lúc 3 giờ rưỡi, だよね xác nhận thông tin.
134,137|Vた方がいい／Aい方がいい|Nên làm… / …hơn thì tốt|行った方がいい là khuyên nên đi sớm; 早い方がいい khuyên chọn thời gian sớm hơn.
136|～くらい|Khoảng…|3時くらい là gợi ý giờ gần đúng, chưa phải giờ đã thống nhất.
138|Nの時間前に／～にしよう|Trước… / hãy chọn…|始まる1時間前 là một giờ trước lúc tiệc bắt đầu; にしよう đề nghị chọn giờ đó, tức 2:30 nếu tiệc bắt đầu 3:30.
140|そうしよう|Cứ quyết định vậy nhé|Thể ý chí của する: chấp nhận phương án vừa được đề xuất.
144,155|どうすることにしましたか|Đã quyết định làm gì?|Vることにする nói quyết định của chủ thể; câu hỏi cần lựa chọn cuối cùng sau cuộc trao đổi.
145|どうするの|Bạn định làm gì?|の cuối câu hỏi thân mật về kế hoạch nghỉ hè.
146|Vるつもり／まだVていない|Định làm… / vẫn chưa…|行くつもり nói ý định đi Kyoto hoặc Osaka; 決めてない là rút gọn của 決めていない, chưa quyết định.
147|AかB／どっちも|A hoặc B / cả hai đều|京都か大阪 nêu hai lựa chọn; どっちもいい nghĩa cả hai đều hay.
148|AとBとどっちの方／～と思う|Giữa A và B cái nào hơn / nghĩ rằng…|Cấu trúc so sánh để hỏi ý kiến; いいと思う hỏi người nghe nghĩ nơi nào tốt hơn.
149|～は～が／～し|…thì… / và còn…|京都はお寺が有名: chủ đề Kyoto, đối tượng nổi tiếng là chùa; し liệt kê một lý do/ưu điểm.
150|～は～がA|Ở/chủ đề… thì…|大阪は食べ物が美味しい: Osaka có đồ ăn ngon; 食べ物 là chủ thể của 美味しい.
151|どっちにしようかな|Nên chọn bên nào nhỉ?|にする là lựa chọn; かな thể hiện tự hỏi, còn đang phân vân.
152|AからBまで／～で／～くらい|Từ A đến B / bằng… / khoảng…|から・まで chỉ điểm đầu/cuối, 電車で là phương tiện, 30分くらい là thời gian gần đúng.
153|どっちにも／可能形|Cả hai nơi đều / có thể…|行ける là thể khả năng của 行く; どっちにも có nghĩa có thể đến cả hai nơi.
154|両方／Vるよ|Cả hai / tôi sẽ…|両方行く là quyết định đi cả Kyoto và Osaka; よ thông báo lựa chọn vừa chốt.
158,168|なかなか～ない／可能形|Mãi/khó mà… / có thể…|会えません là phủ định khả năng của 会う; なかなか nhấn mạnh khó có dịp gặp bạn.
159|～に慣れた|Đã quen với… chưa?|仕事に慣れる là quen với công việc; に đánh dấu điều người nói thích nghi.
160|～より／～から／Vちゃう|Hơn… / vì… / lỡ hoặc kết quả hoàn toàn|学生の時より so sánh với thời sinh viên; 忙しいから nêu lý do, 疲れちゃう là 疲れてしまう trong khẩu ngữ.
162|Vことがある／～のに／可能形|Có lúc… / mặc dù… / có thể…|休みの日も仕事をすることがある: có khi phải làm cả ngày nghỉ; もらえる là có thể nhận; のに đối lập làm nhiều mà lương ít.
163|全然～ない|Hoàn toàn không…|自分の時間も全然ない: cũng chẳng có thời gian riêng; も bổ sung khó khăn khác.
164|可能形／～ね|Có thể… / nhỉ|会えない là không thể gặp; なかなか thêm sắc thái khó thu xếp thời gian.
167|～に／終わる|Kết thúc vào…|5時に đánh dấu giờ kết thúc công việc hằng ngày; は đặt công ty của người nói làm chủ đề so sánh.
170,179|どの順番で|Theo thứ tự nào?|で chỉ cách thức; cần ghép trình tự gội đầu, cắt tóc rồi uốn từ toàn hội thoại.
171|Vましたね|Đã… rồi nhỉ|伸びました nói trạng thái tóc đã dài ra; 紙 có khả năng là nhận dạng nhầm 髪 trong ngữ cảnh tiệm tóc.
172|どうしますか|Anh/chị muốn làm thế nào?|Câu hỏi lịch sự hỏi yêu cầu dịch vụ, ở đây là kiểu tóc muốn làm.
173|Vたい／～んですが|Muốn… / mở lời nhờ vả|パーマをかけたい: muốn uốn tóc. んですが mở lời nhẹ nhàng; phần はいわかりました có thể là câu đáp của thợ.
174|Vるより／Aくする／Vた方がいい／～ても大丈夫|Thay vì… / làm cho… / nên… / có được không?|短くする là làm ngắn tóc; した方がいい là lời khuyên; 切っても大丈夫ですか hỏi đồng ý cắt khoảng 3 cm.
175|お願いします|Nhờ anh/chị làm giúp|Lời chấp thuận và nhờ thực hiện đề nghị trước đó.
176|Vてから|Sau khi làm… rồi…|切ってからパーマをかけます nêu thứ tự cắt trước, uốn sau. 紙 có khả năng là 髪, cần đối chiếu bản ghi.
177|その前に／Vましょう|Trước đó / hãy…|その前に chỉ trước bước cắt tóc vừa nêu; シャンプーをしましょう là đề nghị gội đầu trước.
178|あちらへどうぞ|Xin mời sang phía kia|へ chỉ hướng; どうぞ là lời mời lịch sự khi hướng dẫn khách di chuyển.
181,188|～に合うのはどれ|Cái nào khớp với…?|の danh từ hóa đối tượng phù hợp với nội dung bài nói. Phụ đề viết 会う, ngữ cảnh nhiều khả năng cần 合う, chưa sửa text.
182|～に～を聞く|Hỏi ai về điều gì|男の人50人と女の人50人に chỉ hai nhóm được hỏi; 好きな本 là chủ đề hỏi. 聴きました trong text có thể cần đối chiếu 聞きました.
183,185|人気があったのは～|Thứ được yêu thích là…|の danh từ hóa, は đưa ra thứ hạng rồi nêu tên sách; 1番／2番目 chỉ thứ nhất/thứ hai.
184,186|～は～でした|…thì là…|Chủ ngữ rút gọn là cuốn sách được nữ giới ưa thích; tên sách không nên dịch như một câu trần thuật độc lập.
187|～も～も／同じで|Cả…lẫn… / giống nhau và…|男の人も女の人も: cả nam lẫn nữ; 同じで nối thông tin hai nhóm chọn cùng cuốn sách hạng ba.
191,198|V時／どうやって|Khi… / bằng cách nào?|休みの時 đặt điều kiện thư viện đóng cửa; どうやって hỏi cách trả sách trong tình huống đó.
192|Vます語幹＋方／～について|Cách làm… / về…|借り方 là cách mượn: bỏ ます của 借ります rồi thêm 方. について xác định nội dung giải thích.
193|～まで／可能形|Tối đa… / có thể…|1人10冊まで giới hạn mỗi người tối đa mười cuốn; 借りられます là thể khả năng, thời hạn hai tuần.
194|Vている場合／Vことができる|Trong trường hợp… / có thể…|他の人が借りている場合 nói trường hợp sách đang được người khác mượn; khi đó có thể đặt trước.
195|そうすれば／可能形|Nếu làm vậy / có thể…|そうすれば dẫn kết quả của việc đặt trước; 借りられます nói quyền mượn sau người đang giữ sách.
196|Vる時／Vてくる／Vてください|Khi… / mang đến / hãy…|返す時 là lúc trả sách; 持ってきてください yêu cầu mang đến quầy tiếp nhận, hướng về người nói.
197|Vていない時／VためのN／～ので|Khi chưa/không… / N để làm… / vì…|返すためのポスト là hòm để trả sách; ので nêu lý do dùng hòm. 空いていない có thể nhận dạng nhầm 開いていない: chưa xác minh bằng âm thanh.
201|Vながら／Vてください|Vừa…vừa… / hãy…|見ながら質問を聞く: vừa nhìn tranh vừa nghe câu hỏi; cùng một chủ thể thực hiện hai hành động.
202,206,215,223,231,240|何と言いますか|Sẽ nói gì?|と đánh dấu nội dung lời nói; câu hỏi chọn cách diễn đạt thích hợp với tình huống.
203|～の中から／Vてください|Trong số… / hãy…|Chọn một đáp án tốt nhất từ các phương án 1–3; 一番いいもの bổ nghĩa đáp án phù hợp nhất.
205|Vます語幹＋終わる／まだVていない|Làm xong… / vẫn chưa…|書き終わる là viết xong, ghép thân 書き với 終わる; 書き終わっていません: vẫn chưa hoàn thành báo cáo.
208|Vていただけませんか|Anh/chị có thể làm giúp… được không ạ?|待っていただけませんか là lời nhờ giáo viên chờ thêm, mức lịch sự cao và phù hợp vị thế người nói.
210|使役形＋てください|Xin cho phép tôi…|待つ → 待たせる: cho chờ. 待たせてください xin phép được chờ, khác với nhờ giáo viên chờ mình.
212|Vことができる／～んですか|Có thể làm… / hỏi giải thích|待つことができる hỏi khả năng chờ; không trực tiếp diễn đạt lời xin gia hạn để hoàn thành bài.
214|～に入る|Đi vào…|に đánh dấu nơi bước vào: phòng của giáo viên; lựa chọn lời chào cần phù hợp hành động vào phòng.
217|失礼します|Xin phép / xin thất lễ|Câu lịch sự dùng khi vào hoặc rời phòng, ngắt lời hay làm điều có thể gây phiền.
219|ただいま|Tôi đã về|Lời chào khi trở về nhà hoặc nơi thuộc về mình; không phải lời xin phép bước vào phòng giáo viên.
221|ごめんください|Có ai ở nhà không ạ?|Lời gọi khi đến thăm nhà/cửa hàng; khác với xin phép vào phòng ở cơ quan/trường học.
222|AそうなN／Vています|N có vẻ… / đang…|重い → 重そうな: có vẻ nặng, bổ nghĩa 荷物; 持っています chỉ đang mang đồ.
225|おVますになる|Kính ngữ của hành động người khác|お持ちになりますか hỏi thầy/cô có mang đồ không, không trực tiếp đề nghị mình mang giúp.
227|Vて差し上げる|Làm giúp người trên|持って差し上げます diễn đạt làm giúp người trên, nhưng nói trực tiếp với thầy/cô có thể có sắc thái ban ơn; cần xét quan hệ và ngữ cảnh.
228|おVますいたす|Khiêm nhường ngữ|お持ちいたします hạ thấp hành động của mình để tôn trọng giáo viên: em xin mang giúp.
230|～を休む|Nghỉ…|授業を休みました là đã nghỉ buổi học; を đánh dấu hoạt động bị bỏ/nghỉ.
233|Nをください|Xin cho tôi N|ノートをください xin được cho cuốn vở; khác với mượn tạm để chép bài.
235|Vてくれませんか|Bạn có thể làm giúp… không?|貸してくれませんか là lời nhờ cho mượn vở, phù hợp khi cần xem bài đã bỏ lỡ.
237|Nはどこですか|N ở đâu?|Hỏi vị trí cuốn vở, không diễn đạt yêu cầu mượn vở.
239|Vたい|Muốn làm…|撮りたい là muốn chụp ảnh; tình huống cần chọn cách xin phép chụp nếu không nhờ người khác chụp hộ.
242|Vていいんですね|Vậy là được phép… đúng không?|Xác nhận điều được phép sau khi đã có căn cứ, khác với câu hỏi xin phép trung tính.
244|Vてくれませんか|Bạn chụp giúp được không?|撮ってくれませんか nhờ người nghe chụp hộ; chủ thể chụp là người nghe, không phải tự mình xin phép chụp.
246|Vてもいいですか|Tôi có thể… được không?|撮ってもいいですか là hỏi xin phép tự chụp ảnh.
247|Nなど／～がありません|Những thứ như N / không có…|絵などがありません cho biết phần này không có tranh và các hỗ trợ tương tự.
249|Vて／～の中から|Làm… rồi… / trong số…|Nghe câu trước, sau đó nghe phản hồi và chọn một phương án tốt nhất; 返事 là lời đáp.
251,254,268|Vましょう|Cùng làm… nhé|行きましょう／会いましょう dùng để rủ/đề nghị làm cùng; で trong タクシーで chỉ phương tiện.
253,256,259|そうですね|Đúng vậy / để xem…|Trong các phương án này dùng để đồng ý với đề nghị trước; nghĩa cụ thể phụ thuộc câu theo sau.
257,260|～ですからね|Bởi vì… mà|から nêu lý do: đắt hoặc nhiều hành lý. ね tìm sự đồng thuận; cần chọn lý do phù hợp với việc đi taxi.
262|どちらに／いらっしゃる|Ở đâu ạ? / kính ngữ|どちら lịch sự hơn どこ; いらっしゃいます là kính ngữ của いる khi hỏi nơi thầy Tanaka đang ở.
264|かしこまりました|Tôi đã rõ / xin tuân theo|Lời đáp trang trọng khi nhận yêu cầu; không trực tiếp trả lời câu hỏi vị trí.
266|Vていません|Chưa…|来ていません: hôm nay chưa đến; phủ định trạng thái hiện tại của 来る trong ngữ cảnh người được hỏi không có mặt.
270|～らしい|Nghe nói… / có vẻ…|台風が来るらしい truyền đạt thông tin nghe được về bão ngày mai; không khẳng định người nói tự quan sát.
272|なるべく／Vた方がいい|Càng…càng tốt / nên làm…|家にいた方がいい khuyên nên ở nhà khi có bão; なるべく nhấn mạnh cố gắng ở nhà nếu có thể.
274,276|～ですね|…nhỉ|いい天気／楽しみ là nhận xét thời tiết tốt/vui mong đợi; cần đối chiếu với ngữ cảnh cảnh báo bão, không tự coi đó là phản hồi hợp lý.
278|何時から|Bắt đầu từ mấy giờ?|から hỏi giờ bắt đầu cuộc họp; phân biệt với giờ kết thúc.
280|～ですか|Có phải… không?|9時ですか là câu hỏi ngược xác nhận mốc 9 giờ, không trực tiếp cung cấp giờ bắt đầu.
282|～に始まる|Bắt đầu lúc…|9時に始まります trực tiếp trả lời cuộc họp bắt đầu lúc 9 giờ.
284|～に終わる|Kết thúc lúc…|9時に終わります nói giờ kết thúc, khác với câu hỏi giờ bắt đầu.
286|久しぶりですね|Lâu rồi mới gặp nhỉ|Lời chào khi lâu ngày gặp lại một người; ですね tìm sự đồng cảm.
288,289|本当に／久しぶり|Thật sự / đã lâu|Hai dòng bị ngắt giữa 本当 và に. Đọc liên tiếp là 本当に久しぶりですね; không đổi ID hay ghép text trong file phân tích.
291|お世話になりました|Cảm ơn vì đã giúp đỡ/chăm sóc|Lời cảm ơn sau khi được hỗ trợ, thường khi chia tay hoặc kết thúc một giai đoạn; không đơn thuần là lâu ngày gặp lại.
293|おかげさまで|Nhờ ơn anh/chị / may nhờ…|Cụm đáp khi nói mình ổn nhờ sự giúp đỡ, thường theo sau lời hỏi thăm sức khỏe/tình hình.
296|AとBどちらの方が／好き|Giữa A và B thích bên nào hơn?|どちらの方が hỏi so sánh sở thích; chủ đề cụ thể là cà phê và hồng trà.
298|Nが好き|Thích N|飲み物が好き nghĩa thích đồ uống nói chung; không chọn giữa hai loại đã được hỏi.
300|～と思います|Tôi nghĩ là…|コーヒーが好きだと思います là nghĩ rằng thích cà phê; だ nối mệnh đề danh/tính từ な trước と.
302|Nの方が好き|Thích N hơn|紅茶の方が好きです trực tiếp nói thích hồng trà hơn trong phép so sánh hai loại.
305|Vてどれくらい|Được bao lâu kể từ khi…?|日本に来てどれくらい hỏi thời gian sống ở Nhật kể từ lúc đến, không hỏi thời gian di chuyển.
307|～で／期間です|Bằng… / mất… thời gian|飛行機で15時間 nói thời lượng đi máy bay, không trực tiếp trả lời đã ở Nhật bao lâu.
309|もう＋期間|Đã… rồi|もう5年です nghĩa đã được năm năm, phù hợp với câu hỏi khoảng thời gian từ lúc đến Nhật.
311|期間前／でした|Cách đây… / đã là…|3年前でした nêu mốc ba năm trước, khác với cách nói một khoảng thời gian đã kéo dài bao lâu.
314|どこで／Vる|Ở đâu / làm…|で đánh dấu nơi diễn ra hành động học, khác に dùng cho vị trí tồn tại hoặc điểm đến.
316|Nはどう|N thì sao?|図書館はどう gợi ý địa điểm thư viện để học; dạng rút gọn thân mật của どうですか.
318|Nは暇だ|…thì rảnh|明日は暇だよ nói ngày mai rảnh, trả lời về thời gian chứ không phải địa điểm học.
320|～にいる／～と思う|Ở tại… / nghĩ rằng…|教室にいると思う: nghĩ rằng ai đó đang ở lớp; khác với gợi ý nơi cùng học.
321|これで／Nを終わる|Đến đây / kết thúc…|Đây là dòng kết thúc bài thi nhưng chứa 朝会 và nhãn âm nhạc chen giữa từ. Chưa nghe đối chiếu nên giữ text và đánh dấu cần kiểm tra.
`;
const grammarByIndex = new Map<number, ShadowingAnalysis['grammar']>();
for (const line of grammarNotes.trim().split('\n')) {
  const [indices, pattern, meaning, explanation] = line.split('|');
  for (const i of indices.split(',').map(Number)) grammarByIndex.set(i, [...(grammarByIndex.get(i) || []), { pattern, meaning, explanation }]);
}
// Supplement dictionary entries with words central to the actual dialogues.
const extraWords = `
頭|あたま|đầu
喉|のど|họng
痛い|いたい|đau
薬|くすり|thuốc
飲む|のむ|uống
寝る|ねる|ngủ
医者|いしゃ|bác sĩ
病気|びょうき|bệnh
昨日|きのう|hôm qua
赤く|あかく|đỏ; dạng nối của 赤い
ゆっくり|ゆっくり|chậm rãi; thong thả; nghỉ ngơi kỹ
晩御飯|ばんごはん|bữa tối
お酒|おさけ|rượu; đồ uống có cồn
構いません|かまいません|không sao; không phiền
駐車場|ちゅうしゃじょう|bãi đỗ xe
建物|たてもの|tòa nhà
近所|きんじょ|hàng xóm; khu lân cận
池|いけ|ao
止め|とめ|đỗ; dừng, trong 止める
息子|むすこ|con trai
クーラー|クーラー|máy điều hòa
鍵|かぎ|chìa khóa; khóa
窓|まど|cửa sổ
電気|でんき|điện; đèn điện
消す|けす|tắt
番号|ばんごう|số thứ tự
教室|きょうしつ|phòng học
会議|かいぎ|cuộc họp
準備|じゅんび|chuẩn bị
部長|ぶちょう|trưởng bộ phận
頼んだ|たのんだ|đã nhờ; quá khứ của 頼む
試験|しけん|kỳ thi
必ず|かならず|nhất định; bắt buộc
自分|じぶん|bản thân; tự mình
授業|じゅぎょう|buổi học; giờ học
辞書|じしょ|từ điển
ノート|ノート|vở ghi
プリント|プリント|tờ tài liệu in phát trong lớp
貼ったり|はったり|dán và những việc tương tự; từ 貼る
注意|ちゅうい|chú ý; lưu ý
デパート|デパート|trung tâm thương mại
暇|ひま|rảnh
払う|はらう|trả tiền
手伝って|てつだって|giúp đỡ; thể て của 手伝う
閉まっちゃい|しまっちゃい|đóng mất; dạng khẩu ngữ từ 閉まってしまう
残しました|のこしました|đã để lại
借りる|かりる|mượn; thuê
返されて|かえされて|được trả lại; dạng bị động của 返す
過ぎる|すぎる|vượt quá; trôi qua
引っ越し|ひっこし|việc chuyển nhà
引っ越す|ひっこす|chuyển nhà
意地悪|いじわる|xấu tính; hay làm khó
文句|もんく|lời phàn nàn
怖くて|こわくて|sợ; dạng nối của 怖い
早め|はやめ|sớm hơn một chút
京都|きょうと|Kyoto
大阪|おおさか|Osaka
決めて|きめて|quyết định; thể て của 決める
お寺|おてら|chùa
有名|ゆうめい|nổi tiếng
両方|りょうほう|cả hai
慣れた|なれた|đã quen; từ 慣れる
疲れ|つかれ|mệt; dạng từ 疲れる
忙しい|いそがしい|bận
美容院|びよういん|tiệm làm tóc
パーマ|パーマ|uốn tóc
短く|みじかく|ngắn; dạng trạng từ của 短い
シャンプー|シャンプー|dầu gội; gội đầu
順番|じゅんばん|thứ tự
人気|にんき|sự được yêu thích
散歩道|さんぽみち|đường đi dạo; tên sách trong đoạn này
桜|さくら|hoa anh đào
心|こころ|trái tim; tâm hồn
図書館|としょかん|thư viện
予約|よやく|đặt trước
受付|うけつけ|quầy tiếp nhận
ポスト|ポスト|hòm thư; hòm trả sách theo ngữ cảnh
矢印|やじるし|mũi tên
書き終わって|かきおわって|viết xong; thể て của 書き終わる
待って|まって|chờ; thể て của 待つ
荷物|にもつ|hành lý; đồ đạc
重そう|おもそう|có vẻ nặng
貸して|かして|cho mượn; thể て của 貸す
写真|しゃしん|ảnh
撮って|とって|chụp; thể て của 撮る
返事|へんじ|lời đáp
台風|たいふう|bão
なるべく|なるべく|càng…càng tốt; cố gắng trong khả năng
久しぶり|ひさしぶり|đã lâu không gặp/làm
お世話|おせわ|sự chăm sóc; sự giúp đỡ
紅茶|こうちゃ|hồng trà; trà đen
飛行機|ひこうき|máy bay
勉強|べんきょう|học
` .trim().split('\n').map(line => { const [word, reading, meaning] = line.split('|'); return { word, reading, meaning }; });
const issues: Record<number,string> = {
  1:'町会 có nghĩa hội khu phố; trong bài thi có thể là nhận dạng nhầm 聴解 (nghe hiểu). Giữ nguyên chữ, cần nghe lại.',
  2:'朝会 nghĩa buổi họp sáng; ở ngữ cảnh này có khả năng là 聴解. Không coi gợi ý sửa là bản chép đã xác minh.',
  15:'風 nghĩa gió; ngữ cảnh bác sĩ có thể là 風邪 (cảm). Chưa nghe lại âm thanh nên không sửa phụ đề.',
  40:'高一 có thể là tên gọi người con hoặc lỗi nhận dạng. Không tự gán cách đọc tên.',
  50:'Chuỗi 301からが304 không tự nhiên. Cần nghe lại khoảng số phòng.',
  54:'Câu bị cắt trước số phòng. Cần đọc cùng dòng tiếp theo, chưa tự ghép ID.',
  55:'30251 có thể là số phòng 302 bị dính với số thí sinh 51. Cần nghe lại.',
  56:'3381 có thể bị dính số phòng và số thí sinh; 言って có thể nhầm 行って. Không đoán số phòng từ đây.',
  65:'Dòng này chứa yêu cầu và câu xác nhận, có thể là hai lượt nói.',
  105:'Tiểu từ よ bị tách khỏi câu trước; không phải từ vựng độc lập trong ngữ cảnh này.',
  110:'おタ là cụm nhận dạng không rõ; cần đối chiếu âm thanh trước khi sửa.',
  171:'紙 là giấy; trong tiệm tóc có khả năng là 髪 (tóc).',
  173:'Có thể có hai lượt nói: yêu cầu uốn tóc và lời đáp của thợ.',
  176:'紙 là giấy; trong tiệm tóc có khả năng là 髪 (tóc).',
  181:'会う là gặp; câu hỏi khớp nội dung có khả năng cần 合う.',
  182:'聴く là lắng nghe; cụm hỏi người tham gia khảo sát có khả năng cần 聞く.',
  188:'会う có khả năng là nhận dạng nhầm 合う trong câu hỏi chọn thông tin phù hợp.',
  197:'空いていない có thể nhầm 開いていない (không mở cửa).',
  288:'本当 bị ngắt trước trợ từ に của dòng kế tiếp.',
  289:'Dòng bắt đầu bằng に vì 本当に bị tách giữa hai dòng.',
  321:'朝会 có thể nhầm 聴解; nhãn [音楽] chen giữa ます. Giữ nguyên để đối chiếu.'
};
const byText = new Map<string, ShadowingAnalysis>();
const sentences = source.cues.map((cue: any, i: number) => {
  let analysis = byText.get(cue.text);
  if (!analysis) {
    const base = localShadowingAnalysis(cue.text);
    const vocab = new Map(base.vocabulary.map(v => [v.word, v]));
    for (const v of extraWords) if (cue.text.includes(v.word)) vocab.set(v.word, v);
    const marker = /^(?:[0-9]+番?|番|問題[0-9]*|よ)$/.test(cue.text);
    analysis = {
      source: 'ai',
      translation: cue.translation || (/^[0-9]+$/.test(cue.text) ? cue.text : 'Cần đối chiếu ngữ cảnh.'),
      readings: (cue.readings || []).filter((r: any) => !issues[i] || !['町会','朝会','風','高一','紙','会う','聴き','空い'].some(w => r.word.includes(w))),
      vocabulary: marker ? [] : [...vocab.values()].slice(0, 40),
      kanji: marker ? [] : base.kanji,
      grammar: grammarByIndex.get(i) || [],
      note: `Phân tích học tập do ChatGPT biên soạn từ phụ đề app đã lưu; kanji và một phần từ vựng dùng từ điển của app, bản dịch kế thừa dữ liệu hiện có. Chưa đối chiếu âm thanh. ${issues[i] || (marker ? 'Đây là nhãn số câu hỏi/phương án hoặc mảnh bị ngắt; không tạo ngữ pháp giả cho nhãn.' : 'Giữ nguyên nguyên văn và ID; không suy đoán lại mốc thời gian.')}`,
    };
    byText.set(cue.text, analysis);
  }
  return { id: cue.id, text: cue.text, analysis };
});
const packet = parseShadowingAnalysisFile({ version: 1, videoId, sentences }, videoId, source.cues);
await mkdir('public/shadowing-analysis', { recursive: true });
await writeFile(`public/shadowing-analysis/${videoId}.json`, JSON.stringify(packet, null, 2));
await mkdir('.shadowing-work', { recursive: true });
await writeFile(`.shadowing-work/${videoId}-claude.txt`, claudeShadowingPrompt(videoId, source.cues));
console.log(JSON.stringify({ sentences: sentences.length, unique: byText.size, withGrammar: sentences.filter((s: any) => s.analysis.grammar.length).length, flagged: Object.keys(issues).length }));
