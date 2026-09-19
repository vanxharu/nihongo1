/**
 * Web Notification & Background Sync Service for JPStudy
 * Supports Windows Desktop Toast / Floating Notifications with JLPT Level filtering & Background Web Worker
 */

import { MINNA_N5_VOCABULARY } from '../data/minnaN5Vocab';
import { MINNA_N4_VOCABULARY } from '../data/minnaN4Vocab';
import { TANGO_N4_VOCABULARY } from '../data/tangoN4Vocab';
import { ADVANCED_VOCABULARY } from '../data/advancedVocab';
import {
  getHanViet,
  getSentenceHiraganaReading,
  getSentenceFuriganaParts,
  hasKanji,
  kanaToRomaji,
  KANJI_TO_HAN_VIET,
  SINGLE_KANJI_READINGS,
  cleanVocabSymbols,
  findBestFuriganaPartition
} from './japaneseUtils';
import { BRAND_NAME } from '../constants/brand';

export type NotificationThemeKey = 'obsidian' | 'midnight' | 'emerald' | 'sunset' | 'sakura' | 'snowLight' | 'custom';

export const NOTIFICATION_THEMES: Record<NotificationThemeKey, {
  name: string;
  bgStart: string;
  bgEnd: string;
  borderColor: string;
  kanjiColor: string;
  furiganaColor: string;
  meaningColor: string;
  accentColor: string;
  boxBg: string;
}> = {
  obsidian: {
    name: 'Tối Obsidian (Thanh lịch)',
    bgStart: '#060a14',
    bgEnd: '#0e172a',
    borderColor: '#334155',
    kanjiColor: '#ffffff',
    furiganaColor: '#fde047',
    meaningColor: '#ffffff',
    accentColor: '#38bdf8',
    boxBg: '#050a15'
  },
  midnight: {
    name: 'Xanh Dạ Thẫm (Cyber Indigo)',
    bgStart: '#0f172a',
    bgEnd: '#1e1b4b',
    borderColor: '#6366f1',
    kanjiColor: '#ffffff',
    furiganaColor: '#38bdf8',
    meaningColor: '#f1f5f9',
    accentColor: '#c084fc',
    boxBg: '#0b0f20'
  },
  emerald: {
    name: 'Ngọc Lục Bảo (Zen Green)',
    bgStart: '#022c22',
    bgEnd: '#064e3b',
    borderColor: '#10b981',
    kanjiColor: '#ffffff',
    furiganaColor: '#a7f3d0',
    meaningColor: '#ecfdf5',
    accentColor: '#34d399',
    boxBg: '#021e17'
  },
  sunset: {
    name: 'Hoàng Hôn (Warm Amber)',
    bgStart: '#2a0808',
    bgEnd: '#451a03',
    borderColor: '#f97316',
    kanjiColor: '#ffffff',
    furiganaColor: '#fbbf24',
    meaningColor: '#fff7ed',
    accentColor: '#f43f5e',
    boxBg: '#1c0505'
  },
  sakura: {
    name: 'Hoa Anh Đào (Sakura Pink)',
    bgStart: '#2d0a1e',
    bgEnd: '#4a0e2e',
    borderColor: '#ec4899',
    kanjiColor: '#ffffff',
    furiganaColor: '#f472b6',
    meaningColor: '#fdf2f8',
    accentColor: '#fb7185',
    boxBg: '#1e0714'
  },
  snowLight: {
    name: 'Sáng Tương Phản (Crisp Light)',
    bgStart: '#ffffff',
    bgEnd: '#f1f5f9',
    borderColor: '#94a3b8',
    kanjiColor: '#0f172a',
    furiganaColor: '#d97706',
    meaningColor: '#0f172a',
    accentColor: '#0284c7',
    boxBg: '#e2e8f0'
  },
  custom: {
    name: 'Tùy chỉnh cá nhân',
    bgStart: '#060a14',
    bgEnd: '#0e172a',
    borderColor: '#334155',
    kanjiColor: '#ffffff',
    furiganaColor: '#fde047',
    meaningColor: '#ffffff',
    accentColor: '#38bdf8',
    boxBg: '#050a15'
  }
};

export type VocabSourceScope = 'active' | 'tango' | 'minna_n5' | 'minna_n4' | 'custom_lesson' | 'all';

export interface ReminderSettings {
  enabled: boolean;
  time: string; // "HH:mm" format, e.g., "20:00"
  lastNotifiedDate?: string; // "YYYY-MM-DD"
  
  // Windows Floating Vocabulary notification settings
  vocabEnabled?: boolean;
  vocabInterval?: number; // interval in minutes: 1, 3, 5, 10, 15, 30, 60, 120
  vocabPlaySound?: boolean;
  vocabLevels?: string[]; // e.g. ["N5", "N4", "N3", "N2", "N1"]
  vocabRequireInteraction?: boolean; // Keep notification floating on Windows screen until dismissed
  hideNotificationText?: boolean; // Hide redundant text lines on Windows Toast so only the card image is shown
  lastVocabNotifiedTime?: number; // timestamp

  // Scope & Curriculum filter for Windows notification
  vocabSourceScope?: VocabSourceScope; // 'active' (default: theo giáo trình & bài đang học), 'tango', 'minna_n5', 'minna_n4', 'custom_lesson', 'all'
  vocabSelectedLessonId?: string; // Optional specific lesson filter, e.g., 'tango_c1_s1', 'n5_mn01', 'n4_mn26'

  // Custom typography & color style options for notification card
  fontSizeScale?: number; // e.g. 0.8, 1.0, 1.2, 1.4, 1.6 (default 1.2)
  kanjiScale?: number;    // Custom scale for main Kanji / Word text (default 1.0)
  furiganaScale?: number; // Custom scale for Furigana reading text (default 1.0)
  hanVietScale?: number;  // Custom scale for Hán Việt badge text (default 1.0)
  meaningScale?: number;  // Custom scale for Vietnamese meaning text (default 1.0)
  exampleScale?: number;  // Custom scale for Example sentence & translation text (default 1.0)
  cardTheme?: NotificationThemeKey; // Preset theme
  customKanjiColor?: string; // e.g. '#ffffff'
  customFuriganaColor?: string; // e.g. '#fde047'
  customMeaningColor?: string; // e.g. '#ffffff'
  customBgStart?: string; // e.g. '#060a14'
  customBgEnd?: string; // e.g. '#0e172a'
  customBorderColor?: string; // e.g. '#334155'
}

export interface VocabNotificationPayload {
  id?: string;
  kanji?: string;
  reading: string;
  romaji?: string;
  meaning: string;
  hanViet?: string;
  level: string;
  exampleJp?: string;
  exampleVi?: string;
  exampleFurigana?: string;
  // Metadata for curriculum, lesson & word index
  curriculum?: 'minna' | 'tango' | 'advanced' | string;
  curriculumName?: string;
  lessonId?: string;
  lessonName?: string;
  chapter?: string;
  section?: string;
  wordNumber?: number | string;
  wordIndexInLesson?: number;
  totalWordsInLesson?: number;
}

/**
 * Format standard origin info tagline and individual badges for notification display
 */
export function formatVocabOriginLabel(word: VocabNotificationPayload): {
  badgeLevel: string;
  curriculumBadge: string;
  lessonBadge: string;
  wordNumBadge: string;
  fullTagline: string;
} {
  const level = word.level || 'N4';
  
  let currName = 'Minna no Nihongo';
  let currIcon = '📘';
  let isTango = false;

  if (
    word.curriculum === 'tango' ||
    word.curriculumName?.toLowerCase().includes('tango') ||
    (word.id && (word.id.startsWith('tango_') || word.id.startsWith('v_tango')))
  ) {
    currName = 'Tango 1500';
    currIcon = '📗';
    isTango = true;
  } else if (word.curriculum === 'minna' || (word.id && word.id.includes('_mn'))) {
    currName = word.level === 'N5' ? 'Minna N5' : 'Minna N4';
    currIcon = '📘';
  } else if (word.level === 'N3' || word.level === 'N2' || word.level === 'N1') {
    currName = `JLPT ${word.level}`;
    currIcon = '📙';
  }

  let lessonStr = '';
  if (isTango) {
    if (word.section) {
      lessonStr = word.section.replace(/\s*\([^)]*\)/, '').trim();
    } else if (word.lessonName) {
      lessonStr = word.lessonName.replace(/\s*\([^)]*\)/, '').trim();
    } else if (word.chapter) {
      lessonStr = word.chapter.replace(/\s*\([^)]*\)/, '').trim();
    } else {
      lessonStr = 'Tango N4';
    }
  } else {
    if (word.lessonName) {
      lessonStr = word.lessonName.trim();
    } else if (word.lessonId) {
      const match = word.lessonId.match(/\d+/);
      lessonStr = match ? `Bài ${parseInt(match[0], 10)}` : 'Bài học';
    } else {
      lessonStr = 'Bài học';
    }
  }

  let numStr = '';
  if (word.wordNumber !== undefined && word.wordNumber !== null && word.wordNumber !== '') {
    const rawNum = typeof word.wordNumber === 'number' ? word.wordNumber : parseInt(String(word.wordNumber), 10);
    if (!isNaN(rawNum)) {
      numStr = isTango ? `#${String(rawNum).padStart(3, '0')}` : `#${rawNum}`;
    } else {
      numStr = `#${word.wordNumber}`;
    }
  } else if (word.wordIndexInLesson !== undefined) {
    numStr = `#${word.wordIndexInLesson}`;
  } else if (word.id) {
    const match = word.id.match(/\d+$/);
    if (match) {
      const parsed = parseInt(match[0], 10);
      numStr = isTango ? `#${String(parsed).padStart(3, '0')}` : `#${parsed}`;
    }
  }

  const fullTagline = `${currIcon} ${currName} • ${lessonStr}${numStr ? ` • Từ ${numStr}` : ''}`;

  return {
    badgeLevel: level,
    curriculumBadge: `${currIcon} ${currName}`,
    lessonBadge: lessonStr,
    wordNumBadge: numStr ? `Từ ${numStr}` : '',
    fullTagline
  };
}

