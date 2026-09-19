import { DailyExam } from '../types';

export const REAL_EXAMS_N3: DailyExam[] = [
  {
    id: 'jlpt_n3_official_past_2024_07',
    title: 'Đề thi chính thức JLPT N3 - Tháng 07/2024',
    level: 'N3',
    year: '2024',
    session: 'Tháng 07/2024',
    category: 'official_past',
    durationMinutes: 140,
    questions: [
      // --- 問題1: ___の言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n3_2407_m1_1',
        question: 'この地域は毎年のように【災害】に見舞われている。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['さいがい', 'さいなん', 'こうずい', 'じしん'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '災害 đọc là さいがい (saigai), nghĩa là thiên tai, thảm họa.'
      },
      {
        id: 'n3_2407_m1_2',
        question: '契約内容を確認の上、こちらに【署名】をお願いします。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['しょめい', 'いんかん', 'サイン', 'しゅうせい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '署名 đọc là しょめい (shomei), nghĩa là chữ ký, ký tên.'
      },
      {
        id: 'n3_2407_m1_3',
        question: '市民の意見を広く【募る】ことにした。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['つのる', 'つねる', 'あつめる', 'いのる'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '募る đọc là つのる (tsunoru), nghĩa là chiêu mộ, thu thập ý kiến.'
      },
      {
        id: 'n3_2407_m1_4',
        question: '彼はいつも【冷静】に状況を判断する。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['れいせい', 'れいしょう', 'れいかん', 'つめたい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '冷静 đọc là れいせい (reisei), nghĩa là bình tĩnh, điềm tĩnh.'
      },
      {
        id: 'n3_2407_m1_5',
        question: '新商品の【需要】が急速に伸びている。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['じゅよう', 'しゅよう', 'じゅうよう', 'きゅうよう'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '需要 đọc là じゅよう (juyou), nghĩa là nhu cầu tiêu dùng.'
      },

      // --- 問題2: ___の言葉を漢字で書くとき、最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n3_2407_m2_1',
        question: '今回の失敗を深く【はんせい】しています。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['反省', '反政', '犯省', '返省'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'はんせい viết Kanji là 反省 (Phản tỉnh - kiểm điểm, tự suy ngẫm).'
      },
      {
        id: 'n3_2407_m2_2',
        question: '会場の【せつび】が整っている。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['設備', '設費', '設美', '施備'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'せつび viết Kanji là 設備 (Thiết bị, cơ sở vật chất).'
      },
      {
        id: 'n3_2407_m2_3',
        question: 'この薬品の【こうか】を試す。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['効果', '効歌', '交果', '効下'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'こうか viết Kanji là 効果 (Hiệu quả).'
      },

      // --- 問題3: （　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n3_2407_m3_1',
        question: '彼の話を聞いて、（　　）として涙がこぼれそうになった。',
        hint: 'Chọn phó từ thích hợp vào chỗ trống （）',
        options: ['思わず', '思い切り', '思いがけず', '思いのほか'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '思わず (omowazu) nghĩa là "bất giác, vô thức, không kìm được".'
      },
      {
        id: 'n3_2407_m3_2',
        question: '旅行の計画を立てたが、仕事が入って（　　）になった。',
        hint: 'Chọn từ thích hợp vào chỗ trống （）',
        options: ['ストップ', 'キャンセル', 'チェンジ', 'スタート'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: 'キャンセルになる nghĩa là bị hủy bỏ kế hoạch.'
      },
      {
        id: 'n3_2407_m3_3',
        question: '試験の前日は緊張して（　　）眠れなかった。',
        hint: 'Chọn phó từ thích hợp vào chỗ trống （）',
        options: ['めっきり', 'すっかり', 'ちっとも', 'うっかり'],
        correctIndex: 2,
        section: 'moji-goi',
        explanation: 'ちっとも...ない nghĩa là "hoàn toàn không... một chút nào".'
      },

      // --- 問題4: ___の言葉に意味が最も近いものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n3_2407_m4_1',
        question: '彼の説明を聞いても、【さっぱり】分からなかった。',
        hint: 'Chọn câu có ý nghĩa gần nhất với câu trên',
        options: [
          '彼の説明を聞いても、全然分からなかった。',
          '彼の説明を聞いて、少しだけ分かった。',
          '彼の説明を聞いて、はっきりと分かった。',
          '彼の説明を聞いて、だいたい分かった。'
        ],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'さっぱり + phủ định = 全然...ない (hoàn toàn không hiểu gì cả).'
      },
      {
        id: 'n3_2407_m4_2',
        question: '彼女は【思いがけない】知らせに驚いた。',
        hint: 'Chọn câu có ý nghĩa gần nhất với câu trên',
        options: [
          '彼女は予想外の知らせに驚いた。',
          '彼女は悲しい知らせに驚いた。',
          '彼女はうれしい知らせに驚いた。',
          '彼女は有名な知らせに驚いた。'
        ],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '思いがけない = 予想外の (ngoài dự đoán, bất ngờ không lường trước).'
      },

      // --- 問題5: 次の言葉の使い方として最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n3_2407_m5_1',
        question: '【せっせと】',
        hint: 'Chọn câu sử dụng đúng từ せっせと (chăm chỉ, miệt mài)',
        options: [
          '彼は将来の夢のために、毎日せっせと勉強している。',
          'せっせと歩いたので、電車に遅れてしまった。',
          '天気がせっせと良くなってきた。',
          'この部屋はせっせと広くて住みやすい。'
        ],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'せっせと đi với hành động chăm chỉ, miệt mài làm việc/học tập (せっせと勉強する).'
      },

      // --- 文法 問題1: （　　）に入る最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n3_2407_g1_1',
        question: '彼女は何事もなかったか（　　）、静かに微笑んでいた。',
        hint: 'Chọn ngữ pháp thích hợp: như thể là...',
        options: ['のように', 'みたいに', 'らしく', 'そうに'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'まるで...かのようだ / かのように: như thể là (gương mặt mỉm cười như thể không có chuyện gì xảy ra).'
      },
      {
        id: 'n3_2407_g1_2',
        question: '締め切りに間に合う（　　）、夜遅くまで作業を続けた。',
        hint: 'Chọn ngữ pháp chỉ mục đích cho động từ không ý chí (間に合う)',
        options: ['ように', 'ために', 'とおりに', 'おかげで'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-khả năng / V-không ý chí + ように (để kịp hạn chót: 間に合うように).'
      },
      {
        id: 'n3_2407_g1_3',
        question: 'この薬は食後に服用する（　　）になっています。',
        hint: 'Chọn ngữ pháp chỉ quy định, quy tắc',
        options: ['こと', 'もの', 'よう', 'わけ'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: '〜ことになっている: được quy định là..., trở thành quy tắc.'
      },
      {
        id: 'n3_2407_g1_4',
        question: '子供の頃は野菜が嫌いだったが、大人になるに（　　）食べられるようになった。',
        hint: 'Chọn ngữ pháp chỉ sự biến đổi cùng với tiến trình',
        options: ['つれて', 'とって', 'かんして', 'たいして'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: '〜につれて: càng... càng..., cùng với sự lớn lên (大人になるにつれて).'
      },
      {
        id: 'n3_2407_g1_5',
        question: '彼の素晴らしい演奏を聞いて、感動せずには（　　）。',
        hint: 'Chọn ngữ pháp không kìm nén được cảm xúc',
        options: ['いられなかった', 'いられなかったそうだ', 'いられないわけだ', 'いられないはずだ'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-ずにはいられない: không thể không..., không kìm nén được.'
      },

      // --- 文法 問題2: 次の文の ★ に入る最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n3_2407_g2_1',
        question: 'いくら ____ ____ ★ ____ 、諦めてはいけない。\n(1) 困難が  (2) あろうと  (3) そこに  (4) どんなに',
        hint: 'Sắp xếp: いくら (4)どんなに (1)困難が (3)そこに (2)あろうと★ 、諦めてはいけない。',
        options: ['(4) どんなに', '(1) 困難が', '(3) そこに', '(2) あろうと'],
        correctIndex: 3,
        section: 'bunpou',
        explanation: 'Thứ tự đúng: どんなに(4) 困難が(1) そこに(3) あろうと(2)★. Vị trí ngôi sao là (2).'
      },

      // --- 読解 (Dokkai) ---
      {
        id: 'n3_2407_d1',
        question: '【短文】次の文章を読んで、質問に答えなさい。\n\n「近年、リモートワークが普及したことで、通勤の負担が減り、自分の時間を有効に使える人が増えた。しかしその一方で、仕事と私生活の境界があいまいになり、常に仕事の連絡を気にしてしまい、精神的な疲労を感じる人も少なくないという。便利な道具や制度も、使い方を誤ればかえって生活の質を下げることになる。」\n\n質問：筆者が最も伝えたいことは何か。',
        hint: 'Đọc kỹ luận điểm kết bài của tác giả',
        options: [
          'リモートワークは通勤時間がなくなるので絶対に推進すべきだ。',
          '便利なリモートワークも、使い方に気をつけないと生活の質を損なう恐れがある。',
          '私生活を重視するために、仕事をすべて辞めるべきだ。',
          '仕事と私生活の境界を分けることは不可能である。'
        ],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Tác giả chốt lại: "便利な道具や制度も、使い方を誤ればかえって生活の質を下げることになる" -> Các công cụ/chế độ tiện lợi nếu không dùng đúng cách có thể làm giảm chất lượng sống.'
      },
      {
        id: 'n3_2407_d2',
        question: '【情報検索】次の案内を読んで、質問に答えなさい。\n\n「【市民センター パソコン講座のご案内】\n・対象：市内在住または在勤の18歳以上の方\n・受講料：無料（テキスト代 1,500円のみ実費負担）\n・申込方法：往復はがき、またはホームページの専用フォームより\n・申込締切：7月15日（金）必着（定員を超えた場合は抽選）\n※電話での申し込みは受け付けておりません。」\n\n質問：この講座の申し込み方法として正しいものはどれですか。',
        hint: 'Xem mục phương thức đăng ký và lưu ý không nhận qua điện thoại',
        options: [
          '電話で直接申し込む。',
          '往復はがき、または専用ウェブフォームから申し込む。',
          '当日会場に直接行って申し込む。',
          'テキスト代を事前に現金書留で送る。'
        ],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Thông báo ghi rõ: "申込方法：往復はがき、またはホームページの専用フォームより（電話受付不可）".'
      },

      // --- 聴解 (Choukai) ---
      {
        id: 'n3_2407_c1',
        question: '【問題1 - 課題理解】会社で男の人と女の人が話しています。男の人はこれからまず何をしますか。',
        hint: 'Nghe xác định việc ưu tiên làm ngay',
        options: ['会議室を予約する', 'プレゼン資料の数字を修正する', '取引先に電話をかける', '部長に報告する'],
        correctIndex: 1,
        section: 'choukai',
        audioScript: '女：佐藤さん、午後のプレゼン資料をチェックしたんですが、3ページの売上データに少し誤りがありました。\n男：本当ですか！すぐ直します。\n女：ええ、会議室の予約は私がやっておくので、まず資料の修正を最優先でお願いしますね。\n男：分かりました。今すぐ取りかかります！',
        explanation: 'Nữ dặn "まず資料の修正を最優先でお願いします" và nam đáp "今すぐ取りかかります" -> Người nam sẽ sửa số liệu tài liệu thuyết trình trước (プレゼン資料の数字を修正する).'
      }
    ]
  }
];
