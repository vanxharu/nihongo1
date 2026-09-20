// JPStudy PWA Service Worker with Background Notification & Offline Support
const CACHE_NAME = 'jpstudy-pwa-v3';
const DATA_CACHE_NAME = 'jpstudy-data-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/logo.svg'
];

// In-memory / cached reminder state
let cachedSettings = {
  enabled: true,
  time: '20:00',
  vocabEnabled: true,
  vocabInterval: 15,
  vocabPlaySound: true,
  vocabLevels: ['N5', 'N4', 'N3']
};

let cachedVocabList = [
  { kanji: '勉強', reading: 'べんきょう', meaning: 'Học tập / Việc học', level: 'N5', exampleJp: '毎日日本語を勉強しています。', exampleFurigana: 'まいにちにほんごをべんきょうしています。' },
  { kanji: '友達', reading: 'ともだち', meaning: 'Bạn bè', level: 'N5', exampleJp: '週末に友達と遊びます。', exampleFurigana: 'しゅうまつにともだちとあそびます。' },
  { kanji: '約束', reading: 'やくそく', meaning: 'Lời hứa / Cuộc hẹn', level: 'N4', exampleJp: '友達と約束をしました。', exampleFurigana: 'ともだちとやくそくをしました。' },
  { kanji: '経験', reading: 'けいけん', meaning: 'Kinh nghiệm', level: 'N3', exampleJp: '留学でいい経験ができました。', exampleFurigana: 'りゅうがくでいいけいけんができました。' },
  { kanji: '準備', reading: 'じゅんび', meaning: 'Chuẩn bị', level: 'N4', exampleJp: '旅行の準備をしています。', exampleFurigana: 'りょこうのじゅんびをしています。' },
  { kanji: '大切', reading: 'たいせつ', meaning: 'Quan trọng', level: 'N5', exampleJp: '時間はとても大切です。', exampleFurigana: 'じかんはとてもたいせつです。' },
  { kanji: '成功', reading: 'せいこう', meaning: 'Thành công', level: 'N3', exampleJp: '試験に成功しました。', exampleFurigana: 'しけんにせいこうしました。' },
  { kanji: '努力', reading: 'どりょく', meaning: 'Nỗ lực / Cố gắng', level: 'N3', exampleJp: '目標に向かって努力する。', exampleFurigana: 'もくひょうにむかってどりょくする。' }
];

// Helper to save settings/vocab to Cache Storage for persistence across SW restarts
async function persistStateToCache() {
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    await cache.put('/sw-data-settings.json', new Response(JSON.stringify(cachedSettings)));
    await cache.put('/sw-data-vocab.json', new Response(JSON.stringify(cachedVocabList)));
  } catch (e) {
    console.warn('[SW] Could not persist state to cache:', e);
  }
}

// Helper to restore settings/vocab from Cache Storage on SW startup
async function restoreStateFromCache() {
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const settingsResp = await cache.match('/sw-data-settings.json');
    if (settingsResp) {
      cachedSettings = await settingsResp.json();
    }
    const vocabResp = await cache.match('/sw-data-vocab.json');
    if (vocabResp) {
      const list = await vocabResp.json();
      if (Array.isArray(list) && list.length > 0) {
        cachedVocabList = list;
      }
    }
  } catch (e) {
    console.warn('[SW] Could not restore state from cache:', e);
  }
}

