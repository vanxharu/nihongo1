/**
 * Bố cục "Kanji Master N4": 9 chương, 27 bài, 209 chữ Hán (theo mục lục sách).
 * Từ vựng và bài tập do app tự soạn, không chép nội dung bài tập của sách.
 */
import { KANJI_DICTIONARY, type KanjiInfo } from './kanjiDictionary';

export interface MasterWord { word: string; reading: string; meaning: string }
export interface MasterLesson { id: string; chapter: number; chapterTitle: string; title: string; kanji: string[]; words: MasterWord[] }

// Chữ Hán chưa có trong KANJI_DICTIONARY: kanji|On|Kun|Hán Việt|Nghĩa|Số nét
const EXTRA_RAW = `兄|ケイ,キョウ|あに|HUYNH|anh trai|5
弟|テイ,ダイ|おとうと|ĐỆ|em trai|7
姉|シ|あね|TỈ|chị gái|8
妹|マイ|いもうと|MUỘI|em gái|8
私|シ|わたし|TƯ|tôi, riêng tư|7
育|イク|そだ.つ, そだ.てる|DỤC|nuôi dưỡng|8
部|ブ||BỘ|bộ phận|11
低|テイ|ひく.い|ĐÊ|thấp|7
緑|リョク, ロク|みどり|LỤC|màu xanh lá|14
静|セイ, ジョウ|しず.か|TĨNH|yên tĩnh|14
働|ドウ|はたら.く|ĐỘNG|làm việc|13
工|コウ, ク||CÔNG|công nghiệp, thợ|3
場|ジョウ|ば|TRƯỜNG|nơi, địa điểm|12
客|キャク, カク||KHÁCH|khách|9
親|シン|おや, した.しい|THÂN|bố mẹ, thân thiết|16
当|トウ|あ.たる, あ.てる|ĐƯƠNG|trúng, đúng|6
品|ヒン|しな|PHẨM|hàng hóa, phẩm chất|9
利|リ|き.く|LỢI|lợi ích|7
銀|ギン||NGÂN|bạc, ngân hàng|14
紙|シ|かみ|CHỈ|giấy|10
朝|チョウ|あさ|TRIỀU|buổi sáng|12
晩|バン||VÃN|buổi tối|12
昼|チュウ|ひる|TRÚ|buổi trưa|9
夜|ヤ|よる, よ|DẠ|ban đêm|8
荷|カ|に|HÀ|hành lý, hàng|10
宅|タク||TRẠCH|nhà|6
急|キュウ|いそ.ぐ|CẤP|gấp, vội|9
速|ソク|はや.い|TỐC|nhanh|10
様|ヨウ|さま|DẠNG|ngài, kiểu dáng|14
主|シュ|おも, ぬし|CHỦ|chủ, chính|5
番|バン||PHIÊN|số thứ tự|12
号|ゴウ||HIỆU|số hiệu|5
京|キョウ, ケイ||KINH|kinh đô|8
都|ト, ツ|みやこ|ĐÔ|thủ đô|11
府|フ||PHỦ|phủ (đơn vị hành chính)|8
県|ケン||HUYỆN|tỉnh|9
市|シ|いち|THỊ|thành phố, chợ|5
区|ク||KHU|khu, quận|4
村|ソン|むら|THÔN|làng|7
週|シュウ||CHU|tuần|11
映|エイ|うつ.る, うつ.す|ÁNH|chiếu, phản chiếu|9
画|ガ, カク||HỌA|tranh, kế hoạch|8
館|カン||QUÁN|tòa nhà, quán|16
公|コウ|おおやけ|CÔNG|công cộng|4
園|エン|その|VIÊN|vườn|13
夫|フ, フウ|おっと|PHU|chồng|4
妻|サイ|つま|THÊ|vợ|8
特|トク||ĐẶC|đặc biệt|10
料|リョウ||LIỆU|nguyên liệu, phí|10
理|リ||LÝ|lý lẽ, xử lý|11
有|ユウ, ウ|あ.る|HỮU|có|6
洋|ヨウ||DƯƠNG|đại dương, phương Tây|9
服|フク||PHỤC|quần áo|8
衣|イ|ころも|Y|y phục|6
短|タン|みじか.い|ĐOẢN|ngắn|12
毛|モウ|け|MAO|lông, tóc|4
糸|シ|いと|MỊCH|sợi chỉ|6
玉|ギョク|たま|NGỌC|viên ngọc, hạt tròn|5
光|コウ|ひかり, ひか.る|QUANG|ánh sáng|6
鉄|テツ||THIẾT|sắt|13
乗|ジョウ|の.る|THỪA|lên xe, cưỡi|9
降|コウ|お.りる, ふ.る|GIÁNG|xuống, rơi (mưa)|10
発|ハツ, ホツ||PHÁT|xuất phát|9
着|チャク|き.る, つ.く|TRƯỚC|mặc, đến nơi|12
交|コウ|まじ.わる|GIAO|giao nhau|6
通|ツウ|とお.る, かよ.う|THÔNG|đi qua, thông|10
台|ダイ, タイ||ĐÀI|bệ, cái (đếm máy)|5
止|シ|と.まる, と.める|CHỈ|dừng|4
色|ショク, シキ|いろ|SẮC|màu sắc|6
黄|コウ, オウ|き|HOÀNG|màu vàng|11
科|カ||KHOA|khoa, môn|9
薬|ヤク|くすり|DƯỢC|thuốc|16
研|ケン|と.ぐ|NGHIÊN|nghiên cứu, mài|9
究|キュウ|きわ.める|CỨU|nghiên cứu cùng|7
文|ブン, モン|ふみ|VĂN|văn, câu|4
英|エイ||ANH|anh hùng, nước Anh|8
数|スウ|かず, かぞ.える|SỐ|số|13
若|ジャク|わか.い|NHƯỢC|trẻ|8
集|シュウ|あつ.まる, あつ.める|TẬP|tập hợp|12
酒|シュ|さけ|TỬU|rượu|10
歌|カ|うた, うた.う|CA|bài hát|14
楽|ガク, ラク|たの.しい|NHẠC / LẠC|âm nhạc, vui|13
味|ミ|あじ|VỊ|vị|8
油|ユ|あぶら|DU|dầu|8
太|タイ, タ|ふと.い|THÁI|to, béo|4
細|サイ|ほそ.い, こま.かい|TẾ|nhỏ, mảnh|11
皿||さら|MÃNH|cái đĩa|5
飯|ハン|めし|PHẠN|cơm|12
麦|バク|むぎ|MẠCH|lúa mạch|7
春|シュン|はる|XUÂN|mùa xuân|9
夏|カ|なつ|HẠ|mùa hè|10
秋|シュウ|あき|THU|mùa thu|9
冬|トウ|ふゆ|ĐÔNG|mùa đông|5
空|クウ|そら, あ.く, から|KHÔNG|bầu trời, trống|8
星|セイ, ショウ|ほし|TINH|ngôi sao|9
雲|ウン|くも|VÂN|mây|12
去|キョ, コ|さ.る|KHỨ|đi qua, quá khứ|5
晴|セイ|は.れる|TÌNH|trời quang|12
雪|セツ|ゆき|TUYẾT|tuyết|11
風|フウ, フ|かぜ|PHONG|gió|9
弱|ジャク|よわ.い|NHƯỢC|yếu|10
暑|ショ|あつ.い|THỬ|nóng (thời tiết)|12
寒|カン|さむ.い|HÀN|lạnh|12
世|セイ, セ|よ|THẾ|thế giới, đời|5
界|カイ||GIỚI|giới, ranh giới|9
写|シャ|うつ.す|TẢ|chụp, sao chép|5
真|シン|ま|CHÂN|thật|10
船|セン|ふね, ふな|THUYỀN|thuyền|11
漢|カン||HÁN|Hán|13
宿|シュク|やど|TÚC|chỗ trọ|11
題|ダイ||ĐỀ|đề, chủ đề|18
質|シツ||CHẤT|chất lượng|15
問|モン|と.う|VẤN|hỏi|11
答|トウ|こた.える|ĐÁP|trả lời|12
丸|ガン|まる.い|HOÀN|tròn|3
不|フ, ブ||BẤT|không, bất|4
歴|レキ||LỊCH|lịch sử, trải qua|14
史|シ||SỬ|lịch sử|5
王|オウ||VƯƠNG|vua|4
運|ウン|はこ.ぶ|VẬN|vận chuyển, vận may|12
動|ドウ|うご.く|ĐỘNG|chuyển động|11
練|レン|ね.る|LUYỆN|luyện tập|14
走|ソウ|はし.る|TẨU|chạy|7
歩|ホ, ブ|ある.く|BỘ|đi bộ|8
泳|エイ|およ.ぐ|VỊNH|bơi|8
才|サイ||TÀI|tài năng, tuổi|3
自|ジ, シ|みずか.ら|TỰ|tự mình|6
然|ゼン, ネン||NHIÊN|tự nhiên, vậy|12
草|ソウ|くさ|THẢO|cỏ|9
原|ゲン|はら|NGUYÊN|đồng bằng, nguyên|10
湖|コ|みずうみ|HỒ|hồ|12
谷|コク|たに|CỐC|thung lũng|7
海|カイ|うみ|HẢI|biển|9
辺|ヘン|あた.り, べ|BIÊN|vùng quanh|5
里|リ|さと|LÝ|làng quê|7
野|ヤ|の|DÃ|cánh đồng|11
池|チ|いけ|TRÌ|ao|6
虫|チュウ|むし|TRÙNG|côn trùng|6
羽|ウ|は, はね|VŨ|lông vũ, cánh|6
馬|バ|うま|MÃ|ngựa|10`;

