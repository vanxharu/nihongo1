import { ExamQuestion } from '../types';
import { KANJI_DICTIONARY } from '../data/kanjiDictionary';
import { getDokkaiTranslation, DOKKAI_PASSAGE_TRANSLATIONS, DokkaiSentenceBreakdown } from '../data/dokkaiTranslations';
import { getBunpouDetail } from '../data/bunpouExplanations';
import { getChoukaiDetail } from '../data/choukaiExplanations';

export interface AnnotatedToken {
  id: string;
  text: string;
  topAnnotation?: string; // Furigana in handwriting (Hiragana for Kanji) - Blue
  bottomAnnotation?: string; // Vietnamese meaning in handwriting - Blue
  isUnderlined?: boolean; // Blue line under key grammar/verb
  isCircled?: boolean; // Blue circle around target Kanji/word
  isTarget?: boolean; // Target word of the question
  isGrammar?: boolean; // Key grammar point
}

export interface AnnotatedOption {
  index: number;
  optionText: string;
  isCorrect: boolean;
  isUserSelected: boolean;
  handwrittenNote: string; // e.g. "máy bay", "✕ thiếu trường âm (う)", "⭕ Đúng với nội dung bài đọc"
  meaning?: string;
  statusTag?: string;
}

export interface PassageRubyChunk {
  text: string;
  furigana?: string;
  isKanji: boolean;
  meaning?: string;
  isHighlighted?: boolean;
}

export interface DokkaiParsedQuestion {
  isDokkai: boolean;
  passageTitle?: string;
  passageBody?: string;
  passageChunks?: PassageRubyChunk[];
  questionPrompt: string;
  passageTranslation?: string;
  questionTranslation?: string;
  sentenceBreakdown?: DokkaiSentenceBreakdown[];
}

export interface DirectSentenceAnnotationResult {
  tokens: AnnotatedToken[];
  options: AnnotatedOption[];
  fullSentenceMeaning: string;
  coreRule: string;
  dokkaiData?: DokkaiParsedQuestion;
}

