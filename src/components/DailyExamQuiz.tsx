/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ChevronRight, 
  AlertCircle,
  BookOpen,
  Calendar,
  Filter,
  Search,
  RotateCcw,
  Star,
  Check,
  Zap,
  FileSpreadsheet,
  BarChart2,
  Bookmark,
  Headphones,
  Play,
  Square,
  Volume2,
  ShieldCheck,
  Radio,
  HelpCircle,
  Globe,
  Timer,
  History,
  PenTool,
  FileDown,
  RefreshCw
} from 'lucide-react';
import { DailyExam, ExamQuestion, UserProfile, ExamHistoryRecord } from '../types';
import { DAILY_EXAMS } from '../data';
import { JLPT_PAST_EXAMS } from '../data/jlptExams';
import { ensureFullExamQuestions } from '../data/jlptExamGenerator';
import { JlptOfficialScoreReport } from './JlptOfficialScoreReport';
import { JlptRealBookletExam } from './JlptRealBookletExam';
import { JlptModernExamView } from './exam/JlptModernExamView';
import { ExamHistoryModal } from './ExamHistoryModal';
import { PrintableExamBooklet } from './PrintableExamBooklet';
import { showLearningFeedback } from '../utils/learningMotion';
import { PdfExamBookletViewer } from './PdfExamBookletViewer';
import StudyExperienceHero from './learning/StudyExperienceHero';

import { localDateStr } from '../utils/localDate';
const EXAM_PRAISES = [
  'Đỉnh nóc kịch trần! Bạn chọn chuẩn không cần chỉnh! 🎉',
  'Xuất sắc! Giám khảo JLPT nhìn thấy cũng phải gật đầu bái phục! 🌟',
  'Chính xác 100%! Trình này đi thi đỗ chắc trong tầm tay! 🚀',
  'Quá mượt mà! Kiến thức vững như bàn thạch! 💎',
  'Chuẩn chỉ! Đúng là cao thủ luyện đề không trượt phát nào! 🔥'
];

const EXAM_ROASTS = [
  'Ối giồi ôi! Chọn thế này thì bẫy của đề thi nuốt trọn bạn rồi! 💀',
  'Sai rồi nhé! Đừng để cảm xúc đánh lừa lý trí, đọc kỹ lại đề nào! 😅',
  'Bình tĩnh lại nào! Giám khảo đang cười tủm tỉm vì bạn vừa sập bẫy đấy! 🙈',
  'Sai một ly đi một dặm! Nhìn lại giải thích chi tiết bên dưới ngay đi nhé! 🔍',
  'Cú lừa ngoạn mục! Lần sau gặp dạng này nhớ tỉnh táo hơn nhé! ⚡'
];

