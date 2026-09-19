import { DailyExam } from '../types';

export const REAL_EXAMS_N1: DailyExam[] = [
  {
    id: 'jlpt_n1_official_past_2024_07',
    title: 'Đề thi chính thức JLPT N1 - Tháng 07/2024',
    level: 'N1',
    year: '2024',
    session: 'Tháng 07/2024',
    category: 'official_past',
    durationMinutes: 170,
    questions: [
      // --- 問題1: ___の言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n1_2407_m1_1',
        question: '彼はどれほどの逆境に直面しても、決して【屈する】ことがない。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['くっする', 'くつする', 'かがむ', 'へこむ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '屈する đọc là くっする (kussuru), nghĩa là khuất phục, đầu hàng nghịch cảnh.'
      },
      {
        id: 'n1_2407_m1_2',
        question: '国境付近での武力紛争の【勃発】により、国際社会に緊張が走った。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['ぼっぱつ', 'とつはつ', 'じつはつ', 'ばくはつ'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '勃発 đọc là ぼっぱつ (boppatsu), nghĩa là bùng nổ, bùng phát bất ngờ.'
      },
      {
        id: 'n1_2407_m1_3',
        question: '複雑に絡み合った課題を解決するためには【多角的な】分析が不可欠だ。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['たかくてきな', 'たかくけいな', 'おおかくてきな', 'たかっけいな'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '多角的 đọc là たかくてき (takakuteki), nghĩa là đa chiều, nhiều góc độ tiếp cận.'
      },
      {
        id: 'n1_2407_m1_4',
        question: '長年の功績が評価され、ついに名誉職に【推戴】された。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['すいたい', 'おいたい', 'すいだい', 'すいさい'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '推戴 đọc là すいたい (suitai), nghĩa là suy tôn, tôn kính đề bạt lên vị trí cao.'
      },
      {
        id: 'n1_2407_m1_5',
        question: '相手の巧みな話術に【翻弄】されてしまった。',
        hint: 'Chọn cách đọc đúng của chữ Kanji trong ngoặc 【】',
        options: ['ほんろう', 'はんろう', 'ほんよう', 'ほんそう'],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '翻弄 đọc là ほんろう (honrou), nghĩa là trêu đùa, thao túng, xoay như chong chóng.'
      },

      // --- 問題2: ___の言葉に意味が最も近いものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n1_2407_m2_1',
        question: '今回の不祥事の真相は、結局【うやむや】にされてしまった。',
        hint: 'Chọn câu có ý nghĩa gần nhất',
        options: [
          '今回の不祥事の真相は、あいまいなまま処理されてしまった。',
          '今回の不祥事の真相は、迅速に公表された。',
          '今回の不祥事の真相は、厳重に処罰された。',
          '今回の不祥事の真相は、法的に解決された。'
        ],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: 'うやむやにする = あいまいにして、はっきりさせないままにする (bưng bít mập mờ).'
      },
      {
        id: 'n1_2407_m2_2',
        question: '彼の説明はいつも【簡潔】で分かりやすい。',
        hint: 'Chọn câu có ý nghĩa gần nhất',
        options: [
          '彼の説明はいつも要点が短くまとまっている。',
          '彼の説明はいつも複雑で長い。',
          '彼の説明はいつも感情的である。',
          '彼の説明はいつも専門用語ばかりだ。'
        ],
        correctIndex: 0,
        section: 'moji-goi',
        explanation: '簡潔 (kanketsu) = 要点が短く分かりやすくまとまっている (ngắn gọn súc tích).'
      },

      // --- 文法 問題1: （　　）に入る最もよいものを、1・2・3・4から一つ選びなさい。 ---
      {
        id: 'n1_2407_g1_1',
        question: '警察の懸命な捜査にもかかわらず、犯人の行方はつかめず（　　）だった。',
        hint: 'Chọn cấu trúc: Rốt cuộc đã không thể làm được...',
        options: ['じまい', 'まみれ', 'ずくめ', 'っぱなし'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-ずじまい: Rốt cuộc kết thúc mà không thể làm được việc gì đó.'
      },
      {
        id: 'n1_2407_g1_2',
        question: 'たとえわずかな望みである（　　）、最後まで全力で挑む所存です。',
        hint: 'Chọn cấu trúc: Dù là... đi nữa',
        options: ['にせよ', 'とあれば', 'ともなると', 'ならでは'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: '〜にせよ / 〜にしろ: Dù cho là... đi chăng nữa.'
      },
      {
        id: 'n1_2407_g1_3',
        question: '彼の圧倒的なプレゼンテーションは、聴衆を魅了せずには（　　）。',
        hint: 'Chọn cấu trúc: Nhất định sẽ làm cho đối phương bị cuốn hút',
        options: ['おかなかった', 'すまなかった', 'やまなかった', 'いられなかった'],
        correctIndex: 0,
        section: 'bunpou',
        explanation: 'V-ずにはおかない: Nhất định sẽ làm cho... / Khiến cho ai đó phải...'
      },

      // --- 読解 (Dokkai) ---
      {
        id: 'n1_2407_d1',
        question: '【短文】次の文章を読んで、質問に答えなさい。\n\n「情報社会における過度な即時性と常時接続は、個人の思考を断片化し、じっくりと自己と向き合う内省の時間を奪い去りつつある。深く物事の本質を思索する知的空間を自覚的に確保しなければ、表層的な情報に翻弄される受動的な存在に甘んじることになるだろう。」\n\n質問：筆者が最も警鐘を鳴らしていることは何か。',
        hint: 'Xác định điều tác giả đang cảnh báo',
        options: [
          '情報の伝達速度が遅すぎること。',
          '常時接続により内省と思索の時間が失われ、表層的な情報に流されること。',
          '通信機器の購入費用が高騰していること。',
          '紙媒体の書籍が完全に消滅すること。'
        ],
        correctIndex: 1,
        section: 'dokkai',
        explanation: 'Tác giả cảnh báo việc mất đi thời gian nội tâm và tự suy ngẫm (内省と思索の時間の喪失) khiến con người trở nên thụ động và bị cuốn theo luồng thông tin bề mặt.'
      },

      // --- 聴解 (Choukai) ---
      {
        id: 'n1_2407_c1',
        question: '【問題1】学術シンポジウムで経済学者が講演しています。講演者は今後の国家財政のあり方について、何を最も強調していますか。',
        hint: 'Nghe xác định trọng tâm thông điệp của diễn giả',
        options: [
          '短期的な景気刺激策を無制限に継続すること。',
          '中長期的な視点に立った構造改革と持続可能なイノベーション投資。',
          'すべての社会保障費を即座に凍結すること。',
          '海外市場からの完全な撤退。'
        ],
        correctIndex: 1,
        section: 'choukai',
        audioScript: '講演者：目先の景気浮揚策に終始するのではなく、中長期的な視座に立った構造改革と、未来のイノベーションを育む持続的な投資こそが、我が国経済の強靭性を確保する唯一の処方箋であります。',
        explanation: 'Diễn giả nhấn mạnh: "中長期的な構造改革と持続的イノベーション投資こそが唯一の処方箋" -> Cải cách thể chế trung dài hạn và đầu tư đổi mới sáng tạo bền vững.'
      }
    ]
  }
];
