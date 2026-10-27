import type { GrammarItem } from '../types';

/**
 * Ngữ pháp JLPT N4 (25 bài, đánh số 26–50 theo lộ trình của app).
 * Danh sách mẫu đối chiếu với các bảng ngữ pháp N4 công khai (jlptsensei, jepang.org, gyanmirai);
 * phần giải thích và câu ví dụ do app tự viết. Ví dụ ghi "a|b|c": các cụm để xếp câu, nối lại thành câu đúng.
 */
type Row = [lesson: number, structure: string, meaning: string, explanation: string, example: string, translation: string];

const ROWS: Row[] = [
  // 26 — Giải thích & mở lời (んです)
  [26, '[Thể thường] + んです (Na/N: な + んです)', 'Giải thích, hỏi lý do (…đấy ạ)', 'Dùng để đưa ra hoặc hỏi lý do, hoàn cảnh phía sau một sự việc; mang sắc thái quan tâm, giải thích. Danh từ và tính từ な thêm な trước んです.', '昨日は|熱が|あったんです。', 'Hôm qua tôi bị sốt đấy.'],
  [26, '〜んですが、〜', 'Mở lời trước khi nhờ vả / hỏi', 'Nêu hoàn cảnh bằng んですが rồi mới đưa ra lời nhờ, câu hỏi; nghe mềm và lịch sự hơn nói thẳng.', '日本語が|わからないんですが、|教えて|くれませんか。', 'Tôi không hiểu tiếng Nhật, bạn chỉ giúp tôi được không?'],
  [26, '〜んじゃないですか', 'Chẳng phải… sao / tôi nghĩ là…', 'Nêu phán đoán của người nói và mong người nghe đồng tình; dạng thân mật là んじゃない.', '今日は|雨が|降るんじゃ|ないですか。', 'Hôm nay hình như trời sẽ mưa đấy nhỉ.'],

  // 27 — Khả năng
  [27, 'Thể khả năng (可能形): Nhóm 1 う→え段+る / Nhóm 2 る→られる / する→できる, 来る→来られる', 'Có thể làm V', 'Diễn tả năng lực hoặc điều kiện cho phép làm một việc. Tân ngữ thường đi với が thay cho を.', '私は|日本語が|話せます。', 'Tôi có thể nói tiếng Nhật.'],
  [27, 'V-dict + ことができる', 'Có thể làm V', 'Cách nói khả năng trang trọng hơn thể khả năng; dùng được với mọi động từ.', '私は|ピアノを|弾くことが|できます。', 'Tôi có thể chơi piano.'],
  [27, '見える / 聞こえる', 'Nhìn thấy / nghe thấy (tự nhiên)', 'Khi vật hiện ra trong tầm mắt hoặc âm thanh tự lọt vào tai mà không chủ ý. Chủ thể được nhìn/nghe đi với が.', 'ここから|富士山が|見えます。', 'Từ đây có thể nhìn thấy núi Phú Sĩ.'],

  // 28 — Đồng thời & liệt kê lý do
  [28, 'V-ます(bỏ ます) + ながら + V2', 'Vừa làm V1 vừa làm V2', 'Hai hành động song song của cùng một chủ thể; hành động ở vế sau là hành động chính.', '音楽を|聞きながら|勉強します。', 'Tôi vừa nghe nhạc vừa học bài.'],
  [28, '〜し、〜し', 'Vừa… vừa… (liệt kê lý do)', 'Nêu hai hay nhiều lý do, đặc điểm cùng chiều để đi đến một nhận xét.', 'この|店は|安いし、|おいしいです。', 'Quán này vừa rẻ lại vừa ngon.'],
  [28, 'V-ます(bỏ ます) + 始める / 続ける / 終わる / 出す', 'Bắt đầu / tiếp tục / xong / bỗng dưng bắt đầu V', 'Gắn sau thân động từ để chỉ giai đoạn của hành động. 〜出す là bắt đầu đột ngột.', '先月から|日本語を|勉強し始めました。', 'Từ tháng trước tôi bắt đầu học tiếng Nhật.'],

  // 29 — Trạng thái & hoàn thành
  [29, 'Tự động từ + ている', 'Đang ở trạng thái (cửa mở, đèn sáng…)', 'Tự động từ + ている mô tả trạng thái hiện có của sự vật sau khi thay đổi; chủ thể đi với が.', 'ドアが|開いています。', 'Cửa đang mở.'],
  [29, 'V-て + しまう', 'Lỡ làm V / làm xong hết V', 'Diễn tả hành động hoàn tất hoàn toàn, hoặc tiếc nuối vì việc ngoài ý muốn. Văn nói hay rút thành ちゃう/じゃう.', '財布を|なくして|しまいました。', 'Tôi lỡ làm mất ví rồi.'],
  [29, 'V-て + いく / くる', 'Dần dần (đi/đến) / làm rồi quay lại', 'いく chỉ thay đổi hướng về tương lai, xa dần người nói; くる chỉ thay đổi tiến tới hiện tại hoặc việc đi rồi về.', '日本語が|だんだん|上手に|なって|きました。', 'Tiếng Nhật của tôi đã dần dần giỏi lên.'],

  // 30 — Chuẩn bị & kết quả
  [30, 'Tha động từ + が + V-てある', 'Đã được làm sẵn (kết quả còn lại)', 'Có người đã làm một việc với chủ ý và kết quả còn đó. Vật được tác động đi với が.', '机の上に|メモが|書いてあります。', 'Trên bàn có ghi sẵn tờ giấy nhớ.'],
  [30, 'V-て + おく', 'Làm sẵn / làm trước', 'Chuẩn bị trước cho một mục đích về sau, hoặc để nguyên trạng thái đó.', '旅行の|前に|ホテルを|予約して|おきます。', 'Trước chuyến du lịch tôi sẽ đặt sẵn khách sạn.'],
  [30, 'V-た / V-ない / N-の + まま', 'Cứ để nguyên như vậy mà…', 'Giữ nguyên một trạng thái trong khi một việc khác xảy ra, thường mang ý không nên.', '窓を|開けた|まま|寝て|しまいました。', 'Tôi cứ để nguyên cửa sổ mở rồi ngủ mất.'],

  // 31 — Ý định, kế hoạch
  [31, 'Thể ý chí (意向形): Nhóm 1 う→お段+う / Nhóm 2 る→よう / する→しよう, 来る→来よう', 'Chúng ta hãy… / để tôi…', 'Rủ rê, đề nghị hoặc tự quyết định hành động (thân mật). Dạng lịch sự là 〜ましょう.', '一緒に|昼ご飯を|食べよう。', 'Cùng ăn trưa nhé.'],
  [31, 'V-意向形 + と思っている', 'Đang định làm V', 'Ý định đã hình thành trong đầu người nói và còn kéo dài. Chỉ dùng cho ý định của bản thân (ngôi thứ nhất).', '来年|日本へ|留学しようと|思っています。', 'Tôi đang định sang Nhật du học vào năm sau.'],
  [31, 'V-dict / V-ない + つもりだ', 'Dự định (không) làm V', 'Nêu dự định đã được quyết định. Phủ định つもりはない còn mang nghĩa hoàn toàn không có ý định.', '夏休みは|国へ|帰る|つもりです。', 'Kỳ nghỉ hè tôi dự định về nước.'],
  [31, 'V-dict / N-の + 予定だ', 'Dự kiến sẽ… (theo lịch)', 'Kế hoạch đã sắp xếp theo lịch trình, ít tính ý chí cá nhân hơn つもり.', '来月|東京へ|出張する|予定です。', 'Tháng sau tôi dự kiến đi công tác Tokyo.'],
  [31, 'V-dict / V-ない + ことにする', 'Quyết định (không) làm V', 'Tự mình chọn và quyết định một việc. Dạng 〜ことにした là đã quyết định rồi.', '毎朝|ジョギングを|することに|しました。', 'Tôi đã quyết định mỗi sáng sẽ chạy bộ.'],
  [31, 'V-dict / V-ない + ことになる', 'Được quyết định là… (không do mình)', 'Kết luận do hoàn cảnh, tổ chức hay người khác quyết định; thường dùng khi thông báo.', '来月から|大阪で|働く|ことに|なりました。', 'Từ tháng sau tôi sẽ làm việc ở Osaka (đã được quyết định).'],
  [31, 'N + でも', '…chẳng hạn / hay gì đó', 'Đưa ra một ví dụ nhẹ nhàng khi rủ rê hay gợi ý, không nhất thiết phải đúng như vậy.', 'お茶でも|飲みませんか。', 'Mình uống trà hay gì đó nhé?'],
  [31, 'V-dict / V-ない + ことがある', 'Có lúc / thỉnh thoảng (không)…', 'Nói về việc thỉnh thoảng xảy ra. Khác với V-た + ことがある (đã từng có kinh nghiệm).', '私は|ときどき|朝ご飯を|食べない|ことが|あります。', 'Thỉnh thoảng tôi không ăn sáng.'],

  // 32 — Khuyên bảo & dự đoán
  [32, 'V-た / V-ない + ほうがいい', 'Nên / không nên làm V', 'Lời khuyên khá trực tiếp. Khuyên làm thì chia V-た, khuyên không làm thì chia V-ない.', '風邪を|ひいた|ときは、|早く|寝た|ほうが|いいです。', 'Khi bị cảm thì nên đi ngủ sớm.'],
  [32, 'V-た + らどうですか', 'Bạn thử… thì sao?', 'Đề nghị hay gợi ý nhẹ nhàng cho đối phương.', '疲れているなら、|少し|休んだら|どうですか。', 'Nếu mệt thì bạn thử nghỉ một chút xem sao?'],
  [32, '[Thể thường] + かもしれない', 'Có lẽ / biết đâu', 'Phỏng đoán không chắc chắn, khả năng khoảng 50% hoặc thấp hơn. Na/N bỏ だ.', '彼は|もう|帰ったかも|しれません。', 'Có thể anh ấy đã về rồi.'],
  [32, '[Thể thường] + はずだ', 'Chắc chắn là / lẽ ra là', 'Suy đoán dựa trên căn cứ hợp lý. Phủ định 〜はずがない là “không thể nào”.', '彼は|今日|来るはずです。', 'Chắc chắn là hôm nay anh ấy sẽ đến.'],
  [32, '[Thể thường] + はずがない', 'Không thể nào…', 'Phủ nhận mạnh mẽ dựa trên căn cứ: “không đời nào”.', 'こんなに|高い|時計を|買えるはずが|ありません。', 'Không thể nào mua nổi chiếc đồng hồ đắt thế này.'],
  [32, '[Thể thường] + かな / かしら', 'Không biết có… không nhỉ', 'Tự hỏi mình hoặc hỏi nhẹ người thân thiết. かしら thường dùng bởi nữ giới.', '明日は|晴れるかな。', 'Không biết ngày mai trời có nắng không nhỉ.'],

  // 33 — Mệnh lệnh, cấm chỉ, trích dẫn
  [33, 'Thể mệnh lệnh (命令形): Nhóm 1 う→え段 / Nhóm 2 る→ろ / する→しろ, 来る→来い', 'Hãy làm V! (ra lệnh)', 'Mệnh lệnh mạnh, thô; dùng giữa nam giới thân thiết, trong biển báo, thể thao, cổ vũ.', '早く|しろ!', 'Nhanh lên!'],
  [33, 'V-dict + な', 'Cấm / đừng làm V', 'Cấm chỉ mạnh, thô như thể mệnh lệnh; thấy nhiều trên biển báo.', 'ここで|たばこを|吸うな。', 'Cấm hút thuốc ở đây.'],
  [33, 'V-ます(bỏ ます) + なさい', 'Hãy làm V (ra lệnh nhẹ)', 'Mệnh lệnh của người trên với người dưới như cha mẹ, thầy cô với con trẻ.', '早く|宿題を|しなさい。', 'Mau làm bài tập đi con.'],
  [33, '[Thể thường] + と言う', 'Nói rằng…', 'Trích dẫn trực tiếp hay gián tiếp. Nội dung gián tiếp đứng ở thể thường trước と.', '先生は|明日|テストが|あると|言いました。', 'Thầy nói ngày mai có bài kiểm tra.'],
  [33, 'N + という + N', 'Cái gọi là…', 'Giới thiệu tên của người, vật, địa điểm mà người nghe có thể chưa biết.', 'これは|「だんご」と|いう|お菓子です。', 'Đây là loại bánh gọi là “dango”.'],

  // 34 — Theo như & sau khi
  [34, 'V-た / V-る / N-の + とおりに', 'Theo đúng như…', 'Làm giống hệt như điều đã nói, đã thấy, đã chỉ dẫn. N đi với の (hoặc どおり).', '先生が|言った|とおりに|書いてください。', 'Hãy viết đúng như thầy đã nói.'],
  [34, 'V-た / N-の + あとで', 'Sau khi làm V', 'Việc sau xảy ra sau việc trước; không nhất thiết liền kề.', '食事の|あとで、|薬を|飲んでください。', 'Sau bữa ăn, hãy uống thuốc.'],
  [34, 'V-ている / N-の + あいだ / あいだに', 'Trong suốt lúc… / trong lúc…', 'あいだ: hành động kéo dài suốt khoảng thời gian đó. あいだに: một việc xảy ra tại một thời điểm nào đó trong khoảng ấy.', '私が|寝ている|間に、|雨が|降りました。', 'Trong lúc tôi ngủ, trời đã mưa.'],
  [34, 'V-ない / A-い / A-な / N-の + うちに', 'Nhân lúc còn… / trước khi…', 'Phải tranh thủ làm trước khi trạng thái hiện tại thay đổi.', '暑くならない|うちに|出かけましょう。', 'Mình đi chơi nhân lúc trời chưa nóng nhé.'],

  // 35 — Điều kiện
  [35, 'V-ば (điều kiện): Nhóm 1 う→え段+ば / Nhóm 2 る→れば / A-い→ければ', 'Nếu… thì…', 'Điều kiện giả định; vế sau thường là kết quả hoặc đánh giá. Vế sau không dùng ý chí, mệnh lệnh khi vế trước là trạng thái.', '安ければ、|買います。', 'Nếu rẻ thì tôi sẽ mua.'],
  [35, 'V-た / A-かった / N-だった + ら', 'Nếu… / khi… (sau khi)', 'Điều kiện thông dụng và linh hoạt nhất. Cũng dùng khi nói “sau khi làm xong thì…”.', '雨が|降ったら、|行きません。', 'Nếu trời mưa thì tôi sẽ không đi.'],
  [35, 'V-dict / V-ない + と', 'Hễ… thì… (kết quả tự nhiên)', 'Kết quả tất yếu, quy luật tự nhiên hoặc thói quen. Vế sau không dùng ý chí, nhờ vả.', '春に|なると、|桜が|咲きます。', 'Hễ đến mùa xuân là hoa anh đào nở.'],
  [35, 'N / V-dict / A + なら', 'Nếu là… thì… / nếu vậy thì…', 'Tiếp lời người đối diện hoặc đề tài vừa nêu, rồi đưa ra lời khuyên, gợi ý.', '日本へ|行くなら、|京都が|いいですよ。', 'Nếu đi Nhật thì Kyoto tuyệt lắm đấy.'],
  [35, 'V-ば + よかった', 'Giá mà đã… (tiếc nuối)', 'Hối tiếc về điều đã không làm. Phủ định: 〜なければよかった.', 'もっと|勉強すれば|よかった。', 'Giá mà tôi đã học nhiều hơn.'],

  // 36 — Mục đích & biến đổi
  [36, 'V-dict / V-ない + ように', 'Để (không) có thể…', 'Mục đích hướng tới trạng thái; vế sau là hành động có chủ ý nhằm đạt trạng thái đó.', '忘れない|ように、|メモします。', 'Tôi ghi chú lại để không quên.'],
  [36, 'V-dict / V-ない + ようになる', 'Trở nên (có thể) / đã bắt đầu…', 'Diễn tả sự thay đổi dần từ không thể sang có thể, hoặc thói quen mới.', '日本語が|話せる|ように|なりました。', 'Tôi đã nói được tiếng Nhật rồi.'],
  [36, 'V-dict / V-ない + ようにする', 'Cố gắng (không) làm V', 'Nỗ lực duy trì thói quen hay chú ý để làm hoặc tránh làm việc gì.', '毎日|野菜を|食べる|ように|しています。', 'Tôi cố gắng ăn rau mỗi ngày.'],
  [36, 'A-い→く / A-な, N→に + なる / する', 'Trở nên… / làm cho…', 'なる: tự thay đổi. する: chủ động làm thay đổi. Tính từ い bỏ い thêm く, tính từ な và danh từ thêm に.', '部屋を|明るく|します。', 'Tôi làm cho căn phòng sáng lên.'],
  [36, 'V-ば / V-る + といいです', 'Mong là… / sẽ tốt nếu…', 'Bày tỏ hy vọng hoặc khuyên nhẹ nhàng.', '明日|天気が|いいと|いいですね。', 'Mong là ngày mai trời đẹp nhỉ.'],

  // 37 — Bị động
  [37, 'Thể bị động (受身形): Nhóm 1 う→あ段+れる / Nhóm 2 る→られる / する→される, 来る→来られる', 'Bị / được (ai đó làm gì)', 'Người chịu tác động làm chủ ngữ; người gây ra tác động đi với に.', '先生に|ほめられました。', 'Tôi được thầy khen.'],
  [37, 'N + が + V-受身形 (vật làm chủ ngữ)', 'Cái gì đó được làm…', 'Khi không cần hoặc không biết ai làm, nêu sự vật làm chủ ngữ; thường dùng trong văn viết, thông báo.', 'この|本は|多くの|人に|読まれています。', 'Cuốn sách này được nhiều người đọc.'],
  [37, 'Bị động chịu phiền (迷惑の受身)', 'Bị… (và thấy phiền)', 'Người nói chịu ảnh hưởng xấu từ hành động hay sự việc của người khác; có cả với tự động từ.', '雨に|降られて、|服が|ぬれました。', 'Bị trời mưa nên quần áo của tôi ướt hết.'],

  // 38 — Danh từ hóa
  [38, 'V-dict + の / こと', 'Việc làm V (danh từ hóa)', 'の/こと biến động từ thành danh từ. 好き・上手・見る・聞く thường dùng の; 趣味・できる dùng こと.', '私は|歌を|歌うのが|好きです。', 'Tôi thích hát.'],
  [38, 'V-dict + のは + Adj + です', 'Việc… thì…', 'Dùng mệnh đề danh từ hóa làm chủ ngữ để nhận xét: quan trọng, khó, vui…', '毎日|運動するのは|大切です。', 'Vận động mỗi ngày là việc quan trọng.'],
  [38, 'N + しか + V-ない', 'Chỉ có… (ít hơn mong đợi)', 'Đi với phủ định; nhấn mạnh số lượng ít, thiếu so với kỳ vọng.', '財布に|百円しか|ありません。', 'Trong ví tôi chỉ có 100 yên.'],
  [38, 'N + も (số lượng)', 'Tới tận… / những…', 'Gắn sau số lượng để nhấn mạnh nhiều hơn dự đoán.', '昨日は|三時間も|勉強しました。', 'Hôm qua tôi đã học tới ba tiếng.'],

  // 39 — Nguyên nhân & lý do
  [39, '[Thể thường] + ので (Na/N: な + ので)', 'Vì… nên…', 'Nêu lý do khách quan, nhẹ nhàng, lịch sự hơn から.', '熱が|あるので、|休みます。', 'Vì bị sốt nên tôi nghỉ.'],
  [39, 'V-て / V-なくて (nguyên nhân cảm xúc)', 'Vì… nên (vui, buồn, ngạc nhiên…)', 'V-て hay V-なくて chỉ nguyên nhân dẫn tới cảm xúc hoặc trạng thái; vế sau không dùng ý chí.', '試験に|合格して|うれしいです。', 'Tôi vui vì đã đỗ kỳ thi.'],
  [39, 'N-の / V-dict + ため(に)', 'Vì… (nguyên nhân)', 'Nguyên nhân khách quan, thường là sự cố, thiên tai, dùng trong văn viết và thông báo.', '雨の|ために、|試合が|中止に|なりました。', 'Vì mưa nên trận đấu bị hủy.'],
  [39, 'V-た / N-の + せいで / おかげで', 'Tại… / nhờ…', 'せいで: nguyên nhân dẫn tới kết quả xấu. おかげで: kết quả tốt, mang lòng biết ơn.', '風邪の|せいで、|会社を|休みました。', 'Vì bị cảm nên tôi nghỉ làm.'],

  // 40 — Câu hỏi lồng & thử
  [40, '[Thể thường] + かどうか', 'Có… hay không', 'Nhúng một câu hỏi Có/Không vào câu lớn hơn.', '彼が|来るか|どうか|わかりません。', 'Tôi không biết anh ấy có đến hay không.'],
  [40, 'Từ nghi vấn + [Thể thường] + か', 'Cái gì / ở đâu / khi nào… (câu hỏi lồng)', 'Nhúng câu hỏi có từ để hỏi vào câu chính, vế sau như 教えて、わかる、知っている.', '駅は|どこに|あるか|教えてください。', 'Hãy cho tôi biết ga ở đâu.'],
  [40, 'V-て + みる', 'Thử làm V', 'Thử làm để xem kết quả hay trải nghiệm.', '一度|着物を|着て|みたいです。', 'Tôi muốn thử mặc kimono một lần.'],
  [40, 'N + について', 'Về… (đề tài)', 'Nêu chủ đề của sự bàn luận hay điều tra, đi với các động từ như 話す、調べる、考える.', '日本の|文化に|ついて|調べています。', 'Tôi đang tìm hiểu về văn hóa Nhật Bản.'],

  // 41 — Cho nhận
  [41, 'V-て + あげる', 'Làm gì đó cho ai', 'Mình làm việc có lợi cho người khác. Với người trên nên dùng cách khác để tránh thất lễ.', '友達に|引っ越しを|手伝って|あげました。', 'Tôi đã giúp bạn chuyển nhà.'],
  [41, 'V-て + くれる', 'Ai đó làm gì cho mình', 'Người khác làm việc có lợi cho mình hoặc người trong nhóm mình, kèm lòng biết ơn.', '田中さんが|私に|地図を|書いて|くれました。', 'Anh Tanaka đã vẽ bản đồ cho tôi.'],
  [41, 'V-て + もらう', 'Được ai đó làm cho', 'Nhờ hoặc được người khác làm giúp; chủ ngữ là người nhận lợi.', '私は|先生に|作文を|直して|もらいました。', 'Tôi đã được thầy sửa bài văn cho.'],
  [41, 'V-て + くださる / いただく', 'Được (bề trên) làm giúp (kính ngữ)', 'Dạng kính trọng của くれる và もらう khi người làm là bề trên.', '先生に|本を|貸して|いただきました。', 'Tôi đã được thầy cho mượn sách.'],
  [41, 'V-て + くれて ありがとう / V-て + すみません', 'Cảm ơn / xin lỗi vì đã…', 'Nói lý do cảm ơn hay xin lỗi bằng V-て.', '手伝って|くれて|ありがとう。', 'Cảm ơn bạn đã giúp mình.'],
  [41, 'V-て + ほしい / V-ない + でほしい', 'Muốn ai đó (không) làm V', 'Bày tỏ mong muốn người khác làm một việc. Với danh từ thì dùng N + がほしい.', '私は|友達に|もっと|連絡して|ほしいです。', 'Tôi muốn bạn liên lạc với tôi nhiều hơn.'],
  [41, 'V-ます(bỏ ます) + たがる / N + をほしがる', 'Ai đó muốn… (ngôi thứ ba)', 'Nói về mong muốn, cảm xúc bộc lộ ra ngoài của người khác, vì không thể biết chắc nội tâm của họ.', '弟は|新しい|ゲームを|ほしがっています。', 'Em trai tôi đang muốn có trò chơi mới.'],

  // 42 — Mục đích
  [42, 'V-dict / N-の + ために', 'Để… (mục đích)', 'Mục đích có chủ ý, hai vế cùng chủ ngữ. Khác với ように dùng cho trạng thái.', '日本語を|勉強する|ために、|日本へ|行きます。', 'Tôi sang Nhật để học tiếng Nhật.'],
  [42, 'V-dict / N-の + のに + 使う / かかる / 便利だ', 'Dùng để… / tốn… để…', 'のに chỉ mục đích sử dụng của đồ vật, thời gian hay tiền bạc cần thiết cho một việc.', 'この|はさみは|紙を|切るのに|使います。', 'Cái kéo này dùng để cắt giấy.'],
  [42, 'Thời điểm + までに', 'Trước (hạn chót)', 'Hạn cuối để hoàn thành một việc. Khác まで là kéo dài liên tục đến thời điểm đó.', '金曜日|までに、|レポートを|出してください。', 'Hãy nộp báo cáo trước thứ Sáu.'],
  [42, 'Khoảng thời gian + に + số lần', 'Mấy lần mỗi…', 'Diễn tả tần suất trong một khoảng thời gian.', '一週間に|二回|プールへ|行きます。', 'Mỗi tuần tôi đi bơi hai lần.'],

  // 43 — Vẻ bề ngoài
  [43, 'V-ます(bỏ ます) / A-い(bỏ い) / A-な + そうだ', 'Trông có vẻ… / sắp…', 'Phán đoán từ quan sát bằng mắt. Phủ định: 〜なさそう, 〜そうもない.', '雨が|降りそうです。', 'Trông có vẻ trời sắp mưa.'],
  [43, 'A-い(bỏ い) / A-な + そうな + N', 'Vẻ… (bổ nghĩa danh từ)', 'Dạng bổ nghĩa cho danh từ của そうだ.', 'おいしそうな|ケーキですね。', 'Cái bánh trông ngon nhỉ.'],
  [43, 'N / A + に見える', 'Trông như là…', 'Ấn tượng từ vẻ ngoài. Tính từ い đổi く trước 見える.', '彼は|若く|見えます。', 'Anh ấy trông trẻ.'],
  [43, 'N + が + する', 'Có mùi / vị / tiếng… (cảm nhận)', 'Dùng với mùi, vị, âm thanh, cảm giác để nói cảm nhận tự nhiên.', '部屋に|入ると、|いい|においが|しました。', 'Vừa vào phòng tôi ngửi thấy mùi thơm.'],

  // 44 — Quá mức, dễ khó, so sánh
  [44, 'V-ます(bỏ ます) / A + すぎる', 'Quá…', 'Mức độ vượt quá giới hạn vừa phải, thường mang ý không tốt.', '昨日は|食べ過ぎて|おなかが|痛いです。', 'Hôm qua tôi ăn nhiều quá nên đau bụng.'],
  [44, 'V-ます(bỏ ます) + やすい / にくい', 'Dễ / khó làm V', 'Đánh giá tính chất của vật hay việc khiến cho dễ hoặc khó làm.', 'この|ペンは|書きやすいです。', 'Cây bút này dễ viết.'],
  [44, 'V-ます(bỏ ます) + 方', 'Cách làm V', 'Danh từ hóa động từ thành “cách”.', 'この|漢字の|読み方を|教えてください。', 'Hãy chỉ tôi cách đọc chữ Hán này.'],
  [44, 'N1 + より + N2 + のほうが + Adj', 'N2 hơn N1', 'Cấu trúc so sánh hơn; より đứng sau vật được so làm chuẩn.', '私は|犬より|猫の|ほうが|好きです。', 'Tôi thích mèo hơn chó.'],
  [44, 'N + の中で + N + がいちばん + Adj', 'Trong N thì… nhất', 'So sánh nhất trong một nhóm.', 'スポーツの|中で|サッカーが|いちばん|好きです。', 'Trong các môn thể thao tôi thích bóng đá nhất.'],

  // 45 — Trường hợp & dù
  [45, '[Thể thường] / N-の + 場合は', 'Trong trường hợp…', 'Giả định một tình huống; hay gặp trong hướng dẫn, thông báo.', '火事の|場合は、|エレベーターを|使わないで|ください。', 'Khi có hỏa hoạn, xin đừng dùng thang máy.'],
  [45, 'V-て / A-くて / N-で + も', 'Dù… cũng…', 'Điều kiện nghịch: kết quả không đổi dù điều kiện thế nào.', '雨が|降っても、|試合は|あります。', 'Dù trời mưa, trận đấu vẫn diễn ra.'],
  [45, 'V-なくてもいい', 'Không cần phải làm V', 'Không cần thiết, không bắt buộc.', '明日は|来なくても|いいです。', 'Ngày mai bạn không cần đến cũng được.'],
  [45, 'V-ない + で / V-ず(に)', 'Mà không làm V', 'Chỉ hành động đi kèm trong trạng thái không làm một việc.', '傘を|持たないで|出かけました。', 'Tôi đã ra ngoài mà không mang ô.'],
  [45, 'V-なければならない / V-なければいけない', 'Phải làm V', 'Nghĩa vụ hay sự cần thiết. Văn nói: 〜なきゃ.', '薬を|飲まなければ|なりません。', 'Tôi phải uống thuốc.'],

  // 46 — Vừa mới & sắp
  [46, 'V-dict / V-ている / V-た + ところだ', 'Sắp / đang / vừa mới làm V', 'Chỉ đúng giai đoạn của hành động: V-る ngay trước khi làm, V-ている đang làm, V-た vừa mới xong.', '今|家に|帰った|ところです。', 'Tôi vừa mới về đến nhà.'],
  [46, 'V-た + ばかりだ', 'Vừa mới làm V xong', 'Cảm giác của người nói rằng thời gian từ lúc đó chưa lâu, không nhất thiết là vài phút.', '日本に|来た|ばかりです。', 'Tôi vừa mới đến Nhật.'],
  [46, 'V-て + ばかりいる', 'Cứ toàn làm V', 'Lặp đi lặp lại một việc, thường là phàn nàn.', '弟は|ゲームを|してばかり|います。', 'Em trai tôi cứ chơi game suốt.'],
  [46, 'なかなか + V-ない', 'Mãi mà không…', 'Việc không dễ dàng thực hiện, đi với phủ định.', 'なかなか|バスが|来ません。', 'Mãi mà xe buýt không đến.'],
  [46, 'あまり + V-ない / A-くない', 'Không… lắm', 'Phủ định ở mức độ nhẹ.', 'この|映画は|あまり|おもしろくないです。', 'Bộ phim này không hay lắm.'],

  // 47 — Nghe nói & hình như
  [47, '[Thể thường] + そうだ (truyền đạt)', 'Nghe nói là…', 'Truyền lại thông tin đã nghe hoặc đọc từ người khác; thường kèm によると.', '天気予報に|よると、|明日は|雨が|降るそうです。', 'Theo dự báo thời tiết, nghe nói ngày mai trời mưa.'],
  [47, '[Thể thường] / Na / N-の + ようだ', 'Hình như là… (phán đoán)', 'Phán đoán dựa trên giác quan hoặc quan sát của bản thân.', '隣の|部屋に|だれか|いるようです。', 'Hình như có ai đó ở phòng bên cạnh.'],
  [47, '[Thể thường] + らしい', 'Nghe nói / có vẻ là… (dựa trên thông tin)', 'Phán đoán từ thông tin nghe được từ người khác, khá khách quan.', '彼は|もう|帰ったらしいです。', 'Có vẻ anh ấy đã về rồi.'],
  [47, 'N / [Thể thường] + みたいだ', 'Hình như / giống như…', 'Tương tự ようだ nhưng thân mật, dùng nhiều trong hội thoại.', 'あの|人は|先生みたいです。', 'Người đó trông như giáo viên.'],
  [47, 'N-の / V-dict + ような / ように', 'Giống như…', 'Ví von, so sánh. ような bổ nghĩa danh từ, ように bổ nghĩa động từ.', '彼は|子どもの|ように|笑います。', 'Anh ấy cười như một đứa trẻ.'],

  // 48 — Sai khiến
  [48, 'Thể sai khiến (使役形): Nhóm 1 う→あ段+せる / Nhóm 2 る→させる / する→させる, 来る→来させる', 'Bắt / cho phép ai làm V', 'Người trên cho phép hay ép buộc người dưới làm một việc; người bị sai khiến đi với に hoặc を.', '母は|子どもに|野菜を|食べさせます。', 'Mẹ bắt con ăn rau.'],
  [48, 'V-使役形 + て + ください', 'Xin cho tôi làm V', 'Xin phép làm một việc.', 'ちょっと|考えさせて|ください。', 'Xin cho tôi suy nghĩ một chút.'],
  [48, 'Thể sai khiến bị động (使役受身): V-させられる', 'Bị bắt làm V', 'Bị người khác ép làm điều mình không muốn.', '私は|母に|部屋を|掃除させられました。', 'Tôi bị mẹ bắt dọn phòng.'],

  // 49 — Tôn kính ngữ
  [49, 'お + V-ます(bỏ ます) + になる', 'Làm V (tôn kính)', 'Nâng hành động của người trên; dùng được với hầu hết động từ.', '社長は|もう|お帰りに|なりました。', 'Giám đốc đã về rồi ạ.'],
  [49, 'Động từ tôn kính đặc biệt: いらっしゃる / 召し上がる / おっしゃる / ご覧になる / くださる', 'Đi, ăn, nói, xem, cho (tôn kính)', 'Một số động từ có dạng tôn kính riêng thay thế dạng thường.', '先生は|何を|召し上がりますか。', 'Thầy dùng món gì ạ?'],
  [49, 'お + V-ます(bỏ ます) + ください', 'Xin hãy… (lịch sự)', 'Lời nhờ lịch sự, dùng với khách hàng, cấp trên; する động từ dùng ご + Hán ngữ.', 'こちらで|お待ちください。', 'Xin hãy đợi ở đây.'],
  [49, 'V-れる / V-られる (tôn kính)', 'Dạng tôn kính bằng thể bị động', 'Dùng dạng bị động để nâng hành động của người trên, nhẹ hơn お〜になる.', '先生は|新聞を|読まれています。', 'Thầy đang đọc báo.'],
  [49, 'N + でございます / ございます', 'Là / có (rất lịch sự)', 'Dạng rất lịch sự của です và あります dùng với khách hàng.', 'こちらは|受付で|ございます。', 'Đây là quầy lễ tân ạ.'],

  // 50 — Khiêm nhường ngữ
  [50, 'お + V-ます(bỏ ます) + する / いたす', 'Tôi xin làm V (khiêm nhường)', 'Hạ thấp hành động của mình để thể hiện kính trọng người nghe hay người được nhắc.', '私が|お持ちします。', 'Để tôi mang giúp ạ.'],
  [50, 'Động từ khiêm nhường đặc biệt: 参る / 申す / 伺う / 拝見する / いただく / いたす', 'Đi, nói, hỏi thăm, xem, nhận (khiêm nhường)', 'Dạng khiêm nhường riêng của động từ thường dùng khi nói về mình.', '明日|お宅に|伺います。', 'Ngày mai tôi xin phép đến thăm nhà ạ.'],
  [50, 'V-使役形 + て + いただく', 'Xin phép được làm V', 'Xin phép làm một việc rất lịch sự. Cũng hay dùng 〜させていただきます khi thông báo.', '少し|休ませて|いただけませんか。', 'Cho phép tôi nghỉ một chút được không ạ?'],
  [50, 'V-て + いただけませんか', 'Anh/chị làm giúp… được không ạ?', 'Lời nhờ rất lịch sự.', '駅まで|道を|教えて|いただけませんか。', 'Anh có thể chỉ giúp tôi đường đến ga được không ạ?'],
];

type N4Point = Omit<GrammarItem, 'id' | 'level'>;
const point = ([, structure, meaning, explanation, example, translation]: Row): N4Point => {
  const pieces = example.split('|');
  const sentence = pieces.join('');
  return { structure, meaning, explanation, exampleSentence: sentence, exampleTranslation: translation, wordsToReorder: pieces, correctSentence: sentence };
};

/** Mẫu ngữ pháp N4 theo số bài (26–50). */
export const N4_GRAMMAR_BY_LESSON: Record<number, N4Point[]> = ROWS.reduce<Record<number, N4Point[]>>((out, row) => {
  (out[row[0]] ||= []).push(point(row));
  return out;
}, {});

/** Danh sách phẳng có id ổn định (`n4_<bài>_<thứ tự>`) để server lưu và client gộp. */
export const N4_GRAMMAR_ITEMS: GrammarItem[] = Object.entries(N4_GRAMMAR_BY_LESSON).flatMap(([lesson, list]) =>
  list.map((p, i) => ({ ...p, id: `n4_${lesson}_${i + 1}`, level: 'N4' as const, lessonNumber: Number(lesson), lessonName: `Bài ${lesson}` })));