export const renderFormattedQuestion = (text: string) => {
  if (!text) return '';
  // Split using heavy brackets 【 】 or square brackets [ ] as the target highlights
  const parts = text.split(/([【\[][^】\]]+[】\]])/g);
  return (
    <>
      {parts.map((part, i) => {
        const isBracketed = (part.startsWith('【') && part.endsWith('】')) || (part.startsWith('[') && part.endsWith(']'));
        if (isBracketed) {
          const content = part.slice(1, -1);
          return (
            <span 
              key={i} 
              className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border-b-2 border-indigo-500 font-extrabold inline-block mx-0.5 underline decoration-indigo-500 decoration-2 underline-offset-4 shadow-2xs"
            >
              {content}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};


export interface LevelPartInfo {
  id: 'part1' | 'part2' | 'part3';
  label: string;
  durationSeconds: number;
  sections: string[];
}

export type ExamSectionMode = 'ALL' | 'moji-goi' | 'bunpou' | 'dokkai' | 'choukai';

export interface SectionMeta {
  id: ExamSectionMode;
  name: string;
  shortName: string;
  japanese: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgeColor: string;
  activeBtn: string;
}

export const JLPT_SECTION_METAS: Record<ExamSectionMode, SectionMeta> = {
  'ALL': {
    id: 'ALL',
    name: 'Toàn bộ đề thi',
    shortName: 'Toàn bộ đề',
    japanese: '全問題',
    icon: '🎯',
    color: 'indigo',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-200 dark:border-indigo-800',
    badgeColor: 'bg-indigo-600',
    activeBtn: 'bg-indigo-600 text-white shadow-xs'
  },
  'moji-goi': {
    id: 'moji-goi',
    name: 'Kiến thức ngôn ngữ (Từ vựng & Chữ Hán)',
    shortName: 'Từ vựng (Moji-Goi)',
    japanese: '文字・語彙',
    icon: '🔤',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    badgeColor: 'bg-emerald-600',
    activeBtn: 'bg-emerald-600 text-white shadow-xs'
  },
  'bunpou': {
    id: 'bunpou',
    name: 'Kiến thức ngôn ngữ (Ngữ pháp)',
    shortName: 'Ngữ pháp (Bunpou)',
    japanese: '文法',
    icon: '📖',
    color: 'purple',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200 dark:border-purple-800',
    badgeColor: 'bg-purple-600',
    activeBtn: 'bg-purple-600 text-white shadow-xs'
  },
  'dokkai': {
    id: 'dokkai',
    name: 'Đọc hiểu',
    shortName: 'Đọc hiểu (Dokkai)',
    japanese: '読解',
    icon: '📑',
    color: 'amber',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    badgeColor: 'bg-amber-600',
    activeBtn: 'bg-amber-600 text-white shadow-xs'
  },
  'choukai': {
    id: 'choukai',
    name: 'Nghe hiểu',
    shortName: 'Nghe hiểu (Choukai)',
    japanese: '聴解',
    icon: '🎧',
    color: 'rose',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
    badgeColor: 'bg-rose-600',
    activeBtn: 'bg-rose-600 text-white shadow-xs'
  }
};

export const getSectionStandardDuration = (section: ExamSectionMode, level: string): number => {
  const normLevel = (level || 'N4').toUpperCase();
  if (section === 'moji-goi') {
    if (normLevel === 'N5') return 25;
    if (normLevel === 'N4') return 30;
    if (normLevel === 'N3') return 30;
    if (normLevel === 'N2') return 30;
    return 25;
  }
  if (section === 'bunpou') {
    if (normLevel === 'N5') return 25;
    if (normLevel === 'N4') return 30;
    if (normLevel === 'N3') return 30;
    if (normLevel === 'N2') return 35;
    return 40;
  }
  if (section === 'dokkai') {
    if (normLevel === 'N5') return 25;
    if (normLevel === 'N4') return 30;
    if (normLevel === 'N3') return 40;
    if (normLevel === 'N2') return 50;
    return 60;
  }
  if (section === 'choukai') {
    if (normLevel === 'N5') return 30;
    if (normLevel === 'N4') return 35;
    if (normLevel === 'N3') return 40;
    if (normLevel === 'N2') return 50;
    return 60;
  }
  // Full exam duration
  if (normLevel === 'N5') return 105;
  if (normLevel === 'N4') return 125;
  if (normLevel === 'N3') return 140;
  if (normLevel === 'N2') return 155;
  return 170;
};

export const getPartsByLevel = (level: string): LevelPartInfo[] => {
  const normLevel = (level || 'N4').toUpperCase();
  if (normLevel === 'N1') {
    return [
      {
        id: 'part1',
        label: 'Từ vựng, Ngữ pháp & Đọc hiểu',
        durationSeconds: 110 * 60,
        sections: ['moji-goi', 'bunpou', 'dokkai']
      },
      {
        id: 'part2',
        label: 'Nghe hiểu',
        durationSeconds: 60 * 60,
        sections: ['choukai']
      }
    ];
  }
  if (normLevel === 'N2') {
    return [
      {
        id: 'part1',
        label: 'Từ vựng, Ngữ pháp & Đọc hiểu',
        durationSeconds: 105 * 60,
        sections: ['moji-goi', 'bunpou', 'dokkai']
      },
      {
        id: 'part2',
        label: 'Nghe hiểu',
        durationSeconds: 50 * 60,
        sections: ['choukai']
      }
    ];
  }
  if (normLevel === 'N3') {
    return [
      {
        id: 'part1',
        label: 'Từ vựng',
        durationSeconds: 30 * 60,
        sections: ['moji-goi']
      },
      {
        id: 'part2',
        label: 'Ngữ pháp & Đọc hiểu',
        durationSeconds: 70 * 60,
        sections: ['bunpou', 'dokkai']
      },
      {
        id: 'part3',
        label: 'Nghe hiểu',
        durationSeconds: 40 * 60,
        sections: ['choukai']
      }
    ];
  }
  if (normLevel === 'N5') {
    return [
      {
        id: 'part1',
        label: 'Từ vựng',
        durationSeconds: 25 * 60,
        sections: ['moji-goi']
      },
      {
        id: 'part2',
        label: 'Ngữ pháp & Đọc hiểu',
        durationSeconds: 50 * 60,
        sections: ['bunpou', 'dokkai']
      },
      {
        id: 'part3',
        label: 'Nghe hiểu',
        durationSeconds: 30 * 60,
        sections: ['choukai']
      }
    ];
  }
  // Default is N4
  return [
    {
      id: 'part1',
      label: 'Từ vựng',
      durationSeconds: 30 * 60,
      sections: ['moji-goi']
    },
    {
      id: 'part2',
      label: 'Ngữ pháp & Đọc hiểu',
      durationSeconds: 60 * 60,
      sections: ['bunpou', 'dokkai']
    },
    {
      id: 'part3',
      label: 'Nghe hiểu',
      durationSeconds: 35 * 60,
      sections: ['choukai']
    }
  ];
};

export const getPartBySectionAndLevel = (section: string, level: string): 'part1' | 'part2' | 'part3' | null => {
  const parts = getPartsByLevel(level);
  const matchedPart = parts.find(p => p.sections.includes(section));
  return matchedPart ? matchedPart.id : null;
};

export interface JLPTLevelSpec {
  level: string;
  totalQuestions: number;
  totalDuration: number;
  parts: {
    name: string;
    duration: number;
    questionCount: string;
    types: string[];
  }[];
}

export const JLPT_LEVEL_SPECS: Record<string, JLPTLevelSpec> = {
  'N5': {
    level: 'N5',
    totalQuestions: 67,
    totalDuration: 105,
    parts: [
      {
        name: 'Phần 1: Kiến thức ngôn ngữ (Từ vựng)',
        duration: 25,
        questionCount: '35 câu',
        types: ['Cách đọc chữ Hán (漢字読み)', 'Cách viết chữ Hán / biểu thị (表記)', 'Điền từ hợp ngữ cảnh (文脈規定)', 'Từ gần nghĩa / đồng nghĩa (言い換え類義)']
      },
      {
        name: 'Phần 2: Kiến thức ngôn ngữ (Ngữ pháp) & Đọc hiểu',
        duration: 50,
        questionCount: '27 câu (23 Ngữ pháp + 4 Đọc hiểu)',
        types: ['Chọn ngữ pháp phù hợp (Ngữ pháp câu)', 'Sắp xếp câu dạng dấu sao (Sắp xếp câu ★)', 'Ngữ pháp trong đoạn văn', 'Đoản văn (Nội dung ngắn)', 'Tìm thông tin bảng biểu']
      },
      {
        name: 'Phần 3: Nghe hiểu',
        duration: 30,
        questionCount: '24 câu (Mô phỏng 5 câu nghe hiểu)',
        types: ['Nghe hiểu chủ đề', 'Nghe hiểu cốt lõi', 'Nhìn hình chọn câu thoại', 'Nghe phản xạ tức thì']
      }
    ]
  },
  'N4': {
    level: 'N4',
    totalQuestions: 70,
    totalDuration: 125,
    parts: [
      {
        name: 'Phần 1: Kiến thức ngôn ngữ (Từ vựng)',
        duration: 30,
        questionCount: '35 câu',
        types: ['Cách đọc chữ Hán (漢字読み)', 'Cách viết chữ Hán / biểu thị (表記)', 'Điền từ hợp ngữ cảnh (文脈規定)', 'Từ gần nghĩa / đồng nghĩa (言い換え類義)', 'Cách dùng từ trong câu (用法)']
      },
      {
        name: 'Phần 2: Kiến thức ngôn ngữ (Ngữ pháp) & Đọc hiểu',
        duration: 60,
        questionCount: '30 câu (25 Ngữ pháp + 5 Đọc hiểu)',
        types: ['Chọn cấu trúc phù hợp (Ngữ pháp câu)', 'Sắp xếp câu dạng dấu sao (Sắp xếp câu ★)', 'Ngữ pháp trong văn bản', 'Đoản văn (Nội dung ngắn)', 'Tìm kiếm thông tin']
      },
      {
        name: 'Phần 3: Nghe hiểu',
        duration: 35,
        questionCount: '28 câu (Mô phỏng 5 câu nghe hiểu)',
        types: ['Nghe hiểu tình huống', 'Nghe chọn chi tiết chính', 'Nhìn tranh chọn câu thoại', 'Hội thoại ngắn hỏi đáp']
      }
    ]
  },
  'N3': {
    level: 'N3',
    totalQuestions: 73,
    totalDuration: 140,
    parts: [
      {
        name: 'Phần 1: Kiến thức ngôn ngữ (Từ vựng)',
        duration: 30,
        questionCount: '35 câu',
        types: ['Cách đọc Kanji (漢字読み)', 'Cách biểu thị chữ Kanji (表記)', 'Điền từ hợp ngữ cảnh (文脈規定)', 'Từ đồng nghĩa / gần nghĩa (言い換え類義)', 'Cách dùng từ (用法)']
      },
      {
        name: 'Phần 2: Ngữ pháp & Đọc hiểu',
        duration: 70,
        questionCount: '38 câu (23 Ngữ pháp + 15 Đọc hiểu)',
        types: ['Chọn ngữ pháp phù hợp (Ngữ pháp câu)', 'Sắp xếp câu dạng dấu sao (Sắp xếp câu ★)', 'Ngữ pháp trong đoạn văn', 'Đọc hiểu đoản văn, trung văn, trường văn', 'Tìm kiếm thông tin']
      },
      {
        name: 'Phần 3: Nghe hiểu',
        duration: 40,
        questionCount: '28 câu (Mô phỏng 5 câu nghe hiểu)',
        types: ['Nghe hiểu cốt lõi', 'Nghe hiểu nội dung tổng hợp', 'Mô tả hình ảnh cuộc đối thoại', 'Nghe phản xạ nhanh']
      }
    ]
  },
  'N2': {
    level: 'N2',
    totalQuestions: 71,
    totalDuration: 155,
    parts: [
      {
        name: 'Phần 1: Từ vựng, Ngữ pháp & Đọc hiểu',
        duration: 105,
        questionCount: '66 câu (30 Từ vựng + 21 Ngữ pháp + 15 Đọc hiểu)',
        types: ['Đọc Kanji (漢字読み)', 'Biểu thị Hán tự (表記)', 'Cấu tạo từ (語形式)', 'Mạch văn quyết định (文脈規定)', 'Từ gần nghĩa', 'Cách dùng từ (用法)', 'Chọn ngữ pháp câu', 'Sắp xếp câu (★)', 'Đoạn văn ngữ pháp', 'Đoản văn, Trung văn, So sánh văn bản, Tìm thông tin']
      },
      {
        name: 'Phần 2: Nghe hiểu',
        duration: 50,
        questionCount: '32 câu (Mô phỏng 5 câu nghe hiểu)',
        types: ['Nghe hiểu đại ý câu chuyện', 'Tìm chi tiết chính và giải pháp', 'Nghe hiểu tổng hợp', 'Câu nói ứng xử / phản xạ', 'Nghe hội thoại trực quan']
      }
    ]
  },
  'N1': {
    level: 'N1',
    totalQuestions: 66,
    totalDuration: 170,
    parts: [
      {
        name: 'Phần 1: Từ vựng, Ngữ pháp & Đọc hiểu',
        duration: 110,
        questionCount: '61 câu (25 Từ vựng + 19 Ngữ pháp + 17 Đọc hiểu)',
        types: ['Cách đọc Kanji', 'Điền từ hợp văn cảnh', 'Từ gần nghĩa / tương đương', 'Đặc tính sử dụng từ (用法)', 'Ngữ pháp câu', 'Sắp xếp câu (★)', 'Ngữ pháp đoạn văn', 'Bài đọc hiểu ngắn, trung, dài', 'So sánh nhiều văn bản', 'Tìm kiếm chi tiết biểu bảng']
      },
      {
        name: 'Phần 2: Nghe hiểu',
        duration: 60,
        questionCount: '37 câu (Mô phỏng 5 câu nghe hiểu)',
        types: ['Nghe hiểu nội dung tổng quát', 'Lọc thông tin cốt lõi', 'Phân tích phản xạ tình huống', 'Nghe hiểu tổng hợp đối chiếu']
      }
    ]
  }
};

const renderSpecDetails = (selectedLevel: string) => {
  const currentSpecLvl = (selectedLevel === 'ALL' ? 'N3' : selectedLevel);
  const spec = JLPT_LEVEL_SPECS[currentSpecLvl];
  if (!spec) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-indigo-600 text-white rounded font-bold text-[11px]">{spec.level}</span>
          <span className="font-bold text-slate-800">Cấu trúc chuẩn JLPT</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
          <span>Tổng thời gian: <strong className="text-slate-900">{spec.totalDuration} phút</strong></span>
          <span>•</span>
          <span>Tổng số câu: <strong className="text-indigo-600">~{spec.totalQuestions} câu</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-0.5">
        {spec.parts.map((part, pIdx) => (
          <div key={pIdx} className="bg-white border border-slate-200 rounded-lg p-2 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span>{pIdx + 1}. {part.name}</span>
              <span className="text-rose-600 font-mono text-[10px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{part.duration}p</span>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-1">{part.questionCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DailyExamQuizProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onEarnXp: (amount: number) => void;
}

export default function DailyExamQuiz({ userProfile, updateProfile, onEarnXp }: DailyExamQuizProps) {
  // Combine all available exams (Daily mock + Past official exams + AI generated)
  const [aiGeneratedExams, setAiGeneratedExams] = useState<DailyExam[]>(() => {
    try {
      const saved = localStorage.getItem('jlpt_ai_exams');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const rawAllExams: DailyExam[] = [...JLPT_PAST_EXAMS, ...DAILY_EXAMS, ...aiGeneratedExams];
  // Đề do AI soạn giữ nguyên; đề có sẵn dưới 10 câu thì ẩn khỏi thư viện.
  const allExams: DailyExam[] = rawAllExams.map(ensureFullExamQuestions).filter(e => e.category === 'ai_generated' || e.category === 'mock_daily' || e.questions.length >= 10);

  // Filtering & Tab Navigation state
  const [mainTab, setMainTab] = useState<'ai_builder' | 'pdf_practice' | 'library'>('library');
  const [examMainTab, setExamMainTab] = useState<'standard' | 'todaii' | 'ai_builder'>('standard');
  const [selectedLevel, setSelectedLevel] = useState<string>(userProfile.targetLevel || 'ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'official_past' | 'mock_daily' | 'ai_generated'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showStructureInfo, setShowStructureInfo] = useState<boolean>(false);

  // Selected Active Exam
  const [selectedExam, setSelectedExam] = useState<DailyExam | null>(() => {
    return JLPT_PAST_EXAMS.find(e => e.level === userProfile.targetLevel) || JLPT_PAST_EXAMS[0] || allExams[0];
  });

  // AI Generator specific states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [aiSelectedLevel, setAiSelectedLevel] = useState<'N1' | 'N2' | 'N3' | 'N4' | 'N5'>(() => {
    const defaultLvl = userProfile.targetLevel;
    if (['N1', 'N2', 'N3', 'N4', 'N5'].includes(defaultLvl || '')) {
      return defaultLvl as 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
    }
    return 'N5';
  });

  // Sync with userProfile.targetLevel changes
  const prevExamTargetRef = useRef(userProfile.targetLevel);
  useEffect(() => {
    if (prevExamTargetRef.current !== userProfile.targetLevel) {
      prevExamTargetRef.current = userProfile.targetLevel;
      if (userProfile.targetLevel) {
        setSelectedLevel(userProfile.targetLevel);
        setAiSelectedLevel(userProfile.targetLevel as any);
        const matchExam = JLPT_PAST_EXAMS.find(e => e.level === userProfile.targetLevel);
        if (matchExam) {
          setSelectedExam(matchExam);
        }
      }
    }
  }, [userProfile.targetLevel]);

  const getLevelBreakdown = (lvl: 'N1' | 'N2' | 'N3' | 'N4' | 'N5') => {
    switch (lvl) {
      case 'N1':
        return { mojiGoi: 25, bunpou: 19, dokkai: 17, choukai: 5, total: 66, minutes: 110 };
      case 'N2':
        return { mojiGoi: 30, bunpou: 21, dokkai: 15, choukai: 5, total: 71, minutes: 105 };
      case 'N3':
        return { mojiGoi: 35, bunpou: 22, dokkai: 11, choukai: 5, total: 73, minutes: 100 };
      case 'N4':
        return { mojiGoi: 35, bunpou: 25, dokkai: 5, choukai: 5, total: 70, minutes: 80 };
      case 'N5':
        return { mojiGoi: 35, bunpou: 23, dokkai: 4, choukai: 5, total: 67, minutes: 60 };
    }
  };

  const currentBreakdown = getLevelBreakdown(aiSelectedLevel);

  // Active quiz playing state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedViewTab, setSubmittedViewTab] = useState<'certificate' | 'review'>('certificate');
  const [activeSectionFilter, setActiveSectionFilter] = useState<'ALL' | 'moji-goi' | 'bunpou' | 'dokkai' | 'choukai'>('ALL');
  
  // Practice section mode: 'ALL' or specific section 'moji-goi' | 'bunpou' | 'dokkai' | 'choukai'
  const [selectedSectionMode, setSelectedSectionMode] = useState<ExamSectionMode>('ALL');
  const [lobbyPracticeMode, setLobbyPracticeMode] = useState<ExamSectionMode>('ALL');
  const [sectionTimerLeft, setSectionTimerLeft] = useState<number>(30 * 60);

  // History and Printable PDF Modals
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showPdfPractice, setShowPdfPractice] = useState<boolean>(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<ExamHistoryRecord | null>(null);

  // Exam View Format: 'booklet_pdf' (Official Japanese Paper Booklet with Pen & Note) vs 'interactive'
  const [examViewFormat, setExamViewFormat] = useState<'booklet_pdf' | 'interactive'>('booklet_pdf');

  // Audio Playback states for listening comprehension (Choukai)
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio whenever question changes or exam resets
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, [currentQuestionIndex, selectedExam?.id]);

  // Leaving the page must silence any audio that is still playing.
  useEffect(() => () => {
    audioElementRef.current?.pause();
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  // Timer states for the current exam parts (mapped dynamically based on level)
  const [partTimes, setPartTimes] = useState<Record<string, number>>({
    part1: 30 * 60,
    part2: 60 * 60,
    part3: 35 * 60,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered Exam List in Lobby
  const filteredExams = allExams.filter(exam => {
    if (selectedLevel !== 'ALL' && exam.level !== selectedLevel) return false;
    if (selectedYear !== 'ALL' && exam.year !== selectedYear) return false;
    if (selectedCategory !== 'ALL' && (exam.category || 'official_past') !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        exam.title.toLowerCase().includes(q) ||
        (exam.session && exam.session.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Timer countdown hook (handles both Full Exam parts and Single Section exam)
  useEffect(() => {
    if (isPlaying && !isSubmitted && selectedExam) {
      if (selectedSectionMode !== 'ALL') {
        // Single section countdown
        if (sectionTimerLeft <= 0) {
          handleSubmit();
          return;
        }
        timerRef.current = setTimeout(() => {
          setSectionTimerLeft(prev => Math.max(0, prev - 1));
        }, 1000);
      } else {
        // Multi-part full exam countdown
        const localActiveQuestions = selectedExam.questions.filter(
          q => activeSectionFilter === 'ALL' || q.section === activeSectionFilter
        );
        const activeQ = localActiveQuestions[currentQuestionIndex] || selectedExam.questions[0];
        const activeSection = activeQ?.section || 'moji-goi';
        const activePart = getPartBySectionAndLevel(activeSection, selectedExam.level);

        if (activePart) {
          const parts = getPartsByLevel(selectedExam.level);
          
          // If all parts of the exam have run out of time, submit the test
          const allOutOfTime = parts.every(p => (partTimes[p.id] ?? 0) <= 0);
          if (allOutOfTime) {
            handleSubmit();
            return;
          }

          const currentTimeLeft = partTimes[activePart] ?? 0;
          if (currentTimeLeft > 0) {
            timerRef.current = setTimeout(() => {
              setPartTimes(prev => ({
                ...prev,
                [activePart]: Math.max(0, (prev[activePart] ?? 0) - 1)
              }));
            }, 1000);
          } else {
            // If the active part's time has run out, check if any other parts still have time left.
            const hasTimeLeft = parts.some(p => (partTimes[p.id] ?? 0) > 0);
            if (!hasTimeLeft) {
              handleSubmit();
            }
          }
        }
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isSubmitted, partTimes, sectionTimerLeft, selectedSectionMode, currentQuestionIndex, activeSectionFilter, selectedExam]);

  const handleStartExam = (
    examToStart?: DailyExam, 
    sectionMode: ExamSectionMode = 'ALL',
    format: 'booklet_pdf' | 'interactive' = 'booklet_pdf'
  ) => {
    const rawExam = examToStart || selectedExam;
    if (!rawExam) return;
    const exam = ensureFullExamQuestions(rawExam);
    
    setSelectedExam(exam);
    setSelectedSectionMode(sectionMode);
    setActiveSectionFilter(sectionMode);
    setExamViewFormat(format);
    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setSubmittedViewTab('certificate');

    if (sectionMode !== 'ALL') {
      const standardMins = getSectionStandardDuration(sectionMode, exam.level);
      setSectionTimerLeft(standardMins * 60);
    } else {
      const parts = getPartsByLevel(exam.level);
      const initialTimes: Record<string, number> = {};
      parts.forEach(p => {
        initialTimes[p.id] = p.durationSeconds;
      });
      setPartTimes(initialTimes);
    }
    setIsPlaying(true);
  };

  const handleRestartExam = () => {
    if (!selectedExam) return;
    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setSubmittedViewTab('certificate');

    if (selectedSectionMode !== 'ALL') {
      const standardMins = getSectionStandardDuration(selectedSectionMode, selectedExam.level);
      setSectionTimerLeft(standardMins * 60);
    } else {
      const parts = getPartsByLevel(selectedExam.level);
      const initialTimes: Record<string, number> = {};
      parts.forEach(p => {
        initialTimes[p.id] = p.durationSeconds;
      });
      setPartTimes(initialTimes);
    }
  };

  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleGenerateAiExam = async (level: string) => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStep(0);
    
    const interval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 2000);

    try {
      const response = await fetch('/api/exam/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ level })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({} as any)); // error body may not be JSON
        throw new Error(errData.error || errData.details || "Không thể kết nối máy chủ AI");
      }

      const examData = await response.json();
      if (!mountedRef.current) { clearInterval(interval); return; } // user left the page while the AI was writing
      
      const newExam: DailyExam = {
        ...examData,
        id: `ai_exam_${Date.now()}`,
        category: 'ai_generated'
      };

      const updated = [newExam, ...aiGeneratedExams];
      setAiGeneratedExams(updated);
      try { localStorage.setItem('jlpt_ai_exams', JSON.stringify(updated)); } catch { /* storage full/blocked: the exam still starts */ }

      clearInterval(interval);
      setIsGenerating(false);

      setSelectedExam(newExam);
      handleStartExam(newExam);

    } catch (error: any) {
      clearInterval(interval);
      if (!mountedRef.current) return;
      setIsGenerating(false);
      setGenerationError(error.message || "Quá trình biên soạn đề thi bằng AI thất bại. Vui lòng thử lại!");
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers({
      ...userAnswers,
      [questionId]: optionIndex
    });
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    showLearningFeedback('milestone');
    setIsSubmitted(true);
    setSubmittedViewTab('certificate');
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!selectedExam) return;
    
    const relevantQuestions = selectedSectionMode === 'ALL'
      ? selectedExam.questions
      : selectedExam.questions.filter(q => q.section === selectedSectionMode);

    let correctCount = 0;
    relevantQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const xpEarned = correctCount * 30 + 30; // 30 XP per correct + 30 completion bonus
    onEarnXp(xpEarned);

    // Save test results to user history
    const todayStr = localDateStr();
    const sections = { knowledge:{correct:0,total:0}, reading:{correct:0,total:0}, listening:{correct:0,total:0} };
    relevantQuestions.forEach(q => { const key = q.section === 'dokkai' ? 'reading' : q.section === 'choukai' ? 'listening' : 'knowledge'; sections[key].total++; if (userAnswers[q.id] === q.correctIndex) sections[key].correct++; });
    const updatedHistory = [
      ...(userProfile.dailyTestResults || []),
      { date: todayStr, score: correctCount, total: relevantQuestions.length, level:selectedExam.level, examId:selectedExam.id, fullExam:selectedSectionMode === 'ALL', sections }
    ];

    updateProfile({
      dailyTestResults: updatedHistory
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Active Questions filtered by Section if user selected a section filter during test
  const activeQuestions = selectedExam
    ? selectedExam.questions.filter(q => activeSectionFilter === 'ALL' || q.section === activeSectionFilter)
    : [];

  const currentQuestion = activeQuestions[currentQuestionIndex] || selectedExam?.questions[0];

  // Stop TTS when current question changes or component unmounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestionIndex, isPlaying]);

  // Keyboard shortcut listener for Enter key and option keys 1-4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (e.key === 'Enter' || e.code === 'Enter') {
        e.preventDefault();
        if (selectedExam && currentQuestionIndex < activeQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else if (selectedExam && currentQuestionIndex === activeQuestions.length - 1 && !isSubmitted) {
          handleSubmit();
        }
      } else if (!isSubmitted && currentQuestion) {
        if (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') { e.preventDefault(); handleSelectOption(currentQuestion.id, 0); }
        if (e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') { e.preventDefault(); handleSelectOption(currentQuestion.id, 1); }
        if (e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3') { e.preventDefault(); handleSelectOption(currentQuestion.id, 2); }
        if (e.key === '4' || e.code === 'Digit4' || e.code === 'Numpad4') { e.preventDefault(); handleSelectOption(currentQuestion.id, 3); }
        if (e.key?.toLowerCase() === 'r' || e.code === 'KeyR') { e.preventDefault(); handleToggleTTS(); }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [selectedExam, currentQuestionIndex, activeQuestions.length, isSubmitted, currentQuestion, userAnswers]); // userAnswers: handleSubmit/handleSelectOption read it

  const handleToggleTTS = () => {
    if (isPlayingAudio) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    const playTTS = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        alert("Trình duyệt không hỗ trợ phát âm thanh.");
        return;
      }
      window.speechSynthesis.cancel();
      const textToSpeak = currentQuestion?.audioScript || "";
      if (!textToSpeak) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ja-JP';
      utterance.rate = playbackRate;
      
      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    };

    // If direct audioUrl or audioTrack is provided, play audio file
    const audioSrc = currentQuestion?.audioUrl || (currentQuestion?.audioTrack ? `/audio/${currentQuestion.audioTrack}` : null);
    if (audioSrc) {
      try {
        const audio = new Audio(audioSrc);
        audio.playbackRate = playbackRate;
        audio.onended = () => {
          setIsPlayingAudio(false);
          audioElementRef.current = null;
        };
        audio.onerror = () => {
          playTTS();
        };
        audioElementRef.current = audio;
        audio.play()
          .then(() => setIsPlayingAudio(true))
          .catch(() => playTTS());
        return;
      } catch (e) {
        playTTS();
        return;
      }
    }

    // Default to TTS using Japanese audioScript
    playTTS();
  };

  const currentQuestionPart = (currentQuestion && selectedExam) 
    ? getPartBySectionAndLevel(currentQuestion.section, selectedExam.level) 
    : null;
  const isPartTimeUp = currentQuestionPart ? (partTimes[currentQuestionPart] ?? 0) <= 0 : false;

  const renderMainTabsHeader = () => <>
    <StudyExperienceHero kind="exam" level={userProfile.targetLevel || 'N4'} count={allExams.length} completed={userProfile.dailyTestResults?.length || 0} onHistory={() => setShowHistoryModal(true)} />
    <nav className="study-nav" aria-label="Cách luyện thi">
      {[
        { id: 'library', title: 'Kho đề luyện', note: 'Chọn đề có sẵn và bắt đầu', icon: BookOpen },
        { id: 'ai_builder', title: 'Tạo đề với AI', note: 'Soạn đề theo cấp độ của bạn', icon: PenTool },
        { id: 'pdf_practice', title: 'Đề PDF của bạn', note: 'Tải đề và luyện trên trang giấy', icon: FileText }
      ].map(item => <button key={item.id} type="button" aria-pressed={mainTab === item.id} onClick={() => { setMainTab(item.id as typeof mainTab); setShowPdfPractice(item.id === 'pdf_practice'); setSelectedCategory(item.id === 'ai_builder' ? 'ai_generated' : 'ALL'); }}><span className="study-nav-icon"><item.icon size={20} /></span><span><strong>{item.title}</strong><small>{item.note}</small></span></button>)}
    </nav>
    {!showPdfPractice && <div className="study-skill-strip" aria-label="Kỹ năng muốn luyện"><span>Luyện theo:</span>{(['ALL', 'moji-goi', 'bunpou', 'dokkai', 'choukai'] as ExamSectionMode[]).map(mode => <button key={mode} aria-pressed={lobbyPracticeMode === mode} onClick={() => setLobbyPracticeMode(mode)}>{mode === 'ALL' ? 'Toàn bộ đề' : JLPT_SECTION_METAS[mode].shortName}</button>)}</div>}
  </>;

  const renderExamCard = (exam: DailyExam) => {
    const questions = lobbyPracticeMode === 'ALL' ? exam.questions : exam.questions.filter(q => q.section === lobbyPracticeMode);
    const minutes = lobbyPracticeMode === 'ALL' ? exam.durationMinutes : Math.round(getSectionStandardDuration(lobbyPracticeMode, exam.level) / 60);
    return <article key={exam.id} className="study-exam-card">
      {exam.thumbnailUrl && <img src={exam.thumbnailUrl} alt={exam.title} className="w-full h-28 object-cover object-top rounded-t-xl mb-2 -mx-0" style={{marginTop:'-0px'}} />}
      <div className="study-exam-card-top"><span className="study-level">JLPT {exam.level}</span><small>{exam.category === 'ai_generated' ? 'Đề do AI soạn' : exam.session || (exam.year ? `Năm ${exam.year}` : 'Đề luyện tập')}</small></div>
      <h3>{exam.title}</h3>
      <div className="study-exam-spec"><span><FileText size={15} />{questions.length} câu</span><span><Clock size={15} />{minutes} phút</span></div>
      <div className="study-exam-skills">{(['moji-goi','bunpou','dokkai','choukai'] as const).map(section => { const n = exam.questions.filter(q => q.section === section).length; return n > 0 && <span key={section}>{JLPT_SECTION_METAS[section].shortName} · {n}</span>; })}</div>
      <div className="study-exam-actions"><button disabled={!questions.length} onClick={() => handleStartExam(exam, lobbyPracticeMode, 'interactive')}>Bắt đầu luyện <span aria-hidden="true">↗</span></button><button disabled={!questions.length} onClick={() => handleStartExam(exam, lobbyPracticeMode, 'booklet_pdf')}>Đề giấy</button></div>
    </article>;
  };
  return (
    <div className="study-exam select-none space-y-5">
      
      {!isPlaying ? (
        <div className="space-y-4">
          
          {/* Main Top Header Tabs */}
          {renderMainTabsHeader()}

          {/* TAB 1: PDF IMPORT & PRACTICE WORKSPACE */}
          {(mainTab === 'pdf_practice' || showPdfPractice) ? (
            <div className="animate-fade-in">
              <PdfExamBookletViewer 
                initialExam={selectedExam || undefined} 
                userProfile={userProfile} 
                onExit={() => {
                  setShowPdfPractice(false);
                  setMainTab('ai_builder');
                }} 
              />
            </div>
          ) : mainTab === 'ai_builder' ? (
            /* TAB 2: AI JLPT BUILDER STUDIO */
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-mono font-bold flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-amber-400" />
                        JLPT Builder Studio
                      </span>
                      <span className="text-xs font-mono text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">
                        Đã soạn {aiGeneratedExams.length} đề
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      Tạo một đề luyện dành cho bạn
                    </h2>
                    <p className="text-xs text-slate-300">
                      Hệ thống tự động tổng hợp Từ vựng, Ngữ pháp, Đọc hiểu &amp; Nghe hiểu chuẩn khung thi thực tế.
                    </p>
                  </div>

                  <button
                    disabled={isGenerating}
                    onClick={() => handleGenerateAiExam(aiSelectedLevel)}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
                  >
                    <PenTool className="w-4 h-4 text-slate-950" />
                    <span>{isGenerating ? 'Đang soạn đề thi...' : `🚀 Soạn Đề ${aiSelectedLevel} Ngay`}</span>
                  </button>
                </div>

                {/* Level Selector Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Chọn trình độ JLPT muốn tạo:</span>
                    <span className="text-indigo-400 font-mono text-[11px]">JLPT Standard Spec</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => {
                      const isActive = aiSelectedLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          onClick={() => setAiSelectedLevel(lvl)}
                          className={`py-2 px-1 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5 ${
                            isActive
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 scale-102'
                              : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <span>{lvl}</span>
                          <span className={`text-[10px] font-normal font-mono ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {lvl === 'N5' ? 'Sơ cấp 1' : lvl === 'N4' ? 'Sơ cấp 2' : lvl === 'N3' ? 'Trung cấp' : lvl === 'N2' ? 'Thượng cấp' : 'Cao cấp'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Level Breakdown Specs */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded font-mono font-bold text-[11px]">{aiSelectedLevel}</span>
                      <span>Cấu trúc đề AI sẽ khởi tạo:</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      <span>Thời gian: <strong className="text-white">{currentBreakdown?.minutes} phút</strong></span>
                      <span className="mx-2">•</span>
                      <span>Số câu: <strong className="text-indigo-400">{currentBreakdown?.total} câu</strong></span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Từ vựng (Moji-Goi)</span>
                      <span className="font-bold font-mono text-indigo-300 text-xs">{currentBreakdown?.mojiGoi} câu</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Ngữ pháp (Bunpou)</span>
                      <span className="font-bold font-mono text-indigo-300 text-xs">{currentBreakdown?.bunpou} câu</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Đọc hiểu (Dokkai)</span>
                      <span className="font-bold font-mono text-indigo-300 text-xs">{currentBreakdown?.dokkai} câu</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Nghe hiểu (Choukai)</span>
                      <span className="font-bold font-mono text-indigo-300 text-xs">{currentBreakdown?.choukai} câu</span>
                    </div>
                  </div>
                </div>

                {generationError && (
                  <div className="bg-rose-950/80 border border-rose-800 rounded-xl p-3 text-xs text-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{generationError}</span>
                  </div>
                )}
              </div>

              {/* List of AI Generated Exams */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Danh sách đề thi đã khởi tạo ({aiGeneratedExams.length})</span>
                  </h3>
                </div>

                <div className="study-exam-grid">
                  {aiGeneratedExams.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                      <BookOpen className="w-10 h-10 text-indigo-400/60 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-300">Chưa có đề thi nào được tạo</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Bấm nút <strong className="text-amber-300">"Soạn Đề {aiSelectedLevel} Ngay"</strong> ở trên để hệ thống biên soạn đề thi JLPT mới nhất cho bạn.
                      </p>
                    </div>
                  ) : (
                    aiGeneratedExams.map(renderExamCard)
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 3: EXAM LIBRARY (KHO ĐỀ THI JLPT) */
            <div className="space-y-3 animate-fade-in">
              <div className="study-filter-panel space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      aria-label="Tìm đề thi"
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm đề thi..."
                      className="w-full pl-8 pr-6 py-1.5 text-xs border border-slate-700/80 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-950/60 text-slate-200 placeholder:text-slate-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
                    {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setSelectedLevel(lvl)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          selectedLevel === lvl
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lvl === 'ALL' ? 'Tất cả' : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs overflow-x-auto">
                  <span className="text-slate-400 font-medium text-[11px] shrink-0">Phân loại:</span>
                  {[
                    { id: 'ALL', label: 'Tất cả đề' },
                    { id: 'official_past', label: 'Đề có sẵn' },
                    { id: 'mock_daily', label: 'Đề thi thử' },
                    { id: 'ai_generated', label: 'Đề do AI soạn' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Grid Cards */}
              <div className="study-exam-grid">
                {filteredExams.length === 0 ? (
                  <div className="col-span-full py-10 text-center bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <BookOpen className="w-8 h-8 text-indigo-400/60 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-300">Không tìm thấy đề thi phù hợp</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                      Thử chọn trình độ khác hoặc tìm kiếm với từ khóa khác.
                    </p>
                  </div>
                ) : (
                  filteredExams.map(renderExamCard)
                )}
              </div>
            </div>
          )}

          {/* Generation Loading Modal */}
          {isGenerating && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center space-y-4 animate-fade-in">
                <div className="relative w-12 h-12 mx-auto">
                  <div className="absolute inset-0 rounded-full border-3 border-indigo-500/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PenTool className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-100 text-sm">Đang soạn đề thi mới</h3>
                  <p className="text-[11px] text-slate-400">
                    Đang thiết lập đề thi JLPT cấp độ <span className="font-bold text-indigo-400">{aiSelectedLevel}</span>...
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-left space-y-1.5 text-xs">
                  {[
                    "Liên kết với máy chủ AI...",
                    "Truy xuất dữ liệu đề thi JLPT...",
                    "Biên soạn Từ vựng (Moji-Goi)...",
                    "Thiết lập Ngữ pháp (Bunpou)...",
                    "Đóng gói Đọc hiểu (Dokkai)..."
                  ].map((stepMsg, idx) => {
                    const isCompleted = generationStep > idx;
                    const isActive = generationStep === idx;
                    return (
                      <div key={idx} className="flex items-center gap-2 text-[11px] font-medium">
                        {isCompleted ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        ) : isActive ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                          </div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
                        )}
                        <span className={isCompleted ? 'text-slate-500 line-through' : isActive ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                          {stepMsg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      ) : examViewFormat === 'booklet_pdf' && selectedExam ? (
        /* ================= AUTHENTIC JLPT PAPER BOOKLET EXAM VIEW ================= */
        <JlptRealBookletExam
          exam={selectedExam}
          sectionMode={selectedSectionMode}
          userProfile={userProfile}
          userAnswers={userAnswers}
          onSelectAnswer={handleSelectOption}
          onSubmitExam={handleSubmit}
          isSubmitted={isSubmitted}
          onExit={() => setIsPlaying(false)}
          flaggedQuestions={flaggedQuestions}
          onToggleFlag={toggleFlagQuestion}
          timeRemainingSeconds={selectedSectionMode !== 'ALL' ? sectionTimerLeft : (partTimes.part1 || 0)}
          formatTime={formatTime}
          onSwitchViewFormat={() => setExamViewFormat('interactive')}
          onRestartExam={handleRestartExam}
          onOpenHistory={() => setShowHistoryModal(true)}
        />
      ) : selectedExam ? (
        /* ================= REDESIGNED JLPT MODERN EXAM VIEW ================= */
        <div className="space-y-3">
          {/* Submitted Mode View Switcher Bar */}
          {isSubmitted && (
            <div className="flex items-center justify-between flex-wrap gap-2 p-1.5 bg-[#FDF1E2] border border-[#EADFCF] rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSubmittedViewTab('certificate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${submittedViewTab === 'certificate' ? 'bg-[#1F2639] text-[#FDF1E2] shadow-xs' : 'text-[#1F2639] hover:bg-[#F4EDE2]'}`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#F4A643]" />
                  📜 Kết quả bài luyện JLPT
                </button>
                <button
                  onClick={() => setSubmittedViewTab('review')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${submittedViewTab === 'review' ? 'bg-[#1F2639] text-[#FDF1E2] shadow-xs' : 'text-[#1F2639] hover:bg-[#F4EDE2]'}`}
                >
                  <FileText className="w-4 h-4 text-[#F4A643]" />
                  📝 Xem lại từng câu trong giao diện thi
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartExam(selectedExam, selectedSectionMode)}
                  className="px-2.5 py-1 text-xs font-bold text-[#F4A643] bg-[#1F2639] hover:bg-[#2A344D] rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  Làm lại bài thi
                </button>
                <button
                  onClick={() => setIsPlaying(false)}
                  className="px-2.5 py-1 text-xs font-bold text-[#786D5E] hover:text-[#1F2639] hover:bg-[#F4EDE2] rounded-lg transition-all cursor-pointer"
                >
                  Về danh sách đề
                </button>
              </div>
            </div>
          )}

          {/* View 1: JLPT Official Certificate Report with Mascot Celebration */}
          {isSubmitted && submittedViewTab === 'certificate' ? (
            <JlptOfficialScoreReport
              exam={selectedExam}
              userAnswers={userAnswers}
              userProfile={userProfile}
              selectedSectionMode={selectedSectionMode}
              onRetry={() => handleStartExam(selectedExam, selectedSectionMode, 'interactive')}
              onBackToLobby={() => setIsPlaying(false)}
              onSwitchSection={(sec) => handleStartExam(selectedExam, sec)}
            />
          ) : (
            /* View 2: Redesigned JlptModernExamView (Interactive Test & Question Review) */
            <JlptModernExamView
              exam={selectedExam}
              selectedSectionMode={selectedSectionMode}
              userProfile={userProfile}
              userAnswers={userAnswers}
              onSelectOption={handleSelectOption}
              onSubmit={handleSubmit}
              isSubmitted={isSubmitted}
              onExit={() => setIsPlaying(false)}
              flaggedQuestions={flaggedQuestions}
              onToggleFlag={toggleFlagQuestion}
              timeRemainingSeconds={selectedSectionMode !== 'ALL' ? sectionTimerLeft : (partTimes.part1 || 0)}
              formatTime={formatTime}
              onRestartExam={handleRestartExam}
              onSwitchViewFormat={() => setExamViewFormat('booklet_pdf')}
              currentQuestionIndex={currentQuestionIndex}
              onJumpQuestion={(idx) => setCurrentQuestionIndex(idx)}
              isPlayingAudio={isPlayingAudio}
              onToggleTTS={handleToggleTTS}
              playbackRate={playbackRate}
              onChangePlaybackRate={setPlaybackRate}
              activeSectionFilter={activeSectionFilter}
              onChangeSectionFilter={(sec) => setActiveSectionFilter(sec as any)}
            />
          )}
        </div>
      ) : null}

      {/* Exam History Modal */}
      {showHistoryModal && (
        <ExamHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          onSelectAttempt={(record) => {
            setSelectedHistoryRecord(record);
            setShowPrintModal(true);
          }}
          onPrintAttempt={(record) => {
            setSelectedHistoryRecord(record);
            setShowPrintModal(true);
          }}
        />
      )}

      {/* Printable Exam Booklet Modal */}
      {showPrintModal && selectedHistoryRecord && (
        <PrintableExamBooklet
          record={selectedHistoryRecord}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedHistoryRecord(null);
          }}
        />
      )}

    </div>
  );
}