// Built-in comprehensive dictionary for high-frequency words, kanji, particles and grammar in JLPT (N5 - N1)
export const JLPT_VOCAB_DB: Record<string, { reading: string; meaning: string; isCircled?: boolean; isUnderlined?: boolean }> = {
  // === 1. TRANSPORTATION & PLACES ===
  '台風': { reading: 'たいふう', meaning: 'cơn bão' },
  '飛行機': { reading: 'ひこうき', meaning: 'máy bay', isCircled: true },
  'おくれて': { reading: 'おくれて', meaning: 'bị trễ / muộn', isUnderlined: true },
  '遅れて': { reading: 'おくれて', meaning: 'bị trễ / muộn', isUnderlined: true },
  '遅れる': { reading: 'おくれる', meaning: 'bị trễ / muộn', isUnderlined: true },
  '出発': { reading: 'しゅっぱつ', meaning: 'khởi hành', isCircled: true },
  '出発しました': { reading: 'しゅっぱつしました', meaning: 'đã khởi hành', isCircled: true },
  '到着': { reading: 'とうちゃく', meaning: 'đến nơi', isCircled: true },
  '到着しました': { reading: 'とうちゃくしました', meaning: 'đã đến nơi', isCircled: true },
  '電車': { reading: 'でんしゃ', meaning: 'tàu điện' },
  '新幹線': { reading: 'しんかんせん', meaning: 'tàu siêu tốc' },
  '地下鉄': { reading: 'ちかてつ', meaning: 'tàu điện ngầm' },
  'バス': { reading: 'バス', meaning: 'xe buýt' },
  'タクシー': { reading: 'タクシー', meaning: 'xe taxi' },
  '車': { reading: 'くるま', meaning: 'xe ô tô' },
  '自動車': { reading: 'じどうしゃ', meaning: 'xe ô tô' },
  '自転車': { reading: 'じてんしゃ', meaning: 'xe đạp' },
  'バイク': { reading: 'バイク', meaning: 'xe máy' },
  '駅': { reading: 'えき', meaning: 'nhà ga' },
  '空港': { reading: 'くうこう', meaning: 'sân bay' },
  '港': { reading: 'みなと', meaning: 'bến cảng' },
  '道': { reading: 'みち', meaning: 'con đường' },
  '道路': { reading: 'どうろ', meaning: 'đường xá' },
  '交差点': { reading: 'こうさてん', meaning: 'ngã tư' },
  '信号': { reading: 'しんごう', meaning: 'đèn giao thông' },
  '角': { reading: 'かど', meaning: 'góc đường' },
  '橋': { reading: 'はし', meaning: 'cây cầu' },
  '公園': { reading: 'こうえん', meaning: 'công viên' },
  '図書館': { reading: 'としょかん', meaning: 'thư viện' },
  '美術館': { reading: 'びじゅつかん', meaning: 'bảo tàng mỹ thuật' },
  '博物館': { reading: 'はくぶつかん', meaning: 'bảo tàng lịch sử' },
  '映画館': { reading: 'えいがかん', meaning: 'rạp chiếu phim' },
  '郵便局': { reading: 'ゆうびんきょく', meaning: 'bưu điện' },
  '銀行': { reading: 'ぎんこう', meaning: 'ngân hàng' },
  '病院': { reading: 'びょういん', meaning: 'bệnh viện' },
  '薬局': { reading: 'やっきょく', meaning: 'tiệm thuốc' },
  '交番': { reading: 'こうばん', meaning: 'đồn cảnh sát' },
  '警察署': { reading: 'けいさつしょ', meaning: 'sở cảnh sát' },
  '市役所': { reading: 'しやくしょ', meaning: 'ủy ban TP' },
  '大使館': { reading: 'たいしかん', meaning: 'đại sứ quán' },
  'ホテル': { reading: 'ホテル', meaning: 'khách sạn' },
  '旅館': { reading: 'りょかん', meaning: 'quán trọ Nhật' },
  'レストラン': { reading: 'レストラン', meaning: 'nhà hàng' },
  '喫茶店': { reading: 'きっさてん', meaning: 'quán cà phê' },
  'カフェ': { reading: 'カフェ', meaning: 'quán cafe' },
  'コンビニ': { reading: 'コンビニ', meaning: 'cửa hàng tiện lợi' },
  'スーパー': { reading: 'スーパー', meaning: 'siêu thị' },
  'デパート': { reading: 'デパート', meaning: 'trung tâm thương mại' },
  '本屋': { reading: 'ほんや', meaning: 'hiệu sách' },
  '花屋': { reading: 'はなや', meaning: 'tiệm hoa' },
  '八百屋': { reading: 'やおや', meaning: 'tiệm rau quả' },
  '肉屋': { reading: 'にくや', meaning: 'tiệm thịt' },
  '魚屋': { reading: 'さかなや', meaning: 'tiệm cá' },
  '売り場': { reading: 'うりば', meaning: 'quầy bán hàng' },
  '駐車場': { reading: 'ちゅうしゃじょう', meaning: 'bãi đỗ xe' },
  '東京駅': { reading: 'とうきょうえき', meaning: 'ga Tokyo' },
  '京都': { reading: 'きょうと', meaning: 'Kyoto' },

  // === 2. DOKKAI & DAILY GOODS / STATIONERY ===
  '消しゴム': { reading: 'けしゴム', meaning: 'cục tẩy' },
  '黒い消しゴム': { reading: 'くろいけしゴム', meaning: 'cục tẩy màu đen' },
  '黒い': { reading: 'くろい', meaning: 'màu đen' },
  '白い': { reading: 'しろい', meaning: 'màu trắng' },
  '赤い': { reading: 'あかい', meaning: 'màu đỏ' },
  '青い': { reading: 'あおい', meaning: 'màu xanh dương' },
  '黄色い': { reading: 'きいろい', meaning: 'màu vàng' },
  'レジの人': { reading: 'レジのひと', meaning: 'nhân viên thu ngân' },
  'レジ': { reading: 'レジ', meaning: 'quầy thu ngân' },
  '汚れて': { reading: 'よごれて', meaning: 'bị vấy bẩn' },
  '汚れる': { reading: 'よごれる', meaning: 'bị bẩn' },
  'かっこいい': { reading: 'かっこいい', meaning: 'ngầu, đẹp đẽ' },
  '面白い': { reading: 'おもしろい', meaning: 'thú vị' },
  '理由': { reading: 'りゆう', meaning: 'lý do' },
  '親切': { reading: 'しんせつ', meaning: 'tốt bụng, tử tế' },
  '困っている': { reading: 'こまっている', meaning: 'gặp khó khăn' },
  '困っていた': { reading: 'こまっていた', meaning: 'đang lúng túng' },
  '温かくなりました': { reading: 'あたたかくなりました', meaning: 'trở nên ấm áp' },
  '乗り換え': { reading: 'のりかえ', meaning: 'chuyển tàu xe' },
  '乗り換えなければ': { reading: 'のりかえなければ', meaning: 'phải chuyển tàu' },
  'ケーキ': { reading: 'ケーキ', meaning: 'bánh ngọt' },
  'パン': { reading: 'パン', meaning: 'bánh mì' },
  'フランスパン': { reading: 'フランスパン', meaning: 'bánh mì Pháp' },
  '果物': { reading: 'くだもの', meaning: 'trái cây' },
  'リンゴ': { reading: 'リンゴ', meaning: 'quả táo' },
  'みかん': { reading: 'みかん', meaning: 'quả quýt' },
  '半分': { reading: 'はんぶん', meaning: 'một nửa' },
  '家族': { reading: 'かぞく', meaning: 'gia đình' },
  'シェアハウス': { reading: 'シェアハウス', meaning: 'nhà ở chung' },
  '生活': { reading: 'せいかつ', meaning: 'sinh hoạt' },
  '食堂': { reading: 'しょくどう', meaning: 'nhà ăn' },
  '居間': { reading: 'いま', meaning: 'phòng khách' },
  '安全': { reading: 'あんぜん', meaning: 'an toàn' },
  '知り合い': { reading: 'しりあい', meaning: 'người quen' },
  '人気': { reading: 'にんき', meaning: 'được yêu thích' },
  '運動用': { reading: 'うんどうよう', meaning: 'dùng để thể thao' },
  '運動': { reading: 'うんどう', meaning: 'vận động' },
  '服': { reading: 'ふく', meaning: 'quần áo' },
  '服装': { reading: 'ふくそう', meaning: 'trang phục' },
  'ジョギング': { reading: 'ジョギング', meaning: 'chạy bộ' },
  'マラソン': { reading: 'マラソン', meaning: 'chạy marathon' },
  '世話': { reading: 'せわ', meaning: 'chăm sóc' },
  '健康': { reading: 'けんこう', meaning: 'sức khỏe' },
  '薬': { reading: 'くすり', meaning: 'thuốc' },
  '自然': { reading: 'しぜん', meaning: 'tự nhiên' },
  '働き': { reading: 'はたらき', meaning: 'tác dụng, chức năng' },
  '気持ち': { reading: 'きもち', meaning: 'tâm trạng, cảm xúc' },

  // === 3. TIME & ROUTINE ===
  '毎朝': { reading: 'まいあさ', meaning: 'mỗi sáng' },
  '毎晩': { reading: 'まいばん', meaning: 'mỗi tối' },
  '毎日': { reading: 'まいにち', meaning: 'mỗi ngày' },
  '毎週': { reading: 'まいしゅう', meaning: 'mỗi tuần' },
  '来週': { reading: 'らいしゅう', meaning: 'tuần tới' },
  '先週': { reading: 'せんしゅう', meaning: 'tuần trước' },
  '今週': { reading: 'こんしゅう', meaning: 'tuần này' },
  '昨日': { reading: 'きのう', meaning: 'hôm qua' },
  '明日': { reading: 'あした', meaning: 'ngày mai' },
  '今日': { reading: 'きょう', meaning: 'hôm nay' },
  '去年': { reading: 'きょねん', meaning: 'năm ngoái' },
  '今年': { reading: 'ことし', meaning: 'năm nay' },
  '来年': { reading: 'らいねん', meaning: 'năm sau' },
  '朝': { reading: 'あさ', meaning: 'buổi sáng' },
  '昼': { reading: 'ひる', meaning: 'buổi trưa' },
  '晩': { reading: 'ばん', meaning: 'buổi tối' },
  '夜': { reading: 'よる', meaning: 'ban đêm' },
  '春': { reading: 'はる', meaning: 'mùa xuân' },
  '夏': { reading: 'なつ', meaning: 'mùa hè' },
  '秋': { reading: 'あき', meaning: 'mùa thu' },
  '冬': { reading: 'ふゆ', meaning: 'mùa đông' },
  '夏休み': { reading: 'なつやすみ', meaning: 'kỳ nghỉ hè' },
  '冬休み': { reading: 'ふゆやすみ', meaning: 'kỳ nghỉ đông' },
  '新聞': { reading: 'しんぶん', meaning: 'tờ báo' },
  '雑誌': { reading: 'ざっし', meaning: 'tạp chí' },
  '本': { reading: 'ほん', meaning: 'sách' },
  '辞書': { reading: 'じしょ', meaning: 'từ điển' },
  '手紙': { reading: 'てがみ', meaning: 'lá thư' },
  '写真': { reading: 'しゃしん', meaning: 'bức ảnh' },
  '水': { reading: 'みず', meaning: 'nước' },
  'お湯': { reading: 'おゆ', meaning: 'nước nóng' },
  '牛乳': { reading: 'ぎゅうにゅう', meaning: 'sữa bò' },
  'お茶': { reading: 'おちゃ', meaning: 'trà' },
  '魚': { reading: 'さかな', meaning: 'con cá' },
  '肉': { reading: 'にく', meaning: 'thịt' },
  '犬': { reading: 'いぬ', meaning: 'con chó' },
  '猫': { reading: 'ねこ', meaning: 'con mèo' },
  '鳥': { reading: 'とり', meaning: 'con chim' },
  '子ども': { reading: 'こども', meaning: 'trẻ em' },
  '友達': { reading: 'ともだち', meaning: 'bạn bè' },
  '友だち': { reading: 'ともだち', meaning: 'bạn bè' },
  '両親': { reading: 'りょうしん', meaning: 'bố mẹ' },
  '部屋': { reading: 'へや', meaning: 'căn phòng' },
  '建物': { reading: 'たてもの', meaning: 'tòa nhà' },
  '山': { reading: 'やま', meaning: 'ngọn núi' },
  '川': { reading: 'かわ', meaning: 'dòng sông' },
  '海': { reading: 'うみ', meaning: 'biển' },
  '雨': { reading: 'あめ', meaning: 'cơn mưa' },
  '雪': { reading: 'ゆき', meaning: 'tuyết' },
  '風': { reading: 'かぜ', meaning: 'cơn gió' },
  '雲': { reading: 'くも', meaning: 'đám mây' },
  '前': { reading: 'まえ', meaning: 'phía trước' },
  '後ろ': { reading: 'うしろ', meaning: 'phía sau' },
  '中': { reading: 'なか', meaning: 'bên trong' },
  '外': { reading: 'そと', meaning: 'bên ngoài' },
  '上': { reading: 'うえ', meaning: 'phía trên' },
  '下': { reading: 'した', meaning: 'phía dưới' },
  '右': { reading: 'みぎ', meaning: 'bên phải' },
  '左': { reading: 'ひだり', meaning: 'bên trái' },
  '北': { reading: 'きた', meaning: 'hướng bắc' },
  '南': { reading: 'みなみ', meaning: 'hướng nam' },
  '東': { reading: 'ひがし', meaning: 'hướng đông' },
  '西': { reading: 'にし', meaning: 'hướng tây' },

  // === 4. COMMON VERBS ===
  '起きます': { reading: 'おきます', meaning: 'thức dậy', isCircled: true },
  '寝ます': { reading: 'ねます', meaning: 'đi ngủ', isCircled: true },
  '行きます': { reading: 'いきます', meaning: 'đi tới' },
  '来ます': { reading: 'きます', meaning: 'đến' },
  '帰ります': { reading: 'かえります', meaning: 'trở về' },
  '食べます': { reading: 'たべます', meaning: 'ăn' },
  '飲みます': { reading: 'のみます', meaning: 'uống' },
  '読みます': { reading: 'よみます', meaning: 'đọc' },
  '書きます': { reading: 'かきます', meaning: 'viết' },
  '聞きます': { reading: 'ききます', meaning: 'nghe' },
  '見ます': { reading: 'みます', meaning: 'nhìn, xem' },
  '買います': { reading: 'かいます', meaning: 'mua' },
  '売っています': { reading: 'うっています', meaning: 'đang bán' },
  '遊びました': { reading: 'あそびました', meaning: 'đã vui chơi', isCircled: true },
  '遊びます': { reading: 'あそびます', meaning: 'vui chơi' },
  '遊んでいます': { reading: 'あそんでいます', meaning: 'đang vui chơi' },
  '届きました': { reading: 'とどきました', meaning: 'đã gửi tới nơi', isCircled: true },
  '届く': { reading: 'とどく', meaning: 'gửi tới nơi' },
  '着きました': { reading: 'つきました', meaning: 'đã đến nơi' },
  '登りたい': { reading: 'のぼりたい', meaning: 'muốn leo lên' },
  '借りました': { reading: 'かりました', meaning: 'đã mượn' },
  '曲がって': { reading: 'まがって', meaning: 'hãy rẽ / quẹo' },
  '浴びます': { reading: 'あびます', meaning: 'tắm (vòi sen)' },
  '止まっています': { reading: 'とまっています', meaning: 'đang đỗ xe' },
  '働けば': { reading: 'はたらけば', meaning: 'nếu làm việc' },
  '休めます': { reading: 'やすめます', meaning: 'có thể nghỉ' },
  '落とした': { reading: 'おとした', meaning: 'đã làm rơi / mất', isCircled: true },
  '切って': { reading: 'きって', meaning: 'hãy thái / cắt', isCircled: true },
  '閉めて': { reading: 'しめて', meaning: 'hãy đóng lại' },
  '開けて': { reading: 'あけて', meaning: 'hãy mở ra' },
  '消して': { reading: 'けして', meaning: 'hãy tắt / xóa' },
  'つけて': { reading: 'つけて', meaning: 'hãy bật lên' },

  // === 5. ADJECTIVES ===
  '難しかった': { reading: 'むずかしかった', meaning: 'đã rất khó', isCircled: true },
  '難しかったですか': { reading: 'むずかしかったですか', meaning: 'đã khó phải không' },
  '難しい': { reading: 'むずかしい', meaning: 'khó khăn' },
  '易しかった': { reading: 'やさしかった', meaning: 'đã dễ dàng' },
  '易しい': { reading: 'やさしい', meaning: 'dễ dàng' },
  '楽しかった': { reading: 'たのしかった', meaning: 'đã rất vui' },
  '明るい': { reading: 'あかるい', meaning: 'sáng sủa', isCircled: true },
  '暗い': { reading: 'くらい', meaning: 'tối tăm' },
  '暑かった': { reading: 'あつかった', meaning: 'đã rất nóng', isCircled: true },
  '寒かった': { reading: 'さむかった', meaning: 'đã rất lạnh' },
  '高い': { reading: 'たかい', meaning: 'cao / đắt tiền', isCircled: true },
  '低い': { reading: 'ひくい', meaning: 'thấp' },
  '広い': { reading: 'ひろい', meaning: 'rộng rãi' },
  '狭い': { reading: 'せまい', meaning: 'chật hẹp' },
  '簡単': { reading: 'かんたん', meaning: 'đơn giản', isCircled: true },
  '複雑': { reading: 'ふくざつ', meaning: 'phức tạp' },
  '便利': { reading: 'べんり', meaning: 'tiện lợi' },
  '不便': { reading: 'ふべん', meaning: 'bất tiện' },
  '静か': { reading: 'しずか', meaning: 'yên tĩnh' },
  '賑やか': { reading: 'にぎやか', meaning: 'nhộn nhịp' },
  '急行': { reading: 'きゅうこう', meaning: 'tàu tốc hành', isCircled: true },
  '計画': { reading: 'けいかく', meaning: 'kế hoạch', isCircled: true },
  '医者': { reading: 'いしゃ', meaning: 'bác sĩ', isCircled: true },
  '災害': { reading: 'さいがい', meaning: 'thiên tai', isCircled: true },
  '署名': { reading: 'しょめい', meaning: 'ký tên, chữ ký', isCircled: true },
  '募る': { reading: 'つのる', meaning: 'chiêu mộ, kêu gọi', isCircled: true },
  '冷静': { reading: 'れいせい', meaning: 'bình tĩnh, điềm tĩnh', isCircled: true },
  '需要': { reading: 'じゅよう', meaning: 'nhu cầu tiêu dùng', isCircled: true },
  '反省': { reading: 'はんせい', meaning: 'kiểm điểm, suy ngẫm', isCircled: true },
  '設備': { reading: 'せつび', meaning: 'thiết bị, cơ sở vật chất', isCircled: true },
  '効果': { reading: 'こうか', meaning: 'hiệu quả', isCircled: true },
  '思わず': { reading: 'おもわず', meaning: 'bất giác, vô thức', isUnderlined: true },
  '直接': { reading: 'ちょくせつ', meaning: 'trực tiếp', isCircled: true },
  '間接': { reading: 'かんせつ', meaning: 'gián tiếp' },

  // === 6. DOKKAI PASSAGE & QUESTION PROMPT VOCABULARY ===
  '全部で': { reading: 'ぜんぶで', meaning: 'tổng cộng' },
  '全部': { reading: 'ぜんぶ', meaning: 'toàn bộ, tất cả' },
  'いくら': { reading: 'いくら', meaning: 'bao nhiêu tiền' },
  'なりますか': { reading: 'なりますか', meaning: 'sẽ là / hết' },
  '質問': { reading: 'しつもん', meaning: 'câu hỏi' },
  '買う': { reading: 'かう', meaning: 'mua' },
  '買おう': { reading: 'かおう', meaning: 'định mua' },
  '思います': { reading: 'おもいます', meaning: 'nghĩ rằng' },
  '行きました': { reading: 'いきました', meaning: 'đã đi đến' },
  '売っていました': { reading: 'うっていました', meaning: 'đã đang bày bán' },
  'おいしそう': { reading: 'おいしそう', meaning: 'trông ngon miệng' },
  'どうして': { reading: 'どうして', meaning: 'tại sao' },
  'よく': { reading: 'よく', meaning: 'rõ, kỹ, hay' },
  'わかった': { reading: 'わかった', meaning: 'đã hiểu' },
  'のですか': { reading: 'のですか', meaning: 'vậy?' },
  'オーストラリア人': { reading: 'オーストラリアじん', meaning: 'người Úc' },
  'おいしくない': { reading: 'おいしくない', meaning: 'không ngon' },
  'おどろきましたか': { reading: 'おどろきましたか', meaning: 'đã kinh ngạc?' },
  'おどろいた': { reading: 'おどろいた', meaning: 'đã ngạc nhiên' },
  '外国の人': { reading: 'がいこくのひと', meaning: 'người nước ngoài' },
  '何と言っていますか': { reading: 'なんといっていますか', meaning: 'đang nói gì?' },
  '起きましたか': { reading: 'おきましたか', meaning: 'đã xảy ra?' },
  'コース': { reading: 'コース', meaning: 'khóa học' },
  'なるべく': { reading: 'なるべく', meaning: 'hết sức có thể' },
  '安い': { reading: 'やすい', meaning: 'giá rẻ' },
  '早く': { reading: 'はやく', meaning: 'sớm, nhanh' },
  '帰れる': { reading: 'かえれる', meaning: 'có thể về' },
  '駅員さん': { reading: 'えきいんさん', meaning: 'nhân viên nhà ga' },
  '駅員': { reading: 'えきいん', meaning: 'nhân viên nhà ga' },
  '道に迷って': { reading: 'みちにまよって', meaning: 'bị lạc đường' },
  '教えてくれました': { reading: 'おしえてくれました', meaning: 'đã chỉ dẫn giúp' },
  '正しいもの': { reading: 'ただしいもの', meaning: 'điều đúng' },
  '正しい': { reading: 'ただしい', meaning: 'đúng' },
  'どれですか': { reading: 'どれですか', meaning: 'là cái nào?' },
  '何曜日': { reading: 'なんようび', meaning: 'thứ mấy' },
  '燃えるごみ': { reading: 'もえるごみ', meaning: 'rác cháy được' },
  '燃えないごみ': { reading: 'もえないごみ', meaning: 'rác không cháy được' },
  '出せる': { reading: 'だせる', meaning: 'có thể vứt/đưa ra' },
  '筆者': { reading: 'ひっしゃ', meaning: 'tác giả' },
  '最も': { reading: 'もっとも', meaning: 'nhất' },
  '伝えたい': { reading: 'つたえたい', meaning: 'muốn truyền đạt' },
  '求めている': { reading: 'もとめている', meaning: 'đang đòi hỏi' },
  '警鐘': { reading: 'けいしょう', meaning: 'chuông cảnh báo' }
};

