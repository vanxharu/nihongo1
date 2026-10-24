import PlaneSend from './ui/PlaneSend';
import './aiChat.css';
import AutoGrowInput from './ui/AutoGrowInput';
import SwipeReply from './ui/SwipeReply';
import './ui/swipeReply.css';
import './ui/chatFx.css';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  RotateCcw, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  User, 
  Globe, 
  BookOpen, 
  MessageSquare, 
  Flame, 
  Zap, 
  Languages, 
  Smile, 
  Lightbulb, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookMarked,
  Copy,
  Check,
  Radio,
  Sliders,
  X,
  MessageCircle,
  Clock,
  Volume1,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  PhoneCall,
  History,
  Plus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { speakJapanese, AzureVoiceChoice } from '../utils/audio';
import JapaneseLiveVoiceCall from './JapaneseLiveVoiceCall';
import ShibaMascot from './mascot/ShibaMascot';

import { sanitizeRubyHtml } from '../utils/sanitizeHtml';
export interface AiPersona {
  id: string;
  name: string;
  japaneseName: string;
  avatar: string;
  voice: AzureVoiceChoice;
  role: string;
  roleJapanese: string;
  description: string;
  speakingStyle: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  greeting: Record<'N5' | 'N4' | 'N3' | 'N2' | 'N1', {
    japanese: string;
    furigana: string;
    explanation: string;
    vietnamese: string;
    hints: string[];
  }>;
}