// Schedule future notifications with Notification Triggers API (Chromium / Android PWA)
async function scheduleFutureNotifications() {
  if (!('showNotification' in self.registration)) return;
  if (!cachedSettings || !cachedSettings.vocabEnabled) return;

  try {
    const hasTimestampTrigger = 'showTrigger' in Notification.prototype || 'TimestampTrigger' in self;
    if (hasTimestampTrigger && typeof TimestampTrigger !== 'undefined') {
      const intervalMinutes = cachedSettings.vocabInterval || 15;
      const now = Date.now();
      
      // Schedule the next 5 reminders in advance so the OS delivers them even when offline/closed
      for (let i = 1; i <= 5; i++) {
        const scheduledTime = now + (i * intervalMinutes * 60 * 1000);
        const randomWord = cachedVocabList[Math.floor(Math.random() * cachedVocabList.length)];
        
        const hideText = cachedSettings && cachedSettings.hideNotificationText !== false;
        let title = 'NihonGo!';
        let scheduleBody = '';

        if (!hideText) {
          const wordText = randomWord.kanji ? `${randomWord.kanji} (${randomWord.reading})` : randomWord.reading;
          const exJp = randomWord.exampleJp || randomWord.exampleSentence || '';
          const exVi = randomWord.exampleVi || randomWord.exampleTranslation || '';
          title = `🌸 [${randomWord.level || 'JLPT'}] ${wordText}`;
          scheduleBody = `💡 Nghĩa: ${randomWord.meaning}${exJp ? `\n📝 Ví dụ: ${exJp}${exVi ? ` (${exVi})` : ''}` : ''}`;
        }
        
        await self.registration.showNotification(title, {
          body: scheduleBody,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: `jpstudy-scheduled-${i}`,
          showTrigger: new TimestampTrigger(scheduledTime),
          data: {
            url: '/',
            word: randomWord
          }
        });
      }
      console.log('[SW] Scheduled future notifications with TimestampTrigger successfully.');
    }
  } catch (e) {
    // TimestampTrigger might not be supported in all browsers, gracefully fallback
    console.log('[SW] TimestampTrigger not available or failed:', e);
  }
}

// Common Kanji readings & Hán-Việt dictionaries for SW notification cards
const SW_COMMON_READINGS = {
  '日本': 'にほん', '日本語': 'にほんご', '日本人': 'にほんじん', '手紙': 'てがみ', '最近': 'さいきん',
  '届きます': 'とどきます', '届く': 'とどく', '届いた': 'とどいた', '届きました': 'とどきました', '届け': 'とどけ',
  '始めます': 'はじめます', '始めました': 'はじめました', '始まる': 'はじまる', '始まった': 'はじまった',
  '郵便局': 'ゆうびんきょく', '切手': 'きって', '荷物': 'にもつ', '封筒': 'ふうとう', '住所': 'じゅうしょ',
  '電話': 'でんわ', '番号': 'ばんごう', '街': 'まち', '自動販売機': 'じどうはんばいき', '温かい': 'あたたかい',
  '冷たい': 'つめたい', '飲み物': 'のみもの', '食べ物': 'たべもの', '年中': 'ねんじゅう', '買えます': 'かえます',
  '買える': 'かえる', '災害': 'さいがい', '時': 'とき', '無料': 'むりょう', '有料': 'ゆうりょう',
  '提供': 'ていきょう', '機能': 'きのう', '歴史': 'れきし', '茶道': 'さどう', '完成': 'かんせい',
  '飲む': 'のむ', '飲みます': 'のみます', '心': 'こころ', '大切': 'たいせつ', '車': 'くるま', '本': 'ほん',
  '私': 'わたし', '先生': 'せんせい', '学生': 'がくせい', '大学': 'だいがく', '学校': 'がっこう',
  '友達': 'ともだち', '家族': 'かぞく', '仕事': 'しごと', '勉強': 'べんきょう', '料理': 'りょうり',
  '写真': 'しゃしん', '映画': 'えいが', '音楽': 'おんがく', '旅行': 'りょこう', '時間': 'じかん',
  '今日': 'きょう', '明日': 'あした', '昨日': 'きのう', '今週': 'こんしゅう', '来週': 'らいしゅう',
  '病院': 'びょういん', '駅': 'えき', '電車': 'でんしゃ', '言葉': 'ことば', '意味': 'いみ',
  '漢字': 'かんじ', '文法': 'ぶんぽう', '練習': 'れんしゅう', '問題': 'もんだい', '質問': 'しつもん',
  '安心': 'あんしん', '心配': 'しんぱい', '注意': 'ちゅうい', '危険': 'きけん', '準備': 'じゅんび',
  '予約': 'よやく', '説明': 'せつめい', '社会': 'しゃかい', '世界': 'せかい', '生活': 'せいかつ',
  '成功': 'せいこう', '失敗': 'しっぱい', '経験': 'けいけん', '努力': 'どりょく', '約束': 'やくそく'
};