export function hasKanji(text: string): boolean {
  return /[\u4e00-\u9faf]/.test(text);
}

export function katakanaToHiragana(kata: string): string {
  return kata.replace(/[\u30a1-\u30f6]/g, (ch) => {
    return String.fromCharCode(ch.charCodeAt(0) - 0x60);
  });
}

export function resolveKanjiFallback(word: string): { reading?: string; meaning?: string } {
  if (word.length === 1 && KANJI_DICTIONARY[word]) {
    const k = KANJI_DICTIONARY[word];
    const rawKun = k.kunyomi?.split(',')[0]?.replace(/\./g, '')?.replace(/-/g, '')?.trim();
    const rawOn = k.onyomi?.split(',')[0]?.trim();
    const hiraganaOn = rawOn ? katakanaToHiragana(rawOn) : '';
    const reading = rawKun || hiraganaOn || undefined;
    const meaning = k.meaning?.split(',')[0]?.trim();
    return { reading, meaning };
  }

  let compoundReading = '';
  const compoundMeanings: string[] = [];

  for (const ch of word) {
    if (KANJI_DICTIONARY[ch]) {
      const k = KANJI_DICTIONARY[ch];
      const rawOn = k.onyomi?.split(',')[0]?.trim();
      const hiraganaOn = rawOn ? katakanaToHiragana(rawOn) : '';
      compoundReading += hiraganaOn || ch;
      if (k.meaning) {
        compoundMeanings.push(k.meaning.split(',')[0].trim());
      }
    } else {
      compoundReading += ch;
    }
  }

  return {
    reading: compoundReading || undefined,
    meaning: compoundMeanings.length > 0 ? compoundMeanings.join(' ') : undefined
  };
}

