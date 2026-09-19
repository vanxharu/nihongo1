import { GrammarItem } from '../types';

export const LESSON_THEMES_MAP: Record<string, Record<number, string>> = {
  N5: {
    1: 'Giới thiệu bản thân (Thì, là)',
    2: 'Chỉ từ đại từ (Đây, đó, kia là...)',
    3: 'Địa điểm, vị trí (Chỗ này, chỗ đó...)',
    4: 'Giờ giấc & Thời gian (Thức dậy lúc...)',
    5: 'Di chuyển (Đi, đến, về bằng...)',
    6: 'Hành động, tác động (Ăn cơm, uống trà...)',
    7: 'Công cụ & Cho nhận (Bằng phương tiện gì...)',
    8: 'Tính từ cơ bản (Đẹp, lạnh, nóng...)',
    9: 'Sở thích & Năng lực (Thích, giỏi...)',
    10: 'Tồn tại (Có ở đâu...)',
    11: 'Số lượng & Đơn vị đếm (Bao nhiêu cái...)',
    12: 'Quá khứ tính từ (Hôm qua nóng...)',
    13: 'Mong muốn & Ước muốn (Muốn có, muốn làm...)',
    14: 'Thể Te & Hãy làm (Đang làm, hãy làm...)',
    15: 'Cho phép & Cấm đoán (Được làm, cấm làm...)',
    16: 'Nối câu liên tục (Làm việc này rồi việc kia...)',
    17: 'Thể Nai & Phải làm (Không được, phải làm...)',
    18: 'Thể từ điển & Có thể (Sở thích là, có thể...)',
    19: 'Thể Ta & Đã từng (Đã từng, khuyên bảo...)',
    20: 'Thể thông thường (Cách nói suồng sã...)',
    21: 'Ý kiến & Phán đoán (Nghĩ là, nói là...)',
    22: 'Định ngữ bổ nghĩa (Mệnh đề quan hệ...)',
    23: 'Lúc, khi & Hễ (Khi làm việc này...)',
    24: 'Cho nhận hành động (Làm hộ ai đó...)',
    25: 'Điều kiện giả định (Nếu, cho dù...)'
  },
  N4: {
    26: 'Nhấn mạnh & Nhờ vả lịch sự (んです)',
    27: 'Khả năng & Giới hạn (Thể khả năng)',
    28: 'Đồng thời & Lý do (Vừa làm vừa...)',
    29: 'Trạng thái tự phát & Hoàn thành (Mở sẵn, lỡ...)',
    30: 'Chuẩn bị & Kết quả (Làm sẵn...)',
    31: 'Ý định & Kế hoạch (Thể ý chí...)',
    32: 'Khuyên bảo & Dự đoán (Nên làm...)',
    33: 'Mệnh lệnh & Cấm chỉ (Làm đi, cấm...)',
    34: 'Theo như & Sau khi (Làm theo...)',
    35: 'Điều kiện Ba & Nara (Nếu...)',
    36: 'Mục đích & Biến đổi (Cố gắng sao cho...)',
    37: 'Bị động (Bị, được ai làm gì...)',
    38: 'Danh từ hóa (Việc học, việc làm...)',
    39: 'Nguyên nhân & Lý do (Vì...)',
    40: 'Câu hỏi lồng & Thử làm (Thử...)',
    41: 'Cho nhận kính ngữ (Biếu, tặng...)',
    42: 'Mục đích hành động (Để dùng cho...)',
    43: 'Sắp xảy ra & Vẻ bề ngoài (Trông có vẻ...)',
    44: 'Quá mức & Dễ khó (Làm quá...)',
    45: 'Trường hợp & Dù (Nếu lỡ...)',
    46: 'Vừa mới & Sắp sửa (Chuẩn bị làm...)',
    47: 'Nghe nói & Hình như (Nghe nói...)',
    48: 'Sai khiến (Bắt làm, cho phép...)',
    49: 'Tôn kính ngữ (Kính ngữ đối phương...)',
    50: 'Khiêm nhường ngữ (Hạ mình kính cẩn...)'
  },
  N3: {
    1: 'Trong lúc & Tranh thủ (〜うちに)',
    2: 'Ngay sau khi (〜たとたん)',
    3: 'Có nguy cơ, e là (〜おそれがある)',
    4: 'Chỉ giới hạn (〜にかぎり)',
    5: 'Thảo nào, giải thích (〜わけだ)',
    6: 'Toàn là, chỉ là (〜ばかり)',
    7: 'Đứng trên lập trường (〜にしては)',
    8: 'Không hẳn là (〜わけではない)',
    9: 'So với, đối với (〜にくらべて)',
    10: 'Thay vì, đổi lại (〜かわりに)',
    11: 'Cho dù, ngay cả (〜たとえ〜ても)',
    12: 'Tập trung vào (〜を中心に)',
    13: 'Thông qua, suốt (〜を通じて)',
    14: 'Hướng tới, dành cho (〜向け)',
    15: 'Tùy thuộc vào (〜によって)',
    16: 'Chắc chắn là (〜に違いない)',
    17: 'Nghe nói là (〜ということだ)',
    18: 'Không thể làm (〜わけにはいかない)',
    19: 'Càng... càng... (〜ば〜ほど)'
  },
  N2: {
    1: 'Ngay khi làm V (〜次第)',
    2: 'Dưới sự hướng dẫn (〜のもとで)',
    3: 'Chỉ vì nguyên nhân (〜ばかりに)',
    4: 'Cho dù thế nào (〜ようがない)',
    5: 'Không thể không (〜ざるを得ない)',
    6: 'Không chỉ... mà còn (〜のみならず)',
    7: 'Trái ngược với (〜反面)',
    8: 'Đứng trên cương vị (〜から言うと)',
    9: 'Xem nhẹ, bỏ qua (〜はともかく)',
    10: 'Bất kể, không màng (〜にかかわらず)'
  },
  N1: {
    1: 'Cùng với sự biến đổi (〜に伴って)',
    2: 'Ngay khi vừa dứt (〜や否や)',
    3: 'Chính vì lý do (〜ならでは)',
    4: 'Dẫu cho là (〜であれ)'
  }
};

