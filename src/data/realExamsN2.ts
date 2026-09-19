import { DailyExam } from '../types';

export const REAL_EXAMS_N2: DailyExam[] = [
  {
    id: 'jlpt_n2_official_past_2024_07',
    title: 'Đề thi chính thức JLPT N2 - Tháng 07/2024',
    level: 'N2',
    year: '2024',
    session: 'Tháng 07/2024',
    category: 'official_past',
    durationMinutes: 155,
    questions: [
      // --- 問題1: ___の言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n2_2407_m1_1',
        question: '問題の原因を【究明】するために専門家チームが結成された。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['きゅうめい', 'きゅうみょう', 'けんめい', 'こうめい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '究明 đọc là きゅうめい (kyuumei), nghĩa là nghiên cứu làm sáng tỏ chân tướng.'
      },
      {
        id: 'n2_2407_m1_2',
        question: '提案された企画書の内容を慎重に【検討】する。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['けんとう', 'けんとく', 'けんしょう', 'けんさく'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '検討 đọc là けんとう (kentou), nghĩa là xem xét, thảo luận cân nhắc.'
      },
      {
        id: 'n2_2407_m1_3',
        question: 'この小説は人間の【心理】を実に巧みに描いている。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['しんり', 'じんり', 'しんれい', 'しんたい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '心理 đọc là しんり (shinri), nghĩa là tâm lý.'
      },
      {
        id: 'n2_2407_m1_4',
        question: '突然のトラブルにも【柔軟】に対応することが求められる。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['じゅうなん', 'じゅうぜん', 'にゅうなん', 'やわなん'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '柔軟 đọc là じゅうなん (juunan), nghĩa là linh hoạt, mềm dẻo.'
      },
      {
        id: 'n2_2407_m1_5',
        question: '急激な気候変動が生態系に与える影響は【計り知れない】。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['はかりしれない', 'わかりしれない', 'しりきれない', 'みつもりしれない'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '計り知れない đọc là はかりしれない (hakarishirenai), nghĩa là khôn lường, không thể đong đếm được.'
      },

      // --- 問題2: ___の言葉を漢字で書くとき、最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n2_2407_m2_1',
        question: '会議の進行を【さまたげる】ような行為は慎んでください。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['妨げる', '遮げる', '防げる', '拒げる'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'さまたげる viết Kanji là 妨げる (Phương - cản trở, gây trở ngại).'
      },
      {
        id: 'n2_2407_m2_2',
        question: '古い建物を改修して【ほぞん】する。',
        hint: 'Chọn chữ Kanji đúng của từ trong ngoặc 【】',
        options: ['保存', '保在', '補存', '補在'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'ほぞん viết Kanji là 保存 (Bảo tồn).'
      },

      // --- 問題3: （　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n2_2407_m3_1',
        question: '今回のプロジェクトは、（　　）予算をオーバーしてしまった。',
        hint: 'Chọn từ chỉ mức độ phù hợp',
        options: ['大幅に', '大層に', '大げさに', '大雑把に'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '大幅に (oohaba ni) nghĩa là vượt bậc, trên diện rộng, đáng kể (vượt ngân sách lớn).'
      },
      {
        id: 'n2_2407_m3_2',
        question: '契約を結ぶ前に、規約を（　　）確認してください。',
        hint: 'Chọn phó từ phù hợp',
        options: ['くれぐれも', 'あらかじめ', 'ことごとく', 'おのずと'],
        correctIndex: 1,
        section: 'moji-goi',
        explanation: 'あらかじめ (sẵn, trước): kiểm tra trước điều khoản hợp đồng.'
      },

      // --- 文法 問題1: （　　）に入る最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n2_2407_g1_1',
        question: 'たとえ周囲の人々に反対されよう（　　）、私は自分の信じる道を進む。',
        hint: 'Chọn cấu trúc: Cho dù... đi chăng nữa',
        options: ['とも', 'が', 'のに', 'もの'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'たとえ...V-よう とも: Cho dù... đi chăng nữa (nhấn mạnh ý chí quyết tâm).'
      },
      {
        id: 'n2_2407_g1_2',
        question: '彼の仕事に対する真摯な姿勢には、敬服せざるを（　　）。',
        hint: 'Chọn cấu trúc: Đành phải / Không thể không...',
        options: ['得ない', 'いかない', 'きれない', 'おかない'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-ざるを得ない: Không thể không... / Đành phải khâm phục.'
      },
      {
        id: 'n2_2407_g1_3',
        question: '景気の緩やかな回復に伴い、有効求人倍率も上昇し（　　）ある。',
        hint: 'Chọn cấu trúc diễn tả xu hướng đang dần tiếp diễn',
        options: ['つつ', 'がちで', 'っぽく', 'がてら'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-stem + つつある: Đang dần dần có xu hướng...'
      },
      {
        id: 'n2_2407_g1_4',
        question: '両者の合意がない（　　）、この契約を一方的に破棄することはできない。',
        hint: 'Chọn cấu trúc: Chừng nào chưa...',
        options: ['限り', 'うちに', 'ように', 'とおりに'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: '〜ない限り: Chừng nào còn chưa có sự đồng thuận của đôi bên thì không thể hủy.'
      },

      // --- 読解 (Dokkai) ---
      {
        id: 'n2_2407_d1',
        question: '【短文】次の文章を読んで、質問に答えなさい。\n\n「生成AIの技術革新によって、定型的な業務やデータ処理はかつてないスピードで自動化されつつある。しかし、他者への深い共感や倫理的判断、文脈を読み取った上での柔軟な合意形成といった人間の能力は、依然として機械に代替されることはない。これからの時代に求められるのは、AIを使いこなす技術だけでなく、人間ならではの強みを磨くことである。」\n\n質問：筆者が現代人に最も求めていることは何か。',
        hint: 'Đọc câu cuối cùng của đoạn văn để thấy thông điệp cốt lõi',
        options: [
          'AIの技術開発にすべての時間を費やすこと。',
          'AIを使いこなすとともに、共感や倫理的判断など人間特有の強みを高めること。',
          '定型的な業務をすべて手作業に戻すこと。',
          '自動化の技術を全面的に禁止すること。'
        ],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Tác giả nêu rõ: "AIを使いこなす技術だけでなく、共感や倫理的判断といった人間ならではの強みを磨くことが求められる".'
      },

      // --- 聴解 (Choukai) ---
      {
        id: 'n2_2407_c1',
        question: '【問題1】会社の会議で部長と課長が話しています。海外展開について、二人はどのような結論を出しましたか。',
        hint: 'Nghe xác định quyết định cuối cùng của ban quản lý',
        options: [
          'すぐに現地に新規店舗を出店する。',
          'まず現地での徹底した市場調査を実施する。',
          '海外進出の計画自体を白紙に戻す。',
          'オンライン通信販売のみに限定する。'
        ],
        correctIndex: 1,
        section: 'choukai',
        audioScript: '部長：アジア市場への進出だが、急いで出店するより、まず現地の消費動向や法規制を正確に把握すべきだと思う。\n課長：全く同感です。来月専門の調査チームを派遣し、徹底的な現地調査から着手しましょう。\n部長：よし、その方針で進めてくれ。',
        explanation: 'Cả hai đồng thuận: "まず現地の消費動向を把握... 徹底的な現地調査から着手しましょう" -> Thực hiện khảo sát thị trường kỹ lưỡng trước (まず現地での徹底した市場調査を実施する).'
      }
    ]
  }
];