/**
 * Checks if a question text is a Reading Comprehension passage (Dokkai)
 * and decomposes it cleanly into passage header, passage body, and question prompt.
 */
export function parseDokkaiQuestion(rawText: string, questionId?: string): DokkaiParsedQuestion {
  const text = rawText.trim();
  
  // Check typical Dokkai indicators:
  // - Contains 【Đọc hiểu...】 / 【短文】 / 【中文】 / 【長文】 / 【情報検索】
  // - Contains 「...」 or 質問： or Câu hỏi: or has length > 120 chars with multiple lines
  const hasDokkaiHeader = /^【(Đọc hiểu|Trung văn|Đoản văn|Tra cứu|Đoạn văn|Dokkai|短文|中文|長文|情報検索|問題|文章|案内|お知らせ)[^】]*】/i.test(text);
  const hasQuestionPrompt = /(?:Câu hỏi:|質問：|質問:|何が入りますか|どうして|どれですか|いくらになりますか|いつ働けばいいですか|何にしますか)/i.test(text);
  const isMultiParagraph = text.includes('\n\n') || text.includes('\n');
  const isLongText = text.length > 130;

  if (!hasDokkaiHeader && !hasQuestionPrompt && !isLongText) {
    return {
      isDokkai: false,
      questionPrompt: text
    };
  }

  let passageTitle: string | undefined;
  let remaining = text;

  // Extract Title Tag 【...】
  const headerMatch = remaining.match(/^【(.*?)】\s*/);
  if (headerMatch) {
    const rawInner = headerMatch[1].trim();
    // Normalize any lingering Vietnamese headers to authentic Japanese
    if (/Hoa.*Sức khỏe/i.test(rawInner)) {
      passageTitle = '【花と健康】';
    } else if (/^(Đoản văn|Đọc hiểu.*短文)/i.test(rawInner)) {
      passageTitle = '【短文】';
    } else if (/^(Trung văn|Đọc hiểu.*中文)/i.test(rawInner)) {
      passageTitle = '【中文】';
    } else if (/^(Trường văn|Bài đọc dài|Đọc hiểu.*長文)/i.test(rawInner)) {
      passageTitle = '【長文】';
    } else if (/^(Tra cứu|Tìm kiếm|Đọc hiểu.*情報検索)/i.test(rawInner)) {
      passageTitle = '【情報検索】';
    } else if (/^(Đọc hiểu|Đoạn văn|Bài đọc)/i.test(rawInner)) {
      passageTitle = '【文章】';
    } else {
      // Remove any Vietnamese prefix inside bracket like "Đoạn văn: "
      const cleanedInner = rawInner.replace(/^(Đoạn văn|Bài đọc|Đọc hiểu)[:：\s]*/i, '').trim();
      passageTitle = cleanedInner ? `【${cleanedInner}】` : '【文章】';
    }
    remaining = remaining.substring(headerMatch[0].length).trim();
  }

  // Split Reading Passage and Question Prompt
  let passageBody = '';
  let questionPrompt = remaining;

  // Split markers
  const promptSplitPatterns = [
    /\n\s*(?:Câu hỏi:|質問：|質問:)\s*/i,
    /\n\s*(?=質問[：:])/i,
    /\n\s*(?=Câu hỏi[：:])/i,
    /\n\s*(?=\[\d+\]\s*に何を入れますか)/i,
    /\n\s*(?=Sắp xếp)/i
  ];

  for (const pattern of promptSplitPatterns) {
    const parts = remaining.split(pattern);
    if (parts.length > 1) {
      passageBody = parts[0].trim();
      questionPrompt = parts.slice(1).join('\n').trim();
      // Ensure prompt uses authentic Japanese 質問：
      if (questionPrompt.startsWith('Câu hỏi:')) {
        questionPrompt = questionPrompt.replace(/^Câu hỏi:\s*/i, '質問：');
      } else if (!questionPrompt.startsWith('質問') && !questionPrompt.startsWith('[')) {
        questionPrompt = `質問：${questionPrompt}`;
      }
      break;
    }
  }

  // If no prompt split found, check if last paragraph is the question
  if (!passageBody && isMultiParagraph) {
    const lines = remaining.split(/\n+/);
    if (lines.length >= 2) {
      questionPrompt = lines[lines.length - 1].trim();
      passageBody = lines.slice(0, -1).join('\n').trim();
    }
  }

  // Look up curated Dokkai translations
  const dokkaiTrans = getDokkaiTranslation(questionId || '', text);

  // If question references a multi-question passage (e.g. d31, d32, d33 refer to d30 cake & bread, or d35 refers to d34 school)
  if (!passageBody) {
    if (questionId?.includes('d31') || questionId?.includes('d32') || questionId?.includes('d33') || remaining.includes('かれらの気持ち') || remaining.includes('パンについて') || remaining.includes('こんなことが起きました')) {
      passageBody = '日本のケーキはあまくないからおいしくないとオーストラリア人から言われたときにはおどろいた。わたしは日本のケーキほどおいしいケーキはないと思っていたからだ。バンクーバーで一番おいしいと言われているケーキを食べたことがある。あまい物が大好きなのにあますぎて食べられなかったのだ。そのとき初めてかれらの気持ちがよくわかった。\n日本のパンはやわらかすぎて食べた気がしない、国で食べていたようなかたいパンが食べたくなるとよく言っている。日本人は食べることにとてもきょうみがある。だからいろいろな国の食べ物をとり入れる。そしてそれを自分の好きなようにかえてしまう。それてさいしょのものとはちがってしまうということがたびたび起こる。';
    } else if (questionId?.includes('d35') || remaining.includes('メイさんはなるべく安いコース')) {
      passageBody = 'アリさんとメイさんは日本語が習いたいです。会社の仕事は９時から５時までです。アリさんは５時に帰れますが、メイさんは毎日のように７時まで働かなければならないことが多いです。金曜日はアリさんはよく友だちとおさけを飲みに行きます。メイさんは木曜日にダンス教室に行っています。\n\n【東日本語学校】（週2回コース：18,000円）\n・月・木：クラスA（18:00〜19:20）、クラスB（19:30〜20:50）\n・火・金：クラスC（18:00〜19:20）、クラスD（19:30〜20:50）\n\n【南日本語学校】（週2回コース：20,000円）\n・月・木：クラスI（17:30〜18:50）、クラスJ（19:00〜20:20）\n・火・金：クラスK（17:30〜18:50）、クラスL（19:00〜20:20）\n\n【北日本語学校】（週2回コース：19,000円）\n・月・木：クラスE（18:00〜19:20）、クラスF（19:30〜20:50）\n・火・金：クラスG（18:00〜19:20）、クラスH（19:30〜20:50）';
    }
  }

  // If still no passage body, use remaining as prompt
  if (!passageBody) {
    return {
      isDokkai: hasDokkaiHeader || isLongText,
      passageTitle,
      passageBody: undefined,
      questionPrompt: remaining,
      passageTranslation: dokkaiTrans?.passageTranslation,
      questionTranslation: dokkaiTrans?.questionTranslation,
      sentenceBreakdown: dokkaiTrans?.sentenceBreakdown
    };
  }

  // Tokenize passage body into Ruby chunks for reading without breaking layout
  const passageChunks = tokenizePassageToRubyChunks(passageBody);

  return {
    isDokkai: true,
    passageTitle,
    passageBody,
    passageChunks,
    questionPrompt,
    passageTranslation: dokkaiTrans?.passageTranslation,
    questionTranslation: dokkaiTrans?.questionTranslation,
    sentenceBreakdown: dokkaiTrans?.sentenceBreakdown
  };
}