/**
 * Check if a string is a valid Latin romaji (no Japanese characters)
 */
export const isValidLatinRomaji = (str?: string): boolean => {
  if (!str) return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  // Must NOT contain Hiragana, Katakana, or Kanji
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(trimmed)) return false;
  return /^[a-zA-Z0-9\s\-''āīūēōâîûêô.,!?()]+$/i.test(trimmed);
};

const STORAGE_KEY = 'jpstudy_reminder_settings';

// High quality curated natural examples for common vocabulary
export const CURATED_NATURAL_EXAMPLES: Record<string, { jp: string; vi: string }> = {
  "大好き": {
    jp: "私は日本のアニメと料理が大好きです。",
    vi: "Tôi rất thích phim hoạt hình và ẩm thực Nhật Bản."
  },
  "好き": {
    jp: "休みの日は家で音楽を聴くのが好きです。",
    vi: "Vào ngày nghỉ tôi thích nghe nhạc ở nhà."
  },
  "ピラミッド": {
    jp: "エジプトへ行って有名なピラミッドを見たいです。",
    vi: "Tôi muốn đến Ai Cập để ngắm kim tự tháp nổi tiếng."
  },
  "漫画": {
    jp: "暇なときに日本語の漫画をよく読みます。",
    vi: "Khi rảnh rỗi tôi thường đọc truyện tranh tiếng Nhật."
  },
  "まんが": {
    jp: "暇なときに日本語の漫画をよく読みます。",
    vi: "Khi rảnh rỗi tôi thường đọc truyện tranh tiếng Nhật."
  },
  "アイスクリーム": {
    jp: "暑い夏に冷たいアイスクリームを食べるのが一番です。",
    vi: "Ăn kem mát lạnh vào mùa hè nóng nực là tuyệt vời nhất."
  },
  "切手": {
    jp: "手紙に切手を貼ってポストに入れました。",
    vi: "Tôi dán tem vào phong bì thư rồi bỏ vào hòm thư."
  },
  "速達": {
    jp: "急ぎの書類なので速達で送ってください。",
    vi: "Vì là tài liệu gấp nên xin vui lòng gửi bằng chuyển phát nhanh."
  },
  "ロボット": {
    jp: "将来、多くの工場でロボットが働くようになるでしょう。",
    vi: "Trong tương lai, robot sẽ làm việc ở rất nhiều nhà máy."
  },
  "生活": {
    jp: "日本での一人暮らしの生活にもう慣れました。",
    vi: "Tôi đã quen với cuộc sống tự lập một mình tại Nhật Bản."
  },
  "元気": {
    jp: "お久しぶりです、ご家族の皆様はお元気ですか。",
    vi: "Lâu rồi không gặp, mọi người trong gia đình bạn vẫn khỏe chứ?"
  },
  "便利": {
    jp: "駅の近くにスーパーがあってとても便利です。",
    vi: "Có siêu thị ở gần ga tàu nên rất tiện lợi."
  },
  "不便": {
    jp: "この辺りはバスがあまり通らないので不便です。",
    vi: "Khu vực này xe buýt ít chạy qua nên khá bất tiện."
  },
  "友達": {
    jp: "週末に友達と一緒に映画を見に行きました。",
    vi: "Cuối tuần tôi đã đi xem phim cùng với bạn bè."
  },
  "会社": {
    jp: "毎朝8時半に電車に乗って会社へ行きます。",
    vi: "Mỗi sáng tôi đi tàu điện lúc 8 giờ rưỡi để đến công ty."
  },
  "仕事": {
    jp: "今日の仕事は午後5時に終わる予定です。",
    vi: "Công việc hôm nay dự kiến sẽ kết thúc vào lúc 5 giờ chiều."
  },
  "桜": {
    jp: "春になると公園の桜がとても綺麗に咲きます。",
    vi: "Khi mùa xuân đến, hoa anh đào trong công viên nở rất đẹp."
  },
  "チケット": {
    jp: "コンサートのチケットをインターネットで予約しました。",
    vi: "Tôi đã đặt vé xem buổi hòa nhạc qua mạng Internet."
  },
  "公園": {
    jp: "天気がいいので子どもたちと公園を散歩しました。",
    vi: "Vì thời tiết đẹp nên tôi đã dạo bộ ở công viên cùng các con."
  },
  "冬": {
    jp: "日本の冬はとても寒くて雪がたくさん降ります。",
    vi: "Mùa đông ở Nhật Bản rất lạnh và có nhiều tuyết rơi."
  },
  "てんぷら": {
    jp: "日本の伝統的な料理の中で天ぷらが一番好きです。",
    vi: "Trong các món ăn truyền thống của Nhật, tôi thích nhất là món Tempura."
  },
  "大丈夫": {
    jp: "心配しないでください、怪我は大丈夫です。",
    vi: "Xin đừng lo lắng, vết thương của tôi không sao đâu."
  },
  "兄": {
    jp: "私の兄は東京の大学で経済を勉強しています。",
    vi: "Anh trai tôi đang học kinh tế tại một trường đại học ở Tokyo."
  },
  "お兄さん": {
    jp: "山田さんのお兄さんは背が高くてかっこいいですね。",
    vi: "Anh trai của bạn Yamada cao ráo và trông bảnh bao thật đấy."
  },
  "姉": {
    jp: "姉は病院で看護師として働いています。",
    vi: "Chị gái tôi đang làm y tá tại bệnh viện."
  },
  "お姉さん": {
    jp: "田中さんのお姉さんはとても優しい人です。",
    vi: "Chị gái của bạn Tanaka là một người rất hiền lành."
  },
  "兄弟": {
    jp: "私は三人兄弟で、兄と妹がいます。",
    vi: "Tôi có ba anh chị em, gồm một anh trai và một em gái."
  },
  "子どもたち": {
    jp: "公園で子どもたちが元気にサッカーをしています。",
    vi: "Lũ trẻ đang hào hứng đá bóng trong công viên."
  },
  "情報": {
    jp: "インターネットで留学に関する情報をたくさん集めました。",
    vi: "Tôi đã thu thập nhiều thông tin về du học qua mạng Internet."
  },
  "旅行社": {
    jp: "旅行社へ行って北海道旅行のパンフレットをもらいました。",
    vi: "Tôi đã đến công ty du lịch để lấy tờ rơi giới thiệu chuyến đi Hokkaido."
  },
  "電源": {
    jp: "パソコンの電源を切ってから部屋を出てください。",
    vi: "Hãy tắt nguồn máy tính trước khi rời khỏi phòng."
  },
  "テスト": {
    jp: "明日の日本語のテストのために今夜しっかり復習します。",
    vi: "Tôi sẽ ôn tập kỹ tối nay cho bài kiểm tra tiếng Nhật ngày mai."
  },
  "作文": {
    jp: "自分の将来の夢について日本語で作文を書きました。",
    vi: "Tôi đã viết một bài văn bằng tiếng Nhật về ước mơ tương lai của mình."
  },
  "お知らせ": {
    jp: "先生からの大切なお知らせを掲示板で見ました。",
    vi: "Tôi đã xem thông báo quan trọng từ thầy giáo trên bảng tin."
  },
  "趣味": {
    jp: "私の趣味は休みの日に写真を撮ることです。",
    vi: "Sở thích của tôi là chụp ảnh vào những ngày nghỉ."
  },
  "得意": {
    jp: "母は料理が得意で、いつも美味しいご飯を作ってくれます。",
    vi: "Mẹ tôi rất giỏi nấu ăn, lúc nào cũng nấu những bữa cơm ngon."
  },
  "苦手": {
    jp: "私は辛い食べ物が苦手なので、あまり食べられません。",
    vi: "Tôi kém ăn đồ cay nên không thể ăn nhiều được."
  },
  "健康": {
    jp: "健康のために毎朝30分ジョギングをしています。",
    vi: "Để giữ gìn sức khỏe, mỗi sáng tôi đều chạy bộ 30 phút."
  },
  "新鮮": {
    jp: "朝の市場で獲れたての新鮮な魚を買いました。",
    vi: "Tôi đã mua cá tươi vừa mới đánh bắt ở chợ sáng."
  },
  "立派": {
    jp: "彼は一生懸命勉強して立派な医者になりました。",
    vi: "Anh ấy đã chăm chỉ học tập và trở thành một bác sĩ tuyệt vời."
  },
  "重要": {
    jp: "会議で今後の計画について重要な決定をしました。",
    vi: "Chúng tôi đã đưa ra quyết định quan trọng về kế hoạch sắp tới tại cuộc họp."
  },
  "必要": {
    jp: "海外旅行に行くときはパスポートが必要です。",
    vi: "Khi đi du lịch nước ngoài thì cần phải có hộ chiếu."
  },
  "携帯": {
    jp: "電車の中では携帯電話をマナーモードに設定してください。",
    vi: "Xin hãy cài đặt điện thoại di động sang chế độ rung khi ở trên tàu điện."
  },
  "戦争": {
    jp: "世界中の人々が平和を望み、戦争に反対しています。",
    vi: "Mọi người trên khắp thế giới đều mong muốn hòa bình và phản đối chiến tranh."
  },
  "発表": {
    jp: "明日、クラスのみんなの前で研究結果を発表します。",
    vi: "Ngày mai tôi sẽ thuyết trình kết quả nghiên cứu trước cả lớp."
  },
  "メールアドレス": {
    jp: "連絡先を交換したいので、メールアドレスを教えてください。",
    vi: "Tôi muốn trao đổi liên lạc, bạn cho tôi xin địa chỉ email nhé."
  },
  "そろばん": {
    jp: "子どもの頃、計算を早くするためにそろばんを習っていました。",
    vi: "Hồi nhỏ, tôi từng học bàn tính Soroban để tính toán nhanh hơn."
  }
};