const SW_SINGLE_KANJI = {
  '届': 'とど', '手': 'て', '紙': 'がみ', '始': 'はじ', '終': 'お', '見': 'み', '聞': 'き', '読': 'よ',
  '書': 'か', '話': 'はな', '買': 'か', '売': 'う', '食': 'た', '飲': 'の', '行': 'い', '来': 'き',
  '帰': 'かえ', '会': 'あ', '待': 'ま', '立': 'た', '座': 'すわ', '入': 'はい', '出': 'で', '使': 'つか',
  '作': 'つく', '持': 'も', '知': 'し', '住': 'す', '思': 'おも', '言': 'い', '歩': 'ある', '走': 'はし',
  '泳': 'およ', '教': 'おし', '習': 'なら', '貸': 'か', '借': 'か', '送': 'おく', '切': 'き', '開': 'あ',
  '閉': 'し', '着': 'つ', '脱': 'ぬ', '洗': 'あら', '乗': 'の', '降': 'お', '消': 'き', '止': 'と',
  '大': 'おお', '小': 'ちい', '高': 'たか', '新': 'あたら', '古': 'ふる', '多': 'おお', '少': 'すく',
  '近': 'ちか', '遠': 'とお', '早': 'はや', '遅': 'おそ', '重': 'おも', '軽': 'かる', '明': 'あか',
  '日': 'ひ', '月': 'つき', '火': 'ひ', '水': 'みず', '木': 'き', '金': 'かね', '土': 'つち', '年': 'とし',
  '時': 'とき', '分': 'ふん', '春': 'はる', '夏': 'なつ', '秋': 'あき', '冬': 'ふゆ', '朝': 'あさ',
  '昼': 'ひる', '夕': 'ゆう', '夜': 'よる', '晩': 'ばん', '空': 'そら', '海': 'うみ', '山': 'やま',
  '川': 'かわ', '花': 'はな', '雨': 'あめ', '雪': 'ゆき', '風': 'かぜ', '人': 'ひと', '友': 'とも'
};

