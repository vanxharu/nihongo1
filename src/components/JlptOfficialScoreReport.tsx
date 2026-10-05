import React from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { DailyExam, UserProfile } from '../types';
import ShibaMascot from './mascot/ShibaMascot';
interface Props {
  exam: DailyExam; userAnswers: Record<string, number>; userProfile?: UserProfile;
  selectedSectionMode: 'ALL' | 'moji-goi' | 'bunpou' | 'dokkai' | 'choukai';
  onRetry: () => void; onBackToLobby: () => void;
  onSwitchSection?: (section: Props['selectedSectionMode']) => void;
}
export function JlptOfficialScoreReport({ exam, userAnswers, selectedSectionMode, onRetry, onBackToLobby, onSwitchSection }: Props) {
  const questions = exam.questions.filter(q => selectedSectionMode === 'ALL' || q.section === selectedSectionMode);
  const correct = questions.filter(q => userAnswers[q.id] === q.correctIndex).length;
  const answered = questions.filter(q => userAnswers[q.id] !== undefined).length;
  const percent = questions.length ? Math.round(correct / questions.length * 100) : 0;
  return <section className="study-result" aria-label="Kết quả bài luyện">
    <div className="study-result-hero"><div><span className="study-eyebrow">HOÀN THÀNH BÀI LUYỆN · {exam.level}</span><h2>Một bước tiến đáng ghi nhận.</h2><p>{exam.title}</p><div className="study-result-score"><strong>{correct}<small> / {questions.length}</small></strong><span>câu đúng · {percent}%</span></div><p>Đây là kết quả bài luyện, không phải điểm quy đổi chính thức của JLPT.</p></div><ShibaMascot pose={percent >= 70 ? 'celebrating' : 'encourage'} size="lg" /></div>
    <div className="study-result-stats"><span><strong>{answered}</strong> Đã trả lời</span><span><strong>{answered - correct}</strong> Cần xem lại</span><span><strong>{questions.length - answered}</strong> Chưa trả lời</span></div>
    <h3>Ôn tiếp theo từng kỹ năng</h3>
    <div className="study-result-sections">{([
      ['moji-goi', 'Từ vựng & chữ Hán'], ['bunpou', 'Ngữ pháp'], ['dokkai', 'Đọc hiểu'], ['choukai', 'Nghe hiểu']
    ] as const).map(([section, title]) => {
      const subset = questions.filter(q => q.section === section);
      if (!subset.length) return null;
      const n = subset.filter(q => userAnswers[q.id] === q.correctIndex).length;
      return <article key={section}><div><h4>{title}</h4><span>{n}/{subset.length} câu đúng</span></div><progress aria-label={`Kết quả ${title}`} value={n} max={subset.length} /><button onClick={() => onSwitchSection?.(section)}>Luyện kỹ năng này <ArrowRight size={14} /></button></article>;
    })}</div>
    <div className="study-result-actions"><button onClick={onRetry}><RotateCcw size={16} />Làm lại đề</button><button onClick={onBackToLobby}>Chọn đề khác <ArrowRight size={16} /></button></div>
  </section>;
}