let _cachedVocabPool: VocabNotificationPayload[] | null = null;

/**
 * Get all available vocabulary across all JLPT levels with rich curriculum & lesson metadata
 */
export const getAllVocabPool = (): VocabNotificationPayload[] => {
  if (_cachedVocabPool && _cachedVocabPool.length > 0) {
    return _cachedVocabPool;
  }

  const pool: VocabNotificationPayload[] = [];

  const attachNaturalExample = (item: any, cleanKanji?: string, cleanReading?: string) => {
    const rawJp = item.exampleSentence || item.exampleJp || item.example || item.sentence;
    const rawVi = item.exampleTranslation || item.exampleVi || item.translation;
    if (rawJp && String(rawJp).trim().length > 0) {
      return {
        exJp: String(rawJp).trim(),
        exVi: rawVi ? String(rawVi).trim() : ''
      };
    }
    const k = cleanKanji || '';
    const r = cleanReading || '';
    if (CURATED_NATURAL_EXAMPLES[k]) {
      return {
        exJp: CURATED_NATURAL_EXAMPLES[k].jp,
        exVi: CURATED_NATURAL_EXAMPLES[k].vi
      };
    }
    if (CURATED_NATURAL_EXAMPLES[r]) {
      return {
        exJp: CURATED_NATURAL_EXAMPLES[r].jp,
        exVi: CURATED_NATURAL_EXAMPLES[r].vi
      };
    }
    return {
      exJp: '',
      exVi: ''
    };
  };

  const processList = (
    list: any[],
    defaultLevel: string,
    defaultCurriculum: 'minna' | 'tango' | 'advanced',
    defaultCurriculumName: string
  ) => {
    if (!Array.isArray(list)) return;

    // Count items per lesson for totalWordsInLesson & index calculation
    const lessonItemCounter: Record<string, number> = {};
    const lessonTotals: Record<string, number> = {};
    list.forEach(item => {
      const lId = item.lessonId || 'default_lesson';
      lessonTotals[lId] = (lessonTotals[lId] || 0) + 1;
    });

    list.forEach(item => {
      const cleanReading = cleanVocabSymbols(item.hiragana || item.reading || '');
      const cleanKanji = item.kanji ? cleanVocabSymbols(item.kanji) : undefined;
      const rawRom = item.romaji ? cleanVocabSymbols(item.romaji) : undefined;
      const cleanRom = isValidLatinRomaji(rawRom) ? rawRom : (cleanReading ? kanaToRomaji(cleanReading) : undefined);
      const { exJp, exVi } = attachNaturalExample(item, cleanKanji, cleanReading);
      const exampleFurigana = exJp
        ? getSentenceHiraganaReading(exJp, { kanji: cleanKanji, hiragana: cleanReading })
        : undefined;

      const lId = item.lessonId || 'default_lesson';
      const currentIndexInLesson = (lessonItemCounter[lId] || 0) + 1;
      lessonItemCounter[lId] = currentIndexInLesson;

      // Determine curriculum & names
      const curr = item.curriculum || defaultCurriculum;
      const currName = curr === 'tango'
        ? 'Tango 1500'
        : (curr === 'minna' ? (item.level === 'N5' ? 'Minna N5' : 'Minna N4') : defaultCurriculumName);

      // Determine word number
      let wordNumber: number | string = currentIndexInLesson;
      if (item.originalNumber !== undefined && item.originalNumber !== null) {
        wordNumber = item.originalNumber;
      } else if (item.id) {
        const idMatch = String(item.id).match(/_(\d+)$/);
        if (idMatch) wordNumber = parseInt(idMatch[1], 10);
      }

      pool.push({
        id: item.id,
        kanji: cleanKanji,
        reading: cleanReading,
        romaji: cleanRom,
        meaning: item.meaning,
        hanViet: item.hanViet || (cleanKanji ? getHanViet(cleanKanji) : undefined),
        level: item.level || defaultLevel,
        exampleJp: exJp,
        exampleVi: exVi,
        exampleFurigana,
        curriculum: curr,
        curriculumName: currName,
        lessonId: item.lessonId,
        lessonName: item.section || item.lessonName || 'Bài học từ vựng',
        chapter: item.chapter,
        section: item.section,
        wordNumber,
        wordIndexInLesson: currentIndexInLesson,
        totalWordsInLesson: lessonTotals[lId] || 0
      });
    });
  };

  processList(MINNA_N5_VOCABULARY, 'N5', 'minna', 'Minna N5');
  processList(MINNA_N4_VOCABULARY, 'N4', 'minna', 'Minna N4');
  processList(TANGO_N4_VOCABULARY, 'N4', 'tango', 'Tango 1500');
  processList(ADVANCED_VOCABULARY, 'N3', 'advanced', 'JLPT N3');

  // Load user custom imported vocabularies from localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const rawCustom = localStorage.getItem('jpstudy_custom_vocabularies');
      if (rawCustom) {
        const customItems = JSON.parse(rawCustom);
        if (Array.isArray(customItems) && customItems.length > 0) {
          processList(customItems, 'N4', 'minna', 'Từ vựng Tùy chỉnh (Excel)');
        }
      }
    }
  } catch (e) {
    console.error('Error loading custom vocabularies into pool:', e);
  }

  _cachedVocabPool = pool;
  return pool;
};

/**
 * Invalidate cached vocab pool so new imports immediately take effect
 */
export const invalidateVocabPoolCache = (): void => {
  _cachedVocabPool = null;
};

/**
 * Get active learning context (current curriculum, target level, active lesson)
 */
export function getActiveLearningContext(): {
  curriculum: 'minna' | 'tango';
  targetLevel: string;
  lessonId?: string;
  lessonName?: string;
} {
  try {
    if (typeof localStorage !== 'undefined') {
      const rawPos = localStorage.getItem('jpstudy_last_position');
      const rawProfile = localStorage.getItem('jpstudy_user_profile');
      const pos = rawPos ? JSON.parse(rawPos) : null;
      const profile = rawProfile ? JSON.parse(rawProfile) : null;

      const curriculum = (pos?.curriculum || profile?.selectedCurriculum || 'minna') as 'minna' | 'tango';
      const targetLevel = pos?.level || profile?.targetLevel || 'N4';
      const lessonId = pos?.lessonId;
      const lessonName = pos?.lessonName;

      return { curriculum, targetLevel, lessonId, lessonName };
    }
  } catch (e) {
    // ignore
  }
  return { curriculum: 'minna', targetLevel: 'N4' };
}

/**
 * Get filtered vocabulary pool based on user settings and active curriculum progress
 */
export function getEffectiveVocabPool(
  customSettings?: ReminderSettings
): VocabNotificationPayload[] {
  const settings = customSettings || getDefaultReminderSettings();
  const pool = getAllVocabPool();
  const scope = settings.vocabSourceScope || 'active';

  // 1. Specific custom lesson
  if (scope === 'custom_lesson' && settings.vocabSelectedLessonId && settings.vocabSelectedLessonId !== 'all') {
    const matched = pool.filter(v => v.lessonId === settings.vocabSelectedLessonId);
    if (matched.length > 0) return matched;
  }

  // 2. Explicit Tango 1500 N4
  if (scope === 'tango') {
    const matched = pool.filter(v => v.curriculum === 'tango');
    if (matched.length > 0) return matched;
  }

  // 3. Explicit Minna N5
  if (scope === 'minna_n5') {
    const matched = pool.filter(v => v.curriculum === 'minna' && v.level === 'N5');
    if (matched.length > 0) return matched;
  }

  // 4. Explicit Minna N4
  if (scope === 'minna_n4') {
    const matched = pool.filter(v => v.curriculum === 'minna' && v.level === 'N4');
    if (matched.length > 0) return matched;
  }

  // 5. Active Learning Progress (Default & recommended)
  if (scope === 'active') {
    const activeCtx = getActiveLearningContext();
    if (activeCtx.curriculum === 'tango') {
      const tangoWords = pool.filter(v => v.curriculum === 'tango');
      if (tangoWords.length > 0) {
        // If active lesson exists, prioritize current lesson (70% weight) vs entire Tango (30% weight)
        if (activeCtx.lessonId) {
          const lessonWords = tangoWords.filter(v => v.lessonId === activeCtx.lessonId);
          if (lessonWords.length > 0 && Math.random() < 0.7) {
            return lessonWords;
          }
        }
        return tangoWords;
      }
    } else {
      // Minna curriculum (N5 or N4 based on active level)
      const targetLvl = activeCtx.targetLevel || 'N4';
      const minnaWords = pool.filter(v => v.curriculum === 'minna' && (targetLvl === 'ALL' ? true : v.level === targetLvl));
      if (minnaWords.length > 0) {
        if (activeCtx.lessonId) {
          const lessonWords = minnaWords.filter(v => v.lessonId === activeCtx.lessonId);
          if (lessonWords.length > 0 && Math.random() < 0.7) {
            return lessonWords;
          }
        }
        return minnaWords;
      }
    }
  }

  // 6. Fallback: filter by selected JLPT levels
  const selectedLevels = settings.vocabLevels || ['N5', 'N4', 'N3', 'N2', 'N1'];
  const filtered = pool.filter(item => selectedLevels.includes(item.level));
  return filtered.length > 0 ? filtered : pool;
}