const SW_HAN_VIET_MAP = {
  '復': 'PHỤC', '習': 'TẬP', '毎': 'MỖI',
  '日': 'NHẬT', '本': 'BẢN', '語': 'NGỮ', '人': 'NHÂN', '学': 'HỌC', '生': 'SINH',
  '先': 'TIÊN', '私': 'TƯ', '友': 'HỮU', '達': 'ĐẠT', '勉': 'MIỄN', '強': 'CƯỜNG',
  '手': 'THỦ', '紙': 'CHỈ', '届': 'GIỚI', '始': 'THỦY', '終': 'CHUNG', '見': 'KIẾN',
  '聞': 'VĂN', '読': 'ĐỘC', '書': 'THƯ', '話': 'THOẠI', '買': 'MÃI', '売': 'MẠI',
  '食': 'THỰC', '飲': 'ẨM', '行': 'HÀNH', '来': 'LAI', '帰': 'QUY', '会': 'HỘI',
  '待': 'ĐÃI', '立': 'LẬP', '座': 'TỌA', '入': 'NHẬP', '出': 'XUẤT', '使': 'SỬ',
  '作': 'TÁC', '持': 'TRÌ', '知': 'TRI', '住': 'TRÚ', '思': 'TƯ', '言': 'NGÔN',
  '歩': 'BỘ', '走': 'TẨU', '泳': 'VỊNH', '教': 'GIÁO', '送': 'TỐNG',
  '切': 'THIẾT', '開': 'KHAI', '閉': 'BẾ', '着': 'TRƯỚC', '乗': 'THỪA', '降': 'GIÁNG',
  '新': 'TÂN', '古': 'CỔ', '大': 'ĐẠI', '小': 'TIỂU', '高': 'CAO', '低': 'ĐÊ',
  '長': 'TRƯỜNG', '短': 'ĐOẢN', '多': 'ĐA', '少': 'THIỂU', '時': 'THỜI', '間': 'GIAN',
  '分': 'PHÂN', '年': 'NIÊN', '月': 'NGUYỆT', '朝': 'TRIÊU', '昼': 'TRÚ', '夜': 'DẠ',
  '今': 'KIM', '明': 'MINH', '昨': 'TÁC', '去': 'KHỨ', '週': 'CHU', '車': 'XA',
  '電': 'ĐIỆN', '駅': 'DỊCH', '道': 'ĐẠO', '社': 'XÃ', '校': 'HIỆU', '店': 'ĐIẾM',
  '病': 'BỆNH', '院': 'VIỆN', '気': 'KHÍ', '雨': 'VŨ', '雪': 'TUYẾT', '風': 'PHONG',
  '天': 'THIÊN', '空': 'KHÔNG', '海': 'HẢI', '山': 'SƠN', '川': 'XUYÊN', '花': 'HOA',
  '経': 'KINH', '験': 'NGHIỆM', '準': 'CHUẨN', '備': 'BỊ', '約': 'ƯỚC', '束': 'THÚC',
  '成': 'THÀNH', '功': 'CÔNG', '努': 'NỖ', '力': 'LỰC'
};

function getSwHanViet(kanji) {
  if (!kanji) return '';
  const result = [];
  for (let i = 0; i < kanji.length; i++) {
    const char = kanji[i];
    if (SW_HAN_VIET_MAP[char]) {
      result.push(SW_HAN_VIET_MAP[char]);
    }
  }
  return result.join(' ');
}

function swKanaToRomaji(kana) {
  if (!kana) return '';
  const romajiMap = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'де': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo'
  };

  let result = '';
  let i = 0;
  while (i < kana.length) {
    if (i + 1 < kana.length && kana[i] === 'っ') {
      const next2 = kana.slice(i + 1, i + 3);
      const next1 = kana.slice(i + 1, i + 2);
      const nextRom = romajiMap[next2] || romajiMap[next1] || '';
      if (nextRom) {
        result += nextRom[0];
      }
      i++;
      continue;
    }
    const combo = kana.slice(i, i + 2);
    if (romajiMap[combo]) {
      result += romajiMap[combo];
      i += 2;
      continue;
    }
    const single = kana.slice(i, i + 1);
    if (romajiMap[single]) {
      result += romajiMap[single];
    } else {
      result += single;
    }
    i++;
  }
  return result;
}