/**
 * Tokenizes a long Japanese reading passage into Ruby text chunks
 * so Kanji words display Furigana on top while preserving sentences and typography.
 */
export function tokenizePassageToRubyChunks(passage: string): PassageRubyChunk[] {
  const chunks: PassageRubyChunk[] = [];
  let remaining = passage;

  const sortedKeys = Object.keys(JLPT_VOCAB_DB).sort((a, b) => b.length - a.length);

  while (remaining.length > 0) {
    // 1. Check known dictionary entries
    let matchedKey: string | null = null;
    for (const key of sortedKeys) {
      if (remaining.startsWith(key)) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      const entry = JLPT_VOCAB_DB[matchedKey];
      const isWithKanji = hasKanji(matchedKey);
      chunks.push({
        text: matchedKey,
        furigana: isWithKanji ? entry.reading : undefined,
        isKanji: isWithKanji,
        meaning: entry.meaning
      });
      remaining = remaining.substring(matchedKey.length);
      continue;
    }

    // 2. Check Kanji chunk
    const kanjiMatch = remaining.match(/^[\u4e00-\u9faf]+/);
    if (kanjiMatch) {
      const kanjiWord = kanjiMatch[0];
      const fallback = resolveKanjiFallback(kanjiWord);
      chunks.push({
        text: kanjiWord,
        furigana: fallback.reading,
        isKanji: true,
        meaning: fallback.meaning
      });
      remaining = remaining.substring(kanjiWord.length);
      continue;
    }

    // 3. Check Hiragana / Katakana / Symbols / Punctuation
    const nonKanjiMatch = remaining.match(/^[^\u4e00-\u9faf]+/);
    if (nonKanjiMatch) {
      const plainText = nonKanjiMatch[0];
      chunks.push({
        text: plainText,
        furigana: undefined,
        isKanji: false
      });
      remaining = remaining.substring(plainText.length);
      continue;
    }

    // Fallback single character
    chunks.push({
      text: remaining[0],
      isKanji: false
    });
    remaining = remaining.substring(1);
  }

  return chunks;
}

