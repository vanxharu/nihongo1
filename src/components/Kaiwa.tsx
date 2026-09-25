/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import JapaneseFuriganaText from './JapaneseFuriganaText';
import { 
  User, 
  MessageCircle, 
  Mic, 
  Play, 
  Settings, 
  BookOpen, 
  ToggleRight, 
  ToggleLeft, 
  Loader2, 
  Send, 
  Volume2, 
  Eye, 
  EyeOff, 
  Sliders, 
  RefreshCw, 
  Smile, 
  Globe, 
  ChevronDown, 
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { speakJapanese } from '../utils/audio';
import ShibaMascot from './mascot/ShibaMascot';

interface Character {
  id: string;
  name: string;
  avatar: string;
  role: string;
  description: string;
}

interface Vocab {
  kanji: string;
  romaji: string;
  meaning: string;
}

interface Topic {
  id: string;
  title: string;
  emoji: string;
  category: string;
  context: string;
  vocabList: Vocab[];
  characters: Character[];
  initialMessages: Record<'N5' | 'N4' | 'N3', { text: string; romaji: string; vi: string; hints: string[] }>;
}

const TOPICS: Topic[] = [
  {
    id: 'restaurant',
    title: 'Gọi món ở quán ăn',
    emoji: '🍜',
    category: 'Nhà hàng & Ăn uống',
    context: '注文 (gọi món), お会計 (thanh toán), おすすめ (món đề xuất), 飲み物 (đồ uống)',
    vocabList: [
      { kanji: '何名様', romaji: 'nanmeisama', meaning: 'mấy vị (lịch sự)' },
      { kanji: '注文', romaji: 'chuumon', meaning: 'gọi món, đặt hàng' },
      { kanji: '飲み物', romaji: 'nomimono', meaning: 'đồ uống' },
      { kanji: 'おすすめ', romaji: 'osusume', meaning: 'gợi ý, đề xuất' },
      { kanji: '会計', romaji: 'kaikei', meaning: 'thanh toán hóa đơn' }
    ],
    characters: [
      { id: 'shiba', name: 'Nihon Shiba (Bạn đồng hành)', avatar: '🐕', role: 'Linh vật luyện nói', description: 'Ấm áp, kiên nhẫn sửa lỗi phát âm và động viên bạn nói tự nhiên' },
      { id: 'tenin', name: 'Tenin-san (Nhân viên)', avatar: '🧑‍🍳', role: 'Nhân viên phục vụ', description: 'Chu đáo, lịch sự, sử dụng kính ngữ Keigo cơ bản' },
      { id: 'tenchou', name: 'Tenchou (Chủ quán)', avatar: '👨‍🍳', role: 'Chủ cửa hàng', description: 'Thân thiện, xởi lởi, nói chuyện ấm áp và gần gũi' }
    ],
    initialMessages: {
      'N5': {
        text: 'いらっしゃいませ！何名様ですか？',
        romaji: 'Irasshaimase! Nanmei sama desu ka?',
        vi: 'Kính chào quý khách! Quý khách đi mấy người ạ?',
        hints: ['一人です (Một người ạ)', '二人です (Hai người ạ)', '三人です (Ba người ạ)']
      },
      'N4': {
        text: 'いらっしゃいませ！ご予約はされていますか？',
        romaji: 'Irasshaimase! Goyoyaku wa sarete imasu ka?',
        vi: 'Xin kính chào quý khách! Quý khách đã đặt bàn trước chưa ạ?',
        hints: ['予約していません (Tôi chưa đặt bàn trước)', 'はい、予約しました (Vâng, tôi đặt rồi)', '今すぐ入れますか (Bây giờ vào luôn được không?)']
      },
      'N3': {
        text: 'いらっしゃいませ。本日のおすすめメニューはこちらになりますが、ご注文はお決まりでしょうか？',
        romaji: 'Irasshaimase. Honjitsu no osusume menyuu wa kochira ni narimasu ga, gochuumon wa okimari deshou ka?',
        vi: 'Kính chào quý khách. Thực đơn gợi ý hôm nay của chúng tôi ở đây, quý khách đã quyết định gọi món chưa ạ?',
        hints: ['おすすめは何ですか (Món gợi ý là gì vậy?)', 'もう少し時間をください (Cho tôi thêm chút thời gian)', 'これを二つお願いします (Cho tôi hai cái này nhé)']
      }
    }
  },
  {
    id: 'station',
    title: 'Hỏi đường ở nhà ga',
    emoji: '🚉',
    category: 'Du lịch & Di chuyển',
    context: '切符 (vé tàu), 改札口 (cổng soát vé), 乗り換え (chuyển tàu), 行き方 (cách đi)',
    vocabList: [
      { kanji: '切符', romaji: 'kippu', meaning: 'vé tàu/xe' },
      { kanji: '改札口', romaji: 'kaisatsuguchi', meaning: 'cổng soát vé' },
      { kanji: '乗り換え', romaji: 'norikae', meaning: 'chuyển đổi tàu/xe' },
      { kanji: 'まっすぐ', romaji: 'massugu', meaning: 'đi thẳng' },
      { kanji: '窓口', romaji: 'madoguchi', meaning: 'quầy bán vé/thủ tục' }
    ],
    characters: [
      { id: 'ekiin', name: 'Ekiin-san (Nhân viên ga)', avatar: '👮', role: 'Nhân viên nhà ga', description: 'Nhiệt tình, chỉ dẫn vô cùng rõ ràng chi tiết' },
      { id: 'tsuukounin', name: 'Tsuukounin (Người đi đường)', avatar: '🚶', role: 'Người qua đường', description: 'Thân thiện, nói tiếng Nhật tự nhiên, ngắn gọn' }
    ],
    initialMessages: {
      'N5': {
        text: 'どうしましたか？何か手伝いましょうか？',
        romaji: 'Dou shimashita ka? Nanika tetsudaimashou ka?',
        vi: 'Có chuyện gì thế ạ? Tôi có thể giúp gì cho bạn không?',
        hints: ['駅はどこですか (Nhà ga ở đâu ạ?)', '切符は đâu ですか (Mua vé ở đâu?)', '新宿に行きたいです (Tôi muốn đi Shinjuku)']
      },
      'N4': {
        text: 'こんにちは、どちらまで行かれますか？お困りですか？',
        romaji: 'Konnichiwa, dochira made ikaremasu ka? Okomari desu ka?',
        vi: 'Xin chào, bạn muốn đi đến đâu ạ? Bạn đang gặp khó khăn gì sao?',
        hints: ['渋谷駅への行き方を教えてください (Chỉ giúp tôi đường đến ga Shibuya)', '乗り換えがわかりません (Tôi không biết cách chuyển tàu)', 'この電車は東京に行きますか (Tàu này có đi Tokyo không?)']
      },
      'N3': {
        text: 'お待たせいたしました。切符の購入や路線の乗り換えでお困りの点がございますでしょうか？',
        romaji: 'Omatase itashimashita. Kippu no kounyuu ya rosen no norikae de okomari no ten ga gozaimasu deshou ka?',
        vi: 'Xin lỗi vì để bạn đợi. Bạn có gặp khó khăn gì về việc mua vé hay chuyển tuyến tàu không ạ?',
        hints: ['一番早い行き方はどれですか (Cách đi nào nhanh nhất vậy?)', 'ICカードは使えますか (Có dùng được thẻ IC không?)', '快速に乗る必要がありますか (Có cần phải đi tàu nhanh không?)']
      }
    }
  },
  {
    id: 'conbini',
    title: 'Mua sắm ở Conbini',
    emoji: '🏪',
    category: 'Đời sống hàng ngày',
    context: '袋 (túi bóng), 温めますか (có hâm nóng không), お支払い (thanh toán), レシート (hóa đơn)',
    vocabList: [
      { kanji: '袋', romaji: 'fukuro', meaning: 'túi nilon, túi đựng' },
      { kanji: '温める', romaji: 'atatameru', meaning: 'hâm nóng (lò vi sóng)' },
      { kanji: 'お支払い', romaji: 'oshiharai', meaning: 'thanh toán tiền' },
      { kanji: 'お釣り', romaji: 'otsuri', meaning: 'tiền thừa trả lại' },
      { kanji: 'レシート', romaji: 'reshiito', meaning: 'hóa đơn, biên lai' }
    ],
    characters: [
      { id: 'cashier', name: 'Reji-san (Thu ngân)', avatar: '🧑‍💼', role: 'Nhân viên thu ngân', description: 'Nói nhanh, chuyên nghiệp, chuẩn phong cách tiện lợi conbini' },
      { id: 'tenchou_conbini', name: 'Tenchou (Quản lý cửa hàng)', avatar: '👨‍💼', role: 'Quản lý conbini', description: 'Hiếu khách, lịch sự và từ tốn hơn' }
    ],
    initialMessages: {
      'N5': {
        text: 'いらっしゃいませ！袋はいりますか？',
        romaji: 'Irasshaimase! Fukuro wa irimasu ka?',
        vi: 'Kính chào quý khách! Quý khách có cần túi không ạ?',
        hints: ['はい、お願いします (Vâng, cho tôi xin túi)', 'いいえ、いりません (Không, tôi không cần)', '一枚ください (Cho tôi một cái túi nhé)']
      },
      'N4': {
        text: 'いらっしゃいませ。お弁当は温めますか？',
        romaji: 'Irasshaimase. Obentou wa atatame masu ka?',
        vi: 'Kính chào quý khách. Hộp cơm bento này quý khách có cần hâm nóng không ạ?',
        hints: ['はい、温めてください (Vâng, hâm nóng giúp tôi)', 'そのままで大丈夫です (Cứ để thế là được rồi)', '500wでお願いします (Hâm ở mức 500w giúp tôi)']
      },
      'N3': {
        text: 'いらっしゃいませ。ポイントカードはお持ちでしょうか？袋は有料となりますがご利用ですか？',
        romaji: 'Irasshaimase. Pointokaado wa omochi deshou ka? Fukuro wa yuuryou to narimasu ga goriyou desuka?',
        vi: 'Kính chào quý khách. Quý khách có mang theo thẻ tích điểm không ạ? Túi đựng có tính phí, quý khách có muốn dùng không?',
        hints: ['ポイントカードは持っていません (Tôi không có thẻ tích điểm)', '有料の袋を一枚お願いします (Cho tôi xin một chiếc túi tính phí nhé)', '支払いは電子マネーでお願いします (Tôi xin thanh toán bằng ví điện tử)']
      }
    }
  },
  {
    id: 'interview',
    title: 'Phỏng vấn việc làm thêm',
    emoji: '💼',
    category: 'Công việc & Học tập',
    context: '志望動機 (lý do ứng tuyển), シフト (ca làm việc), アルバイト (việc làm thêm), 経験 (kinh nghiệm)',
    vocabList: [
      { kanji: '履歴書', romaji: 'rirekisho', meaning: 'sơ yếu lý lịch, CV' },
      { kanji: '志望動機', romaji: 'shibou douki', meaning: 'lý do xin việc, động cơ' },
      { kanji: 'シフト', romaji: 'shifuto', meaning: 'ca làm việc, lịch trực' },
      { kanji: '交通費', romaji: 'koutsuuhi', meaning: 'phí đi lại, tàu xe' },
      { kanji: '連絡', romaji: 'renraku', meaning: 'liên lạc, thông báo' }
    ],
    characters: [
      { id: 'manager', name: 'Tenchou (Quản lý cửa hàng)', avatar: '👨‍💼', role: 'Người phỏng vấn', description: 'Nghiêm túc nhưng rất cởi mở, có nhiều kinh nghiệm tuyển du học sinh' },
      { id: 'senpai', name: 'Senpai (Tiền bối)', avatar: '🙋', role: 'Trưởng ca/Tiền bối', description: 'Trẻ trung, nói giọng lịch sự nhưng dễ chịu' }
    ],
    initialMessages: {
      'N5': {
        text: 'はじめまして。お名前を教えてください。',
        romaji: 'Hajimemashite. Onamae wo oshiete kudasai.',
        vi: 'Rất vui được gặp bạn. Vui lòng cho biết tên của bạn.',
        hints: ['私の名前はナムです (Tên tôi là Nam)', 'ベトナムから来ました (Tôi đến từ Việt Nam)', 'どうぞよろしくお願いします (Rất mong nhận được sự giúp đỡ)']
      },
      'N4': {
        text: 'はじめまして。履歴書はお持ちですか？簡単に自己紹介をお願いします。',
        romaji: 'Hajimemashite. Rirekisho wa omochi desu ka? Kantan ni jikoshoukai wo onegai shimasu.',
        vi: 'Chào bạn. Bạn có mang theo sơ yếu lý lịch không? Hãy giới thiệu bản thân một cách ngắn gọn nhé.',
        hints: ['はい、こちらが履歴書です (Vâng, đây là sơ yếu lý lịch của tôi)', 'ベトナムから来ましたナムと申します (Tôi tên là Nam, đến từ Việt Nam)', '日本語学校で勉強しています (Tôi đang học ở trường tiếng Nhật)']
      },
      'N3': {
        text: '本日はお時間をいただきありがとうございます。まず、うちの店に応募した理由を教えていただけますか？',
        romaji: 'Honjitsu wa ojikan wo itadaki arigatou gozaimasu. Mazu, uchi no mise ni oubo shita riyuu wo oshiete itadakemasu ka?',
        vi: 'Cảm ơn bạn đã dành thời gian hôm nay. Trước hết, bạn có thể cho biết lý do tại sao ứng tuyển vào cửa hàng của chúng tôi không?',
        hints: ['接客の仕事に興味があるからです (Vì tôi quan tâm đến công việc phục vụ khách hàng)', '家から近くて働きやすいからです (Vì gần nhà và dễ di chuyển đi lại)', '日本語の練習をしたいからです (Vì tôi muốn nâng cao năng lực tiếng Nhật)']
      }
    }
  },
  {
    id: 'free',
    title: 'Trò chuyện tự do với bạn',
    emoji: '🌸',
    category: 'Giao tiếp hàng ngày',
    context: '趣味 (sở thích), 週末 (cuối tuần), 暇な時 (lúc rảnh rỗi), 好きな食べ物 (món ăn ưa thích)',
    vocabList: [
      { kanji: '趣味', romaji: 'shumi', meaning: 'sở thích, thú vui' },
      { kanji: '最近', romaji: 'saikin', meaning: 'gần đây, dạo này' },
      { kanji: '週末', romaji: 'shuumatsu', meaning: 'cuối tuần' },
      { kanji: '美味しい', romaji: 'oishii', meaning: 'ngon miệng' },
      { kanji: '楽しみにする', romaji: 'tanoshimi ni suru', meaning: 'mong đợi, trông ngóng' }
    ],
    characters: [
      { id: 'sakura', name: 'Sakura (Bạn học)', avatar: '👩', role: 'Cô bạn năng động', description: 'Nói chuyện tự nhiên thân mật bằng thể thông thường (casual Japanese)' },
      { id: 'ken', name: 'Ken (Bạn cùng phòng)', avatar: '👨', role: 'Anh bạn cool ngầu', description: 'Thích thể thao, game, nói chuyện siêu thoải mái, dùng nhiều từ lóng giới trẻ' }
    ],
    initialMessages: {
      'N5': {
        text: 'こんにちは！元気ですか？今日は何をしますか？',
        romaji: 'Konnichiwa! Genki desu ka? Kyou wa nani wo shimasu ka?',
        vi: 'Chào cậu! Cậu khỏe không? Hôm nay cậu định làm gì thế?',
        hints: ['元気です！ (Tớ khỏe lắm!)', '日本語を勉強します (Tớ học tiếng Nhật)', '買い物に行きます (Tớ đi mua sắm)']
      },
      'N4': {
        text: 'お疲れ！週末は何してた？どっか出かけた？',
        romaji: 'Otsukare! Shuumatsu nani shiteta? Dokka dekaketai?',
        vi: 'Chào cậu! Cuối tuần qua làm gì thế? Có đi đâu chơi không?',
        hints: ['家でゲームしてたよ (Tớ chơi game ở nhà thôi)', '友達と渋谷に遊びに行った (Tớ đi chơi Shibuya với bạn)', 'ずっと寝てた、疲れてたから (Tớ ngủ suốt vì mệt quá)']
      },
      'N3': {
        text: 'ヤッホー！最近どう？大学の授業とかバイトとか、結構忙しそうだね！',
        romaji: 'Yahhoo! Saikin dou? Daigaku no jugyou toka baito toka, kekkou isogashisou dane!',
        vi: 'Chào nhé! Dạo này thế nào? Thấy học hành với làm thêm có vẻ khá bận rộn nhỉ!',
        hints: ['そうなんだ、毎日ギリギリだよ (Đúng thế, ngày nào cũng vắt chân lên cổ)', 'バイトが楽しくて全然平気！ (Làm thêm vui lắm nên không sao hết!)', 'なんとかやってるよ、そっちは？ (Cũng tàm tạm, còn cậu thì sao?)']
      }
    }
  }
];

export default function Kaiwa() {
  const [activeTopic, setActiveTopic] = useState<Topic>(TOPICS[0]);
  const [activeDifficulty, setActiveDifficulty] = useState<'N5' | 'N4' | 'N3'>('N5');
  const [activeCharacter, setActiveCharacter] = useState<Character>(TOPICS[0].characters[0]);
  
  // Set up conversation states
  const [messages, setMessages] = useState<any[]>([
    { 
      id: 1, 
      sender: 'bot', 
      text: TOPICS[0]?.initialMessages?.['N5']?.text || '', 
      romaji: TOPICS[0]?.initialMessages?.['N5']?.romaji || '', 
      vi: TOPICS[0]?.initialMessages?.['N5']?.vi || '',
      character: TOPICS[0]?.characters?.[0]
    }
  ]);

  const [toggles, setToggles] = useState({
    furigana: true,
    hints: true,
    translation: false, // Default hidden for active testing as requested ("ẩn dịch" - toggle translation)
    correction: true
  });

  // Selective reveal states for individual translation strings when translation toggle is OFF
  const [revealedTranslations, setRevealedTranslations] = useState<Record<number, boolean>>({});

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hints, setHints] = useState<string[]>(TOPICS[0].initialMessages['N5'].hints);
  
  // Responsive sidebar drawer state for mobile config
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust active character when topic changes
  useEffect(() => {
    const defaultChar = activeTopic.characters.find(c => c.id === activeCharacter.id) || activeTopic.characters[0];
    setActiveCharacter(defaultChar);
    resetChat(activeTopic, activeDifficulty, defaultChar);
  }, [activeTopic]);

  const handleSpeak = (text: string, character?: Character) => {
    // If character is male or name indicates male, use Keita, otherwise use Nanami or user preferred voice
    let voice: any = undefined;
    const charName = character?.name || activeCharacter?.name || '';
    const charAvatar = character?.avatar || activeCharacter?.avatar || '';
    if (charAvatar.includes('👨') || /tenchou|sensei|yamada|tanaka|otoko|nam/i.test(charName)) {
      voice = 'ja-JP-KeitaNeural';
    } else if (charAvatar.includes('👩') || /on'na|nu|nữ|nanami/i.test(charName)) {
      voice = 'ja-JP-NanamiNeural';
    }
    
    speakJapanese(text, 1.0, undefined, { isSentence: true, voice });
  };

  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Explicitly request mic permission first
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      }
    } catch (permErr: any) {
      setSpeechError("Vui lòng cho phép quyền truy cập micro trên trình duyệt để luyện hội thoại.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói (Web Speech API). Hãy thử bằng Google Chrome hoặc Microsoft Edge.");
      return;
    }

    setSpeechError(null);
    setIsListening(true);

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'ja-JP'; // Set standard Japanese locale
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interimStr += event.results[i][0].transcript;
          }
        }
        const text = (finalStr + (interimStr ? ' ' + interimStr : '')).trim();
        if (text) {
          setInputText(text);
        }
      };

      rec.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error("Speech recognition error", event.error);
        }
        if (event.error === 'not-allowed') {
          setSpeechError("Vui lòng cho phép quyền truy cập micro để luyện hội thoại.");
          setIsListening(false);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error(err);
      setSpeechError(err.message);
      setIsListening(false);
    }
  };

  const resetChat = (topic: Topic, diff: 'N5' | 'N4' | 'N3', char: Character) => {
    const initialMsg = topic?.initialMessages?.[diff];
    setMessages([
      { 
        id: Date.now(), 
        sender: 'bot', 
        text: initialMsg?.text || '', 
        romaji: initialMsg?.romaji || '', 
        vi: initialMsg?.vi || '',
        character: char
      }
    ]);
    setHints(initialMsg?.hints || []);
    setRevealedTranslations({});
    setInputText('');
    setIsLoading(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userText = text.trim();
    const newUserMsg = { id: Date.now(), sender: 'user', text: userText };
    const tempBotMsgId = Date.now() + 1;

    // 1. GENERATE DEEP CONVERSATIONAL REPLY INSTANTLY!
    let instantText = '';
    let instantRomaji = '';
    let instantVi = '';
    
    const lowerText = userText.toLowerCase();
    if (lowerText.includes('こんにちは') || lowerText.includes('chào') || lowerText.includes('xin chào') || lowerText.includes('hello')) {
      instantText = 'こんにちは！お会いできて嬉しいです。調子はどうですか？';
      instantRomaji = 'Konnichiwa! O-ai dekite ureshii desu. Choushi wa dou desu ka?';
      instantVi = 'Xin chào! Rất vui được gặp bạn. Mọi thứ thế nào rồi?';
    } else if (lowerText.includes('ありがとう') || lowerText.includes('cảm ơn') || lowerText.includes('cám ơn') || lowerText.includes('thanks')) {
      instantText = 'どういたしまして！お役に立ててとても嬉しいです。';
      instantRomaji = 'Douitashimashite! O-yaku ni tatete totemo ureshii desu.';
      instantVi = 'Không có gì! Tôi rất vui vì được giúp ích cho bạn.';
    } else if (lowerText.includes('さようなら') || lowerText.includes('tạm biệt') || lowerText.includes('bye') || lowerText.includes('バイバイ')) {
      instantText = 'さようなら！また近いうちにお話ししましょうね。';
      instantRomaji = 'Sayounara! Mata chikai uchi ni o-hanashi shimashou ne.';
      instantVi = 'Tạm biệt! Hẹn sớm nói chuyện lại với bạn nhé.';
    } else {
      const genericReplies: Record<'N5' | 'N4' | 'N3', { jp: string; romaji: string; vi: string }> = {
        'N5': {
          jp: 'はい、分かりました！とても面白いですね。続けてください！',
          romaji: 'Hai, wakarimashita! Totemo omoshiroi desu ne. Tsuzukete kudasai!',
          vi: 'Vâng, tôi hiểu rồi! Thật thú vị. Xin hãy nói tiếp đi!'
        },
        'N4': {
          jp: 'なるほど、よく分かりました！それからどうしましたか？もっと話しましょう。',
          romaji: 'Naruhodo, yoku wakarimashita! Sore kara dou shimashita ka? Motto hanashimashou.',
          vi: 'Ra là vậy, tôi hiểu rồi! Sau đó thì sao thế? Cùng nói tiếp nào.'
        },
        'N3': {
          jp: 'おっしゃる通りですね！非常に興味深いお話です。もう少し詳しくお聞かせいただけますか？',
          romaji: 'Osharu toori desu ne! Hijou ni kyoumibukai o-hanashi desu. Mou sukoshi kuwashiku o-kikase itadakemasu ka?',
          vi: 'Đúng như bạn nói đấy! Câu chuyện thật sự rất thú vị. Bạn có thể kể chi tiết hơn một chút được không?'
        }
      };
      const reply = genericReplies[activeDifficulty];
      instantText = reply.jp;
      instantRomaji = reply.romaji;
      instantVi = reply.vi;
    }

    const instantBotMsg = {
      id: tempBotMsgId,
      sender: 'bot' as const,
      text: instantText,
      romaji: instantRomaji,
      vi: instantVi,
      character: activeCharacter
    };

    const newMessages = [...messages, newUserMsg, instantBotMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(false); // NO SKELETON / LOADING DELAY SHOWING!
    
    // Speak immediately!
    handleSpeak(instantText);

    // 2. Fetch the Gemini server silently in the background
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); 

      const response = await fetch('/api/kaiwa/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(0, -1).map(m => ({ sender: m.sender, text: m.text || '' })),
          situation: activeTopic.title,
          context: activeTopic.context,
          difficulty: activeDifficulty,
          character: activeCharacter,
          aiProvider: 'chatgpt'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        // Silently swap the instant message with the high-quality customized response!
        setMessages(prev => {
          return prev.map(m => {
            if (m.id === tempBotMsgId) {
              return {
                id: m.id,
                sender: 'bot' as const,
                text: data.japanese,
                romaji: data.romaji,
                vi: data.vietnamese,
                correction: data.correction,
                character: activeCharacter
              };
            }
            return m;
          });
        });
        
        if (data.hints && Array.isArray(data.hints)) {
          setHints(data.hints);
        } else {
          setHints([]);
        }
      }
    } catch (err) {
      console.error("Background Kaiwa API call failed, keeping instant reply:", err);
    }
  };

  const toggleRevealTranslation = (msgId: number) => {
    setRevealedTranslations(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 md:py-4 lg:py-6 flex flex-col md:flex-row gap-4 md:gap-6 md:h-[calc(100vh-150px)] xl:h-[calc(100vh-80px)] md:overflow-hidden text-slate-950 select-none">
      
      {/* Mobile Configuration Overlay / Bottom Drawer (< md) */}
      {isConfigDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs z-50 md:hidden flex items-end justify-center"
          onClick={() => setIsConfigDrawerOpen(false)}
        >
          <div 
            className="w-full max-h-[85vh] bg-white rounded-t-[2.5rem] p-6 overflow-y-auto shadow-2xl animate-slide-up flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-2">
              <h2 className="font-bold text-slate-950 text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-slate-600" />
                Thiết lập hội thoại
              </h2>
              <button 
                onClick={() => setIsConfigDrawerOpen(false)}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Trình độ / Độ khó</label>
              <div className="grid grid-cols-3 gap-2">
                {(['N5', 'N4', 'N3'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setActiveDifficulty(level);
                      resetChat(activeTopic, level, activeCharacter);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      activeDifficulty === level
                        ? 'bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/10'
                        : 'bg-slate-50/50 text-slate-800 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    {level === 'N5' ? 'N5 (Dễ)' : level === 'N4' ? 'N4 (Vừa)' : 'N3 (Khó)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chủ đề giao tiếp</label>
              <div className="grid grid-cols-1 gap-2 max-h-[25vh] overflow-y-auto pr-1">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setActiveTopic(topic);
                      setIsConfigDrawerOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      activeTopic.id === topic.id
                        ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-3xs'
                        : 'bg-slate-50/50 border-slate-100/60 text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{topic.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{topic.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{topic.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Character Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bạn hội thoại (Nhân vật)</label>
              <div className="grid grid-cols-2 gap-2">
                {activeTopic.characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => {
                      setActiveCharacter(char);
                      resetChat(activeTopic, activeDifficulty, char);
                    }}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                      activeCharacter.id === char.id
                        ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-3xs'
                        : 'bg-slate-50/50 border-slate-100/60 text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl shrink-0 bg-white w-8 h-8 rounded-full border border-slate-50 flex items-center justify-center shadow-3xs overflow-hidden">
                      {char.avatar === '🐕' ? <ShibaMascot pose="speaking" size={26} animated={false} /> : char.avatar}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold leading-tight truncate">{char.name}</p>
                      <p className="text-[9px] text-slate-400 leading-none truncate">{char.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mini Toggle switches */}
            <div className="space-y-2 border-t border-slate-50 pt-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tùy chọn hiển thị</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setToggles({...toggles, translation: !toggles.translation})}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    toggles.translation ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-50/50 border-slate-50 text-slate-500'
                  }`}
                >
                  <span>Hiện tất cả dịch</span>
                  {toggles.translation ? <ToggleRight className="w-5 h-5 text-slate-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                </button>
                <button
                  onClick={() => setToggles({...toggles, furigana: !toggles.furigana})}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    toggles.furigana ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-50/50 border-slate-50 text-slate-500'
                  }`}
                >
                  <span>Furigana</span>
                  {toggles.furigana ? <ToggleRight className="w-5 h-5 text-slate-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left/Main: Chat Interface Panel */}
      <div className="flex-1 flex flex-col min-h-[480px] lg:h-full bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100">
        
        {/* Chat Header */}
        <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-200/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl shadow-inner border border-slate-200 shrink-0 overflow-hidden">
              {activeCharacter.avatar === '🐕' ? (
                <ShibaMascot pose="speaking" size={32} animated={false} />
              ) : (
                activeCharacter.avatar
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-950 truncate">{activeCharacter.name}</h2>
                <span className="text-[9px] bg-slate-500/20 text-slate-300 border border-slate-500/30 px-1.5 py-0.5 rounded-full font-mono font-bold uppercase shrink-0">
                  {activeDifficulty}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{activeCharacter.role} · {activeTopic.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile config trigger (< md) */}
            <button
              onClick={() => setIsConfigDrawerOpen(true)}
              className="p-2 bg-slate-100 hover:bg-slate-600 text-slate-900 rounded-xl transition-all border border-slate-600 md:hidden cursor-pointer"
              title="Thiết lập nhanh"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Restart button */}
            <button 
              onClick={() => resetChat(activeTopic, activeDifficulty, activeCharacter)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-600 text-slate-950 text-xs font-bold rounded-xl transition-all border border-slate-600 cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trò chuyện lại</span>
            </button>
          </div>
        </div>

        {/* Global Challenge bar when translation is hidden */}
        {!toggles.translation && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">🙈</span>
              <p className="text-amber-400 text-xs font-medium truncate">
                Chế độ Thử thách đang bật. Bản dịch đã ẩn để bạn tự dịch! Click <Eye className="w-3.5 h-3.5 inline mx-0.5 text-slate-300" /> bên cạnh câu để xem nghĩa.
              </p>
            </div>
            <button 
              onClick={() => setToggles(prev => ({ ...prev, translation: true }))}
              className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-md hover:bg-amber-400 transition-colors shrink-0"
            >
              Hiện dịch
            </button>
          </div>
        )}

        {/* Messages Scroll View Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950/40">
          {messages.map(msg => {
            const isBot = msg.sender === 'bot';
            const showTrans = toggles.translation || revealedTranslations[msg.id];
            
            return (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${!isBot ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm shadow-inner border border-slate-200 mt-1 overflow-hidden ${
                  isBot ? (activeCharacter.avatar === '🐕' ? 'bg-amber-100' : 'bg-slate-600') : 'bg-emerald-600'
                }`}>
                  {isBot ? (
                    activeCharacter.avatar === '🐕' ? (
                      <ShibaMascot pose="speaking" size={26} animated={false} />
                    ) : (
                      activeCharacter.avatar
                    )
                  ) : '👤'}
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className={`p-4 rounded-2xl relative group ${
                    isBot 
                      ? 'bg-slate-50 text-slate-950 rounded-tl-sm border border-slate-200/60 shadow-md' 
                      : 'bg-slate-600 text-white rounded-tr-sm shadow-md'
                  }`}>
                    {/* Audio read button on Japanese text */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-base sm:text-lg font-bold tracking-wide font-display py-0.5">
                        <JapaneseFuriganaText sentence={msg.text || ''} showFurigana={toggles.furigana} forceDark={!isBot} size="base" />
                      </div>
                      
                      {/* Play TTS voice */}
                      <button 
                        onClick={() => handleSpeak(msg.text || '', msg.character)} 
                        className={`p-1 rounded-lg ${isBot ? 'bg-slate-100 text-slate-700 hover:text-black' : 'bg-slate-500 text-slate-100 hover:text-white'} transition-all cursor-pointer`} 
                        title="Phát giọng đọc Nhật chuẩn Azure Neural"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Show/Hide translation toggle per message if global translation is disabled */}
                    {isBot && !toggles.translation && msg.vi && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between">
                        <button
                          onClick={() => toggleRevealTranslation(msg.id)}
                          className="text-[10px] text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          {showTrans ? (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              <span>Ẩn dịch câu này</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-amber-400" />
                              <span>Xem bản dịch Việt</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Translated Vietnamese meaning */}
                  {showTrans && msg.vi && (
                    <p className="text-xs text-sky-400 font-bold px-2 animate-fade-in">
                      💡 {msg.vi}
                    </p>
                  )}

                  {/* Feedback suggestions / Grammar Corrections */}
                  {toggles.correction && msg.correction && msg.correction !== "null" && (
                    <div className="mt-1.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                      <span className="bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90 shrink-0">Sửa lỗi</span>
                      <span className="leading-relaxed">{msg.correction}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Snappy Typing Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 shrink-0 rounded-full bg-slate-600 flex items-center justify-center text-sm shadow-inner border border-slate-200 mt-1">
                {activeCharacter.avatar}
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 text-slate-950 rounded-tl-sm border border-slate-200/60 shadow-md flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Đối tác đang gõ câu trả lời...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Instant Hint Action panel */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80">
          
          {/* Answer suggestions ("Gợi ý trả lời") */}
          {toggles.hints && hints.length > 0 && (
            <div className="space-y-1.5 mb-3.5">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>Gợi ý phản xạ nhanh:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hints.map((hint, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSendMessage(hint)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold hover:bg-slate-600 hover:border-slate-600 hover:text-white transition-all cursor-pointer shadow-3xs"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Speech state message banner */}
          {speechError && (
            <div className="mb-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center justify-between animate-fade-in">
              <span>⚠️ {speechError}</span>
              <button onClick={() => setSpeechError(null)} className="text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-1.5 py-0.5 rounded cursor-pointer">Đóng</button>
            </div>
          )}

          {/* Core Input box */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputText);
                }}
                placeholder={isListening ? "🎙️ Đang nghe phát âm tiếng Nhật của bạn..." : "Nhập hoặc nói câu trả lời tiếng Nhật..."} 
                className={`w-full bg-white border ${isListening ? 'border-red-500 ring-1 ring-red-500/30' : 'border-slate-200/80'} text-slate-950 placeholder:text-slate-500 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm`}
              />
              <button 
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8.5 h-8.5 bg-slate-600 rounded-lg flex items-center justify-center text-white hover:bg-slate-500 disabled:bg-slate-100 disabled:text-slate-500 transition-colors shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Mic button */}
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                isListening 
                  ? 'bg-red-500/25 border-red-500 text-red-400 hover:bg-red-500/35 animate-pulse ' 
                  : 'bg-white border-slate-200 text-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-600'
              }`}
              title={isListening ? "Dừng ghi âm" : "Nói trực tiếp (Nhận diện giọng nói tiếng Nhật)"}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
            </button>
          </div>
        </div>

      </div>

      {/* Right Desktop/Tablet Config & Details Sidebar Panel */}
      <div className="hidden md:flex w-72 lg:w-80 flex-col gap-4 overflow-y-auto shrink-0 pr-1">
        
        {/* Step 1: Config Box (Difficulty, Topic, Character) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              Cài đặt trò chuyện
            </h3>
            <span className="text-[10px] bg-slate-50 text-slate-500 font-bold px-1.5 py-0.5 rounded-md">Live AI</span>
          </div>

          {/* Difficulty Option */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trình độ độ khó:</span>
            <div className="grid grid-cols-3 gap-1">
              {(['N5', 'N4', 'N3'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setActiveDifficulty(level);
                    resetChat(activeTopic, level, activeCharacter);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                    activeDifficulty === level
                      ? 'bg-slate-600 text-white border-slate-600 shadow-sm'
                      : 'bg-slate-50/50 text-slate-800 border-slate-100 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Select box */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn chủ đề giao tiếp:</span>
            <div className="relative">
              <select
                value={activeTopic.id}
                onChange={(e) => {
                  const selected = TOPICS.find(t => t.id === e.target.value);
                  if (selected) {
                    setActiveTopic(selected);
                  }
                }}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl py-2 pl-3 pr-8 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 cursor-pointer appearance-none"
              >
                {TOPICS.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.emoji} {topic.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Character Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn nhân vật đối thoại:</span>
            <div className="space-y-2">
              {activeTopic.characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    setActiveCharacter(char);
                    resetChat(activeTopic, activeDifficulty, char);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    activeCharacter.id === char.id
                      ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-3xs'
                      : 'bg-slate-50/50 border-slate-100/60 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-white border border-slate-50 flex items-center justify-center shadow-3xs text-lg shrink-0">{char.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold leading-tight truncate">{char.name}</p>
                    <p className="text-[9px] text-slate-400 leading-none truncate">{char.role} · {char.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Display Toggles */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-50 pb-2">Hỗ trợ học tập</h3>
          
          <ToggleRow label="Ẩn dịch nghĩa tự đoán" active={!toggles.translation} onClick={() => setToggles({...toggles, translation: !toggles.translation})} />
          <ToggleRow label="Hiển thị Furigana" active={toggles.furigana} onClick={() => setToggles({...toggles, furigana: !toggles.furigana})} />
          <ToggleRow label="Hiện gợi ý trả lời nhanh" active={toggles.hints} onClick={() => setToggles({...toggles, hints: !toggles.hints})} />
          <ToggleRow label="Sửa lỗi ngữ pháp/trợ từ" active={toggles.correction} onClick={() => setToggles({...toggles, correction: !toggles.correction})} />
        </div>

        {/* Vocabulary Helpers for chosen topic */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs flex-1 flex flex-col min-h-0 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-1.5 shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            Từ vựng trọng tâm bài này
          </h3>
          
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {activeTopic.vocabList.map((vocab, index) => (
              <div key={index} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950 font-display truncate">{vocab.kanji}</p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{vocab.romaji}</p>
                </div>
                <p className="text-xs font-medium text-slate-500 text-right max-w-[50%] truncate">{vocab.meaning}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function ToggleRow({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <div className="flex items-center justify-between cursor-pointer group" onClick={onClick}>
      <span className="text-xs font-bold text-slate-800 group-hover:text-slate-600 transition-colors">{label}</span>
      {active ? (
        <ToggleRight className="w-5 h-5 text-slate-500" />
      ) : (
        <ToggleLeft className="w-5 h-5 text-slate-300" />
      )}
    </div>
  );
}