const JAPANESE_PERSONAS: AiPersona[] = [
  {
    id: 'nihon-shiba',
    name: 'Nihon Shiba (Linh vật)',
    japaneseName: 'にほんしば',
    avatar: '🐕',
    voice: 'ja-JP-NanamiNeural',
    role: 'Linh vật & Bạn đồng hành',
    roleJapanese: '公式マスコット & パートナー',
    description: 'Chú cún Shiba Inu mặc happi truyền thống, đeo băng đô 日本語. Luôn vui vẻ, ấm áp, kiên nhẫn giảng giải ngữ pháp và cổ vũ bạn mỗi ngày!',
    speakingStyle: '明るく元気いっぱい！親しみやすく励ましてくれる日本語',
    badgeColor: 'from-amber-500 to-rose-500',
    icon: Smile,
    greeting: {
      'N5': {
        japanese: 'ヤッホー！ぼくは「にほんしば」だよ！一緒に楽しく日本語を勉強しよう！今日はどんな言葉を覚えたい？',
        furigana: 'ヤッホー！ぼくは「にほんしば」だよ！いっしょに たのしく にほんごを べんきょうしよう！きょうは どんな ことばを おぼえたい？',
        explanation: 'Lời chào tràn đầy năng lượng của linh vật Nihon Shiba!',
        vietnamese: 'Yaho! Mình là Nihon Shiba đây! Hãy cùng học tiếng Nhật thật vui nhé! Hôm nay bạn muốn học từ vựng nào nè?',
        hints: ['こんにちは、しばちゃん！', 'ひらがなを練習したいです！', '自己紹介を教えてください！']
      },
      'N4': {
        japanese: 'こんにちは！毎日コツコツ勉強して偉いね！今日もぼくと一緒に日本語でたくさんおしゃべりしよう！',
        furigana: 'こんにちは！まいにち コツコツ べんきょうして えらいね！きょうも ぼくと いっしょに にほんごで たくさん おしゃべりしよう！',
        explanation: 'Shiba khen ngợi sự kiên trì và mời gọi hội thoại tự nhiên.',
        vietnamese: 'Xin chào! Bạn chăm chỉ học tập mỗi ngày giỏi quá! Hôm nay hãy cùng Shiba tán gẫu thật nhiều bằng tiếng Nhật nhé!',
        hints: ['今日の天気を教えて！', '日本の食べ物について話そう', '文法の使い方を質問したいです']
      },
      'N3': {
        japanese: 'お疲れ様！N3合格に向けて一歩一歩進んでいるね。何か分からない文法や表現があったらいつでも聞いてね！',
        furigana: 'おつかれさま！N3ごうかくに むけて いっぽ いっぽ すすんでいるね。なにか わからない ぶんぽうや ひょうげんが あったら いつでも きいてね！',
        explanation: 'Shiba khích lệ tinh thần thi cử JLPT N3 và sẵn sàng hỗ trợ giải thích.',
        vietnamese: 'Cố gắng lên nào! Chúng ta đang từng bước tiến tới đỗ N3 đó. Có ngữ pháp hay cách diễn đạt nào chưa hiểu cứ hỏi mình nha!',
        hints: ['「〜わけではない」の使い方を教えて', '日常会話のニュアンスを知りたいです', 'おすすめの勉強法はある？']
      },
      'N2': {
        japanese: 'すごい！N2レベルまで来たね。複雑な表現やビジネス表現も、ぼくと一緒にマスターしていこう！',
        furigana: 'すごい！N2レベルまで きたね。ふくざつな ひょうげんや ビジネスひょうげんも、ぼくと いっしょに マスターしていこう！',
        explanation: 'Lời cổ vũ cấp độ trung - cao cấp cùng Shiba.',
        vietnamese: 'Tuyệt vời! Bạn đã đạt tới trình độ N2 rồi. Các mẫu câu phức tạp và tiếng Nhật công sở, hãy cùng Shiba chinh phục nhé!',
        hints: ['敬語の正しい使い分けを教えて', '日本のビジネスメールの書き方は？', '意見を述べる表現を練習したい']
      },
      'N1': {
        japanese: '素晴らしい実力だね！最難関のN1、新聞や小説の深いニュアンスまでじっくり語り合おう！',
        furigana: 'すばらしい じつりょくだね！さいなんかんのN1、しんぶんや しょうせつの ふかい ニュアンスまで じっくり かたりあおう！',
        explanation: 'Đối thoại chuyên sâu cùng Nihon Shiba ở cấp độ cao nhất.',
        vietnamese: 'Thực lực của bạn thật đáng nể! N1 đỉnh cao, từ sắc thái báo chí đến chiều sâu văn hóa, hãy cùng mình trao đổi kỹ nhé!',
        hints: ['慣用句の微妙なニュアンスの違い', '時事問題についての議論をしよう', '高度な語彙の自然なコロケーション']
      }
    }
  },
  {
    id: 'tanaka-sensei',
    name: 'Thầy Tanaka',
    japaneseName: '田中先生',
    avatar: 'https://i.pravatar.cc/150?img=12',
    voice: 'ja-JP-KeitaNeural',
    role: 'Giáo viên tiếng Nhật',
    roleJapanese: '日本語ベテラン講師',
    description: 'Thầy giáo kiên nhẫn, nhiệt tình. Giảng giải ngữ pháp chuẩn mực, phong thái dịu dàng và luôn khuyến khích bạn nói.',
    speakingStyle: '丁寧語（です・ます）で分かりやすい日本語',
    badgeColor: 'from-blue-500 to-indigo-600',
    icon: GraduationCap,
    greeting: {
      'N5': {
        japanese: 'みなさん、こんにちは！田中です。今日から日本語でたくさん楽しく話しましょう！調子はどうですか？',
        furigana: 'みなさん、こんにちは！たなかです。きょうから にほんごで たくさん たのしく はなしましょう！ちょうしは どうですか？',
        explanation: '初対面の挨拶と調子を尋ねる親切な問いかけです。',
        vietnamese: 'Chào bạn! Thầy là Tanaka. Từ hôm nay chúng ta hãy cùng trò chuyện thật nhiều bằng tiếng Nhật nhé! Bạn cảm thấy thế nào?',
        hints: ['元気です！先生はどうですか？', '少し緊張していますが、頑張ります！', 'よろしくお願いします！']
      },
      'N4': {
        japanese: 'こんにちは！日本語の学習は順調ですか？今日はどんなことについて話したいですか？',
        furigana: 'こんにちは！にほんごの がくしゅうは じゅんちょうですか？きょうは どんなことについて はなしたいですか？',
        explanation: '学習の進捗と希望のトピックを尋ねる丁寧な表現です。',
        vietnamese: 'Chào bạn! Việc học tiếng Nhật của bạn có thuận lợi không? Hôm nay bạn muốn nói về chủ đề gì nào?',
        hints: ['最近勉強した文法について話したいです', '週末の予定について聞いてください', '日常会話の練習をお願いします']
      },
      'N3': {
        japanese: 'こんにちは！毎日お疲れ様です。日本語の上達に向けて、今日も楽しく会話を深めていきましょう！最近何か面白い出来事はありましたか？',
        furigana: 'こんにちは！まいにち おつかれさまです。にほんごの じょうたつに むけて、きょうも たのしく かいわを ふかめていきましょう！さいきん なにか おもしろい できごとは ありましたか？',
        explanation: 'ねぎらいの言葉と近況を尋ねる自然な表現です。',
        vietnamese: 'Chào bạn! Cảm ơn sự chăm chỉ mỗi ngày của bạn. Để nâng cao tiếng Nhật, hôm nay chúng ta cùng đào sâu đối thoại nhé! Gần đây có chuyện gì thú vị không?',
        hints: ['新しい趣味を始めました', '日本のニュースについて話したいです', '仕事での日本語の使い方を学びたいです']
      },
      'N2': {
        japanese: 'お世話になっております。田中です。自然な日本語のニュアンスや表現力をさらに高めていきましょう。本日関心のある話題は何でしょうか？',
        furigana: 'おせわになっております。たなかです。しぜんな にほんごの ニュアンスや ひょうげんりょくを さらに たかめていきましょう。ほんじつ かんしんのある わだいは なんのしょうか？',
        explanation: 'ビジネス感のある丁寧語で高いレベルの対話を促します。',
        vietnamese: 'Xin chào bạn. Thầy là Tanaka. Hãy cùng nâng cao sắc thái và năng lực biểu đạt tiếng Nhật tự nhiên nhé. Hôm nay chủ đề bạn quan tâm là gì?',
        hints: ['日本の社会問題について意見を交換したいです', '敬語の使い方を徹底的に練習したいです', '表現の幅を広げるコツを教えてください']
      },
      'N1': {
        japanese: 'ようこそ。日本語の深遠な表現や文化的な背景を踏まえた議論を交わしましょう。自由なトピックでお気軽に語りかけてください。',
        furigana: 'ようこそ。にほんごの しんえんな ひょうげんや ぶんかてきな はいけいを ふまえた ぎろんを かわしましょう。じゆうな トピックで おきがるに かたりかけてください。',
        explanation: '高度な語彙を用いた知的な挨拶表現です。',
        vietnamese: 'Chào mừng bạn. Chúng ta hãy trao đổi các chủ đề sâu sắc kết hợp bối cảnh văn hóa Nhật Bản. Xin hãy thoải mái chia sẻ mọi chủ đề bạn muốn.',
        hints: ['抽象的な概念を日本語で表現する練習がしたいです', '日本の伝統文化と現代社会の比較について話し合いましょう', '自然なコロケーションの選択について議論したいです']
      }
    }
  },
  {
    id: 'yuki-chan',
    name: 'Yuki-chan',
    japaneseName: 'ユキちゃん',
    avatar: 'https://i.pravatar.cc/150?img=47',
    voice: 'ja-JP-NanamiNeural',
    role: 'Bạn thân ở Tokyo',
    roleJapanese: '東京在住の同世代の友人',
    description: 'Cô bạn năng động sống tại Tokyo. Trò chuyện bằng tiếng Nhật đời thường (Casual / ため口) vô cùng gần gũi, chia sẻ về anime, du lịch & ẩm thực.',
    speakingStyle: 'タメ口（カジュアル表現）・親しみやすい話し方',
    badgeColor: 'from-pink-500 to-rose-600',
    icon: HeartHandshake,
    greeting: {
      'N5': {
        japanese: 'ヤッホー！ユキだよ！日本語でいっぱい話そうね！今何してるの？',
        furigana: 'ヤッホー！ユキだよ！にほんごで いっぱい はなそうね！いま なにしてるの？',
        explanation: '友達同士の親しい挨拶と質問です。',
        vietnamese: 'Yaho! Yuki nè! Mình cùng nói thật nhiều tiếng Nhật nha! Cậu đang làm gì đấy?',
        hints: ['日本語を勉強してるよ！', 'カフェでコーヒーを飲んでるよ', 'ユキちゃんは今何してるの？']
      },
      'N4': {
        japanese: '久しぶり〜！今日もお疲れ様！週末は何して過ごしてたの？',
        furigana: 'ひさしぶり〜！きょうも おつかれさま！しゅうまつは なにして すごしてたの？',
        explanation: '週末の過ごし方を聞くカジュアルな会話のきっかけです。',
        vietnamese: 'Lâu rồi không gặp nè! Hôm nay cậu vất vả rồi! Cuối tuần rồi cậu đã làm gì thế?',
        hints: ['友達と買い物をしていたよ', '家でアニメを見てたよ', '特に何もしてないよー！']
      },
      'N3': {
        japanese: 'やっほー！最近めっちゃ寒くなってきたね〜！なんか美味しいものでも食べに行きたい気分！最近ハマってる食べ物とかある？',
        furigana: 'やっほー！さいきん めっちゃ さむくなってきたね〜！なんか おいしいものでも たべに いきたい きぶん！さいきん ハマってる たべものとか ある？',
        explanation: '気候の話題から食べ物の流行りを聞く日常会話です。',
        vietnamese: 'Yaho! Dạo này trời bắt đầu lạnh rồi ha! Đang muốn đi ăn món gì ngon ghê! Dạo này cậu có đang mê món gì không?',
        hints: ['最近ラーメンにハマってるよ！', 'ベトナムのフォーがおすすめだよ', '寒くなると鍋が食べたくなるよね']
      },
      'N2': {
        japanese: 'お疲れ〜！最近仕事とか勉強忙しい？たまにはリフレッシュもしないとね！最近どっか旅行とか行った？',
        furigana: 'おつかれ〜！さいきん しごととか べんきょう いそがしい？たまには リフレッシュもしないとね！さいきん どっか りょこうとか いった？',
        explanation: '相手の体調や気分転換の旅行について尋ねる表現です。',
        vietnamese: 'Chào đằng ấy! Dạo này đi làm hay đi học có bận không? Thỉnh thoảng cũng phải xả hơi đó nha! Gần đây có đi du lịch đâu không?',
        hints: ['先週温泉に行って最高だったよ', '忙しくてどこにも行けてないや', '今度京都に行きたいと思ってるんだ']
      },
      'N1': {
        japanese: 'やっほー！急なんだけど、最近の若者の流行りとかトレンドについてどう思う？なんか色々変わってきて面白くない？',
        furigana: 'やっほー！きゅうなんだけど、さいきんの わかものの はやりとか トレンドについて どうおもう？なんか いろいろ かわってきて おもしろくない？',
        explanation: 'トレンドや社会現象に対する自分の考えを求めるトピックです。',
        vietnamese: 'Yaho! Tự dưng mình thắc mắc, cậu nghĩ sao về trào lưu và xu hướng giới trẻ dạo này? Nhiều thứ thay đổi thấy thú vị ghê?',
        hints: ['SNSの影響力がすごく大きくなってるよね', 'Z世代の価値観の変化に興味があるよ', '流行りのサイクルが昔より圧倒的に早くなったと思う']
      }
    }
  },
  {
    id: 'sato-buchou',
    name: 'Trưởng phòng Sato',
    japaneseName: '佐藤部長',
    avatar: 'https://i.pravatar.cc/150?img=13',
    voice: 'ja-JP-NaokiNeural',
    role: 'Trưởng phòng doanh nghiệp Nhật',
    roleJapanese: 'IT企業の厳格で優しい部長',
    description: 'Trưởng phòng công ty IT Nhật Bản. Luyện tập giao tiếp Kính ngữ Keigo, văn hóa công sở, báo cáo HORENSO và phong thái ứng xử chuẩn mực.',
    speakingStyle: 'ビジネス敬語・社会人の丁寧な表現',
    badgeColor: 'from-amber-500 to-emerald-600',
    icon: Briefcase,
    greeting: {
      'N5': {
        japanese: 'おはようございます。佐藤です。今日も一日、元気に仕事を頑張りましょう。よろしく。',
        furigana: 'おはようございます。さとうです。きょうも いちにち、げんきに しごとを がんばりましょう。よろしく。',
        explanation: '職場での朝の挨拶と励ましの言葉です。',
        vietnamese: 'Chào buổi sáng. Tôi là Sato. Hôm nay chúng ta cũng hãy tràn đầy năng lượng làm việc thật tốt nhé. Rất mong được hợp tác.',
        hints: ['おはようございます！よろしくお願いします！', '今日も一日頑張ります！', 'お疲れ様です！']
      },
      'N4': {
        japanese: 'お疲れ様です。佐藤です。本日の業務の進捗状況はどうですか？何か困っていることはありますか？',
        furigana: 'おつかれさまです。さとうです。ほんじつの ぎょうむの しんちょく じょうきょうは どうですか？なにか こまっていることは ありますか？',
        explanation: '仕事の進捗（しんちょく）を確認する標準的なビジネス会話です。',
        vietnamese: 'Chào bạn, vất vả rồi. Tôi là Sato. Tiến độ công việc hôm nay thế nào? Có điều gì gặp khó khăn không?',
        hints: ['順調に進んでいます！', '少し確認したい点があります', '予定通り本日中に終わります']
      },
      'N3': {
        japanese: 'お疲れ様です。最近は業務にも慣れてきたようで何よりです。何か提案や意見があれば、遠慮なく報告してください。',
        furigana: 'おつかれさまです。さいきんは ぎょうむにも なれてきたようで なによりです。なにか ていあんや いけんが あれば、えんりょなく ほうこくしてください。',
        explanation: '報告・連絡・相談（ホウレンソウ）を促すビジネス表現です。',
        vietnamese: 'Chào bạn. Dạo này thấy bạn đã quen dần với công việc, thật đáng mừng. Nếu có đề xuất hay ý kiến gì, đừng ngần ngại báo cáo nhé.',
        hints: ['ありがとうございます。業務の効率化についてご相談があります', '承知いたしました。後ほど報告書をお送りします', '今後ともご指導のほどよろしくお願いいたします']
      },
      'N2': {
        japanese: 'お疲れ様です。明日のミーティングの資料作成の件ですが、進捗はいかがでしょうか？事前に目を通しておきたいのですが。',
        furigana: 'おつかれさまです。あすの ミーティングの しりょうさくせいの けんですが、しんちょくは いかがでしょうか？じぜんに めを とおしておきたいのですが。',
        explanation: '資料の事前確認（目を通す）を依頼する実用的な敬語表現です。',
        vietnamese: 'Chào bạn. Về việc chuẩn bị tài liệu cho buổi họp ngày mai, tiến độ thế nào rồi? Tôi muốn xem qua trước một lượt.',
        hints: ['只今最終確認を行っておりますので、15時までにお送りいたします', '完成いたしましたので、メールにて送付いたしました。ご確認ください', '恐れ入りますが、一部修正が必要な箇所があり少々お時間をいただけますでしょうか']
      },
      'N1': {
        japanese: 'お疲れ様です。今期の事業戦略および新規プロジェクトの展開について、君の意見を聞かせてほしい。客観的な分析を踏まえて提示してもらえるかな。',
        furigana: 'おつかれさまです。こんきの じぎょう せんりゃく および しんき プロジェクトの てんかいについて、きみの いけんを きかせてほしい。きゃっかんてきな ぶんせきを ふまえて ていじしてもらえるかな。',
        explanation: '事業戦略に対するプロフェッショナルな考察を求める高度なコミュニケーションです。',
        vietnamese: 'Chào bạn. Về chiến lược kinh doanh quý này và việc triển khai dự án mới, tôi muốn nghe ý kiến của bạn. Bạn có thể trình bày dựa trên phân tích khách quan chứ?',
        hints: ['競合他社の動向を踏まえた上で、3つの提言を準備しております', '市場のニーズの変化に対応すべく、新規ターゲット層の開拓をご提案いたします', 'リスクヘッジの観点から、段階的な投資プロセスの構築を推奨いたします']
      }
    }
  }
];