/**
 * Parses and tokenizes a Japanese question sentence into distinct semantic tokens:
 * - TOP ANNOTATION: Furigana (Hiragana reading for Kanji) - Blue
 * - BOTTOM ANNOTATION: Vietnamese meaning for words - Blue
 */
export function annotateSentence(
  rawSentence: string,
  question: ExamQuestion,
  userAnswer?: number
): DirectSentenceAnnotationResult {
  // 1. Check for Dokkai question
  const dokkaiData = (question.section === 'dokkai' || rawSentence.length > 120 || rawSentence.includes('【Đọc hiểu')) 
    ? parseDokkaiQuestion(rawSentence, question.id)
    : undefined;

  const sentenceToAnnotate = (dokkaiData && dokkaiData.isDokkai && dokkaiData.questionPrompt) 
    ? dokkaiData.questionPrompt 
    : rawSentence.trim();

  const tokens: AnnotatedToken[] = [];
  const correctOptionText = question.options[question.correctIndex] || '';

  // Check if there is an explicit target word in brackets 【...】 or [...]
  const bracketMatch = sentenceToAnnotate.match(/【(.*?)】/) || sentenceToAnnotate.match(/\[(.*?)\]/);
  const targetWordInBrackets = bracketMatch ? bracketMatch[1] : '';

  let remaining = sentenceToAnnotate;
  let tokenIdx = 0;

  const sortedKeys = Object.keys(JLPT_VOCAB_DB).sort((a, b) => b.length - a.length);

  while (remaining.length > 0) {
    // 1. Check for bracketed target word
    if (remaining.startsWith('【') || remaining.startsWith('[')) {
      const closeChar = remaining.startsWith('【') ? '】' : ']';
      const closeIdx = remaining.indexOf(closeChar);
      if (closeIdx !== -1) {
        const word = remaining.substring(1, closeIdx);
        const dictEntry = JLPT_VOCAB_DB[word];
        const kanjiFallback = hasKanji(word) ? resolveKanjiFallback(word) : {};
        
        // TOP is always Furigana (reading)
        const reading = (question.section === 'moji-goi' && correctOptionText && hasKanji(word)) 
          ? correctOptionText 
          : (dictEntry?.reading || (hasKanji(word) ? (kanjiFallback.reading || word) : undefined));

        // BOTTOM is Vietnamese meaning
        const meaning = dictEntry?.meaning || 
                        extractMeaningFromExplanation(question.explanation || '') || 
                        kanjiFallback.meaning || 
                        undefined;

        tokens.push({
          id: `tok-${tokenIdx++}`,
          text: word,
          topAnnotation: reading,
          bottomAnnotation: meaning || undefined,
          isTarget: true,
          isCircled: true,
          isUnderlined: false
        });

        remaining = remaining.substring(closeIdx + 1);
        continue;
      }
    }

    // 2. Check for blank （　　）
    if (remaining.startsWith('（　　）') || remaining.startsWith('（  ）') || remaining.startsWith('（ ）') || remaining.startsWith('（）') || remaining.startsWith('____')) {
      const isUnderline = remaining.startsWith('____');
      const blankLength = isUnderline ? 4 : (remaining.startsWith('（　　）') ? 4 : remaining.startsWith('（  ）') ? 4 : remaining.startsWith('（ ）') ? 3 : 2);
      const optMeaning = JLPT_VOCAB_DB[correctOptionText]?.meaning || 
                         extractMeaningFromExplanation(question.explanation || '') || 
                         'đáp án đúng';
      
      tokens.push({
        id: `tok-${tokenIdx++}`,
        text: isUnderline ? '____' : '（　　）',
        topAnnotation: correctOptionText,
        bottomAnnotation: optMeaning,
        isTarget: true,
        isCircled: true,
        isGrammar: true
      });
      remaining = remaining.substring(blankLength);
      continue;
    }

    // 3. Match longest known vocab from dictionary
    let matchedKey: string | null = null;
    for (const key of sortedKeys) {
      if (remaining.startsWith(key)) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      const entry = JLPT_VOCAB_DB[matchedKey];
      const isTarget = matchedKey === targetWordInBrackets || (correctOptionText && matchedKey === correctOptionText);

      let topAnn: string | undefined = undefined;
      if (hasKanji(matchedKey)) {
        topAnn = entry.reading;
      }
      if (isTarget && correctOptionText && hasKanji(matchedKey)) {
        topAnn = correctOptionText;
      }

      const botAnn: string | undefined = entry.meaning || undefined;

      tokens.push({
        id: `tok-${tokenIdx++}`,
        text: matchedKey,
        topAnnotation: topAnn,
        bottomAnnotation: botAnn,
        isTarget,
        isCircled: Boolean(entry.isCircled || isTarget),
        isUnderlined: Boolean(entry.isUnderlined),
        isGrammar: false
      });

      remaining = remaining.substring(matchedKey.length);
      continue;
    }

    // 4. Match common particles & auxiliaries
    const particleMatch = remaining.match(/^(の|は|が|を|に|で|へ|と|より|から|まで|も|や|か|ば|て|で|た|だ|ない|です|ます|でした|ました|ている|てある|ておく|よう|そう|らしい|たら|なら|ば|のに|ので|から|けど|けれど)/);
    if (particleMatch) {
      const p = particleMatch[0];
      tokens.push({
        id: `tok-${tokenIdx++}`,
        text: p,
        topAnnotation: undefined,
        bottomAnnotation: undefined,
        isUnderlined: false
      });

      remaining = remaining.substring(p.length);
      continue;
    }

    // 5. Match Kanji chunk
    const kanjiMatch = remaining.match(/^[\u4e00-\u9faf]+/);
    if (kanjiMatch) {
      const kanjiWord = kanjiMatch[0];
      const isTarget = kanjiWord === targetWordInBrackets;
      const kanjiFallback = resolveKanjiFallback(kanjiWord);

      const topAnn = isTarget && correctOptionText 
        ? correctOptionText 
        : kanjiFallback.reading;
      
      const botAnn = isTarget 
        ? (extractMeaningFromExplanation(question.explanation || '') || kanjiFallback.meaning || undefined)
        : (kanjiFallback.meaning || undefined);

      tokens.push({
        id: `tok-${tokenIdx++}`,
        text: kanjiWord,
        topAnnotation: topAnn,
        bottomAnnotation: botAnn,
        isTarget,
        isCircled: isTarget
      });
      remaining = remaining.substring(kanjiWord.length);
      continue;
    }

    // 6. Match Kana chunk / punctuation / words
    const miscMatch = remaining.match(/^[ぁ-んァ-ヶa-zA-Z0-9０-９、。\s…「」『』・？！?!]+/);
    if (miscMatch) {
      const misc = miscMatch[0];
      tokens.push({
        id: `tok-${tokenIdx++}`,
        text: misc
      });
      remaining = remaining.substring(misc.length);
      continue;
    }

    // Fallback 1 char
    tokens.push({
      id: `tok-${tokenIdx++}`,
      text: remaining[0]
    });
    remaining = remaining.substring(1);
  }

  // 7. Generate Option Annotations with Correct Colors (Green for correct, Red for wrong)
  const isDokkaiQuestion = question.section === 'dokkai' || Boolean(dokkaiData?.isDokkai);
  const isBunpouQuestion = question.section === 'bunpou';
  const bunpouDetail = getBunpouDetail(question.id);
  const choukaiDetail = getChoukaiDetail(question.id);

  const annotatedOptions: AnnotatedOption[] = question.options.map((opt, idx) => {
    const isCorrect = idx === question.correctIndex;
    const isUserSelected = userAnswer === idx;

    let handwrittenNote = '';
    const statusTag = isCorrect ? '⭕ ĐÚNG' : '❌ SAI';

    // Prioritize dedicated Bunpou database
    if (bunpouDetail) {
      const optDetail = bunpouDetail.options.find(o => o.index === idx);
      if (optDetail) {
        handwrittenNote = optDetail.reason;
      }
    } else if (choukaiDetail) {
      const optDetail = choukaiDetail.optionsAnalysis.find(o => o.index === idx);
      if (optDetail) {
        handwrittenNote = `${optDetail.textVi}: ${optDetail.reason}`;
      }
    } else if (isCorrect) {
      if (isDokkaiQuestion) {
        handwrittenNote = '⭕ Đúng với nội dung bài đọc';
        const optMeaning = JLPT_VOCAB_DB[opt]?.meaning;
        if (optMeaning) {
          handwrittenNote += ` (${optMeaning})`;
        }
      } else if (isBunpouQuestion) {
        const expl = extractGrammarTip(question.explanation || '');
        handwrittenNote = expl ? `⭕ Đúng ngữ pháp: ${expl}` : '⭕ Đúng cấu trúc ngữ pháp';
      } else {
        // Moji-Goi
        const dictMeaning = JLPT_VOCAB_DB[opt]?.meaning || 
                            extractMeaningFromExplanation(question.explanation || '') || 
                            'đáp án chính xác';
        handwrittenNote = dictMeaning;
      }
    } else {
      // Wrong option
      if (isDokkaiQuestion) {
        handwrittenNote = getDokkaiOptionError(opt, correctOptionText);
      } else if (isBunpouQuestion) {
        handwrittenNote = getBunpouOptionError(opt, correctOptionText);
      } else {
        handwrittenNote = getOptionHandwrittenError(opt, correctOptionText);
      }
    }

    return {
      index: idx,
      optionText: opt,
      isCorrect,
      isUserSelected,
      handwrittenNote,
      statusTag
    };
  });

  // Extract full sentence meaning (Blue)
  let fullSentenceMeaning = '';
  if (bunpouDetail) {
    fullSentenceMeaning = bunpouDetail.fullSentenceTranslation;
  } else if (choukaiDetail) {
    fullSentenceMeaning = choukaiDetail.questionVi;
  } else if (dokkaiData?.questionTranslation) {
    fullSentenceMeaning = dokkaiData.questionTranslation;
  } else if (question.explanation?.includes('Cả câu:') || question.explanation?.includes('cả câu:')) {
    const parts = question.explanation.split(/(?:Cả câu:|cả câu:)/i);
    if (parts[1]) fullSentenceMeaning = parts[1].split('.')[0].trim();
  }
  if (!fullSentenceMeaning && question.hint && !question.hint.startsWith('Chọn') && !question.hint.startsWith('Cách đọc') && !question.hint.startsWith('Điền dạng') && question.section !== 'dokkai') {
    fullSentenceMeaning = question.hint;
  }
  if (!fullSentenceMeaning) {
    const meaningfulTokens = tokens.filter(t => t.bottomAnnotation).map(t => t.bottomAnnotation).join(' ');
    fullSentenceMeaning = meaningfulTokens ? `Dịch sơ bộ: ${meaningfulTokens}.` : 'Câu hỏi kiểm tra kiến thức JLPT chuẩn.';
  }

  return {
    tokens,
    options: annotatedOptions,
    fullSentenceMeaning,
    coreRule: question.explanation || 'Nắm vững kiến thức, biến âm và cấu trúc câu trong đề thi JLPT.',
    dokkaiData
  };
}