function getSwVocabOriginLabel(word) {
  const level = word.level || 'N4';
  let currName = 'Minna no Nihongo';
  let currIcon = '📘';
  let isTango = false;

  if (
    word.curriculum === 'tango' ||
    (word.curriculumName && word.curriculumName.toLowerCase().includes('tango')) ||
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

// Helper to generate notification card image inside Service Worker (OffscreenCanvas)
async function generateSwNotificationImage(word) {
  try {
    if (typeof OffscreenCanvas === 'undefined') return undefined;

    const width = 640;
    const height = 240;
    const scale = 3; // 3x Supersampling for ultra-crisp display on Windows Notification Center

    const canvas = new OffscreenCanvas(width * scale, height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#060a14');
    bgGradient.addColorStop(0.5, '#0a1020');
    bgGradient.addColorStop(1, '#0e172a');

    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(0, 0, width, height, 16);
    } else {
      ctx.rect(0, 0, width, height);
    }
    ctx.fill();

    // Border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Top-Left Level Badge + Curriculum / Lesson / Word # Badge
    const originInfo = getSwVocabOriginLabel(word);

    // 2a. Level pill
    const lvlText = originInfo.badgeLevel;
    ctx.font = 'bold 11px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const lvlW = ctx.measureText(lvlText).width;
    const lvlPillW = lvlW + 12;
    const topBarH = 18;
    const topBarY = 14;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(22, topBarY, lvlPillW, topBarH, 4);
    } else {
      ctx.rect(22, topBarY, lvlPillW, topBarH);
    }
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lvlText, 22 + lvlPillW / 2, topBarY + topBarH / 2);

    // 2b. Curriculum & Lesson & Word # Badge
    const metaText = `${originInfo.curriculumBadge} • ${originInfo.lessonBadge}${originInfo.wordNumBadge ? ` • ${originInfo.wordNumBadge}` : ''}`;
    ctx.font = 'bold 10.5px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const metaW = ctx.measureText(metaText).width;
    const metaPillW = Math.min(metaW + 14, 230);
    const metaX = 22 + lvlPillW + 6;

    ctx.fillStyle = '#0b1329';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(metaX, topBarY, metaPillW, topBarH, 4);
    } else {
      ctx.rect(metaX, topBarY, metaPillW, topBarH);
    }
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(metaX + 2, topBarY, metaPillW - 4, topBarH);
    ctx.clip();

    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(metaText, metaX + 6, topBarY + topBarH / 2);
    ctx.restore();

    // Compute Hán Việt
    const effectiveHanViet = word.hanViet || (word.kanji ? getSwHanViet(word.kanji) : '');

    // Parse Word Tiles
    const colors = [
      { border: '#f59e0b', bg: '#1c160c', text: '#fde047', badgeBorder: '#0284c7', badgeText: '#38bdf8', badgeBg: '#081a2e' },
      { border: '#6366f1', bg: '#13112c', text: '#c7d2fe', badgeBorder: '#4f46e5', badgeText: '#a5b4fc', badgeBg: '#18133a' },
      { border: '#10b981', bg: '#06281e', text: '#a7f3d0', badgeBorder: '#059669', badgeText: '#6ee7b7', badgeBg: '#06281e' },
      { border: '#ec4899', bg: '#2b0b1a', text: '#fbcfe8', badgeBorder: '#db2777', badgeText: '#f472b6', badgeBg: '#360920' }
    ];

    const kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/;
    let curX = 22;
    const tileBoxY = 46;
    const tileBoxH = 40;

    if (word.kanji && word.kanji !== word.reading) {
      let kEnd = word.kanji.length;
      let rEnd = word.reading.length;
      while (kEnd > 0 && rEnd > 0 && word.kanji[kEnd - 1] === word.reading[rEnd - 1]) {
        kEnd--;
        rEnd--;
      }

      const kanjiStem = word.kanji.slice(0, kEnd);
      const readingStem = word.reading.slice(0, rEnd);
      const okurigana = word.kanji.slice(kEnd);
      const hvParts = effectiveHanViet.split(/\s+/).filter(Boolean);

      for (let i = 0; i < kanjiStem.length; i++) {
        const char = kanjiStem[i];
        const color = colors[i % colors.length];
        const furigana = SW_SINGLE_KANJI[char] || (kanjiStem.length === 1 ? readingStem : '');
        const hv = hvParts[i] || SW_HAN_VIET_MAP[char] || '';

        ctx.font = 'bold 11.5px "Meiryo", "Yu Gothic", "Hiragino Sans", "Segoe UI", sans-serif';
        const furiganaW = furigana ? ctx.measureText(furigana).width : 0;

        ctx.font = '900 24px "Meiryo", "Yu Gothic", "Hiragino Sans", "Segoe UI", sans-serif';
        const kanjiW = ctx.measureText(char).width;
        const tileW = Math.max(40, kanjiW + 16, furiganaW + 10);

        // Furigana
        if (furigana) {
          ctx.font = 'bold 11.5px "Meiryo", "Yu Gothic", "Hiragino Sans", "Segoe UI", sans-serif';
          ctx.fillStyle = color.border === '#6366f1' ? '#c7d2fe' : '#fde047';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(furigana, curX + tileW / 2, tileBoxY - 4);
        }

        // Kanji Box
        ctx.fillStyle = color.bg;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(curX, tileBoxY, tileW, tileBoxH, 7);
        } else {
          ctx.rect(curX, tileBoxY, tileW, tileBoxH);
        }
        ctx.fill();

        ctx.strokeStyle = color.border;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Kanji Letter
        ctx.font = '900 24px "Meiryo", "Yu Gothic", "Hiragino Sans", "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, curX + tileW / 2, tileBoxY + tileBoxH / 2 + 1);

        // Hán-Việt Badge
        if (hv) {
          ctx.font = '900 10.5px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const hvText = hv.toUpperCase();
          const badgeTextW = ctx.measureText(hvText).width;
          const badgeW = Math.max(tileW, badgeTextW + 12);
          const badgeH = 20;
          const badgeX = curX + (tileW - badgeW) / 2;
          const badgeY = tileBoxY + tileBoxH + 6;

          ctx.fillStyle = color.badgeBg;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
          } else {
            ctx.rect(badgeX, badgeY, badgeW, badgeH);
          }
          ctx.fill();

          ctx.strokeStyle = color.badgeBorder;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = color.badgeText;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(hvText, badgeX + badgeW / 2, badgeY + badgeH / 2 + 0.5);
        }

        curX += tileW + 8;
      }

      if (okurigana) {
        ctx.font = '900 24px "Meiryo", "Yu Gothic", "Hiragino Sans", "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(okurigana, curX + 2, tileBoxY + tileBoxH / 2 + 1);
      }
    } else {
      ctx.font = '900 26px "Meiryo", "Yu Gothic", "Hiragino Sans", "Segoe UI", sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(word.reading, curX, tileBoxY + tileBoxH / 2 + 1);
    }

    ctx.textAlign = 'left';

    // 4. Vertical Divider
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(316, 20);
    ctx.lineTo(316, 128);
    ctx.stroke();

    // 5. Right Section
    const rightStartX = 332;
    const romajiStr = word.romaji || swKanaToRomaji(word.reading);
    if (romajiStr) {
      const romText = `[${romajiStr}]`;
      ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      const romW = ctx.measureText(romText).width + 16;

      ctx.fillStyle = '#080f20';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(rightStartX, 24, romW, 26, 6);
      } else {
        ctx.rect(rightStartX, 24, romW, 26);
      }
      ctx.fill();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.textBaseline = 'middle';
      ctx.fillText(romText, rightStartX + 8, 37);
    }

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('☆', width - 58, 38);
    ctx.fillText('🔊', width - 36, 38);

    // Meaning
    ctx.font = '900 21px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(word.meaning, rightStartX, 84, width - rightStartX - 24);

    // 6. Bottom Full-Width Example Sentence Box
    const boxY = 138;
    const boxH = 86;
    const boxW = width - 32;

    ctx.fillStyle = '#050a15';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(16, boxY, boxW, boxH, 10);
    } else {
      ctx.rect(16, boxY, boxW, boxH);
    }
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    const exJp = word.exampleJp || word.exampleSentence || '';
    const exVi = word.exampleVi || word.exampleTranslation || '';

    if (exJp) {
      let sentence = exJp;
      const chunks = [];
      const dict = { ...SW_COMMON_READINGS };
      if (word.kanji && word.reading) {
        dict[word.kanji] = word.reading;
      }
      const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

      let idx = 0;
      while (idx < sentence.length) {
        let matched = false;
        for (let k = 0; k < sortedKeys.length; k++) {
          const key = sortedKeys[k];
          if (sentence.startsWith(key, idx)) {
            chunks.push({ text: key, furigana: dict[key] });
            idx += key.length;
            matched = true;
            break;
          }
        }
        if (!matched) {
          const char = sentence[idx];
          if (kanjiRegex.test(char)) {
            chunks.push({ text: char, furigana: SW_SINGLE_KANJI[char] || undefined });
          } else {
            chunks.push({ text: char });
          }
          idx++;
        }
      }

      let curExX = 30;
      const maxExX = width - 50;

      for (const chunk of chunks) {
        if (!chunk || !chunk.text) continue;
        if (curExX >= maxExX) break;

        if (chunk.furigana && kanjiRegex.test(chunk.text || '')) {
          ctx.font = 'bold 10px "Meiryo", "Yu Gothic", "Hiragino Sans", sans-serif';
          const fWidth = ctx.measureText(chunk.furigana || '').width;

          ctx.font = 'bold 15px "Meiryo", "Yu Gothic", "Hiragino Sans", sans-serif';
          const kWidth = ctx.measureText(chunk.text || '').width;
          const chunkW = Math.max(fWidth, kWidth);

          ctx.font = 'bold 10px "Meiryo", "Yu Gothic", "Hiragino Sans", sans-serif';
          ctx.fillStyle = '#fde047';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(chunk.furigana || '', curExX + (chunkW - fWidth) / 2, boxY + 25);

          ctx.font = 'bold 15px "Meiryo", "Yu Gothic", "Hiragino Sans", sans-serif';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(chunk.text || '', curExX + (chunkW - kWidth) / 2, boxY + 44);

          curExX += chunkW + 3;
        } else {
          ctx.font = 'bold 15px "Meiryo", "Yu Gothic", "Hiragino Sans", sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(chunk.text || '', curExX, boxY + 44);
          curExX += ctx.measureText(chunk.text || '').width;
        }
      }

      if (exVi) {
        ctx.font = 'italic 13px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#94a3b8';
        const maxViLen = 65;
        const viSnippet = exVi.length > maxViLen ? exVi.slice(0, maxViLen) + '...' : exVi;
        ctx.fillText(viSnippet, 30, boxY + 70);
      }

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('🔊', width - 42, boxY + 44);
    }

    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.warn('[SW] OffscreenCanvas render failed:', e);
    return undefined;
  }
}

