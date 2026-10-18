import type { ShadowingAnalysis } from '../../src/utils/shadowing';

type Rule = { re: RegExp; pattern: string; meaning: string; explanation: string; example: string };
const definitions: [RegExp, string, string, string, string][] = [
  [/[てで]はいけ(?:ない|ません)/, 'Vてはいけない', 'Không được làm…', 'Thể て + はいけない diễn tả điều bị cấm. Phải phân biệt với lời khuyên không nên làm.', 'ここで写真を撮ってはいけません。→ Không được chụp ảnh ở đây.'],
  [/(?:なければ|なくては)(?:なりません|ならない|いけません|いけない)/, 'Vなければならない', 'Phải làm…', 'Dạng phủ định bỏ い + ければならない nêu nghĩa vụ hoặc việc bắt buộc. Trong câu hỏi 何を phải xác định việc cần làm.', '薬を飲まなければなりません。→ Phải uống thuốc.'],
  [/なくても(?:いい|大丈夫|かまわ|構わ)/, 'Vなくてもいい', 'Không cần làm…', 'Dạng phủ định + なくてもいい cho phép không thực hiện hành động; khác với cấm làm.', '明日は来なくてもいいです。→ Ngày mai không cần đến.'],
  [/[てで]も(?:いい|よろしい|大丈夫|かまわ|構わ)/, 'Vてもいい', 'Được phép làm…', 'Thể て + もいい diễn tả sự cho phép. Thêm ですか để hỏi xin phép; chủ thể hành động cần xác định theo ngữ cảnh.', 'ここに座ってもいいですか。→ Tôi ngồi đây được không?'],
  [/ないで(?:ください|くれ|ほしい)/, 'Vないでください', 'Xin đừng làm…', 'Thể phủ định ない + でください yêu cầu người nghe không thực hiện hành động.', '窓を開けないでください。→ Xin đừng mở cửa sổ.'],
  [/[てで]ください/, 'Vてください', 'Hãy / vui lòng…', 'Thể て + ください là yêu cầu hoặc hướng dẫn. Dạng phủ định ないでください mang nghĩa xin đừng, cần đọc cả cụm.', 'よく聞いてください。→ Hãy nghe kỹ.'],
  [/ないように(?:して|気を|お願|しま|する)/, 'Vないようにする', 'Cố gắng tránh…', 'Vないようにする nói việc chủ động tránh một hành động. ～ようにしてください yêu cầu người nghe chú ý thực hiện điều đó.', '遅れないようにしてください。→ Hãy cố gắng đừng đến muộn.'],
  [/[てで]いただけませんか/, 'Vていただけませんか', 'Có thể làm giúp tôi… được không ạ?', 'Lời nhờ vả lịch sự, thể hiện người nói nhận sự giúp đỡ. Xác định ai là người thực hiện hành động.', '少し待っていただけませんか。→ Anh/chị chờ một chút được không ạ?'],
  [/[てで]いただ(?:き|く|いた|け)/, 'Vていただく', 'Được người khác làm giúp…', 'Cách nói khiêm nhường của Vてもらう; người nói nhận lợi ích từ hành động của người khác.', '先生に教えていただきました。→ Tôi được thầy/cô chỉ dạy.'],
  [/[てで]くださ(?:いま|る|った)/, 'Vてくださる', 'Ai đó làm cho mình…', 'Kính ngữ diễn tả người được tôn trọng thực hiện hành động có lợi cho phía người nói.', '先生が説明してくださいました。→ Thầy/cô đã giải thích cho chúng tôi.'],
  [/[てで]くれ(?:ない|ませんか|る|た|ます)/, 'Vてくれる', 'Làm giúp mình…', 'Hành động hướng lợi ích về người nói. Dạng câu hỏi Vてくれない／くれませんか thường dùng để nhờ vả.', '手伝ってくれませんか。→ Bạn giúp tôi được không?'],
  [/[てで]もら(?:う|った|い|え)/, 'Vてもらう', 'Nhờ/được ai làm giúp…', 'Người nói nhận sự giúp đỡ, người làm thường được đánh dấu bằng に. Dạng もらえる hỏi khả năng được giúp.', '友達に写真を撮ってもらいました。→ Tôi nhờ bạn chụp ảnh giúp.'],
  [/[てで]あげ(?:る|た|ます)/, 'Vてあげる', 'Làm giúp ai…', 'Người nói làm việc có lợi cho người khác. Không dùng trực tiếp tùy tiện với người trên vì có thể mang sắc thái ban ơn.', '妹に本を読んであげます。→ Tôi đọc sách cho em gái.'],
  [/[てで]差し上げ/, 'Vて差し上げる', 'Làm giúp người trên…', 'Khiêm nhường ngữ của Vてあげる, nhưng khi nói trực tiếp với người trên cần cân nhắc sắc thái ban ơn.', '荷物を持って差し上げます。→ Tôi mang đồ giúp ông/bà.'],
  [/[てで]から/, 'Vてから', 'Sau khi làm… rồi…', 'Nêu thứ tự: hoàn thành hành động trước から rồi mới làm hành động tiếp theo. Không đảo trình tự khi chọn đáp án.', 'ご飯を食べてから出かけます。→ Ăn xong rồi ra ngoài.'],
  [/(?:前|まえ)に/, 'Vる前に／Nの前に', 'Trước khi…', 'V dạng từ điển + 前に hoặc Nの前に xác định việc xảy ra trước. Với địa điểm, 前に có thể chỉ phía trước chứ không chỉ thời gian.', '寝る前に歯を磨きます。→ Đánh răng trước khi ngủ.'],
  [/(?:後|あと)で/, 'Vた後で／Nの後で', 'Sau khi…', 'V quá khứ + 後で hoặc Nの後で chỉ việc làm sau. Nếu chỉ vị trí thì 後ろ có nghĩa khác.', '授業の後で図書館に行きます。→ Sau giờ học sẽ đến thư viện.'],
  [/ながら/, 'Vます語幹＋ながら', 'Vừa…vừa…', 'Một chủ thể thực hiện hai hành động cùng lúc; hành động chính thường nằm sau ながら. Cần loại trừ từ vựng không mang nghĩa ngữ pháp này.', '音楽を聞きながら勉強します。→ Vừa nghe nhạc vừa học.'],
  [/(?:たり|だり).*(?:たり|だり)/, 'VたりVたりする', 'Làm những việc như…', 'Liệt kê một số hành động tiêu biểu, không khẳng định danh sách đầy đủ hoặc thứ tự cố định.', '本を読んだり音楽を聞いたりします。→ Làm những việc như đọc sách, nghe nhạc.'],
  [/ことが(?:でき|出来)/, 'Vることができる', 'Có thể làm…', 'Danh từ hóa hành động bằng こと rồi diễn tả khả năng. Không nhầm với Vたことがある nói kinh nghiệm.', '日本語を話すことができます。→ Có thể nói tiếng Nhật.'],
  [/[ただ]ことがあり/, 'Vたことがある', 'Đã từng làm…', 'V quá khứ + ことがある nói kinh nghiệm ít nhất một lần. Không diễn tả riêng một hành động quá khứ có mốc xác định.', '京都に行ったことがあります。→ Tôi đã từng đến Kyoto.'],
  [/ことに(?:し|する|なり|なる|なった)/, 'Vことにする／なる', 'Quyết định / được quyết định…', 'ことにする là quyết định của chủ thể; ことになる thường chỉ quyết định hoặc kết quả do hoàn cảnh/tập thể.', '来月引っ越すことにしました。→ Tôi đã quyết định tháng sau chuyển nhà.'],
  [/つもり/, 'Vる／Vないつもり', 'Dự định…', 'Diễn tả ý định tương đối rõ của chủ thể. Nのつもり cũng có thể diễn tả việc tưởng mình đang ở vai trò/tình trạng nào đó.', '夏休みに旅行するつもりです。→ Tôi định đi du lịch vào kỳ nghỉ hè.'],
  [/予定/, 'Vる予定／Nの予定', 'Có kế hoạch…', '予定 nói lịch/kế hoạch đã dự tính, thường cụ thể hơn mong muốn. Cần phân biệt với hành động đã hoàn thành.', '会議は三時に始まる予定です。→ Cuộc họp dự kiến bắt đầu lúc ba giờ.'],
  [/かもしれ(?:ない|ません)/, '～かもしれない', 'Có lẽ / có thể…', 'Nêu khả năng chưa chắc chắn, không phải kết luận. Động từ/tính từ/danh từ đứng trước tùy cấu trúc.', '雨が降るかもしれません。→ Có thể trời sẽ mưa.'],
  [/らしい/, '～らしい', 'Nghe nói / có vẻ…', 'Có thể biểu thị suy đoán dựa trên thông tin hoặc đặc trưng điển hình của N. Cần ngữ cảnh để chọn nghĩa, không coi là thông tin đã xác minh.', '明日は台風が来るらしいです。→ Nghe nói ngày mai bão sẽ đến.'],
  [/(?:と思|とおも)/, '～と思う', 'Nghĩ rằng…', 'と đánh dấu nội dung suy nghĩ; danh từ và tính từ な thường cần だ trước と. Đây là ý kiến/suy đoán, không nhất thiết là sự thật.', '明日は晴れると思います。→ Tôi nghĩ ngày mai trời sẽ nắng.'],
  [/(?:と言|とい)(?:い|う|って|った|ま)/, '～と言う', 'Nói rằng / gọi là…', 'と trích dẫn lời nói hoặc tên gọi. 何と言いますか thường hỏi cách nói phù hợp với tình huống.', '日本語で何と言いますか。→ Tiếng Nhật nói thế nào?'],
  [/(?:について|に関して)/, 'Nについて', 'Về…', 'Đánh dấu chủ đề sẽ được nói, hỏi hoặc giải thích. Không nhầm に chỉ nơi đến/người nhận.', '試験について説明します。→ Tôi sẽ giải thích về kỳ thi.'],
  [/ために|ための/, 'Vるために／Nのために', 'Để… / vì…', 'Vるために chỉ mục đích có chủ ý; Nのために có thể chỉ lợi ích/mục đích. Nのため thường cũng có thể là nguyên nhân tùy câu.', '勉強するために図書館へ行きます。→ Đến thư viện để học.'],
  [/ように/, '～ように', 'Sao cho / để có thể…', 'Thường đi với thể khả năng hoặc phủ định để nêu mục tiêu/trạng thái mong muốn. Cũng có nghĩa như/giống; cần đọc cả cụm quanh nó.', '忘れないようにメモしてください。→ Hãy ghi lại để khỏi quên.'],
  [/より/, 'AよりBの方が', 'So với A thì B hơn…', 'より đánh dấu chuẩn so sánh; の方が đánh dấu phía được chọn hơn. Tránh đảo đối tượng khi dịch.', '電車よりバスの方が安いです。→ Xe buýt rẻ hơn tàu điện.'],
  [/(?:どちら|どっち).*(?:方|ほう)/, 'どちらの方が', 'Bên nào… hơn?', 'Câu hỏi so sánh hai lựa chọn. Cần trả lời một lựa chọn cụ thể, không chỉ nêu ý kiến chung về cả nhóm.', 'お茶とコーヒーとどちらの方が好きですか。→ Thích trà hay cà phê hơn?'],
  [/[ただ]方がいい|[ただ]ほうがいい/, 'Vた方がいい', 'Nên làm…', 'V quá khứ + 方がいい là lời khuyên làm một việc. Dạng Vない方がいい khuyên không làm; không phải lệnh bắt buộc.', '早く寝た方がいいです。→ Bạn nên đi ngủ sớm.'],
  [/ない方がいい|ないほうがいい/, 'Vない方がいい', 'Không nên làm…', 'Dạng phủ định + 方がいい khuyên tránh hành động; nhẹ hơn cấm bằng てはいけない.', 'お酒を飲まない方がいいです。→ Không nên uống rượu.'],
  [/ましょう(?:か)?/, 'Vましょう／Vましょうか', 'Cùng… nhé / tôi giúp… nhé?', 'ましょう rủ hoặc đề nghị cùng làm; ましょうか có thể đề nghị giúp. Không bỏ qua か vì nó đổi sắc thái.', '荷物を持ちましょうか。→ Tôi mang đồ giúp nhé?'],
  [/(?:にしよう|にしましょう)/, 'Nにしよう', 'Chọn / quyết định là…', 'にする là chọn một phương án; thể ý chí にしよう đề nghị chọn phương án đó.', '二時にしましょう。→ Chọn hai giờ nhé.'],
  [/そうしよう/, 'そうしよう', 'Cứ quyết định như vậy', 'Thể ý chí của する kết hợp そう để đồng ý với phương án vừa nêu trong lượt nói trước.', 'そうしよう。→ Cứ làm như vậy nhé.'],
  [/(?:食べ|買い|見|会い|取り|借り|遊び|迎え|飲み)に(?:行|い|来|き)/, 'Vます語幹＋に行く／来る', 'Đi/đến để làm…', 'Thân ます + に + động từ di chuyển diễn tả mục đích. Phân biệt với Nに行く chỉ điểm đến.', '本を借りに行きます。→ Đi mượn sách.'],
  [/に行(?:く|き|った|こう|か)/, 'Nに行く', 'Đi đến…', 'に trước 行く thường đánh dấu điểm đến; nếu đứng sau thân động từ ます thì có thể là mục đích làm việc đó.', '学校に行きます。→ Tôi đi đến trường.'],
  [/(?:は|が)あります/, 'Nがある', 'Có N', 'あります diễn tả tồn tại đồ vật/sự việc. Địa điểm thường dùng に; người/động vật thường dùng います.', '明日は会議があります。→ Ngày mai có cuộc họp.'],
  [/(?:て|で)(?:い|いらっしゃ)(?:ます|る|た|ない|ません)/, 'Vている', 'Đang… / trạng thái kết quả', 'Thể て + いる có thể chỉ hành động đang diễn ra, thói quen hoặc trạng thái kết quả; phải xét loại động từ và ngữ cảnh.', '窓が開いています。→ Cửa sổ đang mở.'],
  [/(?:て|で)あり(?:ます|る|ました)/, 'Vてある', 'Đã được làm sẵn…', 'Chỉ trạng thái kết quả sau hành động có chủ ý; thường đi với ngoại động từ. Không nhầm Vている diễn tả quá trình/trạng thái.', '紙に番号が書いてあります。→ Số đã được viết sẵn trên giấy.'],
  [/(?:て|で)お(?:き|く|いて)/, 'Vておく', 'Làm sẵn / cứ để…', 'Thực hiện trước để chuẩn bị, hoặc duy trì trạng thái. Trong khẩu ngữ có thể rút gọn thành とく／どく.', '先に予約しておきます。→ Tôi sẽ đặt trước sẵn.'],
  [/(?:て|で)しま(?:う|い|った)|ちゃ(?:う|い|った)|じゃ(?:う|い|った)/, 'Vてしまう／ちゃう', 'Làm xong / lỡ… mất', 'Diễn tả hoàn tất hoặc tiếc nuối/kết quả ngoài ý muốn. ちゃう／じゃう là dạng rút gọn khẩu ngữ, không phải lúc nào cũng mang nghĩa lỡ.', '電車が行ってしまいました。→ Tàu đi mất rồi.'],
  [/(?:て|で)み(?:る|ま|た)/, 'Vてみる', 'Thử làm…', 'Thể て + みる là thử hành động để biết kết quả, khác với 見る nghĩa nhìn.', 'この服を着てみます。→ Tôi thử mặc bộ quần áo này.'],
  [/(?:く|に)な(?:る|り|った|って)/, 'Aくなる／N・Aな＋になる', 'Trở nên…', 'Tính từ い bỏ い thêm くなる; danh từ/tính từ な dùng になる. Diễn tả thay đổi tự xảy ra, khác với làm cho… bằng する.', '寒くなりました。→ Trời đã trở lạnh.'],
  [/(?:短く|安く|大きく|小さく|きれいに|綺麗に|静かに)し/, 'Aくする／Aな＋にする', 'Làm cho…', 'Diễn tả chủ thể chủ động thay đổi trạng thái, khác với なる nói trạng thái trở nên như vậy.', '髪を短くします。→ Tôi cắt/làm tóc ngắn đi.'],
  [/まま/, 'Vたまま／Nのまま', 'Vẫn giữ nguyên…', 'Giữ trạng thái mà không thay đổi; Vたまま thường nói trạng thái sau khi làm rồi để nguyên.', '電気をつけたまま出かけました。→ Ra ngoài mà vẫn để đèn bật.'],
  [/のに/, '～のに', 'Mặc dù…', 'Nối hai vế có kết quả trái kỳ vọng. Vるのに còn có thể nghĩa để làm… trong cấu trúc công dụng; cần xét cả câu.', '休みなのに働いています。→ Dù là ngày nghỉ vẫn đang làm.'],
  [/ので/, '～ので', 'Vì… nên…', 'Nêu nguyên nhân hoặc lý do, thường mang sắc thái giải thích mềm. Danh từ/tính từ な dùng なので.', '雨なので家にいます。→ Vì trời mưa nên ở nhà.'],
  [/(?:ます|です|ない|た|る|い|だ)から/, '～から', 'Vì… / sau khi…', 'Khi đứng sau mệnh đề, から thường nêu lý do; Nから chỉ điểm bắt đầu, Vてから nói thứ tự. Cần phân biệt vị trí.', '忙しいから行けません。→ Vì bận nên không đi được.'],
  [/(?:けど|けれど|ですが|ますが)/, '～けど／が', '…nhưng / mở lời', 'Có thể nối hai ý tương phản hoặc mở lời/đặt nền trước một yêu cầu. Không phải mọi が đều nghĩa nhưng vì が cũng là trợ từ chủ ngữ.', '質問があるんですが。→ Tôi có câu hỏi muốn hỏi…'],
  [/んです|のです|んだ(?:けど|よ|ね|[。！？!?]|$)/, '～んです／のです', 'Giải thích / nhấn mạnh hoàn cảnh', 'Thêm sắc thái giải thích lý do, tình trạng hoặc mở lời. Không cần dịch máy móc thành bởi vì trong mọi trường hợp.', '頭が痛いんです。→ Tôi đang đau đầu.'],
  [/でしょうか/, '～でしょうか', 'Liệu… / …phải không ạ?', 'Cách hỏi mềm và lịch sự hơn ですか trong nhiều tình huống; có thể hỏi ý kiến hoặc xác nhận.', 'どちらでしょうか。→ Xin hỏi là phía nào ạ?'],
  [/だろう|でしょう/, '～でしょう', 'Có lẽ / …nhỉ?', 'Thường diễn tả suy đoán hoặc tìm sự xác nhận. Cần ngữ điệu và ngữ cảnh để chọn cách dịch.', '明日は晴れるでしょう。→ Có lẽ ngày mai trời sẽ nắng.'],
  [/たい(?:です|ん|と|けど|の|[。！？!?]|$)/, 'Vます語幹＋たい', 'Muốn làm…', 'Thân động từ bỏ ます thêm たい nói mong muốn của người nói hoặc hỏi mong muốn người nghe; không tự áp vào mong muốn người thứ ba nếu thiếu căn cứ.', '写真を撮りたいです。→ Tôi muốn chụp ảnh.'],
  [/(?:たら|なら)(?:いい|良い)/, 'Vたらいい／～ならいい', 'Nên… / nếu… thì được', 'Vたらいい thường hỏi/đề xuất cách giải quyết; ならいい có thể chấp thuận điều kiện. Phải đọc đúng dạng đứng trước.', 'どこに止めたらいいですか。→ Nên đỗ ở đâu?'],
  [/(?:たら|だったら)/, '～たら', 'Nếu / sau khi…', 'Dạng quá khứ + ら diễn tả điều kiện hoặc mốc sau khi hoàn thành. Phần sau có thể là ý chí/lời yêu cầu.', '終わったら電話してください。→ Xong thì hãy gọi điện.'],
  [/なら/, '～なら', 'Nếu là… / nếu nói về…', 'Đặt điều kiện dựa trên thông tin vừa nêu hoặc giới hạn chủ đề. Không nên nhận diện bên trong từ ghép không phải cấu trúc ngữ pháp.', '月曜日なら空いています。→ Nếu thứ Hai thì tôi rảnh.'],
  [/すれば|行けば|あれば|なければ|よければ|良ければ/, '～ば', 'Nếu… thì…', 'Thể điều kiện ば diễn tả điều kiện dẫn đến kết quả; 何をすればいい hỏi nên làm gì. なければ phải đọc cả cụm để xác định nghĩa vụ/phủ định.', '時間があれば行きます。→ Nếu có thời gian thì sẽ đi.'],
  [/場合/, '～場合（は）', 'Trong trường hợp…', 'Nêu tình huống giả định hoặc quy định; động từ bổ nghĩa trực tiếp 場合, danh từ dùng の場合.', '遅れる場合は連絡してください。→ Nếu đến muộn hãy báo.'],
  [/時(?:は|に|、|何)|とき(?:は|に|、)/, 'Vる／Vた時', 'Khi…', 'Vる時 thường trước/trong lúc thực hiện, Vた時 thường sau khi hoàn thành. Nの時 cũng chỉ thời điểm/sự kiện.', '出かける時は鍵を閉めてください。→ Khi ra ngoài hãy khóa cửa.'],
  [/間に|あいだに/, '～間に', 'Trong khoảng thời gian…', 'Một sự việc xảy ra/hoàn tất trong khoảng thời gian nêu trước 間に. Phân biệt 間 diễn tả sự kéo dài suốt khoảng đó.', '休みの間に本を読みました。→ Tôi đã đọc sách trong kỳ nghỉ.'],
  [/までに/, '～までに', 'Chậm nhất là…', 'Đánh dấu hạn chót phải hoàn thành; khác với まで chỉ sự kéo dài đến một mốc.', '五時までに返してください。→ Hãy trả trước/chậm nhất lúc năm giờ.'],
  [/から.*まで/, 'AからBまで', 'Từ A đến B', 'から chỉ điểm đầu, まで điểm cuối trong thời gian, vị trí hoặc phạm vi số thứ tự.', '一時から三時までです。→ Từ một giờ đến ba giờ.'],
  [/(?:の中から|の中で)/, 'Nの中から／Nの中で', 'Từ/trong số…', 'の中から nhấn mạnh lấy/chọn từ một nhóm; の中で nêu phạm vi so sánh/lựa chọn.', '四つの中から一つ選んでください。→ Chọn một trong bốn cái.'],
  [/だけ/, '～だけ', 'Chỉ…', 'Giới hạn số lượng, thời gian hoặc phạm vi. だけで có thể nghĩa chỉ cần…; phải đọc phần theo sau.', '一時間だけ手伝います。→ Tôi chỉ giúp một giờ.'],
  [/しか.*(?:ない|ません)/, '～しか～ない', 'Chỉ có…', 'しか đi với phủ định để nhấn mạnh ít/hạn chế. Không dịch phủ định thành không có nếu đã có しか.', '百円しかありません。→ Chỉ có một trăm yên.'],
  [/あまり.*(?:ない|ません)/, 'あまり～ない', 'Không… lắm', 'あまり thường kết hợp phủ định để giảm mức độ, khác với 全然 là hoàn toàn không.', 'あまりよくありません。→ Không tốt lắm.'],
  [/全然.*(?:ない|ません)/, '全然～ない', 'Hoàn toàn không…', 'Trong cấu trúc chuẩn thường kết hợp phủ định để nhấn mạnh không có/không xảy ra.', '時間が全然ありません。→ Hoàn toàn không có thời gian.'],
  [/まだ.*(?:ない|ません)/, 'まだ～ない', 'Vẫn chưa…', 'Hành động được kỳ vọng nhưng chưa hoàn tất. Với Vていない nói trạng thái đến hiện tại vẫn chưa làm.', 'まだ決めていません。→ Tôi vẫn chưa quyết định.'],
  [/もう(?:すぐ|[0-9０-９一二三四五六七八九十]+年)/, 'もうすぐ／もう＋期間', 'Sắp / đã… rồi', 'もうすぐ là sắp; もう + khoảng thời gian có thể là đã được… rồi. Hai cách dùng cần phân biệt theo từ sau もう.', 'もうすぐ出かけます。→ Sắp ra ngoài.'],
  [/(?:くらい|ぐらい)/, '～くらい／ぐらい', 'Khoảng…', 'Thường nói lượng/thời gian ước chừng; cũng có thể chỉ mức độ hoặc ví dụ tối thiểu tùy câu.', '三十分くらいかかります。→ Mất khoảng ba mươi phút.'],
  [/(?:頃|ごろ)/, '～頃', 'Khoảng lúc…', 'Dùng với mốc thời gian gần đúng như 何時頃; khác với くらい thường diễn tả độ dài hoặc lượng.', '何時頃出かけますか。→ Khoảng mấy giờ bạn ra ngoài?'],
  [/どのくらい|どれくらい/, 'どのくらい／どれくらい', 'Bao lâu / bao nhiêu', 'Hỏi độ dài thời gian, mức độ hoặc lượng. Muốn biết nghĩa cụ thể phải xem đơn vị và tình huống.', '日本に来てどれくらいですか。→ Đến Nhật được bao lâu rồi?'],
  [/どこか|何か|だれか|誰か/, 'Từ nghi vấn＋か', 'Đâu đó / gì đó / ai đó', 'か sau từ nghi vấn biến thành đối tượng chưa xác định. Không đồng nghĩa với câu hỏi trực tiếp ở đâu/cái gì/ai.', '何かありますか。→ Có gì không?'],
  [/どうやって/, 'どうやって', 'Bằng cách nào?', 'Hỏi cách thức/phương pháp thực hiện, khác với どうして hỏi nguyên nhân.', 'どうやって返しますか。→ Trả bằng cách nào?'],
  [/どうして/, 'どうして', 'Tại sao?', 'Hỏi lý do/nguyên nhân. Câu trả lời cần nguyên nhân trong lời thoại, không chỉ thông tin đúng nhưng không liên quan.', 'どうして引っ越しますか。→ Tại sao chuyển nhà?'],
  [/いらっしゃ/, 'いらっしゃる', 'Kính ngữ của いる／行く／来る', 'Dùng tôn kính người được nói tới; phải dựa vào に／へ và ngữ cảnh để biết nghĩa ở, đi hay đến.', '先生はいらっしゃいますか。→ Thầy/cô có ở đây không ạ?'],
  [/ございます/, 'ございます', 'Có / là… (trang trọng)', 'ございます là cách nói trang trọng của あります; でございます là cách nói trang trọng của です.', '受付は一階にございます。→ Quầy tiếp nhận ở tầng một.'],
  [/いたしま|いたし/, 'いたす', 'Làm… (khiêm nhường)', 'いたす là khiêm nhường ngữ của する; お＋thân động từ＋いたす dùng để hạ mình và tôn trọng người nhận hành động.', '私がお持ちいたします。→ Tôi xin mang giúp.'],
  [/お(?:持ち|借り|読み|使い|帰り)にな/, 'お＋Vます語幹＋になる', 'Kính ngữ của hành động', 'Tôn kính hành động của người khác; không dùng cho hành động của chính mình với ý hạ mình.', '先生はお帰りになりました。→ Thầy/cô đã về.'],
  [/失礼します|失礼しま/, '失礼します', 'Xin phép / xin thất lễ', 'Dùng khi vào/rời phòng hoặc ngắt lời; お先に失礼します là xin phép về trước.', 'お先に失礼します。→ Tôi xin phép về trước.'],
  [/お世話にな/, 'お世話になる', 'Được chăm sóc/giúp đỡ', 'Lời cảm ơn ghi nhận sự giúp đỡ. Dạng quá khứ thường dùng khi chia tay/kết thúc một giai đoạn; không tự coi là lời chào lâu ngày gặp lại.', 'お世話になりました。→ Cảm ơn vì thời gian qua đã giúp đỡ.'],
  [/おかげ(?:様|さま)で/, 'おかげさまで', 'Nhờ ơn / may nhờ…', 'Lời đáp lịch sự về tình hình tốt nhờ sự giúp đỡ; ý nghĩa thường gắn với lời hỏi thăm trước đó.', 'おかげさまで元気です。→ Nhờ ơn anh/chị, tôi vẫn khỏe.'],
  [/久しぶり/, '久しぶり', 'Lâu rồi mới…', 'Dùng khi lâu ngày gặp lại hoặc làm lại một việc; ですね bộc lộ sự chia sẻ/cảm thán.', '久しぶりですね。→ Lâu rồi mới gặp nhỉ.'],
  [/かしこまりました|承知しました/, 'かしこまりました／承知しました', 'Tôi đã rõ / xin tuân theo', 'Lời đáp trang trọng để nhận yêu cầu hoặc xác nhận đã hiểu; không trực tiếp trả lời mọi loại câu hỏi.', 'かしこまりました。→ Vâng, tôi đã rõ.'],
];
export const GRAMMAR_RULES: Rule[] = definitions.map(([re,pattern,meaning,explanation,example])=>({re,pattern,meaning,explanation,example}));
export function staticGrammar(text: string, tokens?: {surface_form:string;basic_form:string;pos?:string}[]): ShadowingAnalysis['grammar'] {
  const result: ShadowingAnalysis['grammar'] = [];
  for(const rule of GRAMMAR_RULES) {
    const match = text.match(rule.re);
    if(!match) continue;
    if(tokens) {
      const grammatical = (form:string) => tokens.some(t => (t.surface_form===form || t.basic_form===form) && ['助詞','助動詞'].includes(t.pos || ''));
      if(rule.pattern==='～なら' && !grammatical('なら')) continue;
      if(rule.pattern==='Vます語幹＋たい' && !grammatical('たい')) continue;
      if(rule.pattern==='～らしい' && !grammatical('らしい')) continue;
      if(rule.pattern==='Vます語幹＋ながら' && !grammatical('ながら')) continue;
      if(rule.pattern==='～ので' && !grammatical('ので')) continue;
      if(rule.pattern==='Vる／Vた時' && /(?:何|[0-9０-９一二三四五六七八九十])時/.test(text)) continue;
    }
    // More precise constructions subsume the generic one, avoiding duplicate cards.
    if(rule.pattern==='～ように' && /ないように/.test(text)) continue;
    if(rule.pattern==='～でしょう' && /でしょうか/.test(text)) continue;
    if(rule.pattern==='Vている' && /ていらっしゃ/.test(text)) continue;
    result.push({pattern:rule.pattern, meaning:rule.meaning, explanation:`Dấu hiệu trong dòng: 「${match[0]}」. ${rule.explanation}`, example:rule.example});
  }
  return result;
}