/**
 * Generates accurate error notes for Dokkai options
 */
function getDokkaiOptionError(opt: string, correct: string): string {
  if (opt.length < 5) {
    return '✕ Không phù hợp điều kiện câu hỏi';
  }
  // Check if option says "không..." vs "có..."
  if (opt.includes('ない') || opt.includes('なかった') || opt.includes('ません')) {
    return '✕ Sai chi tiết phủ định / Không đúng thực tế bài đọc';
  }
  if (opt.includes('一番') || opt.includes('ばかり') || opt.includes('だけ')) {
    return '✕ Tuyệt đối hóa quá mức / Không có trong bài';
  }
  return '✕ Thông tin sai lệch với nội dung bài viết';
}

/**
 * Generates error notes for Bunpou grammar options
 */
function getBunpouOptionError(opt: string, correct: string): string {
  if (['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'より', 'から', 'まで', 'も'].includes(opt)) {
    return `✕ Sai trợ từ (${opt})`;
  }
  if (opt.includes('て') && !correct.includes('て')) {
    return '✕ Sai thể nối (Thể Te không phù hợp)';
  }
  if (opt.includes('ない') && !correct.includes('ない')) {
    return '✕ Sai thể phủ định (Nai)';
  }
  if (opt.includes('た') && !correct.includes('た')) {
    return '✕ Sai thì quá khứ (Ta)';
  }
  const meaning = JLPT_VOCAB_DB[opt]?.meaning;
  if (meaning) {
    return `✕ "${opt}" mang nghĩa: ${meaning}`;
  }
  return '✕ Cấu trúc không phù hợp ngữ cảnh';
}

/**
 * Generates authentic error notes for Moji-Goi options
 */
function getOptionHandwrittenError(opt: string, correct: string): string {
  if (correct.includes('う') && !opt.includes('う')) {
    return '✕ thiếu trường âm (う)';
  }
  if (!correct.includes('う') && opt.includes('う')) {
    return '✕ thừa trường âm (う)';
  }
  if (correct.includes('い') && !opt.includes('い')) {
    return '✕ thiếu trường âm (い)';
  }
  if (!correct.includes('い') && opt.includes('い')) {
    return '✕ thừa trường âm (い)';
  }
  if (correct.includes('っ') && !opt.includes('っ')) {
    return '✕ thiếu âm ngắt (っ)';
  }
  if (!correct.includes('っ') && opt.includes('っ')) {
    return '✕ thừa âm ngắt (っ)';
  }

  const voicedPairs: [string, string][] = [
    ['か', 'が'], ['き', 'ぎ'], ['く', 'ぐ'], ['け', 'げ'], ['こ', 'ご'],
    ['さ', 'ざ'], ['し', 'じ'], ['す', 'ず'], ['せ', 'ぜ'], ['そ', 'ぞ'],
    ['た', 'だ'], ['ち', 'ぢ'], ['つ', 'づ'], ['て', 'で'], ['と', 'ど'],
    ['は', 'ば'], ['ひ', 'び'], ['ふ', 'ぶ'], ['へ', 'べ'], ['ほ', 'ぼ'],
    ['は', 'ぱ'], ['ひ', 'ぴ'], ['ふ', 'ぷ'], ['へ', 'ぺ'], ['ほ', 'ぽ'],
    ['ちょ', 'じょ'], ['ちゃ', 'じゃ'], ['ちゅ', 'じゅ']
  ];

  for (const [plain, voiced] of voicedPairs) {
    if (correct.includes(plain) && opt.includes(voiced)) {
      return `✕ sai âm đục (${voiced} ➔ ${plain})`;
    }
    if (correct.includes(voiced) && opt.includes(plain)) {
      return `✕ thiếu âm đục (${plain} ➔ ${voiced})`;
    }
  }

  if (['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'より', 'から', 'まで', 'も'].includes(opt)) {
    return `✕ sai trợ từ (${opt})`;
  }

  const wrongMeaning = JLPT_VOCAB_DB[opt]?.meaning;
  if (wrongMeaning) {
    return `✕ nghĩa là "${wrongMeaning}"`;
  }

  if (hasKanji(opt)) {
    const kanjiFallback = resolveKanjiFallback(opt);
    if (kanjiFallback.meaning) {
      return `✕ chữ Hán nghĩa là "${kanjiFallback.meaning}"`;
    }
    return '✕ sai chữ Kanji';
  }

  return '✕ sai cách đọc';
}

function extractMeaningFromExplanation(explanation: string): string {
  if (!explanation) return '';
  const match = explanation.match(/nghĩa là ["“']?([^"”'.]+)["”']?/i) || 
                explanation.match(/có nghĩa là ["“']?([^"”'.]+)["”']?/i) ||
                explanation.match(/=\s*([^()]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return '';
}

function extractGrammarTip(explanation: string): string {
  if (!explanation) return '';
  const match = explanation.match(/([VNA][-A-Za-zぁ-んァ-ヶ~〜]*\s*:[^.]+)/i) ||
                explanation.match(/Cấu trúc:?\s*([^.]+)/i) ||
                explanation.match(/（[^）]+）:\s*([^.]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return '';
}