const EXTRA: Record<string, KanjiInfo> = {};
for (const line of EXTRA_RAW.split('\n')) {
  const [kanji, onyomi, kunyomi, han_viet, meaning, strokes] = line.split('|');
  EXTRA[kanji] = { kanji, han_viet, onyomi, kunyomi, meaning, strokes: Number(strokes) };
}
export const masterKanjiInfo = (k: string): KanjiInfo | undefined => KANJI_DICTIONARY[k] || EXTRA[k];

const words = (raw: string): MasterWord[] =>
  raw.trim().split('\n').map(l => { const [word, reading, meaning] = l.split('|'); return { word, reading, meaning }; });

const L = (id: string, chapter: number, chapterTitle: string, title: string, kanji: string, raw: string): MasterLesson =>
  ({ id, chapter, chapterTitle, title, kanji: [...kanji], words: words(raw) });

export const KANJI_MASTER_N4: MasterLesson[] = [
  L('1-1', 1, '家族の生かつ', '家族', '家族兄弟姉妹私育', `家族|かぞく|gia đình
家|いえ|nhà
兄弟|きょうだい|anh em
兄|あに|anh trai (của mình)
弟|おとうと|em trai
姉|あね|chị gái (của mình)
姉妹|しまい|chị em gái
妹|いもうと|em gái
私|わたし|tôi
育てる|そだてる|nuôi dưỡng
教育|きょういく|giáo dục`),
  L('1-2', 1, '家族の生かつ', 'マンション', '部屋広低緑静近遠', `部屋|へや|căn phòng
部分|ぶぶん|bộ phận
広い|ひろい|rộng
広場|ひろば|quảng trường
低い|ひくい|thấp
緑|みどり|màu xanh lá
静か|しずか|yên tĩnh
近い|ちかい|gần
近所|きんじょ|hàng xóm
遠い|とおい|xa
遠足|えんそく|chuyến dã ngoại`),
  L('1-3', 1, '家族の生かつ', 'しごと', '会社働作工場始終', `会社|かいしゃ|công ty
社会|しゃかい|xã hội
働く|はたらく|làm việc
作る|つくる|làm, chế tạo
作文|さくぶん|bài văn
工場|こうじょう|nhà máy
工事|こうじ|công trình
場所|ばしょ|địa điểm
始める|はじめる|bắt đầu (tha động)
始まる|はじまる|bắt đầu (tự động)
終わる|おわる|kết thúc
終点|しゅうてん|ga cuối`),
  L('2-1', 2, 'コンビニ', 'レジ', '店客親切売当品', `店|みせ|cửa hàng
客|きゃく|khách
お客さん|おきゃくさん|khách hàng
親切|しんせつ|tốt bụng
親|おや|bố mẹ
売る|うる|bán
売り場|うりば|quầy bán
当たる|あたる|trúng
本当|ほんとう|thật sự
品物|しなもの|hàng hóa
食品|しょくひん|thực phẩm
切る|きる|cắt`),
  L('2-2', 2, 'コンビニ', '店内', '便利使銀白黒紙', `便利|べんり|tiện lợi
不便|ふべん|bất tiện
使う|つかう|sử dụng
銀行|ぎんこう|ngân hàng
銀色|ぎんいろ|màu bạc
白い|しろい|trắng
黒い|くろい|đen
白紙|はくし|giấy trắng
黒板|こくばん|bảng đen
紙|かみ|giấy
手紙|てがみ|thư`),
  L('2-3', 2, 'コンビニ', '24時間', '朝晩昼夜前後午早', `朝|あさ|buổi sáng
今朝|けさ|sáng nay
晩|ばん|buổi tối
毎晩|まいばん|mỗi tối
昼|ひる|buổi trưa
昼ご飯|ひるごはん|cơm trưa
夜|よる|đêm
午前|ごぜん|buổi sáng (AM)
午後|ごご|buổi chiều (PM)
前|まえ|trước
後|あと|sau
早い|はやい|sớm`),
  L('3-1', 3, 'おくり物', '荷物', '荷送宅急速遅重軽', `荷物|にもつ|hành lý
送る|おくる|gửi
宅配便|たくはいびん|chuyển phát tận nhà
自宅|じたく|nhà riêng
急ぐ|いそぐ|vội
急行|きゅうこう|tàu nhanh
速い|はやい|nhanh
速達|そくたつ|chuyển phát nhanh
遅い|おそい|chậm
遅れる|おくれる|muộn, trễ
重い|おもい|nặng
軽い|かるい|nhẹ`),
  L('3-2', 3, 'おくり物', 'あて先', '住所様主番地号', `住所|じゅうしょ|địa chỉ
住む|すむ|sống, cư trú
お客様|おきゃくさま|quý khách
主人|しゅじん|chồng / chủ nhân
主に|おもに|chủ yếu
番号|ばんごう|số
番地|ばんち|số nhà
地図|ちず|bản đồ
地下鉄|ちかてつ|tàu điện ngầm
信号|しんごう|đèn tín hiệu
号室|ごうしつ|phòng số`),
  L('3-3', 3, 'おくり物', '都道府県', '京都道府県市区村', `東京|とうきょう|Tokyo
京都|きょうと|Kyoto
都会|とかい|thành phố lớn
道|みち|đường
北海道|ほっかいどう|Hokkaido
大阪府|おおさかふ|phủ Osaka
県|けん|tỉnh
市|し|thành phố
市民|しみん|người dân thành phố
区|く|quận
村|むら|làng
都合|つごう|sự thuận tiện`),
  L('4-1', 4, 'デート', 'デート', '毎週映画図館公園', `毎週|まいしゅう|mỗi tuần
今週|こんしゅう|tuần này
毎日|まいにち|mỗi ngày
映画|えいが|phim
映画館|えいがかん|rạp chiếu phim
図書館|としょかん|thư viện
大使館|たいしかん|đại sứ quán
公園|こうえん|công viên
公共|こうきょう|công cộng
動物園|どうぶつえん|sở thú
毎月|まいつき|mỗi tháng`),
  L('4-2', 4, 'デート', 'けっこんきねん日', '夫妻特思料理有', `夫|おっと|chồng
夫婦|ふうふ|vợ chồng
妻|つま|vợ
特別|とくべつ|đặc biệt
特急|とっきゅう|tàu tốc hành
思う|おもう|nghĩ
思い出|おもいで|kỷ niệm
料理|りょうり|nấu ăn, món ăn
料金|りょうきん|tiền phí
理由|りゆう|lý do
有名|ゆうめい|nổi tiếng
有料|ゆうりょう|có phí`),
  L('4-3', 4, 'デート', 'ファッション', '洋服衣短毛糸玉光', `洋服|ようふく|quần áo kiểu Tây
西洋|せいよう|phương Tây
服|ふく|quần áo
衣服|いふく|y phục
短い|みじかい|ngắn
毛|け|lông, tóc
毛糸|けいと|len
糸|いと|sợi chỉ
玉|たま|viên, hạt
目玉|めだま|nhãn cầu
光|ひかり|ánh sáng
光る|ひかる|tỏa sáng`),
  L('5-1', 5, '町', '駅', '駅鉄乗降開閉発着', `駅|えき|ga
鉄道|てつどう|đường sắt
乗る|のる|lên (xe)
降りる|おりる|xuống (xe)
開く|あく|mở (tự động)
開ける|あける|mở (tha động)
閉める|しめる|đóng (tha động)
閉まる|しまる|đóng (tự động)
出発|しゅっぱつ|xuất phát
発車|はっしゃ|xe khởi hành
到着|とうちゃく|đến nơi
着く|つく|đến`),
  L('5-2', 5, '町', '交さてん', '交通台止色赤黄青', `交通|こうつう|giao thông
交差点|こうさてん|ngã tư
台風|たいふう|bão
台所|だいどころ|nhà bếp
止まる|とまる|dừng (tự động)
止める|とめる|dừng (tha động)
色|いろ|màu
赤い|あかい|đỏ
黄色|きいろ|màu vàng
青い|あおい|xanh dương
赤信号|あかしんごう|đèn đỏ
青信号|あおしんごう|đèn xanh`),
  L('5-3', 5, '町', '病院', '病院医科薬待合計', `病院|びょういん|bệnh viện
病気|びょうき|bệnh
医者|いしゃ|bác sĩ
内科|ないか|khoa nội
薬|くすり|thuốc
薬局|やっきょく|hiệu thuốc
待つ|まつ|đợi
待合室|まちあいしつ|phòng chờ
合う|あう|hợp
合計|ごうけい|tổng cộng
計画|けいかく|kế hoạch
時計|とけい|đồng hồ`),
  L('6-1', 6, '学生', '研究', '研究語文英化数心', `研究|けんきゅう|nghiên cứu
研究室|けんきゅうしつ|phòng nghiên cứu
国語|こくご|quốc ngữ
日本語|にほんご|tiếng Nhật
文化|ぶんか|văn hóa
英語|えいご|tiếng Anh
数学|すうがく|toán học
数字|すうじ|con số
化学|かがく|hóa học
心配|しんぱい|lo lắng
安心|あんしん|yên tâm`),
  L('6-2', 6, '学生', '合コン', '若集知酒歌声楽', `若い|わかい|trẻ
集まる|あつまる|tập trung
集める|あつめる|thu thập
知る|しる|biết
知らせる|しらせる|thông báo
お酒|おさけ|rượu
歌|うた|bài hát
歌う|うたう|hát
歌手|かしゅ|ca sĩ
声|こえ|giọng nói
音楽|おんがく|âm nhạc
楽しい|たのしい|vui`),
  L('6-3', 6, '学生', 'ラーメン屋', '味油太細皿飯麦', `味|あじ|vị
意味|いみ|ý nghĩa
油|あぶら|dầu
太い|ふとい|to, béo
太る|ふとる|béo lên
細い|ほそい|mảnh
細かい|こまかい|nhỏ, tỉ mỉ
お皿|おさら|đĩa
ご飯|ごはん|cơm
晩ご飯|ばんごはん|cơm tối
麦茶|むぎちゃ|trà lúa mạch
小麦|こむぎ|lúa mì`),
  L('7-1', 7, '春夏秋冬', 'きせつ', '春夏秋冬空星雲去', `春|はる|mùa xuân
夏|なつ|mùa hè
秋|あき|mùa thu
冬|ふゆ|mùa đông
春休み|はるやすみ|nghỉ xuân
空|そら|bầu trời
空気|くうき|không khí
空港|くうこう|sân bay
星|ほし|ngôi sao
雲|くも|mây
去年|きょねん|năm ngoái
過去|かこ|quá khứ`),
  L('7-2', 7, '春夏秋冬', '天気', '天晴雪風強弱暑寒', `天気|てんき|thời tiết
晴れる|はれる|trời quang
雪|ゆき|tuyết
大雪|おおゆき|tuyết lớn
風|かぜ|gió
強い|つよい|mạnh
弱い|よわい|yếu
暑い|あつい|nóng
寒い|さむい|lạnh
天国|てんごく|thiên đường
勉強|べんきょう|học
風邪|かぜ|cảm lạnh`),
  L('7-3', 7, '春夏秋冬', '旅行', '旅持世界写真船', `旅行|りょこう|du lịch
旅|たび|chuyến đi
持つ|もつ|cầm, mang
気持ち|きもち|cảm giác
お金持ち|おかねもち|người giàu
世界|せかい|thế giới
世話|せわ|chăm sóc
写真|しゃしん|ảnh
写す|うつす|chụp
真ん中|まんなか|chính giữa
船|ふね|thuyền
船便|ふなびん|gửi đường biển`),
  L('8-1', 8, '学校', '勉強', '勉漢宿題質問教室', `勉強|べんきょう|học
漢字|かんじ|chữ Hán
宿題|しゅくだい|bài tập về nhà
宿|やど|chỗ trọ
問題|もんだい|vấn đề, đề bài
質問|しつもん|câu hỏi
教室|きょうしつ|lớp học
教える|おしえる|dạy
教科書|きょうかしょ|sách giáo khoa
品質|ひんしつ|chất lượng
漢方|かんぽう|y học cổ truyền`),
  L('8-2', 8, '学校', 'テスト', '試験答考正丸不同', `試験|しけん|kỳ thi
答える|こたえる|trả lời
答え|こたえ|đáp án
考える|かんがえる|suy nghĩ
考え|かんがえ|ý kiến
正しい|ただしい|đúng
正月|しょうがつ|Tết
丸い|まるい|tròn
不安|ふあん|lo lắng
同じ|おなじ|giống nhau
同時|どうじ|đồng thời`),
  L('8-3', 8, '学校', '社会科', '政治経済歴史国王', `政治|せいじ|chính trị
経済|けいざい|kinh tế
経験|けいけん|kinh nghiệm
歴史|れきし|lịch sử
国|くに|đất nước
外国|がいこく|nước ngoài
国際|こくさい|quốc tế
国王|こくおう|quốc vương
王様|おうさま|nhà vua
王子|おうじ|hoàng tử
女王|じょおう|nữ hoàng
政府|せいふ|chính phủ`),
  L('9-1', 9, '休みの日', '運動', '運動練習走歩泳才', `運動|うんどう|vận động
運ぶ|はこぶ|vận chuyển
動く|うごく|chuyển động
動物|どうぶつ|động vật
練習|れんしゅう|luyện tập
習う|ならう|học (từ ai đó)
走る|はしる|chạy
歩く|あるく|đi bộ
散歩|さんぽ|đi dạo
泳ぐ|およぐ|bơi
水泳|すいえい|bơi lội
天才|てんさい|thiên tài`),
  L('9-2', 9, '休みの日', 'リゾート', '自然草原湖谷海辺', `自然|しぜん|thiên nhiên
自分|じぶん|bản thân
自動車|じどうしゃ|ô tô
草|くさ|cỏ
草原|そうげん|thảo nguyên
原因|げんいん|nguyên nhân
湖|みずうみ|hồ
谷|たに|thung lũng
海|うみ|biển
海辺|うみべ|bờ biển
海外|かいがい|nước ngoài
辺り|あたり|vùng xung quanh`),
  L('9-3', 9, '休みの日', 'いなか', '里野奥池虫羽暗馬', `里|さと|làng quê
野菜|やさい|rau
野原|のはら|cánh đồng
野球|やきゅう|bóng chày
奥|おく|bên trong
奥さん|おくさん|vợ (người khác)
池|いけ|ao
虫|むし|côn trùng
羽|はね|lông, cánh
暗い|くらい|tối
馬|うま|ngựa
乗馬|じょうば|cưỡi ngựa`),
];