export const getDefaultReminderSettings = (): ReminderSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        enabled: false,
        time: '20:00',
        vocabEnabled: false,
        vocabInterval: 15,
        vocabPlaySound: true,
        vocabLevels: ['N5', 'N4', 'N3', 'N2', 'N1'],
        vocabRequireInteraction: false,
        hideNotificationText: true,
        vocabSourceScope: 'active',
        vocabSelectedLessonId: 'all',
        fontSizeScale: 1.2,
        kanjiScale: 1.0,
        furiganaScale: 1.0,
        hanVietScale: 1.0,
        meaningScale: 1.0,
        exampleScale: 1.0,
        cardTheme: 'obsidian',
        ...parsed
      };
    }
  } catch (e) {
    console.error('Failed to load reminder settings:', e);
  }
  return {
    enabled: false,
    time: '20:00',
    vocabEnabled: false,
    vocabInterval: 15,
    vocabPlaySound: true,
    vocabLevels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    vocabRequireInteraction: false,
    hideNotificationText: true,
    vocabSourceScope: 'active',
    vocabSelectedLessonId: 'all',
    fontSizeScale: 1.2,
    kanjiScale: 1.0,
    furiganaScale: 1.0,
    hanVietScale: 1.0,
    meaningScale: 1.0,
    exampleScale: 1.0,
    cardTheme: 'obsidian'
  };
};

export const saveReminderSettings = (settings: ReminderSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    syncRemindersWithServiceWorker(settings, getEffectiveVocabPool(settings)).catch(() => {});
  } catch (e) {
    console.error('Failed to save reminder settings:', e);
  }
};

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermissionStatus = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const settings = getDefaultReminderSettings();
      syncRemindersWithServiceWorker(settings, getEffectiveVocabPool(settings)).catch(() => {});
    }
    return permission;
  } catch (e) {
    console.error('Permission request failed:', e);
    return Notification.permission;
  }
};

/**
 * Synchronize settings and vocabulary cache with Service Worker
 */
export const syncRemindersWithServiceWorker = async (
  settings: ReminderSettings,
  vocabList?: VocabNotificationPayload[]
): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const list = vocabList || getEffectiveVocabPool(settings);
    const finalList = list.length > 0 ? list : getAllVocabPool();

    const targetWorker = registration.active || navigator.serviceWorker.controller;
    if (targetWorker) {
      targetWorker.postMessage({
        type: 'SYNC_SETTINGS',
        settings,
        vocabList: finalList
      });
    }

    // Register Periodic Background Sync if supported (Android Chrome / PWA)
    if ('periodicSync' in registration && settings.vocabEnabled) {
      try {
        const periodicSync = (registration as any).periodicSync;
        const intervalMinutes = settings.vocabInterval || 15;
        await periodicSync.register('jpstudy-vocab-sync', {
          minInterval: Math.max(intervalMinutes * 60 * 1000, 60 * 1000)
        });
      } catch (err) {
        // Ignored if periodicSync not permitted
      }
    }

    if ('sync' in registration) {
      try {
        await (registration as any).sync.register('jpstudy-sync-reminder');
      } catch (err) {}
    }

    return true;
  } catch (e) {
    console.warn('[NotificationService] syncRemindersWithServiceWorker failed:', e);
    return false;
  }
};

/**
 * Play a pleasant audio chime when notification appears
 */
export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    // Chime Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.5);

    // Chime Note 2: B5 (987.77 Hz)
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(987.77, ctx.currentTime);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.7);
      } catch (e) {}
    }, 120);
  } catch (e) {
    // Audio gesture constraint
  }
};

/**
 * Parse example sentence into text & furigana chunks for canvas / toast rendering
 */
export function parseSentenceFuriganaChunks(
  sentence: string,
  word?: { kanji?: string; reading?: string },
  vocabPool?: any[]
): { text: string; furigana?: string }[] {
  if (!sentence) return [];

  // 1. If sentence has bracketed furigana e.g. 手紙【てがみ】or [手紙/てがみ]
  if (sentence.includes('【') || sentence.includes('[')) {
    const parts: { text: string; furigana?: string }[] = [];
    const regex = /([^【\[]+)(?:【|\[)([^】\]]+)(?:】|\])/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(sentence)) !== null) {
      if (match.index > lastIndex) {
        // Also run getSentenceFuriganaParts on the non-bracketed segment to catch other kanji
        const plainSegment = sentence.slice(lastIndex, match.index);
        const subParts = getSentenceFuriganaParts(plainSegment, { kanji: word?.kanji, hiragana: word?.reading }, vocabPool);
        parts.push(...subParts);
      }
      parts.push({ text: match[1], furigana: match[2] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < sentence.length) {
      const remainingSegment = sentence.slice(lastIndex);
      const subParts = getSentenceFuriganaParts(remainingSegment, { kanji: word?.kanji, hiragana: word?.reading }, vocabPool);
      parts.push(...subParts);
    }
    if (parts.length > 0) return parts;
  }

  // 2. Derive stem mappings for verbs/adjectives (e.g. 届きます/とどきます -> 届/とど)
  const customVocab: any[] = vocabPool ? [...vocabPool] : [];
  if (word && word.kanji && word.reading && word.kanji !== word.reading) {
    let kEnd = word.kanji.length;
    let rEnd = word.reading.length;
    while (kEnd > 0 && rEnd > 0 && word.kanji[kEnd - 1] === word.reading[rEnd - 1]) {
      kEnd--;
      rEnd--;
    }
    if (kEnd > 0 && rEnd > 0 && kEnd < word.kanji.length) {
      const kanjiStem = word.kanji.substring(0, kEnd);
      const readingStem = word.reading.substring(0, rEnd);
      customVocab.unshift({ kanji: kanjiStem, reading: readingStem, hiragana: readingStem });
    }
  }

  return getSentenceFuriganaParts(
    sentence,
    { kanji: word?.kanji, hiragana: word?.reading },
    customVocab
  );
}

interface MainWordTile {
  text: string;
  furigana?: string;
  hanViet?: string;
  isKanji: boolean;
  borderCol?: string;
  bgCol?: string;
  badgeBorder?: string;
  badgeText?: string;
  badgeBg?: string;
}

function parseWordTiles(
  rawKanji: string,
  rawReading: string,
  hanVietStr?: string
): MainWordTile[] {
  const kanji = cleanVocabSymbols(rawKanji || '');
  const reading = cleanVocabSymbols(rawReading || '');

  if (!kanji || kanji === reading || !/[\u4e00-\u9faf]/.test(kanji)) {
    const displayText = kanji || reading;
    return [{ text: displayText, isKanji: false }];
  }

  const colors = [
    { border: '#f59e0b', bg: '#1c160c', text: '#fde047', badgeBorder: '#0284c7', badgeText: '#38bdf8', badgeBg: '#081a2e' }, // Amber / Cyan
    { border: '#6366f1', bg: '#13112c', text: '#c7d2fe', badgeBorder: '#4f46e5', badgeText: '#a5b4fc', badgeBg: '#18133a' }, // Indigo / Light Purple
    { border: '#10b981', bg: '#06281e', text: '#a7f3d0', badgeBorder: '#059669', badgeText: '#6ee7b7', badgeBg: '#06281e' }, // Emerald / Mint
    { border: '#ec4899', bg: '#2b0b1a', text: '#fbcfe8', badgeBorder: '#db2777', badgeText: '#f472b6', badgeBg: '#360920' }, // Pink / Rose
  ];

  // Determine trailing okurigana
  let kEnd = kanji.length;
  let rEnd = reading.length;
  while (kEnd > 0 && rEnd > 0 && kanji[kEnd - 1] === reading[rEnd - 1]) {
    kEnd--;
    rEnd--;
  }

  // Determine leading okurigana
  let kStart = 0;
  let rStart = 0;
  while (kStart < kEnd && rStart < rEnd && kanji[kStart] === reading[rStart]) {
    kStart++;
    rStart++;
  }

  const tiles: MainWordTile[] = [];

  if (kStart > 0) {
    tiles.push({ text: kanji.slice(0, kStart), isKanji: false });
  }

  const kanjiStem = kanji.slice(kStart, kEnd);
  const readingStem = reading.slice(rStart, rEnd);
  
  // Extract all actual Kanji characters in stem
  const kanjiCharsInStem = kanjiStem.split('').filter(c => /[\u4e00-\u9faf]/.test(c));
  const hvParts = (hanVietStr || getHanViet(kanji)).split(/\s+/).filter(Boolean);

  if (kanjiCharsInStem.length === kanjiStem.length) {
    // Pure kanji stem (e.g. 入学, 先生, 自動販売機)
    if (kanjiStem.length === 1) {
      const char = kanjiStem;
      const hv = hvParts[0] || KANJI_TO_HAN_VIET[char] || '';
      tiles.push({
        text: char,
        furigana: readingStem,
        hanViet: hv,
        isKanji: true,
        borderCol: colors[0].border,
        bgCol: colors[0].bg,
        badgeBorder: colors[0].badgeBorder,
        badgeText: colors[0].badgeText,
        badgeBg: colors[0].badgeBg
      });
    } else {
      const partition = findBestFuriganaPartition(kanjiStem, readingStem);
      for (let i = 0; i < kanjiStem.length; i++) {
        const c = kanjiStem[i];
        const color = colors[i % colors.length];
        const r = partition[i] || '';
        const hv = (hvParts.length === kanjiCharsInStem.length ? hvParts[i] : '') || KANJI_TO_HAN_VIET[c] || (hvParts[i] || '');
        tiles.push({
          text: c,
          furigana: r,
          hanViet: hv,
          isKanji: true,
          borderCol: color.border,
          bgCol: color.bg,
          badgeBorder: color.badgeBorder,
          badgeText: color.badgeText,
          badgeBg: color.badgeBg
        });
      }
    }
  } else {
    // Mixed kanji and kana in stem (e.g. 思い出, 気をつける, 引っ越)
    const subParts = getSentenceFuriganaParts(kanjiStem, { kanji: kanjiStem, hiragana: readingStem });
    let hvIdx = 0;
    for (let pIdx = 0; pIdx < subParts.length; pIdx++) {
      const part = subParts[pIdx];
      if (/[\u4e00-\u9faf]/.test(part.text)) {
        if (part.text.length === 1) {
          const color = colors[hvIdx % colors.length];
          const hv = (hvParts.length === kanjiCharsInStem.length ? hvParts[hvIdx] : '') || KANJI_TO_HAN_VIET[part.text] || (hvParts[hvIdx] || '');
          tiles.push({
            text: part.text,
            furigana: part.furigana || '',
            hanViet: hv,
            isKanji: true,
            borderCol: color.border,
            bgCol: color.bg,
            badgeBorder: color.badgeBorder,
            badgeText: color.badgeText,
            badgeBg: color.badgeBg
          });
          hvIdx++;
        } else {
          const partPartition = findBestFuriganaPartition(part.text, part.furigana || '');
          for (let k = 0; k < part.text.length; k++) {
            const char = part.text[k];
            const color = colors[hvIdx % colors.length];
            const hv = (hvParts.length === kanjiCharsInStem.length ? hvParts[hvIdx] : '') || KANJI_TO_HAN_VIET[char] || (hvParts[hvIdx] || '');
            tiles.push({
              text: char,
              furigana: partPartition[k] || '',
              hanViet: hv,
              isKanji: true,
              borderCol: color.border,
              bgCol: color.bg,
              badgeBorder: color.badgeBorder,
              badgeText: color.badgeText,
              badgeBg: color.badgeBg
            });
            hvIdx++;
          }
        }
      } else {
        tiles.push({ text: part.text, isKanji: false });
      }
    }
  }

  if (kEnd < kanji.length) {
    tiles.push({ text: kanji.slice(kEnd), isKanji: false });
  }

  return tiles;
}