export const FALLBACK_PATTERNS: Record<string, Record<number, Omit<GrammarItem, 'id' | 'level'>[]>> = {
  N5: {
    1: [
      {
        structure: 'N1 は N2 です',
        meaning: 'N1 là N2',
        explanation: 'Dùng trợ từ は để đánh dấu chủ ngữ/chủ đề và kết thúc bằng です để khẳng định danh từ N2.',
        exampleSentence: '私は学生です。',
        exampleTranslation: 'Tôi là học sinh.',
        wordsToReorder: ['学生', 'です', '私は'],
        correctSentence: '私は学生です。'
      },
      {
        structure: 'N1 は N2 じゃありません',
        meaning: 'N1 không phải là N2',
        explanation: 'Dạng phủ định thân mật của です trong giao tiếp hàng ngày. Lịch sự hơn là ではありません.',
        exampleSentence: '私は医者じゃありません。',
        exampleTranslation: 'Tôi không phải là bác sĩ.',
        wordsToReorder: ['医者じゃ', 'ありません', '私は'],
        correctSentence: '私は医者じゃありません。'
      },
      {
        structure: 'N1 は N2 ですか',
        meaning: 'N1 có phải là N2 không?',
        explanation: 'Thêm trợ từ か ở cuối câu để tạo thành câu hỏi xác nhận.',
        exampleSentence: '山田さんは先生ですか。',
        exampleTranslation: 'Anh Yamada có phải là giáo viên không?',
        wordsToReorder: ['先生ですか', '山田さんは'],
        correctSentence: '山田さんは先生ですか。'
      },
      {
        structure: 'N1 も N2 です',
        meaning: 'N1 cũng là N2',
        explanation: 'Trợ từ も mang nghĩa "cũng", dùng để thay thế cho は khi có cùng tính chất với đối tượng trước đó.',
        exampleSentence: 'サントスさんも会社員です。',
        exampleTranslation: 'Anh Santos cũng là nhân viên công ty.',
        wordsToReorder: ['サントスさんも', '会社員です'],
        correctSentence: 'サントスさんも会社員です。'
      }
    ],
    2: [
      {
        structure: 'これ / それ / あれ は N です',
        meaning: 'Đây / Đó / Kia là N',
        explanation: 'Chỉ từ đại từ dùng để chỉ đồ vật ở gần người nói (これ), gần người nghe (それ), hoặc xa cả hai (あれ).',
        exampleSentence: 'これは日本語の本です。',
        exampleTranslation: 'Đây là quyển sách tiếng Nhật.',
        wordsToReorder: ['日本語の', '本です', 'これは'],
        correctSentence: 'これは日本語の本です。'
      },
      {
        structure: 'この / その / あの + N は 〜です',
        meaning: 'Cái N này / đó / kia thì...',
        explanation: 'Chỉ từ bổ nghĩa trực tiếp cho danh từ đứng liền sau.',
        exampleSentence: 'この傘は私のです。',
        exampleTranslation: 'Chiếc ô này là của tôi.',
        wordsToReorder: ['私のです', 'この傘は'],
        correctSentence: 'この傘は私のです。'
      },
      {
        structure: 'そうです / そうじゃありません',
        meaning: 'Đúng vậy / Không phải như vậy',
        explanation: 'Cách trả lời ngắn gọn khi xác nhận thông tin danh từ trong câu hỏi.',
        exampleSentence: 'はい、そうです。',
        exampleTranslation: 'Vâng, đúng như vậy.',
        wordsToReorder: ['はい、', 'そうです'],
        correctSentence: 'はい、そうです。'
      }
    ],
    3: [
      {
        structure: 'ここ / そこ / あそこ は [Địa điểm] です',
        meaning: 'Chỗ này / Chỗ đó / Chỗ kia là...',
        explanation: 'Đại từ chỉ địa điểm vị trí trong không gian: ここ (gần người nói), そこ (gần người nghe), あそこ (xa cả hai).',
        exampleSentence: 'ここは教室です。',
        exampleTranslation: 'Chỗ này là phòng học.',
        wordsToReorder: ['ここは', '教室', 'です'],
        correctSentence: 'ここは教室です。'
      },
      {
        structure: 'N は [Địa điểm] です',
        meaning: 'N ở tại [Địa điểm]',
        explanation: 'Dùng để diễn đạt đồ vật hoặc người đang ở vị trí nào.',
        exampleSentence: 'お手洗いはあそこです。',
        exampleTranslation: 'Nhà vệ sinh ở đằng kia.',
        wordsToReorder: ['お手洗いは', 'あそこです'],
        correctSentence: 'お手洗いはあそこです。'
      },
      {
        structure: 'こちら / そちら / あちら は 〜です',
        meaning: 'Phía này / Phía đó / Phía kia là... (Lịch sự)',
        explanation: 'Cách nói lịch sự, trang trọng hơn của ここ/そこ/あそこ, dùng để chỉ phương hướng hoặc giới thiệu người.',
        exampleSentence: '事務所はこちらです。',
        exampleTranslation: 'Văn phòng ở phía bên này ạ.',
        wordsToReorder: ['事務所は', 'こちらです'],
        correctSentence: '事務所はこちらです。'
      }
    ],
    4: [
      {
        structure: '今 〜時 〜分 です',
        meaning: 'Bây giờ là... giờ... phút',
        explanation: 'Cách hỏi và trả lời về giờ giấc thời gian hiện tại.',
        exampleSentence: '今、午前9時30分です。',
        exampleTranslation: 'Bây giờ là 9 giờ 30 phút sáng.',
        wordsToReorder: ['今、', '午前9時30分です'],
        correctSentence: '今、午前9時30分です。'
      },
      {
        structure: '[Thời gian] に V-masu',
        meaning: 'Làm V vào lúc [Thời gian]',
        explanation: 'Trợ từ に đi kèm sau danh từ chỉ thời gian có con số cụ thể.',
        exampleSentence: '毎朝6時に起きます。',
        exampleTranslation: 'Mỗi sáng tôi thức dậy lúc 6 giờ.',
        wordsToReorder: ['毎朝6時に', '起きます'],
        correctSentence: '毎朝6時に起きます。'
      },
      {
        structure: '〜から 〜まで',
        meaning: 'Từ... đến...',
        explanation: 'Biểu thị điểm bắt đầu (から) và điểm kết thúc (まで) của thời gian hoặc không gian.',
        exampleSentence: '会社は9時から5時までです。',
        exampleTranslation: 'Công ty làm việc từ 9 giờ đến 5 giờ.',
        wordsToReorder: ['会社は', '9時から5時までです'],
        correctSentence: '会社は9時から5時までです。'
      }
    ],
    5: [
      {
        structure: '[Địa điểm] へ 行きます / 来ます / 帰ります',
        meaning: 'Đi / Đến / Về [Địa điểm]',
        explanation: 'Trợ từ へ (đọc là "e") chỉ hướng di chuyển đến địa điểm đích.',
        exampleSentence: '来週日本へ行きます。',
        exampleTranslation: 'Tuần sau tôi sẽ đi Nhật Bản.',
        wordsToReorder: ['来週', '日本へ', '行きます'],
        correctSentence: '来週日本へ行きます。'
      },
      {
        structure: '[Phương tiện] で 行きます',
        meaning: 'Đi bằng [Phương tiện]',
        explanation: 'Trợ từ で đứng sau phương tiện giao thông để chỉ phương thức di chuyển (ngoại trừ 歩いて = đi bộ).',
        exampleSentence: '電車で会社へ行きます。',
        exampleTranslation: 'Tôi đi đến công ty bằng tàu điện.',
        wordsToReorder: ['電車で', '会社へ', '行きます'],
        correctSentence: '電車で会社へ行きます。'
      },
      {
        structure: '[Người] と 行きます',
        meaning: 'Đi cùng với [Người]',
        explanation: 'Trợ từ と dùng để chỉ người cùng tham gia thực hiện hành động.',
        exampleSentence: '友達と京都へ行きました。',
        exampleTranslation: 'Tôi đã đi Kyoto cùng với bạn bè.',
        wordsToReorder: ['友達と', '京都へ', '行きました'],
        correctSentence: '友達と京都へ行きました。'
      }
    ],
    6: [
      {
        structure: '[Tân ngữ] を V-masu',
        meaning: 'Làm [Hành động] đối với [Tân ngữ]',
        explanation: 'Trợ từ を chỉ đối tượng trực tiếp tiếp nhận hành động của ngoại động từ.',
        exampleSentence: '毎朝パンを食べます。',
        exampleTranslation: 'Mỗi sáng tôi ăn bánh mì.',
        wordsToReorder: ['毎朝', 'パンを', '食べます'],
        correctSentence: '毎朝パンを食べます。'
      },
      {
        structure: '[Địa điểm] で V-masu',
        meaning: 'Làm [Hành động] tại [Địa điểm]',
        explanation: 'Trợ từ で chỉ nơi chốn cụ thể diễn ra một hành động.',
        exampleSentence: '図書館で本を読みます。',
        exampleTranslation: 'Tôi đọc sách ở thư viện.',
        wordsToReorder: ['図書館で', '本を', '読みます'],
        correctSentence: '図書館で本を読みます。'
      },
      {
        structure: 'いっしょに V-masen ka / V-mashou',
        meaning: 'Cùng làm V với tôi nhé? / Cùng làm V nào!',
        explanation: 'Cách nói mời mọc, rủ rê đối phương cùng thực hiện một hoạt động vui vẻ.',
        exampleSentence: 'いっしょにお茶を飲みませんか。',
        exampleTranslation: 'Bạn có muốn cùng uống trà với tôi không?',
        wordsToReorder: ['いっしょに', 'お茶を', '飲みませんか'],
        correctSentence: 'いっしょにお茶を飲みませんか。'
      }
    ],
    7: [
      {
        structure: '[Công cụ / Ngôn ngữ] で V-masu',
        meaning: 'Làm V bằng [Công cụ / Ngôn ngữ]',
        explanation: 'Trợ từ で chỉ công cụ, phương tiện, phương pháp hoặc ngôn ngữ dùng để thực hiện hành động.',
        exampleSentence: 'はしでご飯を食べます。',
        exampleTranslation: 'Tôi ăn cơm bằng đũa.',
        wordsToReorder: ['はしで', 'ご飯を', '食べます'],
        correctSentence: 'はしでご飯を食べます。'
      },
      {
        structure: '[Người] に [Vật] を あげます / もらいます',
        meaning: 'Tặng cho ai... / Nhận từ ai...',
        explanation: 'Chỉ hành động trao tặng (あげます) hoặc nhận đồ vật (もらいます) từ người khác.',
        exampleSentence: '母に花をあげました。',
        exampleTranslation: 'Tôi đã tặng hoa cho mẹ.',
        wordsToReorder: ['母に', '花を', 'あげました'],
        correctSentence: '母に花をあげました。'
      },
      {
        structure: 'もう V-mashita / まだです',
        meaning: 'Đã làm V xong rồi / Vẫn chưa làm',
        explanation: 'Hỏi và xác nhận một việc đã hoàn tất hay chưa.',
        exampleSentence: 'もう宿題をしました。',
        exampleTranslation: 'Tôi đã làm xong bài tập về nhà rồi.',
        wordsToReorder: ['もう', '宿題を', 'しました'],
        correctSentence: 'もう宿題をしました。'
      }
    ],
    8: [
      {
        structure: 'A-i です / A-i くないです',
        meaning: 'Tính từ đuôi i: Khẳng định / Phủ định',
        explanation: 'Tính từ đuôi i phủ định bằng cách đổi đuôi い thành くないです.',
        exampleSentence: '今日の天気は寒くないです。',
        exampleTranslation: 'Thời tiết hôm nay không lạnh.',
        wordsToReorder: ['今日の天気は', '寒くないです'],
        correctSentence: '今日の天気は寒くないです。'
      },
      {
        structure: 'A-na です / A-na じゃありません',
        meaning: 'Tính từ đuôi na: Khẳng định / Phủ định',
        explanation: 'Tính từ đuôi na đứng trước です hoặc じゃありません (không có な). Khi bổ nghĩa cho danh từ mới thêm な.',
        exampleSentence: 'この町は静かです。',
        exampleTranslation: 'Thị trấn này rất yên tĩnh.',
        wordsToReorder: ['この町は', '静かです'],
        correctSentence: 'この町は静かです。'
      },
      {
        structure: 'A-i + N / A-na + な + N',
        meaning: 'Tính từ bổ nghĩa cho danh từ',
        explanation: 'Tính từ đứng trực tiếp trước danh từ để miêu tả tính chất.',
        exampleSentence: '富士山は高い山です。',
        exampleTranslation: 'Núi Phú Sĩ là một ngọn núi cao.',
        wordsToReorder: ['富士山は', '高い山です'],
        correctSentence: '富士山は高い山です。'
      }
    ],
    9: [
      {
        structure: '[N] が 好きです / 嫌いです / 上手です / 下手です',
        meaning: 'Thích / Ghét / Giỏi / Kém [N]',
        explanation: 'Đối tượng của các tính từ chỉ sở thích, cảm xúc, khả năng luôn đi với trợ từ が.',
        exampleSentence: '私は日本料理が好きです。',
        exampleTranslation: 'Tôi thích các món ăn Nhật Bản.',
        wordsToReorder: ['私は', '日本料理が', '好きです'],
        correctSentence: '私は日本料理が好きです。'
      },
      {
        structure: '[N] が わかります / あります',
        meaning: 'Hiểu / Có [N]',
        explanation: 'Các động từ chỉ sở hữu, khả năng nhận thức đi kèm trợ từ が.',
        exampleSentence: '簡単な日本語がわかります。',
        exampleTranslation: 'Tôi hiểu được tiếng Nhật đơn giản.',
        wordsToReorder: ['簡単な', '日本語が', 'わかります'],
        correctSentence: '簡単な日本語がわかります。'
      },
      {
        structure: '[Lý do] から、〜',
        meaning: 'Vì [Lý do] nên...',
        explanation: 'Từ nối chỉ nguyên nhân, lý do cho vế câu phía sau.',
        exampleSentence: '時間がありませんから、タクシーで行きます。',
        exampleTranslation: 'Vì không có thời gian nên tôi sẽ đi bằng taxi.',
        wordsToReorder: ['時間がありませんから、', 'タクシーで行きます'],
        correctSentence: '時間がありませんから、タクシーで行きます。'
      }
    ],
    10: [
      {
        structure: '[Địa điểm] に [Vật] が あります / [Người/Động vật] が います',
        meaning: 'Ở [Địa điểm] có [Vật/Người/Động vật]',
        explanation: 'あります dùng cho đồ vật, cây cối bất động; います dùng cho người và động vật di chuyển được.',
        exampleSentence: '教室に学生がいます。',
        exampleTranslation: 'Trong phòng học có học sinh.',
        wordsToReorder: ['教室に', '学生が', 'います'],
        correctSentence: '教室に学生がいます。'
      },
      {
        structure: '[Vật / Người] は [Địa điểm] に あります / います',
        meaning: '[Vật / Người] ở tại [Địa điểm]',
        explanation: 'Nhấn mạnh chủ thể đứng đầu câu là đối tượng được tìm kiếm vị trí.',
        exampleSentence: '鍵は机の上にあります。',
        exampleTranslation: 'Chìa khóa ở trên bàn.',
        wordsToReorder: ['鍵は', '机の上に', 'あります'],
        correctSentence: '鍵は机の上にあります。'
      },
      {
        structure: 'N1 や N2 など',
        meaning: 'N1, N2 v.v...',
        explanation: 'Liệt kê không đầy đủ các danh từ tiêu biểu.',
        exampleSentence: '箱の中に本やノートなどがあります。',
        exampleTranslation: 'Trong hộp có sách, vở v.v...',
        wordsToReorder: ['箱の中に', '本やノートなどが', 'あります'],
        correctSentence: '箱の中に本やノートなどがあります。'
      }
    ],
    11: [
      {
        structure: '[Lượng từ / Số đếm] + V',
        meaning: 'Làm V với số lượng...',
        explanation: 'Lượng từ tiếng Nhật thường đứng ngay trước động từ mà không cần trợ từ.',
        exampleSentence: 'りんごを3つ買いました。',
        exampleTranslation: 'Tôi đã mua 3 quả táo.',
        wordsToReorder: ['りんごを', '3つ', '買いました'],
        correctSentence: 'りんごを3つ買いました。'
      },
      {
        structure: '[Thời lượng] に [Số lần] 回',
        meaning: '[Số lần] lần trong [Khoảng thời gian]',
        explanation: 'Biểu thị tần suất thực hiện hành động định kỳ.',
        exampleSentence: '1週間に2回テニスをします。',
        exampleTranslation: 'Một tuần tôi chơi tennis 2 lần.',
        wordsToReorder: ['1週間に2回', 'テニスをします'],
        correctSentence: '1週間に2回テニスをします。'
      }
    ],
    12: [
      {
        structure: 'N1 は N2 より [Tính từ] です',
        meaning: 'N1 [Tính từ] hơn N2',
        explanation: 'Cấu trúc so sánh hơn giữa hai danh từ.',
        exampleSentence: '新幹線は車より速いです。',
        exampleTranslation: 'Tàu Shinkansen chạy nhanh hơn ô tô.',
        wordsToReorder: ['新幹線は', '車より', '速いです'],
        correctSentence: '新幹線は車より速いです。'
      },
      {
        structure: '[Phạm vi] で N が 一番 [Tính từ] です',
        meaning: 'Trong [Phạm vi] thì N là [Tính từ] nhất',
        explanation: 'Cấu trúc so sánh bậc nhất trong một tập hợp.',
        exampleSentence: '1年で春が一番好きです。',
        exampleTranslation: 'Trong 1 năm tôi thích mùa xuân nhất.',
        wordsToReorder: ['1年で', '春が', '一番好きです'],
        correctSentence: '1年で春が一番好きです。'
      }
    ],
    13: [
      {
        structure: '[N] が 欲しいです',
        meaning: 'Muốn có [N]',
        explanation: 'Biểu thị mong muốn sở hữu một đồ vật nào đó của người nói.',
        exampleSentence: '新しいパソコンが欲しいです。',
        exampleTranslation: 'Tôi muốn có một chiếc máy tính mới.',
        wordsToReorder: ['新しい', 'パソコンが', '欲しいです'],
        correctSentence: '新しいパソコンが欲しいです。'
      },
      {
        structure: 'V-stem + たいです',
        meaning: 'Muốn làm V',
        explanation: 'Động từ bỏ ます thêm たい biểu thị mong muốn thực hiện hành động của ngôi thứ nhất.',
        exampleSentence: '日本へ旅行に行きたいです。',
        exampleTranslation: 'Tôi muốn đi du lịch Nhật Bản.',
        wordsToReorder: ['日本へ', '旅行に', '行きたいです'],
        correctSentence: '日本へ旅行に行きたいです。'
      }
    ],
    14: [
      {
        structure: 'V-te + ください',
        meaning: 'Xin hãy / Hãy làm V',
        explanation: 'Dùng để đưa ra lời yêu cầu, nhờ vả một cách lịch sự.',
        exampleSentence: 'ここに名前を書いてください。',
        exampleTranslation: 'Xin hãy viết tên vào đây.',
        wordsToReorder: ['書いてください', 'ここに', '名前を'],
        correctSentence: 'ここに名前を書いてください。'
      },
      {
        structure: 'V-te + います',
        meaning: 'Đang làm V',
        explanation: 'Diễn tả hành động đang diễn ra tại thời điểm nói.',
        exampleSentence: '今、日本語を勉強しています。',
        exampleTranslation: 'Bây giờ tôi đang học tiếng Nhật.',
        wordsToReorder: ['今、', '日本語を', '勉強しています'],
        correctSentence: '今、日本語を勉強しています。'
      }
    ],
    15: [
      {
        structure: 'V-te + もいいです',
        meaning: 'Được phép làm V',
        explanation: 'Dùng để cho phép hoặc xin phép làm một việc gì đó.',
        exampleSentence: 'ここで写真を撮ってもいいですか。',
        exampleTranslation: 'Tôi có thể chụp ảnh ở đây được không?',
        wordsToReorder: ['ここで', '写真を', '撮ってもいいですか'],
        correctSentence: 'ここで写真を撮ってもいいですか。'
      },
      {
        structure: 'V-te + はいけません',
        meaning: 'Cấm / Không được làm V',
        explanation: 'Biểu thị sự cấm đoán không được thực hiện hành động.',
        exampleSentence: 'ここに車を止めてはいけません。',
        exampleTranslation: 'Không được đỗ xe ở đây.',
        wordsToReorder: ['ここに', '車を', '止めてはいけません'],
        correctSentence: 'ここに車を止めてはいけません。'
      }
    ],
    16: [
      {
        structure: 'V1-te, V2-te, ... V-masu',
        meaning: 'Làm V1 rồi làm V2...',
        explanation: 'Nối chuỗi các hành động diễn ra theo trình tự thời gian.',
        exampleSentence: '朝起きて、顔を洗って、朝ごはんを食べます。',
        exampleTranslation: 'Buổi sáng thức dậy, rửa mặt rồi ăn sáng.',
        wordsToReorder: ['朝起きて、', '顔を洗って、', '朝ごはんを食べます'],
        correctSentence: '朝起きて、顔を洗って、朝ごはんを食べます。'
      },
      {
        structure: 'V1-te + から、V2',
        meaning: 'Sau khi làm V1 xong thì làm V2',
        explanation: 'Nhấn mạnh hành động V1 phải hoàn tất trước khi V2 bắt đầu.',
        exampleSentence: '手を洗ってから、ご飯を食べましょう。',
        exampleTranslation: 'Sau khi rửa tay xong, chúng ta hãy ăn cơm nhé.',
        wordsToReorder: ['手を洗ってから、', 'ご飯を食べましょう'],
        correctSentence: '手を洗ってから、ご飯を食べましょう。'
      }
    ],
    17: [
      {
        structure: 'V-nai + でください',
        meaning: 'Xin đừng làm V',
        explanation: 'Khuyên nhủ hoặc yêu cầu đối phương lịch sự không làm việc gì.',
        exampleSentence: 'ここでタバコを吸わないでください。',
        exampleTranslation: 'Xin đừng hút thuốc ở đây.',
        wordsToReorder: ['ここで', 'タバコを', '吸わないでください'],
        correctSentence: 'ここでタバコを吸わないでください。'
      },
      {
        structure: 'V-nai + なければなりません',
        meaning: 'Phải làm V',
        explanation: 'Biểu thị nghĩa vụ, bổn phận bắt buộc phải thực hiện hành động.',
        exampleSentence: '毎日薬を飲まなければなりません。',
        exampleTranslation: 'Mỗi ngày tôi đều phải uống thuốc.',
        wordsToReorder: ['毎日', '薬を', '飲まなければなりません'],
        correctSentence: '毎日薬を飲まなければなりません。'
      }
    ],
    18: [
      {
        structure: 'V-dict + ことができます',
        meaning: 'Có thể làm V',
        explanation: 'Biểu thị năng lực bản thân hoặc điều kiện hoàn cảnh cho phép làm hành động.',
        exampleSentence: '私は漢字を読むことができます。',
        exampleTranslation: 'Tôi có thể đọc được chữ Hán.',
        wordsToReorder: ['私は', '漢字を', '読むことができます'],
        correctSentence: '私は漢字を読むことができます。'
      },
      {
        structure: 'V-dict + まえに、〜',
        meaning: 'Trước khi làm V thì...',
        explanation: 'Chỉ thời điểm trước khi một hành động diễn ra (động từ luôn để thể từ điển).',
        exampleSentence: '寝るまえに、日記を書きます。',
        exampleTranslation: 'Trước khi đi ngủ, tôi viết nhật ký.',
        wordsToReorder: ['寝るまえに、', '日記を書きます'],
        correctSentence: '寝るまえに、日記を書きます。'
      }
    ],
    19: [
      {
        structure: 'V-ta + ことがあります',
        meaning: 'Đã từng làm V',
        explanation: 'Diễn tả trải nghiệm, kinh nghiệm đã từng làm gì đó trong quá khứ.',
        exampleSentence: '富士山に登ったことがあります。',
        exampleTranslation: 'Tôi đã từng leo núi Phú Sĩ.',
        wordsToReorder: ['富士山に', '登ったことがあります'],
        correctSentence: '富士山に登ったことがあります。'
      },
      {
        structure: 'V-tari, V-tari します',
        meaning: 'Khi thì làm V1, khi thì làm V2...',
        explanation: 'Liệt kê tiêu biểu một vài hành động trong số nhiều hành động.',
        exampleSentence: '休みの日は本を読んだり、音楽を聞いたりします。',
        exampleTranslation: 'Ngày nghỉ tôi khi thì đọc sách, khi thì nghe nhạc.',
        wordsToReorder: ['休みの日は', '本を読んだり、', '音楽を聞いたりします'],
        correctSentence: '休みの日は本を読んだり、音楽を聞いたりします。'
      }
    ],
    20: [
      {
        structure: 'Thể thông thường (普通形)',
        meaning: 'Cách nói thân mật trong giao tiếp hàng ngày',
        explanation: 'Dùng giữa bạn bè, người thân thiết trong gia đình hoặc người dưới.',
        exampleSentence: '明日映画を見に行く？うん、行く。',
        exampleTranslation: 'Ngày mai đi xem phim không? Ừ, đi chứ.',
        wordsToReorder: ['明日映画を', '見に行く？', 'うん、行く'],
        correctSentence: '明日映画を見に行く？うん、行く。'
      }
    ],
    21: [
      {
        structure: '[Thể thông thường] + と思います',
        meaning: 'Tôi nghĩ rằng...',
        explanation: 'Bày tỏ suy nghĩ, quan điểm cá nhân hoặc phỏng đoán của người nói.',
        exampleSentence: '明日は雨が降ると思います。',
        exampleTranslation: 'Tôi nghĩ ngày mai trời sẽ mưa.',
        wordsToReorder: ['明日は', '雨が降ると', '思います'],
        correctSentence: '明日は雨が降ると思います。'
      },
      {
        structure: '[Thể thông thường] + と言いました',
        meaning: 'Ai đó đã nói rằng...',
        explanation: 'Trích dẫn lại lời nói của người khác gián tiếp hoặc trực tiếp.',
        exampleSentence: '田中さんは来週出張すると言いました。',
        exampleTranslation: 'Anh Tanaka đã nói là tuần sau sẽ đi công tác.',
        wordsToReorder: ['田中さんは', '来週出張すると', '言いました'],
        correctSentence: '田中さんは来週出張すると言いました。'
      }
    ],
    22: [
      {
        structure: '[Thể thông thường] + N (Định ngữ)',
        meaning: 'Mệnh đề bổ nghĩa cho danh từ',
        explanation: 'Cụm động từ/tính từ thể thông thường đứng trước danh từ để bổ nghĩa chi tiết.',
        exampleSentence: 'これは私が昨日作ったケーキです。',
        exampleTranslation: 'Đây là chiếc bánh kem do chính tôi làm ngày hôm qua.',
        wordsToReorder: ['これは', '私が昨日作った', 'ケーキです'],
        correctSentence: 'これは私が昨日作ったケーキです。'
      }
    ],
    23: [
      {
        structure: '[V-dict / V-nai / V-ta] + とき',
        meaning: 'Khi / Lúc làm V...',
        explanation: 'Biểu thị thời điểm diễn ra sự việc hoặc hành động.',
        exampleSentence: '道を渡るとき、車に気をつけます。',
        exampleTranslation: 'Khi qua đường, hãy chú ý xe cộ.',
        wordsToReorder: ['道を渡るとき、', '車に気をつけます'],
        correctSentence: '道を渡るとき、車に気をつけます。'
      },
      {
        structure: 'V-dict + と、〜',
        meaning: 'Hễ làm V thì tất yếu...',
        explanation: 'Diễn tả hệ quả tự nhiên, tất yếu xảy ra khi thực hiện hành động.',
        exampleSentence: 'このボタンを押すと、お釣りが出ます。',
        exampleTranslation: 'Hễ nhấn nút này thì tiền thừa sẽ chạy ra.',
        wordsToReorder: ['このボタンを押すと、', 'お釣りが出ます'],
        correctSentence: 'このボタンを押すと、お釣りが出ます。'
      }
    ],
    24: [
      {
        structure: 'V-te + あげます / もらいます / くれます',
        meaning: 'Làm giúp ai... / Nhận được sự giúp đỡ / Ai làm giúp mình...',
        explanation: 'Thể hiện hành vi mang tính giúp đỡ, ân huệ giữa người với người.',
        exampleSentence: '友達が荷物を持ってくれました。',
        exampleTranslation: 'Bạn tôi đã xách hành lý giúp tôi.',
        wordsToReorder: ['友達が', '荷物を', '持ってくれました'],
        correctSentence: '友達が荷物を持ってくれました。'
      }
    ],
    25: [
      {
        structure: 'V-ta + ら、〜',
        meaning: 'Nếu / Sau khi làm V thì...',
        explanation: 'Điều kiện giả định trong tương lai hoặc sự việc sau khi hoàn tất.',
        exampleSentence: '雨が降ったら、出かけません。',
        exampleTranslation: 'Nếu trời mưa thì tôi sẽ không ra ngoài.',
        wordsToReorder: ['雨が降ったら、', '出かけません'],
        correctSentence: '雨が降ったら、出かけません。'
      },
      {
        structure: 'V-te + も、〜',
        meaning: 'Cho dù làm V thì vẫn...',
        explanation: 'Biểu thị sự nhượng bộ, trái ngược với lẽ thường.',
        exampleSentence: '高くても、この辞書を買いたいです。',
        exampleTranslation: 'Cho dù đắt nhưng tôi vẫn muốn mua cuốn từ điển này.',
        wordsToReorder: ['高くても、', 'この辞書を買いたいです'],
        correctSentence: '高くても、この辞書を買いたいです。'
      }
    ]
  },
  N4: {
    26: [
      {
        structure: '[Thể thông thường] + んです (A-na / N: な + んです) / 〜んですが、〜',
        meaning: 'Nhấn mạnh, giải thích lý do & Rào trước mở đầu khi nhờ vả',
        explanation: 'Dùng khi muốn giải thích nguyên nhân, lý do cho một tình huống, hoặc tìm kiếm lời giải thích từ đối phương; hoặc dùng 〜んですが để mở đầu câu chuyện khéo léo trước khi nhờ vả.',
        exampleSentence: '日本語を勉強したいんですが、教えていただけませんか。',
        exampleTranslation: 'Tôi muốn học tiếng Nhật, bạn có thể dạy cho tôi được không?',
        wordsToReorder: ['日本語を', '勉強したいんですが、', '教えていただけませんか'],
        correctSentence: '日本語を勉強したいんですが、教えていただけませんか。'
      }
    ],
    27: [
      {
        structure: 'Động từ thể khả năng (可能形) + ができる / 〜る',
        meaning: 'Có thể làm V',
        explanation: 'Biểu thị năng lực bản thân hoặc điều kiện hoàn cảnh cho phép thực hiện hành động. Tân ngữ thường đi với trợ từ が.',
        exampleSentence: '私は日本語が話せます。',
        exampleTranslation: 'Tôi có thể nói tiếng Nhật.',
        wordsToReorder: ['私は', '日本語が', '話せます'],
        correctSentence: '私は日本語が話せます。'
      }
    ],
    28: [
      {
        structure: 'V1 (bỏ ます) + ながら + V2',
        meaning: 'Vừa làm V1 vừa làm V2',
        explanation: 'Diễn tả hai hành động diễn ra song song cùng một lúc bởi cùng một chủ ngữ. Hành động V2 là hành động chính.',
        exampleSentence: '音楽を聞きながら勉強します。',
        exampleTranslation: 'Tôi vừa nghe nhạc vừa học bài.',
        wordsToReorder: ['音楽を', '聞きながら', '勉強します'],
        correctSentence: '音楽を聞きながら勉強します。'
      },
      {
        structure: '〜し、〜し',
        meaning: 'Vừa... lại vừa... (Liệt kê lý do)',
        explanation: 'Liệt kê từ 2 lý do trở lên để đưa ra kết luận hoặc nhận xét.',
        exampleSentence: 'この店は安いし、美味しいです。',
        exampleTranslation: 'Quán này vừa rẻ lại vừa ngon.',
        wordsToReorder: ['この店は', '安いし、', '美味しいです'],
        correctSentence: 'この店は安いし、美味しいです。'
      }
    ],
    29: [
      {
        structure: 'Tự động từ + が V-te います',
        meaning: 'Trạng thái đang diễn ra (Cửa mở, đèn sáng...)',
        explanation: 'Diễn tả trạng thái hiện hữu của sự vật do tự bản thân hoặc kết quả tự nhiên mang lại.',
        exampleSentence: 'ドアが開いています。',
        exampleTranslation: 'Cửa đang mở.',
        wordsToReorder: ['ドアが', '開いています'],
        correctSentence: 'ドアが開いています。'
      },
      {
        structure: 'V-te + しまいました',
        meaning: 'Đã lỡ làm V (Hối tiếc) / Đã làm xong hoàn toàn V',
        explanation: 'Diễn tả tâm trạng hối tiếc vì xảy ra việc ngoài ý muốn, hoặc hành động đã hoàn tất trọn vẹn.',
        exampleSentence: '財布を忘れてしまいました。',
        exampleTranslation: 'Tôi lỡ để quên ví mất rồi.',
        wordsToReorder: ['財布を', '忘れてしまいました'],
        correctSentence: '財布を忘れてしまいました。'
      }
    ],
    30: [
      {
        structure: 'Tha động từ + が V-te あります',
        meaning: 'Đang được làm sẵn V (Có chủ đích)',
        explanation: 'Diễn tả trạng thái của sự vật là kết quả của một hành động có chủ đích trước đó của ai đó.',
        exampleSentence: '壁にカレンダーが掛けてあります。',
        exampleTranslation: 'Trên tường có treo sẵn một cuốn lịch.',
        wordsToReorder: ['壁に', 'カレンダーが', '掛けてあります'],
        correctSentence: '壁にカレンダーが掛けてあります。'
      },
      {
        structure: 'V-te + おきます',
        meaning: 'Làm sẵn V trước để chuẩn bị',
        explanation: 'Thực hiện một hành động chuẩn bị từ trước cho mục đích sau này.',
        exampleSentence: '旅行のまえにホテルを予約しておきます。',
        exampleTranslation: 'Trước chuyến du lịch tôi đặt sẵn khách sạn.',
        wordsToReorder: ['旅行のまえに', 'ホテルを', '予約しておきます'],
        correctSentence: '旅行のまえにホテルを予約しておきます。'
      }
    ],
    31: [
      {
        structure: 'V (Thể ý chí - 意向形) + と思っています',
        meaning: 'Đang dự định làm V',
        explanation: 'Bày tỏ ý định thực hiện hành động đã được ấp ủ từ trước đến nay.',
        exampleSentence: '週末に家族と旅行に行こうと思っています。',
        exampleTranslation: 'Tôi đang dự định cuối tuần đi du lịch cùng gia đình.',
        wordsToReorder: ['週末に家族と', '旅行に行こうと', '思っています'],
        correctSentence: '週末に家族と旅行に行こうと思っています。'
      },
      {
        structure: 'V-dict / V-nai + つもりです',
        meaning: 'Dự định / Quyết tâm sẽ (không) làm V',
        explanation: 'Ý định chắc chắn của bản thân người nói.',
        exampleSentence: '来年大学を受験するつもりです。',
        exampleTranslation: 'Tôi dự định năm sau sẽ thi đại học.',
        wordsToReorder: ['来年', '大学を受験する', 'つもりです'],
        correctSentence: '来年大学を受験するつもりです。'
      }
    ],
    32: [
      {
        structure: 'V-ta / V-nai + ほうがいいです',
        meaning: 'Nên / Không nên làm V',
        explanation: 'Lời khuyên bảo trực tiếp dành cho đối phương.',
        exampleSentence: '病院へ行ったほうがいいですよ。',
        exampleTranslation: 'Bạn nên đi khám ở bệnh viện thì hơn.',
        wordsToReorder: ['病院へ', '行ったほうがいいですよ'],
        correctSentence: '病院へ行ったほうがいいですよ。'
      },
      {
        structure: '[Thể thông thường] + かもしれません',
        meaning: 'Có lẽ / Có thể là...',
        explanation: 'Phỏng đoán với độ chắc chắn khoảng 50% của người nói.',
        exampleSentence: '午後は雨が降るかもしれません。',
        exampleTranslation: 'Buổi chiều có thể trời sẽ mưa.',
        wordsToReorder: ['午後は', '雨が降るかも', 'しれません'],
        correctSentence: '午後は雨が降るかもしれません。'
      }
    ],
    33: [
      {
        structure: 'Thể mệnh lệnh (命令形) & Thể cấm chỉ (禁止形)',
        meaning: 'Hãy làm đi! / Cấm làm!',
        explanation: 'Dùng trong chỉ huy quân đội, biển báo giao thông hoặc cổ vũ thể thao.',
        exampleSentence: '止まれ！ここに車を止めるな！',
        exampleTranslation: 'Dừng lại! Cấm đỗ xe ở đây!',
        wordsToReorder: ['止まれ！', 'ここに車を', '止めるな！'],
        correctSentence: '止まれ！ここに車を止めるな！'
      }
    ],
    34: [
      {
        structure: 'V1-ta / N-no + とおりに、V2',
        meaning: 'Làm V2 theo đúng như V1 / N',
        explanation: 'Thực hiện hành động V2 một cách chính xác theo chỉ dẫn hoặc mẫu.',
        exampleSentence: '説明書のとおりに組み立ててください。',
        exampleTranslation: 'Hãy lắp ráp theo đúng sách hướng dẫn.',
        wordsToReorder: ['説明書の', 'とおりに', '組み立ててください'],
        correctSentence: '説明書のとおりに組み立ててください。'
      },
      {
        structure: 'V1-ta / N-no + あとで、V2',
        meaning: 'Sau khi làm V1 thì làm V2',
        explanation: 'Trình tự thời gian hành động V2 diễn ra sau V1.',
        exampleSentence: '仕事が終わったあとで、飲みに行きましょう。',
        exampleTranslation: 'Sau khi xong việc, chúng ta cùng đi uống nước nhé.',
        wordsToReorder: ['仕事が終わったあとで、', '飲みに行きましょう'],
        correctSentence: '仕事が終わったあとで、飲みに行きましょう。'
      }
    ],
    35: [
      {
        structure: 'V-ba / A-kereba / N-nara (Thể điều kiện)',
        meaning: 'Nếu... thì...',
        explanation: 'Diễn tả điều kiện cần thiết để kết quả vế sau xảy ra.',
        exampleSentence: '安ければ、買います。',
        exampleTranslation: 'Nếu rẻ thì tôi sẽ mua.',
        wordsToReorder: ['安ければ、', '買います'],
        correctSentence: '安ければ、買います。'
      }
    ],
    36: [
      {
        structure: 'V-dict / V-nai + ように、〜',
        meaning: 'Để / Sao cho...',
        explanation: 'Chỉ mục đích sao cho đạt được trạng thái hoặc khả năng không tự chủ.',
        exampleSentence: '早く覚えられるように、メモを取ります。',
        exampleTranslation: 'Để có thể nhớ nhanh, tôi ghi chú lại.',
        wordsToReorder: ['早く覚えられるように、', 'メモを取ります'],
        correctSentence: '早く覚えられるように、メモを取ります。'
      },
      {
        structure: 'V-dict / V-nai + ようになる',
        meaning: 'Trở nên (có thể) làm được V',
        explanation: 'Biểu thị sự biến đổi năng lực hoặc thói quen theo thời gian.',
        exampleSentence: '日本語の新聞が読めるようになりました。',
        exampleTranslation: 'Tôi đã có thể đọc được báo tiếng Nhật.',
        wordsToReorder: ['日本語の新聞が', '読めるように', 'なりました'],
        correctSentence: '日本語の新聞が読めるようになりました。'
      }
    ],
    37: [
      {
        structure: 'Thể bị động (受身形 - れる / られる)',
        meaning: 'Bị / Được ai đó làm gì...',
        explanation: 'Diễn tả hành động tác động từ người khác lên chủ ngữ (thường đi với trợ từ に).',
        exampleSentence: '先生に褒められました。',
        exampleTranslation: 'Tôi đã được thầy giáo khen ngợi.',
        wordsToReorder: ['先生に', '褒められました'],
        correctSentence: '先生に褒められました。'
      }
    ],
    38: [
      {
        structure: 'V-dict + のは [Tính từ] です',
        meaning: 'Việc làm V thì...',
        explanation: 'Danh từ hóa mệnh đề động từ bằng の để làm chủ ngữ cho tính từ.',
        exampleSentence: '外国語を勉強するのは楽しいです。',
        exampleTranslation: 'Việc học ngoại ngữ thật là thú vị.',
        wordsToReorder: ['外国語を', '勉強するのは', '楽しいです'],
        correctSentence: '外国語を勉強するのは楽しいです。'
      }
    ],
    39: [
      {
        structure: '[Thể thông thường / A-na(な) / N(な)] + ので、〜',
        meaning: 'Bởi vì... nên... (Lịch sự khách quan)',
        explanation: 'Nêu lý do khách quan, lịch sự, thường dùng khi xin phép hoặc giải thích trang trọng.',
        exampleSentence: '用事があるので、お先に失礼します。',
        exampleTranslation: 'Vì có việc bận nên tôi xin phép về trước.',
        wordsToReorder: ['用事があるので、', 'お先に失礼します'],
        correctSentence: '用事があるので、お先に失礼します。'
      }
    ],
    40: [
      {
        structure: '[Thể thông thường] + かどうか、〜',
        meaning: 'Có hay không...',
        explanation: 'Lồng câu hỏi nghi vấn không có từ để hỏi vào trong câu chính.',
        exampleSentence: '明日雨が降るかどうか、わかりません。',
        exampleTranslation: 'Tôi không biết ngày mai trời có mưa hay không.',
        wordsToReorder: ['明日雨が降るかどうか、', 'わかりません'],
        correctSentence: '明日雨が降るかどうか、わかりません。'
      },
      {
        structure: 'V-te + みます',
        meaning: 'Thử làm V',
        explanation: 'Thực hiện hành động lần đầu để xem kết quả ra sao.',
        exampleSentence: 'この靴を履いてみます。',
        exampleTranslation: 'Tôi sẽ đi thử đôi giày này xem sao.',
        wordsToReorder: ['この靴を', '履いてみます'],
        correctSentence: 'この靴を履いてみます。'
      }
    ],
    41: [
      {
        structure: 'V-te + くださいます / いただきます',
        meaning: 'Được người trên giúp đỡ / Nhận ân huệ lịch sự',
        explanation: 'Dạng kính ngữ của てくれます / てもらいます khi đối phương là cấp trên, người lớn tuổi.',
        exampleSentence: '先生が教えてくださいました。',
        exampleTranslation: 'Thầy giáo đã ân cần chỉ dạy cho tôi.',
        wordsToReorder: ['先生が', '教えてくださいました'],
        correctSentence: '先生が教えてくださいました。'
      }
    ],
    42: [
      {
        structure: 'V-dict / N-no + ために、〜',
        meaning: 'Để / Vì mục đích...',
        explanation: 'Biểu thị mục đích có ý chí chủ động rõ ràng của người nói.',
        exampleSentence: '家を買うために、貯金しています。',
        exampleTranslation: 'Để mua nhà, tôi đang tích lũy tiết kiệm tiền.',
        wordsToReorder: ['家を買うために、', '貯金しています'],
        correctSentence: '家を買うために、貯金しています。'
      },
      {
        structure: 'V-dict / N + のに 使います / かかります',
        meaning: 'Dùng cho / Cần thiết cho việc...',
        explanation: 'Chỉ mục đích công dụng của đồ vật hoặc tiêu tốn thời gian, tiền bạc.',
        exampleSentence: 'このハサミは紙を切るのに使います。',
        exampleTranslation: 'Chiếc kéo này dùng để cắt giấy.',
        wordsToReorder: ['このハサミは', '紙を切るのに', '使います'],
        correctSentence: 'このハサミは紙を切るのに使います。'
      }
    ],
    43: [
      {
        structure: 'V-stem / A-stem + そうです (Vẻ bề ngoài)',
        meaning: 'Trông có vẻ sắp... / Trông có vẻ...',
        explanation: 'Phán đoán trực quan qua mắt nhìn về trạng thái sắp xảy ra hoặc tính chất.',
        exampleSentence: '今にも雨が降りそうです。',
        exampleTranslation: 'Trời trông như sắp đổ mưa đến nơi rồi.',
        wordsToReorder: ['今にも', '雨が降りそうです'],
        correctSentence: '今にも雨が降りそうです。'
      }
    ],
    44: [
      {
        structure: 'V-stem / A-stem + すぎます',
        meaning: 'Làm V quá mức / Quá [Tính từ]',
        explanation: 'Vượt quá giới hạn cho phép hoặc mong đợi, mang sắc thái tiêu cực.',
        exampleSentence: '昨日お酒を飲みすぎました。',
        exampleTranslation: 'Hôm qua tôi đã uống quá nhiều rượu.',
        wordsToReorder: ['昨日', 'お酒を', '飲みすぎました'],
        correctSentence: '昨日お酒を飲みすぎました。'
      },
      {
        structure: 'V-stem + やすいです / にくいです',
        meaning: 'Dễ làm V / Khó làm V',
        explanation: 'Chỉ mức độ dễ dàng hoặc khó khăn khi thực hiện hành động.',
        exampleSentence: 'このペンはとても書きやすいです。',
        exampleTranslation: 'Cây bút này viết rất trơn và êm tay.',
        wordsToReorder: ['このペンは', 'とても書きやすいです'],
        correctSentence: 'このペンはとても書きやすいです。'
      }
    ],
    45: [
      {
        structure: '[Thể thông thường / A-na(な) / N(の)] + 場合は、〜',
        meaning: 'Trong trường hợp... thì...',
        explanation: 'Giả định một tình huống cụ thể và hướng xử lý tương ứng.',
        exampleSentence: '火事の場合は、119番に電話してください。',
        exampleTranslation: 'Trong trường hợp có hỏa hoạn, xin hãy gọi số 119.',
        wordsToReorder: ['火事の場合は、', '119番に電話してください'],
        correctSentence: '火事の場合は、119番に電話してください。'
      },
      {
        structure: '[Thể thông thường / A-na(な) / N(な)] + のに、〜',
        meaning: 'Thế mà / Mặc dù... nhưng...',
        explanation: 'Biểu thị sự bất ngờ, thất vọng vì kết quả trái ngược với kỳ vọng.',
        exampleSentence: '約束したのに、彼は来ませんでした。',
        exampleTranslation: 'Đã hẹn trước thế mà anh ấy lại không đến.',
        wordsToReorder: ['約束したのに、', '彼は来ませんでした'],
        correctSentence: '約束したのに、彼は来ませんでした。'
      }
    ],
    46: [
      {
        structure: 'V-dict / V-teiru / V-ta + ところです',
        meaning: 'Sắp sửa / Đang trong lúc / Vừa mới xong V',
        explanation: 'Nhấn mạnh khoảnh khắc cực kỳ chính xác của hành động theo thời gian.',
        exampleSentence: '今からご飯を食べるところです。',
        exampleTranslation: 'Bây giờ tôi vừa chuẩn bị ăn cơm.',
        wordsToReorder: ['今から', 'ご飯を食べるところです'],
        correctSentence: '今からご飯を食べるところです。'
      },
      {
        structure: 'V-ta + ばかりです',
        meaning: 'Vừa mới làm V xong (Cảm giác chủ quan)',
        explanation: 'Diễn tả hành động vừa mới xảy ra theo cảm nhận của người nói dù thời gian thực tế có thể đã trôi qua.',
        exampleSentence: '先月日本に来たばかりです。',
        exampleTranslation: 'Tôi vừa mới sang Nhật Bản vào tháng trước.',
        wordsToReorder: ['先月', '日本に来たばかりです'],
        correctSentence: '先月日本に来たばかりです。'
      }
    ],
    47: [
      {
        structure: '[Thể thông thường] + そうです (Nghe nói)',
        meaning: 'Nghe nói là...',
        explanation: 'Truyền đạt lại thông tin nghe được từ nguồn khác mà không thêm ý kiến cá nhân.',
        exampleSentence: '天気予報によると、明日は晴れるそうです。',
        exampleTranslation: 'Theo dự báo thời tiết thì nghe nói ngày mai trời sẽ nắng.',
        wordsToReorder: ['天気予報によると、', '明日は晴れるそうです'],
        correctSentence: '天気予報によると、明日は晴れるそうです。'
      },
      {
        structure: '[Thể thông thường / A-na(な) / N(の)] + ようです',
        meaning: 'Hình như / Dường như là...',
        explanation: 'Phán đoán dựa trên các bằng chứng, dấu hiệu gián tiếp thu thập được.',
        exampleSentence: '外は雨が降っているようです。',
        exampleTranslation: 'Hình như bên ngoài trời đang mưa.',
        wordsToReorder: ['外は', '雨が降っているようです'],
        correctSentence: '外は雨が降っているようです。'
      }
    ],
    48: [
      {
        structure: 'Thể sai khiến (使役形 - せる / させる)',
        meaning: 'Bắt / Cho phép ai làm gì...',
        explanation: 'Người có vị thế cao hơn yêu cầu hoặc cho phép người dưới thực hiện hành động.',
        exampleSentence: '先生は学生に作文を書かせました。',
        exampleTranslation: 'Thầy giáo yêu cầu học sinh viết bài văn.',
        wordsToReorder: ['先生は', '学生に', '作文を書かせました'],
        correctSentence: '先生は学生に作文を書かせました。'
      }
    ],
    49: [
      {
        structure: 'Tôn kính ngữ (尊敬語 - おV-stemになります / Động từ đặc biệt)',
        meaning: 'Kính ngữ nâng cao vị thế đối phương',
        explanation: 'Dùng khi nói về hành động của khách hàng, cấp trên, người cần tôn kính.',
        exampleSentence: '社長はもうお帰りになりました。',
        exampleTranslation: 'Giám đốc đã về rồi ạ.',
        wordsToReorder: ['社長は', 'もうお帰りになりました'],
        correctSentence: '社長はもうお帰りになりました。'
      }
    ],
    50: [
      {
        structure: 'Khiêm nhường ngữ (謙譲語 - おV-stemします / Động từ đặc biệt)',
        meaning: 'Khiêm tốn hạ mình để thể hiện sự lịch sự',
        explanation: 'Dùng khi nói về hành động của bản thân hoặc người cùng phe hướng tới đối phương.',
        exampleSentence: '私が荷物をお持ちします。',
        exampleTranslation: 'Để tôi mang hành lý giúp quý khách ạ.',
        wordsToReorder: ['私が', '荷物を', 'お持ちします'],
        correctSentence: '私が荷物をお持ちします。'
      }
    ]
  },
  N3: {
    1: [
      {
        structure: 'V-dict / V-teiru / V-nai / A-i / A-na / N-no + うちに',
        meaning: 'Trong lúc / Tranh thủ khi...',
        explanation: 'Tranh thủ làm việc gì đó trong khi trạng thái phía trước chưa bị thay đổi.',
        exampleSentence: '温かいうちに食べてください。',
        exampleTranslation: 'Hãy tranh thủ ăn lúc thức ăn còn ấm nóng.',
        wordsToReorder: ['温かいうちに', '食べてください'],
        correctSentence: '温かいうちに食べてください。'
      }
    ],
    2: [
      {
        structure: 'V-ta + とたん(に)',
        meaning: 'Ngay sau khi vừa... thì bất ngờ...',
        explanation: 'Diễn tả một hành động hoặc sự việc bất ngờ xảy ra ngay sau khi một hành động trước vừa hoàn tất.',
        exampleSentence: '家を出たとたんに、雨が降り出した。',
        exampleTranslation: 'Vừa bước ra khỏi nhà thì trời đổ mưa.',
        wordsToReorder: ['家を出たとたんに、', '雨が', '降り出した'],
        correctSentence: '家を出たとたんに、雨が降り出した。'
      }
    ],
    3: [
      {
        structure: 'V-dict / N-no + おそれがある',
        meaning: 'Có nguy cơ / E là sẽ xảy ra chuyện xấu',
        explanation: 'Dùng khi cảnh báo nguy cơ xảy ra sự việc tiêu cực trong tương lai.',
        exampleSentence: '台風が近づいており、大雨になるおそれがあります。',
        exampleTranslation: 'Bão đang đến gần, e là sẽ có mưa rất lớn.',
        wordsToReorder: ['台風が近づいており、', '大雨になるおそれがあります'],
        correctSentence: '台風が近づいており、大雨になるおそれがあります。'
      }
    ],
    4: [
      {
        structure: 'N + にかぎり (に限り)',
        meaning: 'Chỉ giới hạn / Chỉ riêng đối tượng này',
        explanation: 'Thông báo quy định đặc biệt chỉ áp dụng cho nhóm đối tượng được nêu.',
        exampleSentence: '本日ご来店のお客様に限り、割引いたします。',
        exampleTranslation: 'Chỉ riêng quý khách đến quán hôm nay mới được giảm giá.',
        wordsToReorder: ['本日ご来店のお客様に限り、', '割引いたします'],
        correctSentence: '本日ご来店のお客様に限り、割引いたします。'
      }
    ],
    5: [
      {
        structure: '[Thể thông thường / A-na / N(である)] + わけだ',
        meaning: 'Thảo nào / Hóa ra là vậy / Đương nhiên là...',
        explanation: 'Diễn tả sự thấu hiểu nguyên nhân sau khi biết được sự thật hoặc logic tự nhiên.',
        exampleSentence: '寒いわけだ。雪が降ってきた。',
        exampleTranslation: 'Thảo nào mà lạnh thế! Tuyết đã bắt đầu rơi rồi.',
        wordsToReorder: ['寒いわけだ。', '雪が', '降ってきた'],
        correctSentence: '寒いわけだ。雪が降ってきた。'
      }
    ],
    6: [
      {
        structure: 'N / V-te + ばかり',
        meaning: 'Toàn là / Chỉ toàn làm...',
        explanation: 'Chỉ tần suất lặp lại nhiều lần của sự việc hoặc số lượng nhiều, mang sắc thái phàn nàn.',
        exampleSentence: 'テレビを見てばかりいないで、勉強しなさい。',
        exampleTranslation: 'Đừng có chỉ toàn xem tivi như thế, hãy học bài đi.',
        wordsToReorder: ['テレビを見てばかりいないで、', '勉強しなさい'],
        correctSentence: 'テレビを見てばかりいないで、勉強しなさい。'
      }
    ],
    7: [
      {
        structure: '[Thể thông thường / N] + にしては',
        meaning: 'So với... thì quả là (ngoài dự đoán)',
        explanation: 'Đưa ra nhận xét khác biệt so với tiêu chuẩn thông thường của đối tượng.',
        exampleSentence: '彼は日本に10年住んでいるにしては、日本語が下手だ。',
        exampleTranslation: 'So với việc sống ở Nhật 10 năm thì tiếng Nhật của anh ấy vẫn còn kém.',
        wordsToReorder: ['彼は日本に10年住んでいるにしては、', '日本語が下手だ'],
        correctSentence: '彼は日本に10年住んでいるにしては、日本語が下手だ。'
      }
    ],
    8: [
      {
        structure: '[Thể thông thường] + わけではない / わけじゃない',
        meaning: 'Không hẳn là / Không có nghĩa là...',
        explanation: 'Phủ định một phần, làm giảm tính tuyệt đối của nhận định.',
        exampleSentence: '嫌いなわけではないが、あまり食べたくない。',
        exampleTranslation: 'Không hẳn là tôi ghét, nhưng tôi không muốn ăn lắm.',
        wordsToReorder: ['嫌いなわけではないが、', 'あまり食べたくない'],
        correctSentence: '嫌いなわけではないが、あまり食べたくない。'
      }
    ],
    9: [
      {
        structure: 'N + にくらべて (に比べて)',
        meaning: 'So với N thì...',
        explanation: 'Đặt hai đối tượng lên bàn cân so sánh về một phương diện nào đó.',
        exampleSentence: '去年に比べて、今年は物価が高くなった。',
        exampleTranslation: 'So với năm ngoái thì năm nay giá cả đã tăng cao.',
        wordsToReorder: ['去年に比べて、', '今年は物価が高くなった'],
        correctSentence: '去年に比べて、今年は物価が高くなった。'
      }
    ],
    10: [
      {
        structure: 'N-no / V-dict + かわりに (代わりに)',
        meaning: 'Thay vì / Bù lại / Đổi lại...',
        explanation: 'Làm việc này thay thế cho việc khác, hoặc nhận được lợi ích này bù cho bất lợi kia.',
        exampleSentence: '車で行く代わりに、電車で行きましょう。',
        exampleTranslation: 'Thay vì đi bằng ô tô, chúng ta hãy đi bằng tàu điện nhé.',
        wordsToReorder: ['車で行く代わりに、', '電車で行きましょう'],
        correctSentence: '車で行く代わりに、電車で行きましょう。'
      }
    ],
    11: [
      {
        structure: 'たとえ 〜 ても / でも',
        meaning: 'Cho dù / Ngay cả khi... đi chăng nữa',
        explanation: 'Giả định một tình huống xấu nhất nhưng kết quả hoặc quyết tâm vẫn không đổi.',
        exampleSentence: 'たとえ失敗しても、諦めません。',
        exampleTranslation: 'Cho dù có thất bại đi nữa, tôi cũng sẽ không bao giờ bỏ cuộc.',
        wordsToReorder: ['たとえ失敗しても、', '諦めません'],
        correctSentence: 'たとえ失敗しても、諦めません。'
      }
    ],
    12: [
      {
        structure: 'N + を中心に / を中心として',
        meaning: 'Lấy N làm trung tâm / Tập trung chủ yếu vào N',
        explanation: 'Chỉ đối tượng hoặc địa điểm cốt lõi của hoạt động.',
        exampleSentence: '文法を中心に日本語を勉強しています。',
        exampleTranslation: 'Tôi đang tập trung học tiếng Nhật trọng tâm vào ngữ pháp.',
        wordsToReorder: ['文法を中心に', '日本語を勉強しています'],
        correctSentence: '文法を中心に日本語を勉強しています。'
      }
    ],
    13: [
      {
        structure: 'N + を通じて (をつうじて) / を通して',
        meaning: 'Thông qua N / Suốt cả quãng N',
        explanation: 'Chỉ phương tiện trung gian hoặc khoảng thời gian kéo dài liên tục.',
        exampleSentence: '友人の紹介を通じて、仕事を見つけました。',
        exampleTranslation: 'Tôi đã tìm được việc làm thông qua lời giới thiệu của bạn bè.',
        wordsToReorder: ['友人の紹介を通じて、', '仕事を見つけました'],
        correctSentence: '友人の紹介を通じて、仕事を見つけました。'
      }
    ],
    14: [
      {
        structure: 'N + 向け (むけ)',
        meaning: 'Dành riêng cho / Hướng tới đối tượng N',
        explanation: 'Sản phẩm, tài liệu được thiết kế riêng nhằm phục vụ đối tượng N.',
        exampleSentence: 'この本は外国人向けに書かれています。',
        exampleTranslation: 'Cuốn sách này được viết dành riêng cho người nước ngoài.',
        wordsToReorder: ['この本は', '外国人向けに', '書かれています'],
        correctSentence: 'この本は外国人向けに書かれています。'
      }
    ],
    15: [
      {
        structure: 'N + によって / によると',
        meaning: 'Tùy thuộc vào N / Do N gây ra',
        explanation: 'Chỉ nguyên nhân, phương thức hoặc sự đa dạng tùy theo từng trường hợp.',
        exampleSentence: '人によって考え方が違います。',
        exampleTranslation: 'Tùy mỗi người mà cách suy nghĩ lại khác nhau.',
        wordsToReorder: ['人によって', '考え方が違います'],
        correctSentence: '人によって考え方が違います。'
      }
    ],
    16: [
      {
        structure: '[Thể thông thường / A-na / N] + に違いない (にちがいない)',
        meaning: 'Chắc chắn là... (Khẳng định 99%)',
        explanation: 'Biểu thị sự phán đoán đầy tự tin dựa trên cơ sở chắc chắn.',
        exampleSentence: 'これだけ勉強したのだから、合格するに違いない。',
        exampleTranslation: 'Đã học nhiều đến thế này thì chắc chắn sẽ thi đỗ thôi.',
        wordsToReorder: ['これだけ勉強したのだから、', '合格するに違いない'],
        correctSentence: 'これだけ勉強したのだから、合格するに違いない。'
      }
    ],
    17: [
      {
        structure: '[Thể thông thường] + ということだ',
        meaning: 'Nghe nói rằng / Có nghĩa là...',
        explanation: 'Truyền đạt lại thông tin nghe từ nguồn tin tức chính thức hoặc giải thích ý nghĩa.',
        exampleSentence: 'ニュースによると、来週から寒くなるということです。',
        exampleTranslation: 'Theo bản tin thời sự thì nghe nói từ tuần sau trời sẽ trở lạnh.',
        wordsToReorder: ['ニュースによると、', '来週から寒くなるということです'],
        correctSentence: 'ニュースによると、来週から寒くなるということです。'
      }
    ],
    18: [
      {
        structure: 'V-dict + わけにはいかない',
        meaning: 'Không thể làm V (vì đạo đức/xã hội/lương tâm)',
        explanation: 'Về mặt tâm lý hoặc đạo đức xã hội thì không thể thực hiện hành động dù có thể làm được.',
        exampleSentence: '大事な会議があるから、休むわけにはいかない。',
        exampleTranslation: 'Vì có cuộc họp rất quan trọng nên tôi không thể nghỉ được.',
        wordsToReorder: ['大事な会議があるから、', '休むわけにはいかない'],
        correctSentence: '大事な会議があるから、休むわけにはいかない。'
      }
    ],
    19: [
      {
        structure: 'V-ba + V-dict + ほど / A-i-kereba + A-i + ほど',
        meaning: 'Càng... thì càng...',
        explanation: 'Mức độ của vế sau tăng theo tỷ lệ thuận với vế trước.',
        exampleSentence: '練習すればするほど、上手になります。',
        exampleTranslation: 'Càng luyện tập nhiều thì sẽ càng giỏi lên.',
        wordsToReorder: ['練習すればするほど、', '上手になります'],
        correctSentence: '練習すればするほど、上手になります。'
      }
    ]
  },
  N2: {
    1: [
      {
        structure: 'V (bỏ ます) / N + 次第 (しだい)',
        meaning: 'Ngay khi làm V / Phụ thuộc vào N',
        explanation: 'Diễn tả hành động tiếp theo sẽ được thực hiện ngay lập tức sau khi hành động trước kết thúc. Thường dùng trang trọng trong công việc.',
        exampleSentence: '詳しいことが分かり次第、ご連絡いたします。',
        exampleTranslation: 'Ngay khi nắm được thông tin chi tiết, tôi sẽ liên lạc lại cho quý khách.',
        wordsToReorder: ['詳しいことが', '分かり次第、', 'ご連絡いたします'],
        correctSentence: '詳しいことが分かり次第、ご連絡いたします。'
      }
    ],
    2: [
      {
        structure: 'N + のもとで / のもとに',
        meaning: 'Dưới sự chỉ đạo / Dưới sự hướng dẫn của N',
        explanation: 'Tiến hành công việc hay sinh hoạt dưới sự bảo trợ, hướng dẫn của ai đó.',
        exampleSentence: '有名な教授の指導のもとで、研究を進めている。',
        exampleTranslation: 'Dưới sự hướng dẫn của vị giáo sư nổi tiếng, tôi đang tiến hành nghiên cứu.',
        wordsToReorder: ['有名な教授の指導のもとで、', '研究を進めている'],
        correctSentence: '有名な教授の指導のもとで、研究を進めている。'
      }
    ],
    3: [
      {
        structure: '[Thể thông thường / A-na / N-no] + ばかりに',
        meaning: 'Chỉ vì... mà dẫn đến kết quả xấu',
        explanation: 'Chỉ một nguyên nhân duy nhất dẫn đến hậu quả tiêu cực ngoài ý muốn.',
        exampleSentence: '嘘をついたばかりに、友達の信用を失ってしまった。',
        exampleTranslation: 'Chỉ vì nói dối một lần mà tôi đã đánh mất niềm tin của bạn bè.',
        wordsToReorder: ['嘘をついたばかりに、', '友達の信用を失ってしまった'],
        correctSentence: '嘘をついたばかりに、友達の信用を失ってしまった。'
      }
    ],
    4: [
      {
        structure: 'V (bỏ ます) + ようがない',
        meaning: 'Không có cách nào để... / Không thể nào...',
        explanation: 'Dù muốn làm nhưng hoàn toàn không còn cách nào khác để thực hiện.',
        exampleSentence: '連絡先が分からないので、連絡しようがない。',
        exampleTranslation: 'Vì không biết thông tin liên lạc nên không có cách nào liên lạc được.',
        wordsToReorder: ['連絡先が分からないので、', '連絡しようがない'],
        correctSentence: '連絡先が分からないので、連絡しようがない。'
      }
    ],
    5: [
      {
        structure: 'V-nai (bỏ ない) + ざるを得ない (ざるをえない)',
        meaning: 'Đành phải / Buộc lòng phải làm...',
        explanation: 'Dù không muốn nhưng vì tình thế ép buộc nên bắt buộc phải làm.',
        exampleSentence: '台風で電車が止まったので、歩いて帰らざるを得ない。',
        exampleTranslation: 'Vì bão nên tàu điện ngừng chạy, tôi đành phải đi bộ về nhà.',
        wordsToReorder: ['台風で電車が止まったので、', '歩いて帰らざるを得ない'],
        correctSentence: '台風で電車が止まったので、歩いて帰らざるを得ない。'
      }
    ],
    6: [
      {
        structure: '[Thể thông thường / N] + のみならず',
        meaning: 'Không chỉ... mà còn...',
        explanation: 'Cách nói trang trọng biểu thị phạm vi rộng mở, không dừng lại ở một đối tượng.',
        exampleSentence: 'この製品は日本国内のみならず、海外でも人気がある。',
        exampleTranslation: 'Sản phẩm này không chỉ nổi tiếng trong nước Nhật mà còn được ưa chuộng ở nước ngoài.',
        wordsToReorder: ['この製品は日本国内のみならず、', '海外でも人気がある'],
        correctSentence: 'この製品は日本国内のみならず、海外でも人気がある。'
      }
    ],
    7: [
      {
        structure: '[Thể thông thường / A-na(な)] + 反面 (はんめん)',
        meaning: 'Mặt khác / Ngược lại / Trái ngược với...',
        explanation: 'Nêu bật hai mặt trái ngược của cùng một sự vật hoặc hiện tượng.',
        exampleSentence: '都会の生活は便利な反面、ストレスも多い。',
        exampleTranslation: 'Cuộc sống thành thị tiện nghi là thế, nhưng mặt khác cũng đầy rẫy áp lực.',
        wordsToReorder: ['都会の生活は便利な反面、', 'ストレスも多い'],
        correctSentence: '都会の生活は便利な反面、ストレスも多い。'
      }
    ],
    8: [
      {
        structure: 'N + から言うと / から言えば',
        meaning: 'Xét từ góc độ N / Đứng trên lập trường N',
        explanation: 'Đưa ra nhận xét, đánh giá căn cứ theo một góc nhìn cụ thể.',
        exampleSentence: '専門家の立場から言うと、この計画には問題がある。',
        exampleTranslation: 'Xét từ góc độ của một chuyên gia thì kế hoạch này còn tồn tại vấn đề.',
        wordsToReorder: ['専門家の立場から言うと、', 'この計画には問題がある'],
        correctSentence: '専門家の立場から言うと、この計画には問題がある。'
      }
    ],
    9: [
      {
        structure: 'N + はともかく (として)',
        meaning: 'Tạm thời gác lại N sang một bên...',
        explanation: 'Ưu tiên nhấn mạnh vế sau, còn đối tượng N ở vế trước tạm chưa bàn tới.',
        exampleSentence: '結果はともかく、全力を尽くしたことが大切だ。',
        exampleTranslation: 'Kết quả thế nào tạm gác lại, điều quan trọng là đã nỗ lực hết mình.',
        wordsToReorder: ['結果はともかく、', '全力を尽くしたことが大切だ'],
        correctSentence: '結果はともかく、全力を尽くしたことが大切だ。'
      }
    ],
    10: [
      {
        structure: 'N / V-dict + にかかわらず / にかかわりなく',
        meaning: 'Bất kể / Không phân biệt / Không màng đến N',
        explanation: 'Hành động hoặc kết quả xảy ra đồng nhất mà không bị chi phối bởi điều kiện N.',
        exampleSentence: '天候にかかわらず、試合は予定通り行われます。',
        exampleTranslation: 'Bất kể thời tiết thế nào, trận đấu vẫn diễn ra đúng theo dự kiến.',
        wordsToReorder: ['天候にかかわらず、', '試合は予定通り行われます'],
        correctSentence: '天候にかかわらず、試合は予定通り行われます。'
      }
    ]
  },
  N1: {
    1: [
      {
        structure: 'V-dict / N + に伴って (にともなって)',
        meaning: 'Cùng với sự biến đổi của... thì kéo theo...',
        explanation: 'Khi một trạng thái thay đổi thì trạng thái khác cũng biến đổi theo tỷ lệ tương ứng.',
        exampleSentence: '経済の発展に伴って、人々の生活様式も変化した。',
        exampleTranslation: 'Cùng với sự phát triển của nền kinh tế, lối sống của người dân cũng thay đổi theo.',
        wordsToReorder: ['経済の発展に伴って、', '人々の生活様式も変化した'],
        correctSentence: '経済の発展に伴って、人々の生活様式も変化した。'
      }
    ],
    2: [
      {
        structure: 'V-dict + や否や (やいなや)',
        meaning: 'Vừa dứt làm V thì lập tức ngay...',
        explanation: 'Diễn tả hành động vế sau diễn ra tức thì ngay khi hành động vế trước vừa chấm dứt.',
        exampleSentence: 'ベルが鳴るや否や、生徒たちは教室を飛び出した。',
        exampleTranslation: 'Chuông vừa reo dứt là các em học sinh lập tức ùa ra khỏi lớp.',
        wordsToReorder: ['ベルが鳴るや否や、', '生徒たちは教室を飛び出した'],
        correctSentence: 'ベルが鳴るや否や、生徒たちは教室を飛び出した。'
      }
    ],
    3: [
      {
        structure: 'N + ならでは(の)',
        meaning: 'Chỉ có ở N / Đặc trưng độc nhất của N',
        explanation: 'Ca ngợi đặc điểm ưu việt, độc đáo chỉ riêng đối tượng N mới có được.',
        exampleSentence: '京都ならではの素晴らしい伝統文化を体験できた。',
        exampleTranslation: 'Tôi đã được trải nghiệm nét văn hóa truyền thống tuyệt vời chỉ có tại Kyoto.',
        wordsToReorder: ['京都ならではの素晴らしい', '伝統文化を体験できた'],
        correctSentence: '京都ならではの素晴らしい伝統文化を体験できた。'
      }
    ],
    4: [
      {
        structure: 'N / [Thể thông thường] + であれ / であろうと',
        meaning: 'Dẫu cho là / Cho dù có là...',
        explanation: 'Khẳng định lập trường hoặc nguyên tắc không đổi dù đối tượng có là bất kỳ ai hay điều gì.',
        exampleSentence: 'たとえ大統領であれ、法を守らなければならない。',
        exampleTranslation: 'Dẫu cho có là Tổng thống thì cũng phải tuân thủ pháp luật.',
        wordsToReorder: ['たとえ大統領であれ、', '法を守らなければならない'],
        correctSentence: 'たとえ大統領であれ、法を守らなければならない。'
      }
    ]
  }
};