export interface MasterSentence { vi: string; ja: string[] }
// Câu ghép: mỗi dòng "tiếng Việt|cụm/cụm/cụm" (tự soạn, dùng chữ Hán của bài)
const SENT_RAW: Record<string, string> = {
'1-1': `Gia đình tôi có năm người.|私の/家族は/五人/です
Tôi có một anh trai và một em gái.|私には/兄が/一人と/妹が/一人/います
Chị gái tôi nuôi con một mình.|姉は/子どもを/一人で/育てて/います
Em trai tôi hay giúp việc nhà.|弟は/よく/家の/手伝いを/します`,
'1-2': `Phòng này rộng và yên tĩnh.|この/部屋は/広くて/静かです
Nhà ga ở gần đây.|駅は/ここから/近いです
Trường học ở xa nhà tôi.|学校は/私の/家から/遠いです
Cái bàn thấp nên khó dùng.|机が/低いので/使いにくいです`,
'1-3': `Tôi làm việc ở công ty.|私は/会社で/働いて/います
Bố tôi làm ở nhà máy.|父は/工場で/働いて/います
Công việc bắt đầu lúc chín giờ.|仕事は/九時に/始まります
Hôm nay công việc xong lúc sáu giờ.|今日は/六時に/仕事が/終わりました`,
'2-1': `Nhân viên cửa hàng rất tốt bụng.|店の/人は/とても/親切です
Cửa hàng này bán thực phẩm.|この/店では/食品を/売って/います
Khách đang xếp hàng ở quầy tính tiền.|お客さんが/レジに/並んで/います
Chuyện đó là thật.|それは/本当の/話です`,
'2-2': `Cửa hàng tiện lợi rất tiện.|コンビニは/とても/便利です
Tôi dùng máy của ngân hàng.|銀行の/機械を/使います
Tôi viết thư lên giấy trắng.|白い/紙に/手紙を/書きます
Trên bảng đen có chữ trắng.|黒板に/白い/字が/あります`,
'2-3': `Sáng nay tôi dậy sớm.|今朝は/早く/起きました
Mỗi tối tôi uống cà phê.|毎晩/コーヒーを/飲みます
Buổi trưa tôi ăn cơm ở công ty.|昼は/会社で/ご飯を/食べます
Buổi chiều có cuộc họp.|午後に/会議が/あります`,
'3-1': `Hành lý này nặng.|この/荷物は/重いです
Tôi gửi hành lý cho mẹ.|母に/荷物を/送ります
Cái túi này nhẹ.|この/かばんは/軽いです
Tàu tốc hành đến muộn.|急行が/遅れて/います`,
'3-2': `Địa chỉ nhà bạn ở đâu?|あなたの/住所は/どこですか
Tôi sống ở Tokyo.|私は/東京に/住んで/います
Xin hãy cho tôi biết số.|番号を/教えて/ください
Quý khách vui lòng xem bản đồ.|お客様、/地図を/見て/ください`,
'3-3': `Tôi sống ở thành phố Kyoto.|私は/京都市に/住んで/います
Ngôi làng đó rất yên tĩnh.|その/村は/とても/静かです
Hokkaido là nơi lạnh.|北海道は/寒い/所です
Quận này có công viên.|この/区には/公園が/あります`,
'4-1': `Mỗi tuần tôi xem phim.|毎週/映画を/見ます
Tôi đọc sách ở thư viện.|図書館で/本を/読みます
Tôi đi dạo ở công viên.|公園を/散歩します
Rạp chiếu phim ở gần ga.|映画館は/駅の/近くに/あります`,
'4-2': `Chồng tôi nấu ăn giỏi.|夫は/料理が/上手です
Vợ tôi là người nổi tiếng.|妻は/有名な/人です
Hôm nay là ngày đặc biệt.|今日は/特別な/日です
Tôi nghĩ món ở quán này ngon.|この/店の/料理は/おいしいと/思います`,
'4-3': `Tôi mua quần áo kiểu Tây.|洋服を/買いました
Cái áo này ngắn.|この/服は/短いです
Tôi đan áo len bằng len.|毛糸で/セーターを/作ります
Ánh sáng mặt trời rất đẹp.|太陽の/光が/きれいです`,
'5-1': `Tôi lên tàu ở ga.|駅で/電車に/乗ります
Tôi xuống tàu ở Tokyo.|東京で/電車を/降ります
Cửa tàu đóng lại.|ドアが/閉まります
Tàu đến ga lúc mười giờ.|電車は/十時に/駅に/着きます`,
'5-2': `Hãy dừng ở ngã tư.|交差点で/止まって/ください
Đèn đỏ thì dừng lại.|赤信号では/止まります
Đèn xanh thì băng qua.|青信号では/渡ります
Ở đây giao thông đông.|ここは/交通が/多いです`,
'5-3': `Vì bị bệnh nên tôi đến bệnh viện.|病気なので/病院へ/行きます
Tôi uống thuốc sau bữa ăn.|食後に/薬を/飲みます
Xin hãy đợi ở phòng chờ.|待合室で/待って/ください
Tôi được bác sĩ khám cho.|医者に/見て/もらいました`,
'6-1': `Tôi đang nghiên cứu văn hóa Nhật.|日本の/文化を/研究して/います
Tôi đang học tiếng Anh.|英語を/勉強して/います
Tôi giỏi toán.|数学が/得意です
Xin đừng lo lắng.|心配しないで/ください`,
'6-2': `Những người trẻ tụ tập ở quán.|若い/人が/店に/集まりました
Tôi không uống rượu.|お酒は/飲みません
Tôi thích hát.|歌うのが/好きです
Âm nhạc thật vui.|音楽は/楽しいです`,
'6-3': `Vị của món này ngon.|この/料理は/味が/いいです
Tôi đã ăn cơm tối.|晩ご飯を/食べました
Sợi mì này mảnh.|この/麺は/細いです
Tôi uống trà lúa mạch.|麦茶を/飲みます`,
'7-1': `Mùa xuân thì ấm áp.|春は/暖かいです
Mùa đông thì lạnh.|冬は/寒いです
Trên trời có mây.|空に/雲が/あります
Năm ngoái tôi đã đến sân bay.|去年/空港へ/行きました`,
'7-2': `Hôm nay trời nắng đẹp.|今日は/よく/晴れて/います
Mùa đông tuyết rơi.|冬は/雪が/降ります
Hôm nay gió mạnh.|今日は/風が/強いです
Mùa hè thì nóng.|夏は/暑いです`,
'7-3': `Tôi muốn đi du lịch vòng quanh thế giới.|世界を/旅行したいです
Tôi chụp ảnh.|写真を/撮ります
Tôi mang hành lý đi.|荷物を/持って/行きます
Con thuyền chạy trên biển.|船が/海を/走ります`,
'8-1': `Tôi học chữ Hán.|漢字を/勉強します
Tôi làm bài tập về nhà.|宿題を/します
Tôi có một câu hỏi.|質問が/あります
Thầy giáo đang dạy trong lớp.|先生は/教室で/教えて/います`,
'8-2': `Ngày mai có kỳ thi.|明日は/試験が/あります
Hãy trả lời câu hỏi.|問題に/答えて/ください
Đáp án này đúng.|この/答えは/正しいです
Tôi cũng có cùng suy nghĩ.|私も/同じ/考えです`,
'8-3': `Tôi học lịch sử.|歴史を/勉強します
Tôi quan tâm đến chính trị.|政治に/興味が/あります
Nhà vua sống ở đất nước đó.|王様は/その/国に/住んで/います
Kinh tế nước ngoài thì khó.|外国の/経済は/難しいです`,
'9-1': `Mỗi ngày tôi luyện tập thể thao.|毎日/運動の/練習を/します
Tôi chạy trong công viên.|公園を/走ります
Buổi sáng tôi đi dạo.|朝/散歩を/します
Tôi biết bơi.|泳ぐ/ことが/できます`,
'9-2': `Thiên nhiên thật đẹp.|自然が/きれいです
Cỏ mọc trên thảo nguyên.|草原に/草が/生えて/います
Có hồ trong thung lũng.|谷に/湖が/あります
Tôi đã đến bờ biển.|海辺へ/行きました`,
'9-3': `Rau ở quê rất tươi.|田舎の/野菜は/新鮮です
Có côn trùng ở ao.|池に/虫が/います
Căn phòng tối.|部屋が/暗いです
Tôi cưỡi ngựa.|馬に/乗ります`,
};
export const MASTER_SENTENCES: Record<string, MasterSentence[]> = Object.fromEntries(
  Object.entries(SENT_RAW).map(([id, raw]) => [id, raw.split('\n').map(l => { const [vi, ja] = l.split('|'); return { vi, ja: ja.split('/') }; })]),
);