/**
 * Generate a rich, high-resolution Canvas Image Card for Windows Desktop Toast Notifications
 * Optimized with high-contrast, crystal-clear typography, perfect furigana alignment, and crisp anti-aliasing.
 */
export function generateVocabNotificationImage(word: VocabNotificationPayload, customSettings?: ReminderSettings): string {
  if (typeof document === 'undefined') return '';

  try {
    const settings = customSettings || getDefaultReminderSettings();
    const fontScale = settings.fontSizeScale !== undefined ? settings.fontSizeScale : 1.15;
    const kScale = settings.kanjiScale !== undefined ? settings.kanjiScale : 1.0;
    const fScale = settings.furiganaScale !== undefined ? settings.furiganaScale : 1.0;
    const hvScale = settings.hanVietScale !== undefined ? settings.hanVietScale : 1.0;
    const mScale = settings.meaningScale !== undefined ? settings.meaningScale : 1.0;
    const exScale = settings.exampleScale !== undefined ? settings.exampleScale : 1.0;

    const cardThemeKey = settings.cardTheme || 'obsidian';
    const preset = NOTIFICATION_THEMES[cardThemeKey] || NOTIFICATION_THEMES.obsidian;

    const bgStart = (cardThemeKey === 'custom' && settings.customBgStart) ? settings.customBgStart : preset.bgStart;
    const bgEnd = (cardThemeKey === 'custom' && settings.customBgEnd) ? settings.customBgEnd : preset.bgEnd;
    const borderColor = (cardThemeKey === 'custom' && settings.customBorderColor) ? settings.customBorderColor : preset.borderColor;
    const kanjiColor = (cardThemeKey === 'custom' && settings.customKanjiColor) ? settings.customKanjiColor : preset.kanjiColor;
    const furiganaColor = (cardThemeKey === 'custom' && settings.customFuriganaColor) ? settings.customFuriganaColor : (cardThemeKey === 'snowLight' ? '#d97706' : '#fde047');
    const meaningColor = (cardThemeKey === 'custom' && settings.customMeaningColor) ? settings.customMeaningColor : preset.meaningColor;
    const accentColor = preset.accentColor || '#38bdf8';
    const boxBg = preset.boxBg || '#050a15';

    // Standardized optimal aspect ratio for Windows Toast Notifications (2.08 : 1)
    const width = 540;
    const height = 260;
    const scale = 2; // 2x Pixel Density for pristine sharpness without downscale artifacts

    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return '';

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Font family definitions for flawless rendering across all operating systems
    const FONT_JP = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "BIZ UDPGothic", "Meiryo", sans-serif';
    const FONT_VI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const FONT_MONO = 'ui-monospace, SFMono-Regular, "Segoe UI Mono", Menlo, Monaco, Consolas, monospace';

    // 1. Card Background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, bgStart);
    bgGradient.addColorStop(0.5, bgStart === bgEnd ? bgStart : bgStart);
    bgGradient.addColorStop(1, bgEnd);

    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(0, 0, width, height, 14);
    } else {
      ctx.rect(0, 0, width, height);
    }
    ctx.fill();

    // High contrast ambient border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Top-Left Level & Curriculum / Lesson / Word # Badges
    const originInfo = formatVocabOriginLabel(word);
    
    // 2a. Level pill (e.g., "N4")
    const lvlText = originInfo.badgeLevel;
    ctx.font = `bold ${Math.round(11 * Math.min(1.1, fontScale))}px ${FONT_VI}`;
    const lvlW = ctx.measureText(lvlText).width;
    const lvlPillW = lvlW + 12;
    const topBarH = 18;
    const topBarY = 11;
    
    ctx.fillStyle = cardThemeKey === 'snowLight' ? '#e2e8f0' : (boxBg || '#0f172a');
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(18, topBarY, lvlPillW, topBarH, 4);
    } else {
      ctx.rect(18, topBarY, lvlPillW, topBarH);
    }
    ctx.fill();
    ctx.strokeStyle = cardThemeKey === 'snowLight' ? '#cbd5e1' : borderColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = cardThemeKey === 'snowLight' ? '#475569' : (accentColor || '#38bdf8');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lvlText, 18 + lvlPillW / 2, topBarY + topBarH / 2);

    // 2b. Curriculum & Lesson & Word # Badge (e.g., "📗 Tango 1500 • Sec 1 • #001")
    const metaParts = [originInfo.curriculumBadge, originInfo.lessonBadge];
    if (originInfo.wordNumBadge) {
      metaParts.push(originInfo.wordNumBadge);
    }
    const metaText = metaParts.filter(Boolean).join(' • ');
    ctx.font = `bold ${Math.round(10.5 * Math.min(1.05, fontScale))}px ${FONT_VI}`;
    const metaW = ctx.measureText(metaText).width;
    const metaX = 18 + lvlPillW + 6;
    const maxMetaW = width - metaX - 58; // Allow generous room on top row before action icons
    const metaPillW = Math.min(metaW + 16, maxMetaW);

    ctx.fillStyle = cardThemeKey === 'snowLight' ? '#f1f5f9' : '#0b1329';
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(metaX, topBarY, metaPillW, topBarH, 4);
    } else {
      ctx.rect(metaX, topBarY, metaPillW, topBarH);
    }
    ctx.fill();
    ctx.strokeStyle = cardThemeKey === 'snowLight' ? '#e2e8f0' : '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Clip text if it exceeds metaPillW
    ctx.save();
    ctx.beginPath();
    ctx.rect(metaX + 2, topBarY, metaPillW - 4, topBarH);
    ctx.clip();

    ctx.fillStyle = cardThemeKey === 'snowLight' ? '#334155' : '#cbd5e1';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(metaText, metaX + 6, topBarY + topBarH / 2);
    ctx.restore();

    // Compute Hán Việt
    const effectiveHanViet = word.hanViet || (word.kanji ? getHanViet(word.kanji) : '');

    // 3. Left Word Tiles: Kanji inside colored border box + Furigana on top + Han Viet pill below
    const tiles = parseWordTiles(word.kanji || '', word.reading, effectiveHanViet);

    // Pre-calculate total width needed for all tiles
    const maxLeftAllowed = 236; // Leave clean margin before divider at 264
    let rawNeededW = 0;
    for (const tile of tiles) {
      if (!tile) continue;
      if (tile.isKanji) {
        ctx.font = `800 ${Math.max(9, Math.round(13.5 * fontScale * fScale))}px ${FONT_JP}`;
        const fW = tile.furigana ? ctx.measureText(tile.furigana).width : 0;
        ctx.font = `900 ${Math.max(14, Math.round(30 * fontScale * kScale))}px ${FONT_JP}`;
        const kW = ctx.measureText(tile.text || '').width;
        const tW = Math.max(Math.round(44 * Math.min(1.15, fontScale) * kScale), kW + 18, fW + 10);
        rawNeededW += tW + 8;
      } else {
        ctx.font = `900 ${Math.max(14, Math.round(30 * fontScale * kScale))}px ${FONT_JP}`;
        rawNeededW += ctx.measureText(tile.text || '').width + 6;
      }
    }

    const tileScale = rawNeededW > maxLeftAllowed ? Math.max(0.65, maxLeftAllowed / rawNeededW) : 1.0;

    const furiganaFontSize = Math.max(8.5, Math.round(13.5 * fontScale * fScale * tileScale));
    const kanjiFontSize = Math.max(13, Math.round(30 * fontScale * kScale * tileScale));
    const hvFontSize = Math.max(8.5, Math.round(11.5 * fontScale * hvScale * Math.min(1, tileScale * 1.05)));

    let curX = 18;
    const tileBoxY = Math.max(44, Math.round(furiganaFontSize + 28));
    const baseTileH = Math.max(34, Math.round(48 * (kanjiFontSize / 34)));
    const tileBoxH = baseTileH;

    for (const tile of tiles) {
      if (!tile) continue;
      if (tile.isKanji) {
        // Measure sizes
        ctx.font = `800 ${furiganaFontSize}px ${FONT_JP}`;
        const furiganaW = tile.furigana ? ctx.measureText(tile.furigana).width : 0;

        ctx.font = `900 ${kanjiFontSize}px ${FONT_JP}`;
        const kanjiW = ctx.measureText(tile.text || '').width;

        const tileW = Math.max(Math.round(44 * Math.min(1.15, fontScale) * kScale * tileScale), kanjiW + Math.round(14 * tileScale), furiganaW + Math.round(8 * tileScale));

        // 3a. Furigana above Kanji (High contrast, bright gold/yellow or accent)
        if (tile.furigana) {
          ctx.font = `800 ${furiganaFontSize}px ${FONT_JP}`;
          ctx.fillStyle = furiganaColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(tile.furigana, curX + tileW / 2, tileBoxY - 5);
        }

        // 3b. Kanji Box with solid accent border
        ctx.fillStyle = cardThemeKey === 'snowLight' ? '#f1f5f9' : (tile.bgCol || '#0f172a');
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(curX, tileBoxY, tileW, tileBoxH, 8);
        } else {
          ctx.rect(curX, tileBoxY, tileW, tileBoxH);
        }
        ctx.fill();

        ctx.strokeStyle = tile.borderCol || borderColor;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // 3c. Kanji Letter inside box (Bold & crisp)
        ctx.font = `900 ${kanjiFontSize}px ${FONT_JP}`;
        ctx.fillStyle = kanjiColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tile.text || '', curX + tileW / 2, tileBoxY + tileBoxH / 2 + 1);

        // 3d. Hán Việt Badge under box
        if (tile.hanViet) {
          ctx.font = `800 ${hvFontSize}px ${FONT_VI}`;
          const hvText = tile.hanViet.toUpperCase();
          const badgeTextW = ctx.measureText(hvText).width;
          const badgeW = Math.max(tileW, badgeTextW + 12);
          const badgeH = Math.max(18, Math.round(22 * Math.min(1.1, fontScale) * hvScale));
          const badgeX = curX + (tileW - badgeW) / 2;
          const badgeY = tileBoxY + tileBoxH + 5;

          ctx.fillStyle = cardThemeKey === 'snowLight' ? '#e2e8f0' : (tile.badgeBg || '#061325');
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, 6);
          } else {
            ctx.rect(badgeX, badgeY, badgeW, badgeH);
          }
          ctx.fill();

          ctx.strokeStyle = tile.badgeBorder || accentColor;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = tile.badgeText || accentColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(hvText, badgeX + badgeW / 2, badgeY + badgeH / 2 + 0.5);
        }

        curX += tileW + Math.max(4, Math.round(8 * tileScale));
      } else {
        // Okurigana / Kana (e.g. " します", "き")
        ctx.font = `900 ${kanjiFontSize}px ${FONT_JP}`;
        ctx.fillStyle = kanjiColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(tile.text || '', curX + 2, tileBoxY + tileBoxH / 2 + 1);
        curX += ctx.measureText(tile.text || '').width + 6;
      }
    }

    // Reset text align
    ctx.textAlign = 'left';

    // 4. Vertical Divider
    const dividerX = 264;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(dividerX, 16);
    ctx.lineTo(dividerX, 126);
    ctx.stroke();

    // 5. Right Section: Romaji / Pitch + Meaning + Icons
    const rightStartX = dividerX + 16;

    // 5a. Romaji guide pill
    const validRom = isValidLatinRomaji(word.romaji) ? word.romaji : '';
    const romajiStr = validRom || (word.reading ? kanaToRomaji(word.reading) : '');
    if (romajiStr) {
      const romText = `[ ${romajiStr} ]`;
      const romFontSize = Math.round(13 * Math.min(1.15, fontScale));
      ctx.font = `700 ${romFontSize}px ${FONT_MONO}`;
      const romW = ctx.measureText(romText).width + 16;

      ctx.fillStyle = boxBg;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(rightStartX, 16, romW, 26, 6);
      } else {
        ctx.rect(rightStartX, 16, romW, 26);
      }
      ctx.fill();

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(romText, rightStartX + 8, 30);
    }

    // Top-Right Star and Speaker icon placeholders
    ctx.font = '16px sans-serif';
    ctx.fillStyle = cardThemeKey === 'snowLight' ? '#64748b' : '#94a3b8';
    ctx.fillText('☆', width - 48, 30);
    ctx.fillText('🔊', width - 26, 30);

    // 5b. Vietnamese Meaning (Solid, crystal-clear, bold typography)
    const maxMeaningW = width - rightStartX - 16;
    let baseMSize = Math.max(14, Math.round(23 * fontScale * mScale));
    ctx.font = `900 ${baseMSize}px ${FONT_VI}`;
    ctx.fillStyle = meaningColor;
    ctx.textBaseline = 'middle';

    const meaningText = word.meaning || '';
    
    if (ctx.measureText(meaningText).width <= maxMeaningW) {
      ctx.fillText(meaningText, rightStartX, 80);
    } else {
      // Scale down font size first
      while (baseMSize > 16 && ctx.measureText(meaningText).width > maxMeaningW) {
        baseMSize -= 1;
        ctx.font = `900 ${baseMSize}px ${FONT_VI}`;
      }

      if (ctx.measureText(meaningText).width <= maxMeaningW) {
        ctx.fillText(meaningText, rightStartX, 80);
      } else {
        // Wrap into 2 lines
        const words = meaningText.split(' ');
        let line1 = '';
        let line2 = '';
        for (const w of words) {
          const testLine = line1 ? `${line1} ${w}` : w;
          if (ctx.measureText(testLine).width <= maxMeaningW) {
            line1 = testLine;
          } else {
            line2 = line2 ? `${line2} ${w}` : w;
          }
        }
        if (line2) {
          ctx.fillText(line1, rightStartX, 68);
          ctx.fillText(line2, rightStartX, 68 + baseMSize * 1.15);
        } else {
          ctx.fillText(meaningText, rightStartX, 80, maxMeaningW);
        }
      }
    }

    // 6. Bottom Full-Width Example Sentence Box
    const boxY = 132;
    const boxH = height - boxY - 10;
    const boxW = width - 28;
    const boxX = 14;

    ctx.fillStyle = boxBg;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(boxX, boxY, boxW, boxH, 10);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const exJp = word.exampleJp || (word as any).exampleSentence || '';
    const exVi = word.exampleVi || (word as any).exampleTranslation || '';

    if (exJp) {
      // Parse sentence into furigana chunks
      const pool = getAllVocabPool();
      const rawChunks = parseSentenceFuriganaChunks(exJp, word, pool);

      const leftMargin = boxX + 10;
      const maxExX = boxX + boxW - 24;
      const availableW = maxExX - leftMargin;

      // Base font sizes with user scaling
      let exFuriganaFontSize = Math.max(9, Math.round(11.5 * fontScale * exScale));
      let exKanjiFontSize = Math.max(12, Math.round(16.5 * fontScale * exScale));

      // Helper function to measure chunks
      const measureChunk = (chunk: { text?: string; furigana?: string }, kSize: number, fSize: number) => {
        const text = chunk?.text || '';
        const isK = !!(chunk?.furigana && hasKanji(text));
        ctx.font = `700 ${kSize}px ${FONT_JP}`;
        const kWidth = ctx.measureText(text).width;
        let fWidth = 0;
        if (isK && chunk?.furigana) {
          ctx.font = `800 ${fSize}px ${FONT_JP}`;
          fWidth = ctx.measureText(chunk.furigana).width;
        }
        const chunkW = isK ? Math.max(fWidth, kWidth) + 3 : kWidth;
        return { isK, kWidth, fWidth, chunkW };
      };

      // Measure total width on 1 single line
      let totalSingleLineWidth = 0;
      for (const c of rawChunks) {
        totalSingleLineWidth += measureChunk(c, exKanjiFontSize, exFuriganaFontSize).chunkW;
      }

      // Check if it fits on 1 line (optionally with slight font scale if close)
      let fitsOnOneLine = totalSingleLineWidth <= availableW;
      if (!fitsOnOneLine && totalSingleLineWidth <= availableW * 1.12) {
        const scaleDown = availableW / (totalSingleLineWidth + 2);
        exFuriganaFontSize = Math.max(9, Math.round(exFuriganaFontSize * scaleDown));
        exKanjiFontSize = Math.max(12, Math.round(exKanjiFontSize * scaleDown));
        fitsOnOneLine = true;
      }

      // Build lines: array of measured chunk items
      type MeasuredItem = { text: string; furigana?: string; isK: boolean; kWidth: number; fWidth: number; chunkW: number };
      const lines: MeasuredItem[][] = [];

      if (fitsOnOneLine) {
        const line1: MeasuredItem[] = [];
        for (const c of rawChunks) {
          const m = measureChunk(c, exKanjiFontSize, exFuriganaFontSize);
          line1.push({ text: c?.text || '', furigana: c?.furigana, ...m });
        }
        lines.push(line1);
      } else {
        // Multi-line wrapping across 2 lines
        let curLine: MeasuredItem[] = [];
        let curLineWidth = 0;

        for (const c of rawChunks) {
          const isK = !!(c?.furigana && hasKanji(c?.text || ''));
          if (isK) {
            // Kanji chunk is atomic
            const m = measureChunk(c, exKanjiFontSize, exFuriganaFontSize);
            if (curLineWidth + m.chunkW > availableW && curLine.length > 0 && lines.length === 0) {
              lines.push(curLine);
              curLine = [];
              curLineWidth = 0;
            }
            curLine.push({ text: c?.text || '', furigana: c?.furigana, ...m });
            curLineWidth += m.chunkW;
          } else {
            // Plain text chunk can wrap mid-string if needed
            let remainingText = c?.text || '';
            while (remainingText.length > 0) {
              ctx.font = `700 ${exKanjiFontSize}px ${FONT_JP}`;
              const fullW = ctx.measureText(remainingText).width;
              if (curLineWidth + fullW <= availableW || lines.length > 0) {
                curLine.push({
                  text: remainingText,
                  furigana: undefined,
                  isK: false,
                  kWidth: fullW,
                  fWidth: 0,
                  chunkW: fullW
                });
                curLineWidth += fullW;
                remainingText = '';
              } else {
                // Break plain text at character boundary to fill line 1
                let splitIdx = 0;
                let testW = 0;
                for (let i = 1; i <= remainingText.length; i++) {
                  const subW = ctx.measureText(remainingText.slice(0, i)).width;
                  if (curLineWidth + subW <= availableW) {
                    splitIdx = i;
                    testW = subW;
                  } else {
                    break;
                  }
                }
                if (splitIdx > 0) {
                  const part1 = remainingText.slice(0, splitIdx);
                  curLine.push({
                    text: part1,
                    furigana: undefined,
                    isK: false,
                    kWidth: testW,
                    fWidth: 0,
                    chunkW: testW
                  });
                  remainingText = remainingText.slice(splitIdx);
                }
                lines.push(curLine);
                curLine = [];
                curLineWidth = 0;
              }
            }
          }
        }
        if (curLine.length > 0) {
          lines.push(curLine);
        }
      }

      // Draw Japanese Lines
      const isTwoLineJp = lines.length >= 2;

      lines.forEach((lineChunks, lineIdx) => {
        if (lineIdx >= 2) return; // Cap at 2 Japanese lines

        const fBaseline = isTwoLineJp 
          ? (lineIdx === 0 ? boxY + 18 : boxY + 48)
          : boxY + 22;
        const kBaseline = isTwoLineJp
          ? (lineIdx === 0 ? boxY + 34 : boxY + 64)
          : boxY + 42;

        let curX = leftMargin;

        for (const item of lineChunks) {
          if (!item) return;
          if (item.isK && item.furigana) {
            // Draw Furigana on TOP (Bright gold/yellow or accent, super crisp)
            ctx.font = `800 ${exFuriganaFontSize}px ${FONT_JP}`;
            ctx.fillStyle = furiganaColor;
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(item.furigana || '', curX + ((item.chunkW || 0) - (item.fWidth || 0)) / 2, fBaseline);

            // Draw Kanji below Furigana
            ctx.font = `800 ${exKanjiFontSize}px ${FONT_JP}`;
            ctx.fillStyle = accentColor;
            ctx.fillText(item.text || '', curX + ((item.chunkW || 0) - (item.kWidth || 0)) / 2, kBaseline);

            curX += item.chunkW || 0;
          } else {
            // Plain Text / Kana
            ctx.font = `700 ${exKanjiFontSize}px ${FONT_JP}`;
            ctx.fillStyle = kanjiColor;
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(item.text || '', curX, kBaseline);
            curX += item.kWidth || 0;
          }
        }
      });

      // Vietnamese translation lines with smart wrapping without truncation (NON-ITALIC for razor-sharp readability)
      if (exVi) {
        const exViFontSize = Math.max(10, Math.round((isTwoLineJp ? 13 : 14) * fontScale * exScale));
        // Use crisp regular/semi-bold font (NEVER italic which causes subpixel anti-aliasing blur/pixelation)
        ctx.font = `600 ${exViFontSize}px ${FONT_VI}`;
        ctx.fillStyle = cardThemeKey === 'snowLight' ? '#334155' : '#f8fafc';
        ctx.textBaseline = 'alphabetic';

        // Wrap Vietnamese text by words
        const viWords = exVi.split(' ');
        const viLines: string[] = [];
        let currentViLine = '';

        for (const vw of viWords) {
          const testLine = currentViLine ? `${currentViLine} ${vw}` : vw;
          if (ctx.measureText(testLine).width <= availableW) {
            currentViLine = testLine;
          } else {
            if (currentViLine) {
              viLines.push(currentViLine);
              currentViLine = vw;
            } else {
              viLines.push(vw);
              currentViLine = '';
            }
          }
        }
        if (currentViLine) {
          viLines.push(currentViLine);
        }

        const viStartBaseline = isTwoLineJp 
          ? (viLines.length > 1 ? boxY + 84 : boxY + 90)
          : (viLines.length > 1 ? boxY + 68 : boxY + 76);

        viLines.slice(0, 2).forEach((vLine, vIdx) => {
          const lineY = viStartBaseline + vIdx * Math.round(exViFontSize * 1.25);
          ctx.fillText(vLine, leftMargin, lineY, availableW);
        });
      }

      // Audio icon indicator at top-right of example box
      ctx.font = '13px sans-serif';
      ctx.fillStyle = cardThemeKey === 'snowLight' ? '#94a3b8' : '#64748b';
      ctx.fillText('🔊', boxX + boxW - 20, boxY + 18);
    }

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to generate rich notification canvas image:', err);
    return '';
  }
}