const SUGGESTED_TOPICS = [
  {
    topicJp: '好きな日本の食べ物や料理について',
    topicVi: 'Món ăn & ẩm thực Nhật yêu thích (Ramen, Sushi, Matcha...)',
    emoji: '🍜'
  },
  {
    topicJp: '週末の過ごし方や趣味について',
    topicVi: 'Cách trải qua ngày cuối tuần & sở thích cá nhân',
    emoji: '🎮'
  },
  {
    topicJp: '日本への旅行や観光で行きたい場所',
    topicVi: 'Địa điểm muốn đến tham quan tại Nhật Bản (Tokyo, Kyoto...)',
    emoji: '⛩️'
  },
  {
    topicJp: '日本語を勉強し始めたきっかけ',
    topicVi: 'Cơ duyên & lý do bắt đầu học tiếng Nhật',
    emoji: '📚'
  },
  {
    topicJp: '最近見たおすすめのアニメや映画',
    topicVi: 'Bộ anime hoặc phim điện ảnh tâm đắc gần đây',
    emoji: '🎬'
  },
  {
    topicJp: '日本のビジネスマナーや仕事文化',
    topicVi: 'Văn hóa công sở & phong thái làm việc của người Nhật',
    emoji: '💼'
  }
];

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  furigana?: string;
  furiganaHtml?: string;
  romaji?: string;
  explanation?: string;
  correctionAdvice?: string;
  vietnameseTranslation?: string;
  provider?: string;
  quote?: string;
  stopped?: boolean;
  timestamp: string;
}

function SwipeReplyIf({ enabled, onReply, children }: { enabled: boolean; onReply: () => void; children: React.ReactNode }) {
  return enabled ? <SwipeReply onReply={onReply}>{children}</SwipeReply> : <>{children}</>;
}

const CHAT_STORAGE_KEY = 'nhai_japanese_ai_chat_session_v2';
const CHAT_HISTORY_KEY = 'nhai_japanese_ai_chat_history_v3';
type ChatLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

interface SavedChatThread {
  id: string;
  personaId: string;
  level: ChatLevel;
  messages: ChatMessage[];
  hints: string[];
  draft: string;
  updatedAt: number;
}
const LEGACY_FAKE_AI_REPLIES = new Set([
  'はい、よく分かりました！とても興味深いお話ですね。もっと詳しく聞かせていただけますか？',
  'はい、よくわかりました！とても良い話題ですね。他にも何か話したいことはありますか？',
  '素晴らしいですね！そのお話、とても興味深いです。もっと詳しく聞かせていただけますか？'
]);
const createChatId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const normalizeChatMessages = (raw: unknown): ChatMessage[] =>
  Array.isArray(raw)
    ? raw.filter((message): message is ChatMessage =>
        !!message && (message.sender === 'user' || message.sender === 'ai') &&
        typeof message.text === 'string' &&
        !(message.sender === 'ai' && LEGACY_FAKE_AI_REPLIES.has(message.text)))
    : [];
const isChatLevel = (value: unknown): value is ChatLevel =>
  value === 'N5' || value === 'N4' || value === 'N3' || value === 'N2' || value === 'N1';

// V3 archives separate conversations; import V2 once without discarding older chat.
const getSavedChatState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const archiveRaw = localStorage.getItem(CHAT_HISTORY_KEY);
    const legacyRaw = !archiveRaw
      ? localStorage.getItem(CHAT_STORAGE_KEY) || localStorage.getItem('nhai_japanese_ai_chat_session_v1')
      : null;
    const parsed = JSON.parse(archiveRaw || legacyRaw || 'null');
    if (!parsed || typeof parsed !== 'object') return null;

    const legacyLevel: ChatLevel = isChatLevel(parsed.selectedLevel) ? parsed.selectedLevel : 'N4';
    const legacyPersonaId = JAPANESE_PERSONAS.some(p => p.id === parsed.selectedPersonaId)
      ? parsed.selectedPersonaId : JAPANESE_PERSONAS[0].id;
    let conversations: SavedChatThread[] = [];
    if (archiveRaw && Array.isArray(parsed.conversations)) {
      conversations = parsed.conversations
        .filter((item: any) => item && typeof item.id === 'string' &&
          JAPANESE_PERSONAS.some(p => p.id === item.personaId))
        .map((item: any) => ({
          id: item.id,
          personaId: item.personaId,
          level: isChatLevel(item.level) ? item.level : 'N4',
          messages: normalizeChatMessages(item.messages),
          hints: Array.isArray(item.hints) ? item.hints.filter((h: unknown) => typeof h === 'string') : [],
          draft: typeof item.draft === 'string' ? item.draft : '',
          updatedAt: Number.isFinite(item.updatedAt) ? item.updatedAt : Date.now()
        }));
    } else if (!archiveRaw) {
      const legacyMessages = normalizeChatMessages(parsed.messages);
      if (legacyMessages.some(message => message.sender === 'user' ||
          (message.sender === 'ai' && message.provider !== 'Lời chào mẫu')) ||
          (typeof parsed.draft === 'string' && parsed.draft.trim())) {
        conversations = [{
          id: createChatId(), personaId: legacyPersonaId, level: legacyLevel,
          messages: legacyMessages,
          hints: Array.isArray(parsed.hints) ? parsed.hints : [],
          draft: typeof parsed.draft === 'string' ? parsed.draft : '',
          updatedAt: Date.now()
        }];
      }
    }

    // Respect a newly opened empty conversation instead of reviving an older one.
    const current = conversations.find(thread => thread.id === parsed.activeConversationId) ||
      (parsed.activeConversationId ? undefined : conversations[0]);
    const persona = JAPANESE_PERSONAS.find(p => p.id === (current?.personaId || legacyPersonaId)) || JAPANESE_PERSONAS[0];
    const level = current?.level || legacyLevel;
    return {
      persona, level, conversations,
      activeConversationId: current?.id ||
        (typeof parsed.activeConversationId === 'string' ? parsed.activeConversationId : createChatId()),
      messages: current?.messages || (!archiveRaw ? normalizeChatMessages(parsed.messages) : []),
      hints: current?.hints?.length ? current.hints :
        (Array.isArray(parsed.hints) ? parsed.hints : persona.greeting[level].hints),
      draft: current?.draft || '',
      showFurigana: parsed.showFurigana ?? true,
      showVietnamese: parsed.showVietnamese ?? false,
      autoSpeech: parsed.autoSpeech ?? true,
      speechRate: parsed.speechRate ?? 1.0,
      responseLength: (['natural', 'detailed', 'concise'] as const).includes(parsed.responseLength)
        ? parsed.responseLength as 'natural' | 'detailed' | 'concise' : 'natural'
    };
  } catch (error) {
    console.warn('[Japanese Chat] Could not read chat history:', error);
    return null;
  }
};