// Trigger a single immediate vocabulary notification
async function triggerVocabNotification(customWord) {
  try {
    let word = customWord;
    if (!word) {
      const pool = cachedVocabList.length > 0 ? cachedVocabList : [
        { kanji: '勉強', reading: 'べんきょう', meaning: 'Học tập', level: 'N5', exampleJp: '毎日日本語を勉強しています。' }
      ];
      word = pool[Math.floor(Math.random() * pool.length)];
    }

    const hideText = cachedSettings && cachedSettings.hideNotificationText !== false;
    let title = 'NihonGo!';
    let body = '';

    if (!hideText) {
      const originInfo = getSwVocabOriginLabel(word);
      const hanVietStr = word.hanViet ? ` • Âm Hán: ${word.hanViet.toUpperCase()}` : '';
      const wordText = word.kanji && word.kanji !== word.reading
        ? `${word.kanji}【${word.reading}】${hanVietStr}`
        : word.reading;
      const exJp = word.exampleJp || word.exampleSentence || '';
      const exVi = word.exampleVi || word.exampleTranslation || '';
      const exText = exJp ? `\n📝 Ví dụ: ${exJp}${exVi ? ` (${exVi})` : ''}` : '';
      title = `🌸 [${originInfo.badgeLevel}] ${wordText}`;
      body = `📚 ${originInfo.fullTagline}\n💡 Nghĩa: ${word.meaning}${exText}`;
    }

    const requireInteraction = cachedSettings && cachedSettings.vocabRequireInteraction === true;
    const imageUrl = await generateSwNotificationImage(word);
    const notificationTag = `jpstudy-vocab-${Date.now()}`;

    await self.registration.showNotification(title, {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      image: imageUrl,
      tag: notificationTag,
      renotify: true,
      requireInteraction,
      vibrate: [200, 100, 200],
      data: {
        url: '/',
        timestamp: Date.now(),
        word
      }
    });

    // Auto-close Windows notification after 5 seconds unless pinned
    if (!requireInteraction) {
      // Hold Service Worker alive for exactly 5 seconds to reliably close notification on Windows
      await new Promise(resolve => setTimeout(resolve, 5000));
      try {
        let notifs = await self.registration.getNotifications({ tag: notificationTag });
        if (!notifs || notifs.length === 0) {
          const allNotifs = await self.registration.getNotifications();
          notifs = allNotifs.filter(n => !notificationTag || n.tag === notificationTag || (n.tag && n.tag.includes(notificationTag)));
        }
        notifs.forEach(n => {
          try {
            n.close();
          } catch (err) {}
        });
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    console.error('[SW] Failed to show vocab notification:', e);
  }
}

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      restoreStateFromCache(),
      self.clients.claim()
    ])
  );
});