/**
 * Global registry of active desktop notifications to:
 * 1. Retain references preventing V8 garbage-collection before autoClose timer fires.
 * 2. Allow precise multi-channel closure (instance.close() + SW registration close + postMessage).
 */
interface ActiveNotificationEntry {
  notification?: Notification;
  timer?: any;
  timestamp: number;
}

const activeDesktopNotifications = new Map<string, ActiveNotificationEntry>();

/**
 * Shared Background Web Worker:
 * Runs on a dedicated OS worker thread completely immune to Chrome/Edge tab throttling
 * when the browser window is minimized or inactive in the background on Windows.
 */
let sharedBackgroundWorker: Worker | null = null;

export const getSharedBackgroundWorker = (): Worker | null => {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
  if (!sharedBackgroundWorker) {
    try {
      const workerCode = `
        let ticker = null;
        const closeTimers = {};

        self.onmessage = function(e) {
          if (!e.data) return;
          if (e.data === 'start' || (e.data && e.data.type === 'START_TICKER')) {
            if (ticker) clearInterval(ticker);
            ticker = setInterval(function() {
              self.postMessage({ type: 'tick' });
            }, 15000);
          } else if (e.data === 'stop' || (e.data && e.data.type === 'STOP_TICKER')) {
            if (ticker) clearInterval(ticker);
            ticker = null;
          } else if (e.data.type === 'SCHEDULE_CLOSE') {
            const tag = e.data.tag;
            const delay = e.data.delay || 5000;
            if (closeTimers[tag]) clearTimeout(closeTimers[tag]);
            closeTimers[tag] = setTimeout(function() {
              self.postMessage({ type: 'CLOSE_NOTIFICATION_NOW', tag: tag });
              delete closeTimers[tag];
            }, delay);
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      sharedBackgroundWorker = new Worker(workerUrl);

      sharedBackgroundWorker.addEventListener('message', (e: MessageEvent) => {
        if (e.data && e.data.type === 'CLOSE_NOTIFICATION_NOW' && e.data.tag) {
          forceCloseNotification(e.data.tag);
        }
      });
    } catch (e) {
      console.warn('[Notification] Shared worker initialization warning:', e);
    }
  }
  return sharedBackgroundWorker;
};

/**
 * Forcefully closes a notification across all channels:
 * 1. Direct JS Notification instance .close()
 * 2. ServiceWorker getNotifications({ tag }) .close()
 * 3. ServiceWorker message CLOSE_NOTIFICATION
 */
export const forceCloseNotification = (tag: string) => {
  if (!tag) return;

  // 1. Direct JS Notification instance
  const entry = activeDesktopNotifications.get(tag);
  if (entry) {
    if (entry.timer) clearTimeout(entry.timer);
    if (entry.notification) {
      try {
        entry.notification.close();
      } catch (e) {}
    }
    activeDesktopNotifications.delete(tag);
  }

  // 2. Service Worker notifications
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(async (registration) => {
      try {
        let notifs = await registration.getNotifications({ tag });
        if (!notifs || notifs.length === 0) {
          const all = await registration.getNotifications();
          notifs = all.filter((n) => !tag || n.tag === tag || (n.tag && n.tag.includes(tag)));
        }
        notifs.forEach((n) => {
          try {
            n.close();
          } catch (e) {}
        });
      } catch (e) {}

      try {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLOSE_NOTIFICATION',
            tag
          });
        }
      } catch (e) {}
    }).catch(() => {});
  }
};

/**
 * Schedules auto-closure of a notification after autoCloseMs (default 5000ms).
 * Uses background Web Worker timers so background tabs on Windows close on time!
 */
export const scheduleNotificationAutoClose = (
  tag: string,
  autoCloseMs = 5000,
  notificationInstance?: Notification
) => {
  if (!tag || autoCloseMs <= 0) return;

  // Track instance in memory to prevent V8 GC
  const current = activeDesktopNotifications.get(tag) || { timestamp: Date.now() };
  if (notificationInstance) {
    current.notification = notificationInstance;
  }
  activeDesktopNotifications.set(tag, current);

  // A. Web Worker timer (un-throttled in background tabs on Windows)
  const worker = getSharedBackgroundWorker();
  if (worker) {
    try {
      worker.postMessage({
        type: 'SCHEDULE_CLOSE',
        tag,
        delay: autoCloseMs
      });
    } catch (e) {}
  }

  // B. Main thread timeouts (both at exact time and safety offset)
  const timer = setTimeout(() => {
    forceCloseNotification(tag);
  }, autoCloseMs);
  current.timer = timer;

  setTimeout(() => {
    forceCloseNotification(tag);
  }, autoCloseMs + 400);
};

/**
 * Trigger robust Floating Toast System Notification on Windows desktop
 */
export const sendNotification = (
  title: string,
  body: string,
  icon = '/icon.svg',
  tag = 'jpstudy-daily-reminder',
  data: any = {},
  requireInteraction = false,
  image?: string,
  autoCloseMs = 5000
): boolean => {
  if (!isNotificationSupported()) return false;

  if (Notification.permission === 'granted') {
    const isPinned = requireInteraction === true;

    // 1. On Windows & Desktop browsers, direct `new Notification()` provides a direct instance handle.
    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge: icon,
        image,
        tag,
        requireInteraction: isPinned
      } as any);

      notification.onclick = () => {
        try {
          window.focus();
        } catch (e) {}
        try {
          notification.close();
        } catch (e) {}
        forceCloseNotification(tag);
      };

      // Auto close notification after autoCloseMs (default 5 seconds) unless user pinned it
      if (!isPinned && autoCloseMs > 0) {
        scheduleNotificationAutoClose(tag, autoCloseMs, notification);
      }

      return true;
    } catch (e) {
      // Browsers like Chrome on Android disallow `new Notification()` (throwing Illegal constructor).
      // Fallback to Service Worker Registration showNotification below.
    }

    // 2. Service Worker Registration showNotification fallback (Android / headless / SW context)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(async (registration) => {
        await registration.showNotification(title, {
          body,
          icon,
          badge: icon,
          image,
          tag,
          renotify: true,
          requireInteraction: isPinned,
          vibrate: [200, 100, 200],
          data: {
            url: '/',
            ...data
          }
        } as any);

        if (!isPinned && autoCloseMs > 0) {
          scheduleNotificationAutoClose(tag, autoCloseMs);
        }
      }).catch((err) => {
        console.warn('SW showNotification fallback failed:', err);
      });
      return true;
    }
  }
  return false;
};

function fallbackDirectNotification(
  title: string,
  body: string,
  icon: string,
  tag: string,
  requireInteraction = false,
  image?: string,
  autoCloseMs = 5000
): boolean {
  try {
    const isPinned = requireInteraction === true;
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      image,
      tag,
      requireInteraction: isPinned
    } as any);

    notification.onclick = () => {
      try {
        window.focus();
      } catch (e) {}
      try {
        notification.close();
      } catch (e) {}
      forceCloseNotification(tag);
    };

    if (!isPinned && autoCloseMs > 0) {
      scheduleNotificationAutoClose(tag, autoCloseMs, notification);
    }

    return true;
  } catch (e) {
    console.error('Direct Notification failed:', e);
    return false;
  }
}

export const triggerVocabToast = (word: VocabNotificationPayload) => {
  if (typeof window !== 'undefined' && word) {
    window.dispatchEvent(new CustomEvent('jpstudy-vocab-toast', { detail: word }));
  }
};

/**
 * Send a rich floating vocabulary notification on Windows & In-App
 */
export const sendFloatingVocabNotification = (
  settings: ReminderSettings,
  customWord?: VocabNotificationPayload
): VocabNotificationPayload | null => {
  let word = customWord;
  if (!word) {
    const pool = getEffectiveVocabPool(settings);
    if (pool.length === 0) return null;
    word = pool[Math.floor(Math.random() * pool.length)];
  }

  if (!word) return null;

  if (!word.hanViet && word.kanji) {
    word.hanViet = getHanViet(word.kanji);
  }

  // Trigger in-app floating toast UI
  triggerVocabToast(word);

  // Send to native Windows notification system
  if (Notification.permission === 'granted') {
    const hideText = settings.hideNotificationText !== false;
    let title = BRAND_NAME;
    let body = '';

    const originInfo = formatVocabOriginLabel(word);

    if (!hideText) {
      const hanVietStr = word.hanViet ? ` • Âm Hán: ${word.hanViet.toUpperCase()}` : '';
      const wordDisplay = word.kanji && word.kanji !== word.reading
        ? `${word.kanji}【${word.reading}】${hanVietStr}`
        : `${word.reading}`;
      title = `🌸 [${originInfo.badgeLevel}] ${wordDisplay}`;
      const exJpStr = word.exampleJp || (word as any).exampleSentence || '';
      const exViStr = word.exampleVi || (word as any).exampleTranslation || '';
      const exText = exJpStr ? `\n📝 Ví dụ: ${exJpStr}${exViStr ? ` (${exViStr})` : ''}` : '';
      body = `📚 ${originInfo.fullTagline}\n💡 Nghĩa: ${word.meaning}${word.hanViet ? ` | 🏷️ Hán Việt: ${word.hanViet.toUpperCase()}` : ''}${exText}`;
    }

    const requireInteraction = settings.vocabRequireInteraction === true;
    const tag = `jlptgo-vocab-${Date.now()}`;

    // Generate crystal-clear colored image card with Furigana on top of Kanji (in word & example)
    const imageCard = generateVocabNotificationImage(word, settings);

    sendNotification(title, body, '/icon.svg', tag, { word }, requireInteraction, imageCard, 5000);
  }

  if (settings.vocabPlaySound !== false) {
    playNotificationChime();
  }

  return word;
};

/**
 * Check if a daily reminder should fire right now
 */
export const checkAndTriggerReminder = (settings: ReminderSettings): ReminderSettings => {
  if (!settings.enabled || Notification.permission !== 'granted') {
    return settings;
  }

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (currentTime === settings.time && settings.lastNotifiedDate !== todayStr) {
    const messages = [
      `Đã đến giờ luyện tập tiếng Nhật hôm nay rồi! 🌸 Hãy dành 10 phút cùng ${BRAND_NAME} nhé.`,
      `Cùng ${BRAND_NAME} học vài từ vựng và câu đố JLPT hôm nay nào! 📚`,
      `Đừng quên hoàn thành mục tiêu học tập hôm nay nhé! 🎯 ${BRAND_NAME} đang chờ bạn.`,
      'Duy trì thói quen học tiếng Nhật mỗi ngày sẽ giúp bạn chinh phục JLPT dễ dàng! 💪'
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    const sent = sendNotification(`🌸 ${BRAND_NAME} - Nhắc nhở học tập!`, randomMsg, '/icon.svg', 'jlptgo-daily-reminder');
    if (sent) {
      const updated = { ...settings, lastNotifiedDate: todayStr };
      saveReminderSettings(updated);
      return updated;
    }
  }

  return settings;
};

/**
 * Web Worker Background Timer
 * Runs un-throttled in a separate background thread even when the browser is minimized!
 */
export const startBackgroundVocabTicker = (
  onTick?: () => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  try {
    const worker = getSharedBackgroundWorker();
    if (worker) {
      const handleMessage = (e: MessageEvent) => {
        if (e.data && (e.data === 'tick' || e.data.type === 'tick')) {
          const currentSettings = getDefaultReminderSettings();
          if (currentSettings.vocabEnabled && Notification.permission === 'granted') {
            const now = Date.now();
            const lastTime = currentSettings.lastVocabNotifiedTime || 0;
            const intervalMs = (currentSettings.vocabInterval || 15) * 60 * 1000;

            if (now - lastTime >= intervalMs) {
              sendFloatingVocabNotification(currentSettings);
              const updated = { ...currentSettings, lastVocabNotifiedTime: now };
              saveReminderSettings(updated);
            }
          }

          // Also check daily reminder
          checkAndTriggerReminder(getDefaultReminderSettings());

          if (onTick) onTick();
        }
      };

      worker.addEventListener('message', handleMessage);
      worker.postMessage({ type: 'START_TICKER' });

      return () => {
        worker.removeEventListener('message', handleMessage);
      };
    }
  } catch (e) {
    console.warn('Web Worker background timer fallback to standard setInterval:', e);
  }

  // Fallback to setInterval if Web Worker unavailable
  const interval = setInterval(() => {
    const currentSettings = getDefaultReminderSettings();
    if (currentSettings.vocabEnabled && Notification.permission === 'granted') {
      const now = Date.now();
      const lastTime = currentSettings.lastVocabNotifiedTime || 0;
      const intervalMs = (currentSettings.vocabInterval || 15) * 60 * 1000;

      if (now - lastTime >= intervalMs) {
        sendFloatingVocabNotification(currentSettings);
        const updated = { ...currentSettings, lastVocabNotifiedTime: now };
        saveReminderSettings(updated);
      }
    }
    checkAndTriggerReminder(getDefaultReminderSettings());
    if (onTick) onTick();
  }, 15000);

  return () => clearInterval(interval);
};