export interface JapaneseAiChatProps {
  onBack?: () => void;
}

export default function JapaneseAiChat({ onBack }: JapaneseAiChatProps = {}) {
  const savedSession = useRef(getSavedChatState());
  const [conversations, setConversations] = useState<SavedChatThread[]>(savedSession.current?.conversations || []);
  const conversationsRef = useRef<SavedChatThread[]>(savedSession.current?.conversations || []);
  const [activeConversationId, setActiveConversationId] = useState(savedSession.current?.activeConversationId || createChatId());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySaveError, setHistorySaveError] = useState(false);

  const [selectedLevel, setSelectedLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>(
    savedSession.current?.level || 'N4'
  );
  const [selectedPersona, setSelectedPersona] = useState<AiPersona>(
    savedSession.current?.persona || JAPANESE_PERSONAS[0]
  );
  
  // Toggles & Response Settings
  const [showFurigana, setShowFurigana] = useState<boolean>(savedSession.current?.showFurigana ?? true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(savedSession.current?.showVietnamese ?? false);
  const [autoSpeech, setAutoSpeech] = useState<boolean>(savedSession.current?.autoSpeech ?? true);
  const [speechRate, setSpeechRate] = useState<number>(savedSession.current?.speechRate ?? 1.0);
  const [responseLength, setResponseLength] = useState<'natural' | 'detailed' | 'concise'>(
    savedSession.current?.responseLength || 'natural'
  );

  // UI state
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isPersonaDrawerOpen, setIsPersonaDrawerOpen] = useState<boolean>(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState<boolean>(false);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});
  const [expandedTranslations, setExpandedTranslations] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<number | null>(null);

  // Sync real-time spoken messages from Live Voice Call into the main chat history
  const handleLiveMessageLogged = (msg: {
    sender: 'user' | 'ai';
    text: string;
    furigana?: string;
    furiganaHtml?: string;
    romaji?: string;
    explanation?: string;
    correctionAdvice?: string;
    vietnameseTranslation?: string;
  }) => {
    const newMsg: ChatMessage = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      sender: msg.sender,
      text: msg.text,
      furigana: msg.furigana,
      furiganaHtml: msg.furiganaHtml,
      romaji: msg.romaji,
      explanation: msg.explanation,
      correctionAdvice: msg.correctionAdvice,
      vietnameseTranslation: msg.vietnameseTranslation,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // Initial greeting
  const initialGreeting = selectedPersona.greeting[selectedLevel];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (savedSession.current?.messages && savedSession.current.messages.length > 0) {
      return savedSession.current.messages;
    }
    return [
      {
        id: Date.now(),
        sender: 'ai',
        text: initialGreeting.japanese,
        furigana: initialGreeting.furigana,
        explanation: initialGreeting.explanation,
        vietnameseTranslation: initialGreeting.vietnamese,
        provider: 'Lời chào mẫu',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [hints, setHints] = useState<string[]>(
    savedSession.current?.hints || initialGreeting.hints
  );
  const [inputText, setInputText] = useState<string>(savedSession.current?.draft || '');
  const [replyTo, setReplyTo] = useState<{ text: string; who: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  // 086: câu trả lời hiện dần từng chữ (id tin đang chạy + số ký tự đã hiện)
  const [streaming, setStreaming] = useState<{ id: number; n: number } | null>(null);
  const streamRef = useRef<{ id: number; n: number } | null>(null);
  streamRef.current = streaming;
  const aiTextRef = useRef<Record<number, string>>({});

  // Mic state & Dynamic Audio-Frequency Visualizer (Waves)
  const [isListening, setIsListening] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0); // 0 - 100
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>([15, 25, 45, 70, 85, 60, 40, 25, 15, 30, 50, 20]); // Frequency bands
  
  // Mobile virtual keyboard & focus optimization
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);
  const [chatViewport, setChatViewport] = useState(() => ({ height: window.visualViewport?.height || window.innerHeight, top: window.visualViewport?.offsetTop || 0 }));
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  
  const recognitionRef = useRef<any>(null);
  const micPress = useRef<{ t: number; was: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!streaming) return;
    const total = Array.from(aiTextRef.current[streaming.id] || '').length;
    if (streaming.n >= total) { const t = setTimeout(() => setStreaming(null), 400); return () => clearTimeout(t); }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setStreaming(c => (c && c.id === streaming.id ? { id: c.id, n: reduce ? total : c.n + 1 + Math.round(Math.random()) } : c)), reduce ? 0 : 45 + Math.random() * 60);
    return () => clearTimeout(t);
  }, [streaming]);
  const stopStream = () => {
    const cur = streamRef.current;
    if (!cur) return;
    const cut = Array.from(aiTextRef.current[cur.id] || '').slice(0, cur.n).join('');
    setMessages(prev => prev.map(m => m.id === cur.id ? { ...m, text: cut, furigana: undefined, furiganaHtml: undefined, romaji: undefined, vietnameseTranslation: undefined, explanation: undefined, correctionAdvice: undefined, stopped: true } : m));
    setStreaming(null);
  };

  // Clean up Web Audio API resources
  const stopAudioVisualizer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setAudioFrequencies([12, 18, 25, 35, 28, 20, 15, 12, 18, 24, 16, 10]);
  }, []);

  // Initialize and run real-time audio frequency visualizer analyser loop
  const startAudioVisualizer = useCallback(async (): Promise<boolean> => {
    stopAudioVisualizer();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; // Yields 32 frequency bins
        analyser.smoothingTimeConstant = 0.75; // Smooth frequency wave transitions
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateWaveData = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate overall average volume
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalizedLevel = Math.min(100, Math.round((avg / 128) * 100));
          setAudioLevel(normalizedLevel);

          // Sample 12 distinct frequency bands across spectrum (sub-bass to high treble)
          const sampleCount = 12;
          const step = Math.max(1, Math.floor(dataArray.length / sampleCount));
          const waveBands: number[] = [];
          for (let i = 0; i < sampleCount; i++) {
            const rawVal = dataArray[i * step] || 0;
            // Height between 10% and 100%
            const bandHeight = Math.max(12, Math.min(100, Math.round((rawVal / 255) * 100)));
            waveBands.push(bandHeight);
          }
          setAudioFrequencies(waveBands);

          animFrameRef.current = requestAnimationFrame(updateWaveData);
        };

        updateWaveData();
      }
      return true;
    } catch (err) {
      console.warn('Microphone visualizer initialization error:', err);
      return false;
    }
  }, [stopAudioVisualizer]);

  // Clean up visualizer on unmount
  useEffect(() => {
    return () => {
      stopAudioVisualizer();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [stopAudioVisualizer]);

  // Automatically preserve every real conversation, including unsent drafts.
  const saveArchive = useCallback((
    nextConversations: SavedChatThread[],
    activeId = activeConversationId,
    personaId = selectedPersona.id,
    level: ChatLevel = selectedLevel
  ) => {
    conversationsRef.current = nextConversations;
    setConversations(nextConversations);
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify({
        version: 3, conversations: nextConversations,
        activeConversationId: activeId,
        selectedPersonaId: personaId,
        selectedLevel: level,
        showFurigana, showVietnamese, autoSpeech, speechRate, responseLength
      }));
      setHistorySaveError(false);
    } catch (error) {
      // Do not silently delete chat history on quota failures.
      setHistorySaveError(true);
      console.warn('[Japanese Chat] Chat history could not be saved:', error);
    }
  }, [activeConversationId, selectedPersona.id, selectedLevel,
      showFurigana, showVietnamese, autoSpeech, speechRate, responseLength]);

  const persistActiveConversation = useCallback(() => {
    const shouldArchive = messages.some(message => message.sender === 'user' ||
      (message.sender === 'ai' && message.provider !== 'Lời chào mẫu')) || !!inputText.trim();
    const previous = conversationsRef.current;
    const next: SavedChatThread[] = shouldArchive ? [
      { id: activeConversationId, personaId: selectedPersona.id, level: selectedLevel,
        messages, hints, draft: inputText, updatedAt: Date.now() },
      ...previous.filter(thread => thread.id !== activeConversationId)
    ] : previous;
    saveArchive(next);
  }, [activeConversationId, selectedPersona.id, selectedLevel, messages, hints, inputText, saveArchive]);

  useEffect(() => { persistActiveConversation(); }, [persistActiveConversation]);

  const cancelChatRequest = () => {
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    setIsLoading(false);
    setStreaming(null);
  };
  const restoreConversation = (thread: SavedChatThread) => {
    persistActiveConversation();
    cancelChatRequest();
    const persona = JAPANESE_PERSONAS.find(p => p.id === thread.personaId) || JAPANESE_PERSONAS[0];
    setActiveConversationId(thread.id);
    setSelectedPersona(persona);
    setSelectedLevel(thread.level);
    setMessages(thread.messages);
    setHints(thread.hints.length ? thread.hints : persona.greeting[thread.level].hints);
    setInputText(thread.draft);
    setReplyTo(null);
    setChatError(null);
    setIsHistoryOpen(false);
  };
  const deleteConversation = (id: string) => {
    if (!window.confirm('Xóa vĩnh viễn cuộc trò chuyện đã lưu này trên thiết bị?')) return;
    const remaining = conversationsRef.current.filter(thread => thread.id !== id);
    if (id === activeConversationId) {
      cancelChatRequest();
      const nextId = createChatId();
      saveArchive(remaining, nextId);
      setActiveConversationId(nextId);
      const greeting = selectedPersona.greeting[selectedLevel];
      setMessages([{
        id: Date.now(), sender: 'ai', text: greeting.japanese,
        furigana: greeting.furigana, explanation: greeting.explanation,
        vietnameseTranslation: greeting.vietnamese, provider: 'Lời chào mẫu',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setHints(greeting.hints);
      setInputText('');
      setChatError(null);
    } else saveArchive(remaining);
  };

  // Convert initial greeting to Furigana Ruby on mount / change if missing
  useEffect(() => {
    const convertGreeting = async () => {
      try {
        const greetingText = initialGreeting.japanese;
        if (messages.length > 0 && messages[0]?.text === greetingText && !messages[0]?.furiganaHtml) {
          const res = await fetch('/api/furigana', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: greetingText })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.furiganaHtml) {
              setMessages(prev => {
                if (prev.length > 0 && prev[0]?.text === greetingText && !prev[0]?.furiganaHtml) {
                  const updated = [...prev];
                  updated[0] = { ...updated[0], furiganaHtml: data.furiganaHtml };
                  return updated;
                }
                return prev;
              });
            }
          }
        }
      } catch (e) {
        console.warn('Greeting furigana conversion error:', e);
      }
    };
    convertGreeting();
  }, [selectedPersona.id, selectedLevel]);

  const scrollToBottom = useCallback((instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: instant ? 'auto' : 'smooth', 
        block: 'end' 
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Handle virtual keyboard show/hide on mobile devices
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleViewportChange = () => {
      setChatViewport({ height: window.visualViewport?.height || window.innerHeight, top: window.visualViewport?.offsetTop || 0 });
      if (!window.visualViewport) return;
      // On mobile devices, opening the keyboard significantly reduces visualViewport.height
      const isKeyboard = window.visualViewport.height < window.innerHeight * 0.78;
      setIsKeyboardOpen(isKeyboard);
      if (isKeyboard) {
        // Multi-stage scroll to ensure bottom alignment as OS keyboard animates upward
        setTimeout(() => scrollToBottom(false), 120);
        setTimeout(() => scrollToBottom(true), 320);
      }
    };

    handleViewportChange();
    window.addEventListener('resize', handleViewportChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, [scrollToBottom]);

  // Switch persona or level
  const handlePersonaOrLevelChange = (persona: AiPersona, level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1') => {
    if (persona.id === selectedPersona.id && level === selectedLevel) return;
    persistActiveConversation();
    cancelChatRequest();
    const previous = conversationsRef.current.find(thread => thread.personaId === persona.id && thread.level === level);
    if (previous) {
      restoreConversation(previous);
      return;
    }
    setActiveConversationId(createChatId());
    setSelectedPersona(persona);
    setSelectedLevel(level);
    setChatError(null);
    setReplyTo(null);
    const greeting = persona.greeting[level];
    const newGreetingMsg: ChatMessage = {
      id: Date.now(),
      sender: 'ai',
      text: greeting.japanese,
      furigana: greeting.furigana,
      explanation: greeting.explanation,
      vietnameseTranslation: greeting.vietnamese,
      provider: 'Lời chào mẫu',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([newGreetingMsg]);
    setHints(greeting.hints);
    setInputText('');

    if (autoSpeech) {
      handlePlayAudio(greeting.japanese, newGreetingMsg.id, persona.voice);
    }
  };

  // Start a fresh conversation while retaining archived chats.
  const handleResetChat = () => {
    persistActiveConversation();
    cancelChatRequest();
    setActiveConversationId(createChatId());
    setChatError(null);
    setReplyTo(null);
    const greeting = selectedPersona.greeting[selectedLevel];
    const newGreetingMsg: ChatMessage = {
      id: Date.now(),
      sender: 'ai',
      text: greeting.japanese,
      furigana: greeting.furigana,
      explanation: greeting.explanation,
      vietnameseTranslation: greeting.vietnamese,
      provider: 'Lời chào mẫu',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([newGreetingMsg]);
    setHints(greeting.hints);
    setInputText('');

    if (autoSpeech) {
      handlePlayAudio(greeting.japanese, newGreetingMsg.id, selectedPersona.voice);
    }
  };

  // Play audio with state indicator
  const handlePlayAudio = (text: string, msgId: number, voiceChoice?: AzureVoiceChoice) => {
    if (currentlySpeakingId === msgId) {
      // cancel
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setCurrentlySpeakingId(null);
      return;
    }

    setCurrentlySpeakingId(msgId);
    speakJapanese(
      text, 
      speechRate, 
      () => {
        setCurrentlySpeakingId(prev => prev === msgId ? null : prev);
      },
      { voice: voiceChoice || selectedPersona.voice }
    );
  };

  // Copy text helper
  const handleCopyText = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Japanese Speech Recognition (ja-JP) with explicit permission & dynamic audio visualizer
  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
      stopAudioVisualizer();
      setIsListening(false);
      return;
    }

    // Start real-time audio visualizer with audio stream
    const micGranted = await startAudioVisualizer();
    if (!micGranted) {
      alert('Không thể truy cập Microphone. Vui lòng cho phép (Allow) quyền Microphone trên trình duyệt để sử dụng tính năng nói tiếng Nhật!');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ Web Speech API trực tiếp. Bạn có thể sử dụng tính năng "Gọi Thoại Live" ở trên để trò chuyện giọng nói qua AI!');
      stopAudioVisualizer();
      return;
    }

    setIsListening(true);
    try {
      const rec = new SpeechRecognition();
      rec.lang = 'ja-JP';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

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

      rec.onerror = (err: any) => {
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('Speech recognition error:', err);
        }
        if (err.error === 'not-allowed') {
          stopAudioVisualizer();
          setIsListening(false);
        }
      };
      rec.onend = () => {
        // Recognition completed or stopped
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn('Speech start error:', err);
      stopAudioVisualizer();
      setIsListening(false);
    }
  };

  // Send message
  // One in-flight chat request at a time; it is aborted when the chat unmounts.
  const chatAbortRef = useRef<AbortController | null>(null);
  useEffect(() => () => chatAbortRef.current?.abort(), []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading || chatAbortRef.current) return; // ref check: state can lag behind a fast double tap

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      quote: replyTo?.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setChatError(null);
    setMessages(newHistory);
    setInputText('');
    setReplyTo(null);
    setIsLoading(true);
    const controller = new AbortController();
    chatAbortRef.current = controller;

    try {
      const res = await fetch('/api/japanese-chat', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ sender: m.sender, text: m.quote ? `（「${m.quote}」への返信）${m.text || ''}` : (m.text || '') })),
          persona: {
            name: selectedPersona.japaneseName,
            role: selectedPersona.roleJapanese,
            description: selectedPersona.description,
            speakingStyle: selectedPersona.speakingStyle
          },
          level: selectedLevel,
          responseLength
        })
      });

      if (!res.ok) {
        const failure = await res.json().catch(() => null);
        const message = typeof failure?.error === 'string'
          ? failure.error
          : res.status === 429
          ? 'AI đang bị giới hạn lượt gọi. Bạn hãy gửi lại sau.'
          : 'Không thể kết nối với dịch vụ AI. Vui lòng thử gửi lại.';
        throw new Error(message);
      }

      const data = await res.json();
      if (typeof data?.japaneseResponse !== 'string' || !data.japaneseResponse.trim()) {
        throw new Error('AI chưa trả về câu trả lời hợp lệ. Bạn có thể gửi lại.');
      }

      const aiMsgId = Date.now() + 1;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: data.japaneseResponse,
        furigana: data.furiganaText,
        furiganaHtml: data.furiganaHtml,
        romaji: data.romajiText,
        explanation: data.japaneseExplanation,
        correctionAdvice: data.correctionAdvice,
        vietnameseTranslation: data.vietnameseTranslation,
        provider: data.provider || 'AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      aiTextRef.current[aiMsgId] = aiMsg.text || '';
      setMessages(prev => [...prev, aiMsg]);
      setStreaming({ id: aiMsgId, n: 0 });
      if (data.hints && Array.isArray(data.hints)) {
        setHints(data.hints);
      }

      if (autoSpeech) {
        handlePlayAudio(data.japaneseResponse, aiMsgId, selectedPersona.voice);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      // Preserve the unsent text instead of saving a fabricated AI answer.
      setMessages(prev => prev.filter(message => message.id !== userMsg.id));
      setInputText(userMsg.text);
      if (userMsg.quote) setReplyTo({ text: userMsg.quote, who: selectedPersona.japaneseName });
      setChatError(err instanceof Error ? err.message : 'Chưa nhận được phản hồi từ AI. Vui lòng gửi lại.');
      console.warn('[Japanese Chat] Request failed; message was restored to the composer.');
    } finally {
      if (chatAbortRef.current === controller) chatAbortRef.current = null;
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  // Level Badge Colors
  const getLevelBadgeColor = (lvl: string) => {
    switch (lvl) {
      case 'N5': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'N4': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'N3': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'N2': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'N1': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default: return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    }
  };

  return (
    <div className="ai-messenger w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0A0E1A] text-slate-100" style={{ '--chat-height': `${chatViewport.height}px`, '--chat-top': `${chatViewport.top}px` } as React.CSSProperties}>
      <div className="flex h-full w-full min-h-0 overflow-hidden">
        
        {/* Left Sidebar (Desktop Only: lg: >= 1024px) - Messenger Contacts List Style */}
        <aside className="hidden lg:flex w-72 xl:w-80 flex-col border-r border-slate-800/80 bg-[#0F1424] shrink-0 min-h-0 select-none">

          {/* Personas Contact List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {JAPANESE_PERSONAS.map(p => {
              const isSelected = p.id === selectedPersona.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePersonaOrLevelChange(p, selectedLevel)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500/50 shadow-xs'
                      : 'bg-transparent hover:bg-slate-800/50 border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xl overflow-hidden">
                      {p.id === 'nihon-shiba' ? (
                        <ShibaMascot pose="waving" size={36} animated={false} />
                      ) : (
                        <img src={p.avatar} alt={`Ảnh đại diện ${p.name}`} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold truncate font-jp ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {p.japaneseName}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {p.role}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

          </div>
        </aside>

        {/* Center / Main Messenger Window (Edge-to-Edge on Mobile) */}
        <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0A0E1A] relative overflow-hidden">
          
          {/* 1. Messenger Top Header Bar */}
          <header className={`px-2.5 sm:px-4 bg-[#0F1424]/98 border-b border-slate-800/80 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 z-20 shadow-xs select-none transition-all duration-150 ${
            (isKeyboardOpen || isInputFocused) ? 'h-11 sm:h-12' : 'h-13 sm:h-16'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-1 -ml-1 text-slate-300 hover:text-white active:scale-95 rounded-full hover:bg-slate-800 transition cursor-pointer shrink-0"
                  title="Quay lại Luyện tập"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-200" />
                </button>
              )}

              {/* Persona Avatar */}
              <button
                type="button"
                onClick={() => setIsPersonaDrawerOpen(true)}
                className="relative shrink-0 active:scale-95 transition cursor-pointer"
                title="Chạm để đổi đối tác AI & Cấp độ"
              >
                <div className={`${(isKeyboardOpen || isInputFocused) ? 'w-7 h-7 sm:w-8 sm:h-8 text-base' : 'w-9 h-9 sm:w-10 sm:h-10 text-xl'} rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center shadow-xs overflow-hidden transition-all`}>
                  {selectedPersona.id === 'nihon-shiba' ? (
                    <ShibaMascot pose="waving" size={(isKeyboardOpen || isInputFocused) ? 26 : 36} animated={false} />
                  ) : (
                    <img src={selectedPersona.avatar} alt={`Ảnh đại diện ${selectedPersona.name}`} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-[#0F1424] shadow-xs" />
              </button>

              {/* Name & Status */}
              <button
                type="button"
                onClick={() => setIsPersonaDrawerOpen(true)}
                className="text-left min-w-0 cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs sm:text-sm font-bold text-white truncate font-jp group-hover:text-blue-400 transition">
                    {selectedPersona.japaneseName}
                  </h2>
                  <span className="hidden sm:inline text-xs text-slate-400 truncate">
                    ({selectedPersona.name})
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-black border shrink-0 ${getLevelBadgeColor(selectedLevel)}`}>
                    {selectedLevel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-emerald-400 font-medium truncate">Đang hoạt động</span>
                  {!(isKeyboardOpen || isInputFocused) && (
                    <>
                      <span className="text-slate-600 hidden xs:inline">•</span>
                      <span className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-medium truncate">
                        <span>Đổi</span>
                        <ChevronDown className="w-3 h-3" />
                      </span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Live Voice Call Button */}
              <button
                type="button"
                onClick={() => setIsLiveVoiceOpen(true)}
                className={`rounded-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center gap-1 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs ${
                  (isKeyboardOpen || isInputFocused) ? 'px-2 py-1 text-[11px]' : 'px-2.5 sm:px-3 py-1.5'
                }`}
                title="Gọi thoại Live với AI"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="hidden md:inline">Live Call</span>
              </button>

              <button type="button" onClick={() => setIsHistoryOpen(true)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 flex items-center justify-center cursor-pointer"
                title="Lịch sử trò chuyện" aria-label="Mở lịch sử trò chuyện">
                <History className="w-4 h-4" />
              </button>

              {/* Furigana Quick Toggle */}
              <button
                type="button"
                onClick={() => setShowFurigana(!showFurigana)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer text-xs font-bold ${
                  showFurigana
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                }`}
                title={showFurigana ? 'Tắt Furigana' : 'Bật Furigana'}
              >
                <span>あ</span>
              </button>

              {/* Vietnamese Translation Quick Toggle */}
              <button
                type="button"
                onClick={() => setShowVietnamese(!showVietnamese)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
                  showVietnamese
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                }`}
                title={showVietnamese ? 'Tắt dịch tiếng Việt' : 'Bật dịch tiếng Việt'}
              >
                <Globe className="w-3.5 h-3.5" />
              </button>

              {/* Settings Modal Toggle */}
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 flex items-center justify-center transition active:scale-95 cursor-pointer"
                title="Cài đặt trò chuyện"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* 2. Messenger Message Feed Area */}
          <div className={`ai-message-feed flex-1 overflow-y-auto px-3 sm:px-6 min-h-0 bg-[#0A0E1A] overscroll-contain transition-all ${
            (isKeyboardOpen || isInputFocused) ? 'py-2 space-y-2' : 'py-3.5 space-y-3'
          }`}>
            
            {/* Messages Stream */}
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              const isSpeaking = currentlySpeakingId === m.id;
              const isExplExpanded = expandedExplanations[m.id];
              const isTransExpanded = expandedTranslations[m.id] ?? showVietnamese;

              return (
                <div
                  key={m.id}
                  className={`flex items-end gap-2 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {/* AI Avatar */}
                  {isAi && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sm shadow-xs shrink-0 mb-1 overflow-hidden">
                      {selectedPersona.id === 'nihon-shiba' ? (
                        <ShibaMascot pose="waving" size={26} animated={false} />
                      ) : (
                        <img src={selectedPersona.avatar} alt={`Ảnh đại diện ${selectedPersona.name}`} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`ai-message-content max-w-[85%] sm:max-w-[75%] space-y-1.5 ${isAi ? 'items-start' : 'items-end'}`}>
                    <SwipeReplyIf enabled={isAi} onReply={() => setReplyTo({ text: m.text || '', who: selectedPersona.japaneseName })}>
                    <div
                      className={`p-3 sm:p-3.5 shadow-sm transition-all ${
                        isAi
                          ? 'ai-bubble ai-bubble-incoming bg-[#1B223C] text-slate-100 rounded-2xl rounded-tl-xs border border-[#2B355A]/60'
                          : 'ai-bubble ai-bubble-outgoing bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-xs shadow-md'
                      }`}
                    >
                      {m.quote && <span className="u078-q">{m.quote}</span>}
                      {isAi && m.provider && (
                        <div className="mb-1.5 text-[10px] font-semibold text-slate-400">
                          {m.provider === 'Lời chào mẫu'
                            ? 'Lời chào có sẵn'
                            : m.provider === 'AI'
                              ? 'AI'
                              : `AI trực tuyến · ${m.provider}`}
                        </div>
                      )}
                      {/* Japanese Text */}
                      <div className="text-[13.5px] sm:text-[15px] font-medium leading-relaxed font-jp">
                        {streaming?.id === m.id ? (
                          <span>{Array.from(m.text || '').slice(0, streaming.n).map((ch, k) => <span key={k} className="u086-w">{ch}</span>)}<span className="u086-caret" aria-hidden="true" /></span>
                        ) : showFurigana && m.furiganaHtml ? (
                          <div 
                            className="inline-block leading-relaxed [&_ruby]:text-[13.5px] sm:[&_ruby]:text-[15px] [&_rt]:text-[10px] [&_rt]:text-amber-300 font-jp" 
                            dangerouslySetInnerHTML={{ __html: sanitizeRubyHtml(m.furiganaHtml) }} 
                          />
                        ) : (
                          <span>{m.text || ''}</span>
                        )}
                        {m.stopped && <span className="u086-stop">— Đã dừng tại đây</span>}
                      </div>

                      {/* Vietnamese Translation */}
                      {isAi && streaming?.id !== m.id && (isTransExpanded || showVietnamese) && m.vietnameseTranslation && (
                        <div className="mt-2 pt-2 border-t border-slate-700/60 text-xs text-sky-200 font-medium leading-relaxed flex items-start gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span>{m.vietnameseTranslation}</span>
                        </div>
                      )}

                      {/* Action Footer */}
                      {isAi && streaming?.id !== m.id && (
                        <div className="chat-msg-actions flex items-center justify-between gap-1 pt-2 mt-2 border-t border-slate-700/50 text-[11px]">
                          <div className="flex items-center gap-1 flex-wrap">
                            {/* Audio Speak */}
                            <button
                              type="button"
                              onClick={() => handlePlayAudio(m.text || '', m.id)}
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                                isSpeaking
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
                              }`}
                              title={isSpeaking ? 'Dừng đọc' : 'Nghe phát âm'}
                            >
                              <Volume2 className="w-3 h-3 text-emerald-400" />
                              <span>{isSpeaking ? 'Đang đọc...' : 'Nghe'}</span>
                            </button>

                            {/* Translation Toggle */}
                            {!showVietnamese && m.vietnameseTranslation && (
                              <button
                                type="button"
                                onClick={() => setExpandedTranslations(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                                  isTransExpanded
                                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
                                }`}
                              >
                                <Globe className="w-3 h-3 text-sky-400" />
                                <span>{isTransExpanded ? 'Ẩn dịch' : 'Dịch'}</span>
                              </button>
                            )}

                            {/* Grammar Point Toggle */}
                            {m.explanation && (
                              <button
                                type="button"
                                onClick={() => setExpandedExplanations(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                                  isExplExpanded
                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
                                }`}
                              >
                                <Lightbulb className="w-3 h-3 text-amber-400" />
                                <span>Ngữ pháp</span>
                              </button>
                            )}

                            {/* Copy */}
                            <button
                              type="button"
                              onClick={() => handleCopyText(m.text || '', m.id)}
                              className="p-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition cursor-pointer"
                              title="Sao chép"
                            >
                              {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          <span className="text-[10px] text-slate-400 font-mono ml-auto">
                            {m.timestamp}
                          </span>
                        </div>
                      )}

                      {/* User message timestamp */}
                      {!isAi && (
                        <div className="flex justify-end pt-1 text-[10px] text-blue-100 font-mono">
                          {m.timestamp}
                        </div>
                      )}
                    </div>
                    </SwipeReplyIf>

                    {/* Correction Advice */}
                    {isAi && m.correctionAdvice && (
                      <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs space-y-0.5 shadow-xs">
                        <div className="flex items-center gap-1 text-amber-300 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Gợi ý cách diễn đạt tự nhiên hơn:</span>
                        </div>
                        <p className="text-slate-200 leading-snug font-jp text-[11px]">
                          {m.correctionAdvice}
                        </p>
                      </div>
                    )}

                    {/* Grammar Explanation Box */}
                    {isAi && m.explanation && isExplExpanded && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2.5 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs space-y-1 shadow-xs"
                      >
                        <div className="flex items-center gap-1 text-indigo-300 font-bold text-[11px]">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Điểm biểu đạt & Ngữ pháp:</span>
                        </div>
                        <p className="text-slate-200 leading-snug font-jp text-[11.5px]">
                          {m.explanation}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Messenger Typing Indicator */}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sm shadow-xs shrink-0 mb-1 overflow-hidden">
                  {selectedPersona.id === 'nihon-shiba' ? (
                    <ShibaMascot pose="waving" size={26} animated={false} />
                  ) : (
                    <img src={selectedPersona.avatar} alt={`Ảnh đại diện ${selectedPersona.name}`} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="px-3.5 py-2.5 bg-[#1B223C] border border-[#2B355A]/60 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-slate-400 shadow-sm">
                  <span className="u086-dots" aria-hidden="true"><i /><i /><i /></span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    {selectedPersona.japaneseName} đang soạn tin nhắn...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* 3. Quick Suggestions Strip - Hidden when keyboard or input is focused to maximize vertical conversation area */}
          {hints.length > 0 && !isKeyboardOpen && !isInputFocused && (
            <div className="ai-chat-hints px-3 py-1.5 bg-[#0F1424]/95 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none transition-all duration-150">
              <div className="flex items-center gap-1.5 flex-nowrap">
                {hints.map((hint, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(hint)}
                    className="px-3 py-1 rounded-full bg-[#1B223C] hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-medium transition cursor-pointer shrink-0 font-jp shadow-xs whitespace-nowrap"
                  >
                    <span>{hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Live Voice Equalizer Bar (when listening) */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-3 py-2 bg-gradient-to-r from-blue-950/95 via-slate-950/95 to-indigo-950/95 border-t border-blue-500/40 flex flex-col gap-1.5 shrink-0 backdrop-blur-md shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="u084-dots shrink-0" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map(i => <i key={i} style={{ ['--h' as any]: Math.min(1, (audioFrequencies[Math.round((i * 11) / 4)] || 0) / 100).toFixed(2) }} />)}
                    </div>
                    <div className="text-xs text-blue-200 font-jp truncate flex-1">
                      {inputText ? (
                        <span className="font-bold text-white bg-blue-900/70 px-2.5 py-0.5 rounded-md border border-blue-400/40 inline-flex items-center gap-1.5">
                          <span>{inputText}</span>
                          <span className="w-1.5 h-1.5 bg-blue-400 animate-ping rounded-full" />
                        </span>
                      ) : (
                        <span className="text-slate-400 animate-pulse text-xs">
                          Đang lắng nghe giọng nói tiếng Nhật...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {inputText && (
                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-full shadow-sm transition cursor-pointer flex items-center gap-1"
                      >
                        <span>Gửi</span>
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-full border border-slate-800 transition cursor-pointer"
                      title="Dừng thu âm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply preview (swipe-to-reply) */}
          <div className={`u078-reply${replyTo ? ' on' : ''}`} aria-hidden={!replyTo}>
            <div>
              <div className="u078-rbox">
                <span><b>Trả lời {replyTo?.who}</b><em>{replyTo?.text}</em></span>
                <button className="u078-rx" type="button" aria-label="Hủy trả lời" tabIndex={replyTo ? 0 : -1} onClick={() => setReplyTo(null)}><svg viewBox="0 0 12 12"><path d="M3 3l6 6M9 3L3 9" /></svg></button>
              </div>
            </div>
          </div>
          {historySaveError && (
            <div role="alert" className="px-3 py-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-700/50">
              Không thể lưu lịch sử trên thiết bị này (bộ nhớ trình duyệt bị chặn hoặc đã đầy).
            </div>
          )}
          {chatError && (
            <div role="alert" aria-live="polite" className="flex items-center justify-between gap-3 px-3 py-2 bg-rose-950/50 border-t border-rose-500/40 text-rose-200 text-xs shrink-0">
              <span className="min-w-0">{chatError} Tin nhắn đã được giữ lại.</span>
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="shrink-0 rounded-lg border border-rose-400/50 px-3 py-1 font-semibold hover:bg-rose-900/60 disabled:opacity-50"
              >
                Gửi lại
              </button>
            </div>
          )}

          {/* 5. Messenger Bottom Input Bar */}
          <footer className={`ai-composer bg-[#0F1424]/98 border-t border-slate-800/80 flex items-center gap-1.5 sm:gap-2 shrink-0 z-20 select-none transition-all duration-150 ${
            (isKeyboardOpen || isInputFocused) ? 'p-1.5 sm:p-2' : 'p-2 sm:p-2.5'
          }`}>
            {/* Mic Button: chạm để bật/tắt, hoặc giữ rồi thả (084) */}
            <button
              type="button"
              onPointerDown={(e) => { if (e.button !== 0) return; micPress.current = { t: Date.now(), was: isListening || !!recognitionRef.current }; if (!micPress.current.was) toggleListening(); }}
              onPointerUp={() => { const p = micPress.current; micPress.current = null; if (p && (p.was || Date.now() - p.t > 350) && (isListening || recognitionRef.current)) toggleListening(); }}
              onClick={(e) => { if (e.detail === 0) toggleListening(); }}
              style={{ ['--lv' as any]: (audioLevel / 100).toFixed(2) }}
              className={`u084-mic${isListening ? ' is-on' : ''} rounded-full transition active:scale-95 cursor-pointer shrink-0 ${
                (isKeyboardOpen || isInputFocused) ? 'p-1.5' : 'p-2'
              } ${
                isListening
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/50 ring-2 ring-rose-400'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
              title={isListening ? 'Thả hoặc chạm để dừng' : 'Chạm hoặc giữ để nói tiếng Nhật'}
              aria-pressed={isListening}
            >
              {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Auto-growing input with character ring */}
            <div className="flex-1 relative min-w-0">
              <AutoGrowInput
                inputRef={inputRef}
                value={inputText}
                onChange={setInputText}
                onEnter={() => handleSendMessage()}
                max={500}
                ariaLabel="Tin nhắn tiếng Nhật"
                placeholder={isListening ? 'Đang lắng nghe tiếng Nhật...' : 'Nhắn tin bằng tiếng Nhật (日本語)...'}
                onFocus={() => {
                  setIsInputFocused(true);
                  setTimeout(() => scrollToBottom(false), 120);
                  setTimeout(() => scrollToBottom(true), 320);
                }}
                onBlur={() => setIsInputFocused(false)}
              />
            </div>

            {/* Circular Messenger Blue Send Button */}
            {streaming ? (
              <button type="button" className="u086-ctl" onClick={stopStream} aria-label="Dừng câu trả lời"><i aria-hidden="true" />Dừng</button>
            ) : (
              <PlaneSend
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading || Array.from(inputText).length > 500}
                size={(isKeyboardOpen || isInputFocused) ? 34 : 40}
              />
            )}
          </footer>
        </div>
      </div>

      {/* Saved conversations, available after returning to chat or refreshing. */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label="Lịch sử trò chuyện">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#0F1424] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-400" /> Lịch sử trò chuyện
                </h3>
                <button type="button" aria-label="Đóng lịch sử" onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="px-4 pt-3 text-xs text-slate-400">
                Tự động lưu trên trình duyệt của thiết bị này. Chưa đồng bộ lịch sử giữa các thiết bị.
              </p>
              <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-sm text-slate-400 py-10 text-center">Chưa có cuộc trò chuyện được lưu.</p>
                ) : conversations.map(thread => {
                  const persona = JAPANESE_PERSONAS.find(p => p.id === thread.personaId);
                  const preview = [...thread.messages].reverse().find(m => m.sender === 'user')?.text ||
                    thread.draft || 'Cuộc trò chuyện tiếng Nhật';
                  return (
                    <div key={thread.id} className={`rounded-xl border flex items-center gap-2 p-2 ${thread.id === activeConversationId ? 'border-blue-500/60 bg-blue-950/30' : 'border-slate-800 bg-slate-900/70'}`}>
                      <button type="button" onClick={() => restoreConversation(thread)}
                        className="text-left flex-1 min-w-0 p-1.5 rounded-lg hover:bg-slate-800/70">
                        <span className="block text-sm font-bold text-white truncate">
                          {persona?.name || 'Đối tác AI'} · {thread.level}
                          {thread.id === activeConversationId && <span className="ml-2 text-xs font-normal text-blue-300">Đang mở</span>}
                        </span>
                        <span className="block text-xs text-slate-300 truncate mt-1">{preview}</span>
                        <span className="block text-[11px] text-slate-500 mt-1">
                          {new Date(thread.updatedAt).toLocaleString('vi-VN')}
                        </span>
                      </button>
                      <button type="button" title="Xóa cuộc trò chuyện này" aria-label="Xóa cuộc trò chuyện"
                        onClick={() => deleteConversation(thread.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-slate-800">
                <button type="button" onClick={() => { handleResetChat(); setIsHistoryOpen(false); }}
                  className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-2.5 text-white font-bold text-sm flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Cuộc trò chuyện mới
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persona & JLPT Level Drawer (Mobile & Quick Switcher) */}
      <AnimatePresence>
        {isPersonaDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-[#0F1424] border border-slate-800 rounded-t-2xl sm:rounded-2xl p-4 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Đổi Đối Tác & Cấp Độ JLPT</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPersonaDrawerOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* JLPT Level Selector Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Cấp độ hội thoại:</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handlePersonaOrLevelChange(selectedPersona, lvl)}
                      className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer text-center ${
                        selectedLevel === lvl
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personas Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Chọn đối tác AI:</label>
                <div className="space-y-2">
                  {JAPANESE_PERSONAS.map((p) => {
                    const isSelected = p.id === selectedPersona.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          handlePersonaOrLevelChange(p, selectedLevel);
                          setIsPersonaDrawerOpen(false);
                        }}
                        className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm ring-1 ring-blue-500'
                            : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                          {p.id === 'nihon-shiba' ? (
                            <ShibaMascot pose="waving" size={38} animated={false} />
                          ) : (
                            <img src={p.avatar} alt={`Ảnh đại diện ${p.name}`} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white font-jp">
                              {p.japaneseName} ({p.name})
                            </span>
                            {isSelected && (
                              <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Đang chọn</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
                          <p className="text-[11px] text-blue-300/90 mt-0.5">Phong cách: {p.speakingStyle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 sm:p-5 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Cài Đặt Trò Chuyện & Giọng Đọc</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Speed control */}
                <div className="space-y-1.5">
                  <span className="text-slate-300 font-bold">Tốc độ giọng đọc Nhật:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[0.8, 1.0, 1.2].map(speed => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setSpeechRate(speed)}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          speechRate === speed
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {speed === 0.8 ? '0.8x (Chậm)' : speed === 1.0 ? '1.0x (Chuẩn)' : '1.2x (Nhanh)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response Length */}
                <div className="space-y-1.5">
                  <span className="text-slate-300 font-bold">Độ dài câu trả lời của AI:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['concise', 'natural', 'detailed'] as const).map(len => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setResponseLength(len)}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          responseLength === len
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {len === 'concise' ? 'Ngắn gọn' : len === 'natural' ? 'Tự nhiên' : 'Chi tiết'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Speech Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-bold text-white">Tự động phát âm</p>
                      <p className="text-[11px] text-slate-400">Đọc to câu trả lời của AI khi nhận tin</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoSpeech(!autoSpeech)}
                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                      autoSpeech ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        autoSpeech ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Reset Chat Button */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsModalOpen(false);
                      handleResetChat();
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 font-bold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Cuộc trò chuyện mới (giữ lịch sử cũ)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Topic Suggestions Dialog */}
      <AnimatePresence>
        {isTopicModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 max-w-md w-full shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">Chủ Đề Hội Thoại Gợi Ý</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {SUGGESTED_TOPICS.map((topic, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsTopicModalOpen(false);
                      handleSendMessage(`${topic.topicJp}について話しましょう！`);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-blue-950/50 border border-slate-800 hover:border-blue-500/40 transition cursor-pointer flex items-start gap-2.5"
                  >
                    <span className="text-lg shrink-0 mt-0.5">{topic.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white font-jp truncate">{topic.topicJp}</p>
                      <p className="text-[11px] text-slate-400 truncate">{topic.topicVi}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time Interactive Live Voice Conversation Call Screen */}
      <JapaneseLiveVoiceCall
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        persona={selectedPersona}
        level={selectedLevel}
        onPersonaChange={(p) => setSelectedPersona(p)}
        onLevelChange={(lvl) => setSelectedLevel(lvl)}
        availablePersonas={JAPANESE_PERSONAS}
        onMessageLogged={handleLiveMessageLogged}
      />
    </div>
  );
}