// Fetch event with cache-first and background revalidation
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass SW for cross-origin requests, non-GET, Firebase Auth internal handlers, OAuth callbacks, and dev modules
  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/__/') ||
    url.pathname.includes('/__/auth') ||
    url.pathname.includes('/__/firebase') ||
    url.pathname.includes('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.search.includes('import') ||
    url.search.includes('v=') ||
    url.search.includes('t=') ||
    url.search.includes('apiKey') ||
    url.search.includes('auth') ||
    url.search.includes('oauth')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Periodic Background Sync (runs in background when app is closed on Android/PWA)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'jpstudy-vocab-sync' || event.tag === 'jpstudy-daily-sync') {
    event.waitUntil(
      (async () => {
        await restoreStateFromCache();
        if (cachedSettings && cachedSettings.vocabEnabled) {
          await triggerVocabNotification();
          await scheduleFutureNotifications();
        }
      })()
    );
  }
});

// Background Sync (runs when connection is re-established)
self.addEventListener('sync', (event) => {
  if (event.tag === 'jpstudy-sync-reminder') {
    event.waitUntil(
      (async () => {
        await restoreStateFromCache();
        if (cachedSettings && cachedSettings.vocabEnabled) {
          await scheduleFutureNotifications();
        }
      })()
    );
  }
});

// Push notification event (Web Push API)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '🌸 NihonGo! - Nhắc nhở học tập!', body: event.data ? event.data.text() : 'Đã đến giờ học tiếng Nhật hôm nay!' };
  }

  const title = data.title || '🌸 NihonGo! - Học Tiếng Nhật';
  const options = {
    body: data.body || 'Cùng mở NihonGo! ôn từ vựng và Kanji ngay nào!',
    icon: data.icon || '/icon.svg',
    badge: '/icon.svg',
    tag: data.tag || 'jlptgo-push-reminder',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event (handles user tapping on system notification bar)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Message event from web page (for syncing settings & trigger requests)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SYNC_SETTINGS') {
    if (event.data.settings) cachedSettings = event.data.settings;
    if (Array.isArray(event.data.vocabList) && event.data.vocabList.length > 0) {
      cachedVocabList = event.data.vocabList;
    }
    persistStateToCache().then(() => {
      scheduleFutureNotifications();
    });
  } else if (event.data.type === 'TRIGGER_NOTIFICATION') {
    if (event.waitUntil) {
      event.waitUntil(triggerVocabNotification(event.data.word));
    } else {
      triggerVocabNotification(event.data.word);
    }
  } else if (event.data.type === 'CLOSE_NOTIFICATION') {
    const targetTag = event.data.tag;
    const closePromise = self.registration.getNotifications().then((allNotifs) => {
      allNotifs.forEach((n) => {
        if (!targetTag || n.tag === targetTag || (n.tag && n.tag.includes(targetTag))) {
          try {
            n.close();
          } catch (err) {}
        }
      });
    }).catch(() => {});
    if (event.waitUntil) {
      event.waitUntil(closePromise);
    }
  } else if (event.data.type === 'SCHEDULE_REMINDERS') {
    scheduleFutureNotifications();
  }
});
